---
title: 【IT技術の知見】４章＠ドメイン駆動設計入門ボトムアップ
description: ４章＠ドメイン駆動設計入門ボトムアップの知見を記録しています。
---

# ４章＠ドメイン駆動設計入門ボトムアップ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## サンプルコード

> - https://github.com/nrslib/itddd/tree/master/SampleCodes/Chapter4

<br>

## 01. ドメインサービスとは

特定の集約内において、ドメイン層のエンティティに持たせるとやや不自然で、他のドメインオブジェクトを対象とした汎用的な振舞ロジックを切り分けたもの。

<br>

## 02. ドメインサービスの実装方法（関数型）

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

export type UserExistenceServiceDI = {
  existsByName: (name: UserName) => Promise<boolean>;
};

export const exists =
  (userExistenceServiceDI: UserExistenceServiceDI) =>
  async (user: User): Promise<boolean> => {
    return userExistenceServiceDI.existsByName(user.name);
  };
```

<br>

## 03. ドメインサービスで実装するべきロジックの見つけ方

- エンティティや値オブジェクトに自然に属さない処理
- 1 つのエンティティに責務を押し付けると不自然な汎用的な処理
- 「〜を確認する」「〜を判断する」といった問いかけ的な振る舞い
- 複数のエンティティや値オブジェクトの関係を調整する処理

<br>
