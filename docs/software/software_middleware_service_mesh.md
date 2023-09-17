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

しかし、マイクロサービスアーキテクチャ固有のインフラ領域の課題 (例：マイクロサービス間通信の制御、マイクロサービス間通信のセキュリティ、テレメトリー作成、など) があり、非推奨である。

> - https://www.opsmx.com/blog/what-is-service-mesh-and-why-is-it-necessary/

<br>

### メッシュ

#### ▼ メッシュとは

![mesh](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/mesh.png)

マイクロサービスアーキテクチャで、マイクロサービス間の通信をメッシュで管理する。

マイクロサービス間で直接的に通信を送受信する (サービスメッシュを導入しない) 場合と比較して、サービスメッシュを導入すると固有の課題を一括で制御しやすい。

マイクロサービスアーキテクチャ固有のインフラ領域の問題 (例：サービスディスカバリーの必要性、マイクロサービス間通信の暗号化、テレメトリー作成、など) を解決するためのロジックを切り分け、各マイクロサービスに共通的に提供できる。

> - https://solace.com/blog/event-mesh-service-mesh-for-microservices/
> - https://atmarkit.itmedia.co.jp/ait/articles/2110/15/news007.html

<br>

## 02. サービスメッシュ

### サービスメッシュとは

マイクロサービス間の通信方式でリクエストリプライ方式を採用した場合に使用するメッシュ。

<br>

### サービスメッシュの層

マイクロサービスアーキテクチャでは、マイクロサービスへのインバウンド通信ロジック、マイクロサービスからのアウトバウンド通信ロジック、マイクロサービスのテレメトリーの収集ロジック、必要になる。

サービスメッシュの概念が考案される前、これらのロジックを持つライブラリを各マイクロサービスに持たせていた。

<img src="https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service-mesh_layer.png" alt="service-mesh_layer" style="zoom:60%;">

サービスメッシュの概念が考案され、アーキテクチャのインフラストラクチャ層としてリバースプロキシサイドカーをインジェクションするようになった。

サービスメッシュの概念により、アプリケーションエンジニアがこれらのロジックを意識せずに (透過的に) 、インフラストラクチャ層より上層 (インターフェース層、ユースケース層、ドメイン層) の実装に注力できる。

> - https://atmarkit.itmedia.co.jp/ait/articles/2110/15/news007.html#013
> - https://www.opsmx.com/blog/what-is-service-mesh-and-why-is-it-necessary/

<br>

### サイドカープロキシメッシュ

#### ▼ サイドカープロキシメッシュとは

マイクロサービスのリバースプロキシをサイドカーパターンで配置し、このコンテナをコントロールプレーンで一括管理する。

マイクロサービス間の通信を透過的にする (通信の存在を感じさせない) ことを思想としている。

![service-discovery_kubernetes_vs_istio](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service-discovery_kubernetes_vs_istio.png)

> - https://www.ibm.com/blogs/think/jp-ja/cloud-native-concept-03/#servicemesh
> - https://docs.microsoft.com/ja-jp/dotnet/architecture/cloud-native/service-mesh-communication-infrastructure

#### ▼ 適するリバースプロキシ

マイクロサービスアーキテクチャでは、リバースプロキシのレイテンシー (レスポンスタイム) が重要である。

Envoy、Nginx、HAProxy、のレイテンシーの比較では、Envoyのレイテンシーが最も短いとの結果が出ている。

![service-mesh_sidecar-proxy_reverse-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service-mesh_sidecar-proxy_reverse-proxy.png)

> - https://www.getambassador.io/resources/envoyproxy-performance-on-k8s/

<br>

### Nodeエージェント型のメッシュ

記入中...

<br>

### サービスメッシュの型の比較

|                                        | サイドカープロキシメッシュ | Nodeエージェント型のメッシュ |
| -------------------------------------- | :------------------------: | :--------------------------: |
| Nodeのハードウェアリソース消費量       |             ×              |             `⭕️`             |
| Nodeのストレージ使用量                 |        `⭕️` (なし)         |              △               |
| データプレーンの冗長性                 |            `⭕️`            |              △               |
| マイクロサービスごとの設定カスタマイズ |            `⭕️`            |              △               |
| 単純性                                 |             ×              |             `⭕️`             |

> - https://codersociety.com/blog/articles/kubernetes-logging
> - https://www.alibabacloud.com/blog/comprehensive-analysis-of-kubernetes-log-collection-principles_599411
> - https://www.reddit.com/r/kubernetes/comments/ixebxw/can_someone_explain_me_about_pros_and_cons_of/

