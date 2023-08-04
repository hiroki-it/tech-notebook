---
title: 【IT技術の知見】GitLab CI＠CIツール
description: GitLab CI＠CIツールの知見を記録しています。
---

# GitLab CI＠CIツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. GitLab CIの仕組み

### アーキテクチャ

GitLab Runnerを処理の実行環境として、GitLabリポジトリの`gitlab-ci.yml`ファイルで定義されたパイプラインを実行する。

![gitlab-ci_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/gitlab-ci_architecture.png)

> - https://subscription.packtpub.com/book/cloud-&-networking/9781789531282/19/ch19lvl1sec32/the-runner-client-architecture
> - https://www.insight-tec.com/tech-blog/ci-cd/20201222_gitlab_runner/

<br>

### パイプライン構成

記入中...

<br>

## 02. セットアップ

### インストール

```yaml
repository/
├── .gitlab-ci.yml
```

<br>

## 03. Global

### include

#### ▼ includeとは

参照する別リポジトリと設定ファイルを設定する。

GitLab CIのJobの設定ファイルを、中央集権的なリポジトリで一括管理しておき、これを他のリポジトリからリモート参照できるようになる。

ポリリポジトリ構成規約と相性がよい。

#### ▼ 子リポジトリ側の実装

子リポジトリでは、親リポジトリをコールする。

```yaml
include:
  # GitLab CIのテンプレートを管理するリポジトリ
  - project: rooo-project/gitlab-ci-template-repository
    ref: main
    file:
      - foo-job.yml
      - bar-job.yml
      - baz-job.yml

foo_job:
  # 親リポジトリで定義したジョブをコールする
  extends: .foo_job
  stage: build

bar_job:
  extends: .bar_job
  stage: build

baz_job:
  extends: .baz_job
  stage: build
```

> - https://docs.gitlab.com/ee/ci/yaml/index.html#includeproject

#### ▼ 親リポジトリ側の実装

子リポジトリでは、Jobを定義する。

```yaml
# foo-job.yaml
foo_job:
  stage: build
  script:
    - echo foo
```

```yaml
# bar-job.yaml
bar_job:
  stage: build
  script:
    - echo bar
```

```yaml
# baz-job.yaml
baz_job:
  stage: build
  script:
    - echo baz
```

<br>

### 予約変数

#### ▼ `CI_COMMIT_BRANCH`

現在のブランチ名が割り当てられている。

#### ▼ `CI_PIPELINE_SOURCE`

現在のパイプラインを発火させたイベント名が割り当てられている。

> - https://gitlab-docs.creationline.com/ee/ci/yaml/#rulesif

#### ▼ `GIT_SUBMODULE_STRATEGY`

デフォルトですと、GitLab CIがサブモジュールを無視して処理してしまうため、これを無視しないようにする。

```yaml
foo_job:
  variables:
    GIT_SUBMODULE_STRATEGY: "recursive"
```

> - https://docs.gitlab.com/ee/ci/git_submodules.html#use-git-submodules-in-cicd-jobs

<br>

## 04. Job

### allow_failure

```yaml
stages:
  - fmt

# terraform fmt
fmt:
  services:
    - docker:19.03.11-dind
  image: hashicorp/terraform:1.4.6
  stage: fmt
  script:
    - terraform fmt -check -recursive
  # インデントを揃えるべき場所がある場合に、Jobを失敗させる
  allow_failure: true
  rules:
    # MRを作成/更新したタイミングで発火する
    - if: $CI_PIPELINE_SOURCE == "merge_request_event" && $CI_COMMIT_BRANCH != 'main'
```

<br>

### artifacts

ジョブ間でファイルを共有する。

次のジョブの同じディレクトリにファイルが配置される。

```yaml
foo_job:
  stage: build
  script:
    - echo foo
  artifacts:
    paths:
      - path/tmp/

bar_job:
  stage: deploy
  script:
    # path/tmp/を使用する
    ...
```

