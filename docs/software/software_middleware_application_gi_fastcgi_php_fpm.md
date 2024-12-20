---
title: 【IT技術の知見】PHP-FPM：PHP FastCGI Process Manager＠アプリケーション系ミドルウェア
description: PHP-FPM：PHP FastCGI Process Manager＠アプリケーション系ミドルウェアの知見を記録しています。
---

# PHP-FPM：PHP FastCGI Process Manager＠アプリケーション系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. PHP-FPMの仕組み

### アーキテクチャ

PHP-FPMは、Server API、Zend Engine、といったコンポーネントから構成される。

FastCGIプロトコルを使用したアプリケーション系ミドルウェアである。

![php-fpm_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/php-fpm_architecture.png)

> - https://qiita.com/taichitk/items/5cf2e6778f1209620e72#php-fpm%E3%81%AE%E5%9F%BA%E6%9C%AC%E7%9F%A5%E8%AD%98

<br>

### プロセスプール

PHP-FPMでは、リクエストのたびにプロセスを起動するわけでなく、あらかじめ複数のプロセスを稼働している。

そして、リクエストを受信するたびに、プロセスを割り当てている。

あらかじめ準備されたプロセス群を『プール』という。

> - https://hackers-high.com/linux/php-fpm-config/#php-fpm

<br>

## 01-02. ユースケース

### FastCGIとして

PHP-FPMは、FastCGIとしてwebサーバーとPHPファイルの間でデータ通信を実行する。

PHP-FPMとPHPは、それぞれ独立した子プロセスとして実行されている。

そのため、設定値を別々に設定する必要がある。

例えば、ログの出力先はそれぞれ個別に設定する必要がある。

![php-fpm_fastcgi](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/php-fpm_fastcgi.png)

> - https://developpaper.com/shared-cgi-fastcgi-and-php-fpm-1/
> - https://hiroki-it.github.io/tech-notebook/language/language_php_framework_laravel_component.html

<br>

## 02. コマンド

### php-fpmコマンド

#### ▼ -t

設定ファイルを検証する。

```bash
$ php-fpm -t

[01-Jan-2022 00:00:00] NOTICE: configuration file /etc/php-fpm.conf test is successful
```

<br>

### systemctlコマンドによる操作

#### ▼ status

PHP-FPMのプロセスが正常に実行中であることを確認する。プロセスがプールとして準備されていることも確認できる。

```bash
$ systemctl status php-fpm.service

● php-fpm.service - The PHP FastCGI Process Manager
   Loaded: loaded (/usr/lib/systemd/system/php-fpm.service; enabled; vendor preset: disabled)
   Active: active (running) since Fri 2021-03-12 13:16:54 JST; 11 months 8 days ago
  Process: 7507 ExecReload=/bin/kill -USR2 $MAINPID (code=exited, status=0/SUCCESS)
 Main PID: 6903 (php-fpm)
   Status: "Processes active: 0, idle: 35, Requests: 315161, slow: 0, Traffic: 0req/sec"
   Memory: 1.3G
   CGroup: /system.slice/php-fpm.service
           ├─ 6903 php-fpm: master process (/etc/php-fpm.conf)
           ├─29280 php-fpm: pool www
           ├─29281 php-fpm: pool www
           ├─29282 php-fpm: pool www
           ...
```

<br>

## 03. ログ

### ログの種類

#### ▼ NOTICE

```bash
[01-Sep-2021 00:00:00] NOTICE: fpm is running, pid 1
```

#### ▼ WARNING

```bash
[01-Sep-2021 00:00:00] WARNING: [pool www] server reached pm.max_children setting (5), consider raising it
```

#### ▼ Fatal Error

```bash
Fatal error: Allowed memory size of ***** bytes exhausted (tried to allocate 16 bytes)
```

<br>
