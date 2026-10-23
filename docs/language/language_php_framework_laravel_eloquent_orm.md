---
title: 【IT技術の知見】Eloquent ORM＠Laravel
description: Eloquent ORM＠Laravelの知見を記録しています。
---

# Eloquent ORM＠Laravel

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. Eloquent ORM とは

Laravel に組み込まれている ORM。

Active Record パターンで実装されている。

内部には PDO が使用されており、Laravel クエリビルダーよりも抽象度が高い。

> - [8.x Eloquentの準備 Laravel](https://readouble.com/laravel/8.x/ja/eloquent.html)
> - https://codezine.jp/article/detail/12805

<br>

## 01-02. Active Record パターン

### Active Record パターンとは

テーブルとモデルが一対一の関係になるデザインパターンのこと。

加えて、テーブル間のリレーションシップがそのままモデル間の依存関係にも反映される。

ビジネスロジックが複雑でないアプリケーションの開発に適している。

![ActiveRecord](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ActiveRecord.png)

<br>

### メリット/デメリット

| 項目   | メリット                                                                                                                                                                                                                                                                            | デメリット                                                                                                                                                                                                                                                                                                     |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 保守性 | テーブル間のリレーションが、そのままモデル間の依存関係になるため、モデル間の依存関係を考える必要がなく、開発が早い。そのため、ビジネスロジックが複雑でないアプリケーションの開発に適している。                                                                                      | ・反対に、モデル間の依存関係によってテーブル間のリレーションが決まる。そのため、複雑な業務ロジックでモデル間が複雑な依存関係を持つと、テーブル間のリレーションも複雑になっていってしまう。<br>・モデルに対応するテーブルから必要なカラムだけでなく、すべてのカラムを取得するため、アプリに余分な負荷がかかる。 |
| 拡張性 | テーブル間のリレーションがモデル間の依存関係によって定義されており、JOIN 句を使用せずに、各テーブルから必要なレコードを読み込める。そのため、テーブルを増やすやすい。                                                                                                               |                                                                                                                                                                                                                                                                                                                |
| 可読性 | ・モデルとそのプロパティがそのままテーブルになるため、モデルを作成するためにどのテーブルからレコードを読み込むのかを推測しやすい (User モデル ⇄ users テーブル) 。<br>・リレーションを理解する必要がなく、複数のテーブルに対して無秩序に SQL を発行するような設計実装になりにくい。 |                                                                                                                                                                                                                                                                                                                |

<br>

## 03. Eloquent モデル

### テーブル設計に基づく Eloquent モデル

#### ▼ Eloquent モデルの継承

Eloquent モデルを継承したクラスは、`INSERT` 文や `UPDATE` 文などのデータアクセスロジックを使用できるようになる。

**＊実装例＊**

```injectablephp
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class Foo extends Model
{
    // クラスチェーンによって、データアクセスロジックをコール
}
```

#### ▼ テーブルの定義

テーブルを定義するため、`table` プロパティにテーブル名を割り当てる。

ただし、`table` プロパティにテーブル名を代入する必要はない。

Eloquent がクラス名の複数形をテーブル名と見なし、これをスネークケースにした文字列を `table` プロパティに自動的に代入する。

また、テーブル名を自前で命名したい場合は、代入による Override を行ってもよい。

**＊実装例＊**

```injectablephp
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class Foo extends Model
{
    public function __construct(
        array $attributes = [],
        string $table = "foos"
    )
    {
        $this->table = $table;

        parent::__construct($attributes);
    }

     // Eloquentモデルと関連しているテーブル
}
```

#### ▼ テーブル間リレーションシップの定義

ER 図における各テーブルのリレーションシップを元に、モデル間の関連性を定義する。

`hasOne()` 関数、`hasMany()` 関数、`belongsTo()` 関数を使用して表す。

**＊実装例＊**

Department モデルで、`hasMany()` 関数を使用して、Department モデル (親) と Employees モデル (子) のテーブル関係を定義する。

```injectablephp
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    public function __construct(
        array $attributes = [],
        string $primaryKey = "department_id"
    )
    {
        $this->primaryKey = $primaryKey;

        parent::__construct($attributes);
    }

     // 主キーとするカラム

    public function employees(): HasMany
    {
        // 一対多の関係を定義します。
        // デフォルトではemployee_idに紐付けます。
        return $this->hasMany(Employee::class);
    }
}
```

また、Employees モデルでは、`belongsTo()` 関数を使用して、Department モデル (親) と Employees モデル (子) のテーブル関係を定義する。

```injectablephp
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employee extends Model
{
    public function __construct(
        array $attributes = [],
        string $primaryKey = "employee_id"
    )
    {
        $this->primaryKey = $primaryKey;

        parent::__construct($attributes);
    }

     // 主キーとするカラム

    public function department(): BelongsTo
    {
        // 多対一の関係を定義します。
        // デフォルトではdepartment_idに紐付けます。
        return $this->belongsTo(Department::class);
    }
}
```

リレーションを基に JOIN 句の SQL を発行するために、Department モデル (親) の `hasMany()` 関数を実行する。

これにより、Department モデルの ID に紐付く Employees モデル (子) を配列で参照できる。

```injectablephp
<?php

// Departmentオブジェクトを取得
$department = Department::find(1);

// 部署ID=1に紐付く全てのemployeeオブジェクトをarray型で取得
$employees = $department->employees();
```

> - [8.x Eloquent:リレーション Laravel](https://readouble.com/laravel/8.x/ja/eloquent-relationships.html#one-to-one)
> - [8.x Eloquent:リレーション Laravel](https://readouble.com/laravel/8.x/ja/eloquent-relationships.html#one-to-many)
> - [8.x Eloquent:リレーション Laravel](https://readouble.com/laravel/8.x/ja/eloquent-relationships.html#one-to-many-inverse)

#### ▼ 主キーカラムの定義

Eloquent は、`primaryKey` プロパティの値を主キーのカラム名と見なす。

`keyType` プロパティで主キーのデータ型、また `incrementing` プロパティで主キーの自動増分を有効化するか否かを設定できる。

**＊実装例＊**

```injectablephp
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class Foo extends Model
{
    public function __construct(
        array $attributes = [],
        string $primaryKey = "foo_id",
        string $keyType = "int",
        bool $incrementing = true
    )
    {
        $this->primaryKey = $primaryKey;
        $this->keyType = $keyType;
        $this->incrementing = $incrementing;

        parent::__construct($attributes);
    }

     // 主キーとするカラム (デフォルトではidが主キー)

     // 主キーのデータ型

     // 主キーの自動増分の有効化します。
}
```

#### ▼ TIMESTAMP 型カラムの定義

Eloquent は、`timestamps` プロパティの値が `true` のときに、Eloquent モデルに紐付くテーブルの `created_at` カラムと `updated_at` カラムを自動的に更新する。

また、TIMESTAMP 型カラム名を自前で命名したい場合は、代入による Overide を行ってもよい。

**＊実装例＊**

```injectablephp
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class Foo extends Model
{
    public function __construct(
        array $attributes = [],
        bool $timestamps = true
    )
    {
        $this->timestamps = $timestamps;

        parent::__construct($attributes);
    }

    const CREATED_AT = "created_date_time";
    const UPDATED_AT = "updated_date_time";

     // Eloquentモデルのタイムスタンプを更新するかの指示します。
}
```

#### ▼ TIMESTAMP 型カラム読み出し時のデータ型変換

DB からタイムスタンプ型カラムの Read 処理を実行すると同時に、Carbon の DateTime クラスに変換したい場合、`data` プロパティにて、カラム名を設定する。

**＊実装例＊**

```injectablephp
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    public function __construct(
        array $attributes = [],
        array $dates = [
            "created_at",
            "updated_at",
            "deleted_at"
        ]
    )
    {
        $this->dates = $dates;

        parent::__construct($attributes);
    }

    /**
     * CarbonのDateTimeクラスに自動変換したいカラム名
     */

}
```

#### ▼ カラムデフォルト値の定義

特定のカラムのデフォルト値を設定したい場合、`attributes` プロパティにて、カラム名と値を定義する。

**＊実装例＊**

```injectablephp
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class Foo extends Model
{
    public function __construct(
        array $attributes = [],
        array $defaultAttributes = [
            "is_deleted" => false,
        ]
    )
    {
        $this->attributes = $defaultAttributes;

        parent::__construct($attributes);
    }

    /**
     * カラム名とデフォルト値
     */

}
```

#### ▼ 変更できる/できないカラムの定義

変更できるカラム名を `fillable` プロパティを使用して定義する。

カラムが増えるたびに、実装する必要がある。

**＊実装例＊**

```injectablephp
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class Foo extends Model
{
    public function __construct(
        array $attributes = [],
        array $fillable = [
            "name",
        ]
    )
    {
        $this->fillable = $fillable;

        parent::__construct($attributes);
    }

    /**
     * カラム名
     */

}
```

もしくは、変更できないカラム名を `guarded` プロパティで定義する。

これらのいずれかの設定は、Eloquent モデルで必須である。

```injectablephp
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class Foo extends Model
{
    public function __construct(
        array $attributes = [],
        array $guarded = [
            "bar",
        ]
    )
    {
        $this->guarded = $guarded;

        parent::__construct($attributes);
    }

    /**
     * カラム名
     */

}
```

<br>

### 使用に注意する機能

#### ▼ セッター

Laravel では、プロパティを定義しなくても、Eloquent モデルからプロパティをコールすれば、処理のたびに動的にプロパティを定義できる。

しかし、この機能のプロパティは public アクセスである必要があるため、オブジェクト機能のメリットを享受できない。

そのため、これを使用せずに、`constructor()` 関数を使用したコンストラクタインジェクション、またはセッターインジェクションを使用するようにする。

**＊実装例＊**

```injectablephp
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class Foo extends Model
{

    private FooName $fooName;

    /**
     * 名前を取得します。
     */
    public function __construct(FooName $fooName)
    {
        $this->fooName = $fooName;
    }
}
```

#### ▼ ゲッター

Laravel では、`getFooBarAttribute()` という名前の関数を、`foo_bar` という名前でコールできる。

一見、プロパティをコールしているように見えるため、注意が必要である。

**＊実装例＊**

```injectablephp
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class Foo extends Model
{

    private FooName $fooName;

    /**
     * 名前を取得します。
     */
    public function getNameAttribute(): string
    {
        return $this->fooName . "です。";
    }
}
```

```injectablephp
<?php

$foo = Foo::find(1);

// nameプロパティを取得しているわけでなく、getNameAttribute関数を実行している。
$fooName = $foo->name;
```

<br>

### データ型変換

#### ▼ シリアライズ

PHP のオブジェクト型を JSON に変換 (シリアライズ) する。

**＊実装例＊**

```injectablephp
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

```injectablephp
<?php

$users = App\User::all();

// Array型に変換する
return $users->toArray();
```

#### ▼ デシリアライズ

JSON を PHP のオブジェクト型に変換 (デシリアライズ) する。

**＊実装例＊**

```injectablephp
// 実装中...
```

<br>

### フィルタリング

#### ▼ `filter()` 関数

コールバック関数の返り値が `true` であった要素をすべて抽出する。

**＊実装例＊**

```injectablephp
<?php

$collection = collect([1, 2, 3, 4]);

// trueを返却した要素を全て抽出する
$filtered = $collection->filter(function (mixed $value, mixed $key): bool {
    return $value > 2;
});

$filtered->all();

// [3, 4]
```

補足として、複数の条件を設定したいときは、早期リターンを使用する必要がある。

**＊実装例＊**

```injectablephp
<?php

$collection = collect([1, 2, 3, 4, "yes"]);

// 複数の条件で抽出する。
$filtered = $collection->filter(function (mixed $value, mixed $key): bool {

    // まずはyesを検証する。
    if($value == "yes") {
        return true;
    }

    return $value > 2;
});

$filtered->all();

// [3, 4, "yes"]
```

#### ▼ `first()` 関数

コールバック関数の返り値が `true` であった最初の要素のみを抽出する。

**＊実装例＊**

```injectablephp
<?php

$collection = collect([1, 2, 3, 4]);

// trueを返却した要素のみ抽出する
$filtered = $collection->first(function (mixed $value, mixed $key): bool {
    return $value > 2;
});

// 3
```

<br>

## 03-02. Eloquent モデルとビルダーによる CRUD

### CRUD 関数の返り値型と返却値

#### ▼ CRUD 関数を持つクラス

Eloquent モデルを継承すると、以下のクラスから関数をコールできるようになる。

Eloquent モデルにはより上位の関数が定義されていないことがあり、もし定義されていないものがコールされた場合、`__callStatic()` 関数 (静的コールによる) や `__call()` 関数 (非静的コールによる) が代わりにコールされ、より上位クラスの関数をコールできる。

どちらの方法でコールしても同じである。

| クラス                | 名前空間                                          | `__call()` 関数を経由してコールできるクラス              |
| :-------------------- | :------------------------------------------------ | :------------------------------------------------------- |
| Query ビルダー        | `Illuminate\Database\Query\Builder`               | なし                                                     |
| Eloquent ビルダー     | `Illuminate\Database\Eloquent\Builder`            | Query ビルダー、                                         |
| Eloquent リレーション | `Illuminate\Database\Eloquent\Relations\Relation` | Query ビルダー、Eloquent ビルダー、                      |
| Eloquent モデル       | `Illuminate\Database\Eloquent\Model`              | Query ビルダー、Eloquent ビルダー、Eloquent リレーション |

> - [PHP: オーバーロード - Manual](https://www.php.net/manual/ja/language.oop5.overloading.php#object.call)
> - [【Laravel】 第1回 Eloquent ソースコードリーディング - モデルの取得 #PHP - Qiita](https://qiita.com/mpyw/items/7c7e8dc665584122a275)

#### ▼ Eloquent ビルダー

Eloquent ビルダーが持つ crud を実行する関数の返り値型と返却値は以下の通りである。

その他の関数については、以下のリンクを参考にせよ。

| CRUD 関数の種類 |         返却値型         |         返却値         | 返却値の説明         |
| :-------------: | :----------------------: | :--------------------: | :------------------- |
|     create      |     collection/$this     | `{id:1, name: テスト}` | 作成したオブジェクト |
|      find       | collection/Builder/Model | `{id:1, name:テスト}`  | 取得したオブジェクト |
|     update      |          mixed           |   `0`、`1`、`2`、`3`   | 変更したレコード数   |
|     delete      |          mixed           |   `0`、`1`、`2`、`3`   | 変更したレコード数   |

> - https://laravel.com/api/8.x/Illuminate/Database/Eloquent/Builder.html

#### ▼ Eloquent モデル

Eloquent モデルが持つ crud を実行する関数の返り値型と返却値は以下の通りである。

その他の関数については、以下のリンクを参考にせよ。

| CRUD 関数の種類 | 返却値型 |     返却値      | 返却値の説明      |
| :-------------: | :------: | :-------------: | :---------------- |
|     update      |   bool   | `true`、`false` | 結果の boolean 値 |
|      save       |   bool   | `true`、`false` | 結果の boolean 値 |
|     delete      |   bool   | `true`、`false` | 結果の boolean 値 |

> - https://laravel.com/api/8.x/Illuminate/Database/Eloquent/Model.html

<br>

### CREATE

#### ▼ `create()` 関数

INSERT 文を実行する。

Eloquent モデルには `create()` 関数がない。代わりに、 Eloquent ビルダーが持つ `create()` 関数をコールする。

`create()` 関数に挿入先のカラムと値を渡し、これを実行する。

別の方法として、Eloquent ビルダーの `fill()` 関数で挿入先のカラムと値を設定し、`save()` 関数を実行してもよい。

`save()` 関数は `UPDATE` 処理も実行できるが、`fill()` 関数で ID 値を割り当てない場合は、`CREATE` 処理が実行される。

`create()` 関数または `save()` 関数による `CREATE` 処理では、レコードの挿入後に、`lastInsertId()` 関数に相当する処理が実行される。

これにより、挿入されたレコードのプライマリーキーが取得され、Eloquent モデルの ID 値のプロパティに保持される。

**＊実装例＊**

```injectablephp
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Foo;
use Illuminate\Http\Request;

class FooController extends Controller
{

    public function createFoo(Request $request): void
    {
        $foo = new Foo();

        DB::transaction(function () use ($foo, $request): void {
            // INSERT文を実行する。また同時にIDを取得する。
            $foo->create($request->all());

            // 以下の実装でもよい
            // $foo->fill($request->all())->save();
        });

        // 処理後にはEloquentモデルにID値が保持されている。
        $foo->id();

        // 続きの処理
    }
}
```

Eloquent モデルには `fillable` プロパティを設定しておく。

```injectablephp
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class FooDTO extends Model
{
    public function __construct(
        array $attributes = [],
        array $fillable = [
            "name",
            "age",
        ]
    )
    {
        $this->fillable = $fillable;

        parent::__construct($attributes);
    }

    // 更新できるカラム

}
```

> - [LaravelでEloquentの使い方(更新・追加・取得・削除) \| コードライク](https://codelikes.com/laravel-eloquent-basic/#toc9)
> - [LaravelのORMで初心者から職人へ #PHP - Qiita](https://qiita.com/henriquebremenkanp/items/cd13944b0281297217a9)

<br>

### READ

#### ▼ `all()` 関数

レコードをすべて取得する SELECT 句を発行する。

MySQL を含む DB エンジンでは、取得結果に標準の並び順が存在しないため、プライマリーキーの昇順で取得したい場合は、`orderBy()` 関数を使用して、明示的に並び替えるようにする。

Eloquent モデルには `all()` 関数がない。代わりに、 Eloquent ビルダーが持つ `all()` 関数をコールする。

すべてのプライマリーキーの Collection 型を配列型として返却する。

`toArray()` 関数で配列型に再帰的に変換できる。

**＊実装例＊**

```injectablephp
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Foo;
use Illuminate\Database\Eloquent\Collection;

class FooController extends Controller
{

    public function findAll(): Collection
    {
        $foo = new Foo();

        return $foo->all();
    }
}
```

> - https://stackoverflow.com/questions/54526479/what-is-the-dafault-ordering-in-laravel-eloquent-modelall-function
> - https://laravel.com/api/8.x/Illuminate/Support/Collection.html#method_all
> - [8.x Eloquentの準備 Laravel](https://readouble.com/laravel/8.x/ja/eloquent.html#retrieving-models)

#### ▼ `find()` 関数

レコードを 1 つ取得する SELECT 句を発行する。

Eloquent モデルには `find()` 関数がない。代わりに、 Eloquent ビルダーが持つ `find()` 関数をコールする。

引数としてプライマリーキーを渡した場合、指定したプライマリーキーを持つ Eloquent モデルを返却する。

`toArray()` 関数で配列型に変換できる。

**＊実装例＊**

```injectablephp
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Foo;
use Illuminate\Database\Eloquent\Collection;

class FooController extends Controller
{

    public function findById(int $id): ?Foo
    {
        $foo = new Foo();

        return $foo->find($id);
    }
}
```

> - https://laravel.com/api/8.x/Illuminate/Database/Query/Builder.html#method_find
> - [8.x Eloquentの準備 Laravel](https://readouble.com/laravel/8.x/ja/eloquent.html#retrieving-single-models)

#### ▼ `first()` 関数

取得されたコレクション型データの 1 つ目の要素の値を取得する。

ユニーク制約の課せられたカラムを `where()` 関数の対象とする場合、コレクションとして取得されるが、コレクションが持つ Eloquent モデルは 1 つである。

foreach を使用してコレクションから Eloquent モデルを取り出してもよいが、無駄が多い。

そこで、`first()` 関数を使用して、Eloquent モデルを直接的に取得する。

**＊実装例＊**

```injectablephp
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Foo;
use Illuminate\Database\Eloquent\Collection;

class FooController extends Controller
{

    public function findByEmail(string $emailAddress): ?Foo
    {
        $foo = new Foo();

        return $foo->where('foo_email', $emailAddress)->first();
    }
}
```

#### ▼ `limit()` 関数、`offset()` 関数

指定した `offset` 値以降のレコードをすべて取得する SELECT 句を発行する。

これにより、ページネーションで、1 ページ当たりのレコード数 (`limit`) と、次のページの開始レコード (`offset`) を定義できる。

これらのパラメーターはクエリパラメーターとして渡すとよい。

**＊実装例＊**

```injectablephp
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Foo;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;

class FooController extends Controller
{

    public function findAllByPagination(Request $request): Collection
    {
        $foo = new Foo();

        return $foo->offset($request->offset)
            ->limit($request->limit)
            ->get();
    }
}
```

> - [8.x データベース：クエリビルダ Laravel](https://readouble.com/laravel/8.x/ja/queries.html#ordering-grouping-limit-and-offset)

#### ▼ `orderBy()` 関数

指定したカラムの昇順/降順でレコードを並び替える SELECT 句を発行する。

並び替えた結果を取得するためには、`get()` 関数を使用する。

プライマリーキーの昇順で取得する場合、`all()` 関数ではなく、`orderBy()` 関数を使用して、プライマリーキーの昇順を明示的に設定する。

**＊実装例＊**

```injectablephp
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Foo;
use Illuminate\Database\Eloquent\Collection;

class FooController extends Controller
{

    public function findAllByAsc(): Collection
    {
        $foo = new Foo();

        // 昇順
        return $foo->orderBy('foo_id', 'asc')->get();
    }

    public function findAllByDesc(): Collection
    {
        $foo = new Foo();

        // 降順
        return $foo->orderBy('foo_id', 'desc')->get();
    }
}
```

> - [8.x データベース：クエリビルダ Laravel](https://readouble.com/laravel/8.x/ja/queries.html#ordering-grouping-limit-and-offset)

#### ▼ `sortBy()` 関数

指定したカラムの昇順でレコードを並び替える SELECT 句を発行する。

**＊実装例＊**

```injectablephp
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Foo;
use Illuminate\Database\Eloquent\Collection;

class FooController extends Controller
{

    public function findAllByAsc(): Collection
    {
        $foo = new Foo();

        return $foo->all()->sortBy('foo_id');
    }
}
```

> - [8.x コレクション Laravel](https://readouble.com/laravel/8.x/ja/collections.html#method-sortby)

#### ▼ `sortByDesc()` 関数

指定したカラムの降順でレコードを並び替える SELECT 句を発行する。

```injectablephp
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Foo;
use Illuminate\Database\Eloquent\Collection;

class FooController extends Controller
{

    public function findAllByDesc(): Collection
    {
        $foo = new Foo();

        return $foo->all()->sortByDesc('foo_id');
    }
}
```

> - [8.x コレクション Laravel](https://readouble.com/laravel/8.x/ja/collections.html#method-sortbydesc)

#### ▼ `with()` 関数

親テーブルにアクセスしてすべてのデータを取得し、親テーブルの Eloquent モデルのプロパティに子テーブルのレコードを保持する。

この仕組みを Eager ロードという。

Eloquent モデルには `with()` 関数がない。代わりに、 Eloquent ビルダーが持つ `with()` 関数をコールする。

テーブル間に一対多 (親子) のリレーションシップがある場合に使用する。

N+1 問題を防げる。

> - [8.x Eloquent:リレーション Laravel](https://readouble.com/laravel/8.x/ja/eloquent-relationships.html#eager-loading)

ただし、`with()` 関数に他の関数をチェーンしてしまうと、Eager ロードの後に SQL を発行されてしまうため、Eager ロードの恩恵を得られなくなることに注意する。

> - [\[Laravel\] Eloquent リレーションと Eager Loading #DB - Qiita](https://qiita.com/shosho/items/abf6423283f761703d01#%E3%83%AA%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%83%A1%E3%82%BD%E3%83%89%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E3%81%97%E3%81%BE%E3%81%86%E3%81%A8-eager-loading-%E3%81%AB%E3%81%97%E3%81%A6%E3%81%A6%E3%82%82%E6%84%8F%E5%91%B3%E3%81%8C%E3%81%AA%E3%81%84%E3%81%AE%E3%81%A7%E6%B3%A8%E6%84%8F)

**＊実装例＊**

コントローラーにて、Department (親) と、これに紐付く Employee (子) を読み出す。

これらのモデルの間では、`hasMany()` 関数と `belongsTo()` 関数を使用して、テーブルにおける一対多のリレーションを定義しておく。

```injectablephp
<?php

namespace App\Http\Controllers;

use App\Models\Department;

class EmployeeController
{
    public function getEmployeesByDepartment(): void
    {
        $department = new Department();

        // Departmentに属するEmployeesを全て読み出します。
        // (departments : employees = 1 : 多)
        $employees = $department->with("employees")->get();

        foreach ($employees as $employee) {
            // ここではDBアクセスはせずに、プロパティに保持された値を取得するだけ。
            $name = $employee->name;

        }

        // 続きの処理
    }
}
```

Department (親) に、departments テーブルと employees テーブルの間に、一対多の関係を定義する。

```injectablephp
<?php

namespace App\Models\Department;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    public function __construct(
        array $attributes = [],
        string $primaryKey = "department_id"
    )
    {
        $this->primaryKey = $primaryKey;

        parent::__construct($attributes);
    }

    /**
     * 主キーとするカラム
     */

    /**
     * 一対多の関係を定義します。
     * (デフォルトではemployee_idに紐付けます)
     */
    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }
}
```

また、Employee (子) に、反対の多対一の関係を定義する。

```injectablephp
<?php

namespace App\Models\Department;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employee extends Model
{
    public function __construct(
        array $attributes = [],
        string $primaryKey = "employee_id"
    )
    {
        $this->primaryKey = $primaryKey;

        parent::__construct($attributes);
    }

    /**
     * 主キーとするカラム
     */

    /**
     * 多対一の関係を定義します。
     * (デフォルトではdepartment_idに紐付けます)
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
}
```

<br>

### UPDATE

#### ▼ `save()` 関数

UPDATE 文を実行する。

Eloquent ビルダーの `fill()` 関数で挿入先のカラムと値を設定し、`save()` 関数を実行する。

`save()` 関数は `CREATE` 処理も実行できるが、`fill()` 関数で ID 値を割り当てた場合は、`UPDATE` 処理が実行される。

**＊実装例＊**

```injectablephp
<?php

namespace App\Infrastructure\Repositories;

use App\Http\Controllers\Controller;
use App\Domain\Foo\Entities;
use Illuminate\Http\Request;

class FooController extends Controller
{

    public function updateFoo(Request $request): void
    {
        $foo = new Foo();

        DB::transaction(function () use ($foo, $request): void {

            // UPDATE文を実行する。
            $foo->fill($request->all())->save();
        });

        // 続きの処理
    }
}
```

Eloquent モデルには `fillable` プロパティを設定しておく。

```injectablephp
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class FooDTO extends Model
{
    public function __construct(
        array $attributes = [],
        array $fillable = [
            "name",
            "age",
        ]
    )
    {
        $this->fillable = $fillable;

        parent::__construct($attributes);
    }

    // 更新できるカラム

}
```

> - [LaravelでEloquentの使い方(更新・追加・取得・削除) \| コードライク](https://codelikes.com/laravel-eloquent-basic/#toc9)
> - [LaravelのORMで初心者から職人へ #PHP - Qiita](https://qiita.com/henriquebremenkanp/items/cd13944b0281297217a9)

<br>

### DELETE

#### ▼ `destroy`/`delete()` 関数 (物理削除)

DELETE 文を実行する。

Eloquent モデルの `destroy`/`delete()` 関数を使用する。

手順として、Eloquent ビルダーの `find()` 関数で削除先の Model を検索する。

返却された Eloquent ビルダーの `destroy`/`delete()` 関数をコールし、自身を削除する。

#### ▼ SoftDeletes の有効化 (論理削除)

削除フラグを更新する UPDATE 文を実行する。

Eloquent モデルの `destroy`/`delete()` 関数を使用する。

手順として、テーブルに対応する Model にて、SoftDeletes の Trait を読み込む。

DB マイグレーション時に追加される `delete_at` カラムを SQL で取得するときは、DataTime クラスへ変換できるようにしておく。

**＊実装例＊**

```injectablephp
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FooDTO extends Model
{
    public function __construct(
        array $attributes = [],
        array $dates = [
            "deleted_at"
        ]
    )
    {
        $this->dates = $dates;

        parent::__construct($attributes);
    }

    /**
    * Traitの読み出し
    */
    use SoftDeletes;

    /**
     * 読み出し時にCarbonのDateTimeクラスへ自動変換するカラム
     */

}
```

DB マイグレーションファイルにて `softDeletes()` 関数を使用すると、削除フラグとして `deleted_at` カラムが追加されるようになる。

`deleted_at` カラムのデフォルト値は `NULL` である。

```injectablephp
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFooTable extends Migration
{
    /**
     * マイグレート
     */
    public function up(): void
    {
        Schema::create("foo", function (Blueprint $table): void {

            // ...

            // deleted_atカラムを追加する。
            $table->softDeletes();

            // ...

        });
    }

    /**
     * ロールバック
     */
    public function down(): void
    {
        Schema::drop("foo");
    }
}
```

上記の状態で、同様に `destroy`/`delete()` 関数を使用して、自身を削除する。

物理削除ではなく、`deleled_at` カラムが更新されるようになる。

`find()` 関数は、`deleled_at` カラムが `NULL` でないレコードを読み出さないため、論理削除を実現できる。

<br>

## 04. Laravel へのリポジトリパターン導入

### 背景

Laravel は Active Record パターンを採用しており、これはビジネスロジックが複雑でないアプリに適している。

ただし、ビジネスロジックが複雑なアプリに対しても、Laravel を使用したい場面がある。

その場合、Laravel にリポジトリパターンを導入することが選択肢の 1 つになる。

リポジトリパターンについては、以下のリンクを参考にせよ。

> - [【IT技術の知見】クリーンアーキテクチャ＠アーキテクチャ - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/software/software_application_architecture_backend_domain_driven_design_clean_architecture.html)

<br>

### 工夫

#### ▼ DTO クラスの導入

ビジネスロジック用ドメインモデルと、Eloquent モデルを継承した詰め替えモデル (例：DTO クラス) を用意する。

詰め替えモデルをドメインモデルに変換する処理を関数として切り分けておくと便利である。

ドメインモデルと DTO クラスの間でデータを詰め替えるようにすると、DTO クラスがドメインモデルと DB の間でレコードのやり取りを中継し、これらを疎結合にしてくれる。

そのため、Repository パターンを実現できる。

```injectablephp
<?php

declare(strict_types=1);

namespace App\Infrastructure\Foo\DTOs;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

final class FooDTO extends Model
{
    public function __construct(
        array $attributes = [],
        array $dates = [
            'created_at',
            'updated_at',
            'deleted_at',
        ],
        array $fillable = [
            'name',
            'age',
        ]
    )
    {
        $this->dates = $dates;
        $this->fillable = $fillable;

        parent::__construct($attributes);
    }

    use HasFactory;

    private int $id;

    private string $name;

    private int $age;

    private string $email;

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

#### ▼ `create()` 関数

**＊実装例＊**

```injectablephp
<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Foo\Entities\Foo;
use App\Domain\Foo\Repositories\FooRepository as DomainFooRepository;
use App\Infrastructure\Foo\DTO\FooDTO;

class FooRepository extends Repository implements DomainFooRepository
{

    private FooDTO $fooDTO;

    public function __construct(FooDTO $fooDTO)
    {
        $this->fooDTO = $fooDTO;
    }

    public function create(Foo $foo): void
    {

      DB::transaction(function () use ($foo): void {
          $this->fooDTO
              // INSERT文を実行する。
              ->create([
                  // ドメインモデルのデータをDTOに詰め替える。
                  "name"  => $foo->name(),
                  "age"   => $foo->age(),
              ]);

//          以下の実装でも良い。
//          $this->fooDTO
//              ->fill([
//                  "name"  => $foo->name(),
//                  "age"   => $foo->age(),
//              ])
//              ->save();
          });
      }
}
```

```injectablephp
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class FooDTO extends Model
{
    public function __construct(
        array $attributes = [],
        array $fillable = [
            "name",
            "age",
        ]
    )
    {
        $this->fillable = $fillable;

        parent::__construct($attributes);
    }

    // 更新できるカラム

}
```

<br>

### READ

#### ▼ `find()` 関数

**＊実装例＊**

```injectablephp
<?php

namespace App\Infrastructure\Foo\Repositories;

use App\Domain\Foo\Entities\Foo;
use App\Domain\Foo\Ids\FooId;
use App\Domain\Foo\Repositories\FooRepository as DomainFooRepository;
use App\Infrastructure\Foo\DTOs\FooDTO;

class FooRepository extends Repository implements DomainFooRepository
{

    private FooDTO $fooDTO;

    public function __construct(FooDTO $fooDTO)
    {
        $this->fooDTO = $fooDTO;
    }

    public function findById(FooId $fooId): Foo
    {
        $fooDTO = $this->fooDTO
            ->find($fooId->id());

        // DBアクセス処理後のDTOをドメインモデルに変換する。
        return new Foo(
            $fooDTO->id(),
            $fooDTO->name(),
            $fooDTO->age(),
            $fooDTO->email()
        );
    }
}
```

#### ▼ `all()` 関数

**＊実装例＊**

```injectablephp
<?php

namespace App\Infrastructure\Foo\Repositories;

use App\Domain\Foo\Entities\Foo;
use App\Domain\Foo\Repositories\FooRepository as DomainFooRepository;
use App\Infrastructure\Foo\DTOs\FooDTO;

class FooRepository extends Repository implements DomainFooRepository
{

    private FooDTO $fooDTO;

    public function __construct(FooDTO $fooDTO)
    {
        $this->fooDTO = $fooDTO;
    }

    public function findAll(): array
    {
        $fooDTOs = $this->fooDTO
            ->all();

        $foos = [];
        foreach ($fooDTOs as $fooDTO)
            // DBアクセス後のDTOをドメインモデルに変換する。
            $foos[] = new Foo(
                $fooDTO->id(),
                $fooDTO->name(),
                $fooDTO->age(),
                $fooDTO->email(),
            );

        return $foos;
    }
}
```

#### ▼ `with()` 関数

<br>

### UPDATE

#### ▼ `save()` 関数

**＊実装例＊**

```injectablephp
<?php

namespace App\Infrastructure\Foo\Repositories;

use App\Domain\Foo\Entities\Foo;
use App\Domain\Foo\Repositories\FooRepository as DomainFooRepository;
use App\Infrastructure\Foo\DTOs\FooDTO;

class FooRepository extends Repository implements DomainFooRepository
{

    private FooDTO $fooDTO;

    public function __construct(FooDTO $fooDTO)
    {
        $this->fooDTO = $fooDTO;
    }

    public function save(Foo $foo): void
    {
        DB::transaction(function () use ($foo): void {

            $this->fooDTO
                // ドメインモデルのデータをDTOに詰め替える。
                ->fill([
                    "name"  => $foo->name(),
                    "age"   => $foo->age(),
                ])
                // UPDATE文を実行する。
                ->save();
        });
    }
}
```

```injectablephp
<?php

namespace App\Domain\DTO;

use Illuminate\Database\Eloquent\Model;

class FooDTO extends Model
{
    public function __construct(
        array $attributes = [],
        array $fillable = [
            "name",
            "age",
        ]
    )
    {
        $this->fillable = $fillable;

        parent::__construct($attributes);
    }

    // 更新できるカラム

}
```

<br>

### DELETE

#### ▼ `destroy`/`delete()` 関数

**＊実装例＊**

```injectablephp
<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Foo\Entities\Foo;
use App\Domain\Foo\Ids\FooId;
use App\Domain\Foo\Repositories\FooRepository as DomainFooRepository;
use App\Infrastructure\Foo\DTOs\FooDTO;

class FooRepository extends Repository implements DomainFooRepository
{

    private FooDTO $fooDTO;

    public function __construct(FooDTO $fooDTO)
    {
        $this->fooDTO = $fooDTO;
    }

    public function delete(FooId $fooId): void
    {
        // destroy関数でレコードを削除する。
        $this->fooDTO->destroy($fooId->id());

        // delete関数を使用しても良い。
        // $this->fooDTO->find($fooId->id())->delete();
    }
}
```

```injectablephp
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class FooController extends Controller
{
    private FooRepository $fooRepository;

    public function __construct(FooRepository $fooRepository)
    {
        $this->fooRepository = $fooRepository;
    }

    public function delete(FooId $fooId): Response
    {
        $this->fooRepository
            ->delete($fooId);

        return response()->view("foo")
            ->setStatusCode(200);
    }
}
```

<br>
