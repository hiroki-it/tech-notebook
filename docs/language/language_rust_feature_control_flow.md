---
title: 【IT技術の知見】制御構文
description: 制御構文の知見を記録しています。
tags:
  - "言語"
  - "Rust"
  - "言語機能"
---

# 制御構文

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. パターンマッチ

### `match` による列挙型の分岐

`match` は強化版の `switch` であり、バリアントのなかのフィールドをその場で変数として取り出せる。

すべてのケースを網羅しないとコンパイルエラーになるため、分岐の書き忘れを防げる。

```rust
match cli.command {
    // Login バリアントのフィールドを変数として取り出す
    Command::Login { url, no_browser, port, timeout } => { /* ... */ }
    // Token バリアントの url を取り出す
    Command::Token { url } => { /* ... */ }
    // 1 つでもバリアントの分岐が欠けると、コンパイルエラーになる
    Command::Organizations { url } => { /* ... */ }
}
```

<br>

### 値によるマッチ

パターンには `403` のような具体的な値を書け、上から順に評価される。

そのため、具体的なパターンを先に書き、`status` や `err` のようにすべてを受け取るパターンを後に書く。

```rust
match ureq::get(&url).call() {
    // 成功したときのレスポンスを取り出す
    Ok(mut response) => { /* ... */ }
    // ステータスコードが 403 のときだけマッチする
    Err(ureq::Error::StatusCode(403)) => bail!("invalid token"),
    // 403 以外のステータスコードを status に代入する
    Err(ureq::Error::StatusCode(status)) => bail!("returned {status}"),
    // 上記以外の全てのエラーを err に代入する
    Err(err) => Err(err).context("failed to request"),
}
```

<br>

## 02. `if` 式

Rust の `if` は式であり、値を返せるため三項演算子の代わりになる。

`'*'` のようにシングルクォートで囲むと `char` 型 (1 文字) になり、ダブルクォートで囲むと文字列になる。

```rust
// current が true なら '*'、false なら ' ' を marker に代入する
let marker = if organization.current { '*' } else { ' ' };
```

<br>

