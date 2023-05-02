---
title: 【IT技術の知見】設定ファイル＠Prometheus
description: 設定ファイル＠Prometheus
---

# 設定ファイル＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Prometheus

### `prometheus.yml`ファイルによる設定

#### ▼ `prometheus.yml`ファイルとは

Prometheusを設定する。

`/etc/prometheus`ディレクトリ配下におく。

> ↪️：https://prometheus.io/docs/prometheus/latest/configuration/configuration/

<br>

### globalセクション

全てのメトリクス収集からアラートまでを共通で設定する。

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
```

> ↪️：https://prometheus.io/docs/prometheus/latest/configuration/configuration/#configuration-file

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

> ↪️：
>
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

> ↪️：https://amateur-engineer-blog.com/alertmanager-docker-compose/

#### ▼ scrape_configsセクション

Retrievalのルールを設定する。

> ↪️：https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config

#### ▼ static_configs

IPアドレスやポート番号の変わらない対象を監視する。

```yaml
scrape_configs:
  # 自分で自分を監視する。
  - job_name: prometheus
    static_configs:
      - targets:
          - localhost:9090'
  # Node exporterの稼働するサーバーを監視する。
  - job_name: node-exporter
    static_configs:
      - targets:
          - <Node exporterの稼働するサーバーのIPアドレス>:9100
```

> ↪️：https://amateur-engineer-blog.com/prometheus-node-exporter/#toc3

#### ▼ sd_configs

IPアドレスやポート番号が動的に変化する対象を監視する。

監視対象のIPアドレスやポート番号が変わると、Prometheusはそれを検出し、自身の設定を動的に変更する。

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
  # Node exporterの稼働するサーバーをサービスディスカバリーで監視する。
  - job_name: node-exporter
    kubernetes_sd_configs:
      # Service配下のPodを対象とする。
      # ingress、node、pod (Serviceに関連づけない) 、service、がある。
      - role: endpoints
      # 特定のPodのみを監視対象とする。
      - source_labels:
          - __meta_kubernetes_namespace
          - __meta_kubernetes_pod_container_port_number
        regex: foo-namespace;9100
        action: keep
```

> ↪️：
>
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

> ↪️：https://prometheus.io/docs/alerting/latest/configuration/#configuration-file

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

> ↪️：https://prometheus.io/docs/alerting/latest/configuration/#route

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

> ↪️：
>
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
