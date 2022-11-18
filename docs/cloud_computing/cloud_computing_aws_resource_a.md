---
title: 【IT技術の知見】Aで始まるAWSリソース＠AWS
description: Aで始まるAWSリソース＠AWSの知見を記録しています。
---

# ```A```で始まるAWSリソース＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. AWSアカウント、リージョン、AZ

### AWSアカウント

AWSリソースの操作単位である。Webサイトのクラウドインフラの実行環境ごとに作成したほうが良い。アカウントIDは機密ではないため、仮にバージョン管理してしまうようなことがあっても問題ない。

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/accounts/latest/reference/accounts-welcome.html
> - https://www.lastweekinaws.com/blog/are-aws-account-ids-sensitive-information/

<br>

### リージョン

#### ▼ リージョンとは

物理サーバーのあるデータセンターの地域名のこと。

#### ▼ グローバルサービス

グローバルサービスは、物理サーバーが世界中にあり、これらの間ではパブリックネットワークが作成されている。そのため、特定のリージョンに依存せずに、全てのリージョンと連携できる。

![edge-location](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/edge-location.png)

<br>

### AZ：Availability Zones

#### ▼ AZとは

リージョンは、各データセンターは物理的に独立したAZというロケーションから構成されている。例えば、東京リージョンには、```3```個のAZがある。AZに跨いで冗長化すると、いずれかのデータセンターで障害が起こっても、残ったAZ上でシステムを稼働し続けられる（可用性を高められる）。もし、AZを跨いで作成できないようなAWSリソースの場合は、リージョンを跨ぐようにする。

<br>

## 02. Amplify

### Amplifyとは

サーバーレスアプリケーションを作成するためのクラウドインフラストラクチャのフレームワーク。

> ℹ️ 参考：https://d1.awsstatic.com/webinars/jp/pdf/services/20200520_AWSBlackBelt_Amplify_A.pdf

<br>

### アーキテクチャ

#### ▼ フロントエンド

SSGの場合、静的ファイルをデプロイしさえすれば、アプリケーションとしての要件が全て整う。SPAの場合、サーバーレスのバックエンドを自動作成してくれ、フロントエンドをデプロイしさえすれば、要件が全て整う。これのAWSリソースはCloudFormationによって作成されるが、Amplify経由でしか設定を変更できず、各AWSリリースのコンソール画面を見ても、非表示になっている。ただし、Route53の設定は表示されており、Amplifyが追加したレコードをユーザーが編集できるようになっている。

| 役割                    | 使用されているAWSリソース |
| ----------------------- | ------------------------- |
| 静的サイトホスティング  | CloudFront、S3            |
| GraphQLによるリクエスト | S3                        |

#### ▼ バックエンド

フロントエンドでGraphQLによるリクエストを実装している場合、AppSyncを使用して、これを受信できるAPIを作成する必要がある。

| 役割                     | 使用されているAWSリソース | クリーンアーキテクチャで相当するレイヤー |
| ------------------------ | ------------------------- | ---------------------------------------- |
| リアルタイム通知         | AppSync、IoT Core         | インフラストラクチャ層                   |
| RESTful-API、GraphQL-API | API Gateway、AppSync      | インフラストラクチャ層                   |
| 認証                     | Cognito                   | インターフェース層                       |
| 認可                     | Cognito                   | ユースケース層                           |
| ビジネスロジック         | Lambda                    | ドメイン層                               |
| 全文検索                 | Elastic Search            | ドメイン層                               |

#### ▼ ストレージ

| 役割         | 使用されているAWSリソース |
| ------------ | ------------------------- |
| NoSQL        | DynamoDB                  |
| ファイル保管 | S3                        |

#### ▼ CI/CDパイプライン

GitHubのブランチごとにアプリケーションのCI/CDパイプラインが発火するようにすれば、プルリクエストごとにアプリケーションの実行環境を用意できる。プルリクごとに実行環境を作成できると、例えば、```1```個のプルリクをデザイナーサイドとビジネスサイド（例：SEOとか）が一緒にレビューできるようになる。ただし、App Runnerを使用した方がよいかもしれない。

