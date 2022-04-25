---
title: 【知見を記録するサイト】コンポーネント＠FastAPI
description: コンポーネント＠FastAPIの知見をまとめました．

---

# コンポーネント＠FastAPI

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

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

FastAPIクラスに非同期処理を実行するエンドポイントを追加する．FastAPIインスタンスに登録するためには，```include_router```メソッドにAPIRouterインスタンスを渡す必要がある．また，DBのセッションを開始するために，DBオブジェクトを注入する必要がある．

参考：https://github.com/tiangolo/fastapi/issues/1693#issuecomment-665833384

```python
from fastapi import FastAPI, APIRouter, Depends

app = FastAPI()

router = APIRouter()

PREFIX_FOO = "foo"
@router.get("/{PREFIX}/show")
async def show(db: Session = Depends(get_db)):
        # DBへのアクセス処理
     
app.include_router(router)

# 中略から 
```

<br>

## 02. 非同期

I/Oバウンドが発生しない場合や```async/await```宣言をサポートしているパッケージを利用する場合は，これを使用するメソッド側で```async```宣言を使う必要がある．ただし，```async/await```宣言をサポートしているパッケージがほとんどないことが現状である．

参考：https://qiita.com/ffggss/items/e4c06f86fb28a62948e0