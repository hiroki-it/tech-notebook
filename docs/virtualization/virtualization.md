---
title: 【IT技術の知見】仮想化
description: 仮想化の知見を記録しています。
---

# 仮想化

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 仮想化とは

`1`個の物理サーバー上で、仮想的なシステム (ハードウェア、ソフトウェア) を稼働させる技術のこと。

<br>

## 02. ハードウェア仮想化

### ハードウェア仮想化とは

物理サーバー上で、物理サーバーのハードウェアとソフトウェアの要素を完全に仮想化する。

> - https://www.techwell.com/techwell-insights/2019/09/explaining-hardware-virtualization-and-containerization
> - https://www.paloaltonetworks.jp/company/in-the-news/2019/making-containers-more-isolated-an-overview-of-sandboxed-container-technologies

<br>

### ホスト型仮想化

#### ▼ ホスト型仮想化とは

![ホスト型仮想化](https://user-images.githubusercontent.com/42175286/60386396-3afbd080-9acf-11e9-9094-f61aa839dc04.png)

物理サーバーのホスト上で、ハードウェアとソフトウェアの要素が完全に仮想化されたサーバー (マシン) を作成する。

#### ▼ Provider例

- Oracle VM VirtualBox
- VMware Workstation

<br>

### ハイパーバイザー型仮想化

#### ▼ ハイパーバイザー型仮想化とは

![ハイパーバイザー型仮想化](https://user-images.githubusercontent.com/42175286/60386395-3afbd080-9acf-11e9-9fbe-6287753cb43a.png)

物理サーバーのBIOSから起動したハイパーバイザー上で、ハードウェアとソフトウェアの要素が完全に仮想化されたサーバー (マシン) を作成する。

この時、ホストは使用しない。

#### ▼ Provider例

- VMware vSphere Hypervisor
- Xen
- KVM

<br>

## 02-02. OS仮想化

### OS仮想化とは

物理サーバー上で、ソフトウェアであるOSを部分的に仮想化しつつ、各仮想環境でハードウェアは共有する。

> - https://www.techwell.com/techwell-insights/2019/09/explaining-hardware-virtualization-and-containerization\
> - https://www.paloaltonetworks.jp/company/in-the-news/2019/making-containers-more-isolated-an-overview-of-sandboxed-container-technologies

<br>

### コンテナ型仮想化

#### ▼ コンテナ型仮想化とは

![コンテナ型仮想化](https://user-images.githubusercontent.com/42175286/60386394-3afbd080-9acf-11e9-96fd-321a88dbadc5.png)

物理サーバーのホスト上で、OSのユーザー空間を分割し、独立した各ユーザー空間上でコンテナを作成する。

> - https://www.undercoverlog.com/entry/2018/10/01/Docker%E3%81%AE%E5%8B%95%E4%BD%9C%E5%8E%9F%E7%90%86%EF%BC%88%E5%90%8D%E5%89%8D%E7%A9%BA%E9%96%93/cgroups%EF%BC%89

#### ▼ Provider例

- Docker
- Containerd
- Podman
- LXC
- OpenVZ

> - https://atmarkit.itmedia.co.jp/ait/articles/2206/03/news010.html
> - https://news.mynavi.jp/techplus/article/zerocontena-7/

<br>

## 03. 各仮想化の性能の比較

### セットアップの速さの違い

ホスト型とハイパーバイザ型では、ハードウェア要素 (例：CPU、メモリ、ストレージ) とソフトウェア (例：ゲストOS) を仮想化する必要がある。

一方で、コンテナ型では、OSのユーザー空間を分割するだけのため、仮想化のセットアップが速い。

![仮想化の比較](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/仮想化の比較.png)

<br>

### 処理速度の違い

#### ▼ オーバーヘッドの小ささ

ゲストOS上のアプリケーションを操作する場合、ホスト型とハイパーバイザ型では、ハードウェアやハイパーバイザーを経由する必要がある。

この分だけ、時間 (オーバーヘッド) を要する。

一方で、コンテナ型では、各コンテナがホストとカーネルを共有するため、オーバーヘッドが小さい。

![仮想化の比較](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/仮想化の比較.png)

#### ▼ オーバーヘッドの比較

sysbenchというベンチマークツールを使用して、CPU・メモリ・I/O処理に着目し、物理サーバー・コンテナ型仮想化 (Docker) ・ホスト型仮想化 (VirtualBox) の性能を比較すると、コンテナ型であるDockerは最もオーバーヘッドが小さい。

> - https://codezine.jp/article/detail/7894

![overhead](https://user-images.githubusercontent.com/42175286/60386476-27049e80-9ad0-11e9-92d8-76eed8927392.png)

<br>
