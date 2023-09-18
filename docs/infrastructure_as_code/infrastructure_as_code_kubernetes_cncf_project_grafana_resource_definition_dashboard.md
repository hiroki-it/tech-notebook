---
title: 【IT技術の知見】ダッシュボード＠Grafana
description: ダッシュボード＠Grafanaの知見を記録しています。
---

# ダッシュボード＠Grafana

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ユーザー定義のダッシュボード

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
  foo.json: |-
    {{ `
    ダッシュボードのJSON
    ` }}
```

> - https://grafana.com/grafana/dashboards/

<br>

### 管理方法

ユーザー定義のダッシュボードを専用のディレクトリで管理する。

```yaml
.
├── Chart.yaml
├── README.md
├── templates
│   ├── custom-dashboards
│   │   ├── slo-1.json
│   │   └── slo-2.json
│   │
```

<br>

### エスケープ

Goのテンプレートでは、『`{{`』と『`}}`』の記号がロジックで使用される。

ダッシュボードのJSONではこれを使用するため、ロジックとして認識されないようにエスケープする必要がある。

エスケープの方法は数種があるが、一番簡単な方法を採用する。

記号を含む文字ごと``{{ `<記号を含む文字列全体>` }}``のように挟み、エスケープする。

多くの場合にこの方法で対処できるが、文字列内にバックスラッシュがある場合は対処できない。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-grafana-dashboard
  namespace: prometheus
  labels:
    grafana_dashboard: "1"
data:
  foo.json: |-
    {{ `
    ダッシュボードのJSON
    ` }}
```

> - https://stackoverflow.com/a/38941123

### HelmテンプレートによるConfigMap作成

ダッシュボードはJSONファイルとして管理し、これをConfigMapのテンプレートに出力するようにすると、管理しやすい。

ただ出力時にHelm起因のエラーが多発するため、自分はこれを不採用とした。

> - https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack/templates/grafana/dashboards-1.14
> - https://stackoverflow.com/questions/64662568/how-can-i-use-a-json-file-in-my-configmap-yaml-helm

<br>

### ホームダッシュボード

ホームダッシュボードとして、ダッシュボードの一覧を表示すると、検索する手間が省ける。

```ini
# grafana.iniファイル
[dashboard]
# Grafanaコンテナでホームダッシュボードのあるパス
default_home_dashboard_path = /var/lib/grafana/dashboards/local/home.json
```

```yaml
{
  "annotations":
    {
      "list":
        [
          {
            "builtIn": 1,
            "datasource": "-- Grafana --",
            "enable": true,
            "hide": true,
            "iconColor": "rgba(0, 211, 255, 1)",
            "name": "Annotations & Alerts",
            "type": "dashboard",
          },
        ],
    },
  "editable": true,
  "gnetId": null,
  "graphTooltip": 0,
  "id": null,
  "links": [],
  "panels":
    [
      {
        "datasource": null,
        "gridPos": {"h": 36, "w": 24, "x": 0, "y": 0},
        "id": 3,
        "links": [],
        "options":
          {
            "folderId": 0,
            "maxItems": 100,
            "query": "",
            "showHeadings": true,
            "showRecentlyViewed": false,
            "showSearch": true,
            "showStarred": false,
            "tags": [],
          },
        "pluginVersion": "8.0.0",
        "tags": [],
        "title": "Dashboards",
        "type": "dashlist",
      },
    ],
  "refresh": "",
  "schemaVersion": 30,
  "style": "dark",
  # リポジトリ名やリポジトリURLをタグにつける
  "tags": ["<リポジトリ名>", "github.com/example"],
  "templating": {"list": []},
  "time": {"from": "now-6h", "to": "now"},
  "timepicker":
    {
      "hidden": true,
      "refresh_intervals":
        ["5s", "10s", "30s", "1m", "5m", "15m", "30m", "1h", "2h", "1d"],
      "time_options":
        ["5m", "15m", "1h", "6h", "12h", "24h", "2d", "7d", "30d"],
      "type": "timepicker",
    },
  "timezone": "browser",
  "title": "Home",
  "uid": null,
  "version": 0,
}
```

> - https://grafana.com/blog/2022/06/06/grafana-dashboards-a-complete-guide-to-all-the-different-types-you-can-build/?pg=webinar-getting-started-with-grafana-dashboard-design-amer&plcmt=related-content-1#the-home-dashboards

<br>

## 02. コミュニティダッシュボード

### コミュニティダッシュボードとは