> - https://docs.gitlab.com/ee/ci/jobs/job_artifacts.html
> - https://ngyuki.hatenablog.com/entry/2019/03/28/085717

<br>

### cache

### ▼ cacheとは

指定したディレクトリのキャッシュを作成する。

これにより、他のパイプラインでこのディレクトリを再利用し、CIの時間を短縮できる。

```yaml
bar_job:
  stage: build
  cache:
    paths:
      - ./node_module
```

> - https://www.serversus.work/topics/927zjvmew2491o2n1oob/

### ▼ policy

キャッシュ作成のルールを設定する。

```yaml
bar_job:
  stage: build
  cache:
    paths:
      - ./node_module
    # キャッシュのダウンロードのみを実行する
    policy: pull
```

```yaml
bar_job:
  stage: build
  cache:
    paths:
      - ./node_module
    # キャッシュのアップロードのみを実行する
    policy: push
```

> - https://gitlab-docs.creationline.com/ee/ci/yaml/#cachepolicy

<br>

### dependencies

先に実行するJobを設定する。

```yaml
stages:
  - build
  - deploy

foo_job:
  stage: build
  script:
    - echo foo

bar_job:
  stage: deploy
  script:
    - echo bar
  dependencies:
    - foo_job
```

> - https://docs.gitlab.com/ee/ci/yaml/index.html#dependencies

<br>

### image

Jobの実行環境を設定する。

```yaml
foo_job:
  stage: build
  image:
    name: alpine:1.0.0
    entrypoint: ["sh"]
  script:
    - echo foo
```

> - https://docs.gitlab.com/ee/ci/yaml/index.html#image

<br>

### needs

Job間の依存関係を設定する。

同じステージ内に複数のJobがある場合に役立つ。

```yaml
stages:
  - build

foo_job:
  stage: build
  script:
    - echo foo

# fooの後に、baz_jobと並行実行する
bar_job:
  stage: build
  needs:
    - foo_job
  script:
    - echo bar

# fooの後に、bar_jobと並行実行する
baz_job:
  stage: build
  needs:
    - foo_job
  script:
    - echo baz
```

<br>

### rules

#### ▼ rulesとは

Jobの発火条件を設定する。

複数の条件 (複数の`if`キー、`if`キーと`changes`キーの組み合わせ) を並べた場合、上から順番に条件を検証していくため、OR条件になる。

#### ▼ if

条件に合致した場合のみ、ジョブを発火する。

ブランチ名やタグを使用した発火を定義できる。

イベントの種類が設定された`CI_PIPELINE_SOURCE`変数を使用できる。

```yaml
check_tag:
  # OR条件
  rules:
    # mainブランチのみ
    - if: $CI_COMMIT_BRANCH == "main"
      variables:
        TAG_NAME: main

    # hotfixから始まるブランチのみ
    - if: $CI_COMMIT_BRANCH =~ /^hotfix.*$/
      variables:
        TAG_NAME: hotfix-$CI_COMMIT_SHA

    # 任意の名前のタグがついている場合のみ
    - if: $CI_COMMIT_TAG
      variables:
        TAG_NAME: $CI_COMMIT_TAG
```

> - https://hawksnowlog.blogspot.com/2021/08/run-gitlab-ci-only-specified-tags.html
> - https://gitlab-docs.creationline.com/ee/ci/yaml/#rulesif

#### ▼ changes

プッシュ時に、指定したファイルやディレクトリで差分があれば、ジョブを発火する。

```yaml
gemerate_template:
  script:
    - helm template foo-chart. --set secret.PASSWORD=test -f foo-values.yaml > foo.yaml
  rules:
    # webイベント (パイプライン実行ボタン) の場合
    - if: $CI_PIPELINE_SOURCE == "web"
    # ファイルやディレクトリ内に差分があった場合
    - changes:
        - template/**/*
        - values.yaml
```

> - https://gitlab-docs.creationline.com/ee/ci/yaml/#ruleschanges

<br>

### services

メイン実行環境とは別のサブ実行環境を作成するため、イメージ名を設定する。

