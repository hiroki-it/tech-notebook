---
title: 【IT技術の知見】PromQL＠メトリクス
description: PromQL＠メトリクス
---

# PromQL＠メトリクス

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 要素

### データ型

#### ▼ Instant vector

特定の時点の時系列データのこと。

> - https://prometheus.io/docs/prometheus/latest/querying/basics/#instant-vector-selectors
> - https://it-engineer.hateblo.jp/entry/2019/01/19/150849

#### ▼ Range vector

特定の期間の時系列データのこと。

> - https://prometheus.io/docs/prometheus/latest/querying/basics/#range-vector-selectors
> - https://it-engineer.hateblo.jp/entry/2019/01/19/150849

#### ▼ Scalar

浮動小数点の数値型データのこと。

> - https://it-engineer.hateblo.jp/entry/2019/01/19/150849
> - https://prometheus.io/docs/prometheus/latest/querying/basics/#float-literals

#### ▼ String

文字列型データのこと。

> - https://it-engineer.hateblo.jp/entry/2019/01/19/150849
> - https://prometheus.io/docs/prometheus/latest/querying/basics/#string-literals

<br>

### 演算子

#### ▼ ワイルドカード

`=~`演算子を使用して正規表現マッチングを有効化し、`.*`演算子や `$`演算子でワイルドカードを適用する。

```bash
# 前方一致
resource.labels.pod_name=~"foo-pod-.*"
```

```bash
# 後方一致
resource.labels.pod_name=~"pod$"
```

```bash
# 部分一致
resource.labels.pod_name=~".*pod.*"
```

> - https://cocoinit23.com/prometheus-query-regular-expression-wildcard/

#### ▼ エスケープ

正規表現で記号をエスケープする場合、Grafanaでは２つのバックスラッシュ (`\\`) を使用する。

**＊実行例＊**

`|`という記号をエスケープするために、`\\`を使用している。

```bash
sum(envoy_cluster_outlier_detection_ejections_active{pod=~"^foo.*$",namespace=~"bookinfo", cluster_name=~".*\\|v2\\|bar.*"}) by (pod,cluster_name)
```

> - https://github.com/grafana/grafana/issues/4234#issuecomment-191683898

<br>

### 関数

#### ▼ by

同じ種類のデータポイントをラベル単位で集約する。

```bash
sum(<メトリクス名>) by (<ラベル>)
```

**例**

直近1時間に関して、Istioの `istio-proxy`コンテナの受信リクエストのテータポイント数を、コンテナの種類ごとに集約する。

```bash
sum(idelta(istio_requests_total[1h])) by (destination_app)

# 結果
{destination_app="foo-container"} <集計値>
```

**例**

任意の期間内に関して、Istioの `istio-proxy`コンテナの受信リクエストのテータポイント数の増加量を集計する。

```bash
sum(increase(istio_requests_total{destination_workload_namespace="default"}[$__range:])) by (destination_service)
```

**例**

任意の期間内に関して、Istioの `istio-proxy`コンテナの処理時間の一番高い値を集計する。

```bash
max(max_over_time(rate(istio_request_duration_milliseconds_sum{destination_service_namespace="default"}[$__rate_interval])[$__range:])) by (destination_service)
```

**例**

任意の期間内に関して、Istioの `istio-proxy`コンテナの処理時間の平均を集計する。

```bash
avg(avg_over_time(rate(istio_request_duration_milliseconds_sum{destination_service_namespace="default"}[$__rate_interval])[$__range:])) by (destination_service)
```

**例**

複数の種類で集約することもできる。

直近1時間に関して、Istioの `istio-proxy`コンテナで収集したレスポンスの補足メッセージ (`%RESPONSE_FLAGS%`変数) を、Pod名、変数値の種類ごとに集約する。

