---
title: 【IT技術の知見】ConfigMap系＠リソース定義
description: ConfigMap系＠リソース定義の知見を記録しています。
---

# ConfigMap系＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 専用ConfigMap

Istioの各コンポーネントの機密でない変数やファイルを管理する。

<br>

## 02 istio-ca-root-cert

### istio-ca-root-certとは

Istiodコントロールプレーン (`discovery`コンテナ) による中間認証局を使用する場合、`istio-ca-root-cert`を自動的に作成する。

ルート認証局から発行されたCA証明書 (ルート証明書) をもち、各マイクロサービスのPodにマウントされる。

各マイクロサービスに配布された証明書を検証するために使用される。

Istioコントロールプレーンのログから、CA証明書の作成を確認できる。

```bash
2025-01-26T11:21:09.391516Z	info	initializing Istiod DNS certificates host: istiod-1-24-2.istio-system.svc, custom host:
2025-01-29T11:43:03.694183Z	info	Generating istiod-signed cert for [istio-pilot.istio-system.svc istiod-1-24-2.istio-system.svc istiod-remote.istio-system.svc istiod.istio-system.svc]:

-----BEGIN CERTIFICATE-----
*****
-----END CERTIFICATE-----


```

![istio_istio-ca-root-cert](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_istio-ca-root-cert.png)

> - https://zufardhiyaulhaq.com/Replacing-Istio-CA-certificate/
> - https://training.linuxfoundation.cn/news/407
> - https://developers.redhat.com/articles/2023/08/24/integrate-openshift-service-mesh-cert-manager-and-vault#default_and_pluggable_ca_scenario

<br>

### root-cert.pem

#### ▼ root-cert.pemとは

CA証明書 (ルート証明書) を設定する。

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: istio-ca-root-cert
  namespace: app # マイクロサービスのNamespace
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

## 04. istio-mesh-cm (istio-<バージョン値>)

### istio-mesh-cmとは

Istiodコントロールプレーン (`discovery`コンテナ) のため、全てのistio-proxyにグローバルに設定する変数を管理する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    ...
  meshNetworks: |
    ...
```

代わりに、IstioOperatorの`.spec.meshConfig`キーで定義することもできるが、これは非推奨である。

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

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig

<br>

## 04-01. mesh

### accessLogEncoding

#### ▼ accessLogEncodingとは

istio-proxyで作成するアクセスログのファイル形式を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    accessLogEncoding: JSON
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-AccessLogEncoding

<br>

### accessLogFile

#### ▼ accessLogFileとは

istio-proxyで作成するアクセスログの出力先を設定する。

設定しないと、Envoyはアクセスログを出力しない。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    accessLogFile: /dev/stdout
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig
> - https://github.com/istio/istio/issues/11938#issuecomment-465938259

<br>

### caCertificates

#### ▼ caCertificatesとは

ルート認証局のCA証明書や、中間認証局名を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        ISTIO_META_CERT_SIGNER: istio-system
    caCertificates:
        # ルート認証局のCA証明書 
      - pem: |
          Ci0tLS0tQk...
        # 中間認証局名
        certSigners:
          - clusterissuers.cert-manager.io/istio-system
          - clusterissuers.cert-manager.io/foo
          - clusterissuers.cert-manager.io/bar
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-CertificateData
> - https://istio.io/latest/docs/tasks/security/cert-management/custom-ca-k8s/#deploy-istio-with-default-cert-signer-info
> - https://istio.io/latest/docs/ops/integrations/certmanager/

<br>

### discoverySelectors

#### ▼ discoverySelectorsとは

`ENHANCED_RESOURCE_SCOPING`を有効化し、IstiodコントロールプレーンがwatchするNamespaceを限定する。
Istiodは全てのNamespaceをwatchするが、特定のNamespaceのみをwatchするようにできる。

これは、サイドカーをインジェクションする`istio.io/rev`キーよりも強い影響力がある。

例えば、サイドカーをインジェクションしているNamespaceのみをwatchすることにより、Istiodコントロールプレーンの負荷を下げられる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    discoverySelectors:
      - matchLabels:
          istio.io/rev: default
```

> - https://istio.io/latest/news/releases/1.22.x/announcing-1.22/upgrade-notes/#default-value-of-the-feature-flag-enhanced_resource_scoping-to-true
> - https://github.com/istio/api/blob/v1.22.1/mesh/v1alpha1/config.proto#L1252-L1274

#### ▼ REGISTRY_ONLY

サービスメッシュ外へのリクエストの宛先を`BlackHoleCluster` (`502 Bad Gateway`で通信負荷) として扱う。

また、ServiceEntryとして登録した宛先には固有の名前がつく。

サービスメッシュ外への通信のたびにServiceEntryを作成しなければならず、少しめんどくさくなる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    outboundTrafficPolicy:
      mode: REGISTRY_ONLY
