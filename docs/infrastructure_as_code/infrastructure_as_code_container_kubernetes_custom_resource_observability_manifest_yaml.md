---
title: 【知見を記録するサイト】可観測性リソース＠カスタムリソース
description: 可観測性＠カスタムリソースの知見をまとめました。
---

# 可観測性リソース＠カスタムリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Grafana

### セットアップ

#### ▼ grafanaチャートリポジトリから

最小構成をインストールする場合、grafanaチャートのみをインストールする。

参考：https://github.com/grafana/helm-charts/tree/main/charts/grafana

```bash
$ helm repo add grafana https://grafana.github.io/helm-charts
$ helm repo update

$ helm install <リリース名> grafana/grafana
```

#### ▼ kube-prometheus-stackチャートリポジトリから

Prometheusと連携しやすくする場合は、Helmチャートのkube-prometheus-stackチャートをインストールする。

参考：https://recruit.gmo.jp/engineer/jisedai/blog/kube-prometheus-stack-investigation/

```bash
$ helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

$ helm install <リリース名> prometheus-community/kube-prometheus-stack
```

#### ▼ ドキュメントから

GrafanaのドキュメントからYAMLファイルをコピーし、```grafana.yaml```ファイルを作成する。これをデプロイする。

参考：https://grafana.com/docs/grafana/latest/installation/kubernetes/

```bash
$ kubectl apply -f grafana.yaml
```

<br>

## 01-02. ConfigMap

### grafanaチャートの場合

grafanaチャートでは、```values```ファイルの```label```キーや```labelValue```キーを使用して、ダッシュボードのマニフェストファイル化を制御しており、デフォルト値として```label```キーに```grafana_dashboard```が設定されている。これにより、```label```キーに```grafana_dashboard```キーを持つConfigMapのみがダッシュボードの設定として読み込まれる。

参考：https://github.com/grafana/helm-charts/blob/main/charts/grafana/values.yaml

```yaml
# valuesファイル
  dashboards:
  
    # 中略

    label: grafana_dashboard
    labelValue: null

    # 中略

  datasources:
  
    # 中略
  
    label: grafana_datasource
    labelValue: null
```

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-grafana-dashboard
  labels:
    grafana_dashboard: "<labelValueに設定した値>"
data:
  foo.json: |-
    # GrafanaのダッシュボードからエクスポートしたJSONファイルを貼り付ける。
```

<br>

### kube-prometheus-stackチャートの場合

kube-prometheus-stackチャートは、prometheusのチャートの他、grafanaチャートなどに依存している。kube-prometheus-stackチャートの```values```ファイルでは、```labelValue```に```1```が割り当てられている。

参考：https://github.com/prometheus-community/helm-charts/blob/main/charts/kube-prometheus-stack/values.yaml

```yaml
# valuesファイル

  sidecar:
    dashboards:
    
      # 中略
 
      label: grafana_dashboard
      labelValue: "1"
      
      # 中略

    datasources:

      # 中略

      label: grafana_datasource
      labelValue: "1"
```

そのため、kube-prometheus-stackチャートを用いる場合は```grafana_dashboard```キーの値が```1```のConfigMapのみがダッシュボードの設定として読み込まれる。マニフェストファイルから作成したダッシュボードは、GUIからは削除できないようになっており。

参考：https://rancher.com/docs/rancher/v2.6/en/monitoring-alerting/guides/persist-grafana/

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-grafana-dashboard
  labels:
    grafana_dashboard: "1"
data:
  foo.json: |-
    # GrafanaのダッシュボードからエクスポートしたJSONファイルを貼り付ける。
```

<br>

## 02. PrometheusOperator

### セットアップ

#### ▼ kube-prometheus-stackチャートリポジトリから

Helmチャートのkube-prometheus-stackチャートをデプロイする。

参考：

- https://prometheus-operator.dev/docs/operator/api/
- https://recruit.gmo.jp/engineer/jisedai/blog/kube-prometheus-stack-investigation/
- https://zaki-hmkc.hatenablog.com/entry/2020/10/16/003542

```bash
$ helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

$ helm install <リリース名> prometheus-community/kube-prometheus-stack
```

<br>

## 02-02. PrometheusRule

### spec.groups

#### ▼ groupsとは

アラートグループを設定できる。アラートが多すぎる場合に、アラートをグループ化し、通知頻度を調節すると良い。

参考：https://prometheus.io/docs/alerting/latest/alertmanager/#grouping

#### ▼ name

グループ名を設定する。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: pod-alert-prometheus-rule
  namespace: prometheus
  labels:
    app: foo
spec:
  groups:
    - name: foo-pod-alert-prometheus-rule

     # グループは複数設定できる。
     - name: ...
```

#### ▼ rules

アラートのルールを設定する。

参考：https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/

| 項目              | 説明                                                         |
| ----------------- | ------------------------------------------------------------ |
| ```alert```       | アラート名を設定する                                         |
| ```annotations``` | アラートの通知内容を設定する。```labels```キーや発火値（```$value```）を通知内容に変数で出力できる。 |

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: pod-cpu-alert-prometheus-rule
  namespace: prometheus
  labels:
    app: foo
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

## 02-03. ServiceMonitor

### spec.endpoints

#### ▼ endpointsとは

スクレイピングの対象とするServiceで待ち受けているエンドポイントを設定する。

#### ▼ path

エンドポイントのパスを設定する。

参考：https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/

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

エンドポイントのポート名を設定する。

参考：https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/

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

エンドポイントのプロトコルを設定する。

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

エンドポイントのポート番号を設定する。

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

スクレイピングの対象とするServiceが属するNamespaceを設定する。

#### ▼ any

全てNamespaceをスクレイピング対象として設定する。

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

特定のNamespaceをスクレイピング対象として設定する。

参考：https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: foo-service-monitor
  namespace: prometheus
spec:
  - namespaceSelector:
      matchNames:
        - foo
```

<br>

### spec.selector

#### ▼ matchLabels

スクレイピングの対象とするServiceに付与された```metadata.labels```キーを設定する。

参考：https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: foo-service-monitor
  namespace: prometheus
spec:
  - selector:
      matchLabels:
        app: foo
```

<br>

