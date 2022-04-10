---
title: 【知見を記録するサイト】RDBMS＠ミドルウェア
description: RDBMS＠ミドルウェアの知見をまとめました．
---

# RDBMS＠ミドルウェア

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. RDBMS（関係DB管理システム）の仕組み

### 構造

RDBMSは，DBエンジン，ストレージエンジン，から構成される．

![DB管理システムの仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/DB管理システムの仕組み.png)

<br>

### RDBMSの種類

![DBMS](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/DBMS.jpg)

#### ▼ MariaDB

  MariaDBDBを管理できるRDBMS

#### ▼ MySQL

  MySQLDBを管理できるRDBMS

#### ▼ PostgreSQL

  PostgreSQLDBを管理できるRDBMS

<br>

### DBエンジン

#### ▼ DBエンジンとは

RDBMSがDBに対してデータのCRUDの処理を行うために必要なソフトウェアのこと．

<br>

### ストレージエンジン

<br>

### RDB

#### ▼ RDBとは

データ同士がテーブル状に関係を持つデータ格納形式で構成されるのこと．NoSQLとは異なり，データはストレージに保存する．

<br>

## 01-02. NoSQL（非関係DB）とは

### NoSQLとは

NoSQLは，データ同士が関係を持たないデータ格納形式である．RDBとは異なり，データをメインメモリに保存する．

### NoSQLの種類

![NoSQLの分類](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/NoSQLの種類.jpg)

<br>

## 01-04. テーブル設計

### ER図：Entity Relation Diagram

以下のリンクを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_architecture_analysis_and_design.html

<br>

### 正規化

#### ▼ 正規化とは

繰り返し要素のある表を『正規形』，その逆を『非正規形』という．非正規形の表から，他と連動するカラムを独立させ，正規形の表に変更することを『正規化』という．

#### ▼ 方法

**＊例＊**

まず，主キーが受注Noと商品IDの2つであることを確認．これらの主キーは，複合主キーではないとする．

1. **エクセルで表を作成**

   エクセルで作られた以下の表があると仮定．

![非正規形](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/非正規形.png)

2. **第一正規化（繰り返し要素の排除）**

   レコードを1つずつに分割．

   ![第一正規形](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/第一正規形.png)

3. **第二正規化（主キーの関数従属性を排除）**

   主キーと特定のカラムが連動する（関数従属性がある）場合，カラムを左表として独立させる．今回，主キーが2つあるので，まず受注Noから関数従属性を排除していく．受注Noと他3カラムが連動しており，左表として独立させる．主キーと連動していたカラムを除いたものを右表とする．また，主キーが重複するローを削除する．

   ![第二正規形-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/第二正規形-1.png)

   次に，商品IDの関数従属性を排除していく．商品IDと他2カラムに関数従属性があり，左表として独立させる．主キーと連動していたカラムを除いたものを右表とする．また，主キーが重複するローを削除する．これで，主キーの関数従属性の排除は終了．

   ![第二正規形-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/第二正規形-2.png)

   ![第二正規形-3](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/第二正規形-3.png)

4. **第三正規化（主キー以外のカラムの関数従属性を排除）**

   次に主キー以外のカラムの関係従属性を排除していく．上記で独立させた3つの表のうち，一番左の表で，顧客IDと顧客名に関数従属性があるので，顧客IDを新しい主キーに設定し，左表として独立させる．主キーと連動していたカラムを除いたものを右表とする．

![第三正規形](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/第三正規形-1.png)

![第三正規形-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/第三正規形-2.png)

5. **まとめ**

   主キーの関係従属性の排除によって，受注表，商品表，数量表に分割できた．また，主キー以外の関係従属性の排除によって，顧客IDを新しい主キーとした顧客表に分割できた．

![正規化後にどんな表ができるのか](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/正規化後にどんな表ができるのか.png)

**＊例＊**

1. **エクセルで表を作成**

   以下のような表の場合，行を分割し，異なる表と見なす．

