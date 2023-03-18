---
title: 【IT技術の知見】ChaosMesh＠総合テスト
description: ChaosMesh＠総合テストの知見を記録しています。
---

# ChaosMesh＠総合テスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ChaosMeshの仕組み

### アーキテクチャ

ChaosMeshは、chaos-dashboard、chaos-controller-manager、chaos-daemon、といったコンポーネントから構成されている。Chaos monkeyやChaos Kongと比べて、Kubernetesにより合った手法でカオスエンジニアリングを実行できる。

![chaos-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/chaos-mesh_architecture.png)

> ↪️ 参考：
>
> - https://chaos-mesh.org/docs/
> - https://www.publickey1.jp/blog/20/kubernetespodchaos_mesh10.html

<br>

## 02. セットアップ

### マニフェストとして

#### チャートとして

GitHubリポジトリからchaos-meshチャートをインストールし、リソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://charts.chaos-mesh.org

$ helm repo update

$ kubectl create namespace chaos-testing

$ helm install <リリース名> <リポジトリ名>/chaos-mesh -n chaos-testing --version <バージョンタグ>
```

> ↪️ 参考：
>
> - https://chaos-mesh.org/docs/production-installation-using-helm/
> - https://github.com/chaos-mesh/charts

<br>
