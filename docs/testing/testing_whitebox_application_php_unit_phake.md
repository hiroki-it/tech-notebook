---
title: 【IT技術の知見】Phake＠PHP単体テスト
description: Phake＠PHP単体テストの知見を記録しています。
---

# Phake＠PHP単体テスト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Phakeとは

単体テストに必要なテストダブルを提供する。

> - https://github.com/mlively/Phake#phake

<br>

## 02. テストダブル

### `mock`メソッド

クラスの名前空間を元に、モックまたはスタブとして使用する擬似オブジェクトを作成する。

以降の処理での用途によって、モックまたはスタブの呼び名が異なることに注意する。

```php
<?php

// モックとして使用する擬似オブジェクトを作成する。
$mock = Phake::mock(Foo::class);

// スタブとして使用する擬似オブジェクトを作成する。
$stub = Phake::mock(Foo::class);
```

<br>

### `when`メソッド

モックまたはスタブのメソッドに対して、処理の内容を定義する。

また、特定の変数が渡された時に、特定の値を返却させられる。

**＊実装例＊**

スタブの`find`メソッドは、`1`が渡された時に、空配列を返却する。

```php
<?php

// スタブとして使用する擬似オブジェクトを作成する。
$stub = Phake::mock(Foo::class);

// スタブのメソッドに処理内容を定義する。
\Phake::when($stub)
    ->find(1)
    ->thenReturn([]);
```

<br>

### `verify`メソッド

上層オブジェクトが下層オブジェクトをコールできることを確認するために、モックのメソッドが`n`回実行できたことを検証する。

**＊実装例＊**

```php
<?php

use PHPUnit\Framework\TestCase;

class FooTest extends TestCase
{
   /**
    * @test
    */
    public function testFoo_Bar_Baz()
    {
        // モックとして使用する擬似オブジェクトを作成する。
        $mockFooRepository = Phake::mock(FooRepository::class);
        $fooId = Phake::mock(FooId::class);

        // モックのメソッドに処理内容を定義する。
        \Phake::when($mockFooRepository)
            ->find($fooId)
            ->thenReturn(new User(1));

        // 上層クラスに対して、下層クラスのモックのインジェクションを実行する
        $foo = new Foo($mockFooRepository);

        // 上層クラスの内部にある下層モックのfindメソッドをコールする
        $foo->getUser($fooId)

        // 上層のクラスが、下層モックにパラメーターを渡し、メソッドを実行したことを検証する。
        Phake::verify($mockFooRepository, Phake::times(1))->find($fooId);
    }
}
```

<br>
