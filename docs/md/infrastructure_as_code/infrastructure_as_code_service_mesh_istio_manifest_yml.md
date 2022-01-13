# manifest.yml

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## 01. apiVersion

### apiVersionとは

Istio-APIのバージョンを設定する。Kubernetesとは異なることに注意する。

```yaml
apiVersion: networking.istio.io/v1beta1
```

<br>

## 02. kind

### kindとは

構築するIstioオブジェクトを設定する。

- DestinationRule
- Gateway
- VirtualService

<br>

## 03. metadata

### metadataとは

Istioオブジェクトの一意に識別するための情報を設定する。

<br>

### namespace

Istioオブジェクトを作成する名前空間を設定する。デフォルトで```istio-system```になる。

```yaml
metadata:
  namespace: istio-system
```

<br>

## 03-02. metadata（KubernetesのNamespaceにて）

### labels

#### ・istio-injection

アドミッションコントローラーを用いて、Envoyコンテナを自動的に構築するかどうかを設定する。

参考：https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#automatic-sidecar-injection

```yaml
kind: Namespace
metadata:
  labels:
    istio-injection: enabled
```

<br>

## 03-03. metadata（KubernetesnのPodにて）

### annotations

#### ・annotations

Deploymentの```template```キーやPodの```metadata```キーにて、Envoyコンテナごとのオプション値を設定する。Deploymentの```metadata```キーで定義しないように注意する。

参考：https://istio.io/latest/docs/reference/config/annotations/

ただし、Envoyコンテナごとのオプション値を```annotations```キーから設定することは非推奨であり、DeploymentやPodでistio-proxyコンテナを定義することで設定を上書きした方が良い。

参考：https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#customizing-injection

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
        - name: foo-container
          image: foo-mage
        - name: istio-proxy
```

ちなみに、Envoyコンテナではなく```envoy.yaml```ファイルの設定値は、VirtualServiceとDestinationRuleの設定値に相当する。

参考：https://sreake.com/blog/istio/

#### ・proxy.istio.io/config.configPath

Envoyコンテナのプロセスの設定値をファイルとして生成するために、これの生成先ディレクトリを設定する。デフォルトでは、```./etc/istio/proxy```ディレクトリにファイルが生成される。```IstioOperator```の```meshConfig.defaultConfig```キーにデフォルト値を設定できる。

参考：https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig

```yaml
kind: Deployment # もしくはPod
spec:
  template:
    metadata:
      annotations:
        proxy.istio.io/config:  |
          configPath: ./etc/istio/proxy
```

#### ・sidecar.istio.io/inject

Envoyコンテナを自動的に構築しないようにする。

```yaml
kind: Deployment # もしくはPod
spec:
  template:
    metadata:
      annotations:
        sidecar.istio.io/inject: false
```

#### ・sidecar.istio.io/proxyCPU

Envoyコンテナで使用するCPU容量を設定する。

参考：https://istio.io/latest/docs/reference/config/annotations/

```yaml
kind: Deployment # もしくはPod
spec:
  template:
    metadata:
      annotations:
        sidecar.istio.io/proxyCPU: 2
```

#### ・sidecar.istio.io/proxyImage

Envoyコンテナの構築に使用するDockerイメージを設定する。

参考：https://istio.io/latest/docs/reference/config/annotations/

```yaml
kind: Deployment # もしくはPod
spec:
  template:
    metadata:
      annotations:
        sidecar.istio.io/proxyImage: foo-envoy
```

#### ・sidecar.istio.io/proxyMemory

Envoyコンテナで使用するメモリ容量を設定する。

参考：https://istio.io/latest/docs/reference/config/annotations/

```yaml
kind: Deployment # もしくはPod
spec:
  template:
    metadata:
      annotations:
        sidecar.istio.io/proxyMemory: 4
```

<br>

## 04. spec（DestinationRuleの場合）

### host

紐づけるServiceの名前を設定する。

参考：https://istio.io/latest/docs/reference/config/networking/destination-rule/#DestinationRule

**＊実装例＊**

```yaml
kind: DestinationRule
spec:
  host: foo-service.default.svc.cluster.local # Service名でも良いが完全修飾ドメイン名の方が良い。
