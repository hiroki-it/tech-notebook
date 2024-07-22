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

Istiodコントロールプレーン (`discovery`コンテナ) による中間認証局を使用する場合に、ルート認証局から発行されたCA証明書を設定する。

<br>

### root-cert.pem

#### ▼ root-cert.pemとは

CA証明書 (ルート証明書) を設定する。

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: istio-ca-root-cert
  namespace: istio-system
data:
  root-cert.pem: |
    -----BEGIN CERTIFICATE-----
    *****
    -----END CERTIFICATE-----
```

<br>

## 03. istio-mesh-cm

### istio-mesh-cmとは

Istiodコントロールプレーン (`discovery`コンテナ) のため、全ての`istio-proxy`コンテナにグローバルに設定する変数を管理する。

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

IstiodコントロールプレーンがwatchするNamespaceを限定する。

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
          istio.io/rev: stable
```

> - https://istio.io/latest/news/releases/1.22.x/announcing-1.22/upgrade-notes/#default-value-of-the-feature-flag-enhanced_resource_scoping-to-true
> - https://github.com/istio/api/blob/v1.22.1/mesh/v1alpha1/config.proto#L1252-L1274

<br>

### outboundTrafficPolicy

#### ▼ outboundTrafficPolicyとは

サービスメッシュ外へのリクエストの宛先の種類 (`PassthroughCluster`、`BlackHoleCluster`) を設定する。

#### ▼ ALLOW_ANY

サービスメッシュ外へのリクエストの宛先を、デフォルトで`PassthroughCluster`として扱う。

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

サービスメッシュ外へのリクエストの宛先を、デフォルトで`BlackHoleCluster` (`502 Bad Gateway`) として扱う。

`PassthroughCluster`として扱いたい宛先は、ServiceEntryに設定する。

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

各Podで個別に設定したい場合、`.metadata.annotations.proxy.istio.io/config.configPath`キーにオプションを設定する。

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig
> - https://github.com/istio/istio/blob/1.14.3/manifests/profiles/preview.yaml

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
      enablePrometheusMerge: "true"
```

#### ▼ holdApplicationUntilProxyStarts

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      holdApplicationUntilProxyStarts: "true"
```

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
        ISTIO_META_DNS_CAPTURE: "true"
        BOOTSTRAP_XDS_AGENT: "true"
        # ServiceからPod内のistio-proxyへのリクエストがなくなったら、istio-proxyコンテナを終了させる
        EXIT_ON_ZERO_ACTIVE_CONNECTIONS: "true"
```

> - https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars

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

#### ▼ tracing

`istio-proxy`コンテナでトレースIDとスパンIDを作成する場合に、いずれのパッケージ (例：Zipkin、Datadog、LightStep、など) で計装するかを設定する。

ZipkinとJaegerはトレースコンテキスト仕様が同じであるため、zipkinパッケージをJaegerのクライアントとしても使用できる。

ただし、これを使用するよりは`extensionProviders`キーを使用した方が良い

`.mesh.defaultConfig.enableTracing`キーを有効化する必要がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      enableTracing: "true"
      tracing:
        sampling: 100
        zipkin:
          address: "jaeger-collector.observability:9411"
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

> - https://istio.io/latest/docs/tasks/security/authorization/authz-td-migration/

<br>

### defaultProviders

#### ▼ defaultProvidersとは

テレメトリーの収集ツールを設定する。

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

分散トレースの場合、代わりに`.mesh.enableTracing`キーと`.mesh.defaultConfig`キーを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    enableTracing: "true"
    defaultConfig:
      tracing:
        sampling: 100
        zipkin:
          address: "jaeger-collector.observability:9411"
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

これを有効化した場合に、`.mesh.defaultConfig`キー配下で、いずれのパッケージ (例：Zipkin、Jaeger、など) で計装するかを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    enableTracing: "true"
    defaultConfig:
      tracing:
        sampling: 100
        zipkin:
          # パッケージが提供する Collectorの宛先を設定する。
          address: "jaeger-collector.observability:9411"
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
apiVersion: security.istio.io/v1beta1
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

分散トレースのクライアントをdatadogパッケージで計装する。

Datadogでは、トレースコンテキスト仕様がdatadogコンテキストになる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    extensionProviders:
      - name: foo-provider
        datadog:
          # datadogエージェントを宛先として設定する
          service: datadog-agent.foo-namespace.svc.cluster.local
          port: 8126
      - name: bar-provider
        envoyFileAccessLog
```

Datadogに送信するためには、`mesh.extensionProviders[*].datadog`キーに設定した宛先情報を使用して、Telemetryを定義する必要がある。

分散トレースの設定は以下の通りである。

```yaml
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: tracing-provider
  # サイドカーをインジェクションしている各Namespaceで作成する
  # もしistio-systemを指定した場合は、サイドカーのある全てのNamespaceが対象になる
  namespace: foo
spec:
  # Datadogにスパンを送信させるPodを設定する
  selector:
    matchLabels:
      name: app
  tracing:
    - providers:
        # mesh.extensionProviders[*].nameキーで設定した名前
        - name: foo-provider
      randomSamplingPercentage: 100
```

アクセスログの設定は以下の通りである。

```yaml
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: access-log-provider
  # サイドカーをインジェクションしている各Namespaceで作成する
  # もしistio-systemを指定した場合は、サイドカーのある全てのNamespaceが対象になる
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
        - name: bar-provider
```

