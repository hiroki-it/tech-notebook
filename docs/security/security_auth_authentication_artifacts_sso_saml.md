---
title: 【IT技術の知見】SAML
description: SAMLの知見を記録しています。
tags:
  - "セキュリティ"
  - "認証／認可"
  - "認証"
  - "認証アーティファクトによる分類"
  - "SSO"
---

# SAML

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. SAML：Security Assertion Markup Language

### SAML とは

SSO の一種である。

OAuth とは異なる仕組みで認証/認可の両方を実装する。

<br>

### SAML の仕組み

#### ▼ アーキテクチャ

認証フェーズの委譲先の ID プロバイダー、ログインしたい Web サイトから構成される。

<br>

## 02. トークンの検証

SAML では、XML ベースのアクセストークンを使用する。

これは JWT 仕様ではない。

> - [JWTとは？トークン認証の仕組みとSAMLとの違いをわかりやすく解説 \| エンベーダー](https://envader.plus/article/347)

<br>
