---
title: 【IT技術の知見】クリーンアーキテクチャ＠アーキテクチャ
description: クリーンアーキテクチャ＠アーキテクチャの知見を記録しています。
---

# クリーンアーキテクチャ＠アーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. アーキテクチャ概要

#### ▼ 思想

DDDが適する機能的アプリケーションのみでなく、あらゆる種類 (例：非機能的アプリケーションなど) のソフトウェアに適用できる。

クリーンアーキテクチャ原著の序文にて、著者は『私は、今まで色々な種類のシステムを作ってきたが、どのシステムもアーキテクチャもルールは同じだった。

異なるシステムでも同じルールを共有する必要がある』というようなことを述べている。

> - https://www.amazon.co.jp/dp/B07FSBHS2V

#### ▼ 構成

> - https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

![clean-architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/clean-architecture.jpeg)

#### ▼ クラス or 関数

オブジェクト指向型と手続き型のマルチパラダイム言語の場合、アプリケーションをクラスまたは関数で実装できる。

クリーンアーキテクチャはオブジェクト指向設計が前提にあるため、各レイヤーのパターンをクラスとして実装することが多い。

ただし、クラスとして実装するとインスタンス化の手間があり、関数として実装しても、アーキテクチャの思想に反することがない場合がある (特に外側のレイヤー) 。

アーキテクチャのレイヤー別にこれを整理した。

| レイヤー             | パターン   | クラス or 関数 |
| -------------------- | ---------- | -------------- |
| インフラストラクチャ | DB         | クラス、関数   |
|                      | DTO        | クラス         |
|                      | Logger     | クラス         |
|                      | Middlware  | 関数           |
|                      | Repository | クラス         |
|                      | Routers    | 関数           |
|                      | Seeder     | クラス         |
| インターフェース     | Controller | クラス         |
| ユースケース         | Boundary   | クラス         |
|                      | Interactor | クラス         |
|                      | Request    | クラス         |
|                      | Response   | クラス         |
| ドメイン             | Entity     | クラス         |
|                      | Id         | クラス         |
|                      | Repository | クラス         |
|                      | Value      | クラス         |

<br>

## 02. <span style="color: lightgreen; ">インターフェース層</span> (プレゼンテーション層、デリバリー層)

### インターフェース層とは

<br>

### コントローラー

#### ▼ コントローラーとは

入力/出力の処理時で、責務を以下の様に分類できる。

コントローラーの責務をデザインパターンに切り分けても良い。

| 入力時/出力時 | 責務                                                                                                                             | 補足                                                                                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 入力          | インフラ層のルーターから入力される認証情報を照合し、認証を実行する。                                                             | 認証はインターフェース層あるいはユースケース層に実装する。<br>・https://github.com/little-hands/ddd-q-and-a/issues/173                                                         |
|               | インフラ層のルーターから入力されるパラメーターをAPI仕様 (必須、書式、など) と照らし合わせ、バリデーションを実行する。            | データの値がAPI仕様と比較して正しいか否かを検証することに止まり、データの値が正しいか否かの検証は、ユースケース層やドメイン層に実装する。                                      |
|               | インフラ層のルーターから入力されるパラメーターをリクエストモデルに変換し、ユースケース層のインターラクターに入力する。           | リクエストモデル作成処理で、ドメイン層への依存が必要になる。リクエストモデル作成処理を切り分け、ユースケース層に配置すると、コントローラーがドメイン層に依存することを防げる。 |
| 出力          | ユースケース層のインターラクターから出力されるレスポンスモデルを、JSON型データとしてフロントエンドにに返信する。                 | バックエンドをAPIとして使用する場合、プレゼンターは不要である。                                                                                                                |
|               | ユースケース層のインターラクターから出力されるプレゼンターをビューモデルに変換し、バックエンドのテンプレートエンジンに出力する。 | バックエンドでテンプレートエンジンを使用してHTMLを作成する場合、プレゼンターが必要である。                                                                                     |

<br>

### プレゼンター

#### ▼ プレゼンターとは

バックエンドがテンプレートエンジンを持つフレームワークの時に、バックエンドからフロントエンドのロジックを分離するために使用する。

一方で、バックエンドとフロントエンドを完全に分離し、バックエンドがJSON型データを返信するAPIとして動作する場合や、フロントエンドにテンプレートエンジンを組み込む場合は、プレゼンターを使用しない。

補足として、アウトプットバウンダリはプレゼンターのインターフェースのため、プレゼンターを使用しなければ、アウトプットバウンダリも使用しない。

> - https://izumisy.work/entry/2019/12/12/000521
> - https://codezine.jp/article/detail/9749

<br>

### バリデーションパターン

#### ▼ バリデーションパターンとは

デザインパターンの一種。

インターフェース層のバリデーションでは、データの必須や書式を検証する。

**＊実装例＊**

日時データのフォーマットを検証する。

```php
<?php

namespace App\Interface\Foo\Validators;

// Validationのパッケージ
use Respect\Validation\Validator;

class FormatValidator
{
    /**
     * 日時データのフォーマットを検証します。


     */
    public function validateFormat($dateTime)
    {
        if (empty($dateTime)) {
            return false;
        }

        if (!Validator::date(\DateTime::ATOM)->validate($dateTime)) {
            return false;
        }

        return true;
    }
}
```

<br>

## 03. <span style="color: LightSalmon; ">ユースケース層</span>

### 処理フロー

インターフェース層からユースケース層までの処理の流れを以下に示す。

