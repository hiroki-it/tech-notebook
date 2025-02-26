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

Istiodコントロールプレーン (`discovery`コンテナ) による中間認証局を使用する場合に、`istio-ca-root-cert`を自動的に作成する。

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
  AMBIENT_ENABLED: true
  AMBIENT_DNS_CAPTURE: false
  AMBIENT_IPV6: true
  CHAINED_CNI_PLUGIN: true
  EXCLUDED_NAMESPACES: kube-system
  REPAIR_ENABLED: true
  REPAIR_LABEL_PODS: false
  REPAIR_DELETE_PODS: false
  REPAIR_REPAIR_PODS: true
  REPAIR_INIT_CONTAINER_NAME: istio-validation
  REPAIR_BROKEN_POD_LABEL_KEY: cni.istio.io/uninitialized
  REPAIR_BROKEN_POD_LABEL_VALUE: true
```

<br>

## 04. istio-mesh-cm (istio-<バージョン値>)

### istio-mesh-cmとは

Istiodコントロールプレーン (`discovery`コンテナ) のため、全ての`istio-proxy`コンテナにグローバルに設定する変数を管理する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
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

### accessLogEncoding

#### ▼ accessLogEncodingとは

`istio-proxy`コンテナで作成するアクセスログのファイル形式を設定する。

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

`istio-proxy`コンテナで作成するアクセスログの出力先を設定する。

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

### defaultConfig

#### ▼ defaultConfigとは

Istioの全てのコンポーネントに適用する変数のデフォルト値を設定する。

他にProxyConfigの`.spec.environmentVariables`キー、Podの`.metadata.annotations.proxy.istio.io/config`キーでも設定できる。

ProxyConfigが最優先であり、これらの設定はマージされる。

`.meshConfig.defaultConfig`キーにデフォルト値を設定しておき、ProxyConfigでNamespaceやマイクロサービスPodごとに上書きするのがよい。

```yaml
meshConfig:
  defaultConfig:
    discoveryAddress: istiod:15012
```

```yaml
annotations:
  proxy.istio.io/config: |
    discoveryAddress: istiod:15012
```

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ProxyConfig
metadata:
  name: foo-proxyconfig
spec:
  discoveryAddress: istiod:15012
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig

#### ▼ discoveryAddress

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

#### ▼ enablePrometheusMerge

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      enablePrometheusMerge: true
```

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ProxyConfig
metadata:
  name: foo-proxyconfig
spec:
  enablePrometheusMerge: true
```

#### ▼ holdApplicationUntilProxyStarts

`istio-proxy`コンテナが、必ずアプリコンテナよりも先に起動するか否かを設定する。

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

オプションを有効化すると、`istio-proxy`コンテナの`.spec.containers[*].lifecycle.postStart.exec.command`キーに、`pilot-agent -wait`コマンドが挿入される。

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

#### ▼ image

`istio-proxy`コンテナのコンテナイメージのタイプを設定する。

これは、ConfigMapではなくProxyConfigでも設定できる。

`distroless`型を選ぶと、`istio-proxy`コンテナにログインできなくなり、より安全なイメージになる。

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

#### ▼ proxyMetadata

`istio-proxy`コンテナに環境変数を設定する。

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

#### ▼ defaultHttpRetryPolicy

`.spec.http[*].retries.perTryTimeout`キーは個別のVirtualServiceで設定する必要がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      defaultHttpRetryPolicy: 
        attempts: 3
        retryOn: connect-failure,refused-stream,unavailable,cancelled,reset-before-request
```

> - https://istio.io/latest/news/releases/1.24.x/announcing-1.24/#improved-retries
> - https://github.com/istio/istio/issues/51704#issuecomment-2188555136
> - https://karlstoney.com/retry-policies-in-istio/

#### ▼ rootNamespace

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

#### ▼ tracing (非推奨)

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

#### ▼ trustDomain

相互TLSを採用している場合に、送信元として許可する信頼ドメインを設定する。

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

### defaultProviders

#### ▼ defaultProvidersとは

