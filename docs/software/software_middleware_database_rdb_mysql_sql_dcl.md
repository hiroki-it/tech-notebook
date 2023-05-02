---
title: 【IT技術の知見】DCL＠SQL
description: DCL＠SQLの知見を記録しています。
---

# DCL＠SQL

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. GRANT

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

## 02. REVOKE

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
