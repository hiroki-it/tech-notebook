---
title: 【IT技術の知見】設定ファイル＠PHP-FPM
description: 設定ファイル＠PHP-FPMの知見を記録しています。
---

# 設定ファイル＠PHP-FPM

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### インストール

#### ▼ aptリポジトリから

```bash
$ apt install php-fpm
```

```bash
$ apt-get install php-fpm
```

<br>

## 02. 設定ファイルの種類 (※ Dockerの場合)

### `/usr/local/etc/php-fpm.conf`ファイル

#### ▼ `php-fpm.conf`ファイルとは

PHP-FPMの全てのプロセスを設定する。

設定ファイルを切り分ける場合、`/etc/php-fpm.d`ディレクトリ配下に`<実行ユーザー名>.conf`ファイルの名前で配置する。

PHP-FPMの仕様として、異なる`.conf`ファイルで同じプールで同じオプションを設定した場合は、後ろにくる名前のファイルの設定が優先されるようになっている。

そのため、同じプールの設定を異なる`.conf`ファイルに分割する場合、同じオプションを設定しないように注意する。

```ini
;;;;;;;;;;;;;;;;;;;;;
; FPM Configuration ;
;;;;;;;;;;;;;;;;;;;;;

include=/etc/php-fpm.d/*.conf

;;;;;;;;;;;;;;;;;;
; Global Options ;
;;;;;;;;;;;;;;;;;;

[global]

pid = /run/php-fpm/php-fpm.pid

error_log = /var/log/php-fpm/error.log

;syslog.facility = daemon
;syslog.ident = php-fpm
;log_level = notice
;emergency_restart_threshold = 0
;emergency_restart_interval = 0
;process_control_timeout = 0
;process.max = 128
;process.priority = -19

daemonize = yes

;rlimit_files = 1024
;rlimit_core = 0
;events.mechanism = epoll
;systemd_interval = 10

;;;;;;;;;;;;;;;;;;;;
; Pool Definitions ;
;;;;;;;;;;;;;;;;;;;;

; 同じプールの設定を異なるファイルに分割する場合は注意が必要である。
; See /etc/php-fpm.d/*.conf
```

> - https://yoshinorin.net/2017/03/06/php-official-docker-image-trap/

<br>

### `/usr/local/etc/php-fpm.d/www.conf`ファイル

#### ▼ `www.conf`ファイルとは

PHP-FPMの`www`プロセスのプールを設定する。

`www.conf`ファイルは、`/usr/local/etc/php-fpm.d`ディレクトリ配下に配置されている。

`php.ini`ファイルによって読み込まれ、`php.ini`ファイルよりも優先されるので、設定項目が重複している場合は、こちらを変更する。

NginxからPHP-FPMにインバウンド通信をルーティングする場合、Nginxの設定ファイル (`/etc/nginx/nginx.conf`ファイル) とPHP-FPMの設定ファイル (`/usr/local/etc/php-fpm.d/www.conf`ファイル) の両方で、プロセスのユーザー名を『`www-data`』とする必要がある。

補足として、『`www-data`』は`apache`プロセスのユーザー名のデフォルト値である。

> ↪️：
>
> - https://www.php.net/manual/ja/install.fpm.configuration.php
> - https://yoshinorin.net/2017/03/06/php-official-docker-image-trap/

#### ▼ `zz-docker.conf `ファイルについて

PHP-FPMのベースイメージには`zz-docker.conf `ファイルが組み込まれており、このファイルにはPHP-FPMの一部の設定が実装されている。

PHP-FPMの仕様では、同じプールに同じオプションを設定した場合は、名前が後ろに来るファイルの設定が優先されるため、デフォルトのベースイメージでは`zz-docker.conf`ファイルの設定が最優先になっている。

このファイルに後勝ちできるように、ホストでは`www.conf`ファイルとして定義しておき、コンテナ側にコピーする時は`zzz-www.conf`ファイルとする。

```dockerfile
COPY ./php-fpm.d/www.conf /usr/local/etc/php-fpm.d/zzz-www.conf
```

