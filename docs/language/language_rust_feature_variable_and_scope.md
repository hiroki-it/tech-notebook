---
title: 【IT技術の知見】変数・スコープ
description: 変数・スコープの知見を記録しています。
tags:
  - "言語"
  - "Rust"
  - "言語機能"
---

# 変数・スコープ

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. `let` と `let mut`

`let` で宣言した変数は、デフォルトで変更できない。

値を変更する変数には `let mut` と書く。

```rust
// 変更できない変数
let cli = Cli::parse();
// 変更できる変数
let mut creds = Credentials::load(&path)?;
// mut を付けたため、中身を変更できる
creds.set_token(&origin, token);
```

<br>

## 02. タプルの分割代入

`let (a, b) = ...` と書くと、タプルの要素を変数に分割して代入できる。

`_` は、使わない値を受け取って捨てる。

```rust
// タプルの 1 つ目の要素は捨て、2 つ目の要素を token に代入する
let (_, token) = saved_token(url.as_deref(), &creds)?;
```

<br>

