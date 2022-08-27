---
title: 【IT技術の知見】クラウドコンピューティング
description: クラウドコンピューティングの知見を記録しています。
---

# クラウドコンピューティング

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. オンプレミスとクラウドコンピューティングの種類

### オンプレミスとは

ユーザーの自社設備によって、システムを運用すること。　

<br>

### クラウドコンピューティングとは

インターネットを経由して、ベンダーのサーバーに自身のデータを保存し、利用すること。ベンダーが、システムを稼働させるために必要なソフトウェアとハードウェアをどこまで提供するかによって、サービスの名称が異なる。

ℹ️ 参考：https://blogs.itmedia.co.jp/itsolutionjuku/2019/07/post_725.html

![on-premises_iaas_caas_paas_faas_saas](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/on-premises_iaas_caas_paas_faas_saas.png)

<br>

## 02. クラウドコンピューティング

### 具体例

ℹ️ 参考：

- https://dzone.com/articles/caas-services-through-aws-azure-and-google-cloud
- https://www.google.com/search?q=gcp+paas&source=lnms&tbm=isch&sa=X&ved=2ahUKEwj6y9r0-8r3AhXBdN4KHftqAxsQ_AUoAXoECAEQAw&biw=1600&bih=912&dpr=1.8#imgrc=thXAUUoo_mfDCM
- https://licensecounter.jp/azure/blog/series/awsazureiaaspaas.html
- https://cloud-textbook.com/46/#baremetal

|                          | ユーザーの管理領域                                           | AWS                                     | GCP                                                          | Azure                     |
| ------------------------ | ------------------------------------------------------------ | --------------------------------------- | ------------------------------------------------------------ | ------------------------- |
| オンプレミス（自社所有） | 全て。OpenStackを使用して、オンプレミス環境に仮想クラウドを作成することも含む。 | -                                       | -                                                            | -                         |
| IaaS（ベアメタル）       | リクエストリプライ方式のアプリケーション、データ、ランタイム、ミドルウェア、コンテナ、OS、仮想マシン<br>仮想マシン込みのIaaSとは異なり、ハードウェア上にユーザーが仮想マシンを作成し、管理する必要がある。 | AWS EC2（ベアメタルインスタンスタイプ） | Bare Metal Solution                                          | -                         |
| IaaS（仮想マシン込）     | リクエストリプライ方式のアプリケーション、データ、ランタイム、ミドルウェア、コンテナ、OS<br>ベアメタル型IaaSとは異なり、ハードウェア上にユーザーが仮想マシンを作成する必要がなく、これの管理もしてくれる。 | AWS EC2                                 | Google Compute Engine                                        | Azure Virtual Machine     |
| CaaS                     | リクエストリプライ方式のアプリケーション、データ、ランタイム、ミドルウェア、コンテナ | AWS Fargate                             | Google Cloud Run                                             | Azure Container Instances |
| PaaS                     | リクエストリプライ方式のアプリケーション、データ             | AWS Elastic Beanstalk                   | Google App Engine                                            | Azure App Service         |
| FaaS                     | イベントドリブン方式の関数プログラム、データ                 | AWS Lambda                              | Google Cloud Functions                                       | Azure Functions           |
| SaaS                     | なし                                                         |                                         | Google Apps（例：Google Map、Google Cloud、Google Calender など） |                           |

<br>

### マルチクラウドプロバイダー

複数のクラウドプロバイダーを使用して、システムを開発する。特定のクラウドプロバイダーに依存しないような設計が必要になる。

ℹ️ 参考：https://blog.scaleway.com/10-best-practices-for-a-successful-multi-cloud-strategy/

<br>
