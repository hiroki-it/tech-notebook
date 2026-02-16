---
title: 【IT技術の知見】コンポーネント＠Flask
description: コンポーネント＠Flaskの知見を記録しています。
---

# コンポーネント＠Flask

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. App

### Flaskクラス

#### ▼ Flaskクラスとは

WSGIアプリケーションの実行に関する関数を持つ。

クラスの引数に、グローバル変数の『`__name__`』あるいはエントリーポイントのパスを直接的に設定する。

環境変数の `FLASK_APP` で指定したエントリーポイントでは、必ずFlaskクラスのインスタンスを作成する必要がある。

```python
from flask import Flask

app = Flask(__name__)

# src/app.py
# app = Flask(src)
```

> - https://flask.palletsprojects.com/Ien/2.0.x/api/

<br>

### `route` 関数

#### ▼ `route` 関数

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

### `run` 関数

#### ▼ `run` 関数とは

設定されたルーティングを元に、WerkzeugによるWebサーバーを起動する。

開発環境のみで推奨される方法である。

```python
from flask import Flask

app = Flask(__name__)

PREFIX_FOO = "foo"
@app.route("/{PREFIX}/show", methods=["GET"])
    def show():
        # DBへのアクセス処理

app.run()
```

> - https://flask.palletsprojects.com/en/2.0.x/api/#flask.Flask.run

#### ▼ 引数

| 引数           | 説明                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| `debug`        | エラーログをブラウザ上に表示するか否かを設定する。                                                    |
| `host`         | 受信する通信のIPアドレスを設定する。全てのIPアドレスの場合は、`0.0.0.0` とする。                      |
| `load_dotenv`  | `dotenv` パッケージを読み込むか否かを設定する。これを有効化すれば、他の引数は環境変数から設定できる。 |
| `port`         | インバウンド通信を待ち受けるポート番号を設定する。                                                    |
| `use_reloader` | ホットリロードを有効化するか否かを設定する。                                                          |

> - https://www.twilio.com/blog/how-to-run-a-flask-application-jp
> - https://takuma-taco.hateblo.jp/entry/2018/10/01/181513

<br>

## 02. 環境変数

### App

#### ▼ FLASK_APP

アプリケーションのエントリーポイントを設定する。

| `FLASK_APP` の値    | 説明                                                   |
| ------------------- | ------------------------------------------------------ |
| `module:name`       | モジュール名 (ファイル名) とインスタンス名を設定する。 |
| `module:function()` | モジュール名 (ファイル名) と関数名を設定する。         |
| `module`            | モジュール名 (ファイル名) を設定する。                 |
| `file.py`           | ファイル名を設定する。                                 |

> - https://www.twilio.com/blog/how-to-run-a-flask-application-jp

#### ▼ SESSION_COOKIE_NAME

`Cookie` ヘッダーでセッションデータ (ペイロード + タイムスタンプ + 署名) を運搬するときのキー名を設定する。

デフォルトでは、キー名は `session` になる。

```yaml
# レスポンス
200 OK
---
Set-Cookie: session=*****
```

```yaml
# リクエスト
# レスポンスのSet-Cookieヘッダーによって、Cookieヘッダーをつける必要がある
GET /foo/
---
Cookie: session=*****
```

> - https://qiita.com/showchan33/items/b714cca80985b3db2565#web%E3%82%B5%E3%83%BC%E3%83%90%E3%81%AE%E5%AE%9F%E8%A3%85%E8%B5%B7%E5%8B%95

#### ▼ SECRET_KEY

`Cookie` ヘッダーでペイロードとタイムスタンプを署名するためのキーを設定する。

> - https://qiita.com/showchan33/items/b714cca80985b3db2565#3%E3%81%A4%E7%9B%AE%E3%81%AE%E3%83%87%E3%83%BC%E3%82%BF%E3%81%AF%E7%BD%B2%E5%90%8D
> - https://flask.palletsprojects.com/en/stable/api/#flask.Flask.secret_key

<br>

## 03. ベストプラクティス

### アプリケーションファクトリーパターン

#### ▼ アプリケーションファクトリーパターンとは

Pythonのコードを配置するディレクトリに `__init__.py` ファイルを配置し、ここでFlaskクラスのインスタンスを作成する関数を定義する。

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

> - https://flask.palletsprojects.com/en/2.0.x/patterns/appfactories/
> - https://github.com/apryor6/flask_api_example/blob/master/app/__init__.py
> - https://prettyprinted.com/tutorials/automatically_load_environment_variables_in_flask

#### ▼ エントリーポイント

プロジェクトのルートディレクトリに、`create_app` 関数を実行するエントリーポイント (例：`main.py` ファイル) を配置する。

名前空間を判定する条件分の外で `create_app` 関数を実行しないと、uwsgiがapp変数を見つけられない。

```python
from src import create_app

app = create_app()

if __name__ == '__main__':
    app.run()
```

> - https://stackoverflow.com/questions/13751277/how-can-i-use-an-app-factory-in-flask-wsgi-servers-and-why-might-it-be-unsafe

#### ▼ 開発環境と本番環境の違い

本番環境では、アプリケーションの実行に `run` 関数と `flask run` コマンドを使用しないようにする。

代わりに、uWSGIやgunicornを使用して、エントリーポイントの関数を直接的にコールする。

本番環境と開発環境を同様にするために、本番環境のみでなく開発環境でもコマンドを使用しないようにしても良い。

