---
title: 【IT技術の知見】Kiali＠カスタムリソース
description: Kiali＠カスタムリソースの知見を記録しています。
---

# Kiali＠カスタムリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Kialiの仕組み

### アーキテクチャ

Kialiは、フロントエンドアプリケーションとバックエンドアプリケーションから構成されている。バックエンドアプリケーションは、Prometheusで収集されたメトリクスを再収集し、Istioによるサーベスメッシュを可視化する。フロントエンドアプリケーションは、ダッシュボードとして動作する。現状は、Istioのコンポーネントに依存している。

> ℹ️ 参考：https://kiali.io/docs/architecture/architecture/

![kiali_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kiali_architecture.png)

<br>
