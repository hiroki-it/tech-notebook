---
title: 【IT技術の知見】addon-resizer＠ハードウェアリソース管理
description: addon-resizer＠ハードウェアリソース管理の知見を記録しています。
---

# addon-resizer＠ハードウェアリソース管理

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：<https://hiroki-it.github.io/tech-notebook/>

<br>

## 01. addon-resizer

### アーキテクチャ

addon-resizerは、サイドカーコンテナとして稼働し、指定したコンテナのハードウェアリソースの要求量を動的に垂直スケーリングする。

マイクロサービスのためというよりは、インフラのために使用する。

特に、NodeでDaemonSetとして稼働するテレメトリー収集系のコンテナ (例：metrics-server、kube-state-metrics、heaper) では、Node内のコンテナが増えるほどハードウェアリソースの要求量が増える。

コンテナの増加に合わせて要求量を動的に変更できるように、addon-resizerを使用する。

> ↪️ 参考：
>
> - <https://github.com/kubernetes/autoscaler/tree/master/addon-resizer>
> - https://github.com/kubernetes/autoscaler/tree/master/addon-resizer/deploy
> - <https://qiita.com/superbrothers/items/650d6591aa6531bdbd08>

<br>

## 01-02. マニフェスト

### マニフェストの種類

addon-resizerは、Deployment (nanny) 、ConfigMap (nanny-config) 、などのマニフェストから構成されている。

<br>

### Deployment配下のPod

#### ▼ nanny

記入中...

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: foo-pod
  namespace: foo-namespace
spec:
  serviceAccountName: pod-nanny
  containers:
    - image: registry.k8s.io/autoscaling/addon-resizer:1.8.14
      name: pod-nanny
      command:
        - /pod_nanny
        - --config-dir=/etc/config
        - --cpu=300m
        - --extra-cpu=20m
        - --memory=200Mi
        - --extra-memory=10Mi
        - --threshold=5
        - --deployment=nanny-v1
```

<br>

### ConfigMap (nanny-config)

#### ▼ metrics-serverの場合

以下のようなConfigMapを作成する。

`addonmanager.kubernetes.io/mode`キーに`EnsureExists`を設定しないと、addon-managerがデフォルト値に上書きしてしまう。

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

> ↪️ 参考：<https://github.com/kubernetes/kubernetes/tree/master/cluster/addons/addon-manager#addon-manager>

<br>