`extensionProviders`キーで定義したもののうち、デフォルトで使用するプロバイダーを設定する。

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

アプリケーションのメトリクスを`istio-proxy`コンテナを介して取得できるようにする (マージする) かどうかを設定する。

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/

<br>

### enableTracing

#### ▼ enableTracingとは

`istio-proxy`コンテナでトレースIDとスパンIDを作成するか否かを設定する。

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

### extensionProviders (認証/認可系)

#### ▼ 認証/認可系

SSOの認証フェーズの委譲先となるIDプロバイダーの宛先情報を設定する。

#### ▼ envoyExtAuthzHttp

認可エンドポイントにHTTPで認可リクエストを送信する場合に、SSOのIDプロバイダーの情報を設定する。

AuthorizationPolicyによる認可の実施に、認可フェーズを外部のIDプロバイダーに委譲できるようにする。

**＊実装例＊**

OAuth2 ProxyのPodに紐づくServiceを識別できるようにする。

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

AuthorizationPolicyで、認可フェーズの委譲先のIDプロバイダーを設定できるようになる。

ここでは、OAuth2 ProxyをIDプロバイダーとして使用する。

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
    - to:
        - operation:
            paths: ["/login"]
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider
> - https://zenn.dev/takitake/articles/a91ea116cabe3c#istio%E3%81%AB%E5%A4%96%E9%83%A8%E8%AA%8D%E5%8F%AF%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%82%92%E7%99%BB%E9%8C%B2
> - https://zenn.dev/takitake/articles/a91ea116cabe3c#%E5%BF%85%E8%A6%81%E3%81%AA%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%82%92%E4%BD%9C%E6%88%90-1
> - https://istio.io/latest/docs/tasks/security/authorization/authz-custom/#define-the-external-authorizer

#### ▼ envoyExtAuthzGrpc

認可エンドポイントにHTTPで認可リクエストを送信する場合に、SSOのIDプロバイダーの情報を設定する。

<br>

### extensionProviders (可観測系)

#### ▼ 可観測性系とは

監視バックエンドの宛先情報を設定する。

プロバイダーによって、いずれのテレメトリーを送信するのかが異なる。

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider

#### ▼ datadog

datadogのトレースコンテキスト仕様 (datadogの独自仕様) でトレースIDとスパンIDを作成する。

datadogエージェントの宛先情報をIstioに登録する必要があるため、これのPodをサービスメッシュ内に配置するか、サービスメッシュ外に配置してIstio EgressGatewayやServiceEntry経由で接続できるようにする。

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

#### ▼ opentelemetry

OpenTelemetryのトレースコンテキスト仕様 (W3C Trace Context) でトレースIDとスパンIDを作成する。

OTLP形式のエンドポイントであればよいため、OpenTelemetry Collectorも指定できる。

OpenTelemetry Collectorの宛先情報をIstioに登録する必要があるため、これのPodをサービスメッシュ内に配置するか、サービスメッシュ外に配置してIstio EgressGatewayやServiceEntry経由で接続できるようにする。

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
            # HTTPの場合はパスが必要である
            path: /v1/traces
      - name: envoy-log
        envoyFileAccessLog:
          path: /dev/stdout
