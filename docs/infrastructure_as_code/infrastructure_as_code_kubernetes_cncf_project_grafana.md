---
title: 【IT技術の知見】Grafana＠CNCF
description: Grafana＠CNCFの知見を記録しています。
---

# Grafana＠CNCF

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

| データソース名       | 例                                                          |
| -------------------- | ----------------------------------------------------------- |
| TSDB                 | PrometheusのローカルDB、VictoriaMetrics、Graphite、InfluxDB |
| RDB                  | MySQL、PostgreSQL                                           |
| クラウドデータソース | AWS CloudWatch、Google CloudLogging                         |

> - https://qiita.com/MetricFire/items/15e024aea40785be622c

<br>

## 02. マネージドGrafana

Grafanaのコンポーネントを部分的にマネージドにしたサービス。

執筆時点 (2023/05/16時点) では、AWSマネージドにしてくれる。

> - https://docs.aws.amazon.com/grafana/latest/userguide/AMG-configure-vpc.html

<br>
