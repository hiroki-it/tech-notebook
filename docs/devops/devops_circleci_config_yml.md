---
title: 【IT技術の知見】config.yml@CircleCI
description: config.yml@CircleCIの知見を記録しています。
---

# config.yml@CircleCI

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/index.html

<br>

## 01. version

### versionとは

CircleCIのバージョンを宣言。

**＊実装例＊**

```yaml
version: 2.1
```

<br>

## 02. parameters

### parameters

#### ▼ parametersとは

| パラメーター名      | 参照範囲                                                     | 値を設定する場所 |
| ------------------- | ------------------------------------------------------------ | ---------------- |
| command parameters  | ```command```キー内で定義する。定義された```command```キー内のみで定義できる。 | ```workflows```  |
| job parameters      | ```jobs```キー内で定義する。定義された```jobs```キー内のみで参照できる。 | ```workflows```  |
| executors parameter | ```executors```内で定義する。定義された```executos```内のみで参照できる。 | ```job```        |
| pipeline parameters | トップレベルで定義する。リポジトリ内でのみ参照できる。       | ```workflows```  |

<br>

### command parameters

#### ▼ 値の出力方法

引数名を使用して、```parameters```から値を出力する。

```yaml
<< parameters.foo >>
```

#### ▼ job parameterを参照

定義できるデータ型は、job parameterと同じ。定義された```command```キー内のみで定義できる。

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

#### ▼ 値の出力方法

引数名を使用して、```parameters```から値を出力する。

```
<< parameters.foo >>
```

#### ▼ デフォルト値について

引数が与えられなかった場合に適用される```default```を設定できる。```default```を設定しない場合、引数が必須と見なされる。

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

#### ▼ string型

引数として、任意の文字列を渡したい時に使用する。```workflows```にて、値を設定する。

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
          # workflowにてstring型の値を設定
          file: test.txt
```

#### ▼ boolean型

多くの場合、引数がTrueの場合のみ、特定の```steps```キーを実行したい時に使用する。```job```で定義した後、```workflows```にて値を設定する。```workflows```にて、値を設定する。

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
          # workflowにてboolean型の値を設定
          custom_checkout: true
```

#### ▼ enum型

引数として、特定の文字列や整数のみを渡したい時に使用する。```workflows```にて、値を設定する。

**＊実装例＊**

```yaml
version: 2.1

jobs:
  deploy:
    parameters:
      # 引数を定義
      environment:
        # デフォルト値
        default: "tes"
        type: enum
        enum: ["tes", "stg", "prd"]
    steps:
      - run:
        # デフォルト値testを与える時は何も設定しない
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

#### ▼ 値の出力方法

引数名を使用して、```parameters```から値を出力する。

```
<< parameters.foo >>
```

#### ▼ job parametersを参照

引数として、任意の文字列を```executors```に渡したい時に使用する。他のparametersとは異なり、```job```にて、値を設定する。

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
      # jobにてstring型の値を設定
      myspecialvar: "myspecialvalue"
```

#### ▼ workflowで値を設定する

公式リファレンスには載っていないため、方法としては非推奨。```parameter```を渡したい```executor```を使いまわしたい時に使用する。

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
           # jobにてexecutor名を設定し、加えてexecutorに値を渡す
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

#### ▼ 値の出力方法

引数名を使用して、```pipeline.parameters```から値を出力する。

```
<< pipeline.parameters.foo >>
```

#### ▼ job parametersを参照

定義できるデータ型は、job parameterと同じ。リポジトリ内でのみ参照できる。

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

## 03. jobs

### jobs

#### ▼ jobsとは

複数の```job```を定義する。workflowsを使用しない場合は、少なくとも```1```個の```job```には```build```という名前を使用しなければならない。

#### ▼ jobの粒度

![CICDパイプライン](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/CICDパイプライン.png)

| 粒度   | 説明                                  | 備考                                                       |
| ------ |-------------------------------------| ---------------------------------------------------------- |
| build  | プログラムの実行環境を作成する。                    | buildとtestを分割しにくい場合は、同じjobで定義しても良い。 |
| test   | 種々のテスト（Unitテスト、Functionalテスト、など）を実行する。 |                                                            |
| deploy | ステージング環境または本番環境にデプロイする。             |                                                            |

