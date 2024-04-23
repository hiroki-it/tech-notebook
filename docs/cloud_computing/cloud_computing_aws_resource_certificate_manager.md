---
title: 【IT技術の知見】Certificate Manager＠AWSリソース
description: Certificate Manager＠AWSリソースを記録しています。
---

# Certificate Manager＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Certificate Managerとは

記入中...

<br>

## 02. セットアップ

### ドメイン名

認証をリクエストするドメイン名を設定する。

<br>

### 検証の方法

DNS検証かEメール検証かを設定する。

<br>

## 03. 認証局

### AWS認証局とは

認証局であるATSによって認証済みのSSL証明書を管理できる。

| サーバー提供者 | 名前                       |
| -------------- | -------------------------- |
| 中間認証局     | ATS：Amazon Trust Services |
| ルート認証局   | Starfield社                |

<br>

## 04. SSL証明書の検証方法

### ドメイン検証

#### ▼ ドメイン検証とは

ドメインのSSL証明書を発行するためには、そのドメインの所有者であることを証明する必要がある。

ドメインを購入できるサービス (例：AWS、GCP、GMO) に検証方法が用意されている。

> - https://docs.aws.amazon.com/acm/latest/userguide/domain-ownership-validation.html
> - https://jp.globalsign.com/support/proceeding/147.html

#### ▼ 検証方法の変更

既存のSSL証明書の検証方法は変更できない。

そのため、検証方法を変更した証明書を新しく発行し、これを紐付ける必要がある。

古い証明書は削除しておく。

> - https://aws.amazon.com/jp/premiumsupport/knowledge-center/switch-acm-certificate/

<br>

### DNS検証

CMによってRoute53に自動作成されるCNAMEレコード値を使用して、ドメインの所有者であることを証明する。

証明書が失効しそうになった時に、CNAMEレコード値が照合され、CMが証明書を再発行してくれる。

注意点として、ドメインをAWS以外 (例：お名前ドットコム) で購入している場合は、NSレコード値を購入先のサービスのドメインレジストラに手作業で登録する必要があることに注意する。

> - https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html
> - https://dev.classmethod.jp/articles/route53-domain-onamae/

### Eメール検証

ドメインの所有者にメールを送信し、これを承認することにより所有者であることを証明する。

ドメインをAWS以外 (例：お名前ドットコム) で購入している場合は、そちらで設定したメールアドレス宛に確認メールを送信する。

> - https://docs.aws.amazon.com/acm/latest/userguide/email-validation.html

<br>

## 05. SSL証明書

### セキュリティポリシー

許可するプロトコルを定義したルールこと。

SSL/TLSプロトコルを許可しており、対応できるバージョンが異なるため、ブラウザがそのバージョンのSSL/TLSプロトコルを使用できるかを認識しておく必要がある。

| バージョン       | Policy-2016-08 | Policy-TLS-1-1 | Policy-TLS-1-2 |
| ---------------- | :------------: | :------------: | :------------: |
| Protocol-TLSv1   |       〇       |       ✕        |       ✕        |
| Protocol-TLSv1.1 |       〇       |       〇       |       ✕        |
| Protocol-TLSv1.2 |       〇       |       〇       |       〇       |

<br>

### SSL証明書の種類

DNS検証またはEメール検証によって、ドメインの所有者であることが証明されると、発行される。

SSL証明書は、PKIによる公開鍵検証に使用される。

| 証明書の種類         | 説明                                               |
| -------------------- | -------------------------------------------------- |
| ワイルドカード証明書 | 証明するドメイン名にワイルドカードを使用したもの。 |

<br>

### SSL証明書の配置場所パターン

#### ▼ SSL終端

HTTPSによるSSLプロトコルを受け付けるネットワークの最終地点のことを、SSL終端という。

SSL証明書の配置場所は、SSL終端をどこにするかで決める。

AWSの使用上、ACMのSSL証明書を配置できないAWSリソースに対しては、外部のSSL証明書を手に入れて配置する。

トレードオフとして、パケットペイロードの暗号化処理は通信速度が低下させる。

そのため、パブリックネットワークと信頼できるネットワーク (例：データセンター、プライベートネットワーク、など) の境界をSSL終端とすることが多い。

