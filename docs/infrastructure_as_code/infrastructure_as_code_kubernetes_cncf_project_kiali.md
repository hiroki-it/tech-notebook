---
title: 【IT技術の知見】Kiali＠CNCF
description: Kiali＠CNCFの知見を記録しています。
---

# Kiali＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Kialiの仕組み

### アーキテクチャ

Kialiは、バックエンドコンポーネントとフロントエンドコンポーネントから構成されている。

![kiali_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kiali_architecture.png)

> - https://kiali.io/docs/architecture/architecture/

<br>

### バックエンドコンポーネント

#### ▼ バックエンドコンポーネントとは

バックエンドコンポーネントは、kube-apiserverからKubernetesリソース (例：Namespace、Deployment、Service、など) の情報を収集し、PrometheusからIstioのメトリクス (例：`istio_requests_total`、`istio_request_bytes_bucket`、`istio_request_bytes_count`、など) を収集する。

そのため、Kialiが必要とするメトリクスをPrometheusで事前に収集していないと、Kialiが正しく機能しない。

アーキテクチャの図中で点線は、バックエンドコンポーネントがIstiodコントロールプレーンに間接的に依存していることを表している。

> - https://kiali.io/docs/architecture/architecture/#kiali-back-end
> - https://kiali.io/docs/faq/general/#requiredmetrics

<br>

### フロントエンドコンポーネント

#### ▼ フロントエンドコンポーネントとは

フロントエンドコンポーネントは、バックエンドからデータを取得し、ダッシュボード上にサービスメッシュトポロジーを作成する。

サービスメッシュトポロジーから、マイクロサービス間の通信の依存関係や通信状況を確認できる。

その他、テレメトリー収集ツール (例：Jaeger、Grafana) と連携し、Kiali上のデータから連携先のツールのURLにリダイレクトできるようにする。

> - https://kiali.io/docs/architecture/architecture/#kiali-front-end

#### ▼ グラフ化手法

Kialiは、cytoscape.jsパッケージを使用し、『幅優先探索グラフ』や『有向グラフ』といったモデリング手法に基づいて、Istioから収集したデータポイントをグラフ化する。

> - https://github.com/kiali/kiali/tree/v1.65.0/frontend/src/components/CytoscapeGraph/graphs
> - https://blog.js.cytoscape.org/2020/05/11/layouts/#choice-of-layout

<br>

## 01-02. マニフェスト

### マニフェストの種類

Kialiは、Deployment、ConfigMap、Service、などのマニフェストから構成されている。

<br>

### Deployment配下のPod

#### ▼ 設定例

記入中...

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    app.kubernetes.io/name: kiali
  name: foo-kiali
  namespace: istio-system
spec:
  containers:
    - name: kiali
      image: quay.io/kiali/kiali:v1.60.0
      command:
        - /opt/kiali/kiali
        - '-config'
        - /kiali-configuration/config.yaml
      ports:
        - containerPort: 20001
          name: api-port
          protocol: TCP
        - containerPort: 9090
          name: http-metrics
          protocol: TCP
      volumeMounts:
        - mountPath: /kiali-configuration
          name: kiali-configuration
        - mountPath: /kiali-cert
          name: kiali-cert
        - mountPath: /kiali-secret
          name: kiali-secret
        - mountPath: /kiali-cabundle
          name: kiali-cabundle
        - mountPath: /var/run/secrets/kubernetes.io/serviceaccount
          name: kube-api-access-*****
          readOnly: "true"

  ...

```

<br>

### ConfigMap

#### ▼ 設定例

記入中...

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: foo-kiali-config-map
  namespace: istio-system
data:
  config.yaml: |
    ...
```

#### ▼ Istioとの対応

Kialiのバージョンは、Istioと対応関係にある。

Kialiのバージョンに応じたリビジョン番号のIstioを指定する。

> - https://kiali.io/docs/installation/installation-guide/prerequisites/#version-compatibility

<br>

### Service

#### ▼ 設定例

記入中...

