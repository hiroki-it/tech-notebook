---
title: 【IT技術の知見】Prisma＠SQLパッケージ
description: Prisma＠SQLパッケージの知見を記録しています。
---

# Prisma＠SQLパッケージ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Prismaの仕組み

PrismaClient (JavaScriptパッケージ) は、クエリエンジン (バイナリ) に接続リクエストを送信する。

クエリエンジンはコネクションプールを作成し、プール内のコネクションを使用してDBに接続する。

コネクションが維持されている間、これを再利用して複数のクエリを実行する。

PrismaClientは、クエリエンジンに切断リクエストを送信する。

クエリエンジンは、データベースとのコネクションを破棄する。

![architecture_prisma](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/architecture_prisma.png)

> - https://www.prisma.io/docs/orm/more/under-the-hood/engines
> - https://zenn.dev/cloudbase/articles/65b9f6e4f9ae05#%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3

<br>

## 02. コマンド

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

## 03. スキーマ

### datasource

データベース情報を設定する。

```javascript
datasource db {
  provider = "mysql"
  url      = "mysql://<DBユーザー>:<DBパスワード>@<DBホスト>:<ポート番号>/<DB名>?schema=public&connection_limit=30&pool_timeout=60"
}
```

URLのパラメーターとして、以下などを設定できる。

- コネションプールのコネクション上限数 (`connection_limit`)
- コネクションプール内のコネクションが空くまでの待機時間 (`pool_timeout`)

> - https://zenn.dev/cloudbase/articles/65b9f6e4f9ae05#prismaclient%E3%81%AB%E6%B8%A1%E3%81%99datasource-url%E3%81%AE%E3%83%91%E3%83%A9%E3%83%A1%E3%83%BC%E3%82%BF
> - https://dev.classmethod.jp/articles/prisma-engines-connection-pooling-parameters/#pool_timeout

<br>

### generator

```javascript
generator client {
  provider   = "prisma-client-js"
  engineType = "library"
}
```

<br>

## 04. PrismaClient

### $transaction

#### ▼ $transaction

複数のクエリ処理を実行するトランザクションを定義する。

```javascript
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

function transfer(from: string, to: string, amount: number) {

  // トランザクション
  return prisma.$transaction(async (tx) => {

    // CRUD処理
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

    // CRUD処理
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

#### ▼ オプション

```javascript
import {PrismaClient} from '@prisma/client'

// Prismaクライアントに設定する場合
const prisma = new PrismaClient({
  transactionOptions: {
    // データを取得するまでのタイムアウト値
    maxWait: 5000,
    // ロールバックを含めて全体が完了するまでのタイムアウト値
    timeout: 10000,
    // トランザクションの分離レベル
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  }
})

function transfer(...) {

  return prisma.$transaction(async (tx) => {
    // CRUD処理
  })
}

async function main() {

  try {
    await transfer(...)
  } catch (err) {

  }
}

main()
```

```javascript
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

function transfer(...) {

  // トランザクションに個別に設定する場合
  return prisma.$transaction(async (tx) => {
    // CRUD処理
  },
  {
    // データを取得するまでのタイムアウト値
    maxWait: 5000,
    // ロールバックを含めて全体が完了するまでのタイムアウト値
    timeout: 10000,
    // トランザクションの分離レベル
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  })
}

async function main() {

  try {
    await transfer(...)
  } catch (err) {

  }
}

main()
```

> - https://www.prisma.io/docs/orm/prisma-client/queries/transactions#transaction-options

<br>
