---
title: 【IT 技術の知見】ConfigMap 系＠リソース定義
description: ConfigMap 系＠リソース定義の知見を記録しています。

---

# ConfigMap 系＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. 専用 ConfigMap

Istio の各コンポーネントの機密でない変数やファイルを管理する。

<br>

## 02 istio-ca-root-cert

### istio-ca-root-cert とは

Istiod コントロールプレーン (`discovery` コンテナ) による認証局を使用する場合、`istio-ca-root-cert` を自動的に作成する。

ルート認証局から発行された CA 証明書 (ルート証明書) をもち、各マイクロサービスの Pod にマウントされる。

各マイクロサービスに配布された証明書を検証するために使用される。

Istio コントロールプレーンのログから、CA 証明書の作成を確認できる。

```bash
2025-01-26T11:21:09.391516Z	info	initializing Istiod DNS certificates host: istiod-1-24-2.istio-system.svc, custom host:
2025-01-29T11:43:03.694183Z	info	Generating istiod-signed cert for [istio-pilot.istio-system.svc istiod-1-24-2.istio-system.svc istiod-remote.istio-system.svc istiod.istio-system.svc]:

-----BEGIN CERTIFICATE-----
*****
-----END CERTIFICATE-----


```

![istio_istio-ca-root-cert](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_istio-ca-root-cert.png)

> - [Replacing Istio CA Certificate · Zufar Dhiyaulhaq](https://zufardhiyaulhaq.com/Replacing-Istio-CA-certificate/)
> - https://training.linuxfoundation.cn/news/407
> - https://developers.redhat.com/articles/2023/08/24/integrate-openshift-service-mesh-cert-manager-and-vault#default_and_pluggable_ca_scenario

<br>

### root-cert.pem

#### ▼ root-cert.pem とは

CA 証明書 (ルート証明書) を設定する。

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: istio-ca-root-cert
  namespace: app # マイクロサービスの Namespace
data:
  root-cert.pem: |
    -----BEGIN CERTIFICATE-----
    *****
    -----END CERTIFICATE-----
```

<br>

## 03. istio-cni-config

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: istio-cni-config
  namespace: kube-system
data:
  CURRENT_AGENT_VERSION: 1.24.2
  AMBIENT_ENABLED: "true"
  AMBIENT_DNS_CAPTURE: "false"
  AMBIENT_IPV6: "true"
  CHAINED_CNI_PLUGIN: "true"
  EXCLUDED_NAMESPACES: kube-system
  REPAIR_ENABLED: "true"
  REPAIR_LABEL_PODS: "false"
  REPAIR_DELETE_PODS: "false"
  REPAIR_REPAIR_PODS: "true"
  REPAIR_INIT_CONTAINER_NAME: istio-validation
  REPAIR_BROKEN_POD_LABEL_KEY: cni.istio.io/uninitialized
  REPAIR_BROKEN_POD_LABEL_VALUE: "true"
```

<br>

## 04. istio-<リビジョン>

### istio-<リビジョン>とは

Istiod コントロールプレーン (`discovery` コンテナ) のため、すべての istio-proxy へグローバルに設定する変数を管理する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    ...
  meshNetworks: |
    ...
```

代わりに、IstioOperator の `.spec.meshConfig` キーで定義できるが、これは非推奨である。

```yaml
# これは非推奨
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  name: istio-operator
  namespace: istio-system
spec:
  meshConfig: ...
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig)

<br>

## 04-01. mesh

### accessLogEncoding

#### ▼ accessLogEncoding とは

istio-proxy で作成するアクセスログのファイル形式を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    accessLogEncoding: JSON
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-AccessLogEncoding)

<br>

### accessLogFile

#### ▼ accessLogFile とは

istio-proxy で作成するアクセスログの出力先を設定する。

