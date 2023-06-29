---
title: 【IT技術の知見】 trivy＠脆弱性テスト
description: trivy＠脆弱性テストの知見を記録しています。
---

# trivy＠脆弱性テスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

```bash
$ brew install kics
```

> ↪️：https://pluto.docs.fairwinds.com/installation/

<br>

## 02. オプション

### -p

検出対象のマニフェストファイルを指定する。

```bash
$ kics scan --no-progress -p tmp.yaml
```

<br>
