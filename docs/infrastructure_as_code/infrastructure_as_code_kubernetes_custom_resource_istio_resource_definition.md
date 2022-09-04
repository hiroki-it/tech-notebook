---
title: 【IT技術の知見】リソース定義＠Istio
description: リソース定義＠Istioの知見を記録しています。
---

# リソース定義＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 全部入りセットアップ

### チャートとして

#### ▼ GCRから（設定済み）

```istioctl```コマンドを使用して、IstioOperatorのチャートをインストールし、IstioOperatorにリソースを作成させる。チャートは、```istioctl```コマンドインストール時に```manifests```ディレクトリ以下に同梱される。

> ℹ️ 参考：https://istio.io/latest/docs/setup/install/istioctl/#install-from-external-charts

```bash
# IstioOperatorのdemoをインストールし、リソースを作成する。
$ istioctl install --set profile=demo

# 外部のチャートを使用する場合
$ istioctl install --manifests=foo-chart
```

#### ▼ GCRから（ユーザー定義）

IstioOperatorを独自で定義しても良い。

> ℹ️ 参考：https://istio.io/latest/docs/setup/install/operator/#install-istio-with-the-operator

```yaml
# istio-operator.yamlファイル
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  profile: demo # Istioのdemoチャートをインストールし、リソースを作成する。
```

```bash
$ kubectl apply -f istio-operator.yaml
```

<br>

## 01-02. コンポーネント別セットアップ

### チャートとして

#### ▼ Google-APIsから

Google-APIsから、Istioのコンポーネント別にチャートをインストールし、リソースを作成する。

> ℹ️ 参考：https://istio.io/latest/docs/setup/install/helm/#installation-steps

```bash
$ helm repo add istio https://istio-release.storage.googleapis.com/charts
$ helm repo update

# 共通部分（IstioBase）のみ
# baseチャート
$ helm install -n istio-system istio-base istio/base

# Istiodのみ
# istiodチャート
$ helm install -n istio-system istiod istio/istiod
```

IngressGatewayのインストールは必須ではない。

```bash
# IngressGatewayのみ
# gatewayチャート
$ helm install -n istio-system istio-ingressgateway istio/gateway
```

<br>

## 01-03. その他のセットアップ

### Minikubeのセットアップ

Istioによる種々のコンテナが稼働するために、MinikubeのNodeのCPUとメモリを最低サイズを以下の通りにする必要がある。

```bash
$ minikube start --cpus=4 --memory=16384
```

<br>

### Envoyのカスタマイズ

#### ▼ VirtualService、DestinationRuleの定義

VirtualServiceとDestinationRuleの設定値は、```istio-proxy```コンテナに適用される。

> ℹ️ 参考：

> - https://sreake.com/blog/istio/
> - https://istio.io/latest/docs/reference/config/networking/virtual-service/
> - https://istio.io/latest/docs/reference/config/networking/destination-rule/

#### ▼ EnvoyFilterの定義

```istio-proxy```コンテナの設定を上書きできる。

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/envoy-filter/

#### ▼ annotationsの定義

DeploymentやPodの```metadata.anontations```キーにて、```istio-proxy```コンテナごとのオプション値を設定する。Deploymentの場合は、```template```キーよりも下層の```metadata```キーを使用することに注意する。

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/annotations/

#### ▼ ```istio-proxy```コンテナの定義

DeploymentやPodで```istio-proxy```コンテナを定義することにより設定を上書きできる。

> ℹ️ 参考：https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#customizing-injection

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
        # istio-proxyコンテナの設定を上書きする。
        - name: istio-proxy
          lifecycle:
            preStop:
              exec:
               # istio-proxyコンテナが、マイクロサービスのコンテナよりも後に終了するようにする。
               command: [
                 "/bin/sh",
                 "-c",
                 "sleep 5; while [ $(netstat -plnt | grep tcp | egrep -v 'envoy|pilot-agent' | wc -l) -ne 0 ]; do sleep 1; done"
               ]
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

指定したNamespaceに属するPod内に```istio-proxy```コンテナを自動的に注入するか否かを設定する。```istio.io/rev```キーの代わりに```istio-injection```キーを使用する場合、Istioのアップグレードがインプレース方式になる。

> ℹ️ 参考：https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#controlling-the-injection-policy

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: foo-namespace
  labels:
    istio-injection: enabled
