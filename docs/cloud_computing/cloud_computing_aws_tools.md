---
title: 【IT技術の知見】ツール
description: ツールの知見を記録しています。
tags:
  - "3大クラウド"
  - "AWS"
---

# ツール

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要


- Distributed Load Testing on AWS
- Instance Scheduler on AWS
- Workload Discovery on AWS
- Automated Security Response on AWS

> - https://aws.amazon.com/jp/solutions/browse-all/?solutions-all.sort-by=item.additionalFields.headline&solutions-all.sort-order=asc&awsf.Content-Type=content-type%23solution&awsf.AWS-Product%20Category

<br>

## 02. 仕組み

## 03. セットアップ

### Terraformによる構築

## 04. 分散負荷テスト

### Distributed Load Testing (分散ロードテスト)

#### ▼ 分散ロードテストとは

ロードテストを実施できる。

CloudFormation で作成でき、Amazon ECS Fargate を使用して、ユーザーからのリクエストを擬似的に再現できる。

> - https://d1.awsstatic.com/Solutions/ja_JP/distributed-load-testing-on-aws.pdf

#### ▼ インフラ構成

分散ロードテストは、フロントエンドの Web コンソールや API で受け付けたテストを、バックエンドの Lambda が Fargate のタスクとして実行し、その結果を DynamoDB や S3 に保存する構成である。

![distributed_load_testing](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/distributed_load_testing.png)

<br>
