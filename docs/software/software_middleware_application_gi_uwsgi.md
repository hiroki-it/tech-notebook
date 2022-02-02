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
- https://www.python.ambitious-engineer.com/archives/1959

```bash
[uwsgi]
# エントリーポイント
# 参考：https://django.kurodigi.com/uwsgi-basic/
wsgi-file = main.py

# Flaskクラスのインスタンスの変数名（デフォルト値：application）
# 参考：https://laplace-daemon.com/nginx-uwsgi-flask/
callable = app

master = true

processes = 1

# HTTPプロトコルを用いる場合 
http = 0.0.0.0:8080

# UNIXドメインソケットを用いる場合
# <ソケットファイルの配置場所>:<ルーティング先ポート番号>
# https://qiita.com/koyoru1214/items/57461b920dfc11f67683
socket = /etc/uwsgi/uwsgi.sock:8080
# UNIXドメインソケットファイルの権限
chmod-socket = 666

# ログの出力先
logto = /dev/stdout

vacuum = true

die-on-term = true

py-autoreload = 1
```

