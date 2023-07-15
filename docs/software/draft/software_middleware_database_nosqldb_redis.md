---
title: 【IT技術の知見】Redis＠NoSQL
description: Redis＠NoSQLの知見を記録しています。
---

# Redis＠NoSQL

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. DBエンジンの種類

### インメモリ方式

メモリ上にデータを保管する。

揮発的なため、Redisを再起動するとデータが削除されてしまう。

> - https://qiita.com/KurosawaTsuyoshi/items/f7d74f2c60df188dbd6d

<br>

### オンディスク方式

ディスク上にデータを永続化する。

> - https://qiita.com/KurosawaTsuyoshi/items/f7d74f2c60df188dbd6d

<br>
