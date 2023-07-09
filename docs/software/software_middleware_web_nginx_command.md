---
title: 【IT技術の知見】コマンド＠Nginx
description: コマンド＠Nginxの知見を記録しています。
---

# コマンド＠Nginx

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. nginxコマンド

### -c

設定ファイルを指定して、`nginx`プロセスを実行する。

```bash
$ nginx -c ./custom-nginx.conf
```

<br>

### reload

`nginx`プロセスを安全に再起動する。

`systemctl`コマンドでも再起動できる。

```bash
$ nginx -s reload
```

> - https://serverfault.com/questions/378581/nginx-config-reload-without-downtime
> - https://www.nyamucoro.com/entry/2019/07/27/222829

<br>

### -t

設定ファイルのバリデーションを実行する。

また、読み込まれている全ての設定ファイル (`include`ディレクティブの対象も含む) の内容の一覧を取得する。

`service`コマンドでもバリデーションを実行できる。

```bash
$ nginx -t
```

> - https://www.nginx.com/resources/wiki/start/topics/tutorials/commandline/

<br>

## 02. serviceコマンドによる操作

### configtest

Nginxの設定ファイルのバリデーションを実行する。

> - http://www.rickynews.com/blog/2014/09/24/quick-apache-nginx-restart/

```bash
$ service nginx configtest
```
