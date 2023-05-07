---
title: 【IT技術の知見】ConfigMap系＠Grafana
description: ConfigMap系＠Grafanaの知見を記録しています。
---

# ConfigMap系＠Grafana

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. grafana-datasource-cm

### grafana-datasource-cmとは

Grafanaの`datasource.yaml`ファイルを管理する。

<br>

### datasources

#### ▼ datasourcesとは

Grafanaのデータソースを設定する。

#### ▼ Prometheusの場合

Prometheusの場合、ビルトインのプラグインを使用できる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  datasource.yaml: |
    apiVersion: 1
    datasources:
      - name: prometheus
        type: prometheus
        url: http://<PrometheusのService名>.<PrometheusのNamespace名>:9090/
        access: proxy
        # デフォルトのデータソースとするか否かを設定する
        isDefault: true
        jsonData:
          timeInterval: 30s
```

> ↪️：
>
> - https://grafana.com/grafana/plugins/prometheus/
> - https://grafana.com/docs/grafana/latest/datasources/prometheus/#configure-the-data-source

#### ▼ VictoriaMetricsの場合

VictoriaMetricsの場合、ビルトインのプラグインを使用できる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  datasource.yaml: |
    apiVersion: 1
    datasources:
      - name: victoria-metrics
        type: prometheus
        url: http://<VictoriaMetricsのサーバーのIPアドレス>:8248/
        access: proxy
        isDefault: false
        jsonData:
          timeInterval: 30s
```

> ↪️：https://grafana.com/docs/grafana/latest/datasources/prometheus/#configure-the-data-source

<br>

## 02. grafana-ini-cm

### grafana-ini-cmとは

Grafanaの`grafana.ini`ファイルを管理する。

> ↪️：
>
> - https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#configuration-file-location
> - https://www.server-world.info/query?os=CentOS_Stream_9&p=grafana

<br>

### pathsセクション

記入中...

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [paths]
    ...
```

> ↪️：https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#paths

<br>

### serverセクション

記入中...

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [server]
    ...
```

> ↪️：https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#server

<br>

### dashboardセクション

#### ▼ min_refresh_interval

ダッシュボードのクエリの自動更新間隔の最小値を設定する。

自動更新間隔のデフォルト値が変わるわけではないことに注意する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [dashboard]
    min_refresh_interval = 5s
```

> ↪️：https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#min_refresh_interval

<br>

### databaseセクション

記入中...

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [database]
    ...
```

> ↪️：https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#database

<br>

### remote_cacheセクション

記入中...

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [remote_cache]
    ...
```

> ↪️：https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#remote_cache

<br>

### date_formatsセクション

#### ▼ date_formatsセクション

時間に関して設定する。

#### ▼ default_timezone

タイムゾーンを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [date_formats]
    default_timezone = Asia/Tokyo
```

<br>

### usersセクション

#### ▼ usersセクション

記入中...

#### ▼ default_theme

ダッシュボードのデフォルトのテーマを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [users]
    default_theme = light
```

#### ▼ home_page

Grafanaのダッシュボードのホームを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [users]
    # foo.grafana.com/dashboards がホームになる。
    home_page = dashboards
```

<br>

## 03. grafana-provider-cm

### grafana-provider-cmとは

Grafanaの`provider.yaml`ファイルを管理する。

ダッシュボードのフォルダを定義できる。

> ↪️：https://github.com/ezienecker/grafana-sidecar-folder-sample/tree/master

<br>

### providers

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  provider.yaml: |
    apiVersion: 1
    providers:
      - name: 'sidecarProvider'
        orgId: 1
        folder: ''
        type: file
        disableDeletion: false
        allowUiUpdates: false
        updateIntervalSeconds: 30
        options:
          foldersFromFilesStructure: false
          path: /tmp/dashboards
