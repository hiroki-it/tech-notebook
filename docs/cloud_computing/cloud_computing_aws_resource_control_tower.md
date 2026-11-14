---
title: 【IT技術の知見】Control Tower
description: Control Towerの知見を記録しています。
tags:
  - "3大クラウド"
  - "AWS"
  - "AWSリソース"
---

# Control Tower

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要


Control Tower は、AWS Organizations、IdentityCenter (AWS SSO の後継)、Account Factory、AWS Config、AWS CloudTrail を一括で作成する。

> - [How AWS Control Tower works with roles to create and manage accounts - AWS Control Tower](https://docs.aws.amazon.com/controltower/latest/userguide/roles-how.html)
> - [【AWS解説】AWS OrganizationsとAWS Control Towerの違いをまとめてみた - RyoNotes](https://ryonotes.com/difference-between-organizations-and-control-tower/)
> - [AWS Organizations & IAM Identity Center利用をオススメしてみる(AWS Organizations活用のリアル補足) - STORES Product Blog](https://product.st.inc/entry/2022/12/23/102300)
> - [AWSでマルチアカウントするならControl Towerなのか？](https://zenn.dev/sakojun/articles/20220716-aws-controltower#control-tower%E3%81%AF%E3%81%A9%E3%82%93%E3%81%AA%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%8B)

<br>

## 02. 仕組み


### AWS Organizations

AWS Organizations の CreateAccount-API をコールして、AWS アカウントを作成する。

さらに AWS Organizations は、この AWS アカウントを作成するときに、AWS アカウント内に IAM ロールを作成する。

既存のアカウントを Control Tower に移行する場合、既存のアカウントで作成された IAM ユーザーと IAM グループが不要になるため、これらを削除する必要がある。

<br>

## 03. セットアップ

### Terraformによる構築

AWS IA の Account Factory for Terraform（AFT）モジュールを使用し、Control Tower によるアカウント管理を自動化する基盤を作成する。

Control Tower のランディングゾーン、管理・ログ保管・監査・AFT 管理用の 4 アカウントを準備し、Control Tower 管理アカウントから実行する。

```terraform
module "aft" {
  source  = "aws-ia/control_tower_account_factory/aws"
  version = "1.24.0"

  ct_home_region            = "ap-northeast-1"
  ct_management_account_id  = "111111111111"
  log_archive_account_id    = "222222222222"
  audit_account_id          = "333333333333"
  aft_management_account_id = "444444444444"
  terraform_version         = "1.14.0"
}
```

> - [aws-ia/control_tower_account_factory/aws (1.24.0) - Terraform Registry](https://registry.terraform.io/modules/aws-ia/control_tower_account_factory/aws/1.24.0)
> - [Deploy AWS Control Tower Account Factory for Terraform - AWS](https://docs.aws.amazon.com/controltower/latest/userguide/aft-getting-started.html)

<br>