設定しないと、Envoy はアクセスログを出力しない。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    accessLogFile: /dev/stdout
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig)
> - [1.1.0-rc-0: egress gateway proxy doesn't log the curl request when routing external HTTP service · Issue #11938 · istio/istio · GitHub](https://github.com/istio/istio/issues/11938#issuecomment-465938259)

<br>

### caCertificates

#### ▼ caCertificates とは

ルート認証局の CA 証明書や、中間認証局名を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        ISTIO_META_CERT_SIGNER: istio-system
    caCertificates:
        # ルート認証局の CA 証明書 
      - pem: |
          Ci0tLS0tQk...
        # 中間認証局名
        certSigners:
          - clusterissuers.cert-manager.io/istio-system
          - clusterissuers.cert-manager.io/foo
          - clusterissuers.cert-manager.io/bar
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-CertificateData)
> - [Istio / Custom CA Integration using Kubernetes CSR](https://istio.io/latest/docs/tasks/security/cert-management/custom-ca-k8s/#deploy-istio-with-default-cert-signer-info)
> - [Istio / cert-manager](https://istio.io/latest/docs/ops/integrations/certmanager/)

<br>

### discoverySelectors

#### ▼ discoverySelectors とは

`ENHANCED_RESOURCE_SCOPING` を有効化し、Istiod コントロールプレーンが watch する Namespace を限定する。
Istiod はすべての Namespace を watch するが、特定の Namespace のみを watch するようにできる。

これは、サイドカーをインジェクションする `istio.io/rev` キーよりも強い影響力がある。

例えば、サイドカーをインジェクションしている Namespace のみを watch することにより、Istiod コントロールプレーンの負荷を下げられる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    discoverySelectors:
      - matchLabels:
          istio.io/rev: default
```

> - [Istio / Istio 1.22 Upgrade Notes](https://istio.io/latest/news/releases/1.22.x/announcing-1.22/upgrade-notes/#default-value-of-the-feature-flag-enhanced_resource_scoping-to-true)
> - [api/mesh/v1alpha1/config.proto at v1.22.1 · istio/api · GitHub](https://github.com/istio/api/blob/v1.22.1/mesh/v1alpha1/config.proto#L1252-L1274)

#### ▼ REGISTRY_ONLY

サービスメッシュ外へのリクエストの宛先を `BlackHoleCluster` (`502 Bad Gateway` で通信負荷) として扱う。

また、ServiceEntry として登録した宛先には固有の名前がつく。

サービスメッシュ外への通信のたびに ServiceEntry を作成しなければならず、少しめんどくさくなる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    outboundTrafficPolicy:
      mode: REGISTRY_ONLY
```

> - [Istio / Accessing External Services](https://istio.io/latest/docs/tasks/traffic-management/egress/egress-control/#envoy-passthrough-to-external-services)
> - https://istiobyexample.dev/monitoring-egress-traffic/

<br>

### defaultHttpRetryPolicy

#### ▼ defaultHttpRetryPolicy とは

リトライポリシーのデフォルト値を設定する。

ただし、`.spec.http[*].retries.perTryTimeout` キーは各 VirtualService で設定する必要がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultHttpRetryPolicy: 
      attempts: 3
      retryOn: connect-failure,deadline-exceeded,refused-stream,unavailable
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-default_http_retry_policy)

#### ▼ アウトバウンド通信時のリトライ条件

istio-proxy のアウトバウンド通信時リトライ条件は以下である。

宛先に通信が届いておらず、リトライすれば問題が解決する可能性のあるステータスコードは、リトライしてもよい。

- リトライすると解決する可能性がある
- リクエストを繰り返しても状態が変わらずに冪等性がある (二重処理にならない) がある

`503` と `reset` によるリトライは冪等性に問題があり、設定に注意が必要である。

![istio_inbound-retry_reset](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_inbound-retry_reset.png)

| HTTP/1.1、HTTP/2 のステータスコード                                       | マイクロサービスに通信が届いている | リトライが有効 | リトライ条件                                                                                                                                                             |
| ------------------------------------------------------------------------- | :--------------------------------: | :------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `connect-failure`                                                         |                 ⭕️                 |       ✅       | マイクロサービスからのアウトバウンド通信時、接続タイムアウト (Connection timeout) が起こった場合に、リトライを実行する。                                                 |
| `gateway-error`                                                           |                 ⭕️                 |                | マイクロサービスからのアウトバウンド通信時、Gateway 系ステータスコード (`502`、`503`、`504`) が返信された場合に、リトライを実行する。冪性がない可能性がある。            |
| `retriable-status-codes` (`5xx` のように任意のステータスコードを設定する) |                 ⭕️                 |                | マイクロサービスからのアウトバウンド通信時、指定した HTTP ステータスであった場合に、リトライを実行する。冪等性がない可能性がある。                                       |
| `reset`                                                                   |                 ⭕️                 |                | マイクロサービスからのアウトバウンド通信時、接続切断／接続リセット／読み取りタイムアウト (Read timeout) が起こった場合に、リトライを実行する。冪等性がない可能性がある。 |

> - [再試行の方法 \| Cloud Storage \| Google Cloud Documentation](https://cloud.google.com/storage/docs/retry-strategy?hl=ja#retryable)
> - [Implement retry on connection reset to upstream · Issue #51704 · istio/istio · GitHub](https://github.com/istio/istio/issues/51704#issuecomment-2188555136)
> - [Can we set \`reset\` as default retry policy? · Issue #35774 · istio/istio · GitHub](https://github.com/istio/istio/issues/35774#issuecomment-953877524)
> - [再試行の方法 \| Cloud Storage \| Google Cloud Documentation](https://cloud.google.com/storage/docs/retry-strategy?hl=ja)

| HTTP/2 のステータスコード | マイクロサービスに通信が届いている | リトライが有効 | リトライ条件                                                                                                                                                                                         |
| ------------------------- | :--------------------------------: | :------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cancelled`               |                 ⭕️                 |                | **マイクロサービスからのアウトバウンド**通信時、gRPC ステータスコードが `Cancelled` であった場合に、リトライを実行する。送信元がリクエストを切断しているため、リトライするべきではない可能性がある。 |
| `deadline-exceeded`       |                 ⭕️                 |       条件による       | マイクロサービスからアウトバウンド通信時、gRPC ステータスコードが `DeadlineExceeded` であった場合に、リトライを実行する。                                                                            |
| `refused-stream`          |                 ⭕️                 |       ✅       | 宛先が HTTP/2 エラーコードの `REFUSED_STREAM` を返信した場合に、リトライを実行する。                                                                                                   |
| `resource-exhausted`      |                 ⭕️                 |       条件による       | マイクロサービスからのアウトバウンド通信時、gRPC ステータスコードが `ResourceExhausted` であった場合に、リトライを実行する。                                                                         |
| `unavailable`             |                 ⭕️                 |              | マイクロサービスからのアウトバウンド通信時、宛先が gRPC ステータスコードの `Unavailable` を返信した場合に、リトライを実行する。冪等性に注意する。                                                                   |

> - [Router — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#x-envoy-retry-on)
> - [Router — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#x-envoy-retry-grpc-on)

#### ▼ インバウンド通信時のリトライ条件

istio-proxy のインバウンド通信時のリトライ条件は以下である。

執筆時点 (2025/02/26) では、`ENABLE_INBOUND_RETRY_POLICY` 変数を `true` (デフォルト値) にすると使用できる。

| HTTP/2 のステータスコード | マイクロサービスに通信が届いている | 冪等性がある | 理由                                                                                                 |
| --------------------------- | :--------------------------------: | :----------: | ---------------------------------------------------------------------------------------------------- |
| `reset-before-request`      |                 ×                  |      ✅      | マイクロサービスへのインバウンド通信時、マイクロサービスにリクエストをフォワーディングできなかった。 |

<br>

### defaultProviders

#### ▼ defaultProviders とは

`extensionProviders` キーで定義したもののうち、デフォルトで使用するプロバイダーを設定する。

Telemetry で自動的に選択される。

Envoy を使用してアクセスログを収集する場合、`.mesh.defaultProviders.accessLogging` キーには何も設定しなくてよい。

また、Istio がデフォルトで用意している分散トレースツールを使用する場合も同様に不要である。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultProviders:
       metrics:
         - prometheus
       accessLogging:
         - stackdriver
       tracing:
         - opentelemetry-grpc
    enableTracing: true
    extensionProviders:
      - name: opentelemetry-grpc
        opentelemetry:
          # OpenTelemetry Collector を宛先として設定する
          service: opentelemetry-collector.foo-namespace.svc.cluster.local
          # gRPC 用のエンドポイントを設定する
          port: 4317
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-DefaultProviders)

Envoy のアクセスログの場合、代わりに `.mesh.accessLogEncoding` キーと `.mesh.accessLogFile` キーを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    accessLogEncoding: JSON
    accessLogFile: /dev/stdout
```

分散トレースの場合、代わりに `.mesh.enableTracing` キーと `.mesh.extensionProviders` キーを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    enableTracing: true
    extensionProviders:
      - name: opentelemetry-grpc
        opentelemetry:
          service: opentelemetry-collector.foo-namespace.svc.cluster.local
          port: 4317
```

<br>

### enablePrometheusMerge

#### ▼ enablePrometheusMerge とは

マイクロサービスと istio-proxy のメトリクスエンドポイントを統合するかどうかを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    enablePrometheusMerge: true
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/)

<br>

### enableTracing

#### ▼ enableTracing とは

istio-proxy でトレース ID とスパン ID を作成するか否かを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    enableTracing: true
```

> - [Istio / Configure tracing using MeshConfig and pod annotations](https://istio.io/latest/docs/tasks/observability/distributed-tracing/mesh-and-proxy-config/#available-tracing-configurations)
> - [Istio / Jaeger](https://istio.io/latest/docs/ops/integrations/jaeger/)
> - [Istio / Zipkin](https://istio.io/latest/docs/ops/integrations/zipkin/#option-2-customizable-install)
> - [サービスメッシュの本質は、トラフィック管理や可観測性ではない](https://zenn.dev/riita10069/articles/service-mesh)

<br>

### inboundClusterStatName

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    inboundClusterStatName: inbound|%SERVICE_PORT%|%SERVICE_PORT_NAME%|%SERVICE_FQDN%
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-inbound_cluster_stat_name)

<br>

### ingressSelector

#### ▼ ingressSelector とは

Istio Ingress Controller が処理対象とする Deployment のリソースラベルを設定する。

デフォルトでは、Ingress として `ingressgateway` が設定される。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    ingressSelector: ingressgateway
```

<br>

### ingressService

#### ▼ ingressService とは

Istio Ingress Controller が処理対象とする Service 名を設定する。

デフォルトでは、`istio-ingressgateway` が設定される。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    ingressService: ingressgateway
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig)

<br>

### proxyHttpPort

#### ▼ proxyHttpPort とは

istio-proxy を HTTP プロキシとして使用する場合に、HTTP リクエストを待ち受けるポート番号を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    proxyHttpPort: 80
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig)

<br>

### outboundClusterStatName

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    outboundClusterStatName: outbound|%SERVICE_PORT%|%%SUBSET_NAME%%|%SERVICE_FQDN%
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-outbound_cluster_stat_name)

<br>

### outboundTrafficPolicy

#### ▼ outboundTrafficPolicy とは

サービスメッシュ外に送信するリクエストについて、宛先の種類 (`PassthroughCluster`、`BlackHoleCluster`) を設定する。

#### ▼ ALLOW_ANY (デフォルト)

サービスメッシュ外へのリクエストの宛先を `PassthroughCluster` として扱う。

また、ServiceEntry として登録した宛先には固有の名前がつく。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    outboundTrafficPolicy:
      mode: ALLOW_ANY
```

> - [Istio / Accessing External Services](https://istio.io/latest/docs/tasks/traffic-management/egress/egress-control/#envoy-passthrough-to-external-services)
> - https://istiobyexample.dev/monitoring-egress-traffic/
> - https://discuss.istio.io/t/setting-outboundtrafficpolicy-mode-in-configmap/7041/3

#### ▼ ALLOW_ANY の注意点

サービスメッシュ外の "クラスター外" の宛先であれば、`ALLOW_ANY` のため接続可能である (Kiali 上は PassthroughCluster という表記) 。

一方で、サービスメッシュ外の "クラスター内" であると、Istio リソースで宛先を登録する必要がある。

方法として、以下がある。

- OpenTelemetry Collector をサービスメッシュ内に置いて、VirtualService を作成する
- 〃 をサービスメッシュ外に置いて、ServiceEntry を作成する

<br>

### proxyListenPort

#### ▼ proxyListenPort とは

すべての istio-proxy に、マイクロサービスからのアウトバウンド通信を待ち受けるポート番号を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    proxyListenPort: 80
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig)

<br>

## 04-01-02. defaultConfig

### defaultConfig とは

Istio Ingress/Egress Gateway と istio-proxy に適用する変数のデフォルト値を設定する。

他に ProxyConfig (と思ったが、ProxyConfig のドキュメントに載っていない設定は無理みたい) 、Pod の `.metadata.annotations.proxy.istio.io/config` キーでも設定できる。

ProxyConfig が最優先であり、これらの設定はマージされる。

`.meshConfig.defaultConfig` キーにデフォルト値を設定しておき、ProxyConfig で Namespace やマイクロサービス Pod ごとに上書きするのがよい。

3 つの箇所で設定できる。

```yaml
meshConfig:
  defaultConfig:
    discoveryAddress: istiod:15012
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo
spec:
  selector:
    ...
  template:
    metadata:
      ...
      annotations:
        proxy.istio.io/config: |
          # 表にある設定
```

```yaml
# API がまだ用意されておらず、現状は設定できない
apiVersion: networking.istio.io/v1beta1
kind: ProxyConfig
metadata:
  name: foo-proxyconfig
spec:
  discoveryAddress: istiod:15012
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig)
> - [api/networking/v1beta1/proxy\_config.proto at master · istio/api · GitHub](https://github.com/istio/api/blob/master/networking/v1beta1/proxy_config.proto)

<br>

### controlPlaneAuthPolicy

データプレーン (istio-proxy) とコントロールプレーン間の通信に相互 TLS 認証を実施する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      controlPlaneAuthPolicy: MUTUAL_TLS
```

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ProxyConfig
metadata:
  name: foo-proxyconfig
spec:
  controlPlaneAuthPolicy: MUTUAL_TLS
```

### discoveryAddress

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      discoveryAddress: istiod-<リビジョン>.istio-system.svc:15012
```

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ProxyConfig
metadata:
  name: foo-proxyconfig
spec:
  discoveryAddress: istiod-<リビジョン>.istio-system.svc:15012
```

<br>

### drainDuration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      drainDuration: 45s
```

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ProxyConfig
metadata:
  name: foo-proxyconfig
spec:
  drainDuration: 45s
```

<br>

### envoyAccessLogService

Envoy のアクセスログを、標準出力に出力するのではなく宛先 (例：レシーバー) に送信する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    enableEnvoyAccessLogService: true
    defaultConfig:
      envoyAccessLogService: 
        address: <Envoyのアクセスログの宛先Service名>:15000
        # Istio コントロールプレーンをルート認証局とする
        tlsSettings: ISTIO_MUTUAL
        # TCP KeepAlive を実施する
        tcpKeepalive:
          probes: 9
          time: 2
          interval: 75
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#RemoteService)
> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig-envoy_access_log_service)

<br>

### envoyMetricsService

Envoy のメトリクスを、Prometheus にスクレイピングしてもらうのではなく宛先 (例：レシーバー) に送信する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    # enableEnvoyMetricsService: true という設定がありそうだが、ドキュメントに記載がない
    defaultConfig:
      envoyMetricsService: 
        address: <Envoyのメトリクスの宛先Service名>:15000
        # Istio コントロールプレーンをルート認証局とする
        tlsSettings: ISTIO_MUTUAL
        # TCP KeepAlive を実施する
        tcpKeepalive:
          probes: 9
          time: 2
          interval: 75
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#RemoteService)
> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig-envoy_metrics_service)

