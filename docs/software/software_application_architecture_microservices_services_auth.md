---
title: 【IT技術の知見】認証／認可＠マイクロサービス
description: 認証／認可＠マイクロサービスの知見を記録しています。
---

# 認証／認可＠マイクロサービス

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 認証

### 認証サービス

各マイクロサービスごとに認証処理 (ユーザーの識別、ユーザーの有効性の検証) を持たせるのではなく、認証の責務を持つマイクロサービスを`1`個だけ配置する。

この認証サービスは、認証情報を永続化するためのDB、またはセッションを保管するためのストレージを持つ。

<br>

## 01-02. SSOパターン (独立パターン)

### SSOパターンとは

『独立パターン』ともいう。

認証サービスはトークンベースの認証情報を使用し、トークンを`Cookie`ヘッダーや`Authorization`ヘッダーで運搬する。

この認証サービスは、認証情報を永続化するためのDBを持ち、有効期限が切れればアクセストークンを無効化する。

認証サービスが単一障害点になるというデメリットがある。

> - https://zenn.dev/maronn/articles/aboun-microservices-auth-in-app#sso-%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%82%92%E7%94%A8%E3%81%84%E3%81%9F%E7%AE%A1%E7%90%86
> - https://iopscience.iop.org/article/10.1088/1742-6596/910/1/012060/pdf#page=6

### SSOパターンの仕組み

各マイクロサービスは、SSOのIDプロバイダーに認証を委譲する。

![microservices_authentication_type_sso](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authentication_type_sso.png)

> - https://please-sleep.cou929.nu/microservices-auth-design.html
> - https://engineer.retty.me/entry/2019/12/21/171549

<br>

### APIゲートウェイがある場合

#### ▼ Kong Gateway

初回のSSO時、フロントエンドからIDプロバイダーに直接的に認可リクエストを送信する。

その後、CookieにJWTを保管する。

次回、Kong Gateway (APIゲートウェイ) がフロントエンドからのリクエストをKeycloakにフォワーディングし、JWTトークンの署名を検証する。

結果に応じて、宛先マイクロサービスにルーティングするかどうかを決める。

![microservices_authentication_type_sso_gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authentication_type_sso_gateway.png)

> - https://www.jerney.io/secure-apis-kong-keycloak-1/
> - https://blog.stackademic.com/backend-for-frontend-authentication-pattern-in-go-5fe5ec7ced53
> - https://www.altkomsoftware.com/blog/keycloak-security-in-microservices/
> - https://stackoverflow.com/a/53396041
> - https://qiita.com/unhurried/items/998a386ccbc1ad4b8e61#rfc-8693-oauth-20-token-exchange

<br>

## 01-03. セッションパターン (集中パターン)

### セッションパターンとは

『集中パターン』ともいう。

サーバー側に、セッションデータを作成する認証サービス (例：自前、Keycloakなど) を`1`個だけ配置し、認証処理 (ユーザーの識別、ユーザーの有効性の検証) を実行する。

この認証サービスは、セッションベースの認証情報を使用し、セッションを`Cookie`ヘッダーで運搬する。

セッションデータを再利用するために、ブラウザのCookieやセッションストレージツール (例：Redis) に保存する。

(認証サービスだけでなく各マイクロサービスもセッションストレージツールに接続できるようにする必要があるらしいが、Keycloakではそんなことない)

> - https://zenn.dev/maronn/articles/aboun-microservices-auth-in-app#%E5%88%86%E6%95%A3%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AB%E3%82%88%E3%82%8B%E7%AE%A1%E7%90%86
> - https://iopscience.iop.org/article/10.1088/1742-6596/910/1/012060/pdf#page=6

<br>

### セッションパターンの仕組み

各マイクロサービスは、セッションデータに基づいてユーザーを認証する。

`1`個のセッション中の認証情報をマイクロサービス間で共有するために、セッションデータを保管できるストレージ (例：Infinispan、Redisなど) を`1`個だけ配置する。

セッションベースの認証情報は、コンテナの相性が悪く、各マイクロサービスがセッションデータを持つ必要がある。

そのため、SessionStorageが必要になるというデメリットがある。

![microservices_authentication_type_session](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authentication_type_session.png)

