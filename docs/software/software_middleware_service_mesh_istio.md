---
title: 【IT技術の知見】Istio＠サービスメッシュ系ミドルウェア
description: Istio＠サービスメッシュ系ミドルウェアの知見を記録しています。
---

# Istio＠サービスメッシュ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Istioの仕組み

### サイドカーパターン

#### ▼ Istioのサイドカーパターンとは

サイドカーパターンは、サイドカープロキシ型のサービスメッシュを実装したものである。

各PodにサイドカーとしてEnvoyを稼働させ、これが各マイクロサービスのインフラ領域の責務をに担う。

> - https://jimmysong.io/blog/beyond-istio-oss/#sidecar-management
> - https://speakerdeck.com/16yuki0702/distributed-tracing-at-openshift-meetup-tokyo20191018?slide=35
> - https://zenn.dev/riita10069/articles/service-mesh

#### ▼ サイドカーパターンの仕組み

![istio_sidecar-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_sidecar-mesh_architecture.png)

サイドカーパターンは、データプレーン、Isiodコントロールプレーン、といったコンポーネントから構成される。

サイドカープロキシを使用して、サービスメッシュを実装する。

サイドカーは、`L4` (トランスポート層) のプロトコル (例：TCP、UDPなど) と`L7` (アプリケーション層) のプロトコル (例：HTTP、HTTPSなど) を処理できる。

> - https://istio.io/latest/docs/ops/deployment/architecture/
> - https://techblog.zozo.com/entry/zozotown-istio-production-ready
> - https://www.amazon.co.jp/dp/1617295825

<br>

### アンビエントメッシュ (サイドカーレスパターン)

#### ▼ アンビエントメッシュとは

アンビエントメッシュは、サイドカーレスパターンのサービスメッシュを実装したものである。

各Node上にエージェントとしてEnvoyを稼働させ、これが各マイクロサービスのインフラ領域の責務をに担う。

> - https://blog.csdn.net/cr7258/article/details/126870859
> - https://jimmysong.io/blog/beyond-istio-oss/#sidecar-management

#### ▼ アンビエントメッシュの仕組み

![istio_ambient-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ambient-mesh_architecture.png)

アンビエントメッシュは、データプレーン、コントロールプレーンNode、といったコンポーネントから構成される。Node内の単一プロキシを使用して、サービスメッシュを実装する。

マイクロサービスアーキテクチャ固有のインフラ領域の問題 (例：サービスディスカバリーの必要性、マイクロサービス間通信の暗号化、テレメトリー作成など) を解決する責務を持つ。

Node外からのインバウンド通信、またNode外へのアウトバウンド通信は、ztunnelのPodを経由して、一度waypoint-proxyのPodにリダイレクトされる。

サイドカーパターンを将来的に廃止するということはなく、好きな方を選べるようにするらしい。

ztunnelのPodを経由した段階でHTTPSプロトコルになる。

ハードウェアリソースの消費量の少ない`L4`プロトコルと、消費量の多い`L7`プロトコルのプロコトルの処理の責務が分離されているため、サイドカーパターンと比較して、`L4`プロトコルのみを処理する場合に、Nodeのハードウェアリソース消費量を節約できる。

サービスメッシュ内へのリクエストの経路は以下の通りである。

```yaml
パブリックネットワーク
⬇⬆︎︎
リダイレクト
⬇⬆︎︎
# L4ロードバランサー
ztunnelのPod (L4) # DaemonSet配下のPodなので、Nodeごとにいる
⬇⬆︎︎
⬇⬆︎︎ # HBONE
⬇⬆︎︎
# L7ロードバランサー
waypoint-proxyのPod (L7) # Deployment配下のPodなので、任意のNodeにいる
⬇⬆︎︎
アプリコンテナのPod
```

サービスメッシュ内のリクエストの経路は以下の通りである。

```yaml
アプリコンテナのPod # クライアント側
⬇⬆︎︎
# L4ロードバランサー
ztunnelのPod (L4) # DaemonSet配下のPodなので、Nodeごとにいる
⬇⬆︎︎
⬇⬆︎︎ # HBONE
⬇⬆︎︎
# L7ロードバランサー
waypoint-proxyのPod (L7) # Deployment配下のPodなので、任意のNodeにいる
⬇⬆︎︎
⬇⬆︎︎ # HBONE
⬇⬆︎︎
# L4ロードバランサー
ztunnelのPod (L4) # DaemonSet配下のPodなので、Nodeごとにいる
⬇⬆︎︎
アプリコンテナのPod # サーバー側
```

