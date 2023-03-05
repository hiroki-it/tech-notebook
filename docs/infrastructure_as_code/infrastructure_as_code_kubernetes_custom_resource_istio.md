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

マイクロサービスアーキテクチャ固有のインフラ領域の問題 (例：サービスディスカバリーの必要性、マイクロサービス間通信の暗号化、テレメトリー収集、など) を解決するためのロジックをサイドカーとして切り分け、各アプリコンテナに共通的に提供することができる。

> ↪️ 参考：
>
> - https://jimmysong.io/blog/beyond-istio-oss/#sidecar-management
> - https://speakerdeck.com/16yuki0702/distributed-tracing-at-openshift-meetup-tokyo20191018?slide=35
> - https://zenn.dev/riita10069/articles/service-mesh

#### ▼ 仕組み

![istio_sidecar-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_sidecar-mesh_architecture.png)

サイドカープロキシメッシュは、データプレーン、Isiodコントロールプレーン、から構成される。

サイドカープロキシを使用して、サービスメッシュを実装する。

サイドカーは、`L4` (トランスポート層) のプロトコル (例：TCP、UDP、など) と`L7` (アプリケーション層) のプロトコル (例：HTTP、HTTPS、など) を処理できる。

> ↪️ 参考：
>
> - https://istio.io/latest/docs/ops/deployment/architecture/
> - https://techblog.zozo.com/entry/zozotown-istio-production-ready
> - https://www.amazon.co.jp/dp/1617295825

<br>

### アンビエントメッシュ

#### ▼ アンビエントメッシュとは

アンビエントメッシュは、NodeのServiceAccountごとの共有エージェント型のサービスメッシュを実装したものである。

> ↪️ 参考：
>
> - https://blog.csdn.net/cr7258/article/details/126870859
> - https://jimmysong.io/blog/beyond-istio-oss/#sidecar-management

#### ▼ 仕組み

![istio_ambient-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ambient-mesh_architecture.png)

アンビエントメッシュは、データプレーン、コントロールプレーンNode、から構成される。Node内の単一プロキシを使用して、サービスメッシュを実装する。

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

### 他のサービスメッシュツールとの比較

| 能力 (執筆時点2022/08/21)                        | Istio | Linkerd | Consul | AWS App Mesh |
| ------------------------------------------------ | :---: | :-----: | :----: | :----------: |
| 能力の豊富さ                                     |  ⭕️  |    △    |   △    |  記入中...   |
| 異なるClusterのデータプレーン内管理              |  ⭕️  |    ×    |  ⭕️   |              |
| 仮想サーバーのデータプレーン内管理               |  ⭕️  |    ×    |  ⭕️   |              |
| ダッシュボード                                   |   ×   |   ⭕️   |  ⭕️   |              |
| サービスディスカバリー                           |  ⭕️  |   ⭕️   |  ⭕️   |              |
| メトリクス収集                                   |  ⭕️  |   ⭕️   |   ×    |              |
| 分散トレース収集                                 |  ⭕️  |    ×    |  ⭕️   |              |
| 相互TLS                                          |  ⭕️  |   ⭕️   |  ⭕️   |              |
| ポリシーベースのACL                              |  ⭕️  |    ×    |   ×    |              |
| 意図ベースのACL                                  |   ×   |    ×    |  ⭕️   |              |
| SSL証明書管理                                    |  ⭕️  |    ×    |  ⭕️   |              |
| HTTP/1.2、HTTP/2.0、gRPC                         |  ⭕️  |   ⭕️   |   ×    |              |
| TCP                                              |  ⭕️  |   ⭕️   |  ⭕️   |              |
| カスタムリソース                                 |  ⭕️  |   ⭕️   |   ×    |              |
| サイドカーインジェクション                       |  ⭕️  |   ⭕️   |  ⭕️   |              |
| ブルー/グリーンデプロイメント                    |  ⭕️  |    ×    |   ×    |              |
| カナリアリリース                                 |  ⭕️  |   ⭕️   |   ×    |              |
| 属性ベースのルーティング                         |  ⭕️  |    ×    |   ×    |              |
| リクエスト数制限 (レートリミット)                |  ⭕️  |   ⭕️   |   ×    |              |
| `L7` (アプリケーション層) のプロトコルを処理可能 |  ⭕️  |    ×    |   ×    |              |
| Spiffeに対応                                     |  ⭕️  |    ×    |  ⭕️   |              |
| 再試行処理                                       |  ⭕️  |   ⭕️   |   ×    |              |
| タイムアウト                                     |  ⭕️  |   ⭕️   |   ×    |              |
| サーキットブレイカー                             |  ⭕️  |    ×    |   ×    |              |
| Ingressコントローラー                            |  ⭕️  |    ×    |   ×    |              |
| Egressコントローラー                             |  ⭕️  |    ×    |   ×    |              |

> ↪️ 参考：
>
> - https://www.amazon.co.jp/dp/1492043788
> - https://servicemesh.es/

<br>

### Istio、Kubernetes、の同じ機能の比較

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

### Node外からのインバウンド通信ルーティングのパターン

#### ▼ LoadBalancer Serviceの場合

LoadBalancer Serviceを使用する場合、以下のようなネットワーク経路がある。

**＊例＊**

```
パブリックネットワーク
↓
AWS Route53
↓
AWS ALB
↓
LoadBalancer Service (Istio IngressGateway)
↓
Gateway
↓
VirtualService
↓
Service
↓
Pod
```

#### ▼ NodePort Serviceの場合

NodePort Serviceを使用する場合、以下のようなネットワーク経路がある。

**＊例＊**

```
パブリックネットワーク
↓
NodePort Service (Istio IngressGateway)
↓
Gateway
↓
VirtualService
↓
Service
↓
Pod
```

