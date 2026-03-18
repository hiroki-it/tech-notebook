---
title: 【IT技術の知見】インフラストラクチャ層＠クリーンアーキテクチャ
description: インフラストラクチャ層＠クリーンアーキテクチャの知見を記録しています。
---

# インフラストラクチャ層＠クリーンアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. インフラストラクチャ層

### インフラストラクチャ層の依存性逆転

#### ▼ DIP (依存性逆転の原則) とは

> - https://hiroki-it.github.io/tech-notebook/language/language_php_class_based.html

### リポジトリ

![Repository](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Repository.png)

#### ▼ リポジトリパターンとは

デザインパターンの一種。

一例として、以下の関数を持つ。

具体的な実装については、インターフェースリポジトリの実装を参考にせよ。

`CREATE` 処理と `UPDATE` 処理をSAVE処理としてまとめても良い。

| 関数名            | 引数型                               | 返却値型                   | 処理内容                                                                                                                                                                                                                                                                                                      |
| ----------------- | ------------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| findById          | Id型                                 | ドメインモデル型           | ルートエンティティのドメインモデルを取得する。                                                                                                                                                                                                                                                                |
| findAll           | なし                                 | ドメインモデル型を持つ配列 | 全てのドメインモデルを取得する。                                                                                                                                                                                                                                                                              |
| findAllByCriteria | Criteria型                           | ドメインモデル型を持つ配列 | 条件に合致した全てのドメインモデルを取得する。                                                                                                                                                                                                                                                                |
| create            | ルートエンティティのドメインモデル型 | void型                     | ルートエンティティのドメインモデルを作成する。                                                                                                                                                                                                                                                                |
| update            | ルートエンティティのドメインモデル型 | void型                     | ルートエンティティのドメインモデルを更新する。                                                                                                                                                                                                                                                                |
| save (upsert)     | ルートエンティティのドメインモデル型 | void型                     | ルートエンティティのドメインモデルを作成/更新する。SELECT文のIN句を使用して、同じ識別子のエンティティをDBから読み込めるか否かを確認する。取得できない場合は、更新処理を実行する。`<br>`・https://github.com/little-hands/ddd-q-and-a/issues/241`<br>`・https://github.com/little-hands/ddd-q-and-a/issues/129 |
| delete            | Id型                                 | void型                     | ルートエンティティのドメインモデルを削除する。                                                                                                                                                                                                                                                                |

> - https://codewithshadman.com/repository-pattern-csharp/
> - https://stevenferrer.github.io/posts/generating-the-repository-pattern-in-go/#introduction
> - https://terasolunaorg.github.io/guideline/public_review/ImplementationAtEachLayer/DomainLayer.html#repository-interface-label

#### ▼ 他の類似するデザインパターンとの比較

| デザインパターン | 駆動の種類   | ドメインモデルとテーブルの関連度合い                                                                                                                                                                  | 採用パッケージ例                                                      | 適所                                                                                                                 | 補足                                                                                                                                    |
| ---------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Active Record    | DB駆動       | ・非常に強い。`<br>`・手順としてテーブル設計が先にあり、`1` 個のドメインモデルが `1` 個のテーブルに対応している。`<br>`・テーブル間のリレーションシップによって、ドメインモデル間の依存関係が決まる。 | ・Eloquent (PHP)`<br>`・Active Record (Ruby) `<br>`・Hibernate (Java) | ビジネスロジックが複雑でないアプリケーション `<br>`https://www.informit.com/articles/article.aspx?p=1398618&seqNum=3 | DataMapperパターンと同じく、ORMの実装方法の1つである。`<br>`https://culttt.com/2014/06/18/whats-difference-active-record-data-mapper/   |
| Data Mapper      | ドメイン駆動 | ・弱い `<br>`・Entityマネージャを使用して、ドメインモデルをDBに永続化する。                                                                                                                           | Doctrine                                                              | ビジネスロジックが複雑なアプリケーション `<br>`https://www.informit.com/articles/article.aspx?p=1398618&seqNum=3     | ActiveRecordパターンと同じく、ORMの実装方法の1つである。`<br>`https://culttt.com/2014/06/18/whats-difference-active-record-data-mapper/ |
| Repository       | ドメイン駆動 | ・弱い `<br>`・手順としてドメインモデルの依存関係の設計が先にあり、テーブル間の関係性は自由である。`1` 個のドメインモデルが複数のテーブルを参照しても良い。                                           |                                                                       | ビジネスロジックが複雑なアプリケーション                                                                             | DB、RDBMS、NoSQL、なんでもでも良い。                                                                                                    |
| なし             | なし         | 非常に弱い                                                                                                                                                                                            | DBファサード                                                          |                                                                                                                      |                                                                                                                                         |

