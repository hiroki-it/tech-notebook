---
title: 【IT技術の知見】設計ポリシー＠Kubernetes
description: 設計ポリシー＠Kubernetesの知見を記録しています。
---

# 設計ポリシー＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. リポジトリ構成ポリシー

### リポジトリ分割のメリット

リポジトリを分割することにより、以下のメリットがある。

- 認可スコープをリポジトリ内に閉じられるため、運用チームを別に分けられる。

<br>

### アプリとIaCを同じリポジトリで管理

アプリケーションと同じリポジトリにて、`kubernetes`ディレクトリを作成し、ここにマニフェストを配置する。

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

### アプリとIaCを異なるリポジトリで管理 (推奨)

#### ▼ 各マイクロサービスを同じリポジトリで管理

```yaml
repository/
├── foo/ # fooサービス
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── persistent-volume.yaml
│   └── persistent-volume-claim.yaml
│
├── bar/ # barサービス
└── baz/ # bazサービス
```

#### ▼ 各マイクロサービスを異なるリポジトリで管理

```yaml
repository/ # fooサービス
├── deployment.yaml
...
```

```yaml
repository/ # barサービス
├── deployment.yaml
...
```

```yaml
repository/ # bazサービス
├── deployment.yaml
...
```

<br>

## 01-02. ディレクトリ構成ポリシー

### ディレクトリ/ファイルの構成

#### ▼ マイクロサービス別

マイクロサービス別にディレクトリを作成し、Kubernetesリソースごとに異なるマニフェストを定義する。

`kubectl`コマンドの実行時にマニフェストの送信の順番を制御しにくいデメリットがある。

> ↪️：https://www.amazon.co.jp/dp/B08FZX8PYW

```yaml
repository/
├── foo/ # fooサービス
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── persistent-volume.yaml
│   └── persistent-volume-claim.yaml
│
├── bar/ # barサービス
└── baz/ # bazサービス
```

加えて、実行環境やコンポーネント (app、db) 別に分割しても良い。

```yaml
repository/
└── foo/ # fooサービス
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
└── foo/ # fooサービス
    ├── app/ # appコンポーネント
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   ├── persistent-volume.yaml
    │   └── persistent-volume-claim.yaml
    │
    └── db/ # dbコンポーネント
        ├── stateful-set.yaml
        ├── service.yaml
        ├── persistent-volume.yaml
        └── persistent-volume-claim.yaml
```

#### ▼ ディレクトリ無し

ディレクトリを作成しない。

代わりに、マイクロサービス別にマニフェストを定義し、関連する全てのKubernetesリソースをこの中で定義する。

```yaml
repository/
├── foo.yaml # fooサービス (Deployment、Service、PersistentVolume、...)
├── bar.yaml # barサービス
└── baz.yaml # bazサービス
```

<br>

## 02. 命名規則

### リソース名

#### ▼ 冗長な名前が嫌いな場合

冗長な名前が嫌いな場合は `<マイクロサービス名>`とする。

基本はこれを使用する。

ケバブケースとする。

| Kubernetesリソース | 例    |
| ------------------ | ----- |
| Service            | `foo` |
| Deployment         | `foo` |
| PersistentVolume   | `foo` |
| ...                | ...   |

#### ▼ 冗長な名前が嫌いでない場合

嫌いでない場合は `<マイクロサービス名>-<Kubernetesリソース名>`とする。

ケバブケースとする。

| Kubernetesリソース | 例                      |
| ------------------ | ----------------------- |
| Service            | `foo-service`           |
| Deployment         | `foo-pod`               |
| PersistentVolume   | `foo-persistent-volume` |
| ...                | ...                     |

<br>

### マニフェストのファイル名

#### ▼ 重複しない場合

ファイル名は、Kubernetesリソース名 (例：`deployment.yaml`ファイル) になるようにする。

基本的にはこれを使用する。

ケバブケースとする。

GitHubの公式チャートを見ると、命名方法が参考になる。

```yaml
repository/
├── deployment.yaml
├── service.yaml
├── persistent-volume.yaml
└── persistent-volume-claim.yaml
```

#### ▼ ファイル名重複する場合

`1`個のディレクトリ内でKubernetesリソースが重複する場合、Kubernetesリソース名をつけることができない。

その場合、`app.kubernetes.io`キーの値 (例：`<マイクロサービス名>`または `<マイクロサービス名>-<Kubernetesリソース名>`) と同じにする。

```yaml
# 全てApplication
# 各Applicationは、fooマイクロサービス、barマイクロサービス、bazマイクロサービス、にデプロイする。
repository/
├── foo.yaml
├── bar.yaml
└── baz.yaml
```

```yaml
# 全てApplication
# 各Applicationは、fooマイクロサービス、barマイクロサービス、bazマイクロサービス、にデプロイする。
repository/
├── foo-application.yaml
├── bar-application.yaml
└── baz-application.yaml
```

