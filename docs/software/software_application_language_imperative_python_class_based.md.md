---
title: 【知見を記録するサイト】クラス＠Python
description: クラス＠Pythonの知見をまとめました．

---

# クラス＠Python

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. is-a-kind-of（グループとメンバーの関係）

参考：https://geisya.or.jp/~mwm48961/programming/python_object1.htm

```python
class Parent:
    def foo():
        return "foo"

# 継承 
class Child(parent):
    def bar():
        return "bar"
```

