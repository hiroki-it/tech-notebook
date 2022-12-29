---
title: 【IT技術の知見】ChaosMesh＠総合テスト
description: ChaosMesh＠総合テストの知見を記録しています。
---

# ChaosMesh＠総合テスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. ChaosMeshの仕組み

### アーキテクチャ

ChaosMeshは、chaos-dashboard、chaos-controller-manager、chaos-daemon、から構成されている。Chaos monkeyやChaos Kongと比べて、Kubernetesにより合った手法でカオスエンジニアリングを実行できる。

![chaos-mesh_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/chaos-mesh_architecture.png)

> ℹ️ 参考：
>
> - https://chaos-mesh.org/docs/
> - https://www.publickey1.jp/blog/20/kubernetespodchaos_mesh10.html

<br>

## 02. セットアップ

### チャートとして

#### GitHubリポジトリから

GitHubリポジトリからchaos-meshチャートをインストールし、リソースを作成する。

> ℹ️ 参考：
>
> - https://chaos-mesh.org/docs/production-installation-using-helm/
> - https://github.com/chaos-mesh/charts

```bash
$ helm repo add chaos-mesh https://charts.chaos-mesh.org
$ helm repo update

$ kubectl create namespace chaos-testing
$ helm install chaos-mesh chaos-mesh/chaos-mesh -n chaos-testing -f values.yaml
```

<br>
