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

GitLab Runnerは、GitLabリポジトリの`gitlab-ci.yml`ファイルをHTTPSで参照し、定義したパイプラインを実行する。

![gitlab-ci_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/gitlab-ci_architecture.png)

> - https://subscription.packtpub.com/book/cloud-&-networking/9781789531282/19/ch19lvl1sec32/the-runner-client-architecture
> - https://www.insight-tec.com/tech-blog/ci-cd/20201222_gitlab_runner/

<br>

### GitLab Runner

#### ▼ GitLab Runnerとは

GitLab CIの`gitlab-ci.yml`ファイルで定義したパイプラインを実行する。

> - https://docs.gitlab.com/runner/

<br>

### パイプライン構成

記入中...

<br>

### リリースノート

#### ▼ パイプラインバッジ

```markdown
![pipeline](https://gitlab.com/foo-project/foo-repository/badges/main/pipeline.svg)
```

> - https://docs.gitlab.com/user/project/badges.html#pipeline-status-badges

#### ▼ 最新バージョンタグバッジ

```markdown
![release](https://gitlab.com/foo-project/foo-repository/-/badges/release.svg)
```

> - https://docs.gitlab.com/user/project/badges.html#latest-release-badges

<br>

## 02. セットアップ

### インストール

```yaml
repository/
├── .gitlab-ci.yml
```

<br>

### 他のプライベートリポジトリへのアクセス

他のプライベートリポジトリに接続するためには、GitLab CIで、Gitの資格情報をセットアップする必要がある。

```yaml
go_mod:
  stage: build
  image: ${CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX}/golang:${GO_VERSION}
  before_script:
    # 他のプライベートリポジトリからモジュールをプルするために、資格情報をセットアップする
    - echo "machine foo.gitlab.com" > ~/.netrc
    - echo "login ${GIT_USER}" >> ~/.netrc
    - echo "password ${GIT_TOKEN}" >> ~/.netrc
  script:
    # 他のプライベートリポジトリのモジュールをインポートする
    - go mod tidy
```

<br>

## 03. API

### パイプライン実行

他のリポジトリのパイプラインを発火する。

例えば、GitOps時にアプリリポジトリがKubernetesリポジトリのパイプラインを実行する場合に役立つ。

```yaml
trigger_upstream_pipeline:
  image: ${CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX}/alpine/git
  before_script:
    - apk update && apk --no-cache add curl curl-dev
  script:
    - |
      curl -X POST "https://gitlab.com/api/v4/projects/<プロジェクトID>/trigger/pipeline"
      -F token=<トークン>
      -F ref=<ブランチ>
      -F variables[<変数名>]=<値>
```

> - https://blogs.networld.co.jp/entry/2023/03/10/090000

<br>

### Webhook

MRの作成や更新のタイミングで、外部サービスのAPIをコールできる。

<br>

## 04. Global

### 予約変数

#### ▼ `CI_COMMIT_BRANCH`

現在のブランチ名が割り当てられている。

featureブランチの名前によらずにCIを実行する条件を定義できる。

```yaml
foo_job:
  stage: build
  script:
    - echo foo
  rules:
    # featureブランチ (develop、main、以外) のみで実行する
    - if: $CI_PIPELINE_SOURCE == 'push' && $CI_COMMIT_BRANCH$CI_COMMIT_BRANCH != 'develop' && $CI_COMMIT_BRANCH != 'main'
```

#### ▼ `CI_COMMIT_TAG`

現在のタグ名が割り当てられている。

条件文と組み合わせれば、タグの作成時にパイプラインを発火させられる。

#### ▼ `CI_PIPELINE_SOURCE`

現在のパイプラインを発火させたイベント名 (MR作成/更新イベント、手動パイプライン実行イベント) が割り当てられている。

タグの付与時にパイプラインを発火させる場合、`CI_COMMIT_TAG`変数を使用する。

