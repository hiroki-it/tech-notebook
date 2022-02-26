---
title: 【知見を記録するサイト】Eloquent ORM＠Laravel
description: Eloquent ORM＠Laravelの知見をまとめました．
---

# Eloquent ORM＠Laravel

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Eloquent ORMとは

Laravelに組み込まれているORM．Active Recordパターンで実装されている．内部にはPDOが用いられており，Laravelクエリビルダよりも隠蔽度が高い．

参考：

- https://readouble.com/laravel/8.x/ja/eloquent.html
- https://codezine.jp/article/detail/12805

<br>

## 01-02. Active Recordパターン

### Active Recordパターンとは

テーブルとモデルが一対一の関係になるデザインパターンのこと．さらに，テーブル間のリレーションシップがそのままモデル間の依存関係にも反映される．ビジネスロジックが複雑でないアプリケーションの開発に適している．オブジェクト間の依存関係については，以下のリンクを参考せよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_language_php_class_based.html

![ActiveRecord](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ActiveRecord.png)

<br>

### メリット/デメリット

| 項目   | メリット                                                     | デメリット                                                   |
| ------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 保守性 | テーブル間のリレーションが，そのままモデル間の依存関係になるため，モデル間の依存関係を考える必要がなく，開発が早い．そのため，ビジネスロジックが複雑でないアプリケーションの開発に適している． | ・反対に，モデル間の依存関係によってテーブル間のリレーションが決まる．そのため，複雑な業務ロジックでモデル間が複雑な依存関係を持つと，テーブル間のリレーションも複雑になっていってしまう．<br>・モデルに対応するテーブルに関して，必要なカラムだけでなく，全てのカラムから取得するため，アプリケーションに余分な負荷がかかる． |
| 拡張性 | テーブル間のリレーションがモデル間の依存関係によって定義されており，JOIN句を用いずに，各テーブルから必要なレコードを取得できる．そのため，テーブルを増やすやすい． |                                                              |
| 可読性 | ・モデルとこれのプロパティがそのままテーブルになるため，モデルを作成するためにどのテーブルからレコードを取得するのかを推測しやすい（Userモデル ⇄ usersテーブル）．<br>・リレーションを理解する必要があまりなく，複数のテーブルに対して無秩序にSQLを発行するような設計実装になりにくい． |                                                              |

<br>

## 03. Eloquentモデル

### テーブル設計を元にしたEloquentモデル

#### ・Eloquentモデルの継承

Eloquentモデルを継承したクラスは，```INSERT```文や```UPDATE```文などのデータアクセスロジックを使用できるようになる．

**＊実装例＊**

````php
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class Foo extends Model
{
    // クラスチェーンによって，データアクセスロジックをコール
}
````


#### ・テーブルの定義

テーブルを定義するため，```table```プロパティにテーブル名を割り当てる．ただし，```table```プロパティにテーブル名を代入する必要はない．Eloquentがクラス名の複数形をテーブル名と見なし，これをスネークケースにした文字列を```table```プロパティに自動的に代入する．また，テーブル名を独自で命名したい場合は，代入によるOverrideを行っても良い．

**＊実装例＊**

```php
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class Foo extends Model
{
    /**
     * @var string
     */
    protected $table = "foos"; // Eloquentモデルと関連しているテーブル
}
```

#### ・テーブル間リレーションシップの定義

ER図における各テーブルのリレーションシップを元に，モデル間の関連性を定義する．```hasOne```メソッド，```hasMany```メソッド，```belongsTo```メソッドを用いて表現する．

参考：

- https://readouble.com/laravel/8.x/ja/eloquent-relationships.html#one-to-one
- https://readouble.com/laravel/8.x/ja/eloquent-relationships.html#one-to-many
- https://readouble.com/laravel/8.x/ja/eloquent-relationships.html#one-to-many-inverse

ER図については，以下のリンクを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_architecture_analysis_and_design.html

**＊実装例＊**

Departmentモデルで，```hasMany```メソッドを用いて，Departmentモデル（親）とEmployeesモデル（子）のテーブル関係を定義する．

```php
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    /**
     * @var string 
     */
    protected $primaryKey = "department_id"; // 主キーとするカラム

     /**
     * @return HasMany
     */
    public function employees(): HasMany
    {
        // 一対多の関係を定義します．（デフォルトではemployee_idに紐付けます）
        return $this->hasMany(Employee::class);
    }
}
```

また，Employeesモデルでは，```belongsTo```メソッドを用いて，Departmentモデル（親）とEmployeesモデル（子）のテーブル関係を定義する．

