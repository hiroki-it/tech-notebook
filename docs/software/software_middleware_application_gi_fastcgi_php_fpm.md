---
title: 【知見を記録するサイト】PHP-FPM：PHP FastCGI Process Manager＠ミドルウェア
description: PHP-FPM：PHP FastCGI Process Manager＠ミドルウェアの知見をまとめました．
---

# PHP-FPM：PHP FastCGI Process Manager＠ミドルウェア

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. PHP-FPMの仕組み

### 構造

PHP-FPMは，Server API，Zend Engine，から構成される．

参考：https://qiita.com/taichitk/items/5cf2e6778f1209620e72#php-fpm%E3%81%AE%E5%9F%BA%E6%9C%AC%E7%9F%A5%E8%AD%98

![php-fpm_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/php-fpm_architecture.png)

<br>

### プロセスプール

PHP-FPMでは，リクエストのたびにプロセスを起動するわけでなく，あらかじめ複数のプロセスを起動している．そして，リクエストを受信するたびに，プロセスを割り当てている．あらかじめ準備されたプロセス群を『プール』という．

参考：https://hackers-high.com/linux/php-fpm-config/#php-fpm

<br>

## 01-02. ユースケース

### FastCGIとして

![php-fpm_fastcgi](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/php-fpm_fastcgi.png)

PHP-FPMは，FastCGIとしてWebサーバーとPHPファイルの間でデータ通信を行う．PHP-FPMとPHPは，それぞれ独立した子プロセスとして実行されている．そのため，設定値を別々に設定する必要がある．例えば，ログの出力先はそれぞれ個別に設定する必要がある．

参考：

- https://developpaper.com/shared-cgi-fastcgi-and-php-fpm-1/
- https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_language_php_framework_laravel_component.html

<br>

## 02. セットアップ

### インストール

#### ▼ Apt経由

```bash
$ apt install php-fpm
```

#### ▼ Apt-get経由

```bash
$ apt-get install php-fpm
```

<br>

## 03. コマンド

### php-fpmコマンド

#### ▼ -t

設定ファイルを検証する．

```bash
$ php-fpm -t

[01-Jan-2022 00:00:00] NOTICE: configuration file /etc/php-fpm.conf test is successful
```

<br>

### systemctlコマンドによる操作

#### ▼ status

PHP-FPMのプロセスが正常に実行中であることを確認する．プロセスがプールとして準備されていることも確認できる．

```bash
$ systemctl status php-fpm.service

● php-fpm.service - The PHP FastCGI Process Manager
   Loaded: loaded (/usr/lib/systemd/system/php-fpm.service; enabled; vendor preset: disabled)
   Active: active (running) since Fri 2021-03-12 13:16:54 JST; 11 months 8 days ago
  Process: 7507 ExecReload=/bin/kill -USR2 $MAINPID (code=exited, status=0/SUCCESS)
 Main PID: 6903 (php-fpm)
   Status: "Processes active: 0, idle: 35, Requests: 315161, slow: 0, Traffic: 0req/sec"
   Memory: 1.3G
   CGroup: /system.slice/php-fpm.service
           ├─ 6903 php-fpm: master process (/etc/php-fpm.conf)
           ├─29280 php-fpm: pool www
           ├─29281 php-fpm: pool www
           ├─29282 php-fpm: pool www
           ...
```

<br>

## 03. 設定ファイル（※ Dockerの場合）

### ```/usr/local/etc/php-fpm.conf```ファイル

#### ▼ ```php-fpm.conf```ファイルとは

PHP-FPMの全てのプロセスを設定する．設定ファイルを切り分ける場合，```/etc/php-fpm.d```ディレクトリ配下に```<実行ユーザー名>.conf```ファイルの名前で配置する．PHP-FPMの仕様として，異なる```.conf```ファイルで同じプールで同じオプションを設定した場合は，後ろにくる名前のファイルの設定が優先されるようになっている．そのため，同じプールの設定を異なる```.conf```ファイルに分割する場合に，同じオプションを設定しないように注意する．

参考：https://yoshinorin.net/2017/03/06/php-official-docker-image-trap/

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

