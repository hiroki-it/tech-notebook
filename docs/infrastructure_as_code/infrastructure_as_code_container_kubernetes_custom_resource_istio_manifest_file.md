---
title: 【IT技術の知見】マニフェストファイル＠Istio
description: マニフェストファイル＠Istioの知見を記録しています。
---

# マニフェストファイル＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ

### コマンドを使用して

#### ▼ istioctlコマンドを使用して

プロファイルを指定し、Istioリソースをapplyする。

参考：https://istio.io/latest/docs/setup/install/istioctl/#install-istio-using-the-default-profile

```bash
$ istioctl install --set profile=demo
```

<br>

### チャートリポジトリから

#### ▼ googleapisチャートリポジトリから

googleapisチャートリポジトリからapplyする。

参考：https://github.com/istio/istio/tree/master/manifests/charts

```bash
$ kubectl apply -k github.com/istio/installer/base

# コンポーネントを個別にセットアップすることもできる。
$ helm install istio-ingressgateway istio/gateway
```

<br>

## 01-02. その他のセットアップ

### Minikubeのセットアップ

Istioによる種々のコンテナが稼働するために、MinikubeのNodeのCPUとメモリを最低サイズを以下の通りにする必要がある。

```bash
$ minikube start --cpus=4 --memory=16384
```

<br>

### Envoyのカスタマイズ

#### ▼ VirtualService、DestinationRuleの定義

VirtualServiceとDestinationRuleの設定値は、istio-proxyコンテナに適用される。

参考：

- https://sreake.com/blog/istio/
- https://istio.io/latest/docs/reference/config/networking/virtual-service/
- https://istio.io/latest/docs/reference/config/networking/destination-rule/

#### ▼ EnvoyFilterの定義

istio-proxyコンテナの設定を上書きできる。

参考：https://istio.io/latest/docs/reference/config/networking/envoy-filter/

#### ▼ annotationsの定義

DeploymentやPodの```metadata.anontations```キーにて、Envoyコンテナごとのオプション値を設定する。Deploymentの場合は、```template```キーよりも下層の```metadata```キーを使用することに注意する。

参考：https://istio.io/latest/docs/reference/config/annotations/

#### ▼ istio-proxyコンテナの定義

DeploymentやPodでistio-proxyコンテナを定義することにより設定を上書きできる。

参考：https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#customizing-injection

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/app: foo-pod
  template:
    spec:
      containers:
        - name: foo-gin
          image: foo-gin
        - name: istio-proxy
```

<br>

## 03. 共通設定

### apiVersion

Istio-APIのバージョンを設定する。Kubernetesとは異なることに注意する。

```yaml
apiVersion: networking.istio.io/v1beta1
```

<br>

### kind

作成するIstioリソースを設定する。

- DestinationRule
- Gateway
- VirtualService

<br>

### metadata

Istioリソースの一意に識別するための情報を設定する。

<br>

### namespace

Istioリソースを作成するNamespaceを設定する。デフォルトで```istio-system```になる。

```yaml
metadata:
  namespace: istio-system
```

<br>

## 04. Namespace＠Kubernetesでの設定

### labels

#### ▼ istio-injection

admission-controllersのWebhook機能を使用して、Envoyコンテナを自動的に作成するか否かを設定する。

参考：https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#automatic-sidecar-injection

```yaml
apiVersion: v1
kind: Namespace
metadata:
  labels:
    istio-injection: enabled
```

#### ▼ istio.io/rev

IstoOperatorの```spec.revision```キーと同じ。

```yaml
apiVersion: v1
kind: Namespace
metadata:
  labels:
    istio.io/rev: 1-12-1 # ハイフン繋ぎのバージョン表記
```

<br>

## 04-02. Pod＠Kubernetesでの設定

### annotationsとは

#### ▼ annotations

Deploymentの```spec.template```キーや、Podの```metadata```キーにて、Envoyコンテナごとのオプション値を設定する。Deploymentの```metadata```キーで定義しないように注意する。

参考：https://istio.io/latest/docs/reference/config/annotations/

#### ▼ proxy.istio.io/config.configPath

Envoyコンテナのプロセスの設定値をファイルとして作成するために、これの作成先ディレクトリを設定する。デフォルトでは、```./etc/istio/proxy```ディレクトリ配下にファイルが作成される。IstioOperatorの```spec.meshConfig.defaultConfig```キーにデフォルト値を設定できる。

参考：https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig

```yaml
apiVersion: apps/v1
kind: Deployment # もしくはPod
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/app: foo-pod
  template:
    metadata:
      annotations:
        proxy.istio.io/config:  |
          configPath: ./etc/istio/proxy
