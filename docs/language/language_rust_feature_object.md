---
title: 【IT技術の知見】オブジェクト
description: オブジェクトの知見を記録しています。
tags:
  - "言語"
  - "Rust"
  - "言語機能"
---

# オブジェクト

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 構造体・属性

### `struct`

`struct` は、複数のフィールドを持つ型 (構造体) を定義する。

インスタンスは、`Organization { name: ..., role_name: ..., current: ... }` のように全フィールドの値を指定して作る。

```rust
// 構造体を定義する
pub struct Organization {
    // フィールド名: 型
    pub name: String,
    pub role_name: String,
    pub current: bool,
}
```

<br>

### `derive` 属性

`#[derive(...)]` 属性は、型に機能を自動で実装する (例：`Debug` は `{:?}` での表示、`PartialEq` は `==` での比較、`Deserialize` は JSON からの変換) 。

`#[serde(rename_all = "camelCase")]` 属性は、JSON の `roleName` キーを `role_name` フィールドに対応づける。

```rust
// {:?} での表示、JSON からの変換、== での比較を自動で実装する
#[derive(Debug, Deserialize, PartialEq)]
// JSON のキーをキャメルケースとして扱う
#[serde(rename_all = "camelCase")]
pub struct Organization {
    pub name: String,
    // JSON の roleName キーに対応する
    pub role_name: String,
}
```

<br>