サービスメッシュ外へのリクエストの経路は以下の通りである。

```yaml
パブリックネットワーク
⬆︎⬇
# L7ロードバランサー
waypoint-proxyのPod (L7) # Deployment配下なので、任意のNodeにいる
⬆︎⬇
⬆︎⬇ # HBONE
⬆︎⬇
# L4ロードバランサー
ztunnelのPod (L4) # DaemonSet配下なので、Nodeごとにいる
⬆︎⬇
リダイレクト
⬆︎⬇
アプリコンテナのPod
```

> - https://istio.io/latest/blog/2022/introducing-ambient-mesh/
> - https://istio.io/latest/blog/2022/get-started-ambient/#install-istio-with-ambient-mode
> - https://github.com/istio/istio/blob/experimental-ambient/manifests/charts/istio-control/istio-discovery/files/waypoint.yaml
> - https://www.sobyte.net/post/2022-09/istio-ambient/
> - https://www.zhaohuabing.com/post/2022-09-08-introducing-ambient-mesh/
> - https://blog.howardjohn.info/posts/ambient-not-node-proxy/

#### ▼ ztunnel

ztunnelが`L4` (トランスポート層) のプロトコル (例：TCP、UDPなど) を処理できる。

実体はDaemonSet配下のPodであり、Nodeごとにスケジューリングされている。

#### ▼ waypoint-proxy

waypoint-proxyが`L7` (アプリケーション層) のプロトコル (例：HTTP、HTTPS、SMTP、DNS、POP3など) を処理できる。

実体は、Gateway-APIで作成された`envoy`コンテナを含むPodであり、任意のNodeにスケジューリングされている。

```yaml
$ istioctl experimental waypoint generate
---
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: foo
spec:
  gatewayClassName: istio-waypoint
  listeners:
    - name: mesh
      port: 15008
      protocol: HBONE
```

> - https://istio.io/latest/blog/2023/waypoint-proxy-made-simple/

#### ▼ Envoy

(たぶん) Envoyの設定値は以下のように機能している。

送信元ztunnelのEnvoyの`L4`処理で

1. 前半のListenerとCluster：宛先マイクロサービスを決める
2. 後半のListenerとCluster：宛先waypoint-proxyを決める

waypoint-proxyのEnvoyの`L7`処理で

1. inbound_CONNECT_terminate Listener：HBORNを経由したリクエストを受信する
2. Internal Inbound VIP Cluster：Inbound VIP Listenerにルーティングする
3. Inbound VIP Listener：VirtualServiceのルーティングポリシーを適用する
4. Inbound VIP Cluster：Inbound Pod Listenerにロードバランシングする
5. Inbound Pod Listener：HBORNのメタデータをセットアップする
6. Inbound Pod Cluster
7. inbound_CONNECT_originate Listener
8. inbound_CONNECT_originate Cluster：宛先ztunnelを決める

宛先ztunnelのEnvoyの`L4`処理で

1. ListenerとCluster：宛先マイクロサービスを決める

> - https://jimmysong.io/en/blog/ambient-mesh-l7-traffic-path/
> - https://juejin.cn/post/7161975827473645575
> - https://www.zhaohuabing.com/post/2022-10-17-ambient-deep-dive-3/

<br>

### 展開パターンの比較

| 項目                                |                 サイドカーパターン                 |       アンビエントメッシュ        |
| ----------------------------------- | :------------------------------------------------: | :-------------------------------: |
| Nodeのハードウェアリソース消費量    |                         ×                          |                ⭕️                 |
| Nodeのストレージ使用量              |                         ⭕️                         |                 △                 |
| Envoyの冗長性                       |                        ⭕️️                         |                 △                 |
| アプリごとのEnvoyの設定カスタマイズ |                         ⭕️                         |                 △                 |
| 単純性                              |                         ×                          |                ⭕️                 |
| Istioのアップグレード               | インプレースアップグレード、カナリアアップグレード | DaemonSetのローリングアップデート |

<br>

## 02. トラフィック管理

### パケット処理の仕組み

1. `istio-proxy`コンテナにて、リスナーでリクエストを受信する。
2. EnvoyFilterがあれば、これをリスナーフィルターとしてEnvoyに適用する。
3. ルートでリクエストを受け取る。
4. クラスターでリクエストを受け取る。
5. クラスター配下のエンドポイントにリクエストをプロキシする。

