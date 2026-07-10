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

### 認証マイクロサービス

各マイクロサービスごとに認証処理 (ユーザーの識別、ユーザーの有効性の検証) を持たせるのではなく、認証の責務を持つマイクロサービスを `1` 個だけ配置する。

この認証マイクロサービスは、資格情報を永続化するための DB、またはセッションを保管するためのストレージを持つ。

<br>

### HTTPサーバーの場合

認証では、ブラウザとの間で認可リクエストや認可レスポンスなどが発生する。

ブラウザは gRPC クライアントとして使えないため、認証マイクロサービスは HTTP サーバーにしたほうがいい。

<br>

### gRPCサーバーの場合

前述のとおり、ブラウザは gRPC クライアントとして使えないため、認証マイクロサービスは HTTP サーバーにしたほうがいい。

認証マイクロサービスを gRPC サーバーとする場合、認証マイクロサービスの前方に HTTP サーバーで受信して gRPC クライアントとしてリクエストを送信するゲートウェイが必要になる。

<br>

## 01-02. SSOパターン (独立パターン)

### SSOパターンとは

『独立パターン』ともいう。

認証マイクロサービスはトークンベース認証を使用し、アクセストークンを `Cookie` ヘッダーや `Authorization` ヘッダーで運搬する。

この認証マイクロサービスは、資格情報を永続化するための DB を持ち、有効期限が切れればアクセストークンを無効化する。

認証マイクロサービスが単一障害点になるというデメリットがある。

> - https://zenn.dev/maronn/articles/aboun-microservices-auth-in-app#sso-%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%82%92%E7%94%A8%E3%81%84%E3%81%9F%E7%AE%A1%E7%90%86
> - https://iopscience.iop.org/article/10.1088/1742-6596/910/1/012060/pdf#page=6

### SSOパターンの仕組み

各マイクロサービスは、SSO の ID プロバイダーに認証を委譲する。

![microservices_authentication_type_sso](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authentication_type_sso.png)

> - https://please-sleep.cou929.nu/microservices-auth-design.html
> - https://engineer.retty.me/entry/2019/12/21/171549

<br>

### APIゲートウェイがある場合

#### ▼ Kong Gateway

初回の SSO 時、フロントエンドから ID プロバイダーに直接的に認可リクエストを送信する。

その後、Cookie に JWT を保管する。

次回、Kong Gateway (API ゲートウェイ) がフロントエンドからのリクエストを Keycloak にフォワーディングし、JWT トークンの署名を検証する。

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

サーバー側に、セッション ID を作成する認証マイクロサービス (例：自前、Keycloak など) を `1` 個だけ配置し、認証処理 (ユーザーの識別、ユーザーの有効性の検証) を実行する。

この認証マイクロサービスは、セッションベース認証を使用し、セッションを `Cookie` ヘッダーで運搬する。

セッション ID を再利用するために、ブラウザの Cookie やセッションストレージツール (例：Redis) に保存する。

(認証マイクロサービスだけでなく各マイクロサービスもセッションストレージツールへ接続できるようにする必要があるらしいが、Keycloak ではそんなことない)

> - https://zenn.dev/maronn/articles/aboun-microservices-auth-in-app#%E5%88%86%E6%95%A3%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AB%E3%82%88%E3%82%8B%E7%AE%A1%E7%90%86
> - https://iopscience.iop.org/article/10.1088/1742-6596/910/1/012060/pdf#page=6

<br>

### セッションパターンの仕組み

各マイクロサービスは、セッション ID に基づいてアカウントをする。

`1` 個のセッション中の認証アーティファクトをマイクロサービス間で共有するために、セッション ID を保管できるストレージ (例：Infinispan、Redis など) を `1` 個だけ配置する。

セッションベース認証は、コンテナの相性が悪く、各マイクロサービスがセッション ID を持つ必要がある。

そのため、SessionStorage が必要になるというデメリットがある。

![microservices_authentication_type_session](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authentication_type_session.png)

