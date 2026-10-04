---
title: 【IT技術の知見】設定ファイル＠Redis
description: 設定ファイル＠Redisの知見を記録しています。
---

# 設定ファイル＠Redis

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. GENERAL

> - https://github.com/redis/redis/blob/unstable/redis.conf

<br>

## 02. SNAPSHOTTING

### dir

```redis
dir /data
```

> - https://github.com/redis/redis/blob/unstable/redis.conf

<br>

### save

```redis
save ""
```

> - https://github.com/redis/redis/blob/unstable/redis.conf

<br>

## 03. REPLICATION

> - https://github.com/redis/redis/blob/unstable/redis.conf

<br>
