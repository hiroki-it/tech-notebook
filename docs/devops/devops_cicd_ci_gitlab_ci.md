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

### Kubernetes on CI

GitLab CI上でK8s Clusterを作成する場合には、Docker in Dockerが起こる。

```yaml
variables:
  DOCKER_DRIVER: "overlay2"
  DOCKER_HOST: "tcp://localhost:2375"
  DOCKER_TLS_CERTDIR: ""
```

> - https://docs.avisi.cloud/blog/2021/07/31/running-kubernetes-on-gitlab-ci/
> - https://containerinfra.com/blog/gitlab/2021-07-31-kubernetes-in-gitlab-ci/
> - https://gist.github.com/trondhindenes/0307fbe9cda1164115353b4632a31ea9

<br>

## 03. Global

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

#### ▼ `CI_PIPELINE_SOURCE`

イベントの発生元 (MR作成/更新イベント、手動パイプライン実行イベント) が割り当てられている。

```yaml
foo_job:
  stage: build
  script:
    - echo foo
  rules:
    # MRを作成/更新したタイミングで発火する
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

> - https://docs.gitlab.com/ee/ci/variables/predefined_variables.html
> - https://docs.gitlab.com/ee/ci/jobs/job_control.html#common-if-clauses-for-rules

<br>

### include

#### ▼ includeとは

参照する別リポジトリとCIテンプレートファイルを設定する。

GitLab CIのJobの設定ファイルを、中央集権的なリポジトリで一括管理しておき、これを他のリポジトリからリモート参照できるようになる。

ポリリポジトリ構成規約と相性がよい。

> - https://tech-blog.optim.co.jp/entry/2022/06/16/100000

#### ▼ 親リポジトリ側のCIテンプレート

子リポジトリでは、Jobを定義する。

`.` (ドット) をつけることで、明示的に指定しない限り実行できない『隠しジョブ』として定義できる。

また、子リポジトリで上書きできる変数を親リポジトリに設定しておく。

```yaml
# foo-job.yaml

# 変数のデフォルト値を設定しておく
variables:
  PATH: "default"

.foo_job:
  stage: build
  script:
    - cat "${PATH}"/foo.txt
```

```yaml
# bar-job.yaml

# 変数のデフォルト値を設定しておく
variables:
  PATH: "default"

.bar_job:
  stage: build
  script:
    - cat "${PATH}"/bar.txt
```

```yaml
# baz-job.yaml

# 変数のデフォルト値を設定しておく
variables:
  PATH: "default"

.baz_job:
  stage: build
  script:
    - cat "${PATH}"/baz.txt
```

> - https://docs.gitlab.com/ee/ci/jobs/index.html#hide-jobs

#### ▼ 子リポジトリ側のリモートコール

子リポジトリでは、親リポジトリのCIテンプレートをコールする。

```yaml
# 親リポジトリの変数を上書きする
variables:
  PATH: "child/path"

include:
  # GitLab CIのテンプレートを管理するリポジトリ
  - project: project/ci-template-repository-1
    ref: main
    file:
      - foo-job.yml
      - bar-job.yml
      - baz-job.yml
  - project: project/ci-template-repository-2
    ref: main
    file:
      - qux-job.yml

foo_job:
  # 親リポジトリで定義したジョブをコールする
  extends: .foo_job
  stage: build
  script:
    - cat "${PATH}"/foo.txt

bar_job:
  extends: .bar_job
  stage: build
  script:
    - cat "${PATH}"/bar.txt

baz_job:
  extends: .baz_job
  stage: build
  script:
    - cat "${PATH}"/baz.txt
