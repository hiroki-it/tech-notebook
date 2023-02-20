---
title: 【IT技術の知見】リソース定義＠Istio
description: リソース定義＠Istioの知見を記録しています。
---

# リソース定義＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 全部入りセットアップ

### インストール

#### ▼ チャートとして

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

チャートは、`istioctl`コマンドインストール時に`manifests`ディレクトリ以下に同梱される。

```bash
# IstioOperatorのdemoをインストールし、リソースを作成する。
$ istioctl install --set profile=demo

# 外部のチャートを使用する場合
$ istioctl install --manifests=foo-chart
```

> ↪️ 参考：https://istio.io/latest/docs/setup/install/istioctl/#install-from-external-charts

執筆時点 (2023/01/16) でIstioOperatorは非推奨になっている。

> ↪️ 参考：https://www.solo.io/blog/3-most-common-ways-install-istio/

#### ▼ GCRから (ユーザー定義)

プロファイルを使用する代わりに、IstioOperatorを独自で定義しても良い。

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

> ↪️ 参考：https://istio.io/latest/docs/setup/install/operator/#install-istio-with-the-operator

<br>

## 01-02. コンポーネント別セットアップ

### インストール

#### ▼ Google-APIsから

Google-APIsから、Istioのコンポーネント別にチャートをインストールし、リソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://istio-release.storage.googleapis.com/charts

$ helm repo update

$ kubectl create namespace istio-system

# 共通部分 (IstioBase) のみ
# baseチャート
$ helm install <リリース名> <チャートリポジトリ名>/base -n istio-system --version <バージョンタグ>

# Istiodコントロールプレーンのみ
# istiodチャート
$ helm install <リリース名> <チャートリポジトリ名>/istiod -n istio-system --version <バージョンタグ>
```

IngressGatewayのインストールは必須ではない。

```bash
# IngressGatewayのみ
# gatewayチャート
$ helm install <リリース名> <チャートリポジトリ名>/gateway -n istio-system --version <バージョンタグ>
```

> ↪️ 参考：https://istio.io/latest/docs/setup/install/helm/#installation-steps

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

VirtualServiceとDestinationRuleの設定値は、`istio-proxy`コンテナに適用される。

> ↪️ 参考：
>
> - https://sreake.com/blog/istio/
> - https://istio.io/latest/docs/reference/config/networking/virtual-service/
> - https://istio.io/latest/docs/reference/config/networking/destination-rule/

#### ▼ EnvoyFilterの定義

`istio-proxy`コンテナの設定を上書きできる。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/envoy-filter/

#### ▼ annotationsの定義

DeploymentやPodの`.metadata.anontations`キーにて、`istio-proxy`コンテナごとのオプション値を設定する。

Deploymentの場合は、`template`キーよりも下層の``.metadata.`キーを使用することに注意する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/annotations/

#### ▼ `istio-proxy`コンテナの定義

DeploymentやPodで`istio-proxy`コンテナを定義することにより設定を上書きできる。

**＊実装例＊**

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
            # istio-proxyコンテナ終了直前の処理
            preStop:
              exec:
                # istio-proxyコンテナが、必ずアプリコンテナよりも後に終了するようにする。
                # envoyプロセスとpilot-agentプロセスの終了を待機する。
                command:
                  - "/bin/bash"
                  - "-c"
                  - |
                    sleep 5
                    while [ $(netstat -plnt | grep tcp | egrep -v 'envoy|pilot-agent' | wc -l) -ne 0 ]; do sleep 1; done"
            # istio-proxyコンテナ開始直後の処理
            postStart:
              exec:
                # istio-proxyコンテナが、必ずアプリコンテナよりも先に起動するようにする。
                # pilot-agentの起動完了を待機する。
                command:
                  - |
                    pilot-agent wait
