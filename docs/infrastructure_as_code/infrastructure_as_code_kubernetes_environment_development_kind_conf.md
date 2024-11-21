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

`kind`コマンドのパラメーターを設定する。

<br>

### nodes

#### ▼ nodes

Kind ClusterのNode (コントロールプレーンNode、ワーカーNode) を設定する。

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
