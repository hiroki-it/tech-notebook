---
title: 【IT技術の知見】設定ファイル＠Prometheus
description: 設定ファイル＠Prometheus
---

# 設定ファイル＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Prometheus

### ```prometheus.yml```ファイルによる設定

#### ▼ ```prometheus.yml```ファイルとは

Prometheusを設定する。

```/etc/prometheus```ディレクトリ配下におく。

> ↪️ 参考：https://prometheus.io/docs/prometheus/latest/configuration/configuration/

<br>

### globalセクション

全てのメトリクス収集からアラートまでを共通で設定する。


```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
```

> ↪️ 参考：https://prometheus.io/docs/prometheus/latest/configuration/configuration/#configuration-file

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



> ↪️ 参考：
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

> ↪️ 参考：https://amateur-engineer-blog.com/alertmanager-docker-compose/


#### ▼ scrape_configsセクション

Retrievalのルールを設定する。



> ↪️ 参考：https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config

#### ▼ static_configs

IPアドレスやポート番号の変わらない対象を監視する。

```yaml
scrape_configs:
  # 自分で自分を監視する。
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

> ↪️ 参考：https://amateur-engineer-blog.com/prometheus-node-exporter/#toc3

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


> ↪️ 参考：
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

> ↪️ 参考：https://prometheus.io/docs/alerting/latest/configuration/#configuration-file

<br>

### routeセクション

#### ▼ routeセクションとは

合致条件に応じて、受信したアラートを特定の通知先にルーティングする。

#### ▼ receiver

アラートのルーティング先の名前を設定する。

receiver自体は、```receivers```キー配下で設定する。

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

> ↪️ 参考：https://prometheus.io/docs/alerting/latest/configuration/#route

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


> ↪️ 参考：
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

## 03. Exporter

### セットアップ

#### ▼ バイナリとして

サーバー内で各種Exporterをプロセスとして稼働させる場合、チャートリポジトリから直接インストールし、リソースを作成する。

```bash
# node-exporterの場合

# tmpディレクトリ配下にダウンロードする。
$ curl -L https://github.com/prometheus/node_exporter/releases/download/v1.0.0/node_exporter-1.0.0.linux-amd64.tar.gz -o /tmp/node_exporter-1.0.0.linux-amd64.tar.gz 
$ tar xvf /tmp/node_exporter-1.0.0.linux-amd64.tar.gz -C /tmp

# バイナリファイルだけを移動する。
$ mv /tmp/node_exporter/node_exporter-1.0.0.linux-amd64 /usr/local/bin/node_exporter
```

#### ▼ チャートとして

Node内で各種Exporterをコンテナとして稼働させる場合、チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

複数のExporterを一括してインストールする場合、例えばkube-prometheus-stackチャートがある。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <リリース名> <チャートリポジトリ名>/kube-prometheus-stack -n prometheus --version <バージョンタグ>
```

> ↪️ 参考：https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack

一方で、個別にチャートをインストールすることもできる。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

# node-exporterの場合
$ helm install <リリース名> <チャートリポジトリ名>/prometheus-node-exporter -n prometheus --version <バージョンタグ>

# kube-state-metricsの場合
$ helm install <リリース名> <チャートリポジトリ名>/kube-state-metrics -n prometheus --version <バージョンタグ>

# mysql-exporterの場合
$ helm install <リリース名> <チャートリポジトリ名>/prometheus-mysql-exporter -n prometheus --version <バージョンタグ>
```

> ↪️ 参考：
> 
> - https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-node-exporter
> - https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-state-metrics
> - https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-mysql-exporter


<br>

### バイナリによる設定

#### ▼ node-exporterの場合

バイナリに直接的にパラメーターを渡す。

```bash
$ /usr/local/bin/node_exporter --web.listen-address=":9100"
```

> ↪️ 参考：https://qiita.com/ezaqiita/items/c3cd9faa2fd52da5d7a6#node-exporter%E3%81%AE%E5%A0%B4%E5%90%88

<br>
