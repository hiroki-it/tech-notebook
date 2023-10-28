---
title: 【IT技術の知見】クラス＠PHP
description: クラス＠PHPの知見を記録しています。
---

# クラス＠PHP

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. has-one、has-many (データとして保持する関係性)

### has-one、has-manyな関係性とは

![データとして保持する関係性](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/データとして保持する関係性.png)

> - https://hiroki-it.github.io/tech-notebook/software/software_application_architecture_backend_object_orientation_design.html

<br>

### Association (関連)

#### ▼ Associationとは

クラスＡがクラスＢをデータとして保持する関係性のこと。

引数型/返却値型として使用する『依存』とは区別する。

#### ▼ Associationの種類

保持される側のクラスのインスタンスが、データとして保持する側のクラスによって作成されるか否かによって、『Aggregation』または『Composition』に分類できる。

<br>

### Aggregation (集約)

#### ▼ Aggregationとは

保持される側のクラスのインスタンスが、保持する側のクラスのインスタンスによって作成されずに外側から渡される時、クラス間が『Aggregation』の関係にある。

#### ▼ 例

![aggregation_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aggregation_example.png)

UserはUserNameをデータとして保持する。

```php
<?php

namespace App\Domain\User\Entity;

use App\Domain\User\ValueObject\UserName;

final class User
{
    /**
     * @var UserName
     */
    private UserName $name; // データとして保持

    /**
     * @param UserName $name
     */
    public function __construct(UserName $name)
    {
        $this->name = $name;
    }
}

```

また、UserNameクラスのインスタンスは、Userクラスによって作成されずに外側から渡される。

そのため、UserクラスとUserNameクラスは『Aggregation』の関係にある。

```php
<?php

$name = new UserName();
$user = new User($name); // 集約の関係
```

**＊実装例＊**

```php
<?php

use App\Domain\Car\Entity\Tire1;
use App\Domain\Car\Entity\Tire2;
use App\Domain\Car\Entity\Tire3;
use App\Domain\Car\Entity\Tire4;

class Car
{
    /**
     * @var Tire1
     */
    private $tire1;

    /**
     * @var Tire2
     */
    private $tire2;

    /**
     * @var Tire3
     */
    private $tire3;

    /**
     * @var Tire4
     */
    private $tire4;

    /**
     * @param Tire1 $t1
     * @param Tire2 $t2
     * @param Tire3 $t3
     * @param Tire4 $t4
     */
    public function __construct(Tire1 $t1, Tire2 $t2, Tire3 $t3, Tire4 $t4)
    {
        // Tireクラスのインスタンスをデータとして保持
        $this->tire1 = $t1;
        $this->tire2 = $t2;
        $this->tire3 = $t3;
        $this->tire4 = $t4;
    }
}
```

また、Tireクラスのインスタンスは、Carクラスによって作成されずに外側から渡される。

そのため、CarクラスとTireクラスは『Aggregation』の関係にある。

```php
<?php

// Tireクラスをインスタンス化
$tire1 = new Tire1();
$tire2 = new Tire2();
$tire3 = new Tire3();
$tire4 = new Tire4();

// Tireクラスのインスタンスの作成、Carによって制限されない。
$car = new Car($tire1, $tire2, $tire3, $tire4);
```

<br>

### Composition (合成)

#### ▼ Compositionとは

保持される側のクラスのインスタンスが、保持する側のクラスのインスタンスによって作成される時、クラス間が『Composition』の関係にある。

#### ▼ 例

**＊実装例＊**

![composition_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/composition_example.png)

UserクラスはUserNameクラスをデータとして保持する。

```php
<?php

namespace App\Domain\User\Entity;

use App\Domain\User\ValueObject\UserName;

final class User
{
    /**
     * @var UserName
     */
    private UserName $name; // データとして保持

    /**
     * @return string
     */
    public function method(): string
    {
        $name = new UserName(); // 合成の関係

        return "Hello! " . $name->getName();
    }
}

```

また、UserNameインスタンスは、Userクラスによって作成される。

そのため、UserクラスとUserNameクラスは『Composition』の関係にある。

```php
<?php

$user = new User();
```

**＊実装例＊**

CarクラスはLockクラスをデータとして保持する。

