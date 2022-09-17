---
title: 【IT技術の知見】仮想化
description: 仮想化の知見を記録しています。
---

# 仮想化

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 仮想化

### 仮想化とは

1つの物理サーバー上で仮想的なハードウェアを稼働させる技術のこと。仮想的あハードウェアの作成方法にはいくつか種類がある。

<br>

### ホスト型仮想化

#### ▼ ホスト型仮想化とは

![ホスト型仮想化](https://user-images.githubusercontent.com/42175286/60386396-3afbd080-9acf-11e9-9094-f61aa839dc04.png)

物理サーバーのホスト上で、仮想サーバー（仮想マシン）を作成する。

#### ▼ Provider例

- Oracle VM VirtualBox
- VMware Workstation
- など

<br>

### ハイパーバイザー型仮想化

#### ▼ ハイパーバイザー型仮想化とは

![ハイパーバイザー型仮想化](https://user-images.githubusercontent.com/42175286/60386395-3afbd080-9acf-11e9-9fbe-6287753cb43a.png)

物理サーバーのBIOSから起動したハイパーバイザー上で、仮想サーバー（仮想マシン）を作成する。この時、ホストは使用しない。

#### ▼ Provider例

- VMware vSphere Hypervisor
- Xen
- KVM
- など

<br>

### コンテナ型仮想化

#### ▼ コンテナ型仮想化とは

![コンテナ型仮想化](https://user-images.githubusercontent.com/42175286/60386394-3afbd080-9acf-11e9-96fd-321a88dbadc5.png)

物理サーバーのホスト上で、仮想サーバーと同様の機能を持つコンテナを作成する。カーネルのリソースを分割できるNamespace（PID namespace、Network namespace、UID namespace）とControl Groupsを使用して、単一のOS上に独立したコンテナを作成する。

#### ▼ Provider例

- Docker
- Containerd
- Podman
- LXC
- OpenVZ
- など

> ℹ️ 参考：
>
> - https://atmarkit.itmedia.co.jp/ait/articles/2206/03/news010.html
> - https://news.mynavi.jp/techplus/article/zerocontena-7/

<br>

## 01-02. 各仮想化のパフォーマンスの比較

### 起動速度の違い

ホスト型とハイパーバイザ型では、ハードウェア（CPU、メモリ、ストレージ）とゲストOSを仮想化することが必要である。一方で、コンテナ型では、ハードウェアとゲストOSの仮想化は行わず、namespaceを使用してコンテナを構成するため、その分起動が速い。

![仮想化の比較](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/仮想化の比較.png)

<br>

### 処理速度の違い

#### ▼ オーバーヘッドの小ささ

ゲストOS上のアプリケーションを操作する場合、ホスト型とハイパーバイザ型では、ハードウェアやハイパーバイザーを経由する必要がある。この分だけ、時間（オーバーヘッド）を要する。一方で、コンテナ型では、各コンテナがホストとカーネルを共有するため、オーバーヘッドが小さい。

![仮想化の比較](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/仮想化の比較.png)

#### ▼ オーバーヘッドの比較

sysbenchというベンチマークツールを使用して、CPU・メモリ・I/O処理に着目し、物理サーバー・コンテナ型仮想化（Docker）・ホスト型仮想化（VirtualBox）のパフォーマンスを比較すると、コンテナ型であるDockerは最もオーバーヘッドが小さい。

> ℹ️ 参考：https://codezine.jp/article/detail/7894

![overhead](https://user-images.githubusercontent.com/42175286/60386476-27049e80-9ad0-11e9-92d8-76eed8927392.png)

<br>

