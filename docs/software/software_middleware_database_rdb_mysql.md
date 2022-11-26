---
title: 【IT技術の知見】MySQL＠RDB
description: MySQL＠RDBの知見を記録しています。
---

# MySQL＠RDB

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. テーブル

### ```CREATE TABLE```句

#### ▼ 使い方

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
  
    -- 複合プライマリーキー制約（これを指定する場合、上記のプライマリーキー制約の記述は不要）
    PRIMARY KEY(order_id, order_kbn)
  
    -- 参照制約キー
    FOREIGN KEY order_kbn REFERENCES order_kbn_data
)
```

<br>

### ```CREATE VIEW```句

#### ▼ 使い方

ビューとはある表の特定のカラムや指定した条件に合致するレコードなどを取り出した仮想の表。また、複数の表を結合したビューを作成できる。ビューを作成することによりユーザーに必要最小限のカラムやレコードのみにアクセスでき、また結合条件を指定しなくても既に結合された表にアクセスできる。
⇒よくわからん…

**＊実装例＊**

```sql
CREATE VIEW { テーブル名 } AS
SELECT
    *
FROM
    { テーブル名 };
```

<br>

### プライマリーキー

#### ▼ プライマリーキーとは

テーブルの中で、レコードを一意に識別できる値を『プライマリーキー』の値と呼ぶ。

![主キー](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/主キー.jpg)

#### ▼ プライマリーキーとして使用できるもの

一意に識別できるものあれば、何をプライマリーキーとして使用しても問題なく、基本的に以下が使用される。

| プライマリーキーになるもの                                       | 説明                                                                                                                                                                                                                                                                                                     | 補足                                                                                                                                                    |
|-----------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| MySQLのAuto Increment機能によって増加する番号カラム           | プライマリーキー制約を課したカラムのAuto Increment機能を有効化しておく。CREATE処理でドメインモデルを作成する時に、『```0```』または『```null```』をモデルのID値として割り当てる。これにより、処理によって新しいレコードが追加される時に、現在の最新番号に+１した番号が割り当てられるようになる。これはプライマリーキー制約を満たす。<br>ℹ️ 参考：https://dev.mysql.com/doc/refman/8.0/en/example-auto-increment.html | ・ドメインモデルとDBがより密結合になり、Active Recordパターンと相性が良い。<br>MySQLの環境変数として『```NO_AUTO_VALUE_ON_ZERO```』を設定すると、『```0```』の割り当てによる自動連番が拒否されるようになる。 |
| UUID（例：```3cc807ab-8e31-3071-aee4-f8f03781cb91```） | CREATE処理でモデルを作成する時に、アプケーションで作成したUUID値をドメインモデルのID値として割り当てる。UUID値が重複することは基本的に発生し得ないため、プライマリーキー制約を満たす。UUID値の作成関数は言語の標準パッケージとして用意されている。                                                                                                                                    | ・ドメインモデルとDBがより疎結合にでき、Repositoryパターンと相性が良い。<br>UUID値は文字列として管理されるため、DBアクセス処理の負荷が高まってしまう。<br>プライマリーキーを使用してソートできない。                      |

#### ▼ 複合プライマリーキー

プライマリーキーは複数設定でき、複合プライマリーキーの場合、片方のフィールドの値が異なれば、異なるプライマリーキーとして見なされる。

**＊例＊**

ユーザーIDと期間開始日付を複合プライマリーキーとすると、一人のユーザーが複数の期間を持つことを表現できる。

| user_id | period_start_date | period_end_date | fee_yen |
|---------|-------------------|-----------------|---------|
| 1       | 2019-04-03        | 2019-05-03      | 200     |
| 1       | 2019-10-07        | 2019-11-07      | 400     |
| 2       | 2019-10-11        | 2019-11-11      | 200     |

#### ▼ 採番テーブル

各テーブルのプライマリーキーを統合的に管理するテーブルを採番テーブルという。各テーブルのプライマリーキーは採番テーブルを元に割り当てられるため、連番ではなく飛び飛びになる。

> ℹ️ 参考：http://blog.livedoor.jp/sasata299/archives/51280681.html

あらかじめ、最初のレコードのみ手動で挿入しておく。

```sql
# 採番テーブルの作成する。
CREATE TABLE id_sequence (id BIGINT NOT NULL);

