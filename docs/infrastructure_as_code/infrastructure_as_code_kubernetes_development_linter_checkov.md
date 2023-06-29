---
title: 【IT技術の知見】 checkov＠脆弱性テスト
description: checkov＠脆弱性テストの知見を記録しています。
---

# checkov＠脆弱性テスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

```bash
$ brew install checkov
```

> ↪️：https://pluto.docs.fairwinds.com/installation/

<br>

## 02. グローバルオプション

### -f

検出対象のマニフェストファイルを指定する。

```bash
$ checkov -f tmp.yaml --quiet
```

<br>
