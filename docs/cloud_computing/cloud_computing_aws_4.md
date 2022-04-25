---
title: 【知見を記録するサイト】AWS：Amazon Web Service
description: AWS：Amazon Web Serviceの知見をまとめました．
---

# AWS：Amazon Web Service（S〜Z）

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. S3：Simple Storage Service

### S3とは

クラウド外付けストレージとして働く．S3に保存するCSSファイルや画像ファイルを管理できる．

<br>

### セットアップ

#### ▼ 概要

| 設定項目             | 説明                       |
| -------------------- | -------------------------- |
| バケット             | バケットに関して設定する． |
| バッチオペレーション |                            |
| アクセスアナライザー |                            |

#### ▼ プロパティ

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

#### ▼ 外部/内部ネットワークからのアクセス制限

| 設定項目                   | 説明                                                         | 補足                                                         |
| -------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ブロックパブリックアクセス | パブリックネットワークがS3にアクセスする時の許否を設定する． | ・ブロックパブリックアクセスを無効にすると，項目ごとの方法（ACL，バケットポリシー，アクセスポイントポリシー）によるアクセスが許可される．もし他のAWSリソースからのアクセスを許可する場合は，ブロックパブリックアクセスを無効化した上でバケットポリシーに許可対象を定義するか，あるいはブロックパブリックアクセスでは拒否できないIAMポリシーをAWSリソースに設定する．<br>・ブロックパブリックアクセスを全て有効にすると，パブリックネットワークからの全アクセスを遮断できる．<br>・特定のオブジェクトで，アクセスコントロールリストを制限した場合，そのオブジェクトだけはパブリックアクセスにならない． |
| バケットポリシー           | IAMユーザー（クロスアカウントも可）またはAWSリソースがS3へにアクセスするためのポリシーで管理する． | ・ブロックパブリックアクセスを無効にしたうえで，IAMユーザー（クロスアカウントも可）やAWSリソースがS3にアクセスするために必要である．ただし代わりに，IAMポリシーをAWSリソースにアタッチすることによりも，アクセスを許可できる．<br>参考：https://awesome-linus.com/2020/02/04/s3-bucket-public-access/<br>・ポリシーをアタッチできないCloudFrontやALBなどでは，自身へのアクセスログを生成するために必須である． |
| アクセスコントロールリスト | IAMユーザー（クロスアカウントも可）がS3にアクセスする時の許否を設定する． | ・バケットポリシーと機能が重複する．<br>・仮にバケット自体のブロックパブリックアクセスを無効化したとしても，特定のオブジェクトでアクセスコントロールリストを制限した場合，そのオブジェクトだけはパブリックアクセスにならない． |
| CORSの設定                 |                                                              |                                                              |

<br>

### レスポンスヘッダー

#### ▼ レスポンスヘッダーの設定

レスポンスヘッダーに埋め込むHTTPヘッダーを，メタデータとして設定する．

| 設定可能なヘッダー              | 説明                                                         | 補足                                           |
| ------------------------------- | ------------------------------------------------------------ | ---------------------------------------------- |
| ETag                            | コンテンツの一意な識別子．ブラウザキャッシュの検証に使用される． | 全てのコンテンツにデフォルトで設定されている． |
| Cache-Control                   | Expiresと同様に，ブラウザにおけるキャッシュの有効期限を設定する． | 全てのコンテンツにデフォルトで設定されている． |
| Content-Type                    | コンテンツのMIMEタイプを設定する．                           | 全てのコンテンツにデフォルトで設定されている． |
| Expires                         | Cache-Controlと同様に，ブラウザにおけるキャッシュの有効期限を設定する．ただし，Cache-Controlの方が優先度が高い． |                                                |
| Content-Disposition             |                                                              |                                                |
| Content-Encoding                |                                                              |                                                |
| x-amz-website-redirect-location | コンテンツのリダイレクト先を設定する．                       |                                                |

<br>

### バケットポリシーの例

#### ▼ S3のARNについて

ポリシーでは，S3のARでは，『```arn:aws:s3:::<バケット名>/*```』のように，最後にバックスラッシュアスタリスクが必要．

#### ▼ ALBのアクセスログの保存を許可

パブリックアクセスが無効化されたS3に対して，ALBへのアクセスログを保存したい場合，バケットポリシーを設定する必要がある．バケットポリシーには，ALBからS3へのログ書き込み権限を実装する．『```"AWS": "arn:aws:iam::582318560864:root"```』では，```582318560864```はALBアカウントIDと呼ばれ，リージョンごとに値が決まっている．これは，東京リージョンのアカウントIDである．その他のリージョンのアカウントIDについては，以下のリンクを参考にせよ．

参考：https://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/application/load-balancer-access-logs.html#access-logging-bucket-permissions

**＊実装例＊**

```bash
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

パブリックアクセスが無効化されたS3に対して，CloudFrontからのルーティングで静的ファイルを読み出したい場合，バケットポリシーを設定する必要がある．

**＊実装例＊**

```bash
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

2020-10-08時点の仕様では，パブリックアクセスが無効化されたS3に対して，CloudFrontへのアクセスログを保存できない．よって，危険ではあるが，パブリックアクセスを有効化する必要がある．

```bash
// ポリシーは不要
```

#### ▼ Lambdaからのアクセスを許可

バケットポリシーは不要である．代わりに，AWS管理ポリシーの『```AWSLambdaExecute```』がアタッチされたロールをLambdaにアタッチする必要がある．このポリシーには，S3へのアクセス権限の他，CloudWatchログにログを生成するための権限が設定されている．

```bash
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

パブリックネットワーク上の特定のIPアドレスからのアクセスを許可したい場合，そのIPアドレスをポリシーに設定する必要がある．

```bash
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

認証/認可情報をパラメーターに持つURLのこと．S3では，署名付きURLを発行し，S3へのアクセス権限を外部のユーザーに一時的に付与する．

参考：https://atmarkit.itmedia.co.jp/ait/articles/2107/15/news009.html

<br>

### CLI

#### ▼ バケット内ファイルを表示

**＊例＊**

指定したバケット内のファイル名を表示する．

```bash
$ aws s3 ls s3://<バケット名>
```

#### ▼ バケット内容量を合計

**＊例＊**

指定したバケット内のファイル容量を合計する．

```bash
$ aws s3 ls s3://<バケット名> \
  --summarize \
  --recursive \
  --human-readable
```

#### ▼ バケットの中身をコピーする

指定したバケット内のファイルを他のバケットにコピーする．

```bash
$ aws s3 sync s3://<コピー元S3バケット名>/<フォルダ> s3://<コピー先S3バケット名>/<フォルダ> \
   --acl bucket-owner-full-control
```

コピーされる側のバケットのバケットポリシーでアクセスを許可すれば，異なるアカウント間でもコピーできる．

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

## 02. セキュリティグループ

### セキュリティグループとは

アプリケーションのクラウドパケットフィルタリング型ファイアウォールとして働く．インバウンド通信（プライベートネットワーク向き通信）では，プロトコルや受信元IPアドレスを設定でき，アウトバウンド通信（グローバルネットワーク向き通信）では，プロトコルや送信先プロトコルを設定できる．

<br>

### セットアップ

#### ▼ 概要

インバウンドルールとアウトバウンドルールを設定できる．

<br>

### インバウンドルール

#### ▼ パケットフィルタリング型ファイアウォール