```

<br>

## 04. grafana-dashboard-cm

### grafana-dashboard-cmとは

Grafanaの`dashboard.json`ファイルを管理する。

<br>

### セットアップ

#### ▼ grafanaチャートの場合

grafanaチャートでは、`values`ファイルの`dashboards.label`キーや`dashboards.labelValue`キーを使用して、ダッシュボードのマニフェスト化を制御している。

デフォルト値として`dashboards.label`キーに`grafana_dashboard`が設定されている。

これにより、`dashboards.label`キーに`grafana_dashboard`値を持つConfigMapのみがダッシュボードの設定として読み込まれる。

```yaml
# valuesファイル
  dashboards:

    ...

    label: grafana_dashboard
    labelValue: null

    ...

  datasources:

    ...

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
  dashboard.json: |
    # ダッシュボードを定義するか、公開されたダッシュボードを貼り付ける。
```

> ↪️：https://github.com/grafana/helm-charts/blob/main/charts/grafana/values.yaml

#### ▼ kube-prometheus-stackチャートの場合

kube-prometheus-stackチャートでは、prometheusのチャートの他、grafanaチャートなどに依存している。

kube-prometheus-stackチャートの`values`ファイルでは、`labelValue`に`1`が割り当てられている。

```yaml
# valuesファイル

  sidecar:
    dashboards:

      ...

      label: grafana_dashboard
      labelValue: "1"

      ...

    datasources:

      ...

      label: grafana_datasource
      labelValue: "1"
```

> ↪️：https://github.com/prometheus-community/helm-charts/blob/main/charts/kube-prometheus-stack/values.yaml

そのため、kube-prometheus-stackチャートを用いる場合は`grafana_dashboard`キーの値が`1`のConfigMapのみがダッシュボードの設定として読み込まれる。

マニフェストから作成したダッシュボードは、GUIからは削除できないようになっている。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-grafana-dashboard
  labels:
    grafana_dashboard: "1"
data:
  dashboard.json: |
    # ダッシュボードを定義するか、公開されたダッシュボードを貼り付ける。
```

> ↪️：https://rancher.com/docs/rancher/v2.6/en/monitoring-alerting/guides/persist-grafana/

補足として、kube-prometheus-stackチャートではダッシュボードのConfigMapはすでに用意されている。

またその他に、kubernetes-mixinsも同時にインストールするようになっている。

> ↪️：
>
> - https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack/templates/grafana/dashboards-1.14
> - https://monitoring.mixins.dev

<br>

### セクション

```yaml
{
  "id": null,
  "uid": "cLV5GDCkz",
  "title": "New dashboard",
  "tags": [],
  "style": "dark",
  # 公開ダッシュボードを使用している場合、ダッシュボードIDを設定する
  # 反対に、nullであればユーザー定義のダッシュボードである
  "gnetId": 1,
  "timezone": "browser",
  # ダッシュボードをGUIから編集可能かを設定する
  "editable": false,
  "graphTooltip": 1,
  "panels": [],
  "time": {"from": "now-6h", "to": "now"},
  # ダッシュボードのデフォルトの時間間隔を設定する
  "timepicker": {"time_options": [], "refresh_intervals": []},
  # ドロップダウンの変数を設定する
  "templating": {"list": []},
  "annotations": {"list": []},
  # 自動更新間隔を設定する
  "refresh": "5s",
  "schemaVersion": 17,
  "version": 0,
  "links": [],
}
```

> ↪️：https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/view-dashboard-json-model

<br>

## 04-02. ユーザー定義のダッシュボード

### ユーザー定義のダッシュボードとは

ConfigMapの`.data`キーにJSONを設定すると、ダッシュボードを作成できる。

ConfigMapで作成したダッシュボードは、デフォルトでGrafanaのGUIから変更できないようになっている。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-grafana-dashboard
  labels:
    grafana_dashboard: "<labelValueに設定した値>"
data:
  dashboard.json: |
    # ダッシュボードを定義する。
