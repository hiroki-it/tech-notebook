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

deschedulerは、ポリシーに応じて現在のNodeにあるPodを退避させる。

その後、kube-schedulerがより適切なNodeにPodを再スケジューリングさせる。

```bash
$ kubectl get events -n foo

# deschedulerがPodを退避させる
35m         Normal   LowNodeUtilization       pod/foo-5c844554c5-6nk2r            pod evicted from ip-*-*-*-*.ap-northeast-1.compute.internal node by sigs.k8s.io/descheduler
35m         Normal   Killing                  pod/foo-5c844554c5-6nk2r            Stopping container foo

# kube-schedulerがPodを再スケジューリングさせる
35m         Normal   Scheduled                pod/foo-5c844554c5-vgdjl            Successfully assigned foo-5c844554c5-vgdjl to ip-*-*-*-*.ap-northeast-1.compute.internal
35m         Normal   Pulled                   pod/foo-5c844554c5-vgdjl            Container image "public.ecr.aws/docker/library/foo:*.*.*" already present on machine
35m         Normal   Created                  pod/foo-5c844554c5-vgdjl            Created container foo
35m         Normal   Started                  pod/foo-5c844554c5-vgdjl            Started container foo
35m         Normal   SuccessfulCreate         replicaset/foo-5c844554c5           Created pod: foo-5c844554c5-vgdjl
```

> - https://sreake.com/blog/kubernetes-descheduler/
> - https://torumakabe.github.io/post/k8s_descheduler/
> - https://speakerdeck.com/daikurosawa/introduction-to-descheduler?slide=8
> - https://speakerdeck.com/ksudate/podfalseazfen-san-woshi-xian-suru-pod-topology-spread-constraintstodescheduler?slide=31

<br>

### kube-schedulerだけでは足りない理由

Nodeのハードウェアリソースの消費量が動的に高まった場合に、kube-schedulerは現在のNodeからPodを退避し、別のNodeにこれを再スケジューリングさせられない。

他にNodeが障害が起こり、他のNodeにPodが退避した場合に、その後Nodeが復旧したとしても、Podが元のNodeに戻ることはない。

`kubectl rollout restart`コマンドを実行しても良いが、deschedulerを使用すればこれを自動化できる。

deschedulerをCronJobとして定期的に起動させ、Podを自動的に退避させる。

このことからもわかるように、障害復旧後すぐにdeschedulerが起動するわけではなく、CronJobの実行を待つ必要がある。

![descheduler_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/descheduler_architecture.png)

> - https://sreake.com/blog/kubernetes-descheduler/

<br>

## 01-02

### マニフェストの種類

deschedulerは、Job (descheduler) 、ConfigMap、などのマニフェストから構成されている。

<br>

### Job

ここでは、CronJob配下で定義したとする。

Deschedulerの実行頻度が高すぎると可用性が低下するため、システムの特徴に合わせて実行頻度を設定する。

例えば、深夜帯に利用者が少なくなるのであれば、毎日深夜に`1`回だけ実行する。

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  labels:
    app.kubernetes.io/name: descheduler
  name: descheduler
  namespace: descheduler
spec:
  # 毎日 00:00 (JST) にdeschedulerを実行する
  # AWS EKSはUTCでタイムゾーンを設定しているため、9時間分ずらす必要がある
  schedule: "0 15 * * *"

  # その他の例
  # 12:00 と 24:00 (JST) にdeschedulerを実行する
  # schedule: "0 3,15 * * *"

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
    evictLocalStoragePods: "true"
    strategies:
      HighNodeUtilization:
        enabled: "true"
      LowNodeUtilization:
        enabled: "true"
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
        enabled: "true"
      RemoveDuplicates:
        enabled: "true"
      RemoveFailedPods:
        enabled: "true"
      RemovePodsHavingTooManyRestarts:
        enabled: "true"
      RemovePodsViolatingInterPodAntiAffinity:
        enabled: "true"
      RemovePodsViolatingNodeAffinity:
        enabled: "true"
        params:
          nodeAffinityType:
          - requiredDuringSchedulingIgnoredDuringExecution
      RemovePodsViolatingNodeTaints:
        enabled: "true"
      RemovePodsViolatingTopologySpreadConstraint:
        enabled: "true"
