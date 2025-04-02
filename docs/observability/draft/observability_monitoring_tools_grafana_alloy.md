---
title: 【IT技術の知見】Grafana Alloy＠Grafana
description: Grafana Alloy＠Grafanaの知見を記録しています。
---

# Grafana Alloy＠Grafana

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## config.alloy

### discovery.kubernetes

```bash
discovery.kubernetes "pod" {
      role = "pod"
}
```

> - https://grafana.com/docs/agent/latest/flow/reference/components/discovery.kubernetes/

<br>

### discovery.relabel

```bash
discovery.relabel "pod_logs" {

  targets = discovery.kubernetes.pod.targets

  rule {
    source_labels = ["__meta_kubernetes_namespace"]
    action = "replace"
    target_label = "namespace"
  }

  rule {
    source_labels = ["__meta_kubernetes_pod_name"]
    action = "replace"
    target_label = "pod"
  }

  rule {
    source_labels = ["__meta_kubernetes_pod_container_name"]
    action = "replace"
    target_label = "container"
  }

  rule {
    source_labels = ["__meta_kubernetes_pod_label_app_kubernetes_io_name"]
    action = "replace"
    target_label = "app"
  }

  rule {
    source_labels = ["__meta_kubernetes_namespace", "__meta_kubernetes_pod_container_name"]
    action = "replace"
    target_label = "job"
    separator = "/"
    replacement = "$1"
  }

  rule {
    source_labels = ["__meta_kubernetes_pod_uid", "__meta_kubernetes_pod_container_name"]
    action = "replace"
    target_label = "__path__"
    separator = "/"
    replacement = "/var/log/pods/*$1/*.log"
  }

  rule {
    source_labels = ["__meta_kubernetes_pod_container_id"]
    action = "replace"
    target_label = "container_runtime"
    regex = "^(\\S+):\\/\\/.+$"
    replacement = "$1"
  }
}
```

> - https://grafana.com/docs/agent/latest/flow/reference/components/discovery.relabel/
> - https://grafana.com/docs/alloy/latest/collect/logs-in-kubernetes/#pods-logs

<br>

### local.file_match

```bash
local.file_match "kubernetes_pods" {
	path_targets = discovery.relabel.kubernetes_pods.output
}
```

> - https://grafana.com/docs/agent/latest/flow/reference/components/local.file_match/

<br>

### loki.process

```bash
loki.process "pod_logs" {
  stage.static_labels {
      values = {
        cluster = "istio-demo",
      }
  }

  forward_to = [loki.write.grafana_loki.receiver]
}

loki.source.kubernetes "pod_logs" {
  targets    = discovery.relabel.pod_logs.output
  forward_to = [loki.process.pod_logs.receiver]
}
```

> - https://grafana.com/docs/agent/latest/flow/reference/components/loki.process/

<br>

### loki.source.file

```bash
loki.source.file "kubernetes_pods" {
	targets               = local.file_match.kubernetes_pods.targets
	forward_to            = [loki.process.kubernetes_pods.receiver]
	legacy_positions_file = "/run/promtail/positions.yaml"
}
```

> - https://grafana.com/docs/agent/latest/flow/reference/components/loki.source.file/

<br>

### loki.source.kubernetes

```bash
loki.source.kubernetes "pod_logs" {
  targets    = discovery.relabel.pod_logs.output
  forward_to = [loki.process.pod_logs.receiver]
}

loki.process "pod_logs" {
  stage.static_labels {
      values = {
        cluster = "istio-demo",
      }
  }

  forward_to = [loki.write.grafana_loki.receiver]
}
```

> - https://grafana.com/docs/agent/latest/flow/reference/components/loki.source.kubernetes/

<br>

### loki.write

```bash
loki.write "pod_logs" {
  endpoint {
    url = "http://grafana-loki.grafana-loki.svc.cluster.local:3100/loki/api/v1/push"
  }
}
```

> - https://grafana.com/docs/agent/latest/flow/reference/components/loki.write/

<br>