> - https://github.com/istio/istio/blob/1.19.1/operator/pkg/util/testdata/overlay-iop.yaml#L26-L27
> - https://docs.datadoghq.com/containers/docker/apm/?tab=linux#tracing-from-the-host
> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider-DatadogTracingProvider
> - https://istio.io/latest/docs/reference/config/telemetry/

#### ▼ opentelemetry

分散トレースのクライアントをOpenTelemetryで計装する。

OpenTelemetryでは、トレースコンテキスト仕様はW3C Trace Contextになる。

OTLP形式のエンドポイントであればよいため、OpenTelemetry Collectorも指定できる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    extensionProviders:
      - name: foo-provider
        opentelemetry:
          # OpenTelemetry Collectorを宛先として設定する
          service: opentelemetry-collector.foo-namespace.svc.cluster.local
          # gRPC用のエンドポイントを設定する
          port: 4317
      - name: bar-provider
        envoyFileAccessLog:
          path: /dev/stdout
```

OpenTelemetryに送信するためには、`mesh.extensionProviders[*].opentelemetry`キーに設定した宛先情報を使用して、Telemetryを定義する必要がある。

分散トレースの設定は以下の通りである。

```yaml
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: tracing-provider
  # サイドカーをインジェクションしている各Namespaceで作成する
  # もしistio-systemを指定した場合は、サイドカーのある全てのNamespaceが対象になる
  namespace: foo
spec:
  # Opentelemetryにスパンを送信させるPodを設定する
  selector:
    matchLabels:
      name: app
  tracing:
    - providers:
        # mesh.extensionProviders[*].nameキーで設定した名前
        - name: foo-provider
      randomSamplingPercentage: 100
```

アクセスログの設定は以下の通りである。

```yaml
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: access-log-provider
  # サイドカーをインジェクションしている各Namespaceで作成する
  # もしistio-systemを指定した場合は、サイドカーのある全てのNamespaceが対象になる
  namespace: foo
spec:
  # Opentelemetryにアクセスログを送信させるPodを設定する
  selector:
    matchLabels:
      name: app
  # Envoyをアクセスログプロバイダーとして設定する
  accessLogging:
    - providers:
        # mesh.extensionProviders[*].nameキーで設定した名前
        - name: bar-provider
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

分散トレースのクライアントをzipkinパッケージで計装する。

Zipkinでは、トレースコンテキスト仕様がB3コンテキストになる。

JaegerはB3をサポートしているため、Jaegerのクライアントとしても使用できる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    extensionProviders:
      - name: foo-provider
        jaeger:
          # jaegerエージェントを宛先として設定する
          service: jaeger-agent.foo-namespace.svc.cluster.local
          port: 8126
      - name: bar-provider
        envoyFileAccessLog:
          path: /dev/stdout
```

ZipkinやJaegerに送信するためには、`mesh.extensionProviders[*].zipkin`キーに設定した宛先情報を使用して、Telemetryを定義する必要がある。

分散トレースの設定は以下の通りである。

```yaml
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: tracing-provider
  # サイドカーをインジェクションしている各Namespaceで作成する
  # もしistio-systemを指定した場合は、サイドカーのある全てのNamespaceが対象になる
  namespace: foo
spec:
  # Datadogにスパンを送信させるPodを設定する
  selector:
    matchLabels:
      name: app
  tracing:
    - providers:
        # mesh.extensionProviders[*].nameキーで設定した名前
        - name: foo-provider
      randomSamplingPercentage: 100
```

アクセスログの設定は以下の通りである。

```yaml
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: access-log-provider
  # サイドカーをインジェクションしている各Namespaceで作成する
  # もしistio-systemを指定した場合は、サイドカーのある全てのNamespaceが対象になる
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
        - name: bar-provider
```

> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider
> - https://discuss.istio.io/t/integrating-jaeger-tracing-using-telemetry-api/14759

<br>

### holdApplicationUntilProxyStarts

#### ▼ holdApplicationUntilProxyStartsとは

`istio-proxy`コンテナが、必ずアプリコンテナよりも先に起動するか否かを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    holdApplicationUntilProxyStarts: "true"
```

> - https://www.zhaohuabing.com/istio-guide/docs/best-practice/startup-dependence/#%E8%A7%A3%E8%80%A6%E5%BA%94%E7%94%A8%E6%9C%8D%E5%8A%A1%E4%B9%8B%E9%97%B4%E7%9A%84%E5%90%AF%E5%8A%A8%E4%BE%9D%E8%B5%96%E5%85%B3%E7%B3%BB
> - https://engineering.linecorp.com/ja/blog/istio-introduction-improve-observability-of-ubernetes-clusters

オプションを有効化すると、`istio-proxy`コンテナの`.spec.containers[*].lifecycle.postStart.exec.command`キーに、`pilot-agent -wait`コマンドが挿入される。

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

全ての`istio-proxy`コンテナに関して、使用するIngressコントローラーの`.metadata.labels.istio`キーの値を設定する。

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

## 04. istio-sidecar-injector

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

サイドカーの設定値をHelmテンプレートの状態で管理する。

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

## 05. 環境変数

### Istiod

#### ▼ CLUSTER_ID

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

> - https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars

#### ▼ PILOT_TRACE_SAMPLING

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

> - https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars

#### ▼ PILOT_CERT_PROVIDER

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

> - https://istio.io/latest/docs/reference/commands/pilot-agent/#envvars

<br>
