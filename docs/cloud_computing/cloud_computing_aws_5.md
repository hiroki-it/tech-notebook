---
title: 【IT技術の知見】AWS：Amazon Web Service
description: AWS：Amazon Web Serviceの知見を記録しています。
---

# AWS：Amazon Web Service（S〜U）

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. S3：Simple Storage Service

### S3とは

### セットアップ

| 設定項目             | 説明                       |
| -------------------- | -------------------------- |
| バケット             | バケットに関して設定する。 |
| バッチオペレーション |                            |
| アクセスアナライザー |                            |

特にプロパティには、以下の項目がある。

| 設定項目                     | 説明                                                   | 補足                                                                                                                                            |
| ---------------------------- |------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| バージョニング               | ファイルのバージョン管理を行う。ファイルの変更や削除が行われた場合、過去の状態を履歴として残しておける。 | もし古いバージョンにロールバックしたい場合、それより新しいバージョンのファイルを削除するとよい。バージョンが繰り上がり、古いバージョンのファイルが最新版になる。                                                              |
| サーバーアクセスのログ記録   |                                                      |                                                                                                                                               |
| 静的サイトホスティング       |                                                      |                                                                                                                                               |
| オブジェクトレベルのログ記録 |                                                      |                                                                                                                                               |
| デフォルト暗号化             | S3バケットに保存するファイルの暗号化方法を設定する。 | オススメはサーバーサイド暗号化であり、S3バケットにファイルをアップロードするタイミングでこれを暗号化する。また一方で、ダウンロード時にファイルを復号化する。<br>ℹ️ 参考：https://zenn.dev/amarelo_n24/articles/3d252c27cfb98e |
| オブジェクトのロック         |                                                      |                                                                                                                                               |
| Transfer acceleration        |                                                      |                                                                                                                                               |
| イベント                     |                                                      |                                                                                                                                               |
| リクエスタ支払い             |                                                      |                                                                                                                                               |

特にアクセス制限には、以下の項目がある。

| 設定項目                   | 説明                                                         | 補足                                                         |
| -------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ブロックパブリックアクセス | パブリックネットワークがS3にアクセスする時の許否を設定する。 | ・ブロックパブリックアクセスを無効にすると、項目ごとの方法（ACL、バケットポリシー、アクセスポイントポリシー）によるアクセスが許可される。もし他のAWSリソースからのアクセスを許可する場合は、ブロックパブリックアクセスを無効化した上でバケットポリシーに許可対象を定義するか、あるいはブロックパブリックアクセスでは拒否できないIAMポリシーをAWSリソースに設定する。<br>・ブロックパブリックアクセスを全て有効にすると、パブリックネットワークからの全アクセスを遮断できる。<br>・特定のオブジェクトで、アクセスコントロールリストを制限した場合、そのオブジェクトだけはパブリックアクセスにならない。 |
| バケットポリシー           | IAMユーザー（クロスアカウントも可）またはAWSリソースがS3へにアクセスするためのポリシーで管理する。 | ・ブロックパブリックアクセスを無効にしたうえで、IAMユーザー（クロスアカウントも可）やAWSリソースがS3にアクセスするために必要である。ただし代わりに、IAMポリシーをAWSリソースに紐付けることによりも、アクセスを許可できる。<br>ℹ️ 参考：https://awesome-linus.com/2020/02/04/s3-bucket-public-access/<br>・ポリシーを紐付けできないCloudFrontやALBなどでは、自身へのアクセスログを作成するために必須である。 |
| アクセスコントロールリスト | IAMユーザー（クロスアカウントも可）がS3にアクセスする時の許否を設定する。 | ・バケットポリシーと機能が重複する。<br>・仮にバケット自体のブロックパブリックアクセスを無効化したとしても、特定のオブジェクトでアクセスコントロールリストを制限した場合、そのオブジェクトだけはパブリックアクセスにならない。 |
| CORSの設定                 |                                                              |                                                              |

