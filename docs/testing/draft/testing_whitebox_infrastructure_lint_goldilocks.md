---
title: 【IT技術の知見】 goldilocks
description: goldilocksの知見を記録しています。
---

# goldilocks

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. goldilocks の仕組み

IaC のソースコード上の CPU/メモリの設定値と、Cluster 上の実際のハードウェアリソース消費量を比較して、最適な設定値 (`.spec.containers[*].resources.limits` キー) を算出できる

実際の Cluster にリクエストしないと解析できない。

<br>

## 02. セットアップ

### GUI

```bash
$ helm repo add <チャートリポジトリ名> https://charts.fairwinds.com/stable

$ kubectl create namespace goldilocks

$ helm install <Helmリリース名> <チャートリポジトリ名>/goldilocks --namespace goldilocks

# ダッシュボードにリクエストを送信する
$ kubectl -n goldilocks port-forward svc/goldilocks-dashboard 8080:80
```

> - [Installation \| goldilocks Documentation](https://goldilocks.docs.fairwinds.com/installation/#installation-2)

<br>

### CLI

- `goldilocks controller`：Cluster 内でコントローラーとして稼働し、ラベルを付与した Namespace のワークロードに VPA を作成する
- `goldilocks create-vpas -n foo-namespace`：指定した Namespace のワークロードに VPA を作成する
- `goldilocks delete-vpas -n foo-namespace`：指定した Namespace から goldilocks が作成した VPA を削除する
- `goldilocks dashboard`：VPA の推奨値を表示するダッシュボードを起動する
- `goldilocks summary`：全ての Namespace の VPA の推奨値を `json` 形式で出力する

<br>
