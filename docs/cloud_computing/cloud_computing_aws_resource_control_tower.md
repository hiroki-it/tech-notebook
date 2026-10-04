---
title: 【IT技術の知見】Control Tower＠AWSリソース
description: Control Tower＠AWSリソースの知見を記録しています。
---

# Control Tower＠AWS リソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. Control Tower とは

Control Tower は、AWS Organizations、IdentityCenter (AWS SSO の後継)、Account Factory、AWS Config、AWS CloudTrail を一括で作成する。

> - [How AWS Control Tower works with roles to create and manage accounts - AWS Control Tower](https://docs.aws.amazon.com/controltower/latest/userguide/roles-how.html)
> - [【AWS解説】AWS OrganizationsとAWS Control Towerの違いをまとめてみた - RyoNotes](https://ryonotes.com/difference-between-organizations-and-control-tower/)
> - [AWS Organizations & IAM Identity Center利用をオススメしてみる(AWS Organizations活用のリアル補足) - STORES Product Blog](https://product.st.inc/entry/2022/12/23/102300)
> - [AWSでマルチアカウントするならControl Towerなのか？](https://zenn.dev/sakojun/articles/20220716-aws-controltower#control-tower%E3%81%AF%E3%81%A9%E3%82%93%E3%81%AA%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%8B)

<br>

## 02. Control Tower の仕組み

### AWS Organizations

AWS Organizations の CreateAccount-API をコールして、AWS アカウントを作成する。

さらに AWS Organizations は、この AWS アカウントを作成するときに、AWS アカウント内に IAM ロールを作成する。

既存のアカウントを Control Tower に移行する場合、既存のアカウントで作成された IAM ユーザーと IAM グループが不要になるため、これらを削除する必要がある。

<br>
