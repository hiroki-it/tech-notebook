---
title: 【IT技術の知見】設定ファイル＠uWSGI
description: 設定ファイル＠uWSGIの知見を記録しています。
---

# 設定ファイル＠uWSGI

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ

### インストール

#### ▼ pipリポジトリから

```bash
$ pip3 install uwsgi
```

<br>

## 02. 設定ファイルの種類

### ```uwsgi.ini```ファイル

#### ▼ ```uwsgi.ini```ファイルとは

uWSGIの起動時の値を設定する。```.json```形式やXML形式でも問題ない。

> ℹ️ 参考：

> - https://uwsgijapanese.readthedocs.io/ja/latest/Options.html
> - https://qiita.com/11ohina017/items/da2ae5b039257752e558

#### ▼ 起動ログ

起動時に、以下のようなログが出力される。

```bash
[uWSGI] getting INI configuration from /etc/wsgi/wsgi.ini

*** Starting uWSGI 2.0.20 (64bit) on [Fri Feb 4 09:18:22 2022] ***
compiled with version: 10.2.1 20210110 on 31 January 2022 23:57:07
os: Linux-4.19.202 #1 SMP Wed Oct 27 22:52:27 UTC 2021
nodename: customer-flask-pod
machine: x86_64
clock source: unix
detected number of CPU cores: 4
current working directory: /var/www/customer
detected binary path: /usr/local/bin/uwsgi
!!! no internal routing support, rebuild with pcre support !!!
uWSGI running as root, you can use --uid/--gid/--chroot options

*** WARNING: you are running uWSGI as root !!! (use the --uid flag) ***
your memory page size is 4096 bytes
detected max file descriptor number: 1048576
lock engine: pthread robust mutexes
thunder lock: disabled (you can enable it with --thunder-lock)
uWSGI http bound on 0.0.0.0:8080 fd 4
uwsgi socket 0 bound to TCP address 127.0.0.1:40133 (port auto-assigned) fd 3
uWSGI running as root, you can use --uid/--gid/--chroot options

*** WARNING: you are running uWSGI as root !!! (use the --uid flag) ***
Python version: 3.10.2 (main, Jan 29 2022, 02:55:36) [GCC 10.2.1 20210110]

*** Python threads support is disabled. You can enable it with --enable-threads ***
Python main interpreter initialized at 0x55c3167f7230
uWSGI running as root, you can use --uid/--gid/--chroot options

*** WARNING: you are running uWSGI as root !!! (use the --uid flag) ***
your server socket listen backlog is limited to 100 connections
your mercy for graceful operations on workers is 60 seconds
mapped 145808 bytes (142 KB) for 1 cores

*** Operational MODE: single process ***
WSGI app 0 (mountpoint='') ready in 1 seconds on interpreter 0x55c3167f7230 pid: 1 (default app)
uWSGI running as root, you can use --uid/--gid/--chroot options

*** WARNING: you are running uWSGI as root !!! (use the --uid flag) ***

*** uWSGI is running in multiple interpreter mode ***
spawned uWSGI master process (pid: 1)
spawned uWSGI worker 1 (pid: 9, cores: 1)
spawned uWSGI http 1 (pid: 10)
```

<br>

## 04. uwsgiセクション

### uwsgiセクションとは

uWSGIの```uwsgi```プロセスのプールを設定する。

<br>

### callable

 アプリケーションのインスタンスの変数名を設定する。デフォルト値は、```application```である。

> ℹ️ 参考：

> - https://laplace-daemon.com/nginx-uwsgi-flask/
> - https://uwsgijapanese.readthedocs.io/ja/latest/Options.html#callable

```ini
[uwsgi]
callable = app
```

<br>

### chdir

作業ディレクトリから移動する。

> ℹ️ 参考：https://uwsgijapanese.readthedocs.io/ja/latest/Options.html#chdir

```ini
[uwsgi]
chdir=/var/www/foo
```

<br>

### chmod-socket

UNIXドメインソケットファイルの権限を設定する。

> ℹ️ 参考：https://uwsgijapanese.readthedocs.io/ja/latest/Options.html#chmod-socket

```ini
[uwsgi]
chmod-socket = 666
```

<br>

### die-on-term

> ℹ️ 参考：https://uwsgijapanese.readthedocs.io/ja/latest/Options.html#die-on-term

```ini
[uwsgi]
die-on-term = true
```

<br>

### http

HTTPプロトコルを使用する場合、受信するインバウンド通信のIPアドレスと、インバウンド通信を待ち受けるポート番号を設定する。Pythonアプリケーションをフレームワークで開発している場合は、フレームワークのデフォルトのポート番号を指定する。

> ℹ️ 参考：https://uwsgijapanese.readthedocs.io/ja/latest/Options.html#http

```ini
[uwsgi]
http = 0.0.0.0:5000
```

<br>

### logto

ログの出力先を設定する。

> ℹ️ 参考：https://uwsgijapanese.readthedocs.io/ja/latest/Options.html#logto

```ini
[uwsgi]
logto = /dev/stdout
```

<br>

### master

マスターモードで起動するか否かを設定する。

> ℹ️ 参考：https://uwsgijapanese.readthedocs.io/ja/latest/Options.html#master

```ini
[uwsgi]
master = true
```

<br>

### module、wsgi

Pythonでアプリケーションファクトリーパターンを採用している場合、エントリーポイントのディレクトリ名とファクトリーメソッド名を設定する。

> ℹ️ 参考：https://uwsgijapanese.readthedocs.io/ja/latest/Options.html#module-wsgi

```ini
[uwsgi]
module = src:create_app()
```

<br>

### processes

> ℹ️ 参考：https://uwsgijapanese.readthedocs.io/ja/latest/Options.html#processes

```ini
[uwsgi]
processes = 1
```

<br>

### py-autoreload

> ℹ️ 参考：https://uwsgijapanese.readthedocs.io/ja/latest/Options.html#py-autoreload

```ini
[uwsgi]
py-autoreload = 1
```

<br>

### python-path

アプリケーションのあるディレクトリを設定する。

> ℹ️ 参考：https://uwsgijapanese.readthedocs.io/ja/latest/Options.html#python-path

```ini
[uwsgi]
python-path = /var/www/foo
```

<br>

### socket

UNIXドメインソケットを使用する場合、ソケットファイルの作成場所と、インバウンド通信を待ち受けるポート番号を設定する。Pythonアプリケーションをフレームワークで開発している場合は、フレームワークのデフォルトのポート番号を指定する。

> ℹ️ 参考： 

> - https://uwsgijapanese.readthedocs.io/ja/latest/Options.html#socket
> - https://qiita.com/koyoru1214/items/57461b920dfc11f67683

```ini
[uwsgi]
socket = /etc/uwsgi/uwsgi.sock:5000
```

<br>

### vacuum

uwsgiプロセス終了時にソケットファイルを削除するか否かを設定する。

> ℹ️ 参考：https://uwsgijapanese.readthedocs.io/ja/latest/Options.html#vacuum

```ini
[uwsgi]
vacuum = true
```

<br>

### wsgi-file

エントリーポイントとするファイルを設定する。

> ℹ️ 参考：

> - https://uwsgijapanese.readthedocs.io/ja/latest/Options.html#wsgi-file
> - https://django.kurodigi.com/uwsgi-basic/

```ini
[uwsgi]
wsgi-file = main.py
```

<br>
