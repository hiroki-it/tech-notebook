---
title: 【IT技術の知見】DDL＠SQL
description: DDL＠SQLの知見を記録しています。
---

# DDL＠SQL

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. CREATE

### テーブルの管理

#### ▼ `CREATE TABLE`句

テーブルを作成する。

**＊実装例＊**

```sql
-- 注文テーブル作成
CREATE TABLE order_data (

    -- プライマリーキー制約
    order_id INT(10) PRIMARY KEY COMMENT "注文ID",

    -- Not Null制約
    order_kbn INT(3) NOT NULL COMMENT "注文区分",
    system_create_date_time DATETIME NOT NULL COMMENT "システム登録日時",
    system_update_date_time DATETIME NOT NULL COMMENT "システム更新日時",
    delete_flg INT(1) DEFAULT 0 NOT NULL COMMENT "0：通常、1：削除済",

    -- 複合プライマリーキー制約 (これを指定する場合、上記のプライマリーキー制約の記述は不要)
    PRIMARY KEY(order_id, order_kbn)

    -- 参照制約キー
    FOREIGN KEY order_kbn REFERENCES order_kbn_data
)
```

#### ▼ `CREATE VIEW`句

ビューとはある表の特定のカラムや指定した条件に合致するレコードなどを取り出した仮想の表。

また、複数の表を結合したビューを作成できる。

ビューを作成することによりユーザーに必要最小限のカラムやレコードのみにアクセスでき、また結合条件を指定しなくても既に結合された表にアクセスできる。

**＊実装例＊**

```sql
CREATE VIEW { テーブル名 } AS
SELECT
    *
FROM
    { テーブル名 };
```

<br>

### ユーザーの管理

#### ▼ ユーザー作成

CREATEで以下の４種類を作成する。

パスワードは、例えば`8`文字のパスワードを割り当てる。

```sql
CREATE USER "{ ユーザー名 }" IDENTIFIED BY "{ パスワード }";
```

| ユーザーの種類            | 例                | 補足                                               |
| ------------------------- | ----------------- | -------------------------------------------------- |
| ルートユーザー            | root              | DBの作成時にrootユーザーが自動作成される場合は不要 |
| アプリケーション          | foo_app           |                                                    |
| 読み出し/書き込みユーザー | foo_user          |                                                    |
| 読み出しのみユーザー      | foo_readonly_user |                                                    |

#### ▼ ユーザー一覧

ここで表示される特権と。

ALL特権は異なる。

```sql
SELECT
    *
FROM
    mysql.user;
```

<br>

## 02. DROP

### ユーザー管理

#### ▼ ユーザー削除

```sql
-- ユーザー別のホスト名の確認
SELECT * FROM mysql.user;

-- ホストが『%』だった場合
DROP USER { ユーザー名 }@`%`;
```

<br>
