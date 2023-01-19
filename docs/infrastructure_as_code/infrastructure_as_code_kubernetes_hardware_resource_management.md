---
title: 【IT技術の知見】ハードウェアリソース管理＠Kubernetes
description: ハードウェアリソース管理＠Kubernetesの知見を記録しています。
---

# ハードウェアリソース管理＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. リソース管理とは

種々のKubernetesリソースの状態を管理する。



<br>

## 02. addon-resizer

### addon-resizer

サイドカーコンテナとして稼働し、指定したコンテナのハードウェアリソースの要求量を動的に垂直スケーリングする。

マイクロサービスのコンテナのためというよりは、インフラ領域のコンテナのために使用する。

特に、NodeでDaemonSetとして稼働するテレメトリー収集系のコンテナ（例：metrics-server、kube-state-metrics、heaper）では、Node内のコンテナが増えるほどハードウェアリソースの要求量が増える。

コンテナの増加に合わせて要求量を動的に変更できるように、addon-resizerを使用する。

> ℹ️ 参考：
> 
> - https://github.com/kubernetes/autoscaler/tree/master/addon-resizer
> - https://qiita.com/superbrothers/items/650d6591aa6531bdbd08

<br>

### ConfigMap

#### ▼ metrics-serverの場合

以下のようなConfigMapを作成する。

```addonmanager.kubernetes.io/mode```キーに```EnsureExists```を設定しないと、addon-managerがデフォルト値に上書きしてしまう。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  labels:
    addonmanager.kubernetes.io/mode: EnsureExists
  name: metrics-server-config
  namespace: kube-system
data:
  NannyConfiguration: |
    apiVersion: nannyconfig/v1alpha1
    kind: NannyConfiguration
    baseMemory: 100Mi
    memoryPerNode: 20Mi
    cpuPerNode: 1m
