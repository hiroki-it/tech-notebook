---
title: 【知見を記録するサイト】AWS CLI＠AWS
description: AWS CLI＠AWSの知見をまとめました。
---

# AWS CLI＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ（configure）

### configure

#### ▼ configure

認証情報を設定する。

```bash
$ aws configure
```

#### ▼ --profile

プロファイルを新しく作成する。

参考：https://qiita.com/shonansurvivors/items/1fb53a2d3b8dddab6629#%E3%83%97%E3%83%AD%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E4%BD%9C%E6%88%90

```bash
$ aws configure --profile <プロファイル名>

AWS Access Key ID [None]: <アクセスキーID>
AWS Secret Access Key [None]: <シークレットアクセスキー>
Default region name [None]: <リージョン名>
Default output format [None]: <アウトプット形式>
```

<br>

### list

#### ▼ listとは

現在設定されている認証情報を取得する。

```bash
$ aws configure list
```

<br>

### set

#### ▼ setとは

認証情報の特定の項目を設定する。

```bash
$ aws configure set <認証情報の項目>
```
```bash
$ aws configure set aws_access_key_id "<アクセスキー>"
```
```bash
$ aws configure set aws_secret_access_key "<シークレットキー>"
```
```bash
$ aws configure set aws_default_region "<リージョン名>"
```

<br>

## 01-02. 設定ファイル/環境変数

### ```~/.aws/confidentials```ファイル

#### ▼ aws_access_key_id

AWS CLIを実行するアカウントのアクセスキーIDを設定する。```config```ファイルに設定することもできるが、```confidentials```ファイルへの設定が推奨されている。

参考：https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

```ini
[default]
aws_access_key_id = *****
```

#### ▼ aws_secret_access_key

AWS CLIを実行するアカウントのシークレットアクセスキーIDを設定する。```config```ファイルに設定することもできるが、```confidentials```ファイルへの設定が推奨されている。

参考：https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

```ini
[default]
aws_secret_access_key = *****
```

#### ▼ aws_session_token

認証で補助的に使用するセッショントークン値を設定する。```config```ファイルに設定することもできるが、```confidentials```ファイルへの設定が推奨されている。

参考：https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

```ini
[default]
aws_session_token = *****
```

<br>

### ```~/.aws/config```ファイル

#### ▼ output

AWS CLIの返却値のデータ形式を設定する。

参考：https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

```ini
[default]
output = json
```

#### ▼ region

AWS CLIで操作するAWSリソースのリージョンを設定する。

参考：https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

```ini
[default]
region = ap-northeast-1
```

#### ▼ role_arn

AWS CLIの実行で、IAMユーザーに委譲するIAMロールを設定する。

参考：https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

```ini
[profile foo]
role_arn = arn:aws:iam::*****:role/foo-role
```

#### ▼ role_session_name

IAMロールの委譲後のIAMユーザーの一時的な名前を設定する。

参考：https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

```ini
[profile foo]
role_session_name = hiroki.hasegawa
```

#### ▼ source_profile

IAMロールの委譲先のIAMユーザーのプロファイル名を設定する。

参考：https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

```ini
[profile foo]
source_profile = default
```

<br>

### 環境変数

#### ▼ AWS_DEFAULT_PROFILE

現在のターミナルで使用するプロファイルを設定する。```AWS_PROFILE```変数よりも優先される。

参考：https://qiita.com/shonansurvivors/items/1fb53a2d3b8dddab6629#aws_default_profile%E3%81%A8aws_profile%E3%81%AE%E9%81%95%E3%81%84

```bash
export AWS_DEFAULT_PROFILE=default
```

#### ▼ AWS_PROFILE

現在のターミナルで使用するプロファイルを設定する。

参考：https://qiita.com/shonansurvivors/items/1fb53a2d3b8dddab6629#aws_default_profile%E3%81%A8aws_profile%E3%81%AE%E9%81%95%E3%81%84

```bash
export AWS_PROFILE=foo-profile
```

<br>

## 02. CloudWatch

### set-alarm-state

**＊例＊**

CloudWatchアラームの状態を変更する。

```bash
$ aws cloudwatch set-alarm-state \
    --alarm-name "prd-foo-alarm" \
    --state-value ALARM \
    --state-reason "アラーム!!"
```

