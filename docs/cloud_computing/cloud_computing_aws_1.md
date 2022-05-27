---
title: 【知見を記録するサイト】AWS：Amazon Web Service
description: AWS：Amazon Web Serviceの知見をまとめました。
---

# AWS：Amazon Web Service（A〜E）

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. ALB：Application Load Balancing

### ALBとは

クラウドリバースプロキシサーバー、かつクラウドロードバランサーとして働く。リクエストを代理で受信し、EC2インスタンスへのアクセスをバランスよく分配することによって、サーバーへの負荷を緩和する。

![ALBの機能](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ALBの機能.png)

<br>

### セットアップ

#### ▼ セットアップ

| 設定項目             | 説明                                                         | 補足                                                         |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| リスナー             | ALBに割り振るポート番号と受信するプロトコルを設定する。リバースプロキシサーバーかつロードバランサ－として、これらの通信をターゲットグループにルーティングする。 |                                                              |
| セキュリティポリシー | リクエストの送信者が使用するSSL/TLSプロトコルや暗号化方式のバージョンに合わせて、ALBが受信できるこれらのバージョンを設定する。 | ・リクエストの送信者には、ブラウザ、APIにリクエストを送信する外部サービス、転送元のAWSリソース（CloudFrontなど）、などを含む。<br>・参考：https://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/application/create-https-listener.html#describe-ssl-policies |
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

参考：https://blog.takuros.net/entry/2019/08/27/075726

![alb-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/alb-instance.png)

#### ▼ 割り当てられるプライベートIPアドレス範囲

ALBに割り当てられるIPアドレス範囲には、VPCのものが適用される。そのため、EC2インスタンスのセキュリティグループでは、VPCのIPアドレス範囲を許可するように設定する必要がある。

#### ▼ 自動スケーリング

単一障害点にならないように、負荷が高まるとALBインスタンスが増えるように自動スケールアウトする仕組みを持つ。

#### ▼ ```500```系ステータスコードの原因

参考：https://aws.amazon.com/jp/premiumsupport/knowledge-center/troubleshoot-http-5xx/

#### ▼ ALBのセキュリティグループ

Route53からルーティングされるパブリックIPアドレスを受信できるようにしておく必要がある。パブリックネットワークに公開するサイトであれば、IPアドレスは全ての範囲（```0.0.0.0/0```と``` ::/0```）にする。社内向けのサイトであれば、社内のプライベートIPアドレスのみ（```n.n.n.n/32```）を許可する。

<br>

### アプリケーションが常時SSLの場合

#### ▼ 問題

アプリケーションが常時SSLになっているアプリケーション（例：WordPress）の場合、ALBからアプリケーションにHTTPプロトコルでルーティングすると、HTTPSプロトコルへのリダイレクトループが発生してしまう。常時SSLがデフォルトになっていないアプリケーションであれば、これは起こらない。

参考：https://cloudpack.media/525

#### ▼ Webサーバーにおける対処方法

ALBを経由したリクエストには、リクエストヘッダーに```X-Forwarded-Proto```ヘッダーが付与される。これには、ALBに対するリクエストのプロトコルの種類が文字列で代入されている。これが『HTTPS』だった場合、WebサーバーへのリクエストをHTTPSであるとみなすように対処する。これにより、アプリケーションへのリクエストのプロトコルがHTTPSとなる（こちらを行った場合は、アプリケーション側の対応不要）。

参考：https://www.d-wood.com/blog/2017/11/29_9354.html

**＊実装例＊**

```apacheconf
SetEnvIf X-Forwarded-Proto https HTTPS=on
```

#### ▼ アプリケーションにおける対処方法

![ALBからEC2へのリクエストのプロトコルをHTTPSと見なす](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ALBからEC2へのリクエストのプロトコルをHTTPSと見なす.png)

ALBを経由したリクエストには、リクエストヘッダーに```HTTP_X_FORWARDED_PROTO```ヘッダーが付与される。これには、ALBに対するリクエストのプロトコルの種類が文字列で代入されている。そのため、もしALBに対するリクエストがHTTPSプロトコルだった場合は、ALBからアプリケーションへのリクエストもHTTPSであるとみなすように、```index.php```に追加実装を行う（こちらを行った場合は、Webサーバー側の対応不要）。

参考：https://www.d-wood.com/blog/2017/11/29_9354.html

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

参考：https://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/application/introduction.html#application-load-balancer-overview

#### ▼ ラウンドロビン

受信したリクエストを、ターゲットに均等にルーティングする。

#### ▼ 最小未処理リクエスト（ファステスト）

受信したリクエストを、未処理のリクエスト数が最も少ないターゲットにルーティングする。

参考：https://www.infraexpert.com/study/loadbalancer4.html

<br>

## 02. Amplify

### Amplifyとは

サーバーレスアプリケーションを構築するためのクラウドインフラストラクチャのフレームワーク。

参考：https://d1.awsstatic.com/webinars/jp/pdf/services/20200520_AWSBlackBelt_Amplify_A.pdf

<br>

### アーキテクチャ

#### ▼ フロントエンド

SSGの場合、静的ファイルをデプロイしさえすれば、アプリケーションとしての要件が全て整う。SPAの場合、サーバーレスのバックエンドを自動構築してくれ、フロントエンドをデプロイしさえすれば、要件が全て整う。これのAWSリソースはCloudFormationによって構築されるが、Amplify経由でしか設定を変更できず、各AWSリリースのコンソール画面を見ても、非表示になっている。ただし、Route53の設定は表示されており、Amplifyが追加したレコードをユーザーが編集できるようになっている。

| 役割                    | 使用されているAWSリソース |
| ----------------------- | ------------------------- |
| 静的サイトホスティング  | CloudFront、S3            |
| GraphQLによるリクエスト | S3                        |

#### ▼ バックエンド

フロントエンドでGraphQLによるリクエストを実装している場合、AppSyncを使用して、これを受信できるAPIを構築する必要がある。

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

<br>

### セットアップ

| 項目                   | 説明                                             | 補足                                                         |
| ---------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| アプリケーションの名前 | Amplify上でのアプリケーション名を設定する。      |                                                              |
| 本番稼働ブランチ       | 基点ブランチを設定する。                         | Amplifyを本番運用しない場合は、developブランチを設定すれば良い。 |
| ブランチの自動検出     | ブランチの自動検出を有効化する。                 | ワイルドカードを組み込む場合、アスタリスクを2つ割り当てないと、ブランチが検知されないことがある。例：『```**foo**,**bar**```』 |
| プレビュー             | GitHubのプルリク上にAmplify環境のURLを通知する。 | 2021/02/07現在では、プルリクを新しく作成しても、これは自動で登録されない。そのため、その都度手動で登録する必要がある。 |
| アクセスコントロール   | Amplify環境に認証機能を設定する。                | 2021/02/07現在では、Basic認証を使用できる。          |
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

参考：https://docs.aws.amazon.com/ja_jp/amplify/latest/userguide/getting-started.html#step-1-connect-repository

#### ▼ 対応するバージョン管理リポジトリ構造

| 構造名           | ビルド開始ディレクトリ                         |
| ---------------- | ---------------------------------------------- |
| 非モノリポジトリ | リポジトリ名からなるディレクトリ               |
| モノリポジトリ   | モノリポジトリの各アプリケーションディレクトリ |

#### ▼ ```amplify.yml```ファイル

バージョン管理リポジトリのルートに```amplify.yml```ファイルを配置する。Next.jsではSSG/SSRの両モードでビルド＆デプロイできる。```package.json```ファイルで使用される```next```コマンドに応じて、SSGまたはSSRのいずれかのインフラが構築され、デプロイされる。SSGの場合、裏側ではS3、CloudFront、Route53などが構築され、静的ホスティングが実行される。SSRの場合、フロントエンドだけでなくバックエンドの実行環境が必要になるため、LambdaやCogniteが構築される。

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

#### ▼ 概要

API Gatewayは、メソッドリクエスト、統合リクエスト、統合レスポンス、メソッドレスポンス、から構成される。

| 設定項目                 | 説明                                                         | 補足                                                         |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| リソース                 | エンドポイント、HTTPメソッド、ルーティング先、などを設定する。 | 構築したAWSリソースのパスが、API Gatewayのエンドポイントになる。 |
| ステージ                 | API Gatewayをデプロイする環境を定義する。                    |                                                              |
| オーソライザー           | LambdaまたはCognitoによるオーソライザーを使用して、認可プロセスを定義する。 |                                                              |
| ゲートウェイのレスポンス |                                                              |                                                              |
| モデル                   | リクエスト/レスポンスのスキーマを設定する。これらのバリデーションのために使用できる。 | OpenAPI仕様におけるスキーマについては、以下のリンクを参考にせよ。<br>参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_collaboration_api_restful.html |
| リソースポリシー         | ポリシーを使用して、API Gatewayにセキュリティを定義づける。    |                                                              |
| ドキュメント             |                                                              |                                                              |
| ダッシュボード           |                                                              |                                                              |
| APIの設定                |                                                              |                                                              |
| 使用量プラン             | 有料サービスとしてAPIを公開し、料金体系に応じてリクエスト量を制限するために使用する。APIキーにリクエスト量のレートを設定する。 | 有料サービスとして使用しないAPIの場合は、レートを設定する必要はない。 |
| APIキー                  | APIキー認証を設定する。                                      | ・その他のアクセス制御の方法として、以下がある。<br>参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/apigateway-control-access-to-api.html<br>・APIキー認証については、以下のリンクを参考にせよ。<br>参考：https://hiroki-it.github.io/tech-notebook-mkdocs/security/security_authentication_authorization.html |
| クライアント証明書       | SSL証明書をAPI Gatewayに割り当てる。                         | APIが、API Gatewayからルーティングされたリクエストであること識別できるようになる。 |
| CloudWatchログの設定     | API GatewayがCloudWatchログにアクセスできるよう、ロールを設定する。 | 1つのAWS環境につき、1つのロールを設定すれば良い。            |

<br>

### リソース

#### ▼ リソース

| 順番 | 処理               | 説明                                                         | 補足                                                         |
| ---- | ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1    | メソッドリクエスト | クライアントから送信されたデータのうち、実際にルーティングするデータをフィルタリングする。 |                                                              |
| 2    | 統合リクエスト     | メソッドリクエストからルーティングされた各データを、マッピングテンプレートのJSONに紐付ける。 |                                                              |
| 3    | 統合レスポンス     |                                                              | 統合リクエストでプロキシ統合を使用する場合、統合レスポンスを使用できなくなる。 |
| 4    | メソッドレスポンス | レスポンスが成功した場合、クライアントに送信するステータスコードを設定する。 |                                                              |

#### ▼ メソッドリクエスト

| 設定項目                    | 説明                                                         | 補足                                                         |
| --------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 認可                        | 定義したLambdaまたはCognitoによるオーソライザーを有効化する。 |                                                              |
| リクエストの検証            | 『URLクエリ文字列パラメーター』『HTTPリクエストヘッダー』『リクエスト本文』のバリデーションを有効化する。 |                                                              |
| APIキーの必要性             | リクエストヘッダーにおけるAPIキーのバリデーションを行う。リクエストのヘッダーに『```x-api-key```』を含み、これにAPIキーが割り当てられていることを強制する。 | ヘッダー名は大文字でも小文字でも問題ないが、小文字が推奨。<br>参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_collaboration_api_restful.html |
| URLクエリ文字列パラメーター | リクエストされたURLのクエリパラメーターのバリデーションを行う。 |                                                              |
| HTTPリクエストヘッダー      | リクエストヘッダーのバリデーションを行う。                   |                                                              |
| リクエスト本文              | リクエストボディのバリデーションを行う。                     |                                                              |
| SDK設定                     |                                                              |                                                              |

#### ▼ 統合リクエスト

| 設定項目                    | 説明                                                         | 補足                                   |
| --------------------------- | ------------------------------------------------------------ | -------------------------------------- |
| 統合タイプ                  | リクエストのルーティング先を設定する。                       |                                        |
| URLパスパラメーター         | メソッドリクエストからルーティングされたデータを、API Gatewayからルーティングするリクエストのパスパラメーターに紐付ける。または紐付けずに、新しいデータをルーティングしても良い。 |                                        |
| URLクエリ文字列パラメーター | メソッドリクエストからルーティングされたデータを、API Gatewayからルーティングするリクエストのクエリパラメーターに紐付ける。または紐付けずに、新しいデータをルーティングしても良い。 |                                        |
| HTTPヘッダー                | メソッドリクエストからルーティングされたデータを、API Gatewayからルーティングするリクエストのヘッダーに紐付ける。または紐付けずに、新しいデータをルーティングしても良い。 | 値はシングルクオートで囲う必要がある。 |
| マッピングテンプレート      | メソッドリクエストからルーティングされたデータを、API Gatewayからルーティングするリクエストのメッセージボディに紐付ける。または紐付けずに、新しいデータをルーティングしても良い。 |                                        |

#### ▼ テスト

| 設定項目       | 設定例              | 補足                                         |
| -------------- | ------------------- | -------------------------------------------- |
| クエリ文字     |                     |                                              |
| ヘッダー       | X-API-Token: test   | 波括弧、スペース、クオーテーションは不要。   |
| リクエスト本文 | ```{test:"test"}``` | 改行タグやスペースが入り込まないようにする。 |

#### ▼ OpenAPI仕様のインポート

以下のリンクを参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/cloud_computing/cloud_computing_aws_api_gateway_import.html

#### ▼ CORSの有効化

CORSを有効化し、異なるオリジンによって表示されたページからのリクエストを許可する。以下のリンクを参考にせよ。

参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/how-to-cors.html

<br>

### プライベート統合

#### ▼ プライベート統合とは

API GatewayとVPCリンクの間で、リクエスト/レスポンスのJSONデータを自動的にマッピングする機能のこと。

参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/set-up-private-integration.html

また、VPCリンクの設定によって、VPCエンドポイントサービスが構築される。

| 設定項目                     | 説明                                                  |
| ---------------------------- | ----------------------------------------------------- |
| 統合タイプ                   | VPCリンクを選択する。                                 |
| プロキシ統合の使用           | VPCリンクとのプロキシ統合を有効化する。               |
| メソッド                     | HTTPメソッドを設定する。                              |
| VPCリンク                    | VPCリンク名を設定する。                               |
| エンドポイントURL            | NLBのDNS名をドメイン名として、転送先のURLを設定する。 |
| デフォルトタイムアウトの使用 |                                                       |

#### ▼ メソッドリクエストと統合リクエストのマッピング

<br>

### Lambdaプロキシ統合

#### ▼ Lambdaプロキシ統合とは

API GatewayとLambdaの間で、リクエスト/レスポンスのJSONデータを自動的にマッピングする機能のこと。プロキシ統合を使用すると、Lambdaに送信されたリクエストはハンドラ関数のeventオブジェクトに代入される。プロキシ統合を使用しない場合、LambdaとAPI Gatewayの間のマッピングを手動で行う必要がある。

参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/set-up-lambda-integrations.html

