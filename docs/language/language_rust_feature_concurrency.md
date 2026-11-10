---
title: 【IT技術の知見】並行・非同期処理＠Rust
description: 並行・非同期処理＠Rustの知見を記録しています。
---

# 並行・非同期処理＠Rust

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. `move` クロージャ

`move` を付けたクロージャは、外側の変数 (例：`server`) の所有権をクロージャのなかへ移動させる。

別スレッドで変数を使う場合、元のスレッドより長く生きる可能性があるため `move` が必要になる。

```rust
// 別スレッドを起動し、server の所有権をクロージャへ移動させる
let handle = thread::spawn(move || {
    // 移動した server をスレッドのなかで使う
    let request = server.recv().unwrap();
    // ...
});
```

<br>
