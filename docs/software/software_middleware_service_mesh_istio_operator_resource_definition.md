---
title: 【IT技術の知見】IstioOperator＠Istio
description: IstioOperator＠Istioの知見を記録しています。
---

# IstioOperator＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### インストール

#### ▼ チャートとして

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

プロファイルは、設定済みのIstioOperatorのチャートであり、`istioctl`コマンドインストール時に`manifests`ディレクトリ以下に同梱される。

`(1)`

: `istioctl`コマンドでIstioOperatorを指定する。IstioOperatorは、デフォルト値は`istio-system`にIstioリソースを作成するようになっている。

```bash
$ istioctl operator init

Installing operator controller in namespace: istio-operator using image: docker.io/istio/operator:<リビジョン>
Operator controller will watch namespaces: istio-system
✅ Istio operator installed
✅ Installation complete
```

> - https://istio.io/latest/docs/setup/install/operator/

`(2)`

: IstioOperatorが定義されたマニフェストを、`istioctl`コマンドまたは`kubectl`コマンドを使用して、Istioリソースを作成する。

     その代わりにここで、IstioOperatorにHelmを使用させてIstioリソースを作成することもできる。`kubectl apply`コマンドでも作成できるが、成否の実行ログがわかりにくいことに注意する。

```bash
# istioctlコマンド
$ istioctl install -y -f ./istio-operator.yaml

✅ Istio core installed
✅ Istiod installed
✅ Ingress gateways installed
✅ Installation complete
Making this installation the default for injection and validation.
```

```bash
# kubectlコマンド
$ kubectl apply -f istio-operator.yaml

istiooperator.install.istio.io/istio-operator created
```

> - https://istio.io/latest/docs/setup/install/istioctl/#install-istio-using-the-default-profile
> - https://istio.io/latest/docs/setup/install/operator/#install-istio-with-the-operator

#### ▼ チャートとして

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

チャートは、`istioctl`コマンドインストール時の`manifests`ディレクトリ以下に同梱されている。

```bash
$ helm install <Helmリリース名> manifests/charts/istio-operator -n istio-operator --version <バージョンタグ>
```

> - https://istio.io/latest/docs/setup/install/operator/#deploy-the-istio-operator
> - https://tech.griphone.co.jp/2020/12/12/istio-operator-101/

<br>

## 02. metadata

### .metadata.name

リソース名は`istio-operator`とする必要がある。

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

> - https://cloud.ibm.com/docs/containers?topic=containers-istio-custom-gateway&locale=en
> - https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/#IstioComponentSetSpec

#### ▼ `<component名>`.k8s

各componentが共通的に持つ設定項目である。

各種Kubernetesリソースと同じ設定値を拡張機能として設定できる。

ただし、執筆時点 (2022/06/04) では、これを使用することは非推奨である。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  components:
    <component名>:
      enabled: "true"
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
                    - key: node.kubernetes.io/nodetype
                      operator: In
                      # meshというNodeグループにスケジューリングさせられるようにする。
                      values:
                        - mesh
```

#### ▼ base

baseコンポーネントのオプションを設定する。

baseコンポーネントを有効化しないと、カスタムリソースを作成できない。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  components:
    base:
      enabled: "true"
```

> - https://tanzu.vmware.com/developer/guides/service-routing-istio-refarch/
> - https://github.com/istio/istio/issues/22491#issuecomment-604745090

#### ▼ cni

istio-cniコンポーネントのオプションを設定する。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  components:
    cni:
      enabled: "true"
      namespace: kube-system
```

> - https://tanzu.vmware.com/developer/guides/service-routing-istio-refarch/

#### ▼ egressGateways

IstioOperatorで管理するIstio Egress Gatewayのオプションを設定する。

Istio Egress Gatewayを直接的に作成するのではなく、IstioOperatorに作成させる。

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
        enabled: "true"
```

`.spec.egressGateways.k8s`キーでServiceの定義を設定できるが、これは非推奨である。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  components:
    ingressGateways:
      - name: istio-egressgateway
        enabled: "true"
        k8s:
          service:
            type: ClusterIP
            ports:
              - name: http
                port: 80
                protocol: TCP
                targetPort: 80
```

#### ▼ ingressGateways

IstioOperatorで管理するIstio Ingress Gatewayのオプションを設定する。

Istio Ingress Gatewayを直接的に作成するのではなく、IstioOperatorに作成させる。

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
        enabled: "true"
```

