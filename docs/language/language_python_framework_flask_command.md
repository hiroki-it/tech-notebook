---
title: 【IT技術の知見】コマンド＠Flask
description: コマンド＠Flaskの知見を記録しています。
---

# コマンド＠Flask

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. flaskコマンド

### flaskコマンドとは

アプリケーションを実行する。

あらかじめアプリケーションのエントリーポイントを環境変数の`FLASK_APP`に設定する必要がある。

```bash
$ export FLASK_APP=main.py
```

> ↪️ 参考：https://flask.palletsprojects.com/en/2.0.x/cli/

<br>

### route

#### ▼ routeとは

登録済みのルーティングの一覧を取得する。

```bash
$ flask routes

Endpoint        Methods  Rule
--------------  -------  -----------------------
index_foo       GET      /foos/
create_foo      POST     /foo/
static          GET      /static/<path:filename>
```

<br>

### run

#### ▼ runとは

Flaskクラスの`run`メソッドと同じ機能を持ち、インバウンド通信のリッスンを開始する。

開発環境のみで推奨される方法である。

```bash
$ flask run
```

> ↪️ 参考：
>
> - https://www.twilio.com/blog/how-to-run-a-flask-application-jp
> - https://msiz07-flask-docs-ja.readthedocs.io/ja/latest/cli.html

#### ▼ --host

受信するインバウンド通信のIPアドレスを設定する。

```bash
$ flask run --host=0.0.0.0
```

#### ▼ --reload

アプリケーションのホットリロードを有効化するか否かを設定する。

```bash
$ flask run --reload
```

> ↪️ 参考：https://www.subarunari.com/entry/2018/03/10/%E3%81%84%E3%81%BE%E3%81%95%E3%82%89%E3%81%AA%E3%81%8C%E3%82%89_Flask_%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6%E3%81%BE%E3%81%A8%E3%82%81%E3%82%8B_%E3%80%9CDebugger%E3%80%9C

#### ▼ --port

インバウンド通信を待ち受けるポート番号を設定する。

```bash
$ flask run --port=8080
```

Flaskが以前のプロセスを削除できなかった場合は、ポートが使用されてしまっているため、プロセスを削除する必要がある。

```bash
OSError: [Errno 98] Address already in use
```

```bash
$ ps -fA | grep python
root          29       9  0 Feb21 pts/0    00:00:00 /usr/local/bin/python /usr/local/bin/flask run --reload
root          69      29 82 09:47 pts/0    00:03:34 /usr/local/bin/python /usr/local/bin/flask run --reload
root         397      60  0 09:51 pts/1    00:00:00 grep python
```

<br>
