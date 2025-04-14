---
title: 【IT技術の知見】パッケージ＠Flask
description: パッケージ＠Flaskの知見を記録しています。
---

# パッケージ＠Flask

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. authlib.integrations.flask_client

### authlib.integrations.flask_clientとは

> - https://github.com/lepture/authlib/tree/master/authlib/integrations/flask_client

<br>

### 初期化

#### ▼ 全体

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
    api_base_url="http://<KeycloakのAPIのドメイン (Serviceの完全修飾ドメイン名) >/",
    # 外部から接続できるKeycloakのドメインを設定する。Kubernetes Serviceのドメインではダメ。
    authorize_url="http://<KeycloakのWebのドメイン>/realms/<realm名>>/protocol/openid-connect/auth",
    # Serviceの完全修飾ドメイン名
    access_token_url="http://<KeycloakのAPIのドメイン>:8080/realms/dev/protocol/openid-connect/token",
    # Serviceの完全修飾ドメイン名
    jwks_uri="http://<KeycloakのAPIのドメイン (Serviceの完全修飾ドメイン名) >:8080/realms/dev/protocol/openid-connect/certs"
)
```

IDプロバイダー名を指定し、ここで設定した変数を取得できる。

```python
# http://<KeycloakのAPIのドメイン>/
print(oauth.<IDプロバイダー名>.api_base_url)
```

> - https://docs.authlib.org/en/latest/client/flask.html
> - https://docs.authlib.org/en/latest/client/flask.html#flask-openid-connect-client
> - https://github.com/authlib/demo-oauth-client/blob/master/flask-google-login/app.py
> - https://github.com/hiroki-it/istio/blob/master/samples/bookinfo/src/productpage/productpage.py

<br>

### ログイン

#### ▼ アクセストークンを`Authorization`ヘッダーで運搬する場合

フロントエンドアプリケーションがCSRの場合に採用できる。

PythonでCSRのアプリケーションを実現できないため、`Authorization`ヘッダーの運搬は実装できない。

#### ▼ アクセストークンを`Cookie`ヘッダーで運搬する場合

フロントエンドアプリケーションがCSRまたはSSRの場合に採用できる。

CSRまたはSSRのアプリケーションは、`Cookie`ヘッダーを介してブラウザのCookieにトークンを保存できる。

```python
from flask import url_for, redirect

@app.route('/login')
def login():
    redirect_uri = url_for("callback", _external=True)
    response = oauth.keycloak.authorize_redirect(redirect_uri)
    return redirectResponse

@app.route("/callback")
def callback():
    response = app.make_response(redirect(url_for('home', _external=True)))

    try:
        # 各種トークンを取得する
        token = oauth.keycloak.authorize_access_token()
        session['id_token'] = token['id_token']
        # デコードしたIDトークンを取得する
        id_token = oauth.keycloak.parse_id_token(token, None)
        session['user'] = id_token['given_name']
        # access_tokenというキー名でCookieにアクセストークンを設定する
        # レスポンスにSet-Cookieヘッダーが追加される
        response.set_cookie('access_token', token['access_token'])
    except BaseException:
        logging.info("failed to callback")

    return response
```

> - https://docs.authlib.org/en/latest/client/flask.html#routes-for-authorization
> - https://github.com/authlib/demo-oauth-client/blob/master/flask-google-login/app.py
> - https://github.com/hiroki-it/istio/blob/master/samples/bookinfo/src/productpage/productpage.py

<br>

### ログアウト

#### ▼ アクセストークンを`Authorization`ヘッダーで運搬する場合

フロントエンドアプリケーションがCSRの場合に採用できる。

PythonでCSRのアプリケーションを実現できないため、`Authorization`ヘッダーの運搬は実装できない。

#### ▼ アクセストークンを`Cookie`ヘッダーで運搬する場合

```python
from flask import url_for, redirect

@app.route('/logout')
def logout():
    # Keycloakからログアウトし、ホームにリダイレクトする
    redirect_uri = ("http://localhost:8080/realms/dev/protocol/openid-connect/logout?id_token_hint=%s&post_logout_redirect_uri=%s" % (session.get('id_token', ''), url_for("home", _external=True)))
    session.pop('id_token', None)
    session.pop('user', None)
    response = app.make_response(redirect(redirect_uri))
    # Cookieヘッダーのアクセストークンを削除する
    response.delete_cookie('access_token')
    return response
```

> - https://github.com/hiroki-it/istio/blob/master/samples/bookinfo/src/productpage/productpage.py

<br>

### 認証情報の失効

#### ▼ アクセストークンを`Authorization`ヘッダーで運搬する場合

フロントエンドアプリケーションがCSRの場合に採用できる。

PythonでCSRのアプリケーションを実現できないため、`Authorization`ヘッダーの運搬は実装できない。

#### ▼ アクセストークンを`Cookie`ヘッダーで運搬する場合

```python
from flask import url_for, redirect

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
        logging.info("[" + str(401) + "] session has expired.")
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

<br>

## 02. flask_oidc.OpenIDConnect

### flask_oidc.OpenIDConnectとは

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

<br>

### client_secrets.json

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
