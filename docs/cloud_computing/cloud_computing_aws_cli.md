---
title: 【IT技術の知見】AWS CLI＠AWS
description: AWS CLI＠AWSの知見を記録しています。
---

# AWS CLI＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ（configure）

### configure

#### ▼ configure

クレデンシャル情報を設定する。OSによって、```credentials```ファイルが配置される場所が異なる。

```bash
$ aws configure
```

#### ▼ --profile

プロファイルを新しく作成する。

> ℹ️ 参考：https://qiita.com/shonansurvivors/items/1fb53a2d3b8dddab6629#%E3%83%97%E3%83%AD%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E4%BD%9C%E6%88%90

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

現在設定されているクレデンシャル情報を取得する。

```bash
$ aws configure list
```

<br>

### set

#### ▼ setとは

クレデンシャル情報の特定の項目を設定する。

```bash
$ aws configure set <クレデンシャル情報の項目>
```

アクセスキーIDを設定する。

```bash
$ aws configure set aws_access_key_id "<アクセスキーID>"
```

シークレットアクセスキーを設定する。

```bash
$ aws configure set aws_secret_access_key "<シークレットアクセスキー>"
```

リージョンを設定する。『```aws_region```』ではなく『```aws_default_region```』であることに注意する。

```bash
$ aws configure set aws_default_region "<リージョン名>"
```

<br>

## 01-02. 設定ファイル、環境変数

### ```~/.aws/confidentials```ファイル

#### ▼ ```~/.aws/confidentials```ファイルとは

クレデンシャル情報を設定する。LinuxやUNIXの場合は、```$HOME/.aws/<credentialsファイル名>```に配置される。また、Windowsの場合は、```%USERPROFILE%\.aws\<credentialsファイル名>```に配置される。

#### ▼ aws_access_key_id

AWS CLIを実行するアカウントのアクセスキーIDを設定する。```config```ファイルに設定することもできるが、```confidentials```ファイルへの設定が推奨されている。

> ℹ️ 参考：https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

```ini
[default]
aws_access_key_id = *****
```

#### ▼ aws_secret_access_key

AWS CLIを実行するアカウントのシークレットアクセスキーIDを設定する。```config```ファイルに設定することもできるが、```confidentials```ファイルへの設定が推奨されている。

> ℹ️ 参考：https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

```ini
[default]
aws_secret_access_key = *****
```

#### ▼ aws_session_token

認証で補助的に使用するセッショントークン値を設定する。```config```ファイルに設定することもできるが、```confidentials```ファイルへの設定が推奨されている。

> ℹ️ 参考：https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

```ini
[default]
aws_session_token = *****
```

<br>

### ```~/.aws/config```ファイル

#### ▼ output

AWS CLIの返却値のデータ形式を設定する。

> ℹ️ 参考：https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

```ini
[default]
output = json
```

#### ▼ region

AWS CLIで操作するAWSリソースのリージョンを設定する。

> ℹ️ 参考：https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

```ini
[default]
region = ap-northeast-1
```

#### ▼ role_arn

AWS CLIの実行で、IAMユーザーに委譲するIAMロールを設定する。

> ℹ️ 参考：https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

```ini
[profile foo]
role_arn = arn:aws:iam::<アカウントID>:role/foo-role
```

#### ▼ role_session_name

IAMロールの委譲後のIAMユーザーの一時的な名前を設定する。

> ℹ️ 参考：https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

```ini
[profile foo]
role_session_name = hiroki.hasegawa
```

#### ▼ source_profile

IAMロールの委譲先のIAMユーザーのプロファイル名を設定する。

> ℹ️ 参考：https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

```ini
[profile foo]
source_profile = default
```

<br>

### 環境変数

#### ▼ AWS_ACCESS_KEY_ID

現在のターミナルで使用するアクセスキーIDを設定する。

```bash
$ export AWS_ACCESS_KEY_ID=<アクセスキーID>
```

#### ▼ AWS_DEFAULT_PROFILE

現在のターミナルで使用するプロファイルを設定する。```AWS_PROFILE```変数よりも優先される。

> ℹ️ 参考：https://qiita.com/shonansurvivors/items/1fb53a2d3b8dddab6629#aws_default_profile%E3%81%A8aws_profile%E3%81%AE%E9%81%95%E3%81%84

```bash
$ export AWS_DEFAULT_PROFILE=default
```

#### ▼ AWS_DEFAULT_REGION

現在のターミナルで使用するリージョンを設定する。『```AWS_REGION```』ではなく『```AWS_DEFAULT_REGION```』であることに注意する。

```bash
$ export AWS_DEFAULT_REGION=ap-northeast-1
```

#### ▼ AWS_PROFILE

現在のターミナルで使用するプロファイルを設定する。

> ℹ️ 参考：https://qiita.com/shonansurvivors/items/1fb53a2d3b8dddab6629#aws_default_profile%E3%81%A8aws_profile%E3%81%AE%E9%81%95%E3%81%84

```bash
$ export AWS_PROFILE=foo-profile
```


