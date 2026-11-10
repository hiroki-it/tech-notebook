---
title: 【IT技術の知見】入出力
description: 入出力の知見を記録しています。
tags:
  - "言語"
  - "Rust"
  - "言語機能"
---

# 入出力

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. マクロ

### マクロとは

名前の後ろに `!` が付くものは、関数ではなくマクロである。

マクロは、可変個の引数を受け取るなど、関数ではできない処理を実現できる。

```rust
// ! が付いているため、関数ではなくマクロである
println!("{token}");
eprintln!("Logged in to {origin}");
```

<br>

### 書式指定

`{変数名}` と書くと変数を直接埋め込め、式は `{}` に対応する引数として後ろに渡す。

`{:<width$}` は、変数 `width` の幅で左寄せする書式指定である。

```rust
// 変数 origin を直接埋め込む
format!("{origin}/openapi/v1/organizations");
// 式の値を {} に埋め込む
format!("Token saved to {}", path.display());
// organization.name を変数 width の幅で左寄せして埋め込む
format!("{marker} {:<width$}  {}\n", organization.name, organization.role_name);
```

<br>

### `println!` と `eprintln!`

`println!` マクロは標準出力に、`eprintln!` マクロは標準エラー出力に書き込む。

`$(foo token)` のようにコマンドの出力を変数へ代入する場合、メッセージ類を標準エラー出力に出すと、標準出力をきれいに保てる。

```rust
// 標準出力に書き込む
println!("{token}");
// 標準エラー出力に書き込む
eprintln!("Logged in to {origin}");
```

<br>

