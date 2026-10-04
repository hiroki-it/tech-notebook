---
title: 【IT技術の知見】RabbitMQ＠メッセージング系ミドルウェア
description: RabbitMQ＠メッセージング系ミドルウェアの知見を記録しています。
---

# RabbitMQ＠メッセージング系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. RabbitMQ とは

メッセージブローカーとして、メッセージをキューイングし、また加工したうえでルーティングする。

送受信の関係が多対多のパブリッシュ／サブスクライブ方式である。

> - [Amazon Kinesis Data Streams + Protocol Buffersで実現するイベント駆動アーキテクチャー - asoview! Tech Blog](https://tech.asoview.co.jp/entry/2022/04/06/102637)
> - [カフカ対ラビットMQ？ カフカと RabbitMQ の違い-AWS](https://aws.amazon.com/jp/compare/the-difference-between-rabbitmq-and-kafka/)

<br>

## 02. パブリッシュ

> - [Publishers \| RabbitMQ](https://www.rabbitmq.com/docs/publishers#basics)

<br>

## 03. サブスクライプ

### プル型

プル型のサブスクライブの場合、サブスクライバーは RabbitMQ にポーリング (HTTP) を実行し、メッセージの取得を待機する（購読予約はない）。

注意点として、Kafka のプル型は RabbitMQ と仕組みが異なり、サブスクライブによる購読予約を Kafka に実行して予約し、そのうえで Kafka にポーリング (Kafka Protocol) を実行する必要がある。

> - [Consumers \| RabbitMQ](https://www.rabbitmq.com/docs/consumers#polling)

<br>

### プッシュ型

プッシュ型のサブスクライブの場合、Rabbit MQ はメッセージを宛先に送信する。

> - [Consumers \| RabbitMQ](https://www.rabbitmq.com/docs/consumers#subscribing)

<br>

## 04. プロトコル

メッセージプロトコル (例：AMQP、STOMP、MQTT など) だけでなく、 一部の `L7` プロトコル (例：HTTP) にも対応している。

> - [Which protocols does RabbitMQ support? \| RabbitMQ](https://www.rabbitmq.com/docs/protocols)
> - [Publishers \| RabbitMQ](https://www.rabbitmq.com/docs/publishers#protocols)

<br>