```

> ↪️ 参考：https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#customizing-injection

<br>

## 03. 共通設定

### .apiVersion

Istio-APIのバージョンを設定する。

Kubernetesとは異なることに注意する。

```yaml
apiVersion: networking.istio.io/v1beta1
```

<br>

### .kind

作成するIstioリソースを設定する。

- DestinationRule
- Gateway
- VirtualService

<br>

### .metadata

#### ▼ metadataとは

Istioリソースの一意に識別するための情報を設定する。

#### ▼ namespace

Istioリソースを作成するNamespaceを設定する。デフォルトで`istio-system`になる。

**＊実装例＊**

```yaml
metadata:
  namespace: istio-system
```

<br>

## 04. Namespaceの`.metadata.labels`キー

### istio-injection

指定したNamespaceに属するPod内に`istio-proxy`コンテナを自動的にインジェクションするか否かを設定する。

`istio.io/rev`キーとはコンフリクトを発生させるため、どちらかしか使えない (`istio-injection`キーの値が`disabled`の場合は共存できる) 。

`istio-injection`キーを使用する場合、Istioのアップグレードがインプレース方式になる。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: app-namespace
  labels:
    istio-injection: enabled
```

アプリケーション以外のNamespaceでは`disabled`値を設定することが多い。

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: observability-namespace
  labels:
    istio-injection: disabled
---
apiVersion: v1
kind: Namespace
metadata:
  name: chaos-mesh-namespace
  labels:
    istio-injection: disabled
```

> ↪️ 参考：https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#controlling-the-injection-policy

<br>

### istio.io/rev

指定したNamespaceに属するPod内に`istio-proxy`コンテナを自動的にインジェクションするか否かを設定する。

IstoOperatorの`.spec.revision`キーと同じである。

`istio-injection`キーとはコンフリクトを発生させるため、どちらかしか使えない (`istio-injection`キーの値が`disabled`の場合は共存できる) 。

`istio.io/rev`キーを使用する場合、Istioのアップグレードがカナリア方式になる。

**＊実装例＊**

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: app-namespace
  labels:
    istio.io/rev: stable
---
apiVersion: v1
kind: Namespace
metadata:
  name: observability-namespace
  labels:
    istio-injection: disabled # disabledであれば、istio.io/revキーと共存できる。
---
apiVersion: v1
kind: Namespace
metadata:
  name: chaos-mesh-namespace
  labels:
    istio-injection: disabled
```

> ↪️ 参考：https://istio.io/latest/blog/2021/direct-upgrade/#upgrade-from-18-to-110

<br>

## 04-02. Podの`.metadata.annotations`キー

### annotationsとは

Deploymentの`.spec.template`キーや、Podの` .metadata.``キーにて、 `istio-proxy`コンテナごとのオプション値を設定する。Deploymentの`.metadata.``キーで定義しないように注意する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/annotations/

<br>

### istio.io/rev

IstoOperatorの`.spec.revision`キーと同じ。

特定のPodで、Istioとこれのカナリアリリースを有効化するか否かを設定する。

**＊実装例＊**

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
        istio.io/rev: 1-0-0
```

<br>

### proxy.istio.io

#### ▼ proxy.istio.ioとは

`istio-proxy`コンテナのプロセスの設定値を上書きし、ユーザー定義の値を設定する。

#### ▼ configPath

デフォルトでは、`./etc/istio/proxy`ディレクトリ配下に最終的な設定値ファイルが作成される。

**＊実装例＊**

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
        proxy.istio.io/config: |
          configPath: ./etc/istio/proxy
```

> ↪️ 参考：https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig

#### ▼ parentShutdownDuration

`istio-proxy`コンテナ上のEnvoyの親プロセスを終了するまでに待機する時間を設定する。

`istio-proxy`コンテナ自体の終了タイミングを決める`terminationDrainDuration`キーよりも、最低`5`秒以上長くすると良い。

**＊実装例＊**

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
        proxy.istio.io/config: |
          parentShutdownDuration: "80s"
```

> ↪️ 参考：
>
> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig
> - https://www.envoyproxy.io/docs/envoy/latest/operations/cli#cmdoption-parent-shutdown-time-s
> - https://christina04.hatenablog.com/entry/k8s-graceful-stop-with-istio-proxy

#### ▼ terminationDrainDuration

SIGKILLシグナルを`istio-proxy`コンテナに送信するまでに待機する時間を設定する。

この待機時間を経た後に、SIGKILLシグナルを`istio-proxy`コンテナに送信する。

**＊実装例＊**

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
        proxy.istio.io/config: |
          terminationDrainDuration: "75s"
```

