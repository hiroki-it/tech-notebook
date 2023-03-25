---
title: 【IT技術の知見】リソース定義＠Grafana
description: リソース定義＠Grafanaの知見を記録しています。
---

# リソース定義＠Grafana

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### インストール

#### ▼ チャートとして

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://grafana.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

# Prometheusと連携するために、Prometheusと同じNamespaceにインストールする。
$ helm install <リリース名> <チャートリポジトリ名>/grafana -n prometheus --version <バージョンタグ>
```

> ↪️ 参考：https://github.com/grafana/helm-charts/tree/main/charts/grafana

Prometheusのコンポーネントとしてインストールしたい場合は、GitHubから全部入りのkube-prometheus-stackチャートをインストールし、リソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <リリース名> <チャートリポジトリ名>/kube-prometheus-stack -n prometheus --version <バージョンタグ>
```

> ↪️ 参考：
>
> - https://github.com/prometheus-operator/prometheus-operator#helm-chart
> - https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack
> - https://recruit.gmo.jp/engineer/jisedai/blog/kube-prometheus-stack-investigation/

<br>

### ドキュメントから

Grafanaのドキュメントから`.yaml`ファイルをコピーし、`grafana.yaml`ファイルを作成する。

これを作成する。

> ↪️ 参考：https://grafana.com/docs/grafana/latest/installation/kubernetes/

```bash
$ kubectl apply -f grafana.yaml
```

<br>

## 02. ダッシュボード

### ダッシュボードの公開

Nodeの外からPrometheusのダッシュボードをネットワークに公開する場合、Node外からPrometheusサーバーにインバウンド通信が届くようにする必要がある。

**＊実装例＊**

Ingressを作成する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  namespace: grafana
  name: foo-grafana-ingress
spec:
  ingressClassname: foo-ingress-class
  rules:
    # ドメインを割り当てる場合、Hostヘッダーの合致ルールが必要である。
    - host: foo.grafana.com
      http:
        paths:
          - backend:
              service:
                name: foo-grafana-service
                port:
                  number: 80
            path: /
            pathType: Prefix
```

IngressClassを作成する。

開発環境では、IngressClassとしてNginxを使用する。

本番環境では、クラウドプロバイダーのIngressClass (AWS ALB、GCP CLB) を使用する。

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: foo-ingress-class
spec:
  # AWSの場合、ingress.k8s.aws/alb
  controller: k8s.io/ingress-nginx
```

ClusterIP Serviceを作成する。

```yaml
apiVersion: v1
kind: Service
metadata:
  namespace: grafana
  name: foo-grafana-service
spec:
  clusterIP: *.*.*.*
  clusterIPs:
    - *.*.*.*
  internalTrafficPolicy: Cluster
  ipFamilies:
    - IPv4
  ipFamilyPolicy: SingleStack
  ports:
    - name: tcp-foo
      port: 80
      protocol: TCP
      targetPort: 3000
  selector:
    app.kubernetes.io/name: foo-grafana
  sessionAffinity: None
  type: ClusterIP
```

### 独自ダッシュボード

ConfigMapの`.data`キーにJSONを設定すると、ダッシュボードを作成できる。

> 参考：https://grafana.com/grafana/dashboards/

<br>

### 公開ダッシュボード

#### ▼ 公開ダッシュボードとは

独自ダッシュボードを自前で定義しても良いが、セットアップの簡単さやPrometheusのアップグレードへの追従しやすさの観点から、公開されたダッシュボード (例：kubernetes-mixins、Grafanaダッシュボードコミュニティ) を使用した方が良い。

その場合、GitHubなどで公開されているJSONを、ConfigMapの`.data`キーに貼り付ける。

> ↪️ 参考：
>
> - https://monitoring.mixins.dev
> - https://grafana.com/grafana/dashboards/

#### ▼ kubernetes-mixinsのGrafanaダッシュボード

