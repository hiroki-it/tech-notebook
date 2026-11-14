---
title: 【IT技術の知見】Glue
description: Glueの知見を記録しています。
tags:
  - "3大クラウド"
  - "AWS"
  - "AWSリソース"
---

# Glue

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要


AWS が提供するマネージドな ETL サービスであり、ソースからデータを抽出して加工し、ターゲットに保存する。

<br>

## 02. 仕組み

### Apache Spark による並列処理

Apache Spark を使用して、大きなサイズのデータを高速に並列処理できる。

> - [AWS Glue Spark and PySpark jobs - AWS Glue](https://docs.aws.amazon.com/glue/latest/dg/spark_and_pyspark.html)

<br>
## 03. セットアップ

### Terraformによる構築

hashicorp/aws プロバイダーを使用し、S3 に配置済みの Python スクリプトを実行する Glue の Spark ジョブを作成する。

Glue が引き受けられ、スクリプトと処理対象データへアクセスできる IAM ロールを指定する。

```terraform
resource "aws_glue_job" "this" {
  name              = "foo-etl"
  role_arn          = "arn:aws:iam::123456789012:role/foo-glue"
  glue_version      = "5.0"
  worker_type       = "G.1X"
  number_of_workers = 2
  command {
    python_version  = "3"
    script_location = "s3://foo-scripts-123456789012/etl.py"
  }
  default_arguments = {
    "--job-language" = "python"
  }
}
```

> - [glue_job - Terraform Registry](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/glue_job)

<br>

## 04. ETL の入出力設定

### ▼ 設定項目と説明

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ソース</td>
      <td>元データを管理するデータウェアハウスや DB を設定する。</td>
      <td>データウェアハウスのほうが、DB よりも保管形式の柔軟性が高い。<br>- <a href="https://www.topgate.co.jp/dwh-db-difference">https://www.topgate.co.jp/dwh-db-difference</a></td>
    </tr>
    <tr>
      <td>ターゲット</td>
      <td>処理済データを管理するデータウェアハウスや DB を設定する。</td>
      <td></td>
    </tr>
  </tbody>
</table>

<br>
