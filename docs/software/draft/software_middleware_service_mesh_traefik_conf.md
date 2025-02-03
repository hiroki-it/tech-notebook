---
title: 【IT技術の知見】設定ファイル＠Traefik
description: 設定ファイル＠Traefikの知見を記録しています。
---

# 設定ファイル＠Traefik

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## accessLog

```yaml
accessLog: {}
```

> - https://doc.traefik.io/traefik/observability/access-logs/

<br>

## log

```yaml
log:
  filePath: /path/to/log-file.log
  format: json
```

> - https://doc.traefik.io/traefik/observability/logs/

<br>

## tracing

```yaml
tracing: {}
```

> - https://doc.traefik.io/traefik/observability/tracing/opentelemetry/

<br>
