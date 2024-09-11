---
title: 【IT技術の知見】AWS CLI＠AWS
description: AWS CLI＠AWSの知見を記録しています。
---

# AWS CLI＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS CLIのセットアップ

### configure

#### ▼ configure

認証情報を設定する。

OSによって、認証情報ファイルが配置される場所が異なる。

```bash
$ aws configure
```

#### ▼ --profile

プロファイルを新しく作成する。

```bash
$ aws configure --profile <プロファイル名>

AWS Access Key ID [None]: <アクセスキーID>
AWS Secret Access Key [None]: <シークレットアクセスキー>
Default region name [None]: <リージョン名>
Default output format [None]: <アウトプット形式>
```

> - https://qiita.com/shonansurvivors/items/1fb53a2d3b8dddab6629#%E3%83%97%E3%83%AD%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E4%BD%9C%E6%88%90

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

アクセスキーIDを設定する。

```bash
$ aws configure set aws_access_key_id "<アクセスキーID>"
```

シークレットアクセスキーを設定する。

```bash
$ aws configure set aws_secret_access_key "<シークレットアクセスキー>"
```

リージョンを設定する。

『`aws_region`』ではなく『`aws_default_region`』であることに注意する。

```bash
$ aws configure set aws_default_region "<リージョン名>"
```

<br>

## 01-02. 設定ファイル

### `~/.aws/confidentials`ファイル

#### ▼ `~/.aws/confidentials`ファイルとは

認証情報を設定する。

LinuxやUnixの場合は、`$HOME/.aws/<認証情報ファイル名>`に配置される。

また、Windowsの場合は、`%USERPROFILE%\.aws\<認証情報ファイル名>`に配置される。

#### ▼ aws_access_key_id

AWS CLIを実行するアカウントのアクセスキーIDを設定する。

`config`ファイルに設定することもできるが、`confidentials`ファイルへの設定が推奨である。

```ini
[default]
aws_access_key_id = *****
```

> - https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

#### ▼ aws_secret_access_key

AWS CLIを実行するアカウントのシークレットアクセスキーIDを設定する。

`config`ファイルに設定することもできるが、`confidentials`ファイルへの設定が推奨である。

```ini
[default]
aws_secret_access_key = *****
```

> - https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

#### ▼ aws_session_token

認証で補助的に使用するセッショントークン値を設定する。

`config`ファイルに設定することもできるが、`confidentials`ファイルへの設定が推奨である。

```ini
[default]
aws_session_token = *****
```

> - https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

<br>

### `~/.aws/config`ファイル

#### ▼ output

AWS CLIの返却値のデータ形式を設定する。

```ini
[default]
output = json
```

> - https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

#### ▼ region

AWS CLIで操作するAWSリソースのリージョンを設定する。

```ini
[default]
region = ap-northeast-1
```

> - https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

#### ▼ role_arn

AWS CLIの実行で、IAMユーザーに委譲するIAMロールを設定する。

```ini
[profile foo]
role_arn = arn:aws:iam::<AWSアカウントID>:role/foo-role
```

> - https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

#### ▼ role_session_name

IAMロールの委譲後のIAMユーザーの一時的な名前を設定する。

```ini
[profile foo]
role_session_name = hiroki.hasegawa
```

> - https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

#### ▼ source_profile

IAMロールの委譲先のIAMユーザーのプロファイル名を設定する。

```ini
[profile foo]
source_profile = default
```

> - https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-settings

<br>

## 01-03. 環境変数

### AWS_ACCESS_KEY_ID

現在のターミナルで使用するアクセスキーIDを設定する。

```bash
$ export AWS_ACCESS_KEY_ID=<アクセスキーID>
```

<br>

### AWS_DEFAULT_PROFILE

現在のターミナルで使用するプロファイルを設定する。

`AWS_PROFILE`変数よりも優先される。

```bash
$ export AWS_DEFAULT_PROFILE=default
```

> - https://qiita.com/shonansurvivors/items/1fb53a2d3b8dddab6629#aws_default_profile%E3%81%A8aws_profile%E3%81%AE%E9%81%95%E3%81%84

<br>

### AWS_DEFAULT_REGION

現在のターミナルで使用するリージョンを設定する。

『`AWS_REGION`』ではなく『`AWS_DEFAULT_REGION`』であることに注意する。

```bash
$ export AWS_DEFAULT_REGION=ap-northeast-1
```

<br>

### AWS_PROFILE

現在のターミナルで使用するプロファイルを設定する。

```bash
$ export AWS_PROFILE=foo-profile
```

> - https://qiita.com/shonansurvivors/items/1fb53a2d3b8dddab6629#aws_default_profile%E3%81%A8aws_profile%E3%81%AE%E9%81%95%E3%81%84

