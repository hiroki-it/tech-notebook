---
title: 【知見を記録するサイト】MySQL
---

# MySQL

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ

### インストール

#### ・Dnf経由

mysqlコマンドのみをインストールしたい場合

```bash
$ dnf install -y mysql
```

mysqlコマンド，DBサーバー機能，をインストールしたい場合はこちら

```bash
$ dnf install -y mysql-server
```

<br>

### 接続確認

DBに接続する．pオプションの値にはスペースが不要であることに注意する．

```bash
$ mysql -u <ユーザー名> -p<パスワード> -h <DBホスト名> <DB名>
```

<br>

### パラメーター

#### ・パラメーターの表示

DBに登録されているグローバルパラメーターとセッションパラメーターを表示する．

```sql
-- セッション/グローバルパラメーターを表示
SHOW SESSION VARIABLES;
SHOW GLOBAL VARIABLES;

-- OSとDBのタイムゾーンに関するパラメーターを表示
SHOW SESSION VARIABLES LIKE "%time_zone";
SHOW GLOBAL VARIABLES LIKE "%time_zone";
```

#### ・パラメーターの設定

```sql
-- グローバルパラメーターの場合
SET GLOBAL time_zone = "Asia/Tokyo";

-- セッションパラメーターの場合
SET time_zone = "Asia/Tokyo";
```

<br>

## 02. 設定ファイルの種類（※ Dockerの場合）

### ```/etc/mysql/my.cnf```ファイル

#### ・```/etc/mysql/my.cnf```ファイルとは

MySQLの起動時の値を設定する．```my.cnf```ファイルは，```/etc/mysql```ディレクトリ下に配置されている．ただ実際には，```/etc/mysql/conf.d/```ディレクトリと```/etc/mysql/mysql.conf.d/```ディレクトリ下にある```*.cnf```ファイルを読み込むようになっている．

```ini
# Copyright (c) 2016, 2021, Oracle and/or its affiliates.
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License, version 2.0,
# as published by the Free Software Foundation.
#
# This program is also distributed with certain software (including
# but not limited to OpenSSL) that is licensed under separate terms,
# as designated in a particular file or component or in included license
# documentation.  The authors of MySQL hereby grant you an additional
# permission to link the program and your derivative works with the
# separately licensed software that they have included with MySQL.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License, version 2.0, for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301 USA

!includedir /etc/mysql/conf.d/
!includedir /etc/mysql/mysql.conf.d/
```

#### ・```datadir```ディレクトリ

MySQLのDBやテーブルの情報を管理する．基本的には```/var/lib/mysql```ディレクトリを用いるように設定されている．DB固有の情報は，DB名のディレクトリで管理されている．dockerエリアのマウントポイントとして指定される．

```bash
[root@<コンテナID>:/var/lib/mysql] $ ls -la

drwxrwxrwt 7 mysql mysql     4096 Dec 17 12:55 .
drwxr-xr-x 1 root  root      4096 Dec  2 11:24 ..
-rw-r----- 1 mysql mysql       56 Dec 17 09:54 auto.cnf
-rw------- 1 mysql mysql     1680 Dec 17 09:54 ca-key.pem
-rw-r--r-- 1 mysql mysql     1112 Dec 17 09:54 ca.pem
-rw-r--r-- 1 mysql mysql     1112 Dec 17 09:54 client-cert.pem
-rw------- 1 mysql mysql     1680 Dec 17 09:54 client-key.pem
drwxr-x--- 2 mysql mysql     4096 Dec 17 10:23 foo_db # foo DB
-rw-r----- 1 mysql mysql     1352 Dec 17 09:54 ib_buffer_pool
-rw-r----- 1 mysql mysql 50331648 Dec 17 10:23 ib_logfile0
-rw-r----- 1 mysql mysql 50331648 Dec 17 09:54 ib_logfile1
-rw-r----- 1 mysql mysql 79691776 Dec 17 10:23 ibdata1
-rw-r----- 1 mysql mysql 12582912 Dec 17 12:54 ibtmp1
drwxr-x--- 2 mysql mysql     4096 Dec 17 09:54 mysql
drwxr-x--- 2 mysql mysql     4096 Dec 17 09:54 performance_schema
-rw------- 1 mysql mysql     1680 Dec 17 09:54 private_key.pem
-rw-r--r-- 1 mysql mysql      452 Dec 17 09:54 public_key.pem
-rw-r--r-- 1 mysql mysql     1112 Dec 17 09:54 server-cert.pem
-rw------- 1 mysql mysql     1680 Dec 17 09:54 server-key.pem
drwxr-x--- 2 mysql mysql    12288 Dec 17 09:54 sys
```

<br>

## 03. mysqldセクション

### mysqldセクション

mysqlサーバーの```mysqld```プロセスのプールを設定する．

<br>

### character-set-server

DBの作成時に適用する文字コードを設定する．

```ini
[mysql]
character-set-server = utf8mb4
```

<br>

### collation_server

照合順序を設定する．

```ini
[mysqld]
collation_server = utf8mb4_general_ci
```

<br>

### default-time-zone

デフォルトのタイムゾーンを設定する．

```ini
[mysqld]
default-time-zone = SYSTEM
```

<br>

### datadir

テーブル情報のファイルを生成するディレクトリを設定する．

```ini
[mysqld]
datadir = /var/lib/mysql
```

<br>

### log-error

エラーログの出力先を設定する．

```ini
[mysqld]
log-error = mysql-error.log
```

<br>

### log_timestamps

ログのタイムゾーンを設定する．

```ini
[mysqld]
log_timestamps = SYSTEM
```

<br>

### general_log

一般ログを出力するかどうかを設定する．

```ini
[mysqld]
general_log = 1
```

<br>

### general_log_file

一般ログの出力先のファイルを設定する．

```ini
[mysqld]
general_log_file = mysql-general.log
```

<br>

### log_queries_not_using_indexes

DBインデックスを用いるかどうかを設定する．

```ini
[mysqld]
log_queries_not_using_indexes = 0
```

<br>

### long_query_time

スロークエリログと見なす実行秒数を設定する．

```ini
[mysqld]
long_query_time = 3
```

<br>

### pid-file

プロセスIDが記載されたファイルの生成先を設定する．

```ini
[mysqld]
pid-file = /var/run/mysqld/mysqld.pid
```

<br>

### secure-file-priv

```ini
[mysqld]
secure-file-priv = /var/lib/mysql-files
```

<br>

### slow_query_log

スロークエリログを出力するかどうかを設定する．

```ini
[mysqld]
slow_query_log = 1
```

<br>

### slow_query_log_file

スロークエリログの出力先のファイルを設定する．

```ini
[mysqld]
slow_query_log_file = mysql-slow.log
```

<br>

### socket

```ini
[mysqld]
socket = /var/lib/mysql/mysql.sock
```

<br>

### user

プロセスの実行ユーザ名を設定する．

```ini
[mysqld]
user = mysql
```

<br>

## 03-02. clientセクション

### clientセクションとは

mysqlクライアントツールの```client```プロセスのプールを設定する．

<br>

### default-character-set

デフォルトの文字コードを設定する．

```ini
[client]
default-character-set = utf8mb4
```

