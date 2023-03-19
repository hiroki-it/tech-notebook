---
title: 【IT技術の知見】SAML＠認可
description: SAML＠認可の知見を記録しています。
---

# SAML＠認可

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. SAML：Security Assertion Markup Language

### SAMLとは

OAuthとは異なる仕組みで認証/認可の両方を実装する。

<br>

### SAMLの仕組み

#### ▼ アーキテクチャ

認証フェーズの委譲先のIDプロバイダー、ログインしたいWebサイト、から構成される。

#### ▼ 認証フェーズの委譲先 (IDプロバイダー)

- Auth0
- KeyCloak
- AWS Cognito
- Google Auth

<br>
