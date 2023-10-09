---
title: 【IT技術の知見】Istio＠CNCF
description: Istio＠CNCFの知見を記録しています。
---

# Istio＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Istioの仕組み

### サイドカープロキシメッシュ

#### ▼ Istioのサイドカープロキシメッシュとは

サイドカープロキシメッシュは、サイドカープロキシ型のサービスメッシュを実装したものである。

各PodにサイドカーとしてEnvoyを稼働させ、これが各マイクロサービスのインフラ領域の責務をに担う。

> - https://jimmysong.io/blog/beyond-istio-oss/#sidecar-management
> - https://speakerdeck.com/16yuki0702/distributed-tracing-at-openshift-meetup-tokyo20191018?slide=35
> - https://zenn.dev/riita10069/articles/service-mesh

#### ▼ 仕組み

![istio_sidecar-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_sidecar-mesh_architecture.png)

サイドカープロキシメッシュは、データプレーン、Isiodコントロールプレーン、といったコンポーネントから構成される。

サイドカープロキシを使用して、サービスメッシュを実装する。

サイドカーは、`L4` (トランスポート層) のプロトコル (例：TCP、UDP、など) と`L7` (アプリケーション層) のプロトコル (例：HTTP、HTTPS、など) を処理できる。

> - https://istio.io/latest/docs/ops/deployment/architecture/
> - https://techblog.zozo.com/entry/zozotown-istio-production-ready
> - https://www.amazon.co.jp/dp/1617295825

<br>

### アンビエントメッシュ (Nodeエージェント型のサービスメッシュ)

#### ▼ アンビエントメッシュとは

アンビエントメッシュは、Nodeエージェント型のサービスメッシュを実装したものである。

各Node上にエージェントとしてEnvoyを稼働させ、これが各マイクロサービスのインフラ領域の責務をに担う。

> - https://blog.csdn.net/cr7258/article/details/126870859
> - https://jimmysong.io/blog/beyond-istio-oss/#sidecar-management

#### ▼ 仕組み

![istio_ambient-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ambient-mesh_architecture.png)

アンビエントメッシュは、データプレーン、コントロールプレーンNode、といったコンポーネントから構成される。Node内の単一プロキシを使用して、サービスメッシュを実装する。

マイクロサービスアーキテクチャ固有のインフラ領域の問題 (例：サービスディスカバリーの必要性、マイクロサービス間通信の暗号化、テレメトリー作成、など) を解決する責務を持つ。

Node外からのインバウンド通信、またNode外へのアウトバウンド通信は、ztunnelのPodを経由して、一度waypoint-proxyのPodにリダイレクトされる。

サイドカープロキシメッシュを将来的に廃止するということはなく、好きな方を選べるようにするらしい。

ztunnelのPodを経由した段階でHTTPSプロトコルになる。

ハードウェアリソースの消費量の少ない`L4`と多い`L7`のプロコトルの処理の責務が分離されているため、サイドカープロキシメッシュと比較して、`L4`プロトコルのみを処理する場合に、Nodeのハードウェアリソース消費量を節約できる。

インバウンド時の通信の経路は以下の通りである。

```
外
⬇︎
リダイレクト
⬇︎
ztunnelのPod (L4) # DaemonSet配下のPodなので、Nodeごとにいる
⬇︎
waypointのPod (L7) # Deployment配下のPodなので、任意のNodeにいる
⬇︎
アプリコンテナのPod
```

アウトバウンド時の通信の経路は以下の通りである。

```
外
⬆︎
waypointのPod (L7) # Deployment配下なので、任意のNodeにいる
⬆︎
ztunnelのPod (L4) # DaemonSet配下なので、Nodeごとにいる
⬆︎
リダイレクト
⬆︎
アプリコンテナのPod
```

> - https://istio.io/latest/blog/2022/introducing-ambient-mesh/
> - https://istio.io/latest/blog/2022/get-started-ambient/#install-istio-with-ambient-mode
> - https://github.com/istio/istio/blob/experimental-ambient/manifests/charts/istio-control/istio-discovery/files/waypoint.yaml
> - https://www.sobyte.net/post/2022-09/istio-ambient/
> - https://www.zhaohuabing.com/post/2022-09-08-introducing-ambient-mesh/
> - https://blog.howardjohn.info/posts/ambient-not-node-proxy/

