---
title: 【IT技術の知見】リソース定義＠VictoriaMetrics
description: リソース定義＠VictoriaMetricsの知見を記録しています。
---

# リソース定義＠VictoriaMetrics

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. セットアップ

### インストール

#### ▼ チャートとして

チャートリポジトリからチャートをインストールし、Kubernetes リソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://victoriametrics.github.io/helm-charts/

$ helm repo update

$ kubectl create namespace victoria-metrics

$ helm install <Helmリリース名> <チャートリポジトリ名>/victoria-metrics-cluster -n victoria-metrics --version <バージョンタグ>
```

> - [GitHub - VictoriaMetrics/helm-charts: Helm charts for VictoriaMetrics, VictoriaLogs and ecosystem · GitHub](https://github.com/VictoriaMetrics/helm-charts)

<br>
