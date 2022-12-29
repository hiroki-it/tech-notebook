---
title: 【IT技術の知見】リソース定義＠Prometheus
description: リソース定義＠Prometheusの知見を記録しています。
---

# リソース定義＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. セットアップ

### マニフェストとして

#### ▼ GitHubリポジトリから

GitHubリポジトリ上のマニフェストを送信し、リソースを作成する。

PrometheusOperatorの基になるKubernetesリソースが含まれている。



> ℹ️ 参考：https://github.com/prometheus-operator/prometheus-operator#kube-prometheus

```bash
$ git clone https://github.com/prometheus-operator/prometheus-operator.git
$ kubectl create -f bundle.yaml
```

<br>

### チャートとして

#### ▼ GitHubリポジトリから

GitHubリポジトリからkube-prometheus-stackチャートをインストールし、リソースを作成する。PrometheusOperatorの基になるKubernetesリソースが含まれている。

```bash
$ helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
$ helm repo update

$ helm install prometheus prometheus-community/kube-prometheus-stack -n prometheus -f values.yaml
```

> ℹ️ 参考：
>
> - https://github.com/prometheus-operator/prometheus-operator#helm-chart
> - https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack
> - https://recruit.gmo.jp/engineer/jisedai/blog/kube-prometheus-stack-investigation/
> - https://zaki-hmkc.hatenablog.com/entry/2020/10/16/003542

<br>

### 接続

#### ▼ Prometheus

```bash
$ kubectl port-forward svc/prometheus -n prometheus 9090:9090
```

#### ▼ Alertmanager

```bash
$ kubectl port-forward svc/alertmanager -n prometheus 9093:9093
```


<br>

## 02. Alertmanager

### Alertmanagerとは

Alertmanagerのセットアップ方法を決める。



<br>

## 03. AlertmanagerConfig

### AlertmanagerConfigとは

Alertmanagerのアラートグループや通知先ルールを決める。



<br>

## 04. PodMonitor

### PodMonitorとは

Podに対してPull型通信を送信し、これのデータポイントを収集する。



<br>

## 05. Probe

### Probeとは

Ingressや静的IPアドレスのメトリクスに対してPull型通信を送信し、これらのデータポイントを収集する。



<br>

## 06. Prometheus

### Prometheusとは

Prometheusのセットアップ方法を決める。



<br>

### spec.alerting

アラートの送信先を設定する。



```yaml
apiVersion: monitoring.coreos.com/v1
kind: Prometheus
metadata:
  name: pod-prometheus
  namespace: prometheus
  labels:
    app.kubernetes.io/app: foo
spec:
  alerting:
    alertmanagers:
      - apiVersion: v2
        name: foo-alertmanager
        namespace: prometheus
        pathPrefix: /
        port: web
```

<br>

### spec.image

prometheusコンテナのベースイメージを設定する。



```yaml
apiVersion: monitoring.coreos.com/v1
kind: Prometheus
metadata:
  name: pod-prometheus
  namespace: prometheus
  labels:
    app.kubernetes.io/app: foo
spec:
  image: 'quay.io/prometheus/prometheus:v1.0.0'
```

<br>

### spec.remoteWrite

リモート書き込み先を設定する。



```yaml
apiVersion: monitoring.coreos.com/v1
kind: Prometheus
metadata:
  name: pod-prometheus
  namespace: prometheus
  labels:
    app.kubernetes.io/app: foo
spec:
  remoteWrite:
    - name: victoria-metrics
      tlsConfig:
        insecureSkipVerify: true
      url: 'https://*.*.*.*:8248/api/v1/write'
```

<br>

### spec.storage

ローカルストレージを設定する。



```yaml
apiVersion: monitoring.coreos.com/v1
kind: Prometheus
metadata:
  name: pod-prometheus
  namespace: prometheus
  labels:
    app.kubernetes.io/app: foo
spec:
  storage:
    volumeClaimTemplate:
      spec:
        accessModes:
          - ReadWriteOnce
        resources:
          requests:
            storage: 200Gi
        storageClassName: gp2-encrypted
```

<br>

## 07. PrometheusRule

### PrometheusRuleとは

ルール（アラートルール、レコーディングルール）を設定する。PrometheusRuleの定義に応じて、prometheusコンテナの```/etc/prometheus/rules```ディレクトリ配下にルールの設定ファイルが配置される。独自アラートルールを自前で定義しても良いが、セットアップの簡単さやPrometheusのアップグレードへの追従しやすさの観点から、公開されたアラートルール（例：kubernetes-mixins）を使用した方が良い。

