---
title: 【IT技術の知見】Webスコープ設定ファイル＠Temporal
description: Webスコープ設定ファイル＠Temporalの知見を記録しています。
---

# Webスコープ設定ファイル＠Temporal

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. auth

### enabled

ビルトインの認証機能を有効化するかどうかを設定する。

```yaml
auth:
  enabled: true
```

> - https://docs.temporal.io/references/web-ui-configuration#auth

<br>

### providers

IDプロバイダーを設定する。

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

> - https://docs.temporal.io/references/web-ui-configuration#auth
> - https://github.com/temporalio/ui-server/blob/main/config/development.yaml#L24-L39

<br>
