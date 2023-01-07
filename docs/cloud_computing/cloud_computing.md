---
title: 【IT技術の知見】クラウドコンピューティング
description: クラウドコンピューティングの知見を記録しています。
---

# クラウドコンピューティング

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

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



> ℹ️ 参考：https://blogs.itmedia.co.jp/itsolutionjuku/2019/07/post_725.html

#### ▼ パブリッククラウド

あらゆるユーザーが利用できるように公開されているクラウドサービスのこと。



> ℹ️ 参考：https://www.gadgeblo.com/cloud-service-brand/

**＊例＊**

- AWS
- GCP
- Azure
- さくらのクラウド（さくらインターネット） 
- OpenCanvas（NTT）
- ASPIRE（ソフトバンク）
- ALTUS（GMO）

#### ▼ プライベートクラウド

企業が自社で開発し、自社内やグループ会社内のみ利用できる非公開なクラウドサービスのこと。

エンジニアを潤沢に用意できる大企業が所有していることが多い。



> ℹ️ 参考：https://www.cyberagent.co.jp/way/list/detail/id=26235

**＊例＊**


- Yahoo
- Cycloud（サイバーエージェント）

<br>

## 02. XaaS

### XaaSとは

クラウドコンピューティングには提供範囲の異なるサービスがあり、XaaSで表現される。



![on-premises_iaas_caas_paas_faas_saas](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/on-premises_iaas_caas_paas_faas_saas.png)

ℹ️ 参考：


> - https://dzone.com/articles/caas-services-through-aws-azure-and-google-cloud
> - https://www.google.com/search?q=gcp+paas&source=lnms&tbm=isch&sa=X&ved=2ahUKEwj6y9r0-8r3AhXBdN4KHftqAxsQ_AUoAXoECAEQAw&biw=1600&bih=912&dpr=1.8#imgrc=thXAUUoo_mfDCM
> - https://licensecounter.jp/azure/blog/series/awsazureiaaspaas.html
> - https://cloud-textbook.com/46/#baremetal
> - https://www.edomtt.co.jp/staff_blog/%E3%82%AF%E3%83%A9%E3%82%A6%E3%83%89%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%A8%E3%81%AF%EF%BC%9Faws%E3%81%A8%E3%81%AF%EF%BC%9F%E5%88%9D%E5%BF%83%E8%80%85%E5%90%91%E3%81%91%E3%81%AB%E5%9F%BA/
> - https://qiita.com/siro33950/items/f693d8acf9116c0f1319

<br>

### XaaSの種類

#### ▼ オンプレミス（自社所有）

XaaSに含まれないが、比較のために記載している。

全てのシステム要素を用意する。

OpenStackを使用して、オンプレミス環境に仮想クラウドを作成することも含む。



#### ▼ ベアメタル型IaaS

リクエストリプライ方式のアプリケーション、データ、ランタイム、ミドルウェア、コンテナ、OS、仮想サーバー、を用意する。

仮想サーバー型IaaSとは異なり、ハードウェアのみで仮想サーバーは提供されないため、ハードウェア上にユーザーが仮想サーバーを作成し、管理する必要がある。



| サービス名 | リソース名                  |
|--------|-------------------------|
| AWS    | AWS EC2（ベアメタルインスタンスタイプ） |
| GCP    | Bare Metal Solution     |
| Azure  |                         |

#### ▼ 仮想サーバー型IaaS

リクエストリプライ方式のアプリケーション、データ、ランタイム、ミドルウェア、コンテナ、OS、を用意する。

ベアメタル型IaaSとは異なり、ハードウェアと仮想サーバーの両方が提供される。



| サービス名 | リソース名                |
|--------|-----------------------|
| AWS    | AWS EC2               |
| GCP    | Google Compute Engine |
| Azure  | Azure Virtual Machine |

#### ▼ CaaS

リクエストリプライ方式のアプリケーション、データ、ランタイム、ミドルウェア、コンテナ、を用意する。



| サービス名 | リソース名                    |
|--------|---------------------------|
| AWS    | AWS Fargate               |
| GCP    | Google Cloud Run          |
| Azure  | Azure Container Instances |

#### ▼ PaaS

リクエストリプライ方式のアプリケーション、データ、を用意する。



| サービス名 | リソース名                                                             |
|--------|--------------------------------------------------------------------|
| AWS    | AWS Elastic Beanstalk、AWS RDS、AWS CloudFront、AWS Dynamo DB、AWS SES |
| GCP    | Google App Engine、Google CLoud SQL                                 |
| Azure  | Azure App Service                                                  |


#### ▼ FaaS

イベントドリブン方式の関数プログラム、データ、を用意する。



| サービス名 | リソース名                 |
|--------|------------------------|
| AWS    | AWS Lambda             |
| GCP    | Google Cloud Functions |
| Azure  | Azure Functions        |

#### ▼ SaaS

何も用意する必要はない。



| サービス名 | リソース名                                                     |
|--------|------------------------------------------------------------|
| AWS    | AWS S3、AWS CloudWatch                                      |
| GCP    | Google Apps（例：Google Map、Google Cloud、Google Calender など） |
| Azure  | -                                                          |



<br>

### マルチクラウドプロバイダー

複数のクラウドプロバイダーを使用して、システムを開発する。

特定のクラウドプロバイダーに依存しないような設計が必要になる。



> ℹ️ 参考：https://blog.scaleway.com/10-best-practices-for-a-successful-multi-cloud-strategy/

<br>
