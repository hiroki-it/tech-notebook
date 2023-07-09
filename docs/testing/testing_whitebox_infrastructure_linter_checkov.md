---
title: 【IT技術の知見】 Checkov＠脆弱性テスト
description: Checkov＠脆弱性テストの知見を記録しています。
---

# Checkov＠脆弱性テスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

```bash
$ pip3 install checkov
```

```bash
$ brew install checkov
```

> - https://www.checkov.io/2.Basics/Installing%20Checkov.html

<br>

## 02. オプション

### --directory

ディレクトリ内のファイルを再帰的に処理する。

```bash
$ checkov --directory <ディレクトリ名>
```

<br>

### -f

単一のファイルを再帰的に処理する。

```bash
$ checkov -f <ファイル> --quiet
```

マニフェスト管理ツール (Helm、Kustomize) の作成したマニフェストファイルを渡しても良い。

```bash
$ helm template foo . --set secret.PASSWORD=test > manifest.yaml
  && checkov -f manifest.yaml --quiet
```

<br>
