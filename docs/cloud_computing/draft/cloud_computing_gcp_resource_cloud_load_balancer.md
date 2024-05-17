---
title: 【IT技術の知見】Load Balancer＠Google Cloudリソース
description: Load Balancer＠Google Cloudリソースの知見を記録しています。
---

# Load Balancer＠Google Cloud

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Load Balancerとは

記入中...

<br>

## 02. 種類

### `L7`ロードバランサー

- 外部HTTPS負荷分散プロキシー
- 内部HTTPS負荷分散プロキシー

![google_cloud_load_balancer](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/google_cloud_load_balancer.png)

> - https://www.topgate.co.jp/blog/google-service/20716

<br>

### `L4`ロードバランサー

- TCP/SSLプロキシ負荷分散プロキシー
- TCP/UDPネットワーク負荷分散パススルー
- 内部TCP/UDP負荷分散パススルー

![google_cloud_load_balancer](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/google_cloud_load_balancer.png)

> - https://www.topgate.co.jp/blog/google-service/20716

<br>

## 03. セットアップ

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