```

<br>

### subnets

VirtualServiceのサブセット名に関して、ルーティング対象とするPodのラベルを設定する

参考：

- https://istio.io/latest/docs/reference/config/networking/destination-rule/#Subset
- https://blog.1q77.com/2020/03/istio-part3/

**＊実装例＊**

VirtualServiceのサブセット名が```v1```のインバウンド通信では、```version```タグが```v1```であるPodに転送する。```v2```も同様である。

```yaml
kind: DestinationRule
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

### trafficPolicy

#### ・loadBalancer

```yaml
kind: DestinationRule
spec:
  trafficPolicy:
    loadBalancer:
      simple: ROUND_ROBIN
    portLevelSettings:
      - port:
          number: 9000
        loadBalancer:
          simple: ROUND_ROBIN
```

#### ・portLevelSettings

```yaml
kind: DestinationRule
spec:
  trafficPolicy:
    portLevelSettings:
      - port:
          number: 9000
        loadBalancer:
          simple: ROUND_ROBIN
```

<br>

## 05. spec（EnvoyFilterの場合）

### configPatches

#### ・ApplyTo

変更を適用する```envoy.yaml```ファイルの項目を設定する。

参考：https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ApplyTo

```yaml
kind: EnvoyFilter
spec:
  configPatches:
    - applyTo: NETWORK_FILTER
```

#### ・ClusterMatch

変更を適用するクラスターを設定する。

```yaml
kind: EnvoyFilter
spec:
  configPatches:
    - match:
        cluster:
          name: foo-cluster
```

#### ・ListenerMatch

変更を適用するリスナーを設定する。

参考：https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ListenerMatch

```yaml
kind: EnvoyFilter
spec:
  configPatches:
    - match:
        listener:
          filterChain:
            filter:
              name: "envoy.filters.network.http_connection_manager"
```

#### ・PatchContext

変更を適用する通信の方向を設定する。

参考：https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-PatchContext

```yaml
kind: EnvoyFilter
spec:
  configPatches:
    - match:
        context: SIDECAR_INBOUND
```

#### ・Patch

変更方法と変更内容を設定する。

```yaml
kind: EnvoyFilter
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

## 06. spec（Gatewayの場合）

### selector

#### ・selectorとは

Gatewayの適用対象のIngressGatewayに付与されたラベルを設定する。

参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Gateway

```yaml
kind: Gateway
spec:
  selector:
    istio: ingress-gateway
```

<br>

### servers

#### ・port

受信するインバウンド通信のプロトコルを設定する。プロトコルに応じて、自動的に

参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Port

**＊実装例＊**

```yaml
kind: Gateway
spec:
  servers:
  - port:
      name: http
      protocol: HTTP
      number: 80
```

#### ・hosts

Gatewayに紐づけれたVirtualServiceのドメイン名を設定する。ワイルドカードを使用できる。

参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Port

**＊実装例＊**

```yaml
kind: Gateway
spec:
  servers:
  - hosts:
      - "*" 
```

#### ・tls

受信するインバウンド通信がHTTPS、またはVirtualServiceへの転送でHTTPからHTTPSにリダイレクトする場合に、SSL/TLS証明書を設定する。

参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Port

**＊実装例＊**

```yaml
kind: Gateway
spec:
  servers:
  - tls:
      mode: SIMPLE
      serverCertificate: /etc/certs/server.pem
      privateKey: /etc/certs/privatekey.pem