# 最初のレコードを手動で挿入する。
INSERT INTO id_sequence VALUES (0);
```

CREATE処理時には、事前に、採番テーブルに新しくプライマリーキーを作成する。INSERT文のプライマリーキーに『```0```』や『```null```』を割り当てるのではなく、採番テーブルから取得したIDを割り当てるようにする。

```sql
# 新しくプライマリーキーを作成する。
UPDATE id_sequence SET id = LAST_INSERT_ID(id + 1);

# プライマリーキーを取得する。
SELECT LAST_INSERT_ID();
```

<br>

### 制約

#### ▼ 制約とは

DBで、アプリケーションのCRUD処理に対するバリデーションのルールを定義する。しかし、必ずしも制約を使用する必要はなく、代わりのロジックをアプリケーション側で実装しても良い。その制約を、DBとアプリケーションのいずれの責務とするかを考え、使用するか否かを判断する。

#### ▼ プライマリーキー制約

プライマリーキーとするカラムにはプライマリーキー制約を課すようにする。プライマリーキー制約によって、Unique制約とNot Null制約の両方が課される。

#### ▼ Not Null制約

レコードに挿入される値のデータ型を指定しておくことによって、データ型不一致やNullのための例外処理を実装しなくてもよくなる。

#### ▼ 外部キー制約

親テーブルのカラムを参照する子テーブルのカラムを『外部キー』といい、この時に子テーブルに課す制約を『外部キー制約』という。子テーブルにおける外部キー制約によって、親子テーブル間に以下の整合性ルールが課される。

- 親テーブルの参照元カラムに存在しない値は、子テーブルに登録できない。
- 子テーブルの外部キーが参照する値が、親テーブルの参照元カラムに存在する場合、参照元カラムは削除できない。

**＊例＊**

会社情報テーブル（親テーブル）と個人情報テーブル（子テーブル）があるとする。子テーブルの会社IDカラムを外部キーとして、親テーブルの会社IDカラムを参照する。親テーブルの参照元カラムに存在しないIDは、子テーブルの外部キーに登録できない。また、親テーブルの参照元カラムは外部キーに参照されているため、参照元カラムは削除できない。

![外部キー](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/外部キー.png)

<br>

### stored procedure

#### ▼ stored procedureとは

あらかじめ一連のSQL文をDBに格納しておき、Call文で呼び出す方式。

> ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

![p325](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p325.gif)

#### ▼ 使い方

**＊実装例＊**

```SELECT```文のstored procedureを作成する例を考える。

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

### エクスポート、インポート

#### ▼ テーブルのエクスポート

DBからテーブルをエクスポートする。エクスポートしたいテーブルの数だけ、テーブル名を連ねる

```bash
$ mysqldump --force -u "{ アカウント }" -p -h "{ DBのホスト }" "{ DB名 }" "{ テーブル名1 }" "{ テーブル名2 }" > table.sql
```

#### ▼ テーブルのインポート

DBにテーブルをインポートする。forceオプションで、エラーが出ても強制的にインポート。

```bash
 $ mysql --force -u "{ アカウント }" -p -h "{ DBのホスト }" "{ DB名 }" < table.sql
