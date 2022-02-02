---
title: 【知見を記録するサイト】クラス＠Python
description: クラス＠Pythonの知見をまとめました。

---

# クラス＠Python

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

