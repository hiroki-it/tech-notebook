---
title: 【IT技術の知見】Cで始まるAWSリソース＠AWS
description: Cで始まるAWSリソース＠AWSの知見を記録しています。
---

# ```C```で始まるAWSリソース＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Certificate Manager

### セットアップ

#### ▼ コンソール画面

| 設定項目  | 説明                       |
|----------|--------------------------|
| ドメイン名    | 認証をリクエストするドメイン名を設定する。 |
| 検証の方法 | DNS検証かEメール検証かを設定する。  |

<br>

### 認証局

認証局であるATSによって認証されたSSL証明書を管理できる。



| サーバー提供者 | 名前                      |
|---------|---------------------------|
| 中間認証局 | ATS：Amazon Trust Services |
| ルート認証局  | Starfield社               |

<br>

### SSL証明書の検証方法

#### ▼ ドメイン検証

ドメインのSSL証明書を発行するためには、そのドメインの所有者であることを証明する必要がある。

ドメインを購入できるサービス (例：AWS、GCP、GMO) に検証方法が用意されている。



> ↪️ 参考：
>
> - https://docs.aws.amazon.com/acm/latest/userguide/domain-ownership-validation.html
> - https://jp.globalsign.com/support/proceeding/147.html

#### ▼ DNS検証

CMによってRoute53に自動作成されるCNAMEレコード値を使用して、ドメインの所有者であることを証明する。

証明書が失効しそうになった時に、CNAMEレコード値が照合され、CMが証明書を再発行してくれる。

注意点として、ドメインをAWS以外 (例：お名前ドットコム) で購入している場合は、NSレコード値を購入先のサービスのドメインレジストラに手作業で登録する必要があることに注意する。



> ↪️ 参考：
>
> - https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html
> - https://dev.classmethod.jp/articles/route53-domain-onamae/

#### ▼ Eメール検証

ドメインの所有者にメールを送信し、これを承認することにより所有者であることを証明する。

ドメインをAWS以外 (例：お名前ドットコム) で購入している場合は、そちらで設定したメールアドレス宛に確認メールを送信する。



> ↪️ 参考：https://docs.aws.amazon.com/acm/latest/userguide/email-validation.html

#### ▼ 検証方法の変更

既存のSSL証明書の検証方法は変更できない。

そのため、検証方法を変更した証明書を新しく発行し、これを紐づける必要がある。

古い証明書は削除しておく。



> ↪️ 参考：https://aws.amazon.com/jp/premiumsupport/knowledge-center/switch-acm-certificate/

<br>

### SSL証明書

#### ▼ セキュリティポリシー

許可するプロトコルを定義したルールこと。

SSL/TLSプロトコルを許可しており、対応できるバージョンが異なるため、ブラウザがそのバージョンのSSL/TLSプロトコルを使用できるかを認識しておく必要がある。



| バージョン            | Policy-2016-08 | Policy-TLS-1-1 | Policy-TLS-1-2 |
|------------------|:--------------:|:--------------:|:--------------:|
| Protocol-TLSv1   |       〇        |       ✕        |       ✕        |
| Protocol-TLSv1.1 |       〇        |       〇        |       ✕        |
| Protocol-TLSv1.2 |       〇        |       〇        |       〇        |

#### ▼ SSL証明書の種類

DNS検証またはEメール検証によって、ドメインの所有者であることが証明されると、発行される。

SSL証明書は、PKIによる公開鍵検証に使用される。



| 証明書の種類   | 説明                           |
|------------|------------------------------|
| ワイルドカード証明書 | 証明するドメイン名にワイルドカードを使用したもの。 |

#### ▼ SSL証明書の設置場所パターン

AWSの使用上、ACMのSSL証明書を設置できないAWSリソースに対しては、外部のSSL証明書を手に入れて設置する。

HTTPSによるSSLプロトコルを受け付けるネットワークの最終地点のことを、SSLターミネーションという。



