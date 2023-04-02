---
title: 【IT技術の知見】リソース定義＠Prometheus
description: リソース定義＠Prometheusの知見を記録しています。
---

# リソース定義＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### インストール

#### ▼ 非チャートとして (prometheus-operator)

Node内で監視系ツール (Prometheus、Alertmanager、Node exporter、Grafana、など) をコンテナとして稼働させる場合、マニフェストリポジトリからマニフェストを送信し、Kubernetesリソースを作成する。

```bash
$ git clone https://github.com/prometheus-operator/prometheus-operator.git

$ kubectl create -f bundle.yaml
```

> ↪️ 参考：https://github.com/prometheus-operator/prometheus-operator#kube-prometheus

#### ▼ 非チャートとして (kube-prometheus)

Node内で監視系ツール (Prometheus、Alertmanager、Node exporter、Grafana、など) をコンテナとして稼働させる場合、マニフェストリポジトリからマニフェストを送信し、Kubernetesリソースを作成する。

```bash
$ git clone https://github.com/prometheus-operator/kube-prometheus.git

$ kubectl apply --server-side -f manifests/setup

$ kubectl wait --for condition=Established --all CustomResourceDefinition --namespace=monitoring

$ kubectl apply -f manifests/
```

> ↪️ 参考：https://github.com/prometheus-operator/kube-prometheus

#### ▼ チャートとして (kube-prometheus-stack)

Node内で監視系ツール (Prometheus、Alertmanager、Node exporter、Grafana、など) をコンテナとして稼働させる場合、チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <リリース名> <チャートリポジトリ名>/kube-prometheus-stack -n prometheus --version <バージョンタグ>
```

> ↪️ 参考：
>
> - https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack
> - https://recruit.gmo.jp/engineer/jisedai/blog/kube-prometheus-stack-investigation/
> - https://zaki-hmkc.hatenablog.com/entry/2020/10/16/003542

他のインストール方法と名前が似ていることに注意する。

> ↪️ 参考：
>
> - https://github.com/prometheus-operator/prometheus-operator#prometheus-operator-vs-kube-prometheus-vs-community-helm-chart
> - https://stackoverflow.com/questions/54422566/what-is-the-difference-between-the-core-os-projects-kube-prometheus-and-promethe

#### ▼ チャートとして (prometheus)

チャートとしてprometheusをインストールし、リソースを作成する。

kube-prometheus-stackとは異なり、最低限の関連ツール (Alertmanager、Node exporter、など) のKubernetesリソースも合わせて作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <リリース名> <チャートリポジトリ名>/prometheus -n prometheus --version <バージョンタグ>
```

> ↪️ 参考：https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus

<br>

## 01-02. ダッシュボード

### ネットワークに公開しない場合

#### ▼ Prometheusの場合

```bash
$ kubectl port-forward svc/prometheus -n prometheus 9090:9090
```

#### ▼ Alertmanagerの場合

```bash
$ kubectl port-forward svc/alertmanager -n prometheus 9093:9093
```

<br>

### ネットワークに公開する場合

#### ▼ Prometheusの場合

Nodeの外からPrometheusのダッシュボードをネットワークに公開する場合、Node外からPrometheusサーバーにインバウンド通信が届くようにする必要がある。

**＊実装例＊**

Ingressを作成する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  namespace: prometheus
  name: foo-prometheus-ingress
spec:
  ingressClassname: foo-ingress-class
  rules:
    # ドメインを割り当てる場合、Hostヘッダーの合致ルールが必要である。
    - host: foo.prometheus.com
      http:
        paths:
          - backend:
              service:
                name: foo-prometheus-service
                port:
                  number: 9090
            path: /
            pathType: Prefix
```

IngressClassを作成する。

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
  namespace: prometheus
  name: foo-prometheus-service
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
      port: 9090
      protocol: TCP
      targetPort: 9090
  selector:
    app.kubernetes.io/name: foo-prometheus
  sessionAffinity: None
  type: ClusterIP
```

#### ▼ Alertmanagerの場合

Nodeの外からAlertmanagerのダッシュボードをネットワークに公開する場合、Node外からAlertmanagerにインバウンド通信が届くようにする必要がある。

**＊実装例＊**

Ingressを作成する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  namespace: prometheus
  name: foo-alertmanager-ingress
spec:
  ingressClassname: foo-ingress-class
  rules:
    # ドメインを割り当てる場合、Hostヘッダーの合致ルールが必要である。
    - host: foo.alertmanager.com
      http:
        paths:
          - backend:
              service:
                name: foo-alertmanager-service
                port:
                  number: 9093
            path: /
            pathType: Prefix
```

IngressClassを作成する。

開発環境では、IngressClassとしてNginxを使用する。

本番環境では、クラウドプロバイダーのIngressClass (AWS ALB、Google CLB) を使用する。

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
  namespace: prometheus
  name: foo-alertmanager-service
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
      port: 9093
      protocol: TCP
      targetPort: 9093
  selector:
    app.kubernetes.io/name: foo-alertmanager
  sessionAffinity: None
  type: ClusterIP
```

