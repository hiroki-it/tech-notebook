# AWS：Amazon Web Service

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## 01. ALB：Application Load Balancing

### ALBとは

クラウドリバースプロキシサーバー、かつクラウドロードバランサーとして働く。リクエストを代理で受信し、EC2インスタンスへのアクセスをバランスよく分配することによって、サーバーへの負荷を緩和する。

![ALBの機能](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ALBの機能.png)

<br>

### 設定項目

#### ・概要

| 設定項目             | 説明                                                         | 補足                                                         |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| リスナー             | ALBに割り振るポート番号と受信するプロトコルを設定する。リバースプロキシかつロードバランサ－として、これらの通信をターゲットグループにルーティングする。 |                                                              |
| セキュリティポリシー | リクエストの送信者が用いるSSL/TLSプロトコルや暗号化方式のバージョンに合わせて、ALBが受信できるこれらのバージョンを設定する。 | ・リクエストの送信者には、ブラウザ、APIにリクエストを送信する外部サービス、転送元のAWSリソース（CloudFrontなど）、などを含む。<br>・参考：https://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/application/create-https-listener.html#describe-ssl-policies |
| ルール               | リクエストのルーティングのロジックを設定する。               |                                                              |
| ターゲットグループ   | ルーティング時に用いるプロトコルと、ルーティング先のアプリケーションに割り当てられたポート番号を設定する。 | ターゲットグループ内のターゲットのうち、トラフィックはヘルスチェックがOKになっているターゲットにルーティングされる。 |
| ヘルスチェック       | ターゲットグループに属するプロトコルとアプリケーションのポート番号を指定して、定期的にリクエストを送信する。 |                                                              |

#### ・ターゲットグループ

| ターゲットの指定方法 | 補足                                                         |
| -------------------- | ------------------------------------------------------------ |
| インスタンス         | ターゲットが、EC2インスタンスでなければならない。                        |
| IPアドレス           | ターゲットのパブリックIPアドレスが、静的でなければならない。 |
| Lambda               | ターゲットが、Lambdaでなければならない。                     |

<br>

### ルール

#### ・ルールの設定例

| ユースケース                                                 | ポート    | IF                                             | THEN                                                         |
| ------------------------------------------------------------ | --------- | ---------------------------------------------- | ------------------------------------------------------------ |
| リクエストが```80```番ポートを指定した時に、```443```番ポートにリダイレクトしたい。 | ```80```  | それ以外の場合はルーティングされないリクエスト | リダイレクト先：```https://#{host}:443/#{path}?#{query}```<br>ステータスコード：```HTTP_301``` |
| リクエストが```443```番ポートを指定した時に、ターゲットグループに転送したい。 | ```443``` | それ以外の場合はルーティングされないリクエスト | 特定のターゲットグループ                                     |

<br>

### Webサーバー、アプリケーションにおける対応

#### ・問題

ALBからEC2インスタンスへのルーティングをHTTPプロトコルとした場合、アプリケーション側で、HTTPSプロトコルを用いた処理ができなくなる。そこで、クライアントからALBに対するリクエストのプロトコルがHTTPSだった場合、Webサーバーまたはアプリケーションでは、ルーティングのプロトコルをHTTPSと見なすように対処する。

![ALBからEC2へのリクエストのプロトコルをHTTPSと見なす](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ALBからEC2へのリクエストのプロトコルをHTTPSと見なす.png)

#### ・Webサーバーにおける対処方法

ALBを経由したリクエストの場合、リクエストヘッダーに```X-Forwarded-Proto```ヘッダーが付与される。これには、ALBに対するリクエストのプロトコルの種類が文字列で代入されている。これが『HTTPS』だった場合、WebサーバーへのリクエストをHTTPSであるとみなすように対処する。これにより、アプリケーションへのリクエストのプロトコルがHTTPSとなる（こちらを行った場合は、以降のアプリケーション側の対応不要）。

**＊実装例＊**

```apacheconf
SetEnvIf X-Forwarded-Proto https HTTPS=on
```

#### ・アプリケーションにおける対処方法

ALBを経由したリクエストの場合、リクエストヘッダーに```HTTP_X_FORWARDED_PROTO```ヘッダーが付与される。これには、ALBに対するリクエストのプロトコルの種類が文字列で代入されている。これが『HTTPS』だった場合、アプリケーションへのリクエストをHTTPSであるとみなすように、```index.php```に追加実装を行う。

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

#### ・ロードバランシングアルゴリズムとは

ターゲットへのリクエスト転送時の加重ルールを設定する。

参考：https://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/application/introduction.html#application-load-balancer-overview

#### ・ラウンドロビン

受信したリクエストを、ターゲットに均等に転送する。

#### ・最小未処理リクエスト（ファステスト）

受信したリクエストを、未処理のリクエスト数が最も少ないターゲットに転送する。

参考：https://www.infraexpert.com/study/loadbalancer4.html

<br>

### その他の留意事項

#### ・500系ステータスコードの原因

参考：https://aws.amazon.com/jp/premiumsupport/knowledge-center/troubleshoot-http-5xx/

#### ・割り当てられるプライベートIPアドレス範囲

ALBに割り当てられるIPアドレス範囲には、VPCのものが適用される。そのため、EC2インスタンスのSecurity Groupでは、VPCのIPアドレス範囲を許可するように設定する必要がある。

#### ・ALBのセキュリティグループ

Route53から転送されるパブリックIPアドレスを受信できるようにしておく必要がある。パブリックネットワークに公開するサイトであれば、IPアドレスは全ての範囲（```0.0.0.0/0```と``` ::/0```）にする。社内向けのサイトであれば、社内のプライベートIPアドレスのみ（```n.n.n.n/32```）を許可するようにする。

<br>

## 02. Amplify

### Amplifyとは

サーバーレスアプリケーションを構築するためのクラウドインフラストラクチャのフレームワーク。

参考：https://d1.awsstatic.com/webinars/jp/pdf/services/20200520_AWSBlackBelt_Amplify_A.pdf

<br>

### アーキテクチャ

#### ・フロントエンド

SSGの場合、静的ファイルをデプロイしさえすれば、アプリケーションとしての要件が全て整う。SPAの場合、サーバーレスのバックエンドを自動構築してくれ、フロントエンドをデプロイしさえすれば、要件が全て整う。これのAWSリソースはCloudFormationによって構築されるが、Amplify経由でしか設定を変更できず、各AWSリリースのコンソール画面を見ても、非表示になっている。ただし、Route53の設定は表示されており、Amplifyが追加したレコードをユーザーが編集できるようになっている。

| 役割                    | 使用されているAWSリソース |
| ----------------------- | ------------------------- |
| 静的サイトホスティング  | CloudFront、S3            |
| GraphQLによるリクエスト | S3                        |

#### ・バックエンド

フロントエンドでGraphQLによるリクエストを実装している場合、AppSyncを用いて、これを受信できるAPIを構築する必要がある。

| 役割                   | 使用されているAWSリソース    | クリーンアーキテクチャで相当するレイヤー |
| ---------------------- | ---------------------------- | ---------------------- |
| リアルタイム通知       | AppSync、IoT Core            | インフラストラクチャ層 |
| RESTful-API、GraphQL-API | API Gateway、AppSync | インフラストラクチャ層 |
| 認証                   | Cognito                     | インターフェース層 |
| 認可 | Cognito | ユースケース層 |
| ビジネスロジック | Lambda                       | ドメイン層 |
| 全文検索               | Elastic Search               | ドメイン層 |

#### ・ストレージ

| 役割                   | 使用されているAWSリソース    |
| ---------------------- | ---------------------------- |
| NoSQL           | DynamoDB                     |
| ファイル保管     | S3                           |

<br>

### 設定項目

| 項目                 | 説明                             | 補足                                                         |
| -------------------- | -------------------------------- | ------------------------------------------------------------ |
| 本番稼働ブランチ     | 基点ブランチを設定する。         | Amplifyを本番運用しない場合は、developブランチを設定すればよい。 |
| Branch autodetection | ブランチの自動検出を有効化する。 | ワイルドカードを組み込む場合、アスタリスクを二つ割り当てないと、ブランチが検知されないことがある。 |
|                      |                                  |                                                              |

<br>

### 手動ビルド＆デプロイ

#### ・開発環境で擬似再現

サーバーレスアプリケーションを開発環境で再現する。

```bash
$ amplify mock api
```

#### ・開発環境から直接ビルド&デプロイ

開発/ステージング/本番環境に切り替える必要がある。

```bash
# アプリケーションの設定
$ amplify add hosting

# ビルド&デプロイ
$ amplify publish
```

<br>

### 自動ビルド&デプロイ

#### ・連携可能なバージョン管理システム

参考：https://docs.aws.amazon.com/ja_jp/amplify/latest/userguide/getting-started.html#step-1-connect-repository

#### ・対応するリポジトリ構造

| 構造名             | ビルド開始ディレクトリ                         |
| ---------------- | ---------------------------------------------- |
| 非モノリポジトリ | リポジトリ名からなるディレクトリ               |
| モノリポジトリ   | モノリポジトリの各アプリケーションディレクトリ |

#### ・```amplify.yml```ファイル

リポジトリのルートに```amplify.yml```ファイルを配置する。Next.jsではSSG/SSRの両モードでビルド＆デプロイできる。```package.json```ファイルで用いられる```next```コマンドに応じて、SSGまたはSSRのいずれかのインフラが構築され、デプロイされる。SSGの場合、裏側ではS3、CloudFront、Route53などが構築され、静的ホスティングが実行される。SSRの場合、フロントエンドだけでなくバックエンドの稼働環境が必要になるため、LambdaやCogniteが構築される。

参考：

- https://docs.aws.amazon.com/ja_jp/amplify/latest/userguide/build-settings.html
- https://docs.aws.amazon.com/ja_jp/amplify/latest/userguide/server-side-rendering-amplify.html#deploy-nextjs-app

```yaml
version: 1

#=====================
# 環境変数
#===================== 
env:
  variables:
    key: # 環境変数のハードコーディング
      
#=====================      
# バックエンドのCI/CD
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
# フロントエンドのCI/CD
#=====================  
frontend:
  phases:
    preBuild:
      commands:
        - npm install
        # 環境変数として登録したエンコード値をデコード
        - echo $ENV | base64 -di > .env
        - cat .env
    build:
      commands:
        - nuxt generate --fail-on-error
        - ls -la ./dist
  artifacts:
    # デプロイ対象のディレクトリ  
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
# テスト        
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
    # デプロイ対象のディレクトリ
    files:
        # 全てのディレクトリ
        - "**/*"
    configFilePath: *location*
    # ビルドのアーティファクトのディレクトリ      
    baseDirectory: *location*
```

<br>

## 03. API Gateway

### API Gatewayとは

異なるクライアントからのリクエストを受信して差分を吸収し、適切なAPIに振り分けられる。

![API Gatewayの仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/APIGatewayの仕組み.png)

<br>

### 設定項目

#### ・概要

API Gatewayは、メソッドリクエスト、統合リクエスト、統合レスポンス、メソッドレスポンス、から構成される。

| 設定項目                 | 説明                                                         | 補足                                                         |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| リソース                 | エンドポイント、HTTPメソッド、転送先、などを設定する。       | 構築したAWSリソースのパスが、API Gatewayのエンドポイントになる。 |
| ステージ                 | API Gatewayをデプロイする環境を定義する。                    |                                                              |
| オーソライザー           | LambdaまたはCognitoによるオーソライザーを用いて、認可プロセスを定義する。 |                                                              |
| ゲートウェイのレスポンス |                                                              |                                                              |
| モデル                   | リクエスト/レスポンスのスキーマを設定する。これらのバリデーションのために使用できる。 | OpenAPI仕様におけるスキーマについては、以下のリンク先を参考にせよ。<br>参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/software/software_application_collaboration_api_restful.html |
| リソースポリシー         | ポリシーを用いて、API Gatewayにセキュリティを定義づける。  |                                                              |
| ドキュメント             |                                                              |                                                              |
| ダッシュボード           |                                                              |                                                              |
| APIの設定                |                                                              |                                                              |
| 使用量プラン             | 有料サービスとしてAPIを公開し、料金体系に応じてリクエスト量を制限するために用いる。APIキーにリクエスト量のレートを設定する。 | 有料サービスとして使用しないAPIの場合は、レートを設定する必要はない。 |
| APIキー                  | APIキー認証を設定する。                                      | ・その他のアクセス制御の方法として、以下がある。<br>参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/apigateway-control-access-to-api.html<br>・APIキー認証については、以下のリンク先を参考にせよ。<br>参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/security/security_authentication_authorization.html |
| クライアント証明書       | SSL証明書をAPI Gatewayに割り当てる。                   | APIが、API Gatewayから転送されたリクエストであること識別できるようになる。 |
| CloudWatchログの設定     | API GatewayがCloudWatchログにアクセスできるよう、ロールを設定する。 | 1つのAWS環境につき、1つのロールを設定すればよい。          |

<br>

### リソース

#### ・リソース

| 順番 | 処理               | 説明                                                         | 補足                                                         |
| ---- | ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1    | メソッドリクエスト | クライアントから送信されたデータのうち、実際に転送するデータをフィルタリングする。 |                                                              |
| 2    | 統合リクエスト     | メソッドリクエストから転送された各データを、マッピングテンプレートのJSONに紐付ける。 |                                                              |
| 3    | 統合レスポンス     |                                                              | 統合リクエストでプロキシ統合を用いる場合、統合レスポンスを使用できなくなる。 |
| 4    | メソッドレスポンス | レスポンスが成功した場合、クライアントに送信するステータスコードを設定する。 |                                                              |

#### ・メソッドリクエスト

| 設定項目                  | 説明                                                         | 補足                                                         |
| ------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 認可                      | 定義したLambdaまたはCognitoによるオーソライザーを有効化する。 |                                                              |
| リクエストの検証          | 『URLクエリ文字列パラメータ』『HTTPリクエストヘッダー』『リクエスト本文』のバリデーションを有効化する。 |                                                              |
| APIキーの必要性           | リクエストヘッダーにおけるAPIキーのバリデーションを行う。リクエストのヘッダーに『```x-api-key```』を含み、これにAPIキーが割り当てられていることを強制する。 | ヘッダー名は大文字でも小文字でも問題ないが、小文字が推奨。<br>参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/software/software_application_collaboration_api_restful.html |
| URLクエリ文字列パラメータ | リクエストされたURLのクエリパラメータのバリデーションを行う。 |                                                              |
| HTTPリクエストヘッダー    | リクエストヘッダーのバリデーションを行う。                   |                                                              |
| リクエスト本文            | リクエストボディのバリデーションを行う。                     |                                                              |
| SDK設定                   |                                                              |                                                              |

#### ・統合リクエスト

| 設定項目                  | 説明                                                         | 補足                                   |
| ------------------------- | ------------------------------------------------------------ | -------------------------------------- |
| 統合タイプ                | リクエストの転送先を設定する。                               |                                        |
| URLパスパラメータ         | メソッドリクエストから転送されたデータを、API Gatewayから転送するリクエストのパスパラメータに紐付ける。または紐付けずに、新しいデータを転送しても良い。 |                                        |
| URLクエリ文字列パラメータ | メソッドリクエストから転送されたデータを、API Gatewayから転送するリクエストのクエリパラメータに紐付ける。または紐付けずに、新しいデータを転送しても良い。 |                                        |
| HTTPヘッダー              | メソッドリクエストから転送されたデータを、API Gatewayから転送するリクエストのヘッダーに紐付ける。または紐付けずに、新しいデータを転送しても良い。 | 値はシングルクオートで囲う必要がある。 |
| マッピングテンプレート    | メソッドリクエストから転送されたデータを、API Gatewayから転送するリクエストのメッセージボディに紐付ける。または紐付けずに、新しいデータを転送しても良い。 |                                        |

#### ・テスト

| 設定項目       | 設定例              | 補足                                         |
| -------------- | ------------------- | -------------------------------------------- |
| クエリ文字     |                     |                                              |
| ヘッダー       | X-API-Token: test   | 波括弧、スペース、クオーテーションは不要。   |
| リクエスト本文 | ```{test:"test"}``` | 改行タグやスペースが入り込まないようにする。 |

#### ・OpenAPI仕様のインポート

以下のリンク先を参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/cloud_computing/cloud_computing_aws_api_gateway_import.html

#### ・CORSの有効化

CORSを有効化し、異なるオリジンによって表示されたページからのリクエストを許可する。以下のリンク先を参考にせよ。

参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/how-to-cors.html

<br>

### プライベート統合

#### ・プライベート統合とは

API GatewayとVPCリンクの間で、リクエスト/レスポンスのJSONデータを自動的にマッピングする機能のこと。

参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/set-up-private-integration.html

また、VPCリンクの設定によって、VPCエンドポイントサービスが構築される。VPCエンドポイントサービスについては、VPCエンドポイントサービスの説明を参考にせよ。

| 設定項目                     | 説明                                                  |
| ---------------------------- | ----------------------------------------------------- |
| 統合タイプ                   | VPCリンクを選択する。                                 |
| プロキシ統合の使用           | VPCリンクとのプロキシ統合を有効化する。               |
| メソッド                     | HTTPメソッドを設定する。                              |
| VPCリンク                    | VPCリンク名を設定する。                               |
| エンドポイントURL            | NLBのDNS名をドメイン名として、転送先のURLを設定する。 |
| デフォルトタイムアウトの使用 |                                                       |

#### ・メソッドリクエストと統合リクエストのマッピング

<br>

### Lambdaプロキシ統合

#### ・Lambdaプロキシ統合とは

API GatewayとLambdaの間で、リクエスト/レスポンスのJSONデータを自動的にマッピングする機能のこと。プロキシ統合を用いると、Lambdaに送信されたリクエストはハンドラ関数のeventオブジェクトに代入される。プロキシ統合を用いない場合、LambdaとAPI Gatewayの間のマッピングを手動で行う必要がある。

参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/set-up-lambda-integrations.html

| 設定項目                     | 説明                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| 統合タイプ                   | Lambda関数を選択する。                                       |
| Lambdaプロキシ統合の使用     | Lambdaとのプロキシ統合を有効化する。                         |
| Lambdaリージョン             | 実行したLambda関数のリージョンを設定する。                   |
| Lambda関数                   | 実行したLambda関数の名前を設定する。                         |
| 実行ロール                   | 実行したいLambda関数へのアクセス権限がアタッチされたロールのARNを設定する。ただし、Lambda側にAPI Gatewayへのアクセス権限をアタッチしてもよい。 |
| 認証情報のキャッシュ         |                                                              |
| デフォルトタイムアウトの使用 |                                                              |

#### ・リクエスト時のマッピング

API Gateway側でプロキシ統合を有効化すると、API Gatewayを経由したクライアントからのリクエストは、ハンドラ関数のeventオブジェクトのJSONデータにマッピングされる。

```bash
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

#### ・レスポンス時のマッピング

API Gatewayは、Lambdaからのレスポンスを、以下のJSONデータにマッピングする。これ以外の構造のJSONデータを送信すると、API Gatewayで『```Internal Server Error```』のエラーが起こる。

```bash
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

#### ・設定

| 設定項目                           | 説明                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| キャッシュ設定                     | 参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/api-gateway-caching.html |
| デフォルトのメソッドスロットリング | １秒当たりのリクエスト数制限を設定する。<br>参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/api-gateway-request-throttling.html |
| WAF                                | 参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/apigateway-control-access-aws-waf.html |
| クライアント証明書                 | 紐付けるWAFを設定する。                                    |

#### ・ステージ変数

デプロイされるステージ固有の環境変数を設定できる。Lambda関数名、エンドポイントURL、パラメータマッピング、マッピングテンプレートで値を出力できる。以下のリンク先を参考にせよ。

参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/aws-api-gateway-stage-variables-reference.html

#### ・SDKの生成

<br>

### デプロイメント

#### ・通常のデプロイメント

API Gatewayの通常のデプロイメントの仕組みあ隠蔽されている。ダウンタイム無しで、新しいステージをデプロイできる。

参考：https://forums.aws.amazon.com/thread.jspa?threadID=238876

#### ・カナリアリリース

カナリアリリースを用いて、新しいステージをデプロイする。

参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/canary-release.html

| 設定項目                                   | 説明 |
| ------------------------------------------ | ---- |
| ステージのリクエストディストリビューション |      |
| Canaryのデプロイ                           |      |
| Canaryステージ変数                         |      |
| キャッシュ                                 |      |

<br>

### ログの種類

#### ・実行ログ

CloudWatchログにAPI Gatewayの実行ログを送信するかどうかを設定できる。リクエスト/レスポンスの構造もログに出力するようにした方が良い。　

参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/set-up-logging.html

#### ・カスタムアクセスログ

CloudWatchログにAPI Gatewayのアクセスログを送信するかどうかを設定できる。アクセスログを構造化ログとして出力できる。

参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/set-up-logging.html

<br>

### 分散トレースの収集

X-Rayを用いて、API Gatewayを起点とした分散トレースを収集する。まず、API GatewayでトレースIDが生成される。その後、各AWSリソースでスパンを取得し、スパンを紐付けることより、分散トレースを表現できる。なおX-Rayでは、親スパンをセグメント、子スパンをサブセグメントと呼ぶ。

参考：https://docs.aws.amazon.com/ja_jp/xray/latest/devguide/xray-concepts.html#xray-concepts-traces

<br>

### APIの設定

#### ・エンドポイントタイプ

参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/api-gateway-api-endpoint-types.html

| タイプ名         | 説明                                                         |
| ------------ | ------------------------------------------------------------ |
| リージョン   | API Gatewayのエンドポイントへのリクエストを、リージョン内の物理サーバーで受け付ける。 |
| プライベート | API Gatewayのエンドポイントへのリクエストを、VPC内からのみ受け付ける。 |
| エッジ最適化 | API Gatewayのエンドポイントへのリクエストを、CloudFrontのエッジサーバーで受け付ける。 |

<br>

## 04. Auto Scaling

### Auto Scalingとは

アプリケーションのメトリクスの閾値を基準として、自動水平スケーリングを自動的に実行する。

![Auto-scaling](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Auto-scaling.png)

<br>

### 設定項目

#### ・起動設定

スケーリングの対象となるAWSリソースを定義する。

#### ・スケーリンググループ

スケーリングのグループ構成を定義する。各グループで最大最小必要数を設定できる。

#### ・スケーリングポリシー

スケーリングの方法を定義する。

| 機能名                       | 説明                                                         | 補足                                                         |
| -------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| シンプルスケーリング       | 特定のメトリクスに単一の閾値を設定し、それに応じてスケーリングを行う。 |                                                              |
| ステップスケーリング       | 特定のメトリクスに段階的な閾値を設定し、それに応じて段階的にスケーリングを実行する。 | （例）CPU平均使用率に段階的な閾値を設定する。<br>・40%の時にEC2インスタンスが1つスケールアウト<br>・70%の時にEC2インスタンスを2つスケールアウト<br>・90%の時にEC2インスタンスを3つスケールアウト |
| ターゲット追跡スケーリング | 特定のメトリクス（CPU平均使用率やMemory平均使用率）にターゲット値を設定し、それに収束するように自動的にスケールインとスケールアウトを実行する。 | ターゲット値を設定できるリソースの例<br>・ECSサービスのタスク数<br>・DBクラスターのAuroraのリードレプリカ数<br>・Lambdaのスクリプト同時実行数 |

<br>

## 05. Certificate Manager

### 設定項目

| 設定項目   | 説明                                       |
| ---------- | ------------------------------------------ |
| ドメイン名 | 認証をリクエストするドメイン名を設定する。 |
| 検証の方法 | DNS検証かEメール検証かを設定する。           |

<br>

### 認証局

認証局であるATSによって認証されたSSL証明書を管理できる。

| 自社の中間認証局名         | ルート認証局名 |
| -------------------------- | -------------- |
| ATS：Amazon Trust Services | Starfield社    |

<br>

### SSL証明書の検証方法

#### ・ドメイン検証

ドメインのSSL証明書を発行するためには、そのドメインの所有者であることを証明する必要がある。AWSだけでなく、GMOなどのドメインを購入できる各サービスに検証方法が用意されている。

参考：

- https://docs.aws.amazon.com/ja_jp/acm/latest/userguide/domain-ownership-validation.html
- https://jp.globalsign.com/support/proceeding/147.html

#### ・DNS検証

CMによってRoute53に自動生成されるCNAMEレコード値を用いて、ドメインの所有者であることを証明する。証明書が失効しそうになったときに、CNAMEレコード値が照合され、CMが証明書を再発行してくれる。なお、ドメインをAWS以外（例：お名前ドットコム）で購入している場合は、NSレコード値を購入先のサービスのドメインレジストラに手作業で登録する必要があることに注意する。

参考：

- https://docs.aws.amazon.com/ja_jp/acm/latest/userguide/dns-validation.html
- https://dev.classmethod.jp/articles/route53-domain-onamae/

#### ・Eメール検証

ドメインの所有者にメールを送信し、これを承認することで所有者であることを証明する。ドメインをAWS以外（例：お名前ドットコム）で購入している場合は、そちらで設定したメールアドレス宛に確認メールが送信される。

参考：https://docs.aws.amazon.com/ja_jp/acm/latest/userguide/email-validation.html

#### ・検証方法の変更

既存の証明書の検証方法は変更できない。そのため、検証方法を変更した証明書を新しく発行し、これを紐づける必要がある。古い証明書は削除しておく。

参考：https://aws.amazon.com/jp/premiumsupport/knowledge-center/switch-acm-certificate/

<br>

### 証明書

#### ・セキュリティポリシー

許可するプロトコルを定義したルールこと。SSL/TLSプロトコルを許可しており、対応できるバージョンが異なるため、ブラウザがそのバージョンのSSL/TLSプロトコルを使用できるかを認識しておく必要がある。

|                      | Policy-2016-08 | Policy-TLS-1-1 | Policy-TLS-1-2 |
| -------------------- | :------------: | :------------: | :------------: |
| **Protocol-TLSv1**   |       〇       |       ✕        |       ✕        |
| **Protocol-TLSv1.1** |       〇       |       〇       |       ✕        |
| **Protocol-TLSv1.2** |       〇       |       〇       |       〇       |

#### ・SSL証明書の種類

DNS検証またはEメール検証によって、ドメインの所有者であることが証明されると、発行される。証明書は、PKIによる公開鍵検証に用いられる。

| 証明書の種類         | 説明                                             |
| -------------------- | ------------------------------------------------ |
| ワイルドカード証明書 | 証明するドメイン名にワイルドカードを用いたもの。 |

#### ・SSL証明書の設置場所パターン

AWSの使用上、ACM証明書を設置できないAWSリソースに対しては、外部の証明書を手に入れて設置する。HTTPSによるSSLプロトコルを受け付けるネットワークの最終地点のことを、SSLターミネーションという。

| パターン<br>（Route53には必ず設置）                      | SSLターミネーション<br>（HTTPSの最終地点） | 補足                                                         |
| -------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| Route53 → ALB(+ACM証明書) → EC2                          | ALB                                        |                                                              |
| Route53 → CloudFront(+ACM証明書) → ALB(+ACM証明書) → EC2 | ALB                                        | CloudFrontはバージニア北部で、またALBは東京リージョンで、証明書を構築する必要がある。CloudFrontに送信されたHTTPSリクエストをALBにルーティングするために、両方に紐付ける証明書で承認するドメインは、一致させる必要がある。 |
| Route53 → CloudFront(+ACM証明書) → EC2                   | CloudFront                                 |                                                              |
| Route53 → CloudFront(+ACM証明書) → S3                    | CloudFront                                 |                                                              |
| Route53 → ALB(+ACM証明書) → EC2(+外部証明書)             | EC2                                        |                                                              |
| Route53 → NLB → EC2(+外部証明書)                         | EC2                                        |                                                              |
| Route53 → EC2(+外部証明書)                               | EC2                                        |                                                              |
| Route53 → Lightsail(+ACM証明書)                          | Lightsail                                  |                                                              |

<br>

### 証明書の変更

#### ・証明書の確認

Chromeを例に挙げると、SSL証明書はURLの鍵マークから確認できる。

**＊例＊**

CircleCIのサイトは、SSL証明書のためにACMを用いている。

![ssl_certificate_chrome](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ssl_certificate_chrome.png)

#### ・ダウンタイム

ALBでは証明書の変更でダウンタイムは発生しない。既存のセッションを維持しつつ、新しい証明書が適用される。CloudFrontは謎...

参考：https://aws.typepad.com/sajp/2014/04/elb-ssl.html

<br>

## 06. Chatbot

### Chatbotとは

SNSを経由して、CloudWatchからの通知をチャットアプリに転送するAWSリソース。

![ChatbotとSNSの連携](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ChatbotとSNSの連携.png)

<br>

### 設定項目

#### ・slack通知の場合

クライアントをSlackとした場合の設定を以下に示す。

| 設定項目        | 説明                                                         |
| --------------- | ------------------------------------------------------------ |
| Slackチャンネル | 通知の転送先のSlackチャンネルを設定する。                    |
| アクセス許可    | SNSを介して、CloudWatchにアクセスするためのロールを設定する。 |
| SNSトピック     | CloudWatchへのアクセス時経由する、SNSトピックを設定する。    |

#### ・サポート対象のイベント

AWSリソースのイベントを、EventBridge（CloudWatchイベント）を用いて、Chatbotに転送できるが、全てのAWSリソースをサポートしているわけではない。サポート対象のAWSリソースは以下のリンク先を参考にせよ。

参考：https://docs.aws.amazon.com/ja_jp/chatbot/latest/adminguide/related-services.html#cloudwatchevents

#### ・インシデント

４大シグナルを含む、システム的に良くない事象のこと。

#### ・オンコール

インシデントを通知するようにし、通知を受けて対応すること。

<br>

## 07. CloudFront

### CloudFrontとは

クラウドリバースプロキシサーバーとして働く。VPCの外側（パブリックネットワーク）に設置されている。オリジンサーバー（コンテンツ提供元）をS3とした場合、動的コンテンツへのリクエストをEC2に振り分ける。また、静的コンテンツへのリクエストをキャッシュし、その上でS3へ振り分ける。次回以降の静的コンテンツのリンクエストは、CloudFrontがレンスポンスを行う。

![AWSのクラウドデザイン一例](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/CloudFrontによるリクエストの振り分け.png)

### 設定項目

#### ・概要

| 設定項目            | 説明 |
| ------------------- | ---- |
| Distributions       |      |
| Reports & analytics |      |

<br>

### Distributions

#### ・Distributions

参考：https://www.geekfeed.co.jp/geekblog/wordpress%E3%81%A7%E6%A7%8B%E7%AF%89%E3%81%95%E3%82%8C%E3%81%A6%E3%81%84%E3%82%8B%E3%82%A6%E3%82%A7%E3%83%96%E3%82%B5%E3%82%A4%E3%83%88%E3%81%ABcloudfront%E3%82%92%E7%AB%8B%E3%81%A6%E3%81%A6%E9%AB%98/

| 設定項目                 | 説明                                                         | 補足 |
| ------------------------ | ------------------------------------------------------------ | ---- |
| General                  |                                                              |      |
| Origin and Origin Groups | コンテンツを提供するAWSリソースを設定する。                  |      |
| Behavior                 | オリジンにリクエストが行われた時のCloudFrontの挙動を設定する。 |      |
| ErrorPage                | 指定したオリジンから、指定したファイルのレスポンスを返信する。 |      |
| Restriction              |                                                              |      |
| Invalidation             | CloudFrontに保存されているキャッシュを削除できる。                |      |

#### ・General

