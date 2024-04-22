---
title: 【IT技術の知見】設定ファイル＠Prometheus
description: 設定ファイル＠Prometheus
---

# 設定ファイル＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Prometheus

### `prometheus.yml`ファイルによる設定

#### ▼ `prometheus.yml`ファイルとは

Prometheusを設定する。

`/etc/prometheus`ディレクトリ配下におく。

> - https://prometheus.io/docs/prometheus/latest/configuration/configuration/

<br>

### globalセクション

#### ▼ globalセクションとは

全てのメトリクス収集からアラートまでを共通で設定する。

> - https://prometheus.io/docs/prometheus/latest/configuration/configuration/#configuration-file

#### ▼ scrape_interval

収集間隔を設定する

```yaml
global:
  scrape_interval: 15s
```

#### ▼ evaluation_interval

アラート発火の条件とする間隔を設定する

```yaml
global:
  evaluation_interval: 15s
```

#### ▼ external_labels

Prometheusが外部ツール (例：Alertmanager、VictoriaMetrics、など) にメトリクスを送信する時に、これに付与するラベルを設定する。

```yaml
global:
  external_labels:
    cluster: foo-cluster
    env: prd
```

<br>

### alertingセクション

使用するAlertmanagerを設定する。

```yaml
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093
```

> - https://amateur-engineer-blog.com/alertmanager-docker-compose/
> - https://prometheus.io/docs/prometheus/latest/configuration/configuration/#alertmanager_config

<br>

### rule_filesセクション

#### ▼ rule_filesセクションとは

Prometheusのアラートルールを設定する。

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
        # Prometheusのレコーディングルール (node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate) をPromQLで使用する。
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

> - https://amateur-engineer-blog.com/alertmanager-docker-compose/

#### ▼ scrape_configsセクション

Retrievalのルールを設定する。

> - https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config

#### ▼ static_configs

IPアドレスやポート番号の変わらない対象を監視する。

```yaml
scrape_configs:
  # 自分で自分を監視する。
  - job_name: prometheus
    static_configs:
      - targets:
          - 127.0.0.1:9090'
        labels:
          cluster: prd
  # Node exporterの稼働するサーバーを監視する。
  - job_name: node-exporter
    static_configs:
      - targets:
          - <Node exporterの稼働するサーバーのIPアドレス>:9100
        labels:
          cluster: prd
```

> - https://amateur-engineer-blog.com/prometheus-node-exporter/#toc3

`labels`キーを使用して、メトリクスにフィルタリング用ラベルを追加できる。

```yaml
scrape_configs:
  - job_name: victoria-metrics
    static_configs:
      - targets:
          - <VictoriaMetricsのIPアドレス>:9100
        # メトリクスに追加するラベルを設定する
        labels:
          cluster: prd
```

> - https://stackoverflow.com/a/55700165
> - https://stackoverflow.com/a/48021873

#### ▼ sd_configs

IPアドレスやポート番号が動的に変化する対象を監視する。

監視対象のIPアドレスやポート番号が変わると、Prometheusはそれを検出し、自身の設定を動的に変更する。

```yaml
scrape_configs:
  # AWS EC2をサービスディスカバリーで監視する
  - job_name: aws-ec2
    ec2_sd_configs:
      - port: 9100
        filters:
          - name: tag:Name
            values:
              - foo-instance
  # https://prometheus.io/docs/prometheus/latest/configuration/configuration/#endpoints
  - job_name: foo-endpoints
    kubernetes_sd_configs:
      # Service配下のEndpointを監視する
      - role: endpoints
      # ラベルでフィルタリングする
      - source_labels:
          - __meta_kubernetes_namespace
          - __meta_kubernetes_endpoint_port_name
        # ラベル値
        regex: foo-namespace;http-foo
        action: keep
  # https://prometheus.io/docs/prometheus/latest/configuration/configuration/#endpointslice
  - job_name: bar-endpointslice
    kubernetes_sd_configs:
      # Service配下のEndpointSliceを監視する
      - role: endpointslice
      # ラベルでフィルタリングする
      - source_labels:
          - __meta_kubernetes_namespace
          - __meta_kubernetes_endpoint_port_name
        # ラベル値
        regex: bar-namespace;http-bar
        action: keep
```

> - https://changineer.info/server/monitoring/monitoring_prometheus_discovery_kubernetes.html
> - https://prometheus.io/docs/guides/file-sd/#changing-the-targets-list-dynamically
> - https://christina04.hatenablog.com/entry/prometheus-service-discovery

<br>

## 02. Alertmanager

### globalセクション

全てのアラートを共通で設定する。

```yaml
global:
  slack_api_url: https://hooks.slack.com/services/*****
  resolve_timeout: 5m
```

> - https://prometheus.io/docs/alerting/latest/configuration/#configuration-file

<br>

### routeセクション

#### ▼ routeセクションとは

合致条件に応じて、受信したアラートを特定の通知先にルーティングする。

#### ▼ receiver

アラートのルーティング先の名前を設定する。

receiver自体は、`receivers`キー配下で設定する。

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

> - https://prometheus.io/docs/alerting/latest/configuration/#route

#### ▼ match

アラートのラベルと値を使用して、ルーティング時の合致条件を設定する。

アラートのラベルは、Prometheusのrule_filesセクションで設定する。

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

#### ▼ receiversセクションとは

アラートの通知先をレシーバーとして設定する。

#### ▼ pagerduty_configs

通知先とするPagerDutyのServiceを設定する。

```yaml
receivers:
  # PagerDutyに通知する。
  - name: pagerduty-foo-service
    pagerduty_configs:
      - routing_key: *****
```

> - https://prometheus.io/docs/alerting/latest/configuration/#receiver
> - https://prometheus.io/docs/alerting/latest/configuration/#pagerduty_config

#### ▼ slack_configs

通知先とするSlackのチャンネルを設定する。

globalセクション配下でSlackのURLを設定する必要がある。

```yaml
global:
  slack_api_url: https://hooks.slack.com/services/*****
  resolve_timeout: 5m

receivers:
  # Slackに通知する。
  - name: slack-foo-channel
    slack_configs:
      - channel: prd-foo-channel
```

<br>
