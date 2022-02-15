---
title: 【知見を記録するサイト】CircleCI＠CI/CD
description: CircleCI＠CI/CDの知見をまとめました．
---

# CircleCI＠CI/CD

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. CircleCIとは

### 設定ファイルの参考ドキュメント

https://circleci.com/docs/

<br>

### セットアップ

#### ・Webhook

CircleCIの鍵をGitHubに登録すると，リポジトリへのプッシュによって，CircleCIをフック（プッシュフック）できるようになる．鍵のうちでデプロイキーを用いることが推奨されている．なお，デプロイキーを追加するには，GitHubアカウントにAdmin権限が必要である．

参考：https://circleci.com/docs/2.0/gh-bb-integration/

#### ・デバッグの事前準備

デバッグでは行数がわからない仕様になっている．そこで，Workflowのjobのどこで失敗しているのかを特定するために，検証しないjobをコメントアウトしておく．

```yaml
workflows:
  # build以外を実行しないようにすることで，buildのみを検証できる．
  build-test-and-deploy:
    jobs:
      - build
#      - test1:
#          requires:
#            - build
#      - test2:
#          requires:
#            - test1
#      - deploy:
#          requires:
#            - test2
```


#### ・バリデーション

ホストで，以下のコマンドを実行する．

```bash
$ circleci config validate

# 以下の文章が表示されれば問題ない．
# Config file at .circleci/config.yml is valid.
```

#### ・処理の展開

設定ファイルを実行した時の処理を展開し，ファイルに出力できる

```bash
$ circleci config process .circleci/config.yml > .circleci/process.yml
```

#### ・ローカルテスト

コマンドにより，テストに必要なdockerイメージをpullし，コンテナを構築する．続いて，コンテナ内でCircleCIを実行する．バージョン2.1以降では，事前に，設定ファイルの処理を展開しておく必要がある．

```bash
# バージョン2.1の設定ファイルの処理を展開
$ circleci config process .circleci/config.yml > .circleci/process.yml

# 専用のdockerコンテナを構築し，展開ファイルを元にテストを実行
$ circleci local execute -c .circleci/process.yml --job <job名>
```

#### ・CircleCIコンテナにSSH接続

CircleCIコンテナにSSH接続を行い，コンテナ内で生成されたファイルを確認できる．

```bash
$ <CircleCIから提示されたコマンドをコピペ> -i ~/.ssh/<秘密鍵名>
```

#### ・Test Insights

各テストのパフォーマンスや成功失敗率を確認できる．

https://circleci.com/docs/2.0/insights-tests/

<br>

### PHPUnitの自動実行

#### ・仕組み

1. テストクラスを実装したうえで，新機能を設計実装する．

2. リポジトリへプッシュすると，CIツールがGituHubからブランチの状態を取得する．

3. CIツールによって，DockerHubから取得したDockerfileのビルド，PHPUnitなどが自動実行される．

4. 結果を通知することも可能．

![継続的インテグレーション](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/継続的インテグレーション.png)

### PHPStanの自動実行

#### ・仕組み

<br>

## 02. version

### versionとは

CircleCIのバージョンを宣言．

**＊実装例＊**

```yaml
version: 2.1
```

<br>

## 03. parameters

### parameters

#### ・parametersとは

| パラメーター名                | 参照範囲                                                     | 値を設定する場所 |
| ------------------- | ------------------------------------------------------------ | ---------------- |
| command parameters  | ```command```内で定義する．定義された```command```内のみで定義できる． | ```workflows```  |
| job parameters      | ```job```内で定義する．定義された```job```内のみで参照できる． | ```workflows```  |
| executors parameter | ```executors```内で定義する．定義された```executos```内のみで参照できる． | ```job```        |
| pipeline parameters | トップレベルで定義する．リポジトリ内でのみ参照できる．       | ```workflows```  |

<br>

### command parameters

#### ・値の出力方法

引数名を用いて，```parameters```から値を出力する．

```
<< parameters.foo >>
```

#### ・job parameterを参照

定義できるデータ型は，job parameterと同じ．定義された```command```内のみで定義できる．

```yaml
version: 2.1

commands:
  sayhello:
    description: "Echo hello world"
    # 引数の定義
    parameters:
      to:
        type: string
        # デフォルト値
        default: "Hello World"
    steps:
      - run: echo << parameters.to >>
```

<br>

### job parameters

#### ・値の出力方法

引数名を用いて，```parameters```から値を出力する．

```
<< parameters.foo >>
```

#### ・デフォルト値について

引数が与えられなかった場合に適用される```default```を設定できる．```default```を設定しない場合，引数が必須と見なされる．

```yaml
version: 2.1

commands:
  sayhello:
    description: "Echo hello world"
    parameters:
      to:
        type: string
        default: "Hello World"
    steps:
      - run: echo << parameters.to >>
```

#### ・string型

引数として，任意の文字列を渡したいときに用いる．```workflows```にて，値を設定する．

**＊実装例＊**

```yaml
version: 2.1

commands:
  print:
    # 引数を定義
    parameters:
      message:
        # デフォルト値が無い場合は必須
        type: string
    steps:
      - run: echo << parameters.message >>

jobs:
  cat-file:
    parameters:
      file:
        type: string
    steps:
      - print:
          # parametersの値を渡す
          message: Printing << parameters.file >>
      - run: cat << parameters.file >>

workflows:
  my-workflow:
    jobs:
      - cat-file:
          # workflowにて文字列型の値を設定
          file: test.txt
```

#### ・boolean型

多くの場合，引数がTrueの場合のみ，特定の```step```を実行したい時に用いる．```job```で定義した後，```workflows```にて値を設定する．```workflows```にて，値を設定する．

**＊実装例＊**

```yaml
version: 2.1

jobs:
  job_with_optional_custom_checkout:
    # 引数の定義
    parameters:
      custom_checkout:
        type: boolean
        # デフォルト値
        default: false
    machine: true
    steps:
      - when:
          # 引数がtrueの場合
          condition: << parameters.custom_checkout >>
          steps:
            - run: echo "my custom checkout"
      - unless:
          # 引数のfalseの場合
          condition: << parameters.custom_checkout >>
          steps:
            - checkout
            
workflows:
  build-test-deploy:
    jobs:
      - job_with_optional_custom_checkout:
          # workflowにてbool型の値を設定
          custom_checkout: true
```

#### ・enum型

