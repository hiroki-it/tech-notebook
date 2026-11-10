---
title: 【IT技術の知見】オブジェクト
description: オブジェクトの知見を記録しています。
tags:
  - "言語"
  - "TypeScript"
  - "言語機能"
---

# オブジェクト

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. オブジェクト型 (Object)

### ▼ 変数

```typescript
const object: {
  name: string;
  age: number;
} = {
  name: "taro",
  age: 20,
};
```

### ▼ 参照記法

```typescript
const obj = {
  foo: 123,
  bar: 456,
  "baz-qux": 789,
};

const key = "bar";

// ドット記法
// キー名が静的で変わらない場合に適している
const value1 = obj.foo; // 123

// ブラケット記法
// キー名が動的な場合や記号を含む場合に適している
const value2 = obj[key]; // 456
const value3 = obj["baz-qux"]; // 789
```

### ▼ Record による定義

Record を使用することで、オブジェクト型をわかりやすく定義できる。

```typescript
const object: Record<string, string> = {
  name: "taro",
  age: "20",
};
```

```typescript
const object: Record<string, unknown> = {
  name: "taro",
  age: "20",
  foo: 1,
  bar: [],
};
```

<br>

## 02. コピー

### 参照コピー

変数がオブジェクト型の場合に、メモリアドレスをコピーする。

変数がプリミティブ型の場合、ポインタコピーは存在しない。

```typescript
const original = {id: 1, name: "foo"};
const copy = original; // ポインタコピー
copy.name = "bar";

console.log(original.name); // "bar" となり、コピー前の状態が変わっている
```

<br>

### シャローコピー

変数がオブジェクト型の場合に、その変数の階層にある値のみをコピーする。

ただし、第一階層だオブジェクト型であると参照コピーの挙動になる。

```typescript
const original = {id: 1, fullname: {lastname: "foo", firstname: "foo"}};
const copy = {...original}; // シャローコピー
copy.fullname.firstname = "bar";

console.log(original.fullname.firstname); // "bar" となり、コピー前の状態が変わっている
```

<br>

### ディープコピー

変数がオブジェクト型の場合に、その変数の階層にある値のみをコピーする。

```typescript
const original = {id: 1, fullname: {lastname: "foo", firstname: "foo"}};
const copy = structuredClone(original);
copy.fullname.firstname = "bar";

console.log(original.fullname.firstname); // "foo" となり、コピー前の状態には影響がない
```

<br>

