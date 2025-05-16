---
title: 【IT技術の知見】HTTP認証＠認証
description: HTTP認証＠認証の知見を記録しています。
---

# HTTP認証＠認証

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. HTTP認証とは

HTTPリクエストの中で認証を行う認証スキームのこと。

リクエストの`Authorization`ヘッダーとレスポンスの`WWW-Authenticate`ヘッダーで認証スキームを指定する。

認証スキームの種類には、『Basic認証』、『Digest認証』、『Bearer認証』などがある。

資格情報の一時的な保管は、ブラウザのWebStoregeで行うため、認証解除 (ログアウト) をサーバー側で完全に制御できない。

> - https://www.iana.org/assignments/http-authschemes/http-authschemes.xhtml
> - https://architecting.hateblo.jp/entry/2020/03/27/130535
> - https://developer.mozilla.org/ja/docs/Web/HTTP/Authentication#authentication_schemes

<br>
