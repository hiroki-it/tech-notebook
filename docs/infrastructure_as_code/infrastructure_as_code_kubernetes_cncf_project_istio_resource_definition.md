---
title: 【IT技術の知見】リソース定義＠Istio
description: リソース定義＠Istioの知見を記録しています。
---

# リソース定義＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 全部入りセットアップ

### インストール

#### ▼ チャートとして

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

チャートは、`istioctl`コマンドインストール時に`manifests`ディレクトリ以下に同梱される。

```bash
# IstioOperatorのdemoをインストールし、リソースを作成する。
$ istioctl install --set profile=demo revision=1-10-0

# 外部のチャートを使用する場合
$ istioctl install --manifests=foo-chart
```

> - https://istio.io/latest/docs/setup/install/istioctl/#install-from-external-charts

執筆時点 (2023/01/16) でIstioOperatorは非推奨になっている。

> - https://www.solo.io/blog/3-most-common-ways-install-istio/

#### ▼ Operatorとして (ユーザー定義)

プロファイルを使用する代わりに、IstioOperatorを独自で定義しても良い。

```yaml
# istio-operator.yamlファイル
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-operator
spec:
  # Istioのdemoチャートをインストールし、リソースを作成する。
  profile: demo
```

```bash
$ kubectl apply -f istio-operator.yaml
```

> - https://istio.io/latest/docs/setup/install/operator/#install-istio-with-the-operator

<br>

### ローカルマシンのセットアップ

#### ▼ Minikube

Istioによる種々のコンテナが稼働するために、MinikubeのNodeのCPUとメモリを最低サイズを以下の通りにする必要がある。

```bash
$ minikube start --cpus=4 --memory=16384
```

<br>

## 01-02. コンポーネント別セットアップ

### インストール

#### ▼ Google-APIsから

Google-APIsから、Istioのコンポーネント別にチャートをインストールし、リソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://istio-release.storage.googleapis.com/charts

$ helm repo update

$ kubectl create namespace istio-system

# baseチャート
$ helm install <Helmリリース名> <チャートリポジトリ名>/base -n istio-system --version <バージョンタグ>

# Istiodコントロールプレーンのみ
# istiodチャート
$ helm install <Helmリリース名> <チャートリポジトリ名>/istiod -n istio-system --version <バージョンタグ>
```

IngressGatewayのインストールは必須ではない。

```bash
# IngressGatewayのみ
# gatewayチャート
$ helm install <Helmリリース名> <チャートリポジトリ名>/gateway -n istio-system --version <バージョンタグ>
```

> - https://istio.io/latest/docs/setup/install/helm/#installation-steps

<br>

## 02. AuthorizationPolicy

### .spec.action

#### ▼ actionとは

認可スコープで、認証済みの送信元を許可するか否かを設定する。

```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: bar-authorization-policy
  namespace: istio-system
spec:
  action: ALLOW
```

> - https://istio.io/latest/docs/reference/config/security/authorization-policy/
> - https://news.mynavi.jp/techplus/article/kubernetes-30/

<br>

### .spec.provider

#### ▼ providerとは

認可フェーズの委譲先のIDプロバイダーを設定する。

事前に、ConfigMapの`.mesh.extensionProvider`キーにIDプロバイダーを登録しておく必要がある。

**＊実装例＊**

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

oauth2-proxyのPodに紐づくServiceを識別できるようにする。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    extensionProviders:
      - name: oauth2-proxy
        envoyExtAuthzHttp:
          service: oauth2-proxy.auth.svc.cluster.local
          port: 80
        includeHeadersInCheck:
          - cookie
          - authorization
```

> - https://zenn.dev/takitake/articles/a91ea116cabe3c#istio%E3%81%AB%E5%A4%96%E9%83%A8%E8%AA%8D%E5%8F%AF%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%82%92%E7%99%BB%E9%8C%B2
> - https://zenn.dev/takitake/articles/a91ea116cabe3c#%E5%BF%85%E8%A6%81%E3%81%AA%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%82%92%E4%BD%9C%E6%88%90-1
> - https://istio.io/latest/docs/tasks/security/authorization/authz-custom/#define-the-external-authorizer

