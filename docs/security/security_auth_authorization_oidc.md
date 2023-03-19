---
title: 【IT技術の知見】OIDC＠認可
description: OIDC＠認可の知見を記録しています。
---

# OIDC＠認可

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. OIDC：OpenID Connect (外部ID連携)

### OIDCとは

OAuthをベースとして、認証フェーズを追加し、認証/認可を実装する。

> ↪️ 参考：
>
> - https://baasinfo.net/?p=4418
> - https://tech.yyh-gl.dev/blog/id_token_and_access_token/

<br>

### OIDCの仕組み

#### ▼ アーキテクチャ

認証フェーズの委譲先のIDプロバイダー、ログインしたいWebサイト、から構成される。

> ↪️ 参考：
>
> - https://baasinfo.net/?p=4418
> - https://tech.yyh-gl.dev/blog/id_token_and_access_token/

<br>

### OAuthとの違い

OIDCでは、OAuthとは異なり、アクセストークンではなく、IDトークンを使用する。

![oidc_vs_oauth](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/oidc_vs_oauth.png)

> ↪️ 参考：https://qiita.com/TakahikoKawasaki/items/498ca08bbfcc341691fe

<br>

### OIDCの種類

ベースになっているOAuthと同様にして、OIDCには仕組み別に『認可コードフロー』『インプリシットフロー』『リソースオーナー・パスワード・クレデンシャルズフロー』などがある。

<br>

### 認可コードフロー

Facebookには認証フェーズと認可フェーズでログインする点はOAuthと同じであるが、免許証作成サイトには認証フェーズと認可フェーズでログインする。

<br>