```php
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employee extends Model
{
    /**
     * @var string 
     */
    protected $primaryKey = "employee_id"; // 主キーとするカラム

    /**
     * @return BelongsTo
     */
    public function department(): BelongsTo
    {
        // 多対一の関係を定義します．（デフォルトではdepartment_idに紐付けます）
        return $this->belongsTo(Department::class);
    }
}
```

リレーションを基にJOIN句のSQLを発行するために，Departmentモデル（親）の```hasMany```メソッドを実行する．これにより，DepartmentモデルのIDに紐付くEmployeesモデル（子）を配列で参照できる．

```php
<?php

// Departmentオブジェクトを取得
$department = Department::find(1);

// 部署ID=1に紐付く全てのemployeeオブジェクトをarray型で取得
$employees = $department->employees()
```

#### ・主キーカラムの定義

Eloquentは，```primaryKey```プロパティの値を主キーのカラム名と見なす．```keyType```プロパティで主キーのデータ型，また```incrementing```プロパティで主キーの自動増分を有効化するか否か，を設定できる．

**＊実装例＊**

```php
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class Foo extends Model
{
    /**
     * @var string 
     */
    protected $primaryKey = "foo_id"; // 主キーとするカラム（デフォルトではidが主キー）
    
    /**
     * @var string 
     */
    protected $keyType = "int"; // 主キーのデータ型
    
    /**
     * @var bool 
     */
    public $incrementing = true; // 主キーの自動増分の有効化します．
}
```

#### ・TIMESTAMP型カラムの定義

Eloquentは，```timestamps```プロパティの値が```true```の時に，Eloquentモデルに紐付くテーブルの```created_at```カラムと```updated_at```カラムを自動的に更新する．また，TIMESTAMP型カラム名を独自で命名したい場合は，代入によるOverideを行っても良い．

**＊実装例＊**

```php
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class Foo extends Model
{
    const CREATED_AT = "created_date_time";
    const UPDATED_AT = "updated_data_time";
    
    /**
     * @var bool
     */
    protected $timestamps = true; // Eloquentモデルのタイムスタンプを更新するかの指示します．
}
```


#### ・TIMESTAMP型カラム読み出し時のデータ型変換

データベースからタイムスタンプ型カラムを読み出すと同時に，CarbonのDateTimeクラスに変換したい場合，```data```プロパティにて，カラム名を設定する．

**＊実装例＊**

```php
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * CarbonのDateTimeクラスに自動変換したいカラム名
     *
     * @var array
     */
    protected $dates = [
        "created_at",
        "updated_at",
        "deleted_at"
    ];
}

```


#### ・カラムデフォルト値の定義

特定のカラムのデフォルト値を設定したい場合，```attributes```プロパティにて，カラム名と値を定義する．

**＊実装例＊**

```php
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class Foo extends Model
{
    /**
     * カラム名とデフォルト値
     *
     * @var array
     */
    protected $attributes = [
        "is_deleted" => false,
    ];
}
```

#### ・変更可能/不可能なカラムの定義

変更可能なカラム名を```fillable```プロパティを用いて定義する．カラムが増えるたびに，実装する必要がある．

**＊実装例＊**

```php
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class Foo extends Model
{
    /**
     * カラム名
     *
     * @var array
     */
    protected $fillable = [
        "name",
    ];
}
```

もしくは，変更不可能なカラム名を```guarded```プロパティで定義する．これらのいずれかの設定は，Eloquentモデルで必須である．

```php
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class Foo extends Model
{
    /**
     * カラム名
     *
     * @var array
     */
    protected $guarded = [
        "bar",
    ];
}
```

<br>

### 使用に注意する機能

#### ・セッター

Laravelでは，プロパティを定義しなくても，Eloquentモデルからプロパティをコールすれば，処理の度に動的にプロパティを定義できる．しかし，この機能はプロパティがpublicアクセスである必要があるため，オブジェクト機能のメリットを享受できない．そのため，この機能を用いずに，```constructor```メソッドを用いたコンストラクタインジェクション，またはセッターインジェクションを用いるようにする．

**＊実装例＊**

```php
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class Foo extends Model
{
    /**
     * @var FooName
     */
    private FooName $fooName;

    /**
     * 名前を取得します．
     *
     * @return string
     */
    public function __construct(FooName $fooName)
    {
        $this->fooName = $fooName;
    }
}
```

#### ・ゲッター

Laravelでは，```getFooBarAttribute```という名前のメソッドを，```foo_bar```という名前でコールできる．一見，プロパティをコールしているように見えるため，注意が必要である．

**＊実装例＊**

