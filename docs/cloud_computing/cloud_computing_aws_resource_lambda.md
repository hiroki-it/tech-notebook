---
title: 【IT技術の知見】Lambda＠AWSリソース
description: Lambda＠AWSリソース
---

# Lambda＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Lambda

### Lambdaとは

他のAWSリソースのイベントによって駆動する関数を管理できる。

![サーバーレスアーキテクチャとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/サーバーレスアーキテクチャとは.png)

> - https://docs.aws.amazon.com/lambda/latest/dg/applications-usecases.html>

<br>

## 01-02. セットアップ

### コンソール画面の場合

#### ▼ 設定項目と説明

| 設定項目                           | 説明                                                                            | 補足                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ランタイム                         | 関数の実装に使用する言語を設定する。                                            | コンテナイメージの関数では使用できない。                                                                                                                                                                                                                                                                                    |
| ハンドラ                           | 関数の実行時にコールしたい具体的メソッド名を設定する。                          | ・コンテナイメージの関数では使用できない。<br>・Node.js：`index.js` というファイル名で `exports.handler` メソッドを呼び出したい場合、ハンドラ名を`index.handler`とする                                                                                                                                                      |
| レイヤー                           | 異なる関数の間で、特定の処理を共通化できる。                                    | コンテナイメージの関数では使用できない。                                                                                                                                                                                                                                                                                    |
| メモリ                             | Lambdaに割り当てるメモリサイズを設定する。                                      | 最大10240MBまで増設でき、増設するほど性能が上がる。<br>- https://www.business-on-it.com/2003-aws-lambda-performance-check/                                                                                                                                                                                                  |
| タイムアウト                       |                                                                                 |                                                                                                                                                                                                                                                                                                                             |
| 実行ロール                         | Lambda内のメソッドが実行される時に必要なポリシーを持つロールを設定する。        |                                                                                                                                                                                                                                                                                                                             |
| 既存ロール                         | Lambdaにロールを設定する。                                                      |                                                                                                                                                                                                                                                                                                                             |
| トリガー                           | Lambdaにリクエストを送信できるAWSリソースを設定する。                           | 設定されたAWSリソースに応じて、Lambdaのポリシーが自動的に修正される。                                                                                                                                                                                                                                                       |
| アクセス権限                       | Lambdaの認可スコープを設定する。                                                | トリガーの設定に応じて、Lambdaのポリシーが自動的に修正される。                                                                                                                                                                                                                                                              |
| 宛先                               | LambdaからリクエストできるAWSリソースを設定する。                               | 宛先のAWSリソースのポリシーは自動的に修正されないため、別途、手動で修正する必要がある。                                                                                                                                                                                                                                     |
| 環境変数                           | Lambdaの関数内に出力する環境変数を設定する。                                    | デフォルトでは、環境変数はAWSマネージド型KMSキーによって暗号化される。                                                                                                                                                                                                                                                      |
| 同時実行数                         | 同時実行の予約を設定する。                                                      |                                                                                                                                                                                                                                                                                                                             |
| プロビジョニングされた同時実行設定 |                                                                                 |                                                                                                                                                                                                                                                                                                                             |
| モニタリング                       | LambdaをCloudWatchまたはX-Rayを使用して、メトリクスのデータポイントを収集する。 | 次の方法がある<br>・CloudWatchによって、メトリクスのデータポイントを収集する。<br>・CloudWatchのLambda Insightsによって、性能に関するメトリクスのデータポイントを収集する。<br>・X-Rayによって、APIに対するリクエスト、Lambdaコール、Lambdaのアップストリーム側とのデータ通信をトレースし、これらをスタックトレース化する。 |

<br>

### 設定のベストプラクティス

> - https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html#function-configuration>

<br>

### Lambdaと関数の関係性

![lambda-execution-environment-api-flow](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/lambda-execution-environment-api-flow.png)

#### ▼ Lambdaサービス

コンソール画面のLambdaに相当する。

#### ▼ 関数の実行環境

Lambdaは、API (ランタイムAPI、ログAPI、拡張API) と実行環境から構成されている。

関数は実行環境に存在し、ランタイムAPIを介して、Lambdaによって実行される。

> - https://docs.aws.amazon.com/lambda/latest/dg/runtimes-extensions-api.html#runtimes-extensions-api-lifecycle>

実行環境には、`3`個のフェーズがある。

> - https://docs.aws.amazon.com/lambda/latest/dg/runtimes-context.html#runtimes-lifecycle>

![lambda-execution-environment-life-cycle](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/lambda-execution-environment-lifecycle.png)

#### ▼ Initフェーズ

Lambdaが発火する。

実行環境が作成され、関数を実行するための準備が行われる。

#### ▼ Invokeフェーズ

Lambdaは関数を実行する。

実行環境側のランタイムは、APIを介してLambdaから関数に引数を渡す。

また関数の実行後に、APIを介して返却値をLambdaに渡す。

#### ▼ Shutdownフェーズ

一定期間、Invokeフェーズにおける関数実行が行われなかった場合、Lambdaはランタイムを完了し、実行環境を削除する。

<br>

### Lambda関数 on Docker

#### ▼ ベースイメージの準備

