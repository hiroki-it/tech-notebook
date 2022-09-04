---
title: 【IT技術の知見】PromQL＠Prometheus
description: PromQL＠Prometheus
---

# PromQL＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. ロジック

### データ型

#### ▼ Instant vector

特定の時点の時系列データのこと。

> ℹ️ 参考：https://it-engineer.hateblo.jp/entry/2019/01/19/150849

#### ▼ Range vector

特定の期間の時系列データのこと。

> ℹ️ 参考：https://it-engineer.hateblo.jp/entry/2019/01/19/150849

#### ▼ Scalar

浮動小数点の数値型データのこと。

> ℹ️ 参考：https://it-engineer.hateblo.jp/entry/2019/01/19/150849

#### ▼ String

文字列型データのこと。

> ℹ️ 参考：https://it-engineer.hateblo.jp/entry/2019/01/19/150849

<br>

### 関数

#### ▼ count

期間内の合計数を算出する。

> ℹ️ 参考：https://www.opsramp.com/prometheus-monitoring/promql/

#### ▼ increase

rate関数のラッパーであり、rate関数の結果（1秒当たりの平均増加率）に、期間を自動的に掛けた数値（期間あたりの増加数）を算出する。

> ℹ️ 参考：https://promlabs.com/blog/2021/01/29/how-exactly-does-promql-calculate-rates

```bash
# rate関数に期間（今回は5m）を自動的に掛けた数値を算出する。
increase(foo_metrics[5m])
= rate(foo_metrics[1h]) * 5 * 60
```

#### ▼ rate

平均増加率（%/秒）を算出する。常に同じ割合で増加していく場合、横一直線のグラフになる。

> ℹ️ 参考：https://www.opsramp.com/prometheus-monitoring/promql/

<br>

## 02. メトリクス

### ```prometheus_tsdb_*```

#### ▼ prometheus_tsdb_head_samples_appended_total

Prometheusが収集したデータポイントの合計数を表す。

> ℹ️ 参考：
>
> - https://valyala.medium.com/prometheus-storage-technical-terms-for-humans-4ab4de6c3d48
> - https://christina04.hatenablog.com/entry/prometheus-node-exporter


#### ▼ prometheus_tsdb_compaction_chunk_size_bytes_sum

Prometheusが作成したチャンクの合計サイズ（KB）を表す。

> ℹ️ 参考：
>
> - https://valyala.medium.com/prometheus-storage-technical-terms-for-humans-4ab4de6c3d48
> - https://christina04.hatenablog.com/entry/prometheus-node-exporter



#### ▼ prometheus_tsdb_compaction_chunk_samples_sum

Prometheusが作成したチャンクの合計数を表す。

> ℹ️ 参考：
>
> - https://valyala.medium.com/prometheus-storage-technical-terms-for-humans-4ab4de6c3d48
> - https://christina04.hatenablog.com/entry/prometheus-node-exporter

<br>

## 03. クエリのプラクティス

### データポイントの各種数値の算出

#### ▼ データポイントの平均サイズ（KB/秒）の増加率

Prometheusで収集されたデータポイントの平均サイズ（KB/秒）の増加率を分析する。

```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h])
```

#### ▼ データポイントの合計数（個/秒）の増加率

Prometheusで収集されたデータポイントの合計数（個/秒）の増加率を分析する。

```bash
rate(prometheus_tsdb_head_samples_appended_total[1h])
```

#### ▼ データポイントの合計サイズ（KB/秒）の増加率

Prometheusで収集されたデータポイントの合計サイズ（KB/秒）の増加率を分析する。計算式からもわかるように、データポイントの収集の間隔を長くすることにより、データポイント数が減るため、合計のサイズを小さくできる。

> ℹ️ 参考：https://engineering.linecorp.com/en/blog/prometheus-container-kubernetes-cluster/

```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h]) *
rate(prometheus_tsdb_head_samples_appended_total[1h])
```

#### ▼ データポイントの合計サイズ（KB/日）の推移

Prometheusで収集されたデータポイントの合計サイズ（KB/日）の推移を分析する。

```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h]) *
rate(prometheus_tsdb_head_samples_appended_total[1h]) *
60 * 60 * 24
```

<br>

### ストレージの各種数値の算出

#### ▼ ローカルストレージの必要サイズ（KB/日）

データポイントの合計サイズ（KB/日）とローカルストレージの部品ファイルの合計を分析する。ローカルストレージの部品ファイル分で、```20```%のサイズが必要になる。この結果から、ローカルストレージの必要サイズを推測できる。

```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h]) *
rate(prometheus_tsdb_head_samples_appended_total[1h]) *
60 * 60 * 24 *
1.2
```

> ℹ️ 参考：
>
> - https://www.robustperception.io/how-much-disk-space-do-prometheus-blocks-use/
> - https://www.robustperception.io/how-much-space-does-the-wal-take-up/
> - https://discuss.prometheus.io/t/prometheus-storage-requirements/268/4
> - https://gist.github.com/mikejoh/c172b2400909d33c37199c9114df61ef

#### ▼ リモートストレージの必要サイズ（KB/日）

Prometheusで収集されたデータポイントの全サイズうち、リモートストレージに実際に送信しているサイズ（KB/日）を分析する。この結果から、リモートストレージの必要サイズを推測できる。なお、リモートストレージが送信された全てのデータを保管できるとは限らないため、リモートストレージ側で必要サイズを確認する方がより正確である。

```bash
rate(prometheus_remote_storage_bytes_total[1h]) *
60 * 60 * 24
```

<br>