```php
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class Foo extends Model
{
    /**
     * @var FooName
     */
    private FooName $fooName;

    /**
     * 名前を取得します．
     *
     * @return string
     */
    public function getNameAttribute()
    {
        return $this->fooName . "です．";
    }
}
```

```php
<?php

$foo = Foo::find(1);

// nameプロパティを取得しているわけでなく，getNameAttributeメソッドを実行している．
$fooName = $foo->name;
```

<br>

### データ型変換

#### ・シリアライズ

フロントエンドとバックエンド間，またバックエンドとデータベース間のデータ送信のために，配列型オブジェクトをJSONに変換する処理はシリアライズである．

**＊実装例＊**

```php
<?php

$collection = collect([
    [
        "user_id" => 1,
        "name"    => "佐藤太郎",
    ],
    [
        "user_id" => 2,
        "name"    => "山田次郎",
    ],
]);

// Array型に変換する
$collection->toArray();
```

```php
<?php

$users = App\User::all();

// Array型に変換する
return $users->toArray();
```

#### ・デシリアライズ

フロントエンドとバックエンド間，またバックエンドとデータベース間のデータ送信のために，JSONを配列型オブジェクトに変換する処理はデシリアライズである．

<br>

### フィルタリング

#### ・```filter```メソッド

コールバック関数の返却値が```true```であった要素を全て抽出する．

**＊実装例＊**

```php
$collection = collect([1, 2, 3, 4]);

// trueを返却した要素を全て抽出する
$filtered = $collection->filter(function ($value, $key) {
    return $value > 2;
});

$filtered->all();

// [3, 4]
```

ちなみに，複数の条件を設定したいときは，早期リターンを用いる必要がある．

**＊実装例＊**

```php
$collection = collect([1, 2, 3, 4, "yes"]);

// 複数の条件で抽出する．
$filtered = $collection->filter(function ($value, $key) {
    
    // まずはyesを検証する．
    if($value == "yes") {
        return true;
    }
    
    return $value > 2;
});

$filtered->all();

// [3, 4, "yes"]
```

#### ・```first```メソッド

コールバック関数の返却値が```true```であった最初の要素のみを抽出する．

**＊実装例＊**

```php
$collection = collect([1, 2, 3, 4]);

// trueを返却した要素のみ抽出する
$filtered = $collection->first(function ($value, $key) {
    return $value > 2;
});

// 3
```

<br>

## 03-02. EloquentモデルとビルダーによるCRUD

### CRUDメソッドの返却値型と返却値

#### ・CRUDメソッドを持つクラス

Eloquentモデルを継承すると，以下のクラスからメソッドをコールできるようになる．Eloquentモデルにはより上位のメソッドが定義されていないことがあり，もし定義されていないものがコールされた場合，```__callStatic```メソッド（静的コールによる）や```__call```メソッド（非静的コールによる）が代わりにコールされ，より上位クラスのメソッドをコールできる．どちらの方法でコールしても同じである．

参考：

- https://www.php.net/manual/ja/language.oop5.overloading.php#object.call
- https://qiita.com/mpyw/items/7c7e8dc665584122a275

| クラス               | 名前空間                                              | ```__call```メソッドを経由してコールできるクラス      |
| :------------------- | :---------------------------------------------------- | :---------------------------------------------------- |
| Queryビルダー        | ```Illuminate\Database\Query\Builder```               | なし                                                  |
| Eloquentビルダー     | ```Illuminate\Database\Eloquent\Builder```            | Queryビルダー，                                       |
| Eloquentリレーション | ```Illuminate\Database\Eloquent\Relations\Relation``` | Queryビルダー，Eloquentビルダー，                     |
| Eloquentモデル       | ```Illuminate\Database\Eloquent\Model```              | Queryビルダー，Eloquentビルダー，Eloquentリレーション |

#### ・Eloquentビルダー

Eloquentビルダーが持つcrudを実行するメソッドの返却値型と返却値は以下の通りである．その他のメソッドについては，以下のリンクを参考にせよ．

参考：https://laravel.com/api/8.x/Illuminate/Database/Eloquent/Builder.html

| CRUDメソッドの種類 |         返却値型         |               返却値               | 返却値の説明         |
| :----------------: | :----------------------: | :--------------------------------: | :------------------- |
|       create       |     collection/$this     |     ```{id:1, name: テスト}```     | 作成したオブジェクト |
|        find        | collection/Builder/Model |     ```{id:1, name:テスト}```      | 取得したオブジェクト |
|       update       |          mixed           | ```0```，```1```，```2```，```3``` | 変更したレコード数   |
|       delete       |          mixed           | ```0```，```1```，```2```，```3``` | 変更したレコード数   |