ユーザー定義のダッシュボードを自前で定義しても良いが、セットアップの簡単さやPrometheusのアップグレードへの追従しやすさの観点から、公開されたダッシュボード (例：kubernetes-mixins、Grafanaダッシュボードコミュニティ) を使用した方が良い。

その場合、GitHubなどで公開されているJSONを、ConfigMapの`.data`キーに貼り付ける。

ConfigMapで作成したダッシュボードは、デフォルトでGrafanaのGUIから変更できないようになっている。

<br>

### 管理方法

コミュニティダッシュボードを専用のディレクトリで管理する。

ツールのいずれのバージョンに対応するダッシュボードなのかを、ケバブケースでファイル名に記載すると管理しやすい。

**＊実装例＊**

Istio関連のコミュニティダッシュボードを使用する場合は、以下の通りとする。

```yaml
.
├── Chart.yaml
├── README.md
├── templates
│   ├── community-dashboards
│   │   ├── istio-control-plane-1-15-3.json
│   │   ├── istio-mesh-1-15-3.json
│   │   ├── istio-performance-1-15-3.json
│   │   ├── istio-service-1-15-3.json
│   │   └── istio-workload-1-15-3.json
│   │
```

> - https://monitoring.mixins.dev
> - https://grafana.com/grafana/dashboards/

<br>

### エスケープ

注意点として、ユーザー定義のダッシュボードと同様にして、記号をエスケープする必要がある。

<br>

### コミュニティダッシュボードの採用

#### `(1)` ダッシュボードの検索