```yaml
foo_job:
  stage: build
  script:
    - echo foo
  rules:
    # MRを作成/更新したタイミングで発火する
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

| 値                    | 説明                             |
| --------------------- | -------------------------------- |
| `merge_request_event` | マージリクエストの作成時を表す。 |
| `push`                | プッシュ時を表す。               |
| `web`                 | 画面からの手動実行時を表す。     |

> - https://gitlab-docs.creationline.com/ee/ci/yaml/#rulesif
> - https://docs.gitlab.com/ci/variables/predefined_variables.html
> - https://docs.gitlab.com/ci/jobs/job_control.html#common-if-clauses-for-rules

#### ▼ `CI_PROJECT_DIR`

GitLabの実行環境のルートディレクトリが割り当てられている。

GitLabは、ルートディレクトリにGitLabリポジトリをクローンする。

#### ▼ `GIT_SUBMODULE_STRATEGY`

デフォルトですと、GitLab CIがサブモジュールを無視して処理してしまうため、これを無視しないようにする。

```yaml
foo_job:
  variables:
    GIT_SUBMODULE_STRATEGY: "recursive"
```

> - https://docs.gitlab.com/ci/git_submodules.html#use-git-submodules-in-cicd-jobs

<br>

### include

#### ▼ includeとは

参照する別リポジトリとCIテンプレートファイルを設定する。

GitLab CIのJobの設定ファイルを、中央集中的なリポジトリで一括管理しておき、これを他のリポジトリからリモート参照できるようになる。

ポリレポ構成規約と相性がよい。

> - https://tech-blog.optim.co.jp/entry/2022/06/16/100000

#### ▼ 親リポジトリ側のCIテンプレート

子リポジトリでは、Jobを定義する。

GitLab CIでは、定義したJobは自動的に実行される。

一方で`.` (ドット) をつけることで、使用を明示的に宣言しない限り実行できない『隠しJob』として定義できる。

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

> - https://docs.gitlab.com/ci/jobs/index.html#hide-jobs

#### ▼ 子リポジトリ側のリモートコール

子リポジトリでは、親リポジトリのCIテンプレート上の隠しJobをコールする。

```yaml
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

foo_1_job:
  # 親リポジトリで定義した隠しJobをコールする
  extends: .foo_job
  stage: build
  script:
    - cat "${PATH}"/foo.txt
  # 親リポジトリの変数を上書きする
  variables:
    PATH: "path_1"

foo_2_job:
  # 親リポジトリで定義した隠しJobをコールする
  extends: .foo_job
  stage: build
  script:
    - cat "${PATH}"/foo.txt
  # 親リポジトリの変数を上書きする
  variables:
    PATH: "path_2"

bar_job:
  extends: .bar_job
  stage: build
  needs:
    - foo1_job
    - foo2_job
  script:
    - cat "${PATH}"/bar.txt

baz_job:
  extends: .baz_job
  stage: build
  script:
    - cat "${PATH}"/baz.txt
```

> - https://docs.gitlab.com/ci/yaml/index.html#includeproject

#### ▼ ヒアドキュメントを使用したファイルの配布

ヒアドキュメントを使用して、CIの実行コンテナでファイルを自動的に作成し、これを配布する。

`artifacts`キーを使用して、後続のJobでも設定ファイルを使用できるようにしている。

````yaml
variables:
  GITLAB_COMMENT_VERSION: "6.0.1"

# github-commentを準備する
.install_github_comment:
  stage: build
  image: alpine/git:latest
  script:
    # github-commentをインストールする
    - |
      apk add --upgrade curl tar jq
      LATEST_DOWNLOAD_URL=$(curl -sL https://api.github.com/repos/suzuki-shunsuke/github-comment/releases/latest | jq -r ".assets[].browser_download_url" | grep linux_amd64)
      curl -sL -O "${LATEST_DOWNLOAD_URL}"
      tar zxvf *.tar.gz
    - ./github-comment --version
    # CIの実行環境で各リポジトリに配布するgithub-comment.yamlファイルを作成する
    - |
      cat << 'EOF' > github-comment.yaml
      # https://suzuki-shunsuke.github.io/github-comment/getting-started
      ---
      exec:
        # 静的解析以外の処理のためのテンプレート
        # -kオプションで何も指定しない場合、defaultテンプレートになる
        default:
          - when: "true"
            template: |

              ## `{{ .Vars.TestName }}`

              | 項目 | 内容 |
              |-----|--------------------|
              | コマンド | `{{ .JoinCommand }}` |
              | 説明 | {{ .Vars.Description }} |
              | 実行Job | {{ template "link" . }} |

              ## 詳細

              <details>
              <summary>クリックで開く</summary>

              ```bash
              $ {{ .JoinCommand }}

              {{ .CombinedOutput | AvoidHTMLEscape }}
              ```

              </details>

        # 静的解析のためのテンプレート
        test:
          - when: "true"
            template: |

              ## `{{ .Vars.TestName }}`

              | 項目 | 内容 |
              |-----|--------------------|
              | 静的解析 | `{{ .JoinCommand }}` |
              | 説明 | {{ .Vars.Description }} |
              | 成否 | {{ template "status" . }} |
              | 実行Job | {{ template "link" . }} |

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

> - https://docs.gitlab.com/ci/yaml/index.html#variables

#### ▼ ファイルの切り分け

可能であれば、`variables`キーを`variables.yml`ファイルとして切り分け、これを読み込むようにする。

可読性が高くなる。

```yaml
# variables.ymlファイル
# variablesで空文字を設定する
variables:
  FOO: ""
