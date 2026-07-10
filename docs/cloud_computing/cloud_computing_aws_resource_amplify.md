---
title: 【IT技術の知見】AWS Amplify＠AWSリソース
description: AWS Amplify＠AWSリソースの知見を記録しています。
---

# AWS Amplify＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS Amplifyとは

サーバーレスアプリケーションを作成するためのクラウドインフラのフレームワーク。

> - https://d1.awsstatic.com/webinars/jp/pdf/services/20200520_AWSBlackBelt_AWS Amplify_A.pdf

<br>

## 02. AWS Amplifyの仕組み

### アーキテクチャ

#### ▼ フロントエンド

SSG の場合、静的ファイルをデプロイしさえすれば、アプリケーションとしての要件がすべて整う。

CSR の場合、サーバーレスのバックエンドを自動作成してくれ、フロントエンドをデプロイしさえすれば、要件がすべて整う。

これの AWS リソースは CloudFormation によって作成されるが、AWS Amplify 経由でしか設定を変更できず、各 AWS リリースのコンソール画面を見ても、非表示になっている。

ただし、Amazon Route 53 の設定は表示されており、AWS Amplify が追加した DNS レコードをユーザーが編集できるようになっている。

| 役割                    | 使用されているAWSリソース    |
| ----------------------- | ---------------------------- |
| 静的サイトホスティング  | Amazon CloudFront、Amazon S3 |
| GraphQLによるリクエスト | Amazon S3                    |

#### ▼ バックエンド

フロントエンドで GraphQL によるリクエストを実装している場合、AppSync を使用して、これを受信できる API を作成する必要がある。

| 役割                     | 使用されているAWSリソース   | クリーンアーキテクチャで相当するレイヤー |
| ------------------------ | --------------------------- | ---------------------------------------- |
| リアルタイム通知         | AppSync、IoT Core           | インフラストラクチャ層                   |
| RESTful-API、GraphQL-API | Amazon API Gateway、AppSync | インフラストラクチャ層                   |
| 認証                     | Cognito                     | インターフェース層                       |
| 認可                     | Cognito                     | ユースケース層                           |
| ビジネスロジック         | AWS Lambda                  | ドメイン層                               |
| 全文検索                 | Elastic Search              | ドメイン層                               |

#### ▼ ストレージ

| 役割         | 使用されているAWSリソース |
| ------------ | ------------------------- |
| NoSQL        | DynamoDB                  |
| ファイル保管 | Amazon S3                 |

#### ▼ CI/CDパイプライン

AWS Amplify は、連携先のリポジトリからソースコードをプルし、アプリケーションをビルドする。

GitHub のブランチごとにアプリケーションの CI/CD パイプラインが発火するようにすれば、プルリクエストごとにアプリケーションの実行環境を用意できる。

プルリクごとに実行環境を作成できると、例えば、`1` 個のプルリクをデザイナーサイドやビジネスサイド (例：SEO など) がレビューできるようになる。

ただし、App Runner を使用したほうがよいかもしれない。

> - https://zenn.dev/intercept6/articles/4016e9d61ab36761685d
> - https://devblog.thebase.in/entry/2021/12/22/110000

<br>

## 03. セットアップ

### コンソール画面の場合

#### ▼ 設定項目と説明

| 項目                   | 説明                                                       | 補足                                                                                                                                                                   |
| ---------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| アプリケーションの名前 | AWS Amplify上でのアプリケーション名を設定する。            |                                                                                                                                                                        |
| 本番稼働ブランチ       | 基点ブランチを設定する。                                   | AWS Amplifyを本番運用しない場合は、`develop` ブランチを設定すればよい。                                                                                                |
| ブランチの自動検出     | ブランチの自動検出を有効化するか否かを設定する。           | ワイルドカード (`*`) を組み込む場合、アスタリスクを2つ割り当てないと、ブランチが検知されないことがある。例：『`**foo**,**bar**`』                                      |
| プレビュー             | GitHubのプルリクエスト上にAWS Amplify環境のURLを通知する。 | 執筆時点 (2021/02/07) では、プルリクエストを新しく作成しても、これは自動的に登録されない。そのため、その都度手動で登録する必要がある。                                 |
| アクセスコントロール   | AWS Amplify環境に認証機能を設定する。                      | 執筆時点 (2021/02/07) では、ベーシック認証を使用できる。                                                                                                               |
| リダイレクト           | リダイレクトするパスを設定する。                           | `404` ステータスで404ページにリダイレクトする場合は、以下の通りに設定する。<br>・送信元：`/<*>`<br>・ターゲットアドレス：`<404ページへのパス>`<br>・404 (リダイレクト) |

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

> - https://docs.aws.amazon.com/amplify/latest/userguide/getting-started.html#step-1-connect-repository

#### ▼ 対応するバージョン管理リポジトリ構造

| 構造名     | ビルド開始ディレクトリ                   |
| ---------- | ---------------------------------------- |
| 非モノレポ | リポジトリ名からなるディレクトリ         |
| モノレポ   | モノレポの各アプリケーションディレクトリ |

#### ▼ `amplify.yml` ファイル

バージョン管理リポジトリのルートに `amplify.yml` ファイルを配置する。

Next.js では SSG/SSR の両モードでビルド＆デプロイできる。

`package.json` ファイルで使用される `next` コマンドに応じて、SSG または SSR のいずれかのインフラが作成され、デプロイされる。

SSG の場合、裏側では Amazon S3、Amazon CloudFront、Amazon Route 53 などが作成され、静的ホスティングが実行される。

SSR の場合、フロントエンドのみでなくバックエンドの実行環境が必要になるため、AWS Lambda や Cognite を作成する。

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
        -  # コマンド
    build:
      commands:
        -  # コマンド
    postBuild:
      commands:
        -  # コマンド

#=====================
# フロントエンドのCI/CDパイプライン
#=====================
frontend:
  phases:
    preBuild:
      commands:
        - npm install
        # base64方式エンコード値をデコード
        - echo "${ENV}" | base64 -d > .env
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
        -  # コマンド
    test:
      commands:
        -  # コマンド
    postTest:
      commands:
        -  # コマンド
  artifacts:
    # デプロイ先のディレクトリ
    files:
      # 全てのディレクトリ
      - "**/*"
    configFilePath: <パス>
    # ビルドのアーティファクトのディレクトリ
    baseDirectory: <パス>
```

> - https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html
> - https://docs.aws.amazon.com/amplify/latest/userguide/server-side-rendering-amplify.html#deploy-nextjs-app

<br>
