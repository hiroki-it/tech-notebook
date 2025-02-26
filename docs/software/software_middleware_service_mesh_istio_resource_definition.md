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
# IstioOperatorのdemoをインストールし、リソースを作成する
$ istioctl install --set profile=demo revision=1-10-0

# 外部のチャートを使用する場合
$ istioctl install --manifests=foo-chart
```

> - https://istio.io/latest/docs/setup/install/istioctl/#install-from-external-charts

執筆時点 (2023/01/16) でIstioOperatorは非推奨になっている。

> - https://www.solo.io/blog/3-most-common-ways-install-istio/

#### ▼ Operatorとして (ユーザー定義)

プロファイルを使用する代わりに、IstioOperatorを自前で定義しても良い。

```yaml
# istio-operator.yamlファイル
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
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

### .metadata.namespace

AuthorizationPolicyの適用範囲の仕組みは、RequestAuthenticationと同じである。

作成したNamespaceに対して適用され、`istio-system`に置いた場合は全てのNamespaceに適用される。

もし、適用範囲を小さくしたい場合は、`.spec.selector`キーを使用する。

<br>

### .spec.action

#### ▼ actionとは

認可スコープで、認証済みの送信元を許可するか否かを設定する。

```yaml
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: bar-authorization-policy
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

ここでは、OAuth2 ProxyをIDプロバイダーとして使用する。

```yaml
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: oauth2-proxy-authorization-policy
spec:
  action: CUSTOM
  provider:
    name: oauth2-proxy
  rules:
    - to:
        - operation:
            paths: ["/login"]
```

OAuth2 ProxyのPodに紐づくServiceを識別できるようにする。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
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

認可スコープで、実施条件 (例：いずれのKubernetesリソース、HTTPリクエストのメソッド、JWTの発行元認証局の識別子) を設定する。

その条件に合致した場合に、認証済みの送信元を許可するか否かを実施する。

#### ▼ 特定のServiceAccountを持つPodを許可する

送信元Podに紐づくServiceAccountが適切な場合に、認可を実施するように設定する。

**＊実装例＊**

```yaml
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: allow-pod
spec:
  rules:
    - from:
        - source:
            principals: ["cluster.local/ns/default/sa/inventory-sa"]
      to:
        - operation:
            methods: ["GET"]
```

> - https://cloud.google.com/service-mesh/docs/security/authorization-policy-overview?hl=ja#identified_workload

#### ▼ 特定のNamespaceを許可する

```yaml
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: allow-namespace
spec:
  rules:
    - from:
        - source:
            namespaces: ["foo"]
      to:
        - operation:
            methods: ["GET"]
```

> - https://cloud.google.com/service-mesh/docs/security/authorization-policy-overview?hl=ja#identified_namespace

#### ▼ 正しいJWTを許可する

リクエストヘッダーにあるJWTの発行元認証局が適切な場合に、認可を実施するように設定する。

**＊実装例＊**

```yaml
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: allow-jwt
spec:
  rules:
    - when:
        # JWTの発行元認証局を指定する
        - key: request.auth.claims[iss]
          # 発行元認証局の期待値を設定する
          values: ["<JWTの発行元認証局の識別子 (issuer)>"]
```

> - https://istio.io/latest/docs/reference/config/security/authorization-policy/

#### ▼ 全てを拒否する

```yaml
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: deny-all
spec:
  action: DENY
  rules:
    - {}
```

> - https://cloud.google.com/service-mesh/docs/security/authorization-policy-overview?hl=ja#allow_nothing

#### ▼ 全てを許可する

```yaml
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: allow-all
spec:
  action: ALLOW
  rules:
    - {}
```

> - https://cloud.google.com/service-mesh/docs/security/authorization-policy-overview?hl=ja#deny_all_access

#### ▼ 非TLSを拒否する

```yaml
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: deny-non-tls
  namespace: NAMESPACE
spec:
  action: DENY
  rules:
    - from:
        - source:
            notPrincipals: ["*"]
```

> - https://cloud.google.com/service-mesh/docs/security/authorization-policy-overview?hl=ja#reject_plaintext_requests

<br>

### .spec.selector

#### ▼ selectorとは

AuthorizationPolicyの設定を適用するKubernetesリソースを設定する。

設定したKubernetesリソースに対して認証済みの送信元が通信した場合に、AuthorizationPolicyを適用する。

```yaml
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: bar-authorization-policy
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

そのDestinationRuleにリクエストできるNamespaceを設定する。

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#VirtualService

#### ▼ `*` (アスタリスク)

デフォルト値である。

他のNamespaceのVirtualServiceに紐づける場合、`*`とする必要がある。

もし、同じNamespace内のVirtualServiceと紐づける場合、`.`とする。

つまり、Istio IngressGatewayやIstio EgressGatewayとリクエストを送受信するVirtualServiceとDestinationRuleでは`*`とし、それ以外のこれらの場合は`.`とする。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: ingressgateway
spec:
  exportTo:
    - "*"
  host: istio-inressgateway.istio-inress.svc.cluster.local
```

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: egressgateway
spec:
  exportTo:
    - "*"
  host: istio-egressgateway.istio-egress.svc.cluster.local
```

#### ▼ `.` (ドット)

同じNamespace内のVirtualServiceと紐づける場合、`.`とする。

もし、他のNamespaceのVirtualServiceに紐づける場合、`*`とする必要がある。

つまり、Istio IngressGatewayやIstio EgressGatewayとリクエストを送受信するVirtualServiceとDestinationRuleでは`*`とし、それ以外のこれらの場合は`.`とする。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
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
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  host: foo-service.default.svc.cluster.local # Service名でも良いが完全修飾ドメイン名の方が良い。
```

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#DestinationRule

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: egressgateway
spec:
  exportTo:
    - "*"
  host: istio-egressgateway.istio-egress.svc.cluster.local
```

> - https://istio.io/latest/docs/tasks/traffic-management/egress/egress-gateway/#egress-gateway-for-http-traffic

<br>

### .spec.subsets

#### ▼ subsetsとは

VirtualServiceを起点としたPodのカナリアリリースで使用する。

ルーティング先のPodの`.metadata.labels`キーを設定する。

`.spec.subsets[*].name`キーの値は、VirtualServiceで設定した`.spec.http[*].route[*].destination.subset`キーに合わせる必要がある。

![istio_virtual-service_destination-rule_subset](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_virtual-service_destination-rule_subset.png)

**＊実装例＊**

`subset`が`v1`に対するインバウンド通信では、`version`キーの値が`v1`であるPodにルーティングする。

`v2`も同様である。

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  subsets:
    - name: v1
      labels:
        version: v1 # 旧Pod
    - name: v2
      labels:
        version: v2 # 新Pod
```

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#Subset
> - https://atmarkit.itmedia.co.jp/ait/articles/2112/21/news009.html
> - https://blog.1q77.com/2020/03/istio-part3/

<br>

### .spec.trafficPolicy

#### ▼ connectionPool.http.maxRequestsPerConnection

EnvoyがHTTPプロトコルを処理する場合に、接続当たりのリクエストの上限値を設定する。

デフォルトでは上限がない。

`1`とする場合、Envoyによるkeep-aliveを無効化する。

また、サーキットブレイカーを開始するための外れ値の閾値になる。

上限を超過した場合、Podへのルーティングが停止し、何らかの意図したエラーを返信する (サーキットブレイカー) 。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    connectionPool:
      http:
        # keep-aliveを無効にする
        maxRequestsPerConnection: 1
```

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    connectionPool:
      http:
        maxRequestsPerConnection: 100
```

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#ConnectionPoolSettings-HTTPSettings

#### ▼ connectionPool.http.http1MaxPendingRequests

キューに入れられるHTTPリクエストのレートリミットを設定する。

キューを超えるHTTPリクエストに対しては、`503`ステータスを返信する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    connectionPool:
      http:
        http1MaxPendingRequests: 4000
```

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#ConnectionPoolSettings-HTTPSettings
> - https://qiita.com/sonq/items/4cee6f85f91ea7dfcbbf#http1maxpendingrequests

#### ▼ connectionPool.http.http2MaxRequests

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    connectionPool:
      http:
        http2MaxRequests: 4000
```

> - https://speakerdeck.com/nagapad/abema-niokeru-gke-scale-zhan-lue-to-anthos-service-mesh-huo-yong-shi-li-deep-dive?slide=115

#### ▼ connectionPool.tcp.maxConnections

キューに入れられるTCPリクエストのレートリミットを設定する。

キューを超えるTCPリクエストに対しては、レスポンスを返信できるまで待機する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
```

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#ConnectionPoolSettings-TCPSettings
> - https://qiita.com/sonq/items/4cee6f85f91ea7dfcbbf#maxconnections

#### ▼ outlierDetection.baseEjectionTime

Podをルーティング先から切り離す秒数を設定する。

`baseEjectionTime`後、宛先の正常性を確認し、もしエラーが発生していなければサーキットブレイカーを停止する。

どのくらいの期間で10回以上を判定するかは、`interval`キーで設定する。

**＊実装例＊**

10秒以内にエラーが10回以上発生したらサーキットブレイカーを開始し、30秒間Podを切り離す。

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    outlierDetection:
      consecutiveGatewayErrors: 10
      interval: 10s
      baseEjectionTime: 30s