```

```yaml
include:
  - local: .gitlab-ci/variables.yml

foo_job:
  stage: build
  script:
    # ダブルクオートがない
    - echo ${FOO}
```

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

#### ▼ リスト

変数でリストを定義できる。

これを使用して、単一のJob内で`for`を実行できる。

```yaml
foo_job:
  variables:
    LIST: foo1 foo2 foo3
  script:
    - |
      for VALUES in $LIST
        do
          echo ${VALUES}
        done
```

> - https://docs.gitlab.com/ci/variables/#store-multiple-values-in-one-variable
> - https://stackoverflow.com/a/74059668

<br>

### workflow

#### ▼ workflowとは

GitLab CI自体の発火を制御する。

> - https://gitlab-docs.creationline.com/ee/ci/yaml/#workflowrules

#### ▼ if

GitLab CIが発火する条件を設定する。

```yaml
# ブランチ名に応じて、CIで使用する実行コンテナ名を切り替える
# main、develop、MR作成/変更、の順に条件を検証する。
workflow:
  rules:
    # mainブランチにて、任意の方法でパイプラインを実行した場合
    - if: $CI_COMMIT_REF_NAME == 'main'
      variables:
        ENV: "prd"
    # developブランチにて、任意の方法でパイプラインを実行した場合
    - if: $CI_COMMIT_REF_NAME == 'develop'
      variables:
        ENV: "stg"
    # MRにて、任意の方法でパイプラインを実行した場合
    - if: $CI_PIPELINE_SOURCE == 'merge_request_event'
      variables:
        ENV: "tes"
    # 上記以外で、webから手動でパイプラインを実行した場合
    - if: $CI_PIPELINE_SOURCE == 'web'
      variables:
        ENV: "tes"

setup-manifest:
  stage: build
  image: alpine/helm:latest
  # ブランチ名に応じて、valuesファイルを切り替える
  script:
    - helm lint . -f "${VALUES_FILE_PATH}" -f "${SECRETS_FILE_PATH}"
    - helm template . -f "${VALUES_FILE_PATH}" -f "${SECRETS_FILE_PATH}" > manifest.yaml
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

## 05. Job

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
  # インデントを揃えるべき場所がある場合、Jobを失敗させる
  allow_failure: "true"
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
  allow_failure: "true"
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

#### ▼ artifactsとは

GitLabでは、以前のステージのJobのファイルを後続のJobにデフォルトで継承できる (GitLabのバージョンが古いとこの機能がない場合がある) 。

しかし、`needs`でJob間に依存関係を定義している場合、`artifacts`を使用しても、`needs`で指定しているJob以外のファイルを継承できない。

`needs`で指定したJobの`artifacts`のみを継承できる。

