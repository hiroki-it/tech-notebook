---
title: 【IT技術の知見】リソース定義＠Istio
description: リソース定義＠Istioの知見を記録しています。
---

# リソース定義＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. 全部入りセットアップ

### インストール

#### ▼ チャートとして

チャートリポジトリからチャートをインストールし、Kubernetes リソースを作成する。

チャートは、`istioctl` コマンドインストール時、`manifests` ディレクトリ以下に同梱される。

```bash
# IstioOperatorのdemoをインストールし、リソースを作成する
$ istioctl install --set profile=demo revision=1-10-0

# 外部のチャートを使用する場合
$ istioctl install --manifests=foo-chart
```

> - [Istio / Install with Istioctl](https://istio.io/latest/docs/setup/install/istioctl/#install-from-external-charts)

執筆時点 (2023/01/16) で IstioOperator は非推奨になっている。

> - [3 Common Ways to Install Istio \| Solo.io](https://www.solo.io/blog/3-most-common-ways-install-istio/)

#### ▼ Operator として (ユーザー定義)

プロファイルを使用する代わりに、IstioOperator を自前で定義してもよい。

```yaml
# istio-operator.yaml ファイル
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  name: istio-operator
spec:
  # Istio の demo チャートをインストールし、リソースを作成する。
  profile: demo
```

```bash
$ kubectl apply -f istio-operator.yaml
```

> - https://istio.io/latest/docs/setup/install/operator/#install-istio-with-the-operator

<br>

### ローカルマシンのセットアップ

#### ▼ Minikube

Istio による種々のコンテナが稼働するために、Minikube の Node の CPU とメモリを最低サイズを以下の通りにする必要がある。

```bash
$ minikube start --cpus=4 --memory=16384
```

<br>

## 01-02. コンポーネント別セットアップ

### インストール

#### ▼ Google-APIs から

Google-APIs から、Istio のコンポーネント別にチャートをインストールし、リソースを作成する。

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

IngressGateway のインストールは必須でない。

```bash
# IngressGatewayのみ
# gatewayチャート
$ helm install <Helmリリース名> <チャートリポジトリ名>/gateway -n istio-system --version <バージョンタグ>
```

> - [Istio / Install with Helm](https://istio.io/latest/docs/setup/install/helm/#installation-steps)

<br>

## 02. AuthorizationPolicy

### .metadata.namespace

AuthorizationPolicy の適用範囲の仕組みは、RequestAuthentication と同じである。

作成した Namespace に対して適用され、MeshConfig の `rootNamespace` (デフォルトは `istio-system`) に置いた場合はすべての Namespace のデフォルト設定になる。

もし、適用範囲を小さくしたい場合は、`.spec.selector` キーを使用する。

<br>

### .spec.action

#### ▼ action とは

認可スコープで、認証済みの送信元を許可するか否かを設定する。

```yaml
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: bar-authorization-policy
spec:
  action: ALLOW
```

> - [Istio / Authorization Policy](https://istio.io/latest/docs/reference/config/security/authorization-policy/)
> - [Kubernetes入門(30) Istioを使ったサービスメッシュ構築 - 特徴3：Security \| TECH+（テックプラス）](https://news.mynavi.jp/techplus/article/kubernetes-30/)

<br>

### .spec.provider

#### ▼ provider とは

認可フェーズの委譲先の ID プロバイダーを設定する。

事前に、ConfigMap の `.mesh.extensionProviders` キーに ID プロバイダーを登録しておく必要がある。

**＊実装例＊**

ここでは、OAuth2 Proxy を ID プロバイダーとして使用する。

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

OAuth2 Proxy の Pod に紐づく Service を識別できるようにする。

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
          includeRequestHeadersInCheck:
            - cookie
            - authorization
```

> - [\[Kuberntes\] 汎用OAuth2 Proxyをサービスの手前に置く：認証認可編](https://zenn.dev/takitake/articles/a91ea116cabe3c#istio%E3%81%AB%E5%A4%96%E9%83%A8%E8%AA%8D%E5%8F%AF%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%82%92%E7%99%BB%E9%8C%B2)
> - [\[Kuberntes\] 汎用OAuth2 Proxyをサービスの手前に置く：認証認可編](https://zenn.dev/takitake/articles/a91ea116cabe3c#%E5%BF%85%E8%A6%81%E3%81%AA%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%82%92%E4%BD%9C%E6%88%90-1)
> - [Istio / External Authorization](https://istio.io/latest/docs/tasks/security/authorization/authz-custom/#define-the-external-authorizer)

<br>

### .spec.rules

#### ▼ rules とは

認可スコープで、実施条件 (例：いずれの Kubernetes リソース、HTTP メソッド、JWT トークンの発行元 ID プロバイダーの識別子) を設定する。

その条件に合致した場合、認証済みの送信元を許可するか否かを判定する。

#### ▼ 特定の ServiceAccount を持つ Pod を送信元として許可する

送信元 Pod に紐づく ServiceAccount が送信元の場合、認可を実施する。

Istio はクライアント証明書に ID (例：SPIFFE ID) を設定しており、この ID が `principals` 値と一致するかを検証する。

Kubernetes では送信元 Pod の名前を知る方法がない (IP アドレスは可能) なので、制御しやすくなる。

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

> - [認可ポリシーの概要 \| Cloud Service Mesh \| Google Cloud Documentation](https://cloud.google.com/service-mesh/docs/security/authorization-policy-overview?hl=ja#identified_workload)

#### ▼ 特定の Namespace を送信元として許可する

特定の Namespace が送信元の場合、認可を実施する。

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

> - [認可ポリシーの概要 \| Cloud Service Mesh \| Google Cloud Documentation](https://cloud.google.com/service-mesh/docs/security/authorization-policy-overview?hl=ja#identified_namespace)

#### ▼ 正しい JWT を許可する

リクエストヘッダーにある JWT トークンの発行元 ID プロバイダーが適切な場合、認可を実施するように設定する。

**＊実装例＊**

```yaml
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: allow-jwt
spec:
  # 許可する
  action: ALLOW
  rules:
    - when:
        - key: request.auth.claims[iss]
          # JWT トークンがある場合にのみ許可する
          values: ["<JWTトークンの発行元IDプロバイダーの識別子 (issuer)>"]
```

**＊実装例＊**

```yaml
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: allow-jwt
spec:
  # 許可する
  action: ALLOW
  rules:
    # from を設定しない場合、指定したパスでは JWT トークンがなくても許可する
    - to:
        - operation:
            paths:
              - /
              - /callback*
              - /login
              - /logout
              - /static*
```

> - [Istio / Authorization Policy](https://istio.io/latest/docs/reference/config/security/authorization-policy/)
> - [Istio / Authorization Policy](https://istio.io/latest/docs/reference/config/security/authorization-policy/#Rule-From)

#### ▼ すべてを拒否する

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

> - [認可ポリシーの概要 \| Cloud Service Mesh \| Google Cloud Documentation](https://cloud.google.com/service-mesh/docs/security/authorization-policy-overview?hl=ja#allow_nothing)

#### ▼ すべてを許可する

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

> - [認可ポリシーの概要 \| Cloud Service Mesh \| Google Cloud Documentation](https://cloud.google.com/service-mesh/docs/security/authorization-policy-overview?hl=ja#deny_all_access)

#### ▼ 非 TLS を拒否する

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

> - [認可ポリシーの概要 \| Cloud Service Mesh \| Google Cloud Documentation](https://cloud.google.com/service-mesh/docs/security/authorization-policy-overview?hl=ja#reject_plaintext_requests)

<br>

### .spec.selector

#### ▼ selector とは

AuthorizationPolicy の設定を適用する Kubernetes リソースを設定する。

設定した Kubernetes リソースに対して認証済みの送信元が通信した場合、AuthorizationPolicy を適用する。

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

> - [Istio / Authorization Policy](https://istio.io/latest/docs/reference/config/security/authorization-policy/)
> - [Kubernetes入門(30) Istioを使ったサービスメッシュ構築 - 特徴3：Security \| TECH+（テックプラス）](https://news.mynavi.jp/techplus/article/kubernetes-30/)

<br>

## 03. DestinationRule

### .spec.exportTo

#### ▼ exportTo とは

DestinationRule の設定を公開する Namespace を設定する。

> - [Istio / Virtual Service](https://istio.io/latest/docs/reference/config/networking/virtual-service/#VirtualService)

#### ▼ `*` (アスタリスク)

デフォルト値である。

異なる Namespace の通信元で設定を使用する場合、`*` で全 Namespace に公開する。

通信元が同じ Namespace にある場合、`.` で同じ Namespace 内だけに公開できる。

Gateway を使用するかどうかではなく、設定を使用する通信元の Namespace に合わせて公開範囲を決める。

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

通信元が同じ Namespace にある場合、`.` で同じ Namespace 内だけに公開できる。

異なる Namespace の通信元で設定を使用する場合、`*` で全 Namespace に公開する。

Gateway を使用するかどうかではなく、設定を使用する通信元の Namespace に合わせて公開範囲を決める。

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

トラフィックポリシーの適用対象とする宛先 Service または ServiceEntry のホスト名を設定する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  host: foo-service.default.svc.cluster.local # Service 名でも良いが完全修飾ドメイン名のほうが良い。
```

> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/#DestinationRule)

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

> - [Istio / Egress Gateways](https://istio.io/latest/docs/tasks/traffic-management/egress/egress-gateway/#egress-gateway-for-http-traffic)

<br>

### .spec.subsets

#### ▼ subsets とは

VirtualService を起点とした Pod のカナリアリリースで使用する。

ルーティング先の Pod の `.metadata.labels` キーを設定する。

`.spec.subsets[*].name` キーの値は、VirtualService で設定した `.spec.http[*].route[*].destination.subset` キーに合わせる必要がある。

![istio_virtual-service_destination-rule_subset](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_virtual-service_destination-rule_subset.png)

**＊実装例＊**

`subset` が `v1` に対するインバウンド通信では、`version` キーの値が `v1` である Pod にルーティングする。

`v2` も同様である。

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  subsets:
    - name: v1
      labels:
        version: v1 # 旧 Pod
    - name: v2
      labels:
        version: v2 # 新 Pod
```

> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/#Subset)
> - [Istioのトラフィック制御ならブルーグリーンデプロイメント、カナリアリリース、フォールトインジェクション、サーキットブレーカーは簡単にできる：Cloud Nativeチートシート（11） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2112/21/news009.html)
> - [Istio 導入への道 - VirtualService 編](https://blog.1q77.com/2020/03/istio-part3/)

<br>

### .spec.trafficPolicy

#### ▼ connectionPool.http.maxRequestsPerConnection

1 つの TCP 接続で許可される HTTP1.1 と HTTP/2 プロトコルのリクエストの最大数を設定する。

デフォルトでは上限がない。

`1` とする場合は HTTP KeepAlive を無効にし、リクエストごとに接続を閉じる。

HTTP/2 の場合は、1 つの TCP 接続上で複数のストリームを使用し、複数のリクエスト／レスポンスを並行して送受信できる。

istio-proxy は HTTP/2 ストリームを個別に数える。

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
        # HTTP KeepAlive を無効にする
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

> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/#ConnectionPoolSettings-HTTPSettings)
> - [Protocol options (proto) — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/core/v3/protocol.proto#envoy-v3-api-field-config-core-v3-httpprotocoloptions-max-requests-per-connection)

#### ▼ connectionPool.http.http1MaxPendingRequests

キューに入れられる HTTP リクエストの最大数を設定する。

キューを超える HTTP リクエストに対しては、`503` レスポンスを返信する。

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

> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/#ConnectionPoolSettings-HTTPSettings)
> - [DestinationRuleによる流量制限の選択肢と挙動 #openshift - Qiita](https://qiita.com/sonq/items/4cee6f85f91ea7dfcbbf#http1maxpendingrequests)

#### ▼ connectionPool.http.http2MaxRequests

同時処理できる HTTP/1.1 と HTTP/2 の最大リクエスト数である。

これを超過した場合、そのリクエストに対しては `503` ステータスになる。

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

> - [ABEMA における GKE スケール戦略と Anthos Service Mesh 活用事例 Deep Dive - Speaker Deck](https://speakerdeck.com/nagapad/abema-niokeru-gke-scale-zhan-lue-to-anthos-service-mesh-huo-yong-shi-li-deep-dive?slide=115)

#### ▼ connectionPool.http.idleTimeout

HTTP リクエストでアイドルタイムアウト (パケットの送受信がない状態) を許可する時間を設定する。

不要な接続を早期に切断できる。

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
        idleTimeout: 1000s
```

> - [VirtualServiceとDestinationRuleのざっくりとした違い #kubernetes - Qiita](https://qiita.com/Takagi_/items/129acd03e76fce5c295b#%E5%AE%9F%E9%9A%9B%E3%81%ABhttp%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88%E3%81%AE%E3%82%BF%E3%82%A4%E3%83%A0%E3%82%A2%E3%82%A6%E3%83%88%E8%A8%AD%E5%AE%9A%E3%82%84%E3%82%A2%E3%82%A4%E3%83%89%E3%83%AB%E3%81%A8%E3%81%AA%E3%81%A3%E3%81%9F%E3%82%B3%E3%83%8D%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3%E3%82%92%E5%88%87%E6%96%AD%E3%81%95%E3%81%9B%E3%82%8B%E3%81%AB%E3%81%AF%E3%81%A9%E3%81%86%E3%81%99%E3%82%8B%E3%81%AE%E3%81%8B)

#### ▼ connectionPool.http.maxConcurrentStreams

同時に実行できる gRPC ストリーミング処理の最大数である。

双方向ストリーミング RPC は同時ストリーミングであり、サーバーストリーミング RPC やクライアントストリーミング RPC も、非同期的に実行すれば同時ストリーミングになる。

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
        maxConcurrentStreams: 1000
```

> - [Protocol options (proto) — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/core/v3/protocol.proto#envoy-v3-api-field-config-core-v3-http2protocoloptions-max-concurrent-streams)

#### ▼ connectionPool.tcp.connectTimeout

接続タイムアウト時間を設定する。

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
        connectTimeout: 30ms
```

#### ▼ connectionPool.tcp.idleTimeout

確立中の TCP 接続でアイドルタイムアウト (パケットの送受信がない状態) を許可する時間を設定する。

不要な接続を早期に切断できる。

VirtualService の `.spec.http.timeout` キーとは異なり、DestinationRule のアイドルタイムアウトは TCP 接続中に無通信状態を許可する時間である。

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
        idleTimeout: 1000s
```

#### ▼ connectionPool.tcp.tcpKeepalive

宛先との間で TCP KeepAlive を実施する。

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
        tcpKeepalive:
          probes: 9
          time: 2s
          interval: 75s
```

> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/#ConnectionPoolSettings-TCPSettings-tcp_keepalive)

#### ▼ connectionPool.tcp.maxConnections

同時に確立できる TCP 接続の最大数を設定する。

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

> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/#ConnectionPoolSettings-TCPSettings)
> - [DestinationRuleによる流量制限の選択肢と挙動 #openshift - Qiita](https://qiita.com/sonq/items/4cee6f85f91ea7dfcbbf#maxconnections)

#### ▼ outlierDetection.baseEjectionTime

異常な宛先をルーティング対象から除外する基本期間を設定する。

初回は `baseEjectionTime` の期間だけ除外する。

復帰後に再び除外条件を満たした場合、除外期間は `baseEjectionTime` と除外回数の積になる。

外れ値検出の判定間隔は、`interval` キーで設定する。

**＊実装例＊**

Gateway 系ステータスが 10 回以上連続した宛先を 10 秒間隔で判定し、ルーティング対象から除外する。

初回は、異常な Pod を 30 秒間排除する。

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
> - [Istio入門 - Speaker Deck](https://speakerdeck.com/nutslove/istioru-men?slide=25)
> - [IstioがKubernetesクラスタにもたらす4つのメリット \| Ryo Koike](https://ryo-koike.com/ja/blog/istio-advantages/#%E3%82%B5%E3%83%BC%E3%82%AD%E3%83%83%E3%83%88%E3%83%96%E3%83%AC%E3%83%BC%E3%82%AB%E3%83%BC)
> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/#OutlierDetection)

#### ▼ outlierDetection.consecutiveGatewayErrors

サーキットブレイカーを開始する外れ値 (Gateway 系ステータスの `502`、`503`、`504`) の閾値を設定する。

似た設定として、`500` 系ステータスの閾値を設定する `consecutive5xxErrors` キーがあるが、併用できる。

外れ値検出の判定間隔は、`interval` キーで設定する。

**＊実装例＊**

Gateway 系ステータスが 10 回以上連続した宛先を 10 秒間隔で判定し、ルーティング対象から除外する。

初回は、異常な Pod を 30 秒間排除する。

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
> - [Istio入門 - Speaker Deck](https://speakerdeck.com/nutslove/istioru-men?slide=25)
> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/#OutlierDetection-consecutive_gateway_errors)

#### ▼ outlierDetection.consecutive5xxErrors

サーキットブレイカーを開始する外れ値 (`500` 系ステータス) の閾値を設定する。

似た設定として、Gateway 系ステータスの連続回数の閾値を設定する `consecutiveGatewayErrors` キーがあるが、併用できる。

外れ値検出の判定間隔は、`interval` キーで設定する。

**＊実装例＊**

`500` 系ステータスが 10 回以上連続した宛先を 10 秒間隔で判定し、ルーティング対象から除外する。

初回は、異常な Pod を 30 秒間排除する。

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

> - [Istioサーキットブレーカーで備えるマイクロサービスの連鎖障害 - ZOZO TECH BLOG](https://techblog.zozo.com/entry/zozotown-istio-circuit-breaker)
> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/#OutlierDetection-consecutive_5xx_errors)

#### ▼ outlierDetection.interval

サーキットブレイカーの外れ値の計測間隔を設定する。

指定した間隔で、連続エラー数が閾値に達した宛先を判定する。

**＊実装例＊**

`500` 系ステータスが 10 回以上連続した宛先を 10 秒間隔で判定し、ルーティング対象から除外する。

初回は、異常な Pod を 30 秒間排除する。

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

> - https://ibrahimhkoyuncu.medium.com/istio-powered-resilience-advanced-circuit-breaking-and-chaos-engineering-for-microservices-c3aefcb8d9a9
> - [Istio入門 - Speaker Deck](https://speakerdeck.com/nutslove/istioru-men?slide=25)
> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/#OutlierDetection)

#### ▼ outlierDetection.maxEjectionPercent

Pod 全体のうちで排除できる Pod の最大割合 (%) を設定する。

**＊実装例＊**

すべての Pod を排除する。

代わりに istio-proxy から返却された `503` ステータス (response_flag は `UH`) のレスポンスに応じて、送信元マイクロサービスでフォールバックを実行する。

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
      maxEjectionPercent: 100
```

> - https://opstree.com/blog/2024/04/16/istio-circuit-breaker-when-failure-is-a-better-option/

#### ▼ outlierDetection.minHealthPercent

宛先サブセットの正常率が指定値を下回った場合に、外れ値検出を無効化するための最低正常率を設定する。

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
> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/#OutlierDetection)

#### ▼ loadBalancer

Pod へのルーティング時に使用する負荷分散方式を設定する。

**＊実装例＊**

複数のゾーンの Pod に対して、ラウンドロビンでルーティングする。

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

> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/#LoadBalancerSettings)

**＊実装例＊**

指定したゾーンの Pod に対して、指定した重みづけでルーティングする。

リージョン名やゾーン名は、Pod の `topology.kubernetes.io/region` キーや `topology.kubernetes.io/zone` キーの値を設定する。

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

> - [Istio / Locality weighted distribution](https://istio.io/latest/docs/tasks/traffic-management/locality-load-balancing/distribute/)
> - [Istio / Locality Load Balancing](https://istio.io/latest/docs/tasks/traffic-management/locality-load-balancing/)

**＊実装例＊**

複数のゾーンの Pod に対して、最小リクエスト数でルーティングする。

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    loadBalancer:
      # 最小リクエスト数
      simple: LEAST_REQUEST
```

#### ▼ portLevelSettings.loadBalancer

Service の待ち受けポート番号ごとに、負荷分散方式を設定する。

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

> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/#TrafficPolicy-PortTrafficPolicy)

#### ▼ portLevelSettings.port

トラフィックポリシーの適用対象とする Service の待ち受けポート番号を設定する。

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

> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/#TrafficPolicy-PortTrafficPolicy)

#### ▼ tls.mode

DestinationRule と宛先 (特にサービスメッシュ外にある対象) の間の暗号化方式を設定する。

Gateway にも似た設定があるが、あちらは送信元と Gateway の間の暗号化方式を設定する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    tls:
      mode: DISABLE # 非 TLS
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
      mode: MUTUAL # 自己管理下の相互 TLS 認証
```

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    tls:
      mode: ISTIO_MUTUAL # Istio 管理下の相互 TLS 認証
```

> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/#ClientTLSSettings-TLSmode)

#### ▼ tls.clientCertificate

自己管理下の相互 TLS 認証 (`MUTUAL`) の場合、使用するクライアント証明書のパスを設定する。

Istio 管理下の相互 TLS 認証 (`ISTIO_MUTUAL`) の場合、Istiod コントロールプレーンは作成した SSL 署名書を自動的に割り当てるので、設定不要である。

Namespace 全体に同じ設定を適用する場合、PeerAuthentication を使用する。

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    tls:
      mode: MUTUAL
      clientCertificate: /etc/certs/client-cert.pem
```

> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/#ClientTLSSettings)

#### ▼ loadBalancer.warmup.aggression

スロースタート方式 (通過させるリクエストの数を少しずつ増加させる) で、増加率を設定する。

`1` の場合は、直線的に増加する。

リクエスト数の非常に多い高トラフィックなシステムで、起動直後の性能が悪いアプリケーション (例：キャッシュに依存、接続プールの作成が必要、ウォームアップが必要な JVM 言語製アプリケーション) にいきなり高負荷をかけないようにできる。

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    loadBalancer:
      warmup:
        duration: 30s
        aggression: 1
```

> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/#LoadBalancerSettings-warmup)
> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/#WarmupConfiguration)
> - https://stackoverflow.com/a/75942527/12771072
> - https://discuss.istio.io/t/need-help-setting-up-slow-start-in-kubernetes/16692
> - [Slow start mode — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/slow_start)

#### ▼ loadBalancer.warmup.duration

スロースタート方式 (通過させるリクエストの数を少しずつ増加させる) で、スロースタートの期間を設定する。

リクエスト数の非常に多い高トラフィックなシステムで、起動直後の性能が悪いアプリケーション (例：キャッシュに依存、接続プールの作成が必要、ウォームアップが必要な JVM 言語製アプリケーション) にいきなり高負荷をかけないようにできる。

```yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: foo-destination-rule
spec:
  trafficPolicy:
    loadBalancer:
      warmup:
        duration: 30s
        aggression: 1
```

> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/#LoadBalancerSettings-warmup)
> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/#WarmupConfiguration)
> - https://discuss.istio.io/t/need-help-setting-up-slow-start-in-kubernetes/16692
> - [Slow start mode — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/slow_start)

<br>

## 04. EnvoyFilter

### .spec.configPatches.applyTo

パッチの適用対象とする Envoy の処理 (例：LISTENER、CLUSTER、HTTP_FILTER) を設定する。

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

> - [Istio / Envoy Filter](https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ApplyTo)

**＊実装例＊**

HTTP フィルターの設定値を変更する。

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  configPatches:
    - applyTo: HTTP_FILTER
```

> - [Istio / Envoy Filter](https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ApplyTo)

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

> - [Istio / Envoy Filter](https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ApplyTo)

<br>

### .spec.configPatches.match

#### ▼ match とは

フィルターの設定値を変更する場合、その実行条件を設定する。

条件に合致する設定値があった場合、`.spec.configPatches.patch` キーで設定した内容に変更する。

#### ▼ cluster

指定したクラスターが存在する場合、フィルターの設定値を変更する。

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

指定したリスナーが存在する場合、フィルターの設定値を変更する。

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

> - [Istio / Envoy Filter](https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ListenerMatch)

#### ▼ context

指定したワークロードタイプ (例：istio-ingressgateway 内の istio-proxy、istio-proxy コンテナの istio-proxy) の場合、フィルターの設定値を変更する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  configPatches:
    - match:
        # istio-ingressgateway と istio-proxy コンテナの両方に適用する
        context: ANY
```

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  configPatches:
    - match:
        # istio-proxy コンテナの Ingress リスナー後のフィルターに適用する
        context: SIDECAR_INBOUND
```

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  configPatches:
    - match:
        # istio-ingressgateway 内の istio-proxy コンテナに適用する
        context: GATEWAY
```

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  configPatches:
    - match:
        # istio-proxy コンテナのアウトバウンド通信 (Egress リスナー後のフィルター)
        context: SIDECAR_OUTBOUND
```

> - [Istio / Envoy Filter](https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-PatchContext)
> - [Istio / Envoy Filter](https://istio.io/latest/docs/reference/config/networking/envoy-filter)
> - https://niravshah2705.medium.com/redirect-from-istio-e2553afc4a29

<br>

### .spec.configPatches.patch

#### ▼ patch とは

`.spec.configPatches.match` キーに設定した設定値があった場合、フィルターの設定値の変更内容を設定する。

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

> - [Istio / Envoy Filter](https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch-Operation)

**＊実装例＊**

`.spec.configPatches.match` キーに合致したフィルターの直前に挿入する。

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

> - [Istio / Envoy Filter](https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch-Operation)

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

> - [Istio / Envoy Filter](https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch-Operation)

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

> - [Istio / Envoy Filter](https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch-Operation)

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

> - [Istio / Envoy Filter](https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-Patch-FilterClass)

<br>

### .spec.priority

複数の EnvoyFilter が同じコンポーネントに適用される場合、パッチの適用順を設定する。

数字の昇順に適用し、同じ値の場合は作成時刻、完全修飾リソース名の順で決まる。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: foo-envoy-filter
spec:
  priority: -1
```

> - [Istio / Envoy Filter](https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter)

<br>

## 04-02. EnvoyFilter のレートリミット

### Istio のレートリミットとは

執筆時点で、Istio のトラフィック管理系リソースにはレートリミットの設定がない。

これは EnvoyFilter で設定する必要がある。

複数の istio-proxy にレートリミットを設定するグローバルレートリミットと、特定のものに設定するローカルレートリミットがある。

<br>
### ローカルリミット

#### ▼ 任意のリクエストに対して

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
        # istio-proxy コンテナのインバウンド通信の処理に適用する
        context: SIDECAR_INBOUND
        # Listener にレートリミットを設定する
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
              # 60 秒ごとに 4 トークンを補充し、最大 4 トークンを保持する
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
        # istio-proxy コンテナのインバウンド通信の処理に適用する
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
        # istio-proxy コンテナのインバウンド通信の処理に適用する
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
                # 60 秒ごとに 4 トークンを補充し、最大 4 トークンを保持する
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

> - [Istio / Enabling Rate Limits using Envoy](https://istio.io/latest/docs/tasks/policy-enforcement/rate-limit/#local-rate-limit)
> - [Istio Rate Limiting: Configure a Local Rate Limiter in Envoy \| Learn Cloud Native](https://learncloudnative.com/blog/2022-09-08-ratelimit-istio)

#### ▼ JWT の同じ `sub` に対して

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: ratelimit-by-jwt-sub
  namespace: default
spec:
  workloadSelector:
    labels:
      app: my-app
  configPatches:
    - applyTo: HTTP_FILTER
      match:
        context: SIDECAR_INBOUND
        listener:
          filterChain:
            filter:
              name: envoy.filters.network.http_connection_manager
      patch:
        operation: INSERT_BEFORE
        value:
          name: envoy.filters.http.ratelimit
          typed_config:
            "@type": type.googleapis.com/envoy.extensions.filters.http.ratelimit.v3.RateLimit
            domain: mydomain
            rate_limit_service:
              grpc_service:
                envoy_grpc:
                  cluster_name: rate_limit_cluster
                timeout: 0.25s
            rate_limit_config:
              rate_limit_descriptor_sets:
                descriptors:
                  - entries:
                      - key: "identified_user_daily_limit"
                        value: "%DYNAMIC_METADATA(envoy.filters.http.jwt_authn.jwt_payload.sub)%"
```

### グローバルレートリミット

#### ▼ グローバルレートリミットとは

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
      # Istio Ingress Gateway に合致させる
      istio: ingressgateway
  configPatches:
    - applyTo: HTTP_FILTER
      match:
        # Gateway の処理に適用する
        context: GATEWAY
        # Listener にレートリミットを設定する
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
            # true：istio-proxy コンテナが失敗のレスポンスを返信する
            # false：マイクロサービスが失敗のレスポンスを返信する
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
        # Gateway の処理に適用する
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

> - [Istio / Enabling Rate Limits using Envoy](https://istio.io/latest/docs/tasks/policy-enforcement/rate-limit/#global-rate-limit)

<br>

## 04-03. EnvoyFilter の KeepAlive の設定

istio-ingressgateway 内の istio-proxy で、KeepAlive を実行できるようにする。

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
        # istio-ingressgateway のフィルターの設定値を変更する
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
              # KeepAlive を有効化する
              int_value: 1
              state: STATE_PREBIND
            - level: 6
              name: 4
              # 15 秒間の無通信が発生したら、KeepAlive を実行する
              int_value: 15
              state: STATE_PREBIND
            - level: 6
              name: 5
              # 15 秒間隔で、KeepAlive を実行する
              int_value: 15
              state: STATE_PREBIND
            - level: 6
              name: 6
              # 10 回応答がなければ終了する
              int_value: 3
              state: STATE_PREBIND
```

> - [Istio で Downstream への TCP keepalive を送る方法](https://blog.1q77.com/2020/12/istio-downstream-tcpkeepalive/)

<br>

## 04-04. EnvoyFilter 以外のカスタマイズ方法

### VirtualService、DestinationRule の定義

VirtualService と DestinationRule の設定値は、istio-proxy に適用される。

> - [Istio の timeout, retry, circuit breaking, etc \| sreake.com \| 株式会社スリーシェイク](https://sreake.com/blog/istio/)
> - [Istio / Virtual Service](https://istio.io/latest/docs/reference/config/networking/virtual-service/)
> - [Istio / Destination Rule](https://istio.io/latest/docs/reference/config/networking/destination-rule/)

<br>

### annotations の定義

Deployment や Pod の `.metadata.annotations` キーにて、istio-proxy ごとのオプション値を設定する。

> - [Istio / Resource Annotations](https://istio.io/latest/docs/reference/config/annotations/)

<br>

### istio-proxy の定義

Deployment や Pod で istio-proxy を定義することにより設定を変更できる。

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
        # istio-proxy コンテナの設定を変更する。
        - name: istio-proxy
          lifecycle:
            # istio-proxy コンテナ開始直後の処理
            postStart:
              exec:
                # istio-proxy コンテナが、必ずマイクロサービスよりも先に起動する。
                # pilot-agent の起動完了を待機する。
                command:
                  - |
                    pilot-agent wait
            # istio-proxy コンテナ終了直前の処理
            preStop:
              exec:
                # istio-proxy コンテナが、必ずマイクロサービスよりも後に終了する。
                # envoy プロセスと pilot-agent プロセスの終了を待機する。
                command:
                  - "/bin/bash"
                  - "-c"
                  - |
                    sleep 5
                    while [ $(netstat -plnt | grep tcp | egrep -v 'envoy|pilot-agent' | wc -l) -ne 0 ]; do sleep 1; done
      # マイクロサービスと istio-proxy コンテナの両方が終了するのを待つ
      terminationGracePeriodSeconds: 45
```

> - [Istio / Installing the Sidecar](https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/#customizing-injection)

<br>

## 05. Gateway

### .spec.selector

#### ▼ selector とは

Istio Ingress Gateway/EgressGateway に付与された `.metadata.labels` キーを設定する。

デフォルトでは、Istio Ingress Gateway には `istio` ラベルがあり、値は `ingressgateway` である。

また、Istio Egress Gateway には `istio` ラベルがあり、値は `egressgateway` である。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: Gateway
metadata:
  name: foo-ingress
spec:
  selector:
    istio: ingressgateway
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app.kubernetes.io/name: istio-ingressgateway
    istio: ingressgateway
```

> - [Istio / Gateway](https://istio.io/latest/docs/reference/config/networking/gateway/#Gateway)

<br>

### .spec.servers.port

#### ▼ name

Istio Ingress Gateway/EgressGateway の Pod で待ち受けるポート名を設定する。

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

> - [Istio / Gateway](https://istio.io/latest/docs/reference/config/networking/gateway/#Port)

#### ▼ number

Istio Ingress Gateway/EgressGateway の Pod で待ち受けるポート番号を設定する。

Ingress Nginx Controller であれば、Nginx Controller Pod で待ち受けるコンテナポート番号に相当する。

IngressGateway の内部的な Service のタイプで NodePort Service を選んだ場合、Node の宛先ポート番号に合わせる。

一方で、LoadBalancer Service を選んだ場合、LoadBalancer がルーティングできる宛先ポート番号とする。

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

> - [Istio / Gateway](https://istio.io/latest/docs/reference/config/networking/gateway/#Port)

#### ▼ protocol

Istio Ingress Gateway/EgressGateway の Pod で受信するプロトコルを設定する。

ドキュメントは更新されていないが、執筆時点 (2025/03/10) で以下のプロトコルに対応している。

- TCP
- UDP
- gRPC
- gRPC-Web
- HTTP
- HTTP_PROXY
- HTTP2
- HTTPS
- TLS
- Mongo
- Redis
- MySQL

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

```yaml
apiVersion: networking.istio.io/v1
kind: Gateway
metadata:
  name: foo-egress
spec:
  servers:
    - port:
        protocol: MySQL
```

> - [Istio / Gateway](https://istio.io/latest/docs/reference/config/networking/gateway/#Port)
> - [istio/pkg/config/protocol/instance.go at master · istio/istio · GitHub](https://github.com/istio/istio/blob/master/pkg/config/protocol/instance.go#L68-L94)

#### ▼ targetPort

Istio Ingress Gateway/EgressGateway の Pod の宛先ポート番号を設定する。

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

> - [Istio / Gateway](https://istio.io/latest/docs/reference/config/networking/gateway/#Port)

<br>

### .spec.servers.hosts

Gateway でフィルタリングするインバウンド通信の `Host` ヘッダー名を設定する。

Istio Ingress Gateway では、複数のマイクロサービスで API を公開している場合、ワイルドカード (`*`) を使用してすべてのドメインを許可することになる。

また、Istio Egress Gateway でも任意の API への接続を許可するために、同様にワイルドカード (`*`) を使用することになる。

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

`.spec.servers.tls.mode` キーで相互 TLS 認証を設定している場合、クライアント証明書のペアになる CA 証明書が必要である。

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

> - [Istio / Gateway](https://istio.io/latest/docs/reference/config/networking/gateway/#ServerTLSSettings)

<br>

### .spec.servers.tls.credentialName

CA を含むサーバー証明書を保持する Secret を設定する。

サーバー証明書のファイルを指定する場合は、`.spec.servers[*].tls.serverCertificate` キーを設定する。

Secret を更新した場合、Pod を再起動せずに、Pod に Secret を再マウントできる。

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

#### ▼ mode とは

送信元と Gateway の間の暗号化方式を設定する。

> - [Istio / Gateway](https://istio.io/latest/docs/reference/config/networking/gateway/#ServerTLSSettings-TLSmode)

#### ▼ SIMPLE

送信元と Gateway の通信間で通常の HTTPS を実施する。

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

送信元と Gateway の間で、Istio の作成していない証明書による相互 TLS 認証を実施する。

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

送信元と Gateway の間で、Istio の作成した証明書による相互 TLS 認証を実施する。

istio-proxy と Istio Egress Gateway の間で相互 TLS 認証を実施する場合、これを使用する。

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

Gateway で HTTPS リクエストを受信した場合、サーバー証明書を検証をせずに、HTTPS をそのまま通過させる。

つまり、Gateway の宛先にサーバー証明書を設定する必要がある。

`PASSTHROUGH` 以外のモードでは、Gateway で SSL を検証し、場合にとっては SSL 終端となる。

注意点として、Gateway は受信した HTTPS を TCP プロトコルとして処理するため、`L7` ヘッダーにある HTTP ヘッダーやパスを使用してトラフィックを制御できない。

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

> - [GKE クラスタで Cloud Service Mesh Egress ゲートウェイを使用する: チュートリアル \| Google Cloud Documentation](https://cloud.google.com/service-mesh/docs/security/egress-gateway-gke-tutorial?hl=ja#pass-through_of_httpstls_connections)
> - [Run the Istio ingress gateway with TLS termination and TLS passthrough – Daniel's Tech Blog](https://www.danielstechblog.io/run-the-istio-ingress-gateway-with-tls-termination-and-tls-passthrough/amp/)
> - [Istio / Ingress Gateway without TLS Termination](https://istio.io/latest/docs/tasks/traffic-management/ingress/ingress-sni-passthrough/#configure-an-ingress-gateway)

<br>

### .spec.servers.tls.privateKey

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

> - [Istio / Gateway](https://istio.io/latest/docs/reference/config/networking/gateway/#ServerTLSSettings)

<br>

### .spec.servers.tls.serverCertificate

サーバー証明書のファイルを設定する。

`.spec.servers.tls.mode` キーで相互 TLS 認証を設定している場合、クライアント証明書のペアになるサーバー証明書が必要である。

サーバー証明書を保持する Secret を指定する場合は、`.spec.servers[*].tls.credentialName` キーを設定する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: Gateway
metadata:
  name: foo-ingress
spec:
  servers:
    - tls:
        serverCertificate: /etc/certs/server.pem
```

> - [Istio / Gateway](https://istio.io/latest/docs/reference/config/networking/gateway/#ServerTLSSettings)

<br>

## 06. PeerAuthentication

### .spec.selector

指定した Namespace の特定の Pod で相互 TLS 認証を有効化する

**＊実装例＊**

```yaml
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  # foo 内の全ての istio-proxy に PeerAuthentication を適用する
  namespace: foo
  name: peer-authentication
spec:
  selector:
    matchLabels:
      app: foo
  mtls:
    mode: STRICT # 相互 TLS 認証を使用する。
```

<br>

### .spec.mtls

#### ▼ mtls

特定の Namespace 内のすべての istio-proxy 間通信時、相互 TLS 認証を有効化するか否かを設定する。

特定の Pod にのみ受信時の相互 TLS 認証の条件を適用したい場合、PeerAuthentication の `.spec.selector.matchLabels` キーで対象を指定する。

> - [【Istio】DestinationRuleで設定した相互TLSをPeerAuthenticationで上書きする - (O+P)ut](https://www.mtioutput.com/entry/istio-mtls-onoff)
> - [Kubernetes certificate based mutual auth with different CAs \| Hemant Kumar](https://hemantkumar.net/kubernetes-mutual-auth-with-diffferent-cas.html)

#### ▼ mode

相互 TLS 認証のタイプを設定する。

| 項目         | 説明                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| `UNSET`      | 記入中...                                                                                                    |
| `DISABLE`    | 相互 TLS 認証を使用しない。                                                                                  |
| `PERMISSIVE` | istio-proxy は相互 TLS 認証を使用する通信と平文通信の両方を許可する。 |
| `STRICT`     | istio-proxy は相互 TLS 認証を使用する通信のみを許可し、平文通信やサーバー認証のみの TLS 通信を拒否する。 |

**＊実装例＊**

```yaml
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  # foo 内の全ての istio-proxy に PeerAuthentication を適用する
  namespace: foo
  name: peer-authentication
spec:
  mtls:
    mode: STRICT # 相互 TLS 認証を使用する。
```

相互 TLS 認証を使用する場合はサーバー証明書が必要になり、サーバー証明書がないと以下のようなエラーになってしまう。

```bash
transport failure reason: TLS error: *****:SSL routines:OPENSSL_internal:SSLV3_ALERT_CERTIFICATE_EXPIRED
```

> - [Istio / PeerAuthentication](https://istio.io/latest/docs/reference/config/security/peer_authentication/#PeerAuthentication-MutualTLS-Mode)

<br>

## 07. ProxyConfig

### concurrency

サービスメッシュ全体、特定 Namespace、特定ワークロードの istio-proxy にて、ワーカースレッド数を設定する。

`.meshConfig.defaultConfig` キーにデフォルト値を設定しておき、ProxyConfig で Namespace やマイクロサービス Pod ごとに上書きするのがよい。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ProxyConfig
metadata:
  name: foo-proxyconfig
spec:
  concurrency: 0
```

> - [Istio / ProxyConfig](https://istio.io/latest/docs/reference/config/networking/proxy-config/#ProxyConfig)
> - [Difference between envoy.ProxyConfig and meshconfig.ProxyConfig · istio/istio · Discussion #48596 · GitHub](https://github.com/istio/istio/discussions/48596#discussioncomment-7993485)

<br>

### environmentVariables

サービスメッシュ全体、特定 Namespace、特定ワークロードの istio-proxy にて、環境変数を設定する。

`.meshConfig.defaultConfig` キーにデフォルト値を設定しておき、ProxyConfig で Namespace やマイクロサービス Pod ごとに上書きするのがよい。

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ProxyConfig
metadata:
  name: foo-proxyconfig
spec:
  environmentVariables:
    # 値をダブルクオートで囲う
    ISTIO_META_DNS_CAPTURE: "false"
```

> - [Istio / ProxyConfig](https://istio.io/latest/docs/reference/config/networking/proxy-config/#ProxyConfig)
> - [Difference between envoy.ProxyConfig and meshconfig.ProxyConfig · istio/istio · Discussion #48596 · GitHub](https://github.com/istio/istio/discussions/48596#discussioncomment-7993485)

<br>

## 08. RequestAuthentication

### .metadata.namespace

RequestAuthentication の適用範囲の仕組みは、AuthorizationPolicy と同じである。

作成した Namespace に対して適用され、MeshConfig の `rootNamespace` (デフォルトは `istio-system`) に置いた場合はすべての Namespace のデフォルト設定になる。

もし、適用範囲を小さくしたい場合は、`.spec.selector` キーを使用する。

Istio コントロールプレーンのログから RequestAuthentication をデバッグできる。

```bash
$ kubectl logs <IstiodコントロールプレーンのPod> -n istio-system
```

<br>

### .spec.jwtRules

#### ▼ jwtRules とは

Bearer 認証で使用する JWT トークンの発行元 ID プロバイダーを設定する。

JWT トークンが失効していたり、不正な場合、認証処理を失敗として `401` レスポンスを返信する。

注意点として、そもそもリクエストに JWT が含まれていない場合には認証処理をスキップできてしまう。

代わりに、JWT が含まれていないリクエストを AuthorizationPolicy による認可処理失敗 (`403` ステータス) として扱う必要がある。

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt
spec:
  jwtRules:
    # JWT トークンの発行元 ID プロバイダーの識別子を設定する
    # ブラウザから接続する
    - issuer: https://foo-issuer.com
      # ID プロバイダーの JWKs エンドポイントを設定し、アクセストークン署名検証のための公開鍵を取得する
      # ブラウザから、または API に直接接続する
      jwksUri: https://example.com/.well-known/jwks.json
      # 既存の JWT を再利用し、宛先マイクロサービスにそのまま転送する
      forwardOriginalToken: true
      # Authorization ヘッダーを指定する
      fromHeaders:
        - name: Authorization
          prefix: "Bearer "
---
# RequestAuthentication で設定した Authorization ヘッダーがない場合には認可エラーとする
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: foo-authorization-policy
spec:
  # 許可する
  action: ALLOW
  rules:
    - when:
        - key: request.auth.claims[iss]
          # JWT トークンがある場合にのみ許可する
          values: ["https://foo-issuer.com"]
```

> - [Istio / RequestAuthentication](https://istio.io/latest/docs/reference/config/security/request_authentication/)
> - [Istio / Security](https://istio.io/latest/docs/concepts/security/#request-authentication)
> - [Kubernetes入門(30) Istioを使ったサービスメッシュ構築 - 特徴3：Security \| TECH+（テックプラス）](https://news.mynavi.jp/techplus/article/kubernetes-30/)
> - [403 instead of 401 when there's no JWT · Issue #26559 · istio/istio · GitHub](https://github.com/istio/istio/issues/26559#issuecomment-675682440)

#### ▼ issuer

JWT トークンの発行元 ID プロバイダーの識別子を設定する。

JWT トークンの `iss` クレームと照合する発行者識別子であり、ID プロバイダーのドキュメントで値を確認する。

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt
spec:
  jwtRules:
    - issuer: https://foo-issuer.com
```

> - [Istio / RequestAuthentication](https://istio.io/latest/docs/reference/config/security/request_authentication/#JWTRule-issuer)

#### ▼ jwksUri

ID プロバイダーの JWKs エンドポイントを設定し、アクセストークン署名検証のための公開鍵を取得する

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt
spec:
  jwtRules:
    - jwksUri: https://example.com/.well-known/jwks.json
```

> - [Istio / RequestAuthentication](https://istio.io/latest/docs/reference/config/security/request_authentication/#JWTRule-jwks_uri)

#### ▼ forwardOriginalToken

既存の JWT を再利用し、宛先マイクロサービスにそのまま伝播するフラグを設定する。

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt
spec:
  jwtRules:
    - forwardOriginalToken: true
```

外部 API (例：Google APIs) によっては、不要な JWT がリクエストヘッダーにあると、`401` レスポンスを返信する。

そのため、外部 API に接続するマイクロサービスの RequestAuthentication では、`forwardOriginalToken` を `false` とし、JWT を削除しておく。

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt
spec:
  jwtRules:
    - forwardOriginalToken: false
```

> - [Istio / RequestAuthentication](https://istio.io/latest/docs/reference/config/security/request_authentication/#JWTRule-forward_original_token)

#### ▼ fromCookies

`Cookie` ヘッダーの指定したキー名からアクセストークンを取得する。

`Cookie` ヘッダーを使用して認証アーティファクトを運搬する場合 (例：フロントエンドアプリケーションが CSR や SSR) に役立つ。

大文字 (`.spec.jwtRules.fromCookies` キー) ではないことに注意する。

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt
spec:
  jwtRules:
    - fromCookies:
        # Cookie ヘッダーの中でアクセストークンが設定されたキーを指定する
        - <アクセストークンキー>
```

> - [Istio / RequestAuthentication](https://istio.io/latest/docs/reference/config/security/request_authentication/#JWTRule-from_cookies)

#### ▼ fromHeaders

指定したヘッダーからアクセストークンを取得する。

`Authorization` ヘッダーを使用して認証アーティファクトを運搬する場合 (例：フロントエンドアプリケーションが CSR) に役立つ。

```yaml
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata:
  name: foo-request-authentication-jwt
spec:
  jwtRules:
    - fromHeaders:
        # Authorization ヘッダーを指定する
        - name: Authorization
          prefix: "Bearer "
```

> - [Istio / RequestAuthentication](https://istio.io/latest/docs/reference/config/security/request_authentication/#JWTRule-from_headers)
> - [Istio / RequestAuthentication](https://istio.io/latest/docs/reference/config/security/request_authentication/#JWTHeader)

#### ▼ outputPayloadToHeader

検証済み JWT ペイロードを伝播するための新しいヘッダー名を設定する。

検証済み JWT ペイロードを新しいヘッダーに割り当て、宛先マイクロサービスに伝播する。

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

JWT による Bearer 認証を適用するワークロードのラベルを設定する。

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

> - [Istio / RequestAuthentication](https://istio.io/latest/docs/reference/config/security/request_authentication/)
> - [Kubernetes入門(30) Istioを使ったサービスメッシュ構築 - 特徴3：Security \| TECH+（テックプラス）](https://news.mynavi.jp/techplus/article/kubernetes-30/)

<br>

<br>

## 09. ServiceEntry

### .spec.addresses

ServiceEntry で受け入れる仮想の宛先 IP アドレスを設定する。

宛先コンポーネントの実際の固定 IP アドレスを設定する場合は、`.spec.endpoints` キーを使用する。

`L4` プロトコル (TCPL など) では、リクエストに Host ヘッダーがない。

これらのプロトコルでは、`.spec.hosts` キーの値を無視し、IP アドレスにリクエストをルーティングする。

なお、`.spec.hosts` キーは必須であり省略できないため、便宜上ではあるが何らかの名前をつけておく。

送信側の VirtualService の `destination` では、Host ヘッダーに "." をつけないとエラーになるため、受信側の ServiceEntry も合わせておく (例：`tcp.smtp`) とよい。

```yaml
apiVersion: networking.istio.io/v1
kind: ServiceEntry
metadata:
  name: foo-mysql
spec:
  exportTo:
    - "*"
  hosts:
    # L4 プロトコルでは、この設定は実際には使われない
    # VirtualService では "." をつけないとエラーになるため、ServiceEntry も合わせておく
    - tcp
  addresses:
    # L4 プロトコルでは、この設定でルーティングする
    - 127.0.0.1/32
  location: MESH_EXTERNAL
  ports:
    - number: 587
      name: tcp
      protocol: TCP
```

`L7` プロトコル (HTTP、HTTPS など) では、リクエストに Host ヘッダーがある。

送信側の VirtualService の `.spec.http[*].route[*].destination` では、Host ヘッダーに "." をつけないとエラーになるため、受信側の ServiceEntry も合わせておく (例：`tcp.smtp`) とよい。

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
  # 宛先のドメイン名を DNS で名前解決する
  resolution: DNS
```

> - [サービスメッシュを実現するIstioをEKS上で動かす - その3 EKSでRDSなど外部サービスと接続してみる \| リクルート テックブログ](https://techblog.recruit.co.jp/article-605/)
> - [Istio / Service Entry](https://istio.io/latest/docs/reference/config/networking/service-entry/#ServiceEntry-addresses)

<br>

### .spec.exportTo

#### ▼ exportTo とは

ServiceEntry の設定を公開する Namespace を設定する。

ServiceEntry と通信元の istio-proxy が異なる Namespace にある場合、通信元の Namespace に設定を公開する。

`*` ではすべての Namespace に公開し、`.` では同じ Namespace 内に公開する。

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

#### ▼ hosts とは

コンフィグストレージに登録する宛先のドメイン名を設定する。

部分的にワイルドカード (`*`) を使用できるが、すべてのドメインを許可 (ワイルドカードのみ) できない。

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

> - [Istio / Egress using Wildcard Hosts](https://istio.io/latest/docs/tasks/traffic-management/egress/wildcard-egress-hosts/)

<br>

### .spec.location

#### ▼ location とは

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

> - [Istio / Service Entry](https://istio.io/latest/docs/reference/config/networking/service-entry/#ServiceEntry-Location)

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

> - [Istio / Service Entry](https://istio.io/latest/docs/reference/config/networking/service-entry/#ServiceEntry-Location)

<br>

### .spec.ports

#### ▼ ports とは

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

#### ▼ resolution とは

コンフィグストレージに登録する宛先の IP アドレスの設定する。

#### ▼ DNS

DNS サーバーから返信された IP アドレスを許可する。

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

> - [Istio / Egress Gateways](https://istio.io/latest/docs/tasks/traffic-management/egress/egress-gateway/)

#### ▼ NONE

Istio Egress Gateway は値に注意が必要である。

ServiceEntry に対するリクエストの宛先 IP アドレスは Istio Egress Gateway に書き換えられている。

そのため、DNS 解決を `NONE` にすると、Istio Egress Gateway は ServiceEntry を見つけられず、自分自身でループしてしまう。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: ServiceEntry
metadata:
  name: foo-service-entry
spec:
  resolution: NONE
```

<br>

## 10. Sidecar

### .spec.workloadSelector

適用対象の Workload を設定する。

設定しない場合、Namespace 内のすべての Pod が対象になる。

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

> - [Istio / Sidecar](https://istio.io/latest/docs/reference/config/networking/sidecar/#Sidecar)

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

> - [Istio / Sidecar](https://istio.io/latest/docs/reference/config/networking/sidecar/#IstioIngressListener)

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

> - [Istio / Sidecar](https://istio.io/latest/docs/reference/config/networking/sidecar/#IstioEgressListener)

<br>

## 11. Telemetry

### .metadata.namespace

Namespace で Telemety の対象の istio-proxy を絞れる。

MeshConfig の `rootNamespace` (デフォルトは `istio-system`) に所属させた場合、istio-proxy コンテナのあるすべての Namespace のデフォルト設定になる。

```yaml
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  # もし istio-system を指定した場合は、istio-proxy コンテナのある全ての Namespace が対象になる
  namespace: foo
```

> - [Istio / Telemetry API](https://istio.io/latest/docs/tasks/observability/telemetry/#scope-inheritance-and-overrides)

<br>

### accessLogging

#### ▼ accessLogging とは

同じ Namespace 内の istio-proxy を対象として、アクセスログの作成方法を設定する。

```yaml
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  name: access-log-provider
  # istio-proxy をインジェクションしている各 Namespace で作成する
  # もし istio-system を指定した場合は、istio-proxy コンテナのある全ての Namespace が対象になる
  namespace: foo
spec:
  selector:
    matchLabels:
      name: app
  # Envoy をアクセスログプロバイダーとして設定する
  accessLogging:
    - providers:
        - name: envoy
```

> - [Istio / Telemetry](https://istio.io/latest/docs/reference/config/telemetry/#AccessLogging)

ConfigMap で設定する場合は、以下のように設定する。

Telemetry による設定が推奨である。

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

> - [Istio / Envoy Access Logs](https://istio.io/latest/docs/tasks/observability/logs/access-log/#using-mesh-config)

<br>

### metrics

#### ▼ metrics とは

同じ Namespace 内の istio-proxy を対象として、メトリクスの作成方法を設定する。

```yaml
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  name: metrics-provider
  # istio-proxy をインジェクションしている各 Namespace で作成する
  # もし istio-system を指定した場合は、istio-proxy コンテナのある全ての Namespace が対象になる
  namespace: foo
spec:
  selector:
    matchLabels:
      name: app
  metrics:
    - providers:
        - name: prometheus
```

> - [Istio / Telemetry](https://istio.io/latest/docs/reference/config/telemetry/#Metrics)

<br>

### tracing

#### ▼ tracing とは

同じ Namespace 内の istio-proxy を対象として、スパンの作成方法を設定する。

```yaml
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  name: trace-provider
  # istio-proxy をインジェクションしている各 Namespace で作成する
  # もし istio-system を指定した場合は、istio-proxy コンテナのある全ての Namespace が対象になる
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

> - [Istio / Telemetry](https://istio.io/latest/docs/reference/config/telemetry/#Tracing)

#### ▼ customTags

スパン属性を設定する。

```yaml
apiVersion: telemetry.istio.io/v1
kind: Telemetry
metadata:
  name: trace-provider
  namespace: foo
spec:
  tracing:
    - providers:
        - name: opentelemetry
      customTags:
        # HTTP ヘッダーから設定する
        http.url.path:
          header:
            name: :path
            defaultValue: unknown
        # 独自の属性を設定する
        system.name:
          literal:
            value: foo
        # 独自の属性を設定する
        system.environment:
          literal:
            value: dev
```

<br>

## 12. VirtualService

### .spec.exportTo

#### ▼ exportTo とは

VirtualService の設定を公開する Namespace を設定する。

> - [Istio / Virtual Service](https://istio.io/latest/docs/reference/config/networking/virtual-service/#VirtualService)

#### ▼ `*` (アスタリスク)

デフォルト値である。

異なる Namespace の通信元で設定を使用する場合、`*` で全 Namespace に公開する。

通信元が同じ Namespace にある場合、`.` で同じ Namespace 内だけに公開できる。

Gateway を使用するかどうかではなく、設定を使用する通信元の Namespace に合わせて公開範囲を決める。

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
  # Istio Ingress Gateway は複数の種類の API へのリクエストを受信する
  # そのため、後続の VirtualService では、複数の種類の Host ヘッダー値を受信するため、ワイルドカードとする
  hosts:
    - "*"
```

#### ▼ `.` (ドット)

通信元が同じ Namespace にある場合、`.` で同じ Namespace 内だけに公開できる。

異なる Namespace の通信元で設定を使用する場合、`*` で全 Namespace に公開する。

Gateway を使用するかどうかではなく、設定を使用する通信元の Namespace に合わせて公開範囲を決める。

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

#### ▼ hosts とは

VirtualService の設定値を適用する `Host` ヘッダー値を設定する。

ワイルドカード (`*`) を使用してすべてのドメインを許可してもよいが、特定のマイクロサービスへのリクエストのみを扱うため、宛先マイクロサービスのホスト名に限定するとよい。

なお、`.spec.gateways` キーで `mesh` (デフォルト値) を使用する場合、ワイルドカード以外を設定しないといけない。 (例：`.spec.hosts` キーを設定しない、特定の Host ヘッダー値を設定するなど)

**＊実装例＊**

すべての Host ヘッダー値で VirtualService を適用する。

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  # 特定のマイクロサービスへのリクエストのみを扱うため、ホスト名もそれのみを許可する
  # ただし、gateways オプションがある VirtualService ではワイルドカードする
  hosts:
    - foo
```

<br>

### .spec.gateways

#### ▼ gateways とは

インバウンド通信をいずれの Gateway から受信するかを設定する。

> - [Istio / Virtual Service](https://istio.io/latest/docs/reference/config/networking/virtual-service/#VirtualService)

#### ▼ `<Namespace名>/<Gateway名>`

いずれの Gateway の条件に合致したリクエストを処理するかを設定する。

Gateway 名とその Namespace を設定する。

VirtualService と Gateway が同じ Namespace に所属する場合は、Namespace を省略できる (`.spec.export` キーとは関係ない) 。

ただ、Namespace は省略しないほうがわかりやすい。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  gateways:
    - foo-namespace/foo-gateway
  # Istio Ingress Gateway は複数の種類の API へのリクエストを受信する
  # そのため、後続の VirtualService では、複数の種類の Host ヘッダー値を受信するため、ワイルドカードとする
  hosts:
    - "*"
```

#### ▼ `<Gateway名>`

いずれの Gateway の条件に合致したリクエストを処理するかを設定する。

VirtualService を、Istio Ingress Gateway/EgressGateway に紐づける場合 (サービスメッシュ内外の通信) は `<Gateway名>` とする。

VirtualService と Gateway が同じ Namespace に所属する場合は、Namespace を省略できる (`.spec.export` キーとは関係ない) 。

ただ、Namespace は省略しないほうがわかりやすい。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-ingress-virtual-service
spec:
  gateways:
    - foo-ingressgateway
  # Istio Ingress Gateway は複数の種類の API へのリクエストを受信する
  # そのため、後続の VirtualService では、複数の種類の Host ヘッダー値を受信するため、ワイルドカードとする
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
    #  Host ヘッダー値が external.com の時に VirtualService を適用する。
    - external.com
  gateways:
    # Pod から Istio Egress Gateway の Pod への通信で使用する
    # gateway 名と両方設定する場合は、デフォルト値としての省略はできない
    - mesh
    # Istio Egress Gateway からエントリ済みシステムへの通信で使用する
    - foo/foo-egressgateway
  http:
    # external.com に対するリクエストは、Istio Egress Gateway にルーティング (リダイレクト) する
    - match:
        - gateways:
            # Pod から Istio Egress Gateway の Pod への通信で使用する
            - mesh
          port: 80
      route:
        - destination:
            host: istio-egressgateway.istio-egress.svc.cluster.local
            port:
              number: 80
    # Istio Egress Gateway に対するリクエストは、エントリ済システムにルーティングする
    - match:
        - gateways:
            # Istio Egress Gateway からエントリ済みシステムへの通信で使用する
            - foo/foo-egressgateway
          port: 80
      route:
        - destination:
            # ServiceEntry の.spec.hosts キーで指定しているホスト値を設定する
            # ただし、ServiceEntry がホストに対して名前解決できていないと、そのホスト値を設定できない
            host: external.com
            port:
              number: 80
```

> - [Istio / Egress Gateways](https://istio.io/latest/docs/tasks/traffic-management/egress/egress-gateway/#egress-gateway-for-http-traffic)

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service-egress
spec:
  hosts:
    #  Host ヘッダー値が external.com の時に VirtualService を適用する。
    - external.com
  gateways:
    # Pod から Istio Egress Gateway の Pod への通信で使用する
    - mesh
    # Istio Egress Gateway からエントリ済みシステムへの通信で使用する
    - foo/foo-egressgateway
  tls:
    # external.com に対するリクエストは、Istio Egress Gateway にルーティング (リダイレクト) する
    - match:
        - gateways:
            # Pod から Istio Egress Gateway の Pod への通信で使用する
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
    # Istio Egress Gateway に対するリクエストは、エントリ済システムにルーティングする
    - match:
        - gateways:
            # Istio Egress Gateway からエントリ済みシステムへの通信で使用する
            - foo/foo-egressgateway
          port: 443
      route:
        - destination:
            # ServiceEntry の.spec.hosts キーで指定しているホスト値を設定する
            # ただし、ServiceEntry がホストに対して名前解決できていないと、そのホスト値を設定できない
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
    # アプリは DB の FQDN を指定する
    # VirtualSErvice ではこれを指定する
    - <DBクラスター名>.cluster-<id>.ap-northeast-1.rds.amazonaws.com
  gateways:
    - mesh
    - foo/foo-egressgateway
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
            # ServiceEntry にそのままの Host ヘッダーでフォワーディングする
            host: <DBクラスター名>.cluster-<id>.ap-northeast-1.rds.amazonaws.com
            port:
              number: 3306
```

> - [Using Istio to MITM our users’ traffic \| Steven Reitsma](https://reitsma.io/blog/using-istio-to-mitm-our-users-traffic)
> - [Istio / Consuming External TCP Services](https://istio.io/latest/blog/2018/egress-tcp/)

#### ▼ mesh

VirtualService を、Pod 間通信で使用する場合は `mesh` (デフォルト値) とする。

Host ヘッダーに `*` (ワイルドカード) を使用できず、特定の Host ヘッダーのみを許可する必要がある。

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
    # ワイルドカードを指定できず、特定の Host ヘッダーを許可する必要がある
    - account-app
```

<br>

### .spec.http

HTTP/1.1、HTTP/2 (例：gRPC、GraphQL など) のプロトコルによる通信を DestinationRule に紐づく Pod へルーティングする。

`.spec.tcp` キーや `.spec.tls` キーとは異なり、マイクロサービスが HTTP プロトコルで通信を送受信し、istio-proxy 間で相互 TLS 認証を実施する場合、これを使用する。

> - [Istio / Virtual Service](https://istio.io/latest/docs/reference/config/networking/virtual-service/#HTTPRoute)

<br>

### .spec.http.corsPolicy

#### ▼ corsPolicy とは

ブラウザではデフォルトで CORS が有効になっており、正しいリクエストが CORS を突破できるように対処する必要がある。

多くの場合、バックエンドアプリケーションで CORS に対処することが多いが、istio-proxy で対処できる。

> - [Istio / Virtual Service](https://istio.io/latest/docs/reference/config/networking/virtual-service/#CorsPolicy)

<br>

### .spec.http.fault

#### ▼ fault とは

発生させるフォールトインジェクションを設定する。

**＊実装例＊**

`503` ステータスのエラーを `100`%の確率で発生させる。

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  http:
    - fault:
        abort:
          # 発生させるエラー
          httpStatus: 503
          # エラーを発生させる確率
          percentage:
            value: 100
```

> - [Istio入門 - Speaker Deck](https://speakerdeck.com/nutslove/istioru-men?slide=19)

**＊実装例＊**

`10` 秒のレスポンスの遅延を `100`%の確率で発生させる。

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  http:
    - fault:
        delay:
          # レスポンスの遅延時間
          fixedDelay: 10s
          # 遅延レスポンスを発生させる割合
          percentage:
            value: 100
```

> - [ABEMA における GKE スケール戦略と Anthos Service Mesh 活用事例 Deep Dive - Speaker Deck](https://speakerdeck.com/nagapad/abema-niokeru-gke-scale-zhan-lue-to-anthos-service-mesh-huo-yong-shi-li-deep-dive?slide=124)

<br>

### .spec.http.match

#### ▼ match とは

受信した通信のうち、ルールを適用するもののメッセージ構造を設定する。

#### ▼ <ヘッダー名>

ヘッダー名で合致条件を設定する。

**＊実装例＊**

受信した通信のうち、`x-foo` ヘッダーに `bar` が割り当てられたものだけにルールを適用する。

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
  # Istio Ingress Gateway は複数の種類の API へのリクエストを受信する
  # ただし、gateways オプションがある VirtualService ではワイルドカードする
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

> - [【Istio/Virtualservice】Headerのブラウザ情報を用いてトラフィック管理を行う - (O+P)ut](https://www.mtioutput.com/entry/oc-istio-header)

#### ▼ gateways

`.spec.gateways` キーで設定した `<Gateway名>` と `mesh` (デフォルト値) のうちで、その合致条件に使用するほうを設定する。

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
            # Pod から Istio Egress Gateway の Pod への通信で使用する
            - mesh
          port: 443
      route:
        - destination:
            host: istio-egressgateway.istio-egress.svc.cluster.local
            port:
              number: 443
    - match:
        - gateways:
            # Istio Egress Gateway からエントリ済みシステムへの通信で使用する
            - foo-ingressgateway
          port: 443
      route:
        - destination:
            # ServiceEntry の.spec.hosts キーで指定しているホスト値を設定する
            # ただし、ServiceEntry がホストに対して名前解決できていないと、そのホスト値を設定できない
            host: httpbin.org
            port:
              number: 443
```

> - [Istio / Virtual Service](https://istio.io/latest/docs/reference/config/networking/virtual-service/#HTTPMatchRequest)

#### ▼ uri

リクエストの URI で合致条件を設定する。

**＊実装例＊**

受信した通信のうち、URL の接頭辞が `/foo` のものだけにルールを適用する。

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  http:
    - match:
        - uri:
            prefix: /foo
```

> - https://istiobyexample.dev/path-based-routing/

<br>

### .spec.http.retries

#### ▼ retries とは

リトライ条件を設定する。

なお、TCP 接続には `spec.tcp[*].retries` キーのような同様の設定は存在しない。

**＊実装例＊**

Gateway 系ステータス (`502`、`503`、`504`) の場合、`attempts` の数だけリトライする。

各リトライで処理の結果が返却されるまでの処理タイムアウト時間を `perTryTimeout` で設定する。

リクエストの処理タイムアウト時間を `timeout` で、リトライ 1 回あたりの処理タイムアウト時間を `retries.perTryTimeout` で設定する。

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
      # 処理タイムアウト
      timeout: 10s
      # 初回リクエストの失敗時のリトライ
      retries:
        # 最大のリトライ回数
        # リトライ間隔は、初回リクエストやリトライの処理タイムアウト時間によって、自動的に決まる
        attempts: 3
        # リトライの処理タイムアウト時間
        perTryTimeout: 10s
        # Envoy の x-envoy-retry-on の値
        retryOn: gateway-error
```

Gateway 系ステータス (`502`、`503`、`504`) の場合、`attempts` の数だけリトライする。

リクエストの処理タイムアウト時間を `timeout` で、リトライ 1 回あたりの処理タイムアウト時間を `retries.perTryTimeout` で設定する。

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
      # 処理リクエスト
      timeout: 10s
      # 初回リクエストの失敗時のリトライ
      retries:
        # 最大のリトライ回数
        # リトライ間隔は、初回リクエストやリトライの処理タイムアウト時間によって、自動的に決まる
        attempts: 3
        # リトライの処理タイムアウト時間
        perTryTimeout: 10s
        # Envoy の x-envoy-retry-on の値
        retryOn: gateway-error
```

> - [Istio入門 - Speaker Deck](https://speakerdeck.com/nutslove/istioru-men?slide=18)
> - [Istio / Virtual Service](https://istio.io/latest/docs/reference/config/networking/virtual-service/#HTTPRetry)
> - [Router — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#x-envoy-retry-on)

#### ▼ attempt

istio-proxy のリバースプロキシに失敗した場合の最大リトライ回数を設定する。

Service へのルーティングの失敗ではないことに注意する。

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

リトライ失敗の理由を設定する。

istio-proxy は、レスポンスの `x-envoy-retry-on` ヘッダーに割り当てるため、その値を設定する。

**＊実装例＊**

デフォルトでは、リトライの条件は `connect-failure,refused-stream,unavailable` である。

`EXCLUDE_UNSAFE_503_FROM_DEFAULT_RETRY` 変数を `true` にすると、元はデフォルト値であった `503` を設定できる。

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  http:
    - retries:
        retryOn: connect-failure,refused-stream,unavailable
```

> - [Istio の timeout, retry, circuit breaking, etc \| sreake.com \| 株式会社スリーシェイク](https://sreake.com/blog/istio/)
> - [Router — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#x-envoy-retry-on)
> - [Add feature flag to disable default retry policy · Issue #50506 · istio/istio · GitHub](https://github.com/istio/istio/issues/50506#issuecomment-2230102675)

<br>

### .spec.http.route

#### ▼ destination.host

受信した通信で宛先の Service のドメイン名 (あるいは Service 名) を設定する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
spec:
  # Istio Ingress Gateway は複数の種類の API へのリクエストを受信する
  # ただし、gateways オプションがある VirtualService ではワイルドカードする
  hosts:
    - foo-service.foo-namespace.svc.cluster.local
  http:
    - route:
        - destination:
            # Service 名でも良い。
            host: foo-service.foo-namespace.svc.cluster.local
```

> - [Istio / Virtual Service](https://istio.io/latest/docs/reference/config/networking/virtual-service/#Destination)

#### ▼ destination.port

受信する通信でルーティング先のポート番号を設定する。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  # Istio Ingress Gateway は複数の種類の API へのリクエストを受信する
  # ただし、gateways オプションがある VirtualService ではワイルドカードする
  hosts:
    - foo-service.foo-namespace.svc.cluster.local
  http:
    - route:
        - destination:
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 80
```

> - [Istio / Virtual Service](https://istio.io/latest/docs/reference/config/networking/virtual-service/#Destination)

#### ▼ destination.subset

![istio_virtual-service_destination-rule_subset](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_virtual-service_destination-rule_subset.png)

VirtualService を起点とした Pod のカナリアリリースで使用する。

紐付けたい DestinationRule のサブセット名と同じ名前を設定する。

DestinationRule で受信した通信を、DestinationRule のサブセットに紐づく Pod へルーティングする。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  # Istio Ingress Gateway は複数の種類の API へのリクエストを受信する
  # ただし、gateways オプションがある VirtualService ではワイルドカードする
  hosts:
    - foo-service.foo-namespace.svc.cluster.local
  http:
    - route:
        - destination:
            # Service 名でも良い
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 80
            subset: v1 # 旧 Pod
          weight: 70
        - destination:
            # Service 名でも良い
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 80
            subset: v2 # 新 Pod
          weight: 30
```

> - [Istio / Virtual Service](https://istio.io/latest/docs/reference/config/networking/virtual-service/#Destination)
> - [Istioのトラフィック制御ならブルーグリーンデプロイメント、カナリアリリース、フォールトインジェクション、サーキットブレーカーは簡単にできる：Cloud Nativeチートシート（11） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2112/21/news009.html)

#### ▼ weight

Service の重み付けルーティングの割合を設定する。

`.spec.http[*].route[*].destination.subset` キーの値は、DestinationRule で設定した `.spec.subsets[*].name` キーに合わせる必要がある。

重み付けの偏りの割合によって、カナリアリリースや B/G デプロイメントを実現できる。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  # Istio Ingress Gateway は複数の種類の API へのリクエストを受信する
  # ただし、gateways オプションがある VirtualService ではワイルドカードする
  hosts:
    - foo-service.foo-namespace.svc.cluster.local
  http:
    - route:
        - destination:
            # Service 名でも良い
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 80
            subset: v1 # 旧 Pod
          weight: 70
        - destination:
            # Service 名でも良い
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 80
            subset: v2 # 新 Pod
          weight: 30
```

> - [Istio / Virtual Service](https://istio.io/latest/docs/reference/config/networking/virtual-service/#HTTPRouteDestination)
> - [Istio入門 - Speaker Deck](https://speakerdeck.com/nutslove/istioru-men?slide=20)

<br>

### .spec.http.timeout

#### ▼ timeout とは

istio-proxy の宛先にリクエストを送信してから返信があるまでの処理タイムアウト時間を設定する (DestinationRule は接続タイムアウト) 。

`0` 秒の場合、処理タイムアウトは無制限になる。

これは、Envoy のルートの `grpc_timeout_header_max` と `timeout` の両方に適用される。

指定した時間以内に、istio-proxy の宛先からレスポンスがなければ、istio-proxy は処理タイムアウト時間を超過したものとして処理する。

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  http:
    - route:
        - destination:
            # Service 名でも良い
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 80
            subset: v1 # 旧 Pod
          weight: 70
        - destination:
            # Service 名でも良い
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 80
            subset: v2 # 新 Pod
          weight: 30
      # 処理タイムアウト
      timeout: 40s
```

> - [Istio / Request Timeouts](https://istio.io/latest/docs/tasks/traffic-management/request-timeouts/)
> - [HTTP route components (proto) — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/route/v3/route_components.proto)
> - [VirtualServiceとDestinationRuleのざっくりとした違い #kubernetes - Qiita](https://qiita.com/Takagi_/items/129acd03e76fce5c295b#%E5%AE%9F%E9%9A%9B%E3%81%ABhttp%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88%E3%81%AE%E3%82%BF%E3%82%A4%E3%83%A0%E3%82%A2%E3%82%A6%E3%83%88%E8%A8%AD%E5%AE%9A%E3%82%84%E3%82%A2%E3%82%A4%E3%83%89%E3%83%AB%E3%81%A8%E3%81%AA%E3%81%A3%E3%81%9F%E3%82%B3%E3%83%8D%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3%E3%82%92%E5%88%87%E6%96%AD%E3%81%95%E3%81%9B%E3%82%8B%E3%81%AB%E3%81%AF%E3%81%A9%E3%81%86%E3%81%99%E3%82%8B%E3%81%AE%E3%81%8B)

<br>

### .spec.tcp

#### ▼ tcp とは

`.spec.http` キーや `.spec.tls` キーとは異なり、TCP プロトコルや独自プロトコル (例：MySQL など) による通信を DestinationRule に紐づく Pod へルーティングする。

> - [Istio / Virtual Service](https://istio.io/latest/docs/reference/config/networking/virtual-service/#TCPRoute)

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

`.spec.http` キーと同じ機能である。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  # Istio Ingress Gateway は複数の種類の API へのリクエストを受信する
  # ただし、gateways オプションがある VirtualService ではワイルドカードする
  hosts:
    - foo-service.foo-namespace.svc.cluster.local
  tcp:
    - route:
        - destination:
            # Service 名でも良い
            # foo-service
            host: foo-service.foo-namespace.svc.cluster.local
```

#### ▼ route.destination.port

`.spec.http` キーと同じ機能である。

**＊実装例＊**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: foo-virtual-service
spec:
  # Istio Ingress Gateway は複数の種類の API へのリクエストを受信する
  # ただし、gateways オプションがある VirtualService ではワイルドカードする
  hosts:
    - foo-service.foo-namespace.svc.cluster.local
  tcp:
    - route:
        - destination:
            # Service 名でも良い
            # foo-service
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 9000
```

#### ▼ route.destination.subset

`.spec.http` キーと同じ機能である。

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
            # Service 名でも良い
            # foo-service
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 9000
            subset: v1 # 旧 Pod
          weight: 70
        - destination:
            # Service 名でも良い
            # foo-service
            host: foo-service.foo-namespace.svc.cluster.local
            port:
              number: 9000
            subset: v2 # 新 Pod
          weight: 30
```

<br>

### .spec.tls

#### ▼ tls とは

`.spec.http` キーや `.spec.tcp` キーとは異なり、HTTPS プロトコルの通信を DestinationRule に紐づく Pod へルーティングする。

マイクロサービスが HTTPS プロトコルで通信を送受信し、istio-proxy が TLS を終端せずに通過させる場合、これを使用する。

他に、マイクロサービスが HTTPS リクエストを送信し、Istio Egress Gateway でこれをそのまま通過させる (`PASSTHROUGH`) 場合も必要になる。

> - [Istio / Virtual Service](https://istio.io/latest/docs/reference/config/networking/virtual-service/#TLSRoute)

#### ▼ Istio Egress Gateway の VirtualService での注意点

`.spec.tls` キーで送信する場合、Istio Egress Gateway はアプリケーションデータを復号できないため、プロトコルを TCP として扱う。

そのため、Istio Egress Gateway 上を通過する TLS は Istio のメトリクスでは TCP として処理され、また Istio Egress Gateway ではスパンを作成できない。

![istio-egressgateway_tls_passthrough](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio-egressgateway_tls_passthrough.png)

> - https://istio.io/v1.16/blog/2018/egress-monitoring-access-control/#comparison-with-https-egress-traffic-control

<br>

## 13. WorkloadEntry

Kubernetes Cluster の外にある単一の仮想サーバーをサービスメッシュ内で管理する。

DB を Kubernetes Cluster 外の仮想サーバー上で稼働させていたり、一部のマイクロサービスを仮想サーバー上で稼働させなければならない場合に役立つ。

ただし、仮想サーバー内で istio プロセスをインストールし、実行する必要がある。

```bash
# インストール
$ curl -LO https://storage.googleapis.com/istio-release/releases/1.24.2/deb/istio-sidecar.deb
$ sudo dpkg -i istio-sidecar.deb

... # 諸々の手順

# デーモンプロセスを実行
$ sudo systemctl start istio
```

> - [Istio / Introducing Workload Entries](https://istio.io/latest/blog/2020/workload-entry/)
> - [IstioのMesh内に仮想マシンを取り込む #kubernetes - Qiita](https://qiita.com/ipppppei/items/b376602ae6c325e3a55e)
> - [Istio / Virtual Machine Installation](https://istio.io/latest/docs/setup/install/virtual-machine/#start-istio-within-the-virtual-machine)
> - [Istio / Bookinfo with a Virtual Machine](https://istio.io/latest/docs/examples/virtual-machines/)

<br>

## 14. WorkloadGroup

Kubernetes Cluster の外にある複数の仮想サーバーをサービスメッシュ内で管理する。

DB を Kubernetes Cluster 外の仮想サーバー上で稼働させていたり、一部のマイクロサービスを仮想サーバー上で稼働させなければならない場合に役立つ。

ただし、仮想サーバー内で istio プロセスをインストールし、実行する必要がある。

```bash
# インストール
$ curl -LO https://storage.googleapis.com/istio-release/releases/1.24.2/deb/istio-sidecar.deb
$ sudo dpkg -i istio-sidecar.deb

... # 諸々の手順

# デーモンプロセスを実行
$ sudo systemctl start istio
```

> - [Istio / Introducing Workload Entries](https://istio.io/latest/blog/2020/workload-entry/)
> - [IstioのMesh内に仮想マシンを取り込む #kubernetes - Qiita](https://qiita.com/ipppppei/items/b376602ae6c325e3a55e)
> - [Istio / Virtual Machine Installation](https://istio.io/latest/docs/setup/install/virtual-machine/#start-istio-within-the-virtual-machine)
> - [Istio / Bookinfo with a Virtual Machine](https://istio.io/latest/docs/examples/virtual-machines/)

<br>