```

> - https://ibrahimhkoyuncu.medium.com/istio-powered-resilience-advanced-circuit-breaking-and-chaos-engineering-for-microservices-c3aefcb8d9a9
> - https://speakerdeck.com/nutslove/istioru-men?slide=25
> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#OutlierDetection

#### ▼ outlierDetection.consecutiveGatewayErrors

サーキットブレイカーを開始する外れ値 (Gateway系ステータスの`502`、`503`、`504`) の閾値を設定する。

似た設定として、`500`系ステータスの閾値を設定する`consecutive5xxErrors`キーがあるが、併用できる。

どのくらいの期間で10回以上を判定するかは、`interval`キーで設定する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    outlierDetection:
      consecutiveGatewayErrors: 10
      interval: 10s
      baseEjectionTime: 30s
```

> - https://ibrahimhkoyuncu.medium.com/istio-powered-resilience-advanced-circuit-breaking-and-chaos-engineering-for-microservices-c3aefcb8d9a9
> - https://speakerdeck.com/nutslove/istioru-men?slide=25
> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#OutlierDetection-consecutive_gateway_errors

#### ▼ outlierDetection.consecutive5xxErrors

サーキットブレイカーを開始する外れ値 (`500`系ステータス) の閾値を設定する。

似た設定として、Gateway系ステータスの閾値を設定する`consecutiveGatewayErrors`キーがあるが、併用できる。

どのくらいの期間で10回以上を判定するかは、`interval`キーで設定する。

**＊実装例＊**

`500`系ステータスが10回以上発生したらサーキットブレイカーを開始する。

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    outlierDetection:
      consecutive5xxErrors: 10
      interval: 10s
      baseEjectionTime: 30s
```

> - https://techblog.zozo.com/entry/zozotown-istio-circuit-breaker
> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#OutlierDetection-consecutive_5xx_errors

#### ▼ outlierDetection.interval

サーキットブレイカーの外れ値の計測間隔を設定する。

間隔内で閾値以上のエラーが発生した場合に、サーキトブレイカーが起こる。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    outlierDetection:
      interval: 10s
```

> - https://ibrahimhkoyuncu.medium.com/istio-powered-resilience-advanced-circuit-breaking-and-chaos-engineering-for-microservices-c3aefcb8d9a9
> - https://speakerdeck.com/nutslove/istioru-men?slide=25
> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#OutlierDetection

#### ▼ outlierDetection.minHealthPercent

指定された割合で正常になるように、ルーティング先を決める。

異常なルーティング先がある場合は正常な方にルーティングし、異常なルーティング先が回復することを待つ。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    outlierDetection:
      minHealthPercent: 90
      interval: 10s
      baseEjectionTime: 30s
```

> - https://ibrahimhkoyuncu.medium.com/istio-powered-resilience-advanced-circuit-breaking-and-chaos-engineering-for-microservices-c3aefcb8d9a9
> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#OutlierDetection

#### ▼ loadBalancer

Podへのルーティング時に使用する負荷分散方式を設定する。

**＊実装例＊**

複数のゾーンのPodに対して、ラウンドロビンでルーティングする。

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
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

リージョン名やゾーン名は、Podの`topologyKey`キー（`topology.kubernetes.io/region`キー、`topology.kubernetes.io/zone`キーなど) の値を設定する。

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    loadBalancer:
      localityLbSetting:
        enabled: "true"
        distribute:
          - from: <リージョン名>/<ゾーン名>/*
            to:
              "<リージョン名1>/<ゾーン名1>/*": 70
              "<リージョン名2>/<ゾーン名2>/*": 30
```

> - https://istio.io/latest/docs/tasks/traffic-management/locality-load-balancing/distribute/
> - https://istio.io/latest/docs/tasks/traffic-management/locality-load-balancing/

**＊実装例＊**

複数のゾーンのPodに対して、最小リクエスト数でルーティングする。

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    loadBalancer:
      # 最小リクエスト数
      simple: LEAST_CONN
```

#### ▼ portLevelSettings.loadBalancer

Podのポート番号別のルーティングの負荷分散方式を設定する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
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
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    portLevelSettings:
      - port:
          number: 80
```

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#TrafficPolicy-PortTrafficPolicy

#### ▼ tls.mode

DestinationRuleと宛先 (特にサービスメッシュ外にある対象) の間の暗号化方式を設定する。

Gatewayにも似た設定があるが、あちらは送信元とGatewayの間の暗号化方式を設定する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    tls:
      mode: DISABLE # 非TLS
```

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    tls:
      mode: SIMPLE # TLS
```

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    tls:
      mode: MUTUAL # 自己管理下の相互TLS認証
```

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    tls:
      mode: ISTIO_MUTUAL # Istio管理下の相互TLS認証
```

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#ClientTLSSettings-TLSmode

#### ▼ tls.clientCertificate

自己管理下の相互TLS (`MUTUAL`) の場合に、使用するSSL証明書を設定する。

Istio管理下の相互TLS (`ISTIO_MUTUAL`) の場合、Istiodコントロールプレーンは作成したSSL署名書を自動的に割り当てるので、設定不要である。

Namespace全体に同じ設定を適用する場合、PeerAuthenticationを使用する。

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    tls:
      mode: MUTUAL
      privateKey: /etc/certs/client_private_key.pem
```

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#ClientTLSSettings

#### ▼ tls.clientCertificate

自己管理下の相互TLS (`MUTUAL`) の場合に、使用するSSL証明書を設定する。

Istio管理下の相互TLS (`ISTIO_MUTUAL`) の場合、Istiodコントロールプレーンは作成したSSL署名書を自動的に割り当てるので、設定不要である。

Namespace全体に同じ設定を適用する場合、PeerAuthenticationを使用する。

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    tls:
      mode: MUTUAL
      clientCertificate: /etc/certs/myclientcert.pem
```

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#ClientTLSSettings

#### ▼ tls.clientCertificate

自己管理下の相互TLS (`MUTUAL`) の場合に、使用するSSL証明書を設定する。

Istio管理下の相互TLS (`ISTIO_MUTUAL`) の場合、Istiodコントロールプレーンは作成したSSL署名書を自動的に割り当てるので、設定不要である。

Namespace全体に同じ設定を適用する場合、PeerAuthenticationを使用する。

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    tls:
      mode: MUTUAL
      caCertificates: /etc/certs/rootcacerts.pem
```

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#ClientTLSSettings

#### ▼ warmup.aggression

スロースタート方式 (通過させるリクエストの数を少しずつ増加させる) で、増加率を設定する。

`1`の場合は、直線的に増加する。

リクエスト数の非常に多い高トラフィックなシステムで、起動直後のパフォーマンスが悪いアプリケーション (例：キャッシュに依存、コネクションプールの作成が必要、ウォームアップが必要なJVM言語製アプリケーション) にいきなり高負荷をかけないようにできる。

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    warmup:
      duration: 30
      aggression: 1
```

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#LoadBalancerSettings-warmup
> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#WarmupConfiguration
> - https://stackoverflow.com/a/75942527/12771072
> - https://discuss.istio.io/t/need-help-setting-up-slow-start-in-kubernetes/16692
> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/slow_start

#### ▼ warmup.duration

スロースタート方式 (通過させるリクエストの数を少しずつ増加させる) で、スロースタートの期間を設定する。

リクエスト数の非常に多い高トラフィックなシステムで、起動直後のパフォーマンスが悪いアプリケーション (例：キャッシュに依存、コネクションプールの作成が必要、ウォームアップが必要なJVM言語製アプリケーション) にいきなり高負荷をかけないようにできる。

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    warmup:
      duration: 30
      aggression: 1
```

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#LoadBalancerSettings-warmup
> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#WarmupConfiguration
> - https://discuss.istio.io/t/need-help-setting-up-slow-start-in-kubernetes/16692
> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/slow_start

<br>

## 04. EnvoyFilter

### .spec.configPatches.applyTo

適用したいフィルター名を設定する。

**＊実装例＊**

ネットワークフィルターの設定値を変更する。

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  configPatches:
    - applyTo: NETWORK_FILTER
```

> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ApplyTo

**＊実装例＊**

ネットワークフィルターである`network.http_connection_manager`の設定値を変更する。

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  configPatches:
    - applyTo: HTTP_FILTER
```

> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ApplyTo

**＊実装例＊**

リスナーフィルターの設定値を変更する。

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  configPatches:
    - applyTo: LISTENER_FILTER
```

> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ApplyTo

<br>

### .spec.configPatches.match

#### ▼ matchとは

フィルターの設定値を変更する場合に、その実行条件を設定する。

条件に合致する設定値があった場合、`.spec.configPatches.patch`キーで設定した内容の変更処理を実施する。

#### ▼ cluster

指定したクラスターが存在する場合に、フィルターの設定値を変更する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  configPatches:
    - match:
        cluster:
          name: foo-cluster
```

#### ▼ listener

指定したリスナーが存在する場合に、フィルターの設定値を変更する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  configPatches:
    - match:
        listener:
          filterChain:
            filter:
              name: envoy.filters.network.http_connection_manager
```

> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ListenerMatch

#### ▼ context

指定したワークロードタイプ (例：istio-ingressgateway内の`istio-proxy`コンテナ、istio-proxyコンテナの`istio-proxy`コンテナ) の場合に、フィルターの設定値を変更する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  configPatches:
    - match:
        # istio-ingressgatewayとistio-proxyコンテナの両方に適用する
        - context: ANY
```

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  configPatches:
    - match:
        # istio-proxyコンテナのIngressリスナー後のフィルターに適用する
        - context: SIDECAR_INBOUND
```

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  configPatches:
    - match:
        # istio-ingressgateway内のistio-proxyコンテナに適用する
        - context: GATEWAY
