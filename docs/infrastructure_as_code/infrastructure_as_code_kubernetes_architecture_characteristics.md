---
title: 【IT技術の知見】Kubernetes＠アーキテクチャ特性
description: Kubernetes＠アーキテクチャ特性の知見を記録しています。
---

# Kubernetes＠アーキテクチャ特性

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 安全性

### 認証/認可の実施

#### ▼ Kubernetesリソースの場合

RoleやClusterRoleを使用して、ServiceAccountに適切な認可スコープを付与する。

> - https://qiita.com/sheepland/items/67a5bb9b19d8686f389d
> - https://speakerdeck.com/kyohmizu/saibagong-ji-kara-kubernetes-kurasutawoshou-rutamefalsexiao-guo-de-nasekiyuriteidui-ce?slide=18

#### ▼ コンテナの場合

Podの `.spec.securityContext`キーを使用して、コンテナのプロセスの実行ユーザーに認可スコープを付与する。

> - https://kubernetes.io/docs/tasks/configure-pod-container/security-context/
> - https://speakerdeck.com/kyohmizu/saibagong-ji-kara-kubernetes-kurasutawoshou-rutamefalsexiao-guo-de-nasekiyuriteidui-ce?slide=18

<br>

### 機密な変数やファイルの扱い

#### ▼ Secretの変数の暗号化と管理

Secretの `.data`キーには、`base64`方式でエンコードされた値を設定する必要がある。

この `base64`方式エンコード値をどのように管理するかには選択肢がある。

| 方法                                                  | バージョン管理 | 暗号化とSecretストア                                                                                                                                                                                                                                                                                                               |
| ----------------------------------------------------- | :------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHubリポジトリ                                      |       ⭕️       | `base64`方式エンコード値をGitHubリポジトリ内でそのまま管理する。非推奨である。                                                                                                                                                                                                                                                     |
| GitHubリポジトリ + キーバリュー型バックエンド         |       ⭕️       | `base64`方式エンコード値を暗号化キー (例：AWS KMS、GCP CKM、GPG、PGP、など) で暗号化した上で、リポジトリ上やCluster内でキーバリュー型バックエンド (例：SOPS、Hashicorp Vault、Secrets Store CSI Driver、External Secrets、External Secrets Operator) で管理する。kube-apiserverへの送信前に `base64`方式エンコード値に復号化する。 |
| GitHubリポジトリ + クラウドキーバリュー型バックエンド |       ×        | `base64`方式エンコード値を暗号化キー (例：AWS KMS、GCP CKM、GPG、PGP、など) で暗号化した上で、クラウドプロバイダー内のキーバリュー型バックエンド (例：AWS パラメーターストア、GCP SecretManager、など) で管理する。kube-apiserverへの送信前に `base64`方式エンコード値に復号化する。                                               |

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/secret-management/
> - https://www.thorsten-hans.com/encrypt-your-kubernetes-secrets-with-mozilla-sops/
> - https://akuity.io/blog/how-to-manage-kubernetes-secrets-gitops/

<br>

## 02. 可用性

### コントロールプレーンNode

#### ▼ 冗長化

コントロールプレーンNodeは`3`~`7`台を作成し、Etcdの可用性を担保する。

> - https://www.siderolabs.com/blog/why-should-a-kubernetes-control-plane-be-three-nodes/
> - https://www.techscore.com/blog/2019/03/28/raft-consensus-algorithm/

<br>

### ワーカーNode

#### ▼ Nodeグループ

ワーカーNodeはPodの種類 (アプリ系、システム系、ロードバランサー系、バッチ系、など) ごとに作成し、可用性を担保する。

特にクラウドプロバイダーではNodeグループを作成できる。

#### ▼ 冗長化

NodeグループごとにワーカーNodeを冗長化する。

#### ▼ 水平スケーリング

オートスケーラー (例：cluster autoscaler、Karpenter) を使用してワーカーNodeを水平スケーリングし、可用性を担保する。

<br>

### Pod

#### ▼ 冗長化

ReplicaSetでPodを冗長化し、可用性を担保する。

#### ▼ 水平スケーリング

HorizontalPodAutoscalerでPodを水平スケーリングし、可用性を担保する。

<br>

### コンテナ

#### ▼ ヘルスチェック

