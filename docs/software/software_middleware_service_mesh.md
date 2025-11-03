---
title: 【IT技術の知見】サービスメッシュ＠サービスメッシュ系ミドルウェア
description: サービスメッシュ＠サービスメッシュ系ミドルウェアの知見を記録しています。
---

# サービスメッシュ＠サービスメッシュ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. マイクロサービス間通信の管理

### 非メッシュ

#### ▼ 非メッシュとは

マイクロサービスアーキテクチャで、マイクロサービス間でパケットを直接的に送受信する。

しかし、マイクロサービスアーキテクチャ固有のインフラ領域の問題 (例：マイクロサービス間通信の制御、マイクロサービス間通信のセキュリティ、テレメトリー作成など) があり、非推奨である。

> - https://www.opsmx.com/blog/what-is-service-mesh-and-why-is-it-necessary/

<br>

### メッシュ

#### ▼ メッシュとは

マイクロサービスアーキテクチャで、マイクロサービス間の通信をメッシュで管理する。

サービスメッシュを導入しない場合と比較して、サービスメッシュを導入すると固有の問題を一括で制御しやすい。

マイクロサービスアーキテクチャ固有のインフラ領域の問題 (例：サービス検出の必要性、パケットのアプリケーションデータの暗号化、テレメトリー作成、認証など) を解決するためのロジックを切り分け、各マイクロサービスに共通的に提供できる。

![mesh](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/mesh.png)

> - https://solace.com/blog/event-mesh-service-mesh-for-microservices/
> - https://atmarkit.itmedia.co.jp/ait/articles/2110/15/news007.html
> - https://solace.com/what-is-an-event-mesh/

<br>

## 02. サービスメッシュ

### サービスメッシュとは

マイクロサービス間の通信方式でリクエスト−レスポンスパターンを採用する場合に使用するメッシュ。

一方のパブリッシュ/サブスクライブパターンでは、メッセージ中継システムが専用のプロトコル (例：AMQP、MQTT、Kafka独自プロトコル) を使用することが多い。

サービスメッシュツールはこれらのプロトコルに対応していないことが多く、パブリッシュ/サブスクライブパターンではイベントメッシュ (例：Knative Eventing) の方が良い。

<br>

### サービスメッシュの層

マイクロサービスアーキテクチャでは、マイクロサービスへのインバウンド通信ロジック、マイクロサービスからのアウトバウンド通信ロジック、マイクロサービスのテレメトリーの収集ロジック、必要になる。

サービスメッシュの概念が提唱される前、これらのロジックを持つライブラリを各マイクロサービスに持たせていた。

<img src="https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/drawio/blog/istio/service-mesh_layer.png" alt="service-mesh_layer" style="zoom:60%;">

サービスメッシュの概念が提唱され、アーキテクチャのインフラ層としてリバースプロキシサイドカーをインジェクションするようになった。

サービスメッシュの概念により、アプリエンジニアがこれらのロジックを意識せずに (透過的に) 、インフラ層より上層 (インターフェース層、ユースケース層、ドメイン層) の実装に注力できる。

> - https://atmarkit.itmedia.co.jp/ait/articles/2110/15/news007.html#013
> - https://www.opsmx.com/blog/what-is-service-mesh-and-why-is-it-necessary/

<br>

## 02-02. デザインパターン

### 共有ライブラリパターン

サービスメッシュが登場する前のモデル。

各マイクロサービスに共有ライブラリを配置する。

> - https://speakerdeck.com/tgraf/cilium-service-mesh-servicemeshcon-europe-2022?slide=14
> - https://isovalent.com/blog/post/2021-12-08-ebpf-servicemesh/
> - https://www.oreilly.com/library/view/mastering-api-architecture/9781492090625/ch04.html

<br>

### サイドカーパターン

#### ▼ サイドカーパターンとは

マイクロサービスのリバースプロキシをサイドカーパターンで配置し、このコンテナをコントロールプレーンで一括管理する。

マイクロサービス間の通信を透過的にする (通信の存在を感じさせない) ことを思想としている。

