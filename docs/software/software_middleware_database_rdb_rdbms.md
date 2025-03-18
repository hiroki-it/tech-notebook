---
title: 【IT技術の知見】RDBMS＠DB系ミドルウェア
description: RDBMS＠DB系ミドルウェアの知見を記録しています。
---

# RDBMS＠DB系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. RDBMS (関係DB管理システム) の仕組み

### RDBMSの種類

| RDBMS      | RDB            |
| ---------- | -------------- |
| MariaDB    | MariaDBのDB    |
| MySQL      | MySQLのDB      |
| PostgreSQL | PostgreSQLのDB |

<br>

### アーキテクチャ

RDBMSは、リレーショナルエンジン、DBエンジン (ストレージエンジン) 、から構成される。

![DB管理システムの仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/DB管理システムの仕組み.png)

> - https://xtech.nikkei.com/it/article/COLUMN/20060111/227095/
> - https://atmarkit.itmedia.co.jp/ait/articles/1007/26/news087.html

<br>

## 02. RDBMS

### リレーショナルエンジン

記入中...

> - https://qiita.com/ishishow/items/280a9d049b8f7bcbc14a

<br>

### DBエンジン (ストレージエンジン)

#### ▼ DBエンジンとは

『ストレージエンジン』ともいう。

RDBMSがDBに対してデータのCRUDの処理を行うために必要なソフトウェアのこと。

> - https://xtech.nikkei.com/it/article/COLUMN/20060111/227095/
> - https://atmarkit.itmedia.co.jp/ait/articles/1007/26/news087.html
> - https://ja.wikipedia.org/wiki/%E3%83%87%E3%83%BC%E3%82%BF%E3%83%99%E3%83%BC%E3%82%B9%E3%82%A8%E3%83%B3%E3%82%B8%E3%83%B3

#### ▼ DBエンジンの種類

RDMS (例：MySQL、PostgreSQLなど) によって、対応するDBエンジンが異なる。

- InnoDB
- Memory
- CSV

<br>

### RDB (関係DB)

#### ▼ RDBとは

データ同士がテーブル状に関係を持つデータ格納形式で構成されるのこと。

NoSQLとは異なり、データはストレージに保管する。

#### ▼ テーブル

行列からなるデータのセットのこと。

#### ▼ カラム

テーブルの列データのこと。

#### ▼ レコード

テーブルの行データのこと。

<br>

### オンディスクDB

RDBは、ストレージにデータを保存する。

ストレージ (例：HDD、SSD) 上にデータを保管するDBを、メモリ上に保管することと比較して、オンディスクDBという。

> - https://www.kingston.com/en/blog/pc-performance/difference-between-memory-storage
> - https://www.mydistributed.systems/2020/07/an-overview-of-storage-engines.html

<br>

### DBパーティション

#### ▼ DBパーティションとは

DBのテーブルを分割して管理する。

性能の向上のために、DBパーティションを作成する。

分割しても、DBMSクライアントからは単一のテーブルとして扱える。

> - https://xtech.nikkei.com/it/article/COLUMN/20090512/329853/

#### ▼ 水平パーティション (シャーディング)

『シャーディング』ともいう。

テーブルをレコード方向に分割して管理する。

> - https://qiita.com/Hashimoto-Noriaki/items/6a4dd9c5f0e1d2cf5203
> - https://aws.amazon.com/jp/blogs/news/sharding-with-amazon-relational-database-service/

#### ▼ 垂直パーティンション

テーブルをカラム方向に分割して管理する

> - https://aws.amazon.com/jp/what-is/database-sharding/

<br>

### DBインデックス

#### ▼ DBインデックスとは

テーブルから特定のカラムのみを抜き出し、検索しやすいように並び替え、名前を付けて保管しておいたもの。

性能の向上のために、DBインデックを作成する。

DBインデックスとして保管されたカラムから特定のレコードを直接的に取得できる。

そのため、SQLの実行時間がカラム数に依存しなくなる。

DBインデックスを使用しない場合、SQLの実行時に全てカラムを取得するため、実行時間がテーブルのカラム数に依存してしまう。

> - https://qiita.com/towtow/items/4089dad004b7c25985e3

#### ▼ クラスターDBインデックス

プライマリーキーあるいはユニークキーのカラムを基準にして、テーブルのカラムを並び替えたDBインデックスのこと。

```sql
CREATE INDEX foo_index
    ON foo_table (id)
```

#### ▼ セカンダリーDBインデックス

プライマリーキーあるいはユニークキーではないカラムを基準にして、テーブルのカラムを並び替えたDBインデックスのこと。

```sql
CREATE INDEX foo_index
    ON foo_table (foo_column)
```

