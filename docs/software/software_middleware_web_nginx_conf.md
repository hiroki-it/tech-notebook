---
title: 【IT技術の知見】nginx.conf＠Nginx
description: nginx.conf＠Nginxの知見を記録しています。
---

# nginx.conf＠Nginx

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. セットアップ

### インストール

#### ▼ aptリポジトリから

nginxを```apt-get```コマンドでインストールすると、旧バージョンが指定されるため、```apt```コマンドを使用する。

> ℹ️ 参考：https://www.nginx.com/resources/wiki/start/topics/tutorials/install/

```bash
$ apt install nginx
```

#### ▼ yumリポジトリから

```bash
$ yum install -y nginx
```

<br>

## 02. 設定ファイルの種類

### ```/etc/nginx/conf.d/*.conf```ファイル

#### ▼ ```.../conf.d/*.conf```ファイルとは

デフォルトの設定が定義されているいくつかのファイル。基本的には読み込むようにする。ただし、nginx.confファイルの設定が上書きされてしまわないかを注意する。

```nginx
include /etc/nginx/conf.d/*.conf;
```

<br>

### ```/usr/share/nginx/modules/*.conf```ファイル

#### ▼ ```.../modules/*.conf```ファイルとは

モジュールの読み出し処理が定義されているファイル。

```nginx
include  /usr/share/nginx/modules/*.conf;
```

例えば、```mod-http-image-filter.conf```ファイルの内容は以下の通り。

```nginx
load_module "/usr/lib64/nginx/modules/ngx_http_image_filter_module.so";
```

<br>

### ```/etc/nginx/mime.types```ファイル

#### ▼ ```mime.types```ファイルとは

リクエストのContent-TypeのMIMEタイプとファイル拡張子の間の対応関係が定義されているファイル。

```nginx
include /etc/nginx/mime.types;
```

<br>

### ```/etc/nginx/fastcgi_params```ファイル

#### ▼ ```fastcgi_params```ファイルとは

FastCGIプロトコルでルーティングする場合に使用する。アプリケーションで使用できる変数を定義する。```nginx.conf```ファイルによって読み込まれる。OSやそのバージョンによっては、変数のデフォルト値が異なることがある。実際にインバウンド通信のルーティング先に接続し、上書き設定が必要なものと不要なものを判断する必要がある。

#### ▼ Debian系の場合

Debian10の設定ファイルを以下に示す。

> ℹ️ 参考：https://mogile.web.fc2.com/nginx_wiki/start/topics/examples/phpfcgi/

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

