---
title: 【IT技術の知見】設定ファイル＠Prometheus
description: 設定ファイル＠Prometheus
---

# 設定ファイル＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Prometheus

### ```prometheus.yml```ファイルによる設定

#### ▼ ```prometheus.yml```ファイルとは

Prometheusを設定する。

```/etc/prometheus```ディレクトリ配下におく。



> ℹ️ 参考：https://prometheus.io/docs/prometheus/latest/configuration/configuration/

<br>

### globalセクション

全てのメトリクス収集からアラートまでを共通で設定する。



> ℹ️ 参考：https://prometheus.io/docs/prometheus/latest/configuration/configuration/#configuration-file

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
```

<br>

### alertingセクション

使用するAlertmanagerを設定する。



> ℹ️ 参考：
> 
> - https://amateur-engineer-blog.com/alertmanager-docker-compose/
> - https://prometheus.io/docs/prometheus/latest/configuration/configuration/#alertmanager_config

```yaml
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093
```

<br>

### rule_filesセクション

Prometheusのアラートルールを設定する。



> ℹ️ 参考：https://amateur-engineer-blog.com/alertmanager-docker-compose/

```yaml
rule_files:
  - /etc/prometheus/pod_cpu_utilized_rule.yaml
  - /etc/prometheus/pod_memory_utilized_rule.yaml
```

```yaml
groups:
  - name: pod_cpu_utilized_rule
    rules:
      - alert: PodCpuUtilized
        # 値が長くなるため、『>-』で改行すると良い。
        expr: >-
          max(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate{namespace="foo-namespace", pod=~"foo-pod.*", container="foo-container"}) /
          min(kube_pod_container_resource_limits{namespace="foo-namespace", pod=~"foo-pod.*",resource="cpu",container="foo-container"})
          > 0.7
        for: 1m
        labels:
          app: foo
          env: prd
          severity: critical
        annotations:
          summary: PodのCPU使用率
          description: 【 {{ $labels.app }} 】{{ $labels.env }} 環境で、PodのCPU使用率が {{ $value }} になりました。
```

```yaml
groups:
  - name: pod_memory_utilized_rule
    rules:
      - alert: PodMemoryUtilized
        expr: >-
          max(container_memory_working_set_bytes{namespace="foo-namespace", pod=~"foo-pod.*", container="foo-container"}) /
          min(kube_pod_container_resource_limits{namespace="foo-namespace", pod=~"foo-pod.*",resource="memory", container="foo-container"}) 
          > 0.7
        for: 1m
        labels:
          app: foo
          env: prd
          severity: critical
        annotations:
          summary: Podのメモリ使用率
          description: 【 {{ $labels.app }} 】{{ $labels.env }} 環境で、Podのメモリ使用率が {{ $value }} になりました。
```

#### ▼ scrape_configsセクション

Retrievalのルールを設定する。



> ℹ️ 参考：https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config

#### ▼ static_configs

IPアドレスやポート番号の変わらない対象を監視する。



> ℹ️ 参考：https://amateur-engineer-blog.com/prometheus-node-exporter/#toc3

```yaml
scrape_configs:
  # 自分自身を監視する。
  - job_name: prometheus
    static_configs:
      - targets:
        - localhost:9090'
  # node-exporterの稼働するサーバーを監視する。
  - job_name: node-exporter
    static_configs:
      - targets:
        - <node-exporterの稼働するサーバーのIPアドレス>:9100
