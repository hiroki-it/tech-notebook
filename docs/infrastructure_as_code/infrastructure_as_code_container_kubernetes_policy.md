---
title: 【IT技術の知見】設計ポリシー＠Kubernetes
description: 設計ポリシー＠Kubernetesの知見を記録しています。
---

# 設計ポリシー＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 実行環境

### 開発環境

参考：

- https://codefresh.io/kubernetes-tutorial/local-kubernetes-mac-minikube-vs-docker-desktop/
- https://blog.cybozu.io/entry/2019/07/03/170000

|                        | Minikube                                                     | Docker for Desktop                                           | Kind                                                 |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------------------------- |
| 概要                   | カスタマイズ性が高いため、カスタマイズ次第で本番環境と開発環境の差異を小さくできる。2022年3月の現在では、Kubernetesの開発環境として、ベタープラクティスである。 | セットアップが非常に簡単（有効化するだけ）なので、開発に取り掛かるまでが早い。 | セットアップが簡単なので、開発に取り掛かるまでが早い |
| セットアップの難易度   | 簡単                                                         | 非常に簡単                                                   | 簡単                                                 |
| Kubernetesのバージョン | 任意のバージョンを指定できる。                               | Docker for Desktopのバージョンごとに、Kubernetesのバージョンが固定される。 | 任意のバージョンを指定できる。                       |
| マルチNode             | 不可                                                         | 可能                                                         | 可能                                                 |
| Nodeのカスタマイズ性   | 高い                                                         | 低い                                                         | 高い                                                 |

<br>

### 本番環境

参考：https://techstep.hatenablog.com/entry/2019/12/23/000715

|            | 全て自前                                                     | 作成ツール（Kubeadm、Rancher、Kops、Kubespray）              | クラウドプロバイダー（AWS EKS、GCP GKE、など）               |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 説明       | オンプレ、仮想サーバー上にマスターNodeやワーカーNodeとなる仮想サーバーを事前に作成しておく。仮想サーバー上にKubernetesをセットアップする。 | オンプレ/仮想サーバー上にマスターNodeやワーカーNodeとなる仮想サーバーを事前に作成しておく。ツールを使用して、仮想サーバー上にKubernetesをセットアップする。 | クラウドプロバイダーが仮想サーバー上にKubernetesをセットアップしてくれている。 |
| メリット   | 全て自前なため、自由にカスタマイズできる。                   | カスタマイズ性が高い。                                       | マネージドであるため、ユーザーがKubernetesのNodeを管理するコストが低い。2022年3月の現在では、Kubernetesの本番環境として、ベタープラクティスである。 |
| デメリット | ユーザーがKubernetesのNodeを管理するコストが高い。           | ユーザーがKubernetesのNodeを管理するコストが高い。           | カスタマイズ性が低い                                         |

<br>

## 02. リポジトリ構成

### リポジトリ分割のメリット

リポジトリを分割することで、以下のメリットがある。

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

## 02-02. ディレクトリ構成

### ディレクトリ/ファイルの構成

#### ▼ マイクロサービス別

マイクロサービス別にディレクトリを作成し、Kubernetesリソースごとに別々のマニフェストファイルを作成する。マニフェストの```apply```の順番を制御しにくいデメリットがある。

参考：https://www.amazon.co.jp/dp/B08FZX8PYW

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

さらに、実行環境やコンポーネント（app、db）別に分割してもよい。

