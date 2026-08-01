---
title: 【IT技術の知見】アンチパターン＠RDB
description: アンチパターン＠RDBの知見を記録しています。
---

# アンチパターン＠RDB

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. DB 接続を再利用しない

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

## 02. データの意味や用途に適さないDBカラム型で保存する

### 問題

データの見た目だけでDBカラム型を決めると、値の比較や計算のたびに型変換が必要になる。

また、DBカラム型に基づいて値を検証できず、不正な値を保存したり、インデックスを効果的に使用できなかったりする可能性がある。

データの見た目ではなく、ドメイン上の意味、制約、比較方法、計算方法に適したDBカラム型で保存する。

<br>

### 実装例（TypeScript）

#### ▼ 問題がある実装

```typescript
const user = {
  id: 1,
  birthDate: "2000-01-01",
};
```

#### ▼ 解決方法

日付として比較や計算を行う値には、`VARCHAR` 型のカラムではなく `DATE` 型のカラムを使用する。

同様に、金額には `DECIMAL` 型のカラム、件数には `INT` 型のカラム、真偽値には `BOOLEAN` 型のカラムを使用する。

ただし、電話番号、郵便番号、商品コードなど、数字で構成されていても計算を目的としない値には `VARCHAR` 型のカラムを使用する。

```typescript
import {Prisma} from "@prisma/client";

const user = {
  id: 1,
  // 日付（DBではDATE型のカラムにする）
  birthDate: new Date("2000-01-01"),
  // 金額（DBではDECIMAL型のカラムにする）
  accountBalance: new Prisma.Decimal("1000.50"),
  // 件数（DBではINT型のカラムにする）
  loginCount: 10,
  // 真偽値（DBではBOOLEAN型のカラムにする）
  isActive: true,
  // 電話番号（DBではVARCHAR型のカラムにする）
  phoneNumber: "03-1234-5678",
  // 郵便番号（DBではVARCHAR型のカラムにする）
  postalCode: "012-3456",
  // 商品コード（DBではVARCHAR型のカラムにする）
  productCode: "001234",
};
```



<br>

## 03. 不要な DB レコードやカラムを取得する

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

## 04. N+1 問題を起こす

### N+1 問題とは

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

Laravel では `with()` 関数を使用すると、内部的に親テーブルへの SQL と IN 句を使用した SQL が発行され、最終的に 2 回で済む。

```php
<?php

// SQL発行 (2回)
// 内部的にIN句
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

Prisma では、`in` プロパティを使用すると、IN 句を含む SQL が発行され、最終的に 2 回で済む。

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

## 05. 一覧取得でページング（取得数指定）がない

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

## 06. 検索するレコード数をむやみに増やす

### 問題

集計結果を一覧で表示するような機能では、テナント内のレコードを横断的に取得する必要がある。

ただし、大量のレコードを Read 処理で取得し、その都度集計すると負荷がかかる。処理時間も長くなる。

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

バックエンドでは、バッチマイクロサービスとの共有テーブルから、事前に集計されたレコードを取得する。

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

## 07. 空入力でも SQL を実行する

### 問題

検索対象を表す配列が空の場合、検索結果は空になることが事前にわかる。

それにもかかわらず SQL を実行すると、不要な DB 処理が発生して性能が低下したり、不具合が起こったりする可能性がある。

<br>

### 実装例（TypeScript）

#### ▼ 問題がある実装

```typescript
async function findByUserNames(userNames: string[]) {
  return prisma.user.findMany({
    where: {
      name: {in: userNames},
    },
  });
}
```

#### ▼ 解決方法

空入力に対するガード節を設け、SQL を実行せずに空配列を返す。

この早期リターンにより、不要な DB 処理を避け、性能低下や不具合を防げる。

```typescript
async function findByUserNames(userNames: string[]) {
  if (userNames.length === 0) {
    return [];
  }

  return prisma.user.findMany({
    where: {
      name: {in: userNames},
    },
  });
}
```

<br>

## 08. GROUP BY 句を使用せずにアプリケーション側で集計する

### 問題

集計対象のレコードをすべて取得してアプリケーション側でグループ化すると、DB から転送するデータ量とアプリケーションのメモリ使用量が増える。

単純な件数や合計値の集計には GROUP BY 句を使用し、必要な集計結果だけを取得する。

<br>

### 実装例（TypeScript）

#### ▼ 問題がある実装

```typescript
const users = await prisma.user.findMany({
  select: {
    teamId: true,
  },
});

const userCountByTeam = users.reduce<Record<string, number>>(
  (counts, user) => {
    counts[user.teamId] = (counts[user.teamId] ?? 0) + 1;
    return counts;
  },
  {},
);
```

#### ▼ 解決方法

Prisma の `groupBy()` 関数を使用し、チームごとのユーザー数を集計する処理をアプリケーションのインフラストラクチャ層から DB に委譲する。

```typescript
const userCountByTeam = await prisma.user.groupBy({
  by: ["teamId"],
  _count: {
    _all: true,
  },
});
```

内部的には、GROUP BY 句を使用した SQL が発行される。

```sql
SELECT team_id, COUNT(*)
FROM users
GROUP BY team_id;
```

<br>

## 09. SUM 関数を使用せずにアプリケーション側で合計する

### 問題

合計対象のレコードをすべて取得してアプリケーション側で合計すると、DB から転送するデータ量とアプリケーションのメモリ使用量が増える。

単純な数値の合計には SUM 関数を使用し、必要な合計値だけを取得する。

<br>

### 実装例（TypeScript）

#### ▼ 問題がある実装

```typescript
const orders = await prisma.order.findMany({
  select: {
    amount: true,
  },
});

const totalAmount = orders.reduce(
  (total, order) => total + order.amount,
  0,
);
```

#### ▼ 解決方法

Prisma の `aggregate()` 関数を使用し、注文金額を合計する処理をアプリケーションのインフラストラクチャ層から DB に委譲する。

```typescript
const result = await prisma.order.aggregate({
  _sum: {
    amount: true,
  },
});

const totalAmount = result._sum.amount ?? 0;
```

内部的には、SUM 関数を使用した SQL が発行される。

```sql
SELECT SUM(amount)
FROM orders;
```
