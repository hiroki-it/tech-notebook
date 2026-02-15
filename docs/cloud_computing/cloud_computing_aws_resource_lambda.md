---
title: 【IT技術の知見】AWS Lambda＠AWSリソース
description: AWS Lambda＠AWSリソース
---

# AWS Lambda＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS Lambdaとは

他のAWSリソースのイベントによって駆動する関数を管理できる。

![サーバーレスアーキテクチャとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/サーバーレスアーキテクチャとは.png)

> - https://docs.aws.amazon.com/lambda/latest/dg/applications-usecases.html

<br>

## 01-02. セットアップ

### コンソール画面の場合

#### ▼ 設定項目と説明

| 設定項目                           | 説明                                                                                            | 補足                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ランタイム                         | 関数の実装に使用する言語を設定する。                                                            | コンテナイメージの関数では使用できない。                                                                                                                                                                                                                                                                                                          |
| ハンドラ                           | 関数の実行時にコールしたい具体的関数名を設定する。                                              | ・コンテナイメージの関数では使用できない。<br>・Node.js：`index.js` というファイル名で `exports.handler` 関数を呼び出したい場合、ハンドラ名を `index.handler` とする                                                                                                                                                                                 |
| レイヤー                           | 異なる関数の間で、特定の処理を共通化できる。                                                    | コンテナイメージの関数では使用できない。                                                                                                                                                                                                                                                                                                          |
| メモリ                             | AWS Lambdaに割り当てるメモリサイズを設定する。                                                  | 最大10240MBまで増設でき、増設するほど性能が上がる。<br>- https://www.business-on-it.com/2003-aws-lambda-performance-check/                                                                                                                                                                                                                        |
| タイムアウト                       |                                                                                                 |                                                                                                                                                                                                                                                                                                                                                   |
| 実行ロール                         | AWS Lambda内の関数が実行される時に必要なポリシーを持つロールを設定する。                        |                                                                                                                                                                                                                                                                                                                                                   |
| 既存ロール                         | AWS Lambdaにロールを設定する。                                                                  |                                                                                                                                                                                                                                                                                                                                                   |
| トリガー                           | AWS Lambdaにリクエストを送信できるAWSリソースを設定する。                                       | 設定されたAWSリソースに応じて、AWS Lambdaのポリシーが自動的に修正される。                                                                                                                                                                                                                                                                         |
| アクセス権限                       | AWS Lambdaの認可スコープを設定する。                                                            | トリガーの設定に応じて、AWS Lambdaのポリシーが自動的に修正される。                                                                                                                                                                                                                                                                                |
| 宛先                               | AWS LambdaからリクエストできるAWSリソースを設定する。                                           | 宛先のAWSリソースのポリシーは自動的に修正されないため、別途、手動で修正する必要がある。                                                                                                                                                                                                                                                           |
| 環境変数                           | AWS Lambdaの関数内に出力する環境変数を設定する。                                                | デフォルトでは、環境変数はAWSマネージド型KMSキーによって暗号化される。                                                                                                                                                                                                                                                                            |
| 同時実行数                         | 同時実行の予約を設定する。                                                                      |                                                                                                                                                                                                                                                                                                                                                   |
| プロビジョニングされた同時実行設定 |                                                                                                 |                                                                                                                                                                                                                                                                                                                                                   |
| モニタリング                       | AWS LambdaをAWS CloudWatchまたはX-Rayを使用して、メトリクスの元になるデータポイントを収集する。 | 次の方法がある<br>・AWS CloudWatchによって、メトリクスの元になるデータポイントを収集する。<br>・AWS CloudWatchのAWS Lambda Insightsによって、性能に関するメトリクスの元になるデータポイントを収集する。<br>・X-Rayによって、APIに対するリクエスト、AWS Lambdaコール、AWS Lambdaの宛先とのデータ通信をトレースし、これらをスタックトレース化する。 |

<br>

### 設定のベストプラクティス

> - https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html#function-configuration>

<br>

### AWS Lambdaと関数の関係性

![lambda-execution-environment-api-flow](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/lambda-execution-environment-api-flow.png)

#### ▼ AWS Lambdaサービス

コンソール画面のAWS Lambdaに相当する。

#### ▼ 関数の実行環境

AWS Lambdaは、API (ランタイムAPI、ログAPI、拡張API) と実行環境から構成されている。

関数は実行環境に存在し、ランタイムAPIを経由して、AWS Lambdaによって実行される。

> - https://docs.aws.amazon.com/lambda/latest/dg/runtimes-extensions-api.html#runtimes-extensions-api-lifecycle>

実行環境には、`3` 個のフェーズがある。

> - https://docs.aws.amazon.com/lambda/latest/dg/runtimes-context.html#runtimes-lifecycle>

![lambda-execution-environment-life-cycle](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/lambda-execution-environment-lifecycle.png)