#### ・Eloquentモデル

Eloquentモデルが持つcrudを実行するメソッドの返却値型と返却値は以下の通りである．その他のメソッドについては，以下のリンクを参考にせよ．

参考：https://laravel.com/api/8.x/Illuminate/Database/Eloquent/Model.html

| CRUDメソッドの種類 | 返却値型 |         返却値          | 返却値の説明 |
| :----------------: | :------: | :---------------------: | :----------- |
|       update       |   bool   | ```true```，```false``` | 結果の真偽値 |
|        save        |   bool   | ```true```，```false``` | 結果の真偽値 |
|       delete       |   bool   | ```true```，```false``` | 結果の真偽値 |

<br>

### CREATE

#### ・```create```メソッド

INSERT文を実行する．Eloquentモデルには```create```メソッドがないため，代わりにEloquentビルダーが持つ```create```メソッドがコールされる．```create```メソッドに挿入先のカラムと値を渡し，これを実行する．別の方法として，Eloquentビルダーの```fill```メソッドで挿入先のカラムと値を設定し，```save```メソッドを実行しても良い．```save```メソッドはUPDATE処理も実行できるが，```fill```メソッドでID値を割り当てない場合は，CREATE処理が実行される．```create```メソッドまたは```save```メソッドによるCREATE処理では，レコードの挿入後に，```lastInsertId```メソッドに相当する処理が実行される．これにより，挿入されたレコードのプライマリーキーが取得され，EloquentモデルのID値のプロパティに保持される．

参考：

- https://codelikes.com/laravel-eloquent-basic/#toc9
- https://qiita.com/henriquebremenkanp/items/cd13944b0281297217a9

**＊実装例＊**

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Foo;
use Illuminate\Http\Request;

class FooController extends Controller
{
    /**
     * @param Request $request
     */
    public function createFoo(Request $request)
    {
        $foo = new Foo();

        // INSERT文を実行する．また同時にIDを取得する．
        $foo->create($request->all());

        // 以下の実装でもよい
        // $foo->fill($request->all())->save();

        // 処理後にはEloquentモデルにID値が保持されている．
        $foo->id();

        // 続きの処理
    }
}

```

Eloquentモデルには```fillable```プロパティを設定しておく．

```php
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class FooDTO extends Model
{
    // 更新可能なカラム
    protected $fillable = [
        "name",
        "age",
    ];
}
```

<br>

### READ

#### ・```all```メソッド

レコードを全て取得するSELECT句を発行する．MySQLを含むDBエンジンでは，取得結果に標準の並び順が存在しないため，プライマリーキーの昇順で取得したい場合は，```orderBy```メソッドを用いて，明示的に並び替えるようにする．Eloquentモデルには```all```メソッドがないため，代わりにEloquentビルダーが持つ```all```メソッドがコールされる．全てのプライマリーキーのCollection型を配列型として返却する．```toArray```メソッドで配列型に再帰的に変換できる．

参考：

- https://stackoverflow.com/questions/54526479/what-is-the-dafault-ordering-in-laravel-eloquent-modelall-function

- https://laravel.com/api/8.x/Illuminate/Support/Collection.html#method_all

- https://readouble.com/laravel/8.x/ja/eloquent.html#retrieving-models

**＊実装例＊**

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Foo;
use Illuminate\Database\Eloquent\Collection;

class FooController extends Controller
{
    /**
     * @return Collection
     */
    public function findAll(): Collection
    {
        $foo = new Foo();

        return $foo->all();
    }
}
```

#### ・```find```メソッド

レコードを1つ取得するSELECT句を発行する．Eloquentモデルには```find```メソッドがないため，代わりにEloquentビルダーが持つ```find```メソッドがコールされる．引数としてプライマリーキーを渡した場合，指定したプライマリーキーを持つEloquentモデルを返却する．```toArray```メソッドで配列型に変換できる．

参考：

- https://laravel.com/api/8.x/Illuminate/Database/Query/Builder.html#method_find
- https://readouble.com/laravel/8.x/ja/eloquent.html#retrieving-single-models

**＊実装例＊**

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Foo;
use Illuminate\Database\Eloquent\Collection;

