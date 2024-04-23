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
- KubernetesのServiceAccount

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

GoogleCloudリソース自体のアカウントである。

サービスアカウントを実際のGoogle Cloudリソースや外部リソース (例：AWSリソース、ログ収集ツール、など) に紐づけるためには、サービスアカウントの認証情報ファイルをこれに持たせる必要がある。

<br>

### サービスアカウントキー

サービスアカウントの認証情報である。

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

認証情報ファイルのパスを設定する。

```bash
$ gcloud auth login --cred-file="<認証情報ファイルのパス>"
```

認証情報ファイルの現在のパスは、`gcloud info`コマンドで確認する。

```bash
$ gcloud info
```

> - https://cloud.google.com/sdk/docs/authorizing?hl=ja#service-account
> - https://cloud.google.com/sdk/docs/authorizing?hl=ja#find-cred-files

<br>

### アプリケーションが使用する場合

#### ▼ ファイルパスを指定しない場合

ファイルパスを指定しない場合、`$HOME/.config/gcloud/application_default_credentials.json`ファイルを読み込む。

> - https://cloud.google.com/docs/authentication/application-default-credentials?hl=ja#personal

#### ▼ ファイルパスの指定する場合

認証情報ファイルのパスを`GOOGLE_APPLICATION_CREDENTIALS`変数に設定する。

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

GoogleCloud外リソース (例：AWS、Azure、Kubernetes、など) からGoogleCloudリソースのAPIにリクエストを送信する場合に、外部リソースをサービスアカウントに紐づけて、APIにリクエストを送信できるようにする仕組みのこと。

従来は、サービスアカウントのサービスアカウントキーをGoogleCloud外リソースを持たせる仕組みであった。

一方で、Workload Identityではサービスアカウントキーの代わりにトークンを使用する。

> - https://zenn.dev/ohsawa0515/articles/gcp-workload-identity-federation

<br>

### Workload Identityの仕組み

#### ▼ アーキテクチャ

1. GoogleCloud以外で認証を実行する。
2. 認証が成功する。
3. 認証情報をGoogleCloud STSに送信する。
4. Workload Identityプールにて、認証情報を検証する。
5. 検証が成功し、一時的なトークンを発行する。
6. GoogleCloud以外リソースにトークンを送信する。
7. GoogleCloud以外リソースは、トークンを使用してGoogleCloudリソースのサービスアカウントに紐づく。
8. GoogleCloudリソースのAPIにリクエストを送信できるようになる。

![google-cloud_workload-identity](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/google-cloud_workload-identity.png)

> - https://christina04.hatenablog.com/entry/workload-identity-federation
> - https://zenn.dev/k6s4i53rx/articles/18a72c2db8c9e9

#### ▼ Workload Identityプール

GoogleCloud外リソースのグループを設定する。

例えば、AWS側でOpenTelemetry Collectorを使用する場合、Workload Identityプールは`opentelemetry-collector`とする。

#### ▼ プロバイダー

個別のGoogleCloud外リソースを設定する。

外部リソースの種類ごとに単位 (例：AWSであればAWSアカウントごと) が異なる。

例えば、AWS側の本番環境でOpenTelemetry Collectorを使用する場合、Workload Identityプールは`prd-opentelemetry-collector`とする。

#### ▼ アクセス許可

プロバイダーに応じた権限を設定する。

例えば、プロバイダーがAWSであれば`aws_role`でIAMロールの委譲用のARN (`arn:aws:sts:<新しいアカウントID>:assumed-role/<IAMロール名>`) を設定し、IAMロールにサービスアカウントを紐づけられる。

> - https://gmor-sys.com/2022/12/09/linking-aws-role-and-gcp-accounts/#outline__2

<br>

### Google CloudとAWSの連携の場合

AWS IAMロール名とこれに紐づけるサービスアカウント名をWorkload Identityに設定する。

このIAMロールは、通常のIAMロールだけでなく、IRSA用のIAMロールでもよい (設定は複雑になるが) 。

AWS IAMロールを経由して、サービスアカウントを使用できるようになる。

> - https://gmor-sys.com/2022/12/09/linking-aws-role-and-gcp-accounts/#outline__2
> - https://zenn.dev/ohsawa0515/articles/gcp-workload-identity-federation#amazon-eks%E3%81%8B%E3%82%89%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%81%99%E3%82%8B%E5%A0%B4%E5%90%88
> - https://www.softbank.jp/biz/blog/cloud-technology/articles/202206/eks-to-gcp/

<br>