パケットのヘッダ情報に記載された送信元IPアドレスやポート番号などによって，パケットを許可するべきかどうかを決定する．速度を重視する場合はこちら．ファイアウォールとWebサーバーの間には，NATルータやNAPTルータが設置されている．これらによる送信元プライベートIPアドレスから送信元グローバルIPアドレスへの変換についても参考にせよ．

![パケットフィルタリング](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/パケットフィルタリング.gif)

#### ▼ セキュリティグループIDの紐付け

ソースに対して，セキュリティグループIDを設定した場合，そのセキュリティグループがアタッチされているENIと，このENIに紐付けられたリソースからのトラフィックを許可できる．リソースのIPアドレスが動的に変化する場合，有効な方法である．

参考：https://docs.aws.amazon.com/ja_jp/vpc/latest/userguide/VPC_SecurityGroups.html#DefaultSecurityGroup

#### ▼ アプリケーションEC2の例

ALBに割り振られる可能性のあるIPアドレスを許可するために，ALBのセキュリティグループID，またはサブネットのIPアドレス範囲を設定する．

| タイプ | プロトコル | ポート    | ソース                       | 説明                        |
| ------ | ---------- | --------- | ---------------------------- | --------------------------- |
| HTTP   | TCP        | ```80```  | ALBのセキュリティグループID       | HTTP access from ALB        |
| HTTPS  | TCP        | ```443``` | 踏み台EC2のセキュリティグループID | SSH access from bastion EC2 |

#### ▼ 踏み台EC2の例

| タイプ | プロトコル | ポート   | ソース                     | 説明                              |
| ------ | ---------- | -------- | -------------------------- | --------------------------------- |
| SSH    | TCP        | ```22``` | 社内のグローバルIPアドレス | SSH access from global ip address |

#### ▼ EFSの例

EC2に割り振られる可能性のあるIPアドレスを許可するために，EC2のセキュリティグループID，またはサブネットのIPアドレス範囲を設定する．

| タイプ | プロトコル | ポート     | ソース                                 | 説明                    |
| ------ | ---------- | ---------- | -------------------------------------- | ----------------------- |
| NFS    | TCP        | ```2049``` | アプリケーションEC2のセキュリティグループID | NFS access from app EC2 |

#### ▼ RDSの例

EC2に割り振られる可能性のあるIPアドレスを許可するために，EC2のセキュリティグループID，またはサブネットのIPアドレス範囲を設定する．

| タイプ       | プロトコル | ポート     | ソース                                 | 説明                      |
| ------------ | ---------- | ---------- | -------------------------------------- | ------------------------- |
| MYSQL/Aurora | TCP        | ```3306``` | アプリケーションEC2のセキュリティグループID | MYSQL access from app EC2 |

#### ▼ Redisの例

EC2に割り振られる可能性のあるIPアドレスを許可するために，EC2のセキュリティグループID，またはサブネットのIPアドレス範囲を設定する．

| タイプ      | プロトコル | ポート     | ソース                                 | 説明                    |
| ----------- | ---------- | ---------- | -------------------------------------- | ----------------------- |
| カスタムTCP | TCP        | ```6379``` | アプリケーションEC2のセキュリティグループID | TCP access from app EC2 |

#### ▼ ALBの例

CloudFrontと連携する場合，CloudFrontに割り振られる可能性のあるIPアドレスを許可するために，全てのIPアドレスを許可する．その代わりに，CloudFrontにWAFを紐付け，ALBの前でIPアドレスを制限する．CloudFrontとは連携しない場合，ALBのセキュリティグループでIPアドレスを制限する．

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

クラウドメールサーバーとして働く．メール受信をトリガーとして，アクションを実行する．

<br>

### セットアップ

![SESとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SESとは.png)

#### ▼ 概要

| 設定項目           | 説明                                                         | 補足                                                         |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Domain             | SESのドメイン名を設定する．                                  | 設定したドメイン名には，『```10 inbound-smtp.us-east-1.amazonaws.com```』というMXレコードタイプの値が紐付く． |
| Email Addresses    | 送信先として認証するメールアドレスを設定する．設定するとAWSからメールが届くので，指定されたリンクをクリックする． | Sandboxモードの時だけ機能する．                              |
| Sending Statistics | SESで収集されたデータをメトリクスで確認できる．              | ```Request Increased Sending Limits```のリンクにて，Sandboxモードの解除を申請できる． |
| SMTP Settings      | SMTP-AUTHの接続情報を確認できる．                            | アプリケーションの```25```番ポートは送信制限があるため，```465```番ポートを使用する．これに合わせて，SESも受信で```465```番ポートを使用するようにする． |
| Rule Sets          | メールの受信したトリガーとして実行するアクションを設定できる． |                                                              |
| IP Address Filters |                                                              |                                                              |

#### ▼ Rule Sets

| 設定項目 | 説明                                                         |
| -------- | ------------------------------------------------------------ |
| Recipiet | 受信したメールアドレスで，何の宛先の時にこれを許可するかを設定する． |
| Actions  | 受信を許可した後に，これをトリガーとして実行するアクションを設定する． |

<br>

### 仕様上の制約

#### ▼ 構築リージョンの制約

SESは連携するAWSリソースと同じリージョンに構築しなければならない．

#### ▼ Sandboxモードの解除

SESはデフォルトではSandboxモードになっている．Sandboxモードでは以下の制限がかかっており．サポートセンターに解除申請が必要である．

| 制限     | 説明                                          |
| -------- | --------------------------------------------- |
| 送信制限 | SESで認証したメールアドレスのみに送信できる． |
| 受信制限 | 1日に200メールのみ受信できる．                |

<br>

### SMTP-AUTH

#### ▼ AWSにおけるSMTP-AUTHの仕組み

一般的なSMTP-AUTHでは，クライアントユーザーの認証が必要である．同様にして，AWSでもこれが必要であり，IAMユーザーを使用してこれを実現する．送信元となるアプリケーションにIAMユーザーを紐付け，このIAMユーザーにはユーザー名とパスワードを設定する．アプリケーションがSESを介してメールを送信する時，アプリケーションに対して，SESがユーザー名とパスワードを使用した認証を実行する．ユーザー名とパスワードは後から確認できないため，メモしておくこと．SMTP-AUTHの仕組みについては，以下のリンクを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/network/network_osi_tcp_model.html

<br>

## 04. SM：Systems Manager

### パラメーターストア

#### ▼ パラメーターストアとは

機密性の高い値を暗号化した状態で管理し，復号化した上で，環境変数としてEC2/ECS/EKSに出力する．Kubernetesのシークレットの概念が取り入れられている．パラメーターのタイプは全て『SecureString』とした方が良い．

#### ▼ KMSを使用した暗号化と復号化

![parameter-store_kms](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/parameter-store_kms.png)

パラメーターストアで管理される環境変数はKMSによって暗号化されており，EC2/ECS/EKSで参照する時に復号化される．

参考：

- https://docs.aws.amazon.com/ja_jp/kms/latest/developerguide/services-parameter-store.html

- https://note.com/hamaa_affix_tech/n/n02eb412d0327


#### ▼ 命名規則

SMパラメーター名は，```/<リソース名>/<環境変数名>```とするとわかりやすい．

<br>

### セッションマネージャー

#### ▼ セッションマネージャーとは

EC2/ECSへのセッションを管理する．

参考：https://docs.aws.amazon.com/ja_jp/systems-manager/latest/userguide/session-manager.html#session-manager-features

#### ▼ AWSセッション

TLS，Sigv4，KMSを使用して暗号化された接続のこと．

参考：：https://docs.aws.amazon.com/ja_jp/systems-manager/latest/userguide/session-manager.html#what-is-a-session

