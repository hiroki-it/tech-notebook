---
title: 【IT技術の知見】６章＠ドメイン駆動設計入門ボトムアップ
description: ６章＠ドメイン駆動設計入門ボトムアップの知見を記録しています。
---

# ６章＠ドメイン駆動設計入門ボトムアップ

## サンプルコード

> - https://github.com/nrslib/itddd/tree/master/SampleCodes/Chapter6

<br>

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 6.1 アプリケーションサービスとは

アプリケーションサービスとは、ドメインオブジェクト（エンティティや値オブジェクト）を使用してユースケースを実現するオブジェクトである。

作成したドメインオブジェクトをインターフェース層に返却する。

<br>

## 6.2 アプリケーションサービスの実装方法（関数型）

```typescript
export type userRepositoryDI = Readonly<{
  userRepository: UserRepository;
}>;

export type RegisterUserInput = Readonly<{
  name: string;
  email: string;
}>;

export const registerUser = async (
  userRepositoryDI: UserRepositoryDI,
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

  const exists = await userRepositoryDI.userRepository.findByEmail(email);

  if (exists) {
    return err(new Error("Email already registered"));
  }

  const user = createUser(name, email);

  await userRepositoryDI.userRepository.save(user);

  return ok(user);
};
```

<br>

## 6.3 アプリケーションサービスで実装するべきロジックの見つけ方

ユーザーや外部クライアントから要求を受け、ユースケースを表現するロジックはアプリケーションサービスに適する。

<br>
