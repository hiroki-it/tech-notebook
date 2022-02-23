---
title: 【知見を記録するサイト】メソッド/データ＠PHP
---

# メソッド/データ＠PHP

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. メソッド/データ（プロパティ）

本資料の以降では，大きく，操作（メソッド）とデータ（プロパティ）に分けて，説明していく．

### メソッド

#### ・メソッドとは

クラスは，データを操作する．この操作するための処理をメソッドという．

**＊実装例＊**

```php
<?php

class Foo
{
    // オブジェクトはデータを保持する．
    private $data;
  
    public function data()
    {
        return $this->data;
    }
}
```

<br>

### データ（プロパティ）

#### ・ データ（プロパティ）とは

クラスは，データを持つ．このデータはプロパティとも呼ばれる．本ノートでは，データであることを意識するために，プロパティという言葉を用いないものとする．

**＊実装例＊**

```php
<?php

class Foo
{
    private $data;

    // 自信が持つデータを操作する.
    public function data()
    {
        return $this->data;
    }
}
```

<br>


## 02. メソッドとデータのカプセル化

### public

#### ・```public```とは

どのオブジェクトでも呼び出せる．

#### ・オブジェクト指向の場合

**＊実装例＊**

```php
<?php

class Foo
{
    public $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function data()
    {
        return $this->data;
    }
}
```
#### ・オブジェクト指向でない場合

オブジェクトの全てのデータが```public```であるなら，オブジェクト指向における隠蔽のメリットは，特にないかもしれない．

**＊実装例＊**

```php
<?php

function foo($data){
    return $data;
}

$data = "データ";
foo($data);
```

<br>

### protected

・```protected```とは

同じクラス内と，その子クラス，その親クラスでのみ呼び出せる．

https://qiita.com/miyapei/items/6c43e8b38317afb5fdce

#### ・オブジェクト指向の場合

親クラス次第ではあるが，処理で```$data```の中身を隠蔽できる．

**＊実装例＊**

```php
<?php

class Foo extends ParentFoo
{
    public function __construct($data)
    {
        $this->data = $data;
    }

    public function foo()
    {
        // dataは親で定義されている 
        return $this->data;
    }
}
```
#### ・オブジェクト指向でない場合

処理で，```$data```の中身を隠蔽できないため，危険である．

**＊実装例＊**

```php
<?php
  
function foo($data){
    return $data;
}

$data = "データ";
foo($data);
```

<br>

### private

・```private```とは

同じオブジェクト内でのみ呼び出せる．オブジェクト指向のメリットを最大限に得られる機能である．

#### ・オブジェクト指向の場合

処理で，```$data```の中身を隠蔽できる．カプセル化を参照．

**＊実装例＊**

```php
<?php
  
class Foo
{
    private $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function foo()
    {
        return $this->data.$this->Desu();
    }
  
    // クラス内からしかアクセスできない
    private function Desu()
    {
        return "です．";
    }
}
```
#### ・オブジェクト指向でない場合

処理で，```$data```の中身を隠蔽できないため，危険である．

**＊実装例＊**

```php
<?php
  
function foo($data){
    return $data;
}

$data = "データ";
foo($data);
```


#### ・Encapsulation（カプセル化）

カプセル化とは，ソフトウェアの実装方法を外部から隠すこと．オブジェクト内のデータにアクセスするには，直接データを扱う事はできず，オブジェクト内のメソッドをコールし，アクセスしなければならない．

