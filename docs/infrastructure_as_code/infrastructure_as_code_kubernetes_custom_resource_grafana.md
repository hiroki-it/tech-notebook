---
title: 【IT技術の知見】Grafana＠カスタムリソース
description: Grafana＠カスタムリソースの知見を記録しています。
---

# Grafana＠カスタムリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Grafanaの仕組み

### アーキテクチャ

Grafanaは、ダッシュボードとストレージから構成されている。PromQLに基づいて、収集されたメトリクスを可視化する。

> ℹ️ 参考：https://community.grafana.com/t/architecture-of-grafana/50090

![grafana_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images//grafana_architecture.png)

<br>

### データソース

> ℹ️ 参考：https://qiita.com/MetricFire/items/15e024aea40785be622c

| データソース名    | 例                                                   |
|------------|-----------------------------------------------------|
| TSDB       | PrometheusのローカルDB、VictoriaMetrics、Graphite、InfluxDB |
| RDB        | MySQL、PostgreSQL                                    |
| クラウドデータソース | AWS CloudWatch、Google Stackdriver                   |

<br>

### ダッシュボード

PromQLによるデータポイントの抽出をメトリクスとし、複数のメトリクスのセットをダッシュボードとして定義できる。
