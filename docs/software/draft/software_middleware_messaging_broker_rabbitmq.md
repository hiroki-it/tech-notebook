---
title: 【IT技術の知見】RabbitMQ＠メッセージブローカー系ミドルウェア
description: RabbitMQ＠メッセージブローカー系ミドルウェアの知見を記録しています。
---

# RabbitMQ＠メッセージブローカー系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. RabbitMQとは

メッセージブローカーとして、メッセージをキューイングし、また加工した上でルーティングする。

<br>

## 02. プロトコル

メッセージングプロトコル (例：AMQP、STOMP、MQTT、など) だけでなく、 一部の`L7`プロトコル (例：HTTP) にも対応している。

> - https://www.rabbitmq.com/docs/protocols

<br>