> ↪️ 参考：
>
> - https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#ProxyConfig
> - https://www.envoyproxy.io/docs/envoy/latest/operations/cli#cmdoption-drain-time-s
> - https://christina04.hatenablog.com/entry/k8s-graceful-stop-with-istio-proxy

<br>

### sidecar.istio.io/inject

特定のPodで、Istioとこれのインプレースアップグレードを有効化するか否かを設定する。

> ↪️ 参考：https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#controlling-the-injection-policy

**＊実装例＊**

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

<br>

### sidecar.istio.io/proxyCPU

`istio-proxy`コンテナで使用するCPUサイズを設定する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/annotations/

**＊実装例＊**

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

<br>

### sidecar.istio.io/proxyImage

`istio-proxy`コンテナの作成に使用するコンテナイメージを設定する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/annotations/

**＊実装例＊**

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

<br>

### sidecar.istio.io/proxyMemory

`istio-proxy`コンテナで使用するメモリサイズを設定する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/annotations/

**＊実装例＊**

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

### .spec.exportTo

#### ▼ exportToとは

そのDestinationRuleを使用できるNamespaceを設定する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#VirtualService

#### ▼ `*` (アスタリスク)

全てのNamespaceで使用できるようにする。

**＊実装例＊**

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

#### ▼ `.` (ドット)

全てのNamespaceのうちで、`.metadata.namespace`キーのNamespaceでのみ使用できるようにする。

DestinationRuleを想定外のNamespaceで使用してしまうことを防ぐ。

**＊実装例＊**

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

### .spec.host

インバウンド通信のルーティング元とするServiceの名前を設定する。

これにより、Envoyは特定のServiceからのルーティングのみ受信するようになる。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/destination-rule/#DestinationRule

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

### .spec.subsets

#### ▼ subsetsとは

![istio_virtual-service_destination-rule_subset](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_virtual-service_destination-rule_subset.png)

ルーティング先のPodの`.metadata.labels`キーを設定する

> ↪️ 参考：
>
> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#Subset
> - https://atmarkit.itmedia.co.jp/ait/articles/2112/21/news009.html
> - https://blog.1q77.com/2020/03/istio-part3/

**＊実装例＊**

サブセットv1に対するインバウンド通信では、`version`キーの値が`v1`であるPodにルーティングする。

`v2`も同様である。

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

### .spec.trafficPolicy

#### ▼ connectionPool

Podの同時接続数の制限数を設定する。

制限を超過した場合、Podへのルーティングが停止し、直近の成功時の処理結果を返信する (サーキットブレイカー) 。

> ↪️ 参考：
>
> - https://istio.io/latest/docs/tasks/traffic-management/circuit-breaking/
> - https://istio.io/latest/docs/concepts/traffic-management/#circuit-breakers

**＊実装例＊**

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

#### ▼ outlierDetection

サーキットブレイカーを設定する。

> ↪️ 参考：https://speakerdeck.com/nutslove/istioru-men?slide=25

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  namespace: istio-system
  name: foo-destination-rule
spec:
  trafficPolicy:
    outlierDetection:
      interval: 10s # エラー検知の間隔
      consecutiveGatewayErrors: 3 # サーキットブレイカーを実施するエラーの閾値数
      baseEjectionTime: 30s # Podをルーティング先から切り離す秒数
      maxEjectionPercent: 99
```

#### ▼ loadBalancer

Podへのルーティング時に使用するロードバランシングアルゴリズムを設定する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/destination-rule/#LoadBalancerSettings

**＊実装例＊**

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

Podのポート番号別のルーティングのロードバランシングアルゴリズムを設定する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/destination-rule/#TrafficPolicy-PortTrafficPolicy

**＊実装例＊**

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

Podのポート番号別ルーティングで使用するポート番号を設定する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/destination-rule/#TrafficPolicy-PortTrafficPolicy

**＊実装例＊**

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

Podへのルーティング時に使用するHTTPSプロトコルのタイプを設定する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/destination-rule/#ClientTLSSettings-TLSmode

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  namespace: istio-system
  name: foo-destination-rule
spec:
  trafficPolicy:
    tls:
      mode: DISABLE # HTTPプロトコル
```

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  namespace: istio-system
  name: foo-destination-rule
