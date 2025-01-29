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

WSGIアプリケーションの実行に関するメソッドを持つ。

クラスの引数に、グローバル変数の『`__name__`』あるいはエントリーポイントのパスを直接的に設定する。

環境変数の`FLASK_APP`で指定したエントリーポイントでは、必ずFlaskクラスのインスタンスを作成する必要がある。

```python
from flask import Flask

app = Flask(__name__)

# src/app.py
# app = Flask(src)
```

> - https://flask.palletsprojects.com/Ien/2.0.x/api/

<br>

### `route`メソッド

#### ▼ `route`メソッド

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

### `run`メソッド

#### ▼ `run`メソッドとは

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

| 引数           | 説明                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| `debug`        | エラーログをブラウザ上に表示するか否かを設定する。                                                   |
| `host`         | 受信する通信のIPアドレスを設定する。全てのIPアドレスの場合は、`0.0.0.0`とする。                      |
| `load_dotenv`  | `dotenv`パッケージを読み込むか否かを設定する。これを有効化すれば、他の引数は環境変数から設定できる。 |
| `port`         | インバウンド通信を待ち受けるポート番号を設定する。                                                   |
| `use_reloader` | ホットリロードを有効化するか否かを設定する。                                                         |

> - https://www.twilio.com/blog/how-to-run-a-flask-application-jp
> - https://takuma-taco.hateblo.jp/entry/2018/10/01/181513

<br>

## 02. 環境変数

### App

#### ▼ FLASK_APP

アプリケーションのエントリーポイントを設定する。

| `FLASK_APP`の値     | 説明                                                   |
| ------------------- | ------------------------------------------------------ |
| `module:name`       | モジュール名 (ファイル名) とインスタンス名を設定する。 |
| `module:function()` | モジュール名 (ファイル名) と関数名を設定する。         |
| `module`            | モジュール名 (ファイル名) を設定する。                 |
| `file.py`           | ファイル名を設定する。                                 |

> - https://www.twilio.com/blog/how-to-run-a-flask-application-jp

<br>

## 03. ベストプラクティス

### アプリケーションファクトリーパターン

#### ▼ アプリケーションファクトリーパターンとは

Pythonのコードを配置するディレクトリに`__init__.py`ファイルを配置し、ここでFlaskクラスのインスタンスを作成するメソッドを定義する。

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

プロジェクトのルートディレクトリに、`create_app`メソッドを実行するエントリーポイント (例：`main.py`ファイル) を配置する。

名前空間を判定する条件分の外で`create_app`メソッドを実行しないと、uwsgiがapp変数を見つけられない。

```python
from src import create_app

app = create_app()

if __name__ == '__main__':
    app.run()
```

> - https://stackoverflow.com/questions/13751277/how-can-i-use-an-app-factory-in-flask-wsgi-servers-and-why-might-it-be-unsafe

#### ▼ 開発環境と本番環境の違い

本番環境では、アプリケーションの実行に`run`関数と`flask run`コマンドを使用しないようにする。

代わりに、uWSGIやgunicornを使用して、エントリーポイントの関数を直接的にコールする。

本番環境と開発環境を同様にするために、本番環境のみでなく開発環境でもコマンドを使用しないようにしても良い。

> - https://msiz07-flask-docs-ja.readthedocs.io/ja/latest/tutorial/deploy.html
> - https://serip39.hatenablog.com/entry/2020/07/06/070000

<br>

## 04. ビルトイン関数

### url_for

#### ▼ external

ホスト名とデフォルトのプロトコル名 (HTTP) のあるURLを作成する。

```python
with app.test_request_context():
    # http://localhost/
    print(url_for('index', _external=True))
```

> - https://flask-web-academy.com/article/flask-urlfor/

#### ▼ scheme

ホスト名と指定したプロトコル名のあるURLを作成する。

```python
ith app.test_request_context():
    # https://localhost/
    print(url_for('index', _external=True, _scheme='https'))
```

> - https://flask-web-academy.com/article/flask-urlfor/

<br>

## 05. パッケージ

### authlib.integrations.flask_client

#### ▼ authlib.integrations.flask_clientとは

> - https://github.com/lepture/authlib/tree/master/authlib/integrations/flask_client

#### ▼ 初期化

特にKubernetes内では、`api_base_url`と`authorize_url`のドメインに、外部から接続できるKeycloakのドメインを設定する。

