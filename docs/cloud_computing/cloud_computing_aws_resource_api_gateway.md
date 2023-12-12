---
title: 【IT技術の知見】API Gateway＠AWSリソース
description: API Gateway＠AWSリソースの知見を記録しています。
---

# API Gateway＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. API Gatewayとは

異なるクライアントからのリクエストを受信して差分を吸収し、適切なAPIに振り分けられる。

内部的にはCloudFrontを使用しているらしい。

![API Gatewayの仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/APIGatewayの仕組み.png)

> - https://dev.classmethod.jp/articles/edge-computing-by-api-gateway/
> - https://dev.classmethod.jp/articles/cache-api-gateway-by-cloudfront/

<br>

## 02. セットアップ

### コンソール画面の場合

API Gatewayは、メソッドリクエスト、統合リクエスト、統合レスポンス、メソッドレスポンス、から構成される。

| 設定項目                 | 説明                                                                                                                               | 補足                                                                                                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リソース                 | エンドポイント、HTTPメソッド、ルーティング先、などを設定する。                                                                     | 作成したAWSリソースのパスが、API Gatewayのエンドポイントになる。                                                                                                              |
| ステージ                 | API Gatewayをデプロイする環境を定義する。                                                                                          |                                                                                                                                                                               |
| オーソライザー           | LambdaまたはCognitoによるオーソライザーを使用して、認可プロセスを定義する。                                                        |                                                                                                                                                                               |
| ゲートウェイのレスポンス |                                                                                                                                    |                                                                                                                                                                               |
| モデル                   | リクエスト/レスポンスのスキーマを設定する。これらのバリデーションのために使用できる。                                              | OpenAPI仕様におけるスキーマについては、以下のリンクを参考にせよ。<br>- https://hiroki-it.github.io/tech-notebook/software/software_application_collaboration_api_restful.html |
| リソースポリシー         | ポリシーを使用して、API Gatewayにセキュリティを定義づける。                                                                        |                                                                                                                                                                               |
| ドキュメント             |                                                                                                                                    |                                                                                                                                                                               |
| ダッシュボード           |                                                                                                                                    |                                                                                                                                                                               |
| APIの設定                |                                                                                                                                    |                                                                                                                                                                               |
| 使用サイズプラン         | 有料サービスとしてAPIを公開し、料金体系に応じてリクエストサイズを制限するために使用する。APIキーにリクエスト量のレートを設定する。 | 有料サービスとして使用しないAPIの場合は、レートを設定する必要はない。                                                                                                         |
| APIキー                  | APIキー認証を設定する。                                                                                                            | ・その他のアクセス制御の方法として、以下がある。<br>- https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-to-api.html                      |
| クライアント証明書       | SSL証明書をAPI Gatewayに割り当てる。                                                                                               | APIが、API Gatewayからルーティングされたリクエストであること識別できるようになる。                                                                                            |
| CloudWatchログの設定     | API GatewayがCloudWatchログにリクエストを送信できるよう、ロールを設定する。                                                        | `1`個のAWSアカウントにつき、`1`個のロールを設定すれば良い。                                                                                                                   |

<br>

### リソース

#### ▼ リソース

| 順番 | 処理               | 説明                                                                                         | 補足                                                                           |
| ---- | ------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1    | メソッドリクエスト | クライアントから受信したデータのうち、実際にルーティングするデータをフィルタリングする。     |                                                                                |
| 2    | 統合リクエスト     | メソッドリクエストからルーティングされた各データを、マッピングテンプレートのJSONに紐付ける。 |                                                                                |
| 3    | 統合レスポンス     |                                                                                              | 統合リクエストでプロキシ統合を使用する場合、統合レスポンスを使用できなくなる。 |
| 4    | メソッドレスポンス | レスポンスが成功した場合、クライアントに送信するステータスコードを設定する。                 |                                                                                |

#### ▼ メソッドリクエスト

| 設定項目                    | 説明                                                                                                                                                        | 補足                                                                                                                                                                   |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 認可                        | 定義したLambdaまたはCognitoによるオーソライザーを有効化するか否かを設定する。                                                                               |                                                                                                                                                                        |
| リクエストの検証            | 『URLクエリ文字列パラメーター』『HTTPリクエストヘッダー』『リクエスト本文』のバリデーションを有効化するか否かを設定する。                                   |                                                                                                                                                                        |
| APIキーの必要性             | リクエストヘッダーにおけるAPIキーのバリデーションを実行する。リクエストのヘッダーに『`x-api-key`』を含み、これにAPIキーが割り当てられていることを強制する。 | ヘッダー名は大文字でも小文字でも問題ないが、小文字が推奨。<br>- https://hiroki-it.github.io/tech-notebook/software/software_application_collaboration_api_restful.html |
| URLクエリ文字列パラメーター | リクエストされたURLのクエリパラメーターのバリデーションを実行する。                                                                                         |                                                                                                                                                                        |
| HTTPリクエストヘッダー      | リクエストヘッダーのバリデーションを実行する。                                                                                                              |                                                                                                                                                                        |
| リクエスト本文              | リクエストボディのバリデーションを実行する。                                                                                                                |                                                                                                                                                                        |
| SDK設定                     |                                                                                                                                                             |                                                                                                                                                                        |

