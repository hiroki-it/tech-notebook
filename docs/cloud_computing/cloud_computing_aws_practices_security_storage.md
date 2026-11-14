---
title: 【IT技術の知見】ストレージ安全性
description: ストレージ安全性の知見を記録しています。
tags:
  - "3大クラウド"
  - "AWS"
  - "プラクティス集"
---

# ストレージ安全性

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要

保存データを暗号化し、アクセスを制御することで、不正な閲覧や改ざんからデータを保護する。

> - [Protecting data at rest - Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/protecting-data-at-rest.html)

<br>

## 02. 仕組み

## 03. セットアップ

### Terraformによる構築

terraform-aws-modules の KMS モジュールと S3 モジュールを使用し、カスタマーマネージドキーによる暗号化とバージョニングを有効にした非公開バケットを作成する。バケット名には一意の名前を指定する。

```terraform
variable "bucket_name" {
  type = string
}

module "kms" {
  source  = "terraform-aws-modules/kms/aws"
  version = "4.2.2"

  aliases = ["foo-storage"]
}

module "bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "5.17.0"

  bucket     = var.bucket_name
  versioning = { enabled = true }
  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm     = "aws:kms"
        kms_master_key_id = module.kms.key_arn
      }
      bucket_key_enabled = true
    }
  }
}
```

> - [terraform-aws-modules/kms/aws (4.2.2) - Terraform Registry](https://registry.terraform.io/modules/terraform-aws-modules/kms/aws/4.2.2)
> - [terraform-aws-modules/s3-bucket/aws (5.17.0) - Terraform Registry](https://registry.terraform.io/modules/terraform-aws-modules/s3-bucket/aws/5.17.0)

<br>

## 04. キーバリューデータの保管と暗号化

AWS Secrets Manager は、機密データをキーバリュー単位で保管できるキーバリューストレージである。

機密データの保管と暗号化のために、AWS Secrets Manager では AWS KMS を採用する。

カスタマー管理型 AWS KMS を使用し、AWS KMS を操作できるユーザーを制限しています。

> - [Data protection - AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/sec-dataprot.html)
> - https://www.techtarget.com/searchstorage/feature/NVMe-key-value-storage-vs-block-and-object-storage

<br>

## 05. ブロックデータの保管と暗号化

### ▼ Amazon Aurora

Amazon Aurora は、永続データをブロック単位で保管できるブロックストレージである。

永続データ (クラスター全体、自動バックアップ、リードレプリカ全体、スナップショット、ログなど) の暗号化のために、Amazon Aurora では AWS KMS を採用する。

> - [Data protection - AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/sec-dataprot.html)
> - [AWS のストレージサービス EBS、EFS、S3、FSxなどの違い \| 株式会社スタイルズ](https://www.stylez.co.jp/aws_columns/explain_aws_services_that_are_difficult_to_differentiate/aws_storage_services_difference_between_ebs_efs_s3_fsx_etc/#AWS-2)
> - [Auroraの保管時の暗号化を整理してみた #AWS - Qiita](https://qiita.com/zumax/items/ee70a643a0ec803b8671)

### ▼ AWS EBS

AWS EBS は、ファイルをブロック単位で保管できるブロックストレージである。

ファイルの暗号化のために、AWS KMS を採用する。

<br>

## 06. オブジェクトの保管と暗号化

### ▼ Amazon S3

Amazon S3 は、属性を付与した静的ファイル (例：`html` ファイル、`css` ファイル、画像、動画、メールなど) やビッグデータをオブジェクト単位で管理できるオブジェクトストレージである。

テキストファイル (`csv` ファイル、`eml` ファイル) や圧縮ファイル (`zip` ファイル) の暗号化のために、Amazon S3 とそのサーバーサイド暗号化を採用する。

また、すべての Amazon S3 バケットでパブリックアクセスを無効化する。

> - [Data protection - AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/sec-dataprot.html)
> - [AWS のストレージサービス EBS、EFS、S3、FSxなどの違い \| 株式会社スタイルズ](https://www.stylez.co.jp/aws_columns/explain_aws_services_that_are_difficult_to_differentiate/aws_storage_services_difference_between_ebs_efs_s3_fsx_etc/#AWS-2)

<br>
