---
title: 【IT技術の知見】RDBMS＠DB系ミドルウェア
description: RDBMS＠DB系ミドルウェアの知見を記録しています。
---

# RDBMS＠DB系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/


<br>

## 01. RDBMS（関係DB管理システム）の仕組み

### RDBMSの種類

| RDBMS      | RDB           |
|------------|---------------|
| MariaDB    | MariaDBのDB    |
| MySQL      | MySQLのDB      |
| PostgreSQL | PostgreSQLのDB |

<br>

### アーキテクチャ

RDBMSは、リレーショナルエンジン、DBエンジン（ストレージエンジン）、から構成される。

> ℹ️ 参考：
> 
> - https://xtech.nikkei.com/it/article/COLUMN/20060111/227095/
> - https://atmarkit.itmedia.co.jp/ait/articles/1007/26/news087.html

![DB管理システムの仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/DB管理システムの仕組み.png)

<br>

## 02. RDBMS

### リレーショナルエンジン

調査中...

> ℹ️ 参考：https://qiita.com/ishishow/items/280a9d049b8f7bcbc14a

<br>


### DBエンジン（ストレージエンジン）

#### ▼ DBエンジンとは

『ストレージエンジン』ともいう。RDBMSがDBに対してデータのCRUDの処理を行うために必要なソフトウェアのこと。

> ℹ️ 参考：
>
> - https://atmarkit.itmedia.co.jp/ait/articles/1007/26/news087.html
> - https://ja.wikipedia.org/wiki/%E3%83%87%E3%83%BC%E3%82%BF%E3%83%99%E3%83%BC%E3%82%B9%E3%82%A8%E3%83%B3%E3%82%B8%E3%83%B3

#### ▼ DBエンジンの種類

RDMS（例：MySQL、PostgreSQL、など）によって、対応するDBエンジンが異なる。

- InnoDB
- Memory
- CSV

<br>


### 保管場所

#### ▼ インメモリDB

メモリ（例：DRAMなどの物理メモリ、仮想メモリ）上にデータを保管するDBを、ストレージ上に保管することと比較して、インメモリDBという。インメモリDBを採用する場合は、データ保管とプロセス割り当ての間でメモリ領域を奪い合うことになるため、メモリサイズを大きくする必要がある。

> ℹ️ 参考：
>
> - https://e-words.jp/w/%E3%82%A4%E3%83%B3%E3%83%A1%E3%83%A2%E3%83%AA.html
> - https://www.kingston.com/en/blog/pc-performance/difference-between-memory-storage
> - https://www.mydistributed.systems/2020/07/an-overview-of-storage-engines.html

#### ▼ オンディスクDB

ストレージ（例：HDD、SSD）上にデータを保管するDBを、メモリ上に保管することと比較して、オンディスクDBという。

> ℹ️ 参考：
>
> - https://www.kingston.com/en/blog/pc-performance/difference-between-memory-storage
> - https://www.mydistributed.systems/2020/07/an-overview-of-storage-engines.html

<br>

### RDB（関係DB）

#### ▼ RDBとは

データ同士がテーブル状に関係を持つデータ格納形式で構成されるのこと。NoSQLとは異なり、データはストレージに保存する。

<br>


## 03. RDBMSクライアント

### クエリ

RDBMSの種類に応じたクエリが必要になる。

<br>

### コネクション

#### ▼ コネクションとは

アプリからRDBMSへのクエリ送信時の通信のこと。TCP/IPプロトコルを使用する。

> ℹ️ 参考：https://en.wikipedia.org/wiki/Database_connection

#### ▼ コネクションプール

![db_connection-pool](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/db_connection-pool.png)

アプリからDBへのクエリ送信時に新しく作成したコネクションを、非アクティブ状態として保持しておき、以降のクエリ送信時に再利用する。一定回数再利用されたり、一定期間使用されていないコネクションは削除される。

> ℹ️ 参考：
>
> - https://support.asteria.com/hc/ja/articles/228983127-%E3%82%B3%E3%83%8D%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3%E3%83%97%E3%83%BC%E3%83%AB%E3%81%A8%E3%81%AF%E4%BD%95%E3%81%A7%E3%81%99%E3%81%8B
> - https://gihyo.jp/dev/serial/01/db-academy/000502

#### ▼ コネクションプロキシー

アプリケーションとDBの間に、コネクションプロキシー（例：ProxySQL、PgBouncer、など）を配置する。これにより、コネクションプールの処理をコネクションプロキシーに委譲する。注意点として、プリペアードステートメントでは既存のコネクションを再利用する必要があるが、コネクションプロキシーでは別のコネクションを使用してしまうことがある。そのため、コネクションプロキシーの採用時には、プリペアードステートメントを使用できない。

<br>

