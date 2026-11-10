---
title: 【IT技術の知見】ConfigMap系
description: ConfigMap系の知見を記録しています。
tags:
  - "可観測性"
  - "監視ツール"
  - "Kiali"
  - "リソース定義"
---

# ConfigMap 系

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## kiali-cm

### kiali-cm ファイルとは

Kiali の `config.yaml` ファイルを管理する。

<br>

### accessible_namespaces

Kiali がアクセスでき、ユーザーに表示する Namespace を設定する。`**` とすると、全ての Namespace を対象とする。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    accessible_namespaces:
      - '**'
```

<br>

### additional_service_yaml

Kiali の Service に追加する設定を YAML で設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    additional_service_yaml: {}
```

<br>

### affinity

Kiali の Pod をスケジューリングする Node を制限するアフィニティを、node、pod、pod_anti ごとに設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    affinity:
      node: {}
      pod: {}
      pod_anti: {}
```

<br>

### configmap_annotations

Kiali の ConfigMap に付与するアノテーションを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    configmap_annotations: {}
```

<br>

### auth

Kiali にログインする時の認証方式と、認証方式ごとの設定を設定する。認証方式には、anonymous、token、openshift、openid、header がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    auth:
      openid: {}
      openshift:
        client_id_prefix: kiali
      # 認証なしで Kiali にログインできるようにする
      strategy: anonymous
```

<br>

### custom_secrets

Kiali の Pod にマウントする Secret を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    custom_secrets: []
```

<br>

### deployment

Kiali の Pod のリソース、レプリカ数、ネットワーク、セキュリティなど、デプロイに関する設定を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    deployment: {}
```

<br>

### external_services

#### ▼ custom_dashboards

Istio のメトリクスとは別の Prometheus からカスタムダッシュボードを検出し、表示するための設定を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    external_services:
      custom_dashboards:
        # Kiali の性能が悪い場合は、自動検出を無効化する。
        # https://kiali.io/docs/faq/general/#why-is-the-workload-or-application-detail-page-so-slow-or-not-responding
        discovery_enabled: false
        enabled: true
        prometheus:
          # Prometheus の Service の宛先情報を設定する。
          url: http://foo-prometheus.foo-namespace.svc.cluster.local:9090
```

