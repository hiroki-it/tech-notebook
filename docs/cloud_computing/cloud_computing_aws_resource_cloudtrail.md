---
title: 【IT技術の知見】CloudTrail＠AWSリソース
description: CloudTrail＠AWSリソースの知見を記録しています。
---

# CloudTrail＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. CloudTrailとは

IAMユーザーによる操作や、ロールの紐付けの履歴 (証跡) を記録し、ログファイルとしてS3に転送する。

CloudWatchと連携もできる。

![CloudTrailとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/CloudTrailとは.jpeg)

<br>

## 02. 証跡

### 使用履歴

AWSリソースに、使用中かどうかわからずに、削除できないものがあるとする。

このような場合、CloudTrailでAWSリソースを検索し、履歴がなければ使用していないと判断できる。

<br>
