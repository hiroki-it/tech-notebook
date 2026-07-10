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

メッセージブローカーとして、メッセージをキューイングし、また加工したうえでルーティングする。

送受信の関係が多対多のパブリッシュ／サブスクライブ方式である。

> - https://www.cloudamqp.com/blog/rabbitmq-mqtt-vs-emqx.html

<br>

## 02. パブリッシュ

> - https://www.cloudamqp.com/blog/rabbitmq-mqtt-vs-emqx.html

<br>

## 03. サブスクライプ

EMQX のサブスクライブはプッシュ型である。

EMQX はメッセージをサブスクライバーに送信する。

> - https://www.emqx.com/en/blog/mqtt-5-introduction-to-publish-subscribe-model

<br>

## 04. プロトコル

メッセージプロトコルのなかでも特に MQTT プロトコルに対応している。

MQTT メッセージはヘッダーが非常に小さいため、ハードウェアリソースの使用量が少なくなる。

そのため、IoT でよく使用される。

<br>