<br>

### 拡張子

Kubernetesに関する開発プロジェクトを確認すると、そのほとんとで、`.yaml`ファイルの拡張子を`yml`ではなく `.yaml`でしている。

そこで、Kubernetesや関連技術 (Istio、Helm、Skaffold、Envoy、など) の `.yaml`ファイルの拡張子を `.yaml`で統一する。

```yaml
repository/
├── foo/ # fooサービス
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── persistent-volume.yaml
│   └── persistent-volume-claim.yaml
│
├── bar/ # barサービス
└── baz/ # bazサービス
```

<br>

### マニフェストの粒度

`1`個のマニフェストに、`1`個のKubernetesリソースを定義する。

<br>

## 03. 実行環境

### 開発環境

#### ▼ Kubernetesの実行環境

開発環境でKubernetesリソースの機能追加を検証するツールの例を記載する。

|                        | Minikube                                                                                                                                                        | Docker for Desktop                                                             | Kind                                                                                | クラウドプロバイダー (AWS EKS、GCP GKE、など)                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 概要                   | カスタマイズ性が高いため、カスタマイズ次第で本番環境と開発環境の差異を小さくできる。2022年3月の現在では、Kubernetesの開発環境として、ベタープラクティスである。 | セットアップが非常に簡単 (有効化するだけ) なため、開発に取り掛かるまでが早い。 | セットアップが簡単なため、開発に取り掛かるまでが早い                                | 実行環境を開発環境としても使用する。開発者ごとに異なるNamespaceを作成する。これを採用している企業が多い。 |
| セットアップの難易度   | 簡単                                                                                                                                                            | 非常に簡単                                                                     | 簡単                                                                                | 難しい                                                                                                    |
| コンテナランタイム     | docker、containerd、cri-o                                                                                                                                       | docker                                                                         | containerd (ホストOSのdockerコンテナを作成し、この中にcontainerdコンテナを作成する) | docker、containerd                                                                                        |
| Kubernetesのバージョン | 任意のバージョンを指定できる。                                                                                                                                  | Docker for Desktopのバージョンごとに、Kubernetesのバージョンが固定される。     | 任意のバージョンを指定できる。                                                      | 任意のバージョンを指定できる。                                                                            |
| マルチNode             | 可能                                                                                                                                                            | 可能                                                                           | 可能                                                                                | 可能                                                                                                      |
| Nodeのカスタマイズ性   | 高い                                                                                                                                                            | 低い                                                                           | 高い                                                                                | 高い                                                                                                      |
| 料金                   | 無料                                                                                                                                                            | 無料                                                                           | 無料                                                                                | 非常に高い                                                                                                |

> ↪️：
>
> - https://minikube.sigs.k8s.io/docs/tutorials/multi_node/
> - https://codefresh.io/kubernetes-tutorial/local-kubernetes-mac-minikube-vs-docker-desktop/
> - https://blog.cybozu.io/entry/2019/07/03/170000
> - https://qiita.com/Hiroyuki_OSAKI/items/2395e6bbb98856df12f3#2%E9%87%8D%E3%81%AE%E3%82%B3%E3%83%B3%E3%83%86%E3%83%8A%E3%82%A8%E3%83%B3%E3%82%B8%E3%83%B3

#### ▼ Kubernetesリソースのapply

|      | Skaffold                                                                                                                         | Telepresence                                                                                                                    |
| ---- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 概要 | CIOpsによって、Kubernetesの開発環境にKubernetesリソースを作成する。本番環境へのCIOpsは非推奨であるが、開発環境であれば問題ない。 | ローカルマシンに対するリクエストを、リモートにあるKubernetesのテスト環境に転送する。<br>↪️：https://thinkit.co.jp/article/17853 |

<br>

### テスト環境、ステージング環境、本番環境

#### ▼ Kubernetesの実行環境

開発環境で検証後、Kubernetesリソースの機能追加を検証するツールの例を記載する。