![clean-architecture_flow](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master//images/clean-architecture_flow.png)

> - http://www.plainionist.net/Implementing-Clean-Architecture-Controller-Presenter/

<br>

### インターラクター

#### ▼ インターラクターとは

入力/出力の処理時で、責務を以下の様に分類できる。

ユースケースごとに異なるInteractorクラスを定義する方法と、全てのユースケースを責務として持つInteractorクラスを定義する方法がある。

また、Interactorインターフェースを用意して、インターフェース層のコントローラーはこれを経由して、実装Interactorクラスのメソッドをコールする。

| 入力時/出力時 | 責務                                                                                                                                                           | 補足                                                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 入力          | インターフェース層のコントローラーから入力されるリクエストパラメーターを、ソフトウェア上のルール (ユースケース) と照らし合わせてバリデーションを実行する。     | データの値がシステム上あり得ないか否かを検証する。ビジネス上あり得ない値か否かはドメイン層にSpecificationパターンとして実装する。 |
|               | ドメイン層のメソッドを組み合わせて、ユーザーの要求に対するソフトウェアの振舞 (ユースケース) を具現化する。                                                     |                                                                                                                                   |
|               | インターフェース層のコントローラーから入力されるリクエストパラメーターを、ドメイン層のインターフェースリポジトリに渡せるドメインモデルに変換する。             |                                                                                                                                   |
| 出力          | ドメイン層のインターフェースリポジトリから出力されるドメインモデルをレスポンスモデルに変換し、インターフェース層のコントローラーに出力する。                   | バックエンドをAPIとして使用する場合、プレゼンターは不要である。                                                                   |
|               | ドメイン層のインターフェースリポジトリから出力されるドメインモデルをレスポンスモデルを経てプレゼンターに変換し、インターフェース層のコントローラーに出力する。 | バックエンドでテンプレートエンジンを使用してHTMLを作成する場合、プレゼンターが必要である。                                        |

#### ▼ ユースケースとメソッド名

インターラクターでは、ドメイン層を組み合わせてソフトウェアの振舞 (ユースケース) を具現化する。

そのため、メソッド名はユースケースを適切に表現した自由な英単語を使用する。

フレームワークのLaravelの基本的なメソッド名 (index、store、create、show、update) が参考になる。

`CREATE`処理と`UPDATE`処理をSAVE処理としてまとめても良い。

| メソッド名          | 引数型                            | 返却値型                            | 処理内容                                                                                                                                                                           |
| ------------------- | --------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| indexFoo            | indexFooRequest                   | indexFooResponse                    |                                                                                                                                                                                    |
| showFoo             | showFooRequest                    | showFooResponse                     |                                                                                                                                                                                    |
| createFoo           | createFooRequest                  | createFooResponse                   |                                                                                                                                                                                    |
| updateFoo           | updateFooRequest                  | updateFooResponse                   |                                                                                                                                                                                    |
| saveFoo (upsertFoo) | saveFooRequest (upsertFooRequest) | saveFooResponse (upsertFooResponse) | リポジトリのfindメソッドをコールして重複確認を実行し、その結果に応じてcreateメソッドまたはupdateメソッドをコールする。<br>- https://github.com/little-hands/ddd-q-and-a/issues/241 |
| deleteFoo           | deleteFooRequest                  | deleteFooResponse                   |                                                                                                                                                                                    |

#### ▼ ユースケース図

ユースケース図については、以下のリンクを参考にせよ。

**＊実装例＊**

バックエンドをAPIとして使用する場合、プレゼンターは不要となる。

この場合を以下に示す。

```php
<?php

namespace App\UseCase\Foo\Interactors;

/**
 * Foo作成インターラクタークラス
 * ※ユースケースごとにクラスを定義する方法
 */
class FooCreateInteractor
{
    /**
     * @var FooRepository
     */
    private FooRepository $fooRepository;

    /**
     * @param FooRepository $fooRepository
     */
    public function __constructor(FooRepository $fooRepository)
    {
        $this->fooRepository = $fooRepository;
    }

    /**
     * @param CreateFooRequest $createFooRequest
     * @return CreateFooResponse
     */
    public function createFoo(CreateFooRequest $createFooRequest): CreateFooResponse
    {
        $foo = $this->fooRepository->create(
            new Bar($createFooRequest->bar),
            new Baz($createFooRequest->baz)
        );

        // 何らかの処理
    }
}
```

```php
<?php

namespace App\UseCase\Foo\Interactors;

/**
 * Fooインターラクタークラス
 * ※CURD全てのユースケースを、1個のクラスを定義する方法
 */
class FooInteractor
{
    /**
     * @var FooRepository
     */
    private FooRepository $fooRepository;

    /**
     * @param FooRepository $fooRepository
     */
    public function __constructor(FooRepository $fooRepository)
    {
        $this->fooRepository = $fooRepository;
    }

    /**
     * @param CreateFooRequest $createFooRequest
     * @return CreateFooResponse
     */
    public function createFoo(CreateFooRequest $createFooRequest): CreateFooResponse
    {
        $foo = $this->fooRepository->create(
            new Bar($createFooRequest->bar),
            new Baz($createFooRequest->baz)
        );

        // 何らかの処理
    }

    /**
     * @param GetFooRequest $getFooRequest
     * @return GetFooResponse
     */
    public function getFoo(GetFooRequest $getFooRequest): GetFooResponse
    {
        $foo = $this->fooRepository->findById(
            new FooId($getFooRequest->id)
        );

        // 何らかの処理
    }

    /**
     * @param UpdateFooRequest $updateFooRequest
     * @return UpdateFooResponse
     */
    public function updateFoo(UpdateFooRequest $updateFooRequest): UpdateFooResponse
    {
        $foo = $this->fooRepository->update(
            new FooId($updateFooRequest->id),
            new Bar($updateFooRequest->bar),
            new Baz($updateFooRequest->baz)
        );

        // 何らかの処理
    }

    /**
     * @param DeleteFooRequest $deleteFooRequest
     * @return DeleteFooResponse
     */
    public function deleteFoo(DeleteFooRequest $deleteFooRequest): DeleteFooResponse
    {
        $foo = $this->fooRepository->delete(
            new FooId($deleteFooRequest->id)
        );

        // 何らかの処理
    }
}
```

> - https://hiroki-it.github.io/tech-notebook/software/software_application_architecture_backend_object_orientation_design.html

<br>

### インプットバウンダリ

#### ▼ インプットバウンダリとは

インターラクターのインターフェースのこと。

上位レイヤーにあるコントローラーは、インターラクターインタフェースに依存する。

**＊実装例＊**

```php
<?php

namespace App\UseCase\Foo\InputBoundaries;

/**
 * Fooインターラクターインターフェース
 */
interface FooInteractorInterface
{
    /**
     * @param CreateFooRequest $createFooRequest
     * @return CreateFooResponse
     */
    public function createFoo(CreateFooRequest $createFooRequest): CreateFooResponse

    /**
     * @param GetFooRequest $getFooRequest
     * @return GetFooResponse
     */
    public function getFoo(GetFooRequest $getFooRequest): GetFooResponse

    /**
     * @param UpdateFooRequest $updateFooRequest
     * @return UpdateFooResponse
     */
    public function updateFoo(UpdateFooRequest $updateFooRequest): UpdateFooResponse

    /**
     * @param DeleteFooRequest $deleteFooRequest
     * @return DeleteFooResponse
     */
    public function deleteFoo(DeleteFooRequest $deleteFooRequest): DeleteFooResponse
}
```

<br>

### アウトプットバウンダリ

#### ▼ アウトプットバウンダリとは

上位レイヤーのプレゼンターのインターフェースのこと。

インターラクターは、レスポンスモデルではなく。

アウトプットバウンダリをインターフェース層に出力する。

ただし、アプリケーションをAPIとして使用する場合は、プレゼンターとアウトプットバウンダリが不要になり、これに伴い、インターラクターはレスポンスモデルを返却する。

<br>

### リクエストモデル (インプットデータ)

#### ▼ リクエストモデルとは

インターフェース層のコントローラーから入力されるリクエストパラメーターをユースケース層に入力する時に、その入力構造を定義する。

インターラクターのメソッドごとにリクエストモデルを用意すると良い。

```php
<?php

namespace App\Interface\Foo\Requests;

class FooCreateRequest
{
    /**
     * @var int
     */
    private int $fooId;

    /**
     * @var string
     */
    private string $fooName;

    /**
     * @param int    $fooId
     * @param string $fooName
     */
    public function __construct(int $fooId, string $fooName)
    {
        $this->fooId = $fooId;
        $this->fooName = $fooName;
    }
}
```

<br>

### レスポンスモデル (アウトプットデータ)

#### ▼ レスポンスモデルとは

ユースケース層のインターラクターから出力されるドメインモデルをインターフェース層に出力する時に、その出力構造を定義する。

インターラクターのメソッドごとにレスポンスモデルを用意すると良い。

またコントローラーにて、フレームワーク依存のJSONレスポンスメソッドにレスポンスモデルを渡せるよう、クラス自身の構造を変換するメソッドを持たせると良い。

もし、クラス自身を渡して問題ないJSONレスポンスメソッドであれば、これは不要である。

**＊実装例＊**

ユースケース層のindexメソッドに対応するレスポンスモデル。

JSONレスポンスメソッドが配列構造を引数に受け付けるため、これに渡せるよう、自身を配列構造に変換するメソッドを持たせる。

```php
<?php

namespace App\Interface\Foo\Responses;

class FooIndexResponse
{
    /**
     * @var array
     */
    private array $foos;

    /**
     * @param array $foos
     */
    public function __construct(array $foos)
    {
        $this->foos = $foos;
    }

    /**
     * @return array
     */
    public function toArray(): array
    {
        return [
            "foos" => $this->foos
        ];
    }
}
```

ユースケース層のcreateメソッドに対応するレスポンスモデル。

```php
<?php

namespace App\Interface\Foo\Responses;

class FooCreateResponse
{
    /**
     * @var int
     */
    private int $fooId;

    /**
     * @var string
     */
    private string $fooName;

    /**
     * @param int    $fooId
     * @param string $fooName
     */
    public function __construct(int $fooId, string $fooName)
    {
        $this->fooId = $fooId;
        $this->fooName = $fooName;
    }

    /**
     * @return array
     */
    public function toArray(): array
    {
        return [
            "id" => $this->fooId,
            "name" => $this->fooName
        ];
    }
}
```

<br>

### アプリケーションサービス

#### ▼ アプリケーションサービスとは

ユースケース層で、他のオブジェクトを対象とした汎用的な振舞ロジックを切り分けたもの。

アプリケーションサービスは、他のオブジェクトにロジックをメソッドとして提供するのみで、自身の状態を変化させるメソッドは持たせないようにする。

補足として、『サービス』の概念は全てのレイヤーに存在する。

特定の機能を提供するアプリケーションをサービスとみなして連携すれば、マイクロサービスアーキテクチャにもなる。

#### ▼ 通知処理

**＊実装例＊**

エンティティへの通知処理をアプリケーションサービスとして切り分ける。

```php
<?php

namespace App\UseCase\Foo\Services\Notify;

class NotifyFooService
{
    /**
     * @var Message
     */
    private $message;

    /**
     * @param Message $message
     */
    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    public function notify()
    {
        // SlackのAPIにメッセージを送信する処理
    }
}
```

これを、ユースケース層でコールする。

```php
<?php

namespace App\UseCase\Foo\Services;

use App\Service\SlackNotification;

class FooInteractor
{
    public function foo()
    {
        $message = new Message(/* メッセージに関するデータを渡す */)
        $notifyFooService = new NotifyFooService($message)
        $notifyFooService->notify();
    }
}
```

<br>

## 04. <span style="color: yellow; ">ドメイン層</span>

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

エンティティデザインパターンの1つである『Pub/Subパターン』の概念を使用して、ドメインイベントとイベントリスナー (イベントハンドラー) の関連を表す。

<br>

### Type Code (標準型)

#### ▼ Type Codeとは

Type Codeは概念的な呼び名で、実際は、標準的なパッケージとして利用できるEnumクラスに相当する。

一意に識別する必要がないユビキタス言語の中でも、特に『区分』や『種類』などは、値オブジェクトとしてではなく、Enumクラスとしてモデリング/実装する。

ただし、類似するパターンとして値オブジェクトのディレクトリ内に配置しても良い。

#### ▼ 色

**＊実装例＊**

```php
<?php

namespace App\Domain\Foo\ValueObjects;

/**
 * 色のタイプコード
 */
class ColorType
{
    const RED = 1;
    const BLUE = 2;

    /**
     * 『self::定数名』で、定義の値へアクセスします。


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
     * 値を返却します。


     */
    public function value(): int
    {
        return $this->value;
    }


    /**
     * 色名を返却します。


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
 * 性別のタイプコード
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
     * 値を返却します。


     */
    public function value(): int
    {
        return $this->value;
    }
    /**
     * 名前を返却します。


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
 * 年月日のタイプコード
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
     * 値を返却します
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
     * 年号名を返却します
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

ドメインサービスは、他のドメインオブジェクトにロジックをメソッドとして提供するのみで、自身の状態を変化させるメソッドは持たせないようにする。

全てのメソッドを`1`個のドメインサービスにまとめて管理するよりも、動作の種類ごとに分けて管理した方が良い。

この時、エンティティのビジネスロジックがドメインサービスに実装されすぎないように注意する。

補足として、ドメイン層でリポジトリを使用することを嫌って、ドメインサービスの処理をユースケース層のアプリケーションサービスで定義しても問題ない。

> - https://github.com/little-hands/ddd-q-and-a/issues/159
> - https://www.amazon.co.jp/dp/B082WXZVPC
> - https://codezine.jp/article/detail/10318

#### ▼ 重複確認

ドメイン層のリポジトリを使用して、該当の名前のエンティティがDBに存在するか否かを検証する。

ドメインサービスではなく、アプリケーションサービスとして定義しても良い。

> - https://stackoverflow.com/questions/45007667/cqrs-ddd-how-to-validate-products-existence-before-adding-them-to-order
> - https://www.amazon.co.jp/dp/B082WXZVPC
> - https://github.com/little-hands/ddd-q-and-a/issues/573

**＊実装例＊**

```php
<?php

namespace App\Domain\Foo\Services;

class CheckDuplicateFooService
{
    /**
     * @var FooRepository
     */
    private FooRepository $fooRepositoy;

    /**
     * @param FooRepository $fooRepositoy
     */
    public function __construct(FooRepository $fooRepositoy)
    {
        $this->fooRepositoy = $fooRepositoy;
    }

    /**
     * エンティティがすでに存在しているか否かを判定します。


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

#### ▼ 認可

ドメイン層のリポジトリを使用して、該当のIDのエンティティに対してアクセスできるかを検証する。

ドメインサービスではなく、アプリケーションサービスとして定義しても良い。

> - https://lessthan12ms.com/authorization-and-authentication-in-clean-architecture.html
> - https://medium.com/@martinezdelariva/authentication-and-authorization-in-ddd-671f7a5596ac
> - https://github.com/lezhnev74/ema/blob/master/src/Domain/Note/Commands/ModifyNote/ModifyNoteAuthorizer.php
> - https://github.com/little-hands/ddd-q-and-a/issues/121

**＊実装例＊**

```php
<?php

namespace App\Domain\Foo\Services;

class AuthorizeFooService
{
    /**
     * @var FooRepository
     */
    private FooRepository $fooRepositoy;

    /**
     * @param FooRepository $fooRepositoy
     */
    public function __construct(FooRepository $fooRepositoy)
    {
        $this->fooRepositoy = $fooRepositoy;
    }

    /**
     * 更新処理を実行できるかを検証します。


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

### Specificationパターン

#### ▼ Specificationパターンとは

デザインパターンの一種。

責務として、バリデーション、検索条件入力データを持つ。

これらをエンティティや値オブジェクトのメソッド内部に持たせた場合、肥大化の原因となり、また埋もれてしまうため、可読性と保守性が悪い。

そこで、こういったビジネスルールをSpecificationオブジェクトとして切り分けておく。

#### ▼ ビジネスルールのバリデーション

bool値メソッド (`isFoo`メソッド) のように、オブジェクトのデータを検証して、仕様を要求を満たしているか、何らかの目的のために用意できているかを調べる処理する。

**＊実装例＊**

```php
<?php

namespace App\Domain\Foo\Specifications;

class FooSpecification
{
    /**
     * ビジネスルールを判定します。


     * @param Entity $entity
     * @return bool
     */
    public function isSatisfiedBy(Entity $entity): bool
    {
        if (!$entity->isX) return false;
        if (!$entity->isY) return false;
        if (!$entity->isZ) return false;

        return true;
    }
}
```

#### ▼ 検索条件入力データ

リクエストのパスパラメーターとクエリパラメーターを引数として、検索条件のオブジェクトを作成する。

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
     * 検索条件のオブジェクトを作成します。


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

責務として、ビジネスのルールや制約の定義を持ち、値オブジェクトとは区別される。

エンティティの責務をデザインパターンに切り分けても良い。

一意で識別できるデータ (例：`id`データ) を持つ

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
     * 犬用おもちゃ名 (色) を返却します。


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

### 識別子による等価性検証

#### ▼ 識別子による等価性検証とは

等価性検証用の`equals`メソッドを持つ。

保持する識別子が、対象のエンティティと同じ場合、同じものと見なされる。

#### ▼ 等価性の検証方法

全てのエンティティに等価性の検証メソッドを持たせると可読性が低い。

そこで、全てのエンティティに等価性検証用の`equals`メソッドを持たせることをやめ、継承元の抽象クラスのエンティティにこれを定義すると良い。

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
     * エンティティの等価性を検証します。


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
     * IDクラスを返却します。


     */
    public function id(): Id
    {
        return $this->id;
    }
}
```

#### ▼ 複合主キーへの対応 (PHPでは不要)

以降の説明はJavaについて適用されるため、PHPでは不要である。

複合主キーを持つオブジェクトに対応するために、主キーとなる方のオブジェクト側に、`equals`メソッドと`hash`メソッドを定義する。

これにより、言語標準搭載の`equals`メソッドと`hash`メソッドをオーバーライドし、異なるセッションに渡ってオブジェクトを比較できるようにする。

これらを定義しないと、オーバーライドされずに標準搭載のメソッドが使用される。

標準搭載のメソッドでは、異なるセッションに渡ったオブジェクトの比較では、必ず異なるオブジェクトであると判定してしまう。

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
     * ハッシュ値を返却します。


     *
     * NOTE: 複合主キーを持つオブジェクトの等価性を正しく検証するために、標準の関数をオーバーライドします。


     *
     * @return string
     */
    public function hash(): string
    {
        return $this->id;
    }

    /**
     * オブジェクトの等価性を検証します。


     *
     * NOTE: 複合主キーを持つオブジェクトの等価性を正しく検証するために、標準の関数をオーバーライドします。


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

ただし、そもそもオブジェクトは不変である方が望ましいため、可変的なデータは最小限にする。

変化させても問題ないプロパティに対してはセッターを定義し、不変的なデータに対してはコンストラクタインジェクションのみを許可する。

もちろん、セッター内ではドメインルールのバリデーションを実行する。

<br>

## 04-04. 値オブジェクト

### 値オブジェクトとは

責務として、ビジネスのルールや制約の定義を持ち、エンティティと区別される。

金額、数字、電話番号、文字列、日付、氏名、色などのユビキタス言語に関するデータを持つ一方で、一意で識別できるデータ (例：`id`データ) を持たない。

![ドメイン駆動設計_バリューオブジェクト](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ドメイン駆動設計_バリューオブジェクト.jpg)

<br>

### 識別不可能

#### ▼ 識別不可能とは

一意に識別できるデータをもたず、対象のユビキタス言語に関するデータをメソッドを持つ

#### ▼ 金額

金額データの計算をInteractor内処理やエンティティ内メソッドで実行するのではなく、金額計算を実行する値オブジェクトのメソッドとして分割する。

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
     * 金額を返却します
     *
     * @return float
     */
    public function amount()
    {
        return $this->amount;
    }

    /**
     * 単位を返却します
     *
     * @return string
     */
    public function unit()
    {
        return "円";
    }

    /**
     * 足し算の結果を返却します
     *
     * @param Money $price
     * @return $this
     */
    public function add(Money $price)
    {
        return new static($this->amount + $price->amount);
    }

    /**
     * 引き算の結果を返却します
     *
     * @param Money $price
     * @return $this
     */
    public function substract(Money $price)
    {
        return new static($this->amount - $price->amount);
    }

    /**
     * 掛け算の結果を返却します
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

所要時間データの計算をInteractorクラス内処理やエンティティ内メソッドで実行するのではなく、所要時間計算を実行する値オブジェクトのメソッドとして分割する。

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
     * 判定値、歩行速度の目安、車速度の目安、を定数で定義する。


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
     * 徒歩または車のどちらを使用するかを判定します
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
     * 徒歩での所要時間を計算します
     *
     * @return float
     */
    public function minuteByWalking(): float
    {
        $minute = $this->distance * 1000 / self::WALKING_SPEED_PER_MINUTE;
        return ceil($minute);
    }

    /**
     * 車での所用時間を計算します
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
     * 郵便番号を作成し、返却します
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
     * 住所を作成し、返却します
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
     * 氏名を作成します。


     */
    public function fullName(): string
    {
        return $this->lastName . $this->firstName;
    }

    /**
     * カナ氏名を作成します。


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

オブジェクトの不変性を実現するために、オブジェクトにセッターを定義しないようにし、データの設定には`construct`メソッドのみを使用するようにする。

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

Test01クラスインスタンスの`$property01`データに値を設定するためには、インスタンスからセッターをコールする。

セッターは何度でも呼び出せ、その度にデータの値を上書きできてしまう。

```php
<?php

$test01 = new Test01;

$test01->setProperty01("データ01の値");

$test01->setProperty01("新しいデータ01の値");
```

Test02クラスインスタンスの`$property02`データに値を設定するためには、インスタンスを作り直さなければならない。

つまり、以前に作ったインスタンスの`$property02`の値は上書きできない。

セッターを持たせずに、`construct`メソッドのみを持たせれば、不変的なオブジェクトとなる。

```php
<?php

$test02 = new Test02("データ02の値");

$test02 = new Test02("新しいデータ02の値");
```

#### ▼ 過剰なゲッターへの対処法

不変的なデータはゲッターを使用しなければアクセスできない。

そのため、値オブジェクトにプロパティ値を返却するだけのゲッターが量産され、ファイルの見通しが悪くなってしまう。

そこで、例えばPHPでは、マジックメソッドの`__get`メソッドを使用して、ゲッターの実装を省略できる。

全ての値オブジェクトの基底クラスに、『コールされたゲッターがクラス内に存在していなければ、動的にプロパティにアクセスして返却する』処理を持った`__get`メソッドを定義しておく。

すると、マジックメソッドのオーバーライド機能により、自身で定義した`__get`メソッドが代わりにコールされるようになり、ゲッターを定義する必要がなくなる。

```php
<?php

declare(strict_types=1);

namespace App\Traits;

use LogicException;

/**
 * イミュータブルトレイト
 * NOTE: イミュータブルなオブジェクトで使用する汎用的なメソッドを定義します。


 */
trait イミュータブルTrait
{
    /**
     * ゲッターが定義されていなくとも、プロパティにアクセスできるようにします。


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
                static::class // メソッドが実行されたクラスを取得
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
$foo->bar // __getメソッドが代わりにコールされ、プロパティ値が返却される。
```

<br>

### 概念的な統一体

```php
<?php

// ここに実装例
```

<br>

### 交換可能性

オブジェクトが新しくインスタンス化された場合、以前に同一オブジェクトから作成されたインスタンスから新しく置き換える必要がある。

<br>

### 属性による等価性

#### ▼ 属性による等価性検証とは

等価性を検証するメソッドを持つ。

保持する全ての属性が、対象の値オブジェクトと同じ場合、同じものと見なされる。

#### ▼ 等価性の検証方法

**＊実装例＊**

属性を1つだけ保持する場合、`1`個の属性のみを検証すれば良いため、以下の通りとなる。

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
     * 値オブジェクトの等価性を検証します。


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
     * 値オブジェクトの等価性を検証します。


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

全ての値オブジェクトに等価性の検証メソッドを持たせると可読性が低い。

そこで、継承元の抽象クラスの値オブジェクトに定義すると良い。

その時は、保持している属性を反復的に検証できるように実装すると良い。

```php
<?php

namespace App\Domain;

/**
 * 値オブジェクト抽象クラス
 */
abstract class ValueObject
{
    /**
     * 値オブジェクトの等価性を検証します。


     *
     * @param ValueObject $VO
     * @return bool
     */
    public function equals(ValueObject $VO): bool
    {
        // 全ての属性を反復的に検証します。
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
     * 犬用おもちゃを返却します。


     *
     * @return DogToy
     */
    public function getDogToy(): DogToy
    {
        return $this->dogToy;
    }

    /**
     * 犬えさを返却します。


     *
     * @return DogFood
     */
    public function getDogFood(): DogFood
    {
        return $this->dogFood;
    }
}
```

#### ▼ 集約とは

データをセットで扱う必要があるエンティティのまとまりのこと。

依存関係の観点からみた集約については、以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/language/language_php_class_based.html

<br>

### トランザクションとの関係性

インフラ層のリポジトリでは、ルートエンティティの単位で、データの書き込み/読み出しのトランザクション処理を実行する。

ルートエンティティを定義づける時の注意点として、集約の単位が大き過ぎると、一部分のエンティティのみトランザクションの対象とすれば良い処理であるのにも関わらず、ルートエンティティ全体まで対象としなければならなくなる。

そのため、ビジネスロジックとしてのまとまりと、トランザクションとしてのまとまりの両方から、ルートエンティティの単位を定義づけると良い。

> - https://qiita.com/mikesorae/items/ff8192fb9cf106262dbf#%E5%AF%BE%E7%AD%96-1

<br>

## 05. <span style="color: SkyBlue; ">インフラ層</span>

### インフラ層の依存性逆転

#### ▼ DIP (依存性逆転の原則) とは

> - https://hiroki-it.github.io/tech-notebook/language/language_php_class_based.html

### リポジトリ

![Repository](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Repository.png)

#### ▼ リポジトリパターンとは

デザインパターンの一種。

一例として、以下のメソッドを持つ。

具体的な実装については、インターフェースリポジトリの実装を参考にせよ。

`CREATE`処理と`UPDATE`処理をSAVE処理としてまとめても良い。

| メソッド名        | 引数型                               | 返却値型                   | 処理内容                                                                                                                                                                                                                                                                                                  |
| ----------------- | ------------------------------------ | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| findById          | Id型                                 | ドメインモデル型           | ルートエンティティののドメインモデルを取得する。                                                                                                                                                                                                                                                          |
| findAll           | なし                                 | ドメインモデル型を持つ配列 | 全てのドメインモデルを取得する。                                                                                                                                                                                                                                                                          |
| findAllByCriteria | Criteria型                           | ドメインモデル型を持つ配列 | 条件に合致した全てのドメインモデルを取得する。                                                                                                                                                                                                                                                            |
| create            | ルートエンティティのドメインモデル型 | void型                     | ルートエンティティのドメインモデルを作成する。                                                                                                                                                                                                                                                            |
| update            | ルートエンティティのドメインモデル型 | void型                     | ルートエンティティのドメインモデルを更新する。                                                                                                                                                                                                                                                            |
| save (upsert)     | ルートエンティティのドメインモデル型 | void型                     | ルートエンティティのドメインモデルを作成/更新する。SELECT文のIN句を使用して、同じ識別子のエンティティをDBから取得できるか否かを確認する。取得できない場合は、更新処理を実行する。<br>・https://github.com/little-hands/ddd-q-and-a/issues/241<br>・https://github.com/little-hands/ddd-q-and-a/issues/129 |
| delete            | Id型                                 | void型                     | ルートエンティティのドメインモデルを削除する。                                                                                                                                                                                                                                                            |

> - https://codewithshadman.com/repository-pattern-csharp/
> - https://stevenferrer.github.io/posts/generating-the-repository-pattern-in-go/#introduction
> - https://terasolunaorg.github.io/guideline/public_review/ImplementationAtEachLayer/DomainLayer.html#repository-interface-label

#### ▼ 他の類似するデザインパターンとの比較

| デザインパターン | 駆動の種類   | ドメインモデルとテーブルの関連度合い                                                                                                                                                           | 採用パッケージ例                                                   | 適所                                                                                                                | 補足                                                                                                                                    |
| ---------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Active Record    | DB駆動       | ・非常に強い。<br>・手順としてテーブル設計が先にあり、`1`個のドメインモデルが`1`個のテーブルに対応している。<br>・テーブル間のリレーションシップによって、ドメインモデル間の依存関係が決まる。 | ・Eloquent (PHP) <br>・Active Record (Ruby) <br>・Hibernate (Java) | ビジネスロジックが複雑でないアプリケーション<br>- https://www.informit.com/articles/article.aspx?p=1398618&seqNum=3 | DataMapperパターンと同じく、ORMの実装方法の1つである。<br>- https://culttt.com/2014/06/18/whats-difference-active-record-data-mapper/   |
| Data Mapper      | ドメイン駆動 | ・弱い<br>・Entityマネージャを使用して、ドメインモデルをDBに永続化する。                                                                                                                       | Doctrine                                                           | ビジネスロジックが複雑なアプリケーション<br>- https://www.informit.com/articles/article.aspx?p=1398618&seqNum=3     | ActiveRecordパターンと同じく、ORMの実装方法の1つである。<br>- https://culttt.com/2014/06/18/whats-difference-active-record-data-mapper/ |
| Repository       | ドメイン駆動 | ・弱い<br>・手順としてドメインモデルの依存関係の設計が先にあり、テーブル間の関係性は自由である。`1`個のドメインモデルが複数のテーブルを参照しても良い。                                        |                                                                    | ビジネスロジックが複雑なアプリケーション                                                                            | DB、RDMS、NoSQL、なんでもでも良い。                                                                                                     |
| なし             | なし         | 非常に弱い                                                                                                                                                                                     | DBファサード                                                       |                                                                                                                     |                                                                                                                                         |

#### ▼ 実装リポジトリ

リポジトリパターンを使用する。

責務として、DBに対してデータの書き込み/読み出しのトランザクション処理を実行する。

トランザクションはルートエンティティを単位として定義する必要があるため、リポジトリも同じくルートエンティティを単位として定義づけることになる。

そのため、引数の型はルートエンティティのドメインモデル型になる。

リポジトリではルートエンティティを意識して実装する必要がある一方で、DBのどのテーブルにデータが存在しているかを問わない。

これにより、ルートエンティティとDBテーブルを別々に設計できる。

> - https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_rdbms.html

#### ▼ インターフェースリポジトリ

依存性逆転の原則を導入する場合、ドメイン層にインターフェースリポジトリを配置する。

インフラ層の実装リポジトリクラスと対応関係にある。

**＊実装例＊**

```php
<?php

declare(strict_types=1);

namespace App\Domain\Foo\Repositories;

use App\Domain\Foo\Criterion\FooCriteria;
use App\Domain\Foo\Entities\Foo;
use App\Domain\Foo\Ids\FooId;
use App\Domain\Repository;

interface FooRepository extends Repository
{
    /**
     * @param FooId $fooId
     * @return Foo
     */
    public function findById(FooId $fooId): Foo;

    /**
     * @return array
     */
    public function findAll(): array;

    /**
     * @param FooCriteria $criteria
     * @return array
     */
    public function findAllByCriteria(FooCriteria $criteria): array;

    /**
     * @param Foo $foo
     * @return void
     */
    public function create(Foo $foo): void;

    /**
     * @param Foo $foo
     * @return void
     */
    public function update(Foo $foo): void;

    /**
     * @param FooId $fooId
     * @return void
     */
    public function delete(FooId $fooId): void;
}
```

#### ▼ DBに対する書き込み責務 (Create、Update、Delete)

![ドメイン駆動設計_リポジトリ_データ更新](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ドメイン駆動設計_リポジトリ_データ更新.png)

DBに対する書き込み操作を実行する。

`(1)`

: GET/POSTによって、ユースケース層から値を送信する。
`(2)`

: ファクトリによって、送信された値からエンティティや値オブジェクトを作成する。加えて、それらからルートエンティティを作成する。
`(3)`

: リポジトリにルートエンティティを渡す。
`(4)`

: ルートエンティティをレコードとしてDBに挿入する。

> - https://www.doctrine-project.org/projects/doctrine-orm/en/2.8/reference/query-builder.html
> - https://github.com/doctrine/dbal/blob/2.12.x/lib/Doctrine/DBAL/Query/QueryBuilder.php

**＊実装例＊**

`CREATE`処理のため、DoctrineのQueryBuilderクラスの`insert`メソッドを実行する。

```php
<?php

namespace App\Infrastructure\Foo\Repositories;

use App\Domain\Foo\Entities\DogToy;
use Doctrine\DBAL\Query\QueryBuilder;

/**
 * 犬用おもちゃリポジトリ
 */
class DogToyRepository
{
    /**
     * ドメインモデルを作成します。


     */
    public function create(DogToy $dogToy): DogToy
    {
        // クエリビルダー作成
        $query = $this->createQueryBuilder();

        // SQLを定義する。
        $query->insert("dog_toy_table")
            ->values([
                // ルートエンティティの要素をカラム値として設定する。
                // IDは自動増分
                "name"  => $dogToy->getName()->value(),
                "type"  => $dogToy->getType()->value(),
                "price" => $dogToy->getPriceVO()->value(),
                "color" => $dogToy->getColorVO()->value(),
        ]);
    }
}
```

`UPDATE`処理のため、DoctrineのQueryBuilderクラスの`update`メソッドを実行する。

```php
<?php

namespace App\Infrastructure\Foo\Repositories;

use App\Domain\Foo\Entities\DogToy;
use Doctrine\DBAL\Query\QueryBuilder;

/**
 * 犬用おもちゃリポジトリ
 */
class DogToyRepository
{
    /**
     * ドメインモデルを更新します。


     */
    public function update(DogToy $dogToy): DogToy
    {
        // クエリビルダー作成
        $query = $this->createQueryBuilder();

        // SQLを定義する。
        $query->update("dog_toy_table", "dog_toy")
            // ルートエンティティの要素をカラム値として設定する。
            ->set("dog_toy.name", $dogToy->getName()->value())
            ->set("dog_toy.type", $dogToy->getType()->value())
            ->set("dog_toy.price", $dogToy->getPriceVO()->value())
            ->set("dog_toy.color", $dogToy->getColorVO()->value())
            ->where("dog_toy.id", $dogToy->getId()->value();

        return $query->getResult();
    }
}
```

`DELETE`処理 (論理削除) のため、DoctrineのQueryBuilderクラスの`update`メソッドを実行する。

```php
<?php

namespace App\Infrastructure\Foo\Repositories;

use App\Constants\FlagConstant;
use App\Domain\Entities\DogToy;
use Doctrine\DBAL\Query\QueryBuilder;

/**
 * 犬用おもちゃリポジトリ
 */
class DogToyRepository
{
    /**
     * ドメインモデルを削除します。


     */
    public function delete(ToyId $toyId): bool
    {
        // クエリビルダー作成
        $query = $this->createQueryBuilder();

        // SQLを定義する。
        $query->update("dog_toy_table", "dog_toy")
            // 論理削除
            ->set("dog_toy.is_deleted", FlagConstant::IS_ON)
            ->where("dog_toy.id", $dogToy->getId()->value();

        return $query->getResult();
    }
}
```

#### ▼ DBに対する読み出し責務 (Read)

![ドメイン駆動設計_リポジトリ_データ取得](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ドメイン駆動設計_リポジトリ_データ取得.jpg)

DBに対する書き込み操作を実行する。

`(1)`

: ユースケース層から集約がリクエストされる。

`(2)`

: DBからレコードを取得する。

`(3)`

: ファクトリによって、レコードからエンティティや値オブジェクトを作成する。

`(4)`

: リポジトリからルートエンティティを返却し、ユースケース層に渡す。

> - https://www.doctrine-project.org/projects/doctrine-orm/en/2.8/reference/query-builder.html
> - https://github.com/doctrine/dbal/blob/2.12.x/lib/Doctrine/DBAL/Query/QueryBuilder.php

**＊実装例＊**

`READ`処理のため、DoctrineのQueryBuilderクラスの`select`メソッドを実行する。

```php
<?php

namespace App\Infrastructure\Foo\Repositories;

use App\Constants\FlagConstant;
use App\Domain\Foo\Entities\DogToy;
use Doctrine\DBAL\Query\QueryBuilder;

/**
 * 犬用おもちゃリポジトリ
 */
class DogToyRepository
{
     /**
     * ドメインモデルを全て取得します。
     */
    public function findAll(): array
    {
        // クエリビルダー作成
        $query = $this->createQueryBuilder();

        // SQLを設定する。
        $query->select(
            "dog_toy.id    AS dog_toy_id",
            "dog_toy.name  AS dog_toy_name",
            "dog_toy.type  AS dog_toy_type",
            "dog_toy.price AS dog_toy_price",
            "dog_toy.color AS dog_toy_color"
        )
        ->from("dog_toy_table", "dog_toy")
        // 論理削除されていないもののみ
        ->where("dog_toy.is_deleted", FlagConstant::IS_OFF)
        ->getQuery();

        // SQLを実行する。
        $entities = $query->getResult();

        $dogToys = [];
        foreach($entities as $entity){
            // 取得したエンティティをドメインモデルに変換する。
            $dogToys[] = $this->toDogToy($entity);
        }

        return $dogToys;
    }

    /**
     * ドメインモデルに変換します。


     */
    private function toDogToy(array $entity): DogToy
    {
        $dogToy = new DogToy(
            new DogId($entity["dog_toy_id"]),
            new DogName($entity["dog_toy_name"]),
            new DogToyType($entity["dog_toy_type"]),
            new PriceVO($entity["dog_toy_price"],
            new ColorVO($entity["dog_toy_color"]
        );

        return $dogToy;
    }
}
```

<br>

### ファクトリ

#### ▼ ファクトリとは

責務として、新たな集約の作成や、既存の集約の再作成を実行する。

**＊実装例＊**

```php
<?php

namespace App\Infrastructure\Foo\Factories;

use App\Domain\Foo\Entities\DogToy;
use App\Domain\Foo\Entities\DogFood;
use App\Domain\Foo\Entities\DogCombo;

/**
 * 犬用コンボファクトリ
 */
class DogComboFactory
{
    /**
     * 新たな集約を作成します。


     */
    public static function createDogCombo($data): DogItem
    {
        return new DogCombo(
            new DogToy(
                $data["dog_toy_id"],
                $data["dog_toy_name"],
                $data["dog_toy_type"],
                $data["dog_toy_price"],
                $data["dog_toy_color"],
            ),
            new DogFood(
                $data["dog_food_id"],
                $data["dog_food_name"],
                $data["dog_food_type"],
                $data["dog_food_price"],
                $data["dog_food_flavor"],
            )
        );
    }
}
```

<br>

### ルーター

#### ▼ ルーターとは

コントローラーにリクエストをルーティングする。

<br>

### ミドルウェア

#### ▼ ミドルウェアとは

ルーティング後にコントローラーメソッドの前にコールされるBeforeMiddleと、レスポンスの実行時にコールされるAfterMiddlewareがある。

最近のフレームワークでも搭載されている。

![Laravelのミドルウェア](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/LaravelのMiddlewareクラスの仕組み.png)

<br>

### イベントリスナー (イベントハンドラー)

#### ▼ イベントリスナーとは

ドメインイベントが発生した場合、それに紐付く処理を実行する。

フレームワークの機能に依存することになるため、実装の詳細をインフラ層におく。

> - https://stackoverflow.com/questions/67148194/domain-driven-design-ddd-domain-event-handlers-where-to-place-them
> - https://zenn.dev/fuuuuumin65/articles/2c96e8f0b29c01

#### ▼ 命名規則

イベントでリスナーを使い回さずに、各イベントごとにリスナーを作成する。

そのため、名前は『イベント名』+Listener (Handler) となる。

> - https://docs.microsoft.com/ja-jp/dynamicsax-2012/developer/naming-conventions-delegates-and-event-handlers#event-handler-naming-conventions

<br>

### インフラストラクチャサービス

#### ▼ インフラストラクチャサービスとは

インフラ層の中で、汎用的なロジックが切り分けられたもの。

実装リポジトリと同様にして、ドメイン層にストラクチャサービスのインターフェースを設け、依存性逆転の原則を満たせるようにする。

#### ▼ ロギング

#### ▼ ファイル出力

#### ▼ ハッシュ化

パスワードのハッシュ化。

> - https://dev.to/stevensunflash/using-domain-driven-design-ddd-in-golang-3ee5

<br>

### その他

gRPCの`proto`ファイルはインフラ層に配置すると良い。

> - https://stackoverflow.com/a/62703733

<br>

## 06. アーキテクチャにおけるレイヤー別の例外スロー

### スローされた例外の扱い

各レイヤーでは例外をスローするだけに留まり、スローされた例外を対処する責務は、より上位レイヤーに持たせる。

より上位レイヤーでは、そのレイヤーに合った例外に詰め替えて、これをスローする。

最終的には、ユーザーインターフェース層まで持ち上げ、画面上のポップアップで警告文としてこれを表示する。

例外スローの意義については、以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/language/language_php_logic_error_and_error_handling.html

<br>

### インターフェース層

#### ▼ 例外

```php
final class PresentationException extends Exception
{

}
```

<br>

### ユースケース層

#### ▼ 例外

```php
final class InteractorException extends Exception
{

}
```

<br>

### ドメイン層

#### ▼ 例外

```php
final class DomainException extends Exception
{

}
```

<br>

### インフラ層

#### ▼ 例外

```php
final class InfrastructureException extends Exception
{

}
```
