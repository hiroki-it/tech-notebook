---
title: 【IT技術の知見】設定ファイル＠MySQL
description: 設定ファイル＠MySQLの知見を記録しています。
---

# 設定ファイル＠MySQL

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### インストール

#### ▼ dnfリポジトリから

`mysql`コマンドのみをインストールしたい場合はこちら。

```bash
$ dnf install -y mysql
```

`mysql`コマンド、MySQLのRDBMSをインストールしたい場合はこちら。

```bash
$ dnf install -y mysql-server
```

#### ▼ yumリポジトリから

`mysql`コマンドのみをインストールしたい場合はこちら。

```bash
$ yum install -y mysql
```

`mysql`コマンド、MySQLのRDBMSをインストールしたい場合はこちら。

```bash
$ yum install -y mysql mysql-server
```

> - https://qiita.com/gologo13/items/1bdba6085ec79153bf1a

<br>

### 動作確認

#### ▼ ステータス確認

MySQLのプロセスが稼働していることを確認する。

```bash
$ systemctl status mysql.service
```

#### ▼ コネクション確認

DBに接続する。

pオプションの値にはスペースが不要であることに注意する。

開発環境では、DBホスト名は仮想サーバーやコンテナのホスト名である。

```bash
$ mysql -h "<DBホスト名>" -u "<ユーザー名>" -p"<パスワード>" "<DB名>" -P "<ポート番号>"
```

<br>

### パラメーター

#### ▼ パラメーターの種類

| パラメーター名       | 説明                                                     |
| -------------------- | -------------------------------------------------------- |
| `max_connections`    | DBクライアントからのクエリの同時接続数を設定する。       |
| `max_execution_time` | DBクライアントからのクエリのタイムアウト時間を設定する。 |
| `time_zone`          | クエリのタイムゾーンを設定する。                         |

> - https://dev.mysql.com/doc/refman/8.0/ja/server-system-variables.html

#### ▼ パラメーターの設定

パラメーターは、全てのセッションに共通する『グローバルパラメーター』と個別のセッションのみの『セッションパラメーター』がある。

```sql
-- グローバルパラメーターの場合
SET GLOBAL time_zone = "Asia/Tokyo";

-- セッションパラメーターの場合
SET time_zone = "Asia/Tokyo";
```

#### ▼ パラメーターの表示

DBに登録されているグローバルパラメーターとセッションパラメーターを取得する。

```sql
-- セッション/グローバルパラメーターを表示
SHOW SESSION VARIABLES;
SHOW GLOBAL VARIABLES;

-- OSとDBのタイムゾーンに関するパラメーターを表示
SHOW SESSION VARIABLES LIKE "%time_zone";
SHOW GLOBAL VARIABLES LIKE "%time_zone";
```

<br>

## 02. 設定ファイルの種類 (※ Dockerの場合)

### `/etc/mysql/my.cnf`ファイル

#### ▼ `/etc/mysql/my.cnf`ファイルとは

MySQLの起動時の値を設定する。

`my.cnf`ファイルは、`/etc/mysql`ディレクトリ配下に配置されている。

ただ実際には、`/etc/mysql/conf.d/`ディレクトリと`/etc/mysql/mysql.conf.d/`ディレクトリ配下にある`*.cnf`ファイルを読み込むようになっている。

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

<br>

### `/var/log/mysqld.log`ファイル

#### ▼ `/var/log/mysqld.log`ファイルとは

MySQLプロセスの実行ログを出力する。

#### ▼ temporary password

初期パスワードが出力されている。

```bash
$ less mysqld.log | grep "temporary password"
```

> - https://beyondjapan.com/blog/2020/07/mysql-password/
> - https://insource-mkd.co.jp/staff-blog/10868/

<br>

## 03. mysqldセクション

### mysqldセクション

mysqlサーバーの`mysqld`プロセスのプールを設定する。

<br>

### character-set-server

#### ▼ とは

DBの作成時に適用する文字コードを設定する。

```ini
[mysql]
character-set-server = utf8mb4
```

<br>

### collation_server

#### ▼ とは

照合順序を設定する。

```ini
[mysqld]
collation_server = utf8mb4_general_ci
```

<br>

### default_authentication_plugin

#### ▼ default_authentication_pluginとは

MySQLの認証方法を設定する。

MySQL`v8.0`未満では、認証方法はパスワード認証であった。

```ini
[mysqld]
default_authentication_plugin=mysql_native_password
```

MySQL`v8.0`以降では、SHA-256プラガブル認証がデフォルトになった。

```ini
[mysqld]
default_authentication_plugin=caching_sha2_password
```

```bash
mysql> select user, host, plugin from mysql.user;

+------------------+-----------+-----------------------+
| user             | host      | plugin                |
+------------------+-----------+-----------------------+
| root             | %         | mysql_native_password |
| mysql.infoschema | localhost | caching_sha2_password |
| mysql.session    | localhost | caching_sha2_password |
| mysql.sys        | localhost | caching_sha2_password |
| root             | localhost | mysql_native_password |
+------------------+-----------+-----------------------+
```

> - https://github.com/docker-library/mysql/issues/1048#issuecomment-2091216633
> - https://next4us-ti.hatenablog.com/entry/2021/12/18/072123