<br>

### レスポンスヘッダー

#### ▼ レスポンスヘッダーの設定



| 設定できるヘッダー              | 説明                                                         | 補足                                           |
| ------------------------------- | ------------------------------------------------------------ | ---------------------------------------------- |
| ETag                            | コンテンツの一意な識別子。ブラウザキャッシュの検証に使用される。 | 全てのコンテンツにデフォルトで設定されている。 |
| Cache-Control                   | Expiresと同様に、ブラウザにおけるキャッシュの有効期限を設定する。 | 全てのコンテンツにデフォルトで設定されている。 |
| Content-Type                    | コンテンツのMIMEタイプを設定する。                           | 全てのコンテンツにデフォルトで設定されている。 |
| Expires                         | Cache-Controlと同様に、ブラウザにおけるキャッシュの有効期限を設定する。ただし、Cache-Controlの方が優先度が高い。 |                                                |
| Content-Disposition             |                                                              |                                                |
| Content-Encoding                |                                                              |                                                |
| x-amz-website-redirect-location | コンテンツのリダイレクト先を設定する。                       |                                                |

<br>

### バケットポリシーの例

#### ▼ S3のARNについて

ポリシーでは、S3のARでは、『```arn:aws:s3:::<バケット名>/*```』のように、最後にバックスラッシュアスタリスクが必要。

#### ▼ ALBのアクセスログの保存を許可

パブリックアクセスが無効化されたS3に対して、ALBへのアクセスログを保存したい場合、バケットポリシーを設定する必要がある。バケットポリシーには、ALBからS3へのログ書き込み認可スコープを実装する。『```"AWS": "arn:aws:iam::582318560864:root"```』では、```582318560864```はALBアカウントIDと呼ばれ、リージョンごとに値が決まっている。これは、東京リージョンのアカウントIDである。その他のリージョンのアカウントIDについては、以下のリンクを参考にせよ。

ℹ️ 参考：https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html#access-logging-bucket-permissions

**＊実装例＊**

```yaml
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::582318560864:root"
      },
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::<バケット名>/*"
    }
  ]
}
```

#### ▼ CloudFrontのファイル読み出しを許可

パブリックアクセスが無効化されたS3に対して、CloudFrontからのルーティングで静的ファイルを読み出したい場合、バケットポリシーを設定する必要がある。

**＊実装例＊**

```yaml
{
  "Version": "2008-10-17",
  "Id": "PolicyForCloudFrontPrivateContent",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity <OAIのID番号>"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<バケット名>/*"
    }
  ]
}
```

#### ▼ CloudFrontのアクセスログの保存を許可

執筆時点（2020/10/08）では、パブリックアクセスが無効化されたS3に対して、CloudFrontへのアクセスログを保存できない。よって、危険ではあるが、パブリックアクセスを有効化する必要がある。

```bash
# ポリシーは不要
```

#### ▼ Lambdaからのアクセスを許可

バケットポリシーは不要である。代わりに、AWS管理ポリシーの『```AWSLambdaExecute```』が紐付けられたロールをLambdaに紐付ける必要がある。このポリシーには、S3への認可スコープの他、CloudWatchログにログを作成するための認可スコープが設定されている。

```yaml
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:*"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::*"
    }
  ]
}
```

#### ▼ 特定のIPアドレスからのアクセスを許可

パブリックネットワーク上の特定のIPアドレスからのアクセスを許可したい場合、そのIPアドレスをポリシーに設定する必要がある。

```yaml
{
  "Version": "2012-10-17",
  "Id": "S3PolicyId1",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<バケット名>/*",
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": "<IPアドレス>/32"
        }
      }
    }
  ]
}
```

<br>

### CORS設定

#### ▼ 指定したドメインからのGET送信を許可

```yaml
[
  {
    "AllowedHeaders": [
      "Content-*"
    ],
    "AllowedMethods": [
      "GET"
    ],
    "AllowedOrigins": [
      "https://example.jp"
    ],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3600
  }
]
```

