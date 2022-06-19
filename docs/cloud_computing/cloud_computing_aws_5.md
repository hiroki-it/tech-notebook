---
title: 【知見を記録するサイト】AWS：Amazon Web Service
description: AWS：Amazon Web Serviceの知見をまとめました。
---

# AWS：Amazon Web Service（S〜U）

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

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

| 設定項目                     | 説明 | 補足 |
| ---------------------------- | ---- | ---- |
| バージョニング               |      |      |
| サーバーアクセスのログ記録   |      |      |
| 静的サイトホスティング       |      |      |
| オブジェクトレベルのログ記録 |      |      |
| デフォルト暗号化             |      |      |
| オブジェクトのロック         |      |      |
| Transfer acceleration        |      |      |
| イベント                     |      |      |
| リクエスタ支払い             |      |      |

特にアクセス制限には、以下の項目がある。

| 設定項目                   | 説明                                                         | 補足                                                         |
| -------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ブロックパブリックアクセス | パブリックネットワークがS3にアクセスする時の許否を設定する。 | ・ブロックパブリックアクセスを無効にすると、項目ごとの方法（ACL、バケットポリシー、アクセスポイントポリシー）によるアクセスが許可される。もし他のAWSリソースからのアクセスを許可する場合は、ブロックパブリックアクセスを無効化した上でバケットポリシーに許可対象を定義するか、あるいはブロックパブリックアクセスでは拒否できないIAMポリシーをAWSリソースに設定する。<br>・ブロックパブリックアクセスを全て有効にすると、パブリックネットワークからの全アクセスを遮断できる。<br>・特定のオブジェクトで、アクセスコントロールリストを制限した場合、そのオブジェクトだけはパブリックアクセスにならない。 |
| バケットポリシー           | IAMユーザー（クロスアカウントも可）またはAWSリソースがS3へにアクセスするためのポリシーで管理する。 | ・ブロックパブリックアクセスを無効にしたうえで、IAMユーザー（クロスアカウントも可）やAWSリソースがS3にアクセスするために必要である。ただし代わりに、IAMポリシーをAWSリソースにアタッチすることによりも、アクセスを許可できる。<br>参考：https://awesome-linus.com/2020/02/04/s3-bucket-public-access/<br>・ポリシーをアタッチできないCloudFrontやALBなどでは、自身へのアクセスログを生成するために必須である。 |
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

パブリックアクセスが無効化されたS3に対して、ALBへのアクセスログを保存したい場合、バケットポリシーを設定する必要がある。バケットポリシーには、ALBからS3へのログ書き込み権限を実装する。『```"AWS": "arn:aws:iam::582318560864:root"```』では、```582318560864```はALBアカウントIDと呼ばれ、リージョンごとに値が決まっている。これは、東京リージョンのアカウントIDである。その他のリージョンのアカウントIDについては、以下のリンクを参考にせよ。

参考：https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html#access-logging-bucket-permissions

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

2020-10-08時点の仕様では、パブリックアクセスが無効化されたS3に対して、CloudFrontへのアクセスログを保存できない。よって、危険ではあるが、パブリックアクセスを有効化する必要がある。

```bash
// ポリシーは不要
```

#### ▼ Lambdaからのアクセスを許可

バケットポリシーは不要である。代わりに、AWS管理ポリシーの『```AWSLambdaExecute```』がアタッチされたロールをLambdaにアタッチする必要がある。このポリシーには、S3へのアクセス権限の他、CloudWatchログにログを生成するための権限が設定されている。

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