#### ▼ Initフェーズ

AWS Lambdaが発火する。

実行環境が作成され、関数を実行するための準備が行われる。

#### ▼ Invokeフェーズ

AWS Lambdaは関数を実行する。

実行環境側のランタイムは、APIを経由してAWS Lambdaから関数に引数を渡す。

また関数の実行後に、APIを経由して返却値をAWS Lambdaに渡す。

#### ▼ Shutdownフェーズ

一定期間、Invokeフェーズにおける関数実行が行われなかった場合、AWS Lambdaはランタイムを完了し、実行環境を削除する。

<br>

### AWS Lambda関数 on Docker

#### ▼ ベースイメージの準備

> - https://docs.aws.amazon.com/lambda/latest/dg/runtimes-images.html#runtimes-images-lp>

#### ▼ RIC：Runtime Interface Clients

通常のランタイムはコンテナ内関数と通信できないため、ランタイムの代わりにRICを使用してコンテナ内関数と通信を実行する。

言語別にRICパッケージが用意されている。

> - https://docs.aws.amazon.com/lambda/latest/dg/runtimes-images.html#runtimes-api-client>

#### ▼ RIE：Runtime Interface Emulator

開発環境のコンテナで、擬似的にAWS Lambda関数を再現する。

全ての言語で共通のRIEパッケージが用意されている。

> - https://github.com/aws/aws-lambda-runtime-interface-emulator>

RIEであっても、稼働させるためにAWSの資格情報 (アクセスキーID、シークレットアクセスキー、リージョン) が必要なため、環境変数や資格情報ファイルを使用して、AWS Lambdaにこれらの値を出力する。

> - https://docs.aws.amazon.com/lambda/latest/dg/images-test.html#images-test-env>

**＊参考＊**

```bash
$ docker run \
    --rm \
    `# エミュレーターをエントリーポイントをバインドする。` \
    -v ~/.aws-lambda-rie:/aws-lambda \
    -p 9000:8080 \
    `# エミュレーターをエントリーポイントとして設定する。` \
    --entrypoint /aws-lambda/aws-lambda-rie \
    <コンテナイメージ名>:<バージョンタグ> /go/bin/cmd
```

```bash
# ハンドラー関数の引数に合ったJSON型データを送信する。
$ curl \
    -XPOST "http://127.0.0.1:9000/2015-03-31/functions/function/invocations" \
    -d '{}'
```

**＊参考＊**

```yaml
version: "3.7"

services:
  lambda:
    build:
      context: .
      dockerfile: ./build/Dockerfile
    container_name: lambda
    # エミュレーターをエントリーポイントとして設定する。
    entrypoint: /aws-lambda/aws-lambda-rie
    env_file:
      - .docker.env
    image: <コンテナイメージ名>:<バージョンタグ>
    ports:
      - 9000:8080
    # エミュレーターをエントリーポイントをバインドする。
    volumes:
      - ~/.aws-lambda-rie:/aws-lambda
```

```bash
docker compose up lambda
```

```bash
$ curl \
    -XPOST "http://127.0.0.1:9000/2015-03-31/functions/function/invocations" \
    -d '{}'
```

<br>

### 同時実行

#### ▼ 同時実行の予約

AWS Lambdaは、関数の実行中に再びリクエストを受信すると、関数のインスタンスを新しく作成する。

そして、各関数インスタンスを使用して、並行的にリクエストに応じる。

デフォルトでは、関数の種類がいくつあっても、AWSアカウント当たり、合計で `1000` 個までしかスケーリングして同時実行できない。

関数ごとに同時実行数の使用枠を割り当てるためには、同時実行の予約を設定する必要がある。

同時実行の予約数を `0` 個とした場合、AWS Lambdaがスケーリングしなくなる。

> - https://docs.aws.amazon.com/lambda/latest/dg/configuration-concurrency.html#configuration-concurrency-reserved>

![lambda_concurrency-model](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/lambda_concurrency-model.png)

<br>

### AWS VPC外/AWS VPC内

#### ▼ AWS VPC外への配置

AWS LambdaはデフォルトではAWS VPC外に配置される。

この場合、AWS LambdaにENIが紐付けられ、ENIに割り当てられたIPアドレスがAWS Lambdaに適用される。

AWS Lambdaの実行時にENIは再作成されるため、実行ごとにIPアドレスは変化するが、一定時間内の再実行であればENIは再利用されるため、前回の実行時と同じIPアドレスになることもある。

#### ▼ AWS VPC内への配置

AWS LambdaをAWS VPC内に配置するように設定する。

AWS VPC内に配置したAWS LambdaにはパブリックIPアドレスが割り当てられないため、アウトバウンド通信を実行するためには、NAT Gatewayを配置する必要がある。

<br>

### ポリシー

#### ▼ 実行のための最低限のポリシー

AWS Lambdaを実行するためには、デプロイされた関数を使用する認可スコープが必要である。

そのため、関数を取得するためのステートメントを設定する。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Action": "lambda:InvokeFunction",
        "Resource": "arn:aws:lambda:ap-northeast-1:<AWSアカウントID>:function:<関数名>*",
      },
    ],
}
```

