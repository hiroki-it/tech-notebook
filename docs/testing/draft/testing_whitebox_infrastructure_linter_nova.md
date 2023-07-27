---
title: 【IT技術の知見】 nova＠ベストプラクティス違反
description: nova＠ベストプラクティス違反の知見を記録しています。
---

# nova＠ベストプラクティス違反

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. novaの仕組み

Helmのチャートリポジトリ上のチャートバージョンと、Cluster上の実際のバージョンを比較して、非推奨なHelmチャートのバージョンを検出できる。

実際のCluster上のマニフェストでないと解析できない。

<br>
