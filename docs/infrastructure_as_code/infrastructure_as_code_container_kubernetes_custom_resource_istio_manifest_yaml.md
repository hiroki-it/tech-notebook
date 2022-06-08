---
title: 【知見を記録するサイト】manifest.yaml＠Istio
description: manifest.yaml＠Istioの知見をまとめました。
---

# manifest.yaml＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. manifest.yamlファイル＠Istioとは

Istioリソースを宣言的に定義し、コンテナのプロビジョニングを行う。プロビジョニングされるコンテナについては、以下のリンクを参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/virtualization/virtualization_container_orchestration_kubernetes_istio.html

<br>

## 01-02. セットアップ

### インストール

#### ▼ istioctlコマンドを使用して

プロファイルを指定し、Istioリソースをインストールする。

参考：https://istio.io/latest/docs/setup/install/istioctl/#install-istio-using-the-default-profile

```bash
$ istioctl install --set profile=demo
```

#### ▼ IstioOperatorを使用して

（１）まずは、IstioOperatorをインストールする。IstioOperatorは、デフォルトで```istio-system```にIstioリソースをインストールするようになっている。

参考：https://istio.io/latest/docs/setup/install/operator/

```bash
$ istioctl operator init

Installing operator controller in namespace: istio-operator using image: docker.io/istio/operator:1.12.1
Operator controller will watch namespaces: istio-system
✔ Istio operator installed
✔ Installation complete
```

（２）IstioOperatorが定義されたmanifest.yamlファイルを、istioctlコマンドまたはkubectlコマンドで操作し、Istioインストールする。代わりにここで、IstioOperatorにHelmを使用させてIstioリソースをインストールすることもできる。kubectlコマンドでもデプロイできるが、デプロイの成否の実行ログがわかりにくいことに注意する。

参考：

- https://istio.io/latest/docs/setup/install/istioctl/#install-istio-using-the-default-profile
- https://istio.io/latest/docs/setup/install/operator/#install-istio-with-the-operator

```bash
# istioctlコマンド
$ istioctl install -y -f <IstioOperatorのmanifest.yamlファイルへのパス>

✔ Istio core installed
✔ Istiod installed
✔ Ingress gateways installed
✔ Installation complete
Making this installation the default for injection and validation.
```

```bash
# kubectlコマンド
$ kubectl apply -f <IstioOperatorのmanifest.yamlファイルへのパス>

istiooperator.install.istio.io/istio-operator created
```

#### ▼ googleapisチャートリポジトリから

googleapisチャートリポジトリからインストールする。

参考：https://github.com/istio/istio/tree/master/manifests/charts/gateway

```bash
$ helm repo add istio https://istio-release.storage.googleapis.com/charts
$ helm repo update

$ helm install istio-ingressgateway istio/gateway
```

<br>

### アンインストール

#### ▼ istioctlコマンドを使用して

Istioリソースを全てアンインストールする。

```bash
$ istioctl x uninstall --purge
```

<br>

### Minikubeのセットアップ

Istioによる種々のコンテナが稼働するために、MinikubeのNodeのCPUとメモリを最低容量を以下の通りにする必要がある。

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
      app: foo-pod
  template:
    spec:
      containers:
        - name: foo-gin
          image: foo-gin
        - name: istio-proxy
```

<br>

## 02. 共通設定

### apiVersion

Istio-APIのバージョンを設定する。Kubernetesとは異なることに注意する。

```yaml
apiVersion: networking.istio.io/v1beta1
```

<br>

### kind

構築するIstioリソースを設定する。

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

## 03. Namespace＠Kubernetesでの設定

### labels

#### ▼ istio-injection

アドミッションコントローラーを使用して、Envoyコンテナを自動的に構築するかどうかを設定する。

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

## 03-02. Pod＠Kubernetesでの設定

### annotationsとは

#### ▼ annotations

Deploymentの```spec.template```キーや、Podの```metadata```キーにて、Envoyコンテナごとのオプション値を設定する。Deploymentの```metadata```キーで定義しないように注意する。

参考：https://istio.io/latest/docs/reference/config/annotations/

#### ▼ proxy.istio.io/config.configPath

Envoyコンテナのプロセスの設定値をファイルとして生成するために、これの生成先ディレクトリを設定する。デフォルトでは、```./etc/istio/proxy```ディレクトリ配下にファイルが生成される。IstioOperatorの```spec.meshConfig.defaultConfig```キーにデフォルト値を設定できる。

参考：https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig

```yaml
apiVersion: apps/v1
kind: Deployment # もしくはPod
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app: foo-pod
  template:
    metadata:
      annotations:
        proxy.istio.io/config:  |
          configPath: ./etc/istio/proxy
```

#### ▼ sidecar.istio.io/inject

特定のPodでのみ、Envoyコンテナを自動的に構築しないようにする。

```yaml
apiVersion: apps/v1
kind: Deployment # もしくはPod
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app: foo-pod
  template:
    metadata:
      annotations:
        sidecar.istio.io/inject: false
```

#### ▼ sidecar.istio.io/proxyCPU

Envoyコンテナで使用するCPU容量を設定する。

参考：https://istio.io/latest/docs/reference/config/annotations/

```yaml
apiVersion: apps/v1
kind: Deployment # もしくはPod
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app: foo-pod
  template:
    metadata:
      annotations:
        sidecar.istio.io/proxyCPU: 2
```

#### ▼ sidecar.istio.io/proxyImage

Envoyコンテナの構築に使用するDockerイメージを設定する。

参考：https://istio.io/latest/docs/reference/config/annotations/

```yaml
apiVersion: apps/v1
kind: Deployment # もしくはPod
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app: foo-pod
  template:
    metadata:
      annotations:
        sidecar.istio.io/proxyImage: foo-envoy
