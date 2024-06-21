---
title: 【IT技術の知見】Nginx＠Web系ミドルウェア
description: Nginx＠Web系ミドルウェアの知見を記録しています。
---

# Nginx＠Web系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Nginxの仕組み

### アーキテクチャ

![nginx_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/nginx_architecture.png)

Nginxは、マスタープロセス、ワーカープロセス、プロキシキャッシュストレージ、キャッシュローダー、キャッシュマネージャー、といったコンポーネントから構成される。

Nginxの起動時に最初にマスタープロセスが実行され、Nginxに設定を適用する。

また、マスタープロセスは子プロセスとしてのワーカープロセスを実行し、各ワーカープロセスがリクエストを並列的に処理する。

ワーカープロセスは、キャッシュローダーを使用して、静的ファイルのキャッシュをメモリ上のプロキシキャッシュストレージに保管し、加えて一方で保管されたキャッシュを取得する。

キャッシュマネージャは、保管されたキャッシュの有効期限を管理する。

> - https://www.codetd.com/en/article/12312272
> - https://rainbow-engine.com/nginx-apache-difference/

<br>

### Redix Treeアルゴリズム

Nginxは、リクエストのIPアドレスを照合して、リクエストを許可/拒否する。

この時、Redix Treeアルゴリズムに基づいて、IPアドレスを高速で照合している。

> - https://csatlas.com/c-radix-tree-nginx/

<br>

### モジュール

#### ▼ 静的モジュール

静的モジュールは、ビルド後にApacheのバイナリに組み込む必要がある。

必要不要かにかかわらず、Nginxと一緒に強制的に実行する必要がある。

#### ▼ 動的モジュール

動的モジュールは、ビルド後にNginxのバイナリに組み込む必要がない。

必要な場合にのみインストールし、また実行すればよい。

動的モジュールは、`load_module`ディレクティブで読み込む。

```nginx
load_module modules/<動的モジュール名>.so;
```

執筆時点 (2024/03/12) では、以下の動的モジュールがあらかじめインストールされている。

それ以外の動的モジュール (`nginx-module-otel`) はインストールする必要がある。

```bash
$ ls /etc/nginx/modules

ngx_http_geoip_module.so
ngx_http_js_module-debug.so
ngx_http_xslt_filter_module.so
ngx_stream_js_module-debug.so
ngx_http_image_filter_module-debug.so
ngx_http_js_module.so
ngx_stream_geoip_module-debug.so
ngx_stream_js_module.so
ngx_http_geoip_module-debug.so
ngx_http_image_filter_module.so
ngx_http_xslt_filter_module-debug.so
ngx_stream_geoip_module.so
```

> - https://nginx.org/en/linux_packages.html#dynmodules
> - https://heartbeats.jp/hbblog/2016/02/nginx-dynamic-modules.html

<br>

## 02. ユースケース

### リバースプロキシのミドルウェアとして

#### ▼ 構成

Nginxを配置し、リクエストをwebサーバーにルーティングする。

リバースプロキシのミドルウェアとして使用する場合、Nginxをパブリックネットワークに公開しさえすれば、パブリックネットワークからNginxを介して、後段のwebサーバーにリクエストを送信できるようになる。

#### ▼ HTTP/HTTPSプロトコルの場合

Nginxは、HTTP/HTTPSリクエストをルーティングする。

また、appサーバーからのレスポンスのデータが静的ファイルであった場合、これのキャッシュをプロキシキャッシュストレージに保管する。

以降に同じ静的ファイルに関するインバウンド通信があった場合、Nginxはappサーバーにルーティングせずに、保管されたキャッシュを取得し、レスポンスとして返信する。

![リバースプロキシサーバーとしてのNginx](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/リバースプロキシサーバーとしてのNginx.png)

**＊実装例＊**