> ℹ️ 参考：
>
> - https://zenn.dev/intercept6/articles/4016e9d61ab36761685d
> - https://devblog.thebase.in/entry/2021/12/22/110000

<br>

### セットアップ

| 項目                   | 説明                                             | 補足                                                                                                                |
| ---------------------- | ------------------------------------------------ |-------------------------------------------------------------------------------------------------------------------|
| アプリケーションの名前 | Amplify上でのアプリケーション名を設定する。      |                                                                                                                   |
| 本番稼働ブランチ       | 基点ブランチを設定する。                         | Amplifyを本番運用しない場合は、```develop```ブランチを設定すれば良い。                                                                           |
| ブランチの自動検出     | ブランチの自動検出を有効化するか否かを設定する。                 | ワイルドカードを組み込む場合、アスタリスクを2つ割り当てないと、ブランチが検知されないことがある。例：『```**foo**,**bar**```』                                        |
| プレビュー             | GitHubのプルリクエスト上にAmplify環境のURLを通知する。 | 執筆時点（2021/02/07）では、プルリクエストを新しく作成しても、これは自動的に登録されない。そのため、その都度手動で登録する必要がある。                                              |
| アクセスコントロール   | Amplify環境に認証機能を設定する。                | 執筆時点（2021/02/07）では、Basic認証を使用できる。                                                                                 |
| リダイレクト           | リダイレクトするパスを設定する。         | ```404```ステータスで404ページにリダイレクトする場合は、以下の通りに設定する。<br>・送信元：```/<*>```<br>・ターゲットアドレス：```<404ページへのパス>```<br>・404（リダイレクト） |

<br>

### 手動ビルド＆デプロイ

#### ▼ 開発環境で擬似再現

サーバーレスアプリケーションを開発環境で再現する。

```bash
$ amplify mock api
```

#### ▼ 開発環境から手動でビルド&デプロイ

開発/ステージング/本番環境に切り替える必要がある。

```bash
# アプリケーションの設定
$ amplify add hosting

# ビルド&デプロイ
$ amplify publish
```

<br>

### 自動ビルド&デプロイ

#### ▼ 連携できるバージョン管理システム

> ℹ️ 参考：https://docs.aws.amazon.com/amplify/latest/userguide/getting-started.html#step-1-connect-repository

#### ▼ 対応するバージョン管理リポジトリ構造

| 構造名           | ビルド開始ディレクトリ                         |
| ---------------- | ---------------------------------------------- |
| 非モノリポジトリ | リポジトリ名からなるディレクトリ               |
| モノリポジトリ   | モノリポジトリの各アプリケーションディレクトリ |

#### ▼ ```amplify.yml```ファイル

バージョン管理リポジトリのルートに```amplify.yml```ファイルを配置する。Next.jsではSSG/SSRの両モードでビルド＆デプロイできる。```package.json```ファイルで使用される```next```コマンドに応じて、SSGまたはSSRのいずれかのインフラが作成され、デプロイされる。SSGの場合、裏側ではS3、CloudFront、Route53などが作成され、静的ホスティングが実行される。SSRの場合、フロントエンドのみでなくバックエンドの実行環境が必要になるため、LambdaやCogniteが作成される。

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html
> - https://docs.aws.amazon.com/amplify/latest/userguide/server-side-rendering-amplify.html#deploy-nextjs-app