<br>

### default-time-zone

#### ▼ default-time-zoneとは

デフォルトのタイムゾーンを設定する。

```ini
[mysqld]
default-time-zone = SYSTEM
```

<br>

### datadir

#### ▼ datadirとは

DBの定義ファイルを配置するディレクトリを設定する。

```ini
[mysqld]
datadir = /var/lib/mysql
```

#### ▼ `datadir`ディレクトリ

DBの定義ファイルを管理する。

基本的には`/var/lib/mysql`ディレクトリを使用するように設定されている。

DB固有の情報は、DB名のディレクトリで管理されている。

dockerエリアのマウントポイントとして指定される。

> - https://dev.mysql.com/doc/refman/8.0/ja/data-directory.html

```bash
[root@<コンテナID>:/var/lib/mysql] $ ls -la

drwxrwxrwt 7 mysql mysql     4096 Dec 17 12:55 .
drwxr-xr-x 1 root  root      4096 Dec  2 11:24 ..
-rw-r----- 1 mysql mysql       56 Dec 17 09:54 auto.cnf
-rw------- 1 mysql mysql     1680 Dec 17 09:54 ca-key.pem
-rw-r--r-- 1 mysql mysql     1112 Dec 17 09:54 ca.pem
-rw-r--r-- 1 mysql mysql     1112 Dec 17 09:54 client-cert.pem
-rw------- 1 mysql mysql     1680 Dec 17 09:54 client-key.pem
drwxr-x--- 2 mysql mysql     4096 Dec 17 10:23 foo_db # fooDBのデータベースファイルが管理されている
-rw-r----- 1 mysql mysql     1352 Dec 17 09:54 ib_buffer_pool
-rw-r----- 1 mysql mysql 50331648 Dec 17 10:23 ib_logfile0
-rw-r----- 1 mysql mysql 50331648 Dec 17 09:54 ib_logfile1
-rw-r----- 1 mysql mysql 79691776 Dec 17 10:23 ibdata1
-rw-r----- 1 mysql mysql 12582912 Dec 17 12:54 ibtmp1
drwxr-x--- 2 mysql mysql     4096 Dec 17 09:54 mysql
drwxr-x--- 2 mysql mysql     4096 Dec 17 09:54 performance_schema
-rw------- 1 mysql mysql     1680 Dec 17 09:54 private-key.pem
-rw-r--r-- 1 mysql mysql      452 Dec 17 09:54 public-key.pem
-rw-r--r-- 1 mysql mysql     1112 Dec 17 09:54 server-cert.pem
-rw------- 1 mysql mysql     1680 Dec 17 09:54 server-key.pem
drwxr-x--- 2 mysql mysql    12288 Dec 17 09:54 sys
```

<br>

### log-error

#### ▼ log-errorとは

エラーログの出力先を設定する。

```ini
[mysqld]
log-error = mysql-error.log
```

<br>

### log_timestamps

#### ▼ log_timestampsとは

ログのタイムゾーンを設定する。

```ini
[mysqld]
log_timestamps = SYSTEM
```

<br>

### general_log

#### ▼ general_logとは

一般ログを出力するか否かを設定する。

```ini
[mysqld]
general_log = 1
```

<br>

### general_log_file

#### ▼ general_log_fileとは

一般ログの出力先のファイルを設定する。

```ini
[mysqld]
general_log_file = mysql-general.log
```

<br>

### log_queries_not_using_indexes

#### ▼ log_queries_not_using_indexesとは

DBインデックスを使用するか否かを設定する。

```ini
[mysqld]
log_queries_not_using_indexes = 0
```

<br>

### long_query_time

#### ▼ long_query_timeとは

スロークエリログを出力する場合に、スロークエリと見なす閾値秒数を設定する。

```ini
[mysqld]
long_query_time = 3
```

<br>

### pid-file

#### ▼ pid-fileとは

プロセスIDが記載されたファイルの作成先を設定する。

```ini
[mysqld]
pid-file = /var/run/mysqld/mysqld.pid
```

<br>

### secure-file-priv

#### ▼ secure-file-privとは

```ini
[mysqld]
secure-file-priv = /var/lib/mysql-files
```

<br>

### slow_query_log

#### ▼ slow_query_logとは

スロークエリログを出力するか否かを設定する。

```ini
[mysqld]
slow_query_log = 1
```

<br>

### slow_query_log_file

#### ▼ slow_query_log_fileとは

スロークエリログの出力先のファイルを設定する。

```ini
[mysqld]
slow_query_log_file = mysql-slow.log
```

<br>

### socket

#### ▼ socketとは

```ini
[mysqld]
socket = /var/lib/mysql/mysql.sock
```

<br>

### user

#### ▼ userとは

プロセスの実行ユーザー名を設定する。

```ini
[mysqld]
user = mysql
```

<br>

## 03-02. clientセクション

### clientセクションとは

mysqlクライアントツールの`client`プロセスのプールを設定する。

<br>

### default-character-set

#### ▼ default-character-setとは

デフォルトの文字コードを設定する。

```ini
[client]
default-character-set = utf8mb4
```

<br>
