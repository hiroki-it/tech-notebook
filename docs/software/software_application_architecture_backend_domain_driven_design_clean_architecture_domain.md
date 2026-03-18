
## 04. ドメイン層

### ドメイン層とは

ドメインモデルやビジネスルールを定義する。

<br>

### エンティティ

#### ▼ エンティティとは

ノート内の『エンティティ』の項目を参照せよ。

<br>

### 値オブジェクト

#### ▼ 値オブジェクトとは

ノート内の『値オブジェクト』の項目を参照せよ。

<br>

### ドメインイベント

#### ▼ ドメインイベントとは

ドメイン層の中で、ビジネス的な『出来事』をモデリングしたもの。

エンティティや値オブジェクトは『物』をモデリングするため、着眼点が異なる。

エンティティデザインパターンの1つである『パブリッシュ／サブスクライブ方式』の概念を使用して、ドメインイベントとイベントリスナー (イベントハンドラー) の関連を表す。

<br>

### 区分オブジェクト

#### ▼ 区分オブジェクトとは

区分オブジェクトは概念的な呼び名で、実際は、標準的なパッケージとして利用できるenum型のクラスに相当する。

一意に識別する必要がないユビキタス言語の中でも、特に『区分』や『種類』などは、値オブジェクトとしてではなく、enum型のクラスとしてモデリング/実装する。

ただし、類似するパターンとして値オブジェクトのディレクトリ内に配置しても良い。

#### ▼ 色

**＊実装例＊**

```php
<?php

namespace App\Domain\Foo\ValueObjects;

/**
 * 色の区分オブジェクト
 */
class ColorType
{
    const RED = 1;
    const BLUE = 2;

    /**
     * 『self::定数名』で、定義の値へアクセスする
     */
    private $set = [
        self::RED  => ["name" => "レッド"],
        self::BLUE => ["name" => "ブルー"]
    ];

    /**
     * 値
     */
    private $value;

    /**
     * 色名
     */
    private $name;

    // インスタンス化の時に、『色の区分値』を受け取る。
    public function __construct(string $value)
    {
        // $kbnValueに応じて、色名をnameデータにセットする。
        $this->value = $value;
        $this->name = static::$set[$value]["name"];
    }

    /**
     * 値を返却する


     */
    public function value(): int
    {
        return $this->value;
    }


    /**
     * 色名を返却する


     */
    public function name(): string
    {
        return $this->name;
    }
}
```

#### ▼ 性別

**＊実装例＊**

```php
<?php

namespace App\Domain\Foo\ValueObjects;

/**
 * 性別の区分オブジェクト
 */
class SexType
{
    const MAN     = 1;
    const WOMAN   = 2;
    const UNKNOWN = 3;

    private static $set = [
        self::MAN     => ["name" => "男性"],
        self::WOMAN   => ["name" => "女性"],
        self::UNKNOWN => ["name" => "不明"],
    ];

    /**
     * 値
     */
    private $value;

    /**
     * 名前
     */
    private $name;

    public function __construct($value)
    {
        $this->value = $value;
        $this->name = static::$set[$value]["name"];
    }

    /**
     * 値を返却する
     */
    public function value(): int
    {
        return $this->value;
    }
    /**
     * 名前を返却する
     */
    public function name()
    {
        return $this->name;
    }
}
```

#### ▼ 年号

**＊実装例＊**

```php
<?php

namespace App\Domain\Foo\ValueObjects;

/**
 * 年月日の区分オブジェクト
 */
class YmdType extends Type
{
    const MEIJI   = 1; // 明治
    const TAISHO  = 2; // 大正
    const SHOWA   = 3; // 昭和
    const HEISEI  = 4; // 平成
    const REIWA   = 5; // 令和
    const SEIREKI = 9; // 西暦

    private static $set = [
        self::MEIJI   => ["name" => "明治"],
        self::TAISHO  => ["name" => "大正"],
        self::SHOWA   => ["name" => "昭和"],
        self::HEISEI  => ["name" => "平成"],
        self::REIWA   => ["name" => "令和"],
        self::SEIREKI => ["name" => "西暦"],
    ];

    private static $ymd = [
        self::MEIJI  => [
            "start" => [ "year" => 1868, "month" => 1, "day" => 25, ],
            "end"   => [ "year" => 1912, "month" => 7, "day" => 29, ],
        ],
        self::TAISHO => [
            "start" => [ "year" => 1912, "month" => 7,  "day" => 30, ],
            "end"   => [ "year" => 1926, "month" => 12, "day" => 24, ],
        ],
        self::SHOWA  => [
            "start" => [ "year" => 1926, "month" => 12, "day" => 25, ],
            "end"   => [ "year" => 1989, "month" => 1,  "day" => 7, ],
        ],
        self::HEISEI => [
            "start" => [ "year" => 1989, "month" => 1,  "day" => 8, ],
            "end"   => [ "year" => 2019, "month" => 4, "day" => 30, ],
        ],
        self::REIWA => [
            "start" => [ "year" => 2019, "month" => 5,  "day" => 1, ],
            "end"   => [ "year" => 9999, "month" => 12, "day" => 31, ],
        ],
    ];

    /**
     * 値
     *
     * @var string
     */
    private $value;

    /**
     * 年号名
     *
     * @var string
     */
    private $name;

    /**
     * 値を返却する
     *
     * @return string
     */
    public function value(): string
    {
        return $this->value;
    }

    /**
     * @param $value
     */
    public function __construct($value)
    {
        $this->value = $value;
        $this->name = static::$set[$value]["name"];
    }

    /**
     * 年号名を返却する
     *
     * @return string
     */
    public function name()
    {
        return $this->name;
    }
}
```

