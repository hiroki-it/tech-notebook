---
title: 【IT技術の知見】Redshift＠AWSリソース
description: Redshift＠AWSリソースの知見を記録しています。
---

# Redshift＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Redshift

### Redshiftとは

データウェアハウスとして働く。

DBよりも柔軟性の高い保管形式で、データレイク (例：AWS S3など) のデータを処理したうえで管理できる。

> - https://aws.amazon.com/jp/big-data/datalakes-and-analytics/datalakes/?nc=sn&loc=4
> - https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-a-data-lake#:~:text=risks%20more%20efficiently.-,What's%20the%20difference%20between%20a%20data%20lake%20and%20a%20data,as%20specific%20BI%20use%20cases.

<br>

### 高速処理

Apache Sparkを使用して、大きなサイズのデータを高速に並列処理できる。

> - https://aws.amazon.com/jp/blogs/news/new-amazon-redshift-integration-with-apache-spark/

<br>
