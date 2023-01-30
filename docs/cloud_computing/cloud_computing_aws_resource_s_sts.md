---
title: 【IT技術の知見】STS＠Sで始まるAWSリソース
description: STS＠Sで始まるAWSリソースの知見を記録しています。
---

# STS＠```S```で始まるAWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>


## 01. STSとは：Security Token Service

認証済みのIAMユーザーに対して、特定のAWSアカウントのAWSリソースに認可スコープを持つ一時的なクレデンシャル情報（アクセスキーID、シークレットアクセスキー、セッショントークン）を発行する。



![STS](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/STS.jpg)

STSに対するリクエストの結果、別の認証情報と認可スコープを持つ新しいIAMユーザーを取得できる。

このIAMユーザーには、そのAWSアカウント内でのみ使用できるロールが紐付けられている。

この情報には有効秒数が存在し、期限が過ぎると新しいIAMユーザーになる。

秒数の最大値は、該当するIAMロールの概要の最大セッション時間から変更できる。



> ℹ️ 参考：https://www.slideshare.net/tetsunorinishizawa/aws-cliassume-role/10

![AssumeRole](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/AssumeRole.png)

IAMユーザーを一括で管理しておき、特定のAWSアカウントでは特定の認可スコープを委譲するようにする。



> ℹ️ 参考：https://garafu.blogspot.com/2020/11/how-to-switch-role.html

![sts_multi-account](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/sts_multi-account.png)

<br>


## 02. IAMロールの委譲先ユーザー

### IAMロールの委譲先ユーザー

IAMユーザー、AWSリソース、フェデレーテッドユーザー、がある。

![aws_sts_assumed-user](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/aws_sts_assumed-user.png)


> ℹ️ 参考：https://dev.classmethod.jp/articles/re-introduction-2022-aws-iam/


<br>

### IAMロールの委譲先ユーザーの種類

#### ▼ IAMユーザー

IAMロールと同じ/異なるAWSアカウントのIAMユーザーに委譲できる。

IAMユーザーの場合、外部IDが必要になる。



> ℹ️ 参考：https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_common-scenarios_third-party.html

#### ▼ AWSリソース

IAMロールと同じ/異なるAWSアカウントのAWSリソースに委譲できる。

IAMリソースの場合、外部IDが必要になる。



> ℹ️ 参考：https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_common-scenarios_services.html

#### ▼ フェデレーテッドユーザー

OIDC、SAML、によって発行されたユーザーに委譲できる。

OIDCのフェデレーテッドユーザーの場合、発行されたJWTが必要になる。



> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_common-scenarios_federated-users.html
> - https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_saml.html

<br>

### フェデレーテッドユーザー

#### ▼ AWS OIDC

IAMロールの信頼されたエンティティに、AWS OIDCで発行されたユーザーを設定する。



> ℹ️ 参考：https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html

```yaml
{
    "Version": "2012-10-17",
    "Statement": {
        "Effect": "Allow",
        "Principal": {
          "Federated": "cognito-identity.amazonaws.com"
        },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
            "StringEquals": {
              "cognito-identity.amazonaws.com:aud": "*****"
            },
            "ForAnyValue:StringLike": {
              "cognito-identity.amazonaws.com:amr": "unauthenticated"
            }
        }
    }
}

```

#### ▼ 外部OIDC

IAMロールの信頼されたエンティティに、外部OIDCサービスで発行されたユーザーを設定する。




> ℹ️ 参考：https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html

```yaml
{
    "Version": "2012-10-17",
    "Statement": {
        "Effect": "Allow",
        "Principal": {
          "Federated": "accounts.google.com"
        },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
            "StringEquals": {
              "accounts.google.com:aud": "*****"
            },
            "ForAnyValue:StringLike": {
              "accounts.google.com:amr": "unauthenticated"
            }
        }
    }
}
```

#### ▼ AWS SAML

IAMロールの信頼されたエンティティに、AWS SAMLで発行されたユーザーを設定する。



> ℹ️ 参考：https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_saml.html

```yaml
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<アカウントID>:saml-provider/<プロバイダー名>"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "SAML:aud": "https://signin.aws.amazon.com/saml"
        }
      }
    }
  ]
}
```

<br>

## 03. セットアップ

### 1. IAMロールに信頼ポリシーを紐付け

必要なポリシーが設定されたIAMロールを作成する。

その時信頼ポリシーでは、IAMユーザーの```ARN```を信頼されたエンティティとして設定しておく。

これにより、そのIAMユーザーに対して、ロールを紐付けできるようになる。

この時に使用するユーザーは、IAMユーザーではなく、AWSリソースやフェデレーテッドユーザーでもよい。



