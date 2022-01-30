---
title: 【知見を記録するサイト】SQL@MySQL

---

# SQL@MySQL

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ（サーバー）

### インストール

#### ・dnf経由

mysqlコマンドのみをインストールしたい場合

```bash
$ dnf install -y mysql
```

mysqlコマンド，データベースサーバー機能，をインストールしたい場合はこちら

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

データベースに登録されているグローバルパラメーターとセッションパラメーターを表示する．

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

## 01-02. セットアップ（コンテナ）

### 設定ファイル

#### ・```/etc/mysql/my.cnf```ファイル

MySQLの設定値を定義する．MySQL@Dockerコンテナでは，```/etc/mysql```ディレクトリに配置されている．ただ実際には，```/etc/mysql/conf.d/```ディレクトリと```/etc/mysql/mysql.conf.d/```ディレクトリ以下にある```*.cnf```ファイルを読み込むようになっている．

```bash
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

このファイルを上書きすることで，設定値を上書きできる．

```bash
[mysqld]
skip-host-cache # 記述なし
skip-name-resolve # 記述なし
datadir = /var/lib/mysql
socket = /var/lib/mysql/mysql.sock
secure-file-priv = /var/lib/mysql-files
user = mysql

pid-file = /var/run/mysqld/mysqld.pid

# character set / collation
character_set_server = utf8mb4 # latin1
collation_server = utf8mb4_general_ci # latin1

# timezone
default-time-zone = SYSTEM
log_timestamps = SYSTEM # UTC

# Error Log
log-error = mysql-error.log # /var/log/mysqld.log

# Slow Query Log
slow_query_log = 1 # off
slow_query_log_file = mysql-slow.log # host_name-slow.log
long_query_time = 3 # 10
log_queries_not_using_indexes = 0 # off

# General Log
general_log = 1 # off
general_log_file = mysql-general.log # host_name.log

[mysql]
default-character-set = utf8mb4 # utf8

[client]
default-character-set = utf8mb4 # utf8
```

<br>

### ディレクトリ

#### ・```datadir```ディレクトリ

MySQLのDBやテーブルの情報を管理する．DB固有の情報は，DB名のディレクトリで管理されている．dockerエリアのボリュームのマウント先として指定される．

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
