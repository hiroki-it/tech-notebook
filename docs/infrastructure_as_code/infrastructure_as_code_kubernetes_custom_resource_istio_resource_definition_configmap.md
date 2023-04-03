---
title: 【IT技術の知見】ConfigMap系＠リソース定義
description: ConfigMap系＠リソース定義の知見を記録しています。
---

# ConfigMap系＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 専用ConfigMap

Istioの各コンポーネントの機密でない変数やファイルを管理する。

<br>

## 02 istio-ca-root-cert

### istio-ca-root-certとは

Istiodコントロールプレーン (`discovery`コンテナ) による中間認証局を使用する場合に、ルート認証局から発行されたルート証明書を設定する。

<br>

### root-cert.pem

#### ▼ root-cert.pemとは

ルート証明書を設定する。

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

全ての`istio-proxy`コンテナに共通する値を設定する。ここではEnvoyを使用した場合を説明する。

代わりに、IstioOperatorの`.spec.meshConfig`キーで定義することもできるが、これは非推奨である。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig

<br>

### accessLogEncoding

#### ▼ accessLogEncodingとは

アクセスログのファイル形式を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |-
    accessLogEncoding: JSON
```

> ↪️ 参考：https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-AccessLogEncoding

<br>

### accessLogFile

#### ▼ accessLogFileとは

全ての`istio-proxy`コンテナに関して、アクセスログの出力先を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |-
    accessLogFile: /dev/stdout
```

> ↪️ 参考：https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig

<br>

### caCertificates

#### ▼ caCertificatesとは

ルート認証局のルート証明書や、中間認証局名を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |-
    defaultConfig:
      proxyMetadata:
        ISTIO_META_CERT_SIGNER: istio-system
    caCertificates:
        # ルート認証局のルート証明書 
      - pem: |
          Ci0tLS0tQk...
        # 中間認証局名
        certSigners:
          - clusterissuers.cert-manager.io/istio-system
          - clusterissuers.cert-manager.io/foo
          - clusterissuers.cert-manager.io/bar
```

> ↪️ 参考：
>
> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-CertificateData
> - https://istio.io/latest/docs/tasks/security/cert-management/custom-ca-k8s/#deploy-istio-with-default-cert-signer-info
> - https://istio.io/latest/docs/ops/integrations/certmanager/

<br>

### defaultConfig

#### ▼ defaultConfigとは

`istio-proxy`コンテナ別に設定値を上書きしたい時に、そのデフォルト値を設定する。

これを上書きしたい場合は、各Podの`.metadata.annotations.proxy.istio.io/config.configPath`キーにオプションを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |-
    defaultConfig:
      proxyMetadata:
        ISTIO_META_DNS_CAPTURE: "true"
        BOOTSTRAP_XDS_AGENT: "true"
```

> ↪️ 参考：
>
> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig
> - https://github.com/istio/istio/blob/master/manifests/profiles/preview.yaml

<br>

### enableTracing

#### ▼ enableTracingとは

`istio-proxy`コンテナで分散トレースのスパンを作成するか否かを設定する。

これを有効化した場合に、`.data.mesh.defaultConfig`キー配下で、いずれのパッケージ (例：Jaeger、Zipkin、など) で計装するかを設定する。

アプリコンテナからスパン作成に関する責務をサイドカーに切り分け、各アプリコンテナに共通的に提供できる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |-
    enableTracing: true
    defaultConfig:
      tracing:
        sampling: 100
        zipkin:
          # パッケージが提供するコレクターの宛先を設定する。
          address: "jaeger-collector.observability:9411"
