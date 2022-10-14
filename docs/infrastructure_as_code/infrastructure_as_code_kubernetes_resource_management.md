---
title: 【IT技術の知見】リソース管理＠Kubernetes
description: リソース管理＠Kubernetesの知見を記録しています。
---

# リソース管理＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. リソース管理とは

種々のKubernetesリソースの状態を管理する。

<br>

## 02. cluster-autoscaler、karpenter

### cluster-autoscalerとは

![kubernetes_cluster-autoscaler](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_cluster-autoscaler.png)

ワーカーNodeの自動水平スケーリングを実行する。metrics-serverから取得したPodの最大リソース消費量（```spec.resources```キーの合計値）と、ワーカーNode全体のリソースの空き領域を比較し、ワーカーNodeをスケールアウト/スケールインさせる。現在の空き容量ではPodを新しく作成できないようであればワーカーNodeをスケールアウトし、反対に空き容量に余裕があればスケールインする。Kubernetes標準のリソースではなく、クラウドプロバイダーを使用する必要がある。コントロールプレーンに配置することが推奨されている。

> ℹ️ 参考：https://speakerdeck.com/oracle4engineer/kubernetes-autoscale-deep-dive?slide=8

例えば、以下のようなシナリオが考えられる。

（１）Podが、ワーカーNodeの```70```%にあたるリソースを要求する。 このPodがスケーリングする時、ワーカーNodeが```1```台では足りない。

（２）事前にスペックを指定したワーカーNodeをもう```1```台作成する。

（３）新しく作成したワーカーNodeでPodをスケジューリングする。

（４）結果として、```2```台それぞれで```70```%を消費するPodがスケジューリングされている。

<br>

### karpenterとは

AWSの場合、cluster-autoscalerの代わりにKarpenterを使用できる。Karpenterでは、作成されるワーカーNodeのスペックを事前に指定する必要がなく、またリソース効率も良い。そのため、必要なスペックの上限がわかっている場合はもちろん、上限を決めきれないような要件（負荷が激しく変化するようなシステム）でも合っている。

> ℹ️ 参考：
> 
> - https://sreake.com/blog/learn-about-karpenter/
> - https://blog.inductor.me/entry/2021/12/06/165743

例えば、以下のようなシナリオが考えられる。

（１）Podが、ワーカーNodeの```70```%にあたるリソースを要求する。 しかし、ワーカーNodeが```1```台では足りない。```70 + 70 = 140%```になるので、既存のワーカーNodeの少なくとも```1.4```倍のスペックが必要となる。

（２）新しく決定したスペックで、ワーカーNodeを新しく作成する。

（３）新しく作成したワーカーNodeにPodをスケジューリングする。また、既存のワーカーNodeが不要であれば削除する。

（４）結果として、```1```台で```2```個のPodがスケジューリングされている。


<br>

## 03. descheduler

### deschedulerとは

deschedulerは、Podの再スケジューリングする。類似するkube-schedulerでは、既存のPodを削除して別のワーカーNodeに再スケジューリングすることはない。そのため、ワーカーNodeが障害が起こり、他のワーカーNodeにPodが退避した後、ワーカーNodeが復旧したとしても、Podが元のワーカーNodeに戻ることはない。```kubectl rollout restart```コマンドを実行しても良いが、deschedulerを使用すればこれを自動化できる。deschedulerをJobとして起動させ、Podを自動的に再スケジュールする。

> ℹ️ 参考：
>
> - https://torumakabe.github.io/post/k8s_descheduler/
> - https://speakerdeck.com/daikurosawa/introduction-to-descheduler?slide=8

<br>

## 04. metrics-server

### metrics-server

PodとNodeのメトリクスを収集し、Podの負荷状態に合わせて、Podの自動水平スケーリングを実行する。

<br>

### metrics-serverの仕組み

metrics-serverは、拡張apiserver、ローカルストレージ、スクレイパー、から構成される。また必須ではないが、HorizontalPodAutoscalerとVerticalPodAutoscalerを作成すれば、Podの自動水平スケーリングや自動垂直スケーリングを実行できる。KubernetesのワーカーNodeとPod（それ以外のKubernetesリソースは対象外）のメトリクスをスクレイピングしつつ、収集したメトリクスを拡張apiserverで公開する。クライアント（```kubectl```コマンド実行者、HorizontalPodAutoscaler、VerticalPodAutoscaler）がmetrics-serverのAPIからメトリクスを参照する場合、まずはkube-apiserverにリクエストが送信され、metrics-serverへのプロキシを経て、メトリクスが返却される。似た名前のツールにkube-metrics-serverがあるが、こちらはExporterとして稼働する。

