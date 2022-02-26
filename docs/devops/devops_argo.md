---
title: 【知見を記録するサイト】Argo＠DevOps
description: Argo＠DevOpsの知見をまとめました．
---

# Argo＠DevOps

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 仕組み

### 基本構造

指定したブランチのコードの状態を監視する．プッシュによってコードが変更された場合に，Kubernetesの状態をこれに同期する．

![argo](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argo.png)

参考：

- https://blog.vpantry.net/2021/01/cicd-2/
- https://qiita.com/kanazawa1226/items/bb760bddf8bd594379cb
- https://blog.argoproj.io/introducing-argo-cd-declarative-continuous-delivery-for-kubernetes-da2a73a780cd

<br>

### AWSで使う場合

参考：https://www.ogis-ri.co.jp/otc/hiroba/technical/kubernetes_use/part1.html

![argo_eks](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argo_eks.png)
