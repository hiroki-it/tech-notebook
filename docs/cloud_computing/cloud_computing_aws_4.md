---
title: 【IT技術の知見】AWS：Amazon Web Service
description: AWS：Amazon Web Serviceの知見を記録しています。
---

# AWS：Amazon Web Service（L〜R）

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Lambda

### Lambdaとは

他のAWSリソースのイベントによって駆動する関数を管理できる。ユースケースについては、以下のリンクを参考にせよ。

ℹ️ 参考：ℹ️ 参考：https://docs.aws.amazon.com/lambda/latest/dg/applications-usecases.html

![サーバーレスアーキテクチャとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/サーバーレスアーキテクチャとは.png)

<br>

### セットアップ

| 設定項目              | 説明                                                 | 補足                                                         |
|-------------------|----------------------------------------------------| ------------------------------------------------------------ |
| ランタイム             | 関数の実装に使用する言語を設定する。                                 | コンテナイメージの関数では使用できない。                     |
| ハンドラ              | 関数の実行時にコールしたい具体的メソッド名を設定する。                        | ・コンテナイメージの関数では使用できない。<br>・Node.js：```index.js``` というファイル名で ```exports.handler``` メソッドを呼び出したい場合、ハンドラ名を```index.handler```とする |
| レイヤー              | 異なる関数の間で、特定の処理を共通化できる。                             | コンテナイメージの関数では使用できない。                     |
| メモリ               | Lambdaに割り当てるメモリサイズを設定する。                           | 最大10240MBまで増設でき、増設するほどパフォーマンスが上がる。<br>ℹ️ 参考：https://www.business-on-it.com/2003-aws-lambda-performance-check/ |
| タイムアウト            |                                                    |                                                              |
| 実行ロール             | Lambda内のメソッドが実行される時に必要なポリシーを持つロールを設定する。            |                                                              |
| 既存ロール             | Lambdaにロールを設定する。                                   |                                                              |
| トリガー              | LambdaにアクセスできるようにするAWSリソースを設定する。                   | 設定されたAWSリソースに応じて、Lambdaのポリシーが自動的に修正される。 |
| アクセス権限            | Lambdaの認可スコープを設定する。                                | トリガーの設定に応じて、Lambdaのポリシーが自動的に修正される。 |
| 送信先               | LambdaからアクセスできるようにするAWSリソースを設定する。                  | 送信先のAWSリソースのポリシーは自動的に修正されないため、別途、手動で修正する必要がある。 |
| 環境変数              | Lambdaの関数内に出力する環境変数を設定する。                          | デフォルトでは、環境変数はAWSマネージド型KMSキーによって暗号化される。 |
| 同時実行数             | 同時実行の予約を設定する。                                      |                                                              |
| プロビジョニングされた同時実行設定 |                                                    |                                                              |
| モニタリング            | LambdaをCloudWatchまたはX-Rayを使用して、メトリクスのデータポイントを収集する。 | 次の方法がある<br>・CloudWatchによって、メトリクスのデータポイントを収集する。<br>・CloudWatchのLambda Insightsによって、パフォーマンスに関するメトリクスのデータポイントを収集する。<br>・X-Rayによって、APIへのリクエスト、Lambdaコール、Lambdaの下流とのデータ通信をトレースし、これらをスタックトレース化する。 |

### 設定のベストプラクティス

ℹ️ 参考：https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html#function-configuration

<br>

### Lambdaと関数の関係性

![lambda-execution-environment-api-flow](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/lambda-execution-environment-api-flow.png)

#### ▼ Lambdaサービス

コンソール画面のLambdaに相当する。

#### ▼ 関数の実行環境

Lambdaは、API（ランタイムAPI、ログAPI、拡張API）と実行環境から構成されている。関数は実行環境に存在し、ランタイムAPIを介して、Lambdaによって実行される。

ℹ️ 参考：https://docs.aws.amazon.com/lambda/latest/dg/runtimes-extensions-api.html#runtimes-extensions-api-lifecycle

実行環境には、```3```個のフェーズがある。

ℹ️ 参考：https://docs.aws.amazon.com/lambda/latest/dg/runtimes-context.html#runtimes-lifecycle

![lambda-execution-environment-life-cycle](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/lambda-execution-environment-lifecycle.png)

#### ▼ Initフェーズ

Lambdaが発火する。実行環境が作成され、関数を実行するための準備が行われる。

#### ▼ Invokeフェーズ

Lambdaは関数を実行する。実行環境側のランタイムは、APIを介してLambdaから関数に引数を渡す。また関数の実行後に、APIを介して返却値をLambdaに渡す。

#### ▼ Shutdownフェーズ

一定期間、Invokeフェーズにおける関数実行が行われなかった場合、Lambdaはランタイムを完了し、実行環境を削除する。

<br>

### Lambda関数 on Docker

#### ▼ ベースイメージの準備

ℹ️ 参考：https://docs.aws.amazon.com/lambda/latest/dg/runtimes-images.html#runtimes-images-lp

#### ▼ RIC：Runtime Interface Clients

通常のランタイムはコンテナ内関数と通信できないため、ランタイムの代わりにRICを使用してコンテナ内関数と通信を行う。言語別にRICパッケージが用意されている。

ℹ️ 参考：https://docs.aws.amazon.com/lambda/latest/dg/runtimes-images.html#runtimes-api-client

#### ▼ RIE：Runtime Interface Emulator

開発環境のコンテナで、擬似的にLambda関数を再現する。全ての言語で共通のRIEパッケージが用意されている。

ℹ️ 参考：https://github.com/aws/aws-lambda-runtime-interface-emulator

RIEであっても、稼働させるためにAWSのクレデンシャル情報（アクセスキーID、シークレットアクセスキー、リージョン）が必要なため、環境変数や```credentials```ファイルを使用して、Lambdaにこれらの値を出力する。

ℹ️ 参考：https://docs.aws.amazon.com/lambda/latest/dg/images-test.html#images-test-env

**＊参考＊**

```bash
$ docker run \
    --rm \
    # エミュレーターをエントリーポイントをバインドする。
    -v ~/.aws-lambda-rie:/aws-lambda \
    -p 9000:8080 \
    # エミュレーターをエントリーポイントとして設定する。
    --entrypoint /aws-lambda/aws-lambda-rie \
    <コンテナイメージ名>:<バージョンタグ> /go/bin/cmd
```

```bash
# ハンドラー関数の引数に合ったJSONデータを送信する。
$ curl \
    -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" \
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
$ docker-compose up lambda
```

```bash
$ curl \
  -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" \
  -d '{}'
```

<br>

### Lambda関数

#### ▼ Goの使用例

以下のリンクを参考にせよ。

ℹ️ 参考：

- https://docs.aws.amazon.com/lambda/latest/dg/lambda-golang.html
- https://hiroki-it.github.io/tech-notebook-mkdocs/cloud_computing/cloud_computing_aws_lambda_function.html

#### ▼ Node.jsの使用例

以下のリンクを参考にせよ。

ℹ️ 参考：

- https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html
- https://hiroki-it.github.io/tech-notebook-mkdocs/cloud_computing/cloud_computing_aws_lambda_function.html

<br>

### 同時実行

#### ▼ 同時実行の予約

Lambdaは、関数の実行中に再びリクエストが送信されると、関数のインスタンスを新しく作成する。そして、各関数インスタンスを使用して、同時並行的にリクエストに応じる。デフォルトでは、関数の種類がいくつあっても、AWSアカウント当たり、合計で```1000```個までしかスケーリングして同時実行できない。関数ごとに同時実行数の使用枠を割り当てるためには、同時実行の予約を設定する必要がある。同時実行の予約数を```0```個とした場合、Lambdaがスケーリングしなくなる。

ℹ️ 参考：https://docs.aws.amazon.com/lambda/latest/dg/configuration-concurrency.html#configuration-concurrency-reserved

![lambda_concurrency-model](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/lambda_concurrency-model.png)

<br>

### VPC外/VPC内

#### ▼ VPC外への配置

LambdaはデフォルトではVPC外に配置される。この場合、LambdaにENIが紐付けられ、ENIに割り当てられたIPアドレスがLambdaに適用される。Lambdaの実行時にENIは再作成されるため、実行ごとにIPアドレスは変化するが、一定時間内の再実行であればENIは再利用されるため、前回の実行時と同じIPアドレスになることもある。

