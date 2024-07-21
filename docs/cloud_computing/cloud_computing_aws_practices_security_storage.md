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

Secret Managerは、機密データをキーバリュー単位で保管できるキーバリューストレージである。

機密データの保管と暗号化のために、Secret ManagerではKMSを採用する。

カスタマー管理型KMSを使用し、KMSを操作できるユーザーを制限しています。

> - https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/sec-dataprot.html
> - https://www.techtarget.com/searchstorage/feature/NVMe-key-value-storage-vs-block-and-object-storage

<br>

### ブロックストレージの場合

#### ▼ Aurora

Auroraは、永続化データをブロック単位で保管できるブロックストレージである。

永続化データの暗号化のために、AuroraではKMSを採用する。

> - https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/sec-dataprot.html
> - https://www.stylez.co.jp/aws_columns/explain_aws_services_that_are_difficult_to_differentiate/aws_storage_services_difference_between_ebs_efs_s3_fsx_etc/#AWS-2

#### ▼ EBS

EBSは、ファイルをオブジェクト単位で保管できるブロックストレージである。

ファイルの暗号化のために、KMSを採用する。

<br>

### オブジェクトストレージの場合

#### ▼ S3

S3は、属性を付与したデータ (例：写真、動画、メール、など) をオブジェクト単位で管理できるオブジェクトストレージである。

テキストファイル (`csv`ファイル、`eml`ファイル) や圧縮ファイル (`zip`ファイル) の暗号化のために、S3とこれのサーバーサイド暗号化を採用する。

また、全てのS3バケットでパブリックアクセスを無効化する。

> - https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/sec-dataprot.html
> - https://www.stylez.co.jp/aws_columns/explain_aws_services_that_are_difficult_to_differentiate/aws_storage_services_difference_between_ebs_efs_s3_fsx_etc/#AWS-2

<br>
