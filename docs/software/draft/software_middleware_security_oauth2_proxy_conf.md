---
title: 【IT技術の知見】設定ファイル＠OAuth2 Proxy
description: 設定ファイル＠OAuth2 Proxyの知見を記録しています。
---

# 設定ファイル＠OAuth2 Proxy

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## client

### client_id

```bash
client_id = "<クライアントID>"
```

<br>

### client_secret

```bash
client_secret = "<クライアントシークレット>"
```

<br>

## http

### http_address

```bash
http_address = "127.0.0.1:4180"
```

<br>

### https_address

```bash
https_address = ":443"
```

<br>

### provider

```bash
provider = "github"
```

<br>

## redirect

### redirect_url

```bash
redirect_url = "https://example.com/api/callback"
```

<br>

## upstreams

```bash
upstreams = [
  "http://127.0.0.1/"
]
```

<br>
