---
title: 【IT技術の知見】Keycloak＠CNCF
description: Keycloak＠CNCFの知見を記録しています。
---

# Keycloak＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Keycloakとは

アプリケーションに代わって、認証認可処理を実行する。

認証認可に関するAPIを公開し、認証時のアカウントのCRUDや、認可時のアカウントに対する権限スコープ付与、を実行できる。

> - https://www.keycloak.org/docs-api/22.0.1/rest-api/index.html
> - https://blog.linkode.co.jp/entry/2023/08/23/000000

<br>

## 01-02. 仕組み

### アーキテクチャ

Keycloakは、認証処理サービス、Infinispan、アカウント管理用のRDBMS、といったコンポーネントから構成されている。

![keycloak_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/keycloak_architecture.png)

> - https://blog.palark.com/ha-keycloak-infinispan-kubernetes/

<br>

## Infinispan

キャッシュを保管する。

<br>

## RDBMS

アカウント情報を保管する。

<br>

### ユースケース

#### ▼ 認証マイクロサービスとして

認証マイクロサービスとして、認証/認可処理を実施する。

ここでは、JWTによる認証を採用する。

まずAPI GatewayとしてのNginxは、Keycloakにリクエストを送信する。

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
            proxy_pass          http://keycloak:8080/;
            proxy_set_header    Host               $host;
            proxy_set_header    X-Real-IP          $remote_addr;
            proxy_set_header    X-Forwarded-For    $proxy_add_x_forwarded_for;
            proxy_set_header    X-Forwarded-Host   $host;
            proxy_set_header    X-Forwarded-Server $host;
            proxy_set_header    X-Forwarded-Port   $server_port;
            proxy_set_header    X-Forwarded-Proto  $scheme;
        }


        location /keycloak/auth/ {
            proxy_pass          http://keycloak:8080/keycloak/auth/;
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

Nginxは、『ヘッダー』『ペイロード』『署名』のそれぞれのJSON型データを`base64`方式によってエンコードし、ドットでつなぐことで、JWTを作成する。

> - https://zenn.dev/mikakane/articles/tutorial_for_jwt#jwt-%E3%81%AE%E3%83%87%E3%83%BC%E3%82%BF%E6%A7%8B%E9%80%A0
> - https://qiita.com/t-mogi/items/2728586959f16849443f#%E3%82%AF%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%B3%E3%83%88%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%A0%E5%81%B4%E3%81%A7%E3%81%AE%E5%AF%BE%E5%BF%9C

<br>