| 設定項目            | 説明                                                         | 補足                                                         |
| ------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Price Class         | 用いるエッジロケーションを設定する。                       | Asiaが含まれているものを選択。                               |
| AWS WAF             | CloudFrontに紐付けるWAFを設定する。                          |                                                              |
| CNAME               | CloudFrontのデフォルトドメイン名（```*****.cloudfront.net.```）に紐付けるRoute53レコード名を設定する。 | ・Route53からルーティングする場合は必須。<br>・複数のレコード名を設定できる。 |
| SSL Certificate     | HTTPSプロトコルでオリジンに転送する場合に設定する。          | 上述のCNAMEを設定した場合、SSL証明書が別途必要になる。また、Certificate Managerを用いる場合、この証明書は『バージニア北部』で申請する必要がある。 |
| Security Policy     | リクエストの送信者が用いるSSL/TLSプロトコルや暗号化方式のバージョンに合わせて、CloudFrontが受信できるこれらのバージョンを設定する。 | ・リクエストの送信者には、ブラウザ、APIにリクエストを送信する外部サービス、転送元のAWSリソース、などを含む。<br>・参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/secure-connections-supported-viewer-protocols-ciphers.html |
| Default Root Object | オリジンのドキュメントルートを設定する。                     | ・何も設定しない場合、ドキュメントルートは指定されず、Behaviorで明示的にルーティングする必要がある。<br>・index.htmlを設定すると、『```/```』でリクエストした時に、オリジンのルートディレクトリにある```index,html```ファイルがドキュメントルートになる。 |
| Standard Logging    | CloudFrontのアクセスログをS3に生成するかどうかを設定する。   |                                                              |

#### ・Origin and Origin Groups

| 設定項目               | 説明                                                         | 補足                                                         |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Origin Domain Name     | CloudFrontをリバースプロキシとして、AWSリソースのエンドポイントやDNSにルーティングする。 | ・例えば、S3のエンドポイント、ALBのDNS名を設定する。<br>・別アカウントのAWSリソースのDNS名であってもよい。 |
| Origin Path            | オリジンのルートディレクトリを設定する。                     | ・何も設定しないと、デフォルトは『```/```』のなる。Behaviorでは、『```/```』の後にパスが追加される。<br>・『```/var/www/app```』を設定すると、Behaviorで設定したパスが『```/var/www/app/foo```』のように追加される。 |
| Origin Access Identity | リクエストの転送先となるAWSリソースでアクセス権限のアタッチが必要な場合に設定する。転送先のAWSリソースでは、アクセスポリシーをアタッチする。 | CloudFrontがS3に対して読み出しを行うために必要。             |
| Origin Protocol Policy | リクエストの転送先となるAWSリソースに対して、HTTPとHTTPSのいずれのプロトコルで転送するかを設定する。 | ・ALBで必要。ALBのリスナーのプロトコルに合わせて設定する。<br>・```HTTP Only```：HTTPで転送<br>・```HTTPS Only```：HTTPSで転送<br>・```Match Viewer```：両方で転送 |
| HTTPポート             | 転送時に指定するオリジンのHTTPのポート番号                   |                                                              |
| HTTPSポート            | 転送時に指定するオリジンのHTTPSのポート番号                  |                                                              |

#### ・Behavior

| 設定項目                       | 説明                                                         | 補足                                                         |
| ------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Precedence                     | 処理の優先順位。                                             | 最初に構築したBehaviorが『```Default (*)```』となり、これは後から変更できないため、主要なBehaviorをまず最初に設定する。 |
| Path pattern                   | Behaviorを行うファイルパスを設定する。                       |                                                              |
| Origin and Origin Group        | Behaviorを行うオリジンを設定する。                           |                                                              |
| Viewer Protocol Policy         | HTTP/HTTPSのどちらを受信するか、またどのように変換して転送するかを設定 | ・```HTTP and HTTPS```：両方受信し、そのまま転送<br>・```Redirect HTTP to HTTPS```：両方受信し、HTTPSで転送<br>・```HTTPS Only```：HTTPSのみ受信し、HTTPSで転送 |
| Allowed HTTP Methods           | リクエストのHTTPメソッドのうち、オリジンへの転送を許可するものを設定 | ・パスパターンが静的ファイルへのリクエストの場合、GETのみ許可。<br>・パスパターンが動的ファイルへのリクエストの場合、全てのメソッドを許可。 |
| Object Caching                 | CloudFrontにコンテンツのキャッシュを保存しておく秒数を設定する。 | ・Origin Cacheヘッダーを選択した場合、アプリケーションからのレスポンスヘッダーのCache-Controlの値が適用される。<br>・カスタマイズを選択した場合、ブラウザのTTLとは別に設定できる。 |
| TTL                            | CloudFrontにキャッシュを保存しておく秒数を詳細に設定する。   | ・Min、Max、Default、の全てを0秒とすると、キャッシュを無効化できる。<br>・『Headers = All』としている場合、キャッシュが実質無効となるため、最小TTLはゼロでなければならない。<br>・キャッシュの最終的な有効期間は、CloudFrontのTTL秒の設定、```Cache-Control```ヘッダー、```Expires```ヘッダーの値の組み合わせによって決まる。 |
| Whitelist Header               | Headers を参考にせよ。                                       | 参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/Expiration.html#ExpirationDownloadDist・```Accept-*****```：アプリケーションにレスポンスして欲しいデータの種類（データ型など）を指定。<br>・ ```CloudFront-Is-*****-Viewer```：デバイスタイプのBool値が格納されている。 |
| Restrict Viewer Access         | リクエストの送信元を制限するかどうかを設定できる。           | セキュリティグループで制御できるため、ここでは設定しなくてよい。 |
| Compress Objects Automatically | レスポンス時にgzipを圧縮するかどうかを設定                   | ・クライアントからのリクエストヘッダーのAccept-Encodingにgzipが設定されている場合、レスポンス時に、gzip形式で圧縮して送信するかどうかを設定する。設定しない場合、圧縮せずにレスポンスを送信する。<br>・クライアント側のダウンロード速度向上のため、基本的には有効化する。 |


#### ・オリジンに対するリクエストメッセージの構造

CloudFrontからオリジンに送信されるリクエストメッセージの構造例を以下に示す。

```http
GET /foo/
# リクエストされたドメイン名
Host: foo.com
User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1
Authorization: Bearer <Bearerトークン>
X-Amz-Cf-Id: *****
Via: 2.0 77c20654dd474081d033f27ad1b56e1e.cloudfront.net (CloudFront)
# 各Cookieの値（二回目のリクエスト時に設定される）
Cookie: sessionid=<セッションID>; __ulfpc=<GoogleAnalytics値>; _ga=<GoogleAnalytics値>; _gid=<GoogleAnalytics値>
# 送信元IPアドレス
# ※プロキシサーバー（ALBやCloudFrontなども含む）を経由している場合、それら全てのIPアドレスも順に設定される
X-Forwarded-For: <client>, <proxy1>, <proxy2>
Accept-Language: ja,en;q=0.9
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Accept-Encoding: gzip, deflate, br
pragma: no-cache
cache-control: no-cache
upgrade-insecure-requests: 1
sec-fetch-site: none
sec-fetch-mode: navigate
sec-fetch-user: ?1
sec-fetch-dest: document
# デバイスタイプ
CloudFront-Is-Mobile-Viewer: true
CloudFront-Is-Tablet-Viewer: false
CloudFront-Is-SmartTV-Viewer: false
CloudFront-Is-Desktop-Viewer: false
# リクエストの送信元の国名
CloudFront-Viewer-Country: JP
# リクエストのプロトコル
CloudFront-Forwarded-Proto: https
```

#### ・CloudFrontとオリジン間のHTTPS通信

CloudFrontとオリジン間でHTTPS通信を行う場合、両方にドメイン証明書を割り当てる必要がある。割り当てたとしても、以下の条件を満たさないとHTTPS通信を行うことはできない。CLoudFrontからオリジンにHostヘッダーを転送しない設定の場合、オリジンが返却する証明書に『Origin Domain Name』と一致するドメイン名が含まれている必要がある。一方で、Hostヘッダーを転送しない場合、オリジンが返却する証明書に『Origin Domain Name』と一致するドメイン名が含まれているか、またはオリジンが返却する証明書に、Hostヘッダーの値と一致するドメイン名が含まれている必要がある。

<br>

### Reports & analytics

#### ・Cache statistics

リクエストに関連する様々なデータを、日付別に集計したものを確認できる。

#### ・Popular objects

リクエストに関連する様々なデータを、オブジェクト別に集計したものを確認できる。

<br>

### オリジンリクエストの可否、キャッシュ生成の有無

#### ・オリジンリクエストの可否、キャッシュ生成の有無、の決まり方

オリジンに転送するべきリクエストを、各種パラメータのAll（全許可）/一部許可/None（全拒否）で設定できる。また、キャッシュ生成の有無にも関係している。CloudFrontではリクエストがJSONとして扱われており、JSONの値が過去のリクエストに合致した時のみ、そのリクエストと過去のものが同一であると見なす仕組みになっている。キャッシュ判定時のパターンを減らし、ヒット率を向上させるために、全ての項目で『None（全拒否）』を選択した方が良い。最終的に、対象のファイルがCloudFrontのキャッシュ生成の対象となっているかは、レスポンスのヘッダーに含まれる『```X-Cache:```』が『```Hit from cloudfront```』または『```Miss from cloudfront```』のどちらで判断できる。

参考：

- https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/controlling-origin-requests.html
- https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/controlling-the-cache-key.html

#### ・ヘッダー値に基づくキャッシュ生成

リクエストヘッダーのうち、オリジンへの転送を許可し、またキャッシュキーと見なすパラメータを設定する。Cookieとクエリストリングと比べて、同じ設定でもキャッシュ生成の有無が異なることに注意する。

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/header-caching.html#header-caching-web

| 機能名     | オリジンリクエストの可否               | キャッシュ生成の有無                                           |
| -------- | ---------------------------------------- | ------------------------------------------------------------ |
| 全許可   | 全てのヘッダーの転送を許可する。 | キャッシュを生成しない。 |
| 一部転送 | 一部のヘッダーの転送を拒否し、ヘッダーの無いリクエストを転送する。 | 指定したヘッダーのみをキャッシュキーとみなす。日付に関するヘッダー（Accept-Datetime）などの動的な値をキャッシュキーとしてしまうと。同一と見なすリクエストがほとんどなくなり、ヒットしなくなる。そのため、ヘッダーをオリジンに転送しつつ、動的になりやすい値を持つヘッダーをキャッシュキーにしないようにする必要がある。ヒット率の向上のため、クエリストリングやCookieの静的な値をキャッシュキーに設定するとよい。 |
| 全拒否   | 全てのヘッダーの転送を拒否し、ヘッダーの無いリクエストを転送する。 | キャッシュを生成しない。 |

#### ・Cookieに基づくキャッシュ生成

Cookie情報のキー名のうち、オリジンへの転送を許可し、またキャッシュキーと見なすパラメータを設定する。リクエストのヘッダーに含まれるCookie情報（キー名/値）が変動していると、CloudFrontに保存されたキャッシュがヒットしない。CloudFrontはキー名/値を保持するため、変化しやすいキー名/値は、オリジンに転送しないように設定する。例えば、GoogleAnalyticsのキー名（```_ga```）の値は、ブラウザによって異なるため、１ユーザーがブラウザを変えるたびに、異なるキャッシュが生成されることになる。そのため、ユーザーを一意に判定することが難しくなってしまう。GoogleAnalyticsのキーはブラウザからAjaxでGoogleに送信されるもので、オリジンにとっても基本的に不要である。セッションIDはCookieヘッダーに設定されているため、フォーム送信に関わるパスパターンでは、セッションIDのキー名を許可する必要がある。

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/Cookies.html

| 機能名     | オリジンリクエストの可否               | キャッシュ生成の有無                                           |
| -------- | ---------------------------------------- | ------------------------------------------------------------ |
| 全許可   | 全てのCookieの転送を許可する。 | 全てのCookieをキャッシュキーとみなす。 |
| 一部転送 | 一部のCookieの転送を拒否し、Cookieの無いリクエストを転送する。 | 指定したCookieのみキャッシュキーとみなす。Cookieはユーザーごとに一意になることが多く、動的であるが、それ以外のヘッダーやクエリ文字でキャッシュを判定するようになるため、同一と見なすリクエストが増え、ヒット率の向上につながる。 |
| 全拒否   | 全てのCookieの転送を拒否し、Cookieの無いリクエストを転送する。 | キャッシュを生成しない。 |

#### ・クエリストリングに基づくキャッシュ生成

クエリストリングのうち、オリジンへの転送を許可し、またキャッシュキーと見なすパラメータを設定する。異なるクエリパラメータのキャッシュを別々に作成するかどうかを設定できる。

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/QueryStringParameters.html

| 機能名     | オリジンリクエストの可否               | キャッシュ生成の有無                                           |
| -------- | ---------------------------------------- | ------------------------------------------------------------ |
| 全許可   | 全てのクエリストリングの転送を許可する。 | 全てのクエリストリングをキャッシュキーとみなす。 |
| 一部拒否 | 一部のクエリストリングの転送を拒否し、クエリストリングの無いリクエストをオリジンに転送する。 | 指定したクエリストリングのみをキャッシュキーとみなす。 |
| 全拒否   | 全てのクエリストリングの転送を拒否し、クエリストリングの無いリクエストを転送する。 | キャッシュを生成しない。 |

#### ・Cookieやクエリストリングをオリジンに転送しつつ、キャッシュを生成しない場合

上記の設定では、Cookieやクエリストリングをオリジンに転送しつつ、キャッシュを生成しないようにできない。そこで、キャッシュの最大最小デフォルトの有効期間を```0```秒とすることで、結果的にキャッシュを機能しないようにさせ、キャッシュが生成されていないかのように見せかけることができる。

<br>

### ヘッダーキャッシュのヒット率向上

#### ・ヒット率の向上について

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/header-caching.html

<br>

### Cookieキャッシュのヒット率向上

#### ・ヒット率の向上について

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/Cookies.html

<br>

### クエリストリングキャッシュのヒット率向上

#### ・ヒット率の向上について

CloudFrontは、クエリストリングによってオリジンからレスポンスされるファイルのキャッシュを作成し、次回、同じクエリストリングであった場合、キャッシュをレスポンスとして返信する。キャッシュ作成のルールを理解すれば、キャッシュのヒット率を向上させられる。

参考：

- https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/cache-hit-ratio.html#cache-hit-ratio-query-string-parameters
- https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/QueryStringParameters.html#query-string-parameters-optimizing-caching

#### ・クエリストリングの順番を固定する

リクエスト時のクエリストリングの順番が異なる場合、CloudFrontはそれぞれを異なるURLに対するリクエストと見なし、別々にキャッシュを作成する。そのため、クエリストリングの順番を固定するようにURLを設計すれば、キャッシュのヒット率を向上させられる。

```http
GET https://example.com?fooId=1&barId=2
```

```http
GET https://example.com?barId=2&fooId=1
```

#### ・クエリストリングの大文字小文字表記を固定する

リクエスト時のクエリストリングの大文字小文字表記が異なる場合、CloudFrontはそれぞれを異なるURLに対するリクエストと見なし、別々にキャッシュを作成する。そのため、クエリストリングの大文字小文字表記を固定するようにURLを設計すれば、キャッシュのヒット率を向上させられる。

```http
GET https://example.com?fooId=1&barId=2
```

```http
GET https://example.com?FooId=1&BarId=2
```

#### ・署名付きURLと同じクエリストリングを用いない

S3には、署名付きURLを発行する機能がある。CloudFrontの仕様では、署名付きURLに含まれる```Expires```、```Key-Pair-Id```、```Policy```、```Signature```といったクエリストリングを削除したうえで、オリジンにリクエストを転送する。これらのパラメータは、キャッシュヒットの判定要素として使えない。そのため、URLの設計時にこれらを用いないようにする。

<br>

### Invalidation（キャッシュの削除）

TTL秒によるキャッシュの自動削除を待たずに、手動でキャッシュを削除できる。全てのファイルのキャッシュを削除したい場合は『```/*```』、特定のファイルのキャッシュを削除したい場合は『```/<ファイルへのパス>```』、を設定する。CloudFrontに関するエラーページが表示された場合、不具合を修正した後でもキャッシュが残っていると、エラーページが表示されてしまうため、作業後には必ずキャッシュを削除する。

<br>

### エッジロケーションとエッジサーバー

#### ・Point Of Presence

CloudFrontは世界中に設置される『Point Of Presence（エッジロケーション＋中間層キャッシュ）』にデプロイされる。

参考：https://aws.amazon.com/jp/cloudfront/features/?whats-new-cloudfront.sort-by=item.additionalFields.postDateTime&whats-new-cloudfront.sort-order=desc

#### ・エッジロケーションにおける全エッジサーバーのIPアドレス

CloudFrontには、エッジロケーションの数だけエッジサーバーがあり、各サーバーにIPアドレスが割り当てられている。以下のコマンドで、全てのエッジサーバーのIPアドレスを確認できる。

```bash
$ curl https://ip-ranges.amazonaws.com/ip-ranges.json \
  | jq  ".prefixes[]| select(.service=="CLOUDFRONT") | .ip_prefix"
```

もしくは、以下のリンクを直接参考し、『```"service": "CLOUDFRONT"```』となっている部分を探す。

参考：https://ip-ranges.amazonaws.com/ip-ranges.json

#### ・エッジロケーションの使用中サーバーのIPアドレス

CloudFrontには、エッジロケーションがあり、各ロケーションにサーバーがある。以下のコマンドで、エッジロケーションにある使用中サーバーのIPアドレスを確認できる。

```bash
$ nslookup <割り当てられた文字列>.cloudfront.net
```

<br>

### カスタムエラーページ

#### ・カスタムエラーページとは

オリジンに該当のファイルが存在しない場合、オリジンはCloudFrontに以下の403ステータスのレスポンスを返信する。カスタムエラーページを設定しない場合、CloudFrontはこの403ステータスをそのままレスポンスしてしまうため、オリジンに配置したカスタムエラーページを404ステータスでレスポンスするように設定する。

```
This XML file does not appear to have any style information associated with it. The document tree is shown below.
<Error>
<Code>AccessDenied</Code>
<Message>Access Denied</Message>
<RequestId>*****</RequestId>
<HostId>*****</HostId>
</Error>
```

#### ・設定方法

オリジンからカスタムエラーページをレスポンスするパスパターンを定義する。Lamnda@Edgeを用いたCloudFrontの場合は、Lambda@Edgeを経由して、カスタムエラーページをレスポンスする必要がある。

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/HTTPStatusCodes.html

<br>

## 08. CloudTrail

### CloudTrailとは

IAMユーザーによる操作や、ロールのアタッチの履歴を記録し、ログファイルとしてS3に転送する。CloudWatchと連携することもできる。

![CloudTrailとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/CloudTrailとは.jpeg)

<br>

## 09. CloudWatch

### CloudWatchエージェント

#### ・CloudWatchエージェントとは

インスタンス内で稼働する常駐システムのこと。インスタンス内のデータを収集し、CloudWatchに対して送信する。

#### ・CloudWatchエージェントの設定

| セクションの種類        | 説明                                   | 補足                                                         |
| ----------------------- | -------------------------------------- | ------------------------------------------------------------ |
| ```agent```セクション   | CloudWatchエージェント全体を設定する。 | ・ウィザードを用いた場合、このセクションの設定はスキップされる。<br>・実装しなかった場合、デフォルト値が適用される。 |
| ```metrics```セクション |                                        | ・ウィザードを用いた場合、このセクションの設定はスキップされる。<br>・実装しなかった場合、何も設定されない。 |
| ```logs```セクション    |                                        |                                                              |

CloudWatchエージェントは、```/opt/aws/amazon-cloudwatch-agent/bin/config.json```ファイルの定義を元に、実行される。設定ファイルは分割できる。設定後、```amazon-cloudwatch-agent-ctl```コマンドで設定ファイルを読み込ませる。CloudWatchエージェントを用いて、CloudWatchにログファイルを送信するだけであれば、設定ファイル（```/opt/aws/amazon-cloudwatch-agent/bin/config.json```）には```log```セッションのみの実装で良い。```run_as_user```には、プロセスのユーザー名（例：```cwagent```）を設定する。

**＊実装例＊**

```bash
{
  "agent": {
    "run_as_user": "cwagent"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/nginx/error.log",
            "log_group_name": "/foo-www/var/log/nginx/error_log",
            "log_stream_name": "{instance_id}"
          },
          {
            "file_path": "/var/log/php-fpm/error.log",
            "log_group_name": "/foo-www/var/log/php-fpm/error_log",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
```

#### ・ログ送信権限

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/logs/AWS-logs-and-resource-policy.html

#### ・操作コマンド

**＊例＊**

```bash
# EC2内にある設定ファイルを、CloudWatchエージェントに読み込ませる（再起動を含む）
$ /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json

# プロセスのステータスを確認
$ /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -m ec2 \
  -a status
```

```bash
# 設定ファイルが読み込まれたかを確認

### CloudWatchエージェントのプロセスのログファイル
$ tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log

### 設定ファイルの構文チェックのログファイル
$ tail -f /opt/aws/amazon-cloudwatch-agent/logs/configuration-validation.log

### OS起動時にデーモンが稼働するように設定されているかを確認
$ systemctl list-unit-files --type=service
```

<br>

## 09-02. CloudWatchメトリクス

### CloudWatchメトリクスとは

AWSリソースで発生したデータポイントのメトリクスを収集する。

<br>

### ディメンション、名前空間、メトリクス名

#### ・分類

| 分類群         | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| ディメンション | インスタンスの設定値を単位とした収集グループのこと。設定値によるグループには、例えばインスタンス別、スペック別、AZ別、などがある。 |
| 名前空間       | AWSリソースを単位とした収集グループのこと。AWSリソース名で表現される。 |
| メトリクス名   | 集計対象のデータポイントの発生領域を単位とした収集グループのこと。データポイントの発生領域名で表現される。 |

#### ・概念図

参考：

- https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html
- https://www.slideshare.net/AmazonWebServicesJapan/20190326-aws-black-belt-online-seminar-amazon-cloudwatch

![metrics_namespace_dimension](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/metrics_namespace_dimension.png)

CloudWatchメトリクス上では、以下のように確認できる。

![cloudwatch_namespace_metric_dimension](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/cloudwatch_namespace_metric_dimension.png)

<br>

### 注視するべきメトリクス一覧

#### ・ALB

ALBで注視するべきメトリクスを示す。

参考：https://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/application/load-balancer-cloudwatch-metrics.html

| メトリクス名                   | 単位     | 説明 |
| ------------------------------ | -------- | ---- |
| HealthyHostCount               | カウント |      |
| HTTPCode_ELB_4XX_Count         | カウント |      |
| HTTPCode_ELB_5XX_Count         | カウント |      |
| HTTPCode_TARGET_4XX_Count      | カウント |      |
| HTTPCode_TARGET_5XX_Count      | カウント |      |
| RejectedConnectionCount        | カウント |      |
| TargetConnectionErrorCount     | カウント |      |
| TargetTLSNegotiationErrorCount | カウント |      |

#### ・API Gateway

API Gatewayで注視するべきメトリクスを示す。

参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html#api-gateway-metrics

| メトリクス名       | 単位       | 説明                                                         |
| ------------------ | ---------- | ------------------------------------------------------------ |
| IntegrationLatency | マイクロ秒 | API Gatewayがリクエストをバックエンドに転送してから、バックエンドからレスポンスを受信するまでを表す。 |
| Latency            | マイクロ秒 | API Gatewayがクライアントからリクエストを受信してから、クライアントにこれを返信するまでを表す。 |
| 4XXError           | カウント   |                                                              |
| 5XXError           | カウント   | サーバー/コンテナが停止してしまうようなインシデントを検出することに適する。 |

#### ・EC2

EC2で注視するべきメトリクスを示す。

参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/viewing_metrics_with_cloudwatch.html#ec2-cloudwatch-metrics

| メトリクス名               | 単位     | 説明                                                         |
| -------------------------- | -------- | ------------------------------------------------------------ |
| StatusCheckFailed_Instance | カウント | インスタンスのインスタンスステータスの失敗数を表す。インスタンスが停止してしまうようなインシデントに適する。反対に、インスタンスが正常に稼働していて、プロセスが停止しているようなインシデントを検出することには不適である。<br>参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/monitoring-system-instance-status-check.html#types-of-instance-status-checks |
| StatusCheckFailed_System   | カウント | インスタンスのシステムステータスの失敗数を表す。AWSの障害によるインシデントの検出に適する。<br>参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/monitoring-system-instance-status-check.html#types-of-instance-status-checks |

#### ・ECS

ECSクラスターまたはサービスで注視するべきメトリクスを示す。ClusterNameディメンションとServiceNameディメンションを用いて、ECSクラスターとECSサービスのメトリクスを区別できる。

参考：https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/cloudwatch-metrics.html#available_cloudwatch_metrics

| メトリクス名      | 単位     | 説明                                                         | 補足                                                         |
| ----------------- | -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| CPUUtilization    | %        | ECSクラスターまたはサービスで使用されているCPU使用率を表す。 |                                                              |
| MemoryUtilization | %        | ECSクラスターまたはサービスで使用されているメモリ使用率を表す。 |                                                              |
| RunningTaskCount  | カウント | 稼働中のECSタスク数を表す。                                  | ECSタスク数の増減の遷移から、デプロイのおおよその時間がわかる。 |

#### ・RDS（Aurora）

RDS（Aurora）で注視するべきメトリクスを示す。

参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/AuroraUserGuide/Aurora.AuroraMySQL.Monitoring.Metrics.html

| メトリクス名        | 単位     | 説明                                                         | 補足                                                         |
| ------------------- | -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| CPUUtilization      | %        | Aurora DBインスタンスのCPU使用率を表す。                     |                                                              |
| DatabaseConnections | カウント | Aurora DBインスタンスへの接続数を表す。失敗した接続も含まれている可能性があり、実際よりはやや多めに計測される。 | クライアントがDBにアクセスしている時間帯がわかるため、メンテナンスウィンドウを実施時間の参考になる。 |
| FreeableMemory      | Bytes    | Aurora DBインスタンスの使用可能なメモリ容量を表す。          |                                                              |
| EngineUptime        | 秒       | インスタンスの起動時間を表す。                               | ダウンタイムの最低発生時間の参考になる。                     |

#### ・RDS（非Aurora）

RDS（非Aurora）で注視するべきメトリクスを示す。RDSのコンソール画面にも同じメトリクスが表示されるが、単位がMByteであり、CloudWatchメトリクスと異なることに注意する。

参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/monitoring-cloudwatch.html#rds-metrics

| メトリクス名        | 単位     | 説明                                                         | 補足                                                         |
| ------------------- | -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| CPUUtilization      | %        | DBインスタンスのCPU使用率を表す。                            |                                                              |
| DatabaseConnections | カウント | DBインスタンスへの接続数を表す。失敗した接続も含まれている可能性があり、実際よりはやや多めに計測される。 | クライアントがDBにアクセスしている時間帯がわかるため、メンテナンスウィンドウを実施時間の参考になる。 |
| FreeableMemory      | Bytes    | DBインスタンスの使用可能なメモリ容量を表す。                 |                                                              |

<br>

### インサイトメトリクス

#### ・インサイトメトリクスは

複数のCloudWatchメトリクスの結果を集計し、パフォーマンスに関するデータを収集する。

#### ・パフォーマンスインサイト

RDS（Aurora、非Aurora）のパフォーマンスに関するメトリクスを収集する。SQLレベルで監視できるようになる。パラメータグループの```performance_schema```を有効化する必要がある。対応するエンジンバージョンとインスタンスタイプについては、以下のリンク先を参考にせよ。

参考：

- https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/AuroraUserGuide/USER_PerfInsights.Enabling.html
- https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/USER_PerfInsights.Overview.Engines.html

#### ・Containerインサイト

ECS/EKSのパフォーマンスに関するメトリクスを収集する。ECSクラスター/EKSクラスター、ECSサービス、ECSタスク、ECSコンテナ、単位で監視できるようになる。また、コンテナ間の繋がりをコンテナマップで視覚化できるようになる。ECS/EKSのアカウント設定でContainerインサイトを有効化する必要がある。

#### ・Lambdaインサイト

Lambdaのパフォーマンスに関するメトリクスを収集する。

<br>

## 09-03. CloudWatchログ

### CloudWatchログ

クラウドログサーバーとして働く。AWSリソースで生成されたログを収集できる。ログについては、以下のリンク先を参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/observability_monitering/observability.html

<br>

### 設定項目

#### ・概要

| 設定項目                     | 説明                                                         | 補足                                                         |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ロググループ                 | ログストリームをグループ化して収集するかどうかを設定する。   | 基本的に、ログファイルはグループ化せずに、1つのロググループには1つのログストリームしか含まれないようにする。 |
| メトリクスフィルター         | フィルターパターンに合致した文字列を持つログをトリガーとして、データポイントを発生させる。これを収集するメトリクスを設定する。 |                                                              |
| サブスクリプションフィルター |                                                              |                                                              |

<br>

### フィルターパターン

#### ・フィルターパターンとは

ログ内で検知する文字列を設定する。大文字と小文字を区別するため、網羅的に設定する必要がある。

参考：

- https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/logs/FilterAndPatternSyntax.html
- https://qiita.com/shimajiri/items/81a4ed0fe39fe337fedb

#### ・OR条件

**＊例＊**

OR条件で大文字小文字を考慮し、『```<ログレベル>:```』が含まれるログを検出する。ここでコロンを含まているのは、ログに含まれるファイル名やメソッド名が誤って検知されないようするためである。

```bash
?"WARNING:" ?"Warning:" ?"ERROR:" ?"Error:" ?"CRITICAL:" ?"Critical:" ?"EMERGENCY:" ?"Emergency:" ?"ALERT:" ?"Alert:"
```

**＊例＊**

OR条件で大文字小文字を考慮し、『```<ログレベル> message```』が含まれるログを検出する。

```bash
?"WARNING message" ?"Warning message" ?"ERROR message" ?"Error message" ?"CRITICAL message" ?"Critical message" ?"EMERGENCY message" ?"Emergency message" ?"ALERT message" ?"Alert message"
```

#### ・除外条件

**＊例＊**

『```ERROR:```』が含まれ、かつ『```MethodNotAllowedHttpException```』が含まれないログを検知する。OR条件と除外条件を組み合わせようとすると、OR条件が認識されずに除外条件だけが適用されてしまう。そのため、ここではOR条件を用いていない。

参考：https://dev.classmethod.jp/articles/cloudwatch-metricsfilter-filterpattern/

```bash
"ERROR:" -MethodNotAllowedHttpException
```

<br>

### CloudWatchログエージェント（非推奨）

#### ・CloudWatchログエージェントとは

インスタンス内で稼働する常駐システムのこと。インスタンス内のデータを収集し、CloudWatchログに対して送信する。2020/10/05現在は非推奨で、CloudWatchエージェントへの設定の移行が推奨されている。

#### ・```awslogs.conf```ファイル

インスタンス内の```etc```ディレクトリ下に```awslogs.conf```ファイルを、設置する。OS、ミドルウェア、アプリケーション、の各層でログを収集するのがよい。

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/logs/AgentReference.html#agent-configuration-file

**＊実装例＊**

```bash
#############################
# /var/awslogs/awslogs.conf
#############################

# ------------------------------------------
# CentOS CloudWatch Logs
# ------------------------------------------
[/var/log/messages]

# タイムスタンプ
#（例）Jan 1 00:00:00
datetime_format = %b %d %H:%M:%S
#（例）2020-01-01 00:00:00
# datetime_format = %Y-%m-%d %H:%M:%S

# 収集したいログファイル。ここでは、CentOSのログを設定する。
file = /var/log/messages

# 文字コードutf_8として送信する。文字コードが合わないと、CloudWatchログの画面上で文字化けする。
encoding = utf_8

# 要勉強
buffer_duration = 5000
initial_position = start_of_file

# インスタンスID
log_stream_name = {instance_id}

# AWS上で管理するロググループ名
log_group_name = /var/log/messages

# ------------------------------------------
# Nginx CloudWatch Logs
# ------------------------------------------
[/var/log/nginx/error.log]
file             = /var/log/nginx/error.log
buffer_duration  = 5000
log_stream_name  = {instance_id}
initial_position = start_of_file
log_group_name   = /var/log/nginx/error_log.production

# ------------------------------------------
# Application CloudWatch Logs
# ------------------------------------------
[/var/www/project/app/storage/logs/laravel.log]
file             = /var/www/project/app/storage/logs/laravel.log
buffer_duration  = 5000
log_stream_name  = {instance_id}
initial_position = start_of_file
log_group_name   = /var/www/project/app/storage/logs/laravel_log.production
```

