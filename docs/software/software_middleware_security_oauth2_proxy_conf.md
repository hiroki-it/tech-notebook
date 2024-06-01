---
title: 【IT技術の知見】設定ファイル＠OAuth2 Proxy
description: 設定ファイル＠OAuth2 Proxyの知見を記録しています。
---

# 設定ファイル＠OAuth2 Proxy

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. client

### client_id

```bash
client_id = "<クライアントID>"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview#command-line-options

<br>

### client_secret

```bash
client_secret = "<クライアントシークレット>"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview#command-line-options

<br>

## 02. http

### http_address

```bash
http_address = "127.0.0.1:4180"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview#command-line-options

<br>

### https_address

```bash
https_address = ":443"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview#command-line-options

<br>

### oidc_issuer_url

OIDCのIDプロバイダーの認可エンドポイントを設定する。

```bash
# 認証方法がOIDCで、IDプロバイダーがKeycloakの場合
oidc_issuer_url="https://<Keycloakのドメイン>/auth/realms/<realm名>"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/providers/keycloak_oidc

<br>

### provider

```bash
# 認証方法がOIDCで、任意のIDプロバイダーの場合
provider = "oidc"
```

```bash
# 認証方法が任意で、IDプロバイダーがGitHubの場合
provider = "github"
```

```bash
# 認証方法が任意で、IDプロバイダーがKeycloakの場合
provider = "keycloak"
```

```bash
# 認証方法がOIDCで、IDプロバイダーがKeycloakの場合
provider = "keycloak-oidc"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/providers/openid_connect
> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/providers/github
> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/providers/keycloak_oidc

<br>

## 03. redirect_url

コールバックURL (IDプロバイダーからの認可レスポンスのリダイレクト先URL) を設定する。

```bash
redirect_url = "https://example.com/oauth2/callback"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview#command-line-options

<br>

## 04. reverse_proxy

OAuth2 Proxyのダウンストリームに任意のリバースプロキシ (例：Nginx) があるかどうかを設定する。

```bash
reverse_proxy = true
```

OAuth2 Proxyは、認証状況に応じて、Nginxに`202`または`401`ステータスコードを返却する。

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
        # OAuth2 Proxyのドメイン名を設定する
        proxy_pass              https://<ドメイン名>:4180;
        proxy_pass_request_body off;
        proxy_set_header        Host $http_host;
    }

}
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview#configuring-for-use-with-the-nginx-auth_request-directive
> - https://nginx.org/en/docs/http/ngx_http_auth_request_module.html
> - https://tech.jxpress.net/entry/2018/08/23/104123

<br>

## 05. upstreams

OAuth2 ProxyのアップストリームのWebサーバーのURLを設定する。

注意点として、IDプロバイダーのURLではない。

```bash
upstreams = [
  "http://127.0.0.1/"
]
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview#command-line-options
> - https://github.com/oauth2-proxy/oauth2-proxy/blob/master/contrib/local-environment/oauth2-proxy-keycloak.cfg

<br>
