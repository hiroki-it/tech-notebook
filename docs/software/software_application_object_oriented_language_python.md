---
title: 【知見を記録するサイト】Python
description: Pythonの知見をまとめました。
---

# Python

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 実装ポリシー

### ディレクトリ構成

<br>

### ファイルの要素

#### ・package，subpackage

パッケージとして扱うディレクトリには．```__init__.py```ファイルを配置する必要がある．一方で，名前空間パッケージではこれが不要である．

参考：

- https://rinatz.github.io/python-book/ch04-02-packages/
- https://qiita.com/msi/items/d91ea3900373ff8b09d7

バージョンが```v3.3```以降であれば，サブパッケージには必要になる．

参考：

- https://shino-tec.com/2019/04/21/init-py-necessity/
- https://isolution.pro/q/so50137584/python-3-3-iko-no-pakke-ji-ni-wa-init-py-wa-hitsuyo-arimasen-ka
- https://stackoverflow.com/questions/37139786/is-init-py-not-required-for-packages-in-python-3-3

#### ・module

パッケージ内の各ファイルのこと．

参考：

- https://rinatz.github.io/python-book/ch04-01-modules/
- https://qiita.com/msi/items/d91ea3900373ff8b09d7

#### ・import

存在しないパッケージをインポートしようとすると，インポートエラーになる．

```python
from <パッケージ名>.<サブパッケージ名>.<モジュール名> import <関数名>
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