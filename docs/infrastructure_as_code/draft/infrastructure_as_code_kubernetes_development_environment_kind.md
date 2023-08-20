---
title: 【IT技術の知見】Kind＠開発環境
description: Kind＠開発環境の知見を記録しています。
---

# Kind＠開発環境

## セットアップ

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

```bash
$ kind create cluster --config kind-config.yaml --name foo-cluster --wait 180s
```

<br>

### delete

Kind Clusterを削除する。

```bash
$ kind delete cluster --name foo-cluster
```

<br>

## kind-config.yaml

`kind`コマンドのパラメーターを設定する。

```yaml
apiVersion: kind.x-k8s.io/v1alpha4
kind: Cluster
nodes:
  - role: control-plane
  - role: worker
  - role: worker
  - role: worker
```

<br>
