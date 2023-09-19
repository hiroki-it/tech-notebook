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

kube-apiserverから`15`分以上レスポンスがない場合に発火する。

Kubernetes Clusterのアップグレード時に発火する可能性がある。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubeapidown/

<br>

### `KubeDeploymentReplicasMismatch`

Deploymentで指定したレプリカ数のPodがない場合に発火する。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubedeploymentreplicasmismatch/

<br>

### `KubeVersionMismatch`

コントロールプレーンNode側のkube-apiserverとワーカーNode側のkubeletのバージョンが一致していない場合に発火する。

> - https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubeversionmismatch/

<br>