<br>

### docker、machine

#### ▼ 仮想環境の選択

jobを実行する仮想環境を選択できる。

#### ▼ dockerタイプとは

コンテナを実行環境として設定する。これを選択したうえで、コンテナイメージのビルド（Docker composeを含む）を実行する場合、実行環境コンテナの中でコンテナを作成するという入れ子構造になる。これは非推奨のため、```setup_remote_docker```を使用して、実行環境コンテナとは別の環境で```jobs```キーを行う必要がある。また、```docker```コマンドがプリインストールされていないイメージであった場合、```setup_remote_docker```を有効化すると、これを使用できるようになる。```machine```タイプを選択した場合、```setup_remote_docker```は不要である。ただし、ボリュームマウントを使用できなくなるので注意する。また、DockerfileのCOPYコマンドが動作しなくなる。

> ℹ️ 参考：https://circleci.com/docs/ja/2.0/building-docker-images/

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
     # コンテナが入れ子にならないようにする。
     - setup_remote_docker
     - run: | # DockerHubに対するログイン
         echo "$DOCKER_PASS" | docker login --username $DOCKER_USER --password-stdin
         docker run -d --name db company/proprietary-db:1.2.3

     # コンテナイメージのビルド
     - run: docker build -t company/app:$CIRCLE_BRANCH .

     # コンテナイメージのDockerHubに対するデプロイ
     - run: docker push company/app:$CIRCLE_BRANCH
```

#### ▼ machineタイプとは

Linuxサーバーを実行環境として設定する。

![machine_executor](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/machine_executor.png)

**＊実装例＊**

```yaml
version: 2.1

jobs:
 build:
   machine: true
   steps:
     - checkout
     - run: | # DockerHubに対するログイン
         echo "$DOCKER_PASS" | docker login --username $DOCKER_USER --password-stdin
         docker run -d --name db company/proprietary-db:1.2.3

     # コンテナイメージのビルド
     - run: docker build -t company/app:$CIRCLE_BRANCH .

     # コンテナイメージのDockerHubに対するデプロイ
     - run: docker push company/app:$CIRCLE_BRANCH
```

<br>

### resource_class

CircleCIの実行環境のスペックを設定する。Workflow間のキャッシュの使い回しと同様にして、ビルドの完了までの速さを改善できる。

> ℹ️ 参考：https://circleci.com/docs/ja/configuration-reference#resourceclass

```yaml
version: 2.1

jobs:
 build:
   docker:
     - image: circleci/foo
   resource_class: xlarge # vCPU 8、RAM 16GB
```

<br>

### steps

#### ▼ stepsとは

処理をmap型で定義する。

#### ▼ when、unless

if文を定義する。```when```キーでは条件がtrueの場合、また```unless```キーではfalseの場合に実行する```steps```キーを定義する。

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

#### ▼ restore_cache、save_cache

![CircleCIキャッシュ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/CircleCIキャッシュ.png)

Workflow間で使いまわせるキャッシュを作成する。```resource_class```キーによる実行環境のスペック設定と同様にして、ビルドの完了までの速さを改善できる。これを使用しない場合、例えば、CircleCIコンテナで```composer install```を実行すると、毎回のworkflowで同じパッケージがインストールされる。しかし、workflowのたびに、パッケージをインストールするのは非効率である。そこで、```composer.json```ファイルの実装が変更されない限り、前回のworkflowのビルド時に、vendorディレクトリ配下に配置されたアーティファクトを再利用する。この能力は、複数のworkflowの間だけでなく、```1```個のworkflowの中でも利用できる。

> ℹ️ 参考：https://circleci.com/docs/ja/2.0/caching/#%E3%83%A9%E3%82%A4%E3%83%96%E3%83%A9%E3%83%AA%E3%81%AE%E3%82%AD%E3%83%A3%E3%83%83%E3%82%B7%E3%83%A5

**＊実装例＊**

Composerを使用してパッケージをインストールする時に、前回の結果を再利用する。

```yaml
version: 2.1

