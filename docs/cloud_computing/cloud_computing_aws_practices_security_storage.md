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

AWS Secrets Managerは、機密データをキーバリュー単位で保管できるキーバリューストレージである。

機密データの保管と暗号化のために、AWS Secrets ManagerではAWS KMSを採用する。

カスタマー管理型AWS KMSを使用し、AWS KMSを操作できるユーザーを制限しています。

> - https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/sec-dataprot.html
> - https://www.techtarget.com/searchstorage/feature/NVMe-key-value-storage-vs-block-and-object-storage

<br>

### ブロックストレージの場合

#### ▼ AWS Aurora

AWS Auroraは、永続データをブロック単位で保管できるブロックストレージである。

永続データ (クラスター全体、自動バックアップ、リードレプリカ全体、スナップショット、ログなど) の暗号化のために、AWS AuroraではAWS KMSを採用する。

> - https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/sec-dataprot.html
> - https://www.stylez.co.jp/aws_columns/explain_aws_services_that_are_difficult_to_differentiate/aws_storage_services_difference_between_ebs_efs_s3_fsx_etc/#AWS-2
> - https://qiita.com/zumax/items/ee70a643a0ec803b8671

#### ▼ AWS EBS

AWS EBSは、ファイルをブロック単位で保管できるブロックストレージである。

ファイルの暗号化のために、AWS KMSを採用する。

<br>

### オブジェクトストレージの場合

#### ▼ AWS S3

AWS S3は、属性を付与した静的ファイル (例：`html` ファイル、`css` ファイル、画像、動画、メールなど) やビッグデータをオブジェクト単位で管理できるオブジェクトストレージである。

テキストファイル (`csv` ファイル、`eml` ファイル) や圧縮ファイル (`zip` ファイル) の暗号化のために、AWS S3とこれのサーバーサイド暗号化を採用する。

また、全てのAWS S3バケットでパブリックアクセスを無効化する。

> - https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/sec-dataprot.html
> - https://www.stylez.co.jp/aws_columns/explain_aws_services_that_are_difficult_to_differentiate/aws_storage_services_difference_between_ebs_efs_s3_fsx_etc/#AWS-2

<br>
