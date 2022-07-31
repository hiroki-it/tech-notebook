---
title: 【IT技術の知見】マニフェストファイル＠Grafana
description: マニフェストファイル＠Grafanaの知見を記録しています。
---

# マニフェストファイル＠Grafana

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ

### チャートリポジトリから

#### ▼ grafanaチャートリポジトリから

最小構成をapplyする場合、grafanaチャートのみをリリースする。

ℹ️ 参考：https://github.com/grafana/helm-charts/tree/main/charts/grafana

```bash
$ helm install <リリース名> grafana/grafana
```

#### ▼ kube-prometheus-stackチャートリポジトリから

Prometheusと連携しやすくする場合は、helmチャートのkube-prometheus-stackチャートをリリースする。

ℹ️ 参考：https://recruit.gmo.jp/engineer/jisedai/blog/kube-prometheus-stack-investigation/

```bash
$ helm install <リリース名> prometheus-community/kube-prometheus-stack
```

<br>

### その他

#### ▼ ドキュメントから

Grafanaのドキュメントから```.yaml```ファイルをコピーし、```grafana.yaml```ファイルを作成する。これをapplyする。

ℹ️ 参考：https://grafana.com/docs/grafana/latest/installation/kubernetes/

```bash
$ kubectl apply -f grafana.yaml
```

<br>

## 02. Dashboard

### Dashboardとは

Grafanaのダッシュボードである。ConfigMapの```data```キーにダッシュボードのJSONを設定すると、ダッシュボードが自動的に作成される。

<br>

### セットアップ

#### ▼ grafanaチャートの場合

grafanaチャートでは、```values```ファイルの```label```キーや```labelValue```キーを使用して、ダッシュボードのマニフェストファイル化を制御しており、デフォルト値として```label```キーに```grafana_dashboard```が設定されている。これにより、```label```キーに```grafana_dashboard```キーを持つConfigMapのみがダッシュボードの設定として読み込まれる。

ℹ️ 参考：https://github.com/grafana/helm-charts/blob/main/charts/grafana/values.yaml

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
  data.json: |-
    # Grafanaのダッシュボードからエクスポートした.jsonファイルを貼り付ける。
```

#### ▼ kube-prometheus-stackチャートの場合

kube-prometheus-stackチャートでは、prometheusのチャートの他、grafanaチャートなどに依存している。kube-prometheus-stackチャートの```values```ファイルでは、```labelValue```に```1```が割り当てられている。

ℹ️ 参考：https://github.com/prometheus-community/helm-charts/blob/main/charts/kube-prometheus-stack/values.yaml

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

そのため、kube-prometheus-stackチャートを用いる場合は```grafana_dashboard```キーの値が```1```のConfigMapのみがダッシュボードの設定として読み込まれる。マニフェストファイルから作成したダッシュボードは、GUIからは削除できないようになっている。

ℹ️ 参考：https://rancher.com/docs/rancher/v2.6/en/monitoring-alerting/guides/persist-grafana/

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-grafana-dashboard
  labels:
    grafana_dashboard: "1"
data:
  data.json: |-
    # Grafanaのダッシュボードからエクスポートした.jsonファイルを貼り付ける。
```

ちなみに、kube-prometheus-stackチャート内にダッシュボードのConfigMapはすでに用意されており、これをインストールすると、いくつかのダッシュボードが作成される。

ℹ️ 参考：https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack/templates/grafana/dashboards-1.14

<br>