| 設定項目                     | 説明                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| 統合タイプ                   | Lambda関数を選択する。                                       |
| Lambdaプロキシ統合の使用     | Lambdaとのプロキシ統合を有効化する。                         |
| Lambdaリージョン             | 実行したLambda関数のリージョンを設定する。                   |
| Lambda関数                   | 実行したLambda関数の名前を設定する。                         |
| 実行ロール                   | 実行したいLambda関数へのアクセス権限がアタッチされたロールのARNを設定する。ただし、Lambda側にAPI Gatewayへのアクセス権限をアタッチしても良い。 |
| 認証情報のキャッシュ         |                                                              |
| デフォルトタイムアウトの使用 |                                                              |

#### ▼ リクエスト時のマッピング

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

#### ▼ レスポンス時のマッピング

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

#### ▼ 設定

| 設定項目                           | 説明                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| キャッシュ設定                     | 参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/api-gateway-caching.html |
| デフォルトのメソッドスロットリング | １秒当たりのリクエスト数制限を設定する。<br>参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/api-gateway-request-throttling.html |
| WAF                                | 参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/apigateway-control-access-aws-waf.html |
| クライアント証明書                 | 紐付けるWAFを設定する。                                      |

#### ▼ ステージ変数

デプロイされるステージ固有の環境変数を設定できる。Lambda関数名、エンドポイントURL、パラメーターマッピング、マッピングテンプレートで値を出力できる。以下のリンクを参考にせよ。

参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/aws-api-gateway-stage-variables-reference.html

#### ▼ SDKの生成

<br>

### デプロイメント

#### ▼ 通常のデプロイメント

API Gatewayの通常のデプロイメントの仕組みあ隠蔽されている。ダウンタイム無しで、新しいステージをデプロイできる。

参考：https://forums.aws.amazon.com/thread.jspa?threadID=238876

#### ▼ カナリアリリース

カナリアリリースを使用して、新しいステージをデプロイする。

参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/canary-release.html

| 設定項目                                   | 説明 |
| ------------------------------------------ | ---- |
| ステージのリクエストディストリビューション |      |
| Canaryのデプロイ                           |      |
| Canaryステージ変数                         |      |
| キャッシュ                                 |      |

<br>

### ログの種類

#### ▼ 実行ログ

CloudWatchログにAPI Gatewayの実行ログを送信するかどうかを設定できる。リクエスト/レスポンスの構造もログに出力するようにした方が良い。

参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/set-up-logging.html

#### ▼ カスタムアクセスログ

CloudWatchログにAPI Gatewayのアクセスログを送信するかどうかを設定できる。アクセスログを構造化ログとして出力できる。

参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/set-up-logging.html

<br>

### 分散トレースの収集

X-Rayを使用して、API Gatewayを開始点とした分散トレースを収集する。まず、API GatewayでトレースIDが生成される。その後、各AWSリソースでスパンを取得し、スパンを紐付けることより、分散トレースを表現できる。なおX-Rayでは、親スパンをセグメント、子スパンをサブセグメントと呼ぶ。

参考：https://docs.aws.amazon.com/ja_jp/xray/latest/devguide/xray-concepts.html#xray-concepts-traces

<br>

### APIの設定

#### ▼ エンドポイントタイプ

参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/api-gateway-api-endpoint-types.html

| タイプ名     | 説明                                                         |
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

### セットアップ

#### ▼ 起動設定

スケーリングの対象となるAWSリソースを定義する。

#### ▼ スケーリンググループ

スケーリングのグループ構成を定義する。各グループで最大最小必要数を設定できる。

<br>

### シンプルスケーリング

#### ▼ シンプルスケーリングとは

特定のメトリクスに単一の閾値を設定し、それに応じてスケーリングを行う。

<br>

### ステップスケーリング

#### ▼ ステップスケーリングとは

特定のメトリクスに段階的な閾値を設定し、それに応じて段階的にスケールアウトを実行する。スケーリングの実行条件となる閾値期間は、CloudWatchメトリクスの連続期間として設定できる。AWSとしては、ターゲット追跡スケーリングの使用を推奨している。

**＊例＊**

CPU平均使用率に段階的な閾値を設定する。

- 40%の時にEC2インスタンスが1つスケールアウト
- ```70```%の時にEC2インスタンスを2つスケールアウト
- ```90```%の時にEC2インスタンスを3つスケールアウト

#### ▼ ECSの場合

参考：https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/userguide/service-autoscaling-stepscaling.html

<br>

### ターゲット追跡スケーリング

#### ▼ ターゲット追跡スケーリングとは

特定のメトリクス（CPU平均使用率やMemory平均使用率）にターゲット値を設定し、それに収束するように自動的にスケールインとスケールアウトを実行する。ステップスケーリングとは異なり、スケーリングの実行条件となる閾値期間を設定できない。

**＊例＊**

- ECSサービスのタスク数
- DBクラスターのAuroraのリードレプリカ数
- Lambdaのスクリプト同時実行数

#### ▼ ECSの場合

ターゲット値の設定に応じて、自動的にスケールアウトやスケールインが起こるシナリオ例を示す。

1. 最小タスク数を2、必要タスク数を4、最大数を6、CPU平均使用率を40%に設定する例を考える。
2. 平常時、CPU使用率40%に維持される。
3. リクエストが増加し、CPU使用率55%に上昇する。
4. タスク数が6つにスケールアウトし、CPU使用率40%に維持される。
5. リクエスト数が減少し、CPU使用率が20%に低下する。
6. タスク数が2つにスケールインし、CPU使用率40%に維持される。

参考：https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/service-autoscaling-targettracking.html

| 設定項目                           | 説明                                                         | 補足                                                         |
| ---------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ターゲット追跡スケーリングポリシー | 監視対象のメトリクスがターゲット値を超過しているか否かを基に、タスク数のスケーリングが実行される。 |                                                              |
| ECSサービスメトリクス              | 監視対象のメトリクスを設定する。                             | 『平均CPU』、『平均メモリ』、『タスク当たりのALBからのリクエスト数』を監視できる。SLIに対応するCloudWatchメトリクスも参考にせよ。 |
| ターゲット値                       | タスク数のスケーリングが実行される収束値を設定する。         | ターゲット値を超過している場合、タスク数がスケールアウトされる。反対に、ターゲット値未満（正確にはターゲット値の９割未満）の場合、タスク数がスケールインされる。 |
| スケールアウトクールダウン期間     | スケールアウトを完了してから、次回のスケールアウトを発動できるまでの時間を設定する。 | ・期間を短くし過ぎると、ターゲット値を超過する状態が断続的に続いた場合、余分なスケールアウトが連続して実行されてしまうため注意する。<br>・期間を長く過ぎると、スケールアウトが不十分になり、ECSの負荷が緩和されないため注意する。 |
| スケールインクールダウン期間       | スケールインを完了してから、次回のスケールインを発動できるまでの時間を設定する。 |                                                              |
| スケールインの無効化               |                                                              |                                                              |

<br>

## 05. Certificate Manager

### セットアップ

| 設定項目   | 説明                                       |
| ---------- | ------------------------------------------ |
| ドメイン名 | 認証をリクエストするドメイン名を設定する。 |
| 検証の方法 | DNS検証かEメール検証かを設定する。         |

<br>

### 認証局

認証局であるATSによって認証されたSSL証明書を管理できる。

| 自社の中間認証局名         | ルート認証局名 |
| -------------------------- | -------------- |
| ATS：Amazon Trust Services | Starfield社    |

<br>

### SSL証明書の検証方法

#### ▼ ドメイン検証

ドメインのSSL証明書を発行するためには、そのドメインの所有者であることを証明する必要がある。AWSだけでなく、GMOなどのドメインを購入できる各サービスに検証方法が用意されている。

参考：

- https://docs.aws.amazon.com/ja_jp/acm/latest/userguide/domain-ownership-validation.html
- https://jp.globalsign.com/support/proceeding/147.html

#### ▼ DNS検証

CMによってRoute53に自動生成されるCNAMEレコード値を使用して、ドメインの所有者であることを証明する。証明書が失効しそうになったときに、CNAMEレコード値が照合され、CMが証明書を再発行してくれる。なお、ドメインをAWS以外（例：お名前ドットコム）で購入している場合は、NSレコード値を購入先のサービスのドメインレジストラに手作業で登録する必要があることに注意する。

参考：

- https://docs.aws.amazon.com/ja_jp/acm/latest/userguide/dns-validation.html
- https://dev.classmethod.jp/articles/route53-domain-onamae/

#### ▼ Eメール検証

ドメインの所有者にメールを送信し、これを承認することにより所有者であることを証明する。ドメインをAWS以外（例：お名前ドットコム）で購入している場合は、そちらで設定したメールアドレス宛に確認メールが送信される。

参考：https://docs.aws.amazon.com/ja_jp/acm/latest/userguide/email-validation.html

#### ▼ 検証方法の変更

既存の証明書の検証方法は変更できない。そのため、検証方法を変更した証明書を新しく発行し、これを紐づける必要がある。古い証明書は削除しておく。

参考：https://aws.amazon.com/jp/premiumsupport/knowledge-center/switch-acm-certificate/

<br>

### SSL証明書

#### ▼ セキュリティポリシー

許可するプロトコルを定義したルールこと。SSL/TLSプロトコルを許可しており、対応できるバージョンが異なるため、ブラウザがそのバージョンのSSL/TLSプロトコルを使用できるかを認識しておく必要がある。

| バージョン       | Policy-2016-08 | Policy-TLS-1-1 | Policy-TLS-1-2 |
| ---------------- | :------------: | :------------: | :------------: |
| Protocol-TLSv1   |       〇       |       ✕        |       ✕        |
| Protocol-TLSv1.1 |       〇       |       〇       |       ✕        |
| Protocol-TLSv1.2 |       〇       |       〇       |       〇       |

#### ▼ SSL証明書の種類

DNS検証またはEメール検証によって、ドメインの所有者であることが証明されると、発行される。SSL証明書は、PKIによる公開鍵検証に使用される。

| 証明書の種類         | 説明                                             |
| -------------------- | ------------------------------------------------ |
| ワイルドカード証明書 | 証明するドメイン名にワイルドカードを使用したもの。 |

#### ▼ SSL証明書の設置場所パターン

AWSの使用上、ACMのSSL証明書を設置できないAWSリソースに対しては、外部のSSL証明書を手に入れて設置する。HTTPSによるSSLプロトコルを受け付けるネットワークの最終地点のことを、SSLターミネーションという。

| パターン<br>（Route53には必ず設置）                          | SSLターミネーション<br>（HTTPSの最終地点） | 補足                                                         |
| ------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------ |
| Route53 → ALB(+ACMのSSL証明書) → EC2                         | ALB                                        |                                                              |
| Route53 → CloudFront(+ACMのSSL証明書) → ALB(+ACMのSSL証明書) → EC2 | ALB                                        | CloudFrontはバージニア北部で、またALBは東京リージョンで、証明書を構築する必要がある。CloudFrontに送信されたHTTPSリクエストをALBにルーティングするために、両方に紐付ける証明書で承認するドメインは、一致させる必要がある。 |
| Route53 → CloudFront(+ACMのSSL証明書) → EC2                  | CloudFront                                 |                                                              |
| Route53 → CloudFront(+ACMのSSL証明書) → S3                   | CloudFront                                 |                                                              |
| Route53 → ALB(+ACMのSSL証明書) → EC2(+外部証明書)            | EC2                                        |                                                              |
| Route53 → NLB → EC2(+外部証明書)                             | EC2                                        |                                                              |
| Route53 → EC2(+外部証明書)                                   | EC2                                        |                                                              |
| Route53 → Lightsail(+ACMのSSL証明書)                         | Lightsail                                  |                                                              |

<br>

### SSL証明書の変更

#### ▼ SSL証明書の確認

Chromeを例に挙げると、SSL証明書はURLの鍵マークから確認できる。

**＊例＊**

CircleCIのサイトは、SSL証明書のためにACMを使用している。

![ssl_certificate_chrome](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ssl_certificate_chrome.png)

#### ▼ ダウンタイム

ALBではSSL証明書の変更でダウンタイムは発生しない。既存のセッションを維持しつつ、新しいSSL証明書が適用される。CloudFrontは謎...

参考：https://aws.typepad.com/sajp/2014/04/elb-ssl.html

<br>

## 06. Chatbot

### Chatbotとは

SNSを経由して、CloudWatchからの通知をチャットアプリケーションに転送するAWSリソース。

![ChatbotとSNSの連携](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ChatbotとSNSの連携.png)

<br>

### セットアップ

#### ▼ slack通知の場合

クライアントをSlackとした場合の設定を以下に示す。

| 設定項目        | 説明                                                         |
| --------------- | ------------------------------------------------------------ |
| Slackチャンネル | 通知の転送先のSlackチャンネルを設定する。                    |
| アクセス許可    | SNSを介して、CloudWatchにアクセスするためのロールを設定する。 |
| SNSトピック     | CloudWatchへのアクセス時経由する、SNSトピックを設定する。    |

#### ▼ サポート対象のイベント

AWSリソースのイベントを、EventBridge（CloudWatchイベント）を使用して、Chatbotに転送できるが、全てのAWSリソースをサポートしているわけではない。サポート対象のAWSリソースは以下のリンクを参考にせよ。

参考：https://docs.aws.amazon.com/ja_jp/chatbot/latest/adminguide/related-services.html#cloudwatchevents

#### ▼ インシデント

４大シグナルを含む、システム的に良くない事象のこと。

#### ▼ オンコール

インシデントを通知するようにし、通知を受けて対応すること。

<br>

## 07. CloudFront

### CloudFrontとは

クラウドリバースプロキシサーバーとして働く。VPCの外側（パブリックネットワーク）に設置されている。オリジンサーバー（コンテンツ提供元）をS3とした場合、動的コンテンツへのリクエストをEC2に振り分ける。また、静的コンテンツへのリクエストをキャッシュし、その上でS3へ振り分ける。次回以降の静的コンテンツのリンクエストは、CloudFrontがレンスポンスを行う。

![AWSのクラウドデザイン一例](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/CloudFrontによるリクエストの振り分け.png)

### セットアップ

#### ▼ 概要

| 設定項目            | 説明 |
| ------------------- | ---- |
| Distributions       |      |
| Reports & analytics |      |

<br>

### Distributions

#### ▼ Distributions

参考：https://www.geekfeed.co.jp/geekblog/wordpress%E3%81%A7%E6%A7%8B%E7%AF%89%E3%81%95%E3%82%8C%E3%81%A6%E3%81%84%E3%82%8B%E3%82%A6%E3%82%A7%E3%83%96%E3%82%B5%E3%82%A4%E3%83%88%E3%81%ABcloudfront%E3%82%92%E7%AB%8B%E3%81%A6%E3%81%A6%E9%AB%98/

