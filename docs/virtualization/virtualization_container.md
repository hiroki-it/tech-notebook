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

### コンテナエンジンの種類

- Docker Engine
- Podman

![container_overview](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/container_overview.png)

> - https://zenn.dev/ttnt_1013/articles/f36e251a0cd24e#3.4.-docker%E4%BB%A5%E5%A4%96%E3%81%AEcontainer-runtime%E3%81%AE%E6%88%90%E9%95%B7
> - https://sarusso.github.io/blog/container-engines-runtimes-orchestrators.html

<br>

## 02. コンテナランタイム

### コンテナランタイムとは

イメージのプル、コンテナ作成削除、コンテナ起動停止、などを行う。

> - https://thinkit.co.jp/article/17453

<br>

### イメージレイヤーのキャッシュ

コンテナランタイム (例：Docker、Containerd、など) は、ベースイメージを含む各イメージレイヤーをキャッシュとしてローカルストレージ (例：`var/lib/docker`ディレクトリ、`var/lib/containerd`ディレクトリ、など) に保管する。

> - https://docker-docs.uclv.cu/storage/storagedriver/#sharing-promotes-smaller-images
> - https://stackoverflow.com/a/75905173

<br>

### コンテナランタイムの種類

#### ▼ CRIランタイム

高レベルなランタイムであり、Podやコンテナを管理する。

- containerd
- CRI-O
- Docker runtime

![container_overview](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/container_overview.png)

> - https://thinkit.co.jp/article/18024
> - https://zenn.dev/ttnt_1013/articles/f36e251a0cd24e#3.4.-docker%E4%BB%A5%E5%A4%96%E3%81%AEcontainer-runtime%E3%81%AE%E6%88%90%E9%95%B7
> - https://sarusso.github.io/blog/container-engines-runtimes-orchestrators.html

#### ▼ OCIランタイム

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
