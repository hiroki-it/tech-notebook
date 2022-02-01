---
title: 【知見を記録するサイト】Python
description: Pythonの知見をまとめました。
---

# Python

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 実装ポリシー

### ディレクトリ構成

<br>

### ファイルの要素

#### ・package，subpackage

ディレクトリに相当する．通常パッケージとして扱うディレクトリには．```__init__.py```ファイルを配置する必要がある．一方で，名前空間パッケージではこれが不要である．

参考：

- https://docs.python.org/ja/3/reference/import.html#packages
- https://stackoverflow.com/questions/37139786/is-init-py-not-required-for-packages-in-python-3-3
- https://rinatz.github.io/python-book/ch04-02-packages/

#### ・module

パッケージ内の各ファイルに相当する．

参考：

- https://rinatz.github.io/python-book/ch04-01-modules/
- https://qiita.com/msi/items/d91ea3900373ff8b09d7

#### ・import

パッケージとして定義したディレクトリを読み込む．存在しないパッケージをインポートしようとすると，インポートエラーになる．

```python
from <パッケージ名>.<サブパッケージ名>.<モジュール名> import <クラス名，関数名>
```

参考：https://qiita.com/papi_tokei/items/bc34d798dc7a6d49df30

アスタリスクによるインポートは非推奨である．

参考：https://python.civic-apps.com/wildcard-import/

パッケージ名は絶対パスを指定するようにする．

<br>

### 命名規則

#### ・PEPによる規則

Pythonの命名規則は，PEPに記載されている．

参考：

- https://www.python.org/dev/peps/pep-0007/
- https://pep8-ja.readthedocs.io/ja/latest/
- https://qiita.com/naomi7325/items/4eb1d2a40277361e898b

#### ・パッケージ

全て小文字のスネークケースとする．

#### ・モジュール

全て小文字のスネークケースとする．

#### ・クラス

アッパーキャメルケースとする．

#### ・例外

アッパーキャメルケースとする．

#### ・型変数

アッパーキャメルケースとする．

#### ・メソッド

全て小文字のスネークケースとする．

#### ・関数

全て小文字のスネークケースとする．

#### ・変数

全て小文字のスネークケースとする．

#### ・定数

全て大文字のスネークケースとする．