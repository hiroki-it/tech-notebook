---
title: 【IT技術の知見】PgBouncer＠コネクションプールプロキシ
description: PgBouncer＠コネクションプールプロキシの知見を記録しています。
---

# PgBouncer＠コネクションプールプロキシ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## PgBouncerの仕組み

### アーキテクチャ

PgBouncerは、クライアントからの接続をプールし、DBにプロキシする。

![pgbouncer_architecture.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/pgbouncer_architecture.png)

> - https://www.2ndquadrant.com/en/blog/pgbouncer-1-6/
> - https://scalegrid.io/blog/postgresql-connection-pooling-part-2-pgbouncer/

<br>

## 02. ユースケース

### コネクションプール

記入中...

<br>

### ロードバランサーとしては使用できない

PgBouncerは、クエリのロードバランサーとしては使用できない。

ロードバランシング機能はなく、落ちたDBにもプロキシしてしまう。

そのため、もしロードバランシング機能を使用する場合には、後段にロードバランサーを配置する必要がある。

![pgbouncer_load-balancer.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/pgbouncer_load-balancer.png)

> - https://www.percona.com/blog/scaling-postgresql-using-connection-poolers-and-load-balancers-for-an-enterprise-grade-environment/
> - https://github.com/pgbouncer/pgbouncer/issues/93#issuecomment-158463342

<br>
