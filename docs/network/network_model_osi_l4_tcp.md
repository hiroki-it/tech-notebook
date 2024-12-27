---
title: 【IT技術の知見】TCP＠L4
description: TCP＠L4の知見を記録しています。
---

# TCP＠L4

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. TCPメッセージ

### TCPメッセージとは

トランスポート層で作成されるデータをTCPメッセージという。

<br>

## 02. エラー

### ECONNREFUSED

クライアントが、TCPリクエストを待ち受けていないサーバーのポート番号に対して、リクエストを送信したとする。

この場合に、サーバーがクライアントに返信するエラーである。

```yaml
client(192.168.122.181)                   server(192.168.122.216)
|                                          |
|                                          |
|                                          |
nc server 11111 |--------------- UDP datagram ------------>|
|                                          |
|                                          |
ECONNREFUSED |<-------------- ICMP port unreachable ----|
|                                          |
|                                          |
```

> - https://hana-shin.hatenablog.com/entry/2022/04/06/205912#31-ECONNREFUSEDTCP%E3%81%AE%E5%A0%B4%E5%90%88

<br>

### ECONNRESET

TCPコネクション中にサーバーのプロセスが終了したとする。

この場合に、サーバーがクライアントに返信するエラーである。

```yaml
client(192.168.122.181)                   server(192.168.122.216)
|                                          |
|                                          | nc -kl 11111
|                                          |
|                                          |
nc server 11111 |--------------- SYN --------------------->|
|<-------------- SYN+ACK ------------------|
|--------------- ACK --------------------->| -*-
|                                          |  |
|                                          |  |
|                                          |  | TCPコネクション確立状態
|                                          |  |    (ESTABLISHED状態)
|                                          |  |
ECONNRESET |<-------------- RST ----------------------| -*-
|                                          |
```

> - https://hana-shin.hatenablog.com/entry/2022/04/06/205912#33-ECONNRESET

<br>
