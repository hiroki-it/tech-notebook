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

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview#command-line-options

<br>

### client_secret

```bash
client_secret = "<クライアントシークレット>"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview#command-line-options

<br>

## http

### http_address

```bash
http_address = "127.0.0.1:4180"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview#command-line-options

<br>

### https_address

```bash
https_address = ":443"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview#command-line-options

<br>

### provider

```bash
provider = "github"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview#command-line-options

<br>

## redirect_url

```bash
redirect_url = "https://example.com/api/callback"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview#command-line-options

<br>

## reverse_proxy

OAuth2 Proxyの前段に任意のリバースプロキシ (例：Nginx) があるかどうかを設定する。

```bash
reverse_proxy = true
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview#configuring-for-use-with-the-nginx-auth_request-directive

<br>

## upstreams

```bash
upstreams = [
  "http://127.0.0.1/"
]
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview#command-line-options
> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview#upstreams-configuration

<br>