```

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  configPatches:
    - match:
        # istio-proxyコンテナのアウトバウンド通信 (Egressリスナー後のフィルター)
        - context: SIDECAR_OUTBOUND
```

> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-PatchContext
> - https://istio.io/latest/docs/reference/config/networking/envoy-filter
> - https://niravshah2705.medium.com/redirect-from-istio-e2553afc4a29

<br>

### .spec.configPatches.patch

#### ▼ patchとは

`.spec.configPatches.match`キーに設定した設定値があった場合、フィルターの設定値の変更内容を設定する。

#### ▼ operation

フィルターの設定値の変更方法を設定する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  configPatches:
    - patch:
        operation: MERGE
```

> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch-Operation

**＊実装例＊**

`.spec.configPatches.match`キーに合致したフィルターの直前に挿入する。

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  configPatches:
    - patch:
        operation: INSERT_BEFORE
```

> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch-Operation

**＊実装例＊**

フィルターの一番最初に挿入する。

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  configPatches:
    - patch:
        operation: INSERT_FIRST
```

> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch-Operation

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  configPatches:
    - patch:
        operation: MERGE
```

> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch-Operation

#### ▼ value

既存のフィルターに適用したいフィルターを設定する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  configPatches:
    - patch:
        operation: MERGE
        value:
          name: envoy.filters.network.http_connection_manager
          typed_config:
            # ネットワークフィルター (http_connection_manager) を指定する
            "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
```

> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch-FilterClass

<br>

### .spec.configPatches.priority

フィルターの適用タイミングを設定する。

マイナス値の場合、デフォルトのフィルターよりも先に適用する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  priority: -1
```

> - https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter

<br>

## 04-02. EnvoyFilter例

### レートリミット

#### ▼ Istioのレートリミットとは

執筆時点で、Istioのトラフィック管理系リソースにはレートリミットの設定がない。

これはEnvoyFilterで設定する必要がある。

複数の`istio-proxy`コンテナにレートリミットを設定するグローバルレートリミットと、特定のものに設定するローカルレートリミットがある。

#### ▼ ローカルリミット

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: filter-local-ratelimit-svc
  namespace: istio-system
spec:
  workloadSelector:
    labels:
      app: productpage
  configPatches:
    - applyTo: HTTP_FILTER
      match:
        # istio-proxyコンテナのインバウンドの処理に適用する
        context: SIDECAR_INBOUND
        # Listenerにレートリミットを設定する
        listener:
          filterChain:
            filter:
              name: "envoy.filters.network.http_connection_manager"
      patch:
        operation: INSERT_BEFORE
        value:
          name: envoy.filters.http.local_ratelimit
          typed_config:
            "@type": type.googleapis.com/udpa.type.v1.TypedStruct
            type_url: type.googleapis.com/envoy.extensions.filters.http.local_ratelimit.v3.LocalRateLimit
            value:
              stat_prefix: http_local_rate_limiter
              token_bucket:
                max_tokens: 4
                tokens_per_fill: 4
                fill_interval: 60s
              filter_enabled:
                runtime_key: local_rate_limit_enabled
                default_value:
                  numerator: 100
                  denominator: HUNDRED
              filter_enforced:
                runtime_key: local_rate_limit_enforced
                default_value:
                  numerator: 100
                  denominator: HUNDRED
              response_headers_to_add:
                - append: false
                  header:
                    key: x-local-rate-limit
                    value: "true"
---
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: filter-local-ratelimit-svc
  namespace: istio-system
spec:
  workloadSelector:
    labels:
      app: productpage
  configPatches:
    - applyTo: HTTP_FILTER
      match:
        # istio-proxyコンテナのインバウンドの処理に適用する
        context: SIDECAR_INBOUND
        listener:
          filterChain:
            filter:
              name: "envoy.filters.network.http_connection_manager"
      patch:
        operation: INSERT_BEFORE
        value:
          name: envoy.filters.http.local_ratelimit
          typed_config:
            "@type": type.googleapis.com/udpa.type.v1.TypedStruct
            type_url: type.googleapis.com/envoy.extensions.filters.http.local_ratelimit.v3.LocalRateLimit
            value:
              stat_prefix: http_local_rate_limiter
    - applyTo: HTTP_ROUTE
      match:
        # istio-proxyコンテナのインバウンドの処理に適用する
        context: SIDECAR_INBOUND
        routeConfiguration:
          vhost:
            name: "inbound|http|9080"
            route:
              action: ANY
      patch:
        operation: MERGE
        value:
          typed_per_filter_config:
            envoy.filters.http.local_ratelimit:
              "@type": type.googleapis.com/udpa.type.v1.TypedStruct
              type_url: type.googleapis.com/envoy.extensions.filters.http.local_ratelimit.v3.LocalRateLimit
              value:
                stat_prefix: http_local_rate_limiter
                token_bucket:
                  max_tokens: 4
                  tokens_per_fill: 4
                  fill_interval: 60s
                filter_enabled:
                  runtime_key: local_rate_limit_enabled
                  default_value:
                    numerator: 100
                    denominator: HUNDRED
                filter_enforced:
                  runtime_key: local_rate_limit_enforced
                  default_value:
                    numerator: 100
                    denominator: HUNDRED
                response_headers_to_add:
                  - append: false
                    header:
                      key: x-local-rate-limit
                      value: "true"
```

> - https://istio.io/latest/docs/tasks/policy-enforcement/rate-limit/#local-rate-limit
> - https://learncloudnative.com/blog/2022-09-08-ratelimit-istio

#### ▼ グローバルレートリミット

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ratelimit-config
data:
  config.yaml: |
    domain: ratelimit
    descriptors:
      - key: PATH
        value: "/productpage"
        rate_limit:
          unit: minute
          requests_per_unit: 1
      - key: PATH
        value: "api"
        rate_limit:
          unit: minute
          requests_per_unit: 2
      - key: PATH
        rate_limit:
          unit: minute
          requests_per_unit: 100
```

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: filter-ratelimit
  # サービスメッシュ全体に適用する
  namespace: istio-system
spec:
  workloadSelector:
    labels:
      # Istio IngressGatewayに合致させる
      istio: ingressgateway
  configPatches:
    - applyTo: HTTP_FILTER
      match:
        # Gatewayの処理に適用する
        context: GATEWAY
        # Listenerにレートリミットを設定する
        listener:
          filterChain:
            filter:
              name: "envoy.filters.network.http_connection_manager"
              subFilter:
                name: "envoy.filters.http.router"
      # 変更内容を設定する
      patch:
        operation: INSERT_BEFORE
        value:
          name: envoy.filters.http.ratelimit
          typed_config:
            "@type": type.googleapis.com/envoy.extensions.filters.http.ratelimit.v3.RateLimit
            domain: ratelimit
            # true：istio-proxyコンテナが失敗のレスポンスを返信する
            # false：アプリコンテナが失敗のレスポンスを返信する
            failure_mode_deny: true
            timeout: 10s
            rate_limit_service:
              grpc_service:
                envoy_grpc:
                  # レートリミットの対象を設定する
                  cluster_name: outbound|8081||ratelimit.default.svc.cluster.local
                  authority: ratelimit.default.svc.cluster.local
              transport_api_version: V3
---
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: filter-ratelimit-svc
  # サービスメッシュ全体に適用する
  namespace: istio-system
spec:
  workloadSelector:
    labels:
      istio: ingressgateway
  configPatches:
    - applyTo: VIRTUAL_HOST
      match:
        # Gatewayの処理に適用する
        context: GATEWAY
        routeConfiguration:
          vhost:
            name: ""
            route:
              action: ANY
      # 変更内容を設定する
      patch:
        operation: MERGE
        value:
          rate_limits:
            - actions:
                - request_headers:
                    header_name: ":path"
                    descriptor_key: "PATH"
```

> - https://istio.io/latest/docs/tasks/policy-enforcement/rate-limit/#global-rate-limit

<br>

### KeepAliveの設定

istio-ingressgateway内の`istio-proxy`コンテナで、KeepAliveを実行できるようにする。

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
        # istio-ingressgatewayのフィルターの設定値を変更する
        context: GATEWAY
        listener:
          name: 0.0.0.0_8443
          portNumber: 8443
      # 変更内容を設定する
      patch:
        operation: MERGE
        value:
          socket_options:
            - level: 1
              name: 9
              # KeepAliveを有効化する
              int_value: 1
              state: STATE_PREBIND
            - level: 6
              name: 4
              # 15秒間の無通信が発生したら、KeepAliveを実行する
              int_value: 15
              state: STATE_PREBIND
            - level: 6
              name: 5
              # 15秒間隔で、KeepAliveを実行する
              int_value: 15
              state: STATE_PREBIND
            - level: 6
              name: 6
              # 10回応答がなければ終了する
              int_value: 3
              state: STATE_PREBIND
```

> - https://blog.1q77.com/2020/12/istio-downstream-tcpkeepalive/

<br>

## 04-03. EnvoyFilter以外のカスタマイズ方法

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

DeploymentやPodで`istio-proxy`コンテナを定義することにより設定を変更できる。

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
        # istio-proxyコンテナの設定を変更する。
        - name: istio-proxy
          lifecycle:
            # istio-proxyコンテナ開始直後の処理
            postStart:
              exec:
                # istio-proxyコンテナが、必ずアプリコンテナよりも先に起動する。
                # pilot-agentの起動完了を待機する。
                command:
                  - |
                    pilot-agent wait
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
      # アプリコンテナとistio-proxyコンテナの両方が終了するのを待つ
      terminationGracePeriodSeconds: 45