<br>

### holdApplicationUntilProxyStarts

istio-proxy が、必ずマイクロサービスよりも先に起動するか否かを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      holdApplicationUntilProxyStarts: true
```

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ProxyConfig
metadata:
  name: foo-proxyconfig
spec:
  holdApplicationUntilProxyStarts: true
```

> - [Sidecar 初始化完成后再启动应用程序 \| Istio 运维实战](https://www.zhaohuabing.com/istio-guide/docs/best-practice/startup-dependence/#%E8%A7%A3%E8%80%A6%E5%BA%94%E7%94%A8%E6%9C%8D%E5%8A%A1%E4%B9%8B%E9%97%B4%E7%9A%84%E5%90%AF%E5%8A%A8%E4%BE%9D%E8%B5%96%E5%85%B3%E7%B3%BB)
> - [【インターンレポート】Istioの導入によるKubernetesクラスタの可観測性の向上](https://engineering.linecorp.com/ja/blog/istio-introduction-improve-observability-of-ubernetes-clusters)

オプションを有効化すると、istio-proxy の `.spec.containers[*].lifecycle.postStart.exec.command` キーに、`pilot-agent -wait` コマンドが挿入される。

終了順序は、istio-proxy の `.spec.containers[*].lifecycle.preStop.exec.command` キーで調整する。

```yaml
...

spec:
  containers:
    - name: istio-proxy

      ...

      lifecycle:
        postStart:
          exec:
            command: |
              pilot-agent wait

...
```

> - [Sidecar 初始化完成后再启动应用程序 \| Istio 运维实战](https://www.zhaohuabing.com/istio-guide/docs/best-practice/startup-dependence/#%E4%B8%BA%E4%BB%80%E4%B9%88%E9%9C%80%E8%A6%81%E9%85%8D%E7%BD%AE-sidecar-%E5%92%8C%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%E7%9A%84%E5%90%AF%E5%8A%A8%E9%A1%BA%E5%BA%8F)

<br>

### image

istio-proxy のコンテナイメージのタイプを設定する。

これは、ConfigMap ではなく ProxyConfig でも設定できる。

`distroless` 型を選ぶと、istio-proxy にログインできなくなり、より安全なイメージになる。

一方で、デバッグしにくくなる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      image:
        imageType: distroless
```

`istio-cni` でも、Helm チャートで別に設定すれば、`distroless` 型を選べる。

> - [Istio / ProxyConfig](https://istio.io/latest/docs/reference/config/networking/proxy-config/#ProxyImage)
> - [クラスタ内コントロール プレーンでオプション機能を有効にする \| Cloud Service Mesh \| Google Cloud Documentation](https://cloud.google.com/service-mesh/docs/enable-optional-features-in-cluster?hl=ja#distroless_proxy_image)
> - [Istio / Harden Docker Container Images](https://istio.io/latest/docs/ops/configuration/security/harden-docker-images/)

<br>

### privateKeyProvider

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      privateKeyProvider:
```

<br>

### proxyHeaders

istio-proxy が通信を中継するときに追加、変更、削除する HTTP ヘッダーを設定する。

例えば、接続プール上限超過によるサーキットブレイカーが起こったことを示す `x-envoy-overloaded` ヘッダーがある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyHeaders:
        forwardedClientCert: SANITIZE
        server:
          disabled: true
        requestId:
          disabled: true
        attemptCount:
          disabled: true
        envoyDebugHeaders:
          disabled: true
        metadataExchangeHeaders:
          mode: IN_MESH
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig-proxy_headers)
> - [Router — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#http-headers-consumed-from-downstreams)
> - [HTTP header manipulation — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers)

<br>

### proxyMetadata

istio-proxy に環境変数を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        # ここに環境変数を設定する
```

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ProxyConfig
metadata:
  name: foo-proxyconfig
spec:
  proxyMetadata: ...
```

<br>

### rootNamespace

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    rootNamespace: istio-system
```

<br>

### tracing (非推奨)

いずれのトレース仕様 (例：Zipkin、Datadog、LightStep など) でトレース ID とスパン ID を作成するかを設定する。

Zipkin と Jaeger はトレースコンテキスト仕様が同じであるため、zipkin パッケージを Jaeger のクライアントとしても使用できる。

`.mesh.enableTracing` キーも有効化する必要がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    enableTracing: true
    defaultConfig:
      tracing:
        sampling: 100
        zipkin:
          address: "jaeger-collector.observability:9411"
```

ただし、非推奨であるため `extensionProviders` キーを使用したほうがよい

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      tracing: {}
    extensionProviders:
      ...
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#Tracing)

<br>

### tracingServiceName

スパンの `service.name` 属性の値を設定する。

マイクロサービスがバージョニングされている場合、マイクロサービスの正式名 (canonical-name) でグループ化できる。

デフォルトでは `APP_LABEL_AND_NAMESPACE` であり、`<appラベル値>.<Namespace>` になる。

app ラベルがないマイクロサービスのために、canonical 名に基づく `CANONICAL_NAME_AND_NAMESPACE` を使用したほうがよい。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      tracingServiceName: APP_LABEL_AND_NAMESPACE
```

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ProxyConfig
metadata:
  name: foo-proxyconfig
spec:
  tracingServiceName: APP_LABEL_AND_NAMESPACE
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig-TracingServiceName)
> - [Istio / Resource Labels](https://istio.io/latest/docs/reference/config/labels/#ServiceCanonicalName)

<br>

### trustDomain

相互 TLS 認証を採用している場合、送信元として許可する信頼ドメインを設定する。

信頼ドメインは SPIFFE ID の `spiffe://<トラストドメイン>` の部分であり、Namespace 名や ServiceAccount 名とは区別される。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    trustDomain: cluster.local
```

> - [Istio / Trust Domain Migration](https://istio.io/latest/docs/tasks/security/authorization/authz-td-migration/)

<br>

## 04-01-03. defaultConfig.proxyMetadata

### `BOOTSTRAP_XDS_AGENT`

**＊実装例＊**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        BOOTSTRAP_XDS_AGENT: "true"
```

> - [Istio / pilot-agent](https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars)

<br>

### `ENABLE_DEFERRED_CLUSTER_CREATION`

`pilot-discovery` コマンドでも設定できるため、そちらを参照せよ。

**＊実装例＊**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        ENABLE_DEFERRED_CLUSTER_CREATION: "true"
```

> - [Istio / pilot-agent](https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars)

<br>

### `EXCLUDE_UNSAFE_503_FROM_DEFAULT_RETRY`

デフォルトで `true` である。

`pilot-discovery` コマンドでも設定できるため、そちらを参照せよ。

**＊実装例＊**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        EXCLUDE_UNSAFE_503_FROM_DEFAULT_RETRY: "true"
```

> - [Istio / pilot-agent](https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars)
> - [Istio / Announcing Istio 1.24.0](https://istio.io/latest/news/releases/1.24.x/announcing-1.24/#improved-retries)

<br>

### `ENABLE_INBOUND_RETRY_POLICY`

デフォルトで `true` である。

`pilot-discovery` コマンドでも設定できるため、そちらを参照せよ。

**＊実装例＊**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        ENABLE_INBOUND_RETRY_POLICY: "true"
```

> - [Istio / pilot-agent](https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars)
> - [Istio / Announcing Istio 1.24.0](https://istio.io/latest/news/releases/1.24.x/announcing-1.24/#improved-retries)

<br>

### `EXIT_ON_ZERO_ACTIVE_CONNECTIONS`

![pod_terminating_process_istio-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/pod_terminating_process_istio-proxy.png)

デフォルト値は `false` である。

istio-proxy へのリクエストが無くなってから、Envoy のプロセスを終了する。

具体的には、`downstream_cx_active` メトリクスの値 (アクティブな接続数) を監視し、`0` になるまでドレイン処理を実行し続ける。

ドレイン処理の終了を待機する最小時間は、`MINIMUM_DRAIN_DURATION` で設定する。

istio-proxy の終了順序を調整する場合は、`.spec.containers[*].lifecycle.preStop.exec.command` キーに待機処理を設定する。

`.spec.containers[*].lifecycle.postStart.exec.command` キーへの自動設定は、`.mesh.defaultConfig.holdApplicationUntilProxyStarts` キーで対応する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        EXIT_ON_ZERO_ACTIVE_CONNECTIONS: "false"
```

> - [Istio / pilot-agent](https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars)
> - [ABEMA における GKE スケール戦略と Anthos Service Mesh 活用事例 Deep Dive - Speaker Deck](https://speakerdeck.com/nagapad/abema-niokeru-gke-scale-zhan-lue-to-anthos-service-mesh-huo-yong-shi-li-deep-dive?slide=80)

<br>

### `ISTIO_META_CERT_SIGNER`

デフォルトで `""` (空文字) である。

**＊実装例＊**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        ISTIO_META_CERT_SIGNER: ""
```

> - [Istio / pilot-agent](https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars)

<br>

### `ISTIO_META_DNS_AUTO_ALLOCATE`

デフォルト値は `false` である。

固定 IP アドレスが設定されていない ServiceEntry に、IP アドレスを動的に設定する。

`ISTIO_META_DNS_CAPTURE` を有効にしないと、`ISTIO_META_DNS_AUTO_ALLOCATE` は機能しない。

`PILOT_ENABLE_IP_AUTOALLOCATE` と同じであり、Istio 1.25 以降で、`PILOT_ENABLE_IP_AUTOALLOCATE` のほうが推奨になった。

**＊実装例＊**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        ISTIO_META_DNS_AUTO_ALLOCATE: "false"
```

```yaml
apiVersion: networking.istio.io/v1
kind: ServiceEntry
metadata:
  name: external-address
spec:
  hosts:
    - address.internal
  ports:
    - name: http
      number: 80
      protocol: HTTP
```

> - [Istio / pilot-agent](https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars)
> - [Istio / DNS Proxying](https://istio.io/latest/docs/ops/configuration/traffic-management/dns-proxy/#getting-started)
> - [Istio / Istio 1.25.0 Change Notes](https://istio.io/latest/news/releases/1.25.x/announcing-1.25/change-notes/#deprecation-notices)

<br>

### `ISTIO_META_DNS_CAPTURE`

デフォルト値は `false` である。

マイクロサービスからのリクエストに、Pod 内の istio-proxy や ztunnel プロキシを DNS プロキシとして使用できるようになる。

もし istio-proxy や ztunnel プロキシがドメインに紐づく IP アドレスのキャッシュを持つ場合、マイクロサービスにレスポンスを返信する。

一方でキャッシュを持たない場合、istio-proxy や ztunnel プロキシは宛先 Pod にリクエストを送信する。

なお、DNS キャッシュのドメインと IP アドレスを固定で紐付けることもできる。

> - [Istio / pilot-agent](https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars)
> - [Istio / DNS Proxying](https://istio.io/latest/docs/ops/configuration/traffic-management/dns-proxy)

#### ▼ 固定 (HTTP リクエスト)

ServiceEntry で HTTP リクエストを受信した場合、DNS キャッシュのドメインと IP アドレスを固定で紐づける。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        ISTIO_META_DNS_CAPTURE: "true"
```

```yaml
apiVersion: networking.istio.io/v1
kind: ServiceEntry
metadata:
  name: external-address
spec:
  hosts:
    - address.internal
  ports:
    - name: http
      number: 80
      protocol: HTTP
```

> - [Istio / DNS Proxying](https://istio.io/latest/docs/ops/configuration/traffic-management/dns-proxy/#dns-capture-in-action)

#### ▼ 動的 (HTTP リクエスト)

ServiceEntry で HTTP リクエストを受信した場合、DNS キャッシュのドメインと IP アドレスを動的に紐づける。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        ISTIO_META_DNS_CAPTURE: "true"
```

```yaml
apiVersion: networking.istio.io/v1
kind: ServiceEntry
metadata:
  name: external-address
spec:
  hosts:
    - address.internal
  addresses:
    - 198.51.100.1
  ports:
    - name: http
      number: 80
      protocol: HTTP
```

> - [Istio / DNS Proxying](https://istio.io/latest/docs/ops/configuration/traffic-management/dns-proxy/#address-auto-allocation)

#### ▼ 動的 (TCP 接続)

ServiceEntry で、TCP 接続として扱われるホストヘッダー持ち独自プロトコル (例：MySQL や Redis 以外の非対応プロトコルなど) を受信した場合、DNS キャッシュのドメインと IP アドレスを動的に紐づける。

注意点として、Istio Egress Gateway を経由して ServiceEntry に至る場合には、この設定が機能しない。

```
Pod ➡️ Istio Egress Gateway ➡️ ServiceEntry
```

Istio Ingress Gateway (厳密に言うと Gateway) は、独自プロトコルを TCP プロコトルとして扱う。

そのため、受信した独自プロトコルリクエストにホストヘッダーがあったとしても、これを宛先にフォワーディングできない。

宛先が独自プロトコルリクエストのポート番号だけで宛先 (例：ServiceEntry、外部サーバーなど) を決めてしまう。

同じポート番号で待ち受ける複数の ServiceEntry があると、`.spec.hosts` キーを設定していたとしても、誤ったほうの ServiceEntry を選ぶ可能性がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        ISTIO_META_DNS_CAPTURE: "true"
```

```yaml
apiVersion: networking.istio.io/v1
kind: ServiceEntry
metadata:
  name: aws-aurora-endpoint
spec:
  hosts:
    - <Amazon AuroraのDBクラスター名>.cluster-<id>.ap-northeast-1.rds.amazonaws.com
  ports:
    - name: cluster-endpoint
      number: 3306
      protocol: TCP
  resolution: DNS
---
apiVersion: networking.istio.io/v1
kind: ServiceEntry
metadata:
  name: aws-aurora-endpoint
spec:
  hosts:
    - <Amazon AuroraのDBクラスター名>.cluster-ro-<id>.ap-northeast-1.rds.amazonaws.com
  ports:
    - name: reader-endpoint
      number: 3306
      protocol: TCP
  resolution: DNS
```

> - [Istio / DNS Proxying](https://istio.io/latest/docs/ops/configuration/traffic-management/dns-proxy/#external-tcp-services-without-vips)
> - [Routing L4 Traffic Based on Host in Istio Gateway · istio/istio · Discussion #51942 · GitHub](https://github.com/istio/istio/discussions/51942#discussioncomment-9989752)
> - [【インターンレポート】Istioの導入によるKubernetesクラスタの可観測性の向上](https://engineering.linecorp.com/ja/blog/istio-introduction-improve-observability-of-ubernetes-clusters)

<br>

### `MINIMUM_DRAIN_DURATION`

![pod_terminating_process_istio-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/pod_terminating_process_istio-proxy.png)

デフォルト値は `5` である (対応する `.metadata.annotations.proxy.istio.io/config.terminationDrainDuration` キーと同じ) 。

`EXIT_ON_ZERO_ACTIVE_CONNECTIONS` 変数が `true` な場合にのみ設定できる。

`false` の場合は、代わりに `.metadata.annotations.proxy.istio.io/config.terminationDrainDuration` を設定する。

istio-proxy 内の Envoy プロセスは、終了時に接続のドレイン処理を実施する。

この接続について、ドレイン処理の終了を待機する最小時間を設定する。

`terminationDrainDuration` は固定時間でドレイン処理を終了する。一方、`MINIMUM_DRAIN_DURATION` は必要最低限の待機時間を設定し、`EXIT_ON_ZERO_ACTIVE_CONNECTIONS` によって `downstream_cx_active` メトリクスが 0 になるまでドレイン処理の終了を待機する。

`drainDuration` はリスナーやフィルターチェーンの変更時のドレイン待機時間を設定する。`MINIMUM_DRAIN_DURATION` は Envoy プロセスの終了時の最小待機時間を設定するため、用途が異なる。

**＊実装例＊**

Envoy プロセスが接続をドレインし終わるまで最低 `5` 秒間待機し、`downstream_cx_active` メトリクスが 0 になるまで終了を待機する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        MINIMUM_DRAIN_DURATION: "5s"
```

> - [ABEMA における GKE スケール戦略と Anthos Service Mesh 活用事例 Deep Dive - Speaker Deck](https://speakerdeck.com/nagapad/abema-niokeru-gke-scale-zhan-lue-to-anthos-service-mesh-huo-yong-shi-li-deep-dive?slide=80)
> - [terminate envoy when number of active connections is zero by ramaraochavali · Pull Request #35059 · istio/istio · GitHub](https://github.com/istio/istio/pull/35059#discussion_r711500175)

<br>

### `PILOT_ENABLE_IP_AUTOALLOCATE`

デフォルト値は `true` である。

`ISTIO_META_DNS_AUTO_ALLOCATE` と同じであり、Istio 1.25 以降で、`PILOT_ENABLE_IP_AUTOALLOCATE` のほうが推奨になった。

`ISTIO_META_DNS_CAPTURE` を有効にしないと、`PILOT_ENABLE_IP_AUTOALLOCATE` は機能しない。

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars)
> - [Istio / Istio 1.25.0 Change Notes](https://istio.io/latest/news/releases/1.25.x/announcing-1.25/change-notes/#deprecation-notices)

<br>

## 04-01-04. extensionProviders (認証／認可系)

### extensionProviders (認証／認可系) とは

AuthorizationPolicy による認可処理を外部の認可プロバイダーに委譲する。

> - [Istio / External Authorization](https://istio.io/latest/docs/tasks/security/authorization/authz-custom/)

<br>

### envoyExtAuthzHttp

#### ▼ envoyExtAuthzHttp とは

外部の認可プロバイダーへの通信に HTTP/1.1 プロトコルを使用する。

> - [Istio / External Authorization](https://istio.io/latest/docs/tasks/security/authorization/authz-custom/#define-the-external-authorizer)
> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider-EnvoyExternalAuthorizationHttpProvider)

#### ▼ OAuth2 Proxy の場合

OAuth2 Proxy を任意の認可プロバイダーの前段に置き、OAuth2 Proxy で認可プロバイダーを宛先に設定する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    extensionProviders:
      # 認可プロバイダーのエイリアス名を設定する
      - name: oauth2-proxy
        # 認可プロバイダーを設定する
        envoyExtAuthzHttp:
          service: oauth2-proxy.foo.svc.cluster.local
          port: 4180
          # HTTP リクエストに含めるヘッダー
          includeRequestHeadersInCheck:
            - cookie
            - authorization
```

AuthorizationPolicy で、認可処理を OAuth2 Proxy へ委譲できるようになる。

```yaml
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: oauth2-proxy-authorization-policy
  namespace: istio-system
spec:
  action: CUSTOM
  provider:
    name: oauth2-proxy
  rules:
    # ルールは外部の認可プロバイダーに定義されている
    - to:
        - operation:
            paths: ["/login"]
```

> - [\[Kuberntes\] 汎用OAuth2 Proxyをサービスの手前に置く：認証認可編](https://zenn.dev/takitake/articles/a91ea116cabe3c#istio%E3%81%AB%E5%A4%96%E9%83%A8%E8%AA%8D%E5%8F%AF%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%82%92%E7%99%BB%E9%8C%B2)
> - [\[Kuberntes\] 汎用OAuth2 Proxyをサービスの手前に置く：認証認可編](https://zenn.dev/takitake/articles/a91ea116cabe3c#%E5%BF%85%E8%A6%81%E3%81%AA%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%82%92%E4%BD%9C%E6%88%90-1)

#### ▼ Open Policy Agent の場合

Open Policy Agent を外部の認可プロバイダーとして設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    extensionProviders:
      # 認可プロバイダーのエイリアス名を設定する
      - name: open-policy-agent
        # 認可プロバイダーを設定する
        envoyExtAuthzHttp:
          service: open-policy-agent.foo.svc.cluster.local
          port: 9191
          # HTTP リクエストに含めるヘッダー
          includeRequestHeadersInCheck:
            - cookie
            - authorization
```

**実装例**

> - [Tutorial: Istio \| Open Policy Agent](https://www.openpolicyagent.org/docs/envoy/tutorial-istio#2-configure-the-mesh-to-define-the-external-authorizer)

#### ▼ Keycloak の場合

Keycloak は、ID プロバイダーとしてだけでなく認可プロバイダーとしても使用できる。

ただし、前段に OAuth2 Proxy を置くことが一般的である。

> - [\[Kuberntes\] 汎用OAuth2 Proxyをサービスの手前に置く：認証認可編](https://zenn.dev/takitake/articles/a91ea116cabe3c#istio%E3%81%AB%E5%A4%96%E9%83%A8%E8%AA%8D%E5%8F%AF%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%82%92%E7%99%BB%E9%8C%B2)
> - [\[Kuberntes\] 汎用OAuth2 Proxyをサービスの手前に置く：認証認可編](https://zenn.dev/takitake/articles/a91ea116cabe3c#%E5%BF%85%E8%A6%81%E3%81%AA%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%82%92%E4%BD%9C%E6%88%90-1)

<br>

### envoyExtAuthzGrpc

認可プロバイダーへの通信に HTTP/2 プロトコルを使用する。

<br>

## 04-01-05. extensionProviders (可観測系)

### extensionProviders (可観測系) とは

監視バックエンドの宛先情報を設定する。

プロバイダーによって、いずれのテレメトリーを送信するのかが異なる。

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider)

<br>

### datadog

#### ▼ datadog とは

datadog のトレースコンテキスト仕様 (datadog の独自仕様) でトレース ID とスパン ID を作成する。

datadog エージェントの宛先情報を Istio に登録する必要があるため、datadog エージェントの Pod をサービスメッシュ内に配置するか、サービスメッシュ外に配置して Istio Egress Gateway や ServiceEntry 経由で接続できるようにする。

ただ、datadog エージェントをサービスメッシュ内に配置すると、Telemetry リソースが datadog エージェント自体の分散トレースを作成してしまうため、メッシュ外に配置するべきである。

`.mesh.enableTracing` キーも有効化する必要がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    enableTracing: true
    extensionProviders:
      - name: datadog-http
        datadog:
          # datadog エージェントを宛先として設定する
          service: datadog-agent.foo-namespace.svc.cluster.local
          port: 8126
      - name: envoy-log
        envoyFileAccessLog:
          path: /dev/stdout
```

#### ▼ Telemetry の定義

Datadog に送信するためには、`.mesh.extensionProviders[*].datadog` キーに設定した宛先情報を使用して、Telemetry を定義する必要がある。

分散トレースの設定は以下の通りである。

```yaml
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  name: tracing-provider
  # サイドカーをインジェクションしている各 Namespace で作成する
  # もし istio-system を指定した場合は、istio-proxy コンテナのある全ての Namespace が対象になる
  namespace: foo
spec:
  # Datadog にスパンを送信させる Pod を設定する
  selector:
    matchLabels:
      name: app
  tracing:
    - providers:
        # mesh.extensionProviders[*].name キーで設定した名前
        - name: datadog-http
      randomSamplingPercentage: 100
```

アクセスログの設定は以下の通りである。

```yaml
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  name: access-log-provider
  # サイドカーをインジェクションしている各 Namespace で作成する
  # もし istio-system を指定した場合は、istio-proxy コンテナのある全ての Namespace が対象になる
  namespace: foo
spec:
  # Datadog にアクセスログを送信させる Pod を設定する
  selector:
    matchLabels:
      name: app
  # Envoy をアクセスログプロバイダーとして設定する
  accessLogging:
    - providers:
        # mesh.extensionProviders[*].name キーで設定した名前
        - name: envoy-log
```

> - [istio/operator/pkg/util/testdata/overlay-iop.yaml at 1.19.1 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.19.1/operator/pkg/util/testdata/overlay-iop.yaml#L26-L27)
> - https://docs.datadoghq.com/containers/docker/apm/?tab=linux#tracing-from-the-host
> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider-DatadogTracingProvider)
> - [Istio / Telemetry](https://istio.io/latest/docs/reference/config/telemetry/)

<br>

### opentelemetry

#### ▼ opentelemetry とは

OpenTelemetry のトレースコンテキスト仕様 (W3C Trace Context) でトレース ID とスパン ID を作成する。

OTLP 形式のエンドポイントであればよいため、OpenTelemetry Collector も指定できる。

OpenTelemetry Collector の宛先情報を Istio に登録する必要があるため、OpenTelemetry Collector の Pod をサービスメッシュ内に配置するか、サービスメッシュ外に配置して Istio Egress Gateway や ServiceEntry 経由で接続できるようにする。

ただ、OpenTelemetry Collector をサービスメッシュ内に配置すると、Telemetry リソースが OpenTelemetry Collector 自体の分散トレースを作成してしまうため、メッシュ外に配置するべきである。

`.mesh.enableTracing` キーも有効化する必要がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    enableTracing: true
    extensionProviders:
      - name: opentelemetry-grpc
        opentelemetry:
          # OpenTelemetry Collector を宛先として設定する
          service: opentelemetry-collector.foo-namespace.svc.cluster.local
          # gRPC 用のエンドポイントを設定する
          port: 4317
      - name: opentelemetry-http
        opentelemetry:
          # OpenTelemetry Collector を宛先として設定する
          service: opentelemetry-collector.foo-namespace.svc.cluster.local
          # HTTP 用のエンドポイントを設定する
          port: 4318
            http:
            # HTTP リクエストの場合はパスが必要である
            path: /v1/traces
      - name: envoy-log
        envoyFileAccessLog:
          path: /dev/stdout
```

#### ▼ Telemetry の定義

OpenTelemetry に送信するためには、`.mesh.extensionProviders[*].opentelemetry` キーに設定した宛先情報を使用して、Telemetry を定義する必要がある。

分散トレースの設定は以下の通りである。

```yaml
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  name: tracing-provider
  # サイドカーをインジェクションしている各 Namespace で作成する
  # もし istio-system を指定した場合は、istio-proxy コンテナのある全ての Namespace が対象になる
  namespace: foo
spec:
  # Opentelemetry にスパンを送信させる Pod を設定する
  selector:
    matchLabels:
      name: app
  tracing:
    - providers:
        # mesh.extensionProviders[*].name キーで設定した名前
        - name: opentelemetry-grpc
      randomSamplingPercentage: 100
```

アクセスログの設定は以下の通りである。

```yaml
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  name: access-log-provider
  # サイドカーをインジェクションしている各 Namespace で作成する
  # もし istio-system を指定した場合は、istio-proxy コンテナのある全ての Namespace が対象になる
  namespace: foo
spec:
  # OpenTelemetry にアクセスログを送信させる Pod を設定する
  selector:
    matchLabels:
      name: app
  # Envoy をアクセスログプロバイダーとして設定する
  accessLogging:
    - providers:
        # mesh.extensionProviders[*].name キーで設定した名前
        - name: envoy-log
```

> - [Istio / OpenTelemetry](https://istio.io/latest/docs/tasks/observability/logs/otel-provider/#enable-envoys-access-logging)
> - [istio/operator/pkg/util/testdata/overlay-iop.yaml at 1.19.1 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.19.1/operator/pkg/util/testdata/overlay-iop.yaml#L36-L37)
> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider-OpenTelemetryTracingProvider)
> - [Istio / Telemetry API](https://istio.io/latest/docs/tasks/observability/telemetry/#provider-selection)
> - [istio/samples/open-telemetry/tracing/telemetry.yaml at master · istio/istio · GitHub](https://github.com/istio/istio/blob/master/samples/open-telemetry/tracing/telemetry.yaml)
> - [Medium](https://itnext.io/debugging-microservices-on-k8s-with-istio-opentelemetry-and-tempo-4c36c97d6099.)
> - [Istio / Telemetry](https://istio.io/latest/docs/reference/config/telemetry/)

<br>

### prometheus

#### ▼ prometheus とは

Prometheus をメトリクスプロバイダーとして設定する。

宛先情報を設定する項目はなく、Prometheus が istio-proxy のメトリクスエンドポイントから収集する。

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider-PrometheusMetricsProvider)
> - [Istio / Telemetry](https://istio.io/latest/docs/reference/config/telemetry/)

<br>

### zipkin (jaeger)

#### ▼ zipkin (jaeger) とは

Zipkin のトレースコンテキスト仕様 (B3 コンテキスト) でトレース ID とスパン ID を作成する。

Jaeger は B3 をサポートしているため、Jaeger のクライアントとしても使用できる。

jaeger エージェントの宛先情報を Istio に登録する必要があるため、jaeger エージェントの Pod をサービスメッシュ内に配置するか、サービスメッシュ外に配置して Istio Egress Gateway や ServiceEntry 経由で接続できるようにする。

ただ、jaeger エージェントをサービスメッシュ内に配置すると、Telemetry リソースが jaeger エージェント自体の分散トレースを作成してしまうため、メッシュ外に配置するべきである。

`.mesh.enableTracing` キーも有効化する必要がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    enableTracing: true
    extensionProviders:
      - name: jaeger-http
        zipkin:
          # jaeger エージェントを宛先として設定する
          service: jaeger-agent.foo-namespace.svc.cluster.local
          port: 8126
      - name: envoy-log
        envoyFileAccessLog:
          path: /dev/stdout
```

Zipkin や Jaeger に送信するためには、`.mesh.extensionProviders[*].zipkin` キーに設定した宛先情報を使用して、Telemetry を定義する必要がある。

分散トレースの設定は以下の通りである。

```yaml
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  name: tracing-provider
  # サイドカーをインジェクションしている各 Namespace で作成する
  # もし istio-system を指定した場合は、istio-proxy コンテナのある全ての Namespace が対象になる
  namespace: foo
spec:
  # Datadog にスパンを送信させる Pod を設定する
  selector:
    matchLabels:
      name: app
  tracing:
    - providers:
        # mesh.extensionProviders[*].name キーで設定した名前
        - name: jaeger-http
      randomSamplingPercentage: 100
```

アクセスログの設定は以下の通りである。

```yaml
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  name: access-log-provider
  # サイドカーをインジェクションしている各 Namespace で作成する
  # もし istio-system を指定した場合は、istio-proxy コンテナのある全ての Namespace が対象になる
  namespace: foo
spec:
  # Zipkin や Jaeger にアクセスログを送信させる Pod を設定する
  selector:
    matchLabels:
      name: app
  # Envoy をアクセスログプロバイダーとして設定する
  accessLogging:
    - providers:
        # mesh.extensionProviders[*].name キーで設定した名前
        - name: envoy-log
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider)
> - https://discuss.istio.io/t/integrating-jaeger-tracing-using-telemetry-api/14759

<br>

### envoyFileAccessLog

#### ▼ envoyFileAccessLog とは

Envoy のアクセスログを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    extensionProviders:
      - name: envoy-grpc
        envoyFileAccessLog:
          logFormat:
            labels:
              access_log_type: '%ACCESS_LOG_TYPE%'
              bytes_received: '%BYTES_RECEIVED%'
              bytes_sent: '%BYTES_SENT%'
              downstream_transport_failure_reason: '%DOWNSTREAM_TRANSPORT_FAILURE_REASON%'
              downstream_remote_port: '%DOWNSTREAM_REMOTE_PORT%'
              duration: '%DURATION%'
              grpc_status: '%GRPC_STATUS(CAMEL_STRING)%'
              method: '%REQ(:METHOD)%'
              path: '%REQ(X-ENVOY-ORIGINAL-PATH?:PATH)%'
              protocol: '%PROTOCOL%'
              response_code: '%RESPONSE_CODE%'
              response_flags: '%RESPONSE_FLAGS%'
              start_time: '%START_TIME%'
              trace_id: '%TRACE_ID%'
              traceparent: '%REQ(TRACEPARENT)%'
              upstream_remote_port: '%UPSTREAM_REMOTE_PORT%'
              upstream_transport_failure_reason: '%UPSTREAM_TRANSPORT_FAILURE_REASON%'
              user_agent: '%REQ(USER-AGENT)%'
              x_forwarded_for: '%REQ(X-FORWARDED-FOR)%'
```

> - [Access logging — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#format-rules)

<br>

## 04-02-03. meshNetworks

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  meshNetworks: |
    networks:
        foo-cluster:
          endpoints:
            - fromCidr: "192.168.0.1/24"
          gateways:
            - address: 1.1.1.1
              port: 80
        bar-cluster:
          endpoints:
            - fromRegistry: reg1
          gateways:
            - registryServiceName: istio-ingressgateway.istio-system.svc.cluster.local
              port: 443
```

> - [Istio / Global Mesh Options](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshNetworks)

<br>

## 05. istio-sidecar-injector

### config

#### ▼ config とは

Istiod コントロールプレーン (`discovery` コンテナ) のため、Istio のサイドカーインジェクションの変数や patch 処理の内容を管理する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-sidecar-injector-<リビジョン>
  namespace: istio-system
data:
  config: |
    defaultTemplates: [sidecar]
    policy: enabled
    alwaysInjectSelector: []
    neverInjectSelector:[]
    injectedAnnotations:
    template: "{{ Template_Version_And_Istio_Version_Mismatched_Check_Installation }}"
    templates:
      sidecar: |
        # Helm のテンプレート
```

#### ▼ .templates.sidecar

istio-proxy コンテナの設定値を Helm テンプレートの状態で管理する。

Istio は、istio-sidecar-injector の `.values` キーを使用してテンプレートを動的に完成させる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-sidecar-injector-<リビジョン>
  namespace: istio-system
data:
  config: |
    templates:
      sidecar: |

        ... # Helm のテンプレート
```

> - [Istio / Installing the Sidecar](https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#customizing-injection)
> - [istio/pkg/kube/inject/inject.go at 1.20.3 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.20.3/pkg/kube/inject/inject.go#L303)

<br>

### values

istio-sidecar-injector の `.templates.sidecar` キーに出力する値を `values` ファイルとして管理する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-sidecar-injector-<リビジョン>
  namespace: istio-system
data:
  values: |
    { 
      global: { ... }
      revision: <リビジョン>
      sidecarInjectorWebhook: { ... }
    }
```

> - [CI for Istio Mesh](https://karlstoney.com/ci-for-istio-mesh/)
> - [Istio 導入への道 – sidecar の調整編](https://blog.1q77.com/2020/03/istio-part12/)

<br>

## 06. pilot-discovery コマンドの環境変数

### `CITADEL_SELF_SIGNED_CA_CERT_TTL`

Istio コントロールプレーンが自身を署名するオレオレ証明書の有効期限を設定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    spec:
      containers:
        - name: discovery
          env:
            - name: CITADEL_SELF_SIGNED_CA_CERT_TTL
              value: 87600h0m0s
```

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars)

<br>

### `CITADEL_SELF_SIGNED_ROOT_CERT_CHECK_INTERVAL`

Istio コントロールプレーンのオレオレ証明書の検証間隔を設定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    spec:
      containers:
        - name: discovery
          env:
            - name: CITADEL_SELF_SIGNED_ROOT_CERT_CHECK_INTERVAL
              value: 1h0m0s
```

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars)

<br>

### `CLUSTER_ID`

Istiod のサービスレジストリを設定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    spec:
      containers:
        - name: discovery
          env:
            - name: CLUSTER_ID
              value: Kubernetes
```

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars)

<br>

### `DEFAULT_WORKLOAD_CERT_TTL`

istio-proxy の証明書の有効期限を設定する。

最大値は `MAX_WORKLOAD_CERT_TTL` (90 日) で決まっている。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    spec:
      containers:
        - name: discovery
          env:
            - name: DEFAULT_WORKLOAD_CERT_TTL
              value: 24h0m0s
```

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars)

<br>

### `ENABLE_DEFERRED_CLUSTER_CREATION`

デフォルト値は `true` である。

リクエストがある場合にのみ、Envoy のクラスターを作成する。

実際に使用されていない Envoy のクラスターを作成しないことにより、ハードウェアリソースを節約できる。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    spec:
      containers:
        - name: discovery
          env:
            - name: ENABLE_DEFERRED_CLUSTER_CREATION
              value: "true"
```

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars)

<br>

### `ENABLE_DEFERRED_STATS_CREATION`

デフォルト値は `true` である。

Envoy の統計情報を遅延初期化する。

ハードウェアリソースを節約できる。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    spec:
      containers:
        - name: discovery
          env:
            - name: ENABLE_DEFERRED_STATS_CREATION
              value: "true"
```

> - [Bootstrap (proto) — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/bootstrap/v3/bootstrap.proto#config-bootstrap-v3-bootstrap-deferredstatoptions)
> - [Lazy Initialization](https://martinfowler.com/bliki/LazyInitialization.html)

<br>

### `ENABLE_ENHANCED_RESOURCE_SCOPING`

デフォルト値は `true` である。

`meshConfig.discoverySelectors` キーを使用できるようにする。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    spec:
      containers:
        - name: discovery
          env:
            - name: ENABLE_ENHANCED_RESOURCE_SCOPING
              value: "true"
```

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars)

<br>

### `ENABLE_ENHANCED_DESTINATIONRULE_MERGE`

デフォルト値は `true` である。

複数の DestinationRule で `.spec.exportTo` キーの対象の Namespace が同じ場合、これらの設定をマージして処理する。

もし対象の Namespace が異なる場合、独立した設定として処理する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    spec:
      containers:
        - name: discovery
          env:
            - name: ENABLE_ENHANCED_DESTINATIONRULE_MERGE
              value: "true"
```

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars)

<br>

### `ENABLE_INBOUND_RETRY_POLICY`

デフォルト値は `true` である。

istio-proxy がインバウンド通信をマイクロサービスに送信するときのリトライ (執筆時点 2025/02/26 では `reset-before-request` のみ) を設定する。

今後は、宛先 istio-proxy がマイクロサービスに対してリトライできるようになる。

istio-proxy 間の問題の切り分けがしやすくなる。

`false` の場合、送信元 istio-proxy から宛先 istio-proxy へ通信時、送信元 istio-proxy しかリトライできない。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    spec:
      containers:
        - name: discovery
          env:
            - name: ENABLE_INBOUND_RETRY_POLICY
              value: "true"
```

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars)
> - [Istio / Announcing Istio 1.24.0](https://istio.io/latest/news/releases/1.24.x/announcing-1.24/#improved-retries)

<br>

### `EXCLUDE_UNSAFE_503_FROM_DEFAULT_RETRY`

デフォルト値は `true` である。

POST リクエストの結果で、マイクロサービスから `503` ステータスが返信された場合、未処理とは限らない。

この場合にリトライすると結果的に二重で処理が実行されてしまう。

そのため、マイクロサービスから `503` ステータスが返信された場合は、リトライしないようにする。

なおこの問題は、`reset` によるリトライでも起こりうるため、`reset` もデフォルトから外れている。

リトライの結果で istio-proxy が `503` レスポンスを返信する場合とは区別する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    spec:
      containers:
        - name: discovery
          env:
            - name: EXCLUDE_UNSAFE_503_FROM_DEFAULT_RETRY
              value: "true"
```

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars)
> - [Istio / Announcing Istio 1.24.0](https://istio.io/latest/news/releases/1.24.x/announcing-1.24/#improved-retries)
> - [Retry Policies in Istio](https://karlstoney.com/retry-policies-in-istio/)

<br>

### `PILOT_TRACE_SAMPLING`

分散トレースの収集率を設定する。

基本的には `100`% (値は `1`) を設定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    spec:
      containers:
        - name: discovery
          env:
            - name: PILOT_TRACE_SAMPLING
              value: 1
```

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars)

<br>

### `PILOT_CERT_PROVIDER`

istio-proxy に設定するサーバー証明書のプロバイダーを設定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    spec:
      containers:
        - name: discovery
          env:
            - name: PILOT_CERT_PROVIDER
              value: istiod
```

| 設定値       | 説明                                                      |
| ------------ | --------------------------------------------------------- |
| `istiod`     | Istiod が提供するサーバー証明書を使用する。               |
| `kubernetes` | Kubernetes の Secret で管理するサーバー証明書を使用する。 |
| `none`       | サーバー証明書を使用しない。                              |

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars)

<br>

### `PILOT_ENABLE_MYSQL_FILTER`

Envoy の `mysql_proxy` を有効化し、MySQL のメトリクスを収集できるようにする。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    spec:
      containers:
        - name: discovery
          env:
            - name: PILOT_ENABLE_MYSQL_FILTER
              value: "true"
```

`proxyStatsMatcher` でも設定が必要である。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyStatsMatcher:
        inclusionRegexps:
          - ".*mysql.*"
```

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#pilot-enable-mysql-filter)
> - [MySQL proxy — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/listeners/network_filters/mysql_proxy_filter#statistics)

<br>

### `PILOT_ENABLE_REDIS_FILTER`

Envoy の `redis_proxy` を有効化し、Redis のメトリクスを収集できるようにする。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    spec:
      containers:
        - name: discovery
          env:
            - name: PILOT_ENABLE_REDIS_FILTER
              value: "true"
```

`proxyStatsMatcher` でも設定が必要である。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-<リビジョン>
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyStatsMatcher:
        inclusionRegexps:
          - ".*redis.*"
```

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#pilot-enable-mysql-filter)
> - [Redis proxy — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/listeners/network_filters/redis_proxy_filter)

<br>

### `PILOT_JWT_PUB_KEY_REFRESH_INTERVAL`

アクセストークンの検証の間隔を設定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    spec:
      containers:
        - name: discovery
          env:
            - name: PILOT_JWT_PUB_KEY_REFRESH_INTERVAL
              value: 20m0s
```

> - [Istio / pilot-discovery](https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars)

<br>
