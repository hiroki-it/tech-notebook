---
title: 【IT技術の知見】Debian系＠管理ユーティリティ
description: Debian系＠管理ユーティリティの知見を記録しています。
---

# Debian系＠管理ユーティリティ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. apt-file

### search

指定したファイルを持つパッケージを検索する。

拡張子も指定しても、ファイル名までしか絞れない。

```bash
# apt-fileパッケージをインストールする。
$ apt-get install apt-file

$ apt-file update

# zlib.hファイルを持つパッケージを検索する。
$ apt-file search zlib.h

autoconf-archive: /usr/share/doc/autoconf-archive/html/ax_005fcheck_005fzlib.html
cc65: /usr/share/cc65/include/zlib.h
dovecot-dev: /usr/include/dovecot/istream-zlib.h
dovecot-dev: /usr/include/dovecot/ostream-zlib.h

...

tcllib: /usr/share/doc/tcllib/html/tcllib_zlib.html
texlive-plain-generic: /usr/share/texlive/texmf-dist/tex4ht/ht-fonts/alias/arabi/nazlib.htf
tinc: /usr/share/doc/tinc/tinc.html/zlib.html
zlib1g-dev: /usr/include/zlib.h
```

> - https://atmarkit.itmedia.co.jp/ait/articles/1709/08/news020.html
> - https://embedded.hatenadiary.org/entry/20081101/p3

<br>