| 設定項目                 | 説明                                                         | 補足 |
| ------------------------ | ------------------------------------------------------------ | ---- |
| General                  |                                                              |      |
| Origin and Origin Groups | コンテンツを提供するAWSリソースを設定する。                  |      |
| Behavior                 | オリジンにリクエストが行われた時のCloudFrontの挙動を設定する。 |      |
| ErrorPage                | 指定したオリジンから、指定したファイルのレスポンスを返信する。 |      |
| Restriction              |                                                              |      |
| Invalidation             | CloudFrontに保存されているキャッシュを削除できる。           |      |

#### ▼ General

| 設定項目            | 説明                                                                          | 補足                                                                                                                                                                                                       |
|-----------------|-----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Price Class     | 使用するエッジロケーションを設定する。                                                         | Asiaが含まれているものを選択。                                                                                                                                                                                        |
| WAF             | CloudFrontに紐付けるWAFを設定する。                                                    |                                                                                                                                                                                                          |
| CNAME           | CloudFrontのデフォルトドメイン名（```*****.cloudfront.net.```）に紐付けるRoute53レコード名を設定する。   | ・Route53からルーティングする場合は必須。<br>・複数のレコード名を設定できる。                                                                                                                                                             |
| SSL Certificate | HTTPSプロトコルでオリジンにルーティングする場合に設定する。                                            | 上述のCNAMEを設定した場合、SSL証明書が別途必要になる。また、Certificate Managerを使用する場合、この証明書は『バージニア北部』で申請する必要がある。                                                                                                                  |
| Security Policy | リクエストの送信者が使用するSSL/TLSプロトコルや暗号化方式のバージョンに合わせて、CloudFrontが受信できるこれらのバージョンを設定する。 | ・リクエストの送信者には、ブラウザ、APIにリクエストを送信する外部サービス、ルーティング元のAWSリソース、などを含む。<br>・参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/secure-connections-supported-viewer-protocols-ciphers.html |
| Default Root Object | オリジンのドキュメントルートを設定する。                                                        | ・何も設定しない場合、ドキュメントルートは指定されず、Behaviorで明示的にルーティングする必要がある。<br>・index.htmlを設定すると、『```/```』でリクエストした時に、オリジンのルートディレクトリ配下にある```index,html```ファイルがドキュメントルートになる。                                                    |
| Standard Logging | CloudFrontのアクセスログをS3に生成するかどうかを設定する。                                         |                                                                                                                                                                                                          |

#### ▼ Origin and Origin Groups

| 設定項目               | 説明                                                         | 補足                                                         |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Origin Domain Name     | CloudFrontをリバースプロキシサーバーとして、AWSリソースのエンドポイントやDNSにルーティングする。 | ・例えば、S3のエンドポイント、ALBのDNS名を設定する。<br>・別アカウントのAWSリソースのDNS名であっても良い。 |
| Origin Path            | オリジンのルートディレクトリを設定する。                     | ・何も設定しないと、デフォルトは『```/```』のなる。Behaviorでは、『```/```』の後にパスが追加される。<br>・『```/var/www/foo```』を設定すると、Behaviorで設定したパスが『```/var/www/foo/foo```』のように追加される。 |
| Origin Access Identity | リクエストのルーティング先となるAWSリソースでアクセス権限のアタッチが必要な場合に設定する。ルーティング先のAWSリソースでは、アクセスポリシーをアタッチする。 | CloudFrontがS3に対して読み出しを行うために必要。             |
| Origin Protocol Policy | リクエストのルーティング先となるAWSリソースに対して、HTTPとHTTPSのいずれのプロトコルでルーティングするかを設定する。 | ・ALBで必要。ALBのリスナーのプロトコルに合わせて設定する。<br>・```HTTP Only```：HTTPでルーティング<br>・```HTTPS Only```：HTTPSでルーティング<br>・```Match Viewer```：両方でルーティング |
| HTTPポート             | ルーティング時に指定するオリジンのHTTPのポート番号           |                                                              |
| HTTPSポート            | ルーティング時に指定するオリジンのHTTPSのポート番号          |                                                              |

#### ▼ Behavior

| 設定項目                       | 説明                                                         | 補足                                                                                                                                                                                                                                          |
| ------------------------------ | ------------------------------------------------------------ |---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Precedence                     | 処理の優先順位。                                             | 最初に構築したBehaviorが『```Default (*)```』となり、これは後から変更できないため、主要なBehaviorをまず最初に設定する。                                                                                                                                                                |
| Path pattern                   | Behaviorを行うパスを設定する。                       |                                                                                                                                                                                                                                             |
| Origin and Origin Group        | Behaviorを行うオリジンを設定する。                           |                                                                                                                                                                                                                                             |
| Viewer Protocol Policy         | HTTP/HTTPSのどちらを受信するか、またどのように変換してルーティングするかを設定 | ・```HTTP and HTTPS```：両方受信し、そのままルーティング<br>・```Redirect HTTP to HTTPS```：両方受信し、HTTPSでルーティング<br>・```HTTPS Only```：HTTPSのみ受信し、HTTPSでルーティング                                                                                                     |
| Allowed HTTP Methods           | リクエストのHTTPメソッドのうち、オリジンへのルーティングを許可するものを設定 | ・パスパターンが静的ファイルへのリクエストの場合、GETのみ許可。<br>・パスパターンが動的ファイルへのリクエストの場合、全てのメソッドを許可。                                                                                                                                                                   |
| Object Caching                 | CloudFrontにコンテンツのキャッシュを保存しておく秒数を設定する。 | ・Origin Cacheヘッダーを選択した場合、アプリケーションからのレスポンスヘッダーのCache-Controlの値が適用される。<br>・カスタマイズを選択した場合、ブラウザのTTLとは別に設定できる。                                                                                                                                   |
| TTL                            | CloudFrontにキャッシュを保存しておく秒数を詳細に設定する。   | ・Min、Max、Default、の全てを0秒とすると、キャッシュを無効化できる。<br>・『Headers = All』としている場合、キャッシュが実質無効となるため、最小TTLはゼロでなければならない。<br>・キャッシュの最終的な有効期間は、CloudFrontのTTL秒の設定、```Cache-Control```ヘッダー、```Expires```ヘッダーの値の組み合わせによって決まる。                                    |
| Whitelist Header               | Headers を参考にせよ。                                       | 参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/Expiration.html#ExpirationDownloadDist・```Accept-*****```：アプリケーションにレスポンスして欲しいデータの種類（データ型など）を指定。<br>・ ```CloudFront-Is-*****-Viewer```：デバイスタイプのboolean値が格納されている。 |
| Restrict Viewer Access         | リクエストの送信元を制限するかどうかを設定できる。           | セキュリティグループで制御できるため、ここでは設定しなくて良い。                                                                                                                                                                                                            |
| Compress Objects Automatically | レスポンス時にgzipを圧縮するかどうかを設定                   | ・クライアントからのリクエストヘッダーのAccept-Encodingにgzipが設定されている場合、レスポンス時に、gzip形式で圧縮して送信するかどうかを設定する。設定しない場合、圧縮せずにレスポンスを送信する。<br>・クライアント側のダウンロード速度向上のため、基本的には有効化する。                                                                                          |


#### ▼ オリジンに対するリクエストメッセージの構造

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
# ※プロキシ（ALBやCloudFrontなども含む）を経由している場合、それら全てのIPアドレスが順に設定される
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

#### ▼ CloudFrontとオリジン間のHTTPS通信

CloudFrontとオリジン間でHTTPS通信を行う場合、両方にSSL証明書を割り当てる必要がある。割り当てたとしても、以下の条件を満たさないとHTTPS通信を行うことはできない。CLoudFrontからオリジンに```Host```ヘッダーをルーティングしない設定の場合、オリジンが返却する証明書に『Origin Domain Name』と一致するドメイン名が含まれている必要がある。一方で、```Host```ヘッダーをルーティングしない場合、オリジンが返却する証明書に『Origin Domain Name』と一致するドメイン名が含まれているか、またはオリジンが返却する証明書に、```Host```ヘッダーの値と一致するドメイン名が含まれている必要がある。

<br>

### Reports & analytics

#### ▼ Cache statistics

リクエストに関連する様々なデータを、日付別に集計したものを確認できる。

#### ▼ Popular objects

リクエストに関連する様々なデータを、オブジェクト別に集計したものを確認できる。

<br>

### オリジンリクエストの可否、キャッシュ生成の有無

#### ▼ オリジンリクエストの可否、キャッシュ生成の有無、の決まり方

オリジンにルーティングするべきリクエストを、各種パラメーターのAll（全許可）/一部許可/None（全拒否）で設定できる。また、キャッシュ生成の有無にも関係している。CloudFrontではリクエストがJSONとして扱われており、JSONの値が過去のリクエストに合致した時のみ、そのリクエストと過去のものが同一であると見なす仕組みになっている。キャッシュ判定時のパターンを減らし、ヒット率を向上させるために、全ての項目で『None（全拒否）』を選択した方が良い。最終的に、対象のファイルがCloudFrontのキャッシュ生成の対象となっているかは、レスポンスのヘッダーに含まれる『```X-Cache:```』が『```Hit from cloudfront```』または『```Miss from cloudfront```』のどちらで判断できる。

参考：

- https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/controlling-origin-requests.html
- https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/controlling-the-cache-key.html

#### ▼ ヘッダー値に基づくキャッシュ生成

リクエストヘッダーのうち、オリジンへのルーティングを許可し、またキャッシュキーと見なすパラメーターを設定する。Cookieとクエリストリングと比べて、同じ設定でもキャッシュ生成の有無が異なることに注意する。

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/header-caching.html#header-caching-web

| 機能名           | オリジンリクエストの可否                                     | キャッシュ生成の有無                                         |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 全許可           | 全てのヘッダーのルーティングを許可する。                     | キャッシュを生成しない。                                     |
| 一部ルーティング | 一部のヘッダーのルーティングを拒否し、ヘッダーの無いリクエストをルーティングする。 | 指定したヘッダーのみをキャッシュキーとみなす。日付に関するヘッダー（Accept-Datetime）などの動的な値をキャッシュキーとしてしまうと。同一と見なすリクエストがほとんどなくなり、ヒットしなくなる。そのため、ヘッダーをオリジンにルーティングしつつ、動的になりやすい値を持つヘッダーをキャッシュキーにしないようにする必要がある。ヒット率の向上のため、クエリストリングやCookieの静的な値をキャッシュキーに設定すると良い。 |
| 全拒否           | 全てのヘッダーのルーティングを拒否し、ヘッダーの無いリクエストをルーティングする。 | キャッシュを生成しない。                                     |

#### ▼ Cookieに基づくキャッシュ生成

Cookie情報のキー名のうち、オリジンへのルーティングを許可し、またキャッシュキーと見なすパラメーターを設定する。リクエストのヘッダーに含まれるCookie情報（キー名/値）が変動していると、CloudFrontに保存されたキャッシュがヒットしない。CloudFrontはキー名/値を保持するため、変化しやすいキー名/値は、オリジンにルーティングしないように設定する。例えば、GoogleAnalyticsのキー名（```_ga```）の値は、ブラウザによって異なるため、１ユーザーがブラウザを変えるたびに、異なるキャッシュが生成されることになる。そのため、ユーザーを一意に判定することが難しくなってしまう。GoogleAnalyticsのキーはブラウザからAjaxでGoogleに送信されるもので、オリジンにとっても基本的に不要である。セッションIDは```Cookie```ヘッダーに設定されているため、フォーム送信に関わるパスパターンでは、セッションIDのキー名を許可する必要がある。

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/Cookies.html

| 機能名           | オリジンリクエストの可否                                     | キャッシュ生成の有無                                         |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 全許可           | 全てのCookieのルーティングを許可する。                       | 全てのCookieをキャッシュキーとみなす。                       |
| 一部ルーティング | 一部のCookieのルーティングを拒否し、Cookieの無いリクエストをルーティングする。 | 指定したCookieのみキャッシュキーとみなす。Cookieはユーザーごとに一意になることが多く、動的であるが、それ以外のヘッダーやクエリ文字でキャッシュを判定するようになるため、同一と見なすリクエストが増え、ヒット率の向上につながる。 |
| 全拒否           | 全てのCookieのルーティングを拒否し、Cookieの無いリクエストをルーティングする。 | キャッシュを生成しない。                                     |

#### ▼ クエリストリングに基づくキャッシュ生成

クエリストリングのうち、オリジンへのルーティングを許可し、またキャッシュキーと見なすパラメーターを設定する。異なるクエリパラメーターのキャッシュを別々に作成するかどうかを設定できる。

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/QueryStringParameters.html

| 機能名   | オリジンリクエストの可否                                     | キャッシュ生成の有無                                   |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| 全許可   | 全てのクエリストリングのルーティングを許可する。             | 全てのクエリストリングをキャッシュキーとみなす。       |
| 一部拒否 | 一部のクエリストリングのルーティングを拒否し、クエリストリングの無いリクエストをオリジンにルーティングする。 | 指定したクエリストリングのみをキャッシュキーとみなす。 |
| 全拒否   | 全てのクエリストリングのルーティングを拒否し、クエリストリングの無いリクエストをルーティングする。 | キャッシュを生成しない。                               |

#### ▼ Cookieやクエリストリングをオリジンにルーティングしつつ、キャッシュを生成しない場合

上記の設定では、Cookieやクエリストリングをオリジンにルーティングしつつ、キャッシュを生成しないようにできない。そこで、キャッシュの最大最小デフォルトの有効期間を```0```秒とすることにより、結果的にキャッシュを機能しないようにさせ、キャッシュが生成されていないかのように見せかけられる。

<br>

### ヘッダーキャッシュのヒット率向上

#### ▼ ヒット率の向上について

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/header-caching.html

<br>

### Cookieキャッシュのヒット率向上

#### ▼ ヒット率の向上について

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/Cookies.html

<br>

### クエリストリングキャッシュのヒット率向上

#### ▼ ヒット率の向上について

CloudFrontは、クエリストリングによってオリジンからレスポンスされるファイルのキャッシュを作成し、次回、同じクエリストリングであった場合、キャッシュをレスポンスとして返信する。キャッシュ作成のルールを理解すれば、キャッシュのヒット率を向上させられる。

参考：

- https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/cache-hit-ratio.html#cache-hit-ratio-query-string-parameters
- https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/QueryStringParameters.html#query-string-parameters-optimizing-caching

#### ▼ クエリストリングの順番を固定する

リクエスト時のクエリストリングの順番が異なる場合、CloudFrontはそれぞれを異なるURLに対するリクエストと見なし、別々にキャッシュを作成する。そのため、クエリストリングの順番を固定するようにURLを設計すれば、キャッシュのヒット率を向上させられる。

```http
GET https://example.com?fooId=1&barId=2
```

```http
GET https://example.com?barId=2&fooId=1
```

#### ▼ クエリストリングの大文字小文字表記を固定する

リクエスト時のクエリストリングの大文字小文字表記が異なる場合、CloudFrontはそれぞれを異なるURLに対するリクエストと見なし、別々にキャッシュを作成する。そのため、クエリストリングの大文字小文字表記を固定するようにURLを設計すれば、キャッシュのヒット率を向上させられる。

