---
title: 【IT技術の知見】ネットワーク＠マイクロサービスアーキテクチャ
description: ネットワーク＠マイクロサービスアーキテクチャの知見を記録しています。
---

# ネットワーク＠マイクロサービスアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. マイクロサービス間通信の方式

### リクエストリプライ方式

#### ▼ リクエストリプライ方式とは

![service_request_reply](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service_request_reply.png)

マイクロサービス間で相互通信を実行する。

送信側と受信側で通信処理が同時に実行されるため、HTTPやgRPCによる同期通信を実行することになる。

また、マイクロサービス間で直接的にリクエストを送受信することになる。

> - https://qiita.com/yasuabe2613/items/3bff44e662c922083264#%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8%E3%83%B3%E3%82%B0%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%AB%E3%81%AE%E5%95%8F%E9%A1%8C%E9%A0%98%E5%9F%9F

#### ▼ 直接的な通信

リクエストリプライ方式では、直接的にマイクロサービス間の通信を実行する。

使用することのできる通信プロトコルは以下の通りである。

| プロコトル   | 説明                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 従来のTCP/IP | 従来のTCP/IPプロトコルを使用する。                                                                                                                                                                                                                                                                                                                                                                           |
| gRPC         | HTTP/`1.1`に代わるHTTP/`2.0` (例：gRPCなど) を使用する。HTTPプロトコルであると、通信相手のマイクロサービスのエンドポイントをコールした後、エンドポイントに紐づくコントローラーのメソッドが実行される。一方でgRPCであると、通信相手のマイクロサービスのメソッドを直接的に実行できる。そのため、HTTPよりもマイクロサービスの連携に適している。<br>・https://techdozo.dev/grpc-for-microservices-communication/ |

<br>

### イベント駆動方式

#### ▼ イベント駆動方式とは

![service_event_driven](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service_event_driven.png)

マイクロサービスからマイクロサービスに一方通行の通信を実行する。

送信側と受信側で通信処理が独立して実行されるため、メッセージキューを介した非同期通信を実行することになる。

> - https://en.wikipedia.org/wiki/Message_queue
> - https://qiita.com/yasuabe2613/items/3bff44e662c922083264#%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8%E3%83%B3%E3%82%B0%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%AB%E3%81%AE%E5%95%8F%E9%A1%8C%E9%A0%98%E5%9F%9F

#### ▼ メッセージキューを介した通信

イベント駆動方式では、メッセージキューを介してマイクロサービス間の通信を実行する。

メッセージキューにより、マイクロサービスの通信の方向が一方向になるように制限できる。

特に、複数のダウンストリーム側マイクロサービスからのリクエストを集約するようなアップストリーム側マイクロサービスがある場合、その前段にメッセージキューを配置すれば、アップストリーム側のマイクロサービスのレートリミットを超過しないように、一定の間隔で通信を転送できる。

もしマイクロサービス間双方向に送信したい場合は、ダウンストリーム側マイクロサービスからメッセージを受信するメッセージキューと、アップストリーム側マイクロサービスから受信するメッセージキューを、別々に配置する。

メッセージキュー (例：AWS SQS、など) やメッセージブローカー (例：Apache Kafka、など) を使用する。

> - https://en.wikipedia.org/wiki/Message_queue
> - https://www.scaleuptech.com/de/blog/api-gateway-vs-service-mesh-vs-message-queue/

<br>

## 02. 通信に伴う処理

### タイムアウト時間

#### ▼ マイクロサービスだけに着目する場合

ダウンストリーム側マイクロサービスよりもアップストリーム側マイクロサービスのタイムアウト時間を短くする。

```yaml
MS # 45秒
⬇⬆︎︎
⬇⬆︎︎︎︎
MS # 30秒
⬇⬆︎︎
⬇⬆︎︎
MS # 15秒
```

#### ▼ サイドカープロキシにも着目する場合

ダウンストリーム側マイクロサービスよりもサイドカーのタイムアウト時間を短くする。

また、サイドカーよりもアップストリーム側マイクロサービスのサイドカーのタイムアウト時間を短くする。

```yaml
MS # 45秒
⬇⬆︎︎
⬇⬆︎︎
サイドカー # 44秒
⬇⬆︎︎
--------------
⬇⬆︎︎
サイドカー # 31秒
⬇⬆︎︎
⬇⬆︎︎
MS # 30秒
⬇⬆︎︎
⬇⬆︎︎
サイドカー # 29秒
⬇⬆︎︎
--------------
⬇⬆︎︎
サイドカー # 16秒
⬇⬆︎︎
⬇⬆︎︎
MS # 15秒
```

<br>

## 03. 障害対策

### ロードバランシング

#### ▼ サーキットブレイカー

アップストリーム側マイクロサービスに障害が発生した時に、ダウンストリーム側マイクロサービスにエラーを返してしまわないよう、一旦マイクロサービスへのルーティングを停止し、直近の成功時の処理結果を返信する。

マイクロサービス間に配置され、他のマイクロサービスに連鎖的に起こる障害 (カスケード障害) を吸収する仕組みのこと。

blast-radiusを最小限にできる。

![circuit-breaker](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/circuit-breaker.png)

> - https://digitalvarys.com/what-is-circuit-breaker-design-pattern/

<br>
