---
title: 【IT技術の知見】ツール＠AWS
description: ツール＠AWSの知見を記録しています。
---

# ツール＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. ツールの一覧

> ℹ️ 参考：https://aws.amazon.com/jp/solutions/browse-all/?solutions-all.sort-by=item.additionalFields.headline&solutions-all.sort-order=asc&awsf.Content-Type=content-type%23solution&awsf.AWS-Product%20Category=*all

<br>

## 02. ロードテスト

### Distributed Load Testing（分散ロードテスト）

#### ▼ 分散ロードテストとは

ロードテストを実施できる。

CloudFormationで作成でき、ECS Fargateを使用して、ユーザーからのリクエストを擬似的に再現できる。



> ℹ️ 参考：https://d1.awsstatic.com/Solutions/ja_JP/distributed-load-testing-on-aws.pdf

#### ▼ インフラ構成

![distributed_load_testing](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/distributed_load_testing.png)

<br>