<br>

### .spec.rules

#### ▼ rulesとは

認可スコープで、実施条件 (例：いずれのKubernetesリソース、HTTPリクエストのメソッド、JWTの発行元の識別子) を設定する。

その条件に合致した場合に、認証済みの送信元を許可するか否かを実施する。

#### ▼ 認証が『相互TLS認証』の場合

相互TLS認証の場合、送信元のPod紐づくServiceAccountが適切な場合に、認可を実施するように設定する。

**＊実装例＊**

```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: bar-authorization-policy
  namespace: istio-system
spec:
  rules:
    - from:
        - source:
            principals: ["cluster.local/ns/default/sa/inventory-sa"]
      to:
        - operation:
            methods: ["GET"]
```

> - https://istiobyexample-ja.github.io/istiobyexample/authorization/
> - https://istio.io/latest/docs/concepts/security/#dependency-on-mutual-tls
> - https://cloud.google.com/service-mesh/docs/security/authorization-policy-overview#best_practices

#### ▼ 認証が『JWTによるBearer認証』の場合

JWTによるBearer認証の場合、リクエストヘッダーにあるJWTの発行元が適切な場合に、認可を実施するように設定する。

**＊実装例＊**

```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: bar-authorization-policy
  namespace: istio-system
spec:
  rules:
    - from:
        - source:
            namespaces: ["foo"]
      to:
        - operation:
            methods: ["GET"]
      when:
        - key: request.auth.claims[iss]
          values: ["<JWTの発行元の識別子 (issuer)>"]
```

> - https://istio.io/latest/docs/reference/config/security/authorization-policy/
> - https://cloud.google.com/service-mesh/docs/security/authorization-policy-overview#best_practices
> - https://openid-foundation-japan.github.io/draft-ietf-oauth-json-web-token-11.ja.html#issDef

<br>

### .spec.selector

#### ▼ selectorとは

AuthorizationPolicyの設定を適用するKubernetesリソースを設定する。

設定したKubernetesリソースに対して認証済みの送信元が通信した場合に、AuthorizationPolicyを適用する。

```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: bar-authorization-policy
  namespace: istio-system
spec:
  selector:
    matchLabels:
      app: foo-pod
```

> - https://istio.io/latest/docs/reference/config/security/authorization-policy/
> - https://news.mynavi.jp/techplus/article/kubernetes-30/

<br>

## 03. DestinationRule

### .spec.exportTo

#### ▼ exportToとは

そのDestinationRuleを使用できるNamespaceを設定する。

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#VirtualService

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

全てのNamespaceのうちで、`.metadata.namespace`キーのNamespaceのみで使用できるようにする。

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

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#DestinationRule

<br>

### .spec.subsets

#### ▼ subsetsとは

ルーティング先のPodの`.metadata.labels`キーを設定する。

`.spec.subsets[*].name`キーの値は、VirtualServiceで設定した`.spec.http[*].route[*].destination.subset`キーに合わせる必要がある。

![istio_virtual-service_destination-rule_subset](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_virtual-service_destination-rule_subset.png)

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

#### ▼ connectionPool.http.maxRequestsPerConnection

EnvoyがHTTPプロトコルを処理する場合に、接続当たりのリクエストの上限値を設定する。

デフォルトでは上限がない。

`1`とする場合、Envoyによるkeep-aliveを無効化する。

また、サーキットブレイカーの閾値になる。

上限を超過した場合、Podへのルーティングが停止し、直近の成功時の処理結果を返信する (サーキットブレイカー) 。

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
        maxRequestsPerConnection: 1
```

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#ConnectionPoolSettings-HTTPSettings

#### ▼ connectionPool.http.http1MaxPendingRequests

記入中...

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
```

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#ConnectionPoolSettings-HTTPSettings