```

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

#### ▼ prometheus

メトリクスの監視バックエンドとするPrometheusの宛先情報を設定する。

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider-PrometheusMetricsProvider
> - https://istio.io/latest/docs/reference/config/telemetry/

#### ▼ zipkin (jaeger)

Zipkinのトレースコンテキスト仕様 (B3コンテキスト) でトレースIDとスパンIDを作成する。

JaegerはB3をサポートしているため、Jaegerのクライアントとしても使用できる。

jaegerエージェントの宛先情報をIstioに登録する必要があるため、これのPodをサービスメッシュ内に配置するか、サービスメッシュ外に配置してIstio EgressGatewayやServiceEntry経由で接続できるようにする。

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

#### ▼ envoyFileAccessLog

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

### ingressSelector

#### ▼ ingressSelectorとは

全ての`istio-proxy`コンテナに関して、使用するGatewayの`.metadata.labels.istio`キーの値を設定する。

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

全ての`istio-proxy`コンテナに関して、使用するIngress Controllerの`.metadata.labels.istio`キーの値を設定する。

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

全ての`istio-proxy`コンテナに関して、Cluster外からのインバウンド通信 (特にHTTPプロトコル) を待ち受けるポート番号を設定する。

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

### proxyListenPort

#### ▼ proxyListenPortとは

全ての`istio-proxy`コンテナに関して、他アプリコンテナからのインバウンド通信を待ち受けるポート番号を設定する。

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

## 06. 環境変数

### pilot-discoveryコマンド

#### ▼ `CITADEL_SELF_SIGNED_CA_CERT_TTL`

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

#### ▼ `CITADEL_SELF_SIGNED_ROOT_CERT_CHECK_INTERVAL`

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

#### ▼ `CLUSTER_ID`

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

#### ▼ `DEFAULT_WORKLOAD_CERT_TTL`

`istio-proxy`コンテナの証明書の有効期限を設定する。

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

#### ▼ `ENABLE_DEFERRED_CLUSTER_CREATION`

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
            value: true
```

> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars

#### ▼ `ENABLE_DEFERRED_STATS_CREATION`

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
            value: true
```

> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/bootstrap/v3/bootstrap.proto#config-bootstrap-v3-bootstrap-deferredstatoptions
> - https://martinfowler.com/bliki/LazyInitialization.html

#### ▼ `ENABLE_ENHANCED_RESOURCE_SCOPING`

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
            value: true
```

> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars

#### ▼ `ENABLE_ENHANCED_DESTINATIONRULE_MERGE`

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
            value: true
```

> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars

#### ▼ `ENABLE_INBOUND_RETRY_POLICY`

デフォルト値は`true`である。

`istio-proxy`コンテナがインバウンド通信をアプリコンテナに送信するときの再試行を設定する。

今後は、宛先`istio-proxy`コンテナがアプリコンテナに対してリトライできるようになる。

`istio-proxy`コンテナ間の問題の切り分けがしやすくなる。

`false`の場合、送信元`istio-proxy`コンテナから宛先`istio-proxy`コンテナへ通信時に、送信元`istio-proxy`コンテナしかリトライできない。

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
            value: true
```

> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars
> - https://istio.io/latest/news/releases/1.24.x/announcing-1.24/#improved-retries

#### ▼ `EXCLUDE_UNSAFE_503_FROM_DEFAULT_RETRY`

デフォルト値は`true`である。

POSTリクエストの結果で、アプリコンテナから`503`ステータスが返信された場合に、未処理とは限らない。

この場合に再試行すると結果的に二重で処理が実行されてしまう。

そのため、アプリコンテナから`503`ステータスが返信された場合は、再試行しないようにする。

なお、再試行の結果で`istio-proxy`コンテナが`503`ステータスを返信する場合とは区別する。

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
          - name: EXCLUDE_UNSAFE_503_FROM_DEFAULT_RETRY
            value: true
```

> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars
> - https://istio.io/latest/news/releases/1.24.x/announcing-1.24/#improved-retries
> - https://github.com/istio/istio/issues/51704#issuecomment-2188555136
> - https://karlstoney.com/retry-policies-in-istio/

#### ▼ `PILOT_TRACE_SAMPLING`

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

#### ▼ `PILOT_CERT_PROVIDER`

`istio-proxy`コンテナに設定するSSL証明書のプロバイダーを設定する。

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

| 設定値       | 説明                                              |
| ------------ | ------------------------------------------------- |
| `istiod`     | Istiodが提供するSSL証明書を使用する。             |
| `kubernetes` | KubernetesのSecretで管理するSSL証明書を使用する。 |
| `none`       | SSL証明書を使用しない。                           |

> - https://istio.io/latest/docs/reference/commands/pilot-discovery/#envvars

#### ▼ `PILOT_JWT_PUB_KEY_REFRESH_INTERVAL`

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

### defaultConfig.proxyMetadata

#### ▼ `BOOTSTRAP_XDS_AGENT`

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
        BOOTSTRAP_XDS_AGENT: true
```

