---
title: 【IT技術の知見】STS＠AWSリソース
description: STS＠AWSリソースの知見を記録しています。
---

# STS＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. STSとは：Security Token Service

認証済みのAWS IAMユーザーに対して、特定のAWSアカウントのAWSリソースに認可スコープを持つ一時的な認証情報 (アクセスキーID、シークレットアクセスキー、セッショントークン) を持つAWS IAMユーザーを発行する。

![STS](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/STS.jpg)

<br>

## 02. スイッチロールの仕組み

### スイッチロールとは

AssumeRole (権限委譲) によって、ユーザーのAWS IAMロールを動的に切り替える。

> - https://cloud.oreda.net/aws/iam/assumerole#assume_role%E3%82%A2%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%A8%E3%81%AF

### 1. AWS IAMロールに信頼ポリシーを紐付け

必要なポリシーが設定されたAWS IAMロールを作成する。

その時信頼ポリシーでは、AWS IAMユーザーの`ARN`を信頼されたエンティティとして設定しておく。

これにより、そのAWS IAMユーザーに対して、AWS IAMロールを紐付けできるようになる。

この時に使用するユーザーは、AWS IAMユーザーではなく、AWSリソースやフェデレーテッドユーザーでもよい。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Principal":
          {"AWS": "arn:aws:iam::<AWSアカウントID>:user/<ユーザー名>"},
        "Action": "sts:AssumeRole",
        "Condition": {
            # 完全一致
            "StringEquals": {"sts:ExternalId": "<適当な文字列>"},
          },
      },
    ],
}
```

<br>

### 2. AWS IAMロールを引き受けた認証情報をリクエスト

信頼されたエンティティから、STSのエンドポイント (`https://sts.amazonaws.com`) に対して、ロールの紐付けをリクエストする。

OIDCによるフェデレーションユーザーの場合は、`--external-id`オプションの代わりに、`--web-identity-token`オプションを使用する。

このオプションに、発行されたJWTを設定する必要がある。

```bash
#!/bin/bash

set -xeuo pipefail

# 事前に環境変数に実行環境名を代入する。
case "${ENV}" in
    "tes")
        aws_account_id="<テスト環境アカウントID>"
        aws_access_key_id="<テスト環境アクセスキーID>"
        aws_secret_access_key="<テスト環境シークレットアクセスキー>"
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
        echo "The parameter "${ENV}" is invalid."
        exit 1
    ;;
esac

# 信頼されたエンティティの認証情報を設定する。
aws configure set aws_access_key_id "$aws_account_id"
aws configure set aws_secret_access_key "$aws_secret_access_key"
aws configure set aws_default_region "ap-northeast-1"

# https://sts.amazonaws.com に、ロールの紐付けをリクエストする。
aws_sts_credentials="$(aws sts assume-role \
  --role-arn "arn:aws:iam::${aws_access_key_id}:role/"${ENV}"-<紐付けしたいAWS IAMロール名>" \
  --role-session-name "<任意のセッション名>" \
  --external-id "$aws_iam_role_external_id" \
  --duration-seconds "<セッションの失効秒数>" \
  --query "Credentials" \
  --output "json")"
```

<br>

### 3. 返信されたレスポンスから認証情報を取得

STSのエンドポイントから一時的な認証情報が発行される。

また同時に、この認証情報は、ローカルマシンの`~/.aws/cli/cache`ディレクトリ配下にも`json`ファイルで保管される。

認証情報の失効時間に合わせて、STSはこの`json`ファイルを定期的に更新する。

```yaml
{
  "Credentials":
    {
      "AccessKeyId": "<アクセスキーID>",
      "SecretAccessKey": "<シークレットアクセスキー>",
      "SessionToken": "<セッショントークン文字列>",
      "Expiration": "<セッションの期限>",
    },
  "AssumeRoleUser":
    {
      "AssumedRoleId": "<セッションID>:<セッション名>",
      "Arn": "arn:aws:sts:<新しいアカウントID>:assumed-role/<AWS IAMロール名>/<セッション名>",
    },
  "ResponseMetadata":
    {
      "RequestId": "*****",
      "HTTPStatusCode": 200,
      "HTTPHeaders":
        {
          "x-amzn-requestid": "*****",
          "content-type": "text/xml",
          "content-length": "1472",
          "date": "Fri, 01 Jul 2022 13:00:00 GMT",
        },
      "RetryAttempts": 0,
    },
}
```

> - https://docs.aws.amazon.com/cli/latest/topic/config-vars.html

<br>

### 4. 認証情報を取得