```

> - https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#customizing-injection

<br>

## 05. Gateway

### .spec.selector

#### ▼ selectorとは

Istio IngressGateway/EgressGatewayに付与された`.metadata.labels`キーを設定する。

デフォルトでは、Istio IngressGatewayには`istio`ラベルがあり、値は`ingressgateway`である。

また、Istio EgressGatewayには`istio`ラベルがあり、値は`egressgateway`である。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: Gateway
metadata:
  name: foo-ingress
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

> - https://istio.io/latest/docs/reference/config/networking/gateway/#Gateway

<br>

### .spec.servers.port

#### ▼ name

Istio IngressGateway/EgressGatewayのPodで待ち受けるポート名を設定する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: Gateway
metadata:
  name: foo-ingress
spec:
  servers:
    - port:
        name: http
```

> - https://istio.io/latest/docs/reference/config/networking/gateway/#Port

#### ▼ number

Istio IngressGateway/EgressGatewayのPodで待ち受けるポート番号を設定する。

Ingress Nginx Controllerであれば、Nginx Controller Podで待ち受けるコンテナポート番号に相当する。

IngressGatewayの内部的なServiceのタイプに関して、NodePort Serviceを選んだ場合、Nodeの宛先ポート番号に合わせる。

一方で、LoadBalancer Serviceを選んだ場合、LoadBalancerがルーティングできる宛先ポート番号とする。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: Gateway
metadata:
  name: foo-ingress
spec:
  servers:
    - port:
        number: 30000
```

> - https://istio.io/latest/docs/reference/config/networking/gateway/#Port

#### ▼ protocol

Istio IngressGateway/EgressGatewayのPodで受信するプロトコルを設定する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: Gateway
metadata:
  name: foo-ingress
spec:
  servers:
    - port:
        protocol: HTTP
```

> - https://istio.io/latest/docs/reference/config/networking/gateway/#Port

#### ▼ targetPort

Istio IngressGateway/EgressGatewayのPodの宛先ポート番号を設定する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: Gateway
metadata:
  name: foo-ingress
spec:
  servers:
    - port:
        targetPort: 80
```

> - https://istio.io/latest/docs/reference/config/networking/gateway/#Port

<br>

### .spec.servers.hosts

Gatewayでフィルタリングするインバウンド通信の`Host`ヘッダー名を設定する。

Istio IngressGatewayでは、複数のマイクロサービスでAPIを公開している場合、ワイルドカード (`*`) を使用して全てのドメインを許可することになる。

また、Istio EgressGatewayでも任意のAPIへの接続を許可するために、同様にワイルドカード (`*`) を使用することになる。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: Gateway
metadata:
  name: foo-ingress
spec:
  servers:
    - hosts:
        - "*"
```

```yaml
apiVersion: networking.istio.io/v1
kind: Gateway
metadata:
  name: bar-egress
spec:
  servers:
    - hosts:
        - "*"
```

<br>

### .spec.servers.tls.caCertificates

`.spec.servers.tls.mode`キーで相互TLSを設定している場合、クライアント証明書のペアになるCA証明書が必要である。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: Gateway
metadata:
  name: foo-ingress
spec:
  servers:
    - tls:
        caCertificates: root-cert.pem
```

> - https://istio.io/latest/docs/reference/config/networking/gateway/#ServerTLSSettings

<br>

### .spec.servers.tls.credentialName

CAを含むSSL証明書を保持するSecretを設定する。

SSL証明書のファイルを指定する場合は、`.spec.servers[*].tls.serverCertificate`キーを設定する。

Secretを更新した場合、Podを再起動せずに、PodにSecretを再マウントできる。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: Gateway
metadata:
  name: foo-ingress
spec:
  servers:
    - tls:
        credentialName: istio-gateway-certificate-secret
```

> - https://stackoverflow.com/questions/63621461/updating-istio-ingressgateway-tls-cert

<br>

### .spec.servers.tls.mode

#### ▼ modeとは

送信元とGatewayの間の暗号化方式を設定する。

> - https://istio.io/latest/docs/reference/config/networking/gateway/#ServerTLSSettings-TLSmode

#### ▼ SIMPLE

送信元とGatewayの通信間で通常のHTTPSを実施する。

クライアント証明書は不要にである。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: Gateway
metadata:
  name: foo-ingress
spec:
  servers:
    - tls:
        mode: SIMPLE
```

#### ▼ MUTUAL

送信元とGatewayの間で、Istioの作成していない証明書による相互TLSを実施する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: Gateway
metadata:
  name: foo-ingress
spec:
  servers:
    - tls:
        mode: MUTUAL
```

#### ▼ ISTIO_MUTUAL

送信元とGatewayの間で、Istioの作成した証明書による相互TLSを実施する。

`istio-proxy`コンテナとIstio EgressGatewayの間で相互TLSを実施する場合、これを使用する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: Gateway
metadata:
  name: foo-ingress
spec:
  servers:
    - tls:
        mode: ISTIO_MUTUAL
```

#### ▼ PASSTHROUGH

GatewayでHTTPSリクエストを受信した場合に、SSL証明書を検証をせずに、HTTPSをそのまま通過させる。

つまり、Gatewayの宛先にSSL証明書を設定する必要がある。

`PASSTHROUGH`以外のモードでは、GatewayでSSLを検証し、場合にとってはSSL終端となる。

注意点として、Gatewayは受信したHTTPSをTCPプロトコルとして処理するため、HTTPヘッダーやパスを使用してトラフィックを制御できない。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: Gateway
metadata:
  name: foo-ingress
spec:
  servers:
    - tls:
        mode: PASSTHROUGH
```

> - https://cloud.google.com/service-mesh/docs/security/egress-gateway-gke-tutorial?hl=ja#pass-through_of_httpstls_connections
> - https://www.danielstechblog.io/run-the-istio-ingress-gateway-with-tls-termination-and-tls-passthrough/amp/
> - https://istio.io/latest/docs/tasks/traffic-management/ingress/ingress-sni-passthrough/#configure-an-ingress-gateway

<br>

### .spec.servers.tls

#### ▼ privateKey

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: Gateway
metadata:
  name: foo-ingress
spec:
  servers:
    - tls:
        privateKey: /etc/certs/privatekey.pem
```

> - https://istio.io/latest/docs/reference/config/networking/gateway/#ServerTLSSettings

<br>

### .spec.servers.tls

#### ▼ serverCertificate

SSL証明書のファイルを設定する。

`.spec.servers.tls.mode`キーで相互TLSを設定している場合、クライアント証明書のペアになるSSL証明書が必要である。

SSL証明書を保持するSecretを指定する場合は、`.spec.servers[*].tls.credentialName`キーを設定する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: foo-ingress
metadata:
  name: gateway
spec:
  servers:
    - tls:
        serverCertificate: /etc/certs/server.pem
```

> - https://istio.io/latest/docs/reference/config/networking/gateway/#ServerTLSSettings

<br>

## 06. PeerAuthentication

### .spec.selector

指定したNamespaceの特定のPodで相互TLSを有効化する

**＊実装例＊**

```yaml
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  # foo内の全てのサイドカーにPeerAuthenticationを適用する
  namespace: foo
  name: peer-authentication
spec:
  selector:
    matchLabels:
      app: foo
  mtls:
    mode: STRICT # 相互TLS認証を使用する。
```

<br>

### .spec.mtls

#### ▼ mtls

特定のNamespace内のすべての`istio-proxy`コンテナ間通信で、相互TLS認証を有効化するか否かを設定する。

特定のPod間でのみ相互TLSを使用したい場合、DestinationRuleでSSL証明書を設定する。

> - https://www.mtioutput.com/entry/istio-mtls-onoff
> - https://hemantkumar.net/kubernetes-mutual-auth-with-diffferent-cas.html

#### ▼ mode

相互TLS認証のタイプを設定する。

| 項目         | 説明                                                               |
| ------------ | ------------------------------------------------------------------ |
| `UNSET`      | 記入中...                                                          |
| `DISABLE`    | 相互TLS認証を使用しない。                                          |
| `PERMISSIVE` | 相互TLS認証の時、プロトコルはHTTPSとHTTPの両方を許可する。         |
| `STRICT`     | 相互TLS認証の時、プロトコルはHTTPSのみを許可し、HTTPを許可しない。 |

**＊実装例＊**

```yaml
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  # foo内の全てのサイドカーにPeerAuthenticationを適用する
  namespace: foo
  name: peer-authentication
spec:
  mtls:
    mode: STRICT # 相互TLS認証を使用する。
```

相互TLS認証を使用する場合はSSL証明書が必要になり、SSL証明書が無いと以下のようなエラーになってしまう。

```bash
transport failure reason: TLS error: *****:SSL routines:OPENSSL_internal:SSLV3_ALERT_CERTIFICATE_EXPIRED
```

> - https://istio.io/latest/docs/reference/config/security/peer_authentication/#PeerAuthentication-MutualTLS-Mode

<br>

## 07. ProxyConfig

### concurrency

サービスメッシュ全体、特定Namespace、特定ワークロードの`istio-proxy`コンテナにて、ワーカースレッド数を設定する。

`.meshConfig.defaultConfig`キーにデフォルト値を設定しておき、ProxyConfigでNamespaceやマイクロサービスPodごとに上書きするのがよい。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ProxyConfig
metadata:
  name: foo-proxyconfig
