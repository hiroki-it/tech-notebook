---
titlIe: 【IT技術の知見】ACID＠RDBMS
description: ACID＠RDBMSの知見を記録しています。
---

# ACID＠RDBMS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. ACID

### ACIDとは

トランザクションを実現するため必要な機能を略して『ACID』という。



> ℹ️ 参考：
>
> - http://tooljp.com/jyosho/docs/ACID/ACID.html
> - https://atmarkit.itmedia.co.jp/ait/articles/1801/31/news011.html

<br>

### Atomicity（不可分性）

#### ▼ Atomicityとは

トランザクションに含まれる全ての処理が成功することと、またはいずれかが失敗した場合には何も実行されていない状態に戻ることを保証する性質のこと。

コミットメント制御によって実装される。



<br>

### Consistency（整合性）

#### ▼ Consistencyとは

トランザクションの実行前後であっても、データは常にDBのルールに則っている性質のこと。

カラムの制約によって実装される。



<br>

### Isolation（独立性）

#### ▼ Isolationとは

トランザクションはお互いに独立し、影響を与え合わない性質のこと。

排他制御によって実装される。



<br>

### Durability（永続性）

#### ▼ Durabilityとは

トランザクションの完了後は、たとえ障害があったとしても、データは失われない性質のこと。

障害回復制御によって実装される。



<br>

## 02. DBの処理フロー

### 一連の流れ

> ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

![コミットメント制御](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/コミットメント制御.jpg)

| RDBの書き込み系の操作                    | よくあるメソッド名（例：PDO）                                          | ラッピング                 | 障害からの回復                  |
|:-------------------------------------|:------------------------------------------------------------|-----------------------|------------------------------|
| 更新前ログをジャーナルファイルに書き込む            | ↓                                                           | ↓                     |                              |
| ↓                                    | ↓                                                           | ↓                     |                              |
| トランザクション開始                         | ```beginTransaction```メソッド                                  | ```execute```メソッド開始 |                              |
| ↓                                    | ↓                                                           | ↓                     | ⬆︎                           |
| ・C/U/Dの実行<br>・トランザクション終了         | ・```insert```メソッド<br>・```update```メソッド<br>・```delete```メソッド | ```flush```メソッド       | ⬆︎ ロールバック：```rollBack```メソッド |
| ↓                                    | ↓                                                           | ↓                     | ⬆︎                           |
| コミットの実行。更新後ログをジャーナルファイルに書き込む。 | ```commit```メソッド開始                                        | ↓                     |                              |
| ↓                                    | ↓                                                           | ↓                     | ⬇︎                           |
| ↓                                    | ↓                                                           | ↓                     | ⬇︎ *Roll forward*            |
| ↓                                    | ↓                                                           | ↓                     | ⬇︎                           |
| チェックポイントによる更新後ログのDB反映           | ```commit```メソッド終了                                        | ```execute```メソッド終了 |                              |

<br>

### トランザクション

#### ▼ トランザクションとは

複数のSQLをセットで扱い、まとめてDBに書き込む。



> ℹ️ 参考：https://oss-db.jp/dojo/dojo_01

#### ▼ PDOによるRDBの書き込み系の操作

PDOでは書き込み処理に```exec```メソッド、読み出し処理に```query```メソッドを使用する。



**＊実装例＊**

```php
<?php
try{
    // DBと接続。
    $db = getDb();

    // 例外処理を有効化。
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  
    // トランザクションを開始。
    $db->beginTransaction();
    // いくつかのSQLが実行される。※もし失敗した場合、ERRMODE_EXCEPTIONを実行。
    $db->exec("INSERT INTO movie(title, price) VALUES("ハリポタ", 2000)")
    $db->exec("INSERT INTO movie(title, price) VALUES("シスター", 2000)")
   
    // トランザクション内の一連のステートメントが成功したら、ログファイルにコミット。
    $db->commit();

} catch{
    // 例外が発生したらロールバックし、エラーメッセージを出力。
    $db->rollBack();
    print "失敗しました。：{$e->getMessage()}"
}  
```

#### ▼ DoctrineによるRDBの書き込み系の操作

詳しくは、以下のリンクを参考にせよ。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/language/language_php_framework_symfony_component.html

<br>

### コミット

#### ▼ コミット、二相コミットとは

トランザクションの一連のステートメントを、メモリに書き込む。

また、更新前ログとして、ストレージ上のジャーナルファイルに書き込む。



#### ▼ メモリ書き込み

