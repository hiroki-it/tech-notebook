---
title: 【IT技術の知見】DML＠SQL
description: DML＠SQLの知見を記録しています。
---

# DML＠SQL

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. SELECT

### はじめに

#### ▼ 句の処理の順番

```
FROM ---> JOIN ---> WHERE ---> GROUP BY ---> HAVING ---> SELECT ---> ORDER BY
```

<br>

### `SELECT`句

#### ▼ なし

指定したカラムを取得する。

MySQLでは、取得結果の並び順が毎回異なるため、プライマリーキーの昇順で取得したい場合は、`ORDER BY`句を使用して、明示的に並び替えるようにする。

> ↪️ 参考：https://www.quora.com/What-is-the-default-order-of-records-for-a-SELECT-statement-in-MySQL

```sql
SELECT
    *
FROM
    { テーブル名 };
```

#### ▼ `SUM`関数

指定したカラムで、『フィールド』の合計を取得する。

```sql
SELECT
    SUM({ カラム名 })
FROM
    { テーブル名 };
```

#### ▼ `AVG`関数

指定したカラムで、『フィールド』の平均値を取得する。

```sql
SELECT
    AVG({ カラム名 })
FROM
    { テーブル名 };
```

#### ▼ `MIN`関数

指定したカラムで、『フィールド』の最小値を取得する。

```sql
SELECT
    MIN({ カラム名 })
FROM
    { テーブル名 };
```

#### ▼ `MAX`関数

指定したカラムで、『フィールド』の最大値を取得する。

```sql
SELECT
    MAX({ カラム名 })
FROM
    { テーブル名 };
```

#### ▼ `COUNT`関数

指定したカラムで、『フィールド』の個数を取得する。

```sql
SELECT
    { カラム名 } COUNT(*)
FROM
    { テーブル名 };
```

**※消去法の小技：集合関数を入れ子状にはできない**

**＊実装例＊**

集合関数を集合関数の中に入れ子状にできない。

```sql
--
SELECT
    AVG(SUM({ カラム名 }))
FROM
    { テーブル名 };
```

指定したカラムで、値無しも含む『フィールド』を取得する。

```sql
SELECT
    { カラム名 } COUNT(*)
FROM
    { テーブル名 };
```

指定したカラムで、値無しを除いた『フィールド』を取得する。

```sql
SELECT
    { カラム名 } COUNT(*);
```

#### ▼ `LAST_INSERT_ID`関数

任意のテーブルに最後に挿入されたIDを読み出す。

テーブル名を指定する必要はない。

```sql
SELECT LAST_INSERT_ID();
```

#### ▼ `MD5`関数

文字列をハッシュ化

```sql
SELECT MD5("foo");
```

<br>

### `CASE`句

カラム1が`true`だったら、カラム2を取得する。

`false`であったら、カラム3を取得する。

```sql
SELECT
    CASE
        WHEN { エイリアス }.{ カラム名1 } = 1 THEN { エイリアス }.{ カラム名2 }
        ELSE { エイリアス }.{ カラム名3 }
    END AS name
FROM
    { テーブル名 } AS { エイリアス };
```

<br>

### `FROM`句

#### ▼ `JOIN`句の種類

![内部結合のベン図](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/内部結合のベン図.jpg)

#### ▼ `LEFT JOIN` (左外部結合)

『users』テーブルと『items』テーブルの商品IDが一致しているデータと、元となる『users』テーブルにしか存在しないデータが、セットで取得される。

![LEFT_JOIN](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/LEFT_JOIN.png)

#### ▼ `INNER JOIN` (内部結合)

基本情報技術者試験では、内部結合 (A∩B) しか出題されない。

#### ▼ 内部結合に`WHERE`を使用する場合

`2`個の`WHERE`文が、`AND`で結びつけられている時、まず1つ目の`WHERE`を満たすレコードを取得した後、取得したレコードの中から、2つ目の`WHERE`を満たすレコードを取得する。

**＊実装例＊**

```sql
-- 『カラム』のみでなく、どの『表』なの物なのかも指定
SELECT
    { テーブル名1 }.{ カラム名1 },
    -- 複数の表を指定
FROM
    { テーブル名1 },
    { テーブル名2 },
    -- まず、1つ目のフィールドと2つ目のフィールドが同じレコードを取得する。
WHERE
    -- 次に、上記で取得したレコードのうち、次の条件も満たすレコードのみを取得する。
    { レコード名1 } = { レコード名2 }
    AND { レコード名2 } = { レコード名3 }
```

#### ▼ 内部結合に`INNER JOIN ON`を使用する場合

**＊実装例＊**

````sql
-- 『カラム』のみでなく、どの『表』なの物なのかも指定
SELECT
    { テーブル名1 }.{ カラム名1 },
    -- 複数の表を指定
