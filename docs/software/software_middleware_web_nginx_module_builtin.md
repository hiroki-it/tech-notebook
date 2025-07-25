---
title: 【IT技術の知見】ビルトインモジュール＠Nginx
description: ビルトインモジュール＠Nginxの知見を記録しています。
---

# ビルトインモジュール＠Nginx

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ngx_http_auth_request_module

### ディレクティブ

#### ▼ auth_request

認可リクエストのURLのパスを設定する。

Nginxは、認可レスポンスのステータスコードが`200`であれば認証成功、`401`ステータスまたは`403`ステータスであれば認証失敗とし、アプリケーションへのリクエストを許可/拒否する。

なお、有料版の`ngx_http_auth_jwt_module`モジュールであれば、認可サーバーにJWT取得のための認可リクエストを直接的に送信できる。

```nginx
http {

    # 認証が必要なパス
    location / {

        # 認可リクエストの宛先とするパスを設定する
        # ここでは、認可リクエストをOAuth2 Proxyに送信する
        auth_request /oauth2/auth;

        ...

    }

    location = /oauth2/auth {
        # 認可サーバーのドメイン名を設定する
        # ここでは、Nginxと認可サーバーの間にOAuth2 Proxyを配置している
        proxy_pass              https://<ドメイン名>:4180;
        proxy_pass_request_body off;
        proxy_set_header        Host $http_host;
    }

}
```

> - https://nginx.org/en/docs/http/ngx_http_auth_request_module.html
> - https://tech.jxpress.net/entry/2018/08/23/104123
> - https://techlife.cookpad.com/entry/2015/10/16/080000

<br>

## 02. ngx_http_core_module

### httpブロック

#### ▼ httpブロック

全てのHTTPリクエストのインバウンド通信に共通する処理を設定する。

```nginx
http {
    # Nginxのバージョンを表示するか否か
    server_tokens      off;
    # MIMEタイプを設定
    include            /etc/nginx/mime.types;
    default_type       application/octet-stream;

    # sendfileシステムコールを使用するか否か
    sendfile           on;
    # ヘッダーとファイルをまとめてレスポンスするか否か
    tcp_nopush         on;
    # KeepAliveを維持する時間
    keepalive_timeout  65;
    default_type       application/octet-stream;
    include            /etc/nginx/mime.types;
    include            /etc/nginx/conf.d/*.conf;

    server {
        ...
    }
}
```

#### ▼ log_format

非構造化ログの場合は、以下の通りとする。

```nginx
http {

    log_format         main  "$remote_addr - $remote_user [$time_local] "$request_uri" "
    "$status $body_bytes_sent "$http_referer" "
    ""$http_user_agent" "$http_x_forwarded_for"";

    access_log         /dev/stdout  main;
    error_log          /dev/stderr  warn;
}
```

構造化ログの場合は、以下の通りとする。

ここでは、JSONの設計規則に則って、キー名をローワーキャメルケースにしている。

```nginx
http {

    log_format         main         escape=json '{'
    '"remoteAddr": "$remote_addr",'
    '"remoteUser": "$remote_user",'
    '"requestUri": "$request_uri",'
    '"status": "$status",'
    '"bodyBytesSent": "$body_bytes_sent",'
    '"httpReferer": "$http_referer",'
    '"httpUserAgent": "$http_user_agent",'
    '"httpXForwarded-for": "$http_x_forwarded_for"'
    '}';

    access_log         /dev/stdout  main;
    error_log          /dev/stderr  warn;
}
```

> - https://nginx.org/en/docs/http/ngx_http_core_module.html#http
> - https://839.hateblo.jp/entry/2019/12/20/090000

#### ▼ map

指定した変数の値を、別の変数の値によって切り替える。

```nginx
http {

    map $foo $bar {
        foo1 bar1
        foo2 bar2
        foo3 bar3
    }
}
```

**＊実行例＊**

正規表現を使用して、W3C Trace Context仕様のトレースIDをX-Ray仕様に変換する。

```nginx
http {

    log_format main escape=json '{'
    '"trace-id": "$xray_trace_id"'
    '}';

    map $otel_trace_id $xray_trace_id {
        # W3C Trace Context仕様の場合、前半8文字と9文字目以降の文字を抽出して、X-Ray仕様に変換する
        # @see https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html#api-segmentdocuments-subsegments
        "~(^.{8})(.*)" 1-$1-$2;
        # それ以外の場合は0とする
        default        0;
    }

}
```

