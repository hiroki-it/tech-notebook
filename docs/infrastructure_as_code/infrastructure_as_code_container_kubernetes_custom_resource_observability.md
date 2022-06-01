---
title: 【知見を記録するサイト】可観測性リソース＠カスタムリソース
description: 可観測性＠カスタムリソースの知見をまとめました。
---

# 可観測性リソース＠カスタムリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. よく使う可観測性リソース一覧

各リソースの責任領域を以下に示す。

参考：https://landscape.cncf.io/card-mode?category=observability-and-analysis&grouping=category&sort=stars

| アクション         | cAdvisor | Grafana | Jaeger | Kiali | kube-state-metrics | Prometheus |
| ------------------ | -------- | ------- | ------ | ----- | ------------------ | ---------- |
| メトリクスの収集   | ✅        |         |        | ✅     | ✅                  | ✅          |
| ログの収集         |          |         |        |       |                    |            |
| 分散トレースの収集 |          |         | ✅      |       |                    |            |
| ↓                  |          |         |        |       |                    |            |
| データの保管       |          |         |        |       |                    |            |
| データの分析       | ✅        |         | ✅      | ✅     | ✅                  | ✅          |
| データの可視化     | ✅        | ✅       |        |       |                    |            |
| レポートの作成     |          |         |        |       |                    |            |
| ↓                  |          |         |        |       |                    |            |
| アラート           |          |         |        |       |                    |            |

<br>

## 02. Grafana

### 仕組み

#### ▼ 構造

Prometheusで収集されたメトリクスを可視化する。

![prometheus_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/prometheus_architecture.png)

<br>

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

Grafanaのダッシュボードは、ConfigMapでコード化できる。このチャートはprometheusのチャートの他、grafanaチャートなどに依存している。grafanaチャートでは、```values```ファイルの```label```キーや```labelValue```キーを使用して、ダッシュボードのマニフェストファイル化を制御する。デフォルト値として```label```キーに```grafana_dashboard```が設定されている。これにより、```label```キーに```grafana_dashboard```キーを持つConfigMapのみがダッシュボードの設定として読み込まれる。

参考：https://github.com/grafana/helm-charts/blob/main/charts/grafana/values.yaml

```yaml
# grafanaチャートのvaluesファイル
  dashboards:
    enabled: false
    SCProvider: true
    label: grafana_dashboard
    labelValue: null

    # 中略

    searchNamespace: null
```

また、これに依存するkube-prometheus-stackの```values```ファイルでは、```labelValue```に```1```が割り当てられている。

```yaml
# kube-prometheus-stackチャート

  sidecar:
    dashboards:
      enabled: true
      label: grafana_dashboard
      labelValue: "1"
      
      # 中略

    datasources:

      # 中略

      label: grafana_datasource
      labelValue: "1"
```

これにより、```grafana_dashboard```キーの値が```1```のConfigMapのみがダッシュボードの設定として読み込まれる。マニフェストファイルから作成したダッシュボードは、GUIからは削除できないようになっており。

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



#### ▼ ドキュメントから

GrafanaのドキュメントからYAMLファイルをコピーし、```grafana.yaml```ファイルを作成する。これをデプロイする。

参考：https://grafana.com/docs/grafana/latest/installation/kubernetes/

```bash
$ kubectl apply -f grafana.yaml
```

<br>

## 03. Kiali

### 仕組み

#### ▼ 構造

Prometheusで収集されたメトリクスを再収集し、Istioの可視化を拡張する。現状は、Istioのコンポーネントに依存している。

参考：https://kiali.io/docs/architecture/architecture/

![kiali_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kiali_architecture.png)

<br>

### セットアップ

```bash
$ ISTIO_VERSION=1.12

$ kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-${ISTIO_VERSION}/samples/addons/kiali.yaml
```

<br>

## 04. kube-state-metrics

### 仕組み

Kubernetesのリソース単位でメトリクスの収集/分析を行う。

参考：https://tech-blog.abeja.asia/entry/2016/12/20/202631

<br>

### セットアップ

<br>

## Prometheus

### 仕組み

#### ▼ 構造

KubernetesやIstioに関するメトリクスの収集/分析を行う。

参考：https://prometheus.io/docs/introduction/overview/

![prometheus_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/prometheus_architecture.png)

<br>

#### ▼ Alertmanager

Prometheusから送信されたアラートをルーティングする。

参考：

- https://prometheus.io/docs/alerting/latest/alertmanager/
- https://www.designet.co.jp/ossinfo/alertmanager/

![alertmanager](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/alertmanager.png)

#### ▼ Exporter

PrometheusがPull型メトリクスを対象から収集するためのエンドポイントとして機能する。収集したいメトリクスに合わせて、Exporter（node-exporter、blackbox-exporter、consul-exporter、process-exporter、graphite-exporter、など）を選ぶ必要がある。

参考：

- https://prometheus.io/docs/instrumenting/exporters/
- https://openstandia.jp/oss_info/prometheus

#### ▼ PushGateway

PrometheusがPush型メトリクスを対象から収集するためのエンドポイントとして機能する。

参考：https://prometheus.io/docs/practices/pushing/

<br>

### セットアップ

#### ▼ チャートリポジトリから

Helmチャートのkube-prometheus-stackチャートをデプロイする。この中にPrometheusが含まれている。

参考：https://recruit.gmo.jp/engineer/jisedai/blog/kube-prometheus-stack-investigation/

```bash
$ helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

$ helm install <リリース名> prometheus-community/kube-prometheus-stack
```

<br>

## 05. Jaeger

### 仕組み

KubernetesやIstioに関する分散トレースの収集/分析/可視化を行う。

参考：https://www.jaegertracing.io/docs/1.31/architecture/

![jaeger_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/jaeger_architecture.png)

<br>