<br>

## 02-02. サービスメッシュの実装

### サービスメッシュのコンポーネント

概念としてのサービスメッシュを実装する必要がある。

リバースプロキシとして動作するコンテナをサイドカーパターンで配置し、このコンテナを中央集権的に管理するように実装する。

サイドカープロキシが稼働する領域を『データプレーン』、中央集権的に管理する領域を『コントロールプレーン』という。

![service-mesh_control-plane](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service-mesh_control-plane.png)

> - https://www.xlsoft.com/jp/blog/blog/2021/09/08/post-23549/

<br>

### OSSごとの実装方法

データプレーンとコントロールプレーンの組み合わせには様々ある。

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

## 02-03. サービスディスカバリー

### サービスディスカバリーとは

マイクロサービスアーキテクチャにて、送信元マイクロサービスが宛先マイクロサービスの場所 (IPアドレス、ポート番号、完全修飾ドメイン名、など) を動的に検出し、また同時に名前解決できるようにする仕組みのこと。

<br>

### サービスディスカバリーの要素

<img src="https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service-discovery-pattern.png" alt="service-discovery-pattern.png" style="zoom:60%;">

サービスディスカバリーの仕組みは、次の要素からなる。

- 送信元マイクロサービス
- 宛先マイクロサービス
- サービスレジストリ
- ロードバランサー
- 名前解決 (DNSベースのサービスディスカバリーの場合のみ)

> - https://www.baeldung.com/cs/service-discovery-microservices

<br>

## 02-04. デザインパターン

### クライアントサイドパターン

#### ▼ クライアントサイドパターン

<img src="https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service-discovery-pattern_client-side.png" alt="service-discovery-pattern_server-side.png" style="zoom:60%;">

サービスレジストリ (例：etcd) に問い合わせ、またルーティングする責務は、リクエストの送信元マイクロサービスにある。

`(1)`

: 送信元マイクロサービスは、宛先マイクロサービスの場所をサービスレジストリに問い合わせ、宛先情報を取得する。

`(2)`

: 送信元マイクロサービスは、ロードバランサーを介して、宛先マイクロサービスにリクエストを送信する。

> - https://microservices.io/patterns/client-side-discovery.html
> - https://www.baeldung.com/cs/service-discovery-microservices
> - https://blog.bitsrc.io/service-discovery-pattern-in-microservices-55d314fac509
> - https://iximiuz.com/en/posts/service-discovery-in-kubernetes/

#### ▼ 実装方法

- NetflixのEureka

<br>

### サーバーサイドパターン

#### ▼ サーバーサイドパターンとは

<img src="https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/service-discovery-pattern_server-side.png" alt="service-discovery-pattern_client-side.png" style="zoom:60%;">

サービスレジストリ (例：etcd) に問い合わせ、またルーティングする責務が、リクエストの送信元から切り離されている。

`(1)`

: 送信元マイクロサービスは、ロードバランサーにリクエストを送信する。

`(2)`

: ロードバランサーは、宛先マイクロサービスの場所をサービスディスカバリーに問い合わせ、宛先情報を取得する。

`(3)`

: ロードバランサーは、宛先マイクロサービスにリクエストをルーティングする。

> - https://microservices.io/patterns/server-side-discovery.html
> - https://www.baeldung.com/cs/service-discovery-microservices
> - https://iximiuz.com/en/posts/service-discovery-in-kubernetes/
> - https://blog.bitsrc.io/service-discovery-pattern-in-microservices-55d314fac509
> - https://www.north-47.com/knowledge-base/service-discovery-in-a-microservices-architecture-client-vs-service-side-discovery/

#### ▼ 実装方法

- KubernetesのServiceとkube-proxy + CoreDNS (DNSベースのサービスディスカバリー)
- サービスメッシュツール (例：Istio、Linkerd、など) のサイドカー
- サービスディスカバリー機能を持つリバースプロキシ (例：素のEnvoy、Traefik、など)

> - https://traefik.io/glossary/service-discovery/

<br>

## 03. イベントメッシュ

### イベントメッシュとは

マイクロサービス間の通信方式でイベント駆動方式を採用した場合に使用するメッシュ。

> - https://atmarkit.itmedia.co.jp/ait/articles/2110/15/news007.html#013

<br>
