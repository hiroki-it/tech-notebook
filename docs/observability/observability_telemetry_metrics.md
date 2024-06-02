---
title: 【IT技術の知見】メトリクス＠テレメトリー
description: メトリクス＠テレメトリーの知見を記録しています。
---

# メトリクス＠テレメトリー

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. メトリクス

### メトリクスとは

とある分析にて、一定期間に発生した同じ種類のデータポイントの集計値 (例：CPU使用率、メモリ使用率、など) のこと。

メトリクスは、データポイントの形式にあわせていくつかの形式 (例：パーセンテージ系、時分秒系、カウント系、バイト数系、など) がある。

またメトリクスは、特定の方式 (平均、最大最小、合計、再カウント数) で再集計できる。

![metrics_namespace_dimension](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/metrics_namespace_dimension.png)

> - https://www.slideshare.net/AmazonWebServicesJapan/20190326-aws-black-belt-online-seminar-amazon-cloudwatch#18
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html#Metric

<br>

### メトリクスの種類

#### ▼ パーセンテージ系

値をパーセンテージで表す。

パーセンテージ系データポイントの集計値である。

#### ▼ 時分秒系

値を時分秒で表す。

時分秒系データポイントの集計値である。

#### ▼ カウント系

値を`0`か`1`で表す。

カウント系データポイントの集計値である。

#### ▼ バイト数系

値をバイト数で表す。

バイト数系データポイントの集計値である。

<br>

### データポイント

#### ▼ データポイントとは

分析対象から得られる最小単位の数値データのこと。

データポイントにはいくつかの形式 (例：パーセンテージ系、時分秒系、カウント系、など) がある。

データポイントは、分析ごとに存在している。

例えば、とある分析で`1`分ごとに対象が測定される場合、`1`分ごとに得られる数値データがデータポイントとなる。

一方で、`1`時間ごとの測定の場合、`1`時間ごとに得られる数値データがデータポイントである。

分析の対象 (スケーリングで増えるインスタンスも含む) が増えるほど、データポイントは増える。

メトリクスのデータポイントを保存する場合、分析対象の増加に注意する必要がある。

> - https://whatis.techtarget.com/definition/data-point
> - https://aws.amazon.com/jp/about-aws/whats-new/2017/12/amazon-cloudwatch-alarms-now-alerts-you-when-any-m-out-of-n-metric-datapoints-in-an-interval-are-above-your-threshold/

#### ▼ 収集間隔の縮小/拡大

データポイントを収集する間隔を調節することにより、データポイント全体のデータサイズが変化する。

収集間隔を縮小した場合、データポイント数が多くなるため、データサイズは大きくなる。

反対に収集間隔を拡大した場合、データポイント数が少なくなるなるため、データサイズは小さくなる。

注意点として、収集間隔を拡大した場合はより飛び飛びのメトリクスを描画してしまうため、欠損があったとしてもそれを検出できない可能性がある (例：3分間隔だとしたら、3分に満たない間で起こった欠損は描画できない)。

#### ▼ データポイントのダウンサンプリング

期間内に様々なタイムスタンプのデータポイントがある場合に、期間を区画に分け、区画内のタイプスタンプを数学的に集約し、単一の値に変換する。

これにより、解像度を下げる代わりにデータポイント数を減らし、データポイントの合計データサイズを小さくする。

ストレージの空きサイズが増え、長期間のデータポイントを保存できるようになる

> - http://opentsdb.net/docs/build/html/user_guide/query/downsampling.html

#### ▼ データポイントの重複排除

冗長化されたメトリクス収集ツールのインスタンスが、単一の監視バックエンドやストレージツールにメトリクスを送信する場合、特定の期間には冗長化されたインスタンスが送信した同じデータポイントが存在することになる。

この重複を排除するために、期間内で最新のタイムスタンプを持つデータポイントのみを残す。

これにより、データポイント数を減らし、データポイントの合計データサイズを小さくする。

重複排除のタイミングは、収集ツールの収集間隔と同じ値にすると良い。

> - https://percona.community/blog/2022/06/02/long-time-keeping-metrics-victoriametrics/

<br>

### メトリクスの集約

#### ▼ メトリクスの集約とは

同じ種類のメトリクスを特定のグループ (例：AWS CloudWatchならば、ディメンション、名前空間) に集約する。

> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html#Aggregation

#### ▼ 集計との違い

集計は、特定の方式 (平均、最大最小、合計、再カウント数) で計算することを指す。

<br>

## 02. 監視するべきメトリクスの種類

### ゴールデンシグナル (４大シグナル)

#### ▼ ゴールデンシグナルとは

特に重要なメトリクス (トラフィック、レイテンシー、エラー、サチュレーション) のこと。

> - https://sre.google/sre-book/monitoring-distributed-systems/#xref_monitoring_golden-signals

#### ▼ トラフィック

サーバー監視対象のメトリクスに所属する。

#### ▼ レイテンシー

サーバー監視対象のメトリクスに所属する。

#### ▼ エラー

サーバー監視対象のメトリクスに所属する。

| エラー名     | 説明                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| 明示的エラー | `400`/`500`系のレスポンス                                               |
| 暗黙的エラー | SLOに満たない`200`/`300`系のレスポンス、API仕様に合っていないレスポンス |

#### ▼ サチュレーション

システム利用率 (CPU利用率、メモリ理容室、ストレージ利用率、など) の飽和度のこと。

例えば、以下の飽和度がある。

`60`～`70`%で、警告ラインを設けておく必要がある。

サーバー監視対象のメトリクスに所属する。

> - https://codezine.jp/article/detail/11472
> - https://www.scsk.jp/sp/sysdig/blog/container_monitoring/kubernetes4.html

<br>

### USEメトリクス

`USE`は、Utilization (使用率)、Saturation (サチュレーション)、Errors (エラー数) のメトリクスの頭文字である。

CPU、メモリ、ストレージ、ネットワーク、などに関する`USE`メトリクス (例：CPU使用率、CPUサチュレーション、など) を含む。

> - https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/#common-observability-strategies
> - https://blog.gitnux.com/resource-utilization-metrics/

<br>

### REDメトリクス

`RED`は、Rate (秒当たりのリクエスト数)、Errors (リクエストの失敗数)、Duration (レイテンシー) のメトリクスの頭文字である。

SLIによく使用されるメトリクスである。

> - https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/#common-observability-strategies

<br>
