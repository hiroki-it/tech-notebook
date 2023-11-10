---
title: 【IT技術の知見】設定ファイル＠CoreDNS
description: 設定ファイル＠CoreDNSの知見を記録しています。
---

# 設定ファイル＠CoreDNS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

### errors

エラーの出力先を設定する。

```bash
.:53 {
  errors
}
```

<br>

### health

CoreDNSのヘルスチェックを開始するまでの待機時間を設定する。

```bash
.:53 {
  health {
      lameduck 5s
  }
}
```

<br>

### ready

```bash
.:53 {
  ready
}
```

<br>

### kubernetes

```bash
.:53 {
  kubernetes cluster.local in-addr.arpa ip6.arpa {
      pods insecure
       fallthrough in-addr.arpa ip6.arpa
       ttl 30
  }
}
```

<br>

### prometheus

```bash
.:53 {
  prometheus :9153
}
```

<br>

### forward

まずはUDPプロトコルによるルーティングを使用し、失敗した場合にTCPプロトコルを使用する。

```bash
.:53 {
  forward . /etc/resolv.conf {
    prefer_udp
    max_concurrent 1000
}
```

<br>

### cache

```bash
.:53 {
  cache 30
}
```

<br>

### loop

```bash
.:53 {
  loop
}
```

<br>

### reload

```bash
.:53 {
  reload
}
```

<br>

### loadbalance

DNSロードバランシングを有効化する。

```bash
.:53 {
  loadbalance
}
```

<br>

### hosts

```bash
.:53 {
  hosts {
     *.*.*.* <ホスト名>
  }
}
```

<br>
