---
title: 【IT技術の知見】E2Eテスト＠インフラのホワイトボックステスト
description: E2Eテスト＠インフラのホワイトボックステストの知見を記録しています。
---

# E2Eテスト＠インフラのホワイトボックステスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## Kubernetes ClusterのE2Eテスト

### Kubernetes ClusterのE2Eテストとは

CI上にKubernetesの環境を構築して、これにマニフェストやHelmチャートをデプロイする。

起動したコンテナに対してリクエストを送信し、コンテナが期待値を返却することを確認する。

<br>

### `helm`コマンドを使う場合

`helm`コマンドを使用するか、アプリから`helm`コマンドを実行す

### テストパッケージ

テストパッケージ (例：e2e-framework) を使用する。

e2e-frameworkは、E2Eテストのために以下のような機能がある。

- Kubernetes Clusterを構築してくれる
- ソースコードから`helm`コマンドを実行できる
- E2Eテストの完了後にマニフェストを削除してくれるため、実Clusterでもテストできる。

> - https://github.com/kubernetes-sigs/e2e-framework/blob/main/examples/third_party_integration/helm/helm_test.go

<br>