class FooController extends Controller
{
    /**
     * @param int $id
     * @return Collection
     */
    public function findById(int $id): Collection
    {
        $foo = new Foo();

        return $foo->find($id);
    }
}
```

#### ・```first```メソッド

取得されたコレクション型データの1つ目の要素の値を取得する．ユニーク制約の課せられたカラムを```where```メソッドの対象とする場合，コレクションとして取得されるが，コレクションが持つEloquentモデルは1つである．foreachを用いてコレクションからEloquentモデルを取り出してもよいが，無駄が多い．そこで，```first```メソッドを用いて，Eloquentモデルを直接取得する．

**＊実装例＊**

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Foo;
use Illuminate\Database\Eloquent\Collection;

class FooController extends Controller
{
    /**
     * @param string $emailAddress
     * @return Foo
     */
    public function findByEmail(string $emailAddress): Foo
    {
        $foo = new Foo();

        return $foo->where('foo_email', $emailAddress)->first();
    }
}

```

#### ・```limit```メソッド，```offset```メソッド

開始地点から指定した件数のレコードを全て取得するSELECT句を発行する．これにより，ページネーションで，１ページ当たりのレコード数（```limit```）と，次のページの開始レコード（```offset```）を定義できる．これらのパラメーターはクエリパラメーターとして渡すと良い．

参考：https://readouble.com/laravel/8.x/ja/queries.html#ordering-grouping-limit-and-offset

**＊実装例＊**

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Foo;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;

class FooController extends Controller
{
    /**
     * @param Request $request
     * @return Collection
     */
    public function findAllByPagination(Request $request): Collection
    {
        $foo = new Foo();

        return $foo->offset($request->offset)
            ->limit($request->limit)
            ->get();
    }
}
```

#### ・```orderBy```メソッド

指定したカラムの昇順/降順でレコードを並び替えるSELECT句を発行する．並び替えた結果を取得するためには，```get```メソッドを用いる．プライマリーキーの昇順で取得する場合，```all```メソッドではなく，```orderBy```メソッドを用いて，プライマリーキーの昇順を明示的に設定する．

参考：https://readouble.com/laravel/8.x/ja/queries.html#ordering-grouping-limit-and-offset

**＊実装例＊**

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Foo;
use Illuminate\Database\Eloquent\Collection;

class FooController extends Controller
{
    /**
     * @return Collection
     */
    public function findAllByAsc(): Collection
    {
        $foo = new Foo();

        // 昇順
        return $foo->orderBy('foo_id', 'asc')->get();
    }
    
    /**
     * @return Collection
     */
    public function findAllByDesc(): Collection
    {
        $foo = new Foo();

        // 降順
        return $foo->orderBy('foo_id', 'desc')->get();
    }    
}
```

#### ・```sortBy```メソッド

指定したカラムの昇順でレコードを並び替えるSELECT句を発行する．

参考：https://readouble.com/laravel/8.x/ja/collections.html#method-sortby

**＊実装例＊**

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Foo;
use Illuminate\Database\Eloquent\Collection;

class FooController extends Controller
{
    /**
     * @return Collection
     */
    public function findAllByAsc(): Collection
    {
        $foo = new Foo();

        return $foo->all()->sortBy('foo_id');
    }
}
```

#### ・```sortByDesc```メソッド

指定したカラムの降順でレコードを並び替えるSELECT句を発行する．

参考：https://readouble.com/laravel/8.x/ja/collections.html#method-sortbydesc

```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Foo;
use Illuminate\Database\Eloquent\Collection;

class FooController extends Controller
{
    /**
     * @return Collection
     */
    public function findAllByDesc(): Collection
    {
        $foo = new Foo();

        return $foo->all()->sortByDesc('foo_id');
    }
}
```

#### ・```with```メソッド

親テーブルにアクセスして全てのデータを取得し，親テーブルのEloquentモデルのプロパティに子テーブルのレコードを保持する．この仕組みをEagerロードという．Eloquentモデルには```with```メソッドがないため，代わりにEloquentビルダーが持つ```with```メソッドがコールされる．テーブル間に一対多（親子）のリレーションシップがある場合に用いる．N+1問題を防げる．

参考：https://readouble.com/laravel/8.x/ja/eloquent-relationships.html#eager-loading

ただし，```with```メソッドに他のメソッドをチェーンしてしまうと，Eagerロードの後にSQLを発行されてしまうため，Eagerロードの恩恵を得られなくなることに注意する．

参考：https://qiita.com/shosho/items/abf6423283f761703d01#%E3%83%AA%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%83%A1%E3%82%BD%E3%83%89%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E3%81%97%E3%81%BE%E3%81%86%E3%81%A8-eager-loading-%E3%81%AB%E3%81%97%E3%81%A6%E3%81%A6%E3%82%82%E6%84%8F%E5%91%B3%E3%81%8C%E3%81%AA%E3%81%84%E3%81%AE%E3%81%A7%E6%B3%A8%E6%84%8F

**＊実装例＊**

コントローラーにて，Department（親）と，これに紐付くEmployee（子）を読み出す．これらのモデルの間では，```hasMany```メソッドと```belongsTo```メソッドを用いて，テーブルにおける一対多のリレーションを定義しておく．

```php
<?php

