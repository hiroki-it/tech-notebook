---
title: 【IT技術の知見】メッセージング系ミドルウェア
description: メッセージング系ミドルウェアの知見を記録しています。
---

# メッセージング系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 送信元と宛先の対応関係

### プロデュース/コンシュームパターン

#### ▼ プロデュース/コンシュームパターンとは

> - https://fourtheorem.com/what-can-you-do-with-eventbridge/

#### ▼ プルベース

- AWS SQS

#### ▼ プッシュベース

記入中...

<br>

### パブリッシュ−サブスクライブパターン

#### ▼ パブリッシュ−サブスクライブパターンとは

送信元から宛先に非同期的に一方向で通信する。

送信元と宛先で通信処理が独立して実行されるため、メッセージ仲介システムを経由した非同期通信を実行することになる。

送信元はメッセージ仲介システムにメッセージをパブリッシュする。

プルベースのサブスクライブの場合、サブスクライバーはメッセージ仲介システムにポーリングを実行し、メッセージを取得する。

プッシュベースのサブスクライブの場合、メッセージ仲介システムはメッセージをサブスクライバーに送信する。

> - https://fourtheorem.com/what-can-you-do-with-eventbridge/

#### ▼ プルベース

- RabbitMQ (プルベースだけでなく、プッシュベースも選べる)
- Apache Kafka

#### ▼ プッシュベース

- RabbitMQ (プッシュベースだけでなく、プルベースも選べる)
- AWS SNS
- AWS EventBridge

<br>

### ストリーミングパターン

#### ▼ ストリーミングパターンとは

プルベースベースの場合、宛先はメッセージ仲介システムにポーリングを実行し、メッセージをストリーミングする。

プッシュベースの場合、メッセージ仲介システムは、メッセージをサブスクライバーにストリーミングする。

> - https://fourtheorem.com/what-can-you-do-with-eventbridge/

#### ▼ プルベース

- Apache Kafka
- AWS Kinesis (プルベースだけでなく、プッシュベースも選べる)

#### ▼ プッシュベース

- AWS Kinesis (プッシュベースだけでなく、プルベースも選べる)

<br>

## 02. 宛先のメッセージ受信方式

### プルベース

メッセージの宛先は、メッセージ仲介システムにポーリングを実行し、メッセージを受信する。

宛先で障害が起こっていても、障害の回復後にメッセージを処理すればよいため、耐障害性が高い。

> - https://qiita.com/riita10069/items/40b1bcc36c25b197077c

<br>

### プッシュベース

メッセージ仲介システムはサブスクライバーにメッセージを送信する。

宛先で障害が起こっていると、メッセージが損失する可能性があるため、耐障害性が低い。

これに対処するために、メッセージ仲介システムで、リトライやデッドレターキューが必要になる。

> - https://qiita.com/riita10069/items/40b1bcc36c25b197077c

<br>

## 03. メッセージ仲介システム

### メッセージブローカー

- Apache Kafka
- AWS SNS
- Google Cloud Pub/Sub
- RabbitMQ

<br>

### メッセージキュー

- AWS SQS
- EMQX

<br>

### イベントバス

- AWS EventBridge
- CloudEvents

> - https://www.akamai.com/glossary/what-is-an-event-bus

<br>

## 04. メッセージに使用するプロトコル

| プロトコル                           | 通信方式                     | 対応するメッセージ仲介システム例       | 一般的 |
| ------------------------------------ | ---------------------------- | -------------------------------------- | ------ |
| AMQP                                 | バイナリ                     | RabbitMQ、Apache Qpid                  | ✅     |
| MQTT                                 | バイナリ                     | EMQX                                   | ✅     |
| Kafka Protocol (Kafka独自プロトコル) | バイナリ                     | Apache Kafka                           | ✅     |
| STOMP                                | テキスト                     | RabbitMQ                               |        |
| HTTP/1.1、Webhook                    | テキスト (例：JSON、XMLなど) | AWS SQS、AWS SNS、Google Cloud Pub/Sub |        |
| HTTP/2 (例：gRPC、GraphQLなど)       | バイナリ (例：Protocolbuf)   | 調査中...                              |        |
| WebSocket                            | テキスト、バイナリ           | 調査中...                              |        |

<br>