> - https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars

#### ▼ `ENABLE_DEFERRED_CLUSTER_CREATION`

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
        ENABLE_DEFERRED_CLUSTER_CREATION: true
```

> - https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars

#### ▼ `EXCLUDE_UNSAFE_503_FROM_DEFAULT_RETRY`

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
        EXCLUDE_UNSAFE_503_FROM_DEFAULT_RETRY: true
```

> - https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars
> - https://istio.io/latest/news/releases/1.24.x/announcing-1.24/#improved-retries

#### ▼ `ENABLE_INBOUND_RETRY_POLICY`

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
        ENABLE_INBOUND_RETRY_POLICY: true
```

> - https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars
> - https://istio.io/latest/news/releases/1.24.x/announcing-1.24/#improved-retries

#### ▼ `EXIT_ON_ZERO_ACTIVE_CONNECTIONS`

![pod_terminating_process_istio-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/pod_terminating_process_istio-proxy.png)

デフォルト値は`false`である。

`istio-proxy`コンテナへのリクエストが無くなってから、Envoyのプロセスを終了する。

具体的には、`downstream_cx_active`メトリクスの値 (アクティブなコネクション数) を監視し、`0`になり次第、Envoyのプロセスを終了する。

オプションを有効化すると、`istio-proxy`コンテナの`.spec.containers[*].lifecycle.preStop.exec.command`キーに、`sleep`コマンドが挿入される。

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
        EXIT_ON_ZERO_ACTIVE_CONNECTIONS: false
```

> - https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars
> - https://speakerdeck.com/nagapad/abema-niokeru-gke-scale-zhan-lue-to-anthos-service-mesh-huo-yong-shi-li-deep-dive?slide=80

#### ▼ `ISTIO_META_CERT_SIGNER`

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

#### ▼ `ISTIO_META_DNS_AUTO_ALLOCATE`

デフォルト値は`false`である。

IPアドレスが設定されていないServiceEntryに対して、IPアドレスを自動的に設定する。

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
        ISTIO_META_DNS_AUTO_ALLOCATE: false
```

> - https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars
> - https://istio.io/latest/docs/ops/configuration/traffic-management/dns-proxy/#getting-started

#### ▼ `ISTIO_META_DNS_CAPTURE`

デフォルト値は`false`である。

istio-proxyでDNSのキャッシュを作成するか否かを設定する。

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
        ISTIO_META_DNS_CAPTURE: false
```

> - https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars
> - https://istio.io/latest/docs/ops/configuration/traffic-management/dns-proxy/#getting-started

#### ▼ `MINIMUM_DRAIN_DURATION`

![pod_terminating_process_istio-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/pod_terminating_process_istio-proxy.png)

デフォルト値は`5`である (対応する`.metadata.annotations.proxy.istio.io/config.terminationDrainDuration`キーと同じ) 。

`EXIT_ON_ZERO_ACTIVE_CONNECTIONS`変数が`true`な場合にのみ設定できる。

`false`の場合は、代わりに`.metadata.annotations.proxy.istio.io/config.terminationDrainDuration`を設定する。

`istio-proxy`コンテナ内のEnvoyプロセスは、終了時にコネクションのドレイン処理を実施する。

このコネクションのドレイン処理時間で、新しいコネクションを受け入れ続ける時間を設定する。

Podの`.metadata.annotations.proxy.istio.io/config.drainDuration`キーで起こるレースコンディションを解決するための設定で、同じ値を設定するとよい。

**＊実装例＊**

Envoyプロセスのドレイン処理`5`秒間に実施する。

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
        MINIMUM_DRAIN_DURATION: "10s"
```

> - https://speakerdeck.com/nagapad/abema-niokeru-gke-scale-zhan-lue-to-anthos-service-mesh-huo-yong-shi-li-deep-dive?slide=80
> - https://github.com/istio/istio/pull/35059#discussion_r711500175

<br>
