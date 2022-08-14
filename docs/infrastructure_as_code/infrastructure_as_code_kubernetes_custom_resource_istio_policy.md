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

<br>

### カナリアリリース方式

（１）旧コントロールプレーンを残したまま、新コントロールプレーンを作成する。

（２）特定のNamespace内のEnvoyを新コントロールプレーンの配下とし、Envoyをアップグレードする。

（３）アップグレードしたEnvoyの動作が問題なければ、Namespaceを単位として、Envoyをアップグレードしていく。

（４）全てのNamespaceのEnvoyのアップグレードが完了し、動作に問題がなければ、旧コントロールプレーンを削除する。

<br>
