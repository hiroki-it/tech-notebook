---
title: 【IT技術の知見】設計ポリシー＠Kustomize
description: 設計ポリシー＠Kustomizeの知見を記録しています。
---

# 設計ポリシー＠Kustomize

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/index.html

<br>

## 01. ディレクトリ構成ポリシー

### ```overlays```ディレクトリの場合

#### ▼ 実行環境別

実行環境別に```kustomization.yaml```ファイルを定義し、実行環境別に異なるリソース定義ファイルを作成できるようにする。

> ℹ️ 参考：https://github.com/kubernetes-sigs/kustomize#2-create-variants-using-overlays

```yaml
repository/
├── base
│   ├── resources/
│   │   └── deployment.yaml
│   │
│   └── kustomization.yaml
│
└── overlays
    ├── dev/
    │   └── kustomization.yaml
    │
    ├── prod/
    └── stg/
```

<br>
