---
title: 【IT技術の知見】メソッド/データ＠Python
description: メソッド/データ＠Pythonの知見を記録しています。
---

# メソッド/データ＠Python

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. メソッドとデータのカプセル化

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

最初に、`2`個のアンダースコア (`__`) を宣言する必要がある。

```python
class Foo:

    def __init__(self, foo):
        self.__foo = foo

    def foo():
        return self.__foo
```

<br>
