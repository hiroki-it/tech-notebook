---
title: 【IT技術の知見】リソース定義＠Prometheus
description: リソース定義＠Prometheusの知見を記録しています。
---

# リソース定義＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### インストール

#### ▼ 非チャートとして (prometheus-operator)

Node内で監視系ツール (Prometheus、Alertmanager、Node exporter、Grafana、など) をコンテナとして稼働させる場合、マニフェストリポジトリからマニフェストを送信し、Kubernetesリソースを作成する。

```bash
$ git clone https://github.com/prometheus-operator/prometheus-operator.git

$ kubectl create -f bundle.yaml
```

> - https://github.com/prometheus-operator/prometheus-operator#kube-prometheus

#### ▼ 非チャートとして (kube-prometheus)

Node内で監視系ツール (Prometheus、Alertmanager、Node exporter、Grafana、など) をコンテナとして稼働させる場合、マニフェストリポジトリからマニフェストを送信し、Kubernetesリソースを作成する。

```bash
$ git clone https://github.com/prometheus-operator/kube-prometheus.git

$ kubectl apply --server-side -f manifests/setup

$ kubectl wait --for condition=Established --all CustomResourceDefinition --namespace=monitoring

$ kubectl apply -f manifests/
```

> - https://github.com/prometheus-operator/kube-prometheus

#### ▼ チャートとして (kube-prometheus-stack)

Node内で監視系ツール (Prometheus、Alertmanager、Node exporter、Grafana、など) をコンテナとして稼働させる場合、チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <Helmリリース名> <チャートリポジトリ名>/kube-prometheus-stack -n prometheus --version <バージョンタグ>
```

> - https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack
> - https://recruit.gmo.jp/engineer/jisedai/blog/kube-prometheus-stack-investigation/
> - https://zaki-hmkc.hatenablog.com/entry/2020/10/16/003542

他のインストール方法と名前が似ていることに注意する。

> - https://github.com/prometheus-operator/prometheus-operator#prometheus-operator-vs-kube-prometheus-vs-community-helm-chart
> - https://stackoverflow.com/questions/54422566/what-is-the-difference-between-the-core-os-projects-kube-prometheus-and-promethe

#### ▼ チャートとして (prometheus)

チャートとしてPrometheusをインストールし、リソースを作成する。

kube-prometheus-stackとは異なり、最低限の関連ツール (Alertmanager、Node exporter、など) のKubernetesリソースも合わせて作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <Helmリリース名> <チャートリポジトリ名>/prometheus -n prometheus --version <バージョンタグ>
```

> - https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus

#### ▼ バイナリとして

バイナリとして監視系ツール (Prometheus、Alertmanager、など) をインストールし、サーバー上でPrometheusを稼働させる。

```bash
$ /opt/prometheus/prometheus \
    --config.file=/opt/prometheus/prometheus.yml \
    --web.console.templates=/opt/prometheus/consoles \
    --web.console.libraries=/opt/prometheus/console_libraries \
    --web.external-url="https://prometheus.example.com/" \
    --web.route-prefix=/ \
    --storage.tsdb.retention.time=3d \
    --storage.tsdb.path=/var/lib/prometheus
```

Alertmanagerをクラスター化する場合、インスタンス間で相互TLS認証を実施できるように、

```bash
$ /opt/alertmanager/alertmanager \
    --config.file=/opt/alertmanager/alertmanager.yml \
    --web.listen-address=:9093 \
    --web.external-url="https://alertmanager.example.com/" \
    --web.route-prefix=/ \
    --log.format=json \
    --data.retention=120h \
    --storage.path=/var/lib/alertmanager \
    --cluster.listen-address=0.0.0.0:9094 \
    --cluster.peer=<サーバーのIPアドレス>:9094 \
    --cluster.reconnect-timeout=5m
```

> - https://qiita.com/nis_nagaid_1984/items/81f4b3575ee5ce1fe892

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

> - https://prometheus-operator.dev/docs/operator/api/#monitoring.coreos.com/v1.Alertmanager

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
    app.kubernetes.io/name: foo
spec:
  version: v1.0.0
```

<br>

### .spec.serviceAccountName

AlertmanagerのPodに紐付けるServiceAccountの名前を設定する。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: Alertmanager
metadata:
  name: foo-alertmanager
  namespace: prometheus
  labels:
    app.kubernetes.io/name: foo
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
    app.kubernetes.io/name: foo
spec:
  baseImage: quay.io/prometheus/alertmanager
```

<br>

### .spec.externalUrl

AlertmanagerのダッシュボードのURLを設定する。