| 種類                     | コンポーネント          | ダッシュボード名                                         | 説明                                                                                                                                                                                                                                |
| ------------------------ | ----------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alertmanager             | AlertmanagerのPod       | `Alertmanager / Overview`                                |                                                                                                                                                                                                                                     |
| CoreDNS                  | CoreDNSのPod            | `CoreDNS`                                                | CoreDNSのPodに対するリクエストに関するメトリクス (例：リクエスト数、レスポンスタイム) を取得する。                                                                                                                                  |
| Kubernetesコンポーネント | kube-apiserver          | `Kubernetes / API server`                                | kube-apiserverのSLI、エラーバジェット、ハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率) を取得する。                                                                                                      |
|                          | Cluster                 | `Kubernetes / Networking / Cluster`                      | Clusterのネットワークのパフォーマンス指標に関するメトリクス (例：帯域幅、秒当たりパケット受信数) を取得する。                                                                                                                       |
|                          | kube-controller-manager | `Kubernetes / Controller Manager`                        |                                                                                                                                                                                                                                     |
|                          | Cluster                 | `Kubernetes / Compute Resources / Cluster`               | Clusterのハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) を取得する。                                                                                                             |
|                          | Pod                     | `Kubernetes / Compute Resources / Namespace (Pods)`      | Namespace単位で、Podのハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) を取得する。同じNamespace複数のPod (削除されたPodも含む) のメトリクスを一括して確認したい場合に便利である。 |
|                          | Pod                     | `Kubernetes / Compute Resources / Node (Pods)`           | Node単位で、Podのハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) を取得する。同じNodeの複数のPod (削除されたPodも含む) のメトリクスを一括して確認したい場合に便利である。         |
|                          | Pod                     | `Kubernetes / Compute Resources / Pod`                   | 各Podのハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) を取得する。個別のPodや特定のPodの状況を確認したい場合に便利である。                                                       |
|                          | Pod                     | `Kubernetes / Compute Resources / Workload`              | ワークロード (例：Deployment) 単位で、Podのハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) を取得する。                                                                           |
|                          | Pod                     | `Kubernetes / Compute Resources / Namespace (Workloads)` | ワークロード (例：Deployment) 単位かつNamespace単位で、Podのハードウェアリソースの消費に関するメトリクス (例：CPU使用率、メモリ使用率、CPU空きサイズ率、など) を取得する。                                                          |
|                          | kubelet                 | `Kubernetes / Kubelet`                                   |                                                                                                                                                                                                                                     |
|                          | Pod                     | `Kubernetes / Networking / Namespace (Pods)`             | Namespace単位で、Podのネットワークに関するメトリクスを取得する。複数のPod (削除されたPodも含む) のメトリクスを一括して確認したい場合に便利である。                                                                                  |
|                          |                         | `Kubernetes / Networking / Namespace (Workload)`         | ワークロード (例：Deployment) 単位で、Podのネットワークに関するメトリクスを取得する。                                                                                                                                               |
|                          |                         | `Kubernetes / Persistent Volumes`                        | Persistent Volumeの使用率に関するメトリクスを取得する。                                                                                                                                                                             |
|                          |                         | `Kubernetes / Networking / Pod`                          | 各Podのネットワークに関するメトリクスを取得する。Podを個別に確認したい場合に便利である。                                                                                                                                            |
|                          | kube-proxy              | `Kubernetes / Proxy`                                     |                                                                                                                                                                                                                                     |
|                          | kube-scheduler          | `Kubernetes / Scheduler`                                 |                                                                                                                                                                                                                                     |
|                          |                         | `Kubernetes / Networking / Workload`                     |                                                                                                                                                                                                                                     |
| Node exporter            | Node exporterのPod      | `Node Exporter / USE Method / Cluster`                   |                                                                                                                                                                                                                                     |
|                          |                         | `Node Exporter / USE Method / Node`                      |                                                                                                                                                                                                                                     |
|                          |                         | `Node Exporter / Nodes`                                  |                                                                                                                                                                                                                                     |
| Prometheus               | PrometheusのPod         | `Prometheus / Remote Write`                              |                                                                                                                                                                                                                                     |
|                          |                         | `Prometheus / Overview`                                  |                                                                                                                                                                                                                                     |

> ↪️ 参考：https://github.com/monitoring-mixins/website/tree/master/assets

#### ▼ Istioダッシュボード

`istioctl dashboard grafana`コマンドでインストールできるダッシュボード。

| ダッシュボード名                 | 説明                                                                          |
| -------------------------------- | ----------------------------------------------------------------------------- |
| `Istio Wasm Extension Dashboard` |                                                                               |
| `Istio Mesh Dashboard`           | HTTPとTCPのメトリクスを確認したい場合に便利である。                           |
| `Istio Control Plane Dashboard`  |                                                                               |
| `Istio Performance Dashboard`    |                                                                               |
| `Istio Workload Dashboard`       |                                                                               |
| `Istio Service Dashboard`        | IngressGatewayの宛先のServiceに関するメトリクスを確認したい場合に便利である。 |
| `Istio Control Plane Dashboard`  |                                                                               |

> ↪️ 参考：
>
> - https://istio.io/latest/docs/reference/commands/istioctl/#istioctl-dashboard-grafana
> - https://github.com/istio/istio/tree/master/manifests/addons/dashboards
> - https://istio.io/latest/docs/tasks/observability/metrics/using-istio-dashboard/#viewing-the-istio-dashboard
> - https://istio.io/latest/docs/tasks/observability/metrics/using-istio-dashboard/#about-the-grafana-dashboards

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
  data.json: |
    # ダッシュボードを定義するか、公開されたダッシュボードを貼り付ける。
```

> ↪️ 参考：https://github.com/grafana/helm-charts/blob/main/charts/grafana/values.yaml

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

> ↪️ 参考：https://github.com/prometheus-community/helm-charts/blob/main/charts/kube-prometheus-stack/values.yaml

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
  data.json: |
    # ダッシュボードを定義するか、公開されたダッシュボードを貼り付ける。
```

> ↪️ 参考：https://rancher.com/docs/rancher/v2.6/en/monitoring-alerting/guides/persist-grafana/

補足として、kube-prometheus-stackチャートではダッシュボードのConfigMapはすでに用意されている。

またその他に、kubernetes-mixinsも同時にインストールするようになっている。

> ↪️ 参考：
>
> - https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack/templates/grafana/dashboards-1.14
> - https://monitoring.mixins.dev

#### ▼ 接続

Grafanaのダッシュボードに接続できる。

ユーザー名は`admin`、パスワードは`prom-operator`がデフォルト値である。

```bash
$ kubectl port-forward svc/grafana -n prometheus 8000:80
```

<br>