```yaml
version: 1

#=====================
# 環境変数
#===================== 
env:
  variables:
    key: # 環境変数のハードコーディング
      
#=====================      
# バックエンドのCI/CDパイプライン
#===================== 
backend:
  phases:
    preBuild:
      commands:
         - # コマンド
    build:
      commands:
        - # コマンド
    postBuild:
      commands:
        - # コマンド
        
#=====================         
# フロントエンドのCI/CDパイプライン
#=====================  
frontend:
  phases:
    preBuild:
      commands:
        - npm install
        # base64方式エンコード値をデコード
        - echo "$ENV" | base64 -di > .env
        - cat .env
    build:
      commands:
        - nuxt generate --fail-on-error
        - ls -la ./dist
  artifacts:
    # デプロイ先のディレクトリ  
    files:
        # 全てのディレクトリ
        - "**/*"
    discard-paths: yes
    # ビルドのアーティファクトを配置するディレクトリ 
    baseDirectory: dist
  # 指定したディレクトリのキャッシュを作成
  cache:
    paths:
      - node_modules/**/*
        
#=====================         
# ホワイトボックステスト        
#===================== 
test:
  phases:
    preTest:
      commands:
        - # コマンド
    test:
      commands:
        - # コマンド
    postTest:
      commands:
        - # コマンド
  artifacts:
    # デプロイ先のディレクトリ
    files:
        # 全てのディレクトリ
        - "**/*"
    configFilePath: <パス>
    # ビルドのアーティファクトのディレクトリ      
    baseDirectory: <パス>
```

<br>

## 03. API Gateway

### API Gatewayとは

異なるクライアントからのリクエストを受信して差分を吸収し、適切なAPIに振り分けられる。

![API Gatewayの仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/APIGatewayの仕組み.png)

<br>

### セットアップ

API Gatewayは、メソッドリクエスト、統合リクエスト、統合レスポンス、メソッドレスポンス、から構成される。

| 設定項目                 | 説明                                                                   | 補足                                                         |
| ------------------------ |----------------------------------------------------------------------| ------------------------------------------------------------ |
| リソース                 | エンドポイント、HTTPメソッド、ルーティング先、などを設定する。                                    | 作成したAWSリソースのパスが、API Gatewayのエンドポイントになる。 |
| ステージ                 | API Gatewayをデプロイする環境を定義する。                                           |                                                              |
| オーソライザー           | LambdaまたはCognitoによるオーソライザーを使用して、認可プロセスを定義する。                         |                                                              |
| ゲートウェイのレスポンス |                                                                      |                                                              |
| モデル                   | リクエスト/レスポンスのスキーマを設定する。これらのバリデーションのために使用できる。                          | OpenAPI仕様におけるスキーマについては、以下のリンクを参考にせよ。<br>ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_collaboration_api_restful.html |
| リソースポリシー         | ポリシーを使用して、API Gatewayにセキュリティを定義づける。                                  |                                                              |
| ドキュメント             |                                                                      |                                                              |
| ダッシュボード           |                                                                      |                                                              |
| APIの設定                |                                                                      |                                                              |
| 使用サイズプラン             | 有料サービスとしてAPIを公開し、料金体系に応じてリクエストサイズを制限するために使用する。APIキーにリクエスト量のレートを設定する。 | 有料サービスとして使用しないAPIの場合は、レートを設定する必要はない。 |
| APIキー                  | APIキー認証を設定する。                                                        | ・その他のアクセス制御の方法として、以下がある。<br>ℹ️ 参考：https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-to-api.html |
| クライアント証明書       | SSL証明書をAPI Gatewayに割り当てる。                                            | APIが、API Gatewayからルーティングされたリクエストであること識別できるようになる。 |
| CloudWatchログの設定     | API GatewayがCloudWatchログにアクセスできるよう、ロールを設定する。                         | ```1```個のAWSアカウントにつき、```1```個のロールを設定すれば良い。            |

<br>

### リソース

#### ▼ リソース

| 順番 | 処理               | 説明                                                         | 補足                                                         |
| ---- | ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1    | メソッドリクエスト | クライアントから受信したデータのうち、実際にルーティングするデータをフィルタリングする。 |                                                              |
| 2    | 統合リクエスト     | メソッドリクエストからルーティングされた各データを、マッピングテンプレートのJSONに紐付ける。 |                                                              |
| 3    | 統合レスポンス     |                                                              | 統合リクエストでプロキシ統合を使用する場合、統合レスポンスを使用できなくなる。 |
| 4    | メソッドレスポンス | レスポンスが成功した場合、クライアントに送信するステータスコードを設定する。 |                                                              |