![非正規形-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/非正規形-2.png)

2. **第一正規化（繰り返し要素の排除）**

   ![第一正規形-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/第一正規形-2.png)

<br>

### データの追加/削除

データを追加するあるいは削除する場合，カラムではなく，レコードの増減を行う．カラムの増減の処理には時間がかかる．一方で，レコードの増減の処理には時間がかからない．

![カラムの増減は✖，レコードの増減は〇](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/カラムの増減は✖，レコードの増減は〇-1.png)

**＊例＊**

賞与を年1回から，2回・3回と変える場合，主キーを繰り返し，新しく賞与区分と金額区分を作る．

![カラムの増減は✖，レコードの増減は〇-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/カラムの増減は✖，レコードの増減は〇-2.png)

<br>

### テーブル命名規則

#### ▼ テーブル名は複数形

例えば，```foos```とする．

<br>

### カラム命名規則

#### ▼ 接頭辞は単数形テーブル名

例えば，```foo_id```，```foo_name```，```foo_type```とする．ただし，子テーブルの外部キーと紐付くカラムがある場合，そのカラムの接頭辞は，子テーブル名の単数形とする．例えば，```bar_id```とする．例外として，ActiveRecordパターンのフレームワーク（Laravelなど）では用いない方がよいかもしれない．これらのフレームワークでは，単数形テーブル名の接頭辞がないカラム名を想定して機能が備わっていることがある．この場合，DBとの連携で毎回カラム名を明示する必要があったり，デフォルトではないカラム名を用いることによる不具合が発生したり，不便なことが多かったりするため，おすすめしない．

| foo_id | bar_id | foo_name | foo_type |
| ------ | ------ | -------- | -------- |
| 1      | 1      | foo      | 2        |

<br>

## 02. ACID

### ACIDとは

トランザクションを実現するため必要な機能を略して『ACID』という．

参考：

- http://tooljp.com/jyosho/docs/ACID/ACID.html
- https://atmarkit.itmedia.co.jp/ait/articles/1801/31/news011.html

<br>

### Atomicity（不可分性）

#### ▼ Atomicityとは

トランザクションに含まれる全ての処理が成功することと，またはいずれかが失敗した場合には何も実行されていない状態に戻ることを保証する性質のこと．コミットメント制御によって実装される．

<br>

### Consistency（整合性）

#### ▼ Consistencyとは

トランザクションの実行前後であっても，データは常にDBのルールに則っている性質のこと．カラムの制約によって実装される．

<br>

### Isolation（独立性）

#### ▼ Isolationとは

トランザクションはお互いに独立し，影響を与え合わない性質のこと．排他制御によって実装される．

<br>

### Durability（永続性）

#### ▼ Durabilityとは

トランザクションの完了後は，たとえ障害があったとしても，データは失われない性質のこと．障害回復制御によって実装される．

<br>

## 02-02. コミットメント制御

### RDBの書き込み系の操作

#### ▼ CREATE/UPDATE/DELETE処理の流れ

![コミットメント制御](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/コミットメント制御.jpg)

#### ▼ RDBの操作と実際のメソッドの対応関係

| RDBの書き込み系の操作             | よくあるメソッド名（例：PDO）                                            | ラッピング               | 障害からの回復                           |
|:-------------------------|:------------------------------------------------------------|---------------------|-----------------------------------|
| 更新前ログの記録                 | ↓                                                           | ↓                   |                                   |
| ↓                        | ↓                                                           | ↓                   |                                   |
| トランザクション開始               | ```beginTransaction```メソッド                                  | ```execute```メソッド開始 |                                   |
| ↓                        | ↓                                                           | ↓                   | ⬆︎                                |
| ・C/U/Dの実行<br>・トランザクション終了 | ・```insert```メソッド<br>・```update```メソッド<br>・```delete```メソッド | ```flush```メソッド     | ⬆︎ *Roll back*：```rollBack```メソッド |
| ↓                        | ↓                                                           | ↓                   | ⬆︎                                |
| Commitによる更新後ログの書き込み．     | ```commit```メソッド開始                                          | ↓                   |                                   |
| ↓                        | ↓                                                           | ↓                   | ⬇︎                                |
| ↓                        | ↓                                                           | ↓                   | ⬇︎ *Roll forward*                 |
| ↓                        | ↓                                                           | ↓                   | ⬇︎                                |
| Check Pointによる更新後ログのDB反映 | ```commit```メソッド終了                                          | ```execute```メソッド終了 |                                   |

