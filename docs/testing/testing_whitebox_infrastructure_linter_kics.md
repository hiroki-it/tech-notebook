---
title: 【IT技術の知見】 Kics＠脆弱性テスト
description: Kics＠脆弱性テストの知見を記録しています。
---

# Kics＠脆弱性テスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Kicsの仕組み

報告されている脆弱性レポートに基づいて、マニフェストの実装方法に起因する脆弱性を検証する。

<br>

## 02. セットアップ

```bash
$ brew install kics
```

> - https://pluto.docs.fairwinds.com/installation/

<br>

## 03. オプション

### scan

#### ▼ scanとは

ファイルから脆弱性を検出する。

> - https://docs.kics.io/latest/commands/#scan_command_options

#### ▼ --exclude-severities

検出する最低の重要度レベルを設定する。

```bash
$ kics scan -p <パス> --exclude-severities info
```

#### ▼ -p

ディレクトリ内のファイルを再帰的に処理する。

```bash
$ kics scan -p <パス>
```

#### ▼ --no-progress

処理実行時のプログレスバーを非表示にする。

```bash
$ kics scan --no-progress -p <パス>
```

<br>