> - https://github.com/istio/istio/issues/34030#issuecomment-880012551
> - https://qiita.com/DaichiSasak1/items/1fb781e5dd2fa549ac48#%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88%E5%87%A6%E7%90%86%E3%83%95%E3%83%AD%E3%83%BC

<br>

### サービスメッシュ内ではkube-proxyは不要

実は、サービスメッシュ内のPod間通信では、kube-proxyは使用しない。

`istio-init`コンテナは、`istio-iptables`コマンドを実行し、iptablesのルールを書き換える。

これにより、送信元Podから宛先Podに直接通信できるようになる。

> - https://medium.com/@bikramgupta/tracing-network-path-in-istio-538335b5bb4f

<br>

## 02-02. サービスメッシュ外へのリクエスト送信

### 安全な通信方式

#### ▼ 任意の外部システムに送信できるようにする

サービスメッシュ内のマイクロサービスから、`istio-proxy`コンテナ (マイクロサービスのサイドカーとIstio EgressGatewayの両方) を経由して、任意の外部システムにリクエストを送信できるようにする。

外部システムは識別できない。

> - https://istio.io/latest/docs/tasks/traffic-management/egress/egress-control/#security-note
> - https://istio.io/v1.14/blog/2019/egress-performance/

#### ▼ 登録した外部システムに送信できるようにする

サービスメッシュ内のマイクロサービスから、`istio-proxy`コンテナ (マイクロサービスのサイドカーとIstio EgressGatewayの両方) を経由して、ServiceEntryで登録した外部システムにリクエストを送信できるようにする。

外部システムを識別できる。

> - https://istio.io/latest/docs/tasks/traffic-management/egress/egress-control/#security-note
> - https://istio.io/v1.14/blog/2019/egress-performance/

<br>

### 安全ではない通信方式

#### ▼ 登録した外部システムに送信できるようにする

サービスメッシュ内のマイクロサービスから、`istio-proxy`コンテナ (マイクロサービスのサイドカーのみ) を経由して、任意の外部システムにリクエストを送信できるようにする。

外部システムは識別できない。

> - https://istio.io/latest/docs/tasks/traffic-management/egress/egress-control/#understanding-what-happened
> - https://istio.io/v1.14/blog/2019/egress-performance/

#### ▼ `istio-proxy`コンテナを経由せずに送信できるようにする

サービスメッシュ内のマイクロサービスから、`istio-proxy`コンテナを経由せずに、外部システムにリクエストを送信できるようにする。

> - https://istio.io/latest/docs/tasks/traffic-management/egress/egress-control/#understanding-what-happened
> - https://istio.io/v1.14/blog/2019/egress-performance/

 <br>

### 外部システムの種類

#### ▼ `PassthroughCluster`

IPアドレスを指定した送信できる宛先のこと。

Istio `v1.3`以降で、デフォルトで全てのサービスメッシュ外へのリクエストのポリシーが`ALLOW_ANY`となり、`PassthroughCluster`として扱うようになった。

サービスメッシュ外にDBを配置する場合、メッシュ内のアプリからDBへ通信ではDBのエンドポイントを指定することになる。

そのため、サービスメッシュ外へのリクエストは`PassthroughCluster`に属する。

注意点として、`REGISTRY_ONLY`モードを有効化すると、ServiceEntryで登録された宛先以外へのサービスメッシュ外への全通信が`BlackHoleCluster`になってしまう

> - https://istiobyexample.dev/monitoring-egress-traffic/
> - https://dev.to/hsatac/howto-find-egress-traffic-destination-in-istio-service-mesh-4l61
> - https://istio.io/latest/docs/tasks/traffic-management/egress/egress-control/#envoy-passthrough-to-external-services

#### ▼ `BlackHoleCluster`

IPアドレスを指定して送信できない宛先のこと。

基本的に、サービスメッシュ外へのリクエストは失敗し、`502`ステータスになる (`502 Bad Gateway`)。

> - https://istiobyexample.dev/monitoring-egress-traffic/

<br>

## 03. 復旧性の管理

### フォールトインジェクション

#### ▼ フォールトインジェクションとは

ランダムな障害を意図的にインジェクションし、サービスメッシュの動作を検証する。