引数として，特定の文字列や整数のみを渡したいときに用いる．```workflows```にて，値を設定する．

**＊実装例＊**

```yaml
version: 2.1

jobs:
  deploy:
    parameters:
      # 引数を定義
      environment:
        # デフォルト値
        default: "dev"
        type: enum
        enum: ["dev", "stg", "prd"]
    steps:
      - run:
        # デフォルト値testを与えるときは何も設定しない
        name: Deploy to << parameters.environment >>
        command:
        # 何らかの処理
    
workflows:
  deploy:
    jobs:
      - deploy:
          # workflowにてenum型の値を設定
          environment: stg
```

<br>

### executors parameter

#### ・値の出力方法

引数名を用いて，```parameters```から値を出力する．

```
<< parameters.foo >>
```

#### ・job parametersを参照

引数として，任意の文字列を```executors```に渡したいときに用いる．他のparametersとは異なり，```job```にて，値を設定する．

```yaml 
version: 2.1

executors:
  python:
    # 引数の定義
    parameters:
      tag:
        type: string
        # デフォルト値
        default: latest
      myspecialvar:
        type: string
    docker:
      - image: circleci/python:<< parameters.tag >>
    environment:
      MYPRECIOUS: << parameters.myspecialvar >>
      
jobs:
  build:
    executor:
      name: python
      tag: "2.7"
      # jobにて文字列型の値を設定
      myspecialvar: "myspecialvalue"
```

#### ・workflowで値を設定する

公式リファレンスには載っていないため，方法としては非推奨．```parameter```を渡したい```executor```を使いまわしたい時に用いる．

```yaml
version: 2.1

executors:
  python:
    # 引数の定義
    parameters:
      env:
        type: enum
        enum: [ "2.7", "3.5" ]
      myspecialvar:
        type: string
    docker:
      - image: circleci/python:<< parameters.tag >>
    environment:
      MYPRECIOUS: << parameters.myspecialvar >>
      
jobs:
  build:
    # 引数の定義
    parameters:
      # executorをデータ型として選択
      executor_param:
        type: executor
    executor: << parameters.executor_param >>

workflows:
   version: 2.1
   build-push:
     jobs:
       - build:
           # jobにてexecutor名を設定し，さらにexecutorに値を渡す
           executor_param:
             name: python
             # バージョン3.5を設定
             tag: "2.7"
             myspecialvar: "myspecialvalue"
       - build:
           executor_param:
             name: python
             # バージョン3.5を設定
             tag: "3.5"
             myspecialvar: "myspecialvalue"       
```

<br>

### pipeline parameters

#### ・値の出力方法

引数名を用いて，```pipeline.parameters```から値を出力する．

```
<< pipeline.parameters.foo >>
```

#### ・job parametersを参照

定義できるデータ型は，job parameterと同じ．リポジトリ内でのみ参照できる．

```yaml
version: 2.1

parameters:
  # 引数を定義
  image-tag:
    type: string
    # デフォルト値
    default: "latest"
  workingdir:
    type: string
    default: "~/main"

jobs:
  build:
    docker:
      - image: circleci/node:<< pipeline.parameters.image-tag >>
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD
    environment:
      IMAGETAG: << pipeline.parameters.image-tag >>
    working_directory: << pipeline.parameters.workingdir >>
    steps:
      - run: echo "Image tag used was ${IMAGETAG}"
      - run: echo "$(pwd) == << pipeline.parameters.workingdir >>"
      
workflows:
  my-workflow:
    jobs:
      - build:
          # 引数名: 渡す値 
          image-tag: "1.0"
          workdir: "/tmp"
```

## 04. jobs

### jobs

#### ・jobsとは

複数の```job```を定義する．Workflowsを用いない場合は，少なくとも1つの```job```には```build```という名前を用いなければならない．

#### ・jobの粒度

![CICDパイプライン](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/CICDパイプライン.png)

| 粒度   | 説明                                                         | 備考                                                       |
| ------ | ------------------------------------------------------------ | ---------------------------------------------------------- |
| build  | プログラムの実行環境を構築する．                             | buildとtestを分割しにくい場合は，同じjobで定義しても良い． |
| test   | 種々のテスト（Unitテスト，Functionalテスト，など）を実行する． |                                                            |
| deploy | ステージング環境または本番環境へのデプロイを実行する．       |                                                            |

<br>

### docker，machine

#### ・仮想環境の選択

jobを実行する仮想環境を選択できる．

#### ・dockerタイプとは

dockerコンテナを実行環境として設定する．これを選択したうえで，dockerイメージのビルド（Docker composeを含む）を実行する場合，実行環境dockerコンテナの中でdockerコンテナを構築するという入れ子構造になる．これは非推奨のため，```setup_remote_docker```を用いて，実行環境dockerコンテナとは別の環境で```job```を行う必要がある．また，dockerコマンドがインストールされていないイメージで合った場合，```setup_remote_docker```を有効化すると，これを使用できるようになる．```machine```タイプを選択した場合，```setup_remote_docker```は不要である．ただし，ボリュームマウントを使用できなくなるので注意する．また，DockerfileのCOPYコマンドが機能しなくなる．

参考：https://circleci.com/docs/ja/2.0/building-docker-images/

![machine_executor](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/docker_executor.png)

**＊実装例＊**


```yaml
version: 2.1

jobs:
 build:
   docker:
     - image: circleci/foo
   steps:
     - checkout
     # コンテナが入れ子にならないようにする．
     - setup_remote_docker
     - run: | # DockerHubへのログイン
         echo "$DOCKER_PASS" | docker login --username $DOCKER_USER --password-stdin
         docker run -d --name db company/proprietary-db:1.2.3

     # dockerイメージのビルド
     - run: docker build -t company/app:$CIRCLE_BRANCH .

     # dockerイメージのDockerHubへのデプロイ
     - run: docker push company/app:$CIRCLE_BRANCH
```

#### ・machineタイプとは

Linuxサーバーを実行環境として設定する．

![machine_executor](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/machine_executor.png)

**＊実装例＊**

```yaml
version: 2.1

jobs:
 build:
   machine: true
   steps:
     - checkout
     - run: | # DockerHubへのログイン
         echo "$DOCKER_PASS" | docker login --username $DOCKER_USER --password-stdin
         docker run -d --name db company/proprietary-db:1.2.3

     # dockerイメージのビルド
     - run: docker build -t company/app:$CIRCLE_BRANCH .

     # dockerイメージのDockerHubへのデプロイ
     - run: docker push company/app:$CIRCLE_BRANCH
```