**＊例＊**

```
パブリックネットワーク
↓
AWS Route53
↓
AWS ALB
↓
NodePort Service (Istio IngressGateway)
↓
Gateway
↓
VirtualService
↓
Service
↓
Pod
```

<br>

### Istioのメリット/デメリット

#### ▼ メリット

![service-discovery_kubernetes_vs_istio](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service-discovery_kubernetes_vs_istio.png)

| 項目                           | Kubernetesのみを使用する場合                                                                                                                                                                                                                       | Istioを使用する場合                                                                                                                                                                                                                                             |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| サービスディスカバリー         | KubernetesのServiceとkube-proxyによるIPアドレスとポート番号の検出に加えて、CoreDNSによる名前解決を使用する。                                                                                                                                       | Istiodコントロールプレーンと`istio-proxy`コンテナは、サービスディスカバリーを実施する。サービスディスカバリーに必要な要素を一括でセットアップできるが、CoreDNSのセットアップは難しくないため、サービスディスカバリー単体ではメリットは少ないかもしれない。      |
| ロードバランシング             | KubernetesのServiceとkube-proxyを使用する。補足として、Serviceとkube-proxyは、同じバージョンのPodにしかロードバランシングできず、もし異なるバージョンを対象にしたい場合、異なるServiceを作成する必要がある。`L4`ロードバランサーとして使用できる。 | Istiodコントロールプレーンと`istio-proxy`コンテナは、ロードバランシングを実施する。`L4`/`L7`のロードバランサーとして使用できる。また、異なるバージョンのPodにさまざまな手法 (例：カナリア方式、トラフィックミラーリング方式、など) でロードバランシングできる。 |
| サーキットブレイカー           | Kubernetesには機能がない。                                                                                                                                                                                                                         | `istio-proxy`コンテナは、サーキットブレイカーを実施できる。                                                                                                                                                                                                     |
| 証明書                         | Podの作成に応じて、証明書のKubernetesリソース (Certificate、CertificateSigningRequest、など) を作成する。                                                                                                                                          | Istiodコントロールプレーンと`istio-proxy`コンテナは、Podの作成に応じて、証明書を自動的に設定できる。                                                                                                                                                            |
| メトリクスと分散トレースの収集 | メトリクスと分散トレースの収集ツールを個別にセットアップする。                                                                                                                                                                                     | メトリクスと分散トレースの収集ツールを一括してセットアップできる。                                                                                                                                                                                              |

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

## 02. サイドカープロキシメッシュの場合

### コンテナインジェクションの仕組み

> ↪️ 参考：https://hiroki-hasegawa.hatenablog.jp/entry/2023/01/14/223815

<br>

### サービスディスカバリーの仕組み

> ↪️ 参考：https://hiroki-hasegawa.hatenablog.jp/entry/2022/12/25/060000

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

### Faultインジェクション

#### ▼ Faultインジェクションとは

障害を意図的にインジェクションし、サービスメッシュの動作を検証する。

> ↪️ 参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/

#### ▼ テストの種類

| テスト名              | 内容                                                                                                                                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Delayインジェクション | アプリコンテナに対するインバウンド通信にて、意図的に通信の遅延を発生させる。<br>↪️ 参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/#injecting-an-http-delay-fault |
| Abortインジェクション | アプリコンテナに対するインバウンド通信にて、意図的に通信の中止を発生させる。<br>↪️ 参考：https://istio.io/latest/docs/tasks/traffic-management/fault-injection/#injecting-an-http-abort-fault |

<br>

## 03. 認証/認可の管理

### 認証

#### ▼ 仕組み

マイクロサービスアーキテクチャにおける認証にはいくつか種類がある。

そのうち、Istioは『分散型』と『ゲートウェイ分散型』の認証を実装する。

> ↪️ 参考：https://istio.io/latest/docs/concepts/security/#authentication-architecture

<br>

### 認可

#### ▼ 仕組み

> ↪️ 参考：https://istio.io/latest/docs/concepts/security/#authorization-architecture

<br>

## 04. SSL証明書の管理

### 中間認証局

#### ▼ Istiodコントロールプレーン

デフォルトでは、Istiodコントロールプレーンが中間認証局として働く。

Istiodコントロールプレーンは、SSL証明書を必要とするKubernetesリソースに証明書を提供する。

#### ▼ 外部の中間認証局

Istiodコントロールプレーンを使用する代わりに、外部の中間認証局を使用して、SSL証明書を必要とするKubernetesリソースに証明書を提供する。

- cert-manager
- カスタムコントローラー

<br>

## 05. 可観測性の管理

### 他のOSSとの連携

記入中...

> ↪️ 参考：https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=17

<br>

### メトリクス

記入中...

> ↪️ 参考：https://istio.io/latest/docs/tasks/observability/metrics/

<br>

### ログ

記入中...

> ↪️ 参考：https://istio.io/latest/docs/tasks/observability/logs/

<br>

### 分散トレース

#### ▼ メタデータ伝播 (分散コンテキスト伝播)

Istioは、分散トレースのためのメタデータを作成するが、これをアプリコンテナ間で伝播することはしない。

そのため、伝播のための実装が必要になる。

> ↪️ 参考：
>
> - https://istio.io/latest/docs/tasks/observability/distributed-tracing/overview/
> - https://github.com/istio/istio/blob/a9f4988c313b7df36f5d1da6b3b87cbe698935ae/samples/bookinfo/src/productpage/productpage.py#L180-L237
> - https://github.com/istio/istio/blob/a9f4988c313b7df36f5d1da6b3b87cbe698935ae/samples/bookinfo/src/details/details.rb#L130-L187

<br>

## 06. マルチサービスメッシュ

### マルチサービスメッシュとは

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
