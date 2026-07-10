---
title: 【IT技術の知見】IAM＠Google Cloudリソース
description: IAM＠Google Cloudリソースの知見を記録しています。
---

# IAM＠Google Cloudリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. プリンシパル

### プリンシパルとは

ロールの紐付け対象のこと。

<br>

### プリンシパルの種類

- ユーザー
- サービスアカウント
- グループ
- ドメイン
- Kubernetes の ServiceAccount

> - https://cloud.google.com/iam/docs/principal-identifiers?hl=ja
> - https://www.seplus.jp/dokushuzemi/blog/2023/04/gcp_essential_iam.html

<br>

## 01-02. ユーザー

### ユーザーとは

記入中...

<br>

### 認証

#### ▼ 資格情報

記入中...

#### ▼ 手動認証

```bash
$ gcloud auth login
```

<br>

## 01-03. サービスアカウント

### サービスアカウントとは

GoogleCloud リソース自体のアカウントである。

サービスアカウントを実際の Google Cloud リソースや外部リソース (例：AWS リソース、ログ収集ツールなど) に紐づけるためには、サービスアカウントの資格情報ファイルをこれに持たせる必要がある。

<br>

### サービスアカウントキー

サービスアカウントの資格情報である。

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

> - https://cloud.google.com/docs/authentication/production
> - https://cloud.google.com/iam/docs/creating-managing-service-account-keys

<br>

### 開発者が使用する場合

資格情報ファイルのパスを設定する。

```bash
$ gcloud auth login --cred-file="<資格情報ファイルのパス>"
```

資格情報ファイルの現在のパスは、`gcloud info` コマンドで確認する。

```bash
$ gcloud info
```

> - https://cloud.google.com/sdk/docs/authorizing?hl=ja#service-account
> - https://cloud.google.com/sdk/docs/authorizing?hl=ja#find-cred-files

<br>

### アプリケーションが使用する場合

#### ▼ ファイルパスを指定しない場合

ファイルパスを指定しない場合、`$HOME/.config/gcloud/application_default_credentials.json` ファイルを読み込む。

> - https://cloud.google.com/docs/authentication/application-default-credentials?hl=ja#personal

#### ▼ ファイルパスの指定する場合

資格情報ファイルのパスを `GOOGLE_APPLICATION_CREDENTIALS` 変数に設定する。

サービスアカウントとしてのリソースは、これを自動的に読み込み、サービスアカウントに紐づく。

> - https://cloud.google.com/docs/authentication/application-default-credentials?hl=ja#GAC

<br>

## 02. パーミッション (権限)

### パーミッションとは

認可スコープのこと。

`<サービス>.<Google Cloudリソース>.<動作>` (例：`compute.instances.create`) で表記する。

<br>

### 種類

- 基本ロール
- 事前定義ロール
- カスタムロース

<br>

## 03. ロール

### ロールとは

パーミッションのセットのこと。

プリンシパルに紐づける。

|                                    |                                            |
| ---------------------------------- | ------------------------------------------ |
| ビルトインロール                   | `roles/<GoogleCloudリソース名>.<識別名>`   |
| プロジェクトレベルのカスタムロース | `projects/<プロジェクトID>/roles/<識別名>` |
| 組織レベルのカスタムロール         | `organizations/<組織ID>/roles/<識別名>`    |

> - https://www.seplus.jp/dokushuzemi/blog/2023/04/gcp_essential_iam.html
> - https://cloud.google.com/iam/docs/roles-overview?hl=ja#components

<br>

## 04. ポリシー

> - https://www.seplus.jp/dokushuzemi/blog/2023/04/gcp_essential_iam.html

<br>

## 05. Workload Identity

### Workload Identityとは

GoogleCloud 外リソース (例：AWS、Azure、Kubernetes など) から GoogleCloud リソースの API にリクエストを送信する場合に、外部リソースをサービスアカウントに紐づけて、API にリクエストを送信できるようにする仕組みのこと。

従来は、サービスアカウントのサービスアカウントキーを GoogleCloud 外リソースを持たせる仕組みであった。

一方で、Workload Identity ではサービスアカウントキーの代わりにトークンを使用する。

> - https://zenn.dev/ohsawa0515/articles/gcp-workload-identity-federation

<br>

### Workload Identityの仕組み

#### ▼ アーキテクチャ

1. GoogleCloud 以外で認証する。
2. 認証が成功する。
3. 資格情報を GoogleCloud STS に送信する。
4. Workload Identity プールにて、資格情報を検証する。
5. 検証が成功し、一時的なトークンを発行する。
6. GoogleCloud 以外リソースにトークンを送信する。
7. GoogleCloud 以外リソースは、トークンを使用して GoogleCloud リソースのサービスアカウントに紐づく。
8. GoogleCloud リソースの API にリクエストを送信できるようになる。

![google-cloud_workload-identity](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/google-cloud_workload-identity.png)

> - https://christina04.hatenablog.com/entry/workload-identity-federation
> - https://zenn.dev/k6s4i53rx/articles/18a72c2db8c9e9

#### ▼ Workload Identityプール

GoogleCloud 外リソースのグループを設定する。

例えば、AWS 側で OpenTelemetry Collector を使用する場合、Workload Identity プールは `opentelemetry-collector` とする。

#### ▼ プロバイダー

各 GoogleCloud 外リソースを設定する。

外部リソースの種類ごとに単位 (例：AWS であれば AWS アカウントごと) が異なる。

例えば、AWS 側の本番環境で OpenTelemetry Collector を使用する場合、Workload Identity プールは `prd-opentelemetry-collector` とする。

#### ▼ アクセス許可

プロバイダーに応じた権限を設定する。

例えば、プロバイダーが AWS であれば `aws_role` で IAM ロールの委譲用の ARN (`arn:aws:sts:<新しいアカウントID>:assumed-role/<IAMロール名>`) を設定し、IAM ロールにサービスアカウントを紐づけられる。

> - https://gmor-sys.com/2022/12/09/linking-aws-role-and-gcp-accounts/#outline__2

<br>

### Google CloudとAWSの連携の場合

AWS IAM ロール名とこれに紐づけるサービスアカウント名を Workload Identity に設定する。

この IAM ロールは、通常の IAM ロールだけでなく、IRSA 用 IAM ロールでもよい (設定は複雑になるが) 。

AWS IAM ロールを経由して、サービスアカウントを使用できるようになる。

> - https://gmor-sys.com/2022/12/09/linking-aws-role-and-gcp-accounts/#outline__2
> - https://zenn.dev/ohsawa0515/articles/gcp-workload-identity-federation#amazon-eks%E3%81%8B%E3%82%89%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%99%E3%82%8B%E5%A0%B4%E5%90%88
> - https://www.softbank.jp/biz/blog/cloud-technology/articles/202206/eks-to-gcp/

<br>
