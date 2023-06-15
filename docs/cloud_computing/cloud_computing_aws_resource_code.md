---
title: 【IT技術の知見】Code兄弟＠AWSリソース
description: Code兄弟＠AWSリソースの知見を記録しています。
---

# Code兄弟＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Code兄弟サービス

### Code兄弟サービス

#### ▼ CodePipeline

CodeCommit、CodeBuild、CodeDeployを連携させて、AWSに対するCI/CDパイプラインを作成する。

CodeCommitは、他のコード管理サービスで代用できる。

![code-pipeline](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/code-pipeline.png)

#### ▼ CodeCommit

コードをバージョン管理する。

#### ▼ CodeBuild

ビルドフェーズとテストフェーズを実行する。

#### ▼ CodeDeploy

デプロイフェーズを実行する。

<br>

## 02. CodeBuild

### `buildspec.yml`ファイル

#### ▼ ECSの場合

ECSのために、CodeBuildの設定を行う。

ルートディレクトリの直下に配置しておく。

> ↪️：
>
> - https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html
> - https://docs.aws.amazon.com/codepipeline/latest/userguide/ecs-cd-pipeline.html

**＊実装例＊**

コンテナをビルドする場合を示す。

コミットのハッシュ値でコンテナイメージをプッシュしたい場合、CodeBuildの設計上、`latest`タグもプッシュしておいた方が良い。

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      docker: 18
  preBuild:
    commands:
      # ECRにログイン
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com
      # ECRのURLをCodeBuildの環境変数から作成
      - REPOSITORY_URI=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${IMAGE_REPO_NAME}
      # バージョンタグはコミットのハッシュ値を使用
      - COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
      # ハッシュ値だけでなく、プレフィクスに日付をつけてもよい。
      - IMAGE_TAG=${COMMIT_HASH:=latest}
  build:
    commands:
      # タグ付けしてイメージをビルド
      - docker build -t $REPOSITORY_URI:latest .
      - docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$IMAGE_TAG
  postBuild:
    commands:
      # ECRにコンテナイメージをプッシュする。
      # コミットハッシュ値のタグの前に、latestタグのコンテナイメージをプッシュしておく。
      - docker push $REPOSITORY_URI:latest
      - docker push $REPOSITORY_URI:$IMAGE_TAG
      # ECRにあるデプロイ先のコンテナイメージの情報 (imageDetail.json)
      - printf '[{"name":"hello-world","imageUri":"%s"}]' $REPOSITORY_URI:$IMAGE_TAG > imagedefinitions.json

# デプロイ対象とするビルドのアーティファクト
artifacts:
  files: imageDetail.json