namespace App\Http\Controllers;

use App\Models\Department;

class EmployeeController
{
    public function getEmployeesByDepartment()
    {
        $department = new Department();

        // Departmentに属するEmployeesを全て読み出します．
        // （departments : employees = 1 : 多）
        $employees = $department->with("employees")->get();

        foreach ($employees as $employee) {
            // ここではDBアクセスはせずに，プロパティに保持された値を取得するだけ．
            $name = $employee->name;
            
        }

        // 続きの処理
    }
}
```

Department（親）に，departmentsテーブルとemployeesテーブルの間に，一対多の関係を定義する．

```php
<?php

namespace App\Models\Department;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    /**
     * 主キーとするカラム
     *
     * @var string
     */
    protected $primaryKey = "department_id";

    /**
     * 一対多の関係を定義します．
     * （デフォルトではemployee_idに紐付けます）
     *
     * @return HasMany
     */
    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }
}
```

また，Employee（子）に，反対の多対一の関係を定義する．

```php
<?php

namespace App\Models\Department;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employee extends Model
{
    /**
     * 主キーとするカラム
     * 
     * @var string 
     */
    protected $primaryKey = "employee_id";

    /**
     * 多対一の関係を定義します．
     * （デフォルトではdepartment_idに紐付けます）
     * 
     * @return BelongsTo
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
}
```

<br>

### UPDATE

#### ・```save```メソッド

UPDATE文を実行する．Eloquentビルダーの```fill```メソッドで挿入先のカラムと値を設定し，```save```メソッドを実行する．```save```メソッドはCREATE処理も実行できるが，```fill```メソッドでID値を割り当てた場合は，UPDATE処理が実行される．

参考：

- https://codelikes.com/laravel-eloquent-basic/#toc9
- https://qiita.com/henriquebremenkanp/items/cd13944b0281297217a9

**＊実装例＊**

```php
<?php

namespace App\Infrastructure\Repositories;

use App\Http\Controllers\Controller;
use App\Domain\Foo\Entities;
use Illuminate\Http\Request;

class FooController extends Controller
{
    /**
     * @param Request $request
     */
    public function updateFoo(Request $request)
    {
        $foo = new Foo();

        // UPDATE文を実行する．
        $foo->fill($request->all())->save();

        // 続きの処理
    }
}
```

Eloquentモデルには```fillable```プロパティを設定しておく．

```php
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class FooDTO extends Model
{
    // 更新可能なカラム
    protected $fillable = [
        "name",
        "age",
    ];
}
```

<br>

### DELETE

#### ・```destroy```/```delete```メソッド（物理削除）

DELETE文を実行する．Eloquentモデルの```destroy```/```delete```メソッドを用いる．手順として，Eloquentビルダーの```find```メソッドで削除先のModelを検索する．返却されたEloquentビルダーの```destroy```/```delete```メソッドをコールし，自身を削除する．

#### ・SoftDeletesの有効化（論理削除）

削除フラグを更新するUPDATE文を実行する．Eloquentモデルの```destroy```/```delete```メソッドを用いる．手順として，テーブルに対応するModelにて，SoftDeletesのTraitを読み込む．マイグレーション時に追加される```delete_at```カラムをSQLで取得する時に，DataTimeクラスに変換できるようにしておく．

**＊実装例＊**

```php
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FooDTO extends Model
{
    /**
    * Traitの読み出し
    */
    use SoftDeletes;

    /**
     * 読み出し時にCarbonのDateTimeクラスへ自動変換するカラム
     *
     * @var array
     */
    protected $dates = [
        "deleted_at"
    ];
}
```

マイグレーションファイルにて```softDeletes```メソッドを用いると，削除フラグとして```deleted_at```カラムが追加されるようになる．```deleted_at```カラムのデフォルト値は```NULL```である．

```php
<?php
  
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFooTable extends Migration
{
    /**
     * マイグレート
     *
     * @return void
     */
    public function up()
    {
        Schema::create("foo", function (Blueprint $table) {
            
            // ～ 中略 ～
            
            // deleted_atカラムを追加する．
            $table->softDeletes();
            
            // ～ 中略 ～
            
        });
    }

    /**
     * ロールバック
     *
     * @return void
     */
    public function down()
    {
        Schema::drop("foo");
    }
}
```

上記の状態で，同様に```destroy```/```delete```メソッドを用いて，自身を削除する．物理削除ではなく，```deleled_at```カラムが更新されるようになる．```find```メソッドは，```deleled_at```カラムが```NULL```でないレコードを読み出さないため，論理削除を実現できる．

<br>

### N+1問題の解決

#### ・N+1問題とは

親テーブルを経由して子テーブルにアクセスする時に，親テーブルのレコード数分のSQLを発行してしまうアンチパターンのこと．

#### ・問題が起こる実装

反復処理の中で子テーブルのレコードにアクセスしてしまう場合，N+1問題が起こる．内部的には，親テーブルへのSQLと，Where句を持つSQLが親テーブルのレコード数分だけ発行される．

```php
<?php
    
