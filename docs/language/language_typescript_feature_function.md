---
title: 【IT技術の知見】関数
description: 関数の知見を記録しています。
tags:
  - "言語"
  - "TypeScript"
  - "言語機能"
---

# 関数

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 関数の種類

### 即時関数

無名関数の宣言と呼び出しを同時に行う。

```typescript
// 無名関数を即時実行し、message変数に代入する
const message = (() => {
  return `Hello, Hiroki`;
})();

console.log(message);
```

<br>

### メソッド

#### ▼ setter

プロパティを直接操作するように値を変更できる。

```typescript
class User {
  private _name: string;

  constructor(name: string) {
    this._name = name;
  }

  get name(): string {
    return this._name;
  }

  set name(newName: string) {
    if (newName.trim() === "") {
      throw new Error("名前は空にできません");
    }
    this._name = newName;
  }
}

// 最初の名前
const user = new User("Tom");

// プロパティを直接操作するように値を変更できる
// 名前を変更する
user.name = "Bob";
```

#### ▼ update 系、change 系

ドメインを意識したメソッドを使用して値を変更できる。

```typescript
class User {
  private _name: string;

  constructor(name: string) {
    this._name = name;
  }

  get name(): string {
    return this._name;
  }

  changeName(newName: string): void {
    if (newName.trim() === "") {
      throw new Error("名前は空にできません");
    }
    this._name = newName;
  }
}

// 最初の名前
const user = new User("Tom");

// ドメインを意識したメソッドを使用して値を変更できる
// 名前を変更する
user.changeName("Bob");
```

<br>

## 02. 引数

### 分割代入引数

#### ▼ 分割代入引数とは

関数の引数を定義するときに、オブジェクトから特定のプロパティを直接取り出する記法。

可読性が高くなる。

#### ▼ 分割代入引数しない場合

```typescript
function greet(
  // パラメーターからnameプロパティとageプロパティを直接取り出さない
  user: {
    name: string;
    age: number;
  },
) {
  console.log(`Hello, ${user.name}. You are ${user.age} years old.`);
}

const user = {name: "Hiroki", age: 1};

// 引数を渡す
greet(user);
```

#### ▼ 分割代入引数する場合

```typescript
function greet(
  // パラメーターからnameプロパティとageプロパティを直接取り出す
  {
    name,
    age,
  }: {
    name: string;
    age: number;
  },
) {
  console.log(`Hello, ${name}. You are ${age} years old.`);
}

const user = {name: "Hiroki", age: 1};

// 引数を渡す
greet(user);
```

<br>

## 03. 返却値

### 返却値型

TypeScript では、 `return` の型のみを指定すればよい。

```typescript
// Error型は返却値型に指定しなくても良い
function foo(): string {
  try {
    // 何らかの処理

    return "success";
  } catch (e) {
    // 何らかの処理

    throw new Error("failed");
  }
}

// string型または例外を返却する
foo();
```

<br>

### 返却方法

#### ▼ return

呼び出し元に成功を返却する。

```typescript
// string型のみを指定する
function foo(): string {
  try {
    // 何らかの処理

    return "success";
  } catch (e) {
    // 何らかの処理

    return "failed";
  }
}

// string型を返却する
foo();
```

#### ▼ throw

呼び出し元に失敗をエラーとして返却する。

どんな型でも返却できる。

```typescript
// string型のみを指定し、Error型は返却値型に指定しなくても良い
function foo(): string {
  try {
    // 何らかの処理

    return "success";
  } catch (e) {
    // 何らかの処理

    throw new Error("failed");
  }
}

// string型またはError型を返却する
foo();
```

<br>

