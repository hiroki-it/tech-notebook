---
title: 【IT技術の知見】 Kics＠脆弱性テスト
description: Kics＠脆弱性テストの知見を記録しています。
---

# Kics＠脆弱性テスト

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

### scan

ファイルから脆弱性を検出する。

> ↪️：https://docs.kics.io/latest/commands/#scan_command_options

#### ▼ --exclude-severities

検出する最低の重要度レベルを設定する。

```bash
$ kics scan --no-progress -p <パス> --exclude-severities info
```

#### ▼ -p

ディレクトリ内のファイルを再帰的に処理する。

```bash
$ kics scan --no-progress -p <パス>
```

マニフェスト管理ツール (Helm、Kustomize) の作成したマニフェストファイルを渡しても良い。

```bash
$ helm template foo . --set secret.PASSWPRD=test > tmp.yaml
  && kics scan -p tmp.yaml --no-progress --exclude-severities info
```

<br>
