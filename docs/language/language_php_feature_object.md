---
title: 【IT技術の知見】オブジェクト
description: オブジェクトの知見を記録しています。
tags:
  - "言語"
  - "PHP"
  - "言語機能"
---

# オブジェクト

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 振る舞いと状態 (プロパティ)

### 注意

本資料の以降では、振る舞い (関数) と状態 (プロパティ) に分けて、説明していく。

<br>

### 関数

#### ▼ 関数とは

クラスは、状態を使用して振る舞う。

振る舞いの処理を関数またはメソッドという。

```injectablephp
<?php

class Foo
{
    // オブジェクトはデータを保持する。
    private mixed $state = null;

    public function state(): mixed
    {
        return $this->state;
    }
}
```

<br>

### 状態 (プロパティ)

#### ▼ 状態 (プロパティ) とは

クラスは、状態を持つ。

この状態はプロパティとも呼ばれる。

本ノートでは、状態であることを意識するために、プロパティという言葉を使用しないものとする。

```injectablephp
<?php

class Foo
{
    private mixed $state = null;

    // 自身が持つ状態を操作する.
    public function state(): mixed
    {
        return $this->state;
    }
}
```

<br>

## 02. 振る舞いと状態のカプセル化

### public

#### ▼ `public` とは

どのオブジェクトでも呼び出せる。

#### ▼ オブジェクト指向の場合

```injectablephp
<?php

class Foo
{
    public mixed $state = null;

    public function __construct(mixed $state)
    {
        $this->state = $state;
    }

    public function state(): mixed
    {
        return $this->state;
    }
}
```

#### ▼ 関数型の場合

オブジェクトのすべてのデータが `public` であるなら、オブジェクト指向における隠蔽のメリットは、特にないかもしれない。

```injectablephp
<?php

function foo(mixed $state): mixed{
    return $state;
}

$state = "状態";
foo($state);
```

<br>

### protected

・`protected` とは

同じクラス内と、その子クラス、その親クラスのみで呼び出せる。

> - [【PHP】継承とprotectedと参照パターン #Java - Qiita](https://qiita.com/miyapei/items/6c43e8b38317afb5fdce)

#### ▼ オブジェクト指向の場合

親クラス次第ではあるが、処理で `$state` の中身を隠蔽できる。

```injectablephp
<?php

class Foo extends ParentFoo
{
    public function __construct(mixed $state)
    {
        $this->state = $state;
    }

    public function foo(): mixed
    {
        // dataは親で定義されている
        return $this->state;
    }
}
```

#### ▼ 関数型の場合

処理で、`$state` の中身を隠蔽できないため、危険である。

```injectablephp
<?php

function foo(mixed $state): mixed{
    return $state;
}

$state = "状態";
foo($state);
```

<br>

### private

・`private` とは

同じオブジェクト内のみで呼び出せる。

オブジェクト指向のメリットを最大限に得られる機能である。

#### ▼ オブジェクト指向の場合

処理で、`$state` の中身を隠蔽できる。

カプセル化を参照。

```injectablephp
<?php

class Foo
{
    private mixed $state = null;

    public function __construct(mixed $state)
    {
        $this->state = $state;
    }

    public function foo(): string
    {
        return $this->state.$this->Desu();
    }

    // クラス内からしかアクセスできない
    private function Desu(): string
    {
        return "です。";
    }
}
```

#### ▼ 関数型の場合

処理で、`$state` の中身を隠蔽できないため、危険である。

```injectablephp
<?php

function foo(mixed $state): mixed{
    return $state;
}

$state = "状態";
foo($state);
```

#### ▼ Encapsulation (カプセル化)

カプセル化とは、ソフトウェアの実装方法を外部から隠すこと。

オブジェクト内のデータにアクセスするには、直接的にデータは処理できず、オブジェクト内の関数をコールし、アクセスしなければならない。

![カプセル化](https://user-images.githubusercontent.com/42175286/59212717-160def00-8bee-11e9-856c-fae97786ae6c.gif)

<br>

### static

#### ▼ `static` とは

別ファイルでの関数の呼び出しにはインスタンス化が必要である。

しかし、static 修飾子をつけることにより、インスタンス化しなくともコールできる。

状態は使用せず (静的) 、引数の値のみを使用して処理を実行する関数に対して使用する。

```injectablephp
<?php

class Foo
{
    // 受け取ったOrderエンティティから値を取り出すのみで、データ値は呼び出していない。
    public static function computeFooFee(Entity $order): Money
    {
        return new Money($order->fooFee);
    }
}
```

#### ▼ `self::`

```injectablephp
<?php

// ここに実装例
```

#### ▼ `static::`

```injectablephp
<?php

// ここに実装例
```

<br>

## 03. 継承

### Trait

#### ▼ Trait とは

![Trait](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Trait.png)

再利用したい関数や状態を部品化し、必要に応じてクラスに取り込む。

Trait を使用するときは、クラス内で Trait を use 宣言する。

Trait 自体は不完全なクラスであり、インスタンス化できない。

また、親クラスでトレイトを読み込むと、子クラスでもトレイトを使用できる。

```injectablephp title="PHP の場合の実装例"
<?php

trait FooTrait
{
    public function foo(): void
    {
        echo "Hello World";
    }
}

class Foo
{
    use FooTrait;
}

$foo = new Foo();
$foo->foo(); // Hello World

class Bar extends Foo {}

$bar = new Bar();
$bar->foo(); // Hello World
```

#### ▼ マジック関数を禁止する Trait

マジック関数を使用すると、処理が多くなるため、性能が悪くなる。

そこで、各クラスで trait を使用して、マジック関数をコールしたときに、開発者向けにエラーを発生させる。

マジックゲッター関数とマジックセッター関数がコールされることを禁止する。

```injectablephp title="PHP の場合の実装例"
<?php

declare(strict_types=1);

namespace App\Traits;

/**
 * 使用制限マジック関数トレイト
 */
trait UnsupportedMagicMethodTrait
{
    /**
     * 性能の観点から、マジックゲッター関数の使用を制限する
     *
     * @throws \Exception
     */
    public function __get(string $name): mixed
    {
        throw new \Exception("This method is not supported");
    }

    /**
     * 性能の観点から、マジックセッター関数の使用を制限する
     *
     * @throws \Exception
     */
    public function __set(string $name, mixed $value): void
    {
        throw new \Exception("This method is not supported");
    }
}
```

<br>

