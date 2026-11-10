---
title: 【IT技術の知見】変数・スコープ＠PHP
description: 変数・スコープ＠PHPの知見を記録しています。
---

# 変数・スコープ＠PHP

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 定数

### 定数が役に立つ場面

#### ▼ フラグ ON/OFF

```injectablephp
<?php

declare(strict_types=1);

/**
 * フラグ定数クラス
 */
final class FlagConstant
{
    /**
     * フラグが立っている状態
     */
    public const IS_ON = true;

    /**
     * フラグが立っていない状態
     */
    public const IS_OFF = false;
}
```

#### ▼ 区分値

区分名（`A_TYPE`、`B_TYPE`、`C_TYPE`）を integer 型の定数として扱う。

DB レコード区分名をそのまま保存してもよいが、区分名が変わったときにアプリケーションの実装だけでなく DB レコードを変更するのが大変である。

その一方で、DB は区分名ではなく区分値として管理しておけば、DB レコードを変更せず、アプリケーションだけを変更すればよい。

#### ▼ 数値計算、数値比較

計算処理や数値比較処理では、可読性の観点から、できるだけ数値を直書きしない。

数値に意味合いを持たせ、定数として扱うと可読性が高くなる。

#### ▼ URL

URL を文字列を定数として扱う。

<br>

### 場面に応じた命名

<table>
  <thead>
    <tr>
      <th>意味づけ</th>
      <th>名前</th>
      <th>型</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>個数、回数</td>
      <td><code>NUM_*****</code></td>
      <td>int</td>
    </tr>
    <tr>
      <td>最大数、最小数</td>
      <td><code>MAX_NUM_*****</code>、<code>MIN_NUM_*****</code></td>
      <td>int</td>
    </tr>
    <tr>
      <td>URL</td>
      <td><code>URL_*****</code></td>
      <td>string</td>
    </tr>
  </tbody>
</table>

<br>

### マジカル定数

自動的に値が格納されている定数。

#### ▼ `__DIR__`

この定数がコールされたファイルの配置ディレクトリパスは、ルートディレクトリ基準で格納されている。

以下の実装を持つファイルを、`/var/www/foo` ディレクトリ下に配置しておき、`/vendor/autoload.php` ファイルと結合してパスを通す。

```injectablephp
<?php

# /var/www/foo/vendor/autoload.php
require_once realpath(__DIR__ . "/vendor/autoload.php");
```

#### ▼ `__FUNCTION__`

この定数には、コールされた関数名が格納されている。

```injectablephp
<?php

class Foo
{
    public function foo(): void
    {
        echo __FUNCTION__;
    }
}
```

```injectablephp
<?php

class Foo
{
    public function foo(): void{}
}

$foo = new Foo;
$foo->foo(); // foo が返却される。
```

#### ▼ `__METHOD__`

この定数がコールされたクラス名と関数名が、`{クラス名}::{関数名}` の形式で格納されている。

```injectablephp
<?php

class Foo
{
    public function foo(): void
    {
        echo __METHOD__;
    }
}
```

```injectablephp
<?php

$foo = new Foo;
$foo->foo(); // Foo::foo が返却される。
```

<br>

## 02. 変数

### 変数展開

文字列のなかで、変数の中身を取り出すことを『変数展開』と呼ぶ。

※Paiza で検証済み。

#### ▼ シングルクオーテーションによる変数展開

シングルクオーテーションの中身はすべて文字列として認識され、変数は展開されない。

```injectablephp
<?php

$fruit = "リンゴ";

// 出力結果
echo 'これは$fruitです。'; // これは、$fruitです。
```

#### ▼ シングルクオーテーションと波括弧による変数展開

シングルクオーテーションの中身はすべて文字列として認識され、変数は展開されない。

```injectablephp
<?php

$fruit = "リンゴ";

// 出力結果
echo 'これは{$fruit}です。'; // これは、{$fruit}です。
```

#### ▼ ダブルクオーテーションによる変数展開

変数の前後に半角スペースを置いた場合にのみ、変数は展開される。

(※半角スペースがないとエラーになってしまう)

```injectablephp
<?php

$fruit = "リンゴ";

// 出力結果
echo "これは $fruit です。"; // これは リンゴ です。
```

#### ▼ ダブルクオーテーションと波括弧による変数展開

波括弧を使用すると、明示的に変数として扱える。

これによって、変数の前後に半角スペースを配置しなくとも、変数は展開される。

```injectablephp
<?php

$fruit = "リンゴ";

// 出力結果
echo "これは{$fruit}です。"; // これは、リンゴです。
```

<br>

### 参照渡しと値渡し

#### ▼ 参照渡し

『参照渡し』とは、変数に代入した値の参照先 (メモリアドレス) を渡すこと。

```injectablephp
<?php

$value = 1;
$result = &$value; // 値の入れ物を参照先として代入
```

変数の `$b` には、`$a` の参照によって 10 が格納される。

```injectablephp
<?php

$a = 2;
$b = &$a;  // 変数aを&をつけて代入
$a = 10;    // 変数aの値を変更

// 出力結果
echo $b; // 10
```

#### ▼ 値渡し

『値渡し』とは、変数に代入した値のコピーを渡すこと。

```injectablephp
<?php

$value = 1;
$result = $value; // 1をコピーして代入
```

変数の `$b` には、`$a` の１行目の格納によって 2 が格納される。

```injectablephp
<?php

$a = 2;
$b = $a;  // 変数aを代入
$a = 10;  // 変数aの値を変更

// 出力結果
echo $b; // 2
```

<br>

