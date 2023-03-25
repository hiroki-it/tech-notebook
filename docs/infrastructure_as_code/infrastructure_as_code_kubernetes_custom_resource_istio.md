---
title: 【IT技術の知見】Istio＠カスタムリソース
description: Istio＠カスタムリソースの知見を記録しています。
---

# Istio＠カスタムリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Istioの仕組み

### サイドカープロキシメッシュ

#### ▼ Istioのサイドカープロキシメッシュとは

サイドカープロキシメッシュは、サイドカープロキシ型のサービスメッシュを実装したものである。

各PodにサイドカーとしてEnvoyを稼働させ、これが各マイクロサービスのインフラ領域の責務をに担う。

> ↪️ 参考：
>
> - https://jimmysong.io/blog/beyond-istio-oss/#sidecar-management
> - https://speakerdeck.com/16yuki0702/distributed-tracing-at-openshift-meetup-tokyo20191018?slide=35
> - https://zenn.dev/riita10069/articles/service-mesh

#### ▼ 仕組み

![istio_sidecar-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_sidecar-mesh_architecture.png)

サイドカープロキシメッシュは、データプレーン、Isiodコントロールプレーン、といったコンポーネントから構成される。

サイドカープロキシを使用して、サービスメッシュを実装する。

サイドカーは、`L4` (トランスポート層) のプロトコル (例：TCP、UDP、など) と`L7` (アプリケーション層) のプロトコル (例：HTTP、HTTPS、など) を処理できる。

> ↪️ 参考：
>
> - https://istio.io/latest/docs/ops/deployment/architecture/
> - https://techblog.zozo.com/entry/zozotown-istio-production-ready
> - https://www.amazon.co.jp/dp/1617295825

<br>

### アンビエントメッシュ (Nodeエージェント方のサービスメッシュ)

#### ▼ アンビエントメッシュとは

アンビエントメッシュは、Nodeエージェント型のサービスメッシュを実装したものである。

各Node上にエージェントとしてEnvoyを稼働させ、これが各マイクロサービスのインフラ領域の責務をに担う。

> ↪️ 参考：
>
> - https://blog.csdn.net/cr7258/article/details/126870859
> - https://jimmysong.io/blog/beyond-istio-oss/#sidecar-management

#### ▼ 仕組み

![istio_ambient-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ambient-mesh_architecture.png)

アンビエントメッシュは、データプレーン、コントロールプレーンNode、といったコンポーネントから構成される。Node内の単一プロキシを使用して、サービスメッシュを実装する。

ztunnel (実体はDaemonSet配下のPod) が`L4` (トランスポート層) のプロトコル (例：TCP、UDP、など) 、またwaypoint-proxy (実体はDeployment配下のPod) が`L7` (アプリケーション層) のプロトコル (例：HTTP、HTTPS、など) を処理できる。

また、マイクロサービスアーキテクチャ固有のインフラ領域の問題 (例：サービスディスカバリーの必要性、マイクロサービス間通信の暗号化、テレメトリー作成、など) を解決する責務を持つ。

Node外からのインバウンド通信、またNode外へのアウトバウンド通信は、ztunnelのPodを経由して、一度waypoint-proxyのPodにリダイレクトされる。

ztunnelのPodを経由した段階でHTTPSプロトコルになる。ハードウェアリソースの消費量の少ない`L4`と多い`L7`のプロコトルの処理の責務が分離されているため、サイドカープロキシメッシュと比較して、`L4`のプロトコルのみを処理する場合に、Nodeのハードウェアリソース消費量を節約できる。

サイドカープロキシメッシュを将来的に廃止するということはなく、好きな方を選べるようにするらしい。

インバウンド時の通信の経路は以下の通りである。

```text
外
↓
----- Node
↓
リダイレクト
↓
ztunnelのPod (L4)
↓
waypointのPod (L7)
↓
アプリコンテナのPod
```

アウトバウンド時の通信の経路は以下の通りである。

```text
外
↑
----- Node
↑
waypointのPod (L7)
↑
ztunnelのPod (L4)
↑
リダイレクト
↑
アプリコンテナのPod
```

> ↪️ 参考：
>
> - https://istio.io/latest/blog/2022/introducing-ambient-mesh/
> - https://istio.io/latest/blog/2022/get-started-ambient/#install-istio-with-ambient-mode
> - https://github.com/istio/istio/blob/experimental-ambient/manifests/charts/istio-control/istio-discovery/files/waypoint.yaml
> - https://www.sobyte.net/post/2022-09/istio-ambient/
> - https://www.zhaohuabing.com/post/2022-09-08-introducing-ambient-mesh/

<br>

### デザインパターンの比較