```

> ↪️：https://stackoverflow.com/questions/61070900/can-codepipeline-use-a-specific-commit

<br>

## 03. CodeDeploy (オンプレミスのサーバーの場合)

### 利用できるデプロイメント手法

インプレースデプロイメントを利用できる。

<br>

### インプレースデプロイメント

#### ▼ CodeDeployエージェント

オンプレミスサーバーにCodeDeployエージェントをインストールし、CodeDeployエージェントにサーバー情報を登録する必要がある。

CodeDeployとCodeDeployエージェントは通信し、CodeDeployエージェントがS3バケットからソースコードの圧縮ファイルをプルする。

![code-deploy_agent.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/code-deploy_agent.png)

> ↪️：
>
> - https://docs.aws.amazon.com/ja_jp/codedeploy/latest/userguide/instances-on-premises.html
> - https://inokara.hateblo.jp/entry/2015/07/15/175955

<br>

## 04. CodeDeploy (EC2の場合)

### 利用できるデプロイメント手法

インプレースデプロイ、ブルー/グリーンデプロイメント、を利用できる。

> ↪️：https://docs.aws.amazon.com/codedeploy/latest/userguide/deployments.html

<br>

### インプレースデプロイメント

> ↪️：https://docs.aws.amazon.com/codedeploy/latest/userguide/welcome.html#welcome-deployment-overview-in-place

<br>

### ブルー/グリーンデプロイメント

> ↪️：https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-groups-create-blue-green.html

<br>

## 04-02. CodeDeploy (Lambdaの場合)

### 利用できるデプロイメント手法

ブルー/グリーンデプロイメント、を利用できる。

> ↪️：https://docs.aws.amazon.com/codedeploy/latest/userguide/deployments.html

<br>

## 04-03. CodeDeploy (ECSの場合)

### 利用できるデプロイメント手法

ローリングアップデート、ブルー/グリーンデプロイメント、を利用できる。

> ↪️：https://docs.aws.amazon.com/codedeploy/latest/userguide/deployments.html

<br>

### ローリングアップデート

#### ▼ `imagedefinitions.json`ファイル

新しいリビジョン番号のECSタスク定義を作成するために、新しいコンテナ名とイメージリポジトリURLを定義する。

リポジトリに事前に配置するのではなく、CI/CDパイプライン上で動的に作成するようにした方が良い。

```yaml
[
  {
    "imageUri": "<イメージリポジトリURL>", # <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/<イメージリポジトリ名>:latest
    "name": "<コンテナ名>",
  },
]
```

> ↪️：
>
> - https://docs.aws.amazon.com/codepipeline/latest/userguide/file-reference.html#pipelines-create-image-definitions
> - https://ngyuki.hatenablog.com/entry/2021/04/07/043415

<br>

### ブルー/グリーンデプロイメント

#### ▼ 仕組み

![blue-green-deployment](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/blue-green-deployment.jpeg)

以下の手順でデプロイする。

`【１】`

: ECRのコンテナイメージを更新

`【２】`

: ECSタスク定義の新しいリビジョンを作成。

`【３】`

: サービスを更新。

`【４】`

: CodeDeployによって、ECSタスク定義を基に、現行の旧環境 (Prodブルー) のECSタスクとは別に、新環境 (Testグリーン) が作成される。

     ロードバランサーの接続先を、旧環境 (Prodブルー) のターゲットグループ (Primaryターゲットグループ) に加えて、新環境 (Testグリーン) にも向ける。

`【５】`

: 社内から新環境 (Testグリーン) のALBに、特定のポート番号でアクセスし、動作を確認する。

`【６】`

: 動作確認で問題なければ、Console画面からの入力で、ロードバランサーの接続先を新環境 (Testグリーン) のみに設定する。

`【７】`

: 新環境 (Testグリーン) が新しい旧環境としてユーザーに公開される。

`【８】`

: 元の旧環境 (Prodブルー) は削除される。

> ↪️：https://tech.isid.co.jp/entry/2022/01/11/CodeDeploy_%E3%81%AB%E3%82%88%E3%82%8BECS_%E3%81%A7%E3%81%AEBlue/Green%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4%E3%81%AE%E8%A9%B1

#### ▼ `appspec.yml`ファイル

ルートディレクトリの直下に配置しておく。仕様として、複数のコンテナをデプロイできない。

ECSタスク定義名を`<TASK_DEFINITION>`とすると、`taskdef.json`ファイルの値を元にして、新しいECSタスク定義が自動的に代入される。

```yaml
version: 0.0

Resources:
  - TargetService:
      # 使用するAWSリソース
      Type: AWS::ECS::Service
      Properties:
        # 使用するECSタスク定義
        TaskDefinition: "<TASK_DEFINITION>"
        # 使用するロードバランサー
        LoadBalancerInfo:
          ContainerName: "<コンテナ名>"
          ContainerPort: "80"
        PlatformVersion: "1.4.0"