#### ▼ AWS_SECRET_ACCESS_KEY

現在のターミナルで使用するシークレットアクセスキーを設定する。

```bash
$ export AWS_SECRET_ACCESS_KEY=<シークレットアクセスキー>
```

#### ▼ AWS_SESSION_TOKEN

現在のターミナルで使用するセッショントークンを設定する。AWS STSで発行された一時的なクレデンシャル情報に含まれ、このクレデンシャル情報を使用する時に、アクセスキーIDとシークレットアクセスキーと合わせて必要になる。

```bash
$ export AWS_SESSION_TOKEN=<セッショントークン>
```

<br>

## 02. 返却データの出力方法の制御

### 形式系

#### ▼ 形式系とは

返却されるデータの形式を設定できる。

> ℹ️ 参考：https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-output-format.html

#### ▼ json

```.json```形式で取得する。

```bash
$ aws iam list-users --output json > data.json
```

#### ▼ yaml

```.yaml```形式で取得する。

```bash
$ aws iam list-users --output yaml > data.yaml
```

#### ▼ text

タブ切り形式で取得する。表計算ソフトで扱いやすい。

```bash
$ aws iam list-users --output text > data.tsv
```

<br>

### ページ分割系

#### ▼ ページ分割系とは

返却されるデータのページングを設定できる。

> ℹ️ 参考：https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-pagination.html

#### ▼ --max-items

取得する項目の最大数を設定する。

```bash
$ aws iam list-users --max-items 100
```

#### ▼ --no-paginate

ページングを無効化する。

```bash
$ aws iam list-users --no-paginate
```

#### ▼ --page-size

ページ当たりで取得する項目数を設定する。

```bash
$ aws iam list-users --page-size 10
```

<br>

### API側のフィルタリング系

#### ▼ API側のフィルタリング系とは

AWSリソースのAPI側でフィルタリングし、実際に取得するデータを制御できる。AWSリソースごとに専用のオプションがある。代わりに、```jq```コマンドの```select```関数を使用しても良い。

> ℹ️ 参考：https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-filter.html#cli-usage-filter-server-side

#### ▼ --filter

SES、Cost Explorer、など

#### ▼ --filters

EC2、オートスケーリング、RDS、など

```bash
# 特定のタグ値のデータのみを取得する。『tag:』のつけ忘れに注意する。
$ aws ec2 describe-instances --filters "Name=tag:<タグ名>,Values=<タグ値>"
```

#### ▼ filterの文字を含む独自のオプション

DynamoDB、など

#### ▼ --include

ACM、など

<br>

### コマンド実行側のフィルタリング系

#### ▼ コマンド実行側のフィルタリング系とは

コマンド実行側でフィルタリングし、取得するキーや値を制御できる。代わりに、```jq```コマンドのパスを使用しても良い。

#### ▼ --query

> ℹ️ 参考：https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-filter.html#cli-usage-filter-client-side-output

```bash
# 全てのキーと値を取得する。
$ aws ec2 describe-instances --query "Reservations[*]"
```

```bash
# 最初のインデックスキーのみを取得する。
$ aws ec2 describe-instances --query "Reservations[0]"
```

```bash
# 特定のタグ値のデータのみを取得し、そのデータのインスタンスIDのみを取得する。
$ aws ec2 describe-instances \
    --filters "Name=tag:<タグ名>,Values=<タグ値>" \
    --query "Reservations[*].Instances[*].InstanceId"
    
# 特定のタグ値のデータのみを取得し、そのデータのセキュリティグループのIDのみを取得する。
$ aws ec2 describe-instances \
    --filters "Name=tag:<タグ名>,Values=<タグ値>" \
    --query "SecurityGroups[*].GroupId"
```

<br>

## 03. AWSリソース別のプラクティス

### CloudWatch

#### ▼ set-alarm-state

**＊例＊**

CloudWatchアラームの状態を変更する。

```bash
$ aws cloudwatch set-alarm-state \
    --alarm-name "prd-foo-alarm" \
    --state-value ALARM \
    --state-reason "アラーム!!"
```

#### ▼ get-metric-statistics

**＊例＊**

全てのロググループに対して、一日当たりの収集サイズを```start-time```から```end-time```の間で取得する。```--dimensions ```オプションを使用して、特定のディメンション（ロググループ）に対して集計を実行もできる（ただし、やってみたけどうまくいかず）。

> ℹ️ 参考：https://docs.aws.amazon.com/cli/latest/reference/cloudwatch/get-metric-statistics.html

```bash
$ aws cloudwatch get-metric-statistics \
    --namespace AWS/Logs \
    --metric-name IncomingBy*** \
    --start-time "2021-08-01T00:00:00" \
    --end-time "2021-08-31T23:59:59" \
    --period 86400 \
    --statistics Sum \
      | jq -r ".Datapoints[] | [.Timestamp, .Sum] | @csv" | sort
```

<br>

### ECR

#### ▼ get-login-password

一時的に有効なパスワード取得する。

