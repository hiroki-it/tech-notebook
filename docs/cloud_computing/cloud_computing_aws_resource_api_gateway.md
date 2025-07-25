---
title: 【IT技術の知見】AWS API Gateway＠AWSリソース
description: AWS API Gateway＠AWSリソースの知見を記録しています。
---

# AWS API Gateway＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS API Gatewayとは

異なるクライアントからのリクエストを受信して差分を吸収し、適切なAPIに振り分けられる。

内部的にはCloudFrontを使用しているらしい。

![AWS API Gatewayの仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/APIGatewayの仕組み.png)

> - https://dev.classmethod.jp/articles/edge-computing-by-api-gateway/
> - https://dev.classmethod.jp/articles/cache-api-gateway-by-cloudfront/

<br>

## 02. セットアップ

### コンソール画面の場合

AWS API Gatewayは、メソッドリクエスト、統合リクエスト、統合レスポンス、メソッドレスポンス、から構成される。

| 設定項目                  | 説明                                                                                                                               | 補足                                                                                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リソース                  | エンドポイント、HTTPメソッド、ルーティング先などを設定する。                                                                       | 作成したAWSリソースのパスが、AWS API Gatewayのエンドポイントになる。                                                                                                    |
| ステージ                  | AWS API Gatewayをデプロイする環境を定義する。                                                                                      |                                                                                                                                                                         |
| オーソライザー            | AWS LambdaまたはCognitoによるオーソライザーを使用して、認可プロセスを定義する。                                                    |                                                                                                                                                                         |
| ゲートウェイのレスポンス  |                                                                                                                                    |                                                                                                                                                                         |
| モデル                    | リクエスト−レスポンスのスキーマを設定する。これらのバリデーションのために使用できる。                                              | OpenAPI仕様におけるスキーマについては、以下のリンクを参考にせよ。<br>https://hiroki-it.github.io/tech-notebook/software/software_application_messaging_api_restful.html |
| リソースポリシー          | ポリシーを使用して、AWS API Gatewayにセキュリティを定義づける。                                                                    |                                                                                                                                                                         |
| ドキュメント              |                                                                                                                                    |                                                                                                                                                                         |
| ダッシュボード            |                                                                                                                                    |                                                                                                                                                                         |
| APIの設定                 |                                                                                                                                    |                                                                                                                                                                         |
| 使用サイズプラン          | 有料サービスとしてAPIを公開し、料金体系に応じてリクエストサイズを制限するために使用する。APIキーにリクエスト量のレートを設定する。 | 有料サービスとして使用しないAPIの場合は、レートを設定する必要はない。                                                                                                   |
| APIキー                   | APIキー認証を設定する。                                                                                                            | ・その他の認証の方法として、以下がある。<br>https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-to-api.html                          |
| クライアント証明書        | サーバー証明書をAWS API Gatewayに割り当てる。                                                                                      | APIが、AWS API Gatewayからルーティングされたリクエストであること識別できるようになる。                                                                                  |
| AWS CloudWatch Logsの設定 | AWS API GatewayがAWS CloudWatch Logsにリクエストを送信できるよう、ロールを設定する。                                               | `1`個のAWSアカウントにつき、`1`個のロールを設定すれば良い。                                                                                                             |

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

| 設定項目                    | 説明                                                                                                                                                        | 補足                                                                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 認可                        | 定義したAWS LambdaまたはCognitoによるオーソライザーを有効化するか否かを設定する。                                                                           |                                                                                                                                                                  |
| リクエストの検証            | 『URLクエリ文字列パラメーター』『HTTPリクエストヘッダー』『リクエスト本文』のバリデーションを有効化するか否かを設定する。                                   |                                                                                                                                                                  |
| APIキーの必要性             | リクエストヘッダーにおけるAPIキーのバリデーションを実行する。リクエストのヘッダーに『`x-api-key`』を含み、これにAPIキーが割り当てられていることを強制する。 | ヘッダー名は大文字でも小文字でも問題ないが、小文字が推奨。<br>https://hiroki-it.github.io/tech-notebook/software/software_application_messaging_api_restful.html |
| URLクエリ文字列パラメーター | リクエストされたURLのクエリパラメーターのバリデーションを実行する。                                                                                         |                                                                                                                                                                  |
| HTTPリクエストヘッダー      | リクエストヘッダーのバリデーションを実行する。                                                                                                              |                                                                                                                                                                  |
| リクエスト本文              | リクエストボディのバリデーションを実行する。                                                                                                                |                                                                                                                                                                  |
| SDK設定                     |                                                                                                                                                             |                                                                                                                                                                  |