```

> ↪️：https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-resources.html

#### ▼ `imageDetail.json`ファイル

新バージョンタグを含むイメージリポジトリURLを、`taskdef.json`ファイルの `<IMAGE1_NAME>`に代入するために必要である。

これはリポジトリに事前に配置するのではなく、CI/CDパイプライン上で動的に作成するようにした方が良い。

> ↪️：
>
> - https://docs.aws.amazon.com/codepipeline/latest/userguide/file-reference.html#file-reference-ecs-bluegreen
> - https://ngyuki.hatenablog.com/entry/2021/04/07/043415

#### ▼ `taskdef.json`ファイル

デプロイされるECSタスク定義を実装し、ルートディレクトリの直下に配置する。

CodeDeployは、CodeBuildから渡された`imageDetail.json`ファイルを検知し、ECRからコンテナイメージを取得する。

この時、`taskdef.json`ファイルのコンテナイメージ名を`<IMAGE1_NAME>`としておくと、`imageDetail.json`ファイルの値を元にして、新バージョンタグを含むイメージリポジトリURLが自動的に代入される。

```yaml
{
  "family": "<ECSタスク定義名>",
  "requiresCompatibilities": ["FARGATE"],
  "networkMode": "awsvpc",
  "taskRoleArn": "<タスクロールのARN>",
  "executionRoleArn": "<タスク実行ロールのARN>",
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions":
    [
      {
        "name": "<コンテナ名>",
        "image": "<IMAGE1_NAME>",
        "essential": true,
        "portMappings": [
            {
              # コンテナポート
              "containerPort": 80,
              # ECSのホストのポート
              "hostPort": 80,
              "protocol": "tcp",
            },
          ],
        "secrets": [
            # データ永続化用のDBの接続情報
            {"name": "DB_HOST", "valueFrom": "/ecs/DB_HOST"},
            {"name": "DB_DATABASE", "valueFrom": "/ecs/DB_DATABASE"},
            {"name": "DB_PASSWORD", "valueFrom": "/ecs/DB_PASSWORD"},
            {"name": "DB_USERNAME", "valueFrom": "/ecs/DB_USERNAME"},
            # セッションキャッシュ用のインメモリDBの接続情報
            {"name": "REDIS_HOST", "valueFrom": "/ecs/REDIS_HOST"},
            {"name": "REDIS_PASSWORD", "valueFrom": "/ecs/REDIS_PASSWORD"},
            {"name": "REDIS_PORT", "valueFrom": "/ecs/REDIS_PORT"},
          ],
        "logConfiguration": {
            # ログドライバー
            "logDriver": "awslogs",
            "options": {
                "awslogs-group": "<ログストリーム名>",
                # スタックトレースのログを紐付けられるように、日付で区切るようにする。
                "awslogs-datetime-format": "\\[%Y-%m-%d %H:%M:%S\\]",
                "awslogs-region": "ap-northeast-1",
                "awslogs-stream-prefix": "<ログストリーム名の接頭辞>",
              },
          },
      },
    ],
}
```

> ↪️：
>
> - https://ngyuki.hatenablog.com/entry/2021/04/07/043415
> - https://docs.aws.amazon.com/codepipeline/latest/userguide/tutorials-ecs-ecr-codedeploy.html#tutorials-ecs-ecr-codedeploy-taskdefinition

<br>

## 04-04. CodeDeployと他のAWSリソースとの連携

### AutoScaling

> ↪️：https://docs.aws.amazon.com/codedeploy/latest/userguide/integrations-aws-auto-scaling.html

<br>

### ALB、ELB、NLB

#### ▼ インプレースデプロイメントの場合

CodeDeployのデプロイの途中、ターゲットグループからインスタンスを切り離すことにより、インバウンド通信のインスタンスへのルーティングを遮断する。

そのため、デプロイ中にユーザーはアプリにアクセスできなくなる。

デプロイが正常に完了次第、ターゲットグループにインスタンスを再登録し、アクセスできるようにする。

> ↪️：https://docs.aws.amazon.com/codedeploy/latest/userguide/integrations-aws-elastic-load-balancing.html#integrations-aws-elastic-load-balancing-in-place

<br>
