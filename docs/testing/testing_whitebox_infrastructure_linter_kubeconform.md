---
title: 【IT技術の知見】 Kubeconform＠脆弱性テスト
description: Kubeconform＠脆弱性テストの知見を記録しています。
---

# Kubeconform＠脆弱性テスト

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

<br>