#### ▼ ztunnel

ztunnelが`L4` (トランスポート層) のプロトコル (例：TCP、UDP、など) を処理できる。

実体はDaemonSet配下のPodであり、Nodeごとにスケジューリングされている。

#### ▼ waypoint-proxy

waypoint-proxyが`L7` (アプリケーション層) のプロトコル (例：HTTP、HTTPS、など) を処理できる。

実体はDeployment配下の`envoy`コンテナを含むPodであり、任意のNodeにスケジューリングされている。

<br>

### デザインパターンの比較

| 項目                                |             サイドカープロキシメッシュ             |       アンビエントメッシュ        |
| ----------------------------------- | :------------------------------------------------: | :-------------------------------: |
| Nodeのハードウェアリソース消費量    |                         ×                          |                ⭕️                 |
| Nodeのストレージ使用量              |                         ⭕️                         |                 △                 |
| Envoyの冗長性                       |                        ⭕️️                         |                 △                 |
| アプリごとのEnvoyの設定カスタマイズ |                         ⭕️                         |                 △                 |
| 単純性                              |                         ×                          |                ⭕️                 |
| Istioのアップグレード               | インプレースアップグレード、カナリアアップグレード | DaemonSetのローリングアップデート |

<br>

## 01-02. Istioを採用するのか否か

### 設定方法の対応関係

KubernetesとIstioには重複する能力がいくつか (例：サービスディスカバリー) ある。全てのPodの`istio-proxy`コンテナをインジェクションする場合、kube-proxyとServiceによるサービスメッシュは不要になる。

ただし、実際の運用場面ではこれを行うことはなく、アプリコンテナの稼働するPodのみでこれを行えばよい。

そのため、`istio-proxy`コンテナをインジェクションしないPodでは、Istioではなく、従来のkube-proxyとServiceによるサービスディスカバリーを使用することになる。

| 能力                                         | Istio + Kubernetes + Envoy                                                                                                                                                                                                                   | Kubernetes + Envoy           | Kubernetesのみ                                      |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------- |
| サービスメッシュコントロールプレーン         | Istiodコントロールプレーン (`discovery`コンテナ)                                                                                                                                                                                             | go-control-plane             | なし                                                |
| サービスディスカバリーでのルーティング先設定 | DestinationRule                                                                                                                                                                                                                              | `route`キー                  | kube-proxy + Service                                |
| サービスディスカバリーでのリスナー値         | EnvoyFilter + EndpointSlice                                                                                                                                                                                                                  | `listener`キー               | kube-proxy + Service                                |
| サービスディスカバリーでの追加サービス設定   | ServiceEntry + EndpointSlice                                                                                                                                                                                                                 | `cluster`キー                | EndpointSlice                                       |
| Cluster外Nodeに対するサービスディスカバリー  | WorkloadEntry                                                                                                                                                                                                                                | `endpoint`キー               | Egress                                              |
| サービスレジストリ                           | etcd                                                                                                                                                                                                                                         | etcd                         | etcd                                                |
| Node外からのインバウンド通信のルーティング   | ・VirtualService + Gateway (内部的には、NodePort ServiceまたはLoadBalancer Serviceが作成され、これらはNode外からのインバウンド通信を待ち受けられるため、Ingressは不要である) <br>・Ingress + Istio Ingressコントローラー + ClusterIP Service | `route`キー + `listener`キー | Ingress + Ingressコントローラー + ClusterIP Service |

> - https://thenewstack.io/why-do-you-need-istio-when-you-already-have-kubernetes/
> - https://www.mirantis.com/blog/your-app-deserves-more-than-kubernetes-ingress-kubernetes-ingress-vs-istio-gateway-webinar/
> - https://istio.io/latest/docs/tasks/traffic-management/ingress/kubernetes-ingress/
> - https://layer5.io/learn/learning-paths/mastering-service-meshes-for-developers/introduction-to-service-meshes/istio/expose-services/

<br>

### Istioのメリット/デメリット

#### ▼ メリット

> - https://blog.container-solutions.com/wtf-is-istio
> - https://www.containiq.com/post/kubernetes-service-mesh
> - https://jimmysong.io/en/blog/why-do-you-need-istio-when-you-already-have-kubernetes/#shortcomings-of-kube-proxy
> - https://www.zhaohuabing.com/post/2019-04-16-how-to-choose-ingress-for-service-mesh-english/
> - https://www.baeldung.com/cs/service-discovery-microservices

