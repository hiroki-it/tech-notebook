---
title: 【IT技術の知見】コンポーネント＠FastAPI
description: コンポーネント＠FastAPIの知見を記録しています。
---

# コンポーネント＠FastAPI

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. App

### FastAPIクラス

#### ▼ FastAPIクラスとは

```python
from fastapi import FastAPI

app = FastAPI()

# src/app.py
# app = Flask(src)
```

<br>

### APIRouterクラス

#### ▼ APIRouterクラスとは

FastAPIクラスに非同期処理を実行するエンドポイントを追加する。

FastAPIインスタンスに登録するためには、`include_router`メソッドにAPIRouterインスタンスを渡す必要がある。

また、DBのセッションを開始するために、DBオブジェクトを注入する必要がある。

> - https://github.com/tiangolo/fastapi/issues/1693#issuecomment-665833384

```python
from fastapi import FastAPI, APIRouter, Depends

app = FastAPI()

router = APIRouter()

PREFIX_FOO = "foo"
@router.get("/{PREFIX}/show")
async def show(db: Session = Depends(get_db)):
        # DBへのアクセス処理

app.include_router(router)

...
```

<br>

## 02. 非同期

I/Oバウンドが発生しない場合や`async/await`宣言をサポートしているパッケージを利用する場合は、これを使用するメソッド側で`async`宣言を使用する必要がある。

ただし、`async/await`宣言をサポートしているパッケージがほとんどないことが現状である。

> - https://qiita.com/ffggss/items/e4c06f86fb28a62948e0

<br>


## 03. 関数

### url_for

#### ▼ _external

ホスト名とデフォルトのプロトコル名 (HTTP) のあるURLを作成する。

```python
with app.test_request_context():
    # http://localhost/
    print(url_for('index', _external=True))
```

> - https://flask-web-academy.com/article/flask-urlfor/

#### ▼ _scheme

ホスト名と指定したプロトコル名のあるURLを作成する。


```python
ith app.test_request_context():
    # https://localhost/
    print(url_for('index', _external=True, _scheme='https'))
```

> - https://flask-web-academy.com/article/flask-urlfor/

<br>
