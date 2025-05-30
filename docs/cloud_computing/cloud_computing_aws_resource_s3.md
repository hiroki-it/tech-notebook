---
title: 【IT技術の知見】AWS S3＠AWSリソース
description: AWS S3＠AWSリソースの知見を記録しています。
---

# AWS S3＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS S3とは：Simple Storage Service

クラウドオブジェクトストレージとして働く。

<br>

## 02. セットアップ

### コンソール画面の場合

| 設定項目             | 説明                       |
| -------------------- | -------------------------- |
| バケット             | バケットに関して設定する。 |
| バッチオペレーション |                            |
| アクセスアナライザー |                            |

<br>

### プロパティ

特にプロパティには、以下の項目がある。

| 設定項目                     | 説明                                                                                                                                                                    | 補足                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| バージョニング               | ファイルのバージョン管理を行う。ファイルの変更や削除が行われた場合、過去の状態を履歴として残しておける。                                                                | もし旧バージョンにロールバックしたい場合、それより新バージョンのファイルを削除すると良い。バージョンが繰り上がり、旧バージョンのファイルが最新版になる。                                                                                                                                                                                |
| サーバーアクセスのログ記録   |                                                                                                                                                                         |                                                                                                                                                                                                                                                                                                                                         |
| 静的サイトホスティング       |                                                                                                                                                                         |                                                                                                                                                                                                                                                                                                                                         |
| オブジェクトレベルのログ記録 |                                                                                                                                                                         |                                                                                                                                                                                                                                                                                                                                         |
| デフォルト暗号化             | AWS S3バケットに保管するファイルの暗号化方法を設定する。AWS S3マネージド暗号化キー (`***-S3`) 、AWS KMS (`***-KMS`) 、ユーザー定義の暗号化キー (`***-C`) を使用できる。 | サーバーサイド暗号化 (SSE-AWS S3、SSE-AWS KMS、SSE-C) と クライアントサイド暗号化 (CSE-AWS KMS、CSE-C) があり。オススメはサーバーサイド暗号化であり、AWS S3バケットにファイルをアップロードするタイミングでこれを暗号化する。また一方で、ダウンロード時にファイルを復号する。<br>・https://zenn.dev/amarelo_n24/articles/3d252c27cfb98e |
| オブジェクトのロック         |                                                                                                                                                                         |                                                                                                                                                                                                                                                                                                                                         |
| Transfer acceleration        |                                                                                                                                                                         |                                                                                                                                                                                                                                                                                                                                         |
| イベント                     |                                                                                                                                                                         |                                                                                                                                                                                                                                                                                                                                         |
| リクエスタ支払い             |                                                                                                                                                                         |                                                                                                                                                                                                                                                                                                                                         |

<br>

### リクエスト制限

特にリクエスト制限には、以下の項目がある。

| 設定項目                   | 説明                                                                                                           | 補足                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ブロックパブリックアクセス | パブリックネットワークがAWS S3にリクエストを送信する時の許否を設定する。                                       | ・ブロックパブリックアクセスを無効にすると、項目ごとの方法 (ACL、バケットポリシー、アクセスポイントポリシー) によるアクセスが許可される。もし他のAWSリソースからのリクエストを許可する場合は、ブロックパブリックアクセスを無効化した上でバケットポリシーに許可対象を定義するか、あるいはブロックパブリックアクセスでは拒否できないIAMポリシーをAWSリソースに設定する。<br>・ブロックパブリックアクセスを全て有効化すると、パブリックネットワークからの全アクセスを遮断できる。<br>・特定のオブジェクトで、アクセスコントロールリストを制限した場合、そのオブジェクトだけはパブリックアクセスにならない。 |
| バケットポリシー           | IAMユーザー (クロスアカウントも可) またはAWSリソースがAWS S3へにリクエストを送信するためのポリシーで管理する。 | ・IAMポリシーとアクセスコントロールリストの両方が設定されている場合には、IAMポリシーが勝つ。<br>・https://dev.classmethod.jp/articles/s3-acl-wakewakame/ <br>・ブロックパブリックアクセスを無効にしたうえで、IAMユーザー (クロスアカウントも可) やAWSリソースがS3にリクエストを送信するために必要である。ただし代わりに、IAMポリシーをAWSリソースに紐付けることによりも、アクセスを許可できる。<br>・https://awesome-linus.com/2020/02/04/s3-bucket-public-access/ <br>・ポリシーを紐付けできないAWS CloudFrontやAWS ALBなどでは、自身へのアクセスログを作成するために必須である。                       |
| アクセスコントロールリスト | IAMユーザー (クロスアカウントも可) がS3にリクエストを送信する時の許否を設定する。                              | ・バケットポリシーと機能が重複する。<br>・IAMポリシーとアクセスコントロールリストの両方が設定されている場合には、IAMポリシーが勝つ。<br>・https://dev.classmethod.jp/articles/s3-acl-wakewakame/ <br>・仮にバケット自体のブロックパブリックアクセスを無効化したとしても、特定のオブジェクトでアクセスコントロールリストを制限した場合、そのオブジェクトだけはパブリックアクセスにならない。                                                                                                                                                                                                              |
| CORSの設定                 |                                                                                                                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

<br>

### レスポンスヘッダー

#### ▼ レスポンスヘッダーの設定

