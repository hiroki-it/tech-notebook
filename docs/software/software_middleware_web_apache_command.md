---
title: 【知見を記録するサイト】apacheコマンド@Apache
---

# apacheコマンド@Apache

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. apachectlコマンド

### configtest

設定ファイルのバリデーションを実行する．

参考：https://httpd.apache.org/docs/trunk/ja/programs/apachectl.html

```bash
$ sudo apachectl configtest
```

<br>

### graceful

Apacheを段階的に再起動する．安全に再起動できる．

参考：https://httpd.apache.org/docs/trunk/ja/programs/apachectl.html

```bash
$ sudo apachectl graceful
```

<br>

### -t

設定ファイルのバリデーションを実行する．

参考：https://httpd.apache.org/docs/trunk/ja/programs/apachectl.html

```bash
$ sudo apachectl -t
```

<br>

## 02. httpdコマンド

### -D

読み込まれた```conf```ファイルの一覧を表示する．この結果から，使われていない```conf```ファイルもを検出できる．

参考：https://httpd.apache.org/docs/2.4/programs/httpd.html

```bash
$ sudo httpd -t -D DUMP_CONFIG 2>/dev/null | grep "# In" | awk "{print $4}"
```

<br>

### -l

コンパイル済みのモジュールの一覧を表示する．表示されているからといって，読み込まれているとは限らない．

参考：https://httpd.apache.org/docs/2.4/programs/httpd.html

```bash
$ sudo httpd -l
```

<br>

### -L

特定のディレクティブを実装するべき設定ファイルの一覧を表示する．

参考：https://httpd.apache.org/docs/2.4/programs/httpd.html

```bash
$ sudo httpd -L
```

<br>

### -M

コンパイル済みのモジュールのうちで，実際に読み込まれているモジュールを表示する．

参考：https://httpd.apache.org/docs/2.4/programs/httpd.html

```bash
$ sudo httpd -M
```

<br>

### -S

実際に読み込まれたVirtualHostの設定を表示する．

参考：https://httpd.apache.org/docs/2.4/programs/httpd.html

```bash
$ sudo httpd -S
```