#### ▼ PDOによるRDBの書き込み系の操作

PDOでは書き込み処理に```exec```メソッド，読み出し処理に```query```メソッドを用いる．

**＊実装例＊**

```php
<?php
try{
    // DBと接続．
    $db = getDb();

    // 例外処理を有効化．
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  
    // トランザクションを開始．
    $db->beginTransaction();
    // いくつかのSQLが実行される．※もし失敗した場合，ERRMODE_EXCEPTIONを実行．
    $db->exec("INSERT INTO movie(title, price) VALUES("ハリポタ", 2000)")
    $db->exec("INSERT INTO movie(title, price) VALUES("シスター", 2000)")
   
    // トランザクション内の一連のステートメントが成功したら，ログファイルにコミット．
    $db->commit();

} catch{
    // 例外が発生したらロールバックし，エラーメッセージを出力．
    $db->rollBack();
    print "失敗しました．：{$e->getMessage()}"
}  
```

#### ▼ DoctrineによるRDBの書き込み系の操作

詳しくは，以下のリンクを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_language_php_framework_symfony_component.html

<br>

### コミットによるログファイルへの更新前ログへの書き込み

#### ▼ コミット

トランザクション内の一連のステートメントを，ログファイルの更新前ログとして書き込む．

#### ▼ 二相コミット

コミットを以下の二つの段階に分けて行うこと．ACIDのうち，原子性と一貫性を実装している．

1. 他のサイトに更新可能かどうかを確認．
2. 全サイトからの合意が得られた場合に更新を確定．

<br>

### チェックポイントにおけるデータファイルへの書き込み

トランザクションの終了後，DBMSは，処理速度を高めるために，ログファイルの更新後ログをいったんメモリ上で管理する．

![DBMSによるメモリとディスクの使い分け](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/DBMSによるメモリとディスクの使い分け.jpg)

そして，チェックポイントで，ログファイルの更新後ログをディスク上のデータファイルに反映させる．この時，チェックポイントは，自動実行または手動実行で作成する．

![トランザクション](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/トランザクション.jpg)

<br>

## 02-03. 障害回復制御

### 障害からの回復

DBサーバーの障害のこと．例えば，DBMSやOSのトラブル等によりシステム全体が停止する．

![障害回復機能](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/システム障害の障害回復機能.jpg)

#### ▼ ロールバック

障害によって，トランザクション内の一連のステートメントがすべて実行されなかった場合，ログファイルの更新前ログを用いて，トランザクションの開始前の状態に戻す．

#### ▼ ロールフォワード

障害によって，トランザクションの終了後に一連のステートメントの更新結果がディスクに反映されなかった場合，ログファイルの更新後ログを用いて，ディスク上のデータファイルに更新結果を反映させる．

**＊例＊**

『a』の値を更新するステートメントを含むトランザクションの後に，ソフトウェアが異常終了した場合，ログファイルの更新後ログ『a = 5』を用いて，ディスク上のデータファイルに更新結果を反映させる．（ロールフォワード）

『b』の値を更新するステートメントを含むトランザクションの途中に，ソフトウェアが異常終了した場合，ログファイルの更新前ログ『b = 1』を用いて，障害発生前の状態に戻す．（ロールバック）

<br>

### 媒体障害からの回復

