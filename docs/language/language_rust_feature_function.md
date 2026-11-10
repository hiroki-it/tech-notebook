---
title: 【IT技術の知見】関数
description: 関数の知見を記録しています。
tags:
  - "言語"
  - "Rust"
  - "言語機能"
---

# 関数

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 関数

### 最後の式が戻り値

`->` の後ろに戻り値の型を書き、最後の式にセミコロンを付けないと、その値が戻り値になる。

`return` は、関数を途中で抜けたいときにだけ使う。

```rust
// 戻り値の型は u64 である
fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        // セミコロンがないため、この式の値が戻り値になる
        .unwrap_or(0)
}
```

<br>

### `::` と `.`

`型::関数()` は、型に紐づく関数 (関連関数、静的メソッド相当) を呼び出す。

`変数.メソッド()` は、インスタンスのメソッドを呼び出す。

```rust
// 型に紐づく関連関数を呼び出す
let cli = Cli::parse();
// インスタンスのメソッドを呼び出す
creds.save(&path)?;
```

<br>

## 02. クロージャとイテレータ

### クロージャ

`|引数| 式` はクロージャ (無名関数) である。

クロージャは、定義した場所の外側の変数を参照できる。

```rust
// organization を引数に取り、名前の文字数を返すクロージャ
.map(|organization| organization.name.chars().count())
```

<br>

### イテレータ

`iter` メソッドで要素を 1 つずつ取り出し、`map` や `max` などのメソッドをチェーンして処理する。

Rust のイテレータは遅延評価であり、`max` や `collect` などを呼ぶまで実際の処理は実行されない。

```rust
let width = organizations
    // 要素を 1 つずつ取り出す
    .iter()
    // 各要素を名前の文字数に変換する
    .map(|organization| organization.name.chars().count())
    // 最大値を Option で返し、ここで初めて処理が実行される
    .max()
    // 要素が空で None のときは 0 にする
    .unwrap_or(0);
```

<br>

### `collect`

`collect` メソッドは、イテレータの要素をコレクションにまとめる。

まとめる先の型は戻り値の型から推論され、この例では各行がつながった 1 つの `String` になる。

```rust
// 戻り値の型が String であるため、collect の結果は String になる
pub fn format(organizations: &[Organization]) -> String {
    organizations
        .iter()
        // 各要素を 1 行の文字列に変換する
        .map(|organization| format!("{}\n", organization.name))
        // 各行をつなげて 1 つの String にまとめる
        .collect()
}
```

<br>