#### ▼ 同時AWSセッションの上限数

同時AWSセッションの上限数は2つまでである．以下のようなエラーが出た時は，セッション途中のユーザーが他ににいるか，過去のセッションを終了できていない可能性がある．セッションマネージャーで既存のセッションを終了できる．

```bash
# ECS Execの場合
An error occurred (ClientException) when calling the ExecuteCommand operation: Unable to start new execute sessions because the maximum session limit of 2 has been reached.
```

<br>

### チェンジマネージャー

#### ▼ チェンジマネージャーとは

AWSリソースの設定変更に承認フローを設ける．

1. ランブックを作成する．AWSがあらかじめ用意してくれているものを使用もできる．
2. テンプレートを作成し，リクエストを作成する．
3. 承認フローを通過する．これは，スキップするように設定もできる．
4. テンプレートを使用して，変更リクエストを作成する．
5. 承認フローを通過する．これは，スキップできない．
6. 変更リクエストに基づいて，AWSリソースを変更する処理が自動的に実行される．これは，即時実行するこもスケジューリングもできる．

#### ▼ ランブック（ドキュメント）

AWSリソースを変更するためには『ランブック（ドキュメント）』を事前に作成する必要がある．ランブックでは，AWSリソースの変更箇所を定義する．ランブックには，AWSがあらかじめ用意してくれるものとユーザー定義のものがある．

| タイプ           | 説明                                                         | 補足                                                         |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Automationタイプ | サーバー/コンテナ外でコマンドを実行する．内部的には，Python製のLambdaが使用されている（たぶん）．<br>参考：https://docs.aws.amazon.com/ja_jp/systems-manager/latest/userguide/systems-manager-automation.html | EC2インスタンスを起動し，状態がOKになるまで監視する手順を自動化した例： https://docs.aws.amazon.com/ja_jp/systems-manager/latest/userguide/automation-walk-document-builder.html |
| Commandタイプ    | サーバー/コンテナ内でコマンドを実行する．内部的には，AWS Run Commandが使用されている．<br>参考：https://docs.aws.amazon.com/ja_jp/systems-manager/latest/userguide/sysman-ssm-docs.html#what-are-document-types | ・EC2インスタンス内で実行するlinuxコマンドを自動化した例： https://dev.classmethod.jp/articles/check-os-setting-ssm-doc-al2/ <br>・EC2インスタンス内で実行するawscliコマンドを自動化した例： https://dev.classmethod.jp/articles/autoscalling-terminating-log-upload/ |
| Sessionタイプ    |                                                              |                                                              |

#### ▼ テンプレート

作業内容の鋳型こと．ランブックを指定し，変更箇所に基づいた作業内容を定義する．
デフォルトではテンプレートの作成自体にも承認が必要になる．ただ，指定した権限を持つユーザーはテンプレートの承認をスキップするように設定できる．

参考：https://docs.aws.amazon.com/ja_jp/systems-manager/latest/userguide/change-templates.html

#### ▼ 変更リクエスト

鋳型に基づいた実際の作業のこと．作業のたびにテンプレートを指定し，リクエストを提出する．承認が必要になる．

参考：https://docs.aws.amazon.com/ja_jp/systems-manager/latest/userguide/change-requests.html

<br>

## 05. SNS：Simple Notification Service

### SNSとは

パブリッシャーから発信されたメッセージをエンドポイントで受信し，サブスクライバーに転送するAWSリソース．

![SNSとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SNSとは.png)

<br>

### セットアップ

#### ▼ 概要

| 設定項目           | 説明                                                 |
| ------------------ | ---------------------------------------------------- |
| トピック           | 複数のサブスクリプションをグループ化したもの．       |
| サブスクリプション | エンドポイントで受信するメッセージの種類を設定する． |

#### ▼ トピック

| 設定項目                 | 説明                                                         |
| ------------------------ | ------------------------------------------------------------ |
| サブスクリプション       | サブスクリプションを登録する．                               |
| アクセスポリシー         | トピックへのアクセス権限を設定する．                         |
| 配信再試行ポリシー       | サブスクリプションのHTTP/HTTPSエンドポイントが失敗した時のリトライ方法を設定する．<br>参考：https://docs.aws.amazon.com/ja_jp/sns/latest/dg/sns-message-delivery-retries.html |
| 配信ステータスのログ記録 | サブスクリプションへの発信のログをCloudWatchログに転送するように設定する． |
| 暗号化                   |                                                              |

#### ▼ サブスクリプション

| メッセージの種類      | 転送先                | 補足                                                         |
| --------------------- | --------------------- | ------------------------------------------------------------ |
| Kinesis Data Firehose | Kinesis Data Firehose |                                                              |
| SQS                   | SQS                   |                                                              |
| Lambda                | Lambda                |                                                              |
| Eメール               | 任意のメールアドレス  |                                                              |
| HTTP/HTTPS            | 任意のドメイン名      | Chatbotのドメイン名は『```https://global.sns-api.chatbot.amazonaws.com```』 |
| JSON形式のメール      | 任意のメールアドレス  |                                                              |
| SMS                   | SMS                   | 受信者の電話番号を設定する．                                 |

<br>

## 06. SQS：Simple Queue Service

### SQSとは

![AmazonSQSとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/SQS.jpeg)

クラウドメッセージキューとして働く．パブリッシャーが送信したメッセージは，一旦SQSに追加される．その後，サブスクライバーは，SQSに対してリクエストを送信し，メッセージを取り出す．異なるVPC間でも，メッセージキューを同期できる．

<br>

### セットアップ

#### ▼ SQSの種類

| 設定項目         | 説明                                                         |
| ---------------- | ------------------------------------------------------------ |
| スタンダード方式 | サブスクライバーの取得レスポンスを待たずに，次のキューを非同期的に転送する． |
| FIFO方式         | サブスクライバーの取得レスポンスを待ち，キューを同期的に転送する． |

<br>

### CLI

#### ▼ キューURLを取得

キューのURLを取得する．

```bash
$ aws sqs get-queue-url --queue-name <キュー名>
```

#### ▼ キューに受信リクエストを送信

キューに受信リクエストを送信し，メッセージを受信する．

```bash
$ SQS_QUEUE_URL=$(aws sqs get-queue-url --queue-name <キュー名>)

$ aws sqs receive-message --queue-url ${SQS_QUEUE_URL}
```

キューに受信リクエストを送信し，メッセージを受信する．また，メッセージの内容をファイルに書き出す．

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

## 07. STS：Security Token Service

### STSとは

AWSリソースに一時的にアクセスできる認証情報（アクセスキー，シークレットアクセスキー，セッショントークン）を発行する．この認証情報は，一時的なアカウント情報として使用できる．

![STS](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/STS.jpg)

<br>

### セットアップ

#### 1. IAMロールに信頼ポリシーをアタッチ

必要なポリシーが設定されたIAMロールを構築する．その時信頼ポリシーでは，ユーザーの```ARN```を信頼されたエンティティとして設定しておく．これにより，そのユーザーに対して，ロールをアタッチできるようになる．

```bash
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

信頼されたエンティティ（ユーザー）から，STS（```https://sts.amazonaws.com```）に対して，ロールのアタッチをリクエストする．