```yaml
stages:
  - build
  - deploy

# ビルドステージ
foo_job:
  stage: build
  script:
    - echo foo
  artifacts:
    paths:
      - foo

bar_job:
  stage: build
  script:
    - echo bar
  artifacts:
    paths:
      - bar

# デプロイステージ
baz_job:
  stage: deploy
  # foo_jobのartifactsは継承できるが、bar_jobのartifactsは継承できない
  needs:
    - foo_job
  script:
    - echo baz

qux_job:
  stage: deploy
  # foo_jobとbar_jobの両方のartifactsを継承できる
  needs:
    - foo_job
    - bar_job
  script:
    - echo qux
```

> - https://docs.gitlab.com/ci/yaml/index.html#needsartifacts

#### ▼ artifactsが不要な場合

GitLabでは、以前のステージのJobのファイルを後続のJobにデフォルトで継承できる。

そのため、`artifacts`は不要である。

```yaml
# ビルドステージ
foo_job:
  stage: build
  script:
    - echo foo

# デプロイステージ
bar_job:
  stage: deploy
  script:
    # buildステージのファイルを使用する
    ...
```

> - https://docs.gitlab.com/ci/jobs/job_artifacts.html
> - https://docs.gitlab.com/ci/jobs/job_artifacts_troubleshooting.html
> - https://docs.gitlab.com/ci/caching/#artifacts

<br>

### before_script

#### ▼ before_scriptとは

記入中...

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
    # キャッシュとして保管するディレクトリを設定する
    paths:
      - ./node_module
```

> - https://www.serversus.work/topics/927zjvmew2491o2n1oob/
> - https://docs.gitlab.com/ci/caching/#use-a-fallback-cache-key

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

#### ▼ dependencies

通常、`dependencies`を指定せずに`artifacts`を使用した場合、全てのJobとファイルを継承する。

`dependencies`を設定すれば、`artifacts`が設定された特定のJobを指定し、そのJobのみをファイルを継承する。

```yaml
stages:
  - build
  - deploy

foo_job:
  stage: build
  script:
    - echo foo
  artifacts:
    paths:
      - foo

bar_job:
  stage: build
  script:
    - echo bar
  artifacts:
    paths:
      - bar

baz_job:
  stage: deploy
  script:
    - echo baz
  # foo_jobのアーティファクトのみを継承する
  dependencies:
    - foo_job
```

> - https://docs.gitlab.com/ci/yaml/index.html#dependencies
> - https://stackoverflow.com/a/45422614

<br>

### image

#### ▼ imageとは

Jobの実行コンテナを設定する。

```yaml
foo_job:
  stage: build
  image:
    name: alpine:1.0.0
    entrypoint: ["sh"]
  script:
    - echo foo
```

> - https://docs.gitlab.com/ci/yaml/index.html#image

#### ▼ `CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX` (依存プロキシ)

CIでは、コンテナイメージのプルの頻度が高まるため、イメージレジストリ (例：DockerHub) によってはプル数の制限にひっかかってしまう。

イメージレジストリのパスのプレフィクスとして`CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX` (依存プロキシ) をつけると、コンテナイメージがGitLabのDependency Proxyを経由するようになる。

キャッシュは、リポジトリの親グループの『`https://<URL>/<親グループ>/-/dependency_proxy`』という設定ページで確認できる。

Dependency Proxyはコンテナイメージをキャッシュするため、毎回DockerHubにコンテナをプルしなくなり、プル数の制限にひっかかりにくくなる。

なお、執筆時点 (2025/03/05) ではDockerHubへのプルの経由のみに対応している。

```yaml
foo_job:
  stage: build
  image:
    name: ${CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX}/alpine:1.0.0
    entrypoint: ["sh"]
  script:
    - echo foo
```

> - https://docs.gitlab.com/user/packages/dependency_proxy/#store-a-docker-image-in-dependency-proxy-cache
> - https://docs.gitlab.com/user/packages/dependency_proxy/#use-the-dependency-proxy-for-docker-images
> - https://brettops.io/blog/gitlab-docker-proxy/

<br>

### needs

#### ▼ needsとは

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

### parallel

#### ▼ parallelとは

同じJobを複数並列実行する。

```yaml
foo_job:
  stage: build
  parallel:
    matrix:
      - ENV:
          - foo1
          - foo2
          - foo3
  # foo1、foo2、foo3を出力する異なるJobを並列実行する
  script:
    - echo ${ENV}
```

