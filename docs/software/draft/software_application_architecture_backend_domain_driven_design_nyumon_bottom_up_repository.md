---
title: 【IT技術の知見】５章＠ドメイン駆動設計入門ボトムアップ
description: ５章＠ドメイン駆動設計入門ボトムアップの知見を記録しています。
---

# ５章＠ドメイン駆動設計入門ボトムアップ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## サンプルコード

> - https://github.com/nrslib/itddd/tree/master/SampleCodes/Chapter5

<br>

## 01. リポジトリとは

リポジトリとは、ドメインオブジェクト（エンティティや値オブジェクト）を外部（DB、サードパティ API）から取得し、またこれに永続化するロジックをもつオブジェクトである。

<br>

## 02. リポジトリの実装方法（関数型）

### インターフェースリポジトリ

```typescript
type UserRepositoryInterface = {
  findById: (id: UserId) => Promise<User>;
  save: (user: User) => Promise<void>;
};
```

<br>

### 実装リポジトリ

```typescript
import {Pool} from "mysql2/promise";
import {User} from "../domain/user";
import {UserId} from "../domain/userId";
import {UserName} from "../domain/userName";

// 依存性注入
export type UserRepositoryDI = Readonly<{
  pool: Pool;
}>;

export const findById = async (
  userRepositoryDI: UserRepositoryDI,
  id: UserId,
): Promise<User> => {
  const sql = `SELECT id, name FROM users WHERE id = ? LIMIT 1`;
  const [rows] = await userRepositoryDI.pool.query(sql, [
    id as unknown as string,
  ]);
  const row = (rows as any[])[0];

  if (!row) {
    throw new Error("User not found");
  }

  return new User(UserId.from(row.id), new UserName(row.name));
};

export const save = async (
  userRepositoryDI: UserRepositoryDI,
  user: User,
): Promise<void> => {
  const sql = `
    INSERT INTO users (id, name)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name)
  `;
  await userRepositoryDI.pool.query(sql, [
    user.id as unknown as string,
    user.name.toString(),
  ]);
};
```

<br>

### インメモリリポジトリ

```typescript
const createUserRepositoryInMemory = (): UserRepositoryInterface => {
  const store = new Map<UserId, User>();

  return {
    async findById(id: UserId): Promise<User | null> {
      return store.get(id) ?? null;
    },
    async save(user: User): Promise<void> {
      store.set(user.id, user);
    },
  };
};
```

### DTO

#### ▼ DTOとは

ORM のデータモデルをエンティティそのままに使用する場合、ドメイン層がインフラストラクチャ層に依存してしまう。

エンティティと ORM のデータモデルを分離し、ORM のデータモデルをエンティティに詰め替える必要がある

別の方法として、リポジトリで DTO に相当するロジックを実装してもよい。

#### ▼ DTOを使用しない場合

```typescript
import {PrismaClient} from "@prisma/client";
import {User} from "../domain/user";
import {UserId} from "../domain/userId";
import {UserName} from "../domain/userName";

// 依存性注入
export type UserRepositoryDI = Readonly<{
  prisma: PrismaClient;
}>;

export const findById = async (
  userRepositoryDI: UserRepositoryDI,
  id: UserId,
): Promise<User> => {
  const record = await userRepositoryDI.prisma.user.findUnique({
    where: {id: id as unknown as string},
  });

  if (!record) {
    throw new Error("User not found");
  }

  // 取得時はORMのデータモデルをエンティティに変換する
  return new User(UserId.from(record.id), new UserName(record.name));
};

export const save = async (
  userRepositoryDI: UserRepositoryDI,
  user: User,
): Promise<void> => {
  const record = {
    id: user.id as unknown as string,
    name: user.name.toString(),
  };

  // 保存時はエンティティをORMのデータモデルに変換する
  await userRepositoryDI.prisma.user.upsert({
    where: {id: record.id},
    create: {id: record.id, name: record.name},
    update: {name: record.name},
  });
};
```

#### ▼ DTOを使用する場合

```typescript
import {PrismaClient} from "@prisma/client";

import {User} from "../domain/user";
import {UserId} from "../domain/userId";
import {UserName} from "../domain/userName";

// 依存性注入
export type UserRepositoryDI = Readonly<{
  prisma: PrismaClient;
}>;

export const findById = async (
  userRepositoryDI: UserRepositoryDI,
  id: UserId,
): Promise<User> => {
  const record = await userRepositoryDI.prisma.user.findUnique({
    where: {id: id as unknown as string},
  });
  if (!record) {
    throw new Error("User not found");
  }

  // 取得時はORMのデータモデルをエンティティに変換する
  return UserDTO.toDomain({
    id: record.id,
    name: record.name,
  });
};

export const save = async (
  userRepositoryDI: UserRepositoryDI,
  user: User,
): Promise<void> => {
  // 保存時はエンティティをORMのデータモデルに変換する
  const record = UserDTO.toRecord(user);
  await userRepositoryDI.prisma.user.upsert({
    where: {id: record.id},
    create: {id: record.id, name: record.name},
    update: {name: record.name},
  });
};
```

<br>

### 注意点

#### ▼ よろしくない実装（リポジトリにUpdate〇〇をいっぱいかく）

User オブジェクトに実装するべき振る舞いのビジネスロジックを、永続化の役割を持つ Repository へ実装することになってしまう。

```typescript
type UserRepositoryInterface = {
  findbyId: (id: UserId) => Promise<User>;
  updateName: (name: UserName) => Promise<void>;
};
```

```typescript
const user = await userRepository.findById(userId);
await userRepository.updateName(getName(user)); // リポジトリの UpdateName のなかで、ドメインロジックを書くことになってしまう
```

#### ▼ よりよい実装（リポジトリにSaveを書く）

User オブジェクトが振る舞いのビジネスロジックをもち、Repository は永続化ロジックをもつので、責務を区別できている

責務さえ区別できていれば、名前は Save や Store、それこそ Update でもよい

```typescript
type UserRepositoryInterface = {
  findById: (id: UserId) => Promise<User>;
  save: (user: User) => Promise<void>;
};
```

```typescript
const user = await userRepository.findById(userId);
const updatedUser = changeName(user, newName); // ユーザーオブジェクトが自分でユーザー名の状態を変更する
await userRepository.save(updatedUser); // リポジトリは、状態の変更されたユーザーオブジェクトを保存するだけ
```

<br>

## 03. リポジトリで実装するべきロジックの見つけ方

- DB に関するロジック（例：DB 操作、ファイル操作）
- 外部 API に関するロジック（例：HTTP ハンドラー）

<br>