#### ▼ 統合リクエスト

| 設定項目                    | 説明                                                                                                                                                                                      | 補足                                   |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 統合タイプ                  | リクエストのルーティング先を設定する。                                                                                                                                                    |                                        |
| URLパスパラメーター         | メソッドリクエストからルーティングされたデータを、AWS API Gatewayからルーティングするリクエストのパスパラメーターに紐付ける。代わりに、紐付けずに新しいデータをルーティングしても良い。   |                                        |
| URLクエリ文字列パラメーター | メソッドリクエストからルーティングされたデータを、AWS API Gatewayからルーティングするリクエストのクエリパラメーターに紐付ける。代わりに、紐付けずに新しいデータをルーティングしても良い。 |                                        |
| HTTPヘッダー                | メソッドリクエストからルーティングされたデータを、AWS API Gatewayからルーティングするリクエストのヘッダーに紐付ける。代わりに、紐付けずに新しいデータをルーティングしても良い。           | 値はシングルクオートで囲う必要がある。 |
| マッピングテンプレート      | メソッドリクエストからルーティングされたデータを、AWS API Gatewayからルーティングするリクエストのメッセージボディに紐付ける。代わりに、紐付けずに新しいデータをルーティングしても良い。   |                                        |

#### ▼ ホワイトボックステスト

| 設定項目       | 設定例            | 補足                                         |
| -------------- | ----------------- | -------------------------------------------- |
| クエリ文字     |                   |                                              |
| ヘッダー       | X-API-Token: test | 波括弧、スペース、クオーテーションは不要。   |
| リクエスト本文 | `{test:"test"}`   | 改行タグやスペースが入り込まないようにする。 |

#### ▼ OpenAPI仕様のインポート

以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/cloud_computing/cloud_computing_aws_resource_api_gateway_import.html

#### ▼ CORSの突破

正しいリクエストがCORSを突破できるように、異なるオリジンによって表示されたページからのリクエストを許可する。

> - https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html

<br>

### プライベート統合

#### ▼ プライベート統合とは

AWS API GatewayとAWS VPCリンクの間で、リクエスト−レスポンスのJSON型データを自動的にマッピングする機能のこと。

また、AWS VPCリンクの設定によって、AWS VPCエンドポイントサービスを作成する。

| 設定項目                           | 説明                                                              |
| ---------------------------------- | ----------------------------------------------------------------- |
| 統合タイプ                         | AWS VPCリンクを選択する。                                         |
| プロキシ統合の使用                 | AWS VPCリンクとのプロキシ統合を有効化するか否かを設定する。       |
| メソッド                           | HTTPメソッドを設定する。                                          |
| AWS VPCリンク                      | AWS VPCリンク名を設定する。                                       |
| エンドポイントURL                  | NLBのDNS名をドメイン名として、フォワーディング先のURLを設定する。 |
| デフォルトのタイムアウト時間の使用 |                                                                   |

> - https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-private-integration.html

#### ▼ メソッドリクエストと統合リクエストのマッピング

<br>

### AWS Lambdaプロキシ統合

#### ▼ AWS Lambdaプロキシ統合とは

AWS API GatewayとAWS Lambdaの間で、リクエスト−レスポンスのJSON型データを自動的にマッピングする機能のこと。

プロキシ統合を使用すると、AWS Lambdaに送信されたリクエストはハンドラ関数のeventオブジェクトに代入される。

プロキシ統合を使用しない場合、AWS LambdaとAWS API Gatewayの間のマッピングを手動で実行する必要がある。

| 設定項目                           | 説明                                                                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 統合タイプ                         | AWS Lambda関数を選択する。                                                                                                                             |
| AWS Lambdaプロキシ統合の使用       | AWS Lambdaとのプロキシ統合を有効化するか否かを設定する。                                                                                               |
| AWS Lambdaリージョン               | 実行したAWS Lambda関数のリージョンを設定する。                                                                                                         |
| AWS Lambda関数                     | 実行したAWS Lambda関数の名前を設定する。                                                                                                               |
| 実行ロール                         | 実行したいAWS Lambda関数への認可スコープが紐付けられたロールのARNを設定する。ただし、AWS Lambda側にAWS API Gatewayへの認可スコープを紐付けしても良い。 |
| 資格情報のキャッシュ               |                                                                                                                                                        |
| デフォルトのタイムアウト時間の使用 |                                                                                                                                                        |