<br>

## 02. Alertmanager

### Alertmanagerとは

Alertmanagerのセットアップ方法を決める。

> ↪️ 参考：https://prometheus-operator.dev/docs/operator/api/#monitoring.coreos.com/v1.Alertmanager

### .spec.version

Alertmanagerのコンテナイメージのバージョンを設定する。

使用するコンテナイメージは、`.spec.baseImage`キーに設定する。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: Alertmanager
metadata:
  name: foo-alertmanager
  namespace: prometheus
  labels:
    app.kubernetes.io/app: foo
spec:
  version: v1.0.0
```

<br>

### .spec.serviceAccountName

AlertmanagerのPodに紐づけるServiceAccountの名前を設定する。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: Alertmanager
metadata:
  name: foo-alertmanager
  namespace: prometheus
  labels:
    app.kubernetes.io/app: foo
spec:
  serviceAccountName: foo-serviceaccount
```

<br>

### .spec.baseImage

Alertmanagerのコンテナイメージを設定する。

コンテナイメージのバージョンは、`.spec.version`キーに設定する。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: Alertmanager
metadata:
  name: foo-alertmanager
  namespace: prometheus
  labels:
    app.kubernetes.io/app: foo
spec:
  baseImage: quay.io/prometheus/alertmanager
```

<br>

### .spec.externalUrl

AlertmanagerのURLを設定する。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: Alertmanager
metadata:
  name: foo-alertmanager
  namespace: prometheus
  labels:
    app.kubernetes.io/app: foo
spec:
  externalUrl: https://example.com
```

<br>

### .spec.replicas

AlertmanagerのPodの冗長化数を設定する。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: Alertmanager
metadata:
  name: foo-alertmanager
  namespace: prometheus
  labels:
    app.kubernetes.io/app: foo
spec:
  replicas: 2
```

<br>

### .spec.logLevel

Alertmanagerのログレベルを設定する。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: Alertmanager
metadata:
  name: foo-alertmanager
  namespace: prometheus
  labels:
    app.kubernetes.io/app: foo
spec:
  logLevel: warn
```

<br>

### .spec.resources

Alertmanagerのハードウェアリソースの要求量を設定する。

> ↪️ 参考：https://prometheus-operator.dev/docs/operator/api/#monitoring.coreos.com/v1.StorageSpec

```yaml
apiVersion: monitoring.coreos.com/v1
kind: Alertmanager
metadata:
  name: foo-alertmanager
  namespace: prometheus
  labels:
    app.kubernetes.io/app: foo
spec:
  storage:
    volumeClaimTemplate:
      spec:
        selector:
          matchLabels:
            app: foo-app
        storageClassName: gp2-encrypted
        accessModes:
          - "ReadWriteOnce"
        resources:
          limits:
            cpu: "1"
            memory: 1Gi
          requests:
            cpu: 50m
            memory: 400Mi
```

<br>

## 03. AlertmanagerConfig

### AlertmanagerConfigとは

Alertmanagerのアラートグループや通知先ルールを決める。

<br>

## 04. PodMonitor

### PodMonitorとは

Podに対してPull型通信を送信し、これのデータポイントを収集する。

Serviceを持つPodではServiceMonitorを使用し、これを持たないPodをPodMonitorで監視する。

<br>

## 05. Probe

### Probeとは

Ingressや静的IPアドレスのメトリクスに対してPull型通信を送信し、これらのデータポイントを収集する。

<br>

## 06. Prometheus

### Prometheusとは

Prometheusのセットアップ方法を決める。

<br>

### .spec.alerting

アラートの宛先を設定する。

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

### .spec.image

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
  image: "quay.io/prometheus/prometheus:v1.0.0"
```

<br>

### .spec.retention

Prometheusのローカルストレージの保持期間を設定する。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: Prometheus
metadata:
  name: pod-prometheus
  namespace: prometheus
  labels:
    app.kubernetes.io/app: foo
spec:
  retention: 31d
```

> ↪️ 参考：https://github.com/prometheus-operator/prometheus-operator/issues/2666#issuecomment-510465282

<br>

### .spec.remoteWrite

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
      url: "https://*.*.*.*:8248/api/v1/write"