> - https://istio.io/latest/docs/tasks/traffic-management/fault-injection/
> - https://istio.io/latest/docs/examples/microservices-istio/production-testing/

#### ▼ テストの種類

| テスト名              | 内容                                                                                                                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Delayインジェクション | アプリコンテナに対するインバウンド通信にて、意図的に通信の遅延を発生させる。<br>・https://istio.io/latest/docs/tasks/traffic-management/fault-injection/#injecting-an-http-delay-fault |
| Abortインジェクション | アプリコンテナに対するインバウンド通信にて、意図的に通信の中止を発生させる。<br>・https://istio.io/latest/docs/tasks/traffic-management/fault-injection/#injecting-an-http-abort-fault |

<br>

### サーキットブレイカー

istio-proxyコンテナでサーキットブレイカーを実現する。

なお、アプリケーションで同様の実装をしても良い。

<br>

## 04. 通信の認証/認可

### 通信の認証

#### ▼ 仕組み

Pod間通信時に、正しい送信元Envoyの通信であることを認証する。

> - https://istio.io/latest/docs/concepts/security/#authentication-architecture
> - https://news.mynavi.jp/techplus/article/kubernetes-30/

#### ▼ 相互TLS認証

相互TLS認証を実施し、送信元のPodの通信を認証する。

> - https://istio.io/latest/docs/concepts/security/#authentication

#### ▼ JWTによるBearer認証 (IDプロバイダーに認証フェーズを委譲)

JWTによるBearer認証を実施し、送信元のPodの通信を認証する。

この場合、認証フェーズをIDプロバイダー (例：Auth0、GitHub、Keycloak、Zitadel、AWS Cognito、Google Cloud Auth) に委譲することになる。

JWTの取得方法として、例えば以下の方法がある。

- 送信元のPodがIDプロバイダーからJWTを直接取得する。
- 送信元/宛先の間にOAuthプロキシ (例：OAuth2 Proxyなど) やSSOプロキシ(例：Dexなど) を配置し、認証プロキシでIDプロバイダーからJWTを取得する。

> - https://istio.io/latest/docs/concepts/security/#authentication-architecture

#### ▼ アプリの認証について

アプリ側の認証については、Istioの管理外である。

<br>

### 通信の認可

#### ▼ 仕組み

Pod間通信時に、AuthorizationPolicyを使用して、スコープに含まれる認証済みEnvoyの通信のみを認可する。

![istio_authorization-policy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_authorization-policy.png)

> - https://istio.io/latest/docs/concepts/security/#authorization-policies
> - https://www.styra.com/blog/authorize-better-istio-traffic-policies-with-opa-styra-das/
> - https://news.mynavi.jp/techplus/article/kubernetes-30/

#### ▼ 通信の認可の委譲

AuthorizationPolicyでIDプロバイダー (例：Auth0、GitHub、Keycloak、Zitadel、AWS Cognito、Google Cloud Auth) を指定し、認可フェーズを委譲できる。

> - https://zenn.dev/takitake/articles/a91ea116cabe3c#%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3%E5%9B%B3

#### ▼ アプリの認可について

アプリ側の認可については、Istioの管理外である。

<br>

## 05. アプリケーションデータの暗号化

### 相互TLS認証

#### ▼ 相互TLS認証とは

相互TLS認証を実施し、`L7`のアプリケーションデータを暗号化/復号化する。

> - https://istio.io/latest/docs/concepts/security/#authentication-architecture

#### ▼ TLSタイムアウト

アウトバウンド時、`istio-proxy`コンテナは宛先にHTTPSリクエストを送信する。

この時、実際はタイムアウトであっても、`TLS handshake timeout`というエラーなってしまう。

<br>

### クライアント証明書 / SSL証明書発行

#### ▼ Istiodコントロールプレーン (`discovery`コンテナ) をルート認証局として使用する場合

デフォルトでは、Istiodコントロールプレーンがルート認証局として働く。

クライアント証明書 / SSL証明書を提供しつつ、これを定期的に自動更新する。

