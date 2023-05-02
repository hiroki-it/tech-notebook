---
title: 【IT技術の知見】JSONクエリ＠JSON
description: JSONクエリ＠JSONの知見を記録しています。
---

# JSONクエリ＠JSON

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. jq

### セットアップ

#### ▼ brewリポジトリから

```bash
$ brew install jq
```

<br>

## 01-02. オプション

### 例で使うJSON

以降で使用するJSON型データを以下の通りとする。

```yaml
# data.json
{"foo": "FOO", "bar": "BAR", "baz": [{"qux": "QUX"}, {"quux": "QUUX"}]}
```

```yaml
# list.jsonファイル
# 配列内のオブジェクトごとに、fooキーの値が異なる。
[
  {"foo": "FOO", "bar": "BAR", "baz": "BAZ"},
  {"foo": "BAR", "bar": "BAZ", "baz": "FOO"},
  {"foo": "BAZ", "bar": "FOO", "baz": "BAR"},
]
```

<br>

### ファイル読み込み

標準入力に入力することにより、JSONファイルを読み込む。

```bash
$ cat data.json | jq '.foo[]'
```

<br>

### -r

出力結果のダブルクオーテーションを削除する。

```bash
$ cat data.json | jq -r '.foo[]'

FOO
BAR
BAZ
```

> ↪️：https://qiita.com/takeshinoda@github/items/2dec7a72930ec1f658af#%E3%83%80%E3%83%96%E3%83%AB%E3%82%AF%E3%82%A9%E3%83%BC%E3%83%88%E3%81%8C%E9%82%AA%E9%AD%94

<br>

### -s

JSON型データのリストから複数のオブジェクトを取得する場合、取得したオブジェクトを再びリストに入れる。

```bash
$ cat data.json | jq '.baz[]' | jq -s

[
  {
    "qux": "QUX"
  },
  {
    "quux": "QUUX"
  }
]
```

<br>

## 01-03. フィルタリング

### パス指定によるフィルタリング

#### ▼ `.` (ドット)

パスの起点を表す。

```bash
$ cat data.json | jq '.'

{
  "foo": "FOO",
  "bar": "BAR",
  "baz": [
    {
      "qux": "QUX"
    },
    {
      "quux": "QUUX"
    }
  ]
}
```

> ↪️：https://www.wakuwakubank.com/posts/676-linux-jq/

#### ▼ `[]`

リストへのパスを表す。もしJSON型データが起点からリストだった場合は、『`.[]`』になる。

オブジェクトを取得できるだけなため、取得したオブジェクトを再びリストに入れたい場合は、加えて`-s`オプションを有効化した`jq`コマンドに渡す必要がある。

```bash
$ cat data.json | jq '.baz[]'

{
  "qux": "QUX"
}
{
  "quux": "QUUX"
}
```

```bash
$ cat data.json | jq '.baz[0]'

{
  "qux": "QUX"
}
```

```bash
$ cat list.json | jq '.[]'

{
  "foo": "FOO",
  "bar": "BAR",
  "baz": "BAZ"
}
{
  "foo": "BAR",
  "bar": "BAZ",
  "baz": "FOO"
}
{
  "foo": "BAZ",
  "bar": "FOO",
  "baz": "BAR"
}
```

> ↪️：https://gist.github.com/olih/f7437fb6962fb3ee9fe95bda8d2c8fa4#slicing-and-filtering

#### ▼ 変数

パスに変数を出力する場合は、変数を『`''"$VAR"''`』のようにダブルクオーテーションとシングルクオーテーションで囲う。

```bash
$ KEY_NAME=baz

$ cat data.json | jq '.'"$KEY_NAME"'[]'

{
  "qux": "QUX"
}
{
  "quux": "QUUX"
}
```

<br>

### 関数によるフィルタリング

#### ▼ select

パスによる取得結果の中から、特定のキーや値を持つオブジェクトを取得する。

```bash
# fooキーを持ち、値がFOOやBAZであるオブジェクトを取得する。
$ cat list.json | jq '.[] | select (.foo == "FOO" or .foo == "BAZ")' | jq -s '.'

# 合致するオブジェクトのみを取得できる。
[
  {
    "foo": "FOO",
    "bar": "BAR",
    "baz": "BAZ"
  },
  {
    "foo": "BAZ",
    "bar": "FOO",
    "baz": "BAR"
  },
]
```

> ↪️：
>
> - https://stedolan.github.io/jq/manual/#select(boolean_expression)
> - https://qiita.com/kenyabe/items/29b7c615c4b6634a388e

<br>

## 01-04. 結合

### join

`jq`コマンドの実行結果を任意の文字で結合する。

リストを扱う場合には、パスを『`[]`』で囲う必要がある。

```bash
cat list.json | jq '[.[].foo] | join(" ")'

FOO BAR BAZ
```

> ↪️：https://stackoverflow.com/questions/63238759/replace-n-with-space-in-jq-query-command-output-without-tr-and-sed-commands

<br>