```

> - https://istio.io/latest/docs/tasks/traffic-management/egress/egress-control/#envoy-passthrough-to-external-services
> - https://istiobyexample.dev/monitoring-egress-traffic/

<br>

### defaultHttpRetryPolicy

#### ▼ defaultHttpRetryPolicyとは

リトライポリシーのデフォルト値を設定する。

ただし、`.spec.http[*].retries.perTryTimeout`キーは各VirtualServiceで設定する必要がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultHttpRetryPolicy: 
      attempts: 3
      retryOn: connect-failure,deadline-exceeded,refused-stream,unavailable
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-default_http_retry_policy

#### ▼ アウトバウンド通信時のリトライ条件

istio-proxyのアウトバウンド通信時リトライ条件は以下である。

宛先に通信が届いておらず、リトライすると問題が解決する可能性があるステータスコードは、リトライしてもよい。

- リトライすると解決する可能性がある
- リクエストを繰り返しても状態が変わらずに冪等性がある (二重処理にならない) がある

`503`と`reset`によるリトライは冪等性に問題があり、設定に注意が必要である。

![istio_inbound-retry_reset](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_inbound-retry_reset.png)

| HTTP/1.1、HTTP/2のステータスコード                                       | マイクロサービスに通信が届いている | リトライが有効 | リトライ条件                                                                                                                                                             |
| ------------------------------------------------------------------------ | :--------------------------------: | :------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `connect-failure`                                                        |                 ⭕️                 |       ✅       | マイクロサービスからのアウトバウンド通信時、接続タイムアウト (Connection timeout) が起こった場合に、リトライを実行する。                                                 |
| `gateway-error`                                                          |                 ⭕️                 |                | マイクロサービスからのアウトバウンド通信時、Gateway系ステータスコード (`502`、`503`、`504`) が返信された場合に、リトライを実行する。冪性がない可能性がある。             |
| `retriable-status-codes` (`5xx`のように任意のステータスコードを設定する) |                 ⭕️                 |                | マイクロサービスからのアウトバウンド通信時、指定したHTTPステータスであった場合に、リトライを実行する。冪等性がない可能性がある。                                         |
| `reset`                                                                  |                 ⭕️                 |                | マイクロサービスからのアウトバウンド通信時、接続切断／接続リセット／読み取りタイムアウト (Read timeout) が起こった場合に、リトライを実行する。冪等性がない可能性がある。 |

> - https://cloud.google.com/storage/docs/retry-strategy?hl=ja#retryable
> - https://github.com/istio/istio/issues/51704#issuecomment-2188555136
> - https://github.com/istio/istio/issues/35774#issuecomment-953877524
> - https://cloud.google.com/storage/docs/retry-strategy?hl=ja

| HTTP/2のステータスコード | マイクロサービスに通信が届いている | リトライが有効 | リトライ条件                                                                                                                                                                                      |
| ------------------------ | :--------------------------------: | :------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cancelled`              |                 ⭕️                 |                | **マイクロサービスからのアウトバウンド**通信時、gRPCステータスコードが`Cancelled`であった場合に、リトライを実行する。送信元がリクエストを切断しているため、リトライするべきではない可能性がある。 |
| `deadline-exceeded`      |                 ⭕️                 |       ✅       | マイクロサービスからアウトバウンド通信時、gRPCステータスコードが`DeadlineExceeded`であった場合に、リトライを実行する。                                                                            |
| `refused-stream`         |                 ⭕️                 |       ✅       | 同時接続上限数を超過するストリームをマイクロサービスが作成しようとした場合に、リトライを実行する。                                                                                                |
| `resource-exhausted`     |                 ⭕️                 |       ✅       | マイクロサービスからのアウトバウンド通信時、gRPCステータスコードが`ResourceExhausted`であった場合に、リトライを実行する。                                                                         |
| `unavailable`            |                 ⭕️                 |       ✅       | マイクロサービスからのアウトバウンド通信時、マイクロサービスにリクエストをフォワーディングできなかった場合に、リトライを実行する。                                                                |

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#x-envoy-retry-on
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#x-envoy-retry-grpc-on

#### ▼ インバウンド通信時のリトライ条件

istio-proxyのインバウンド通信時のリトライ条件は以下である。

執筆時点 (2025/02/26) では、`ENABLE_INBOUND_RETRY_POLICY`変数を`true` (デフォルト値) にすると使用できる。

| HTTP/1.1のステータスコード | マイクロサービスに通信が届いている | 冪等性がある | 理由                                                                                                 |
| -------------------------- | :--------------------------------: | :----------: | ---------------------------------------------------------------------------------------------------- |
| `reset-before-request`     |                 ×                  |      ✅      | マイクロサービスへのインバウンド通信時、マイクロサービスにリクエストをフォワーディングできなかった。 |

<br>

### defaultProviders

#### ▼ defaultProvidersとは

`extensionProviders`キーで定義したもののうち、デフォルトで使用するプロバイダーを設定する。

Telemetryで自動的に選択される、

Envoyを使用してアクセスログを収集する場合、`.mesh.defaultProviders.accessLogging`キーには何も設定しなくてよい。

また、Istioがデフォルトで用意している分散トレースツールを使用する場合も同様に不要である。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
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
          # OpenTelemetry Collectorを宛先として設定する
          service: opentelemetry-collector.foo-namespace.svc.cluster.local
          # gRPC用のエンドポイントを設定する
          port: 4317
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-DefaultProviders

Envoyのアクセスログの場合、代わりに`.mesh.accessLogEncoding`キーと`.mesh.accessLogFile`キーを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    accessLogEncoding: JSON
    accessLogFile: /dev/stdout
```

分散トレースの場合、代わりに`.mesh.enableTracing`キーと`.mesh.extensionProviders`キーを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
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

#### ▼ enablePrometheusMergeとは

マイクロサービスとistio-proxyをマージするかどうかを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    enablePrometheusMerge: true
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/

<br>

### enableTracing

#### ▼ enableTracingとは

istio-proxyでトレースIDとスパンIDを作成するか否かを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    enableTracing: true
```

> - https://istio.io/latest/docs/tasks/observability/distributed-tracing/mesh-and-proxy-config/#available-tracing-configurations
> - https://istio.io/latest/docs/ops/integrations/jaeger/
> - https://istio.io/latest/docs/ops/integrations/zipkin/#option-2-customizable-install
> - https://zenn.dev/riita10069/articles/service-mesh

<br>

### inboundClusterStatName

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    inboundClusterStatName: inbound|%SERVICE_PORT%|%SERVICE_PORT_NAME%|%SERVICE_FQDN%
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-inbound_cluster_stat_name

<br>

### ingressSelector

#### ▼ ingressSelectorとは

全てのistio-proxyに関して、使用するGatewayの`.metadata.labels.istio`キーの値を設定する。