コミットの結果をメモリ上で管理し、ある程度まとまってからデータベースファイルに書き込む。

これにより、書き込み後にすぐ読み出しが必要な場合、読み出しが速くなる。

![DBMSによるメモリとディスクの使い分け](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/DBMSによるメモリとディスクの使い分け.jpg)


> ℹ️ 参考：https://www.kimullaa.com/posts/201910271500/


#### ▼ WAL：Write ahead log（ログ先行書き込み）

![wal](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/wal.png)

コミットのメモリ書き込みの仕組みの前に、ストレージ上のジャーナルファイルに更新前ログを書き込む。

コミットの途中で障害が発生した場合、メモリに書き込まれたデータは削除されてしまう。

そこで、WALによるジャーナルファイルの更新前ログをバックアップとして使用し、メモリ上に書き込まれたデータを復元できる。

また、データベースファイルに書き込むよりも書き込みサイズが少なく済むため、短時間で終了する。



> ℹ️ 参考：
>
> - https://gihyo.jp/dev/serial/01/db-academy/000202
> - https://www.kimullaa.com/posts/201910271500/

<br>

### チェックポイント

#### ▼ チェックポイントとは

チェックポイントで、ストレージ上のジャーナルファイルの更新後ログをストレージ上のデータベースファイルに反映させる。

この時、チェックポイントは、自動実行または手動実行で作成する。



> ℹ️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/1703/01/news198.html

![トランザクション](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/トランザクション.jpg)

<br>

### ロールバック

#### ▼ ロールバックとは

障害によって、トランザクション内の一連のステートメントがすべて実行されなかった場合、ストレージ上のジャーナルファイルの更新前ログを使用して、トランザクションの開始前の状態に戻す。



> ℹ️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/1703/01/news198.html

#### ▼ システム障害からの回復

**＊例＊**

『```b```』の値を更新するステートメントを含むトランザクションの途中に、ソフトウェアが異常終了した場合、ジャーナルファイルの更新前ログ『```b = 1```』を使用して、障害発生前の状態に戻す。



![障害回復機能](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/システム障害の障害回復機能.jpg)

<br>

### ロールフォワード

#### ▼ ロールフォワードとは

障害によって、トランザクションの終了後に一連のステートメントの更新結果がストレージに反映されなかった場合、ストレージ上のジャーナルファイルの更新後ログを使用して、ストレージ上のデータベースファイルに更新結果を反映させる。



> ℹ️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/1703/01/news198.html

#### ▼ システム障害からの回復

**＊例＊**

『```a```』の値を更新するステートメントを含むトランザクションの後に、ソフトウェアが異常終了した場合、ジャーナルファイルの更新後ログ『```a = 5```』を使用して、ストレージ上のデータベースファイルに更新結果を反映させる。



![障害回復機能](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/システム障害の障害回復機能.jpg)

#### ▼ 媒体障害からの回復

**＊例＊**

ストレージを初期化/交換した後、バックアップファイルからDBを修復する。

ストレージ上のジャーナルファイルの更新後ログ『```a = 5```』『```b = 1```』を使用して、修復できる限りロールフォワードを行う。



> ℹ️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/1703/01/news198.html

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

## 03. 排他制御

### UPDATE処理競合問題

#### ▼ UPDATE処理競合問題とは

アプリケーションのレコードのUPDATE処理が、レコードの取得と更新からなるとする。

ソフトウェアのユーザAとBがおり、ユーザBがUPDATE処理時に取得しなければならないレコードの状態は、ユーザAがUPDATE処理を終えた後のものである。

しかし、ユーザAがレコードを取得してから更新を終えるまでの間に、ユーザBが同じくレコードを取得してしまうことがある。

結果として、ユーザBのUPDATE処理によって、ユーザAの処理が上書きされ、無かったことになってしまう。



> ℹ️ 参考：https://qiita.com/NagaokaKenichi/items/73040df85b7bd4e9ecfc

![排他制御-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/排他制御-1.png)

ユーザAとユーザBのUPDATE処理が並行したとしても、ユーザAの処理が無かったことにならないよう保証する方法として、『排他制御』がある。



![排他制御-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/排他制御-2.png)

<br>

### 排他制御

#### ▼ 排他制御の種類


| ロック名            | 説明                     |
|-----------------|------------------------|
| 共有/占有ロック     | DBによるロック機能。            |
| 楽観的/悲観的ロック | アプリケーションまたはDBによるロック機能。 |