```bash
#!/bin/bash

set -xeuo pipefail
set -u

# 事前に環境変数にインフラ環境名を代入する．
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

# 信頼されたエンティティのアカウント情報を設定する．
aws configure set aws_access_key_id "$aws_account_id"
aws configure set aws_secret_access_key "$aws_secret_access_key"
aws configure set aws_default_region "ap-northeast-1"

# https://sts.amazonaws.com に，ロールのアタッチをリクエストする．
aws_sts_credentials="$(aws sts assume-role \
  --role-arn "arn:aws:iam::${aws_access_key_id}:role/${ENV}-<アタッチしたいIAMロール名>" \
  --role-session-name "<任意のセッション名>" \
  --external-id "$aws_iam_role_external_id" \
  --duration-seconds "<セッションの有効秒数>" \
  --query "Credentials" \
  --output "json")"
```

STSへのリクエストの結果，ロールがアタッチされた新しいIAMユーザー情報を取得できる．この情報には有効秒数が存在し，期限が過ぎると新しいIAMユーザーになる．秒数の最大値は，該当するIAMロールの概要の最大セッション時間から変更できる．

![AssumeRole](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/AssumeRole.png)

レスポンスされるデータは以下の通り．

```bash
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

jqを使用して，レスポンスされたJSONデータからアカウント情報を抽出する．環境変数として出力し，使用できるようにする．あるいは，AWSの```credentials```ファイルを作成しても良い．

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

jqを使用して，レスポンスされたJSONデータからアカウント情報を抽出する．ロールを引き受けた新しいアカウントの情報を，```credentials```ファイルに書き込む．

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

ロールを引き受けた新しいアカウントを使用して，AWSリソースに接続できるかを確認する．アカウント情報の取得方法として```credentials```ファイルの作成を選択した場合，```profile```オプションが必要である．

```bash
#!/bin/bash