```bash
sum(idelta(istio_requests_total{response_flags!="-"}[1h])) by (pod_name, response_flags)

# 結果
{pod_name="ingressgateway-pod", response_flags="DC"} <集計値>
{pod_name="ingressgateway-pod", response_flags="DPE"} <集計値>
{pod_name="ingressgateway-pod", response_flags="URX"} <集計値>
{pod_name="foo-pod", response_flags="DC"} <集計値>
{pod_name="foo-pod", response_flags="DPE"} <集計値>
{pod_name="foo-pod", response_flags="URX"} <集計値>
...
```

> - https://qiita.com/t_nakayama0714/items/1231751e72804d52c20a#2-3-%E3%83%87%E3%83%BC%E3%82%BF%E3%82%92%E9%9B%86%E8%A8%88%E3%81%99%E3%82%8B

#### ▼ count

期間内の合計数を集計する。

> - https://www.opsramp.com/prometheus-monitoring/promql/

#### ▼ increase

rate関数のラッパーであり、rate関数の結果 (平均増加率) に、期間を自動的に掛けた数値 (期間当たりの増加数) を集計する。

**＊例＊**

rate関数に期間 (今回は5m) を自動的に掛けた数値を集計する。

```bash
increase(<メトリクス名>[5m])
# メトリクスの平均増加率 (%/秒) を集計する。
= rate(<メトリクス名>[1h]) * 5 * 60
```

> - https://promlabs.com/blog/2021/01/29/how-exactly-does-promql-calculate-rates

#### ▼ sum

**例**

Envoyに登録された全ての宛先のうち、正常なクラスターの割合を集計する。

```bash
sum(envoy_cluster_membership_healthy) / sum(envoy_cluster_membership_total)
```

> - https://developer.hashicorp.com/consul/docs/connect/observability/grafanadashboards/consuldataplanedashboard#unhealthy-clusters

#### ▼ rate

平均増加率 (%/秒) を集計する。

常に同じ割合で増加していく場合、横一直線のグラフになる。

メトリクス型がCounterの場合は`rate`関数で秒あたりの変化を集計し、これを`sum`関数で合計できる。

一方で、Gaugeであると`rate`関数は使用できない。

```bash
# 秒あたりの平均増加率を１分間で集計する
rate(<メトリクス名>[1m])
```

```bash
# 分あたりの平均増加率を１分間で集計する
rate(<メトリクス名>[1m]) * 60
```

> - https://chronosphere.io/learn/an-introduction-to-the-four-primary-types-of-prometheus-metrics/

**例**

直近`n`分や`n`時間に関して、メトリクスの平均増加率 (%/秒) を集計する。

集計の時間が短い場合 (例：1m、5m) 、急激な変化の影響を受けるため、短期間の傾向を反映した値になる。

リアルタイム性が重要な場合 (CPUやメモリの使用率、ステータスコード、リクエスト数の急激な変化) は、短くする。

```bash
# 秒あたりの平均増加率を１分間で集計する
rate(<メトリクス名>[1m])
```

集計の時間が長い場合 (例：1h) 、急激な変化の影響を受けないため、長期間の傾向を反映した値になる。

長期的な傾向を知りたい場合 (リクエスト数の長期的な傾向) は重要な場合は、短くする。

```bash
# 秒あたりの平均増加率を１時間で集計する
rate(<メトリクス名>[1h])
```

> - https://www.opsramp.com/prometheus-monitoring/promql/

**例**

![istio_request_duration_milliseconds_sum](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_request_duration_milliseconds_sum.png)

`reporter="source"`の場合、送信元`istio-proxy`コンテナに対して、宛先 `istio-proxy`コンテナの先にあるアプリがレスポンスを返信する平均レスポンスタイムを集計する。

```bash
rate(istio_request_duration_milliseconds_sum{reporter="source"}[5m])/ rate(istio_request_duration_milliseconds_count{reporter="source"}[5m])
```

`reporter="destination"`の場合、宛先`istio-proxy`コンテナに対して、アプリがレスポンスを返信する平均レスポンスタイムを集計する。