jobs:
  build:
    steps:
      # composer.jsonが変更されている場合は処理をスキップ。
      - restore_cache:
          key:
            - v1-dependecies-{{ checksum "composer.json" }}
            - v1-dependencies-
      # 取得したcomposer.jsonを元に、差分のvendorをインストール
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

yarnを使用してパッケージをインストールする時に、前回の結果を再利用する。

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

ただし、この能力はcommandsで共通化した方が可読性が良い。

**＊実装例＊**

```yaml
version: 2.1

commands:
  restore_vendor:
    steps:
      # composer.jsonの実装が変更されていない場合は処理をスキップ。
      - restore_cache:
          key:
            - v1-dependencies-{{ checksum "composer.json" }}
            - v1-dependencies-
       
  save_vendor:
    steps:
      # 最新のvendorを保存。
      - save_cache:
          key: v1-dependencies-{{ checksum "composer.json" }}
          paths:
            - ./vendor
            
jobs:
  build:
    steps:
      - restore_vendor
      # 取得したcomposer.jsonを元に、差分のvendorをインストール
      - run: 
          name: Run composer install
          commands: |
            composer install -n --prefer-dist
      - save_vendor
```

#### ▼ persist_to_workspace、attach_workspace

![workflow_workspace_cache](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/workflow_workspace_cache.png)

CircleCIでは、jobごとに異なる仮想環境が作成されるため、他の```jobs```キーで使用された一時ファイルを再利用したい場合、これを使用する。

**＊実装例＊**

```yaml
version: 2.1

jobs:
  jobA:
    steps:
    # Workspaceにファイルをアップロード
      - persist_to_workspace:
          # jobAにて、Workspaceとするディレクトリのroot
          root: /tmp/workspace
          # Rootディレクトリを基準とした相対パス（"./"以外の場合は、ディレクトリの作成が必要）
          # パラメーターは環境変数として出力できないので注意
          paths:
            - target/application.jar
            - build/*
  jobB:
    steps:
      # ディレクトリ配下
      - attach_workspace:
        # jobAとは異なるディレクトリ配下にファイルをダウンロードしてもよい
        at: /tmp/workspace
```

全てのディレクトリを保持するような場合がほとんどと思われるため、カレントディレクトリ配下（```.```）を指定するのが良い。

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

## 04. commands

### commandsとは

設定を部品化し、異なる```jobs```キーで```steps```キーとして繰り返し利用できる。

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

## 05. executors

### executors

#### ▼ executorsとは

実行環境に関する設定を部品化し、異なる```jobs```キーで繰り返し利用できる。

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

## 06. workflow

### workflowの粒度

#### ▼ ブランチ別

**＊実装例＊**