```bash
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

認証/認可情報をパラメーターに持つURLのこと。S3では、署名付きURLを発行し、S3へのアクセス権限を外部のユーザーに一時的に付与する。

参考：https://atmarkit.itmedia.co.jp/ait/articles/2107/15/news009.html

<br>

## 02. セキュリティグループ

### セキュリティグループとは

アプリケーションのクラウドパケットフィルタリング型ファイアウォールとして働く。インバウンド通信（プライベートネットワーク向き通信）では、プロトコルや受信元IPアドレスを設定でき、アウトバウンド通信（パブリックネットワーク向き通信）では、プロトコルや送信先プロトコルを設定できる。

<br>

### セットアップ

インバウンドルールとアウトバウンドルールを設定できる。

<br>

### インバウンドルール

#### ▼ パケットフィルタリング型ファイアウォール

パケットのヘッダ情報に記載された送信元IPアドレスやポート番号などによって、パケットを許可するべきかどうかを決定する。速度を重視する場合はこちら。ファイアウォールとWebサーバーの間には、NATルーターやNAPTルーターが設置されている。

![パケットフィルタリング](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/パケットフィルタリング.gif)

#### ▼ セキュリティグループIDの紐付け

ソースに対して、セキュリティグループIDを設定した場合、そのセキュリティグループがアタッチされているENIと、このENIに紐付けられたリソースからのトラフィックを許可できる。リソースのIPアドレスが動的に変化する場合、有効な方法である。

参考：https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html#DefaultSecurityGroup

#### ▼ アプリケーションEC2の例

ALBに割り振られる可能性のあるIPアドレスを許可するために、ALBのセキュリティグループID、またはサブネットのCIDRブロックを設定する。

| タイプ | プロトコル | ポート    | ソース                       | 説明                        |
| ------ | ---------- | --------- | ---------------------------- | --------------------------- |
| HTTP   | TCP        | ```80```  | ALBのセキュリティグループID       | HTTP access from ALB        |
| HTTPS  | TCP        | ```443``` | 踏み台EC2のセキュリティグループID | SSH access from bastion EC2 |

#### ▼ 踏み台EC2の例

| タイプ | プロトコル | ポート   | ソース                     | 説明                              |
| ------ | ---------- | -------- | -------------------------- | --------------------------------- |
| SSH    | TCP        | ```22``` | 社内のグローバルIPアドレス | SSH access from global ip address |

#### ▼ EFSの例

EC2に割り振られる可能性のあるIPアドレスを許可するために、EC2のセキュリティグループID、またはサブネットのCIDRブロックを設定する。

| タイプ | プロトコル | ポート     | ソース                                 | 説明                    |
| ------ | ---------- | ---------- | -------------------------------------- | ----------------------- |
| NFS    | TCP        | ```2049``` | アプリケーションEC2のセキュリティグループID | NFS access from app EC2 |

#### ▼ RDSの例

EC2に割り振られる可能性のあるIPアドレスを許可するために、EC2のセキュリティグループID、またはサブネットのCIDRブロックを設定する。

| タイプ       | プロトコル | ポート     | ソース                                 | 説明                      |
| ------------ | ---------- | ---------- | -------------------------------------- | ------------------------- |
| MYSQL/Aurora | TCP        | ```3306``` | アプリケーションEC2のセキュリティグループID | MYSQL access from app EC2 |

#### ▼ Redisの例

EC2に割り振られる可能性のあるIPアドレスを許可するために、EC2のセキュリティグループID、またはサブネットのCIDRブロックを設定する。

| タイプ      | プロトコル | ポート     | ソース                                 | 説明                    |
| ----------- | ---------- | ---------- | -------------------------------------- | ----------------------- |
| カスタムTCP | TCP        | ```6379``` | アプリケーションEC2のセキュリティグループID | TCP access from app EC2 |

#### ▼ ALBの例

CloudFrontと連携する場合、CloudFrontに割り振られる可能性のあるIPアドレスを許可するために、全てのIPアドレスを許可する。その代わりに、CloudFrontにWAFを紐付け、ALBの前でIPアドレスを制限する。CloudFrontとは連携しない場合、ALBのセキュリティグループでIPアドレスを制限する。

| タイプ | プロトコル | ポート    | ソース          | 説明                         |      |
| ------ | ---------- | --------- | --------------- | ---------------------------- | ---- |
| HTTP   | TCP        | ```80```  | ```0.0.0.0/0``` | HTTP access from CloudFront  |      |
| HTTPS  | TCP        | ```443``` | ```0.0.0.0/0``` | HTTPS access from CloudFront |      |

<br>

### アウトバウンドルール

#### ▼ 任意AWSリソースの例

| タイプ               | プロトコル | ポート | 送信先          | 説明        |
| -------------------- | ---------- | ------ | --------------- | ----------- |
| すべてのトラフィック | すべて     | すべて | ```0.0.0.0/0``` | Full access |

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

#### ▼ 構築リージョンの制約

SESは連携するAWSリソースと同じリージョンに構築しなければならない。

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

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/network/network_model_tcp.html

<br>

## 04. Systems Manager（旧SSM）

### Parameter Store

#### ▼ Parameter Storeとは

機密性の高い値を暗号化した状態で管理し、復号化した上で、環境変数としてEC2インスタンス（ECSやEKSのコンテナのホストを含む）に出力する。Kubernetesのシークレットの概念が取り入れられている。パラメーターのタイプは全て『SecureString』とした方が良い。

#### ▼ KMSを使用した暗号化と復号化

![parameter-store_kms](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/parameter-store_kms.png)

Parameter Storeで管理される環境変数はKMSによって暗号化されており、EC2インスタンス（ECSやEKSのコンテナのホストを含む）で参照する時に復号化される。セキュリティ上の理由で、本来はできないSecretのバージョン管理が、KMSで暗号化することにより、可能になる。

参考：

- https://docs.aws.amazon.com/kms/latest/developerguide/services-parameter-store.html

- https://note.com/hamaa_affix_tech/n/n02eb412d0327

- https://tech.libry.jp/entry/2020/09/17/130042


#### ▼ 命名規則

Systems Managerパラメーター名は、『```/<リソース名>/<環境変数名>```』とするとわかりやすい。

<br>

### Session Manager

#### ▼ Session Managerとは

EC2インスタンス（ECSやEKSのコンテナのホストを含む）に接続できるようにする。SSH接続とは異なり、Internet Gateway経由ではなく、ssmmessagesエンドポイント経由でインスタンスにアクセスできる。接続したいインスタンスにsystems-managerエージェントをインストールする必要がある。

参考：

- https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html#session-manager-features
- https://blog.denet.co.jp/aws-systems-manager-session-manager/

#### ▼ AWSセッション

TLS、Sigv4、KMSを使用して暗号化された接続のこと。

参考：：https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html#what-is-a-session

#### ▼ 同時AWSセッションの上限数

同時AWSセッションの上限数は2つまでである。以下のようなエラーが出た時は、セッション途中のユーザーが他ににいるか、過去のセッションを終了できていない可能性がある。Session Managerで既存のセッションを終了できる。

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
| Automationタイプ | サーバー/コンテナ外でコマンドを実行する。内部的には、Python製のLambdaが使用されている（たぶん）。<br>参考：https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-automation.html | EC2インスタンスを起動し、状態がOKになるまで監視する手順を自動化した例： https://docs.aws.amazon.com/systems-manager/latest/userguide/automation-walk-document-builder.html |
| Commandタイプ    | サーバー/コンテナ内でコマンドを実行する。内部的には、Run Commandが使用されている。<br>参考：https://docs.aws.amazon.com/systems-manager/latest/userguide/sysman-ssm-docs.html#what-are-document-types | ・EC2インスタンス内で実行するlinuxコマンドを自動化した例： https://dev.classmethod.jp/articles/check-os-setting-ssm-doc-al2/ <br>・EC2インスタンス内で実行するawscliコマンドを自動化した例： https://dev.classmethod.jp/articles/autoscalling-terminating-log-upload/ |
| Sessionタイプ    |                                                              |                                                              |

#### ▼ テンプレート

作業内容の鋳型こと。ランブックを指定し、変更箇所に基づいた作業内容を定義する。
デフォルトではテンプレートの作成自体にも承認が必要になる。ただ、指定した権限を持つユーザーはテンプレートの承認をスキップするように設定できる。

参考：https://docs.aws.amazon.com/systems-manager/latest/userguide/change-templates.html

#### ▼ 変更リクエスト

鋳型に基づいた実際の作業のこと。作業のたびにテンプレートを指定し、リクエストを提出する。承認が必要になる。

参考：https://docs.aws.amazon.com/systems-manager/latest/userguide/change-requests.html

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
| アクセスポリシー         | トピックへのアクセス権限を設定する。                         |
| 配信再試行ポリシー       | サブスクリプションのHTTP/HTTPSエンドポイントが失敗した時のリトライ方法を設定する。<br>参考：https://docs.aws.amazon.com/sns/latest/dg/sns-message-delivery-retries.html |
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

AWSリソースに一時的にアクセスできる認証情報（アクセスキー、シークレットアクセスキー、セッショントークン）を発行する。この認証情報は、一時的なアカウント情報として使用できる。

![STS](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/STS.jpg)

<br>

### セットアップ

#### 1. IAMロールに信頼ポリシーをアタッチ

必要なポリシーが設定されたIAMロールを構築する。その時信頼ポリシーでは、ユーザーの```ARN```を信頼されたエンティティとして設定しておく。これにより、そのユーザーに対して、ロールをアタッチできるようになる。

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
          "sts:ExternalId": "<適当な文字列>"
        }
      }
    }
  ]
}
```

