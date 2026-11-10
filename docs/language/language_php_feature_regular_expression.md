---
title: 【IT技術の知見】正規表現
description: 正規表現の知見を記録しています。
tags:
  - "言語"
  - "PHP"
  - "言語機能"
---

# 正規表現

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 正規表現とパターン演算子

### 正規表現

#### ▼ 正規表現とは

数値、記号、文字列などの種類を簡単に表す文字列のこと。

<br>

### `preg_match()` 関数

#### ▼ 数字

『`0` から `9` のいずれか』の数字を意味する。

```injectablephp
<?php

$var = "0123456789";

// OR条件と範囲指定
$result = preg_match("/[0-9]/", $var);

var_dump($result); // true
```

#### ▼ アルファベット

『`a` から `z` のいずれか』または『A から Z のいずれか』のアルファベットを意味する。

```injectablephp
<?php

$var = "aAbBcC";

// OR条件と範囲指定
$result = preg_match("/[a-zA-Z]/", $var);

var_dump($result); // true
```

#### ▼ メタ文字

エスケープのために、必ずバックスラッシュを付ける必要がある。

> - [正規表現：エスケープが必要な文字一覧 \| WWWクリエイターズ](https://www-creators.com/archives/3102)

『`?`』『`.`』『`*`』『`$`』のいずれかのメタ文字を意味する。

```injectablephp
<?php

$var = "?";

$result = preg_match("/[\?.*$]/", $var);

var_dump($result); // 1
```

#### ▼ ワイルドカード

ワイルドカードは『`.*`』または『`.+`』で意味する。

ドットは任意の文字、アスタリスクは直前の文字が `0` 回以上反復すること、プラスは `1` 回以上反復することを意味する。

> - [正規表現とワイルドカード、そして記号の意味 #Linux - Qiita](https://qiita.com/whisky-shusuky/items/d719c92c566c133f51b1)

```injectablephp
<?php

$var = "FooBarBaz";

// 前方の一致
$result = preg_match("/Foo.*/", $var);

var_dump($result); // 1
```

```injectablephp
<?php

$var = "FooBarBaz";

// 後方の一致
$result = preg_match("/.*Baz/", $var);

var_dump($result); // 1
```

#### ▼ クエスチョン

クエスチョンの前に記載された文字列は、有無にかかわらず問題ないことを意味する。

> - http://www.ipc.juen.ac.jp/contents/manuals/spam/regular.html

```injectablephp
<?php

$var = "FooBarBaz";

# zはあってもなくてもも
$result = preg_match("/FooBarBaz?/", $var);

var_dump($result); // 1
```

#### ▼ オプションとしてのパターン演算子

```injectablephp
<?php

$var = "jpeg";

// jpegの大文字小文字
$result = preg_match("/jpeg$/i", $var);

var_dump($result); // 1
```

```injectablephp
<?php

$var = "JPEG";

// jpegの大文字小文字
$result = preg_match("/jpeg$/i", $var);

var_dump($result); // 1
```

#### ▼ グループ化

文字列をグループ化する。

正規表現に規則性がある場合に有効である。

> - [正規表現の基礎](http://www.turtle.gr.jp/techno/regular-expression.html)

```injectablephp
<?php

$var = "abcabcabc";

# abcが任意数だけ反復する
$result = preg_match("/(abc)*/", $var);

var_dump($result); // 1
```