<br>

### 署名付きURL

#### ▼ 署名付きURLとは

認証/認可情報をパラメーターに持つURLのこと。S3では、署名付きURLを発行し、S3への認可スコープを外部のユーザーに一時的に付与する。

ℹ️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/2107/15/news009.html

<br>

## 02. セキュリティグループ

### セキュリティグループとは

アプリケーションのクラウドパケットフィルタリング型ファイアウォールとして働く。インバウンド通信（プライベートネットワーク向き通信）では、プロトコルや受信元IPアドレスを設定でき、アウトバウンド通信（パブリックネットワーク向き通信）では、プロトコルや送信先プロトコルを設定できる。

<br>

### セットアップ

インバウンド通信を許可するルールとアウトバウンドルールを設定できる。特定のセキュリティグループに紐づけられているAWSリソースを見つけたい場合は、ネットワークインターフェースでセキュリティグループのIDを検索し、インスタンスIDや説明文から、いずれのAWSリソースが紐づいているか否かを確認する。

<br>

### 送信元IPアドレスの指定

#### ▼ セキュリティグループIDの紐付け

許可する送信元IPアドレスにセキュリティグループIDを設定した場合、そのセキュリティグループが紐付けられているENIと、このENIに紐付けられたリソースからのトラフィックを許可できる。リソースのIPアドレスが動的に変化する場合、有効な方法である。

ℹ️ 参考：https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html#DefaultSecurityGroup

#### ▼ 自己参照

許可する送信元IPアドレスに、自分自身のセキュリティグループIDを設定した場合、同じセキュリティグループが紐付けられている同士で通信できるようになる。

ℹ️ 参考：https://stackoverflow.com/questions/51565372/self-referencing-aws-security-groups

<br>

## 03. SES：Simple Email Service

### SESとは

クラウドメールサーバーとして働く。メール受信をトリガーとして、アクションを実行する。

<br>

### セットアップ

![SESとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SESとは.png)

| 設定項目           | 説明                                                         | 補足                                                         |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Domain             | SESのドメイン名を設定する。                                  | 設定したドメイン名には、『```10 inbound-smtp.us-east-1.amazonaws.com```』というMXレコードタイプの値が紐付く。 |
| Email Addresses    | 送信先として認証するメールアドレスを設定する。設定するとAWSからメールが届くので、指定されたリンクをクリックする。 | Sandboxモードの時だけ機能する。                              |
| Sending Statistics | SESで収集されたデータをメトリクスで確認できる。              | ```Request Increased Sending Limits```のリンクにて、Sandboxモードの解除を申請できる。 |
| SMTP Settings      | SMTP-AUTHの接続情報を確認できる。                            | アプリケーションの```25```番ポートは送信制限があるため、```465```番ポートを使用する。これに合わせて、SESも受信で```465```番ポートを使用するようにする。 |
| Rule Sets          | メールの受信したトリガーとして実行するアクションを設定できる。 |                                                              |
| IP Address Filters |                                                              |                                                              |

#### ▼ Rule Sets

| 設定項目 | 説明                                                         |
| -------- | ------------------------------------------------------------ |
| Recipiet | 受信したメールアドレスで、何の宛先の時にこれを許可するかを設定する。 |
| Actions  | 受信を許可した後に、これをトリガーとして実行するアクションを設定する。 |

<br>

### 仕様上の制約

#### ▼ 作成リージョンの制約

SESは連携するAWSリソースと同じリージョンに作成しなければならない。

#### ▼ Sandboxモードの解除

SESはデフォルトではSandboxモードになっている。Sandboxモードでは以下の制限がかかっており。サポートセンターに解除申請が必要である。

| 制限     | 説明                                          |
| -------- | --------------------------------------------- |
| 送信制限 | SESで認証したメールアドレスのみに送信できる。 |
| 受信制限 | 1日に200メールのみ受信できる。                |

