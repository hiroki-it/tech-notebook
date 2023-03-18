---
title: 【IT技術の知見】cluster-autoscaler＠ハードウェアリソース管理
description: cluster-autoscaler＠ハードウェアリソース管理の知見を記録しています。
---

# cluster-autoscaler＠ハードウェアリソース管理

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：<https://hiroki-it.github.io/tech-notebook/>

<br>

## 01. cluster-autoscaler

### アーキテクチャ

cluster-autoscalerは、クラウドプロバイダーのNodeグループ (例：AWS EKS Nodeグループ) と自動スケーリンググループ (例：AWS EC2 AutoScalingGroup) のAPIをコールし、Nodeの自動水平スケーリングを実行する。

metrics-serverから取得したPodのハードウェアの最大リソース消費量 (`.spec.resources`キーの合計値) と、Node全体のリソースの空き領域を比較し、Nodeをスケーリングさせる。

現在の空きサイズではPodを新しく作成できないようであればNodeをスケールアウトし、反対に空き容量に余裕があればスケールインする。

コントロールプレーンNodeに配置することが推奨されている。

![karpenter_vs_cluster-autoscaler.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/karpenter_vs_cluster-autoscaler.png)

> ↪️ 参考：
>
> - <https://speakerdeck.com/oracle4engineer/kubernetes-autoscale-deep-dive?slide=8>
> - <https://docs.aws.amazon.com/eks/latest/userguide/autoscaling.html>

<br>

## 01-02. マニフェスト

### マニフェストの種類

cluster-autoscalerは、Deployment (cluster-autoscaler) などのマニフェストから構成されている。

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
        - "--cloud-provider=aws"
        - "--namespace=kube-system"
        - "--node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/foo-node-group"
        - "--logtostderr=true"
        - "--stderrthreshold=info"
        - "--v=4"
      env:
        - name: AWS_REGION
          value: ap-northeast-1
      image: "k8s.gcr.io/autoscaling/cluster-autoscaler:v1.23.0"
      name: aws-cluster-autoscaler
      ports:
        - containerPort: 8085
          protocol: TCP
```

<br>

## 02. スケーリングの仕組み

### スケールアウトの場合

![kubernetes_cluster-autoscaler](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_cluster-autoscaler.png)

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

<br>

### スケールインの場合

例えば、以下のような仕組みで、Nodeの自動水平スケーリングのスケールインを実行する。

クラウドプロバイダーのコンソール画面からNode数を増やして、正しくスケーリングされるかと`ScaleDown`のログから、cluster-autoscalerを動作確認できる。

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