コミュニティダッシュボードのJSONは、[Grafana Labs](https://grafana.com/grafana/dashboards/) からダウンロードできる。

コミュニティダッシュボードのIDはJSONの`gnetId`セクションから確認でき、ダッシュボードをアップグレードする場合は、IDから該当のものを探すようにする。

反対に、`gnetId`セクションが`null`になっているものは、ユーザー定義のダッシュボードである。

```yaml
{"gnetId": 1}
```

また、コミュニティダッシュボードのバージョンは、`description`セクションから確認できる (コミュニティダッシュボードによってはバージョンの記載がないものがある)。

```yaml
{"description": "Foo Dashboard version 1.0.0"}
```

#### `(2)` ダッシュボードのバージョンの選択

ダッシュボードの`__requires`セクションで、PrometheusとGrafanaの最低バージョンを確認する。

Kubernetesで稼働するPrometheusとGrafanaのバージョンに応じたダッシュボードを選ぶ。

他には、ツールとダッシュボードの両方のバージョンが対応関係にある場合がある (例：Istioとダッシュボードの両方のバージョンは対応する)。

ただし、Prometheusの方のバージョンは気にしなくて良さそう (よくあるPrometheusの`5.0.0`なんてバージョンは存在しない)。

```yaml
{
  "__requires": [
    {
      "type": "grafana",
      "id": "grafana",
      "name": "Grafana",
      "version": "<最低バージョン>"
    },

    ...

    {
      "type": "datasource",
      "id": "prometheus",
      "name": "Prometheus",
      "version": "<最低バージョン>"
    },

    ...

  ]
}
```

#### `(3)` 整形

[任意のサイト](https://r37r0m0d3l.github.io/json_sort/) で、アルファベット順かつスペース`2`個で整形する。

これは、運用方針による。

#### `(4)` 貼り付け

ConfigMapのJSONファイルのデータとして貼り付ける。

エスケープするのを忘れない。

なお、後々アップグレードしていくことになるため、運用が複雑にならないように、コミュニティダッシュボードはいじらない方が良い。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-dashboard
  namespace: prometheus
  labels:
    grafana_dashboard: "1"
data:
  foo.json: |-
    {{ `
    ダッシュボードのJSON
    ` }}
```

<br>

### コミュニティダッシュボードの共通仕様

#### ▼ USEメトリクス

『`USE`』という名前を含むコミュニティダッシュボードがある。

ダッシュボードは、USEメトリクス (例：CPU使用率、CPUサチュレーション、など) を表示できる。

> - https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/#use-method
> - https://grafana.com/blog/2022/06/06/grafana-dashboards-a-complete-guide-to-all-the-different-types-you-can-build/?pg=webinar-getting-started-with-grafana-dashboard-design-amer&plcmt=related-content-1#usereds-dashboards

#### ▼ REDメトリクス

『`RED`』という名前を含むコミュニティダッシュボードがある。

ダッシュボードは、REDメトリクスを表示できる。

> - https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/#red-method
> - https://grafana.com/blog/2022/06/06/grafana-dashboards-a-complete-guide-to-all-the-different-types-you-can-build/?pg=webinar-getting-started-with-grafana-dashboard-design-amer&plcmt=related-content-1#usereds-dashboards

<br>

### kubernetes-mixinsのGrafanaダッシュボード

kubernetes-mixinsはGrafanaダッシュボードを公開している。

kubernetes-mixinsのレコーディングルールが定義済みであることが前提になっている。

> - https://github.com/monitoring-mixins/website/tree/master/assets
> - https://monitoring.mixins.dev

#### ▼ Alertmanager

AlertmanagerのPodからデータポイントを収集する。

| ダッシュボード名          | 監視対象          | 説明                                       |
| ------------------------- | ----------------- | ------------------------------------------ |
| `Alertmanager / Overview` | AlertmanagerのPod | Alertmanager固有のメトリクスを分析できる。 |

> - https://github.com/monitoring-mixins/website/tree/master/assets/alertmanager/dashboards

#### ▼ ArgoCD

ArgoCDのPodからデータポイントを収集する。

| ダッシュボード名 | 監視対象    | 説明                                 |
| ---------------- | ----------- | ------------------------------------ |
| `ArgoCD`         | ArgoCDのPod | ArgoCD固有のメトリクスを分析できる。 |

> - https://github.com/argoproj/argo-cd/blob/v2.7.6/examples/dashboard.json

#### ▼ CoreDNS

CoreDNSのPodからデータポイントを収集する。

| ダッシュボード名 | 監視対象     | 説明                                                                                                 |
| ---------------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| `CoreDNS`        | CoreDNSのPod | CoreDNSのPodに対するリクエストに関するメトリクス (例：リクエスト数、レスポンスタイム) を分析できる。 |

> - https://github.com/monitoring-mixins/website/tree/master/assets/coredns/dashboards

#### ▼ Kubernetesコンポーネント

Kubernetesコンポーネントからデータポイントを収集する。

| ダッシュボード名                  | 監視対象                | 説明                                                                                                                             | おすすめ |
| --------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `Kubernetes / API server`         | kube-apiserver          | kube-apiserverのSLI、エラーバジェット、ハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率) を分析できる。 |          |
| `Kubernetes / Kubelet`            | kubelet                 |                                                                                                                                  |          |
| `Kubernetes / Proxy`              | kube-proxy              |                                                                                                                                  |          |
| `Kubernetes / Controller Manager` | kube-controller-manager |                                                                                                                                  |          |
| `Kubernetes / Scheduler`          | kube-scheduler          |                                                                                                                                  |          |

> - https://github.com/monitoring-mixins/website/tree/master/assets/kubernetes/dashboards

#### ▼ Pod

Podからデータポイントを収集する。

kubeletからデータポイントを収集できるようにしておく必要がある。

| ダッシュボード名                                    | 監視対象 | メトリクス                           | 説明                                                                                                                                                                                                                          | おすすめ |
| --------------------------------------------------- | -------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `Kubernetes / Compute Resources / Cluster`          | Pod      | ハードウェアリソース使用率メトリクス | Podのハードウェアリソース使用率メトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) の合計を分析できる。Cluster全体のハードウェアリソースの分析に役立つ。                                                          | ★        |
| `Kubernetes / Compute Resources / Namespace (Pods)` | Pod      | ハードウェアリソース使用率メトリクス | Podのハードウェアリソース使用率メトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) をNamespace単位で分析できる。同じNamespace複数のPod (削除されたPodも含む) のメトリクスの累計を一括して確認したい場合に役立つ。 |          |
| `Kubernetes / Compute Resources / Node (Pods)`      | Pod      | ハードウェアリソース使用率メトリクス | Podのハードウェアリソース使用率メトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) をNode単位で分析できる。同じNodeの複数のPod (削除されたPodも含む) のメトリクスの累計を一括して確認したい場合に役立つ。         |          |
| `Kubernetes / Compute Resources / Pod`              | Pod      | ハードウェアリソース使用率メトリクス | Podのハードウェアリソース使用率メトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) をPod単位で分析できる。個別のPodや特定のPodの状況を確認したい場合に役立つ。                                                    |          |
| `Kubernetes / Networking / Cluster`                 | Pod      | ネットワークの性能指標               | Podのネットワークの性能指標メトリクス (例：帯域幅、秒当たりパケット受信数) の合計を分析できる。Cluster全体のネットワークの分析に役立つ。                                                                                      | ★        |
| `Kubernetes / Networking / Namespace (Pods)`        | Pod      | ネットワークの性能指標               | Podのネットワーク性能指標メトリクスをNamespace単位で分析できる。複数のPod (削除されたPodも含む) のメトリクスを一括して確認したい場合に役立つ。                                                                                |          |
| `Kubernetes / Networking / Pod`                     | Pod      | ネットワークの性能指標               | Podのネットワーク性能指標メトリクスをPod単位で分析できる。Podを個別に確認したい場合に役立つ。                                                                                                                                 |          |

> - https://github.com/prometheus-community/helm-charts/blob/kube-prometheus-stack-48.4.0/charts/kube-prometheus-stack/templates/grafana/dashboards-1.14/k8s-resources-cluster.yaml#L23
> - https://github.com/prometheus-community/helm-charts/blob/kube-prometheus-stack-48.4.0/charts/kube-prometheus-stack/templates/grafana/dashboards-1.14/k8s-resources-namespace.yaml#L23
> - https://github.com/prometheus-community/helm-charts/blob/kube-prometheus-stack-48.4.0/charts/kube-prometheus-stack/templates/grafana/dashboards-1.14/k8s-resources-node.yaml#L23
> - https://github.com/prometheus-community/helm-charts/blob/kube-prometheus-stack-48.4.0/charts/kube-prometheus-stack/templates/grafana/dashboards-1.14/k8s-resources-pod.yaml#L23
> - https://github.com/prometheus-community/helm-charts/blob/kube-prometheus-stack-48.4.0/charts/kube-prometheus-stack/templates/grafana/dashboards-1.14/k8s-resources-workload.yaml#L23
> - https://github.com/prometheus-community/helm-charts/blob/kube-prometheus-stack-48.4.0/charts/kube-prometheus-stack/templates/grafana/dashboards-1.14/k8s-resources-workloads-namespace.yaml#L23

#### ▼ Workload

Nodeからデータポイントを収集する。

kubeletからデータポイントを収集できるようにしておく必要がある。

| ダッシュボード名                                         | 監視対象                | メトリクス                           | 説明                                                                                                                         | おすすめ |
| -------------------------------------------------------- | ----------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | -------- |
| `Kubernetes / Compute Resources / Namespace (Workloads)` | Deployment、StatefulSet | ハードウェアリソース使用率メトリクス | Podのハードウェアリソース使用率メトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) をNamespace単位で分析できる。 |          |
| `Kubernetes / Compute Resources / Workload`              | Deployment、StatefulSet | ハードウェアリソース使用率メトリクス | Podのハードウェアリソース使用率メトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) をWorkload 単位で分析できる。 |          |
| `Kubernetes / Networking / Namespace (Workload)`         | Deployment、StatefulSet | ネットワーク性能指標メトリクス       | Podのネットワーク性能指標メトリクスをNamespace単位で分析できる。                                                             |          |
| `Kubernetes / Networking / Workload`                     | Deployment、StatefulSet | ネットワーク性能指標メトリクス       | Podのネットワーク性能指標メトリクスをWorkload単位で分析できる。                                                              |          |

> - https://github.com/monitoring-mixins/website/tree/master/assets/kubernetes/dashboards

#### ▼ PerisisitentVolume

| ダッシュボード名                  | 監視対象           | 説明                                                      | おすすめ |
| --------------------------------- | ------------------ | --------------------------------------------------------- | -------- |
| `Kubernetes / Persistent Volumes` | PerisisitentVolume | Persistent Volumeの使用率に関するメトリクスを分析できる。 |          |

#### ▼ Node

Nodeからデータポイントを収集する。

node-exporterからデータポイントを収集できるようにしておく必要がある。

| ダッシュボード名                       | 監視対象 | メトリクス    | 説明                                                                                     | おすすめ |
| -------------------------------------- | -------- | ------------- | ---------------------------------------------------------------------------------------- | -------- |
| `Node Exporter / USE Method / Cluster` | Node     | USEメトリクス | NodeのUSEメトリクスの合計を分析できる。Cluster全体のハードウェアリソースの分析に役立つ。 | ★        |
| `Node Exporter / USE Method / Node`    | Node     | USEメトリクス | NodeのUSEメトリクスをNode単位で分析できる。                                              |          |
| `Node Exporter / Nodes`                | Node     | ハードウェア  | Nodeのハードウェアリソース使用率メトリクスをNode単位で分析できる。                       |          |

> - https://github.com/prometheus-community/helm-charts/blob/kube-prometheus-stack-48.4.0/charts/kube-prometheus-stack/templates/grafana/dashboards-1.14/node-cluster-rsrc-use.yaml#L23
> - https://github.com/prometheus-community/helm-charts/blob/kube-prometheus-stack-48.4.0/charts/kube-prometheus-stack/templates/grafana/dashboards-1.14/node-rsrc-use.yaml#L23

#### ▼ Prometheus

PrometheusのPodからデータポイントを収集する。

| ダッシュボード名            | 監視対象        | 説明 |
| --------------------------- | --------------- | ---- |
| `Prometheus / Remote Write` | PrometheusのPod |      |
| `Prometheus / Overview`     | PrometheusのPod |      |

> - https://github.com/monitoring-mixins/website/tree/master/assets/prometheus/dashboards

#### ▼ Istio

IstioのPodからデータポイントを収集する。

`istioctl dashboard grafana`コマンドでもインストールできる。

| ダッシュボード名                 | 監視対象                              | 説明                                                                      |
| -------------------------------- | ------------------------------------- | ------------------------------------------------------------------------- |
| `Istio Wasm Extension Dashboard` |                                       |                                                                           |
| `Istio Mesh Dashboard`           |                                       | HTTPとTCPのメトリクスを確認したい場合に役立つ。                           |
| `Istio Control Plane Dashboard`  | IstiodのPod                           |                                                                           |
| `Istio Performance Dashboard`    | IngressGateway、`istio-proxy`コンテナ |                                                                           |
| `Istio Workload Dashboard`       | Istioのカスタムリソース               |                                                                           |
| `Istio Service Dashboard`        | IstioのVirtualService                 | IngressGatewayの宛先のServiceに関するメトリクスを確認したい場合に役立つ。 |

> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-dashboard-grafana
> - https://github.com/istio/istio/blob/1.14.3/manifests/addons/dashboards
> - https://istio.io/latest/docs/tasks/observability/metrics/using-istio-dashboard/#viewing-the-istio-dashboard
> - https://istio.io/latest/docs/tasks/observability/metrics/using-istio-dashboard/#about-the-grafana-dashboards

<br>

## 03. セクション

### セクション一覧

> - https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/view-dashboard-json-model

<br>

### id

```yaml
{"id": null}
```

<br>

### uid

```yaml
{"uid": "cLV5GDCkz"}
```

<br>

### title

```yaml
{"title": "New dashboard"}
```

<br>

### tags

他の何らかのチャート (例：kube-prometheus-stack) を使用した場合に、ダッシュボードが作成されることがある。

これと区別できるように、本リポジトリのダッシュボードには`<リポジトリ名>.git`やリポジトリURLというタグをつけると良い。

```yaml
{"tags": ["<リポジトリ名>.git", "github.com/example"]}
```

<br>

### style

```yaml
{"style": "dark"}
```

<br>

### description

ダッシュボード名とそのバージョンを設定する。

コミュニティダッシュボードによってはバージョンの記載がないものがある。

```yaml
{"description": "Foo Dashboard version 1.0.0"}
```

<br>

### gnetId

コミュニティダッシュボードを使用している場合、ダッシュボードIDを設定する。

反対に、nullであればユーザー定義のダッシュボードである。

```yaml
{"gnetId": 1}
```

<br>

### timezone

```yaml
{"timezone": "browser"}
```

<br>

### editable

ダッシュボードをGUIから編集可能かを設定する。

```yaml
{"editable": false}
```

<br>

### graphTooltip

```yaml
{"graphTooltip": 1}
```

<br>

### panels

#### ▼ panelsとは

メトリクスをPromQLでクエリして表示するパネルを定義する。

一番最初にGUIでパネルを作成し、これのJSONを取得する方が実装しやすい。

> - https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/view-dashboard-json-model/#panels

#### ▼ expr

PromQLを定義する。

複数のラベルをOR条件で表示するようなパネルの場合、GrafanaがPromQL上にOR条件の正規表現を生成する。

そのため、`=~`演算子を使用するようにする。

ラベル変数を使用する場合は、`templating`セクションでその定義が必要である。

```yaml
{
  # panelsセクション
  "panels": [
      {
        # stylesセクション
        "styles": [
            {
              # 表の列名
              "alias": "Namespace",
              "colorMode": null,
              "colors": [],
              "dateFormat": "YYYY-MM-DD HH:mm:ss",
              "decimals": 2,
              "link": true,
              "linkTargetBlank": false,
              "linkTooltip": "Drill down to pods",
              # 他のダッシュボードへのリンク
              "linkUrl": "/d/*****/k8s-resources-namespace?var-datasource=$datasource&var-cluster=$cluster&var-namespace=$__cell",
              "pattern": "namespace",
              "thresholds": [],
              "type": "number",
              "unit": "short",
            },
            {
              # 表の列名
              "alias": "Workloads",
              "colorMode": null,
              "colors": [],
              "dateFormat": "YYYY-MM-DD HH:mm:ss",
              "decimals": 0,
              "link": true,
              "linkTargetBlank": false,
              "linkTooltip": "Drill down to workloads",
              # 他のダッシュボードへのリンク
              "linkUrl": "/d/*****/k8s-resources-workloads-namespace?var-datasource=$datasource&var-cluster=$cluster&var-namespace=$__cell_1",
              "pattern": "Value #B",
              "thresholds": [],
              "type": "number",
              "unit": "short",
            },
            {
              # 表の列名
              "alias": "Pods",
              "colorMode": null,
              "colors": [],
              "dateFormat": "YYYY-MM-DD HH:mm:ss",
              "decimals": 0,
              "link": true,
              "linkTargetBlank": false,
              "linkTooltip": "Drill down to pods",
              # 他のダッシュボードへのリンク
              "linkUrl": "/d/*****/k8s-resources-namespace?var-datasource=$datasource&var-cluster=$cluster&var-namespace=$__cell_1",
              "pattern": "Value #A",
              "thresholds": [],
              "type": "number",
              "unit": "short",
            },
          ],
        "targets":
          [
            {
              "expr": '<メトリクス名>{cluster="$cluster", namespace="$namespace", pod="$pod", instance=~"$instance"}',
            },
            {"expr": "..."},
            {"expr": "..."},
          ],
      },
    ],
}
```

#### type

パネルのタイプを設定する。

<br>

### time

```yaml
{"time": {"from": "now-6h", "to": "now"}}
```

<br>

### timepicker

ダッシュボードのデフォルトの時間間隔を設定する。

```yaml
{"timepicker": {"time_options": [], "refresh_intervals": []}}
```

<br>

### templating

#### ▼ templating

> - https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/view-dashboard-json-model/#templating

#### ▼ enable

templatingセクションを有効化する。

デフォルトで`true`である。

```yaml
{"templating": {"enable": true}}
```

#### ▼ list

PromQLのラベル変数に値を挿入し、メトリクスをフィルタリングできるように、プルダウンを定義する。

ラベル変数でフィルタリングする場合、指定したデータソースでクエリした時のメトリクスがそのラベルを持っている必要がある。

例えば、`kube_pod_info`メトリクスをラベル参照のために使用する場合、これがプルダウンのラベルを持っていなければならない。

加えて、ダッシュボード上のパネルのメトリクスもプルダウンのラベルでフィルタリングできるように、PromQLを定義する必要がある。

例えば、`cluster`ラベル値でフィルタリングする場合、パネル上のPromQLでも`<メトリクス>{cluster=\"$cluster\"}`と定義しなければならない。

```yaml
{
  # templatingセクション
  "templating": {
      # listセクション
      "list": [
          # データソース値のプルダウン
          {
            # デフォルトのフィルタリング値
            # プルダウンの値を変更すれば、current値も動的に変わる
            "current": {
                # 固定できるように true としておく
                "selected": true,
                # デフォルトのデータソースのフィルタリング値をPrometheusとする
                "text": "Prometheus",
                "value": "Prometheus",
              },
            "description": null,
            "error": null,
            # プルダウンを常に表示できるように 0 (false) とする
            "hide": 0,
            # multiオプションを無効化しているため、Allのチェックボックスは無効化する
            "includeAll": false,
            "label": null,
            "multi": false,
            # データソース名。変数名としても使用できるようになる。
            "name": "datasource",
            "options": [],
            # 最初のデータソースはPrometheusとする。
            "query": "prometheus",
            "refresh": 1,
            "regex": "",
            "skipUrlSync": false,
            # 変数タイプを設定する。
            "type": "datasource",
          },
          # clusterラベル値のプルダウン
          {
            "allValue": null,
            # プルダウンが選ばれていない時のデフォルト値を設定する
            "current": {
                # デフォルトのclusterラベルのフィルタリング値を null とする
                "isNone": true,
                # ラベルが選ばれない限り表示されないため、 false としておく
                "selected": false,
                "text": "None",
                "value": "",
              },
            # データソースの指定時に、それを変数として取得する
            "datasource": "$datasource",
            "definition": "",
            "description": null,
            "error": null,
            "hide": 0,
            # multiオプションを無効化しているため、Allのチェックボックスは無効化する
            "includeAll": false,
            "label": null,
            # clusterは1つだけ選ぶようにする
            "multi": false,
            # ラベル名。変数名としても使用できるようになる。
            "name": "cluster",
            "options": [],
            "query": {
                # メトリクスと、それから取得するラベルを設定する。
                # 指定したデータソースの時に、kube_pod_infoメトリクスがclusterラベルを持っている必要がある。
                "query": "label_values(kube_pod_info, cluster)",
                # query<小文字から始まる任意の識別子>で事前定義しておくこともできる。
                # queryを採用する場合、query以降の文字列は、"^[a-z][a-zA-Z0-9_]*$"の正規表現内の文字列にする必要がある。
                "refId": "Prometheus-cluster-Variable-Query",
              },
            "refresh": 2,
            # もし特定のlabel_valuesのみをフィルタリングする場合、正規表現を設定する。
            # ただ、label_values内で『=~』を使った方が良いかもしれない。
            "regex": "",
            "skipUrlSync": false,
            # アルファベットの昇順にする。
            "sort": 1,
            "tagValuesQuery": "",
            "tagsQuery": "",
            "type": "query",
            "useTags": false,
          },
          # namespaceラベル値のプルダウン
          {
            "allValue": null,
            # プルダウンが選ばれていない時のデフォルト値を設定する
            "current": {
                # デフォルトでは全てのラベル値を選択する
                # multiラベルの場合は、配列とする
                "selected": true,
                "text": ["All"],
                "value": ["$__all"],
              },
            # データソースの指定時に、それを変数として取得する
            "datasource": "$datasource",
            "definition": "",
            "description": null,
            "error": null,
            "hide": 0,
            # multiオプションを有効化しており、全てを選べるようにAllのチェックボックスも有効化する
            "includeAll": true,
            "label": null,
            # 全ての値の中から複数選択して選べるようにする。
            "multi": true,
            "name": "namespace",
            "options": [],
            "query": {
                # 指定したデータソースの時に、kube_pod_infoメトリクスが各種ラベルを持っている必要がある。
                "query": 'label_values(kube_pod_info{cluster=\"$cluster\"}, namespace)',
                "refId": "Prometheus-namespace-Variable-Query",
              },
            "refresh": 2,
            # もし特定のlabel_valuesのみをフィルタリングする場合、正規表現を設定する。
            # ただ、label_values内で『=~』を使った方が良いかもしれない。
            "regex": "",
            "skipUrlSync": false,
            "sort": 1,
            "tagValuesQuery": "",
            "tagsQuery": "",
            "type": "query",
            "useTags": false,
          },
          # podラベル値のプルダウン
          {
            "allValue": null,
            # プルダウンが選ばれていない時のデフォルト値を設定する
            "current": {
                # デフォルトでは全てのラベル値を選択する
                # multiラベルの場合は、配列とする
                "selected": true,
                "text": ["All"],
                "value": ["$__all"],
              },
            # データソースの指定時に、それを変数として取得する
            "datasource": "$datasource",
            "definition": "",
            "description": null,
            "error": null,
            "hide": 0,
            # multiオプションを有効化しており、全てを選べるようにAllのチェックボックスも有効化する
            "includeAll": true,
            "label": null,
            # 全ての値の中から複数のラベル値を選択して選べるようにする。
            "multi": true,
            "name": "pod",
            "options": [],
            "query": {
                # 指定したデータソースの時に、kube_pod_infoメトリクスが各種ラベルを持っている必要がある。
                "query": 'label_values(kube_pod_info{cluster=\"$cluster\", namespace=\"$namespace\"}, pod)',
                "refId": "Prometheus-pod-Variable-Query",
              },
            "refresh": 2,
            # もし特定のlabel_valuesのみをフィルタリングする場合、正規表現を設定する。
            # ただ、label_values内で『=~』を使った方が良いかもしれない。
            "regex": "",
            "skipUrlSync": false,
            "sort": 1,
            "tagValuesQuery": "",
            "tagsQuery": "",
            "type": "query",
            "useTags": false,
          },
          # label_eks_amazonaws_com_nodegroupラベル値のプルダウン
          {
            "allValue": null,
            "current": {},
            "datasource": "$datasource",
            # kube-state-metricsで、--metric-labels-allowlist=nodes=[*] を設定する
            "definition": "label_values(kube_node_labels, label_eks_amazonaws_com_nodegroup)",
            "hide": 0,
            # multiオプションを有効化しており、全てを選べるようにAllのチェックボックスも有効化する
            "includeAll": true,
            "label": null,
            # 全ての値の中から複数のラベル値を選択して選べるようにする。
            "multi": true,
            "name": "nodegroup",
            "options": [],
            "query": "label_values(kube_node_labels, label_eks_amazonaws_com_nodegroup)",
            "refresh": 1,
            "regex": "",
            "skipUrlSync": false,
            "sort": 0,
            "tagValuesQuery": "",
            "tags": [],
            "tagsQuery": "",
            "type": "query",
            "useTags": false,
          },
          # nodeラベル値のプルダウン
          {
            "allValue": null,
            # プルダウンが選ばれていない時のデフォルト値を設定する
            "current": {
                # デフォルトでは全てのラベルを表示する
                # multiラベルの場合は、配列とする
                "selected": true,
                "text": ["All"],
                "value": ["$__all"],
              },
            # データソースの指定時に、それを変数として取得する
            "datasource": "$datasource",
            "definition": "",
            "description": null,
            "error": null,
            "hide": 0,
            # multiオプションを有効化しており、全てを選べるようにAllのチェックボックスも有効化する
            "includeAll": true,
            "label": null,
            # 全ての値の中から複数のラベル値を選択して選べるようにする。
            "multi": true,
            "name": "namespace",
            "options": [],
            "query": {
                # 指定したデータソースの時に、kube_node_labelsメトリクスが各種ラベルを持っている必要がある。
                # label_eks_amazonaws_com_nodegroupラベルの値はプルダウンですでに取得しており、変数として使用する。
                "query": 'label_values(kube_node_labels{label_eks_amazonaws_com_nodegroup=\"$nodegroup\"}, node)',
                "refId": "Prometheus-node-Variable-Query",
              },
            "refresh": 2,
            # もし特定のlabel_valuesのみをフィルタリングする場合、正規表現を設定する。
            # ただ、label_values内で『=~』を使った方が良いかもしれない。
            "regex": "",
            "skipUrlSync": false,
            "sort": 1,
            "tagValuesQuery": "",
            "tagsQuery": "",
            "type": "query",
            "useTags": false,
          },
          # containerラベル値のプルダウン
          {
            "allValue": null,
            # プルダウンが選ばれていない時のデフォルト値を設定する
            "current": {
                # デフォルトでは全てのラベルを表示する
                # multiラベルの場合は、配列とする
                "selected": true,
                "text": ["All"],
                "value": ["$__all"],
              },
            # データソースの指定時に、それを変数として取得する
            "datasource": "$datasource",
            "definition": "",
            "description": null,
            "error": null,
            "hide": 0,
            # multiオプションを無効化しているため、Allのチェックボックスは無効化する
            "includeAll": false,
            "label": null,
            # 全ての値の中から複数のラベル値を選択して選べるようにする。
            "multi": true,
            "name": "container",
            "options": [],
            "query": {
                # 指定したデータソースの時に、kube_pod_infoメトリクスが各種ラベルを持っている必要がある。
                # nodeラベルの値はプルダウンですでに取得しており、変数として使用する。
                "query": 'label_values(kube_pod_container_info{cluster=\"$cluster\",instance=\"$node\",pod=\"$pod\"}, container)',
                "refId": "Prometheus-container-Variable-Query",
              },
            "refresh": 2,
            # もし特定のlabel_valuesのみをフィルタリングする場合、正規表現を設定する。
            # ただ、label_values内で『=~』を使った方が良いかもしれない。
            "regex": "",
            "skipUrlSync": false,
            "sort": 1,
            "tagValuesQuery": "",
            "tagsQuery": "",
            "type": "query",
            "useTags": false,
          },
        ],
    },
}
```

> - https://github.com/prometheus-operator/kube-prometheus/discussions/603?sort=top
> - https://stackoverflow.com/questions/64889312/is-there-a-way-to-get-the-cluster-name-of-kubernetes-in-grafana-variables-with-p
> - https://qiita.com/prodigy413/items/c0c2304e1bc28f644526

その上で`panel`セクションで`cluser`ラベルを定義すると、 メトリクスを`cluster`ラベルでフィルタリングできるようになる。

```yaml
{
  # panelsセクション
  "panels": [
    {
      "targets":
        [
          {
            "expr": "sum(rate(sidecar_injection_success_total{cluster=\"$cluster\"}[1m]))"
          }
        ]
    }
  ]
}
}
```

<br>

### annotations

```yaml
{"annotations": {"list": []}}
```

<br>

### refresh

自動更新間隔を設定する。

```yaml
{"refresh": "5s"}
```

<br>

### schemaVersion

```yaml
{"schemaVersion": 17}
```

<br>

### version

```yaml
{"version": 0}
```

<br>

### links

```yaml
{"links": []}
```

<br>