| 設定できるヘッダー              | 説明                                                                                                             | 補足                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| ETag                            | コンテンツの一意な識別子。クライアントサイドキャッシュの検証に使用される。                                       | 全てのコンテンツにデフォルトで設定されている。 |
| Cache-Control                   | Expiresと同様に、ブラウザにおけるキャッシュの有効期限を設定する。                                                | 全てのコンテンツにデフォルトで設定されている。 |
| Content-Type                    | コンテンツのMIMEタイプを設定する。                                                                               | 全てのコンテンツにデフォルトで設定されている。 |
| Expires                         | Cache-Controlと同様に、ブラウザにおけるキャッシュの有効期限を設定する。ただし、Cache-Controlの方が優先度が高い。 |                                                |
| Content-Disposition             |                                                                                                                  |                                                |
| Content-Encoding                |                                                                                                                  |                                                |
| x-amz-website-redirect-location | コンテンツのリダイレクト先を設定する。                                                                           |                                                |

<br>

### バケットポリシーの例

#### ▼ AWS S3のARNについて

ポリシーでは、AWS S3のARNでは、『`arn:aws:s3:::<バケット名>/*`』のように、最後にバックスラッシュアスタリスクが必要。

#### ▼ AWS ALBのアクセスログの保管を許可

パブリックアクセスが無効化されたAWS S3に対して、AWS ALBへのアクセスログを保管したい場合、バケットポリシーを設定する必要がある。

バケットポリシーには、AWS ALBからAWS S3へのログ書き込み認可スコープを実装する。『`"AWS": "arn:aws:iam::582318560864:root"`』では、`582318560864`はAWS ALBアカウントIDと呼ばれ、リージョンごとに値が決まっている。

これは、東京リージョンのアカウントIDである。

**＊実装例＊**

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Principal": {"AWS": "arn:aws:iam::582318560864:root"},
        "Action": "s3:PutObject",
        "Resource": "arn:aws:s3:::<バケット名>/*",
      },
    ],
}
```

> - https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html#access-logging-bucket-permissions

#### ▼ AWS CloudFrontのファイル読み出しを許可

パブリックアクセスが無効化されたAWS S3に対して、AWS CloudFrontからのルーティングで静的ファイルを読み出したい場合、バケットポリシーでAWS CloudFrontの識別情報を設定する必要がある。

補足として2022/08/31時点で、オリジンアクセスアイデンティティを識別情報として使用する方法は非推奨になり、オリジンアクセスコントロールが推奨になった。

**＊実装例＊**

```yaml
{
  "Version": "2008-10-17",
  "Id": "PolicyForCloudFrontPrivateContent",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Principal":
          {
            "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity <オリジンアクセスアイデンティティのID番号>",
          },
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::<バケット名>/*",
      },
    ],
}
```

> - https://dev.classmethod.jp/articles/amazon-cloudfront-origin-access-control/

#### ▼ AWS CloudFrontのアクセスログの保管を許可

執筆時点 (2020/10/08) では、パブリックアクセスが無効化されたAWS S3に対して、AWS CloudFrontへのアクセスログを保管できない。

よって、危険ではあるが、パブリックアクセスを有効化する必要がある。

```bash
# ポリシーは不要
```

#### ▼ AWS Lambdaからのリクエストを許可

バケットポリシーは不要である。

代わりに、AWS管理ポリシーの『`AWSLambdaExecute`』が紐付けられたロールをAWS Lambdaに紐付ける必要がある。

このポリシーには、AWS S3への認可スコープの他、AWS CloudWatch Logsにログを作成するための認可スコープが設定されている。

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Action": ["logs:*"],
        "Resource": "arn:aws:logs:*:*:*",
      },
      {
        "Effect": "Allow",
        "Action": ["s3:GetObject", "s3:PutObject"],
        "Resource": "arn:aws:s3:::*",
      },
    ],
}
```

#### ▼ 特定のIPアドレスからのリクエストを許可

パブリックネットワーク上の特定のIPアドレスからのリクエストを許可したい場合、そのIPアドレスをポリシーに設定する必要がある。

```yaml
{
  "Version": "2012-10-17",
  "Id": "S3PolicyId1",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::<バケット名>/*",
        "Condition": {"IpAddress": {"aws:SourceIp": "*.*.*.*/32"}},
      },
    ],
}
```

<br>

### CORSの突破

#### ▼ CORSについて

ブラウザではデフォルトでCORSが有効になっており、正しいリクエストがCORSを突破できるように対処する必要がある。

ドメインを割り当ててAWS S3バケットを公開する場合、クライアント側 (例：AWS API Gatewayを介したブラウザ) とサーバー側のAWS S3ドメインが異なる。

そのため、ブラウザのCORSでAWS S3への通信が防御されてしまう。

これを突破できるように、対処する必要がある。

#### ▼ Access-Control-Allow-Originヘッダー

サーバー側のAWS S3では、`Access-Control-Allow-Origin`ヘッダーに必要な値を設定して返却する。

クライアント側 (例：AWS API Gatewayを介したブラウザ) では`Origin`ヘッダーは、デフォルトで『プロトコル + ドメイン + ポート番号』に設定されるため、特に対処する必要はない。

```yaml
# 任意のドメインを許可する
[{"AllowedOrigins": ["*"]}]
```

```yaml
# 特定のドメインを許可する
[{"AllowedOrigins": ["https://example.jp"]}]
```

> - https://docs.aws.amazon.com/AmazonS3/latest/userguide/ManageCorsUsing.html#cors-allowed-origin

<br>

### 署名付きURL

#### ▼ 署名付きURLとは

認証/認可情報をパラメーターに持つURLのこと。

AWS S3では、署名付きURLを発行し、AWS S3への認可スコープを外部のユーザーに一時的に付与する。

> - https://atmarkit.itmedia.co.jp/ait/articles/2107/15/news009.html

<br>