> - https://qiita.com/cubicdaiya/items/d938f3354f424830630b#map%E3%83%87%E3%82%A3%E3%83%AC%E3%82%AF%E3%83%86%E3%82%A3%E3%83%96

<br>

### locationブロック

特定のパスのインバウンド通信に関する処理を設定する。

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
# バックスラッシュでドットをエスケープし、任意の文字列ではなく『ドット文字』として識別できるようにする。
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

| 優先順位 | prefix | ルートの一致条件                         | ルート例                                                                   |
| :------: | :----: | ---------------------------------------- | -------------------------------------------------------------------------- |
|    1     |  `=`   | 指定したルートに一致する場合。           | `https://example.com/`                                                     |
|    2     |  `^~`  | 指定したルートで始まる場合。             | `https://example.com/images/foo.gif`                                       |
|    3     |  `~`   | 正規表現 (大文字・小文字を区別する) 。   | `https://example.com/images/FOO.jpg`                                       |
|    4     |  `~*`  | 正規表現 (大文字・小文字を区別しない) 。 | `https://example.com/images/foo.jpg`                                       |
|    5     |  なし  | 指定したルートで始まる場合。             | ・`https://example.com/foo.html` <br>・`https://example.com/docs/foo.html` |

> - https://nginx.org/en/docs/http/ngx_http_core_module.html#location

<br>

### serverブロック

特定のルーティング先に関する処理を設定する。

**＊実装例＊**

```nginx
server {
    # 80番ポートで受信
    listen      80;
    # Hostヘッダー値
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

> - https://nginx.org/en/docs/http/ngx_http_core_module.html#server

<br>

### ディレクティブ

#### ▼ default_type

`Content-Type`ヘッダー値が`mime.types`ファイルにないMIME typeであった場合に適用するMIME typeを設定する。

**＊実装例＊**

任意のMIME type (指定なし) のインバウンド通信を処理する。

```nginx
default_type application/octet-stream
```

> - https://nginx.org/en/docs/http/ngx_http_core_module.html#default_type

#### ▼ listen

インバウンド通信を待ち受けるポート番号を設定する。

**＊実装例＊**

インバウンド通信を`80`番ポートで受信する。

```nginx
listen 80;
```

インバウンド通信を`443`番ポートで受信する。

```nginx
listen 443 ssl;
```

> - https://nginx.org/en/docs/http/ngx_http_core_module.html#listen

#### ▼ sendfile

クライアントへのレスポンス時に、ファイル送信のためにLinuxのsendfileシステムコールを使用するか否かを設定する。

ファイル返信処理をOS内で実行するため、処理が速くなる。

使用しない場合、Nginxがレスポンス時に自身でファイル返信処理を実行する。

**＊実装例＊**

```nginx
sendfile on;
```

> - https://nginx.org/en/docs/http/ngx_http_core_module.html#sendfile

#### ▼ server_name

受信する通信の`Host`ヘッダー値を設定する。

補足として`Host`ヘッダーには、インバウンド通信のルーティング先のドメイン名が割り当てられている。

```nginx
server_name example.com;
```

パブリックIPアドレスを直接的に記述しても良い。

```nginx
server_name 192.168.0.0;
```

注意点として、同じIPアドレスからのインバウンド通信のみを受信する場合は、インバウンド通信の`Host`ヘッダー値は常に`127.0.0.1` (`127.0.0.1`) であるため、`127.0.0.1`を設定できる。

`127.0.0.1`としても良いが、`127.0.0.1`のIPアドレスが`127.0.0.1`でない場合も考慮して、`127.0.0.1`とした方が良い。

```nginx
server_name 127.0.0.1;
```

> - https://nginx.org/en/docs/http/ngx_http_core_module.html#server_name

#### ▼ ssl

HTTPSプロトコルを受信する場合、SSL/TLSプロトコルを有効化する必要がある。

**＊実装例＊**

```nginx
ssl on;
```

> - https://nginx.org/en/docs/http/ngx_http_core_module.html#ssl

#### ▼ ssl_certificate

HTTPSプロトコルを受信する場合、サーバー証明書のパスを設定する。

**＊実装例＊**

```nginx
ssl_certificate /etc/nginx/ssl/server.crt;
```

#### ▼ ssl_certificate_key

HTTPSプロトコルを受信する場合、サーバー証明書と対になる秘密鍵へのパスを設定する。

**＊実装例＊**

```nginx
ssl_certificate_key /etc/nginx/ssl/server.key;
```

#### ▼ ssl_client_certificate

HTTPSプロトコルを受信する場合、クライアント証明書のパスを設定する。

**＊実装例＊**

```nginx
ssl_client_certificate /etc/nginx/ssl/client.crt;
```

#### ▼ tcp_nopush

上述のLinuxの`sendfile`システムコールを使用する場合に適用できる。

クライアントへのレスポンス時、ヘッダーとファイルを`1`個のパケットにまとめて返信するか否かを設定する。

**＊実装例＊**

```nginx
tcp_nopush on;
```

#### ▼ try_files

指定されたパスのファイルを順に探してアクセスする。

また、最後のパラメーターで内部リダイレクトする。

最後のパラメーターでは、異なるパスまたはステータスコードを指定できる。

もし、nginxとアプリケーションを異なる仮想環境で稼働させている場合、`try_files`ディレクティブがファイル探索の対象とする場所は、あくまでnginxの稼働する仮想環境内になることに注意する。

内部リダイレクトによって、nginx内でリクエストが再処理される。

異なるパスに内部リダイレクトしていた場合は、パスに合ったlocationブロックで改めて処理される。

内部リダイレクトは、URLを書き換えてリダイレクトせずに処理を続行する『リライト』とは異なることに注意する。

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
    fastcgi_pass  127.0.0.1:9000;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include       fastcgi_params;
}
```