```php
<?php

class Car
{
    /**
     * @var Lock
     */
    private $lock;

    public function __construct()
    {
        // Lockクラスのインスタンスをデータとして保持。
        $this->lock = new Lock();
    }
}
```

また、Lockクラスのインスタンスは、Carクラスによって作成される。

そのため、CarクラスとLockクラスは『Composition』の関係にある。

```php
<?php

// Carクラスのインスタンスの中で、Lockクラスがインスタンス化される。
$car = new Car();
```

<br>

## 02. is-a-kind-of (グループとメンバーの関係性)

### is-a-kind-ofな関係性とは

![グループとメンバーの関係性](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/グループとメンバーの関係性.png)

> - https://hiroki-it.github.io/tech-notebook/software/software_application_architecture_backend_object_orientation_design.html

<br>

### Generalization (汎化)

#### ▼ 汎化におけるOverride

汎化の時、子クラスでメソッドの処理内容を再び実装すると、処理内容は上書きされる。

**＊実装例＊**

```php
<?php

// 親クラス
class Goods
{
    // 商品名データ
    private $name = "";

    // 商品価格データ
    private $price = 0;

    // コンストラクタ。商品名と商品価格を設定する
    public function __construct(string $name, int $price)
    {
        $this->name = $name;
        $this->price = $price;
    }

    // ★★★★★★注目★★★★★★
    // 商品名と価格を表示するメソッド
    public function printPrice(): void
    {
        print($this->name."の価格: ￥".$this->price."<br>");
    }

    // 商品名のゲッター
    public function getName(): string
    {
        return $this->name;
    }

    // 商品価格のゲッター
    public function getPrice(): int
    {
        return $this->price;
    }
}
```

```php
<?php

// 子クラス
class GoodsWithTax extends Goods
{
    // ★★★★★★注目★★★★★★
    // printPriceメソッドをOverride
    public function printPrice()
    {
        // 商品価格の税込み価格を計算し、表示
        $priceWithTax = round($this->getPrice() * 1.08);  // (1)
        print($this->getName()."の税込み価格: ￥".$priceWithTax."<br>");  // (2)
    }
}
```

#### ▼ 抽象クラス

ビジネスロジックとして使用する。

多重継承できない。

**＊例＊**

以下の条件の社員オブジェクトを実装したいとする。

`(1)`

: 午前９時に出社

`(2)`

: 営業部・開発部・総務部があり、それぞれが異なる仕事を行う

`(3)`

: 午後６時に退社

この時、『働くメソッド』は部署ごとに異なってしまうが、どう実装したら良いのか…