|            | 全て自前                                                                                                                                                                                                            | ツール (例：Kubeadm、Rancher、Kops、Kubespray、など)                                                                                                                                                                                                                                                                                                                      | クラウドプロバイダー (例：AWS EKS、GCP GKE、など)                                                                                                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 説明       | オンプレミス上にコントロールプレーンNodeやワーカーNodeとなる仮想サーバーを事前に作成しておく。ユーザー自身が、Clusterを作成し、仮想サーバーにコントロールプレーンNodeあるいはワーカーNodeとしての役割を割り当てる。 | オンプレミス上にコントロールプレーンNodeやワーカーNodeとなる仮想サーバーを事前に作成しておく。ツールを使用して、仮想サーバーをClusterに参加させ、仮想サーバーにコントロールプレーンNodeあるいはワーカーNodeとしての役割を割り当てる。マニフェストのDBとしてKVSを使用する必要があるが、KVS用クエリをRDB用クエリに変換するツール (例：Kine) を使用すれば、RDBも使用できる。 | セルフマネージドワーカーNodeの場合は、ワーカーNodeとなる仮想サーバーを事前に作成しておく。コントロールプレーンNodeは必ずマネージドになる。クラウドプロバイダーを使用して、仮想サーバーをClusterに参加させ、仮想サーバーにコントロールプレーンNodeあるいはワーカーNodeとしての役割を割り当てる。 |
| メリット   | 全て自前なため、自由にカスタマイズできる。                                                                                                                                                                          | カスタマイズ性が高い。                                                                                                                                                                                                                                                                                                                                                    | マネージドであるため、ユーザーがKubernetesのワーカーNodeを管理するコストが低い。2022年3月の現在では、Kubernetesの本番環境として、ベタープラクティスである。                                                                                                                                     |
| デメリット | ユーザーがKubernetesのワーカーNodeを管理するコストが高い。                                                                                                                                                          | ユーザーがKubernetesのワーカーNodeを管理するコストが高い。                                                                                                                                                                                                                                                                                                                | カスタマイズ性が低い                                                                                                                                                                                                                                                                            |

> ↪️：https://techstep.hatenablog.com/entry/2019/12/23/000715

#### ▼ Kubernetesリソースのapply

|      | CIOps                                                                             | GitOps                                                               |
| ---- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 概要 | CIOpsによって、Kubernetesの本番環境にKubernetesリソースを作成する。非推奨である。 | GitOpsによって、Kubernetesの本番環境にKubernetesリソースを作成する。 |

#### ▼ 実行環境の分割

Clusterの複数の実行環境 (`dev-*`、`stg-*`、`prd-*`) を用意したい場合、個人的にはその分Clusterを増やすようにする。

実行環境が `5`個や `10`個となってくると、Clusterの分だけアップグレードやSync漏れ (手動の場合) が発生するため、運用コストが高くなるというデメリットはある。

一方で、Namespaceを実行環境の粒度とすると、上記のデメリットは少ないが、Namespaceのプレフィクスに実行環境名を付与することとなり、名前が長くなってしまう。

これらを比較して、より自身に合った方法を選ぶ。

<br>

## 04. バージョンの互換性

### kube-apiserver

#### ▼ kube-apiserverが冗長化されている場合

冗長化されたkube-apiserverのバージョン差は、前方の `1`個のマイナーバージョン以内に収める必要がある。

> ↪️：https://kubernetes.io/releases/version-skew-policy/#kube-apiserver

<br>

### kubectl

#### ▼ kube-apiserverの場合

`kubectl`コマンドとkube-apiserverのバージョン差は、前方/後方の `1`個のマイナーバージョン以内に収める必要がある。

> ↪️：https://kubernetes.io/releases/version-skew-policy/#kubectl

<br>

## 05. アップグレード

### 設計ポリシー

#### ▼ マイナーバージョン単位でアップグレード

アップグレード時、新旧バージョンのコントロールプレーンコンポーネントが並行的に稼働する。

基本的にはいずれのコントロールプレーンコンポーネントも、並行的に稼働するコンポーネントのバージョンを前方/後方の `1`個のマイナーバージョン以内に収める必要がある。

そのため、Kubernetesのアップグレードもこれに合わせて、後方の `1`個のマイナーバージョンにアップグレードしていくことになる。

マイナーバージョンを `2`個以上跨いだアップグレードは非推奨である。

> ↪️：https://kubernetes.io/releases/version-skew-policy/

#### ▼ コントロールプレーンコンポーネントでダウンタイムを発生させない

コントロールプレーンコンポーネントでダウンタイムが発生すると、Nodeコンポーネントが正常に稼働しなくなる。

これにより、システム全体でダウンタイムが発生する可能性がある。

ただし、コントロールプレーンコンポーネントの、kube-controller-manager、kube-scheduler、ではダウンタイムが発生することは許容する。

> ↪️：https://logmi.jp/tech/articles/323032

#### ▼ コントロールプレーンコンポーネントのデータを損失させない

コントロールプレーンコンポーネントやNodeコンポーネントのデータを損失させないようにする。

ただし、コンテナ内のローカルストレージの損失は許容する。

> ↪️：https://logmi.jp/tech/articles/323032

#### ▼ 廃止されるAPIグループのバージョンを確認する

アップグレードに伴い、kube-apiserverでAPIグループのバージョンが廃止されることがある。

これにより、マニフェストでAPIグループのバージョンを宣言できなくなってしまうため、確認が必要である。

静的解析ツール (例：pluto) を使用すると検出しやすい。

> ↪️：https://eng-blog.iij.ad.jp/archives/17944

