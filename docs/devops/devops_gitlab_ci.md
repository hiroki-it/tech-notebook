---
title: 【IT技術の知見】GitLab CI＠DevOps
description: GitLab CI＠DevOpsの知見を記録しています。
---

# GitLab CI＠DevOps

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. GitLab CIの仕組み

### アーキテクチャ

GitLab Runnerを処理の実行環境として、GitLabリポジトリの`gitlab-ci.yml`ファイルで定義されたパイプラインを実行する。

![gitlab-ci_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/gitlab-ci_architecture.png)

> ↪️ 参考：
>
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

GitLab CIのJobの設定ファイルを、特定のリポジトリで一括管理しておき、これを他のリポジトリで参照できるようになる。

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

> ↪️ 参考：https://docs.gitlab.com/ee/ci/yaml/index.html#image

<br>

## 04. Job

### cache

指定したディレクトリのキャッシュを作成する。

これにより、他のパイプラインでこのディレクトリを再利用し、CIの時間を短縮できる。

```yaml
bar_job:
  cache:
    paths:
      - ./node_module
```

> ↪️ 参考：https://www.serversus.work/topics/927zjvmew2491o2n1oob/

<br>

### dependencies

先に実行するJobを設定する。

```yaml
bar_job:
  dependencies:
    - foo_job
```

> ↪️ 参考：https://docs.gitlab.com/ee/ci/yaml/index.html#dependencies

<br>

### image

Jobの実行環境を設定する。

```yaml
foo_job:
  image:
    name: alpine:1.0.0
    entrypoint: ["sh"]
```

> ↪️ 参考：https://docs.gitlab.com/ee/ci/yaml/index.html#image

<br>

### stage

Jobが属するステージを設定する。

同じステージに属するJobは、並行的に実行される。

```yaml
foo_job:
  stage: foo_stage
```

> ↪️ 参考：https://docs.gitlab.com/ee/ci/yaml/index.html#stage

<br>

### script

Jobで実行する処理を設定する。

```yaml
foo_job:
  script:
    - echo "Hello World"
```

> ↪️ 参考：https://docs.gitlab.com/ee/ci/yaml/index.html#script

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

> ↪️ 参考：https://dev.classmethod.jp/articles/gitlab-ci-yml-trigger/

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

> ↪️ 参考：https://docs.gitlab.com/ee/ci/yaml/index.html#variables

#### ▼ `GIT_SUBMODULE_STRATEGY`

デフォルトですと、GitLab CIがサブモジュールを無視して処理してしまうため、これを無視しないようにする。

```yaml
foo_job:
  variables:
    GIT_SUBMODULE_STRATEGY: "recursive"
```

> ↪️ 参考：https://docs.gitlab.com/ee/ci/git_submodules.html#use-git-submodules-in-cicd-jobs

<br>