#### ▼ メソッドリクエスト

| 設定項目                    | 説明                                                         | 補足                                                         |
| --------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 認可                        | 定義したLambdaまたはCognitoによるオーソライザーを有効化するか否かを設定する。 |                                                              |
| リクエストの検証            | 『URLクエリ文字列パラメーター』『HTTPリクエストヘッダー』『リクエスト本文』のバリデーションを有効化するか否かを設定する。 |                                                              |
| APIキーの必要性             | リクエストヘッダーにおけるAPIキーのバリデーションを行う。リクエストのヘッダーに『```x-api-key```』を含み、これにAPIキーが割り当てられていることを強制する。 | ヘッダー名は大文字でも小文字でも問題ないが、小文字が推奨。<br>ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_collaboration_api_restful.html |
| URLクエリ文字列パラメーター | リクエストされたURLのクエリパラメーターのバリデーションを行う。 |                                                              |
| HTTPリクエストヘッダー      | リクエストヘッダーのバリデーションを行う。                   |                                                              |
| リクエスト本文              | リクエストボディのバリデーションを行う。                     |                                                              |
| SDK設定                     |                                                              |                                                              |

#### ▼ 統合リクエスト

| 設定項目                    | 説明                                                                                               | 補足                                   |
| --------------------------- |--------------------------------------------------------------------------------------------------| -------------------------------------- |
| 統合タイプ                  | リクエストのルーティング先を設定する。                                                                              |                                        |
| URLパスパラメーター         | メソッドリクエストからルーティングされたデータを、API Gatewayからルーティングするリクエストのパスパラメーターに紐付ける。代わりとして、紐付けずに新しいデータをルーティングしても良い。 |                                        |
| URLクエリ文字列パラメーター | メソッドリクエストからルーティングされたデータを、API Gatewayからルーティングするリクエストのクエリパラメーターに紐付ける。代わりとして、紐付けずに新しいデータをルーティングしても良い。 |                                        |
| HTTPヘッダー                | メソッドリクエストからルーティングされたデータを、API Gatewayからルーティングするリクエストのヘッダーに紐付ける。代わりとして、紐付けずに新しいデータをルーティングしても良い。       | 値はシングルクオートで囲う必要がある。 |
| マッピングテンプレート      | メソッドリクエストからルーティングされたデータを、API Gatewayからルーティングするリクエストのメッセージボディに紐付ける。代わりとして、紐付けずに新しいデータをルーティングしても良い。   |                                        |

#### ▼ ホワイトボックステスト

| 設定項目       | 設定例              | 補足                                         |
| -------------- | ------------------- | -------------------------------------------- |
| クエリ文字     |                     |                                              |
| ヘッダー       | X-API-Token: test   | 波括弧、スペース、クオーテーションは不要。   |
| リクエスト本文 | ```{test:"test"}``` | 改行タグやスペースが入り込まないようにする。 |

#### ▼ OpenAPI仕様のインポート

以下のリンクを参考にせよ。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/cloud_computing/cloud_computing_aws_resource_a_api_gateway_import.html

#### ▼ CORSの有効化

CORSを有効化し、異なるオリジンによって表示されたページからのリクエストを許可する。以下のリンクを参考にせよ。

> ℹ️ 参考：https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html

<br>

### プライベート統合

#### ▼ プライベート統合とは

API GatewayとVPCリンクの間で、リクエスト/レスポンスのJSONデータを自動的にマッピングする機能のこと。

> ℹ️ 参考：https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-private-integration.html

また、VPCリンクの設定によって、VPCエンドポイントサービスが作成される。

| 設定項目                     | 説明                                                  |
| ---------------------------- | ----------------------------------------------------- |
| 統合タイプ                   | VPCリンクを選択する。                                 |
| プロキシ統合の使用           | VPCリンクとのプロキシ統合を有効化するか否かを設定する。               |
| メソッド                     | HTTPメソッドを設定する。                              |
| VPCリンク                    | VPCリンク名を設定する。                               |
| エンドポイントURL            | NLBのDNS名をドメイン名として、転送先のURLを設定する。 |
| デフォルトタイムアウトの使用 |                                                       |