```

<br>

### .spec.storage

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

ルール (アラートルール、レコーディングルール) を設定する。

PrometheusRuleの定義に応じて、prometheusコンテナの`/etc/prometheus/rules`ディレクトリ配下にルールの設定ファイルが配置される。

独自アラートルールを自前で定義しても良いが、セットアップの簡単さやPrometheusのアップグレードへの追従しやすさの観点から、公開されたアラートルール (例：kubernetes-mixins) を使用した方が良い。

> ↪️ 参考：
>
> - https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/
> - https://monitoring.mixins.dev/

<br>

### 公開ルール

#### ▼ 公開ルールとは

独自ルールを自前で定義しても良いが、セットアップの簡単さやPrometheusのアップグレードへの追従しやすさの観点から、公開されたルール (例：kubernetes-mixins) を使用した方が良い。

> ↪️ 参考：https://monitoring.mixins.dev

#### ▼ kubernetes-mixinsのPrometheusRule

> ↪️ 参考：https://github.com/monitoring-mixins/website/tree/master/assets

<br>

### アラート内で使用できる予約変数

| 変数名            | データ型 | デフォルトラベル例                                                                | 説明                                                                                                                                                                                                     |
| ----------------- | -------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Receiver          | string型 | `.Receiver`                                                                       | アラートの受信者が割り当てられている。                                                                                                                                                                   |
| Status            | string型 | `.Status`                                                                         | アラートがFiring状態/Resolved状態が割り当てられている。                                                                                                                                                  |
| Alerts            | map型    | `.Alerts.Labels.SortedPairs`                                                      | アラートの情報が割り当てられている。<br>↪️ 参考：https://prometheus.io/docs/alerting/latest/notifications/#alert                                                                                         |
| GroupLabels       | map型    | ・`.GroupLabels.alertname` <br>・`.GroupLabels.instance` <br>・`.GroupLabels.job` | 特定のアラートグループに関するラベルが割り当てられている。`.spec.groups[].rules[].labels`キー配下で設定した独自のラベルも含む。<br>↪️ 参考：https://prometheus.io/docs/alerting/latest/notifications/#kv |
| CommonLabels      | map型    | `.CommonLabels.alertname`                                                         | 全てのアラートに共通するラベルが割り当てられている。                                                                                                                                                     |
| CommonAnnotations | map型    | `.CommonAnnotations.summary`                                                      | 全てのアラートに共通するアノテーションが割り当てられている。`.spec.groups[].rules[].labels`キー配下で設定した独自のアノテーションも含む。                                                                |
| ExternalURL       | string型 | `.ExternalURL`                                                                    | AlertmangerのURLが割り当てられている。                                                                                                                                                                   |

> ↪️ 参考：
>
> - https://www.amazon.co.jp/dp/4910313001
> - https://prometheus.io/docs/alerting/latest/notifications/
> - https://grafana.com/blog/2020/02/25/step-by-step-guide-to-setting-up-prometheus-alertmanager-with-slack-pagerduty-and-gmail/

<br>

### .spec.groups

#### ▼ groupsとは

アラートグループを設定する。

アラートが多すぎる場合、アラートをグループ化し、通知頻度を調節すると良い。

> ↪️ 参考：https://prometheus.io/docs/alerting/latest/alertmanager/#grouping

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

#### ▼ rules (アラートルールの場合)

`alert`キーを宣言し、アラートルールを設定する。

| 項目          | 説明                                                                                                                       |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `alert`       | アラートルール名を設定する                                                                                                 |
| `annotations` | アラートルールによるアラートの通知内容を設定する。`.metadata.labels`キーや発火値 (`$value`) を通知内容に変数で出力できる。 |
| `expr`        | アラートルールで監視するメトリクスに関するPromQLを設定する。ロジックを変更すればアラートの発火をテストできる。             |
| `for`         | アラートの通知のクールダウン期間を設定する。クールダウン期間中に発火したアラートは通知されない。                           |
| `labels`      | アラートの通知内容に付与するラベルを設定する                                                                               |

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

> ↪️ 参考：https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/

#### ▼ rules (レコーディングルールの場合)

`record`キーを宣言し、レコーディングルールを設定する。

| 項目     | 説明                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| `record` | レコーディングルール名を設定する                                                                                     |
| `expr`   | レコーディングルールで監視するメトリクスに関するPromQLを設定する。ロジックを変更すればアラートの発火をテストできる。 |

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

> ↪️ 参考：https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/

<br>

## 08. ServiceMonitor

### ServiceMonitorとは

指定したServiceに対してPull型通信を送信し、これに紐づくPodのメトリクスのデータポイントを収集する。

Prometheusは、Podから直接的にデータポイントを収集できるが、この時PodのIPアドレスは動的に変化してしまう。

そのため、基本的にはServiceMonitorを使用し、Podを動的に検出できるようにする。

![prometheus-operator_service-monitor](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/prometheus-operator_service-monitor.png)

> ↪️ 参考：
>
> - https://prometheus-operator.dev/docs/operator/design/#servicemonitor
> - https://www.ogis-ri.co.jp/otc/hiroba/technical/kubernetes_use/part5.html

<br>

### .spec.endpoints

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

> ↪️ 参考：https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/

#### ▼ port

Serviceの待ち受けるポート名を設定する。

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

> ↪️ 参考：https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/

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

### .spec.namespaceSelector

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
```

> ↪️ 参考：https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/

<br>

### .spec.selector

#### ▼ matchLabels

![prometheus-operator_service-monitor_match-labels](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/prometheus-operator_service-monitor_match-labels.png)

収集の対象とするServiceに付与された`.metadata.labels`キーを設定する。

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
```

> ↪️ 参考：
>
> - https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/
> - https://github.com/prometheus-operator/prometheus-operator/blob/main/Documentation/troubleshooting.md

<br>

## 09. ThanosRuler

### ThanosRuler

リモートストレージとしてThanosを使用する場合、これをセットアップ方法を決める。

<br>