コンテナをヘルスチェック (例：LivenessProbe、ReadinessProbe) できるようにする。

<br>

## 03. 保守性

### 設計規約

#### ▼ マイナーバージョン単位でアップグレード

アップグレード時、新旧バージョンのコントロールプレーンコンポーネントが並行的に稼働する。

基本的にはいずれのコントロールプレーンコンポーネントも、並行的に稼働するコンポーネントのバージョンを前方/後方の `1`個のマイナーバージョン以内に収める必要がある。

そのため、Kubernetesのアップグレードもこれに合わせて、後方の `1`個のマイナーバージョンにアップグレードしていくことになる。

マイナーバージョンを `2`個以上跨いだアップグレードは非推奨である。

> - https://kubernetes.io/releases/version-skew-policy/

#### ▼ コントロールプレーンコンポーネントでダウンタイムを発生させない

コントロールプレーンコンポーネントでダウンタイムが発生すると、Nodeコンポーネントが正常に稼働しなくなる。

これにより、システム全体でダウンタイムが発生する可能性がある。

ただし、コントロールプレーンコンポーネントの、kube-controller-manager、kube-scheduler、ではダウンタイムが発生することは許容する。

> - https://logmi.jp/tech/articles/323032

#### ▼ コントロールプレーンコンポーネントのデータを損失させない

コントロールプレーンコンポーネントやNodeコンポーネントのデータを損失させないようにする。

ただし、コンテナ内のローカルストレージの損失は許容する。

> - https://logmi.jp/tech/articles/323032

#### ▼ 廃止されるAPIグループのバージョンを確認する

アップグレードに伴い、kube-apiserverでAPIグループのバージョンが廃止されることがある。

これにより、マニフェストでAPIグループのバージョンを宣言できなくなってしまうため、確認が必要である。

静的解析ツール (例：pluto) を使用すると検出しやすい。

> - https://eng-blog.iij.ad.jp/archives/17944

#### ▼ 変更されるメトリクス名やクエリロジックを確認する

アップグレードに伴い、監視系リソース (例：Prometheus、Grafana) でメトリクス名やクエリロジックが廃止されることがある。

これにより、メトリクスのデータポイントを収集できなくなってgしまうため、確認が必要である。

> - https://eng-blog.iij.ad.jp/archives/17944

#### ▼ 動作確認では、Podだけでなく、Podの管理リソースも確認する

動作確認として、`Ready`コンディションと `Running`ステータスを `kubectl get pod`で確認する。

また加えて、Podの作成が始まらないと、`kubectl get pod`コマンドにPod自体が表示されない。

そのため、`kubectl get deployment`で、Podの管理リソース (例：Deployment) の全てのPodが `Ready`コンディションかどうかを確認しておく。

<br>

### コントロールプレーンNodeのアップグレード

#### ▼ コントロールプレーンNodeのアップグレードとは

まず最初に、コントロールプレーンNodeをアップグレードする。

必要であれば、コントロールプレーンNodeのアドオン (例：aws-eks-corednsアドオン、aws-eks-kubeproxyアドオン、aws-vpc-cniアドオン) を別々にアップグレードする。

> - https://www.eksworkshop.com/intermediate/320_eks_upgrades/upgradeeks/
> - https://www.eksworkshop.com/intermediate/320_eks_upgrades/upgradeaddons/

#### ▼ インプレース方式

コントロールプレーンNodeのkube-apiserverのアップグレード時間がダウンタイムに相当する。

ただし、コントロールプレーンNodeがマネージドなクラウドプロバイダーのいくつか (例：AWS) では、kube-apiserverでダウンタイムの発生しないアップグレードを手法を採用している。

このアップグレードでは、コントロールプレーンNodeはインプレース方式でアップグレードしてもダウンタイムが発生しないことが保証されている (ワーカーNodeではダウンタイムが発生してしまう) 。

> - https://aws.github.io/aws-eks-best-practices/reliability/docs/controlplane/#handling-cluster-upgrades

#### ▼ ローリング方式

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

> - https://www.eksworkshop.com/intermediate/320_eks_upgrades/upgrademng/

#### ▼ インプレース方式

既存のNodeグループ内のワーカーNodeをそのままアップグレードする。

ワーカーNodeのアップグレード時間がそのままダウンタイムになるため、メンテナンス時間を設けられる場合にのみ使用できる。