```

<br>

## 02. DeschedulerPolicy

### DeschedulerPolicyとは

退避の対象とするPodの選定ルールを設定する。

> - https://github.com/kubernetes-sigs/descheduler#policy-and-strategies>

<br>

### DeschedulerPolicy

#### ▼ LowNodeUtilization

Nodeのハードウェアリソース使用量 (例：CPU、メモリ、など) やPod数が指定したターゲット閾値 (targetThresholds) を超過した場合に、このNode上のPodを退避させる。

さらに、kube-schedulerを使用して、使用量が閾値 (thresholds) を超過していないNodeにPodを退避させる。

注意点として、ターゲット閾値と閾値が近いと、Node間でPodが退避 (descheduler) と再スケジューリング (kube-scheduler) を繰り返す状態になってしまう。

Nodeのハードウェアリソース使用量とPod数がターゲット閾値と閾値の間にある場合、つまりターゲット閾値を超過するNodeが存在せず、閾値よりも低いNodeが存在しない場合、deschedulerは何もしない。

```yaml
apiVersion: descheduler/v1alpha1
kind: DeschedulerPolicy
strategies:
  LowNodeUtilization:
    enabled: "true"
    params:
      nodeResourceUtilizationThresholds:
        # ターゲット閾値 (この値を超過したNodeからPodを退避させる)
        targetThresholds:
          cpu: 70
          memory: 70
          pods: 70
        # 閾値 (kube-schedulerを使用して、この値を超過していないNodeにPodを再スケジューリングさせる)
        thresholds:
          cpu: 20
          memory: 20
          pods: 20
```

> - https://speakerdeck.com/daikurosawa/introduction-to-descheduler?slide=23
> - https://sreake.com/blog/kubernetes-descheduler/

#### ▼ RemoveDuplicates

Workload (例：Deployment、DaemonSet、StatefulSet、Job、など) の配下にあるPodが同じNode上でスケーリングされている場合に、このPodをNodeから退避させる。

該当するNodeがない場合、退避させない。

```yaml
apiVersion: descheduler/v1alpha1
kind: DeschedulerPolicy
strategies:
  RemoveDuplicates:
    enabled: "true"
```

> - https://speakerdeck.com/daikurosawa/introduction-to-descheduler?slide=18
> - https://sreake.com/blog/kubernetes-descheduler/

#### ▼ RemoveFailed

`Failed`ステータスなPodはそのままでは削除されない。

そのため、`Failed`ステータスなPodがある場合は、このPodをNodeから削除する。

```yaml
apiVersion: descheduler/v1alpha1
kind: DeschedulerPolicy
strategies:
  RemoveFailedPods:
    enabled: "true"
    params:
      failedPods:
        minPodLifetimeSeconds: 3600
        # Failedステータスになった理由でフィルタリングする
        reasons:
          - NodeAffinity
        includingInitContainers: "true"
```

> - https://github.com/kubernetes-sigs/descheduler#removefailedpods
> - https://sreake.com/blog/kubernetes-descheduler/

#### ▼ RemovePodsHavingTooManyRestarts

再起動を繰り返しているPodがある場合に、このPodをNodeから退避させる。

再起動の回数の閾値を設定できる。

```yaml
apiVersion: descheduler/v1alpha1
kind: DeschedulerPolicy
strategies:
  RemovePodsHavingTooManyRestarts:
    enabled: "true"
    params:
      podsHavingTooManyRestarts:
        podRestartThreshold: 100
        includingInitContainers: "true"
```

> - https://github.com/kubernetes-sigs/descheduler/blob/master/examples/policy.yaml

#### ▼ RemovePodsViolatingNodeAffinity

`.spec.nodeAffinity`キーの設定に違反しているPodがある場合に、このPodをNodeから退避させる。

```yaml
apiVersion: descheduler/v1alpha1
kind: DeschedulerPolicy
strategies:
  RemovePodsViolatingNodeAffinity:
    enabled: "true"
```

> - https://github.com/kubernetes-sigs/descheduler/blob/master/examples/policy.yaml

#### ▼ RemovePodsViolatingInterPodAntiAffinity

`.spec.affinity.podAffinity`キーの設定に違反しているPodがある場合に、このPodをNodeから退避させる。

```yaml
apiVersion: descheduler/v1alpha1
kind: DeschedulerPolicy
strategies:
  RemovePodsViolatingInterPodAntiAffinity:
    enabled: "true"
```

> - https://github.com/kubernetes-sigs/descheduler/blob/master/examples/policy.yaml
> - https://sreake.com/blog/kubernetes-descheduler/

#### ▼ RemovePodsViolatingNodeTaints

taintsの設定に違反しているPodがある場合に、このPodをNodeから退避させる。

#### ▼ RemovePodsViolatingTopologySpreadConstraint

TopologySpreadConstraintsの設定に違反しているPodがある場合に、このPodをNodeから退避させる。

```yaml
apiVersion: descheduler/v1alpha1
kind: DeschedulerPolicy
strategies:
  RemovePodsViolatingTopologySpreadConstraint:
    enabled: "true"
    params:
      podsHavingTooManyRestarts:
        podRestartThreshold: 100
        includingInitContainers: "true"
```

> - https://github.com/kubernetes-sigs/descheduler/blob/master/examples/policy.yaml

<br>

### グローバルオプション

#### ▼ nodeFit

Podを退避させる前に、他のNodeがPodを再スケジューリングできる条件 (nodeSelector、tolerations、nodeAffinity、など) であるかを検証する。

> - https://github.com/kubernetes-sigs/descheduler#node-fit-filtering

<br>
