---
title: 【知見を記録するサイト】phpコマンド
---

# phpコマンド

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. コマンド

### -i

PHPの設定を表示する．

**＊例＊**

```bash
$ php -i

phpinfo()
PHP Version => 7.4

# 〜 中略 〜

```

出力量が多いため，```grep```を用いて，特定の項目のみを表示するようにすると良い．

```bash
# PHPのプロセスが使用可能なめもりの
$ php -i | grep memory_limit

memory_limit => 2048M => 2048M
```

<br>

### --ini

Configuration Fileの項目で，```php.ini```ファイルのあるディレクトリを表示する．

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

インストールされているモジュールを表示する．

**＊例＊**

```bash
$ php -m

[PHP Modules]
bcmath
Core
ctype

# ～ 中略 ～

xmlreader
xmlwriter
zlib

[Zend Modules]
```

なお，実際に読み込まれているかどうかは，```get_loaded_extensions```メソッドで確認できる．`

参考：https://stackoverflow.com/questions/478844/how-do-i-see-the-extensions-loaded-by-php

```bash
$ php -r 'print_r(get_loaded_extensions());'

Array
(
    [0] => Core
    [1] => date
    [2] => libxml
    
    # 〜 中略 〜
    
    [33] => bcmath
    [34] => pdo_mysql
    [35] => sodium
)
```

<br>

### -r

コマンドラインからコードを実行できる．

参考：https://qiita.com/nokachiru/items/a2146a2f49eb5c98896c

**＊例＊**

```bash
# PHPなので，処理終わりにセミコロンが必要
$ php -r '<何らかの処理>'

# Hello Worldを出力
$ php -r 'echo "Hello World";'

# phpinfoメソッドを実行
$ php -r 'phpinfo();'

# phpinfoメソッドの実行結果から，特定の設定のみを取り出す．
$ php -r 'phpinfo();' | grep php.ini

# phpinfoメソッドの実行結果をテキストファイルに保存
$ php -r 'phpinfo();' > phpinfo.txt

# 複数行のコードを実行する場合
$ php -r '
    $foo = "foo";
    echo $foo;
  '
```

<br>

### --ri

拡張モジュールの設定値を表示する．

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
