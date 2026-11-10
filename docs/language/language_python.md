---
title: 【IT技術の知見】Python
description: Pythonの知見を記録しています。
tags:
  - "言語"
  - "Python"
---

# Python

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. Python とは

インタプリタ型の動的型付け言語であり、Web アプリケーション、データ分析、機械学習など幅広い用途で使用される。

<br>

## 02. セットアップ

### インストール

#### ▼ yum リポジトリから

```bash
$ yum install -y python3
```

<br>

### Dockerfile

#### ▼ Flask、uWSGI を使用する場合

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

#### ▼ FastAPI、uvicorn を使用する場合

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

#### ▼ PEP による規則

Python の命名規則は、PEP に記載されている。

> - https://www.python.org/dev/peps/pep-0007/
> - [はじめに — pep8-ja 1.0 ドキュメント](https://pep8-ja.readthedocs.io/ja/latest/)
> - [Python命名規則一覧 #コーディング規約 - Qiita](https://qiita.com/naomi7325/items/4eb1d2a40277361e898b)

#### ▼ パッケージ

すべて小文字のスネークケースとする。

#### ▼ モジュール

すべて小文字のスネークケースとする。

#### ▼ クラス

アッパーキャメルケースとする。

#### ▼ 例外

アッパーキャメルケースとする。

#### ▼ 型変数

アッパーキャメルケースとする。

#### ▼ 関数

すべて小文字のスネークケースとする。

#### ▼ 関数

すべて小文字のスネークケースとする。

#### ▼ 変数

すべて小文字のスネークケースとする。

#### ▼ 定数

すべて大文字のスネークケースとする。

<br>