```

#### ▼ sidecar.istio.io/inject

特定のPodでのみ、Envoyコンテナを自動的に作成しないようにする。

```yaml
apiVersion: apps/v1
kind: Deployment # もしくはPod
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/app: foo-pod
  template:
    metadata:
      annotations:
        sidecar.istio.io/inject: false
```

#### ▼ sidecar.istio.io/proxyCPU

Envoyコンテナで使用するCPUサイズを設定する。

参考：https://istio.io/latest/docs/reference/config/annotations/

```yaml
apiVersion: apps/v1
kind: Deployment # もしくはPod
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/app: foo-pod
  template:
    metadata:
      annotations:
        sidecar.istio.io/proxyCPU: 2
```

#### ▼ sidecar.istio.io/proxyImage

Envoyコンテナの作成に使用するコンテナイメージを設定する。

参考：https://istio.io/latest/docs/reference/config/annotations/

```yaml
apiVersion: apps/v1
kind: Deployment # もしくはPod
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/app: foo-pod
  template:
    metadata:
      annotations:
        sidecar.istio.io/proxyImage: foo-envoy
```

#### ▼ sidecar.istio.io/proxyMemory

Envoyコンテナで使用するメモリサイズを設定する。

参考：https://istio.io/latest/docs/reference/config/annotations/

```yaml
apiVersion: apps/v1
kind: Deployment # もしくはPod
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app.kubernetes.io/app: foo-pod
  template:
    metadata:
      annotations:
        sidecar.istio.io/proxyMemory: 4
```

<br>

## 05. DestinationRule

### spec.exportTo

#### ▼ exportToとは

DestinationRule上のインバウンド通信をルーティングできるNamespaceを設定する。

参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#VirtualService

#### ▼ ```*```（アスタリスク）

全てのNamespaceで使用できるようにする。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  namespace: istio-system
  name: foo-destination-rule
spec:
  exportTo:
    - "*"
```

#### ▼ ```.```（ドット）

現在のNamespaceで使用できるようにする。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  namespace: istio-system
  name: foo-destination-rule
spec:
  exportTo:
    - "."
```

<br>

### spec.host

インバウンド通信のルーティング元とするServiceの名前を設定する。これにより、Envoyは特定のServiceからのルーティングのみ受信するようになる。

参考：https://istio.io/latest/docs/reference/config/networking/destination-rule/#DestinationRule

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  namespace: istio-system
  name: foo-destination-rule
spec:
  host: foo-service.default.svc.cluster.local # Service名でも良いが完全修飾ドメイン名の方が良い。
```

<br>

### spec.subsets

VirtualServiceのサブセット名に関して、ルーティング先とするPodの```metadata.labels```キーを設定する

参考：

- https://istio.io/latest/docs/reference/config/networking/destination-rule/#Subset
- https://blog.1q77.com/2020/03/istio-part3/

**＊実装例＊**

VirtualServiceのサブセット名が```v1```のインバウンド通信では、```version```タグが```v1```であるPodにルーティングする。```v2```も同様である。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  namespace: istio-system
  name: foo-destination-rule
spec:
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
```

<br>

### spec.trafficPolicy

#### ▼ connectionPool

Podの同時接続数の制限数を設定する。制限を超過した場合、Podへのルーティングが停止し、直近の成功時の処理結果を返信する（サーキットブレイカー）。

参考：

- https://istio.io/latest/docs/tasks/traffic-management/circuit-breaking/
- https://istio.io/latest/docs/concepts/traffic-management/#circuit-breakers

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  namespace: istio-system
  name: foo-destination-rule
spec:
  trafficPolicy:
    connectionPool:
      http:
        http1MaxPendingRequests: 1
        maxRequestsPerConnection: 1
      tcp:
        maxConnections: 100
```

#### ▼ loadBalancer

Podへのルーティング時に使用するロードバランシングアルゴリズムを設定する。

参考：https://istio.io/latest/docs/reference/config/networking/destination-rule/#LoadBalancerSettings

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  namespace: istio-system
  name: foo-destination-rule
spec:
  trafficPolicy:
    loadBalancer:
      simple: ROUND_ROBIN
```

#### ▼ portLevelSettings.loadBalancer

ポート番号別のルーティングのロードバランシングアルゴリズムを設定する。

参考：https://istio.io/latest/docs/reference/config/networking/destination-rule/#TrafficPolicy-PortTrafficPolicy

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  namespace: istio-system
  name: foo-destination-rule
spec:
  trafficPolicy:
    portLevelSettings:
      - loadBalancer:
          simple: ROUND_ROBIN
```

#### ▼ portLevelSettings.port

ポート番号別のルーティングで使用するポート番号を設定する。

参考：https://istio.io/latest/docs/reference/config/networking/destination-rule/#TrafficPolicy-PortTrafficPolicy

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  namespace: istio-system
  name: foo-destination-rule
spec:
  trafficPolicy:
    portLevelSettings:
      - port:
          number: 80
