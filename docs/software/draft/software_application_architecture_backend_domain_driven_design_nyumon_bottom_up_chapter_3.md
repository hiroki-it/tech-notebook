---
title: 【IT技術の知見】３章＠ドメイン駆動設計入門ボトムアップ
description: ２章＠ドメイン駆動設計入門ボトムアップの知見を記録しています。
---

# ３章＠ドメイン駆動設計入門ボトムアップ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## エンティティとは

### 識別子 (ID) を持つ

同じデータをもっていても、IDが異なれば別のエンティティである。

<br>

### IDで等価性検証できる

値オブジェクトとは異なり、IDで等価性検証ができる。

<br>

### 処理の中で状態を変更できる

処理の中で状態が更新されてもIDは変わらず、オブジェクトとしての等価性は保たれる。

<br>

### ライフサイクルがある

作成から削除までのライフサイクルがある。

<br>

## エンティティの実装例

### Userをエンティティにする場合

エンティティを関数型プログラミングかつTypeScriptで紹介します。

<br>

### 識別子 (ID) を持つ

```typescript
export type UserId = string;

export type User <{
  id: UserId;
  name: string;
  email: string;
}>;
```

```typescript
const createUser = (id: UserId, name: string, email: string): User | Error => {
  if (!id || !email) return new Error("IDとメールは必須です");
  return Object.freeze({id, name, email});
};
```

<br>

### IDで等価性検証できる

「〇〇は既に存在しています」のエラーで役立つ。

```typescript
export type UserId = string;

export type User <{
  id: UserId;
  name: string;
  email: string;
}>;
```

```typescript
export const equalsUser = (a: User, b: User): boolean => {
  return a.id === b.id;
};
```

<br>

### 処理の中で状態が変化する

```typescript
export type UserId = string;

export type User <{
  id: UserId;
  name: string;
  email: string;
}>;
```

```typescript
// 処理の途中で状態を変更できる
export const changeUserName = (user: User, newName: string): User => {
  return Object.freeze({...user, name: newName});
};
```

<br>

### ライフサイクル

```typescript
export type UserId = string;

export type User <{
  id: UserId;
  name: string;
  email: string;
}>;
```

```typescript
// 削除
export const createUser = (
  id: UserId,
  name: string,
  email: string,
): User | Error => {
  if (!id || !name || !email) return new Error("全ての値は必須です");
  return Object.freeze({id, name, email});
};

// 作成
export const deleteUser = (id: UserId): boolean => {
  return db.delete(id);
};
```

<br>

## エンティティの見つけ方

### CRUD系メソッドの対象

CRUD系メソッド（`create`、`find`、`update`、`delete`）の対象となるオブジェクトはエンティティの可能性がある。

<br>

### 業務フローの中にある

入庫 → 検査 → 販売 → 返品 というような業務フローの中で処理される。

<br>