#### ▼ VPC内への配置

LambdaをVPC内に配置するように設定する。VPC内に配置したLambdaにはパブリックIPアドレスが割り当てられないため、アウトバウンド通信を行うためには、NAT Gatewayを設置する必要がある。

<br>

### ポリシー

#### ▼ 実行のための最低限のポリシー

Lambdaを実行するためには、デプロイされた関数を使用する認可スコープが必要である。そのため、関数を取得するためのステートメントを設定する。

```yaml
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:ap-northeast-1:<アカウントID>:function:<関数名>*"
    }
  ]
}
```

<br>

### デプロイ

#### ▼ 直接的に修正

デプロイを行わずに、関数のコードを直接的に修正し、『Deploy』ボタンでデプロイする。

#### ▼ S3における```.zip```ファイル

ビルド後のコードを```.zip```ファイルにしてアップロードする。ローカルマシンまたはS3からアップロードできる。

ℹ️ 参考：https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-package.html#gettingstarted-package-zip

#### ▼ ECRにおけるイメージ

コンテナイメージの関数でのみ有効である。ビルド後のコードをコンテナイメージしてアップロードする。ECRからアップロードできる。

ℹ️ 参考：https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-package.html#gettingstarted-package-images

<br>

## 01-02. Lambda@Edge

### Lambda@Edgeとは

CloudFrontに統合されたLambdaを、特別にLambda@Edgeという。

<br>

### セットアップ

#### ▼ トリガーの種類

![lambda-edge](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/lambda-edge.png)

CloudFrontのビューワーリクエスト、オリジンリクエスト、オリジンレスポンス、ビューワーレスポンス、をトリガーとする。エッジロケーションのCloudFrontに、Lambdaのレプリカが作成される。

| トリガーの種類       | 発火のタイミング                                             |
| -------------------- | ------------------------------------------------------------ |
| ビューワーリクエスト | CloudFrontが、ビューワーからリクエストを受信した後（キャッシュを確認する前）。 |
| オリジンリクエスト   | CloudFrontが、リクエストをオリジンサーバーに転送する前（キャッシュを確認した後）。 |
| オリジンレスポンス   | CloudFrontが、オリジンからレスポンスを受信した後（キャッシュを確認する前）。 |
| ビューワーレスポンス | CloudFrontが、ビューワーにレスポンスを転送する前（キャッシュを確認した後）。 |

#### ▼ 各トリガーのeventオブジェクトへのマッピング

各トリガーのeventオブジェクトへのマッピングは、リンクを参考にせよ。

ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html

<br>

### ポリシー

#### ▼ 実行のための最低限のポリシー

Lambda@Edgeを実行するためには、最低限、以下の認可スコープが必要である。

```yaml
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iam:CreateServiceLinkedRole"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "lambda:GetFunction",
        "lambda:EnableReplication*"
      ],
      "Resource": "arn:aws:lambda:ap-northeast-1:<アカウントID>:function:<関数名>:<バージョン>"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:UpdateDistribution"
      ],
      "Resource": "arn:aws:cloudfront::<アカウントID>:distribution/<DistributionID>"
    }
  ]
}
```

<br>

### Node.jsを使用した関数例

#### ▼ オリジンの動的な切り替え

![lambda-edge_dynamic-origin](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/lambda-edge_dynamic-origin.png)

**＊実装例＊**

eventオブジェクトの```domainName```と```host.value```に代入されたバケットのドメイン名によって、転送先のバケットが決まる。そのため、この値を切り替えれば、動的オリジンを実現できる。なお、各バケットには同じオリジンアクセスアイデンティティを設定する必要がある。

```javascript
"use strict";

exports.handler = (event, context, callback) => {

    const request = event.Records[0].cf.request;
    // ログストリームに変数を出力する。
    console.log(JSON.stringify({request}, null, 2));

    const headers = request.headers;
    const s3Backet = getBacketBasedOnDeviceType(headers);

    request.origin.s3.domainName = s3Backet
    request.headers.host[0].value = s3Backet
    // ログストリームに変数を出力する。
    console.log(JSON.stringify({request}, null, 2));

    return callback(null, request);
};

/**
 * デバイスタイプを基に、オリジンを切り替える。
 *
 * @param   {Object} headers
 * @param   {string} env
 * @returns {string} pcBucket|spBucket
 */
const getBacketBasedOnDeviceType = (headers) => {

    const pcBucket = env + "-bucket.s3.amazonaws.com";
    const spBucket = env + "-bucket.s3.amazonaws.com";

    if (headers["cloudfront-is-desktop-viewer"]
        && headers["cloudfront-is-desktop-viewer"][0].value === "true") {
        return pcBucket;
    }

    if (headers["cloudfront-is-tablet-viewer"]
        && headers["cloudfront-is-tablet-viewer"][0].value === "true") {
        return pcBucket;
    }

    if (headers["cloudfront-is-mobile-viewer"]
        && headers["cloudfront-is-mobile-viewer"][0].value === "true") {
        return spBucket;
    }

    return spBucket;
};
```

オリジンリクエストは、以下のeventオブジェクトのJSONデータにマッピングされている。なお、一部のキーは省略している。

```yaml
{
  "Records": [
    {
      "cf": {
        "request": {
          "body": {
            "action": "read-only",
            "data": "",
            "encoding": "base64",
            "inputTruncated": false
          },
          "clientIp": "*.*.*.*",
          "headers": {
            "host": [
              {
                "key": "Host",
                "value": "prd-sp-bucket.s3.ap-northeast-1.amazonaws.com"
              }
            ],
            "cloudfront-is-mobile-viewer": [
              {
                "key": "CloudFront-Is-Mobile-Viewer",
                "value": true
              }
            ],
            "cloudfront-is-tablet-viewer": [
              {
                "key": "loudFront-Is-Tablet-Viewer",
                "value": false
              }
            ],
            "cloudfront-is-smarttv-viewer": [
              {
                "key": "CloudFront-Is-SmartTV-Viewer",
                "value": false
              }
            ],
            "cloudfront-is-desktop-viewer": [
              {
                "key": "CloudFront-Is-Desktop-Viewer",
                "value": false
              }
            ],
            "user-agent": [
              {
                "key": "User-Agent",
                "value": "Amazon CloudFront"
              }
            ]
          },
          "method": "GET",
          "origin": {
            "s3": {
              "authMethod": "origin-access-identity",                
              "customHeaders": {
                  "env": [
                      {
                          "key": "env",
                          "value": "prd"
                      }
                  ]
              },
              "domainName": "prd-sp-bucket.s3.amazonaws.com",
              "path": "",
              "port": 443,
              "protocol": "https",
              "region": "ap-northeast-1"
            }
          },
          "querystring": "",
          "uri": "/images/12345"
        }
      }
    }
  ]
}
```

<br>

## 02. LB

ℹ️ 参考：

- https://aws.amazon.com/jp/elasticloadbalancing/features/
- https://faq.support.nifcloud.com/faq/show/420?site_domain=default

| 負荷分散対象のOSI層 | ターゲット                      | リスナーの対応プロトコル  | LB名                           | セキュリティグループ |
| ----------- | ------------------------------- | ------------------------- | ------------------------------ | -------------------- |
| ```L7```          | IPアドレス、インスタンス、Lamba | HTTP、HTTPS、gRPC         | ALB：Application Load Balancer | 可                   |
| ```L4```          | IPアドレス、インスタンス、ALB   | TCP、UDP、TLS             | NLB：Network Load Balancer     | 不可                 |
| ```L3```、```L4```      | IPアドレス、インスタンス        | IP                        | GLB：Gateway Load Balancer     | 不可                 |
| ```L4```、```L7```      | なし                            | HTTP、HTTPS、TCP、SSL/TLS | CLB：Classic Load Balancer     | 可                   |

<br>

## 02-02. ALB：Application Load Balancing

### ALBとは

クラウドリバースプロキシサーバー、かつクラウドロードバランサーとして働く。リクエストを代理で受信し、EC2インスタンスへのアクセスをバランスよく分配することによって、サーバーへの負荷を緩和する。

