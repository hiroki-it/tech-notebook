---
title: 【IT技術の知見】ConfigMap系＠リソース定義
description: ConfigMap系＠リソース定義の知見を記録しています。
---

# ConfigMap系＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## kiali-cm

### kiali-cmファイルとは

Kialiの`config.yaml`ファイルを管理する。

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
    deployment:
    accessible_namespaces:
      - '**'
    additional_service_yaml: {}
    affinity:
      node: {}
      pod: {}
      pod_anti: {}
    configmap_annotations: {}
    custom_secrets: []
    host_aliases: []
    hpa:
      api_version: autoscaling/v2
      spec: {}
    image_digest: ""
    image_name: quay.io/kiali/kiali
    image_pull_policy: Always
    image_pull_secrets: []
    image_version: v1.60.0
    ingress:
      additional_labels: {}
      class_name: nginx
      enabled: false
      override_yaml:
        metadata: {}
    instance_name: kiali
    logger:
      log_format: text
      log_level: info
      sampler_rate: "1"
      time_field_format: 2006-01-02T15:04:05Z07:00
    namespace: istio-system
    override_ingress_yaml:
      metadata: {}
    pod_annotations: {}
    pod_labels: {}
    priority_class_name: ""
    replicas: 1
    resources:
      limits:
        cpu: "1"
        memory: 1000Mi
      requests:
        cpu: 200m
        memory: 128Mi
    secret_name: kiali
    security_context: {}
    service_annotations: {}
    service_type: ""
    tolerations: []
    version_label: v1.60.0
    view_only_mode: true
```

<br>

### external_services

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
        # Kialiのパフォーマンスが悪い場合は、自動て検出を無効化する。
        # https://kiali.io/docs/faq/general/#why-is-the-workload-or-application-detail-page-so-slow-or-not-responding
        discovery_enabled: false
        enabled: true
        prometheus:
          # PrometheusのServiceの宛先情報を設定する。
          url: http://foo-prometheus.foo-namespace:9090
      # https://kiali.io/docs/configuration/p8s-jaeger-grafana/grafana/
      grafana:
        auth:
          # GrafanaでBasic認証を使用している場合
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
        in_cluster_url: http://foo-grafana.foo-namespace
        # GrafanaダッシュボードのURLを設定する。
        url: http://foo.grafana.com
      # IstiodのPodのステータスを確認するために、Istiodの宛先情報を設定する。
      # https://v1-48.kiali.io/docs/features/istio-component-status/
      istio:
        component_status:
          components:
            - app_label: istiod
            - app_label: istio-ingressgateway
              namespace: istio-ingress
          # Masthead indicatorを表示するかどうかを設定する。
          # https://kiali.io/docs/features/security/#masthead-indicator
          enabled: true
        # Istioが使用しているConfigMap名
        config_map_name: istio-<リビジョン番号>
        istio_identity_domain: svc.cluster.local
        istio_sidecar_annotation: sidecar.istio.io/status
        istio_status_enabled: true
        root_namespace: istio-system
        # サービスメッシュ全体のヘルスチェックのため、IstioのService名を設定する。
        url_service_version: http://istiod-<リビジョン番号>:15014/version
      # https://kiali.io/docs/configuration/p8s-jaeger-grafana/prometheus/
      prometheus:
        # PrometheusのServiceの宛先情報を設定する。
        url: http://foo-prometheus.foo-namespace:9090
      tracing:
        enabled: false
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

### login_token

記入中...

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

> ↪️：
>
> - https://kiali.io/docs/configuration/
> - https://kiali.io/docs/configuration/kialis.kiali.io/#property-details

<br>
