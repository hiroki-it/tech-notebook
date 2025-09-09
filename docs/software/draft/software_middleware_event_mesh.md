---
title: 【IT技術の知見】イベントメッシュ＠イベントメッシュ系ミドルウェア
description: イベントメッシュ＠イベントメッシュ系ミドルウェアの知見を記録しています。
---

# イベントメッシュ＠イベントメッシュ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. イベントメッシュ

### イベントメッシュとは

マイクロサービス間の通信方式でパブリッシュ/サブスクライブパターンを採用する場合に使用するメッシュ。

パブリッシュ/サブスクライブパターンでは、メッセージ仲介システムが専用のプロトコル (例：AMQP、MQTT、Kafka独自プロトコル) を使用することが多い。

一方で、サービスメッシュツールに適切なプロトコル (例：HTTPなど) に対応するメッセージ仲介システムは少ない。 (例：AWS SQS、AWS SNSなど)

イベントメッシュをツールを使用する方が良い。

> - https://atmarkit.itmedia.co.jp/ait/articles/2110/15/news007.html#013
> - https://www.redhat.com/ja/topics/integration/what-is-an-event-mesh
> - https://www.infoq.com/articles/service-mesh-event-driven-messaging/
> - https://solace.com/what-is-an-event-mesh/

<br>

### OSS

- Solance Event Mesh
- SAP Event Mesh
- Knative Eventing
- Apache EventMesh

> - https://www.slideshare.net/laclefyoshi/apache-eventmesh#13

<br>
