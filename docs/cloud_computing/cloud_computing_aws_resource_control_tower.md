---
title: 【IT技術の知見】Control Tower＠AWSリソース
description: Control Tower＠AWSリソースの知見を記録しています。
---

# Control Tower＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Control Towerとは

Control Towerは、AWS Organizations、IdentityCenter (AWS SSOの後継)、Account Factory、AWS Config、AWS CloudTrail、を一括で作成する。

> ↪️：
>
> - https://docs.aws.amazon.com/controltower/latest/userguide/roles-how.html
> - https://ryonotes.com/difference-between-organizations-and-control-tower/
> - https://product.st.inc/entry/2022/12/23/102300
> - https://zenn.dev/sakojun/articles/20220716-aws-controltower#control-tower%E3%81%AF%E3%81%A9%E3%82%93%E3%81%AA%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%8B

<br>

## 02. Control Towerの仕組み

### AWS Organizations

AWS OrganizationsのCreateAccount-APIをコールして、AWSアカウントを作成する。

さらにAWS Organizationsは、このAWSアカウントを作成する時に、AWSアカウント内にIAMロールを作成する。

既存のアカウントをControl Towerに移行する場合、既存のアカウントで作成されたIAMユーザーとIAMグループが不要になるため、これらを削除する必要がある。

<br>
