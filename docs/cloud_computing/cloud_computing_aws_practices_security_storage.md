---
title: 【IT技術の知見】ストレージ安全性＠AWS
description: ストレージ安全性＠AWSの知見を記録しています。
---

# ストレージ安全性＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. KMS、Cloud HSM

保管データの暗号化のために、KMSやCloud HSMを使用する。

データを保管するAWSリソース (例：Aurora RDS、EBS、S3、Secret Manager、など) に紐づけられる。

> - https://docs.aws.amazon.com/ja_jp/prescriptive-guidance/latest/encryption-best-practices/general-encryption-best-practices.html#encryption-of-data-at-rest

<br>
