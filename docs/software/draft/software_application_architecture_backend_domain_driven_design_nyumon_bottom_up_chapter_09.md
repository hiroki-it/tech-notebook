---
title: 【IT技術の知見】９章＠ドメイン駆動設計入門ボトムアップ
description: ９章＠ドメイン駆動設計入門ボトムアップの知見を記録しています。
---

# ９章＠ドメイン駆動設計入門ボトムアップ

## サンプルコード

> - https://github.com/nrslib/itddd/tree/master/SampleCodes/Chapter9

<br>

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 9.1 ファクトリーとは

- ドメインオブジェクトに渡す複雑な引数の作成処理をコンストラクタから切り分ける

<br>

## 9.2 ファクトリーの実装方法（関数型）

### エンティティ層

#### ▼ UserName

```typescript
type UserName = {
  value: string;
};

const createUserName = (value: string): UserName => {
  if (!value || value.trim().length === 0) {
    throw new Error("UserName cannot be empty");
  }
  return {value};
};
```

#### ▼ UserId

```typescript
type UserId = string;

type User = {
  id: UserId;
  name: UserName;
};

const createUser = (id: UserId, name: UserName): User => ({
  id,
  name,
});
```

<br>

### ユーザーインターフェース層

#### ▼ UserFactory

```typescript
import {v4 as uuidv4} from "uuid";

type UserFactory = {
  createUserWithId: (name: UserName) => Promise<User>;
};

const createUserFactory = (): UserFactory => {
  return {
    createUserWithId: async (name: UserName): Promise<User> => {
      const nextId = await generateId();
      return createUser(nextId, name);
    },
  };
};

// 採番処理
const generateId = async (): Promise<string> => {
  return uuidv4();
};
```

#### ▼ UserApplicationService

```typescript
type UserApplicationService = {
  registerUser: (userName: string) => Promise<User>;
};

const createUserApplicationService = (
  factory: UserFactory,
): UserApplicationService => {
  return {
    registerUser: async (userName: string): Promise<User> => {
      const name = createUserName(userName);
      const user = await factory.createUserWithId(name);
      return user;
    },
  };
};
```

<br>

## 9.3 採番処理をどこに実装するか

### ファクトリ

今回の例に相当する。

<br>

### リポジトリ

採番処理を採番テーブルを使用して実装する場合、データベースに関する処理になるため、リポジトリに実装することもできる。

```typescript
type UserRepository = {
  nextIdentity: () => Promise<UserId>;
  save: (user: User) => Promise<void>;
};

const userRepository: UserRepository = {

  nextIdentity: async () => {
    // 採番テーブルが生成したIDを取得する
    const result = await pool.query("SELECT nextval('user_seq') AS id");
    return result.rows[0].id.toString();
  },

  save: async (user: User) => {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        "INSERT INTO users(id, name) VALUES (?, ?)",
        [user.id, user.name.value]
      );
    } finally {
      conn.release();
    }
};
```

```typescript
import mysql from "mysql2/promise";
import {v4 as uuidv4} from "uuid";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});
```

<br>

### エンティティのコンストラクタ

記入中...

<br>