> - https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files

<br>

### ヘルスチェックの受信

#### ▼ nginxによるレスポンス

Webサーバーのみヘルスチェックを受信する。

ヘルスチェック用の`server`ブロックで、`gif`ファイルを含むレスポンスを返信するように`location`ブロックを定義する。

Nginxでアクセスログを出力する必要はないため、`location`ブロックでは`access_log`を無効化する。

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

Webサーバーとアプリケーションの両方でヘルスチェックを受信する。

アプリケーション側に`200`ステータスを含むレスポンスを返信するエンドポイントを実装したうえで、ヘルスチェック用の`server`ブロックでWebサーバーにルーティングするように`location`ブロックを定義する。

Nginxでアクセスログを出力する必要はないため、`location`ブロックでは`access_log`を無効化する。

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

## 03. ngx_http_index_module

### ディレクティブ

#### ▼ index

リクエストのURLがトレイリングスラッシュで終了する全ての場合、指定されたファイルをURLの末尾に追加する。

**＊実装例＊**

```nginx
index index.php;
```

> - https://nginx.org/en/docs/http/ngx_http_index_module.html

<br>

## 04. ngx_http_headers_module

### ディレクティブ

#### ▼ add_header

レスポンス時に付与するレスポンスヘッダーを設定する。

**＊実装例＊**

```nginx
# Referrer-Policyヘッダーに値を設定する
add_header Referrer-Policy "no-referrer-when-downgrade";
```

> - https://nginx.org/en/docs/http/ngx_http_headers_module.html#add_header

<br>

## 05. ngx_http_upstream_module

### ブロック

#### ▼ upstream

ロードバランシング先を設定する。

デフォルトでは、加重ラウンドロビン方式を基に通信をルーティングする。

注意点としては、このままでは宛先がスケーリングした時にIPアドレスを動的に取得できない。

そのため、`resolver`ディレクティブ、`upstream`ディレクティブ、UNIXドメインソケットを使用する必要がある。(ちょっと複雑すぎる...)

**＊実装例＊**

```nginx
upstream foo_servers {
    server 192.168.0.1:80;
    server 192.168.0.2:80;
    server 192.168.0.3:80;
}
```

> - https://nginx.org/en/docs/http/ngx_http_upstream_module.html#upstream
> - https://techblog.zozo.com/entry/techblog-rds-proxy#UNIX%E3%83%89%E3%83%A1%E3%82%A4%E3%83%B3%E3%82%BD%E3%82%B1%E3%83%83%E3%83%88%E3%82%92%E8%A8%AD%E5%AE%9A
> - https://ktrysmt.github.io/blog/name-specification-of-nginx/

<br>

## 06. ngx_http_fast_cgi_module

### ディレクティブ

#### ▼ fastcgi_params

