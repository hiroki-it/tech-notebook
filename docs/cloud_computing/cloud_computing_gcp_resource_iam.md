---
title: 【IT技術の知見】IAM＠GCPリソース
description: IAM＠GCPリソースの知見を記録しています。
---

# IAM＠GCPリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. プリンシパル

### プリンシパルとは

ロールの紐付け対象のこと。

<br>

### 種類

- ユーザー
- サービスアカウント (GCPリソース)
- IAMグループ
- ドメイン
- KubernetesのServiceAccount

> ↪️ 参考：
>
> - https://cloud.google.com/iam/docs/principal-identifiers?hl=ja
> - https://www.seplus.jp/dokushuzemi/blog/2023/04/gcp_essential_iam.html

<br>

## 01-02. ユーザー

### ユーザーとは

記入中...

<br>

### 認証

#### ▼ 認証情報

記入中...

#### ▼ 手動認証

```bash
$ gcloud auth login
```

<br>

## 01-03. サービスアカウント

### サービスアカウントとは

サービスアカウントを実際のGCPリソースや外部リソース (例：AWSリソース、ログ収集ツール、など) に紐づけるためには、サービスアカウントの認証情報ファイルをこれに持たせる必要がある。

<br>

### 認証情報

```yaml
{
  "type": "service_account",
  "project_id": "<プロジェクトID>",
  "private_key_id": "<プライベート鍵ID>",
  "private_key": "-----BEGIN PRIVATE KEY-----*****-----END PRIVATE KEY-----",
  "client_email": "example@gmail.com",
  "client_id": "<クライアントID>",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://accounts.google.com/o/oauth2/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/<鍵名>%<プロジェクトID>.iam.gserviceaccount.com",
}
```

> ↪️ 参考：
>
> - https://cloud.google.com/docs/authentication/production
> - https://cloud.google.com/iam/docs/creating-managing-service-account-keys

<br>

### 開発者が使用する場合

認証情報ファイルのパスを設定する。

```bash
$ gcloud auth login --cred-file="<認証情報ファイルのパス>"
```

認証情報ファイルの現在のパスは、`gcloud info`コマンドで確認する。

```bash
$ gcloud info
```

> ↪️ 参考：
>
> - https://cloud.google.com/sdk/docs/authorizing?hl=ja#service-account
> - https://cloud.google.com/sdk/docs/authorizing?hl=ja#find-cred-files

<br>

### アプリケーションが使用する場合

#### ▼ 自動認証

認証情報ファイルを環境変数の`GOOGLE_APPLICATION_CREDENTIALS`に設定する。

サービスアカウントとしてのリソースは、これを自動的に読み込み、サービスアカウントに紐づく。

> ↪️ 参考：https://cloud.google.com/docs/authentication/production?hl=ja#automatically

#### ▼ 手動認証

認証情報のファイルパスを設定する。

サービスアカウントとしてのリソースは、これを読み込み、サービスアカウントに紐づく。

```bash
$ export GOOGLE_APPLICATION_CREDENTIALS="<認証情報ファイルパス>"
```

> ↪️ 参考：https://cloud.google.com/docs/authentication/production?hl=ja#passing_variable

<br>

## 02. パーミッション (権限)

### パーミッションとは

認可スコープのこと。

`<サービス>.<GCPリソース>.<動作>` (例：`compute.instances.create`) で表記する。

<br>

### 種類

- 基本ロール
- 事前定義ロール
- カスタムロース

<br>

## 02. ロール

### ロールとは

パーミッションのセットのこと。

> ↪️ 参考：https://www.seplus.jp/dokushuzemi/blog/2023/04/gcp_essential_iam.html

<br>

## 03. ポリシー

> ↪️ 参考：https://www.seplus.jp/dokushuzemi/blog/2023/04/gcp_essential_iam.html

<br>