#### ▼ 統合リクエスト

| 設定項目                    | 説明                                                                                                                                                                                      | 補足                                   |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 統合タイプ                  | リクエストのルーティング先を設定する。                                                                                                                                                    |                                        |
| URLパスパラメーター         | メソッドリクエストからルーティングされたデータを、API Gatewayからルーティングするリクエストのパスパラメーターに紐付ける。代わりとして、紐付けずに新しいデータをルーティングしても良い。   |                                        |
| URLクエリ文字列パラメーター | メソッドリクエストからルーティングされたデータを、API Gatewayからルーティングするリクエストのクエリパラメーターに紐付ける。代わりとして、紐付けずに新しいデータをルーティングしても良い。 |                                        |
| HTTPヘッダー                | メソッドリクエストからルーティングされたデータを、API Gatewayからルーティングするリクエストのヘッダーに紐付ける。代わりとして、紐付けずに新しいデータをルーティングしても良い。           | 値はシングルクオートで囲う必要がある。 |
| マッピングテンプレート      | メソッドリクエストからルーティングされたデータを、API Gatewayからルーティングするリクエストのメッセージボディに紐付ける。代わりとして、紐付けずに新しいデータをルーティングしても良い。   |                                        |

#### ▼ ホワイトボックステスト

| 設定項目       | 設定例            | 補足                                         |
| -------------- | ----------------- | -------------------------------------------- |
| クエリ文字     |                   |                                              |
| ヘッダー       | X-API-Token: test | 波括弧、スペース、クオーテーションは不要。   |
| リクエスト本文 | `{test:"test"}`   | 改行タグやスペースが入り込まないようにする。 |

#### ▼ OpenAPI仕様のインポート

以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/cloud_computing/cloud_computing_aws_resource_api_gateway_import.html

#### ▼ CORSの有効化

CORSを有効化し、異なるオリジンによって表示されたページからのリクエストを許可する。

以下のリンクを参考にせよ。

> - https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html

<br>

### プライベート統合

#### ▼ プライベート統合とは

API GatewayとVPCリンクの間で、リクエスト/レスポンスのJSON型データを自動的にマッピングする機能のこと。

> - https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-private-integration.html

また、VPCリンクの設定によって、VPCエンドポイントサービスが作成される。

| 設定項目                     | 説明                                                    |
| ---------------------------- | ------------------------------------------------------- |
| 統合タイプ                   | VPCリンクを選択する。                                   |
| プロキシ統合の使用           | VPCリンクとのプロキシ統合を有効化するか否かを設定する。 |
| メソッド                     | HTTPメソッドを設定する。                                |
| VPCリンク                    | VPCリンク名を設定する。                                 |
| エンドポイントURL            | NLBのDNS名をドメイン名として、転送先のURLを設定する。   |
| デフォルトタイムアウトの使用 |                                                         |

#### ▼ メソッドリクエストと統合リクエストのマッピング

<br>

### Lambdaプロキシ統合

#### ▼ Lambdaプロキシ統合とは

API GatewayとLambdaの間で、リクエスト/レスポンスのJSON型データを自動的にマッピングする機能のこと。

プロキシ統合を使用すると、Lambdaに送信されたリクエストはハンドラ関数のeventオブジェクトに代入される。

プロキシ統合を使用しない場合、LambdaとAPI Gatewayの間のマッピングを手動で実行する必要がある。

| 設定項目                     | 説明                                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 統合タイプ                   | Lambda関数を選択する。                                                                                                                     |
| Lambdaプロキシ統合の使用     | Lambdaとのプロキシ統合を有効化するか否かを設定する。                                                                                       |
| Lambdaリージョン             | 実行したLambda関数のリージョンを設定する。                                                                                                 |
| Lambda関数                   | 実行したLambda関数の名前を設定する。                                                                                                       |
| 実行ロール                   | 実行したいLambda関数への認可スコープが紐付けられたロールのARNを設定する。ただし、Lambda側にAPI Gatewayへの認可スコープを紐付けしても良い。 |
| 認証情報のキャッシュ         |                                                                                                                                            |
| デフォルトタイムアウトの使用 |                                                                                                                                            |

> - https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-integrations.html

