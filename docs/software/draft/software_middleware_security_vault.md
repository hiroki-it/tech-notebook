---
title: 【IT技術の知見】Vault＠セキュリティ系ミドルウェア
description: Vault＠セキュリティ系ミドルウェアの知見を記録しています。
---

# Vault＠セキュリティ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## Vaultとは

保管データを暗号化する。

また、クライアント証明書/SSL証明書の認証局として使用できる。

<br>

## api_addr

```hcl
api_addr = "http://127.0.0.1:8200"
```

> - https://blog.bedrock.day/c6c685ac64e211ed9870

<br>

## cluster_addr

```hcl
cluster_addr = "https://127.0.0.1:8201"
```

> - https://blog.bedrock.day/c6c685ac64e211ed9870

<br>

## disable_mlock

```hcl
disable_mlock = true
```

> - https://blog.bedrock.day/c6c685ac64e211ed9870

<br>

## listener

```hcl
listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = "true"
}
```

> - https://blog.bedrock.day/c6c685ac64e211ed9870

<br>

## storage

```hcl
storage "raft" {
  path    = "/vault/file"
  node_id = "node1"
}
```

> - https://blog.bedrock.day/c6c685ac64e211ed9870

<br>

## ui

```hcl
ui = true
```

> - https://blog.bedrock.day/c6c685ac64e211ed9870

<br>