<br>

### steps

#### ・stepsとは

処理をMap型で定義する．

#### ・when，unless

if文を定義する．```when```では条件がtrueの場合，また```unless```ではfalseの場合に実行する```step```を定義する．

**＊実装例＊**

```yaml
version: 2.1

jobs:
  custom_checkout:
    parameters:
      custom_checkout_parameters:
        type: bool
        # デフォルト値はfalse
        default: false
    machine: true
    steps:
      # 引数がtrueの場合
      - when:
          condition: << parameters.custom_checkout_parameters >>
          steps:
            - run: echo "独自のチェックアウト処理"
      # 引数がfalseの場合
      - unless:
          condition: << parameters.custom_checkout_parameters >>
          steps:
            - checkout
            
workflows:
  version: 2.1
  build-test-deploy:
    jobs:
      - custom_checkout:
          # 引数名: 渡す値
          custom_checkout_parameters: true
```


#### ・restore_cache，save_cache

![CircleCIキャッシュ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/CircleCIキャッシュ.png)

ビルドのアーティファクトのキャッシュを作成する．この機能を用いない場合，例えば，CircleCIコンテナで```composer install```を実行すると，毎回のWorkflowで同じライブラリがインストールされる．しかし，Workflowのたびに，ライブラリをインストールするのは非効率である．そこで，```composer.json```ファイルの実装が変更されない限り，前回のWorkflowのビルド時に，vendorディレクトリ下に配置されたアーティファクトを再利用するようにする．この機能は，複数のWorkflowの間だけでなく，1つのWorkflowの中でも利用できる．

参考：https://circleci.com/docs/ja/2.0/caching/#%E3%83%A9%E3%82%A4%E3%83%96%E3%83%A9%E3%83%AA%E3%81%AE%E3%82%AD%E3%83%A3%E3%83%83%E3%82%B7%E3%83%A5

**＊実装例＊**

Composerを用いてライブラリをインストールする時に，前回の結果を再利用する．

```yaml
version: 2.1

jobs:
  build:
    steps:
      # composer.jsonが変更されている場合は処理をスキップ．
      - restore_cache:
          key:
            - v1-dependecies-{{ checksum "composer.json" }}
            - v1-dependencies-
      # 取得したcomposer.jsonを元に，差分のvendorをインストール
      - run: 
          name: Run composer install
          commands: |
            composer install -n --prefer-dist
      # 最新のvendorディレクトリのキャッシュを作成
      - save_cache:
          key: v1-dependecies-{{ checksum "composer.json" }}
          paths:
            - ./vendor
```

**＊実装例＊**

yarnを用いてライブラリをインストールする時に，前回の結果を再利用する．

```yaml
version: 2.1

jobs:
  build_and_test:
    docker:
      - image: circleci/python:3.8-node
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "package.json" }}
            - v1-dependencies-
      - run:
          name: Run yarn install
          commands: |
            yarn install
      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-{{ checksum "yarn.lock" }}
      - run:
          name: Run yarn build
          commands : |
            yarn build
      - run:
          name: Run yarn test
          commands : |
            yarn test
```

ただ，この機能はcommandsで共通化した方が可読性が良い．

**＊実装例＊**

```yaml
version: 2.1

commands:
  restore_vendor:
    steps:
      # composer.jsonの実装が変更されていない場合は処理をスキップ．
      - restore_cache:
          key:
            - v1-dependencies-{{ checksum "composer.json" }}
            - v1-dependencies-
       
  save_vendor:
    steps:
      # 最新のvendorを保存．
      - save_cache:
          key: v1-dependencies-{{ checksum "composer.json" }}
          paths:
            - ./vendor
            
jobs:
  build:
    steps:
      - restore_vendor
      # 取得したcomposer.jsonを元に，差分のvendorをインストール
      - run: 
          name: Run composer install
          commands: |
            composer install -n --prefer-dist
      - save_vendor
```

#### ・persist_to_workspace，attach_workspace

![workflow_workspace_cache](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/workflow_workspace_cache.png)

CircleCIでは，jobごとに異なる仮想環境が構築されるため，他の```job```で使用された一時ファイルを再利用したい場合，これを用いる．

**＊実装例＊**

```yaml
version: 2.1

jobs:
  jobA:
    steps:
    # Workspaceにファイルをアップロード
      - persist_to_workspace:
          # jobAにて，Workspaceとするディレクトリのroot
          root: /tmp/workspace
          # Rootディレクトリを基準とした相対パス（"./"以外の場合は，ディレクトリの作成が必要）
          # パラメーターは環境変数として出力できないので注意
          paths:
            - target/application.jar
            - build/*
  jobB:
    steps:
      # persist_to_workspaceで作成されたWorkspaceからファイルをダウンロード
      - attach_workspace:
        # jobAとは異なるディレクトリ下にファイルをダウンロードしてもよい
        at: /tmp/workspace
```

全てのディレクトリを保持するような場合がほとんどと思われるため，カレントディレクトリ下（```.```）を指定するのが良い．

**＊実装例＊**

```yaml
version: 2.1

jobs:
  jobA:
    steps:
      - persist_to_workspace:
          root: .
          paths:
            - .
  jobB:
    steps:
      - attach_workspace:
         at: .
```

<br>

## 05. commands

### commandsとは

設定を部品化し，異なる```job```で```step```として繰り返し利用できる．

<br>

### 部品化と再利用

**＊実装例＊**

```yaml
version: 2.1

commands:
  sayhello:
    description: "Echo hello world"
    parameters:
      text:
        type: string
        default: "Hello World"
    steps:
      # parametersの値を渡す
      - run: echo << parameters.text >>
      
jobs:
  myjob:
    docker:
      - image: "circleci/node:9.6.1"
    steps:
      # command名
      - sayhello:
          # 引数名: 渡す値
          text: "Lev"
```

<br>

## 06. executors

### executors

#### ・executorsとは

実行環境に関する設定を部品化し，異なる```job```で繰り返し利用できる．

<br>

### 部品化と再利用

**＊実装例＊**

