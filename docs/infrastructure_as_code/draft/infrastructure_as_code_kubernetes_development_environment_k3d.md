---
title: 【IT技術の知見】K3d＠開発環境
description: K3d＠開発環境の知見を記録しています。
---

# K3d＠開発環境

## 01. セットアップ

```bash
$ curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | sh

$ k3d version
```

> - https://future-architect.github.io/articles/20200929/

<br>

## 02. cluster

### create

#### ▼ --image

Kubernetesのバージョンを指定して、K3d Clusterを作成する。

```bash
$ k3d cluster create foo-cluster --image rancher/k3s:v1.28.0-k3s1
```

> - https://github.com/k3d-io/k3d/discussions/474
> - https://k3d.io/v5.5.2/usage/commands/k3d_cluster_create/

<br>

### delete

```bash
$ k3d cluster delete foo-cluster
```

<br>
