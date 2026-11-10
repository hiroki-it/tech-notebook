---
title: 【IT技術の知見】EMQX
description: EMQXの知見を記録しています。
---

# EMQX

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. EMQX とは

メッセージブローカーとして、メッセージをキューイングし、また加工したうえでルーティングする。

送受信の関係が多対多のパブリッシュ／サブスクライブ方式である。

> - [RabbitMQ MQTT vs EMQX - CloudAMQP](https://www.cloudamqp.com/blog/rabbitmq-mqtt-vs-emqx.html)

<br>

## 02. パブリッシュ

> - [RabbitMQ MQTT vs EMQX - CloudAMQP](https://www.cloudamqp.com/blog/rabbitmq-mqtt-vs-emqx.html)

<br>

## 03. サブスクライプ

EMQX のサブスクライブはプッシュ型である。

EMQX はメッセージをサブスクライバーに送信する。

> - [Introduction to MQTT Publish-Subscribe Pattern \| EMQ](https://www.emqx.com/en/blog/mqtt-5-introduction-to-publish-subscribe-model)

<br>

## 04. プロトコル

メッセージプロトコルのなかでも特に MQTT プロトコルに対応している。

MQTT メッセージはヘッダーが非常に小さいため、ハードウェアリソースの使用量が少なくなる。

そのため、IoT でよく使用される。

<br>
