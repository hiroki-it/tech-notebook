---
title: 【IT技術の知見】Sで始まるAWSリソース＠AWS
description: Sで始まるAWSリソース＠AWSの知見を記録しています。
---

# ```S```で始まるAWSリソース＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>


## 02. セキュリティグループ

### セキュリティグループとは

アプリケーションのクラウドパケットフィルタリング型ファイアウォールとして働く。

インバウンド通信（プライベートネットワーク向き通信）では、プロトコルや受信元IPアドレスを設定でき、アウトバウンド通信（パブリックネットワーク向き通信）では、プロトコルや宛先プロトコルを設定できる。



<br>

### セットアップ

インバウンド通信を許可するルールとアウトバウンドルールを設定できる。

特定のセキュリティグループに紐づけられているAWSリソースを見つけたい場合は、ネットワークインターフェースでセキュリティグループのIDを検索する。

インスタンスIDや説明文から、いずれのAWSリソースが紐づいているか否かを確認する。



<br>

### 送信元IPアドレスの指定

#### ▼ セキュリティグループIDの紐付け

許可する送信元IPアドレスにセキュリティグループIDを設定した場合、そのセキュリティグループが紐付けられているENIと、このENIに紐付けられたリソースからのトラフィックを許可できる。

リソースのIPアドレスが動的に変化する場合、有効な方法である。



> ℹ️ 参考：https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html#DefaultSecurityGroup

#### ▼ 自己参照

許可する送信元IPアドレスに、自分自身のセキュリティグループIDを設定した場合、同じセキュリティグループが紐付けられている同士で通信できるようになる。



> ℹ️ 参考：https://stackoverflow.com/questions/51565372/self-referencing-aws-security-groups

<br>

## 03. Secrets Manager

### Secrets Managerとは

変数やファイルをキーバリュー型で永続化する。

永続化されている間は暗号化されており、復号化した上で、変数やファイルとして対象のAWSリソースに出力する。

Kubernetesのシークレットの概念が取り入れられている。



> ℹ️ 参考：https://medium.com/awesome-cloud/aws-difference-between-secrets-manager-and-parameter-store-systems-manager-f02686604eae

<br>

### セットアップ

| 設定項目  |                                           | 補足                                                                                                              |
|-----------|-------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| シークレットタイプ | 機密な変数やファイルを出力する対象のAWSリソースを設定する。 | 2022/09/09時点では、Basic認証（RDS、DocumentDB、Red、など）、それ以外の認証/認可（APIキー認証、OAuth認可、など）に関する機密な変数を管理できる。 |
| 暗号化キー  | 変数の暗号化方法を設定する。                   |                                                                                                                   |
| 変数やファイル | 変数やファイルをキーバリュー型で設定する。                | 選択したシークレットタイプによって、設定できる変数が異なる。                                                                             |


<br>

## 04. SES：Simple Email Service

### SESとは

クラウドメールサーバーとして働く。

メール受信をトリガーとして、アクションを実行する。



<br>

### セットアップ

#### ▼ コンソール画面

![SESとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SESとは.png)

| 設定項目           | 説明                                                                 | 補足                                                                                                     |
|--------------------|----------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| Domain             | SESのドメイン名を設定する。                                                   | 設定したドメイン名には、『```10 inbound-smtp.us-east-1.amazonaws.com```』というMXレコードタイプの値が紐付く。                     |
| Email Addresses    | 宛先として認証するメールアドレスを設定する。設定するとAWSからメールが届くため、指定されたリンクをクリックする。 | Sandboxモードの時だけ動作する。                                                                                   |
| Sending Statistics | SESで収集されたデータをメトリクスで確認できる。                                        | ```Request Increased Sending Limits```のリンクにて、Sandboxモードの解除を申請できる。                                    |
| SMTP Settings      | SMTP-AUTHの接続情報を確認できる。                                          | アプリケーションの```25```番ポートは送信制限があるため、```465```番ポートを使用する。これに合わせて、SESも受信で```465```番ポートを使用するようにする。 |
| Rule Sets          | メールの受信したトリガーとして実行するアクションを設定できる。                                |                                                                                                          |
| IP Address Filters |                                                                      |                                                                                                          |

#### ▼ Rule Sets

| 設定項目 | 説明                                         |
|----------|--------------------------------------------|
| Recipiet | 受信したメールアドレスで、何の宛先の時にこれを許可するかを設定する。 |
| Actions  | 受信を許可した後に、これをトリガーとして実行するアクションを設定する。 |

<br>

### 仕様上の制約

#### ▼ 作成リージョンの制約

SESは連携するAWSリソースと同じリージョンに作成しなければならない。



#### ▼ Sandboxモードの解除

SESはデフォルトではSandboxモードになっている。

Sandboxモードでは以下の制限がかかっており。

サポートセンターに解除申請が必要である。



| 制限     | 説明                         |
|--------|----------------------------|
| 送信制限 | SESで認証したメールアドレスのみに送信できる。 |
| 受信制限 | 1日に200メールのみ受信できる。         |

<br>

### SMTP-AUTH

#### ▼ AWSにおけるSMTP-AUTHの仕組み

