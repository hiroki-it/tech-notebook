---
title: 【IT技術の知見】Backup
description: Backupの知見を記録しています。
tags:
  - "3大クラウド"
  - "AWS"
  - "AWSリソース"
---

# Backup

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要

複数の AWS リソースのバックアップの作成、保持、復元を一元的に管理する AWS リソースである。

<br>

## 02. 仕組み

## 03. セットアップ

### Terraformによる構築

hashicorp/aws プロバイダーを使用し、既存リソースを毎日 18 時 UTC（日本時間 3 時）にバックアップし、30 日間保管する。AWS Backup が引き受けられ、対象リソースのバックアップ権限を持つ IAM ロールを指定する。

```terraform
variable "backup_role_arn" {
  type = string
}

variable "resource_arns" {
  type = list(string)
}

resource "aws_backup_vault" "this" {
  name = "foo-backup"
}

resource "aws_backup_plan" "this" {
  name = "foo-daily"
  rule {
    rule_name         = "daily"
    target_vault_name = aws_backup_vault.this.name
    schedule          = "cron(0 18 * * ? *)"
    lifecycle {
      delete_after = 30
    }
  }
}

resource "aws_backup_selection" "this" {
  name         = "foo-resources"
  plan_id      = aws_backup_plan.this.id
  iam_role_arn = var.backup_role_arn
  resources    = var.resource_arns
}
```

> - [backup_vault - Terraform Registry](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/backup_vault)
> - [backup_plan - Terraform Registry](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/backup_plan)
> - [backup_selection - Terraform Registry](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/backup_selection)

<br>



## 04. リソースのバックアップ

> - [What is AWS Backup? - AWS Backup](https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html#supported-resources)

<table>
  <thead>
    <tr>
      <th>AWS リソースの種類</th>
      <th>バックアップ内容</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Amazon EC2</td>
      <td>Amazon EC2 の AWS AMI を作成する。</td>
    </tr>
    <tr>
      <td>Amazon S3</td>
      <td>Amazon S3 バケットの中身のバックアップを作成する。</td>
    </tr>
    <tr>
      <td>AWS EBS ボリューム</td>
      <td>AWS EBS ボリュームのバックアップを作成する。スナップショットではないことに注意する。</td>
    </tr>
    <tr>
      <td>Amazon Aurora</td>
      <td>Amazon Aurora の DB Cluster 全体のバックアップを作成する。</td>
    </tr>
  </tbody>
</table>

<br>

## 05. リージョン間のバックアップコピー

![backup_multi-region](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/backup_multi-region.png)

リージョン内の AWS リソースで障害が発生すると、データが失われる可能性もある。

そこで、メインリージョンとは別に、障害用の DR リージョンを用意しておく。

メインリージョンにバックアップを作成し、障害用リージョンにそのコピーを作成する。

> - [AWS Backupを用いてAuroraクロスリージョンコピーしてみる(Terraform) #AWS - Qiita](https://qiita.com/shinon_uk/items/5ee4dcf360b8d5c88779)
> - https://techblog.finatext.com/aws-cross-region-cross-account-backup-5952a990c1c1

<br>
