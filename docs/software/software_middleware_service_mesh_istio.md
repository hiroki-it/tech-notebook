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

| 項目                                |                  サイドカーモード                  |        アンビエントモード         |
| ----------------------------------- | :------------------------------------------------: | :-------------------------------: |
| Nodeのハードウェアリソース消費量    |                         ×                          |                ⭕️                 |
| Nodeのストレージ使用量              |                         ⭕️                         |                 △                 |
| Envoyの冗長性                       |                        ⭕️️                         |                 △                 |
| アプリごとのEnvoyの設定カスタマイズ |                         ⭕️                         |                 △                 |
| 単純性                              |                         ×                          |                ⭕️                 |
| Istioのアップグレード               | インプレースアップグレード、カナリアアップグレード | DaemonSetのローリングアップデート |

<br>

## 01-02. 拡張性設計

### コントロールプレーンのパフォーマンス設計

#### ▼ CPU

- デプロイ頻度
- 設定変更頻度
- `istio-proxy`コンテナ数
- サービスメッシュのスコープ
- コントロールプレーンの冗長化数

> - https://istio.io/latest/docs/ops/deployment/performance-and-scalability/#control-plane-performance
> - https://istio.io/latest/docs/ops/configuration/mesh/configuration-scoping/

<br>

### データプレーンのパフォーマンス設計

#### ▼ CPUを消費する処理

メモリと同じように、以下の情報によって、データプレーンで必要なCPUが変わる。

- `istio-proxy`コンテナ内のEnvoyプロセスのスレッド数。スレッドが多くなるほど、これに紐づくCPUが必要になる。
- `istio-proxy`コンテナ内のEnvoyプロセスが作成するテレメトリー (ログ、メトリクス、分散トレース) のデータサイズ
- リクエストやレスポンスのデータサイズ
- 送信元の接続数
- など...

> - https://istio.io/latest/docs/ops/deployment/performance-and-scalability/#data-plane-performance

#### ▼ メモリを消費する処理

CPUと同じように、以下の情報によって、データプレーンで必要なメモリが変わる。

- `istio-proxy`コンテナ内のEnvoyプロセスのスレッド数。スレッドが多くなるほど、これに紐づくCPUが必要になる。
- `istio-proxy`コンテナ内のEnvoyプロセスが作成するテレメトリー (ログ、メトリクス、分散トレース) のデータサイズ
- リクエストやレスポンスのデータサイズ
- 送信元の接続数
- など...

特に以下でメモリが必要になる。

- `istio-proxy`コンテナ内のEnvoyプロセスが持つ宛先情報量

> - https://istio.io/latest/docs/ops/deployment/performance-and-scalability/#data-plane-performance

#### ▼ サービスメッシュ有無による違い

サービスメッシュ有無によって、ハードウェアリソース消費量に違いがある。

**例**

Istioのドキュメントでは、以下のハードウェアリソースを消費することが記載されている。

1000 rps/sの場合である。

|                          |    CPU    | メモリ |
| ------------------------ | :-------: | :----: |
| `istio-proxy`コンテナ    | 0.2 vCPU  | 60 Mi  |
| waypoint-proxyのコンテナ | 0.25 vCPU | 60 Mi  |
| ztunnelのコンテナ        | 0.06 vCPU | 12 Mi  |

> - https://istio.io/latest/docs/ops/deployment/performance-and-scalability/#sidecar-and-ztunnel-resource-usage

**例**

`istio-proxy`コンテナをインジェクションすることにより、 Podあたりで以下のハードウェアリソースが増える調査結果が出ている。

- CPU：0.0002 vCPU 〜0.0003 vCPU
- メモリ：40 Mi 〜 50 Mi