```

<br>

## 07. spec（IstioOperatorの場合）

### component

#### ・componentとは

IstioOperator経由でIstioオブジェクトをインストールする。

参考：https://cloud.ibm.com/docs/containers?topic=containers-istio-custom-gateway&locale=en

#### ・ingressGateways

IstioOperator経由でインストールされるIngressGatewayのオプションを設定する。Gatewayとは異なるオブジェクトであることに注意する。ingressGatewaysの設定値を変更する場合は、```runAsRoot```キーでルート権限を有効化する必要がある。

参考：https://atmarkit.itmedia.co.jp/ait/articles/2111/05/news005.html#022

```yaml
kind: IstioOperator
spec:
  components:
    ingressGateways:
      - name: istio-ingressgateway
        enabled: true
        k8s:
          service:
            ports:
              - name: http
                port: 80
                protocol: TCP
                targetPort: 80
  values:
    gateways:
      istio-ingressgateway:
        runAsRoot: true
```

ちなみに、以下の方法で独自のIngressGatewayを作成できる（かなり大変）。

参考：

- https://faun.pub/setup-multiple-ingress-gateways-in-istio-52ad0dc7f99d
- https://github.com/istio/istio/issues/23303

最終的な設定値は、```kubectl get```コマンドで確認できる。

```yaml
$ kubectl -n istio-system get service istio-ingressgateway -o yaml

apiVersion: v1
kind: Service
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {...} # ここにも、JSON形式で設定値が記載されている。
  creationTimestamp: "2022-01-01T12:00:00Z"
  labels:
    app: istio-ingressgateway
    install.operator.istio.io/owning-resource: istio-operator
    install.operator.istio.io/owning-resource-namespace: istio-system
    istio: ingressgateway
    istio.io/rev: default
    operator.istio.io/component: IngressGateways
    operator.istio.io/managed: Reconcile
    operator.istio.io/version: 1.12.1
    release: istio
  name: istio-ingressgateway
  namespace: istio-system
  resourceVersion: "322999"
  uid: 7c292753-6219-4e4b-bd81-9012fabb97b3
spec:
  allocateLoadBalancerNodePorts: true
  clusterIP: 10.108.30.158
  clusterIPs:
  - 10.108.30.158
  externalTrafficPolicy: Cluster
  internalTrafficPolicy: Cluster
  ipFamilies:
  - IPv4
  ipFamilyPolicy: SingleStack
  ports:
  - name: http2
    nodePort: 30548
    port: 80
    protocol: TCP
    targetPort: 8080
  - name: status-port
    nodePort: 31817
    port: 15021
    protocol: TCP
    targetPort: 15021
  - name: https
    nodePort: 32016
    port: 443
    protocol: TCP
    targetPort: 8443
  selector:
    app: istio-ingressgateway
    istio: ingressgateway
  sessionAffinity: None
  type: LoadBalancer
status:
  loadBalancer:
    ingress:
    - ip: 10.108.30.158
```

#### ・egressGateways

IstioOperator経由でインストールされるEgressGatewayのオプションを設定する。

```yaml
kind: IstioOperator
spec:
  components:
    egressGateways:
    - name: istio-egressgateway
      enabled: true
```

<br>

### meshConfig

#### ・meshConfigとは

全てのEnvoyコンテナに共通する値を設定する。ここではEnvoyを用いた場合を説明する。

参考：https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig

#### ・accessLogFile

全てのEnvoyコンテナに関して、アクセスログの出力先を設定する。

```yaml
kind: IstioOperator
spec:
  meshConfig:
    accessLogFile: /dev/stdout
```

#### ・defaultConfig

Envoyコンテナ別に設定値を上書きしたい時に、そのデフォルト値を設定する。これを上書きしたい場合は、各Podの```metadata.annotations.proxy.istio.io/config.configPath```キーにオプションを設定する。

```yaml
kind: IstioOperator
spec:
  meshConfig:
    defaultConfig:
    # 〜 中略 〜
```

#### ・enableTracing

全てのEnvoyコンテナに関して、分散トレースの収集を有効化するかどうかを設定する。

```yaml
kind: IstioOperator
spec:
  meshConfig:
    enableTracing: true
```

#### ・ingressSelector

全てのEnvoyコンテナに関して、使用するGatewayの```istio```ラベル値を設定する。IngressGatewayをIngressコントローラーとして使用でき、デフォルトではは```ingressgateway```が設定される。

```yaml
kind: IstioOperator
spec:
  meshConfig:
    ingressSelector: ingressgateway
