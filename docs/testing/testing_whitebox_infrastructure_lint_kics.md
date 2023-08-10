---
title: 【IT技術の知見】 kics＠脆弱性テスト
description: kics＠脆弱性テストの知見を記録しています。
---

# kics＠脆弱性テスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. kicsの仕組み

### 検出項目

特にKubernetesで報告されたCVEに基づいて、マニフェストの実装方法に起因する脆弱性を検証する。

Regoでカスタムポリシーを実装できる。

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

検出から除外する重要度レベル (info、low、medium、high) を設定する。

```bash
# highレベルのみを検出する
$ kics scan -p <パス> --exclude-severities info,low,medium
```

> - https://github.com/Checkmarx/kics/blob/master/docs/commands.md

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