spec:
  concurrency: 0
```

> - https://istio.io/latest/docs/reference/config/networking/proxy-config/#ProxyConfig
> - https://github.com/istio/istio/discussions/48596#discussioncomment-7993485

<br>

### environmentVariables

サービスメッシュ全体、特定Namespace、特定ワークロードの`istio-proxy`コンテナにて、環境変数を設定する。

`.meshConfig.defaultConfig`キーにデフォルト値を設定しておき、ProxyConfigでNamespaceやマイクロサービスPodごとに上書きするのがよい。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ProxyConfig
metadata:
  name: foo-proxyconfig
spec:
  environmentVariables:
    ISTIO_META_DNS_CAPTURE: true
```

> - https://istio.io/latest/docs/reference/config/networking/proxy-config/#ProxyConfig
> - https://github.com/istio/istio/discussions/48596#discussioncomment-7993485

<br>

## 08. RequestAuthentication

### .metadata.namespace

RequestAuthenticationの適用範囲の仕組みは、AuthorizationPolicyと同じである。

作成したNamespaceに対して適用され、`istio-system`に置いた場合は全てのNamespaceに適用される。

もし、適用範囲を小さくしたい場合は、`.spec.selector`キーを使用する。

IstioコントロールプレーンのログからRequestAuthenticationをデバッグできる。

```bash
$ kubectl logs <IstiodコントロールプレーンのPod> -n istio-system
```

<br>

### .spec.jwtRules

#### ▼ jwtRulesとは

Bearer認証で使用するJWTの発行元認証局を設定する。

JWTが失効していたり、不正であったりする場合に、認証処理を失敗として`401`ステータスを返信する。

注意点として、そもそもリクエストにJWTが含まれていない場合には認証処理をスキップできてしまう。

代わりに、JWTが含まれていないリクエストをAuthorizationPolicyによる認可処理失敗 (`403`ステータス) として扱う必要がある。

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt
spec:
  jwtRules:
    # JWTの発行元認証局を設定する
    - issuer: https://foo-issuer.com
      # JWTの署名を検証するための公開鍵のURLを設定する
      jwksUri: https://example.com/.well-known/jwks.json
      # 既存のJWTを再利用し、後続のマイクロサービスにそのまま転送する
      forwardOriginalToken: true
      # Authorizationヘッダーを指定する
      fromHeaders:
        - name: Authorization
          prefix: "Bearer "
---
# RequestAuthenticationで設定したAuthorizationヘッダーがない場合には認可エラーとする
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: foo-authorization-policy
spec:
  action: ALLOW
  rules:
    - when:
        # JWTの発行元認証局を指定する
        - key: request.auth.claims[iss]
          # 発行元認証局の期待値を設定する
          values: ["foo-issuer.com"]
```

> - https://istio.io/latest/docs/reference/config/security/request_authentication/
> - https://istio.io/latest/docs/concepts/security/#request-authentication
> - https://news.mynavi.jp/techplus/article/kubernetes-30/
> - https://github.com/istio/istio/issues/26559#issuecomment-675682440

#### ▼ issuer

JWTの発行元認証局を設定する。

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt
spec:
  jwtRules:
    - issuer: https://foo-issuer.com
```

> - https://istio.io/latest/docs/reference/config/security/request_authentication/#JWTRule-issuer

#### ▼ jwksUri

JWTの署名を検証するための公開鍵のURLを設定する。

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt
spec:
  jwtRules:
    - jwksUri: https://example.com/.well-known/jwks.json
```

> - https://istio.io/latest/docs/reference/config/security/request_authentication/#JWTRule-jwks_uri

#### ▼ forwardOriginalToken

既存のJWTを再利用し、後続のマイクロサービスにそのまま伝播するかどうかを設定する。

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt
spec:
  jwtRules:
    - forwardOriginalToken: true
```

外部API (例：Google APIs) によっては、不要なJWTがリクエストヘッダーにあると、`401`ステータスを返信する。

そのため、外部APIに接続するマイクロサービスのRequestAuthenticationでは、`forwardOriginalToken`を`false`とし、JWTを削除しておく。

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt
spec:
  jwtRules:
    - forwardOriginalToken: false
```

> - https://istio.io/latest/docs/reference/config/security/request_authentication/#JWTRule-forward_original_token

#### ▼ from_cookies

`Cookie`ヘッダーの指定したキー名からアクセストークンを取得する。

`Cookie`ヘッダーを使用して認証情報を運ぶ場合 (例：フロントエンドアプリケーションがCSRやSSR) に役立つ。

大文字 (`.spec.jwtRules.fromCookies`キー) ではないことに注意する。

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt
spec:
  jwtRules:
    from_cookies:
      # Cookieヘッダーの中でアクセストークンが設定されたキーを指定する
      - <アクセストークンキー>
```

> - https://istio.io/latest/docs/reference/config/security/request_authentication/#JWTRule-from_cookies

#### ▼ fromHeaders

指定したヘッダーからアクセストークンを取得する。

`Authorization`ヘッダーを使用して認証情報を運ぶ場合 (例：フロントエンドアプリケーションがCSR) に役立つ。

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt
spec:
  jwtRules:
    fromHeaders:
      # Authorizationヘッダーを指定する
      - name: Authorization
        prefix: "Bearer "
```

> - https://istio.io/latest/docs/reference/config/security/request_authentication/#JWTRule-from_headers
> - https://istio.io/latest/docs/reference/config/security/request_authentication/#JWTHeader

#### ▼ outputPayloadToHeader

JWTを伝播するための新しいヘッダー名を設定する。

検証後のJWTを新しいヘッダーに割り当て、後続のマイクロサービスに伝播する。

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt
spec:
  jwtRules:
    - outputPayloadToHeader: X-Authorization
```

> - https://discuss.istio.io/t/passing-authorization-headers-automatically-jwt-between-microservices/9053/5

<br>

### .spec.selector

JWTによるBearer認証を適用するKubernetesリソース名を設定する。

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt"
spec:
  selector:
    matchLabels:
      app: istio-ingressgateway
```

> - https://istio.io/latest/docs/reference/config/security/request_authentication/
> - https://news.mynavi.jp/techplus/article/kubernetes-30/

<br>

<br>

## 09. ServiceEntry

### .spec.addresses

ルーティング先のIPアドレスを設定する。

`L4`プロトコル (TCPLなど) では、リクエストにHostヘッダーがない。

これらのプロトコルでは、`.spec.hosts`キーの値を無視し、IPアドレスにリクエストをルーティングする。

なお、`.spec.hosts`キーは必須であり省略できないため、便宜上ではあるが何らかの名前をつけておく。

送信側のVirtualServiceの`destination`では、Hostヘッダーに "." をつけないとエラーになるため、受信側のServiceEntryも合わせておく (例：`tcp.smtp`) とよい。

```yaml
apiVersion: networking.istio.io/v1
kind: ServiceEntry
metadata:
  name: foo-mysql
spec:
  exportTo:
    - "*"
  hosts:
    # L4プロトコルでは、この設定は実際には使われない
    # VirtualServiceでは "." をつけないとエラーになるため、ServiceEntryも合わせておく
    - tcp
  address:
    # L4プロトコルでは、この設定でルーティングする
    - 127.0.0.1/32
  location: MESH_EXTERNAL
  ports:
    - number: 587
      name: tcp
      protocol: TCP
```

`L7`プロトコル (HTTP、HTTPS、MySQLなど) では、リクエストにHostヘッダーがある。

送信側のVirtualServiceの`.spec.http[*].route[*].destination`では、Hostヘッダーに "." をつけないとエラーになるため、受信側のServiceEntryも合わせておく (例：`tcp.smtp`) とよい。

```yaml
apiVersion: networking.istio.io/v1
kind: ServiceEntry
metadata:
  name: foo-mysql
spec:
  exportTo:
    - "*"
  hosts:
    - <DBクラスター名>.cluster-<id>.ap-northeast-1.rds.amazonaws.com
  location: MESH_EXTERNAL
  ports:
    - number: 3306
      name: tcp-mysql
      protocol: TCP
  # Hostヘッダーがあるため、DNSでIPアドレスを取得する
  resolution: DNS
```

> - https://techblog.recruit.co.jp/article-605/
> - https://istio.io/latest/docs/reference/config/networking/service-entry/#ServiceEntry-addresses

<br>

### .spec.exportTo

#### ▼ exportToとは

そのServiceEntryにリクエストできるNamespaceを設定する。

ServiceEntryはIstio EgressGatewayからリクエストを受信するため、基本的には`*`となるはずである。

```yaml
apiVersion: networking.istio.io/v1
kind: ServiceEntry
metadata:
  name: foo-service-entry
spec:
  exportTo:
    - "*"
```

<br>

### .spec.hosts

#### ▼ hostsとは

コンフィグストレージに登録する宛先のドメイン名を設定する。

部分的にワイルドカード (`*`) を使用できるが、全てのドメインを許可 (ワイルドカードのみ) することはできない。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: ServiceEntry
metadata:
  name: foo-service-entry
spec:
  hosts:
    - foo.com
```

```yaml
apiVersion: networking.istio.io/v1
kind: ServiceEntry
metadata:
  name: mysql-service-entry
spec:
  hosts:
    - <DBクラスター名>.cluster-<id>.ap-northeast-1.rds.amazonaws.com
```

> - https://istio.io/latest/docs/tasks/traffic-management/egress/wildcard-egress-hosts/

<br>

### .spec.location

#### ▼ locationとは

