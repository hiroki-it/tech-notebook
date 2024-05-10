---
title: 【IT技術の知見】Load Balancer＠Google Cloudリソース
description: Load Balancer＠Google Cloudリソースの知見を記録しています。
---

# Load Balancer＠Google Cloud

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Load Balancer

### 種類

- ALB (外部、内部)
- NLB (プロキシ、パススルー)

<br>

### 追加ヘッダー

#### ▼ 種類

Load Balancerは、通過したリクエストにヘッダーを付与する。

- `Via`: `1.1 google`（リクエストとレスポンス）
- `X-Forwarded-Proto`: `<http、https>`（リクエストのみ）
- `X-Cloud-Trace-Context`: `<trace-id>/<span-id>;<trace-options>`（リクエストのみ）
- `X-Forwarded-For`: `[<supplied-value>,]<client-ip>,<load-balancer-ip>`（リクエストのみ）

> - https://cloud.google.com/load-balancing/docs/https?hl=ja#target-proxies

#### ▼ X-Cloud-Trace-Context

Google Cloud独自の仕様である。

> - https://cloud.google.com/trace/docs/trace-context?hl=ja#context-propagation-protocols

<br>