FROM
    { テーブル名1 }
    -- 2つ目の表の『レコード』と照合
    INNER JOIN { テーブル名2 }
    ON { テーブル名1 }.{ カラム名1 } = { テーブル名2 }.{ カラム名2 }
    -- ```3```個目の表の『レコード』と照合
    INNER JOIN { テーブル名3 }
    ON { テーブル名1 }.{ カラム名1 } = { テーブル名3 }.{ カラム名3 }
````

<br>

### `ORDER BY`句

#### ▼ 使い方

**＊実装例＊**

```php
<?php
$joinedIdList = implode(",", $idList);

// 並び替え条件を設定
$expression = call_user_func(function () use ($orders, $joinedIdList) {
    if ($orders) {
        foreach ($orders as $key => $order) {
            switch ($key) {
                case "id":
                    return sprintf("ss.id %s", $order);
            }
        }
    }

    // IN句順の場合
    return sprintf("FIELD(ss.id, %s)", $idList);
});

$sql = <<<SQL
            SELECT
                name
            FROM
                table
            ORDER BY {$expression}
        SQL;
```

<br>

### `IN`句、`ANY`句の違い

#### ▼ `IN`句の使い方

指定した値と同じ『フィールド』を取得する。

**＊実装例＊**

指定したカラムで、指定した値の『フィールド』を取得する。

```sql
SELECT
    *
FROM
    { テーブル名 }
WHERE
    { カラム名 } in (foo, bar,...);
```

指定したカラムで、指定した値以外の『フィールド』を取得する。

```sql
SELECT
    *
FROM
    { テーブル名 }
WHERE
    { カラム名 } not in ({ レコード名1 }, { レコード名2 },...);
```

指定したカラムで、`SELECT`で読み出した値以外の『フィールド』を取得する。

```sql
SELECT
    *
FROM
    { テーブル名 }
WHERE
    { カラム名 } not in (
        --
        SELECT
            { カラム名 }
        FROM
            { テーブル名 }
        WHERE
            { レコード名 } >= 160
    );
```

**【IN句を使用しなかった場合】**

```sql
SELECT
    *
FROM
    fruit
WHERE
    name = "みかん"
    OR name = "りんご";
```

**【IN句を使用した場合】**

```sql
SELECT
    *
FROM
    fruit
WHERE
    name IN("みかん", "りんご");
```

#### ▼ `ANY`句の使い方

書き方が異なるのみで、`in`と同じ出力

```sql
SELECT
    *
FROM
    { テーブル名 }
WHERE
    { カラム名 } = ANY(foo, bar, baz);
```

<br>

### `GROUP BY`句

#### ▼ 使い方

カラムをグループ化し、集合関数を使用して、フィールドの値を算出する。

**＊実装例＊**

指定したカラムをグループ化し、フィールドの値の平均値を算出する。

```sql
SELECT
    { カラム名1 },
    AVG({ カラム名2 })
FROM
    { テーブル名 }
GROUP BY
    { カラム名1 };
```

<br>

### `HAVING`句

#### ▼ 使い方

各句の処理の順番から考慮して、`GROUP BY`でグループ化した結果から、`HAVING`で『フィールド』を取得する。

`SELECT`における集計関数が、`HAVING`における集計関数の結果を指定していることに注意せよ。

**＊実装例＊**

```sql
-- HAVINGによる集計結果を指定して出力。
SELECT
    { カラム名1 },
    COUNT({ カラム名2 })
FROM
    { テーブル名 }
GROUP BY
-- グループ化した結果を集計し、2個以上の『フィールド』を取得する。
    { カラム名1 }
HAVING
    COUNT(*) >= 2;
```

以下の場合、`GROUP BY + HAVING`や`WHERE`を使用しても、同じ出力結果になる。

```sql
SELECT
    { カラム名 }
FROM
    { テーブル名 }
GROUP BY
    { カラム名 }
HAVING
    { レコード名 };
```

```sql
SELECT
    { カラム名 }
FROM
    { テーブル名 }
WHERE
    { レコード名 }
GROUP BY
    { カラム名 };
```

<br>

### `WILDCARD`句

#### ▼ 使い方

**＊実装例＊**

```sql
SELECT
    *
FROM
    { テーブル名 }
WHERE
    { カラム名 } LIKE "%営業";
```

```sql
SELECT
    *
FROM
    { テーブル名 }
WHERE
    { カラム名 } LIKE "_営業";
```

<br>

### `BETWEEN`句

#### ▼ 使い方

**＊実装例＊**

指定したカラムで、1以上10以下の『フィールド』を取得する。

```sql
SELECT
    *
FROM
    { テーブル名 }
    BETWEEN 1
    AND 10;
```

<br>

### `SET`句

#### ▼ 使い方

**＊実装例＊**

```sql
SET
    @A = { パラメーター値 };

SET
    @B = { パラメーター値 };

UPDATE
    { テーブル名 }
SET
    { カラム名 } = @A,
WHERE
    { カラム名 } = @B;
```

<br>

### サブクエリ

#### ▼ 使い方

