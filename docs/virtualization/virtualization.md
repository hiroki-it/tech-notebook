---
title: 【知見を記録するサイト】仮想化
description: 仮想化の知見をまとめました。
---

# 仮想化

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 仮想化

### 仮想化とは

1つの物理サーバー上で仮想的なハードウェアを稼働させる技術のこと。仮想的あハードウェアの作成方法にはいくつか種類がある。

<br>

### ホスト型仮想化

#### ▼ ホスト型仮想化とは

物理サーバーのホスト上で、仮想サーバー（仮想マシン）を作成する。

#### ▼ Provider例

Oracle VM VirtualBox、VMware Workstation、など

![ホスト型仮想化](https://user-images.githubusercontent.com/42175286/60386396-3afbd080-9acf-11e9-9094-f61aa839dc04.png)

<br>

### ハイパーバイザー型仮想化

#### ▼ ハイパーバイザー型仮想化とは

物理サーバーのBIOSから起動したハイパーバイザー上で、仮想サーバー（仮想マシン）を作成する。この時、ホストは使用しない。

#### ▼ Provider例

VMware vSphere Hypervisor、Xen、KVM、など

![ハイパーバイザー型仮想化](https://user-images.githubusercontent.com/42175286/60386395-3afbd080-9acf-11e9-9fbe-6287753cb43a.png)

<br>

### コンテナ型仮想化

#### ▼ コンテナ型仮想化とは

物理サーバーのホスト上で、仮想サーバーと同様の機能を持つコンテナを作成する。カーネルのリソースを分割できるNamespace（PID namespace、Network namespace、UID namespace）とControl Groupsを使用して、単一のOS上に独立したコンテナを作成する。

→ DockerToolboxがちょい違う

#### ▼ Provider例

Docker、LXC、OpenVZ、など

![コンテナ型仮想化](https://user-images.githubusercontent.com/42175286/60386394-3afbd080-9acf-11e9-96fd-321a88dbadc5.png)

<br>

## 01-02. 各仮想化のパフォーマンスの比較

### 起動速度の違い

ホスト型とハイパーバイザ型では、ハードウェア（CPU、メモリ、ストレージ）とゲストOSを仮想化することが必要である。一方で、コンテナ型では、ハードウェアとゲストOSの仮想化は行わず、namespaceを使用してコンテナを構成するため、その分起動が速い。

![仮想化の比較](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/仮想化の比較.png)

<br>

### 処理速度の違い

#### ▼ Overheadの小ささ

ゲストOS上のアプリケーションを操作する場合、ホスト型とハイパーバイザ型では、ハードウェアやハイパーバイザーを経由する必要がある。この分だけ、時間（Overhead）を要する。一方で、コンテナ型では、各コンテナがホストとカーネルを共有するため、Overheadが小さい。

![仮想化の比較](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/仮想化の比較.png)

#### ▼ Overheadの比較

sysbenchというベンチマークツールを使用して、CPU・メモリ・I/O処理に着目し、物理サーバー・コンテナ型仮想化（Docker）・ホスト型仮想化（VirtualBox）のパフォーマンスを比較すると、コンテナ型であるDockerは最もOverheadが小さい。

![overhead](https://user-images.githubusercontent.com/42175286/60386476-27049e80-9ad0-11e9-92d8-76eed8927392.png)

<br>

## 02. スケーリング

### スケーリングとは

ハードウェアのスペックや台数を変更することにより、処理能力を向上させること。ただし、実際のハードウェアをスペックや台数を変更することは大変な作業であるため、仮想環境の文脈で説明されることが多い。

<br>

### 垂直スケーリング（スケールアップ ⇔ スケールダウン）

#### ▼ 垂直スケーリングとは

仮想環境自体のスペックをより高くすることにより、仮想環境当たりの処理能力を向上させる。その逆は、スケールダウン。設定でスペックを上げることも、これに該当する。

![スケールアップ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/スケールアップ.png)

<br>

### 水平スケーリング（スケールアウト ⇔ スケールイン）

#### ▼ 水平スケーリングとは

仮想環境の台数を増やすことで、仮想環境全体の処理能力を向上させる。その逆は、スケールイン。

![スケールアウト](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/スケールアウト.png)

<br>

## 03. 冗長化

### 冗長化とは

同じ状態の複数のシステムを設置し、システム全体としての可用性を高くすること。ただし、複数のハードウェアを用意することは大変なため、仮想環境の文脈で説明されることが多い。

<br>

### Dualシステム

同じ処理を行う2つの仮想環境からなるシステム構成のこと。随時、処理結果を照合する。いずれかで障害が起こった場合、異常が発生したシステムを切り離し、残る片方で処理を続けることによって、故障を乗り切る。

![デュアルシステム](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/デュアルシステム.png)

<br>

### Duplexシステム

オンライン処理を行う主系の仮想環境と、バッチ処理を行う従系のそれからなるシステム構成のこと。主系で障害が起こった場合、主系のオンライン処理を従系に引き継いで処理を続けることにより、障害を乗り切る。

![デュプレックスシステム](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/デュプレックスシステム.png)

従系システムの待機方法には2つの種類がある。

#### ▼ ホットスタンバイ

参考：https://www.amazon.co.jp/dp/4297124513

![p613-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p613-1.png)

#### ▼ コールドスタンバイ

参考：https://www.amazon.co.jp/dp/4297124513

![p613-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p613-2.png)

<br>

