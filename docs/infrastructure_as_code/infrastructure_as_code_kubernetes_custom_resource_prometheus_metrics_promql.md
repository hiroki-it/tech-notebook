---
title: 【IT技術の知見】PromQL＠メトリクス
description: PromQL＠メトリクス
---

# PromQL＠メトリクス

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 要素

### データ型

#### ▼ Instant vector

特定の時点の時系列データのこと。

> ↪️ 参考：
>
> - https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors
> - https://it-engineer.hateblo.jp/entry/2019/01/19/150849

#### ▼ Range vector

特定の期間の時系列データのこと。

> ↪️ 参考：
>
> - https://prometheus.io/docs/prometheus/latest/querying/basics/#range-vector-selectors
> - https://it-engineer.hateblo.jp/entry/2019/01/19/150849

#### ▼ Scalar

浮動小数点の数値型データのこと。

> ↪️ 参考：
>
> - https://it-engineer.hateblo.jp/entry/2019/01/19/150849
> - https://prometheus.io/docs/prometheus/latest/querying/basics/#float-literals

#### ▼ String

文字列型データのこと。

> ↪️ 参考：
>
> - https://it-engineer.hateblo.jp/entry/2019/01/19/150849
> - https://prometheus.io/docs/prometheus/latest/querying/basics/#string-literals

<br>

### 関数

#### ▼ by

同じ種類のデータポイントをラベル単位で集約する。

```bash
# 直近1時間に関して、Istioのistio-proxyコンテナが受信した総リクエストのデータポイントを、コンテナの種類ごとに集約する。
sum(rate(istio_requests_total{destination_app=~".*-gateway"}[1h])) by (destination_app)
```

> ↪️ 参考：https://qiita.com/t_nakayama0714/items/1231751e72804d52c20a#2-3-%E3%83%87%E3%83%BC%E3%82%BF%E3%82%92%E9%9B%86%E8%A8%88%E3%81%99%E3%82%8B

#### ▼ count

期間内の合計数を算出する。

> ↪️ 参考：https://www.opsramp.com/prometheus-monitoring/promql/

#### ▼ increase

rate関数のラッパーであり、rate関数の結果 (平均増加率) に、期間を自動的に掛けた数値 (期間あたりの増加数) を算出する。

```bash
# rate関数に期間 (今回は5m) を自動的に掛けた数値を算出する。
increase(foo_metrics[5m])
# foo_metricsの平均増加率 (%/秒) を集計する。
= rate(foo_metrics[1h]) * 5 * 60
```

> ↪️ 参考：https://promlabs.com/blog/2021/01/29/how-exactly-does-promql-calculate-rates

#### ▼ rate

平均増加率 (%/秒) を算出する。

常に同じ割合で増加していく場合、横一直線のグラフになる。

```bash
# 直近1時間に関して、foo_metricsの平均増加率 (%/秒) を集計する。
rate(foo_metrics[1h])
```

> ↪️ 参考：https://www.opsramp.com/prometheus-monitoring/promql/

#### ▼ `[]` (ウィンドウ)

直近、何時間 (分、秒) のデータポイントを集計するかを設定する。数値を大きくするほど、なだらかになる。

```bash
# 直近5分に関して、foo_metricsの平均増加率 (%/秒) を集計する。
rate(foo_metrics[5m])
```

> ↪️ 参考：
>
> - https://www.scsk.jp/sp/sysdig/blog/container_monitoring/promql_1.html
> - https://christina04.hatenablog.com/entry/prometheus-rate
> - https://qiita.com/t_nakayama0714/items/1231751e72804d52c20a#3-0-range-vector%E3%81%A8instant-vector>
> - https://gavin-zhou.medium.com/victoriametrics%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E3%82%88%E3%82%8A%E3%82%88%E3%81%84prometheus-rate-%E9%96%A2%E6%95%B0-6a69c36cee8f

<br>

## 02. データポイントの各種数値の算出

### データポイントの平均サイズ (KB/秒) の増加率

Prometheusで収集されたデータポイントの平均サイズ (KB/秒) の増加率を表す。

```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h])
```

<br>

### データポイントの合計数 (個/秒) の増加率

Prometheusで収集されたデータポイントの合計数 (個/秒) の増加率を表す。

```bash
rate(prometheus_tsdb_head_samples_appended_total[1h])
```

<br>

### データポイントの合計サイズ (KB/秒) の増加率

Prometheusで収集されたデータポイントの合計サイズ (KB/秒) の増加率を表す。

計算式からもわかるように、データポイントの収集の間隔を長くすることにより、データポイント数が減るため、合計のサイズを小さくできる。

```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h]) *
rate(prometheus_tsdb_head_samples_appended_total[1h])
```

> ↪️ 参考：https://engineering.linecorp.com/en/blog/prometheus-container-kubernetes-cluster/

<br>

### データポイントの合計サイズ (KB/日) の推移

Prometheusで収集されたデータポイントの合計サイズ (KB/日) の推移を表す。

```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h]) *
rate(prometheus_tsdb_head_samples_appended_total[1h]) *
60 * 60 * 24
```

<br>

## 03. ストレージの各種数値の算出

### ローカルストレージの必要サイズ (KB/日)

データポイントの合計サイズ (KB/日) とローカルストレージの部品ファイルの合計を表す。

ローカルストレージの部品ファイル分で、`20`%のサイズが必要になる。

この結果から、ローカルストレージの必要サイズを推測できる。

```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h]) *
rate(prometheus_tsdb_head_samples_appended_total[1h]) *
60 * 60 * 24 *
1.2
```

> ↪️ 参考：
>
> - https://www.robustperception.io/how-much-disk-space-do-prometheus-blocks-use/
> - https://www.robustperception.io/how-much-space-does-the-wal-take-up/
> - https://discuss.prometheus.io/t/prometheus-storage-requirements/268/4
> - https://gist.github.com/mikejoh/c172b2400909d33c37199c9114df61ef

<br>

### リモートストレージの必要サイズ (KB/日)

Prometheusで収集されたデータポイントの全サイズうち、リモートストレージに実際に送信しているサイズ (KB/日) を表す。

リモート書き込みサイズではなく、送信サイズであるため、書き込みに成功していない可能性があることに注意する。

この結果から、リモートストレージの必要サイズを推測できる。

補足として、リモートストレージが送信された全てのデータを保管できるとは限らないため、リモートストレージ側で必要サイズを確認する方がより正確である。

```bash
rate(prometheus_remote_storage_bytes_total[1h]) *
60 * 60 * 24
```

> ↪️ 参考：https://grafana.com/docs/agent/latest/flow/reference/components/prometheus.remote_write/#debug-metrics

<br>
