---
title: 【IT技術の知見】プラクティス集＠Kubernetesリソース
description: プラクティス集＠Kubernetesリソースの知見を記録しています。
---

# プラクティス集＠Kubernetesリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## Cluster

### バックアップ

例えば永続ボリュームを使用しているなど、クラスターのetcdの現在の状態の回復が必要な場合、障害でクラスター上のデータが損失することに備え、バックアップツール (例：Velero) を使用してクラスターバックアップを定期的に実行する。

もし単純に新しいKubernetes Clusterにビルド可能なmanifestsを再インストール(kubectl apply)するだけで問題無く回復できるようなケースでは必ずしもクラスターバックアップは必要ない。

> - https://velero.io/

<br>

### クラスターのDR構成

特定のリージョンのみにシステムを配置してしまうと、大規模な障害 (例：災害によるデータセンター大爆発！) があった場合に、システムのダウンタイムとなる。

システムに持たせたい耐障害性などにもよるが、こういったリージョン単位での障害に備える場合は複数リージョンでKubernetes Clusterを構成することで耐障害性を高めることができる。

複数リージョンでの構成には主に以下のパターンがある。

|      | リージョン別Clusterパターン                                                                                                                                | リージョン横断Clusterパターン                                                                                                                                            |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 説明 | リージョンごとに同一構成のClusterを配置する。                                                                                                              | Cluster内で、コントロールプレーンNodeとワーカーNodeを異なるリージョンに配置する。                                                                                        |
| 備考 | リージョン間クラスターを構築する場合、当然リージョン内のクラスターと比べ通信の遅延が発生するため、リージョン間のetcd同期が遅くなったりといった影響がある。 | リージョンを横断する形でクラスターを構築した場合でも、DBなどの永続データを持つシステムは片方のリージョンだけで動かすか、あるいはリージョンをまたいで構築する必要がある。 |

上記の通りそれぞれ一長一短があり、運用コストも当然増加することになるため、十分に検討を行った上で必要に応じてDR構成を検討する。

<br>

### ハードウェアをサイジングする

#### ▼ CPU / メモリをサイジングする

性能目標値に基づいて、Nodeのスペック/数を適切に選び、Cluster全体のCPU / メモリをサイジングする。

ロードテストを実施して、実地的な状況 (例：平常時、ピーク時、障害時) な負荷を再現し、性能目標を達成できるかを検証する。

- 平均スループット
- 平均レスポンスタイム
- 平均ハードウェア使用率
- 時間当たり平均トランザクション数

例えば、`1`秒間に`50`人のユーザーからリクエスト (`50`個/秒のリクエスト) があり、この時のレスポンスタイム目標値が`3`秒以内であるとする。

この場合、平均スループットの目標値は`50` (個/秒) 、平均レスポンスタイムの目標値は`3`秒以内、となる。

> - https://en.wikipedia.org/wiki/Load_testing
> - https://gihyo.jp/dev/serial/01/tech_station/0008

ロードテストの結果をメトリクスとして収集し、サイジングを最適化していく。

この時、以下の設定値を調整し、Cluster全体をサイジングする。

|                                                      | AWS EKS                                    | Google Cloud GKE           |
| ---------------------------------------------------- | ------------------------------------------ | -------------------------- |
| 適するアプリケーションのドメインやハードウェアの種類 | インスタンスファミリーで決まる             | マシンファミリーで決まる。 |
| 同じインスタンスファミリー内での新しさ               | インスタンス世代で決まる                   | マシンシリーズで決まる。   |
| CPU/メモリのスペックの高さ                           | インスタンスサイズインスタンス世代で決まる | マシンサイズで決まる。     |
| Nodeの数                                             | EC2 / Fargate の数で決まる。               | GKE Nodeの数で決まる。     |
| NodeにスケジューリングできるPodの上限数              | インスタンスサイズで決まる                 |                            |

#### ▼ ストレージをサイジングする

記入中...

<br>

### 適切な方法でアップグレードする

#### ▼ 適切なアップグレードを採用する

アップグレード以下のいずれかを採用する。

|                                           | インプレース方式                                                                                                                                                                                                                                                                        | ローリング方式(サージ方式、ライブ方式)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | NodeグループB/G方式(マイグレーション方式)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Cluster B/G方式(マイグレーション方式)                                                                                                                                                                                                                                                     |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 説明                                      | 新しくNodeは作成せずに、既存のNode内のK8sコンポーネントをそのままアップグレードする。既存のNodeを一定台数ごとに更新を実行するため、更新中はクラスタ全体のノードのキャパシティが少なくなる点に注意する。また、既存のNodeをアップデートしてしまうため、切り戻しが難しい点を認識しておく。 | アップグレード時に、Nodeグループに紐づくNodeテンプレートを更新し、旧Nodeグループ内のワーカーNodeを順にドレインしていくことにより、Nodeを入れ替える。クラウドプロバイダー (例：AWS、GCP) ではローリング方式をサポートしている場合がある。例えばAWS EC2のAuto Scalingグループは、アップグレードを開始すると、新旧の起動テンプレートを更新する。新旧の起動テンプレート配下のEC2 Nodeを段階的に入れ替えることにより、ローリングアップグレードを実現する。GKE の場合は maxSurge と maxUnavailableを指定し、その設定に応じてローリングアップデートを実行する。 | 現K8sバージョンのNodeグループ (ブルー) を残したまま、新K8sバージョンのNodeグループ (グリーン) を作成する。ブルーのNodeグループをcordonし、Cluster Autoscalerなどのスケール対象からも外す。ブルーのNodeグループからグリーンのNodeグループにPodを移動する。ノードに対してdrainを実行したり、アプリケーションを再デプロイするなど、Podを移動する方法は複数ある。新Nodeグループで起動したPodにトラフィックが流れることで、開発者はコンテナの動作を確認する。問題なければ、現行Nodeグループを削除する。一方で、もし新Nodeグループで問題あれば、現Nodeグループをそのまま使用する。GKEにはNodeグループB/G方式をhttps://cloud.google.com/kubernetes-engine/docs/concepts/node-pool-upgrade-strategies?hl=ja#cluster-autoscaler-blue-greenがある。 | 現K8sバージョンのCluster (ブルー) を残したまま、新K8sバージョンのCluster (グリーン) を作成する。開発者は、新Cluster上のコンテナの動作を確認する。問題なければ、DNSやロードバランサーの振り分け先を新Clusterに切り替える。一方で、もし新Clusterで問題あれば、現Clusterをそのまま使用する。 |
| 採用可能なオーケストレーター(2023/10時点) | kubeadm                                                                                                                                                                                                                                                                                 | AWS EKS、Google GKE                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | AWS EKS、Google GKE                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | AWS EKS、Google GKE                                                                                                                                                                                                                                                                       |
| 金銭コスト                                | 既存のNodeをそのまま使用する。そのため、既存のコストと変わらない。                                                                                                                                                                                                                      | 使用するマネージドサービスや、アップデート設定にもよるが、新Nodeを作成するような設定の場合は新Nodeを作成した後に旧Nodeをドレインするまでの間、Nodeの台数が増えることになるのでコストが多く発生することになる。そのため、アップグレードの際に増えるNode台数を予め計測しておきアップグレードにかかるコストについて見積もりをとっておくようにする。                                                                                                                                                                                                         | 新Nodeグループを作成することでNodeが二倍になる。そのため、金銭コスト見積もりでは各Nodeグループのアップグレードの間、平常時の2倍コストがかかることを想定しておく。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 新Clusterを作成することでNodeが二倍になる。そのため、金銭コスト見積もりではクラスターアップグレードを実施~動作確認などを経て旧クラスター削除するまでの間、平常時の2倍コストがかかることを想定しておく。                                                                                   |
| 切り戻ししやすさ                          | しにくい                                                                                                                                                                                                                                                                                | しにくい                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | しやすい                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | しやすい                                                                                                                                                                                                                                                                                  |