#### ▼ メソッドリクエストと統合リクエストのマッピング

<br>

### Lambdaプロキシ統合

#### ▼ Lambdaプロキシ統合とは

API GatewayとLambdaの間で、リクエスト/レスポンスのJSONデータを自動的にマッピングする機能のこと。プロキシ統合を使用すると、Lambdaに送信されたリクエストはハンドラ関数のeventオブジェクトに代入される。プロキシ統合を使用しない場合、LambdaとAPI Gatewayの間のマッピングを手動で行う必要がある。

> ℹ️ 参考：https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-integrations.html

| 設定項目                     | 説明                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| 統合タイプ                   | Lambda関数を選択する。                                       |
| Lambdaプロキシ統合の使用     | Lambdaとのプロキシ統合を有効化するか否かを設定する。                         |
| Lambdaリージョン             | 実行したLambda関数のリージョンを設定する。                   |
| Lambda関数                   | 実行したLambda関数の名前を設定する。                         |
| 実行ロール                   | 実行したいLambda関数への認可スコープが紐付けられたロールのARNを設定する。ただし、Lambda側にAPI Gatewayへの認可スコープを紐付けしても良い。 |
| 認証情報のキャッシュ         |                                                              |
| デフォルトタイムアウトの使用 |                                                              |

#### ▼ リクエスト時のマッピング

API Gateway側でプロキシ統合を有効化すると、API Gatewayを経由したクライアントからのリクエストは、ハンドラ関数のeventオブジェクトのJSONデータにマッピングされる。

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
        headers
    },
    "multiValueHeaders": {
        List
        of
        strings
        containing
        incoming
        request
        headers
    },
    "queryStringParameters": {
        query
        string
        parameters
    },
    "multiValueQueryStringParameters": {
        List
        of
        query
        string
        parameters
    },
    "pathParameters": {
        path
        parameters
    },
    "stageVariables": {
        Applicable
        stage
        variables
    },
    "requestContext": {
        Request
        context
        including
        authorizer-returned
        key-value
        pairs
    },
    "body": "A JSON string of the request payload.",
    "isBase64Encoded": "A boolean flag to indicate if the applicable request payload is Base64-encoded"
}

