---
title: 【IT技術の知見】コマンド＠Redis
description: コマンド＠Redisの知見を記録しています。
---

# コマンド＠Redis

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. redis-cli

```bash
# Redis接続コマンド
$ redis-cli -c -h <Redisのホスト名> -p 6379
```

<br>

## 02. keys

全てのキーを表示する。

```bash
redis *****:6379> keys *
```

<br>

## 03. type

キーを指定して、対応する値を表示する。

```bash
redis *****:6379> type <キー名>
```

<br>

## 04. monitor

Redisが受け取ったコマンドをフォアグラウンドで表示する。

```bash
redis *****:6379> monitor
```

<br>