<br>

### ドメインサービス

#### ▼ ドメインサービスとは

ドメイン層のエンティティに持たせるとやや不自然で、他のドメインオブジェクトを対象とした振舞ロジックを切り分けたもの。

ドメインサービスは、他のドメインオブジェクトにロジックを関数として提供するのみで、自身の状態を変化させる関数は持たせないようにする。

全ての関数を `1` 個のドメインサービスにまとめて管理するよりも、動作の種類ごとに分けて管理したほうが良い。

この時、エンティティのビジネスロジックがドメインサービスに実装されすぎないように注意する。

補足として、ドメイン層でリポジトリを使用することを嫌って、ドメインサービスの処理をユースケース層のアプリケーションサービスで定義しても問題ない。

> - https://github.com/little-hands/ddd-q-and-a/issues/159
> - https://www.amazon.co.jp/dp/B082WXZVPC
> - https://codezine.jp/article/detail/10318

#### ▼ 重複確認

ドメイン層のリポジトリを使用して、該当の名前のエンティティがDBに存在するか否かを検証する。

ドメインサービスではなく、アプリケーションサービスとして定義しても良い。

**＊実装例＊**

```php
<?php

namespace App\Domain\Foo\Services;

class CheckDuplicateFooService
{
    /**
     * @var FooRepository
     */
    private FooRepository $fooRepository;

    /**
     * @param FooRepository $fooRepository
     */
    public function __construct(FooRepository $fooRepository)
    {
        $this->fooRepository = $fooRepository;
    }

    /**
     * エンティティがすでに存在しているか否かを判定する


     *
     * @param Foo $foo
     * @return bool
     */
    public function exists(Foo $foo): bool
    {
        $foo = $this->fooRepository
            ->findByName($foo->name());

        return $foo !== null;
    }
}
```

> - https://stackoverflow.com/questions/45007667/cqrs-ddd-how-to-validate-products-existence-before-adding-them-to-order
> - https://www.amazon.co.jp/dp/B082WXZVPC
> - https://github.com/little-hands/ddd-q-and-a/issues/573

#### ▼ 認可

ドメイン層のリポジトリを使用して、該当のIDのエンティティに対してアクセスできるかを検証する。

認可処理はドメインと結びつきが強いので、ドメイン層に実装する。

あるいはドメインサービスではなく、アプリケーションサービスとして定義しても良い。