```http
GET https://example.com?fooId=1&barId=2
```

```http
GET https://example.com?FooId=1&BarId=2
```

#### ▼ 署名付きURLと同じクエリストリングを使用しない

S3には、署名付きURLを発行する機能がある。CloudFrontの仕様では、署名付きURLに含まれる```Expires```、```Key-Pair-Id```、```Policy```、```Signature```といったクエリストリングを削除したうえで、オリジンにリクエストをルーティングする。これらのパラメーターは、キャッシュヒットの判定要素として使えない。そのため、URLの設計時にこれらを使用しないようにする。

<br>

### Invalidation（キャッシュの削除）

TTL秒によるキャッシュの自動削除を待たずに、手動でキャッシュを削除できる。全てのファイルのキャッシュを削除したい場合は『```/*```』、特定のファイルのキャッシュを削除したい場合は『```/<ファイルへのパス>```』、を設定する。CloudFrontに関するエラーページが表示された場合、不具合を修正した後でもキャッシュが残っていると、エラーページが表示されてしまうため、作業後には必ずキャッシュを削除する。

<br>

### エッジロケーションとエッジサーバー

#### ▼ Point Of Presence

CloudFrontは世界中に設置される『Point Of Presence（エッジロケーション＋中間層キャッシュ）』にデプロイされる。

参考：https://aws.amazon.com/jp/cloudfront/features/?whats-new-cloudfront.sort-by=item.additionalFields.postDateTime&whats-new-cloudfront.sort-order=desc

#### ▼ エッジロケーションにおける全エッジサーバーのIPアドレス

CloudFrontには、エッジロケーションの数だけエッジサーバーがあり、各サーバーにIPアドレスが割り当てられている。以下のコマンドで、全てのエッジサーバーのIPアドレスを確認できる。

```bash
$ curl https://ip-ranges.amazonaws.com/ip-ranges.json \
  | jq  ".prefixes[]| select(.service=="CLOUDFRONT") | .ip_prefix"
```

もしくは、以下のリンクを直接的に参考し、『```"service": "CLOUDFRONT"```』となっている部分を探す。

参考：https://ip-ranges.amazonaws.com/ip-ranges.json

#### ▼ エッジロケーションの使用中サーバーのIPアドレス

CloudFrontには、エッジロケーションがあり、各ロケーションにサーバーがある。以下のコマンドで、エッジロケーションにある使用中サーバーのIPアドレスを確認できる。

```bash
$ nslookup <割り当てられた文字列>.cloudfront.net
```

<br>

### カスタムエラーページ

#### ▼ カスタムエラーページとは

オリジンに該当のファイルが存在しない場合、オリジンはCloudFrontに以下の```403```ステータスのレスポンスを返信する。カスタムエラーページを設定しない場合、CloudFrontはこの```403```ステータスをそのままレスポンスしてしまうため、オリジンに配置したカスタムエラーページを```404```ステータスでレスポンスするように設定する。

```
This XML file does not appear to have any style information associated with it. The document tree is shown below.
<Error>
<Code>AccessDenied</Code>
<Message>Access Denied</Message>
<RequestId>*****</RequestId>
<HostId>*****</HostId>
</Error>
```

#### ▼ 設定方法

オリジンからカスタムエラーページをレスポンスするパスパターンを定義する。Lamnda@Edgeを使用したCloudFrontの場合は、Lambda@Edgeを経由して、カスタムエラーページをレスポンスする必要がある。

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/HTTPStatusCodes.html

<br>

## 08. CloudTrail

### CloudTrailとは

IAMユーザーによる操作や、ロールのアタッチの履歴を記録し、ログファイルとしてS3に転送する。CloudWatchと連携もできる。

![CloudTrailとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/CloudTrailとは.jpeg)

<br>

## 09. CloudWatch

### CloudWatchエージェント

#### ▼ CloudWatchエージェントとは

インスタンス内で稼働する常駐システムのこと。インスタンス内のデータを収集し、CloudWatchに対して送信する。

#### ▼ CloudWatchエージェントの設定

| セクションの種類        | 説明                                   | 補足                                                         |
| ----------------------- | -------------------------------------- | ------------------------------------------------------------ |
| ```agent```セクション   | CloudWatchエージェント全体を設定する。 | ・ウィザードを使用した場合、このセクションの設定はスキップされる。<br>・実装しなかった場合、デフォルト値が適用される。 |
| ```metrics```セクション |                                        | ・ウィザードを使用した場合、このセクションの設定はスキップされる。<br>・実装しなかった場合、何も設定されない。 |
| ```logs```セクション    |                                        |                                                              |

CloudWatchエージェントは、```/opt/aws/amazon-cloudwatch-agent/bin/config.json```ファイルの定義を元に、実行される。設定ファイルは分割できる。設定後、```amazon-cloudwatch-agent-ctl```コマンドで設定ファイルを読み込ませる。CloudWatchエージェントを使用して、CloudWatchにログファイルを送信するだけであれば、設定ファイル（```/opt/aws/amazon-cloudwatch-agent/bin/config.json```）には```log```セッションのみの実装で良い。```run_as_user```には、プロセスのユーザー名（例：```cwagent```）を設定する。

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

#### ▼ ログ送信権限

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/logs/AWS-logs-and-resource-policy.html

#### ▼ 操作コマンド

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

### OSの起動と同時に、エージェントが稼働するように設定されているかを確認
$ systemctl list-unit-files --type=service
```

<br>

## 09-02. CloudWatchメトリクス

### CloudWatchメトリクスとは

AWSリソースで発生したデータポイントのメトリクスを収集する。

<br>

### ディメンション、名前空間、メトリクス名

#### ▼ 分類

| 分類群         | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| ディメンション | インスタンスの設定値を単位とした収集グループのこと。設定値によるグループには、例えばインスタンス別、スペック別、AZ別、などがある。 |
| 名前空間       | AWSリソースを単位とした収集グループのこと。AWSリソース名で表現される。 |
| メトリクス名   | 集計対象のデータポイントの発生領域を単位とした収集グループのこと。データポイントの発生領域名で表現される。 |

#### ▼ 概念図

参考：

- https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html
- https://www.slideshare.net/AmazonWebServicesJapan/20190326-aws-black-belt-online-seminar-amazon-cloudwatch

![metrics_namespace_dimension](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/metrics_namespace_dimension.png)

CloudWatchメトリクス上では、以下のように確認できる。

![cloudwatch_namespace_metric_dimension](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/cloudwatch_namespace_metric_dimension.png)

<br>

### 注視するべきメトリクス一覧

#### ▼ ALB

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

#### ▼ API Gateway

API Gatewayで注視するべきメトリクスを示す。

参考：https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html#api-gateway-metrics

| メトリクス名       | 単位       | 説明                                                         |
| ------------------ | ---------- | ------------------------------------------------------------ |
| IntegrationLatency | マイクロ秒 | API Gatewayがリクエストをバックエンドにルーティングしてから、バックエンドからレスポンスを受信するまでを表す。 |
| Latency            | マイクロ秒 | API Gatewayがクライアントからリクエストを受信してから、クライアントにこれを返信するまでを表す。 |
| 4XXError           | カウント   |                                                              |
| 5XXError           | カウント   | アプリケーションが停止してしまうようなインシデントを検出することに適する。 |

#### ▼ EC2

EC2で注視するべきメトリクスを示す。

参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/viewing_metrics_with_cloudwatch.html#ec2-cloudwatch-metrics

| メトリクス名               | 単位     | 説明                                                         |
| -------------------------- | -------- | ------------------------------------------------------------ |
| StatusCheckFailed_Instance | カウント | インスタンスのインスタンスステータスの失敗数を表す。インスタンスが停止してしまうようなインシデントに適する。反対に、インスタンスが正常に稼働していて、プロセスが停止しているようなインシデントを検出することには不適である。<br>参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/monitoring-system-instance-status-check.html#types-of-instance-status-checks |
| StatusCheckFailed_System   | カウント | インスタンスのシステムステータスの失敗数を表す。AWSの障害によるインシデントの検出に適する。<br>参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/monitoring-system-instance-status-check.html#types-of-instance-status-checks |

#### ▼ ECS

ECSクラスターまたはサービスで注視するべきメトリクスを示す。ClusterNameディメンションとServiceNameディメンションを使用して、ECSクラスターとECSサービスのメトリクスを区別できる。

参考：https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/cloudwatch-metrics.html#available_cloudwatch_metrics

| メトリクス名      | 単位     | 説明                                                         | 補足                                                         |
| ----------------- | -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| CPUUtilization    | %        | ECSクラスターまたはサービスで使用されているCPU使用率を表す。 |                                                              |
| MemoryUtilization | %        | ECSクラスターまたはサービスで使用されているメモリ使用率を表す。 |                                                              |
| RunningTaskCount  | カウント | 稼働中のECSタスク数を表す。                                  | ECSタスク数の増減の遷移から、デプロイのおおよその時間がわかる。 |

#### ▼ RDS（Aurora）

RDS（Aurora）で注視するべきメトリクスを示す。

参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/AuroraUserGuide/Aurora.AuroraMySQL.Monitoring.Metrics.html

| メトリクス名        | 単位     | 説明                                                         | 補足                                                         |
| ------------------- | -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| CPUUtilization      | %        | Aurora DBインスタンスのCPU使用率を表す。                     |                                                              |
| DatabaseConnections | カウント | Aurora DBインスタンスへの接続数を表す。失敗した接続も含まれている可能性があり、実際よりはやや多めに計測される。 | クライアントがDBにアクセスしている時間帯がわかるため、メンテナンスウィンドウを実施時間の参考になる。 |
| FreeableMemory      | Bytes    | Aurora DBインスタンスの使用できるメモリ容量を表す。          |                                                              |
| EngineUptime        | 秒       | インスタンスの起動時間を表す。                               | ダウンタイムの最低発生時間の参考になる。                     |

#### ▼ RDS（非Aurora）

RDS（非Aurora）で注視するべきメトリクスを示す。RDSのコンソール画面にも同じメトリクスが表示されるが、単位がMByteであり、CloudWatchメトリクスと異なることに注意する。

参考：https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/monitoring-cloudwatch.html#rds-metrics

| メトリクス名        | 単位     | 説明                                                         | 補足                                                         |
| ------------------- | -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| CPUUtilization      | %        | DBインスタンスのCPU使用率を表す。                            |                                                              |
| DatabaseConnections | カウント | DBインスタンスへの接続数を表す。失敗した接続も含まれている可能性があり、実際よりはやや多めに計測される。 | クライアントがDBにアクセスしている時間帯がわかるため、メンテナンスウィンドウを実施時間の参考になる。 |
| FreeableMemory      | Bytes    | DBインスタンスの使用できるメモリ容量を表す。                 |                                                              |

<br>

### インサイトメトリクス

#### ▼ インサイトメトリクスは

複数のCloudWatchメトリクスの結果を集計し、パフォーマンスに関するデータを収集する。

#### ▼ パフォーマンスインサイト

RDS（Aurora、非Aurora）のパフォーマンスに関するメトリクスを収集する。SQLレベルで監視できるようになる。パラメーターグループの```performance_schema```を有効化する必要がある。対応するエンジンバージョンとインスタンスタイプについては、以下のリンクを参考にせよ。

参考：

- https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/AuroraUserGuide/USER_PerfInsights.Enabling.html
- https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/USER_PerfInsights.Overview.Engines.html

#### ▼ Containerインサイト

ECS/EKSのパフォーマンスに関するメトリクスを収集する。ECSクラスター/EKSクラスター、ECSサービス、ECSタスク、ECSコンテナ、単位で監視できるようになる。また、コンテナ間の繋がりをコンテナマップで視覚化できるようになる。ECS/EKSのアカウント設定でContainerインサイトを有効化する必要がある。

#### ▼ Lambdaインサイト

Lambdaのパフォーマンスに関するメトリクスを収集する。

<br>

## 09-03. CloudWatchログ

### CloudWatchログ

クラウドログサーバーとして働く。AWSリソースで生成されたログを収集できる。ログについては、以下のリンクを参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/observability_monitoring/observability.html

<br>

### セットアップ

#### ▼ 概要

| 設定項目                     | 説明                                                         | 補足                                                         |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ロググループ                 | ログストリームをグループ化して収集するかどうかを設定する。   | 基本的に、ログファイルはグループ化せずに、1つのロググループには1つのログストリームしか含まれないようにする。 |
| メトリクスフィルター         | フィルターパターンに合致した文字列を持つログをトリガーとして、データポイントを発生させる。これを収集するメトリクスを設定する。 |                                                              |
| サブスクリプションフィルター |                                                              |                                                              |

<br>

### フィルターパターン

#### ▼ フィルターパターンとは

ログ内で検知する文字列を設定する。大文字と小文字を区別するため、網羅的に設定する必要がある。

参考：

- https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/logs/FilterAndPatternSyntax.html
- https://qiita.com/shimajiri/items/81a4ed0fe39fe337fedb

#### ▼ OR条件

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

#### ▼ 除外条件

**＊例＊**

『```ERROR:```』が含まれ、かつ『```MethodNotAllowedHttpException```』が含まれないログを検知する。OR条件と除外条件を組み合わせようとすると、OR条件が認識されずに除外条件だけが適用されてしまう。そのため、ここではOR条件を使用していない。

参考：https://dev.classmethod.jp/articles/cloudwatch-metricsfilter-filterpattern/

```bash
"ERROR:" -MethodNotAllowedHttpException
```

<br>

### CloudWatchログエージェント（非推奨）

#### ▼ CloudWatchログエージェントとは

インスタンス内で稼働する常駐システムのこと。インスタンス内のデータを収集し、CloudWatchログに対して送信する。2020/10/05現在は非推奨で、CloudWatchエージェントへの設定の移行が推奨されている。

#### ▼ ```/var/awslogs/etc/awslogs.conf```ファイル

CloudWatchログエージェントを設定する。OS、ミドルウェア、アプリケーションに分類して設定すると良い。

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/logs/AgentReference.html#agent-configuration-file

**＊実装例＊**

```ini
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

# バッファーに蓄える期間
buffer_duration = 5000

# 要勉強
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

#### ▼ コマンド

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

#### ▼ Logインサイトとは

クエリを使用してログを抽出する。

#### ▼ クエリ例

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

## 09-04. CloudWatchアラーム

### セットアップ

#### ▼ ログが先の場合

| 設定項目     | 説明                                                         | 補足                                                 |
| ------------ | ------------------------------------------------------------ | ---------------------------------------------------- |
| 名前空間     | 紐付くロググループが属する名前空間を設定する。CloudWatchログが、設定した名前空間に対して、値を発行する。 |                                                      |
| メトリクス   | 紐付くロググループが属する名前空間内のメトリクスを設定する。CloudWatchログが、設定したメトリクスに対して、値を発行する。 |                                                      |
| メトリクス値 | フィルターパターンでログが検知された時に、データポイントとして発生させる値のこと。 | 例えば『検出数』を発行する場合は、『１』を設定する。 |