```yaml
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
          # IAMユーザーを使用する場合は、外部IDが必要になる。
          "sts:ExternalId": "<適当な文字列>"
        }
      }
    }
  ]
}
```

<br>


### 2. ロールを引き受けたクレデンシャル情報をリクエスト

信頼されたエンティティから、STSのエンドポイント（```https://sts.amazonaws.com```）に対して、ロールの紐付けをリクエストする。OIDCによるフェデレーションユーザーの場合は、```--external-id```オプションの代わりとして、```--web-identity-token```オプションを使用する。このオプションに、発行されたJWTを設定する必要がある。

```bash
#!/bin/bash

set -xeuo pipefail

# 事前に環境変数に実行環境名を代入する。
case "$ENV" in
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
        echo "The parameter "$ENV" is invalid."
        exit 1
    ;;
esac

# 信頼されたエンティティのクレデンシャル情報を設定する。
aws configure set aws_access_key_id "$aws_account_id"
aws configure set aws_secret_access_key "$aws_secret_access_key"
aws configure set aws_default_region "ap-northeast-1"

# https://sts.amazonaws.com に、ロールの紐付けをリクエストする。
aws_sts_credentials="$(aws sts assume-role \
  --role-arn "arn:aws:iam::${aws_access_key_id}:role/"$ENV"-<紐付けしたいIAMロール名>" \
  --role-session-name "<任意のセッション名>" \
  --external-id "$aws_iam_role_external_id" \
  --duration-seconds "<セッションの有効秒数>" \
  --query "Credentials" \
  --output "json")"
```

<br>


### 3. 返信されたレスポンスからクレデンシャル情報を取得

STSのエンドポイントから一時的なクレデンシャル情報が発行される。

また同時に、このクレデンシャル情報は、ローカルマシンの```~/.aws/cli/cache```ディレクトリ配下にも```.json```ファイルで保管される。

クレデンシャルの失効時間に合わせて、STSはこの```.json```ファイルを定期的に更新する。



> ℹ️ 参考：https://docs.aws.amazon.com/cli/latest/topic/config-vars.html

```yaml
# レスポンスデータ
# ~/.aws/cli/cacheディレクトリ配下にも保存される。
{
  "Credentials": {
    "AccessKeyId": "<アクセスキーID>", # 必要になる値"
    "SecretAccessKey": "<シークレットアクセスキー>", # 必要になる値
    "SessionToken": "<セッショントークン文字列>", # 必要になる値
    "Expiration": "<セッションの期限>",
  },
  "AssumeRoleUser": {
    "AssumedRoleId": "<セッションID>:<セッション名>",
    "Arn": "arn:aws:sts:<新しいアカウントID>:assumed-role/<IAMロール名>/<セッション名>" # 一時的なIAMユーザー
  },
  "ResponseMetadata": {
    "RequestId": "*****",
    "HTTPStatusCode": 200,
    "HTTPHeaders": {
      "x-amzn-requestid": "*****",
      "content-type": "text/xml",
      "content-length": "1472",
      "date": "Fri, 01 Jul 2022 13:00:00 GMT"
    },
    "RetryAttempts": 0
  }
}
```

<br>


### 4. クレデンシャル情報を取得```【１】```

:    

レスポンスされたデータからクレデンシャル情報を抽出する。

この時、アクセスキーID、シークレットアクセスキー、セッショントークン、が必要になる。

代わりとして、```~/.aws/cli/cache```ディレクトリ配下の```.json```ファイルから取得しても良い。

クレデンシャル情報を環境変数として出力し、使用できるようにする。



> ℹ️ 参考：https://stedolan.github.io/jq/


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

環境変数に登録する代わりとして、AWSの```credentials```ファイルを作成しても良い。



```bash
#!/bin/bash

aws configure --profile "$ENV"-repository << EOF
$(echo "$aws_sts_credentials" | jq -r ".AccessKeyId")
$(echo "$aws_sts_credentials" | jq -r ".SecretAccessKey")
ap-northeast-1
json
EOF

echo aws_session_token = $(echo "$aws_sts_credentials" | jq -r ".SessionToken") >> ~/.aws/credentials
```

<br>

### 5. 接続確認

ロールを引き受けた新しいアカウントを使用して、AWSリソースに通信できるか否かを確認する。

クレデンシャル情報の取得方法として```credentials```ファイルの作成を選択した場合、```profile```オプションが必要である。



```bash
#!/bin/bash

# credentialsファイルを参照するオプションが必要がある。
aws s3 ls --profile <プロファイル名> <.tfstateファイルが管理されるバケット名>
```

<br>
