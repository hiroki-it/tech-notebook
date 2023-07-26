---
title: 【IT技術の知見】 checkov＠脆弱性テスト
description: checkov＠脆弱性テストの知見を記録しています。
---

# checkov＠脆弱性テスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. checkovの仕組み

### 検出内容

様々なツールで報告されたCVEに基づいて、そのツールの設定ファイルの実装方法に起因する脆弱性を検証する。

PythonやYAMLでカスタムポリシーを実装できる。

<br>

### 対象ツール

検査できるツールは、`--framework`オプションの説明から確認できる。

> - https://www.checkov.io/2.Basics/CLI%20Command%20Reference.html#cli-command-reference

<br>

## 02. セットアップ

### インストール

```bash
$ pip3 install checkov
```

```bash
$ brew install checkov
```

> - https://www.checkov.io/2.Basics/Installing%20Checkov.html

<br>

## 03. オプション

### --compact

問題のあるコード箇所を非表示にして、結果を表示する。

`compact`オプションを有効化しない場合、問題のあるコード箇所を表示する。

```bash
$ checkov -f foo.yaml --compact
```

<br>

### -d

ディレクトリ内のファイルを再帰的に処理する。

```bash
$ checkov -d <ディレクトリ名>
```

> - https://www.checkov.io/2.Basics/CLI%20Command%20Reference.html#cli-command-reference

<br>

### --framework

検査するツール名を設定する。

```bash
$ checkov --framework <ツール名>
```

<br>

### -f

単一のファイルを処理する。

```bash
$ checkov -f <ファイル>
```

マニフェスト管理ツール (Helm、Kustomize) の作成したマニフェストファイルを渡しても良い。

```bash
$ helm template foo . --set secret.PASSWORD=test > foo.yaml
    && checkov -f foo.yaml
```

> - https://www.checkov.io/2.Basics/CLI%20Command%20Reference.html#cli-command-reference

<br>

### quiet

失敗した項目のみを結果として出力する。

`--quiet`オプションを有効化しない場合は、成功と失敗の両方の項目を出力する。

```bash
$ checkov -f foo.yaml --quiet
```

<br>