デフォルトでは、Ingressとして`ingressgateway`が設定される。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    ingressSelector: ingressgateway
```

<br>

### ingressService

#### ▼ ingressServiceとは

全てのistio-proxyに関して、使用するIngress Controllerの`.metadata.labels.istio`キーの値を設定する。

デフォルトでは、Ingressとして`ingressgateway`が設定される。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    ingressService: ingressgateway
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig

<br>

### proxyHttpPort

#### ▼ proxyHttpPortとは

全てのistio-proxyに関して、Cluster外からのインバウンド通信 (特にHTTPプロトコル) を待ち受けるポート番号を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    proxyHttpPort: 80
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig

<br>

### outboundClusterStatName

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    outboundClusterStatName: outbound|%SERVICE_PORT%|%%SUBSET_NAME%%|%SERVICE_FQDN%
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-outbound_cluster_stat_name

<br>

### outboundTrafficPolicy

#### ▼ outboundTrafficPolicyとは

サービスメッシュ外へのリクエストの宛先の種類 (`PassthroughCluster`、`BlackHoleCluster`) を設定する。

#### ▼ ALLOW_ANY (デフォルト)

サービスメッシュ外へのリクエストの宛先を`PassthroughCluster`として扱う。

また、ServiceEntryとして登録した宛先には固有の名前がつく。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    outboundTrafficPolicy:
      mode: ALLOW_ANY
```

> - https://istio.io/latest/docs/tasks/traffic-management/egress/egress-control/#envoy-passthrough-to-external-services
> - https://istiobyexample.dev/monitoring-egress-traffic/
> - https://discuss.istio.io/t/setting-outboundtrafficpolicy-mode-in-configmap/7041/3

#### ▼ ALLOW_ANYの注意点

サービスメッシュ外の "クラスター外" の宛先であれば、`ALLOW_ANY`のため接続可能である (Kiali上は PassthroughClusterという表記) 。

一方で、サービスメッシュ外の "クラスター内" であると、Istioリソースで宛先を登録する必要がある。

方法として、以下がある。

- OpenTelemetry Collectorをサービスメッシュ内に置いて、VirtualServiceを作成する
- 〃 をサービスメッシュ外に置いて、ServiceEntryを作成する

<br>

### proxyListenPort

#### ▼ proxyListenPortとは

全てのistio-proxyに関して、他マイクロサービスからのインバウンド通信を待ち受けるポート番号を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    proxyListenPort: 80
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig

<br>

## 04-01-02. defaultConfig

### defaultConfigとは

Istioの全てのコンポーネントに適用する変数のデフォルト値を設定する。

他にProxyConfig (と思ったが、ProxyConfigのドキュメントに載っていない設定は無理みたい) 、Podの`.metadata.annotations.proxy.istio.io/config`キーでも設定できる。

ProxyConfigが最優先であり、これらの設定はマージされる。

`.meshConfig.defaultConfig`キーにデフォルト値を設定しておき、ProxyConfigでNamespaceやマイクロサービスPodごとに上書きするのがよい。

3つの箇所で設定できる。

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
# APIがまだ用意されておらず、現状は設定できない
apiVersion: networking.istio.io/v1beta1
kind: ProxyConfig
metadata:
  name: foo-proxyconfig
spec:
  discoveryAddress: istiod:15012
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig
> - https://github.com/istio/api/blob/master/networking/v1beta1/proxy_config.proto

<br>

### controlPlaneAuthPolicy

データプレーン (istio-proxy) とコントロールプレーン間の通信に相互TLS認証を実施する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
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
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      discoveryAddress: istiod-<リビジョン番号>.istio-system.svc:15012
```

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ProxyConfig
metadata:
  name: foo-proxyconfig
spec:
  discoveryAddress: istiod-<リビジョン番号>.istio-system.svc:15012
```

<br>

### drainDuration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
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

Envoyのアクセスログを、標準出力に出力するのではなく宛先 (例：レシーバー) に送信する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    enableEnvoyAccessLogService: true
    defaultConfig:
      envoyAccessLogService: 
        address: <Envoyのアクセスログの宛先Service名>:15000
        # Istioコントロールプレーンをルート認証局とする
        tlsSettings: ISTIO_MUTUAL
        # TCP KeepAliveを実施する
        tcpKeepalive:
          probes: 9
          time: 2
          interval: 75
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#RemoteService
> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig-envoy_access_log_service

<br>

### envoyMetricsService

Envoyのメトリクスを、Prometheusにスクレイピングしてもらうのではなく宛先 (例：レシーバー) に送信する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    # enableEnvoyMetricsService: true という設定がありそうだが、ドキュメントに記載がない
    defaultConfig:
      envoyMetricsService: 
        address: <Envoyのメトリクスの宛先Service名>:15000
        # Istioコントロールプレーンをルート認証局とする
        tlsSettings: ISTIO_MUTUAL
        # TCP KeepAliveを実施する
        tcpKeepalive:
          probes: 9
          time: 2
          interval: 75
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#RemoteService
> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig-envoy_metrics_service

<br>

### holdApplicationUntilProxyStarts

istio-proxyが、必ずマイクロサービスよりも先に起動するか否かを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
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

> - https://www.zhaohuabing.com/istio-guide/docs/best-practice/startup-dependence/#%E8%A7%A3%E8%80%A6%E5%BA%94%E7%94%A8%E6%9C%8D%E5%8A%A1%E4%B9%8B%E9%97%B4%E7%9A%84%E5%90%AF%E5%8A%A8%E4%BE%9D%E8%B5%96%E5%85%B3%E7%B3%BB
> - https://engineering.linecorp.com/ja/blog/istio-introduction-improve-observability-of-ubernetes-clusters

オプションを有効化すると、istio-proxyの`.spec.containers[*].lifecycle.postStart.exec.command`キーに、`pilot-agent -wait`コマンドが挿入される。

`.spec.containers[*].lifecycle.preStop.exec.command`キーへの自動設定は、`EXIT_ON_ZERO_ACTIVE_CONNECTIONS`変数で対応する。

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

> - https://www.zhaohuabing.com/istio-guide/docs/best-practice/startup-dependence/#%E4%B8%BA%E4%BB%80%E4%B9%88%E9%9C%80%E8%A6%81%E9%85%8D%E7%BD%AE-sidecar-%E5%92%8C%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%E7%9A%84%E5%90%AF%E5%8A%A8%E9%A1%BA%E5%BA%8F

<br>

### image

istio-proxyのコンテナイメージのタイプを設定する。

これは、ConfigMapではなくProxyConfigでも設定できる。

`distroless`型を選ぶと、istio-proxyにログインできなくなり、より安全なイメージになる。

一方で、デバッグしにくくなる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      image:
        imageType: distroless