```yaml
workflows:
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

#### ▼ pre-steps、post-steps

事前に```jobs```キーに定義する必要はない。```workspace```キーで、コールされる```jobs```キーの引数として設定することにより、その```jobs```キー内の最初と最後に、```steps```キーを追加できる。

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

Orbsを使用する場合は、オプションに引数を渡す前に定義する。

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

#### ▼ filtersとは

コミットされた時に```jobs```キーが発火するブランチ名、あるいは発火しないブランチ名、を設定する。正規表現で実装する必要がある。

#### ▼ only、ignore

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

#### ▼ tags

タグをつけたコミットに対して発火する。```ignore```キーで全てのブランチを指定することにより、マージによる発火を防げる。

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

## 07. working_directory

処理を実行するディレクトリーを指定する。

> ℹ️ 参考：
>
> - https://www.engilaboo.com/circleci-working-directory/
> - https://nju33.com/notes/circleci/articles

| レベル        | 説明                                                         |
| ------------- | ------------------------------------------------------------ |
| job、executor | プロジェクトをチェックアウトするディレクトリを指定する。executorまたはjobでworking_directoryを宣言できる。両方で宣言していた場合は、executorの値が優先される。 |
| steps         | 指定したディレクトリーに移動する。                           |

<br>

## 08. 環境変数

### CircleCIにおける環境変数とは

#### ▼ 環境変数の出力可能

環境変数は基本的にシェルの実行時のみ使用でき、CircleCIのオプション値としては出力できない。ただし、```docker```キーだけは例外的に出力できる。

> ℹ️ 参考：https://circleci.com/docs/ja/2.0/env-vars/#using-parameters-and-bash-environment

```yaml
# 出力できない
working_directory: /go/src/github.com/$ORGNAME/$REPONAME
```

#### ▼ 環境変数の種類と参照範囲

レベルに応じて、出力できるシェルの範囲が異なる。

| 参照レベル | 方法                                        | 説明                                                         |
| ---------- | ------------------------------------------- | ------------------------------------------------------------ |
| Bash       | ```export```、```source```キー、```$BASH_ENV``` | ```run```キーにおける```command```キー内のシェルのみで参照できる。ただし、```$BASH_ENV```を使用すれば、異なる```commands```間で値を共有可能。 |
| Container  | ```environment```キー                           | ```jobs```キー内の特定のコンテナのシェルのみで参照できる。        |
| Job        | ```environment```キー                           | ```jobs```キー内のシェルのみで参照できる。                        |
| Project    | Environment Variables能力                   | リポジトリ内のシェルのみ参照できる。                         |
| Global     | Contexts能力                                | 異なるリポジトリ間のシェルで参照できる。                     |

#### ▼ 環境変数の出力方法

Linuxにおける環境変数の出力方法と同様である。また、文字列の中に値を出力する変数展開の場合、```${}```を使用する。

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

#### ▼ ```.env```ファイルの安全な複製方法

アプリケーションの```.env```ファイルをCircleCI内で使用したい時は、あらかじめエンコードされた環境変数をProject変数として管理しておき、CircleCI内でデコードするようにすれば、envファイルを安全に複製できる。

```bash
$ cat .env | base64

******************* # 表示されるbase64方式エンコード値をProject変数として管理
*******************
```

```yaml
jobs:
  build:
    docker:
      - image: circleci/python:3.8-node
    steps:
      - checkout
      - run:
          name: Make env file
          command: |
            # base64方式エンコード値をデコードし、.envファイルを複製
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

#### ▼ commandキーによる設定

一番参照範囲が小さく、```run```キーにおける同じ```command```キー内のみで参照できる。```command```キー内で使用する環境変数を定義するためには、『```$BASH_ENV```』に```export```コマンドを格納する必要がある。定義したものを使用するためには、『```$BASH_ENV```』を```source```キーで読み込む必要があるために注意する。

> ℹ️ 参考：https://circleci.com/docs/ja/2.0/env-vars/#%E3%82%B7%E3%82%A7%E3%83%AB-%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E3%81%A7%E3%81%AE%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0%E3%81%AE%E8%A8%AD%E5%AE%9A

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

CircleCIでは```run```キーを実行する時に『```$BASH_ENV```』が```source```キーで自動的に読み込まれるようになっている。そのため、『```$BASH_ENV```』は複数の```run```キー間』で共有できる。ただし、Alpine Linuxでは、この共有を使用できないため注意する（かなりたくさんある）。

> ℹ️ 参考：https://github.com/circleci/circleci-docs/issues/1650

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
          name: Echo # BASH_ENVが自動的に読み込まれる。
          command: |
            echo "$PATH"
            echo "$VERY_IMPORTANT"     
```

#### ▼ シェルスクリプトによる設定

環境変数に値を設定する処理をシェルスクリプトに切り分け、環境変数を使用する前にこれを読み込む。

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

# 環境変数を出力します。
source $BASH_ENV
```

#### ▼ ヒアドキュメントで作成したシェルスクリプトによる設定

ヒアドキュメントを使用して、環境変数を設定できるシェルスクリプトを作成し、これを読み込む。ヒアドキュメントでは、各行でechoが実行される。そのため、echoの実装が不要であることに注意する。

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

Bashレベルより参照範囲が大きく、```jobs```キー内のみで参照できる。```environment```キーを```image```キーと同じ階層で定義する。

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

Containerレベルより参照範囲が大きく、プロジェクト内、すなわちリポジトリ内のみで参照できる。Environment Variablesを使用する。環境変数の値が４文字未満、または環境変数の値が `true`、`True`、`false`、`False` のいずれかの場合、CircleCIの処理で出力されるプロジェクトの環境変数はマスキングされないため、注意が必要である。