| テーブル                        | 説明                                       | テーブル例                                                          |
| ------------------------------- | ------------------------------------------ | ------------------------------------------------------------------- |
| ロール                          | ユーザーの権限を表す。                     | ロール名 (`Administorator`、`Operator`、`Reporterなど) を定義する。 |
| パーミッション (ロールポリシー) | ロールをポリシーに紐づける。               | テーブル上でロール名とポリシー名を紐づける。                        |
| ポリシー                        | 各パーミッションの認可スコープを定義する。 | `StandardAccess`、`FullAccess`、`ReadOnly` を定義する。             |

**＊実装例＊**

```php
<?php

namespace App\Domain\Foo\Services;

class AuthorizeFooService
{
    /**
     * @var FooRepository
     */
    private FooRepository $fooRepository;

    /**
     * @param FooRepository $fooRepository
     */
    public function __construct(FooRepository $fooRepository)
    {
        $this->fooRepository = $fooRepository;
    }

    /**
     * 更新処理を実行できるかを検証する
     *
     * @param FooId  $fooId
     * @param UserId $userId
     * @return bool
     */
    public function canUpdateById(FooId $fooId, UserId $userId): bool
    {
        return $this->fooRepository
            ->findById($fooId)
            ->userId
            ->equals($userId);
    }
}
```

> - https://lessthan12ms.com/authorization-and-authentication-in-clean-architecture.html
> - https://medium.com/@martinezdelariva/authentication-and-authorization-in-ddd-671f7a5596ac
> - https://github.com/lezhnev74/ema/blob/master/src/Domain/Note/Commands/ModifyNote/ModifyNoteAuthorizer.php
> - https://github.com/little-hands/ddd-q-and-a/issues/121

#### ▼ ドメイン例外

ドメイン層の例外処理をまとめた例外クラス。

**＊実装例＊**

```php
<?php

namespace App\Domain\Foo\Services;

class FooException extends Exception
{

}
```

<br>

### 仕様パターン (Specificationパターン)

#### ▼ 仕様パターンとは

デザインパターンの一種。

責務として、ビジネスルール検証、クエリ検索条件を持つ。

これらをエンティティや値オブジェクトの関数内部に持たせた場合、肥大化の原因となり、また埋もれてしまうため、可読性と保守性が悪い。

そこで、こういった処理をSpecificationオブジェクトとして切り分けておく。

#### ▼ ビジネスルールのバリデーション

エンティティから切り分けたビジネスルールバリデーションオブジェクトとして実装する。

バリデーションを実装できるパッケージが世の中にあるが、ビジネスロジックは外部に依存しない方がいいため、言語のそのままのロジックで実装すると良い。

複数のエンティティをまたぐビジネスルールのバリデーションはSpecificationパターンに切り分けるのがよい。

boolean値関数 (`isFoo` 関数) のように、仕様を満たしているかを調べる処理する。

- 単一のエンティティを引数として、複数を要求を満たしているか
- 複数のエンティティを引数として、仕様を満たしているか
- 何らかの処理のために用意できているか

単一のエンティティに関する単一のビジネスルールの場合は、Specificationパターンとして切り分けずに、そのエンティティにboolean値関数 (`isFoo` 関数) をもたせる。

**＊実装例＊**

```php
<?php

namespace App\Domain\Foo\Specifications;

class FooSpecification
{
    /**
     * ビジネスルールを判定する
     * @param Entity $entity
     * @return bool
     */
    public function isSatisfiedBy(Entity $entity): bool
    {
        // 複数の仕様を組み合わせる条件
        if (!$entity->isX) return false;
        if (!$entity->isY) return false;
        if (!$entity->isZ) return false;

        return true;
    }
}
```

#### ▼ クエリ検索条件

リポジトリの引数に渡すクエリ検索条件オブジェクトとして実装する。

Specificationパターンを検索条件オブジェクトとして使った場合に、Criteriaパターンと呼ぶこともある。

ユースケースに対応する検索条件をオブジェクトに閉じ込めるとよい。

ビジネスルールのバリデーションを実行するSpecificationクラスと区別するために、Criteriaオブジェクトという名前としても使用される。

**＊実装例＊**

```php
<?php

namespace App\Domain\Foo\Criterion;

class FooCriteria
{
    /**
     * @var int
     */
    private int $id;

    /**
     * @var string
     */
    private string $name;

    /**
     * @var string
     */
    private string $email;

    /**
     * クエリ検索条件オブジェクトを作成する
     *
     * @param array $array
     * @return $this
     */
    public function build(array $array)
    {
        // 自身をインスタンス化。
        $criteria = new static();

        if (isset($array["id"])) {
            $criteria->id = $array["id"];
        }

        if (isset($array["name"])) {
            $criteria->id = $array["name"];
        }

        if (isset($array["email"])) {
            $criteria->id = $array["email"];
        }

        return $criteria;
    }
}
```

#### ▼ クエリ条件

特

<br>

## 04-02. ドメイン層のロジックの流出

### ドメイン貧血症

#### ▼ ドメイン貧血症とは

ドメイン層のドメインオブジェクトがビジネスロジックをほとんど持たない状態になっていること。

**＊実装例＊**

ドメインオブジェクトであるエンティティがゲッターとセッターしか持っていない。

これは、ドメイン貧血症である。

```php
<?php

declare(strict_types=1);

namespace App\Domain\User\Entities;

use App\Domain\User\Ids\UserId;
use App\Domain\User\ValueObjects\UserName;

final class User
{
    /**
     * @var UserId
     */
    private UserId $userId;

    /**
     * @var UserName
     */
    private UserName $userName;

    /**
     * @param UserId           $userId
     * @param UserName         $userName
     */
    public function __construct(UserId $userId, UserName $userName)
    {
        $this->userId = $userId;
        $this->userName = $userName;
    }

    /**
     * @return UserId
     */
    public function id()
    {
        return $this->userId;
    }

    /**
     * @return UserName
     */
    public function userName()
    {
        return $this->userName;
    }
}
```

<br>

### ドメイン層のドメインサービスへの流出

ドメイン層のロジックをドメインサービスに切り分けすぎると、同じくドメイン層のエンティティや値オブジェクトに実装するドメインロジックがなくなってしまい、ドメイン貧血症になる。

そのため、ドメインサービス層の作成は控えめにする。

<br>

### ユースケース層のアプリケーションサービスへの流出

ドメイン層のロジックをユースケース層のユースケース層に実装してしまうと、ドメイン層のエンティティや値オブジェクトに実装するドメインロジックがなくなってしまい、ドメイン貧血症になる。

ドメイン層とユースケース層のアプリケーションサービスのいずれに実装する必要があるかは、モデリングの対象がビジネスルールに基づくものなのか、ソフトウェア利用者のユースケースに基づくものなのかである。

> - https://www.amazon.co.jp/dp/B082WXZVPC

<br>

## 04-03. エンティティ

### エンティティとは

責務として、ビジネスルールや制約の定義を持ち、値オブジェクトとは区別される。

エンティティの責務をデザインパターンに切り分けても良い。

一意で識別できるデータ (例：`id` データ) を持つ

![ドメイン駆動設計_エンティティ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ドメイン駆動設計_エンティティ.jpg)

<br>

### 識別可能

#### ▼ 識別可能とは

オブジェクトが識別子 (例：IDなど) を持ち、他のオブジェクトと同じ属性をもっていても、区別される。

この識別子は、DBのプライマリーキーに対応している。

```php
<?php

namespace App\Domain\Foo\Entities;

use App\Domain\Entity;
use App\Domain\Id;
use App\Domain\Foo\ValueObjects\ToyName;
use App\Domain\Foo\ValueObjects\Number;
use App\Domain\Foo\ValueObjects\PriceVO;
use App\Domain\Foo\ValueObjects\ColorVO;

/**
 * 犬用おもちゃのエンティティ
 */
class DogToy extends Entity
{
    /**
     * 犬用おもちゃID
     *
     * @var Id
     */
    private $id;

    /**
     * 犬用おもちゃタイプ
     *
     * @var ToyType
     */
    private $type;

    /**
     * 犬用おもちゃ商品名
     *
     * @var ToyName
     */
    private $name;

    /**
     * 数量
     *
     * @var Number
     */
    private $number;

    /**
     * 価格の値オブジェクト
     *
     * @var PriceVO
     */
    private $priceVO;

    /**
     * 色の値オブジェクト
     *
     * @var ColorVO
     */
    private $colorVO;

    /**
     * @param ToyType $type
     * @param ToyName $name
     * @param Number  $number
     * @param PriceVO $priceVO
     * @param ColorVO $colorVO
     */
    public function __construct(ToyType $type, ToyName $name, Number $number, PriceVO $priceVO, ColorVO $colorVO)
    {
        $this->type = $type;
        $this->name = $name;
        $this->number = $number;
        $this->priceVO = $priceVO;
        $this->colorVO = $colorVO;
    }

    /**
     * 犬用おもちゃ名 (色) を返却する
     *
     * @return string
     */
    public function nameWithColor()
    {
        return sprintf(
            "%s (%s) ",
            $this->name->value(),
            $this->colorVO->name()
        );
    }
}
```

<br>

### 識別子による等価性バリデーション

#### ▼ 識別子による等価性バリデーションとは

等価性バリデーション用の `equals` 関数を持つ。

保持する識別子が、対象のエンティティと同じ場合、同じものと見なされる。

#### ▼ 等価性の検証方法

全てのエンティティに等価性のバリデーション関数を持たせると可読性が低い。

そこで、全てのエンティティに等価性バリデーション用の `equals` 関数を持たせることをやめ、継承元の抽象クラスのエンティティにこれを定義すると良い。

```php
<?php

namespace App\Domain;

/**
 * エンティティ抽象クラス
 */
abstract class Entity
{
    /**
     * IDクラス
     *
     * @var Id
     */
    protected Id $id;

    /**
     * エンティティの等価性を検証する


     *
     * @param Entity $entity
     * @return bool
     */
    public function equals(Entity $entity): bool
    {
        return ($entity instanceof $this || $this instanceof $entity) // エンティティのデータ型の等価性
            && $this->id->equals($entity->id()); // IDオブジェクトの等価性
    }

    /**
     * IDクラスを返却する


     */
    public function id(): Id
    {
        return $this->id;
    }
}
```

#### ▼ 複合主キーへの対応 (PHPでは不要)

以降の説明はJavaについて適用されるため、PHPでは不要である。

複合主キーを持つオブジェクトに対応するため、主キーとなるほうのオブジェクト側に `equals` 関数と `hash` 関数を定義する。

これにより、言語標準搭載の `equals` 関数と `hash` 関数をオーバーライドし、異なるセッションに渡ってオブジェクトを比較できるようにする。

これらを定義しないと、オーバーライドされずに標準搭載の関数が使用される。

標準搭載の関数では、異なるセッションに渡ったオブジェクトの比較では、必ず異なるオブジェクトであると判定してしまう。

**＊実装例＊**

PHPでは不要であるが、参考までに、PHPで実装した。

```php
<?php

namespace App\Domain;

/**
 * ID抽象クラス
 */
abstract class Id
{
    /**
     * ID
     *
     * @var string
     */
    private $id;

    /**
     * @param string $id
     */
    public function __construct(string $id)
    {
        $this->id = $id;
    }

    /**
     * ハッシュ値を返却する


     *
     * NOTE: 複合主キーを持つオブジェクトの等価性を正しく検証するために、標準の関数をオーバーライドする


     *
     * @return string
     */
    public function hash(): string
    {
        return $this->id;
    }

    /**
     * オブジェクトの等価性を検証する


     *
     * NOTE: 複合主キーを持つオブジェクトの等価性を正しく検証するために、標準の関数をオーバーライドする


     *
     * @param Id $id
     * @return bool
     */
    public function equals(Id $id): bool
    {
        return ($id instanceof $this || $this instanceof $id) // IDオブジェクトのデータ型の等価性
            && $this->hash() == $id->hash(); // ハッシュ値の等価性
    }
}
```

<br>

### データの可変性/不変性

#### ▼ 可変性/不変性の実現方法 (ミュータブル/イミュータブル)

エンティティのデータは可変/不変データのいずれであっても良い。

ただし、そもそもオブジェクトは不変であるほうが望ましいため、可変的なデータは最小限にする。

変化させても問題ないプロパティに対してはセッターを定義し、不変的なデータに対してはコンストラクタインジェクションのみを許可する。

もちろん、セッター内ではビジネスルールのバリデーションを実行する。

<br>

## 04-04. 値オブジェクト

### 値オブジェクトとは

ドメイン上で意味合いをもち、またプリミティブ（例：文字列、数値など）の型で表現されるオブジェクトである。

責務として、ビジネスルールや制約の定義を持ち、エンティティと区別される。

金額、数字、電話番号、文字列、日付、氏名、色などのユビキタス言語に関する状態を持つ一方で、一意で識別できるデータ (例：`id` データ) を持たない。

よくある値オブジェクトは次のとおりである。

- FullName：苗字や名前と関連処理（例：表示形式、氏名作成など）を状態・振る舞いとして表現
- Money：金額や通貨単位と関連処理（例：四則演算、不正検証など）を状態・振る舞いとして表現
- UserId：ユーザーIDと関連処理（例：IDの出力など）を状態・振る舞いとして表現
- Email：メールアドレスと関連処理（例：構文検証など）を状態・振る舞いとして表現
- Address：住所と関連処理（例：表示形式、構文検証など）を状態・振る舞いとして表現
- PhoneNumber：電話番号と関連処理（例：構文検証、国番号抽出など）を状態・振る舞いとして表現

すべてのプリミティブを値オブジェクトにするとコード量が増えてしまうため、どこまでを値オブジェクトにするのか判断が必要である。

![ドメイン駆動設計_バリューオブジェクト](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ドメイン駆動設計_バリューオブジェクト.jpg)

<br>

### 識別不可能

#### ▼ 識別不可能とは

一意に識別できるデータをもたず、対象のユビキタス言語に関するデータと関数を持つ

#### ▼ 金額

金額データの計算をInteractor内処理やエンティティ内関数で行うのではなく、金額計算をする値オブジェクトの関数として分割する。

**＊実装例＊**

```php
<?php

namespace App\Domain\Foo\ValueObjects;

/**
 * 金額の値オブジェクト
 */
class MoneyVO extends ValueObject
{
    /**
     * 金額
     *
     * @var float
     */
    private $amount;

    /**
     *
     * @param int $amount
     */
    public function __construct(int $amount = 0)
    {
        $this->amount = (float) $amount;
    }

    /**
     * 金額を返却する
     *
     * @return float
     */
    public function amount()
    {
        return $this->amount;
    }

    /**
     * 単位を返却する
     *
     * @return string
     */
    public function unit()
    {
        return "円";
    }

    /**
     * 足し算の結果を返却する
     *
     * @param Money $price
     * @return $this
     */
    public function add(Money $price)
    {
        return new static($this->amount + $price->amount);
    }

    /**
     * 引き算の結果を返却する
     *
     * @param Money $price
     * @return $this
     */
    public function substract(Money $price)
    {
        return new static($this->amount - $price->amount);
    }

    /**
     * 掛け算の結果を返却する
     *
     * @param Money $price
     * @return $this
     */
    public function multiply(Money $price)
    {
        return new static($this->amount * $price);
    }
}
```

#### ▼ 所要時間

所要時間データの計算をInteractorクラス内処理やエンティティ内関数で行うのではなく、所要時間計算をする値オブジェクトの関数として分割する。

**＊実装例＊**

```php
<?php

namespace App\Domain\Foo\ValueObjects;

/**
 * 所要時間の値オブジェクト
 */
class RequiredTime extends ValueObject
{
    /**
     * 判定値、歩行速度の目安、車速度の目安を定数で定義する。
     */
    const JUDGMENT_MINUTE = 21;
    const WALKING_SPEED_PER_MINUTE = 80;
    const CAR_SPEED_PER_MINUTE = 400;

    /**
     * 距離
     *
     * @var int
     */
    private $distance;

    /**
     * @param int $distance
     */
    public function __construct(int $distance)
    {
        $this->distance = $distance;
    }

    /**
     * 徒歩または車のどちらを使用するかを判定する
     *
     * @return bool
     */
    public function isMinuteByWalking(): bool
    {
        if ($this->distance * 1000 / self::WALKING_SPEED_PER_MINUTE < self::JUDGMENT_MINUTE) {
            return true;
        }

        return false;
    }

    /**
     * 徒歩での所要時間を計算する
     *
     * @return float
     */
    public function minuteByWalking(): float
    {
        $minute = $this->distance * 1000 / self::WALKING_SPEED_PER_MINUTE;
        return ceil($minute);
    }

    /**
     * 車での所用時間を計算する
     *
     * @return float
     */
    public function minuteByCar(): float
    {
        $minute = $this->distance * 1000 / self::CAR_SPEED_PER_MINUTE;
        return ceil($minute);
    }
}
```

#### ▼ 住所

郵便番号データとその処理を値オブジェクトとして分割する。

**＊実装例＊**

```php
<?php

namespace App\Domain\Foo\ValueObjects;

/**
 * 住所の値オブジェクト
 */
class Address extends ValueObject
{
    /**
     * 住所の文字数上限
     */
    const ADDRESS_MAX_LENGTH = 512;

    /**
     * 郵便番号
     *
     * @var string
     */
    private $zip;

    /**
     * 住所 (番地など)
     *
     * @var string
     */
    private $address;

    /**
     * 市区町村
     *
     * @var string
     */
    private $city;

    /**
     * @param string $city
     * @param string $zip
     * @param string $address
     * @param string $kana
     */
    public function __construct(string $city, string $zip, string $address, string $kana)
    {
        $this->city = $city;
        $this->zip = $zip;
        $this->address = $address;
    }

    /**
     * 郵便番号を作成し、返却する
     *
     * @return string
     */
    public function zip()
    {
        return sprintf(
            "〒%s-%s",
            substr($this->zip, 0, 3),
            substr($this->zip, 3)
        );
    }

    /**
     * 住所を作成し、返却する
     *
     * @return string
     */
    public function address(): string
    {
        return sprintf(
            "%s%s%s",
            $this->city->prefecture->name ?? '',
            $this->city->name ?? '',
            $this->address ?? ''
        );
    }
}
```

#### ▼ 氏名

氏名、性別、データとその処理を値オブジェクトとして分割する。

**＊実装例＊**

```php
<?php

namespace App\Domain\Foo\ValueObjects;

/**
 * 氏名クラスの値オブジェクト
 */
class Name extends ValueObject
{
    /**
     * 名前の文字数上限下限
     */
    const MIN_NAME_LENGTH = 1;
    const MAX_NAME_LENGTH = 64;

    /**
     * 姓
     *
     * @var
     */
    private $lastName;

    /**
     * 名
     *
     * @var string
     */
    private $firstName;

    /**
     * セイ
     *
     * @var string
     */
    private $lastKanaName;

    /**
     * メイ
     *
     * @var string
     */
    private $firstKanaName;

    /**
     * @param string $lastName
     * @param string $firstName
     * @param string $lastKanaName
     * @param string $firstKanaName
     */
    public function __construct(string $lastName, string $firstName, string $lastKanaName, string $firstKanaName)
    {
        $this->lastName = $lastName;
        $this->firstName = $firstName;
        $this->lastKanaName = $lastKanaName;
        $this->firstKanaName = $firstKanaName;

    }

    /**
     * 氏名を作成する


     */
    public function fullName(): string
    {
        return $this->lastName . $this->firstName;
    }

    /**
     * カナ氏名を作成する


     */
    public function fullKanaName(): string
    {
        return $this->lastKanaName . $this->firstKanaName;
    }
}
```

<br>

### データの不変性 (イミュータブル)

#### ▼ 不変性の実現方法

値オブジェクトは不変的であり、インスタンスとして作成されて以降、データは変更されない。

オブジェクトの不変性を実現するために、オブジェクトにセッターを定義しないようにし、データの設定には `construct` 関数のみを使用するようにする。

**＊実装例＊**

```php
<?php

namespace App\Domain\Foo\ValueObjects;

/**
 * 値オブジェクト
 */
class FooVO extends ValueObject
{
    /**
     * @var
     */
    private $propertyA;

    /**
     * @var
     */
    private $propertyB;

    /**
     * @var
     */
    private $propertyC;

    /**
     * FooVO constructor.
     *
     * @param $propertyA
     * @param $propertyB
     * @param $propertyC
     */
    public function __construct($propertyA, $propertyB, $propertyC)
    {
        $this->propertyA = $propertyA;
        $this->propertyB = $propertyB;
        $this->propertyC = $propertyC;
    }
}
```

#### ▼ セッターでは不変的にならない理由

**＊実装例＊**

Test01クラスインスタンスの `$property01` データに値を設定するためには、インスタンスからセッターをコールする。

セッターは何度でも呼び出せ、その度にデータの値を上書きできてしまう。

```php
<?php

$test01 = new Test01;

$test01->setProperty01("データ01の値");

$test01->setProperty01("新しいデータ01の値");
```

Test02クラスインスタンスの `$property02` データに値を設定するためには、インスタンスを作り直さなければならない。

つまり、以前に作ったインスタンスの `$property02` の値は上書きできない。

セッターを持たせずに、`construct` 関数のみを持たせれば、不変的なオブジェクトとなる。

```php
<?php

$test02 = new Test02("データ02の値");

$test02 = new Test02("新しいデータ02の値");
```

#### ▼ 過剰なゲッターへの対処法

不変的なデータはゲッターを使用しなければアクセスできない。

そのため、値オブジェクトにプロパティ値を返すだけのゲッターが量産され、ファイルの見通しが悪くなってしまう。

そこで、例えばPHPでは、マジック関数の `__get` 関数を使用して、ゲッターの実装を省略できる。

全ての値オブジェクトの基底クラスに、『コールされたゲッターがクラス内に存在していなければ、動的にプロパティにアクセスして返却する』処理を持った `__get` 関数を定義しておく。

すると、マジック関数のオーバーライド機能により、自身で定義した `__get` 関数が代わりにコールされる。そのため、ゲッターを定義する必要がなくなる。

```php
<?php

declare(strict_types=1);

namespace App\Traits;

use LogicException;

/**
 * イミュータブルトレイト
 * NOTE: イミュータブルなオブジェクトで使用する汎用的な関数を定義する
 */
trait イミュータブルTrait
{
    /**
     * ゲッターが定義されていなくとも、プロパティにアクセスできるようにする
     *
     * @param string $name
     * @return mixed
     */
    public function __get(string $name)
    {
        if (!property_exists($this, $name)) {
            throw new LogicException(sprintf(
                "property %s is not found in %s",
                $name,
                static::class // 関数が実行されたクラスを取得
            ));
        }

        return $this->{$name};
    }
}
```

```php
class Foo
{
    use ImmutableTrait;

    private $bar;

    public function __constructor($bar)
    {
        $this->bar = $bar
    }
}

$foo = new Foo()
$foo->bar // __get関数が代わりにコールされ、プロパティ値が返却される。
```

<br>

### 概念的な統一体

```php
<?php

// ここに実装例
```

<br>

### 交換可能性

オブジェクトが新しくインスタンス化された場合、以前に同一オブジェクトから作成されたインスタンスを新しいものに置き換える必要がある。

<br>

### 属性による等価性

#### ▼ 属性による等価性バリデーションとは

等価性を検証する関数を持つ。

保持する全ての属性が、対象の値オブジェクトと同じ場合、同じものと見なされる。

#### ▼ 等価性の検証方法

**＊実装例＊**

属性を1つだけ保持する場合、`1` 個の属性のみを検証すれば良いため、以下の通りとなる。

```php
<?php

namespace App\Domain\Foo\ValueObjects;

/**
 * 連絡先メールアドレスの値オブジェクト
 */
final class ContactMail extends ValueObject
{
    /**
     * @var string
     */
    private string $value;

    /**
     * @param string $value
     */
    public function __constructor(string $value)
    {
        $this->value = $value;
    }

    /**
     * @return string
     */
    public function value(): string
    {
        return $this->value;
    }

    /**
     * 値オブジェクトの等価性を検証する


     *
     * @param ValueObject $VO
     * @return bool
     */
    public function equals(ValueObject $VO): bool
    {
        // 単一の属性を対象とする。
        return $this->value() === $VO->value();
    }
}
```

属性を複数保持する値オブジェクトの場合、全ての属性を検証する必要があるため、以下の通りとなる。

```php
<?php

namespace App\Domain\Foo\ValueObjects;

/**
 * 支払情報の値オブジェクト
 */
final class PaymentInfoVO extends ValueObject
{
    /**
     * 支払い方法
     *
     * @var PaymentType
     */
    private $paymentType;

    /**
     * 連絡先メールアドレス
     *
     * @var ContactMail
     */
    private $contactMail;

    /**
     * 金額
     *
     * @var Money
     */
    private $price;

    /**
     * @param PaymentType $paymentType
     * @param ContactMail $contactMail
     * @param Money       $price
     */
    public function __constructor(PaymentType $paymentType, ContactMail $contactMail, Money $price)
    {
        $this->paymentType = $paymentType;
        $this->contactMail = $contactMail;
        $this->price = $price;
    }

    /**
     * 値オブジェクトの等価性を検証する


     *
     * @param ValueObject $VO
     * @return bool
     */
    public function equals(ValueObject $VO): bool
    {
        // 複数の属性を対象とする。
        return $this->paymentType->value() === $VO->paymentType->value()
            && $this->contactMail->value() === $VO->contactMail->value()
            && $this->price->value() === $VO->price->value();
    }
}
```

全ての値オブジェクトに等価性のバリデーション関数を持たせると可読性が低い。

そこで、継承元の抽象クラスの値オブジェクトに定義すると良い。

その時は、保持している属性を反復的に検証できるよう実装するとよい。

```php
<?php

namespace App\Domain;

/**
 * 値オブジェクト抽象クラス
 */
abstract class ValueObject
{
    /**
     * 値オブジェクトの等価性を検証する


     *
     * @param ValueObject $VO
     * @return bool
     */
    public function equals(ValueObject $VO): bool
    {
        // 全ての属性を反復的に検証する
        foreach (get_object_vars($this) as $key => $value) {
            if ($this->__get($key) !== $VO->__get($key)) {
                return false;
            }
        }

        return true;
    }
}
```

<br>

## 04-05. ルートエンティティとトランザクション

### ルートエンティティ

#### ▼ ルートエンティティとは

![ドメイン駆動設計_集約関係](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ドメイン駆動設計_集約関係.jpg)

エンティティや値オブジェクトからなる集約の中で、最終的にユースケース層へレスポンスされる集約を、『ルートエンティティ』という。

**＊実装例＊**

ECサイトであれは、業務フローに沿って、以下のルートエンティティがある。

- 受注管理部門の受注ルートエンティティ
- 出荷管理部門の出荷ルートエンティティ
- 請求管理部門の請求ルートエンティティ
- 在庫管理部門の在庫ルートエンティティ
- 調達管理部門の調達ルートエンティティ

**＊実装例＊**

```php
<?php

namespace App\Domain\Foo\Entities;

use App\Domain\Entity;
use App\Domain\Id;
use App\Domain\Foo\Entities\DogToy;
use App\Domain\Foo\Entities\DogFood;

/**
 * 犬用注文エンティティ
 */
class DogOrder
{
    /**
     * 犬用商品コンボID
     *
     * @var Id
     */
    private $id;

    /**
     * 犬用おもちゃ
     *
     * @var DogToy
     */
    private $dogToy;

    /**
     * 犬用えさ
     *
     * @var DogFood
     */
    private $dogFood;

    /**
     * @param DogToy  $dogToy
     * @param DogFood $dogFood
     */
    public function __construct(DogToy $dogToy, DogFood $dogFood)
    {
        $this->dogToy = $dogToy;
        $this->dogFood = $dogFood;
    }

    /**
     * 犬用おもちゃを返却する
     *
     * @return DogToy
     */
    public function getDogToy(): DogToy
    {
        return $this->dogToy;
    }

    /**
     * 犬用えさを返却する
     *
     * @return DogFood
     */
    public function getDogFood(): DogFood
    {
        return $this->dogFood;
    }
}
```

> - https://it-trend.jp/sales_management/article/11-0031

#### ▼ 集約とは

データをセットで扱う必要があるエンティティのまとまりのこと。

<br>

### 集約の見つけ方

#### ▼ イベントストーミングにおける『名詞』のユビキタス言語

ドメインエキスパートが業務を語る際に登場すユビキタス言語の名詞は、境界づけられたコンテキストを横断して移動するルートエンティティである可能性がある。

#### ▼ トランザクションとの関係性

インフラストラクチャ層のリポジトリでは、レコードの書き込み/読み出しをルートエンティティ単位で実行する。

ルートエンティティを定義づけるときの注意点として、集約の単位が大き過ぎると、一部分のエンティティのみトランザクションの対象とすれば良い処理であるのにも関わらず、ルートエンティティ全体まで対象としなければならなくなる。

そのため、ビジネスロジックとしてのまとまりと、トランザクションとしてのまとまりの両方から、ルートエンティティの単位を定義づけると良い。

> - https://qiita.com/mikesorae/items/ff8192fb9cf106262dbf#%E5%AF%BE%E7%AD%96-1
> - https://codezine.jp/article/detail/10776
> - https://learn.microsoft.com/ja-jp/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/インフラストラクチャ層-persistence-layer-design#define-one-repository-per-aggregate

<br>