| 項目                         | サイドカープロキシメッシュ                                                                                           | アンビエントメッシュ |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Istioのアップグレード        | サイドカーの再作成時に障害が起こる可能性がある。対策としては、Istioのカナリアアップグレードがある。                  |                      |
| ハードウェアリソースの消費量 | サイドカーを各Podにインジェクションすることになるため、Pod全体としての合計のハードウェアリソースの消費量が多くなる。 |                      |

<br>

## 01-02. Istioを採用するのか否か

### 設定方法の対応関係

KubernetesとIstioには重複する能力がいくつか (例：サービスディスカバリー) ある。全てのPodの`istio-proxy`コンテナをインジェクションする場合、kube-proxyとServiceによるサービスメッシュは不要になる。

ただし、実際の運用場面ではこれを行うことはなく、アプリコンテナの稼働するPodのみでこれを行えばよい。

そのため、`istio-proxy`コンテナをインジェクションしないPodでは、Istioではなく、従来のkube-proxyとServiceによるサービスディスカバリーを使用することになる。

| 能力                                         | Istio + Kubernetes + Envoy                                                                                                                                                                                                                   | Kubernetes + Envoy           | Kubernetesのみ                                      |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------- |
| サービスメッシュコントロールプレーン         | Istiodコントロールプレーン                                                                                                                                                                                                                   | go-control-plane             | なし                                                |
| サービスディスカバリーでのルーティング先設定 | DestinationRule                                                                                                                                                                                                                              | `route`キー                  | kube-proxy + Service                                |
| サービスディスカバリーでのリスナー値         | EnvoyFilter + EndpointSlice                                                                                                                                                                                                                  | `listener`キー               | kube-proxy + Service                                |
| サービスディスカバリーでの追加サービス設定   | ServiceEntry + EndpointSlice                                                                                                                                                                                                                 | `cluster`キー                | EndpointSlice                                       |
| Cluster外Nodeに対するサービスディスカバリー  | WorkloadEntry                                                                                                                                                                                                                                | `endpoint`キー               | Egress                                              |
| サービスレジストリ                           | etcd                                                                                                                                                                                                                                         | etcd                         | etcd                                                |
| Node外からのインバウンド通信のルーティング   | ・VirtualService + Gateway (内部的には、NodePort ServiceまたはLoadBalancer Serviceが作成され、これらはNode外からのインバウンド通信を待ち受けられるため、Ingressは不要である) <br>・Ingress + Istio Ingressコントローラー + ClusterIP Service | `route`キー + `listener`キー | Ingress + Ingressコントローラー + ClusterIP Service |

> ↪️ 参考：
>
> - https://thenewstack.io/why-do-you-need-istio-when-you-already-have-kubernetes/
> - https://www.mirantis.com/blog/your-app-deserves-more-than-kubernetes-ingress-kubernetes-ingress-vs-istio-gateway-webinar/
> - https://istio.io/latest/docs/tasks/traffic-management/ingress/kubernetes-ingress/
> - https://layer5.io/learn/learning-paths/mastering-service-meshes-for-developers/introduction-to-service-meshes/istio/expose-services/

<br>

### Istioのメリット/デメリット

#### ▼ メリット

> ↪️ 参考：
>
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

> ↪️ 参考：
>
> - https://arxiv.org/pdf/2004.00372.pdf
> - https://www.containiq.com/post/kubernetes-service-mesh

<br>

## 02. トラフィック管理

### アウトバウンド通信の監視

| 宛先の種類         | 説明                       | 補足                                                      |
| ------------------ | -------------------------- | --------------------------------------------------------- |
| PassthroughCluster | 明示的に設定された宛先     | `TLS Handshake timeout`となる場合、リトライが必要になる。 |
| BlackHoleCluster   | 設定されていない任意の宛先 |                                                           |
| 外部のサービス     | Clusterの外にあるサービス  | ServiceEntryで設定できる。                                |

> ↪️ 参考：https://istiobyexample.dev/monitoring-egress-traffic/

<br>

## 03. 復旧性の管理

### フォールトインジェクション (障害注入)

#### ▼ フォールトインジェクションとは

障害を意図的にインジェクションし、サービスメッシュの動作を検証する。

> ↪️ 参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/

#### ▼ テストの種類

| テスト名              | 内容                                                                                                                                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Delayインジェクション | アプリコンテナに対するインバウンド通信にて、意図的に通信の遅延を発生させる。<br>↪️ 参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/#injecting-an-http-delay-fault |
| Abortインジェクション | アプリコンテナに対するインバウンド通信にて、意図的に通信の中止を発生させる。<br>↪️ 参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/#injecting-an-http-abort-fault |

<br>

### サーキットブレイカー

記入中...

<br>

## 04. 認証/認可

### 認証

#### ▼ 仕組み

Pod間通信時に、正しい送信元Envoyであることを認証する。

> ↪️ 参考：
>
> - https://istio.io/latest/docs/concepts/security/#authentication-architecture
> - https://news.mynavi.jp/techplus/article/kubernetes-30/

