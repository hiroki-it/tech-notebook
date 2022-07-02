---
title: 【IT技術の知見】RDBMS＠ミドルウェア
description: RDBMS＠ミドルウェアの知見を記録しています。
---

# RDBMS＠ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. RDBMS（関係DB管理システム）の仕組み

### 構造

RDBMSは、DBエンジン、ストレージエンジン、から構成される。

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

RDBMSがDBに対してデータのCRUDの処理を行うために必要なソフトウェアのこと。

<br>

### ストレージエンジン

<br>

### RDB

#### ▼ RDBとは

データ同士がテーブル状に関係を持つデータ格納形式で構成されるのこと。NoSQLとは異なり、データはストレージに保存する。

<br>

## 02. テーブル設計

### テーブルの種類

#### ▼ masterテーブル

初期開発時に作成して以降、めったに変更処理を実行せず、読み出し処理を主とするテーブル。ドメインのうちで、ID、識別コード、名前などに関するデータを管理する。

参考：

- https://innoscale.de/en/difference-master-data-and-transaction-data/
- https://products.sint.co.jp/topsic/blog/database-basic-knowledge

#### ▼ transactionテーブル

初期開発時に作成して以降、頻繁に変更処理を実行するテーブル。ドメインのうちで、履歴、数量、日付などに関するデータを管理する。

参考：

- https://innoscale.de/en/difference-master-data-and-transaction-data/
- https://products.sint.co.jp/topsic/blog/database-basic-knowledge

<br>

### 命名規則

#### ▼ masterテーブルとtransactionテーブルがわかるようにすること

masterテーブルとtransactionテーブルがわかるようにする命名する。例えば、```mstr_foos```、```trx_bars```とする。

#### ▼ テーブル名は複数形にすること

テーブル名は複数形にして命名する。例えば、```foos```とする。

#### ▼ カラム名には単数系接頭辞をつけること

カラム名には単数系接頭辞をつけて命名する。例えば、```foo_id```、```foo_name```、```foo_type```とする。ただし、子テーブルの外部キーと紐付くカラムがある場合、そのカラムの接頭辞は、子テーブル名の単数形とする。例えば、```bar_id```とする。例外として、ActiveRecordパターンのフレームワーク（Laravelなど）では使用しない方がよいかもしれない。これらのフレームワークでは、単数形テーブル名の接頭辞がないカラム名を想定して機能が備わっていることがある。この場合、DBとの連携で毎回カラム名を明示する必要があったり、デフォルトではないカラム名を使用することによる不具合が発生したり、不便なことが多かったりするため、おすすめしない。

| foo_id  | bar_id  | foo_name  | foo_type |
| ------- | ------- | --------- | -------- |
| ```1``` | ```1``` | ```foo``` | ```2```  |

<br>

### 正規化

#### ▼ 正規化とは

繰り返し要素のある表を『正規形』、その逆を『非正規形』という。非正規形の表から、他と連動するカラムを独立させ、正規形の表に変更することを『正規化』という。正規化によって、テーブルの冗長性を排除できる（マスターテーブルとトランザクションテーブルの分離を含む）。

#### ▼ 方法

**＊例＊**

まず、主キーが受注Noと商品IDの2つであることを確認。これらの主キーは、複合主キーではないとする。

1. **エクセルで表を作成**

   エクセルで作られた以下の表があると仮定。

![非正規形](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/非正規形.png)

2. **第一正規化（繰り返し要素の排除）**

   レコードを1つずつに分割。

   ![第一正規形](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/第一正規形.png)

3. **第二正規化（主キーの関数従属性を排除）**

   主キーと特定のカラムが連動する（関数従属性がある）場合、カラムを左表として独立させる。今回、主キーが2つあるので、まず受注Noから関数従属性を排除していく。受注Noと他3カラムが連動しており、左表として独立させる。主キーと連動していたカラムを除いたものを右表とする。また、主キーが重複するローを削除する。

   ![第二正規形-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/第二正規形-1.png)

   次に、商品IDの関数従属性を排除していく。商品IDと他2カラムに関数従属性があり、左表として独立させる。主キーと連動していたカラムを除いたものを右表とする。また、主キーが重複するローを削除する。これで、主キーの関数従属性の排除は終了。

   ![第二正規形-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/第二正規形-2.png)

   ![第二正規形-3](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/第二正規形-3.png)

4. **第三正規化（主キー以外のカラムの関数従属性を排除）**

   次に主キー以外のカラムの関係従属性を排除していく。上記で独立させた3つの表のうち、一番左の表で、顧客IDと顧客名に関数従属性があるので、顧客IDを新しい主キーに設定し、左表として独立させる。主キーと連動していたカラムを除いたものを右表とする。

![第三正規形](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/第三正規形-1.png)

![第三正規形-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/第三正規形-2.png)

5. **まとめ**

   主キーの関係従属性の排除によって、受注表、商品表、数量表に分割できた。また、主キー以外の関係従属性の排除によって、顧客IDを新しい主キーとした顧客表に分割できた。

![正規化後にどんな表ができるのか](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/正規化後にどんな表ができるのか.png)

**＊例＊**

1. **エクセルで表を作成**

   以下のような表の場合、行を分割し、異なる表と見なす。

![非正規形-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/非正規形-2.png)

2. **第一正規化（繰り返し要素の排除）**

   ![第一正規形-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/第一正規形-2.png)

<br>

### データの追加/削除

データを追加するあるいは削除する場合、カラムではなく、レコードの増減を行う。カラムの増減の処理には時間がかかる。一方で、レコードの増減の処理には時間がかからない。

![カラムの増減は✖_レコードの増減は〇](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/カラムの増減は✖_レコードの増減は〇-1.png)

**＊例＊**

賞与を年1回から、2回・3回と変える場合、主キーを繰り返し、新しく賞与区分と金額区分を作る。

![カラムの増減は✖_レコードの増減は〇-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/カラムの増減は✖_レコードの増減は〇-2.png)

<br>

