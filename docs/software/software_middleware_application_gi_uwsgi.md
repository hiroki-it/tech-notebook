# uWSGI＠ミドルウェア

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. uWSGI

参考：https://stackoverflow.com/questions/36475380/what-are-the-advantages-of-connecting-uwsgi-to-nginx-using-the-uwsgi-protocol

![uwsgi](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/uwsgi.png)

<br>

## 02. セットアップ

### インストール

#### ・pip経由

```bash
$ pip install uwsgi
```

<br>

### 設定ファイル

#### ・```uwsgi.ini```ファイル

参考：

- https://uwsgijapanese.readthedocs.io/ja/latest/Options.html
- https://qiita.com/11ohina017/items/da2ae5b039257752e558

```bash
[uwsgi]

# アプリケーションのインスタンスの変数名（デフォルト値：application）
# 参考：https://laplace-daemon.com/nginx-uwsgi-flask/
callable = app

# 作業ディレクトリから移動する
chdir=/var/www/foo

# UNIXドメインソケットファイルの権限
chmod-socket = 666

die-on-term = true

# HTTPプロトコルを用いる場合 
http = 0.0.0.0:8080

# ログの出力先
logto = /dev/stdout

# マスターモードで起動するかどうか
master = true

processes = 1

py-autoreload = 1

# アプリケーションのあるディレクトリ
python-path = /var/www/foo

# UNIXドメインソケットを用いる場合
# <ソケットファイルの配置場所>:<ルーティング先ポート番号>
# https://qiita.com/koyoru1214/items/57461b920dfc11f67683
socket = /etc/uwsgi/uwsgi.sock:8080

# uwsgiプロセス終了時にソケットファイルを削除するかどうか
vacuum = true


# エントリーポイントのファイル
# 参考：https://django.kurodigi.com/uwsgi-basic/
wsgi-file = main.py
```

以下のようなログになれば成功である．

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