```yaml
repository/
└── foo/ # fooサービス
    ├── dev # 開発環境
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

ディレクトリを作成しない。その代わりに、マイクロサービス別にマニフェストファイルを作成し、関連する全てのKubernetesリソースをこの中で定義する。

```yaml
repository/
├── foo.yaml # fooサービス（Deployment、Service、PersistentVolume、...）
├── bar.yaml # barサービス
└── baz.yaml # bazサービス
```

<br>

## 03. 命名規則

### labelsキー

#### ▼ app.kubernetes.io

Kubernetesに関する```metadata.labels```キーを以下に示す。

参考：https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/

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

ケバブケースとする。ファイル名は、ディレクトリ構成による。

#### ▼ 拡張子

Kubernetesに関する開発プロジェクトを確認すると、そのほとんとで、```.yaml```ファイルの拡張子を```yml```ではなく```.yaml```でしている。そこで、Kubernetesや関連技術（Istio、Helm、Skaffold、Envoy、など）の```.yaml```ファイルの拡張子を```.yaml```で統一する。

<br>

## 04. アップグレード

### アップグレード要件

- アプリケーションでダウンタイムが発生しない。
- 稼働中の全体リソースが減らない。
- マスターNodeでは、kube-contoroller-manager、kube-schedulerの許容するが抑えられる。
- ワーカーNodeのストレージの消去は許容する。

<br>

### Clusterのアップグレード

#### ▼ ライブアップグレード

![kubernetes_live-upgrade](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_live-upgrade.png)

既存のClusterのバージョンをそのままアップグレードする方法。Cluster内で旧ワーカーNodeと旧マスターNodeを残したまま、新マスターNodeとワーカーNodeをapplyする。新Nodeが正常に稼働したことが確認できたら、ここで```kubectl drain --ignore-daemonsets```コマンドを実行すると、Drain処理が始まる。コマンドで```--ignore-daemonsets```オプションを有効化しないと、DaemonSetのPodを退避させられない。Drain処理では、旧NodeからPodが退避し、現在稼働中の新しいNodeでPodが再作成される。Drain処理が完了すれば、旧Nodeは停止してもよい。一度に作業するNode数（Surge数）を増やすことで、アップグレードの速さを制御できる。デメリットとして、新しいバージョンを1つずつしかアップグレードできない。

参考：

- https://logmi.jp/tech/articles/323032
- https://logmi.jp/tech/articles/323033
- https://qiita.com/tkusumi/items/946b0f31931d21a78058

#### ▼ Clusterマイグレーション

![kubernetes_cluster-migration](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_cluster-migration.png)

新しいバージョンのClusterを作成する方法。旧Cluster（Prodブルー）を残したまま、新マスターNodeとワーカーNodeを含むCluster（Testグリーン）をapplyする。特定のポート番号からのみ新Clusterにアクセスできるようにし、新Clusterの動作を開発者の目で確認する。新Clusterの動作に問題がなければ、社外を含む全てのアクセスのルーティング先を、新Clusterに手動で切り替える。新Clusterへの切り替えが完全に完了した後、新ClusterからCluster環境にロールバックを行う場合に備えて、旧Clusterは削除せずに残しておく。何を基点にしてルーティング先を切り替えるかによって、具体的な方法が大きく異なり、ロードバランサーを基点とする場合が多い。メリットとして、バージョンを1つずつだけでなく飛び越えてアップグレードできる。

参考：

- https://logmi.jp/tech/articles/323033
- https://zenn.dev/nameless_gyoza/articles/how-to-update-eks-cluster-safely

<br>

## 05. CIDRブロックの設計

### ワーカーNodeの場合

Kubernetesでは、稼働する可能性のあるPod数から、NodeのCIDRブロックを算出すると良い。アプリケーションのPodがスケーリングすることや、Istioなどのリソースを導入することも考慮して、尤もらしいIPアドレス数を算出できる。削除されるPodと作成されるPodが別のIPアドレスになるようにするために（IPアドレスの再利用を防ぐために）、Podの最大数の2倍のIPアドレスを持つCIDRブロックを設定すると良い。

参考：https://cloud.google.com/kubernetes-engine/docs/how-to/flexible-pod-cidr

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

## 06. 監視の設計

### Cluster

参考：https://www.tigera.io/learn/guides/kubernetes-monitoring/

| メトリクス       | 単位     | 説明                                                       | アラート条件例                                                 |
| ---------------- | -------- | ---------------------------------------------------------- |---------------------------------------------------------|
| Nodeの必要最低数 | カウント | 同じCluster内のNode数の必要最低数をデータポイントとする。  | ・統計 : 期間内合計数<br/>・期間 : ```5```分<br/>・閾値 : ```<= 2```       |
| Podの必要最低数  | カウント | 同じCluster内のNodeのPod必要最低数をデータポイントとする。 | ・統計 : 期間内合計数<br/>・期間 : ```5```分<br/>・閾値 : ```<= 1```       |
| CPU              | %        | 同じCluster内のNodeのCPU使用率をデータポイントとする。     | ・統計 : 期間内平均使用率<br/>・期間 : ```5```分<br/>・閾値 : ```>= 80``` |
| Memory           | %        | 同じCluster内のNodeのメモリ使用率をデータポイントとする。  | ・統計 : 期間内平均使用率<br/>・期間 : ```5```分<br/>・閾値 : ```>= 80``` |

<br>

### Pod

#### ▼ Pod全体

参考：https://www.tigera.io/learn/guides/kubernetes-monitoring/

| メトリクス      | 単位     | 説明                                                      | アラート条件例                                               |
| --------------- | -------- | --------------------------------------------------------- |-------------------------------------------------------|
| CPU             | %        | Pod全体のCPU使用率をデータポイントとする。                | ・統計 : 期間内平均使用率<br>・期間 : ```5```分<br>・閾値 : ```>= 80``` |
| Memory          | %        | Pod全体のメモリ使用率をデータポイントとする。             | ・統計 : 期間内平均使用率<br>・期間 : ```5```分<br>・閾値 : ```>= 80``` |
| Podの最低必要数 | カウント | 同じDeployment内のPodの必要最低数をデータポイントとする。 | ・統計 : 期間内合計数<br>・期間 : ```5```分<br>・閾値 : ```<= 2```       |

#### ▼ コンテナ

参考：https://www.tigera.io/learn/guides/kubernetes-monitoring/

| メトリクス     | 単位     | 説明                                                     | アラート条件例                                               | 補足                                                         |
| -------------- | -------- | -------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| CPU            | %        | コンテナのCPU使用率をデータポイントとする。              | ・統計 : 期間内平均使用率<br>・期間 : ```5```分<br>・閾値 : ```>= 80``` |                                                              |
| Memory         | %        | コンテナのメモリ使用率をデータポイントとする。           | ・統計 : 期間内平均使用率<br>・期間 : ```5```分<br>・閾値 : ```>= 80``` |                                                              |
| readinessProbe | カウント | コンテナのreadinessProbeの失敗数をデータポイントとする。 | ・統計 : 期間内合計数<br/>・期間 : ```1```分<br/>・閾値 : ```>= 2``` | ネットワーク由来の問題で発生することがあるため、連続的に発生した上でアラートする。 |

<br>