#### ▼ メトリクスが対象の場合



#### ▼ 条件

| 設定項目                         | 説明                                                       | 補足                                                         |
| -------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ |
| 閾値の種類                       |                                                            |                                                              |
| アラームを実行するデータポイント | アラートを発生させるデータポイント数を設定する。           |                                                              |
| 欠落データの処理                 | データポイントが発生しないことをどう判定するかを設定する。 | データポイントが発生しないことを正常と見なす場合は『```notBreaching```』とし、発生しないことを異常とする場合は、『```breaching```』とする。<br>参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html#alarms-and-missing-data |

<br>

## 09-05. CloudWatchシンセティック

### CloudWatchシンセティックとは

合成監視を行えるようになる。

<br>

## 10. Code系サービス

### Code系サービス

#### ▼ CodePipeline

CodeCommit、CodeBuild、CodeDeployを連携させて、AWSに対するCI/CD環境を構築する。CodeCommitは、他のコード管理サービスで代用できる。

![code-pipeline](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/code-pipeline.png)

#### ▼ CodeCommit

コードをバージョン管理する。

#### ▼ CodeBuild

ビルドフェーズとテストフェーズを実行する。

#### ▼ CodeDeploy

デプロイフェーズを実行する。

<br>

## 10-02. Code系サービス：CodeBuild

### 設定ファイル

#### ▼ ```buildspec.yml```ファイル

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
      # バージョンタグはGitHubコミットのハッシュ値を使用
      - VERSION_TAG=$CODEBUILD_RESOLVED_SOURCE_VERSION
      # ECRのURLをCodeBuildの環境変数から作成
      - REPOSITORY_URI=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${IMAGE_REPO_NAME}
  build:
    commands:
      # タグ付けしてイメージをビルド
      - docker build -t REPOSITORY_URI:$VERSION_TAG -f Dockerfile .
  postBuild:
    commands:
      # ECRにイメージをプッシュ
      - docker push $REPOSITORY_URI:$VERSION_TAG
      # ECRにあるデプロイ先のイメージの情報（imageDetail.json）
      - printf "{"Version":"1.0","ImageURI":"%s"}" $REPOSITORY_URI:$VERSION_TAG > imageDetail.json
    
# デプロイ対象とするビルドのアーティファクト    
artifacts:
  files: imageDetail.json
```

<br>

## 10-03. Code系サービス：CodeDeploy

### 利用できるデプロイメント手法

#### ▼ ECSの場合

ローリングアップデート、ブルー/グリーンデプロイメント、を利用できる。

参考：https://docs.aws.amazon.com/ja_jp/codedeploy/latest/userguide/deployments.html

#### ▼ EC2の場合

インプレースデプロイ、ブルー/グリーンデプロイメント、を利用できる。

参考：https://docs.aws.amazon.com/ja_jp/codedeploy/latest/userguide/deployments.html

#### ▼ Lambdaの場合

ブルー/グリーンデプロイメント、を利用できる。

参考：https://docs.aws.amazon.com/ja_jp/codedeploy/latest/userguide/deployments.html

<br>

### ECSタスクのローリングアップデート

#### ▼ ```imagedefinitions.json```ファイル

新しいリビジョン番号のタスク定義を作成するために、新しいコンテナ名とイメージリポジトリURLを定義する。リポジトリに事前に配置するのではなく、CI/CDの中で動的に作成するようにした方が良い。

参考：

- https://docs.aws.amazon.com/ja_jp/codepipeline/latest/userguide/file-reference.html#pipelines-create-image-definitions
- https://ngyuki.hatenablog.com/entry/2021/04/07/043415

```bash
[
  {
    "imageUri": "<イメージリポジトリURL>", # <アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/<イメージリポジトリ名>:latest
    "name": "<コンテナ名>"
  }
]
```

<br>

### ECSタスクのブルー/グリーンデプロイメント

#### ▼ 仕組み

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

#### ▼ ```appspec.yml```ファイル

ルートディレクトリの直下に配置しておく。仕様として、複数のコンテナをデプロイできない。タスク定義名を```<TASK_DEFINITION>```とすると、```taskdef.json```ファイルの値を元にして、新しいタスク定義が自動的に代入される。

参考：https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-resources.html

```yaml
version: 0.0

Resources:
  - TargetService:
      # 使用するAWSリソース
      Type: AWS::ECS::Service
      Properties:
        # 使用するタスク定義
        TaskDefinition: "<TASK_DEFINITION>"
        # 使用するロードバランサー
        LoadBalancerInfo:
          ContainerName: "<コンテナ名>"
          ContainerPort: "80"
        PlatformVersion: "1.4.0"
```

#### ▼ ```imageDetail.json```ファイル

新しいバージョンタグを含むイメージリポジトリURLを、```taskdef.json```ファイルの ```<IMAGE1_NAME>```に代入するために必要である。これはリポジトリに事前に配置するのではなく、CI/CDの中で動的に作成するようにした方が良い。

参考：

- https://docs.aws.amazon.com/ja_jp/codepipeline/latest/userguide/file-reference.html#file-reference-ecs-bluegreen
- https://ngyuki.hatenablog.com/entry/2021/04/07/043415

#### ▼ ```taskdef.json```ファイル

デプロイされるタスク定義を実装し、ルートディレクトリの直下に配置する。CodeDeployは、CodeBuildから渡された```imageDetail.json```ファイルを検知し、ECRからイメージを取得する。この時、```taskdef.json```ファイルのイメージ名を```<IMAGE1_NAME>```としておくと、```imageDetail.json```ファイルの値を元にして、新しいバージョンタグを含むイメージリポジトリURLが自動的に代入される。

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
          "awslogs-group": "<ログストリーム名>",
          # スタックトレースのログを紐付けられるように、日付で区切るようにする。
          "awslogs-datetime-format": "\\[%Y-%m-%d %H:%M:%S\\]",
          "awslogs-region": "ap-northeast-1",
          "awslogs-stream-prefix": "<ログストリーム名の接頭辞>"
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

クラウドサーバーとして働く。注意点があるものだけまとめる。ベストプラクティスについては、以下のリンクを参考にせよ。

参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ec2-best-practices.html

<br>

### セットアップ

#### ▼ 概要

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

#### ▼ ダウンタイムの発生条件

以下の条件の時にEC2にダウンタイムが発生する。EC2を冗長化している場合は、ユーザーに影響を与えずに対処できる。ダウンタイムが発生する方のインスタンスを事前にALBのターゲットグループから解除しておき、停止したインスタンスが起動した後に、ターゲットグループに再登録する。

| 変更する項目                       | ダウンタイムの有無 | 補足                                                         |
| ---------------------------------- | ------------------ | ------------------------------------------------------------ |
| インスタンスタイプ                 | あり               | インスタンスタイプを変更するためにはEC2を停止する必要がある。そのため、ダウンタイムが発生する。 |
| ホスト物理サーバーのリタイアメント | あり               | AWSから定期的にリタイアメントに関する警告メールが届く。ルートデバイスタイプが『EBS』の場合、ホスト物理サーバーの引っ越しを行うためにEC2の停止と起動が必要である。そのため、ダウンタイムが発生する。なお、再起動では引っ越しできない。 |

<br>

### インスタンスタイプ

#### ▼ 世代と大きさ

『世代』と『大きさ』からなる名前で構成される。世代の数字が上がるにつれて、より小さな世代と同じ大きさであっても、パフォーマンスと低コストになる。AMIのOSのバージョンによっては、新しく登場したインスタンスタイプを適用できないことがあるため注意する。例えば、CentOS 6系のAMIでは、```t3.small```を選択できない。

参考：https://aws.amazon.com/marketplace/pp/prodview-gkh3rqhqbgzme?ref=cns_srchrow

|        | 機能名                                                       |
| ------ | ------------------------------------------------------------ |
| 世代   | ```t2```、```t3```、```t3a```、```t4g```、```a1```           |
| 大きさ | ```nano```、```small```、```medium```、```large```、```xlarge```、```2xlarge``` |

#### ▼ CPUバーストモード

バーストモードのインスタンスタイプの場合、一定水準のベースラインCPU使用率を提供しつつ、これを超過できる。CPU使用率がベースラインを超えたとき、超過した分だけEC2はCPUクレジットを消費する。CPUクレジットは一定の割合で回復する。蓄積できる最大CPUクレジット、クレジットの回復率、ベースラインCPU使用率は、インスタンスタイプによって異なる。詳しくは以下のリンクを参考にせよ。

参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/burstable-performance-instances.html

<br>

### ルートデバイスボリューム

#### ▼ ルートデバイスボリュームとは

EC2インスタンスは、ルートデバイスボリュームがマウントされたパーティションを読み込んで起動する。

参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/RootDeviceStorage.html

#### ▼ EBSボリューム

![ec2_ebs-backed-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ec2_ebs-backed-instance.png)

EBSで管理されているルートデバイスボリュームで、推奨の方法である。インスタンスストアボリュームとは異なり、コンピューティングとして機能するEC2インスタンスと、ストレージとして機能するEBSが分離されている。そのため、EBSボリュームの永続化を設定した場合に。EC2インスタンスが誤って削除されてしまったとしても、データを守める。また、両者が分離されていないインスタンスボリュームと比較して、再起動が早いため、再起動に伴うダウンタイムが短い。ただし、

参考：

- https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/RootDeviceStorage.html#RootDeviceStorageConcepts
- https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device
- https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/RootDeviceStorage.html#Using_RootDeviceStorage

#### ▼ インスタンスストアボリューム

![ec2_instance-store-backed-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ec2_instance-store-backed-instance.png)

インスタンスストアで管理されているルートデバイスボリュームで、非推奨の方法である。インスタンスストアボリュームは、EC2インスタンスが終了すると一緒に削除されてしまう。

参考：

- https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/RootDeviceStorage.html#RootDeviceStorageConcepts
- https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device

<br>

### キーペア

#### ▼ キーペアのフィンガープリント値

ローカルマシンに配置されている秘密鍵が、該当するEC2に配置されている公開鍵とペアなのかどうか、フィンガープリント値を照合して確認する方法

```bash
$ openssl pkcs8 \
    -in <秘密鍵名>.pem \
    -inform PEM \
    -outform DER \
    -topk8 \
    -nocrypt | openssl sha1 -c
```

#### ▼ EC2へのSSH接続

クライアントのSSHプロトコルのパケットは、まずインターネットを経由して、Internet Gatewayを通過する。その後、Route53、ALBを経由せず、そのままEC2へ向かう。

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

#### ▼ EBS-backed AMI

EBSボリュームを持つEC2インスタンスを構築するAMIのこと。

参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device

#### ▼ instance store-backed AMI

インスタンスストアボリュームを持つEC2インスタンスを構築するAMIのこと。

参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ComponentsAMIs.html#storage-for-the-root-device

<br>

### AMI OS

#### ▼ Amazon Linux

#### ▼ CentOS

ベンダー公式あるいは非公式が提供しているAMIが区別しにくいので、確実に公式ベンダーが提供しているもの選択すること。

参考： https://wiki.centos.org/Cloud/AWS

<br>

## 11-03. EC2 with EBS：Elastic Block Storage

### EBSとは

EC2のクラウド内蔵ストレージとして働く。

<br>

### セットアップ

#### ▼ EBSボリュームタイプとストレージの関係

| EBSボリュームタイプ     | ストレージの種類 |
| ----------------------- | ---------------- |
| 汎用SSD                 | SSD              |
| プロビジョンド IOPS SSD | SSD              |
| スループット最適化 HDD  | HDD              |
| Cold HDD                | HDD              |

<br>

### EBSボリュームの選択

#### ▼ 下限EBSボリュームサイズ

一般的なアプリケーションであれば、最低限20～30GiBのEBSボリュームサイズがあると良い。しかし、踏み台サーバーの場合、プライベートサブネットに接続するための足場としての用途しかなく、大きなボリュームを組み込む必要がない。そこでできるだけ最小限のボリュームを選択し、ストレージ合計を抑える必要がある。OSによって下限ボリュームサイズが異なることに注意する。

| OS           | 仮想メモリ | 下限EBSボリュームサイズ |
| ------------ | ---------- | ----------------------- |
| Amazon Linux | t2.micro   | 8                       |
| CentOS       | t2.micro   | 10                      |

<br>

### EBSボリュームの永続化

#### ▼ EBSボリュームの永続化とは

EC2の初期構築時に、ストレージの追加の項目で『終了時に削除』の設定を無効化しておく。これにより、EC2インスタンスが削除されても、EBSボリュームを削除しないようにできる。

参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/RootDeviceStorage.html#Using_RootDeviceStorage

#### ▼ EC2インスタンスの構築後に永続化する

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

#### ▼ 注意点

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

#### ▼ スナップショットとは

EBSボリュームのコピーのこと。ソフトウェアとEBSボリュームのコピーの両方が内蔵されたAMIとは区別すること。

参考：https://aws.typepad.com/sajp/2014/04/trainingfaqbest10.html

<br>

## 13. ECR

### ECRとは

dockerイメージやHelmチャートを管理できる。

<br>

### セットアップ

| 設定項目                 | 説明                                                   | 補足                                                         |
| ------------------------ |------------------------------------------------------| ------------------------------------------------------------ |
| 可視性                   | イメージリポジトリをパブリックあるいはプライベートにするかを設定する。                  | 様々なベンダーがパブリックリポジトリでECRイメージを提供している。<br>参考：https://gallery.ecr.aws/ |
| タグのイミュータビリティ | 同じタグ名でイメージがプッシュされた場合、バージョンタグを上書きできる/できないかを設定できる。     | -                                                            |
| プッシュ時にスキャン     | イメージがプッシュされた時に、イメージにインストールされているパッケージの脆弱性を検証し、一覧表示する。 | 参考：https://docs.aws.amazon.com/ja_jp/AmazonECR/latest/userguide/image-scanning.html |
| 暗号化設定               | -                                                    | -                                                            |

<br>

### イメージのプッシュ

#### ▼ Dockerイメージの場合

参考：https://docs.aws.amazon.com/ja_jp/AmazonECR/latest/userguide/docker-push-ecr-image.html

（１）ECRにログインする。

```bash
$ aws ecr get-login-password --region ap-northeast-1 | docker login \
    --username AWS \
    --password-stdin <イメージリポジトリURL>