```

#### ▼ tls.mode

Podへのルーティング時に使用するHTTPSプロトコルのタイプを設定する。HTTPSプロトコルを使用しない場合は、```DISABLE```とする。

参考：https://istio.io/latest/docs/reference/config/networking/destination-rule/#ClientTLSSettings-TLSmode

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  namespace: istio-system
  name: foo-destination-rule
spec:
  trafficPolicy:
    tls:
      mode: DISABLE
```

<br>

## 06. EnvoyFilter

### spec.configPatches

#### ▼ ApplyTo

変更を適用する```envoy.yaml```ファイルの項目を設定する。

参考：https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ApplyTo

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  namespace: istio-system
  name: foo-envoy-filter
spec:
  configPatches:
    - applyTo: NETWORK_FILTER
```

#### ▼ ClusterMatch

変更を適用するClusterを設定する。

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  namespace: istio-system
  name: foo-envoy-filter
spec:
  configPatches:
    - match:
        cluster:
          name: foo-cluster
```

#### ▼ ListenerMatch

変更を適用するリスナーを設定する。

参考：https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ListenerMatch

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  namespace: istio-system
  name: foo-envoy-filter
spec:
  configPatches:
    - match:
        listener:
          filterChain:
            filter:
              name: "envoy.filters.network.http_connection_manager"
```

#### ▼ PatchContext

変更を適用する通信の方向を設定する。

参考：https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-PatchContext

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  namespace: istio-system
  name: foo-envoy-filter
spec:
  configPatches:
    - match:
        context: SIDECAR_INBOUND
```

#### ▼ Patch

変更方法と変更内容を設定する。

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  namespace: istio-system
  name: foo-envoy-filter
spec:
  configPatches:
    - patch:
        operation: MERGE
        value:
          name: "envoy.filters.network.http_connection_manager"
          typed_config:
            "@type": "type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager"
```

参考：

- https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch
- https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch-Operation
- https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch-FilterClass

<br>

## 07. Gateway

### spec.selector

#### ▼ selectorとは

Gatewayの適用対象のIngressGatewayに付与された```metadata.labels```キーを設定する。

参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Gateway

```yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  namespace: istio-system
  name: gateway
spec:
  selector:
    istio: istio-ingressgateway
```

<br>

### spec.servers

#### ▼ port.number

ポート名を設定する。

参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Port

```yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  namespace: istio-system
  name: gateway
spec:
  servers:
  - port:
      name: http
```

#### ▼ port.number

インバウンド通信を待ち受けるポート番号を設定する。

参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Port

```yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  namespace: istio-system
  name: gateway
spec:
  servers:
  - port:
      number: 80
```

#### ▼ port.protocol

受信するインバウンド通信のプロトコルを設定する。

参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Port

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  namespace: istio-system
  name: gateway
spec:
  servers:
  - port:
      protocol: HTTP
```

#### ▼ hosts

Gatewayに紐づけれたVirtualServiceのドメイン名を設定する。ワイルドカードを使用できる。

参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Port

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  namespace: istio-system
  name: gateway
spec:
  servers:
  - hosts:
      - "*" 
```

#### ▼ tls.privateKey

参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Port

```yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  namespace: istio-system
  name: gateway
spec:
  servers:
  - tls:
      privateKey: /etc/certs/privatekey.pem
```

#### ▼ tls.serverCertificate

受信するインバウンド通信がHTTPS、またはVirtualServiceへのルーティングでHTTPからHTTPSにリダイレクトする場合に、SSL/TLS証明書を設定する。

参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Port

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  namespace: istio-system
  name: gateway
spec:
  servers:
  - tls:
      serverCertificate: /etc/certs/server.pem
```

<br>

## 08. PeerAuthentication

### spec.mtls

#### ▼ mtls

istio-proxyコンテナ間の通信で相互TLSを有効化するか否かを設定する。

#### ▼ mode

相互TLSのタイプを設定する。

参考：https://istio.io/latest/docs/reference/config/security/peer_authentication/#PeerAuthentication-MutualTLS-Mode

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  mtls:
    mode: DISABLE # 相互TLSを使用しない。
```

相互TLSを有効化する場合はSSL証明書が必要になり、これがないと以下のようなエラーになる。

```bash
transport failure reason: TLS error: *****:SSL routines:OPENSSL_internal:SSLV3_ALERT_CERTIFICATE_EXPIRED
```

<br>

## 09. VirtualService

### spec.exportTo

#### ▼ exportToとは

VirtualService上のインバウンド通信をルーティングできるNamespaceを設定する。

参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#VirtualService

#### ▼ ```*```（アスタリスク）

全てのNamespaceで使用できるようにする。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  namespace: istio-system
  name: foo-virtual-service
spec:
  exportTo:
    - "*"
```

#### ▼ ```.```（ドット）

