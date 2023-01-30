---
title: 【IT技術の知見】IstioOperator＠Istio
description: IstioOperator＠Istioの知見を記録しています。
---

# IstioOperator＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. セットアップ

### インストール

#### ▼ チャートとして

```istioctl```コマンドを使用して、IstioOperatorのチャートをインストールし、リソースを作成する。

プロファイルは、設定済みのIstioOperatorのチャートであり、```istioctl```コマンドインストール時に```manifests```ディレクトリ以下に同梱される。



```【１】```

:    ```istioctl```コマンドでIstioOperatorを指定する。IstioOperatorは、デフォルトで```istio-system```にIstioリソースを作成するようになっている。

> ℹ️ 参考：https://istio.io/latest/docs/setup/install/operator/

```bash
$ istioctl operator init

Installing operator controller in namespace: istio-operator using image: docker.io/istio/operator:<リビジョン番号>
Operator controller will watch namespaces: istio-system
✔ Istio operator installed
✔ Installation complete
```

```【２】```

:    IstioOperatorが定義されたマニフェストを、```istioctl```コマンドまたは```kubectl```コマンドを使用して、Istioリソースを作成する。その代わりにここで、IstioOperatorにHelmを使用させてIstioリソースを作成することもできる。```kubectl apply```コマンドでも作成できるが、成否の実行ログがわかりにくいことに注意する。

> ℹ️ 参考：
>
> - https://istio.io/latest/docs/setup/install/istioctl/#install-istio-using-the-default-profile
> - https://istio.io/latest/docs/setup/install/operator/#install-istio-with-the-operator

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

#### ▼ チャートとして

IstioOperatorのチャートをインストールし、リソースを作成する。

チャートは、```istioctl```コマンドインストール時の```manifests```ディレクトリ以下に同梱されている。



> ℹ️ 参考：
>
> - https://istio.io/latest/docs/setup/install/operator/#deploy-the-istio-operator
> - https://tech.griphone.co.jp/2020/12/12/istio-operator-101/

```bash
$ helm install <リリース名> manifests/charts/istio-operator -n istio-operator --version <バージョンタグ>
```

<br>

## 02. metadata

### .metadata.name

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

### .spec.component

#### ▼ componentとは

IstioOperator管理でIstioリソースを作成する。



> ℹ️ 参考：
>
> - https://cloud.ibm.com/docs/containers?topic=containers-istio-custom-gateway&locale=en
> - https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/#IstioComponentSetSpec

#### ▼ ```<component名>```.k8s

各componentが共通して持つ設定項目である。

各種Kubernetesリソースと同じ設定値を拡張機能として設定できる。

ただし、執筆時点（2022/06/04）では、これを使用することは非推奨である。



```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  components:
    <component名>:
      enabled: true
      k8s:
        # HorizontalPodAutoscaler
        hpaSpec:
          maxReplicas: 10
          minReplicas: 2 # componentを冗長化する
        affinity:
          nodeAffinity:
            preferredDuringSchedulingIgnoredDuringExecution:
              - weight: 100 
                preference:
                  matchExpressions:
                    - key: app.kubernetes.io/nodegroup
                      operator: In
                      # meshというNodeグループにスケジューリングできるようにする。
                      values:
                        - mesh             
```

#### ▼ base

baseコンポーネントのオプションを設定する。

baseコンポーネントを有効化しないと、カスタムリソースを作成できない。



> ℹ️ 参考：
>
> - https://tanzu.vmware.com/developer/guides/service-routing-istio-refarch/
> - https://github.com/istio/istio/issues/22491#issuecomment-604745090

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  components:
    base:
      enabled: true
```

#### ▼ cni

istio-cniコンポーネントのオプションを設定する。

> ℹ️ 参考：https://tanzu.vmware.com/developer/guides/service-routing-istio-refarch/

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  components:
    cni:
      enabled: true
      namespace: kube-system
```

#### ▼ egressGateways

egressGatewaysコンポーネントのオプションを設定する。

EgressGatewayを直接的に作成するのではなく、IstioOperatorに作成させる。



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

ingressGatewaysコンポーネントのオプションを設定する。

IngressGatewaysを直接的に作成するのではなく、IstioOperatorに作成させる。



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
```

```.spec.ingressGateways.k8s```キーでIngressGatewayを設定できるが、これは非推奨である。



> ℹ️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/2111/05/news005.html#022

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
```

