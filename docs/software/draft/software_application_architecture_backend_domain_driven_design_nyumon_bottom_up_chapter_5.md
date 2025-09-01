---
title: 【IT技術の知見】５章＠ドメイン駆動設計入門ボトムアップ
description: ５章＠ドメイン駆動設計入門ボトムアップの知見を記録しています。
---

# ５章＠ドメイン駆動設計入門ボトムアップ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## リポジトリとは

リポジトリとは、ドメインオブジェクト（エンティティや値オブジェクト）を外部（DB、サードパティAPI）から取得し、またこれに永続化するロジックをもつオブジェクトである。

<br>

## リポジトリの実装方法（関数型）

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

// 依存性注入
export type UserRepositoryDI = Readonly<{
  pool: Pool;
}>;

export const findById = async (
  userRepositoryDI: UserRepositoryDI,
  id: UserId,
): Promise<User> => {
  const sql = `SELECT id, name, email FROM users WHERE id = $1 LIMIT 1`;
  const {rows} = await userRepositoryDI.pool.query(sql, [id]);
  if (rows.length === 0) {
    throw new Error("User not found");
  }
  return {
    id: rows[0].id,
    name: rows[0].name,
    email: rows[0].email,
  };
};

export const save = async (
  userRepositoryDI: UserRepositoryDI,
  user: User,
): Promise<void> => {
  const sql = `
    INSERT INTO users (id, name, email)
    VALUES ($1, $2, $3)
    ON CONFLICT (id)
    DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email
  `;
  await userRepositoryDI.pool.query(sql, [user.id, user.name, user.email]);
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

<br>

### 注意点

#### ▼ よろしくない実装（リポジトリにUpdate〇〇をいっぱいかく）

Userオブジェクトに実装するべき振る舞いのビジネスロジックを、永続化の役割をもつRepositoryに実装することになってしまう

```typescript
type UserRepositoryInterface = {
  findbyId: (id: UserId) => Promise<User>;
  updateName: (name: UserName) => Promise<void>;
  updateEmail: (email: Email) => Promise<void>;
};
```

```typescript
const user = await userRepository.findById(userId);
await userRepository.updateName(getName(user)); // リポジトリの UpdateName のなかで、ドメインロジックを書くことになってしまう
```

#### ▼ より良い実装（リポジトリにSaveを書く）

Userオブジェクトが振る舞いのビジネスロジックをもち、Repositoryは永続化ロジックをもつので、責務を区別できている

責務さえ区別できていれば、名前はSaveやStore、それこそUpdateでもよい

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

## リポジトリで実装するべきロジックの見つけ方

- DBに関するロジック（例：DB操作、ファイル操作）
- 外部APIに関するロジック（例：HTTPハンドラー）

<br>
