---
title: 【IT技術の知見】設定ファイル＠Promtail
description: 設定ファイル＠Promtailの知見を記録しています。
---

# 設定ファイル＠Promtail

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. promtail.yaml

### clients

Promtailのログの送信先を設定する。

Grafana Lokiの場合、`/loki/api/v1/push`パスを設定する。

```yaml
clients:
  - url: http://grafana-loki.istio-system.svc.cluster.local:3100/loki/api/v1/push
```

<br>

### limits_config

```yaml
limits_config: null
```

<br>

### positions

```yaml
positions:
  filename: /run/promtail/positions.yaml
```

<br>

### scrape_configs

```yaml
scrape_configs:
  - job_name: kubernetes-pods
    kubernetes_sd_configs:
      - role: pod
    pipeline_stages:
      - cri: {}
    relabel_configs:
      - action: replace
        regex: ([0-9a-z-.]+?)(-[0-9a-f]{8,10})?
        source_labels:
          - __meta_kubernetes_pod_controller_name
        target_label: __tmp_controller_name
      - action: replace
        regex: ^;*([^;]+)(;.*)?$
        source_labels:
          - __meta_kubernetes_pod_label_app_kubernetes_io_component
          - __meta_kubernetes_pod_label_component
        target_label: component
      - action: replace
        regex: ^;*([^;]+)(;.*)?$
        source_labels:
          - __meta_kubernetes_pod_label_app_kubernetes_io_instance
          - __meta_kubernetes_pod_label_instance
        target_label: instance
      - action: replace
        regex: ^;*([^;]+)(;.*)?$
        source_labels:
          - __meta_kubernetes_pod_label_app_kubernetes_io_name
          - __meta_kubernetes_pod_label_app
          - __meta_kubernetes_pod_name
          - __tmp_controller_name
        target_label: app
      - action: replace
        regex: true/(.*)
        replacement: /var/log/pods/*$1/*.log
        separator: /
        source_labels:
          - __meta_kubernetes_pod_annotation_kubernetes_io_config_hash
          - __meta_kubernetes_pod_annotationpresent_kubernetes_io_config_hash
          - __meta_kubernetes_pod_container_name
        target_label: __path__
      - action: replace
        replacement: /var/log/pods/*$1/*.log
        separator: /
        source_labels:
          - __meta_kubernetes_pod_container_name
          - __meta_kubernetes_pod_uid
        target_label: __path__
      - action: replace
        replacement: $1
        separator: /
        source_labels:
          - app
          - namespace
        target_label: job
      - action: replace
        source_labels:
          - __meta_kubernetes_namespace
        target_label: namespace
      - action: replace
        source_labels:
          - __meta_kubernetes_pod_container_name
        target_label: container
      - action: replace
        source_labels:
          - __meta_kubernetes_pod_name
        target_label: pod
      - action: replace
        source_labels:
          - __meta_kubernetes_pod_node_name
        target_label: node_name
```

<br>

### server

```yaml
server:
  http_listen_port: 3101
  log_format: logfmt
  log_level: info
```

<br>

### tracing

```yaml
tracing:
  enabled: false
```

<br>