```nginx
#-------------------------------------
# HTTPリクエスト
#-------------------------------------
server {
    server_name example.com;
    listen 80;
    return 301 https://$host$request_uri;

    #-------------------------------------
    # 静的ファイルであればNginxでレスポンス
    #-------------------------------------
    location ~ ^/(images|javascript|js|css|flash|media|static)/ {
        root /var/www/foo/static;
        expires 30d;
    }

    #-------------------------------------
    # 動的ファイルであればwebサーバーにルーティング
    #-------------------------------------
    location / {
        proxy_pass $scheme://$host$request_uri;
    }
}
```

**＊実装例＊**

もし分散トレースを採用する場合、マイクロサービス間でトレースコンテキストを伝播する必要がある。

クライアント/サーバー側のリバースプロキシでトレースコンテキストを伝播できるようにする。

サービスメッシュツール (例：Istio) を使用すれば、これのサイドカープロキシがアップストリーム側のコンテナにトレースコンテキストを伝播してくれるが、Nginxであれば自前で実装する必要がある。

```nginx
# クライアント側
http {
    # $_request_id
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request_uri" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for" "$_request_id"';

    server {

        listen 80;

        # REQUEST-IDからリクエストIDを取得する
        set $tmp $request_id;

        # X-REQUEST-IDヘッダーにトレースIDがあれば、リクエストIDを上書きする
        if ($http_x_request_id) {
            set $tmp $http_x_request_id;
        }

        access_log logs/access.log  main;

        location / {
            proxy_pass $scheme://$host$request_uri;
            # X-REQUEST-IDヘッダーにトレースIDを設定し、リクエスト送信する
            proxy_set_header X-Request-ID $tmp;
        }
    }
}
```

```nginx
# サーバー側
http {
    # $_request_id を参照する
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request_uri" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for" "$_request_id"';

    server {

        listen 80;

        # REQUEST-IDからリクエストIDを取得する
        set $tmp $request_id;

        # X-REQUEST-IDヘッダーにトレースIDがあれば、リクエストIDを上書きする
        if ($http_x_request_id) {
            set $tmp $http_x_request_id;
        }

        access_log logs/access.log  main;

        location = /server {
            echo "This is server side";
        }
    }
}
```

> - https://qiita.com/toritori0318/items/d82f9beccd76ea8ccb85
> - https://gist.github.com/toritori0318/2dc2b64ff696822b02d202bf1fc2f5b2

#### ▼ FastCGIプロトコルの場合

![NginxとPHP-FPMの組み合わせ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/NginxとPHP-FPMの組み合わせ.png)

PHP-FPMはFastCGIプロトコルでリクエストを受信するため、これに変換する必要がある。

静的ファイルのインバウンド通信が送信されてきた場合、Nginxはそのままレスポンスを返信する。

動的ファイルのインバウンド通信が送信されてきた場合、Nginxは、FastCGIプロトコルを介して、PHP-FPMにインバウンド通信をリダイレクトする。

```bash
# 設定ファイルのバリデーション
$ php-fpm -t
```

**＊実装例＊**

```nginx
http {

    #-------------------------------------
    # HTTPリクエスト
    #-------------------------------------
    server {
        listen      80;
        server_name example.com;
        root        /var/www/foo/public;
        index       index.php index.html;

        include /etc/nginx/default/nginx.conf;

        #『/』で始まる全てのインバウンド通信の場合
        location / {
            try_files $uri $uri/ /index.php?$query_string;
        }

        #--------------------------------------------------
        # インバウンド通信をFastCGIプロトコルでルーティングする。
        # OSによって、fastcgi_paramsファイルの必要な設定が異なる
        #--------------------------------------------------
        location ~ \.php$ {
            # ルーティング先のTCPソケット
            fastcgi_pass   127.0.0.1:9000;
            # もしくは、Unixドメインソケット
            # fastcgi_pass unix:/run/php-fpm/www.sock;

            # ルーティング先のURL (rootディレクティブ値+パスパラメータ)
            fastcgi_param  SCRIPT_FILENAME $document_root$fastcgi_script_name;

            # 設定ファイルからデフォルト値を読み込む
            include        fastcgi_params;
        }
    }
}
```

#### ▼ gRPCプロトコルの場合

Nginxは、HTTP/HTTPS/gRPCリクエストをgRPCとしてルーティングする。

