---
title: 【IT技術の知見】Node Exporter＠Prometheus
description: Node Exporter＠Prometheus
---

# Node Exporter＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Node Exporterの仕組み

記入中

...

<br>

## 02. セットアップ

### バイナリとして

バイナリファイルをインストールする。

```bash
# GitHubのバイナリファイルのリリースページから、テキストのURLを取得する。
# tmpディレクトリ配下にダウンロードする。
$ curl -L https://github.com/prometheus/node_exporter/releases/download/v1.0.0/node_exporter-1.0.0.linux-amd64.tar.gz -o /tmp/node_exporter-1.0.0.linux-amd64.tar.gz
$ tar -xvf /tmp/node_exporter-1.0.0.linux-amd64.tar.gz -C /tmp

# バイナリファイルだけを移動する。
$ mv /tmp/node_exporter/node_exporter-1.0.0.linux-amd64 /usr/local/bin/node_exporter
```

バイナリに直接的にパラメーターを渡せる。

```bash
$ /usr/local/bin/node_exporter --web.listen-address=":9100"
```

> - https://qiita.com/ezaqiita/items/c3cd9faa2fd52da5d7a6#node-exporter%E3%81%AE%E5%A0%B4%E5%90%88

<br>

### チャートとして

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <Helmリリース名> <チャートリポジトリ名>/prometheus-node-exporter -n prometheus --version <バージョンタグ>
```

> - https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-node-exporter

複数のExporterを一括してインストールする場合、例えばkube-prometheus-stackチャートがある。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <Helmリリース名> <チャートリポジトリ名>/kube-prometheus-stack -n prometheus --version <バージョンタグ>
```

> - https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack

<br>

## 03. 設定

### --web.listen-address

待ち受けるポート番号を設定する。

```bash
$ node_exporter --web.listen-address=':9100'
```

<br>

## 04. メトリクスの一覧

### 確認方法

Node Exporterの場合は、Nodeの『`127.0.0.1:9100/metrics`』をコールすると、PromQLで使用できるメトリクスの元になるデータポイントを取得できる。

```bash
# Node内でコールする。
$ curl http://127.0.0.1:9100/metrics

...

node_exporter_build_info{branch="HEAD",goversion="go1.15.8",revision="4e837d4da79cc59ee3ed1471ba9a0d9547e95540",version="1.1.1"} 1

...
```

> - https://prometheus.io/docs/guides/node-exporter/#node-exporter-metrics
> - https://grafana.com/oss/prometheus/exporters/node-exporter/assets/node_exporter_sample_scrape.txt

<br>

## 05. PromQLを使用したメトリクス分析

### CPU使用率

NodeのCPU使用率を取得する。

```bash
# 秒当たりの平均増加率を１分間で集約する
rate(node_cpu_seconds_total[1m])
```

> - https://qiita.com/Esfahan/items/01833c1592910fb11858#cpu%E4%BD%BF%E7%94%A8%E7%8E%87

<br>

### メモリ使用率

Nodeのメモリ使用率を取得する。

```bash
node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes
```

> - https://qiita.com/Esfahan/items/01833c1592910fb11858#%E3%83%A1%E3%83%A2%E3%83%AA%E4%BD%BF%E7%94%A8%E7%8E%87

<br>

### ディスク使用率

Nodeのディスク使用率を取得する。

```bash
100 - (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100
```

`mountpoint` ディメンションを使用して、マウントポイント別のディスク使用率を取得する。

```bash
100 - (node_filesystem_avail_bytes{mountpoint="/var/lib/data"} / node_filesystem_size_bytes{mountpoint="/var/lib/data"} ) * 100
```

`job` ディメンションを使用して、収集対象別にのディスク使用率を取得する。

```bash
100 - (node_filesystem_avail_bytes{job="foo-node"} / node_filesystem_size_bytes{job="foo-node"} ) * 100
```

> - https://qiita.com/Esfahan/items/01833c1592910fb11858#%E3%83%87%E3%82%A3%E3%82%B9%E3%82%AF%E5%AE%B9%E9%87%8F

<br>

### ディスクのI/OによるCPU使用率

ディスクのI/OによるCPU使用率 (ディスクのI/OがNodeのCPUをどの程度使用しているか) を取得する。

`iostat` コマンドの `%util` 指標と同じである。

```bash
# 秒当たりの平均増加率を１分間で集約する
rate(node_disk_io_time_seconds_total[1m])
```

> - https://brian-candler.medium.com/interpreting-prometheus-metrics-for-linux-disk-i-o-utilization-4db53dfedcfc
> - https://christina04.hatenablog.com/entry/prometheus-node-monitoring
> - https://www.qoosky.io/techs/42affa2c4b

<br>

### ディスクのI/Oレスポンスタイム

```bash
# 読み出しレスポンスタイム
# 秒当たりの平均増加率を１分間で集約する
rate(node_disk_read_time_seconds_total[1m]) / rate(node_disk_reads_completed_total[1m])
```

```bash
# 書き込みレスポンスタイム
# 秒当たりの平均増加率を１分間で集約する
rate(node_disk_write_time_seconds_total[1m]) / rate(node_disk_writes_completed_total[1m])
```

> - https://christina04.hatenablog.com/entry/prometheus-node-monitoring

<br>

### パケットの受信サイズ

Nodeのパケットの受信サイズを取得する。

```bash
node_network_receive_packets_total
```

これを使用して、DDOS攻撃のアラートを作成できる。

```bash
# 秒当たりの平均増加率を５分間で集約する
(rate(node_network_receive_packets_total[5m]) / rate(node_network_receive_packets_total[5m] offset 5m)) > 10
```

> - https://stackoverflow.com/questions/72947434/how-to-alert-anomalies-on-network-traffic-jump-with-prometheus

<br>
