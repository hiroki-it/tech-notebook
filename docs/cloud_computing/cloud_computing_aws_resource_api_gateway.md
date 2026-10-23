---
title: 【IT技術の知見】Amazon API Gateway＠AWSリソース
description: Amazon API Gateway＠AWSリソースの知見を記録しています。
---

# Amazon API Gateway＠AWS リソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. Amazon API Gateway とは

異なるクライアントからのリクエストを受信して差分を吸収し、適切な API に振り分けられる。

内部的には CloudFront を使用しているらしい。

![Amazon API Gatewayの仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/APIGatewayの仕組み.png)

> - [API Gatewayで広がるAWSのエッジコンピューティングの可能性 \| DevelopersIO](https://dev.classmethod.jp/articles/edge-computing-by-api-gateway/)
> - [Amazon CloudFrontでAPI Gatewayの痒いところに手を届ける \| DevelopersIO](https://dev.classmethod.jp/articles/cache-api-gateway-by-cloudfront/)

<br>

## 02. セットアップ

### コンソール画面の場合

Amazon API Gateway は、メソッドリクエスト、統合リクエスト、統合レスポンス、メソッドレスポンスから構成される。

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>リソース</td>
      <td>エンドポイント、HTTP メソッド、ルーティング先などを設定する。</td>
      <td>作成した AWS リソースのパスが、Amazon API Gateway のエンドポイントになる。</td>
    </tr>
    <tr>
      <td>ステージ</td>
      <td>Amazon API Gateway をデプロイする環境を定義する。</td>
      <td></td>
    </tr>
    <tr>
      <td>オーソライザー</td>
      <td>AWS Lambda または Cognito によるオーソライザーを使用して、認可プロセスを定義する。</td>
      <td></td>
    </tr>
    <tr>
      <td>ゲートウェイのレスポンス</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>モデル</td>
      <td>リクエスト／レスポンスのスキーマを設定する。これらのバリデーションのために使用できる。</td>
      <td>OpenAPI 仕様におけるスキーマについては、以下のリンクを参考にせよ。<br><a href="https://hiroki-it.github.io/tech-notebook/software/software_application_messaging_api_restful.html">https://hiroki-it.github.io/tech-notebook/software/software_application_messaging_api_restful.html</a></td>
    </tr>
    <tr>
      <td>リソースポリシー</td>
      <td>ポリシーを使用して、Amazon API Gateway にセキュリティを定義づける。</td>
      <td></td>
    </tr>
    <tr>
      <td>ドキュメント</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>ダッシュボード</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>API の設定</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>使用サイズプラン</td>
      <td>有料サービスとして API を公開し、料金体系に応じてリクエストサイズを制限するために使用する。API キーにリクエスト量のレートを設定する。</td>
      <td>有料サービスとして使用しない API の場合は、レートを設定する必要はない。</td>
    </tr>
    <tr>
      <td>API キー</td>
      <td>API キー認証を設定する。</td>
      <td>・その他の認証の方法として、以下がある。<br><a href="https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-to-api.html">https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-to-api.html</a></td>
    </tr>
    <tr>
      <td>クライアント証明書</td>
      <td>サーバー証明書を Amazon API Gateway に割り当てる。</td>
      <td>API が、Amazon API Gateway からルーティングされたリクエストであることを識別できるようになる。</td>
    </tr>
    <tr>
      <td>Amazon CloudWatch Logs の設定</td>
      <td>Amazon API Gateway が Amazon CloudWatch Logs にリクエストを送信できるよう、ロールを設定する。</td>
      <td><code>1</code> 個の AWS アカウントにつき、<code>1</code> 個のロールを設定すればよい。</td>
    </tr>
  </tbody>
</table>

<br>

### リソース

#### ▼ リソース

<table>
  <thead>
    <tr>
      <th>順番</th>
      <th>処理</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>メソッドリクエスト</td>
      <td>クライアントから受信したデータのうち、実際にルーティングするデータをフィルタリングする。</td>
      <td></td>
    </tr>
    <tr>
      <td>2</td>
      <td>統合リクエスト</td>
      <td>メソッドリクエストからルーティングされた各データを、マッピングテンプレートの JSON に紐付ける。</td>
      <td></td>
    </tr>
    <tr>
      <td>3</td>
      <td>統合レスポンス</td>
      <td></td>
      <td>統合リクエストでプロキシ統合を使用する場合、統合レスポンスを使用できなくなる。</td>
    </tr>
    <tr>
      <td>4</td>
      <td>メソッドレスポンス</td>
      <td>レスポンスが成功した場合、クライアントに送信するステータスコードを設定する。</td>
      <td></td>
    </tr>
  </tbody>
</table>

#### ▼ メソッドリクエスト

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>認可</td>
      <td>定義した AWS Lambda または Cognito によるオーソライザーを有効化するか否かを設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>リクエストの検証</td>
      <td>『URL クエリ文字列パラメーター』『HTTP リクエストヘッダー』『リクエスト本文』のバリデーションを有効化するか否かを設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>API キーの必要性</td>
      <td>リクエストヘッダーにおける API キーのバリデーションを実行する。リクエストのヘッダーに『<code>x-api-key</code>』を含み、これに API キーが割り当てられていることを強制する。</td>
      <td>ヘッダー名は大文字でも小文字でも問題ないが、小文字が推奨。<br><a href="https://hiroki-it.github.io/tech-notebook/software/software_application_messaging_api_restful.html">https://hiroki-it.github.io/tech-notebook/software/software_application_messaging_api_restful.html</a></td>
    </tr>
    <tr>
      <td>URL クエリ文字列パラメーター</td>
      <td>リクエストされた URL のクエリパラメーターのバリデーションを実行する。</td>
      <td></td>
    </tr>
    <tr>
      <td>HTTP リクエストヘッダー</td>
      <td>リクエストヘッダーのバリデーションを実行する。</td>
      <td></td>
    </tr>
    <tr>
      <td>リクエスト本文</td>
      <td>リクエストボディのバリデーションを実行する。</td>
      <td></td>
    </tr>
    <tr>
      <td>SDK 設定</td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>

#### ▼ 統合リクエスト

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>統合タイプ</td>
      <td>リクエストのルーティング先を設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>URL パスパラメーター</td>
      <td>メソッドリクエストからルーティングされたデータを、Amazon API Gateway からルーティングするリクエストのパスパラメーターに紐付ける。代わりに、紐付けずに新しいデータをルーティングしてもよい。</td>
      <td></td>
    </tr>
    <tr>
      <td>URL クエリ文字列パラメーター</td>
      <td>メソッドリクエストからルーティングされたデータを、Amazon API Gateway からルーティングするリクエストのクエリパラメーターに紐付ける。代わりに、紐付けずに新しいデータをルーティングしてもよい。</td>
      <td></td>
    </tr>
    <tr>
      <td>HTTP ヘッダー</td>
      <td>メソッドリクエストからルーティングされたデータを、Amazon API Gateway からルーティングするリクエストのヘッダーに紐付ける。代わりに、紐付けずに新しいデータをルーティングしてもよい。</td>
      <td>値はシングルクオートで囲う必要がある。</td>
    </tr>
    <tr>
      <td>マッピングテンプレート</td>
      <td>メソッドリクエストからルーティングされたデータを、Amazon API Gateway からルーティングするリクエストのメッセージボディに紐付ける。代わりに、紐付けずに新しいデータをルーティングしてもよい。</td>
      <td></td>
    </tr>
  </tbody>
</table>

#### ▼ ホワイトボックステスト

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>設定例</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>クエリ文字</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>ヘッダー</td>
      <td>X-API-Token: test</td>
      <td>波括弧、スペース、クオーテーションは不要。</td>
    </tr>
    <tr>
      <td>リクエスト本文</td>
      <td><code>{test:&quot;test&quot;}</code></td>
      <td>改行タグやスペースが入り込まないようにする。</td>
    </tr>
  </tbody>
</table>

#### ▼ OpenAPI 仕様のインポート

以下のリンクを参考にせよ。

> - [【IT技術の知見】Amazon API Gatewayへのymlインポート＠AWS - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/cloud_computing/cloud_computing_aws_resource_api_gateway_import.html)

#### ▼ CORS の突破

正しいリクエストが CORS を突破できるように、異なるオリジンによって表示されたページからのリクエストを許可する。

> - [CORS for REST APIs in API Gateway - Amazon API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html)

<br>

### プライベート統合

#### ▼ プライベート統合とは

Amazon API Gateway と Amazon VPC リンクの間で、リクエスト／レスポンスの JSON 型データを自動的にマッピングする機能のこと。

また、Amazon VPC リンクを設定することで、Amazon VPC エンドポイントサービスを作成する。

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>統合タイプ</td>
      <td>Amazon VPC リンクを選択する。</td>
    </tr>
    <tr>
      <td>プロキシ統合の使用</td>
      <td>Amazon VPC リンクとのプロキシ統合を有効化するか否かを設定する。</td>
    </tr>
    <tr>
      <td>メソッド</td>
      <td>HTTP メソッドを設定する。</td>
    </tr>
    <tr>
      <td>Amazon VPC リンク</td>
      <td>Amazon VPC リンク名を設定する。</td>
    </tr>
    <tr>
      <td>エンドポイント URL</td>
      <td>NLB の DNS 名をドメイン名として、フォワーディング先の URL を設定する。</td>
    </tr>
    <tr>
      <td>デフォルトのタイムアウト時間の使用</td>
      <td></td>
    </tr>
  </tbody>
</table>

> - [Set up a private integration - Amazon API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-private-integration.html)

#### ▼ メソッドリクエストと統合リクエストのマッピング

<br>

### AWS Lambda プロキシ統合

#### ▼ AWS Lambda プロキシ統合とは

Amazon API Gateway と AWS Lambda の間で、リクエスト／レスポンスの JSON 型データを自動的にマッピングする機能のこと。

プロキシ統合を使用すると、AWS Lambda に送信されたリクエストはハンドラ関数の event オブジェクトに代入される。

プロキシ統合を使用しない場合、AWS Lambda と Amazon API Gateway の間のマッピングを手動で実行する必要がある。

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>統合タイプ</td>
      <td>AWS Lambda 関数を選択する。</td>
    </tr>
    <tr>
      <td>AWS Lambda プロキシ統合の使用</td>
      <td>AWS Lambda とのプロキシ統合を有効化するか否かを設定する。</td>
    </tr>
    <tr>
      <td>AWS Lambda リージョン</td>
      <td>実行した AWS Lambda 関数のリージョンを設定する。</td>
    </tr>
    <tr>
      <td>AWS Lambda 関数</td>
      <td>実行した AWS Lambda 関数の名前を設定する。</td>
    </tr>
    <tr>
      <td>実行ロール</td>
      <td>実行したい AWS Lambda 関数への認可スコープが紐付けられたロールの ARN を設定する。ただし、AWS Lambda 側に Amazon API Gateway への認可スコープを紐付けしてもよい。</td>
    </tr>
    <tr>
      <td>資格情報のキャッシュ</td>
      <td></td>
    </tr>
    <tr>
      <td>デフォルトのタイムアウト時間の使用</td>
      <td></td>
    </tr>
  </tbody>
</table>

> - [Lambda integrations for REST APIs in API Gateway - Amazon API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-integrations.html)

#### ▼ リクエスト時のマッピング

Amazon API Gateway 側でプロキシ統合を有効化すると、Amazon API Gateway を経由したクライアントからのリクエストは、ハンドラ関数の event オブジェクトの JSON 型データにマッピングされる。

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

Amazon API Gateway は、AWS Lambda からのレスポンスを、以下の JSON 型データにマッピングする。

これ以外の構造の JSON 型データを送信すると、Amazon API Gateway で『`Internal Server Error`』のエラーが起こる。

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

Amazon API Gateway は上記の JSON 型データを受信した後、`body` のみ値をレスポンスのメッセージボディに持たせ、クライアントに送信する。

```bash
"Hello AWS Lambda"
```

<br>

### ステージ

#### ▼ 設定

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>キャッシュ設定</td>
      <td>・<a href="https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-caching.html">https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-caching.html</a></td>
    </tr>
    <tr>
      <td>デフォルトのメソッドスロットリング</td>
      <td>リクエスト数 (個/秒) 制限を設定する。<br><a href="https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html">https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html</a></td>
    </tr>
    <tr>
      <td>AWS WAF</td>
      <td>・<a href="https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-aws-waf.html">https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-aws-waf.html</a></td>
    </tr>
    <tr>
      <td>クライアント証明書</td>
      <td>紐付ける AWS WAF を設定する。</td>
    </tr>
  </tbody>
</table>

#### ▼ ステージ変数

デプロイされるステージ固有の環境変数を設定できる。

AWS Lambda 関数名、エンドポイント URL、パラメーターマッピング、マッピングテンプレートで値を出力できる。

以下のリンクを参考にせよ。

> - [API Gateway stage variables reference for REST APIs in API Gateway - Amazon API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/aws-api-gateway-stage-variables-reference.html)

#### ▼ SDK の作成

<br>

### デプロイメント

#### ▼ 通常のデプロイメント

Amazon API Gateway では、通常のデプロイメントの仕組みが隠蔽されている。

ダウンタイム無しで、新しいステージをデプロイできる。

> - https://forums.aws.amazon.com/thread.jspa?threadID=238876

#### ▼ カナリアリリース

カナリアリリースを使用して、新しいステージをデプロイする。

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ステージのリクエストディストリビューション</td>
      <td></td>
    </tr>
    <tr>
      <td>Canary のデプロイ</td>
      <td></td>
    </tr>
    <tr>
      <td>Canary ステージ変数</td>
      <td></td>
    </tr>
    <tr>
      <td>キャッシュ</td>
      <td></td>
    </tr>
  </tbody>
</table>

> - [Set up an API Gateway canary release deployment - Amazon API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/canary-release.html)

<br>

### ログの種類

#### ▼ 実行ログ

Amazon CloudWatch Logs に Amazon API Gateway の実行ログを送信するか否かを設定できる。

リクエスト／レスポンスの構造もログへ出力するようにしたほうがよい。

> - [Set up CloudWatch logging for REST APIs in API Gateway - Amazon API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html)

#### ▼ カスタムアクセスログ

Amazon CloudWatch Logs に Amazon API Gateway のアクセスログを送信するか否かを設定できる。

アクセスログを構造化ログとして出力できる。

> - [Set up CloudWatch logging for REST APIs in API Gateway - Amazon API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html)

<br>

### 分散トレースの収集

X-Ray を使用して、Amazon API Gateway を開始点とした分散トレースを収集する。

まず、Amazon API Gateway でトーレス ID を作成する。

その後、各 AWS リソースでスパンを取得し、スパンを紐付けることより、分散トレースを表現できる。

補足として X-Ray では、親スパンをセグメント、子スパンをサブセグメントと呼ぶ。

> - [AWS X-Ray concepts - AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-traces)

<br>

### API の設定

#### ▼ エンドポイントタイプ

<table>
  <thead>
    <tr>
      <th>タイプ名</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>リージョン</td>
      <td>Amazon API Gateway のエンドポイントに対するリクエストを、リージョン内の物理サーバーで受け付ける。</td>
    </tr>
    <tr>
      <td>プライベート</td>
      <td>Amazon API Gateway のエンドポイントに対するリクエストを、Amazon VPC 内からのみ受け付ける。</td>
    </tr>
    <tr>
      <td>エッジ最適化</td>
      <td>Amazon API Gateway のエンドポイントに対するリクエストを、Amazon CloudFront のエッジサーバーで受け付ける。</td>
    </tr>
  </tbody>
</table>

> - [API endpoint types for REST APIs in API Gateway - Amazon API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-endpoint-types.html)

<br>

## 03. AWS Lambda オーソライザー

Amazon API Gateway の認証プロキシと中央集権的な認可プロバイダーとして機能する。

ID プロバイダーが別途必要である。

似たものとして AWS Cognito オーソライザーがある。

これを使用する場合は AWS Lambda オーソライザーを使用できない。

![aws_api-gateway_lambda_authorizer](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_api-gateway_lambda_authorizer.png)

<table>
  <thead>
    <tr>
      <th></th>
      <th style="text-align:center">AWS Cognito オーソライザー</th>
      <th style="text-align:center">AWS Lambda オーソライザー</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>認証</td>
      <td style="text-align:center">✅</td>
      <td style="text-align:center"></td>
    </tr>
    <tr>
      <td>認可</td>
      <td style="text-align:center">✅</td>
      <td style="text-align:center">✅</td>
    </tr>
  </tbody>
</table>

> - [\[前編\] AWS CDKで API Gateway + Lambda 構成のREST APIを構築して Auth0 + Lambda Authorizerの認可機能を導入してみた \| DevelopersIO](https://dev.classmethod.jp/articles/aws-cdk-api-gateway-lambda-rest-auth0-lambda-authorizer/)

<br>