```yaml
foo_job:
  services: docker:19-dind
```

> - https://www.ted027.com/post/gitlabci-services-host/
> - https://qiita.com/kytiken/items/a95ef8c1fccfc4a9b089#example

<br>

### stage

#### ▼ stage

Jobが属するステージを設定する。

より前のステージ内のJobが全て成功しない限り、後続のJobを開始しない。

同じステージに属するJobは、並行的に実行される。

```yaml
stages:
  - build
  - test
  - deploy

# ----------
# build
# ----------
foo_job:
  stage: build
  script:
    - echo foo

bar_job:
  stage: build
  script:
    - echo bar

# ----------
# test
# ----------
baz_job:
  stage: test

# ----------
# deploy
# ----------
qux_job:
  stage: deploy
```

> - https://docs.gitlab.com/ee/ci/yaml/index.html#stage

<br>

### script

Jobで実行する処理を設定する。

```yaml
foo_job:
  stage: build
  script:
    - echo "Hello World"
```

> - https://docs.gitlab.com/ee/ci/yaml/index.html#script

<br>

### trigger

ジョブが発火した場合に、特定のアクションを実施する。

**＊例＊**

モノリポジトリでGitLabCIを採用している場合に、 親の`.gitlab-ci.yml`ファイルでディレクトリ配下の変更を検知し、子の`.gitlab-ci.yml`ファイルを読み込む (`include`) ようにする。

```yaml
# 親の.gitlab-ci.yml
stage:
  - trigger

foo:
  stage: trigger
  rules:
    - if: $CI_COMMIT_BRANCH
      changes:
        - foo/*
        - foo/**/*
  trigger:
    include: foo/.gitlab-ci.yml
    strategy: depend

bar:
  stage: trigger
  rules:
    # ディレクトリ配下の変更を検知する
    - if: $CI_COMMIT_BRANCH
      changes:
        - foo/*
        - foo/**/*
  trigger:
    # 各ディレクトリ配下に置いた子の.gitlab-ci.ymlファイルを読み込む
    include: foo/.gitlab-ci.yml
    strategy: depend
```

> - https://dev.classmethod.jp/articles/gitlab-ci-yml-trigger/

<br>

### variables

#### ▼ variablesとは

Job内で使用する変数を設定する。

```yaml
foo_job:
  variables:
    BAR: bar
    BAZ: baz
    QUX: qux
```

> - https://docs.gitlab.com/ee/ci/yaml/index.html#variables

<br>

### workflow

#### ▼ workflowとは

GitLab CI自体の発火を制御する。

> - https://gitlab-docs.creationline.com/ee/ci/yaml/#workflowrules

#### ▼ if

GitLab CIが発火する条件を設定する。

```yaml
# ブランチ名に応じて、CIで使用する実行環境名を切り替える
workflow:
  rules:
    # featureブランチの場合
    - if: $CI_COMMIT_REF_NAME =~ /^feature.*/
      # ついでに環境変数を設定する
      variables:
        ENV: dev
    # developブランチの場合
    - if: $CI_COMMIT_REF_NAME == "develop"
      variables:
        ENV: tes
    # mainブランチの場合
    - if: $CI_COMMIT_REF_NAME == "main"
      variables:
        ENV: prd

setup-manifest:
  stage: build
  image: alpine/helm:latest
  # ブランチ名に応じて、valuesファイルを切り替える
  script:
    - helm lint . -f values-${ENV}.yaml
    - helm template foo-chart. -f values-${ENV}.yaml > manifest.yaml
    - cat manifest.yaml
```

> - https://natsuhide.hatenablog.com/entry/2022/04/23/192420

#### ▼ changes

```yaml
workflow:
  rules:
    - changes: foo/**/*
```

> - https://blogs.networld.co.jp/entry/2022/11/01/090000?_gl=1*1wxr8jb*_gcl_au*MTg4NDE0MjQ1My4xNjkwODAzOTEy

<br>