```yaml
apiVersion: v1
kind: Service
metadata:
  name: kiali
  namespace: istio-system
spec:
  ports:
    - name: http
      port: 20001
      protocol: TCP
    - name: http-metrics
      port: 9090
      protocol: TCP
  selector:
    app.kubernetes.io/name: kiali

  ...

```

<br>

## 02. コンソールの歩き方

### Workloadsタブ

基本的には、このタブを確認する。

マイクロサービスを選ぶと、そのマイクロサービスと送受信の関係にあるマイクロサービスを表示してくれる。

<br>

### Graphタブ

#### ▼ メッシュトポロジータイプ

> - https://kiali.io/docs/features/topology/#graph-types
> - https://istio.io/latest/docs/tasks/observability/kiali/#viewing-and-editing-istio-configuration-yaml

#### ▼ Appグラフ

アプリコンテナ間 (Pod間) の通信を表示する。

#### ▼ Serviceグラフ

Virtual Service間の通信を表示する。

#### ▼ Versioned Appグラフ

バージョン付きのアプリコンテナ間 (Pod間) の通信を表示する。

#### ▼ Workloadグラフ

Workload (例：Deployment、Statefulset、など) の通信を表示する。

<br>

### プロトコル別メトリクス

#### ▼ HTTP

HTTPプロトコルに関して、インバウンド/アウトバウンド通信のレスポンスタイムやエラー率を表示する。

#### ▼ gRPC

RPCによるHTTPプロトコルに関して、インバウンド/アウトバウンド通信のレスポンスタイムやエラー率を表示する。

#### ▼ TCP

TCPスリーウェイハンドシェイクのレスポンスタイムやエラー率を表示する。

<br>

### 表示形式

#### ▼ 表示期間

デフォルトでは、最新`1`分に発生した通信しか表示しない。

そのため、表示期間を延長する。

#### ▼ Namespace

デフォルトでは、全てのNamespaceが表示されて見にくい。

そのため、アプリコンテナのNamespaceのみをフィルタリングして表示する。

#### ▼ 相互TLS認証

デフォルトでは、マイクロサービス間のいずれの通信が相互TLS認証になっているかを表示しない。

そのため、Securityバッジを有効化する。

<br>

### 汎用ラベルの意味合い

#### ▼ 表示するべき凡例

デフォルトでは、アプリコンテナ以外のコンポーネント (例：IstioのVirtual Service) が表示されて見にくい。

そのため、以下のみをフィルタリングして表示するとよい。

- Cluster囲み線
- Namespace囲み線
- レスポンスタイムと閾値 (`rt > マイクロ秒数`)

#### ▼ 囲み線

- 複数のNamespaceに`istio-proxy`コンテナをインジェクションしている場合、Serviceとマイクロサービスが`NS`とついた線で囲われる。
- 特定のマイクロサービスに複数の`subset`値 (例：`v1`、`v2`) が付与されている場合、それらが`A`とついた線で囲われる。

> - https://istio.io/v1.14/docs/tasks/observability/kiali/#generating-a-graph

<br>

### Istioのマニフェストの検証

Kialiでは、Istioのマニフェストを検証できる。

ダッシュボード (Serviceタブ、Istio Configタブ) のConfigurationがエラー表示になっていれば、マニフェストに問題があることがわかる。

> - https://istio.io/latest/docs/tasks/observability/kiali/#validating-istio-configuration

<br>

### 通信のトラブルシューティング

マイクロサービス間のレスポンスタイムやエラー率を基点として、ボトルネックになっているマイクロサービスを特定していく。

凡例で、レスポンスタイムと閾値 (`rt > マイクロ秒数`) を使用することにより、いずれのマイクロサービス間で通信に時間がかかっているのかを調査できる。

> - https://www.weave.works/blog/working-with-istio-track-your-services-with-kiali
> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#021

<br>

## 03. トレースと他のデータ間の紐付け

### 他のテレメトリーとの紐付け

#### ▼ メトリクスとの紐付け

> - https://kiali.io/docs/features/tracing/#metric-correlation

#### ▼ ログとの紐付け

> - https://kiali.io/docs/features/tracing/#logs-correlation

<br>

### サービスメッシュトポロジーとの紐付け

> - https://kiali.io/docs/features/tracing/#graph-correlation

<br>