```

<br>

### データ型

#### ▼ integer型

integer値がどのくらい増えるかによって、```3```個を使い分ける。符号なし（Unsigned）を有効化した場合、マイナス値を使用しなくなった分、使用できるプラス値が増える。

| データ型   | 値                                             | 符号なし（Unsigned）を有効化した場合 |
|---------|------------------------------------------------|-------------------------------|
| TINYINT | -128<br>~ +127                                 | 0<br>~ +255                   |
| INT     | 2147483648<br>~ +2147483647                    | 0<br>~ +4294967295            |
| BIGINT  | -9223372036854775808<br>~ +9223372036854775807 | 0<br>~ +18446744073709551615  |

#### ▼ string型

文字数がどのくらい増えるかによって、```3```個を使い分ければ良い。

| データ型      | 最大バイト数 |
|------------|-----------|
| VARCHAR(M) | 255       |
| TEXT       | 65535     |
| MEDIUMTEXT | 16777215  |

<br>

### Collation（照合順序）

#### ▼ string型の照合順序とは

string型のカラムに関して、WHERE句の比較における値の特定、ORDER BY句における並び替えの昇順降順、JOIN句における結合、GROUP BYにおけるグループ化のルールを定義する。カラム/テーブル/DB単位で設定でき、比較するカラム同士では同じ照合順序が設定されている必要がある。

> ℹ️ 参考：https://johobase.com/sqlserver-where-collate/

#### ▼ 照合順序の種類

寿司とビールの絵文字が区別されないことを『寿司ビール問題』という。大文字Aと小文字aを区別しないことは、CI：Case Insensitiveと表現され、照合順序名にも特徴としてCIの文字が含まれている。

| 照合順序名             |  A/a  | :sushi:/:beer: | は/ぱ/ば |  や/ゃ  |
|------------------------|:-----:|:--------------:|:-----:|:-----:|
| utf8mb4_unicode_ci     |   =   |       =        |   =   |   =   |
| utf8mb4_unicode_520_ci |   =   |     **≠**      |   =   |   =   |
| utf8mb4_general_ci     |   =   |       =        | **≠** | **≠** |
| utf8mb4_bin            | **≠** |     **≠**      | **≠** | **≠** |

<br>

## 02. ユーザーの管理

### CREATE

#### ▼ ユーザー作成

```sql
CREATE USER "{ ユーザー名 }" IDENTIFIED BY "{ パスワード }";
```

#### ▼ ユーザー一覧

ここで表示される特権と。ALL特権は異なる。

```sql
SELECT
    *
FROM
    mysql.user;
```

<br>

### DROP

#### ▼ ユーザー削除

```sql
-- ユーザー別のホスト名の確認
SELECT * FROM mysql.user;

-- ホストが『%』だった場合
DROP USER { ユーザー名 }@`%`;
```

<br>

### GRANT

#### ▼ 全ての認可スコープを付与


DB名は、シングルクオーテーションで囲う必要が無い。全権限を付与する場合、```PRIVILEGES```は省略できるが、厳密には省略しないようほうが良い。


```sql
-- 全てのDBに関する権限を付与
GRANT ALL PRIVILEGES ON *.* TO "{ ユーザー名 }";

-- AWS AuroraまたはRDSの場合はこちら
GRANT ALL PRIVILEGES ON `%`.* TO "{ ユーザー名 }";
```

```sql
-- AWS Auroraも同じく
-- 特定のDBに関する全権限を付与
GRANT ALL PRIVILEGES ON {DB名}.* TO "{ ユーザー名 }";
```

#### ▼ 一部の認可スコープを付与

特定のDBに関する読み出し権限のみ付与する。

```sql
GRANT SELECT ON {DB名}.* TO "{ ユーザー名 }";
```

<br>

#### ▼ ユーザー権限一覧

ユーザーに付与されている権限を取得する。

```sql
SHOW GRANTS FOR "{ ユーザー名 }";
```

作成したのみで権限を何も付与してないユーザーの場合、『dbサーバー内の全DBに関して、全権限なし』を表す```USAGE```として表示される。

```sql
GRANT USAGE ON *.* TO "{ ユーザー名 }";
```

特定のDBの認可スコープを与えると、上記に加えて、付与したGRANT権限も表示されるようになる。

<br>

### REVOKE

#### ▼ 全権限削除

全権限を削除し、GRANT権限をUSAGEに戻す。

```sql
-- AWS AuroraまたはRDSの場合
REVOKE ALL PRIVILEGES ON `%`.*
FROM
    "{ ユーザー名 }";

REVOKE ALL PRIVILEGES ON { DB名 }.*
FROM
    "{ ユーザー名 }";
