---
title: 【IT技術の知見】Istio＠サービスメッシュ系ミドルウェア
description: Istio＠サービスメッシュ系ミドルウェアの知見を記録しています。
---

# Istio＠サービスメッシュ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. Istio の仕組み

| 項目                                            |                  サイドカーモード                  |         アンビエントモード         |
| ----------------------------------------------- | :------------------------------------------------: | :--------------------------------: |
| Node のハードウェアリソース消費量               |                         ×                          |                 ⭕️                 |
| Node のストレージ使用量                         |                         ⭕️                         |                 △                  |
| Envoy の冗長性                                  |                         ⭕️️                         |                 △                  |
| マイクロサービスごとの Envoy の設定カスタマイズ |                         ⭕️                         |                 △                  |
| 単純性                                          |                         ×                          |                 ⭕️                 |
| Istio のアップグレード                          | インプレースアップグレード、カナリアアップグレード | DaemonSet のローリングアップデート |

<br>

## 01-02. 拡張性設計

### コントロールプレーンの性能設計

#### ▼ CPU

- デプロイ頻度
- 設定変更頻度
- istio-proxy 数
- サービスメッシュのスコープ
- コントロールプレーンの冗長化数

> - [Istio / Performance and Scalability](https://istio.io/latest/docs/ops/deployment/performance-and-scalability/#control-plane-performance)
> - [Istio / Configuration Scoping](https://istio.io/latest/docs/ops/configuration/mesh/configuration-scoping/)

<br>

### データプレーンの性能設計

#### ▼ CPU を消費する処理

メモリと同じように、以下の情報によって、データプレーンで必要な CPU が変わる。

- istio-proxy 内の Envoy プロセスのスレッド数。スレッドが多くなるほど、これに紐づく CPU が必要になる。
- istio-proxy 内の Envoy プロセスが作成するテレメトリー (ログ、メトリクス、分散トレース) のデータサイズ
- リクエストやレスポンスのデータサイズ
- 送信元の接続数
- など...

> - [Istio / Performance and Scalability](https://istio.io/latest/docs/ops/deployment/performance-and-scalability/#data-plane-performance)

#### ▼ メモリを消費する処理

CPU と同じように、以下の情報によって、データプレーンで必要なメモリが変わる。

- istio-proxy 内の Envoy プロセスのスレッド数。スレッドが多くなるほど、これに紐づく CPU が必要になる。
- istio-proxy 内の Envoy プロセスが作成するテレメトリー (ログ、メトリクス、分散トレース) のデータサイズ
- リクエストやレスポンスのデータサイズ
- 送信元の接続数
- など...

特に以下でメモリが必要になる。

- istio-proxy 内の Envoy プロセスが持つ宛先情報量

> - [Istio / Performance and Scalability](https://istio.io/latest/docs/ops/deployment/performance-and-scalability/#data-plane-performance)

#### ▼ サービスメッシュ有無による違い

サービスメッシュ有無によって、ハードウェアリソース消費量に違いがある。

**例**

Istio のドキュメントでは、以下のハードウェアリソースを消費することが記載されている。

1000 req/sec、データサイズ 1 KB の場合である。

|                           |    CPU    | メモリ |
| ------------------------- | :-------: | :----: |
| istio-proxy               | 0.2 vCPU  | 60 Mi  |
| waypoint-proxy のコンテナ | 0.25 vCPU | 60 Mi  |
| ztunnel のコンテナ        | 0.06 vCPU | 12 Mi  |

> - [Istio / Performance and Scalability](https://istio.io/latest/docs/ops/deployment/performance-and-scalability/#sidecar-and-ztunnel-resource-usage)

**例**

istio-proxy をインジェクションすると、Pod あたりで以下のハードウェアリソースが増える調査結果も出ている。

- CPU：0.0002 vCPU 〜0.0003 vCPU
- メモリ：40 Mi 〜 50 Mi

| Pod        | CPU (導入前) | CPU (導入後) | メモリ (導入前) | メモリ (導入後) |
| ---------- | :----------: | :----------: | :-------------: | :-------------: |
| Nginx      |    0 vCPU    | 0.0003 vCPU  |      2 Mi       |      47 Mi      |
| Database   | 0.0001 vCPU  | 0.0003 vCPU  |      29 Mi      |      76 Mi      |
| サービス A | 0.0001 vCPU  | 0.0004 vCPU  |     237 Mi      |     220 Mi      |
| サービス B | 0.0002 vCPU  | 0.0004 vCPU  |     219 Mi      |     288 Mi      |
| サービス C | 0.0002 vCPU  | 0.0004 vCPU  |     253 Mi      |     270 Mi      |
| サービス D | 0.0002 vCPU  | 0.0004 vCPU  |      28 Mi      |      73 Mi      |
| サービス E | 0.0004 vCPU  | 0.0007 vCPU  |      35 Mi      |      78 Mi      |
| サービス F | 0.0002 vCPU  | 0.0004 vCPU  |     230 Mi      |     270 Mi      |
| サービス G | 0.0003 vCPU  | 0.0006 vCPU  |      30 Mi      |      75 Mi      |
| サービス H | 0.0002 vCPU  | 0.0004 vCPU  |     393 Mi      |     311 Mi      |
| サービス I | 0.0001 vCPU  | 0.0004 vCPU  |     322 Mi      |     411 Mi      |
| 合計       | 0.0020 vCPU  | 0.0047 vCPU  |     1778 Mi     |     2119 Mi     |

> - [サービスメッシュ導入の前に知っておくべきこと - アルファテックブログ](https://www.alpha.co.jp/blog/202205_01/#%E4%BD%BF%E7%94%A8%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%AE%E4%B8%8A%E6%98%87)

<br>

### レイテンシー (≒レスポンスタイム) の大きさ

#### ▼ レイテンシーを大きくする処理

以下により、レイテンシーは大きくなる。

- istio-proxy、waypoint-proxy のコンテナ、ztunnel のコンテナの経由
- RequestAuthentication による JWT トークンの検証
- PeerAuthentication による相互 TLS 認証

> - [Istio / Performance and Scalability](https://istio.io/latest/docs/ops/deployment/performance-and-scalability/#latency-for-istio-124)
> - [Istio / Large Scale Security Policy Performance Tests](https://istio.io/latest/blog/2020/large-scale-security-policy-performance-tests/#conclusion)

#### ▼ サービスメッシュ有無による違い

p99、1000 req/sec、240 秒間の負荷の場合である。

| 条件                                   | レイテンシー |
| -------------------------------------- | :----------: |
| both (送信元／宛先 istio-proxy の両方) |   約 28 ms   |
| serveronly (宛先 istio-proxy のみ)     |   約 13 ms   |
| baseline (istio-proxy なし)            |   約 3 ms    |

![istio_sidecar-mode_latency](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_sidecar-mode_latency.png)

> - [Istio / Best Practices: Benchmarking Service Mesh Performance](https://istio.io/latest/blog/2019/performance-best-practices/)

#### ▼ モードによる違い

<br>

## 02. サイドカーモード

### Istio のサイドカーモードとは

サイドカーモードは、サイドカープロキシ型のサービスメッシュを実装したものである。

各 Pod にサイドカーとして Envoy を稼働させ、これが各マイクロサービスのインフラ領域の責務をに担う。

> - [Beyond Istio OSS - The Current State and Future of the Istio …](https://jimmysong.io/blog/beyond-istio-oss/#sidecar-management)
> - [Distributed Tracing@OpenShift Meetup Tokyo20191018 - Speaker Deck](https://speakerdeck.com/16yuki0702/distributed-tracing-at-openshift-meetup-tokyo20191018?slide=35)
> - [サービスメッシュの本質は、トラフィック管理や可観測性ではない](https://zenn.dev/riita10069/articles/service-mesh)

<br>

## 03. アンビエントモード (サイドカーレスパターン)

### アンビエントモードとは

アンビエントモードは、サイドカーレスパターンのサービスメッシュを実装したものである。

各 Node 上では DaemonSet 配下の Pod として ztunnel を稼働させ、必要に応じて Deployment 配下の Pod として waypoint-proxy を稼働させる。ztunnel は L4、waypoint-proxy は L7 を中心とする非機能ロジックを担う。

> - https://blog.csdn.net/cr7258/article/details/126870859
> - [Beyond Istio OSS - The Current State and Future of the Istio …](https://jimmysong.io/blog/beyond-istio-oss/#sidecar-management)

<br>

## 03. トラフィック管理

### ネットワークレイヤー

L4/L7 に対応している。

> - [Istio / Scaling in the Clouds: Istio Ambient vs. Cilium](https://istio.io/latest/blog/2024/ambient-vs-cilium/)

### パケット処理の仕組み

1. istio-proxy にて、リスナーでリクエストを受信する。
2. フィルターでリクエストを処理する。
3. ルートでリクエストを受け取る。
4. クラスターでリクエストを受け取る。
5. クラスター配下のエンドポイントにリクエストを送信する。

> - [Why does Istio need so many envoy listeners? · Issue #34030 · istio/istio · GitHub](https://github.com/istio/istio/issues/34030#issuecomment-880012551)
> - [Istio ~EnvoyFilter入門~ #kubernetes - Qiita](https://qiita.com/DaichiSasak1/items/1fb781e5dd2fa549ac48#%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88%E5%87%A6%E7%90%86%E3%83%95%E3%83%AD%E3%83%BC)

<br>

### サービスメッシュ内では kube-proxy は不要

実は、サービスメッシュ内の Pod 間通信では、kube-proxy は使用しない。

`istio-init` コンテナは、`istio-iptables` コマンドを実行し、iptables のルールを書き換える。

これにより、Pod 内のマイクロサービスの通信を istio-proxy にリダイレクトできるようになる。

> - https://medium.com/@bikramgupta/tracing-network-path-in-istio-538335b5bb4f

<br>

## 03-02. サービスメッシュ外へのリクエスト送信

### 安全な通信方式

#### ▼ 任意の外部システムに送信できるようにする

サービスメッシュ内のマイクロサービスから、istio-proxy (マイクロサービスのサイドカーと Istio Egress Gateway の両方) を経由して、任意の外部システムにリクエストを送信できるようにする。

外部システムは識別できない。

> - [Istio / Accessing External Services](https://istio.io/latest/docs/tasks/traffic-management/egress/egress-control/#security-note)
> - https://istio.io/v1.14/blog/2019/egress-performance/

#### ▼ 登録した外部システムに送信できるようにする

サービスメッシュ内のマイクロサービスから、istio-proxy (マイクロサービスのサイドカーと Istio Egress Gateway の両方) を経由して、ServiceEntry で登録した外部システムにリクエストを送信できるようにする。

外部システムを識別できる。

> - [Istio / Accessing External Services](https://istio.io/latest/docs/tasks/traffic-management/egress/egress-control/#security-note)
> - https://istio.io/v1.14/blog/2019/egress-performance/

<br>

### 安全ではない通信方式

#### ▼ 登録した外部システムに送信できるようにする

サービスメッシュ内のマイクロサービスから、istio-proxy (マイクロサービスのサイドカーのみ) を経由して、任意の外部システムにリクエストを送信できるようにする。

外部システムは識別できない。

> - [Istio / Accessing External Services](https://istio.io/latest/docs/tasks/traffic-management/egress/egress-control/#understanding-what-happened)
> - https://istio.io/v1.14/blog/2019/egress-performance/

#### ▼ istio-proxy を経由せずに送信できるようにする

サービスメッシュ内のマイクロサービスから、istio-proxy を経由せずに、外部システムにリクエストを送信できるようにする。

> - [Istio / Accessing External Services](https://istio.io/latest/docs/tasks/traffic-management/egress/egress-control/#understanding-what-happened)
> - https://istio.io/v1.14/blog/2019/egress-performance/

<br>

### 外部システムの種類

#### ▼ `PassthroughCluster`

定義されていないが通信が許可されているサービスメッシュ外の送信元 (`InPassthroughCluster`) ／宛先 (`OutboundPassthroughCluster`) のこと。

Istio `v1.3` 以降で、デフォルトですべてのサービスメッシュ外へのリクエストのポリシーが `ALLOW_ANY` となり、`PassthroughCluster` として扱うようになった。

ServiceEntry を使用すれば、名前をつけられる。

注意点として、`REGISTRY_ONLY` モードを有効化すると、ServiceEntry で登録された宛先以外のサービスメッシュ外への全通信が `BlackHoleCluster` 扱いになってしまう。

> - https://istiobyexample.dev/monitoring-egress-traffic/
> - [HowTo: Find egress traffic destination in Istio service mesh - DEV Community](https://dev.to/hsatac/howto-find-egress-traffic-destination-in-istio-service-mesh-4l61)
> - [Istio / Accessing External Services](https://istio.io/latest/docs/tasks/traffic-management/egress/egress-control/#envoy-passthrough-to-external-services)

#### ▼ `BlackHoleCluster`

`REGISTRY_ONLY` モードで、ServiceEntry に登録されていないサービスメッシュ外の宛先のこと。

基本的に、サービスメッシュ外へのリクエストは失敗し、`502` ステータスになる (`502 Bad Gateway`)。

> - https://istiobyexample.dev/monitoring-egress-traffic/

<br>

## 04. 回復性の管理

### フォールトインジェクション

#### ▼ フォールトインジェクションとは

ランダムな障害を意図的にインジェクションし、サービスメッシュの動作を検証する。

> - [Istio / Fault Injection](https://istio.io/latest/docs/tasks/traffic-management/fault-injection/)
> - [Istio / Test in production](https://istio.io/latest/docs/examples/microservices-istio/production-testing/)

#### ▼ テストの種類

| テスト名               | 内容                                                                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Delay インジェクション | 通信元の istio-proxy で、宛先への HTTP リクエストを意図的に遅延させる。`<br>`・https://istio.io/latest/docs/tasks/traffic-management/fault-injection/#injecting-an-http-delay-fault |
| Abort インジェクション | 通信元の istio-proxy で、宛先に HTTP リクエストを中継せず、エラーレスポンスを返信する。`<br>`・https://istio.io/latest/docs/tasks/traffic-management/fault-injection/#injecting-an-http-abort-fault |

#### ▼ サーキットブレイカー

istio-proxy でサーキットブレイカーを実現する。

ただし、サーキットブレイカー後のフォールバックは `istoi-proxy` コンテナでは実装できず、マイクロサービスで実装する必要がある。

istio-proxy は、送信可能な宛先がなくなると `503` レスポンスを返信する。

Envoy は以下の機能を持っている。

- Envoy では、接続プールの上限を条件として、サーキットブレイカーを発動する
- Envoy では、ステータスコードの外れ値を条件として、ロードバランシングで異常なホストを排除する

Istio では、外れ値の排除率を `100`%とすることで、ステータスコードもサーキットブレイカーの条件にできる。

- Istio では、接続プールの上限を条件として、サーキットブレイカーを発動する
- Istio では、ステータスコードの外れ値を条件を `100`%とすることにより、サーキットブレイカーを発動する

> - [Istio / Traffic Management](https://istio.io/latest/docs/concepts/traffic-management/#working-with-your-applications)
> - [Configuring Fallback for Circuit Breaker, Timeout and Retry · Issue #20778 · istio/istio · GitHub](https://github.com/istio/istio/issues/20778#issuecomment-1099766930)
> - [Circuit breaking — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/circuit_breaking)
> - [Outlier detection — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/outlier)

<br>

### ヘルスチェック

#### ▼ アクティブヘルスチェック

istio-proxy は、マイクロサービスに対する kubelet のヘルスチェックを受信し、マイクロサービスに転送する。

<br>

## 05. 通信の認証/認可

### 通信の認証

#### ▼ 仕組み

Pod 間通信時、正しい送信元 Envoy の通信であることを認証する。

> - [Istio / Security](https://istio.io/latest/docs/concepts/security/#authentication-architecture)
> - [Kubernetes入門(30) Istioを使ったサービスメッシュ構築 - 特徴3：Security \| TECH+（テックプラス）](https://news.mynavi.jp/techplus/article/kubernetes-30/)

#### ▼ 相互 TLS 認証

相互 TLS 認証を実施し、送信元 Pod の通信を認証する。

> - [Istio / Security](https://istio.io/latest/docs/concepts/security/#authentication)

#### ▼ JWT による Bearer 認証 (ID プロバイダーに認証識別フェーズを委譲)

RequestAuthentication で JWT トークンを検証し、アカウントを認証する。

この場合、認証識別フェーズを ID プロバイダー (例：Auth0、AWS Cognito、GitHub、Google Cloud Auth、Keycloak、Zitadel) へ委譲し、認証検証フェーズを istio-proxy が担う。

JWT トークンの取得方法として、例えば以下の方法がある。

- 送信元 Pod が ID プロバイダーから JWT を直接取得する。
- 送信元/宛先の間に認証プロキシ (例：OAuth2 Proxy、Dex など) を配置し、認証プロキシで ID プロバイダーから JWT を取得する。

> - [Istio / Security](https://istio.io/latest/docs/concepts/security/#authentication-architecture)

#### ▼ マイクロサービスの認証について

マイクロサービス自身が実装する認証ロジックは、Istio の管理外である。

<br>

### 通信の認可

#### ▼ 仕組み

Pod 間通信時、AuthorizationPolicy を使用して、JWT トークンのアカウント属性や通信元ワークロードの SPIFFE ID などに基づいて通信を認可する。

![istio_authorization-policy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_authorization-policy.png)

> - [Istio / Security](https://istio.io/latest/docs/concepts/security/#authorization-policies)
> - https://www.styra.com/blog/authorize-better-istio-traffic-policies-with-opa-styra-das/
> - [Kubernetes入門(30) Istioを使ったサービスメッシュ構築 - 特徴3：Security \| TECH+（テックプラス）](https://news.mynavi.jp/techplus/article/kubernetes-30/)

#### ▼ 通信の認可の委譲

AuthorizationPolicy で認可プロバイダー (例：Keycloak、Open Policy Agent) を指定し、認可フェーズを委譲できる。

> - [\[Kuberntes\] 汎用OAuth2 Proxyをサービスの手前に置く：認証認可編](https://zenn.dev/takitake/articles/a91ea116cabe3c#%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3%E5%9B%B3)

#### ▼ マイクロサービスの認可について

マイクロサービス自身が実装する認可ロジックは、Istio の管理外である。

<br>

## 06. パケットのアプリケーションデータの暗号化

記入中...

<br>

## 06-02. 証明書の発行

### クライアント証明書／サーバー証明書発行

#### ▼ Istiod コントロールプレーン (`discovery` コンテナ) をルート認証局として使用する場合

デフォルトでは、Istiod コントロールプレーンがルート認証局として働く。

クライアント証明書／サーバー証明書を提供しつつ、これを定期的に自動更新する。

1. Istiod コントロールプレーンは、ルート CA 証明書を自己署名し、証明書とペアになる秘密鍵を `istio-ca-secret` (Secret) に保存する。
2. Istiod コントロールプレーンは、istio-proxy から送信された証明書署名要求をもとに、署名済みのクライアント証明書／サーバー証明書を作成する。追加設定がない場合、istio-proxy の pilot-agent プロセスが秘密鍵と証明書署名要求を自動で作成し、証明書署名要求だけを Istiod に送信する。
3. Istiod は署名済みのクライアント証明書／サーバー証明書を pilot-agent プロセスへ返し、pilot-agent プロセスの SDS-API が Envoy プロセスに配布する。
4. Istiod コントロールプレーンは、CA 証明書を持つ `istio-ca-root-cert` (ConfigMap) を自動的に作成する。`istio-ca-root-cert` は istio-proxy にマウントされ、証明書を検証するために使用する。
5. istio-proxy 間で相互 TLS 認証できるようになる。
6. 証明書の有効期限が切れる前に、istio-proxy は秘密鍵から証明書署名要求を再作成して Istiod に送信し、新しい証明書を取得する。Pod の再起動は不要である。

![istio_istio-ca-root-cert](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_istio-ca-root-cert.png)

> - [Istio / Security](https://istio.io/latest/docs/concepts/security/#pki)
> - https://developers.redhat.com/articles/2023/08/24/integrate-openshift-service-mesh-cert-manager-and-vault#default_and_pluggable_ca_scenario
> - https://www.reddit.com/r/istio/comments/x1l1sm/if_istio_caroot_certificate_expires_do_you_need/
> - [Replacing Istio CA Certificate · Zufar Dhiyaulhaq](https://zufardhiyaulhaq.com/Replacing-Istio-CA-certificate/)
> - https://training.linuxfoundation.cn/news/407

#### ▼ 外部ツールをルート認証局として使用する場合

Istiod コントロールプレーン (`discovery` コンテナ) を中間認証局として使用し、ルート認証局を Istio 以外に委譲できる。

外部のルート認証局は Istiod 用の中間 CA 証明書を発行する。Istiod は、この中間 CA 証明書を使用して、istio-proxy から送信された証明書署名要求をもとに署名済みのクライアント証明書／サーバー証明書を作成する。

- CertManager (ルート認証局、署名済み証明書の発行、マウント用 Secret への証明書埋め込み、自動ローテーション)
- HashiCorp Vault (ルート認証局) + CertManager (署名済み証明書の発行、マウント用 Secret への証明書埋め込み、自動ローテーション)

> - [Istio / Custom CA Integration using Kubernetes CSR](https://istio.io/latest/docs/tasks/security/cert-management/custom-ca-k8s/)
> - [Istio / cert-manager](https://istio.io/latest/docs/ops/integrations/certmanager/)
> - https://jimmysong.io/en/blog/cert-manager-spire-istio/

<br>

## 06-03. 証明書の認証方式

### 相互 TLS 認証

#### ▼ 相互 TLS 認証とは

相互 TLS 認証を実施し、L4/L7 通信のアプリケーションデータを暗号化/復号する。

> - [Istio / Security](https://istio.io/latest/docs/concepts/security/#authentication-architecture)

#### 暗号スイート

- TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384
- TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
- TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256
- TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
- TLS_AES_256_GCM_SHA384
- TLS_AES_128_GCM_SHA256

> - [Istio / Security](https://istio.io/latest/docs/concepts/security/#mutual-tls-authentication)

#### ▼ TLS タイムアウト

アウトバウンド通信、istio-proxy は宛先に HTTPS リクエストを送信する。

このとき、実際はタイムアウト時間を超過していても、`TLS handshake timeout` というエラーなってしまう。

<br>

## 07. テレメトリーの作成

### 他の OSS との連携

istio-proxy は、テレメトリーを作成する。

各監視ツールは、プル型で Istio Ingress/Egress Gateway、istio-proxy、Istiod からデータポイントを収集する。スパンは、istio-proxy がプッシュ型で収集ツールに送信する。

> - [Istioを活用したObservability基盤の構築と運用 / Constructing and operating the observability platform using Istio - Speaker Deck](https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=17)

<br>

## 07-02. メトリクス

### メトリクスの作成と送信

istio-proxy はメトリクスの元になるデータポイントを記録し、Prometheus は istio-proxy の `:15020/stats/prometheus` エンドポイントから収集する。Istiod は Istio 自体に関するデータポイントを記録し、Prometheus はこれも Istiod から収集する。

Prometheus は、`discovery` コンテナの `/metrics` エンドポイント (`15014` 番ポート) からメトリクスの元になるデータポイントを収集する。

なお、istio-proxy にも `/stats/prometheus` エンドポイントはある。

> - [Istio / Visualizing Metrics with Grafana](https://istio.io/latest/docs/tasks/observability/metrics/using-istio-dashboard/)
> - [Istioを活用したObservability基盤の構築と運用 / Constructing and operating the observability platform using Istio - Speaker Deck](https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=22)

<br>

### セットアップ

#### ▼ Prometheus の設定ファイル

Prometheus の設定ファイルとして定義できる。

```yaml
scrape_configs:
  # Istiod の監視
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
  # istio-proxy の監視
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

> - [Istio / Prometheus](https://istio.io/latest/docs/ops/integrations/prometheus/#option-2-customized-scraping-configurations)

#### ▼ カスタムリソースの場合

Prometheus が `discovery` コンテナからデータポイントを取得するためには、`discovery` コンテナの Pod を監視するための ServiceMonitor が必要である。

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

また、istio-proxy の監視には、PodMonitor が必要である。

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
    # istio-proxy をインジェクションしている Namespace を網羅できるようにする
    any: true
  jobLabel: envoy-stats
  podMetricsEndpoints:
    # istio-proxy コンテナが公開しているデータポイント収集用のエンドポイントを指定する
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

> - [istio/samples/addons/extras/prometheus-operator.yaml at 1.19.3 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.19.3/samples/addons/extras/prometheus-operator.yaml)
> - https://discuss.istio.io/t/scraping-istio-metrics-from-prometheus-operator-e-g-using-servicemonitor/10632
> - [Istioを活用したObservability基盤の構築と運用 / Constructing and operating the observability platform using Istio - Speaker Deck](https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=23)

<br>

### メトリクスの種類

#### ▼ Istiod 全体に関するメトリクス

| メトリクス名  | 単位     | 説明                                                                                                                                 |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `istio_build` | カウント | Istio の各コンポーネントの情報を表す。`istio_build{component="pilot"}` とすることで、Istiod コントロールプレーンの情報を取得できる。 |

#### ▼ istio-proxy に関するメトリクス

Prometheus 上でメトリクスをクエリすると、istio-proxy の `:15020/stats/prometheus` エンドポイントから収集したデータポイントを取得できる。

| メトリクス名                          | 単位     | 説明                                                                                                                                                                                    |
| ------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `istio_requests_total`                | カウント | istio-proxy が受信した総リクエスト数を表す。メトリクスの名前空間に対してさまざまなディメンションを設定できる。`<br>`・https://blog.christianposta.com/understanding-istio-telemetry-v2/ |
| `istio_request_duration_milliseconds_{bucket,count,sum}` | ミリ秒 | istio-proxy が受信したリクエストの処理時間の分布を表す。                                                                                                                                      |
| `istio_request_messages_total`        | カウント | gRPC クライアントが送信した gRPC over HTTP/2 によるリクエストの総数を表す。                                                                                                                          |
| `istio_response_messages_total`       | カウント | gRPC サーバーが返信した gRPC over HTTP/2 によるレスポンスの総数を表す。                                                                                                                          |

| `istio_request_duration_milliseconds_sum` | ミリ秒 | istio-proxy が起動以降のすべてのリクエスト期間の合計 |
| `envoy_cluster_upstream_rq_retry` | カウント | istio-proxy のほかの Pod へのリクエストに関するリトライ数を表す。 |
| `envoy_cluster_upstream_rq_retry_success` | カウント | istio-proxy が他の Pod へのリクエストに関するリトライ成功数を表す。 |
| `envoy_cluster_upstream_rq_retry_backoff_expotential` | カウント | 記入中... |
| `envoy_cluster_upstream_rq_retry_limit_exceeded` | カウント | 記入中... |

> - [Istio / Istio Standard Metrics](https://istio.io/latest/docs/reference/config/metrics/#metrics)
> - [Statistics — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/upstream/cluster_manager/cluster_stats)
> - [深入理解 Istio Metrics \| 赵化冰的博客 \| Zhaohuabing Blog](https://www.zhaohuabing.com/post/2023-02-14-istio-metrics-deep-dive/)

#### ▼ メトリクスのラベル

メトリクスをフィルタリングできるように、Istio では任意のメトリクスにデフォルトでラベルがついている。

送信元と宛先を表すメトリクスがあり、Kiali と組み合わせることにより、リクエストの送信元 Pod を特定できる。

Istio を使わないと送信元 IP アドレスで特定する必要があるが、プロキシによって書き換えられてしまうため、実際はかなり無理がある。

Istio Ingress Gateway を経由せずにサービスメッシュ外からインバウンド通信 (例えば、Prometheus や kubelet の `/metrics` スクレイピング) がくると、ラベル値が `unknown` になってしまう。

| ラベル                           | 説明                                                                           | 例                                                                                                | 注意点                                                                                                                                                                                                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `connection_security_policy`     | HTTP リクエストのセキュリティポリシーを表す。                                                       | `mutual_tls` (相互 TLS 認証)                                                                      |                                                                                                                                                                                                                                                                               |
| `destination_app`                | リクエストの宛先コンポーネントの `app` ラベル値を表す。                                           | `foo-container`                                                                                   |                                                                                                                                                                                                                                                                               |
| `destination_cluster`            | リクエストの宛先の Kubernetes Cluster 名を表す。                               | `Kubernetes`                                                                                      |                                                                                                                                                                                                                                                                               |
| `destination_service`            | リクエストの宛先ホストを表す。                                          | `foo-service.foo-namespace.svc.cluster.local`                                                       |                                                                                                                                                                                                                                                                               |
| `destination_workload`           | リクエストの宛先の Deployment 名を表す。                                       | `foo-deployment                                                                                   |                                                                                                                                                                                                                                                                               |
| `destination_workload_namespace` | 宛先コンポーネントの Namespace 名を表す。                                                  |                                                                                                   |                                                                                                                                                                                                                                                                               |
| `reporter`                       | データポイントの作成者を表す。istio-proxy か IngressGateway のいずれかである。 | ・`destination` (宛先の istio-proxy)`<br>`・`source` (送信元の IngressGateway または istio-proxy) |                                                                                                                                                                                                                                                                               |
| `response_flags`                 | Envoy の `%RESPONSE_FLAGS%` 変数を表す。                                       | `-` (値なし)                                                                                      |                                                                                                                                                                                                                                                                               |
| `response_code`                  | istio-proxy が返信したレスポンスコードの値を表す。                             | `200`、`404`、`0`                                                                                 | `reporter="source"` の場合、送信元 istio-proxy に対して、宛先 istio-proxy がマイクロサービスから受信したステータスコードを集計する。`reporter="destination"` の場合、送信元 istio-proxy に対して、宛先 istio-proxy がマイクロサービスから受信したステータスコードを集計する。 |
| `source_app`                     | 送信元コンポーネントの `app` ラベル値を表す。                                                     | `foo-container`                                                                                   |                                                                                                                                                                                                                                                                               |
| `source_cluster`                 | 送信元の Kubernetes Cluster 名を表す。                                         | `Kubernetes`                                                                                      |                                                                                                                                                                                                                                                                               |
| `source_workload`                | 送信元の Deployment 名を表す。                                                 | `foo-deployment`                                                                                  |                                                                                                                                                                                                                                                                               |

> - [Istio / Istio Standard Metrics](https://istio.io/latest/docs/reference/config/metrics/#labels)
> - [Access logging — envoy 1.40.0-dev-e07c88 documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#command-operators)
> - https://itnext.io/where-does-the-unknown-taffic-in-istio-come-from-4a9a7e4454c3

<br>

## 07-03. ログ (アクセスログのみ)

### ログの監視

#### ▼ ログの出力

istio-proxy は、マイクロサービスへのアクセスログ (インバウンド通信とアウトバウンド通信の両方) を作成し、標準出力に出力する。

アクセスログにデフォルトで役立つ値が出力される。

ログ収集ツール (例：FluentBit、Fluentd など) を DaemonSet パターンやサイドカーモードで配置し、Node や Pod 内コンテナの標準出力に出力されたログを監視バックエンドへ送信できるようにする必要がある。

```yaml
# istio-proxy コンテナのアクセスログ
{
  # 相互 TLS 認証の場合の宛先コンテナ名
  "authority": "foo-downstream:<ポート番号>",
  "bytes_received": 158,
  "bytes_sent": 224,
  "connection_termination_details": null,
  # istio-proxy コンテナにとっての送信元
  "downstream_local_address": "*.*.*.*:50010",
  "downstream_remote_address": "*.*.*.*:50011",
  # 送信元から宛先へリクエストを送信し、レスポンスを処理し終えるまでにかかった時間
  # 送信元でタイムアウト時間が超過した場合は、Envoy はその時間の直前にプロキシをやめるため、Duration はタイムアウト時間とおおよそ同じになる
  "duration": 12,
  "method": null,
  "path": null,
  "protocol": null,
  "request_id": null,
  "requested_server_name": null,
  # 宛先からのレスポンスのステータスコード
  "response_code": 200,
  "response_code_details": null,
  # ステータスコードの補足情報
  "response_flags": "-",
  "route_name": null,
  "start_time": "2023-04-12T06:11:46.996Z",
  # istio-proxy コンテナにとっての宛先
  "upstream_cluster": "outbound|50000||foo-pod.foo-namespace.svc.cluster.local",
  "upstream_host": "*.*.*.*:50000",
  "upstream_local_address": "*.*.*.*:50001",
  "upstream_service_time": null,
  "upstream_transport_failure_reason": null,
  "user_agent": null,
  "x_forwarded_for": null,
}
```

> - [Istio / Envoy Access Logs](https://istio.io/latest/docs/tasks/observability/logs/access-log/)

#### ▼ ログの送信

istio-proxy は、アクセスログをログ収集ツール (例：OpenTelemetry Collector) に送信する。

> - [Istio / OpenTelemetry](https://istio.io/latest/docs/tasks/observability/logs/otel-provider/)

<br>

## 07-04. 分散トレース

### 分散トレースの監視

#### ▼ スパンの作成

![istio_distributed_tracing](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_distributed_tracing.png)

istio-proxy は、スパンを作成する。

スパンの作成場所には、いくつか種類がある。

| スパン作成パターン   | istio-proxy | マイクロサービス |
| -------------------- | :---------: | :--------------: |
| istio-proxy のみ     |     ✅      |                  |
| マイクロサービスのみ |             |        ✅        |
| 両方                 |     ✅      |        ✅        |

スパンの作成場所が多いほど、各コンテナの処理時間が細分化された分散トレースを収集できる。

マイクロサービス間でスパンが持つコンテキストを伝播しないため、コンテキストを伝播させる実装が必要になる。

#### ▼ スパンの送信

istio-proxy は、スパンを分散トレース収集ツール (例：Jaeger Collector、OpenTelemetry Collector など) に送信する。

マイクロサービスからスパンを送信する場合であっても、istio-proxy を経由し、分散トレース収集ツールへ送信することになる。

istio-proxy から送信する場合は、MeshConfig の `extensionProviders` に分散トレース収集ツールの宛先とポートを登録する。

Envoy では宛先としてサポートしていても、istio-proxy では使用できない場合がある。(例：X-Ray デーモン)

> - [Istio / Overview](https://istio.io/latest/docs/tasks/observability/distributed-tracing/overview/)
> - [istio/samples/bookinfo/src/productpage/productpage.py at 1.14.3 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.14.3/samples/bookinfo/src/productpage/productpage.py#L180-L237)
> - [istio/samples/bookinfo/src/details/details.rb at 1.14.3 · istio/istio · GitHub](https://github.com/istio/istio/blob/1.14.3/samples/bookinfo/src/details/details.rb#L130-L187)
> - [Ability to send traces to AWS X-ray · Issue #36599 · istio/istio · GitHub](https://github.com/istio/istio/issues/36599)

<br>

### スパン名

#### ▼ EnvoyFilter の場合

Istio の設定では、EnvoyFilter を使用しないとデフォルトのスパン名を変更できない。

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: bookinfo-gateway-sampling
  namespace: istio-system
spec:
  configPatches:
    - patch:
        operation: MERGE
        value:
          decorator:
            operation: <スパン名>
```

#### ▼ OpenTelemetry Collector の場合

Istio の代わりに、OpenTelemetry Collector でスパン名を変更できる。

あらかじめ、Telemetry で `http.url.path` という属性を設定しておく。

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
```

spanprocessor を使用して、スパン名を変更する。

```yaml
# OpenTelemetry Collector の設定ファイル
config:
  processors:
    span:
      name:
        from_attributes:
          - http.method
          - http.url.path
        # GET /foo のようなスパンになる
        separator: " "
      include:
        match_type: strict
        # istio-proxy コンテナの作成したスパンのみを対象とする
        attributes:
          - key: component
            value: proxy
  service:
    pipelines:
      traces:
        processors:
          - span
```

> - [Document how to customise the tracing span names · Issue #21100 · istio/istio · GitHub](https://github.com/istio/istio/issues/21100)

<br>

### 属性

istio-proxy コンテナは、デフォルトで以下のようなスパンを作成する。

```yaml
{
  "batches":
    [
      {
        "resource":
          {
            "attributes":
              [
                {
                  "key": "telemetry.sdk.language",
                  "value": {"stringValue": "cpp"},
                },
                {
                  "key": "telemetry.sdk.name",
                  "value": {"stringValue": "envoy"},
                },
                {
                  "key": "telemetry.sdk.version",
                  "value":
                    {
                      "stringValue": "4382ac5fc1d362094bbba33283dbe60a3e1cef88/1.33.1-dev/Clean/RELEASE/BoringSSL",
                    },
                },
                {"key": "k8s.pod.ip", "value": {"stringValue": "127.0.0.6"}},
                {
                  "key": "service.name",
                  "value": {"stringValue": "reviews.bookinfo"},
                },
              ],
            "droppedAttributesCount": 0,
          },
        "instrumentationLibrarySpans": [{"spans": [
                  {
                    "traceId": "422a513f9dd13cdca4b291187d65ec69",
                    "spanId": "0241f770ee902e2d",
                    "parentSpanId": "61d22fad2b80d1dd",
                    "traceState": "",
                    "name": "proxy./ratings/0",
                    # 送信元 istio-proxy コンテナまたは宛先 istio-proxy コンテナ
                    "kind": "SPAN_KIND_CLIENT",
                    "startTimeUnixNano": 1745220839492363000,
                    "endTimeUnixNano": 1745220839934638800,
                    "attributes":
                      [
                        {
                          "key": "node_id",
                          "value":
                            {
                              "stringValue": "sidecar~10.244.1.6~reviews-v4-7586d5d46d-tgqhb.bookinfo~bookinfo.svc.cluster.local",
                            },
                        },
                        {"key": "zone", "value": {"stringValue": ""}},
                        {
                          "key": "guid:x-request-id",
                          "value":
                            {
                              "stringValue": "5457526c-0e6c-92eb-b0bd-508c75ad85c2",
                            },
                        },
                        {
                          "key": "downstream_cluster",
                          "value": {"stringValue": "-"},
                        },
                        {
                          "key": "user_agent",
                          "value":
                            {
                              "stringValue": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
                            },
                        },
                        {
                          "key": "http.protocol",
                          "value": {"stringValue": "HTTP/1.1"},
                        },
                        {
                          "key": "peer.address",
                          "value": {"stringValue": "10.244.1.6"},
                        },
                        {"key": "request_size", "value": {"stringValue": "0"}},
                        {
                          "key": "response_size",
                          "value": {"stringValue": "48"},
                        },
                        {"key": "component", "value": {"stringValue": "proxy"}},
                        {
                          "key": "upstream_cluster",
                          "value":
                            {
                              "stringValue": "outbound|9080|v3|ratings.bookinfo.svc.cluster.local",
                            },
                        },
                        {
                          "key": "upstream_cluster.name",
                          "value":
                            {
                              "stringValue": "outbound|9080|v3|ratings.bookinfo.svc.cluster.local;",
                            },
                        },
                        {
                          "key": "http.status_code",
                          "value": {"stringValue": "200"},
                        },
                        {
                          "key": "response_flags",
                          "value": {"stringValue": "-"},
                        },
                        {
                          "key": "istio.cluster_id",
                          "value": {"stringValue": "Kubernetes"},
                        },
                        {
                          "key": "istio.mesh_id",
                          "value": {"stringValue": "cluster.local"},
                        },
                        {
                          "key": "istio.namespace",
                          "value": {"stringValue": "bookinfo"},
                        },
                        {
                          "key": "istio.canonical_revision",
                          "value": {"stringValue": "v4"},
                        },
                        {
                          "key": "istio.canonical_service",
                          "value": {"stringValue": "reviews"},
                        },
                        {"key": "http.method", "value": {"stringValue": "GET"}},
                        {
                          "key": "http.url",
                          "value":
                            {"stringValue": "http://ratings:9080/ratings/0"},
                        },
                      ],
                    "droppedAttributesCount": 0,
                    "droppedEventsCount": 0,
                    "droppedLinksCount": 0,
                    "status": {"code": 0, "message": ""},
                  },
                ], "instrumentationLibrary": {"name": "envoy", "version": "4382ac5fc1d362094bbba33283dbe60a3e1cef88/1.33.1-dev/Clean/RELEASE/BoringSSL"}}],
      },
    ],
}
```

<br>
