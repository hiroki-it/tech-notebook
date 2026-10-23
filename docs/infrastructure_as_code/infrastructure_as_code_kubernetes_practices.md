---
title: 【IT技術の知見】プラクティス集＠Kubernetes
description: プラクティス集＠Kubernetesの知見を記録しています。
---

# プラクティス集＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. リポジトリの編成規約

### リポジトリ分割のメリット

リポジトリを分割することにより、以下のメリットがある。

- 認可スコープをリポジトリ内に閉じられるため、運用チームを別に分けられる。

<br>

### アプリと IaC を同じリポジトリで管理

アプリケーションと同じリポジトリにて、`kubernetes` ディレクトリを作成し、ここにマニフェストを配置する。

```yaml
repository/
├── app/ # アプリケーション
├── manifests/
│   └── kubernetes/
│       ├── foo/
│       │   ├── deployment.yaml
│       │   ├── service.yaml
│       │   ├── persistent-volume.yaml
│       │   └── persistent-volume-claim.yaml
│       │
...
```

<br>

### アプリと IaC を異なるリポジトリで管理 (推奨)

#### ▼ 各マイクロサービスを同じリポジトリで管理

```yaml
repository/
├── foo/ # foo サービス
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── persistent-volume.yaml
│   └── persistent-volume-claim.yaml
│
├── bar/ # bar サービス
└── baz/ # baz サービス
```

#### ▼ 各マイクロサービスを異なるリポジトリで管理

```yaml
repository/ # foo サービス
├── deployment.yaml
...
```

```yaml
repository/ # bar サービス
├── deployment.yaml
...
```

```yaml
repository/ # baz サービス
├── deployment.yaml
...
```

<br>

## 01-02. ディレクトリ構成規約

### ディレクトリ/ファイルの構成

#### ▼ マイクロサービス別

マイクロサービス別にディレクトリを作成し、Kubernetes リソースごとに異なるマニフェストを定義する。

`kubectl` コマンドの実行時にマニフェストの送信の順番を制御しにくいデメリットがある。

