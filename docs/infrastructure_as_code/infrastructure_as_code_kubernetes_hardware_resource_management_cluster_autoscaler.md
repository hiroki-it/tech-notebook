---
title: 【IT技術の知見】cluster-autoscaler＠ハードウェアリソース管理
description: cluster-autoscaler＠ハードウェアリソース管理の知見を記録しています。
---

# cluster-autoscaler＠ハードウェアリソース管理

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：<https://hiroki-it.github.io/tech-notebook/>

<br>

## 01. cluster-autoscaler

### アーキテクチャ

cluster-autoscalerは、クラウドプロバイダーのNodeグループ (例：AWS EKS Nodeグループ) と自動スケーリンググループ (例：AWS EC2 AutoScalingGroup) のAPIをコールし、Nodeの自動水平スケーリングを実行する。

自動水平スケーリングの条件を何にするかに応じて、アーキテクチャが異なる。

コントロールプレーンNodeに配置することが推奨されている。

クラウドプロバイダーのコンソール画面からNodeの希望数を手動で増やし、しばらくするとcluster-autoscalerがこれを適切な数に自動的に元に戻すことから、動作を確認できる。

> ↪️：
>
> - <https://speakerdeck.com/oracle4engineer/kubernetes-autoscale-deep-dive?slide=8>
> - <https://docs.aws.amazon.com/eks/latest/userguide/autoscaling.html>

<br>

### 条件に応じたアーキテクチャ

#### ▼ Podのスケジューリングの可否が条件の場合

Podのスケジューリングの可否を条件とする場合は、metrics-serverを使用する。

取得したPodのハードウェアの最大リソース消費量 (`.spec.resources`キーの合計値) と、Node全体のリソースの空き領域を定期的 (`10`分ほど) に比較し、Nodeをスケーリングさせる。

この時、現在の空きサイズではPodを新しく作成できないようであればNodeをスケールアウトし、反対に空き容量に余裕があればスケールインする。

そのため、Podのスケジューリングの可否を条件とする場合には、metrics-serverも採用する必要がある。

![kubernetes_cluster-autoscaler](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_cluster-autoscaler.png)

> ↪️：https://esakat.github.io/esakat-blog/posts/eks-advent-calender-2020/#pod%E3%81%AE%E8%B2%A0%E8%8D%B7%E9%87%8F%E3%81%AB%E5%90%88%E3%82%8F%E3%81%9B%E3%81%A6%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%AA%E3%83%B3%E3%82%B0hpametricsserverclusterautoscaler

#### ▼ Kubernetes以外のメトリクスを条件するとする場合

Kubernetes以外のメトリクス (例：AWS CloudWatch、Google CloudMonitoring) を条件とする場合は、metrics-serverは不要である。

> ↪️：https://esakat.github.io/esakat-blog/posts/eks-advent-calender-2020/#%E5%A4%96%E9%83%A8%E3%83%A1%E3%83%88%E3%83%AA%E3%82%AF%E3%82%B9%E3%82%92%E5%88%A9%E7%94%A8%E3%81%97%E3%81%A6%E3%81%AE%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%AA%E3%83%B3%E3%82%B0hpacloudwatchclusterautoscaler

<br>

### karpenterとの違い

karpenterは、EC2のグループ (例：AWS EC2フリート) に関するAPIをコールする。

一方でcluster-autoscalerは、クラウドプロバイダーの自動スケーリング (例：AWS EC2AutoScaling) に関するAPIをコールする。

![karpenter_vs_cluster-autoscaler.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/karpenter_vs_cluster-autoscaler.png)

> ↪️：https://www.linkedin.com/pulse/karpenter-%D1%83%D0%BC%D0%BD%D0%BE%D0%B5-%D0%BC%D0%B0%D1%81%D1%88%D1%82%D0%B0%D0%B1%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5-kubernetes-%D0%BA%D0%BB%D0%B0%D1%81%D1%82%D0%B5%D1%80%D0%B0-victor-vedmich/?originalSubdomain=ru

<br>

## 01-02. マニフェスト

### マニフェストの種類

cluster-autoscalerは、Deployment (cluster-autoscaler) 、ConfigMap (cluster-autoscaler-status) 、などのマニフェストから構成されている。

<br>

### Deployment配下のPod

#### ▼ cluster-autoscaler

Nodeグループ名やこれのタグ値を使用して、コールするNodeグループをフィルタリングする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  containers:
    - command:
        - ./cluster-autoscaler
        # クラウドプロバイダーを設定する。
        - "--cloud-provider=aws"
        - "--namespace=kube-system"
        # Nodeグループが設定されたClusterを設定する。
        - "--node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/<Cluster名>"
        - "--logtostderr=true"
        - "--stderrthreshold=info"
        - "--v=4"
      env:
        - name: AWS_REGION
          value: ap-northeast-1
      image: "registry.k8s.io/autoscaling/cluster-autoscaler:v1.23.0"
      name: aws-cluster-autoscaler
      ports:
        - containerPort: 8085
          protocol: TCP