FastCGIプロトコルでインバウンド通信をルーティングする場合、ルーティング先で使用する変数とその値を設定する。

**＊実装例＊**

```nginx
fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
```

> - https://nginx.org/en/docs/http/ngx_http_fastcgi_module.html#fastcgi_param

#### ▼ fastcgi_pass

FastCGIプロトコルでインバウンド通信をルーティングする場合、ルーティング先のアドレスとポートを設定する。

**＊実装例＊**

```nginx
fastcgi_pass 127.0.0.1:9000;
```

> - https://nginx.org/en/docs/http/ngx_http_fastcgi_module.html#fastcgi_pass

<br>

## 07. ngx_http_rewrite_module

### ディレクティブ

#### ▼ if

条件分岐を設定する。

```nginx
if ($request_uri = /) {
    # foo変数にfooを設定する
    set $foo foo;
}

if ($host ~* teambox.com) {
    # bar変数にbarを設定する
    set $bar bar;
}
```

> - https://qiita.com/ukitazume/items/ab1c929783e87227e466
> - https://gist.github.com/jrom/1760790

<br>

## 08. ngx_http_grpc_module

### ディレクティブ

#### ▼ grpc_pass

gRPCによるHTTPリクエストの宛先を設定する。

HTTP/2 (例：gRPC、GraphQLなど) を有効化する必要がある。

**＊実装例＊**

```nginx
grpc_pass 127.0.0.1:80;
```

```nginx
server {
    listen 80      default_server;

    # HTTP/2を有効化する
    http2 on;

    location / {
        grpc_pass 127.0.0.1:80;
    }
}
```

> - https://nginx.org/en/docs/http/ngx_http_grpc_module.html#grpc_pass
> - https://qiita.com/Morix1500/items/065da20d98ab5e559ea6#nginx%E3%81%AE%E6%A7%8B%E7%AF%89

<br>

## 09. ngx_http_proxy_module

### ディレクティブ

#### ▼ proxy_pass

HTTPプロトコルでインバウンド通信をルーティングする場合、ルーティング先のアドレスとポートを設定する。

**＊実装例＊**

```nginx
proxy_pass http://127.0.0.1:80;
```

受信したリクエストの情報をそのまま使って送信する場合、変数を使用する。

```nginx
proxy_pass $scheme://$host$request_uri;
```

> - https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass

<br>

## 10. ngx_http_stub_status_module

### ディレクティブ

#### ▼ stub_status

特定のパスにリクエストを送信することで、メトリクスを取得できるようにする。

```nginx
location = /metrics {
    stub_status;
}
```

```bash
$ curl localhost/metrics

Active connections: 1
server accepts handled requests
 93370 93370 74159
Reading: 0 Writing: 1 Waiting: 0
```

> - https://nginx.org/en/docs/http/ngx_http_stub_status_module.html
> - https://qiita.com/stanabe/items/a208377100a4ba2ea907

<br>

## 11. ngx_otel_module

### ngx_otel_moduleとは

Nginxコミュニティ製のモジュールであり、NginxをOpenTelemetryで計装できるようにする。

執筆時点 (2024/03/10) では、セットアップの簡単さやパフォーマンスでOpenTelemetry製の`otel_ngx_module`に勝っているらしい。

> - https://github.com/nginxinc/nginx-otel?tab=readme-ov-file
> - https://github.com/nginxinc/nginx-otel/issues/42

<br>

### セットアップ

#### ▼ 未ビルドの場合

モジュールをインポートする前に、ビルドする必要がある。

なお、gRPCのビルドは`30`分ほどかかるため、gRPCを含むビルド済みのモジュールをインストールした方が良い。

```bash
$ git clone https://github.com/nginxinc/nginx-otel.git
$ cd nginx-otel
$ mkdir build
$ cd build
$ cmake -DNGX_OTEL_NGINX_BUILD_DIR=/path/to/configured/nginx/objs
$ make -j2
$ make install
```

`ngx_otel_module`は動的モジュールであるため、`nginx.conf`ファイルでモジュールをインポートする必要がある。

```nginx
load_module modules/ngx_otel_module.so;
```

> - https://github.com/nginxinc/nginx-otel

その他、alpineはMercurialからインストールすると良い。

> - https://hg.nginx.org/pkg-oss/file/tip/alpine

#### ▼ ビルド済みの場合

ビルド済みモジュールをインストールする。