> - https://serverfault.com/a/1126428
> - https://www.reddit.com/r/aws/comments/aidrfn/comment/eenbc60/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button

#### ▼ Route53 ➡︎ ALB、NLB、の場合

ALBでSSL終端とする場合、EC2にSSL証明書は不要である。

EC2でSSL終端とする場合、EC2にAWS以外で作成したSSL証明書を配置する。

| パターン<br>(Route53には必ず配置)                                   | SSL終端<br>(HTTPSの最終地点) |
| ------------------------------------------------------------------- | ---------------------------- |
| Route53 ➡︎ ALB (ACMのSSL証明書) ➡︎ EC2                            | ALB                          |
| Route53 ➡︎ ALB (ACMのSSL証明書) ➡︎ EC2 (AWS以外のSSL証明書)       | EC2                          |
| Route53 ➡︎ ALB (ACMのSSL証明書) ➡︎ Lightsail (AWS以外のSSL証明書) | Lightsail                    |
| Route53 ➡︎ NLB (ACMのSSL証明書) ➡︎ EC2 (AWS以外のSSL証明書)       | EC2                          |

> - https://dev.classmethod.jp/articles/alb-backend-https/#toc-1

#### ▼ Route53 ➡︎ LB コントローラー由来) の場合

AWSリソースにはACMのSSL証明書を紐づけられるが、KubernetesリソースにはAWS以外のSSL証明書 (Let’s Encrypt、CertManager、Istio) しか紐づけられない。

| パターン<br>(Route53には必ず配置)                                                    | SSL終端<br>(HTTPSの最終地点) |
| ------------------------------------------------------------------------------------ | ---------------------------- |
| Route53 ➡︎ LBコントローラー (ACMのSSL証明書) ➡︎︎ Service / Pod                     | ALB                          |
| Route53 ➡︎ LBコントローラー (ACMのSSL証明書) ➡︎ Service / Pod                      | Ingressコントローラー        |
| Route53 ➡︎ LBコントローラー (ACMのSSL証明書) ➡︎ Service / Pod (AWS以外のSSL証明書) | Pod                          |

> - https://aws.amazon.com/blogs/security/tls-enabled-kubernetes-clusters-with-acm-private-ca-and-amazon-eks-2/
> - https://aws.amazon.com/blogs/containers/setting-up-end-to-end-tls-encryption-on-amazon-eks-with-the-new-aws-load-balancer-controller/

#### ▼ Route53 ➡︎ CloudFrontの場合

CloudFrontからALBにHTTPSリクエストを送信する場合、それぞれにSSL証明書を配置する必要がある。

ただ、CloudForntはバージニア北部で、またALBは東京リージョンで証明書を作成する必要がある。

CloudFrontに送信されたHTTPSリクエストをALBにルーティングするために、両方に紐付ける証明書で承認するドメインは、一致させる必要がある。

| パターン<br>(Route53には必ず配置)                                       | SSL終端<br>(HTTPSの最終地点) |
| ----------------------------------------------------------------------- | ---------------------------- |
| Route53 ➡︎ CloudFront (ACMのSSL証明書) ➡︎ ALB(ACMのSSL証明書) ➡︎ EC2 | ALB                          |
| Route53 ➡︎ CloudFront (ACMのSSL証明書) ➡︎ EC2                         | CloudFront                   |
| Route53 ➡︎ CloudFront (ACMのSSL証明書) ➡︎ S3                          | CloudFront                   |

#### ▼ Route53 ➡︎ EC2、Lightsail、の場合

Route53でSSL終端とする場合、EC2にSSL証明書は不要である。

EC2でSSL終端とする場合、EC2にAWS以外で作成したSSL証明書を配置する。

| パターン<br>(Route53には必ず配置)      | SSL終端<br>(HTTPSの最終地点) |
| -------------------------------------- | ---------------------------- |
|                                        |
| Route53 ➡︎ EC2 (AWS以外のSSL証明書)   | EC2                          |
| Route53 ➡︎ Lightsail (ACMのSSL証明書) | Lightsail                    |
| Route53 ➡︎ Lightsail (ACMのSSL証明書) | Lightsail                    |

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

> - https://aws.typepad.com/sajp/2014/04/elb-ssl.html

<br>
