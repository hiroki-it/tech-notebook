---
title: 【IT技術の知見】ConfigMap系＠リソース定義
description: ConfigMap系＠リソース定義の知見を記録しています。
---

# ConfigMap系＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## kiali-cm

### kiali-cmファイルとは

Kialiの`config.yaml`ファイルを管理する。

<br>

### accessible_namespaces

記入中...

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

記入中...

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

記入中...

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

記入中...

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

記入中...

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
      # 認証なしでKialiにログインできるようにする
      strategy: anonymous
```

<br>

### custom_secrets

記入中...

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

記入中...

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

記入中...

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
        # Kialiの性能が悪い場合は、自動検出を無効化する。
        # https://kiali.io/docs/faq/general/#why-is-the-workload-or-application-detail-page-so-slow-or-not-responding
        discovery_enabled: false
        enabled: true
        prometheus:
          # PrometheusのServiceの宛先情報を設定する。
          url: http://foo-prometheus.foo-namespace.svc.cluster.local:9090
```

> - https://kiali.io/docs/configuration/custom-dashboard/

#### ▼ grafana

記入中...

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    grafana:
      auth:
        # Grafanaでベーシック認証を使用している場合
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
      # GrafanaのServiceの宛先情報を設定する。
      in_cluster_url: http://foo-grafana.foo-namespace.svc.cluster.local
      # Kialiダッシュボードからのリダイレクト先とするGrafanaダッシュボードのURLを設定する。
      url: http://foo.grafana.com
```

> - https://kiali.io/docs/configuration/p8s-jaeger-grafana/grafana/

#### ▼ istio

Istioとの連携を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    istio:
      component_status:
        # ステータスを連携したいIstioのコンポーネントを設定する
        components:
          - app_label: istiod
          - app_label: istio-ingressgateway
            namespace: istio-ingress
          - app_label: istio-egressgateway
            namespace: istio-egress
        # Masthead indicatorを表示するかどうかを設定する。
        # https://kiali.io/docs/features/security/#masthead-indicator
        enabled: true
      # Istioが使用しているConfigMap名
      config_map_name: istio-<リビジョン番号>
      istio_identity_domain: svc.cluster.local
      istio_sidecar_annotation: sidecar.istio.io/status
      istio_status_enabled: true
      root_namespace: istio-system
      # サービスメッシュ全体のヘルスチェックのため、IstioのServiceの宛先情報を設定する。
      url_service_version: http://istiod-<リビジョン番号>.istio-system.svc.cluster.local:15014/version
```

> - https://kiali.io/docs/configuration/istio/

#### ▼ prometheus

Prometheusとの連携を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    prometheus:
      # PrometheusのServiceの宛先情報を設定する。
      url: http://foo-prometheus.foo-namespace.svc.cluster.local:9090
```

> - https://kiali.io/docs/configuration/p8s-jaeger-grafana/prometheus/

#### ▼ tracing

分散トレースの監視バックエンド (例：Tempo、Jaegerなど) との連携を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-cm
  namespace: istio-system
data:
  config.yaml: |
    tracing:
      enabled: true
      provider: tempo
      internal_url: http://grafana-tempo.istio-system.svc.cluster.local:3100
      use_grpc: false
```

> - https://kiali.io/docs/configuration/p8s-jaeger-grafana/tracing/tempo/

<br>

### host_aliases

記入中...

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

記入中...

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

記入中...

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

記入中...

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

記入中...

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

記入中...

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

記入中...

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

記入中...

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

記入中...

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

記入中...

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

記入中...

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

記入中...

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

定期的に自動更新される (デフォルトだと`24`時間) ため、デプロイツール (例：ArgoCD、Flux) ではアクセストークンの差分を無視した方がよい。

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

> - https://kiali.io/docs/configuration/authentication/session-configs/

<br>

### kiali_feature_flags

記入中...

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

記入中...

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

記入中...

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

記入中...

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

記入中...

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

記入中...

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

記入中...

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

記入中...

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

記入中...

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

記入中...

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

記入中...

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

> - https://kiali.io/docs/configuration/
> - https://kiali.io/docs/configuration/kialis.kiali.io/#property-details

<br>

### service_annotations

記入中...

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

記入中...

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

記入中...

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

記入中...

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

記入中...

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
