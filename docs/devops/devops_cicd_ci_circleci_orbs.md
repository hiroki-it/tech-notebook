---
title: 【IT技術の知見】Orbs＠CircleCI
description: Orbs＠CircleCIの知見を記録しています。
---

# Orbs＠CircleCI

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Orbs

### Orbsとは

CircleCIから提供される汎用的なパッケージの使用を読み込む。

<br>

### 構成

#### ▼ オプション

| オプション名 | 説明                              |
| ------------ | --------------------------------- |
| jobs         | `job`キーに割り当てられる。       |
| commands     | `step`キーに割り当てられる。      |
| executors    | `executors`キーに割り当てられる。 |

#### ▼ Orbsのデメリット

Orbsのパッケージの処理の最小単位は`step`である。

そのため、`step`よりも小さい`run`はOrbsに組み込めず、`run`固有のオプションや`run`に設定できるlinuxコマンドをOrbsでは使用できないことになる。

#### ▼ オプションへの引数の渡し方と注意点

AWSの認証情報は、CircleCIのデフォルト名と同じ環境変数名で登録しておけば、オプションで渡さなくとも、自動的に入力してくれる。

オプションが`env_var_name`型は、基本的に全てのスコープレベルの環境変数を受け付ける。

ただしAlpine Linuxでは、『`$BASH_ENV`』を使用して、複数の`run`間で環境変数を共有できず、orbsのステップに環境変数を渡せないため注意する。

**＊実装例＊**

```yaml
version: 2.1

orbs:
  aws-foo: circleci/aws-foo@<バージョンタグ>

jobs:
  foo_bar_baz:
    docker:
      - image: circleci/python:1.0.0
    steps:
      - attach_workspace:
          at: .
      - setup_remote_docker:
      - aws-cli/install
      - aws-cli/setup
      - aws-foo/foo-bar-baz:
          # デフォルト名であれば、記述しなくても自動的に入力してくれる。
          account-url: $AWS_ECR_ACCOUNT_URL_ENV_VAR_NAME
          aws-access-key-id: $ACCESS_KEY_ID_ENV_VAR_NAME
          aws-secret-access-key: $SECRET_ACCESS_KEY_ENV_VAR_NAME
          region: $AWS_REGION_ENV_VAR_NAME
```

> - https://github.com/circleci/circleci-docs/issues/1650

<br>

## 02. aws-cli

### commands

#### ▼ insta

aws-cliコマンドのインストールを実行する。

#### ▼ setup

aws-cliコマンドのインストールと、Credentials情報の設定を実行する。

AWSリソースを操作するために使用する。

**＊実装例＊**

AWS CloudFrontに保管されているキャッシュを削除する。

フロントエンドアプリケーションをデプロイしたとしても、ダウンストリームのAWS CloudFrontに保管されているキャッシュを削除しない限り、キャッシュがHitしたユーザーには過去のファイルがレスポンスされてしまう。

そのため、S3へのデプロイ後に、AWS CloudFrontのキャッシュを削除する必要がある。

```yaml
version: 2.1

orbs:
  aws-cli: circleci/aws-cli@1.3.1

jobs:
  # AWS CloudFrontのキャッシュを削除する
  cloudfront_create_invalidation:
    docker:
      - image: cimg/python:3.9-node
    steps:
      - checkout
      - aws-cli/setup
      - run:
          name: Run create invalidation
          command: |
            echo $AWS_CLOUDFRONT_ID | base64 -d | aws cloudfront create-invalidation --distribution-id $AWS_CLOUDFRONT_ID --paths "/*"

workflows:
  # ステージング環境にデプロイ
  develop:
    jobs:
      # 直前に承認Jobを挿入する
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
      # 直前に承認Jobを挿入する
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

ただし、認証情報ファイルの作成では、orbsを使用しない方がより簡潔に条件分岐を実装できるかもしれない。

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

# defaultプロファイルに認証情報を設定する。
aws configure <<EOF
$(echo $AWS_ACCESS_KEY_ID)
$(echo $AWS_SECRET_ACCESS_KEY)
$(echo $AWS_DEFAULT_REGION)
json
EOF

# 正しく設定されたかを確認する。
aws configure list
```

> - https://zenn.dev/keita_hino/articles/a39e98b59b7afb
> - https://nshmura.com/posts/automate-cache-cleaning-of-cloudfront/

<br>

## 03. aws-ecr

### jobs