#### ▼ デメリット

| 項目                                   | 説明                                                                                                                                                                                                                                   |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nodeのハードウェアリソースの消費量増加 | IstioのPod間通信では、Kubernetesと比べて、通信に必要なコンポーネント (例：Istiodコントロールプレーン、`istio-proxy`コンテナ) が増える。そのため、Nodeのハードウェアリソースの消費量が増え、また宛先Podからのレスポンス速度が低くなる。 |
| 学習コストの増加                       | Istioが多機能であり、学習コストが増加する。                                                                                                                                                                                            |

> - https://arxiv.org/pdf/2004.00372.pdf
> - https://www.containiq.com/post/kubernetes-service-mesh

<br>

## 02. トラフィック管理

### アウトバウンド通信の監視

#### ▼ PassthroughCluster

IPアドレスを指定した送信できる宛先のこと。

Istio 1.3以降で、デフォルトで全てのアウトバウンド通信のポリシーが`ALLOW_ANY`となり、PassthroughClusterとして扱うようになった。

AWS RDS、GCP CloudSQL、などの外部DBを使う場合、アプリからDBへのアウトバウンド通信ではDBのエンドポイントを指定することになる。

そのため、アウトバウンド通信はPassthroughClusterに属する。

注意点として、`REGISTRY_ONLY`モードを有効化すると、ServiceEntryで登録された宛先以外への全てのアウトバウンド通信がBlackHoleClusterになってしまう

> - https://istiobyexample.dev/monitoring-egress-traffic/
> - https://dev.to/hsatac/howto-find-egress-traffic-destination-in-istio-service-mesh-4l61
> - https://istio.io/latest/docs/tasks/traffic-management/egress/egress-control/#envoy-passthrough-to-external-services

#### ▼ BlackHoleCluster

IPアドレスを指定して送信できない宛先のこと。

基本的に、アウトバウンド通信は失敗し、`502`ステータスになる。

> - https://istiobyexample.dev/monitoring-egress-traffic/

<br>

## 03. 復旧性の管理

### フォールトインジェクション (障害注入)

#### ▼ フォールトインジェクションとは

障害を意図的にインジェクションし、サービスメッシュの動作を検証する。

> - https://istio.io/latest/docs/tasks/traffic-management/fault-injection/

#### ▼ テストの種類

| テスト名              | 内容                                                                                                                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Delayインジェクション | アプリコンテナに対するインバウンド通信にて、意図的に通信の遅延を発生させる。<br>- https://istio.io/latest/docs/tasks/traffic-management/fault-injection/#injecting-an-http-delay-fault |
| Abortインジェクション | アプリコンテナに対するインバウンド通信にて、意図的に通信の中止を発生させる。<br>- https://istio.io/latest/docs/tasks/traffic-management/fault-injection/#injecting-an-http-abort-fault |

<br>

### サーキットブレイカー

記入中...

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

この場合、認証フェーズをIDプロバイダー (例：Auth0、GitHub、Keycloak、AWS Cognito、GCP Auth) に委譲することになる。

JWTの取得方法として、例えば以下の方法がある。

- 送信元のPodがIDプロバイダーからJWTを直接取得する。
- 送信元/宛先の間にOAuth`2.0`プロキシ (例：oauth2-proxy、など) やSSOプロキシ(例：dex、など) を配置し、認証プロキシでIDプロバイダーからJWTを取得する。

> - https://istio.io/latest/docs/concepts/security/#authentication-architecture

#### ▼ アプリの認証について

アプリ側の認証については、Istioの管理外である。

<br>

### 通信の認可

#### ▼ 仕組み

Pod間通信時に、AuthorizationPolicyを使用して、スコープに含まれる認証済みEnvoyの通信のみを認可する。

![istio_authorization-policy.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_authorization-policy.png)

> - https://istio.io/latest/docs/concepts/security/#authorization-policies
> - https://www.styra.com/blog/authorize-better-istio-traffic-policies-with-opa-styra-das/
> - https://news.mynavi.jp/techplus/article/kubernetes-30/

#### ▼ 通信の認可の委譲

AuthorizationPolicyでIDプロバイダー (例：Auth0、GitHub、Keycloak、AWS Cognito、GCP Auth) を指定し、認可フェーズを委譲できる。