Login Succeeded
```

（２）イメージにタグを付与する。

```bash
$ docker tag <イメージID> <イメージリポジトリURL>:<バージョンタグ>
```

（３）ECRにイメージをプッシュする。

```bash
$ docker push <イメージリポジトリURL>:<バージョンタグ>
```

#### ▼ Helmチャートの場合

参考：https://docs.aws.amazon.com/ja_jp/AmazonECR/latest/userguide/push-oci-artifact.html

<br>

### ライフサイクル

#### ▼ ライフサイクルポリシー

ECRのイメージの有効期間を定義できる。

| 設定項目             | 説明                                                         | 補足                                                         |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ルールの優先順位     | 順位の大きさで、ルールの優先度を設定できる。                 | 数字は連続している必要はなく、例えば、10、20、90、のように設定しても良い。 |
| イメージのステータス | ルールを適用するイメージの条件として、タグの有無や文字列を設定できる。 |                                                              |
| 一致条件             | イメージの有効期間として、同条件に当てはまるイメージが削除される閾値を設定できる。 | 個数、プッシュされてからの期間、などを閾値として設定できる。 |

<br>

### バージョンタグ

#### ▼ タグ名のベストプラクティス

Dockerのベストプラクティスに則り、タグ名にlatestを使用しないようにする。その代わりに、イメージのバージョンごとに異なるタグ名になるようハッシュ値（例：GitHubのコミットID）を使用する。

参考：https://matsuand.github.io/docs.docker.jp.onthefly/develop/dev-best-practices/

<br>

## 14. ECS/EKS：Elastic Container/Kubernetes Service

### ECS/EKSとは

コンテナオーケストレーションを実行する環境を提供する。VPCの外に存在している。ECS、EKS、Fargate、EC2の対応関係は以下の通り。

| Control Plane（コンテナオーケストレーション環境） | Data Plane（コンテナ実行環境） | 説明                                                         |
| ------------------------------------------------- | ------------------------------ | ------------------------------------------------------------ |
| ECS：Elastic Container Service                    | Fargate、EC2                   | 単一のOS上でコンテナオーケストレーションを実行する。         |
| EKS：Elastic Kubernetes Service                   | Fargate、EC2                   | 複数のOS上それぞれでコンテナオーケストレーションを実行する。<br>参考：https://www.sunnycloud.jp/column/20210315-01/ |

<br>

### ECS vs EKS

どちらもイメージをビルドする機能は無く、コンテナオーケストレーションのみを実行する。ビルド済みのイメージをECRで管理しておき、コンテナオーケストレーション時にこれをプルする。

参考：https://zenn.dev/yoshinori_satoh/articles/2021-02-13-eks-ecs-compare

![ecs_eks](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_eks.png)

<br>

## 14-02. ECSデータプレーン

### ECSクラスター

ECSサービスの管理グループ単位のこと。

参考：https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/userguide/clusters.html

![ECSクラスター](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ECSクラスター.png)

<br>

### ECSサービス

ECSタスクの管理グループ単位のこと。ECSタスクへのロードバランシング、タスクの数の維持管理や、リリースの成否の管理を行う。

参考：https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/userguide/service_definition_parameters.html

<br>

### ECSタスク

#### ▼ ECSタスク

コンテナインスタンスの管理グループ単位のこと。タスク定義を基に作成される。

![タスクとタスク定義](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/タスクとタスク定義.png)

#### ▼ タスク定義

ECSタスクをどのような設定値を基に構築するかを設定できる。タスク定義は、バージョンを示す『リビジョンナンバー』で番号づけされる。タスク定義を削除するには、全てのリビジョン番号のタスク定義を登録解除する必要がある。

#### ▼ タスクライフサイクル

![ecs-task_life-cycle](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs-task_life-cycle.png)

ECSタスクは、必須コンテナ異常停止時、デプロイ、自動スケーリング、手動操作、の時にライフサイクルを持つ。AWS側の操作が終了した時点でRunningステータスになるが、コンテナの起動に時間がかかるようなアプリケーション（例：SSR）の場合は、Runningステータスであっても使用できる状態ではないことに注意する。

参考：https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/task-lifecycle.html#lifecycle-states

正常停止と異常停止に関わらず、停止理由を確認できる。

参考：https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/stopped-task-errors.html

<br>

### FireLensコンテナ

以下のリンクを参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/observability_monitoring/observability_fluentbit_firelens.html

<br>

## 14-02-03. ECS on EC2

### EC2起動タイプのコンテナ

#### ▼ タスク配置戦略

ECSタスクをECSクラスターに配置する時のアルゴリズムを選択できる。

| 戦略    | 説明                                           |
| ------- | ---------------------------------------------- |
| Spread  | ECSタスクを各場所にバランスよく配置する        |
| Binpack | ECSタスクを1つの場所にできるだけ多く配置する。 |
| Random  | ECSタスクをランダムに配置する。                |

<br>

## 14-02-04. ECS on Fargate

### Fargate

#### ▼ Fargateとは

コンテナの実行環境のこと。『ECS on Fargate』という呼び方は、Fargateが環境の意味合いを持つからである。Fargate環境ではホストが隠蔽されており、実体としてEC2インスタンスをホストとしてコンテナが稼働している（ドキュメントに記載がないが、AWSサポートに確認済み）。

参考：https://aws.amazon.com/jp/blogs/news/under-the-hood-fargate-data-plane/

![fargate_data-plane](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/fargate_data-plane.png)

#### ▼ コンテナエージェント

コンテナ内で稼働し、コンテナの操作を行うプログラムのこと。

#### ▼ コンテナ定義

タスク内のコンテナ1つに対して、環境を設定する。

参考：https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/userguide/task_definition_parameters.html

| 設定項目                        | 対応するdockerコマンドオプション        | 説明                                                         | 補足                                                         |
| ------------------------------- | --------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| cpu                             | ```--cpus```                            | タスク全体に割り当てられたメモリ（タスクメモリ）のうち、該当のコンテナに最低限割り当てるCPUユニット数を設定する。cpuReservationという名前になっていないことに注意する。 CPUユニット数の比率に基づいて、タスク全体のCPUが各コンテナに割り当てられる。『ソフト制限』ともいう。 | 参考：<br>・https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_environment<br>・https://qiita.com/_akiyama_/items/e9760dd61d94b8031247 |
| dnsServers                      | ```--dns```                             | コンテナが名前解決に使用するDNSサーバーのIPアドレスを設定する。 |                                                              |
| essential                       |                                         | コンテナが必須か否かを設定する。                             | ・```true```の場合、コンテナが停止すると、タスクに含まれる全コンテナが停止する。<br>```false```の場合、コンテナが停止しても、その他のコンテナは停止しない。 |
| healthCheck<br>(command)        | ```--health-cmd```                      | ホストからFargateに対して、```curl```コマンドによるリクエストを送信し、レスポンス内容を確認。 |                                                              |
| healthCheck<br>(interval)       | ```--health-interval```                 | ヘルスチェックの間隔を設定する。                             |                                                              |
| healthCheck<br>(retries)        | ```--health-retries```                  | ヘルスチェックを成功と見なす回数を設定する。                 |                                                              |
| hostName                        | ```--hostname```                        | コンテナにホスト名を設定する。                               |                                                              |
| image                           |                                         | ECRのURLを設定する。                                         | 指定できるURLの記法は、Dockerfileの```FROM```と同じである。<br>参考：https://hiroki-it.github.io/tech-notebook-mkdocs/infrastructure_as_code/infrastructure_as_code_container_docker_dockerfile.html |
| logConfiguration<br>(logDriver) | ```--log-driver```                      | ログドライバーを指定することにより、ログの出力先を設定する。 | Dockerのログドライバーにおおよそ対応しており、Fargateであれば『awslogs、awsfirelens、splunk』に設定できる。EC2であれば『awslogs、json-file、syslog、journald、fluentd、gelf、logentries』を設定できる。 |
| logConfiguration<br>(options)   | ```--log-opt```                         | ログドライバーに応じて、詳細な設定を行う。                   |                                                              |
| portMapping                     | ```--publish```<br>```--expose```       | ホストとFargateのアプリケーションのポート番号をマッピングし、ポートフォワーディングを行う。 | ```containerPort```のみを設定し、```hostPort```は設定しなければ、EXPOSEとして定義できる。<br>参考：https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/APIReference/API_PortMapping.html |
| secrets<br>(volumesFrom)        |                                         | パラメーターストアから出力する環境変数を設定する。           |                                                              |
| memory                          | ```--memory```                          | コンテナのメモリ使用量の閾値を設定し、これを超えた場合にコンテナを停止する『ハード制限』ともいう。 | 参考：https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_memory |
| memoryReservation               | ```--memory-reservation```              | タスク全体に割り当てられたメモリ（タスクメモリ）のうち、該当のコンテナに最低限割り当てるメモリ分を設定する。『ソフト制限』ともいう。 | 参考：https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/task_definition_parameters.html#container_definition_memory |
| mountPoints                     |                                         | 隠蔽されたホストとコンテナの間でボリュームマウントを実行する。Fargateは、脆弱性とパフォーマンスの観点で、バインドマウントに対応していない。 | 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/virtualization/virtualization_container_docker.html |
| ulimit                          | Linuxコマンドの<br>```--ulimit```に相当 |                                                              |                                                              |

#### ▼ awslogsドライバー

標準出力/標準エラー出力に出力されたログをCloudWatch-APIに送信する。

参考：

- https://docs.docker.com/config/containers/logging/awslogs/
- https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/developerguide/using_awslogs.html#create_awslogs_logdriver_options

| 設定項目                      | 説明                                                         | 補足                                                         |
| ----------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ```awslogs-group```           | ログ送信先のCloudWatchログのロググループを設定する。         |                                                              |
| ```awslogs-datetime-format``` | 日時フォーマットを定義し、またこれをログの区切り単位としてログストリームに出力する。 | 正規表現で設定する必要があり、さらにJSONでは『```\```』を『```\\```』にエスケープしなければならない。例えば『```\\[%Y-%m-%d %H:%M:%S\\]```』となる。<br>参考：https://docs.docker.com/config/containers/logging/awslogs/#awslogs-datetime-format |
| ```awslogs-region```          | ログ送信先のCloudWatchログのリージョンを設定する。           |                                                              |
| ```awslogs-stream-prefix```   | ログ送信先のCloudWatchログのログストリームのプレフィックス名を設定する。 | ログストリームには、『```<プレフィックス名>/<コンテナ名>/<タスクID>```』の形式で送信される。 |

#### ▼ 割り当てられるプライベートIPアドレス

タスクごとに異なるプライベートIPが割り当てられる。このIPアドレスに対して、ALBはルーティングを行う。

<br>

### ECSサービス（Fargateの場合）

| 設定項目                     | 説明                                                         | 補足                                                         |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| タスク定義                   | サービスで維持管理するタスクの定義ファミリー名とリビジョン番号を設定する。 |                                                              |
| 起動タイプ                   | ECSタスク内のコンテナの起動タイプを設定する。                |                                                              |
| プラットフォームのバージョン | ECSコントロールプレーンのバージョンを設定する。              | バージョンによって、連携できるAWSリソースが異なる。          |
| サービスタイプ               |                                                              |                                                              |
| タスクの必要数               | 非スケーリング時またはデプロイ時のタスク数を設定する。       | 最小ヘルス率と最大率の設定値に影響する。                     |
| 最小ヘルス率                 | ECSタスクの必要数の設定を```100```%とし、新しいタスクのデプロイ時に、稼働中タスクの最低合計数を割合で設定する。 | 例として、タスク必要数が4個だと仮定する。タスクヘルス最小率を50%とすれば、稼働中タスクの最低合計数は2個となる。デプロイ時の既存タスク停止と新タスク起動では、稼働中の既存タスク/新タスクの数が最低合計数未満にならないように制御される。<br>参考：https://toris.io/2021/04/speeding-up-amazon-ecs-container-deployments |
| 最大率                       | ECSタスクの必要数の設定を```100```%とし、新しいタスクのデプロイ時に、稼働中/停止中タスクの最高合計数を割合で設定する。 | 例として、タスク必要数が4個だと仮定する。タスク最大率を200%とすれば、稼働中/停止中タスクの最高合計数は８個となる。デプロイ時の既存タスク停止と新タスク起動では、稼働中/停止中の既存タスク/新タスクの数が最高合計数を超過しないように制御される。<br>参考：https://toris.io/2021/04/speeding-up-amazon-ecs-container-deployments |
| ヘルスチェックの猶予期間     | デプロイ時のALB/NLBのヘルスチェックの状態を確認するまでの待機時間を設定する。猶予期間を過ぎても、ALB/NLBのヘルスチェックが失敗していれば、サービスはタスクを停止し、新しいタスクを再起動する。 | ALB/NLBではターゲットを登録し、ヘルスチェックを実行するプロセスがある。特にNLBでは、これに時間がかかる。またアプリケーションによっては、コンテナの構築に時間がかかる。そのため、NLBのヘルスチェックが完了する前に、ECSサービスがNLBのヘルスチェックの結果を確認してしまうことがある。例えば、NLBとLaravelを使用する場合は、ターゲット登録とLaravelコンテナの築の時間を加味して、```330```秒以上を目安とする。例えば、ALBとNuxt.js（SSRモード）を使用する場合は、```600```秒以上を目安とする。なお、アプリケーションのコンテナ構築にかかる時間は、開発環境での所要時間を参考にする。 |
| タスクの最小数               | スケーリング時のタスク数の最小数を設定する。                 |                                                              |
| タスクの最大数               | スケーリング時のタスク数の最大数を設定する。                 |                                                              |
| ロードバランシング           | ALBでルーティングするコンテナを設定する。                    |                                                              |
| タスクの数                   | ECSタスクの構築数をいくつに維持するかを設定する。            | タスクが何らかの原因で停止した場合、空いているAWSサービスを使用して、タスクが自動的に補填される。 |
| デプロイメント               | ローリングアップデート、ブルー/グリーンデプロイがある。      |                                                              |
| サービスロール               |                                                              |                                                              |

<br>

### ECSタスク定義（Fargateの場合）

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
| FireLens統合                       | FireLensコンテナを使用する場合に有効化する。                   |                                                              |
| ボリューム                         |                                                              |                                                              |

#### ▼ 新しいECSタスクを一時的に実行

現在起動中のECSタスクとは別に、新しいタスクを一時的に起動する。CI/CDツールで実行する以外に、ローカルマシンから手動で実行する場合もある。起動時に、```overrides```オプションを使用して、指定したタスク定義のコンテナ設定を上書きできる。正規表現で設定する必要があり、さらにJSONでは『```\```』を『```\\```』にエスケープしなければならない。コマンドが実行された後に、タスクは自動的にStopped状態になる。

**＊実装例＊**

LaravelのSeederコマンドやロールバックコマンドを、ローカルマシンから実行する。

```bash
#!/bin/bash

set -x

echo "Set Variables"
SERVICE_NAME="prd-foo-ecs-service"
CLUSTER_NAME="prd-foo-ecs-cluster"
TASK_NAME="prd-foo-ecs-task-definition"
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

#### ▼ ECS Exec

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

laravelコンテナに対して、シェルログインを実行する。bashを実行する時に、『```/bin/bash```』や『```/bin/sh```』で指定すると、binより上のパスもECSに送信されてしまう。例えば、Windowsなら『```C:/Program Files/Git/usr/bin/bash```』が送信される。これはCloudTrailでExecuteCommandイベントとして確認できる。ECSコンテナ内ではbashへのパスが異なるため、接続に失敗する。そのため、bashを直接的に指定する。

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



### ロール

#### ▼ サービスロール

サービス機能がタスクを操作するために必要なロールのこと。サービスリンクロールに含まれ、ECSの構築時に自動的にアタッチされる。

