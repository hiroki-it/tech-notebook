---
title: 【IT技術の知見】BigQuery＠Google Cloudリソース
description: BigQuery＠Google Cloudリソースの知見を記録しています。
---

# BigQuery＠Google Cloudリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. BigQuery

### BigQueryとは

データ分析のステップ (収集/加工/保存、クエリ、可視化) のうちで、収集/加工/保存とクエリを担う。

可視化にはBIツール (例：Google Cloud Looker) が必要になる。

![bigquery.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/bigquery.png)

> - https://eh-career.com/engineerhub/entry/2022/12/22/093000

<br>

### BIツールとの連携

#### ▼ サービスアカウント

サービスアカウントのクレデンシャル情報を認証に使用する。

発行した認証情報をBIツールに登録する。

> - https://knowledge.insight-lab.co.jp/bi/lookerandbigquery
> - https://cloud.google.com/looker/docs/db-config-google-bigquery?hl=ja#authentication_with_bigquery_service_accounts

#### ▼ Google Cloud OAuth

Google Cloud OAuthの情報を認証に使用する。

発行した認証情報をBIツールに登録する。

> - https://knowledge.insight-lab.co.jp/bi/lookerandbigquery
> - https://cloud.google.com/looker/docs/db-config-google-bigquery?hl=ja#authentication_with_oauth

<br>