```

`istio-cni`でも、Helmチャートで別に設定すれば、`distroless`型を選べる。

> - https://istio.io/latest/docs/reference/config/networking/proxy-config/#ProxyImage
> - https://cloud.google.com/service-mesh/docs/enable-optional-features-in-cluster?hl=ja#distroless_proxy_image
> - https://istio.io/latest/docs/ops/configuration/security/harden-docker-images/

<br>

### privateKeyProvider

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      privateKeyProvider:
```

<br>

### proxyHeaders

デフォルト値は`true`である。

`x-envoy`ヘッダーを有効化するか否かを設定する。

例えば、接続プール上限超過によるサーキットブレイカーが起こったことを示す`x-envoy-overloaded`ヘッダーがある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyHeaders:
        envoyDebugHeaders: 
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

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig-proxy_headers
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#http-headers-consumed-from-downstreams
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/headers

<br>

### proxyMetadata

istio-proxyに環境変数を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
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
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      rootNamespace: istio-system
```

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ProxyConfig
metadata:
  name: foo-proxyconfig
spec:
  rootNamespace: istio-system
```

<br>

### tracing (非推奨)

いずれのトレース仕様 (例：Zipkin、Datadog、LightStepなど) でトレースIDとスパンIDを作成するかを設定する。

ZipkinとJaegerはトレースコンテキスト仕様が同じであるため、zipkinパッケージをJaegerのクライアントとしても使用できる。

`.mesh.defaultConfig.enableTracing`キーも有効化する必要がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      enableTracing: true
      tracing:
        sampling: 100
        zipkin:
          address: "jaeger-collector.observability:9411"
```

ただし、非推奨であるため`extensionProviders`キーを使用した方が良い

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      tracing: {}
    extensionProviders:
      ...
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#Tracing

<br>

### tracingServiceName

スパンの`service.name`属性の値を設定する。

マイクロサービスがバージョニングされている場合、マイクロサービスの正式名 (canonical-name) でグループ化できる。

デフォルトでは`APP_LABEL_AND_NAMESPACE`であり、`<Namespace>.<appラベル値>`になる。

appラベルがないマイクロサービスのために、canonical名に基づく`CANONICAL_NAME_AND_NAMESPACE`を使用した方が良い。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
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

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig-TracingServiceName
> - https://istio.io/latest/docs/reference/config/labels/#ServiceCanonicalName

<br>

### trustDomain

相互TLS認証を採用している場合、送信元として許可する信頼ドメインを設定する。

例えば、信頼ドメインはServiceAccountごとに異なる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      trustDomain: cluster.local
```

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ProxyConfig
metadata:
  name: foo-proxyconfig
spec:
  trustDomain: cluster.local
```

> - https://istio.io/latest/docs/tasks/security/authorization/authz-td-migration/

<br>

## 04-01-03. defaultConfig.proxyMetadata

### `BOOTSTRAP_XDS_AGENT`

**＊実装例＊**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        BOOTSTRAP_XDS_AGENT: "true"
```

> - https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars

<br>

### `ENABLE_DEFERRED_CLUSTER_CREATION`

`pilot-discovery`コマンドでも設定できるため、そちらを参照せよ。

**＊実装例＊**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        ENABLE_DEFERRED_CLUSTER_CREATION: "true"
```

> - https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars

<br>

### `EXCLUDE_UNSAFE_503_FROM_DEFAULT_RETRY`

デフォルトで`true`である。

`pilot-discovery`コマンドでも設定できるため、そちらを参照せよ。

**＊実装例＊**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        EXCLUDE_UNSAFE_503_FROM_DEFAULT_RETRY: "true"
```

> - https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars
> - https://istio.io/latest/news/releases/1.24.x/announcing-1.24/#improved-retries

<br>

### `ENABLE_INBOUND_RETRY_POLICY`

デフォルトで`true`である。

`pilot-discovery`コマンドでも設定できるため、そちらを参照せよ。

**＊実装例＊**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        ENABLE_INBOUND_RETRY_POLICY: "true"
```

> - https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars
> - https://istio.io/latest/news/releases/1.24.x/announcing-1.24/#improved-retries

<br>

### `EXIT_ON_ZERO_ACTIVE_CONNECTIONS`

![pod_terminating_process_istio-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/pod_terminating_process_istio-proxy.png)

デフォルト値は`false`である。

istio-proxyへのリクエストが無くなってから、Envoyのプロセスを終了する。

具体的には、`downstream_cx_active`メトリクスの値 (アクティブな接続数) を監視し、`0`になるまでドレイン処理を実行し続ける。

ドレイン処理前の待機時間は、`MINIMUM_DRAIN_DURATION`で設定する。

オプションを有効化すると、istio-proxyの`.spec.containers[*].lifecycle.preStop.exec.command`キーに、`sleep`コマンドが自動で挿入される。

`.spec.containers[*].lifecycle.postStart.exec.command`キーへの自動設定は、`.mesh.defaultConfig.holdApplicationUntilProxyStarts`キーで対応する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        EXIT_ON_ZERO_ACTIVE_CONNECTIONS: "false"
```

> - https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars
> - https://speakerdeck.com/nagapad/abema-niokeru-gke-scale-zhan-lue-to-anthos-service-mesh-huo-yong-shi-li-deep-dive?slide=80

<br>

### `ISTIO_META_CERT_SIGNER`

デフォルトで`""` (空文字) である。

