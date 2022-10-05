---
title: 【IT技術の知見】パッケージ管理＠Python
description: パッケージ管理＠Pythonの知見を記録しています。
---

# パッケージ管理＠Python

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. PIPによる管理：Package Installer for Python

### セットアップ

> ℹ️ 参考：https://pip.pypa.io/en/stable/installation/

<br>

### ```requirements.txt```ファイル

要件とするパッケージのバージョンを指定する。

```
flask==2.0.2
```

<br>

## 01-02. pipコマンド

### check

#### ▼ checkとは

インストールされているパッケージ間の依存関係を正しく解決できるか否かを確認する。

```bash
$ pip3 check

No broken requirements found.
```

解決できなかった場合は、以下のようなエラーが出力される。

```bash
$ pip3 check

wagtail 2.6.1 has requirement django-modelcluster<5.0,>=4.2, but you have django-modelcluster 5.0.
```

<br>

### install

#### ▼ installとは

指定したパッケージをインストールする。

> ℹ️ 参考：https://pip-python3.readthedocs.io/en/latest/reference/pip_install.html#pip-install

```bash
$ pip3 install <パッケージ名>
```

#### ▼ --upgrade

pip自身を含む、指定したパッケージをアップグレードする。アップグレード後は、```pip3 check```コマンドで依存関係が正しいかを確認し、```pip3 freeze```コマンドで要件ファイルも更新する必要がある。

```bash
$ pip3 install --upgrade <パッケージ名>

# 依存関係を確認する。
$ pip3 check

# 要件ファイルを更新する。
$ pip3 freeze > requirements.txt
```

アップグレードできるパッケージを一括でアップグレードする場合は、パイプラインと組み合わせる必要がある。

> ℹ️ 参考：https://gist.github.com/e8l/c20ab194091dd02fafe7

```bash
$ pip3 freeze --local \
    | grep -v '^\-e' \
    | cut -d = -f 1  \
    | xargs -n1 pip3 install -U
```

pip自身をアップグレードする。

> ℹ️ 参考：https://stackoverflow.com/questions/56499418/what-is-the-use-of-upgrading-pip

```bash
$ pip3 install --upgrade pip
```

#### ▼ --user

```bash
$ pip3 install --user <パッケージ名>
```

#### ▼ -r

バージョン管理とrequirements.txtファイルを元にパッケージをインストールする。

```bash
$ pip3 install -r requirements.txt
```
指定したディレクトリにパッケージをインストールもできる。

```bash
$ pip3 install -r requirements.txt --prefix=/usr/local
```

<br>

### freeze

#### ▼ freezeとは

pipでインストールされたパッケージを元に、要件ファイルを作成する。

> ℹ️ 参考：https://pip-python3.readthedocs.io/en/latest/reference/pip_freeze.html

```bash
# インストールのため
$ pip3 freeze > requirements.txt

# 上書きする場合
$ pip3 freeze >| requirements.txt
```

```bash
# アンインストールのため
$ pip3 freeze > uninstall.txt
```

<br>

### list

#### ▼ listとは

現在インストールされているパッケージの一覧を取得する。

```bash
$ pip3 list

Package                    Version
-------------------------- -------
click                      8.0.3
ghp-import                 2.0.2

...

wheel                      0.37.1
zipp                       3.7.0
```

・-o

アップグレードできるパッケージの一覧を取得する。

```bash
$ pip3 list -o

Package            Version Latest Type
------------------ ------- ------ -----
click              8.0.3   8.0.4  wheel
importlib-metadata 4.10.0  4.11.2 wheel

...

pyparsing          3.0.6   3.0.7  wheel
setuptools         60.5.0  60.9.3 wheel
```

<br>

### show

#### ▼ showとは

pipでインストールしたパッケージ情報を取得する。

> ℹ️ 参考：https://pip-python3.readthedocs.io/en/latest/reference/pip_show.html

```bash
$ pip3 show sphinx

Name: Sphinx
Version: 3.2.1
Summary: Python documentation generator
Home-page: http://sphinx-doc.org/
Author: Georg Brandl
Author-email: georg@python.org
License: BSD
# インストール場所
Location: /usr/local/lib/python3.8/site-packages
# このパッケージの依存先
Requires: sphinxcontrib-applehelp, imagesize, docutils, sphinxcontrib-serializinghtml, snowballstemmer, sphinxcontrib-htmlhelp, sphinxcontrib-devhelp, sphinxcontrib-jsmath, setuptools, packaging, Pygments, babel, alabaster, sphinxcontrib-qthelp, requests, Jinja2
# このパッケージを依存先としているパッケージ
Required-by: sphinxcontrib.sqltable, sphinx-rtd-theme, recommonmark
```

<br>

### uninstall

#### ▼ uninstallとは

指定したパッケージをインストールする。

> ℹ️ 参考：https://pip-python3.readthedocs.io/en/latest/reference/pip_uninstall.html

```bash
$ pip3 uninstall -y <パッケージ名>
```

uninstall.txt を元にパッケージをアンインストールもできる。

```bash
$ pip3 uninstall -y -r uninstall.txt
```

<br>