DBサーバーのハードウェア障害のこと．例えば，ハードディスクの障害がある．ディスクを初期化/交換した後，バックアップファイルからDBを修復し，ログファイルの更新後ログ『a = 5』『b = 1』を用いて，修復できる限りロールフォワードを行う．

![媒体障害の障害回復機能](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/媒体障害の障害回復機能.jpg)

**＊例＊**

バックアップファイルの実際のコード

```sql
-- --------------------------------------------------------
-- Host:                         example.com
-- Server version:               10.1.38-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             10.2.0.5611
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE="NO_AUTO_VALUE_ON_ZERO" */;

# DB作成
-- Dumping database structure for kizukeba_pronami_php
CREATE DATABASE IF NOT EXISTS `kizukeba_pronami_php` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci */;
USE `kizukeba_pronami_php`;

# テーブルのデータ型を指定
-- Dumping structure for table kizukeba_pronami_php.mst_staff
CREATE TABLE IF NOT EXISTS `mst_staff` (
  `code` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(15) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# レコードを作成
-- Dumping data for table kizukeba_pronami_php.mst_staff: ~8 rows (approximately)
/*!40000 ALTER TABLE `mst_staff` DISABLE KEYS */;
INSERT INTO `mst_staff` (`code`, `name`, `password`) VALUES
    (1, "秦基博", "*****"),
    (2, "藤原基央", "*****");
/*!40000 ALTER TABLE `mst_staff` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, "") */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;

```

<br>

## 02-04. 排他制御

### UPDATE処理競合問題

#### ▼ UPDATE処理競合問題とは

アプリケーションのレコードのUPDATE処理が，レコードの取得と更新からなるとする．ソフトウェアのユーザAとBがおり，ユーザBがUPDATE処理時に取得しなければならないレコードの状態は，ユーザAがUPDATE処理を終えた後のものである．しかし，ユーザAがレコードを取得してから更新を終えるまでの間に，ユーザBが同じくレコードを取得してしまうことがある．結果として，ユーザBのUPDATE処理によって，ユーザAの処理が上書きされ，無かったことになってしまう．

参考：https://qiita.com/NagaokaKenichi/items/73040df85b7bd4e9ecfc

![排他制御-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/排他制御-1.png)

ユーザAとユーザBのUPDATE処理が並行したとしても，ユーザAの処理が無かったことにならないよう保証する方法として，『排他制御』がある．

![排他制御-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/排他制御-2.png)

<br>

### 排他制御

#### ▼ 種類

参考：https://qiita.com/momotaro98/items/5e37eefc62d726a30aee

| ロック名                 | 説明                                       |
| -------------------- | ------------------------------------------ |
| 共有/占有ロック     | DBによるロック機能．                       |
| 楽観的/悲観的ロック | アプリケーションまたはDBによるロック機能． |

#### ▼ UPDATE処理競合問題の許容

UPDATE処理競合問題を許容し，排他制御を用いない選択肢もある．

<br>

### 共有/占有ロック

![排他制御-3](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/排他制御-3.gif)

#### ▼ 共有ロック

DBで，CRUDのREAD処理以外の処理を実行不可能にする．レコードのREAD処理を実行する時に，他者によってUPDATE処理されたくない場合に用いる．『共有』の名の通り，共有ロックされているレコードに対して，他の人も共有ロックを行える．MySQLでは，『```SELECT ... LOCK IN SHARE MODE```』を用いる．

参考：https://dev.mysql.com/doc/refman/5.7/en/innodb-locking-reads.html

#### ▼ 占有ロック

DBで，CRUDの全ての処理を実行不可能にする．レコードのUPDATE処理を実行する時に，他者によってUPDATE/READ処理の両方を実行させない場合に用いる．MySQLでは，『```SELECT ... FOR UPDATE```』を用いる．

参考：https://dev.mysql.com/doc/refman/5.7/en/innodb-locking-reads.html

#### ▼ デッドロック現象