#### ▼ build-and-push-image

CircleCIコンテナでコンテナイメージをビルドし、ECRにデプロイする。`remote-docker-layer-caching`を使用して、Docker Layer Cacheを有効化できる。

**＊実装例＊**

```yaml
version: 2.1

orbs:
  aws-cli: circleci/aws-cli@1.3.1
  aws-ecr: circleci/aws-ecr@6.15.2

jobs:
  aws-ecr/build-and-push-image:
    name: ecr_build_and_push_image
    # Docker Layer Cacheを使用するか否か (有料)
    remote-docker-layer-caching: "true"
    # リポジトリがない時に作成するか否か。
    create-repo: "true"
    no-output-timeout: 20m
    # projectを作業ディレクトリとした時の相対パス
    dockerfile: ./infra/docker/Dockerfile
    path: "."
    profile-name: myProfileName
    repo: "{$SERVICE}-repository"
    # CircleCIのハッシュ値によるバージョニング
    # ハッシュ値だけでなく、プレフィクスに日付をつけてもよい。
    tag: $CIRCLE_SHA1
    # job内にて、attach_workspaceステップを実行。
    attach-workspace: "true"
    # attach_workspaceステップ実行時のrootディレクトリ
    workspace-root: <ディレクトリ名>
```

<br>

## 04. aws-ecs

### jobs

#### ▼ deploy-update-service (ローリングアップデート使用時)

ECRイメージを使用して、新しいリビジョン番号のAWS ECSタスク定義を作成し、加えてこれを使用してコンテナをデプロイする。

| 設定値                         | 説明                                                                                             |                                                                                                                                                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `container-image-name-updates` | コンテナ定義のコンテナ名とバージョンタグを上書きする。                                           | イメージはCircleCIのハッシュ値でタグ付けしているので必須。                                                                                                                                                                                  |
| `verify-revision-is-deployed`  | ローリングアップデートのAWS ECSタスクがAWS ECSタスク定義の必要数に合致したかを継続的に監視する。 | 例えば、AWS ECSタスクが『`Running`フェーズ』にならずに『Stoppedフェーズ』になってしまう場合や、既存のAWS ECSタスクが『Stopped』にならずに『Running』のままになってしまう場合、この状態はAWS ECSタスクの必要数に合致しないため、検知できる。 |
| `max-poll-attempts`            | ポーリングの最大試行回数を設定する。`poll-interval`と掛け合わせて、そう実行時間を定義できる。    | 総実行時間を延長する時、間隔秒数はできるだけ短い方が無駄な実行時間が発生しないため、最大回数を増やす。                                                                                                                                      |
| `poll-interval`                | 試行の間隔秒数を設定する。`max-poll-attempts`と掛け合わせて、そう実行時間を定義できる。          |                                                                                                                                                                                                                                             |

オプションを使用して、`max-poll-attempts` (ポーリングの最大試行回数) と`poll-interval` (試行の間隔秒数) で、ポーリングの総実行時間を定義できる。

> - https://circleci.com/docs/ja/2.0/ecs-ecr/#deploy-the-new-docker-image-to-an-existing-aws-ecs-service

**＊実装例＊**

```yaml
version: 2.1

orbs:
  aws-cli: circleci/aws-cli@1.3.1
  aws-ecs: circleci/aws-ecs@2.2.1

jobs:
  aws-ecs/deploy-update-service:
    name: ecs_update_service_by_rolling_update
    # AWS ECSタスク定義名を指定
    family: "${SERVICE}-ecs-task-definition"
    # AWS ECSクラスター名を指定
    cluster-name: "${SERVICE}-cluster"
    # サービス名を指定
    service-name: "${SERVICE}-service"
    # コンテナ定義のコンテナ名とバージョンタグを上書き。イメージはCircleCIのハッシュ値でタグ付けしているので必須。
    container-image-name-updates: "container=laravel,tag=${CIRCLE_SHA1},container=nginx,tag=${CIRCLE_SHA1}"
    # AWS ECSタスク定義に基づくAWS ECSタスク数の監視
    verify-revision-is-deployed: "true"
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

#### ▼ deploy-update-service (ブルー/グリーンデプロイメント使用時)

AWS ECSタスク定義を更新する。加えて、ブルー/グリーンデプロイメントがそのAWS ECSタスク定義を指定し、AWS ECSサービスを更新する。

ローリングアップデートと同様にして、`verify-revision-is-deployed`オプションを使用できる。

**＊実装例＊**

```yaml
version: 2.1

