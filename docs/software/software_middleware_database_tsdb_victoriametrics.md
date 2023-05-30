---
title: 【IT技術の知見】VictoriaMetrics＠TSDB
description: VictoriaMetrics＠TSDBの知見を記録しています。
---

# VictoriaMetrics＠TSDB

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. VictoriaMetricsの仕組み

### アーキテクチャ

#### ▼ リモートストレージとして

ロードバランサー、vm-select、vm-storage、vm-insert、といったコンポーネントから構成されている。

リモートストレージとして、Prometheusで収集したメトリクスを保管する。

シングルNodeモードとクラスターNodeモードがあり、Clusterモードでは各コンポーネントが冗長化される。

エンドポイントとしてロードバランサーがあり、書き込みエンドポイントを指定すれば、vm-insertを経由して、vm-storageにメトリクスを書き込める。

また読み出しエンドポイントを指定すれば、vm-selectを経由して、vm-storageからメトリクスを読み込める。

補足として、PrometheusがリモートストレージとしてVictoriaMetricsを使用する時、Grafanaのようにリアルタイムにデータを取得し続けることはできない。

代わりに、PrometheusのダッシュボードでPromQLを実行し、読み出しエンドポイントからその都度データを取得することはできる。

![victoria-metrics_remote-storage_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/victoria-metrics_remote-storage_architecture.png)

> ↪️：
>
> - https://docs.victoriametrics.com/Cluster-VictoriaMetrics.html#architecture-overview
> - https://docs.victoriametrics.com/FAQ.html#why-doesnt-victoriametrics-support-the-prometheus-remote-read-api
> - https://prometheus.io/blog/2021/11/16/agent/#history-of-the-forwarding-use-case

#### ▼ メトリクス監視バックエンドとして

vm-agent、vm-storage、vm-alert、といったコンポーネントから構成されている。

また、アラートの通知のためにalertmanager、可視化のためにGrafana、が必要である。

vm-agentがPull型でメトリクスのデータポイントを収集し、vm-storageに保管する。

vm-alertは、vm-storageに対してMetricsQLを定期的に実行し、条件に合致したエラーイベントからアラートを作成する。

VictoriaMetricsをメトリクス監視バックエンドとして使用する場合はPrometheusは不要になる。

各コンポーネントがメモリを使用するため、

![victoria-metrics_monitoring_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/victoria-metrics_monitoring_architecture.png)

> ↪️：
>
> - https://speakerdeck.com/cybozuinsideout/monitoring-feat-victoriametrics?slide=10
> - https://www.sobyte.net/post/2022-05/vmalert/

<br>

### ロードバランサー

#### ▼ ロードバランサーとは

HTTPSプロトコルの`8224`番ポートでインバウンド通信を待ち受け、vm-selectやvm-insertに通信をルーティングする。

このロードバランサー自体をヘルスチェックすれば、VictoriaMetricsのプロセスが稼働しているか否かを監視できる。

#### ▼ 読み出しエンドポイント

PrometheusのHTTPサーバーとおおよそ同じ読み出しエンドポイントを持つ。

```bash
# 読み出しエンドポイントにリクエストを送信する。
$ curl \
    -X GET http://<VictoriaMetricsのIPアドレス>:8428/api/v1/query \
    -d 'query=vm_http_request_errors_total'
```

> ↪️：https://docs.victoriametrics.com/url-examples.html#apiv1query

#### ▼ 書き込みエンドポイント

PrometheusのHTTPサーバーとおおよそ同じ書き込みエンドポイントを持つ。

```bash
# 書き込みエンドポイントにリクエストを送信する。
$ curl -X POST http://<VictoriaMetricsのIPアドレス>:8428/api/v1/write
```

> ↪️ https://docs.victoriametrics.com/#high-availability

<br>

### vm-select

#### ▼ vm-selectとは

クライアントから読み出しリクエストを受信し、vm-storageからデータを読み出す。

#### ▼ vm-selectの仕組み

VictoriaMetricsは、クエリの実行前に、ディスクに永続化したデータポイントを一度メモリに移動する。

そのため、ストレージのデータ量が多くなるのに伴って、メモリ上のデータポイントが常時/突発的に多くなり、OOMキラーになることがある。

> ↪️：
>
> - https://docs.victoriametrics.com/FAQ.html#how-to-set-a-memory-limit-for-victoriametrics-components
> - https://docs.victoriametrics.com/#storage

#### ▼ カーディナリティ

とある期間で区切った時の固有な時系列データの断片数である。

この断片数が多くなる程、読み出しで負荷がかかる。

![victoria-metrics_cardinality.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/victoria-metrics_cardinality.png)

> ↪️：https://victoriametrics.com/blog/cardinality-explorer/

<br>

### vm-storage

#### ▼ vm-storageとは

データをファイルシステムに保管する。

保管時にデータを圧縮している。

公式での情報は見つからなかったが、圧縮率は約`10%`らしい。

> ↪️：https://qiita.com/nikita/items/482a77a829c81cd919f0#1%E5%9C%A7%E7%B8%AE%E7%8E%87%E3%81%8C%E9%AB%98%E3%81%84

#### ▼ ディレクトリ構成

VictoriaMetricsのプロセスを`victoria-metrics-prod`コマンドで起動する時に、`storageDataPath`オプションでディレクトリ名を渡す。

これにより、マウント先のディレクトリを設定できる。ディレクトリ構造は以下のようになっている。