**＊実装例＊**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        ISTIO_META_CERT_SIGNER: ""
```

> - https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars

<br>

### `ISTIO_META_DNS_AUTO_ALLOCATE`

デフォルト値は`false`である。

固定IPアドレスが設定されていないServiceEntryに対して、IPアドレスを動的に設定する。

`ISTIO_META_DNS_CAPTURE`を有効にしないと、`ISTIO_META_DNS_AUTO_ALLOCATE`は機能しない。

`PILOT_ENABLE_IP_AUTOALLOCATE`と同じであり、Istio 1.25以降で、`PILOT_ENABLE_IP_AUTOALLOCATE`の方が推奨になった。

**＊実装例＊**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
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

> - https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars
> - https://istio.io/latest/docs/ops/configuration/traffic-management/dns-proxy/#getting-started
> - https://istio.io/latest/news/releases/1.25.x/announcing-1.25/change-notes/#deprecation-notices

<br>

### `ISTIO_META_DNS_CAPTURE`

デフォルト値は`false`である。

マイクロサービスからのリクエストに、Pod内のistio-proxyやztunnelプロキシをDNSプロキシとして使用できるようになる。

もしistio-proxyやztunnelプロキシがドメインに紐づくIPアドレスのキャッシュを持つ場合、マイクロサービスにレスポンスを返信する。

一方でキャッシュを持たない場合、istio-proxyやztunnelプロキシは宛先Podにリクエストを送信する。

なお、DNSキャッシュのドメインとIPアドレスを固定で紐付けることもできる。

> - https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars
> - https://istio.io/latest/docs/ops/configuration/traffic-management/dns-proxy

#### ▼ 固定 (HTTPリクエスト)

ServiceEntryでHTTPリクエストを受信した場合、DNSキャッシュのドメインとIPアドレスを固定で紐づける。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
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

> - https://istio.io/latest/docs/ops/configuration/traffic-management/dns-proxy/#dns-capture-in-action

#### ▼ 動的 (HTTPリクエスト)

ServiceEntryでHTTPリクエストを受信した場合、DNSキャッシュのドメインとIPアドレスを動的に紐づける。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
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

> - https://istio.io/latest/docs/ops/configuration/traffic-management/dns-proxy/#address-auto-allocation

#### ▼ 動的 (TCP接続)

ServiceEntryで、TCP接続として扱われるホストヘッダー持ち独自プロトコル (例：MySQLやRedis以外の非対応プロトコルなど) を受信した場合、DNSキャッシュのドメインとIPアドレスを動的に紐づける。

注意点として、Istio Egress Gatewayを経由してServiceEntryに至る場合には、この設定が機能しない。

```
Pod ➡️ Istio Egress Gateway ➡️ ServiceEntry
```

Istio Ingress Gateway (厳密に言うとGateway) は、独自プロトコルをTCPプロコトルとして扱う。

そのため、受信した独自プロトコルリクエストにホストヘッダーがあったとしても、これを宛先にフォワーディングできない。

宛先が独自プロトコルリクエストのポート番号だけで宛先 (例：ServiceEntry、外部サーバーなど) を決めてしまう。

同じポート番号で待ち受ける複数のServiceEntryがあると、`.spec.hosts`キーを設定していたとしても、誤った方のServiceEntryを選ぶ可能性がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
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
    - <AWS AuroraのDBクラスター名>.cluster-<id>.ap-northeast-1.rds.amazonaws.com
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
    - <AWS AuroraのDBクラスター名>.cluster-ro-<id>.ap-northeast-1.rds.amazonaws.com
  ports:
    - name: reader-endpoint
      number: 3306
      protocol: TCP
  resolution: DNS
```

> - https://istio.io/latest/docs/ops/configuration/traffic-management/dns-proxy/#external-tcp-services-without-vips
> - https://github.com/istio/istio/discussions/51942#discussioncomment-9989752
> - https://engineering.linecorp.com/ja/blog/istio-introduction-improve-observability-of-ubernetes-clusters

<br>

### `MINIMUM_DRAIN_DURATION`

![pod_terminating_process_istio-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/pod_terminating_process_istio-proxy.png)

デフォルト値は`5`である (対応する`.metadata.annotations.proxy.istio.io/config.terminationDrainDuration`キーと同じ) 。

`EXIT_ON_ZERO_ACTIVE_CONNECTIONS`変数が`true`な場合にのみ設定できる。

`false`の場合は、代わりに`.metadata.annotations.proxy.istio.io/config.terminationDrainDuration`を設定する。

istio-proxy内のEnvoyプロセスは、終了時に接続のドレイン処理を実施する。

この接続のドレイン処理前の待機時間を設定する。

`terminationDrainDuration`との違いとして、`MINIMUM_DRAIN_DURATION`の時間だけ待機した後、ドレイン処理を開始し、`EXIT_ON_ZERO_ACTIVE_CONNECTIONS`によって`downstream_cx_active`メトリクスが0になるまでドレイン処理をし続ける点である。

Podの`.metadata.annotations.proxy.istio.io/config.drainDuration`キーで起こるレースコンディションを解決するための設定で、同じ値を設定するとよい。

**＊実装例＊**

Envoyプロセスの接続のドレイン処理前に`5`秒間に待機し、`downstream_cx_active`メトリクスが0になるまでドレイン処理を続ける。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyMetadata:
        MINIMUM_DRAIN_DURATION: "5s"
```

> - https://speakerdeck.com/nagapad/abema-niokeru-gke-scale-zhan-lue-to-anthos-service-mesh-huo-yong-shi-li-deep-dive?slide=80
> - https://github.com/istio/istio/pull/35059#discussion_r711500175

<br>

### `PILOT_ENABLE_IP_AUTOALLOCATE`

デフォルト値は`true`である。

`ISTIO_META_DNS_AUTO_ALLOCATE`と同じであり、Istio 1.25以降で、`PILOT_ENABLE_IP_AUTOALLOCATE`の方が推奨になった。

`ISTIO_META_DNS_CAPTURE`を有効にしないと、`PILOT_ENABLE_IP_AUTOALLOCATE`は機能しない。

> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars
> - https://istio.io/latest/news/releases/1.25.x/announcing-1.25/change-notes/#deprecation-notices

<br>

## 04-01-04. extensionProviders (認証／認可系)

### extensionProviders (認証／認可系) とは

AuthorizationPolicyによる認可処理を外部の認可プロバイダーに委譲する。

> - https://istio.io/latest/docs/tasks/security/authorization/authz-custom/

<br>

### envoyExtAuthzHttp

#### ▼ envoyExtAuthzHttpとは

外部の認可プロバイダーへの通信にHTTP/1.1プロトコルを使用する。

> - https://istio.io/latest/docs/tasks/security/authorization/authz-custom/#define-the-external-authorizer
> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider-EnvoyExternalAuthorizationHttpProvider

#### ▼ OAuth2 Proxyの場合

OAuth2 Proxyを任意の認可プロバイダーの前段に置き、OAuth2 Proxyで認可プロバイダーを宛先に設定する。

**＊実装例＊**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    extensionProviders:
      - name: OAuth2 Proxy
        envoyExtAuthzHttp:
          service: oauth2-proxy.foo-namespace.svc.cluster.local
          port: 80
        includeHeadersInCheck:
          - cookie
          - authorization
```