> - https://logmi.jp/tech/articles/323033

`(1)`

: ワーカーNodeを削除する。

`(2)`

: ワーカーNodeを再作成する。

#### ▼ セルフマネージドなローリング方式 (サージ方式、ライブ方式)

![kubernetes_live-upgrade](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_live-upgrade.png)

『サージ方式』『ライブ方式』ともいう。

新Nodeグループを作成し、旧Nodeグループ内のワーカーNodeを順にドレインしていくことにより、アップグレードする。

一度にアップグレードするワーカーNode数 (Surge数) を増やすことにより、アップグレードの速さを調整できる。

デメリットとして、新バージョンを1つずつしかアップグレードできない。

`(1)`

: 旧Nodeグループ (Prodブルー) を残したまま、新Nodeグループ (Testグリーン) を作成する。

この時、新Nodeグループ内ワーカーNode上にはPodが存在していないため、アクセスが新Nodeグループにルーティングされることはない。

`(2)`

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

> - https://dunkshoot.hatenablog.com/
> - https://hyoublog.com/2020/06/10/kubernetes-node%E3%81%AE%E5%89%8A%E9%99%A4/

`(3)`

: ドレイン処理が完了した後、新Nodeグループ内ワーカーNode上でPodが正常に稼働していることを確認する。

`(4)`

: 動作が問題なければ、旧Nodeグループを削除する。

> - https://zenn.dev/nameless_gyoza/articles/how-to-update-eks-cluster-safely
> - https://logmi.jp/tech/articles/323032

> - https://www.slideshare.net/nttdata-tech/anthos-cluster-design-upgrade-strategy-cndt2021-nttdata/44

#### ▼ マネージドなローリング方式

クラウドプロバイダー (例：AWS、GCP) ではローリング方式をサポートしている。

クラウドプロバイダーのNodeグループ (例：AWS EC2AutoScaling) では、新旧Nodeグループを作成することにより、Nodeを入れ替える。

例えばAWS EC2AutoScalingであれば、アップグレードを開始するとEC2AutoScalingに新旧の起動テンプレートが紐づく。

新旧の起動テンプレート配下のEC2 Nodeを段階的に入れ替えることにより、ローリングアップグレードを実現する。

```bash
$ kubectl get node

NAME                                       STATUS                        ROLES    AGE     VERSION
ip-*****.ap-northeast-1.compute.internal   Ready                         <none>   19m     v1.26.7-eks-*** # 作成した新しいK8sバージョンのNode
ip-*****.ap-northeast-1.compute.internal   Ready                         <none>   19s     v1.26.7-eks-***
ip-*****.ap-northeast-1.compute.internal   NotReady,SchedulingDisabled   <none>   66m     v1.25.7-eks-*** # 削除中の古いK8sバージョンのNode
ip-*****.ap-northeast-1.compute.internal   Ready                         <none>   21m     v1.26.7-eks-***
ip-*****.ap-northeast-1.compute.internal   NotReady,SchedulingDisabled   <none>   75m     v1.25.7-eks-***
ip-*****.ap-northeast-1.compute.internal   NotReady,SchedulingDisabled   <none>   73m     v1.25.7-eks-***
```

> - https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/managed-node-update-behavior.html
> - https://aws.amazon.com/jp/blogs/news/planning-kubernetes-upgrades-with-amazon-eks/
> - https://cloud.google.com/kubernetes-engine/docs/concepts/node-pool-upgrade-strategies#surge

#### ▼ ブルー/グリーン方式

![kubernetes_cluster-migration](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_cluster-migration.png)

『マイグレーション方式』ともいう。

新しいClusterを作成することにより、ワーカーNodeをアップグレードする。

いずれ (例：ロードバランサー) を基点にしてルーティング先を切り替えるかによって、具体的な方法が大きく異なる。

メリットとして、バージョンを1つずつのみでなく飛び越えてアップグレードできる。

`(1)`

: 旧Cluster (Prodブルー) を残したまま、新Cluster (Testグリーン) を作成する。新Clusterには、全てのKubernetesリソースが揃っている。

`(2)`

: 社内から、新Clusterに特定のポート番号でアクセスし、動作を確認する。

`(3)`

