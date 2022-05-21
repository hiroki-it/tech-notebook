---
title: 【知見を記録するサイト】検証ロジック＠JavaScript
description: 検証ロジック＠JavaScriptをまとめました。
---

# 検証ロジック＠JavaScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 検証

### 検証の必要性の有無

#### ▼ 不要な場合

DBから取得した後に直接的に表示する値の場合、DBでNullにならないように制約をかけられる。そのため、値が想定通りの状態になっているかを改めて検証する必要はない。

#### ▼ 必要な場合

DBからの値を直接的に表示する場合と異なり、新しく作られる値を使用する場合、その値が想定外の状態になっている可能性がある。そのため、値が想定通りの状態になっているかを検証する必要がある。

<br>

### 検証パターンと検証メソッドの対応

✅：```TRUE```

空欄：```FALSE```

以下のリンクを参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_language_php_logic_validation.html

|                     | ```typeof $var``` | ```if($var)``` |
|:--------------------|:-----------------:|:--------------:|
| **```null```**      |   ```object```    |                |
| **```0```**         |   ```number```    |                |
| **```1```**         |   ```number```    |       ✅        |
| **```""```**（空文字）   |   ```string```    |                |
| **```"あ"```**       |   ```string```    |       ✅        |
| **```NaN```**       |   ```number```    |                |
| **```undefined```** |  ```undefined```  |                |