Nginx (`1.25.3`) であればビルトインパッケージになっているため、ビルドが不要である。

```bash
# aptリポジトリから
$ apt install -y nginx-module-otel
```

```bash
# yumリポジトリから
$ yum install -y nginx-module-otel
```

> - https://github.com/nginxinc/nginx-otel?tab=readme-ov-file#installing-the-otel-module-from-packages
> - https://nginx.org/packages/mainline/alpine/

Alpineの場合は、執筆時点 (2024/03/13) でalpineリポジトリに`ngx_otel_module`がなく、Nginxのalpineリポジトリにパッケージがある。

`apk`コマンドはそのまま使用すると常に最新をインストールしてしまう。

そこで、`wget`コマンドで一度ファイルを取得し、`apk`コマンドでそのファイルからモジュールをインストールする。

```bash
# nginxのalpineリポジトリから
$ wget -qO nginx-module-otel-<リビジョン>.apk https://nginx.org/packages/mainline/alpine/<バージョン>/main/x86_64/nginx-module-otel-<リビジョン>.apk
$ apk add --allow-untrusted nginx-module-otel-<バージョン>.apk
```

> - https://github.com/open-telemetry/opentelemetry-cpp-contrib/issues/302#issuecomment-1978230701
> - https://uepon.hatenadiary.com/entry/2023/03/20/165648

<br>

### ディレクティブ

#### ▼ otel_exporter

Exporterを設定する。

執筆時点 (2024/03/14) 時点では、gRPC用のエンドポイントしかありません。

```nginx
http {

    otel_exporter {
        endpoint foo-opentelemetry-collector.foo-namespace.svc.cluster.local:4317;
    }
}
```

> - https://nginx.org/en/docs/ngx_otel_module.html#otel_exporter

#### ▼ otel_service_name

```nginx
http {
    otel_service_name foo-service;
}
```

> - https://nginx.org/en/docs/ngx_otel_module.html#otel_service_name

#### ▼ otel_trace

分散トレースを有効化するフラグを設定する。

```nginx
http {
    otel_trace on;
}
```

> - https://nginx.org/en/docs/ngx_otel_module.html#otel_trace

#### ▼ otel_trace_context

```nginx
http {
    # 受信したCarrierにトレースコンテキストがない場合はInjectし、あればExtractする
    otel_trace_context propagate;
}
```

> - https://nginx.org/en/docs/ngx_otel_module.html#otel_trace_context
> - https://raffaelemarcello.medium.com/nginx-plus-monitoring-and-tracing-harnessing-the-power-of-opentelemetry-65477020d864

#### ▼ otel_span_name

スパン名を設定する。

デフォルトでは、リクエストのLocation値がスパン名になる。

```nginx
http {

    location / {
        otel_span_name foo;
        proxy_pass $scheme://$host$request_uri;
    }
}
```

> - https://nginx.org/en/docs/ngx_otel_module.html#otel_span_name
> - https://www.nginx.co.jp/blog/tutorial-configure-opentelemetry-for-your-applications-using-nginx/

#### ▼ otel_span_attr

スパンの属性を設定する。

```nginx
http {

    location / {
        otel_span_attr otel.resource.deployment.environment <実行環境名>;
        proxy_pass $scheme://$host$request_uri;
    }
}
```

> - https://nginx.org/en/docs/ngx_otel_module.html#otel_span_attr

<br>

### 変数

#### ▼ `$otel_trace_id`

トレースIDが割り当てられている。

ログにトレースIDを埋め込む場合に使用できる。

```nginx
http {
    log_format main escape=json '{'
    '"TraceId": "$otel_trace_id"'
    '}';
}
```

> - https://nginx.org/en/docs/ngx_otel_module.html#variables

#### ▼ `$otel_span_id`

現在のスパンIDが割り当てられている。

> - https://nginx.org/en/docs/ngx_otel_module.html#variables

#### ▼ `$otel_parent_id`

親スパンのスパンIDが割り当てられている。

> - https://nginx.org/en/docs/ngx_otel_module.html#variables

#### ▼ `$otel_parent_sampled`

受信したリクエストに親スパンが存在する場合、`1`になる。

Parent Basedなサンプリングを実行できる。

```nginx
http {
    otel_trace $otel_parent_sampled;
}
```

> - https://nginx.org/en/docs/ngx_otel_module.html#variables

<br>