> - https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-integrations.html

#### ▼ リクエスト時のマッピング

AWS API Gateway側でプロキシ統合を有効化すると、AWS API Gatewayを経由したクライアントからのリクエストは、ハンドラ関数のeventオブジェクトのJSON型データにマッピングされる。

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

AWS API Gatewayは、AWS Lambdaからのレスポンスを、以下のJSON型データにマッピングする。

これ以外の構造のJSON型データを送信すると、AWS API Gatewayで『`Internal Server Error`』のエラーが起こる。

```yaml
{
  "isBase64Encoded": "true",
  "statusCode": httpStatusCode,
  "headers": {"headerName": "headerValue", ...},
  "multiValueHeaders":
    {"headerName": ["headerValue", "headerValue2", ...], ...},
  "body": "Hello AWS Lambda",
}
```

AWS API Gatewayは上記のJSON型データを受信した後、`body`のみ値をレスポンスのメッセージボディに持たせ、クライアントに送信する。

```bash
"Hello AWS Lambda"
```

<br>

### ステージ

#### ▼ 設定

| 設定項目                           | 説明                                                                                                                                      |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| キャッシュ設定                     | ・https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-caching.html                                                   |
| デフォルトのメソッドスロットリング | リクエスト数 (個/秒) 制限を設定する。<br>https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html |
| AWS WAF                            | ・https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-aws-waf.html                                     |
| クライアント証明書                 | 紐付けるAWS WAFを設定する。                                                                                                               |

#### ▼ ステージ変数

デプロイされるステージ固有の環境変数を設定できる。

AWS Lambda関数名、エンドポイントURL、パラメーターマッピング、マッピングテンプレートで値を出力できる。

以下のリンクを参考にせよ。

> - https://docs.aws.amazon.com/apigateway/latest/developerguide/aws-api-gateway-stage-variables-reference.html

#### ▼ SDKの作成

<br>

### デプロイメント

#### ▼ 通常のデプロイメント

AWS API Gatewayの通常のデプロイメントの仕組みは隠蔽されている。

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

AWS CloudWatch LogsにAWS API Gatewayの実行ログを送信するか否かを設定できる。

リクエスト−レスポンスの構造もログに出力するようにした方が良い。

> - https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html

#### ▼ カスタムアクセスログ

AWS CloudWatch LogsにAWS API Gatewayのアクセスログを送信するか否かを設定できる。

アクセスログを構造化ログとして出力できる。

> - https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html

<br>

### 分散トレースの収集

X-Rayを使用して、AWS API Gatewayを開始点とした分散トレースを収集する。

まず、AWS API GatewayでトーレスIDを作成する。

その後、各AWSリソースでスパンを取得し、スパンを紐付けることより、分散トレースを表現できる。

補足としてX-Rayでは、親スパンをセグメント、子スパンをサブセグメントと呼ぶ。

> - https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-traces

<br>

### APIの設定

#### ▼ エンドポイントタイプ

| タイプ名     | 説明                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------- |
| リージョン   | AWS API Gatewayのエンドポイントに対するリクエストを、リージョン内の物理サーバーで受け付ける。     |
| プライベート | AWS API Gatewayのエンドポイントに対するリクエストを、AWS VPC内からのみ受け付ける。                |
| エッジ最適化 | AWS API Gatewayのエンドポイントに対するリクエストを、AWS CloudFrontのエッジサーバーで受け付ける。 |

> - https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-endpoint-types.html

<br>

## 03. AWS Lambdaオーソライザー

AWS API Gatewayの認証プロキシと中央集権的な認可プロバイダーとして機能する。

IDプロバイダーが別途必要である。

似たものとしてAWS Cognitoオーソライザーがある。

これを使用する場合はAWS Lambdaオーソライザーを使用できない。

![aws_api-gateway_lambda_authorizer](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_api-gateway_lambda_authorizer.png)

|      | AWS Cognitoオーソライザー | AWS Lambdaオーソライザー |
| ---- | :-----------------------: | :----------------------: |
| 認証 |            ✅             |                          |
| 認可 |            ✅             |            ✅            |

> - https://dev.classmethod.jp/articles/aws-cdk-api-gateway-lambda-rest-auth0-lambda-authorizer/

<br>
