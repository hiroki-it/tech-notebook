---
title: 【知見を記録するサイト】クラス＠Python
description: クラス＠Pythonの知見をまとめました．

---

# クラス＠Python

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 継承

### 継承によるクラスチェーン

参考：https://geisya.or.jp/~mwm48961/programming/python_object1.htm

```python
class Foo:
    
    def foo(self):
        return "foo"
```
```python
from src.models.model import Foo

class Bar(Foo):
    
    def bar(self):
        return "bar"
```

<br>

### 継承元のメソッドを参照

```python
class Foo:
    
    def foo(self):
        return "foo"
```

```python
from src.models.model import Foo

# 継承 
class Bar(Foo):
    
    def bar(self):
        #  継承元のメソッドを参照する。
        foo = super().foo()
        return foo 
```

<br>

## 02. use（引数型/返却値型として用いる関係性）

### DI：Dependency Injection（依存オブジェクト注入）

#### ・コンストラクタインジェクション

依存先のUserNameクラスを、`__init__`メソッドの引数として、Userクラスに注入する。

```python
class User:
    
    def __init__(self, name):
        self.name = name
```

```python
name = UserName()
user = User(name) # インジェクション
```