登録したシステムがサービスメッシュ内か否かを設定する。

#### ▼ MESH_EXTERNAL

登録したシステムがサービスメッシュ外にあることを表す。

```yaml
apiVersion: networking.istio.io/v1
kind: ServiceEntry
metadata:
  name: foo-service-entry
spec:
  location: MESH_EXTERNAL
```

> - https://istio.io/latest/docs/reference/config/networking/service-entry/#ServiceEntry-Location

#### ▼ MESH_INTERNAL

登録したシステムがサービスメッシュ内にあることを表す。

```yaml
apiVersion: networking.istio.io/v1
kind: ServiceEntry
metadata:
  name: foo-service-entry
spec:
  location: MESH_INTERNAL
```

> - https://istio.io/latest/docs/reference/config/networking/service-entry/#ServiceEntry-Location

<br>

### .spec.ports

#### ▼ portsとは

コンフィグストレージに登録する宛先のポート番号を設定する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: ServiceEntry
metadata:
  name: foo-service-entry
spec:
  ports:
    - name: tcp-mysql
      number: 3306
      protocol: TCP
```

```yaml
apiVersion: networking.istio.io/v1
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

#### ▼ DNS

DNSサーバーから返信されたIPアドレスを許可する。

サービスメッシュ外のパブリックなドメインに接続する場合は、必須である。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: ServiceEntry
metadata:
  name: foo-service-entry
spec:
  resolution: DNS
```

> - https://istio.io/latest/docs/tasks/traffic-management/egress/egress-gateway/

#### ▼ NONE

Istio EgressGatewayは値に注意が必要である。

ServiceEntryに対するリクエストの宛先IPアドレスはIstio EgressGatewayに書き換えられている。

そのため、DNS解決を`NONE`にすると、Istio EgressGatewayはServiceEntryを見つけられず、自分自身でループしてしまう。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: ServiceEntry
metadata:
  name: foo-service-entry
spec:
  resolution: DNS
```

<br>

## 10. Sidecar

### .spec.workloadSelector

適用対象のWorkloadを設定する。

設定しない場合、Namespace内の全てのPodが対象になる。

```yaml
apiVersion: networking.istio.io/v1
kind: Sidecar
metadata:
  name: foo
  namespace: foo
spec:
  workloadSelector:
    labels:
      app: foo-1
```

> - https://istio.io/latest/docs/reference/config/networking/sidecar/#Sidecar

<br>

### .spec.ingress

インバウンド通信のプロキシ時の接続情報を設定する。

```yaml
apiVersion: networking.istio.io/v1
kind: Sidecar
metadata:
  name: foo
  namespace: foo
spec:
  workloadSelector:
    labels:
      app: foo-1
  ingress:
    - port:
        number: 80
        protocol: HTTP
        name: http-ingress
      defaultEndpoint: 127.0.0.1:80
```

> - https://istio.io/latest/docs/reference/config/networking/sidecar/#IstioIngressListener

<br>

### .spec.egress

アウトバウンド通信のプロキシ時の接続情報を設定する。

```yaml
apiVersion: networking.istio.io/v1
kind: Sidecar
metadata:
  name: foo
  namespace: foo
spec:
  workloadSelector:
    labels:
      app: foo-1
  egress:
    - port:
        number: 80
        protocol: HTTP
        name: http-egress
      hosts:
        - bar-namespace.svc.cluster.local
```

> - https://istio.io/latest/docs/reference/config/networking/sidecar/#IstioEgressListener

<br>

## 11. Telemetry

### .metadata.namespace

NamespaceでTelemetyの対象のサイドカーを絞れる。

もし`istio-system`を指定した場合、Root Namespaceという設定になり、istio-proxyコンテナのある全てのNamespaceが対象になる。

```yaml
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  # もしistio-systemを指定した場合は、istio-proxyコンテナのある全てのNamespaceが対象になる
  namespace: foo
```

> - https://istio.io/latest/docs/tasks/observability/telemetry/#scope-inheritance-and-overrides

<br>

### accessLogging

#### ▼ accessLoggingとは

同じNamespace内の`istio-proxy`コンテナを対象として、アクセスログの作成方法を設定する。

```yaml
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  name: access-log-provider
  # サイドカーをインジェクションしている各Namespaceで作成する
  # もしistio-systemを指定した場合は、istio-proxyコンテナのある全てのNamespaceが対象になる
  namespace: foo
spec:
  selector:
    matchLabels:
      name: app
  # Envoyをアクセスログプロバイダーとして設定する
  accessLogging:
    - providers:
        - name: envoy
```

> - https://istio.io/latest/docs/reference/config/telemetry/#AccessLogging

ConfigMapで設定する場合は、以下のように設定する。

Telemetryによる設定が推奨である。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-mesh-cm
  namespace: istio-system
data:
  mesh: |
    accessLogFile: /dev/stdout
```

> - https://istio.io/latest/docs/tasks/observability/logs/access-log/#using-mesh-config

<br>

### metrics

#### ▼ metricsとは

同じNamespace内の`istio-proxy`コンテナを対象として、メトリクスの作成方法を設定する。

```yaml
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  name: metrics-provider
  # サイドカーをインジェクションしている各Namespaceで作成する
  # もしistio-systemを指定した場合は、istio-proxyコンテナのある全てのNamespaceが対象になる
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
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  name: trace-provider
  # サイドカーをインジェクションしている各Namespaceで作成する
  # もしistio-systemを指定した場合は、istio-proxyコンテナのある全てのNamespaceが対象になる
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

## 12. VirtualService

### .spec.exportTo

#### ▼ exportToとは

そのVirtualServiceにリクエストできるNamespaceを設定する。

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#VirtualService

#### ▼ `*` (アスタリスク)

デフォルト値である。

他のNamespaceのGatewayやDestinationRuleに紐づける場合、`*`とする必要がある。

もし、同じNamespace内のGatewayやDestinationRuleと紐づける場合、`.`とする。

つまり、Istio IngressGatewayやIstio EgressGatewayとリクエストを送受信するVirtualServiceとDestinationRuleでは`*`とし、それ以外のこれらの場合は`.`とする。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  exportTo:
    - "*"
  gateways:
    - foo-igress
  # Istio IngressGatewayは複数の種類のAPIへのリクエストを受信する
  # そのため、後続のVirtualServiceでは、複数の種類のHostヘッダー値を受信するため、ワイルドカードとする
  hosts:
    - "*"
```

#### ▼ `.` (ドット)

同じNamespace内のGatewayやDestinationRuleと紐づける場合、`.`とする。

もし、他のNamespaceのGatewayやDestinationRuleに紐づける場合、`*`とする必要がある。

つまり、Istio IngressGatewayやIstio EgressGatewayとリクエストを送受信するVirtualServiceとDestinationRuleでは`*`とし、それ以外のこれらの場合は`.`とする。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  exportTo:
    - "."
  gateways:
    # デフォルト値のため、設定は不要である
    - mesh
```

<br>

### .spec.hosts

#### ▼ hostsとは

VirtualServiceの設定値を適用する`Host`ヘッダー値を設定する。

ワイルドカード (`*`) を使用して全てのドメインを許可しても良いが、特定のマイクロサービスへのリクエストのみを扱うため、ホスト名もそれのみを許可すると良い。

なお、`.spec.gateways`キーで`mesh` (デフォルト値) を使用する場合、ワイルドカード以外を設定しないといけない。 (例：`.spec.hosts`キーを設定しない、特定のHostヘッダー値を設定するなど)

**＊実装例＊**

全てのHostヘッダー値でVirtualServiceを適用する。

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  # 特定のマイクロサービスへのリクエストのみを扱うため、ホスト名もそれのみを許可する
  # ただし、gatewaysオプションがあるVirtualServiceではワイルドカードする
  hosts:
    - foo
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
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  gateways:
    - foo-namespace/foo-gateway
  # Istio IngressGatewayは複数の種類のAPIへのリクエストを受信する
  # そのため、後続のVirtualServiceでは、複数の種類のHostヘッダー値を受信するため、ワイルドカードとする
  hosts:
    - "*"
```

#### ▼ `<Gateway名>`

VirtualServiceを、Istio IngressGateway/EgressGatewayに紐づける場合 (サービスメッシュ内外の通信) は`<Gateway名>`とする。

VirtualServiceとGatewayが同じNamespaceに所属する場合は、Namespaceを省略できる。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-ingress-virtual-service
spec:
  gateways:
    - foo-ingressgateway
  # Istio IngressGatewayは複数の種類のAPIへのリクエストを受信する
  # そのため、後続のVirtualServiceでは、複数の種類のHostヘッダー値を受信するため、ワイルドカードとする
  hosts:
    - "*"
```

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service-egress
spec:
  hosts:
    #  Hostヘッダー値がexternal.comの時にVirtualServiceを適用する。
    - external.com
  gateways:
    # PodからIstio EgressGatewayのPodへの通信で使用する
    # gateway名と両方設定する場合は、デフォルト値としての省略はできない
    - mesh
    # Istio EgressGatewayからエントリ済みシステムへの通信で使用する
    - foo-egressgateway
  http:
    # external.comに対するリクエストは、Istio EgressGatewayにルーティング (リダイレクト) する
    - match:
        - gateways:
            # PodからIstio EgressGatewayのPodへの通信で使用する
            - mesh
          port: 80
      route:
        - destination:
            host: istio-egressgateway.istio-egress.svc.cluster.local
            port:
              number: 80
    # Istio EgressGatewayに対するリクエストは、エントリ済システムにルーティングする
    - match:
        - gateways:
            # Istio EgressGatewayからエントリ済みシステムへの通信で使用する
            - foo-egressgateway
          port: 80
      route:
        - destination:
            # ServiceEntryの.spec.hostsキーで指定しているホスト値を設定する
            # ただし、ServiceEntryがホストに対して名前解決できていないと、そのホスト値を設定できない
            host: external.com
            port:
              number: 80
