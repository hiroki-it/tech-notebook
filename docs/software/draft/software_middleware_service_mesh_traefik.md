---
title: 【IT技術の知見】Traefik＠サービスメッシュ系ミドルウェア
description: Traefik＠サービスメッシュ系ミドルウェアの知見を記録しています。
---

# Traefik＠サービスメッシュ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. トラフィック管理

### サービス検出

> - https://doc.traefik.io/traefik/providers/overview/

<br>

### ロードバランシング

> - https://doc.traefik.io/traefik/routing/overview/

<br>

## 02. 回復性管理

> - https://doc.traefik.io/traefik/middlewares/http/circuitbreaker/

<br>

## 03. セキュリティ

### 認証認可

IDプロバイダーと通信し、認証認可を実施する。

> - https://doc.traefik.io/traefik/middlewares/http/forwardauth/

<br>

### 証明書管理

Cert Managerと連携する必要がある。

> - https://doc.traefik.io/traefik/user-guides/cert-manager/

<br>

## 04. オブザーバビリティー

### ログ

#### ▼ 実行ログ

記入中...

#### ▼ アクセスログ

```yaml
{
  # JSON形式
  "jsonPayload": {
      "Duration": 5446226,
      "TLSVersion": "1.3",
      "time": "2023-05-26T18:53:47Z",
      "RequestMethod": "POST",
      "RequestScheme": "https",
      "RequestHost": "foo.example.com",
      "RequestContentSize": 161,
      "msg": "",
      "RequestPort": "-",
      "RequestAddr": "foo.example.com",
      "ClientPort": "25475",
      "Overhead": 80788,
      # クライアントにレスポンスするステータスコード
      "DownstreamStatus": 200,
      "StartLocal": "2023-05-26T18:53:47.017774671Z",
      "RequestCount": 583106,
      "OriginStatus": 200,
      "ServiceName": "foo-service@docker",
      "ClientAddr": "*.*.*.*:<ポート番号>",
      "RequestProtocol": "HTTP/2.0",
      "ClientUsername": "-",
      "OriginDuration": 5365438,
      "entryPointName": "https",
      "ServiceAddr": "*.*.*.*:<ポート番号>",
      "StartUTC": "2023-05-26T18:53:47.017774671Z",
      "TLSCipher": "TLS_AES_128_GCM_SHA256",
      "level": "info",
      "RouterName": "foo-router@docker",
      "ClientHost": "*.*.*.*",
      "RequestPath": "/foo/path",
      "RetryAttempts": 0,
      "ServiceURL":
        {
          "Path": "",
          "ForceQuery": "false",
          "RawPath": "",
          "RawFragment": "",
          "OmitHost": "false",
          "Scheme": "http",
          "Opaque": "",
          "Host": "*.*.*.*:<ポート番号>",
          "Fragment": "",
          "RawQuery": "",
        },
      "OriginContentSize": 604,
      "DownstreamContentSize": 604,
    },
}
```

> - https://doc.traefik.io/traefik/v1.7/configuration/logs/

<br>
