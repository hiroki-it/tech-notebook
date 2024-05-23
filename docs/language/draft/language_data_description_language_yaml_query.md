---
title: 【IT技術の知見】YAMLクエリ＠クエリロジック
description: YAMLクエリ＠クエリロジックの知見を記録しています。
---

# YAMLクエリ＠クエリロジック

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. yq

### セットアップ

#### ▼ GitHubリポジトリから

```bash
# GitHubのバイナリファイルのリリースページから、テキストのURLを取得する。
$ wget https://github.com/mikefarah/yq/releases/download/<バージョン>/yq_linux_amd64
$ sudo chmod +x /usr/local/bin/yq
```

<br>

## 01-02. オプション

### 例で使用するYAML

以降で使用するYAMLデータを以下の通りとする。

```yaml
# data.yaml
foo: FOO
bar: BAR
baz:
  - qux: QUX
  - quux: QUUX
```

注意点として、`yq`コマンドはGoテンプレートをサポートしていない。

> - https://github.com/mikefarah/yq/issues/636

<br>

### `{}`

標準入力からファイル名を入力する。

`find`コマンドと組み合わせて、複数のファイルを操作する場合に使用する。

```bash
$ find ./* -name "*.yaml" -exec yq 'del(.spec.foo)' -i {} \;
```

> - https://stackoverflow.com/a/75893234

<br>

### keys

#### ▼ keysとは

キー名を取得する。

配列型のキー名を取得する場合は、`[]`を使用する。

```bash
$ cat data.yaml | yq '.baz[] | keys'

- qux
- quux
```

<br>

### -i

指定したファイルのパスの値を変更する。

```bash
$ yq -i '.metadata.namespace = "foo"' manifest.yaml
```

<br>

### -P

#### ▼ -Pとは

`.json`ファイルを`.yaml`ファイルに変換する。

```bash
$ yq -P foo.json > foo.yaml
```

<br>

## 01-03. reduce

### reduceとは

入力された`.yaml`ファイルを処理し、新しい`.yaml`ファイルとして出力する。

```bash
$ yq eval-all '. as $item ireduce ({}; . * $item )' foo.yaml bar.yaml
```

> - https://mikefarah.gitbook.io/yq/operators/reduce#merge-all-yaml-files-together

<br>
