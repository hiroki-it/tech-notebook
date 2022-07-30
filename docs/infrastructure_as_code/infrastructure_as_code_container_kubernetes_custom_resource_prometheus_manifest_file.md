---
title: 【IT技術の知見】マニフェストファイル＠Prometheus
description: マニフェストファイル＠Prometheusの知見を記録しています。
---

# マニフェストファイル＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Alertmanager

### Alertmanagerとは

Alertmanagerのセットアップ方法を決定する。

<br>

## 02. AlertmanagerConfig

### AlertmanagerConfigとは

Alertmanagerのアラートグループやルーティング先のルールを決定する。

<br>

## 03. PodMonitor

### PodMonitorとは

Podに対してPull型通信を送信し、これのデータポイントを収集する。

<br>

## 04. Probe

### Probeとは

Ingressや静的IPアドレスのメトリクスに対してPull型通信を送信し、これらのデータポイントを収集する。

<br>

## 05. Prometheus

### Prometheusとは

Prometheusのセットアップ方法を決定する。

<br>

## 06. PrometheusRule

### PrometheusRuleとは

アラートルールとレコーディングルールを決定する。PrometheusRuleの定義に応じて、prometheusコンテナの```/etc/prometheus/rules```ディレクトリ配下にルールの設定ファイルが配置される。

ℹ️ 参考：https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/

<br>

### spec.groups

#### ▼ groupsとは

アラートグループを設定できる。アラートが多すぎる場合に、アラートをグループ化し、通知頻度を調節すると良い。

ℹ️ 参考：https://prometheus.io/docs/alerting/latest/alertmanager/#grouping

#### ▼ name

グループ名を設定する。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: pod-alert-prometheus-rule
  namespace: prometheus
  labels:
    app.kubernetes.io/app: foo
spec:
  groups:
    - name: foo-pod-alert-prometheus-rule

     # グループは複数設定できる。
     - name: ...
```

#### ▼ rules

アラートのルールを設定する。

ℹ️ 参考：https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/

| 項目              | 説明                                                         |
| ----------------- | ------------------------------------------------------------ |
| ```alert```       | アラート名を設定する                                         |
| ```annotations``` | アラートの通知内容を設定する。```metadata.labels```キーや発火値（```$value```）を通知内容に変数で出力できる。 |

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: pod-cpu-alert-prometheus-rule
  namespace: prometheus
  labels:
    app.kubernetes.io/app: foo
spec:
  groups:
     - rules:
        - alert: foo-pod-cpu-alert-prometheus-rule
          annotations:
            summary: 【{{ {{"{{"}} $labels.app {{"}}"}} }}】Pod内コンテナのCPU使用率の上昇しました。
            description: {{ {{"{{"}} $labels.source {{"}}"}} }}コンテナのCPU使用率が{{ {{"{{"}} $value {{"}}"}} }}になりました。
            # アラートのルーティングのクールダウン期間
            for: 1m
            # PromQL
            expr: ...
            # アラートの通知内容に付与するLabel
            labels:
              env: prd
              app: foo
              status: error
              source: gin
```

<br>

## 07. ServiceMonitor

### ServiceMonitorとは

Serviceに対してPull型通信を送信し、これに紐づくリソースのメトリクスのデータポイントを収集する。

ℹ️ 参考：

- https://prometheus-operator.dev/docs/operator/design/#servicemonitor
- https://www.ogis-ri.co.jp/otc/hiroba/technical/kubernetes_use/part5.html

![prometheus_service-monitor](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/prometheus_service-monitor.png)

<br>

### spec.endpoints

#### ▼ endpointsとは

収集の対象とするServiceで待ち受けているエンドポイントを設定する。

#### ▼ interval

収集の間隔を設定する。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: foo-service-monitor
  namespace: prometheus
spec:
  endpoints:
    - interval: 15s
```

#### ▼ path

Serviceの待ち受けるパスを設定する。

ℹ️ 参考：https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: foo-service-monitor
  namespace: prometheus
spec:
  endpoints:
    - path: /metrics
```

#### ▼ port

Serviceの待ち受けるポート名を設定する。

ℹ️ 参考：https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: foo-service-monitor
  namespace: prometheus
spec:
  endpoints:
    - port: http-foo
```

#### ▼ scheme

Serviceの待ち受けるプロトコルを設定する。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: foo-service-monitor
  namespace: prometheus
spec:
  endpoints:
    - scheme: http
```

#### ▼ targetPort

Serviceの待ち受けるポート番号を設定する。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: foo-service-monitor
  namespace: prometheus
spec:
  endpoints:
    - targetPort: 9100
```

<br>

### spec.namespaceSelector

#### ▼ namespaceSelector

収集の対象とするServiceが属するNamespaceを設定する。

#### ▼ any

全てNamespaceを収集対象として設定する。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: foo-service-monitor
  namespace: prometheus
spec:
  - namespaceSelector:
      any: true
```

#### ▼ matchNames

特定のNamespaceを収集対象として設定する。

ℹ️ 参考：https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: foo-service-monitor
  namespace: prometheus
spec:
  - namespaceSelector:
      matchNames:
        - kube-system
```

```yaml
# 収集対象のService
apiVersion: v1
kind: Service
metadata:
  namespace: kube-system
# 〜 中略 〜
```

<br>

### spec.selector

#### ▼ matchLabels

収集の対象とするServiceに付与された```metadata.labels```キーを設定する。

ℹ️ 参考：https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: foo-service-monitor
  namespace: prometheus
spec:
  - selector:
      matchLabels:
        app.kubernetes.io/managed-by: prometheus-operator
        k8s-app: foo
```

```yaml
# 収集対象のService
apiVersion: v1
kind: Service
metadata:
  labels:
    app.kubernetes.io/managed-by: prometheus-operator
    k8s-app: kubelet
# 〜 中略 〜
```

<br>

## 08. ThanosRuler

### ThanosRuler

リモートストレージとしてThanosを使用する場合に、これをセットアップ方法を決定する。