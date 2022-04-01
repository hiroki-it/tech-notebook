---
title: 【知見を記録するサイト】設計ポリシー＠Helm
description: 設計ポリシー＠Helmの知見をまとめました．
---

# 設計ポリシー＠Helm

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. ディレクトリ構成 

### chartディレクトリ

参考：

- https://helm.sh/docs/topics/charts/#the-chart-file-structure
- https://mixi-developers.mixi.co.jp/argocd-with-helm-7ec01a325acb

```bash
repository/
├── chart_directory/
│   ├── charts/ # 依存する他のチャートを配置する．
│   ├── temlaptes/ # ユーザー定義のチャートを配置する．ディレクトリ構造は自由である．
│   │   ├── tests/
│   │   ├── _helpers.tpl
│   │   └── template.yaml # チャートの共通ロジックを設定する．
│   │
│   ├── .helmignore # チャートアーカイブの作成時に無視するファイルを設定する．
│   ├── Chart.yaml # チャートの概要を設定する．
│   └── values.yaml # チャートの展開する変数のデフォルト値を設定する．
...
```

<br>

### templateディレクトリの構成

#### ・稼働環境別

```
repository/
├── chart_directory/
│   ├── temlaptes/
│   ...
│
│
│
```

<br>

## 02. 命名規則

### templateディレクトリ

#### ・命名規則

ファイル名はスネークケースとし，Kubernetesリソースを識別できる名前とする．

参考：https://helm.sh/docs/chart_best_practices/templates/

#### ・拡張子

拡張子は```.yaml```とする．

参考：https://helm.sh/docs/chart_best_practices/templates/