#### ▼ connectionPool.tcp.maxConnections

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
      tcp:
        maxConnections: 100
```

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#ConnectionPoolSettings-TCPSettings

#### ▼ outlierDetection

サーキットブレイカーを設定する。

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
      # エラー検知の間隔
      interval: 10s
      # サーキットブレイカーを実施するエラーの閾値数
      consecutiveGatewayErrors: 3
      # Podをルーティング先から切り離す秒数
      baseEjectionTime: 30s
      maxEjectionPercent: 99
```

> - https://speakerdeck.com/nutslove/istioru-men?slide=25
> - https://istio.io/latest/docs/tasks/traffic-management/circuit-breaking/
> - https://istio.io/latest/docs/concepts/traffic-management/#circuit-breakers

#### ▼ loadBalancer

Podへのルーティング時に使用するロードバランシングアルゴリズムを設定する。

**＊実装例＊**

複数のゾーンのPodに対して、ラウンドロビンでルーティングする。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  namespace: istio-system
  name: foo-destination-rule
spec:
  trafficPolicy:
    loadBalancer:
      # ラウンドロビン
      simple: ROUND_ROBIN
```

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#LoadBalancerSettings

**＊実装例＊**

指定したゾーンのPodに対して、指定した重みづけでルーティングする。

リージョン名やゾーン名は、Podの`topologyKey`キー（`topology.kubernetes.io/region`キー、`topology.kubernetes.io/zone`キー、など) の値を設定する。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  namespace: istio-system
  name: foo-destination-rule
spec:
  trafficPolicy:
    loadBalancer:
      localityLbSetting:
        enabled: true
        distribute:
          - from: <リージョン名>/<ゾーン名>/*
            to:
              "<リージョン名>/<ゾーン名>/*": 70
              "<リージョン名>/<ゾーン名>/*": 30
```

> - https://istio.io/latest/docs/tasks/traffic-management/locality-load-balancing/distribute/
> - https://istio.io/latest/docs/tasks/traffic-management/locality-load-balancing/

#### ▼ portLevelSettings.loadBalancer

Podのポート番号別のルーティングのロードバランシングアルゴリズムを設定する。

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

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#TrafficPolicy-PortTrafficPolicy

#### ▼ portLevelSettings.port

Podのポート番号別ルーティングで使用するポート番号を設定する。

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

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#TrafficPolicy-PortTrafficPolicy

#### ▼ tls.mode

Podへのルーティング時に使用するHTTPSプロトコルのタイプを設定する。

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
      mode: ISTIO_MUTUAL # 相互TLS認証
```

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#ClientTLSSettings-TLSmode

<br>

## 04. EnvoyFilter

### .spec.configPatches

#### ▼ applyTo

上書きしたい`envoy.yaml`ファイルの項目を設定する。

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

> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ApplyTo

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

> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ListenerMatch

#### ▼ PatchContext

上書きしたい`envoy.yaml`ファイルの通信の方向を設定する。

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

> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-PatchContext

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

> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch
> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch-Operation
> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch-FilterClass

<br>

### EnvoyFilter例

#### ▼ KeepAliveの設定

istio-ingressgatewayのPod内の`istio-proxy`コンテナで、KeepAliveを実行できるようにする。

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

> - https://blog.1q77.com/2020/12/istio-downstream-tcpkeepalive/

<br>

## 04-02. EnvoyFilter以外のカスタマイズ方法

### VirtualService、DestinationRuleの定義

VirtualServiceとDestinationRuleの設定値は、`istio-proxy`コンテナに適用される。

> - https://sreake.com/blog/istio/
> - https://istio.io/latest/docs/reference/config/networking/virtual-service/
> - https://istio.io/latest/docs/reference/config/networking/destination-rule/

<br>

### annotationsの定義

DeploymentやPodの`.metadata.anontations`キーにて、`istio-proxy`コンテナごとのオプション値を設定する。

> - https://istio.io/latest/docs/reference/config/annotations/

<br>

### `istio-proxy`コンテナの定義

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
      app.kubernetes.io/name: foo-pod
  template:
    spec:
      containers:
        - name: app
          image: app
        # istio-proxyコンテナの設定を上書きする。
        - name: istio-proxy
          lifecycle:
            # istio-proxyコンテナ終了直前の処理
            preStop:
              exec:
                # istio-proxyコンテナが、必ずアプリコンテナよりも後に終了する。
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
                # istio-proxyコンテナが、必ずアプリコンテナよりも先に起動する。
                # pilot-agentの起動完了を待機する。
                command:
                  - |
                    pilot-agent wait
```