ℹ️ 参考：https://www.slideshare.net/AmazonWebServicesJapan/application-load-balancer

![ALBの機能](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ALBの機能.png)

<br>

### セットアップ

#### ▼ 設定

| 設定項目             | 説明                                                         | 補足                                                         |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| リスナー             | ALBに割り振るポート番号と受信するプロトコルを設定する。リバースプロキシサーバーかつロードバランサ－として、これらの通信をターゲットグループにルーティングする。 |                                                              |
| スキマー             | パブリックネットワークからのインバウンド通信を待ち受けるか、あるいはプライベートネットワークからのインバウンド通信を待ち受けるかを設定する。 |                                                              |
| セキュリティポリシー | リクエストの送信者が使用するSSL/TLSプロトコルや暗号化方式のバージョンに合わせて、ALBが受信できるこれらのバージョンを設定する。 | ・リクエストの送信者には、ブラウザ、APIにリクエストを送信する外部サービス、転送元のAWSリソース（例：CloudFrontなど）、などを含む。<br>・ℹ️ 参考：https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html#describe-ssl-policies |
| ルール               | リクエストのルーティングのロジックを設定する。               |                                                              |
| ターゲットグループ   | ルーティング時に使用するプロトコルと、宛先とするポート番号を設定する。 | ターゲットグループ内のターゲットのうち、トラフィックはヘルスチェックがOKになっているターゲットにルーティングされる。 |
| ヘルスチェック       | ターゲットグループに属するプロトコルとアプリケーションのポート番号を指定して、定期的にリクエストを送信する。 |                                                              |

#### ▼ ターゲットグループ

| ターゲットの指定方法 | 補足                                                         |
| -------------------- | ------------------------------------------------------------ |
| インスタンス         | ターゲットが、EC2インスタンスでなければならない。            |
| IPアドレス           | ターゲットのパブリックIPアドレスが、静的でなければならない。 |
| Lambda               | ターゲットが、Lambdaでなければならない。                     |

<br>

### ルールの設定例

| ユースケース                                                 | ポート    | IF                                             | THEN                                                         |
| ------------------------------------------------------------ | --------- | ---------------------------------------------- | ------------------------------------------------------------ |
| リクエストが```80```番ポートを指定した時に、```443```番ポートにリダイレクトしたい。 | ```80```  | それ以外の場合はルーティングされないリクエスト | ルーティング先：```https://#{host}:443/#{path}?#{query}```<br>ステータスコード：```HTTP_301``` |
| リクエストが```443```番ポートを指定した時に、ターゲットグループに転送したい。 | ```443``` | それ以外の場合はルーティングされないリクエスト | 特定のターゲットグループ                                     |

<br>

### ALBインスタンス

#### ▼ ALBインスタンスとは

ALBの実体で、各ALBインスタンスが異なるグローバルIPアドレスを持つ。複数のAZにルーティングするようにALBを設定した場合、各AZにALBインスタンスが1つずつ配置される。

ℹ️ 参考：https://blog.takuros.net/entry/2019/08/27/075726

![alb-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/alb-instance.png)

#### ▼ 割り当てられるIPアドレス

ALBに割り当てられるIPアドレスには、VPCのものが適用される。そのため、EC2インスタンスのセキュリティグループでは、VPCのCIDRブロックを許可するように設定する必要がある。

#### ▼ 自動スケーリング

単一障害点にならないように、負荷が高まるとALBインスタンスが増えるように自動スケールアウトする仕組みを持つ。

#### ▼ ```500```系ステータスコードの原因

ℹ️ 参考：https://aws.amazon.com/jp/premiumsupport/knowledge-center/troubleshoot-http-5xx/

#### ▼ ALBのセキュリティグループ

Route53からルーティングされるパブリックIPアドレスを受信できるようにしておく必要がある。パブリックネットワークに公開するサイトであれば、IPアドレスは全ての範囲（```0.0.0.0/0```と``` ::/0```）にする。社内向けのサイトであれば、社内のプライベートIPアドレスのみ（```*.*.*.*/32```）を許可する。

<br>

### アプリケーションが常時SSLの場合

#### ▼ 問題

アプリケーションが常時SSLになっているアプリケーション（例：WordPress）の場合、ALBからアプリケーションにHTTPプロトコルでルーティングすると、HTTPSプロトコルへのリダイレクトループが発生してしまう。常時SSLがデフォルトになっていないアプリケーションであれば、これは起こらない。

ℹ️ 参考：https://cloudpack.media/525

#### ▼ webサーバーにおける対処方法

ALBを経由したリクエストには、リクエストヘッダーに```X-Forwarded-Proto```ヘッダーが付与される。これには、ALBに対するリクエストのプロトコルの種類が文字列で代入されている。これが『HTTPS』だった場合、webサーバーへのリクエストをHTTPSであるとみなすように対処する。これにより、アプリケーションへのリクエストのプロトコルがHTTPSとなる（こちらを行った場合は、アプリケーション側の対応不要）。

ℹ️ 参考：https://www.d-wood.com/blog/2017/11/29_9354.html

**＊実装例＊**

```apacheconf
SetEnvIf X-Forwarded-Proto https HTTPS=on
```

#### ▼ アプリケーションにおける対処方法

![ALBからEC2へのリクエストのプロトコルをHTTPSと見なす](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ALBからEC2へのリクエストのプロトコルをHTTPSと見なす.png)

ALBを経由したリクエストには、リクエストヘッダーに```HTTP_X_FORWARDED_PROTO```ヘッダーが付与される。これには、ALBに対するリクエストのプロトコルの種類が文字列で代入されている。そのため、もしALBに対するリクエストがHTTPSプロトコルだった場合は、ALBからアプリケーションへのリクエストもHTTPSであるとみなすように、```index.php```に追加実装を行う（こちらを行った場合は、webサーバー側の対応不要）。

ℹ️ 参考：https://www.d-wood.com/blog/2017/11/29_9354.html

**＊実装例＊**


```php
<?php
    
// index.php
if (isset($_SERVER["HTTP_X_FORWARDED_PROTO"])
    && $_SERVER["HTTP_X_FORWARDED_PROTO"] == "https") {
    $_SERVER["HTTPS"] = "on";
}
```

<br>

### ロードバランシングアルゴリズム

#### ▼ ロードバランシングアルゴリズムとは

ターゲットへのリクエスト転送時の加重ルールを設定する。

ℹ️ 参考：https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html#application-load-balancer-overview

#### ▼ ラウンドロビン

受信したリクエストを、ターゲットに均等にルーティングする。

#### ▼ 最小未処理リクエスト（ファステスト）

受信したリクエストを、未処理のリクエスト数が最も少ないターゲットにルーティングする。

ℹ️ 参考：https://www.infraexpert.com/study/loadbalancer4.html

<br>

## 02-03. NLB：Network Load Balancer

<br>

## 03. RDS：Relational Database Service

### セットアップ

#### ▼ DBエンジン

| 設定項目           | 説明                                                         | 補足                                                         |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| エンジンタイプ     | ミドルウェアのDBMSの種類を設定する。                         |                                                              |
| エディション       | エンジンバージョンでAuroraを選択した場合の互換性を設定する。 |                                                              |
| エンジンバージョン | DBエンジンのバージョンを設定する。DBクラスター内の全てのDBインスタンスに適用される。 | ・Auroraであれば、```SELECT AURORA_VERSION()```を使用して、エンジンバージョンを確認できる。 |

<br>

### Auroraと非Aurora

#### ▼ DBMSに対応するRDB

| DBMS       | RDB  | 互換性           |
| ---------- | ---- | ---------------- |
| Aurora     | RDS  | MySQL/PostgreSQL |
| MariaDB    | RDS  | MariaDB          |
| MySQL      | RDS  | MySQL            |
| PostgreSQL | RDS  | PostgreSQL       |

#### ▼ 機能の違い

RDBがAuroraか非Auroraかで機能に差があり、Auroraの方が耐障害性や可用性が高い。ただし、その分費用が高いことに注意する。

ℹ️ 参考：https://www.ragate.co.jp/blog/articles/10234

<br>

### OSの隠蔽

#### ▼ OSの隠蔽とは