| Pod       |     | CPU (導入前) | CPU (導入後) | メモリ (導入前) | メモリ (導入後) |
| --------- | --- | :----------: | :----------: | :-------------: | :-------------: |
| Nginx     |     |    0 vCPU    | 0.0003 vCPU  |      2 Mi       |      47 Mi      |
| Database  |     | 0.0001 vCPU  | 0.0003 vCPU  |      29 Mi      |      76 Mi      |
| サービスA |     | 0.0001 vCPU  | 0.0004 vCPU  |     237 Mi      |     220 Mi      |
| サービスB |     | 0.0002 vCPU  | 0.0004 vCPU  |     219 Mi      |     288 Mi      |
| サービスC |     | 0.0002 vCPU  | 0.0004 vCPU  |     253 Mi      |     270 Mi      |
| サービスD |     | 0.0002 vCPU  | 0.0004 vCPU  |      28 Mi      |      73 Mi      |
| サービスE |     | 0.0004 vCPU  | 0.0007 vCPU  |      35 Mi      |      78 Mi      |
| サービスF |     | 0.0002 vCPU  | 0.0004 vCPU  |     230 Mi      |     270 Mi      |
| サービスG |     | 0.0003 vCPU  | 0.0006 vCPU  |      30 Mi      |      75 Mi      |
| サービスH |     | 0.0002 vCPU  | 0.0004 vCPU  |     393 Mi      |     311 Mi      |
| サービスI |     | 0.0001 vCPU  | 0.0004 vCPU  |     322 Mi      |     411 Mi      |
| 合計      |     | 0.0020 vCPU  | 0.0047 vCPU  |     1778 Mi     |     2119 Mi     |

> - https://www.alpha.co.jp/blog/202205_01/#%E4%BD%BF%E7%94%A8%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%AE%E4%B8%8A%E6%98%87

<br>

### レイテンシー (≒レスポンスタイム) の大きさ

#### ▼ レイテンシーを大きくする処理

以下により、レイテンシーは大きくなる。

- `istio-proxy`コンテナ、waypoint-proxyのコンテナ、ztunnelのコンテナの経由
- AuthorizationPolicyによるアクセストークンの署名検証
- PeerAuthenticationによる相互TLS

> - https://istio.io/latest/docs/ops/deployment/performance-and-scalability/#latency-for-istio-124
> - https://istio.io/latest/blog/2020/large-scale-security-policy-performance-tests/#conclusion

#### ▼ サービスメッシュ有無による違い

p99、1000 rps/s、240 秒間の負荷の場合である。

| 条件                                           | レイテンシー |
| ---------------------------------------------- | :----------: |
| both (送信元／宛先`istio-proxy`コンテナの両方) |   約 28 ms   |
| serveronly (宛先`istio-proxy`コンテナのみ)     |   約 13 ms   |
| baseline (`istio-proxy`コンテナなし)           |   約 3 ms    |

![istio_sidecar-mode_latency](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_sidecar-mode_latency.png)

> - https://istio.io/latest/blog/2019/performance-best-practices/

#### ▼ モードによる違い

<br>

## 02. サイドカーモード

### Istioのサイドカーモードとは

サイドカーモードは、サイドカープロキシ型のサービスメッシュを実装したものである。

各PodにサイドカーとしてEnvoyを稼働させ、これが各マイクロサービスのインフラ領域の責務をに担う。

> - https://jimmysong.io/blog/beyond-istio-oss/#sidecar-management
> - https://speakerdeck.com/16yuki0702/distributed-tracing-at-openshift-meetup-tokyo20191018?slide=35
> - https://zenn.dev/riita10069/articles/service-mesh

<br>

## 03. アンビエントモード (サイドカーレスパターン)

### アンビエントモードとは

アンビエントモードは、サイドカーレスパターンのサービスメッシュを実装したものである。

各Node上にエージェントとしてEnvoyを稼働させ、これが各マイクロサービスのインフラ領域の責務をに担う。

> - https://blog.csdn.net/cr7258/article/details/126870859
> - https://jimmysong.io/blog/beyond-istio-oss/#sidecar-management

<br>

## 03. トラフィック管理

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

## 03-02. サービスメッシュ外へのリクエスト送信

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

## 04. 回復性の管理

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

## 05. 通信の認証/認可

### 通信の認証

#### ▼ 仕組み

Pod間通信時に、正しい送信元Envoyの通信であることを認証する。

> - https://istio.io/latest/docs/concepts/security/#authentication-architecture
> - https://news.mynavi.jp/techplus/article/kubernetes-30/

#### ▼ 相互TLS認証

相互TLS認証を実施し、送信元Podの通信を認証する。

