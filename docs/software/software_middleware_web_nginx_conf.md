---
title: 【IT技術の知見】nginx.conf＠Nginx
description: nginx.conf＠Nginxの知見を記録しています。
---

# nginx.conf＠Nginx

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### インストール

#### ▼ aptリポジトリから

nginxを`apt-get`コマンドでインストールすると、旧バージョンが指定されるため、`apt`コマンドを使用する。

```bash
$ apt install nginx
```

> - https://www.nginx.com/resources/wiki/start/topics/tutorials/install/

#### ▼ yumリポジトリから

```bash
$ yum install -y nginx
```

<br>

## 02. 設定ファイルの種類

### `/etc/nginx/conf.d/*.conf`ファイル

#### ▼ `.../conf.d/*.conf`ファイルとは

デフォルトの設定が定義されているいくつかのファイル。

基本的には読み込むようにする。

ただし、nginx.confファイルの設定が上書きされてしまわないかを注意する。

```nginx
include /etc/nginx/conf.d/*.conf;
```

<br>

### `/usr/share/nginx/modules/*.conf`ファイル

#### ▼ `.../modules/*.conf`ファイルとは

モジュールの読み出し処理が定義されているファイル。

```nginx
include  /usr/share/nginx/modules/*.conf;
```

<br>

### `/etc/nginx/mime.types`ファイル

#### ▼ `mime.types`ファイルとは

リクエストのContent-TypeのMIMEタイプとファイル拡張子の間の対応関係が定義されているファイル。

```nginx
include /etc/nginx/mime.types;
```

<br>

### `/etc/nginx/fastcgi_params`ファイル

#### ▼ `fastcgi_params`ファイルとは

FastCGIプロトコルでルーティングする場合に使用する。

アプリケーションで使用できる変数を定義する。

`nginx.conf`ファイルによって読み込まれる。

OSやそのバージョンによっては、変数のデフォルト値が異なることがある。

実際にインバウンド通信のルーティング先に接続し、上書き設定が必要なものと不要なものを判断する必要がある。

#### ▼ Debian系の場合

Debian10の設定ファイルを以下に示す。

**＊実装例＊**

```nginx
#-------------------------------------------------------
# OSによって、fastcgi_paramsファイルの必要な設定が異なる
#-------------------------------------------------------
fastcgi_param  QUERY_STRING       $query_string;
fastcgi_param  REQUEST_METHOD     $request_method;
fastcgi_param  CONTENT_TYPE       $content_type;
fastcgi_param  CONTENT_LENGTH     $content_length;

fastcgi_param  SCRIPT_NAME        $fastcgi_script_name;
fastcgi_param  REQUEST_URI        $request_uri;
fastcgi_param  DOCUMENT_URI       $document_uri;
fastcgi_param  DOCUMENT_ROOT      $document_root;
fastcgi_param  SERVER_PROTOCOL    $server_protocol;
fastcgi_param  REQUEST_SCHEME     $scheme;
fastcgi_param  HTTPS              $https if_not_empty;

fastcgi_param  GATEWAY_INTERFACE  CGI/1.1;
fastcgi_param  SERVER_SOFTWARE    nginx/$nginx_version;

fastcgi_param  REMOTE_ADDR        $remote_addr;
fastcgi_param  REMOTE_PORT        $remote_port;
fastcgi_param  SERVER_ADDR        $server_addr;
fastcgi_param  SERVER_PORT        $server_port;
fastcgi_param  SERVER_NAME        $server_name;

# PHPのみで必要な設定
fastcgi_param  REDIRECT_STATUS    200;
```

> - https://mogile.web.fc2.com/nginx_wiki/start/topics/examples/phpfcgi/

<br>

## 03. Core

### ブロック

#### ▼ events

**＊実装例＊**

```nginx
events {
  worker_connections  1024;
}
```

> - https://nginx.org/en/docs/ngx_core_module.html#events

<br>

### ディレクティブ

#### ▼ user

本設定ファイルの実行ユーザーとグループを設定する。

グループ名を入力しなかった場合、ユーザー名と同じものが自動的に設定される。

```nginx
user  www www;
```

#### ▼ error_log

```nginx
error_log  logs/error.log;
```

#### ▼ include

共通化された設定ファイルを読み込む。

アスタリスクによるワイルドカード (`*`) をサポートしている。

```nginx
include /etc/nginx/conf.d/*.conf;
```

> - https://nginx.org/en/docs/ngx_core_module.html#include

`include`ディレクティブをどの階層で実行したかによって、指定した設定ファイル内で実行できるディレクティブが異なる。

例えば、`http`ディレクティブは一番上の階層で実行する必要があるため、これを定義した設定ファイルは一番上の階層の`include`ディレクティブで指定する必要がある。

```nginx
include /etc/nginx/conf.d/foo_module.conf;

http {
    # ここでhttpを実行する設定ファイルをincludeできない
}
```

> - https://stackoverflow.com/a/69282289

#### ▼ load_module

Nginxでは、ビルド時にモジュール (`so`ファイル) をバイナリを組み込むが、すでにビルド済みのモジュールを実行時に読み込める。

デフォルトでは、モジュールは`modules`ディレクトリにある。

```nginx
load_module modules/<動的モジュール名>;
```

> - https://nginx.org/en/docs/ngx_core_module.html#load_module
> - https://heartbeats.jp/hbblog/2016/02/nginx-dynamic-modules.html

#### ▼ pid

```nginx
pid logs/nginx.pid;
```

#### ▼ worker_connections

workerプロセスが同時に処理できるコネクションの最大数を設定する。

```nginx
worker_connections 1024;
```

> - https://nginx.org/en/docs/ngx_core_module.html#worker_connections

#### ▼ worker_processes

```nginx
worker_processes 5;
```

#### ▼ worker_rlimit_nofile

```nginx
worker_rlimit_nofile 8192;
```

<br>

## 04. 変数

### `$request_uri`

受信したリクエストのHTTPメソッドとURLが割り当てられている。

```yaml
GET http://_:80/foo
```

> - https://nginx.org/en/docs/http/ngx_http_core_module.html#var_request_uri
> - https://blog.utgw.net/entry/2020/03/12/121959

<br>

### `$uri`

受信したリクエストのURLパスが割り当てられている。

> - https://nginx.org/en/docs/http/ngx_http_core_module.html#var_uri
> - https://blog.utgw.net/entry/2020/03/12/121959

<br>