> ℹ️ 参考：https://qiita.com/momotaro98/items/5e37eefc62d726a30aee

#### ▼ UPDATE処理競合問題の許容

UPDATE処理競合問題を許容し、排他制御を使用しない選択肢もある。



<br>

### 共有/占有ロック

![排他制御-3](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/排他制御-3.gif)

#### ▼ 共有ロック

DBで、CRUDのREAD処理以外の処理を実行できなくする。

レコードのREAD処理を実行する時に、他者によってUPDATE処理されたくない場合に使用する。

『共有』の名の通り、共有ロックされているレコードに対して、他の人も共有ロックを行える。

MySQLでは、『```SELECT ... LOCK IN SHARE MODE```』を使用する。



> ℹ️ 参考：https://dev.mysql.com/doc/refman/5.7/en/innodb-locking-reads.html

#### ▼ 占有ロック

DBで、CRUDの全ての処理を実行できなくする。

レコードのUPDATE処理を実行する時に、他者によってUPDATE/READ処理の両方を実行させない場合に使用する。

MySQLでは、『```SELECT ... FOR UPDATE```』を使用する。



> ℹ️ 参考：https://dev.mysql.com/doc/refman/5.7/en/innodb-locking-reads.html

#### ▼ デッドロック現象

複数のトランザクションが、互いに他者が使いたいレコードをロックしてしまい、お互いのロック解除を待ち続ける状態のこと。

もう一方のレコードのロックが解除されないと、自身のレコードのロックを解除できない時、トランザクションが停止する。



|                    | 共有ロックの実行 | 占有ロックの実行 |
|:------------------:|:------------:|:------------:|
| **共有ロックされたレコード** |      〇       |      ✕       |
| **占有ロックされたレコード** |      ✕       |      ✕       |

![Null](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/デッドロック.gif)

<br>

### 楽観的/悲観的ロック

#### ▼ 楽観的ロック

DBのレコードにはバージョンに関するカラム値（最終更新日時など）が存在しているとする。

UPDATE処理のためにユーザAがDBのレコードを取得した時に、バージョン値を一時的に保持しておく。

続けて更新する直前に、DBからバージョンの値を改めて取得する。

保持しておいたバージョン値とDBの値を比較し、DBの値の方がより新バージョンだった場合、UPDATE処理を失敗させることにより、複数の更新処理の競合を防ぐ。

競合によるエラーを表す```409```ステータスをレスポンスとして返信すると良い。



> ℹ️ 参考：
>
> - https://e-words.jp/w/%E6%A5%BD%E8%A6%B3%E3%83%AD%E3%83%83%E3%82%AF-%E6%82%B2%E8%A6%B3%E3%83%AD%E3%83%83%E3%82%AF.html
> - https://medium-company.com/%E6%82%B2%E8%A6%B3%E3%83%AD%E3%83%83%E3%82%AF%E3%81%A8%E6%A5%BD%E8%A6%B3%E3%83%AD%E3%83%83%E3%82%AF%E3%81%AE%E9%81%95%E3%81%84/

#### ▼ 悲観的ロック

ユーザAがDBのレコードを取得した時点でロックを起動し、ユーザBはレコードの取得すらできなくする。

ユーザAが更新を終えてロックが解除され、そこで初めてユーザBはレコードを取得できるようになる。

アプリケーションで悲観的ロックを実装することは難易度が高く、基本的にはDBが提供するロックを使用する。



> ℹ️ 参考：
>
> - https://e-words.jp/w/%E6%A5%BD%E8%A6%B3%E3%83%AD%E3%83%83%E3%82%AF-%E6%82%B2%E8%A6%B3%E3%83%AD%E3%83%83%E3%82%AF.html
> - https://medium-company.com/%E6%82%B2%E8%A6%B3%E3%83%AD%E3%83%83%E3%82%AF%E3%81%A8%E6%A5%BD%E8%A6%B3%E3%83%AD%E3%83%83%E3%82%AF%E3%81%AE%E9%81%95%E3%81%84/

#### ▼ ORMの楽観的ロックについて

ORMが楽観的ロックの能力を持っている場合がある。

PHPのORMであるDoctrineのロック機能については、以下のリンクを参考にせよ。



