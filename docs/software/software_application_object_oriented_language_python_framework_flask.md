---
title: 【知見を記録するサイト】Flask
description: Flaskの知見をまとめました。
---

# Flask

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## ベストプラクティス

envファイルとFlaskの読み込みの順番がよくわからない．

参考：https://github.com/apryor6/flask_api_example



# env

参考：https://www.subarunari.com/entry/2018/05/03/Flask_1.0_%E9%9B%91%E3%83%94%E3%83%83%E3%82%AF%E3%82%A2%E3%83%83%E3%83%97

<br>

## Flaskクラス

#### ・Flaskクラスとは

アプリケーションの起動に関するメソッドを持つ．環境変数の```FLASK_APP```で指定したエントリポイントでは，必ずFlaskクラスのインスタンスを作成する必要がある．

参考：https://flask.palletsprojects.com/en/2.0.x/api/

```python
from flask import Flask

app = Flask(__name__)
```

#### ・```run```メソッド

設定されたルーティングを元に，リッスンを開始する．起動時に，```flask run```を実行する場合には，```run```メソッドの実行は不要である．

```python
from flask import Flask

PREFIX_FOO = "foo"

app = Flask(__name__)

@app.route("/{PREFIX}/show", methods=["GET"])
    def show():
        
app.run()
```