spec:
  trafficPolicy:
    tls:
      mode: ISTIO_MUTUAL # 相互TLS
```

<br>

## 06. EnvoyFilter

### .spec.configPatches

#### ▼ applyTo

上書きしたい`envoy.yaml`ファイルの項目を設定する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ApplyTo

**＊実装例＊**

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

#### ▼ match

上書きしたい`envoy.yaml`ファイルのCluster項目を設定する。

**＊実装例＊**

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

#### ▼ listener

上書きしたい`envoy.yaml`ファイルのListener項目を設定する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ListenerMatch

**＊実装例＊**

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

上書きしたい`envoy.yaml`ファイルの通信の方向を設定する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-PatchContext

**＊実装例＊**

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

#### ▼ patch

`envoy.yaml`ファイルの上書き方法と上書き内容を設定する。

**＊実装例＊**

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

> ↪️ 参考：
>
> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch
> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch-Operation
> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch-FilterClass

<br>

### EnvoyFilter例

#### ▼ KeepAliveの設定

istio-ingressgatewayのPod内の`istio-proxy`コンテナで、KeepAliveを実行できるようにする。

> ↪️ 参考：https://blog.1q77.com/2020/12/istio-downstream-tcpkeepalive/

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: istio-ingressgateway
  namespace: foo-namespace
spec:
  configPatches:
    - applyTo: LISTENER
      match:
        context: GATEWAY
        listener:
          name: 0.0.0.0_8443
          portNumber: 8443
      patch:
        operation: MERGE
        value:
          socket_options:
            - level: 1
              name: 9
              # KeepAliveを有効にする。
              int_value: 1
              state: STATE_PREBIND
            - level: 6
              name: 4
              # 15秒間の無通信が発生したら、KeepAliveを実行する。
              int_value: 15
              state: STATE_PREBIND
            - level: 6
              name: 5
              # 15秒間隔で、KeepAliveを実行する。
              int_value: 15
              state: STATE_PREBIND
            - level: 6
              name: 6
              # 3回応答がなければ終了する。
              int_value: 3
              state: STATE_PREBIND
```

<br>

## 07. Gateway

### .spec.selector

#### ▼ selectorとは

Gatewayの適用対象のIngressGatewayに付与された`.metadata.labels`キーを設定する。

デフォルトでは、IngressGatewayには`istio`ラベルがあり、値は`ingressgateway`である。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Gateway

**＊実装例＊**

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

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app.kubernetes.io/name: istio-ingressgateway
    istio: ingressgateway
```

<br>

### .spec.servers

#### ▼ port.name

ポート名を設定する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Port

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
        name: http
```

#### ▼ port.number

インバウンド通信を待ち受けるポート番号を設定する。

IngressGatewayの内部的なServiceのタイプに関して、NodePort Serviceを選んだ場合、Nodeが待ち受けるポート番号に合わせて`30000`番ポートとする。

一方で、LoadBalancer Serviceを選んだ場合、LoadBalancerがルーティングできる任意のポート番号とする。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Port

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
        number: 30000
```

#### ▼ port.protocol

受信するインバウンド通信のプロトコルを設定する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Port

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

#### ▼ port.targetPort

ServiceEntryで追加したサービスディスカバリーの宛先のポート番号を設定する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/gateway/#Port

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
        targetPort: 80
```

#### ▼ hosts

Gatewayでフィルタリングするインバウンド通信の`Host`ヘッダー名を設定する。

ドメインレジストラのドメインのみを許可しても良いが、 ワイルドカードを使用して全てのドメインを許可してもよい。

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

#### ▼ tls.credentialName