<br>

### SMTP-AUTH

#### ▼ AWSにおけるSMTP-AUTHの仕組み

一般的なSMTP-AUTHでは、クライアントユーザーの認証が必要である。同様にして、AWSでもこれが必要であり、IAMユーザーを使用してこれを実現する。送信元となるアプリケーションにIAMユーザーを紐付け、このIAMユーザーにはユーザー名とパスワードを設定する。アプリケーションがSESを介してメールを送信する時、アプリケーションに対して、SESがユーザー名とパスワードを使用した認証を実行する。ユーザー名とパスワードは後から確認できないため、メモしておくこと。SMTP-AUTHの仕組みについては、以下のリンクを参考にせよ。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/network/network_model_tcp.html

<br>

## 04. Systems Manager（旧SSM）

### SMパラメータストア

#### ▼ SMパラメータストアとは

変数をキーバリュー型で永続化する。永続化されている間は暗号化されており、復号化した上で、環境変数としてEC2インスタンス（ECSやEKSのコンテナのホストを含む）に出力する。Kubernetesのシークレットの概念が取り入れられている。パラメーターのタイプは全て『SecureString』とした方が良い。

#### ▼ KMSの暗号化キーを使用した暗号化と復号化

![parameter-store_kms](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/parameter-store_kms.png)

SMパラメータストアに永続化される変数は、KMSの暗号化キーによって暗号化されており、EC2インスタンス（ECSやEKSのコンテナのホストを含む）で参照する時に復号化される。セキュリティ上の理由で、本来はできないSecretのバージョン管理が、KMSで暗号化することにより、可能になる。

ℹ️ 参考：

- https://docs.aws.amazon.com/kms/latest/developerguide/services-parameter-store.html

- https://note.com/hamaa_affix_tech/n/n02eb412d0327

- https://tech.libry.jp/entry/2020/09/17/130042


#### ▼ 命名規則

SMパラメーター名は、『```/<リソース名>/<変数名>```』とするとわかりやすい。

<br>

### Session Manager

#### ▼ Session Managerとは

EC2インスタンス（ECSやEKSのコンテナのホストを含む）に通信できるようにする。SSH接続とは異なり、Internet Gateway経由ではなく、ssmmessagesエンドポイント経由でインスタンスにアクセスできる。接続したいインスタンスにsystems-managerエージェントをインストールする必要がある。

ℹ️ 参考：

- https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html#session-manager-features
- https://blog.denet.co.jp/aws-systems-manager-session-manager/

#### ▼ AWSセッション

TLS、Sigv4、KMSを使用して暗号化された接続のこと。

ℹ️ 参考：：https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html#what-is-a-session

#### ▼ 同時AWSセッションの上限数

同時AWSセッションの上限数は2つまでである。以下のようなエラーが出た時は、セッション途中のユーザーが他ににいるか、過去のセッションを完了できていない可能性がある。Session Managerで既存のセッションを完了できる。

```bash
# ECS Execの場合
An error occurred (ClientException) when calling the ExecuteCommand operation: Unable to start new execute sessions because the maximum session limit of 2 has been reached.
```

<br>

### Change Manager

#### ▼ Change Managerとは

AWSリソースの設定変更に承認フローを設ける。

1. ランブックを作成する。AWSがあらかじめ用意してくれているものを使用もできる。
2. テンプレートを作成し、リクエストを作成する。
3. 承認フローを通過する。これは、スキップするように設定もできる。
4. テンプレートを使用して、変更リクエストを作成する。
5. 承認フローを通過する。これは、スキップできない。
6. 変更リクエストに基づいて、AWSリソースを変更する処理が自動的に実行される。これは、即時実行するこもスケジューリングもできる。

#### ▼ ランブック（ドキュメント）

AWSリソースを変更するためには『ランブック（ドキュメント）』を事前に作成する必要がある。ランブックでは、AWSリソースの変更箇所を定義する。ランブックには、AWSがあらかじめ用意してくれるものとユーザー定義のものがある。