```bash
rate(istio_request_duration_milliseconds_sum{reporter="destination"}[5m])/ rate(istio_request_duration_milliseconds_count{reporter="destination"}[5m])
```

> - https://grafana.com/docs/grafana-cloud/monitor-applications/asserts/enable-prom-metrics-collection/infrastructure/istio/#request-error-and-latency-metrics
> - https://stackoverflow.com/q/62137292/12771072

**例**

400ステータスのレスポンスを集計する。

`reporter="source"`の場合、送信元`istio-proxy`コンテナに対して、宛先 `istio-proxy`コンテナがアプリから受信したステータスコードを集計する。

```bash
sum(rate(istio_requests_total{reporter="source", response_code=~"4.*"}[5m])) / sum(rate(istio_requests_total{reporter="destination"}[5m]))
```

`reporter="destination"`の場合、送信元`istio-proxy`コンテナに対して、宛先 `istio-proxy`コンテナがアプリから受信したステータスコードを集計する。

特に、クライアントが接続を切断し、宛先`istio-proxy`コンテナレスポンスを返信できなかった場合には、`reporter="source"`ラベルを指定しないと`response_code=0`を集計できない。

```bash
sum(rate(istio_requests_total{reporter="destination", response_code=~"4.*"}[5m])) / sum(rate(istio_requests_total{reporter="destination"}[5m]))
```

> - https://cloud.google.com/stackdriver/docs/managed-prometheus/exporters/istio?hl=ja#rules-alerts
> - https://github.com/istio/istio/discussions/47571

#### ▼ `[]` (ウィンドウ)

直近、何時間 (分、秒) のデータポイントを集計するかを設定する。数値を大きくするほど、なだらかになる。

**例**

直近5分に関して、メトリクスの平均増加率 (%/秒) を集計する。

```bash
rate(<メトリクス名>[5m])
```

> - https://www.scsk.jp/sp/sysdig/blog/container_monitoring/promql_1.html
> - https://christina04.hatenablog.com/entry/prometheus-rate
> - https://qiita.com/t_nakayama0714/items/1231751e72804d52c20a#3-0-range-vector%E3%81%A8instant-vector>
> - https://gavin-zhou.medium.com/victoriametrics%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E3%82%88%E3%82%8A%E3%82%88%E3%81%84prometheus-rate-%E9%96%A2%E6%95%B0-6a69c36cee8f

<br>

## 02. データポイントの有無

### コンテナが起動/停止しているか

Prometheusでデータポイントを収集できるか否かで、コンテナの起動/停止を表す。

```bash
absent(container_tasks_state{name="<コンテナ名>",state="running"}) == 1
```

> - https://zenn.dev/big_tanukiudon/scraps/3c44bbd33de4d3

<br>

## 03. データポイントの各種数値の集計

### データポイントの平均サイズ (KB/秒) の増加率

Prometheusで収集されたデータポイントの平均サイズ (KB/秒) の増加率を表す。

```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h])

# 結果
{container="prometheus", endpoint="web", instance="*.*.*.*:9090", job="foo-prometheus", namespace="prometheus", pod="foo-prometheus-pod", service="oo-prometheus-service"} <集計値>
```

<br>

### データポイントの合計数 (個/秒) の増加率

Prometheusで収集されたデータポイントの合計数 (個/秒) の増加率を表す。

```bash
rate(prometheus_tsdb_head_samples_appended_total[1h])

# 結果
{container="prometheus", endpoint="web", instance="*.*.*.*:9090", job="foo-prometheus", namespace="prometheus", pod="foo-prometheus-pod", service="oo-prometheus-service"} <集計値>
```

<br>

### データポイントの合計サイズ (KB/秒) の増加率

Prometheusで収集されたデータポイントの合計サイズ (KB/秒) の増加率を表す。

計算式からもわかるように、データポイントの収集の間隔を長くすることにより、データポイント数が減るため、合計のサイズを小さくできる。