```

> ↪️ 参考：
>
> - https://istio.io/latest/docs/tasks/observability/distributed-tracing/mesh-and-proxy-config/#available-tracing-configurations
> - https://istio.io/latest/docs/ops/integrations/jaeger/
> - https://istio.io/latest/docs/ops/integrations/zipkin/#option-2-customizable-install
> - https://zenn.dev/riita10069/articles/service-mesh

<br>

### extensionProviders

#### ▼ extensionProvidersとは

AuthorizationPolicyによる認可の実施に、認可フェーズを外部のIDプロバイダーに委譲できるようにする。

**＊実装例＊**

oauth2-proxyのPodに紐づくServiceを識別できるようにする。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |-
    extensionProviders:
      - name: oauth2-proxy
        envoyExtAuthzHttp:
          service: oauth2-proxy.auth.svc.cluster.local
          port: 80
        includeHeadersInCheck:
          - cookie
          - authorization
```

AuthorizationPolicyで、認可フェーズの委譲先のIDプロバイダーを設定できるようになる。

ここでは、oauth2-proxyをIDプロバイダーとして使用する。

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

> ↪️ 参考：
>
> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider
> - https://zenn.dev/takitake/articles/a91ea116cabe3c#istio%E3%81%AB%E5%A4%96%E9%83%A8%E8%AA%8D%E5%8F%AF%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%82%92%E7%99%BB%E9%8C%B2
> - https://zenn.dev/takitake/articles/a91ea116cabe3c#%E5%BF%85%E8%A6%81%E3%81%AA%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%82%92%E4%BD%9C%E6%88%90-1
> - https://istio.io/latest/docs/tasks/security/authorization/authz-custom/#define-the-external-authorizer

<br>

### holdApplicationUntilProxyStarts

#### ▼ holdApplicationUntilProxyStartsとは

istio-proxyコンテナが、必ずアプリコンテナよりも先に起動するか否かを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |-
    holdApplicationUntilProxyStarts: true
```

> ↪️ 参考：https://www.zhaohuabing.com/istio-guide/docs/best-practice/startup-dependence/#%E8%A7%A3%E8%80%A6%E5%BA%94%E7%94%A8%E6%9C%8D%E5%8A%A1%E4%B9%8B%E9%97%B4%E7%9A%84%E5%90%AF%E5%8A%A8%E4%BE%9D%E8%B5%96%E5%85%B3%E7%B3%BB

オプションを有効化すると、`istio-proxy`コンテナの`spec.containers[].lifecycle.postStart.exec.command`キーに、`pilot-agent -wait`コマンドが挿入される。

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

> ↪️ 参考：https://www.zhaohuabing.com/istio-guide/docs/best-practice/startup-dependence/#%E4%B8%BA%E4%BB%80%E4%B9%88%E9%9C%80%E8%A6%81%E9%85%8D%E7%BD%AE-sidecar-%E5%92%8C%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%E7%9A%84%E5%90%AF%E5%8A%A8%E9%A1%BA%E5%BA%8F

<br>

### ingressSelector

#### ▼ とは

全ての`istio-proxy`コンテナに関して、使用するGatewayの`.metadata.labels.istio`キーの値を設定する。

デフォルトでは、Ingressとして`ingressgateway`が設定される。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |-
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
  mesh: |-
    ingressService: ingressgateway
```

> ↪️ 参考：https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig

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
  mesh: |-
    proxyHttpPort: 80
```

> ↪️ 参考：https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig

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
  mesh: |-
    proxyListenPort: 80
```

> ↪️ 参考：https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig

<br>

## 04. istio-sidecar-injector

### config

Istioのサイドカーインジェクションの設定を定義する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-sidecar-injector-<リビジョン番号>
  namespace: istio-system
data:
  config: |-
    defaultTemplates: [sidecar]
    policy: enabled
    alwaysInjectSelector: []
    neverInjectSelector:[]
    injectedAnnotations:
    template: "{{ Template_Version_And_Istio_Version_Mismatched_Check_Installation }}"
    templates:
      sidecar: |

        ... # Helmのテンプレート
```

<br>

### values

Istioのサイドカーインジェクションの設定ファイルを、Helmのテンプレートから作成する場合に、これの`values`ファイルを管理する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-sidecar-injector-<リビジョン番号>
  namespace: istio-system
data:
  values: |-
    { 

      ... # Helmのvalueファイル 

    }
```

<br>