> - https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#customizing-injection

<br>

## 05. Gateway

### .spec.selector

#### ▼ selectorとは

Gatewayの適用対象のIngressGatewayに付与された`.metadata.labels`キーを設定する。

デフォルトでは、IngressGatewayには`istio`ラベルがあり、値は`ingressgateway`である。

> - https://istio.io/latest/docs/reference/config/networking/gateway/#Gateway

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

> - https://istio.io/latest/docs/reference/config/networking/gateway/#Port

#### ▼ port.number

インバウンド通信を待ち受けるポート番号を設定する。

IngressGatewayの内部的なServiceのタイプに関して、NodePort Serviceを選んだ場合、Nodeが待ち受けるポート番号に合わせて`30000`番ポートとする。

一方で、LoadBalancer Serviceを選んだ場合、LoadBalancerがルーティングできる任意のポート番号とする。

> - https://istio.io/latest/docs/reference/config/networking/gateway/#Port

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

> - https://istio.io/latest/docs/reference/config/networking/gateway/#Port

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

> - https://istio.io/latest/docs/reference/config/networking/gateway/#Port

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

ドメインレジストラのドメインのみを許可しても良いが、 ワイルドカード (`*`) を使用して全てのドメインを許可しても良い。

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

SSL証明書のファイルを指定する場合は、`.spec.servers[*].tls.serverCertificate`キーを設定する。

Secretを更新した場合、Podを再起動せずに、PodにSecretを再マウントできる。

> - https://stackoverflow.com/questions/63621461/updating-istio-ingressgateway-tls-cert

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

> - https://istio.io/latest/docs/reference/config/networking/gateway/#ServerTLSSettings

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

SSL証明書を保持するSecretを指定する場合は、`.spec.servers[*].tls.credentialName`キーを設定する。

> - https://istio.io/latest/docs/reference/config/networking/gateway/#ServerTLSSettings

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

## 06. PeerAuthentication

### .spec.mtls

#### ▼ mtls

`istio-proxy`コンテナ間の通信で相互TLS認証を有効化するか否かを設定する。

Kubernetesのみで相互TLS認証をセットアップしようとすると大変であり、Istioを使うとより簡単にセットアップできる。

> - https://hemantkumar.net/kubernetes-mutual-auth-with-diffferent-cas.html

#### ▼ mode

相互TLS認証のタイプを設定する。

| 項目         | 説明                                                               |
| ------------ | ------------------------------------------------------------------ |
| `UNSET`      | 記入中...                                                          |
| `DISABLE`    | 相互TLS認証を使用しない。                                          |
| `PERMISSIVE` | 相互TLS認証の時、プロトコルはHTTPSとHTTPの両方を許可する。         |
| `STRICT`     | 相互TLS認証の時、プロトコルはHTTPSのみを許可し、HTTPを許可しない。 |

> - https://istio.io/latest/docs/reference/config/security/peer_authentication/#PeerAuthentication-MutualTLS-Mode

**＊実装例＊**

```yaml
apiVersion: install.istio.io/v1alpha1
kind: PeerAuthentication
metadata:
  namespace: istio-system
  name: peer-authentication
spec:
  mtls:
    mode: STRICT # 相互TLS認証を使用する。
```

