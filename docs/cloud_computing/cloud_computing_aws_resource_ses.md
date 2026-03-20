---
title: 【IT技術の知見】SES＠AWSリソース
description: SES＠AWSリソースの知見を記録しています。
---

# SES＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. SES：Simple Email Service

### SESとは

クラウドメールサーバーとして働く。

メール受信をトリガーとして、アクションを実行する。

<br>

## 02. セットアップ (コンソールの場合)

### 設定項目と説明

![SESとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/SESとは.png)

| 設定項目           | 説明                                                                                                            | 補足                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Domain             | SESのドメイン名を設定する。                                                                                     | 設定したドメイン名には、『`10 inbound-smtp.us-east-1.amazonaws.com`』というMXレコードタイプの値が紐付く。                              |
| Email Addresses    | 宛先として認証するメールアドレスを設定する。設定するとAWSからメールが届くため、指定されたリンクをクリックする。 | Sandboxモードの時だけ動作する。                                                                                                        |
| Sending Statistics | AWS SESで収集したデータをメトリクスで確認できる。                                                               | `Request Increased Sending Limits` のリンクにて、Sandboxモードの解除を申請できる。                                                     |
| SMTP Settings      | SMTP-AUTHの接続情報を確認できる。                                                                               | アプリケーションの `25` 番ポートは送信制限があるため、`465` 番ポートを使用する。これに合わせて、SESも受信で `465` 番ポートを使用する。 |
| Rule Sets          | メールの受信したトリガーとして実行するアクションを設定できる。                                                  |                                                                                                                                        |
| IP Address Filters |                                                                                                                 |                                                                                                                                        |

### Rule Sets

| 設定項目 | 説明                                                                   |
| -------- | ---------------------------------------------------------------------- |
| Recipiet | 受信したメールアドレスで、何の宛先の時にこれを許可するかを設定する。   |
| Actions  | 受信を許可した後に、これをトリガーとして実行するアクションを設定する。 |

<br>

## 03. セットアップ (Terraformの場合)

```terraform
resource "aws_sesv2_configuration_set" "foo" {
  configuration_set_name = "foo"

  delivery_options {
    tls_policy = "REQUIRE"
  }

  reputation_options {
    reputation_metrics_enabled = true
  }

  sending_options {
    sending_enabled = true
  }
}

resource "aws_sesv2_configuration_set_event_destination" "cloudwatch_foo" {
  configuration_set_name = aws_sesv2_configuration_set.foo.configuration_set_name
  event_destination_name = "foo"

  # SESのイベントをCloudWatchに送信する
  event_destination {
    cloud_watch_destination {
      dimension_configuration {
        default_dimension_value = "default"
        dimension_name          = "ses:configuration-set"
        dimension_value_source  = "MESSAGE_TAG"
      }
    }

    enabled = true
    matching_event_types = [
      # SESから外部メールサーバーへの送信に失敗した場合
      "BOUNCE",
      # SESへの送信に失敗した場合
      "REJECT",
    ]
  }
}

resource "aws_sesv2_email_identity" "foo" {
  email_identity         = var.ses_foo_domain_identity
  configuration_set_name = aws_sesv2_configuration_set.foo.configuration_set_name
}

resource "aws_ses_domain_identity" "foo" {
  domain = aws_sesv2_email_identity.foo.email_identity
}

# Route53のDKIMレコードで使用するためのドメイン
resource "aws_ses_domain_dkim" "foo" {
  domain = aws_sesv2_email_identity.foo.email_identity
}

# TXTレコード
# メールアドレスのドメインの所有者であることを証明する
resource "aws_route53_record" "ses_verification_foo" {
  zone_id = "********"
  name    = "_amazonses.${var.ses_foo_domain_identity}"
  type    = "TXT"
  ttl     = 300
  records = [aws_ses_domain_identity.foo.verification_token]
}

# DKIMレコード
# 送信メールにDKIM署名を付与することで、受信側でドメインなりすましを防止し、またスパムとして誤判定されるリスクを減らす
resource "aws_route53_record" "ses_dkim_foo" {
  count   = var.ses_foo_domain_identity != "" ? 3 : 0
  zone_id = "********"
  name    = "${aws_ses_domain_dkim.foo.dkim_tokens[count.index]}._domainkey.${var.ses_foo_domain_identity}"
  type    = "CNAME"
  ttl     = 300
  records = ["${aws_ses_domain_dkim.foo.dkim_tokens[count.index]}.dkim.amazonses.com"]
}

# SPFレコード
# メールアドレスのドメインから送信されるメールがAmazon SESからの送信であることを受信側に示すことで、正当な送信元として識別させる
resource "aws_route53_record" "ses_spf_foo" {
  zone_id = "********"
  name    = var.ses_foo_domain_identity
  type    = "TXT"
  ttl     = 300
  records = ["v=spf1 include:amazonses.com ~all"]
}

# DMARCレコード
# なりすましメールをどのように処理するかを受信側に伝えることで、ドメインを保護し、またスパムとして誤判定されるリスクを減らす
resource "aws_route53_record" "ses_dmarc_foo" {
  zone_id = "********"
  name    = "_dmarc.${var.ses_foo_domain_identity}"
  type    = "TXT"
  ttl     = 300
  records = ["v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@${var.ses_foo_domain_identity}"]
}
```