RDSは、EC2内にDBMSが稼働したものであるが、このほとんどが隠蔽されている。そのためdbサーバーのようには操作できず、OSのバージョン確認やSSH接続を行えない。

ℹ️ 参考：https://xtech.nikkei.com/it/article/COLUMN/20131108/516863/

#### ▼ 確認方法

Linux x86_64が使用されているところまでは確認できるが、Linuxのバージョンは隠蔽されている。

```sql
# Auroraの場合
SHOW variables LIKE '%version%';

+-------------------------+------------------------------+
| Variable_name           | Value                        |
+-------------------------+------------------------------+
| aurora_version          | 2.09.0                       |
| innodb_version          | 5.7.0                        |
| protocol_version        | 10                           |
| slave_type_conversions  |                              |
| tls_version             | TLSv1,TLSv1.1,TLSv1.2        |
| version                 | 5.7.12-log                   |
| version_comment         | MySQL Community Server (GPL) |
| version_compile_machine | x86_64                       |
| version_compile_os      | Linux                        |
+-------------------------+------------------------------+
```

```sql
# 非Auroraの場合
SHOW variables LIKE '%version%';

+-------------------------+------------------------------+
| Variable_name           | Value                        |
+-------------------------+------------------------------+
| innodb_version          | 5.7.0                        |
| protocol_version        | 10                           |
| slave_type_conversions  |                              |
| tls_version             | TLSv1,TLSv1.1,TLSv1.2        |
| version                 | 5.7.0-log                    |
| version_comment         | Source distribution          |
| version_compile_machine | x86_64                       |
| version_compile_os      | Linux                        |
+-------------------------+------------------------------+
```

<br>

### メンテナンスウインドウ

#### ▼ メンテナンスウインドウ

DBクラスター/DBインスタンスの設定の変更をスケジューリングする。

ℹ️ 参考：https://dev.classmethod.jp/articles/amazon-rds-maintenance-questions/

#### ▼ メンテナンスの適切な曜日/時間帯

CloudWatchメトリクスの```DatabaseConnections```メトリクスから、DBの接続数が低くなる時間帯を調査し、その時間帯にメンテナンスウィンドウを設定する。また、メンテナンスウィンドウの実施曜日が週末であると、サイトが停止したまま休日を迎える可能性があるため、週末以外になるように設定する（メンテナンスウィンドウがUTCであることに注意）。

#### ▼ 『保留中の変更』『保留中のメンテナンス』

![rds_pending-maintenance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rds_pending-maintenance.png)

ユーザーが予定した設定変更は『保留中の変更』として表示される一方で、AWSによって定期的に行われるハードウェア/OS/DBエンジンのバージョンを強制アップグレードは『保留中のメンテナンス』として表示される。『次のメンテナンスウィンドウ』を選択すれば実行タイミングをメンテナンスウィンドウの間設定できるが、これを行わない場合は『日付の適用』に表示された時間帯に強制実行される。

ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.Maintenance.html

ちなみに保留中のメンテナンスは、アクションの『今すぐアップグレード』と『次のウィンドウでアップグレード』からも操作できる。

ℹ️ 参考：https://dev.classmethod.jp/articles/rds-pending-maintenance-actions/

![rds_pending-maintenance_action](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rds_pending-maintenance_action.png)

#### ▼ 保留中のメンテナンスの状態

| 状態           | 説明                                                                      |
| -------------- |-------------------------------------------------------------------------|
| 必須           | アクションは実行可能かつ必須である。実行タイミングは未定であるが、適用期限日には必ず実行され、これは延期できない。               |
| 利用可能       | アクションは実行できるが、推奨である。実行タイミングは未定である。                                       |
| 次のウィンドウ | アクションの実行タイミングは、次回のメンテナンスウィンドウである。後でアップグレードを選択することにより、『利用可能』の状態に戻すことも可能。 |
| 進行中         | 現在時刻がメンテナンスウィンドウに含まれており、アクションを実行中である。                                   |

#### ▼ 『次のウィンドウ』状態の取り消し

設定の変更が『次のウィンドウ』状態にある場合、画面上からは『必須』や『利用可能』といった実行タイミングが未定の状態に戻せない。しかし、CLIを使用すると戻せる。

ℹ️ 参考：https://dev.classmethod.jp/articles/mean-of-next-window-in-pending-maintenance-and-set-maintenance-schedule/

```bash
$ aws rds describe-pending-maintenance-actions --output=table

-----------------------------------------------------------------------------------
|                        DescribePendingMaintenanceActions                        |
+---------------------------------------------------------------------------------+
||                           PendingMaintenanceActions                           ||
|+---------------------+---------------------------------------------------------+|
||  ResourceIdentifier |  arn:aws:rds:ap-northeast-1:<アカウントID>:db:prd-foo-instance   ||
|+---------------------+---------------------------------------------------------+|
|||                       PendingMaintenanceActionDetails                       |||
||+--------------------------+--------------------------------------------------+||
|||  Action                  |  system-update # 予定されたアクション                |||
|||  AutoAppliedAfterDate    |  2022-01-31T00:00:00+00:00                       |||
|||  CurrentApplyDate        |  2022-01-31T00:00:00+00:00                       |||
|||  Description             |  New Operating System update is available        |||
|||  ForcedApplyDate         |  2022-03-30T00:00:00+00:00                       |||
||+--------------------------+--------------------------------------------------+||
||                           PendingMaintenanceActions                           ||
|+---------------------+---------------------------------------------------------+|
||  ResourceIdentifier |  arn:aws:rds:ap-northeast-1:<アカウントID>:db:prd-bar-instance   ||
|+---------------------+---------------------------------------------------------+|
|||                       PendingMaintenanceActionDetails                       |||
||+--------------------------+--------------------------------------------------+||
|||  Action                  |  system-update                                   |||
|||  AutoAppliedAfterDate    |  2022-01-31T00:00:00+00:00                       |||
|||  CurrentApplyDate        |  2022-01-31T00:00:00+00:00                       |||
|||  Description             |  New Operating System update is available        |||
|||  ForcedApplyDate         |  2022-03-30T00:00:00+00:00                       |||
||+--------------------------+--------------------------------------------------+||
```

```bash
$ aws rds apply-pending-maintenance-action \
  --resource-identifier arn:aws:rds:ap-northeast-1:<アカウントID>:db:prd-foo-instance \
  --opt-in-type undo-opt-in \
  --apply-action <取り消したいアクション名>
```

#### ▼ 『保留中の変更』の取り消し

保留中の変更を画面上からは取り消せない。しかし、CLIを使用すると戻せる。

ℹ️ 参考：

- https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.DBInstance.Modifying.html#USER_ModifyInstance.ApplyImmediately
- https://qiita.com/tinoji/items/e150ffdc2045e8b85a56

```bash
$ aws rds modify-db-instance \
    --db-instance-identifier prd-foo-instance \
    <変更前の設定項目> <変更前の設定値> \
    --apply-immediately
```

#### ▼ ミドルウェアのアップグレードの調査書

以下のような報告書のもと、調査と対応を行う。

ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Updates.html

またマージされる内容の調査のため、リリースノートの確認が必要になる。

ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Updates.11Updates.html

```markdown
# 調査

## バージョンの違い

『SELECT AURORA_VERSION()』を使用して、正確なバージョンを取得する。

## マージされる内容

ベンダーのリリースノートを確認し、どのような『機能追加』『バグ修正』『機能廃止』『非推奨機能』がマージされるかを調査する。
機能廃止や非推奨機能がある場合、アプリケーション内のSQL文に影響が出る可能性がある。

## 想定されるダウンタイム

テスト環境でダウンタイムを計測し、ダウンタイムを想定する。
```

```markdown
# 本番環境対応

## 日時と周知

対応日時と周知内容を決定する。

## 想定外の結果

本番環境での対応で発生した想定外の結果を記載する。
```

<br>

## 03-02. RDS（Aurora）

### セットアップ

#### ▼ DBクラスター

ベストプラクティスについては、以下のリンクを参考にせよ。

ℹ️ 参考：https://www.trendmicro.com/cloudoneconformity/knowledge-base/aws/RDS/

