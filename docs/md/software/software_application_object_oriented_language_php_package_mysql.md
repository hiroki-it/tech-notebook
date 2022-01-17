# MySQLパッケージ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## 01. 読み出されたレコードの取得

###  フェッチ

#### ・フェッチとは

読み出したレコードをに一度に全て取得してしまうと、サーバー側のメモリを圧迫してしまう。そこで、少しずつ取得する。

#### ・フェッチのメソッド名に関する注意点

注意点として、```FETCH```関数は、ベンダーによって名前が異なっていることがある。そのため、同じ名前でも同じ分だけレコードを取得するとは限らない。

<br>

## 02. PDO

### 読み出し

#### ・```prepare```メソッド

プリペアードステートメントを用いてSQLを定義する。プリアードステートメントによるSQLインジェクションの防御については、以下のリンク先を参考にせよ。

#### ・```fetch```メソッド

読み出された全てのレコードのうち、最初のレコードの全てのカラムを取得し、一次元の連想配列で返却する。

#### ・```fetchAll```メソッド

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

#### ・```fetchColumn```メソッド

読み出された全てのレコードのうち、最初のレコードの一番左のカラムのみを取得し、混合型で返却する。主に、```COUNT```関数の場合に用いる

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

#### ・```INSERT```

```php
<?php
    
// $_POSTを用いて、送信されたpostメソッドのリクエストを受け取り、属性から各値を取得する。
$staff_name = $_POST["name"];
$staff_pass = $_POST["pass"];


// HTMLとして変数の内容を出力する際、『<』『>』などの特殊文字をエスケープ（無害化）
$staff_name = htmlspecialchars($staff_name, ENT_QUOTES, "UTF-8");
$staff_pass = htmlspecialchars($staff_pass, ENT_QUOTES, "UTF-8");


// データベースと接続（イコールの間にスペースを入れるとエラーになる）
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


// 配列に値を格納（格納する値の順番と、SQLでの引数の順番は、合わせる必要がある）
$data[] = $staff_name;
$data[] = $staff_pass;


// SQLを実行
$stmt->execute($data);


// データベースとの接続を切断
$dbh = null;
```

#### ・```UPDATE```

```sql

```

#### ・```DELETE```

```sql

```

<br>

## 03. Doctrineパッケージ

### Doctrineとは

RDBの読み込み系/書き込み系の操作を行うパッケージ。他の同様パッケージとして、PDOがある。PDOについては、以下のノートを参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/software/software_middleware_database.html

<br>

### SQLの定義

#### ・```createQueryBuilder```メソッド

CRUD処理に必要なSQLを保持し、トランザクションによってSQLを実行する。

参考：https://www.doctrine-project.org/projects/doctrine-dbal/en/2.10/reference/query-builder.html

**＊実装例＊**

```php
<?php
    
// QueryBuilderインスタンスを作成。
$queryBuilder = $this->createQueryBuilder();
```

<br>

### 読み出し

#### ・```select```メソッド

QueryBuilderクラスにおける```select```メソッドに、値を設定する。

**＊実装例＊**

```php
<?php
    
$queryBuilder
    ->select("id", "name")
    ->from("mst_users");
```

<br>

### 書き込み

#### ・```insert```メソッド

QueryBuilderクラスにおける```insert```メソッドに、値を設定する。

**＊実装例＊**

```php
<?php
    
$queryBuilder
    ->insert("mst_users")
```

#### ・```update```メソッド

QueryBuilderクラスにおける```update```メソッドに、値を設定する。

**＊実装例＊**

```php
<?php
    
$queryBuilder
    ->update("mst_users");
```

#### ・```delete```メソッド

QueryBuilderクラスにおける```delete```メソッドに、値を設定する。

**＊実装例＊**

```php
<?php
    
$queryBuilder
    ->delete("mst_users");
```

<br>

### 実行

#### ・ ```getConnection```メソッド、```executeQuery```メソッド、```fetchAll```メソッド

データベースへの接続し、SQLの実行する。データベース接続に関わる```getConnection```メソッドを開始点として、返り値から繰り返しメソッドを取得し、```fetchAll```メソッドで、テーブルのクエリ名をキーとした連想配列が返される。

**＊実装例＊**

```php
<?php
    
// データベースに接続。
$queryBuilder->getConnection()
    // SQLを実行し、レコードを読み出す。
    ->executeQuery($queryBuilder->getSQL(),
          $queryBuilder->getParameters()
    )->fetchAll();
```

<br>

### 読み出し系の操作

#### ・プレースホルダー

プリペアードステートメントのSQL中にパラメータを設定し、値をパラメータに渡した上で、SQLとして発行する方法。処理速度が速い。また、パラメータに誤ってSQLが渡されても、これを実行できなくなるため、SQLインジェクションの対策にもなる。SQLインジェクションについては、以下のリンク先を参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/security/security_cyber_attacks.html

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
        
        // データベースに接続。
        return $queryBuilder->getConnection()
          
          // SQLを実行し、レコードを読み出す。
          ->executeQuery($queryBuilder->getSQL(),
            $queryBuilder->getParameters()
          )->fetchAll();
    }
}
```

#### ・データのキャッシュ

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

#### ・トランザクション、コミット、ロールバック

![コミットメント制御](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/コミットメント制御.jpg)

RDBの処理用語に相当する```beginTransaction```メソッド、```commit```メソッド、```rollBack```メソッドを用いて、RDBを操作する。

参照：https://www.doctrine-project.org/projects/doctrine-dbal/en/2.10/reference/transactions.html

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

<br>

## 04. その他

### マイグレーション

#### ・マイグレーションとは

DBに保存されているデータを保持したまま、テーブルの作成やカラムの変更などを行うための機能のこと。マイグレーションファイルと呼ばれるスクリプトファイルを作成し、テーブルの新規作成やカラムの追加はこのスクリプトファイルに記述していく。

<br>

### 運用手順

1. 誰かが以下のMigrationファイルをプッシュする。

2. Migrationファイルをローカル環境にPull

3. データベース更新バッチを実行し、ローカル環境のデータベーススキーマとレコードを更新

**＊実装例＊**

```php
<?php
    
namespace Migration;

class ItemQuery
{
    // 列名と値を指定してINSERT
    public static function insert()
    {
        return "INSERT INTO item_table VALUES(1, "商品A", 1000, "2019-07-24 07:07:07");";
    }
}
```

<be>
