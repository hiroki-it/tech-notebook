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

送受信の関係が一対一のプロデュース/コンシュームパターンであり、プルベースの通信方式である。

AWSのクラウドメッセージブローカー (例：AWS MQ) よりも機能が少なくシンプルである。

パブリッシュ−サブスクライブシステム (例：AWS SNS、AWS EventBridge) とは異なりメッセージをキューイングできるが、メッセージをルーティングできない。

> - https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-difference-from-amazon-mq-sns.html
> - https://tech.asoview.co.jp/entry/2022/04/06/102637
> - https://docs.aws.amazon.com/decision-guides/latest/sns-or-sqs-or-eventbridge/sns-or-sqs-or-eventbridge.html
> - https://fourtheorem.com/what-can-you-do-with-eventbridge/

<br>

## 01-02. 仕組み

### アーキテクチャ

プロデューサーはメッセージを送信し、SQSは自身にこれを格納する。

その後、コンシューマーはSQSからメッセージを抽出し、後処理としてメッセージを削除する。

異なるVPC間でも、メッセージキューを同期できる。

![AmazonSQSとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/SQS.jpeg)

> - https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-difference-from-amazon-mq-sns.html

<br>

### プロトコル

一部の`L7`プロトコル (例：HTTP) のみをサポートしている。

一方で、一般的なメッセージプロトコル (例：AMQP、STOMP、MQTTなど) はサポートしていない。

> - https://www.quora.com/Should-Amazon-SQS-have-support-for-AMQP

<br>

## 02. セットアップ

### コンソール画面の場合

#### ▼ SQSの種類

| 設定項目         | 説明                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------- |
| スタンダード方式 | サブスクライバーの取得レスポンスを待たずに、次のキューを非同期的にフォワーディングする。 |
| FIFO方式         | サブスクライバーの取得レスポンスを待ち、キューを同期的にフォワーディングする。           |

<br>