$departments = Department::all(); // 親テーブルにSQLを発行（1回）

foreach($departments as $department) {
    $department->employees; // 親テーブルのレコード数分のWhere句SQLが発行される（N回）
}
```

```bash
# 1回
select * from `departments`

# N回
select * from `employees` where `department_id` = 1
select * from `employees` where `department_id` = 2
select * from `employees` where `department_id` = 3
...
```

#### ・解決方法

反復処理の前に小テーブルにアクセスしておく．データアクセス時に```with```メソッドを用いると，親テーブルへのアクセスに加えて，親テーブルのEloquentモデルのプロパティに子テーブルのレコードを保持するように処理する．そのため，反復処理ではプロパティからデータを取り出すだけになる．内部的には，親テーブルへのSQLと，In句を用いたSQLが発行される．

```php
<?php

$departments = Department::with('employees')->get(); // SQL発行（2回）

foreach($departments as $department) {
    $department->employees; // キャッシュを用いるのでSQLの発行はされない（0回）
}
```

```bash
# 2回
select * from `departments`
select * from `employees` where `department_id` in (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ... 100)
```

<br>

## 04. Laravelへのリポジトリパターン導入

### 背景

LaravelはActive Recordパターンを採用しており，これはビジネスロジックが複雑でないアプリケーションに適している．ただ，ビジネスロジックが複雑なアプリケーションに対しても，Laravelを用いたい場面がある．その場合，Laravelにリポジトリパターンを導入することが選択肢の1つになる．リポジトリパターンについては，以下のリンクを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_architecture_backend_domain_driven_design_clean_architecture.html

<br>

### 工夫

#### ・DTOクラスの導入

ビジネスロジック用ドメインモデルと，Eloquentモデルを継承した詰め替えモデル（例：DTOクラス）を用意する．詰め替えモデルをドメインモデルに変換する処理をメソッドとして切り分けておくと便利である．ドメインモデルとDTOクラスの間でデータを詰め替えるようにすると，DTOクラスがドメインモデルとデータベースの間でレコードのやり取りを仲介し，これらを疎結合にしてくれる．そのため，Repositoryパターンを実現できる．

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Foo\DTOs;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

final class FooDTO extends Model
{
    use HasFactory;

    /**
     * @var array
     */
    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    /**
     * @var array
     */
    protected $fillable = [
        'name',
        'age',
    ];
    /**
     * @var int
     */
    private int $id;

    /**
     * @var string
     */
    private string $name;

    /**
     * @var int
     */
    private int $age;

    /**
     * @var string
     */
    private string $email;

    /**
     * @return Foo
     */
    public function toFoo(): Foo
    {
        return new Foo(
            new FooId($this->id),
            new FooName($this->name),
            new FooAge($this->age),
        );
    }
}
```

<br>

### CREATE

#### ・```create```メソッド

**＊実装例＊**

```php
<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Foo\Entities\Foo;
use App\Domain\Foo\Repositories\FooRepository as DomainFooRepository;
use App\Infrastructure\Foo\DTO\FooDTO;

class FooRepository extends Repository implements DomainFooRepository
{
    /**
     * @var FooDTO
     */
    private FooDTO $fooDTO;

    public function __construct(FooDTO $fooDTO)
    {
        $this->fooDTO = $fooDTO;
    }

    /**
     * @param Foo $foo
     * @return void
     */
    public function create(Foo $foo): void
    {
        $this->fooDTO
            // INSERT文を実行する．
            ->create([
                // ドメインモデルのデータをDTOに詰め替える．
                "name"  => $foo->name(),
                "age"   => $foo->age(),
            ]);

//        以下の実装でも良い．
//        $this->fooDTO
//            ->fill([
//                "name"  => $foo->name(),
//                "age"   => $foo->age(),
//            ])
//            ->save();
    }
}
```

```php
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class FooDTO extends Model
{
    // 更新可能なカラム
    protected $fillable = [
        "name",
        "age",
    ];
}
```