```bash
$ aws ecr get-login-password --region ap-northeast-1
```

<br>

### IAM

#### ▼ update-user

ユーザー名は、コンソール画面から変更できず、コマンドで変更する必要がある。

```bash
$ aws iam update-user \
    --user-name <現行のユーザー名> \
    --new-user-name <新しいユーザー名>
```

<br>

### Resource Groups

#### ▼ get-resources

AWSリソースがリソースグループで管理されている場合、特定のタグを持つAWSリソースを取得する。

> ℹ️ 参考：https://dev.classmethod.jp/articles/resource-groups-tagging-api-launches-resourcearnlist-parameter-getresources-operation/

```bash
$ aws resourcegroupstaggingapi get-resources \
    --tag-filters Key=<タグ名>,Values=<タグ値>
```

AWSリソースの種類（ec2、alb、など）を指定して、特定のAWSリソースのみを取得することもできる。

```bash
$ aws resourcegroupstaggingapi get-resources \
    --resource-type-filters <AWSリソースの種類> \
    --tag-filters Key=<タグ名>,Values=<タグ値>
```

<br>

### S3

#### ▼ ls

**＊例＊**

指定したバケット内のファイル名を取得する。

```bash
$ aws s3 ls s3://<バケット名>
```

**＊例＊**

指定したバケット内のファイルサイズを合計する。

```bash
$ aws s3 ls s3://<バケット名> \
    --summarize \
    --recursive \
    --human-readable
```

<br>

#### ▼ sync

指定したバケット内のファイルを他のバケットにコピーする。

```bash
$ aws s3 sync s3://<コピー元S3バケット名>/<ディレクトリ名> s3://<コピー先S3バケット名>/<ディレクトリ名> \
   --acl bucket-owner-full-control
```

コピーされる側のバケットのバケットポリシーでアクセスを許可すれば、異なるアカウント間でもコピーできる。

```yaml
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

### SQS

#### ▼ get-queue-url

キューのURLを取得する。

```bash
$ aws sqs get-queue-url --queue-name <キュー名>
```

<br>

#### ▼ receive-message

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

```yaml
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

### Secret Manager

#### ▼ get-secret-value

特定のSecretに格納されている文字列を取得する。

参考：https://docs.aws.amazon.com/cli/latest/reference/secretsmanager/get-secret-value.html

```bash
$ aws secretsmanager get-secret-value \
    --secret-id=<シークレット名> \
    --query=SecretString \
    --output=text
```

<br>

### Systems Manager（旧SSM）

#### ▼ get-parameters-by-path

特定のパスで始まる全ての変数をSMパラメーターストアから取得する。

> ℹ️ 参考：https://dev.classmethod.jp/articles/aws-cli-all-ssm-parameter-get/

```yaml
# パスのないパラメーターの場合
$ aws ssm get-parameters-by-path --path "/"

{
    "Parameters": [
        {
            "Name": "FOO",
            
            # 〜 中略 〜
        },
        {
            "Name": "BAR",
            
            # 〜 中略 〜
        },
   ]
 }
```

```yaml
# 『/FOO』で始まるパラメーターの場合
$ aws ssm get-parameters-by-path --path "/FOO"

{
    "Parameters": [
        {
            "Name": "/FOO",
            
            # 〜 中略 〜
        },
        {
            "Name": "/FOO/BAR",
            
            # 〜 中略 〜
        },
   ]
 }
```

<br>

## 04. 認証/認可の手法

### SSO

#### ▼ saml2aws

AWSにSSOでログインする。認証フェーズを外部（Google Apps、AzureAD、KeyCloak、など）に委譲し、AWSでは認可フェーズのみを実施する。追加でMFAを使用している場合は、ワンタイムコードの入力が要求される。

> ℹ️ 参考：https://github.com/Versent/saml2aws

```bash
$ saml2aws login

Using IdP Account default to access KeyCloak https://external.example/api
To use saved password just hit enter.
Username: hiroki.hasegawa
Password: *****

Authenticating as hiroki.hasegawa ...
? Security Token [000000] <MFAワンタイムコード>

Selected role: arn:aws:iam::<アカウントID>:role/foo-role
Requesting AWS credentials using SAML assertion
Saving credentials
Logged in as: arn:aws:sts::<アカウントID>:assumed-role/foo-role/hiroki.hasegawa

Your new access key pair has been stored in the AWS configuration.
Note that it will expire at 2022-01-01 12:00:00 +0900 JST
```

<br>

### アクセス制限

#### ▼ 送信元IPに基づく制限

特定の送信元IPアドレスを制限するポリシーをIAMユーザーに紐付けることにより、そのIAMユーザーがAWS CLIの実行する時に、社外から実行できないように制限をかけられる。

**＊実装例＊**

```yaml
{
  "Version": "2012-10-17",
  "Statement": {
    "Effect": "Deny",
    "Action": "*",
    "Resource": "*",
    "Condition": {
      "NotIpAddress": {
        "aws:SourceIp": [
          "*.*.*.*/32"
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