```

> ℹ️ 参考：https://github.com/kubernetes/kubernetes/tree/master/cluster/addons/addon-manager#addon-manager

<br>

## 03. cluster-autoscaler

### cluster-autoscalerとは

![kubernetes_cluster-autoscaler](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_cluster-autoscaler.png)

Nodeの自動水平スケーリングを実行する。

metrics-serverから取得したPodのハードウェアの最大リソース消費量（```spec.resources```キーの合計値）と、Node全体のリソースの空き領域を比較し、Nodeをスケールアウト/スケールインさせる。

現在の空きサイズではPodを新しく作成できないようであればNodeをスケールアウトし、反対に空き容量に余裕があればスケールインする。

Kubernetes標準のリソースではなく、クラウドプロバイダーを使用する必要がある。

コントロールプレーンに配置することが推奨されている。

> ℹ️ 参考：https://speakerdeck.com/oracle4engineer/kubernetes-autoscale-deep-dive?slide=8

<br>

### cluster-autoscalerの仕組み

#### ▼ スケールアウトの場合

例えば、以下のような仕組みで、Nodeの自動水平スケーリングのスケールアウトを実行する。

（１）Podが、Nodeの```70```%にあたるリソースを要求する。 しかし、Nodeが```1```台では足りない。```70 + 70 = 140%```になるため、既存のNodeの少なくとも```1.4```倍のスペックが必要となる。

（２）事前にスペックを指定したNodeを```1```台追加で作成する。

（３）新しく作成したNodeでPodをスケジューリングする。

（４）結果として、```2```台それぞれで```70```%を消費するPodがスケジューリングされている。

#### ▼ スケールインの場合

例えば、以下のような仕組みで、Nodeの自動水平スケーリングのスケールインを実行する。

（１）Podが、Nodeの```30```%にあたるリソースを要求する。 ```30 + 30 = 60%```になるため、既存のNodeが```1```台あれば足りる。

（２）Nodeが```2```台以上あれば、```1```台になるようにNodeを停止する。

（３）停止するNode上にいるPodはDrainingする。

（４）結果として、```1```台で```60```%を消費するPodがスケジューリングされている。

<br>

## 03-02. karpenter

### karpenterとは

AWSの場合、cluster-autoscalerの代わりにKarpenterを使用できる。

Karpenterでは、作成されるNodeのスペックを事前に指定する必要がなく、またリソース効率も良い。

そのため、必要なスペックの上限がわかっている場合はもちろん、上限を決めきれないような要件（負荷が激しく変化するようなシステム）でも合っている。

> ℹ️ 参考：
> 
> - https://sreake.com/blog/learn-about-karpenter/
> - https://blog.inductor.me/entry/2021/12/06/165743

<br>

### karpenterの仕組み

#### ▼ スケールアウトの場合

例えば、以下のような仕組みで、Nodeの自動水平スケーリングのスケールアウトを実行する。

（１）Podが、Nodeの```70```%にあたるリソースを要求する。 しかし、Nodeが```1```台では足りない。```70 + 70 = 140%```になるため、既存のNodeの少なくとも```1.4```倍のスペックが必要となる。

（２）新しく決定したスペックで、Nodeを新しく作成する。

（３）新しく作成したNodeにPodをスケジューリングする。また、既存のNodeが不要であれば削除する。

（４）結果として、```1```台で```2```個のPodがスケジューリングされている。

#### ▼ スケールインの場合

調査中...

<br>

## 04. descheduler

### deschedulerとは

deschedulerは、Podを再スケジューリングする。

類似するkube-schedulerでは、既存のPodを削除して別のNodeに再スケジューリングすることはない。

そのため、Nodeが障害が起こり、他のNodeにPodが退避した場合に、その後Nodeが復旧したとしても、Podが元のNodeに戻ることはない。

```kubectl rollout restart```コマンドを実行しても良いが、deschedulerを使用すればこれを自動化できる。

deschedulerをCronJobとして定期的に起動させ、Podを自動的に再スケジュールする。

このことからもわかるように、障害復旧後すぐにdeschedulerが起動するわけではなく、CronJobの実行を待つ必要がある。

> ℹ️ 参考：
>
> - https://sreake.com/blog/kubernetes-descheduler/
> - https://torumakabe.github.io/post/k8s_descheduler/
> - https://speakerdeck.com/daikurosawa/introduction-to-descheduler?slide=8


<br>

### ポリシー

#### ▼ ポリシーとは

再スケジューリングの対象とするPodの選定ルールを設定する。



> ℹ️ 参考：https://github.com/kubernetes-sigs/descheduler#policy-and-strategies

#### ▼ LowNodeUtilization

Nodeのリソース（例：CPU、メモリ、など）が指定した閾値以上消費された場合に、閾値に達していないNodeにPodを再スケジューリングする。



> ℹ️ 参考：https://speakerdeck.com/daikurosawa/introduction-to-descheduler?slide=23

```yaml
apiVersion: descheduler/v1alpha1
kind: DeschedulerPolicy
strategies:
  LowNodeUtilization:
    enabled: true
    params:
      nodeResourceUtilizationThresholds:
        thresholds:
          cpu: 20
          memory: 20
          pods: 20
        targetThresholds:
          cpu: 50
          memory: 50
          pods: 50
```


#### ▼ RemoveDuplicates

Deployment、StatefulSet、Job、の配下にあるPodが、同じNode上でスケーリングされている場合、これらを他のNodeに再スケジューリングする。



> ℹ️ 参考：https://speakerdeck.com/daikurosawa/introduction-to-descheduler?slide=18

```yaml
apiVersion: descheduler/v1alpha1
kind: DeschedulerPolicy
strategies:
  RemoveDuplicates:
    enabled: true
```

#### ▼ RemovePodsHavingTooManyRestarts

調査中...

> ℹ️ 参考：https://github.com/kubernetes-sigs/descheduler/blob/master/examples/policy.yaml

```yaml
apiVersion: descheduler/v1alpha1
kind: DeschedulerPolicy
strategies:
  RemovePodsHavingTooManyRestarts:
    enabled: true
    params:
      podsHavingTooManyRestarts:
        podRestartThreshold: 100
        includingInitContainers: true