```

> - https://docs.gitlab.com/ee/ci/yaml/index.html#includeproject

#### ▼ ヒアドキュメントを使用したファイルの配布

ヒアドキュメントを使用して、CIの実行環境でファイルを動的に作成し、これを配布する。

`artifacts`キーを使用して、後続のJobでも設定ファイルを使用できるようにしている。

````yaml
variables:
  GITLAB_COMMENT_VERSION: "6.0.1"

# github-commentを準備する
.install_github_comment:
  stage: build
  image: alpine:latest
  script:
    # github-commentをインストールする
    - |
      apk add --upgrade curl tar
      curl -sL -O https://github.com/suzuki-shunsuke/github-comment/releases/download/v"${GITHUB_COMMENT_VERSION}"/github-comment_"${GITHUB_COMMENT_VERSION}"_darwin_amd64.tar.gz
      tar zxvf github-comment_"${GITHUB_COMMENT_VERSION}"_darwin_amd64
    # 各リポジトリに配布するgithub-comment.yamlファイルを作成する
    - |
      cat << 'EOF' > github-comment.yaml
      # https://suzuki-shunsuke.github.io/github-comment/getting-started
      ---
      exec:
        default:
          - when: true
            template: |
              
              ## `{{ .Vars.TestName }}`
              
              | 項目 | 内容 |
              |-----|--------------------|
              | 静的解析 | `{{ .JoinCommand }}` |
              | 説明 | {{ .Vars.Description }} |
              | 成否 | {{ template "status" . }} |
              | 実行ジョブ | {{ template "link" . }} |
              
              ## 詳細
              
              <details>
              <summary>クリックで開く</summary>
              
              ```bash
              $ {{ .JoinCommand }}
              
              {{ .CombinedOutput | AvoidHTMLEscape }}
              ```
              
              </details>

      EOF
      cat github-comment.yaml
  artifacts:
    paths:
      - ./github-comment
      # github-commentの設定ファイルを配布する
      - github-comment.yaml
````

### variables (Jobレベルでも設定可)

#### ▼ variablesとは

Job内で使用する変数を設定する。

値をダブルクオートかシングルクオートで囲わないと、`.gitlab-ci.yml`ファイル自体で予期せぬ構文エラーになる。

```yaml
variables:
  BAR: "bar"
  BAZ: "baz"
  QUX: "qux"
```

> - https://docs.gitlab.com/ee/ci/yaml/index.html#variables

#### ▼ 空文字の出力

空文字を設定したい場合、`variables`キーに設定しても空文字として出力されない。

```yaml
# variablesで空文字を設定する
variables:
  FOO: ""

foo_job:
  stage: build
  script:
    # ダブルクオートがない
    - echo ${FOO}
```

```yaml
# variablesを定義しない

foo_job:
  stage: build
  script:
    # ダブルクオートがある
    - echo "${FOO}"
```

### workflow

#### ▼ workflowとは

GitLab CI自体の発火を制御する。

> - https://gitlab-docs.creationline.com/ee/ci/yaml/#workflowrules

#### ▼ if

GitLab CIが発火する条件を設定する。

```yaml
# ブランチ名に応じて、CIで使用する実行環境名を切り替える
# main、develop、MR作成/変更、の順に条件を検証する。
workflow:
  rules:
    # masterブランチにて、任意の方法でパイプラインを実行した場合
    - if: $CI_COMMIT_REF_NAME == 'main'
      variables:
        ENV: "prd"
    # developブランチにて、任意の方法でパイプラインを実行した場合
    - if: $CI_COMMIT_REF_NAME == 'develop'
      variables:
        ENV: "tes"
    # MRにて、任意の方法でパイプラインを実行した場合
    - if: $CI_PIPELINE_SOURCE == 'merge_request_event'
      variables:
        ENV: "dev"
    # 上記以外で、webから手動でパイプラインを実行した場合
    - if: $CI_PIPELINE_SOURCE == 'web'
      variables:
        ENV: "dev"

setup-manifest:
  stage: build
  image: alpine/helm:latest
  # ブランチ名に応じて、valuesファイルを切り替える
  script:
    - helm lint . -f "${VALUES_FILE_PATH}" -f "${SECRETS_FILE_PATH}"
    - helm template foo-chart. -f "${VALUES_FILE_PATH}" -f "${SECRETS_FILE_PATH}" > manifest.yaml
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

## 04. Job

### allow_failure

#### ▼ `0`以外のすべての終了コードの場合

```yaml
stages:
  - build

# terraform fmt
fmt:
  # サービスコンテナ
  services:
    - docker:dind
  image: hashicorp/terraform:1.4.6
  stage: build
  script:
    - terraform fmt -check -recursive
  # 0以外の全ての終了コードの場合のみ終了する
  # インデントを揃えるべき場所がある場合に、Jobを失敗させる
  allow_failure: true
  rules:
    # MRを作成/更新したタイミングで発火する
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

```yaml
foo_job:
  stage: build
  script:
    # 『echo foo-1』が失敗しても、終了コードを1にしてJobを中断させない
    - echo foo-1 || true
    - echo foo-2
  # 0以外の全ての終了コードの場合のみ終了する
  allow_failure: true
