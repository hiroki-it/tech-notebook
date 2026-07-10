---
title: 【IT技術の知見】Kubernetes＠システムテスト
description: Kubernetes＠システムテストの知見を記録しています。
---

# Kubernetes＠システムテスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## Kubernetes Clusterの回帰テスト

### Kubernetes Clusterの回帰テストとは

CI 上に Kubernetes の環境を構築して、これにマニフェストや Helm チャートをデプロイする。

起動したコンテナに対してリクエストを送信し、変更後のコンテナが期待値を返すことを確認する。

<br>

### `helm` コマンドを使用する場合

`helm` コマンドを使用するか、アプリから `helm` コマンドを実行す

### テストパッケージ

テストパッケージ (例：e2e-framework) を使用する。

e2e-framework は、回帰テストのために以下のような機能がある。

- Kubernetes Cluster を構築してくれる
- ソースコードから `helm` コマンドを実行できる
- 回帰テストの完了後にマニフェストを削除してくれるため、実 Cluster でもテストできる。

> - https://github.com/kubernetes-sigs/e2e-framework/blob/main/examples/third_party_integration/helm/helm_test.go

<br>
