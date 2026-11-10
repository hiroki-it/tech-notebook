---
title: 【IT技術の知見】エラー処理
description: エラー処理の知見を記録しています。
tags:
  - "言語"
  - "Rust"
  - "言語機能"
---

# エラー処理

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. エラーハンドリング

### `Option` と `Result`

Rust には `null` も例外もなく、値がない可能性は `Option<T>` (`Some(値)` または `None`) で表す。

失敗する可能性は `Result<T, E>` (`Ok(値)` または `Err(エラー)`) で表す。

```rust
// トークンがあれば Some(トークン)、なければ None を返す
fn token_for(&self, origin: &str) -> Option<&str> { /* ... */ }
// 成功すれば Ok(パス)、失敗すれば Err(エラー) を返す
fn default_path() -> Result<PathBuf> { /* ... */ }
```

<br>

### `?` 演算子

`?` 演算子は、`Err` ならその場でエラーを返して関数を抜け、`Ok` なら中身を取り出す。

`?` 演算子を使う関数は、戻り値の型が `Result` である必要がある。

```rust
// ? 演算子を使うため、戻り値の型を Result にする
fn main() -> Result<()> {
    // Err ならここで main 関数を抜け、Ok なら中身を path に代入する
    let path = credentials::default_path()?;
    // ...
    // 成功を返す
    Ok(())
}
```

<br>

### `with_context` と `bail!`

anyhow パッケージの `with_context` メソッドは、`None` や `Err` をメッセージ付きのエラーに変換する。

`bail!` マクロは、指定したメッセージのエラーをその場で返す (`return Err(anyhow!(...))` の短縮形) 。

```rust
// None をメッセージ付きのエラーに変換し、? 演算子で返す
let token = creds.token_for(&origin).with_context(|| {
    format!("not logged in to {origin}")
})?;

if is_expired(token, now()) {
    // このメッセージのエラーをその場で返す
    bail!("the token for {origin} has expired");
}
```

<br>