#### ▼ 実装リポジトリ

リポジトリパターンを使用する。

責務として、DBに対してデータの書き込み/読み出しのトランザクション処理を実行する。

トランザクションはルートエンティティを単位として定義する必要があるため、リポジトリも同じくルートエンティティを単位として定義づけることになる。

そのため、引数の型はルートエンティティのドメインモデル型になる。

リポジトリではルートエンティティを意識して実装する必要がある一方で、DBのどのテーブルにデータが存在しているかを問わない。

これにより、ルートエンティティとテーブルを別々に設計できる。

> - https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_rdbms.html
> - https://codezine.jp/article/detail/10776

#### ▼ インターフェースリポジトリ

依存性逆転の原則を導入する場合、『ドメイン層』にインターフェースリポジトリを配置する。

インフラストラクチャ層の実装リポジトリクラスと対応関係にある。

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

DBに対する書き込み操作をする。

`(1)`

: GET/POSTによって、ユースケース層から値を送信する。

`(2)`

: ファクトリによって、送信された値からエンティティや値オブジェクトを作成する。加えて、それらからルートエンティティを作成する。

`(3)`

: リポジトリにルートエンティティを渡す。

`(4)`

: ルートエンティティをレコードとしてDBに挿入する。

**＊実装例＊**

`CREATE` 処理のため、DoctrineのQueryBuilderクラスの `insert` 関数を実行する。

```php
<?php

namespace App\インフラストラクチャ層\Foo\Repositories;

use App\Domain\Foo\Entities\DogToy;
use Doctrine\DBAL\Query\QueryBuilder;

/**
 * 犬用おもちゃリポジトリ
 */
class DogToyRepository
{
    /**
     * ドメインモデルを作成する
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

`UPDATE` 処理のため、DoctrineのQueryBuilderクラスの `update` 関数を実行する。

```php
<?php

namespace App\インフラストラクチャ層\Foo\Repositories;

use App\Domain\Foo\Entities\DogToy;
use Doctrine\DBAL\Query\QueryBuilder;

/**
 * 犬用おもちゃリポジトリ
 */