<br>

## 04. 仕様上の制約

### 作成リージョンの制約

SESは連携するAWSリソースと同じリージョンに作成しなければならない。

### Sandboxモードの解除

SESはデフォルトではSandboxモードになっている。

Sandboxモードでは以下の制限がかかっており。

サポートセンターに解除申請が必要である。

| 制限     | 説明                                          |
| -------- | --------------------------------------------- |
| 送信制限 | SESで認証したメールアドレスのみに送信できる。 |
| 受信制限 | 1日に200メールのみ受信できる。                |

<br>

## 05. メール送信イベントと通知

### イベントの種類

#### ▼ 送信

SMTPサーバー側が受信を受諾したイベントである。

#### ▼ バウンス

SMTPサーバー側が受信を失敗したイベントである。

#### ▼ 苦情

受信側がメールアドレスを迷惑メール報告したイベントである。

<br>

### 通知

#### ▼ フィードバック通知

IDにフィードバック通知を紐づける。

イベントが発生したら、SNSにイベントを転送する。

```
SES ---> SNS ---> Lambda ---> Slack
```

#### ▼ 設定セットによるイベント通知

IDに設定セットを紐づける。

イベントが発生したら、CloudWatchでメトリクスとして集約し、SNSにイベントを転送する。

```
SES ---> CloudWatch ---> SNS ---> Lambda ---> Slack
```

<br>

## 06. SMTP-AUTH

### AWSにおけるSMTP-AUTHの仕組み

一般的なSMTP-AUTHでは、クライアントアカウントの認証が必要である。同様にして、AWSでもこれが必要であり、IAMユーザーを使用してこれを実現する。

送信元となるアプリケーションにIAMユーザーを紐付け、このIAMユーザーにはユーザー名とパスワードを設定する。

アプリケーションがSESを経由してメールを送信するとき、アプリケーションに対して、SESがユーザー名とパスワードを使用した認証する。

ユーザー名とパスワードは後から確認できないため、メモしておくこと。SMTP-AUTHの仕組みについては、以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/network/network_model_tcp.html

<br>

## 07. スパム対策用

特定の送信元IPから大量のメールを送信すると、スパムなIPアドレスであると自動的に判定されてしまうことがある。

SESのIPアドレスも例外ではなく、スパムとして判定されてしまうことがある。

一度スパムとして判定されてしまうと、そのAWSアカウントのSESをしばらく使用できなくなってしまう。

これの対策として、メインのSES (特に本番環境) がスパム判定された場合の予備として、SESのみを持つAWSアカウント (本番環境SES) を追加で作成しておくとよい。

<br>
