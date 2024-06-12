---
title: 【IT技術の知見】コマンド＠K3d
description: コマンド＠K3dの知見を記録しています。
---

# コマンド＠K3D

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

```bash
$ curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | sh

$ k3d version
```

> - https://future-architect.github.io/articles/20200929/

<br>

## 02. cluster

### create

#### ▼ --agents

ワーカーNodeの数を設定する。

```bash
$ k3d cluster create foo-cluster --image rancher/k3s:v1.28.0-k3s1 --agent 3
```

```bash
$ kubectl get node -o wide

NAME                       STATUS   ROLES                  AGE   VERSION        INTERNAL-IP   EXTERNAL-IP   OS-IMAGE   KERNEL-VERSION                 CONTAINER-RUNTIME
k3d-foo-cluster-server-0   Ready    control-plane,master   43s   v1.26.6+k3s1   172.18.0.2    <none>        K3s dev    5.4.226-129.415.amzn2.x86_64   containerd://1.7.1-k3s1
k3d-foo-cluster-agent-0    Ready    <none>                 17s   v1.26.6+k3s1   172.18.0.5    <none>        K3s dev    5.4.226-129.415.amzn2.x86_64   containerd://1.7.1-k3s1
k3d-foo-cluster-agent-1    Ready    <none>                 16s   v1.26.6+k3s1   172.18.0.4    <none>        K3s dev    5.4.226-129.415.amzn2.x86_64   containerd://1.7.1-k3s1
k3d-foo-cluster-agent-2    Ready    <none>                 16s   v1.26.6+k3s1   172.18.0.6    <none>        K3s dev    5.4.226-129.415.amzn2.x86_64   containerd://1.7.1-k3s1
```

```bash
# ArgoCDを作成するワーカーNodeの場合
$ kubectl label node k3d-foo-cluster-agent-0 node-type=deploy

# IngressやIngressGatewayを作成するワーカーNodeの場合
$ kubectl label node k3d-foo-cluster-agent-1 node-type=ingress

# アプリケーションを作成するワーカーNodeの場合
$ kubectl label node k3d-foo-cluster-agent-2 node-type=app
```

> - https://docs.rancherdesktop.io/how-to-guides/create-multi-node-cluster/

#### ▼ --config

`config.yaml`ファイルを使用して、K3D Clusterを作成する。

```bash
$ k3d cluster create --config config.yaml
```

> - https://k3d.io/v5.5.1/usage/configfile/#usage

#### ▼ --image

Kubernetesのバージョンを指定して、K3D Clusterを作成する。

```bash
$ k3d cluster create foo-cluster --image rancher/k3s:v1.28.0-k3s1
```

> - https://github.com/k3d-io/k3d/discussions/474
> - https://k3d.io/v5.5.2/usage/commands/k3d_cluster_create/

#### ▼ --servers

コントロールプレーンNodeの数を設定する。

```bash
$ k3d cluster create foo-cluster --image rancher/k3s:v1.28.0-k3s1 --servers 2
```

> - https://k3d.io/v5.5.2/usage/multiserver/

#### ▼ --volume

ホストマシンのファイルをK3d Clusterにマウントする。

`registries.yaml`ファイルをK3D Cluster内の`/etc/rancher/k3s/registries.yaml`に配置する時に役立つ。

```bash
$ k3d cluster create foo-cluster --volume "registries.yaml:/etc/rancher/k3s/registries.yaml
```

> - https://cloudandbuild.jp/blog/article-2#make%E3%81%A7cluster%E3%82%92%E4%BD%9C%E3%81%A3%E3%81%9F%E3%82%8A%E7%A0%B4%E6%A3%84%E3%81%99%E3%82%8B

#### ▼ --wait

kube-apiserverからリクエストが返却された上で、処理を完了させる。

デフォルトで有効になっている。

```bash
$ k3d cluster create foo-cluster --image rancher/k3s:v1.28.0-k3s1 --wait
```

<br>

### delete

```bash
$ k3d cluster delete foo-cluster
```

<br>

### list

K3D Clusterの情報を取得する。

```bash
$ k3d cluster list

NAME          SERVERS   AGENTS   LOADBALANCER
foo-cluster   1/1       4/4      true
```

<br>

## 03. config

### init

`config.yaml`ファイルを作成する。

```bash
$ k3d config init

INFO[0000] COMING SOON: print a basic k3d config with default pre-filled.
```

```yaml
apiVersion: k3d.io/v1alpha5
kind: Simple
metadata:
  name: k3s-default
servers: 1
agents: 0
image: docker.io/rancher/k3s:v1.27.4-k3s1
```

<br>
