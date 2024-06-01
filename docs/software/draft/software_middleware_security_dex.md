---
title: 【IT技術の知見】Dex＠セキュリティ系ミドルウェア
description: Dex＠セキュリティ系ミドルウェアの知見を記録しています。
---

# Dex＠セキュリティ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Dexとは

SSO (例：OAuth、SAML、OIDC、など) のIDプロバイダー、または認証処理として認可リクエストを送信する。

> - https://medium.com/@sct10876/keycloak-vs-dex-71f7fab29919

<br>

## 02. 認証方法

### OIDC

#### ▼ Keycloakの場合

```yaml
connectors:
  - type: oidc
    id: keycloak
    name: keycloak
    config:
      # 認可エンドポイント
      issuer: https://<Keycloakのドメイン>/auth/realms/<realm名>
      clientID: <Keycloakに認可リクエストを送信するクライアント名>
      clientSecret: *****
      redirectURI: <コールバックURL>
      scope:
        - openid
        - profile
        - groupd
```

> - https://dexidp.io/docs/connectors/oidc/
> - https://dexidp.io/docs/custom-scopes-claims-clients/

<br>
