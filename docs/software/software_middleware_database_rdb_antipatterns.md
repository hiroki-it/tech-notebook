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

DB処理のたびにDB接続を確立すると、DB処理に時間がかかる。

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

不要なDBレコードやカラムを取得すると、DB処理に時間がかかる。

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

親テーブルを経由して子テーブルにアクセスする時に、親テーブルのレコード数分のSQLを発行してしまうアンチパターンのこと。

<br>

### 実装例（PHP）

#### ▼ 問題がある実装

反復処理の中で子テーブルのレコードにアクセスしてしまう場合、N+1問題が起こる。

内部的には、親テーブルへのSQLと、Where句を持つSQLが親テーブルのレコード数分だけ発行される。

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

反復処理の前に小テーブルにアクセスしておく。

データアクセス時に`with`メソッドを使用すると、親テーブルへのアクセスに加えて、親テーブルのEloquentモデルのプロパティに子テーブルのレコードを保持するように処理する。

そのため、反復処理ではプロパティからデータを取り出すだけになる。

内部的には、親テーブルへのSQLと、In句を使用したSQLが発行される。

```php
<?php

// SQL発行 (2回)
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

反復処理の中で子テーブルのレコードにアクセスしてしまう場合、N+1問題が起こる。

内部的には、親テーブルへのSQLと、Where句を持つSQLが親テーブルのレコード数分だけ発行される。

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

<br>

## 04. 一覧取得でページング（取得数指定）がない

### 問題

DBからレコードの一覧を取得する場合、ページング（取得数指定）がないと、DB処理に時間がかかる。

<br>

### 実装例（TypeScript）

```typescript
const users = await prisma.user.findMany({
  where: {teamId},
});
```

<br>
