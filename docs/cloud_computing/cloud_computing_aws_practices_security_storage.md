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

### 機密データ

機密データの保管と暗号化のために、Secret ManagerとKMSを採用する。

カスタマー管理型KMSを使用し、KMSを操作できるユーザーを制限しています。

> - https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/sec-dataprot.html

<br>

### 永続化データ

永続化データの暗号化のために、AuroraではKMSを採用する。

> - https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/sec-dataprot.html

<br>

### テキストファイル

テキストファイル (`csv`ファイル、`eml`ファイル) や圧縮ファイル (`zip`ファイル) の暗号化のために、S3とこれのサーバーサイド暗号化を採用する。

また、全てのS3バケットでパブリックアクセスを無効化する。

> - https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/sec-dataprot.html

<br>

### ファイルシステム

ファイルシステム (EC2のEBSボリューム) の暗号化のために、KMSを採用する。

<br>