#### 2. ロールを引き受けたアカウント情報をリクエスト

信頼されたエンティティ（ユーザー）から、STS（```https://sts.amazonaws.com```）に対して、ロールのアタッチをリクエストする。

```bash
#!/bin/bash

set -xeuo pipefail
set -u

# 事前に環境変数にインフラ環境名を代入する。
case $ENV in
    "dev")
        aws_account_id="<作業環境アカウントID>"
        aws_access_key_id="<作業環境アクセスキーID>"
        aws_secret_access_key="<作業環境シークレットアクセスキー>"
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

# 信頼されたエンティティのアカウント情報を設定する。
aws configure set aws_access_key_id "$aws_account_id"
aws configure set aws_secret_access_key "$aws_secret_access_key"
aws configure set aws_default_region "ap-northeast-1"

# https://sts.amazonaws.com に、ロールのアタッチをリクエストする。
aws_sts_credentials="$(aws sts assume-role \
  --role-arn "arn:aws:iam::${aws_access_key_id}:role/${ENV}-<アタッチしたいIAMロール名>" \
  --role-session-name "<任意のセッション名>" \
  --external-id "$aws_iam_role_external_id" \
  --duration-seconds "<セッションの有効秒数>" \
  --query "Credentials" \
  --output "json")"
```

