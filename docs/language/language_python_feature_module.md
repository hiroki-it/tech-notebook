---
title: 【IT技術の知見】モジュール＠Python
description: モジュール＠Pythonの知見を記録しています。
---

# モジュール＠Python

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. package、subpackage

### ▼ package、subpackage とは

ディレクトリに相当する。

> - [5. インポートシステム — Python 3.14.8 ドキュメント](https://docs.python.org/ja/3/reference/import.html#packages)

### ▼ 基本的には `__init__.py` ファイルを配置すること

通常パッケージとして扱うディレクトリには。

`__init__.py` ファイルを配置する必要がある。

一方で、名前空間パッケージではこれが不要である。

> - https://stackoverflow.com/questions/37139786/is-init-py-not-required-for-packages-in-python-3-3
> - [4.2. パッケージ - ゼロから学ぶ Python](https://rinatz.github.io/python-book/ch04-02-packages/)

<br>

## 02. module

### ▼ module とは

パッケージ内の各ファイルに相当する。

> - [4.1. モジュール - ゼロから学ぶ Python](https://rinatz.github.io/python-book/ch04-01-modules/)
> - [Python の \_\_init\_\_.py とは何なのか #Python - Qiita](https://qiita.com/msi/items/d91ea3900373ff8b09d7)

<br>

## 03. from import

### ▼ from import とは

パッケージとして定義したディレクトリからクラスや関数読み込む。

存在しないパッケージをインポートしようとすると、インポートエラーになってしまう。

```python
from <パッケージ名>.<サブパッケージ名>.<モジュール名> import <クラス名、関数名>
```

> - [Pythonインポート周り徹底理解への道 #Python3 - Qiita](https://qiita.com/papi_tokei/items/bc34d798dc7a6d49df30)

### ▼ アスタリスクを使用しないこと

アスタリスクによるインポートは非推奨である。

> - [ワイルドカードインポート(import \*)は推奨されない \| Python Snippets](https://python.civic-apps.com/wildcard-import/)

### ▼ 絶対パスを使用すること

パッケージ名は絶対パスを指定する。

### ▼ 宣言場所について

`1` 個のファイルで `1` 個のクラスや関数のみを宣言する場合は、`import` を実行する場所はクラスや関数の外でも中でもよい。

```python
from foo import foo

def foo():
    foo = foo()

    return foo
```

ただし、複数を宣言する場合は、可読性の観点からクラスや関数のなかで `import` を実行する。

```python
def foo():
    from foo import foo

    foo = foo()

    return foo

def bar():
    from bar import bar

    bar = bar()

    return bar
```

### ▼ `1` 個ずつインポート

複数のパッケージをインポートする場合、カンマで繋ぐこともできるが、`1` 個ずつインポートしたほうがよい。

> - [マスターしよう！Pythonでimportを使う方法について徹底解説！ - DS Media by Tech Teacher](https://www.tech-teacher.jp/blog/python-import/)

```python
# import foo, bar
import foo
import bar

def foo():
    foo = foo()

    return foo
```

<br>

