---
title: 【IT技術の知見】コンポーネント＠Symfony
description: コンポーネント＠Symfonyの知見を記録しています。
---

# Doctrine ORM＠Symfony

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Doctrine ORMとは

Symfonyに組み込まれているORM。

Data Mapperパターンで実装されている。

> - https://www.doctrine-project.org/projects/doctrine-orm/en/2.11/tutorials/getting-started.html

<br>

## 02. DoctrineによるCRUD

### SQLの定義

#### ▼ `createQueryBuilder`メソッド

CRUD処理に必要なSQLを保持し、トランザクションによってSQLを実行する。

**＊実装例＊**

```php
<?php

// QueryBuilderインスタンスを作成。
$queryBuilder = $this->createQueryBuilder();
```

> - https://www.doctrine-project.org/projects/doctrine-dbal/en/2.10/reference/query-builder.html

<br>

### 読み出し

#### ▼ `select`メソッド

QueryBuilderクラスにおける`select`メソッドに、値を設定する。

**＊実装例＊**

```php
<?php

$queryBuilder
    ->select("id", "name")
    ->from("mst_users");
```

<br>

### 書き込み

#### ▼ `insert`メソッド

QueryBuilderクラスにおける`insert`メソッドに、値を設定する。

**＊実装例＊**

```php
<?php

$queryBuilder
    ->insert("mst_users")
```

#### ▼ `update`メソッド

QueryBuilderクラスにおける`update`メソッドに、値を設定する。

**＊実装例＊**

```php
<?php

$queryBuilder
    ->update("mst_users");
```

#### ▼ `delete`メソッド

QueryBuilderクラスにおける`delete`メソッドに、値を設定する。

**＊実装例＊**

```php
<?php

$queryBuilder
    ->delete("mst_users");
```

<br>

### 実行

#### ▼ `getConnection`メソッド、`executeQuery`メソッド、`fetchAll`メソッド

DBへの接続し、SQLの実行する。

DB接続に関わる`getConnection`メソッドを開始点として、返り値から繰り返しメソッドを取得し、`fetchAll`メソッドで、テーブルのクエリ名をキーとした連想配列が返される。

**＊実装例＊**

```php
<?php

// DBに接続。
$queryBuilder->getConnection()
    // SQLを実行し、レコードを読み出す。
    ->executeQuery($queryBuilder->getSQL(),
          $queryBuilder->getParameters()
    )->fetchAll();
```

<br>

### 読み出し系の操作

#### ▼ プレースホルダー

プリペアードステートメントのSQL中にパラメーターを設定し、値をパラメーターに渡した上で、SQLとして発行する。

処理速度が速い。

また、パラメーターに誤ってSQLが渡されても、これを実行できなくなるため、SQLインジェクションの対策にもなる。

SQLインジェクションについては、以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/security/security_cyber_attacks.html

**＊実装例＊**

```php
<?php

use Doctrine\DBAL\Connection;

class DogToyQuery
{
    // READ処理のSQLを定義するメソッド。
    public function read(Value $toyType): Array
    {
        // QueryBuilderインスタンスを作成。
        $queryBuilder = $this->createQueryBuilder();

        // プリペアードステートメントの定義
        $queryBuilder->select([
          "dog_toy.type AS dog_toy_type",
          "dog_toy.name AS dog_toy_name",
          "dog_toy.number AS number",
          "dog_toy.price AS dog_toy_price",
          "dog_toy.color_value AS color_value"
        ])

          // FROMを設定する。
          ->from("mst_dog_toy", "dog_toy")

          // WHEREを設定する。この時、値はプレースホルダーとしておく。
          ->where("dog_toy.type = :type")

          // プレースホルダーに値を設定する。ここでは、引数で渡す『$toyType』とする。
          ->setParameter("type", $toyType);

        // DBに接続。
        return $queryBuilder->getConnection()

          // SQLを実行し、レコードを読み出す。
          ->executeQuery($queryBuilder->getSQL(),
            $queryBuilder->getParameters()
          )->fetchAll();
    }
}
```

#### ▼ データのキャッシュ

読み出し系で取得したデータをキャッシュできる。

```php
<?php

use Doctrine\Common\Cache\FilesystemCache;
use Doctrine\DBAL\Cache\QueryCacheProfile;

class Foo
{
    public function find()
    {

        // QueryBuilderインスタンスを作成。
        $queryBuilder = $this->createQueryBuilder();

        // 何らかのSQLを定義
        $query = $queryBuilder->select()->from()

        // キャッシュがある場合、ArrayStatementオブジェクトを格納
        // キャッシュがない場合、ResultCacheStatementを格納
        $statement = $this->connection->executeQuery(
          $query->getSQL(),
          $query->getParameters(),
          $queryParameterTypes(),
          new QueryCacheProfile()
        );

        $result = $statement->fetchAll();
        $statement->closeCursor();
        return $result;
    }
}
```

<br>

### 書き込み系の操作

#### ▼ トランザクション、コミット、ロールバック

![コミットメント制御](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/コミットメント制御.jpg)

RDBの処理用語に相当する`beginTransaction`メソッド、`commit`メソッド、`rollBack`メソッドを使用して、RDBを操作する。

**＊実装例＊**

```php
<?php

$conn = new Doctrine\DBAL\Connection

// トランザクションの開始
$conn->beginTransaction();
try{
    // コミット
    $conn->commit();
} catch (\Exception $e) {

    // ロールバック
    $conn->rollBack();
    throw $e;
}
```

> - https://www.doctrine-project.org/projects/doctrine-dbal/en/2.10/reference/transactions.html

<br>
