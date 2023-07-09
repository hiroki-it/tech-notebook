---
title: 【IT技術の知見】コマンド@PHP
description: コマンド@PHPの知見を記録しています。
---

# コマンド@PHP

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. phpコマンド

### -i

PHPの設定を取得する。

**＊例＊**

```bash
$ php -i

PHP Version => 7.4
...

```

出力サイズが多いため、`grep`を使用して、特定の項目のみを表示すると良い。

```bash
# PHPのプロセスが使用できるメモリを確認する。
$ php -i | grep memory_limit

memory_limit => 2048M => 2048M
```

<br>

### --ini

Configuration Fileの項目で、`php.ini`ファイルのあるディレクトリを取得する。

**＊例＊**

```bash
$ php --ini

Configuration File (php.ini) Path: /usr/local/etc/php # iniファイルのあるディレクトリ
Loaded Configuration File:         (none)
Scan for additional .ini files in: /usr/local/etc/php/conf.d
Additional .ini files parsed:      /usr/local/etc/php/conf.d/docker-php-ext-bcmath.ini,
/usr/local/etc/php/conf.d/docker-php-ext-pdo_mysql.ini,
/usr/local/etc/php/conf.d/docker-php-ext-sodium.ini

$ ls -la /usr/local/etc/php
total 164
drwxr-xr-x 1 root root  4096 Sep  1  2020 .
drwxr-xr-x 1 root root  4096 Sep  1  2020 ..
drwxr-xr-x 1 root root  4096 Sep 25 12:22 conf.d
-rw-r--r-- 1 root root 72278 Sep  1  2020 php.ini-development # 開発環境用iniファイル
-rw-r--r-- 1 root root 72582 Sep  1  2020 php.ini-production  # 本番環境用iniファイル
```

<br>

### -m

現在インストールされているモジュールを取得する。

**＊例＊**

```bash
$ php -m

[PHP Modules]
bcmath
Core
ctype

...

xmlreader
xmlwriter
zlib

[Zend Modules]
```

注意点として、実際に読み込まれているか否かは、`get_loaded_extensions`メソッドで確認できる。

```bash
$ php -r 'print_r(get_loaded_extensions());'

Array
(
    [0] => Core
    [1] => date
    [2] => libxml

    ...

    [33] => bcmath
    [34] => pdo_mysql
    [35] => sodium
)
```

> - https://stackoverflow.com/questions/478844/how-do-i-see-the-extensions-loaded-by-php

<br>

### -r

コマンドラインからコードを実行できる。

**＊例＊**

```bash
# PHPなため、最後にセミコロンが必要
$ php -r '<何らかの処理>'

# Hello Worldを出力
$ php -r 'echo "Hello World";'

# phpinfoメソッドを実行
$ php -r 'phpinfo();'

# phpinfoメソッドの実行結果から、特定の設定のみを取り出す。
$ php -r 'phpinfo();' | grep php.ini

# phpinfoメソッドの実行結果をテキストファイルに保存
$ php -r 'phpinfo();' > phpinfo.txt

# 複数行のコードを実行する場合
$ php -r '
    $foo = "foo";
    echo $foo;
  '
```

> - https://qiita.com/nokachiru/items/a2146a2f49eb5c98896c

<br>

### --ri

拡張モジュールの設定値を取得する。

**＊例＊**

```bash
$ php --ri=<拡張モジュール名>
```

```bash
$ php --ri=Core

Core

PHP Version => 7.4.9

Directive => Local Value => Master Value
highlight.comment => <font style="color: #FF8000">#FF8000</font> => <font style="color: #FF8000">#FF8000</font>
highlight.default => <font style="color: #0000BB">#0000BB</font> => <font style="color: #0000BB">#0000BB</font>
highlight.html => <font style="color: #000000">#000000</font> => <font style="color: #000000">#000000</font>
highlight.keyword => <font style="color: #007700">#007700</font> => <font style="color: #007700">#007700</font>
highlight.string => <font style="color: #DD0000">#DD0000</font> => <font style="color: #DD0000">#DD0000</font>
display_errors => STDOUT => STDOUT
display_startup_errors => Off => Off
enable_dl => On => On

...

zend.detect_unicode => On => On
zend.signal_check => Off => Off
zend.exception_ignore_args => Off => Off
```

<br>