> - [Custom Dashboards \| Kiali](https://kiali.io/docs/configuration/custom-dashboard/)

#### ▼ grafana

Grafana との連携を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    external_services:
      grafana:
        auth:
          # Grafana でベーシック認証を使用している場合
          type: basic
          username: admin
          password: prom-operator
        dashboards:
          - name: Istio Service Dashboard
            variables:
              namespace: var-namespace
              service: var-service
          - name: Istio Workload Dashboard
            variables:
              namespace: var-namespace
              workload: var-workload
        enabled: true
        # Grafana の Service の宛先情報を設定する。
        internal_url: http://foo-grafana.foo-namespace.svc.cluster.local
        # Kiali ダッシュボードからのリダイレクト先とする Grafana ダッシュボードの URL を設定する。
        external_url: http://foo.grafana.com
```

> - [Grafana \| Kiali](https://kiali.io/docs/configuration/p8s-jaeger-grafana/grafana/)

#### ▼ istio

Istio との連携を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    external_services:
      istio:
        component_status:
          # ステータスを連携したい Istio のコンポーネントを設定する
          components:
            - app_label: istiod
            - app_label: istio-ingressgateway
              namespace: istio-ingress
            - app_label: istio-egressgateway
              namespace: istio-egress
          # Masthead indicator を表示するかどうかを設定する。
          # https://kiali.io/docs/features/security/#masthead-indicator
          enabled: true
        # Istio が使用している ConfigMap 名
        config_map_name: istio-<リビジョン>
        istio_identity_domain: svc.cluster.local
        istio_sidecar_annotation: sidecar.istio.io/status
        istio_status_enabled: true
        root_namespace: istio-system
        # サービスメッシュ全体のヘルスチェックのため、Istio の Service の宛先情報を設定する。
        url_service_version: http://istiod-<リビジョン>.istio-system.svc.cluster.local:15014/version
```

> - [Istio Environment \| Kiali](https://kiali.io/docs/configuration/istio/)

#### ▼ prometheus

Prometheus との連携を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    external_services:
      prometheus:
        # Prometheus の Service の宛先情報を設定する。
        url: http://foo-prometheus.foo-namespace.svc.cluster.local:9090
```

> - [Prometheus \| Kiali](https://kiali.io/docs/configuration/p8s-jaeger-grafana/prometheus/)

#### ▼ tracing

分散トレースの監視バックエンド (例：Tempo、Jaeger など) との連携を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    external_services:
      tracing:
        enabled: true
        provider: tempo
        internal_url: http://grafana-tempo.grafana-tempo.svc.cluster.local:3200
        use_grpc: false
```

> - [Grafana Tempo \| Kiali](https://kiali.io/docs/configuration/p8s-jaeger-grafana/tracing/tempo/)

<br>

### host_aliases

Kiali の Pod の `/etc/hosts` ファイルに追加するホスト名と IP アドレスの対応を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    host_aliases: []
```

<br>

### hpa

Kiali の Pod を自動でスケーリングする HorizontalPodAutoscaler を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    hpa:
      api_version: autoscaling/v2
      spec: {}
```

<br>

### identity

Kiali が使用する TLS 証明書ファイルと秘密鍵ファイルのパスを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    identity:
      cert_file: ""
      private_key_file: ""
```

<br>

### image_digest

`image_version` にダイジェスト値を設定した場合に、`sha256` などのダイジェストの種類を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    image_digest: ""
```

<br>

### image_name

Kiali のコンテナイメージ名を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    image_name: quay.io/kiali/kiali
```

<br>

### image_pull_policy

Kiali のコンテナイメージのプルポリシーを設定する。通常は `IfNotPresent` とし、`latest` のイメージを使う場合は `Always` とする。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    image_pull_policy: Always
```

<br>

### image_pull_secrets

プライベートなコンテナレジストリからコンテナイメージをプルするための Secret 名を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    image_pull_secrets: []
```

<br>

### image_version

インストールする Kiali のバージョンを設定する。`lastrelease`、`latest`、`operator_version`、または特定のバージョンを設定できる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    image_version: v1.60.0
```

<br>

### ingress

Kiali を Ingress で外部に公開するかどうかと、その設定を設定する。OpenShift の場合は Route を使う。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    ingress:
      additional_labels: {}
      class_name: nginx
      enabled: false
      override_yaml:
        metadata: {}
```

<br>

### istio_namespace

Istio をインストールした Namespace を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    istio_namespace: istio-system
```

<br>

### instance_name

Kiali のインストールに付けるインスタンス名を設定する。インスタンス名は作成する Kubernetes リソース名の接頭辞となり、作成後は変更できない。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    instance_name: kiali
```

<br>

### logger

Kiali のログのログレベル、フォーマット、タイムスタンプの形式などを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    logger:
      log_format: text
      log_level: info
      sampler_rate: "1"
      time_field_format: 2006-01-02T15:04:05Z07:00
```

<br>

### login_token

認証に必要なアクセストークンを設定する。

定期的に自動更新される (デフォルトだと `24` 時間) ため、デプロイツール (例：ArgoCD、Flux) ではアクセストークンの差分を無視したほうがよい。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    login_token:
      expiration_seconds: 86400
      signing_key: *****
```

> - [Session options \| Kiali](https://kiali.io/docs/configuration/authentication/session-configs/)

<br>

### kiali_feature_flags

証明書情報の表示、クラスタリング、バリデーションなど、Kiali の機能の有効化と無効化を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    kiali_feature_flags:
      certificates_information_indicators:
        enabled: true
        secrets:
          - cacerts
          - istio-ca-secret
      clustering:
        enabled: true
      disabled_features: []
      validations:
        ignore:
          - KIA1201
```

<br>

### namespace

Kiali をインストールする Namespace を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    namespace: istio-system
```

<br>

### override_ingress_yaml

Kiali を公開する Ingress や Route のデフォルトの設定を上書きする設定を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    override_ingress_yaml:
      metadata: {}
```

<br>

### pod_annotations

Kiali の Pod に付与するアノテーションを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    pod_annotations: {}
```

<br>

### pod_labels

Kiali の Pod に付与するラベルを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    pod_labels: {}
```

<br>

### priority_class_name

Kiali の Pod のスケジューリングの優先度を決める PriorityClass 名を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    priority_class_name: ""
```

<br>

### replicas

Kiali の Deployment のレプリカ数を設定する。HorizontalPodAutoscaler を設定した場合、この値は無視される。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    replicas: 1
```

<br>

### resources

Kiali のコンテナのハードウェアリソースの要求量と上限を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    resources:
      limits:
        cpu: 1000m
        memory: 1024Mi
      requests:
        cpu: 200m
        memory: 128Mi
```

<br>

### secret_name

Kiali が使用する Secret 名を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    secret_name: kiali
```

<br>

### security_context

Kiali のコンテナのセキュリティコンテキストを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    security_context: {}
```

<br>

### server

Kiali のサーバーのポート番号、メトリクスの公開、Web UI のルートパスなどを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-config-map
  namespace: istio-system
data:
  config.yaml: |
    server:
      metrics_enabled: true
      metrics_port: 9090
      port: 20001
      web_root: /kiali
```

> - [Configuration \| Kiali](https://kiali.io/docs/configuration/)
> - [Kiali CR Reference \| Kiali](https://kiali.io/docs/configuration/kialis.kiali.io/#property-details)

<br>

### service_annotations

Kiali の Service に付与するアノテーションを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    service_annotations: {}
```

<br>

### service_type

Kiali の Service のタイプを設定する。ClusterIP、NodePort、LoadBalancer などを設定できる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    service_type: ""
```

<br>

### tolerations

Kiali の Pod が許容する Node の Taint を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    tolerations: []
```

<br>

### version_label

Kiali の Kubernetes リソースに付与する `version` ラベルの値を設定する。空の場合は `image_version` から自動で決まる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    version_label: v1.60.0
```

<br>

### view_only_mode

Kiali を閲覧専用モードにするかどうかを設定する。`true` の場合、Kiali からサービスメッシュの設定を変更できなくなる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    view_only_mode: true
```

<br>
