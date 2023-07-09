---
title: 【IT技術の知見】検証ロジック＠Go
description: 検証ロジック＠Goの知見を記録しています。
---

# 検証ロジック＠Go

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 検証

### 検証パターンと検証メソッドの対応

記入中...

✅：`TRUE`になる。

空欄：`FALSE`になる。

| 検証パターン          | `if (var)` | `if len(var) == 0` | `if var != nil` | `in var == 0`、`if reflect.ValueOf(var).IsZero()` |
| :-------------------- | ---------- | :----------------: | :-------------: | :-----------------------------------------------: |
| **`nil`**             |            |                    |                 |                                                   |
| **`0`**               |            |                    |                 |                        ✅                         |
| **`1`**               |            |                    |                 |                                                   |
| **`""`** (空文字)     |            |         ✅         |                 |                                                   |
| **`"あ"`**            |            |                    |                 |                                                   |
| **`false`**           |            |                    |                 |                                                   |
| **`true`**            | ✅         |                    |                 |                                                   |
| **`[]`** (空スライス) |            |                    |                 |                                                   |


> - https://stackoverflow.com/a/18595217
> - https://www.geeksforgeeks.org/zero-value-in-golang/
> - https://stackoverflow.com/a/61877328
> - https://stackoverflow.com/a/38512327
> - https://tutuz-tech.hatenablog.com/entry/2019/10/20/145302

<br>
