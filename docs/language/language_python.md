---
title: 【IT技術の知見】Python
description: Pythonの知見を記録しています。
---

# Python

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Pythonとは

記入中...

<br>

## 02. セットアップ

### インストール

#### ▼ yumリポジトリから

```bash
$ yum install -y python3
```

<br>

### Dockerfile

#### ▼ Flask、uWSGIを使用する場合

```dockerfile
#===================
# Global ARG
#===================
ARG PYTHON_VERSION=3.10
ARG LABEL="Hiroki <example@gmail.com>"

#===================
# Base Stage
#===================
FROM python:${PYTHON_VERSION}-slim as base

WORKDIR /var/www/foo

ENV TZ Asia/Tokyo

COPY ./requirements.txt /var/www/foo/requirements.txt

RUN apt-get update -y \
  `# uwsgiの要件をインストール。` \
  && apt-get install -y \
    gcc \
  `# uESGIの起動時にFlaskが必要なため、パッケージを先にインストール。` \
  && pip install \
    --upgrade pip \
    -r requirements.txt

COPY ./docker/flask/uwsgi.ini /etc/wsgi/wsgi.ini

#===================
# development Stage
#===================
FROM base as development
LABEL mantainer=${LABEL}

CMD ["uwsgi", "--ini", "/etc/wsgi/wsgi.ini"]

#===================
# Production Stage
#===================
FROM base as production
LABEL mantainer=${LABEL}

COPY ../software /var/www/foo/

CMD ["uwsgi", "--ini", "/etc/wsgi/wsgi.ini"]
```

#### ▼ FastAPI、uvicornを使用する場合

```dockerfile
#===================
# Global ARG
#===================
ARG PYTHON_VERSION=3.10
ARG LABEL="Hiroki <example@gmail.com>"

#===================
# Base Stage
#===================
FROM python:${PYTHON_VERSION}-slim as base

WORKDIR /var/www/customer

ENV TZ Asia/Tokyo

COPY ./requirements.txt /var/www/customer/requirements.txt

RUN pip install \
    --upgrade pip \
    -r requirements.txt

#===================
# development Stage
#===================
FROM base as development
LABEL mantainer=${LABEL}

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--reload"]

#===================
# Production Stage
#===================
FROM base as production
LABEL mantainer=${LABEL}

COPY ./ /var/www/customer/

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--reload"]
```

<br>

## 03. ディレクトリ構成規約

<br>

## 04. ファイル構成

### 命名規則

#### ▼ PEPによる規則

Pythonの命名規則は、PEPに記載されている。

> - https://www.python.org/dev/peps/pep-0007/
> - https://pep8-ja.readthedocs.io/ja/latest/
> - https://qiita.com/naomi7325/items/4eb1d2a40277361e898b

#### ▼ パッケージ

全て小文字のスネークケースとする。

#### ▼ モジュール

全て小文字のスネークケースとする。

#### ▼ クラス

アッパーキャメルケースとする。

#### ▼ 例外

アッパーキャメルケースとする。

#### ▼ 型変数

アッパーキャメルケースとする。

#### ▼ メソッド

全て小文字のスネークケースとする。

#### ▼ 関数

全て小文字のスネークケースとする。

#### ▼ 変数

全て小文字のスネークケースとする。

#### ▼ 定数

全て大文字のスネークケースとする。

<br>

### package、subpackage

#### ▼ package、subpackageとは

ディレクトリに相当する。

> - https://docs.python.org/ja/3/reference/import.html#packages

#### ▼ 基本的には`__init__.py`ファイルを配置すること

通常パッケージとして扱うディレクトリには。

`__init__.py`ファイルを配置する必要がある。

一方で、名前空間パッケージではこれが不要である。

> - https://stackoverflow.com/questions/37139786/is-init-py-not-required-for-packages-in-python-3-3
> - https://rinatz.github.io/python-book/ch04-02-packages/

<br>

### module

#### ▼ moduleとは

パッケージ内の各ファイルに相当する。

> - https://rinatz.github.io/python-book/ch04-01-modules/
> - https://qiita.com/msi/items/d91ea3900373ff8b09d7

<br>

### from import

#### ▼ from importとは

パッケージとして定義したディレクトリからクラスや関数読み込む。

存在しないパッケージをインポートしようとすると、インポートエラーになってしまう。

```python
from <パッケージ名>.<サブパッケージ名>.<モジュール名> import <クラス名、関数名>
```

> - https://qiita.com/papi_tokei/items/bc34d798dc7a6d49df30

#### ▼ アスタリスクを使用しないこと

アスタリスクによるインポートは非推奨である。

> - https://python.civic-apps.com/wildcard-import/

#### ▼ 絶対パスを使用すること

パッケージ名は絶対パスを指定する。

#### ▼ 宣言場所について

`1`個のファイルで`1`個のクラスや関数のみを宣言する場合は、`import`を実行する場所はクラスや関数の外でも中でもよい。

```python
from foo import foo

def foo():
    foo = foo()

    return foo
```

ただし、複数を宣言する場合は、可読性の観点からクラスや関数の中で`import`を実行する。

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

#### ▼ `1`個ずつインポート

複数のパッケージをインポートする場合、カンマで繋ぐこともできるが、`1`個ずつインポートした方が良い。

> - https://www.tech-teacher.jp/blog/python-import/

```python
# import foo, bar
import foo
import bar

def foo():
    foo = foo()

    return foo
```

<br>

## 05. 関数

### print

Pythonでは、`print`関数の結果を即時に出力するわけではない。

`flush`を有効化すると、即時に出力できる。

```python
print("foo", flush=True)
```

> - https://stackoverflow.com/questions/230751/how-can-i-flush-the-output-of-the-print-function
> - https://jitaku.work/it/language/python/print-flush/

<br>
