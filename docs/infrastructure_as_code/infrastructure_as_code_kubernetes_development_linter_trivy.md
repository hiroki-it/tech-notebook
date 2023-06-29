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
$ brew install trivy
```

> ↪️：https://pluto.docs.fairwinds.com/installation/

<br>

## 02. サブコマンド

### --exit-code

終了コードを出力する。

```bash
$ trivy conf --exit-code 1 --debug tmp.yaml
```

<br>