> - https://istio.io/latest/docs/concepts/security/#authentication

#### ▼ JWTによるBearer認証 (IDプロバイダーに認証フェーズを委譲)

JWTによるBearer認証を実施し、送信元Podの通信を認証する。

この場合、認証フェーズをIDプロバイダー (例：Auth0、AWS Cognito、GitHub、Google Cloud Auth、Keycloak、Zitadel) に委譲することになる。

JWT仕様トークンの取得方法として、例えば以下の方法がある。

- 送信元PodがIDプロバイダーからJWTを直接取得する。
- 送信元/宛先の間に認証プロキシ (例：OAuth2 Proxy、Dexなど) を配置し、認証プロキシでIDプロバイダーからJWTを取得する。

> - https://istio.io/latest/docs/concepts/security/#authentication-architecture

#### ▼ アプリケーションの認証について

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

AuthorizationPolicyで認可プロバイダー (例：Keycloak、OpenPolicy Agent) を指定し、認可フェーズを委譲できる。

> - https://zenn.dev/takitake/articles/a91ea116cabe3c#%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3%E5%9B%B3

#### ▼ アプリケーションの認可について

アプリ側の認可については、Istioの管理外である。

<br>

## 06. アプリケーションデータの暗号化

### 相互TLS認証

#### ▼ 相互TLS認証とは

相互TLS認証を実施し、`L7`のアプリケーションデータを暗号化/復号化する。

> - https://istio.io/latest/docs/concepts/security/#authentication-architecture

#### 暗号スイート

- TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384
- TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
- TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256
- TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
- TLS_AES_256_GCM_SHA384
- TLS_AES_128_GCM_SHA256

> - https://istio.io/latest/docs/concepts/security/#mutual-tls-authentication

#### ▼ TLSタイムアウト

アウトバウンド時、`istio-proxy`コンテナは宛先にHTTPSリクエストを送信する。

この時、実際はタイムアウトであっても、`TLS handshake timeout`というエラーなってしまう。

<br>

### クライアント証明書／SSL証明書発行

#### ▼ Istiodコントロールプレーン (`discovery`コンテナ) をルート認証局として使用する場合

デフォルトでは、Istiodコントロールプレーンがルート認証局として働く。

クライアント証明書／SSL証明書を提供しつつ、これを定期的に自動更新する。

1. Istiodコントロールプレーンは、`istio-ca-secret` (Secret) を自己署名する。
2. Istiodコントロールプレーンは、`istio-proxy`コンテナから送信された秘密鍵と証明書署名要求で署名されたクライアント証明書／SSL証明書を作成する。特に設定しなければ、`istio-proxy`コンテナのpilot-agentプロセスが、秘密鍵と証明書署名要求を自動で作成してくれる。
3. `istio-proxy`コンテナからのリクエストに応じて、IstiodのSDS-APIがクライアント証明書／SSL証明書を`istio-proxy`コンテナに配布する。
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

## 07. テレメトリーの作成

### 他のOSSとの連携

Istio上のEnvoyは、テレメトリーを作成する。

各監視ツールは、プル型 (ツールがIstiodから収集) やプッシュ型 (Istiodがツールに送信) でこのテレメトリーを収集する。

> - https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=17

<br>

## 07-02. メトリクス

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

| メトリクス名                                          | 単位     | 説明                                                                                                                                                                                           |
| ----------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `istio_requests_total`                                | カウント | `istio-proxy`コンテナが受信した総リクエスト数を表す。メトリクスの名前空間に対してさまざまなディメンションを設定できる。<br>・https://blog.christianposta.com/understanding-istio-telemetry-v2/ |
| `istio_request_duration_milliseconds`                 | カウント | `istio-proxy`コンテナが受信したリクエストに関して、処理の所要時間を表す。                                                                                                                      |
| `istio_request_messages_total`                        | カウント | `istio-proxy`コンテナが受信したgRPCによる総HTTPリクエスト数を表す。                                                                                                                            |
| `istio_response_messages_total`                       | カウント | `istio-proxy`コンテナが受信した総gRPCレスポンス数を表す。                                                                                                                                      |
| `envoy_cluster_upstream_rq_retry`                     | カウント | `istio-proxy`コンテナの他のPodへのリクエストに関する再試行数を表す。                                                                                                                           |
| `envoy_cluster_upstream_rq_retry_success`             | カウント | `istio-proxy`コンテナが他のPodへのリクエストに関する再試行成功数を表す。                                                                                                                       |
| `envoy_cluster_upstream_rq_retry_backoff_expotential` | カウント | 記入中...                                                                                                                                                                                      |
| `envoy_cluster_upstream_rq_retry_limit_exceeded`      | カウント | 記入中...                                                                                                                                                                                      |

