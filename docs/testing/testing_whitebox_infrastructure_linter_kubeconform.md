---
title: 【IT技術の知見】 Kubeconform＠文法の誤りテスト
description: Kubeconform＠文法の誤りテストの知見を記録しています。
---

# Kubeconform＠文法の誤りテスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

```bash
$ brew install kubeconform
```

> ↪️：https://github.com/yannh/kubeconform#installation

<br>

## オプション

### 標準入力

標準入力からマニフェストを渡す。

CI上でこれを実行する場合、リポジトリ内のマニフェストを渡しさえすれば良いので、必ずしもkube-apiserverと通信する必要はない。

```bash
$ helm template foo . --set secret.PASSWPRD=test \
  | kubeconform -kubernetes-version <Kubernetesのバージョン> -
```

<br>

### -kubernetes-version

#### ▼ -kubernetes-versionとは

Kubernetesのバージョンを指定する。

```bash
$ kubeconform \
    -kubernetes-version <Kubernetesのバージョン> \
    -strict \
    -summary \
    -output text \
    <ファイル>
```

#### ▼ 現在のバージョンと次のバージョンを指定

現在と次のKubernetesバージョンを指定した処理を自動化すれば、アップグレードに備えられる。

継続的に検出できるように、CI上で自動化すると良い。

```bash
$ kubeconform \
    -kubernetes-version <Kubernetesの現在のバージョン> \
    -strict \
    -summary \
    -output text \
    <ファイル>

$ kubeconform \
    -kubernetes-version <Kubernetesの次のバージョン> \
    -strict \
    -summary \
    -output text \
    <ファイル>
```

<br>
