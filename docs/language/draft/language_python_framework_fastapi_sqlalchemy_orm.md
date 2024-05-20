---
title: 【IT技術の知見】SQLAlchemy ORM＠FastAPI
description: SQLAlchemy ORM＠FastAPIの知見を記録しています。
---

# SQLAlchemy ORM＠FastAPI

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### DBへの接続

**＊実装例＊**

```python
# SessionLocalクラスを作成します。
# @see https://fastapi.tiangolo.com/ja/tutorial/sql-databases/#create-a-sessionlocal-class
def create_session_local():
    import os
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    db_url = "{db_driver}://{db_user}:{db_password}@{db_host}/{db_database}?charset=utf8".format(
        db_driver=os.getenv("DB_DRIVER"),
        db_user=os.getenv("DB_USER"),
        db_password=os.getenv("DB_PASSWORD"),
        db_host=os.getenv("DB_HOST"),
        db_database=os.getenv("DB_DATABASE"),
    )

    engine = create_engine(db_url)

    session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    return session_local()


# DBに接続します。
# @see https://fastapi.tiangolo.com/ja/tutorial/sql-databases/#create-a-dependency
def get_db():
    try:
        session_local = create_session_local()
        yield session_local
    finally:
        session_local.close()

```

> - https://fastapi.tiangolo.com/tutorial/sql-databases/#create-the-sqlalchemy-parts

<br>

### モデルの定義

基底モデルのインスタンスを`declarative_base`メソッドで作成し、この変数を各モデルで継承する。

**＊実装例＊**

```python
from sqlalchemy.ext.declarative import declarative_base

# @see https://fastapi.tiangolo.com/ja/tutorial/sql-databases/#create-a-base-class
Base = declarative_base()
```

```python
# user.pyファイル
from src.models.model import Base
from sqlalchemy import Column

 # 基底モデルクラスを継承する。
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    ...
```

> - https://crieit.net/posts/SQLAlchemy-Declarative-API

<br>

## 02. CRUD

### Create

```python
from fastapi import Depends
from sqlalchemy.orm import Session
from src.models.foo import Foo

class FooController():

     # コンストラクタ
     # @see https://fastapi.tiangolo.com/tutorial/dependencies/
     def __init__(self, db: Session = Depends(get_db)):
         self.db = db

     # 作成トランザクションを実行します。
     # @see https://fastapi.tiangolo.com/ja/tutorial/sql-databases/#create-data
     def createFoo(self):
         foo = Foo(first_name="hiroki", last_name="hasegawa")

         # セッションにクラスを追加する。
         self.db.add(foo)

         # DBレコードを作成する。
         self.db.commit()

         # 作成したレコードをインスタンスのデータに設定する。
         self.db.refresh(foo)

         return JSONResponse(jsonable_encoder(foo))

```

> - https://fastapi.tiangolo.com/ja/tutorial/sql-databases/#create-data

Dependsメソッドについて

> - https://zenn.dev/sh0nk/books/537bb028709ab9/viewer/b92ab0#di

> DB接続部分にDIを利用することにより、ビジネスロジックとDBが密結合になることを防ぎます。

また、DIによってこの `db` インスタンスの中身を外部からoverrideすることが可能になるため、例えばテストの時に `get_db`と異なるテスト用の接続先に置換するといったことが、プロダクションコードに触れることなく可能になります。