#### ▼ 変更されるメトリクス名やクエリロジックを確認する

アップグレードに伴い、監視系リソース (例：Prometheus、Grafana) でメトリクス名やクエリロジックが廃止されることがある。

これにより、メトリクスを収集できなくなってgしまうため、確認が必要である。

> ↪️：https://eng-blog.iij.ad.jp/archives/17944

#### ▼ 動作確認では、Podだけでなく、Podの管理リソースも確認する

動作確認として、`Ready`コンディションと `Running`ステータスを `kubectl get pod`で確認する。

また加えて、Podの作成が始まらないと、`kubectl get pod`コマンドにPod自体が表示されない。

そのため、`kubectl get deployment`で、Podの管理リソース (例：Deployment) の全てのPodが `Ready`コンディションかどうかを確認しておく。

<br>

### コントロールプレーンNodeのアップグレード

#### ▼ コントロールプレーンNodeのアップグレードとは

まず最初に、コントロールプレーンNodeをアップグレードする。

必要であれば、コントロールプレーンNodeのアドオン (例：aws-eks-corednsアドオン、aws-eks-kubeproxyアドオン、aws-vpc-cniアドオン) を別々にアップグレードする。

> ↪️：
>
> - https://www.eksworkshop.com/intermediate/320_eks_upgrades/upgradeeks/
> - https://www.eksworkshop.com/intermediate/320_eks_upgrades/upgradeaddons/

#### ▼ インプレース方式

コントロールプレーンNodeのkube-apiserverのアップグレード時間がダウンタイムに相当する。

ただし、コントロールプレーンNodeがマネージドなクラウドプロバイダーのいくつか (例：AWS) では、kube-apiserverでダウンタイムの発生しないアップグレードを手法を採用している。

このアップグレードでは、コントロールプレーンNodeはインプレース方式でアップグレードしてもダウンタイムが発生しないことが保証されている (ワーカーNodeではダウンタイムが発生してしまう) 。

そのため、コントロールプレーンNodeのみ、インプレース方式でアップグレードする。

> ↪️：https://aws.github.io/aws-eks-best-practices/reliability/docs/controlplane/#handling-cluster-upgrades

<br>

### ワーカーNodeのアップグレード

#### ▼ ワーカーNodeのアップグレードとは

コントロールプレーンNodeのアップグレードが終了したら、ワーカーNodeをアップグレードする。

クラウドプロバイダーのマネージドNodeグループを採用している場合、ワーカーNodeが新しいマシンイメージに基づいてオートスケーリングされるように設定しておく。

| 方法                                    | 作業時間 | 手順の煩雑さ | ダウンタイム | 補足                                                                |
| --------------------------------------- | -------- | ------------ | ------------ | ------------------------------------------------------------------- |
| インプレース方式                        | より短い | より簡単     | より長い     | ダウンタイムが許されるなら、労力も時間もかからないのでオススメ。    |
| ローリング方式 (サージ方式、ライブ方式) | ^        | ^            | v            |                                                                     |
| ブルー/グリーン方式                     | より長い | より難しい   | なし         | Clusterの作成の労力が、もう `1`個実行環境を作成することに相当する。 |

> ↪️：https://www.eksworkshop.com/intermediate/320_eks_upgrades/upgrademng/

#### ▼ インプレース方式

既存のNodeグループ内のワーカーNodeをそのままアップグレードする。

ワーカーNodeのアップグレード時間がそのままダウンタイムになるため、メンテナンス時間を設けられる場合にのみ使用できる。

> ↪️：https://logmi.jp/tech/articles/323033

`【１】`

: ワーカーNodeを削除する。

`【２】`

: ワーカーNodeを再作成する。

#### ▼ ローリング方式 (サージ方式、ライブ方式)

![kubernetes_live-upgrade](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_live-upgrade.png)

『サージ方式』『ライブ方式』ともいう。

新Nodeグループを作成し、旧Nodeグループ内のワーカーNodeを順にドレインしていくことにより、アップグレードする。

一度にアップグレードするワーカーNode数 (Surge数) を増やすことにより、アップグレードの速さを調整できる。

デメリットとして、新バージョンを1つずつしかアップグレードできない。

`【１】`

: 旧Nodeグループ (Prodブルー) を残したまま、新Nodeグループ (Testグリーン) を作成する。

この時、新Nodeグループ内ワーカーNode上にはPodが存在していないため、アクセスが新Nodeグループにルーティングされることはない。
`【２】`

: `kubectl drain`コマンドを実行することにより、旧Nodeグループ内のワーカーNodeでドレイン処理を開始させる。

この時、DaemonSetのPodを退避させられるように、`--ignore-daemonsets`オプションを有効化する。

