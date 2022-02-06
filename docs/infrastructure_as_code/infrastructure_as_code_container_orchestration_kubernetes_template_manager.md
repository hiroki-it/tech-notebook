---
title: 【知見を記録するサイト】テンプレート管理＠Kubernetes
description: テンプレート管理＠Kubernetesの知見をまとめました。
---

# テンプレート管理＠Kubernetes

## 01. テンプレート管理とは

### 種類

Helm，Kustomize，などがある．Kubernetesのテンプレートファイルを部分的に共通化できる．

参考：https://qiita.com/Hiroyuki_OSAKI/items/8965ceb6c90bae3bea76

HelmよりもKustomizeの方がカスタマイズ性が高い．

参考：https://qiita.com/Nishi53454367/items/4a4716dfbeebd70295d1#%E3%81%93%E3%81%93%E3%81%A7%E4%BD%BF%E7%94%A8%E3%81%99%E3%82%8B%E6%8A%80%E8%A1%93%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6-1

<br>

## 02. Helm

### 仕組み

Kubernetes上で稼働するコンテナをパッケージのように捉え，Kubernetes上に配布する．

参考：https://deeeet.com/writing/2018/01/10/kubernetes-yaml/

