---
title: 【IT技術の知見】認証/認可＠マイクロサービスアーキテクチャ
description: 認証/認可＠マイクロサービスアーキテクチャの知見を記録しています。
---

# 認証/認可＠マイクロサービスアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 認証

### 認証サービス

各マイクロサービスごとに認証処理を持たせるのではなく、認証の責務を持つマイクロサービスを`1`個だけ配置する。

<br>

### SSOパターン

#### ▼ SSOパターンとは

サーバー側に、IDプロバイダーを認証サービスとして、SSOを実行する。

認証サービスが単一障害点になるというデメリットがある。

#### ▼ SSOパターンの仕組み

各マイクロサービスは、SSOのIDプロバイダーに認証を委譲する。

![micro-authentication_type_sso](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/micro-authentication_type_sso.png)

> - https://please-sleep.cou929.nu/microservices-auth-design.html
> - https://engineer.retty.me/entry/2019/12/21/171549

<br>

### 中央集権パターン

#### ▼ 中央集権パターンとは

サーバー側に、セッションデータを作成する認証サービス (例：自前、Keycloak、など) を`1`個だけ配置し、認証処理を実行する。

#### ▼ 中央集権パターンの仕組み

各マイクロサービスは、セッションデータに基づいてユーザーを認証する。

`1`個のセッション中の認証情報をマイクロサービス間で共有するために、セッションデータを保存できるストレージ (例：Infinispan、Redis、など) を`1`個だけ配置する。

耐障害性のあるセッションストレージが必要になるというデメリットがある。

![micro-authentication_type_centralization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/micro-authentication_type_centralization.png)

> - https://please-sleep.cou929.nu/microservices-auth-design.html
> - https://engineer.retty.me/entry/2019/12/21/171549
> - https://dev.to/honatas/a-different-approach-to-user-sessions-in-microservices-5bpi

<br>

### JWTパターン

#### ▼ JWTパターンとは

サーバー側に、JWTを作成する認証サービス (例：自前、Keycloak、など) を`1`個だけ配置し、認証処理を実行する。

#### ▼ JWTパターンの仕組み

各マイクロサービスは、JWTに基づいてユーザーを認証する。

`1`個のセッション中の認証情報をマイクロサービス間で共有するために、リクエスト/レスポンスのヘッダーにJWTを埋め込み、クライアント側にJWTを保存させる。

クライアント側に保存されたJWTの失効が難しいというデメリットがある。

![micro-authentication_type_jwt](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/micro-authentication_type_jwt.png)

> - https://please-sleep.cou929.nu/microservices-auth-design.html
> - https://engineer.retty.me/entry/2019/12/21/171549

<br>

### Opaqueトークンパターン

#### ▼ Opaqueトークンパターンとは

サーバー側に、JWTを作成する認証サービス (例：自前、Keycloak、など) を`1`個だけ配置し、一方でクライアント側ではOpaqueトークンを保存し、認証処理を実行する。

#### ▼ Opaqueトークンパターンの仕組み

各マイクロサービスは、JWTとOpaqueトークンに基づいてユーザーを認証する。

`1`個のセッション中の認証情報をマイクロサービス間で共有するために、リクエスト/レスポンスのヘッダーにJWTを埋め込む。

クライアント側にはJWTと対になるOpaqueトークンを保存する。

また、API Gatewayやロードバランサーで、OpaqueトークンとJWTの間の相互変換を通信のたびに実行する。

![micro-authentication_type_opaque-token](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/micro-authentication_type_opaque-token.png)

> - https://please-sleep.cou929.nu/microservices-auth-design.html
> - https://engineer.retty.me/entry/2019/12/21/171549

<br>

## 02. 認可

### SSOパターン

#### ▼ SSOパターンとは

サーバー側に、認可スコープを定義する認可サービス (例：自前、OpenPolicyAgent、など) を`1`個だけ配置し、認可処理を実行する。

<br>

### JWTパターン

#### ▼ JWTパターンとは

サーバー側に、認可サービス (例：自前、Keycloak、など) を`1`個だけ配置し、認可処理を実行する。

> - https://please-sleep.cou929.nu/microservices-auth-design.html

#### ▼ サイドカーサービスメッシュ

サイドカーサービスメッシュを使用し、JWTパターンを実装する。

サイドカーは認可サービスにリクエストを送信し、認可サービスは認可スコープに応じてboolean型値を返却する。

![micro-authentication_type_jwt_service-mesh](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/micro-authentication_type_jwt_service-mesh.png)

> - https://thinkit.co.jp/article/22484
> - https://developer.mamezou-tech.com/blogs/2022/07/01/openapi-generator-5/

<br>