```

#### ▼ ユーザー名変更

```sql
RENAME USER "{ 古いユーザー名 }" TO "{ 新しいユーザー名 }";
```

<br>

## 03. ユーザーの準備手順

### 1. ユーザーの作成

CREATEで以下の４種類を作成する。パスワードは、例えば```8```文字のパスワードを割り当てる。

```sql
CREATE USER "{ ユーザー名 }" IDENTIFIED BY "{ パスワード }";
```

| ユーザーの種類         | 例                | 補足                                    |
|-------------------|-------------------|-----------------------------------------|
| ルートユーザー           | root              | DBの作成時にrootユーザーが自動作成される場合は不要 |
| アプリケーション          | foo_app           |                                         |
| 読み出し/書き込みユーザー | foo_user          |                                         |
| 読み出しのみユーザー      | foo_readonly_user |                                         |

<br>

### 2. ユーザーへの権限付与

#### ▼ ルートユーザー

ルートユーザーには、最初から全てのDBに対して権限を付与されており不要。

#### ▼ アプリケーション

使用するDBに対する全権限を付与する。

```sql
-- DB名をクオーテーションで囲う必要はない
GRANT ALL PRIVILEGES ON {DB名}.* TO '{ ユーザー名 }'
```

#### ▼ 読み出し/書き込みユーザー

使用するDBに対する全権限を付与する。


```sql
-- DB名をクオーテーションで囲う必要はない
GRANT ALL PRIVILEGES ON {DB名}.* TO '{ ユーザー名 }'
```

#### ▼ 読み出しのみユーザー

使用するDBに対するSELECT権限を付与する。


```sql
-- DB名をクオーテーションで囲う必要はない
GRANT SELECT ON {DB名}.* TO '{ ユーザー名 }';
```

<br>

## 04. 読み出し：READ


### はじめに

#### ▼ 句の処理の順番

```
FROM ---> JOIN ---> WHERE ---> GROUP BY ---> HAVING ---> SELECT ---> ORDER BY
```

<br>

### ```SELECT```句

#### ▼ なし

指定したカラムを取得する。MySQLでは、取得結果の並び順が毎回異なるため、プライマリーキーの昇順で取得したい場合は、```ORDER BY```句を使用して、明示的に並び替えるようにする。

> ℹ️ 参考：https://www.quora.com/What-is-the-default-order-of-records-for-a-SELECT-statement-in-MySQL

```sql
SELECT
    *
FROM
    { テーブル名 };
```

#### ▼ ```SUM```関数

指定したカラムで、『フィールド』の合計を取得する。

```sql
SELECT
    SUM({ カラム名 })
FROM
    { テーブル名 };
```

#### ▼ ```AVG```関数

指定したカラムで、『フィールド』の平均値を取得する。

```sql
SELECT
    AVG({ カラム名 })
FROM
    { テーブル名 };
```

#### ▼ ```MIN```関数

指定したカラムで、『フィールド』の最小値を取得する。

```sql
SELECT
    MIN({ カラム名 })
FROM
    { テーブル名 };
```

#### ▼ ```MAX```関数

指定したカラムで、『フィールド』の最大値を取得する。

```sql
SELECT
    MAX({ カラム名 })
FROM
    { テーブル名 };
```

#### ▼ ```COUNT```関数

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

#### ▼ ```LAST_INSERT_ID```関数

任意のテーブルに最後に挿入されたIDを読み出す。テーブル名を指定する必要はない。

```sql
SELECT LAST_INSERT_ID();
```

#### ▼ ```MD5```関数

文字列をハッシュ化

```sql
SELECT MD5("foo");
```

<br>

### ```CASE```句

 カラム1が```true```だったら、カラム2を取得する。```false```であったら、カラム3を取得する。

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

### ```FROM```句

#### ▼ ```JOIN```句の種類

![内部結合のベン図](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/内部結合のベン図.jpg)

#### ▼ ```LEFT JOIN```（左外部結合）

『users』テーブルと『items』テーブルの商品IDが一致しているデータと、元となる『users』テーブルにしか存在しないデータが、セットで取得される。

![LEFT_JOIN](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/LEFT_JOIN.png)

<br>

#### ▼ ```INNER JOIN```（内部結合）

基本情報技術者試験では、内部結合（A∩B）しか出題されない。

#### ▼ 内部結合に```WHERE```を使用する場合

```2```個の```WHERE```文が、```AND```で結びつけられている時、まず1つ目の```WHERE```を満たすレコードを取得した後、取得したレコードの中から、2つ目の```WHERE```を満たすレコードを取得する。

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

#### ▼ 内部結合に```INNER JOIN ON```を使用する場合

**＊実装例＊**

```sql
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
```

<br>

### ```ORDER BY```句

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

### ```IN```句、```ANY```句の違い

#### ▼ ```IN```句の使い方

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

指定したカラムで、```SELECT```で読み出した値以外の『フィールド』を取得する。

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

#### ▼ ```ANY```句の使い方

  書き方が異なるのみで、```in```と同じ出力

```sql
SELECT
    *