> - https://docs.gitlab.com/ci/yaml/#parallelmatrix
> - https://docs.gitlab.com/ci/jobs/job_control.html#parallelize-large-jobs

#### ▼ アーティファクト依存関係

並列実行した各Jobに対して、アーティファクトの依存関係を設定できる。

```yaml
stages:
  - build
  - deploy

foo_job:
  stage: build
  parallel:
    matrix:
      - ENV:
          - foo1
          - foo2
          - foo3
  # foo1、foo2、foo3を出力する異なるJobを並列実行する
  script:
    - echo ${ENV}

baz_job:
  stage: deploy
  script:
    - echo baz
  # foo_jobのfoo1のアーティファクトのみを継承する
  dependencies:
    - "foo_job: [foo1]"
```

> - https://docs.gitlab.com/ci/jobs/job_control.html#fetch-artifacts-from-a-parallelmatrix-job

#### ▼ Jobの依存関係

並列実行した各Jobに対して、Jobの依存関係を設定できる。

```yaml
stages:
  - build
  - deploy

foo_job:
  stage: build
  parallel:
    # foo1、foo2、foo3を出力する異なるJobを並列実行する
    matrix:
      - ENV:
          - foo1
          - foo2
          - foo3
  script:
    - echo ${ENV}

baz_job:
  stage: deploy
  script:
    - echo baz
  needs:
    - job: foo_job
      parallel:
        matrix:
          # foo_jobのfoo2に依存する
          - ENV: foo2
```

> - https://stackoverflow.com/a/76956828
> - https://docs.gitlab.com/ci/yaml/#needsparallelmatrix

<br>

### rules

#### ▼ rulesとは

Jobの発火条件を設定する。

複数の条件 (複数の`if`キー、`if`キーと`changes`キーの組み合わせ) を並べた場合、上から順番に条件を検証していくため、OR条件になる。

#### ▼ if

条件に合致した場合のみ、Jobを発火する。

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

プッシュ時に、指定したファイルやディレクトリで差分があれば、Jobを発火する。

```yaml
gemerate_template:
  script:
    - helm template . -f foo-values.yaml -f foo-secrets.yaml > foo.yaml
  rules:
    # webイベント (パイプライン実行ボタン) の場合
    - if: $CI_PIPELINE_SOURCE == "web"
    # ファイルやディレクトリ内に差分があった場合
    - changes:
        - template/**/*
        - foo-values.yaml
```

> - https://gitlab-docs.creationline.com/ee/ci/yaml/#ruleschanges

<br>

### services

#### ▼ services

![gitlab_service-container](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/gitlab_service-container.png)

JobのCIの実行コンテナとは別のサービスコンテナを作成する。

両方のコンテナで使用するイメージのバーションは揃えるようにする。

```yaml
foo_job:
  # CIの実行環境
  image: docker:19.03.0
  # サービスコンテナ
  services:
    - name: docker:19.03.0-dind
```

> - https://blog.nestybox.com/2020/10/21/gitlab-dind.html
> - https://www.ted027.com/post/gitlabci-services-host/
> - https://about.gitlab.com/blog/2019/07/31/docker-in-docker-with-docker-19-dot-03/#disable-tls

#### ▼ 複数のコンテナを同時に起動するため

Jobでアプリコンテナを動かし、DBコンテナを別に起動しておく場合、もう一つコンテナが必要になる。

これを回避するために使用する。

> - https://qiita.com/kytiken/items/a95ef8c1fccfc4a9b089#example

#### ▼ TLSの無効化 (非暗号化)

GitLab CI上でDocker in Dockerを使用する場合、実行コンテナとサービスコンテナでセットアップが必要である。

```yaml
variables:
  # ドライバーの設定
  DOCKER_DRIVER: "overlay2"
  # ホストの設定
  DOCKER_HOST: "tcp://docker:2375"
  # TLSの無効化 (非暗号化)
  DOCKER_TLS_CERTDIR: ""

foo_job:
  # CIの実行環境
  image: docker:19.03.0
  # サービスコンテナ
  services:
    - name: docker:19.03.0-dind
      # TLSの無効化 (非暗号化)
      command: ["--tls=false"]
```