> - https://istio.io/latest/docs/reference/config/metrics/#metrics
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/upstream/cluster_manager/cluster_stats
> - https://www.zhaohuabing.com/post/2023-02-14-istio-metrics-deep-dive/

#### ▼ メトリクスのラベル

メトリクスをフィルタリングできるように、Istioでは任意のメトリクスにデフォルトでラベルがついている。

送信元と宛先を表すメトリクスがあり、Kialiと組み合わせることにより、リクエストの送信元Podを特定できる。

Istioを使わないと送信元IPアドレスで特定する必要があるが、プロキシによって書き換えられてしまうため、実際はかなり無理がある。

| ラベル                           | 説明                                                                              | 例                                                                                                                |
| -------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `connection_security_policy`     | Pod値の通信方法を表す。                                                           | `mutual_tls` (相互TLS認証)                                                                                        |
| `destination_app`                | リクエストの宛先のコンテナ名を表す。                                              | `foo-container`                                                                                                   |
| `destination_cluster`            | リクエストの宛先のKubernetes Cluster名を表す。                                    | `Kubernetes`                                                                                                      |
| `destination_service`            | リクエストの宛先のService名を表す。                                               | `foo-service`                                                                                                     |
| `destination_workload`           | リクエストの宛先のDeployment名を表す。                                            | `foo-deployment                                                                                                   |
| `destination_workload_namespace` | 送信元のNamespace名を表す。                                                       |                                                                                                                   |
| `reporter`                       | メトリクスの収集者を表す。`istio-proxy`コンテナかIngressGatewayのいずれかである。 | ・`destination` (宛先側の`istio-proxy`コンテナ)<br>・`source` (送信元のIngressGatewayまたは`istio-proxy`コンテナ) |
| `response_flags`                 | Envoyの`%RESPONSE_FLAGS%`変数を表す。                                             | `-` (値なし)                                                                                                      |
| `response_code`                  | `istio-proxy`コンテナが返信したレスポンスコードの値を表す。                       | `200`、`404`、`0` (クライアントが切断した場合)                                                                    |
| `source_app`                     | 送信元のコンテナ名を表す。                                                        | `foo-container`                                                                                                   |
| `source_cluster`                 | 送信元のKubernetes Cluster名を表す。                                              | `Kubernetes`                                                                                                      |
| `source_workload`                | 送信元のDeployment名を表す。                                                      | `foo-deployment`                                                                                                  |

> - https://istio.io/latest/docs/reference/config/metrics/#labels

<br>

## 07-03. ログ (アクセスログのみ)

### ログの監視

#### ▼ ログの出力

Istio上のEnvoyは、アプリコンテナへのアクセスログ (インバウンド通信とアウトバウンド通信の両方) を作成し、標準出力に出力する。

アクセスログにデフォルトで役立つ値が出力される。

ログ収集ツール (例：FluentBit、Fluentdなど) をDaemonSetパターンやサイドカーモードで配置し、NodeやPod内コンテナの標準出力に出力されたログを監視バックエンドに送信できるようにする必要がある。

```yaml
# istio-proxyコンテナのアクセスログ
{
  # 相互TLSの場合の宛先コンテナ名
  "authority": "foo-downstream:<ポート番号>",
  "bytes_received": 158,
  "bytes_sent": 224,
  "connection_termination_details": null,
  # istio-proxyコンテナにとってのダウンストリーム
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
  # istio-proxyコンテナにとってのアップストリーム
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

## 07-04. 分散トレース

### 分散トレースの監視

#### ▼ スパンの作成

![istio_distributed_tracing](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_distributed_tracing.png)

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