#### ▼ リクエスト時のマッピング

API Gateway側でプロキシ統合を有効化すると、API Gatewayを経由したクライアントからのリクエストは、ハンドラ関数のeventオブジェクトのJSON型データにマッピングされる。

```yaml
{
  "resource": "Resource path",
  "path": "Path parameter",
  "httpMethod": "Incoming request's method name",
  "headers": {
      String
      containing
      incoming
      request
      headers,
    },
  "multiValueHeaders": {
      List
      of
      strings
      containing
      incoming
      request
      headers,
    },
  "queryStringParameters": {
      query
      string
      parameters,
    },
  "multiValueQueryStringParameters": {
      List
      of
      query
      string
      parameters,
    },
  "pathParameters": {
      path
      parameters,
    },
  "stageVariables": {
      Applicable
      stage
      variables,
    },
  "requestContext": {
      Request
      context
      including
      authorizer-returned
      key-value
      pairs,
    },
  "body": "A JSON string of the request payload.",
  "isBase64Encoded": "A boolean flag to indicate if the applicable request payload is Base64-encoded",
}
```

#### ▼ レスポンス時のマッピング

API Gatewayは、Lambdaからのレスポンスを、以下のJSON型データにマッピングする。

これ以外の構造のJSON型データを送信すると、API Gatewayで『`Internal Server Error`』のエラーが起こる。

```yaml
{
  "isBase64Encoded": true,
  "statusCode": httpStatusCode,
  "headers": {"headerName": "headerValue", ...},
  "multiValueHeaders":
    {"headerName": ["headerValue", "headerValue2", ...], ...},
  "body": "Hello Lambda",
}
```

API Gatewayは上記のJSON型データを受信した後、`body`のみ値をレスポンスのメッセージボディに持たせ、クライアントに送信する。

```bash
"Hello Lambda"
```

<br>

### ステージ

#### ▼ 設定

| 設定項目                           | 説明                                                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| キャッシュ設定                     | - https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-caching.html                                                     |
| デフォルトのメソッドスロットリング | リクエスト数 (個/秒) 制限を設定する。<br>- https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html |
| WAF                                | - https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-aws-waf.html                                       |
| クライアント証明書                 | 紐付けるWAFを設定する。                                                                                                                     |

#### ▼ ステージ変数

デプロイされるステージ固有の環境変数を設定できる。

Lambda関数名、エンドポイントURL、パラメーターマッピング、マッピングテンプレートで値を出力できる。

以下のリンクを参考にせよ。

> - https://docs.aws.amazon.com/apigateway/latest/developerguide/aws-api-gateway-stage-variables-reference.html

#### ▼ SDKの作成

<br>

### デプロイメント

#### ▼ 通常のデプロイメント

API Gatewayの通常のデプロイメントの仕組みは隠蔽されている。

ダウンタイム無しで、新しいステージをデプロイできる。

> - https://forums.aws.amazon.com/thread.jspa?threadID=238876

#### ▼ カナリアリリース

カナリアリリースを使用して、新しいステージをデプロイする。

| 設定項目                                   | 説明 |
| ------------------------------------------ | ---- |
| ステージのリクエストディストリビューション |      |
| Canaryのデプロイ                           |      |
| Canaryステージ変数                         |      |
| キャッシュ                                 |      |

> - https://docs.aws.amazon.com/apigateway/latest/developerguide/canary-release.html

<br>

### ログの種類

#### ▼ 実行ログ

CloudWatchログにAPI Gatewayの実行ログを送信するか否かを設定できる。

リクエスト/レスポンスの構造もログに出力するようにした方が良い。

> - https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html

#### ▼ カスタムアクセスログ

CloudWatchログにAPI Gatewayのアクセスログを送信するか否かを設定できる。

アクセスログを構造化ログとして出力できる。

> - https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html

<br>

### 分散トレースの収集

X-Rayを使用して、API Gatewayを開始点とした分散トレースを収集する。

まず、API GatewayでトーレスIDを作成する。

その後、各AWSリソースでスパンを取得し、スパンを紐付けることより、分散トレースを表現できる。

補足としてX-Rayでは、親スパンをセグメント、子スパンをサブセグメントと呼ぶ。

> - https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-traces

<br>

### APIの設定

#### ▼ エンドポイントタイプ

| タイプ名     | 説明                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------- |
| リージョン   | API Gatewayのエンドポイントに対するリクエストを、リージョン内の物理サーバーで受け付ける。 |
| プライベート | API Gatewayのエンドポイントに対するリクエストを、VPC内からのみ受け付ける。                |
| エッジ最適化 | API Gatewayのエンドポイントに対するリクエストを、CloudFrontのエッジサーバーで受け付ける。 |

> - https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-endpoint-types.html

<br>