相互TLS認証を使用する場合はSSL証明書が必要になり、SSL証明書が無いと以下のようなエラーになってしまう。

```bash
transport failure reason: TLS error: *****:SSL routines:OPENSSL_internal:SSLV3_ALERT_CERTIFICATE_EXPIRED
```

<br>

## 07. RequestAuthentication

### .spec.jwtRules

Bearer認証で使用するJWTの発行元を設定する。

```yaml
apiVersion: security.istio.io/v1beta1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt"
  namespace: istio-system
spec:
  jwtRules:
    - issuer: foo-issuer
      jwksUri: https://example.com/.well-known/jwks.json
```

> - https://istio.io/latest/docs/reference/config/security/request_authentication/
> - https://news.mynavi.jp/techplus/article/kubernetes-30/

<br>

### .spec.selector

JWTによるBearer認証を適用するKubernetesリソース名を設定する。

```yaml
apiVersion: security.istio.io/v1beta1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt"
  namespace: istio-system
spec:
  selector:
    matchLabels:
      app: istio-ingressgateway
```

> - https://istio.io/latest/docs/reference/config/security/request_authentication/
> - https://news.mynavi.jp/techplus/article/kubernetes-30/

<br>

## 08. ServiceEntry

### .spec.hosts

#### ▼ hostsとは

コンフィグストレージに登録する宛先のドメイン名を設定する。

宛先のドメインレジストラのドメインのみを許可しても良いが、ワイルドカード (`*`) を使用して全てのドメインを許可しても良い。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ServiceEntry
metadata:
  name: foo-service-entry
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
  name: foo-service-entry
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
  name: foo-service-entry
spec:
  # DNSサーバーから返信されたIPアドレスを許可する
  resolution: DNS
```

<br>

## 09. Telemetry

### accessLogging

#### ▼ accessLoggingとは

同じNamespace内の`istio-proxy`コンテナを対象として、アクセスログの作成方法を設定する。

```yaml
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: access-log-provider
  # サイドカーをインジェクションしている各Namespaceで作成する
  namespace: foo
spec:
  selector:
    matchLabels:
      name: app
  # デフォルトでEnvoyをアクセスログプロバイダーとして使用するため、設定不要である
  accessLogging:
    - providers:
        - name: envoy
```

> - https://istio.io/latest/docs/reference/config/telemetry/#AccessLogging

<br>

### metrics

#### ▼ metricsとは

同じNamespace内の`istio-proxy`コンテナを対象として、メトリクスの作成方法を設定する。

```yaml
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: access-log-provider
  # サイドカーをインジェクションしている各Namespaceで作成する
  namespace: foo
spec:
  selector:
    matchLabels:
      name: app
  metrics:
    - providers:
        - name: prometheus
```

> - https://istio.io/latest/docs/reference/config/telemetry/#Metrics

<br>

### tracing

#### ▼ tracingとは

同じNamespace内の`istio-proxy`コンテナを対象として、スパンの作成方法を設定する。

```yaml
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: access-log-provider
  # サイドカーをインジェクションしている各Namespaceで作成する
  namespace: foo
spec:
  selector:
    matchLabels:
      name: app
  tracing:
    - providers:
        - name: opentelemetry
      randomSamplingPercentage: 100