<br>

### AWS_SECRET_ACCESS_KEY

現在のターミナルで使用するシークレットアクセスキーを設定する。

```bash
$ export AWS_SECRET_ACCESS_KEY=<シークレットアクセスキー>
```

<br>

### AWS_SESSION_TOKEN

現在のターミナルで使用するセッショントークンを設定する。

AWS STSで発行された一時的な認証情報に含まれ、この認証情報を使用する時に、アクセスキーIDとシークレットアクセスキーと合わせて必要になる。

```bash
$ export AWS_SESSION_TOKEN=<セッショントークン>
```

<br>

## 02. 返却データの出力方法の制御

### 形式系

#### ▼ 形式系とは

返却されるデータの形式を設定できる。

> - https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-output-format.html

#### ▼ json

`json`形式で取得する。

```bash
$ aws iam list-users --output json > data.json
```

#### ▼ yaml

`yaml`形式で取得する。

```bash
$ aws iam list-users --output yaml > data.yaml
```

#### ▼ text

タブ切り形式で取得する。

表計算ソフトで扱いやすい。

```bash
$ aws iam list-users --output text > data.tsv
```

<br>

### ページ分割系

#### ▼ ページ分割系とは

返却されるデータのページングを設定できる。

> - https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-pagination.html

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

AWSリソースのAPI側でフィルタリングし、実際に取得するデータを制御できる。

AWSリソースごとに専用のオプションがある。

代わりに、`jq`コマンドの`select`関数を使用しても良い。

> - https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-filter.html#cli-usage-filter-server-side

#### ▼ --filter

SES、Cost Explorerなど

#### ▼ --filters

EC2、AutoScaling、RDSなど

```bash
# 特定のタグ値のデータのみを取得する。『tag:』のつけ忘れに注意する。
$ aws ec2 describe-instances --filters "Name=tag:<タグ名>,Values=<タグ値>"
```

#### ▼ filterの文字を含む独自のオプション

DynamoDBなど

#### ▼ --include

ACMなど

<br>

### コマンド実行側のフィルタリング系

#### ▼ コマンド実行側のフィルタリング系とは

コマンド実行側でフィルタリングし、取得するキーや値を制御できる。

代わりに、`jq`コマンドのパスを使用しても良い。

#### ▼ --query

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

> - https://docs.aws.amazon.com/cli/latest/userguide/cli-usage-filter.html#cli-usage-filter-client-side-output

<br>

## 03. AWSリソース別のプラクティス

### グローバルオプション

#### ▼ --region

リージョンを指定して、コマンドを実行する。

認証情報ファイルや環境変数を変更する手間が省ける。

<br>

### CloudWatch

#### ▼ set-alarm-state

**＊例＊**

CloudWatchアラームの状態を変更する。

```bash
$ aws cloudwatch set-alarm-state \
    --alarm-name "prd-foo-alarm" \
    --state-value ALARM \
    --state-reason "アラート!!"
```

```bash
$ aws cloudwatch set-alarm-state \
    --alarm-name "prd-foo-alarm" \
    --state-value OK \
    --state-reason "大丈夫です!!"
```

#### ▼ get-metric-statistics

**＊例＊**

全てのロググループに対して、一日当たりの収集サイズを`start-time`から`end-time`の間で取得する。

`--dimensions`オプションを使用して、特定のディメンション (ロググループ) に対して集計を実行もできる (ただし、やってみたけどうまくいかず) 。

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

> - https://docs.aws.amazon.com/cli/latest/reference/cloudwatch/get-metric-statistics.html

<br>

### CodeDeploy

#### ▼ register-on-premises-instance

オンプレミスのサーバーをCodeDeployのデプロイ先として設定する。

```bash
$ aws deploy register-on-premises-instance \
    --region ap-northeast-1 \
    --instance-name foo-on-premises-instance \
    --iam_session_arn <IAM Session ARN>
```

<br>

### ECR

#### ▼ get-login-password

一時的に有効なパスワード取得する。

`aws ecr get-login --no-include-email`コマンドを使用することは非推奨である。

```bash
$ aws ecr get-login-password --region ap-northeast-1
```

> - https://qiita.com/hayao_k/items/3e4c822425b7b72e7fd0

<br>

### EKS

#### ▼ update-addon

コンフリクトでEKSアドオンの設定を更新できない場合に、変更できるようにする。

```bash
$ aws eks update-addon --cluster-name foo-cluster \
    --addon-name <アドオン名> \
    --addon-version v1.14.1-eksbuild.1 \
    --resolve-conflicts PRESERVE
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

```bash
$ aws resourcegroupstaggingapi get-resources \
    --tag-filters Key=<タグ名>,Values=<タグ値>