; 同じプールの設定を異なるファイルに分割する場合は注意が必要である．
; See /etc/php-fpm.d/*.conf
```

<br>

### ```/usr/local/etc/php-fpm.d/www.conf```ファイル

#### ▼ ```www.conf```ファイルとは

PHP-FPMの```www```プロセスのプールを設定する．```www.conf```ファイルは，```/usr/local/etc/php-fpm.d```ディレクトリ配下に配置されている．```php.ini```ファイルによって読み込まれ，```php.ini```ファイルよりも優先されるので，設定項目が重複している場合は，こちらを変更する．NginxからPHP-FPMにインバウンド通信をルーティングする場合，Nginxの設定ファイル（```/etc/nginx/nginx.conf```ファイル）とPHP-FPMの設定ファイル（```/usr/local/etc/php-fpm.d/www.conf```ファイル）の両方で，プロセスのユーザー名を『```www-data```』とする必要がある．ちなみに，『```www-data```』はApacheプロセスのユーザー名のデフォルト値である．

参考：

- https://www.php.net/manual/ja/install.fpm.configuration.php
- https://yoshinorin.net/2017/03/06/php-official-docker-image-trap/

#### ▼ ```zz-docker.conf ```ファイルについて

PHP-FPMのベースイメージには```zz-docker.conf ```ファイルが組み込まれており，このファイルにはPHP-FPMの一部の設定が実装されている．PHP-FPMの仕様では，同じプールに同じオプションを設定した場合は，名前が後ろに来るファイルの設定が優先されるため，デフォルトのベースイメージでは```zz-docker.conf```ファイルの設定が最優先になっている．このファイルに後勝ちできるように，ホストでは```www.conf```ファイルとして定義しておき，コンテナ側にコピーする時は```zzz-www.conf```ファイルとする．

参考：

- https://kengotakimoto.com/docker-laravel/#toc8
- https://github.com/usabilla/php-docker-template/blob/master/src/php/fpm/conf/zz-docker.conf.template

```dockerfile
COPY ./php-fpm.d/www.conf /usr/local/etc/php-fpm.d/zzz-www.conf
```

<br>

### ```/usr/local/etc/php-fpm.d/docker.conf```ファイル

#### ▼ ```docker.conf```ファイルとは

PHP-FPMをDockerで稼働させるために必要な項目を設定する．ファイルは，```/usr/local/etc/php-fpm.d```ディレクトリ配下に配置されている．

```ini
[global]
; /dev/stderr（標準エラー出力）へのシンボリックリンクになっている．
error_log = /proc/self/fd/2

; https://github.com/docker-library/php/pull/725#issuecomment-443540114
log_limit = 8192

[www]
; if we send this to /proc/self/fd/1, it never appears
; /dev/stderr（標準エラー出力）へのシンボリックリンクになっている．
access.log = /proc/self/fd/2

clear_env = no

; Ensure worker stdout and stderr are sent to the main error log.
catch_workers_output = yes
decorate_workers_output = no
```

<br>

## 04. globalセクション

### error_log

標準エラー出力の出力先のファイルを設定する．

```ini
[global]
error_log = /var/log/php-fpm/error.log
```

<br>

### pid

PIDの出力先のファイルを設定する．

```ini
[global]
pid = /run/php-fpm/php-fpm.pid
```

<br>

## 05. wwwセクション

### wwwセクションとは

PHP-FPMの```www```プロセスのプールを設定する．

参考：

- https://www.php.net/manual/ja/install.fpm.configuration.php
- https://hackers-high.com/linux/php-fpm-config/

<br>

### clear_env

デフォルトでは，環境変数の衝突や悪意ある注入を防ぐために，最初にプール内の環境変数を全て削除している．これにより，設定ファイルに環境変数を出力できないようになっている．この最初の削除処理を無効化する．

参考：https://takapi86.hatenablog.com/entry/2019/07/29/225558

```ini
[www]
clear_env = no
```

<br>

### env

プロセスのプール内に出力する環境変数を設定する．この環境変数はPHPのプロセスで定義された環境変数ではないため，```php```コマンドを直接実行しても確認できないことに注意する．

```ini
[www]
env[FOO] = foo
```

```bash
$ php -r 'echo $FOO;' # プロセスが異なるため，何も出力されない．
```



<br>

### group

プロセスの実行グループ名を設定する．

```ini
[www]
group = www-data
```

<br>

### listen

生成されたUNIXドメインソケットファイルの場所を設定する．

```ini
[www]
listen = /var/run/php-fpm/php-fpm.sock
```

<br>

### listen.acl_users

コメントアウトが推奨である．代わりに，```listen.owner```と```listen.group```を設定する．

```ini
[www]
;listen.acl_users = apache,nginx
```

<br>

### listen.allowed_clients

受信するインバウンド通信のIPアドレスを設定する．

```ini
[www]
listen.allowed_clients = 127.0.0.1
```

<br>

### listen.group

プロセスの所有グループ名を設定する．

```ini
[www]
listen.group = www-data
```

<br>

### listen.mode

プロセスの実行権限を設定する．

```ini
[www]
listen.mode = 0660
```

<br>

### listen.owner

プロセスの所有ユーザー名を設定する．

```ini
[www]
listen.owner = www-data
```

<br>

### php_admin_flag

#### ▼ php_admin_flagとは

Apacheでのみ使用できる．PHPの```ini```ファイルで設定された真偽値のオプションを上書きし，他から上書きされないようにする．全てのオプションを上書きできるわけでなく，オプションごとの変更モードによる．

参考：

- https://ma.ttias.be/php-php_value-vs-php_admin_value-and-the-use-of-php_flag-explained/#php_admin_flag
- https://www.php.net/manual/en/ini.list.php

#### ▼ php_admin_flag[log_errors]

```ini
[www]
php_admin_flag[log_errors] = on
```

<br>

### php_admin_value

#### ▼ php_admin_valueとは

Apacheでのみ使用できる．PHPの```ini```ファイルで設定された真偽値以外のオプションを上書きし，他から上書きされないようにする．全てのオプションを上書きできるわけでなく，オプションごとの変更モードによる．

参考：

- https://ma.ttias.be/php-php_value-vs-php_admin_value-and-the-use-of-php_flag-explained/#php_admin_value
- https://www.php.net/manual/en/ini.list.php

#### ▼ php_admin_value[error_log]

エラーログの出力先を設定する．開発環境ではエラーログファイル（```/var/log/php-fpm/www-error.log```）に出力し，本番環境では標準エラー出力に出力するとよい．

```ini
[www]
php_admin_value[error_log] = /dev/stderr
```

<br>

### php_flag

#### ▼ php_flagとは

PHPの```ini```ファイルで設定された真偽値のオプションを上書きする．全てのオプションを上書きできるわけでなく，オプションごとの変更モードによる．

参考：

- https://ma.ttias.be/php-php_value-vs-php_admin_value-and-the-use-of-php_flag-explained/#php_flag
- https://www.php.net/manual/en/ini.list.php

#### ▼ php_value[display_errors]

Webページ上にエラーを表示するかどうかを設定する．

```ini
[www]
php_flag[display_errors] = off
```

<br>

### php_value

#### ▼ php_valueとは

PHPの```ini```ファイルで設定された真偽値以外のオプションを上書きする．全てのオプションを上書きできるわけでなく，オプションごとの変更モードによる．

参考：

- https://ma.ttias.be/php-php_value-vs-php_admin_value-and-the-use-of-php_flag-explained/#php_value
- https://www.php.net/manual/en/ini.list.php

#### ▼ php_value[session.save_handler]

セッションの保存形式を設定する．デフォルト値は```files```形式でサーバー内に保存する．```redis```レコード形式でセッションDB（PHP Redis，ElastiCache Redisなど）に保存するように設定することもできる．

参考：https://zapanet.info/blog/item/3364

```ini
[www]
php_value[session.save_handler] = redis
```

<br>

#### ▼ php_value[session.save_path]

セッションの保存場所のディレクトリを設定する．保存形式に```redis```を設定した場合には，Redisのエンドポイントを設定できる．デフォルト値は```/var/lib/php/session```ディレクトリである．

参考：https://zapanet.info/blog/item/3364

```ini
[www]
php_value[session.save_path] = "tcp://foo-redis.*****.ng.0001.apne1.cache.amazonaws.com:6379"
```

<br>

#### ▼ php_value[soap.wsdl_cache_dir]

```ini
[www]
php_value[soap.wsdl_cache_dir] = /var/lib/php/wsdlcache
```

<br>

### pm

子プロセス数の増減タイプを設定する．```static```の場合は，リクエスト数によらず一定数の子プロセスをメモリに割り当て，```dynamic```の場合はリクエスト数によって子プロセスを増減させる．

参考：https://life.iua.jp/?p=230

```ini
[www]
pm = dynamic
```

<br>

### pm.max_children

子プロセスの最大数を設定する．子プロセスの最大数は，同時に処理可能なリクエストの最大数に相当する．

参考：

- https://life.iua.jp/?p=230
- https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_basic_kernel_memory_management.html

```ini
[www]
pm.max_children = 50
```

<br>

### pm.max_spare_servers

アイドル状態にしておく子プロセスの最大数を設定する．

参考：https://life.iua.jp/?p=230

```ini
[www]
pm.max_spare_servers = 35
```

<br>

### pm.min_spare_servers

アイドル状態にしておく子プロセスの最小数を設定する．

参考：https://life.iua.jp/?p=230

```ini
[www]
pm.min_spare_servers = 5
```

<br>

### pm.start_servers

PHP-FPM起動時の子プロセス数を設定する．

参考：https://life.iua.jp/?p=230

```ini
[www]
pm.start_servers = 5
```

<br>

### slowlog

システムログの出力先を設定する．

```ini
[www]
slowlog = /var/log/php-fpm/www-slow.log
```

<br>

### user

プロセスの実行ユーザー名を設定する．

```ini
[www]
user = www-data
```

<br>

## 05. ログ

### ログの種類

#### ▼ NOTICE

```log
[01-Sep-2021 00:00:00] NOTICE: fpm is running, pid 1
```

#### ▼ WARNING

```log
[01-Sep-2021 00:00:00] WARNING: [pool www] server reached pm.max_children setting (5), consider raising it
```

#### ▼ Fatal Error

```log
Fatal error: Allowed memory size of ***** bytes exhausted (tried to allocate 16 bytes)
```



