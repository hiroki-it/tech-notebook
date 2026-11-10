---
title: 【IT技術の知見】設定ファイル
description: 設定ファイルの知見を記録しています。
---

# 設定ファイル

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. accessLog

```yaml
accessLog: {}
```

> - [Redirecting...](https://doc.traefik.io/traefik/observability/access-logs/)

<br>

## 02. log

```yaml
log:
  filePath: /path/to/log-file.log
  format: json
```

> - [Redirecting...](https://doc.traefik.io/traefik/observability/logs/)

<br>

## 03. tracing

```yaml
tracing: {}
```

> - [Redirecting...](https://doc.traefik.io/traefik/observability/tracing/opentelemetry/)

<br>
