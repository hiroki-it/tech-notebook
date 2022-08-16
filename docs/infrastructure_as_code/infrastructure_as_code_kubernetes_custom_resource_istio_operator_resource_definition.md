---
title: 【IT技術の知見】IstioOperator＠Istio
description: IstioOperator＠Istioの知見を記録しています。
---

# IstioOperator＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ

### チャートとして

#### ▼ GCRから

```istioctl```コマンドを使用して、IstioOperatorのチャートをインストールし、リソースを作成する。チャートは、```istioctl```コマンドインストール時の```manifests```ディレクトリ以下に同梱されている。

（１）```istioctl```コマンドでIstioOperatorを指定する。IstioOperatorは、デフォルトで```istio-system```にIstioリソースを作成するようになっている。

ℹ️ 参考：https://istio.io/latest/docs/setup/install/operator/

```bash
$ istioctl operator init

Installing operator controller in namespace: istio-operator using image: docker.io/istio/operator:1.12.1
Operator controller will watch namespaces: istio-system
✔ Istio operator installed
✔ Installation complete
```

（２）IstioOperatorが定義されたマニフェストファイルを、```istioctl```コマンドまたは```kubectl```コマンドを使用して、Istioリソースを作成する。代わりにここで、IstioOperatorにHelmを使用させてIstioリソースを作成することもできる。```kubectl apply```コマンドでも作成できるが、成否の実行ログがわかりにくいことに注意する。

ℹ️ 参考：

- https://istio.io/latest/docs/setup/install/istioctl/#install-istio-using-the-default-profile
- https://istio.io/latest/docs/setup/install/operator/#install-istio-with-the-operator

```bash
# istioctlコマンド
$ istioctl install -y -f istio-operator.yaml

✔ Istio core installed
✔ Istiod installed
✔ Ingress gateways installed
✔ Installation complete
Making this installation the default for injection and validation.
```

```bash
# kubectlコマンド
$ kubectl apply -f istio-operator.yaml

istiooperator.install.istio.io/istio-operator created
```

#### ▼ チャートリポジトリから

IstioOperatorのチャートをインストールし、リソースを作成する。チャートは、```istioctl```コマンドインストール時の```manifests```ディレクトリ以下に同梱されている。

ℹ️ 参考：

- https://istio.io/latest/docs/setup/install/operator/#deploy-the-istio-operator
- https://tech.griphone.co.jp/2020/12/12/istio-operator-101/

```bash
$ helm install istio-operator manifests/charts/istio-operator -n istio-operator -f values.yaml
```

<br>

## 02. metadata

### metadata.name

リソース名は```istio-operator```とする必要がある。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
```

<br>

## 03. spec

### spec.component

#### ▼ componentとは

IstioOperator制御でIstioリソースを作成する。

ℹ️ 参考：https://cloud.ibm.com/docs/containers?topic=containers-istio-custom-gateway&locale=en

#### ▼ egressGateways

IstioOperator制御で作成されるEgressGatewayのオプションを設定する。

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

執筆時点（2022/06/04）では、IstioOperatorの```spec.components.ingressGateways.k8s```キー以下でIngressGatewayを設定することは非推奨であり、Gatewayを使用するようにする。一応このオプションの説明は残しておく。IngressGatewayのオプションを設定する。IngressGatewayの設定値を変更する場合は、```runAsRoot```キーでルート権限を有効化する必要がある。

ℹ️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/2111/05/news005.html#022

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

ℹ️ 参考：

- https://faun.pub/setup-multiple-ingress-gateways-in-istio-52ad0dc7f99d
- https://github.com/istio/istio/issues/23303

最終的な設定値は、```kubectl get```コマンドで確認できる。

```bash
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

全ての```istio-proxy```コンテナに共通する値を設定する。ここではEnvoyを使用した場合を説明する。

ℹ️ 参考：https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig

#### ▼ accessLogFile

全ての```istio-proxy```コンテナに関して、アクセスログの出力先を設定する。

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

```istio-proxy```コンテナ別に設定値を上書きしたい時に、そのデフォルト値を設定する。これを上書きしたい場合は、各Podの```metadata.annotations.proxy.istio.io/config.configPath```キーにオプションを設定する。

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

全ての```istio-proxy```コンテナに関して、分散トレースの収集を有効化するか否かを設定する。

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

全ての```istio-proxy```コンテナに関して、使用するGatewayの```metadata.labels.istio```キー値を設定する。IngressGatewayをIngressコントローラーとして使用でき、デフォルトでは```ingressgateway```が設定される。

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

全ての```istio-proxy```コンテナに関して、使用するIngressコントローラーの```metadata.labels.istio```キー値を設定する。IngressGatewayをIngressとして使用でき、デフォルトでは```ingressgateway```が設定される。

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

全ての```istio-proxy```コンテナに関して、Cluster外からのインバウンド通信（特にHTTPプロトコル通信）を待ち受けるポート番号を設定する。

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

全ての```istio-proxy```コンテナに関して、他マイクロサービスからのインバウンド通信を待ち受けるポート番号を設定する。

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

IstioOperator制御で作成されるIstioリソースのNamespaceを設定する。

ℹ️ 参考：https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/#IstioOperatorSpec

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

applyに使用するプロファイルを設定する。

ℹ️ 参考：https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/#IstioOperatorSpec

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

コントロールプレーン（Istiod）をカナリアリリースを使用してアップグレードする場合、新しく作成するバージョンを設定する。バージョンの表記方法がハイフン繋ぎであることに注意する。

ℹ️ 参考：

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

ℹ️ 参考：

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

IstioOperatorに、Helmを使用させてIstioリソースを作成する場合、Helmの```values```ファイルの代わりになる。

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

```istio-proxy```コンテナごとのオプション値を設定する。

ℹ️ 参考：https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#custom-templates-experimental

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