![service-discovery_kubernetes_vs_istio](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service-discovery_kubernetes_vs_istio.png)

> - https://www.ibm.com/blogs/think/jp-ja/cloud-native-concept-03/#servicemesh
> - https://docs.microsoft.com/ja-jp/dotnet/architecture/cloud-native/service-mesh-communication-infrastructure

#### ▼ 透過的

サイドカーパターンでマイクロサービス間の通信を透過的にするためには、自動でサイドカープロキシを経由するような仕組みが必要である。

例えば、iptablesによるサイドカープロキシへのリダイレクトがある。

> - https://docs.kernel.org/networking/tproxy.html

#### ▼ 適するリバースプロキシ

マイクロサービスアーキテクチャでは、リバースプロキシのレイテンシー (≒レスポンスタイム) が重要である。

Envoy、Nginx、HAProxy、のレイテンシーの比較では、Envoyのレイテンシーが最も小さいとの結果が出ている。

![service-mesh_sidecar-proxy_reverse-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service-mesh_sidecar-proxy_reverse-proxy.png)

> - https://www.getambassador.io/resources/envoyproxy-performance-on-k8s/

<br>

### サイドカーレスパターン

Node上にエージェントを配置し、これを経由してマイクロサービス間で通信する。

> - https://speakerdeck.com/tgraf/cilium-service-mesh-servicemeshcon-europe-2022?slide=14

<br>

### サービスメッシュの型の比較

|                                        | 共有ライブラリパターン | サイドカーパターン | サイドカーレスパターン |
| -------------------------------------- | ---------------------- | :----------------: | :--------------------: |
| Nodeのハードウェアリソース消費量       |                        |         ×          |          `⭕️`          |
| Nodeのストレージ使用量                 |                        |    `⭕️` (なし)     |           △            |
| データプレーンの冗長性                 |                        |        `⭕️`        |           △            |
| マイクロサービスごとの設定カスタマイズ |                        |        `⭕️`        |           △            |
| 単純性                                 |                        |         ×          |          `⭕️`          |

> - https://codersociety.com/blog/articles/kubernetes-logging
> - https://www.alibabacloud.com/blog/comprehensive-analysis-of-kubernetes-log-collection-principles_599411
> - https://www.reddit.com/r/kubernetes/comments/ixebxw/can_someone_explain_me_about_pros_and_cons_of/

<br>

## 03. サービスメッシュの実装

### サービスメッシュのコンポーネント

概念としてのサービスメッシュを実装する必要がある。

リバースプロキシとして動作するコンテナをサイドカーパターンで配置し、このコンテナを中央集中的に管理するように実装する。

サイドカープロキシが稼働する領域を『データプレーン』、中央集中的に管理する領域を『コントロールプレーン』という。

![service-mesh_control-plane](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service-mesh_control-plane.png)

> - https://www.xlsoft.com/jp/blog/blog/2021/09/08/post-23549/

<br>

### OSSごとの実装方法

データプレーンとコントロールプレーンの組み合わせにはさまざまある。

| OSS名   | データプレーンの実装                | コントロールプレーンの実装            | サポートしているXDS-API |
| ------- | ----------------------------------- | ------------------------------------- | ----------------------- |
| Istio   | Envoy                               | Istiod                                | 全てのXDS-API           |
| Linkerd | ビルトインプロキシ (Linkerd2-proxy) | Proxy Injector、Destination、Identity | 全てのXDS-API           |
| Consul  | ビルトインプロキシ、Envoy           | Consul-control-plane                  | 全てのXDS-API           |
| SPIRE   | Envoy                               | SPIRE                                 | SDSのみ                 |
| ...     | ...                                 | ...                                   | ...                     |

> - https://www.amazon.co.jp/dp/1492043788
> - https://speakerdeck.com/ryysud/securing-the-service-mesh-with-spire?slide=20
> - https://qiita.com/ryysud/items/bbfc730e17f53be65ce0

<br>

## 04. サービス検出

### サービス検出とは