> - [Amazon.co.jp: Kubernetes完全ガイド 第2版 impress top gearシリーズ eBook : 青山真也: Kindleストア](https://www.amazon.co.jp/dp/B08FZX8PYW)

```yaml
repository/
├── foo/ # foo サービス
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── persistent-volume.yaml
│   └── persistent-volume-claim.yaml
│
├── bar/ # bar サービス
└── baz/ # baz サービス
```

加えて、実行環境やコンポーネント (app、db) 別に分割してもよい。

```yaml
repository/
└── foo/ # foo サービス
    ├── tes # テスト環境
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   ├── persistent-volume.yaml
    │   └── persistent-volume-claim.yaml
    │
    ├── prd # 本番環境
    └── stg # ステージング環境
```

```yaml
repository/
└── foo/ # foo サービス
    ├── app/ # app コンポーネント
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   ├── persistent-volume.yaml
    │   └── persistent-volume-claim.yaml
    │
    └── db/ # db コンポーネント
        ├── stateful-set.yaml
        ├── service.yaml
        ├── persistent-volume.yaml
        └── persistent-volume-claim.yaml
```

#### ▼ ディレクトリ無し

ディレクトリを作成しない。

代わりに、マイクロサービス別にマニフェストを定義し、関連するすべての Kubernetes リソースをこのなかで定義する。

```yaml
repository/
├── foo.yaml # foo サービス (Deployment、Service、PersistentVolume、...)
├── bar.yaml # bar サービス
└── baz.yaml # baz サービス
```

<br>

## 02. 命名規則

### Namespace の粒度

<table>
  <thead>
    <tr>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>application</code></td>
      <td>フロントエンドアプリケーション、各種マイクロサービスを置く</td>
    </tr>
    <tr>
      <td><code>batch</code></td>
      <td>バッチサービスを置く</td>
    </tr>
    <tr>
      <td><code>system</code></td>
      <td>監視サービスなどを置く</td>
    </tr>
  </tbody>
</table>

<br>

### リソース名

#### ▼ 冗長な名前が嫌いな場合

冗長な名前が嫌いな場合は `<マイクロサービス名>` とする。

基本はこれを使用する。

ケバブケースとする。

<table>
  <thead>
    <tr>
      <th>Kubernetes リソース</th>
      <th>例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Service</td>
      <td><code>foo</code></td>
    </tr>
    <tr>
      <td>Deployment</td>
      <td><code>foo</code></td>
    </tr>
    <tr>
      <td>PersistentVolume</td>
      <td><code>foo</code></td>
    </tr>
    <tr>
      <td>...</td>
      <td>...</td>
    </tr>
  </tbody>
</table>

#### ▼ 冗長な名前が嫌いでない場合

嫌いでない場合は `<マイクロサービス名>-<Kubernetesリソース名>` とする。

ケバブケースとする。

<table>
  <thead>
    <tr>
      <th>Kubernetes リソース</th>
      <th>例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Service</td>
      <td><code>foo-service</code></td>
    </tr>
    <tr>
      <td>Deployment</td>
      <td><code>foo-pod</code></td>
    </tr>
    <tr>
      <td>PersistentVolume</td>
      <td><code>foo-persistent-volume</code></td>
    </tr>
    <tr>
      <td>...</td>
      <td>...</td>
    </tr>
  </tbody>
</table>

<br>

### マニフェストのファイル名

#### ▼ 重複しない場合

ファイル名は、Kubernetes リソース名 (例：`deployment.yaml` ファイル) と同じにする。

基本的にはこれを使用する。

ケバブケースとする。

GitHub の公式チャートを見ると、命名方法が参考になる。

```yaml
repository/
├── deployment.yaml
├── service.yaml
├── persistent-volume.yaml
└── persistent-volume-claim.yaml
```

#### ▼ ファイル名重複する場合

`1` 個のディレクトリ内で Kubernetes リソースが重複する場合、Kubernetes リソース名をつけることができない。

その場合、`app.kubernetes.io` キーの値 (例：`<マイクロサービス名>` または `<マイクロサービス名>-<Kubernetesリソース名>`) と同じにする。

```yaml
# 全て Application
# 各 Application は、foo マイクロサービス、bar マイクロサービス、baz マイクロサービス、にデプロイする。
repository/
├── foo.yaml
├── bar.yaml
└── baz.yaml
```

```yaml
# 全て Application
# 各 Application は、foo マイクロサービス、bar マイクロサービス、baz マイクロサービス、にデプロイする。
repository/
├── foo-application.yaml
├── bar-application.yaml
└── baz-application.yaml
```

<br>

### 拡張子

Kubernetes に関する開発プロジェクトを確認すると、そのほとんとで、`yaml` ファイルの拡張子を `yml` ではなく `yaml` に統一している。

そこで、Kubernetes や関連技術 (Istio、Helm、Skaffold、Envoy など) の `yaml` ファイルの拡張子を `yaml` で統一する。

```yaml
repository/
├── foo/ # foo サービス
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── persistent-volume.yaml
│   └── persistent-volume-claim.yaml
│
├── bar/ # bar サービス
└── baz/ # baz サービス
```

<br>

### マニフェストの粒度

`1` 個のマニフェストに、`1` 個の Kubernetes リソースを定義する。

<br>

## 03. 実行環境

### 開発環境

#### ▼ Kubernetes の実行環境

開発環境で Kubernetes リソースの機能追加を検証するツールの例を記載する。

<table>
  <thead>
    <tr>
      <th></th>
      <th>Minikube</th>
      <th>Docker for Desktop</th>
      <th>Kind</th>
      <th>クラウドプロバイダー (Amazon EKS、Google Cloud GKE など)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>概要</td>
      <td>カスタマイズ性が高いため、カスタマイズ次第で本番環境と開発環境の差異を小さくできる。2022 年 3 月の現在では、Kubernetes の開発環境として、ベタープラクティスである。</td>
      <td>セットアップが非常に簡単 (有効化するだけ) なため、開発に取り掛かるまでが早い。</td>
      <td>セットアップが簡単なため、開発に取り掛かるまでが早い</td>
      <td>実行環境を開発環境としても使用する。開発者ごとに異なる Namespace を作成する。これを採用している企業が多い。</td>
    </tr>
    <tr>
      <td>セットアップの難易度</td>
      <td>簡単</td>
      <td>非常に簡単</td>
      <td>簡単</td>
      <td>難しい</td>
    </tr>
    <tr>
      <td>コンテナランタイム</td>
      <td>docker、containerd、cri-o</td>
      <td>docker</td>
      <td>containerd (ホスト OS の docker コンテナを作成し、このなかに containerd コンテナを作成する)</td>
      <td>docker、containerd</td>
    </tr>
    <tr>
      <td>Kubernetes のバージョン</td>
      <td>任意のバージョンを指定できる。</td>
      <td>Docker for Desktop のバージョンごとに、Kubernetes のバージョンが固定される。</td>
      <td>任意のバージョンを指定できる。</td>
      <td>任意のバージョンを指定できる。</td>
    </tr>
    <tr>
      <td>マルチ Node</td>
      <td>可能</td>
      <td>可能</td>
      <td>可能</td>
      <td>可能</td>
    </tr>
    <tr>
      <td>Node のカスタマイズ性</td>
      <td>高い</td>
      <td>低い</td>
      <td>高い</td>
      <td>高い</td>
    </tr>
    <tr>
      <td>料金</td>
      <td>無料</td>
      <td>無料</td>
      <td>無料</td>
      <td>非常に高い</td>
    </tr>
  </tbody>
</table>

> - [Using Multi-Node Clusters \| minikube](https://minikube.sigs.k8s.io/docs/tutorials/multi_node/)
> - https://codefresh.io/kubernetes-tutorial/local-kubernetes-mac-minikube-vs-docker-desktop/
> - [お手軽Kubernetesクラスタ作成ツール "kind"の紹介 - Cybozu Inside Out \| サイボウズエンジニアのブログ](https://blog.cybozu.io/entry/2019/07/03/170000)
> - [kindで軽量テスト用Kubernetesクラスタを作る＆運用する時のTIPS #Docker - Qiita](https://qiita.com/Hiroyuki_OSAKI/items/2395e6bbb98856df12f3#2%E9%87%8D%E3%81%AE%E3%82%B3%E3%83%B3%E3%83%86%E3%83%8A%E3%82%A8%E3%83%B3%E3%82%B8%E3%83%B3)

#### ▼ Kubernetes リソースの apply

<table>
  <thead>
    <tr>
      <th></th>
      <th>Skaffold</th>
      <th>Telepresence</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>概要</td>
      <td>CIOps によって、Kubernetes の開発環境に Kubernetes リソースを作成する。本番環境への CIOps は非推奨であるが、開発環境であれば問題ない。</td>
      <td>ローカルマシンに対するリクエストを、リモートにある Kubernetes の実行環境にフォワーディングする。<br>・<a href="https://thinkit.co.jp/article/17853">https://thinkit.co.jp/article/17853</a></td>
    </tr>
  </tbody>
</table>

<br>

### テスト環境、ステージング環境、本番環境

#### ▼ Kubernetes の実行環境

開発環境で検証後、Kubernetes リソースの機能追加を検証するツールの例を記載する。

<table>
  <thead>
    <tr>
      <th></th>
      <th>すべて自前</th>
      <th>オンプレ</th>
      <th>クラウド</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Kuberbetes オーケストレーションツール</td>
      <td>すべて自前なため、自由にカスタマイズできる。</td>
      <td>Kubeadm、Rancher、Kops、Kubespray、ベアメタル (例；EKS Anywhere、Anthos on Baremetal)など</td>
      <td>Amazon EKS、Google Cloud GKE など</td>
    </tr>
    <tr>
      <td>説明</td>
      <td>オンプレミス上にコントロールプレーン Node やワーカーNode となる仮想サーバーを事前に作成しておく。ユーザー自身が、Cluster を作成し、仮想サーバーにコントロールプレーン Node あるいはワーカーNode としての役割を割り当てる。</td>
      <td>オンプレミス上にコントロールプレーン Node やワーカーNode となる仮想サーバーを事前に作成しておく。ツールを使用して、仮想サーバーを Cluster に参加させ、仮想サーバーにコントロールプレーン Node あるいはワーカーNode としての役割を割り当てる。マニフェストの DB として KVS を使用する必要があるが、KVS 用クエリを RDB 用クエリに変換するツール (例：Kine) を使用すれば、RDB も使用できる。</td>
      <td>セルフマネージドワーカーNode の場合は、ワーカーNode となる仮想サーバーを事前に作成しておく。コントロールプレーン Node は必ずマネージドになる。クラウドプロバイダーを使用して、仮想サーバーを Cluster に参加させ、仮想サーバーにコントロールプレーン Node あるいはワーカーNode としての役割を割り当てる。</td>
    </tr>
    <tr>
      <td>メリット</td>
      <td>すべて自前なため、自由にカスタマイズできる。</td>
      <td>カスタマイズ性が高い。</td>
      <td>マネージドであるため、ユーザーが Kubernetes のワーカーNode を管理するコストが低い。執筆時点 (2022 年 3 月) では、Kubernetes の本番環境として、ベタープラクティスである。</td>
    </tr>
    <tr>
      <td>デメリット</td>
      <td>ユーザーが Kubernetes のワーカーNode を管理するコストが高い。</td>
      <td>ユーザーが Kubernetes のワーカーNode を管理するコストが高い。</td>
      <td>カスタマイズ性が低い</td>
    </tr>
  </tbody>
</table>

> - [Kubernetes + Ansible = Kubespray ~KubesprayからAnsibleに入門する~ - TECHSTEP](https://techstep.hatenablog.com/entry/2019/12/23/000715)
> - https://medium.com/@PlanB./on-premises-kubernetes-is-kubeadm-or-rancher-the-right-choice-c569e51773dc

#### ▼ Kubernetes リソースの apply

<table>
  <thead>
    <tr>
      <th></th>
      <th>CIOps</th>
      <th>GitOps</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>概要</td>
      <td>CIOps によって、Kubernetes の本番環境に Kubernetes リソースを作成する。非推奨である。</td>
      <td>GitOps によって、Kubernetes の本番環境に Kubernetes リソースを作成する。</td>
    </tr>
  </tbody>
</table>

#### ▼ 実行環境の分割

Cluster の複数の実行環境 (`dev-*`、`stg-*`、`prd-*`) を用意したい場合、個人的にはその分 Cluster を増やすようにする。

実行環境が `5` 個や `10` 個となってくると、Cluster の分だけアップグレードや Sync 漏れ (手動の場合) が発生するため、運用コストが高くなるというデメリットはある。

一方で、Namespace を実行環境の粒度とすると、上記のデメリットは少ない。しかし、Namespace のプレフィクスに実行環境名を付与することになり、名前が長くなってしまう。

これらを比較して、より自身に合った方法を選ぶ。

<br>

## 04. バージョンの互換性

### kube-apiserver

#### ▼ kube-apiserver が冗長化されている場合

冗長化された kube-apiserver のバージョン差は、前方の `1` 個のマイナーバージョン以内に収める必要がある。

> - [Version Skew Policy \| Kubernetes](https://kubernetes.io/releases/version-skew-policy/#kube-apiserver)

<br>

### kubectl

#### ▼ kube-apiserver の場合

`kubectl` コマンドと kube-apiserver のバージョン差は、前方/後方の `1` 個のマイナーバージョン以内に収める必要がある。

> - [Version Skew Policy \| Kubernetes](https://kubernetes.io/releases/version-skew-policy/#kubectl)

<br>

## 06. CIDR ブロックの設計

### ワーカーNode の場合

Kubernetes では、稼働する可能性のある Pod 数から、ワーカーNode の CIDR ブロックを算出するとよい。

アプリケーションの Pod がスケーリングすることや、カスタムリソース (例：Istio、Linkerd) を導入することも考慮して、尤もらしい IP アドレス数を算出できる。

削除される Pod と作成される Pod の IP アドレスを変える (IP アドレスの再利用を防ぐ) ため、Pod の最大数の `2` 倍の IP アドレスを持つ CIDR ブロックを設定するとよい。

<table>
  <thead>
    <tr>
      <th>Node 当たりの最大 Pod 数</th>
      <th>ワーカーNode 当たりの CIDR ブロック</th>
      <th>IP アドレス数</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>1</code></td>
      <td><code>/32</code></td>
      <td><code>2</code></td>
    </tr>
    <tr>
      <td><code>8</code></td>
      <td><code>/28</code></td>
      <td><code>16</code></td>
    </tr>
    <tr>
      <td><code>9</code>～<code>16</code></td>
      <td><code>/27</code></td>
      <td><code>32</code></td>
    </tr>
    <tr>
      <td><code>17</code>～<code>32</code></td>
      <td><code>/26</code></td>
      <td><code>64</code></td>
    </tr>
    <tr>
      <td><code>33</code>～<code>64</code></td>
      <td><code>/25</code></td>
      <td><code>128</code></td>
    </tr>
    <tr>
      <td><code>65</code>～<code>110</code></td>
      <td><code>/24</code></td>
      <td><code>256</code></td>
    </tr>
  </tbody>
</table>

> - [Configure maximum Pods per node \| GKE networking \| Google Cloud Documentation](https://cloud.google.com/kubernetes-engine/docs/how-to/flexible-pod-cidr)

<br>

### サブネットの場合

Amazon EKS での目安であるが、サブネットごとに `/19` や `/20` なるように設計するのが、個人的にはおすすめ。

<br>

## 07. 監視ポリシー

### メトリクスエンドポイント

Kubernetes の以下のコンポーネントが、メトリクスエンドポイント (`/metrics`) を持つ。

- kube-controller-manager
- kube-proxy
- kube-apiserver
- kube-scheduler
- kubelet

> - [Metrics For Kubernetes System Components \| Kubernetes](https://kubernetes.io/docs/concepts/cluster-administration/system-metrics/#metrics-in-kubernetes)
> - https://sysdig.jp/blog/kubernetes-metrics-ingestion/

<br>

### ハードウェアリソース系

#### ▼ ハードウェアリソース系

ハードウェアリソースの性能指標に関するメトリクスである。

収集ツールとして、Node Exporter がある。

#### ▼ Cluster

<table>
  <thead>
    <tr>
      <th>メトリクス</th>
      <th>単位</th>
      <th>説明</th>
      <th>アラート条件例 (合致したら発火)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>CPU</td>
      <td>%</td>
      <td>同じ Cluster 内のワーカーNode の CPU 使用率をデータポイントとする。</td>
      <td>・統計 : 期間内平均使用率<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 80</code></td>
    </tr>
    <tr>
      <td>Memory</td>
      <td>%</td>
      <td>同じ Cluster 内のワーカーNode のメモリ使用率をデータポイントとする。</td>
      <td>・統計 : 期間内平均使用率<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 80</code></td>
    </tr>
  </tbody>
</table>

#### ▼ Pod

<table>
  <thead>
    <tr>
      <th>メトリクス</th>
      <th>単位</th>
      <th>説明</th>
      <th>アラート条件例 (合致したら発火)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>CPU</td>
      <td>%</td>
      <td>Pod 全体の CPU 使用率をデータポイントとする。</td>
      <td>・統計 : 期間内平均使用率<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 80</code></td>
    </tr>
    <tr>
      <td>Memory</td>
      <td>%</td>
      <td>Pod 全体のメモリ使用率をデータポイントとする。</td>
      <td>・統計 : 期間内平均使用率<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 80</code></td>
    </tr>
  </tbody>
</table>

#### ▼ コンテナ

<table>
  <thead>
    <tr>
      <th>メトリクス</th>
      <th>単位</th>
      <th>説明</th>
      <th>アラート条件例 (合致したら発火)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>CPU</td>
      <td>%</td>
      <td>コンテナの CPU 使用率をデータポイントとする。</td>
      <td>・統計 : 期間内平均使用率<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 80</code></td>
    </tr>
    <tr>
      <td>Memory</td>
      <td>%</td>
      <td>コンテナのメモリ使用率をデータポイントとする。</td>
      <td>・統計 : 期間内平均使用率<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 80</code></td>
    </tr>
  </tbody>
</table>

<br>

### ネットワーク系

#### ▼ ネットワーク系

ネットワークの性能指標に関するメトリクスである。

収集ツールとして、kuebelet に内蔵された cAdvisor がある。

<table>
  <thead>
    <tr>
      <th>メトリクス</th>
      <th>単位</th>
      <th>説明</th>
      <th>アラート条件例 (合致したら発火)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>container_network_receive_bytes_total</code></td>
      <td>カウント</td>
      <td>同じ Cluster 内の受信したバイトの累積数をデータポイントとする。</td>
      <td>記入中...</td>
    </tr>
    <tr>
      <td><code>container_network_transmit_bytes_total</code></td>
      <td>カウント</td>
      <td>同じ Cluster 内の送信したバイトの累積数をデータポイントとする。</td>
      <td>記入中...</td>
    </tr>
  </tbody>
</table>

> - [Prometheus と Grafana を使用して AWS Fargate で Amazon EKS をモニタリングする \| Amazon Web Services ブログ](https://aws.amazon.com/jp/blogs/news/monitoring-amazon-eks-on-aws-fargate-using-prometheus-and-grafana/)

<br>

### 状態系

#### ▼ 状態系

状態に関するメトリクスである。

収集ツールとして、kube-state-metrics がある。

#### ▼ Cluster

Cluster をディメンションとしたメトリクスの監視ポリシーは以下の通りである。

<table>
  <thead>
    <tr>
      <th>メトリクス</th>
      <th>単位</th>
      <th>説明</th>
      <th>アラート条件例 (合致したら発火)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Node の必要最低数</td>
      <td>カウント</td>
      <td>同じ Cluster 内のワーカーNode 数の必要最低数をデータポイントとする。</td>
      <td>・統計 : 期間内合計数<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&lt;= 2</code></td>
    </tr>
    <tr>
      <td>Pod の必要最低数</td>
      <td>カウント</td>
      <td>同じ Cluster 内のワーカーNode の Pod 必要最低数をデータポイントとする。</td>
      <td>・統計 : 期間内合計数<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&lt;= 1</code></td>
    </tr>
  </tbody>
</table>

> - [Kubernetes Monitoring: 6 Tools & 6 Best Practices You Must Know](https://www.tigera.io/learn/guides/kubernetes-monitoring/)

<br>

#### ▼ Pod

Pod 全体をディメンションとしたメトリクスの監視ポリシーは以下の通りである。

<table>
  <thead>
    <tr>
      <th>メトリクス</th>
      <th>単位</th>
      <th>説明</th>
      <th>アラート条件例 (合致したら発火)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Pod の最低必要数</td>
      <td>カウント</td>
      <td>同じ Deployment 内の Pod の必要最低数をデータポイントとする。</td>
      <td>・統計 : 期間内合計数<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&lt;= 2</code></td>
    </tr>
  </tbody>
</table>

> - [Kubernetes Monitoring: 6 Tools & 6 Best Practices You Must Know](https://www.tigera.io/learn/guides/kubernetes-monitoring/)

#### ▼ コンテナ

コンテナをディメンションとしたメトリクスの監視ポリシーは以下の通りである。

<table>
  <thead>
    <tr>
      <th>メトリクス</th>
      <th>単位</th>
      <th>説明</th>
      <th>アラート条件例 (合致したら発火)</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ReadinessProbe ヘルスチェック</td>
      <td>カウント</td>
      <td>コンテナの ReadinessProbe ヘルスチェックの失敗数をデータポイントとする。</td>
      <td>・統計 : 期間内合計数<br>・期間 : <code>1</code> 分<br>・閾値 : <code>&gt;= 2</code></td>
      <td>ネットワーク由来の問題で発生することがあるため、連続的に発生したうえでアラートする。</td>
    </tr>
  </tbody>
</table>

> - [Kubernetes Monitoring: 6 Tools & 6 Best Practices You Must Know](https://www.tigera.io/learn/guides/kubernetes-monitoring/)

<br>

## 08. デバッグ

### 便利なイメージ

#### ▼ Deployment 系

Deployment が正常に Pod を作成できない場合、それだけで HelloWorld のアプリケーションを起動できるイメージがある。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo
spec:
  containers:
    - name: foo
      image: paulbouwer/hello-kubernetes:1.10
      ports:
        - containerPort: 8080
          protocol: TCP
```

> - [paulbouwer/hello-kubernetes - Docker Image](https://hub.docker.com/r/paulbouwer/hello-kubernetes/)
> - [nginx - Official Image \| Docker Hub](https://hub.docker.com/_/nginx)

#### ▼ ネットワーク系

ネットワークのトラブルシューティングに役立つツールがインストールされているイメージがある。

`kubectl debug` コマンドと組み合わせる。

```bash
$ kubectl debug node/<Node名> \
    -n default \
    -it \
    --image=praqma/network-multitool
```

> - [praqma/network-multitool - Docker Image](https://hub.docker.com/r/praqma/network-multitool)
> - [nicolaka/netshoot - Docker Image](https://hub.docker.com/r/nicolaka/netshoot)

<br>

## 09. CI パイプライン

### マニフェストのホワイトボックステスト

#### ▼ 静的解析

<table>
  <thead>
    <tr>
      <th>観点</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>マニフェストの API 仕様違反テスト</td>
      <td>外部の API 仕様違反テストツール ( (例：kubeconform) を使用する。Kubernetes リソースのスキーマに基づいて、マニフェストの API 仕様違反を検証する。</td>
      <td>・<a href="https://mixi-developers.mixi.co.jp/kubeconform-2bb477371e06">https://mixi-developers.mixi.co.jp/kubeconform-2bb477371e06</a></td>
    </tr>
    <tr>
      <td>マニフェストのコード規約違反</td>
      <td>外部の Policy as Code ツール (例：conftest、Gatekeeper CLI の gator など) を使用する。ポリシー (rego など) の定義に基づいて、そのプロダクトのコード規約違反を検証する。</td>
      <td>・<a href="https://qiita.com/Udomomo/items/10ed2dbfef85812808da#conftest%E3%81%A7policy%E3%82%92%E6%9B%B8%E3%81%84%E3%81%A6%E3%81%BF%E3%82%8B">https://qiita.com/Udomomo/items/10ed2dbfef85812808da#conftestでpolicyを書いてみる</a></td>
    </tr>
    <tr>
      <td>マニフェストのベストプラクティス違反テスト</td>
      <td>外部のベストプラクティス違反テストツール (例：polaris、kubeconform など) を使用する。報告された CVE に基づいて、チャートの実装方法に起因する脆弱性を検証する。</td>
      <td>・<a href="https://gavin-zhou.medium.com/%E3%83%99%E3%82%B9%E3%83%88%E3%83%97%E3%83%A9%E3%82%AF%E3%83%86%E3%82%A3%E3%82%B9%E3%81%A8%E3%83%9D%E3%83%AA%E3%82%B7%E3%83%BC%E3%81%AE%E3%81%9F%E3%82%81%E3%81%AEkubernetes-yaml%E3%81%AE%E3%83%90%E3%83%AA%E3%83%87%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3-%E7%AC%AC%E5%9B%9B%E7%AB%A0-bc00f1610a3">https://gavin-zhou.medium.com/ベストプラクティスとポリシーのためのkubernetes-yamlのバリデーション-第四章-bc00f1610a3</a></td>
    </tr>
    <tr>
      <td>マニフェストのバージョンテスト</td>
      <td>外部のバージョンテストツール (例：pluto、kubepug) を使用する。指定した Kubernetes のバージョンに基づいて、マニフェストのバージョン (apiVersion) を検証する。</td>
      <td>・<a href="https://zenn.dev/johnn26/articles/detect-kubernetes-deplicated-api-automatically">https://zenn.dev/johnn26/articles/detect-kubernetes-deplicated-api-automatically</a></td>
    </tr>
    <tr>
      <td>マニフェストの脆弱性診断</td>
      <td>外部の脆弱性診断ツール (例：kics) を使用する。報告された CVE に基づいて、マニフェストの実装方法に起因する脆弱性を検証する。補足として、Kubernetes リソースのセキュリティスキャン (例：trivy) は、すでに作成された Kubernetes リソースに対する検証のため、ここには含めない。</td>
      <td>・<a href="https://blog.nflabs.jp/entry/2021/12/24/091803">https://blog.nflabs.jp/entry/2021/12/24/091803</a><br>・<a href="https://weblog.grimoh.net/entry/2022/01/02/100000">https://weblog.grimoh.net/entry/2022/01/02/100000</a> <br>・<a href="https://zenn.dev/tayusa/articles/ad9fafa197888b">https://zenn.dev/tayusa/articles/ad9fafa197888b</a></td>
    </tr>
  </tbody>
</table>

<br>

### マニフェストのブラックボックステスト

#### ▼ 結合テスト

テスト環境に対して `kubectl apply` コマンドを実行することで、追加/変更を含む複数のマニフェストを組み合わせた結合テストを実施する。

#### ▼ システムテスト

テスト環境に対して `kubectl apply` コマンドを実行することで、既存機能/追加/変更を含むすべてのチャートを組み合わせたシステムテストを実施する。

> - [Advanced Test Practices For Helm Charts \| Camunda](https://camunda.com/blog/2022/03/test/)

<br>

## 09-02. CD パイプライン

### マニフェストのホワイトボックステスト

#### ▼ 静的解析

GitOps の場合、CI パイプライン上だけでなく、CD パイプライン上でもホワイトボックステストを実施できる。

ただし、kube-apiserver の validating-admission ステップ時にこれを実施する必要がある。

<table>
  <thead>
    <tr>
      <th>観点</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>マニフェストのコード規約違反</td>
      <td>外部の Policy as Code ツール (例：Gatekeeper、Kyverno) を使用する。ポリシー (rego など) の定義に基づいて、そのプロダクトのコード規約違反を検証する。</td>
      <td>・<a href="https://qiita.com/Udomomo/items/10ed2dbfef85812808da#conftest%E3%81%A7policy%E3%82%92%E6%9B%B8%E3%81%84%E3%81%A6%E3%81%BF%E3%82%8B">https://qiita.com/Udomomo/items/10ed2dbfef85812808da#conftestでpolicyを書いてみる</a></td>
    </tr>
  </tbody>
</table>

<br>

### デプロイ

#### ▼ デプロイとは

本番環境に対して、ローカルマシンまたは CD ツールを使用して、マニフェストをデプロイする。

#### ▼ インプレースデプロイメント (非推奨)

Kubernetes の Deployment の Replace 戦略を採用する。非推奨である。ダウンタイムが発生する。

> - [【Kubernetes】Recreateをやってみる](https://amateur-engineer-blog.com/kubernetes-recreate/#toc2)

#### ▼ ローリングアップデート (推奨)

Kubernetes の Deployment の RollingUpdate 戦略を採用する。

#### ▼ BG デプロイメント (推奨)

Kubernetes では、新旧 Pod と Service を組み合わせることで、擬似的なブルー/グリーンデプロイメントを実現できる。CD ツール (例：Argo Rollouts) の BG デプロイメント機能を採用してもよい。

> - [Concepts - Argo Rollouts - Kubernetes Progressive Delivery Controller](https://argoproj.github.io/argo-rollouts/concepts/#blue-green)

#### ▼ カナリアリリース (推奨)

Kubernetes では、新旧 Pod のレプリカ数の割合を調節することで、擬似的なカナリアリリースを実現できる。ただし、HTTP リクエストの振り分け率を厳密に重み付けする場合は、CD ツール (例：Argo Rollouts) やサービスメッシュツール (例：Istio、Linkerd など) のカナリアリリース機能を採用する。

注意点として、サービスメッシュツールであると、重み付けの段階的な変更が手動になってしまう。

> - [Concepts - Argo Rollouts - Kubernetes Progressive Delivery Controller](https://argoproj.github.io/argo-rollouts/concepts/#canary)

#### ▼ Progressive Delivery (推奨)

Kubernetes 自体は Progressive Delivery の能力を持たない。CD ツール (例：Argo Rollouts) の Progressive Delivery 機能を採用する。

> - [Concepts - Argo Rollouts - Kubernetes Progressive Delivery Controller](https://argoproj.github.io/argo-rollouts/concepts/#progressive-delivery)

<br>

### ロールバック

<table>
  <thead>
    <tr>
      <th>デプロイ方法の採用状況</th>
      <th>方法</th>
      <th style="text-align:center">推奨/非推奨</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Deployment の RollingUpdate 戦略を採用している場合</td>
      <td>過去のリリースタグ (リビジョン) を再デプロイする。あるいは GitHub によるコミットのリバートを使用し、現在のコミットを打ち消すコミットを作成し、PR を作成する。</td>
      <td style="text-align:center">非推奨</td>
    </tr>
    <tr>
      <td>CD ツールの BG デプロイメントを採用している場合</td>
      <td>削除せずに残してある現環境に再ルーティングする。手順は、CD ツールによる。</td>
      <td style="text-align:center">推奨</td>
    </tr>
    <tr>
      <td>CD ツールのカナリアリリースを採用している場合</td>
      <td>現環境へのルーティングの重みづけを 100%にする。手順は、CD ツールによる。</td>
      <td style="text-align:center">推奨</td>
    </tr>
    <tr>
      <td>CD ツールの Progressive Delivery を採用している場合</td>
      <td>削除せずに残してある現環境に再ルーティングする。手順は CD ツールによる。</td>
      <td style="text-align:center">推奨</td>
    </tr>
  </tbody>
</table>

<br>

## 09-03. 事後処理

### デプロイの通知

#### ▼ Kubernetes を使用する場合

Kubernetes には通知能力がなく、手動で知らせる必要がある。

#### ▼ Kubernetes 以外を使用する場合

CD ツールの通知機能 (例：ArgoCD Notification) を使用して、CD パイプラインの結果が通知されるようにする。

通知があることと品質を高めることは直接的には関係ないが、開発者の作業効率が上がるため、間接的に品質を高めることにつながる。

<br>
