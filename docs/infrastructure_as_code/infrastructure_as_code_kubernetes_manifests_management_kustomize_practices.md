---
title: 【IT技術の知見】プラクティス集＠Kustomize
description: プラクティス集＠Kustomizeの知見を記録しています。
---

# プラクティス集＠Kustomize

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ディレクトリ構成規約

### `overlays`ディレクトリの場合

#### ▼ 実行環境別

実行環境別に`kustomization.yaml`ファイルを定義し、実行環境別に異なるリソース定義ファイルを作成できるようにする。

```yaml
repository/
├── base
│   ├── resources/
│   │   └── deployment.yaml
│   │
│   └── kustomization.yaml
│
└── overlays
├── stg/
│   └── kustomization.yaml
│
├── tes/
└── prd/
```

> - https://github.com/kubernetes-sigs/kustomize#2-create-variants-using-overlays

<br>
