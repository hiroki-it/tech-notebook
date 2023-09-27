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

OAuth2 Proxyは、認証を必要とするアプリの代わりに認可リクエストを送信しつつ、認可レスポンスを受信する。

![oauth2-proxy_architecture.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/oauth2-proxy_architecture.png)

> - https://ibrahimhkoyuncu.medium.com/kubernetes-ingress-external-authentication-with-oauth2-proxy-and-keycloak-9924a3b2d34a
> - https://blog.doctor-cha.com/google-sso-with-kubernetes-oauth-proxy

<br>
