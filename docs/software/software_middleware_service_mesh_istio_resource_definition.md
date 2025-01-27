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

送信元のPod紐づくServiceAccountが適切な場合に、認可を実施するように設定する。

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
  name: foo-destination-rule
spec:
  exportTo:
    - "*"
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

また、サーキットブレイカーの閾値になる。

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
        maxRequestsPerConnection: 1
```

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#ConnectionPoolSettings-HTTPSettings

#### ▼ connectionPool.http.http1MaxPendingRequests

記入中...

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
        http1MaxPendingRequests: 1
```

> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#ConnectionPoolSettings-HTTPSettings

#### ▼ connectionPool.tcp.maxConnections

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

#### ▼ outlierDetection.interval

サーキットブレイカーの外れ値の計測間隔を設定する。

間隔内で閾値以上のエラーが発生した場合に、サーキトブレイカーが起こる

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

#### ▼ outlierDetection.consecutiveGatewayErrors

サーキットブレイカーを発動するエラーの閾値数を設定する

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    outlierDetection:
      consecutiveGatewayErrors: 3
```

> - https://ibrahimhkoyuncu.medium.com/istio-powered-resilience-advanced-circuit-breaking-and-chaos-engineering-for-microservices-c3aefcb8d9a9
> - https://speakerdeck.com/nutslove/istioru-men?slide=25
> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#OutlierDetection

#### ▼ outlierDetection.baseEjectionTime

Podをルーティング先から切り離す秒数を設定する

**＊実装例＊**

10秒以内にエラーがが3回以上発生したら、30秒間Podを切り離す。

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    outlierDetection:
      consecutiveGatewayErrors: 3
      interval: 10s
      baseEjectionTime: 30s
```

> - https://ibrahimhkoyuncu.medium.com/istio-powered-resilience-advanced-circuit-breaking-and-chaos-engineering-for-microservices-c3aefcb8d9a9
> - https://speakerdeck.com/nutslove/istioru-men?slide=25
> - https://istio.io/latest/docs/reference/config/networking/destination-rule/#OutlierDetection

#### ▼ outlierDetection.minHealthPercent

指定された割合で正常になるように、ルーティング先を決める。

異常なルーティング先がある場合は正常な方にルーティングし、異常なルーティング先が回復することを待つ

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
              "<リージョン名>/<ゾーン名>/*": 70
              "<リージョン名>/<ゾーン名>/*": 30
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

Podへのルーティング時に使用するHTTPSプロトコルのタイプを設定する。

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
              # 3回応答がなければ終了する
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

### .spec.servers

#### ▼ port.name

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

#### ▼ port.number

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

#### ▼ port.protocol

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

#### ▼ port.targetPort

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

#### ▼ hosts

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

#### ▼ tls.caCertificates

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

#### ▼ tls.credentialName

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

#### ▼ tls.mode

Gatewayの宛先との通信の暗号化方式を設定する。

**＊実装例＊**

クライアントとGatewayの通信間で相互TLSを実施する。

クライアント証明書が必要になる。

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

**＊実装例＊**

クライアントとGatewayの通信間で通常のHTTPSを実施する。

クライアント証明書は不要にである。

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

> - https://istio.io/latest/docs/reference/config/networking/gateway/#ServerTLSSettings-TLSmode

#### ▼ tls.privateKey

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

#### ▼ tls.serverCertificate

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

#### ▼ Auth0に送信する場合

注意点として、そもそもリクエストにJWTが含まれていない場合には認証処理をスキップできてしまう。

代わりに、JWTが含まれていないリクエストをAuthorizationPolicyによる認可処理失敗 (`403`ステータス) として扱う必要がある。

Auth0 (クラウドのためサービスメッシュ外にある) の宛先情報をIstioに登録する必要があるため、Istio EgressGatewayやServiceEntry経由で接続できるようにする。

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt
spec:
  jwtRules:
    # JWTの発行元認証局エンドポイントを設定する
    - issuer: https://<Auth0のドメイン>/
      # JWTの署名を検証するための公開鍵のURLを設定する
      jwksUri: https://<Auth0のドメイン>/.well-known/jwks.json
      # 既存のJWTを再利用し、後続のマイクロサービスにそのまま転送する
      forwardOriginalToken: true
      # Authorizationヘッダーを指定する
      fromHeaders:
        - name: Authorization
          prefix: "Bearer "
---
# AuthorizationPolicyでRequestAuthenticationを強制する
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
          values: ["https://<Auth0のドメイン>/"]
```

> - https://tech.jxpress.net/entry/deploy-secure-api-with-istio-and-auth0-in-5-mins
> - https://istio.io/latest/docs/concepts/security/#request-authentication
> - https://github.com/istio/istio/issues/26559#issuecomment-675682440

#### ▼ Keycloakに送信する場合

注意点として、そもそもリクエストにJWTが含まれていない場合には認証処理をスキップできてしまう。

代わりに、JWTが含まれていないリクエストをAuthorizationPolicyによる認可処理失敗 (`403`ステータス) として扱う必要がある。

Keycloakの宛先情報をIstioに登録する必要があるため、これのPodをサービスメッシュ内に配置するか、サービスメッシュ外に配置してIstio EgressGatewayやServiceEntry経由で接続できるようにする。

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt
spec:
  jwtRules:
    # JWTの発行元認証局エンドポイントを設定する
    - issuer: http://keycloak.foo-namespace.svc.cluster.local/realms/<realm名>
      # JWTの署名を検証するための公開鍵のURLを設定する
      jwksUri: http://keycloak.foo-namespace.svc.cluster.local/realms/<realm名>/protocol/openid-connect/certs
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
          values:
            ["http://keycloak.foo-namespace.svc.cluster.local/realms/<realm名>"]
```