#### ▼ 複合DBインデックス

複数のカラムを基準にして、テーブルを並び替えたDBインデックスのこと。

対象としたカラムごとに異なる値のレコード数が計測され、この数が少ない (一意の値の多い) カラムが検出される。

そして、カラムのレコードの昇順で並び替えられ、DBインデックスとして保管される。

> - https://qiita.com/towtow/items/4089dad004b7c25985e3

```sql
CREATE INDEX foo_index
    ON foo_table (foo_column, bar_column, ...)
```

**＊例＊**

以下のような`foo`テーブルがあり、`name`カラムと`address`カラムを基準に並び替えた`foo_index`という複合DBインデックス名を作成する。

```sql
CREATE INDEX foo_index
    ON foo_table (name, address)
```

| id  | name      | address | old |
| --- | --------- | ------- | --- |
| 1   | Suzuki    | Tokyo   | 24  |
| 2   | Yamada    | Osaka   | 18  |
| 3   | Takahashi | Nagoya  | 18  |
| 4   | Honda     | Tokyo   | 16  |
| 5   | Endou     | Tokyo   | 24  |

各カラムで値の異なるレコード数が計測され、`name`カラムは`address`カラムよりも一意のレコードが多いため、`name`カラムの昇順 (アルファベット順) に並び替えられ、DBインデックスとして保管される。

| id  | name      | address | old |
| --- | --------- | ------- | --- |
| 5   | Endou     | Tokyo   | 24  |
| 4   | Honda     | Tokyo   | 18  |
| 1   | Suzuki    | Tokyo   | 24  |
| 3   | Takahashi | Nagoya  | 18  |
| 2   | Yamada    | Osaka   | 18  |

<br>

## 04. RDBMSクライアント

### クエリ

#### ▼ クエリとは

RDBMSの種類に応じたクエリが必要になる。

#### ▼ クエリパッケージ

クエリの実装の抽象度に応じて、パッケージがある。

| クエリパッケージ | 説明                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| 生のクエリ       | RDB固有のクエリのこと。                                                                                             |
| クエリビルダー   | RDB固有のクエリを実装しやすくしたパッケージのこと。                                                                 |
| ORM              | アプリケーション側にDBテーブルに対応したモデルを定義し、これを使用してRDBに固有のクエリを送信するパッケージのこと。 |

> - https://levelup.gitconnected.com/raw-sql-vs-query-builder-vs-orm-eee72dbdd275

<br>

### DB接続

#### ▼ DB接続とは

アプリからRDBMSへのクエリ送信時の通信のこと。

TCP/IPプロトコルを使用する。

> - https://en.wikipedia.org/wiki/Database_connection

#### ▼ DBセッション

ログインに成功したDB接続のこと。

セッションを確立できると、クエリを送信できるようになる。

一つのセッション中に一つのトランザクション (複数のクエリからなる)　を実行することになる。

> - https://stackoverflow.com/a/8800971/12771072
> - https://dba.stackexchange.com/a/318063

#### ▼ 接続プロキシ

アプリケーションとDBの間に、接続プールプロキシ (例：ProxySQL、PgBouncerなど) を配置する。

これにより、アプリケーションサーバーの接続プールの処理を接続プロキシに委譲する。

注意点として、プリペアードステートメントでは既存の接続を再利用する必要があるが、接続プロキシでは別の接続を使用してしまうことがある。

そのため、接続プロキシの採用時には、プリペアードステートメントを使用できない。

#### ▼ 接続プール

アプリからDBへのクエリ送信時に新しく作成した接続を、非アクティブ状態として保持しておき、以降のクエリ送信時に再利用する。

一定回数再利用されたり、一定期間使用されていない接続は削除される。

![db_connection-pool](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/db_connection-pool.png)

> - https://support.asteria.com/hc/ja/articles/228983127-%E3%82%B3%E3%83%8D%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3%E3%83%97%E3%83%BC%E3%83%AB%E3%81%A8%E3%81%AF%E4%BD%95%E3%81%A7%E3%81%99%E3%81%8B
> - https://gihyo.jp/dev/serial/01/db-academy/000502

#### ▼ 接続プールに対する待機キュー

もし接続プール上の接続が全て使用されてしまった場合、いずれかの接続が解放されるまで待機する必要がある。

この時に、送信されたリクエストは待機キューで解放を待つ。

> - https://itpfdoc.hitachi.co.jp/manuals/3020/30203m0360/EM030358.HTM

<br>

## 05. 性能指標

### 秒当たりの平均トランザクション数 (TPS：Transaction Per Second)

> - https://ja.theastrologypage.com/transactions-per-second

<br>
