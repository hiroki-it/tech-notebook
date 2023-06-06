---
title: 【IT技術の知見】DCL＠SQL
description: DCL＠SQLの知見を記録しています。
---

# DCL＠SQL

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. DCLとは

トランザクションを制御するクエリのこと。

> ↪️：https://morizyun.github.io/database/sql-ddl-dml-dcl.html#DCL-Data-Control-Language

<br>

## 02. BEGIN (START TRANSACTION)

### BEGINとは

トランザクションを開始する。

`START TRANSACTION`としてもよい。

```sql
BEGIN;
```

```sql
START TRANSACTION;
```

<br>

## 03. COMMIT

### COMMITとは

トランザクションを終了する。

```sql
-- トランザクションを終了する
BEGIN;

-- 何らかのステートメント

-- トランザクションを終了する
COMMIT;
```

<br>

## 04. GRANT

### ユーザーの種類

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

### 全ての認可スコープを付与

DB名は、シングルクオーテーションで囲う必要が無い。

全権限を付与する場合、`PRIVILEGES`は省略できるが、厳密には省略しないようほうが良い。

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

<br>

### 一部の認可スコープを付与

特定のDBに関する読み出し権限のみ付与する。

```sql
GRANT SELECT ON {DB名}.* TO "{ ユーザー名 }";
```

<br>

### ユーザー権限一覧

ユーザーに付与されている権限を取得する。

```sql
SHOW GRANTS FOR "{ ユーザー名 }";
```

作成したのみで権限を何も付与してないユーザーの場合、『dbサーバー内の全DBに関して、全権限なし』を表す`USAGE`として表示される。

```sql
GRANT USAGE ON *.* TO "{ ユーザー名 }";
```

特定のDBの認可スコープを与えると、上記に加えて、付与したGRANT権限も表示されるようになる。

<br>

## 05. REVOKE

### 全権限削除

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

<br>

### ユーザー名変更

```sql
RENAME USER "{ 古いユーザー名 }" TO "{ 新しいユーザー名 }";
```

<br>

## 06. ROLLBACK

### ROLLBACKとは

トランザクション中の一連のステートメントを取り消し、元の状態に戻す。

RDBMSでいう『ロールバック』の概念を実装する。

```sql
-- トランザクションを介しする
BEGIN;

-- テーブルのデータを削除するステートメント
DELETE FROM score;

-- 削除されたデータを確認するステートメント
SELECT *
FROM score;

-- ここで、トランザクションに何らかの問題が起こる

-- ロールバックする
ROLLBACK;

-- トランザクションを終了する
COMMIT;
```

トランザクション後にもう一度クエリを実行すると、データが復元されている。

```
-- データが復元される
SELECT *
FROM score;
```

> ↪️：https://tech.pjin.jp/blog/2020/11/30/%E3%80%90sql%E5%85%A5%E9%96%80%E3%80%91%E3%82%B3%E3%83%9F%E3%83%83%E3%83%88%E3%81%A8%E3%83%AD%E3%83%BC%E3%83%AB%E3%83%90%E3%83%83%E3%82%AF/

<br>
