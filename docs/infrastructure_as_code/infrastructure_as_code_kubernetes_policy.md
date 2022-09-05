---
title: 【IT技術の知見】設計ポリシー＠Kubernetes
description: 設計ポリシー＠Kubernetesの知見を記録しています。
---

# 設計ポリシー＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. リポジトリ構成ポリシー

### リポジトリ分割のメリット

リポジトリを分割することにより、以下のメリットがある。

- 認可スコープをリポジトリ内に閉じられるため、運用チームを別に分けられる。

<br>

### モノリポジトリ

アプリケーションと同じリポジトリにて、```kubernetes```ディレクトリを作成し、ここにマニフェストファイルを配置する。

```yaml
repository/
├── app/ # アプリケーション
├── manifests/
│   └── kubernetes/
│       ├── foo.yaml
...
```

<br>

### ポリリポジトリ（推奨）

#### ▼ 各マイクロサービスを同じリポジトリにする

```yaml
repository/
├── foo/ # fooサービス
├── bar/ # barサービス
└── baz/ # bazサービス
```

#### ▼ 各マイクロサービスを異なるリポジトリにする

```yaml
repository/ # fooサービス
├── foo.yaml
...
```

```yaml
repository/ # barサービス
├── bar.yaml
...
```

```yaml
repository/ # bazサービス
├── baz.yaml
...
```

<br>

## 01-02. ディレクトリ構成ポリシー

### ディレクトリ/ファイルの構成

#### ▼ マイクロサービス別

マイクロサービス別にディレクトリを作成し、Kubernetesリソースごとに別々のマニフェストファイルを作成する。マニフェストの```apply```の順番を制御しにくいデメリットがある。

> ℹ️ 参考：https://www.amazon.co.jp/dp/B08FZX8PYW

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

加えて、実行環境やコンポーネント（app、db）別に分割してもよい。

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
    │   └── persistent-volume.yaml
    │
    └── db/ # dbコンポーネント
        ├── stateful-set.yaml
        ├── service.yaml
        └── persistent-volume.yaml
