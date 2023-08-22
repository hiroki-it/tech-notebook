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

KubernetesのコントロールプレーンNodeとワーカーNodeのバージョンを設定する。

Kubernetesのデフォルトのバージョンは、Kindのバージョンごとに決まっている。

```bash
$ kind create cluster --image kindest/node:v1.28.0
```

> - https://kind.sigs.k8s.io/docs/user/quick-start/#creating-a-cluster
> - https://qiita.com/Hiroyuki_OSAKI/items/2395e6bbb98856df12f3#20191228%E8%BF%BD%E5%8A%A0-kubernetes%E3%83%90%E3%83%BC%E3%82%B8%E3%83%A7%E3%83%B3%E3%82%92%E6%8C%87%E5%AE%9A%E3%81%99%E3%82%8B

#### ▼ -v

処理ログの出力レベルを設定する。

数字が大きいほど、出力レベルが低い。(`9`はInfo)

```bash
$ kind create cluster -v 9 --name foo-cluster
```

#### ▼ --wait

待機時間を設定する。

待機時間の間にNodeがReady状態になるようにする。

デフォルトだと`0`秒であり、コントロールプレーンNodeとワーカーNodeが一台ずつで`2`分半かかる。

```bash
$ kind create cluster --wait 3m
```

> - https://blog.cybozu.io/entry/2019/07/03/170000
> - https://zaki-hmkc.hatenablog.com/entry/2020/08/01/135922#%E3%82%AF%E3%83%A9%E3%82%B9%E3%82%BF%E4%BD%9C%E6%88%90

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