```yaml
version: 2.1

executors:
  # ホスト環境名
  my-executor:
    # ホスト環境
    docker:
      - image: circleci/ruby:2.5.1-node-browsers
    working_directory: ~/foo_project
    environment:
      XX: xx
      YY: yy

jobs:
  my-job:
    executor: my-executor
    steps:
      - run: echo "${XX}と${YY}です"
```

<br>

## 07. Workflow

### Workflowの粒度

#### ・ブランチ別

**＊実装例＊**

```yaml
workflows:
  # Featureブランチをレビュー
  feature:
    jobs:
      - build:
          name: build_feat
          filters:
            branches:
              only:
                - /feature.*/
      - test:
          name: test_feat
          requires:
            - build_feat
            
  # ステージング環境にデプロイ
  develop:
    jobs:
      - build:
          name: build_stg
          filters:
            branches:
              only:
                - develop
      - test:
          name: test_stg
          requires:
            - build_stg
      - deploy:
          name: deploy_stg
          requires:
            - test_stg
        
  # 本番環境にデプロイ
  main:
    jobs:
      - build:
          name: build_prd
          filters:
            branches:
              only:
                - main
      - test:
          name: test_prd
          requires:
            - build_prd
      - deploy:
          name: deploy_prd
          requires:
            - test_prd
```

<br>

### 特殊なsteps

#### ・pre-steps，post-steps

事前に```job```に定義する必要はない．```workspace```で，コールされる```job```の引数として設定することで，その```job```内の最初と最後に，```steps```を追加できる．

**＊実装例＊**

```yaml
version: 2.1

jobs:
  bar:
    machine: true
    steps:
      - checkout
      - run:
          command: echo "building"
      - run:
          command: echo "testing"
          
workflows:
  build:
    jobs:
      - bar:
          # Workspace前に行う処理
          pre-steps:
            - run:
                command: echo "install custom dependency"
          # Workspace後に行う処理
          post-steps:
            - run:
                command: echo "upload artifact to s3"
```

Orbsを用いる場合は，オプションに引数を渡す前に定義する．

**＊実装例＊**

```yaml
workflows:
  build:
    jobs:
      - aws-foo/build-push-yyy:
          # Workspace前に行う処理
          pre-steps:
            - run:
                command: echo "FOO"
          # Workspace後に行う処理
          post-steps:
            - run:
                command: echo "FOO"
          # Orbsのオプション
          name: foo
          dockerfile: foo
          tag: foo
```

<br>

### filters

#### ・filtersとは

コミットされた時に```job```が発火するブランチ名，あるいは発火しないブランチ名，を設定する．正規表現で実装する必要がある．

#### ・only，ignore

| よくあるパターン    | 説明                                     |
| ------------------- | ---------------------------------------- |
| ```/.*/```          | 全てのブランチを明示的に指定             |
| ```/feature\/.*/``` | 『feature/』と名前のついたブランチを指定 |

**＊実装例＊**

```yaml
workflows:
  version: 2.1
  build:
    jobs:
      - foo:
          filters:      
            branches:
              only:
                - /.*/
```

```yaml
workflows:
  version: 2.1
  build:
    jobs:
      - foo:
          filters:      
            branches:
              ignore:
                - /feature\/.*/
```

#### ・tags

タグをつけたコミットに対して発火する．```ignore```キーで全てのブランチを指定することにより，マージによる発火を防げる．

```yaml
workflows:
  version: 2.1
  build:
    jobs:
      - foo:
          filters:
            branches:
               ignore: /.*/
            tags:
               only: /release\/.*/
```

<br>

## 08. 環境変数

### CircleCIにおける環境変数とは

#### ・環境変数の種類と参照範囲

| 参照レベル | 方法                                        | 説明                                                         |
| ---------- | ------------------------------------------- | ------------------------------------------------------------ |
| Bash       | ```export```，```source```，```$BASH_ENV``` | ```run```における```command```内のみで参照できる．ただし，```$BASH_ENV```を用いれば，異なる```commands```間で値を共有可能． |
| Container  | ```environment```                           | ```job```内の特定のコンテナのみで参照できる．                |
| Job        | ```environment```                           | ```job```内のみで参照できる．                                |
| Project    | Environment Variables機能                   | リポジトリ内のみ参照できる．                                 |
| Global     | Contexts機能                                | 異なるリポジトリ間で参照できる．                             |

#### ・環境変数の出力方法

Linuxにおける環境変数の出力方法と同様である．また，文字列の中に値を出力する変数展開の場合，```${}```を用いる．

```yaml
# 変数展開の場合
steps:
  - checkout
  - run:
     name: echo FOO
     command: |
       echo $FOO
       echo "This is ${FOO}"
```

#### ・```.env```ファイルの安全な複製方法

アプリケーションの```.env```ファイルをCirlcCI内で用いたい時は，あらかじめエンコードされた環境変数をProject変数として管理しておき，CirlcleCI内でデコードするようにすれば，envファイルを安全に複製できる．ここで出力している環境変数は，以下のリンクを参考にせよ

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_language_object_oriented_js_framework_nuxtjs.html

```bash
$ cat .env | base64

******************* # 表示されるエンコード値をProject変数として管理
*******************
```

```yaml
jobs:
  build
    docker:
      - image: circleci/python:3.8-node
    steps:
      - checkout
      - run:
          name: Make env file
          command: |
            # エンコード値をデコードし，.envファイルを複製
            echo $ENV_FILE | base64 -di > .env
       - run:
           name: Install node module
           commands: |
             yarn install
       - run: 
           name: Generate nuxt-ts
           commands: |
             yarn nuxt-ts generate
```

<br>

### Bashレベル

#### ・commandキーによる設定

一番参照範囲が小さく，```run```における同じ```command```内のみで参照できる．```command```内で用いる環境変数を定義するためには，『```$BASH_ENV```』に```export```処理を格納する必要がある．定義したものを用いるためには，『```$BASH_ENV```』を```source```で読み込む必要があるために注意する．

参考：https://circleci.com/docs/ja/2.0/env-vars/#%E3%82%B7%E3%82%A7%E3%83%AB-%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E3%81%A7%E3%81%AE%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0%E3%81%AE%E8%A8%AD%E5%AE%9A

**＊実装例＊**

```yaml
version: 2.1 

jobs:
  build:
    docker:
      - image: smaant/lein-flyway:2.7.1-4.0.3
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD
    steps:
      - run:
          name: Update PATH and Define Environment Variable at Runtime
          command: |
            echo "export PATH=/path/to/foo/bin:$PATH" >> $BASH_ENV
            echo "export VERY_IMPORTANT=$(cat important_value)" >> $BASH_ENV
            source $BASH_ENV
            echo "$PATH"
            echo "$VERY_IMPORTANT"
```

