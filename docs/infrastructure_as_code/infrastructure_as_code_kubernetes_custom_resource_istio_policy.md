---
title: 【IT技術の知見】設計ポリシー＠Istio
description: 設計ポリシー＠Istioの知見を記録しています。
---

# 設計ポリシー＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. アップグレード

### インプレース方式

ℹ️ 参考：https://istio.io/latest/docs/setup/upgrade/in-place/

<br>

### カナリアリリース方式

ℹ️ 参考：

- https://istio.io/v1.10/docs/setup/upgrade/canary/
- https://medium.com/snowflake/blue-green-upgrades-of-istio-control-plane-7642bb2c39c2

（１）旧コントロールプレーンを残したまま、新コントロールプレーンを作成する。

（２）特定のNamespaceの```metadata.labels.istio.io/rev```キーのリビジョン値を新しいバージョンに変更する。これにより、コントロールプレーンはNamespace内の```istio-proxy```コンテナをアップグレードする。

![istio_canary-upgrade_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_canary-upgrade_1.png)

（３）新バージョンの```istio-proxy```コンテナの動作が問題なければ、Namespaceの```metadata.labels.istio.io/rev```キーのリビジョン値を順番に変更していく。

![istio_canary-upgrade_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/istio_canary-upgrade_2.png)

（４）もし途中で問題が起これば、```metadata.labels.istio.io/rev```キーのリビジョン値順番に元に戻していく。

（５）全てのNamespaceの```istio-proxy```コンテナのアップグレードが完了し、動作に問題がなければ、旧コントロールプレーンを削除する。

<br>