AuthorizationPolicyで、認可処理をOAuth2 Proxyに委譲できるようになる。

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

> - https://zenn.dev/takitake/articles/a91ea116cabe3c#istio%E3%81%AB%E5%A4%96%E9%83%A8%E8%AA%8D%E5%8F%AF%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%82%92%E7%99%BB%E9%8C%B2
> - https://zenn.dev/takitake/articles/a91ea116cabe3c#%E5%BF%85%E8%A6%81%E3%81%AA%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%82%92%E4%BD%9C%E6%88%90-1

#### ▼ OpenAgent Policyの場合

OpenAgent Policyを外部の認可プロバイダーとして設定する。

**実装例**

> - https://www.openpolicyagent.org/docs/latest/envoy-tutorial-istio/#2-configure-the-mesh-to-define-the-external-authorizer

#### ▼ Keycloakの場合

Keycloakは、IDプロバイダーとしてだけでなく認可プロバイダーとしても使用できる。

ただし、前段にOAuth2 Proxyを置くことが一般的である。

> - https://zenn.dev/takitake/articles/a91ea116cabe3c#istio%E3%81%AB%E5%A4%96%E9%83%A8%E8%AA%8D%E5%8F%AF%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%82%92%E7%99%BB%E9%8C%B2
> - https://zenn.dev/takitake/articles/a91ea116cabe3c#%E5%BF%85%E8%A6%81%E3%81%AA%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%82%92%E4%BD%9C%E6%88%90-1

<br>

### envoyExtAuthzGrpc

認可プロバイダーへの通信にHTTP/2プロトコルを使用する。

<br>

## 04-01-05. extensionProviders (可観測系)

### extensionProviders (可観測系) とは

監視バックエンドの宛先情報を設定する。

プロバイダーによって、いずれのテレメトリーを送信するのかが異なる。

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider

<br>

### datadog

#### ▼ datadogとは

datadogのトレースコンテキスト仕様 (datadogの独自仕様) でトレースIDとスパンIDを作成する。

datadogエージェントの宛先情報をIstioに登録する必要があるため、これのPodをサービスメッシュ内に配置するか、サービスメッシュ外に配置してIstio Egress GatewayやServiceEntry経由で接続できるようにする。

ただ、datadogエージェントをサービスメッシュ内に配置すると、Telemetryリソースがdatadogエージェント自体の分散トレースを作成してしまうため、メッシュ外に配置するべきである。

`.mesh.enableTracing`キーも有効化する必要がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    enableTracing: true
    extensionProviders:
      - name: datadog-http
        datadog:
          # datadogエージェントを宛先として設定する
          service: datadog-agent.foo-namespace.svc.cluster.local
          port: 8126
      - name: envoy-log
        envoyFileAccessLog
```

#### ▼ Telemetryの定義

Datadogに送信するためには、`.mesh.extensionProviders[*].datadog`キーに設定した宛先情報を使用して、Telemetryを定義する必要がある。

分散トレースの設定は以下の通りである。

```yaml
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  name: tracing-provider
  # サイドカーをインジェクションしている各Namespaceで作成する
  # もしistio-systemを指定した場合は、istio-proxyコンテナのある全てのNamespaceが対象になる
  namespace: foo
spec:
  # Datadogにスパンを送信させるPodを設定する
  selector:
    matchLabels:
      name: app
  tracing:
    - providers:
        # mesh.extensionProviders[*].nameキーで設定した名前
        - name: datadog-http
      randomSamplingPercentage: 100
```

アクセスログの設定は以下の通りである。

```yaml
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  name: access-log-provider
  # サイドカーをインジェクションしている各Namespaceで作成する
  # もしistio-systemを指定した場合は、istio-proxyコンテナのある全てのNamespaceが対象になる
  namespace: foo
spec:
  # Datadogにアクセスログを送信させるPodを設定する
  selector:
    matchLabels:
      name: app
  # Envoyをアクセスログプロバイダーとして設定する
  accessLogging:
    - providers:
        # mesh.extensionProviders[*].nameキーで設定した名前
        - name: envoy-log
```

> - https://github.com/istio/istio/blob/1.19.1/operator/pkg/util/testdata/overlay-iop.yaml#L26-L27
> - https://docs.datadoghq.com/containers/docker/apm/?tab=linux#tracing-from-the-host
> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider-DatadogTracingProvider
> - https://istio.io/latest/docs/reference/config/telemetry/

<br>

### opentelemetry

#### ▼ opentelemetryとは

OpenTelemetryのトレースコンテキスト仕様 (W3C Trace Context) でトレースIDとスパンIDを作成する。

OTLP形式のエンドポイントであればよいため、OpenTelemetry Collectorも指定できる。

OpenTelemetry Collectorの宛先情報をIstioに登録する必要があるため、これのPodをサービスメッシュ内に配置するか、サービスメッシュ外に配置してIstio Egress GatewayやServiceEntry経由で接続できるようにする。

ただ、OpenTelemetry Collectorをサービスメッシュ内に配置すると、TelemetryリソースがOpenTelemetry Collector自体の分散トレースを作成してしまうため、メッシュ外に配置するべきである。

`.mesh.enableTracing`キーも有効化する必要がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    enableTracing: true
    extensionProviders:
      - name: opentelemetry-grpc
        opentelemetry:
          # OpenTelemetry Collectorを宛先として設定する
          service: opentelemetry-collector.foo-namespace.svc.cluster.local
          # gRPC用のエンドポイントを設定する
          port: 4317
      - name: opentelemetry-http
        opentelemetry:
          # OpenTelemetry Collectorを宛先として設定する
          service: opentelemetry-collector.foo-namespace.svc.cluster.local
          # HTTP用のエンドポイントを設定する
          port: 4318
            http:
            # HTTPリクエストの場合はパスが必要である
            path: /v1/traces
      - name: envoy-log
        envoyFileAccessLog:
          path: /dev/stdout
```