CircleCIでは```run```を実行する時に『```$BASH_ENV```』が```source```で自動的に読み込まれるようになっている．そのため，『```$BASH_ENV```』は複数の```run```間』で共有できる．ただし，Alpineベースのイメージでは，この共有機能を使えないため注意する（かなりたくさんある）．

参考：https://github.com/circleci/circleci-docs/issues/1650

```yaml
version: 2.1 

jobs:
  build:
    docker:
      - image: smaant/lein-flyway:2.7.1-4.0.3
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD
    steps:
      - run:
          name: Update PATH and Define Environment Variable at Runtime
          command: |
            echo "export PATH=/path/to/foo/bin:$PATH" >> $BASH_ENV
            echo "export VERY_IMPORTANT=$(cat important_value)" >> $BASH_ENV
      - run:
          name: Echo # BASH_ENVが自動的に読み込まれる．
          command: |
            echo "$PATH"
            echo "$VERY_IMPORTANT"     
```

#### ・シェルスクリプトによる設定

環境変数に値を設定する処理をシェルスクリプトに切り分け，環境変数を用いる前にこれを読み込む．

**＊実装例＊**

```yaml
version: 2.1 

jobs:
  build:
    docker:
      - image: smaant/lein-flyway:2.7.1-4.0.3
        auth:
          username: mydockerhub-user
          password: $DOCKERHUB_PASSWORD
    steps:
      - run:
          name: Update PATH and Define Environment Variable at Runtime
          command: |
            source export_envs.sh
            echo "$PATH"
            echo "$VERY_IMPORTANT"
```

```bash
#!/bin/bash

set -xeuo pipefail

echo "export PATH=/path/to/foo/bin:$PATH" >> $BASH_ENV
echo "export VERY_IMPORTANT=$(cat important_value)" >> $BASH_ENV

# 環境変数を出力します．
source $BASH_ENV
```

#### ・ヒアドキュメントで作成したシェルスクリプトによる設定

ヒアドキュメントを用いて，環境変数を設定できるシェルスクリプトを作成し，これを読み込む．ヒアドキュメントでは，各行でechoが実行される．そのため，echoの実装が不要であることに注意する．

**＊実装例＊**

```bash
cat << EOF > "export_envs.sh"
#!/bin/bash
set -xeuo pipefail
"export PATH=/path/to/foo/bin:$PATH" >> $BASH_ENV
"export VERY_IMPORTANT=$(cat important_value)" >> $BASH_ENV
source $BASH_ENV
EOF
```

<br>

### Containerレベル

Bashレベルより参照範囲が大きく，```job```内のみで参照できる．```environment```を```image```と同じ階層で定義する．

```yaml
version: 2.1

jobs:
  build:
    docker:
      - image: postgres:9.4.1
        # imageと同じ階層で定義（）
        environment:
          POSTGRES_USER: root
```

<br>

### Projectレベル

Containerレベルより参照範囲が大きく，プロジェクト内，すなわちリポジトリ内のみで参照できる．Environment Variables機能を用いる．環境変数の値が４文字未満，または環境変数の値が `true`，`True`，`false`，`False` のいずれかの場合，CircleCIの処理で出力されるプロジェクトの環境変数はマスキングされないため，注意が必要である．

<br>

### Grobalレベル

Projectレベルより参照範囲が大きく，異なるプロジェクト間，すなわちリポジトリ間で参照できる．Contexts機能を用いる．

<br>

## 02-08. Docker Compose in CircleCI

### docker-composeのインストール

#### ・dockerタイプの場合

自分でdocker-composeをインストールする必要がある．実行環境としてのdockerコンテナと，ビルドしたdockerコンテナが入れ子にならないように，```setup_remote_docker```を実行する必要がある．ただし，ボリュームマウントを使用できなくなるので注意する．

```yaml
version: 2.1

jobs:
  build:
    machine:
      image: circleci/classic:edge
    steps:
      - checkout
      - setup_remote_docker
      - run:
          name: Install Docker Compose
          command: |
            set -x
            curl -L https://github.com/docker/compose/releases/download/1.11.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
      - run:
          name: docker-compose up
          command: |
            set -x
            docker-compose up --build -d
```

#### ・machineタイプの場合（推奨）

実行環境にmachineタイプを選択した場合，すでにdocker-composeがインストールされている．

参考：https://circleci.com/docs/ja/2.0/configuration-reference/#%E4%BD%BF%E7%94%A8%E5%8F%AF%E8%83%BD%E3%81%AA-machine-%E3%82%A4%E3%83%A1%E3%83%BC%E3%82%B8

<br>

### docker-compose & dockerize

#### ・docker/install-dockerize

CircleCIでDocker Composeを用いる場合に必要である．Docker Composeは，コンテナの構築の順番を制御できるものの，コンテナ内のプロセスの状態を気にしない．そのため，コンテナの構築後に，プロセスが完全に起動していないのにも関わらず，次のコンテナの構築を開始してしまう．これにより，プロセスが完全に起動していないコンテナに対して，次に構築されたコンテナが接続処理を行ってしまうことがある．これを防ぐために，プロセスの起動を待機してから，接続処理を行うようにする．dockerizeの代わりの方法として，sleepコマンドを用いても良い．

参考：https://github.com/docker/compose/issues/374#issuecomment-126312313

**＊実装例＊**

LaravelコンテナとMySQLコンテナの場合を示す．コンテナ内に対してコマンドを実行する時のディレクトリは，Dockerfileの```WORKDIR```によって決まるので注意する．