1. Istiodコントロールプレーンは、`istio-ca-secret` (Secret) を自己署名する。
2. Istiodコントロールプレーンは、`istio-proxy`コンテナから送信された秘密鍵と証明書署名要求で署名されたクライアント証明書 / SSL証明書を作成する。特に設定しなければ、`istio-proxy`コンテナのpilot-agentプロセスが、秘密鍵と証明書署名要求を自動で作成してくれる。
3. `istio-proxy`コンテナからのリクエストに応じて、IstiodのSDS-APIがクライアント証明書 / SSL証明書を`istio-proxy`コンテナに配布する。
4. Istiodコントロールプレーンは、CA証明書を持つ`istio-ca-root-cert` (ConfigMap) を自動的に作成する。これは、`istio-proxy`コンテナにマウントされ、証明書を検証するために使用する。
5. `istio-proxy`コンテナ間で相互TLS認証できるようになる。
6. 証明書が失効すると、`istio-proxy`コンテナの証明書が自動的に差し代わる。Podの再起動は不要である。

![istio_istio-ca-root-cert](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_istio-ca-root-cert.png)

> - https://istio.io/latest/docs/concepts/security/#pki
> - https://developers.redhat.com/articles/2023/08/24/integrate-openshift-service-mesh-cert-manager-and-vault#default_and_pluggable_ca_scenario
> - https://www.reddit.com/r/istio/comments/x1l1sm/if_istio_caroot_certificate_expires_do_you_need/
> - https://zufardhiyaulhaq.com/Replacing-Istio-CA-certificate/
> - https://training.linuxfoundation.cn/news/407

#### ▼ 外部ツールをルート認証局として使用する場合

Istiodコントロールプレーン (`discovery`コンテナ) を中間認証局として使用し、ルート認証局をIstio以外 (例：HashiCorp Vaultなど) に委譲できる。

外部のルート認証局は、`istio-proxy`コンテナから送信された秘密鍵と証明書署名要求で署名されたSSL証明書を作成する。

> - https://istio.io/latest/docs/tasks/security/cert-management/custom-ca-k8s/
> - https://istio.io/latest/docs/ops/integrations/certmanager/
> - https://jimmysong.io/en/blog/cert-manager-spire-istio/

<br>

## 06. テレメトリーの作成

### 他のOSSとの連携

Istio上のEnvoyは、テレメトリーを作成する。

各監視ツールは、プル型 (ツールがIstiodから収集) やプッシュ型 (Istiodがツールに送信) でこのテレメトリーを収集する。

> - https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=17

<br>

## 06-02. メトリクス

### メトリクスの作成と送信

Istio上のEnvoyはメトリクスを作成し、Istiodコントロールプレーン (`discovery`コンテナ) に送信する。

Prometheusは、`discovery`コンテナの`/stats/prometheus`エンドポイント (`15090`番ポート) からメトリクスのデータポイントを収集する。

なお、`istio-proxy`コンテナにも`/stats/prometheus`エンドポイントはある。

> - https://istio.io/latest/docs/tasks/observability/metrics/using-istio-dashboard/
> - https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=22

<br>

### セットアップ

#### ▼ Prometheusの設定ファイル

Prometheusの設定ファイルとして定義することもできる。

```yaml
scrape_configs:
  # Istiodの監視
  - job_name: istiod
    kubernetes_sd_configs:
      - role: endpoints
        namespaces:
          names:
            - istio-system
    relabel_configs:
      - source_labels:
          - __meta_kubernetes_service_name
          - __meta_kubernetes_endpoint_port_name
        action: keep
        regex: istiod;http-monitoring
  # istio-proxyの監視
  - job_name: istio-proxy
    metrics_path: /stats/prometheus
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels:
          - __meta_kubernetes_pod_container_port_name
        action: keep
        regex: .*-envoy-prom
```

> - https://istio.io/latest/docs/ops/integrations/prometheus/#option-2-customized-scraping-configurations

#### ▼ カスタムリソースの場合

Prometheusが`discovery`コンテナからデータポイントを取得するためには、`discovery`コンテナのPodを監視するためのServiceMonitorが必要である。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: istiod-service-monitor
  namespace: istio-system
spec:
  jobLabel: istio
  targetLabels:
    - app
  selector:
    matchExpressions:
      - key: istio
        operator: In
        values:
          - pilot
  namespaceSelector:
    matchNames:
      - istio-system
  endpoints:
    - port: http-monitoring
      interval: 15s