> - https://docs.aws.amazon.com/lambda/latest/dg/runtimes-images.html#runtimes-images-lp>

#### ▼ RIC：Runtime Interface Clients

通常のランタイムはコンテナ内関数と通信できないため、ランタイムの代わりにRICを使用してコンテナ内関数と通信を実行する。

言語別にRICパッケージが用意されている。

> - https://docs.aws.amazon.com/lambda/latest/dg/runtimes-images.html#runtimes-api-client>

#### ▼ RIE：Runtime Interface Emulator

開発環境のコンテナで、擬似的にLambda関数を再現する。

全ての言語で共通のRIEパッケージが用意されている。

> - https://github.com/aws/aws-lambda-runtime-interface-emulator>

RIEであっても、稼働させるためにAWSの認証情報 (アクセスキーID、シークレットアクセスキー、リージョン) が必要なため、環境変数や認証情報ファイルを使用して、Lambdaにこれらの値を出力する。

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

Lambdaは、関数の実行中に再びリクエストを受信すると、関数のインスタンスを新しく作成する。

そして、各関数インスタンスを使用して、並行的にリクエストに応じる。

デフォルトでは、関数の種類がいくつあっても、AWSアカウント当たり、合計で`1000`個までしかスケーリングして同時実行できない。

関数ごとに同時実行数の使用枠を割り当てるためには、同時実行の予約を設定する必要がある。

同時実行の予約数を`0`個とした場合、Lambdaがスケーリングしなくなる。

> - https://docs.aws.amazon.com/lambda/latest/dg/configuration-concurrency.html#configuration-concurrency-reserved>

![lambda_concurrency-model](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/lambda_concurrency-model.png)

<br>

### VPC外/VPC内

#### ▼ VPC外への配置

LambdaはデフォルトではVPC外に配置される。

この場合、LambdaにENIが紐付けられ、ENIに割り当てられたIPアドレスがLambdaに適用される。

Lambdaの実行時にENIは再作成されるため、実行ごとにIPアドレスは変化するが、一定時間内の再実行であればENIは再利用されるため、前回の実行時と同じIPアドレスになることもある。

#### ▼ VPC内への配置

LambdaをVPC内に配置するように設定する。

VPC内に配置したLambdaにはパブリックIPアドレスが割り当てられないため、アウトバウンド通信を実行するためには、NAT Gatewayを配置する必要がある。

<br>

### ポリシー

#### ▼ 実行のための最低限のポリシー

Lambdaを実行するためには、デプロイされた関数を使用する認可スコープが必要である。

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

### デプロイ

#### ▼ 直接的に修正

デプロイを行わずに、関数のコードを直接的に修正し、『Deploy』ボタンでデプロイする。

#### ▼ S3における`.zip`ファイル

ビルド後のコードを`.zip`ファイルにしてアップロードする。

ローカルマシンまたはS3からアップロードできる。

> - https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-package.html#gettingstarted-package-zip>

#### ▼ ECRにおけるイメージ

コンテナイメージの関数のみで有効である。

ビルド後のコードをコンテナイメージしてアップロードする。

ECRからアップロードできる。

> - https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-package.html#gettingstarted-package-images>

<br>

## 02. Lambda@Edge

### Lambda@Edgeとは

CloudFrontに統合されたLambdaを、特別にLambda@Edgeという。

<br>

## 02-02. セットアップ

### コンソール画面の場合

#### ▼ トリガーの種類

![lambda-edge](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/lambda-edge.png)

CloudFrontのビューワーリクエスト、オリジンリクエスト、オリジンレスポンス、ビューワーレスポンス、をトリガーとする。

エッジロケーションのCloudFrontに、Lambdaのレプリカが作成される。

| トリガーの種類       | 発火のタイミング                                                                   |
| -------------------- | ---------------------------------------------------------------------------------- |
| ビューワーリクエスト | CloudFrontが、ビューワーからリクエストを受信した後 (キャッシュを確認する前) 。     |
| オリジンリクエスト   | CloudFrontが、リクエストをオリジンサーバーに転送する前 (キャッシュを確認した後) 。 |
| オリジンレスポンス   | CloudFrontが、オリジンからレスポンスを受信した後 (キャッシュを確認する前) 。       |
| ビューワーレスポンス | CloudFrontが、ビューワーにレスポンスを転送する前 (キャッシュを確認した後) 。       |

#### ▼ 各トリガーのeventオブジェクトへのマッピング

各トリガーのeventオブジェクトへのマッピングは、リンクを参考にせよ。

> - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html>

<br>

### ポリシー

#### ▼ 実行のための最低限のポリシー

Lambda@Edgeを実行するためには、最低限、以下の認可スコープが必要である。

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

## 03. Lambdaによるマイクロサービスアーキテクチャ

Lambdaをマイクロサービス単位で稼働させる。

ただ、Lambdaによるマイクロサービスアーキテクチャはアプリとインフラの責務を分離できないため、非推奨である。

Kubernetes Cluster上でこれを稼働させることが推奨である。

> - https://aws.amazon.com/jp/blogs/news/comparing-design-approaches-for-building-serverless-microservices/

<br>