> - https://zenn.dev/takitake/articles/a91ea116cabe3c#%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3%E5%9B%B3

#### ▼ アプリの認可について

アプリ側の認可については、Istioの管理外である。

<br>

## 05. 通信データの暗号化

### 相互TLS認証

#### ▼ 相互TLS認証とは

相互TLS認証を実施し、通信データを暗号化する。

> - https://istio.io/latest/docs/concepts/security/#authentication-architecture

#### ▼ TLSタイムアウト

アウトバウンド時、`istio-proxy`コンテナは宛先にHTTPSリクエストを送信する。

この時、実際はタイムアウトであっても、`TLS handshake timeout`というエラーなってしまう。

<br>

### SSL証明書の自動更新

#### ▼ Istiodコントロールプレーン (`discovery`コンテナ) による中間認証局を使用する場合

デフォルトでは、`discovery`コンテナが中間認証局として働く。

ルート認証局を使用して、`discovery`コンテナの中間CA証明書を署名しておく必要がある。

`discovery`コンテナは、秘密鍵と証明書署名要求に基づいてSSL証明書を作成する。

KubernetesリソースにSSL証明書を提供しつつ、これを定期的に自動更新する。

> - https://istio.io/latest/docs/tasks/security/cert-management/plugin-ca-cert/
> - https://www.scsk.jp/sp/sysdig/blog/container_monitoring/kubernetes_istio.html
> - https://jimmysong.io/en/blog/istio-certificates-management/#process-for-istios-built-in-ca-to-issue-a-certificate

#### ▼ 外部の中間認証局を使用する場合

Istiodコントロールプレーン (`discovery`コンテナ) を使用する代わりに、外部の中間認証局 (例：cert-manager、自前のcustom-controller) を使用する

ルート認証局を使用して、外部中間認証局の中間CA証明書を署名しておく必要がある。

外部中間認証局は、秘密鍵と証明書署名要求に基づいてSSL証明書を作成する。

KubernetesリソースにSSL証明書を提供しつつ、これを定期的に自動更新する。

> - https://istio.io/latest/docs/tasks/security/cert-management/custom-ca-k8s/
> - https://istio.io/latest/docs/ops/integrations/certmanager/
> - https://jimmysong.io/en/blog/cert-manager-spire-istio/

<br>

## 06. テレメトリーの作成

### 他のOSSとの連携

Istio上のEnvoyは、テレメトリーを作成する。

各テレメトリー収集ツールは、プル型 (ツールがIstiodから収集) やプッシュ型 (Istiodがツールに送信) でこのテレメトリーを収集する。

> - https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=17

<br>

## 06-02. メトリクス

### メトリクスの監視

#### ▼ メトリクスの作成

Istio上のEnvoyは、メトリクスを作成する。

#### ▼ メトリクスの送信

Istio上のEnvoyは、Istiodコントロールプレーン (`discovery`コンテナ) に送信する。

Prometheusは、`discovery`コンテナの`/stats/prometheus`エンドポイント (`15090`番ポート) からメトリクスのデータポイントを収集する。

なお、`istio-proxy`コンテナにも`/stats/prometheus`エンドポイントはある。

> - https://istio.io/latest/docs/tasks/observability/metrics/using-istio-dashboard/
> - https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=22

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
| `istio_requests_total`                    | カウント | `istio-proxy`コンテナが受信した総リクエスト数を表す。メトリクスの名前空間に対して様々なディメンションを設定できる。<br>- https://blog.christianposta.com/understanding-istio-telemetry-v2/ |
| `istio_request_duration_milliseconds`     | カウント | `istio-proxy`コンテナが受信したリクエストに関して、処理の所要時間を表す。                                                                                                                  |
| `istio_request_messages_total`            | カウント | `istio-proxy`コンテナが受信した総gRPCリクエスト数を表す。                                                                                                                                  |
| `istio_response_messages_total`           | カウント | `istio-proxy`コンテナが受信した総gRPCレスポンス数を表す。                                                                                                                                  |
| `envoy_cluster_upstream_rq_retry`         | カウント | `istio-proxy`コンテナの他のPodへの通信に関する再試行数を表す。                                                                                                                             |
| `envoy_cluster_upstream_rq_retry_success` | カウント | `istio-proxy`コンテナが他のPodへの通信に関する再試行成功数を表す。                                                                                                                         |

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
| `destination_workload_namespace` | リクエストの送信元のNamespace名を表す。                                           |                                                                        |
| `reporter`                       | メトリクスの収集者を表す。`istio-proxy`コンテナかIngressGatewayのいずれかである。 | ・`destination` (`istio-proxy`コンテナ)<br>・`source` (IngressGateway) |
| `response_flags`                 | Envoyの`%RESPONSE_FLAGS%`変数を表す。                                             | `-` (値なし)                                                           |
| `response_code`                  | `istio-proxy`コンテナが返信したレスポンスコードの値を表す。                       | `200`、`404`、`0` (タイムアウトの場合)                                 |
| `source_app`                     | リクエストの送信元のコンテナ名を表す。                                            | `foo-container`                                                        |
| `source_cluster`                 | リクエストの送信元のCluster名を表す。                                             | `Kubernetes`                                                           |
| `source_workload`                | リクエストの送信元のDeployment名を表す。                                          | `foo-deployment`                                                       |

