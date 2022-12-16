---
title: 【IT技術の知見】リソース定義＠Grafana
description: リソース定義＠Grafanaの知見を記録しています。
---

# リソース定義＠Grafana

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. セットアップ

### チャートとして

#### ▼ GitHubリポジトリから

GitHubリポジトリからgrafanaチャートをインストールし、リソースを作成する。

> ℹ️ 参考：https://github.com/grafana/helm-charts/tree/main/charts/grafana

```bash
$ helm repo add grafana https://grafana.github.io/helm-charts
$ helm repo update

$ helm install grafana grafana/grafana -n grafana -f values.yaml
```

Prometheusのコンポーネントとしてインストールしたい場合は、GitHubから全部入りのkube-prometheus-stackチャートをインストールし、リソースを作成する。

> ℹ️ 参考：
>
> - https://github.com/prometheus-operator/prometheus-operator#helm-chart
> - https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack
> - https://recruit.gmo.jp/engineer/jisedai/blog/kube-prometheus-stack-investigation/

```bash
$ helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
$ helm repo update

$ helm install prometheus prometheus-community/kube-prometheus-stack -n prometheus -f values.yaml
```

<br>

### ドキュメントから

Grafanaのドキュメントから```.yaml```ファイルをコピーし、```grafana.yaml```ファイルを作成する。これを作成する。

> ℹ️ 参考：https://grafana.com/docs/grafana/latest/installation/kubernetes/

```bash
$ kubectl apply -f grafana.yaml
```

<br>

## 02. Dashboard

### Dashboardとは

Grafanaのダッシュボードである。ConfigMapの```data```キーにダッシュボードのJSONを設定すると、ダッシュボードが自動的に作成される。独自ダッシュボードを自前で定義しても良いが、セットアップの簡単さやPrometheusのアップグレードへの追従しやすさの観点から、公開されたダッシュボード（例：Mixins、Grafanaダッシュボードコミュニティ）のJSONをコピーした方が良い。

> ℹ️ 参考：
> 
> - https://monitoring.mixins.dev
> - https://grafana.com/grafana/dashboards/

<br>

### セットアップ

#### ▼ grafanaチャートの場合

grafanaチャートでは、```values```ファイルの```label```キーや```labelValue```キーを使用して、ダッシュボードのマニフェスト化を制御しており、デフォルト値として```label```キーに```grafana_dashboard```が設定されている。これにより、```label```キーに```grafana_dashboard```キーを持つConfigMapのみがダッシュボードの設定として読み込まれる。

> ℹ️ 参考：https://github.com/grafana/helm-charts/blob/main/charts/grafana/values.yaml

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
  data.json: |-
    # ダッシュボードを定義するか、公開されたダッシュボードを貼り付ける。
```

#### ▼ kube-prometheus-stackチャートの場合

kube-prometheus-stackチャートでは、prometheusのチャートの他、grafanaチャートなどに依存している。kube-prometheus-stackチャートの```values```ファイルでは、```labelValue```に```1```が割り当てられている。

> ℹ️ 参考：https://github.com/prometheus-community/helm-charts/blob/main/charts/kube-prometheus-stack/values.yaml

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

そのため、kube-prometheus-stackチャートを用いる場合は```grafana_dashboard```キーの値が```1```のConfigMapのみがダッシュボードの設定として読み込まれる。マニフェストから作成したダッシュボードは、GUIからは削除できないようになっている。

> ℹ️ 参考：https://rancher.com/docs/rancher/v2.6/en/monitoring-alerting/guides/persist-grafana/

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-grafana-dashboard
  labels:
    grafana_dashboard: "1"
data:
  data.json: |-
    # ダッシュボードを定義するか、公開されたダッシュボードを貼り付ける。
```

ちなみに、kube-prometheus-stackチャートではダッシュボードのConfigMapはすでに用意されており、またその他にMixinsも同時にインストールするようになっている。

> ℹ️ 参考：
> 
> - https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack/templates/grafana/dashboards-1.14
> - https://monitoring.mixins.dev

<br>

#### ▼ 接続

Grafanaのダッシュボードに接続できる。ユーザ名は```admin```、パスワードは```prom-operator```がデフォルト値である。

```bash
$ kubectl port-forward svc/grafana -n prometheus 8080:80
```

<br>
