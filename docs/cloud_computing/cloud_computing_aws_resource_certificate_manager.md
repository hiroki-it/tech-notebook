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

認証局から発行されたサーバー証明書を管理する。

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

認証局であるATSによって認証済みのサーバー証明書を管理できる。

| サーバー提供者 | 名前                          |
| -------------- | ----------------------------- |
| 中間認証局     | Amazon認証局                  |
| ルート認証局   | Starfield認証局、Amazon認証局 |

> - https://docs.aws.amazon.com/acm/latest/userguide/acm-certificate.html
> - https://www.amazontrust.com/repository/
> - https://dev.classmethod.jp/articles/ssl-introduction-for-aws-client-vpn/#%25E5%25AE%259F%25E9%259A%259B%25E3%2581%25AB%25E8%25A6%258B%25E3%2581%25A6%25E3%2581%25BF%25E3%2582%258B
> - https://speakerdeck.com/minorun365/zheng-ming-shu-tutehe-datuke-awsnozhong-jian-cayi-xing-nibei-eru?slide=10

<br>

## 04. サーバー証明書の検証方法

### ドメイン検証

#### ▼ ドメイン検証とは

ドメインのサーバー証明書を作成するためには、そのドメインの所有者であることを証明する必要がある。

ドメインを購入できるサービス (例：AWS、GCP、GMO) に検証方法が用意されている。

> - https://docs.aws.amazon.com/acm/latest/userguide/domain-ownership-validation.html
> - https://jp.globalsign.com/support/proceeding/147.html

#### ▼ 検証方法の変更

既存のサーバー証明書の検証方法は変更できない。

そのため、検証方法を変更した証明書を新しく発行し、これを紐付ける必要がある。

古い証明書は削除しておく。

> - https://aws.amazon.com/jp/premiumsupport/knowledge-center/switch-acm-certificate/

<br>

### DNS検証

CMによってAWS Route53に自動作成されるCNAMEレコード値を使用して、ドメインの所有者であることを証明する。

証明書が失効しそうになったときに、CNAMEレコード値が照合され、CMが証明書を再発行してくれる。

注意点として、ドメインをAWS以外 (例：お名前ドットコム) で購入している場合は、NSレコード値を購入先のサービスのドメインレジストラに手作業で登録する必要があることに注意する。

> - https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html
> - https://dev.classmethod.jp/articles/route53-domain-onamae/

### Eメール検証

ドメインの所有者にメールを送信し、これを承認することにより所有者であることを証明する。

ドメインをAWS以外 (例：お名前ドットコム) で購入している場合は、そちらで設定したメールアドレス宛に確認メールを送信する。

> - https://docs.aws.amazon.com/acm/latest/userguide/email-validation.html

<br>

## 05. サーバー証明書

### セキュリティポリシー

許可するプロトコルを定義したルールこと。

SSL/TLSプロトコルを許可しており、対応できるバージョンが異なるため、ブラウザがそのバージョンのSSL/TLSプロトコルを使用できるかを認識しておく必要がある。

| バージョン       | Policy-2016-08 | Policy-TLS-1-1 | Policy-TLS-1-2 |
| ---------------- | :------------: | :------------: | :------------: |
| Protocol-TLSv1   |       ⭕️       |       ✕        |       ✕        |
| Protocol-TLSv1.1 |       ⭕️       |       ⭕️       |       ✕        |
| Protocol-TLSv1.2 |       ⭕️       |       ⭕️       |       ⭕️       |

<br>

### サーバー証明書の種類

DNS検証またはEメール検証によって、ドメインの所有者であることが証明されると、発行される。

サーバー証明書は、PKIによる公開鍵検証に使用される。

| 証明書の種類         | 説明                                               |
| -------------------- | -------------------------------------------------- |
| ワイルドカード証明書 | 証明するドメイン名にワイルドカードを使用したもの。 |

<br>

### サーバー証明書の変更

#### ▼ サーバー証明書の確認

Chromeを例に挙げると、サーバー証明書はURLの鍵マークから確認できる。

**＊例＊**

CircleCIのサイトは、サーバー証明書のためにAWS Certificate Managerを使用している。

![ssl_certificate_chrome](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ssl_certificate_chrome.png)

#### ▼ ダウンタイム

AWS ALBではサーバー証明書の変更でダウンタイムは発生しない。

既存のセッションを維持 (調査していないが、スティッキーセッションの仕組み？) しつつ、新しいサーバー証明書が適用される。

AWS CloudFrontは謎...

> - https://aws.typepad.com/sajp/2014/04/elb-ssl.html

<br>

## 05-02. サーバー証明書の配置場所パターン

### AWS EC2/AWS ECS/AWS EKSの送信元

#### ▼ SSL/TLS終端

HTTPSによるSSLプロトコルを受け付けるネットワークの最終地点のことを、SSL/TLS終端という。

サーバー証明書の配置場所は、SSL/TLS終端をどこにするかで決める。

AWSの使用上、AWS Certificate Managerのサーバー証明書を配置できないAWSリソースに対しては、外部のサーバー証明書を手に入れて配置する。

トレードオフとして、アプリケーションデータの暗号化処理は通信速度が低下させる。

そのため、パブリックネットワークと信頼できるネットワーク (例：データセンター、プライベートネットワークなど) の境界をSSL/TLS終端とすることが多い。

> - https://serverfault.com/a/1126428
> - https://www.reddit.com/r/aws/comments/aidrfn/comment/eenbc60/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button

#### ▼ AWS Route53 ➡️ AWS ALB、NLB、の場合