```

#### ▼ レスポンス時のマッピング

API Gatewayは、Lambdaからのレスポンスを、以下のJSONデータにマッピングする。これ以外の構造のJSONデータを送信すると、API Gatewayで『```Internal Server Error```』のエラーが起こる。

```yaml
{
    "isBase64Encoded": true
    |
    false,
    "statusCode": httpStatusCode,
    "headers": {
        "headerName": "headerValue",
        ...
    },
    "multiValueHeaders": {
        "headerName": [
            "headerValue",
            "headerValue2",
            ...
        ],
        ...
    },
    "body": "Hello Lambda"
}
```

API Gatewayは上記のJSONデータを受信した後、```body```のみ値をレスポンスのメッセージボディに持たせ、クライアントに送信する。

```
"Hello Lambda"
```

<br>

### ステージ

#### ▼ 設定

| 設定項目                           | 説明                                                                                                                         |
| ---------------------------------- |----------------------------------------------------------------------------------------------------------------------------|
| キャッシュ設定                     | ℹ️ 参考：https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-caching.html                                   |
| デフォルトのメソッドスロットリング | リクエスト数（個/秒）制限を設定する。<br>ℹ️ 参考：https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html |
| WAF                                | ℹ️ 参考：https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-aws-waf.html                     |
| クライアント証明書                 | 紐付けるWAFを設定する。                                                                                                              |

#### ▼ ステージ変数

デプロイされるステージ固有の環境変数を設定できる。Lambda関数名、エンドポイントURL、パラメーターマッピング、マッピングテンプレートで値を出力できる。以下のリンクを参考にせよ。

> ℹ️ 参考：https://docs.aws.amazon.com/apigateway/latest/developerguide/aws-api-gateway-stage-variables-reference.html

#### ▼ SDKの作成

<br>

### デプロイメント

#### ▼ 通常のデプロイメント

API Gatewayの通常のデプロイメントの仕組みは隠蔽されている。ダウンタイム無しで、新しいステージをデプロイできる。

> ℹ️ 参考：https://forums.aws.amazon.com/thread.jspa?threadID=238876

#### ▼ カナリアリリース

カナリアリリースを使用して、新しいステージをデプロイする。

> ℹ️ 参考：https://docs.aws.amazon.com/apigateway/latest/developerguide/canary-release.html

| 設定項目                                   | 説明 |
| ------------------------------------------ | ---- |
| ステージのリクエストディストリビューション |      |
| Canaryのデプロイ                           |      |
| Canaryステージ変数                         |      |
| キャッシュ                                 |      |

<br>

### ログの種類

#### ▼ 実行ログ

CloudWatchログにAPI Gatewayの実行ログを送信するか否かを設定できる。リクエスト/レスポンスの構造もログに出力するようにした方が良い。

> ℹ️ 参考：https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html

#### ▼ カスタムアクセスログ

CloudWatchログにAPI Gatewayのアクセスログを送信するか否かを設定できる。アクセスログを構造化ログとして出力できる。

> ℹ️ 参考：https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html

<br>

### 分散トレースの収集

X-Rayを使用して、API Gatewayを開始点とした分散トレースを収集する。まず、API GatewayでトレースIDが作成される。その後、各AWSリソースでスパンを取得し、スパンを紐付けることより、分散トレースを表現できる。なおX-Rayでは、親スパンをセグメント、子スパンをサブセグメントと呼ぶ。

> ℹ️ 参考：https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-traces

<br>

### APIの設定

#### ▼ エンドポイントタイプ

> ℹ️ 参考：https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-endpoint-types.html

| タイプ名     | 説明                                                         |
| ------------ | ------------------------------------------------------------ |
| リージョン   | API Gatewayのエンドポイントに対するリクエストを、リージョン内の物理サーバーで受け付ける。 |
| プライベート | API Gatewayのエンドポイントに対するリクエストを、VPC内からのみ受け付ける。 |
| エッジ最適化 | API Gatewayのエンドポイントに対するリクエストを、CloudFrontのエッジサーバーで受け付ける。 |

<br>

## 04. オートスケーリング

### オートスケーリングとは

ALBを使用して、起動テンプレートを基にしたEC2インスタンスの自動水平スケーリングを実行する。注意点として、オートスケーリングに紐付けるALBでは、ターゲットを登録する必要はなく、起動テンプレートに応じたインスタンスが自動的に登録される。言い換えると、オートスケーリングにターゲットグループを紐づけて初めて、ターゲットにルーティングできるようになる。

> ℹ️ 参考：https://www.a-frontier.jp/technology/aws10/

![Auto-scaling](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Auto-scaling.png)

<br>

### セットアップ

| 項目                 | 説明                                                         | 補足                                                   |
| -------------------- | ------------------------------------------------------------ |------------------------------------------------------|
| スケーリンググループ | スケーリングのグループ構成を定義する。各グループで最大最小必要数を設定できる。 |                                                      |
| 起動テンプレート     | スケーリングで起動するインスタンスの詳細（例：マシンイメージ、インスタンスタイプ、など）を設定する。 |                                                      |
| ネットワーク         | いずれのAZのサブネットでインスタンスを作成するかを設定する。 | 選択したAZの個数よりも少ない個数のEC2インスタンスを作成する場合、作成先のAZをランダムに選択する。 |
| スケーリングポリシー | スケーリングの方法を設定する。                               |                                                      |

<br>

### シンプルスケーリング

#### ▼ シンプルスケーリングとは

特定のメトリクスに単一の閾値を設定し、それに応じてスケールアウトとスケールインを行う。

<br>

### ステップスケーリング

#### ▼ ステップスケーリングとは

特定のメトリクスに段階的な閾値を設定し、それに応じて段階的にスケールアウトを実行する。スケールアウトの実行条件となる閾値期間は、CloudWatchメトリクスの連続期間として設定できる。AWSとしては、ターゲット追跡スケーリングの使用を推奨している。

**＊例＊**

CPU平均使用率に段階的な閾値を設定する。

- 40%の時にEC2インスタンスが1つスケールアウト
- ```70```%の時にEC2インスタンスを2つスケールアウト
- ```90```%の時にEC2インスタンスを```3```個スケールアウト

#### ▼ ECSの場合

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonECS/latest/userguide/service-autoscaling-stepscaling.html

<br>

### ターゲット追跡スケーリング

#### ▼ ターゲット追跡スケーリングとは

特定のメトリクス（CPU平均使用率やメモリ平均使用率）にターゲット値を設定し、それに収束するように自動的にスケールインとスケールアウトを実行する。ステップスケーリングとは異なり、スケーリングの実行条件となる閾値期間を設定できない。

**＊例＊**

- ECSサービスのECSタスク数
- DBクラスターのAuroraのリードレプリカ数
- Lambdaのスクリプト同時実行数

#### ▼ ECSの場合

ターゲット値の設定に応じて、自動的にスケールアウトやスケールインが起こるシナリオ例を示す。

1. 最小ECSタスク数を```2```、必要ECSタスク数を```4```、最大数を```6```、CPU平均使用率を```40```%に設定する例を考える。
2. 平常時、CPU使用率```40```%に維持される。
3. リクエストが増加し、CPU使用率```55```%に上昇する。
4. ECSタスク数が```6```個にスケールアウトし、CPU使用率```40```%に維持される。
5. リクエスト数が減少し、CPU使用率が```20```%に低下する。
6. ECSタスク数が```2```個にスケールインし、CPU使用率```40```%に維持される。

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-autoscaling-targettracking.html

| 設定項目                           | 説明                                                         | 補足                                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------ |----------------------------------------------------------------------------------------------------------------------|
| ターゲット追跡スケーリングポリシー | 監視対象のメトリクスがターゲット値を超過しているか否かを基に、ECSタスク数のスケーリングが実行される。 |                                                                                                                      |
| ECSサービスメトリクス              | 監視対象のメトリクスを設定する。                             | 『平均CPU』、『平均メモリ』、『ECSタスク当たりのALBからのリクエスト数』を監視できる。SLIに対応するCloudWatchメトリクスも参考にせよ。                                        |
| ターゲット値                       | ECSタスク数のスケーリングが実行される収束値を設定する。         | ターゲット値を超過している場合、ECSタスク数がスケールアウトされる。反対に、ターゲット値未満（正確にはターゲット値の```90```%未満）の場合、ECSタスク数がスケールインされる。                        |
| スケールアウトクールダウン期間     | スケールアウトを完了してから、次回のスケールアウトを発動できるまでの時間を設定する。 | ・期間を短くし過ぎると、ターゲット値を超過する状態が断続的に続いた場合、余分なスケールアウトが連続して実行されてしまうため注意する。<br>・期間を長く過ぎると、スケールアウトが不十分になり、ECSの負荷が緩和されないため注意する。 |
| スケールインクールダウン期間       | スケールインを完了してから、次回のスケールインを発動できるまでの時間を設定する。 |                                                                                                                      |
| スケールインの無効化               |                                                              |                                                                                                                      |

<br>

### スケーリングなし

#### ▼ スケーリングなしとは

ややわかりにくい機能名であるが、スケジューリングスケーリングと予測スケーリングを指す。負荷に合わせて動的にスケーリングするのではなく、一定の間隔で規則的にスケーリングする。

> ℹ️ 参考：
>
> - https://blog.takuros.net/entry/2020/08/11/082712
> - https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-scheduled-scaling.html

<br>