> - [Control Plane - EKS Best Practices Guides](https://aws.github.io/aws-eks-best-practices/reliability/docs/controlplane/#handling-cluster-upgrades
> - [マネージド型ノードの更新動作 - Amazon EKS](https://docs.aws.amazon.com/eks/latest/userguide/managed-node-update-behavior.html
> - https://cloud.google.com/kubernetes-engine/docs/concepts/node-pool-upgrade-strategies?hl=ja#choose-blue-green-upgrades

#### ▼ クラスターアップグレードのルールを決める

Kubernetes Clusterの規模や運用しているシステム、アップグレード方法によってはアップグレード時間が長くかかることもあれば、既存システムに影響がある可能性もある。

また、Kubernetes Clusterのバージョンアップによって既存のmanifestsを変更しなければ行けないケースも発生する。

そのためKubernetes Clusterのアップグレードでは、どのようなルールやフローで実施するのかをルール化して実施することでアップグレードの安全性を高められる。

例えば下記のようなルールを盛り込んだアップグレードルールを作成する。

- クラスターアップグレードにあたっての準備
  - クラスターアップグレード前に https://github.com/kubernetes/kubernetes/tree/master/CHANGELOG を確認し、(おおまかにでも)変更内容について確認する
  - クラスターアップグレード前に廃止されるAPIグループのバージョンを確認することで、変更が必要な既存のmanifestsを確認する
  - 予め検証環境で本番環境と(限りなく)同じ設定のクラスターのアップグレード~動作確認を行い、問題無くアップグレード可能かを検証する
  - 監視ツールなどで廃止されるメトリクスを使用したクエリロジックが無いかを確認する
  - クラスターにインストールしてる各種Helm ChartやOperatorが対象のクラスターバージョンで正常に動作するか or サポートしているかを確認する
- クラスターバージョンのアップグレード戦略
  - Kubernetesの「https://kubernetes.io/releases/version-skew-policy/#supported-component-upgrade-order」と「Kubernetes Release Versioning』に沿ったバージョンアップを実行する
  - パッチバージョンのアップグレードについてはCHANGELOGに基づいて修正されたバグの影響度に応じて実施する
  - マイナーバージョンのアップグレードについては1バージョンずつアップグレードを実施する
  - 約4ヶ月毎のマイナーバージョンのリリース毎にマイナーバージョンのアップグレードを実施する or xヶ月毎(12ヶ月以内)にそのタイミングの最新バージョンまでアップグレードを実施する
  - ローリングアップグレードやB/G方式などクラスターバージョンのアップグレード方法を決める
- アップグレード手順
  - アップグレードの手順や動作確認方法、必要に応じてアップグレード完了後の旧クラスターの削除方法などをドキュメント化する
  - また、アップグレードに失敗した際の切り戻し手順のドキュメント化を実行する
  - アップグレード後の動作確認ではPodだけでなくWorkloadのコンディションとステータスを確認する
  - クラスターにインストールしてる各種Helm ChartやOperatorなどが正常に動作しているかを確認する
- クラスター側の設定
  - コントロールプレーンNodeでダウンタイムを発生させないために必要に応じてetcdとkube-apiserverのPodにPod Disruption Budgetの設定を実行する
    - コントロールプレーンがマネージドなGKEやEKSなどでは考慮不要

<br>

## コントロールプレーンNode

### 冗長化する

オンプレ環境などでコントロールプレーンNodeを管理する必要がある場合、コントロールプレーンNodeは`3`台以上に設定して冗長化を実行する。

> - https://www.siderolabs.com/blog/why-should-a-kubernetes-control-plane-be-three-nodes/
> - https://www.mirantis.com/blog/everything-you-ever-wanted-to-know-about-using-etcd-with-kubernetes-v1-6-but-were-afraid-to-ask/

<br>

### ロードバランシングする

オンプレ環境などでkube-apiserverへのリクエストエンドポイントを手動で設定する必要がある場合、ロードバランサーを設定してkube-apiserverのPodへの負荷分散ができるようにする。

ロードバランサーにはIPアドレスを付与してKubernetes Cluster内部と、Kubernetes Clusterのオペレーションが必要なIPアドレスからのリクエストを受け付けられるようにする。

冗長化されたkube-apiserverに適切にインバウンドな通信を振り分けることにより、kube-apiserverの負荷を分散させる。

| パターン                                               | コントロールプレーンNode外 配置パターン | コントロールプレーンNode内配置パターン |
| ------------------------------------------------------ | --------------------------------------- | -------------------------------------- |
| アクティブなルーティング先への仮想IPアドレスの割り当て | keep-alived                             | kube-vip                               |
| L4ロードバランサー                                     | haproxy                                 | kube-vip                               |

> - https://speakerdeck.com/inductor/say-good-bye-to-haproxy-and-keepalived-with-kube-vip-on-your-k8s

<br>

### コントロールプレーンNodeを異なるトポロジーに分散させる

冗長化したコントロールプレーンNodeを特定のトポロジー偏らせてに配置すると、その特定のトポロジーで障害が起こった場合に、コントロールプレーンNodeが全滅してしまう。

そのため、例えばオンプレ環境であればコントロールプレーンNodeを配置するサーバーをラック単位で分けて別の電源を確保しているトポロジーに分散させたり、クラウドのVM環境で動作させる場合にはゾーンを分散させたり、マルチリージョンなデータセンターでKubernetes Clusterを動作させる際にはリージョン単位でコントロールプレーンNodeを分散配置させたりといった手法を取ることで冗長性を高めるようにする。

> - https://kubernetes.io/docs/setup/best-practices/multiple-zones/

<br>

### kube-apiserverへのインバウンド通信を制限する

kube-apiserverに対して、誰でもアクセスできてしまうことは危険である。

そのため、必要最低限の開発者のみがリクエストできるように、インバウンド通信を制限する。

- ファイアウォール
  - kube-apiserverにリクエストを送信できるIPアドレスを制限する。
  - 特定のサーバー (踏み台サーバー、リモートデスクトップのゲートウェイなど) からしか、kube-apiserverにリクエストできないようにする。
- 認証
  - 必要最低限の開発者にのみアカウントを発行する。この時にSSOの仕組みを採用し、kube-apiserverの認証をIDプロバイダー (例：Keycloak、Okta) に委譲すると、kube-apiserverで大量のUserAccountを管理する必要がなくなる。

<br>

### ハードウェアをサイジングする

#### ▼ ストレージをサイジングする

コントロールプレーンにetcdを作成する場合、etcdのディスクアクセスがクラスタ全体のパフォーマンスや安全性に影響するためSSDを利用する。
ストレージ容量は最低限40GiB程度割り当てる。

> - [第2章 システムおよび環境要件 OpenShift Container Platform 3.11 | Red Hat Customer Portal](https://access.redhat.com/documentation/ja-jp/openshift_container_platform/3.11/html/installing_clusters/install-config-install-prerequisites
> - https://cloud.google.com/anthos/clusters/docs/on-prem/latest/how-to/cpu-ram-storage?hl=ja

<br>

## Etcd

<br>

### バックアップする

障害でEtcd上のデータが損失することに備えて、Etcdを定期的にバックアップしておく。

> - https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/

<br>

### 冗長化する

etcd Nodeは3台に冗長化する。

> - https://etcd.io/docs/v3.5/faq/#why-an-odd-number-of-cluster-members
> - https://etcd.io/docs/v3.5/faq/#what-is-maximum-cluster-size
> - https://etcd.io/docs/v3.5/faq/#what-is-failure-tolerance

<br>

### 高性能ストレージを利用する

Disk I/Oはetcdのパフォーマンスに直結するため、SSDなど十分なIOPSを担保できるストレージを利用する。

> - https://etcd.io/docs/v3.5/op-guide/hardware/#disks

<br>

### RAIDのミラーリングやパリティを利用しない

etcdはRaft合意アルゴリズムを利用しており、3台以上のクラスタメンバーが高可用性を実現できるためストレージレイヤでの冗長化は行わない。

> - https://etcd.io/docs/v3.5/op-guide/hardware/#disks

<br>

## ワーカーNode

### 冗長化する

ワーカーNodeはPodの特性 (アプリ系、監視系、ロードバランサー系、バッチ系、サービスメッシュ系など) ごとに作成する。

また、ワーカーNodeをグループ化し、Nodeグループごとに冗長化の程度を設計する。

Nodeグループの特徴に合った数だけ冗長化しつつ、N+1にすると良い。

ここでは、Nodeグループの例をいくつか挙げる。

#### ▼ Stateless / Stateful別

状態を持つPodとそうでないPodを異なるNodeグループ内で稼働させる。

|     | Stateless系(アプリ、バッチ、L7ロードバランサー、サービスメッシュなど) | Stateful系(例：DBなど) |
| --- | --------------------------------------------------------------------- | ---------------------- |
|     |                                                                       |                        |
|     |                                                                       |                        |

#### ▼ プロダクトのサブコンポーネント別

プロダクトの各サブコンポーネントのPodを異なるNodeグループ内で稼働させる。

|                    | アプリ系                                                                      | バッチ系                                                                      | L7ロードバランサー系                                                                                          | 監視系、サービスメッシュ系                                                        |
| ------------------ | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 要件例             | アプリ系Nodeグループはユーザーに影響がある。 そのため、稼働時間を長くしたい。 | バッチ系Nodeグループはユーザーに影響がある。 そのため、稼働時間を長くしたい。 | ロードバランサー系Nodeグループは単一障害点となりユーザーに影響が大きい。 そのため、稼働時間は最も長くしたい。 | 監視系Nodeグループはユーザーに影響がない。 そのため、稼働時間を短くても問題ない。 |
|                    | ⬇️                                                                            | ⬇️                                                                            | ⬇️                                                                                                            | ⬇️                                                                                |
| Nodeの冗長化の程度 | Nodeを多く冗長化する。                                                        | Nodeを多く冗長化する。                                                        | Nodeを最も多く冗長化する。                                                                                    | Nodeを少なく冗長化する。                                                          |

<br>

### オートスケーリング

IaaS環境でNode数をスケールさせることができる余地がある環境では動的にNode数をスケールさせることで処理量の増加に対して柔軟に対応することができるようになる。

KubernetesではNodeに対する動的なスケール手段としてcluster autoscaler、Karpenterといったアプリケーションが用意されているため、これらを利用してオートスケーリングできるようにする。

<br>

### 適切なOS、CPUアーキテクチャを選ぶ

コントロールプレーンNodeと重複するため、省略する。

<br>

### ハードウェアをサイジングする

#### ▼ CPU/メモリをサイジングする

Nodeグループ内のPod数やCPU/メモリ要求の特徴に合った量を割り当てる。

Cluster全体に割り当てられたハードウェアリソースを適切に分配できるように設計する。

(Nodeグループ例1)

|     | Stateless系(アプリ、バッチ、L7ロードバランサーなど) | Stateful系(例：監視ツールなど) |
| --- | --------------------------------------------------- | ------------------------------ |
|     |                                                     |                                |
|     |                                                     |                                |

(Nodeグループ例2)

|                              | アプリ系                                                                                            | バッチ系                                                                                                                                                        | L7ロードバランサー系                                                                                   | 監視ツール系                                                                                   |
| ---------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Pod数の要件例                | アプリケーションの障害はユーザーに影響があるため、Podの冗長化の程度を他グループよりも大きくしたい。 | バッチの障害はユーザーに影響があるため、Podの冗長化の程度を他グループよりも大きくしたい。                                                                       | L7ロードバランサーは単一障害点になるため、Podの冗長化の程度をNodeグループ内で最も大きくしたい。        | 監視ツールの障害はユーザーに影響がないため、Podの冗長化の程度を他グループよりも小さくしたい。  |
| ハードウェアリソースの要件例 | アプリは恒常的にCPU/メモリを必要とする。 また、Nodeグループ当たりのPodの合計数が多い。              | バッチ系は瞬間的にCPU/メモリを必要とする。 また、Nodeグループ当たりのPodの合計数が多い。                                                                        | L7ロードバランサー系は恒常的にCPU/メモリを必要とする。 一方で、Nodeグループ当たりのPodの合計数が少ない | 監視ツールは恒常的にCPU/メモリを必要とする。 一方で、Nodeグループ当たりのPodの合計数が少ない。 |
|                              | ⬇️                                                                                                  | ⬇️                                                                                                                                                              | ⬇️                                                                                                     | ⬇️                                                                                             |
| 対処例                       | アプリ系NodeグループにはCPU/メモリを他より多めに割り当てる。                                        | バッチ系Nodeグループには瞬間的な要求 (バースト) に適したCPU/メモリを選びつつ、多めに割り当てる。 AWSであればT系のインスタンスタイプが瞬間的な要求に適している。 | L7ロードバランサー系NodeグループにはCPU/メモリを他より多めに割り当てる。                               | 監視ツール系NodeグループにはCPU/メモリを少なめに割り当てる。                                   |

#### ▼ ストレージをサイジングする

Nodeグループにあったストレージを割り当てる。

例えば、ArgoCDがストレージに永続化するデータサイズは少ないため、ArgoCDのNodeグループにはストレージはあまり必要ない。

一方で、PrometheusはメトリクスをNodeのストレージに保管する (外部TSDBを使用するにしても数日分は保管することになる)。

<br>

## コントロールプレーンNodeとワーカーNodeで共通のプラクティス

### 異なるゾーンに分散させる

冗長化したコントロールNodeとワーカーNodeを特定のゾーンに配置すると、そのゾーンのデータセンターで障害が起こった場合に、Nodeが全滅してしまう。

異なるゾーンに分散させるように配置する。

<br>

### 適切なOS、CPUアーキテクチャを選ぶ

- OSは適切なの、くらいな表現になる
- CPUアーキテクチャ
  - armが安いからarm使用する
  - マルチプラットフォームビルドを避けれるなら避けたいのでamdを使用するなど
  - ベースイメージにarm製が少ないから理由がなければamd使用する

<br>

## Ingress

### Ingressインバウンド通信を制限する

社内向けアプリケーションやテスト環境で、インバウンドな通信を全て許可することは危険である。

Ingress Controller (例：Nginx Ingress Controller、AWS Load Balancer Controller、GCE L7 load Balancer Controllerなど) が提供する機能を使用して、インバウンド通信を制限する。

なお、Ingressのインバウンド通信を制限することはあっても、Egressのアウトバウンド通信を制限するとむしろ不便になるため、Egressのアウトバウンド通信は全て許可しておく。

多くのIngress Controllerでは、制限のルールをIngressの`.metadata.annotations`キーに直接設定するか、Ingressから切り離して設定するか (例：ConfigMap、AWS WAF、CloudArmor) を選べる。

管理しやすいように、Ingressから切り離して設定すると良い。

> - https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/
> - https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.6/guide/ingress/annotations/

<br>

### IngressをSSL/TLS終端にする

PodをSSL/TLS終端にする場合、Cluster内でHTTPS通信を使用することになるため、さまざまな対処事項 (例：SSL証明書管理、相互TLSの有無) で実装難易度が上がる。

仮にサービスメッシュを採用すれば対処しやすくなるが、採用しないのであれば自前での対処は大変である。

IngressをSSL/TLS終端にすると、PodへのリクエストはHTTP通信になってしまうが、Cluster内の通信で対処事項が減るため、安全性と利便性を両立できる。

> - https://loft.sh/blog/advanced-guide-to-kubernetes-ingress-controllers/

<br>

### IngressClassの指定にingressClassNameを使用する

IngressClassの指定方法には、`.spec.ingressClassName` キーと`.metadata.annotations.kubernetes.io/ingress.class` キーがある。

`.spec.ingressClassName` キーの指定方法が推奨である。

> - https://kubernetes.io/docs/concepts/services-networking/ingress/#deprecated-annotation

<br>

## CronJob

### failedJobsHistoryLimitを設定する

CronJobでJobが失敗した時、CronJobはデフォルトで過去`1`回分の失敗しか履歴に残さない。

トラブルシューティングしやすくするために、`.spec.startingDeadlineSeconds`キーで`3`回分以上を設定しておく。

> - https://dev.to/drcloudycoder/kubernetes-cronjob-best-practices-4nlk

<br>

### startingDeadlineSecondsを設定する

CronJobのデフォルトの仕様として、Jobが`100`回連続で失敗すると、CronJobを再作成しない限りJobを再実行できなくなる。

1時間にJobを1回実行すると仮定すると、簡単に`100`回を超過してしまう。

```bash
停止時間 (8h) * 実行間隔 (60/h) = 480回
```

この時、`.spec.startingDeadlineSeconds`キーを設定しておくと、これの期間に`100`回連続で失敗した時のみ、Jobを再実行できなくなる。

`100`回連続を判定する期間を短くすることで、再作成しなくてもよくなるようにする。

> - https://engineering.mercari.com/blog/entry/k8s-cronjob-20200908/

<br>

## Job

### ttlSecondsAfterFinishedを設定する

デフォルトでは、失敗したJobはそのまま残る。

ただ、監視ツールがこの失敗したJobのステータスをメトリクスとして収集し続けるため、アラートを発火し続けてしまう。

この時、`.spec.ttlSecondsAfterFinished`キーを設定しておくと、Jobの成功/失敗にかかわらず、実行後のJob自体を自動的に削除できるようになる。

`.spec.ttlSecondsAfterFinished`キーには、Jobの実行終了後に何秒経過してからJob自体を削除するのかを設定する。

## Pod

### 冗長化する

Workload (例：Deployment、DaemonSet、StatefulSet、Jobなど) でPodを冗長化する。

N+1個にすると良い。

<br>

### 水平スケーリングする

HorizontalPodAutoscalerでPodを水平スケーリングする。

水平スケーリングは、Podの負荷が高くなると Pod の台数を増やし、システム全体が高負荷で機能しなくなる状況を避けることができる。

ただし、突発的な高負荷には弱く、Podの台数の増強が間に合わないことがある。

突発的な負荷のタイミングが事前に分かっているなら、事前に最小台数を高めに設定しておく。

HorizontalPodAutoscalerは、metrics-serverの提供するメトリクス (例：CPU使用率、メモリ使用率など) 、カスタムメトリクス、K8s外のメトリクス (ロードバランサーのrps/qps値、メッセージキューの待機リクエスト数など) 、に基づいてPod数を決める。

metrics-serverはデフォルトでClusterに存在していないため、別途インストールしておく必要がある。

最初、Deploymentの`spec.replicas`キーに合わせてPodが作成され、次にHorizontalPodAutoscalerの`.spec.minReplicas`キーが優先される。

この挙動は混乱につながるため、HorizontalPodAutoscalerを使用する場合、Deploymentの`spec.replicas`キーの設定を削除しておくことが推奨である。

> - https://github.com/kubernetes-sigs/metrics-server
> - https://speakerdeck.com/hhiroshell/a-practical-guide-to-horizontal-autoscaling-in-kubernetes?slide=33
> - https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/#migrating-deployments-and-statefulsets-to-horizontal-autoscaling
> - https://stackoverflow.com/a/66431624/12771072

<br>

### ロードバランシングする

#### L7のプロトコルの場合

冗長化したワーカーNodeに負荷分散できるように、ワーカーNodeの送信元にIngress Controllerの管理するL7ロードバランサー (例：Nginx、Envoy、Istio IngressGateway、AWS ALB、Google CLBなど) やこれに相当するもの (例：Gateway-APIを使用しないIstio Ingress Gateway) を配置する。

L7ロードバランサーが冗長化されたNodeに適切にインバウンドな通信を振り分ける。

> - https://kubernetes.io/docs/concepts/workloads/controllers/ttlafterfinished/

#### L4のプロトコルの場合

冗長化したPodに負荷分散できるように、Podの送信元にL4ロードバランサーとしてServiceを配置する。

> - https://www.copado.com/devops-hub/blog/kubernetes-deployment-vs-service-managing-your-pods

<br>

### Podのインバウンド通信を制限する

Podのインバウンド通信を全て許可することは危険である。

そのため、NetworkPolicyを用いて特定のNamespace内のPodに一括して通信の制限する。

ただし、Podの通信に関するさまざまな要件が上がるたびにNetworkPolicyを変更するのは大変なため、採用するかどうかはプロダクトの方針による。

なお、Podのインバウンド通信を制限することはあっても、アウトバウンド通信を制限するとむしろ不便になるため、アウトバウンド通信は全て許可しておく。

<br>

### DaemonSetやStatefulSet配下のPodのスケジューリング優先度を上げる

Nodeでハードウェアリソース不足が起こった場合、Nodeは一部のPodを退避させてこれを解消しようとする。

この時に優先度を設定しないと、DaemonSet配下のPodのスケジューリング優先度が低くなる。

DaemonSet配下のPodは、各Nodeの最低一つずつスケジューリングすることが望ましく、NodeからDaemonSet配下のPodが退避させられると、障害が起こる可能性がある。

また、StatefulSet配下のPodには状態を持たせることが多く、NodeからStatefulSet配下のPodが退避させられると、書き込み中のデータが欠損する可能性がある。

そこで、`.spec.priorityClassName`キーを使用すると、Podのスケジューリング優先度を設定できる。

<br>

### DeploymentやStatefulSetを使用する場合はPodDisruptionBudgetも合わせて作成する

Nodeのスケールインやアップグレード時に、Nodeはドレイン処理を実行し、古いPodを退避させる。

この時にPodDisruptionBudgetを作成しないと、DeploymentやStatefulSet配下の古いPodが一斉に退避してしまう。

1個でも古いPodを動かすことで、ダウンタイムを避けるべきである。

そこで、PodDisruptionBudgetを使用すると、Nodeのドレイン中に退避させるPodの最小最大数 (`spec.maxUnavailable`キー、`spec.minUnavailable`キー) や起動し続ける利用可能なPodの最小最大数 (`spec.minAvailable`キー,`spec.maxAvailable`キー) を設定できる。

<br>

### Deploymentでは適切なデプロイ戦略をぶ

#### ▼ 基本的にはRollingUpdate戦略を選ぶ

RollingUpdate戦略では、既存のPodを稼働させながら、新しいPodをデプロイする。

新旧Podが並列的に稼働するため、クライアントからのリクエストを処理しながら、ダウンタイムなくPodをデプロイできる。

ほとんどのユースケースで、RollingUpdate戦略を選ぶようにする。

#### ▼ 新旧Podが並列的に稼働することを許容しない場合はRecreate戦略を選ぶ

Recreate戦略では、既存のPodを削除した後、新しいPodをデプロイする。

RollingUpdate戦略では、デプロイ時に新旧Podが並列的に稼働するため、アプリケーションの仕様上で不都合がある場合に適さない。

そういったユースケースでは、Recreate戦略を選ぶようにする。

<br>

### Podを異なるNodeに分散させる / 特定のNodeにスケジューリングする

Workload配下のPodを異なるNodeに分散させ、障害を防ぐ。

また、NodeやNodeグループを指定してスケジューリングさせる。

kube-schedulerは、Workload配下のPodを条件に応じてNodeにスケジューリングする。

障害が起こったNodeにWorkload配下のPodが偏っていると、冗長化したPodが全て停止し、サービスに影響する可能性がある。

そのため、Podが特定のNodeに偏らないようにする必要がある。

なお、以降の設定値はPodのスケジューリング時にのみ考慮される。

スケジューリング後に条件と合致しなくなっても、kube-scheduleはPodを再スケジューリングしない。

例えば、一時的な負荷でPodがスケールアウトした場合を考える。

Podをスケジューリングする時は、条件を考慮してPodを分散して配置する。

しかし、一時的な負荷が収まってPodがスケールインする時は、条件を考慮してPodを削除する訳ではない。

そのため、Podの分散配置が保証されなくなる。

Nodeにスケジュール後のPodを定期的に再スケジューリングするために、deschedulerを合わせて使用するとよい。

deschedulerは条件に一致しないPodを退避させるだけで、Podの再スケジューリングはkube-schedulerが実行する。

> - https://garafu.blogspot.com/2019/06/pod-assign-strategy-1.html#podaffinity

#### ▼ NodeSelectorを使用する

NodeSelectorを使用すると、Workload配下のPodを指定したNodeやNodeグループにスケジューリングさせ、Podを分散させられる。

NodeやNodeグループを単純な条件 (例：Nodeのラベルと値の有無) で指定できる。

> - https://kubernetes.io/docs/tasks/configure-pod-container/assign-pods-nodes-using-node-affinity/

#### ▼ NodeAffinityを使用する

NodeAffinityを使用すると、Workload配下のPodを指定したNodeやNodeグループにスケジューリングさせ、Podを分散させられる。

NodeやNodeグループをNodeSelectorよりも複雑な条件 (例：Nodeのラベル自体の有無、Nodeのラベル値の有無) で指定できる。

> - https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#set-based-requirement
> - https://kubernetes.io/docs/tasks/configure-pod-container/assign-pods-nodes-using-node-affinity/

#### ▼ TopologySpreadConstraintsを使用する

TopologySpreadConstraintsを使用すると、ドメイン (例 ゾーン、リージョン、ラック、Node) と制約を定義することで、Workload配下のPodをドメインに対して均等に分散することができる。

NodeSelectorやNodeAffinityとは異なり、特定のドメインにPodが偏らないようにすることで、障害の影響を一部のドメイン内のPodに抑えることができる。

> - https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/

#### ▼ TaintsとTolerationsを使用する

TaintsとTolerationsを使用すると、指定した条件に合致するPod以外をNodeにスケジューリングさせないようにできる。

例えば、Workloadが少ないNodeグループ (`monitoring`、`ingress`など) にTaintを設定し、Workloadが多いNodeグループ (`app`、`system`など) にはこれを設定しないようにする。

すると、`.spec.tolerations`キーを設定しない限り、Podが多いNodeグループの方にPodがスケジューリングされる。

そのため、NodeSelectorやNodeAffinityを使用するより、スケジューリング対象のNodeを設定する手間が省ける。

以下の方法で設定する。

事前にNodeにTaintを設定しておく。

```bash
$ kubectl taint node foo-node group=monitoring:NoSchedule

## NodeグループやNodeプールがある場合、一括してTaintを設定する
```

Taintへの耐性を`.spec.tolerations`キーで設定する。

合致する条件の`.spec.tolerations`キーを持つPodしか、Taintを持つNodeにスケジューリングさせられない。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: prometheus
spec:
  containers:
    - name: prometheus
      image: prom/prometheus
      imagePullPolicy: IfNotPresent
  ## Taintへの耐性をtolerationsで定義する
  tolerations:
    - key: group
      operator: Equal
      value: monitoring
      effect: NoSchedule
```

> - https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/

<br>

### 適切なストレージの種類を選ぶ

#### ▼ 大規模な一時的ストレージを必要とする場合はGeneric Ephemeral Volumesを使用する

Generic Ephemeral Volumesを使用して、PodのデータをK8s外部のストレージ (例：AWS EBS) に一時的に保管できる。

大量の一時データを保管したい場合 (例：画像処理中間データ、音声処理中間データなど) に役立つ。

一時的なストレージのため、Podの作成時にストレージを払い出し、Podが停止するとストレージは削除される。

EmptyDir Volumeとは異なり、NodeのストレージがPodの容量を制限しない。

そのため、Node外ストレージの容量次第では、一時的に保管できるデータサイズがEmptyDirよりも多い。

一方で、Node外ストレージを追加で使用することになるため、金銭的コストがEmptyDirよりも大きい。

> - https://kubernetes.io/docs/concepts/storage/ephemeral-volumes/#generic-ephemeral-volumes
> - https://qiita.com/ysakashita/items/17dd055484f4a878f1b7#ephemeral-volume-%E3%81%A8%E3%81%AF

#### ▼ 小規模な一時的ストレージを必要とする場合はEmptyDir Volumeを使用する

EmptyDir Volumeを使用して、PodのデータをNodeのストレージに一時的に保管できる。

少量の一時データを保管したい場合 (例：キャッシュの保管、バッファリングなど) に役立つ。

Generic Ephemeral Volumeとは異なり、NodeのストレージがPodの容量を制限する。

そのため、Nodeのストレージ次第では、一時的に保管できるデータサイズがEphemeral Volumesよりも少ない。

一方で、Nodeのストレージをそのまま使用することになるため、金銭的コストがEphemeral Volumesよりも小さい。

> - [https://qiita.com/ysakashita/items/17dd055484f4a878f1b7#ephemeral-volume-とは](https://qiita.com/ysakashita/items/17dd055484f4a878f1b7#ephemeral-volume-%E3%81%A8%E3%81%AF
> - https://www.netone.co.jp/knowledge-center/netone-blog/20191206-1/

Podのリソース要求やリソース制限に `ephemeral-storage` のフィールドを追加して、利用するディスク容量を制限することができる。

これにより、schedulerが Nodeのストレージのキャパシティを考慮してPodを配置してくれる。

また、リソース制限で指定した `ephemeral-storage` を超えてディスク容量を使用した場合に、そのPodは退避されて再起動する。

> - https://kubernetes.io/ja/docs/concepts/configuration/manage-resources-containers/#setting-requests-and-limits-for-local-ephemeral-storage

#### ▼ 永続的ストレージを必要とする場合はPersistentVolume (Claim) を使用する

PersistentVolume (Claim) を使用することで特定のストレージ製品のボリュームにPodのデータを永続化することができる。

使用できるストレージ製品はクラスターのインストールされたボリュームプラグイン (≒ CSI Driver) と実行環境に依存しており、そのプラグインを使用するStorageClass

して、PodのデータをNodeのストレージに永続的に保管できる。

StorageClassによるNode外ストレージとは異なり、NodeのストレージがPodの容量を制限する。

そのため、Nodeのストレージ次第では、永続的に保管できるデータサイズがPersistentVolumeよりも少ない。

#### ▼ 大規模な永続的ストレージを必要とする場合はStorageClassによるNode外ストレージを使用する

StorageClassによるK8s外部のストレージ (例：AWS EBS) を使用して、PodのデータをNode外ストレージに永続的に保管できる。

StorageClassでは、NodeのストレージがPodの容量を制限しない。

そのため、Node外ストレージの容量次第では、一時的に保管できるデータサイズがPersistentVolumeよりも多い。

> - https://www.netone.co.jp/knowledge-center/netone-blog/20191206-1/

<br>

### 適切なボリュームアクセスモードを選択する

#### ▼ 独自ファイルシステムやファイルのロックが影響する場合は`.spec.accessMode=ReadWriteOnce`を割り当てる

一つのNodeに対して読み込み/書き込みが可能なボリュームとしてマウントする。

もしNodeにPodのインスタンスが複数ある場合、`ReadWriteOnce`であっても複数のPodから読み込み/書き込みがある。

ロックのあるストレージの場合、Nodeごとにストレージを分割しつつ、Nodeに一つだけスケジューリングされるようにしたPodがストレージを占有した方が良い。

- 例 DB

> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes

#### ▼ 複数Node/Pod間でファイルを共有するアプリケーションには`.spec.accessMode=ReadWriteMany`を割り当てる

複数のノードから読み込み/書き込みを行えるボリュームとしてマウントする。

ファイルシステムでは、Node間でストレージを共有した方が良い。

- 例 NFS、SMB

> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes

#### ▼ 複数Node/Pod間でReadのみを許可するアプリケーションには`.spec.accessMode=ReadOnlyMany`を割り当てる

複数のノードから読み込みのみを行えるボリュームとしてマウントする。

ConfigMapに保管するには大きすぎる設定ファイルや共通データでは、Node間で読み込みストレージを共有した方が良い。

- 例 機械学習モデルのパラメータストア

> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes

<br>

### ラベルを利用して目的に合ったストレージを選択する

アプリケーションによってストレージに求める性能は異なるため、利用用途に合わせて適したスペックのストレージを割り当てる必要がある。

そこでストレージクラスやPersistentVolumeのラベルに`.metadata.label.storage-type=ssd`のようにストレージの種類などを設定し、**`spec.selector.matchLabels: storage-type: ssd`**のように指定することで利用用途に合ったストレージを選択することが出来る。

> - https://thinkit.co.jp/article/14195#h1-4-2-1
> - https://docs.openshift.com/container-platform/3.11/install_config/persistent_storage/selector_label_binding.html

<br>

### 利用用途に合ったReclaim Policyを設定する

#### ▼ 特別な理由がない限りDeleteを指定する

KubernetesのデフォルトではReclaim PolicyがDeleteに指定されている。

Deleteを指定することでPersistentVolumeClaim(PersistentVolumeClaim)を削除しPersistentVolume(PV)が使用されなくなった時点で自動削除され、PVの管理負荷を削減することができるためReclaim Policyは原則Deleteを利用する。

> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#delete

#### ▼ 重要なデータを含むPersistentVolumeClaimはRetainを指定する

DBやファイルストレージ用途などでPersistentVolumeClaimを利用している場合、誤ったPersistentVolumeClaimの削除によるデータ損失を防ぐ必要がある。

そのため重要なデータを保管するPersistentVolumeClaimはReclaim PolicyにRetainを指定し、PVが完全に削除されないよう保護することが出来る。

> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#retain
> - https://access.crunchydata.com/documentation/postgres-operator/latest/guides/storage-retention

#### ▼ RecycleポリシーではなくDynamic Provisioningを利用する

現在RecycleポリシーはDeprecatedされている。

そのためPersistentVolumeClaimのみ削除し、PVは削除しないようなユースケースではDynamic Provisioningを利用する。

> - https://kubernetes.io/docs/concepts/storage/persistent-volumes/#recycle

<br>

### ストレージをPodと同じNodeに作成する

Nodeを冗長化している場合、Workloadは配下のPodを各NodeにスケジューリングされるためPodがアクセスするストレージも同様のNodeに作成する必要がある。

ストレージがPodと異なるNodeに作成された場合、ほかNodeの障害によりストレージを利用できなくなりNodeを超えて障害が伝搬してしまう。

そこで`topologySpreadConstraints`キーを使用することで、Podと同じNodeにストレージをスケジューリングすることができる。

<br>

### StorageClassやPersistentVolumeに適切なラベルを設定する

PodからPersistentVolumeClaimを利用する場合ラベルなどがついていないと、適切なボリューム選択が困難になってしまう。

そのためStorageClassやPersistentVolumeの`metadata.label`に`storage-type=ssd`や`iops=3000`、`environment=prd`などストレージパフォーマンスや環境などボリューム選択に利用できるラベルを設定する。

> - https://thinkit.co.jp/article/14195#h1-4-2-1
> - https://docs.openshift.com/container-platform/3.11/install_config/persistent_storage/selector_label_binding.html#selector-label-volume-define

<br>

### Pod内のコンテナとホスト (Node) のネットワーク名前空間を分離する

#### ▼ hostIPCを無効化する

Podの`.spec.hostIPC`キー有効化すると、Pod内のコンテナのホスト (Node) 間で同じIPC名前空間を使用するようになる。

コンテナのプロセスは、同じIPC名前空間に属する任意のプロセスと通信できるようになる。

ただ、悪意のある人がコンテナに接続した場合に、Nodeの他のプロセスにリクエストできてしまう。

そのため、無効化しておく。

> - https://www.fairwinds.com/blog/kubernetes-basics-tutorial-host-ipc-should-not-be-configured
> - https://www.ianlewis.org/en/what-are-kubernetes-pods-anyway

#### ▼ hostPIDを無効化する

Podの`.spec.hostPID`キー有効化すると、コンテナとNode間で同じPID名前空間を使用するようになる。

NodeとコンテナのプロセスIDが同じになるため、コンテナはNodeのプロセスを操作できるようになる。

つまり、悪意のある人がコンテナに接続した場合に、Nodeのプロセスを操作できてしまう。

そのため、無効化しておく。

> - https://www.fairwinds.com/blog/kubernetes-basics-tutorial-host-ipc-should-not-be-configured
> - https://medium.com/@chrispisano/limiting-pod-privileges-hostpid-57ce07b05896
> - https://gihyo.jp/admin/serial/01/linux_containers/0002#sec4_h5

<br>

## コンテナ

### ヘルスチェックを設定する

!https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_probe.png

kubeletは、コンテナをヘルスチェック (例：StartupProbe ➡️ LivenessProbe／ReadinessProbe) し、障害を防ぐ。

LivenessProbeヘルスチェックとReadinessProbeヘルスチェックの間に順番はなく、独立して実行される。

言語やフレームワークによってはStartupProbe用のエンドポイントが提供されていない場合があり、ReadinessProbeヘルスチェック用のエンドポイントをStartupProbeヘルスチェックの対象として代用する。

|                  | StartupProbeヘルスチェック                                                                                                                                                     |     | LivenessProbeヘルスチェック                                                                                                                               | ReadinessProbeヘルスチェック                                                                                                                                                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-: | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 説明             | ヘルスチェックを実行することで、コンテナ内のアプリケーションの起動が完了したかを確認する。ReadinessProbeよりも先に実行される。ReadinessProbeと違って起動時にしか実行されない。 | ➡️  | ヘルスチェックを実行することで、コンテナが正常に動作しているか確認する。 注意点として、LivenessProbeの間隔が短すぎると、kubeletに必要以上に負荷がかかる。 | ヘルスチェックを実行することで、コンテナがトラフィックを処理可能かを確認する。 コンテナが起動してもトラフィックを処理できるようになるまでに時間がかかる場合や、問題の起きたコンテナにトラフィックを流さないようにする場合に役立つ。注意点として、ReadinessProbeの間隔が短すぎると、kubeletに必要以上に負荷がかかる。 |
| エンドポイント例 | ・SpringBoot製のJavaアプリなら`/actuator/startup`を使用する。<br>・NginxならReadiness用のエンドポイントで代用する。                                                            | ➡️  | ・SpringBoot製のJavaアプリなら`/actuator/health/liveness`を使用する。<br>・Nginxなら`200`ステータスを返却するだけの`/healthcheck`を定義する。             | ・SpringBoot製のJavaアプリなら`/actuator/health/readiness` (ウォームアップ実施エンドポイント) を使用する。<br>・Nginxなら`/nginx-ready` (設定ファイル読み込み状態エンドポイント) を使用する。<br>・MySQLなら接続受信準備完了エンドポイントを使用する。                                                               |
| 正常時           | LivenessProbe／ReadinessProbeを実行する。                                                                                                                                      | ➡️  | HTTP リクエストの場合、コンテナのヘルスチェックエンドポイントが`200`ステータスから`399`ステータスまでを返却すれば正常とみなす。                           | HTTP リクエストの場合、コンテナのヘルスチェックエンドポイントが`200`から`399`ステータスを返却すれば正常とみなす。                                                                                                                                                                                                    |
| 異常時           | コンテナを再起動する。LivenessProbe／ReadinessProbeを実行しない。                                                                                                              | ➡️  | コンテナを再起動する。コンテナで障害 (例：デッドロック) が起こって応答しなくなると、コンテナを強制的に再起動してくれる。                                  | コンテナのプロセスの準備が完了しない間、そのコンテナが処理できるようになるまで、ServiceからPodに通信を流さないようにしてくれる。コンテナは再起動しない。                                                                                                                                                             |

> - https://srcco.de/posts/kubernetes-liveness-probes-are-dangerous.html
> - https://stackoverflow.com/questions/42567475/docker-compose-check-if-mysql-connection-is-ready
> - https://docs.nginx.com/nginx-ingress-controller/configuration/global-configuration/command-line-arguments/#-ready-status
> - https://speakerdeck.com/hhiroshell/jvm-on-kubernetes?slide=48
> - https://speakerdeck.com/hhiroshell/jvm-on-kubernetes?slide=49

<br>

### preStopとterminationGracePeriodSecondsを組み合わせてPodをGraceful Shutdownする

kubeletにより、Podの終了プロセスが始まると、以下の一連のプロセスも開始する。

1. Workload (例：Deployment、StatefulSetなど) が古いPodを切り離す。
2. Serviceとkube-proxyが古いPodの宛先情報を削除する。
3. コンテナを停止する。

これらのプロセスはそれぞれ独立して実施され、ユーザーは制御できない。

例えば、Serviceとkube-proxyがPodの宛先情報を削除する前にPodが終了してしまうと、ServiceからPodへの接続を途中で切断することになってしまう。

また、コンテナを停止する前にPodを終了してしまうと、コンテナを強制的に終了することになり、ログにエラーが出力されてしまう。

- Serviceとkube-proxyの処理後にPodを終了できるように、ユーザーがPodの`.spec.terminationGracePeriodSeconds`キーに任意の秒数を設定し、Podの削除に伴うServiceとkube-proxyの処理の完了を待機する必要がある。
- コンテナの正常な終了後にPodを終了できるように、ユーザーがPodの`.spec.containers[*].lifecycle.preStop`キーに任意の秒数を設定し、コンテナに待機処理 (例：`sleep`コマンド) を実行させる必要がある。

なお、`.spec.terminationGracePeriodSeconds`の秒数が長すぎるとPodの終了に時間がかかりすぎるようになり、Podの更新やClusterのアップグレードに時間に影響が出る。

長くとも`120`秒以内にするとよい。

!https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/pod_terminating_process.png

> - https://christina04.hatenablog.com/entry/kubernetes-pod-graceful-shutdown

<br>

### Cluster DNS に対する無駄な名前解決のリクエストを減らす

Cluster DNSとしてCoreDNSなどを利用している場合、無駄な名前解決のリクエストを減らすことで名前解決の安定性の向上やパフォーマンスを改善できる。

> - https://coredns.io/

Cluster外へのリクエストでは、ドメインの末尾にドットをつける。

○: `www.google.com.`

×: `www.google.com`

完全修飾ドメイン名であることを宣言できるため、コンテナはそのドメインをそのまま名前解決しようとする。

これにより、DNS の検索パスを補間しなくなるため、名前解決の無駄なリクエストが発生しない。

> - https://qiita.com/corestate55/items/8cf2f713b10d0197c29e#%E6%83%B3%E5%AE%9A%E3%81%95%E3%82%8C%E3%82%8Bdns-qeury%E3%81%A8%E5%AE%9F%E9%9A%9B%E3%81%AE%E5%8B%95%E4%BD%9C%E3%81%AE%E6%AF%94%E8%BC%83

別の方法として、`/etc/resolv.conf`ファイルのndots値を`1`に変更してもよい。

デフォルトでは、コンテナの`/etc/resolv.conf`ファイルには、`ndots:5`が設定されている。

```bash
nameserver 172.20.0.10
search foo.svc.cluster.local svc.cluster.local cluster.local
options ndots:5
```

これにより、ドメインのドット数が`5`未満の場合は、Cluster内で名前解決を実行しようとする。

しかし、Cluster外へしかリクエストを送信しないコンテナでは、Cluster内で名前解決を実行する必要はない。

そういったコンテナのPod では、Pod DNS Configの`.spec.dnsConfig.options`キーでndotsを`1`にし、ドット数が`1`未満の場合 (つまりドットが`1`個でもあれば) 、Cluster外で名前解決を実行させるようにする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  namespace: default
  name: foo
spec:

  ...

  dnsConfig:
    options:
      - name: ndots
        value: 1
```

> - https://zenn.dev/toversus/articles/d9faba80f68ea2
> - https://developer.feedforce.jp/entry/2021/09/02/134725
> - https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#pod-dns-config

前述の2つの対策を講じてもCluster DNSに必要以上の負荷がかかったり、ノード上の conntrack テーブルが溢れるなどの問題がある場合、NodeLocal DNSCacheの採用を検討する。

Podは、Cluster DNSに名前解決のリクエストを送信する前に、一度NodeLocal DNSCacheにリクエストを送信する。

この時、名前解決のキャッシュがあると、Cluster DNSにリクエストを送信せずに名前解決できる。

> - https://tech.griphone.co.jp/2020/06/12/kubernetes-dns-tuning/

<br>

### 機密性の高い情報を守る

#### ▼ env変数やConfigMapに機密性の高い情報を設定しない

ConfigMapやSecret上のファイルやデータを、コンテナにファイルや環境変数として渡せる。

この時、ConfigMapでは情報を平文で保持することになる。

機密性の高い情報を保持することは危険であり、Secretで保持する方が良い。

#### ▼ Secretの元データはSecretストアで暗号化して管理する

Secretは、base64方式のエンコード値を保持する。

これの元データを平文のまま管理することは危険なため、Secretストアに管理する方が良い。

また、暗号化キーで暗号化した上で、Secretストアで管理するようにする。

|                | リポジトリ + キーバリュー型ストア                                                                                                  | リポジトリ + クラウドキーバリュー型ストア                                                                                                                                                                                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| バージョン管理 | 管理できる。                                                                                                                       | 管理できない。                                                                                                                                                                                                                                                                       |
| 暗号化         | base64方式エンコード値を暗号化キー (例：AWS KMS、Google Cloud CKM、GnuPG、PGPなど) で暗号化する。                                  | base64方式エンコード値を暗号化キー (例：AWS KMS、Google Cloud CKM、GnuPG、PGPなど) で暗号化する。                                                                                                                                                                                    |
| Secretストア   | リポジトリ上でキーバリュー型ストア (例：SOPS、kubesec、Hashicorp Vault) で管理する。 Apply時にbase64方式エンコード値に復号化する。 | クラウドプロバイダー内のキーバリュー型ストア (例：AWS パラメーターストア、Google Cloud Secret Managerなど) で管理する。 Apply時に、ストア仲介ツール (例：SecretsStoreCSIDriver、External SecretsOperator) を使用してSecretのデータを取得しつつ、base64方式エンコード値に復号化する。 |

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/secret-management/
> - https://www.thorsten-hans.com/encrypt-your-kubernetes-secrets-with-mozilla-sops/
> - https://akuity.io/blog/how-to-manage-kubernetes-secrets-gitops/

<br>

### コンテナイメージのタグにlatestを設定しない

コンテナイメージのタグにlatestを指定すると、むやみに新しいバージョンのコンテナイメージのタグをプルしてしまい、障害が起こりかねない。

そこで、コンテナイメージはセマンティックバージョニングでタグ付けし、特定のバージョンをプルする。

なお、各コンテナイメージのアーキテクチャに割り当てられたダイジェスト値を指定することもできるが、K8sがNodeのCPUアーキテクチャに基づいてよしなに選んでくれるため、ダイジェスト値は指定しない。

<br>

### コンテナイメージが更新された場合のみコンテナイメージレジストリからプルする

コンテナ作成のたびにコンテナイメージをプルすると、コンテナイメージレジストリに負荷がかかる。

K8sで、一度プルしたコンテナイメージを基本的に削除しないため、キャッシュとして再利用することができる。

`.spec.containers[*].imagePullPolicy`キーに`IfNotPresent`を使用し、Node上にコンテナイメージのキャッシュがない場合のみプルできるようにする。

もし、キャッシュを使用せずにコンテナイメージをプルしたい場合、一時的に`.spec.containers[*].Always`キーを使用する。

<br>

### Nodeに永続データを持たせない

StatefulSetを使用してNodeに永続データを持たせた場合、Nodeの障害が永続データにも影響を与えかねない。

そこで、Nodeに永続データを持たせずに、外部のサーバー (例：AWS RDS、MySQL) を使用する。

<br>

### コンテナにセッションデータを持たせない

StatefulSetを使用してコンテナにセッションデータを持たせた場合、以下が起こると、コンテナが入れ替わってコンテナ上のセッションデータを削除してしまう。

- Podが再起動する
- Podが更新される
- Podがスケーリングする
- ワーカーNodeが再起動する
- …

セッションデータがなくなると、セッションを途中で維持できなくなってしまう。

そこで、コンテナにセッションデータを持たせずに、外部のセッションストレージツール (例：AWS ElastiCache、Redis) を使用する。

コンテナが入れ替わっても、セッションストレージツールからセッションデータを取得できるようにする。

> - https://qiita.com/tomoyk/items/67722472a55b8dc7d01d
> - https://pauldally.medium.com/session-affinity-and-kubernetes-proceed-with-caution-8e66fd5deb05

<br>

## コンテナのCPU／メモリのパフォーマンスチューニング

### CPU/メモリの割り当て方法

#### ▼ 仕組み

kube-scadulerは、コンテナの下限 (`.spec.containers[*].resources.requests`) 値以上の余剰があるNodeに、Podをスケジューリングする。

CPUの場合、上限値 (`.spec.containers[cpu].resources.limits`) がNodeの余剰分を超過していると、コンテナはNodeの余剰分を使用して稼働し続ける。

一方でメモリの場合、上限値 (`.spec.containers[memory].resources.limits`) がNodeの余剰分を超過していると、コンテナはOOM Killedを起こし、再起動される。

> - https://qiita.com/sheepland/items/eb0e4c65aaae70ec4e2f#resource-limits%E3%81%A8%E3%81%AF

#### ▼ 算出

Pod内のコンテナが要求する合計CPU/メモリに見合ったCPU/メモリを割り当てる。

また、NodeのCPU/メモリの割り当てに関係するため、Podの合計数やPod当たりのCPU/メモリ要求量を算出しておく。

なおLimitRangeを使用すれば、`.spec.containers[*].resources`キー配下に設定がなくとも、コンテナの実行時に自動的に挿入してくれる。

> - https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
> - https://kubernetes.io/docs/concepts/policy/limit-range/

<br>

### ハードウェアリソース要求量の上限下限値を設定する

ハードウェアリソース要求量の上限値 (`.spec.containers[*].resources.limits`) / 下限値 (`.spec.containers[*].resources.requests`) を設定しないと、コンテナはハードウェアリソースを自由に要求してしまい、Nodeのハードウェアリソース不足になりかねない。

`.spec.containers[*].resources`キーを使用すれば、コンテナのハードウェアリソース要求量の上限下限値を設定できる。

なお、コンテナの特性に合わせて、上限下限値を設定すると良い。

#### ▼ ハードウェアリソースを恒常的に要求する場合はGuaranteed QoSにする

ハードウェアリソースを恒常的に要求するコンテナ (例：アプリ) では、Guaranteed QoSにする。

Guaranteed QoSでは、上限 (`.spec.containers[*].resources.limits`) = 下限 (`.spec.containers[*].resources.requests`) のように、CPUとメモリを設定する。

上限 (`.spec.containers[*].resources.limits`) と下限 (`.spec.containers[*].resources.requests`) の設定の両方または一方を省略すると、自動的にGuaranteedになる。

コンテナが一定量のハードウェアリソースを要求し続けたとしても、無制限 (Nodeの空きリソース分) にハードウェアリソースを提供し、要求に耐えられるようにする。

基本的には、ほとんどのコンテナをGuaranteed QoSにすればよい。

補足として、Guaranteed QoSのPodはスケジューリングの優先度が最も高く、Node-pressure Evictionが発生した場合には、他のQoS (Burstable、BestEffort) よりも後に退避する。

> - https://kubernetes.io/docs/tasks/configure-pod-container/quality-service-pod/#create-a-pod-that-gets-assigned-a-qos-class-of-guaranteed

#### ▼ ハードウェアリソースを瞬間的に要求する場合はBurstableなQoSにする

ハードウェアリソースを瞬間的に要求するコンテナ (例：バッチ、起動時に特にハードウェアを要求するJVM) では、BurstableなQoSにする。

Guaranteed QoSでは、上限 (`.spec.containers[*].resources.limits`) > 下限 (`.spec.containers[*].resources.requests`) のように、CPUとメモリを設定する。

上限 (`.spec.containers[*].resources.limits`) を設定しないと上限が無制限になるため、下限 (`.spec.containers[*].resources.requests`) のみを設定した場合もBurstableである。

コンテナがハードウェアリソース要求量が瞬間的に上昇させても、これに耐えられるようにする。

全てのコンテナをGuaranteed QoSにするとハードウェアのコストが高くなるため、部分的にBurstableなQoSにするとよい。

ただし、上限 (`.spec.containers[*].resources.limits`) を高くしすぎると、割り当て可能な全体量を超えてしまう (オーバーコミットする) ため、上限は慎重に設定する。

補足として、BurstableなQoSのPodはスケジューリングの優先度がGuaranteedの次に高く、Node-pressure Evictionが発生した場合には、Guaranteedの次に退避する。

**設計例**

Grafanaダッシュボードから、このシステムではCPUとメモリの使用量に平常とピークがあることがわかった。

|          | CPU                                                                                                    | メモリ                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| requests | 平常時くらいのコア数にする。                                                                           | 平常時くらいのメモリ量にする。                                                                          |
| limits   | ここ一週間の負荷ピーク時は多めに見積もって`0.9`コアである。ピーク時にも`70`%くらいになるコア数にする。 | ここ一週間の負荷ピーク時は多めに見積もって`1.2`GiBである。ピーク時にも`70`%くらいになるメモリ量にする。 |

> - https://kubernetes.io/docs/tasks/configure-pod-container/quality-service-pod/#create-a-pod-that-gets-assigned-a-qos-class-of-burstable

#### ▼ CPUの上限を設定しないBurstableなQoSにする

CPUの上限 (`.spec.containers[*].resources.limits`) だけは設定しないようにし、BurstableなQoSにする方法もある。

ただ、上限を設定した方が監視しやすく、エラーの原因もわかりやすいため、CPUの上限も設定がおすすめである。

> - https://home.robusta.dev/blog/stop-using-cpu-limits
> - https://medium.com/directeam/kubernetes-resources-under-the-hood-part-3-6ee7d6015965
> - https://www.amazon.co.jp/dp/4814400888
> - https://www.perfectscale.io/blog/kubernetes-cpu-limits

<br>

### 上限下限値を適切に設定する

上限下限値の差が大きいほどオーバーコミットが起こりやすいが、リソース効率は高くなる。

上限下限値の差が小さいほどオーバーコミットが起こりにくいが、リソース効率は低くなる。

> - https://newrelic.com/jp/blog/best-practices/set-requests-and-limits-for-your-clustercapacity-management

<br>

### InitContainerを適切に使用する

#### ▼

依存ツールやSSL証明書のインストール処理などのために使用する。

#### ▼ InitContainerで依存先コンテナの起動開始を待機する

依存先コンテナ (例：DBコンテナ、インメモリDBコンテナ) の起動完了を待機する。

**＊実行例＊**

DBコンテナ (例：MySQL) が起動するために時間が必要であり、appコンテナではそれを待機可能にする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      ports:
        - containerPort: 8080
      volumeMounts:
        - name: app-volume
          mountPath: /go/src
  initContainers:
    - name: readiness-check-db
      image: busybox:1.28
      # StatefulSetのDBコンテナの3306番ポートに通信できるまで、本Podのappコンテナの起動開始を待機する。
      # StatefulSetでreadinessProbeを設定しておけば、これのPodがREADYになるまでncコマンドは成功しないようになる。
      command:
        - /bin/bash
        - -c
      args:
        - |
          until nc -z db 3306; do
            echo waiting for db;
            sleep 2;
          done
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-db
      image: mysql:8.0
      ports:
        - containerPort: 3306
      volumeMounts:
        - name: foo-db-volume
          mountPath: /var/lib
  volumes:
    - name: foo-db-volume
      emptyDir: {}
```

> - https://memo.koya-it.com/software_service/kubernetes.html#initcontainers-pod%E8%B5%B7%E5%8B%95%E5%89%8D%E3%81%AB%E5%AE%9F%E8%A1%8C%E3%81%99%E3%82%8B%E5%87%A6%E7%90%86%E3%82%92%E6%9B%B8%E3%81%8F

**＊実行例＊**

インメモリDBコンテナ (例：Redis) が起動するために時間が必要であり、appコンテナではそれを待機可能にする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      ports:
        - containerPort: 8080
      volumeMounts:
        - name: app-volume
          mountPath: /go/src
  initContainers:
    - name: readiness-check-redis
      image: busybox:1.28
      # StatefulSetのインメモリDBコンテナの6379番ポートに通信できるまで、本Podのappコンテナの起動開始を待機する。
      # StatefulSetでreadinessProbeを設定しておけば、これのPodがREADYになるまでncコマンドは成功しないようになる。
      command:
        - /bin/bash
        - -c
      args:
        - |
          until nc -z inmemory-db 6379; do
            echo waiting for inmemory-db;
            sleep 2;
          done
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: foo-db
      image: redis:8.0
      ports:
        - containerPort: 6379
      volumeMounts:
        - name: foo-inmemory-db-volume
          mountPath: /var/lib
  volumes:
    - name: foo-inmemory-db-volume
      emptyDir: {}
```

> - https://github.com/codecentric/helm-charts/blob/master/charts/keycloakx/values.yaml#L368-L390

#### ▼ InitContainerで依存ツールやSSLs用名所をインストールする

**＊実行例＊**

appコンテナからHTTPSリクエストを送信する場合に、SSL証明書が必要になる。

これはすでに署名されている必要があり、例えばubuntuでは、CA証明書 (CA証明書) を含む`ca-certificates`パッケージをインストールする。

すると、`/etc/ssl`ディレクトリ配下にCA証明書に関する一連のファイルがインストールされる。

これを、共有Volumeを介して、appコンテナにマウントする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
spec:
  containers:
    - name: app
      image: app:1.0.0
      ports:
        - containerPort: 8080
      volumeMounts:
        - name: app-volume
          mountPath: /go/src
        - name: certificate-volume
          mountPath: /etc/ssl
  initContainers:
    - name: certificate-installer
      image: ubuntu:22.04
      command:
        - /bin/sh
        - -c
      args:
        - |
          apt-get update -y
          # CA証明書をインストールする
          apt-get install -y ca-certificates
          # 証明書を更新する
          update-ca-certificates
      volumeMounts:
        - mountPath: /etc/ssl
          name: certificate
  volumes:
    - name: certificate
      emptyDir: {}
```

#### ▼ InitContainerで初期データをDBに挿入する

記入中...

> - https://loft.sh/blog/kubernetes-init-containers/

#### ▼ どうしても特権コンテナが必要ならInitContainerを使用する

istio-initコンテナとかまさにその例

> - https://loft.sh/blog/kubernetes-init-containers/

#### ▼ InitContainerでSSL証明書を準備する

記入中...

<br>

## コンテナのストレージのパフォーマンスチューニング

記入中...

<br>

## Podとコンテナで共通のプラクティス

### securityContextを適切に使い分ける

#### ▼ PodとコンテナのsecurityContextを使い分ける

`securityContext`キーは、Podとコンテナのいずれかまたは両方に設定できるキーを持つ。

特にPodに設定できるキーは、Pod内の全てのコンテナに同じ設定を適用する。

|      | 両方                                                                    | Podのみ                          | コンテナのみ                                                 |
| ---- | ----------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------ |
| キー | runAsUser、runAsGroup、runAsNonRoot、seLinuxOptions、seccompProfileなど | fsGroup、fsGroupChangePolicyなど | privileged、allowPrivilegeEscalation、readOnlyRootFilesystem |

> - https://kubernetes.io/docs/concepts/security/pod-security-standards/
> - https://snyk.io/blog/10-kubernetes-security-context-settings-you-should-understand/

#### ▼ runAsNonRoot、runAsUser / runAsGroupを使用して、非rootユーザーでコンテナを実行する

コンテナはホスト (Node) と各namespaceを分離しており、Capabilityを制限した上で実行する。

しかし、Kubernetesでは諸々の理由により、`1.28` 時点でnamespaceのうちuser namespaceをデフォルトで分離しない実装になっている (なお、Dockerではデフォルトで無効)。

そのため、NodeとコンテナのUser IDやGroup IDのマッピングは同じになっている。

> - https://github.com/kubernetes/enhancements/tree/master/keps/sig-node/127-user-namespaces
> - https://docs.docker.com/engine/security/userns-remap/#user-namespace-known-limitations

コンテナをrootユーザーで実行すると、コンテナブレイクアウトのサイバー攻撃を受ける可能性が高くなる。

例えば、コンテナをrootユーザーで実行している状況で、コンテナのrunC (OCIランタイムの一種) の脆弱性を突かれると、コンテナがNodeのrootユーザーを操作できてしまう

> - https://unit42.paloaltonetworks.jp/non-root-containers-kubernetes-cve-2019-11245-care/

よって、コンテナブレイクアウトの攻撃の可能性を小さくするために、できるだけコンテナをrootユーザーで実行しない方が良い。

> - https://jpn.nec.com/cybersecurity/blog/210730/index.html
> - https://unit42.paloaltonetworks.jp/non-root-containers-kubernetes-cve-2019-11245-care/

そこで、`.securityContext.runAsNonRoot`キーを有効化し、非rootユーザーでコンテナを実行するようにしておく。

さらに、`.securityContext.runAsUser`キーと`.securityContext.runAsGroup`キーで、使用する実行ユーザーのUIDとGIDを指定するようにしておく。

なお、Dockerfileの`USER`や`GROUP`でも同様にUIDとGIDを設定できるが、マニフェスト側でもDockerfileと同様にrunAsUserとrunAsGroupを設定した方が可読性が高くなる。

そのため、Dockerfile側にすでに設定があるかどうかに関わらず、コード規約としてマニフェスト側でも設定するようにする。

> - https://snyk.io/blog/10-kubernetes-security-context-settings-you-should-understand/

#### ▼ privilegedを無効化する

特権コンテナの実行ユーザーは、rootユーザー権限のCapability (CHOWN、NET_RAW、CAP_SYS_BOOT、CAP_AUDIT_WRITEなど) の全て持っている。

非特権コンテナを実行するrootユーザーがCapabilityを全く持たないことからもわかる通り、非常に大きな権限を持つ。

例えば、特権コンテナの実行ユーザーはルートファイルシステムにある`/proc`に書き込みする権限を持つ。

`/proc`配下にはNodeへのアクセスを仲介するファイルがあるため、特権コンテナの実行ユーザーはNode上で任意のコマンドを実行できる。

よって、これらを防ぐために特権コンテナは無効化しておいた方が良い。

`.spec.containers[*].securityContext.privileged`キーで、コンテナに特権を付与するかどうかを設定できる。

> - https://jpn.nec.com/cybersecurity/blog/210730/index.html
> - https://medium.com/@chrispisano/limiting-pod-privileges-hostpid-57ce07b05896
> - https://snyk.io/blog/10-kubernetes-security-context-settings-you-should-understand/

#### ▼ allowPrivilegeEscalationを無効化する

コンテナのプロセスは、コンテナ起動コマンド (親プロセス)、親プロセスが実行するプロセス (子プロセス) 、からなる。

`.containers[*].securityContext.allowPrivilegeEscalation`キーを有効化してしまうと、子プロセスは権限フラグ (`setuid`、`setgid`) を使用できるようになる。

権限フラグを使用すると、コンテナの実行ユーザーは、rootユーザーに近い権限を一時的に持てるようになる。

つまり、悪意のある人がこれを使用すると、Node上の他のコンテナやNode自体にリクエストできてしまう。

> - https://en.wikipedia.org/wiki/Setuid
> - https://docs.docker.com/engine/security/userns-remap/

そこで、`.containers[*].securityContext.allowPrivilegeEscalation`キーを有効化し、権限フラグを使用できないようにしておく。

> - https://fr.sysdig.com/blog/kubernetes-security-psp-network-policy/

#### ▼ readOnlyRootFilesystemを有効化する

コンテナは自身のファイルシステムにリクエストを送信できる。

この時に、`.containers[*].securityContext.readOnlyRootFilesystem`キーが無効になっていると、コンテナのルートファイルシステムにRead/Writeの両方を実行できる。

つまり、悪意のある人がこれを使用すると、任意のディレクトリ配下でファイルを作成変更できてしまう。

そこで、`.containers[*].securityContext.readOnlyRootFilesystem`キーを有効化し、Readのみを実行できるようにしておく。

アプリでログの出力先をログファイルにしているとエラーになってしまうため、標準出力/標準エラー出力にログを出力する必要がある。

> - https://fr.sysdig.com/blog/kubernetes-security-psp-network-policy/
> - https://en.wikipedia.org/wiki/Root_directory

<br>

## UserAccount とRole / ClusterRole

### UserAccountと最小権限のRoleを作成する

#### ▼ UserAccount にはClusterRoleを紐付けない

最小権限にするため、UserAccountにはClusterRoleを紐付けない。

代わりにRoleを紐づけることで、NamespaceスコープなK8sリソースのみにリクエストを送信できるようにする。

> - https://kubernetes.io/docs/concepts/security/rbac-good-practices/

#### ▼ チーム構成に合わせたUserAccountとRoleを作成する

最小権限にするため、チームを構成するメンバーの役割に合わせて、Roleを作成する。

小規模なアプリほど、メンバーは複数の役割を兼備することになる。

|                                   | UserAccount    | Roleの認可スコープ                                              |
| --------------------------------- | -------------- | --------------------------------------------------------------- |
| アプリメンバー                    | Reporter       | 担当するNamespace内のK8sリソースのRead                          |
| インフラ寄りアプリメンバー        | AppDeveloper   | 担当するNamespace内のK8sリソースのRead/Write                    |
| アプリ寄りインフラメンバー        | InfraDeveloper | 全てのNamespace内のK8sリソースのRead/Write                      |
| インフラメンバー                  | InfraDeveloper | 全てのNamespace内のK8sリソースのRead/Write                      |
| チームリーダー                    | Maintainer     | 全てのNamespace内のK8sリソースのRead/Write、ClusterのRead/Write |
| Cluster管理者(一時的に使用できる) | Administrator  | Cluster、Cluster内の全てのK8sリソースのRead/Write               |

#### ▼ リリース時以外は本番環境はReadのみとする

実行環境の誤選択や悪意のある人のアクセスを防ぐために、リリース時以外は全てのUserAccountの本番環境の認可スコープをReadにする。

<br>

### 本番環境ではUserAccountに不必要に権限を割り当てない

#### ▼ `pods/exec`や`pods/attach`を設定しない

RoleやClusterRoleに設定できる`pods/exec`や`pods/attach`といった権限は、Pod内のコンテナに接続するために使用する。

コンテナへの接続を許可してしまうと、コンテナ内から悪意のある人がサイバー攻撃を実施したり、あるいは悪意がない人が本来不必要な作業を実施するかもしれない。

一方で場合によっては、デバッグのためにPod内のコンテナに接続する必要があるかもしれない。

そこで、本番環境ではClusterの管理者のUserAccount以外には`pods/exec`や`pods/attach`を付与しない

また、テスト環境では基本的に設定しないが、必要であれば設定を許容する。

> - https://www.baeldung.com/linux/kubectl-attach-exec

#### ▼ Secretに関する権限を設定しない

<br>

## ServiceAccountとRole / ClusterRole

RoleやClusterRoleを使用して、ServiceAccountに適切な認可スコープを付与する。

> - https://qiita.com/sheepland/items/67a5bb9b19d8686f389d
> - https://speakerdeck.com/kyohmizu/saibagong-ji-kara-kubernetes-kurasutawoshou-rutamefalsexiao-guo-de-nasekiyuriteidui-ce?slide=18

<br>

## テスト

### マニフェスト静的解析ツールを使用する

#### ▼ 検証したい項目を選ぶ

Kubernetesのマニフェストファイルに対する静的解析ツールが存在するため、必要に応じてエディタやCIなどに組み込んで使用する。

マニフェストファイルは、例えば以下の観点で静的解析することが望ましい。

- マニフェストの文法
- マニフェストの組織特有のコード規約
- ベストプラクティス
- 脆弱性
- CPU/メモリのサイジングの最適値
- マニフェストの非推奨なAPI
- Helmチャートの構造

#### ▼ 適切なツールを選び

ここでは、各観点を解析できるツールと、執筆時点 (2023/11) での推奨ツール (★) とその理由、開発初期時点で採用を推奨するツール (✅) を紹介している。

最終的に、全ての観点を解析する必要はなく、例えば ”CPU/メモリのサイジングの最適値” の解析は紹介だけにとどめている。

なお、HelmチャートやKustomizeを使用している場合、テンプレートからマニフェストを作成し、これをツールに渡すとよい。

```bash
## 例：helmチャートから作成したマニフェストをplutoの標準入力に渡す
$ helm template . -f foo-values.yaml \
  | pluto detect -o wide -t k8s=<Kubernetesのバージョン> -
```

| 観点                         | ツール名                                                           | 概要                                                                                                                                                             | 推奨ツール | ★の理由 (2023/11時点)                                                                                                                                                                                                                                                                                                       | 開発初期時点で採用推奨 |
| ---------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 文法チェック                 | https://github.com/yannh/kubeconform                               | Kubernetesリソースのスキーマ (カスタムリソースであればCRD) に基づいて、マニフェストの文法の誤りを検証する。                                                      | ★          | kubevalの後継ツールであり、他にめぼしい競合ツールがない。                                                                                                                                                                                                                                                                   |                        |
| コード規約違反テスト         | https://www.conftest.dev/                                          | Regoでコード規約を定義する。                                                                                                                                     |            |                                                                                                                                                                                                                                                                                                                             |                        |
| コード規約違反テスト         | https://open-policy-agent.github.io/gatekeeper/website/docs/gator/ | Regoでコード規約を定義する。                                                                                                                                     |            |                                                                                                                                                                                                                                                                                                                             |                        |
| ベストプラクティス違反テスト | https://docs.kubelinter.io/#/                                      | 脆弱性、効率性、信頼性の観点で検証する。                                                                                                                         |            |                                                                                                                                                                                                                                                                                                                             |                        |
| ベストプラクティス違反テスト | https://kube-score.com/                                            | 脆弱性、信頼性の観点で検証する。                                                                                                                                 |            |                                                                                                                                                                                                                                                                                                                             |                        |
| ベストプラクティス違反テスト | https://polaris.docs.fairwinds.com/checks/security/                | 脆弱性、効率性、信頼性の観点で検証する。                                                                                                                         | ★          | 競合ツールと比較して、ベストプラクティス違反の検証項目が最も多い。                                                                                                                                                                                                                                                          |                        |
| 脆弱性診断                   | https://aquasecurity.github.io/trivy/dev/docs/target/kubernetes/   | マニフェストの設定値に起因する脆弱性を検証する                                                                                                                   | ★          | 他の競合ツールとは異なり、K8s以外のIaCツール (Terraform、Dockerfile) や、コンテナイメージ (コンテナイメージ、マシンコンテナイメージ) も検証できるため、他の場面でも知見を流用できる。いずれのツールも、おおよそ同じDB (例：GitHub、GitLab、RedHatなど) に基づいて検証するため、脆弱性診断の項目数で優劣を比べない方が良い。 |                        |
| サイジング最適値算出ツール   | https://goldilocks.docs.fairwinds.com/                             | IaCのソースコード上のCPU/メモリの設定値と、Cluster上の実際のハードウェアリソース消費量を比較して、最適値を算出できる。                                           |            |                                                                                                                                                                                                                                                                                                                             |                        |
| サイジング最適値算出ツール   | https://github.com/robusta-dev/krr                                 | Prometheusのメトリクスから各コンテナに最適なCPU/メモリの設定値を算出できる。 ただし、CPUのlimits値の設定はアンチパターンとして扱っており、未設定を推奨している。 |            |                                                                                                                                                                                                                                                                                                                             |                        |
| 非推奨APIチェック            | https://pluto.docs.fairwinds.com/                                  | 指定したKubernetesのバージョンに基づいて、マニフェストの非推奨なAPIを検証する。                                                                                  | ★          | 競合ツールの中で最もコントリビューター数が多くて開発が盛んである。また、GitHubのスター数が最も多い。                                                                                                                                                                                                                        | ✅                     |
| 非推奨APIチェック            | https://kubepug.xyz/                                               | 指定したKubernetesのバージョンに基づいて、マニフェストの非推奨なAPIを検証する。                                                                                  |            |                                                                                                                                                                                                                                                                                                                             |                        |
| 非推奨APIチェック            | https://github.com/doitintl/kube-no-trouble                        | 指定したKubernetesのバージョンに基づいて、マニフェストの非推奨なAPIを検証する。                                                                                  |            |                                                                                                                                                                                                                                                                                                                             |                        |

<br>

### Helmチャートの静的解析ツールを使用する

#### ▼ 検証したい項目を選ぶ

Helmチャート専用の静的解析ツールが存在するため、必要に応じてエディタやCIなどに組み込んで使用する。

ここでは、各観点を解析できるツールと、執筆時点 (2023/11) での推奨ツール (★) とその理由、開発初期時点で採用を推奨するツール (✅) を紹介している。

最終的に、全ての観点を解析する必要はなく、例えば ”チャートのバージョン” の解析は紹介だけにとどめている。

| 観点                                                   | ツール名                             | 概要                                                                                                     | 推奨ツール | ★の理由 (2023/11時点) | 開発初期時点で採用推奨 |
| ------------------------------------------------------ | ------------------------------------ | -------------------------------------------------------------------------------------------------------- | ---------- | --------------------- | ---------------------- |
| Helmチャート構造                                       | https://helm.sh/docs/helm/helm_lint/ | チャートの公式ルールに基づいて、構造の誤り (valuesファイルがあるか、Chart.yamlがあるかなど) を検証する。 |
| Helm専用のツールであり、Helmチャートを渡す必要がある。 | ★                                    | Helmのビルトインツールであり、めぼしい競合ツールがない。                                                 | ✅         |
| チャートのバージョン                                   | https://nova.docs.fairwinds.com/     | Helmチャートのバージョンが古くなっていないかを検証する。                                                 |
| Helm専用のツールであり、Helmチャートを渡す必要がある。 |                                      |                                                                                                          |            |

<br>

### ブラックボックステスト

#### ▼ ロードテストを実施する

過去 (平常時、ピーク時、障害時) から予想できる負荷をClusterにかける。

この時の性能が、非機能要件の期待値を満たしているかを検証する。

#### ▼ Kubernetesのアップグレード後には各Kubernetesリソースの動作確認する

| 概要                                                       | 内容                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Podが全滅していないことを確認する。                        | PodDisruptionBugdetの設定によってWorkload (例：Deployment、DaemonSet、StatefulSet、Jobなど) で起動しているアプリケーションのPodが全滅しないかを確認する。 PodDisruptionBugdetを適切に設定できていないと、例えばWebアプリケーションのコンテナが全てダウンしてしまいリクエストを受け付けられなくなるといったケースがあるため、PodDisruptionBugdetの設定した内容に沿ってPodが保護されるかを確認する。 |
| Podが正しくNodeに分散されていることを確認する。            | NodeAffinityの設定に基づいて適切にPodがNodeに分散配置されるかや、NodeLabelやTaintの設定に基づいたNodeが選定されているかなどを確認する。                                                                                                                                                                                                                                                            |
| Workloadのデプロイ戦略が正しく動作していることを確認する。 | Workload (例：Deployment、DaemonSet、StatefulSet、Jobなど) のデプロイ戦略 (例：RollingUpdate) が設定に応じた割合で行われ、Podの入れ替えが行われていることを確認する。                                                                                                                                                                                                                              |
| WorkloadがPodのレプリカ数を維持できることを確認する。      | Workload (例：Deployment、DaemonSet、StatefulSet、Jobなど) に属するPodが削除され、replica数を下回った際に時間経過で設定したレプリカ数になるように回復されることを確認する。                                                                                                                                                                                                                        |
| Podのスケーリングが正しく動作することを確認する。          | HorizontalPodAutorocalerやVerticalPodAutoscalerを使用している場合、HorizontalPodAutorocalerやVerticalPodAutoscalerの設定と使用しているメトリクスに応じたスケーリングが行われることを確認する。                                                                                                                                                                                                     |
| Nodeのスケーリングが正しく動作することを確認する。         | Cluster AutoscalerやKarpenterを使用している場合、Cluster AutoscalerやKarpenterの設定とNodeのリソース状況応じたスケーリングが行われることを確認する。                                                                                                                                                                                                                                               |

<br>

## 運用

### 運用しやすいチームを作る

#### ▼ チームを体制する

K8s Clusterを使用したプロダクトのチームメンバー構成の例を挙げる。

前提として、実Clusterをマルチテナントの単位とし、テナントごとにClusterを管理しているとする。

チームメンバーが少なければ、兼任することになる。

- プロジェクトマネージャー
- アプリメンバー (バックエンド + フロントエンド)
- インフラ寄りアプリメンバー
- アプリ寄りインフラメンバー
- インフラメンバー

#### ▼ メンバーで領域を分担する

担当領域の例を挙げる。

チームメンバーが少なければ、一人当たりの担当領域はより増えてしまう。

| 担当領域                                                                                                                             | アプリメンバー | インフラ寄り アプリメンバー | アプリ寄りインフラメンバー | インフラメンバー |
| ------------------------------------------------------------------------------------------------------------------------------------ | -------------- | --------------------------- | -------------------------- | ---------------- |
| アプリケーションのフロントエンドとバックエンド                                                                                       | ✅             | ✅                          |                            |                  |
| アプリケーションのWorkload(Deployment、CronJobなど)                                                                                  | ✅             | ✅                          |                            |                  |
| インフラWorkloadの周辺K8sリソース(PodDisruptionBugdet、HorizontalPodAutorocaler、ConfigMap、Secretなど)                              |                |                             |                            |                  |
| アプリCIツール(コンテナイメージビルド、アプリケーションのホワイトボックステスト、コンテナイメージレジストリ格納など)                 | ✅             | ✅                          |                            |                  |
| サービスメッシュのデータプレーン                                                                                                     | ✅             | ✅                          |                            |                  |
| マニフェストCIツール(ホワイトボックステストなど)                                                                                     |                | ✅                          | ✅                         |                  |
| 分散トレーシング                                                                                                                     |                | ✅                          | ✅                         |                  |
| CDツール                                                                                                                             |                |                             | ✅                         |                  |
| サービスメッシュのコントロールプレーン                                                                                               |                |                             | ✅                         | ✅               |
| インフラのWorkload(Deployment、CronJobなど) 、周辺K8sリソース (PodDisruptionBugdet、HorizontalPodAutorocaler、ConfigMap、Secretなど) |                |                             | ✅                         | ✅               |
| コントロールプレーンNode ワーカーNode                                                                                                |                |                             | ✅                         | ✅               |
| K8s Clusterが依存する周辺インフラ                                                                                                    |                | ✅                          | ✅                         | ✅               |
| インフラの低レイヤー                                                                                                                 |                |                             |                            | ✅               |

<br>

### 運用しやすいテナントに分割する

#### ▼ マルチテナントパターン

K8sリソースをグルーピングしたテナントを作成し、影響範囲を小さくする。

テナントには作成パターンがあり、それぞれのパターンでテナントに役割 (例：プロダクト、実行環境など) を割り当てる。

| パターン       | Clusters as a Service                                                   | Control Plances as a Service                                            | Namespaces as a Service               | ツール固有テナント                                                       |
| -------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| テナントの単位 | 実Clusterテナント                                                       | 仮想Cluster                                                             | Namespaceテナント                     | カスタムリソーステナント                                                 |
| ツール         | 実Cluster管理ツール (AWS EKS、Google Cloud GKE、Azure AKE、Kubeadmなど) | 仮想Cluster管理ツール (Kcp、tensile-kube、vcluster、VirtualClusterなど) | Namespaceを増やすだけなのでツール不要 | ArgoCDのAppProject、CapsuleのTenant、kioskのAccount、KubeZooのTenantなど |
| …              |                                                                         |                                                                         |                                       |                                                                          |

<br>

### マニフェストを管理しやすくする

#### ▼ K8sリソースのラベル付けする

マニフェストに意味付けするために、ラベルを付与する。

適切にラベルを付与しておくと、仕様を理解する上での助けになる。

| よくラベル                          | 説明                                                                       | 値の例                                        |
| ----------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------- |
| http://app.kubernetes.io/name       | アプリ側であればマイクロサービス名、インフラ側であればツール名を設定する。 | prometheus                                    |
| http://app.kubernetes.io/component  | K8sリソースをシステムの要素と捉えた時に、その役割名を設定する。            | app、database                                 |
| http://app.kubernetes.io/part-of    | K8sリソースをシステムの要素と捉えた時に、その親のシステム名を設定する。    | argocd                                        |
| http://app.kubernetes.io/managed-by | K8sリソースの管理ツール名を設定する。                                      | helm、foo-operator、EKS (AWS EKSアドオンなど) |
| …                                   |                                                                            |                                               |

> - https://kubernetes.io/ja/docs/concepts/overview/working-with-objects/common-labels/

#### ▼ マニフェスト管理ツールを使用する

大量のマニフェストファイルを個別にバージョン管理することは大変であり、一括して管理できるように、マニフェスト管理ツールを使用する。

- Helm
- Kustomize

<br>

## 監視

### 監視したいデータを決める

#### ▼ ログを選ぶ

監視したいログを決める。

むやみやたらにログを収集すると、保管が大変なため、必要最低限のログにする。

- コントロールプレーンNode
  - Podのアクセスログ/実行ログ
- ワーカーNode
  - アプリPodのアクセスログ/実行ログ
  - インフラPodのアクセスログ/実行ログ

#### ▼ メトリクス選ぶ

監視したいメトリクスを決める。

むやみやたらにメトリクスを収集すると、収集対象に負荷がかかるため、必要最低限のメトリクスにする。

監視したいメトリクスを決める。

むやみやたらにメトリクスを収集すると、収集対象に負荷がかかるため、必要最低限のメトリクスにする。

| メトリクスの種類                                     | 収集ツール例            |
| ---------------------------------------------------- | ----------------------- |
| ハードウェアリソース系 (CPU使用量、メモリ使用量など) | Node Exporter、cAdvisor |
| ネットワーク系 (帯域幅、スループット値など)          | cAdvisor                |
| 状態系 (Podのレプリカ数、ヘルスチェックの失敗数など) | kube-state-metrics      |

<br>

### 対象のデータを収集する

#### ▼ ログを収集する

監視したいログを収集する。

| パターン | DaemonSetパターン                                                                                                                                                                                 | Pod内サイドカーパターン                                                                                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 説明     | ログ収集ツールのPodをDaemonSetで動かす。 Pod内のアプリコンテナで、ログを標準出力/標準エラーに出力し、一度Nodeに保管する。FluentdやFluentBitを使用して、Node上のログを監視バックエンドに送信する。 | ログ収集ツールをPod内のサイドカーで動かす。ログ収集ツールが提供するドライバーを使用して、Pod内のアプリコンテナからログ収集コンテナにログを渡す。Pod内のログ収集コンテナから監視バックエンドにログを直接送信する。 |
| …        |                                                                                                                                                                                                   |                                                                                                                                                                                                                   |

#### ▼ メトリクスを収集する

監視したいメトリクスを収集する。

ここにメトリクス収集の設計パターンを書く…

### 収集したログ/メトリクスを保管する

収集したログ/メトリクスをストレージに保管する。

| 要件                                  | 説明                                                                                                                                                                                                                                                                          |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ストレージ容量                        | ログファイルのメトリクスのストレージのサイズを決める。 メトリクスの場合、データポイント数を抑えて (例：収集間隔の拡大、ダウンサンプリング、重複排除) 、データサイズを小さくすると良い。                                                                                       |
| バックアップしないログ                | 全てのログを保管するとストレージ容量を圧迫してしまうため、一部のログ (例：ヘルスチェックのアクセスログ) は捨てるように決めておくと良い。                                                                                                                                      |
| バックアップの保管期間 (リテンション) | ログファイルのメトリクスのバックアップを実施し、また保管期間ポリシー (例：3ヶ月) を決めておくと良い。                                                                                                                                                                         |
| ローテーション                        | ログローテーションによって、ファイルを小さく分割して保管しておく。ログファイルやメトリクスのローテーション期間 (例：7日) をポリシーとして決めておくと良い。 ローテションされた過去のログやメトリクスのファイルでは、ファイル名の末尾に最終日付 (例：-20220101) をつけておく。 |
| 世代数                                | ローテションの結果作成されるファイルの世代数 (例：5) をポリシーとして決めておくと良い。 ただ、これは設定できないツールがある。                                                                                                                                                |
