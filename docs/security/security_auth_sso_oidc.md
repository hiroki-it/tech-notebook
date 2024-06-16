---
title: 【IT技術の知見】OIDC＠SSO
description: OIDC＠SSOの知見を記録しています。
---

# OIDC＠SSO

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. OIDC：OpenID Connect (外部ID連携)

### OIDCとは

SSOの一種である。

OAuthをベースとして、認証フェーズを追加し、認証/認可を実装する。

> - https://baasinfo.net/?p=4418
> - https://tech.yyh-gl.dev/blog/id_token_and_access_token/

<br>

## 02. OIDCの仕組み

### アーキテクチャ

認証フェーズの委譲先のIDプロバイダー、ログインしたいWebサイト、から構成される。

> - https://baasinfo.net/?p=4418
> - https://tech.yyh-gl.dev/blog/id_token_and_access_token/

<br>

### クレーム

クレームは認証情報の要素である。

委譲元のクライアントは、IDプロバイダーから取得したクレームを認証情報として扱い、認可処理を実行する。

| クレーム  | 説明                        |
| --------- | --------------------------- |
| `sub`     | アカウントの識別子          |
| `profile` | アカウントのプロフィールURL |
| `name`    | アカウントの氏名            |
| `email`   | アカウントのメールアドレス  |
| `phone`   | アカウントの電話番号        |
| `address` | アカウントの住所            |
| ...       | ...                         |

> - https://qiita.com/TakahikoKawasaki/items/185d34814eb9f7ac7ef3#15-%E3%82%AF%E3%83%AC%E3%83%BC%E3%83%A0-claim

<br>

### 認可リクエスト時のクレームの取得

#### ▼ `scope`パラメーター

認可リクエスト時に、`scope`パラメーターでクレームグループを指定し、クレームを取得できる。

IDプロバイダーは、指定したクレームグループに対応したクレームをIDトークン (アクセストークンではなく) に設定し、クライアントに返信する。

委譲元のクライアントは、取得したクレームを認証情報として扱い、認可処理を実行する。

| クレームグループ               | 取得できるクレーム (認証情報の要素)                                                                                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profile`                      | `name`、`family_name`、`given_name`、`middle_name`、`nickname`、`preferred_username`、`profile`、`picture`、`website`、`gender`、`birthdate`、`zoneinfo`、`locale`、`updated_at` |
| `email`                        | `email`、`email_verified`                                                                                                                                                        |
| `phone`                        | `address`                                                                                                                                                                        |
| `address`                      | `phone_number`、`phone_number_verified`                                                                                                                                          |
| ユーザー定義のクレームグループ | 自由にクレームを設定できる                                                                                                                                                       |

> - https://qiita.com/TakahikoKawasaki/items/185d34814eb9f7ac7ef3#15-%E3%82%AF%E3%83%AC%E3%83%BC%E3%83%A0-claim
> - https://openid.net/specs/openid-connect-core-1_0.html#ScopeClaims

#### ▼ `claims`パラメーター

認可リクエスト時に、`claims`パラメーターで特定のクレームを指定し、クレームを取得できる。

クレームの指定の仕方が複雑らしい...

> - https://qiita.com/TakahikoKawasaki/items/185d34814eb9f7ac7ef3#15-%E3%82%AF%E3%83%AC%E3%83%BC%E3%83%A0-claim
> - https://openid.net/specs/openid-connect-core-1_0.html#ClaimsParameter

<br>

## 03. OAuthとの違い

OIDCでは、OAuthとは異なり、アクセストークンだけでなくIDトークン (必ずJWT仕様) の使用する。

また、OAuthの脆弱性に対処できる。

![oidc_vs_oauth](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/oidc_vs_oauth.png)

> - https://qiita.com/TakahikoKawasaki/items/498ca08bbfcc341691fe
> - https://dev.classmethod.jp/articles/auth0-access-token-id-token-difference/#toc-3
> - https://zenn.dev/uma002/articles/152fcef798730b#%E3%81%AA%E3%81%9C%E8%84%86%E5%BC%B1%E6%80%A7%E3%81%8C%E7%94%9F%E3%81%BE%E3%82%8C%E3%82%8B%E3%81%AE%E3%81%8B

<br>

## 04. OIDCの種類

ベースになっているOAuthと同様にして、OIDCには仕組み別に『認可コードフロー』『インプリシットフロー』『リソースオーナー・パスワード・クレデンシャルズフロー』などがある。

<br>

## 05. 認可コードフロー

OAuthの認可コードフローと仕組みが似ており、アクセストークンだけでなくIDトークンも使用する。

短命な認可コードを送信すると、IDプロバイダーからアクセストークンとIDトークンの両方を取得できる。

> - https://wagby.com/wdn8/juser-oidc.html

<br>