#### ▼ Telemetryの定義

OpenTelemetryに送信するためには、`.mesh.extensionProviders[*].opentelemetry`キーに設定した宛先情報を使用して、Telemetryを定義する必要がある。

分散トレースの設定は以下の通りである。

```yaml
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  name: tracing-provider
  # サイドカーをインジェクションしている各Namespaceで作成する
  # もしistio-systemを指定した場合は、istio-proxyコンテナのある全てのNamespaceが対象になる
  namespace: foo
spec:
  # Opentelemetryにスパンを送信させるPodを設定する
  selector:
    matchLabels:
      name: app
  tracing:
    - providers:
        # mesh.extensionProviders[*].nameキーで設定した名前
        - name: opentelemetry-grpc
      randomSamplingPercentage: 100
```

アクセスログの設定は以下の通りである。

```yaml
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  name: access-log-provider
  # サイドカーをインジェクションしている各Namespaceで作成する
  # もしistio-systemを指定した場合は、istio-proxyコンテナのある全てのNamespaceが対象になる
  namespace: foo
spec:
  # OpenTelemetryにアクセスログを送信させるPodを設定する
  selector:
    matchLabels:
      name: app
  # Envoyをアクセスログプロバイダーとして設定する
  accessLogging:
    - providers:
        # mesh.extensionProviders[*].nameキーで設定した名前
        - name: envoy-log
```

> - https://istio.io/latest/docs/tasks/observability/logs/otel-provider/#enable-envoys-access-logging
> - https://github.com/istio/istio/blob/1.19.1/operator/pkg/util/testdata/overlay-iop.yaml#L36-L37
> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider-OpenTelemetryTracingProvider
> - https://istio.io/latest/docs/tasks/observability/telemetry/#provider-selection
> - https://github.com/istio/istio/blob/master/samples/open-telemetry/tracing/telemetry.yaml
> - https://itnext.io/debugging-microservices-on-k8s-with-istio-opentelemetry-and-tempo-4c36c97d6099.
> - https://istio.io/latest/docs/reference/config/telemetry/

<br>

### prometheus

#### ▼ prometheusとは

メトリクスの監視バックエンドとするPrometheusの宛先情報を設定する。

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider-PrometheusMetricsProvider
> - https://istio.io/latest/docs/reference/config/telemetry/

<br>

### zipkin (jaeger)

#### ▼ zipkin (jaeger) とは

Zipkinのトレースコンテキスト仕様 (B3コンテキスト) でトレースIDとスパンIDを作成する。

JaegerはB3をサポートしているため、Jaegerのクライアントとしても使用できる。

jaegerエージェントの宛先情報をIstioに登録する必要があるため、これのPodをサービスメッシュ内に配置するか、サービスメッシュ外に配置してIstio Egress GatewayやServiceEntry経由で接続できるようにする。

ただ、jaegerエージェントをサービスメッシュ内に配置すると、Telemetryリソースがjaegerエージェント自体の分散トレースを作成してしまうため、メッシュ外に配置するべきである。

`.mesh.enableTracing`キーも有効化する必要がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    enableTracing: true
    extensionProviders:
      - name: jaeger-http
        jaeger:
          # jaegerエージェントを宛先として設定する
          service: jaeger-agent.foo-namespace.svc.cluster.local
          port: 8126
      - name: envoy-log
        envoyFileAccessLog:
          path: /dev/stdout
```

ZipkinやJaegerに送信するためには、`.mesh.extensionProviders[*].zipkin`キーに設定した宛先情報を使用して、Telemetryを定義する必要がある。

分散トレースの設定は以下の通りである。

```yaml
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  name: tracing-provider
  # サイドカーをインジェクションしている各Namespaceで作成する
  # もしistio-systemを指定した場合は、istio-proxyコンテナのある全てのNamespaceが対象になる
  namespace: foo
spec:
  # Datadogにスパンを送信させるPodを設定する
  selector:
    matchLabels:
      name: app
  tracing:
    - providers:
        # mesh.extensionProviders[*].nameキーで設定した名前
        - name: jaeger-http
      randomSamplingPercentage: 100
```

アクセスログの設定は以下の通りである。

```yaml
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  name: access-log-provider
  # サイドカーをインジェクションしている各Namespaceで作成する
  # もしistio-systemを指定した場合は、istio-proxyコンテナのある全てのNamespaceが対象になる
  namespace: foo
spec:
  # ZipkinやJaegerにアクセスログを送信させるPodを設定する
  selector:
    matchLabels:
      name: app
  # Envoyをアクセスログプロバイダーとして設定する
  accessLogging:
    - providers:
        # mesh.extensionProviders[*].nameキーで設定した名前
        - name: envoy-log
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider
> - https://discuss.istio.io/t/integrating-jaeger-tracing-using-telemetry-api/14759

<br>

### envoyFileAccessLog

#### ▼ envoyFileAccessLogとは

Envoyのアクセスログを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
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

> - https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#format-rules

<br>

## 04-02-03. meshNetworks

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
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

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshNetworks

<br>

## 05. istio-sidecar-injector

### config

#### ▼ configとは

Istiodコントロールプレーン (`discovery`コンテナ) のため、Istioのサイドカーインジェクションの変数やpatch処理の内容を管理する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-sidecar-injector-<リビジョン番号>
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
        # Helmのテンプレート
```

#### ▼ .templates.sidecar

istio-proxyコンテナの設定値をHelmテンプレートの状態で管理する。

Istioは、istio-sidecar-injectorの`.values`キーを使用してテンプレートを動的に完成させる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-sidecar-injector-<リビジョン番号>
  namespace: istio-system
data:
  config: |
    templates:
      sidecar: |

        ... # Helmのテンプレート
```

> - https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#customizing-injection
> - https://github.com/istio/istio/blob/1.20.3/pkg/kube/inject/inject.go#L303