一般的なSMTP-AUTHでは、クライアントユーザーの認証が必要である。同様にして、AWSでもこれが必要であり、IAMユーザーを使用してこれを実現する。送信元となるアプリケーションにIAMユーザーを紐付け、このIAMユーザーにはユーザー名とパスワードを設定する。アプリケーションがSESを介してメールを送信する時、アプリケーションに対して、SESがユーザー名とパスワードを使用した認証を実行する。ユーザー名とパスワードは後から確認できないため、メモしておくこと。SMTP-AUTHの仕組みについては、以下のリンクを参考にせよ。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/network/network_model_tcp.html

<br>

## 06. SNS：Simple Notification Service

### SNSとは

パブリッシャーから発信されたメッセージをエンドポイントで受信し、サブスクライバーに転送するAWSリソース。



![SNSとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SNSとは.png)

<br>

### セットアップ

| 設定項目  | 説明                          |
|-----------|-----------------------------|
| トピック      | 複数のサブスクリプションをグループ化したもの。    |
| サブスクリプション | 宛先に送信するメッセージの種類を設定する。 |

### トピック

| 設定項目         | 説明                                                                                                                                         |
|------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| サブスクリプション        | サブスクリプションを登録する。                                                                                                                            |
| アクセスポリシー         | トピックへの認可スコープを設定する。                                                                                                                       |
| 配信再試行ポリシー   | サブスクリプションのHTTP/HTTPSエンドポイントが失敗した時のリトライ方法を設定する。<br>ℹ️ 参考：https://docs.aws.amazon.com/sns/latest/dg/sns-message-delivery-retries.html |
| 配信ステータスのログ記録 | サブスクリプションへの発信のログをCloudWatchログに転送するように設定する。                                                                                             |
| 暗号化           |                                                                                                                                              |

### サブスクリプション

| メッセージの種類            | 転送先                | 補足                                                                |
|-----------------------|-----------------------|---------------------------------------------------------------------|
| Kinesis Data Firehose | Kinesis Data Firehose |                                                                     |
| SQS                   | SQS                   |                                                                     |
| Lambda                | Lambda                |                                                                     |
| Eメール                  | 任意のメールアドレス          |                                                                     |
| HTTP/HTTPS            | 任意のドメイン名           | Chatbotのドメイン名は『```https://global.sns-api.chatbot.amazonaws.com```』 |
| ```.json```形式のメール   | 任意のメールアドレス          |                                                                     |
| SMS                   | SMS                   | 受信者の電話番号を設定する。                                             |

<br>

## 07. SQS：Simple Queue Service

### SQSとは

![AmazonSQSとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SQS.jpeg)

クラウドメッセージキューとして働く。

パブリッシャーが送信したメッセージは、一旦SQSに追加される。

その後、サブスクライバーは、SQSに対してリクエストを送信し、メッセージを取り出す。

異なるVPC間でも、メッセージキューを同期できる。



<br>

### セットアップ

#### ▼ SQSの種類

| 設定項目   | 説明                                             |
|----------|------------------------------------------------|
| スタンダード方式 | サブスクライバーの取得レスポンスを待たずに、次のキューを非同期的に転送する。 |
| FIFO方式   | サブスクライバーの取得レスポンスを待ち、キューを同期的に転送する。        |

<br>


## 09. Step Functions

### Step Functionsとは

AWSサービスを組み合わせて、イベント駆動型アプリケーションを作成できる。



<br>

### AWSリソースのAPIコール

#### ▼ APIコールできるリソース

> ℹ️ 参考：https://docs.aws.amazon.com/step-functions/latest/dg/connect-supported-services.html

#### ▼ Lambda

**＊実装例＊**

```yaml
{
  "StartAt": "Call Lambda",
  "States": {
    "Call Lambda": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke.waitForTaskToken",
      "Parameters": {
        "FunctionName": "arn:aws:lambda:ap-northeast-1:<アカウントID>:foo-function:1"
      },
      "Retry": [
        {
          "ErrorEquals": [
            "<リトライの対象とするエラー>"
          ],
          "MaxAttempts": 0
        }
      ],
      "End": true,
      "Comment": "The state that call Lambda"
    }
  }
}
```

<br>

### API Gatewayとの連携

#### ▼ 注意が必要な項目


|          | 設定値         | 補足                   |
|----------|----------------|------------------------|
| HTTPメソッド | POST           | GETメソッドでは動作しない。      |
| アクション    | StartExecution |                        |
| 実行ロール  | IAMロールのARN     | StartExecutionを許可する。 |

> ℹ️ 参考：https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-api-gateway.html

```yaml
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "states:StartExecution",
            "Resource": "arn:aws:states:*:<アカウントID>:stateMachine:*"
        }
    ]
}
```

#### ▼ レスポンス構造

以下がレスポンスされれば、API GatewayがStepFunctionsをコールできたことになる。



```yaml
{
    "executionArn": "arn:aws:states:ap-northeast-1:<アカウントID>:execution:prd-foo-doing-state-machine:*****",
    "startDate": 1.638244285498E9
}
```

<br>