| タイプ           | 説明                                                         | 補足                                                         |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Automationタイプ | サーバー/コンテナ外でコマンドを実行する。内部的には、Python製のLambdaが使用されている（たぶん）。<br>ℹ️ 参考：https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-automation.html | EC2インスタンスを起動し、状態がOKになるまで監視する手順を自動化した例： https://docs.aws.amazon.com/systems-manager/latest/userguide/automation-walk-document-builder.html |
| Commandタイプ    | サーバー/コンテナ内でコマンドを実行する。内部的には、Run Commandが使用されている。<br>ℹ️ 参考：https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-ssm-docs.html#what-are-document-types | ・EC2インスタンス内で実行するlinuxコマンドを自動化した例： https://dev.classmethod.jp/articles/check-os-setting-ssm-doc-al2/ <br>・EC2インスタンス内で実行するawscliコマンドを自動化した例： https://dev.classmethod.jp/articles/autoscalling-terminating-log-upload/ |
| Sessionタイプ    |                                                              |                                                              |

#### ▼ テンプレート

作業内容の鋳型こと。ランブックを指定し、変更箇所に基づいた作業内容を定義する。
デフォルトではテンプレートの作成自体にも承認が必要になる。ただし、指定した認可スコープを持つユーザーはテンプレートの承認をスキップするように設定できる。

ℹ️ 参考：https://docs.aws.amazon.com/systems-manager/latest/userguide/change-templates.html

#### ▼ 変更リクエスト

鋳型に基づいた実際の作業のこと。作業のたびにテンプレートを指定し、リクエストを提出する。承認が必要になる。

ℹ️ 参考：https://docs.aws.amazon.com/systems-manager/latest/userguide/change-requests.html

<br>

## 05. SNS：Simple Notification Service

### SNSとは

パブリッシャーから発信されたメッセージをエンドポイントで受信し、サブスクライバーに転送するAWSリソース。

![SNSとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SNSとは.png)

<br>

### セットアップ

| 設定項目           | 説明                                                 |
| ------------------ | ---------------------------------------------------- |
| トピック           | 複数のサブスクリプションをグループ化したもの。       |
| サブスクリプション | エンドポイントで受信するメッセージの種類を設定する。 |

### トピック

| 設定項目                 | 説明                                                         |
| ------------------------ | ------------------------------------------------------------ |
| サブスクリプション       | サブスクリプションを登録する。                               |
| アクセスポリシー         | トピックへの認可スコープを設定する。                         |
| 配信再試行ポリシー       | サブスクリプションのHTTP/HTTPSエンドポイントが失敗した時のリトライ方法を設定する。<br>ℹ️ 参考：https://docs.aws.amazon.com/sns/latest/dg/sns-message-delivery-retries.html |
| 配信ステータスのログ記録 | サブスクリプションへの発信のログをCloudWatchログに転送するように設定する。 |
| 暗号化                   |                                                              |

### サブスクリプション

| メッセージの種類      | 転送先                | 補足                                                         |
| --------------------- | --------------------- | ------------------------------------------------------------ |
| Kinesis Data Firehose | Kinesis Data Firehose |                                                              |
| SQS                   | SQS                   |                                                              |
| Lambda                | Lambda                |                                                              |
| Eメール               | 任意のメールアドレス  |                                                              |
| HTTP/HTTPS            | 任意のドメイン名      | Chatbotのドメイン名は『```https://global.sns-api.chatbot.amazonaws.com```』 |
| JSON形式のメール      | 任意のメールアドレス  |                                                              |
| SMS                   | SMS                   | 受信者の電話番号を設定する。                                 |

<br>

## 06. SQS：Simple Queue Service

### SQSとは

![AmazonSQSとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SQS.jpeg)