: 動作が問題なければ、社外を含む全ユーザーのアクセスのルーティング先を新Clusterに変更する。新Clusterから旧Clusterにロールバックする場合に備えて、旧Clusterは削除せずに残しておく。

> - https://logmi.jp/tech/articles/323032
> - https://logmi.jp/tech/articles/323033
> - https://zenn.dev/nameless_gyoza/articles/how-to-update-eks-cluster-safely
> - https://cloud.google.com/kubernetes-engine/docs/concepts/node-pool-upgrade-strategies#blue-green-upgrade-strategy

<br>

### ツール別

#### ▼ ArgoCD

ArgoCDの場合、チャート (ArgoCDのコンテナイメージ) とCRDの両方のアップグレードする。

ArgoCDをNamespacedスコープで分割している場合、カスタムリソースがCluster内に1つしかないCRDを共有しているため、CRDをアップグレードすると全サービスのカスタムリソースに影響が出る。

この場合、カスタムリソースへの影響を考えて、CRDの差分がないバージョンまではArgoCDをアップグレードできる。

`kubectl diff`コマンドで、現在と新CRDの間に差分があるかどうかを確認できる。

```bash
$ kubectl diff -k "https://github.com/argoproj/argo-cd/manifests/crds?ref=<アップグレード先のArgoCDのバージョン>"
```

もしCRDに差分がある大きなアップグレードの場合、別のClusterを新しく構築し、その上で新ArgoCDも構築することとする。

#### ▼ aws-loadbalancer-controller

aws-loadbalancer-controllerの場合、チャートをアップグレードする。

各サービスのALBへの影響を考えて、CRDの差分がないバージョンまではaws-loadbalancer-controllerをアップグレードできる。

`kubectl diff`コマンドで、現在と新CRDの間に差分があるかどうかを確認できる。

```bash
$ kubectl diff -k "https://github.com/kubernetes-sigs/aws-load-balancer-controller/helm/aws-load-balancer-controller/crds?ref=<アップグレード先のaws-loadbalancer-controllerのバージョン>"
```

#### ▼ descheduler

deschedulerの場合、チャートをアップグレードする。

ArgoCDのリソースに影響がないため、アップグレードは問題ない。

#### ▼ external-dns

external-dnsの場合、チャートをアップグレードする。

ArgoCDのリソースに影響がないため、アップグレードは問題ない。

<br>

## 04. 信頼性

### コンテナ

#### ▼ ステートレス化

コンテナにセッションデータを持たせた場合、Podがスケールインすることにより、コンテナ上のセッションデータを削除してしまう。

セッションデータがなくなると、セッションを途中で維持できなくなってしまう。

コンテナに状態を持たせない代わりに外部のセッション管理サーバー (例：Redis) を使用する。

コンテナがスケールイン/スケールアウトしながらセッション管理サーバーからセッションデータを取得できるようにし、信頼性を担保する。

> - https://qiita.com/tomoyk/items/67722472a55b8dc7d01d#3-%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E4%BF%9D%E7%AE%A1%E5%85%88

<br>

## 05. 運用性

### リリース

#### ▼ CDパイプライン

ArgoCD自体はArgoCD以外でデプロイする必要がある。

GitOpsを採用できないため、CIOpsになる。

本番環境に対して、ローカルマシンまたはCIツール (例：GitHub Actions、CircleCI、GitLab CI) を使用して、ArgoCDをデプロイする。

> - https://developer.mamezou-tech.com/oss-intro/setup-helmfile/

<br>

## 06. 性能

### ワーカーNode

#### ▼ CPU/メモリ

NodeグループにあったCPUとメモリを割り当てる。

例えば、業務アプリは恒常的にCPUとメモリを必要とするため、アプリ系NodeグループにはCPUとメモリを多めに割り当てる。

一方で、バッチ系は瞬間的にこれらを必要とするため、バッチ系Nodeグループには瞬間的な要求 (バースト) に適したCPUとメモリを選ぶ。

AWSであればT系のインスタンスタイプが瞬間的な要求に適している。

#### ▼ ストレージ

Nodeグループにあったストレージを割り当てる。

例えば、ArgoCDがストレージに永続化するデータ量は少ないので、ArgoCDのNodeグループにはストレージはあまり必要ない。

一方で、PrometheusはメトリクスをNodeのストレージに保管する (外部TSDBを使うにしても数日分は保管することになる)。

<br>
