---
title: 【IT技術の知見】アンチパターン＠RDB
description: アンチパターン＠RDBの知見を記録しています。
---

# アンチパターン＠RDB

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. DB接続を再利用しない

### 問題

DB 処理のたびに DB 接続を確立すると、DB 処理に時間がかかる。

<br>

### 実装例（TypeScript）

```typescript
import type {User} from "@prisma/client";
import {prisma} from "~/services/prisma.server";

export async function handler() {
  // 毎回、PrismaClientを作成してしまっている
  const prisma = new PrismaClient();
  return prisma.user.findMany();
}
```

<br>

## 02. 不要なDBレコードやカラムを取得する

### 問題

不要な DB レコードやカラムを取得すると、DB 処理に時間がかかる。

<br>

### 実装例（TypeScript）

```typescript
import type {User} from "@prisma/client";
import {prisma} from "~/services/prisma.server";

const user = await prisma.user.findUnique({
  where: {id},
  // 不要なカラムも取得してしまっている
  include: {team: true, bans: true, logs: true, profiles: true},
});
```

<br>

## 03. N+1問題を起こす

### N+1問題とは

親テーブルを経由して子テーブルにアクセスするとき、親テーブルのレコード数分の SQL を発行してしまうアンチパターンのこと。

<br>

### 実装例（PHP）

#### ▼ 問題がある実装

反復処理のなかで子テーブルのレコードにアクセスしてしまう場合、N+1 問題が起こる。

内部的には、親テーブルへの SQL と、Where 句を持つ SQL が親テーブルのレコード数分だけ発行される。

```php
<?php

// 親テーブルにSQLを発行 (1回)
$departments = Department::all();

foreach($departments as $department) {
    // 親テーブルのレコード数分のWhere句SQLを発行する (N回)
    $department->employees;
}
```

```bash
# 1回
select * from `departments`

# N回
select * from `employees` where `department_id` = 1
select * from `employees` where `department_id` = 2
select * from `employees` where `department_id` = 3
...
```

#### ▼ 解決方法

反復処理の前に、子テーブルへアクセスしておく。

レコード取得時に IN 句や JOIN 句を使用すると、N+1 問題を解消できる。

Laravel では `with()` 関数を使用すると内部的には、親テーブルへの SQL と、IN 句を使用した SQL が発行され、最終的に 2 回で済む。

```php
<?php

// SQL発行 (2回)
// 内部的ににIN句
$departments = Department::with('employees')->get();

foreach($departments as $department) {
    // キャッシュを使用するのでSQLの発行はされない (0回)
    $department->employees;
}
```

```bash
# 2回
select * from `departments`
select * from `employees` where `department_id` in (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ... 100)
```

<br>

### 実装例（TypeScript）

#### ▼ 問題がある実装（１）

反復処理のなかで子テーブルのレコードにアクセスしてしまう場合、N+1 問題が起こる。

内部的には、親テーブルへの SQL と、Where 句を持つ SQL が親テーブルのレコード数分だけ発行される。

```typescript
import type {User} from "@prisma/client";
import {prisma} from "~/services/prisma.server";

// 親テーブルにSQLを発行 (1回)
const users = await prisma.user.findMany({where: {teamId}});

for (const u of users) {
  // 親テーブルのレコード数分のWhere句SQLを発行する (N回)
  const logs = await prisma.log.findMany({
    where: {userId: u.id},
  });
}
```

#### ▼ 問題がある実装（２）

`map()` 関数を使用した反復処理でも、もちろん N+1 問題が起こる。

```typescript
import type {User} from "@prisma/client";
import {prisma} from "~/services/prisma.server";

// 親テーブルにSQLを発行 (1回)
const users = await prisma.user.findMany({where: {teamId}});

// 親テーブルのレコード数分のWhere句SQLを発行する (N回)
const logs = await Promise.all(
  users.map(async (u) => {
    const logs = await prisma.log.findMany({
      where: {userId: u.id},
    });
    return {user: u, logs};
  }),
);
```

#### ▼ 解決方法

レコード取得時に IN 句や JOIN 句を使用すると、N+1 問題を解消できる。

Prisma では、`in` プロパティを IN 句を使用した SQL が発行され、最終的に 2 回で済む。

```typescript
import type {User} from "@prisma/client";
import {prisma} from "~/services/prisma.server";

// 親テーブルにSQLを発行 (1回)
const users = await prisma.user.findMany({where: {teamId}});

// 親テーブルのレコード数分のWhere句SQLを発行する (1回)
const logs = await prisma.log.findMany({
  where: {
    // 内部的にIN句
    userId: {in: users.map((u) => u.id)},
  },
});
```

<br>

## 04. 一覧取得でページング（取得数指定）がない

### 問題

DB からレコードの一覧を取得する場合、ページング（取得数指定）がないと、DB 処理に時間がかかる。

<br>

### 実装例（TypeScript）

#### ▼ 解決方法

```typescript
const page = 1;
const limit = 50;

const users = await prisma.user.findMany({
  where: {teamId},
  skip: (page - 1) * limit,
  take: limit,
  orderBy: {createdAt: "desc"},
});
```

<br>

## 05. 検索するレコード数をむやみに増やす

### 問題

集計結果を一覧で表示するような機能では、テナント内のレコードを横断的に取得する必要がある。

しかし、大量のレコードを Read 処理で取得し、これをその都度集計すると負荷がかかる。処理時間も長くなる。

<br>

### 実装例（TypeScript）

#### ▼ 問題がある実装

```typescript
const events = await prisma.event.findMany({
  where: {
    tenantId,
    occurredAt: {
      gte: startAt,
      lt: endAt,
    },
  },
});

const eventCount = events.length;
```

#### ▼ 解決方法

高負荷の処理をバッチマイクロサービスに分割する。

バックエンドでは、バッチマイクロサービスと共有のテーブルか、事前に集計されたレコードを取得する。

バッチマイクロサービスでは、共有の集計テーブルに集計結果を書き込む。

取得するレコード数を削減できる。

```typescript
await prisma.eventHourlySummary.upsert({
  where: {
    tenantId_hour: {
      tenantId,
      hour: startAt,
    },
  },
  update: {
    count: eventCount,
  },
  create: {
    tenantId,
    hour: startAt,
    count: eventCount,
  },
});
```

```prisma
// EventHourlySummaryテーブル
model EventHourlySummary {
  tenantId String
  hour     DateTime
  count    Int

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@id([tenantId, hour])
  @@map("event_hourly_summaries")
}
```

バックエンドでは、共有の集計テーブルから集計結果を取得する。

```typescript
const eventSummary = await prisma.eventHourlySummary.findUnique({
  where: {
    tenantId_hour: {
      tenantId,
      hour: startAt,
    },
  },
});

const eventCount = eventSummary?.count ?? 0;
```

<br>
