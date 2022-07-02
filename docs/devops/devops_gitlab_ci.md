---
title: 【IT技術の知見】GitLab CI＠DevOps
description: GitLab CI＠DevOpsの知見を記録しています。

---

# GitLab CI＠DevOps

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. GitLab CIの仕組み

### アーキテクチャ

![gitlab-ci_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/gitlab-ci_architecture.png)

GitLab Runnnerを処理の実行環境として、GitLabリポジトリの```gitlab-ci.yml```ファイルで定義されたパイプラインを実行する。

参考：

- https://subscription.packtpub.com/book/cloud-&-networking/9781789531282/19/ch19lvl1sec32/the-runner-client-architecture
- https://www.insight-tec.com/tech-blog/ci-cd/20201222_gitlab_runner/

<br>

### パイプライン構成

調査中...

<br>

## 02. セットアップ

### インストール

```yaml
repository/
├── .gitlab-ci.yml
...
```

<br>

## 03. Global

### include

参照する別リポジトリと設定ファイルを設定する。GitLab CIのJobの設定ファイルを、特定のリポジトリで一括管理しておき、これを他のリポジトリで参照できるようになる。ポリリポジトリ構成と相性がよい。

参考：https://docs.gitlab.com/ee/ci/yaml/index.html#image

```yaml
include:
  - project: hiroki-hasegawa/gitlab-ci-job-repository
    ref: master
    file:
      - foo-job.yml
      - bar-job.yml
      - baz-job.yml
```

<br>

## 04. Job

### cache

指定したディレクトリのキャッシュを作成する。これにより、他のパイプラインでこのディレクトリを再利用し、CIの時間を短縮できる。

参考：https://www.serversus.work/topics/927zjvmew2491o2n1oob/

```yaml
bar_job:
  cache:
    paths:
      - ./node_module
```

<br>

### dependencies

先に実行するJobを設定する。

参考：https://docs.gitlab.com/ee/ci/yaml/index.html#dependencies

```yaml
bar_job:
  dependencies:
    - foo_job
```

<br>

### image

Jobの実行環境を設定する。

参考：https://docs.gitlab.com/ee/ci/yaml/index.html#image

```yaml
foo_job:
  image:
    name: alpine:1.0.0
    entrypoint: ["sh"]
```

<br>

### stage

Jobが属するステージを設定する。同じステージに属するJobは、並行的に実行される。

参考：https://docs.gitlab.com/ee/ci/yaml/index.html#stage

```yaml
foo_job:
  stage: foo_stage
```

<br>

### script

Jobで実行する処理を設定する。

参考：https://docs.gitlab.com/ee/ci/yaml/index.html#script

```yaml
foo_job:
  script:
    - echo "Hello World"
```

<br>

### variables

Job内で使用する変数を設定する。

参考：https://docs.gitlab.com/ee/ci/yaml/index.html#variables

```yaml
foo_job:
  variables:
    BAR: bar
    BAZ: baz
    QUX: qux
```

<br>