```bash
#############################
# /var/awslogs/awscli.conf
#############################

[plugins]
cwlogs = cwlogs
[default]
region = ap-northeast-1
```

#### ・コマンド

設定後、```awslogs```コマンドでプロセスを起動する。

**＊例＊**

```bash
# CloudWatchエージェントの再起動
# 注意: restartだとCloudWatchに反映されない時がある。
$ service awslogs restart

# もしくは
$ service awslogs stop
$ service awslogs start

# ログが新しく生成されないと変更が適用されないことがあるため、ログファイルに適当な文字列行を増やしてみる。
```

<br>

### Logインサイト

#### ・Logインサイトとは

クエリを用いてログを抽出する。

#### ・クエリ例

汎用的なクエリを示す。

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html

**＊例＊**

小文字と大文字を区別せずに、WarningまたはErrorを含むログを検索する。

```bash
fields @timestamp, @message, @logStream
| filter @message like /(?i)(Warning|Error)/
| sort @timestamp desc
| limit 100
```

<br>

### CLI

#### ・ログ収集量を確認

**＊例＊**

全てのロググループに対して、一日当たりの収集量を```start-time```から```end-time```の間で取得する。```--dimensions ```オプションを用いて、特定のディメンション（ロググループ）に対して集計を実行することもできる。（ただ、やってみたけどうまくいかず）

参考：https://docs.aws.amazon.com/cli/latest/reference/cloudwatch/get-metric-statistics.html

 ```bash
 $ aws cloudwatch get-metric-statistics \
   --namespace AWS/Logs \
   --metric-name IncomingBytes \
   --start-time "2021-08-01T00:00:00" \
   --end-time "2021-08-31T23:59:59" \
   --period 86400 
   --statistics Sum | jq -r ".Datapoints[] | [.Timestamp, .Sum] | @csv" | sort
 ```

<br>

## 09-04. CloudWatchアラーム

### 設定項目

#### ・ログが対象の場合

| 設定項目     | 説明                                                         | 補足                                                 |
| ------------ | ------------------------------------------------------------ | ---------------------------------------------------- |
| 名前空間     | 紐付くロググループが属する名前空間を設定する。CloudWatchログが、設定した名前空間に対して、値を発行する。 |                                                      |
| メトリクス   | 紐付くロググループが属する名前空間内のメトリクスを設定する。CloudWatchログが、設定したメトリクスに対して、値を発行する。 |                                                      |
| メトリクス値 | フィルターパターンでログが検知された時に、データポイントとして発生させる値のこと。 | 例えば『検出数』を発行する場合は、『１』を設定する。 |

#### ・メトリクスが対象の場合



#### ・条件

| 設定項目                         | 説明                                                       | 補足                                                         |
| -------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ |
| 閾値の種類                       |                                                            |                                                              |
| アラームを実行するデータポイント | アラートを発生させるデータポイント数を設定する。           |                                                              |
| 欠落データの処理                 | データポイントが発生しないことをどう判定するかを設定する。 | データポイントが発生しないことを正常と見なす場合は『```notBreaching```』とし、発生しないことを異常とする場合は、『```breaching```』とする。<br>参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html#alarms-and-missing-data |

<br>

### CLI

#### ・CloudWatchアラームの状態変更

**＊例＊**

CloudWatchアラームの状態を変更する。

```bash
$ aws cloudwatch set-alarm-state \
  --alarm-name "prd-foo-alarm" \
  --state-value ALARM \
  --state-reason "アラーム!!"
```

<br>

## 09-05. CloudWatch Synthetics

### CloudWatch Syntheticsとは

合成監視を行えるようになる。

<br>

## 10. Code系サービス

### Code系サービス

#### ・CodePipeline

CodeCommit、CodeBuild、CodeDeployを連携させて、AWSに対するCI/CD環境を構築する。CodeCommitは、他のソースコード管理サービスで代用できる。

![code-pipeline](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/code-pipeline.png)

#### ・CodeCommit

ソースコードをバージョン管理する。

#### ・CodeBuild

ビルドフェーズとテストフェーズを実行する。

#### ・CodeDeploy

デプロイフェーズを実行する。

<br>

## 10-02. Code系サービス：CodeBuild

### 設定ファイル

#### ・```buildspec.yml```ファイル

CodeBuildの設定を行う。ルートディレクトリの直下に配置しておく。

参考：https://docs.aws.amazon.com/ja_jp/codebuild/latest/userguide/build-spec-ref.html

**＊実装例＊**

コンテナをビルドする場合を示す。

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      docker: 18
  preBuild:
    commands:
      # ECRにログイン
      - $(aws ecr get-login --no-include-email --region ${AWS_DEFAULT_REGION})
      # イメージタグはGitHubコミットのハッシュ値を使用
      - IMAGE_TAG=$CODEBUILD_RESOLVED_SOURCE_VERSION
      # ECRのURLをCodeBuildの環境変数から作成
      - REPOSITORY_URI=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${IMAGE_REPO_NAME}
  build:
    commands:
      # タグ付けしてイメージをビルド
      - docker build -t REPOSITORY_URI:$IMAGE_TAG -f Dockerfile .
  postBuild:
    commands:
      # ECRにイメージをプッシュ
      - docker push $REPOSITORY_URI:$IMAGE_TAG
      # ECRにあるデプロイ対象のイメージの情報（imageDetail.json）
      - printf "{"Version":"1.0","ImageURI":"%s"}" $REPOSITORY_URI:$IMAGE_TAG > imageDetail.json
    
# デプロイ対象とするビルドのアーティファクト    
artifacts:
  files: imageDetail.json
```

<br>

## 10-03. Code系サービス：CodeDeploy

### 利用可能なデプロイメント手法

#### ・ECSの場合

ローリングアップデート、ブルー/グリーンデプロイメント、を利用できる。

参考：https://docs.aws.amazon.com/ja_jp/codedeploy/latest/userguide/deployments.html

#### ・EC2の場合

インプレースデプロイ、ブルー/グリーンデプロイメント、を利用できる。

参考：https://docs.aws.amazon.com/ja_jp/codedeploy/latest/userguide/deployments.html

#### ・Lambdaの場合

ブルー/グリーンデプロイメント、を利用できる。

参考：https://docs.aws.amazon.com/ja_jp/codedeploy/latest/userguide/deployments.html

<br>

### ECSタスクのローリングアップデート

#### ・```imagedefinitions.json```ファイル

新しいリビジョン番号のタスク定義を作成するために、新しいコンテナ名とリポジトリURLを定義する。リポジトリに事前に配置するのではなく、CI/CDの中で動的に作成するようにした方がよい。

参考：

- https://docs.aws.amazon.com/ja_jp/codepipeline/latest/userguide/file-reference.html#pipelines-create-image-definitions
- https://ngyuki.hatenablog.com/entry/2021/04/07/043415

```bash
[
  {
    "imageUri": "<リポジトリURL>",
    "name": "<コンテナ名>"
  }
]
```

<br>

### ECSタスクのブルー/グリーンデプロイメント

#### ・仕組み

![blue-green-deployment](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/blue-green-deployment.jpeg)

以下の手順でデプロイを行う。

1. ECRのイメージを更新
2. タスク定義の新しいリビジョンを構築。
3. サービスを更新。
4. CodeDeployによって、タスク定義を基に、現行の本番環境（Prodブルー）のタスクとは別に、テスト環境（Testグリーン）が構築される。ロードバランサーの接続先を、本番環境（Prodブルー）のターゲットグループ（Primaryターゲットグループ）に加えて、テスト環境（Testグリーン）にも向ける。
5. 社内からテスト環境（Testグリーン）のALBに、特定のポート番号でアクセスし、動作を確認する。
6. 動作確認で問題なければ、Console画面からの入力で、ロードバランサーの接続先をテスト環境（Testグリーン）のみに設定する。
7. テスト環境（Testグリーン）が新しい本番環境としてユーザーに公開される。
8. 元の本番環境（Prodブルー）は削除される。

#### ・```appspec.yml```ファイル

ルートディレクトリの直下に配置しておく。仕様として、複数のコンテナをデプロイできない。タスク定義名を```<TASK_DEFINITION>```とすると、```taskdef.json```ファイルの値を元にして、新しいタスク定義が自動的に代入される。

参考：https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-resources.html

```yaml
version: 0.0

Resources:
  - TargetService:
      # 用いるAWSリソース
      Type: AWS::ECS::Service
      Properties:
        # 用いるタスク定義
        TaskDefinition: "<TASK_DEFINITION>"
        # 用いるロードバランサー
        LoadBalancerInfo:
          ContainerName: "<コンテナ名>"
          ContainerPort: "80"
        PlatformVersion: "1.4.0"
```

#### ・```imageDetail.json```ファイル

新しいイメージタグを含むリポジトリURLを、```taskdef.json```ファイルの ```<IMAGE1_NAME>```に代入するために必要である。これはリポジトリに事前に配置するのではなく、CI/CDの中で動的に作成するようにした方がよい。

参考：

- https://docs.aws.amazon.com/ja_jp/codepipeline/latest/userguide/file-reference.html#file-reference-ecs-bluegreen
- https://ngyuki.hatenablog.com/entry/2021/04/07/043415

#### ・```taskdef.json```ファイル

デプロイされるタスク定義を実装し、ルートディレクトリの直下に配置する。CodeDeployは、CodeBuildから渡された```imageDetail.json```ファイルを検知し、ECRからイメージを取得する。この時、```taskdef.json```ファイルのイメージ名を```<IMAGE1_NAME>```としておくと、```imageDetail.json```ファイルの値を元にして、新しいイメージタグを含むリポジトリURLが自動的に代入される。

参考：

- https://ngyuki.hatenablog.com/entry/2021/04/07/043415
- https://docs.aws.amazon.com/ja_jp/codepipeline/latest/userguide/tutorials-ecs-ecr-codedeploy.html#tutorials-ecs-ecr-codedeploy-taskdefinition

```bash
{
  "family": "<タスク定義名>",
  "requiresCompatibilities": [
    "FARGATE"
  ],
  "networkMode": "awsvpc",
  "taskRoleArn": "<タスクロールのARN>",
  "executionRoleArn": "<タスク実行ロールのARN>",
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "<コンテナ名>",
      "image": "<IMAGE1_NAME>",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 80,
          "hostPort": 80,
          "protocol": "tcp"
        }
      ],
      "secrets": [
        {
          "name": "DB_HOST",
          "valueFrom": "/ecs/DB_HOST"
        },
        {
          "name": "DB_DATABASE",
          "valueFrom": "/ecs/DB_DATABASE"
        },
        {
          "name": "DB_PASSWORD",
          "valueFrom": "/ecs/DB_PASSWORD"
        },
        {
          "name": "DB_USERNAME",
          "valueFrom": "/ecs/DB_USERNAME"
        },
        {
          "name": "REDIS_HOST",
          "valueFrom": "/ecs/REDIS_HOST"
        },
        {
          "name": "REDIS_PASSWORD",
          "valueFrom": "/ecs/REDIS_PASSWORD"
        },
        {
          "name": "REDIS_PORT",
          "valueFrom": "/ecs/REDIS_PORT"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "<ロググループ名>",
          # スタックトレースのログを紐付けられるように、日付で区切るようにする。
          "awslogs-datetime-format": "\\[%Y-%m-%d %H:%M:%S\\]",
          "awslogs-region": "<リージョン>",
          "awslogs-stream-prefix": "<ログストリーム名のプレフィクス>"
        }
      }
    }
  ]
}
```

<br>

### EC2のインプレースデプロイメント

参考：https://docs.aws.amazon.com/ja_jp/codedeploy/latest/userguide/welcome.html#welcome-deployment-overview-in-place

<br>

### EC2のブルー/グリーンデプロイメント

参考：https://docs.aws.amazon.com/ja_jp/codedeploy/latest/userguide/deployment-groups-create-blue-green.html

<br>

## 11. EC2：Elastic Computer Cloud

### EC2とは

クラウドサーバーとして働く。注意点があるものだけまとめる。ベストプラクティスについては、以下のリンク先を参考にせよ。

参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ec2-best-practices.html

<br>

### 設定項目

#### ・概要

| 設定項目                  | 説明                                              | 補足                                                         |
| ------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| AMI：Amazonマシンイメージ | AMIを選択する。                                   |                                                              |
| インスタンスタイプ        |                                                   |                                                              |
| インスタンス数            |                                                   |                                                              |
| ネットワーク              |                                                   |                                                              |
| サブネット                |                                                   |                                                              |
| 自動割り当てIPアドレス    |                                                   | EC2インスタンス構築後に有効にできない。                      |
| キャパシティの予約        |                                                   |                                                              |
| ドメイン結合ディレクトリ  |                                                   |                                                              |
| IAMロール                 | EC2に付与するIAMロールを設定する。                |                                                              |
| シャットダウン動作        |                                                   |                                                              |
| 終了保護                  | EC2インスタンスの削除を防ぐ。                     | 必ず有効にすること。                                         |
| モニタリング              |                                                   |                                                              |
| テナンシー                |                                                   |                                                              |
| Elastic Inference         |                                                   |                                                              |
| クレジット仕様            |                                                   |                                                              |
| ストレージ                | EC2インスタンスのストレージを設定する。           |                                                              |
| キーペア                  | EC2の秘密鍵に対応した公開鍵をインストールできる。 | キーペアに割り当てられるフィンガープリント値を調べることで、公開鍵と秘密鍵の対応関係を調べられる。 |

<br>

### EC2インスタンスのダウンタイム

#### ・ダウンタイムの発生条件

以下の条件の時にEC2にダウンタイムが発生する。EC2を冗長化している場合は、ユーザーに影響を与えずに対処できる。ダウンタイムが発生する方のインスタンスを事前にALBのターゲットグループから解除しておき、停止したインスタンスが起動した後に、ターゲットグループに再登録する。

| 変更する項目                     | ダウンタイムの有無 | 補足                                                         |
| -------------------------------- | ------------------ | ------------------------------------------------------------ |
| インスタンスタイプ               | あり               | インスタンスタイプを変更するためにはEC2を停止する必要がある。そのため、ダウンタイムが発生する。 |
| ホスト物理サーバーのリタイアメント | あり               | AWSから定期的にリタイアメントに関する警告メールが届く。ルートデバイスタイプが『EBS』の場合、ホスト物理サーバーの引っ越しを行うためにEC2の停止と起動が必要である。そのため、ダウンタイムが発生する。なお、再起動では引っ越しできない。 |

<br>

### インスタンスタイプ

#### ・世代と大きさ

『世代』と『大きさ』からなる名前で構成される。世代の数字が上がるにつれて、より小さな世代と同じ大きさであっても、パフォーマンスと低コストになる。AMIのOSのバージョンによっては、新しく登場したインスタンスタイプを適用できないことがあるため注意する。例えば、CentOS 6系のAMIでは、```t3.small```を選択できない。

参考：https://aws.amazon.com/marketplace/pp/prodview-gkh3rqhqbgzme?ref=cns_srchrow

|        | 機能名                                                         |
| ------ | ------------------------------------------------------------ |
| 世代   | ```t2```、```t3```、```t3a```、```t4g```、```a1```           |
| 大きさ | ```nano```、```small```、```medium```、```large```、```xlarge```、```2xlarge``` |

#### ・CPUバーストモード

バーストモードのインスタンスタイプの場合、一定水準のベースラインCPU使用率を提供しつつ、これを超過できる。CPU使用率がベースラインを超えたとき、超過した分だけEC2はCPUクレジットを消費する。CPUクレジットは一定の割合で回復する。蓄積できる最大CPUクレジット、クレジットの回復率、ベースラインCPU使用率は、インスタンスタイプによって異なる。詳しくは以下のリンク先を参考にせよ。

参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/burstable-performance-instances.html

<br>

### ルートデバイスボリューム

#### ・ルートデバイスボリュームとは

EC2インスタンスは、ルートデバイスボリュームがマウントされたパーティションを読み込んで起動する。

参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/RootDeviceStorage.html

#### ・EBSボリューム

![ec2_ebs-backed-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ec2_ebs-backed-instance.png)

EBSで管理されているルートデバイスボリュームで、推奨の方法である。インスタンスストアボリュームとは異なり、コンピューティングとして機能するEC2インスタンスと、ストレージとして機能するEBSが分離されている。そのため、EBSボリュームの永続化を設定した場合に。EC2インスタンスが誤って削除されてしまったとしても、データを守める。また、両者が分離されていないインスタンスボリュームと比較して、再起動が早いため、再起動に伴うダウンタイムが短い。ただし、

参考：

- https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/RootDeviceStorage.html#RootDeviceStorageConcepts
- https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device
- https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/RootDeviceStorage.html#Using_RootDeviceStorage

#### ・インスタンスストアボリューム

![ec2_instance-store-backed-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ec2_instance-store-backed-instance.png)

インスタンスストアで管理されているルートデバイスボリュームで、非推奨の方法である。インスタンスストアボリュームは、EC2インスタンスが終了すると一緒に削除されてしまう。

参考：

- https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/RootDeviceStorage.html#RootDeviceStorageConcepts
- https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device

<br>

### キーペア

#### ・キーペアのフィンガープリント値

ローカルに置かれている秘密鍵が、該当するEC2に置かれている公開鍵とペアなのかどうか、フィンガープリント値を照合して確認する方法

```bash
$ openssl pkcs8 \
  -in <秘密鍵名>.pem \
  -inform PEM \
  -outform DER \
  -topk8 \
  -nocrypt | openssl sha1 -c
```

#### ・EC2へのSSH接続

クライアントのSSHプロトコルのパケットは、まずインターネットを経由して、インターネットゲートウェイを通過する。その後、Route53、ALBを経由せず、そのままEC2へ向かう。

![ssh-port-forward](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ssh-port-forward.png)

<br>

## 11-02. EC2 based on AMI：Amazon Machine Image

### AMIとは

EC2インスタンス上でアプリケーションソフトウェアを稼働させるために必要なソフトウェア（OS、ミドルウェア）とEBSボリュームのコピーが内蔵されたテンプレートのこと。

参考：

- https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ec2-instances-and-amis.html
- https://aws.typepad.com/sajp/2014/04/trainingfaqbest10.html

<br>

### AMIタイプ

#### ・EBS-backed AMI

EBSボリュームを持つEC2インスタンスを構築するAMIのこと。

参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device

#### ・instance store-backed AMI

インスタンスストアボリュームを持つEC2インスタンスを構築するAMIのこと。

参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device

<br>

### AMI OS

#### ・Amazon Linux

#### ・CentOS

ベンダー公式あるいは非公式が提供しているAMIが区別しにくいので、確実に公式ベンダーが提供しているもの選択すること。

参考： https://wiki.centos.org/Cloud/AWS

<br>

## 11-03. EC2 with EBS：Elastic Block Storage

### EBSとは

EC2のクラウド内蔵ストレージとして働く。

<br>

### 設定項目

#### ・EBSボリュームタイプとストレージの関係

| EBSボリュームタイプ     | ストレージの種類 |
| ----------------------- | ---------------- |
| 汎用SSD                 | SSD              |
| プロビジョンド IOPS SSD | SSD              |
| スループット最適化 HDD  | HDD              |
| Cold HDD                | HDD              |

<br>

### EBSボリュームの選び方

#### ・下限EBSボリュームサイズ

一般的なアプリケーションであれば、最低限20～30GiBのEBSボリュームサイズがあるとよい。しかし、踏み台サーバーの場合、プライベートサブネットに接続するための足場としての用途しかなく、大きなボリュームを組み込む必要がない。そこでできるだけ最小限のボリュームを選択し、ストレージ合計を抑える必要がある。OSによって下限ボリュームサイズが異なることに注意する。

| OS           | 仮想メモリ | 下限EBSボリュームサイズ |
| ------------ | ---------- | ----------------------- |
| Amazon Linux | t2.micro   | 8                       |
| CentOS       | t2.micro   | 10                      |

<br>

### EBSボリュームの永続化

#### ・EBSボリュームの永続化とは

EC2の初期構築時に、ストレージの追加の項目で『終了時に削除』の設定を無効化しておく。これにより、EC2インスタンスが削除されても、EBSボリュームを削除しないようにできる。

参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/RootDeviceStorage.html#Using_RootDeviceStorage

#### ・EC2インスタンスの構築後に永続化する

EC2インスタンスの構築後に、EBSボリュームを永続化したい場合は、CLIを実行する必要がある。

```bash
$ aws ec2 modify-instance-attribute \
  --instance-id <インスタンスID> 
  --block-device-mappings \
  file://example.json
```

```bash
# example.jsonファイル
[
  {
    "DeviceName": "/dev/sda1",
    "Ebs": {
      "DeleteOnTermination": false
    }
  }
]
```

#### ・注意点

EC2インスタンスにオートスケーリングを適用している場合は、EBSボリュームを永続化しない方が良いかもしれない。オートスケーリングのスケールイン時に、削除されたEC2インスタンスのEBSボリュームが削除されないため、未使用のEBSボリュームがどんどん溜まっていく問題が起こる。

参考：https://qiita.com/YujiHamada3/items/c890a3de8937ea20bbb2

<br>

### EBSボリュームのサイズ変更

EBSボリュームを変更するためには、実際のEBSボリューム、パーティション、EBSボリュームに紐づくファイルシステム、に関してサイズを変更する必要がある。

参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/recognize-expanded-volume-linux.html#extend-file-system

**＊例＊**

（１）バックアップのため、変更対象のEC2インスタンスのAMIを作成しておく。

（２）EC2インスタンスのEBSボリュームを```8```GBから```16```GBに変更する例を考える。```lsblk```コマンドで現在のブロックデバイスのサイズを確認すると、EBSボリュームとパーティションがともに```8```GBである。また、```df```コマンドで現在のファイルシステムのサイズを確認すると、同じく```8```GBである。

```bash
$ lsblk

NAME    MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
xvda    202:0    0   8G  0 disk            # EBSボリューム
└─xvda1 202:1    0   8G  0 part /          # パーティション

# ～ 中略 ～
```

```bash
$ df

Filesystem  Type  Size  Used  Avail  Use%  Mounted on
/dev/xvda1  ext4    8G  1.9G    14G   12%  /

# ～ 中略 ～
```

（３）コンソール画面から、EBSボリュームを```16```GBに変更する。ダウンタイムは発生しない。改めて```lsblk```コマンドを実行すると、該当のEBSボリュームが変更されたことを確認できる。

```bash
$ lsblk

NAME    MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
xvda    202:0    0  16G  0 disk            # EBSボリューム
└─xvda1 202:1    0   8G  0 part /          # パーティション

# ～ 中略 ～
```

（４）```growpart```コマンドを実行し、パーティションを拡張する。改めて```lsblk```コマンドを実行すると、該当のパーティションが変更されたことを確認できる。

```bash
$ sudo growpart /dev/xvda 1
```

```bash
$ lsblk

NAME    MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
xvda    202:0    0  16G  0 disk            # EBSボリューム
└─xvda1 202:1    0  16G  0 part /          # パーティション

# ～ 中略 ～
```

（５）ファイルシステムのうち、```/dev/xvda1```ファイルがEBSボリュームに紐づいている。```resize2fs ```コマンドを実行し、これのサイズを変更する。改めて```df```コマンドを実行すると、該当のファイルシステムが変更されたことを確認できる。

```bash
$ sudo resize2fs /dev/xvda1
```

```bash
$ df

Filesystem  Type  Size  Used  Avail  Use%  Mounted on
/dev/xvda1  ext4   16G  1.9G    14G   12%  /           # EBSボリュームに紐づくファイルシステム

# ～ 中略 ～
```

<br>

### スナップショット

#### ・スナップショットとは

EBSボリュームのコピーのこと。ソフトウェアとEBSボリュームのコピーの両方が内蔵されたAMIとは区別すること。

参考：https://aws.typepad.com/sajp/2014/04/trainingfaqbest10.html

<br>

## 13. ECR

### ECRとは

dockerイメージやHelmチャートを管理できる。

<br>

### 設定項目

| 設定項目                 | 説明                                                         | 補足                                                         |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 可視性                   | リポジトリをパブリックアクセス/プライベートアクセスにするかを設定する。 | 様々なベンダーがパブリックリポジトリでECRイメージを提供している。<br>参考：https://gallery.ecr.aws/ |
| タグのイミュータビリティ | 同じタグ名でイメージがプッシュされた場合、イメージタグを上書き可能/不可能かを設定できる。 | -                                                            |
| プッシュ時にスキャン     | イメージがプッシュされた時に、イメージにインストールされているライブラリの脆弱性を検証し、一覧表示する。 | 参考：https://docs.aws.amazon.com/ja_jp/AmazonECR/latest/userguide/image-scanning.html |
| 暗号化設定               | -                                                            | -                                                            |

<br>

### イメージのプッシュ

#### ・Dockerイメージの場合

参考：https://docs.aws.amazon.com/ja_jp/AmazonECR/latest/userguide/docker-push-ecr-image.html

（１）ECRにログインする。

```bash
$ aws ecr get-login-password --region <リージョン> | docker login --username AWS --password-stdin <リポジトリURL>
```

（２）イメージにタグを付与する。

```bash
$ docker tag <イメージID> <リポジトリURL>/<リポジトリ名>:<タグ名>
```

（３）ECRにイメージをプッシュする。

```bash
$ docker push <リポジトリURL>/<リポジトリ名>:<タグ名>
```

#### ・Helmチャートの場合

参考：https://docs.aws.amazon.com/ja_jp/AmazonECR/latest/userguide/push-oci-artifact.html

<br>

### ライフサイクル

#### ・ライフサイクルポリシー

ECRのイメージの有効期間を定義できる。

| 設定項目             | 説明                                                         | 補足                                                         |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ルールの優先順位     | 順位の大きさで、ルールの優先度を設定できる。                 | 数字は連続している必要はなく、例えば、10、20、90、のように設定しても良い。 |
| イメージのステータス | ルールを適用するイメージの条件として、タグの有無や文字列を設定できる。 |                                                              |
| 一致条件             | イメージの有効期間として、同条件に当てはまるイメージが削除される閾値を設定できる。 | 個数、プッシュされてからの期間、などを閾値として設定できる。 |

<br>

### イメージタグ

#### ・タグ名のベストプラクティス

Dockerのベストプラクティスに則り、タグ名にlatestを用いないようにする。その代わりに、イメージのバージョンごとに異なるタグ名になるようハッシュ値（例：GitHubのコミットID）を用いる。

参考：https://matsuand.github.io/docs.docker.jp.onthefly/develop/dev-best-practices/

<br>

## 14. ECS、EKS：Elastic Container/Kubernetes Service

### ECS、EKSとは

コンテナオーケストレーションを実行する環境を提供する。VPCの外に存在している。ECS、EKS、Fargate、EC2の対応関係は以下の通り。

| Control Plane（コンテナオーケストレーション環境） | Data Plane（コンテナ実行環境） | 説明                                                         |
| ------------------------------------------------- | ------------------------------ | ------------------------------------------------------------ |
| ECS：Elastic Container Service                    | Fargate、EC2                   | 単一のOS上でコンテナオーケストレーションを実行する。         |
| EKS：Elastic Kubernetes Service                   | EC2                            | 複数のOS上それぞれでコンテナオーケストレーションを実行する。 |

<br>

## 14-02. ECS on EC2

### EC2起動タイプのコンテナ

#### ・タスク配置戦略

ECSタスクをECSクラスターに配置する時のアルゴリズムを選択できる。

| 戦略    | 説明                                         |
| ------- | -------------------------------------------- |
| Spread  | ECSタスクを各場所にバランスよく配置する         |
| Binpack | ECSタスクを1つの場所にできるだけ多く配置する。 |
| Random  | ECSタスクをランダムに配置する。                 |

<br>

## 14-03. ECS on Fargate

### ECSクラスター

#### ・ECSクラスターとは

![ECSクラスター](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ECSクラスター.png)

<br>

### ECSサービス

#### ・ECSサービスとは

ECSタスクへのロードバランシング、タスクの数の維持管理や、リリースの成否の管理を行う機能のこと。

参考：https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/userguide/service_definition_parameters.html

| 設定項目                     | 説明                                                         | 補足                                                         |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| タスク定義                   | サービスで維持管理するタスクの定義ファミリー名とリビジョン番号を設定する。 |                                                              |
| 起動タイプ                   | ECSタスク内のコンテナの起動タイプを設定する。                |                                                              |
| プラットフォームのバージョン | タスクの実行環境のバージョンを設定する。                     | バージョンによって、連携できるAWSリソースが異なる。          |
| サービスタイプ               |                                                              |                                                              |
| タスクの必要数               | 非スケーリング時またはデプロイ時のタスク数を設定する。       | 最小ヘルス率と最大率の設定値に影響する。                     |
| 最小ヘルス率                 | ECSタスクの必要数の設定を100%とし、新しいタスクのデプロイ時に、稼働中タスクの最低合計数を割合で設定する。 | 例として、タスク必要数が４個だと仮定する。タスクヘルス最小率を50%とすれば、稼働中タスクの最低合計数は２個となる。デプロイ時の既存タスク停止と新タスク起動では、稼働中の既存タスク/新タスクの数が最低合計数未満にならないように制御される。<br>参考：https://toris.io/2021/04/speeding-up-amazon-ecs-container-deployments |
| 最大率                       | ECSタスクの必要数の設定を100%とし、新しいタスクのデプロイ時に、稼働中/停止中タスクの最高合計数を割合で設定する。 | 例として、タスク必要数が４個だと仮定する。タスク最大率を200%とすれば、稼働中/停止中タスクの最高合計数は８個となる。デプロイ時の既存タスク停止と新タスク起動では、稼働中/停止中の既存タスク/新タスクの数が最高合計数を超過しないように制御される。<br>参考：https://toris.io/2021/04/speeding-up-amazon-ecs-container-deployments |
| ヘルスチェックの猶予期間     | デプロイ時のALB/NLBのヘルスチェックの状態を確認するまでの待機時間を設定する。猶予期間を過ぎても、ALB/NLBのヘルスチェックが失敗していれば、サービスはタスクを停止し、新しいタスクを再起動する。 | ALB/NLBではターゲットを登録し、ヘルスチェックを実行するプロセスがある。特にNLBでは、これに時間がかかる。またアプリケーションによっては、コンテナの構築に時間がかかる。そのため、NLBのヘルスチェックが完了する前に、ECSサービスがNLBのヘルスチェックの結果を確認してしまうことがある。例えば、NLBとLaravelを用いる場合は、ターゲット登録とLaravelコンテナの築の時間を加味して、```330```秒以上を目安とする。例えば、ALBとNuxt.js（SSRモード）を用いる場合は、```600```秒以上を目安とする。なお、アプリケーションのコンテナ構築にかかる時間は、ローカル環境での所要時間を参考にする。 |
| タスクの最小数               | スケーリング時のタスク数の最小数を設定する。                 |                                                              |
| タスクの最大数               | スケーリング時のタスク数の最大数を設定する。                 |                                                              |
| ロードバランシング           | ALBでルーティングするコンテナを設定する。                    |                                                              |
| タスクの数                   | ECSタスクの構築数をいくつに維持するかを設定する。            | タスクが何らかの原因で停止した場合、空いているAWSサービスを用いて、タスクが自動的に補填される。 |
| デプロイメント               | ローリングアップデート、ブルー/グリーンデプロイがある。           |                                                              |
| サービスロール               |                                                              |                                                              |

#### ・ターゲット追跡スケーリングポリシー

| 設定項目                           | 説明                                                         | 補足                                                         |
| ---------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ターゲット追跡スケーリングポリシー | 監視対象のメトリクスがターゲット値を超過しているか否かに基づいて、タスク数のスケーリングが実行される。 |                                                              |
| ECSサービスメトリクス              | 監視対象のメトリクスを設定する。                             | 『平均CPU』、『平均メモリ』、『タスク当たりのALBからのリクエスト数』を監視できる。SLIに対応するCloudWatchメトリクスも参考にせよ。 |
| ターゲット値                       | タスク数のスケーリングが実行される収束値を設定する。         | ターゲット値を超過している場合、タスク数がスケールアウトされる。反対に、ターゲット値未満（正確にはターゲット値の９割未満）の場合、タスク数がスケールインされる。 |
| スケールアウトクールダウン期間     | スケールアウトを発動してから、次回のスケールアウトを発動できるまでの時間を設定する。 | ・期間を短くし過ぎると、ターゲット値を超過する状態が断続的に続いた場合、余分なスケールアウトが連続して実行されてしまうため注意する。<br>・期間を長く過ぎると、スケールアウトが不十分になり、ECSの負荷が緩和されないため注意する。 |
| スケールインクールダウン期間       | スケールインを発動してから、次回のスケールインを発動できるまでの時間を設定する。 |                                                              |
| スケールインの無効化               |                                                              |                                                              |

ターゲット値の設定に応じて、自動的にスケールアウトやスケールインが起こるシナリオ例を示す。

1. 最小タスク数を2、必要タスク数を4、最大数を6、CPU平均使用率を40%に設定する例を考える。
2. 平常時、CPU使用率40%に維持される。
3. リクエストが増加し、CPU使用率55%に上昇する。
4. タスク数が6つにスケールアウトし、CPU使用率40%に維持される。
5. リクエスト数が減少し、CPU使用率が20%に低下する。
6. タスク数が2つにスケールインし、CPU使用率40%に維持される。

<br>

### ECSタスク

![タスクとタスク定義](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/タスクとタスク定義.png)

#### ・ECSタスク

グルーピングされたコンテナ群のこと

#### ・タスク定義とは

ECSタスクをどのような設定値に基づいて構築するかを設定できる。タスク定義は、バージョンを示す『リビジョンナンバー』で番号づけされる。タスク定義を削除するには、全てのリビジョン番号のタスク定義を登録解除する必要がある。

| 設定項目                           | 説明                                                         | 補足                                                         |
| ---------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| タスク定義名                       | タスク定義の名前を設定する。                                 |                                                              |
| ネットワークモード                 | ホストとコンテナ間を接続するネットワーク様式を設定する。     |                                                              |
| 互換性                             |                                                              |                                                              |
| オペレーティングシステムファミリー |                                                              |                                                              |
| タスクロール                       | タスク内のコンテナのアプリケーションが、他のリソースにアクセスするために必要なロールを設定する。 |                                                              |
| タスク実行ロール                   | タスク上に存在するコンテナエージェントが、他のリソースにアクセスするために必要なロールを設定する。 |                                                              |
| タスクメモリ                       | ECSタスク当たりのコンテナの合計メモリ使用量を設定する。      | タスク内のコンテナに割り振ることを想定し、やや多めにメモリを設定した方が良い。 |
| タスクCPU                          | ECSタスク当たりのコンテナの合計CPU使用量を設定する。         | ・タスク内のコンテナに割り振ることを想定し、やや多めにメモリを設定した方が良い。<br>・CPUごとに使用できるメモリサイズに違いがあり、大きなCPUほど小さなメモリを使用できない。 |
| コンテナ定義                       | タスク内のコンテナを設定する。                               | JSONをインポートしても設定できる。                           |
| サービス統合                       |                                                              |                                                              |
| プロキシ                           |                                                              |                                                              |
| FireLens統合                       | FireLensコンテナを用いる場合に有効化する。                 |                                                              |
| ボリューム                         |                                                              |                                                              |

#### ・タスクのライフサイクル

参考：https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/task-lifecycle.html#lifecycle-states

![ecs-task_life-cycle](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs-task_life-cycle.png)

#### ・新しいECSタスクを一時的に実行

現在起動中のECSタスクとは別に、新しいタスクを一時的に起動する。CI/CDツールで実行する以外に、ローカルから手動で実行する場合もある。起動時に、```overrides```オプションを用いて、指定したタスク定義のコンテナ設定を上書きできる。正規表現で設定する必要があり、さらにJSONでは『```\```』を『```\\```』にエスケープしなければならない。コマンドが実行された後に、タスクは自動的にStopped状態になる。

**＊実装例＊**

LaravelのSeederコマンドやロールバックコマンドを、ローカルPCから実行する。

```bash
#!/bin/bash

