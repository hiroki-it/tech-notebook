---
title: 【IT技術の知見】コマンド
description: コマンドの知見を記録しています。
tags:
  - "ミドルウェア"
  - "NoSQL DB系"
  - "Redis"
---

# コマンド

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. redis-cli

```bash
# Redis接続コマンド
$ redis-cli -c -h <Redisのホスト名> -p 6379
```

<br>

## 02. get

特定のキーの値を取得する。

```bash
redis *****:6379> get foo-key

"{}"
```

<br>

## 03. keys

すべてのインデックス番号とキー名を取得する。

```bash
redis *****:6379> keys *

 1) "foo-key"
 2) "bar-key"
 3) "baz-key"
...
```

<br>

## 04. select

データベースをインデックス番号で選択する。

デフォルトでは `0` 番のデータベースが選択されている。

```bash
*****:6379> select 15
OK

*****:6379[15]> key *
```

<br>

## 05. monitor

Redis が受け取ったコマンドをフォアグラウンドで表示する。

```bash
redis *****:6379> monitor
```

<br>

## 06. type

キーを指定して、対応する値を表示する。

```bash
redis *****:6379> type <キー名>
```

<br>