```

> - https://dev.classmethod.jp/articles/resource-groups-tagging-api-launches-resourcearnlist-parameter-getresources-operation/

AWSリソースの種類 (ec2、albなど) を指定して、特定のAWSリソースのみを取得することもできる。

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
  "Statement":
    [
      {
        "Effect": "Allow",
        "Principal": {"AWS": "<IAMユーザーのARN>"},
        "Action": "s3:PutObject",
        "Resource": "arn:aws:s3:::foo-bucket/*",
        "Condition": {
            # 完全一致
            "StringEquals": {"s3:x-amz-acl": "bucket-owner-full-control"},
          },
      },
      {
        "Effect": "Allow",
        "Principal": {"AWS": "<IAMユーザーのARN>"},
        "Action": "s3:ListBucket",
        "Resource": "arn:aws:s3:::bar-bucket",
      },
    ],
}
```

<br>

### SQS

#### ▼ get-queue-url

キューのURLを取得する。

```bash
$ aws sqs get-queue-url --queue-name <キュー名>
```

#### ▼ receive-message

キューに受信リクエストを送信し、メッセージを受信する。

```bash
$ SQS_QUEUE_URL=$(aws sqs get-queue-url --queue-name <キュー名>)

$ aws sqs receive-message --queue-url ${SQS_QUEUE_URL}
```

キューに受信リクエストを送信し、メッセージを受信する。

また、メッセージの内容をファイルに書き出す。

```bash
$ SQS_QUEUE_URL=$(aws sqs get-queue-url --queue-name <キュー名>)

$ aws sqs receive-message --queue-url ${SQS_QUEUE_URL} > receiveOutput.json
```

```yaml
{
  "Messages":
    [
      {
        "Body": "<メッセージの内容>",
        "ReceiptHandle": "AQEBUo4y+XVuRSe4jMv0QM6Ob1viUnPbZ64WI01+Kmj6erhv192m80m+wgyob+zBgL4OMT+bps4KR/q5WK+W3tnno6cCFuwKGRM4OQGM9omMkK1F+ZwBC49hbl7UlzqAqcSrHfxyDo5x+xEyrEyL+sFK2MxNV6d0mF+7WxXTboyAu7JxIiKLG6cUlkhWfk3W4/Kghagy5erwRhwTaKtmF+7hw3Y99b55JLFTrZjW+/Jrq9awLCedce0kBQ3d2+7pnlpEcoY42+7T1dRI2s7um+nj5TIUpx2oSd9BWBHCjd8UQjmyye645asrWMAl1VCvHZrHRIG/v3vgq776e1mmi9pGxN96IW1aDZCQ1CSeqTFASe4=",
        "MD5OfBody": "6699d5711c044a109a6aff9fc193aada",
        "MessageId": "*****",
      },
    ],
}
```

<br>

### Secrets Manager

#### ▼ get-secret-value

特定のSecretに格納されている文字列を取得する。

注意点として、出力した文字列はダブルクオーテーションで囲われている。

```bash
$ aws secretsmanager get-secret-value \
    --secret-id=<シークレット名> \
    --query=SecretString

# ダブルクオーテーションで囲われている
"..."
```

もしSecrets ManagerにJSONファイルを登録している場合、これを取得するとダブルクオーテーションで囲われてしまっている。

そのため、`--output`オプションで`text`使用してダブルクオーテーションを削除する必要がある。

```bash
$ aws secretsmanager get-secret-value \
    --secret-id=<シークレット名> \
    --query=SecretString \
    --output=text

# ダブルクオーテーションを除去
{...}
```

> - https://docs.aws.amazon.com/cli/latest/reference/secretsmanager/get-secret-value.html

<br>

### STS

#### ▼ decode-authorization-message

STSでエンコードされたエラーメッセージをでコードする。

```bash
$ aws sts decode-authorization-message --encoded-message zAc3k...

{
    "DecodedMessage": "{...}"
}
```

> - https://qiita.com/chr_shiro_04/items/0e4dac730881a54500fe

#### ▼ get-caller-identity

一時的な認証情報を取得する。

`~/.aws/cli/cache`ディレクトリ配下に認証情報のキャッシュが作成される。

```bash
$ aws sts get-caller-identity --profile foo
```

<br>

### Systems Manager (新SSM)

#### ▼ create-activation

サーバー (例：オンプレミスサーバー、エッジデバイス、仮想マシンなど) をSystems Managerで管理するために、IDとコードを発行する。

```bash
$ aws ssm create-activation \
    --default-instance-name foo-vm \
    --iam-role foo-vm-role \
    --region ap-northeast-1 \
    --registration-limit 2
```

