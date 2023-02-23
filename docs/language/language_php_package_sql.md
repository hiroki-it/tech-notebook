---
title: 【IT技術の知見】SQLパッケージ＠PHP
description: SQLパッケージ＠PHPの知見を記録しています。
---

# SQLパッケージ＠PHP

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. SQLパッケージ

SQLを抽象化するAPIをアプリケーションに提供する。

SQLの種類が異なっていても、共通のロジックでクエリを実行できる。

![php_sql_package](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/php_sql_package.png)

> ↪️ 参考：https://thinkit.co.jp/free/marugoto/1/4/1/

## 02. PDO

### PDOとは

> ↪️ 参考：https://www.javadrive.jp/php/pdo/

<br>

### フェッチ

#### ▼ フェッチとは

読み出したレコードをに一度に全て取得してしまうと、サーバー側のメモリを圧迫してしまう。

そこで、少しずつ取得する。

#### ▼ フェッチのメソッド名に関する注意点

注意点として、`FETCH`関数は、ベンダーによって名前が異なっていることがある。

そのため、同じ名前でも同じ分だけレコードを取得するとは限らない。

<br>

### 読み出し

#### ▼ `prepare`メソッド

プリペアードステートメントを使用してSQLを定義する。

プリアードステートメントによるSQLインジェクションの防御については、以下のリンクを参考にせよ。

#### ▼ `fetch`メソッド

読み出された全てのレコードのうち、最初のレコードの全てのカラムを取得し、一次元の連想配列で返却する。

#### ▼ `fetchAll`メソッド

読み出された全てのレコードの、全てのカラムを取得し、二次元の連想配列で返却する。

**＊実装例＊**

```php
<?php

$sql = "SELECT * FROM doraemon_characters";
$stmt = $dbh->prepare($sql); // プリペアードステートメントを定義。
$stmt->execute(); // 実行。


// 全てのレコードを取得する。
$data = $stmt->fetchAll();

// 出力
print_r($data);

// カラム名と値の連想配列として取得できる。
// Array
// (
//     [0] => Array
//     (
//         [id] => 1
//         [name] => のび太
//         [gender] => man
//         [type] => human
//     )
//     [1] => Array
//     (
//         [id] => 2
//         [name] => ドラえもん
//         [gender] => man
//         [type] => robot
//     )
// )
```

#### ▼ `fetchColumn`メソッド

読み出された全てのレコードのうち、最初のレコードの一番左のカラムのみを取得し、混合型で返却する。

主に、`COUNT`関数の場合に使用する

**＊実装例＊**

```php
<?php

$sql = "SELECT { カラム名 }OUNT(*) FROM doraemon_characters";
$stmt = $dbh->prepare($sql); // プリペアードステートメントを定義。
$stmt->execute(); // 実行。

// レコードを取得する。
$data = $stmt->fetchColumn();

// 出力
print_r($data);

// 10 (件)
```

<br>

### 書き込み

#### ▼ `INSERT`

```php
<?php

// $_POSTを使用して、送信されたpostメソッドのリクエストを受け取り、属性から各値を取得する。
$staff_name = $_POST["name"];
$staff_pass = $_POST["pass"];


// HTMLとして変数の内容を出力する際、『<』『>』などの特殊文字をエスケープ (無害化)
$staff_name = htmlspecialchars($staff_name, ENT_QUOTES, "UTF-8");
$staff_pass = htmlspecialchars($staff_pass, ENT_QUOTES, "UTF-8");


// DBと接続 (イコールの間にスペースを入れるとエラーになる)
$dsn = "mysql:dbname=kizukeba_pronami_php;
host=kizukebapronamiphp
charaset=UTF-8";
$user = "root";
$password = "";
$dbh = new PDO($dsn, $user, $password);
$dbh->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);


// 列名と値を指定してINSERT
$sql="INSERT INTO mst_staff (name,password) VALUES (?,?)";
$stmt = $dbh->prepare($sql);


// 配列に値を格納 (格納する値の順番と、SQLでの引数の順番は、合わせる必要がある)
$data[] = $staff_name;
$data[] = $staff_pass;


// SQLを実行
$stmt->execute($data);


// DBとの接続を切断
$dbh = null;
```

#### ▼ `UPDATE`

```sql

```

#### ▼ `DELETE`

```sql

```

<br>