```


#### ▼ ディレクトリ無し

ディレクトリを作成しない。代わりに、マイクロサービス別にマニフェストファイルを作成し、関連する全てのKubernetesリソースをこの中で定義する。

```yaml
repository/
├── foo.yaml # fooサービス（Deployment、Service、PersistentVolume、...）
├── bar.yaml # barサービス
└── baz.yaml # bazサービス
```

<br>

## 02. 命名規則

### labelsキー

#### ▼ app.kubernetes.io

Kubernetesに関する```metadata.labels```キーを以下に示す。

> ℹ️ 参考：https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/

| キー              | 説明                                               | 値の例                           |
| ----------------- | -------------------------------------------------- |-------------------------------|
| ```/app```        | マイクロサービス名                                 | ```foo```、```foo-service```   |
| ```/component```  | コンテナの役割名                                   | ```database```                |
| ```/created-by``` | このKubernetesリソースを作成したリソースやユーザー | ```kube-controller-manager``` |
| ```/env```        | アプリケーションの実行環境名                       | ```prd```、```stg```、```dev``` |
| ```/instance```   | 冗長化されたコンテナのインスタンス名               | ```mysql-12345```             |
| ```/managed-by``` | アプリケーションの管理ツール名                     | ```helm```                    |
| ```/name```       | マイクロサービスを構成するコンテナのベンダー名     | ```mysql```                   |
| ```/part-of```    | マイクロサービス全体のアプリケーション名           | ```bar```                     |
| ```/type```       | リソースの設定方法の種類名                         | ```host```（PVのマウント対象）         |
| ```/version```    | マイクロサービスのリリースバージョン名             | ```5.7.21```                  |

#### ▼ helm.sh

| キー         | 説明                   | 値の例          |
| ------------ | ---------------------- | --------------- |
| ```/chart``` | 使用しているチャート名 | ```foo-chart``` |

<br>

### リソース名

ケバブケースで命名する。マイクロサービスの技術スタックがリプレイスされる場合にも対応できるように、```<マイクロサービス名>-<コンポーネント名>-<Kubernetesリソース名>```とすると良い。

| Kubernetesリソース   | キー値の例                                                              |
|------------------|--------------------------------------------------------------------|
| Service          | ```foo-app-service```、```foo-db-service```                         |
| Pod              | ```foo-app-pod```、```foo-db-pod```                                 |
| PersistentVolume | ```foo-app-perisitent-volume```、```foo-db-pod-perisitent-volume``` |

<br>

### マニフェストファイル

#### ▼ ファイル名

ケバブケースとする。ファイル名は、ディレクトリ構成ポリシーによる。

#### ▼ 拡張子

Kubernetesに関する開発プロジェクトを確認すると、そのほとんとで、```.yaml```ファイルの拡張子を```yml```ではなく```.yaml```でしている。そこで、Kubernetesや関連技術（Istio、Helm、Skaffold、Envoy、など）の```.yaml```ファイルの拡張子を```.yaml```で統一する。

<br>

## 03. 実行環境

### 開発環境

#### ▼ Kubernetesの実行環境

開発環境でKubernetesリソースの機能追加を検証するツールの例を記載する。

> ℹ️ 参考：
>
> - https://minikube.sigs.k8s.io/docs/tutorials/multi_node/
> - https://codefresh.io/kubernetes-tutorial/local-kubernetes-mac-minikube-vs-docker-desktop/
> - https://blog.cybozu.io/entry/2019/07/03/170000
> - https://qiita.com/Hiroyuki_OSAKI/items/2395e6bbb98856df12f3#2%E9%87%8D%E3%81%AE%E3%82%B3%E3%83%B3%E3%83%86%E3%83%8A%E3%82%A8%E3%83%B3%E3%82%B8%E3%83%B3

|                        | Minikube                                                     | Docker for Desktop                                           | Kind                                                         | クラウドプロバイダー（AWS EKS、GCP GKE、など）               |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 概要                   | カスタマイズ性が高いため、カスタマイズ次第で本番環境と開発環境の差異を小さくできる。2022年3月の現在では、Kubernetesの開発環境として、ベタープラクティスである。 | セットアップが非常に簡単（有効化するだけ）なので、開発に取り掛かるまでが早い。 | セットアップが簡単なので、開発に取り掛かるまでが早い         | 実行環境を開発環境としても使用する。開発者ごとに異なるNamespaceを作成する。 |
| セットアップの難易度   | 簡単                                                         | 非常に簡単                                                   | 簡単                                                         | 難しい                                                       |
| コンテナランタイム     | docker、containerd、cri-o                                    | docker                                                       | containerd（ホストOSのdockerコンテナを作成し、この中にcontainerdコンテナを作成する） | docker、containerd                                           |
| Kubernetesのバージョン | 任意のバージョンを指定できる。                               | Docker for Desktopのバージョンごとに、Kubernetesのバージョンが固定される。 | 任意のバージョンを指定できる。                               | 任意のバージョンを指定できる。                               |
| マルチNode             | 可能                                                         | 可能                                                         | 可能                                                         | 可能                                                         |
| Nodeのカスタマイズ性   | 高い                                                         | 低い                                                         | 高い                                                         | 高い                                                         |
| 料金                   | 無料                                                         | 無料                                                         | 無料                                                         | 非常に高い                                                   |

#### ▼ Kubernetesリソースのapply

|      | Skaffold                                                     | Telepresence                                                 |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 概要 | CIOpsによって、Kubernetesの開発環境にKubernetesリソースを作成する。本番環境へのCIOpsは非推奨であるが、開発環境であれば問題ない。 | ローカルマシンに対するリクエストを、リモートにあるKubernetesのテスト環境に転送する。<br>ℹ️ 参考：https://thinkit.co.jp/article/17853 |

<br>

### テスト環境、ステージング環境、本番環境

#### ▼ Kubernetesの実行環境

開発環境で検証後、Kubernetesリソースの機能追加を検証するツールの例を記載する。

> ℹ️ 参考：https://techstep.hatenablog.com/entry/2019/12/23/000715

|            | 全て自前                                                     | ツール（例：Kubeadm、Rancher、Kops、Kubespray、など）        | クラウドプロバイダー（例：AWS EKS、GCP GKE、など）           |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 説明       | オンプレミス上にマスターNodeやワーカーNodeとなる仮想サーバーを事前に作成しておく。ユーザー自身が、Clusterを作成し、仮想サーバーにマスターNodeあるいはワーカーNodeとしての役割を割り当てる。 | オンプレミス上にマスターNodeやワーカーNodeとなる仮想サーバーを事前に作成しておく。ツールを使用して、仮想サーバーをClusterに参加させ、仮想サーバーにマスターNodeあるいはワーカーNodeとしての役割を割り当てる。 | セルフマネージドワーカーNodeの場合は、ワーカーNodeとなる仮想サーバーを事前に作成しておく。マスターNodeは必ずマネージドになる。クラウドプロバイダーの機能を使用して、仮想サーバーをClusterに参加させ、仮想サーバーにマスターNodeあるいはワーカーNodeとしての役割を割り当てる。 |
| メリット   | 全て自前なため、自由にカスタマイズできる。                   | カスタマイズ性が高い。                                       | マネージドであるため、ユーザーがKubernetesのNodeを管理するコストが低い。2022年3月の現在では、Kubernetesの本番環境として、ベタープラクティスである。 |
| デメリット | ユーザーがKubernetesのNodeを管理するコストが高い。           | ユーザーがKubernetesのNodeを管理するコストが高い。           | カスタマイズ性が低い                                         |

#### ▼ Kubernetesリソースのapply

|      | CIOps                                                        | GitOps                                                       |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 概要 | CIOpsによって、Kubernetesの本番環境にKubernetesリソースを作成する。非推奨である。 | GitOpsによって、Kubernetesの本番環境にKubernetesリソースを作成する。 |

<br>

## 04. バージョンの互換性

### kube-apiserver

#### ▼ kube-apiserverが冗長化されている場合

冗長化されたkube-apiserverのバージョン差は、前方の```1```個のマイナーバージョン以内に収める必要がある。

> ℹ️ 参考：https://kubernetes.io/releases/version-skew-policy/#kube-apiserver

<br>

### kubectl

#### ▼ kube-apiserverの場合

```kubectl```コマンドとkube-apiserverのバージョン差は、前方/後方の```1```個のマイナーバージョン以内に収める必要がある。

> ℹ️ 参考：https://kubernetes.io/releases/version-skew-policy/#kubectl

<br>

## 05. アップグレード

### アップグレード要件の例

- アプリケーションでダウンタイムが発生しない。
- 稼働中の全体リソースが減らない。
- マスターNodeでは、kube-controller-manager、kube-schedulerの許容するが抑えられる。
- ワーカーNodeのストレージの消去は許容する。

<br>

### マスターNodeのアップグレード

#### ▼ マスターNodeのアップグレードとは

まず最初に、マスターNodeをアップグレードする。必要であれば、マスターNode上のアドオン（例：core-dns、kube-proxy、vpc-cni）を別々にアップグレードする。

> ℹ️ 参考：
>
> - https://www.eksworkshop.com/intermediate/320_eks_upgrades/upgradeeks/
> - https://www.eksworkshop.com/intermediate/320_eks_upgrades/upgradeaddons/

#### ▼ インプレース方式

マスターNodeはインプレース方式でアップグレードしてもダウンタイムが発生しないことが保証されているため、マスターNodeのみインプレース方式でアップグレードする。

> ℹ️ 参考：https://aws.github.io/aws-eks-best-practices/reliability/docs/controlplane/#handling-cluster-upgrades

<br>

### ワーカーNodeのアップグレード

#### ▼ ワーカーNodeのアップグレードとは

マスターNodeのアップグレードが終わったら、ワーカーNodeをアップグレードする。クラウドプロバイダーのマネージドNodeグループを採用している場合、ワーカーNodeが新しいマシンイメージに基づいてオートスケーリングされるように設定しておく。

> ℹ️ 参考：https://www.eksworkshop.com/intermediate/320_eks_upgrades/upgrademng/

| 方法            | 作業時間 | 手順の煩雑さ | ダウンタイム | 補足                                                         |
|---------------| -------- | ------------ | ------------ | ------------------------------------------------------------ |
| インプレース方式      | 短い     | 簡単         | 長い         | ダウンタイムが許されるなら、労力も時間もかからないのでオススメ。 |
| ライブ方式         | ^        | ^            | v            |                                                              |
| ローリングアップデート方式 | ^        | ^            | v            |                                                              |
| ブルー/グリーン方式    | 長い     | 難しい       | なし         | Clusterの作成の労力が、もう一つ実行環境を作成することに相当する。 |

#### ▼ インプレース方式

既存のNodeグループ内のワーカーNodeをそのままアップグレードする方法。ワーカーNodeのアップグレード時間がそのままダウンタイムになるため、メンテナンス時間を設けられる場合にのみ使用できる。

> ℹ️ 参考：https://logmi.jp/tech/articles/323033

（１）ワーカーNodeを削除する。

（２）ワーカーNodeを再作成する。

▼ ライブ方式

![kubernetes_live-upgrade](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_live-upgrade.png)

新しいNodeグループを作成することにより、アップグレードする方法。一度に作業するNode数（Surge数）を増やすことにより、アップグレードの速さを制御できる。デメリットとして、新バージョンを1つずつしかアップグレードできない。

> ℹ️ 参考：
>
> - https://zenn.dev/nameless_gyoza/articles/how-to-update-eks-cluster-safely
> - https://logmi.jp/tech/articles/323032

（１）ワーカーNodeでは、旧Nodeグループ（Prodブルー）を残したまま、新Nodeグループ（Testグリーン）を作成する。この時、新Nodeグループ内ワーカーNode上にはPodが存在していないため、アクセスが新Nodeグループにルーティングされることはない。

（２）```kubectl drain```コマンドを実行し、Drain処理を開始させる。この時、DaemonSetのPodを退避させられるように、```--ignore-daemonsets```オプションを有効化する。また、emptyDirボリュームを持つPodを退避できるように```--delete-emptydir-data```オプションも有効化する。Drain処理によって、旧Nodeグループ内ワーカーNode上でのPodのスケジューリングが無効化され、加えて旧Nodeグループ内ワーカーNodeからPodが退避する。その後、新Nodeグループ内ワーカーNode上でPodが再作成される。この時、旧Nodeグループ内ワーカーNode上にはPodが存在していないため、アクセスが旧Nodeグループにルーティングされることはない。

> ℹ️ 参考：https://dunkshoot.hatenablog.com/

```bash
$ kubectl drain <ワーカーNode名> \
    --ignore-daemonsets \
    --delete-emptydir-data
