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

参照する別リポジトリと設定ファイルを設定する。

GitLab CIのJobの設定ファイルを、中央集権的なリポジトリで一括管理しておき、これを他のリポジトリからリモート参照できるようになる。

ポリリポジトリ構成ポリシーと相性がよい。

```yaml
include:
  - project: hiroki-hasegawa/gitlab-ci-job-repository
    ref: master
    file:
      - foo-job.yml
      - bar-job.yml
      - baz-job.yml
```

> - https://docs.gitlab.com/ee/ci/yaml/index.html#image

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

### cache

指定したディレクトリのキャッシュを作成する。

これにより、他のパイプラインでこのディレクトリを再利用し、CIの時間を短縮できる。

```yaml
bar_job:
  cache:
    paths:
      - ./node_module
```

> - https://www.serversus.work/topics/927zjvmew2491o2n1oob/

<br>

### dependencies

先に実行するJobを設定する。

```yaml
bar_job:
  dependencies:
    - foo_job
```

> - https://docs.gitlab.com/ee/ci/yaml/index.html#dependencies

<br>

### image

Jobの実行環境を設定する。

```yaml
foo_job:
  image:
    name: alpine:1.0.0
    entrypoint: ["sh"]
```

> - https://docs.gitlab.com/ee/ci/yaml/index.html#image

<br>

### rules

#### ▼ rulesとは

Jobの発火条件を設定する。

複数の条件 (複数の`if`キー、`if`キーと`changes`キーの組み合わせ)　　を並べた場合、上から順番に条件を検証していく。

#### ▼ if

条件に合致した場合のみ、ジョブを発火する。

ブランチ名やタグを使用した発火を定義できる。

イベントの種類が設定された`CI_PIPELINE_SOURCE`変数を使用できる。

```yaml
check_tag:
  # AND条件
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
    - helm template foo . --set secret.PASSWORD=test > manifest.yaml
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

Jobが属するステージを設定する。

同じステージに属するJobは、並行的に実行される。

```yaml
foo_job:
  stage: foo_stage
```

> - https://docs.gitlab.com/ee/ci/yaml/index.html#stage

<br>

### script

Jobで実行する処理を設定する。

```yaml
foo_job:
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
