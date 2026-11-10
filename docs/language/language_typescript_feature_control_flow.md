---
title: 【IT技術の知見】制御構文
description: 制御構文の知見を記録しています。
tags:
  - "言語"
  - "TypeScript"
  - "言語機能"
---

# 制御構文

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 条件式

### 二項演算子

与えられた変数の値が falsy だった場合に、値を設定する。

デフォルト値を設定する場合に役立つ。

```typescript
// ""、0、null、undefined、falseなど
const flag = enableFoo || "false";
```

```typescript
// null、undefinedなど
const flag = enableFoo ?? "false";
```

<br>

### 三項演算子

```typescript
// fooの場合にfooを代入し、fooでない場合にbarを代入する
const fooOrBar = foo == "foo" ? foo : "bar";
```

<br>

