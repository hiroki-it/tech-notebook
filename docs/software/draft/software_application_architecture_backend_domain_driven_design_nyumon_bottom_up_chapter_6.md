---
title: 【IT技術の知見】６章＠ドメイン駆動設計入門ボトムアップ
description: ６章＠ドメイン駆動設計入門ボトムアップの知見を記録しています。
---

# ６章＠ドメイン駆動設計入門ボトムアップ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## アプリケーションサービスとは

アプリケーションサービスとは、ドメインオブジェクト（エンティティや値オブジェクト）を使用してユースケースを実現するオブジェクトである。

作成したドメインオブジェクトをUI層に返却する。

<br>

## アプリケーションサービスの実装方法（関数型）

```typescript
export type Deps = Readonly<{
  userRepo: UserRepo;
}>;

export type RegisterUserInput = Readonly<{
  name: string;
  email: string;
}>;

export const registerUser = async (
  deps: Deps,
  input: RegisterUserInput,
): Promise<Result<User>> => {
  const name = createUserName(input.name);

  if (name instanceof Error) {
    return err(name);
  }

  const email = createEmail(input.email);

  if (email instanceof Error) {
    return err(email);
  }

  const exists = await deps.userRepo.findByEmail(email);

  if (exists) {
    return err(new Error("Email already registered"));
  }

  const user = createUser(name, email);

  await deps.userRepo.save(user);

  return ok(user);
};
```