また、emptyDirボリュームを持つPodを退避できるように `--delete-emptydir-data`オプションも有効化する。ドレイン処理によって、旧Nodeグループ内のワーカーNodeがSchedulingDisabled状態になり、加えてこのワーカーNodeからPodが退避していく。

その後、新Nodeグループ内のSchedulingEnabled状態のワーカーNode上で、Podを再スケジューリングする。

この時、旧Nodeグループ内ワーカーNode上にはPodが存在していないため、アクセスが旧Nodeグループにルーティングされることはない。

```bash
$ kubectl drain <旧Nodeグループ内のワーカーNode名> \
    --ignore-daemonsets \
    --delete-emptydir-data
```

![kubernetes_node_scheduling-pod-status](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_node_scheduling-pod-status.png)

> ↪️：
>
> - https://dunkshoot.hatenablog.com/
> - https://hyoublog.com/2020/06/10/kubernetes-node%E3%81%AE%E5%89%8A%E9%99%A4/

`【３】`

: ドレイン処理が完了した後、新Nodeグループ内ワーカーNode上でPodが正常に稼働していることを確認する。

`【４】`

: 動作が問題なければ、旧Nodeグループを削除する。

> ↪️：
>
> - https://zenn.dev/nameless_gyoza/articles/how-to-update-eks-cluster-safely
> - https://logmi.jp/tech/articles/323032
> - https://aws.amazon.com/jp/blogs/news/planning-kubernetes-upgrades-with-amazon-eks/
> - https://cloud.google.com/kubernetes-engine/docs/concepts/node-pool-upgrade-strategies#surge
> - https://www.slideshare.net/nttdata-tech/anthos-cluster-design-upgrade-strategy-cndt2021-nttdata/44

#### ▼ ブルー/グリーン方式

![kubernetes_cluster-migration](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_cluster-migration.png)

『マイグレーション方式』ともいう。

新しいClusterを作成することにより、ワーカーNodeをアップグレードする。

いずれ (例：ロードバランサー) を基点にしてルーティング先を切り替えるかによって、具体的な方法が大きく異なる。

メリットとして、バージョンを1つずつのみでなく飛び越えてアップグレードできる。

`【１】`

: 旧Cluster (Prodブルー) を残したまま、新Cluster (Testグリーン) を作成する。新Clusterには、全てのKubernetesリソースが揃っている。

`【２】`

: 社内から、新Clusterに特定のポート番号でアクセスし、動作を確認する。

`【３】`

: 動作が問題なければ、社外を含む全ユーザーのアクセスのルーティング先を新Clusterに変更する。新Clusterから旧Clusterにロールバックする場合に備えて、旧Clusterは削除せずに残しておく。

> ↪️：
>
> - https://logmi.jp/tech/articles/323032
> - https://logmi.jp/tech/articles/323033
> - https://zenn.dev/nameless_gyoza/articles/how-to-update-eks-cluster-safely
> - https://cloud.google.com/kubernetes-engine/docs/concepts/node-pool-upgrade-strategies#blue-green-upgrade-strategy

<br>

## 06. CIDRブロックの設計

### ワーカーNodeの場合

Kubernetesでは、稼働する可能性のあるPod数から、ワーカーNodeのCIDRブロックを算出すると良い。

アプリケーションのPodがスケーリングすることや、カスタムリソース (例：Istio、Linkerd) を導入することも考慮して、尤もらしいIPアドレス数を算出できる。

削除されるPodと作成されるPodが別のIPアドレスになるようにするために (IPアドレスの再利用を防ぐために) 、Podの最大数の `2`倍のIPアドレスを持つCIDRブロックを設定すると良い。

| Node当たりの最大Pod数 | ワーカーNode当たりのCIDRブロック | IPアドレス数 |
| --------------------- | -------------------------------- | ------------ |
| `1`                   | `/32`                            | `2`          |
| `8`                   | `/28`                            | `16`         |
| `9`～`16`             | `/27`                            | `32`         |
| `17`～`32`            | `/26`                            | `64`         |
| `33`～`64`            | `/25`                            | `128`        |
| `65`～`110`           | `/24`                            | `256`        |

> ↪️：https://cloud.google.com/kubernetes-engine/docs/how-to/flexible-pod-cidr

<br>

### サブネットの場合

AWS EKSでの目安であるが、サブネットごとに `/19`や `/20`なるように設計するのが、個人的にはおすすめ。

<br>

## 07. 監視ポリシー

### Cluster

Clusterをディメンションとしたメトリクスの監視ポリシーは以下の通りである。