FROM
    { テーブル名 }
WHERE
    { カラム名 } = ANY(foo, bar, baz);
```

<br>

### ```GROUP BY```句

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

### ```HAVING```句

#### ▼ 使い方

各句の処理の順番から考慮して、```GROUP BY```でグループ化した結果から、```HAVING```で『フィールド』を取得する。```SELECT```における集計関数が、```HAVING```における集計関数の結果を指定していることに注意せよ。

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

以下の場合、```GROUP BY + HAVING```や```WHERE```を使用しても、同じ出力結果になる。

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

### ```WILDCARD```句

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

### ```BETWEEN```句

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

### ```SET```句

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

### ```EXPLAIN```句

#### ▼ 使い方

設定した```SELECT```句が仮に実行された場合、いずれのテーブルのいずれのカラムを取得することになるか（実行計画）を取得する。また、想定実行時間も検出できるため、スロークエリの検出に役立つ。

> ℹ️ 参考：https://dev.mysql.com/doc/refman/5.7/en/explain-output.html

```sql
EXPLAIN
SELECT
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

#### ▼ ```select_type```

SQLの種類が表示される。サブクエリを含まないSQLは```SIMPLE```となり、サブクエリを含むと、サブクエリの種類に応じて、```PRIMARY```、```SUBQUERY```、```DEPENDENT SUBQUERY```、```UNCACHEABLE SUBQUERY```、```DERIVED```、のいずれかが表示される。

#### ▼ ```table```

設定した```SELECT```句がアクセスするテーブル名が表示される。

#### ▼ ```type```

設定した```SELECT```句がテーブルにアクセスする時に、どの程度の数のカラムを検索するのかが表示される。検索するカラムが多いSQLほど、想定実行時間が長くなる。

| 種類   | 条件                                                                                         | 検索するカラム数    | 補足                                                                         |
|--------|--------------------------------------------------------------------------------------------|---------------|------------------------------------------------------------------------------|
| ALL    | ・DBインデックスを使用していない。                                                                         | 全てのカラム        | 全てのカラムを検索するため、実行時間が最も長く、改善する必要がある。                              |
| index  | ・DBインデックスを使用していない。                                                                         | 全てのインデックスのカラム |                                                                              |
| range  | ・セカンダリDBインデックスを使用している。<br>・```WHERE```句に重複したレコード値、```IN```句、```BETWEEN```句を使用している。 | 特定の複数カラム   |                                                                              |
| ref    | ・セカンダリDBインデックスを使用している。<br>・```WHERE```句に重複しないレコード値                                     | 特定の複数カラム   |                                                                              |
| eq_ref | ・クラスタDBインデックスを使用している。                                                                      | ```1```個のカラム  | ```1```個のカラムしか```fetch```しないため、```JOIN```句を使用したアクセスの中で、実行時間が最も短い。 |
| const  | ・クラスタDBインデックスを使用している。<br>・```JOIN```句を使用していない。                                          | ```1```個のカラム  | ```1```個のカラムしか```fetch```しないため、実行時間が最も短い。                             |

#### ▼ ```possible_keys```

DBインデックスとして設定されたカラムのうちで、実際に利用できるものの一覧が表示される。

<br>

## 04-02. 作成：CREATE

### バルクインサート

一度のINSERT文で複数の値を挿入する。

```sql
INSERT INTO { テーブル名 }
VALUES ('<カラム名>','<レコード値>'), ('<カラム名>','<レコード値>'), ('<カラム名>','<レコード値>');
```

<br>

## 05. プラクティス

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
