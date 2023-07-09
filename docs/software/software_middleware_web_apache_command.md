---
title: 【IT技術の知見】コマンド＠Apache
description: コマンド＠Apacheの知見を記録しています。
---

# コマンド＠Apache

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. apachectlコマンド

### configtest

設定ファイルのバリデーションを実行する。

> - https://httpd.apache.org/docs/trunk/ja/programs/apachectl.html

```bash
$ apachectl configtest
```

<br>

### graceful

Apacheを段階的に再起動する。

安全に再起動できる。

> - https://httpd.apache.org/docs/trunk/ja/programs/apachectl.html

```bash
$ apachectl graceful
```

<br>

### -t

設定ファイルのバリデーションを実行する。

> - https://httpd.apache.org/docs/trunk/ja/programs/apachectl.html

```bash
$ apachectl -t
```

<br>

## 02. httpdコマンド

### -D

読み込まれた`conf`ファイルの一覧を取得する。

この結果から、使われていない`conf`ファイルもを検出できる。

> - https://httpd.apache.org/docs/2.4/programs/httpd.html

```bash
$ httpd -t -D DUMP_CONFIG 2>/dev/null | grep "# In" | awk "{print $4}"
```

<br>

### -l

コンパイル済みのモジュールの一覧を取得する。

表示されているからといって、読み込まれているとは限らない。

> - https://httpd.apache.org/docs/2.4/programs/httpd.html

```bash
$ httpd -l
```

<br>

### -L

特定のディレクティブを実装する必要がある設定ファイルの一覧を取得する。

> - https://httpd.apache.org/docs/2.4/programs/httpd.html

```bash
$ httpd -L
```

<br>

### -M

コンパイル済みのモジュールのうちで、実際に読み込まれているモジュールを取得する。

> - https://httpd.apache.org/docs/2.4/programs/httpd.html

```bash
$ httpd -M
```

<br>

### -S

実際に読み込まれたVirtualHostの設定を取得する。

> - https://httpd.apache.org/docs/2.4/programs/httpd.html

```bash
$ httpd -S
```

<br>

## 03. serviceコマンドによる操作

### httpd configtest

Apacheの設定ファイルのバリデーションを実行する。

> - http://www.rickynews.com/blog/2014/09/24/quick-apache-nginx-restart/

```bash
$ service httpd configtest
```

<br>