```

#### ▼ istio.io/rev

指定したNamespaceに属するPod内に```istio-proxy```コンテナを自動的に注入するか否かを設定する。IstoOperatorの```spec.revision```キーと同じである。```istio-injection```キーの代わりに```istio.io/rev```キーを使用する場合、Istioのアップグレードがカナリア方式になる。

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: foo-namespace
  labels:
    istio.io/rev: 1-0-0 # ハイフン繋ぎのバージョン表記
```

<br>

## 04-02. Pod＠Kubernetesでの設定

### annotations

#### ▼ annotationsとは

Deploymentの```spec.template```キーや、Podの```metadata```キーにて、```istio-proxy```コンテナごとのオプション値を設定する。Deploymentの```metadata```キーで定義しないように注意する。

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/annotations/

#### ▼ istio.io/rev

IstoOperatorの```spec.revision```キーと同じ。特定のPodで、Istioとこれのカナリアリリースを有効化するか否かを設定する。

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
        istio.io/rev: 1-12-1
```

#### ▼ proxy.istio.io/config.configPath

```istio-proxy```コンテナのプロセスの設定値をファイルとして作成するために、これの作成先ディレクトリを設定する。デフォルトでは、```./etc/istio/proxy```ディレクトリ配下にファイルが作成される。IstioOperatorの```spec.meshConfig.defaultConfig```キーにデフォルト値を設定できる。

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig

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

特定のPodで、Istioとこれのインプレースアップグレードを有効化するか否かを設定する。

> ℹ️ 参考：https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#controlling-the-injection-policy

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

```istio-proxy```コンテナで使用するCPUサイズを設定する。

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/annotations/

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

```istio-proxy```コンテナの作成に使用するコンテナイメージを設定する。

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/annotations/

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

```istio-proxy```コンテナで使用するメモリサイズを設定する。

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/annotations/

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

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#VirtualService

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

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/destination-rule/#DestinationRule

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

> ℹ️ 参考：

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#Subset
> - https://blog.1q77.com/2020/03/istio-part3/

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

> ℹ️ 参考：

> - https://istio.io/latest/docs/tasks/traffic-management/circuit-breaking/
> - https://istio.io/latest/docs/concepts/traffic-management/#circuit-breakers

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

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/destination-rule/#LoadBalancerSettings

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

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/destination-rule/#TrafficPolicy-PortTrafficPolicy

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

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/destination-rule/#TrafficPolicy-PortTrafficPolicy

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

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/destination-rule/#ClientTLSSettings-TLSmode

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

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ApplyTo

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

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ListenerMatch

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

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-PatchContext

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

> ℹ️ 参考：

> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch
> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch-Operation
> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch-FilterClass

<br>

## 07. Gateway

### spec.selector

#### ▼ selectorとは

Gatewayの適用対象のIngressGatewayに付与された```metadata.labels```キーを設定する。

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Gateway

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

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Port

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

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Port

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

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Port

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

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Port

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

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Port

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

受信するインバウンド通信がHTTPS、またはVirtualServiceへのルーティングでHTTPからHTTPSにリダイレクトする場合、SSL/TLS証明書を設定する。

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Port

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

```istio-proxy```コンテナ間の通信で相互TLSを有効化するか否かを設定する。

#### ▼ mode

相互TLSのタイプを設定する。

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/security/peer_authentication/#PeerAuthentication-MutualTLS-Mode

| 項目       | 説明           |
|----------|--------------|
| UNSET    | 調査中...       |
| DISABLE  | 相互TLSを使用しない。 |
| PERMISSIVE | 調査中...       |
| STRICT   | 相互TLSを使用する。  |


```yaml
apiVersion: install.istio.io/v1alpha1
kind: PeerAuthentication
metadata:
  namespace: istio-system
  name: peer-authentication
spec:
  mtls:
    mode: STRICT # 相互TLSを使用する。
```

相互TLSを使用する場合はSSL証明書が必要になり、SSL証明書が無いと以下のようなエラーになる。

```bash
transport failure reason: TLS error: *****:SSL routines:OPENSSL_internal:SSLV3_ALERT_CERTIFICATE_EXPIRED
```

<br>

## 09. VirtualService

### spec.exportTo

#### ▼ exportToとは

VirtualService上のインバウンド通信をルーティングできるNamespaceを設定する。

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#VirtualService

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

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#VirtualService

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

> ℹ️ 参考：

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#HTTPRoute
> - https://istio.io/latest/docs/ops/configuration/traffic-management/protocol-selection/#explicit-protocol-selection

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

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#Destination

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

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#Destination

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

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#Destination

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

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#HTTPRouteDestination

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

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#TCPRoute

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