```

> - https://istio.io/latest/docs/tasks/traffic-management/egress/egress-gateway/#egress-gateway-for-http-traffic

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service-egress
spec:
  hosts:
    #  Hostヘッダー値がexternal.comの時にVirtualServiceを適用する。
    - external.com
  gateways:
    # PodからIstio EgressGatewayのPodへの通信で使用する
    - mesh
    # Istio EgressGatewayからエントリ済みシステムへの通信で使用する
    - foo-egressgateway
  tls:
    # external.comに対するリクエストは、Istio EgressGatewayにルーティング (リダイレクト) する
    - match:
        - gateways:
            # PodからIstio EgressGatewayのPodへの通信で使用する
            - mesh
          port: 443
          sniHosts:
            - external.com
      route:
        - destination:
            host: istio-egressgateway.istio-egress.svc.cluster.local
            port:
              number: 443
  http:
    # Istio EgressGatewayに対するリクエストは、エントリ済システムにルーティングする
    - match:
        - gateways:
            # Istio EgressGatewayからエントリ済みシステムへの通信で使用する
            - foo-egressgateway
          port: 443
      route:
        - destination:
            # ServiceEntryの.spec.hostsキーで指定しているホスト値を設定する
            # ただし、ServiceEntryがホストに対して名前解決できていないと、そのホスト値を設定できない
            host: external.com
            port:
              number: 443
```

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service-egress
spec:
  exportTo:
    - "*"
  hosts:
    # アプリはDBのFQDNを指定する
    # VirtualSErviceではこれを指定する
    - <DBクラスター名>.cluster-<id>.ap-northeast-1.rds.amazonaws.com
  gateways:
    - mesh
    - foo-egressgateway
  tcp:
    - match:
        - gateways:
            - mesh
          port: 3306
      route:
        - destination:
            host: istio-egressgateway.istio-egress.svc.cluster.local
            port:
              number: 3306
    - match:
        - gateways:
            - foo-egress
          port: 3306
      route:
        - destination:
            # ServiceEntryにそのままのHostヘッダーで転送する
            host: <DBクラスター名>.cluster-<id>.ap-northeast-1.rds.amazonaws.com
            port:
              number: 3306
```

> - https://reitsma.io/blog/using-istio-to-mitm-our-users-traffic
> - https://istio.io/latest/blog/2018/egress-tcp/

#### ▼ mesh

VirtualServiceを、Pod間通信で使用する場合は`mesh` (デフォルト値) とする。

Hostヘッダーに`*` (ワイルドカード) を使用できず、特定のHostヘッダーのみを許可する必要がある。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  gateways:
    # デフォルト値のため、設定は不要である
    - mesh
  hosts:
    # ワイルドカードを指定できず、特定のHostヘッダーを許可する必要がある
    - account-app
```

<br>

### .spec.http

HTTP/1.1、HTTP/2 (例：gRPCなど) のプロトコルによる通信をDestinationRuleに紐づくPodにルーティングする。

`.spec.tcp`キーや`.spec.tls`キーとは異なり、マイクロサービスがHTTPプロトコルで通信を送受信し、`istio-proxy`コンテナ間で相互TLSを実施する場合、これを使用する。

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#HTTPRoute

<br>

### .spec.http.corsPolicy

#### ▼ corsPolicyとは

ブラウザではデフォルトでCORSが有効になっており、正しいリクエストがCORSを突破できるように対処する必要がある。

多くの場合、バックエンドアプリケーションにCORSに対処することが多いが、`istio-proxy`コンテナで対処することもできる。

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#CorsPolicy

<br>

### .spec.http.fault

#### ▼ faultとは

発生させるフォールトインジェクションを設定する。

**＊実装例＊**

`503`ステータスのエラーを`100`%の確率で発生させる。

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  http:
    - fault:
        - abort:
            # 発生させるエラー
            httpStatus: 503
            # エラーを発生させる確率
            percentage:
              value: 100
```

> - https://speakerdeck.com/nutslove/istioru-men?slide=19

**＊実装例＊**

`10`秒のレスポンスの遅延を`100`%の確率で発生させる。

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  http:
    - fault:
        - delay:
            # レスポンスの遅延時間
            fixedDelay: 10s
            # 遅延レスポンスを発生させる割合
            percentage:
              value: 100
```

> - https://speakerdeck.com/nagapad/abema-niokeru-gke-scale-zhan-lue-to-anthos-service-mesh-huo-yong-shi-li-deep-dive?slide=124

<br>

### .spec.http.match

#### ▼ matchとは

受信した通信のうち、ルールを適用するもののメッセージ構造を設定する。

#### ▼ <ヘッダー名>

ヘッダー名で合致条件を設定する。

**＊実装例＊**

受信した通信のうち、`x-foo`ヘッダーに`bar`が割り当てられたものだけにルールを適用する。

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  http:
    - match:
        - headers:
            x-foo:
              exact: bar
```

**＊実装例＊**

ユーザーエージェントで振り分ける。

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  # Istio IngressGatewayは複数の種類のAPIへのリクエストを受信する
  # ただし、gatewaysオプションがあるVirtualServiceではワイルドカードする
  hosts:
    - foo
  http:
    - match:
        - headers:
            user-agent:
              regex: <PCのユーザーエージェント>
      route:
        - destination:
            host: pc
    - match:
        - headers:
            user-agent:
              regex: <スマホのユーザーエージェント>
      route:
        - destination:
            host: sp
```

> - https://www.mtioutput.com/entry/oc-istio-header

#### ▼ gateways

`.spec.gateways`キーで設定した`<Gateway名>`と`mesh` (デフォルト値) のうちで、その合致条件に使用する方を設定する。

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-ingress
spec:
  exportTo:
    - "*"
  hosts:
    - httpbin.org
  gateways:
    - foo-ingressgateway
    - mesh
  http:
    - match:
        - gateways:
            # PodからIstio EgressGatewayのPodへの通信で使用する
            - mesh
          port: 443
      route:
        - destination:
            host: istio-egressgateway.istio-egress.svc.cluster.local
            port:
              number: 443
    - match:
        - gateways:
            # Istio EgressGatewayからエントリ済みシステムへの通信で使用する
            - foo-ingressgateway
          port: 443
      route:
        - destination:
            # ServiceEntryの.spec.hostsキーで指定しているホスト値を設定する
            # ただし、ServiceEntryがホストに対して名前解決できていないと、そのホスト値を設定できない
            host: httpbin.org
            port:
              number: 443
```

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#HTTPMatchRequest

#### ▼ uri

ヘッダー名で合致条件を設定する。

**＊実装例＊**

受信した通信のうち、URLの接頭辞が`/foo`のものだけにルールを適用する。

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  http:
    - match:
        - headers:
            uri:
              prefix: /foo
```

> - https://istiobyexample.dev/path-based-routing/

<br>

### .spec.http.retries

#### ▼ retriesとは

再試行条件を設定する。

なお、TCPリクエストには`spec.tcp[*].retries`キーのような同様の設定は存在しない。

**＊実装例＊**

500系ステータスの場合に、`attempts`の数だけ再試行する。

各再試行で処理の結果が返却されるまでのタイムアウト値を`perTryTimeout`で設定する。

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
spec:
  hosts:
    - foo-service.foo-namespace.svc.cluster.local
  http:
    - route:
        - destination:
            host: foo-service.foo-namespace.svc.cluster.local
      retries:
        attempts: 3
        perTryTimeout: 5s
        # Envoyのx-envoy-retry-onの値
        retryOn: 5xx
```

gateway-error (`502`、`503`、`504`ステータス) の場合に、`attempts`の数だけ再試行する。

各再試行で処理の結果が返却されるまでのタイムアウト値を`perTryTimeout`で設定する。

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
spec:
  hosts:
    - foo-service.foo-namespace.svc.cluster.local
  http:
    - route:
        - destination:
            host: foo-service.foo-namespace.svc.cluster.local
      retries:
        attempts: 3
        perTryTimeout: 5s
        # Envoyのx-envoy-retry-onの値
        retryOn: gateway-error
```

> - https://speakerdeck.com/nutslove/istioru-men?slide=18
> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#HTTPRetry
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#x-envoy-retry-on

#### ▼ attempt

`istio-proxy`コンテナのリバースプロキシに失敗した場合の再試行回数を設定する。

Serviceへのルーティングの失敗ではないことに注意する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  http:
    - retries:
        attempts: 3
