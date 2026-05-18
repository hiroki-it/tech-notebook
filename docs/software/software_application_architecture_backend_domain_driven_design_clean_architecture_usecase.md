---
title: 【IT技術の知見】ユースケース層＠クリーンアーキテクチャ
description: ユースケース層＠クリーンアーキテクチャの知見を記録しています。
---

# ユースケース層＠クリーンアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ユースケース層

### ユースケース層とは

ドメイン層にあるドメインモデルやドメインルールを組み合わせ、ユースケースを実行する。

<br>

### 処理フロー

インターフェース層からユースケース層までの処理の流れを以下に示す。

![clean-architecture_flow](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master//images/clean-architecture_flow.png)

> - http://www.plainionist.net/Implementing-Clean-Architecture-Controller-Presenter/

<br>

## 02. インターラクター

### インターラクターとは

入力/出力の処理時で、責務を以下の様に分類できる。

ユースケースごとに異なるInteractorクラスを定義する方法と、全てのユースケースを責務として持つInteractorクラスを定義する方法がある。

また、Interactorインターフェースを用意して、インターフェース層のコントローラーはこれを経由して、実装Interactorクラスの関数をコールする。

| 入力時/出力時 | 責務                                                                                                                                                           | 補足                                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 入力          | インターフェース層のコントローラーから入力されるリクエストパラメーターを、ソフトウェア上のルール (ユースケース) と照らし合わせてバリデーションを実行する。     | データの値がシステム上あり得ないか否かを検証する。ビジネス上あり得ない値か否かはドメイン層に仕様パターンとして実装する。 |
|               | ドメイン層の関数を組み合わせて、ユーザーの要求に対するソフトウェアの振舞 (ユースケース) を具現化する。                                                         |                                                                                                                          |
|               | インターフェース層のコントローラーから入力されるリクエストパラメーターを、ドメイン層のインターフェースリポジトリに渡せるドメインモデルに変換する。             |                                                                                                                          |
| 出力          | ドメイン層のインターフェースリポジトリから出力されるドメインモデルをレスポンスモデルに変換し、インターフェース層のコントローラーに出力する。                   | バックエンドをAPIとして使用する場合、プレゼンターは不要である。                                                          |
|               | ドメイン層のインターフェースリポジトリから出力されるドメインモデルをレスポンスモデルを経てプレゼンターに変換し、インターフェース層のコントローラーに出力する。 | バックエンドでテンプレートエンジンを使用してHTMLを作成する場合、プレゼンターが必要である。                               |

<br>

### インターラクターの粒度

操作するルートエンティティの単位でインターラクターを実装する。

<br>

### 呼び出せるリポジトリの種類

同じ境界づけられたコンテキストに属しているルートエンティティであれば、ユースケース層がそれぞれのルートエンティティに対応するリポジトリを操作することは許される。

例えば、親子関係にあるルートエンティティの場合（親：Bookルートエンティティ、Reviewルートエンティティ）を考える。

BookルートエンティティとReviewルートエンティティの間でユースケースが異なると仮定する。

Reviewルートエンティティの操作のためにBookルートエンティティが必要な場合、ReviewユースケースがBookリポジトリをコールする必要がある。

BookルートエンティティとReviewルートエンティティは親子関係にあり、同じ境界づけられたコンテキストに属している。

そのため、ReviewユースケースがBookリポジトリをコールしてもよい。

一方で、異なる境界づけられたコンテキストに属しているルートエンティティの場合、ユースケースはそれを操作するリポジトリをコールしてはいけない。

> - https://stackoverflow.com/questions/76036673/can-a-usecase-have-repositories-from-different-domains-as-dependencies-followin
> - https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-domain-driven-design?utm_source=openai#domain-and-application-services

<br>

### ユースケースと関数名

インターラクターでは、ドメイン層を組み合わせてソフトウェアの振舞 (ユースケース) を具現化する。

そのため、関数名はユースケースを適切に表現した自由な英単語を使用する。

`CREATE` 処理と `UPDATE` 処理をSAVE処理としてまとめても良い。

| ユースケース                                   | 関数名                                | 引数型                                                          | 返却値型                                                                                     | 処理内容                                                                                                                                                                                      |
| ---------------------------------------------- | ------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 下書き系 (UI特有のユースケースで、APIでは不要) | `getDraftFoo()` 関数                  | `getDraftFooRequest` オブジェクト                               | `getDraftFooResponse` オブジェクト                                                           | リポジトリの関数は呼び出さず、登録前のデフォルト値を含むドメインオブジェクトを返却する。 デフォルト値はユースケース層で定義しておく。                                                         |
| 閲覧系 (単一)                                  | `getFoo()` 関数                       | `getFooRequest` オブジェクト                                    | `getFooResponse` オブジェクト、 `null`                                                       | リポジトリの `findOne()` 関数をコールし、ドメインオブジェクトを取得する。                                                                                                                     |
| 閲覧系 (複数)                                  | `listFoos()` 関数                     | `listFoosRequest` オブジェクト                                  | 空配列を含む `listFoosResponse` オブジェクト                                                 | リポジトリの `findAll()` 関数をコールし、ドメインオブジェクトを取得する。                                                                                                                     |
| 登録系                                         | `registerFoo()` 関数                  | `registerFooRequest` オブジェクト                               | `registerFooResponse` オブジェクト、 `Exception` オブジェクト                                | リポジトリの `findOne()` 関数をコールし、重複確認を実施する。その結果に応じて、リポジトリの `create()` 関数をコールし、ドメインオブジェクトを新規登録する。                                   |
| 変更系                                         | `changeFoo()` 関数                    | `changeFooRequest` オブジェクト                                 | `changeFooResponse` オブジェクト、`Exception` オブジェクト                                   | リポジトリの `findOne()` 関数し、存在確認を実施する。その結果に応じて、 `update()` 関数をコールし、既存のドメインオブジェクトを更新する。                                                     |
| 登録系かつ変更系                               | `saveFoo()` 関数 (`upsertFoo()` 関数) | `saveFooRequest` オブジェクト (`upsertFooRequest` オブジェクト) | `saveFooResponse` オブジェクト (`upsertFooResponse` オブジェクト) 、`Exception` オブジェクト | リポジトリの `findOne()` 関数をコールし、存在確認を実施する。その結果に応じて、 `create()` 関数または `update()` 関数を実行する。`<br>`https://github.com/little-hands/ddd-q-and-a/issues/241 |
| 削除系                                         | `deleteFoo()` 関数                    | `deleteFooRequest` オブジェクト                                 | `deleteFooResponse` オブジェクト、 `Exception` オブジェクト                                  | リポジトリの `findOne()` 関数を実行し、存在確認を実施する。その結果に応じて、 `delete()` 関数をコールし、既存のドメインオブジェクトを削除する。                                               |

<br>

### トランザクション処理の定義

トランザクション処理はユースケース層で定義すると良い。

例えば、`READ`処理と`UPDATE`処理の両方が必要な更新系ユースケースでは、`READ`処理と`UPDATE`処理の間のタイミングで、ほかのユーザーがデータを更新してしまう可能性がある。

そのため、ユースケース層でトランザクション処理を定義し、定義したトランザクション範囲内でリポジトリを呼び出す。

**＊実装例＊**

```php
<?php

namespace App\Usecase\Foo\Interactors;

use Illuminate\Support\Facades\DB;

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
     * @param RegisterFooRequest $registerFooRequest
     * @return RegisterFooResponse
     */
    public function registerFoo(RegisterFooRequest $registerFooRequest): RegisterFooResponse
    {
        // トランザクション処理を実行
        $foo = DB::transaction(function () use ($registerFooRequest) {

            // 重複チェック (READ処理) を実行
            $duplicateFoo = $this->fooRepository->findById(
                new FooId($registerFooRequest->id)
            );

            if ($duplicateFoo !== null) {
                throw new \Exception("Foo is already exists.");
            }

            // CREATE処理を実行
            return $this->fooRepository->create(
                new Bar($registerFooRequest->bar),
                new Baz($registerFooRequest->baz)
            );
        });

        // 何らかの処理
    }
}
```

```php
<?php

namespace App\Usecase\Foo\Interactors;

use Illuminate\Support\Facades\DB;

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
     * @param RegisterFooRequest $registerFooRequest
     * @return RegisterFooResponse
     */
    public function registerFoo(RegisterFooRequest $registerFooRequest): RegisterFooResponse
    {
        // トランザクション処理を実行
        $foo = DB::transaction(function () use ($registerFooRequest) {

            // 重複チェック (READ処理) を実行
            $duplicateFoo = $this->fooRepository->findById(
                new FooId($registerFooRequest->id)
            );

            if ($duplicateFoo !== null) {
                throw new \Exception("Foo is already exists.");
            }

            // CREATE処理を実行
            return $this->fooRepository->create(
                new Bar($registerFooRequest->bar),
                new Baz($registerFooRequest->baz)
            );
        });

        // 何らかの処理
    }

    /**
     * @param GetFooRequest $getFooRequest
     * @return GetFooResponse
     */
    public function getFoo(GetFooRequest $getFooRequest): GetFooResponse
    {
        // READ処理を実行
        $foo = $this->fooRepository->findById(
            new FooId($getFooRequest->id)
        );

        // 何らかの処理
    }

    /**
     * @param ChangeFooRequest $changeFooRequest
     * @return ChangeFooResponse
     */
    public function changeFoo(ChangeFooRequest $changeFooRequest): ChangeFooResponse
    {
        // トランザクション処理を実行
        $foo = DB::transaction(function () use ($changeFooRequest) {

            // 存在チェック (READ処理) を実行
            $existingFoo = $this->fooRepository->findById(
                new FooId($changeFooRequest->id)
            );

            if ($existingFoo === null) {
                throw new \Exception("Foo is not found.");
            }

            // UPDATE処理を実行
            return $this->fooRepository->update(
                new FooId($changeFooRequest->id),
                new Bar($changeFooRequest->bar),
                new Baz($changeFooRequest->baz)
            );
        });

        // 何らかの処理
    }

    /**
     * @param DeleteFooRequest $deleteFooRequest
     * @return DeleteFooResponse
     */
    public function deleteFoo(DeleteFooRequest $deleteFooRequest): DeleteFooResponse
    {
        // トランザクション処理を実行
        $foo = DB::transaction(function () use ($deleteFooRequest) {

            // 存在チェック (READ処理) を実行
            $existingFoo = $this->fooRepository->findById(
                new FooId($deleteFooRequest->id)
            );

            if ($existingFoo === null) {
                throw new \Exception("Foo is not found.");
            }

            // DELETE処理を実行
            return $this->fooRepository->delete(
                new FooId($deleteFooRequest->id)
            );
        });

        // 何らかの処理
    }
}
```

> - https://tech.yappli.io/entry/ddd_usecase

<br>

## 03. インプットバウンダリ

### インプットバウンダリとは

インターラクターのインターフェースのこと。

上位レイヤーにあるコントローラーは、インターラクターインタフェースに依存する。

**＊実装例＊**

```php
<?php

namespace App\Usecase\Foo\InputBoundaries;

/**
 * Fooインターラクターインターフェース
 */
interface FooInteractorInterface
{
    /**
     * @param RegisterFooRequest $registerFooRequest
     * @return RegisterFooResponse
     */
    public function registerFoo(RegisterFooRequest $registerFooRequest): RegisterFooResponse

    /**
     * @param GetFooRequest $getFooRequest
     * @return GetFooResponse
     */
    public function getFoo(GetFooRequest $getFooRequest): GetFooResponse

    /**
     * @param ChangeFooRequest $changeFooRequest
     * @return ChangeFooResponse
     */
    public function changeFoo(ChangeFooRequest $changeFooRequest): ChangeFooResponse

    /**
     * @param DeleteFooRequest $deleteFooRequest
     * @return DeleteFooResponse
     */
    public function deleteFoo(DeleteFooRequest $deleteFooRequest): DeleteFooResponse
}
```

<br>

## 04. アウトプットバウンダリ

### アウトプットバウンダリとは

上位レイヤーのプレゼンターのインターフェースのこと。

インターラクターは、レスポンスモデルではなく。

アウトプットバウンダリをインターフェース層に出力する。

ただし、アプリケーションをAPIとして使用する場合は、プレゼンターとアウトプットバウンダリが不要になる。そのため、インターラクターはレスポンスモデルを返却する。

<br>

## 05. リクエストモデル (インプットデータ)

### リクエストモデルとは

インターフェース層のコントローラーから入力されるリクエストパラメーターを、ユースケース層に入力するときの入力構造を定義する。

インターラクターの関数ごとにリクエストモデルを用意すると良い。

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

## 06. レスポンスモデル (アウトプットデータ)

### レスポンスモデルとは

ユースケース層のインターラクターから出力されるドメインモデルを、インターフェース層に出力するときの出力構造を定義する。

インターラクターの関数ごとにレスポンスモデルを用意すると良い。

またコントローラーにて、フレームワーク依存のJSONレスポンス関数にレスポンスモデルを渡せるよう、クラス自身の構造を変換する関数を持たせると良い。

もし、クラス自身を渡して問題ないJSONレスポンス関数であれば、これは不要である。

**＊実装例＊**

ユースケース層のindex関数に対応するレスポンスモデル。

JSONレスポンス関数が配列構造を引数に受け付けるため、これに渡せるよう、自身を配列構造に変換する関数を持たせる。

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

ユースケース層のcreate関数に対応するレスポンスモデル。

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

## 07. アプリケーションサービス

### アプリケーションサービスとは

ユースケース層で、他のオブジェクトを対象とした汎用的な振舞ロジックを切り分けたもの。

アプリケーションサービスは、他のオブジェクトにロジックを関数として提供するのみで、自身の状態を変化させる関数は持たせないようにする。

補足として、『サービス』の概念は全てのレイヤーに存在する。

特定の機能を提供するアプリケーションをサービスとみなして連携すれば、マイクロサービスアーキテクチャにもなる。

<br>

### 通知処理

**＊実装例＊**

エンティティへの通知処理をアプリケーションサービスとして切り分ける。

```php
<?php

namespace App\Usecase\Foo\Services\Notify;

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

namespace App\Usecase\Foo\Services;

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