> - https://please-sleep.cou929.nu/microservices-auth-design.html
> - https://engineer.retty.me/entry/2019/12/21/171549
> - https://dev.to/honatas/a-different-approach-to-user-sessions-in-microservices-5bpi
> - https://blog.stackademic.com/backend-for-frontend-authentication-pattern-in-go-5fe5ec7ced53

<br>

## 01-04. JWTパターン (分散パターン)

### JWTパターンとは

『分散パターン』ともいう。

サーバー側に、JWTを作成する認証サービス (例：自前、Keycloakなど) を`1`個だけ配置し、認証処理 (ユーザーの識別、ユーザーの有効性の検証) を実行する。

認証サービスはトークンベースの認証情報を使用し、トークンを`Cookie`ヘッダーや`Authorization`ヘッダーで運搬する。

トークンを再利用するために、ブラウザのCookie、SessionStorage、またはLocalStorageに保存する。

> - https://iopscience.iop.org/article/10.1088/1742-6596/910/1/012060/pdf#page=7

<br>

### JWTパターンの仕組み

各マイクロサービスは、JWTに基づいてユーザーを認証する。

`1`個のセッション中の認証情報をマイクロサービス間で共有するために、リクエスト−レスポンスのヘッダーにJWTを埋め込み、クライアントのフロントエンドアプリケーション側にJWTを保管させる。

トークンベースの認証情報の場合に、コンテナの相性が良く、各マイクロサービスはJWTを持つ必要がない。

クライアントのフロントエンドアプリケーション側に保管したJWTトークンの失効が難しいというデメリットがある。

その解決策として、Opaqueトークンパターン (ゲートウェイ集中パターン) がある。

![microservices_authentication_type_jwt](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authentication_type_jwt.png)

> - https://please-sleep.cou929.nu/microservices-auth-design.html
> - https://blog.stackademic.com/backend-for-frontend-authentication-pattern-in-go-5fe5ec7ced53
> - https://engineer.retty.me/entry/2019/12/21/171549

<br>

## 01-05. JWTとAPIゲートウェイの組み合わせパターン (ゲートウェイ集中パターン)

### JWTとAPIゲートウェイの組み合わせパターンとは

『ゲートウェイ集中パターン』ともいう。

JWTパターンにAPIゲートウェイを組み合わせたパターンであり、JWTパターンでJWTトークンの失効が難しいというデメリットを解決する。

サーバー側に、JWTを作成する認証サービス (例：自前、Keycloakなど) を`1`個だけ配置する。

APIゲートウェイは、認証を集中的に管理し、認証とアクセストークン署名検証を担う。

認証サービスはトークンベースの認証情報を使用し、API Gatewayを介して、非SSOで認証を実施する。

> - https://zenn.dev/maronn/articles/aboun-microservices-auth-in-app#jwt%2Bapi-gateway-%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%9F%E7%AE%A1%E7%90%86
> - https://iopscience.iop.org/article/10.1088/1742-6596/910/1/012060/pdf#page=8
> - https://engineer.retty.me/entry/2019/12/21/171549
> - https://please-sleep.cou929.nu/microservices-auth-design.html

<br>

### JWTとAPIゲートウェイの組み合わせパターンの仕組み

各マイクロサービスは、JWTとOpaqueトークンに基づいてユーザーを認証する。

`1`個のセッション中の認証情報をマイクロサービス間で共有するために、リクエスト−レスポンスのヘッダーにJWTを埋め込む。

クライアントのフロントエンドアプリケーション側にはJWTとペアになるOpaqueトークンを保管する。

また、APIゲートウェイやロードバランサーで、OpaqueトークンとJWTトークンの間の相互変換を通信のたびに実行する。

トークンベースの認証情報の場合に、コンテナの相性が良く、各マイクロサービスはOpaqueトークンを持つ必要がない。

![microservices_authentication_type_opaque-token](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authentication_type_opaque-token.png)

> - https://zenn.dev/maronn/articles/aboun-microservices-auth-in-app#jwt%2Bapi-gateway-%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%9F%E7%AE%A1%E7%90%86
> - https://iopscience.iop.org/article/10.1088/1742-6596/910/1/012060/pdf#page=8
> - https://engineer.retty.me/entry/2019/12/21/171549
> - https://please-sleep.cou929.nu/microservices-auth-design.html