```

#### ▼ retryOn

再試行失敗の理由を設定する。

`istio-proxy`コンテナは、レスポンスの`x-envoy-retry-on`ヘッダーに割り当てるため、これの値を設定する。

宛先アプリコンテナが`istio-proxy`コンテナに返信できた場合は以下である。

| 設定                     | 理由                                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `cancelled`              | 宛先アプリコンテナから`istio-proxy`コンテナに返信できたが、gRPCステータスコードが`Cancelled`であった。         |
| `connect-failure`        | 宛先アプリコンテナから`istio-proxy`コンテナに返信できたが、読み取りタイムアウトが起こった。                    |
| `deadline-exceeded`      | 宛先アプリコンテナから`istio-proxy`コンテナに返信できたが、gRPCステータスコードが`DeadlineExceeded`であった。  |
| `refused-stream`         | 宛先アプリコンテナから`istio-proxy`コンテナに返信できたが、gRPCステータスコードが`Unavailable`であった。       |
| `reset`                  | 宛先アプリコンテナから`istio-proxy`コンテナに返信できたが、通信の切断／リセット／タイムアウトが起こった。      |
| `resource-exhausted`     | 宛先アプリコンテナから`istio-proxy`コンテナに返信できたが、gRPCステータスコードが`ResourceExhausted`であった。 |
| `retriable-status-codes` | 宛先アプリコンテナから`istio-proxy`コンテナに返信できたが、HTTPステータスコードが`503`ステータスであった。     |
| `unavailable`            | 宛先アプリコンテナから`istio-proxy`コンテナに返信できたが、gRPCステータスコードが`Unavailable`であった。       |

宛先アプリコンテナが`istio-proxy`コンテナに返信できなかった場合は以下である。

| 設定                   | 理由                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| `reset-before-request` | 宛先アプリコンテナから`istio-proxy`コンテナに返信できず、通信のリセット／接続タイムアウトが起こった。 |

**＊実装例＊**

デフォルトでは、再試行の条件は`connect-failure,refused-stream,unavailable`である。

`EXCLUDE_UNSAFE_503_FROM_DEFAULT_RETRY`変数を`true`にすると、元はデフォルト値であった`503`を設定できる。

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  http:
    - retries:
        retryOn: "connect-failure,refused-stream,unavailable"
```

> - https://sreake.com/blog/istio/
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#x-envoy-retry-on
> - https://github.com/istio/istio/issues/50506#issuecomment-2230102675

<br>

### .spec.http.route

#### ▼ destination.host

受信した通信で宛先のServiceのドメイン名 (あるいはService名) を設定する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
spec:
  # Istio IngressGatewayは複数の種類のAPIへのリクエストを受信する
  # ただし、gatewaysオプションがあるVirtualServiceではワイルドカードする
  hosts:
    - foo-service.foo-namespace.svc.cluster.local
  http:
    - route:
        - destination:
            # Service名でも良い。
            host: foo-service.foo-namespace.svc.cluster.local
```

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#Destination

#### ▼ destination.port

受信する通信でルーティング先のポート番号を設定する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  # Istio IngressGatewayは複数の種類のAPIへのリクエストを受信する
  # ただし、gatewaysオプションがあるVirtualServiceではワイルドカードする
  hosts:
    - foo-service.foo-namespace.svc.cluster.local
  http:
    - route:
        - destination:
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 80
```

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#Destination

#### ▼ destination.subset

![istio_virtual-service_destination-rule_subset](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_virtual-service_destination-rule_subset.png)

VirtualServiceを起点としたPodのカナリアリリースで使用する。

紐付けたいDestinationRuleのサブセット名と同じ名前を設定する。

DestinationRuleで受信した通信を、DestinationRuleのサブセットに紐づくPodにルーティングする。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  # Istio IngressGatewayは複数の種類のAPIへのリクエストを受信する
  # ただし、gatewaysオプションがあるVirtualServiceではワイルドカードする
  hosts:
    - foo-service.foo-namespace.svc.cluster.local
  http:
    - route:
        - destination:
            # Service名でも良い
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 80
            subset: v1 # 旧Pod
          weight: 70
        - destination:
            # Service名でも良い
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 80
            subset: v2 # 新Pod
          weight: 30
```

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#Destination
> - https://atmarkit.itmedia.co.jp/ait/articles/2112/21/news009.html

#### ▼ weight

Serviceの重み付けルーティングの割合を設定する。

`.spec.http[*].route[*].destination.subset`キーの値は、DestinationRuleで設定した`.spec.subsets[*].name`キーに合わせる必要がある。

重み付けの偏りの割合によって、カナリアリリースやB/Gデプロイメントを実現できる。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  # Istio IngressGatewayは複数の種類のAPIへのリクエストを受信する
  # ただし、gatewaysオプションがあるVirtualServiceではワイルドカードする
  hosts:
    - foo-service.foo-namespace.svc.cluster.local
  http:
    - route:
        - destination:
            # Service名でも良い
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 80
            subset: v1 # 旧Pod
          weight: 70
        - destination:
            # Service名でも良い
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 80
            subset: v2 # 新Pod
          weight: 30
```

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#HTTPRouteDestination
> - https://speakerdeck.com/nutslove/istioru-men?slide=20

<br>

### .spec.http.timeout

#### ▼ timeoutとは

`istio-proxy`コンテナの宛先にリクエストを送信する時のタイムアウト時間を設定する。

`0`秒の場合、タイムアウトは無制限になる。

これは、Envoyのルートの`grpc_timeout_header_max`と`timeout`の両方に適用される。

指定した時間以内に、`istio-proxy`コンテナの宛先からレスポンスがなければ、`istio-proxy`コンテナはタイムアウトとして処理する。

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  http:
    # destinationにリクエストを送信する時のタイムアウト時間
    - timeout: 40s
      route:
        - destination:
            # Service名でも良い
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 80
            subset: v1 # 旧Pod
          weight: 70
        - destination:
            # Service名でも良い
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 80
            subset: v2 # 新Pod
          weight: 30
```

> - https://istio.io/latest/docs/tasks/traffic-management/request-timeouts/
> - https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/route/v3/route_components.proto

<br>

### .spec.tcp

#### ▼ tcpとは

`.spec.http`キーや`.spec.tls`キーとは異なり、TCPプロトコルや独自プロトコル (例：MySQLなど) による通信をDestinationRuleに紐づくPodにルーティングする。

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#TCPRoute

#### ▼ match

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
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
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  # Istio IngressGatewayは複数の種類のAPIへのリクエストを受信する
  # ただし、gatewaysオプションがあるVirtualServiceではワイルドカードする
  hosts:
    - foo-service.foo-namespace.svc.cluster.local
  tcp:
    - route:
        - destination:
            # Service名でも良い
            # foo-service
            host: foo-service.foo-namespace.svc.cluster.local
```

#### ▼ route.destination.port

`.spec.http`キーと同じ機能である。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  # Istio IngressGatewayは複数の種類のAPIへのリクエストを受信する
  # ただし、gatewaysオプションがあるVirtualServiceではワイルドカードする
  hosts:
    - foo-service.foo-namespace.svc.cluster.local
  tcp:
    - route:
        - destination:
            # Service名でも良い
            # foo-service
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 9000
```

#### ▼ route.destination.subset

`.spec.http`キーと同じ機能である。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  tcp:
    - route:
        - destination:
            # Service名でも良い
            # foo-service
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 9000
            subset: v1 # 旧Pod
          weight: 70
        - destination:
            # Service名でも良い
            # foo-service
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 9000
            subset: v2 # 新Pod
          weight: 30
```

<br>

### .spec.tls

#### ▼ tlsとは

`.spec.http`キーや`.spec.tcp`キーとは異なり、HTTPSプロトコルの通信をDestinationRuleに紐づくPodにルーティングする。

マイクロサービスがHTTPSプロトコルで通信を送受信し、`istio-proxy`コンテナ間で相互TLSを実施する場合、これを使用する。

他に、マイクロサービスがHTTPSリクエストを送信し、Istio EgressGatewayでこれをそのまま通過させる (`PASSTHROUGH`) 場合も必要になる。

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#TLSRoute

<br>

## 13. WorkloadEntry

Kubernetes Clusterの外にある単一の仮想サーバーをサービスメッシュ内で管理する。

データベースをKubernetes Cluster外の仮想サーバー上で稼働させていたり、一部のマイクロサービスを仮想サーバー上で稼働させなければならない場合に役立つ。

ただし、仮想サーバー内でistioプロセスをインストールし、実行する必要がある。

```bash
# インストール
$ curl -LO https://storage.googleapis.com/istio-release/releases/1.24.2/deb/istio-sidecar.deb
$ sudo dpkg -i istio-sidecar.deb

... # 諸々の手順

# デーモンプロセスを実行
$ sudo systemctl start istio
```

> - https://istio.io/latest/blog/2020/workload-entry/
> - https://qiita.com/ipppppei/items/b376602ae6c325e3a55e
> - https://istio.io/latest/docs/setup/install/virtual-machine/#start-istio-within-the-virtual-machine
> - https://istio.io/latest/docs/examples/virtual-machines/

<br>

## 14. WorkloadGroup

Kubernetes Clusterの外にある複数の仮想サーバーをサービスメッシュ内で管理する。

データベースをKubernetes Cluster外の仮想サーバー上で稼働させていたり、一部のマイクロサービスを仮想サーバー上で稼働させなければならない場合に役立つ。

ただし、仮想サーバー内でistioプロセスをインストールし、実行する必要がある。

```bash
# インストール
$ curl -LO https://storage.googleapis.com/istio-release/releases/1.24.2/deb/istio-sidecar.deb
$ sudo dpkg -i istio-sidecar.deb

... # 諸々の手順

# デーモンプロセスを実行
$ sudo systemctl start istio
```

> - https://istio.io/latest/blog/2020/workload-entry/
> - https://qiita.com/ipppppei/items/b376602ae6c325e3a55e
> - https://istio.io/latest/docs/setup/install/virtual-machine/#start-istio-within-the-virtual-machine
> - https://istio.io/latest/docs/examples/virtual-machines/

<br>
