---
title: 【IT技術の知見】オブジェクト＠Python
description: オブジェクト＠Pythonの知見を記録しています。
---

# オブジェクト＠Python

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 継承

### 継承によるクラスチェーン

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

> - https://geisya.or.jp/~mwm48961/programming/python_object1.html

<br>

### 継承元の関数を参照

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
        #  継承元の関数を参照する。
        foo = super().foo()
        return foo
```

<br>

## 02. use (引数型/返却値型として使用する関係性)

### DI：Dependency Injection (依存オブジェクト注入)

#### ▼ コンストラクタインジェクション

依存先の UserName クラスを、`__init__()` 関数の引数として、User クラスに注入する。

```python
class User:

    def __init__(self, name):
        self.name = name
```

```python
name = UserName()
user = User(name) # インジェクション
```

<br>
## 03. 振る舞いと状態のカプセル化

### public

どのオブジェクトでも呼び出せる。

```python
class Foo:

    def __init__(self, foo):
        self.foo = foo

    def foo():
        return self.foo
```

<br>

### private

同じオブジェクト内のみで呼び出せる。

オブジェクト指向のメリットを最大限に得られる機能である。

最初に、`2` 個のアンダースコア (`__`) を宣言する必要がある。

```python
class Foo:

    def __init__(self, foo):
        self.__foo = foo

    def foo():
        return self.__foo
```

<br>