| メトリクス       | 単位     | 説明                                                               | アラート条件例 (合致したら発火)                                 |
| ---------------- | -------- | ------------------------------------------------------------------ | --------------------------------------------------------------- |
| Nodeの必要最低数 | カウント | 同じCluster内のワーカーNode数の必要最低数をデータポイントとする。  | ・統計 : 期間内合計数<br>・期間 : `5`分<br>・閾値 : `<= 2`      |
| Podの必要最低数  | カウント | 同じCluster内のワーカーNodeのPod必要最低数をデータポイントとする。 | ・統計 : 期間内合計数<br>・期間 : `5`分<br>・閾値 : `<= 1`      |
| CPU              | %        | 同じCluster内のワーカーNodeのCPU使用率をデータポイントとする。     | ・統計 : 期間内平均使用率<br>・期間 : `5`分<br>・閾値 : `>= 80` |
| Memory           | %        | 同じCluster内のワーカーNodeのメモリ使用率をデータポイントとする。  | ・統計 : 期間内平均使用率<br>・期間 : `5`分<br>・閾値 : `>= 80` |

> ↪️：https://www.tigera.io/learn/guides/kubernetes-monitoring/

<br>

### Pod

#### ▼ Pod全体

Pod全体をディメンションとしたメトリクスの監視ポリシーは以下の通りである。

|                 |          |                                                           |                                                                 |
| --------------- | -------- | --------------------------------------------------------- | --------------------------------------------------------------- |
| メトリクス      | 単位     | 説明                                                      | アラート条件例 (合致したら発火)                                 |
| CPU             | %        | Pod全体のCPU使用率をデータポイントとする。                | ・統計 : 期間内平均使用率<br>・期間 : `5`分<br>・閾値 : `>= 80` |
| Memory          | %        | Pod全体のメモリ使用率をデータポイントとする。             | ・統計 : 期間内平均使用率<br>・期間 : `5`分<br>・閾値 : `>= 80` |
| Podの最低必要数 | カウント | 同じDeployment内のPodの必要最低数をデータポイントとする。 | ・統計 : 期間内合計数<br>・期間 : `5`分<br>・閾値 : `<= 2`      |

> ↪️：https://www.tigera.io/learn/guides/kubernetes-monitoring/

#### ▼ コンテナ

コンテナをディメンションとしたメトリクスの監視ポリシーは以下の通りである。

| メトリクス     | 単位     | 説明                                                     | アラート条件例 (合致したら発火)                                 | 補足                                                                               |
| -------------- | -------- | -------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| CPU            | %        | コンテナのCPU使用率をデータポイントとする。              | ・統計 : 期間内平均使用率<br>・期間 : `5`分<br>・閾値 : `>= 80` |                                                                                    |
| Memory         | %        | コンテナのメモリ使用率をデータポイントとする。           | ・統計 : 期間内平均使用率<br>・期間 : `5`分<br>・閾値 : `>= 80` |                                                                                    |
| readinessProbe | カウント | コンテナのreadinessProbeの失敗数をデータポイントとする。 | ・統計 : 期間内合計数<br>・期間 : `1`分<br>・閾値 : `>= 2`      | ネットワーク由来の問題で発生することがあるため、連続的に発生した上でアラートする。 |

> ↪️：https://www.tigera.io/learn/guides/kubernetes-monitoring/

<br>

## 08. デバッグ

### 便利なイメージ

#### ▼ Deployment系

Deploymentが正しくPodを作成できない場合、それだけでHelloWorldのアプリケーションを起動できるイメージがある。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: helloworld-pod
spec:
  containers:
    - name: hello-world
      image: paulbouwer/hello-kubernetes:1.10
      ports:
        - containerPort: 8080
          protocol: TCP
```

> ↪️：
>
> - https://hub.docker.com/r/paulbouwer/hello-kubernetes/
> - https://hub.docker.com/_/nginx

#### ▼ ネットワーク系

ネットワークのトラブルシューティングに役立つツールがインストールされているイメージがある。

`kubectl debug`コマンドと組み合わせる。

```bash
$ kubectl debug node/<Node名> \
    -n default \
    -it \
    --image=praqma/network-multitool
