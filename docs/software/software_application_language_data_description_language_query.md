---
title: 【IT技術の知見】クエリロジック＠データ記述言語
description: クエリロジック＠データ記述言語の知見を記録しています。
---

# クエリロジック＠データ記述言語

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. jq

### セットアップ

#### ▼ brewリポジトリから

```bash
$ brew install jq
```

<br>

### 元データ

以降で使用するJSONデータを以下の通りとする。

```yaml
# data.json
{
  "foo": "FOO",
  "bar": "BAR",
  "baz": [
    {
      "qux": "QUX,
    },
    {
      "quux": "QUUX,
    }
  ]
}
```

```yaml
# list.jsonファイル
# 配列内のオブジェクトごとに、fooキーの値が異なる。
[
  {
    "foo": "FOO",
    "bar": "BAR",
    "baz": "BAZ"
  },
  {
    "foo": "BAR",
    "bar": "BAZ",
    "baz": "FOO"
  },
  {
    "foo": "BAZ",
    "bar": "FOO",
    "baz": "BAR"
  },
]
```

<br>

### オプション

#### ▼ -s

JSONデータのリストから複数のオブジェクトを取得する場合に、取得したオブジェクトを再びリストに入れる。

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

## 01-02. フィルタリング

### パス指定によるフィルタリング

#### ▼ ```.```（ドット）

パスの起点を表す。

参考：https://www.wakuwakubank.com/posts/676-linux-jq/

```bash
$ cat data.json | jq '.'

{
  "foo": "FOO",
  "bar": "BAR",
  "baz": [
    {
      "qux": "QUX,
    },
    {
      "quux": "QUUX,
    }
  ]
}
```

#### ▼ ```[]```

リストへのパスを表す。もしJSONデータが起点からリストだった場合は、『```.[]```』になる。オブジェクトを取得できるだけなので、取得したオブジェクトを再びリストに入れたい場合は、さらに```-s```オプションを有効化した```jq```コマンドに渡す必要がある。

参考：https://gist.github.com/olih/f7437fb6962fb3ee9fe95bda8d2c8fa4#slicing-and-filtering

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

<br>

### 関数によるフィルタリング

#### ▼ select

パスによる取得結果の中から、特定のキーや値を持つオブジェクトを取得する。

参考：

- https://stedolan.github.io/jq/manual/#select(boolean_expression)
- https://qiita.com/kenyabe/items/29b7c615c4b6634a388e

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

<br>

## 02. yq

### セットアップ

#### ▼GitHubリポジトリから

```bash
$ wget https://github.com/mikefarah/yq/releases/download/v4.22.1/yq_linux_amd64
$ sudo chmod +x /usr/local/bin/yq
```