```

また、`istio-proxy`コンテナの監視には、PodMonitorが必要である。

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PodMonitor
metadata:
  name: istio-proxy-service-monitor
  namespace: istio-system
spec:
  selector:
    matchExpressions:
      - key: istio-prometheus-ignore
        operator: DoesNotExist
  namespaceSelector:
    # istio-proxyをインジェクションしているNamespaceを網羅できるようにする
    any: true
  jobLabel: envoy-stats
  podMetricsEndpoints:
    # istio-proxyコンテナが公開しているメトリクス収集用のエンドポイントを指定する
    - path: /stats/prometheus
      interval: 15s
      relabelings:
        - action: keep
          sourceLabels:
            - __meta_kubernetes_pod_container_name
          regex: "istio-proxy"
        - action: keep
          sourceLabels:
            - __meta_kubernetes_pod_annotationpresent_prometheus_io_scrape
        - action: replace
          regex: (\d+);(([A-Fa-f0-9]{1,4}::?){1,7}[A-Fa-f0-9]{1,4})
          replacement: "[$2]:$1"
          sourceLabels:
            - __meta_kubernetes_pod_annotation_prometheus_io_port
            - __meta_kubernetes_pod_ip
          targetLabel: __address__
        - action: replace
          regex: (\d+);((([0-9]+?)(\.|$)){4})
          replacement: $2:$1
          sourceLabels:
            - __meta_kubernetes_pod_annotation_prometheus_io_port
            - __meta_kubernetes_pod_ip
          targetLabel: __address__
        - action: labeldrop
          regex: "__meta_kubernetes_pod_label_(.+)"
        - sourceLabels:
            - __meta_kubernetes_namespace
          action: replace
          targetLabel: namespace
        - sourceLabels:
            - __meta_kubernetes_pod_name
          action: replace
          targetLabel: pod_name
```

> - https://github.com/istio/istio/blob/1.19.3/samples/addons/extras/prometheus-operator.yaml
> - https://discuss.istio.io/t/scraping-istio-metrics-from-prometheus-operator-e-g-using-servicemonitor/10632
> - https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=23

<br>

### メトリクスの種類

#### ▼ Istiod全体に関するメトリクス

| メトリクス名  | 単位     | 説明                                                                                                                              |
| ------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `istio_build` | カウント | Istioの各コンポーネントの情報を表す。`istio_build{component="pilot"}`とすることで、Istiodコントロールプレーンの情報を取得できる。 |

#### ▼ `istio-proxy`コンテナに関するメトリクス

Prometheus上でメトリクスをクエリすると、Istiodコントロールプレーン (`discovery`コンテナ) から収集したデータポイントを取得できる。

| メトリクス名                              | 単位     | 説明                                                                                                                                                                                       |
| ----------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `istio_requests_total`                    | カウント | `istio-proxy`コンテナが受信した総リクエスト数を表す。メトリクスの名前空間に対して様々なディメンションを設定できる。<br>・https://blog.christianposta.com/understanding-istio-telemetry-v2/ |
| `istio_request_duration_milliseconds`     | カウント | `istio-proxy`コンテナが受信したリクエストに関して、処理の所要時間を表す。                                                                                                                  |
| `istio_request_messages_total`            | カウント | `istio-proxy`コンテナが受信したgRPCによる総HTTPリクエスト数を表す。                                                                                                                        |
| `istio_response_messages_total`           | カウント | `istio-proxy`コンテナが受信した総gRPCレスポンス数を表す。                                                                                                                                  |
| `envoy_cluster_upstream_rq_retry`         | カウント | `istio-proxy`コンテナの他のPodへのリクエストに関する再試行数を表す。                                                                                                                       |
| `envoy_cluster_upstream_rq_retry_success` | カウント | `istio-proxy`コンテナが他のPodへのリクエストに関する再試行成功数を表す。                                                                                                                   |

> - https://istio.io/latest/docs/reference/config/metrics/#metrics
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/upstream/cluster_manager/cluster_stats
> - https://www.zhaohuabing.com/post/2023-02-14-istio-metrics-deep-dive/

#### ▼ メトリクスのラベル

メトリクスをフィルタリングできるように、Istioでは任意のメトリクスにデフォルトでラベルがついている。

