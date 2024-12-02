---
title: 【IT技術の知見】Backup＠AWSリソース
description: Backup＠AWSの知見を記録しています。
---

# Backup＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Backupとは

記入中...

<br>

## 02. セットアップ

### 対応AWSリソース

> - https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html#supported-resources

| AWSリソースの種類 | バックアップ内容                                                                    |
| ----------------- | ----------------------------------------------------------------------------------- |
| AWS EC2           | AWS EC2のAWS AMIを作成する。                                                        |
| AWS S3            | AWS S3バケットの中身のバックアップを作成する。                                      |
| AWS EBSボリューム | AWS EBSボリュームのバックアップを作成する。スナップショットではないことに注意する。 |
| AWS RDS (Aurora)  | AWS Aurora DB Cluster全体のバックアップを作成する。                                 |

<br>

### 障害対策

![backup_multi-region](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/backup_multi-region.png)

リージョンの何らかのAWSリソースで障害が発生し、データが失われる可能性がある。

そこで、メインリージョンとは別に、障害用のDRリージョンを用意しておく。

メインリージョンにバックアップを作成し、障害用リージョンにそのコピーを作成する。

> - https://qiita.com/shinon_uk/items/5ee4dcf360b8d5c88779
> - https://techblog.finatext.com/aws-cross-region-cross-account-backup-5952a990c1c1

<br>