```

#### ▼ sidecar.istio.io/proxyMemory

Envoyコンテナで使用するメモリ容量を設定する。

参考：https://istio.io/latest/docs/reference/config/annotations/

```yaml
apiVersion: apps/v1
kind: Deployment # もしくはPod
metadata:
  name: foo-deployment
spec:
  selector:
    matchLabels:
      app: foo-pod
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

VirtualServiceのサブセット名に関して、ルーティング先とするPodのlabelキーを設定する

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

Gatewayの適用対象のIngressGatewayに付与されたlabelキーを設定する。

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

## 08. IstioOperator

### spec.component

#### ▼ componentとは

IstioOperator経由でIstioリソースをインストールする。

参考：https://cloud.ibm.com/docs/containers?topic=containers-istio-custom-gateway&locale=en

#### ▼ egressGateways

IstioOperator経由でインストールされるEgressGatewayのオプションを設定する。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  components:
    egressGateways:
    - name: istio-egressgateway
      enabled: true
```

#### ▼ ingressGateways

2022/06/04現在、IstioOperatorの```spec.components.ingressGateways.k8s```キー以下でIngressGatewayを設定することは非推奨であり、Gatewayを使用するようにする。一応このオプションの説明は残しておく。IngressGatewayのオプションを設定する。IngressGatewayの設定値を変更する場合は、```runAsRoot```キーでルート権限を有効化する必要がある。

参考：https://atmarkit.itmedia.co.jp/ait/articles/2111/05/news005.html#022

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
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

<br>

### spec.hub

#### ▼ hubとは

Istioリソースを構成するコンテナのベースイメージのレジストリを設定する。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  hub: docker.io/istio
```

<br>

### spec.meshConfig

#### ▼ meshConfigとは

全てのEnvoyコンテナに共通する値を設定する。ここではEnvoyを使用した場合を説明する。

参考：https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig

#### ▼ accessLogFile

全てのEnvoyコンテナに関して、アクセスログの出力先を設定する。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  meshConfig:
    accessLogFile: /dev/stdout
```

#### ▼ defaultConfig

Envoyコンテナ別に設定値を上書きしたい時に、そのデフォルト値を設定する。これを上書きしたい場合は、各Podの```metadata.annotations.proxy.istio.io/config.configPath```キーにオプションを設定する。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  meshConfig:
    defaultConfig:
    # 〜 中略 〜
```

#### ▼ enableTracing

全てのEnvoyコンテナに関して、分散トレースの収集を有効化するかどうかを設定する。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  meshConfig:
    enableTracing: true
```

#### ▼ ingressSelector

全てのEnvoyコンテナに関して、使用するGatewayの```metadata.labels.istio```キー値を設定する。IngressGatewayをIngressコントローラーとして使用でき、デフォルトでは```ingressgateway```が設定される。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  meshConfig:
    ingressSelector: ingressgateway
```

#### ▼ ingressService

全てのEnvoyコンテナに関して、使用するIngressコントローラーの```metadata.labels.istio```キー値を設定する。IngressGatewayをIngressとして使用でき、デフォルトでは```ingressgateway```が設定される。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  meshConfig:
    ingressService: ingressgateway
```

#### ▼ proxyHttpPort

全てのEnvoyコンテナに関して、Cluster外からのインバウンド通信（特にHTTPプロトコル通信）を待ち受けるポート番号を設定する。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  meshConfig:
    proxyHttpPort: 80
```

#### ▼ proxyListenPort

全てのEnvoyコンテナに関して、他マイクロサービスからのインバウンド通信を待ち受けるポート番号を設定する。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  meshConfig:
    proxyListenPort: 80
```

<br>

### spec.namespace

#### ▼ namespaceとは

IstioOperator経由でインストールされるIstioリソースのNamespaceを設定する。

参考：https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/#IstioOperatorSpec

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  namespace: foo
```

<br>

### spec.profile

#### ▼ profileとは

インストールに使用するプロファイルを設定する。

参考：https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/#IstioOperatorSpec

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  profile: default
```

<br>

### spec.revision

#### ▼ revisionとは

コントロールプレーン（Istiod）をカナリアリリースを用いてアップグレードする場合に、新しくインストールするバージョンを設定する。バージョンの表記方法がハイフン繋ぎであることに注意する。

参考：

- https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/#IstioOperatorSpec
- https://istio.io/latest/docs/setup/upgrade/canary/

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  revision: 1-12-1 # ハイフン繋ぎのバージョン表記
```

<br>

### spec.tag

#### ▼ tagとは

Istioリソースを構成するコンテナのベースイメージのバージョンを設定する。

参考：

- https://hub.docker.com/r/istio/proxyv2/tags
- https://github.com/istio/istio/blob/master/pilot/docker/Dockerfile.proxyv2

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  tag: 1.12.1
```

<br>

### spec.values

#### ▼ valuesとは

IstioOperatorに、Helmを使用させてIstioリソースをインストールする場合に、Helmのvaluesファイルの代わりになる。

#### ▼ gateways.istio-ingressgateway.runAsRoot

IstioOperatorをrootユーザーで実行する。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  values:
    gateways:
      istio-ingressgateway:
        runAsRoot: true
```

#### ▼ sidecarInjectorWebhook

Envoyコンテナごとのオプション値を設定する。

参考：https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#custom-templates-experimental

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
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

## 09. PeerAuthentication

### spec.mtls

#### ▼ mtls

istio-proxyコンテナ間の通信で相互TLSを有効化するかどうかを設定する。

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

## 10. VirtualService

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

マイクロサービス間の通信を有効化するかどうかを設定する。

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
