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

### TCPスリーウェイハンドシェイク

リクエストとレスポンスの送受信の前後に行われるTCPコネクションの確立のこと。

<br>

## 02. エラー

### Connection reset by peer

宛先にTCPリクエストを送信できたが、宛先がTCPレスポンスの返信することなくRSTパケットを返信した (通信のリセット) ことを表す。

> - https://zenn.dev/rescuenow/articles/a01f0effdf3391#%E3%80%8Cconnection-reset-by-peer%E3%80%8D%E3%81%A8%E3%81%AF%EF%BC%9F

<br>

### ECONNREFUSED

送信元が、TCPリクエストを待ち受けていない宛先のポート番号に対して、リクエストを送信したとする。

この場合に、宛先がTCPリクエストを拒否し、送信元に返信するエラーである。

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

TCPコネクション中に宛先のプロセスが終了し、コネクションを強制的に切断したとする。

この場合に、宛先がコネクションの予期せぬ切断として送信元に返信するエラーである。

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
