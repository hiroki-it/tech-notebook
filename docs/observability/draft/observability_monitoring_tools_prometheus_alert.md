---
title: 【IT技術の知見】アラート＠Prometheus
description: アラート＠Prometheusの知見を記録しています。
---

# アラート＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## Kubernetesで便利なアラート

### `KubeAPIDown`

kube-apiserver から `15` 分以上レスポンスがない場合に発火する。

Kubernetes Cluster のアップグレード時に発火する可能性がある。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubeapidown/

<br>

### `KubeDeploymentReplicasMismatch`

Deployment で指定したレプリカ数の Pod がない場合に発火する。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubedeploymentreplicasmismatch/

<br>

### `KubeVersionMismatch`

コントロールプレーン Node 側の kube-apiserver とワーカーNode 側の kubelet のバージョンが一致していない場合に発火する。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubeversionmismatch/

<br>

### `KubeControllerManagerDown`

kube-controller-manager からレスポンスがない場合に発火する。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubecontrollermanagerdown/

<br>

### `KubeSchedulerDown`

kube-scheduler からレスポンスがない場合に発火する。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubecontrollermanagerdown/

<br>
