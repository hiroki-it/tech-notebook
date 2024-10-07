---
title: 【IT技術の知見】ChaosMesh＠システムテスト
description: ChaosMesh＠システムテストの知見を記録しています。
---

# ChaosMesh＠システムテスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ChaosMeshの仕組み

### アーキテクチャ

ChaosMeshは、chaos-dashboard、chaos-controller-manager、chaos-daemon、といったコンポーネントから構成されている。

他のカオスエンジニアリングツール (例：Chaos monkey、Chaos Kong) と比べて、Kubernetesにより合った手法でカオスエンジニアリングを実行できる。

![chaos-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/chaos-mesh_architecture.png)

> - https://chaos-mesh.org/docs/
> - https://www.publickey1.jp/blog/20/kubernetespodchaos_mesh10.html

<br>

### 注入できる障害

#### ▼ Kubernetes

- Podの障害 (再起動など)

#### ▼ AWS

- AWS EC2 Nodeの障害 (再起動など)

#### ▼ Google Cloud

- Google Compute Engineの障害 (再起動など)

<br>

## 02. セットアップ

### マニフェストとして

#### チャートとして

GitHubリポジトリからchaos-meshチャートをインストールし、リソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://charts.chaos-mesh.org

$ helm repo update

$ kubectl create namespace chaos-testing

$ helm install <Helmリリース名> <チャートリポジトリ名>/chaos-mesh -n chaos-testing --version <バージョンタグ>
```

> - https://chaos-mesh.org/docs/production-installation-using-helm/
> - https://github.com/chaos-mesh/charts

<br>
