---
title: 【IT技術の知見】SAML＠SSO
description: SAML＠SSOの知見を記録しています。
---

# SAML＠SSO

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. SAML：Security Assertion Markup Language

### SAMLとは

SSOの一種である。

OAuthとは異なる仕組みで認証/認可の両方を実装する。

<br>

### SAMLの仕組み

#### ▼ アーキテクチャ

認証フェーズの委譲先のIDプロバイダー、ログインしたいWebサイト、から構成される。

<br>