```

> - https://istio.io/latest/docs/reference/config/telemetry/#Tracing

<br>

## 10. VirtualService

### .spec.exportTo

#### ▼ exportToとは

そのVirtualServiceを使用できるNamespaceを設定する。

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#VirtualService

#### ▼ `*` (アスタリスク)

全てのNamespaceのみで使用できるようにする。

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

ドメインレジストラのドメインのみを許可しても良いが、 ワイルドカード (`*`) を使用して全てのドメインを許可しても良い。

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

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#VirtualService

#### ▼ `<Namespace名>/<Gateway名>`

Gateway名とこれのNamespaceを設定する。

VirtualServiceとGatewayが同じNamespaceに所属する場合は、Namespaceを省略できる。

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

VirtualServiceとGatewayが同じNamespaceに所属する場合は、Namespaceを省略できる。

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

HTTP/1.1、HTTP/2 (例：gRPCなど) 、のプロトコルによるインバウンド通信を、Serviceを介してDestinationRuleにルーティングする。

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#HTTPRoute

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

> - https://speakerdeck.com/nutslove/istioru-men?slide=19

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
        - delay:
            fixedDelay: 22s # レスポンスの遅延時間
            percentage:
              value: 100 # 遅延レスポンスを発生させる割合
```

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

> - https://istiobyexample.dev/path-based-routing/

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

`istio-proxy`コンテナのリバースプロキシに失敗した場合の再試行回数を設定する。

Serviceへのルーティングの失敗ではないことに注意する。

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

再試行する失敗理由を設定する。

`istio-proxy`コンテナは、レスポンスの`x-envoy-retry-on`ヘッダーに割り当てるため、これの値を設定する。

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

受信したインバウンド通信で宛先のServiceのドメイン名 (あるいはService名) を設定する。

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#Destination

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
spec:
  http:
    - route:
        - destination:
            # Service名でも良い。
            host: foo-service.foo-namespace.svc.cluster.local
```

#### ▼ route.destination.port

受信するインバウンド通信でルーティング先のポート番号を設定する。

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#Destination

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

IngressGatewayで受信したインバウンド通信を、Serviceを介して、紐付けたDestinationRuleのサブセットにルーティングする。

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

Serviceの重み付けルーティングの割合を設定する。

`.spec.http[*].route[*].destination.subset`キーの値は、DestinationRuleで設定した`.spec.subsets[*].name`キーに合わせる必要がある。

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#HTTPRouteDestination

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

#### ▼ timeout

`istio-proxy`コンテナの宛先にリクエストを送信する時のタイムアウト時間を設定する。
`0`秒の場合、タイムアウトは無制限になる。

これは、Envoyのルート値の`max_grpc_timeout` (`grpc_timeout_header_max`) と`timeout`の両方に適用される。

指定した時間以内に、`istio-proxy`コンテナの宛先からレスポンスがなければ、`istio-proxy`コンテナはタイムアウトとして処理する。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  namespace: istio-system
  name: foo-virtual-service
spec:
  http:
    # destinationにリクエストを送信する時のタイムアウト時間
    - timeout: 40s
      route:
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

> - https://istio.io/latest/docs/tasks/traffic-management/request-timeouts/
> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/route/v3/route_components.proto

<br>

### .spec.tcp

#### ▼ tcpとは

TCP/IPのプロトコルによるインバウンド通信を、Serviceを介してDestinationRuleにルーティングする。

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#TCPRoute

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

### 宛先のServiceのポート番号について

Istioは、宛先のServiceに送信しようとするプロトコルを厳格に認識する。

宛先のServiceの`.spec.ports[*].name`キー (`<プロトコル名>-<任意の文字列>`) または`.spec.ports[*].appProtocol`キーを認識し、そのServiceには指定されたプロトコルでしか通信を送れなくなる。

**＊例＊**

appProtocolを使用しない場合は以下の通りとなる。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  ports:
    # HTTPのみ
    - name: http-foo
      port: 80
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  ports:
    # TCPのみ
    - name: tcp-foo
      port: 9000
```

**＊例＊**

appProtocolを使用する場合は以下の通りとなる。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  ports:
    # HTTPのみをVirtualServiceから送信できる
    - appProtocol: http
      port: 80
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  ports:
    # TCPのみをVirtualServiceから送信できる
    - appProtocol: tcp
      port: 9000
```

> - https://istio.io/latest/docs/ops/configuration/traffic-management/protocol-selection/
> - https://zenn.dev/toshikish/articles/d0dd54ae067bed

<br>
