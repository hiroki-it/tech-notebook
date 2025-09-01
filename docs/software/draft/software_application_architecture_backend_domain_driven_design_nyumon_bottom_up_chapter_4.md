---
title: 【IT技術の知見】４章＠ドメイン駆動設計入門ボトムアップ
description: ４章＠ドメイン駆動設計入門ボトムアップの知見を記録しています。
---

# ４章＠ドメイン駆動設計入門ボトムアップ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## ドメインサービスとは

自身の状態を持たず、ドメインのふるまいを切り分けたオブジェクトである。

エンティティや値オブジェクトに記述すると不自然なふるまいを扱う。

<br>

## ドメインサービスの実装方法（関数型）

```typescript
export type UserId = string;
export type UserName = string;

export type User = Readonly<{
  id: UserId;
  name: UserName;
}>;

export const createUser = (id: string, name: string): User => {
  if (!id.trim()) throw new Error("ユーザーIDは必須です。");
  if (!name.trim()) throw new Error("ユーザー名は必須です。");
  return {id, name};
};
```

```typescript
import type {User, UserName} from "./user";

export type UserExistenceService = {
  existsByName: (name: UserName) => Promise<boolean>;
};

export const exists =
  (deps: UserExistenceService) =>
  async (user: User): Promise<boolean> => {
    return deps.existsByName(user.name);
  };
```

<br>

## ドメインサービスの見つけ方

- エンティティや値オブジェクトに自然に属さない処理
- 1つのエンティティに責務を押し付けると不自然な汎用的な処理
- 「〜を確認する」「〜を判断する」といった問いかけ的な振る舞い
- 複数のエンティティや値オブジェクトの関係を調整する処理

<br>
