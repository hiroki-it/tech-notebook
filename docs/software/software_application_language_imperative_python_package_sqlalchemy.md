---
title: 【知見を記録するサイト】SQLAlchemy＠Python
description: SQLAlchemy＠Pythonの知見をまとめました．
---

# SQLAlchemy＠Python

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ

### DBへの接続

参考：https://fastapi.tiangolo.com/tutorial/sql-databases/#create-the-sqlalchemy-parts

**＊実装例＊**

```python
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

class DB():

    # コンストラクタ
    def __init__(self):
        db_url = "{db_driver}://{db_user}:{db_password}@{db_host}/{db_database}?charset=utf8".format(
                db_driver = os.getenv("DB_DRIVER"),
                db_user = os.getenv("DB_USER"),
                db_password = os.getenv("DB_PASSWORD"),
                db_host = os.getenv("DB_HOST"),
                db_database = os.getenv("DB_DATABASE")
            )
            
        engine = create_engine(
            db_url,
            connect_args = {"check_same_thread": False}
        )
        
        self.session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
 
    # DBに接続します．
    def get_db():
        try:
            session = self.session
            yield session
        finally:
            session.close()
```

<br>

### モデルの定義

基底モデルのインスタンスを```declarative_base```メソッドで作成し，この変数を各モデルで継承する．

参考：https://crieit.net/posts/SQLAlchemy-Declarative-API

**＊実装例＊**

```python
# model.pyファイル
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
```

```python
# user.pyファイル
from src.models.model import Base
from sqlalchemy import Column

 # 基底モデルクラスを継承する．
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    ...
```

