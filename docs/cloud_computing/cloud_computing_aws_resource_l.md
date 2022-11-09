---
title: 【IT技術の知見】Lで始まるAWSリソース＠AWS
description: Lで始まるAWSリソース＠AWSの知見を記録しています。
---

# ```L```で始まるAWSリソース＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Lambda

### Lambdaとは

他のAWSリソースのイベントによって駆動する関数を管理できる。ユースケースについては、以下のリンクを参考にせよ。

> ℹ️ 参考：https://docs.aws.amazon.com/lambda/latest/dg/applications-usecases.html

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
| 宛先               | LambdaからアクセスできるようにするAWSリソースを設定する。                  | 宛先のAWSリソースのポリシーは自動的に修正されないため、別途、手動で修正する必要がある。 |
| 環境変数              | Lambdaの関数内に出力する環境変数を設定する。                          | デフォルトでは、環境変数はAWSマネージド型KMSキーによって暗号化される。 |
| 同時実行数             | 同時実行の予約を設定する。                                      |                                                              |
| プロビジョニングされた同時実行設定 |                                                    |                                                              |
| モニタリング            | LambdaをCloudWatchまたはX-Rayを使用して、メトリクスのデータポイントを収集する。 | 次の方法がある<br>・CloudWatchによって、メトリクスのデータポイントを収集する。<br>・CloudWatchのLambda Insightsによって、パフォーマンスに関するメトリクスのデータポイントを収集する。<br>・X-Rayによって、APIに対するリクエスト、Lambdaコール、Lambdaの下流とのデータ通信をトレースし、これらをスタックトレース化する。 |

<br>

### 設定のベストプラクティス

> ℹ️ 参考：https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html#function-configuration

<br>

### Lambdaと関数の関係性

![lambda-execution-environment-api-flow](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/lambda-execution-environment-api-flow.png)

#### ▼ Lambdaサービス

コンソール画面のLambdaに相当する。

#### ▼ 関数の実行環境

Lambdaは、API（ランタイムAPI、ログAPI、拡張API）と実行環境から構成されている。関数は実行環境に存在し、ランタイムAPIを介して、Lambdaによって実行される。

> ℹ️ 参考：https://docs.aws.amazon.com/lambda/latest/dg/runtimes-extensions-api.html#runtimes-extensions-api-lifecycle

実行環境には、```3```個のフェーズがある。

> ℹ️ 参考：https://docs.aws.amazon.com/lambda/latest/dg/runtimes-context.html#runtimes-lifecycle

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

> ℹ️ 参考：https://docs.aws.amazon.com/lambda/latest/dg/runtimes-images.html#runtimes-images-lp

#### ▼ RIC：Runtime Interface Clients

通常のランタイムはコンテナ内関数と通信できないため、ランタイムの代わりにRICを使用してコンテナ内関数と通信を行う。言語別にRICパッケージが用意されている。

> ℹ️ 参考：https://docs.aws.amazon.com/lambda/latest/dg/runtimes-images.html#runtimes-api-client

#### ▼ RIE：Runtime Interface Emulator

開発環境のコンテナで、擬似的にLambda関数を再現する。全ての言語で共通のRIEパッケージが用意されている。

> ℹ️ 参考：https://github.com/aws/aws-lambda-runtime-interface-emulator

RIEであっても、稼働させるためにAWSのクレデンシャル情報（アクセスキーID、シークレットアクセスキー、リージョン）が必要なため、環境変数や```credentials```ファイルを使用して、Lambdaにこれらの値を出力する。

> ℹ️ 参考：https://docs.aws.amazon.com/lambda/latest/dg/images-test.html#images-test-env

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
$ docker compose up lambda
```

```bash
$ curl \
    -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" \
    -d '{}'