> - https://thinkit.co.jp/article/18023
> - https://www.keycloak.org/docs/latest/securing_apps/index.html#_certificate_endpoint
> - https://istio.io/latest/docs/concepts/security/#request-authentication
> - https://github.com/istio/istio/issues/26559#issuecomment-675682440

#### ▼ OAuth2 Proxyを介してKeycloakに送信する場合

注意点として、そもそもリクエストにJWTが含まれていない場合には認証処理をスキップできてしまう。

代わりに、JWTが含まれていないリクエストをAuthorizationPolicyによる認可処理失敗 (`403`ステータス) として扱う必要がある。

OAuth2 Proxyの宛先情報をIstioに登録する必要があるため、これのPodをサービスメッシュ内に配置するか、サービスメッシュ外に配置してIstio EgressGatewayやServiceEntry経由で接続できるようにする。

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt
spec:
  jwtRules:
    # OAuth2 Proxyに送信する
    - issuer: http://oauth2-proxy.foo-namespace.svc.cluster.local/realms/<realm名>
      # JWTの署名を検証するための公開鍵のURLを設定する
      jwksUri: http://oauth2-proxy.foo-namespace.svc.cluster.local/realms/<realm名>/protocol/openid-connect/certs
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
  selector:
    matchLabels:
      app: istio-ingressgateway
  action: CUSTOM
  # oauth2-proxyプロバイダーの設定を使用する
  provider:
    name: oauth2-proxy
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-cm
data:
  mesh: |
    extensionProviders:
      - name: oauth2-proxy
        envoyExtAuthzHttp:
          # 認可リクエストの宛先を設定する
          service: oauth2-proxy.foo-namespace.svc.cluster.local
          port: 4180    
          # 認可リクエストに追加する必要のあるヘッダーを設定する
          includeRequestHeadersInCheck:
            - cookie
          # 認証の完了後に、元のアップストリームへのリクエストを変更するかどうかを設定する
          # リフレッシュしたアクセストークンを元のAuthorizarionヘッダーに設定したい場合、これを設定する必要がある (たぶん)
          headersToUpstreamOnAllow:
            - authorization
          headersToDownstreamOnDeny:
            - set-cookie
```

> - https://venafi.com/blog/istio-oidc/
> - https://istio.io/latest/docs/concepts/security/#request-authentication
> - https://github.com/istio/istio/issues/26559#issuecomment-675682440

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

なお、Istio EgressGatewayは値に注意が必要である。

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

記入中...

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
    - foo-egress-gateway
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
            - foo-egress-gateway
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
    - foo-egress-gateway
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
            - foo-egress-gateway
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
    - foo-egress-gateway
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

#### ▼ httpとは

HTTP/1.1、HTTP/2 (例：gRPCなど) 、のプロトコルによるインバウンド通信をDestinationRuleに紐づくPodにルーティングする。

> - https://istio.io/latest/docs/reference/config/networking/virtual-service/#HTTPRoute

#### ▼ fault

発生させるフォールトインジェクションを設定する。

**＊実装例＊**

`503`ステータスのエラーを`100`%発生させる。

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
            fixedDelay: 22s
            # 遅延レスポンスを発生させる割合
            percentage:
              value: 100
```

#### ▼ timeout

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

### .spec.http.match

#### ▼ http.matchとは

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
  name: foo-virtual-service
spec:
  exportTo:
    - "*"
  hosts:
    - httpbin.org
  gateways:
    - foo-igress
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
            - foo-igress
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

#### ▼ http.retriesとは

リトライ条件を設定する。

なお、TCPリクエストには`spec.tcp[*].retries`キーのような同様の設定は存在しない。

**＊実装例＊**

500系ステータスの場合に、`attempts`の数だけリトライする。

各リトライで処理の結果が返却されるまでのタイムアウト値を`perTryTimeout`で設定する。

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

gateway-error (`502`、`503`、`504`ステータス) の場合に、`attempts`の数だけリトライする。

各リトライで処理の結果が返却されるまでのタイムアウト値を`perTryTimeout`で設定する。

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

再試行する失敗理由を設定する。

`istio-proxy`コンテナは、レスポンスの`x-envoy-retry-on`ヘッダーに割り当てるため、これの値を設定する。

> - https://sreake.com/blog/istio/
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#x-envoy-retry-on

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  http:
    - retries:
        retryOn: "connect-failure,refused-stream,unavailable,503"
```

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

### .spec.tcp

#### ▼ tcpとは

TCPスリーウェイハンドシェイクの通信を、DestinationRuleに紐づくPodにルーティングする。

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