GatewayでHTTPSプロトコルのインバウンド通信を受信する場合、SSL証明書を保持するSecretを設定する。

SSL証明書のファイルを指定する場合は、`.spec.servers[].tls.serverCertificate`キーを設定する。

Secretを更新した場合、Podを再起動せずに、PodにSecretを再マウントできる。

> ↪️ 参考：https://stackoverflow.com/questions/63621461/updating-istio-ingressgateway-tls-cert

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
        credentialName: istio-gateway-certificate-secret
```

#### ▼ tls.privateKey

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/gateway/#ServerTLSSettings

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
        privateKey: /etc/certs/privatekey.pem
```

#### ▼ tls.serverCertificate

GatewayでHTTPSプロトコルのインバウンド通信を受信する場合、SSL証明書のファイルを設定する。

SSL証明書を保持するSecretを指定する場合は、`.spec.servers[].tls.credentialName`キーを設定する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/gateway/#ServerTLSSettings

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

### .spec.mtls

#### ▼ mtls

`istio-proxy`コンテナ間の通信で相互TLSを有効化するか否かを設定する。

Kubernetesのみで相互TLSをセットアップしようとすると大変であり、Istioを使うとより簡単にセットアップできる。

> ↪️ 参考：https://hemantkumar.net/kubernetes-mutual-auth-with-diffferent-cas.html

#### ▼ mode

相互TLSのタイプを設定する。

| 項目       | 説明                                                           |
| ---------- | -------------------------------------------------------------- |
| UNSET      | 調査中...                                                      |
| DISABLE    | 相互TLSを使用しない。                                          |
| PERMISSIVE | 相互TLSの時、プロトコルはHTTPSとHTTPの両方を許可する。         |
| STRICT     | 相互TLSの時、プロトコルはHTTPSのみを許可し、HTTPを許可しない。 |

> ↪️ 参考：https://istio.io/latest/docs/reference/config/security/peer_authentication/#PeerAuthentication-MutualTLS-Mode

**＊実装例＊**

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

## 09. ServiceEntry

### .spec.hosts

#### ▼ hostsとは

コンフィグストレージに登録する宛先のドメイン名を設定する。

宛先のドメインレジストラのドメインのみを許可しても良いが、ワイルドカードを使用して全てのドメインを許可してもよい。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ServiceEntry
metadata:
  name: foo-app-service-entry
spec:
  hosts:
    - "*"
```

<br>

### .spec.ports

#### ▼ portsとは

コンフィグストレージに登録する宛先のポート番号を設定する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ServiceEntry
metadata:
  name: foo-app-service-entry
spec:
  ports:
    - name: http
      number: 80
      protocol: HTTP
    - name: https
      number: 443
      protocol: HTTPS
```

<br>

### .spec.resolution

#### ▼ resolutionとは

コンフィグストレージに登録する宛先のIPアドレスの設定する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ServiceEntry
metadata:
  name: foo-app-service-entry
spec:
  resolution: DNS # DNSサーバーから返信されたIPアドレスを許可する。
```

<br>

## 10. VirtualService

### .spec.exportTo

#### ▼ exportToとは

そのVirtualServiceを使用できるNamespaceを設定する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#VirtualService

#### ▼ `*` (アスタリスク)

全てのNamespaceでのみ使用できるようにする。

**＊実装例＊**

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

#### ▼ `.` (ドット)

VirtualServiceと同じNamespaceで、そのVirtualServiceを指定できるようにする。

VirtualServiceを想定外のNamespaceで指定してしまうことを防ぐ。

**＊実装例＊**

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

### .spec.hosts

#### ▼ hostsとは

Gatewayから受信するインバウンド通信の`Host`ヘッダー名を設定する。

ドメインレジストラのドメインのみを許可しても良いが、 ワイルドカードを使用して全てのドメインを許可してもよい。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  namespace: istio-system
  name: foo-virtual-service
spec:
  hosts:
    - "*"
```

<br>

### .spec.gateways

#### ▼ gatewaysとは

インバウンド通信をいずれのGatewayから受信するかを設定する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#VirtualService

#### ▼ `<Namespace名>/<Gateway名>`

