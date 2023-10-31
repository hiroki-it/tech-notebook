---
title: 【IT技術の知見】descheduler＠ハードウェアリソース管理
description: descheduler＠ハードウェアリソース管理の知見を記録しています。
---

# descheduler＠ハードウェアリソース管理

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. descheduler

### アーキテクチャ

deschedulerは、ポリシーに応じて現在のNodeにあるPodを退避させ、より適切なNodeにこれを再スケジューリングさせる。

類似するkube-schedulerでは、既存のPodを退避させて別のNodeに再スケジューリングさせることはない。

そのため、Nodeのハードウェアリソースの消費量が動的に高まった場合に、Podを再スケジューリングしてくれない。

他にNodeが障害が起こり、他のNodeにPodが退避した場合に、その後Nodeが復旧したとしても、Podが元のNodeに戻ることはない。

`kubectl rollout restart`コマンドを実行しても良いが、deschedulerを使用すればこれを自動化できる。

deschedulerをCronJobとして定期的に起動させ、Podを自動的に再スケジュールする。

このことからもわかるように、障害復旧後すぐにdeschedulerが起動するわけではなく、CronJobの実行を待つ必要がある。

![descheduler_architecture.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/descheduler_architecture.png)

> - https://sreake.com/blog/kubernetes-descheduler/
> - https://torumakabe.github.io/post/k8s_descheduler/
> - https://speakerdeck.com/daikurosawa/introduction-to-descheduler?slide=8>
> - https://speakerdeck.com/ksudate/podfalseazfen-san-woshi-xian-suru-pod-topology-spread-constraintstodescheduler?slide=31

<br>

## 01-02

### マニフェストの種類

deschedulerは、Job (descheduler) 、ConfigMap、などのマニフェストから構成されている。

<br>

### Job

ここでは、CronJob配下で定義したとする。

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  labels:
    app.kubernetes.io/name: descheduler
  name: descheduler
  namespace: descheduler
spec:
  schedule: <Cronのルール>
  concurrencyPolicy: Forbid
  successfulJobsHistoryLimit: 1
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      template:
        metadata:
          annotations:
            # ConfigMapの変更に応じて、Jobを更新する。
            checksum/configmap: *****
          labels:
            app.kubernetes.io/name: descheduler
          name: descheduler
        spec:
          containers:
            - name: descheduler
              image: registry.k8s.io/descheduler/descheduler:latest
              command:
                - /bin/descheduler
              args:
                - '--policy-config-file'
                - /policy-dir/policy.yaml
                - '--v'
                - '3'
              volumeMounts:
                - mountPath: /policy-dir
                  name: policy-volume
          # ポリシーの設定ファイルを読み込む
          volumes:
            - configMap:
                name: descheduler
              name: policy-volume
```

<br>

### ConfigMap

DeschedulerPolicyのマニフェストを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  labels:
    app.kubernetes.io/name: descheduler
  name: descheduler
  namespace: descheduler
data:
  policy.yaml: |
    apiVersion: "descheduler/v1alpha1"
    kind: "DeschedulerPolicy"
    evictLocalStoragePods: true
    strategies:
      HighNodeUtilization:
        enabled: true
      LowNodeUtilization:
        enabled: true
        params:
          nodeResourceUtilizationThresholds:
            targetThresholds:
              cpu: 50
              memory: 50
              pods: 50
            thresholds:
              cpu: 20
              memory: 20
              pods: 20
      PodLifeTime:
        enabled: true
      RemoveDuplicates:
        enabled: true
      RemoveFailedPods:
        enabled: true
      RemovePodsHavingTooManyRestarts:
        enabled: true
      RemovePodsViolatingInterPodAntiAffinity:
        enabled: true
      RemovePodsViolatingNodeAffinity:
        enabled: true
        params:
          nodeAffinityType:
          - requiredDuringSchedulingIgnoredDuringExecution
      RemovePodsViolatingNodeTaints:
        enabled: true
      RemovePodsViolatingTopologySpreadConstraint:
        enabled: true
```

<br>

## 02. DeschedulerPolicy

### DeschedulerPolicyとは

再スケジューリングの対象とするPodの選定ルールを設定する。

> - https://github.com/kubernetes-sigs/descheduler#policy-and-strategies>

<br>

### DeschedulerPolicy

#### ▼ LowNodeUtilization

Nodeのハードウェアリソース使用量 (例：CPU、メモリ、など) やPod数が指定したターゲット閾値 (targetThresholds) を超過した場合に、使用量が閾値 (thresholds) を超過していないNodeにPodを再スケジューリングさせる。

注意点として、ターゲット閾値と閾値が近いと、Node間でPodが退避と再スケジューリングを繰り返す状態になってしまう。

Nodeのハードウェアリソース使用量とPod数がターゲット閾値と閾値の間にある場合、つまりターゲット閾値を超過するNodeが存在せず、閾値よりも低いNodeが存在しない場合、deschedulerは何もしない。

```yaml
apiVersion: descheduler/v1alpha1
kind: DeschedulerPolicy
strategies:
  LowNodeUtilization:
    enabled: true
    params:
      nodeResourceUtilizationThresholds:
        # ターゲット閾値 (この値を超過したNodeからPodが退避する)
        targetThresholds:
          cpu: 70
          memory: 70
          pods: 70
        # 閾値 (この値を超過していないNodeにPodを再スケジューリングする)
        thresholds:
          cpu: 20
          memory: 20
          pods: 20
```

> - https://speakerdeck.com/daikurosawa/introduction-to-descheduler?slide=23
> - https://sreake.com/blog/kubernetes-descheduler/

#### ▼ RemoveDuplicates

Deployment、StatefulSet、Job、の配下にあるPodが、同じNode上でスケーリングされている場合、これらを他のNodeに再スケジューリングさせる。

```yaml
apiVersion: descheduler/v1alpha1
kind: DeschedulerPolicy
strategies:
  RemoveDuplicates:
    enabled: true
```

> - https://speakerdeck.com/daikurosawa/introduction-to-descheduler?slide=18

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

> - https://github.com/kubernetes-sigs/descheduler/blob/master/examples/policy.yaml

#### ▼ RemovePodsViolatingNodeAffinity

`.spec.nodeAffinity`キーの設定に違反しているPodがある場合に、適切なNodeに再スケジューリングさせる。

```yaml
apiVersion: descheduler/v1alpha1
kind: DeschedulerPolicy
strategies:
  RemovePodsViolatingNodeAffinity:
    enabled: true
```

> - https://github.com/kubernetes-sigs/descheduler/blob/master/examples/policy.yaml

#### ▼ RemovePodsViolatingInterPodAntiAffinity

記入中...

```yaml
apiVersion: descheduler/v1alpha1
kind: DeschedulerPolicy
strategies:
  RemovePodsViolatingInterPodAntiAffinity:
    enabled: true
```

> - https://github.com/kubernetes-sigs/descheduler/blob/master/examples/policy.yaml

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

> - https://github.com/kubernetes-sigs/descheduler/blob/master/examples/policy.yaml

<br>

### グローバルオプション

#### ▼ nodeFit

Podを退避させる前に、他のNodeがPodを再スケジューリングできる条件 (nodeSelector、tolerations、nodeAffinity、など) であるかを検証する。

> - https://github.com/kubernetes-sigs/descheduler#node-fit-filtering

<br>