class DogToyRepository
{
    /**
     * ドメインモデルを更新する
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

`DELETE` 処理 (論理削除) のため、DoctrineのQueryBuilderクラスの `update` 関数を実行する。

```php
<?php

namespace App\インフラストラクチャ層\Foo\Repositories;

use App\Constants\FlagConstant;
use App\Domain\Entities\DogToy;
use Doctrine\DBAL\Query\QueryBuilder;

/**
 * 犬用おもちゃリポジトリ
 */
class DogToyRepository
{
    /**
     * ドメインモデルを削除する
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

> - https://www.doctrine-project.org/projects/doctrine-orm/en/2.8/reference/query-builder.html
> - https://github.com/doctrine/dbal/blob/2.12.x/lib/Doctrine/DBAL/Query/QueryBuilder.php

#### ▼ DBに対する読み出し責務 (Read)

![ドメイン駆動設計_リポジトリ_データ取得](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ドメイン駆動設計_リポジトリ_データ取得.jpg)

DBに対する書き込み操作をする。

`(1)`

: ユースケース層から集約がリクエストされる。

`(2)`

: DBからレコードを読み込む。

`(3)`

: ファクトリによって、レコードからエンティティや値オブジェクトを作成する。

`(4)`

: リポジトリからルートエンティティを返却し、ユースケース層に渡す。

**＊実装例＊**

`READ` 処理のため、DoctrineのQueryBuilderクラスの `select` 関数を実行する。

```php
<?php

namespace App\インフラストラクチャ層\Foo\Repositories;

use App\Constants\FlagConstant;
use App\Domain\Foo\Entities\DogToy;
use Doctrine\DBAL\Query\QueryBuilder;

/**
 * 犬用おもちゃリポジトリ
 */
class DogToyRepository
{
     /**
     * ドメインモデルを全て取得する
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
     * ドメインモデルに変換する
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

> - https://www.doctrine-project.org/projects/doctrine-orm/en/2.8/reference/query-builder.html
> - https://github.com/doctrine/dbal/blob/2.12.x/lib/Doctrine/DBAL/Query/QueryBuilder.php

#### ▼ テストリポジトリ

ホワイトボックスのテスト時に、実装リポジトリを静的な値を返信するインメモリなリポジトリに差し替えると、DBを使用せずにホワイトボックステストを実施できる。

ただ、ホワイトボックステスト時には、DBコンテナなどの一時的なDBを使用すれば、実装リポジトリをそのまま使用できる。

<br>

### ファクトリ

#### ▼ ファクトリとは

責務として、新たな集約の作成や、既存の集約の再作成をする。

**＊実装例＊**

```php
<?php

namespace App\インフラストラクチャ層\Foo\Factories;

use App\Domain\Foo\Entities\DogToy;
use App\Domain\Foo\Entities\DogFood;
use App\Domain\Foo\Entities\DogCombo;

/**
 * 犬用コンボファクトリ
 */
class DogComboFactory
{
    /**
     * 新たな集約を作成する
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

### Web API

#### ▼ Web APIとは

コントローラーにリクエストをルーティングする。

<br>

### ミドルウェア

#### ▼ ミドルウェア処理とは

コントローラーの処理前に実行するBeforeMiddlewareと、コントローラーとビューの処理後に実行するAfterMiddlewareがある。

![design-pattern_middleware](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/design-pattern_middleware.png)

> - https://qiita.com/ktanoooo/items/a746a96b12489ae56553

<br>

### キュー操作処理

#### ▼ キュー操作処理とは

メッセージキューを操作する。

#### ▼ Sagaパターンのクライアント

<br>

### イベントリスナー (イベントハンドラー)

#### ▼ イベントリスナーとは

『イベントハンドラー』ともいう。

ドメインイベントが発生した場合、それに紐付く処理を実行する。

フレームワークの機能に依存するため、実装の詳細をインフラストラクチャ層へ置く。

> - https://stackoverflow.com/questions/67148194/domain-driven-design-ddd-domain-event-handlers-where-to-place-them
> - https://zenn.dev/fuuuuumin65/articles/2c96e8f0b29c01

#### ▼ 命名規則

イベントでリスナーを使い回さずに、各イベントごとにリスナーを作成する。

そのため、名前は『イベント名』+ Listener (Handler) となる。

> - https://docs.microsoft.com/ja-jp/dynamicsax-2012/developer/naming-conventions-delegates-and-event-handlers#event-handler-naming-conventions

<br>

### インフラサービス

#### ▼ インフラサービスとは

インフラストラクチャ層の中で、汎用的なロジックが切り分けられたもの。

実装リポジトリと同様にして、ドメイン層にストラクチャサービスのインターフェースを設け、依存性逆転の原則を満たせるようにする。

#### ▼ ロギング

#### ▼ ファイル出力

#### ▼ ハッシュ化

パスワードのハッシュ化。

> - https://dev.to/stevensunflash/using-domain-driven-design-ddd-in-golang-3ee5

<br>

### その他

gRPCの `proto` ファイルはインフラストラクチャ層に配置すると良い。

> - https://stackoverflow.com/a/62703733

<br>
