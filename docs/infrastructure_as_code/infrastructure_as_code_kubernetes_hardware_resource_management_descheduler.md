---
title: 【IT技術の知見】descheduler＠ハードウェアリソース管理
description: descheduler＠ハードウェアリソース管理の知見を記録しています。
---

# descheduler＠ハードウェアリソース管理

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：<https://hiroki-it.github.io/tech-notebook/>

<br>

## 01. descheduler

### アーキテクチャ

deschedulerは、ポリシーに応じて現在のNodeにあるPodを削除し、より適切なNodeにこれを再スケジューリングする。

類似するkube-schedulerでは、既存のPodを削除して別のNodeに再スケジューリングすることはない。

そのため、Nodeのハードウェアリソースの消費量が動的に高まった場合に、Podを再スケジューリングしてくれない。

他にNodeが障害が起こり、他のNodeにPodが退避した場合に、その後Nodeが復旧したとしても、Podが元のNodeに戻ることはない。

`kubectl rollout restart`コマンドを実行しても良いが、deschedulerを使用すればこれを自動化できる。

deschedulerをCronJobとして定期的に起動させ、Podを自動的に再スケジュールする。

このことからもわかるように、障害復旧後すぐにdeschedulerが起動するわけではなく、CronJobの実行を待つ必要がある。

> ↪️ 参考：
>
> - <https://sreake.com/blog/kubernetes-descheduler/>
> - <https://torumakabe.github.io/post/k8s_descheduler/>
> - <https://speakerdeck.com/daikurosawa/introduction-to-descheduler?slide=8>

<br>

## 01-02. マニフェスト

deschedulerは、Job (descheduler) 、などのマニフェストから構成されている。

<br>

## 02. ポリシー

### ポリシーとは

再スケジューリングの対象とするPodの選定ルールを設定する。

> ↪️ 参考：<https://github.com/kubernetes-sigs/descheduler#policy-and-strategies>

<br>

### ポリシーの種類

#### ▼ LowNodeUtilization

Nodeのリソース (例：CPU、メモリ、など) が指定した閾値以上消費された場合に、閾値に達していないNodeにPodを再スケジューリングする。

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

> ↪️ 参考：<https://speakerdeck.com/daikurosawa/introduction-to-descheduler?slide=23>

#### ▼ RemoveDuplicates

Deployment、StatefulSet、Job、の配下にあるPodが、同じNode上でスケーリングされている場合、これらを他のNodeに再スケジューリングする。

```yaml
apiVersion: descheduler/v1alpha1
kind: DeschedulerPolicy
strategies:
  RemoveDuplicates:
    enabled: true
```

> ↪️ 参考：<https://speakerdeck.com/daikurosawa/introduction-to-descheduler?slide=18>

#### ▼ RemovePodsHavingTooManyRestarts

記入中...

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

> ↪️ 参考：<https://github.com/kubernetes-sigs/descheduler/blob/master/examples/policy.yaml>

#### ▼ RemovePodsViolatingNodeAffinity

`.spec.nodeAffinity`キーの設定に違反しているPodがある場合に、適切なNodeに再スケジューリングする。

```yaml
apiVersion: descheduler/v1alpha1
kind: DeschedulerPolicy
strategies:
  RemovePodsViolatingNodeAffinity:
    enabled: true
```

> ↪️ 参考：<https://github.com/kubernetes-sigs/descheduler/blob/master/examples/policy.yaml>

#### ▼ RemovePodsViolatingInterPodAntiAffinity

記入中...

```yaml
apiVersion: descheduler/v1alpha1
kind: DeschedulerPolicy
strategies:
  RemovePodsViolatingInterPodAntiAffinity:
    enabled: true
```

> ↪️ 参考：<https://github.com/kubernetes-sigs/descheduler/blob/master/examples/policy.yaml>

#### ▼ RemovePodsViolatingTopologySpreadConstraint

記入中...

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

> ↪️ 参考：<https://github.com/kubernetes-sigs/descheduler/blob/master/examples/policy.yaml>

<br>
