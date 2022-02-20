---
title: 【知見を記録するサイト】パッケージ管理＠Python
description: パッケージ管理＠Pythonの知見をまとめました．
---

# パッケージ管理＠Python

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Pipによる管理：Package Installer for Python

### セットアップ

参考：https://pip.pypa.io/en/stable/installation/

<br>

### ```requirements.txt```ファイル

要件とするパッケージのバージョンを指定する．

```
flask==2.0.2
```

<br>

## 01-02. pipコマンド

### install

指定したライブラリをインストールする．

参考：https://pip-python3.readthedocs.io/en/latest/reference/pip_install.html#pip-install

#### ・--upgrade

指定したパッケージをアップグレードする．


**＊実行例＊**

参考：https://stackoverflow.com/questions/56499418/what-is-the-use-of-upgrading-pip

```bash
$ pip install --upgrade pip
```

#### ・--user

**＊実行例＊**

```bash
$ pip install --user <ライブラリ名>
```

#### ・-r

requirements.txt を元にライブラリをインストールする．

**＊実行例＊**

```bash
$ pip install -r requirements.txt
```
指定したディレクトリにライブラリをインストールすることもできる．

```bash
$ pip install -r requirements.txt　--prefix=/usr/local
```

<br>

### freeze

pipでインストールされたパッケージを元に，要件ファイルを作成する．

参考：https://pip-python3.readthedocs.io/en/latest/reference/pip_freeze.html

```bash
# インストールのため
$ pip freeze > requirements.txt

# アンインストールのため
$ pip freeze > uninstall.txt
```

<br>

### show

pipでインストールしたパッケージ情報を表示する．

参考：https://pip-python3.readthedocs.io/en/latest/reference/pip_show.html

```bash
$ pip show sphinx

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

指定したライブラリをインストールする．

参考：https://pip-python3.readthedocs.io/en/latest/reference/pip_uninstall.html

```bash
$ pip uninstall -y <ライブラリ名>
```

uninstall.txt を元にライブラリをアンインストールすることもできる．

```bash
$ pip uninstall -y -r uninstall.txt
```

<br>