複数のトランザクションが，互いに他者が使いたいレコードをロックしてしまい，お互いのロック解除を待ち続ける状態のこと．もう一方のレコードのロックが解除されないと，自身のレコードのロックを解除できない時，トランザクションが停止する．

|                            | 共有ロックの実行 | 占有ロックの実行 |
| :------------------------: | :--------------: | :--------------: |
| **共有ロックされたレコード** |        〇        |        ✕         |
| **占有ロックされたレコード** |        ✕         |        ✕         |

![Null](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/デッドロック.gif)

<br>

### 楽観的/悲観的ロック

#### ▼ 楽観的ロック

DBのレコードにはバージョンに関するカラム値（最終更新日時など）が存在しているとする．UPDATE処理のためにユーザAがDBのレコードを取得した時に，バージョン値を一時的に保持しておく．続けて更新する直前に，DBからバージョンの値を改めて取得する．保持しておいたバージョン値とDBの値を比較し，DBの値の方がより新しいバージョンだった場合，UPDATE処理が失敗する．競合によるエラーを表す```409```ステータスをレスポンスとして返信すると良い．

参考：

- https://e-words.jp/w/%E6%A5%BD%E8%A6%B3%E3%83%AD%E3%83%83%E3%82%AF-%E6%82%B2%E8%A6%B3%E3%83%AD%E3%83%83%E3%82%AF.html
- https://medium-company.com/%E6%82%B2%E8%A6%B3%E3%83%AD%E3%83%83%E3%82%AF%E3%81%A8%E6%A5%BD%E8%A6%B3%E3%83%AD%E3%83%83%E3%82%AF%E3%81%AE%E9%81%95%E3%81%84/

#### ▼ 悲観的ロック

ユーザAがDBのレコードを取得した時点でロックを起動し，ユーザBはレコードの取得すらできなくする．ユーザAが更新を終えてロックが解除され，そこで初めてユーザBはレコードを取得できるようになる．アプリケーションで悲観的ロックを実装することは難易度が高く，基本的にはDBが提供するロック機能を用いる．

参考：

- https://e-words.jp/w/%E6%A5%BD%E8%A6%B3%E3%83%AD%E3%83%83%E3%82%AF-%E6%82%B2%E8%A6%B3%E3%83%AD%E3%83%83%E3%82%AF.html
- https://medium-company.com/%E6%82%B2%E8%A6%B3%E3%83%AD%E3%83%83%E3%82%AF%E3%81%A8%E6%A5%BD%E8%A6%B3%E3%83%AD%E3%83%83%E3%82%AF%E3%81%AE%E9%81%95%E3%81%84/

#### ▼ ORMの楽観的ロックについて

ORMが楽観的ロックの機能を持っている場合がある．PHPのORMであるDoctrineのロック機能については，以下のリンクを参考にせよ．

参考：

- https://www.doctrine-project.org/projects/doctrine-orm/en/2.9/reference/transactions-and-concurrency.html#locking-support
- https://qiita.com/tatsurou313/items/053cffdfe940a89d7f5a#or-%E3%83%9E%E3%83%83%E3%83%91%E3%83%BC%E3%81%AB%E3%81%8A%E3%81%91%E3%82%8B%E6%A5%BD%E8%A6%B3%E7%9A%84%E3%83%AD%E3%83%83%E3%82%AF%E3%81%AE%E5%AE%9F%E8%A3%85%E6%9C%89%E7%84%A1

<br>

### ロックの粒度

![ロックの粒度](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ロックの粒度-1.png)

DB ＞ テーブル ＞ レコード ＞ カラム の順に，粒度は大きい．ロックの粒度が細かければ，トランザクションの同時実行性が高くなって効率は向上する（複数の人がDBに対して作業できる）．しかし，ロックの粒度を細かくすればするほど，それだけベース管理システムのCPU負荷は大きくなる．

![ロックの粒度-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ロックの粒度-2.jpg)
