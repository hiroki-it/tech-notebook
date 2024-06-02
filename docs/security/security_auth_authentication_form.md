---
title: 【IT技術の知見】Form認証＠認証
description: Form認証＠認証の知見を記録しています。
---

# Form認証＠認証

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Form認証とは

セッションベース認証情報伝播かつ`Cookie`ヘッダーによる認証情報運搬の認証スキームのこと。

トークン (IDトークン、アクセストークン) を使用する場合、`Cookie`ヘッダーによる運搬であっても、Form認証とは言わない。

ステートフル化を行うため、HTTP認証には所属していない。

認証情報の一時的な保管は、サーバーのセッションデータで行うため、認証解除 (ログアウト) をサーバー側で制御できる。

`Cookie`ヘッダーによる送受信では、CSRFの危険性がある。

> - https://h50146.www5.hpe.com/products/software/security/icewall/iwsoftware/report/pdfs/certification.pdf
> - https://auth0.com/docs/sessions/cookies#cookie-based-authentication
> - https://qiita.com/toshiya/items/e7dcc7610b15884b167e#%E3%83%95%E3%82%A9%E3%83%BC%E3%83%A0%E3%81%AB%E3%82%88%E3%82%8B%E8%AA%8D%E8%A8%BC

<br>