`.spec.ingressGateways.k8s`キーでServiceの定義を設定できるが、これは非推奨である。

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
        enabled: "true"
        k8s:
          service:
            type: NodePort
            ports:
              - name: http
                port: 80
                protocol: TCP
                targetPort: 80
```

> - https://atmarkit.itmedia.co.jp/ait/articles/2111/05/news005.html#022

最終的な設定値は、`kubectl get`コマンドで確認できる。

```yaml
$ kubectl get service istio-ingressgateway -o yaml -n istio-system
---
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
    istio.io/rev: default
    operator.istio.io/component: IngressGateways
    operator.istio.io/managed: Reconcile
    operator.istio.io/version: 1.12.1
    release: istio
  name: istio-ingressgateway
  namespace: istio-system
spec:
  allocateLoadBalancerNodePorts: "true"
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

補足として、以下の方法でユーザー定義のIstio Ingress Gatewayを作成できる (かなり大変) 。

> - https://faun.pub/setup-multiple-ingress-gateways-in-istio-52ad0dc7f99d
> - https://github.com/istio/istio/issues/23303

#### ▼ istiodRemote

istiodコンポーネントのオプションを設定する。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  components:
    istiodRemote:
      enabled: "false"
```

> - https://tanzu.vmware.com/developer/guides/service-routing-istio-refarch/

#### ▼ pilot

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  components:
    pilot:
      enabled: "true"
```

> - https://tanzu.vmware.com/developer/guides/service-routing-istio-refarch/

<br>

### .spec.defaultRevision

#### ▼ defaultRevisionとは

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  defaultRevision: "true"
```

> - https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/#IstioOperatorSpec

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

### .spec.namespace

#### ▼ namespaceとは

IstioOperator管理で作成されるIstioリソースのNamespaceを設定する。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  namespace: foo
```

> - https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/#IstioOperatorSpec

<br>

### .spec.profile

#### ▼ profileとは

プロファイルを設定する。

実際には設定済みのIstioOperatorである。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  profile: default
```

> - https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/#IstioOperatorSpec

<br>

### .spec.revision

#### ▼ revisionとは

Istiodコントロールプレーンをカナリアリリースを使用してアップグレードする場合、新しく作成するバージョンを設定する。

バージョンの表記方法がハイフン繋ぎであることに注意する。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  revision: 1-10-0 # ハイフン繋ぎのバージョン表記
```

> - https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/#IstioOperatorSpec
> - https://istio.io/latest/docs/setup/upgrade/canary/

<br>

### .spec.tag

#### ▼ tagとは

Istioリソースを構成するコンテナのベースイメージのバージョンを設定する。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  tag: 1.12.1
```

> - https://hub.docker.com/r/istio/proxyv2/tags
> - https://github.com/istio/istio/blob/1.14.3/pilot/docker/Dockerfile.proxyv2

<br>

### .spec.values

#### ▼ valuesとは

`manifests/charts/global.yaml`ファイルの設定値を上書きする。

> - https://github.com/istio/istio/blob/1.14.3/manifests/profiles/default.yaml#L43

#### ▼ base

`values`ファイルの`base`の項目を上書きする。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  values:
    base:
      enableCRDTemplates: "false"
      validationURL: ""
```

#### ▼ gateways.istio-egressgateway

`values`ファイルの`istio-egressgateway`の項目を上書きする。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  values:
    gateways:
      # Istio Egress Gateway
      istio-egressgateway:
        env: {}
        autoscaleEnabled: "true"
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

`values`ファイルの`istio-ingressgateway`の項目を上書きする。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  values:
    gateways:
      # Istio Ingress Gateway
      istio-ingressgateway:
        env: {}
        # IstioOperatorをroot権限の実行ユーザーを使用する
        runAsRoot: "true"
        autoscaleEnabled: "true"
        type: LoadBalancer
        name: istio-ingressgateway
        secretVolumes:
          - name: ingressgateway-certs
            secretName: istio-ingressgateway-certs
            mountPath: /etc/istio/ingressgateway-certs
          - name: ingressgateway-ca-certs
            secretName: istio-ingressgateway-ca-certs
            mountPath: /etc/istio/ingressgateway-ca-certs
```

#### ▼ pilot

`values`ファイルの`pilot`の項目を上書きする。

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  values:
    pilot:
      autoscaleEnabled: "true"
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
      enableProtocolSniffingForOutbound: "true"
      enableProtocolSniffingForInbound: "true"
      deploymentLabels:
      podLabels: {}
      configMap: "true"
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

istio-proxyごとのオプション値を設定する。

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

> - https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#custom-templates-experimental

<br>
