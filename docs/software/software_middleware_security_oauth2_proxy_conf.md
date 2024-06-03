---
title: 【IT技術の知見】設定ファイル＠OAuth2 Proxy
description: 設定ファイル＠OAuth2 Proxyの知見を記録しています。
---

# 設定ファイル＠OAuth2 Proxy

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. providers

### clientID

IDプロバイダーで発行したクライアントIDを設定する。

```yaml
providers:
  - clientID: "<クライアントID>"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/alpha-config/#provider

<br>

### clientSecret

IDプロバイダーで発行したクライアントシークレットを設定する。

```yaml
providers:
  - clientSecret: "<クライアントシークレット>"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/alpha-config/#provider

<br>

### oidcConfig

#### ▼ issuerURL

OIDCのIDプロバイダーの認可エンドポイントを設定する。

```yaml
# 認証方法がOIDCで、IDプロバイダーがKeycloakの場合
providers:
  - oidcConfig:
      issuerURL: "https://<Keycloakのドメイン>/auth/realms/<realm名>"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/providers/keycloak_oidc

```yaml
# 認証方法がOIDCで、IDプロバイダーがAWS Cognitoの場合
providers:
  - issuerURL: "https://cognito-idp.ap-northeast-1.amazonaws.com/<ユーザープールID>"
```

> - https://zenn.dev/casa_snona/articles/nginx-with-oauth2-proxy#oauth2-proxy-%E3%81%AE%E8%A8%AD%E5%AE%9A%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%82%92%E4%BD%9C%E6%88%90

#### ▼ emailClaim

記入中...

#### ▼ groupsClaim

記入中...

#### ▼ insecureSkipNonce

記入中...

#### ▼ userIDClaim

記入中...

<br>

### provider

```yaml
# 認証方法がOIDCで、任意のIDプロバイダーの場合
providers:
  - provider: "oidc"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/providers/openid_connect

```yaml
# 認証方法が任意で、IDプロバイダーがGitHubの場合
providers:
  - provider: "github"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/providers/github

```yaml
# 認証方法が任意で、IDプロバイダーがKeycloakの場合
providers:
  - provider: "keycloak"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/providers/keycloak

```yaml
# 認証方法がOIDCで、IDプロバイダーがKeycloakの場合
providers:
  - provider: "keycloak-oidc"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/providers/keycloak_oidc

<br>

## 02. injectRequestHeaders

記入中...

<br>

## 03. server

### BindAddress

```yaml
server:
  - BindAddress: "127.0.0.1:4180"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/alpha-config/#server

<br>

### SecureBindAddress

```yaml
server:
  - SecureBindAddress: "127.0.0.1:443"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/alpha-config/#server

<br>

<br>

## 04. redirect_url

コールバックURL (IDプロバイダーからの認可レスポンスのリダイレクト先URL) を設定する。

```yaml
redirect_url: "https://<アプリのドメイン>/oauth2/callback"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview#command-line-options
> - https://oauth2-proxy.github.io/oauth2-proxy/features/endpoints/

<br>

## 05. reverse_proxy

OAuth2 Proxyのダウンストリームに任意のリバースプロキシ (例：Nginx) があるかどうかを設定する。

OAuth2 ProxyはIDプロバイダーから認可レスポンスを受信し、リバースプロキシにこれを返信する。

```yaml
reverse_proxy: true
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview#configuring-for-use-with-the-nginx-auth_request-directive

例えばNginxは、認可レスポンスのステータスコードが`200`であれば認証成功、`401`または`403`であれば認証失敗とし、アプリケーションへのリクエストを許可/拒否する。

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

> - https://nginx.org/en/docs/http/ngx_http_auth_request_module.html
> - https://tech.jxpress.net/entry/2018/08/23/104123
> - https://techlife.cookpad.com/entry/2015/10/16/080000

<br>

## 06. upstreamConfig

### upstreams

#### ▼ uri

OAuth2 ProxyのアップストリームのWebサーバーのURLを設定する。

注意点として、IDプロバイダーのURLではない。

```yaml
upstreamConfig:
  upstreams:
    - uri: "http://127.0.0.1/"
```

> - https://oauth2-proxy.github.io/oauth2-proxy/configuration/alpha-config/#upstream

<br>