| 設定項目                | 説明                                                         | 補足                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------- | ------------------------------------------------------------ |---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| レプリケーション        | 単一のプライマリーインスタンス（シングルマスター）または複数のプライマリーインスタンス（マルチマスター）とするかを設定する。 | フェイルオーバーを利用したダウンタイムの最小化時に、マルチマスターであれば変更の順番を気にしなくてよくなる。ただし、DBクラスターをクローンできないなどのデメリットもある。<br>ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-multi-master.html#aurora-multi-master-terms                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| DBクラスター識別子      | DBクラスター名を設定する。                                   | インスタンス名は、最初に設定できず、RDSの作成後に設定できる。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| VPCとサブネットグループ | DBクラスターを配置するVPCとサブネットを設定する。            | DBが配置されるサブネットはプライベートサブネットにする、これには、data storeサブネットと名付ける。アプリケーション以外は、踏み台サーバー経由でしかDBにアクセスできないようにする。<br>![subnet_component-type](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/subnet_component-type.png)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| パラメーターグループ    | グローバルパラメーターを設定する。                           | デフォルトを使用せずに独自定義する場合、事前に作成しておく必要がある。クラスターパラメーターグループとインスタンスパラメーターグループがあるが、全てのインスタンスに同じパラメーターループを設定するべきなため、クラスターパラメーターを使用すれば良い。各パラメーターに適用タイプ（dynamic/static）があり、dynamicタイプは設定の適用に再起動が必要である。新しく作成したクラスタパラメーターグループにて以下の値を設定すると良い。<br>・```time_zone=Asia/Tokyo```<br>・```character_set_client=utf8mb4```<br>・```character_set_connection=utf8mb4```<br>・```character_set_database=utf8mb4```<br>・```character_set_results=utf8mb4```<br>・```character_set_server=utf8mb4```<br>・```server_audit_logging=1```（監査ログをCloudWatchに送信するか否か）<br>・```server_audit_logs_upload=1```<br>・```general_log=1```（通常クエリログをCloudWatchに送信するか否か）<br>・```slow_query_log=1```（スロークエリログをCloudWatchに送信するか否か）<br>・```long_query_time=3```（スロークエリと見なす最短秒数） |
| DB認証                  | DBに接続するための認証方法を設定する。                       | 各DBインスタンスに異なるDB認証を設定できるが、全てのDBインスタンスに同じ認証方法を設定すべきなため、DBクラスターでこれを設定すれば良い。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| マスタユーザー名        | DBのrootユーザーを設定                                       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| マスターパスワード      | DBのrootユーザーのパスワードを設定                           |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| バックアップ保持期間    | DBクラスター がバックアップを保持する期間を設定する。        | ```7```日間にしておく。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ログのエクスポート      | CloudWatchログに送信するログを設定する。                     | 必ず、全てのログを選択すること。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| セキュリティグループ  | DBクラスターのセキュリティグループを設定する。               | コンピューティングからのインバウンド通信のみを許可するように、これらのプライベートIPアドレス（```*.*.*.*/32```）を設定する。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 削除保護                | DBクラスターの削除を防ぐ。                                   | DBクラスターを削除するとクラスターボリュームも削除されるため、これを防ぐ。ちなみに、DBクラスターの削除保護になっていてもDBインスタンスは削除できる。DBインスタンスを削除しても、再作成すればクラスターボリュームに接続されて元のデータにアクセスできる。<br>ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_DeleteCluster.html#USER_DeletionProtection                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

#### ▼ DBインスタンス

ベストプラクティスについては、以下のリンクを参考にせよ。

ℹ️ 参考：https://www.trendmicro.com/cloudoneconformity/knowledge-base/aws/RDS/

| 設定項目                               | 説明                                                         | 補足                                                         |
| -------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| インスタンスクラス                     | DBインスタンスのスペックを設定する。                         | バースト可能クラスを選択すること。ちなみに、AuroraのDBサイズは自動でスケーリングするため、設定する必要がない。 |
| パブリックアクセス                     | DBインスタンスにIPアドレスを割り当てるか否かを設定する。     |                                                              |
| キャパシティタイプ                     |                                                              |                                                              |
| マルチAZ配置                           | プライマリーインスタンスとは別に、リードレプリカをマルチAZ配置で追加するか否かを設定する。 | 後からでもリードレプリカを追加できる。また、フェイルオーバー時にリードレプリカが存在していなければ、昇格後のプライマリーインスタンスが自動で作成される。 |
| 最初のDB名                             | DBインスタンスに自動的に作成されるDB名を設定                 |                                                              |
| マイナーバージョンの自動アップグレード | DBインスタンスのDBエンジンのバージョンを自動的に更新するかを設定する。 | 開発環境では有効化、本番環境とステージング環境では無効化しておく。開発環境で新しいバージョンに問題がなければ、ステージング環境と本番環境にも適用する。 |

<br>

### DBクラスター

#### ▼ DBクラスターとは

DBエンジンにAuroraを選択した場合にのみ使用できる。DBインスタンスとクラスターボリュームから構成されている。コンピューティングとして機能するDBインスタンスと、ストレージとして機能するクラスターボリュームが分離されているため、DBインスタンスが誤って全て削除されてしまったとしても、データを守れる。また、両者が分離されていないエンジンタイプと比較して、再起動が早いため、再起動に伴うダウンタイムが短い。

ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Concepts.AuroraHighAvailability.html

![aurora-db-cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/aurora-db-cluster.png)

#### ▼ 空のDBクラスター

コンソール画面にて、DBクラスター内の全てのDBインスタンスを削除すると、DBクラスターも自動で削除される。一方で、AWS-APIをコールして全てのDBインスタンスを削除する場合、DBクラスターは自動で削除されずに、空の状態になる。例えば、Terraformを使用してDBクラスターを作成する時に、インスタンスの作成に失敗するとDBクラスターが空になる、これは、TerraformがAWS-APIをコールした作成を行っているためである。

ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_DeleteCluster.html#USER_DeleteCluster.DeleteCluster

#### ▼ グローバルクラスター

![aurora-db-cluster_global](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/aurora-db-cluster_global.png)

リージョン間に跨いだDBクラスターから構成されている。メインリージョンにあるプライマリークラスターのクラスターボリュームと、DRリージョンのセカンダリークラスターのクラスターボリュームのデータは、定期的に同期される。プライマリインスタンスは、プライマリークラスターのみに存在している。メインリージョンで障害が起こった場合は、以下が起こる。

（１）メインリージョンで障害が発生する。

（２）DRリージョンのセカンダリークラスターがプライマリークラスターに昇格し、クラスター内のリードレプリカインスタンスがプライマリインスタンスになる。

（３）メインリージョンのプライマリーインスタンスをフェイルオーバーさせる。各種エンドポイントが無効化され、アクセスできなくなる（```NXDOMAIN```になる）。

（４）メインリージョンの障害が回復する。

（５）DRリージョンをフェイルオーバーさせる。メインリージョンのクラスターがプライマリークラスター、DRリージョンのクラスターがセカンダリークラスターになる。

参考：

- https://dev.classmethod.jp/articles/amazon-aurora-global-database-failover-between-region/
- https://qiita.com/minorun365/items/2530cf1d1f5793c15c79

<br>

### DBインスタンス

#### ▼ DBインスタンスとは

コンピューティング機能を持ち、クラスターボリュームを操作できる。

#### ▼ DBインスタンスの種類

|                | プライマリーインスタンス                               | リードレプリカ                                    |
| -------------- |--------------------------------------------|--------------------------------------------|
| ロール         | 読み出し/書き込みインスタンス                            | 読み出しオンリーインスタンス                             |
| CRUD制限       | 制限なし。ユーザーの認可スコープに依存する。                     | ユーザーの認可スコープに関係なく、READしか実行できない。             |
| エンドポイント | 各DBインスタンスに、リージョンのイニシャルに合わせたエンドポイントが割り振られる。 | 各DBインスタンスに、リージョンのイニシャルに合わせたエンドポイントが割り振られる。 |
| データ同期     | DBクラスターに対するデータ変更を受けつける。                    | 読み出し/書き込みインスタンスのデータの変更が同期される。              |

#### ▼ ZDP（ゼロダウンタイムパッチ適用）

![zero-downtime-patching](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/zero-downtime-patching.png)