レスポンスされたデータから認証情報を抽出する。

この時、アクセスキーID、シークレットアクセスキー、セッショントークン、が必要になる。

代わりに、`~/.aws/cli/cache`ディレクトリ配下の`json`ファイルから取得しても良い。

認証情報を環境変数として出力し、使用できるようにする。

```bash
#!/bin/bash

cat <<EOF > assumed_user.sh
export AWS_ACCESS_KEY_ID="$(echo "$aws_sts_credentials" | jq -r ".AccessKeyId")"
export AWS_SECRET_ACCESS_KEY="$(echo "$aws_sts_credentials" | jq -r ".SecretAccessKey")"
export AWS_SESSION_TOKEN="$(echo "$aws_sts_credentials" | jq -r ".SessionToken")"
export AWS_ACCOUNT_ID="$aws_account_id"
export AWS_DEFAULT_REGION="ap-northeast-1"
EOF
```

環境変数に登録する代わりに、AWSの認証情報ファイルを作成しても良い。

```bash
#!/bin/bash

aws configure --profile "${ENV}"-repository <<EOF
$(echo "$aws_sts_credentials" | jq -r ".AccessKeyId")
$(echo "$aws_sts_credentials" | jq -r ".SecretAccessKey")
ap-northeast-1
json
EOF

echo aws_session_token = $(echo "$aws_sts_credentials" | jq -r ".SessionToken") >> ~/.aws/credentials
```

> - https://stedolan.github.io/jq/

<br>

### 5. 認証認可の動作確認

ロールを引き受けた新しいアカウントを使用して、AWSリソースに認証認可できるか否かを確認する。

認証情報の取得方法として認証情報ファイルの作成を`tfstate`ファイル択した場合、`profile`オプションが必要である。

```bash
#!/bin/bash

# 認証情報ファイルを参照するオプションが必要がある。
aws s3 ls --profile <プロファイル名> <tfstateファイルが管理されるバケット名>
```

<br>

## 03. STSで発行されるAWS IAMユーザー

### Trusted Entityの事前作成

事前に、元となるAWS IAMユーザー (Trusted Entity) を作成しておく。

AssumeRoleによるスイッチロールの仕組みでは、まずTrusted Entityをコールする。

Trusted Entityを使って、必要なAWS IAMロールをSTSから発行し、一時的なAWS IAMユーザーを作成する。

![AssumeRole](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/AssumeRole.png)

> - https://www.slideshare.net/tetsunorinishizawa/aws-cliassume-role#10
> - https://blog.serverworks.co.jp/tech/2020/02/03/multipleawsaccount/

<br>

### AWS IAMユーザーの自動更新

STSで発行されたAWS IAMユーザーには、そのAWSアカウント内のみで使用できるロールが紐付けられている。

この情報には失効秒数が存在し、期限が過ぎると新しいAWS IAMユーザーになる。

秒数の最大値は、該当するAWS IAMロールの概要の最大セッション時間から変更できる。

<br>

### 発行するAWS IAMユーザーの切り替え

AWS IAMユーザーを一括で管理しておき、特定のAWSアカウントでは特定の認可スコープを委譲する。

![sts_multi-account](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/sts_multi-account.png)

> - https://garafu.blogspot.com/2020/11/how-to-switch-role.html

<br>

## 04. AWS IAMユーザーの発行元

### フェデレーテッドユーザー

任意のIDプロバイダーで認証済みのユーザー (フェデレーテッドユーザー) にAWS IAMロールを付与することにより、AWSリソースにリクエストを送信できる。

> - https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers.html

<br>

### OIDC、Web IDフェデレーション

#### ▼ OIDC、Web IDフェデレーションとは

OIDCまたはWeb IDフェデレーションによる認証/認可を使用する。

> - https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html

#### ▼ CognitoをIDプロバイダーとする場合

CognitoをIDプロバイダーとして使用するように、信頼されたエンティティを設定する。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    {
      "Effect": "Allow",
      "Principal": {"Federated": "cognito-identity.amazonaws.com"},
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
          # 完全一致
          "StringEquals": {"cognito-identity.amazonaws.com:aud": "*****"},
          "ForAnyValue:StringLike":
            {"cognito-identity.amazonaws.com:amr": "unauthenticated"},
        },
    },
}
```

#### ▼ AWS EKSをIDプロバイダーとする場合

![AWS EKS_oidc](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/EKS_oidc.png)

AWS EKSをIDプロバイダーとして使用するように、`Federated`キーでAWS EKS Clusterの識別子を設定する。

これにより、AWS EKS Cluster内で認証済みのServiceAccountにAWS IAMロールを紐付けることができるようになる。

また、`Condition`キーで特定のServiceAccountを指定できるようにする。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Sid": "",
        "Effect": "Allow",
        "Principal":
          {
            "Federated": "arn:aws:iam::<AWSアカウントID>:oidc-provider/<AWS EKS ClusterのOpenID ConnectプロバイダーURL>",
          },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
            # 完全一致
            "StringEquals":
              {
                "<AWS EKS ClusterのOpenID ConnectプロバイダーURL>:sub":
                  ["system:serviceaccount:<Namespace名>:<ServiceAccount名>"],
              },
          },
      },
    ],
}
```

