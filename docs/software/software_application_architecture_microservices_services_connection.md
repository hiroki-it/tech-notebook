---
title: 【IT技術の知見】マイクロサービス間通信＠マイクロサービス領域
description: マイクロサービス間通信＠マイクロサービス領域の知見を記録しています。
---

# マイクロサービス間通信＠マイクロサービス領域

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. リクエスト−レスポンスパターン

### リクエスト−レスポンスパターンとは

![service_request_response](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service_request_response.png)

マイクロサービス間で同期的に双方向で通信を実行する。

ドメインモデリングは、ステートソーシングパターンになる。

送信元と宛先で通信処理が同時に実行されるため、HTTPやgRPCによる同期通信を実行することになる。

また、マイクロサービス間で直接的にリクエストを送受信することになる。

使用することのできる通信プロトコルは以下の通りである。

| プロコトル   | 説明                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 従来のTCP/IP | 従来のTCP/IPプロトコルを使用する。                                                                                                                                                                                                                                                                                                                                                                              |
| gRPC         | HTTP/1.1に代わるHTTP/2 (例：gRPC、GraphQLなど) を使用する。HTTPプロトコルであると、通信相手のマイクロサービスのエンドポイントをコールした後、エンドポイントに紐づくコントローラーのメソッドが実行される。一方でgRPCであると、通信相手のマイクロサービスのメソッドを直接的に実行できる。そのため、HTTPよりもマイクロサービスの連携に適している。<br>・https://techdozo.dev/grpc-for-microservices-communication/ |

> - https://qiita.com/yasuabe2613/items/3bff44e662c922083264#%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8%E3%83%B3%E3%82%B0%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%AB%E3%81%AE%E5%95%8F%E9%A1%8C%E9%A0%98%E5%9F%9F

<br>

### リクエスト駆動型マイクロサービス

リクエスト−レスポンスパターンで稼働するマイクロサービスアーキテクチャのこと。

> - https://supunbhagya.medium.com/request-driven-vs-event-driven-microservices-7b1fe40dccde

<br>

### 仲介コンポーネント

#### ▼ ポイントツーポイントの場合

マイクロサービス間で直接的に通信する。

メッセージ仲介システムを経由するよりも、各マイクロサービスの結合度が高まってしまう。

一方で、マイクロサービスの実装が簡単になる。

> - https://www.linkedin.com/pulse/microservice-integration-patterns-point-to-point-vs-message-rhodes-7sfoc/

#### ▼ メッセージ仲介システムを経由する場合

メッセージキュー (例：AWS SQSなど) やメッセージブローカー (例：Apache Kafka、RabbitMQなど) を経由して、マイクロサービス間で通信する。

宛先マイクロサービスが永続化の責務を担っている場合は、処理の開始/終了を担保して処理完了の確実性を担保したがいい。

そのため、リクエスト−レスポンスパターンであってもマイクロサービス間に双方向のメッセージブローカーを設置する。

例えば、リクエスト−レスポンスパターンでオーケストレーションベースSagaパターンを採用する場合がある。

Sagaオーケストレーターの宛先マイクロサービスの間にメッセージブローカーを配置するのは、宛先マイクロサービスのローカルトランザクションを確実に完了するためである。

> - https://jackynote.medium.com/message-brokers-pros-cons-and-their-crucial-role-in-microservice-3dc6c0df2e53
> - https://www.linkedin.com/pulse/microservice-integration-patterns-point-to-point-vs-message-rhodes-7sfoc/

<br>

## 02. パブリッシュ−サブスクライブパターン

### パブリッシュ−サブスクライブパターンとは

![service_event_driven](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service_event_driven.png)

マイクロサービスからマイクロサービスに非同期的に一方向で通信する。

ドメインモデリングは、イベントソーシングパターンになる。

送信元と宛先で通信処理が独立して実行されるため、メッセージ仲介システムを経由した非同期通信を実行することになる。

送信元マイクロサービスはメッセージ仲介システムにメッセージをパブリッシュする。

サブスクライブには、宛先マイクロサービスによるプルベースと、メッセージ仲介システムによるプッシュベースがある。

> - https://en.wikipedia.org/wiki/Message_queue
> - https://qiita.com/yasuabe2613/items/3bff44e662c922083264#%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8%E3%83%B3%E3%82%B0%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%AB%E3%81%AE%E5%95%8F%E9%A1%8C%E9%A0%98%E5%9F%9F
> - https://aiven.io/blog/introduction-to-event-based-programming#asynchronous-request-response-with-events

<br>

### 仲介コンポーネント

#### ▼ ポイントツーポイントの場合

このパターンは存在しない。

#### ▼ メッセージ仲介システムを経由する場合

メッセージキュー (例：AWS SQSなど) やメッセージブローカー (例：Apache Kafka、RabbitMQなど) を経由して、マイクロサービス間で通信する。

モデリングがイベントソーシングの場合は、各マイクロサービスは非同期で通信した方がよく、一方向のメッセージブローカーを設置する。

特に、複数の送信元マイクロサービスからのリクエストを集約するような宛先マイクロサービスがある場合、その送信元にメッセージブローカーを配置すれば、宛先マイクロサービスのレートリミットを超過しないように、一定の間隔で通信をフォワーディングできる。

もしマイクロサービス間双方向に送信したい場合は、送信元マイクロサービスからメッセージを受信するメッセージブローカーと、宛先マイクロサービスから受信するメッセージブローカーを、別々に配置する。

> - https://en.wikipedia.org/wiki/Message_queue
> - https://www.scaleuptech.com/de/blog/api-gateway-vs-service-mesh-vs-message-queue/

<br>

### イベント駆動型マイクロサービス

パブリッシュ−サブスクライブパターンで稼働するマイクロサービスアーキテクチャのこと。

> - https://supunbhagya.medium.com/request-driven-vs-event-driven-microservices-7b1fe40dccde

<br>
