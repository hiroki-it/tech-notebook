---
title: 【IT技術の知見】LogQL＠Grafana Loki
description: LogQL＠Grafana Lokiの知見を記録しています。
---

# LogQL＠Grafana Loki

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ログクエリ

### ログクエリとは

ログをクエリする。

> - https://grafana.com/docs/loki/latest/query/log_queries/

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

> - https://grafana.com/docs/loki/latest/query/metric_queries/

<br>

### count_over_time

**＊実行例＊**

5分間のログを集約する。

```bash
count_over_time({app="foo", namespace="foo"} |= "ERROR" [5m])
```

<br>