Auroraをエンジンバージョンに選択した場合に使用できる。特定の条件下でのみ、アプリケーションとプライマリーインスタンスの接続を維持したまま、プライマリーインスタンスのパッチバージョンをアップグレードできる。ゼロダウンタイムパッチ適用が発動した場合、RDSのイベントが記録される。ただし、この機能に頼り切らない方が良い。ゼロダウンタイムパッチ適用の発動はAWSから事前にお知らせされるわけでもなく、ユーザーが条件を見て発動の有無を判断しなければならない。また、実際に発動していても、ダウンタイムが発生した事例が報告されている。ゼロダウンタイムパッチ適用時、以下の手順でエンジンバージョンがアップグレードされる。

（１）プライマリーインスタンスのエンジンがアップグレードされ、この時にダウンタイムが発生しない代わりに、```5```秒ほどプライマリーインスタンスのパフォーマンスが低下する。

（２）リードレプリカが再起動され、この時に```20```～```30```秒ほどダウンタイムが発生する。これらの仕組みのため、アプリケーションでは読み出しエンドポイントを接続先として使用しないようにする必要がある。

ℹ️ 参考：

- https://qiita.com/tonishy/items/542f7dd10cc43fd299ab
- https://qiita.com/tmiki/items/7ade95c33b8e43c7cb5f
- https://noname.work/2407.html
- https://www.yuulinux.tokyo/8070/

<br>

### エンドポイント

![rds_endpoint](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rds_endpoint.png)

| エンドポイント名           | 役割              | エンドポイント：ポート番号                                   | 説明                                                         |
| -------------------------- | ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| クラスターエンドポイント   | 書き込み/読み出し | ```<DBクラスター名>.cluster-<id>.ap-northeast-1.rds.amazonaws.com:<ポート番号>``` | プライマリーインスタンスに通信できる。プライマリーインスタンスがダウンし、フェイルオーバーによってプライマリーインスタンスとリードレプリカが入れ替わった場合、エンドポイントの転送先は新しいプライマリーインスタンスに変更される。<br>ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.Endpoints.html#Aurora.Endpoints.Cluster |
| リーダーエンドポイント     | 読み出し          | ```<DBクラスター名>.cluster-ro-<id>.ap-northeast-1.rds.amazonaws.com:<ポート番号>``` | リードレプリカに通信できる。DBインスタンスが複数ある場合、クエリが自動的に割り振られる。フェイルオーバーによってプライマリーインスタンスとリードレプリカが入れ替わった場合、エンドポイントの転送先は新しいプライマリーインスタンスに変更される。もしリードレプリカが全てダウンし、プライマリーインスタンスしか稼働していない状況の場合、プライマリーインスタンスに転送するようになる。<br>ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.Endpoints.html#Aurora.Endpoints.Reader |
| インスタンスエンドポイント |                   | ```<DBインスタンス名>.cwgrq25vlygf.ap-northeast-1.rds.amazonaws.com:<ポート番号>``` | 選択したDBインスタンスに通信できる。フェイルオーバーによってプライマリーインスタンスとリードレプリカが入れ替わっても、エンドポイントそのままなため、アプリケーションが影響を付ける。非推奨である。 |

<br>

### ダウンタイム

#### ▼ ダウンタイムとは

Auroraでは、設定値（例：OS、エンジンバージョン、MySQL）のアップグレード時に、DBインスタンスの再起動が必要である。再起動に伴ってダウンタイムが発生し、アプリケーションからDBに接続できなくなる。この間、アプリケーションの利用者に与える影響を小さくできるように、計画的にダウンタイムを発生させる必要がある。

#### ▼ ダウンタイムの発生条件

非Auroraに記載された情報のため、厳密にはAuroraのダウンタイムではない。ただし、経験上同じ項目でダウンタイムが発生しているため、参考にする。

ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.DBInstance.Modifying.html#USER_ModifyInstance.Settings

#### ▼ エンジンタイプによるダウンタイムの最小化

コンピューティングとストレージが分離しているAuroraはエンジンタイプの中でもダウンタイムが短い。

#### ▼ ダウンタイムの計測例

アプリケーションにリクエストを送信する方法と、RDSにクエリを直接的に送信する方法がある。レスポンスとRDSイベントログから、ダウンタイムを計測する。

**＊実装例＊**

Aurora MySQLのアップグレードに伴うダウンタイムを計測する。踏み台サーバーを経由してRDSに接続し、現在時刻を取得するSQLを送信する。この時、```for```文や```watch```コマンドを使用する。ただし、```watch```コマンドはプリインストールされていない可能性がある。平常アクセス時のも同時に実行することにより、より正確なダウンタイムを取得する。また、ヘルスチェックの時刻を正しくロギングできるように、ローカルマシンから時刻を取得する。

```bash
#!/bin/bash

set -x

BASTION_HOST=""
BASTION_USER=""
DB_HOST=""
DB_PASSWORD=""
DB_USER=""
SECRET_KEY="~/.ssh/foo.pem"
SQL="SELECT NOW();"

ssh -o serveraliveinterval=60 -f -N -L 3306:${DB_HOST}:3306 -i ${SECRET_KEY} ${BASTION_USER}@${BASTION_HOST} -p 22

# 約15分間コマンドを繰り返す。
for i in {1..900}; do
  echo "---------- No. ${i} Local PC: $(date +"%Y-%m-%d %H:%M:%S") ------------" >> health_check.txt
  echo "$SQL" | mysql -u "$DB_USER" -P 3306 -p"$DB_PASSWORD" >> health_check.txt 2>&1
  # 1秒待機する。
  sleep 1
done
```

```bash
#!/bin/bash

set -x

BASTION_HOST=""
BASTION_USER=""
DB_HOST=""
DB_PASSWORD=""
DB_USER=""
SECRET_KEY="~/.ssh/foo.pem"
SQL="SELECT NOW();"

ssh -o serveraliveinterval=60 -f -N -L 3306:${DB_HOST}:3306 -i ${SECRET_KEY} ${BASTION_USER}@${BASTION_HOST} -p 22

# 1秒ごとにコマンドを繰り返す。
watch -n 1 'echo "---------- No. ${i} Local PC: $(date +"%Y-%m-%d %H:%M:%S") ------------" >> health_check.txt && \
  echo ${SQL} | mysql -u ${DB_USER} -P 3306 -p${DB_PASSWORD} >> health_check.txt 2>&1'
```

上記のシェルスクリプトにより、例えば次のようなログを取得できる。このログからは、```15:23:09``` 〜 ```15:23:14```の間で、接続に失敗していることを確認できる。

```log
---------- No. 242 Local PC: 2021-04-21 15:23:06 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
NOW()
2021-04-21 06:23:06
---------- No. 243 Local PC: 2021-04-21 15:23:07 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
NOW()
2021-04-21 06:23:08
---------- No. 244 Local PC: 2021-04-21 15:23:08 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 2026 (HY000): SSL connection error: error:00000000:lib(0):func(0):reason(0)
---------- No. 245 Local PC: 2021-04-21 15:23:09 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading initial communication packet', system error: 0
---------- No. 246 Local PC: 2021-04-21 15:23:10 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading initial communication packet', system error: 0
---------- No. 247 Local PC: 2021-04-21 15:23:11 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading initial communication packet', system error: 0
---------- No. 248 Local PC: 2021-04-21 15:23:13 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading initial communication packet', system error: 0
---------- No. 249 Local PC: 2021-04-21 15:23:14 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading initial communication packet', system error: 0
---------- No. 250 Local PC: 2021-04-21 15:23:15 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
NOW()
2021-04-21 06:23:16
---------- No. 251 Local PC: 2021-04-21 15:23:16 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
NOW()
2021-04-21 06:23:17
```

アップグレード時のプライマリーインスタンスのRDSイベントログは以下の通りで、ログによるダウンタイムは、再起動からシャットダウンまでの期間と一致することを確認する。

![rds-event-log_primary-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rds-event-log_primary-instance.png)

ちなみに、リードレプリカは再起動のみを実行していることがわかる。

![rds-event-log_read-replica](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rds-event-log_read-replica.png)

<br>

### フェイルオーバー

#### ▼ Auroraのフェイルオーバーとは