> ↪️：
>
> - https://www.kengotakimoto.com/posts/laravel_with_docker-compose
> - https://github.com/usabilla/php-docker-template/blob/master/src/php/fpm/conf/zz-docker.conf.template

<br>

### `/usr/local/etc/php-fpm.d/docker.conf`ファイル

#### ▼ `docker.conf`ファイルとは

PHP-FPMをコンテナで稼働させるために必要な項目を設定する。ファイルは、`/usr/local/etc/php-fpm.d`ディレクトリ配下に配置されている。

```ini
[global]
; /dev/stderr (標準エラー出力) へのシンボリックリンクになっている。
error_log = /proc/self/fd/2

; https://github.com/docker-library/php/pull/725#issuecomment-443540114
log_limit = 8192

[www]
; if we send this to /proc/self/fd/1, it never appears
; /dev/stderr (標準エラー出力) へのシンボリックリンクになっている。
access.log = /proc/self/fd/2

clear_env = no

; Ensure worker stdout and stderr are sent to the main error log.
catch_workers_output = yes
decorate_workers_output = no
```

<br>

## 03. globalセクション

### error_log

標準エラー出力の出力先のファイルを設定する。

```ini
[global]
error_log = /var/log/php-fpm/error.log
```

<br>

### pid

PIDの出力先のファイルを設定する。

```ini
[global]
pid = /run/php-fpm/php-fpm.pid
```

<br>

## 04. wwwセクション

### wwwセクションとは

PHP-FPMの`www`プロセスのプールを設定する。

> ↪️：
>
> - https://www.php.net/manual/ja/install.fpm.configuration.php
> - https://hackers-high.com/linux/php-fpm-config/

<br>

### clear_env

デフォルトでは、環境変数の衝突や悪意ある注入を防ぐために、最初にプール内の環境変数を全て削除している。

これにより、設定ファイルに環境変数を出力できないようになっている。

この最初の削除処理を無効化する。

```ini
[www]
clear_env = no
```

> - https://takapi86.hatenablog.com/entry/2019/07/29/225558

<br>

### env

プロセスのプール内に出力する環境変数を設定する。

この環境変数はPHPのプロセスで定義された環境変数ではないため、`php`コマンドを直接的に実行しても確認できないことに注意する。

```ini
[www]
env[FOO] = foo
```

```bash
$ php -r 'echo $FOO;' # プロセスが異なるため、何も出力されない。
```

<br>

### group

プロセスの実行グループ名を設定する。

```ini
[www]
group = www-data
```

<br>

### listen

作成されたUnixドメインソケットファイルの場所を設定する。

```ini
[www]
listen = /var/run/php-fpm/php-fpm.sock
```

<br>

### listen.acl_users

コメントアウトが推奨である。

代わりとして、`listen.owner`と`listen.group`を設定する。

```ini
[www]
;listen.acl_users = apache,nginx
```

<br>

### listen.allowed_clients

受信するインバウンド通信のIPアドレスを設定する。

```ini
[www]
listen.allowed_clients = 127.0.0.1
```

<br>

### listen.group

プロセスの所有グループ名を設定する。

```ini
[www]
listen.group = www-data
```

<br>

### listen.mode

プロセスの実行権限を設定する。

```ini
[www]
listen.mode = 0660
```

<br>

### listen.owner

プロセスの所有ユーザー名を設定する。

```ini
[www]
listen.owner = www-data
```

<br>

### php_admin_flag

#### ▼ php_admin_flagとは

Apacheでのみ使用できる。

PHPの`ini`ファイルで設定されたbool値のオプションを上書きし、他から上書きされないようにする。

全てのオプションを上書きできるわけでなく、オプションごとの変更モードによる。

> ↪️：
>
> - https://ma.ttias.be/php-php_value-vs-php_admin_value-and-the-use-of-php_flag-explained/#php_admin_flag
> - https://www.php.net/manual/en/ini.list.php

#### ▼ php_admin_flag[log_errors]

```ini
[www]
php_admin_flag[log_errors] = on
```

<br>

### php_admin_value

#### ▼ php_admin_valueとは

Apacheでのみ使用できる。