| パターン<br> (Route53には必ず設置)                                      | SSLターミネーション<br> (HTTPSの最終地点) | 補足                                                                                                                                                   |
|---------------------------------------------------------------|----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| Route53 → ALB(+ACMのSSL証明書) → EC2                              | ALB                              |                                                                                                                                                        |
| Route53 → CloudFront(+ACMのSSL証明書) → ALB(+ACMのSSL証明書) → EC2 | ALB                              | CloudFrontはバージニア北部で、またALBは東京リージョンで、証明書を作成する必要がある。CloudFrontに送信されたHTTPSリクエストをALBにルーティングするために、両方に紐付ける証明書で承認するドメインは、一致させる必要がある。 |
| Route53 → CloudFront(+ACMのSSL証明書) → EC2                       | CloudFront                       |                                                                                                                                                        |
| Route53 → CloudFront(+ACMのSSL証明書) → S3                        | CloudFront                       |                                                                                                                                                        |
| Route53 → ALB(+ACMのSSL証明書) → EC2(+外部証明書)                 | EC2                              |                                                                                                                                                        |
| Route53 → NLB → EC2(+外部証明書)                                 | EC2                              |                                                                                                                                                        |
| Route53 → EC2(+外部証明書)                                       | EC2                              |                                                                                                                                                        |
| Route53 → Lightsail(+ACMのSSL証明書)                              | Lightsail                        |                                                                                                                                                        |

<br>

### SSL証明書の変更

#### ▼ SSL証明書の確認

Chromeを例に挙げると、SSL証明書はURLの鍵マークから確認できる。



**＊例＊**

CircleCIのサイトは、SSL証明書のためにACMを使用している。



![ssl_certificate_chrome](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ssl_certificate_chrome.png)

#### ▼ ダウンタイム

ALBではSSL証明書の変更でダウンタイムは発生しない。

既存のセッションを維持しつつ、新しいSSL証明書が適用される。

CloudFrontは謎...

> ↪️ 参考：https://aws.typepad.com/sajp/2014/04/elb-ssl.html

<br>

## 02. Chatbot

### Chatbotとは

SNSを経由して、CloudWatchからの通知をチャットアプリケーションに転送するAWSリソース。



![ChatbotとSNSの連携](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ChatbotとSNSの連携.png)

<br>

### セットアップ

#### ▼ slack通知の場合

クライアントをSlackとした場合の設定を以下に示す。



| 設定項目   | 説明                                     |
|------------|----------------------------------------|
| Slackチャンネル | 通知の転送先のSlackチャンネルを設定する。           |
| アクセス許可   | SNSを介して、CloudWatchにアクセスするためのロールを設定する。 |
| SNSトピック    | CloudWatchへのアクセス時経由する、SNSトピックを設定する。 |

#### ▼ サポート対象のイベント

AWSリソースのイベントを、EventBridge (CloudWatchイベント) を使用して、Chatbotに転送できるが、全てのAWSリソースをサポートしているわけではない。

サポート対象のAWSリソースは以下のリンクを参考にせよ。



> ↪️ 参考：https://docs.aws.amazon.com/chatbot/latest/adminguide/related-services.html#cloudwatchevents

#### ▼ インシデント

４大シグナルを含む、システム的に良くない事象のこと。



#### ▼ オンコール

インシデントを通知するようにし、通知を受けて対応すること。



<br>



## 03. CloudTrail

### CloudTrailとは

IAMユーザーによる操作や、ロールの紐付けの履歴を記録し、ログファイルとしてS3に転送する。

CloudWatchと連携もできる。



![CloudTrailとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/CloudTrailとは.jpeg)

<br>



## 04. ControlTower

### ControlTowerとは

複数のAWSアカウントとIAMグループを```1```個のダッシュボードで管理する。

既存のアカウントをControlTowerに移行する場合、既存のアカウントで作成されたIAMユーザーとIAMグループが不要になるため、これらを削除する必要がある。



<br>
