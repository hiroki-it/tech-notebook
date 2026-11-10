---
title: 【IT技術の知見】モジュール
description: モジュールの知見を記録しています。
tags:
  - "言語"
  - "Rust"
  - "言語機能"
---

# モジュール

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. モジュール

### `mod`

`mod xxx;` と書くと、同じディレクトリの `xxx.rs` ファイルをモジュールとして読み込む。

`main.rs` で `mod` を宣言しないファイルは、コンパイルの対象にならない。

```rust
// src/credentials.rs をモジュールとして読み込む
mod credentials;
// src/organizations.rs をモジュールとして読み込む
mod organizations;
```

<br>

### `use`

`use` は、他のモジュールやクレートの名前を短く呼べるようにする。

`{A, B}` と書くと、複数の名前をまとめて取り込める。

```rust
// 外部クレートの anyhow から複数の名前をまとめて取り込む
use anyhow::{Context, Result, bail};
// 自分の credentials モジュールの型を取り込む
use credentials::Credentials;
```

<br>

### `pub`

`pub` を付けた要素だけが、モジュールの外から見える。

何も付けない要素は、デフォルトで private になる。

```rust
// 構造体をモジュールの外に公開する
pub struct Organization {
    // フィールドも個別に公開する必要がある
    pub name: String,
}

// 関数をモジュールの外に公開する
pub fn fetch(origin: &str, token: &str) -> Result<Vec<Organization>> {
    // ...
}
```

<br>

### コメント

`///` はすぐ下の要素のドキュメントで、`//!` はファイル (モジュール) 自体のドキュメントである。

clap パッケージは、`///` のドキュメントを `--help` の説明文として使う。

```rust
//! モジュールのファイル自体のドキュメント

/// すぐ下の要素のドキュメント
pub fn fetch() {}

// 普通のコメント
```

<br>

