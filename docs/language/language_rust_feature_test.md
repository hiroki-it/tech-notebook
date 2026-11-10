---
title: 【IT技術の知見】テスト＠Rust
description: テスト＠Rustの知見を記録しています。
---

# テスト＠Rust

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. テスト

### `#[cfg(test)]` と `#[test]`

`#[cfg(test)]` 属性を付けたモジュールは `cargo test` コマンドの実行時だけコンパイルされ、`#[test]` 属性を付けた関数がテストになる。

Rust では、テスト対象と同じファイルにテストを書き、`use super::*` で親モジュールの要素を取り込むことが多い。

```rust
// cargo test コマンドの実行時だけコンパイルする
#[cfg(test)]
mod tests {
    // テスト対象である親モジュールの要素を全て取り込む
    use super::*;

    // この関数をテストとして実行する
    #[test]
    fn format_returns_empty_for_no_organizations() {
        // 2 つの値が等しくなければテストを失敗させる
        assert_eq!(format(&[]), "");
    }
}
```

<br>