```

#### ▼ sd_configs

IPアドレスやポート番号が動的に変化する対象を監視する。

監視対象のIPアドレスやポート番号が変わると、Prometheusはそれを検出し、自身の設定を動的に変更する。


> ℹ️ 参考：
> 
> - https://prometheus.io/docs/guides/file-sd/#changing-the-targets-list-dynamically
> - https://christina04.hatenablog.com/entry/prometheus-service-discovery

```yaml
scrape_configs:
  # AWS EC2をサービスディスカバリーで監視する。
  - job_name: aws-ec2
    ec2_sd_configs:
      - port: 9100
        filters:
          - name: tag:Name
            values:
              - foo-instance
  # node-exporterの稼働するサーバーをサービスディスカバリーで監視する。
  - job_name: node-exporter
    kubernetes_sd_configs:
      # Service配下のPodを対象とする。
      # ingress、node、pod（Serviceに関連づけない）、service、がある。
      - role: endpoints
      # 特定のPodのみを監視対象とする。
      - source_labels:
          - __meta_kubernetes_namespace
          - __meta_kubernetes_pod_container_port_number
        regex: foo-namespace;9100
        action: keep
```

<br>

## 02. Alertmanager

### globalセクション

全てのアラートを共通で設定する。



> ℹ️ 参考：https://prometheus.io/docs/alerting/latest/configuration/#configuration-file

```yaml
global:
  slack_api_url: https://hooks.slack.com/services/*****
  resolve_timeout: 5m
```

<br>

### routeセクション

条件に応じて、受信したアラートを特定の通知先にルーティングする。



> ℹ️ 参考：https://prometheus.io/docs/alerting/latest/configuration/#route

```yaml
route:
  # WarningレベルはSlackのレシーバーを選ぶ。
  - receiver: slack-foo-channel
    match:
      severity: warning
  # CriticalレベルはPagerDutyのレシーバーを選ぶ。
  - receiver: pagerduty-foo-service
    match:
      severity: critical
```

<br>

### receiversセクション

アラートの通知先をレシーバーとして設定する。



> ℹ️ 参考：
> 
> - https://prometheus.io/docs/alerting/latest/configuration/#receiver
> - https://prometheus.io/docs/alerting/latest/configuration/#pagerduty_config

```yaml
receivers:
  # Slackに通知する。
  - name: slack-foo-channel
    slack_configs:
      - channel: prd-foo-channel
  # PagerDutyに通知する。
  - name: pagerduty-foo-service
    pagerduty_configs:
      - routing_key: *****
```

<br>

## 03. Exporter

### セットアップ

#### ▼ バイナリリポジトリから

Node内でプロセスとしてnode-exporterを動かす場合、チャートリポジトリから直接インストールし、リソースを作成する。

```bash
# node-exporterの場合

# tmpディレクトリ配下にダウンロードする。
$ curl -L https://github.com/prometheus/node_exporter/releases/download/v1.0.0/node_exporter-1.0.0.linux-amd64.tar.gz -o /tmp/node_exporter-1.0.0.linux-amd64.tar.gz 
$ tar xvf /tmp/node_exporter-1.0.0.linux-amd64.tar.gz -C /tmp

# バイナリファイルだけを移動する。
$ mv /tmp/node_exporter/node_exporter-1.0.0.linux-amd64 /usr/local/bin/node_exporter
```

#### ▼ チャートリポジトリから

Node内でコンテナとしてnode-exporterを動かす場合、GitHubから目的に応じたチャートをインストールし、リソースを作成する。

```bash
$ helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
$ helm repo update

# 一括の場合
# https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack
$ helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack -n prometheus -f values.yaml

# node-exporterの場合
# https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-node-exporter
$ helm install prometheus-node-exporter prometheus-community/prometheus-node-exporter -n prometheus -f values.yaml

# kube-state-metricsの場合
# https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-state-metrics
$ helm install kube-state-metrics prometheus-community/kube-state-metrics -n prometheus -f values.yaml

# mysql-exporterの場合
# https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-mysql-exporter
$ helm install prometheus-mysql-exporter prometheus-community/prometheus-mysql-exporter -n prometheus -f values.yaml
```

<br>

### バイナリによる設定

#### ▼ node-exporterの場合

バイナリに直接的にパラメーターを渡す。



> ℹ️ 参考：https://qiita.com/ezaqiita/items/c3cd9faa2fd52da5d7a6#node-exporter%E3%81%AE%E5%A0%B4%E5%90%88

```bash
$ /usr/local/bin/node_exporter --web.listen-address=":9100"
```

<br>