一方で、`access_token_url`と`jwks_uri`はKubernetes内部からのみ接続できるように、Serviceのドメインとする。

```python
from authlib.integrations.flask_client import OAuth

app = Flask(__name__)

oauth = OAuth(app)

oauth.register(
    # 例：keycloak、googleなど
    name="<IDプロバイダー名>",
    client_id="foo-client",
    client_secret="*****",
    client_kwargs={"scope": "openid profile email"},
    # 外部から接続できるKeycloakのドメインを設定する。Kubernetes Serviceのドメインではダメ。
    api_base_url="http://<Keycloakのドメイン>/",
    # 外部から接続できるKeycloakのドメインを設定する。Kubernetes Serviceのドメインではダメ。
    authorize_url="http://<Keycloakのドメイン>/realms/<realm名>>/protocol/openid-connect/auth",
    # Serviceの完全修飾ドメイン名
    access_token_url="http://keycloak-http.app.svc.cluster.local:8080/realms/dev/protocol/openid-connect/token",
    # Serviceの完全修飾ドメイン名
    jwks_uri="http://keycloak-http.app.svc.cluster.local:8080/realms/dev/protocol/openid-connect/certs"
)
```

IDプロバイダー名を指定し、ここで設定した変数を取得できる。

```python
# http://<Keycloakのドメイン>/
print(oauth.<IDプロバイダー名>.api_base_url)
```

> - https://docs.authlib.org/en/latest/client/flask.html
> - https://docs.authlib.org/en/latest/client/flask.html#flask-openid-connect-client
> - https://github.com/authlib/demo-oauth-client/blob/master/flask-google-login/app.py

#### ▼ ログイン

```python
from flask import url_for, redirect

@app.route('/login')
def login():
    redirect_uri = url_for('authorize', _external=True)
    return oauth.twitter.authorize_redirect(redirect_uri)

@app.route('/authorize')
def authorize():
    token = oauth.twitter.authorize_access_token()
    resp = oauth.twitter.get('account/verify_credentials.json')
    resp.raise_for_status()
    profile = resp.json()
    return redirect('/')
```

> - https://docs.authlib.org/en/latest/client/flask.html#routes-for-authorization
> - https://github.com/authlib/demo-oauth-client/blob/master/flask-google-login/app.py

#### ▼ アカウントの取得

```python
from flask import render_template

@app.route('/github')
def show_github_profile():
    resp = oauth.github.get('user')
    resp.raise_for_status()
    profile = resp.json()
    return render_template('github.html', profile=profile)
```

> - https://docs.authlib.org/en/latest/client/flask.html#accessing-oauth-resources
> - https://github.com/authlib/demo-oauth-client/blob/master/flask-google-login/app.py

<br>

### flask_oidc.OpenIDConnect

```python
from flask_oidc import OpenIDConnect

app = Flask(__name__)

app.config.update({
    # client_secrets.jsonファイルのパスを設定する
    'OIDC_CLIENT_SECRETS': 'client_secrets.json',
    'OIDC_SCOPES': ['openid', 'profile', 'email'],
})

oidc = OpenIDConnect(app)
```

> - https://github.com/fedora-infra/flask-oidc/
> - https://gist.github.com/thomasdarimont/145dc9aa857b831ff2eff221b79d179a?permalink_comment_id=4983728#gistcomment-4983728

#### ▼ client_secrets.json

認証情報をJSONファイルで定義する。

```yaml
{
  "web":
    {
      "issuer": "http://localhost:8081/realms/<realm名>",
      "auth_uri": "http://localhost:8081/realms/<realm名>/protocol/openid-connect/auth",
      "client_id": "flask-app",
      "client_secret": "a41060dd-b5a8-472e-a91f-6a3ab0e04714",
      "redirect_uris": ["http://localhost:5000/*"],
      "userinfo_uri": "http://localhost:8081/realms/<realm名>/protocol/openid-connect/userinfo",
      "token_uri": "http://localhost:8081/realms/<realm名>/protocol/openid-connect/token",
      "token_introspection_uri": "http://localhost:8081/realms/<realm名>/protocol/openid-connect/token/introspect",
    },
}
```

> - https://gist.github.com/thomasdarimont/145dc9aa857b831ff2eff221b79d179a#file-client_secrets-json

<br>