注意点として、IngressのHostヘッダールールで、ダッシュボードのドメインを許可する必要がある。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: Alertmanager
metadata:
  name: foo-alertmanager
  namespace: prometheus
  labels:
    app.kubernetes.io/name: foo
spec:
  externalUrl: https://alertmanager.example.com
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
    app.kubernetes.io/name: foo
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
    app.kubernetes.io/name: foo
spec:
  logLevel: warn
```

<br>

### .spec.resources

Alertmanagerのハードウェアリソースの要求量を設定する。

> - https://prometheus-operator.dev/docs/operator/api/#monitoring.coreos.com/v1.StorageSpec

```yaml
apiVersion: monitoring.coreos.com/v1
kind: Alertmanager
metadata:
  name: foo-alertmanager
  namespace: prometheus
  labels:
    app.kubernetes.io/name: foo
spec:
  storage:
    volumeClaimTemplate:
      spec:
        selector:
          matchLabels:
            app: foo-app
        storageClassName: standard
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

### .spec.namespaceSelector

PodMonitorを有効化する時の任意の`metadata.labels`キー設定する。

Prometheusは、`metadata.labels`キー有効化したNamespace内のPodを監視する。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PodMonitor
metadata:
  name: foo-pod-monitor
spec:
  namespaceSelector:
    # 任意のmetadata.labelsキーを設定する。
    prometheus-pod-monitor: enabled
```

```yaml
apiVersion: v1
kind: Namespace
metadata:
  labels:
    # PodMonitorを有効化したいNamespaceに付与する
    prometheus-pod-monitor: enabled
  name: foo-namespace
```

> - https://prometheus-operator.dev/docs/operator/design/#podmonitor

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
    app.kubernetes.io/name: foo
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

### .spec.externalUrl

PrometheusのダッシュボードのURLを設定する。

注意点として、IngressのHostヘッダールールで、ダッシュボードのドメインを許可する必要がある。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: Prometheus
metadata:
  name: pod-prometheus
  namespace: prometheus
  labels:
    app.kubernetes.io/name: foo
spec:
  externalUrl: https://prometheus.example.com
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
    app.kubernetes.io/name: foo
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
    app.kubernetes.io/name: foo
spec:
  retention: 14d
```

> - https://github.com/prometheus-operator/prometheus-operator/issues/2666#issuecomment-510465282

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
    app.kubernetes.io/name: foo
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
    app.kubernetes.io/name: foo
spec:
  storage:
    volumeClaimTemplate:
      spec:
        accessModes:
          - ReadWriteOnce
        resources:
          requests:
            storage: 200Gi
        storageClassName: standard
```

<br>

## 07. PrometheusRule

### PrometheusRuleとは

ルール (アラートルール、レコーディングルール) を設定する。

PrometheusRuleの定義に応じて、prometheusコンテナの`/etc/prometheus/rules`ディレクトリ配下にルールの設定ファイルが配置される。

有効になっているPrometheusRuleは、Prometheusダッシュボードの Status > Rule タブで確認できる。

> - https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/

<br>

### ルールの種類

#### ▼ アラートルール

アラートの条件とするために、メトリクスを一時的に分析する。

#### ▼ レコーディングルール

メトリクスを分析し、分析結果を名前をつけて保管しておく。

保管したメトリクスは、レコーディング名を使用して、Prometheusのダッシュボードで新しいメトリクスのように取得できる。

```yaml
# 分析結果をnode_namespace_pod_container:container_cpu_usage_seconds_total:sum_irateというレコーディング名で保管しておく
expr: |
  sum by (cluster, namespace, pod, container) (
    irate(container_cpu_usage_seconds_total{job="cadvisor", image!=""}[5m])
  ) * on (cluster, namespace, pod) group_left(node) topk by (cluster, namespace, pod) (
    1, max by(cluster, namespace, pod, node) (kube_pod_info{node!=""})
  )
