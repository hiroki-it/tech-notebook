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

リクエストとレスポンスの送受信の前後に行われるTCP接続の確立のこと。

<br>

### TCP KeepAlive

TCPリクエストのたびに、送信元と宛先間でTCPスリーウェイハンドシェイクを実施し直すのは非効率である。

そこで、宛先がTCP KeepAliveを定期的に送信し、送信元がACKパケットを返信することにより、TCPスリーウェイハンドシェイクが切断されないようにする。

![tcp-keepalive](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/tcp-keepalive.png)

> - https://milestone-of-se.nesuke.com/nw-basic/as-nw-engineer/keepalive-tcp-http/#toc2
> - https://www.ibm.com/docs/ja/zos/2.4.0?topic=functions-tcp-keepalive

<br>

## 02. エラー

### ECONNREFUSED

送信元が、TCPリクエストを待ち受けていない宛先のポート番号に対して、リクエストを送信したとする。

この場合に、宛先がTCPリクエストを拒否し、送信元に返信するエラーである。

<!-- prettier-ignore-start -->

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

<!-- prettier-ignore-end -->

> - https://hana-shin.hatenablog.com/entry/2022/04/06/205912#31-ECONNREFUSEDTCP%E3%81%AE%E5%A0%B4%E5%90%88

<br>

### ECONNRESET (Connection reset by peer)

`Connection reset by peer`ともいう。

TCP接続中に宛先のプロセスが終了し、接続を強制的に切断したとする。

この場合に、宛先が接続の予期せぬ切断として送信元に返信するエラーである。

宛先はRSTパケットを返信し、通信をリセットする。

<!-- prettier-ignore-start -->

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
             |                                          |  | TCP接続確立状態
             |                                          |  |    (ESTABLISHED状態)
             |                                          |  |
             ECONNRESET |<-------------- RST ----------------------| -*-
             |                                          |
```

<!-- prettier-ignore-end -->

> - https://hana-shin.hatenablog.com/entry/2022/04/06/205912#33-ECONNRESET
> - https://zenn.dev/rescuenow/articles/a01f0effdf3391#%E3%80%8Cconnection-reset-by-peer%E3%80%8D%E3%81%A8%E3%81%AF%EF%BC%9F

<br>
