---
title: 【IT技術の知見】Kiali＠カスタムリソース
description: Kiali＠カスタムリソースの知見を記録しています。
---

# Kiali＠カスタムリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Kialiの仕組み

### アーキテクチャ

Kialiは、フロントエンドアプリケーションとバックエンドアプリケーションから構成されている。バックエンドアプリケーションは、Prometheusで収集されたメトリクスを再収集して分析し、サービスメッシュトポロジーを作成する。フロントエンドアプリケーションは、ダッシュボードとして動作する。現状は、Istioのコンポーネントに依存している。

> ℹ️ 参考：https://kiali.io/docs/architecture/architecture/

![kiali_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kiali_architecture.png)

<br>

## 02. トレースと他のデータ間の紐付け

### 他のテレメトリーとの紐付け

#### ▼ メトリクスとの紐付け

> ℹ️ 参考：https://kiali.io/docs/features/tracing/#metric-correlation

#### ▼ ログとの紐付け

> ℹ️ 参考：https://kiali.io/docs/features/tracing/#logs-correlation

<br>

### サービスメッシュトポロジーとの紐付け

> ℹ️ 参考：https://kiali.io/docs/features/tracing/#graph-correlation

<br>