> - https://msiz07-flask-docs-ja.readthedocs.io/ja/latest/tutorial/deploy.html
> - https://serip39.hatenablog.com/entry/2020/07/06/070000

<br>

## 04. ビルトイン関数

### requests

#### ▼ get

HTTPリクエストを送信する。

```python
from flask import Flask

app = Flask(__name__)

def getProductReviews(product_id, headers):
    for _ in range(2):
        try:
            url = reviews['name'] + "/" + reviews['endpoint'] + "/" + str(product_id)
            res = requests.get(url, headers=headers, timeout=3.0)
        except BaseException:
            res = None
    if res and res.status_code == 200:
        request_result_counter.labels(destination_app='reviews', response_code=200).inc()
        # 200ステータスの場合、そのままブラウザにレンダリングする
        return 200, res.json()
    elif res is not None and res.status_code == 403:
        request_result_counter.labels(destination_app='reviews', response_code=403).inc()
        # 403ステータスの場合、ユーザーにわかりやすいメッセージに変えて、ブラウザにレンダリングする
        return 403, {'error': 'Please sign in to view product reviews.'}
    elif res is not None and res.status_code == 503:
        request_result_counter.labels(destination_app='reviews', response_code=503).inc()
        # 503ステータスの場合、ユーザーにわかりやすいメッセージに変えて、ブラウザにレンダリングする
        return 503, res.json()
    else:
        status = res.status_code if res is not None and res.status_code else 500
        request_result_counter.labels(destination_app='reviews', response_code=status).inc()
        # 500ステータスの場合、ユーザーにわかりやすいメッセージに変えて、ブラウザにレンダリングする
        return status, {'error': 'Sorry, product reviews are currently unavailable.'}

@app.route('/')
def home():
    product_id = 0
    headers = getForwardHeaders(request)
    user = session.get('user', '')
    product = getProduct(product_id)

    # detailsサービスにリクエストを送信する
    detailsStatus, details = getProductDetails(product_id, headers)
    logging.info("[" + str(detailsStatus) + "] details response is " + str(details))

    # reviewsサービスにリクエストを送信する
    reviewsStatus, reviews = getProductReviews(product_id, headers)
    logging.info("[" + str(reviewsStatus) + "] reviews response is " + str(reviews))

    # いずれかのマイクロサービスでアクセストークンの検証が失敗し、401ステータスが返信された場合、ログアウトする
    if detailsStatus == 401 or reviewsStatus == 401:
        logging.info("[" + str(401) + "] access token is invalid.")
        redirect_uri = url_for('logout', _external=True)
        return redirect(redirect_uri)

    response = app.make_response(render_template(
        'productpage.html',
        detailsStatus=detailsStatus,
        reviewsStatus=reviewsStatus,
        product=product,
        details=details,
        reviews=reviews,
        user=user))

    return response
```

> - https://github.com/hiroki-it/istio/blob/master/samples/bookinfo/src/productpage/productpage.py

### session

#### ▼ セッションデータの作成

セッションデータを作成し、レスポンスの `Set-Cookie` ヘッダーに保管する。

```python
from flask import Flask, session

app = Flask(__name__)

session['username'] = user
```

> - https://flask.palletsprojects.com/en/stable/quickstart/#sessions
> - https://qiita.com/eee-lin/items/4e9a2a308ca52b58fd1e#%E6%9B%B8%E3%81%8D%E8%BE%BC%E3%81%BF

#### ▼ セッションデータの取得

レスポンスの `Set-Cookie` ヘッダーやリクエストの `Cookie` ヘッダーから、セッションデータを取得する。

```python
from flask import Flask, session

app = Flask(__name__)

session['username'] = request.form['username']
username = session['username']
```

`session.get` 関数でも取得でき、デフォルト値を設定できる。

```python
from flask import Flask, session

app = Flask(__name__)

session.get('username', 'None')
```

> - https://flask.palletsprojects.com/en/stable/quickstart/#sessions
> - https://qiita.com/eee-lin/items/4e9a2a308ca52b58fd1e#%E8%AA%AD%E3%81%BF%E8%BE%BC%E3%81%BF

#### ▼ セッションデータの保持期間

`app.permanent_session_lifetime` で、セッションデータの保持期間を設定できる。

```python
from flask import Flask, session

app = Flask(__name__)

app.permanent_session_lifetime = timedelta(days=5)
```

セッションデータを作成する前に `session.permanent` を有効化しておくと、セッションデータの保持期間を無期限にできる。

この場合、保持期間は無視される。

```python
from flask import Flask, session

app = Flask(__name__)

session.permanent = True
session['username'] = user
```

> - https://flask.palletsprojects.com/en/stable/api/#flask.session.permanent
> - https://qiita.com/eee-lin/items/4e9a2a308ca52b58fd1e#%E8%AA%AD%E3%81%BF%E8%BE%BC%E3%81%BF

<br>

### url_for

#### ▼ external

ホスト名とデフォルトのプロトコル名 (HTTP) のあるURLを作成する。

```python
from flask import Flask, url_for

app = Flask(__name__)

with app.test_request_context():
    # http://localhost/
    print(url_for('index', _external=True))
```

> - https://flask-web-academy.com/article/flask-urlfor/

#### ▼ scheme

ホスト名と指定したプロトコル名のあるURLを作成する。

```python
from flask import Flask, url_for

app = Flask(__name__)

ith app.test_request_context():
    # https://localhost/
    print(url_for('index', _external=True, _scheme='https'))
```

> - https://flask-web-academy.com/article/flask-urlfor/

<br>
