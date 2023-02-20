---
title: 【IT技術の知見】検証ロジック＠Go
description: 検証ロジック＠Goの知見を記録しています。
---

# 検証ロジック＠Go

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 検証

### 検証パターンと検証メソッドの対応

✅：`TRUE`

空欄：`FALSE`

フロントエンドの検証については以下のリンクを参考にせよ。

| 検証パターン      | `if (var)` | `if len(var) < 0` | `if var = nil` | `in var == 0`、`if reflect.ValueOf(var).IsZero()` |
| :---------------- | ---------- | :---------------: | :------------: | :-----------------------------------------------: |
| **`nil`**         |            |                   |       ✅       |                                                   |
| **`0`**           |            |                   |                |                        ✅                         |
| **`1`**           |            |                   |                |                                                   |
| **`""`** (空文字) |            |                   |                |                                                   |
| **`"あ"`**        |            |        ✅         |                |                                                   |
| **`false`**       |            |                   |                |                                                   |
| **`true`**        | ✅         |                   |                |                                                   |

> ↪️ 参考：
>
> - https://stackoverflow.com/a/18595217
> - https://www.geeksforgeeks.org/zero-value-in-golang/
> - https://stackoverflow.com/a/61877328
> - https://stackoverflow.com/a/38512327

<br>
