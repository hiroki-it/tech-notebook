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

マイグレーションや初期データを挿入前に必要である。

```bash
$ yarn prisma generate

✔ Generated Prisma Client (4.16.2 | library) to ./node_modules/@prisma/client in 177ms
You can now start using Prisma Client in your code. Reference: https://pris.ly/d/client

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```

> - https://learningift.com/blogs/h0gbL56h1iq/%E3%80%90%E5%88%9D%E5%BF%83%E8%80%85%E7%94%A8%E3%80%91prisma%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6#part5

<br>

### migrate

#### ▼ dev

ローカル環境用のマイグレーションを実行する。

```bash
$ yarn prisma migrate dev
```

<br>

### db

#### ▼ seed

ローカル環境用の初期データを挿入する。

```bash
$ yarn prisma db seed
```

<br>

### $transaction

#### ▼ $transaction

複数のクエリ処理を実行するトランザクションを定義する。

```javascript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

function transfer(from: string, to: string, amount: number) {

  return prisma.$transaction(async (tx) => {

    const sender = await tx.account.update({
      data: {
        balance: {
          decrement: amount,
        },
      },
      where: {
        email: from,
      },
    })

    if (sender.balance < 0) {
      throw new Error(`${from} doesn't have enough to send ${amount}`)
    }

    const recipient = await tx.account.update({
      data: {
        balance: {
          increment: amount,
        },
      },
      where: {
        email: to,
      },
    })

    return recipient
  })
}

async function main() {

  // $transaction関数の実行をtry-catchブロックで囲む
  try {

    await transfer('alice@prisma.io', 'bob@prisma.io', 100)
    await transfer('alice@prisma.io', 'bob@prisma.io', 100)

  } catch (err) {


  }
}

main()
```

> - https://www.prisma.io/docs/orm/prisma-client/queries/transactions#interactive-transactions

<br>
