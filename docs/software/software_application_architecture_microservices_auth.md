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

この認証サービスは、認証情報を永続化するためのDB、またはセッションを保管するためのストレージを持つ。

<br>

### SSOパターン (独立パターン)

#### ▼ SSOパターンとは

『独立パターン』ともいう。

サーバー側に、IDプロバイダーを認証サービスとして、SSOを実行する。

この認証サービスは、認証情報を永続化するためのDBを持つ。

認証サービスが単一障害点になるというデメリットがある。

#### ▼ SSOパターンの仕組み

各マイクロサービスは、SSOのIDプロバイダーに認証を委譲する。

![microservices_authentication_type_sso](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authentication_type_sso.png)

> - https://please-sleep.cou929.nu/microservices-auth-design.html
> - https://engineer.retty.me/entry/2019/12/21/171549

<br>

### セッションパターン (集中パターン)

#### ▼ セッションパターンとは

『集中パターン』ともいう。

サーバー側に、セッションデータを作成する認証サービス (例：自前、Redisなど) を`1`個だけ配置し、認証処理を実行する。

この認証サービスは、セッションデータを保管するためのストレージを持つ。

#### ▼ セッションパターンの仕組み

各マイクロサービスは、セッションデータに基づいてユーザーを認証する。

`1`個のセッション中の認証情報をマイクロサービス間で共有するために、セッションデータを保管できるストレージ (例：Infinispan、Redisなど) を`1`個だけ配置する。

セッションベースの認証情報伝播とコンテナの相性が悪く、各マイクロサービスがセッションデータを持つ必要がある。

そのため、SessionStorageが必要になるというデメリットがある。

![microservices_authentication_type_session](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authentication_type_session.png)

> - https://please-sleep.cou929.nu/microservices-auth-design.html
> - https://engineer.retty.me/entry/2019/12/21/171549
> - https://dev.to/honatas/a-different-approach-to-user-sessions-in-microservices-5bpi
> - https://blog.stackademic.com/backend-for-frontend-authentication-pattern-in-go-5fe5ec7ced53

<br>

### JWTパターン (分散パターン)

#### ▼ JWTパターンとは

『分散パターン』ともいう。

サーバー側に、JWTを作成する認証サービス (例：自前、Keycloakなど) を`1`個だけ配置し、認証処理を実行する。

この認証サービスは、認証情報を永続化するためのDBを持つ。

#### ▼ JWTパターンの仕組み

各マイクロサービスは、JWTに基づいてユーザーを認証する。

`1`個のセッション中の認証情報をマイクロサービス間で共有するために、リクエスト/レスポンスのヘッダーにJWTを埋め込み、クライアント側にJWTを保管させる。

トークンベースの認証情報伝播とコンテナの相性が良く、各マイクロサービスはJWTを持つ必要がない。

クライアント側に保管されたJWTの失効が難しいというデメリットがある。

その解決策として、Opaqueトークンパターン (ゲートウェイ分散パターン) がある。

![microservices_authentication_type_jwt](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authentication_type_jwt.png)

> - https://please-sleep.cou929.nu/microservices-auth-design.html
> - https://blog.stackademic.com/backend-for-frontend-authentication-pattern-in-go-5fe5ec7ced53
> - https://engineer.retty.me/entry/2019/12/21/171549

#### ▼ API Gateway (またはBFF) を配置する場合

初回の認証時、フロントエンドからIDプロバイダーに直接的に認可リクエストを送信する。

その後、クライアントのローカルマシンの`Cookie`ディレクトリにJWTを保管する。

次回、API GatewayがフロントエンドからのリクエストをKeycloakに転送し、JWTを検証する。

結果に応じて、後続のマイクロサービスにルーティングするかどうかを決める。

![microservices_auth_jwt-apigateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_auth_jwt-apigateway.png)

> - https://www.jerney.io/secure-apis-kong-keycloak-1/
> - https://blog.stackademic.com/backend-for-frontend-authentication-pattern-in-go-5fe5ec7ced53
> - https://stackoverflow.com/a/53396041

<br>

### Opaqueトークンパターン (ゲートウェイ分散パターン)

#### ▼ Opaqueトークンパターンとは

『ゲートウェイ分散パターン』ともいう。

JWTパターンでJWTの失効が難しいというデメリットを解決する。

サーバー側に、JWTを作成する認証サービス (例：自前、Keycloakなど) を`1`個だけ配置する。

API Gatewayは、OpaqueトークンとJWTを変換する機能を持ち、JWTを失効できる。

一方でクライアント側ではOpaqueトークンを保管し、認証処理を実行する。

#### ▼ Opaqueトークンパターンの仕組み

各マイクロサービスは、JWTとOpaqueトークンに基づいてユーザーを認証する。

`1`個のセッション中の認証情報をマイクロサービス間で共有するために、リクエスト/レスポンスのヘッダーにJWTを埋め込む。

クライアント側にはJWTとペアになるOpaqueトークンを保管する。

また、API Gatewayやロードバランサーで、OpaqueトークンとJWTの間の相互変換を通信のたびに実行する。

トークンベースの認証情報伝播とコンテナの相性が良く、各マイクロサービスはOpaqueトークンを持つ必要がない。

![microservices_authentication_type_opaque-token](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authentication_type_opaque-token.png)

> - https://please-sleep.cou929.nu/microservices-auth-design.html
> - https://engineer.retty.me/entry/2019/12/21/171549

<br>

## 02. 認可

### 集中パターン

#### ▼ 集中パターンとは

認可スコープを定義する認可サービス (例：自前、OpenPolicyAgentなど) を`1`個だけ配置し、認可処理を実行する。

![microservices_authorization_centralized-authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authorization_centralized-authorization.png)

> - https://zenn.dev/she_techblog/articles/6eff1f28d107be#decision%EF%BC%88%E8%AA%8D%E5%8F%AF%E3%81%AE%E5%88%A4%E6%96%AD%EF%BC%89%E3%81%AE%E5%AE%9F%E8%A3%85%E6%96%B9%E6%B3%95%EF%BC%88options-for-implementing-authorization-decisions%EF%BC%89

<br>

### 分散パターン

#### ▼ 分散パターンとは

認可処理を各マイクロサービスに実装する。

認可処理はドメインと結びつきが強いので、マイクロサービス側に実装すると拡張性が高くなる。

![microservices_authorization_decentralized-authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authorization_decentralized-authorization.png)

> - https://zenn.dev/she_techblog/articles/6eff1f28d107be#decision%EF%BC%88%E8%AA%8D%E5%8F%AF%E3%81%AE%E5%88%A4%E6%96%AD%EF%BC%89%E3%81%AE%E5%AE%9F%E8%A3%85%E6%96%B9%E6%B3%95%EF%BC%88options-for-implementing-authorization-decisions%EF%BC%89

<br>

### ハイブリッドパターン

#### ▼ ハイブリッドパターンとは

![microservices_authorization_hybrid-authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authorization_hybrid-authorization.png)

> - https://zenn.dev/she_techblog/articles/6eff1f28d107be#decision%EF%BC%88%E8%AA%8D%E5%8F%AF%E3%81%AE%E5%88%A4%E6%96%AD%EF%BC%89%E3%81%AE%E5%AE%9F%E8%A3%85%E6%96%B9%E6%B3%95%EF%BC%88options-for-implementing-authorization-decisions%EF%BC%89

<br>
