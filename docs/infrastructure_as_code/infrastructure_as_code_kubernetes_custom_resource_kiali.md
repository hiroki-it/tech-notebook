---
title: 【IT技術の知見】Kiali＠カスタムリソース
description: Kiali＠カスタムリソースの知見を記録しています。
---

# Kiali＠カスタムリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Kialiの仕組み

### アーキテクチャ

Kialiは、バックエンドコンポーネントとフロントエンドコンポーネントから構成されている。

![kiali_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kiali_architecture.png)

> ↪️ 参考：https://kiali.io/docs/architecture/architecture/

<br>

### バックエンドコンポーネント

バックエンドコンポーネントは、kube-apiserverからKubernetesリソース (例：Namespace、Deployment、Service、など) の情報を収集し、またPrometheusからIstioのメトリクスを収集する。

アーキテクチャの図中で点線は、バックエンドコンポーネントがIstiodコントロールプレーンに間接的に依存していることを表している。

> ↪️ 参考：https://kiali.io/docs/architecture/architecture/#kiali-back-end

<br>

### フロントエンドコンポーネント

フロントエンドコンポーネントは、バックエンドからデータを取得し、ダッシュボード上にサービスメッシュトポロジーを作成する。

サービスメッシュトポロジーから、マイクロサービス間の通信の依存関係や通信状況を確認できる。

その他、テレメトリー収集ツール (例：Jaeger、Grafana) と連携し、Kiali上のデータから連携先のツールのURLにリダイレクトできるようにする。

> ↪️ 参考：https://kiali.io/docs/architecture/architecture/#kiali-front-end

<br>

## 01-02. マニフェスト

### マニフェストの種類

Kialiは、Deployment、ConfigMap、Service、などのマニフェストから構成されている。

<br>

### Deployment配下のPod

#### ▼ 設定例

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    app.kubernetes.io/name: kiali
  name: foo-kiali
  namespace: istio-system
spec:
  containers:
    - command:
        - /opt/kiali/kiali
        - '-config'
        - /kiali-configuration/config.yaml
  image: quay.io/kiali/kiali:v1.60.0
  name: kiali
  ports:
    - containerPort: 20001
      name: api-port
      protocol: TCP
    - containerPort: 9090
      name: http-metrics
      protocol: TCP
  volumeMounts:
    - mountPath: /kiali-configuration
      name: kiali-configuration
    - mountPath: /kiali-cert
      name: kiali-cert
    - mountPath: /kiali-secret
      name: kiali-secret
    - mountPath: /kiali-cabundle
      name: kiali-cabundle
    - mountPath: /var/run/secrets/kubernetes.io/serviceaccount
      name: kube-api-access-rbnbz
      readOnly: true
  ...

```

<br>

### ConfigMap

#### ▼ 設定例

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-config-map
  namespace: istio-system
data:
  config.yaml: |
    auth:
      openid: {}
      openshift:
        client_id_prefix: kiali
      strategy: anonymous
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
    external_services:
      custom_dashboards:
        enabled: true
        prometheus:
          url: http://foo-prometheus.foo-namespace:9090
      grafana:
        auth:
          type: basic
          username: admin
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
        in_cluster_url: http://foo-grafana.foo-namespace
      istio:
        istio_identity_domain: svc.cluster.local
        istio_sidecar_annotation: sidecar.istio.io/status
        istio_status_enabled: true
        root_namespace: istio-system
        url_service_version: http://istiod-<リビジョン番号>:15014/version
      prometheus:
        url: http://foo-prometheus.foo-namespace:9090
      tracing:
        enabled: false
    identity:
      cert_file: ""
      private_key_file: ""
    istio_namespace: istio-system
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
    login_token:
      expiration_seconds: 86400
      signing_key: *****
    server:
      metrics_enabled: true
      metrics_port: 9090
      port: 20001
      web_root: /kiali

  ...

```

> ↪️ 参考：https://kiali.io/docs/configuration/kialis.kiali.io/#property-details

#### ▼ Istioとの対応

Kialiのバージョンは、Istioと対応関係にある。

Kialiのバージョンに応じたリビジョン番号のIstioを指定する。

> ↪️ 参考：https://kiali.io/docs/installation/installation-guide/prerequisites/#version-compatibility

<br>

### Service

#### ▼ 設定例

```yaml
apiVersion: v1
kind: Service
metadata:
  name: kiali
  namespace: istio-system
spec:
  ports:
    - name: http
      port: 20001
      protocol: TCP
    - name: http-metrics
      port: 9090
      protocol: TCP
  selector:
    app.kubernetes.io/name: kiali

  ...

```

<br>

## 02. ユースケース

### グラフタイプ

アプリコンテナ間 (Pod間) の通信を表示するために、Appグラフを選択する。

> ↪️ 参考：
>
> - https://kiali.io/docs/features/topology/#graph-types
> - https://istio.io/latest/docs/tasks/observability/kiali/#viewing-and-editing-istio-configuration-yaml

<br>

### 凡例ラベル

- デフォルトでは、最新`1`分に発生した通信しか表示しないため、表示期間を延長する。
- デフォルトでは、全てのNamespaceが表示されて見にくいため、アプリコンテナのNamespaceのみをフィルタリングして表示する。
- デフォルトでは、アプリコンテナ以外のコンポーネント (例：IstioのVirtual Service) が表示されて見にくいため、Appシェイプのみをフィルタリングして表示する。

<br>

### 囲み線

- 複数のNamespaceに`istio-proxy`コンテナをインジェクションしている場合、Serviceとマイクロサービスが`NS`とついた線で囲われる。
- 特定のマイクロサービスに複数の`subset`値 (例：`v1`、`v2`) が付与されている場合、それらが`A`とついた線で囲われる。

> ↪️ 参考：https://istio.io/v1.14/docs/tasks/observability/kiali/#generating-a-graph

<br>

### Istioのマニフェストの検証

Kialiでは、Istioのマニフェストを検証できる。

ダッシュボード (Serviceタブ、Istio Configタブ) のConfigurationがエラー表示になっていれば、マニフェストに問題があることがわかる。

> ↪️ 参考：https://istio.io/latest/docs/tasks/observability/kiali/#validating-istio-configuration

<br>

### 通信のトラブルシューティング

レスポンスタイムやエラー率を基点として、原因になっているマイクロサービスを特定していく。

> ↪️ 参考：
>
> - https://www.weave.works/blog/working-with-istio-track-your-services-with-kiali
> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#021

<br>

## 03. トレースと他のデータ間の紐付け

### 他のテレメトリーとの紐付け

#### ▼ メトリクスとの紐付け

> ↪️ 参考：https://kiali.io/docs/features/tracing/#metric-correlation

#### ▼ ログとの紐付け

> ↪️ 参考：https://kiali.io/docs/features/tracing/#logs-correlation

<br>

### サービスメッシュトポロジーとの紐付け

> ↪️ 参考：https://kiali.io/docs/features/tracing/#graph-correlation

<br>
