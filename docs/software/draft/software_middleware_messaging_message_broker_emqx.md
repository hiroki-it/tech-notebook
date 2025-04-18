---
title: 【IT技術の知見】EMQX＠メッセージング系ミドルウェア
description: EMQX＠メッセージング系ミドルウェアの知見を記録しています。
---

# EMQX＠メッセージング系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. EMQXとは

メッセージブローカーとして、メッセージをキューイングし、また加工した上でルーティングする。

送受信の関係が多対多のパブリッシュ/サブスクライブパターンである。

> - https://www.cloudamqp.com/blog/rabbitmq-mqtt-vs-emqx.html

<br>

## 02. パブリッシュ

> - https://www.cloudamqp.com/blog/rabbitmq-mqtt-vs-emqx.html

<br>

## 03. サブスクライプ

宛先はEmqxにポーリングを実行し、メッセージをサブスクリプションする。

> - https://www.emqx.com/en/blog/mqtt-5-introduction-to-publish-subscribe-model

<br>

## 04. プロトコル

メッセージプロトコルの中でも特にMQTTプロトコルに対応している。

MQTTメッセージはヘッダーが非常に小さいため、ハードウェアリソースの使用量が少なくなる。

そのため、IoTでよく使用される。

<br>