AWS ALBでSSL/TLS終端とする場合、AWS EC2/AWS ECS/AWS EKSにサーバー証明書は不要である。

AWS EC2/AWS ECS/AWS EKSでSSL/TLS終端とする場合、AWS EC2/AWS ECS/AWS EKSにAWS以外で作成したサーバー証明書を配置する。

| パターン<br>(AWS Route53には必ず配置)                                                                                 | SSL/TLS終端<br>(HTTPSプロトコルの最終地点) |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| AWS Route53 ➡️ AWS ALB (AWS Certificate Managerのサーバー証明書) ➡️ AWS EC2/AWS ECS/AWS EKS                           | AWS ALB                                    |
| AWS Route53 ➡️ AWS ALB (AWS Certificate Managerのサーバー証明書) ➡️ AWS EC2/AWS ECS/AWS EKS (AWS以外のサーバー証明書) | AWS EC2/AWS ECS/AWS EKS                    |
| AWS Route53 ➡️ AWS ALB (AWS Certificate Managerのサーバー証明書) ➡️ Lightsail (AWS以外のサーバー証明書)               | Lightsail                                  |
| AWS Route53 ➡️ NLB (AWS Certificate Managerのサーバー証明書) ➡️ AWS EC2/AWS ECS/AWS EKS (AWS以外のサーバー証明書)     | AWS EC2/AWS ECS/AWS EKS                    |

> - https://dev.classmethod.jp/articles/alb-backend-https/#toc-1

#### ▼ AWS Route53 ➡️ Load Balancer Controller由来) の場合

AWSリソースにはAWS Certificate Managerのサーバー証明書を紐づけられるが、KubernetesリソースにはAWS以外のサーバー証明書 (Let’s Encrypt、Cert Manager、Istio) しか紐づけられない。

| パターン<br>(AWS Route53には必ず配置)                                                                                        | SSL/TLS終端<br>(HTTPSプロトコルの最終地点) |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| AWS Route53 ➡️ Load Balancer Controller (AWS Certificate Managerのサーバー証明書) ➡️︎ Service / Pod                          | AWS ALB                                    |
| AWS Route53 ➡️ Load Balancer Controller (AWS Certificate Managerのサーバー証明書) ➡️ Service / Pod                           | Ingress Controller                         |
| AWS Route53 ➡️ Load Balancer Controller (AWS Certificate Managerのサーバー証明書) ➡️ Service / Pod (AWS以外のサーバー証明書) | Pod                                        |

> - https://aws.amazon.com/blogs/security/tls-enabled-kubernetes-clusters-with-acm-private-ca-and-amazon-eks-2/
> - https://aws.amazon.com/blogs/containers/setting-up-end-to-end-tls-encryption-on-amazon-eks-with-the-new-aws-load-balancer-controller/

#### ▼ AWS Route53 ➡️ AWS CloudFrontの場合

AWS CloudFrontからAWS ALBにHTTPSリクエストを送信する場合、それぞれにサーバー証明書を配置する必要がある。

ただ、AWS CloudFrontはバージニア北部で、またAWS ALBは東京リージョンで証明書を作成する必要がある。

AWS CloudFrontに送信されたHTTPSリクエストをAWS ALBにルーティングするために、両方に紐付ける証明書で承認するドメインは、一致させる必要がある。

| パターン<br>(AWS Route53には必ず配置)                                                                                                                   | SSL/TLS終端<br>(HTTPSプロトコルの最終地点) |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| AWS Route53 ➡️ AWS CloudFront (AWS Certificate Managerのサーバー証明書) ➡️ AWS ALB (AWS Certificate Managerのサーバー証明書) ➡️ AWS EC2/AWS ECS/AWS EKS | AWS ALB                                    |
| AWS Route53 ➡️ AWS CloudFront (AWS Certificate Managerのサーバー証明書) ➡️ AWS EC2/AWS ECS/AWS EKS                                                      | AWS CloudFront                             |
| AWS Route53 ➡️ AWS CloudFront (AWS Certificate Managerのサーバー証明書) ➡️ AWS S3                                                                       | AWS CloudFront                             |

#### ▼ AWS Route53 ➡️ AWS EC2/AWS ECS/AWS EKS、AWS Lightsail、の場合

AWS Route53でSSL/TLS終端とする場合、AWS EC2/AWS ECS/AWS EKSにサーバー証明書は不要である。

AWS EC2/AWS ECS/AWS EKSでSSL/TLS終端とする場合、AWS EC2/AWS ECS/AWS EKSにAWS以外で作成したサーバー証明書を配置する。

| パターン<br>(AWS Route53には必ず配置)                              | SSL/TLS終端<br>(HTTPSプロトコルの最終地点) |
| ------------------------------------------------------------------ | ------------------------------------------ |
|                                                                    |
| AWS Route53 ➡️ AWS EC2/AWS ECS/AWS EKS (AWS以外のサーバー証明書)   | AWS EC2/AWS ECS/AWS EKS                    |
| AWS Route53 ➡️ Lightsail (AWS Certificate Managerのサーバー証明書) | Lightsail                                  |
| AWS Route53 ➡️ Lightsail (AWS Certificate Managerのサーバー証明書) | Lightsail                                  |

<br>

### AWS EC2/AWS ECS/AWS EKSの後段

#### ▼ AWS Aurora

AWS Aurora RDSにサーバー証明書を紐づける。

AWS EC2/AWS ECS/AWS EKSからAWS Aurora RDSへのアプリケーションデータを暗号化できる。

> - https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/UsingWithRDS.SSL-certificate-rotation.html

<br>