補足として、以下の方法で独自のIngressGatewayを作成できる（かなり大変）。



> ℹ️ 参考：
>
> - https://faun.pub/setup-multiple-ingress-gateways-in-istio-52ad0dc7f99d
> - https://github.com/istio/istio/issues/23303

最終的な設定値は、```kubectl get```コマンドで確認できる。



```bash
$ kubectl get service istio-ingressgateway -o yaml -n istio-system 

apiVersion: v1
kind: Service
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {...} # ここにも、.json形式で設定値が記載されている。
  creationTimestamp: "2022-01-01T12:00:00Z"
  labels:
    app: istio-ingressgateway
    install.operator.istio.io/owning-resource: istio-operator
    install.operator.istio.io/owning-resource-namespace: istio-system
    istio: ingressgateway
    istio.io/rev: stable
    operator.istio.io/component: IngressGateways
    operator.istio.io/managed: Reconcile
    operator.istio.io/version: 1.12.1
    release: istio
  name: istio-ingressgateway
  namespace: istio-system
spec:
  allocateLoadBalancerNodePorts: true
  clusterIP: *.*.*.*
  clusterIPs:
  - *.*.*.*
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
    - ip: *.*.*.*
```

#### ▼ istiodRemote

istiodコンポーネントのオプションを設定する。



> ℹ️ 参考：https://tanzu.vmware.com/developer/guides/service-routing-istio-refarch/

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  components:
    istiodRemote:
      enabled: false
```

#### ▼ pilot

> ℹ️ 参考：https://tanzu.vmware.com/developer/guides/service-routing-istio-refarch/

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  components:
    pilot:
      enabled: true

```

<br>

### .spec.defaultRevision

#### ▼ defaultRevisionとは

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/#IstioOperatorSpec

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  defaultRevision	: true
```

<br>

### .spec.hub

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

### .spec.meshConfig

#### ▼ meshConfigとは

全ての```istio-proxy```コンテナに共通する値を設定する。ここではEnvoyを使用した場合を説明する。

> ℹ️ 参考：https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig

#### ▼ accessLogEncoding

アクセスログのファイル形式を設定する。



```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  meshConfig:
    accessLogEncoding: JSON
```

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

```istio-proxy```コンテナ別に設定値を上書きしたい時に、そのデフォルト値を設定する。

これを上書きしたい場合は、各Podの```.metadata.annotations.proxy.istio.io/config.configPath```キーにオプションを設定する。

> ℹ️ 参考：https://github.com/istio/istio/blob/master/manifests/profiles/preview.yaml

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  meshConfig:
    defaultConfig:
      proxyMetadata:
        ISTIO_META_DNS_CAPTURE: "true"
        BOOTSTRAP_XDS_AGENT: "true"
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

#### ▼ holdApplicationUntilProxyStarts

istio-proxyコンテナが、必ずアプリコンテナよりも先に起動するか否かを設定する。

> ℹ️ 参考：https://www.zhaohuabing.com/istio-guide/docs/best-practice/startup-dependence/#%E8%A7%A3%E8%80%A6%E5%BA%94%E7%94%A8%E6%9C%8D%E5%8A%A1%E4%B9%8B%E9%97%B4%E7%9A%84%E5%90%AF%E5%8A%A8%E4%BE%9D%E8%B5%96%E5%85%B3%E7%B3%BB

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  meshConfig:
    holdApplicationUntilProxyStarts: true
```

オプションを有効化すると、```istio-proxy```コンテナの```postStart```キーに、```pilot-agent -wait```コマンドが挿入される。

> ℹ️ 参考：https://www.zhaohuabing.com/istio-guide/docs/best-practice/startup-dependence/#%E4%B8%BA%E4%BB%80%E4%B9%88%E9%9C%80%E8%A6%81%E9%85%8D%E7%BD%AE-sidecar-%E5%92%8C%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%E7%9A%84%E5%90%AF%E5%8A%A8%E9%A1%BA%E5%BA%8F

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

#### ▼ ingressSelector

全ての```istio-proxy```コンテナに関して、使用するGatewayの```.metadata.labels.istio```キーの値を設定する。

IngressGatewayをIngressコントローラーとして使用でき、デフォルトでは```ingressgateway```が設定される。

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

