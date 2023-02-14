---
title: 【IT技術の知見】コンポーネント＠Flask
description: コンポーネント＠Flaskの知見を記録しています。
---

# コンポーネント＠Flask

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. App

### Flaskクラス

#### ▼ Flaskクラスとは

WSGIアプリケーションの実行に関するメソッドを持つ。

クラスの引数に、グローバル変数の『```__name__```』あるいはエントリーポイントのパスを直接的に設定する。

環境変数の```FLASK_APP```で指定したエントリーポイントでは、必ずFlaskクラスのインスタンスを作成する必要がある。



> ↪️ 参考：https://flask.palletsprojects.com/Ien/2.0.x/api/

```python
from flask import Flask

app = Flask(__name__)

# src/app.py 
# app = Flask(src)
```

<br>

### ```route```メソッド

#### ▼ ```route```メソッド

Flaskクラスにエンドポイントを追加する。



```python
from flask import Flask

app = Flask(__name__)

PREFIX_FOO = "foo"
@app.route("/{PREFIX}/show", methods=["GET"])
    def show():
        # DBへのアクセス処理

...
```

<br>

### ```run```メソッド

#### ▼ ```run```メソッドとは

設定されたルーティングを元に、Werkzeugによるwebサーバーを起動する。

開発環境のみで推奨される方法である。



> ↪️ 参考：https://flask.palletsprojects.com/en/2.0.x/api/#flask.Flask.run

```python
from flask import Flask

app = Flask(__name__)

PREFIX_FOO = "foo"
@app.route("/{PREFIX}/show", methods=["GET"])
    def show():
        # DBへのアクセス処理
        
app.run()
```

#### ▼ 引数

> ↪️ 参考：
>
> - https://www.twilio.com/blog/how-to-run-a-flask-application-jp
> - https://takuma-taco.hateblo.jp/entry/2018/10/01/181513

| 引数               | 説明                                                                        |
|--------------------|---------------------------------------------------------------------------|
| ```debug```        | エラーログをブラウザ上に表示するか否かを設定する。                                             |
| ```host```         | 受信するインバウンド通信のIPアドレスを設定する。全てのIPアドレスの場合は、```0.0.0.0```とする。           |
| ```load_dotenv```  | ```dotenv```パッケージを読み込むか否かを設定する。これを有効化すれば、他の引数は環境変数から設定できる。 |
| ```port```         | インバウンド通信を待ち受けるポート番号を設定する。                                           |
| ```use_reloader``` | ホットリロードを有効化するか否かを設定する。                                                |

<br>

## 02. 環境変数

### App

#### ▼ FLASK_APP

アプリケーションのエントリーポイントを設定する。




| ```FLASK_APP```の値      | 説明                             |
|-------------------------|--------------------------------|
| ```module:name```       | モジュール名 (ファイル名) とインスタンス名を設定する。 |
| ```module:function()``` | モジュール名 (ファイル名) と関数名を設定する。   |
| ```module```            | モジュール名 (ファイル名) を設定する。          |
| ```file.py```           | ファイル名を設定する。                   |

> ↪️ 参考：https://www.twilio.com/blog/how-to-run-a-flask-application-jp

<br>

## 03. ベストプラクティス

### アプリケーションファクトリーパターン

#### ▼ アプリケーションファクトリーパターンとは

Pythonのコードを配置するディレクトリに```__init__.py```ファイルを配置し、ここでFlaskクラスのインスタンスを作成するメソッドを定義する。



> ↪️ 参考：
>
> - https://flask.palletsprojects.com/en/2.0.x/patterns/appfactories/
> - https://github.com/apryor6/flask_api_example/blob/master/app/__init__.py
> - https://prettyprinted.com/tutorials/automatically_load_environment_variables_in_flask

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

#### ▼ エントリーポイント

プロジェクトのルートディレクトリに、```create_app```メソッドを実行するエントリーポイント (例：```main.py```ファイル) を配置する。

名前空間を判定する条件分の外で```create_app```メソッドを実行しないと、uwsgiがapp変数を見つけられない。



> ↪️ 参考：https://stackoverflow.com/questions/13751277/how-can-i-use-an-app-factory-in-flask-wsgi-servers-and-why-might-it-be-unsafe

```python
from src import create_app

app = create_app()

if __name__ == '__main__':
    app.run()
```

#### ▼ 開発環境と本番環境の違い

本番環境では、アプリケーションの実行に```run```関数と```flask run```コマンドを使用しないようにする。

代わりとして、uWSGIやgunicornを使用して、エントリーポイントの関数を直接的にコールする。

本番環境と開発環境を同様にするために、本番環境のみでなく開発環境でもコマンドを使用しないようにしても良い。



> ↪️ 参考：
>
> - https://msiz07-flask-docs-ja.readthedocs.io/ja/latest/tutorial/deploy.html
> - https://serip39.hatenablog.com/entry/2020/07/06/070000

