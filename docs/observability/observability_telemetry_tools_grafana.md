---
title: 【IT技術の知見】Grafana＠テレメトリー監視ツール
description: Grafana＠テレメトリー監視ツールの知見を記録しています。
---

# Grafana＠テレメトリー監視ツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Grafanaの仕組み

### アーキテクチャ

Grafanaは、ダッシュボードとストレージから構成されている。

PromQLに基づいて、収集されたメトリクスを可視化する。

![grafana_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images//grafana_architecture.png)

> - https://community.grafana.com/t/architecture-of-grafana/50090

<br>

### データソース

#### ▼ TSDB

- PrometheusのローカルDB
- VictoriaMetrics
- Graphite
- InfluxDB
- Grafana Mimir
- M3DB
- Thanos
- Cortex

> - https://qiita.com/MetricFire/items/15e024aea40785be622c

#### ▼ RDB

- MySQL
- PostgreSQL

> - https://qiita.com/MetricFire/items/15e024aea40785be622c

#### ▼ クラウドデータソース

- AWS CloudWatch
- Google Cloud Logging

> - https://qiita.com/MetricFire/items/15e024aea40785be622c

<br>

## 02. マネージドGrafana

Grafanaのコンポーネントを部分的にマネージドにしたサービス。

執筆時点 (2023/05/16時点) では、AWSマネージドにしてくれる。

> - https://docs.aws.amazon.com/grafana/latest/userguide/AMG-configure-vpc.html

<br>
