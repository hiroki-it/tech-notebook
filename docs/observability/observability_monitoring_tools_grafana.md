---
title: 【IT技術の知見】Grafana＠監視ツール
description: Grafana＠監視ツールの知見を記録しています。
---

# Grafana＠監視ツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Grafanaの仕組み

### アーキテクチャ

Grafanaは、ダッシュボードとストレージから構成されている。

監視フロントエンドとして、監視バックエンドで保管したメトリクスを可視化する。

![grafana_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images//grafana_architecture.png)

> - https://community.grafana.com/t/architecture-of-grafana/50090

<br>

## 02. ユースケース

### システム監視ツールとして

#### ▼ データソース

- AWS CloudWatch Metrics
- Cortex
- Google Cloud Monitoring
- Graphite
- Grafana Mimir
- InfluxDB
- M3DB
- PrometheusのローカルDB
- Thanos
- VictoriaMetrics

> - https://qiita.com/MetricFire/items/15e024aea40785be622c
> - https://qiita.com/MetricFire/items/15e024aea40785be622c

<br>

### BIツールとして

#### ▼ データソース

- AWS Athena
- Google Cloud BigQuery
- Googleスプレッドシート
- MySQL
- PostgreSQL
- Redis

> - https://lab.mo-t.com/blog/grafana

<br>

## 03. マネージドGrafana

Grafanaのコンポーネントを部分的にマネージドにしたサービス。

執筆時点 (2023/05/16時点) では、AWSマネージドにしてくれる。

> - https://docs.aws.amazon.com/grafana/latest/userguide/AMG-configure-vpc.html

<br>