マイクロサービスアーキテクチャにて、送信元マイクロサービスが宛先マイクロサービスの場所 (IPアドレス、ポート番号、完全修飾ドメイン名など) を動的に検出し、通信できるようにする仕組みのこと。

<br>

### サービス検出の要素

<img src="https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/drawio/blog/istio/service-discovery-pattern.png" alt="service-discovery-pattern.png" style="zoom:60%;">

サービス検出の仕組みは、次の要素からなる。

- 送信元マイクロサービス
- 宛先マイクロサービス
- サービスレジストリ
- ロードバランサー
- 名前解決 (DNSベースのサービス検出の場合のみ)

> - https://www.baeldung.com/cs/service-discovery-microservices

<br>

## 05-02. 宛先検出

### クライアントサイドパターン

#### ▼ クライアントサイドパターン

<img src="https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/drawio/blog/istio/service-discovery-pattern_client-side.png" alt="service-discovery-pattern_client-side" style="zoom:60%;">

サービスレジストリ (例：etcd) に宛先を問い合わせ、宛先にルーティングする責務は、クライアント側マイクロサービスにある。

`(1)`

: 送信元マイクロサービスは、宛先マイクロサービスの場所をサービスレジストリに問い合わせ、宛先情報を取得する。

`(2)`

: 送信元マイクロサービスは、ロードバランサーを経由して、宛先マイクロサービスにリクエストを送信する。

> - https://microservices.io/patterns/client-side-discovery.html
> - https://www.baeldung.com/cs/service-discovery-microservices
> - https://blog.bitsrc.io/service-discovery-pattern-in-microservices-55d314fac509
> - https://iximiuz.com/en/posts/service-discovery-in-kubernetes/

#### ▼ 実装方法

- Netflix Eureka

> - https://github.com/Netflix/eureka

<br>

### サーバーサイドパターン

#### ▼ サーバーサイドパターンとは

<img src="https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/drawio/blog/istio/service-discovery-pattern_server-side.png" alt="service-discovery-pattern_server-side" style="zoom:60%;">

サービスレジストリ (例：etcd) に宛先を問い合わせ、宛先にルーティングする責務が、クライアント側から切り離されている。

`(1)`

: 送信元マイクロサービスは、ロードバランサーにリクエストを送信する。

`(2)`

: ロードバランサーは、宛先マイクロサービスの場所をサービス検出に問い合わせ、宛先情報を取得する。

`(3)`

: ロードバランサーは、宛先マイクロサービスにリクエストをルーティングする。

> - https://microservices.io/patterns/server-side-discovery.html
> - https://www.baeldung.com/cs/service-discovery-microservices
> - https://iximiuz.com/en/posts/service-discovery-in-kubernetes/
> - https://blog.bitsrc.io/service-discovery-pattern-in-microservices-55d314fac509
> - https://www.north-47.com/knowledge-base/service-discovery-in-a-microservices-architecture-client-vs-service-side-discovery/

#### ▼ 実装方法

- KubernetesのServiceとkube-proxy + CoreDNS (DNSベースのサービス検出)
- サービスメッシュツール (例：Istio、Linkerdなど) のサイドカー
- サービス検出機能を持つリバースプロキシ (例：素のEnvoy、Traefikなど)
- クラウド (例：AWS ALB)

> - https://traefik.io/glossary/service-discovery/

<br>

## 05-03. 宛先登録

### セルフ登録

#### ▼ セルフ登録とは

サービスレジストリ (例：etcd) に自身を登録し、宛先を問い合わせ、宛先にルーティングする責務は、クライアント側マイクロサービスにある。

> - https://softwarepatternslexicon.com/microservices/service-discovery/self-registration/
> - https://www.codeprimers.com/service-discovery-in-microservice-architecture/

<br>

### サードパーティ登録

#### ▼ サードパーティ登録とは

記入中...

<br>

## 06. サービスメッシュの将来

- ゼロトラスト
- ハイブリッドクラウド

> - https://jimmysong.io/blog/beyond-istio-oss/#istio-future

<br>