```yaml
/var/lib/victoriametrics/
├── data/
│   ├── big/ # メトリクスが保管されている。
│   ├── flock.lock
│   └── small/ # キャッシュとして保存される。時々、bigディレクトリにマージされる。
│
├── flock.lock/
├── indexdb/ # 全文検索処理の高速化のためのインデックス
├── metadata/
├── snapshots/
└── tmp/
```

`du`コマンドを使用して、ストレージ使用量を確認できる。

```bash
$ du -hs /var/lib/victoriametrics/data

100G /var/lib/victoria-metrics/data
```

#### ▼ ReadOnlyモード

vm-storageは、サイズいっぱいまでデータが保管されると、ランタイムエラーを起こしてしまう。これを回避するために、ReadOnlyモードがある。

ReadOnlyモードにより、vm-storageの空きサイズが`minFreeDiskSpaceBytes`オプション値を超えると、書き込みできなくなるような仕様になっている。

これにより、vm-storageの最大サイズを超えてデータを書き込むことを防いでいる。

> ↪️：https://github.com/VictoriaMetrics/VictoriaMetrics/issues/269

#### ▼ 保管期間

vm-storageは、一定期間だけ経過したメトリクスファイル (主に、`data`ディレクトリ、`indexdb`ディレクトリ、の配下など) を削除する。

VictoriaMetricsの起動時に、`victoria-metrics-prod`コマンドの`-retentionPeriod`オプションで指定できる。

> ↪️：https://percona.community/blog/2022/06/02/long-time-keeping-metrics-victoriametrics/

#### ▼ ストレージの必要サイズの見積もり

vm-storageの`/var/lib/victoriametrics`ディレクトリ配下の増加量 (日) を調査し、これに非機能的な品質の保管日数をかけることにより、vm-storageの必要最低限のサイズを算出できる。

また、`20`%の空きサイズを考慮するために、増加量を`1.2`倍する必要がある。

> ↪️：https://docs.victoriametrics.com/#capacity-planning

**＊例＊**

ここでは、増加率を以下の数式で算出している。

```mathematica
(増加率) = ((当該時刻のサイズ) - (前時刻のサイズ)) ÷ (前時刻のサイズ) × 100
```

| 時刻       | storageDataPathのサイズ (MB) | 前時刻比 増加率 (%) | 前時刻比 増加量 (MB) |
| ---------- | ---------------------------- | ------------------- | -------------------- |
| `00:00:00` | `10535`                      | -                   | -                    |
| `01:00:00` | `10708`                      | `0.0164`            | `173`                |
| `02:00:00` | `10838`                      | `0.0121`            | `130`                |
| 〜 中略 〜 |                              |                     |                      |
| `22:00:00` | `12997`                      | `0.0226`            | `159`                |
| `23:00:00` | `13023`                      | `0.0020`            | `26`                 |
| `24:00:00` | `12900`                      | `-0.0094`           | `123`                |

増加率の推移をグラフ化すると、データが一定の割合で増加していることがわかるはずである。

これは、Prometheusの仕様として、一定の割合でVictoriaMetricsに送信するようになっているためである。

もし、データの保管日数が`10`日分という非機能的な品質であれば、vm-storageは常に過去`10`日分のデータを保管している必要がある。

そのため、以下の数式で`10`日分のサイズを算出できる。

```mathematica
(増加量の合計)
= 12900 - 10535
= 2365 (MB/日)
```

```mathematica
(10日分を保管するために必要なサイズ)
= 2365 × 1.2 × 10
= 28380 (MB/10日)
```

VictoriaMetricsを、もしAWS EC2上で稼働させる場合、EBSボリュームサイズもvm-storageのサイズ以上にする必要がある。

<br>

### vm-insert

#### ▼ vm-insertとは

クライアントから書き込みリクエストを受信し、vm-storageにデータを書き込む。

<br>

## 02. セットアップ

### `systemctl`コマンド

`systemctl`コマンドを使用して、VictoriaMetricsプロセスをデーモンとして起動する。

`【１】`

: ユニットファイルを作成する。

```ini
# victoriametrics.service
[Unit]
Description=High-performance, cost-effective and scalable time series database, long-term remote storage for Prometheus
After=network.target

[Service]
Type=simple
StartLimitBurst=5
StartLimitInterval=0
Restart=on-failure
RestartSec=1
# プロセスの起動時にオプションを渡す。
ExecStart=/usr/bin/victoria-metrics-prod \
            `# マウント先のディレクトリ` \
            -storageDataPath=/var/lib/victoriametrics \
            `# 保管期間` \
            -retentionPeriod 10d \
            `# Grafanaからのリクエストを待ち受けるポート番号` \
            -graphiteListenAddr :2003
ExecStop=/bin/kill -s SIGTERM $MAINPID
LimitNOFILE=65536
LimitNPROC=32000

[Install]
WantedBy=multi-user.target
```

(２】victoriametricsのプロセスを`systemctl`で起動する。

```bash
# 作成したファイルを読み込み、VictoriaMetricsプロセスをデーモンとして起動する。
$ systemctl daemon-reload
$ systemctl start victoriametrics
```

> ↪️：
>
> - https://github.com/VictoriaMetrics/VictoriaMetrics/blob/master/package/victoria-metrics.service
> - https://hnakamur.github.io/blog/2019/12/23/install-victoria-metrics/
> - https://www.vultr.com/docs/install-and-configure-victoriametrics-on-debian/

<br>
