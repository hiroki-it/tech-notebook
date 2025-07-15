---
title: 【IT技術の知見】Grafana Mimir＠Grafana
description: Grafana Mimir＠Grafanaの知見を記録しています。
---

# Grafana Mimir＠Grafana

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## Grafana Mimirの仕組み

### アーキテクチャ

#### ▼ リモートストレージとして

書き込みエンドポイントを指定すれば、ingesterを経由して、任意のオブジェクトストレージにメトリクスを書き込める。

読み込みエンドポイントを指定すれば、store-gatewayを経由して、任意のオブジェクトストレージからメトリクスを取得できる。

> - https://grafana.com/docs/mimir/latest/get-started/about-grafana-mimir-architecture/
> - https://news.ycombinator.com/item?id=32779662

<br>

### オブジェクトストレージ

- AWS S3
- MinIO

<br>
