---
title: 【IT技術の知見】分散DB＠DB系ミドルウェア
description: 分散DB＠DB系ミドルウェアの知見を記録しています。
---

# 分散DB＠DB系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 分散DBとは

永続データを複数に分割して管理し、これらを組み合わせて単一のDBのように扱う。

> - https://www.mongodb.com/resources/basics/databases/distributed-database

<br>

## 分散DBの種類

### OSS

#### ▼ RDB

- CockroachDB
- Vitess (MySQL互換)
- TiDB (MySQL互換)
- TigerBeetle (金融ドメイン特化)

#### ▼ NoSQL DB

- TiKV

<br>

### マネージド

#### ▼ RDB

注意点として、AWS Aurora MySQLは分散DBではない。

- YugabyteDB Managed

> - https://www.quora.com/Is-Amazon-RDS-a-non-distributed-database-service

#### ▼ NoSQL DB

記入中...

<br>
