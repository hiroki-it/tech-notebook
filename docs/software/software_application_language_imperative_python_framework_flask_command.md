---
title: 【知見を記録するサイト】コマンド＠Flask
description: コマンド＠Flaskの知見をまとめました．
---

# コマンド＠Flask

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. flaskコマンド

### flaskコマンドとは

アプリケーションを実行する．あらかじめアプリケーションのエントリーポイントを環境変数の```FLASK_APP```に設定する必要がある．

参考：https://flask.palletsprojects.com/en/2.0.x/cli/

```bash
$ export FLASK_APP=main.py
```

<br>

### route

#### ・routeとは

登録済みのルーティングの一覧を表示する．

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

#### ・オプション無し

Flaskクラスの```run```メソッドと同じ機能を持ち，インバウンド通信のリッスンを開始する．開発環境のみで推奨される方法である．

```bash
$ flask run
```

参考：

- https://www.twilio.com/blog/how-to-run-a-flask-application-jp
- https://msiz07-flask-docs-ja.readthedocs.io/ja/latest/cli.html

#### ・--host

受信するインバウンド通信のIPアドレスを設定する．

```bash
$ flask run --host=0.0.0.0
```

#### ・--port

インバウンド通信を待ち受けるポート番号を設定する．

```bash
$ flask run --port=8080
```
