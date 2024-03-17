---
title: 【IT技術の知見】CloudEvents＠CNCF
description: CloudEvents＠CNCFの知見を記録しています。
---

# CloudEvents＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. CloudEventsとは

イベントを発行し、またイベントを送受信する。

異なる言語間で仕様が同じであるため、異なる言語に渡ってイベントを送受信できる。

イベントの送受信先には、メッセージキュー (例：AWS SQS、など) やメッセージブローカー (例：Apache Kafka、など) を使用する。

> - https://github.com/cloudevents/spec

<br>
