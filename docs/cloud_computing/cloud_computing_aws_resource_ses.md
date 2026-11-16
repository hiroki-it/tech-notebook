---
title: 【IT技術の知見】Amazon SES
description: Amazon SESの知見を記録しています。
tags:
  - "3大クラウド"
  - "AWS"
  - "AWSリソース"
---

# Amazon SES

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要


### Amazon SES とは

クラウドメールサーバーとして働く。

メール受信をトリガーとして、アクションを実行する。

<br>

## 02. 仕組み

## 03. セットアップ

### Terraformによる構築

DKIM の設定と検証用レコードは SES モジュール、SPF と DMARC のレコードは Route 53 モジュールで作成する。SESv2 のドメイン検証も DKIM レコードで行う。

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
  depends_on = [aws_sesv2_configuration_set.foo]

  configuration_set_name = "foo"
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
  depends_on = [aws_sesv2_configuration_set.foo]

  email_identity         = "example.com"
  configuration_set_name = "foo"
}

module "ses_dkim" {
  source  = "genstackio/ses/aws//modules/global"
  version = "0.3.5"

  depends_on = [aws_sesv2_email_identity.foo]

  domain = "example.com"
  zone   = "Z0123456789EXAMPLE"
}

module "ses_dns_policy" {
  source  = "terraform-aws-modules/route53/aws"
  version = "6.5.1"

  create_zone = false
  name        = "example.com"
  records = {
    # 正当なメール送信元として Amazon SES を指定する
    spf = {
      full_name = "example.com"
      type      = "TXT"
      ttl       = 300
      records   = ["v=spf1 include:amazonses.com ~all"]
    }
    # なりすましメールの処理方法とレポートの送信先を指定する
    dmarc = {
      full_name = "_dmarc.example.com"
      type      = "TXT"
      ttl       = 300
      records   = ["v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@example.com"]
    }
  }
}
```

> - [genstackio/ses/aws//modules/global (0.3.5) - Terraform Registry](https://registry.terraform.io/modules/genstackio/ses/aws/0.3.5/submodules/global)
> - [terraform-aws-modules/route53/aws (6.5.1) - Terraform Registry](https://registry.terraform.io/modules/terraform-aws-modules/route53/aws/6.5.1)

<br>

### リージョンの選択

Amazon SES は連携する AWS リソースと同じリージョンに作成しなければならない。

### Sandbox モードの解除

Amazon SES はデフォルトでは Sandbox モードになっている。

Sandbox モードでは以下の制限がかかっており。

サポートセンターに解除申請が必要である。

<table>
  <thead>
    <tr>
      <th>制限</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>送信制限</td>
      <td>Amazon SES で認証したメールアドレスのみに送信できる。</td>
    </tr>
    <tr>
      <td>受信制限</td>
      <td>1 日に 200 メールのみ受信できる。</td>
    </tr>
  </tbody>
</table>

<br>

## 04. メールの送受信設定

![ses](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloud_computing/ses.png)

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Domain</td>
      <td>Amazon SES のドメイン名を設定する。</td>
      <td>設定したドメイン名には、『<code>10 inbound-smtp.us-east-1.amazonaws.com</code>』という MX レコードタイプの値が紐付く。</td>
    </tr>
    <tr>
      <td>Email Addresses</td>
      <td>宛先として認証するメールアドレスを設定する。設定すると AWS からメールが届くため、指定されたリンクをクリックする。</td>
      <td>Sandbox モードのときだけ動作する。</td>
    </tr>
    <tr>
      <td>Sending Statistics</td>
      <td>Amazon SES で収集したデータをメトリクスで確認できる。</td>
      <td><code>Request Increased Sending Limits</code> のリンクにて、Sandbox モードの解除を申請できる。</td>
    </tr>
    <tr>
      <td>SMTP Settings</td>
      <td>SMTP-AUTH の接続情報を確認できる。</td>
      <td>アプリケーションの <code>25</code> 番ポートは送信制限があるため、<code>465</code> 番ポートを使用する。これに合わせて、Amazon SES も受信で <code>465</code> 番ポートを使用する。</td>
    </tr>
    <tr>
      <td>Rule Sets</td>
      <td>メールの受信したトリガーとして実行するアクションを設定できる。</td>
      <td></td>
    </tr>
    <tr>
      <td>IP Address Filters</td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>

## 05. メール受信ルール

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Recipiet</td>
      <td>受信したメールアドレスで、何の宛先のときにこれを許可するかを設定する。</td>
    </tr>
    <tr>
      <td>Actions</td>
      <td>受信を許可した後に、これをトリガーとして実行するアクションを設定する。</td>
    </tr>
  </tbody>
</table>

<br>

## 06. メール送信イベントと通知

### イベントの種類

#### ▼ 送信

SMTP サーバー側が受信を受諾したイベントである。

#### ▼ バウンス

SMTP サーバー側が受信を失敗したイベントである。

#### ▼ 苦情

受信側がメールアドレスを迷惑メール報告したイベントである。

<br>

### 通知

#### ▼ フィードバック通知

ID にフィードバック通知を紐づける。

イベントが発生したら、SNS にイベントを転送する。

```
SES ---> SNS ---> Lambda ---> Slack
```

#### ▼ 設定セットによるイベント通知

ID に設定セットを紐づける。

イベントが発生したら、CloudWatch でメトリクスとして集約し、SNS にイベントを転送する。

```
SES ---> CloudWatch ---> SNS ---> Lambda ---> Slack
```

<br>

## 07. SMTP 認証

### AWS における SMTP-AUTH の仕組み

一般的な SMTP-AUTH では、クライアントアカウントの認証が必要である。同様にして、AWS でもこれが必要であり、IAM ユーザーを使用してこれを実現する。

送信元となるアプリケーションに IAM ユーザーを紐付け、この IAM ユーザーにはユーザー名とパスワードを設定する。

アプリケーションが Amazon SES を経由してメールを送信するとき、Amazon SES はユーザー名とパスワードを使用してアプリケーションを認証する。

ユーザー名とパスワードは後から確認できないため、メモしておくこと。

<br>

## 08. スパム判定への対処

特定の送信元 IP から大量のメールを送信すると、スパムな IP アドレスであると自動的に判定されてしまうことがある。

Amazon SES の IP アドレスも例外ではなく、スパムとして判定されてしまうことがある。

一度スパムとして判定されてしまうと、その AWS アカウントの Amazon SES をしばらく使用できなくなってしまう。

その対策として、メインの Amazon SES (特に本番環境) がスパム判定された場合の予備として、Amazon SES のみを持つ AWS アカウント (本番環境 Amazon SES) を追加で作成しておくとよい。

<br>
