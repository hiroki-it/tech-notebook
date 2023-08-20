---
title: 【IT技術の知見】Kind＠開発環境
description: Kind＠開発環境の知見を記録しています。
---

# Kind＠開発環境

## セットアップ

### バイナリとして

```bash
$ curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
$ chmod +x ./kind
$ mv ./kind /usr/local/bin/kind

$ kind create cluster --config kind-config.yaml
$ kubectl version
$ kubectl cluster-info
```

<br>

## kindコマンド

### create

Kind Clusterを作成する。

#### ▼ --config

`kind-config.yaml`ファイルを指定して、`kind`コマンドを実行する。

```bash
$ kind create cluster --config kind-config.yaml
```

#### ▼ --name

Clusterの名前を設定する。

```bash
$ kind create cluster --name foo-cluster
```

#### ▼ --image

Kubernetesのバージョンを設定する。

Kubernetesのデフォルトのバージョンは、Kindのバージョンごとに決まっている。

```bash
$ kind create cluster --image kindest/node:v1.28.0
```

> - https://kind.sigs.k8s.io/docs/user/quick-start/#creating-a-cluster

#### ▼ --wait

待機時間を設定する。

待機時間の間にNodeがReady状態になるようにする。

デフォルトだと`0`秒なので、必ず設定すること。

```bash
$ kind create cluster --wait 3m
```

> - https://blog.cybozu.io/entry/2019/07/03/170000

<br>

### delete

Kind Clusterを削除する。

```bash
$ kind delete cluster --name foo-cluster
```

<br>

## kind-config.yaml

### kind-config.yamlファイルとば

`kind`コマンドのパラメーターを設定する。

<br>

### nodes

Kind ClusterのNodeを設定する。

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

<br>