```

> ↪️：https://grafana.com/grafana/dashboards/

<br>

### ホームダッシュボード

ユーザー定義のホームダッシュボードを作成し、ダッシュボードの使い方を文字で説明する。

> ↪️：https://grafana.com/blog/2022/06/06/grafana-dashboards-a-complete-guide-to-all-the-different-types-you-can-build/?pg=webinar-getting-started-with-grafana-dashboard-design-amer&plcmt=related-content-1#the-home-dashboards

<br>

## 04-03. 公開ダッシュボード

### 公開ダッシュボードとは

ユーザー定義のダッシュボードを自前で定義しても良いが、セットアップの簡単さやPrometheusのアップグレードへの追従しやすさの観点から、公開されたダッシュボード (例：kubernetes-mixins、Grafanaダッシュボードコミュニティ) を使用した方が良い。

その場合、GitHubなどで公開されているJSONを、ConfigMapの`.data`キーに貼り付ける。

ConfigMapで作成したダッシュボードは、デフォルトでGrafanaのGUIから変更できないようになっている。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-grafana-dashboard
  labels:
    grafana_dashboard: "<labelValueに設定した値>"
data:
  dashboard.json: |
    # ダッシュボードを定義する。
```

> ↪️：
>
> - https://monitoring.mixins.dev
> - https://grafana.com/grafana/dashboards/

<br>

### 公開ダッシュボードの共通仕様

#### ▼ USEメトリクス

『`USE`』という名前を含む公開ダッシュボードがある。

ダッシュボードは、USEメトリクス (例：CPU使用率、CPUサチュレーション、など) を表示できる。

> ↪️：
> 
> - https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/#use-method
> - https://grafana.com/blog/2022/06/06/grafana-dashboards-a-complete-guide-to-all-the-different-types-you-can-build/?pg=webinar-getting-started-with-grafana-dashboard-design-amer&plcmt=related-content-1#usereds-dashboards

#### ▼ REDメトリクス

『`RED`』という名前を含む公開ダッシュボードがある。


ダッシュボードは、REDメトリクスを表示できる。

> ↪️：
> 
> - https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/#red-method
> - https://grafana.com/blog/2022/06/06/grafana-dashboards-a-complete-guide-to-all-the-different-types-you-can-build/?pg=webinar-getting-started-with-grafana-dashboard-design-amer&plcmt=related-content-1#usereds-dashboards

<br>

### kubernetes-mixinsのGrafanaダッシュボード

#### ▼ Alertmanager

| ダッシュボード名          | 監視対象          | 説明 |
| ------------------------- | ----------------- | ---- |
| `Alertmanager / Overview` | AlertmanagerのPod |      |

#### ▼ CoreDNS

| ダッシュボード名 | 監視対象     | 説明                                                                                               |
| ---------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| `CoreDNS`        | CoreDNSのPod | CoreDNSのPodに対するリクエストに関するメトリクス (例：リクエスト数、レスポンスタイム) を取得する。 |

#### ▼ Kubernetesコンポーネント

