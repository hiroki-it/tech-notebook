---
title: 【IT技術の知見】５章＠ドメイン駆動設計入門ボトムアップ
description: ５章＠ドメイン駆動設計入門ボトムアップの知見を記録しています。
---

# ５章＠ドメイン駆動設計入門ボトムアップ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 実装例

### 注意点

#### ▼ よろしくない実装（リポジトリにUpdate〇〇をいっぱいかく）

Userオブジェクトに実装するべき振る舞いのビジネスロジックを、永続化の役割をもつRepositoryに実装することになってしまう

```typescript
type UserName = string;
type Email = string;

type User = Readonly<{
  name: UserName;
  email: Email;
}>;

const createUser = (name: UserName, email: Email): User => ({
  name,
  email,
});

const getName = (user: User): UserName => user.name;

// 中略
```

```typescript
type UserId = string;

type IUserRepository = {
  find: (id: UserId) => Promise<User>;
  updateName: (name: UserName) => Promise<void>;
  updateEmail: (email: Email) => Promise<void>;
};
```

```typescript
const user = await userRepository.find(userId);
await userRepository.updateName(getName(user)); // リポジトリの UpdateName のなかで、ドメインロジックを書くことになってしまう
```

#### ▼ より良い実装（リポジトリにSaveを書く）

Userオブジェクトが振る舞いのビジネスロジックをもち、Repositoryは永続化ロジックをもつので、責務を区別できている

責務さえ区別できていれば、名前はSaveやStore、それこそUpdateでもよい

```typescript
type UserName = string;
type Email = string;

type User = Readonly<{
  name: UserName;
  email: Email;
}>;

const createUser = (name: UserName, email: Email): User => ({
  name,
  email,
});

const getName = (user: User): UserName => user.name;

const changeName = (user: User, newName: UserName): User => ({
  ...user,
  name: newName,
});

const changeEmail = (user: User, newEmail: Email): User => ({
  ...user,
  email: newEmail,
});
```

```typescript
type UserId = string;

type IUserRepository = {
  find: (id: UserId) => Promise<User>;
  save: (user: User) => Promise<void>;
};
```

```typescript
const user = await userRepository.find(userId);
const updatedUser = changeName(user, newName); // ユーザーオブジェクトが自分でユーザー名の状態を変更する
await userRepository.save(updatedUser); // リポジトリは、状態の変更されたユーザーオブジェクトを保存するだけ
```

<br>
