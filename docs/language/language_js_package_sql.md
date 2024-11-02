---
title: 【IT技術の知見】SQLパッケージ＠JavaScript
description: SQLパッケージ＠JavaScriptの知見を記録しています。
---

# SQLパッケージ＠JavaScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Prisma

### コマンド

### generate

Prismaスキーマからクライアントを作成する。

クライアントを使用して、データベースに接続できる。

マイグレーションやシードデータを挿入前に必要である。

```bash
$ yarn prisma generate
```

> - https://learningift.com/blogs/h0gbL56h1iq/%E3%80%90%E5%88%9D%E5%BF%83%E8%80%85%E7%94%A8%E3%80%91prisma%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6#part5

<br>