<br>

### Grobalレベル

Projectレベルより参照範囲が大きく、異なるプロジェクト間、すなわちリポジトリ間で参照できる。Contextsを使用する。

<br>

## 09. Docker Compose in CircleCI

### docker-composeのインストール

#### ▼ dockerタイプの場合

自分でdocker-composeをインストールする必要がある。実行環境としてのコンテナと、ビルドしたコンテナが入れ子にならないように、```setup_remote_docker```を実行する必要がある。ただし、ボリュームマウントを使用できなくなるので注意する。

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

#### ▼ machineタイプの場合（推奨）

実行環境にmachineタイプを選択した場合、docker-composeがプリインストールされている。

> ℹ️ 参考：https://circleci.com/docs/ja/2.0/configuration-reference/#%E4%BD%BF%E7%94%A8%E5%8F%AF%E8%83%BD%E3%81%AA-machine-%E3%82%A4%E3%83%A1%E3%83%BC%E3%82%B8

<br>

### docker-compose & dockerize

#### ▼ docker/install-dockerize

CircleCIでDocker Composeを使用する場合に必要である。Docker Composeは、コンテナの作成の順番を制御できるものの、コンテナ内のプロセスの状態を気にしない。そのため、コンテナの作成後に、プロセスが完全に起動していないのにも関わらず、次のコンテナの作成を開始してしまう。これにより、プロセスが完全に起動していないコンテナに対して、次に作成されたコンテナが接続処理を行ってしまうことがある。これを防ぐために、プロセスの起動を待機してから、接続処理を行うようにする。代わりに、sleepコマンドを使用しても良い。

> ℹ️ 参考：https://github.com/docker/compose/issues/374#issuecomment-126312313

**＊実装例＊**

LaravelコンテナとMySQLコンテナの場合を示す。コンテナ内に対してコマンドを実行する時のディレクトリは、Dockerfileの```WORKDIR```によって決まるので注意する。

```yaml
version: 2.1

orbs:
  docker: circleci/docker@<バージョンタグ>

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
    # Docker Composeの時はmachineタイプを使用する
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
      # コンテナに対してcomspoerコマンドを送信
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
            # 代わりにsleepコマンドでも良い。
            dockerize -wait tcp://localhost:3306 -timeout 1m
      # コンテナに対してマイグレーションコマンドを送信
      - run:
          name: Run artisan migration
          command: |
            docker-compose exec laravel-container php artisan migrate --force
      # コンテナに対してPHP-Unitコマンドを送信
      - run:
          name: Run unit test
          command: |
            dockercompose exec laravel-container ./vendor/bin/phpunit
      # コンテナに対してPHP-Stanコマンドを送信  
      - run:
          name: Run static test
          command: |
            docker-compose exec laravel-container ./vendor/bin/phpstan analyse --memory-limit=512M
```

<br>

### DLC：Docker Layer Cache

#### ▼ DLCとは

CircleCIでコンテナイメージをビルドした後、各イメージレイヤーのキャッシュをDLCボリュームに作成する。そして、次回以降のビルド時に、差分がないイメージレイヤーをDLCボリュームからプルして再利用する。これにより、コンテナイメージのビルド時間を短縮できる。

![DockerLayerCache](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/DockerLayerCache.png)

#### ▼ 使用例

machineタイプで使用する場合、machineキーの下で```docker_layer_caching```を使用する。

**＊実装例＊**

```yaml
version: 2.1

orbs:
  docker: circleci/docker@<バージョンタグ>
            
jobs:
  build_and_test:
    # Docker Composeの時はmachineタイプを使用する
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

dockerタイプで使用する場合、dockerキーの下で```docker_layer_caching```を使用する。

**＊実装例＊**

```yaml
version: 2.1

jobs:
  build_and_push:
    executor: docker/docker
    steps:
      - setup_remote_docker:
          # DLCを有効化
          docker_layer_caching: true
      - checkout
      - docker/check
      - docker/build:
          image: <ユーザー名>/<イメージリポジトリ名>
      - docker/push:
          image: <ユーザー名>/<イメージリポジトリ名>
```

<br>