<br>

### get-metric-statistics

**＊例＊**

全てのロググループに対して、一日当たりの収集量を```start-time```から```end-time```の間で取得する。```--dimensions ```オプションを使用して、特定のディメンション（ロググループ）に対して集計を実行もできる（ただ、やってみたけどうまくいかず）。

参考：https://docs.aws.amazon.com/cli/latest/reference/cloudwatch/get-metric-statistics.html

 ```bash
$ aws cloudwatch get-metric-statistics \
    --namespace AWS/Logs \
    --metric-name IncomingBytes \
    --start-time "2021-08-01T00:00:00" \
    --end-time "2021-08-31T23:59:59" \
    --period 86400 \
    --statistics Sum | jq -r ".Datapoints[] | [.Timestamp, .Sum] | @csv" | sort
 ```

<br>

## 03. ECR

### get-login-password

一時的に有効なパスワード取得する。

```bash
$ aws ecr get-login-password --region ap-northeast-1

********
```

<br>

## 04. IAM

### update-user

ユーザー名は、コンソール画面から変更できず、コマンドで変更する必要がある。

```bash
$ aws iam update-user \
    --user-name <現行のユーザー名> \
    --new-user-name <新しいユーザー名>
```

<br>

## 05. S3

### ls

**＊例＊**

指定したバケット内のファイル名を取得する。

```bash
$ aws s3 ls s3://<バケット名>
```

**＊例＊**

指定したバケット内のファイル容量を合計する。

```bash
$ aws s3 ls s3://<バケット名> \
  --summarize \
  --recursive \
  --human-readable
```

<br>

### sync

指定したバケット内のファイルを他のバケットにコピーする。

```bash
$ aws s3 sync s3://<コピー元S3バケット名>/<フォルダ> s3://<コピー先S3バケット名>/<フォルダ> \
   --acl bucket-owner-full-control
```

コピーされる側のバケットのバケットポリシーでアクセスを許可すれば、異なるアカウント間でもコピーできる。

```bash
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "<IAMユーザーのARN>"
            },
            "Action": "s3:PutObject",
            "Resource": "arn:aws:s3:::foo-bucket/*",
            "Condition": {
                "StringEquals": {
                    "s3:x-amz-acl": "bucket-owner-full-control"
                }
            }
        },
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "<IAMユーザーのARN>"
            },
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::bar-bucket"
        }
    ]
}
```

<br>

## 06. SQS

### get-queue-url

キューのURLを取得する。

```bash
$ aws sqs get-queue-url --queue-name <キュー名>
```

<br>

### receive-message

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

## 07. その他

### SSO

#### ▼ saml2aws

外部Webサイト（Google Apps、AzureAD、KeyCloak、など）の認証情報を使用して、AWSにログインする。MFAを使用している場合は、ワンタイムコードの入力が要求される。

参考：https://github.com/Versent/saml2aws

```bash
$ saml2aws login

Using IdP Account default to access KeyCloak https://external.example/api
To use saved password just hit enter.
Username: hiroki.hasegawa
Password: *****

Authenticating as hiroki.hasegawa ...
? Security Token [000000] <MFAワンタイムコード>

Selected role: arn:aws:iam::*****:role/foo-role
Requesting AWS credentials using SAML assertion
Saving credentials
Logged in as: arn:aws:sts::*****:assumed-role/foo-role/hiroki.hasegawa

Your new access key pair has been stored in the AWS configuration.
Note that it will expire at 2022-01-01 12:00:00 +0900 JST
```

<br>

### セキュリティ

#### ▼ AWS CLIの社内アクセス制限

特定の送信元IPアドレスを制限するポリシーをIAMユーザーにアタッチすることにより、そのIAMユーザーがAWS CLIの実行する時に、社外から実行できないように制限をかけられる。

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
          "n.n.n.n/32"
        ]
      }
    }
  }
}
```

ポリシーのDenyステートメントによってアクセスが拒否された場合、エラーメッセージの最後に『```with an explicit deny```』という文言がつく。

```
Error: An error occurred (AccessDeniedException) when calling the <アクション名> operation: <IAMユーザー名> is not authorized to perform: <アクション名> on resource: <リソースARN> with an explicit deny
```

<br>
