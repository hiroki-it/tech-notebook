---
title: 【IT技術の知見】イベントメッシュ＠イベントメッシュ系ミドルウェア
description: イベントメッシュ＠イベントメッシュ系ミドルウェアの知見を記録しています。
---

# イベントメッシュ＠イベントメッシュ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. イベントメッシュ

### イベントメッシュとは

メッセージブローカー／キューと通信するための非機能ロジックを中央集中管理するために使用するメッシュ。

パブリッシュ／サブスクライブ方式では、メッセージ中継システムが専用のプロトコル (例：AMQP、MQTT、Kafka 独自プロトコル) を使用することが多い。

サービスメッシュの恩恵は通信方式ではなく、使用する通信プロトコルによって異なる。Istio は HTTP プロトコルであればパブリッシュ／サブスクライブ方式も処理できるが、AMQP などは TCP として処理する。

メッセージブローカー／キュー向けの通信プロトコルが主要な場合は、イベントメッシュツールを使用するほうがよい。

> - [サービスメッシュ、Istioがマイクロサービスのトラフィック制御、セキュリティ、可観測性に欠かせない理由：Cloud Nativeチートシート（9） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2110/15/news007.html#013)
> - https://www.redhat.com/ja/topics/integration/what-is-an-event-mesh
> - [The Potential for Using a Service Mesh for Event-Driven Messaging - InfoQ](https://www.infoq.com/articles/service-mesh-event-driven-messaging/)
> - [What is an Event Mesh? \| Solace](https://solace.com/what-is-an-event-mesh/)

<br>

### OSS

- Solance Event Mesh
- SAP Event Mesh
- Knative Eventing
- Apache EventMesh

> - https://www.slideshare.net/laclefyoshi/apache-eventmesh#13

<br>