> - https://please-sleep.cou929.nu/microservices-auth-design.html
> - https://engineer.retty.me/entry/2019/12/21/171549
> - https://dev.to/honatas/a-different-approach-to-user-sessions-in-microservices-5bpi
> - https://blog.stackademic.com/backend-for-frontend-authentication-pattern-in-go-5fe5ec7ced53

<br>

### セッションIDをCookieヘッダーで運搬するパターン

マイクロサービスアーキテクチャの文脈では、セッション ID を使用した認証は次のような仕組みになっている。このパターンは、さまざまなフロントエンドアプリケーション (例：SST、CSR、SSR など) で採用できる。

1. 未認証のアカウントはフロントエンドアプリケーションにリクエストを送信する。
2. ID プロバイダーはレスポンスの Set-Cookie ヘッダーでセッション ID を返信する。
3. フロントエンドアプリケーションは ID プロバイダーのレスポンスヘッダーからセッション ID を取得する。セッション ID を再利用するため、ブラウザは Cookie にセッション ID を保存する。
4. フロントエンドアプリケーションは、セッション ID を Cookie ヘッダーで運搬する。
5. マイクロサービスは、セッション ID に対応するセッションデータがストレージにあるか、またセッション ID が失効していないかを検証する。セッション ID は Cookie ヘッダーで運搬し、後続のマイクロサービスに伝播させる。

![microservices_authentication_type_session_cookie-header](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authentication_type_session_cookie-header.png)

<br>

## 01-04. JWTパターン (分散パターン)

### JWTパターンとは

『分散パターン』ともいう。

サーバー側に、JWT を作成する認証マイクロサービス (例：自前、Keycloak など) を `1` 個だけ配置し、認証処理 (ユーザーの識別、ユーザーの有効性の検証) を実行する。

認証マイクロサービスはトークンベース認証を使用し、アクセストークンを `Cookie` ヘッダーや `Authorization` ヘッダーで運搬する。

トークンを再利用するために、ブラウザの Cookie、SessionStorage、または LocalStorage に保存する。

> - https://iopscience.iop.org/article/10.1088/1742-6596/910/1/012060/pdf#page=7

<br>

### JWTパターンの仕組み

各マイクロサービスは、JWT に基づいてアカウントを認証する。

`1` 個のセッション中の認証アーティファクトをマイクロサービス間で共有するために、リクエスト／レスポンスのヘッダーに JWT を埋め込み、クライアントのフロントエンドアプリケーション側に JWT を保管させる。

トークンベース認証の場合に、コンテナの相性がよく、各マイクロサービスは JWT を持つ必要がない。

クライアントのフロントエンドアプリケーション側に保管した JWT トークンの失効が難しいというデメリットがある。

その解決策として、Opaque トークンパターン (ゲートウェイ集中パターン) がある。

![microservices_authentication_type_jwt](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authentication_type_jwt.png)

> - https://please-sleep.cou929.nu/microservices-auth-design.html
> - https://blog.stackademic.com/backend-for-frontend-authentication-pattern-in-go-5fe5ec7ced53
> - https://engineer.retty.me/entry/2019/12/21/171549

<br>

## 01-05. JWTとAPIゲートウェイの組み合わせパターン (ゲートウェイ集中パターン)

### JWTとAPIゲートウェイの組み合わせパターンとは

『ゲートウェイ集中パターン』ともいう。

JWT パターンに API ゲートウェイを組み合わせたパターンであり、JWT パターンで JWT トークンの失効が難しいというデメリットを解決する。

サーバー側に、JWT を作成する認証マイクロサービス (例：自前、Keycloak など) を `1` 個だけ配置する。

API ゲートウェイは、認証を集中的に管理し、認証とアクセストークン署名検証を担う。

認証マイクロサービスはトークンベース認証を使用し、API Gateway を介して、非 SSO で認証を実施する。

