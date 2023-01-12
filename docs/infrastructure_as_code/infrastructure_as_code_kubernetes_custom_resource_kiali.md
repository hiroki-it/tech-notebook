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

Kialiは、フロントエンドアプリケーションとバックエンドアプリケーションから構成されている。

バックエンドアプリケーションは、Prometheusで収集されたメトリクスを再収集して分析し、サービスメッシュトポロジーを作成する。

フロントエンドアプリケーションは、ダッシュボードとして動作する。

現状は、Istioのコンポーネントに依存している。

![kiali_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kiali_architecture.png)


> ℹ️ 参考：https://kiali.io/docs/architecture/architecture/


<br>

### ダッシュボードの基本的な使い方

#### ▼ グラフタイプ

アプリケーションコンテナ間（Pod間）の通信を表示するために、Appグラフを選択する。

> ℹ️ 参考：
> 
> - https://kiali.io/docs/features/topology/#graph-types
> - https://istio.io/latest/docs/tasks/observability/kiali/#viewing-and-editing-istio-configuration-yaml

#### ▼ 凡例ラベル

- デフォルトでは、最新```1```分に発生した通信しか表示しないため、表示期間を延長する。
- デフォルトでは、全てのNamespaceが表示されて見にくいため、アプリケーションコンテナのNamespaceのみをフィルタリングして表示する。
- デフォルトでは、アプリコンテナ以外のコンポーネント（例：IstioのVirtual Service）が表示されて見にくいため、Appシェイプのみをフィルタリングして表示する。

#### ▼ Istioのマニフェストの検証

Kialiでは、Istioのマニフェストを検証できる。

ダッシュボード（Serviceタブ、Istio Configタブ）のConfigurationがエラー表示になっていれば、マニフェストに問題があることがわかる。

> ℹ️ 参考：https://istio.io/latest/docs/tasks/observability/kiali/#validating-istio-configuration

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