```



#### ▼ RemovePodsViolatingNodeAffinity

```spec.nodeAffinity```キーの設定に違反しているPodがある場合に、適切なNodeに再スケジューリングする。



> ℹ️ 参考：https://github.com/kubernetes-sigs/descheduler/blob/master/examples/policy.yaml


```yaml
apiVersion: descheduler/v1alpha1
kind: DeschedulerPolicy
strategies:
  RemovePodsViolatingNodeAffinity:
    enabled: true
```


#### ▼ RemovePodsViolatingInterPodAntiAffinity

調査中...

> ℹ️ 参考：https://github.com/kubernetes-sigs/descheduler/blob/master/examples/policy.yaml


```yaml
apiVersion: descheduler/v1alpha1
kind: DeschedulerPolicy
strategies:
  RemovePodsViolatingInterPodAntiAffinity:
    enabled: true
```

#### ▼ RemovePodsViolatingTopologySpreadConstraint

調査中...

> ℹ️ 参考：https://github.com/kubernetes-sigs/descheduler/blob/master/examples/policy.yaml


```yaml
apiVersion: descheduler/v1alpha1
kind: DeschedulerPolicy
strategies:
  RemovePodsViolatingTopologySpreadConstraint:
    enabled: true
    params:
      podsHavingTooManyRestarts:
        podRestartThreshold: 100
        includingInitContainers: true
```



<br>

## 05. metrics-server

### metrics-server

PodとNodeのメトリクスを収集し、Podの負荷状態に合わせて、Podの自動水平スケーリングを実行する。



<br>

### metrics-serverの仕組み

metrics-serverは、拡張apiserverのmetrics-apiserver、ローカルストレージ、スクレイパー、から構成される。

また必須ではないが、HorizontalPodAutoscalerとVerticalPodAutoscalerを作成すれば、Podの自動水平スケーリングや自動垂直スケーリングを実行できる。

KubernetesのNodeとPod（それ以外のKubernetesリソースは対象外）のメトリクスを収集しつつ、収集したメトリクスをmetrics-apiserverで公開する。

クライアント（```kubectl```コマンド実行者、HorizontalPodAutoscaler、VerticalPodAutoscaler）がmetrics-serverのAPIからメトリクスを参照する場合、まずはkube-apiserverにリクエストが送信され、metrics-serverへのプロキシを経て、メトリクスが返却される。

似た名前のツールにkube-metrics-serverがあるが、こちらはExporterとして稼働する。

> ℹ️ 参考：
>
> - https://speakerdeck.com/bells17/metrics-server?slide=20
> - https://github.com/kubernetes-sigs/metrics-server/tree/master/manifests/base

![kubernetes_metrics-server](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_metrics-server.png)

<br>

### metrics-apiserver

#### ▼ metrics-apiserverとは

ServiceとAPIServiceを介して、クライアント（```kubectl```コマンド実行者、HorizontalPodAutoscaler、VerticalPodAutoscaler）からのリクエストを受信し、メトリクスのデータポイントを含むレスポンスを返信する。

データポイントはローカルストレージに保管している。



> ℹ️ 参考：
>
> - https://software.fujitsu.com/jp/manual/manualfiles/m220004/j2ul2762/01z201/j2762-00-02-11-01.html
> - https://qiita.com/Ladicle/items/f97ab3653e8efa0e9d58

#### ▼ metrics-apiserverへのリクエスト

クライアントが```kubectl```コマンド実行者の場合は、```kubectl top```コマンドを実行する。



```bash
# Nodeのメトリクスを取得
$ kubectl top node
 
