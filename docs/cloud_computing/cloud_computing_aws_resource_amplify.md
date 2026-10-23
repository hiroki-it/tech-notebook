---
title: 【IT技術の知見】AWS Amplify＠AWSリソース
description: AWS Amplify＠AWSリソースの知見を記録しています。
---

# AWS Amplify＠AWS リソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. AWS Amplify とは

サーバーレスアプリケーションを作成するためのクラウドインフラのフレームワーク。

> - https://d1.awsstatic.com/webinars/jp/pdf/services/20200520_AWSBlackBelt_AWS Amplify_A.pdf

<br>

## 02. AWS Amplify の仕組み

### アーキテクチャ

#### ▼ フロントエンド

SSG の場合、静的ファイルをデプロイしさえすれば、アプリケーションとしての要件がすべて整う。

CSR の場合、サーバーレスのバックエンドを自動作成してくれ、フロントエンドをデプロイしさえすれば、要件がすべて整う。

AWS Amplify が使用する AWS リソースは CloudFormation によって作成されるが、AWS Amplify 経由でしか設定を変更できず、各 AWS リソースのコンソール画面を見ても、非表示になっている。

ただし、Amazon Route 53 の設定は表示されており、AWS Amplify が追加した DNS レコードをユーザーが編集できるようになっている。

<table>
  <thead>
    <tr>
      <th>役割</th>
      <th>使用されている AWS リソース</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>静的サイトホスティング</td>
      <td>Amazon CloudFront、Amazon S3</td>
    </tr>
    <tr>
      <td>GraphQL によるリクエスト</td>
      <td>Amazon S3</td>
    </tr>
  </tbody>
</table>

#### ▼ バックエンド

フロントエンドで GraphQL によるリクエストを実装している場合、AppSync を使用して、これを受信できる API を作成する必要がある。

<table>
  <thead>
    <tr>
      <th>役割</th>
      <th>使用されている AWS リソース</th>
      <th>クリーンアーキテクチャで相当するレイヤー</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>リアルタイム通知</td>
      <td>AppSync、IoT Core</td>
      <td>インフラストラクチャ層</td>
    </tr>
    <tr>
      <td>RESTful-API、GraphQL-API</td>
      <td>Amazon API Gateway、AppSync</td>
      <td>インフラストラクチャ層</td>
    </tr>
    <tr>
      <td>認証</td>
      <td>Cognito</td>
      <td>インターフェース層</td>
    </tr>
    <tr>
      <td>認可</td>
      <td>Cognito</td>
      <td>ユースケース層</td>
    </tr>
    <tr>
      <td>ビジネスロジック</td>
      <td>AWS Lambda</td>
      <td>ドメイン層</td>
    </tr>
    <tr>
      <td>全文検索</td>
      <td>Elastic Search</td>
      <td>ドメイン層</td>
    </tr>
  </tbody>
</table>

#### ▼ ストレージ

<table>
  <thead>
    <tr>
      <th>役割</th>
      <th>使用されている AWS リソース</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>NoSQL</td>
      <td>DynamoDB</td>
    </tr>
    <tr>
      <td>ファイル保管</td>
      <td>Amazon S3</td>
    </tr>
  </tbody>
</table>

#### ▼ CI/CD パイプライン

AWS Amplify は、連携先のリポジトリからソースコードをプルし、アプリケーションをビルドする。

GitHub のブランチごとにアプリケーションの CI/CD パイプラインが発火するようにすれば、プルリクエストごとにアプリケーションの実行環境を用意できる。

プルリクごとに実行環境を作成できると、例えば、`1` 個のプルリクをデザイナーサイドやビジネスサイド (例：SEO など) がレビューできるようになる。

ただし、App Runner を使用したほうがよいかもしれない。

> - [App Runnerの登場とAmplify ConsoleのSSR対応でVPCレスなAWSアーキテクチャを夢見た話](https://zenn.dev/intercept6/articles/4016e9d61ab36761685d)
> - [AWS App RunnerとGitHub Actionsでレビュー環境を構築する - BASEプロダクトチームブログ](https://devblog.thebase.in/entry/2021/12/22/110000)

<br>

## 03. セットアップ

### コンソール画面の場合

#### ▼ 設定項目と説明

<table>
  <thead>
    <tr>
      <th>項目</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>アプリケーションの名前</td>
      <td>AWS Amplify 上でのアプリケーション名を設定する。</td>
      <td></td>
    </tr>
    <tr>
      <td>本番稼働ブランチ</td>
      <td>基点ブランチを設定する。</td>
      <td>AWS Amplify を本番運用しない場合は、<code>develop</code> ブランチを設定すればよい。</td>
    </tr>
    <tr>
      <td>ブランチの自動検出</td>
      <td>ブランチの自動検出を有効化するか否かを設定する。</td>
      <td>ワイルドカード (<code>*</code>) を組み込む場合、アスタリスクを 2 つ割り当てないと、ブランチが検知されないことがある。例：『<code>**foo**,**bar**</code>』</td>
    </tr>
    <tr>
      <td>プレビュー</td>
      <td>GitHub のプルリクエスト上に AWS Amplify 環境の URL を通知する。</td>
      <td>執筆時点 (2021/02/07) では、プルリクエストを新しく作成しても、これは自動的に登録されない。そのため、その都度手動で登録する必要がある。</td>
    </tr>
    <tr>
      <td>アクセスコントロール</td>
      <td>AWS Amplify 環境に認証機能を設定する。</td>
      <td>執筆時点 (2021/02/07) では、ベーシック認証を使用できる。</td>
    </tr>
    <tr>
      <td>リダイレクト</td>
      <td>リダイレクトするパスを設定する。</td>
      <td><code>404</code> ステータスで 404 ページにリダイレクトする場合は、以下の通りに設定する。<br>・送信元：<code>/&lt;*&gt;</code><br>・ターゲットアドレス：<code>&lt;404ページへのパス&gt;</code><br>・404 (リダイレクト)</td>
    </tr>
  </tbody>
</table>

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

> - [Getting started with deploying an app to Amplify Hosting - AWS Amplify Hosting](https://docs.aws.amazon.com/amplify/latest/userguide/getting-started.html#step-1-connect-repository)

#### ▼ 対応するバージョン管理リポジトリ構造

<table>
  <thead>
    <tr>
      <th>構造名</th>
      <th>ビルド開始ディレクトリ</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>非モノレポ</td>
      <td>リポジトリ名からなるディレクトリ</td>
    </tr>
    <tr>
      <td>モノレポ</td>
      <td>モノレポの各アプリケーションディレクトリ</td>
    </tr>
  </tbody>
</table>

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
# バックエンドの CI/CD パイプライン
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
# フロントエンドの CI/CD パイプライン
#=====================
frontend:
  phases:
    preBuild:
      commands:
        - npm install
        # base64 方式エンコード値をデコード
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

> - [Configuring the build settings for an Amplify application - AWS Amplify Hosting](https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html)
> - [Deploying server-side rendered applications with Amplify Hosting - AWS Amplify Hosting](https://docs.aws.amazon.com/amplify/latest/userguide/server-side-rendering-amplify.html#deploy-nextjs-app)

<br>