> - https://gitlab.com/gitlab-org/gitlab-runner/-/issues/27300
> - https://docs.avisi.cloud/blog/2021/07/31/running-kubernetes-on-gitlab-ci/
> - https://containerinfra.com/blog/gitlab/2021-07-31-kubernetes-in-gitlab-ci/
> - https://gist.github.com/trondhindenes/0307fbe9cda1164115353b4632a31ea9

<br>

### stage

#### ▼ stage

Jobが所属するステージを設定する。

より先のステージ内のJobが全て成功しない限り、後続のJobを開始しない。

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

> - https://docs.gitlab.com/ci/yaml/index.html#stage

<br>

### script

#### ▼ scriptとは

Jobで実行する処理を設定する。

```yaml
foo_job:
  stage: build
  script:
    - echo "Hello World"
```

> - https://docs.gitlab.com/ci/yaml/index.html#script

<br>

### trigger

Jobが発火した場合、特定のアクションを実施する。

**＊例＊**

モノレポでGitLabCIを採用している場合、 親の`.gitlab-ci.yml`ファイルでディレクトリ配下の変更を検知し、子の`.gitlab-ci.yml`ファイルを読み込む (`include`) ようにする。

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

### when

#### ▼ whenとは

Jobを実行する条件を設定する。

> - https://docs.gitlab.com/ci/yaml/index.html#when

#### ▼ always

ワークフローのうちで、前のJobのステータスに関係なく、必ずJobを実行する

```yaml
bar_job:
  stage: build
  script:
    - echo bar
  when: always
```

> - https://docs.gitlab.com/ci/yaml/index.html#when

#### ▼ manual

ワークフローのうちで、手動の場合にのみJobを実行する。

```yaml
foo_job:
  stage: build
  script:
    - echo foo
  when: manual
```

> - https://docs.gitlab.com/ci/yaml/index.html#when

#### ▼ never

特定の条件の場合、Jobを実行しない。

なお、`when: never`のみの定義は意味がない。

```yaml
baz_job:
  stage: build
  script:
    - echo bar
  # BAZ変数がfalseの場合は実行しない (never)
  rules:
    - if: $BAZ == 'false'
      when: never
```

> - https://blogs.networld.co.jp/entry/2022/11/01/090000
> - https://stackoverflow.com/a/74885985

<br>

## 06. 処理の共通化

### 別ファイル

`include`キーを使用する。

<br>

### 同じファイル

#### ▼ anchorの隠しJob化

anchorとして定義した処理を隠しJob化する。

```yaml
# GitLabの他のリポジトリからモジュールをプルするために、資格情報をセットアップする
.setup_git: &setup_git
  - echo "machine foo.gitlab.com" > ~/.netrc
  - echo "login ${GIT_USER}" >> ~/.netrc
  - echo "password ${GIT_TOKEN}" >> ~/.netrc

go_mod:
  stage: build
  image: ${CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX}/golang:${GO_VERSION}
  extends:
    - *setup_git
  script:
    # 他のプライベートリポジトリのモジュールをインポートする
    - go mod tidy
```

> - https://docs.gitlab.com/ci/yaml/yaml_optimization/#anchors

#### ▼ `before_script`キーの隠しJob化

`before_script`キーを隠しJob化することで、共通のスクリプトとして使用できる。

ただし、呼び出す側で別の`before_script`キーがあると、上書きしてしまう。

```yaml
# GitLabの他のリポジトリからモジュールをプルするために、資格情報をセットアップする
.setup_git:
  before_script:
    - echo "machine foo.gitlab.com" > ~/.netrc
    - echo "login ${GIT_USER}" >> ~/.netrc
    - echo "password ${GIT_TOKEN}" >> ~/.netrc

go_mod:
  stage: build
  image: ${CI_DEPENDENCY_PROXY_DIRECT_GROUP_IMAGE_PREFIX}/golang:${GO_VERSION}
  extends:
    - .setup_git
  script:
    # 他のプライベートリポジトリのモジュールをインポートする
    - go mod tidy
```

> - https://stackoverflow.com/a/74831820/12771072

<br>
