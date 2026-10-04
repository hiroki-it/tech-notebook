---
title: 【IT技術の知見】Webスコープ設定ファイル＠Temporal
description: Webスコープ設定ファイル＠Temporalの知見を記録しています。
---

# Web スコープ設定ファイル＠Temporal

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. auth

### enabled

ビルトインの認証機能を有効化するフラグを設定する。

```yaml
auth:
  enabled: true
```

> - [Temporal Web UI configuration reference \| Temporal Documentation](https://docs.temporal.io/references/web-ui-configuration#auth)

<br>

### providers

ID プロバイダーを設定する。

```yaml
auth:
enabled: true
  providers:
    label: sso
    type: oidc
    providerUrl: https://accounts.google.com
    issuerUrl:
    clientId: xxxxx-xxxx.apps.googleusercontent.com
    clientSecret: xxxxxxxxxxxxxxxxxxxx
    callbackUrl: https://xxxx.com:8080/sso/callback
    scopes:
      - openid
      - profile
      - email
```

> - [Temporal Web UI configuration reference \| Temporal Documentation](https://docs.temporal.io/references/web-ui-configuration#auth)
> - [ui-server/config/development.yaml at main · temporalio/ui-server · GitHub](https://github.com/temporalio/ui-server/blob/main/config/development.yaml#L24-L39)

<br>