<br>

### データベース

- AWS DynamoDB
- AWS RDSプロキシとAWS RDS

> - https://zenn.dev/medicalforce/articles/e26b9cbe16305f#%E8%83%8C%E6%99%AF

<br>

### デプロイ

#### ▼ 直接的に修正

デプロイを行わずに、関数のコードを直接的に修正し、『Deploy』ボタンでデプロイする。

#### ▼ S3における `.zip` ファイル

ビルド後のコードを `.zip` ファイルにしてアップロードする。

ローカルマシンまたはS3からアップロードできる。

> - https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-package.html#gettingstarted-package-zip>

#### ▼ AWS ECRにおけるイメージ

コンテナイメージの関数のみで有効である。

ビルド後のコードをコンテナイメージしてアップロードする。

AWS ECRからアップロードできる。

> - https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-package.html#gettingstarted-package-images>

<br>

## 02. AWS Lambda@Edge

### AWS Lambda@Edgeとは

AWS CloudFrontに統合されたAWS Lambdaを、特別にAWS Lambda@Edgeという。

<br>

## 02-02. セットアップ

### コンソール画面の場合

#### ▼ トリガーの種類

![lambda-edge](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/lambda-edge.png)

AWS CloudFrontのビューワーリクエスト、オリジンリクエスト、オリジンレスポンス、ビューワーレスポンスをトリガーとする。

エッジロケーションのAWS CloudFrontに、AWS Lambdaのレプリカを作成する。

| トリガーの種類       | 発火のタイミング                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| ビューワーリクエスト | AWS CloudFrontが、ビューワーからリクエストを受信した後 (キャッシュを確認する前) 。                 |
| オリジンリクエスト   | AWS CloudFrontが、リクエストをオリジンサーバーにフォワーディングする前 (キャッシュを確認した後) 。 |
| オリジンレスポンス   | AWS CloudFrontが、オリジンからレスポンスを受信した後 (キャッシュを確認する前) 。                   |
| ビューワーレスポンス | AWS CloudFrontが、ビューワーにレスポンスをフォワーディングする前 (キャッシュを確認した後) 。       |

#### ▼ 各トリガーのeventオブジェクトへのマッピング

各トリガーのeventオブジェクトへのマッピングは、リンクを参考にせよ。

> - https://docs.aws.amazon.com/AmazonAWS CloudFront/latest/DeveloperGuide/lambda-event-structure.html

<br>

### ポリシー

#### ▼ 実行のための最低限のポリシー

AWS Lambda@Edgeを実行するためには、最低限、以下の認可スコープが必要である。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Action": ["iam:CreateServiceLinkedRole"],
        "Resource": "*",
      },
      {
        "Effect": "Allow",
        "Action": ["lambda:GetFunction", "lambda:EnableReplication*"],
        "Resource": "arn:aws:lambda:ap-northeast-1:<AWSアカウントID>:function:<関数名>:<バージョン>",
      },
      {
        "Effect": "Allow",
        "Action": ["cloudfront:UpdateDistribution"],
        "Resource": "arn:aws:cloudfront::<AWSアカウントID>:distribution/<DistributionID>",
      },
    ],
}
```

<br>

## 03. AWS Lambda Web Adapter

### AWS Lambda Web Adapterとは

AWS Lambdaの拡張機能である。

通常のAWS Lambdaでは動かせないフレームワーク (例：Express.js、Next.js、SprintBoot、ASP.NET、Laravelなど) のアプリを動かせるようにする。

アプリケーションのプロセスの前段でリクエストを変換し、アプリケーションがリクエストを処理できるようにする。

![lambda-web-adapter](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/lambda-web-adapter.png)

> - https://aws.amazon.com/jp/builders-flash/202301/lambda-web-adapter/
> - https://github.com/awslabs/aws-lambda-web-adapter

<br>

### Dockerfile

#### ▼ Next.jsの場合

```dockerfile
FROM node:20.12.2-bullseye-slim AS builder
WORKDIR /build
COPY package.json yarn.lock ./
RUN yarn install && yarn next telemetry disable
COPY . .
RUN yarn build

FROM amazon/aws-lambda-nodejs:20.2024.04.24.10
WORKDIR /usr/local/statuspage
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.3 /lambda-adapter /opt/extensions/lambda-adapter
COPY --from=builder /build/next.config.mjs /build/public /build/.next/static /build/.next/standalone ./
RUN ln -s /tmp/cache ./.next/cache
EXPOSE 3000
ENV PORT=3000
ENTRYPOINT ["node", "server.js"]
```

<br>