record: node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate
```

> - https://monitoring.mixins.dev/kubernetes/#k8srules

<br>

### 公開ルールレシピ

#### ▼ 公開ルールレシピとは

独自ルールを自前で定義しても良いが、セットアップの簡単さやPrometheusのアップグレードへの追従しやすさの観点から、公開されたルール (例：kubernetes-mixins) を使用した方が良い。

> - https://monitoring.mixins.dev

#### ▼ kubernetes-mixinsのPrometheusRule

kubernetes-mixinsでは、アラートルールとレコーディングルールのレシピが公開されている。

kubernetes-mixinsはGrafanaダッシュボードも公開しており、kubernetes-mixinsのレコーディングルールが定義済みであることが前提になっている。

> - https://github.com/monitoring-mixins/website/tree/master/assets
> - https://monitoring.mixins.dev

<br>

### アラート内で使用できる予約変数

| 変数名            | データ型 | デフォルトラベル例                                                                | 説明                                                                                                                                                                                                      |
| ----------------- | -------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Receiver          | string型 | `.Receiver`                                                                       | アラートの受信者が割り当てられている。                                                                                                                                                                    |
| Status            | string型 | `.Status`                                                                         | アラートがFiring状態/Resolved状態が割り当てられている。                                                                                                                                                   |
| Alerts            | map型    | `.Alerts.Labels.SortedPairs`                                                      | アラートの情報が割り当てられている。<br>- https://prometheus.io/docs/alerting/latest/notifications/#alert                                                                                                 |
| GroupLabels       | map型    | ・`.GroupLabels.alertname` <br>・`.GroupLabels.instance` <br>・`.GroupLabels.job` | 特定のアラートグループに関するラベルが割り当てられている。`.spec.groups[].rules[].labels`キー配下で設定したユーザー定義のラベルも含む。<br>- https://prometheus.io/docs/alerting/latest/notifications/#kv |
| CommonLabels      | map型    | `.CommonLabels.alertname`                                                         | 全てのアラートに共通するラベルが割り当てられている。                                                                                                                                                      |
| CommonAnnotations | map型    | `.CommonAnnotations.summary`                                                      | 全てのアラートに共通するアノテーションが割り当てられている。`.spec.groups[].rules[].labels`キー配下で設定したユーザー定義のアノテーションも含む。                                                         |
| ExternalURL       | string型 | `.ExternalURL`                                                                    | AlertmangerのURLが割り当てられている。                                                                                                                                                                    |

> - https://www.amazon.co.jp/dp/4910313001
> - https://prometheus.io/docs/alerting/latest/notifications/
> - https://grafana.com/blog/2020/02/25/step-by-step-guide-to-setting-up-prometheus-alertmanager-with-slack-pagerduty-and-gmail/

<br>

### .spec.groups

#### ▼ groupsとは

アラートグループを設定する。

アラートが多すぎる場合、アラートをグループ化し、通知頻度を調節すると良い。

> - https://prometheus.io/docs/alerting/latest/alertmanager/#grouping

#### ▼ name

ルールのグループ名を設定する。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: foo
  namespace: prometheus
  labels:
    app.kubernetes.io/name: foo
spec:
  groups:
    - name: foo-rules

  # グループは複数設定できる。
  # - name:
  #   - foo
  #   - bar
```

#### ▼ rules (アラートルールの場合)

`alert`キーを宣言し、アラートルールを設定する。

アラートルールは、『アッパーキャメルケース』で命名する。

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
  name: foo-prometheus-rule
  namespace: prometheus
  labels:
    app.kubernetes.io/name: foo
spec:
  groups:
     - name: foo-alert-rules
       rules:
         # アッパーキャメルケース
         - alert: FooPodCpuUtilization
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
             severity: error
             source: gin
```

> - https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/

#### ▼ rules (レコーディングルールの場合)

`record`キーを宣言し、レコーディングルールを設定する。

アラートルールは、『スネークケース』『コロン区切り』で命名する。

| 項目     | 説明                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| `record` | レコーディングルール名を設定する                                                                                     |
| `expr`   | レコーディングルールで監視するメトリクスに関するPromQLを設定する。ロジックを変更すればアラートの発火をテストできる。 |

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: foo-prometheus-rule
  namespace: prometheus
  labels:
    app.kubernetes.io/name: foo
spec:
  groups:
    - name: foo-recording-rules
      rules:
        - record: node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate
          # PromQL
          expr: ...
```

> - https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/

<br>

## 08. ServiceMonitor

### ServiceMonitorとは

指定したServiceに対してPull型通信を送信し、これに紐づくPodのメトリクスのデータポイントを収集する。

有効になっているServiceMonitorは、Prometheusダッシュボードの Status > ServiceDiscoveryタブや、Status > Targets タブで確認できる。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: foo-service-monitor
  namespace: prometheus
