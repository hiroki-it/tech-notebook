---
title: 【IT技術の知見】 goldilocks＠ベストプラクティス違反
description: goldilocks＠ベストプラクティス違反の知見を記録しています。
---

# goldilocks＠ベストプラクティス違反

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. goldilocksの仕組み

IaCのソースコード上のCPU/メモリの設定値と、Cluster上の実際のハードウェアリソース消費量を比較して、最適値を算出できる

実際のClusterにアクセスしないと解析できない。

<br>
