---
title: 【IT技術の知見】Grafana＠監視ツール
description: Grafana＠監視ツールの知見を記録しています。
---

# Grafana＠監視ツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. Grafana の仕組み

### アーキテクチャ

Grafana は、ダッシュボードとストレージから構成されている。

監視フロントエンドとして、監視バックエンドで保管したメトリクスを可視化する。

![grafana_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images//grafana_architecture.png)

> - [Architecture of Grafana - Developers & API - Grafana Labs Community Forums](https://community.grafana.com/t/architecture-of-grafana/50090)

<br>

## 02. ユースケース

### システム監視ツールとして

#### ▼ データソース

- Amazon CloudWatch Metrics
- Cortex
- Google Cloud Monitoring
- Graphite
- Grafana Mimir
- InfluxDB
- M3DB
- Prometheus のローカル DB
- Thanos
- VictoriaMetrics

> - [【Grafana】利用可能なデータソースと、そのデータを可視化する方法をご紹介 #grafana - Qiita](https://qiita.com/MetricFire/items/15e024aea40785be622c)
> - [【Grafana】利用可能なデータソースと、そのデータを可視化する方法をご紹介 #grafana - Qiita](https://qiita.com/MetricFire/items/15e024aea40785be622c)

<br>

### BI ツールとして

#### ▼ データソース

- AWS Athena
- Google Cloud BigQuery
- Google スプレッドシート
- MySQL
- PostgreSQL
- Redis

> - https://lab.mo-t.com/blog/grafana

<br>

## 03. マネージド Grafana

Grafana のコンポーネントを部分的にマネージドにしたサービス。

執筆時点 (2023/05/16 時点) では、AWS マネージドにしてくれる。

> - [Connect to data sources or notification channels in Amazon VPC from Amazon Managed Grafana - Amazon Managed Grafana](https://docs.aws.amazon.com/grafana/latest/userguide/AMG-configure-vpc.html)

<br>