set -x

echo "Set Variables"
SERVICE_NAME="stg-foo-ecs-service"
CLUSTER_NAME="stg-foo-ecs-cluster"
TASK_NAME="stg-foo-ecs-task-definition"
SUBNETS_CONFIG=$(aws ecs describe-services \
  --cluster ${CLUSTER_NAME} \
  --services ${SERVICE_NAME} \
  --query "services[].deployments[].networkConfiguration[].awsvpcConfiguration[].subnets[]")
SGS_CONFIG=$(aws ecs describe-services \
  --cluster ${CLUSTER_NAME} \
  --services ${SERVICE_NAME} \
  --query "services[].deployments[].networkConfiguration[].awsvpcConfiguration[].securityGroups[]")

# 実行したいコマンドをoverridesに設定する。
echo "Run Task"
TASK_ARN=$(aws ecs run-task \
  --launch-type FARGATE \
  --cluster ${CLUSTER_NAME} \
  --platform-version "1.4.0" \
  --network-configuration "awsvpcConfiguration={subnets=${SUBNETS_CONFIG},securityGroups=${SGS_CONFIG}}" \
  --task-definition ${TASK_NAME} \
  --overrides '{\"containerOverrides\": [{\"name\": \"laravel-container\",\"command\": [\"php\", \"artisan\", \"db:seed\", \"--class=DummySeeder\", \"--force\"]}]}' \
  --query "tasks[0].taskArn" | tr -d """)

echo "Wait until task stopped"
aws ecs wait tasks-stopped \
  --cluster ${CLUSTER_NAME} \
  --tasks ${TASK_ARN}

echo "Get task result"
RESULT=$(aws ecs describe-tasks \
  --cluster ${CLUSTER_NAME} \
  --tasks ${TASK_ARN})
echo ${RESULT}

EXIT_STATUS=$(echo ${RESULT} | jq .tasks[0].containers[0].exitStatus)
echo exitStatus ${EXIT_STATUS}
exit ${EXIT_STATUS}
```

なお、実行IAMユーザーを作成し、ECSタスクを起動できる最低限の権限をアタッチする。

```bash
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "iam:PassRole",
                "ecs:RunTask",
                "ecs:DescribeServices",
                "ecs:DescribeTasks"
            ],
            "Resource": [
                "arn:aws:ecs:*:<アカウントID>:service/*",
                "arn:aws:ecs:*:<アカウントID>:task/*",
                "arn:aws:ecs:*:<アカウントID>:task-definition/*",
                "arn:aws:iam::<アカウントID>:role/*"
            ]
        }
    ]
}
```

####  ・ECS Exec

ECSタスクのコンテナに対して、シェルログインを実行する。ECSサービスにおけるECS-Execオプションの有効化、ssmmessagesエンドポイントの作成、SMセッションマネージャーにアクセスするためのIAMポリシーの作成、ECSタスク実行ロールへのIAMポリシーの付与、IAMユーザーへのポリシーの付与、が必要になる。

参考：

- https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/userguide/ecs-exec.html
- https://docs.aws.amazon.com/ja_jp/systems-manager/latest/userguide/systems-manager-setting-up-messageAPIs.html

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        # ssmmessages APIへのアクセス権限
        "ssmmessages:CreateControlChannel",
        "ssmmessages:CreateDataChannel",
        "ssmmessages:OpenControlChannel",
        "ssmmessages:OpenDataChannel"
      ],
      "Resource": "*"
    }
  ]
}
```

なお、事前の設定がなされているかどうかをecs-exec-checkerスクリプトを実行して確認できる。

参考：https://github.com/aws-containers/amazon-ecs-exec-checker

```bash
#!/bin/bash

ECS_CLUSTER_NAME=prd-foo-ecs-cluster
ECS_TASK_ID=bar

bash <(curl -Ls https://raw.githubusercontent.com/aws-containers/amazon-ecs-exec-checker/main/check-ecs-exec.sh) $ECS_CLUSTER_NAME $ECS_TASK_ID
```

ECS Execを実行するユーザーに、実行権限のポリシーを付与する必要がある。

```bash
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecs:ExecuteCommand",
            ],
            "Resource": [
                "arn:aws:ecs:*:<アカウントID>:cluster/*",
                "arn:aws:ecs:*:<アカウントID>:task/*",
            ]
        }
    ]
}
```

laravelコンテナに対して、シェルログインを実行する。bashを実行する時に、『```/bin/bash```』や『```/bin/sh```』で指定すると、binより上のパスもECSに送信されてしまう。例えば、Windowsなら『```C:/Program Files/Git/usr/bin/bash```』が送信される。これはCloudTrailでExecuteCommandイベントとして確認できる。ECSコンテナ内ではbashへのパスが異なるため、接続に失敗する。そのため、bashを直接指定するようにする。

```bash
#!/bin/bash

set -xe

ECS_CLUSTER_NAME=prd-foo-ecs-cluster
ECS_TASK_ID=bar
ECS_CONTAINER_NAME=laravel

aws ecs execute-command \
    --cluster $ECS_CLUSTER_NAME \
    --task $ECS_TASK_ID \
    --container $ECS_CONTAINER_NAME \
    --interactive \
    --debug \
    --command "bash"
```

<br>

### Fargate

#### ・Fargateとは

コンテナの実行環境のこと。『ECS on Fargate』という呼び方は、Fargateが環境の意味合いを持つからである。Fargate環境ではホストが隠蔽されており、実体としてEC2インスタンスをホストとしてコンテナが稼働している（ドキュメントに記載がないが、AWSサポートに確認済み）。

参考：https://aws.amazon.com/jp/blogs/news/under-the-hood-fargate-data-plane/

![fargate_data-plane](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/fargate_data-plane.png)

#### ・コンテナエージェント

コンテナ内で稼働し、コンテナの操作を行うプログラムのこと。

#### ・コンテナ定義

タスク内のコンテナ1つに対して、環境を設定する。

参考：https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/userguide/task_definition_parameters.html

| 設定項目                         | 対応するdockerコマンドオプション             | 説明                                                         | 補足                                                         |
| -------------------------------- | -------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| cpu                              | ```--cpus```                                 | タスク全体に割り当てられたCPU（タスクCPU）のうち、該当のコンテナに割り当てるCPU分を設定する。 |  |
| dnsServers                       | ```--dns```                                  | コンテナが名前解決に用いるDNSサーバーのIPアドレスを設定する。 |                                                              |
| essential                        |                                              | コンテナが必須か否かを設定する。                             | ・```true```の場合、コンテナが停止すると、タスクに含まれる全コンテナが停止する。<br>```false```の場合、コンテナが停止しても、その他のコンテナは停止しない。 |
| healthCheck<br>(command)         | ```--health-cmd```                           | ホストマシンからFargateに対して、```curl```コマンドによるリクエストを送信し、レスポンス内容を確認。 |                                                              |
| healthCheck<br>(interval)        | ```--health-interval```                      | ヘルスチェックの間隔を設定する。                             |                                                              |
| healthCheck<br>(retries)         | ```--health-retries```                       | ヘルスチェックを成功と見なす回数を設定する。                 |                                                              |
| hostName                         | ```--hostname```                             | コンテナにホスト名を設定する。                               |                                                              |
| image                            |                                              | ECRのURLを設定する。                                         |                                                              |
| logConfiguration<br>(logDriver) | ```--log-driver```                           | ログドライバーを指定することにより、ログの出力先を設定する。 | Dockerのログドライバーにおおよそ対応しており、Fargateであれば『awslogs、awsfirelens、splunk』に設定できる。EC2であれば『awslogs、json-file、syslog、journald、fluentd、gelf、logentries』を設定できる。 |
| logConfiguration<br>(options)   | ```--log-opt```                              | ログドライバーに応じて、詳細な設定を行う。                   |                                                              |
| portMapping                      | ```--publish```<br>```--expose```            | ホストマシンとFargateのアプリケーションのポート番号をマッピングし、ポートフォワーディングを行う。 | ```containerPort```のみを設定し、```hostPort```は設定しなければ、EXPOSEとして定義できる。<br>参考：https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/APIReference/API_PortMapping.html |
| secrets<br>(volumesFrom)         |                                              | パラメータストアから出力する環境変数を設定する。            |  |
| memory                           | ```--memory```<br>```--memory-reservation``` | タスク全体に割り当てられたメモリ（タスクメモリ）のうち、該当のコンテナに割り当てるメモリ分を設定する。 |  |
| mountPoints                      |                                              |                                                              |                                                              |
| ulimit                           | Linuxコマンドの<br>```--ulimit```に相当      |                                                              |                                                              |

#### ・awslogsドライバー

標準出力/標準エラー出力に出力されたログをCloudWatch-APIに送信する。

参考：

- https://docs.docker.com/config/containers/logging/awslogs/
- https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/using_awslogs.html#create_awslogs_logdriver_options

| 設定項目                      | 説明                                                         | 補足                                                         |
| ----------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ```awslogs-group```           | ログ送信先のCloudWatchログのロググループを設定する。         |                                                              |
| ```awslogs-datetime-format``` | 日時フォーマットを定義し、またこれをログの区切り単位としてログストリームに出力する。 | 正規表現で設定する必要があり、さらにJSONでは『```\```』を『```\\```』にエスケープしなければならない。例えば『```\\[%Y-%m-%d %H:%M:%S\\]```』となる。<br>参考：https://docs.docker.com/config/containers/logging/awslogs/#awslogs-datetime-format |
| ```awslogs-region```          | ログ送信先のCloudWatchログのリージョンを設定する。           |                                                              |
| ```awslogs-stream-prefix```   | ログ送信先のCloudWatchログのログストリームのプレフィックス名を設定する。 | ログストリームには、『<プレフィックス名>/<コンテナ名>/<タスクID>』の形式で送信される。 |

#### ・割り当てられるプライベートIPアドレス

タスクごとに異なるプライベートIPが割り当てられる。このIPアドレスに対して、ALBはルーティングを行う。

<br>

### ロール

#### ・サービスロール

サービス機能がタスクを操作するために必要なロールのこと。サービスリンクロールに含まれ、ECSの構築時に自動的にアタッチされる。

#### ・タスクロール

タスク内のコンテナのアプリケーションが、他のリソースにアクセスするために必要なロールのこと。アプリケーションにS3やSSMへのアクセス権限を与えたい場合は、タスク実行ロールではなくタスクロールに権限をアタッチする。

**＊実装例＊**

アプリケーションからCloudWatchログにログを送信するために、ECSタスクロールにカスタマー管理ポリシーをアタッチする。

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": [
        "arn:aws:logs:*:*:*"
      ]
    }
  ]
}
```

**＊実装例＊**

パラメータストアから変数を取得するために、ECSタスクロールにインラインポリシーをアタッチする。

```bash
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ssm:GetParameters"
            ],
            "Resource": "*"
        }
    ]
}
```

#### ・タスク実行ロール

タスク上に存在するコンテナエージェントが、他のリソースにアクセスするために必要なロールのこと。AWS管理ポリシーである『```AmazonECSTaskExecutionRolePolicy```』がアタッチされたロールを、タスクにアタッチする必要がある。このポリシーには、ECRへのアクセス権限の他、CloudWatchログにログを生成するための権限が設定されている。タスク内のコンテナがリソースにアクセスするために必要なタスクロールとは区別すること。

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

**＊実装例＊**

DatadogエージェントがECSクラスターやコンテナにアクセスできるように、ECSタスク実行ロールにカスタマー管理ポリシーをアタッチする。

```bash
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "ecs:ListClusters",
                "ecs:ListContainerInstances",
                "ecs:DescribeContainerInstances"
            ],
            "Effect": "Allow",
            "Resource": "*"
        }
    ]
}
```

<br>

### ネットワークモードとコンテナ間通信

#### ・noneモード

外部ネットワークが無く、タスクと外と通信できない。

#### ・hostモード

Dockerのhostネットワークに相当する。

![network-mode_host-mode](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network-mode_host-mode.png)

#### ・bridgeモード

Dockerのbridgeネットワークに相当する。

![network-mode_host-mode](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network-mode_host-mode.png)

#### ・awsvpcモード

awsの独自ネットワークモード。タスクはElastic Networkインターフェースと紐付けられ、Primary プライベートIPアドレスを割り当てられる。同じタスクに属するコンテナ間は、localhostインターフェイスというENI経由で通信できるようになる（推測ではあるが、Fargate環境でコンテナのホストとなるEC2インスタンスにlocalhostインターフェースが紐付けられる）。これにより、コンテナからコンテナにリクエストを転送するとき（例：NginxコンテナからPHP-FPMコンテナへの転送）は、転送元コンテナにて、転送先のアドレスを『localhost（```127.0.0.1```）』で指定すれば良い。また、awsvpcモードの独自の仕組みとして、同じタスク内であれば、互いにコンテナポートを開放せずとも、プロセスのリッスンするポートを指定するだけで、コンテナ間で通信ができる。例えば、NginxコンテナからPHP-FPMコンテナにリクエストを転送するためには、PHP-FPMプロセスが```9000```番ポートをリッスンし、さらにコンテナが```9000```番ポートを開放する必要がある。しかし、awsvpcモードではコンテナポートを開放する必要はない。

参考：https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/userguide/fargate-task-networking.html

![network-mode_awsvpc](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network-mode_awsvpc.png)

<br>

### タスクのデプロイ方法の種類

#### ・ローリングアップデート

![rolling-update](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rolling-update.png)

参考：https://toris.io/2021/04/speeding-up-amazon-ecs-container-deployments/

1. 最小ヘルス率の設定値に基づいて、ローリングアップデート時の稼働中タスクの最低合計数が決定される。
2. 最大率の設定値に基づいて、ローリングアップデート時の稼働中/停止中タスクの最高合計数が決まる
3. ECSは、既存タスクを稼働中のまま、新タスクを最高合計数いっぱいまで構築する。
4. ECSは、猶予期間後にALB/NLBによる新タスクに対するヘルスチェックの結果を確認する。ヘルスチェックが成功していれば、既存タスクを停止する。ただし、最小ヘルス率によるタスクの最低合計数が保たれる。
5. 『新タスクの起動』と『ヘルスチェック確認後の既存タスクの停止』のプロセスが繰り返し実行され、徐々に既存タスクが新タスクに置き換わる。
6. 全ての既存タスクが新タスクに置き換わる。

#### ・ブルー/グリーンデプロイメント

CodeDeployを用いてデプロイを行う。本ノート内を検索せよ。

<br>

### プライベートなECSタスクのアウトバウンド通信

#### ・プライベートサブネットからの通信

プライベートサブネットにECSタスクを配置した場合、アウトバウンド通信を実行するためには、NAT GatewayまたはVPCエンドポイントを配置する必要がある。パブリックサブネットに配置すればこれらは不要となるが、パブリックサブネットよりもプライベートサブネットにECSタスクを配置する方が望ましい。

#### ・NAT Gatewayを経由

FargateからECRに対するdockerイメージのプルは、VPCの外側に対するアウトバウンド通信（グローバルネットワーク向き通信）である。以下の通り、NAT Gatewayを設置したとする。この場合、ECSやECRとのアウトバウンド通信がNAT Gatewayを通過するため、高額料金を請求されてしまう。

![ecs_nat-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_nat-gateway.png)

#### ・VPCエンドポイントを経由

VPCエンドポイントを設け、これに対してアウトバウンド通信を行うようにするとよい。なお、NAT GatewayとVPCエンドポイントの両方を構築している場合、ルートテーブルでは、VPCエンドポイントへのアウトバウンド通信の方が優先される。そのため、NATGatewayがある状態でVPCエンドポイントを構築すると、接続先が自動的に変わってしまうことに注意する。料金的な観点から、NAT GatewayよりもVPCエンドポイントを経由した方がよい。

![ecs_vpc-endpoint](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_vpc-endpoint.png)

| VPCエンドポイントの接続先 | プライベートDNS名                                            | 説明                                              |
| ------------------------- | ------------------------------------------------------------ | ------------------------------------------------- |
| CloudWatchログ            | ```logs.ap-northeast-1.amazonaws.com```                      | ECSコンテナのログをPOSTリクエストを送信するため。 |
| ECR                       | ```api.ecr.ap-northeast-1.amazonaws.com```<br>```*.dkr.ecr.ap-northeast-1.amazonaws.com``` | イメージのGETリクエストを送信するため。           |
| S3                        | なし                                                         | イメージのレイヤーをPOSTリクエストを送信するため  |
| パラメータストア          | ```ssm.ap-northeast-1.amazonaws.com```<br>                   | パラメータストアにGETリクエストを送信するため。   |
| SSMシークレットマネージャ | ```ssmmessage.ap-northeast-1.amazonaws.com```                | シークレットマネージャの機能を用いるため。        |

<br>

### FireLensコンテナ

#### ・FireLensコンテナとは

以下のノートを参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/summary.html?q=firelens

<br>

### マイクロサービスアーキテクチャ風

#### ・複数のECSサービス構成

マイクロサービスアーキテクチャのアプリケーション群を稼働させる時、Kubernetesを使用し、またインフラとしてEKSを用いるのが基本である。ただし、モノリスなアプリケーションをECSサービスで分割し、Fargateで稼働させることにより、マイクロサービスアーキテクチャ風のインフラを構築できる。

参考：https://tangocode.com/2018/11/when-to-use-lambdas-vs-ecs-docker-containers/

![ecs-fargate_microservices](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs-fargate_microservices.png)

#### ・ECSサービスディスカバリー

Istioと同様にして、マイクロサービスが他のマイクロサービスにリクエストを送信する時に、Route53を用いてIPアドレスの名前解決を行う。オートスケーリングなどでマイクロサービスのIPアドレスが変更されても、動的にレコードを変更する。

参考：

- https://medium.com/@toddrosner/ecs-service-discovery-1366b8a75ad6
- https://dev.classmethod.jp/articles/ecs-service-discovery/

![esc_service-discovery](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/esc_service-discovery.png)

<br>

### Tips

#### ・割り当てられるパブリックIPアドレス、FargateのIPアドレス問題

FargateにパブリックIPアドレスを持たせたい場合、Elastic IPアドレスの設定項目がなく、動的パブリックIPアドレスしか設定できない（Fargateの再構築後に変化する）。アウトバウンド通信の先にある外部サービスが、セキュリティ上で静的なIPアドレスを要求する場合、アウトバウンド通信（グローバルネットワーク向き通信）時に送信元パケットに付加されるIPアドレスが動的になり、リクエストができなくなってしまう。

![NatGatewayを介したFargateから外部サービスへのアウトバウンド通信](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/NatGatewayを介したFargateから外部サービスへのアウトバウンド通信.png)

そこで、Fargateのアウトバウンド通信が、Elastic IPアドレスを持つNAT Gatewayを経由するようにする（Fargateは、パブリックサブネットとプライベートサブネットのどちらに置いても良い）。これによって、Nat GatewayのElastic IPアドレスが送信元パケットに付加されるため、Fargateの送信元IPアドレスを見かけ上静的に扱える。ようになる。

参考：https://aws.amazon.com/jp/premiumsupport/knowledge-center/ecs-fargate-static-elastic-ip-address/

<br>

## 14-04. EKS

### シークレット

パラメータストアをkubernetesシークレットとして使用する。

参考：https://docs.aws.amazon.com/ja_jp/systems-manager/latest/userguide/integrating_csi_driver.html

<br>

## 15. EFS：Elastic File System

![EFSのファイル共有機能](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/EFSのファイル共有機能.png)

### EFSとは

マウントターゲットと接続された片方のEC2インスタンスから、ファイルを読み込み、これをもう一方に出力する。ファイルの実体はいずれかのEC2に存在しているため、接続を切断している間、片方のEC2インスタンス内のファイルは無くなる。再接続すると、切断直前のファイルが再び表示されようになる。

<br>

### 設定項目

#### ・概要

| 設定項目                 | 説明                                                         | 補足                                                         |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| パフォーマンスモード     |                                                              |                                                              |
| スループットモード       | EFSのスループット性能を設定する。                            |                                                              |
| ライフサイクルポリシー   | しばらくリクエストされていないファイルが低頻度アクセス（IA：Infrequent Access）ストレージクラスに移動保存するまでの期限を設定する。 | ・ライフサイクルポリシーを有効にしない場合、スタンダードストレージクラスのみが用いられる。<br>・画面から両ストレージの使用量を確認できる。<br>参考：https://ap-northeast-1.console.aws.amazon.com/efs/home?region=ap-northeast-1#/file-systems/fs-f77d60d6 |
| ファイルシステムポリシー | 他のAWSリソースがEFSを利用する時のポリシーを設定する。       |                                                              |
| 自動バックアップ         | AWS Backupに定期的に保存するかどうかを設定する。             |                                                              |
| ネットワーク             | マウントターゲットを設置するサブネット、セキュリティグループを設定する。 | ・サブネットは、ファイル供給の速度の観点から、マウントターゲットにアクセスするAWSリソースと同じにする。<br>・セキュリティグループは、EC2からのNFSプロトコルアクセスを許可したものを設定する。EC2のセキュリティグループを通過したアクセスだけを許可するために、IPアドレスでは、EC2のセキュリティグループを設定する。 |

<br>

### スペック

#### ・バーストモードの仕組み

スループット性能の自動スケーリングに残高があり、ベースラインを超過した分だけ自動スケーリング残高が減っていく。また、ベースライン未満の分は残高として蓄積されていく。

![burst-mode_balance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/burst-mode_credit-balance-algorithm.png)

元の残高は、ファイルシステムのスタンダードストレージクラスの容量に応じて大きくなる。

参考：https://docs.aws.amazon.com/ja_jp/efs/latest/ug/performance.html#efs-burst-credits

![burst-mode_credit](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/burst-mode_credit-balance-size.png)

残高は、```BurstCreditBalance```メトリクスから確認できる。このメトリクスが常に減少し続けている場合はプロビジョニングモードの方がより適切である。

参考：https://docs.aws.amazon.com/ja_jp/efs/latest/ug/performance.html#using-throughputmode

#### ・プロビジョニングモードの仕組み

スループット性能の自動スケーリング機能は無いが、一定の性能は保証されている。

参考：https://docs.aws.amazon.com/ja_jp/efs/latest/ug/performance.html#provisioned-throughput

![burst-mode_credit](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/provisioning-mode_credit-balance-size.png)

<br>

### コマンド

#### ・マウント

DNS経由で、EFSマウントヘルパーを用いた場合を示す。

```bash
$ mount -t <ファイルシステムタイプ> -o tls <ファイルシステムID>:/ <マウントポイント>
```

```bash
# EFSで、マウントポイントを登録
$ mount -t efs -o tls fs-*****:/ /var/www/app

# マウントポイントを解除
$ umount /var/www/app

# dfコマンドでマウントしているディレクトリを確認できる
$ df
Filesystem                                  1K-blocks Used Available Use% Mounted on
fs-*****.efs.ap-northeast-1.amazonaws.com:/ xxx       xxx  xxx       1%   /var/www/cerenavi
```

<br>

## 16. ElastiCache

### ElasticCacheとは

アプリケーションの代わりに、セッション、クエリキャッシュ、を管理する。RedisとMemcachedがある。

<br>

## 16-02. ElastiCache for Redis

### 設定項目

| 設定項目                         | 説明                                                         | 補足                                                         |
| -------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| クラスターエンジン               | 全てのRedisノードのキャッシュエンジンを設定する。Redis通常モード、Redisクラスターモードから選択する。 | Redisクラスターモードと同様に、Redis通常モードもクラスター構成になる。ただ、クラスターモードとはクラスターの構成方法が異なる。 |
| ロケーション                     |                                                              |                                                              |
| エンジンバージョンの互換性       | 全てのRedisノードのキャッシュエンジンのバージョンを設定する。 | マイナーバージョンが自動的に更新されないように、例えば『```6.x```』は設定しない方がよい。 |
| パラメータグループ               | 全てのRedisノードのグローバルパラメータを設定する。          | デフォルトを使用せずに独自定義する場合、事前に構築しておく必要がある。 |
| ノードのタイプ                   |                                                              |                                                              |
| レプリケーション数               | プライマリノードとは別に、リードレプリカノードをいくつ構築するかを設定する。 | マルチAZにプライマリノードとリードレプリカノードを1つずつ配置させる場合、ここでは『１個』を設定する。 |
| マルチAZ                         | プライマリノードとリードレプリカを異なるAZに配置するかどうかを設定する。合わせて、自動フェイルオーバーを実行できるようになる。 |                                                              |
| サブネットグループ               | Redisにアクセスできるサブネットを設定する。                  |                                                              |
| セキュリティ                     | セキュリティグループを設定する。                             |                                                              |
| クラスターへのデータのインポート | あらかじめ作成しておいたバックアップをインポートし、これを元にRedisを構築する。 | セッションやクエリキャッシュを引き継げる。そのため、新しいRedisへのセッションファイルの移行に役立つ。<br>参考：https://docs.aws.amazon.com/ja_jp/AmazonElastiCache/latest/red-ug/backups-seeding-redis.html |
| バックアップ                     | バックアップの有効化、保持期間、時間を設定する。             | バックアップを取るほどでもないため、無効化しておいて問題ない。 |
| メンテナンス                     | メンテナンスの時間を設定する。                               |                                                              |

<br>

### Redisクラスター

#### ・Redisクラスターとは

![redis-cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/redis-cluster.png)

複数のRedisノードを持つRedisシャードから構成されている。

参考：

- https://docs.aws.amazon.com/ja_jp/AmazonElastiCache/latest/red-ug/WhatIs.Terms.html

- https://docs.aws.amazon.com/ja_jp/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.Clusters

#### ・クラスターモード

クラスターモードを有効にすると、Redisクラスター内に複数のRedisシャードが構築される。反対に無効化すると、シャードは1つだけ構築される。

参考：https://docs.aws.amazon.com/ja_jp/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.ReplicationGroups

<br>

### Redisシャード

#### ・Redisシャードとは

Redisノードのグループ。同じRedisシャード内にあるRedisノード間では、セッションやクエリキャッシュが同期される。

参考：https://docs.aws.amazon.com/ja_jp/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.Shards

<br>

### Redisノード

#### ・Redisノードとは

セッションやクエリキャッシュを管理する。

<br>

### セッション管理機能

#### ・セッション管理機能とは

サーバー内のセッションファイルの代わりにセッションIDを管理し、冗長化されたアプリケーション間で共通のセッションIDを使用できるようにする。セッションIDについては、以下のリンク先を参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/software/software_application_collaboration_api_restful.html

![ElastiCacheのセッション管理機能](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ElastiCacheのセッション管理機能.png)

<br>

### クエリキャッシュ管理機能

#### ・クエリキャッシュ管理機能とは

RDSに対するSQLと読み出されたデータを、キャッシュとして管理する。

![クエリCache管理機能_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クエリCache管理機能_1.png)

（１）アプリケーションは、RDSの前に、Redisに対してSQLを実行する。

```sql
SELECT * FROM users;
```

（２）始めて実行されたSQLの場合、RedisはSQLをキーとして保存し、キャッシュが無いことがアプリケーションに返却する。

（３）アプリケーションはRDSに対してSQLを実行する。

（４）データが読み出される。

（５）アプリケーションはRedisにデータを登録する。

```bash
# ElastiCacheには、SQLの実行結果がまだ保存されていない

*** no cache ***
{"id"=>"1", "name"=>"alice"}
{"id"=>"2", "name"=>"bob"}
{"id"=>"3", "name"=>"charles"}
{"id"=>"4", "name"=>"donny"}
{"id"=>"5", "name"=>"elie"}
{"id"=>"6", "name"=>"fabian"}
{"id"=>"7", "name"=>"gabriel"}
{"id"=>"8", "name"=>"harold"}
{"id"=>"9", "name"=>"Ignatius"}
{"id"=>"10", "name"=>"jonny"}
```

![クエリCache管理機能_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クエリCache管理機能_2.png)

（６）次回、アプリケーションは、RDSの前に、Redisに対してSQLを実行する。

```sql
SELECT * FROM users;
```

（７）Redisは、SQLをキーにしてデータを特定し、アプリケーションに返却する。

```bash
# ElastiCacheには、SQLの実行結果が既に保存されている

*** cache hit ***
{"id"=>"1", "name"=>"alice"}
{"id"=>"2", "name"=>"bob"}
{"id"=>"3", "name"=>"charles"}
{"id"=>"4", "name"=>"donny"}
{"id"=>"5", "name"=>"elie"}
{"id"=>"6", "name"=>"fabian"}
{"id"=>"7", "name"=>"gabriel"}
{"id"=>"8", "name"=>"harold"}
{"id"=>"9", "name"=>"Ignatius"}
{"id"=>"10", "name"=>"jonny"}
```

#### ・クエリキャッシュの操作

```bash
# Redis接続コマンド
$ /usr/local/sbin/redis-stable/src/redis-cli \
  -c
  -h <Redisのホスト名>
  -p 6379
```

```bash
# Redis接続中の状態
# 全てのキーを表示
redis *****:6379> keys *
```

```bash
# Redis接続中の状態
# キーを指定して、対応する値を表示
redis *****:6379> type <キー名>
```

```bash
# Redis接続中の状態
# Redisが受け取ったコマンドをフォアグラウンドで表示
redis *****:6379> monitor
```

<br>

### 障害対策

#### ・フェイルオーバー

ノードの障害を検知し、障害が発生したノードを新しいものに置き換えられる。

| 障害の発生したノード | 挙動                                                         |
| -------------------- | ------------------------------------------------------------ |
| プライマリノード     | リードレプリカの1つがプライマリノードに昇格し、障害が起きたプライマリノードと置き換えられる。 |
| リードレプリカノード | 障害が起きたリードレプリカノードが、別の新しいものに置き換えられる。 |

<br>

### Redisクラスターのダウンタイム

#### ・ダウンタイムの発生条件

| 変更する項目       | ダウンタイムの有無 | ダウンタイム                          |
| ------------------ | ------------------ | ------------------------------------- |
| エンジンバージョン | あり               | 1分30秒ほどのダウンタイムが発生する。 |



<br>

### 計画的なダウンタイム

#### ・計画的なダウンタイムとは

Redisクラスターでは、エンジンバージョンなどのアップグレード時に、Redisノードの再起動が必要である。サイトの利用者に与える影響を小さくできるように、計画的にダウンタイムを発生させる必要がある。

#### ・バックアップとインポートによるダウンタイムの最小化

以下の手順で、ダウンタイムを最小限にしてアップグレードできる。

（１）RedisのセッションやクエリキャッシュをS3にエクスポートする。

（２）新しいRedisを構築する。この時、インポートを用いて、セッションやクエリキャッシュを引き継いだRedisクラスターを別途構築する。

（３）新しく構築したRedisクラスターをアップグレードする。

（４）アプリケーションの接続先を古いRedisクラスターから新しいものに変更する。

（５）古いRedisクラスターを削除する。



<br>

## 17. EventBridge（CloudWatchイベント）

### EventBridge（CloudWatchイベント）とは

AWSリソースで起こったイベントを、他のAWSリソースに転送する。サポート対象のAWSリソースは以下のリンク先を参考にせよ。

参考：https://docs.aws.amazon.com/eventbridge/latest/userguide/what-is-amazon-eventbridge.html

<br>

### パターン

#### ・イベントパターン

指定したAWSリソースでイベントが起こると、以下のようなJSONが送信される。イベントパターンを定義し、JSON構造が一致するイベントのみをターゲットに転送する。イベントパターンに定義しないキーは任意のデータと見なされる。

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/events/CloudWatchEventsandEventPatterns.html

```bash
{
  "version": "0",
  "id": "*****",
  "detail-type": "<イベント名>",
  "source": "aws.<AWSリソース名>",
  "account": "*****",
  "time": "2021-01-01T00:00:00Z",
  "region": "us-west-1",
  "resources": [
    "<イベントを起こしたリソースのARN>"
  ],
  "detail": {
    // その時々のイベントごとに異なるデータ
  }
}
```

**＊実装例＊**

Amplifyの指定したIDのアプリケーションが、```Amplify Deployment Status Change```のイベントを送信し、これの```jobStatus```が```SUCCEED```/```FAILED```だった場合、これを転送する。

```bash
{
  "detail": {
    "appId": [
      "foo",
      "bar"
    ],
    "jobStatus": [
      "SUCCEED",
      "FAILED"
    ]
  },
  "detail-type": [
    "Amplify Deployment Status Change"
  ],
  "source": "aws.amplify"
}
```

#### ・スケジュール

cron式またはrate式を使用し、スケジュールを定義する。これとLambdaを組み合わせることにより、バッチ処理を構築できる。

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/events/ScheduledEvents.html

<br>

### ターゲット

#### ・ターゲットの一覧

参考：https://docs.aws.amazon.com/ja_jp/eventbridge/latest/userguide/eb-targets.html

#### ・デバッグ

EventBridgeでは、どのようなJSONのイベントをターゲットに転送したかを確認できない。そこで、デバッグ時はEventBridgeのターゲットにLambdaを設定し、イベント構造をログから確認する。

**＊実装例＊**

あらかじめ、イベントの内容を出力する関数をLambdaに作成しておく。

```javascript
// Lambdaにデバッグ用の関数を用意する
exports.handler = async (event) => {
    console.log(JSON.stringify({event}, null, 2));
};
```

対象のAWSリソースで任意のイベントが起こった時に、EventBridgeからLambdaに転送するように設定する。

```bash
{
  "source": "aws.amplify"
}
```

AWSリソースで意図的にイベントを起こし、Lambdaのロググループから内容を確認する。```detail```キーにイベントが割り当てられている。

```bash
{
    "event": {
        "version": "0",
        "id": "b4a07570-eda1-9fe1-da5e-b672a1705c39",
        "detail-type": "Amplify Deployment Status Change",
        "source": "aws.amplify",
        "account": "<AWSアカウントID>",
        "time": "<イベントの発生時間>",
        "region": "<リージョン>",
        "resources": [
            "<AmplifyのアプリケーションのARN>"
        ],
        "detail": {
            "appId": "<アプリケーションID>",
            "branchName": "<ブランチ名>",
            "jobId": "<ジョブID>",
            "jobStatus": "<CI/CDのステータス>"
        }
    }
}
```

<br>

### 入力

#### ・入力トランスフォーマー

入力パスで用いる値を抽出し、入力テンプレートで転送するJSONを定義できる。イベントのJSONの値を変数として出力できる。```event```キーをドルマークとして、ドットで繋いでアクセスする。

**＊実装例＊**

入力パスにて、用いる値を抽出する。Amplifyで起こったイベントのJSONを変数として取り出す。JSONのキー名が変数名として機能する。

```bash
{
  "appId": "$.detail.appId",
  "branchName": "$.detail.branchName",
  "jobId": "$.detail.jobId",
  "jobStatus": "$.detail.jobStatus",
  "region": "$.region"
}
```

入力テンプレートにて、転送するJSONを定義する。例えばここでは、Slackに送信するJSONに出力する。出力するときは、入力パスの変数名を『```<>```』で囲う。Slackに送信するメッセージの作成ツールは、以下のリンク先を参考にせよ。

参考：https://app.slack.com/block-kit-builder

```bash
{
  "channel": "foo",
  "text": "Amplifyデプロイ完了通知",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": ":github: プルリク検証用環境"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "*結果*: <jobStatus>"
        }
      ]
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "*ブランチ名*: <branchName>"
        }
      ]
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "*検証URL*: https://<branchName>.<appId>.amplifyapp.com"
        }
      ]
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": ":amplify: <https://<region>.console.aws.amazon.com/amplify/home?region=<region>#/<appId>/<branchName>/<jobId>|*Amplifyコンソール画面はこちら*>"
        }
      ]
    },
    {
      "type": "divider"
    }
  ]
}
```

<br>

## 18. Global Accelerator

### 設定項目

#### ・基本的設定

| 設定項目           | 説明                                                         | 補足                                                         |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Accelerator タイプ | エンドポイントグループへのルーティング時のアルゴリズムを設定する。 | Standard：ユーザーに最も近いリージョンにあるエンドポイントグループに、リクエストがルーティングされる。 |
| IPアドレスプール   | Global Acceleratorに割り当てる静的IPアドレスを設定する。     |                                                              |

#### ・リスナー

| 設定項目        | 説明                                               | 補足                                                         |
| --------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| ポート          | ルーティング先のポート番号を設定する。             |                                                              |
| プロトコル      | ルーティング先のプロトコルを設定する。             |                                                              |
| Client affinity | ユーザーごとにルーティング先を固定するかを設定する。 | ・None：複数のルーティング先があった場合、各ユーザーの毎リクエスト時のルーティング先は固定されなくなる。<br>・Source IP：複数のルーティング先があったとしても、各ユーザーの毎リクエスト時のルーティング先を固定できるようになる。 |

#### ・エンドポイントグループ

| 設定項目               | 説明                                                         | 補足                                                         |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| エンドポイントグループ | 特定のリージョンに紐付くエンドポイントのグループを設定する。 | トラフィックダイヤルにて、各エンドポイントグループの重みを設定できる。 |
| トラフィックダイヤル   | 複数のエンドポイントグループがある場合、それぞれの重み（%）を設定する。 | ・例えば、カナリアリリースのために、新アプリと旧アプリへのルーティングに重みを付ける場合に役立つ。 |
| ヘルスチェック         | ルーティング先に対するヘルスチェックを設定する。             |                                                              |

#### ・エンドポイント

| 設定項目                     | 説明                                                         | 補足                                                         |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| エンドポイントタイプ         | ルーティング先のAWSリソースを設定する。                      | ALB、NLB、EC2、Elastic IPを選択できる。                      |
| 重み                         | 複数のエンドポイントがある場合、それぞれの重みを設定する。   | 各エンドポイントの重みの合計値を256とし、1～255で相対値を設定する。 |
| クライアントIPアドレスの保持 | ```X-Forwarded-For```ヘッダーにクライアントIPアドレスを含めて転送するかどうかを設定する。 |                                                              |

<br>

### 素早いレスポンスの理由

![GlobalAccelerator](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/GlobalAccelerator.png)

最初、クライアントPCからのリクエストはエッジロケーションで受信される。プライベートネットワーク内のエッジロケーションを経由して、ルーティング先のリージョンまで届く。パブリックネットワークを用いないため、小さなレイテシーでトラフィックをルーティングできる。

![GlobalAccelerator導入後](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/GlobalAccelerator導入後.png)

Global Acceleratorを用いない場合、クライアントPCのリージョンから指定したリージョンに至るまで、いくつもパブリックネットワークを経由する必要があり、時間がかかってしまう。

![GlobalAccelerator導入前](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/GlobalAccelerator導入前.png)

以下のサイトで、Global Acceleratorを用いた場合としなかった場合のレスポンス速度を比較できる。

参考：https://speedtest.globalaccelerator.aws/#/

<br>

## 19. IAM：Identify and Access Management

### IAM

#### ・IAMとは

AWSリソースへのアクセスに関する認証と認可を制御する。認証はアクセスキーとシークレットアクセスキーによって、また認可はIAMロール/IAMポリシー/IAMステートメントによって制御される。

#### ・IAMロールとは

IAMポリシーのセットを定義する。

#### ・IAMポリシーとは

IAMステートメントのセットを定義する。

| IAMポリシーの種類                  | 説明                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| アイデンティティベースのポリシー   | IAMユーザー、IAMグループ、IAMロール、にアタッチするためのポリシーのこと。 |
| リソースベースのインラインポリシー | 単一のAWSリソースにインポリシーのこと。                      |
| アクセスコントロールポリシー       | json形式で定義する必要が無いポリシーのこと。                 |

**＊例＊**

以下に、EC2の読み出しのみ権限（```AmazonEC2ReadOnlyAccess```）をアタッチできるポリシーを示す。このIAMポリシーには、他のAWSリソースに対する権限も含まれている。

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ec2:Describe*",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "elasticloadbalancing:Describe*",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudwatch:ListMetrics",
        "cloudwatch:GetMetricStatistics",
        "cloudwatch:Describe*"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "autoscaling:Describe*",
      "Resource": "*"
    }
  ]
}
```

####  ・IAMステートメントとは

AWSリソースに関する認可のスコープを定義する。各アクションについては以下のリンク先を参考にせよ。

| AWSリソースの種類 | リンク                                                       |
| ----------------- | ------------------------------------------------------------ |
| CloudWatchログ    | https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/logs/permissions-reference-cwl.html |

**＊例＊**

以下のインラインポリシーがアタッチされたロールを持つAWSリソースは、任意のSSMパラメータを取得できるようになる。

```yaml
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameters"
      ],
      "Resource": "*"
    }
  ]
}
```

| Statementの項目 | 説明                                             |
| --------------- | ------------------------------------------------ |
| Sid             | 任意の一意な文字列を設定する。空文字でもよい。   |
| Effect          | 許可/拒否を設定する。                           |
| Action          | リソースに対して実行できるアクションを設定する。 |
| Resource        | アクションの実行対象に選べるリソースを設定する。 |


以下に主要なアクションを示す。

| アクション名 | 説明                   |
| ------------ | ---------------------- |
| Create       | リソースを構築する。   |
| Describe     | リソースを表示する。   |
| Delete       | リソースを削除する。   |
| Get          | リソースを取得する。   |
| Put          | リソースを上書きする。 |

#### ・ARNとは：Amazon Resource Namespace

AWSリソースの識別子のこと。

参考：https://docs.aws.amazon.com/ja_jp/general/latest/gr/aws-arns-and-namespaces.html

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Resource": "arn:<パーティション>:<AWSリソース>:<リージョン>:<アカウントID>:<AWSリソースID>"
    }
  ]
}
```

<br>

### IAMロール

#### ・サービスリンクロール

AWSリソースを構築した時に自動的に作成されるロール。他にはアタッチできない専用のポリシーがアタッチされている。『```AWSServiceRoleFor*****```』という名前で自動的に構築される。特に設定せずとも、自動的にリソースにアタッチされる。関連するリソースを削除するまで、ロール自体できない。サービスリンクロールの一覧については、以下のリンク先を参考にせよ。

参考：https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_aws-services-that-work-with-iam.html

#### ・クロスアカウントのアクセスロール  

#### ・プロバイダのアクセスロール  

<br>

### アイデンティティベースのポリシー

#### ・アイデンティティベースのポリシーとは

IAMユーザー、IAMグループ、IAMロール、にアタッチするためのポリシーのこと。

#### ・AWS管理ポリシー

AWSが提供しているポリシーのこと。アタッチ式のポリシーのため、すでにアタッチされていても、他のものにもアタッチできる。

#### ・カスタマー管理ポリシー

ユーザーが独自に構築したポリシーのこと。すでにアタッチされていても、他のものにもアタッチできる。

#### ・インラインポリシー

単一のアイデンティティにアタッチするためのポリシーのこと。組み込み式のポリシーのため、アイデンティティ間で共有してアタッチすることはできない。

**＊実装例＊**

IAMロールにインラインポリシーをアタッチする。このロールを持つユーザーは、ユーザーアカウントのすべての ACM 証明書を一覧表示できるようになる。

```bash
{
  "Version":"2012-10-17",
  "Statement":[
    {
      "Effect":"Allow",
      "Action":"acm:ListCertificates",
      "Resource":"*"
    }
  ]
}
```

**＊実装例＊**

IAMロールにインラインポリシーをアタッチする。このロールを持つユーザーは、全てのAWSリソースに、任意のアクションを実行できる。

```bash
{
  "Version":"2012-10-17",
  "Statement":[
    {
      "Effect":"Allow",
      "Action":"*",
      "Resource":"*"
    }
  ]
}
```

<br>

### リソースベースのインラインポリシー

#### ・リソースベースのインラインポリシーとは

単一のAWSリソースにインポリシーのこと。すでにアタッチされていると、他のものにはアタッチできない。

#### ・バケットポリシー

S3にアタッチされる、自身へのアクセスを制御するためのインラインポリシーのこと。

#### ・ライフサイクルポリシー

ECRにアタッチされる、イメージの有効期間を定義するポリシー。コンソール画面から入力できるため、基本的にポリシーの実装は不要であるが、TerraformなどのIaCツールでは必要になる。

**＊実装例＊**

```bash
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 10 images untagged",
      "selection": {
        "tagStatus": "untagged",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    },
    {
      "rulePriority": 2,
      "description": "Keep last 10 images any",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
```

#### ・信頼ポリシー

ロールにアタッチされる、Assume Roleを行うためのインラインポリシーのこと。

**＊実装例＊**

例えば、以下の信頼ポリシーを任意のロールにアタッチしたとする。その場合、```Principal```の```ecs-tasks```が信頼されたエンティティと見なされ、ロールをアタッチできるようになる。

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

信頼ポリシーでは、IAMユーザーを信頼されたエンティティとして設定することもできる。

**＊実装例＊**

例えば、以下の信頼ポリシーを任意のロールにアタッチしたとする。その場合、```Principal```のIAMユーザーが信頼されたエンティティと見なされ、ロールをアタッチできるようになる。

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::<アカウントID>:user/<ユーザー名>"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "<適当な文字列>"
        }
      }
    }
  ]
}
```

<br>

### IAMポリシーをアタッチできる対象

#### ・IAMユーザーに対するアタッチ

![IAMユーザにポリシーを付与](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/IAMユーザーにポリシーを付与.jpeg)

#### ・IAMグループに対するアタッチ

![IAMグループにポリシーを付与](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/IAMグループにポリシーを付与.jpeg)

#### ・IAMロールに対するアタッチ

![IAMロールにポリシーを付与](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/IAMロールにポリシーを付与.jpeg)

<br>

### ルートユーザー、IAMユーザー

#### ・ルートユーザーとは

全ての権限をもったアカウントのこと。

#### ・IAMユーザーとは

特定の権限をもったアカウントのこと。

#### ・```credentials```ファイルを用いたCLI

AWS CLIでクラウドインフラを操作するためには、```credentials```ファイルに定義されたクレデンシャル情報が必要である。『```aws_region```』ではなく『```aws_default_region```』であることに注意する。

```bash
$ aws configure set aws_access_key_id "<アクセスキー>"
$ aws configure set aws_secret_access_key "<シークレットキー>"
$ aws configure set aws_default_region "リージョン>"
```

```bash
# Linux、Unixの場合：$HOME/.aws/<credentialsファイル名>
# Windowsの場合：%USERPROFILE%\.aws\<credentialsファイル名>

[default]
aws_access_key_id=<アクセスキー>
aws_secret_access_key=<シークレットキー>

[user1]
aws_access_key_id=<アクセスキー>
aws_secret_access_key=<シークレットキー>
```

#### ・環境変数を用いたCLI

AWS CLIでクラウドインフラを操作するためには、環境変数で定義されたクレデンシャル情報が必要である。『```AWS_REGION```』ではなく『```AWS_DEFAULT_REGION```』であることに注意する。

```bash
$ export AWS_ACCESS_KEY_ID=<アクセスキー>
$ export AWS_SECRET_ACCESS_KEY=<シークレットキー>
$ export AWS_DEFAULT_REGION=<リージョン>
```

<br>

### IAMグループ

#### ・IAMグループとは

IAMユーザーをグループ化したもの。IAMグループごとにIAMロールをアタッチすれば、IAMユーザーのIAMロールを管理しやすくなる。

![グループ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/グループ.png)

#### ・IAMグループへのIAMロールの紐付け

IAMグループに対して、IAMロールを紐付ける。そのIAMグループに対して、IAMロールをアタッチしたいIAMユーザーを追加していく。

![グループに所属するユーザにロールを付与](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/グループに所属するユーザーにロールを付与.png)

#### ・グループ一覧

| 権限名            | 説明                       | 補足 |
| --------------- | -------------------------- | ---- |
| Administrator   | 全ての操作に権限がある。   |      |
| PowerUserAccess | IAM以外の操作権限がある。  |      |
| ViewOnlyAccess  | 閲覧のみの操作権限がある。 |      |

<br>

### CLI

#### ・CLIの社内アクセス制限

特定の送信元IPアドレスを制限するポリシーをIAMユーザーにアタッチすることで、そのIAMユーザーがAWS CLIの実行する時に、社外から実行できないように制限をかけられる。

**＊実装例＊**

```bash
{
  "Version": "2012-10-17",
  "Statement": {
    "Effect": "Deny",
    "Action": "*",
    "Resource": "*",
    "Condition": {
      "NotIpAddress": {
        "aws:SourceIp": [
          "nn.nnn.nnn.nnn/32"
        ]
      }
    }
  }
}
```

ポリシーのDenyステートメントによってアクセスが拒否された場合、エラーメッセージの最後に『```with an explicit deny```』という文言がつく。

**＊例＊**

```
Error: An error occurred (AccessDeniedException) when calling the <アクション名> operation: <IAMユーザー名> is not authorized to perform: <アクション名> on resource: <リソースARN> with an explicit deny

```

#### ・ユーザー名を変更

ユーザー名は、コンソール画面から変更できず、コマンドで変更する必要がある。

```bash
$ aws iam update-user \
  --user-name <現行のユーザー名> \
  --new-user-name <新しいユーザー名>
```

<br>

## 20. Kinesis Data Streams

### Kinesis Data Streamsとは

リアルタイムなストリーミングデータ（動画データ、音声データ、など）を継続的に収集し、保管する。

参考：https://docs.aws.amazon.com/ja_jp/streams/latest/dev/amazon-kinesis-streams.html

<br>

## 20-02. Kinesis Data Firehose（Kinesis Delivery Stream）

### Kinesis Data Firehoseとは

リアルタイムなストリーミングデータ（動画データ、音声データ、など）を継続的に収集し、保管/可視化/分析/レポート作成/アラートが可能な外部サービスやAWSリソースに転送する。転送時にLambda関数を用いることで、収集したデータを加工できる。

参考：https://docs.aws.amazon.com/ja_jp/firehose/latest/dev/what-is-this-service.html

<br>

### 設定項目

| 項目             | 説明                                                         |
| ---------------- | ------------------------------------------------------------ |
| レコードの変換   | バッファーに蓄えられたログテキストを、指定された形式で転送する前に、テキストの内容を変換する。Lambdaを用いる。<br>参考：https://docs.aws.amazon.com/ja_jp/firehose/latest/dev/data-transformation.html |
| 転送先           | 転送先とするS3バケットを設定する。                           |
| ディレクトリ名   | S3への転送時に、S3に作成するディレクトリの名前を設定できる。デフォルトで```YYYY/MM/dd/HH```形式でディレクトリが作成され、2021/11/09現在はUTCのみ設定できる。もしJSTにしたい場合はLambdaに変換処理を実装し、Kinesis Data Firehoseと連携する必要がある。<br>参考：https://qiita.com/qiita-kurara/items/b697b65772cb0905c0f2#comment-ac3a2eb2f6d30a917549 |
| バッファー       | Kinesis Data Firehoseでは、受信したログテキストを一旦バッファーに蓄え、一定期間あるいは一定容量が蓄えられた時点で、ログファイルとして転送する。この時、バッファーに蓄える期間や上限量を設定できる。<br>参考：https://docs.aws.amazon.com/ja_jp/firehose/latest/dev/basic-deliver.html#frequency |
| ファイル形式     | 転送時のファイル形式を設定できる。ログファイルの最終到達地点がS3の場合は圧縮形式で問題ないが、S3からさらに他のツール（例：Datadog）に転送する場合はデータ形式を設定しない方が良い。 |
| バックアップ     | 収集したデータを加工する場合、加工前データを保管しておく。   |
| 暗号化           |                                                              |
| エラーログの収集 | データの転送時にエラーが発生した場合、エラーログをCloudWatchログに送信する。 |
| IAMロール        | Kinesis Data FirehoseがAWSリソースにデータを転送できるように、権限を設定する。 |

<br>

## 20-03. Kinesis Data Analytics

### Kinesis Data Analyticsとは

リアルタイムなストリーミングデータ（動画データ、音声データ、など）を継続的に収集し、分析する。

参考：https://docs.aws.amazon.com/kinesisanalytics/latest/dev/what-is.html

<br>

## 21. Lambda

### Lambdaとは

他のAWSリソースのイベントによって駆動する関数を管理できる。ユースケースについては、以下のリンク先を参考にせよ。

参考：参考：https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/applications-usecases.html

![サーバーレスアーキテクチャとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/サーバーレスアーキテクチャとは.png)

<br>

### 設定項目

#### ・概要

| 設定項目                           | 説明                                                         | 補足                                                         |
| ---------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ランタイム                         | 関数の実装に用いる言語を設定する。                           | コンテナイメージの関数では使用できない。                     |
| ハンドラ                           | 関数の実行時にコールしたい具体的メソッド名を設定する。       | ・コンテナイメージの関数では使用できない。<br>・Node.js：```index.js``` というファイル名で ```exports.handler``` メソッドを呼び出したい場合、ハンドラ名を```index.handler```とする |
| レイヤー                           | 異なる関数の間で、特定の処理を共通化できる。                 | コンテナイメージの関数では使用できない。                     |
| メモリ                             | Lambdaに割り当てるメモリ量を設定する。                       | 最大10240MBまで増設でき、増設するほどパフォーマンスが上がる。<br>参考：https://www.business-on-it.com/2003-aws-lambda-performance-check/ |
| タイムアウト                       |                                                              |                                                              |
| 実行ロール                         | Lambda内のメソッドが実行される時に必要なポリシーを持つロールを設定する。 |                                                              |
| 既存ロール                         | Lambdaにロールを設定する。                                   |                                                              |
| トリガー                           | LambdaにアクセスできるようにするAWSリソースを設定する。      | 設定されたAWSリソースに応じて、Lambdaのポリシーが自動的に修正される。 |
| アクセス権限                       | Lambdaのポリシーを設定する。                                 | トリガーの設定に応じて、Lambdaのポリシーが自動的に修正される。 |
| 送信先                             | LambdaからアクセスできるようにするAWSリソースを設定する。    | 送信先のAWSリソースのポリシーは自動的に修正されないため、別途、手動で修正する必要がある。 |
| 環境変数                           | Lambdaの関数内に出力する環境変数を設定する。                 | デフォルトでは、環境変数はAWSマネージド型KMSキーによって暗号化される。 |
| 同時実行数                         | 同時実行の予約を設定する。                                   |                                                              |
| プロビジョニングされた同時実行設定 |                                                              |                                                              |
| モニタリング                       | LambdaをCloudWatchまたはX-Rayを用いて、メトリクスを収集する。 | 次の方法がある<br>・CloudWatchによって、メトリクスを収集する。<br>・CloudWatchのLambda Insightsによって、パフォーマンスに関するメトリクスを収集する。<br>・X-Rayによって、APIへのリクエスト、Lambdaコール、Lambdaの下流とのデータ通信をトレースし、これらをスタックトレース化する。 |

#### ・設定のベストプラクティス

参考：https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/best-practices.html#function-configuration

<br>

### Lambdaと関数の関係性

![lambda-execution-environment-api-flow](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/lambda-execution-environment-api-flow.png)

#### ・Lambdaサービス

コンソール画面のLambdaに相当する。

#### ・関数の実行環境

Lambdaの実行環境は、API（ランタイムAPI、ログAPI、拡張API）と実行環境から構成されている。関数は実行環境に存在し、ランタイムAPIを介して、Lambdaによって実行される。

参考：https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/runtimes-extensions-api.html#runtimes-extensions-api-lifecycle

実行環境には、3つのフェーズがある。

参考：https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/runtimes-context.html#runtimes-lifecycle

![lambda-execution-environment-life-cycle](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/lambda-execution-environment-lifecycle.png)

#### ・Initフェーズ

Lambdaが発火する。実行環境が構築され、関数を実行するための準備が行われる。

#### ・Invokeフェーズ

Lambdaは関数を実行する。実行環境側のランタイムは、APIを介してLambdaから関数に引数を渡す。また関数の実行後に、APIを介して返却値をLambdaに渡す。

#### ・Shutdownフェーズ

一定期間、Invokeフェーズにおける関数実行が行われなかった場合、Lambdaはランタイムを終了し、実行環境を削除する。

<br>

### Lambda関数 on Docker

#### ・ベースイメージの準備

参考：https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/runtimes-images.html#runtimes-images-lp

#### ・RIC：Runtime Interface Clients

通常のランタイムはコンテナ内関数と通信できないため、ランタイムの代わりにRICを用いてコンテナ内関数と通信を行う。言語別にRICパッケージが用意されている。

参考：https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/runtimes-images.html#runtimes-api-client

#### ・RIE：Runtime Interface Emulator

開発環境のコンテナで、擬似的にLambda関数を再現する。全ての言語で共通のRIEライブラリが用意されている。

参考：https://github.com/aws/aws-lambda-runtime-interface-emulator

RIEであっても、稼働させるためにAWSのクレデンシャル情報（アクセスキー、シークレットアクセスキー、リージョン）が必要なため、環境変数や```credentials```ファイルを用いて、Lambdaにこれらの値を出力する。

参考：https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/images-test.html#images-test-env

**＊参考＊**

```bash
$ docker run --rm \
    # エミュレーターをエントリポイントをバインドする。
    -v ~/.aws-lambda-rie:/aws-lambda \
    -p 9000:8080 \
    # エミュレーターをエントリポイントとして設定する。
    --entrypoint /aws-lambda/aws-lambda-rie \
    <イメージ名>:<タグ名> /go/bin/cmd
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
    # エミュレーターをエントリポイントとして設定する。
    entrypoint: /aws-lambda/aws-lambda-rie
    env_file:
      - .docker.env
    image: <イメージ名>:<タグ名>
    ports:
      - 9000:8080
    # エミュレーターをエントリポイントをバインドする。
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

#### ・Goの使用例

以下のリンク先を参考にせよ。

参考：

- https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/lambda-golang.html
- https://hiroki-it.github.io/tech-notebook-mkdocs/md/cloud_computing/cloud_computing_aws_lambda_function.html

#### ・Node.jsの使用例

以下のリンク先を参考にせよ。

参考：

- https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/lambda-nodejs.html
- https://hiroki-it.github.io/tech-notebook-mkdocs/md/cloud_computing/cloud_computing_aws_lambda_function.html

<br>

### 同時実行

#### ・同時実行の予約

Lambdaは、関数の実行中に再びリクエストが送信されると、関数のインスタンスを新しく作成する。そして、各関数インスタンスを用いて、同時並行的にリクエストに応じる。デフォルトでは、関数の種類がいくつあっても、AWSアカウント当たり、合計で```1000```個までしかスケーリングして同時実行できない。関数ごとに同時実行数の使用枠を割り当てるためには、同時実行の予約を設定する必要がある。同時実行の予約数を```0```個とした場合、Lambdaがスケーリングしなくなる。

参考：https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/configuration-concurrency.html#configuration-concurrency-reserved

![lambda_concurrency-model](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/lambda_concurrency-model.png)

<br>

### VPC外/VPC内

#### ・VPC外への配置

LambdaはデフォルトではVPC外に配置される。この場合、LambdaにENIがアタッチされ、ENIに割り当てられたIPアドレスがLambdaに適用される。Lambdaの実行時にENIは再作成されるため、実行ごとにIPアドレスは変化するが、一定時間内の再実行であればENIは再利用されるため、前回の実行時と同じIPアドレスになることもある。

#### ・VPC内への配置

LambdaをVPC内に配置するように設定する。VPC内に配置したLambdaにはパブリックIPアドレスが割り当てられないため、アウトバウンド通信を行うためには、NAT Gatewayを設置する必要がある。

<br>

### ポリシー

#### ・実行のための最低限のポリシー

Lambdaを実行するためには、デプロイされた関数を用いる権限が必要である。そのため、関数を取得するためのステートメントを設定する。

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:<リージョン>:<アカウントID>:function:<関数名>*"
    }
  ]
}
```

<br>

### デプロイ

#### ・直接修正

デプロイを行わずに、関数のソースコードを直接修正し、『Deploy』ボタンでデプロイする。

#### ・S3におけるzipファイル

ビルド後のソースコードをzipファイルにしてアップロードする。ローカルPCまたはS3からアップロードできる。

参考：https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/gettingstarted-package.html#gettingstarted-package-zip

#### ・ECRにおけるイメージ

コンテナイメージの関数でのみ有効である。ビルド後のソースコードをdockerイメージしてアップロードする。ECRからアップロードできる。

参考：https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/gettingstarted-package.html#gettingstarted-package-images

<br>

## 21-02. Lambda@Edge

### Lambda@Edgeとは

CloudFrontに統合されたLambdaを、特別にLambda@Edgeという。

<br>

### 設定項目

#### ・トリガーの種類

![Lambda@Edge](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Lambda@Edge.png)

CloudFrontのビューワーリクエスト、オリジンリクエスト、オリジンレスポンス、ビューワーレスポンス、をトリガーとする。エッジロケーションのCloudFrontに、Lambdaのレプリカが構築される。

| トリガーの種類       | 発火のタイミング                                             |
| -------------------- | ------------------------------------------------------------ |
| ビューワーリクエスト | CloudFrontが、ビューワーからリクエストを受信した後（キャッシュを確認する前）。 |
| オリジンリクエスト   | CloudFrontが、リクエストをオリジンサーバーに転送する前（キャッシュを確認した後）。 |
| オリジンレスポンス   | CloudFrontが、オリジンからレスポンスを受信した後（キャッシュを確認する前）。 |
| ビューワーレスポンス | CloudFrontが、ビューワーにレスポンスを転送する前（キャッシュを確認した後）。 |

#### ・各トリガーのeventオブジェクトへのマッピング

各トリガーのeventオブジェクトへのマッピングは、リンク先を参考にせよ。

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html

<br>

### ポリシー

#### ・実行のための最低限のポリシー

Lambda@Edgeを実行するためには、最低限、以下の権限が必要である。

```bash
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
      "Resource": "arn:aws:lambda:<リージョン名>:<アカウントID>:function:<関数名>:<バージョン>"
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

### Node.jsを用いた関数例

#### ・オリジンの動的な切り替え

![Lambda@Edge_動的オリジン](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Lambda@Edge_動的オリジン.png)

**＊実装例＊**

eventオブジェクトの```domainName```と```host.value```に代入されたバケットのドメイン名によって、ルーティング先のバケットが決まる。そのため、この値を切り替えれば、動的オリジンを実現できる。なお、各バケットには同じOAIを設定する必要がある。

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
 * デバイスタイプに基づいて、オリジンを切り替える。
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

```bash
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
          "clientIp": "nnn.n.nnn.nnn",
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

## 22. RDS：Relational Database Service

### 設定項目

#### ・DBエンジン

| 設定項目           | 説明                                                         | 補足                                                         |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| エンジンタイプ     | ミドルウェアのDBMSの種類を設定する。                         |                                                              |
| エディション       | エンジンバージョンでAuroraを選んだ場合の互換性を設定する。   |                                                              |
| エンジンバージョン | DBエンジンのバージョンを設定する。DBクラスター内の全てのDBインスタンスに適用される。 | ・Auroraであれば、```SELECT AURORA_VERSION()```を用いて、エンジンバージョンを確認できる。 |

<br>

### Auroraと非Aurora

#### ・DBMSに対応するRDB

| DBMS       | RDB  | 互換性            |
| ---------- | ---- | ----------------- |
| Aurora     | RDS  | MySQL/PostgreSQL |
| MariaDB    | RDS  | MariaDB           |
| MySQL      | RDS  | MySQL             |
| PostgreSQL | RDS  | PostgreSQL        |

#### ・機能の違い

RDBがAuroraか非Auroraかで機能に差があり、Auroraの方が耐障害性や可用性が高い。ただ、その分費用が高いことに注意する。

参考：https://www.ragate.co.jp/blog/articles/10234

<br>

### OSの隠蔽

#### ・OSの隠蔽とは

RDSは、EC2内にDBMSが稼働したものであるが、このほとんどが隠蔽されている。そのためDBサーバーのようには操作できず、OSのバージョン確認やSSH接続を行えない。

参考：https://xtech.nikkei.com/it/article/COLUMN/20131108/516863/

#### ・確認方法

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

#### ・メンテナンスウインドウ

DBクラスター/DBインスタンスの設定の変更をスケジューリングする。

参考：https://dev.classmethod.jp/articles/amazon-rds-maintenance-questions/

#### ・メンテナンスの適切な曜日/時間帯

CloudWatchメトリクスの```DatabaseConnections```メトリクスから、DBの接続数が低くなる時間帯を調査し、その時間帯にメンテナンスウィンドウを設定するようにする。また、メンテナンスウィンドウの実施曜日が週末であると、サイトが停止したまま休日を迎える可能性があるため、週末以外になるように設定する（メンテナンスウィンドウがUTCであることに注意）。

#### ・『保留中の変更』『保留中のメンテナンス』

![rds_pending-maintenance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rds_pending-maintenance.png)

ユーザーが予定した設定変更は『保留中の変更』として表示される一方で、AWSによって定期的に行われるハードウェア/OS/DBエンジンのバージョンを強制アップグレードは『保留中のメンテナンス』として表示される。『次のメンテナンスウィンドウ』を選択すれば実行タイミングをメンテナンスウィンドウの間設定できるが、これを行わない場合は『日付の適用』に表示された時間帯に強制実行される。

参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.Maintenance.html

ちなみに保留中のメンテナンスは、アクションの『今すぐアップグレード』と『次のウィンドウでアップグレード』からも操作できる。

参考：https://dev.classmethod.jp/articles/rds-pending-maintenance-actions/

![rds_pending-maintenance_action](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rds_pending-maintenance_action.png)

#### ・保留中のメンテナンスの状態

| 状態           | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| 必須           | アクションは実行可能かつ必須である。実行タイミングは未定であるが、適用期限日には必ず実行され、これは延期できない。 |
| 利用可能       | アクションは実行可能であるが、推奨である。実行タイミングは未定である。 |
| 次のウィンドウ | アクションの実行タイミングは、次回のメンテナンスウィンドウである。後でアップグレードを選択することで、『利用可能』の状態に戻すことも可能。 |
| 進行中         | 現在時刻がメンテナンスウィンドウに含まれており、アクションを実行中である。 |

#### ・『次のウィンドウ』状態の取り消し

設定の変更が『次のウィンドウ』状態にある場合、画面上からは『必須』や『利用可能』といった実行タイミングが未定の状態に戻せない。しかし、CLIを用いると戻せる。

参考：https://dev.classmethod.jp/articles/mean-of-next-window-in-pending-maintenance-and-set-maintenance-schedule/

```bash
$ aws rds describe-pending-maintenance-actions --output=table

-----------------------------------------------------------------------------------
|                        DescribePendingMaintenanceActions                        |
+---------------------------------------------------------------------------------+
||                           PendingMaintenanceActions                           ||
|+---------------------+---------------------------------------------------------+|
||  ResourceIdentifier |  arn:aws:rds:ap-northeast-1:*****:db:prd-foo-instance   ||
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
||  ResourceIdentifier |  arn:aws:rds:ap-northeast-1:*****:db:prd-bar-instance   ||
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
  --resource-identifier arn:aws:rds:ap-northeast-1:*****:db:prd-foo-instance \
  --opt-in-type undo-opt-in \
  --apply-action <取り消したいアクション名>
```

#### ・『保留中の変更』の取り消し

保留中の変更を画面上からは取り消せない。しかし、CLIを用いると戻せる。

参考：

- https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/Overview.DBInstance.Modifying.html#USER_ModifyInstance.ApplyImmediately
- https://qiita.com/tinoji/items/e150ffdc2045e8b85a56

```bash
$ aws rds modify-db-instance \
    --db-instance-identifier prd-foo-instance \
    <変更前の設定項目> <変更前の設定値> \
    --apply-immediately
```

#### ・ミドルウェアのアップグレードの調査書

以下のような報告書のもと、調査と対応を行う。

参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Updates.html

またマージされる内容の調査のため、リリースノートの確認が必要になる。

参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Updates.11Updates.html

```markdown
# 調査

## バージョンの違い

『SELECT AURORA_VERSION()』を用いて、正確なバージョンを取得する。

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

本番環境での対応で起こった想定外の結果を記載する。
```

<br>

## 22-02. RDS（Aurora）

### 設定項目

#### ・DBクラスター

| 設定項目                | 説明                                                         | 補足                                                         |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| レプリケーション        | 単一のプライマリインスタンス（シングルマスター）または複数のプライマリインスタンス（マルチマスター）とするかを設定する。 | フェイルオーバーを利用したダウンタイムの最小化時に、マルチマスターであれば変更の順番を気にしなくてよくなる。ただ、DBクラスターをクローンできないなどのデメリットもある。<br>参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/AuroraUserGuide/aurora-multi-master.html#aurora-multi-master-terms |
| DBクラスター識別子      | DBクラスター名を設定する。                                   | インスタンス名は、最初に設定できず、RDSの構築後に設定できる。 |
| VPCとサブネットグループ | DBクラスターを配置するVPCとサブネットを設定する。            | DBが配置されるサブネットはプライベートサブネットにする、これには、data storeサブネットと名付ける。アプリケーション以外は、踏み台サーバー経由でしかDBにアクセスできないようにする。<br>![subnet-types](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/subnet-types.png) |
| パラメータグループ      | グローバルパラメータを設定する。                             | デフォルトを使用せずに独自定義する場合、事前に構築しておく必要がある。クラスターパラメータグループとインスタンスパラメータグループがあるが、全てのインスタンスに同じパラメータループを設定するべきなため、クラスターパラメータを用いればよい。各パラメータに適用タイプ（dynamic/static）があり、dynamicタイプは設定の適用に再起動が必要である。新しく作成したクラスタパラメータグループにて以下の値を設定するとよい。<br>・```time_zone=Asia/Tokyo```<br>・```character_set_client=utf8mb4```<br>・```character_set_connection=utf8mb4```<br>・```character_set_database=utf8mb4```<br>・```character_set_results=utf8mb4```<br>・```character_set_server=utf8mb4```<br>・```server_audit_logging=1```（監査ログをCloudWatchに送信するかどうか）<br>・```server_audit_logs_upload=1```<br>・```general_log=1```（通常クエリログをCloudWatchに送信するかどうか）<br>・```slow_query_log=1```（スロークエリログをCloudWatchに送信するかどうか）<br>・```long_query_time=3```（スロークエリと見なす最短秒数） |
| データベース認証        | DBに接続するための認証方法を設定する。                       | 各DBインスタンスに異なるデータベース認証を設定できるが、全てのDBインスタンスに同じ認証方法を設定すべきなため、DBクラスターでこれを設定すればよい。 |
| マスタユーザー名          | DBのrootユーザーを設定                                         |                                                              |
| マスターパスワード      | DBのrootユーザーのパスワードを設定                             |                                                              |
| バックアップ保持期間    | DBクラスター がバックアップを保持する期間を設定する。        | ```7```日間にしておく。                                      |
| ログのエクスポート      | CloudWatchログに送信するログを設定する。                     | 必ず、全てのログを選択すること。                             |
| セキュリティグループ    | DBクラスターのセキュリティグループを設定する。               | コンピューティングからのインバウンド通信のみを許可するように、これらのプライベートIPアドレス（```n.n.n.n/32```）を設定する。 |
| 削除保護                | DBクラスターの削除を防ぐ。                                   | DBクラスターを削除するとクラスターボリュームも削除されるため、これを防ぐ。ちなみに、DBクラスターの削除保護になっていてもDBインスタンスは削除できる。DBインスタンスを削除しても、再作成すればクラスターボリュームに接続されて元のデータにアクセスできる。<br>参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/AuroraUserGuide/USER_DeleteCluster.html#USER_DeletionProtection |

#### ・DBインスタンス

| 設定項目                               | 説明                                                         | 補足                                                         |
| -------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| インスタンスクラス                     | DBインスタンスのスペックを設定する。     | バースト可能クラスを選ぶこと。ちなみに、AuroraのDB容量は自動でスケーリングするため、設定する必要がない。 |
| パブリックアクセス | DBインスタンスにIPアドレスを割り当てるか否かを設定する。 |  |
| キャパシティタイプ                     |                                                              |                                                              |
| マルチAZ配置                           | プライマリインスタンスとは別に、リードレプリカをマルチAZ配置で追加するかどうかを設定する。 | 後からでもリードレプリカを追加できる。また、フェイルオーバー時にリードレプリカが存在していなければ、昇格後のプライマリインスタンスが自動で構築される。 |
| 最初のDB名                   | DBインスタンスに自動的に構築されるDB名を設定   |                                                              |
| マイナーバージョンの自動アップグレード | DBインスタンスのDBエンジンのバージョンを自動的に更新するかを設定する。 | 開発環境では有効化、本番環境とステージング環境では無効化しておく。開発環境で新しいバージョンに問題がなければ、ステージング環境と本番環境にも適用する。 |

<br>

### DBクラスター

#### ・DBクラスターとは

DBエンジンにAuroraを選んだ場合にのみ使用できる。DBインスタンスとクラスターボリュームから構成されている。コンピューティングとして機能するDBインスタンスと、ストレージとして機能するクラスターボリュームが分離されているため、DBインスタンスが誤って全て削除されてしまったとしても、データを守める。また、両者が分離されていないエンジンタイプと比較して、再起動が早いため、再起動に伴うダウンタイムが短い。

参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/AuroraUserGuide/Concepts.AuroraHighAvailability.html

![aurora-db-cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/aurora-db-cluster.png)

#### ・空のDBクラスター

コンソール画面にて、DBクラスター内の全てのDBインスタンスを削除すると、DBクラスターも自動で削除される。一方で、AWS-APIをコールして全てのDBインスタンスを削除する場合、DBクラスターは自動で削除されずに、空の状態になる。例えば、Terraformを用いてDBクラスターを構築する時に、インスタンスの構築に失敗するとDBクラスターが空になる、これは、TerraformがAWS-APIをコールした構築を行っているためである。

参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/AuroraUserGuide/USER_DeleteCluster.html#USER_DeleteCluster.DeleteCluster

<br>

### DBインスタンス

#### ・DBインスタンスとは

コンピューティング機能を持ち、クラスターボリュームを操作できる。

#### ・DBインスタンスの種類

|                | プライマリインスタンス                                       | リードレプリカ                                               |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ロール         | 読み出し/書き込みインスタンス                               | 読み出しオンリーインスタンス                                 |
| CRUD制限       | 制限なし。ユーザー権限に依存する。                             | ユーザー権限の権限に関係なく、READしか実行できない。           |
| エンドポイント | 各DBインスタンスに、リージョンのイニシャルに合わせたエンドポイントが割り振られる。 | 各DBインスタンスに、リージョンのイニシャルに合わせたエンドポイントが割り振られる。 |
| データ同期     | DBクラスターに対するデータ変更を受けつける。                 | 読み出し/書き込みインスタンスのデータの変更が同期される。   |

#### ・ZDP（ゼロダウンタイムパッチ適用）

![zero-downtime-patching](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/zero-downtime-patching.png)

Auroraをエンジンバージョンに選んだ場合に使用できる。特定の条件下でのみ、アプリケーションとプライマリーインスタンスの接続を維持したまま、プライマリーインスタンスのパッチバージョンをアップグレードできる。ゼロダウンタイムパッチ適用が発動した場合、RDSのイベントが記録される。ただし、この機能に頼り切らない方が良い。ゼロダウンタイムパッチ適用の発動はAWSから事前にお知らせされるわけでもなく、ユーザーが条件を見て発動の有無を判断しなければならない。また、実際に発動していても、ダウンタイムが発生した事例が報告されている。ゼロダウンタイムパッチ適用時、以下の手順でエンジンバージョンがアップグレードされる。

（１）プライマリーインスタンスのエンジンがアップグレードされ、この時にダウンタイムが発生しない代わりに、```5```秒ほどプライマリーインスタンスのパフォーマンスが低下する。

（２）リードレプリカが再起動され、この時に```20```～```30```秒ほどダウンタイムが発生する。これらの仕組みのため、アプリケーションでは読み出しエンドポイントを接続先として使用しないようにする必要がある。

参考：

- https://qiita.com/tonishy/items/542f7dd10cc43fd299ab
- https://qiita.com/tmiki/items/7ade95c33b8e43c7cb5f
- https://noname.work/2407.html
- https://www.yuulinux.tokyo/8070/

<br>

### エンドポイント

![RDSエンドポイント](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/RDSエンドポイント.png)

| エンドポイント名                       | 役割               | エンドポイント：ポート番号                                   | 説明                                                         |
| -------------------------- | ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| クラスターエンドポイント   | 書き込み/読み出し | ```<DBクラスター名>.cluster-<id>.ap-northeast-1.rds.amazonaws.com:<ポート番号>``` | プライマリインスタンスに接続できる。フェイルオーバーによってプライマリインスタンスとリードレプリカが入れ替わると、エンドポイントの転送先は新しいプライマリインスタンスに変更される。 |
|                            | 読み出し           | ```<DBクラスター名>.cluster-ro-<id>.ap-northeast-1.rds.amazonaws.com:<ポート番号>``` | リードレプリカに接続できる。DBインスタンスが複数ある場合、クエリが自動的に割り振られる。フェイルオーバーによってプライマリインスタンスとリードレプリカが入れ替わると、エンドポイントの転送先は新しいプライマリインスタンスに変更される。 |
| インスタンスエンドポイント |                    | ```<DBインスタンス名>.cwgrq25vlygf.ap-northeast-1.rds.amazonaws.com:<ポート番号>``` | 選択したDBインスタンスに接続できる。フェイルオーバーによってプライマリインスタンスとリードレプリカが入れ替わっても、エンドポイントそのままなため、アプリケーションが影響を付ける。非推奨である。 |

<br>

### ダウンタイム

#### ・ダウンタイムとは

Auroraでは、OS、エンジンバージョン、MySQLなどのアップグレード時に、DBインスタンスの再起動が必要である。再起動に伴ってダウンタイムが発生し、アプリケーションからDBに接続できなくなる。この間、アプリケーションの利用者に与える影響を小さくできるように、計画的にダウンタイムを発生させる必要がある。

#### ・ダウンタイムの発生条件

非Auroraに記載された情報のため、厳密にはAuroraのダウンタイムではない。ただ、経験上同じ項目でダウンタイムが発生しているため、参考にする。

参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/Overview.DBInstance.Modifying.html#USER_ModifyInstance.Settings

#### ・エンジンタイプによるダウンタイムの最小化

コンピューティングとストレージが分離しているAuroraはエンジンタイプの中でもダウンタイムが短い。

<br>

#### ・ダウンタイムの計測例

アプリケーションにリクエストを送信する方法と、RDSに直接クエリを送信する方法がある。レスポンスとRDSイベントログから、ダウンタイムを計測する。

**＊実装例＊**

Aurora MySQLのアップグレードに伴うダウンタイムを計測する。踏み台サーバーを経由してRDSに接続し、現在時刻を取得するSQLを送信する。この時、```for```文や```watch```コマンドを用いる。ただ、```watch```コマンドはデフォルトでインストールされていない可能性がある。平常アクセス時のも同時に実行することで、より正確なダウンタイムを取得するようにする。また、ヘルスチェックの時刻を正しくロギングできるように、ローカルPCから時刻を取得する。

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
for i in {1..900};
do
  echo "---------- No. ${i} Local PC: $(date +"%Y-%m-%d %H:%M:%S") ------------" >> health_check.txt
  echo ${SQL} | mysql -u ${DB_USER} -P 3306 -p${DB_PASSWORD} >> health_check.txt 2>&1
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

上記のシェルスクリプトにより、例えば次のようなログを取得できる。このログからは、```15:23:09 ~ 15:23:14```の間で、接続に失敗していることを確認できる。

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

アップグレード時のプライマリインスタンスのRDSイベントログは以下の通りで、ログによるダウンタイムは、再起動からシャットダウンまでの期間と一致することを確認する。

![rds-event-log_primary-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rds-event-log_primary-instance.png)

ちなみに、リードレプリカは再起動のみを実行していることがわかる。

![rds-event-log_read-replica](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rds-event-log_read-replica.png)

<b>

### フェイルオーバー

#### ・Auroraのフェイルオーバーとは

異なるAZにあるDBインスタンス間で、ロール（プライマリインスタンス/リードレプリカ）の割り当てを入れ替える仕組み。DBクラスター内の全てのDBインスタンスが同じAZに配置されている場合、あらかじめ異なるAZにリードレプリカを新しく作成する必要がある。また、フェイルオーバー時に、もしDBクラスター内にリードレプリカが存在していない場合、異なるAZに昇格後のプライマリインスタンスが自動的に構築される。リードレプリカが存在している場合、これがプライマリーインスタンスに昇格する。

参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/AuroraUserGuide/Concepts.AuroraHighAvailability.html#Aurora.Managing.FaultTolerance

#### ・フェイルオーバーによるダウンタイムの最小化

DBインスタンスがマルチAZ構成の場合、以下の手順を用いてダウンタイムを最小化できる。

参考：https://lab.taf-jp.com/rds%E3%81%AE%E3%83%95%E3%82%A7%E3%82%A4%E3%83%AB%E3%82%AA%E3%83%BC%E3%83%90%E3%83%BC%E6%99%82%E3%81%AE%E6%8C%99%E5%8B%95%E3%82%92%E7%90%86%E8%A7%A3%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B/

（１）アプリケーションの接続先をプライマリーインスタンスにする。

（２）リードレプリカにダウンタイムの発生する変更を適用する。Auroraではフェールオーバーが自動で実行される。

（３）フェイルオーバー時に約```1```～```2```分のダウンタイムが発生する。フェイルオーバーを用いない場合、DBインスタンスの再起動でダウンタイムが発生するが、これよりは時間が短いため、相対的にダウンタイムを短縮できる。

#### ・DBインスタンスの昇格優先順位

Auroraの場合、フェイルオーバーによって昇格するDBインスタンスは次の順番で決定される。DBインスタンスごとにフェイルオーバーの優先度（```0```～```15```）を設定でき、優先度の数値の小さいDBインスタンスが昇格対象になる。優先度が同じだと、インスタンスクラスが大きいDBインスタンスが昇格対象になる。インスタンスクラスが同じだと、同じサブネットにあるDBインスタンスが昇格対象になる。

1. 優先度の順番
2. インスタンスクラスの大きさ
3. 同じサブネット

参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/AuroraUserGuide/Concepts.AuroraHighAvailability.html

#### ・ダウンタイムを最小化できない場合

エンジンバージョンのアップグレードは両方のDBインスタンスで同時に実行する必要があるため、フェイルオーバーを使用できず、ダウンタイムを最小化できない。

<br>

### 負荷対策

#### ・エンドポイントの使い分け

DBインスタンスに応じたエンドポイントが用意されている。アプリケーションからのCRUDの種類に応じて、アクセス先を振り分けることにより、負荷を分散させられる。読み出しオンリーエンドポイントに対して、READ以外の処理を行うと、以下の通り、エラーとなる。


```bash
/* SQL Error (1290): The MySQL server is running with the --read-only option so it cannot execute this statement */
```

#### ・クエリキャッシュの利用

MySQLやRedisのクエリキャッシュ機能を利用する。ただし、MySQLのクエリキャッシュ機能は、バージョン```8```で廃止されることになっている。

#### ・ユニークキーまたはインデックスの利用

スロークエリを検出し、そのSQLで対象としているカラムにユニークキーやインデックスを設定する。スロークエリを検出する方法として、RDSの```long_query_time```パラメータに基づいた検出や、```EXPLAIN```句による予想実行時間の比較などがある。ユニークキー、インデックス、```EXPLAIN```句、については以下のリンク先を参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/software/software_middleware_database_mysql.html

#### ・テーブルを正規化し過ぎない

テーブルを正規化すると保守性が高まるが、アプリケーションのSQLで```JOIN```句が必要になる。しかし、```JOIN```句を含むSQLは、含まないSQLと比較して、実行速度が遅くなる。そこで、戦略的に正規化し過ぎないようにする。

#### ・インスタンスタイプのスケールアップ

インスタンスタイプをスケールアップさせることで、接続過多のエラー（```ERROR 1040 (HY000): Too many connections```）に対処する。ちなみに現在の最大接続数はパラメータグループの値から確認できる。コンソール画面からはおおよその値しかわからないため、SQLで確認した方が良い。

```sql
MySQL > SHOW GLOBAL VARIABLES LIKE 'max_connections';

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

参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/AuroraUserGuide/USER_Events.Messages.html

<br>

## 22-02. RDS（非Aurora）

### ダウンタイム

#### ・ダウンタイムの発生条件

参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/Overview.DBInstance.Modifying.html#USER_ModifyInstance.Settings

| 変更する項目                         | ダウンタイムの有無 | 補足                                                         |
| ------------------------------------ | ------------------ | ------------------------------------------------------------ |
| インスタンスクラス                   | あり               | ・二つのインスタンスで同時にインスタンスクラスを変更すると、次のようなイベントを確認できる。インスタンスが複数回再起動することからわかる通り、長いダウンタイム（約6～8分）が発生する。そのため、フェイルオーバーを利用したダウンタイムの最小化を行う。<br>参考https://dev.classmethod.jp/articles/rds-scaleup-instancetype/<br>・プライマリインスタンスのイベント<br>![rds_change-instance-class_primary-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rds_change-instance-class_primary-instance.png)<br>・リードレプリカのイベント<br/>![rds_change-instance-class_read-replica](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rds_change-instance-class_read-replica.png) |
| サブネットグループ                   | あり               |                                                              |
| エンジンバージョン                   | あり               | ```20```～```30```秒のダウンタイムが発生する。この時間は、ワークロード、クラスターサイズ、バイナリログデータの量、ゼロダウンタイムパッチ適用の発動可否、によって変動する。<br>参考：<br>・https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Updates.html<br>・https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Updates.Patching.html#AuroraMySQL.Updates.AMVU<br>また、メジャーバージョンのアップグレードには```10```分のダウンタイムが発生する。<br>参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.MySQL.html#USER_UpgradeDBInstance.MySQL.Major.Overview |
| メンテナンスウィンドウ               | 条件付きでなし     | ダウンタイムが発生する操作が保留中になっている状態で、メンテナンス時間を現在が含まれるように変更すると、保留中の操作がすぐに適用される。そのため、ダウンタイムが発生する。 |
| バックアップウインドウ               | 条件付きでなし     | ```0```から```0```以外の値、```0```以外の値から```0```に変更した場合、ダウンタイムが発生する。 |
| パラメータグループ                   | なし               | パラメータグループの変更ではダウンタイムは発生しない。ただし、パラメータグループの変更をDBインスタンスに反映させる上で再起動が必要なため、ここでダウンタイムが発生する。 |
| セキュリティグループ                 | なし               |                                                              |
| マイナーバージョン自動アップグレード | なし               | エンジンバージョンの変更にはダウンタイムが発生するが、自動アップグレードの設定にはダウンタイムが発生しない。 |
| パフォーマンスインサイト             | 条件付きでなし     | パフォーマンスインサイトの有効化ではダウンタイムが発生しない。ただし、有効化のためにパラメータグループの```performance_schema```を有効化する必要がある。パラメータグループの変更をDBインスタンスに反映させる上で再起動が必要なため、ここでダウンタイムが発生する。 |

<br>

### フェイルオーバー

#### ・RDSのフェイルオーバーとは

スタンバイレプリカがプライマリインスタンスに昇格する。

  参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html

#### ・フェイルオーバーによるダウンタイムの最小化

DBインスタンスがマルチAZ構成の場合、以下の手順を用いてダウンタイムを最小化できる。

参考：https://lab.taf-jp.com/rds%E3%81%AE%E3%83%95%E3%82%A7%E3%82%A4%E3%83%AB%E3%82%AA%E3%83%BC%E3%83%90%E3%83%BC%E6%99%82%E3%81%AE%E6%8C%99%E5%8B%95%E3%82%92%E7%90%86%E8%A7%A3%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B/

（１）アプリケーションの接続先をプライマリーインスタンスにする。

（２）特定の条件下でのみ、フェイルオーバーが自動的に実行される。

参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html#Concepts.MultiAZ.Failover

（3）非AuroraのRDSでは条件に当てはまらない場合、リードレプリカを手動でフェイルオーバーさせる。

参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.MySQL.html#USER_UpgradeDBInstance.MySQL.ReducedDowntime

（4）フェイルオーバー時に約```1```～```2```分のダウンタイムが発生する。フェイルオーバーを用いない場合、DBインスタンスの再起動でダウンタイムが発生するが、これよりは時間が短いため、相対的にダウンタイムを短縮できる。

<br>

### イベント

コンソール画面ではイベントが英語で表示されているため、リファレンスも英語でイベントを探した方が良い。

参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Events.Messages.html

<br>

## 23. リージョン、ゾーン

### リージョン

#### ・リージョンとは

物理サーバーのあるデータセンターの地域名のこと。

#### ・グローバルサービス

グローバルサービスは、物理サーバーが世界中にあり、これらの間ではグローバルネットワークが構築されている。そのため、特定のリージョンに依存せずに、全てのリージョンと連携できる。

![edge-location](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/edge-location.png)

<br>

### ゾーン

#### ・アベイラビリティゾーンとは

リージョンは、さらに、各データセンターは物理的に独立したアベイラビリティゾーンというロケーションから構成されている。例えば、東京リージョンには、3つのアベイラビリティゾーンがある。AZの中に、VPCサブネットを作ることができ、そこにEC2を構築できる。

<br>

## 24. Route53

### Route53とは

クラウドDNSサーバーとして働く。リクエストされた完全修飾ドメイン名とEC2のグローバルIPアドレスをマッピングしている。

<br>

### 設定項目

#### ・概要

| 設定項目       | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| ホストゾーン   | ドメイン名を設定する。                                       |
| レコードセット | 名前解決時のルーティング方法を設定する。サブドメイン名を扱うことも可能。 |

<br>

### レコード

#### ・レコードとは

各ホストゾーンにドメインの名前解決方法を定義したレコードを設定する。

参考：https://docs.aws.amazon.com/ja_jp/Route53/latest/DeveloperGuide/welcome-dns-service.html#welcome-dns-service-how-to-configure

#### ・レコードタイプの種類

| レコードタイプ | 説明                                                         | 名前解決の仕組み                             | 補足                                            |
| -------------- | ------------------------------------------------------------ | -------------------------------------------- | ----------------------------------------------- |
| A              | リクエストを転送したいAWSリソースの、IPv4アドレスまたはDNS名を設定する。 | IPv4アドレスが返却される。                   |                                                 |
| AAAA           | リクエストを転送したいAWSリソースの、IPv6アドレスまたはDNS名を設定する。 | IPv6アドレスが返却される。                   |                                                 |
| CNAME          | リクエストを転送したい任意のサーバーのドメイン名を設定する。   | ドメイン名にリダイレクトする。               | 設定するドメイン名はAWSリソースでなくともよい。 |
| NS             | IPアドレスの問い合わせに応えられるDNSサーバーの名前が定義されている。 | DNSサーバーの名前が返却される。            |                                                 |
| MX             | リクエストを転送したいメールサーバーのドメイン名を設定する。   | メールサーバーのドメイン名が返却される。       |                                                 |
| TXT            | リクエストを転送したいサーバーのドメイン名に紐付けられた文字列を設定する。 | ドメイン名に紐づけられた文字列が返却される。 |                                                 |

#### ・AWSリソースのDNS名、ドメイン名、エンドポイント名

![URLと電子メールの構造](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/URLと電子メールの構造.png)

| 種別             | AWSリソース     | 例                                                           |
| ---------------- | --------------- | ------------------------------------------------------------ |
| DNS名            | ALB             | ```<ALB名>-<ランダムな文字列>.<リージョン>.elb.amazonaws.com``` |
|                  | EC2             | ```ec2-<パブリックIPをハイフン区切りにしたもの>.<リージョン>.compute.amazonaws.com``` |
| ドメイン名       | CloudFront      | ```<ランダムな文字列>.cloudfront.net```                      |
| エンドポイント名 | RDS（Aurora）   | ```<DBクラスター名><ランダムな文字列>.<リージョン>.rds.amazonaws.com.``` |
|                  | RDS（非Aurora） | ```<DBインスタンス名><ランダムな文字列>.<リージョン>.rds.amazonaws.com.``` |
|                  | S3              | ```<バケット名>.<リージョン>.amazonaws.com```                |

#### ・AWS以外でドメインを購入した場合

完全修飾ドメイン名の名前解決は、ドメインを購入したドメインレジストラで行われる。そのため、AWS以外（例：お名前ドットコム）でドメインを購入した場合、Route53のNSレコード値を、ドメインを実際に購入したサービスのドメインレジストラに登録する必要がある。これにより、ドメインレジストラに対してIPアドレスの問い合わせがあった場合は、Route53のNSレコード値がDNSサーバーにレスポンスされるようになる。DNSサーバーがRoute53に問い合わせると、Route53はDNSサーバーとして機能し、アプリケーションのIPアドレスをレスポンスする。

#### ・DNSキャッシュ

ルートサーバーは世界に13機しか存在しておらず、世界中の名前解決のリクエストを全て処理することは現実的に不可能である。そこで、IPアドレスとドメイン名の関係をキャッシュするプロキシサーバー（キャッシュDNSサーバー）が使用されている。基本的には、プロキシサーバーとDNSサーバーは区別されるが、Route53はプロキシサーバーとDNSサーバーの機能を両立している。

<br>

### リゾルバー

#### ・リゾルバーとは

要勉強。

<br>

### ルーティングポリシー

#### ・ルーティングポリシーとは

完全修飾ドメイン名の名前解決ルールを設定する。

参考：

- https://docs.aws.amazon.com/ja_jp/Route53/latest/DeveloperGuide/routing-policy.html
- https://zenn.dev/seyama/articles/02118b0914183e

#### ・シンプル

完全修飾ドメイン名に単一のIPアドレスを紐づけることができる。ドメインの名前解決では、単一のIPアドレスが返却される。

#### ・複数値回答

完全修飾ドメイン名に複数のIPアドレスを紐づけることができる。ドメインの名前解決では、正常なIPアドレスを均等に返却する。ヘルスチェック機能を持つラウンドロビン方式と言い換えても良い。

#### ・加重

完全修飾ドメイン名に複数のIPアドレスを紐づけることができる。ドメインの名前解決では、IPアドレスを指定した割合で返却する。

<br>

### Route53 + DNSサーバーによる名前解決

![Route53を含む名前解決の仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Route53を含む名前解決の仕組み.png)

（１）クライアントPCは、```www.example.com```にマッピングされるIPアドレスのキャッシュを検索する。キャッシュが無ければ、クライアントPCはドメイン名をキャッシュDNSサーバーに問い合わせる。

（２）キャッシュDNSサーバーは、IPアドレスのキャッシュを検索する。キャッシュが無ければ、キャッシュDNSサーバーはドメイン名をDNSサーバーに問い合わせる。

（３）Route53は、IPアドレスのキャッシュを検索する。キャッシュが無ければ、Route53はIPアドレスを検索する。また、キャッシュDNSサーバーにこれを返却する。


|      完全修飾ドメイン名      | Route53 |     IPアドレス      |
| :--------------------------: | :-----: | :-------------------: |
| ```http://www.example.com``` |    ⇄    | ```203.142.205.139``` |

（４）キャッシュDNSサーバーは、IPアドレスをNATに返却する。この時、IPアドレスのネットワーク間変換が起こる。

（５）NATは、IPアドレスをクライアントPCに返却する。

（６）クライアントPCは、返却されたIPアドレスを基にWebページにリクエストを送信する。

<br>

## 25. S3：Simple Storage Service

### S3とは

クラウド外付けストレージとして働く。S3に保存するCSSファイルや画像ファイルを管理できる。

<br>

### 設定項目

#### ・概要

| 設定項目             | 説明                       |
| -------------------- | -------------------------- |
| バケット             | バケットに関して設定する。 |
| バッチオペレーション |                            |
| アクセスアナライザー |                            |

#### ・プロパティ

| 設定項目                     | 説明 | 補足 |
| ---------------------------- | ---- | ---- |
| バージョニング               |      |      |
| サーバーアクセスのログ記録     |      |      |
| 静的サイトホスティング       |      |      |
| オブジェクトレベルのログ記録 |      |      |
| デフォルト暗号化             |      |      |
| オブジェクトのロック         |      |      |
| Transfer acceleration        |      |      |
| イベント                     |      |      |
| リクエスタ支払い             |      |      |

#### ・外部/内部ネットワークからのアクセス制限

| 設定項目                   | 説明                                                         | 補足                                                         |
| -------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ブロックパブリックアクセス | パブリックネットワークがS3にアクセスする時の許否を設定する。 | ・ブロックパブリックアクセスを無効にすると、項目ごとの方法（ACL、バケットポリシー、アクセスポイントポリシー）によるアクセスが許可される。もし他のAWSリソースからのアクセスを許可する場合は、ブロックパブリックアクセスを無効化した上でバケットポリシーに許可対象を定義するか、あるいはブロックパブリックアクセスでは拒否できないIAMポリシーをAWSリソースに設定する。<br>・ブロックパブリックアクセスを全て有効にすると、パブリックネットワークからの全アクセスを遮断できる。<br>・特定のオブジェクトで、アクセスコントロールリストを制限した場合、そのオブジェクトだけはパブリックアクセスにならない。 |
| バケットポリシー           | IAMユーザー（クロスアカウントも可）またはAWSリソースがS3へにアクセスするためのポリシーで管理する。 | ・ブロックパブリックアクセスを無効にしたうえで、IAMユーザー（クロスアカウントも可）やAWSリソースがS3にアクセスするために必要である。ただし代わりに、IAMポリシーをAWSリソースにアタッチすることでも、アクセスを許可できる。<br>参考：https://awesome-linus.com/2020/02/04/s3-bucket-public-access/<br>・ポリシーをアタッチできないCloudFrontやALBなどでは、自身へのアクセスログを生成するために必須である。 |
| アクセスコントロールリスト | IAMユーザー（クロスアカウントも可）がS3にアクセスする時の許否を設定する。 | ・バケットポリシーと機能が重複する。<br>・仮にバケット自体のブロックパブリックアクセスを無効化したとしても、特定のオブジェクトでアクセスコントロールリストを制限した場合、そのオブジェクトだけはパブリックアクセスにならない。 |
| CORSの設定                 |                                                              |                                                              |

<br>

### レスポンスヘッダー

#### ・レスポンスヘッダーの設定

レスポンスヘッダーに埋め込むHTTPヘッダーを、メタデータとして設定する。

| 設定可能なヘッダー              | 説明                                                         | 補足                                           |
| ------------------------------- | ------------------------------------------------------------ | ---------------------------------------------- |
| ETag                            | コンテンツの一意な識別子。ブラウザキャッシュの検証に用いられる。 | 全てのコンテンツにデフォルトで設定されている。 |
| Cache-Control                   | Expiresと同様に、ブラウザにおけるキャッシュの有効期限を設定する。 | 全てのコンテンツにデフォルトで設定されている。 |
| Content-Type                    | コンテンツのMIMEタイプを設定する。                           | 全てのコンテンツにデフォルトで設定されている。 |
| Expires                         | Cache-Controlと同様に、ブラウザにおけるキャッシュの有効期限を設定する。ただし、Cache-Controlの方が優先度が高い。 |                                                |
| Content-Disposition             |                                                              |                                                |
| Content-Encoding                |                                                              |                                                |
| x-amz-website-redirect-location | コンテンツのリダイレクト先を設定する。                       |                                                |

<br>

### バケットポリシーの例

#### ・S3のARNについて

ポリシーでは、S3のARでは、『```arn:aws:s3:::<バケット名>/*```』のように、最後にバックスラッシュアスタリスクが必要。

#### ・ALBのアクセスログの保存を許可

パブリックアクセスが無効化されたS3に対して、ALBへのアクセスログを保存したい場合、バケットポリシーを設定する必要がある。バケットポリシーには、ALBからS3へのログ書き込み権限を実装する。『```"AWS": "arn:aws:iam::582318560864:root"```』では、```582318560864```はALBアカウントIDと呼ばれ、リージョンごとに値が決まっている。これは、東京リージョンのアカウントIDである。その他のリージョンのアカウントIDについては、以下のリンク先を参考にせよ。

参考：https://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/application/load-balancer-access-logs.html#access-logging-bucket-permissions

**＊実装例＊**

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::582318560864:root"
      },
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::<バケット名>/*"
    }
  ]
}
```

#### ・CloudFrontのファイル読み出しを許可

パブリックアクセスが無効化されたS3に対して、CloudFrontからのルーティングで静的ファイルを読み出したい場合、バケットポリシーを設定する必要がある。

**＊実装例＊**

```bash
{
  "Version": "2008-10-17",
  "Id": "PolicyForCloudFrontPrivateContent",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity <OAIのID番号>"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<バケット名>/*"
    }
  ]
}
```

#### ・CloudFrontのアクセスログの保存を許可

2020-10-08時点の仕様では、パブリックアクセスが無効化されたS3に対して、CloudFrontへのアクセスログを保存することはできない。よって、危険ではあるが、パブリックアクセスを有効化する必要がある。

```bash
// ポリシーは不要
```

#### ・Lambdaからのアクセスを許可

バケットポリシーは不要である。代わりに、AWS管理ポリシーの『```AWSLambdaExecute```』がアタッチされたロールをLambdaにアタッチする必要がある。このポリシーには、S3へのアクセス権限の他、CloudWatchログにログを生成するための権限が設定されている。

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:*"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::*"
    }
  ]
}
```

#### ・特定のIPアドレスからのアクセスを許可

パブリックネットワーク上の特定のIPアドレスからのアクセスを許可したい場合、そのIPアドレスをポリシーに設定する必要がある。

```bash
{
  "Version": "2012-10-17",
  "Id": "S3PolicyId1",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<バケット名>/*",
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": "<IPアドレス>/32"
        }
      }
    }
  ]
}
```

<br>

### CORS設定

#### ・指定したドメインからのGET送信を許可

```bash
[
  {
    "AllowedHeaders": [
      "Content-*"
    ],
    "AllowedMethods": [
      "GET"
    ],
    "AllowedOrigins": [
      "https://example.jp"
    ],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3600
  }
]
```

<br>

### 署名付きURL

#### ・署名付きURLとは

認証認可情報をパラメータに持つURLのこと。S3では、署名付きURLを発行し、S3へのアクセス権限を外部のユーザーに一時的に付与する。

参考：https://atmarkit.itmedia.co.jp/ait/articles/2107/15/news009.html

<br>

### CLI

#### ・バケット内ファイルを表示

**＊例＊**

指定したバケット内のファイル名を表示する。

```bash
$ aws s3 ls s3://<バケット名>
```

#### ・バケット内容量を合計

**＊例＊**

指定したバケット内のファイル容量を合計する。

```bash
$ aws s3 ls s3://<バケット名> --summarize --recursive --human-readable
```

<br>

## 26. Security Group

### Security Groupとは

アプリケーションのクラウドパケットフィルタリング型ファイアウォールとして働く。インバウンド通信（プライベートネットワーク向き通信）では、プロトコルや受信元IPアドレスを設定でき、アウトバウンド通信（グローバルネットワーク向き通信）では、プロトコルや送信先プロトコルを設定できる。

<br>

### 設定項目

#### ・概要

インバウンドルールとアウトバウンドルールを設定できる。

<br>

### インバウンドルール

#### ・パケットフィルタリング型ファイアウォール

パケットのヘッダ情報に記載された送信元IPアドレスやポート番号などによって、パケットを許可するべきかどうかを決定する。速度を重視する場合はこちら。ファイアウォールとWebサーバーの間には、NATルータやNAPTルータが設置されている。これらによる送信元プライベートIPアドレスから送信元グローバルIPアドレスへの変換についても参考にせよ。

![パケットフィルタリング](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/パケットフィルタリング.gif)

#### ・セキュリティグループIDの紐付け

ソースに対して、セキュリティグループIDを設定した場合、そのセキュリティグループがアタッチされているENIと、このENIに紐付けられたリソースからのトラフィックを許可できる。リソースのIPアドレスが動的に変化する場合、有効な方法である。

参考：https://docs.aws.amazon.com/ja_jp/vpc/latest/userguide/VPC_SecurityGroups.html#DefaultSecurityGroup

#### ・アプリケーションEC2の例

ALBに割り振られる可能性のあるIPアドレスを許可するために、ALBのSecurity GroupのID、またはサブネットのIPアドレス範囲を設定する。

| タイプ | プロトコル | ポート    | ソース                       | 説明                        |
| ------ | ---------- | --------- | ---------------------------- | --------------------------- |
| HTTP   | TCP        | ```80```  | ALBのSecurity Group ID       | HTTP access from ALB        |
| HTTPS  | TCP        | ```443``` | 踏み台EC2のSecurity Group ID | SSH access from bastion EC2 |

#### ・踏み台EC2の例

| タイプ | プロトコル | ポート   | ソース                     | 説明                             |
| ------ | ---------- | -------- | -------------------------- | -------------------------------- |
| SSH    | TCP        | ```22``` | 社内のグローバルIPアドレス | SSH access from global ip address |

#### ・EFSの例

EC2に割り振られる可能性のあるIPアドレスを許可するために、EC2のSecurity GroupのID、またはサブネットのIPアドレス範囲を設定する。

| タイプ | プロトコル | ポート     | ソース                                 | 説明                    |
| ------ | ---------- | ---------- | -------------------------------------- | ----------------------- |
| NFS    | TCP        | ```2049``` | アプリケーションEC2のSecurity Group ID | NFS access from app EC2 |

#### ・RDSの例

EC2に割り振られる可能性のあるIPアドレスを許可するために、EC2のSecurity GroupのID、またはサブネットのIPアドレス範囲を設定する。

| タイプ       | プロトコル | ポート     | ソース                                 | 説明                      |
| ------------ | ---------- | ---------- | -------------------------------------- | ------------------------- |
| MYSQL/Aurora | TCP        | ```3306``` | アプリケーションEC2のSecurity Group ID | MYSQL access from app EC2 |

#### ・Redisの例

EC2に割り振られる可能性のあるIPアドレスを許可するために、EC2のSecurity GroupのID、またはサブネットのIPアドレス範囲を設定する。

| タイプ      | プロトコル | ポート     | ソース                                 | 説明                    |
| ----------- | ---------- | ---------- | -------------------------------------- | ----------------------- |
| カスタムTCP | TCP        | ```6379``` | アプリケーションEC2のSecurity Group ID | TCP access from app EC2 |

#### ・ALBの例

CloudFrontと連携する場合、CloudFrontに割り振られる可能性のあるIPアドレスを許可するために、全てのIPアドレスを許可する。その代わりに、CloudFrontにWAFを紐付け、ALBの前でIPアドレスを制限するようにする。CloudFrontとは連携しない場合、ALBのSecurity GroupでIPアドレスを制限するようにする。

| タイプ | プロトコル | ポート    | ソース          | 説明                         |      |
| ------ | ---------- | --------- | --------------- | ---------------------------- | ---- |
| HTTP   | TCP        | ```80```  | ```0.0.0.0/0``` | HTTP access from CloudFront  |      |
| HTTPS  | TCP        | ```443``` | ```0.0.0.0/0``` | HTTPS access from CloudFront |      |

<br>

### アウトバウンドルール

#### ・任意AWSリソースの例

| タイプ               | プロトコル | ポート | 送信先          | 説明        |
| -------------------- | ---------- | ------ | --------------- | ----------- |
| すべてのトラフィック | すべて     | すべて | ```0.0.0.0/0``` | Full access |

<br>

## 27. SES：Simple Email Service

### SESとは

クラウドメールサーバーとして働く。メール受信をトリガーとして、アクションを実行する。

<br>

### 設定項目

![SESとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SESとは.png)

#### ・概要

| 設定項目           | 説明                                                         | 補足                                                         |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Domain             | SESのドメイン名を設定する。                                  | 設定したドメイン名には、『```10 inbound-smtp.us-east-1.amazonaws.com```』というMXレコードタイプの値が紐付く。 |
| Email Addresses    | 送信先として認証するメールアドレスを設定する。設定するとAWSからメールが届くので、指定されたリンクをクリックする。 | Sandboxモードの時だけ機能する。                              |
| Sending Statistics | SESで収集されたデータをメトリクスで確認できる。              | ```Request Increased Sending Limits```のリンクにて、Sandboxモードの解除を申請できる。 |
| SMTP Settings      | SMTP-AUTHの接続情報を確認できる。                            | アプリケーションの```25```番ポートは送信制限があるため、```465```番ポートを用いる。これに合わせて、SESも受信で```465```番ポートを用いるようにする。 |
| Rule Sets          | メールの受信したトリガーとして実行するアクションを設定できる。 |                                                              |
| IP Address Filters |                                                              |                                                              |

#### ・Rule Sets

| 設定項目 | 説明                                                         |
| -------- | ------------------------------------------------------------ |
| Recipiet | 受信したメールアドレスで、何の宛先の時にこれを許可するかを設定する。 |
| Actions  | 受信を許可した後に、これをトリガーとして実行するアクションを設定する。 |

<br>

### 仕様上の制約

#### ・構築リージョンの制約

SESは連携するAWSリソースと同じリージョンに構築しなければならない。

#### ・Sandboxモードの解除

SESはデフォルトではSandboxモードになっている。Sandboxモードでは以下の制限がかかっており。サポートセンターに解除申請が必要である。

| 制限     | 説明                                          |
| -------- | --------------------------------------------- |
| 送信制限 | SESで認証したメールアドレスのみに送信できる。 |
| 受信制限 | 1日に200メールのみ受信できる。                |

<br>

### SMTP-AUTH

#### ・AWSにおけるSMTP-AUTHの仕組み

一般的なSMTP-AUTHでは、クライアントユーザーの認証が必要である。同様にして、AWSでもこれが必要であり、IAMユーザーを用いてこれを実現する。送信元となるアプリケーションにIAMユーザーを紐付け、このIAMユーザーにはユーザー名とパスワードを設定する。アプリケーションがSESを介してメールを送信する時、アプリケーションに対して、SESがユーザー名とパスワードを用いた認証を実行する。ユーザー名とパスワードは後から確認できないため、メモしておくこと。SMTP-AUTHの仕組みについては、以下のリンク先を参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/network/network_osi_tcp_model.html?h=smtp

<br>

## 28. SM：Systems Manager

### パラメータストア

#### ・パラメータストアとは

機密性の高い値を暗号化した状態で管理し、復号化した上で、環境変数としてEC2/ECS/EKSに出力する。Kubernetesのシークレットの概念が取り入れられている。パラメータのタイプは全て『SecureString』とした方が良い。

#### ・KMSを用いた暗号化と復号化

![parameter-store_kms](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/parameter-store_kms.png)

パラメータストアで管理される環境変数はKMSによって暗号化されており、EC2/ECS/EKSで参照する時に復号化される。

参考：

- https://docs.aws.amazon.com/ja_jp/kms/latest/developerguide/services-parameter-store.html

- https://note.com/hamaa_affix_tech/n/n02eb412d0327


#### ・命名規則

SMパラメータ名は、```/<リソース名>/<環境変数名>```とするとわかりやすい。

<br>

### セッションマネージャー

#### ・セッションマネージャーとは

EC2/ECSへのセッションを管理する。

参考：https://docs.aws.amazon.com/ja_jp/systems-manager/latest/userguide/session-manager.html#session-manager-features

#### ・AWSセッション

TLS、Sigv4、KMSを用いて暗号化された接続のこと。

参考：：https://docs.aws.amazon.com/ja_jp/systems-manager/latest/userguide/session-manager.html#what-is-a-session

#### ・同時AWSセッションの上限数

同時AWSセッションの上限数は2つまでである。以下のようなエラーが出た時は、セッション途中のユーザーが他ににいるか、過去のセッションを終了できていない可能性がある。セッションマネージャーで既存のセッションを終了できる。

```bash
# ECS Execの場合
An error occurred (ClientException) when calling the ExecuteCommand operation: Unable to start new execute sessions because the maximum session limit of 2 has been reached.
```

<br>

## 29. SNS：Simple Notification Service

### SNSとは

パブリッシャーから発信されたメッセージをエンドポイントで受信し、サブスクライバーに転送するAWSリソース。

![SNSとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SNSとは.png)

<br>

### 設定項目

#### ・概要

| 設定項目           | 説明                                                 |
| ------------------ | ---------------------------------------------------- |
| トピック           | 複数のサブスクリプションをグループ化したもの。       |
| サブスクリプション | エンドポイントで受信するメッセージの種類を設定する。 |

#### ・トピック

| 設定項目                 | 説明                                                         |
| ------------------------ | ------------------------------------------------------------ |
| サブスクリプション       | サブスクリプションを登録する。                               |
| アクセスポリシー         | トピックへのアクセス権限を設定する。                         |
| 配信再試行ポリシー       | サブスクリプションのHTTP/Sエンドポイントが失敗した時のリトライ方法を設定する。<br>参考：https://docs.aws.amazon.com/ja_jp/sns/latest/dg/sns-message-delivery-retries.html |
| 配信ステータスのログ記録 | サブスクリプションへの発信のログをCloudWatchLogsに転送するように設定する。 |
| 暗号化                   |                                                              |

#### ・サブスクリプション

| メッセージの種類      | 転送先                | 補足                                                         |
| --------------------- | --------------------- | ------------------------------------------------------------ |
| Kinesis Data Firehose | Kinesis Data Firehose |                                                              |
| SQS                   | SQS                   |                                                              |
| Lambda                | Lambda                |                                                              |
| Eメール               | 任意のメールアドレス  |                                                              |
| HTTP/S                | 任意のドメイン名      | Chatbotのドメイン名は『```https://global.sns-api.chatbot.amazonaws.com```』 |
| JSON形式のメール      | 任意のメールアドレス  |                                                              |
| SMS                   | SMS                   | 受信者の電話番号を設定する。                                 |

<br>

## 30. SQS：Simple Queue Service

### SQSとは

![AmazonSQSとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SQS.jpeg)

クラウドメッセージキューとして働く。パブリッシャーが送信したメッセージは、一旦SQSに追加される。その後、サブスクライバーは、SQSに対してリクエストを送信し、メッセージを取り出す。異なるVPC間でも、メッセージキューを同期できる。

<br>

### 設定項目

#### ・SQSの種類

| 設定項目         | 説明                                                         |
| ---------------- | ------------------------------------------------------------ |
| スタンダード方式 | サブスクライバーの取得レスポンスを待たずに、次のキューを非同期的に転送する。 |
| FIFO方式         | サブスクライバーの取得レスポンスを待ち、キューを同期的に転送する。 |

<br>

### CLI

#### ・キューURLを取得

キューのURLを取得する。

```bash
$ aws sqs get-queue-url --queue-name <キュー名>
```

#### ・キューに受信リクエストを送信

キューに受信リクエストを送信し、メッセージを受信する。

```bash
$ SQS_QUEUE_URL=$(aws sqs get-queue-url --queue-name <キュー名>)

$ aws sqs receive-message --queue-url ${SQS_QUEUE_URL}
```

キューに受信リクエストを送信し、メッセージを受信する。また、メッセージの内容をファイルに書き出す。

```bash
$ SQS_QUEUE_URL=$(aws sqs get-queue-url --queue-name <キュー名>)

$ aws sqs receive-message --queue-url ${SQS_QUEUE_URL} > receiveOutput.json
```

```bash
{
    "Messages": [
        {
            "Body": "<メッセージの内容>", 
            "ReceiptHandle": "AQEBUo4y+XVuRSe4jMv0QM6Ob1viUnPbZ64WI01+Kmj6erhv192m80m+wgyob+zBgL4OMT+bps4KR/q5WK+W3tnno6cCFuwKGRM4OQGM9omMkK1F+ZwBC49hbl7UlzqAqcSrHfxyDo5x+xEyrEyL+sFK2MxNV6d0mF+7WxXTboyAu7JxIiKLG6cUlkhWfk3W4/Kghagy5erwRhwTaKtmF+7hw3Y99b55JLFTrZjW+/Jrq9awLCedce0kBQ3d2+7pnlpEcoY42+7T1dRI2s7um+nj5TIUpx2oSd9BWBHCjd8UQjmyye645asrWMAl1VCvHZrHRIG/v3vgq776e1mmi9pGxN96IW1aDZCQ1CSeqTFASe4=", 
            "MD5OfBody": "6699d5711c044a109a6aff9fc193aada", 
            "MessageId": "*****"
        }
    ]
 }
```

<br>

## 31. STS：Security Token Service

### STSとは

AWSリソースに一時的にアクセスできる認証情報（アクセスキー、シークレットアクセスキー、セッショントークン）を発行する。この認証情報は、一時的なアカウント情報として使用できる。

![STS](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/STS.jpg)

<br>

### セットアップ

#### 1. IAMロールに信頼ポリシーをアタッチ

必要なポリシーが設定されたIAMロールを構築する。その時信頼ポリシーでは、ユーザーの```ARN```を信頼されたエンティティとして設定しておく。これにより、そのユーザーに対して、ロールをアタッチできるようになる。

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::<アカウントID>:user/<ユーザー名>"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "<適当な文字列>"
        }
      }
    }
  ]
}
```

#### 2. ロールを引き受けたアカウント情報をリクエスト

信頼されたエンティティ（ユーザー）から、STS（```https://sts.amazonaws.com```）に対して、ロールのアタッチをリクエストする。

```bash
#!/bin/bash

set -xeuo pipefail
set -u

# 事前に環境変数にインフラ環境名を代入する。
case $ENV in
    "dev")
        aws_account_id="<作業環境アカウントID>"
        aws_access_key_id="<作業環境アクセスキーID>"
        aws_secret_access_key="<作業環境シークレットアクセスキー>"
        aws_iam_role_external_id="<信頼ポリシーに設定した外部ID>"
    ;;
    "stg")
        aws_account_id="<ステージング環境アカウントID>"
        aws_access_key_id="<ステージング環境アクセスキーID>"
        aws_secret_access_key="<ステージング環境シークレットアクセスキー>"
        aws_iam_role_external_id="<信頼ポリシーに設定した外部ID>"
    ;;
    "prd")
        aws_account_id="<本番環境アカウントID>"
        aws_access_key_id="<本番環境アクセスキーID>"
        aws_secret_access_key="<本番環境シークレットアクセスキー>"
        aws_iam_role_external_id="<信頼ポリシーに設定した外部ID>"
    ;;
    *)
        echo "The parameter ${ENV} is invalid."
        exit 1
    ;;
esac

# 信頼されたエンティティのアカウント情報を設定する。
aws configure set aws_access_key_id "$aws_account_id"
aws configure set aws_secret_access_key "$aws_secret_access_key"
aws configure set aws_default_region "ap-northeast-1"

# https://sts.amazonaws.com に、ロールのアタッチをリクエストする。
aws_sts_credentials="$(aws sts assume-role \
  --role-arn "arn:aws:iam::${aws_access_key_id}:role/${ENV}-<アタッチしたいIAMロール名>" \
  --role-session-name "<任意のセッション名>" \
  --external-id "$aws_iam_role_external_id" \
  --duration-seconds "<セッションの有効秒数>" \
  --query "Credentials" \
  --output "json")"
```

STSへのリクエストの結果、ロールがアタッチされた新しいIAMユーザー情報を取得できる。この情報には有効秒数が存在し、期限が過ぎると新しいIAMユーザーになる。秒数の最大値は、該当するIAMロールの概要の最大セッション時間から変更できる。

![AssumeRole](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/AssumeRole.png)

レスポンスされるデータは以下の通り。

```bash
{
  "AssumeRoleUser": {
    "AssumedRoleId": "<セッションID>:<セッション名>",
    "Arn": "arn:aws:sts:<新しいアカウントID>:assumed-role/<IAMロール名>/<セッション名>"
  },
  "Credentials": {
    "SecretAccessKey": "<シークレットアクセスキー>",
    "SessionToken": "<セッショントークン文字列>",
    "Expiration": "<セッションの期限>",
    "AccessKeyId": "<アクセスキーID>"
  }
}
```

#### 3-1. アカウント情報を取得（１）

jqを用いて、レスポンスされたJSONデータからアカウント情報を抽出する。環境変数として出力し、使用できるようにする。あるいは、AWSの```credentials```ファイルを作成してもよい。

参考：https://stedolan.github.io/jq/


```bash
#!/bin/bash

cat << EOF > assumed_user.sh
export AWS_ACCESS_KEY_ID="$(echo "$aws_sts_credentials" | jq -r ".AccessKeyId")"
export AWS_SECRET_ACCESS_KEY="$(echo "$aws_sts_credentials" | jq -r ".SecretAccessKey")"
export AWS_SESSION_TOKEN="$(echo "$aws_sts_credentials" | jq -r ".SessionToken")"
export AWS_ACCOUNT_ID="$aws_account_id"
export AWS_DEFAULT_REGION="ap-northeast-1"
EOF
```

#### 3-2. アカウント情報を取得（２）

jqを用いて、レスポンスされたJSONデータからアカウント情報を抽出する。ロールを引き受けた新しいアカウントの情報を、```credentials```ファイルに書き込む。

```bash
#!/bin/bash

aws configure --profile ${ENV}-repository << EOF
$(echo "$aws_sts_credentials" | jq -r ".AccessKeyId")
$(echo "$aws_sts_credentials" | jq -r ".SecretAccessKey")
ap-northeast-1
json
EOF

echo aws_session_token = $(echo "$aws_sts_credentials" | jq -r ".SessionToken") >> ~/.aws/credentials
```

#### 4. 接続確認

ロールを引き受けた新しいアカウントを用いて、AWSリソースに接続できるかを確認する。アカウント情報の取得方法として```credentials```ファイルの作成を選んだ場合、```profile```オプションが必要である。

```bash
#!/bin/bash

# 3-2を選んだ場合、credentialsファイルを参照するオプションが必要がある。
aws s3 ls --profile <プロファイル名>
2020-xx-xx xx:xx:xx <tfstateファイルが管理されるバケット名>
```

<br>

## 32. Step Functions

### Step Functionsとは

AWSサービスを組み合わせて、イベント駆動型アプリケーションを構築できる。

<br>

### AWSリソースのAPIコール

#### ・APIコールできるリソース

参考：https://docs.aws.amazon.com/step-functions/latest/dg/connect-supported-services.html

#### ・Lambda

**＊実装例＊**

```bash
{
  "StartAt": "Call Lambda",
  "States": {
    "Call Lambda": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke.waitForTaskToken",
      "Parameters": {
        "FunctionName": "arn:aws:lambda:ap-northeast-1:*****:foo-function:1"
      },
      "Retry": [
        {
          "ErrorEquals": [
            "<リトライの対象とするエラー>"
          ],
          "MaxAttempts": 0
        }
      ],
      "End": true,
      "Comment": "The state that call Lambda"
    }
  }
}
```

<br>

### API Gatewayとの連携

#### ・注意が必要な項目

参考：https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-api-gateway.html

|              | 設定値         | 補足                        |
| ------------ | -------------- | --------------------------- |
| HTTPメソッド | POST           | GETメソッドでは機能しない。 |
| アクション   | StartExecution |                             |
| 実行ロール   | IAMロールのARN | StartExecutionを許可する。  |

```bash
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "states:StartExecution",
            "Resource": "arn:aws:states:*:*****:stateMachine:*"
        }
    ]
}
```

#### ・レスポンス構造

以下がレスポンスされれば、API GatewayがStepFunctionsをコールできたことになる。

```bash
{
    "executionArn": "arn:aws:states:ap-northeast-1:*****:execution:prd-foo-doing-state-machine:*****",
    "startDate": 1.638244285498E9
}
```

<br>

## 33. VPC：Virtual Private Cloud

### VPCとは

クラウドプライベートネットワークとして働く。プライベートIPアドレスが割り当てられた、VPCと呼ばれるプライベートネットワークを仮想的に構築できる。異なるアベイラビリティゾーンに渡ってEC2を立ち上げることによって、クラウドサーバーをデュアル化することできる。VPCのパケット通信の仕組みについては、以下のリンク先を参考にせよ。

参考：https://pages.awscloud.com/rs/112-TZM-766/images/AWS-08_AWS_Summit_Online_2020_NET01.pdf

![VPCが提供できるネットワークの範囲](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VPCが提供できるネットワークの範囲.png)

<br>

### Internet Gateway、NAT Gateway

![InternetGatewayとNATGateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/InternetGatewayとNATGateway.png)

#### ・Internet Gatewayとは

VPCの出入り口に設置され、グローバルネットワークとプライベートネットワーク間（ここではVPC）におけるNAT（静的NAT）の機能を持つ。1つのパブリックIPに対して、1つのEC2のプライベートIPを紐付けられる。NAT（静的NAT）については、以下のリンク先を参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/network/network_osi_tcp_model.html

#### ・NAT Gatewayとは

NAPT（動的NAT）の機能を持つ。1つのパブリックIPに対して、複数のEC2のプライベートIPを紐付けられる。パブリックサブネットに置き、プライベートサブネットのEC2からのレスポンスを受け付ける。NAPT（動的NAT）については、以下のリンク先を参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/network/network_osi_tcp_model.html

#### ・比較表


|              | Internet Gateway                                             | NAT Gateway            |
| :----------- | :----------------------------------------------------------- | :--------------------- |
| **機能**     | グローバルネットワークとプライベートネットワーク間（ここではVPC）におけるNAT（静的NAT） | NAPT（動的NAT）        |
| **設置場所** | VPC上                                                        | パブリックサブネット内 |

<br>

### Route Table（= マッピングテーブル）

![route-table](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/route-table.png)

#### ・ルートテーブルとは

クラウドルータのマッピングテーブルとして働く。ルータについては、別ノートのNATとNAPTを参考にせよ。

| Destination（プライベートIPの範囲） |                Target                 |
| :---------------------------------: | :-----------------------------------: |
|          ```xx.x.x.x/xx```          | Destinationの範囲内だった場合の送信先 |

#### ・ルートテーブルの種類

| テーブル名                   | 説明                                                         |
| ---------------------- | ------------------------------------------------------------ |
| メインルートテーブル   | VPCの構築時に自動で構築される。どのルートテーブルにも紐付けられていないサブネットのルーティングを設定する。 |
| カスタムルートテーブル | 特定のサブネットのルーティングを設定する。                   |

#### ・例1

上の図中で、サブネット2にはルートテーブル1が紐付けられている。サブネット2内のEC2の送信先のプライベートIPアドレスが、```10.0.0.0/16```の範囲内にあれば、インバウンド通信と見なし、local（VPC内の他サブネット）を送信先に選び、範囲外にあれば通信を破棄する。

| Destination（プライベートIPアドレス範囲） |  Target  |
| :---------------------------------------: | :------: |
|             ```10.0.0.0/16```             |  local   |
|            指定範囲以外の場合             | 通信破棄 |

#### ・例2

上の図中で、サブネット3にはルートテーブル2が紐付けられている。サブネット3内のEC2の送信先のプライベートIPアドレスが、```10.0.0.0/16```の範囲内にあれば、インバウンド通信と見なし、local（VPC内の他サブネット）を送信先に選び、```0.0.0.0/0```（local以外の全IPアドレス）の範囲内にあれば、アウトバウンド通信と見なし、インターネットゲートウェイを送信先に選ぶ。

| Destination（プライベートIPアドレス範囲） |      Target      |
| :---------------------------------------: | :--------------: |
|             ```10.0.0.0/16```             |      local       |
|              ```0.0.0.0/0```              | Internet Gateway |

<br>

### Network ACL：Network Access  Control List

![network-acl](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network-acl.png)

#### ・Network ACLとは

サブネットのクラウドパケットフィルタリング型ファイアウォールとして働く。ルートテーブルとサブネットの間に設置され、双方向のインバウンドルールとアウトバウンドルールを決定する。

#### ・ACLルール

ルールは上から順に適用される。例えば、インバウンドルールが以下だった場合、ルール100が最初に適用され、サブネットに対する、全IPアドレス（```0.0.0.0/0```）からのインバウンド通信を許可していることになる。

| ルール # | タイプ                | プロトコル | ポート範囲 / ICMP タイプ | ソース    | 許可 / 拒否 |
| -------- | --------------------- | ---------- | ------------------------ | --------- | ----------- |
| 100      | すべての トラフィック | すべて     | すべて                   | 0.0.0.0/0 | ALLOW       |
| *        | すべての トラフィック | すべて     | すべて                   | 0.0.0.0/0 | DENY        |

<br>

### VPCサブネット

クラウドプライベートネットワークにおけるセグメントとして働く。

#### ・パブリックサブネットとは

非武装地帯に相当する。攻撃の影響が内部ネットワークに広がる可能性を防ぐために、外部から直接リクエストを受ける、

#### ・プライベートサブネットとは

内部ネットワークに相当する。外部から直接リクエストを受けずにレスポンスを返せるように、内のNATを経由させる必要がある。

![public-subnet_private-subnet](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/public-subnet_private-subnet.png)

#### ・サブネットの種類

サブネットには、役割ごとにいくつか種類がある。

| 名前                            | 役割                                    |
| ------------------------------- | --------------------------------------- |
| Public subnet (Frontend Subnet) | NATGatewayを配置する。                  |
| Private app subnet              | アプリケーション、Nginxなどを配置する。 |
| Private datastore subnet        | RDS、Redisなどを配置する                |

![subnet-types](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/subnet-types.png)

<br>

### VPCエンドポイント

![VPCエンドポイント](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VPCエンドポイント.png)

#### ・概要

VPCのプライベートサブネット内のリソースが、VPC外のリソースに対して、アウトバウンド通信を実行できるようにする。Gateway型とInterface型がある。VPCエンドポイントを用いない場合、プライベートサブネット内からのアウトバウンド通信には、インターネットゲートウェイとNAT Gatewayを用いる必要がある。

**＊例＊**

ECS Fargateをプライベートサブネットに置いた場合、ECS FargateからVPC外にあるAWSリソースに対するアウトバウンド通信のために必要。（例：CloudWatchログ、ECR、S3、SSM）

#### ・メリット

インターネットゲートウェイとNAT Gatewayの代わりに、VPCエンドポイントを用いると、料金が少しだけ安くなり、また、VPC外のリソースとの通信がより安全になる。

#### ・タイプ

| タイプ      | 説明                                                         | リソース例                       |
| ----------- | ------------------------------------------------------------ | -------------------------------- |
| Interface型 | プライベートリンクともいう。プライベートIPアドレスを持つENIとして機能し、AWSリソースからアウトバウンド通信を受信する。 | S3、DynamoDB以外の全てのリソース |
| Gateway型   | ルートテーブルにおける定義に従う。VPCエンドポイントとして機能し、AWSリソースからアウトバウンド通信を受信する。 | S3、DynamoDBのみ                 |

<br>

### ENI：Elastic Network Interface

#### ・ENIとは

クラウドネットワークインターフェースとして働く。物理ネットワークにおけるNICについては以下を参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/network/network_osi_tcp_model.html

#### ・紐付けられるリソース

| リソースの種類    | 役割                                                         | 補足                                                         |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ALB               | ENIに紐付けられたパブリックIPアドレスをALBに割り当てられる。 |                                                              |
| EC2               | ENIに紐付けられたパブリックIPアドレスがEC2に割り当てられる。 | 参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/using-eni.html#eni-basics |
| Fargate環境のEC2  | 明言されていないため推測ではあるが、ENIに紐付けられたlocalインターフェースがFargate環境でコンテナのホストとなるEC2インスタンスに割り当てられる。 | Fargate環境のホストがEC2とは明言されていない。<br>参考：https://aws.amazon.com/jp/blogs/news/under-the-hood-fargate-data-plane/ |
| Elastic IP        | ENIにElastic IPアドレスが紐付けられる。このENIを他のAWSリソースに紐付けることにより、ENIを介して、Elastic IPを紐付けられる。 | 参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/using-eni.html#managing-network-interface-ip-addresses |
| GlobalAccelerator |                                                              |                                                              |
| NAT Gateway       | ENIに紐付けられたパブリックIPアドレスがNAT Gatewayに割り当てられる。 |                                                              |
| RDS               |                                                              |                                                              |
| Security Group    | ENIにセキュリティグループが紐付けれる。このENIを他のAWSリソースに紐付けることにより、ENIを介して、セキュリティグループを紐付けられる。 |                                                              |
| VPCエンドポイント | Interface型のVPCエンドポイントとして機能する。               |                                                              |

<br>

### IPアドレス

#### ・種類

| IPアドレスの種類                                   | 説明                                          |
| -------------------------------------------------- | --------------------------------------------- |
| 自動割り当てパブリックIPアドレス（動的IPアドレス） | 動的なIPアドレスで、EC2の再構築後に変化する。 |
| Elastic IP（静的IPアドレス）                       | 静的なIPアドレスで、再構築後も保持される。    |

#### ・紐付け

| 種類                     | 補足                                                         |
| ------------------------ | ------------------------------------------------------------ |
| EC2との紐付け | 非推奨の方法である。<br>参考：https://docs.aws.amazon.com/ja_jp/vpc/latest/userguide/vpc-eips.html#vpc-eip-overview |
| ENIとの紐付け          | 推奨される方法である。<br>参考：https://docs.aws.amazon.com/ja_jp/vpc/latest/userguide/vpc-eips.html#vpc-eip-overview |

<br>

### VPCのCIDR設計の手順

1つのVPC内には複数のサブネットが入る。そのため、サブネットのIPアドレス範囲は、サブネットの個数だけ含めなければならない。また、VPCがもつIPアドレス範囲から、VPC内の各AWSリソースにIPアドレスを割り当てていかなければならない。VPC内でIPアドレスが枯渇しないように、以下の手順で、割り当てを考える。

参考：https://note.com/takashi_sakurada/n/n502fb0299938

（１）RFC1918の推奨する```10.0.0.0/8```、```172.16.0.0/12```、```192.168.0.0/16```を用いる。VPCのCIDR設計では、これらの範囲に含まれるIPアドレスを用いるようにする。

| RFC1918推奨のIPアドレス範囲 | IPアドレス                                | 個数     |
| --------------------------- | ----------------------------------------- | -------- |
| ```10.0.0.0/8```            | ```10.0.0.0```  ~ ```10.255.255.255```    | 16777216 |
| ```172.16.0.0/12```         | ```172.16.0.0``` ~ ```172.31.255.255```   | 1048576  |
| ```192.168.0.0/16```        | ```192.168.0.0``` ~ ```192.168.255.255``` | 65536    |

（２）あらかじめ、会社内の全てのアプリケーションのCIDRをスプレッドシートなどで一括で管理しておく。

（３）各アプリケーション間でTransit Gatewayやピアリング接続を実行する可能性がある場合は。拡張性を考慮して、アプリケーション間のCIDRは重ならないようにしておく必要がある。例えば、以前に開発したアプリケーションが```10.200.47.0```までを用いていた場合、```10.200.48.0```から使用を始める。また、VPCで許可されるIPアドレスの個数は最多65536個（```/16```）で最少16個（```/28```）であり、実際は512個（```/23```）ほどあれば問題ないため、```10.200.48.0/23```を設定する。

参考：https://docs.aws.amazon.com/ja_jp/vpc/latest/userguide/VPC_Subnets.html#SubnetRouting

（４）VPCのIPアドレスをパブリックサブネットとプライベートサブネットを割り当てる。パブリックサブネットとプライベートサブネットを冗長化する場合は、VPCのIPアドレス数をサブネット数で割って各サブネットのIPアドレス数を算出し、CIDRブロックを設定する。例えば、VPCのサブネットマスクを```/16``` としている場合は、各サブネットのサブネットマスクは```/24```とする。一方で、VPCを```/23```としている場合は、各サブネットは```/27```とする。また、各サブネットのCIDRブロックを同じにする必要はなく、アプリケーションが稼働するサブネットにIPアドレス数がやや多くなるようにし、その分DBの稼働するサブネットのIPアドレスを少なくするような設計でもよい。

参考：https://d0.awsstatic.com/events/jp/2017/summit/slide/D2T3-5.pdf

（５）VPC内の各AWSリソースの特徴に合わせて、IPアドレス範囲を割り当てる。

参考：https://dev.classmethod.jp/articles/amazon-vpc-5-tips/

| AWSサービスの種類  | 最低限のIPアドレス数                    |
| ------------------ | --------------------------------------- |
| ALB                | ALB1つ当たり、8個                       |
| オートスケーリング | 水平スケーリング時のEC2最大数と同じ個数 |
| VPCエンドポイント  | VPCエンドポイント1つ当たり、IPアドレス1つ         |
| ECS、EKS           | Elastic Network Interface 数と同じ個数  |
| Lambda             | Elastic Network Interface 数と同じ個数  |

<br>

## 33-02. VPC間、VPC-オンプレ間の通信

### VPCピアリング接続

![VPCピアリング接続](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VPCピアリング接続.png)

#### ・VPCピアリング接続とは

『一対一』の関係で、『異なるVPC間』の双方向通信を可能にする。

#### ・VPCピアリング接続の可否

| アカウント   | VPCのあるリージョン | VPC内のCIDRブロック    | 接続の可否 |
| ------------ | ------------------- | ---------------------- | ---------- |
| 同じ/異なる | 同じ/異なる        | 全て異なる             | **〇**     |
|              |                     | 同じものが1つでもある | ✕          |

VPC に複数の IPv4 CIDR ブロックがあり、1つでも 同じCIDR ブロックがある場合は、VPC ピアリング接続はできない。

![VPCピアリング接続不可の場合-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VPCピアリング接続不可の場合-1.png)

たとえ、IPv6が異なっていても、同様である。

![VPCピアリング接続不可の場合-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VPCピアリング接続不可の場合-2.png)

<br>

### VPCエンドポイントサービス

![vpc-endpoint-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/vpc-endpoint-service.png)

#### ・VPCエンドポイントサービスとは

VPCエンドポイントとは異なる機能なので注意。Interface型のVPCエンドポイント（プライベートリンク）をNLBに紐付けることにより、『一対多』の関係で、『異なるVPC間』の双方向通信を可能にする。エンドポイントのサービス名は、『``` com.amazonaws.vpce.ap-northeast-1.vpce-svc-*****```』になる。API GatewayのVPCリンクは、VPCエンドポイントサービスに相当する。

<br>

### Transit Gateway

![transit-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/transit-gateway.png)

#### ・Transit Gatewayとは

『多対多』の関係で、『異なるVPC間』や『オンプレ-VPC間』の双方向通信を可能にする。クラウドルーターとして働く。

<br>

### 各サービスとの比較

| 機能                                          | VPCピアリング接続 | VPCエンドポイントサービス           | Transit gateway        |
| --------------------------------------------- | ----------------- | ----------------------------------- | ---------------------- |
| 通信可能なVPC数                               | 一対一            | 一対一、一対多                      | 一対一、一対多、多対多 |
| 通信可能なIPアドレスの種類                    | IPv4、IPv6        | IPv4                                | IPv4、IPv6             |
| 接続可能なリソース                            | 制限なし          | NLBでルーティングできるリソースのみ | 制限なし               |
| CIDRブロックがVPC間で被ることによる通信の可否 | ×                 | ◯                                   | ×                      |
| クロスアカウント                              | ◯                 | ◯                                   | ◯                      |
| クロスリージョン                              | ◯                 | ×                                   | ◯                      |
| VPC間                                         | ◯                 | ◯                                   | ◯                      |
| VPC-オンプレ間                                | ×                 | ×                                   | ◯                      |

<br>

## 34. WAF：Web Application Firewall

### 設定項目

定義できるルール数や文字数に制限がある。以下のリンク先を参考にせよ。

参考：https://docs.aws.amazon.com/ja_jp/waf/latest/developerguide/limits.html

| 設定項目                          | 説明                                                         | 補足                                                         |
| --------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Web ACLs：Web Access Control List | 各トリガーと許可/拒否アクションの紐付けを『ルール』とし、これをセットで設定する。 | アタッチするAWSリソースに合わせて、リージョンが異なる。      |
| IP sets                           | アクション実行のトリガーとなるIPアドレス                     | ・許可するIPアドレスは、意味合いに沿って異なるセットとして構築するべき。例えば、社内IPアドレスセット、協力会社IPアドレスセット、など<br>・拒否するIPアドレスはひとまとめにしてもよい。 |
| Regex pattern sets                | アクション実行のトリガーとなるURLパスの文字列                | ・許可/拒否する文字列は、意味合いに沿って異なる文字列セットとして構築するべき。例えば、ユーザーエージェントセット、リクエストパスセット、など |
| Rule groups                       |                                                              |                                                              |
| AWS Markets                       |                                                              |                                                              |

<br>

### AWSリソース vs. サイバー攻撃

| サイバー攻撃の種類 | 対抗するAWSリソースの種類                                    |
| ------------------ | ------------------------------------------------------------ |
| マルウェア         | なし                                                         |
| 傍受、盗聴         | VPC内の特にプライベートサブネット間のピアリング接続。VPC外を介さずにデータを送受信できる。 |
| ポートスキャン     | セキュリティグループ                                         |
| DDoS               | Shield                                                       |
| ゼロディ           | WAF                                                          |
| インジェクション   | WAF                                                          |
| XSS                | WAF                                                          |
| データ漏洩         | KMS、CloudHSM                                                |
| 組織内部での裏切り | IAM                                                          |

<br>

### 設定項目

#### ・概要

| 設定項目           | 説明                                              | 補足                                                         |
| ------------------ | ------------------------------------------------- | ------------------------------------------------------------ |
| Web ACLs           | アクセス許可と拒否のルールを定義する。            |                                                              |
| Bot Control        | Botに関するアクセス許可と拒否のルールを定義する。 |                                                              |
| IP Sets            | IPアドレスの共通部品を管理する。                  | アクセスを許可したいIPアドレスセットを作成する時、全てのIPアドレスを1つのセットで管理してしまうと、何のIPアドレスかわらなあくなってしまう。そこで、許可するIPアドレスのセットを種類（自社、外部のA社/B社、など）で分割するとよい。 |
| Regex pattern sets | 正規表現パターンの共通部品を管理する。            |                                                              |
| Rule groups        | ルールの共通部品を管理する。                      | 各WAFに同じルールを設定する場合、ルールグループを用いるべきである。ただ、ルールグループを用いると、これらのルールを共通のメトリクスで監視しなければならなくなる。そのため、もしメトリクスを分けるのであれば、ルールグループを用いないようにする。 |

#### ・Web ACLs

| 設定項目                 | 説明                                                         | 補足                                                         |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Overview                 | WAFによって許可/拒否されたリクエストのアクセスログを確認できる。 |                                                              |
| Rules                    | 順番にルールを判定し、一致するルールがあればアクションを実行する。この時、一致するルールの後にあるルールは。判定されない。 | AWSマネージドルールについては、以下のリンク先を参考にせよ。<br>参考：https://docs.aws.amazon.com/ja_jp/waf/latest/developerguide/aws-managed-rule-groups-list.html |
| Associated AWS resources | WAFをアタッチするAWSリソースを設定する。                     | CloudFront、ALBなどにアタッチできる。                        |
| Logging and metrics      | アクセスログをKinesis Data Firehoseに出力するように設定する。 |                                                              |

#### ・OverviewにおけるSampled requestsの見方

『全てのルール』または『個別のルール』におけるアクセス許可/拒否の履歴を確認できる。ALBやCloudFrontのアクセスログよりも解りやすく、様々なデバッグに役立つ。ただし、３時間分しか残らない。一例として、CloudFrontにアタッチしたWAFで取得できるログを以下に示す。

```http
GET /foo/
# ホスト
Host: example.jp
Upgrade-Insecure-Requests: 1
# ユーザーエージェント
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
# CORSであるか否か
Sec-Fetch-Site: same-origin
Accept-Encoding: gzip, deflate, br
Accept-Language: ja,en;q=0.9
# Cookieヘッダー
Cookie: sessionid=<セッションID>; _gid=<GoogleAnalytics値>; __ulfpc=<GoogleAnalytics値>; _ga=<GoogleAnalytics値>
```

<br>

### ルール

#### ・ルールの種類

参考：https://docs.aws.amazon.com/ja_jp/waf/latest/developerguide/classic-web-acl-rules-creating.html

| 種類         | 説明                                                         |
| ------------ | ------------------------------------------------------------ |
| レートベース | 同じ送信元IPアドレスからの５分間当たりのリクエスト数制限をルールに付与する。 |
| レギュラー   | リクエスト数は制限しない。                                   |

#### ・ルールの粒度のコツ

わかりやすさの観点から、可能な限り設定するステートメントを少なくし、1つのルールに1つの意味合いだけを持たせるように命名する。

#### ・Count（検知）モード

ルールに該当するリクエスト数を数え、許可/拒否せずに次のルールを検証する。計測結果に応じて、Countモードを無効化し、拒否できるようにする。

参考：https://oji-cloud.net/2020/09/18/post-5501/

#### ・ルールグループアクションの上書き

ルールのCountモードが有効になっている場合、Countアクションに続けて、そのルールの元のアクションを実行する。そのため、Countアクションしつつ、Blockアクションを実行できる（仕様がややこしすぎるので、なんとかしてほしい）。

参考：https://docs.aws.amazon.com/ja_jp/waf/latest/developerguide/web-acl-rule-group-override-options.html

| マネージドルールの元のアクション | Countモード | 上書きオプション | 結果                                                         |
| ---------------------------------- | ----------- | ---------------- | ------------------------------------------------------------ |
| Block                              | ON          | ON               | Countし、その後Blockが実行する。そのため、その後のルールは検証せずに終了する。 |
| Block                              | ON          | OFF              | Countのみが実行される。そのため、その後のルールも検証する。  |
| Block                              | OFF         | ON               | そもそもCountモードが無効なため、上書きオプションは機能せずに、Blockが実行される。 |
| Block                              | OFF         | OFF              | そもそもCountモードが無効なため、マネージドルールのBlockが実行される。（と思っていたが、結果としてCountとして機能する模様...） |

<br>

### マネージドルールを用いるかどうかの判断基準

#### ・マネージドルールの動作確認の必要性

マネージドルールを導入する時は、事前にルールのカウント機能を用いることが推奨されている。カウントで検知されたリクエストのほとんどが悪意のないものであれば、設定したマネージドルールの使用をやめる必要がある。

#### ・ブラウザを送信元とした場合

ブラウザを送信元とした場合、リクエストのヘッダーやボディはブラウザによって生成されるため、これに基づいた判断が必要である。

- ブラウザからのリクエスト自体が悪意判定されているかどうか
- サイトのURLの記法によって、悪意判定されているかどうか
- 送信元の国名が『日本』であるのにもかかわらず、悪意判定されているかどうか
- サイトに送信された全リクエストのうち、カウントで検知されたリクエストの数が多すぎないかどうか

#### ・連携するアプリケーションを送信元とした場合

アプリケーションを送信元とした場合、リクエストのヘッダーやボディは連携するアプリケーションによって生成されるため、これに基づいた判断が必要である。

<br>

### ルールの例

#### ・ユーザーエージェント拒否

**＊例＊**

悪意のあるユーザーエージェントを拒否する。

ルール：block-user-agents

| Statementの順番 | If a request | Inspect  | Match type                             | Regex pattern set | Then  | 挙動                                                         |
| --------------- | ------------ | -------- | -------------------------------------- | ----------------- | ----- | ------------------------------------------------------------ |
| 0               | matches      | URI path | Matches pattern from regex pattern set | 文字列セット      | Block | 指定した文字列を含むユーザーエージェントの場合、アクセスすることを拒否する。 |

| Default Action | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| Allow          | 指定したユーザーエージェントでない場合、全てのファイルパスにアクセスすることを許可する。 |

#### ・CI/CDツールのアクセスを許可

**＊例＊**

社内の送信元IPアドレスのみ許可した状態で、CircleCIなどのサービスが社内サービスにアクセスできるようにする。

ルール：allow-request-including-access-token

| Statementの順番 | If a request | Inspect | Header field name | Match type              | String to match                                     | Then  | 挙動                                                         |
| --------------- | ------------ | ------- | ----------------- | ----------------------- | --------------------------------------------------- | ----- | ------------------------------------------------------------ |
| 0               | matches      | Header  | authorization     | Exactly matched  string | 『```Bearer <トークン文字列>```』で文字列を設定する | Allow | authorizationヘッダーに指定した文字列を含むリクエストの場合、アクセスすることを拒否する。 |

| Default Action | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| Block          | 正しいトークンを持たないアクセスの場合、全てのファイルパスにアクセスすることを拒否する。 |

#### ・特定のファイルパスを社内アクセスに限定

**＊例＊**

アプリケーションでは、特定のURLパスにアクセスできる送信元IPアドレスを社内だけに制限する。二つのルールを構築する必要がある。

ルール：allow-access--to-url-path

| Statementの順番 | If a request  | Inspect                          | IP set       | Match type                             | Regex pattern set | Then  | 挙動                                                         |
| --------------- | ------------- | -------------------------------- | ------------ | -------------------------------------- | ----------------- | ----- | ------------------------------------------------------------ |
| 0               | matches (AND) | Originates from an IP address in | 社内IPセット | -                                      | -                 | -     | 社内の送信元IPアドレスの場合、指定したファイルパスにアクセスすることを許可する。 |
| 1               | matches       | URI path                         | -            | Matches pattern from regex pattern set | 文字列セット      | Allow | 0番目かつ、指定した文字列を含むURLパスアクセスの場合、アクセスすることを許可する。 |

ルール：block-access-to-url-path

| Statementの順番 | If a request | Inspect  | Match type                             | Regex pattern set | Then  | 挙動                                                         |
| --------------- | ------------ | -------- | -------------------------------------- | ----------------- | ----- | ------------------------------------------------------------ |
| 0               | matches      | URI path | Matches pattern from regex pattern set | 文字列セット      | Block | 指定した文字列を含むURLパスアクセスの場合、アクセスすることを拒否する。 |

| Default Action | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| Allow          | 指定したURLパス以外のアクセスの場合、そのパスにアクセスすることを許可する。 |

#### ・社内アクセスに限定

**＊例＊**

アプリケーション全体にアクセスできる送信元IPアドレスを、特定のIPアドレスだけに制限する。

ルール：allow-global-ip-addresses

| Statementの順番 | If a request  | Inspect                          | IP set           | Originating address | Then  | 挙動                                                         |
| --------------- | ------------- | -------------------------------- | ---------------- | ------------------- | ----- | ------------------------------------------------------------ |
| 0               | matches  (OR) | Originates from an IP address in | 社内IPセット     | Source IP address   | -     | 社内の送信元IPアドレスの場合、全てのファイルパスにアクセスすることを許可する。 |
| 1               | matches       | Originates from an IP address in | 協力会社IPセット | Source IP address   | Allow | 0番目あるいは、協力会社の送信元IPアドレスの場合、全てのファイルパスにアクセスすることを許可する。 |

| Default Action | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| Block          | 指定した送信元IPアドレス以外の場合、全てのファイルパスにアクセスすることを拒否する。 |

<br>

### ログ

#### ・マネージドルールのログ

WAFマネージドルールを用いている場合、マネージドルールが```ruleGroupList```キーに配列として格納されている。もし、Countアクションが実行されていれば、```excludedRules```キーにその旨とルールIDが格納される。

```bash
{

  # ～ 中略 ～

  "ruleGroupList": [
    {
      "ruleGroupId": "AWS#AWSManagedRulesCommonRuleSet#Version_1.2",
      "terminatingRule": null,
      "nonTerminatingMatchingRules": [],
      "excludedRules": [
        {
          "exclusionType": "EXCLUDED_AS_COUNT",
          "ruleId": "NoUserAgent_HEADER"
        }
      ]
    },
    {
      "ruleGroupId": "AWS#AWSManagedRulesSQLiRuleSet#Version_1.1",
      "terminatingRule": null,
      "nonTerminatingMatchingRules": [],
      "excludedRules": null
    },
    {
      "ruleGroupId": "AWS#AWSManagedRulesPHPRuleSet#Version_1.1",
      "terminatingRule": null,
      "nonTerminatingMatchingRules": [],
      "excludedRules": null
    },
    {
      "ruleGroupId": "AWS#AWSManagedRulesKnownBadInputsRuleSet#Version_1.1",
      "terminatingRule": null,
      "nonTerminatingMatchingRules": [],
      "excludedRules": null
    }
  ],

  # ～ 中略 ～

}
```



<br>

## 35. WorkMail

### WorkMailとは

Gmail、サンダーバード、Yahooメールなどと同類のメール管理アプリケーション。

<br>

### 設定項目

| 設定項目              | 説明                                                     | 補足                                                         |
| --------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| Users                 | WorkMailで管理するユーザーを設定する。                     |                                                              |
| Domains               | ユーザーに割り当てるメールアドレスのドメイン名を設定する。 | ```@{組織名}.awsapps.com```をドメイン名としてもらえる。ドメイン名の検証が完了した独自ドメイン名を設定することもできる。 |
| Access Control rules | 受信するメール、受信を遮断するメール、の条件を設定する。 |                                                              |

<br>

## 36. 負荷テスト

### Distributed Load Testing（分散負荷テスト）

#### ・分散負荷テストとは

AWSから提供されている負荷を発生させるインフラ環境のこと。CloudFormationで構築でき、Fargateを用いて、ユーザーからのリクエストを擬似的に再現できる。

参考：https://d1.awsstatic.com/Solutions/ja_JP/distributed-load-testing-on-aws.pdf

#### ・インフラ構成

![distributed_load_testing](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/distributed_load_testing.png)

<br>

## 37. タグ

### タグ付け戦略

#### ・よくあるタグ

| タグ名      | 用途                                                         |
| ----------- | ------------------------------------------------------------ |
| Name        | リソース自体に名前を付けられない場合、代わりにタグで名付けるため。 |
| Environment | 同一のAWS環境内に異なる実行環境が存在している場合、それらを区別するため。 |
| User        | 同一のAWS環境内にリソース別に所有者が存在している場合、それらを区別するため。 |

#### ・タグ付けによる検索

AWSの各リソースには、タグをつけられる。例えば、AWSコストエクスプローラーにて、このタグで検索することにより、任意のタグが付いたリソースの請求合計額を確認できる。
