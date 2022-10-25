---
title: 【IT技術の知見】Nginx＠Web系ミドルウェア
description: Nginx＠Web系ミドルウェアの知見を記録しています。
---

# Nginx＠Web系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/index.html

<br>

## 01. Nginxの仕組み

### アーキテクチャ

![nginx_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/nginx_architecture.png)

Nginxは、マスタープロセス、ワーカープロセス、プロキシキャッシュストレージ、キャッシュローダー、キャッシュマネージャー、から構成される。Nginxの起動時に最初にマスタープロセスが実行され、Nginxに設定を適用する。また、マスタープロセスは子プロセスとしてのワーカープロセスを実行し、各ワーカープロセスがリクエストを並列的に処理する。ワーカープロセスは、キャッシュローダーを使用して、静的ファイルのキャッシュをメモリ上のプロキシキャッシュストレージに保存し、加えて一方で保存されたキャッシュを取得する。キャッシュマネージャは、保存されたキャッシュの有効期限を管理する。

> ℹ️ 参考：
>
> - https://www.codetd.com/en/article/12312272
> - https://rainbow-engine.com/nginx-apache-difference/

<br>

## 02. ユースケース

### リバースプロキシのミドルウェアとして

#### ▼ 構成

リバースプロキシのミドルウェアとして使用する場合、Nginxをパブリックネットワークに公開しさえすれば、パブリックネットワークからNginxを介して、後段のアプリケーションにアクセスできるようになる。

#### ▼ HTTP/HTTPSプロトコルの場合

Nginxは、インバウンド通信をappサーバーにルーティングする。また、appサーバーからのレスポンスのデータが静的ファイルであった場合、これのキャッシュをプロキシキャッシュストレージに保存する。以降に同じ静的ファイルに関するインバウンド通信があった場合、Nginxはappサーバーにルーティングせずに、保存されたキャッシュを取得し、レスポンスとして返信する。

![リバースプロキシサーバーとしてのNginx](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/リバースプロキシサーバーとしてのNginx.png)

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
        proxy_pass http://localhost:8080;
    }
}
```

#### ▼ FastCGIプロトコルの場合

![NginxとPHP-FPMの組み合わせ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/NginxとPHP-FPMの組み合わせ.png)

PHP-FPMはFastCGIプロトコルでインバウンド通信を受信するため、これに変換する必要がある。静的ファイルのインバウンド通信が送信されてきた場合、Nginxはそのままレスポンスを返信する。動的ファイルのインバウンド通信が送信されてきた場合、Nginxは、FastCGIプロトコルを介して、PHP-FPMにインバウンド通信をリダイレクトする。

```bash
# 設定ファイルのバリデーション
$ php-fpm -t
```

**＊実装例＊**

```nginx
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
        fastcgi_pass   localhost:9000;
        # もしくは、UNIXドメインソケット
        # fastcgi_pass unix:/run/php-fpm/www.sock;
        
        # ルーティング先のURL（rootディレクティブ値+パスパラメータ）
        fastcgi_param  SCRIPT_FILENAME $document_root$fastcgi_script_name;

        # 設定ファイルからデフォルト値を読み込む
        include        fastcgi_params;
    }
}
```

<br>

### ロードバランサ－のミドルウェアとして

#### ▼ ```L7```ロードバランサーの場合

Nginxは、HTTPプロトコルのインバウンド通信を複数のwebサーバーに負荷分散的に振り分ける。受信したインバウンド通信がHTTPプロトコルであった場合、HTTPSプロトコルにリダイレクトすると良い。また、HTTPSプロトコルであれば、HTTPに変換してルーティングすると良い。ただし、HTTPSプロトコルのインバウンド通信を受信するために、NginxにSSL証明書を設定する必要がある。

> ℹ️ 参考：http://nginx.org/en/docs/http/load_balancing.html

**＊実装例＊**

```nginx
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
    listen 443 ssl http2;
    index index.php index.html;

    #-------------------------------------
    # SSL
    #-------------------------------------
    ssl on;
    ssl_certificate /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;
    add_header Strict-Transport-Security "max-age=86400";

    location / {
        proxy_pass http://foo_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Port $remote_port;
    }
    
    # ルーティング先のリスト
    upstream foo_servers {
        server srv1.example.com;
        server srv2.example.com;
        server srv3.example.com;
    }
}
```

#### ▼ ```L4```ロードバランサーの場合

Nginxは、TCPプロトコルのインバウンド通信を複数のサーバーに負荷分散的に振り分ける。

> ℹ️ 参考：https://engineering.mercari.com/blog/entry/2016-08-17-170114/

**＊実装例＊**

```nginx
#-------------------------------------
# TCPリクエスト
#-------------------------------------
stream {
    error_log /var/log/nginx/stream.log info;
    proxy_protocol on;
    
    upstream grpc_servers {
        server 192.168.0.1:50051;
        server 192.168.0.2:50051;
    }
    
    server {
        listen 50051;
        proxy_pass grpc_servers;
    }
}
```

<br>
