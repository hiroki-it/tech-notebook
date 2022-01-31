---
title: 【知見を記録するサイト】Flask
description: Flaskの知見をまとめました。
---

# Flask

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## App

### Flaskクラス

#### ・Flaskクラスとは

WSGIアプリケーションの実行に関するメソッドを持つ．クラスの引数に，```__name__```変数あるいはエントリポイントのパスを直接設定する．環境変数の```FLASK_APP```で指定したエントリポイントでは，必ずFlaskクラスのインスタンスを作成する必要がある．

参考：https://flask.palletsprojects.com/en/2.0.x/api/

```python
from flask import Flask

app = Flask(__name__)

# src/app.py 
# app = Flask(src)
```

<br>

### ```run```メソッド

#### ・```run```メソッド

設定されたルーティングを元に，WerkzeugによるWebサーバーを起動する．開発環境のみで推奨される方法である．

参考：https://flask.palletsprojects.com/en/2.0.x/api/#flask.Flask.run

```python
from flask import Flask

PREFIX_FOO = "foo"

app = Flask(__name__)

@app.route("/{PREFIX}/show", methods=["GET"])
    def show():
        
app.run()
```

#### ・引数

| 引数              | 説明                                                         |
| ----------------- | ------------------------------------------------------------ |
| ```host```        | 受信するインバウンド通信のIPアドレスを設定する．全てのIPアドレスの場合は，```0.0.0.0```とする． |
| ```port```        | インバウンド通信を受信するポート番号を設定する．             |
| ```debug```       | より詳細なエラーログを表示するかどうかを設定する．           |
| ```load_dotenv``` | ```dotenv```ライブラリを読み込むかどうかを設定する．これを有効化すれば，他の引数は環境変数から設定できる． |

<br>

### ```flask run```コマンド

#### ・```flask run```コマンドとは

既存の```run```コマンドに代わる新しいリッスン方法．開発環境のみで推奨される方法である．```run```メソッドとは異なり，実行前に```FLASK_APP```を環境変数に設定する必要がある．実行時に```flask run```コマンドを実行する場合には，```run```メソッドの実行は不要である．

参考：

- https://www.twilio.com/blog/how-to-run-a-flask-application-jp
- https://msiz07-flask-docs-ja.readthedocs.io/ja/latest/cli.html

<br>

### 環境変数

#### ・FLASK_APP

アプリケーションのエントリーポイントを設定する．

参考：https://www.twilio.com/blog/how-to-run-a-flask-application-jp

| ```FLASK_APP```の値     | 説明                                                   |
| ----------------------- | ------------------------------------------------------ |
| ```module:name```       | モジュール名（ファイル名）とインスタンス名を設定する． |
| ```module:function()``` | モジュール名（ファイル名）と関数名を設定する．         |
| ```module```            | モジュール名（ファイル名）を設定する．                 |
| ```file.py```           | ファイル名を設定する．                                 |

<br>

### Appのベストプラクティス

#### ・```__init__.py```ファイル

アプリケーションのルートに```__init__.py```ファイルを配置し，ここでFlaskクラスのインスタンスを作成するメソッドを定義する．また，ルーティングもここで定義する．

参考：

- https://github.com/apryor6/flask_api_example/blob/master/app/__init__.py
- https://prettyprinted.com/tutorials/automatically_load_environment_variables_in_flask

```python
# __init__.py
from flask import Flask 

def create_app():
    app = Flask(__name__)
    
    @app.route('/')
    def index():
        return 'Hello World'
    
    return app
```

#### ・開発環境と本番環境の違い

本番環境では，アプリケーションの実行に```run```コマンドと```flask run```コマンドを使用しないようにする．代わりに，uWSGIやgunicorn

参考：https://serip39.hatenablog.com/entry/2020/07/06/070000

| 項目 | 説明 |
| ---- | ---- |
|      |      |
|      |      |
|      |      |