```

<br>

### 同時実行

#### ▼ 同時実行の予約

Lambdaは、関数の実行中に再びリクエストを受信すると、関数のインスタンスを新しく作成する。そして、各関数インスタンスを使用して、同時並行的にリクエストに応じる。デフォルトでは、関数の種類がいくつあっても、AWSアカウント当たり、合計で```1000```個までしかスケーリングして同時実行できない。関数ごとに同時実行数の使用枠を割り当てるためには、同時実行の予約を設定する必要がある。同時実行の予約数を```0```個とした場合、Lambdaがスケーリングしなくなる。

> ℹ️ 参考：https://docs.aws.amazon.com/lambda/latest/dg/configuration-concurrency.html#configuration-concurrency-reserved

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

> ℹ️ 参考：https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-package.html#gettingstarted-package-zip

#### ▼ ECRにおけるイメージ

コンテナイメージの関数でのみ有効である。ビルド後のコードをコンテナイメージしてアップロードする。ECRからアップロードできる。

> ℹ️ 参考：https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-package.html#gettingstarted-package-images

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

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html

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

eventオブジェクトの```domainName```と```host.value```に代入されたバケットのドメイン名によって、転送先のバケットが決まる。そのため、この値を切り替えれば、動的オリジンを実現できる。注意点として、各バケットには同じオリジンアクセスアイデンティティを設定する必要がある。

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

オリジンリクエストは、以下のeventオブジェクトのJSONデータにマッピングされている。注意点として、一部のキーは省略している。

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

> ℹ️ 参考：
>
> - https://aws.amazon.com/jp/elasticloadbalancing/features/
> - https://faq.support.nifcloud.com/faq/show/420?site_domain=default
> - https://www.infraexpert.com/study/tcpip8.html

| LB名                           | OSI参照モデルのレイヤー     | リスナーが処理できるプロトコル        | ターゲット                | リクエストヘッダー（```L7```） | パケットヘッダーのフィールド（```L4```） | セキュリティグループ |
| ------------------------------ |-------------------|------------------------|----------------------|---------------------|--------------------------| -------------------- |
| ALB：Application Load Balancer | ```L7```          | HTTP、HTTPS、gRPC        | IPアドレス、インスタンス、Lambda | URL、HTTPヘッダー        | 不可                       | 可                   |
| NLB：Network Load Balancer     | ```L4```          | TCP、UDP、TLS            | IPアドレス、インスタンス、ALB    | 不可                  | IPアドレスフィールド、ポート番号フィールド   | 不可                 |
| GLB：Gateway Load Balancer     | ```L3```、```L4``` | IP                     | IPアドレス、インスタンス        | 不可                  | IPアドレスフィールド、ポート番号フィールド   | 不可                 |
| CLB：Classic Load Balancer     | ```L4```、```L7``` | HTTP、HTTPS、TCP、SSL/TLS | なし                   | URL、HTTPヘッダー        | IPアドレスフィールド、ポート番号フィールド   | 可                   |

<br>

## 02-02. ALB：Application Load Balancing

### ALBとは

クラウドリバースプロキシサーバー、かつクラウドロードバランサーとして働く。リクエストを代理で受信し、EC2インスタンスへのアクセスをバランスよく分配することによって、サーバーへの負荷を緩和する。

> ℹ️ 参考：https://www.slideshare.net/AmazonWebServicesJapan/application-load-balancer/24

![aws_alb](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/aws_alb.png)

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

> ℹ️ 参考：https://blog.takuros.net/entry/2019/08/27/075726

![alb-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/alb-instance.png)

#### ▼ 割り当てられるIPアドレス

ALBに割り当てられるIPアドレスには、VPCのものが適用される。そのため、EC2インスタンスのセキュリティグループでは、VPCのCIDRブロックを許可するように設定する必要がある。

#### ▼ 自動スケーリング

単一障害点にならないように、負荷が高まるとALBインスタンスが増えるように自動スケールアウトする仕組みを持つ。

#### ▼ ```500```系ステータスコードの原因

> ℹ️ 参考：https://aws.amazon.com/jp/premiumsupport/knowledge-center/troubleshoot-http-5xx/

#### ▼ ALBのセキュリティグループ

Route53からルーティングされるパブリックIPアドレスを受信できるようにしておく必要がある。パブリックネットワークに公開するサイトであれば、IPアドレスは全ての範囲（```0.0.0.0/0```と``` ::/0```）にする。社内向けのサイトであれば、社内のプライベートIPアドレスのみ（```*.*.*.*/32```）を許可する。

<br>

### 常時SSLのアプリケーションへのルーティング

#### ▼ 問題

アプリケーションが常時SSLになっているアプリケーション（例：WordPress）の場合、ALBからアプリケーションにHTTPプロトコルでルーティングすると、HTTPSプロトコルへのリダイレクトループが発生してしまう。常時SSLがデフォルトになっていないアプリケーションであれば、これは起こらない。

> ℹ️ 参考：https://cloudpack.media/525

#### ▼ webサーバーにおける対処方法

ALBを経由したリクエストには、リクエストヘッダーに```X-Forwarded-Proto```ヘッダーが付与される。これには、ALBに対するリクエストのプロトコルの種類が文字列で代入されている。これが『HTTPS』だった場合、webサーバーに対するリクエストをHTTPSであるとみなすように対処する。これにより、アプリケーションに対するリクエストのプロトコルがHTTPSとなる（こちらを行った場合は、アプリケーション側の対応不要）。

> ℹ️ 参考：https://www.d-wood.com/blog/2017/11/29_9354.html

**＊実装例＊**

```apacheconf
SetEnvIf X-Forwarded-Proto https HTTPS=on
```

#### ▼ アプリケーションにおける対処方法

![ALBからEC2に対するリクエストのプロトコルをHTTPSと見なす](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ALBからEC2に対するリクエストのプロトコルをHTTPSと見なす.png)

ALBを経由したリクエストには、リクエストヘッダーに```HTTP_X_FORWARDED_PROTO```ヘッダーが付与される。これには、ALBに対するリクエストのプロトコルの種類が文字列で代入されている。そのため、もしALBに対するリクエストがHTTPSプロトコルだった場合は、ALBからアプリケーションに対するリクエストもHTTPSであるとみなすように、```index.php```に追加実装を行う（こちらを行った場合は、webサーバー側の対応不要）。

> ℹ️ 参考：https://www.d-wood.com/blog/2017/11/29_9354.html

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

ターゲットに対するリクエスト転送時の加重ルールを設定する。

> ℹ️ 参考：https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html#application-load-balancer-overview

#### ▼ ラウンドロビン方式

受信したリクエストを、ターゲットに均等にルーティングする。

#### ▼ 最小未処理リクエスト（ファステスト）

受信したリクエストを、未処理のリクエスト数が最も少ないターゲットにルーティングする。

> ℹ️ 参考：https://www.infraexpert.com/study/loadbalancer4.html

<br>

### メンテナンス中の対応

アプリケーションにて、必須でダウンタイムが発生する変更を行う場合、アプリケーションの前段にALBを設置し、メンテナンスページを返却する。作業中の間、ALBに```503```ステータスのメンテナンスページ（静的ファイル）を返却させる。

<br>

## 02-03. NLB：Network Load Balancer

<br>