PHPの`ini`ファイルで設定されたbool値以外のオプションを上書きし、他から上書きされないようにする。

全てのオプションを上書きできるわけでなく、オプションごとの変更モードによる。

> ↪️：
>
> - https://ma.ttias.be/php-php_value-vs-php_admin_value-and-the-use-of-php_flag-explained/#php_admin_value
> - https://www.php.net/manual/en/ini.list.php

#### ▼ php_admin_value[error_log]

エラーログの出力先を設定する。開発環境ではエラーログファイル (`/var/log/php-fpm/www-error.log`) に出力し、本番環境では標準エラー出力に出力すると良い。

```ini
[www]
php_admin_value[error_log] = /dev/stderr
```

<br>

### php_flag

#### ▼ php_flagとは

PHPの`ini`ファイルで設定されたbool値のオプションを上書きする。

全てのオプションを上書きできるわけでなく、オプションごとの変更モードによる。

> ↪️：
>
> - https://ma.ttias.be/php-php_value-vs-php_admin_value-and-the-use-of-php_flag-explained/#php_flag
> - https://www.php.net/manual/en/ini.list.php

#### ▼ php_value[display_errors]

Webページ上にエラーを表示するか否かを設定する。

```ini
[www]
php_flag[display_errors] = off
```

<br>

### php_value

#### ▼ php_valueとは

PHPの`ini`ファイルで設定されたbool値以外のオプションを上書きする。

全てのオプションを上書きできるわけでなく、オプションごとの変更モードによる。

> ↪️：
>
> - https://ma.ttias.be/php-php_value-vs-php_admin_value-and-the-use-of-php_flag-explained/#php_value
> - https://www.php.net/manual/en/ini.list.php

#### ▼ php_value[session.save_handler]

セッションの保存形式を設定する。

デフォルト値は`files`形式でサーバー内に保存する。

`redis`レコード形式でセッションDB (例：PHP Redis、ElastiCache Redisなど) に保存するように設定もできる。

> - https://zapanet.info/blog/item/3364

```ini
[www]
php_value[session.save_handler] = redis
```

#### ▼ php_value[session.save_path]

セッションの保存場所のディレクトリを設定する。

保存形式に`redis`を設定した場合には、Redisのエンドポイントを設定できる。

デフォルト値は`/var/lib/php/session`ディレクトリである。

> - https://zapanet.info/blog/item/3364

```ini
[www]
php_value[session.save_path] = "tcp://foo-redis.*****.ng.0001.apne1.cache.amazonaws.com:6379"
```

#### ▼ php_value[soap.wsdl_cache_dir]

```ini
[www]
php_value[soap.wsdl_cache_dir] = /var/lib/php/wsdlcache
```

<br>

### pm

子プロセス数の増減タイプを設定する。

`static`の場合は、リクエスト数によらず一定数の子プロセスをメモリに割り当て、`dynamic`の場合はリクエスト数によって子プロセスを増減させる。

> - https://life.iua.jp/?p=230

```ini
[www]
pm = dynamic
```

<br>

### pm.max_children

子プロセスの最大数を設定する。

子プロセスの最大数は、同時に処理できるリクエストの最大数に相当する。

> - https://life.iua.jp/?p=230

```ini
[www]
pm.max_children = 50
```

<br>

### pm.max_spare_servers

アイドル状態にしておく子プロセスの最大数を設定する。

> - https://life.iua.jp/?p=230

```ini
[www]
pm.max_spare_servers = 35
```

<br>

### pm.min_spare_servers

アイドル状態にしておく子プロセスの最小数を設定する。

> - https://life.iua.jp/?p=230

```ini
[www]
pm.min_spare_servers = 5
```

<br>

### pm.start_servers

PHP-FPM起動時の子プロセス数を設定する。

> - https://life.iua.jp/?p=230

```ini
[www]
pm.start_servers = 5
```

<br>

### slowlog

システムログの出力先を設定する。

```ini
[www]
slowlog = /var/log/php-fpm/www-slow.log
```

<br>

### user

プロセスの実行ユーザー名を設定する。

```ini
[www]
user = www-data
```

<br>