> ℹ️ 参考：
>
> - https://speakerdeck.com/bells17/metrics-server?slide=20
> - https://github.com/kubernetes-sigs/metrics-server/tree/master/manifests/base

![kubernetes_metrics-server](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_metrics-server.png)

<br>

### 拡張apiserver

#### ▼ 拡張apiserverとは

ServiceとAPIServiceを介して、クライアント（```kubectl```コマンド実行者、HorizontalPodAutoscaler、VerticalPodAutoscaler）からのリクエストを受信し、メトリクスのデータポイントのレスポンスを返信する。データポイントはローカルストレージに保管している。

> ℹ️ 参考：
>
> - https://software.fujitsu.com/jp/manual/manualfiles/m220004/j2ul2762/01z201/j2762-00-02-11-01.html
> - https://qiita.com/Ladicle/items/f97ab3653e8efa0e9d58

#### ▼ 拡張apiserverへのリクエスト

クライアントが```kubectl```コマンド実行者の場合は、```kubectl top```コマンドを実行する。

```bash
# ワーカーNodeのメトリクスを取得
$ kubectl top node
 
# Podのメトリクスを取得
$ kubectl top pod -n <任意のNamespace>
```

また、クライアントがHorizontalPodAutoscalerやVerticalPodAutoscalerの場合は、kube-apiserverを介して、拡張apiserverからNodeやPodのメトリクスを取得し、Podのオートスケーリングする。

> ℹ️ 参考：https://www.stacksimplify.com/aws-eks/aws-eks-kubernetes-autoscaling/learn-to-master-horizontal-pod-autoscaling-on-aws-eks/

![horizontal-pod-autoscaler](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/horizontal-pod-autoscaler.png)

<br>

### ローカルストレージ

メトリクスのデータポイントを保存する。

<br>

### スクレイパー

対象からメトリクスのデータポイントを収集し、ローカルストレージに保存する。スクレイピングのために、ServiceAccountとClusterRoleを作成する必要がある。

<br>

### HorizontalPodAutoscaler

#### ▼ HorizontalPodAutoscalerとは

![horizontal-pod-autoscaler](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/horizontal-pod-autoscaler.png)

Podの自動水平スケーリングを実行する。metrics-serverから取得したPodに関するメトリクス値とターゲット値を比較し、kubeletを介して、Podをスケールアウト/スケールインさせる。設定されたターゲットを超過しているようであればスケールアウトし、反対に下回っていればスケールインする。HorizontalPodAutoscalerを使用するためには、metrics-serverも別途インストールしておく必要がある。

> ℹ️ 参考：
>
> - https://www.stacksimplify.com/aws-eks/aws-eks-kubernetes-autoscaling/learn-to-master-horizontal-pod-autoscaling-on-aws-eks/
> - https://dev.classmethod.jp/articles/trying-auto-scaling-eksworkshop/

#### ▼ 最大Pod数の求め方

オートスケーリング時の現在のPod数は、次の計算式で算出される。算出結果に基づいて、スケールアウト/スケールインが実行される。

> ℹ️ 参考：https://speakerdeck.com/oracle4engineer/kubernetes-autoscale-deep-dive?slide=14

```mathematica
(必要な最大Pod数)
= (現在のPod数) x (現在のPodのCPU平均使用率) ÷ (現在のPodのCPU使用率のターゲット値)
```

例えば、『```現在のPod数 = 5```』『```現在のPodのCPU平均使用率 = 90```』『```現在のPodのCPU使用率のターゲット値 = 70```』だとすると、『```必要な最大Pod数 = 7```』となる。算出結果と比較して、現在のPod数不足しているため、スケールアウトが実行される。

<br>

### VerticalPodAutoscaler

#### ▼ VerticalPodAutoscalerとは

Podの垂直スケーリングを実行する。

> ℹ️ 参考：
>
> - https://ccvanishing.hateblo.jp/entry/2018/10/02/203205
> - https://speakerdeck.com/oracle4engineer/kubernetes-autoscale-deep-dive?slide=8

<br>
