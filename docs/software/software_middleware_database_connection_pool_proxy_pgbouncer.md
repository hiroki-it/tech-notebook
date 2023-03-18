---
title: 【IT技術の知見】PgBouncer＠コネクションプールプロキシ
description: PgBouncer＠コネクションプールプロキシの知見を記録しています。
---

# PgBouncer＠コネクションプールプロキシ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## PgBouncerとは

PgBouncerは、クライアントからの接続をプールし、DBにプロキシする。

ただしロードバランシング機能はなく、落ちたDBにもプロキシしてしまう。

> ↪️ 参考：https://github.com/pgbouncer/pgbouncer/issues/93#issuecomment-158463342

<br>
