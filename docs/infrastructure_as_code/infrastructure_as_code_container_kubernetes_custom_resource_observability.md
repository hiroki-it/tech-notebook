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

#### ▼ ドキュメントから

GrafanaのドキュメントからYAMLファイルをコピーし、```grafana.yaml```ファイルを作成する。これをデプロイする。

参考：https://grafana.com/docs/grafana/latest/installation/kubernetes/

```bash
$ kubectl apply -f grafana.yaml
```

<br>

## 02-02. manifest.yaml

### ConfigMap

#### ▼ grafanaチャートの場合

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

#### ▼ kube-prometheus-stackチャートの場合

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

## 05. Prometheus

### Prometheusの仕組み

Prometheusは、Retrieval、TSDB、HTTPサーバー、から構成されている。EKubernetesリソースのメトリクスを収集し、分析する。また設定された条件下でアラートを生成し、Alertmanagerに送信する。

参考：

- https://prometheus.io/docs/introduction/overview/
- https://knowledge.sakura.ad.jp/11635/#Prometheus-3

![prometheus_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/prometheus_architecture.png)

<br>

### Alertmanager

#### ▼ Alertmanagerとは

Prometheusからアラートを受信し、特定の条件下でルーティングする。

参考：

- https://prometheus.io/docs/alerting/latest/alertmanager/
- https://www.designet.co.jp/ossinfo/alertmanager/
- https://knowledge.sakura.ad.jp/11635/#Prometheus-3

![alertmanager](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/alertmanager.png)

<br>

### Exporter

#### ▼ Exporterとは

PrometheusがPull型メトリクスを対象から収集するためのエンドポイントとして機能する。収集したいメトリクスに合わせて、Exporterを選ぶ必要がある。また、各Exporterは待ち受けているエンドポイントやポート番号が異なっており、Prometheusが各Exporterにリクエストを送信できるように、各ワーカーNodeでエンドポイントやポート番号へのインバウンド通信を許可する必要がある。

参考：https://openstandia.jp/oss_info/prometheus

#### ▼ Exporterタイプ

| タイプ       | 設置方法                                          |
| ------------ | ------------------------------------------------- |
| DaemonSet型  | 各ワーカーNode内に、1つずつ設置する。             |
| Deployment型 | 各ワーカーNode内のDeploymentに、1つずつ設置する。 |
| Sidecar型    | 各ワーカーNode内のPodに、1つずつ設置する。        |

**＊例＊**

参考：https://prometheus.io/docs/instrumenting/exporters/

| Exporter名                                                   | Exportタイプ | 説明                                                         |
| :----------------------------------------------------------- | ------------ | ------------------------------------------------------------ |
| [node-exporter](https://github.com/prometheus/node_exporter) | DaemonSet型  | ノードのメトリクスを収集する。                               |
| [kube-state-metrics](https://github.com/kubernetes/kube-state-metrics) | Deplyoment型 | Kubernetesのリソース単位でメトリクスを収集する。<br>参考：https://tech-blog.abeja.asia/entry/2016/12/20/202631 |
| [nginx-vts-exporter](https://github.com/hnlq715/nginx-vts-exporter) | Sidecar型    | Nginxのメトリクスを収集する。                                |
| [apache-exporter](https://github.com/Lusitaniae/apache_exporter) | Sidecar型    | Apacheのメトリクスを収集する。                               |
| [black box expoter](https://github.com/prometheus/blackbox_exporter) | Deplyoment型 | 各種通信プロトコルの状況をメトリクスとして収集する。         |
| [mysqld-exporter](https://github.com/prometheus/mysqld_exporter) | Sidecar型    | MySQL/MariaDBのメトリクスを収集する。                        |
| [postgres-exporter](https://github.com/prometheus-community/postgres_exporter) | Sidecar型    | PostgreSQLのメトリクスを収集する。                           |
| [oracledb-exporter](https://github.com/iamseth/oracledb_exporter) | Sidecar型    | Oracleのメトリクスを収集する。                               |
| [elasticsearch-exporter](https://github.com/prometheus-community/elasticsearch_exporter) | Deployment型 | ElasticSearchのメトリクスを収集する。                        |
| [redis-exporter](https://github.com/oliver006/redis_exporter) | Sidecar型    | Redisのメトリクスを収集する。                                |

#### ▼ PushGateway

PrometheusがPush型メトリクスを対象から収集するためのエンドポイントとして機能する。

参考：https://prometheus.io/docs/practices/pushing/

<br>

### セットアップ

#### ▼ kube-prometheus-stackチャートリポジトリから

Helmチャートのkube-prometheus-stackチャートをデプロイする。

参考：

- https://recruit.gmo.jp/engineer/jisedai/blog/kube-prometheus-stack-investigation/
- https://zaki-hmkc.hatenablog.com/entry/2020/10/16/003542

```bash
$ helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

$ helm install <リリース名> prometheus-community/kube-prometheus-stack
```

<br>

## 05-02. PrometheusRule

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
            summary: 【{{ {{"{{"}} $labels.app {{"}}"}} }}】Pod内のコンテナのCPU使用率の上昇しました。
            description: {{ {{"{{"}} $labels.source {{"}}"}} }}コンテナのCPU使用率が{{ {{"{{"}} $value {{"}}"}} }}になりました。
            # アラートのルーティングのクールダウン期間
            for: 1m
            # PromQL
            expr: ...
            # アラートの通知内容に付与するラベル
            labels:
              env: prd
              app: foo
              status: error
              source: gin
```

<br>

## 06. Jaeger

### 仕組み

Kubernetesリソースの分散トレースを収集し、これの分析と可視化を行う。

参考：https://www.jaegertracing.io/docs/1.31/architecture/

![jaeger_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/jaeger_architecture.png)

<br>