<br>

### JWTプロキシーがある場合

#### ▼ AWS JWT Authorizer

ここでは、認証サービス（図では認可サーバー）から手動でJWTトークンを発行し、クライアントに共有すると仮定する。

1. クライアントのフロントエンドアプリケーションはAWS API GatewayにJWTトークンを含むリクエストを送信する。
2. AWS API Gatewayは、AWS JWT Authorizerにリクエストを送信する。
3. AWS JWT Authorizerは認証サービス（図では認可サーバー）のJWKSエンドポイントにリクエストを送信する。
4. AWS JWT Authorizerは認証サービス（図では認可サーバー）から署名検証に使用する公開鍵を取得する。
5. AWS JWT AuthorizerはJWTトークンの有効性を検証する。
6. AWS API Gatewayは、バックエンドにリクエストを送信する。
7. バックエンドは、AWS API Gatewayにレスポンスを返信する。
8. AWS API Gatewayは、クライアントのフロントエンドアプリケーションにレスポンスを返信する。

![aws_jwt-authorizer](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_jwt-authorizer.png)

> - https://qiita.com/KWS_0901/items/9b37712ed4bff75e1d4f
> - https://auth0.com/blog/securing-aws-http-apis-with-jwt-authorizers/#Test-It-Out-
> - https://dev.classmethod.jp/articles/amazon-api-gateway-http-api-authz-auth0/#%25E7%25A2%25BA%25E8%25AA%258D%25E3%2581%2597%25E3%2581%25A6%25E3%2581%25BF%25E3%2582%258B

<br>

## 02. 認可

### 集中パターン

#### ▼ 集中パターンとは

認可スコープを定義する認可サービス (例：自前、OpenPolicyAgentなど) を`1`個だけ配置し、認可処理を実行する。

![microservices_authorization_centralized-authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authorization_centralized-authorization.png)

> - https://www.osohq.com/academy/what-is-authorization
> - https://zenn.dev/she_techblog/articles/6eff1f28d107be#decision%EF%BC%88%E8%AA%8D%E5%8F%AF%E3%81%AE%E5%88%A4%E6%96%AD%EF%BC%89%E3%81%AE%E5%AE%9F%E8%A3%85%E6%96%B9%E6%B3%95%EF%BC%88options-for-implementing-authorization-decisions%EF%BC%89

#### ▼ 認可プロバイダーへの委譲

認可サービスとして認可プロバイダーを配置する。

認可スコープを検証し、もしマイクロサービスの認可スコープが不十分であれば、リクエストを拒否する。

![microservices_authorization_centralized-authorization_external-provider](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authorization_centralized-authorization_external-provider.png)

> - https://thinkit.co.jp/article/22484
> - https://developer.mamezou-tech.com/blogs/2022/07/01/openapi-generator-5/

<br>

### 分散パターン

#### ▼ 分散パターンとは

認可処理を各マイクロサービスに実装する。

認可処理はドメインと結びつきが強いので、マイクロサービス側に実装すると拡張性が高くなる。

![microservices_authorization_decentralized-authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authorization_decentralized-authorization.png)

> - https://www.osohq.com/academy/what-is-authorization
> - https://zenn.dev/she_techblog/articles/6eff1f28d107be#decision%EF%BC%88%E8%AA%8D%E5%8F%AF%E3%81%AE%E5%88%A4%E6%96%AD%EF%BC%89%E3%81%AE%E5%AE%9F%E8%A3%85%E6%96%B9%E6%B3%95%EF%BC%88options-for-implementing-authorization-decisions%EF%BC%89

<br>

### ハイブリッドパターン

#### ▼ ハイブリッドパターンとは

![microservices_authorization_hybrid-authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authorization_hybrid-authorization.png)

> - https://www.osohq.com/academy/what-is-authorization
> - https://zenn.dev/she_techblog/articles/6eff1f28d107be#decision%EF%BC%88%E8%AA%8D%E5%8F%AF%E3%81%AE%E5%88%A4%E6%96%AD%EF%BC%89%E3%81%AE%E5%AE%9F%E8%A3%85%E6%96%B9%E6%B3%95%EF%BC%88options-for-implementing-authorization-decisions%EF%BC%89

<br>