```

（３）Drain処理が完了した後、新Nodeグループ内ワーカーNode上でPodが正常に稼働していることを確認する。

（４）動作が問題なければ、旧Nodeグループを削除する。

#### ▼ ローリングアップデート方式

ローリングアップデート方式でワーカーNodeをアップグレードする方法。一部のクラウドプロバイダー（例：AWS）のみが提供している

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/eks/latest/userguide/update-managed-node-group.html#mng-update
> - https://aws.amazon.com/jp/blogs/news/planning-kubernetes-upgrades-with-amazon-eks/

#### ▼ ブルー/グリーン方式

![kubernetes_cluster-migration](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_cluster-migration.png)

新しいClusterを作成することにより、ワーカーNodeをアップグレードする方法。いずれ（例：ロードバランサー）を基点にしてルーティング先を切り替えるかによって、具体的な方法が大きく異なる。メリットとして、バージョンを1つずつだけでなく飛び越えてアップグレードできる。

（１）旧Cluster（Prodブルー）を残したまま、新Cluster（Testグリーン）を作成する。新Clusterには、全てのKubernetesリソースが揃っている。

（２）社内から、新Clusterに特定のポート番号でアクセスし、動作を確認する。

（３）動作が問題なければ、社外を含む全ユーザーのアクセスのルーティング先を新Clusterに変更する。新Clusterから旧Clusterにロールバックする場合に備えて、旧Clusterは削除せずに残しておく。

> ℹ️ 参考：
>
> - https://logmi.jp/tech/articles/323032
> - https://logmi.jp/tech/articles/323033
> - https://zenn.dev/nameless_gyoza/articles/how-to-update-eks-cluster-safely

<br>

## 06. CIDRブロックの設計

### ワーカーNodeの場合

Kubernetesでは、稼働する可能性のあるPod数から、NodeのCIDRブロックを算出すると良い。アプリケーションのPodがスケーリングすることや、カスタムリソース（例：Istio）を導入することも考慮して、尤もらしいIPアドレス数を算出できる。削除されるPodと作成されるPodが別のIPアドレスになるようにするために（IPアドレスの再利用を防ぐために）、Podの最大数の2倍のIPアドレスを持つCIDRブロックを設定すると良い。

> ℹ️ 参考：https://cloud.google.com/kubernetes-engine/docs/how-to/flexible-pod-cidr

| Node当たりの最大Pod数 | ワーカーNode当たりのCIDRブロック | IPアドレス数 |
| ------------------------- | ------------------------ | -------------- |
| ```1```                   | ```/32``` | ```2```        |
| ```8```                   | ```/28```                | ```16```       |
| ```9``` ～ ```16```       | ```/27```                | ```32```       |
| ```17``` ～ ```32```      | ```/26```                | ```64```       |
| ```33``` ～ ```64```      | ```/25```                | ```128```      |
| ```65``` ～ ```110```     | ```/24```                | ```256```      |

<br>

### サブネットの場合

AWS EKSでの目安であるが、サブネットごとに```/19```や```/20```なるように設計するのが、個人的にはおすすめ。

<br>

## 07. 監視ポリシー

### Cluster

> ℹ️ 参考：https://www.tigera.io/learn/guides/kubernetes-monitoring/

| メトリクス       | 単位     | 説明                                                       | アラート条件例                                                 |
| ---------------- | -------- | ---------------------------------------------------------- |---------------------------------------------------------|
| Nodeの必要最低数 | カウント | 同じCluster内のNode数の必要最低数をデータポイントとする。  | ・統計 : 期間内合計数<br>・期間 : ```5```分<br>・閾値 : ```<= 2```       |
| Podの必要最低数  | カウント | 同じCluster内のNodeのPod必要最低数をデータポイントとする。 | ・統計 : 期間内合計数<br>・期間 : ```5```分<br>・閾値 : ```<= 1```       |
| CPU              | %        | 同じCluster内のNodeのCPU使用率をデータポイントとする。     | ・統計 : 期間内平均使用率<br>・期間 : ```5```分<br>・閾値 : ```>= 80``` |
| Memory           | %        | 同じCluster内のNodeのメモリ使用率をデータポイントとする。  | ・統計 : 期間内平均使用率<br>・期間 : ```5```分<br>・閾値 : ```>= 80``` |

<br>

### Pod

#### ▼ Pod全体

> ℹ️ 参考：https://www.tigera.io/learn/guides/kubernetes-monitoring/

| メトリクス      | 単位     | 説明                                                      | アラート条件例                                               |
| --------------- | -------- | --------------------------------------------------------- |-------------------------------------------------------|
| CPU             | %        | Pod全体のCPU使用率をデータポイントとする。                | ・統計 : 期間内平均使用率<br>・期間 : ```5```分<br>・閾値 : ```>= 80``` |
| Memory          | %        | Pod全体のメモリ使用率をデータポイントとする。             | ・統計 : 期間内平均使用率<br>・期間 : ```5```分<br>・閾値 : ```>= 80``` |
| Podの最低必要数 | カウント | 同じDeployment内のPodの必要最低数をデータポイントとする。 | ・統計 : 期間内合計数<br>・期間 : ```5```分<br>・閾値 : ```<= 2```       |

#### ▼ コンテナ

> ℹ️ 参考：https://www.tigera.io/learn/guides/kubernetes-monitoring/

| メトリクス     | 単位     | 説明                                                     | アラート条件例                                               | 補足                                                         |
| -------------- | -------- | -------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| CPU            | %        | コンテナのCPU使用率をデータポイントとする。              | ・統計 : 期間内平均使用率<br>・期間 : ```5```分<br>・閾値 : ```>= 80``` |                                                              |
| Memory         | %        | コンテナのメモリ使用率をデータポイントとする。           | ・統計 : 期間内平均使用率<br>・期間 : ```5```分<br>・閾値 : ```>= 80``` |                                                              |
| readinessProbe | カウント | コンテナのreadinessProbeの失敗数をデータポイントとする。 | ・統計 : 期間内合計数<br>・期間 : ```1```分<br>・閾値 : ```>= 2``` | ネットワーク由来の問題で発生することがあるため、連続的に発生した上でアラートする。 |

<br>

## 07. Kubernetesリソースの脆弱性対策

### 認証/認可の実施

#### ▼ Kubernetesリソースの場合

RoleやClusterRoleを使用して、ServiceAccountに適切な認可スコープを付与する。

> ℹ️ 参考：
>

> - https://qiita.com/sheepland/items/67a5bb9b19d8686f389d
> - https://speakerdeck.com/kyohmizu/saibagong-ji-kara-kubernetes-kurasutawoshou-rutamefalsexiao-guo-de-nasekiyuriteidui-ce?slide=18

#### ▼ コンテナの場合

Podの```spec.securityContext```キーを使用して、コンテナのプロセスの実行ユーザーに認可スコープを付与する。

> ℹ️ 参考：
>
> - https://kubernetes.io/docs/tasks/configure-pod-container/security-context/
> - https://speakerdeck.com/kyohmizu/saibagong-ji-kara-kubernetes-kurasutawoshou-rutamefalsexiao-guo-de-nasekiyuriteidui-ce?slide=18

<br>

### 機密な変数の管理

#### ▼ Secretの変数の場合

Secretの```data```キーには、```base64```方式でエンコードされた値を設定する必要がある。この```base64```方式エンコード値をどのように管理するかには選択肢がある。

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/secret-management/
> - https://www.thorsten-hans.com/encrypt-your-kubernetes-secrets-with-mozilla-sops/

| 管理方法                                                 | 説明                                                                                                                                                       |
| -------------------------------------------------------- |----------------------------------------------------------------------------------------------------------------------------------------------------------|
| GitHub                                                   | ```base64```方式エンコード値をGitHubリポジトリでそのまま管理する。非推奨である。                                                                                                        |
| GitHub + 疑似的なキーバリュー型ストレージ                | ```base64```方式エンコード値を暗号化キー（例：AWS KMS、GCP KMS、など）でさらに暗号化し、疑似的なキーバリュー型ストレージ（例：sops）で管理する。デプロイ時に```base64```方式エンコード値に復号化する。                                 |
| GitHub + クラウドのキーバリュー型ストレージ + Secret CSI | ```base64```方式エンコード値を暗号化キー（例：AWS KMS、GCP KMS、など）でさらに暗号化し、クラウドのキーバリュー型ストレージ（例：AWS SMパラメーターストア、GCP SecretManager、など）で管理する。デプロイ時に```base64```方式エンコード値に復号化する。 |

<br>

## 08. CIパイプライン

### マニフェストファイルのホワイトボックステスト

#### ▼ 静的解析

| 観点            | 説明                                                                 | 補足                                                         |
|---------------|--------------------------------------------------------------------| ------------------------------------------------------------ |
| 文法の誤りテスト          | 外部の文法の誤りテストツール（（例：kubeconform）を使用して、マニフェストファイルの文法の誤りを検証する。          | ℹ️ 参考：https://mixi-developers.mixi.co.jp/kubeconform-2bb477371e06 |
| ベストプラクティス違反テスト    | 外部のベストプラクティス違反テストツール（例：polaris）を使用して、チャートの脆弱性を検証する。                 | ℹ️ 参考：https://gavin-zhou.medium.com/%E3%83%99%E3%82%B9%E3%83%88%E3%83%97%E3%83%A9%E3%82%AF%E3%83%86%E3%82%A3%E3%82%B9%E3%81%A8%E3%83%9D%E3%83%AA%E3%82%B7%E3%83%BC%E3%81%AE%E3%81%9F%E3%82%81%E3%81%AEkubernetes-yaml%E3%81%AE%E3%83%90%E3%83%AA%E3%83%87%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3-%E7%AC%AC%E5%9B%9B%E7%AB%A0-bc00f1610a3 |
| 非推奨apiVersionテスト  | 外部の非推奨apiVersionテストツール（例：pluto）を使用して、マニフェストファイルの非推奨apiVersionを検証する。 | ℹ️ 参考：https://zenn.dev/johnn26/articles/detect-kubernetes-deplicated-api-automatically |
| 脆弱性テスト            | 外部の脆弱性テストツール（例：trivy）を使用して、マニフェストファイルの脆弱性を検証する。                     | ℹ️ 参考：<br>・https://blog.nflabs.jp/entry/2021/12/24/091803<br>・https://weblog.grimoh.net/entry/2022/01/02/100000 |

<br>

## 08-02. CDパイプライン

### マニフェストのブラックボックステスト

#### ▼ 結合テスト

テスト環境に対して```kubectl apply```コマンドを実行し、追加/変更を含む複数のマニフェストを組み合わせた結合テストを実施する。

#### ▼ 総合テスト

テスト環境に対して```kubectl apply```コマンドを実行し、既存機能/追加/変更を含む全てのチャートを組み合わせた総合テストを実施する。

> ℹ️ 参考：https://camunda.com/blog/2022/03/test/

<br>

### デプロイ

#### ▼ CDパイプラインがある場合

本番環境に対して、CDツールを使用して```kubectl apply```コマンドを実行する。

| 採用可能な戦略              | 具体的な方法                             |
|----------------------|------------------------------------|
| インプレースデプロイメント（非推奨）   | DeploymentのReplace戦略を採用する。非推奨である。 |
| ローリングアップデート          | DeploymentのRollingUpdate戦略を採用する。|
| BGデプロイメント            | CDツールのBGデプロイメント機能を採用する。            |
| カナリアリリース             | CDツールのカナリアリリース機能を採用する。             |
| Progressive Delivery | CDツールのProgressive Delivery機能を採用する。 |

#### ▼ CDパイプラインがない場合（非自動化）

本番環境に対して、手動で```kubectl apply```コマンドを実行する。

| 採用可能な戦略            | 具体的な方法                           |
|--------------------|----------------------------------|
| インプレースデプロイメント（非推奨） | DeploymentのReplace戦略を採用する。非推奨である。 |
| ローリングアップデート        | DeploymentのRollingUpdate戦略を採用する。|


<br>

### ロールバック

#### ▼ CDパイプラインがない場合（非自動化）

Kubernetesには、マニフェストファイルのロールバック機能がない。そこで、過去のリリースタグを```kubectl apply```コマンドでデプロイすることにより、バージョンをロールバックする。

#### ▼ CDパイプラインがある場合

CDツールの機能（例：BGデプロイメント、カナリアリリース、Progressive Delivery、など）を採用する。

<br>

## 08-03. 事後処理

### 通知

#### ▼ CDパイプラインがある場合

CDツールの通知機能（例：ArgoCD Notification）を使用して、ArgoCDによるデプロイの結果が通知されるようにする。

#### ▼ CDパイプラインがない場合（非自動化）

手動で周知する。

<br>