```nginx
stream {

    server {

        listen 8080 ssl http2;
        server_name host.docker.internal;

        ssl_certificate /ssl/localhost+1.pem;
        ssl_certificate_key /ssl/localhost+1-key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;

        access_log /dev/stdout;
        error_log /dev/stderr debug;


        location ~ \.(html|js)$ {
            root /var/www/html;
        }

        # HTTPSリクエストをマッチングする
        location / {
            grpc_set_header Content-Type application/grpc;
            # gRPCサーバーにルーティングする
            grpc_pass grpc://localhost:50051;
        }

        # gRPCリクエストをマッチングする
        location /hello.HelloService/Hello {
            grpc_set_header Content-Type application/grpc;
            # gRPCサーバーにルーティングする
            grpc_pass grpc://localhost:50052;
            include common/cors.conf;
        }
    }
}
```

> - https://www.nginx.co.jp/blog/nginx-1-13-10-grpc/
> - https://qiita.com/Morix1500/items/065da20d98ab5e559ea6#nginx%E3%81%AE%E6%A7%8B%E7%AF%89

<br>

### フォワードプロキシのミドルウェアとして

#### ▼ 構成

フォワードプロキシのミドルウェアとして使用できる。

クライアントサイドにNginxを配置し、リクエストを外部ネットワークにルーティングする。

#### ▼ HTTP/HTTPSプロトコルの場合

```nginx
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;

    keepalive_timeout  65;

    server {
        listen                         3128;

        resolver                       8.8.8.8;

        proxy_connect;
        proxy_connect_allow            443 563;
        proxy_connect_connect_timeout  10s;
        proxy_connect_read_timeout     10s;
        proxy_connect_send_timeout     10s;

        # 受信したリクエストを外部ネットワークにルーティングする。
        location / {
            proxy_pass $scheme://$host$request_uri;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Port $remote_port;
        }
    }
}
```

<br>

### `L4`/`L7`ロードバランサ－のミドルウェアとして

#### ▼ `L7`ロードバランサーの場合

`L7`ロードバランサーとして使用できる。

Nginxは、HTTPプロコトルのインバウンド通信を複数のwebサーバーに負荷分散的に振り分ける。

受信した通信がHTTPプロトコルであった場合、HTTPSリクエストにリダイレクトすると良い。

また、HTTPSプロトコルであれば、HTTPに変換してルーティングすると良い。

ただし、HTTPSプロトコルのリクエストを受信するために、NginxにSSL証明書を設定する必要がある。

**＊実装例＊**

```nginx
http {

    resolver <DNSサーバー> valid=5s;

    #-------------------------------------
    # HTTPリクエスト
    #-------------------------------------
    server {
        server_name example.com;
        listen 80;
        # リダイレクト
        return 301 https://$host$request_uri;
    }

    #-------------------------------------
    # HTTPSリクエスト
    #-------------------------------------
    server {
        server_name example.com;
        listen unix:/var/run/rds_1a_001.sock;
        index index.php index.html;

        #-------------------------------------
        # SSL
        #-------------------------------------
        ssl on;
        ssl_certificate /etc/nginx/ssl/server.crt;
        ssl_certificate_key /etc/nginx/ssl/server.key;
        add_header Strict-Transport-Security "max-age=86400";

        listen unix:/var/run/ip_addresses.sock;

        set $ip_addresses "example.com";

        location / {
            proxy_pass $scheme://$ip_addresses;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Port $remote_port;
        }
    }
}
```

> - https://techblog.zozo.com/entry/techblog-rds-proxy#UNIX%E3%83%89%E3%83%A1%E3%82%A4%E3%83%B3%E3%82%BD%E3%82%B1%E3%83%83%E3%83%88%E3%82%92%E8%A8%AD%E5%AE%9A
> - https://marcospereirajr.com.br/using-nginx-as-api-gateway-7bebb3614e48

#### ▼ `L4`ロードバランサーの場合

Nginxは、TCPスリーウェイハンドシェイクを複数のサーバーにTCPプロトコルのまま負荷分散的に振り分ける。

