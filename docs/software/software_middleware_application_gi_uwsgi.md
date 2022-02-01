# uWSGI：＠ミドルウェア

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. uWSGI

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

```bash
[uwsgi]
wsgi-file = main.py
callable = app
master = true
processes = 1
socket = :3031
chmod-socket = 666
vacuum = true
die-on-term = true
py-autoreload = 1
```