```yaml
version: 2.1

orbs:
  docker: circleci/docker@x.y.z

commands:
  restore_vendor:
    steps:
      - restore_cache:
          key:
            - v1-dependecies-{{ checksum composer.json }}
            - v1-dependencies-
            
  save_vendor:
    steps:
      - save_cache:
          key: v1-dependecies-{{ checksum composer.json }}
          paths:
            - /vendor
            
jobs:
  build_and_test:
    # Docker Composeの時はmachineタイプを用いる
    machine:
      image: ubuntu-1604:201903-01
    steps:
      - checkout
      - run:
          name: Make env file
          command: |
            echo $ENV | base64 --decode > .env
      - run:
          name: Make env docker file
          command: |
            cp .env.docker.example .env.docker
      - run:
          name: Docker config
          command: |
            docker-compose config
      - run:
          name: Docker compose up
          command: |
            set -xe
            docker network create foo-network
            docker-compose up --build -d
      - restore_vendor
      # dockerコンテナに対してcomspoerコマンドを送信
      - run:
          name: Composer install
          command: |
            docker-compose exec laravel-container composer install -n --prefer-dist
      - save_vendor
      # Dockerizeをインストール
      - docker/install-dockerize:
          version: v0.6.1   
      - run:
          name: Wait for MySQL to be ready
          command: |
            # 代わりにsleepコマンドでも良い．
            dockerize -wait tcp://localhost:3306 -timeout 1m
      # dockerコンテナに対してマイグレーションコマンドを送信
      - run:
          name: Run artisan migration
          command: |
            docker-compose exec laravel-container php artisan migrate --force
      # dockerコンテナに対してPHP-Unitコマンドを送信
      - run:
          name: Run unit test
          command: |
            dockercompose exec laravel-container ./vendor/bin/phpunit
      # dockerコンテナに対してPHP-Stanコマンドを送信  
      - run:
          name: Run static test
          command: |
            docker-compose exec laravel-container ./vendor/bin/phpstan analyse --memory-limit=512M
```

<br>

### DLC：Docker Layer Cache

#### ・DLCとは

CircleCIでdockerイメージをビルドした後，各イメージレイヤーのキャッシュをDLCボリュームに作成する．そして，次回以降のビルド時に，差分がないイメージレイヤーをDLCボリュームからプルして再利用する．これにより，dockerイメージのビルド時間を短縮できる．

![DockerLayerCache](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/DockerLayerCache.png)

#### ・使用例

machineタイプで用いる場合，machineキーの下で```docker_layer_caching```を用いる．

**＊実装例＊**

```yaml
version: 2.1

orbs:
  docker: circleci/docker@x.y.z
            
jobs:
  build_and_test:
    # Docker Composeの時はmachineタイプを用いる
    machine:
      image: ubuntu-1604:201903-01
      # DLCを有効化
      docker_layer_caching: true
    steps:
      - checkout
      - run:
          name: Make env file
          command: |
            echo $ENV_TESTING | base64 --decode > .env
      - run:
          name: Make env docker file
          command: |
            cp .env.docker.example .env.docker
      - run:
          name: Docker compose up
          command: |
            set -xe
            docker network create foo-network
            docker-compose up --build -d
```

dockerタイプで用いる場合，dockerキーの下で```docker_layer_caching```を用いる．

**＊実装例＊**

```yaml
version: 2.1

jobs:
  build_and_push:
    executor: docker/docker
    steps:
      - setup_remote_docker
          # DLCを有効化
          docker_layer_caching: true
      - checkout
      - docker/check
      - docker/build:
          image: <ユーザー名>/<リポジトリ名>
      - docker/push:
          image: <ユーザー名>/<リポジトリ名>
```

<br>


## 09. CircleCIライブラリ

### orbs

#### ・orbsとは

CircleCIから提供される汎用的なパッケージの使用を読み込む．

**＊実装例＊**

```yaml
version: 2.1

orbs:
    hello: circleci/hello-build@0.0.5
    
workflows:
    "Hello Workflow":
        jobs:
          - hello/hello-build
```

#### ・jobs，commands，executors

| 構造      | 説明                                                         |
| --------- | ------------------------------------------------------------ |
| jobs      | workflowsにて，Orbsから```job```として使用できる．           |
| commands  | ```job```にて，```step```として使用できる．                  |
| executors | ```exexutor```にて，事前定義されたexecutorsとして使用できる． |

#### ・Orbsのデメリット

Orbsのパッケージの処理の最小単位は```step```である．そのため，```step```よりも小さい```run```はOrbsに組み込むことができず，```run```固有のオプションや```run```に設定できるlinuxコマンドをOrbsでは使用できないことになる．

#### ・オプションへの引数の渡し方と注意点

AWS認証情報は，CircleCIのデフォルト名と同じ環境変数名で登録しておけば，オプションで渡さなくとも，自動で入力してくれる．オプションが```env_var_name```型は，基本的に全てのスコープレベルの環境変数を受け付ける．ただしAlpineベースのイメージでは，『```$BASH_ENV```』を用いて，複数の```run```間で環境変数を共有できず，orbsのステップに環境変数を渡せないため注意する．

参考：https://github.com/circleci/circleci-docs/issues/1650

**＊実装例＊**

```yaml
version: 2.1

orbs:
  aws-foo: circleci/aws-foo@x.y.z

jobs:
  foo_bar_baz:
    docker:
      - image: circleci/python:x.y.z
    steps:
      - attach_workspace:
          at: .
      - setup_remote_docker:
      - aws-cli/install
      - aws-cli/setup
      - aws-foo/foo-bar-baz:
          # デフォルト名であれば，記述しなくても自動的に入力してくれる．
          account-url: $AWS_ECR_ACCOUNT_URL_ENV_VAR_NAME
          aws-access-key-id: $ACCESS_KEY_ID_ENV_VAR_NAME
          aws-secret-access-key: $SECRET_ACCESS_KEY_ENV_VAR_NAME
          region: $AWS_REGION_ENV_VAR_NAME
```

<br>

## 09-02. aws-cli

### commands

#### ・install

aws-cliコマンドのインストールを行う．

#### ・setup

aws-cliコマンドのインストールと，Credentials情報の設定を行う．AWSリソースを操作するために用いる．

**＊実装例＊**

CloudFrontに保存されているキャッシュを削除する．フロントエンドをデプロイしたとしても，CloudFrontに保存されているキャッシュを削除しない限り，キャッシュがHitしたユーザーには過去のファイルがレスポンスされてしまう．そのため，S3へのデプロイ後に，キャッシュを削除する必要がある．