> ℹ️ 参考：
> 
> - https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/
> - https://monitoring.mixins.dev/

<br>


### 公開ルール

#### ▼ 公開ルールとは

独自ルールを自前で定義しても良いが、セットアップの簡単さやPrometheusのアップグレードへの追従しやすさの観点から、公開されたルール（例：kubernetes-mixins）を使用した方が良い。

> ℹ️ 参考：https://monitoring.mixins.dev

#### ▼ kubernetes-mixinsのPrometheusRule

> ℹ️ 参考：https://github.com/monitoring-mixins/website/tree/master/assets

<br>

### spec.groups

#### ▼ groupsとは

アラートグループを設定する。

アラートが多すぎる場合、アラートをグループ化し、通知頻度を調節すると良い。



> ℹ️ 参考：https://prometheus.io/docs/alerting/latest/alertmanager/#grouping

#### ▼ name

グループ名を設定する。



```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: pod-prometheus-rule
  namespace: prometheus
  labels:
    app.kubernetes.io/app: foo
spec:
  groups:
    - name: foo-pod-alert-prometheus-rule

  # グループは複数設定できる。
  # - name: 
  #   - foo
  #   - bar
```

#### ▼ rules（アラートルールの場合）

```alert```キーを宣言し、アラートルールを設定する。



> ℹ️ 参考：https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/

| 項目              | 説明                                                                                               |
|-------------------|--------------------------------------------------------------------------------------------------|
| ```alert```       | アラートルール名を設定する                                                                                   |
| ```annotations``` | アラートルールによるアラートの通知内容を設定する。```metadata.labels```キーや発火値（```$value```）を通知内容に変数で出力できる。 |
| ```expr```        | アラートルールで監視するメトリクスに関するPromQLを設定する。                                                             |
| ```for```         | アラートの通知のクールダウン期間を設定する。クールダウン期間中に発火したアラートは通知されない。                                      |
| ```labels```      | アラートの通知内容に付与するラベルを設定する                                                                     |

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
             summary: 【{{ {{"{{"}} $labels.app {{"}}"}} }}】Pod内のコンテナのCPU使用率の上昇しました。


             description: {{ {{"{{"}} $labels.source {{"}}"}} }}コンテナのCPU使用率が{{ {{"{{"}} $value {{"}}"}} }}になりました。
           # PromQL
           expr: ...
           # 受信したアラートの通知のクールダウン期間
           for: 1m
           # アラートの通知内容に付与するラベル
           labels:
             env: prd
             app: foo
             status: error
             source: gin
```

#### ▼ rules（レコーディングルールの場合）

```record```キーを宣言し、レコーディングルールを設定する。



> ℹ️ 参考：https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/

| 項目         | 説明                                      |
|--------------|-----------------------------------------|
| ```record``` | レコーディングルール名を設定する                       |
| ```expr```   | レコーディングルールで監視するメトリクスに関するPromQLを設定する。 |

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
         - record: foo-pod-cpu-record-prometheus-rule
           # PromQL
           expr: ...
```

<br>

## 08. ServiceMonitor

### ServiceMonitorとは

指定したServiceに対してPull型通信を送信し、これに紐づくリソースに関するメトリクスのデータポイントを収集する。



> ℹ️ 参考：
>
> - https://prometheus-operator.dev/docs/operator/design/#servicemonitor
> - https://www.ogis-ri.co.jp/otc/hiroba/technical/kubernetes_use/part5.html

![prometheus-operator_service-monitor](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/prometheus-operator_service-monitor.png)

<br>

### spec.endpoints

#### ▼ endpointsとは

収集の対象とするServiceで待ち受けるエンドポイントを設定する。



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



> ℹ️ 参考：https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/

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



> ℹ️ 参考：https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/

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



> ℹ️ 参考：https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/

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
...
```

<br>

### spec.selector

#### ▼ matchLabels

![prometheus-operator_service-monitor_match-labels](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/prometheus-operator_service-monitor_match-labels.png)

収集の対象とするServiceに付与された```metadata.labels```キーを設定する。



> ℹ️ 参考：
>
> - https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/
> - https://github.com/prometheus-operator/prometheus-operator/blob/main/Documentation/troubleshooting.md

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
        app.kubernetes.io/app: foo-service
```

```yaml
# 収集対象のService
apiVersion: v1
kind: Service
metadata:
  labels:
    app.kubernetes.io/managed-by: prometheus-operator
    app.kubernetes.io/app: foo-service
...
```

<br>

## 09. ThanosRuler

### ThanosRuler

リモートストレージとしてThanosを使用する場合、これをセットアップ方法を決める。



<br>
