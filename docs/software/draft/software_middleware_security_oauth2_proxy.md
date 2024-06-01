---
title: 【IT技術の知見】OAuth2 Proxy＠セキュリティ系ミドルウェア
description: OAuth2 Proxy＠セキュリティ系ミドルウェアの知見を記録しています。
---

# OAuth2 Proxy＠セキュリティ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. OAuth2 Proxyの仕組み

### アーキテクチャ

OAuth2 Proxyは、認証を必要とするアプリの代わりにIDプロバイダーの認可エンドポイントに、認可リクエストを送信する。

また、一連の処理の後に認可レスポンスを受信する。

![oauth2-proxy_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/oauth2-proxy_architecture.png)

> - https://ibrahimhkoyuncu.medium.com/kubernetes-ingress-external-authentication-with-oauth2-proxy-and-keycloak-9924a3b2d34a
> - https://blog.doctor-cha.com/google-sso-with-kubernetes-oauth-proxy

<br>

## 02. ユースケース

### クライアントからのリクエストの場合

クライアントは、OAuth2 Proxyにリクエストを送信し、認証を実施する。

> - https://oauth2-proxy.github.io/oauth2-proxy/

<br>

### リバースプロキシからのリクエストの場合

![oauth2-proxy_kubernetes_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/oauth2-proxy_kubernetes_architecture.png)

リバースプロキシ (例：Nginx、など) は、リクエストヘッダーの持つ情報 (例：認証系ヘッダー、Cookie、など) から、ユーザーが認証済みであるかどうかを判定する。

未認証のリクエストの場合、リバースプロキシはリクエストをOAuth2 Proxyに転送する。

OAuth2 Proxyは、指定されたIDプロバイダー (例：Keycloak、など) の認可エンドポイントに認可リクエストを転送し、一連の処理の後に認可レスポンスを受信する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    # 認可リクエストの宛先のIDプロバイダーを設定する
    nginx.ingress.kubernetes.io/auth-signin: http://$host/oauth2/start?rd=$escaped_request_uri
    # 認可レスポンスで指定してもらうURLを設定する
    nginx.ingress.kubernetes.io/auth-url: http://$host/oauth2/auth
    nginx.ingress.kubernetes.io/proxy-buffer-size: 512k
  name: nginx-ingress
  namespace: ingress
spec:
  ingressClassName: nginx
  rules:
    - host: foo.bar.com
      http:
        paths:
          - backend:
              service:
                name: nginx-service
                port:
                  number: 80
            path: /index.html
            pathType: Prefix
```

> - https://oauth2-proxy.github.io/oauth2-proxy/
> - https://ibrahimhkoyuncu.medium.com/kubernetes-ingress-external-authentication-with-oauth2-proxy-and-keycloak-9924a3b2d34a

<br>