<br>

### values

istio-sidecar-injectorの`.templates.sidecar`キーに出力する値を`values`ファイルとして管理する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-sidecar-injector-<リビジョン番号>
  namespace: istio-system
data:
  values: |
    { 
      global: { ... }
      revision: <リビジョン番号>
      sidecarInjectorWebhook: { ... }
    }
```

> - https://karlstoney.com/ci-for-istio-mesh/
> - https://blog.1q77.com/2020/03/istio-part12/

<br>

## 06. pilot-discoveryコマンド

### `CITADEL_SELF_SIGNED_CA_CERT_TTL`

Istioコントロールプレーンが自身を署名するオレオレ証明書の有効期限を設定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    containers:
      - name: discovery
        env:
          - name: CITADEL_SELF_SIGNED_CA_CERT_TTL
            value: 87600h0m0s
```

> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars

<br>

### `CITADEL_SELF_SIGNED_ROOT_CERT_CHECK_INTERVAL`

Istioコントロールプレーンのオレオレ証明書の検証間隔を設定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    containers:
      - name: discovery
        env:
          - name: CITADEL_SELF_SIGNED_ROOT_CERT_CHECK_INTERVAL
            value: 1h0m0s
```

> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars

<br>

### `CLUSTER_ID`

Istiodのサービスレジストリを設定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    containers:
      - name: discovery
        env:
          - name: CLUSTER_ID
            value: Kubernetes
```

> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars

<br>

### `DEFAULT_WORKLOAD_CERT_TTL`

istio-proxyの証明書の有効期限を設定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    containers:
      - name: discovery
        env:
          - name: DEFAULT_WORKLOAD_CERT_TTL
            value: 24h0m0s
```

> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars

<br>

### `ENABLE_DEFERRED_CLUSTER_CREATION`

デフォルト値は`true`である。

リクエストがある場合にのみ、Envoyのクラスターを作成する。

実際に使用されていないEnvoyのクラスターを作成しないことにより、ハードウェアリソースを節約できる。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    containers:
      - name: discovery
        env:
          - name: ENABLE_DEFERRED_CLUSTER_CREATION
            value: "true"
```

> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars

<br>

### `ENABLE_DEFERRED_STATS_CREATION`

デフォルト値は`true`である。

Envoyの統計情報を遅延初期化する。

ハードウェアリソースを節約できる。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    containers:
      - name: discovery
        env:
          - name: ENABLE_DEFERRED_STATS_CREATION
            value: "true"
```

> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/bootstrap/v3/bootstrap.proto#config-bootstrap-v3-bootstrap-deferredstatoptions
> - https://martinfowler.com/bliki/LazyInitialization.html

<br>

### `ENABLE_ENHANCED_RESOURCE_SCOPING`

デフォルト値は`true`である。

`meshConfig.discoverySelectors`キーを使用できるようにする。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    containers:
      - name: discovery
        env:
          - name: ENABLE_ENHANCED_RESOURCE_SCOPING
            value: "true"
```

> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars

<br>

### `ENABLE_ENHANCED_DESTINATIONRULE_MERGE`

デフォルト値は`true`である。

複数のDestinationRuleで`.spec.exportTo`キーの対象のNamespaceが同じ場合、これらの設定をマージして処理する。

もし対象のNamespaceが異なる場合、独立した設定として処理する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    containers:
      - name: discovery
        env:
          - name: ENABLE_ENHANCED_DESTINATIONRULE_MERGE
            value: "true"
```

> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars

<br>

### `ENABLE_INBOUND_RETRY_POLICY`

デフォルト値は`true`である。

istio-proxyがインバウンド通信をマイクロサービスに送信するときのリトライ (執筆時点2025/02/26では`reset-before-request`のみ) を設定する。

今後は、宛先istio-proxyがマイクロサービスに対してリトライできるようになる。

istio-proxy間の問題の切り分けがしやすくなる。

`false`の場合、送信元istio-proxyから宛先istio-proxyへ通信時、送信元istio-proxyしかリトライできない。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    containers:
      - name: discovery
        env:
          - name: ENABLE_INBOUND_RETRY_POLICY
            value: "true"
```

> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars
> - https://istio.io/latest/news/releases/1.24.x/announcing-1.24/#improved-retries

<br>

### `EXCLUDE_UNSAFE_503_FROM_DEFAULT_RETRY`

デフォルト値は`true`である。

POSTリクエストの結果で、マイクロサービスから`503`ステータスが返信された場合、未処理とは限らない。

この場合にリトライすると結果的に二重で処理が実行されてしまう。

そのため、マイクロサービスから`503`ステータスが返信された場合は、リトライしないようにする。

なおこの問題は、`reset`によるリトライでも起こりうるため、`reset`もデフォルトから外れている。

リトライの結果でistio-proxyが`503`ステータスを返信する場合とは区別する。

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

> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars
> - https://istio.io/latest/news/releases/1.24.x/announcing-1.24/#improved-retries
> - https://karlstoney.com/retry-policies-in-istio/

<br>

### `PILOT_TRACE_SAMPLING`

分散トレースの収集率を設定する。

基本的には`100`% (値は`1`) を設定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    containers:
      - name: discovery
        env:
          - name: PILOT_TRACE_SAMPLING
            value: 1
```

> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars

<br>

### `PILOT_CERT_PROVIDER`

istio-proxyに設定するSSLサーバー証明書のプロバイダーを設定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: istiod
  namespace: istio-system
spec:
  template:
    containers:
      - name: discovery
        env:
          - name: PILOT_CERT_PROVIDER
            value: istiod
```

| 設定値       | 説明                                                      |
| ------------ | --------------------------------------------------------- |
| `istiod`     | Istiodが提供するSSLサーバー証明書を使用する。             |
| `kubernetes` | KubernetesのSecretで管理するSSLサーバー証明書を使用する。 |
| `none`       | SSLサーバー証明書を使用しない。                           |

> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars

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
    containers:
      - name: discovery
        env:
          - name: PILOT_JWT_PUB_KEY_REFRESH_INTERVAL
            value: 20m0s
```

> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars

<br>
