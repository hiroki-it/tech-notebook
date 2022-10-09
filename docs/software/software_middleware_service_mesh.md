---
title: 【IT技術の知見】サービスメッシュ＠サービスメッシュ系ミドルウェア
description: サービスメッシュ＠サービスメッシュ系ミドルウェアの知見を記録しています。
---

# サービスメッシュ＠サービスメッシュ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. マイクロサービス間通信の管理

### 非メッシュ

#### ▼ 非メッシュとは

マイクロサービスアーキテクチャで、マイクロサービス間で通信を直接的に送受信する。しかし、以下のようなアーキテクチャ固有の問題が起こるため、非推奨である。

- マイクロサービス間通信の制御
- マイクロサービス間通信のセキュリティ
- テレメトリー収集
- など

<br>

### メッシュ

#### ▼ メッシュとは

![mesh](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/mesh.png)

マイクロサービスアーキテクチャで、マイクロサービス間の通信をメッシュで管理する。マイクロサービス間で直接的に通信を送受信する（サービスメッシュを導入しない）場合と比較して、サービスメッシュを導入すると固有の課題を一括で制御しやすい。

> ℹ️ 参考：
> 
> - https://solace.com/blog/event-mesh-service-mesh-for-microservices/
> - https://atmarkit.itmedia.co.jp/ait/articles/2110/15/news007.html

<br>

## 02. サービスメッシュ

### サービスメッシュとは

マイクロサービス間の通信方式でリクエストリプライ方式を採用した場合に使用するメッシュ。

<br>

### サービスメッシュの層

マイクロサービスアーキテクチャでは、マイクロサービスへのインバウンド通信ロジック、マイクロサービスからのアウトバウンド通信ロジック、マイクロサービスのテレメトリーの収集ロジック、必要になる。サービスメッシュの概念が考案される前、これらのロジックを持つライブラリを各マイクロサービスに持たせていた。サービスメッシュの概念が考案され、アーキテクチャのインフラストラクチャ層としてリバースプロキシサイドカーを注入するようになった。サービスメッシュの概念により、アプリケーションエンジニアがこれらのロジックを意識せずに（透過的に）、インフラストラクチャ層より上層（インターフェース層、ユースケース層、ドメイン層）の実装に注力できる。

> ℹ️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/2110/15/news007.html#013

![service-mesh_layer](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/service-mesh_layer.png)

<br>

### サイドカープロキシによるサービスメッシュ

#### ▼ サイドカープロキシによるサービスメッシュとは

![service-mesh_sidecar-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/service-mesh_sidecar-proxy.png)

マイクロサービスのリバースプロキシをサイドカーパターンで配置し、このコンテナをコントロールプレーンで一括管理する。マイクロサービス間の通信を透過的にする（通信の存在を感じさせない）ことを思想としている。

> ℹ️ 参考：
>
> - https://www.ibm.com/blogs/think/jp-ja/cloud-native-concept-03/#servicemesh
> - https://docs.microsoft.com/ja-jp/dotnet/architecture/cloud-native/service-mesh-communication-infrastructure

#### ▼ 適するリバースプロキシ

マイクロサービスアーキテクチャでは、リバースプロキシのレイテンシー（レスポンス速度）が重要である。Envoy、Nginx、HAProxy、のレイテンシーの比較では、Envoyのレイテンシーが最も短い（レスポンス速度が速い）との結果が出ている。

> ℹ️ 参考：https://www.getambassador.io/resources/envoyproxy-performance-on-k8s/

![service-mesh_sidecar-proxy_reverse-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/service-mesh_sidecar-proxy_reverse-proxy.png)

<br>

## 02-02. サービスメッシュの実装

### サービスメッシュのコンポーネント

概念としてのサービスメッシュを実装する必要がある。リバースプロキシとして動作するコンテナをサイドカーパターンで配置し、このコンテナを中央集権的に管理するように実装する。サイドカープロキシが稼働する領域を『データプレーン』、中央集権的に管理する領域を『コントロールプレーン』という。

> ℹ️ 参考：https://www.xlsoft.com/jp/blog/blog/2021/09/08/post-23549/

![service-mesh_control-plane](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/service-mesh_control-plane.png)

<br>

### OSSごとの実装方法

データプレーンとコントロールプレーンの組み合わせには様々ある。


> ℹ️ 参考：https://www.amazon.co.jp/dp/1492043788

| OSS名    | データプレーンの実装 | コントロールプレーンの実装 |
|---------| --- | --- |
| Istio   | Envoy | Istiod |
| Linkerd | ビルトインプロキシ（Linkerd2-proxy） | Proxy Injector、Destination、Identity |
| Consul  | ビルトインプロキシ、Envoy | Consul-control-plane |
| ...     | ... | ... |

<br>

## 03. イベントメッシュ

### イベントメッシュとは

マイクロサービス間の通信方式でイベント駆動方式を採用した場合に使用するメッシュ。

> ℹ️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/2110/15/news007.html#013

<br>
