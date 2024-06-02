---
title: 【IT技術の知見】3大クラウド (クラウドコンピューティング)
description: 3大クラウド (クラウドコンピューティング) の知見を記録しています。
---

# 3大クラウド (クラウドコンピューティング)

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. オンプレミスとクラウドコンピューティングの種類

### オンプレミス

#### ▼ オンプレミスとは

ユーザーの自社設備によって、システムを運用すること。

<br>

### クラウドコンピューティング

#### ▼ クラウドコンピューティングとは

インターネットを経由して、ベンダーのサーバーに自身のデータを保存し、利用すること。

ベンダーが、システムを稼働させるために必要なソフトウェアとハードウェアをどこまで提供するかによって、サービスの名称が異なる。

> - https://blogs.itmedia.co.jp/itsolutionjuku/2019/07/post_725.html

#### ▼ パブリッククラウド

あらゆるユーザーが利用できるように公開されているクラウドサービスのこと。

> - https://www.gadgeblo.com/cloud-service-brand/

**＊例＊**

- AWS
- Google Cloud
- Azure
- さくらのクラウド (さくらインターネット)
- OpenCanvas (NTT)
- ASPIRE (ソフトバンク)
- ALTUS (GMO)

#### ▼ プライベートクラウド

企業が自社で開発し、自社内やグループ会社内のみ利用できる非公開なクラウドサービスのこと。

エンジニアを潤沢に用意できる大企業が所有していることが多い。

> - https://www.cyberagent.co.jp/way/list/detail/id=26235

**＊例＊**

- Yahoo
- Cycloud (サイバーエージェント)

<br>

## 02. XaaS

### XaaSとは

クラウドコンピューティングには提供範囲の異なるサービスがあり、XaaSで表現される。

![on-premises_iaas_caas_paas_faas_saas](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/on-premises_iaas_caas_paas_faas_saas.png)

> - https://dzone.com/articles/caas-services-through-aws-azure-and-google-cloud
> - https://www.google.com/search?q=gcp+paas&source=lnms&tbm=isch&sa=X&ved=2ahUKEwj6y9r0-8r3AhXBdN4KHftqAxsQ_AUoAXoECAEQAw&biw=1600&bih=912&dpr=1.8#imgrc=thXAUUoo_mfDCM
> - https://licensecounter.jp/azure/blog/series/awsazureiaaspaas.html
> - https://cloud-textbook.com/46/#baremetal
> - https://www.edomtt.co.jp/staff_blog/%E3%82%AF%E3%83%A9%E3%82%A6%E3%83%89%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%A8%E3%81%AF%EF%BC%9Faws%E3%81%A8%E3%81%AF%EF%BC%9F%E5%88%9D%E5%BF%83%E8%80%85%E5%90%91%E3%81%91%E3%81%AB%E5%9F%BA/
> - https://qiita.com/siro33950/items/f693d8acf9116c0f1319

<br>

### XaaSの種類

#### ▼ オンプレミス (自社所有)

XaaSに含まれないが、比較のために記載している。

全てのシステム要素を用意する。

OpenStackを使用して、オンプレミス環境に仮想クラウドを作成することも含む。

#### ▼ ベアメタル型IaaS

リクエストリプライ方式のアプリケーション、データ、ランタイム、ミドルウェア、コンテナ、OS、仮想サーバー、を用意する。

仮想サーバー型IaaSとは異なり、ハードウェアのみで仮想サーバーは提供されないため、ハードウェア上にユーザーが仮想サーバー (例：VMware) を作成し、管理する必要がある。

| サービス名   | リソース名                             |
| ------------ | -------------------------------------- |
| AWS          | AWS EC2 (ベアメタルインスタンスタイプ) |
| Google Cloud | Bare Metal Solution                    |
| Azure        |                                        |

#### ▼ 仮想サーバー型IaaS

リクエストリプライ方式のアプリケーション、データ、ランタイム、ミドルウェア、コンテナ、OS、を用意する。

ベアメタル型IaaSとは異なり、ハードウェアと仮想サーバーの両方が提供される。

| サービス名   | リソース名            |
| ------------ | --------------------- |
| AWS          | AWS EC2               |
| Google Cloud | Google Compute Engine |
| Azure        | Azure Virtual Machine |

#### ▼ CaaS

リクエストリプライ方式のアプリケーション、データ、ランタイム、ミドルウェア、コンテナ、を用意する。

CaaSで構築したシステムは、FaaSと同じくサーバーの管理が全く不要であるため、『サーバーレスなシステム』ともいう。

| サービス名   | リソース名                |
| ------------ | ------------------------- |
| AWS          | AWS Fargate               |
| Google Cloud | Google Cloud Run          |
| Azure        | Azure Container Instances |

> - https://dev.to/aws-builders/understanding-aws-fargate-serverless-container-or-caas-4kd7

#### ▼ PaaS

リクエストリプライ方式のアプリケーション、データ、を用意する。

| サービス名   | リソース名                                                             |
| ------------ | ---------------------------------------------------------------------- |
| AWS          | AWS Elastic Beanstalk、AWS RDS、AWS CloudFront、AWS Dynamo DB、AWS SES |
| Google Cloud | Google App Engine、Google CLoud SQL                                    |
| Azure        | Azure App Service                                                      |

#### ▼ FaaS

イベントドリブン方式の関数プログラム、データ、を用意する。

FaaSで構築したシステムは、CaaSと同じくサーバーの管理が全く不要であるため、『サーバーレスなシステム』ともいう。

| サービス名   | リソース名      |
| ------------ | --------------- |
| AWS          | AWS Lambda      |
| Google Cloud | Google AppSheet |
| Azure        | Azure Functions |

> - https://hantechnote.wordpress.com/2019/12/01/%E4%BB%96%E3%81%AE%E3%82%AF%E3%83%A9%E3%82%A6%E3%83%89%E3%82%B3%E3%83%B3%E3%83%94%E3%83%A5%E3%83%BC%E3%83%86%E3%82%A3%E3%83%B3%E3%82%B0%E3%81%AE%E3%83%A2%E3%83%87%E3%83%AB%E3%81%A8%E3%81%AF%EF%BC%9F/

#### ▼ NoCode

| サービス名   | リソース名             |
| ------------ | ---------------------- |
| AWS          | AWS Honeycode          |
| Google Cloud | Google Cloud Functions |
| Azure        | Azure Logc Apps        |

> - https://cloudsecurityalliance.jp/newblog/2021/02/09/%E3%82%AF%E3%83%A9%E3%82%A6%E3%83%89%E3%82%B3%E3%83%B3%E3%83%94%E3%83%A5%E3%83%BC%E3%83%86%E3%82%A3%E3%83%B3%E3%82%B0%E3%81%AE%E9%80%B2%E5%8C%96%E3%81%A8%E6%96%B0%E3%81%9F%E3%81%AA%E8%B2%AC%E4%BB%BB/

#### ▼ SaaS

何も用意する必要はない。

| サービス名   | リソース名                                                       |
| ------------ | ---------------------------------------------------------------- |
| AWS          | AWS S3、AWS CloudWatch                                           |
| Google Cloud | Google Apps (例：Google Map、Google Cloud、Google Calender など) |
| Azure        | -                                                                |

<br>

### マルチクラウドプロバイダー

複数のクラウドプロバイダーを使用して、システムを開発する。

特定のクラウドプロバイダーに依存しないような設計が必要になる。

> - https://blog.scaleway.com/10-best-practices-for-a-successful-multi-cloud-strategy/

<br>