# PHPだけで必要な設定
fastcgi_param  REDIRECT_STATUS    200;
```

<br>

## 03. Core

### ブロック

#### ▼ events

> ℹ️ 参考：https://nginx.org/en/docs/ngx_core_module.html#events

**＊実装例＊**

```nginx
events {
  worker_connections  1024;
}
```

<br>

### ディレクティブ

#### ▼ user

本設定ファイルの実行ユーザーとグループを設定する。グループ名を入力しなかった場合、ユーザー名と同じものが自動的に設定される。

```nginx
user  www www;
```

#### ▼ error_log

```nginx
error_log  logs/error.log;
```

#### ▼ include

共通化された設定ファイルを読み込む。アスタリスクによるワイルドカードに対応している。

```nginx
include /etc/nginx/conf.d/*.conf;
```

#### ▼ pid

```nginx
pid  logs/nginx.pid;
```

#### ▼ worker_connections

workerプロセスが同時に処理できるコネクションの最大数を設定する。

> ℹ️ 参考：https://nginx.org/en/docs/ngx_core_module.html#worker_connections

```nginx
worker_connections  1024;
```

#### ▼ worker_processes

```nginx
worker_processes  5;
```

#### ▼ worker_rlimit_nofile

```nginx
worker_rlimit_nofile  8192;
```

<br>

## 03-02. http_core_module

### ブロック

#### ▼ http

全てのHTTPプロトコルによるインバウンド通信に共通する処理を設定する。

> ℹ️ 参考：https://nginx.org/en/docs/http/ngx_http_core_module.html#http

```nginx
http {
    # Nginxのバージョンを表示するか否か
    server_tokens      off;
    # MIMEタイプを設定
    include            /etc/nginx/mime.types;
    default_type       application/octet-stream;
    # ログのフォーマット
    log_format         main  "$remote_addr - $remote_user [$time_local] "$request" "
                             "$status $body_bytes_sent "$http_referer" "
                             ""$http_user_agent" "$http_x_forwarded_for"";
    access_log         /var/log/nginx/access.log  main;
    # sendfileシステムコールを使用するか否か
    sendfile           on;
    # ヘッダーとファイルをまとめてレスポンスするか否か
    tcp_nopush         on;
    # keepaliveを維持する時間
    keepalive_timeout  65;
    default_type       application/octet-stream;
    include            /etc/nginx/mime.types;
    include            /etc/nginx/conf.d/*.conf;
        
    server {
        ...
    }
}
```

#### ▼ location

特定のパスのインバウンド通信に関する処理を設定する。

> ℹ️ 参考：https://nginx.org/en/docs/http/ngx_http_core_module.html#location

**＊実装例＊**

各設定の優先順位に沿った以下の順番で実装した方が良い。

```nginx
# 1. ドキュメントルートを指定したインバウンド通信の場合
location = / {

}

# 2. 『/images/』で始まるインバウンド通信の場合
location ^~ /images/ {

}

# 3と4. 末尾が、『gif、jpg、jpegの形式』 のインバウンド通信の場合
# バックスラッシュでドットをエスケープし、任意の文字列ではなく『ドット文字』として認識できるようにする。
location ~* \.(gif|jpg|jpeg)$ {

}

# 5-1. 『/docs/』で始まる全てのインバウンド通信の場合
location /docs/ {

}

# 5-2. 『/』で始まる全てのインバウンド通信の場合
location / {

}
```

ルートの一致条件は、以下の通りである。

| 優先順位 |  prefix  | ルートの一致条件             | ルート例                                                                            |
|:----:|:--------:|----------------------|---------------------------------------------------------------------------------|
|  1   | ```=```  | 指定したルートに一致する場合。      | ```https://example.com/```                                                      |
|  2   | ```^~``` | 指定したルートで始まる場合。       | ```https://example.com/images/foo.gif```                                        |
|  3   | ```~```  | 正規表現（大文字・小文字を区別する）。  | ```https://example.com/images/FOO.jpg```                                        |
|  4   | ```~*``` | 正規表現（大文字・小文字を区別しない）。 | ```https://example.com/images/foo.jpg```                                        |
|  5   |    なし    | 指定したルートで始まる場合。       | ・```https://example.com/foo.html```<br>・```https://example.com/docs/foo.html``` |

#### ▼ server

特定のルーティング先に関する処理を設定する。

> ℹ️ 参考：https://nginx.org/en/docs/http/ngx_http_core_module.html#server

**＊実装例＊**

```nginx
server {
    # 80番ポートで受信
    listen      80;
    # Hostヘッダーの値
    server_name example.com;
    root        /var/www/foo;
    index       index.php index.html;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass  unix:/run/php-fpm/www.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include       fastcgi_params;
    }
}
```

#### ▼ リダイレクトとリライトの違い

以下のリンクを参考にせよ。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_collaboration_api_restful.html

<br>

### ディレクティブ

#### ▼ default_type

```Content-Type```ヘッダーの値が```mime.types```ファイルにないMIME typeであった場合に適用するMIME typeを設定する。

> ℹ️ 参考：https://nginx.org/en/docs/http/ngx_http_core_module.html#default_type

**＊実装例＊**

任意のMIME type（指定なし）のインバウンド通信を処理する。

```nginx
default_type application/octet-stream
```

#### ▼ listen

インバウンド通信を待ち受けるポート番号を設定する。

> ℹ️ 参考：https://nginx.org/en/docs/http/ngx_http_core_module.html#listen

**＊実装例＊**

インバウンド通信を```80```番ポートで受信する。

```nginx
listen 80;
```

インバウンド通信を```443```番ポートで受信する。

```nginx
listen 443 ssl;
```

#### ▼ sendfile

クライアントへのレスポンス時に、ファイル送信のためにLinuxのsendfileシステムコールを使用するか否かを設定する。ファイル返信処理をOS内で行うため、処理が速くなる。使用しない場合、Nginxがレスポンス時に自身でファイル返信処理を行う。

> ℹ️ 参考：https://nginx.org/en/docs/http/ngx_http_core_module.html#sendfile

**＊実装例＊**

```nginx
sendfile on;
```

#### ▼ server_name

受信するインバウンド通信の```Host```ヘッダーの値を設定する。ちなみに```Host```ヘッダーには、インバウンド通信のルーティング先のドメイン名が割り当てられている。

> ℹ️ 参考：https://nginx.org/en/docs/http/ngx_http_core_module.html#server_name

```nginx
server_name example.com;
```

パブリックIPアドレスを直接的に記述しても良い。

```nginx
server_name 192.168.0.0;
```

なお、同じIPアドレスからのインバウンド通信のみを受信する場合は、インバウンド通信の```Host```ヘッダーの値は常に```localhost```（```127.0.0.1```）であるため、```localhost```を設定できる。```127.0.0.1```としてもよいが、```localhost```のIPアドレスが```127.0.0.1```でない場合も考慮して、```localhost```とした方が良い。

```nginx
server_name localhost;
```

#### ▼ ssl

HTTPSプロトコルを受信する場合、SSL/TLSプロトコルを有効にする必要がある。

> ℹ️ 参考：https://nginx.org/en/docs/http/ngx_http_core_module.html#ssl

**＊実装例＊**

```nginx
ssl on;
```

#### ▼ ssl_certificate

HTTPSプロトコルを受信する場合、SSL証明書のパスを設定する。

**＊実装例＊**

```nginx
ssl_certificate /etc/nginx/ssl/server.crt;
```

#### ▼ ssl_certificate_key

HTTPSプロトコルを受信する場合、SSL証明書と対になる秘密鍵のパスを設定する。

**＊実装例＊**

```nginx
ssl_certificate_key /etc/nginx/ssl/server.key;
```

#### ▼ ssl_client_certificate

HTTPSプロトコルを受信する場合、クライアント証明書のパスを設定する。

**＊実装例＊**

```nginx
ssl_client_certificate /etc/nginx/ssl/clinet.crt;
```

#### ▼ tcp_nopush

上述のLinuxの```sendfile```システムコールを使用する場合に適用できる。クライアントへのレスポンス時、ヘッダーとファイルを```1```個のパケットにまとめて返信するか否かを設定する。

**＊実装例＊**

```nginx
tcp_nopush on;
```

#### ▼ try_files

指定されたパスのファイルを順に探してアクセスする。また、最後のパラメーターで内部リダイレクトする。最後のパラメーターでは、異なるパスまたはステータスコードを指定できる。もし、nginxとアプリケーションを異なる仮想環境で稼働させている場合、```try_files```ディレクティブがファイル探索の対象とする場所は、あくまでnginxの稼働する仮想環境内になることに注意する。内部リダイレクトによって、nginx内でリクエストが再処理される。異なるパスに内部リダイレクトしていた場合は、パスに合ったlocationブロックで改めて処理される。内部リダイレクトは、URLを書き換えてリダイレクトせずに処理を続行する『リライト』とは異なることに注意する。

> ℹ️ 参考：https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files

```nginx
location / {
    try_files file ... uri;
}
```

```nginx
location / {
    try_files file ... =code;
}
```

**＊実装例＊**

```nginx
location / {
    # 1. 『/foo.html』のパスで、ファイルをレスポンス
    # 2. 『/foo.html/』のパスで、ファイルをレスポンス
    # 3. 『/index.php?query_string』のパスで内部リダイレクト
    try_files $uri $uri/ /index.php?query_string;
}

# 内部リダイレクト後は、『/index.php?foo=bar』のため、以下で処理される。
location ~ \.php$ {
    # php-fpmにルーティングされる。
    fastcgi_pass  localhost:9000;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include       fastcgi_params;
}
```

<br>

### ヘルスチェックの受信

#### ▼ nginxによるレスポンス

webサーバーのみヘルスチェックを受信する。ヘルスチェック用の```server```ブロックで、```gif```ファイルを含むレスポンスを返信するように```location```ブロックを定義する。Nginxでアクセスログを出力する必要はないため、```location```ブロックでは```access_log```を無効化する。

**＊実装例＊**

```nginx
server {
    listen 80      default_server;
    listen [::]:80 default_server;
    root           /var/www/foo;
    index          index.php index.html;

    location /healthcheck {
        empty_gif;
        access_log off;
        break;
    }
}
```

#### ▼ アプリケーションによるレスポンス

webサーバーとアプリケーションの両方でヘルスチェックを受信する。アプリケーション側に```200```ステータスのレスポンスを返信するエンドポイントを実装したうえで、ヘルスチェック用の```server```ブロックで、アプリケーションにルーティングするように```location```ブロックを定義する。Nginxでアクセスログを出力する必要はないため、```location```ブロックでは```access_log```を無効化する。

**＊実装例＊**

```nginx
server {
    listen 80      default_server;
    listen [::]:80 default_server;
    root           /var/www/foo;
    index          index.php index.html;

    location /healthcheck {
        try_files $uri $uri/ /index.php?$query_string;
        access_log off;
    }
}
```

<br>

## 03-03. http_index_module

### ディレクティブ

#### ▼ index

リクエストのURLがトレイリングスラッシュで終わる全ての場合、指定されたファイルをURLの末尾に追加する。

> ℹ️ 参考：https://nginx.org/en/docs/http/ngx_http_index_module.html

**＊実装例＊**

```nginx
index index.php;
```

<br>

## 03-04. http_headers_module

### ディレクティブ

#### ▼ add_header

レスポンス時に付与するレスポンスヘッダーを設定する。

> ℹ️ 参考：https://nginx.org/en/docs/http/ngx_http_headers_module.html#add_header

**＊実装例＊**

```nginx
# Referrer-Policyヘッダーに値を設定する
add_header Referrer-Policy "no-referrer-when-downgrade";
```

<br>

## 03-05. http_upstream_module

### ブロック

#### ▼ upstream

インバウンド通信のルーティング先をグループ化する。デフォルトでは、加重ラウンドロビン方式を基に通信をルーティングする。

> ℹ️ 参考：https://nginx.org/en/docs/http/ngx_http_upstream_module.html#upstream

**＊実装例＊**

```nginx
upstream foo_servers {
    server 192.168.0.1:80;
    server 192.168.0.1:81;
}
```

<br>

## 03-06. http_fast_cgi_module

### ディレクティブ

#### ▼ fastcgi_params

FastCGIプロトコルでインバウンド通信をルーティングする場合、ルーティング先で使用する変数とその値を設定する。

> ℹ️ 参考：https://nginx.org/en/docs/http/ngx_http_fastcgi_module.html#fastcgi_param

**＊実装例＊**

```nginx
fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
```

#### ▼ fastcgi_pass

FastCGIプロトコルでインバウンド通信をルーティングする場合、ルーティング先のアドレスとポートを設定する。

> ℹ️ 参考：https://nginx.org/en/docs/http/ngx_http_fastcgi_module.html#fastcgi_pass

**＊実装例＊**

```nginx
fastcgi_pass localhost:9000;
```

<br>

## 03-07. http_proxy_module

### ディレクティブ

#### ▼ proxy_pass

HTTPプロトコルでインバウンド通信をルーティングする場合、ルーティング先のアドレスとポートを設定する。

> ℹ️ 参考：https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass

**＊実装例＊**

```nginx
proxy_pass http://localhost:80;
```

<br>