プライマリーインスタンスで障害が起こった場合に、リードレプリカをプライマリーインスタンスに自動的に昇格する。DBクラスター内の全てのDBインスタンスが同じAZに配置されている場合、あらかじめ異なるAZにリードレプリカを新しく作成する必要がある。また、フェイルオーバー時に、もしDBクラスター内にリードレプリカが存在していない場合、異なるAZに昇格後のプライマリーインスタンスが自動的に作成される。リードレプリカが存在している場合、これがプライマリーインスタンスに昇格する。

ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Concepts.AuroraHighAvailability.html#Aurora.Managing.FaultTolerance

#### ▼ フェイルオーバーによるダウンタイムの最小化

DBインスタンスがマルチAZ構成の場合、以下の手順を使用してダウンタイムを最小化できる。

ℹ️ 参考：https://lab.taf-jp.com/rds%E3%81%AE%E3%83%95%E3%82%A7%E3%82%A4%E3%83%AB%E3%82%AA%E3%83%BC%E3%83%90%E3%83%BC%E6%99%82%E3%81%AE%E6%8C%99%E5%8B%95%E3%82%92%E7%90%86%E8%A7%A3%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B/

（１）アプリケーションの接続先をプライマリーインスタンスにする。

（２）リードレプリカにダウンタイムの発生する変更を適用する。Auroraではフェールオーバーが自動で実行される。

（３）フェイルオーバー時に約```1```～```2```分のダウンタイムが発生する。フェイルオーバーを使用しない場合、DBインスタンスの再起動でダウンタイムが発生するが、これよりは時間が短いため、相対的にダウンタイムを短縮できる。

#### ▼ DBインスタンスの昇格優先順位

Auroraの場合、フェイルオーバーによって昇格するDBインスタンスは次の順番で決定される。DBインスタンスごとにフェイルオーバーの優先度（```0```～```15```）を設定でき、優先度の数値の小さいDBインスタンスほど優先され、昇格対象になる。優先度が同じだと、インスタンスクラスが大きいDBインスタンスが昇格対象になる。インスタンスクラスが同じだと、同じサブネットにあるDBインスタンスが昇格対象になる。

1. 優先度の順番
2. インスタンスクラスの大きさ
3. 同じサブネット

ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Concepts.AuroraHighAvailability.html

#### ▼ ダウンタイムを最小化できない場合

エンジンバージョンのアップグレードは両方のDBインスタンスで同時に実行する必要があるため、フェイルオーバーを使用できず、ダウンタイムを最小化できない。

<br>

### 負荷対策

#### ▼ エンドポイントの使い分け

DBインスタンスに応じたエンドポイントが用意されている。アプリケーションからのCRUDの種類に応じて、アクセス先を振り分けることにより、負荷を分散させられる。読み出しオンリーエンドポイントに対して、READ以外の処理を行うと、以下の通り、エラーとなる。


```bash
/* SQL Error (1290): The MySQL server is running with the --read-only option so it cannot execute this statement */
```

#### ▼ リードレプリカの手動追加、オートスケーリング

リードレプリカの手動追加もしくはオートスケーリングによって、Auroraに関するメトリクス（例：平均CPU使用率、平均DB接続数、など）がターゲット値を維持できるように、リードレプリカの水平スケーリング（リードレプリカ数の増減）を実行する。注意点として、RDS（非Aurora）スケーリングは、ストレージサイズを増加させる垂直スケーリングであり、Auroraのスケーリングとは仕様が異なっている。

ℹ️ 参考：

- https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Integrating.AutoScaling.html
- https://engineers.weddingpark.co.jp/aws-aurora-autoscaling/
- https://qiita.com/1_ta/items/3880a8da8a29e4c8d8f0

#### ▼ クエリキャッシュの利用

MySQLやRedisのクエリキャッシュ機能を利用する。ただし、MySQLのクエリキャッシュ機能は、バージョン```8```で廃止されることになっている。

#### ▼ ユニークキーまたはインデックスの利用

スロークエリを検出し、そのSQLで対象としているカラムにユニークキーやインデックスを設定する。スロークエリを検出する方法として、RDSの```long_query_time```パラメーターに基づいた検出や、```EXPLAIN```句による予想実行時間の比較などがある。ユニークキー、インデックス、```EXPLAIN```句、については以下のリンクを参考にせよ。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_middleware_database_rdbms_mysql_query.html

#### ▼ テーブルを正規化し過ぎない

テーブルを正規化すると保守性が高まるが、アプリケーションのSQLで```JOIN```句が必要になる。しかし、```JOIN```句を含むSQLは、含まないSQLと比較して、実行速度が遅くなる。そこで、戦略的に正規化し過ぎないようにする。

#### ▼ インスタンスタイプのスケールアップ

インスタンスタイプをスケールアップさせることにより、接続過多のエラー（```ERROR 1040 (HY000): Too many connections```）に対処する。ちなみに現在の最大接続数はパラメーターグループの値から確認できる。コンソール画面からはおおよその値しかわからないため、SQLで確認した方が良い。

```sql
SHOW GLOBAL VARIABLES LIKE 'max_connections';

+-----------------+-------+
| Variable_name  | Value |
+-----------------+-------+
| max_connections | 640  |
+-----------------+-------+
1 row in set (0.00 sec)
```

<br>

### イベント

コンソール画面ではイベントが英語で表示されているため、リファレンスも英語でイベントを探した方が良い。

ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_Events.Messages.html

<br>

## 03-03. RDS（非Aurora）

### ダウンタイム

#### ▼ ダウンタイムの発生条件

ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.DBInstance.Modifying.html#USER_ModifyInstance.Settings

| 変更する項目                         | ダウンタイムの有無 | 補足                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------ | ------------------ |-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| インスタンスクラス                   | あり               | ・```2```個のインスタンスで同時にインスタンスクラスを変更すると、次のようなイベントを確認できる。インスタンスが複数回再起動することからわかる通り、長いダウンタイム（約```6```～```8```分）が発生する。そのため、フェイルオーバーを利用したダウンタイムの最小化を行う。<br>ℹ️ 参考https://dev.classmethod.jp/articles/rds-scaleup-instancetype/<br>・プライマリーインスタンスのイベント<br>![rds_change-instance-class_primary-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rds_change-instance-class_primary-instance.png)<br>・リードレプリカのイベント<br>![rds_change-instance-class_read-replica](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rds_change-instance-class_read-replica.png) |
| サブネットグループ                   | あり               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| エンジンバージョン                   | あり               | ```20```～```30```秒のダウンタイムが発生する。この時間は、ワークロード、クラスターサイズ、バイナリログデータのサイズ、ゼロダウンタイムパッチ適用の発動可否、によって変動する。<br>ℹ️ 参考：<br>・https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Updates.html<br>・https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Updates.Patching.html#AuroraMySQL.Updates.AMVU<br>また、メジャーバージョンのアップグレードには```10```分のダウンタイムが発生する。<br>ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.MySQL.html#USER_UpgradeDBInstance.MySQL.Major.Overview                                                                         |
| メンテナンスウィンドウ               | 条件付きでなし     | ダウンタイムが発生する操作が保留中になっている状態で、メンテナンス時間を現在が含まれるように変更すると、保留中の操作がすぐに適用される。そのため、ダウンタイムが発生する。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| パフォーマンスインサイト             | 条件付きでなし     | パフォーマンスインサイトの有効化ではダウンタイムが発生しない。ただし、有効化のためにパラメーターグループの```performance_schema```を有効化する必要がある。パラメーターグループの変更をDBインスタンスに反映させる上で再起動が必要なため、ここでダウンタイムが発生する。                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| バックアップウインドウ               | 条件付きでなし     | ```0```から```0```以外の値、```0```以外の値から```0```に変更した場合、ダウンタイムが発生する。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| パラメーターグループ                 | なし               | パラメーターグループ自体の変更ではダウンタイムは発生しない。また、静的パラメーターはパラメーターグループの変更に合わせて適用される。ただし、動的パラメーターを変更した場合は、これをDBインスタンスに反映させるために再起動が必要であり、ここでダウンタイムが発生する。<br>ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithParamGroups.html                                                                                                                                                                                                                                                                                                                                                                 |
| セキュリティグループ               | なし               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| マイナーバージョン自動アップグレード | なし               | エンジンバージョンの変更にはダウンタイムが発生するが、自動アップグレードの設定にはダウンタイムが発生しない。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ストレージのオートスケーリング       | なし               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