| ラベル                           | 説明                                                                              | 例                                                                     |
| -------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `connection_security_policy`     | Pod値の通信方法を表す。                                                           | `mutual_tls` (相互TLS認証)                                             |
| `destination_app`                | リクエストの宛先のコンテナ名を表す。                                              | `foo-container`                                                        |
| `destination_cluster`            | リクエストの宛先のCluster名を表す。                                               | `Kubernetes`                                                           |
| `destination_service`            | リクエストの宛先のService名を表す。                                               | `foo-service`                                                          |
| `destination_workload`           | リクエストの宛先のDeployment名を表す。                                            | `foo-deployment                                                        |
| `destination_workload_namespace` | クライアント側のNamespace名を表す。                                               |                                                                        |
| `reporter`                       | メトリクスの収集者を表す。`istio-proxy`コンテナかIngressGatewayのいずれかである。 | ・`destination` (`istio-proxy`コンテナ)<br>・`source` (IngressGateway) |
| `response_flags`                 | Envoyの`%RESPONSE_FLAGS%`変数を表す。                                             | `-` (値なし)                                                           |
| `response_code`                  | `istio-proxy`コンテナが返信したレスポンスコードの値を表す。                       | `200`、`404`、`0` (クライアントが切断した場合)                         |
| `source_app`                     | クライアント側のコンテナ名を表す。                                                | `foo-container`                                                        |
| `source_cluster`                 | クライアント側のCluster名を表す。                                                 | `Kubernetes`                                                           |
| `source_workload`                | クライアント側のDeployment名を表す。                                              | `foo-deployment`                                                       |

> - https://istio.io/latest/docs/reference/config/metrics/#labels

<br>

## 06-03. ログ (アクセスログのみ)

### ログの監視

#### ▼ ログの出力

Istio上のEnvoyは、アプリコンテナへのアクセスログ (インバウンド通信とアウトバウンド通信の両方) を作成し、標準出力に出力する。

アクセスログにデフォルトで役立つ値が出力される。

ログ収集ツール (例：FluentBit、Fluentdなど) をDaemonSetパターンやサイドカーパターンで配置し、NodeやPod内コンテナの標準出力に出力されたログを監視バックエンドに送信できるようにする必要がある。

```yaml
# istio-proxyコンテナのアクセスログ
{
  # 相互TLSの場合の宛先コンテナ名
  "authority": "foo-downstream:<ポート番号>",
  "bytes_received": 158,
  "bytes_sent": 224,
  "connection_termination_details": null,
  "downstream_local_address": "*.*.*.*:50010",
  "downstream_remote_address": "*.*.*.*:50011",
  # ダウンストリームからアップストリームへリクエストをプロキシし、レスポンスを処理し終えるまでにかかった時間
  # ダウンストリーム側で設定したタイムアウトになった場合は、Envoyはその時間の直前にプロキシをやめるため、Durationはタイムアウトとおおよそ同じになる
  "duration": 12,
  "method": null,
  "path": null,
  "protocol": null,
  "request_id": null,
  "requested_server_name": null,
  # アップストリームからのレスポンスのステータスコード
  "response_code": 200,
  "response_code_details": null,
  # ステータスコードの補足情報
  "response_flags": "-",
  "route_name": null,
  "start_time": "2023-04-12T06:11:46.996Z",
  "upstream_cluster": "outbound|50000||foo-pod.foo-namespace.svc.cluster.local",
  "upstream_host": "*.*.*.*:50000",
  "upstream_local_address": "*.*.*.*:50001",
  "upstream_service_time": null,
  "upstream_transport_failure_reason": null,
  "user_agent": null,
  "x_forwarded_for": null,
}
```

> - https://istio.io/latest/docs/tasks/observability/logs/access-log/

#### ▼ ログの送信

Istio上のEnvoyは、アクセスログをログ収集ツール (例：OpenTelemetry Collector) に送信する。

> - https://istio.io/latest/docs/tasks/observability/logs/otel-provider/

<br>

## 06-04. 分散トレース

### 分散トレースの監視

#### ▼ スパンの作成

Istio上のEnvoyは、スパンを作成する。

スパンの作成場所としては、いくつか種類がある。

| `istio-proxy` | アプリ |
| :-----------: | :----: |
|      ✅       |        |
|      ✅       |   ✅   |
|               |   ✅   |

スパンの作成場所が多いほど、各コンテナの処理時間が細分化された分散トレースを収集できる。

アプリコンテナ間でスパンが持つコンテキストを伝播しないため、コンテキストを伝播させる実装が必要になる。

#### ▼ スパンの送信

Istio上のEnvoyは、スパンを分散トレース収集ツール (例：Jaeger Collector、OpenTelemetry Collectorなど) に送信する。

Envoyでは宛先としてサポートしていても、Istio上のEnvoyでは使用できない場合がある。(例：X-Rayデーモン)

> - https://istio.io/latest/docs/tasks/observability/distributed-tracing/overview/
> - https://github.com/istio/istio/blob/1.14.3/samples/bookinfo/src/productpage/productpage.py#L180-L237
> - https://github.com/istio/istio/blob/1.14.3/samples/bookinfo/src/details/details.rb#L130-L187
> - https://github.com/istio/istio/issues/36599

<br>

## 07. マルチClusterメッシュ

### マルチClusterメッシュとは

複数のClusterのネットワークを横断的に管理するサービスメッシュ。

Istiodコントロールプレーンを持つプライマリCluster、サービスメッシュに参加するClusterのリモートCluster、からなる。

> - https://istio.io/latest/docs/ops/deployment/deployment-models/#multiple-meshes

<br>

### 異なるCluster内コンテナのデータプレーン内管理

#### ▼ 同じプライベートネットワーク内の場合

異なるClusterが同じプライベートネットワーク内に所属している場合に、ClusterのコントロールプレーンNode間でデータプレーンを管理し合う。

これにより、この時、IngressGatewayを使用せずに、異なるClusterのコンテナが直接的に通信できる。

![istio_multi-service-mesh_cluster_same-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_multi-service-mesh_cluster_same-network.png)

> - https://zenn.dev/kuchima/articles/asm-hybrid-mesh

#### ▼ 異なるプライベートネットワーク内の場合

異なるClusterが異なるプライベートネットワーク内に所属している場合に、ClusterのコントロールプレーンNode間でデータプレーンを管理し合う。

これにより、この時、IngressGatewayを経由して、異なるClusterのコンテナが間接的に通信できる。

![istio_multi-service-mesh_cluster_difficult-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_multi-service-mesh_cluster_difficult-network.png)

> - https://zenn.dev/kuchima/articles/asm-hybrid-mesh

<br>

### 仮想サーバー上のコンテナのデータプレーン内管理

#### ▼ 同じプライベートネットワーク内の場合

仮想サーバーがコントロールプレーンNodeと同じプライベートネットワーク内に所属している場合に、仮想サーバー上のコンテナをサービスメッシュに参加させる。

コントロールプレーン側ではWorkloadGroupの作成、仮想サーバー側ではistioデーモンプロセスの実行が必要である。

この時、IngressGatewayを使用せずに、Kubernetes上のコンテナと仮想サーバー上のコンテナが直接的に通信できる。

![istio_multi-service-mesh_vm_same-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_multi-service-mesh_vm_same-network.png)

> - https://istio.io/latest/docs/ops/deployment/vm-architecture/
> - https://istio.io/latest/docs/setup/install/virtual-machine/#start-istio-within-the-virtual-machine

#### ▼ 異なるプライベートネットワーク内の場合

仮想サーバーがコントロールプレーンNodeと異なるプライベートネットワーク内に所属している場合に、仮想サーバー上のコンテナをサービスメッシュに参加させる。

コントロールプレーン側ではWorkloadGroupの作成、仮想サーバー側ではistioデーモンプロセスの実行が必要である。

この時、IngressGatewayを経由して、Kubernetes上のコンテナと仮想サーバー上のコンテナが間接的に通信できる。

![istio_multi-service-mesh_vm_difficult-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_multi-service-mesh_vm_difficult-network.png)

> - https://istio.io/latest/docs/ops/deployment/vm-architecture/
> - https://istio.io/latest/docs/setup/install/virtual-machine/#start-istio-within-the-virtual-machine

<br>

### クラウド上のコンテナのデータプレーン管理

クラウド上のコンテナ (例：AWS ECS) がコントロールプレーンNodeと同じプライベートネットワーク内に所属している場合に、クラウド上のコンテナをサービスメッシュに参加させる。

コントロールプレーン側では〇〇 (AWS ECSを認識するためのリソースが必要なはずだが、調査してもわからず...) の作成、クラウド上のコンテナのホストマシンではztunnelデーモンあるいはztunnelコンテナの実行が必要である。

> - https://aws.amazon.com/blogs/containers/transforming-istio-into-an-enterprise-ready-service-mesh-for-amazon-ecs/
> - https://github.com/solo-io/ecs-demo/blob/main/tf/ecs_eks_cluster.tf#L126-L151
> - https://github.com/solo-io/ecs-demo/blob/main/README.md#install-istio-in-ambient-mode-with-ecs-cluster-integration

<br>