現在のNamespaceで使用できるようにする。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  namespace: istio-system
  name: foo-virtual-service
spec:
  exportTo:
    - "."
```

<br>

### spec.gateways

#### ▼ gatewaysとは

インバウンド通信をいずれのGatewayから受信するかを設定する。

参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#VirtualService

#### ▼ <Namespace名>/<Gateway名>

Gateway名とこれのNamespaceを設定する。VirtualServiceとGatewayが同じNamespaceに属する場合は、Namespaceを省略できる。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  namespace: istio-system
  name: foo-virtual-service
spec:
  gateways:
  - foo-namespace/foo-gateway
```

#### ▼ mesh

マイクロサービス間の通信を有効化するか否かを設定する。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  namespace: istio-system
  name: foo-virtual-service
spec:
  gateways:
  - mesh
```

<br>

### spec.http

#### ▼ httpとは

HTTP/1.1、HTTP/2、gRPC、のプロトコルによるインバウンド通信をServiceにルーティングする。ルーティング先のServiceを厳格に指定するために、Serviceの```spec.ports.appProtocol```キーまたはプロトコル名をIstioのルールに沿ったものにする必要がある。

参考：

- https://istio.io/latest/docs/reference/config/networking/virtual-service/#HTTPRoute
- https://istio.io/latest/docs/ops/configuration/traffic-management/protocol-selection/#explicit-protocol-selection

#### ▼ match

受信するインバウンド通信のうち、ルールを適用するもののメッセージ構造を設定する。

**＊実装例＊**

インバウンド通信のうち、```x-foo```ヘッダーに```bar```が割り当てられたものだけにルールを適用する。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  namespace: istio-system
  name: foo-virtual-service
spec:
  http:
  - match:
    - headers:
        x-foo:
          exact: bar
```

インバウンド通信のうち、URLの接頭辞が```/foo```のものだけにルールを適用する。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  namespace: istio-system
  name: foo-virtual-service
spec:
  http:
  - match:
    - headers:
        uri:
          prefix: /foo
```

#### ▼ route.destination.host

受信するインバウンド通信のルーティング先のドメイン名あるいはService名を設定する。

参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#Destination

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
spec:
  http:
    - route:
        - destination:
            host: foo-service.foo-namespace.svc.cluster.local # Service名でも良い。
```

#### ▼ route.destination.port

受信するインバウンド通信のルーティング先のポート番号を設定する。

参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#Destination

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  namespace: istio-system
  name: foo-virtual-service
spec:
  http:
    - route:
        - destination:
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 80
```

#### ▼ route.destination.subset

Serviceのサブセット名を設定する。DestinationRuleにて、ルーティング先の設定に使用する。

参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#Destination

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  namespace: istio-system
  name: foo-virtual-service
spec:
  http:
    - route:
        - destination:
            host: foo-service.foo-namespace.svc.cluster.local # Service名でも良い。
            port:
              number: 80
            subset: v1
        - destination:
            host: foo-service.foo-namespace.svc.cluster.local # Service名でも良い。
            port:
              number: 80
            subset: v2
```

#### ▼ route.weight

重み付けルーティングの割合を設定する。

参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#HTTPRouteDestination

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  namespace: istio-system
  name: foo-virtual-service
spec:
  http:
    - route:
        - destination:
            host: foo-service.foo-namespace.svc.cluster.local # Service名でも良い。
            port:
              number: 80
            subset: v1
          weight: 70
        - destination:
            host: foo-service.foo-namespace.svc.cluster.local # Service名でも良い。
            port:
              number: 80
            subset: v1
          weight: 30
```

<br>

### spec.tcp

#### ▼ tcpとは

TCP/IPのプロトコルによるインバウンド通信をServiceにルーティングする。

参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#TCPRoute

#### ▼ match

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  namespace: istio-system
  name: foo-virtual-service
spec:
  tcp:
    - match:
        - port: 9000
```

#### ▼ route.destination.host

httpの場合と同じである。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  namespace: istio-system
  name: foo-virtual-service
spec:
  tcp:
    - route:
        - destination:
            host: foo-service.foo-namespace.svc.cluster.local # Service名でも良い。
```

#### ▼ route.destination.port

httpの場合と同じである。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  namespace: istio-system
  name: foo-virtual-service
spec:
  tcp:
    - route:
        - destination:
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 9000
```

#### ▼ route.destination.subset

httpの場合と同じである。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  namespace: istio-system
  name: foo-virtual-service
spec:
  tcp:
    - route:
        - destination:
            host: foo-service.foo-namespace.svc.cluster.local # Service名でも良い。
            port:
              number: 9000
            subset: v1
        - destination:
            host: foo-service.foo-namespace.svc.cluster.local # Service名でも良い。
            port:
              number: 9000
            subset: v2
```

<br>