![抽象クラスと抽象メソッド-1](https://user-images.githubusercontent.com/42175286/59590447-12ff8b00-9127-11e9-802e-126279fcb0b1.PNG)

これを解決するために、例えば、次の2つが実装方法が考えられる。

`(1)`

: 営業部社員オブジェクト、開発部社員オブジェクト、総務部社員オブジェクトを別々に実装

⇒ メリット：同じ部署の他のオブジェクトに影響を与えられる。

⇒ デメリット：各社員オブジェクトで共通の処理を個別に実装しなければならない。

共通の処理が同じコードで書かれる保証がない。

`(2)`

: `1`個の社員オブジェクトの中で、働くメソッドに部署ごとで変化する引数を設定

⇒ メリット：全部署の社員を`1`個のオブジェクトで呼び出せる。

⇒ デメリット：`1`個の修正が、全部署の社員の処理に影響を与えてしまう。

抽象オブジェクトと抽象メソッドを使用すると、`2`個のメリットを生かしつつ、デメリットを解決可能。

![抽象クラスと抽象メソッド-2](https://user-images.githubusercontent.com/42175286/59590387-e8adcd80-9126-11e9-87b3-7659468af2f6.PNG)

**＊実装例＊**

```php
<?php

// 抽象クラス。型として提供したいものを定義する。
abstract class ShainManagement
{
    // 定数の定義
    const TIME_TO_ARRIVE = strtotime("10:00:00");
    const TIME_TO_LEAVE = strtotime("19:00:00");

    // 抽象メソッド。
    // 処理内容を子クラスでOverrideしなければならない。
    abstract function toWork();

    // 具象メソッド。出勤時刻を表示。もし遅刻していたら、代わりに差分を表示。
    // 子クラスへそのまま継承される。子クラスでオーバーライドしなくても良い。
    public function toArrive()
    {
        $nowTime = strtotime( date("H:i:s") );

        // 出社時間より遅かった場合、遅刻と表示する。
        if($nowTime > self::TIME_TO_ARRIVE){

            return sprintf(
                "%s の遅刻です。",
                date("H時i分s秒", $nowTime - self::TIME_TO_ARRIVE)
            );
        }

        return sprintf(
            "%s に出勤しました。",
            date("H時i分s秒", $nowTime)
        );

    }

    // 具象メソッド。退社時間と残業時間を表示。
    // 子クラスへそのまま継承される。子クラスでオーバーライドしなくても良い。
    public function toLeave()
    {
        $nowTime = strtotime( date("H:i:s") );

        return sprintf(
            "%sに退社しました。%s の残業です。",
            date("H時i分s秒", $nowTime),
            date("H時i分s秒", $nowTime - self::TIME_TO_LEAVE)
        );
    }
}
```

```php
<?php

// 子クラス
class EnginnerShainManagement extends ShainManagement
{
    // 鋳型となった抽象クラスの抽象メソッドはOverrideしなければならない。
    public function toWork()
    {
        // 処理内容
    }
}
```

**＊例＊**

プリウスと各世代プリウスが、抽象クラスと子クラスの関係にある。

![抽象クラス](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/抽象クラス.png)

<br>

### Realization (実現)

#### ▼ Realizationとは

実装クラスが正常に動作するために最低限必要なメソッドの実装を強制する。

これによって、必ず実装クラスを正常に働かせられる。

**＊例＊**

オープンソースのパッケージは、ユーザーが実装クラスを自身で追加実装することも考慮して、Realizationを使用している。

**＊例＊**

各車は、モーター機能を必ず持っていなければ、正常に働けない。

そこで、モータ機能に最低限必要なメソッドの実装を強制する。

![インターフェースとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/インターフェースとは.png)

実装クラスに処理内容を記述しなければならない。

すなわち、抽象クラスにメソッドの型のみ定義した場合と同じである。

多重継承できる。

![子インターフェースの多重継承_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/子インターフェースの多重継承_2.png)

**＊実装例＊**

```php
<?php

interface Animal
{
     // インターフェイスでは、実装を伴うメソッドやデータの宣言はできない
     public function eat();
     public function sleep();
     public function mating();
}
```

```php
<?php

class Mammal implements Animal
{
    // 実装クラスが正常に動作するために最低限必要なメソッドの実装を強制する。
     public function eat()
     {
          // 食べる
     }

     public function sleep()
     {
          // 眠る
     }

     public function mating()
     {
          // 交尾する
     }
}
```

<br>

### 通常クラス、抽象クラス、インターフェースの違い

|                                | 通常クラス       | 抽象クラス                   | インターフェース                                                                                               |
| ------------------------------ | :--------------- | :--------------------------- | :------------------------------------------------------------------------------------------------------------- |
| **役割**                       | 専用処理の部品化 | 通常クラスの共通処理の部品化 | ・通常クラスのクラス型を定義する。<br>・実装クラスが正常に動作するために最低限必要なメソッドの実装を強制する。 |
| **子クラスでの継承先数**       | 単一継承         | 単一継承                     | 単一継承｜多重継承                                                                                             |
| **メンバ変数のコール**         | 自身と継承先     | 継承先のみ                   | 実装先のみ                                                                                                     |
| **定数の定義**                 | 〇               | 〇                           | 〇                                                                                                             |
| **抽象メソッドの定義**         | ✕                | 〇                           | 〇 (abstractは省略)                                                                                            |
| **具象メソッドの定義**         | 〇               | 〇                           | ✕                                                                                                              |
| **`construct`メソッド の定義** | 〇               | 〇                           | ✕                                                                                                              |

**＊例＊**

`(1)`

: 種々の車クラスの共通処理のを持つ抽象クラスとして、Carクラスを作成。

`(2)`

: 各車は、エンジン機能を必ず持っていなければ、正常に働けない。

     そこで、抽象メソッドによって、エンジン機能に最低限必要なメソッドの実装を強制する。

![インターフェースと抽象クラスの使い分け](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/インターフェースと抽象クラスの使い分け.png)

<br>

## 02-02. 継承

### 継承によるクラスチェーン

#### ▼ クラスチェーンとは

クラスからデータやメソッドをコールした時、そのクラスにこれらが存在しなければ、継承元まで参照しにいく仕組みを『クラスチェーン』という。

類似するものとして、プロトタイプチェーンは以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/language/language_js_prototype_based.html
> - https://hiroki-it.github.io/tech-notebook/language/language_js_prototype_based_method_data.html

**＊実装例＊**

```php
<?php

// 継承元クラス
class Foo
{
    private $value1;

    public function getValue()
    {
        return $this->value1;
    }
}
```

```php
<?php

// 継承先クラス
class SubFoo extends Foo
{
    public $subValue;

    public function getSubValue()
    {
        return $this->subValue;
    }
}
```

```php
<?php

$subFoo = new SubFoo;

// SubFooクラスにはgetValue()は無い。
// 継承元まで辿り、Fooクラスからメソッドがコールされる (クラスチェーン) 。
echo $subFoo->getValue();
```

<br>

### 継承元のメソッドを参照

**＊実装例＊**

```php
<?php

abstract class Foo
{
    public function foo()
    {
        // 処理内容;
    }
}
```

```php
<?php

class SubFoo extends Foo
{
    public function subFoo()
    {
        // 継承元のメソッドを参照。
        $foo = parent::foo();
    }
}
```

<br>

### Trait

#### ▼ Traitとは

![Trait](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Trait.png)

再利用したいメソッドやデータを部品化し、利用したい時にクラスに取り込む。

Traitを使用する時は、クラス内でTraitをuse宣言する。

Trait自体は不完全なクラスであり、インスタンス化できない。

また、親クラスでトレイトを読み込むと、子クラスでもトレイトを使用できる。

**＊実装例＊**

```php
<?php

trait FooTrait
{
    public function foo()
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

#### ▼ マジックメソッドを禁止するTrait

マジックメソッドを使用すると、処理が多くなるため、性能が悪くなる。

そこで、各クラスでtraitを使用して、マジックメソッドをコールした時に、開発者向けにエラーが発生させる。

**＊実装例＊**

マジックゲッターメソッドとマジックセッターメソッドがコールされることを禁止する。

```php
<?php

declare(strict_types=1);

namespace App\Traits;

/**
 * 使用制限マジックメソッドトレイト
 */
trait UnsupportedMagicMethodTrait
{
    /**
     * 性能の観点から、マジックゲッターメソッドの使用を制限します。


     *
     * @param $name
     * @throws \Exception
     */
    public function __get($name)
    {
        throw new \Exception("This method is not supported");
    }

    /**
     * 性能の観点から、マジックセッターメソッドの使用を制限します。


     *
     * @param $name
     * @param $value
     * @throws \Exception
     */
    public function __set($name, $value)
    {
        throw new \Exception("This method is not supported");
    }
}
```

<br>

## 02-03. 委譲

### 委譲によるメソッドコール

#### ▼ 委譲とは

処理の一部または全てを他のクラスに託すこと。

PHPでは、集約や合成の関係性を作り、委譲先クラスのメソッドでは委譲元のコールして、処理を追加実装することに相当する。

他に、インターフェースによるRealizationの関係性でも実現できる。

#### ▼ 継承よりも優れた点

> - https://qiita.com/sonatard/items/2b4b70694fd680f6297c#3-%E3%81%9D%E3%82%82%E3%81%9D%E3%82%82%E4%BD%95%E6%95%85go%E3%81%AF%E7%B6%99%E6%89%BF%E3%82%92%E5%BB%83%E6%AD%A2%E3%81%97%E3%81%A6%E5%A7%94%E8%AD%B2%E3%82%92%E6%8E%A8%E5%A5%A8%E3%81%97%E3%81%A6%E3%81%84%E3%82%8B%E3%81%AE%E3%81%8B

<br>

## 02-04. 外部ファイルの読み出し

### `require_once`メソッドによる、クラス、非クラスのメソッドの読み出し

#### ▼ `require_once`メソッドとは

外部ファイルとして定義された、クラス、非クラスのメソッド、を一度だけ読み込める。

動的な値は持たず、静的に読み込むことに注意。

ただし、チームの各エンジニアが好きな物を読み込んでいたら、スパゲッティコードになりかねない。

そこで、チームでの開発では、記述ルールを設けて、`require_once`メソッドで読み込んで良いものを決めておくと良い。

#### ▼ クラスからメソッドをコール

```php
<?php

class Foo
{
    const VALUE = "これは定数です。";

    public function className()
    {
        return "fooメソッドです。";
    }
}
```

```php
<?php

// 外部ファイル名を指定して、クラスを読み込む。
require_once("Foo.php");

class Bar
{
    public function method()
    {
        $e1 = new Foo:
        $e1->className();
    }
}
```

#### ▼ クラスから定数をコール

```php
<?php

// 外部ファイル名を指定して、クラスを読み込む。
require_once("Foo.php");

class Bar
{
    public function method()
    {
        // Fooクラスの定数を出力。
        return Foo::VALUE;
    }
}
```

#### ▼ 非クラスからメソッドをコール

```php
<?php

function printTest() {
    return  "test";
}
```

```php
<?php

// 外部ファイル名を指定して読み込む。
require_once ("printTestFunction.php");

printTest();
```

<br>

### `use`によるクラスの読み出し

#### ▼ `use`とは

Composerのオートロード機能を有効化した上で、外部ファイルのクラスの`namespace`を`use`で指定するのみで、そのクラスのみを読み込める。

非クラスを読み込むことはできない。

動的な値は持たず、静的に読み込むことに注意。

ただし、チームの各エンジニアが好きな物を読み込んでいたら、スパゲッティコードになりかねない。

そこで、チームでの開発では、記述ルールを設けて、`use`で読み込んで良いものを決めておくと良い。

注意点として、composerのオートロードを使用しない場合、`require`関数と`use`の両方が必要である。

> - https://atmarkit.itmedia.co.jp/ait/articles/1808/01/news009_3.html

#### ▼ 外部ファイルのクラスからメソッドをコール

クラスの`namespace`を`use`文で指定する。

**＊実装例＊**

```php
<?php

// 名前空間を定義。
namespace Domain\Foo;

class Foo
{
    // 定数を定義。
    const VALUE = "これは定数です。";

    public function method1()
    {
        return "fooメソッドです。";
    }
}
```

```php
<?php

namespace Domain\Foo;

// namespaceを指定して、外部ファイルのクラスを読み込む。
use Domain\Foo;

class Bar
{
    public function method2()
    {
        $e1 = new Foo:
        $e1->method1();
    }
}
```

#### ▼ 外部ファイルのクラスから定数をコール

**＊実装例＊**

```php
<?php

namespace Domain\Foo;

// namespaceを指定して、外部ファイルのクラスを読み込む。
use Domain\Foo;

class Bar
{
    public function method()
    {
        // Fooクラスの定数を出力。
        echo Foo::VALUE;
    }
}
```

<br>

## 03. use (引数型/返却値型として使用する関係性)

### useな関係とは

> - https://hiroki-it.github.io/tech-notebook/software/software_application_architecture_backend_object_orientation_design.html

<br>

### Dependency (依存)

#### ▼ Dependencyとは

![引数型または返却値型として使用する関係性](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/引数型または返却値型として使用する関係性.png)

クラスＡがクラスＢを引数型/返却値型として使用する関係性のこと。

> - https://stackoverflow.com/questions/1230889/difference-between-association-and-dependency
> - https://stackoverflow.com/questions/41765798/difference-between-aggregation-and-dependency-injection

#### ▼ 例

**＊実装例＊**

![dependency_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/dependency_example.png)

UserはUserNameを引数として使用する。

UserはUserNameに依存している。

```php
<?php

namespace App\Domain\User\Entity;

use App\Domain\User\ValueObject\UserName;

final class User
{
    /**
     * @param UserName $name
     * @return string
     */
    public function method(UserName $name): string // 依存の関係
    {
        return "Hello! " . $name->getName();
    }
}
```

<br>

### DI：Dependency Injection (依存オブジェクト注入)

#### ▼ DIとは

サプライヤー側 (依存先) の『インスタンス』を、クライアント側のインスタンスの外部から『引数として』注入する実装方法。

『依存性注入』と訳すのは混乱を招くため、『依存オブジェクト注入』と訳すようにする。

> - https://en.wikipedia.org/wiki/Dependency_injection#Types_of_dependency_injection
> - https://little-hands.hatenablog.com/entry/2018/05/27/dependency-injection

#### ▼ コンストラクタインジェクションとは

メソッドの特に、`construct`メソッド の引数として、サプライヤー側のインスタンスを注入する。

サプライヤー側をデータとして保持させ、Aggregationの関係性を作られる。

コンストラクタインジェクションのみが、`construct`メソッド によって、インスタンス作成のために依存関係の要件を強制できる。

また、セッターを完全になくした場合、インスタンス作成後にオブジェクトの状態を変更できなくなる。

そのため、ビジネス上ありえないオブジェクトを作成できなくなり、インジェクションの中で、ソフトウェアの安全性の観点で最も優れている。

**＊実装例＊**

依存先のSupplierクラスを、`construct`メソッドの引数として、Clientクラスに注入する。

```php
<?php

$supplier = new Supplier();

// 依存されるSupplierクラスをClientクラス
$client = new Client($supplier);
```

**＊実装例＊**

依存先のUserNameクラスを、`construct`メソッドの引数として、Userクラスに注入する。

```php
<?php

namespace App\Domain\User\Entity;

use App\Domain\User\ValueObject\UserName;

final class User
{
    /**
     * @var UserName
     */
    private UserName $name;

    /**
     * @param UserName $name
     */
    public function __construct(UserName $name)
    {
        $this->name = $name;
    }
}
```

```php
<?php

$name = new UserName();
$user = new User($name); // インジェクション
```

#### ▼ セッターインジェクションとは

メソッドの特に、セッターの引数として、サプライヤー側のインスタンスを注入する。

サプライヤー側をデータとして保持させ、Aggregationの関係性を作られる。

**＊実装例＊**

依存先のSupplierクラスを、セッターの引数として、Clientクラスに注入する。

```php
<?php

$supplier = new Supplier();
$client = new Client();

// ClientクラスはSuppierクラスに依存している。
$client->setSupplier($supplier)
```

**＊実装例＊**

依存先のUserNameクラスを、セッターの引数として、Userクラスに注入する。

```php
<?php

namespace App\Domain\User\Entity;

use App\Domain\User\ValueObject\UserName;

final class User
{
    /**
     * @var UserName
     */
    private UserName $name;

    /**
     * @param UserName $name
     */
    public function setUserName(UserName $name)
    {
        $this->name = $name;
    }
}
```

```php
<?php

$user = new User();
$name = new UserName();
$user->setUserName($name); // インジェクション
```

#### ▼ メソッドインジェクションとは

上記2つ以外のメソッドの引数として、サプライヤー側のインスタンスを注入する。

サプライヤー側をデータとして保持せず、読み込んでメソッドを使用する。

**＊実装例＊**

依存先のUserNameクラスを、メソッドの引数として、Userクラスに注入する。

```php
<?php

namespace App\Domain\User\Entity;

use App\Domain\User\ValueObject\UserName;

final class User
{
    /**
     * @param UserName $name
     */
    public function method(UserName $name)
    {
        $name = $name->getName();

        // 何らかの処理
    }
}
```

```php
<?php

$user = new User();
$name = new UserName();
$user->method($name); // インジェクション
```

<br>

### DI Container (依存オブジェクト注入コンテナ) 、Service Container

#### ▼ DI Container (依存オブジェクト注入コンテナ) 、Service Containerとは

依存オブジェクト注入の責務に特化したデザインパターンを『Service Container』という。

あらかじめクラスを登録 (バインド) しておき、必要な時にインスタンスを作成 (リゾルブ) してくれる。

注意点として、

**＊実装例＊**

Pimpleパッケージを使用した場合

```php
<?php

use Pimple\Container;
use App\Domain\User\Entity\User;
use App\Domain\User\ValueObject\UserName;

class Container
{
    public function __construct()
    {
        // UserNameクラスの準備
        $container["user_name"] = function ($container) {
            return new UserName("Hiroki");
        };

        // UserクラスにUserNameクラスを注入
        $container["user"] = function ($container) {
            return new User($container["user_name"]);
        };
    }
}
```

```php
<?php

// autoload.php で、DIコンテナ自体のインスタンスを事前に作成。
$container = new Container();
```

```php
<?php

// DIコンテナの読み出し
require_once __DIR__ . "/autoload.php";

// クラス名を宣言してインスタンスを作成。
$sample = $container["sample"];
```

#### ▼ アンチパターンのService Locater Pattern

インスタンスへのコンテナ渡しのファイルを実装せず、コンテナ自体を注入していまう誤った実装方法。

**＊実装例＊**

```php
<?php

class Sample
{
    public function __construct($container)
    {
        $this->logger            = $container["foo.logger"];
        $this->notification      = $container["bar.notification"];
    }
}
```

```php
<?php

// DIコンテナ自体をインジェクションしてしまうと、不要なインスタンスにも依存してしまう。
$sample = new Sample($container);
```

<br>

## 03-02. Dependency Inversion Principle (依存性逆転の原則)

### DIP

#### ▼ DIPとは

インターフェースに依存するように実装する。

『逆転』とは、インターフェースを使用した場合、より下位層の実装クラスが上位層のインターフェイスに依存していることを指して言う。

`2`個の原則からなる。

#### ▼ 原則1

上位レイヤーは下位レイヤーに依存してはならない。

どちらのレイヤーも『抽象』に依存すべきである。

#### ▼ 原則2

『抽象』は『実装』に依存してはならない。

『実装』が『抽象』に依存すべきである。

<br>

### DIPを満たす実装

#### ▼ DIPを満たさない実装の場合 (従来)

より上位レイヤーのコール処理を配置し、より下位レイヤーでコールされる側の定義を行う。

これによって、上位レイヤーのクラスが、下位レイヤーのクラスに依存する関係性になる。

![DIPに基づかない設計の場合](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/DIPに基づかない設計の場合.png)

#### ▼ DIPを満たす実装の場合

インターフェース (または抽象クラス) で抽象メソッドを記述することによって、実装クラスでの実装が強制される。

つまり、実装クラスは抽象クラスに依存している。

より上位レイヤーにインターフェースを配置することによって、下位レイヤーのクラスが上位レイヤーのクラスに依存しているような逆転関係を作られる (原則２)。

原則２でいう依存は、引数型/返却値型として使用する関係性の文脈でいう『依存』ではないことに注意する。

また、実装クラスをインターフェースをエイリアスとしてコールでききるようにすると、実装クラスに依存するレイヤーは代わりにインターフェースに依存することになる。

よって、全てのレイヤーがインターフェースに依存するようになる (原則１)。

> - https://speakerdeck.com/hiroki_hasegawa/domeinqu-dong-she-ji-falseakitekutiyabian-qian-toyi-cun-xing-ni-zhuan-falseyuan-ze

![DIPに基づく設計の場合](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/DIPに基づく設計の場合.png)

#### ▼ DIPに基づくドメイン駆動設計の場合

`(1)`

: Repositoryクラスにインターフェースと実装クラスを用意する。これにより、原則２を満たす。

`(2)`

: Repositoryのインターフェース (抽象クラス) を、より上位のドメイン層に配置する。また、Repositoryの実装クラスを、より下位のインフラストラクチャ層に配置する。

`(3)`

: 両方のクラスに対して、バインディング (紐付け) を行い、インターフェース (抽象クラス) をコールした時に、実際には実装クラスがコールされるようにする。

`(4)`

: ２と３により、インフラストラクチャ層とユースケース層の両方が、ドメイン層のインターフェース (抽象クラス) に依存することになる。これは、原則１を満たす。

![ドメイン駆動設計_逆転依存性の原則](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ドメイン駆動設計_依存性逆転の原則.jpg)

<br>

### DIPのメリット

#### ▼ 実装リポジトリの差し替えが簡単

実装リポジトリはインターフェースに依存し、特定のメソッドの実装が強制されている。

ここで実装リポジトリを異なるものに差し替えたとしても、もう一方でインターフェースに依存するユースケースは、インターフェースのメソッドのコール方法を変える必要がない。

つまり、ユースケース層に影響を与えることなく、実装リポジトリのリファクタリングや新しい実装リポジトリへの移行が行える。

#### ▼ リポジトリが対象とする集約の単位がわかりやすい

ドメイン層にインターフェースリポジトリを配置する例を考える。

インターフェースリポジトリは、実装リポジトリよりも定義が簡潔である。

そのため、実装リポジトリではなくインターフェースリポジトリを確認することにより、そのリポジトリがどの集約に対してCRUD処理を行うのかを認識しやすい。

<br>

## 04. モジュール性

### 結合度

#### ▼ 結合度とは

依存には、引数の渡し方によって、程度がある。

それによって、処理を、どのクラスのデータと操作に振り分けていくかが決まる。

結合度はモジュール間の依存度合いについて使用される用語であるが、より理解しやすくするために、特にクラスを使用して説明する。

#### ▼ データ結合とは

最も理想的な結合。

スカラ型のデータをサプライヤー側として、クライアント側のインスタンスの引数として渡すような関係。

**＊実装例＊**

ModuleAとModuleBは、データ結合の関係にある。

```php
<?php

class ModuleA // コールされる側
{
    public function methodA(int $a, int $b, string $c)
    {
        return "$a + $b".$c;
    }
}
```

```php
<?php

class ModuleB // コールする側
{
    public function methodB()
    {
        $moduleA= new ModuleA();
        $result = $moduleA->methodA(1, 2, "です."); // スカラ型データを渡すだけ
    }
}
```

**＊実装例＊**

デザインパターンのFactoryクラスでは、スカラ型データの値に応じて、インスタンスを作り分ける。

Factoryクラスのインスタンスと、これをコールする他インスタンス は、データ結合の関係にある。

```php
<?php

/**
 * コールされる側
 *
 * 距離に応じて、移動手段のオブジェクトを作り分けるファクトリクラス
 */
class TransportationMethodsFactory
{
    public static function createInstance($distance)
    {
        $walking = new Walking($distance);
        $car = new Car($distance);

        if($walking->needsWalking()) {
            return $walking;
        }

        return $car;
    }
}
```

#### ▼ スタンプ結合とは

object型のデータをサプライヤー側として、クライアント側のインスタンスの引数として渡す関係。

**＊実装例＊**

ModuleAとModuleBは、スタンプ結合の関係にある。

```php
<?php

class Shared
{
    private $value;

    public function __construct(int $value)
    {
        $this->value = $value;
    }


    public function getValue()
    {
        return $this->value;
    }
}
```

```php
<?php

class ModuleA
{
    public function methodA()
    {
        $shared = new Shared(1);

        $moduleB = new ModuleB;

        return $moduleB->methodB($shared); // 1
    }
}
```

```php
<?php

class ModuleB
{
    public function methodB(Shared $shared)
    {
        return $shared->getValue(); // 1
    }
}
```

<br>

### 凝集度

#### ▼ 凝集度とは

凝集度は、『モジュール内の責務の統一度合い』について使用される用語であるが、より理解しやすくするために、特にクラスを使用して説明する。

#### ▼ 機能的強度

最も理想的な凝集。

クラスの責務が機能単位になるように、ロジックを振り分ける。

#### ▼ LCOM：Lack Of Conhension of Methods

凝集度の程度を表す指標のこと。

LCOMの計測方法にはいくつか種類がある。

LCOM4は、クラスの各メソッド内で、保持する全てのデータにアクセスしているほど、凝集度が高いと見なす方法である。

> - https://www.amazon.co.jp/dp/B082WXZVPC
> - https://qiita.com/fujiharuka/items/65125592bd31e2a1c16d

<br>

### コナーセンス

#### ▼ 静的コナーセンス

コードの実行前の結合度のこと。

#### ▼ 動的コナーセンス

コードの実行時の結合度のこと。

<br>

### 低結合と高凝集

各モジュールは、結合度が低く、凝集度が高いほど良い。

例として、以下の画像では、道具モジュールを、キッチン引き出しモジュールとガレージ工具箱モジュールに分け、各クラスの結合度を低く、凝集度を高くするように対応している。

![低結合度高凝集度](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/低結合度高凝集度.png)

<br>