Gateway名とこれのNamespaceを設定する。

VirtualServiceとGatewayが同じNamespaceに属する場合は、Namespaceを省略できる。

**＊実装例＊**

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

#### ▼ `<Gateway名>`

Gateway名を設定する。

VirtualServiceとGatewayが同じNamespaceに属する場合は、Namespaceを省略できる。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  namespace: istio-system
  name: foo-virtual-service
spec:
  gateways:
    - foo-gateway
```

#### ▼ mesh

アプリコンテナ間の通信を有効化するか否かを設定する。

**＊実装例＊**

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

### .spec.http

#### ▼ httpとは

HTTP/1.1、HTTP/2、gRPC、のプロトコルによるインバウンド通信を、Serviceを介してDestinationRuleにルーティングする。

ルーティング先のServiceを厳格に指定するために、Serviceの`.spec.ports.appProtocol`キーまたはプロトコル名をIstioのルールに沿ったものにする必要がある。

> ↪️ 参考：
>
> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#HTTPRoute
> - https://istio.io/latest/docs/ops/configuration/traffic-management/protocol-selection/#explicit-protocol-selection

#### ▼ fault

発生させるフォールトインジェクションを設定する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  namespace: istio-system
  name: foo-virtual-service
spec:
  http:
    - fault:
        - abort:
            httpStatus: 503 # 発生させるエラー
            percentage:
              value: 100 # エラーを発生させる確率
```

> ↪️ 参考：https://speakerdeck.com/nutslove/istioru-men?slide=19

#### ▼ match

受信したインバウンド通信のうち、ルールを適用するもののメッセージ構造を設定する。

**＊実装例＊**

受信したインバウンド通信のうち、`x-foo`ヘッダーに`bar`が割り当てられたものだけにルールを適用する。

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

受信したインバウンド通信のうち、URLの接頭辞が`/foo`のものだけにルールを適用する。

> ↪️ 参考：https://istiobyexample.dev/path-based-routing/

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

#### ▼ retries.attempt

`istio-proxy`コンテナのリバースプロキシに失敗した場合の再試行回数を設定する。Serviceへのルーティングの失敗ではないことに注意する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  namespace: istio-system
  name: foo-virtual-service
spec:
  http:
    - retries:
        attempts: 3
```

#### ▼ retries.retryOn

再試行する失敗理由を設定する。`istio-proxy`コンテナは、レスポンスの`x-envoy-retry-on`ヘッダーに割り当てるため、これの値を設定する。

> ↪️ 参考：
>
> - https://sreake.com/blog/istio/
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#x-envoy-retry-on

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  namespace: istio-system
  name: foo-virtual-service
spec:
  http:
    - retries:
        retryOn: "connect-failure,refused-stream,unavailable,503"
```

#### ▼ route.destination.host

受信したインバウンド通信でルーティング先のServiceのドメイン名 (あるいはService名) を設定する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#Destination

**＊実装例＊**

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

受信するインバウンド通信でルーティング先のポート番号を設定する。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#Destination

**＊実装例＊**

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

![istio_virtual-service_destination-rule_subset](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_virtual-service_destination-rule_subset.png)

紐付けたいDestinationRuleのサブセット名と同じ名前を設定する。

IngressGatewayで受信したインバウンド通信を、Serviceを介して、紐づけたDestinationRuleのサブセットにルーティングされる。

> ↪️ 参考：
>
> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#Destination
> - https://atmarkit.itmedia.co.jp/ait/articles/2112/21/news009.html

**＊実装例＊**

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

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#HTTPRouteDestination

**＊実装例＊**

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

### .spec.tcp

#### ▼ tcpとは

TCP/IPのプロトコルによるインバウンド通信を、Serviceを介してDestinationRuleにルーティングする。

> ↪️ 参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/#TCPRoute

#### ▼ match

**＊実装例＊**

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

`.spec.http`キーと同じ機能である。

**＊実装例＊**

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

`.spec.http`キーと同じ機能である。

**＊実装例＊**

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

`.spec.http`キーと同じ機能である。

**＊実装例＊**

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
