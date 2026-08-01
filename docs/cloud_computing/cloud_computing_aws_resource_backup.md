---
title: 【IT技術の知見】Backup＠AWSリソース
description: Backup＠AWSの知見を記録しています。
---

# Backup＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Backup とは

記入中...

<br>

## 02. セットアップ

### 対応 AWS リソース

> - https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html#supported-resources

| AWS リソースの種類 | バックアップ内容                                                                     |
| ------------------ | ------------------------------------------------------------------------------------ |
| Amazon EC2         | Amazon EC2 の AWS AMI を作成する。                                                   |
| Amazon S3          | Amazon S3 バケットの中身のバックアップを作成する。                                   |
| AWS EBS ボリューム | AWS EBS ボリュームのバックアップを作成する。スナップショットではないことに注意する。 |
| Amazon Aurora      | Amazon Aurora の DB Cluster 全体のバックアップを作成する。                           |

<br>

### 障害対策

![backup_multi-region](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/backup_multi-region.png)

リージョン内の AWS リソースで障害が発生すると、データが失われる可能性もある。

そこで、メインリージョンとは別に、障害用の DR リージョンを用意しておく。

メインリージョンにバックアップを作成し、障害用リージョンにそのコピーを作成する。

> - https://qiita.com/shinon_uk/items/5ee4dcf360b8d5c88779
> - https://techblog.finatext.com/aws-cross-region-cross-account-backup-5952a990c1c1

<br>
