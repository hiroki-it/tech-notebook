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

terraform-aws-modules の Redshift モジュールを使用し、既存のプライベートサブネットに暗号化したクラスターを作成する。管理者パスワードは Secrets Manager で管理し、接続元の CIDR を指定する。

```terraform
variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "client_cidr" {
  type = string
}

module "redshift" {
  source  = "terraform-aws-modules/redshift/aws"
  version = "7.1.1"

  cluster_identifier = "foo-warehouse"
  node_type          = "ra3.xlplus"
  number_of_nodes    = 2
  database_name      = "foo"
  master_username    = "admin"
  vpc_id             = var.vpc_id
  subnet_ids         = var.private_subnet_ids
  security_group_ingress_rules = {
    sql = { cidr_ipv4 = var.client_cidr }
  }
  skip_final_snapshot       = false
  final_snapshot_identifier = "foo-warehouse-final"
}
```

> - [terraform-aws-modules/redshift/aws (7.1.1) - Terraform Registry](https://registry.terraform.io/modules/terraform-aws-modules/redshift/aws/7.1.1)

<br>