#### ▼ 相互TLS認証

相互TLS認証を実施し、送信元のPodを認証する。

> ↪️ 参考：https://istio.io/latest/docs/concepts/security/#authentication-architecture

#### ▼ JWTによるBearer認証 (IDプロバイダーに認証フェーズを委譲)

JWTによるBearer認証を実施し、送信元のPodを認証する。

この場合、認証フェーズをIDプロバイダー (例：Auth0、KeyCloak、AWS Cognito、Google Auth) に委譲することになる。

JWTの取得方法として、例えば以下の方法がある。

- 送信元のPodがIDプロバイダーからJWTを直接取得する。
- 送信元/宛先の間に認証プロキシ (例：oauth2-proxy、dex、など) を配置し、認証プロキシでIDプロバイダーからJWTを取得する。

> ↪️ 参考：https://istio.io/latest/docs/concepts/security/#authentication-architecture

<br>

### 認可

#### ▼ 仕組み

Pod間通信時に、AuthorizationPolicyを使用して、スコープに含まれる認証済みEnvoyのみを認可する。

![istio_authorization-policy.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_authorization-policy.png)

> ↪️ 参考：
>
> - https://istio.io/latest/docs/concepts/security/#authorization-policies
> - https://www.styra.com/blog/authorize-better-istio-traffic-policies-with-opa-styra-das/
> - https://news.mynavi.jp/techplus/article/kubernetes-30/

#### ▼ 認可の委譲

AuthorizationPolicyでIDプロバイダー (例：Auth0、KeyCloak、AWS Cognito、Google Auth) を指定し、認可フェーズを委譲できる。

> ↪️ 参考：https://zenn.dev/takitake/articles/a91ea116cabe3c#%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3%E5%9B%B3

<br>

## 05. 通信データの暗号化

### SSL証明書のローテーション

#### ▼ Istiodコントロールプレーンによる中間認証局を使用する場合

デフォルトでは、Istiodコントロールプレーンが中間認証局として働く。

ルート認証局を使用して、Istiodコントロールプレーンの中間CA証明書を署名しておく必要がある。

Istiodコントロールプレーンは、秘密鍵と証明書署名要求に基づいてSSL証明書を作成する。

KubernetesリソースにSSL証明書を提供しつつ、これを定期的にローテーションする。

> ↪️ 参考：
>
> - https://istio.io/latest/docs/tasks/security/cert-management/plugin-ca-cert/
> - https://www.scsk.jp/sp/sysdig/blog/container_monitoring/kubernetes_istio.html

#### ▼ 外部の中間認証局を使用する場合

Istiodコントロールプレーンを使用する代わりに、外部の中間認証局 (例：cert-manager、自前のカスタムコントローラー) を使用する

ルート認証局を使用して、外部中間認証局の中間CA証明書を署名しておく必要がある。

外部中間認証局は、秘密鍵と証明書署名要求に基づいてSSL証明書を作成する。

KubernetesリソースにSSL証明書を提供しつつ、これを定期的にローテーションする。

> ↪️ 参考：
>
> - https://istio.io/latest/docs/tasks/security/cert-management/custom-ca-k8s/
> - https://istio.io/latest/docs/ops/integrations/certmanager/

<br>

## 06. テレメトリーの作成

### 他のOSSとの連携

IstioによるEnvoyは、テレメトリーを作成する。

各テレメトリー収集ツールは、プル型 (ツールがIstiodから収集) やプッシュ型 (Istiodがツールに送信) でこのテレメトリーを収集する。

> ↪️ 参考：https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=17

<br>

### メトリクス

#### ▼ Prometheus

IstioによるEnvoyは、メトリクスを作成し、Istiodコントロールプレーンに送信する。

Prometheusは、Istiodコントロールプレーンからメトリクスを収集する。

> ↪️ 参考：
>
> - https://istio.io/latest/docs/tasks/observability/metrics/using-istio-dashboard/
> - https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=22

#### ▼ `istio-proxy`コンテナに関するメトリクス

Prometheus上でメトリクスをクエリすると、Istiodコントロールプレーンから収集したメトリクスを取得できる。

| メトリクス                                                          | 単位     | 説明                                                                                                                                                                                              | アラート条件例 (合致したら発火) |
| ------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 総リクエスト数 (`istio_requests_total`)                             | カウント | `istio-proxy`コンテナが受信した総リクエスト数を表す。メトリクスの名前空間に対して様々なディメンションを設定できる。<br>↪️ 参考：https://blog.christianposta.com/understanding-istio-telemetry-v2/ |                                 |
| 総gRPCリクエスト数 (`istio_request_messages_total`)                 | カウント | `istio-proxy`コンテナが受信した総gRPCリクエスト数を表す。                                                                                                                                         |                                 |
| 総gRPCレスポンス数 (`istio_response_messages_total`)                | カウント | `istio-proxy`コンテナが受信した総gRPCレスポンス数を表す。                                                                                                                                         |                                 |
| Pod間通信リトライ数 (`envoy_cluster_upstream_rq_retry`)             | カウント | `istio-proxy`コンテナの他のPodへの通信に関するリトライ数を表す。                                                                                                                                  |                                 |
| Pod間通信リトライ成功数 (`envoy_cluster_upstream_rq_retry_success`) | カウント | `istio-proxy`コンテナが他のPodへの通信に関するリトライ成功数を表す。                                                                                                                              |