<br>

### フェイルオーバー

#### ▼ RDSのフェイルオーバーとは

スタンバイレプリカがプライマリーインスタンスに昇格する。

  ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html

#### ▼ フェイルオーバーによるダウンタイムの最小化

DBインスタンスがマルチAZ構成の場合、以下の手順を使用してダウンタイムを最小化できる。

ℹ️ 参考：https://lab.taf-jp.com/rds%E3%81%AE%E3%83%95%E3%82%A7%E3%82%A4%E3%83%AB%E3%82%AA%E3%83%BC%E3%83%90%E3%83%BC%E6%99%82%E3%81%AE%E6%8C%99%E5%8B%95%E3%82%92%E7%90%86%E8%A7%A3%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B/

（１）アプリケーションの接続先をプライマリーインスタンスにする。

（２）特定の条件下でのみ、フェイルオーバーが自動的に実行される。

ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html#Concepts.MultiAZ.Failover

（3）非AuroraのRDSでは条件に当てはまらない場合、リードレプリカを手動でフェイルオーバーさせる。

ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.MySQL.html#USER_UpgradeDBInstance.MySQL.ReducedDowntime

（4）フェイルオーバー時に約```1```～```2```分のダウンタイムが発生する。フェイルオーバーを使用しない場合、DBインスタンスの再起動でダウンタイムが発生するが、これよりは時間が短いため、相対的にダウンタイムを短縮できる。

<br>

### イベント

コンソール画面ではイベントが英語で表示されているため、リファレンスも英語でイベントを探した方が良い。

ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Events.Messages.html

<br>

## 04. Redshit

### Redshitとは

データウェアハウスとして働く。データベースよりも柔軟性の高い保存形式で処理済みのデータを管理できる。

<br>

## 05. Route53

### Route53とは

クラウドDNSサーバーとして働く。リクエストされたドメイン名とEC2のグローバルIPアドレスをマッピングしている。名前の由来は、名前解決時に```53```番ポートを使用するためである。

ℹ️ 参考：https://go-journey.club/archives/2665

<br>

### セットアップ

| 設定項目       | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| ホストゾーン   | ドメイン名を設定する。                                       |
| レコードセット | 名前解決時のルーティング方法を設定する。サブドメイン名を扱うことも可能。 |

<br>

### レコード

#### ▼ レコードとは

各ホストゾーンにドメインの名前解決方法を定義したレコードを設定する。

ℹ️ 参考：https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/welcome-dns-service.html#welcome-dns-service-how-to-configure

#### ▼ レコードタイプの種類

| レコードタイプ | 説明                                                         | 名前解決の仕組み                             | 補足                                            |
| -------------- | ------------------------------------------------------------ | -------------------------------------------- | ----------------------------------------------- |
| A              | リクエストを転送したいAWSリソースの、IPv4アドレスまたはDNS名を設定する。 | IPv4アドレスが返却される。                   |                                                 |
| AAAA           | リクエストを転送したいAWSリソースの、IPv6アドレスまたはDNS名を設定する。 | IPv6アドレスが返却される。                   |                                                 |
| CNAME          | リクエストを転送したい任意のサーバーのドメイン名を設定する。 | ドメイン名にリダイレクトする。               | 設定するドメイン名はAWSリソースでなくとも良い。 |
| NS             | IPアドレスの問い合わせに応えられるDNSサーバーの名前が定義されている。 | DNSサーバーの名前が返却される。              |                                                 |
| MX             | リクエストを転送したいメールサーバーのドメイン名を設定する。 | メールサーバーのドメイン名が返却される。     |                                                 |
| TXT            | リクエストを転送したいサーバーのドメイン名に紐付けられた文字列を設定する。 | ドメイン名に紐づけられた文字列が返却される。 |                                                 |

#### ▼ AWSリソースのDNS名、ドメイン名、エンドポイント名

![URLと電子メールの構造](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/URLと電子メールの構造.png)

| 種別             | AWSリソース     | 例                                                           |
| ---------------- | --------------- | ------------------------------------------------------------ |
| DNS名            | ALB             | ```<ALB名>-<ランダムな文字列>.ap-northeast-1.elb.amazonaws.com``` |
|                  | EC2             | ```ec2-<パブリックIPをハイフン区切りにしたもの>.ap-northeast-1.compute.amazonaws.com``` |
| ドメイン名       | CloudFront      | ```<ランダムな文字列>.cloudfront.net```                      |
| エンドポイント名 | RDS（Aurora）   | ```<DBクラスター名><ランダムな文字列>.ap-northeast-1.rds.amazonaws.com.``` |
|                  | RDS（非Aurora） | ```<DBインスタンス名><ランダムな文字列>.ap-northeast-1.rds.amazonaws.com.``` |
|                  | S3              | ```<バケット名>.ap-northeast-1.amazonaws.com```              |

#### ▼ AWS以外でドメインを購入した場合

ドメイン名の名前解決は、ドメインを購入したドメインレジストラで行われる。そのため、AWS以外（例：お名前ドットコム）でドメインを購入した場合、Route53のNSレコード値を、ドメインを実際に購入したサービスのドメインレジストラに登録する必要がある。これにより、ドメインレジストラに対してIPアドレスの問い合わせがあった場合は、Route53のNSレコード値がDNSサーバーにレスポンスされるようになる。DNSサーバーがRoute53に問い合わせると、Route53はDNSサーバーとして機能し、アプリケーションのIPアドレスをレスポンスする。

#### ▼ DNSキャッシュ

ルートサーバーは世界に13機しか存在しておらず、現実的には、世界中の名前解決の全てのリクエストを処理できない。そこで、IPアドレスとドメイン名の関係をキャッシュするプロキシサーバー（キャッシュDNSサーバー）が使用されている。基本的には、プロキシサーバーとDNSサーバーは区別されるが、Route53はプロキシサーバーとDNSサーバーの機能を両立している。

<br>

### リゾルバー

#### ▼ リゾルバーとは

調査中...

<br>

### ルーティングポリシー

#### ▼ ルーティングポリシーとは

ドメイン名の名前解決ルールを設定する。

ℹ️ 参考：

- https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html
- https://zenn.dev/seyama/articles/02118b0914183e

#### ▼ シンプル

ドメイン名に単一のIPアドレスを紐付けられる。ドメインの名前解決では、単一のIPアドレスが返却される。

#### ▼ 複数値回答

ドメイン名に複数のIPアドレスを紐付けられる。ドメインの名前解決では、正常なIPアドレスを均等に返却する。ヘルスチェック機能を持つラウンドロビン方式と言い換えても良い。

#### ▼ 加重

ドメイン名に複数のIPアドレスを紐付けられる。ドメインの名前解決では、IPアドレスを指定した割合で返却する。

<br>

### Route53 + DNSサーバーによる名前解決

![Route53を含む名前解決の仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Route53を含む名前解決の仕組み.png)

（１）クライアントPCは、```www.example.com```にマッピングされるIPアドレスのキャッシュを検索する。キャッシュが無ければ、クライアントPCはドメイン名をキャッシュDNSサーバーに問い合わせる。

（２）キャッシュDNSサーバーは、IPアドレスのキャッシュを検索する。キャッシュが無ければ、キャッシュDNSサーバーはドメイン名をDNSサーバーに問い合わせる。

（３）Route53は、IPアドレスのキャッシュを検索する。キャッシュが無ければ、Route53はIPアドレスを検索する。また、キャッシュDNSサーバーにこれを返却する。


|      ドメイン名      | Route53 |      IPアドレス       |
| :--------------------------: | :-----: | :-------------------: |
| ```http://www.example.com``` |    ⇄    | ```203.142.205.139``` |

（４）キャッシュDNSサーバーは、IPアドレスをNATに返却する。この時、IPアドレスのネットワーク間変換が起こる。

（５）NATは、IPアドレスをクライアントPCに返却する。

（６）クライアントPCは、返却されたIPアドレスを基にWebページにリクエストを送信する。

<br>