```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h]) *
rate(prometheus_tsdb_head_samples_appended_total[1h])

# 結果
{container="prometheus", endpoint="web", instance="*.*.*.*:9090", job="foo-prometheus", namespace="prometheus", pod="foo-prometheus-pod", service="oo-prometheus-service"} <集計値>
```

> - https://engineering.linecorp.com/en/blog/prometheus-container-kubernetes-cluster/

<br>

### データポイントの合計サイズ (KB/日) の推移

Prometheusで収集されたデータポイントの合計サイズ (KB/日) の推移を表す。

```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h]) *
rate(prometheus_tsdb_head_samples_appended_total[1h]) *
60 * 60 * 24

# 結果
{container="prometheus", endpoint="web", instance="*.*.*.*:9090", job="foo-prometheus", namespace="prometheus", pod="foo-prometheus-pod", service="oo-prometheus-service"} <集計値>
```

<br>

## 04. ストレージの各種数値の集計

### ローカルストレージ

#### ▼ 必要データサイズ (KB/日)

データポイントの合計サイズ (KB/日) とローカルストレージの部品ファイルの合計を表す。

ローカルストレージの部品ファイル分で、`20`%のサイズが必要になる。

この結果から、ローカルストレージの必要データサイズを推測できる。

```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h]) *
rate(prometheus_tsdb_head_samples_appended_total[1h]) *
60 * 60 * 24 *
1.2

# 結果
{container="prometheus", endpoint="web", instance="*.*.*.*:9090", job="foo-prometheus", namespace="prometheus", pod="foo-prometheus-pod", service="foo-prometheus-service"} <集計値>
```

> - https://www.robustperception.io/how-much-disk-space-do-prometheus-blocks-use/
> - https://www.robustperception.io/how-much-space-does-the-wal-take-up/
> - https://discuss.prometheus.io/t/prometheus-storage-requirements/268/4
> - https://gist.github.com/mikejoh/c172b2400909d33c37199c9114df61ef

<br>

### リモートストレージ

#### ▼ 必要データサイズ (KB/日)

Prometheusで収集されたデータポイントの全サイズうち、リモートストレージに実際に送信しているサイズ (KB/日) を表す。

リモート書き込みサイズではなく、送信サイズであるため、書き込みに成功していない可能性があることに注意する。

この結果から、リモートストレージの必要データサイズを推測できる。

補足として、リモートストレージが送信された全てのデータを保管できるとは限らないため、リモートストレージ側で必要データサイズを確認する方がより正確である。

```bash
rate(prometheus_remote_storage_bytes_total[1h]) *
60 * 60 * 24

# 結果
{container="prometheus", endpoint="web", instance="*.*.*.*:9090", job="foo-prometheus", namespace="prometheus", pod="foo-prometheus-pod", remote_name="victoria-metrics", service="oo-prometheus-service", url="https://*.*.*.*:8248/api/v1/write"} <集計値>
```

> - https://grafana.com/docs/agent/latest/flow/reference/components/prometheus.remote_write/#debug-metrics
> - https://grafana.com/blog/2021/04/12/how-to-troubleshoot-remote-write-issues-in-prometheus/

#### ▼ 送信メタデータサイズ

リモートストレージに送信したメタデータのうち、送信に失敗してリトライしたサンプル数の合計を表す。

```bash
prometheus_remote_storage_metadata_retried_total[1h]) *
60 * 60 * 24
```

#### ▼ 送信データサイズ

リモートストレージに送信したデータのうち、送信に失敗してリトライしたサンプル数の合計を表す。

```bash
rate(prometheus_remote_storage_samples_retries_total[1h]) *
60 * 60 * 24
```

> - https://grafana.com/docs/agent/latest/flow/reference/components/prometheus.remote_write/#debug-metrics

#### ▼ リモート送信シャード数

リモート送信処理のシャード数を表す。

```bash
rate(prometheus_remote_storage_shards[1h]) *
60 * 60 * 24
```

> - https://grafana.com/blog/2021/04/12/how-to-troubleshoot-remote-write-issues-in-prometheus/

<br>
