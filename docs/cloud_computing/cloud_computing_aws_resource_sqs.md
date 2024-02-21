---
title: 【IT技術の知見】SQS＠AWSリソース
description: SQS＠AWSリソースの知見を記録しています。
---

# SQS＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. SQSとは：Simple Queue Service

クラウドメッセージキューとして働く。

メッセージブローカー (例：AWS MQ) よりも機能が少なくシンプルである。

パブリッシャーが送信したメッセージは、一旦SQSに追加される。

その後、サブスクライバーは、SQSに対してリクエストを送信し、メッセージを取り出す。

異なるVPC間でも、メッセージキューを同期できる。

![AmazonSQSとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/SQS.jpeg)

> - https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-difference-from-amazon-mq-sns.html

<br>

## 02. セットアップ

### コンソール画面の場合

#### ▼ SQSの種類

| 設定項目         | 説明                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| スタンダード方式 | サブスクライバーの取得レスポンスを待たずに、次のキューを非同期的に転送する。 |
| FIFO方式         | サブスクライバーの取得レスポンスを待ち、キューを同期的に転送する。           |

<br>
