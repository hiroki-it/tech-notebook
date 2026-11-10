---
title: 【IT技術の知見】モジュール＠PHP
description: モジュール＠PHPの知見を記録しています。
---

# モジュール＠PHP

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 外部ファイルの読み出し

### `require_once()` 関数による、クラス、非クラスの関数の読み出し

#### ▼ `require_once()` 関数とは

外部ファイルとして定義したクラス、非クラスの関数を一度だけ読み込める。

動的な値は持たず、静的に読み込むことに注意。

ただし、チームの各エンジニアが好きなものを読み込んでいたら、スパゲッティコードになりかねない。

そこで、チームでの開発では、記述ルールを設けて、`require_once()` 関数で読み込んでよいものを決めておくとよい。

#### ▼ クラスから関数をコール

```injectablephp title="PHP の場合の実装例"
<?php

class Foo
{
    const VALUE = "これは定数です。";

    public function className(): string
    {
        return "foo関数です。";
    }
}
```

```injectablephp title="PHP の場合の実装例"
<?php

// 外部ファイル名を指定して、クラスを読み込む。
require_once("Foo.php");

class Bar
{
    public function method(): void
    {
        $e1 = new Foo;
        $e1->className();
    }
}
```

#### ▼ クラスから定数をコール

```injectablephp title="PHP の場合の実装例"
<?php

// 外部ファイル名を指定して、クラスを読み込む。
require_once("Foo.php");

class Bar
{
    public function method(): mixed
    {
        // Fooクラスの定数を出力。
        return Foo::VALUE;
    }
}
```

#### ▼ 非クラスから関数をコール

```injectablephp title="PHP の場合の実装例"
<?php

function printTest(): string {
    return  "test";
}
```

```injectablephp title="PHP の場合の実装例"
<?php

// 外部ファイル名を指定して読み込む。
require_once ("printTestFunction.php");

printTest();
```

<br>

### `use` によるクラスの読み出し

#### ▼ `use` とは

Composer のオートロード機能を有効化したうえで、外部ファイルのクラスの `namespace` を `use` で指定するのみで、そのクラスのみを読み込める。

非クラスを読み込むことはできない。

動的な値は持たず、静的に読み込むことに注意。

ただし、チームの各エンジニアが好きなものを読み込んでいたら、スパゲッティコードになりかねない。

そこで、チームでの開発では、記述ルールを設けて、`use` で読み込んでよいものを決めておくとよい。

注意点として、composer のオートロードを使用しない場合、`require()` 関数と `use` の両方が必要である。

> - [PHPの名前空間とクラス名のエイリアス、オートロード：Web業界で働くためのPHP入門（終）（3/3 ページ） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/1808/01/news009_3.html)

#### ▼ 外部ファイルのクラスから関数をコール

クラスの `namespace` を `use` 文で指定する。

```injectablephp title="PHP の場合の実装例"
<?php

// 名前空間を定義。
namespace Domain\Foo;

class Foo
{
    // 定数を定義。
    const VALUE = "これは定数です。";

    public function method1(): string
    {
        return "foo関数です。";
    }
}
```

```injectablephp title="PHP の場合の実装例"
<?php

namespace Domain\Foo;

// namespaceを指定して、外部ファイルのクラスを読み込む。
use Domain\Foo;

class Bar
{
    public function method2(): void
    {
        $e1 = new Foo;
        $e1->method1();
    }
}
```

#### ▼ 外部ファイルのクラスから定数をコール

```injectablephp title="PHP の場合の実装例"
<?php

namespace Domain\Foo;

// namespaceを指定して、外部ファイルのクラスを読み込む。
use Domain\Foo;

class Bar
{
    public function method(): void
    {
        // Fooクラスの定数を出力。
        echo Foo::VALUE;
    }
}
```

<br>