STSへのリクエストの結果、ロールがアタッチされた新しいIAMユーザー情報を取得できる。この情報には有効秒数が存在し、期限が過ぎると新しいIAMユーザーになる。秒数の最大値は、該当するIAMロールの概要の最大セッション時間から変更できる。

![AssumeRole](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/AssumeRole.png)

レスポンスされるデータは以下の通り。

```yaml
{
  "AssumeRoleUser": {
    "AssumedRoleId": "<セッションID>:<セッション名>",
    "Arn": "arn:aws:sts:<新しいアカウントID>:assumed-role/<IAMロール名>/<セッション名>"
  },
  "Credentials": {
    "SecretAccessKey": "<シークレットアクセスキー>",
    "SessionToken": "<セッショントークン文字列>",
    "Expiration": "<セッションの期限>",
    "AccessKeyId": "<アクセスキーID>"
  }
}
```

#### 3-1. アカウント情報を取得（１）

jqを使用して、レスポンスされたJSONデータからアカウント情報を抽出する。環境変数として出力し、使用できるようにする。あるいは、AWSの```credentials```ファイルを作成しても良い。

参考：https://stedolan.github.io/jq/


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

#### 3-2. アカウント情報を取得（２）

jqを使用して、レスポンスされたJSONデータからアカウント情報を抽出する。ロールを引き受けた新しいアカウントの情報を、```credentials```ファイルに書き込む。

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

#### 4. 接続確認

ロールを引き受けた新しいアカウントを使用して、AWSリソースに接続できるかを確認する。アカウント情報の取得方法として```credentials```ファイルの作成を選択した場合、```profile```オプションが必要である。

```bash
#!/bin/bash

# 3-2を選択した場合、credentialsファイルを参照するオプションが必要がある。
aws s3 ls --profile <プロファイル名>
2020-xx-xx xx:xx:xx <tfstateファイルが管理されるバケット名>
```

<br>

## 08. Step Functions

### Step Functionsとは

AWSサービスを組み合わせて、イベント駆動型アプリケーションを構築できる。

<br>

### AWSリソースのAPIコール

#### ▼ APIコールできるリソース

参考：https://docs.aws.amazon.com/step-functions/latest/dg/connect-supported-services.html

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

参考：https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-api-gateway.html

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
