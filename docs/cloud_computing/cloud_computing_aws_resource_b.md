---
title: 【IT技術の知見】Bで始まるAWSリソース＠AWS
description: Bで始まるAWSリソース＠AWSの知見を記録しています。
---

# ```B```で始まるAWSリソース＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Backup

### 対応AWSリソース

> ℹ️ 参考：https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html#supported-resources

| AWSリソースの種類 | バックアップ内容                                    |
|--------------|---------------------------------------------|
| EC2          | EC2インスタンスのAMIを作成する。                         |
| S3           | S3バケットの中身のバックアップを作成する。                    |
| EBSボリューム     | EBSボリュームのバックアップを作成する。スナップショットではないことに注意する。 |
| RDS（Aurora）  | Aurora cluster全体のバックアップを作成する。             |

<br>

### 障害対策

![backup_multi-region](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/backup_multi-region.png)

リージョンの何らかのAWSリソースで障害が発生し、データが失われる可能性がある。そこで、メインリージョンとは別に、障害用のDRリージョンを用意しておく。メインリージョンにバックアップを作成し、障害用リージョンにそのコピーを作成する。

> ℹ️ 参考：
>
> - https://qiita.com/shinon_uk/items/5ee4dcf360b8d5c88779
> - https://techblog.finatext.com/aws-cross-region-cross-account-backup-5952a990c1c1

<br>

