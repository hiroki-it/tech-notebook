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

### Grafanaの仕組み

#### ▼ 構造

Grafanaは、ダッシュボードを作るKuberneteリソースとPromQLから構成されている。Prometheusで収集されたメトリクスをPromQLを用いて取得し、可視化する。

参考：https://atmarkit.itmedia.co.jp/ait/articles/2205/31/news011.html

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

### Kialiの仕組み

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

### セットアップ

<br>

## 05. Prometheus

### Prometheusの仕組み

#### ▼ 構造

Prometheusは、Retrieval、TSDB、HTTPサーバー、から構成されている。EKubernetesリソースのメトリクスを収集し、分析する。

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

PrometheusがPull型メトリクスを対象から収集するためのエンドポイントとして機能する。収集したいメトリクスに合わせて、Exporterを選ぶ必要がある。

参考：

- https://prometheus.io/docs/instrumenting/exporters/
- https://openstandia.jp/oss_info/prometheus
- https://tech-blog.abeja.asia/entry/2016/12/20/202631

| Exporter名                                                   | Exportタイプ | 説明                                                 |
| :----------------------------------------------------------- | ------------ | ---------------------------------------------------- |
| [node_exporter](https://github.com/prometheus/node_exporter) | DaemonSet型  | ノードのメトリクスを収集する。                       |
| [kube-state-metrics](https://github.com/kubernetes/kube-state-metrics) | Deplyoment型 | Kubernetesのリソース単位でメトリクスを収集する。     |
| [nginx-vts-exporter](https://github.com/hnlq715/nginx-vts-exporter) | Sidecar型    | Nginxのメトリクスを収集する。                        |
| [apache_exporter](https://github.com/Lusitaniae/apache_exporter) | Sidecar型    | Apacheのメトリクスを収集する。                       |
| [black box expoter](https://github.com/prometheus/blackbox_exporter) | Deplyoment型 | 各種通信プロトコルの状況をメトリクスとして収集する。 |
| [mysqld_exporter](https://github.com/prometheus/mysqld_exporter) | Sidecar型    | MySQL/MariaDBのメトリクスを収集する。                |
| [postgres_exporter](https://github.com/prometheus-community/postgres_exporter) | Sidecar型    | PostgreSQLのメトリクスを収集する。                   |
| [oracledb_exporter](https://github.com/iamseth/oracledb_exporter) | Sidecar型    | Oracleのメトリクスを収集する。                       |
| [elasticsearch_exporter](https://github.com/prometheus-community/elasticsearch_exporter) | Deployment型 | ElasticSearchのメトリクスを収集する。                |
| [redis_exporter](https://github.com/oliver006/redis_exporter) | Sidecar型    | Redisのメトリクスを収集する。                        |

#### ▼ PushGateway

PrometheusがPush型メトリクスを対象から収集するためのエンドポイントとして機能する。

参考：https://prometheus.io/docs/practices/pushing/

<br>

### セットアップ

#### ▼ チャートリポジトリから

Helmチャートのkube-prometheus-stackチャートをデプロイする。

参考：

- https://recruit.gmo.jp/engineer/jisedai/blog/kube-prometheus-stack-investigation/
- https://zaki-hmkc.hatenablog.com/entry/2020/10/16/003542

```bash
$ helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

$ helm install <リリース名> prometheus-community/kube-prometheus-stack
```

<br>

## 06. Jaeger

### 仕組み

Kubernetesリソースの分散トレースを収集し、これの分析と可視化を行う。

参考：https://www.jaegertracing.io/docs/1.31/architecture/

![jaeger_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/jaeger_architecture.png)

<br>
