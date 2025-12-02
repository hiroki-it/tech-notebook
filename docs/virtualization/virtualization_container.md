---
title: 【IT技術の知見】コンテナ＠仮想化
description: コンテナ＠仮想化の知見を記録しています。
---

# コンテナ＠仮想化

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. コンテナエンジン

### コンテナエンジンとは

クライアントからリクエストを受信し、コンテナランタイムを操作する。

> - https://developers.redhat.com/blog/2018/02/22/container-terminology-practical-introduction#advanced_vocabulary

<br>

### コンテナエンジンの種類

- Docker Engine
- Podman

![container_overview](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/container_overview.png)

> - https://zenn.dev/ttnt_1013/articles/f36e251a0cd24e#3.4.-docker%E4%BB%A5%E5%A4%96%E3%81%AEcontainer-runtime%E3%81%AE%E6%88%90%E9%95%B7
> - https://sarusso.github.io/blog/container-engines-runtimes-orchestrators.html

<br>

## 02. コンテナランタイムとは

コンテナのライフサイクル (例：イメージのプル、コンテナ作成削除、コンテナ起動停止など) を管理する。

> - https://thinkit.co.jp/article/17453

<br>

## 02-02. CRIランタイム

### CRIランタイムとは

高レベルなランタイムであり、Podやコンテナを管理する。

- containerd
- CRI-O
- Docker runtime

![container_overview](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/container_overview.png)

> - https://thinkit.co.jp/article/18024
> - https://zenn.dev/ttnt_1013/articles/f36e251a0cd24e#3.4.-docker%E4%BB%A5%E5%A4%96%E3%81%AEcontainer-runtime%E3%81%AE%E6%88%90%E9%95%B7
> - https://sarusso.github.io/blog/container-engines-runtimes-orchestrators.html

<br>

### 機能

#### ▼ コンテナの起動

OCIランタイム (例：runC) と単一／複数のCNIプラグイン (例：flannel) のバイナリを実行し、コンテナを起動する。

![container-runtime_run-container](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/container-runtime_run-container.png)

> - https://karampok.me/posts/container-networking-with-cni/
> - https://github.com/containernetworking/cni/blob/main/SPEC.md#lifecycle--ordering
> - https://zenn.dev/hodagi/articles/643d7819c9582d0ed948#cni%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%95%E3%82%A7%E3%83%BC%E3%82%B9%E4%BB%95%E6%A7%98%E6%9B%B8

#### ▼ イメージレイヤーのキャッシュ

コンテナランタイム (例：Docker、Containerdなど) は、ベースイメージを含む各イメージレイヤーをキャッシュとしてローカルストレージ (例：`var/lib/docker`ディレクトリ、`var/lib/containerd`ディレクトリなど) に保管する。

> - https://docker-docs.uclv.cu/storage/storagedriver/#sharing-promotes-smaller-images
> - https://stackoverflow.com/a/75905173

<br>

## 02-03. OCIランタイム

### OCIランタイムとは

低レベルなランタイムであり、コンテナホストのカーネルと通信し、コンテナの作成に必要な環境を整備する。

- runC
- crun
- gVisor
- Kata Containers Runtime

![container_overview](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/container_overview.png)

> - https://thinkit.co.jp/article/18024
> - https://zenn.dev/ttnt_1013/articles/f36e251a0cd24e#3.4.-docker%E4%BB%A5%E5%A4%96%E3%81%AEcontainer-runtime%E3%81%AE%E6%88%90%E9%95%B7
> - https://sarusso.github.io/blog/container-engines-runtimes-orchestrators.html

<br>
