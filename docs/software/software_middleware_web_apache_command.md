---
title: 【IT技術の知見】コマンド＠Apache
description: コマンド＠Apacheの知見を記録しています。
---

# コマンド＠Apache

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. apachectl コマンド

### configtest

設定ファイルのバリデーションを実行する。

```bash
$ apachectl configtest
```

> - [apachectl - Apache HTTP Server Control Interface - Apache HTTP Server Version 2.5](https://httpd.apache.org/docs/trunk/ja/programs/apachectl.html)

<br>

### graceful

Apache を段階的に再起動する。

Graceful Restart できる。

```bash
$ apachectl graceful
```

> - [apachectl - Apache HTTP Server Control Interface - Apache HTTP Server Version 2.5](https://httpd.apache.org/docs/trunk/ja/programs/apachectl.html)

<br>

### -t

設定ファイルのバリデーションを実行する。

```bash
$ apachectl -t
```

> - [apachectl - Apache HTTP Server Control Interface - Apache HTTP Server Version 2.5](https://httpd.apache.org/docs/trunk/ja/programs/apachectl.html)

<br>

## 02. httpd コマンド

### -D

読み込まれた `conf` ファイルの一覧を取得する。

この結果から、使われていない `conf` ファイルもを検出できる。

```bash
$ httpd -t -D DUMP_CONFIG 2>/dev/null \
    | grep "# In" \
    | awk "{print $4}"
```

> - [httpd - Apache Hypertext Transfer Protocol Server - Apache HTTP Server Version 2.4](https://httpd.apache.org/docs/2.4/programs/httpd.html)

<br>

### -l

コンパイル済みのモジュールの一覧を取得する。

表示されているからといって、読み込まれているとは限らない。

```bash
$ httpd -l
```

> - [httpd - Apache Hypertext Transfer Protocol Server - Apache HTTP Server Version 2.4](https://httpd.apache.org/docs/2.4/programs/httpd.html)

<br>

### -L

特定のディレクティブを実装する必要がある設定ファイルの一覧を取得する。

```bash
$ httpd -L
```

> - [httpd - Apache Hypertext Transfer Protocol Server - Apache HTTP Server Version 2.4](https://httpd.apache.org/docs/2.4/programs/httpd.html)

<br>

### -M

コンパイル済みのモジュールのうちで、実際に読み込まれているモジュールを取得する。

```bash
$ httpd -M
```

> - [httpd - Apache Hypertext Transfer Protocol Server - Apache HTTP Server Version 2.4](https://httpd.apache.org/docs/2.4/programs/httpd.html)

<br>

### -S

実際に読み込まれた VirtualHost の設定を取得する。

```bash
$ httpd -S
```

> - [httpd - Apache Hypertext Transfer Protocol Server - Apache HTTP Server Version 2.4](https://httpd.apache.org/docs/2.4/programs/httpd.html)

<br>

## 03. service コマンドによる操作

### httpd configtest

Apache の設定ファイルのバリデーションを実行する。

```bash
$ service httpd configtest
```

> - [ApacheとNginxを素早くシンタックスチェックする \| RickyNews](http://www.rickynews.com/blog/2014/09/24/quick-apache-nginx-restart/)

<br>