```

> ↪️：
>
> - https://hub.docker.com/r/praqma/network-multitool
> - https://hub.docker.com/r/nicolaka/netshoot

<br>

## 07. Kubernetesリソースの脆弱性対策

### 認証/認可の実施

#### ▼ Kubernetesリソースの場合

RoleやClusterRoleを使用して、ServiceAccountに適切な認可スコープを付与する。

> ↪️：

> - https://qiita.com/sheepland/items/67a5bb9b19d8686f389d
> - https://speakerdeck.com/kyohmizu/saibagong-ji-kara-kubernetes-kurasutawoshou-rutamefalsexiao-guo-de-nasekiyuriteidui-ce?slide=18

#### ▼ コンテナの場合

Podの `.spec.securityContext`キーを使用して、コンテナのプロセスの実行ユーザーに認可スコープを付与する。

> ↪️：
>
> - https://kubernetes.io/docs/tasks/configure-pod-container/security-context/
> - https://speakerdeck.com/kyohmizu/saibagong-ji-kara-kubernetes-kurasutawoshou-rutamefalsexiao-guo-de-nasekiyuriteidui-ce?slide=18

<br>

### 機密な変数やファイルの扱い

#### ▼ Secretの変数の暗号化と管理

Secretの `.data`キーには、`base64`方式でエンコードされた値を設定する必要がある。

この `base64`方式エンコード値をどのように管理するかには選択肢がある。

| 方法                                                  | バージョン管理 | 暗号化とSecretストア                                                                                                                                                                                                                                                                                                               |
| ----------------------------------------------------- | :------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHubリポジトリ                                      |      ⭕️       | `base64`方式エンコード値をGitHubリポジトリ内でそのまま管理する。非推奨である。                                                                                                                                                                                                                                                     |
| GitHubリポジトリ + キーバリュー型バックエンド         |      ⭕️       | `base64`方式エンコード値を暗号化キー (例：AWS KMS、Google CKM、GnuPG、など) で暗号化した上で、リポジトリ上やCluster内でキーバリュー型バックエンド (例：SOPS、Hashicorp Vault、Secrets Store CSI Driver、External Secrets、External Secrets Operator) で管理する。kube-apiserverへの送信前に `base64`方式エンコード値に復号化する。 |
| GitHubリポジトリ + クラウドキーバリュー型バックエンド |       ×        | `base64`方式エンコード値を暗号化キー (例：AWS KMS、Google CKM、GnuPG、など) で暗号化した上で、クラウドプロバイダー内のキーバリュー型バックエンド (例：AWS パラメーターストア、Google SecretManager、など) で管理する。kube-apiserverへの送信前に `base64`方式エンコード値に復号化する。                                            |

> ↪️：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/secret-management/
> - https://www.thorsten-hans.com/encrypt-your-kubernetes-secrets-with-mozilla-sops/
> - https://akuity.io/blog/how-to-manage-kubernetes-secrets-gitops/

#### <br>

## 08. CIパイプライン

### マニフェストのホワイトボックステスト

#### ▼ 静的解析

| 観点                         | 説明                                                                                                                                                                                                                                                      | 補足                                                                                                                                                                                                                                                                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 実装ルール違反               | 外部のPaCツール (例：conftest、GatekeeperCLIのgator) を使用して、そのプロダクトの実装ルール違反を検証する。                                                                                                                                               | ↪️：https://qiita.com/Udomomo/items/10ed2dbfef85812808da#conftest%E3%81%A7policy%E3%82%92%E6%9B%B8%E3%81%84%E3%81%A6%E3%81%BF%E3%82%8B                                                                                                                                                                                              |
| 文法の誤りテスト             | 外部の文法の誤りテストツール ( (例：kubeconform) を使用して、マニフェストの文法の誤りを検証する。                                                                                                                                                         | ↪️：https://mixi-developers.mixi.co.jp/kubeconform-2bb477371e06                                                                                                                                                                                                                                                                     |
| ベストプラクティス違反テスト | 外部のベストプラクティス違反テストツール (例：polaris) を使用して、チャートの実装方法に起因する脆弱性を検証する。                                                                                                                                         | ↪️：https://gavin-zhou.medium.com/%E3%83%99%E3%82%B9%E3%83%88%E3%83%97%E3%83%A9%E3%82%AF%E3%83%86%E3%82%A3%E3%82%B9%E3%81%A8%E3%83%9D%E3%83%AA%E3%82%B7%E3%83%BC%E3%81%AE%E3%81%9F%E3%82%81%E3%81%AEkubernetes-yaml%E3%81%AE%E3%83%90%E3%83%AA%E3%83%87%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3-%E7%AC%AC%E5%9B%9B%E7%AB%A0-bc00f1610a3 |
| 非推奨apiVersionテスト       | 外部の非推奨apiVersionテストツール (例：pluto) を使用して、マニフェストの非推奨apiVersionを検証する。                                                                                                                                                     | ↪️：https://zenn.dev/johnn26/articles/detect-kubernetes-deplicated-api-automatically                                                                                                                                                                                                                                                |
| 脆弱性テスト                 | 外部の脆弱性テストツール (例：kics、kube-score) を使用して、マニフェストの実装方法に起因する脆弱性を検証する。補足として、Kubernetesリソースのセキュリティスキャン (例：trivy) は、既に作成されたKubernetesリソースに対する検証のため、ここには含めない。 | ↪️：<br>・https://blog.nflabs.jp/entry/2021/12/24/091803<br>・https://weblog.grimoh.net/entry/2022/01/02/100000 <br>・https://zenn.dev/tayusa/articles/ad9fafa197888b                                                                                                                                                               |

<br>

## 08-02. CDパイプライン

### マニフェストのホワイトボックステスト

#### ▼ 静的解析

GitOpsの場合、CIパイプライン上だけでなく、CDパイプライン上でもホワイトボックステストを実施できる。

ただし、kube-apiserverのvalidating-admissionステップ時にこれを実施する必要がある。

| 観点           | 説明                                                                                             | 補足                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| 実装ルール違反 | 外部のPaCツール (例：Gatekeeper、Kyverno) を使用して、そのプロダクトの実装ルール違反を検証する。 | ↪️：https://qiita.com/Udomomo/items/10ed2dbfef85812808da#conftest%E3%81%A7policy%E3%82%92%E6%9B%B8%E3%81%84%E3%81%A6%E3%81%BF%E3%82%8B |

<br>

### マニフェストのブラックボックステスト

#### ▼ 結合テスト

テスト環境に対して `kubectl apply`コマンドを実行することにより、追加/変更を含む複数のマニフェストを組み合わせた結合テストを実施する。

#### ▼ 総合テスト

テスト環境に対して `kubectl apply`コマンドを実行することにより、既存機能/追加/変更を含む全てのチャートを組み合わせた総合テストを実施する。

> ↪️：https://camunda.com/blog/2022/03/test/

<br>

### デプロイ

#### ▼ デプロイとは

本番環境に対して、ローカルマシンまたはCDツールを使用して、マニフェストをデプロイする。

#### ▼ インプレースデプロイメント (非推奨)

KubernetesのDeploymentのReplace戦略を採用する。非推奨である。ダウンタイムが発生する。

> ↪️：https://amateur-engineer-blog.com/kubernetes-recreate/#toc2

#### ▼ ローリングアップデート (推奨)

KubernetesのDeploymentのRollingUpdate戦略を採用する。

#### ▼ BGデプロイメント (推奨)

Kubernetes自体はブルー/グリーンデプロイメントの能力を持たない。CDツール (例：Argo Rollout) のBGデプロイメント機能を採用する。

> ↪️：https://argoproj.github.io/argo-rollouts/concepts/#blue-green

#### ▼ カナリアリリース (推奨)

Kubernetes自体はカナリアリリースの能力を持たない。CDツール (例：Argo Rollout) やサービスメッシュツール (例：Istio、Linkerd、など) のカナリアリリース機能を採用する。

注意点として、サービスメッシュツールであると、重み付けの段階的な変更が手動になってしまう。

> ↪️：https://argoproj.github.io/argo-rollouts/concepts/#canary

#### ▼ Progressive Delivery (推奨)

Kubernetes自体はProgressive Deliveryの能力を持たない。CDツール (例：Argo Rollout) のProgressive Delivery機能を採用する。

> ↪️：https://argoproj.github.io/argo-rollouts/concepts/#progressive-delivery

<br>

### ロールバック

| デプロイ方法の採用状況                           | 方法                                                                                                                                                       | 推奨/非推奨 |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------: |
| DeploymentのRollingUpdate戦略を採用している場合  | 過去のリリースタグ (リビジョン) を再デプロイする。あるいはGitHubによるコミットのリバートを使用し、現在のコミットを打ち消すコミットを作成し、PRを作成する。 |   非推奨    |
| CDツールのBGデプロイメントを採用している場合     | 削除せずに残してある旧環境に再ルーティングする。手順は、CDツールによる。                                                                                   |    推奨     |
| CDツールのカナリアリリースを採用している場合     | 旧環境へのルーティングの重みづけを100%にする。手順は、CDツールによる。                                                                                     |    推奨     |
| CDツールのProgressive Deliveryを採用している場合 | 削除せずに残してある旧環境に再ルーティングする。手順はCDツールによる。                                                                                     |    推奨     |

<br>

## 08-03. 事後処理

### デプロイの通知

#### ▼ Kubernetesを使用する場合

Kubernetesには通知能力がなく、手動で知らせる必要がある。

#### ▼ Kubernetes以外を使用する場合

CDツールの通知機能 (例：ArgoCD Notification) を使用して、CDパイプラインの結果が通知されるようにする。

通知があることと品質を高めることは直接的には関係ないが、開発者の作業効率が上がるため、間接的に品質を高めることにつながる。

<br>

## 09. マルチテナント

### Cluster分割の場合

Cluster自体を分割し、テナントを実装する。

一番簡単である。

<br>

### 階層Namespaceの場合

Namespaceに親子関係を定義し、テナントを実装する。

> ↪️：https://www.cncf.io/blog/2022/11/09/multi-tenancy-in-kubernetes-implementation-and-optimization/

<br>

### 仮想Clusterの場合

ホストCluster上に仮想Clusterを作成し、テナントを実装する。

> ↪️：https://www.cncf.io/blog/2022/11/09/multi-tenancy-in-kubernetes-implementation-and-optimization/

<br>
