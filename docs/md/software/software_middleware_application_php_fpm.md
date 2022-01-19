# PHP-FPM：PHP FastCGI Process Manager

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## 01. PHP-FPM

### PHP-FPMとは

![php-fpm](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/php-fpm.png)

PHPのために実装されたFastCGIのこと．WebサーバーとPHPファイルの間でデータ通信を行う．PHP-FPMとPHPのプロセスは独立している．そのため，設定値を別々に設定する必要がある．例えば，ログの出力先はそれぞれ個別に設定する必要がある．

参考：

- https://developpaper.com/shared-cgi-fastcgi-and-php-fpm-1/
- https://hiroki-it.github.io/tech-notebook-mkdocs/md/software/software_application_object_oriented_language_php_framework_laravel_component.html

<br>

### CGI

#### ・CGIとは

![CGIの仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/CGIの仕組み.png)

#### ・FastCGI：Fast Common Gateway Interface

CGIプロトコルのパフォーマンスを向上させたプロトコル仕様のこと．

<br>

## 02. セットアップ

### インストール

#### ・apt-get経由

```bash
$ apt-get install php-fpm

# またはこちら
$ apt install php-fpm
```

<br>

### 設定ファイル

#### ・```/usr/local/etc/php-fpm.d/www.conf```ファイル

PHP-FPMのログ以外の項目を設定する．PHP-FPM@Dockerでは，```/usr/local/etc/php-fpm.d```ディレクトリ以下に配置されている．```php.ini```ファイルによって読み込まれる．```php.ini```ファイルよりも優先されるので，設定項目が重複している場合は，こちらを変更する．Nginxからインバウンド通信を受信する場合，```/usr/local/etc/php-fpm.d/www.conf```ファイルと```/etc/nginx/nginx.conf```ファイルの両方で，プロセスのユーザ名を『```www-data```』とする必要がある．『```www-data```』はApacheプロセスのユーザ名のデフォルト値である．

参考：https://www.php.net/manual/ja/install.unix.nginx.php

**＊実装例＊**

```bash
[www]

# プロセスのユーザ名，グループ名
user = www-data
group = www-data

# UNIXドメインソケットを用いるために，sockファイルを指定
listen = /var/run/php-fpm/php-fpm.sock # 127.0.0.1:9000

# UNIXドメインソケットを用いるために，プロセスのユーザ名を変更
listen.owner = www-data
listen.group = www-data

listen.mode = 0660

# コメントアウト推奨 
;listen.acl_users = apache,nginx

# TCPソケットのIPアドレス
listen.allowed_clients = 127.0.0.1

pm = dynamic

pm.max_children = 50

pm.start_servers = 5

pm.min_spare_servers = 5

pm.max_spare_servers = 35

# システムログファイルの場所
slowlog = /var/log/php-fpm/www-slow.log

# エラーログファイルの場所
# 開発環境では，エラーログファイル（/var/log/php-fpm/www-error.log）に出力
php_admin_value[error_log] = /dev/stderr

php_admin_flag[log_errors] = on

# セッションの保存方法．ここではredisのキーとして保存（デフォルト値はfiles）
php_value[session.save_handler] = redis

# セッションの保存場所（デフォルト値は，/var/lib/php/session）
php_value[session.save_path] = "tcp://foo-redis.*****.ng.0001.apne1.cache.amazonaws.com:6379"

php_value[soap.wsdl_cache_dir] = /var/lib/php/wsdlcache
```

PHP-FPMベースイメージには```zz-docker.conf ```ファイルが組み込まれており，このファイルにはPHP-FPMの一部の設定が実装されている．これに後勝ちするために，ホストでは```www.conf```ファイルとして定義しておき，コンテナ側にコピーする時は```zzz-www.conf```ファイルとする．

参考：https://kengotakimoto.com/docker-laravel/#toc8

```dockerfile
COPY ./php-fpm.d/www.conf /usr/local/etc/php-fpm.d/zzz-www.conf
```

#### ・```/usr/local/etc/php-fpm.d/docker.conf```ファイル

PHP-FPMの特にログ項目を設定する．PHP-FPM@Dockerでは，```/usr/local/etc/php-fpm.d```以下に配置されている．

```bash
[global]
error_log = /proc/self/fd/2 # /dev/stderr（標準エラー出力）へのシンボリックリンクになっている．

; https://github.com/docker-library/php/pull/725#issuecomment-443540114
log_limit = 8192

[www]
; if we send this to /proc/self/fd/1, it never appears
access.log = /proc/self/fd/2 # /dev/stderr（標準エラー出力）へのシンボリックリンクになっている．

clear_env = no

; Ensure worker stdout and stderr are sent to the main error log.
catch_workers_output = yes
decorate_workers_output = no
```

<br>

## 03. ログ

### ログの種類

#### ・NOTICE

```log
[01-Sep-2021 00:00:00] NOTICE: fpm is running, pid 1
```

#### ・WARNING

```log
[01-Sep-2021 00:00:00] WARNING: [pool www] server reached pm.max_children setting (5), consider raising it
```

#### ・Fatal Error

```log
Fatal error: Allowed memory size of ***** bytes exhausted (tried to allocate 16 bytes)
```