```

<br>

### ConfigMap

#### ▼ cluster-autoscaler-status

cluster-autoaclerのステータスが設定される。

動作確認に使用できる。

```bash
$ kubectl get configmap -n kube-system cluster-autoscaler-status -o yaml
```

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cluster-autoscaler-status
  namespace: kube-system
data:
  status: |

    ...
```

`.data.status`キー配下に、以下のような情報を持つ。

```yaml
Cluster-autoscaler status at 2023-03-27 10:38:18.725943178 +0000 UTC:

Cluster-wide:
  Health:      Healthy (ready=10 unready=0 (resourceUnready=0) notStarted=0 longNotStarted=0 registered=10 longUnregistered=0)               LastProbeTime:      2023-03-27 10:38:18.722053187 +0000 UTC ...
               LastTransitionTime: 2023-03-27 10:25:12.791878569 +0000 UTC ...

  ScaleUp:     NoActivity (ready=10 registered=10)
               LastProbeTime:      2023-03-27 10:38:18.722053187 +0000 UTC ...
               LastTransitionTime: 2023-03-27 10:25:12.791878569 +0000 UTC ...

  ScaleDown:   CandidatesPresent (candidates=2)
               LastProbeTime:      2023-03-27 10:38:18.722053187 +0000 UTC ...
               LastTransitionTime: 2023-03-27 10:29:04.227287209 +0000 UTC ...

# Nodeグループ名
NodeGroups:
  Name:        foo-node-group

  # registered：Nodeの現在数  # cloudProviderTarget：Nodeの必要数。cloudProviderTargetのNode数に合わせてスケーリングする。
  # LastProbeTime：直近で確認した時間
  # LastTransitionTime：直近でスケーリングを実施した時間
  Health:      Healthy (ready=4 unready=0 (resourceUnready=0) notStarted=0 longNotStarted=0 registered=4 longUnregistered=0 cloudProviderTarget=4 (minSize=3, maxSize=10))
               LastProbeTime:      2023-03-27 10:38:18.722053187 +0000 UTC ...
               LastTransitionTime: 2023-03-27 10:25:12.791878569 +0000 UTC ...

  # InProgress (スケーリング中)、Backoff (失敗後のコールド期間)、NoActivity (何もしていない)
  # スケールアウトに関する情報
  ScaleUp:     NoActivity (ready=4 cloudProviderTarget=4)
               LastProbeTime:      2023-03-27 10:38:18.722053187 +0000 UTC ...
               LastTransitionTime: 2023-03-27 10:25:12.791878569 +0000 UTC ...

  # スケールインに関する情報
  # CandidatesPresent (スケーリングのNode候補がいる)、NonCacdidates (スケーリングのNode候補がいる)
  ScaleDown:   CandidatesPresent (candidates=2)
               LastProbeTime:      2023-03-27 10:38:18.722053187 +0000 UTC ...
               LastTransitionTime: 2023-03-27 10:29:04.227287209 +0000 UTC ...

...

```

> ↪️：https://speakerdeck.com/zuiurs/kubernetes-cluster-autoscaler-deep-dive?slide=33

<br>

## 02. スケーリングの仕組み

### スケールアウトの場合

例えば、以下のような仕組みで、Nodeの自動水平スケーリングのスケールアウトを実行する。

`【１】`

: Podが、Nodeの`70`%にあたるリソースを要求する。

しかし、Nodeが`1`台では足りない。`70 + 70 = 140%`になるため、既存のNodeの少なくとも`1.4`倍のスペックが必要となる。

`【２】`

: 事前にスペックを指定したNodeを`1`台追加で作成する。

`【３】`

: 新しく作成したNodeでPodをスケジューリングする。

`【４】`

: 結果として、`2`台それぞれで`70`%を消費するPodがスケジューリングされている。

> ↪️：https://speakerdeck.com/oracle4engineer/kubernetes-autoscale-deep-dive?slide=44

<br>

### スケールインの場合

例えば、以下のような仕組みで、Nodeの自動水平スケーリングのスケールインを実行する。

`【１】`

: Podが、Nodeの`30`%にあたるリソースを要求する。

`30 + 30 = 60%`になるため、既存のNodeが`1`台あれば足りる。

`【２】`

: Nodeが`2`台以上あれば、`1`台になるようにNodeを停止する。

`【３】`

: 停止するNode上にいるPodはDrainingする。

`【４】`

: 結果として、`1`台で`60`%を消費するPodがスケジューリングされている。

<br>

## 03. 共通部分

### metadata.annotation

| キー                                                   | 値の例 | 説明                                                           |
| ------------------------------------------------------ | ------ | -------------------------------------------------------------- |
| `cluster-autoscaler.kubernetes.io/scale-down-disabled` | `true` | cluster-autoscalerのスケールインで削除させないNodeに設定する。 |

<br>
