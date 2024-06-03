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

SSO (例：OAuth、SAML、OIDC、など) のIDプロバイダーに認可リクエストを送信する。

> - https://dexidp.io/docs/
> - https://medium.com/@sct10876/keycloak-vs-dex-71f7fab29919

<br>

## 02. connectors

### connectorsとは

認可リクエストの宛先を設定する。

> - https://dexidp.io/docs/connectors/

<br>

### Multiple ID Provider

複数のプロバイダーを設定する。

```yaml
connectors:
  - type: oidc
    id: foo
    name: foo
  - type: oidc
    id: bar
    name: bar
```

> - https://qiita.com/hiyosi/items/4baa612a219dc0a87575#multiple-idp-provider

<br>

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

## 03. grpc

gRPCサーバーのエンドポイントを設定する。

```yaml
grpc:
  addr: 127.0.0.1:5557
```

<br>

## 04. issuer

```yaml
issuer: http://127.0.0.1:5556/dex
```

<br>

## 05. storage

```yaml
storage:
  type: memory
```

<br>

## 06. web

HTTPサーバーのエンドポイントを設定する。

```yaml
web:
  http: 127.0.0.1:5556
```

<br>