全ての```istio-proxy```コンテナに関して、使用するIngressコントローラーの```.metadata.labels.istio```キーの値を設定する。

IngressGatewayをIngressとして使用でき、デフォルトでは```ingressgateway```が設定される。

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

全ての```istio-proxy```コンテナに関して、他アプリコンテナからのインバウンド通信を待ち受けるポート番号を設定する。

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

### .spec.namespace

#### ▼ namespaceとは

IstioOperator管理で作成されるIstioリソースのNamespaceを設定する。



> ℹ️ 参考：https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/#IstioOperatorSpec

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  namespace: foo-namespace
```

<br>

### .spec.profile

#### ▼ profileとは

プロファイルを設定する。

実際には設定済みのIstioOperatorである。



> ℹ️ 参考：https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/#IstioOperatorSpec

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

### .spec.revision

#### ▼ revisionとは

Istiodコントロールプレーンをカナリアリリースを使用してアップグレードする場合、新しく作成するバージョンを設定する。

バージョンの表記方法がハイフン繋ぎであることに注意する。



> ℹ️ 参考：
>
> - https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/#IstioOperatorSpec
> - https://istio.io/latest/docs/setup/upgrade/canary/

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  revision: 1-0-0 # ハイフン繋ぎのバージョン表記
```

<br>

### .spec.tag

#### ▼ tagとは

Istioリソースを構成するコンテナのベースイメージのバージョンを設定する。



> ℹ️ 参考：
>
> - https://hub.docker.com/r/istio/proxyv2/tags
> - https://github.com/istio/istio/blob/master/pilot/docker/Dockerfile.proxyv2

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

### .spec.values

#### ▼ valuesとは

```manifests/charts/global.yaml```ファイルの設定値を上書きする。



> ℹ️ 参考：https://github.com/istio/istio/blob/5fe406f88e83e14a2ddafb6c9dd47362c00a87f6/manifests/profiles/default.yaml#L43

#### ▼ base

```values```ファイルの```base```の項目を上書きする。



```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  values:
    base:
      enableCRDTemplates: false
      validationURL: ""
```

#### ▼ gateways.istio-ingressgateway

```values```ファイルの```istio-egressgateway```の項目を上書きする。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  values:
    gateways:
      istio-egressgateway:
        env: {}
        autoscaleEnabled: true
        type: ClusterIP
        name: istio-egressgateway
        secretVolumes:
          - name: egressgateway-certs
            secretName: istio-egressgateway-certs
            mountPath: /etc/istio/egressgateway-certs
          - name: egressgateway-ca-certs
            secretName: istio-egressgateway-ca-certs
            mountPath: /etc/istio/egressgateway-ca-certs
```

#### ▼ gateways.istio-ingressgateway

```values```ファイルの```istio-ingressgateway```の項目を上書きする。

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
        # IstioOperatorをrootユーザーで実行する。
        runAsRoot: true
        autoscaleEnabled: true
        type: LoadBalancer
        name: istio-ingressgateway
        env: {}
        secretVolumes:
          - name: ingressgateway-certs
            secretName: istio-ingressgateway-certs
            mountPath: /etc/istio/ingressgateway-certs
          - name: ingressgateway-ca-certs
            secretName: istio-ingressgateway-ca-certs
            mountPath: /etc/istio/ingressgateway-ca-certs
```

#### ▼ pilot

```values```ファイルの```pilot```の項目を上書きする。



```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  values:
    pilot:
      autoscaleEnabled: true
      autoscaleMin: 1
      autoscaleMax: 5
      replicaCount: 1
      image: pilot
      traceSampling: 1.0
      env: {}
      cpu:
        targetAverageUtilization: 80
      nodeSelector: {}
      keepaliveMaxServerConnectionAge: 30m
      enableProtocolSniffingForOutbound: true
      enableProtocolSniffingForInbound: true
      deploymentLabels:
      podLabels: {}
      configMap: true
```

#### ▼ proxy_init

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  values:
    proxy_init:
    image: proxyv2
    resources:
      limits:
        cpu: 2000m
        memory: 1024Mi
      requests:
        cpu: 10m
        memory: 10Mi
```

#### ▼ sidecarInjectorWebhook

```istio-proxy```コンテナごとのオプション値を設定する。

> ℹ️ 参考：https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#custom-templates-experimental

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
              ...
```

<br>