KubernetesのServiceAccountを作成し、AWS IAMロールのARNを設定する。

ServiceAccountは、Terraformではなくマニフェストで定義した方が良い。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  annotations:
    AWS EKS.amazonaws.com/role-arn: <AWS IAMロールのARN>
  name: <信頼されたエンティティで指定したユーザー名内のServiceAccount名>
  namespace: <信頼されたエンティティで指定したユーザー名内のNamespace名>
```

IRSAにより、ServiceAccountを介してPodとAWS IAMロールが紐づく。

> - https://aws.amazon.com/jp/blogs/news/diving-into-iam-roles-for-service-accounts/
> - https://dev.classmethod.jp/articles/iam-role-for-gitlab-runner-job/#toc-13
> - https://moneyforward-dev.jp/entry/2021/12/19/irsa/

#### ▼ その他のIDプロバイダー

- Auth0
- Keycloak
- Google Cloud Auth

<br>

### SAMLベースフェデレーション

SAMLによる認証/認可を使用する。

> - https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_saml.html

<br>

## 05. AWS IAMロールの委譲先ユーザー

### AWS IAMロールの委譲先ユーザー

AWS IAMユーザー、AWSリソース、フェデレーテッドユーザー、にAWS IAMロールを委譲できる。

![aws_sts_assumed-user](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_sts_assumed-user.png)

> - https://dev.classmethod.jp/articles/re-introduction-2022-aws-iam/

<br>

### AWS IAMロールの委譲先ユーザーの種類

#### ▼ AWS IAMユーザー

AWS IAMロールと同じ/異なるAWSアカウントのAWS IAMユーザーに委譲できる。

AWS IAMユーザーの場合、外部IDが必要になる。

> - https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_common-scenarios_third-party.html

#### ▼ AWSリソース

AWS IAMロールと同じ/異なるAWSアカウントのAWSリソースに委譲できる。

AWS IAMリソースの場合、外部IDが必要になる。

> - https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_common-scenarios_services.html

#### ▼ フェデレーテッドユーザー

OIDC、SAML、によって発行されたユーザーに委譲できる。

OIDCのフェデレーテッドユーザーの場合、発行されたJWTが必要になる。

> - https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_common-scenarios_federated-users.html
> - https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_saml.html

<br>

### フェデレーテッドユーザー

#### ▼ AWS OIDC

AWS IAMロールの信頼されたエンティティに、AWS OIDCで発行されたユーザーを設定する。

フェデレーテッドユーザーは任意のIPプロバイダーで発行する。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    {
      "Effect": "Allow",
      "Principal": {"Federated": "cognito-identity.amazonaws.com"},
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
          # 完全一致
          "StringEquals": {"cognito-identity.amazonaws.com:aud": "*****"},
          "ForAnyValue:StringLike":
            {"cognito-identity.amazonaws.com:amr": "unauthenticated"},
        },
    },
}
```

> - https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html

#### ▼ 外部OIDC

AWS IAMロールの信頼されたエンティティに、外部OIDCサービスで発行されたユーザーを設定する。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    {
      "Effect": "Allow",
      "Principal": {"Federated": "accounts.google.com"},
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
          # 完全一致
          "StringEquals": {"accounts.google.com:aud": "*****"},
          "ForAnyValue:StringLike":
            {"accounts.google.com:amr": "unauthenticated"},
        },
    },
}
```

> - https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html

#### ▼ AWS SAML

AWS IAMロールの信頼されたエンティティに、AWS SAMLで発行されたユーザーを設定する。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Principal":
          {
            "Federated": "arn:aws:iam::<AWSアカウントID>:saml-provider/<プロバイダー名>",
          },
        "Action": "sts:AssumeRole",
        "Condition": {
            # 完全一致
            "StringEquals": {"SAML:aud": "https://signin.aws.amazon.com/saml"},
          },
      },
    ],
}
```

> - https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_saml.html

<br>