spec:
  endpoints:
    - port: http-foo
      path: /metrics
  namespaceSelector:
    any: true
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-servive
```

公開しないPodであるとServiceがないため、メトリクス収集用のServiceを作成することになる。

Prometheusは、Podから直接的にデータポイントを収集できるが、この時PodのIPアドレスは動的に変化してしまう。

そのため、Podからメトリクスを収集する場合は、基本的にはServiceMonitorでServiceを介してPodを動的に検出できるようにする。

注意点として、アプリケーションのPodだけでなく、Kubernetesコンポーネント (例：kube-apiserver、kubeletに内蔵されたcAdvisor、など) やPrometheusのコンポーネント (node-exporterやkube-state-metricsといったExporterなど) のPodも動的に検出する必要があるため、同様にServiceMonitorが必要である。

![prometheus-operator_service-monitor](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/prometheus-operator_service-monitor.png)

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: foo-service-monitor
  namespace: prometheus
spec:
  endpoints:
    - bearerTokenFile: /var/run/secrets/kubernetes.io/serviceaccount/token
      port: https
      scheme: https
      metricRelabelings:
        - action: drop
          regex: apiserver_request_duration_seconds_bucket;(0.15|0.2|0.3|0.35|0.4|0.45|0.6|0.7|0.8|0.9|1.25|1.5|1.75|2|3|3.5|4|4.5|6|7|8|9|15|25|40|50)
          sourceLabels:
            - __name__
            - le
      tlsConfig:
        caFile: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        serverName: kubernetes
        insecureSkipVerify: false
  jobLabel: component
  namespaceSelector:
    matchNames:
      - default
  selector:
    matchLabels:
      component: apiserver
      provider: kubernetes
```

```yaml
# kube-apiserverに転送するService
# デフォルトで作成されている
apiVersion: v1
kind: Service
metadata:
  name: kubernetes
  namespace: default
spec:
  clusterIP: *.*.*.*
  clusterIPs:
    - *.*.*.*
  internalTrafficPolicy: Cluster
  ipFamilies:
    - IPv4
  ipFamilyPolicy: SingleStack
  ports:
    - name: https
      port: 443
      protocol: TCP
      targetPort: 443
  sessionAffinity: None
  type: ClusterIP
```

> - https://prometheus-operator.dev/docs/operator/design/#servicemonitor
> - https://www.ogis-ri.co.jp/otc/hiroba/technical/kubernetes_use/part5.html
> - https://observability.thomasriley.co.uk/monitoring-kubernetes/metrics/kubelet-cadvisor/
> - https://qiita.com/ryysud/items/23eab7110de7337a8bf3

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

#### ▼ relabelings

作成したメトリクスのラベルやその値を変換する。

ServiceMonitorでは、Kubernetes SD configurationsのメタラベルのうちで、`service`/`pod`/`endpoints`のラベルを変換できる。

**＊例＊**

node-exporterが作成したメトリクスでは、`instance`ラベルが`*.*.*.*:<ポート番号>`になっている。

これだとわかりにくいので、Podの`__meta_kubernetes_pod_node_name`ラベルの値 (Nodeのホスト名) に変換する。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: foo-service-monitor
  namespace: prometheus
spec:
  endpoints:
    # __meta_kubernetes_pod_node_nameラベルの値をinstanceラベルの値として挿入する
    - relabelings:
        - action: replace
          # 変換のために使用する値を持つラベル名を設定する
          sourceLabels:
            - __meta_kubernetes_pod_node_name
          # 値の変換対象とするラベル名を設定する
          targetLabel: instance
  selector:
    matchLabels:
      app.kubernetes.io/name: node-exporter-service
```

> - https://grafana.com/blog/2022/03/21/how-relabeling-in-prometheus-works/
> - https://github.com/prometheus-operator/prometheus-operator/issues/135#issuecomment-313087336
> - https://prometheus.io/docs/prometheus/latest/configuration/configuration/#kubernetes_sd_config

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

> - https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/

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

> - https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/

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

収集の対象とするServiceが所属するNamespaceを設定する。

#### ▼ any

全てNamespaceを収集対象として設定する。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: foo-service-monitor
  namespace: prometheus
spec:
  namespaceSelector:
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
  namespaceSelector:
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

> - https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/

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
  selector:
    matchLabels:
      app.kubernetes.io/name: foo-service
```

```yaml
# 収集対象のService
apiVersion: v1
kind: Service
metadata:
  labels:
    app.kubernetes.io/name: foo-service
```

> - https://mizunashi-mana.github.io/blog/posts/2020/07/prometheus-operator/
> - https://github.com/prometheus-operator/prometheus-operator/blob/main/Documentation/troubleshooting.md

**＊例＊**

node-exporterのPodからメトリクスを収集する。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: foo-service-monitor
  namespace: prometheus
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: node-exporter-service
```

```yaml
# 収集対象のService
apiVersion: v1
kind: Service
metadata:
  labels:
    app.kubernetes.io/name: node-exporter-service
```

<br>

## 09. ThanosRuler

### ThanosRuler

リモートストレージとしてThanosを使用する場合、これをセットアップ方法を決める。

<br>