発行したIDとコードは、`amazon-ssm-agent`コマンドの実行時に必要になる。

```bash
$ amazon-ssm-agent \
    -register \
    -id "<ID>" \
    -code "<コード>" \
    -region "ap-northeast-1"
```

> - https://docs.aws.amazon.com/cli/latest/reference/ssm/create-activation.html
> - https://zenn.dev/daimatsu/articles/ef1ae49bb7816b#ssm-agent-%E3%82%92%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB%E3%81%97%E3%81%A6activation-(ubuntu-arm64)
> - https://dev.classmethod.jp/articles/aws-systems-manager-reactivation/#toc-5

#### ▼ get-parameters-by-path

特定のパスで始まる全ての変数をパラメーターストアから取得する。

```yaml
# パスのないパラメーターの場合
$ aws ssm get-parameters-by-path --path "/"

{
    "Parameters": [
        {
            "Name": "FOO",

            ...
        },
        {
            "Name": "BAR",

            ...
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

            ...
        },
        {
            "Name": "/FOO/BAR",

            ...
        },
   ]
 }
```

> - https://dev.classmethod.jp/articles/aws-cli-all-ssm-parameter-get/

<br>

### Security Group

#### ▼ authorize-security-group-ingress

指定したセキュリティグループで、インバウンドルールをまとめて作成する。

```bash
$ aws ec2 authorize-security-group-ingress \
    --group-id sg-***** \
    --security-group-rule-ids sgr-***** sgr-***** sgr-***** sgr-***** \
    --region ap-northeast-1
```

> - https://michimani.net/post/aws-handle-security-group-via-cli/#%e3%82%a4%e3%83%b3%e3%83%90%e3%82%a6%e3%83%b3%e3%83%89%e3%83%ab%e3%83%bc%e3%83%ab%e3%81%ae%e8%bf%bd%e5%8a%a0%e3%83%bb%e5%89%8a%e9%99%a4

#### ▼ revoke-security-group-ingress

指定したセキュリティグループで、インバウンドルールをまとめて削除する。

```bash
$ aws ec2 revoke-security-group-ingress \
    --group-id sg-***** \
    --security-group-rule-ids sgr-***** sgr-***** sgr-***** sgr-***** \
    --region ap-northeast-1
```

> - https://michimani.net/post/aws-handle-security-group-via-cli/#%e3%82%a4%e3%83%b3%e3%83%90%e3%82%a6%e3%83%b3%e3%83%89%e3%83%ab%e3%83%bc%e3%83%ab%e3%81%ae%e8%bf%bd%e5%8a%a0%e3%83%bb%e5%89%8a%e9%99%a4

<br>

## 04. 認証/認可の手法

### SSO

#### ▼ saml2aws

AWSにSSOでログインする。

認証フェーズを外部 (Auth0、GitHub、Keycloak、AWS Cognito、Google Cloud Authなど) に委譲し、AWSでは認可フェーズのみを実施する。

追加でMFAを採用している場合は、ワンタイムコードの入力が要求される。

> - https://github.com/Versent/saml2aws

**＊実行例＊**

ここでは、IPプロバイダーにKeycloakを使用している。

```bash
$ saml2aws login

Using IdP Account default to access Keycloak https://external.example/api
To use saved password just hit enter.
Username: hiroki.hasegawa
Password: *****

Authenticating as hiroki.hasegawa ...
? Security Token [000000] <MFAワンタイムコード>

Selected role: arn:aws:iam::<AWSアカウントID>:role/foo-role
Requesting AWS credentials using SAML assertion
Saving credentials
Logged in as: arn:aws:sts::<AWSアカウントID>:assumed-role/foo-role/hiroki.hasegawa

Your new access key pair has been stored in the AWS configuration.
Note that it will expire at 2022-01-01 12:00:00 +0900 JST
```

<br>

### リクエスト制限

#### ▼ 送信元IPに基づく制限

特定の送信元IPアドレスを制限するポリシーをIAMユーザーに紐付けることにより、そのIAMユーザーがAWS CLIの実行する時に、社外から実行できないように制限をかけられる。

**＊実装例＊**

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    {
      "Effect": "Deny",
      "Action": "*",
      "Resource": "*",
      "Condition": {"NotIpAddress": {"aws:SourceIp": ["*.*.*.*/32"]}},
    },
}
```

ポリシーのDenyステートメントによってアクセスが拒否された場合、エラーメッセージの最後に『`with an explicit deny`』という文言がつく。

```bash
Error: An error occurred (AccessDeniedException) when calling the <アクション名> operation: <IAMユーザー名> is not authorized to perform: <アクション名> on resource: <リソースARN> with an explicit deny
```

<br>
