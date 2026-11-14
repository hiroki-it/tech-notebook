---
title: 【IT技術の知見】Amazon Redshift
description: Amazon Redshiftの知見を記録しています。
tags:
  - "3大クラウド"
  - "AWS"
  - "AWSリソース"
---

# Amazon Redshift

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要


データウェアハウスとして働く。

DB よりも柔軟性の高い保管形式で、データレイク (例：Amazon S3 など) のデータを処理したうえで管理できる。

> - [Data Lakes on AWS](https://aws.amazon.com/jp/big-data/datalakes-and-analytics/datalakes/?nc=sn&loc=4)
> - [What is a Data Lake? Data Lake vs. Warehouse \| Microsoft Azure](https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-a-data-lake#:~:text=risks%20more%20efficiently.-,What's%20the%20difference%20between%20a%20data%20lake%20and%20a%20data,as%20specific%20BI%20use%20cases.)

<br>

## 02. 仕組み

### 並列処理による高速化

Apache Spark を使用して、大きなサイズのデータを高速に並列処理できる。

> - [NEW – Amazon Redshift と Apache Spark の統合 \| Amazon Web Services ブログ](https://aws.amazon.com/jp/blogs/news/new-amazon-redshift-integration-with-apache-spark/)

<br>
## 03. セットアップ

### Terraformによる構築
