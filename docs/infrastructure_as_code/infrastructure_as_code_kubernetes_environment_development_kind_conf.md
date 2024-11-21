---
title: 【IT技術の知見】設定ファイル＠Kind
description: 設定ファイル＠Kindの知見を記録しています。
---

# 設定ファイル＠Kind

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## `kind-config.yaml`

### `kind-config.yaml`ファイルとは

`kind`コマンドのオプションを設定する。

<br>

### nodes

#### ▼ nodes

Kind ClusterのNode (コントロールプレーンNode、ワーカーNode) を設定する。

#### ▼ extraPortMappings

NodeとPod内のコンテナのポートをマッピングする。

```yaml
apiVersion: kind.x-k8s.io/v1alpha4
kind: Cluster
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 80
        hostPort: 80
        protocol: TCP
      - containerPort: 443
        hostPort: 443
        protocol: TCP
```

#### ▼ kubeadmConfigPatches

`kubeadm init`コマンドの実行時に、コントロールプレーンにオプションを設定する。

```yaml
apiVersion: kind.x-k8s.io/v1alpha4
kind: Cluster
nodes:
  - role: control-plane
    kubeadmConfigPatches:
      - |
        kind: InitConfiguration
        nodeRegistration:
          kubeletExtraArgs:
            node-labels: "ingress-ready=true"
```

> - https://kind.sigs.k8s.io/docs/user/configuration/#kubeadm-config-patches

#### ▼ role

Nodeの役割を設定する。

```yaml
apiVersion: kind.x-k8s.io/v1alpha4
kind: Cluster
nodes:
  - role: control-plane
  - role: worker
  - role: worker
  - role: worker
```

> - https://kind.sigs.k8s.io/docs/user/configuration/#nodes

#### ▼ image

Kubernetesのバージョンを設定する。

```yaml
apiVersion: kind.x-k8s.io/v1alpha4
kind: Cluster
nodes:
  - role: control-plane
    image: kindest/node:v1.28.0
  - role: worker
    image: kindest/node:v1.28.0
  - role: worker
    image: kindest/node:v1.28.0
  - role: worker
    image: kindest/node:v1.28.0
```

> - https://kind.sigs.k8s.io/docs/user/configuration/#kubernetes-version

<br>
