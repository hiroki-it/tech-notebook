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

指定したプロファイルの認証情報を使用する。

```bash
$ aws configure --profile <プロファイル名>
```

<br>

### list

#### ▼ listとは

現在設定されている認証情報を表示する。

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

## 02. CloudWatch

### set-alarm-state

#### ▼ CloudWatchアラームの状態変更

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

#### ▼ ログ収集量を確認

**＊例＊**

全てのロググループに対して、一日当たりの収集量を```start-time```から```end-time```の間で取得する。```--dimensions ```オプションを使用して、特定のディメンション（ロググループ）に対して集計を実行もできる（ただ、やってみたけどうまくいかず）。

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

## 03. ECR

### get-login-password

#### ▼ 一時パスワードを取得

一時的に有効なパスワードを取得する。

```bash
$ aws ecr get-login-password --region ap-northeast-1

********
```

<br>

## 04. IAM

### update-user

#### ▼ ユーザー名を変更

ユーザー名は、コンソール画面から変更できず、コマンドで変更する必要がある。

```bash
$ aws iam update-user \
    --user-name <現行のユーザー名> \
    --new-user-name <新しいユーザー名>
```

<br>

## 05. S3

### ls

#### ▼ バケット内ファイルを表示

**＊例＊**

指定したバケット内のファイル名を表示する。

```bash
$ aws s3 ls s3://<バケット名>
```

#### ▼ バケット内容量を合計

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

#### ▼ バケットの中身をコピーする

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

#### ▼ キューURLを取得

キューのURLを取得する。

```bash
$ aws sqs get-queue-url --queue-name <キュー名>
```

<br>

### receive-message

#### ▼ キューに受信リクエストを送信

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

外部Webサイト（Google Apps、AzureAD、KeyCloak、など）の認証情報を用いて、AWSにログインする。MFAを用いている場合は、ワンタイムコードの入力が要求される。

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

#### 