> - https://zenn.dev/maronn/articles/aboun-microservices-auth-in-app#jwt%2Bapi-gateway-%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%9F%E7%AE%A1%E7%90%86
> - https://iopscience.iop.org/article/10.1088/1742-6596/910/1/012060/pdf#page=8
> - https://engineer.retty.me/entry/2019/12/21/171549
> - https://please-sleep.cou929.nu/microservices-auth-design.html

<br>

### JWTとAPIゲートウェイの組み合わせパターンの仕組み

各マイクロサービスは、JWT と Opaque トークンに基づいてアカウントを認証する。

`1` 個のセッション中の認証アーティファクトをマイクロサービス間で共有するために、リクエスト／レスポンスのヘッダーに JWT を埋め込む。

クライアントのフロントエンドアプリケーション側には JWT とペアになる Opaque トークンを保管する。

また、API ゲートウェイやロードバランサーで、Opaque トークンと JWT トークンの間の相互変換を通信のたびに実行する。

トークンベース認証の場合に、コンテナの相性がよく、各マイクロサービスは Opaque トークンを持つ必要がない。

![microservices_authentication_type_opaque-token](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authentication_type_opaque-token.png)

> - https://zenn.dev/maronn/articles/aboun-microservices-auth-in-app#jwt%2Bapi-gateway-%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%9F%E7%AE%A1%E7%90%86
> - https://iopscience.iop.org/article/10.1088/1742-6596/910/1/012060/pdf#page=8
> - https://engineer.retty.me/entry/2019/12/21/171549
> - https://please-sleep.cou929.nu/microservices-auth-design.html

<br>

### JWTプロキシーがある場合

#### ▼ AWS JWT Authorizer

ここでは、認証マイクロサービス (図では認可サーバー) から手動で JWT トークンを発行し、クライアントに共有すると仮定する。

1. クライアントのフロントエンドアプリケーションは Amazon API Gateway に JWT トークンを含むリクエストを送信する。
2. Amazon API Gateway は、AWS JWT Authorizer にリクエストを送信する。
3. AWS JWT Authorizer は認証マイクロサービス (図では認可サーバー) の JWKS エンドポイントにリクエストを送信する。
4. AWS JWT Authorizer は認証マイクロサービス (図では認可サーバー) から検証に使用する公開鍵を取得する。
5. AWS JWT Authorizer は JWT トークンの署名を検証する。
6. Amazon API Gateway は、バックエンドにリクエストを送信する。
7. バックエンドは、Amazon API Gateway にレスポンスを返信する。
8. Amazon API Gateway は、クライアントのフロントエンドアプリケーションにレスポンスを返信する。

![aws_jwt-authorizer](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_jwt-authorizer.png)

> - https://qiita.com/KWS_0901/items/9b37712ed4bff75e1d4f
> - https://auth0.com/blog/securing-aws-http-apis-with-jwt-authorizers/#Test-It-Out-
> - https://dev.classmethod.jp/articles/amazon-api-gateway-http-api-authz-auth0/#%25E7%25A2%25BA%25E8%25AA%258D%25E3%2581%2597%25E3%2581%25A6%25E3%2581%25BF%25E3%2582%258B

<br>

## 02. 認可

### 集中パターン

#### ▼ 集中パターンとは

認可スコープを定義する認可マイクロサービス (例：自前、Open Policy Agent など) を `1` 個だけ配置し、認可処理を実行する。

![microservices_authorization_centralized-authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authorization_centralized-authorization.png)

> - https://www.osohq.com/academy/what-is-authorization
> - https://zenn.dev/she_techblog/articles/6eff1f28d107be#decision%EF%BC%88%E8%AA%8D%E5%8F%AF%E3%81%AE%E5%88%A4%E6%96%AD%EF%BC%89%E3%81%AE%E5%AE%9F%E8%A3%85%E6%96%B9%E6%B3%95%EF%BC%88options-for-implementing-authorization-decisions%EF%BC%89

#### ▼ 認可プロバイダーへの委譲

認可マイクロサービスとして認可プロバイダーを配置する。

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