# Podのメトリクスを取得
$ kubectl top pod -n <任意のNamespace>
```

また、クライアントがHorizontalPodAutoscalerやVerticalPodAutoscalerの場合は、kube-apiserverを介して、metrics-apiserverからNodeやPodのメトリクスを取得し、Podのオートスケーリングする。

![horizontal-pod-autoscaler](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/horizontal-pod-autoscaler.png)


> ℹ️ 参考：https://www.stacksimplify.com/aws-eks/aws-eks-kubernetes-autoscaling/learn-to-master-horizontal-pod-autoscaling-on-aws-eks/


<br>

### ローカルストレージ

メトリクスのデータポイントを保存する。



<br>

### スクレイパー

対象からメトリクスのデータポイントを収集し、ローカルストレージに保存する。

収集のために、ServiceAccountとClusterRoleを作成する必要がある。



<br>

### HorizontalPodAutoscaler

#### ▼ HorizontalPodAutoscalerとは

![horizontal-pod-autoscaler](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/horizontal-pod-autoscaler.png)

Podの自動水平スケーリングを実行する。

metrics-serverから取得したPodに関するメトリクス値とターゲット値を比較し、kubeletを介して、Podをスケールアウト/スケールインさせる。

設定されたターゲットを超過しているようであればスケールアウトし、反対に下回っていればスケールインする。

HorizontalPodAutoscalerを使用するためには、metrics-serverも別途インストールしておく必要がある。

> ℹ️ 参考：
>
> - https://www.stacksimplify.com/aws-eks/aws-eks-kubernetes-autoscaling/learn-to-master-horizontal-pod-autoscaling-on-aws-eks/
> - https://dev.classmethod.jp/articles/trying-auto-scaling-eksworkshop/

#### ▼ 最大Pod数の求め方

オートスケーリング時の現在のPod数は、次の計算式で算出される。

算出結果に基づいて、スケールアウト/スケールインが実行される。



> ℹ️ 参考：https://speakerdeck.com/oracle4engineer/kubernetes-autoscale-deep-dive?slide=14

```mathematica
(必要な最大Pod数)
= (現在のPod数) x (現在のPodのCPU平均使用率) ÷ (現在のPodのCPU使用率のターゲット値)
```

例えば、『```現在のPod数 = 5```』『```現在のPodのCPU平均使用率 = 90```』『```現在のPodのCPU使用率のターゲット値 = 70```』だとすると、『```必要な最大Pod数 = 7```』となる。

算出結果と比較して、現在のPod数不足しているため、スケールアウトが実行される。



<br>

### VerticalPodAutoscaler

#### ▼ VerticalPodAutoscalerとは

Podの垂直スケーリングを実行する。

> ℹ️ 参考：
>
> - https://ccvanishing.hateblo.jp/entry/2018/10/02/203205
> - https://speakerdeck.com/oracle4engineer/kubernetes-autoscale-deep-dive?slide=8

#### ▼ Podの再作成のない垂直スケーリング

執筆時点（2022/12/31）の仕様では、Podを垂直スケーリングする場合に、Podの再作成が必要になる。

これを解決するために、いくつかの方法が提案されている。

| 方法                   | 説明                                                                                               |
|----------------------|--------------------------------------------------------------------------------------------------|
| マニフェストの新しい設定値の追加 | マニフェストに、垂直スケーリング時のルールに関する設定値（例：```spec.containers[].resources[].resizePolicy```キー）を追加する。 |
| eBPFによるインプレース変更      | ハードウェアリソースの不足が検知された時に、eBPFを使用して、Podのマニフェストを変更するJSONPatch処理をフックする。                       |



> ℹ️ 参考：
>
> - https://speakerdeck.com/masayaaoyama/techfeed-expert-night-7-amsy810?slide=12
> - https://qiita.com/shmurata/items/a780a402bb4c9b308cc7#kubelet
> - https://cloud.google.com/kubernetes-engine/docs/concepts/verticalpodautoscaler?hl=ja#vertical_pod_autoscaling_in_auto_mode

<br>