| ダッシュボード名                                         | 監視対象                | 説明                                                                                                                                                                                                                                |
| -------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Kubernetes / API server`                                | kube-apiserver          | kube-apiserverのSLI、エラーバジェット、ハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率) を取得する。                                                                                                      |
| `Kubernetes / Networking / Cluster`                      | 任意のCluster           | Clusterのネットワークのパフォーマンス指標に関するメトリクス (例：帯域幅、秒当たりパケット受信数) を取得する。                                                                                                                       |
| `Kubernetes / Controller Manager`                        | kube-controller-manager |                                                                                                                                                                                                                                     |
| `Kubernetes / Compute Resources / Cluster`               | 任意のCluster           | Clusterのハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) を取得する。                                                                                                             |
| `Kubernetes / Compute Resources / Namespace (Pods)`      | 任意のPod               | Namespace単位で、Podのハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) を取得する。同じNamespace複数のPod (削除されたPodも含む) のメトリクスを一括して確認したい場合に便利である。 |
| `Kubernetes / Compute Resources / Node (Pods)`           | 任意のPod               | Node単位で、Podのハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) を取得する。同じNodeの複数のPod (削除されたPodも含む) のメトリクスを一括して確認したい場合に便利である。         |
| `Kubernetes / Compute Resources / Pod`                   | 任意のPod               | 各Podのハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) を取得する。個別のPodや特定のPodの状況を確認したい場合に便利である。                                                       |
| `Kubernetes / Compute Resources / Workload`              | 任意のPod               | ワークロード (例：Deployment) 単位で、Podのハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) を取得する。                                                                           |
| `Kubernetes / Compute Resources / Namespace (Workloads)` | 任意のPod               | ワークロード (例：Deployment) 単位かつNamespace単位で、Podのハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) を取得する。                                                          |
| `Kubernetes / Kubelet`                                   | kubelet                 |                                                                                                                                                                                                                                     |
| `Kubernetes / Networking / Namespace (Pods)`             | 任意のPod               | Namespace単位で、Podのネットワークに関するメトリクスを取得する。複数のPod (削除されたPodも含む) のメトリクスを一括して確認したい場合に便利である。                                                                                  |
| `Kubernetes / Networking / Namespace (Workload)`         | 任意のPod               | ワークロード (例：Deployment) 単位で、Podのネットワークに関するメトリクスを取得する。                                                                                                                                               |
| `Kubernetes / Persistent Volumes`                        | 任意のPod               | Persistent Volumeの使用率に関するメトリクスを取得する。                                                                                                                                                                             |
| `Kubernetes / Networking / Pod`                          | 任意のPod               | 各Podのネットワークに関するメトリクスを取得する。Podを個別に確認したい場合に便利である。                                                                                                                                            |
| `Kubernetes / Proxy`                                     | kube-proxy              |                                                                                                                                                                                                                                     |
| `Kubernetes / Scheduler`                                 | kube-scheduler          |                                                                                                                                                                                                                                     |
| `Kubernetes / Networking / Workload`                     | kube-scheduler          |                                                                                                                                                                                                                                     |

#### ▼ Node exporter

| ダッシュボード名                       | 監視対象           | 説明 |
| -------------------------------------- | ------------------ | ---- |
| `Node Exporter / USE Method / Cluster` | Node exporterのPod |      |
| `Node Exporter / USE Method / Node`    | Node exporterのPod |      |
| `Node Exporter / Nodes`                | Node exporterのPod |      |

#### ▼ Prometheus

| ダッシュボード名            | 監視対象        | 説明 |
| --------------------------- | --------------- | ---- |
| `Prometheus / Remote Write` | PrometheusのPod |      |
| `Prometheus / Overview`     | PrometheusのPod |      |

> ↪️：https://github.com/monitoring-mixins/website/tree/master/assets

#### ▼ Istioダッシュボード

`istioctl dashboard grafana`コマンドでインストールできるダッシュボード。

| ダッシュボード名                 |                               | 説明                                                                          |
| -------------------------------- | ----------------------------- | ----------------------------------------------------------------------------- |
| `Istio Wasm Extension Dashboard` |                               |                                                                               |
| `Istio Mesh Dashboard`           |                               | HTTPとTCPのメトリクスを確認したい場合に便利である。                           |
| `Istio Control Plane Dashboard`  | IsitiodのPod                  |                                                                               |
| `Istio Performance Dashboard`    |                               |                                                                               |
| `Istio Workload Dashboard`       | Istioの任意のカスタムリソース |                                                                               |
| `Istio Service Dashboard`        | IstioのVirtualService         | IngressGatewayの宛先のServiceに関するメトリクスを確認したい場合に便利である。 |

> ↪️：
>
> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-dashboard-grafana
> - https://github.com/istio/istio/tree/master/manifests/addons/dashboards
> - https://istio.io/latest/docs/tasks/observability/metrics/using-istio-dashboard/#viewing-the-istio-dashboard
> - https://istio.io/latest/docs/tasks/observability/metrics/using-istio-dashboard/#about-the-grafana-dashboards

<br>
