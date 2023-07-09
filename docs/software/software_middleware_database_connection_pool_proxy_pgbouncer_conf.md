---
title: 【IT技術の知見】設定ファイル＠PgBouncer
description: 設定ファイル＠PgBouncerの知見を記録しています。
---

# 設定ファイル＠PgBouncer

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 設定ファイル

### `pgbouncer.ini`ファイル

PgBouncerの設定ファイルである。

<br>

## 02. pgbouncerセクション

### logfile

ログファイルの場所を設定する。

```ini
[pgbouncer]
logfile = /var/log/pgbouncer/pgbouncer.log
```

<br>

### listen_addr

クライアントからの通信を受信するアドレスを設定する。

```ini
[pgbouncer]
listen_addr = *
```

<br>

### listen_port

クライアントからの通信を受信するポート番号を設定する。

```ini
[pgbouncer]
listen_port = 5432
```

<br>

### server_reset_query

新しいクライアント接続を受信する前に実行する処理を設定する。

```ini
[pgbouncer]
server_reset_query = DISCARD ALL
```

> - https://www.pgbouncer.org/config.html#generic-settings

<br>

### pool_mode

クライアントが、DB接続を再利用できる条件を設定する。

#### ▼ session

クライアント接続が切断された場合に、DB接続も切断する。

```ini
[pgbouncer]
pool_mode = session
```

> - https://www.pgbouncer.org/config.html#generic-settings

#### ▼ transaction

トランザクションの終了後、DB接続も切断する。

```ini
[pgbouncer]
pool_mode = transaction
```

> - https://www.pgbouncer.org/config.html#generic-settings

#### ▼ statement

クエリの終了後、DB接続も切断する。

```ini
[pgbouncer]
pool_mode = statement
```

> - https://www.pgbouncer.org/config.html#generic-settings

<br>

## 03. databasesセクション

### DB名

DB接続時の宛先情報を設定する。

```ini
[databases]
foo_db = host=127.0.0.1 port=5432 dbname=foo_db
```

<br>

### query_wait_timeout

クエリのタイムアウトを設定する。

デフォルトでは、くえりが完了するまでの待機し続けてしまう。

`query_wait_timeout`を設定すれば、タイムアウト時間を超えてもDBから返信が無い場合、接続を切断するようになる。

```ini
[databases]
query_wait_timeout = 30000
```

> - https://www.pgbouncer.org/config.html#dangerous-timeouts

<br>

### max_client_conn

DBが同時に受信できるクライアント接続の最大数を設定する。

```ini
[databases]
max_client_conn = 100
```

> - https://www.pgbouncer.org/config.html#section-databases

<br>

### default_pool_size

プールするクライアント接続の最大数を設定する。

```ini
[databases]
default_pool_size = 20
```

> - https://www.pgbouncer.org/config.html#section-databases

<br>

### min_pool_size

プールするクライアント接続の最小数を設定する。

```ini
[databases]
min_pool_size = 10
```

> - https://www.pgbouncer.org/config.html#section-databases

<br>

### reserve_pool_size

プールするクライアント接続の事前予約数を設定する。

```ini
[databases]
reserve_pool_size = 5
```

> - https://www.pgbouncer.org/config.html#section-databases

<br>