#### ▼ タスクロール

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

パラメーターストアから変数を取得するために、ECSタスクロールにインラインポリシーをアタッチする。

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

#### ▼ タスク実行ロール

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

datadogエージェントがECSクラスターやコンテナにアクセスできるように、ECSタスク実行ロールにカスタマー管理ポリシーをアタッチする。

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

#### ▼ noneモード

外部ネットワークが無く、タスクと外と通信できない。

#### ▼ hostモード

Dockerのhostネットワークに相当する。

![network-mode_host-mode](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network-mode_host-mode.png)

#### ▼ bridgeモード

Dockerのbridgeネットワークに相当する。

![network-mode_host-mode](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network-mode_host-mode.png)

#### ▼ awsvpcモード

awsの独自ネットワークモード。タスクはElastic Networkインターフェースと紐付けられ、コンテナではなくタスク単位でプライベートIPアドレスが割り当てられる。同じタスクに属するコンテナ間は、localhostインターフェイスというENI経由で通信できるようになる（推測ではあるが、Fargate環境でコンテナのホストとなるEC2インスタンスにlocalhostインターフェースが紐付けられる）。これにより、コンテナからコンテナに通信するとき（例：NginxコンテナからPHP-FPMコンテナへのルーティング）は、通信元コンテナにて、通信先のアドレスを『localhost（```127.0.0.1```）』で指定すれば良い。また、awsvpcモードの独自の仕組みとして、同じタスク内であれば、互いにコンテナポートを開放せずとも、インバウンド通信を待ち受けるポートを指定するだけで、コンテナ間で通信できる。例えば、NginxコンテナからPHP-FPMコンテナにリクエストをルーティングするためには、PHP-FPMプロセスが```9000```番ポートでインバウンド通信を受信し、さらにコンテナが```9000```番ポートを開放する必要がある。しかし、awsvpcモードではコンテナポートを開放する必要はない。

参考：https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/userguide/fargate-task-networking.html

![network-mode_awsvpc](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network-mode_awsvpc.png)

<br>

### タスクのデプロイ手法

#### ▼ ローリングアップデート

![rolling-update](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rolling-update.png)

参考：https://toris.io/2021/04/speeding-up-amazon-ecs-container-deployments/

1. 最小ヘルス率の設定値を基に、ローリングアップデート時の稼働中タスクの最低合計数が決定される。
2. 最大率の設定値を基に、ローリングアップデート時の稼働中/停止中タスクの最高合計数が決まる
3. ECSは、既存タスクを稼働中のまま、新タスクを最高合計数いっぱいまで構築する。
4. ECSは、猶予期間後にALB/NLBによる新タスクに対するヘルスチェックの結果を確認する。ヘルスチェックが成功していれば、既存タスクを停止する。ただし、最小ヘルス率によるタスクの最低合計数が保たれる。
5. 『新タスクの起動』と『ヘルスチェック確認後の既存タスクの停止』のプロセスが繰り返し実行され、徐々に既存タスクが新タスクに置き換わる。
6. 全ての既存タスクが新タスクに置き換わる。

#### ▼ ブルー/グリーンデプロイメント

CodeDeployを使用してデプロイを行う。

<br>

### プライベートサブネット内のFargateからのアウトバウンド通信

#### ▼ プライベートサブネットからの通信

プライベートサブネットにFargateを配置した場合、VPC外にあるAWSリソース（コントロールプレーン、ECR、S3、SSM、CloudWatch、DynamoDB、など）に対してアウトバウンド通信を送信するためには、NAT GatewayまたはVPCエンドポイントを配置する必要がある。パブリックサブネットに配置すればこれらは不要となるが、パブリックサブネットよりもプライベートサブネットにECSタスクを配置する方が望ましい。

参考：https://docs.aws.amazon.com/ja_jp/AmazonECS/latest/bestpracticesguide/networking-connecting-vpc.html#networking-connecting-privatelink

![ecs_private_data-plane](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_private_data-plane.png)

#### ▼ FargateのIPアドレスが動的である問題

FargateにパブリックIPアドレスを持たせたい場合、Elastic IPアドレスの設定項目がなく、動的パブリックIPアドレスしか設定できない（Fargateの再構築後に変化する）。アウトバウンド通信の先にある外部サービスが、セキュリティ上で静的なIPアドレスを要求する場合、アウトバウンド通信（グローバルネットワーク向き通信）時に送信元パケットに付加されるIPアドレスが動的になり、リクエストできなくなってしまう。

![NatGatewayを介したFargateから外部サービスへのアウトバウンド通信](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/NatGatewayを介したFargateから外部サービスへのアウトバウンド通信.png)

そこで、Fargateのアウトバウンド通信が、Elastic IPアドレスを持つNAT Gatewayを経由する（Fargateは、パブリックサブネットとプライベートサブネットのどちらに置いても良い）。これによって、NAT GatewayのElastic IPアドレスが送信元パケットに付加されるため、Fargateの送信元IPアドレスを見かけ上静的に扱えるようになる。

参考：https://aws.amazon.com/jp/premiumsupport/knowledge-center/ecs-fargate-static-elastic-ip-address/

#### ▼ NAT Gateway経由

FargateからECRに対するdockerイメージのプルや、Fargateからコントールプレーンに対する通信は、VPCの外側に対するアウトバウンド通信（グローバルネットワーク向き通信）である。以下の通り、パブリックサブネットにNAT Gatewayを設置したとする。この場合、ECSやECRとのアウトバウンド通信がNAT Gatewayを通過するため、高額料金を請求されてしまう。

参考：https://zenn.dev/yoshinori_satoh/articles/ecs-fargate-vpc-endpoint

![ecs_nat-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_nat-gateway.png)

#### ▼ VPCエンドポイント経由

VPC外のAWSリソース（コントロールプレーン、ECR、S3、SSM、CloudWatch、DynamoDB、など）と紐づく専用のVPCエンドポイントを設け、これに対してアウトバウンド通信を行うようにすると良い。NAT GatewayとVPCエンドポイントの両方を構築している場合、ルートテーブルでは、VPCエンドポイントへのアウトバウンド通信の方が優先される。そのため、NAT Gatewayがある状態でVPCエンドポイントを構築すると、接続先が自動的に変わってしまうことに注意する。料金的な観点から、NAT GatewayよりもVPCエンドポイントを経由した方が良い。注意点として、パブリックネットワークにアウトバウンド通信を送信する場合は、VPCエンドポイントだけでなくNAT Gatewayも構築する必要がある。

参考：

- https://zenn.dev/yoshinori_satoh/articles/ecs-fargate-vpc-endpoint
- https://dev.classmethod.jp/articles/vpc-endpoint-gateway-type/

![ecs_vpc-endpoint](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs_vpc-endpoint.png)

| VPCエンドポイントの接続先 | プライベートDNS名                                            | 説明                                              |
| ------------------------- | ------------------------------------------------------------ | ------------------------------------------------- |
| CloudWatchログ            | ```logs.ap-northeast-1.amazonaws.com```                      | ECSコンテナのログをPOSTリクエストを送信するため。 |
| ECR                       | ```api.ecr.ap-northeast-1.amazonaws.com```<br>```*.dkr.ecr.ap-northeast-1.amazonaws.com``` | イメージのGETリクエストを送信するため。           |
| S3                        | なし                                                         | イメージのレイヤーをPOSTリクエストを送信するため  |
| パラメーターストア        | ```ssm.ap-northeast-1.amazonaws.com```                       | パラメーターストアにGETリクエストを送信するため。 |
| SSMシークレットマネージャ | ```ssmmessage.ap-northeast-1.amazonaws.com```                | シークレットマネージャの機能を使用するため。        |

<br>

### マイクロサービスアーキテクチャ風

#### ▼ 複数のECSサービス構成

マイクロサービスアーキテクチャのアプリケーション群を稼働させる時、Kubernetesを使用して、またインフラとしてEKSを使用するのが基本である。ただし、モノリスなアプリケーションをECSサービスで分割し、Fargateで稼働させることにより、マイクロサービスアーキテクチャ風のインフラを構築できる。

参考：https://tangocode.com/2018/11/when-to-use-lambdas-vs-ecs-docker-containers/

![ecs-fargate_microservices](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ecs-fargate_microservices.png)

#### ▼ ECSサービスディスカバリー

Istioと同様にして、マイクロサービスが他のマイクロサービスにリクエストを送信する時に、Route53を使用してIPアドレスの名前解決を行う。オートスケーリングなどでマイクロサービスのIPアドレスが変更されても、動的にレコードを変更する。

参考：

- https://medium.com/@toddrosner/ecs-service-discovery-1366b8a75ad6
- https://dev.classmethod.jp/articles/ecs-service-discovery/

![esc_service-discovery](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/esc_service-discovery.png)

<br>

## 14-03. EKS

### セットアップ

#### ▼ EKS

（１）AWS CLIにクレデンシャル情報を設定する。

```bash
$ aws configure
```

（２）EKSのコンテキストを作成する。

参考：https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/getting-started-console.html

```bash
$ aws eks update-kubeconfig --region ap-northeast-1 --name foo-eks-cluster
```

（３）kubectlコマンドの宛先を、EKSのkube-apiserverに変更する。

参考：https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/dashboard-tutorial.html#deploy-dashboard

```bash
$ kubectl config use-context <クラスターARN>
```

（４）可観測性ツールをEKSで稼働させるために、名前空間を作成する。名前は、```aws-observability```とする必要がある。

参考：https://blog.mmmcorp.co.jp/blog/2021/08/11/post-1704/ 

```yaml
kind: Namespace
apiVersion: v1
metadata:
  name: aws-observability
  labels:
    aws-observability: enabled
```

（５）EKSクラスターからCloudWatchログにログを送信できるように、ConfigMapを作成する。名前は、```aws-logging```とする必要がある。

参考：https://blog.mmmcorp.co.jp/blog/2021/08/11/post-1704/

```bash
$ kubectl apply -f config-map.yaml
```

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: aws-logging
  namespace: aws-observability
data:
  output.conf: |
    [OUTPUT]
        Name cloudwatch
        Match *
        region ap-northeast-1
        log_group_name fluent-bit-cloudwatch
        log_stream_prefix from-fluent-bit-
        auto_create_group true