# 3-2を選択した場合，credentialsファイルを参照するオプションが必要がある．
aws s3 ls --profile <プロファイル名>
2020-xx-xx xx:xx:xx <tfstateファイルが管理されるバケット名>
```

<br>

## 08. Step Functions

### Step Functionsとは

AWSサービスを組み合わせて，イベント駆動型アプリケーションを構築できる．

<br>

### AWSリソースのAPIコール

#### ▼ APIコールできるリソース

参考：https://docs.aws.amazon.com/step-functions/latest/dg/connect-supported-services.html

#### ▼ Lambda

**＊実装例＊**

```bash
{
  "StartAt": "Call Lambda",
  "States": {
    "Call Lambda": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke.waitForTaskToken",
      "Parameters": {
        "FunctionName": "arn:aws:lambda:ap-northeast-1:*****:foo-function:1"
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
| HTTPメソッド | POST           | GETメソッドでは機能しない． |
| アクション   | StartExecution |                             |
| 実行ロール   | IAMロールのARN | StartExecutionを許可する．  |

```bash
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "states:StartExecution",
            "Resource": "arn:aws:states:*:*****:stateMachine:*"
        }
    ]
}
```

#### ▼ レスポンス構造

以下がレスポンスされれば，API GatewayがStepFunctionsをコールできたことになる．

```bash
{
    "executionArn": "arn:aws:states:ap-northeast-1:*****:execution:prd-foo-doing-state-machine:*****",
    "startDate": 1.638244285498E9
}
```

<br>

## 09. VPC：Virtual Private Cloud

### VPCとは

クラウドプライベートネットワークとして働く．プライベートIPアドレスが割り当てられた，VPCと呼ばれるプライベートネットワークを仮想的に構築できる．異なるAZに渡ってEC2を立ち上げることによって，クラウドサーバーをデュアル化できる．VPCのパケット通信の仕組みについては，以下のリンクを参考にせよ．

参考：https://pages.awscloud.com/rs/112-TZM-766/images/AWS-08_AWS_Summit_Online_2020_NET01.pdf

![VPCが提供できるネットワークの範囲](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VPCが提供できるネットワークの範囲.png)

<br>

### VPC内のIPアドレス

#### ▼ 種類

| IPアドレスの種類                                   | 説明                                          |
| -------------------------------------------------- | --------------------------------------------- |
| 自動割り当てパブリックIPアドレス（動的IPアドレス） | 動的なIPアドレスで，EC2の再構築後に変化する． |
| Elastic IP（静的IPアドレス）                       | 静的なIPアドレスで，再構築後も保持される．    |

#### ▼ 紐付け

| 紐付け名      | 補足                                                         |
| ------------- | ------------------------------------------------------------ |
| EC2との紐付け | 非推奨の方法である．<br>参考：https://docs.aws.amazon.com/ja_jp/vpc/latest/userguide/vpc-eips.html#vpc-eip-overview |
| ENIとの紐付け | 推奨される方法である．<br>参考：https://docs.aws.amazon.com/ja_jp/vpc/latest/userguide/vpc-eips.html#vpc-eip-overview |

<br>

### VPCのCIDR設計の手順

1つのVPC内には複数のサブネットが入る．そのため，サブネットのIPアドレス範囲は，サブネットの個数だけ含めなければならない．また，VPCがもつIPアドレス範囲から，VPC内の各AWSリソースにIPアドレスを割り当てていかなければならない．VPC内でIPアドレスが枯渇しないように，以下の手順で，割り当てを考える．

参考：https://note.com/takashi_sakurada/n/n502fb0299938

（１）RFC1918の推奨する```10.0.0.0/8```，```172.16.0.0/12```，```192.168.0.0/16```を使用する．VPCのCIDR設計では，これらの範囲に含まれるIPアドレスを使用するようにする．

| RFC1918推奨のIPアドレス範囲 | IPアドレス                                | 個数     |
| --------------------------- | ----------------------------------------- | -------- |
| ```10.0.0.0/8```            | ```10.0.0.0```  ~ ```10.255.255.255```    | 16777216 |
| ```172.16.0.0/12```         | ```172.16.0.0``` ~ ```172.31.255.255```   | 1048576  |
| ```192.168.0.0/16```        | ```192.168.0.0``` ~ ```192.168.255.255``` | 65536    |

（２）あらかじめ，会社内の全てのアプリケーションのCIDRをスプレッドシートなどで一括で管理しておく．

（３）各アプリケーション間でTransit Gatewayやピアリング接続を実行する可能性がある場合は．拡張性を考慮して，アプリケーション間のCIDRは重ならないようにしておく必要がある．例えば，以前に開発したアプリケーションが```10.200.47.0```までを使用していた場合，```10.200.48.0```から使用を始める．また，VPCで許可されるIPアドレスの個数は最多65536個（```/16```）で最少16個（```/28```）であり，実際は512個（```/23```）ほどあれば問題ないため，```10.200.48.0/23```を設定する．

参考：https://docs.aws.amazon.com/ja_jp/vpc/latest/userguide/VPC_Subnets.html#SubnetRouting

（４）VPCのIPアドレスをパブリックサブネットとプライベートサブネットを割り当てる．パブリックサブネットとプライベートサブネットを冗長化する場合は，VPCのIPアドレス数をサブネット数で割って各サブネットのIPアドレス数を算出し，CIDRブロックを設定する．例えば，VPCのサブネットマスクを```/16``` としている場合は，各サブネットのサブネットマスクは```/24```とする．一方で，VPCを```/23```としている場合は，各サブネットは```/27```とする．また，各サブネットのCIDRブロックを同じにする必要はなく，アプリケーションが稼働するサブネットにIPアドレス数がやや多くなるようにし，その分DBの稼働するサブネットのIPアドレスを少なくするような設計でも良い．

参考：https://d0.awsstatic.com/events/jp/2017/summit/slide/D2T3-5.pdf

（５）VPC内の各AWSリソースの特徴に合わせて，IPアドレス範囲を割り当てる．

参考：https://dev.classmethod.jp/articles/amazon-vpc-5-tips/

| AWSサービスの種類  | 最低限のIPアドレス数                      |
| ------------------ | ----------------------------------------- |
| ALB                | ALB1つ当たり，8個                         |
| オートスケーリング | 水平スケーリング時のEC2最大数と同じ個数   |
| VPCエンドポイント  | VPCエンドポイント1つ当たり，IPアドレス1つ |
| ECS，EKS           | Elastic Network Interface 数と同じ個数    |
| Lambda             | Elastic Network Interface 数と同じ個数    |

<br>

## 10-02. ENI：Elastic Network Interface

### ENIとは

クラウドネットワークインターフェースとして働く．物理ネットワークにおけるNICについては以下のリンクを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/network/network_osi_tcp_model.html

<br>

### 紐付けられるリソース

| リソースの種類    | 役割                                                         | 補足                                                         |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ALB               | ENIに紐付けられたパブリックIPアドレスをALBに割り当てられる． |                                                              |
| EC2               | ENIに紐付けられたパブリックIPアドレスがEC2に割り当てられる． | 参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/using-eni.html#eni-basics |
| Fargate環境のEC2  | 明言されていないため推測ではあるが，ENIに紐付けられたlocalインターフェースがFargate環境でコンテナのホストとなるEC2インスタンスに割り当てられる． | Fargate環境のホストがEC2とは明言されていない．<br>参考：https://aws.amazon.com/jp/blogs/news/under-the-hood-fargate-data-plane/ |
| Elastic IP        | ENIにElastic IPアドレスが紐付けられる．このENIを他のAWSリソースに紐付けることにより，ENIを介して，Elastic IPを紐付けられる． | 参考：https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/using-eni.html#managing-network-interface-ip-addresses |
| GlobalAccelerator |                                                              |                                                              |
| NAT Gateway       | ENIに紐付けられたパブリックIPアドレスがNAT Gatewayに割り当てられる． |                                                              |
| RDS               |                                                              |                                                              |
| セキュリティグループ | ENIにセキュリティグループが紐付けれる．このENIを他のAWSリソースに紐付けることにより，ENIを介して，セキュリティグループを紐付けられる． |                                                              |
| VPCエンドポイント | Interface型のVPCエンドポイントとして機能する．               |                                                              |

<br>

## 10-03. VPCサブネット

### VPCサブネットとは

クラウドプライベートネットワークにおけるセグメントとして働く．

<br>

### 種類

#### ▼ パブリックサブネットとは

非武装地帯に相当する．サブネット外からのインバンド通信を受け付けるために，ALBのルーティング先にサブネットを設定すれば，そのサブネットはパブリックサブネットとして機能する．

#### ▼ プライベートサブネットとは

内部ネットワークに相当する．サブネット外からのインバンド通信を受け付けないようするために，ALBのルーティング先にサブネットを設定しないようにすれば，そのサブネットはプライベートサブネットとして機能する．ただし，サブネット内からサブネット外へのアウトバウンド通信は許可しても問題なく，その場合はルートテーブルにNAT Gatewayを設定する必要がある．

![public-subnet_private-subnet](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/public-subnet_private-subnet.png)

#### ▼ 構築例

サブネットの役割ごとに構築する方法がある．

| 名前                              | 役割                                    |
|---------------------------------| --------------------------------------- |
| Public subnet (Frontend Subnet) | NAT Gatewayを配置する．                 |
| Private app subnet              | アプリケーション，Nginxなどを配置する． |
| Private datastore subnet        | RDS，Redisなどを配置する                |

![subnet-types](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/subnet-types.png)

<br>

## 10-04. Network ACL：Network Access  Control List

### Network ACLとは

サブネットのクラウドパケットフィルタリング型ファイアウォールとして働く．ルートテーブルとサブネットの間に設置され，ルートテーブルよりも先に評価される．双方向のインバウンドルールとアウトバウンドルールを決定する．

![network-acl](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/network-acl.png)

<br>

### ACLルール

ルールは上から順に適用される．例えば，インバウンドルールが以下だった場合，ルール100が最初に適用され，サブネットに対する，全IPアドレス（```0.0.0.0/0```）からのインバウンド通信を許可していることになる．

| ルール # | タイプ                | プロトコル | ポート範囲 / ICMP タイプ | ソース    | 許可 / 拒否 |
| -------- | --------------------- | ---------- | ------------------------ | --------- | ----------- |
| 100      | すべての トラフィック | すべて     | すべて                   | 0.0.0.0/0 | ALLOW       |
| *        | すべての トラフィック | すべて     | すべて                   | 0.0.0.0/0 | DENY        |

<br>

## 10-05. ルートテーブル

### ルートテーブルとは

クラウドルータのマッピングテーブルとして働く．サブネットに紐付けることで，サブネット内からサブネット外に出るアウトバウンド通信のルーティングを制御する．注意点として，Network ACLよりも後に評価される．

参考：https://docs.aws.amazon.com/ja_jp/vpc/latest/userguide/VPC_Route_Tables.html#RouteTables

| Destination（送信先のIPの範囲） |                Target                 |
| :-----------------------------: | :-----------------------------------: |
|        ```xx.x.x.x/xx```        | Destinationの範囲内だった場合の送信先 |

<br>

### ルートテーブルの種類

#### ▼ メインルートテーブル

VPCの構築時に自動で構築される．どのルートテーブルにも紐付けられていないサブネットのルーティングを設定する．

#### ▼ カスタムルートテーブル

特定のサブネットのルーティングを設定する．

<br>

### テーブルルール例

![route-table](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/route-table.png)

#### ▼ プライベートサブネットのアウトバウンド通信をパブリックネットワークに公開する場合

上の図中で，サブネット3にはルートテーブル2が紐付けられている．サブネット3内のEC2の送信先のプライベートIPアドレスが，```10.0.0.0/16```の範囲内にあれば，インバウンド通信と見なし，local（VPC内の他サブネット）を送信先に選択する．一方で，```0.0.0.0/0```（local以外の全IPアドレス）の範囲内にあれば，アウトバウンド通信と見なし，Internet Gatewayを送信先に選択する．

| Destination（プライベートIPアドレス範囲） |      Target      |
| :---------------------------------------: | :--------------: |
|      ```10.0.0.0/16```（VPCのCIDR）       |      local       |
|              ```0.0.0.0/0```              | Internet Gateway |

#### ▼ プライベートサブネットのアウトバウンド通信をVPC内に閉じる場合

上の図中で，サブネット2にはルートテーブル1が紐付けられている．サブネット2内のEC2の送信先のプライベートIPアドレスが，```10.0.0.0/16```の範囲内にあれば，インバウンド通信と見なし，local（VPC内の他サブネット）を送信先に選択する．一方で，範囲外にあれば通信を破棄する．

| Destination（プライベートIPアドレス範囲） | Target |
| :---------------------------------------: | :----: |
|      ```10.0.0.0/16```（VPCのCIDR）       | local  |

#### ▼ プライベートサブネットのアウトバウンド通信を同一サブネット内に閉じる場合

プライベートサブネットでネットワークを完全に閉じる場合，ルートテーブルにサブネットのCIDRを設定する．

参考：https://koejima.com/archives/1950/

| Destination（プライベートIPアドレス範囲） | Target |
| :---------------------------------------: | :----: |
|  ```10.0.0.0/24```（サブネット1のCIDR）   | local  |

<br>

## 10-06. VPCエンドポイント

### VPCエンドポイントとは

VPCのプライベートサブネット内のリソースが，VPC外のリソースに対して，アウトバウンド通信を実行できるようにする．Gateway型とInterface型がある．VPCエンドポイントを使用しない場合，プライベートサブネット内からのアウトバウンド通信には，Internet GatewayとNAT Gatewayを使用する必要がある．

**＊例＊**

Fargateをプライベートサブネットに置いた場合，FargateからVPC外にあるAWSリソースに対するアウトバウンド通信のために必要である（例：CloudWatchログ，ECR，S3，SSM）．

![VPCエンドポイント](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VPCエンドポイント.png)

### NAT GatewayとInternet Gatewayとの比較

Internet GatewayとNAT Gatewayの代わりに，VPCエンドポイントを使用すると，料金が少しだけ安くなり，また，VPC外のリソースとの通信がより安全になる．

<br>

### エンドポイントタイプ

#### ▼ Interface型

イベートリンクともいう．プライベートIPアドレスを持つENIとして機能し，AWSリソースからアウトバウンド通信を受信する．

**＊リソース例＊**

S3，DynamoDB以外の全てのリソース

#### ▼ Gateway型

ルートテーブルにおける定義に従う．VPCエンドポイントとして機能し，AWSリソースからアウトバウンド通信を受信する．

**＊リソース例＊**

S3，DynamoDBのみ

<br>

## 10-07. Internet Gateway，NAT Gateway

### Internet Gateway，NAT Gatewayとは

![InternetGatewayとNATGateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/InternetGatewayとNATGateway.png)

#### ▼ Internet Gateway

VPCの出入り口に設置され，グローバルネットワークとプライベートネットワーク間（ここではVPC）におけるNAT（静的NAT）の機能を持つ．1つのパブリックIPに対して，1つのEC2のプライベートIPを紐付けられる．NAT（静的NAT）については，以下のリンクを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/network/network_osi_tcp_model.html

#### ▼ NAT Gateway

NAPT（動的NAT）の機能を持つ．1つのパブリックIPに対して，複数のEC2のプライベートIPを紐付けられる．パブリックサブネットに配置されることで，プライベートサブネットのEC2からのレスポンスを受け付ける．NAPT（動的NAT）については，以下のリンクを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/network/network_osi_tcp_model.html

<br>

### 比較表


|              | Internet Gateway                                             | NAT Gateway            |
| :----------- | :----------------------------------------------------------- | :--------------------- |
| **機能**     | グローバルネットワークとプライベートネットワーク間（ここではVPC）におけるNAT（静的NAT） | NAPT（動的NAT）        |
| **設置場所** | VPC上                                                        | パブリックサブネット内 |

<br>

## 10-08. VPC間，VPC-オンプレ間の通信

### VPCピアリング接続

![VPCピアリング接続](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VPCピアリング接続.png)

#### ▼ VPCピアリング接続とは

『一対一』の関係で，『異なるVPC間』の双方向通信を可能にする．

#### ▼ VPCピアリング接続の可否

| アカウント  | VPCのあるリージョン | VPC内のCIDRブロック   | 接続の可否 |
| ----------- | ------------------- | --------------------- | ---------- |
| 同じ/異なる | 同じ/異なる         | 全て異なる            | **〇**     |
|             |                     | 同じものが1つでもある | ✕          |

VPC に複数の IPv4 CIDR ブロックがあり，1つでも 同じCIDR ブロックがある場合は，VPC ピアリング接続はできない．

![VPCピアリング接続不可の場合-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VPCピアリング接続不可の場合-1.png)

たとえ，IPv6が異なっていても，同様である．

![VPCピアリング接続不可の場合-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VPCピアリング接続不可の場合-2.png)

<br>

### VPCエンドポイントサービス

![vpc-endpoint-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/vpc-endpoint-service.png)

#### ▼ VPCエンドポイントサービスとは

VPCエンドポイントとは異なる機能なので注意．Interface型のVPCエンドポイント（プライベートリンク）をNLBに紐付けることにより，『一対多』の関係で，『異なるVPC間』の双方向通信を可能にする．エンドポイントのサービス名は，『``` com.amazonaws.vpce.ap-northeast-1.vpce-svc-*****```』になる．API GatewayのVPCリンクは，VPCエンドポイントサービスに相当する．

<br>

### Transit Gateway

![transit-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/transit-gateway.png)

#### ▼ Transit Gatewayとは

『多対多』の関係で，『異なるVPC間』や『オンプレ-VPC間』の双方向通信を可能にする．クラウドルーターとして働く．

<br>

### 各サービスとの比較

| 機能                                          | VPCピアリング接続 | VPCエンドポイントサービス           | Transit gateway        |
| --------------------------------------------- | ----------------- | ----------------------------------- | ---------------------- |
| 通信可能なVPC数                               | 一対一            | 一対一，一対多                      | 一対一，一対多，多対多 |
| 通信可能なIPアドレスの種類                    | IPv4，IPv6        | IPv4                                | IPv4，IPv6             |
| 接続可能なリソース                            | 制限なし          | NLBでルーティングできるリソースのみ | 制限なし               |
| CIDRブロックがVPC間で被ることによる通信の可否 | ✖︎                 | ⭕                                   | ✖︎                      |
| クロスアカウント                              | ⭕                 | ⭕                                   | ⭕                      |
| クロスリージョン                              | ⭕                 | ✖︎                                   | ⭕                      |
| VPC間                                         | ⭕                 | ⭕                                   | ⭕                      |
| VPC-オンプレ間                                | ✖︎                 | ✖︎                                   | ⭕                      |

<br>

## 34. WAF：Web Application Firewall

### セットアップ

定義できるルール数や文字数に制限がある．以下のリンクを参考にせよ．

参考：https://docs.aws.amazon.com/ja_jp/waf/latest/developerguide/limits.html

| 設定項目                          | 説明                                                         | 補足                                                         |
| --------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Web ACLs：Web Access Control List | 各トリガーと許可/拒否アクションの紐付けを『ルール』とし，これをセットで設定する． | アタッチするAWSリソースに合わせて，リージョンが異なる．      |
| IP sets                           | アクション実行のトリガーとなるIPアドレス                     | ・許可するIPアドレスは，意味合いに沿って異なるセットとして構築するべき．例えば，社内IPアドレスセット，協力会社IPアドレスセット，など<br>・拒否するIPアドレスはひとまとめにしても良い． |
| Regex pattern sets                | アクション実行のトリガーとなるURLパスの文字列                | ・許可/拒否する文字列は，意味合いに沿って異なる文字列セットとして構築するべき．例えば，ユーザーエージェントセット，リクエストパスセット，など |
| Rule groups                       |                                                              |                                                              |
| AWS Markets                       |                                                              |                                                              |

<br>

### AWSリソース vs. サイバー攻撃

| サイバー攻撃の種類 | 対抗するAWSリソースの種類                                    |
| ------------------ | ------------------------------------------------------------ |
| マルウェア         | なし                                                         |
| 傍受，盗聴         | VPC内の特にプライベートサブネット間のピアリング接続．VPC外を介さずにデータを送受信できる． |
| ポートスキャン     | セキュリティグループ                                       |
| DDoS               | Shield                                                       |
| ゼロディ           | WAF                                                          |
| インジェクション   | WAF                                                          |
| XSS                | WAF                                                          |
| データ漏洩         | KMS，CloudHSM                                                |
| 組織内部での裏切り | IAM                                                          |

<br>

### セットアップ

#### ▼ 概要

| 設定項目           | 説明                                              | 補足                                                         |
| ------------------ | ------------------------------------------------- | ------------------------------------------------------------ |
| Web ACLs           | アクセス許可と拒否のルールを定義する．            |                                                              |
| Bot Control        | Botに関するアクセス許可と拒否のルールを定義する． |                                                              |
| IP Sets            | IPアドレスの共通部品を管理する．                  | アクセスを許可したいIPアドレスセットを作成する時，全てのIPアドレスを1つのセットで管理してしまうと，何のIPアドレスかわらなあくなってしまう．そこで，許可するIPアドレスのセットを種類（自社，外部のA社/B社，など）で分割すると良い． |
| Regex pattern sets | 正規表現パターンの共通部品を管理する．            |                                                              |
| Rule groups        | ルールの共通部品を管理する．                      | 各WAFに同じルールを設定する場合，ルールグループを使用するべきである．ただ，ルールグループを使用すると，これらのルールを共通のメトリクスで監視しなければならなくなる．そのため，もしメトリクスを分けるのであれば，ルールグループを使用しないようにする． |

#### ▼ Web ACLs

| 設定項目                 | 説明                                                         | 補足                                                         |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Overview                 | WAFによって許可/拒否されたリクエストのアクセスログを確認できる． |                                                              |
| Rules                    | 順番にルールを判定し，一致するルールがあればアクションを実行する．この時，一致するルールの後にあるルールは．判定されない． | AWSマネージドルールについては，以下のリンクを参考にせよ．<br>参考：https://docs.aws.amazon.com/ja_jp/waf/latest/developerguide/aws-managed-rule-groups-list.html |
| Associated AWS resources | WAFをアタッチするAWSリソースを設定する．                     | CloudFront，ALBなどにアタッチできる．                        |
| Logging and metrics      | アクセスログをKinesis Data Firehoseに出力するように設定する． |                                                              |

#### ▼ OverviewにおけるSampled requestsの見方

『全てのルール』または『個別のルール』におけるアクセス許可/拒否の履歴を確認できる．ALBやCloudFrontのアクセスログよりも解りやすく，様々なデバッグに役立つ．ただし，３時間分しか残らない．一例として，CloudFrontにアタッチしたWAFで取得できるログを以下に示す．

```http
GET /foo/
# ホスト
Host: example.jp
Upgrade-Insecure-Requests: 1
# ユーザーエージェント
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
# CORSであるか否か
Sec-Fetch-Site: same-origin
Accept-Encoding: gzip, deflate, br
Accept-Language: ja,en;q=0.9
# Cookieヘッダー
Cookie: sessionid=<セッションID>; _gid=<GoogleAnalytics値>; __ulfpc=<GoogleAnalytics値>; _ga=<GoogleAnalytics値>
```

<br>

### ルール

#### ▼ ルールの種類

参考：https://docs.aws.amazon.com/ja_jp/waf/latest/developerguide/classic-web-acl-rules-creating.html

| ルール名     | 説明                                                         |
| ------------ | ------------------------------------------------------------ |
| レートベース | 同じ送信元IPアドレスからの５分間当たりのリクエスト数制限をルールに付与する． |
| レギュラー   | リクエスト数は制限しない．                                   |

#### ▼ ルールの粒度のコツ

わかりやすさの観点から，可能な限り設定するステートメントを少なくし，1つのルールに1つの意味合いだけを持たせるように命名する．

#### ▼ Count（検知）モード

ルールに該当するリクエスト数を数え，許可/拒否せずに次のルールを検証する．計測結果に応じて，Countモードを無効化し，拒否できるようにする．

参考：https://oji-cloud.net/2020/09/18/post-5501/

#### ▼ ルールグループアクションの上書き

ルールのCountモードが有効になっている場合，Countアクションに続けて，そのルールの元のアクションを実行する．そのため，Countアクションしつつ，Blockアクションを実行できる（仕様がややこしすぎるので，なんとかしてほしい）．

参考：https://docs.aws.amazon.com/ja_jp/waf/latest/developerguide/web-acl-rule-group-override-options.html

| マネージドルールの元のアクション | Countモード | 上書きオプション | 結果                                                         |
| -------------------------------- | ----------- | ---------------- | ------------------------------------------------------------ |
| Block                            | ON          | ON               | Countし，その後Blockが実行する．そのため，その後のルールは検証せずに終了する． |
| Block                            | ON          | OFF              | Countのみが実行される．そのため，その後のルールも検証する．  |
| Block                            | OFF         | ON               | そもそもCountモードが無効なため，上書きオプションは機能せずに，Blockが実行される． |
| Block                            | OFF         | OFF              | そもそもCountモードが無効なため，マネージドルールのBlockが実行される（と思っていたが，結果としてCountとして機能する模様）． |

#### ▼ セキュリティグループとの関係

WAFを紐づけられるリソースにセキュリティグループも紐づけている場合，セキュリティグループのルールが先に検証される．例えば，WAFをALBに紐づけ，かつALBのセキュリティグループにHTTPSプロトコルのルールを設定した場合，後者が先に検証される．両方にルールが定義されてると混乱を生むため，HTTPプロトコルやHTTPSプロトコルに関するルールはWAFに定義し，それ以外のプロトコルに関するルールはセキュリティグループで定義するようにしておく．

参考：https://dev.classmethod.jp/articles/waf-alb_evaluation-sequence/

<br>

### マネージドルールを使用するかどうかの判断基準

#### ▼ マネージドルールの動作確認の必要性

マネージドルールを導入する時は，事前にルールのカウント機能を使用することが推奨されている．カウントで検知されたリクエストのほとんどが悪意のないものであれば，設定したマネージドルールの使用をやめる必要がある．

#### ▼ ブラウザを送信元とした場合

ブラウザを送信元とした場合，リクエストのヘッダーやボディはブラウザによって生成されるため，これに基づいた判断が必要である．

- ブラウザからのリクエスト自体が悪意判定されているかどうか
- サイトのURLの記法によって，悪意判定されているかどうか
- 送信元の国名が『日本』であるのにも関わらず，悪意判定されているかどうか
- サイトに送信された全リクエストのうち，カウントで検知されたリクエストの数が多すぎないかどうか

#### ▼ 連携するアプリケーションを送信元とした場合

アプリケーションを送信元とした場合，リクエストのヘッダーやボディは連携するアプリケーションによって生成されるため，これに基づいた判断が必要である．

<br>

### ルールの例

#### ▼ ユーザーエージェント拒否

**＊例＊**

悪意のあるユーザーエージェントを拒否する．

ルール：```block-user-agents```

| Statementの順番 | If a request  | Inspect        | Match type                                   | Regex pattern set | Then  | 挙動                                                         |
| --------------- | ------------- | -------------- | -------------------------------------------- | ----------------- | ----- | ------------------------------------------------------------ |
| ```0```         | ```matches``` | ```URI path``` | ```Matches pattern from regex pattern set``` | 文字列セット      | Block | 指定した文字列を含むユーザーエージェントの場合，アクセスすることを拒否する． |

| Default Action | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| Allow          | 指定したユーザーエージェントでない場合，全てのファイルパスにアクセスすることを許可する． |

#### ▼ CI/CDツールのアクセスを許可

**＊例＊**

社内の送信元IPアドレスのみ許可した状態で，CircleCIなどのサービスが社内サービスにアクセスできるようにする．

ルール：```allow-request-including-access-token```

| Statementの順番 | If a request  | Inspect      | Header field name   | Match type                    | String to match                                     | Then  | 挙動                                                         |
| --------------- | ------------- | ------------ | ------------------- | ----------------------------- | --------------------------------------------------- | ----- | ------------------------------------------------------------ |
| ```0```         | ```matches``` | ```Header``` | ```authorization``` | ```Exactly matched  string``` | 『```Bearer <トークン文字列>```』で文字列を設定する | Allow | authorizationヘッダーに指定した文字列を含むリクエストの場合，アクセスすることを拒否する． |

| Default Action | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| Block          | 正しいトークンを持たないアクセスの場合，全てのファイルパスにアクセスすることを拒否する． |

#### ▼ 特定のファイルパスを社内アクセスに限定

**＊例＊**

アプリケーションでは，特定のURLパスにアクセスできる送信元IPアドレスを社内だけに制限する．二つのルールを構築する必要がある．

ルール：```allow-access--to-url-path```

| Statementの順番 | If a request        | Inspect                                | IP set       | Match type                                   | Regex pattern set | Then  | 挙動                                                         |
| --------------- | ------------------- | -------------------------------------- | ------------ | -------------------------------------------- | ----------------- | ----- | ------------------------------------------------------------ |
| ```0```         | ```matches (AND)``` | ```Originates from an IP address in``` | 社内IPセット | -                                            | -                 | -     | 社内の送信元IPアドレスの場合，指定したファイルパスにアクセスすることを許可する． |
| ```1```         | ```matches```       | ```URI path```                         | -            | ```Matches pattern from regex pattern set``` | 文字列セット      | Allow | 0番目かつ，指定した文字列を含むURLパスアクセスの場合，アクセスすることを許可する． |

ルール：```block-access-to-url-path```

| Statementの順番 | If a request  | Inspect        | Match type                                   | Regex pattern set | Then  | 挙動                                                         |
| --------------- | ------------- | -------------- | -------------------------------------------- | ----------------- | ----- | ------------------------------------------------------------ |
| ```0```         | ```matches``` | ```URI path``` | ```Matches pattern from regex pattern set``` | 文字列セット      | Block | 指定した文字列を含むURLパスアクセスの場合，アクセスすることを拒否する． |

| Default Action | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| Allow          | 指定したURLパス以外のアクセスの場合，そのパスにアクセスすることを許可する． |

#### ▼ 社内アクセスに限定

**＊例＊**

アプリケーション全体にアクセスできる送信元IPアドレスを，特定のIPアドレスだけに制限する．

ルール：```allow-global-ip-addresses```

| Statementの順番 | If a request        | Inspect                                | IP set           | Originating address | Then  | 挙動                                                         |
| --------------- | ------------------- | -------------------------------------- | ---------------- | ------------------- | ----- | ------------------------------------------------------------ |
| ```0```         | ```matches  (OR)``` | ```Originates from an IP address in``` | 社内IPセット     | Source IP address   | -     | 社内の送信元IPアドレスの場合，全てのファイルパスにアクセスすることを許可する． |
| ```1```         | ```matches```       | ```Originates from an IP address in``` | 協力会社IPセット | Source IP address   | Allow | 0番目あるいは，協力会社の送信元IPアドレスの場合，全てのファイルパスにアクセスすることを許可する． |

| Default Action | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| Block          | 指定した送信元IPアドレス以外の場合，全てのファイルパスにアクセスすることを拒否する． |

#### ▼ ALBを直接的に指定することを防ぐ

**＊例＊**

Route53のドメイン経由ではなく，ALBの直接的に指定して，リクエストとを送信することを防ぐ．ALBのIPアドレスは定期的に変化するため，任意のIPアドレスを指定できる正規表現を定義する必要がある．

```
^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$
```

ルール：```block-direct-access-to-lb```

| Statementの順番 | If a request  | Inspect      | Match type                                   | Regex pattern set | Then  | 挙動                                                         |
| --------------- | ------------- | ------------ | -------------------------------------------- | ----------------- | ----- | ------------------------------------------------------------ |
| ```0```         | ```matches``` | ```Header``` | ```Matches pattern from regex pattern set``` | 文字列セット      | Block | 指定した```Host```ヘッダーに対するアクセスの場合，アクセスすることを拒否する． |

| Default Action | 説明                                                         |
| -------------- | ------------------------------------------------------------ |
| Allow          | 指定した```Host```ヘッダー以外に対するアクセスの場合，アクセスすることを許可する． |

<br>

### ログ

#### ▼ マネージドルールのログ

WAFマネージドルールを使用している場合，マネージドルールが```ruleGroupList```キーに配列として格納されている．もし，Countアクションが実行されていれば，```excludedRules```キーにその旨とルールIDが格納される．

```bash
{

  # ～ 中略 ～

  "ruleGroupList": [
    {
      "ruleGroupId": "AWS#AWSManagedRulesCommonRuleSet#Version_1.2",
      "terminatingRule": null,
      "nonTerminatingMatchingRules": [],
      "excludedRules": [
        {
          "exclusionType": "EXCLUDED_AS_COUNT",
          "ruleId": "NoUserAgent_HEADER"
        }
      ]
    },
    {
      "ruleGroupId": "AWS#AWSManagedRulesSQLiRuleSet#Version_1.1",
      "terminatingRule": null,
      "nonTerminatingMatchingRules": [],
      "excludedRules": null
    },
    {
      "ruleGroupId": "AWS#AWSManagedRulesPHPRuleSet#Version_1.1",
      "terminatingRule": null,
      "nonTerminatingMatchingRules": [],
      "excludedRules": null
    },
    {
      "ruleGroupId": "AWS#AWSManagedRulesKnownBadInputsRuleSet#Version_1.1",
      "terminatingRule": null,
      "nonTerminatingMatchingRules": [],
      "excludedRules": null
    }
  ],

  # ～ 中略 ～

}
```



<br>

## 35. WorkMail

### WorkMailとは

Gmail，サンダーバード，Yahooメールなどと同類のメール管理アプリケーション．

<br>

### セットアップ

| 設定項目             | 説明                                                       | 補足                                                         |
| -------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ |
| Users                | WorkMailで管理するユーザーを設定する．                     |                                                              |
| Domains              | ユーザーに割り当てるメールアドレスのドメイン名を設定する． | ```@{組織名}.awsapps.com```をドメイン名としてもらえる．ドメイン名の検証が完了した独自ドメイン名を設定もできる． |
| Access Control rules | 受信するメール，受信を遮断するメール，の条件を設定する．   |                                                              |

<br>

## 36. ロードテスト

### Distributed Load Testing（分散ロードテスト）

#### ▼ 分散ロードテストとは

ロードテストを実行できる．CloudFormationで構築でき，ECS Fargateを使用して，ユーザーからのリクエストを擬似的に再現できる．

参考：https://d1.awsstatic.com/Solutions/ja_JP/distributed-load-testing-on-aws.pdf

#### ▼ インフラ構成

![distributed_load_testing](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/distributed_load_testing.png)

<br>

## 37. タグ

### タグ付け戦略

#### ▼ よくあるタグ

| タグ名      | 用途                                                         |
| ----------- | ------------------------------------------------------------ |
| Name        | リソース自体に名前を付けられない場合，代わりにタグで名付けるため． |
| Environment | 同一のAWS環境内に異なる実行環境が存在している場合，それらを区別するため． |
| User        | 同一のAWS環境内にリソース別に所有者が存在している場合，それらを区別するため． |

#### ▼ タグ付けによる検索

AWSの各リソースには，タグをつけられる．例えば，AWSコストエクスプローラーにて，このタグで検索することにより，任意のタグが付いたリソースの請求合計額を確認できる．

<br>