<br>

### READ

#### ・```find```メソッド

**＊実装例＊**

```php
<?php

namespace App\Infrastructure\Foo\Repositories;

use App\Domain\Foo\Entities\Foo;
use App\Domain\Foo\Ids\FooId;
use App\Domain\Foo\Repositories\FooRepository as DomainFooRepository;
use App\Infrastructure\Foo\DTOs\FooDTO;

class FooRepository extends Repository implements DomainFooRepository
{
    /**
     * @var FooDTO
     */
    private FooDTO $fooDTO;

    public function __construct(FooDTO $fooDTO)
    {
        $this->fooDTO = $fooDTO;
    }

    /**
     * @param FooId $fooId
     * @return Foo
     */
    public function findById(FooId $fooId): Foo
    {
        $fooDTO = $this->fooDTO
            ->find($fooId->id());

        // DBアクセス処理後のDTOをドメインモデルに変換する．
        return new Foo(
            $fooDTO->id(),
            $fooDTO->name(),
            $fooDTO->age(),
            $fooDTO->email()
        );
    }
}
```

#### ・```all```メソッド

**＊実装例＊**

```php
<?php

namespace App\Infrastructure\Foo\Repositories;

use App\Domain\Foo\Entities\Foo;
use App\Domain\Foo\Repositories\FooRepository as DomainFooRepository;
use App\Infrastructure\Foo\DTOs\FooDTO;

class FooRepository extends Repository implements DomainFooRepository
{
    /**
     * @var FooDTO
     */
    private FooDTO $fooDTO;
    
    public function __construct(FooDTO $fooDTO)
    {
        $this->fooDTO = $fooDTO;
    }   
  
    /**
     * @return array 
     */
    public function findAll(): array
    {
        $fooDTOs = $this->fooDTO
            ->all();

        $foos = [];
        foreach ($fooDTOs as $fooDTO)
            // DBアクセス後のDTOをドメインモデルに変換する． 
            $foos = new Foo(
                $fooDTO->id(),
                $fooDTO->name(),
                $fooDTO->age(),
                $fooDTO->email(),
            );

        return $foos;
    }
}
```

#### ・```with```メソッド

<br>

### UPDATE

#### ・```save```メソッド

**＊実装例＊**

```php
<?php

namespace App\Infrastructure\Foo\Repositories;

use App\Domain\Foo\Entities\Foo;
use App\Domain\Foo\Repositories\FooRepository as DomainFooRepository;
use App\Infrastructure\Foo\DTOs\FooDTO;

class FooRepository extends Repository implements DomainFooRepository
{
    /**
     * @var FooDTO
     */
    private FooDTO $fooDTO;

    public function __construct(FooDTO $fooDTO)
    {
        $this->fooDTO = $fooDTO;
    }

    /**
     * @param Foo $foo
     * @return void
     */
    public function save(Foo $foo): void
    {
        $this->fooDTO
            // ドメインモデルのデータをDTOに詰め替える．
            ->fill([
                "name"  => $foo->name(),
                "age"   => $foo->age(),
            ])
            // UPDATE文を実行する．
            ->save();
    }
}
```

```php
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class FooDTO extends Model
{
    // 更新可能なカラム
    protected $fillable = [
        "name",
        "age",
    ];
}
```

<br>

### DELETE

#### ・```destroy```/```delete```メソッド

**＊実装例＊**

```php
<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Foo\Entities\Foo;
use App\Domain\Foo\Ids\FooId;
use App\Domain\Foo\Repositories\FooRepository as DomainFooRepository;
use App\Infrastructure\Foo\DTOs\FooDTO;

class FooRepository extends Repository implements DomainFooRepository
{
    /**
     * @var FooDTO
     */
    private FooDTO $fooDTO;

    public function __construct(FooDTO $fooDTO)
    {
        $this->fooDTO = $fooDTO;
    }

    /**
     * @param FooId $fooId
     * @return void
     */
    public function delete(FooId $fooId): void
    {
        // destroyメソッドでレコードを削除する．
        $this->fooDTO->destroy($fooId->id());
        
        // deleteメソッドを用いても良い．
        // $this->fooDTO->find($fooId->id())->delete();
    }
}
```

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FooController extends Controller
{
    public function __construct(FooRepository $fooRepository)
    {
        $this->fooRepository = $fooRepository;
    }

    /**
     * @param FooId $fooId
     * @return mixed
     */
    public function delete(FooId $fooId)
    {
        $this->fooRepository
            ->delete($fooId);

        return response()->view("foo")
            ->setStatusCode(200);
    }
}
```

<br>