```yaml
version: 2.1

orbs:
  aws-cli: circleci/aws-cli@1.3.1

jobs:
  cloudfront_create_invalidation:
    docker:
      - image: cimg/python:3.9-node
    steps:
      - checkout
      - aws-cli/setup
      - run:
          name: Run create invalidation
          command: |
            echo $AWS_CLOUDFRONT_ID |
            base64 --decode |
            aws cloudfront create-invalidation --distribution-id $AWS_CLOUDFRONT_ID --paths "/*"
            
workflows:
  # ステージング環境にデプロイ
  develop:
    jobs:
      # 直前に承認ジョブを挿入する
      - hold:
          name: hold_create_invalidation_stg
          type: approval
      - cloudfront_create_invalidation:
          name: cloudfront_create_invalidation_stg
          filters:
            branches:
              only:
                - develop
                
  # 本番環境にデプロイ                
  main:
    jobs:
      # 直前に承認ジョブを挿入する
      - hold:
          name: hold_create_invalidation_prd
          type: approval    
      - cloudfront_create_invalidation:
          name: cloudfront_create_invalidation_prd
          filters:
            branches:
              only:
                - main   
```

ただし，```credentials```ファイルの作成では，orbsを用いない方がより簡潔に条件分岐を実装できるかもしれない．

```bash
#!/bin/bash

set -xeuo pipefail

case "$APP_ENV" in
    "stg")
        AWS_ACCESS_KEY_ID=$STG_AWS_ACCESS_KEY_ID
        AWS_SECRET_ACCESS_KEY=$STG_AWS_SECRET_ACCESS_KEY
    ;;
    "prd")
        AWS_ACCESS_KEY_ID="$PRD_AWS_ACCESS_KEY_ID"
        AWS_SECRET_ACCESS_KEY="$PRD_AWS_SECRET_ACCESS_KEY"
    ;;
    *)
        echo "The parameter ${APP_ENV} is invalid."
        exit 1
    ;;
esac

# defaultプロファイルにクレデンシャル情報を設定する．
aws configure << EOF
$(echo $AWS_ACCESS_KEY_ID)
$(echo $AWS_SECRET_ACCESS_KEY)
$(echo $AWS_DEFAULT_REGION)
json
EOF

# 正しく設定されたかを確認する．
aws configure list
```

<br>

## 09-03. aws-ecr

### jobs

#### ・build-and-push-image

CircleCIコンテナでdockerイメージをビルドし，ECRにデプロイする．```remote-docker-layer-caching```を用いて，Docker Layer Cacheを有効化できる．

**＊実装例＊**

```yaml
version: 2.1

orbs:
  aws-cli: circleci/aws-cli@1.3.1
  aws-ecr: circleci/aws-ecr@6.15.2

jobs:
  aws-ecr/build-and-push-image:
    name: ecr_build_and_push_image
    # Docker Layer Cacheを用いるかどうか（有料）
    remote-docker-layer-caching: true
    # リポジトリがない時に作成するかどうか．
    create-repo: true
    no-output-timeout: 20m
    # projectを作業ディレクトリとした時の相対パス
    dockerfile: ./infra/docker/Dockerfile
    path: "."
    profile-name: myProfileName
    repo: "{$SERVICE}-repository"
    # CircleCIのハッシュ値によるバージョニング
    tag: $CIRCLE_SHA1
    # job内にて，attach_workspaceステップを実行．
    attach-workspace: true
    # attach_workspaceステップ実行時のrootディレクトリ
    workspace-root: <ディレクトリ名>
```

<br>

## 09-04. aws-ecs

### jobs

#### ・deploy-update-service（ローリングアップデート使用時）

ECRイメージを用いて，新しいリビジョン番号のタスク定義を作成し，またこれを用いてコンテナをデプロイする．

| 設定値                             | 説明                                                         |                                                              |
| ---------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ```container-image-name-updates``` | コンテナ定義のコンテナ名とイメージタグを上書きする．         | イメージはCircleCIのハッシュ値でタグ付けしているので必須．   |
| ``` verify-revision-is-deployed``` | ローリングアップデートのタスクがタスク定義のタスク必要数に合致したかを継続的に監視する． | 例えば，タスクが『Runnning』にならずに『Stopped』になってしまう場合や，既存のタスクが『Stopped』にならずに『Running』のままになってしまう場合，この状態はタスクの必要数に合致しないので，検知できる． |
| ```max-poll-attempts```            | ポーリングの最大試行回数を設定する．```poll-interval```と掛け合わせて，そう実行時間を定義できる． | 総実行時間を延長する時，間隔秒数はできるだけ短い方が無駄な実行時間が発生しないため，最大回数を増やす． |
| ```poll-interval```                | 試行の間隔秒数を設定する．```max-poll-attempts```と掛け合わせて，そう実行時間を定義できる． |                                                              |

オプションを用いて，```max-poll-attempts```（ポーリングの最大試行回数）と```poll-interval```（試行の間隔秒数）で，ポーリングの総実行時間を定義できる．

参考：https://circleci.com/docs/ja/2.0/ecs-ecr/#deploy-the-new-docker-image-to-an-existing-aws-ecs-service

**＊実装例＊**

```yaml
version: 2.1

orbs:
  aws-cli: circleci/aws-cli@1.3.1
  aws-ecs: circleci/aws-ecs@2.2.1
  
jobs:
  aws-ecs/deploy-update-service:
    name: ecs_update_service_by_rolling_update
    # タスク定義名を指定
    family: "${SERVICE}-ecs-task-definition"
    # ECSクラスター名を指定
    cluster-name: "${SERVICE}-cluster"
    # サービス名を指定
    service-name: "${SERVICE}-service"
    # コンテナ定義のコンテナ名とイメージタグを上書き．イメージはCircleCIのハッシュ値でタグ付けしているので必須．
    container-image-name-updates: "container=laravel,tag=${CIRCLE_SHA1},container=nginx,tag=${CIRCLE_SHA1}"
    # タスク定義に基づくタスク数の監視
    verify-revision-is-deployed: true
    # 監視の試行回数
    max-poll-attempts: 30
    # 試行の間隔
    poll-interval: 20
          
workflows:
  # ステージング環境にデプロイ
  develop:
    jobs:
      - ecs_update_service_by_rolling_update:
          name: ecs_update_service_by_rolling_update_stg
          filters:
            branches:
              only:
                - develop
                
  # 本番環境にデプロイ                
  main:
    jobs:
      - ecs_update_service_by_rolling_update:
          name: ecs_update_service_by_rolling_update_production
          filters:
            branches:
              only:
                - main               
          
```

#### ・deploy-update-service（ブルー/グリーンデプロイメント使用時）

