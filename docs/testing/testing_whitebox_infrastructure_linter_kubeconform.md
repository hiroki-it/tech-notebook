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

### -kubernetes-version

Kubernetesのバージョンを指定する。

```bash
$ kubeconform \
    -kubernetes-version <Kubernetesのバージョン> \
    -strict \
    -summary \
    -output text \
    <ファイル>
```

現在と次のKubernetesバージョンを指定した処理をCI上で実行すれば、アップグレードに備えられる。

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
