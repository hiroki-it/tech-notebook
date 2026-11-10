---
title: 【IT技術の知見】Apache Kafka
description: Apache Kafkaの知見を記録しています。
tags:
  - "ミドルウェア"
  - "メッセージング系"
---

# Apache Kafka

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. Apache Kafka とは

メッセージストリームとして、メッセージを連続的にキューイングし、また加工したうえで連続的にルーティングする。

<br>

## 02. パブリッシュ

記入...

<br>

## 03. サブスクライプ

### プル型

プル型のサブスクライブの場合、サブスクライブによる購読予約を Kafka に実行して予約し、そのうえで Kafka にポーリング (Kafka Protocol) を実行する。

注意点として、RabbitMQ のプル型では、サブスクライバーは RabbitMQ にポーリング (HTTP、AMQP など) を実行し、メッセージの取得を待機する（サブスクライブによる購読予約はない）。

<br>

### プッシュ型

記入...

<br>