orbs:
  aws-cli: circleci/aws-cli@1.3.1
  aws-ecs: circleci/aws-ecs@2.2.1

jobs:
  aws-ecs/deploy-update-service:
    name: ecs_update_service_by_code_deploy
    # AWS ECSタスク定義名を指定
    family: "${SERVICE}-ecs-task-definition"
    # AWS ECSクラスター名を指定
    cluster-name: "${SERVICE}-cluster"
    # サービス名を指定
    service-name: "${SERVICE}-service"
    # CodeDeployにおけるデプロイの作成を設定
    deployment-controller: CODE_DEPLOY
    codedeploy-application-name: $SERVICE
    codedeploy-deployment-group-name: "${SERVICE}-deployment-group"
    codedeploy-load-balanced-container-name: www-container
    codedeploy-load-balanced-container-port: 80
    # コンテナ名とバージョンタグを指定。イメージはCircleCIのハッシュ値でタグ付けしているので必須。
    container-image-name-updates: "container=laravel,tag=${CIRCLE_SHA1},container=nginx,tag=${CIRCLE_SHA1}"
    # AWS ECSサービス更新後のAWS ECSタスク監視
    verify-revision-is-deployed: "true"

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

#### ▼ run-task

現在起動中のAWS ECSタスクとは別に、新しいAWS ECSタスクを一時的に起動する。

起動時に、`overrides`オプションを使用して、指定したAWS ECSタスク定義のコンテナ設定を上書きできる。

正規表現で設定する必要があり、加えてJSONでは『`\`』を『`\\`』にエスケープしなければならない。

コマンドが実行された後に、AWS ECSタスクは自動的にStopped状態になる。

**＊実装例＊**

例えば、DBマイグレーションを実行するためのAWS ECSタスクを起動する。

`overrides`オプションでコンテナ定義のコマンドを上書きする。

```yaml
version: 2.1

orbs:
  aws-cli: circleci/aws-cli@1.3.1
  aws-ecs: circleci/aws-ecs@2.2.1

jobs:
  aws-ecs/run-task:
    name: ecs_run_task_for_migration
    cluster: "${SERVICE}-ecs-cluster"
    # LATESTとするとその時点の最新バージョンを自動的に割り振られてしまう。
    platform-version: 1.4.0
    awsvpc: "true"
    launch-type: FARGATE
    subnet-ids: $AWS_SUBNET_IDS
    security-group-ids: $AWS_SECURITY_GROUPS
    # AWS ECSタスク定義名。最新リビジョン番号が自動補完される。
    task-definition: "${SERVICE}-ecs-task-definition"
    # AWS ECSタスク起動時にDBマイグレーションのコマンドを実行するように、Laravelコンテナのcommandキーを上書き
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

> - https://docs.aws.amazon.com/cli/latest/reference/ecs/run-task.html

<br>

## 05. aws-code-deploy

### jobs

#### ▼ deploy

S3にコードとappspecファイルをデプロイできる。

また、CodeDeployを使用して、これをEC2にデプロイできる。

**＊実装例＊**

```yaml
version: 2.1

orbs:
  aws-code-deploy: circleci/aws-code-deploy@1.0.0

jobs:
  aws-code-deploy/deploy:
    name: code_deploy
    application-name: $SERVICE}
    # appspecファイルを保管するバケット名
    bundle-bucket: "${SERVICE}-bucket"
    # appspecファイルのあるディレクトリ
    bundle-source: ./infra/aws_codedeploy
    # appspecファイルをzipファイルで保管
    bundle-type: zip
    # zipファイル名
    bundle-key: foo-bundle
    deployment-config: CodeDeployDefault.ECSAllAtOnce
    deployment-group: "${SERVICE}-deployment-group"
    # AWS ECSにリクエストを送信できるCodeDeployサービスロール
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

## 06. slack

### commands

#### ▼ notify

Jobの完了時に、成功または失敗を基にステータスを通知する。

Jobの最後のステップとして設定しなければならない。

```yaml
version: 2.1

orbs:
  slack: circleci/slack@4.1

commands:
  # 他のJob内で使用できるようにcommandとして定義
  notify_of_failure:
    steps:
      - slack/notify:
          event: fail
          template: basic_fail_1

jobs:
  deploy:
    steps:
    ...

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

<br>
