---
title: 【IT技術の知見】OAuth2 Proxy＠セキュリティ系ミドルウェア
description: OAuth2 Proxy＠セキュリティ系ミドルウェアの知見を記録しています。
---

# OAuth2 Proxy＠セキュリティ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. OAuth2 Proxyとは

OAuth2 Proxyは、ダウンストリームからのトークン署名検証リクエストをIDプロバイダーにプロキシする。

OAuth 2.0をベースとしたSSO (例：OAuth、OIDCなど) のトークン署名検証リクエストをプロキシできる。

認証処理のないアプリケーションやツールのダッシュボードに認証機能を追加できる。

<br>

## 02. OAuth2 Proxyの仕組み

### アーキテクチャ

![oauth2-proxy_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/oauth2-proxy_architecture.png)

> - https://ibrahimhkoyuncu.medium.com/kubernetes-ingress-external-authentication-with-oauth2-proxy-and-keycloak-9924a3b2d34a
> - https://blog.doctor-cha.com/google-sso-with-kubernetes-oauth-proxy

<br>

## 03. ユースケース

### クライアントからのリクエストの場合

クライアントは、OAuth2 Proxyにリクエストを送信し、認証を実施する。

> - https://oauth2-proxy.github.io/oauth2-proxy/

<br>

### リバースプロキシからのトークン署名検証リクエストの場合

![oauth2-proxy_kubernetes_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/oauth2-proxy_kubernetes_architecture.png)

リバースプロキシ (例：Nginxなど) は、リクエストヘッダーの持つ情報 (例：認証系ヘッダー、Cookieなど) から、ユーザーが認証済みであるかどうかを判定する。

ユーザーが未認証の場合、リバースプロキシはトークン署名検証リクエストをOAuth2 Proxyに転送する。

OAuth2 Proxyは、指定されたIDプロバイダー (例：Keycloakなど) の認可エンドポイントにトークン署名検証リクエストを転送し、一連の処理の後に認可レスポンスを受信する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    # OAuth2 Proxyへのトークン署名検証リクエスト送信処理を発火させるURLを設定する
    nginx.ingress.kubernetes.io/auth-signin: http://<OAuth2 Proxyのドメイン名>/oauth2/sign_in
    # OAuth2 Proxyの認可エンドポイントを設定する
    nginx.ingress.kubernetes.io/auth-url: http://<OAuth2 Proxyのドメイン名>/oauth2/auth
    nginx.ingress.kubernetes.io/proxy-buffer-size: 512k
  name: nginx-ingress
  namespace: ingress
spec:
  ingressClassName: nginx
  rules:
    - host: foo.application.com
      http:
        paths:
          - backend:
              service:
                name: foo-application-service
                port:
                  number: 80
            path: /
            pathType: Prefix
```

> - https://oauth2-proxy.github.io/oauth2-proxy/
> - https://ibrahimhkoyuncu.medium.com/kubernetes-ingress-external-authentication-with-oauth2-proxy-and-keycloak-9924a3b2d34a

<br>

### ダッシュボード

#### ▼ Prometheus、Alertmanager

Prometheus、AlertmanagerのダウンストリームにあるIngressは、OAuth2 Proxyに認可リクエストを送信する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    nginx.ingress.kubernetes.io/auth-signin: http://<OAuth2 Proxyのドメイン名>/oauth2/sign_in
    nginx.ingress.kubernetes.io/auth-url: http://<OAuth2 Proxyのドメイン名>/oauth2/auth  name: nginx-ingress
  namespace: ingress
spec:
  ingressClassName: nginx
  rules:
    - host: foo.prometheus.com
      http:
        paths:
          - backend:
              service:
                name: prometheus-service
                port:
                  number: 9093
            path: /
```

> - https://stackoverflow.com/a/71062075/12771072

#### ▼ Grafana

GrafanaのダウンストリームにあるIngressは、OAuth2 Proxyに認可リクエストを送信する。

一方で、GrafanaはIDプロバイダーに認可リクエストを直背的に送信できるため、OAuth2 Proxyがなくてもよい。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    nginx.ingress.kubernetes.io/auth-signin: http://<OAuth2 Proxyのドメイン名>/oauth2/sign_in
    nginx.ingress.kubernetes.io/auth-url: http://<OAuth2 Proxyのドメイン名>/oauth2/auth  name: nginx-ingress
  namespace: ingress
spec:
  ingressClassName: nginx
  rules:
    - host: foo.grafana.com
      http:
        paths:
          - backend:
              service:
                name: grafana-service
                port:
                  number: 8000
            path: /
```

> - https://github.com/grafana/grafana/issues/52681#issuecomment-1767046285
> - https://stackoverflow.com/a/73088436/12771072

#### ▼ Kiali

KialiのダウンストリームにあるIngressは、OAuth2 Proxyに認可リクエストを送信する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    nginx.ingress.kubernetes.io/auth-signin: http://<OAuth2 Proxyのドメイン名>/oauth2/sign_in
    nginx.ingress.kubernetes.io/auth-url: http://<OAuth2 Proxyのドメイン名>/oauth2/auth  name: nginx-ingress
  namespace: ingress
spec:
  ingressClassName: nginx
  rules:
    - host: foo.kiali.com
      http:
        paths:
          - backend:
              service:
                name: kiali-service
                port:
                  number: 20001
            path: /
```

<br>
