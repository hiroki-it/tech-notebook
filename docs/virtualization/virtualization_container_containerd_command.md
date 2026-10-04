---
title: 【IT技術の知見】コマンド＠Containerd
description: コマンド＠Containerdの知見を記録しています。
---

# コマンド＠Containerd

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. crictl

### pods

Kubernetes の Node 内で `crictl` コマンドを実行している場合に、Node 内で稼働する Pod を取得する。

> - [Debugging Kubernetes nodes with crictl \| Kubernetes](https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/#list-pods)

```bash
$ crictl pods

POD ID      CREATED             STATE        NAME            NAMESPACE           ATTEMPT        RUNTIME
*****       2 months ago        Ready        foo-pod         foo                 0              (default)
```

<br>

### ps

コンテナを取得する。

> - [Debugging Kubernetes nodes with crictl \| Kubernetes](https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/#list-containers)

```bash
$ crictl ps -a

CONTAINER   IMAGE   CREATED        STATE       NAME              ATTEMPT        POD ID
*****       *****   6 weeks ago    Running     foo-container     1              *****
```

<br>

## 02. ctr

見にくいため、`crictl` コマンドを使用する。

> - [kubeletが使うコンテナランタイムをdockerからcontainerdに変更する - repl.info](https://repl.info/archives/2894/)

<br>
