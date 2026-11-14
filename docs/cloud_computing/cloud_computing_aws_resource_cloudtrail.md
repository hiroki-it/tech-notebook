---
title: 【IT技術の知見】CloudTrail
description: CloudTrailの知見を記録しています。
tags:
  - "3大クラウド"
  - "AWS"
  - "AWSリソース"
---

# CloudTrail

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要


IAM ユーザーによる操作や、ロールの紐付けの履歴 (証跡) を記録し、ログファイルとして S3 にフォワーディングする。

Amazon CloudWatch と連携もできる。

![CloudTrailとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/CloudTrailとは.jpeg)

<br>

## 02. 仕組み

## 03. セットアップ

### Terraformによる構築

hashicorp/aws プロバイダーを使用し、全リージョンの管理イベントを記録する証跡を作成する。

保存先には CloudTrail からの GetBucketAcl と PutObject を許可した既存バケットを指定する。

```terraform
resource "aws_cloudtrail" "this" {
  name                       = "foo-audit"
  s3_bucket_name             = "foo-storage-123456789012"
  is_multi_region_trail      = true
  enable_log_file_validation = true

}
```

> - [cloudtrail - Terraform Registry](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudtrail)

<br>

## 04. 証跡の記録

### 使用履歴

AWS リソースに、使用中かどうかわからずに、削除できないものがあるとする。

このような場合、CloudTrail で AWS リソースを検索し、履歴がなければ使用していないと判断できる。

<br>

### 証跡の保管

証跡は、ログファイルとして S3 に保管するとよい。

<br>
