---
title: 【IT技術の知見】ストレージ安全性＠AWS
description: ストレージ安全性＠AWSの知見を記録しています。
---

# ストレージ安全性＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 保管と暗号化

### キーバリューストレージの場合

AWS Secrets Manager は、機密データをキーバリュー単位で保管できるキーバリューストレージである。

機密データの保管と暗号化のために、AWS Secrets Manager では AWS KMS を採用する。

カスタマー管理型 AWS KMS を使用し、AWS KMS を操作できるユーザーを制限しています。

> - https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/sec-dataprot.html
> - https://www.techtarget.com/searchstorage/feature/NVMe-key-value-storage-vs-block-and-object-storage

<br>

### ブロックストレージの場合

#### ▼ Amazon Aurora

Amazon Aurora は、永続データをブロック単位で保管できるブロックストレージである。

永続データ (クラスター全体、自動バックアップ、リードレプリカ全体、スナップショット、ログなど) の暗号化のために、Amazon Aurora では AWS KMS を採用する。

> - https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/sec-dataprot.html
> - https://www.stylez.co.jp/aws_columns/explain_aws_services_that_are_difficult_to_differentiate/aws_storage_services_difference_between_ebs_efs_s3_fsx_etc/#AWS-2
> - https://qiita.com/zumax/items/ee70a643a0ec803b8671

#### ▼ AWS EBS

AWS EBS は、ファイルをブロック単位で保管できるブロックストレージである。

ファイルの暗号化のために、AWS KMS を採用する。

<br>

### オブジェクトストレージの場合

#### ▼ Amazon S3

Amazon S3 は、属性を付与した静的ファイル (例：`html` ファイル、`css` ファイル、画像、動画、メールなど) やビッグデータをオブジェクト単位で管理できるオブジェクトストレージである。

テキストファイル (`csv` ファイル、`eml` ファイル) や圧縮ファイル (`zip` ファイル) の暗号化のために、Amazon S3 とこれのサーバーサイド暗号化を採用する。

また、すべての Amazon S3 バケットでパブリックアクセスを無効化する。

> - https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/sec-dataprot.html
> - https://www.stylez.co.jp/aws_columns/explain_aws_services_that_are_difficult_to_differentiate/aws_storage_services_difference_between_ebs_efs_s3_fsx_etc/#AWS-2

<br>
