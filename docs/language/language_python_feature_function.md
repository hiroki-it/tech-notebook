---
title: 【IT技術の知見】関数＠Python
description: 関数＠Pythonの知見を記録しています。
---

# 関数＠Python

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 関数

### print

Python では、`print()` 関数の結果を即時に出力するわけではない。

`flush` を有効化すると、即時に出力できる。

```python
print("foo", flush=True)
```

> - https://stackoverflow.com/questions/230751/how-can-i-flush-the-output-of-the-print-function
> - [Python の Print文 で Flushする方法](https://jitaku.work/it/language/python/print-flush/)

<br>