> - https://istio.io/latest/docs/reference/config/metrics/#labels

<br>

## 06-03. ログ (アクセスログのみ)

### ログの監視

#### ▼ ログの出力

Istio上のEnvoyは、アプリコンテナへのアクセスログ (インバウンド通信とアウトバウンド通信の両方) を作成し、標準出力に出力する。

アクセスログにデフォルトで役立つ値が出力される。

ログ収集ツール (例：FluentBit、Fluentd、など) をDaemonSetパターンやサイドカーパターンで配置し、NodeやPod内コンテナの標準出力に出力されたログを監視バックエンドに送信できるようにする必要がある。

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
  "duration": 12,
  "method": null,
  "path": null,
  "protocol": null,
  "request_id": null,
  "requested_server_name": null,
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

Istio上のEnvoyは、アクセスログをログ収集ツール (例：otelコレクター) に送信する。

> - https://istio.io/latest/docs/tasks/observability/logs/otel-provider/

<br>

## 06-04. 分散トレース

### 分散トレースの監視

#### ▼ スパンの作成

Istio上のEnvoyは、スパンを作成する。

ただし、アプリコンテナ間でスパンが持つコンテキストを伝播しないため、コンテキストを伝播させる実装が必要になる。

#### ▼ スパンの送信

Istio上のEnvoyは、スパンを分散トレース収集ツール (例：jaegerコレクター、otelコレクター、など) に送信する。

Envoyでは宛先として対応していても、Istio上のEnvoyでは使用できない場合がある。(例：X-rayデーモン)

> - https://istio.io/latest/docs/tasks/observability/distributed-tracing/overview/
> - https://github.com/istio/istio/blob/1.14.3/samples/bookinfo/src/productpage/productpage.py#L180-L237
> - https://github.com/istio/istio/blob/1.14.3/samples/bookinfo/src/details/details.rb#L130-L187
> - https://github.com/istio/istio/issues/36599

<br>

## 07. マルチClusterメッシュ

### マルチClusterメッシュとは

複数のClusterのネットワークを横断的に管理するサービスメッシュ。

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

### 仮想サーバー内コンテナのデータプレーン内管理

#### ▼ 同じプライベートネットワーク内の場合

仮想サーバーがコントロールプレーンNodeと同じプライベートネットワーク内に所属している場合に、この仮想サーバーに`istio-proxy`コンテナをインジェクションする。

これにより、データプレーン内で仮想サーバーを管理できるようになる。

この時、IngressGatewayを使用せずに、Kubernetes上のコンテナと仮想サーバー上のコンテナが直接的に通信できる。

![istio_multi-service-mesh_vm_same-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_multi-service-mesh_vm_same-network.png)

> - https://istio.io/latest/docs/ops/deployment/vm-architecture/

#### ▼ 異なるプライベートネットワーク内の場合

仮想サーバーがコントロールプレーンNodeと異なるプライベートネットワーク内に所属している場合に、この仮想サーバーに`istio-proxy`コンテナをインジェクションする。

これにより、データプレーン内で管理できるようになる。

この時、IngressGatewayを経由して、Kubernetes上のコンテナと仮想サーバー上のコンテナが間接的に通信できる。

![istio_multi-service-mesh_vm_difficult-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_multi-service-mesh_vm_difficult-network.png)

<br>