```

#### ・ingressService

全てのEnvoyコンテナに関して、使用するIngressコントローラーの```istio```ラベル値を設定する。IngressGatewayをIngressとして使用でき、デフォルトではは```ingressgateway```が設定される。

```yaml
kind: IstioOperator
spec:
  meshConfig:
    ingressService: ingressgateway
```

#### ・proxyHttpPort

全てのEnvoyコンテナに関して、クラスター外部からのインバウンド通信（特にHTTPプロトコル通信）を受信するポート番号を設定する。

```yaml
kind: IstioOperator
spec:
  meshConfig:
    proxyHttpPort: 80
```

#### ・proxyListenPort

全てのEnvoyコンテナに関して、他マイクロサービスからのインバウンド通信を受信するポート番号を設定する。

```yaml
kind: IstioOperator
spec:
  meshConfig:
    proxyListenPort: 80
```

<br>

### namespace

IstioOperator経由でインストールされるIstioオブジェクトの名前空間を設定する。

参考：https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/#IstioOperatorSpec

```yaml
kind: IstioOperator
spec:
  namespace: foo
```

<br>

### profile

インストールに使用するプロファイルを設定する。

参考：https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/#IstioOperatorSpec

```yaml
kind: IstioOperator
spec:
  profile: default
```

<br>

### tag

PilotのDockerイメージのバージョンを設定する。

参考：

- https://hub.docker.com/r/istio/proxyv2/tags
- https://github.com/istio/istio/blob/master/pilot/docker/Dockerfile.proxyv2

```yaml
kind: IstioOperator
spec:
  tag: 1.12.1
```

<br>

### values

#### ・gateways.istio-ingressgateway.runAsRoot

```yaml
kind: IstioOperator
spec:
  values:
    gateways:
      istio-ingressgateway:
        runAsRoot: true
```

#### ・sidecarInjectorWebhook

Envoyコンテナごとのオプション値を設定する。

参考：https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#custom-templates-experimental

```yaml
kind: IstioOperator
spec:
  values:
    sidecarInjectorWebhook:
      templates:
        custom: |
          spec:
            containers:
            - name: istio-proxy
              # ～ 中略 ～
```

<br>

## 08. spec（VirtualServiceの場合）

### gateways

インバウンド通信をいずれのGatewayから受信するかを設定する。

```yaml
kind: VirtualService
spec:
  gateways:
  - foo-gateway
```

マイクロサービス間で通信を行う場合は、```mesh```を指定する必要がある。

```yaml
kind: VirtualService
spec:
  gateways:
  - mesh
```

<br>

### http

#### ・httpとは

HTTP/1.1、HTTP/2、gRPC、のプロトコルによるインバウンド通信をServiceにルーティングする。ルーティング先のServiceを厳格に指定するために、Serviceの```appProtocol```キーまたはプロトコル名をIstioのルールに沿ったものにする必要がある。

参考：https://istio.io/latest/docs/ops/configuration/traffic-management/protocol-selection/#explicit-protocol-selection

#### ・match

受信するインバウンド通信のうち、ルールを適用するもののメッセージ構造を設定する。

**＊実装例＊**

インバウンド通信のうち、```x-foo```ヘッダーに```bar```が割り当てられたものだけにルールを適用する。

```yaml
kind: VirtualService
spec:
  http:
  - match:
    - headers:
        x-foo:
          exact: bar
```

インバウンド通信のうち、URLのプレフィクスが```/foo```のものだけにルールを適用する。

```yaml
kind: VirtualService
spec:
  http:
  - match:
    - headers:
        uri:
          prefix: /foo
```

#### ・route

受信するインバウンド通信のルーティング先のServiceやポートを設定する。

**＊実装例＊**

```yaml
kind: VirtualService
spec:
  http:
    - route:
        - destination:
            host: foo-service # または、Serviceの完全修飾ドメイン名でもよい。
            port:
              number: 80
```

<br>

### tcp

#### ・tcpとは

TCP/IPのプロトコルによるインバウンド通信をServiceにルーティングする。