```

（６）EKSのPod実行ロールにCloudWatchへのアクセス権限を付与する。

参考：https://blog.mmmcorp.co.jp/blog/2021/08/11/post-1704/

#### ▼ VPC

EKS Fargate Nodeはプライベートサブネットで稼働する。この時、パブリックネットワークにあるレジストリから、IstioやArgoCDのイメージをプルできるように、EKS Fargate NodeとInternet Gateway間のネットワークを繋げる必要がある。そのために、パブリックサブネットにNAT Gatewayを置く。

<br>

### 仕組み

#### ▼ EKSとKubernetesの対応

参考：https://zenn.dev/yoshinori_satoh/articles/2021-02-13-eks-ecs-compare

![eks](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/eks.png)

| Kubernetes上でのリソース名 | EKS上でのリソース名     | 補足                                                         |
| -------------------------- | ----------------------- | ------------------------------------------------------------ |
| Cluster                    | EKSクラスター           | 参考：https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/clusters.html |
| Ingress                    | ALB Ingress             | ALBコントローラーによって、自動的に構築される。<br>参考：<br>・https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/alb-ingress.html<br>・https://blog.linkode.co.jp/entry/2020/06/26/095917#AWS-ALB-Ingress-Controller-for-Kubernetes |
| Ingressコントローラー      | ALBコントローラー       | 参考：https://aws.amazon.com/jp/blogs/news/using-alb-ingress-controller-with-amazon-eks-on-fargate/ |
|                            | API Gateway＋NLB        | 参考：https://aws.amazon.com/jp/blogs/news/api-gateway-as-an-ingress-controller-for-eks/ |
| マスターNode               | EKSコントロールプレーン | 参考：https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/platform-versions.html |
| ワーカーNode               | Fargate Node、EC2 Node  | 参考：https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/eks-compute.html |
| PersistentVolume           | EBS、EFS                | 参考：https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/storage.html |
| Secret                     | System Manager          | 参考：https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/manage-secrets.html |
| kube-dns                   | coredns                 |                                                              |
| kube-proxy                 | kube-proxy              |                                                              |
| 種々のCNIプラグイン        | aws-node                | 参考：<br>・https://github.com/aws/amazon-vpc-cni-k8s<br>・https://tech-blog.optim.co.jp/entry/2021/11/10/100000 |
| これら以外のリソース       | なし                    |                                                              |

<br>

### EKSクラスター

#### ▼ EKSクラスターとは

Fargate NodeやEC2 Nodeの管理グループ単位のこと。KubernetesのClusterに相当する。

参考：https://www.sunnycloud.jp/column/20210315-01/

#### ▼ セットアップ

| 設定項目                         | 説明                                                         | 補足                                                         |
| -------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 名前                             | クラスターの名前を設定する。                                 |                                                              |
| Kubernetesバージョン             | EKS上で稼働するKubernetesのバージョンを設定する。            | EKSが対応できるKubernetesのバージョンは以下を参考にせよ。<br>参考：https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/platform-versions.html |
| クラスターサービスロール         | EKSクラスターのサービスリンクロールを設定する。              | 参考：https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/service_IAM_role.html |
| シークレット                     | Secretに保持するデータをAWS KMSで暗号化するかどうかを設定する。 | AWS KMSについては、以下のリンクを参考にせよ。<br>参考：https://hiroki-it.github.io/tech-notebook-mkdocs/cloud_computing/cloud_computing_aws_4.html |
| VPC、サブネット                  | ENIを配置するサブネットを設定する。                          | 複数のAZにまたがっている必要がある。                         |
| クラスターセキュリティグループ   | EKSクラスターのセキュリティグループを設定する。              | インバウンドとアウトバウンドの両方のルールで、全てのIPアドレスを許可する必要がある。このセキュリティグループは、追加のセキュリティグループとして設定され、別途、AWSによって```eks-cluster-sg-<EKSクラスター名>```というセキュリティグループも自動設定される。<br>参考：https://yuutookun.hatenablog.com/entry/fargate_for_eks |
| クラスターIPアドレスファミリー   |                                                              |                                                              |
| IPアドレス範囲                   |                                                              |                                                              |
| クラスターエンドポイントアクセス |                                                              |                                                              |
| ネットワークアドオン             |                                                              |                                                              |
| コントロールプレーンのログ       |                                                              |                                                              |

#### ▼ ネットワーク

EKSでは、EKS外からのインバウンド通信をALBコントローラーで受信し、これをIngressにルーティングする。また、アウトバウンド通信をNAT GatewayやVPCエンドポイントで受信し、EKS外にルーティングする。以下のようなエラーでPodが起動しない場合、Podが何らかの理由でイメージをプルできない可能性がある。また、Podが構築されない限り、Nodeも構築されないことに注意する。

```
Pod provisioning timed out (will retry) for pod
```

参考：https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/deploy-a-grpc-based-application-on-an-amazon-eks-cluster-and-access-it-with-an-application-load-balancer.html

![eks_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/eks_architecture.png)

<br>

### マルチNode

マルチNodeを構築する場合、AZごとにNodeを構築する。

参考：https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/eks-networking.html

![eks_multi-node](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/eks_multi-node.png)

<br>

### デバッグ

#### ▼ ダッシュボード

（１）EKSのコンテキストを作成する。

参考：https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/getting-started-console.html

```bash
$ aws eks update-kubeconfig --region ap-northeast-1 --name foo-eks-cluster
```

（２）kubectlコマンドの宛先を、EKSのkube-apiserverに変更する。

参考：https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/dashboard-tutorial.html#deploy-dashboard

```bash
$ kubectl config use-context <クラスターARN>
```

（３）manifest.yamlファイルを使用して、ダッシュボードのKubernetesリソースをEKSにデプロイする。

参考：https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/dashboard-tutorial.html#eks-admin-service-account

```bash
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.5/aio/deploy/recommended.yaml
```

（４）ダッシュボードに安全に接続するために、ServiceAccountをEKSにデプロイする

```bash
$ kubectl apply -f service-account.yml
```

（５）トークンの文字列を取得する。

```bash
$ kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep eks-admin | awk '{print $1}')
```

（６）ローカルマシンからEKSにポートフォワーディングを実行する。

```bash
$ kubectl proxy
```

（７）ダッシュボードに接続する。

```http
GET http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#!/login HTTP/1.1
```

<br>

## 14-03-02. EKS on Fargate

### Fargate Node

#### ▼ Fargate Nodeとは

Fargate上で稼働するKubernetesのホストのこと。KubernetesのNodeに相当する。on EC2と比べてカスタマイズ性が低く、Node当たりで稼働するPod数はAWSが管理する。一方で、各EC2のサチュレーションをユーザーが管理しなくてもよいため、Kubernetesのホストの管理が楽である。

参考：

- https://www.sunnycloud.jp/column/20210315-01/
- https://aws.amazon.com/jp/blogs/news/using-alb-ingress-controller-with-amazon-eks-on-fargate/

![eks_on_fargate](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/eks_on_fargate.png)

#### ▼ Fargateプロファイル

Fargateを設定する。

参考：https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/fargate-profile.html#fargate-profile-components

| コンポーネント名           | 説明                                                         | 補足                                                         |
| -------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Pod実行ロール              | kubeletがAWSリソースにアクセスできるように、Podにロールを設定する。 | ・実行ポリシー（AmazonEKSFargatePodExecutionRolePolicy）には、ECRへのアクセス権限のみが付与されている。<br>・信頼されたエンティティでは、```eks-fargate-pods.amazonaws.com```を設定する必要がある。<br>参考：https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/pod-execution-role.html |
| サブネット                 | EKS Fargate Nodeが起動するサブネットIDを設定する。           | プライベートサブネットを設定する必要がある。                 |
| ポッドセレクタ（名前空間） | EKS Fargate Node上で稼働させるPodを固定できるように、Podの名前空間ラベルの値を設定する。 | IstioやArgoCDを、それ専用の名前空間で稼働させる場合は、その名前空間のためのプロファイルを作成しておく必要がある。 |
| ポッドセレクタ（ラベル）   | EKS Fargate Node上で稼働させるPodを固定できるように、Podの任意のラベルの値を設定する。 |                                                              |

<br>

## 14-03-03. EKS on EC2

### EC2ノード

#### ▼ EC2ノードとは

EC2で稼働するKubernetesのホストのこと。on Fargateと比べてカスタマイズ性が高く、Node当たりで稼働するPod数に重み付けを設定できる。一方で、各EC2のサチュレーションをユーザーが管理しなければならないため、Kubernetesのホストの管理が大変である。

参考：https://www.sunnycloud.jp/column/20210315-01/

![eks_on_ec2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/eks_on_ec2.png)



## 15. EFS：Elastic File System

![EFSのファイル共有機能](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/EFSのファイル共有機能.png)

### EFSとは

マウントターゲットと接続された片方のEC2インスタンスから、ファイルを読み出し、これをもう一方に出力する。ファイルの実体はいずれかのEC2に存在しているため、接続を切断している間、片方のEC2インスタンス内のファイルは無くなる。再接続すると、切断直前のファイルが再び表示されようになる。

<br>

### セットアップ

#### ▼ 概要

| 設定項目         | 説明                                                                          | 補足                                                                                                                                                                                   |
|--------------|-----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| パフォーマンスモード   |                                                                             |                                                                                                                                                                                      |
| スループットモード    | EFSのスループット性能を設定する。                                                          |                                                                                                                                                                                      |
| ライフサイクルポリシー  | しばらくリクエストされていないファイルが低頻度アクセス（IA：Infrequent Access）ストレージクラスに移動保存するまでの期限を設定する。 | ・ライフサイクルポリシーを有効にしない場合、スタンダードストレージクラスのみが使用される。<br>・画面から両ストレージの使用量を確認できる。<br>参考：https://ap-northeast-1.console.aws.amazon.com/efs/home?region=ap-northeast-1#/file-systems/fs-f77d60d6 |
| ファイルシステムポリシー | 他のAWSリソースがEFSを利用する時のポリシーを設定する。                                              |                                                                                                                                                                                      |
| 自動バックアップ     | AWS Backupに定期的に保存するかどうかを設定する。                                               |                                                                                                                                                                                      |
| ネットワーク       | マウントターゲットを設置するサブネット、セキュリティグループを設定する。                                        | ・サブネットは、ファイル供給の速度の観点から、マウントターゲットにアクセスするAWSリソースと同じにする。<br>・セキュリティグループは、EC2からのNFSプロトコルアクセスを許可したものを設定する。EC2のセキュリティグループを通過したアクセスだけを許可するために、IPアドレスでは、EC2のセキュリティグループを設定する。                 |

<br>

### スペック

#### ▼ バーストモードの仕組み

スループット性能の自動スケーリングに残高があり、ベースラインを超過した分だけ自動スケーリング残高が減っていく。また、ベースライン未満の分は残高として蓄積されていく。

![burst-mode_balance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/burst-mode_credit-balance-algorithm.png)

元の残高は、ファイルシステムのスタンダードストレージクラスの容量に応じて大きくなる。

参考：https://docs.aws.amazon.com/ja_jp/efs/latest/ug/performance.html#efs-burst-credits

![burst-mode_credit](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/burst-mode_credit-balance-size.png)

残高は、```BurstCreditBalance```メトリクスから確認できる。このメトリクスが常に減少し続けている場合はプロビジョニングモードの方がより適切である。

参考：https://docs.aws.amazon.com/ja_jp/efs/latest/ug/performance.html#using-throughputmode

#### ▼ プロビジョニングモードの仕組み

スループット性能の自動スケーリング機能は無いが、一定の性能は保証されている。

参考：https://docs.aws.amazon.com/ja_jp/efs/latest/ug/performance.html#provisioned-throughput

![burst-mode_credit](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/provisioning-mode_credit-balance-size.png)

<br>

### コマンド

#### ▼ マウント

DNS経由で、EFSマウントヘルパーを使用した場合を示す。

参考：https://qiita.com/tandfy/items/829f9fcc68c4caabc660

```bash
# EFSで、マウントポイントを登録
# mount -t efs -o tls <ファイルシステムID>:<マウント元ディレクトリ> <マウントポイント>
$ mount -t efs -o tls fs-*****:/ /var/www/foo

# マウントポイントを解除
$ umount /var/www/foo

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

### セットアップ

| 設定項目                         | 説明                                                         | 補足                                                         |
| -------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| クラスターエンジン               | 全てのRedisノードのキャッシュエンジンを設定する。Redis通常モード、Redisクラスターモードから選択する。 | Redisクラスターモードと同様に、Redis通常モードもクラスター構成になる。ただ、クラスターモードとはクラスターの構成方法が異なる。 |
| ロケーション                     |                                                              |                                                              |
| エンジンバージョンの互換性       | 全てのRedisノードのキャッシュエンジンのバージョンを設定する。 | マイナーバージョンが自動的に更新されないように、例えば『```6.x```』は設定しない方が良い。 |
| パラメーターグループ             | 全てのRedisノードのグローバルパラメーターを設定する。        | デフォルトを使用せずに独自定義する場合、事前に構築しておく必要がある。 |
| ノードのタイプ                   |                                                              |                                                              |
| レプリケーション数               | プライマリーノードとは別に、リードレプリカノードをいくつ構築するかを設定する。 | マルチAZにプライマリーノードとリードレプリカノードを1つずつ配置させる場合、ここでは『1個』を設定する。 |
| マルチAZ                         | プライマリーノードとリードレプリカを異なるAZに配置するかどうかを設定する。合わせて、自動フェイルオーバーを実行できるようになる。 |                                                              |
| サブネットグループ               | Redisにアクセスできるサブネットを設定する。                  |                                                              |
| セキュリティ                     | セキュリティグループを設定する。                             |                                                              |
| クラスターへのデータのインポート | あらかじめ作成しておいたバックアップをインポートし、これを元にRedisを構築する。 | セッションやクエリキャッシュを引き継げる。そのため、新しいRedisへのセッションデータの移行に役立つ。<br>参考：https://docs.aws.amazon.com/ja_jp/AmazonElastiCache/latest/red-ug/backups-seeding-redis.html |
| バックアップ                     | バックアップの有効化、保持期間、時間を設定する。             | バックアップを取るほどでもないため、無効化しておいて問題ない。 |
| メンテナンス                     | メンテナンスの時間を設定する。                               |                                                              |

<br>

### Redisクラスター

#### ▼ Redisクラスターとは

![redis-cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/redis-cluster.png)

複数のRedisノードを持つRedisシャードから構成されている。

参考：

- https://docs.aws.amazon.com/ja_jp/AmazonElastiCache/latest/red-ug/WhatIs.Terms.html

- https://docs.aws.amazon.com/ja_jp/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.Clusters

#### ▼ クラスターモード

クラスターモードを有効にすると、Redisクラスター内に複数のRedisシャードが構築される。反対に無効化すると、シャードは1つだけ構築される。

参考：https://docs.aws.amazon.com/ja_jp/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.ReplicationGroups

<br>

### Redisシャード

#### ▼ Redisシャードとは

Redisノードのグループ。同じRedisシャード内にあるRedisノード間では、セッションやクエリキャッシュが同期される。

参考：https://docs.aws.amazon.com/ja_jp/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.Shards

<br>

### Redisノード

#### ▼ Redisノードとは

セッションやクエリキャッシュを管理する。

<br>

### セッション管理機能

#### ▼ セッション管理機能とは

サーバー内のセッションデータの代わりにセッションIDを管理し、冗長化されたアプリケーション間で共通のセッションIDを使用できるようにする。そのため、リリース後に既存のセッションが破棄されることがなくなり、ログイン状態を保持できるようになる。セッションIDについては、以下のリンクを参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_collaboration_api_restful.html

![ElastiCacheのセッション管理機能](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ElastiCacheのセッション管理機能.png)

<br>

### クエリキャッシュ管理機能

#### ▼ クエリキャッシュ管理機能とは

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

#### ▼ クエリキャッシュの操作

```bash
# Redis接続コマンド
$ /usr/local/sbin/redis-stable/src/redis-cli \
    -c \
    -h <Redisのホスト名> \
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

#### ▼ フェイルオーバー

ノードの障害を検知し、障害が発生したノードを新しいものに置き換わる。

| 障害の発生したノード | 挙動                                                         |
| -------------------- | ------------------------------------------------------------ |
| プライマリーノード   | リードレプリカの1つがプライマリーノードに昇格し、障害が起きたプライマリーノードと置き換わる。 |
| リードレプリカノード | 障害が起きたリードレプリカノードが、別の新しいものに置き換わる。 |

<br>

### Redisクラスターのダウンタイム

#### ▼ ダウンタイムの発生条件

| 変更する項目       | ダウンタイムの有無 | ダウンタイム                          |
| ------------------ | ------------------ | ------------------------------------- |
| エンジンバージョン | あり               | 1分30秒ほどのダウンタイムが発生する。 |

<br>

### 計画的なダウンタイム

#### ▼ 計画的なダウンタイムとは

Redisクラスターでは、エンジンバージョンなどのアップグレード時に、Redisノードの再起動が必要である。サイトの利用者に与える影響を小さくできるように、計画的にダウンタイムを発生させる必要がある。

#### ▼ バックアップとインポートによるダウンタイムの最小化

以下の手順で、ダウンタイムを最小限にしてアップグレードできる。

（１）RedisのセッションやクエリキャッシュをS3にエクスポートする。

（２）新しいRedisを構築する。この時、インポートを使用して、セッションやクエリキャッシュを引き継いだRedisクラスターを別途構築する。

（３）新しく構築したRedisクラスターをアップグレードする。

（４）アプリケーションの接続先を古いRedisクラスターから新しいものに変更する。

（５）古いRedisクラスターを削除する。

<br>

## 17. EventBridge（CloudWatchイベント）

### EventBridge（CloudWatchイベント）とは

AWSリソースで起こったイベントを、他のAWSリソースに転送する。サポート対象のAWSリソースは以下のリンクを参考にせよ。

参考：https://docs.aws.amazon.com/eventbridge/latest/userguide/what-is-amazon-eventbridge.html

<br>

### パターン

#### ▼ イベントパターン

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

#### ▼ スケジュール

cron式またはrate式を使用して、スケジュールを定義する。これとLambdaを組み合わせることにより、バッチ処理を構築できる。

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/events/ScheduledEvents.html

<br>

### ターゲット

#### ▼ ターゲットの一覧

参考：https://docs.aws.amazon.com/ja_jp/eventbridge/latest/userguide/eb-targets.html

#### ▼ デバッグ

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
        "account": "<アカウントID>",
        "time": "<イベントの発生時間>",
        "region": "ap-northeast-1",
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

#### ▼ 入力トランスフォーマー

入力パスで使用する値を抽出し、入力テンプレートで転送するJSONを定義できる。イベントのJSONの値を変数として出力できる。```event```キーをドルマークとして、ドットで繋いでアクセスする。

**＊実装例＊**

入力パスにて、使用する値を抽出する。Amplifyで起こったイベントのJSONを変数として取り出す。JSONのキー名が変数名として機能する。

```bash
{
  "appId": "$.detail.appId",
  "branchName": "$.detail.branchName",
  "jobId": "$.detail.jobId",
  "jobStatus": "$.detail.jobStatus",
  "region": "$.region"
}
```

入力テンプレートにて、転送するJSONを定義する。例えばここでは、Slackに送信するJSONに出力する。出力するときは、入力パスの変数名を『```<>```』で囲う。Slackに送信するメッセージの作成ツールは、以下のリンクを参考にせよ。

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
        "text": ":github: PullReq検証用環境"
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
          "text": ":amplify: <https://<region>.console.aws.amazon.com/amplify/home?region=<region>#/<appId>/<branchName>/<jobId>|*Amplifyコンソー