`L4`ロードバランサーのため、宛先のサーバーでTCPプロトコルをHTTPプロトコルに変換するように処理しなければならない。

**＊実装例＊**

```nginx
#-------------------------------------
# TCPスリーウェイハンドシェイク
#-------------------------------------
stream {
    error_log /var/log/nginx/stream.log info;
    proxy_protocol on;

    resolver <DNSサーバー> valid=5s;

    server {
        listen unix:/var/run/ip_addresses.sock;

        set $ip_addresses "example.com";

        location / {
            proxy_pass $scheme://$ip_addresses;
        }
    }
}
```

> - https://engineering.mercari.com/blog/entry/2016-08-17-170114/
> - https://techblog.zozo.com/entry/techblog-rds-proxy#UNIX%E3%83%89%E3%83%A1%E3%82%A4%E3%83%B3%E3%82%BD%E3%82%B1%E3%83%83%E3%83%88%E3%82%92%E8%A8%AD%E5%AE%9A
> - https://marcospereirajr.com.br/using-nginx-as-api-gateway-7bebb3614e48

<br>

### API Gatewayとして

#### ▼ API Gatewayに必要な機能

NginxをAPI Gatewayとして使用する。

API Gatewayのため、リバースプロキシやロードバランサーとは異なり、以下の機能を持つ必要がある。

- 受信した通信を適切なマイクロサービスのAPIにルーティング
- 認証
- トレースIDの付与
- キャッシュの作成
- リクエスト制限

#### ▼ ルーティング

**＊実装例＊**

```nginx
http {

    resolver <DNSサーバー> valid=5s;

    server {
        listen unix:/var/run/products_ip_addresses.sock;
        listen unix:/var/run/users_ip_addresses.sock;

        set $products_ip_addresses "products.example.com";
        set $users_ip_addresses "users.example.com";

        # Products API
        location /api/products {
            proxy_pass $scheme://$products_ip_addresses:80;
        }

        # Users API
        location /api/users {
            proxy_pass $scheme://$users_ip_addresses:80;
        }
    }
}
```

> - https://techblog.zozo.com/entry/techblog-rds-proxy#UNIX%E3%83%89%E3%83%A1%E3%82%A4%E3%83%B3%E3%82%BD%E3%82%B1%E3%83%83%E3%83%88%E3%82%92%E8%A8%AD%E5%AE%9A
> - https://marcospereirajr.com.br/using-nginx-as-api-gateway-7bebb3614e48

#### ▼ 認証

Keycloakと連携し、NginxではなくKeycloak側で認証処理を実施する。

Nginx (Keycloakクライアント) は、Keycloakの認可エンドポイントにトークン検証リクエストを送信する。

```nginx
user  nginx;
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  text/html;

    server {
        listen 8080;

        location /keycloak/ {
            proxy_pass          $scheme://<Keycloakのドメイン>/;
            proxy_set_header    Host               $host;
            proxy_set_header    X-Real-IP          $remote_addr;
            proxy_set_header    X-Forwarded-For    $proxy_add_x_forwarded_for;
            proxy_set_header    X-Forwarded-Host   $host;
            proxy_set_header    X-Forwarded-Server $host;
            proxy_set_header    X-Forwarded-Port   $server_port;
            proxy_set_header    X-Forwarded-Proto  $scheme;
        }

        location /keycloak/auth/ {
            # 認可エンドポイントにトークン検証リクエストを送信する
            proxy_pass          $scheme://<Keycloakのドメイン>/realms/<realm名>;
            proxy_set_header    Host               $host;
            proxy_set_header    X-Real-IP          $remote_addr;
            proxy_set_header    X-Forwarded-For    $proxy_add_x_forwarded_for;
            proxy_set_header    X-Forwarded-Host   $host;
            proxy_set_header    X-Forwarded-Server $host;
            proxy_set_header    X-Forwarded-Port   $server_port;
            proxy_set_header    X-Forwarded-Proto  $scheme;
        }
    }
}
```

> - https://github.com/jinnerbichler/keycloak-nginx/blob/master/nginx.conf

<br>
