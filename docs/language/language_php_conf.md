---
title: 【IT技術の知見】設定＠PHP
description: 設定＠PHPの知見を記録しています。
---

# 設定＠PHP

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. `php.ini`ファイル

### `php.ini`ファイルとは

PHPの起動時の値を設定する。

`php.ini`ファイルは、`/usr/local/etc/php`ディレクトリ配下に配置されている。

配置された任意の`ini`ファイルに実装された設定値が、ユーザー定義のカスタム値として読み込まれる。

また、それ以外の設定値はデフォルト値となる。

設定ファイルを切り分ける場合、`/usr/local/etc/php/conf.d`ディレクトリ配下に`custom.php.ini`ファイルの名前で配置する。

```bash
$ php --ini

Configuration File (php.ini) Path: /usr/local/etc/php
Loaded Configuration File:         (none) # iniファイルがまだ配置されていない
Scan for additional .ini files in: /usr/local/etc/php/conf.d # 切り分けられた設定ファイルの場所
Additional .ini files parsed:      /usr/local/etc/php/conf.d/docker-php-ext-bcmath.ini,
/usr/local/etc/php/conf.d/docker-php-ext-pdo_mysql.ini,
/usr/local/etc/php/conf.d/docker-php-ext-sodium.ini
```

> - https://www.php.net/manual/ja/configuration.file.php

<br>

### 本番/開発環境共通

PHPでは、`/usr/local/etc/php`ディレクトリには`php.ini-development`ファイルと`php.ini-production`ファイルが最初から配置されている。

これをコピーして設定値を変更し、読み込まれるようにファイル名を`php.ini`に変えて配置する (これ以外のファイル名でｊは読み込まれない) 。

代わりに、最小限の設定値のみを変更した`php.ini`ファイルを自身で作成し、同じく配置しても良い。

```bash
$ ls -la /usr/local/etc/php

drwxr-xr-x 1 root root  4096 Dec  2 13:39 .
drwxr-xr-x 1 root root  4096 Dec  2 13:39 ..
drwxr-xr-x 1 root root  4096 Dec 17 15:21 conf.d
-rw-r--r-- 1 root root 72382 Dec  2 13:39 php.ini-development
-rw-r--r-- 1 root root 72528 Dec  2 13:39 php.ini-production
# php.iniファイルをここに配置する
```

<br>

### 開発環境用

あらかじめ用意されている`php.ini-development`ファイルを参考に設定する。

元の値をコメントアウトで示す。

```ini
# 開発環境では、スタックトレースを表示
zend.exception_ignore_args = off # on

expose_php = on

max_execution_time = 30

max_input_vars = 1000

upload_max_filesize = 64M # 2M

post_max_size = 128M # 8M

memory_limit = 256M # 128M

# 開発環境では、全てのログレベルを出力
error_reporting = E_ALL # NULL

display_errors = on

display_startup_errors = on

# 開発環境では、ログをerror_log値へのパスに出力
log_errors = on # 0(off)

# 開発環境では、エラーログをファイルに出力
error_log = /var/log/php/php-error.log # NULL

default_charset = UTF-8

[Date]
date.timezone = Asia/Tokyo # GMT

[mysqlnd]
# 開発環境では、メモリに関するメトリクスの元になるデータポイントを収集する。
mysqlnd.collect_memory_statistics = on # off

[Assertion]
zend.assertions = 1

[mbstring]
mbstring.language = Japanese
```

> - https://qiita.com/ucan-lab/items/0d74378e1b9ba81699a9

<br>

### 本番環境用

あらかじめ用意されている`php.ini-production`ファイルを参考に設定する。

元の値をコメントアウトで示す。

```ini
zend.exception_ignore_args = on

# 本番環境では、X-Powered-ByヘッダーのPHPバージョンを非表示
expose_php = off # on

max_execution_time = 30

max_input_vars = 1000

upload_max_filesize = 64M

post_max_size = 128M

memory_limit = 256M

# 本番環境では、特定のログレベルを出力
error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT # NULL

# 本番環境では、エラーを画面に非表示
display_errors = off # on

display_startup_errors = off

# 本番環境では、エラーログをerror_log値へのパスに出力
log_errors = on # 0(off)

 # 本番環境では、エラーログを標準エラー出力に出力
error_log = /dev/stderr # NULL

default_charset = UTF-8

[Date]
date.timezone = Asia/Tokyo

[mysqlnd]
mysqlnd.collect_memory_statistics = off

[Assertion]
zend.assertions = -1

[mbstring]
mbstring.language = Japanese

# 本番環境では、Opcache機能を有効化
[opcache]
opcache.enable = 1
opcache.memory_consumption = 128
opcache.interned_strings_buffer = 8
opcache.max_accelerated_files = 4000
opcache.validate_timestamps = 0
opcache.huge_code_pages = 0
opcache.preload = /var/www/preload.php
opcache.preload_user = www-data
```

> - https://qiita.com/ucan-lab/items/0d74378e1b9ba81699a9

<br>
