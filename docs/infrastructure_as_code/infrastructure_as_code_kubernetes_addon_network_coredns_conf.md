---
title: 【IT技術の知見】設定ファイル＠CoreDNS
description: 設定ファイル＠CoreDNSの知見を記録しています。
---

# 設定ファイル＠CoreDNS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

### `:53`

#### ▼ `:53`

名前解決時のドメイン名を設定する。

#### ▼ `.` (委任しない場合)

CoreDNSで名前解決を実行する。

```bash
.:53 {
  ...
}
```

#### ▼ `<接尾辞>` (委任する場合)

CoreDNSで名前解決を実行せずに、他のDNSサーバーに名前解決を委任する。

委任用のドメインを『スタブドメイン』という。

```bash
<接尾辞>:53 {
  ...
}
```

例えば、`consul.local`という接尾辞をつけてドメインを指定すると、`10.150.0.1`にあるDNSサーバーに名前解決を委任できる。

```bash
consul.local:53 {
  errors
  cache 30
  forward . 10.150.0.1
}
```

> - https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/#configuration-of-stub-domain-and-upstream-nameserver-using-coredns

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

### rewrite

Cluster内のDNS名とCluster外のドメインを紐づける。

```bash
.:53 {
  # foo.default.svc.cluster.local を foo.example.com に紐づける
  rewrite name foo.example.com foo.default.svc.cluster.local
}
```

> - https://zenn.dev/toshikish/articles/7f555dbf1b4b7d

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

#### ▼ prefer_udp

まずはUDPプロトコルによるルーティングを使用し、失敗した場合にTCPプロトコルを使用する。

```bash
.:53 {
  forward . /etc/resolv.conf {
    prefer_udp
    max_concurrent 1000
  }
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