> ↪️ 参考：
>
> - https://istio.io/latest/docs/reference/config/metrics/
> - https://www.envoyproxy.io/docs/envoy/latest/configuration/upstream/cluster_manager/cluster_stats
> - https://www.zhaohuabing.com/post/2023-02-14-istio-metrics-deep-dive/

<br>

### ログ

#### ▼ 標準出力

IstioによるEnvoyは、アクセスログを作成し、標準出力に出力する。

アクセスログにデフォルトで役立つ値が出力される。

> ↪️ 参考：https://istio.io/latest/docs/tasks/observability/logs/access-log/

#### ▼ OpenTelemetryのコレクター

IstioによるEnvoyは、アクセスログを作成し、OpenTelemetryのコレクターに出力する。

> ↪️ 参考：https://istio.io/latest/docs/tasks/observability/logs/otel-provider/

<br>

### 分散トレース

#### ▼ メタデータ伝播 (分散コンテキスト伝播)

Istioは、分散トレースのためのメタデータを作成し、Jaegerに送信する。

ただし、アプリコンテナ間で伝播することはしないため、伝播の実装が必要になる。

> ↪️ 参考：
>
> - https://istio.io/latest/docs/tasks/observability/distributed-tracing/overview/
> - https://github.com/istio/istio/blob/a9f4988c313b7df36f5d1da6b3b87cbe698935ae/samples/bookinfo/src/productpage/productpage.py#L180-L237
> - https://github.com/istio/istio/blob/a9f4988c313b7df36f5d1da6b3b87cbe698935ae/samples/bookinfo/src/details/details.rb#L130-L187

<br>

## 07. マルチClusterメッシュ

### マルチClusterメッシュとは

複数のClusterのネットワークを横断的に管理するサービスメッシュ。

> ↪️ 参考：https://istio.io/latest/docs/ops/deployment/deployment-models/#multiple-meshes

<br>

### 異なるCluster内コンテナのデータプレーン内管理

#### ▼ 同じプライベートネットワーク内の場合

異なるClusterが同じプライベートネットワーク内に属している場合に、ClusterのコントロールプレーンNode間でデータプレーンを管理し合う。

これにより、この時、IngressGatewayを使用せずに、異なるClusterのコンテナが直接的に通信できる。

![istio_multi-service-mesh_cluster_same-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_multi-service-mesh_cluster_same-network.png)

> ↪️ 参考：https://zenn.dev/kuchima/articles/asm-hybrid-mesh

#### ▼ 異なるプライベートネットワーク内の場合

異なるClusterが異なるプライベートネットワーク内に属している場合に、ClusterのコントロールプレーンNode間でデータプレーンを管理し合う。

これにより、この時、IngressGatewayを経由して、異なるClusterのコンテナが間接的に通信できる。

![istio_multi-service-mesh_cluster_difficult-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_multi-service-mesh_cluster_difficult-network.png)

> ↪️ 参考：https://zenn.dev/kuchima/articles/asm-hybrid-mesh

<br>

### 仮想サーバー内コンテナのデータプレーン内管理

#### ▼ 同じプライベートネットワーク内の場合

仮想サーバーがコントロールプレーンNodeと同じプライベートネットワーク内に属している場合に、この仮想サーバーに`istio-proxy`コンテナをインジェクションする。

これにより、データプレーン内で仮想サーバーを管理できるようになる。

この時、IngressGatewayを使用せずに、Kubernetes上のコンテナと仮想サーバー上のコンテナが直接的に通信できる。

![istio_multi-service-mesh_vm_same-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_multi-service-mesh_vm_same-network.png)

> ↪️ 参考：https://istio.io/latest/docs/ops/deployment/vm-architecture/

#### ▼ 異なるプライベートネットワーク内の場合

仮想サーバーがコントロールプレーンNodeと異なるプライベートネットワーク内に属している場合に、この仮想サーバーに`istio-proxy`コンテナをインジェクションする。

これにより、データプレーン内で管理できるようになる。

この時、IngressGatewayを経由して、Kubernetes上のコンテナと仮想サーバー上のコンテナが間接的に通信できる。

![istio_multi-service-mesh_vm_difficult-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_multi-service-mesh_vm_difficult-network.png)

<br>