クラウドメッセージキューとして働く。パブリッシャーが送信したメッセージは、一旦SQSに追加される。その後、サブスクライバーは、SQSに対してリクエストを送信し、メッセージを取り出す。異なるVPC間でも、メッセージキューを同期できる。

<br>

### セットアップ

#### ▼ SQSの種類

| 設定項目         | 説明                                                         |
| ---------------- | ------------------------------------------------------------ |
| スタンダード方式 | サブスクライバーの取得レスポンスを待たずに、次のキューを非同期的に転送する。 |
| FIFO方式         | サブスクライバーの取得レスポンスを待ち、キューを同期的に転送する。 |

<br>

## 07. STS：Security Token Service

### STSとは

認証済みのIAMユーザーに対して、特定のAWSアカウントのAWSリソースに認可スコープを持つ一時的なクレデンシャル情報（アクセスキーID、シークレットアクセスキー、セッショントークン）を発行する。

![STS](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/STS.jpg)

STSへのリクエストの結果、別の認証情報と認可スコープを持つ新しいIAMユーザーを取得できる。このIAMユーザーには、そのAWSアカウント内でのみ使用できるロールが紐付けられている。この情報には有効秒数が存在し、期限が過ぎると新しいIAMユーザーになる。秒数の最大値は、該当するIAMロールの概要の最大セッション時間から変更できる。

ℹ️ 参考：https://www.slideshare.net/tetsunorinishizawa/aws-cliassume-role

![AssumeRole](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/AssumeRole.png)

IAMユーザーを一括で管理しておき、特定のAWSアカウントでは特定の認可スコープを委譲するようにする。

ℹ️ 参考：https://garafu.blogspot.com/2020/11/how-to-switch-role.html

![sts_multi-account](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/sts_multi-account.png)

<br>

### IAMロールの委譲先ユーザー

#### ▼ IAMロールの委譲先ユーザーの種類

IAMユーザー、AWSリソース、フェデレーテッドユーザー、がある。

ℹ️ 参考：https://dev.classmethod.jp/articles/re-introduction-2022-aws-iam/

![aws_sts_assumed-user](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/aws_sts_assumed-user.png)

#### ▼ IAMユーザー

IAMロールと同じ/異なるAWSアカウントのIAMユーザーに委譲できる。IAMユーザーの場合、外部IDが必要になる。

ℹ️ 参考：https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_common-scenarios_third-party.html

#### ▼ AWSリソース

IAMロールと同じ/異なるAWSアカウントのAWSリソースに委譲できる。IAMリソースの場合、外部IDが必要になる。

ℹ️ 参考：https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_common-scenarios_services.html

#### ▼ フェデレーテッドユーザー

OIDC、SAML、によって発行されたユーザーに委譲できる。OIDCのフェデレーテッドユーザーの場合、発行されたJWTが必要になる。

ℹ️ 参考：

- https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_common-scenarios_federated-users.html
- https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_saml.html

<br>

### フェデレーテッドユーザー

#### ▼ AWS OIDC

IAMロールの信頼されたエンティティに、AWS OIDCで発行されたユーザーを設定する。

ℹ️ 参考：https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html

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
              "cognito-identity.amazonaws.com:aud": "ap-northeast-1:12345678-abcd-abcd-abcd-123456"
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


ℹ️ 参考：https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html

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
              "accounts.google.com:aud": "66677788899900pro0"
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

ℹ️ 参考：https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_saml.html

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

### セットアップ

#### 1. IAMロールに信頼ポリシーを紐付け

必要なポリシーが設定されたIAMロールを作成する。その時信頼ポリシーでは、IAMユーザーの```ARN```を信頼されたエンティティとして設定しておく。これにより、そのIAMユーザーに対して、ロールを紐付けできるようになる。この時に使用するユーザーは、IAMユーザーではなく、AWSリソースやフェデレーテッドユーザーでもよい。

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

#### 2. ロールを引き受けたクレデンシャル情報をリクエスト