![カプセル化](https://user-images.githubusercontent.com/42175286/59212717-160def00-8bee-11e9-856c-fae97786ae6c.gif)

<br>

### static

#### ・```static```とは

別ファイルでのメソッドの呼び出しにはインスタンス化が必要である．しかし，static修飾子をつけることで，インスタンス化しなくともコールできる．データ値は用いず（静的），引数の値のみを用いて処理を行うメソッドに対して用いる．

**＊実装例＊**

```php
<?php

class Foo
{
    // 受け取ったOrderエンティティから値を取り出すだけで，データ値は呼び出していない．
    public static function computeFooFee(Entity $order): Money
    {
        return new Money($order->fooFee);
    }
}
```

#### ・```self::```

```php
// ここに実装例
```

#### ・```static::```

```php
// ここに実装例
```



<br>

## 02-02. メソッド

### まず読むべき記事

#### ・ゲッターとセッターをメソッド名のプレフィックスとすることは悪

和訳：https://www.kaitoy.xyz/2015/07/22/getters-setters-evil/

原典：https://www.yegor256.com/2014/09/16/getters-and-setters-are-evil.html

#### ・セッターによる依存性注入は悪

原典：https://www.yegor256.com/2014/10/03/di-containers-are-evil.html

<br>

### 値を取得するアクセサメソッドの実装

#### ・Getter

Getterでは，データを取得するだけではなく，何かしらの処理を加えたうえで取得すること．

**＊実装例＊**

```php
<?php
    
class ABC {

    private $property; 

    public function property()
    {
        // 単なるGetterではなく，例外処理も加える．
        if(!isset($this->property)){
            throw new ErrorException("データに値がセットされていません．");
        }
        return $this->property;
    }

}
```

<br>

### 値を設定するアクセサメソッドの実装

#### ・Setter

『Mutable』なオブジェクトを実現できる．

**＊実装例＊**

```php
<?php
    
class Test01 {

    private $property01;

    // Setterで$property01に値を設定
    public function setProperty($property01)
    {
        $this->property01 = $property01;
    }
}    
```

#### ・マジックメソッドの```__construct```メソッド

マジックメソッドの```__construct```メソッドを持たせることで，このデータを持っていなければならないとい制約を明示できる．Setterを持たせずに，```__construct```メソッドだけを持たせれば，ValueObjectのような，『Immutable』なオブジェクトを実現できる．

**＊実装例＊**

```php
<?php
    
class Test02 {

    private $property02;

    // コンストラクタで$property02に値を設定
    public function __construct($property02)
    {
        $this->property02 = $property02;
    }
}
```

#### ・『Mutable』と『Immutable』を実現できる理由

Test01クラスインスタンスの```$property01```に値を設定するためには，インスタンスからSetterをコールする．Setterは何度でも呼び出せ，その度にデータの値を上書きできる．

```php
<?php

class Test01
{
    // 中身は省略
}

$test01 = new Test01;

$test01->setProperty01("データ01の値");

$test01->setProperty01("新しいデータ01の値");
```

一方で，Test02クラスインスタンスの```$property02```に値を設定するためには，インスタンスを作り直さなければならない．つまり，以前に作ったインスタンスの```$property02```の値は上書きできない．Setterを持たせずに，```__construct```メソッドだけを持たせれば，『Immutable』なクラスとなる．

```php
<?php

class Test02
{
    // 中身は省略
}

$test02 = new Test02("データ02の値");

$test02 = new Test02("新しいデータ02の値");
```

Entityは，Mutableであるため，Setterと```__construct```メソッドの両方を持てる．ValueObjectは，Immutableのため，```__construct```メソッドしか持つことができない．

<br>

### マジックメソッド（Getter系）

オブジェクトに対して特定の操作が行われた時に自動的にコールされる特殊なメソッドのこと．自動的に呼び出される仕組みは謎．共通の処理を行うGetter（例：値を取得するだけのGetterなど）を無闇に増やしたくない場合に用いることで，コード量の肥大化を防げる．PHPには最初からマジックメソッドは組み込まれているが，自身で実装した場合，オーバーライドされてコールされる．

#### ・```__get```メソッド

定義されていないデータや，アクセス権のないデータを取得しようとした時に，代わりに呼び出される．メソッドは定義しているが，データは定義していないような状況で用いる．

**＊実装例＊**

```php
<?php
class Foo
{

    private $foo = [];

    // 引数と返却値のデータ型を指定
    public function __get(string $name): string
    {
        return "{$name}データは存在しないため，データ値を取得できません．";
    }

}

// 存在しないデータを取得．
$foo = new Foo();
$foo->foo;

// 結果
// fooデータは存在しないため，値を呼び出せません．
```

#### ・```__call```メソッド

定義されていないメソッドや，アクセス権のないメソッドを取得しようとした時に，代わりにコールされる．データは定義しているが，メソッドは定義していないような状況で用いる．

#### ・```__callStatic```メソッド

<br>

### マジックメソッド（Setter系）

定義されていない静的メソッドや，アクセス権のない静的メソッドを取得しようとした時に，代わりに呼び出される．自動的にコールされる仕組みは謎．共通の処理を行うSetter（例：値を設定するだけのSetterなど）を無闇に増やしたくない場合に用いることで，コード量の肥大化を防げる．PHPには最初からマジックメソッドは組み込まれているが，自身で実装した場合，オーバーライドされて呼び出される．

#### ・```__set```メソッド

定義されていないデータや，アクセス権のないデータに値を設定しようとした時に，代わりにコールされる．オブジェクトの不変性を実現するために用いられる．オブジェクトの不変性は，以下のリンクを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_architecture_backend_domain_driven_design.html

**＊実装例＊**

```php
<?php
class Foo
{

    private $foo = [];
    
    // 引数と返り値のデータ型を指定
    public function __set(String $name, String $value): String
    {
        echo "{$name}データは存在しないため，{$value}を設定できません．";
    }

}
```

```php
class Foo {
// 中身は省略
}

// 存在しないデータに値をセット．
$foo = new Foo();
$foo->bar = "bar";

// 結果
// barデータは存在しないため，barを設定できません．
```

#### ・マジックメソッドの```__construct```メソッド

インスタンス化時に自動的に呼び出されるメソッド．インスタンス化時に実行したい処理を記述できる．Setterを持たせずに，```__construct```メソッドでのみ値の設定を行えば，ValueObjectのような，『Immutable』なオブジェクトを実現できる．

**＊実装例＊**

```php
<?php
    
class Test02
{

    private $property02;

    // コンストラクタで$property02に値を設定
    public function __construct($property02)
    {
        $this->property02 = $property02;
    }
    
}
```

#### ・『Mutable』と『Immutable』を実現できる理由】

Test01クラスインスタンスの```$property01```に値を設定するためには，インスタンスからSetterをコールする．Setterは何度でもコールでき，その度にデータの値を上書きできる．

```php
<?php
    
$test01 = new Test01;

$test01->setProperty01("データ01の値");

$test01->setProperty01("新しいデータ01の値");
```

一方で，Test02クラスインスタンスの```$property02```に値を設定するためには，インスタンスを作り直さなければならない．つまり，以前に作ったインスタンスの```$property02```の値は上書きできない．Setterを持たせずに，```__construct```メソッドだけを持たせれば，『Immutable』なオブジェクトとなる．

```php
<?php
    
$test02 = new Test02("データ02の値");

$test02 = new Test02("新しいデータ02の値");
```

<br>

### マジックメソッド（その他）

#### ・```__invoke```メソッド

定義されたクラスを，関数のように扱える．```__invoke```メソッド自体は無名関数として扱われる．

```php
<?php

class Foo
{
    public function __invoke(array $array)
    {
        print_r($array);
    }
}

$foo = new Foo();
$foo([1, 2, 3]);

// 結果
// Array
// (
//    [0] => 1
//    [1] => 2
//    [2] => 3
// )
```

#### ・```__clone```メソッド

```php
// ここに実装例
```

<br>

### インスタンスの生成メソッド

#### ・```static```メソッド と ```self```メソッドの違い

どちらも，new演算子と組み合わせて，自身のインスタンスを返却するメソッドであるが，生成の対象になるクラスが異なる．

```php
<?php

class A
{
    /**
     * @return A
     */
    public static function get_self()
    {
        return new self();
    }

    /**
     * @return static
     */
    public static function get_static()
    {
        return new static();
    }
}
```

```php
<?php
class B extends A {}
```

以下の通り，```self```メソッドは定義されたクラスをインスタンス化する．一方で，```static```メソッドはコールされたクラスをインスタンス化する．自身のインスタンス化処理が継承される場合は，```static```メソッドを用いた方が良い．

```php
<?php
    
echo get_class(B::get_self());   // 継承元のクラスA

echo get_class(B::get_static()); // 継承先のクラスB

echo get_class(A::get_static()); // 継承元のクラスA
```

<br>

### メソッドのコール

#### ・メソッドチェーン

以下のような，オブジェクトAを最外層とした関係が存在しているとする．

【オブジェクトA（オブジェクトBをデータに持つ）】

```php
<?php

class Obj_A
{
    private $objB;

    // 返却値のデータ型を指定
    public function objB(): ObjB
    {
        return $this->objB;
    }
}
```

【オブジェクトB（オブジェクトCをデータに持つ）】

```php
<?php
    
class Obj_B
{
    private $objC;
 
    // 返却値のデータ型を指定
    public function objC(): ObjC
    {
        return $this->objC;
    }
}
```

【オブジェクトC（オブジェクトDをデータに持つ）】

```php
<?php
    
class Obj_C
{
    private $objD;
 
    // 返却値のデータ型を指定
    public function objD(): ObjD
    {
        return $this->objD;
    }
}
```

以下のように，返却値のオブジェクトを用いて，より深い層に連続してアクセスしていく場合…

```php
<?php
    
$ObjA = new Obj_A;

$ObjB = $ObjA->objB();

$ObjC = $ObjB->objB();

$ObjD = $ObjC->objD();
```

以下のように，メソッドチェーンという書き方が可能．

```php
<?php
    
$D = objB()->objC()->objC();

// $D には ObjD が格納されている．
```

#### ・Recursive call：再帰的プログラム

自プログラムから自身自身をコールし，実行できるプログラムのこと．

**＊例＊**

ある関数 ```f```の定義の中に ```f```自身を呼び出している箇所がある．

![再帰的](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/再帰的.png)

**＊実装例＊**

以下のリンクも参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_language_object_oriented_php_logic_algorithm.html

1. 適当な値を基準値（Pivot）とする （※できれば中央値が望ましい）
2. Pivotより小さい数を前方，大きい数を後方に分割する．
3. 二分割された各々のデータを，それぞれソートする．
4. ソートを繰り返し実行する．

**＊実装例＊**

```php
<?php

class Foo
{
    /**
     * @param array $array
     * @return array
     */
    public function quickSort(array $array): array
    {
        // 配列の要素数が1つしかない場合，クイックソートする必要がないので，返却する．
        if (count($array) <= 1) {
            return $array;
        }

        // 一番最初の値をPivotとする．
        $pivot = array_shift($array);

        // グループを定義
        $left = $right = [];

        foreach ($array as $value) {

            if ($value < $pivot) {

                // Pivotより小さい数は左グループに格納
                $left[] = $value;
            } else {

                // Pivotより大きい数は右グループに格納
                $right[] = $value;
            }

        }

        // 処理の周回ごとに，結果の配列を結合．
        return array_merge
        (
        // 左のグループを再帰的にクイックソート．
            quickSort($left),

            // Pivotを結果に組み込む．
            [$pivot],

            // 左のグループを再帰的にクイックソート．
            quickSort($right)
        );
    }
}

// 実際に使ってみる．
$array = [6, 4, 3, 7, 8, 5, 2, 9, 1];
$result = quickSort($array);
var_dump($result);

// 昇順に並び替えられている．
// 1, 2, 3, 4, 5, 6, 7, 8 
```

<br>

### 引数

#### ・オプション引数

引数が与えられなければ，指定の値を渡す方法

```php
// ここに実装例
```

<br>

### 値を返却する前の途中終了

#### ・```return;```

**＊実装例＊**


```php
<?php
    
class Foo
{
  
    public function returnMethod()
    {
        print "returnMethod()です。\n";
        return; // 何も返さない．
    }
}

$foo = new Foo();
$foo->returnMethod(); // returnMethod()です。
// 処理は続く．
```

#### ・```exit;```

**＊実装例＊**

```php
<?php
    
class Foo
{
  
    function exitMethod()
    {
        print "exitMethod()です。\n";
        exit;
    }
}

$foo = new Foo();
$foo->exitMethod(); // exitMethod()です。
// ここで，ソフトウェア全体の処理が終了する．
```

<br>

### 値の返却

#### ・```return```

メソッドがコールされた場所に値を返却した後，その処理が終わる．

#### ・```yield```

メソッドがコールされた場所に値を返却した後，そこで終わらず，```yield```の次の処理が続く．返却値は，array型である．

**＊実装例＊**

```php
<?php

class Foo
{
    /**
     * @return array|Generator
     */
    public function oneToThree(): array
    {
        for ($i = 1; $i <= 3; $i++) {
            // yield を返却した後，$i の値が維持される．
            yield $i;
        }
    }
}

$foo = new Foo();
$oneToThree = $foo->oneToThree();

foreach ($oneToThree as $value) {
    echo "{$value}\n";
}

// 1
// 2
// 3
```

<br>

### Dispatcher

#### ・Dispatcherとは

特定の名前と関数を紐付け，名前を渡すことで関数をコールするオブジェクトをDispatcherという．

```php
<?php
    
class Dispatcher
{
    // 中身は省略
}

$dispatcher = new Dispatcher;

$name = "foo";

// 名前に紐付ける関数を定義．
$listener = function() use ($param){
    // 何らかの処理
};

// 名前と関数の登録.
$dispatcher->addListener($name, $listener);

// 文字列からメソッドをコール．ついでに，引数を渡す．
$dispatcher->dispatch("foo", "test");
```

#### ・イベント名と関数の紐付け

名前としてイベント名を定義し，これに関数を紐付ける．特定のイベント名が渡された時に，それに対応づけられた関数をコールする．

**＊実装例＊**

フレームワークの```EventDispatcher```クラスが簡単である．以下のリンクを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_language_object_oriented_php_framework_symfony_component.html

```php
<?php
    
use Symfony\Component\EventDispatcher\EventDispatcher;

class FooEventDispatcher
{

}
```

#### ・計算処理の返却値を保持するオブジェクト

大量のデータを集計するは，その処理に時間がかかる．そこで，そのようなメソッドでは，一度コールされて集計を行った後，データに返却値を保持しておく．そして，再びコールされた時には，返却値をデータから取り出す．

**＊実装例＊**

```php
<?php

class ResultCacher
{
    /**
     * @var 
     */
    private $resultCollection;

    /**
     * @var array[] 
     */
    private $funcCollection;

    /**
     */
    public function __construct()
    {
        $this->funcCollection = $this->addListener();
    }

    /**
     * 集計メソッド
     */
    public function computeRevenue()
    {
        // 時間のかかる集計処理;
    }

    /**
     * @param string $funcName
     * @return false|mixed
     */
    public function funcNameListener(string $funcName)
    {
        // 返却値が設定されていなかった場合，値を設定.
        if (!isset($this->resultCollection[$funcName])) {

            // メソッドの返却値をCollectionに設定．
            $this->resultCollection[$funcName] = $this->dispatch($funcName);
        }

        // 返却値が設定されていた場合,そのまま用いる．
        return $this->resultCollection[$funcName];
    }

    /**
     * 返却値をキャッシュしたいメソッド名を登録しておく
     * 
     * @return array[]
     */
    private function addListener()
    {
        return [
            "computeRevenue" => [$this, "computeRevenue"]
        ];
    }

    /**
     * @param string $funcName
     * @return false|mixed
     */
    private function dispatch(string $funcName)
    {
        // call_user_funcでメソッドを実行
        return call_user_func(
        // 登録されているメソッド名から，メソッドをDispatch.
            $this->funcCollection[$funcName]
        );
    }
}
```

<br>

## 02-03. Closure（無名関数）

### Closure（無名関数）の定義，変数格納後のコール

#### ・```use```メソッドのみに引数を渡す場合

**＊実装例＊**

```php
<?php

class Item
{
    // 中身は省略
}

$item = new Item;

// 最初の括弧を用いないことで，普段よくやっている値渡しのメソッドを定義しているのと同じになる．
// use()に，親メソッド（$optionName）のスコープの$itemを渡す．
$optionName = function () use ($item) {
    $item->optionName();
};

// function()には引数が設定されていないので，コール時に引数は不要．
echo $optionName;

// 出力結果
// オプションA
```

#### ・```function```メソッドと```use```メソッドに引数を渡す場合

**＊実装例＊**

```php
<?php
class Item 
{
    // 中身は省略
}

$item = new Item;

// 最初の括弧を用いないことで，普段よくやっている値渡しのメソッドを定義しているのと同じになる．
// 親メソッド（$optionName）のスコープの$itemを，use()に渡す．
// $paramは，コール時に用いる変数．
$optionName = function ($para) use ($item) {
    $item->optionName() . $para;
};

// コール時に，$paramをfunction()に渡す．
echo $optionName("BC");

// 出力結果
// オプションABC
```

#### ・データの値として，無名関数を格納しておく裏技

**＊実装例＊**

```php
<?php

class Item
{
    // 中身は省略
}

class Option
{
    // 中身は省略
}

$item = new Item;

// 最初の括弧を用いないことで，普段よくやっている値渡しのメソッドを定義しているのと同じになる．
// use()に，親メソッドのスコープの$itemを渡す．
// $paramは，コール時に用いる変数．
$option = new Option;

// データの値に無名関数を格納する．
$option->name = function ($para) use ($item) {
    $item->optionName() . $para;
};

// コール時に，$paramをfunction()に渡す．
echo $option->name("BC");

// 出力結果
// オプションABC
```

<br>

### Closure（無名関数）の定義と即コール

定義したその場でコールされる無名関数を『即時関数』と呼ぶ．無名関数をコールしたい時は，```call_user_func```メソッドを用いる．

**＊実装例＊**

```php
<?php
    
class Item 
{
    // 中身は省略
}

$item = new Item;
$param = "BC";

// use()に，親メソッドのスコープの$itemを渡す．
// 無名関数を定義し，同時にcall_user_func()で即コールする．
// $paramは，コール時に用いる変数．
$optionName = call_user_func(function ($param) use ($item) {
    $item->optionName() . $param;
});

// $paramはすでに即コール時に渡されている．
// これはコールではなく，即コール時に格納された返却値の出力．
echo $optionName;

// 出力結果
// オプションABC
```

<br>

### 高階関数とClosure（無名関数）の組み合わせ

関数を引数として受け取ったり，関数自体を返したりする関数を『高階関数』と呼ぶ．

#### ・無名関数を用いない場合

**＊実装例＊**

```php
<?php

// 第一引数のみの場合
class Foo
{
    /**
     * 高階関数を定義
     * 
     * @param $callback
     */
    public function test($callback)
    {
        echo $callback();
    }
    
    /**
     * コールバックを定義
     * 関数の中でコールされるため，『後で呼び出される』という意味合いから，コールバック関数といえる．
     * 
     * @return string
     */
    public function callbackMethod(): string
    {
        return "出力に成功しました．";
    }
}

$foo = new Foo();
// 高階関数の引数として，コールバック関数を渡す
$foo->test("callbackMethod");

// 出力結果
// 出力に成功しました．
```

```php
<?php

// 第一引数と第二引数の場合
class Foo
{

    /**
     * 高階関数を定義
     * 
     * @param $param
     * @param $callback
     * @return mixed
     */
    public function higherOrder($param, $callback)
    {
        return $callback($param);
    }

    /**
     * コールバック関数を定義
     * 
     * @param $param
     * @return string
     */
    public function callbackMethod($param)
    {
        return $param."の出力に成功しました．";
    }
}

$foo = new Foo();

// 高階関数の第一引数にコールバック関数の引数，第二引数にコールバック関数を渡す
$foo->higherOrder("第一引数", "callbackMethod");

// 出力結果
// 第一引数の出力に成功しました．
```

#### ・無名関数を用いる場合

**＊実装例＊**

```php
<?php

class Foo
{
    /**
     * 高階関数のように，関数を引数として渡す．
     * 
     * @param $parentVar
     * @param $callback
     * @return mixed
     */
    public function higherOrder($parentVar, $callback)
    {
        $parentVar = "&親メソッドのスコープの変数";
        return $callback($parentVar);
    }
}

$foo = new Foo;

// 第二引数の無名関数．関数の中でコールされるため，『後でコールされる』という意味合いから，コールバック関数といえる．
// コールバック関数は再利用されないため，名前をつけずに無名関数とすることが多い．
// 親メソッドのスコープで定義されている変数を引数として渡す．（普段よくやっている値渡しと同じ）
$foo->higherOrder($parentVar, function () use ($parentVar) {
    return $parentVar . "の出力に成功しました．";
});

// 出力結果
// 親メソッドのスコープの変数の出力に成功しました．
```

<br>

### 高階関数を使いこなす！

**＊実装例＊**

```php
<?php

class Foo
{

    /**
     * @var array
     */
    protected $properties;

    /**
     * 非無名メソッドあるいは無名メソッドを引数で渡す．
     * 
     * @param $callback
     * @return $this
     */
    public function Shiborikomi($callback)
    {
        if (!is_callable($callback)) {
            throw new \LogicException;
        }

        // 自身が持つ配列型のデータを加工し，再格納する．
        $properties = [];
        foreach ($this->properties as $property) {

            // 引数の無名関数によって，データに対する加工方法が異なる．
            // 例えば，判定でtrueのもののみを返すメソッドを渡すと，自データを絞り込むような処理を行える．
            $returned = call_user_func($property, $callback);
            if ($returned) {

                // 再格納．
                $properties[] = $returned;
            }
        }

        // 他のデータは静的に扱ったうえで，自身を返す．
        return new static($properties);
    }
}
```

<br>

## 03. 定数

### 定数が役に立つ場面

#### ・フラグON/OFF

```php
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

#### ・区分値

区分値を整数型の定数として扱う．区分値をデータとして持つオブジェクトについては，ドメイン駆動設計の値オブジェクトを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_architecture_backend_domain_driven_design.html

#### ・数値計算，数値比較

計算処理や数値比較処理では，可読性の観点から，できるだけ数値を直書きしない．数値に意味合いを持たせ，定数として扱うと可読性が高くなる．ドメイン駆動設計の値オブジェクトを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_architecture_backend_domain_driven_design.html

#### ・URL

URLを文字列を定数として扱う．

<br>

### 場面に応じた命名

| 意味づけ       | 名前                                     | 型     |
| -------------- | ---------------------------------------- | ------ |
| 個数，回数     | ```NUM_*****```                            | int    |
| 最大数，最小数 | ```MAX_NUM_*****```，```MIN_NUM_*****``` | int    |
| URL            | ```URL_*****```                          | string |

<br>

### マジカル定数

自動的に値が格納されている定数．

#### ・```__DIR__```

この定数がコールされたファイルが設置されたディレクトリのパスが，ルートディレクトリ基準で格納されている．

**＊実装例＊**

以下の実装を持つファイルを，『```/var/www/foo```』下に置いておき，『```/vendor/autoload.php```』と結合してパスを通す．

```php
<?php
    
# /var/www/foo/vendor/autoload.php
require_once realpath(__DIR__ . "/vendor/autoload.php");
```

#### ・```__FUNCTION__```

この定数がコールされたメソッド名が格納されている．

**＊実装例＊**

```php
<?php

class Foo
{
    public function foo()
    {
        echo __FUNCTION__;
    }
}
```

```php
<?php

class Foo
{
    public function foo(){}
}

$foo = new Foo;
$foo->foo(); // foo が返却される．
```

#### ・```__METHOD__```

この定数がコールされたクラス名とメソッド名が，```{クラス名}::{メソッド名}```の形式で格納されている．

**＊実装例＊**

```php
<?php

class Foo
{
    public function foo()
    {
        echo __METHOD__;
    }
}
```

```php
<?php
    
foo = new Foo;
foo->foo(); // Foo::foo が返却される．
```

<br>

## 04. 変数

### 変数展開

文字列の中で，変数の中身を取り出すことを『変数展開』と呼ぶ．

※Paizaで検証済み．

#### ・シングルクオーテーションによる変数展開

シングルクオーテーションの中身は全て文字列として認識され，変数は展開されない．

**＊実装例＊**

```php
<?php
    
$fruit = "リンゴ";

// 出力結果
echo 'これは$fruitです．'; // これは，$fruitです．
```

#### ・シングルクオーテーションと波括弧による変数展開

シングルクオーテーションの中身は全て文字列として認識され，変数は展開されない．

**＊実装例＊**

```php
<?php
    
$fruit = "リンゴ";

// 出力結果
echo 'これは{$fruit}です．'; // これは，{$fruit}です．
```

#### ・ダブルクオーテーションによる変数展開

変数の前後に半角スペースを置いた場合にのみ，変数は展開される．（※半角スペースがないとエラーになる）

```php
<?php
    
    
$fruit = "リンゴ";

// 出力結果
echo "これは $fruit です．"; // これは リンゴ です．
```

#### ・ダブルクオーテーションと波括弧による変数展開

波括弧を用いると，明示的に変数として扱える．これによって，変数の前後に半角スペースを置かなくとも，変数は展開される．

```php
<?php
    
$fruit = "リンゴ";

// 出力結果
echo "これは{$fruit}です．"; // これは，リンゴです．
```

<br>

### 参照渡しと値渡し

#### ・参照渡し

『参照渡し』とは，変数に代入した値の参照先（メモリアドレス）を渡すこと．

```php
<?php
    
$value = 1;
$result = &$value; // 値の入れ物を参照先として代入
```

**＊実装例＊**

変数の```$b```には，```$a```の参照によって10が格納される．

```php
<?php
    
$a = 2;
$b = &$a;  // 変数aを&をつけて代入
$a = 10;    // 変数aの値を変更

// 出力結果
echo $b; // 10
```

#### ・値渡し

『値渡し』とは，変数に代入した値のコピーを渡すこと．

```php
<?php
    
$value = 1;
$result = $value; // 1をコピーして代入
```

**＊実装例＊**

変数の```$b```には，```$a```の一行目の格納によって2が格納される．

```php
<?php
    
$a = 2;
$b = $a;  // 変数aを代入
$a = 10;  // 変数aの値を変更


// 出力結果
echo $b; // 2
```

<br>

## 05. 組み込みラッパー関数

### 入出力ストリームへのアクセス

#### ・入出力ストリームとは

一度に全てのデータを入出力するのではなく，少しずつ入出力する処理のこと．

#### ・php://stdin

stdin：standard in（標準入力）を意味する．PHPのプロセスが，標準入力に対して，読み出し処理を送信できるようになる．

```php
<?php

// ログを読み出す
$stdin = fopen("php://stdin", "r");
```

#### ・php://stdout

stdout：standard out（標準出力）を意味する．PHPのプロセスが，標準出力に対して，書き込み処理を送信できるようになる．

```php
<?php

// ログを書き込む
$stderr = fopen("php://stdout", "w");
fwrite($stderr, "ログです．");
```

#### ・php://stderr

stderr：standard error（標準出力エラー）を意味する．PHPのプロセスが，標準エラー出力に対して，書き込み処理を送信できるようになる．

```php
<?php

// エラーログを書き込む
$stderr = fopen("php://stderr", "w");
fwrite($stderr, "エラーログです．");
```

<br>

## 06. その他の関数

### ファイルシステム関数

#### ・file_put_contents

ファイルに文字列を出力する．

**＊実装例＊**

```php
<?php
    
$array = [];

// array型をJSON型に変換
$json = json_encode($array);

// fopen()，fwrite()，fclose()を実行できる．
file_put_contents(
    "data.json",
    $json
);
```

<br>

## 07. 正規表現とパターン演算子

### 正規表現

#### ・正規表現とは

数値，記号，文字列などの種類を簡単に表現する文字列のこと．

<br>

### ```preg_match```関数

#### ・数字

**＊実装例＊**

『```0```から```9```のいずれか』の数字を意味する．

```php
<?php

$var = "0123456789";

// OR条件と範囲指定
$result = preg_match("/[0-9]/", $var)
    
var_dump($result); // true
```

#### ・アルファベット

**＊実装例＊**

『```a```から```z```のいずれか』または『AからZのいずれか』のアルファベットを意味する．

```php
<?php

$var = "aAbBcC";

// OR条件と範囲指定
$result = preg_match("/[a-zA-Z]/", $var)
    
var_dump($result); // true
```

#### ・メタ文字

エスケープのために，必ずバックスラッシュを付ける必要がある．

参考：https://www-creators.com/archives/3102

**＊実装例＊**

『```?```』『```.```』『```*```』『```$```』のいずれかのメタ文字を意味する．

```php
<?php

$var = "?";

$result = preg_match("/[\?.*$]/", $var)
    
var_dump($result); // 1
```

#### ・ワイルドカード

ワイルドカードは『```.*```』または『```.+```』で意味する．ドットは任意の文字，アスタリスクは直前の文字が```0```回以上反復すること，プラスは```1```回以上反復することを意味する．

参考：https://qiita.com/whisky-shusuky/items/d719c92c566c133f51b1

**＊実装例＊**

```php
<?php

$var = "FooBarBaz";

// 前方の一致
$result = preg_match("/Foo.*/", $var);
    
var_dump($result); // 1
```
```php
<?php

$var = "FooBarBaz";

// 後方の一致
$result = preg_match("/.*Baz/", $var);

var_dump($result); // 1
```

#### ・クエスチョン

クエスチョンの前に記載された文字に関して，あってもなくても問題ないことを意味する．

参考：http://www.ipc.juen.ac.jp/contents/manuals/spam/regular.html

```php
<?php

$var = "FooBarBaz";

# zはあってもなくてもも
$result = preg_match("/FooBarBaz?/", $var);

var_dump($result); // 1
```

#### ・オプションとしてのパターン演算子

**＊実装例＊**

```php
<?php
    
$var = "jpeg";

// jpegの大文字小文字
$result = preg_match("/jpeg$/i", $var);

var_dump($result); // 1
```

```php
<?php

$var = "JPEG";

// jpegの大文字小文字
$result = preg_match("/jpeg$/i", $var);

var_dump($result); // 1
```

#### ・グループ化

文字列をグループ化する．正規表現に規則性がある場合に有効である．

参考：http://www.turtle.gr.jp/techno/regular-expression.html

```php
<?php

$var = "abcabcabc";

# abcが任意数だけ反復する
$result = preg_match("/(abc)*/", $var);
    
var_dump($result); // 1
```

