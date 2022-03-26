---
title: 【知見を記録するサイト】チャート＠Helm
description: チャート＠Helmの知見をまとめました．
---

# チャート＠Helm

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Helmの仕組み

### 構造

![helm_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/helm_architecture.png)

Chartをパッケージのように捉え，リポジトリ上で管理する．Helmクライアントを用いてChartリポジトリからChartをインストールする．kube-apiserverをコールし，マニフェストファイルとして認識させ，Kuberneteリソースを構築する．

参考：

- https://developer.ibm.com/blogs/kubernetes-helm-3/
- https://deeeet.com/writing/2018/01/10/kubernetes-yaml/

<br>

### ディレクトリ構造

```bash
chart_directory/
├── charts/
├── temlaptes/
│   ├── tests/
│   └── template.yml # 生成するマニフェストファイルの共通部分を設定する．
│
├── .helmignore
├── Chart.yaml # チャートの概要を設定する．
└── values.yaml # マニフェストファイルに展開する変数のデフォルト値を設定する．
```