信頼されたエンティティから、STSのエンドポイント（```https://sts.amazonaws.com```）に対して、ロールの紐付けをリクエストする。OIDCによるフェデレーションユーザーの場合は、```--external-id```オプションの代わりに、```--web-identity-token```オプションを使用する。このオプションに、発行されたJWTを設定する必要がある。

```bash
#!/bin/bash

set -xeuo pipefail
set -u

# 事前に環境変数にインフラ環境名を代入する。
case $ENV in
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
        echo "The parameter ${ENV} is invalid."
        exit 1
    ;;
esac

# 信頼されたエンティティのクレデンシャル情報を設定する。
aws configure set aws_access_key_id "$aws_account_id"
aws configure set aws_secret_access_key "$aws_secret_access_key"
aws configure set aws_default_region "ap-northeast-1"

# https://sts.amazonaws.com に、ロールの紐付けをリクエストする。
aws_sts_credentials="$(aws sts assume-role \
  --role-arn "arn:aws:iam::${aws_access_key_id}:role/${ENV}-<紐付けしたいIAMロール名>" \
  --role-session-name "<任意のセッション名>" \
  --external-id "$aws_iam_role_external_id" \
  --duration-seconds "<セッションの有効秒数>" \
  --query "Credentials" \
  --output "json")"
```

#### 3. 返信されたレスポンスからクレデンシャル情報を取得

STSのエンドポイントから一時的なクレデンシャル情報が発行される。また同時に、このクレデンシャル情報は、```~/.aws/cli/cache```ディレクトリ配下にも```.json```ファイルで保管される。

ℹ️ 参考：https://docs.aws.amazon.com/cli/latest/topic/config-vars.html

```yaml
# レスポンスデータ
# ~/.aws/cli/cacheディレクトリ配下にも保存される。
{
  "Credentials": {
    "AccessKeyId": "<アクセスキーID>" # 必要になる値
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

#### 4. クレデンシャル情報を取得（１）

レスポンスされたデータからクレデンシャル情報を抽出する。この時、アクセスキーID、シークレットアクセスキー、セッショントークン、が必要になる。代わりに、```~/.aws/cli/cache```ディレクトリ配下の```.json```ファイルから取得しても良い。クレデンシャル情報を環境変数として出力し、使用できるようにする。

ℹ️ 参考：https://stedolan.github.io/jq/


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

環境変数に登録する代わりに、AWSの```credentials```ファイルを作成しても良い。

```bash
#!/bin/bash

aws configure --profile ${ENV}-repository << EOF
$(echo "$aws_sts_credentials" | jq -r ".AccessKeyId")
$(echo "$aws_sts_credentials" | jq -r ".SecretAccessKey")
ap-northeast-1
json
EOF

echo aws_session_token = $(echo "$aws_sts_credentials" | jq -r ".SessionToken") >> ~/.aws/credentials
```

#### 5. 接続確認

ロールを引き受けた新しいアカウントを使用して、AWSリソースに通信できるか否かを確認する。クレデンシャル情報の取得方法として```credentials```ファイルの作成を選択した場合、```profile```オプションが必要である。

```bash
#!/bin/bash

# credentialsファイルを参照するオプションが必要がある。
aws s3 ls --profile <プロファイル名> <.tfstateファイルが管理されるバケット名>
```

<br>

## 08. Step Functions

### Step Functionsとは

AWSサービスを組み合わせて、イベント駆動型アプリケーションを作成できる。

<br>

### AWSリソースのAPIコール

#### ▼ APIコールできるリソース

ℹ️ 参考：https://docs.aws.amazon.com/step-functions/latest/dg/connect-supported-services.html

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

ℹ️ 参考：https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-api-gateway.html

|              | 設定値         | 補足                        |
| ------------ | -------------- | --------------------------- |
| HTTPメソッド | POST           | GETメソッドでは機能しない。 |
| アクション   | StartExecution |                             |
| 実行ロール   | IAMロールのARN | StartExecutionを許可する。  |

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