ECSタスク定義を更新する．さらに，ブルー/グリーンデプロイメントがそのタスク定義を指定し，ECSサービスを更新する．ローリングアップデートと同様にして，``` verify-revision-is-deployed```オプションを使用できる．

**＊実装例＊**

```yaml
version: 2.1

orbs:
  aws-cli: circleci/aws-cli@1.3.1
  aws-ecs: circleci/aws-ecs@2.2.1
  
jobs:
  aws-ecs/deploy-update-service:
    name: ecs_update_service_by_code_deploy
    # タスク定義名を指定
    family: "${SERVICE}-ecs-task-definition"
    # ECSクラスター名を指定
    cluster-name: "${SERVICE}-cluster"
    # サービス名を指定
    service-name: "${SERVICE}-service"
    # CodeDeployにおけるデプロイの作成を設定
    deployment-controller: CODE_DEPLOY
    codedeploy-application-name: $SERVICE
    codedeploy-deployment-group-name: "${SERVICE}-deployment-group"
    codedeploy-load-balanced-container-name: www-container
    codedeploy-load-balanced-container-port: 80
    # コンテナ名とイメージタグを指定．イメージはCircleCIのハッシュ値でタグ付けしているので必須．
    container-image-name-updates: "container=laravel,tag=${CIRCLE_SHA1},container=nginx,tag=${CIRCLE_SHA1}"
    # サービス更新後のタスク監視
    verify-revision-is-deployed: true
          
workflows:
  # ステージング環境にデプロイ
  develop:
    jobs:
      - ecs_update_service_by_code_deploy:
          name: ecs_update_service_by_code_deploy_stg
          filters:
            branches:
              only:
                - develop
                
  # 本番環境にデプロイ                
  main:
    jobs:
      - ecs_update_service_by_code_deploy:
          name: ecs_update_service_by_code_deploy_production
          filters:
            branches:
              only:
                - main       
```

#### ・run-task

現在起動中のECSタスクとは別に，新しいタスクを一時的に起動する．起動時に，```overrides```オプションを用いて，指定したタスク定義のコンテナ設定を上書きできる．正規表現で設定する必要があり，さらにJSONでは『```\```』を『```\\```』にエスケープしなければならない．コマンドが実行された後に，タスクは自動的にStopped状態になる．

上書きできるキーの参照リンク：https://docs.aws.amazon.com/cli/latest/reference/ecs/run-task.html

**＊実装例＊**

例えば，データベースに対してマイグレーションを実行するためのECSタスクを起動する．```overrides```オプションでコンテナ定義のコマンドを上書きする．

```yaml
version: 2.1

orbs:
  aws-cli: circleci/aws-cli@1.3.1
  aws-ecs: circleci/aws-ecs@2.2.1

jobs:
  aws-ecs/run-task:
    name: ecs_run_task_for_migration
    cluster: "${SERVICE}-ecs-cluster"
    # LATESTとするとその時点の最新バージョンを自動で割り振られてしまう．
    platform-version: 1.4.0
    awsvpc: true
    launch-type: FARGATE
    subnet-ids: $AWS_SUBNET_IDS
    security-group-ids: $AWS_SECURITY_GROUPS
    # タスク定義名．最新リビジョン番号が自動補完される．
    task-definition: "${SERVICE}-ecs-task-definition"
    # タスク起動時にマイグレーションコマンドを実行するように，Laravelコンテナの　commandキーを上書き
    overrides: "{\\\"containerOverrides\\\":[{\\\"name\\\": \\\"laravel-container\\\",\\\"command\\\": [\\\"php\\\", \\\"artisan\\\", \\\"migrate\\\", \\\"--force\\\"]}]}"
          
workflows:
  # ステージング環境にデプロイ
  develop:
    jobs:
      - ecs_run_task_for_migration:
          name: ecs_run_task_for_migration_stg
          filters:
            branches:
              only:
                - develop
                
  # 本番環境にデプロイ                
  main:
    jobs:
      - ecs_run_task_for_migration:
          name: ecs_run_task_for_migration_production
          filters:
            branches:
              only:
                - main
```

<br>

## 09-05. aws-code-deploy

### jobs

#### ・deploy

S3にコードとappspecファイルをデプロイできる．また，CodeDeployを用いて，これをEC2インスタンスにデプロイできる．

**＊実装例＊**

```yaml
version: 2.1

orbs:
  aws-code-deploy: circleci/aws-code-deploy@1.0.1

jobs:
  aws-code-deploy/deploy:
    name: code_deploy
    application-name: $SERVICE}
    # appspecファイルを保存するバケット名
    bundle-bucket: "${SERVICE}-bucket"
    # appspecファイルのあるフォルダ
    bundle-source: ./infra/aws_codedeploy
    # appspecファイルをzipフォルダで保存
    bundle-type: zip
    # zipフォルダ名
    bundle-key: foo-bundle
    deployment-config: CodeDeployDefault.ECSAllAtOnce
    deployment-group: "${SERVICE}-deployment-group"
    # ECSにアクセスできるCodeDeployサービスロール
    service-role-arn: $CODE_DEPLOY_ROLE_FOR_ECS
 
workflows:
  # ステージング環境にデプロイ
  develop:
    jobs:
      - code_deploy:
          name: code_deploy_stg
          filters:
            branches:
              only:
                - develop
                
  # 本番環境にデプロイ                
  main:
    jobs:
      - code_deploy:
          name: code_deploy_production
          filters:
            branches:
              only:
                - main
```

<br>

## 09-06. slack

### commands

#### ・notify

ジョブの終了時に，成功または失敗を基に，ステータスを通知する．ジョブの最後のステップとして設定しなければならない．

```yaml
version: 2.1

orbs:
  slack: circleci/slack@4.1

commands:
  # 他のジョブ内で使用できるようにcommandとして定義
  notify_of_failure:
    steps:
      - slack/notify:
          event: fail
          template: basic_fail_1

jobs:
  deploy:
    steps:
    # ～ 中略 ～

workflows:
  # ステージング環境にデプロイ
  develop:
    jobs:
      - deploy:
          name: deploy_stg
          filters:
            branches:
              only:
                - develop
          # 失敗時に通知
          post-steps:
            - notify_of_failure:
            
  # 本番環境にデプロイ                
  main:
    jobs:
      - deploy:
          name: deploy_production
          filters:
            branches:
              only:
                - main
          # 失敗時に通知
          post-steps:
            - notify_of_failure:
```