```

#### ▼ `0`以外の特定の終了コードの場合

```yaml
foo_job:
  stage: build
  script:
    - echo foo
  # 特定の終了コードの場合のみ終了する
  allow_failure:
    exit_codes:
      - 1
      - 3
```

> - https://kazmax.zpp.jp/cmd/t/true.1.html

<br>

### artifacts

ジョブ間でファイルを共有する。

次のジョブでは、共有ファイルを指定せずとも、自動的に同じディレクトリに共有ファイルが配置される。

```yaml
foo_job:
  stage: build
  script:
    - echo foo
  # 共有したいファイル
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

#### ▼ cacheとは

指定したディレクトリのキャッシュを作成する。

もしそのディレクトリに変化がなければ、前回のパイプラインのディレクトリを再利用する。

これにより、CIの時間を短縮できる。

```yaml
bar_job:
  stage: build
  cache:
    # キャッシュの名前を設定する
    key: $CI_COMMIT_REF_SLUG
    # キャッシュとして保存するディレクトリを設定する
    paths:
      - ./node_module
```

> - https://www.serversus.work/topics/927zjvmew2491o2n1oob/
> - https://docs.gitlab.com/ee/ci/caching/#use-a-fallback-cache-key

#### ▼ policy

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

#### ▼ imageとは

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

#### ▼ `CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX`

CIでは、コンテナイメージのプルの頻度が高まるため、イメージレジストリ (例：DockerHub) によってはプル数の制限にひっかかってしまう。

イメージレジストリのパスのプレフィクスとして`CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX`をつけると、コンテナイメージがGitLabのDependency Proxyを経由するようになる。

Dependency Proxyはコンテナイメージをキャッシュするため、毎回DockerHubにコンテナをプルしなくなり、プル数の制限にひ

```yaml
foo_job:
  stage: build
  image:
    name: ${CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX}/alpine:1.0.0
    entrypoint: ["sh"]
  script:
    - echo foo
```

> - https://docs.gitlab.com/ee/user/packages/dependency_proxy/#store-a-docker-image-in-dependency-proxy-cache
> - https://brettops.io/blog/gitlab-docker-proxy/

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
    - if: $CI_COMMIT_BRANCH == 'main'
      variables:
        TAG_NAME: "main"

    # hotfixから始まるブランチのみ
    - if: $CI_COMMIT_BRANCH =~ /^hotfix.*$/
      variables:
        TAG_NAME: "hotfix-${CI_COMMIT_SHA}"

    # 任意の名前のタグがついている場合のみ
    - if: $CI_COMMIT_TAG
      variables:
        TAG_NAME: "$CI_COMMIT_TAG"
```

> - https://hawksnowlog.blogspot.com/2021/08/run-gitlab-ci-only-specified-tags.html
> - https://gitlab-docs.creationline.com/ee/ci/yaml/#rulesif

#### ▼ changes

プッシュ時に、指定したファイルやディレクトリで差分があれば、ジョブを発火する。

```yaml
gemerate_template:
  script:
    - helm template foo-chart. -f foo-values.yaml -f foo-secrets.yaml > foo.yaml
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

#### ▼ services

![gitlab_service-container.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/gitlab_service-container.png)

JobのCIの実行環境とは別のサービスコンテナを作成する。

```yaml
foo_job:
  # CIの実行環境
  image: docker
  # サービスコンテナ
  services:
    - name: docker:dind
      # 外部Dockerに対するTLSを無効化する
      command: ["--tls=false"]
```

> - https://blog.nestybox.com/2020/10/21/gitlab-dind.html
> - https://www.ted027.com/post/gitlabci-services-host/

#### ▼ Docker in Dockerの回避のため

両方のDockerのバージョンは合わせておいた方が良い。

#### ▼ 複数のコンテナを同時に起動するため

Jobでアプリコンテナを動かし、DBコンテナを別に起動しておく場合、もう一つコンテナが必要になる。

これを回避するために使用する。

> - https://qiita.com/kytiken/items/a95ef8c1fccfc4a9b089#example

<br>

### stage

#### ▼ stage

Jobが所属するステージを設定する。

より前のステージ内のJobが全て成功しない限り、後続のJobを開始しない。

同じステージに所属するJobは、並行的に実行される。

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
  - build

foo:
  stage: build
  rules:
    - if: $CI_COMMIT_BRANCH
      changes:
        - foo/*
        - foo/**/*
  trigger:
    include: foo/.gitlab-ci.yml
    strategy: depend

bar:
  stage: build
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
