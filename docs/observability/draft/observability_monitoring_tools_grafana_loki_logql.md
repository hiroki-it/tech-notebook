---
title: 【IT技術の知見】LogQL
description: LogQLの知見を記録しています。
---

# LogQL

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. ログクエリ

### ログクエリとは

ログをクエリする。

> - [Log queries \| Grafana Loki documentation](https://grafana.com/docs/loki/latest/query/log_queries/)

<br>

## 02. メトリッククエリ

### メトリッククエリとは

ログをクエリし、指定した期間で集約する。

以下の関数を使用する。

- rate
- count_over_time
- bytes_rate
- bytes_over_time
- absent_over_time

> - [Metric queries \| Grafana Loki documentation](https://grafana.com/docs/loki/latest/query/metric_queries/)

<br>

### count_over_time

**＊実行例＊**

5 分間のログを集約する。

```bash
count_over_time({app="foo", namespace="foo"} |= "ERROR" [5m])
```

<br>