掛け算と同様に、括弧内から先に処理を行う。

**＊実装例＊**

```sql
-- Main-query
SELECT
    *
FROM
    { テーブル名 }
WHERE
    { カラム名 } != (
        -- Sub-query
        SELECT
            max({ カラム名 })
        FROM
            { テーブル名 }
    );
```

<br>

## 01-02. Tips

### 各DBサイズの確認

```sql
SELECT
    table_schema,
    sum(data_length) / 1024 / 1024 AS mb
FROM
    information_schema.tables
GROUP BY
    table_schema
ORDER BY
    sum(data_length + index_length) DESC;
```

<br>

### カラムの検索

```sql
SELECT
    table_name,
    column_name
FROM
    information_schema.columns
WHERE
    column_name = { 検索したいカラム名 }
    AND table_schema = { 検索対象のDB名 }
```

<br>

## 02. `EXPLAIN`句

### 実行計画

設定した`SELECT`句が仮に実行された場合、いずれのテーブルのいずれのカラムを取得することになるか (実行計画) を取得する。

また、想定実行時間も検出できるため、スロークエリの検出に役立つ。

```sql
EXPLAIN SELECT
    *
FROM
    t1,
    t2
WHERE
    t1.c1 = 1
    AND t1.c2 = t2.c3
```

```bash
*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: t1
         type: ref
possible_keys: index_t1_on_c1_and_c2
          key: index_t1_on_c1_and_c2
      key_len: 5
          ref: const
         rows: 10
        Extra: Using where; Using index
*************************** 2. row ***************************
           id: 1
  select_type: SIMPLE
        table: t2
         type: ref
possible_keys: index_t2_on_c3
          key: index_t2_on_c3
      key_len: 5
          ref: sample.t1.c2
         rows: 1
        Extra: Using index
```

> ↪️ 参考：https://dev.mysql.com/doc/refman/5.7/en/explain-output.html

<br>

### 読み方

#### ▼ `select_type`

SQLの種類が表示される。

サブクエリを含まないSQLは`SIMPLE`となり、サブクエリを含むと、サブクエリの種類に応じて、`PRIMARY`、`SUBQUERY`、`DEPENDENT SUBQUERY`、`UNCACHEABLE SUBQUERY`、`DERIVED`、のいずれかが表示される。

#### ▼ `table`

設定した`SELECT`句がアクセスするテーブル名が表示される。

#### ▼ `type`

設定した`SELECT`句がテーブルにアクセスする時に、どの程度の数のカラムを検索するのかが表示される。

検索するカラムが多いSQLほど、想定実行時間が長くなる。

| 種類   | 条件                                                                                                               | 検索するカラム数           | 補足                                                                                       |
| ------ | ------------------------------------------------------------------------------------------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------ |
| ALL    | ・DBインデックスを使用していない。                                                                                 | 全てのカラム               | 全てのカラムを検索するため、実行時間が最も長く、改善する必要がある。                       |
| index  | ・DBインデックスを使用していない。                                                                                 | 全てのインデックスのカラム |                                                                                            |
| range  | ・セカンダリDBインデックスを使用している。<br>・`WHERE`句に重複したレコード値、`IN`句、`BETWEEN`句を使用している。 | 特定の複数カラム           |                                                                                            |
| ref    | ・セカンダリDBインデックスを使用している。<br>・`WHERE`句に重複しないレコード値                                    | 特定の複数カラム           |                                                                                            |
| eq_ref | ・クラスタDBインデックスを使用している。                                                                           | `1`個のカラム              | `1`個のカラムしか`fetch`しないため、`JOIN`句を使用したアクセスの中で、実行時間が最も短い。 |
| const  | ・クラスタDBインデックスを使用している。<br>・`JOIN`句を使用していない。                                           | `1`個のカラム              | `1`個のカラムしか`fetch`しないため、実行時間が最も短い。                                   |

#### ▼ `possible_keys`

DBインデックスとして設定されたカラムのうちで、実際に利用できるものの一覧が表示される。

<br>

## 03. INSERT

### バルクインサート

一度のINSERT文で複数の値を挿入する。

```sql
INSERT INTO { テーブル名 } VALUES ('<カラム名>','<レコード値>'), ('<カラム名>','<レコード値>'), ('<カラム名>','<レコード値>');
```

<br>

## 04. EXEC

### stored procedure

#### ▼ stored procedureとは

あらかじめ一連のSQL文をDBに格納しておき、Call文でコールする方式。

> ↪️ 参考：https://www.amazon.co.jp/dp/4297124513

![p325](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p325.gif)

#### ▼ 使い方

**＊実装例＊**

`SELECT`文のstored procedureを作成する例を考える。

```sql
-- PROCEDUREを作成し、DBへ格納しておく。
CREATE PROCEDURE SelectContact AS
SELECT
    { カラム名 }
FROM
    { テーブル名 }
```

```sql
-- PROCEDUREを実行
EXEC SelectContact
```

<br>
