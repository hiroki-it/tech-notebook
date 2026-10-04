---
title: 【IT技術の知見】コマンド＠Nginx
description: コマンド＠Nginxの知見を記録しています。
---

# コマンド＠Nginx

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. nginx コマンド

### -c

設定ファイルを指定して、`nginx` プロセスを実行する。

```bash
$ nginx -c ./custom-nginx.conf
```

<br>

### reload

`nginx` プロセスを Graceful Restart する。

`systemctl` コマンドでも再起動できる。

```bash
$ nginx -s reload
```

> - https://serverfault.com/questions/378581/nginx-config-reload-without-downtime
> - https://www.nyamucoro.com/entry/2019/07/27/222829

<br>

### -t

設定ファイルのバリデーションを実行する。

また、読み込まれているすべての設定ファイル (`include` ディレクティブの対象も含む) の内容の一覧を取得する。

`service` コマンドでもバリデーションを実行できる。

```bash
$ nginx -t
```

> - https://www.nginx.com/resources/wiki/start/topics/tutorials/commandline/

<br>

## 02. service コマンドによる操作

### configtest

Nginx の設定ファイルのバリデーションを実行する。

```bash
$ service nginx configtest
```

> - [ApacheとNginxを素早くシンタックスチェックする \| RickyNews](http://www.rickynews.com/blog/2014/09/24/quick-apache-nginx-restart/)

<br>
