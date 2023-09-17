---
title: 【IT技術の知見】クラス＠Python
description: クラス＠Pythonの知見を記録しています。
---

# クラス＠Python

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 継承

### 継承によるクラスチェーン

```pycon
class Foo:

    def foo(self):
        return "foo"
```

```pycon
from src.models.model import Foo

class Bar(Foo):

    def bar(self):
        return "bar"
```

> - https://geisya.or.jp/~mwm48961/programming/python_object1.html

<br>

### 継承元のメソッドを参照

```pycon
class Foo:

    def foo(self):
        return "foo"
```

```pycon
from src.models.model import Foo

# 継承
class Bar(Foo):

    def bar(self):
        #  継承元のメソッドを参照する。
        foo = super().foo()
        return foo
```

<br>

## 02. use (引数型/返却値型として使用する関係性)

### DI：Dependency Injection (依存オブジェクト注入)

#### ▼ コンストラクタインジェクション

依存先のUserNameクラスを、`__init__`メソッドの引数として、Userクラスに注入する。

```pycon
class User:

    def __init__(self, name):
        self.name = name
```

```pycon
name = UserName()
user = User(name) # インジェクション
```