> ℹ️ 参考：
>
> - https://www.doctrine-project.org/projects/doctrine-orm/en/2.9/reference/transactions-and-concurrency.html#locking-support
> - https://qiita.com/tatsurou313/items/053cffdfe940a89d7f5a#or-%E3%83%9E%E3%83%83%E3%83%91%E3%83%BC%E3%81%AB%E3%81%8A%E3%81%91%E3%82%8B%E6%A5%BD%E8%A6%B3%E7%9A%84%E3%83%AD%E3%83%83%E3%82%AF%E3%81%AE%E5%AE%9F%E8%A3%85%E6%9C%89%E7%84%A1

<br>

### ロックの粒度

![ロックの粒度](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ロックの粒度-1.png)

DB ＞ テーブル ＞ レコード ＞ カラム の順に、粒度は大きい。

ロックの粒度が細かければ、トランザクションの同時実行性が高くなって効率は向上する（複数の人がDBに対して作業できる）。

しかし、ロックの粒度を細かくすればするほど、それだけベース管理システムのCPU負荷は大きくなる。



![ロックの粒度-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ロックの粒度-2.jpg)

<br>

## 04. リカバリー

### PITR：ポイントインタイムリカバリー

#### ▼ ポイントインタイムリカバリーとは

![db_point-in-time-recovery](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/db_point-in-time-recovery.png)

特定の時点のベースバックアップ（例：SQLによって異なり、MySQLの場合は```mysqldump```コマンドの出力）、ベースバックアップの時点以降の変更点を含む差分バックアップ（例：SQLによって異なり、MySQLの場合はバイナリーログ）、を使用し、DBを任意の時点の状態に戻す。

トランザクションの前後の状態に戻すロールバック/ロールフォワードとは異なり、DBを任意の時点の状態に戻せる。

補足として、バックアップに含まれない期間の状態には戻せない。



> ℹ️ 参考：
>
> - https://stackoverflow.com/questions/40615565/test-performance-rollback-vs-restoring-point
> - https://dev.mysql.com/doc/refman/8.0/en/point-in-time-recovery.html
> - https://www.techscore.com/blog/2014/12/22/mysql%E3%81%A8posqgresql%E3%81%AEpitr%E3%81%AB%E3%82%88%E3%82%8B%E3%83%90%E3%83%83%E3%82%AF%E3%82%A2%E3%83%83%E3%83%97%EF%BC%86%E3%83%AA%E3%82%AB%E3%83%90%E3%83%AA%E3%81%AE%E9%81%95%E3%81%84%EF%BC%88/

#### ▼ ツール

ポイントインタイムリカバリーの時、開発者がベースバックアップ作成、リカバリー、古い差分バックアップの削除、などの作業を行っても良いが、煩雑な手順になるため、自動化ツールを使用した方が良い。

SQLの種類に合わせてツールが用意されている。



| SQLの種類   | ポイントインタイムリカバリーのツール例 | 補足                                                                 |
|------------|----------------------|--------------------------------------------------------------------|
| MySQL      | XtraBackup           | ℹ️ 参考：https://developers.cyberagent.co.jp/blog/archives/28454/     |
| PostgreSQL | Barman               | ℹ️ 参考：https://www.sraoss.co.jp/tech-blog/pgsql/barman/             |
| MariaDB    | Xpand                | ℹ️ 参考：https://mariadb.com/docs/data-operations/backups/xpand/pitr/ |

```bash
# 例えば、一週間分の保管期間を設定した場合
$ barman list-backup <バックアップ名>

<バックアップ名> 20230118T012202 - Wed Jan 18 03:35:34 2023 - Size: 10.0 GiB - WAL Size: 0 B
<バックアップ名> 20230117T012201 - Tue Jan 17 03:30:45 2023 - Size: 10.0 GiB - WAL Size: 10.0 MiB
<バックアップ名> 20230116T012202 - Mon Jan 16 03:27:16 2023 - Size: 10.0 GiB - WAL Size: 10.0 MiB
<バックアップ名> 20230115T012201 - Sun Jan 15 03:34:05 2023 - Size: 10.0 GiB - WAL Size: 10.0 MiB
<バックアップ名> 20230114T012202 - Sat Jan 14 03:31:13 2023 - Size: 10.0 GiB - WAL Size: 10.0 MiB
<バックアップ名> 20230113T012201 - Fri Jan 13 03:27:51 2023 - Size: 10.0 GiB - WAL Size: 10.0 MiB
<バックアップ名> 20230112T012202 - Thu Jan 12 03:35:14 2023 - Size: 10.0 GiB - WAL Size: 10.0 MiB
<バックアップ名> 20230111T012202 - Wed Jan 11 03:32:00 2023 - Size: 10.0 GiB - WAL Size: 10.0 MiB
```

<br>
