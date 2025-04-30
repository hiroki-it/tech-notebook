---
title: 【IT技術の知見】RabbitMQ＠メッセージング系ミドルウェア
description: RabbitMQ＠メッセージング系ミドルウェアの知見を記録しています。
---

# RabbitMQ＠メッセージング系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. RabbitMQとは

メッセージブローカーとして、メッセージをキューイングし、また加工した上でルーティングする。

送受信の関係が多対多のパブリッシュ−サブスクライブパターンである。

> - https://tech.asoview.co.jp/entry/2022/04/06/102637
> - https://aws.amazon.com/jp/compare/the-difference-between-rabbitmq-and-kafka/

<br>

## 02. パブリッシュ

> - https://www.rabbitmq.com/docs/publishers#basics

<br>

## 03. サブスクライプ

### プルベース

宛先はRabbit MQにポーリングを実行し、メッセージを取得する。

> - https://www.rabbitmq.com/docs/consumers#polling

<br>

### プッシュベース

Rabbit MQは、メッセージを宛先にストリーミングする。

> - https://www.rabbitmq.com/docs/consumers#subscribing

<br>

## 04. プロトコル

メッセージプロトコル (例：AMQP、STOMP、MQTTなど) だけでなく、 一部の`L7`プロトコル (例：HTTP) にも対応している。

> - https://www.rabbitmq.com/docs/protocols
> - https://www.rabbitmq.com/docs/publishers#protocols

<br>
