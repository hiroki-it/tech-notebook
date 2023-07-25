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

### OIDCの仕組み

#### ▼ アーキテクチャ

認証フェーズの委譲先のIDプロバイダー、ログインしたいWebサイト、から構成される。

> - https://baasinfo.net/?p=4418
> - https://tech.yyh-gl.dev/blog/id_token_and_access_token/

#### ▼ クレーム

OIDCのIDプロバイダーでは、アカウントの情報としてクレームを設定できる。

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

#### ▼ スコープ

クライアントは、OIDCのIDプロバイダーからアカウントのクレームを取得するために、スコープを設定する。

IDプロバイダーは、指定したスコープをアクセストークンに含めて、クライアントに送信する。

クライアントでは、取得したスコープに応じて認可処理を実施する。

| スコープ  | 取得できるクレーム                                                                                                                                                               |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profile` | `name`、`family_name`、`given_name`、`middle_name`、`nickname`、`preferred_username`、`profile`、`picture`、`website`、`gender`、`birthdate`、`zoneinfo`、`locale`、`updated_at` |
| `email`   | `email`、`email_verified`                                                                                                                                                        |
| `phone`   | `address`                                                                                                                                                                        |
| `address` | `phone_number`、`phone_number_verified`                                                                                                                                          |
| `openid`  | IDプロバイダー側で設定しているアカウントの識別子                                                                                                                                 |
| `groups`  | IDプロバイダー側で設定しているアカウントの認証グループ                                                                                                                           |

> - https://qiita.com/TakahikoKawasaki/items/185d34814eb9f7ac7ef3#15-%E3%82%AF%E3%83%AC%E3%83%BC%E3%83%A0-claim
> - https://kazuhira-r.hatenablog.com/entry/2022/08/27/001928

<br>

### OAuthとの違い

OIDCでは、OAuthとは異なり、アクセストークンではなく、IDトークンを使用する。

![oidc_vs_oauth](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/oidc_vs_oauth.png)

> - https://qiita.com/TakahikoKawasaki/items/498ca08bbfcc341691fe

<br>

### OIDCの種類

ベースになっているOAuthと同様にして、OIDCには仕組み別に『認可コードフロー』『インプリシットフロー』『リソースオーナー・パスワード・クレデンシャルズフロー』などがある。

<br>

### 認可コードフロー

Facebookには認証フェーズと認可フェーズでログインする点はOAuthと同じであるが、免許証作成サイトには認証フェーズと認可フェーズでログインする。

<br>
