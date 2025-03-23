---
title: 【IT技術の知見】認証／認可＠マイクロサービス領域
description: 認証／認可＠マイクロサービス領域の知見を記録しています。
---

# 認証／認可＠マイクロサービス領域

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 認証

### 認証サービス

各マイクロサービスごとに認証処理 (ユーザーの識別、ユーザーの有効性の検証) を持たせるのではなく、認証の責務を持つマイクロサービスを`1`個だけ配置する。

この認証サービスは、認証情報を永続化するためのDB、またはセッションを保管するためのストレージを持つ。

<br>

### SSOパターン (独立パターン)

#### ▼ SSOパターンとは

『独立パターン』ともいう。

認証サービスはトークンベースの認証情報を使用し、トークンを`Cookie`ヘッダーや`Authorization`ヘッダーで運搬する。

この認証サービスは、認証情報を永続化するためのDBを持ち、有効期限が切れればアクセストークンを無効化する。

認証サービスが単一障害点になるというデメリットがある。

> - https://zenn.dev/maronn/articles/aboun-microservices-auth-in-app#sso-%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%82%92%E7%94%A8%E3%81%84%E3%81%9F%E7%AE%A1%E7%90%86
> - https://iopscience.iop.org/article/10.1088/1742-6596/910/1/012060/pdf#page=6

#### ▼ SSOパターンの仕組み

各マイクロサービスは、SSOのIDプロバイダーに認証を委譲する。

![microservices_authentication_type_sso](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authentication_type_sso.png)

> - https://please-sleep.cou929.nu/microservices-auth-design.html
> - https://engineer.retty.me/entry/2019/12/21/171549

#### ▼ APIゲートウェイがある場合

初回のSSO時、フロントエンドからIDプロバイダーに直接的に認可リクエストを送信する。

その後、CookieにJWTを保管する。

次回、APIゲートウェイがフロントエンドからのリクエストをKeycloakに転送し、JWT仕様トークンの署名を検証する。

結果に応じて、宛先マイクロサービスにルーティングするかどうかを決める。

![microservices_authentication_type_sso_gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authentication_type_sso_gateway.png)

> - https://www.jerney.io/secure-apis-kong-keycloak-1/
> - https://blog.stackademic.com/backend-for-frontend-authentication-pattern-in-go-5fe5ec7ced53
> - https://www.altkomsoftware.com/blog/keycloak-security-in-microservices/
> - https://stackoverflow.com/a/53396041
> - https://qiita.com/unhurried/items/998a386ccbc1ad4b8e61#rfc-8693-oauth-20-token-exchange

<br>

### セッションパターン (集中パターン)

#### ▼ セッションパターンとは

『集中パターン』ともいう。

サーバー側に、セッションデータを作成する認証サービス (例：自前、Keycloakなど) を`1`個だけ配置し、認証処理 (ユーザーの識別、ユーザーの有効性の検証) を実行する。

この認証サービスは、セッションベースの認証情報を使用し、セッションを`Cookie`ヘッダーで運搬する。

セッションデータを再利用するために、ブラウザのCookieやセッションストレージツール (例：Redis) に保存する。

(認証サービスだけでなく各マイクロサービスもセッションストレージツールに接続できるようにする必要があるらしいが、Keycloakではそんなことない)

> - https://zenn.dev/maronn/articles/aboun-microservices-auth-in-app#%E5%88%86%E6%95%A3%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AB%E3%82%88%E3%82%8B%E7%AE%A1%E7%90%86
> - https://iopscience.iop.org/article/10.1088/1742-6596/910/1/012060/pdf#page=6

#### ▼ セッションパターンの仕組み

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

### JWTパターン (分散パターン)

#### ▼ JWTパターンとは

『分散パターン』ともいう。

サーバー側に、JWTを作成する認証サービス (例：自前、Keycloakなど) を`1`個だけ配置し、認証処理 (ユーザーの識別、ユーザーの有効性の検証) を実行する。

認証サービスはトークンベースの認証情報を使用し、トークンを`Cookie`ヘッダーや`Authorization`ヘッダーで運搬する。

トークンを再利用するために、ブラウザのCookie、SessionStorage、またはLocalStorageに保存する。

> - https://iopscience.iop.org/article/10.1088/1742-6596/910/1/012060/pdf#page=7

#### ▼ JWTパターンの仕組み

各マイクロサービスは、JWTに基づいてユーザーを認証する。

`1`個のセッション中の認証情報をマイクロサービス間で共有するために、リクエスト/レスポンスのヘッダーにJWTを埋め込み、クライアント側にJWTを保管させる。

トークンベースの認証情報の場合に、コンテナの相性が良く、各マイクロサービスはJWTを持つ必要がない。

クライアント側に保管されたJWT仕様トークンの失効が難しいというデメリットがある。

その解決策として、Opaqueトークンパターン (ゲートウェイ集中パターン) がある。

![microservices_authentication_type_jwt](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authentication_type_jwt.png)

> - https://please-sleep.cou929.nu/microservices-auth-design.html
> - https://blog.stackademic.com/backend-for-frontend-authentication-pattern-in-go-5fe5ec7ced53
> - https://engineer.retty.me/entry/2019/12/21/171549

<br>

### JWT + APIゲートウェイパターン (ゲートウェイ集中パターン)

#### ▼ JWT + APIゲートウェイパターンとは

『ゲートウェイ集中パターン』ともいう。

JWTパターンにAPIゲートウェイを組み合わせたパターンであり、JWTパターンでJWT仕様トークンの失効が難しいというデメリットを解決する。

サーバー側に、JWTを作成する認証サービス (例：自前、Keycloakなど) を`1`個だけ配置する。

APIゲートウェイは、認証を集中的に管理し、認証とアクセストークン署名検証を担う。

認証サービスはトークンベースの認証情報を使用し、API Gatewayを介して、非SSOで認証を実施する。

> - https://zenn.dev/maronn/articles/aboun-microservices-auth-in-app#jwt%2Bapi-gateway-%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%9F%E7%AE%A1%E7%90%86
> - https://iopscience.iop.org/article/10.1088/1742-6596/910/1/012060/pdf#page=8
> - https://engineer.retty.me/entry/2019/12/21/171549
> - https://please-sleep.cou929.nu/microservices-auth-design.html

#### ▼ JWT + APIゲートウェイパターンの仕組み

各マイクロサービスは、JWTとOpaqueトークンに基づいてユーザーを認証する。

`1`個のセッション中の認証情報をマイクロサービス間で共有するために、リクエスト/レスポンスのヘッダーにJWTを埋め込む。

クライアント側にはJWTとペアになるOpaqueトークンを保管する。

また、APIゲートウェイやロードバランサーで、OpaqueトークンとJWT仕様トークンの間の相互変換を通信のたびに実行する。

トークンベースの認証情報の場合に、コンテナの相性が良く、各マイクロサービスはOpaqueトークンを持つ必要がない。

![microservices_authentication_type_opaque-token](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authentication_type_opaque-token.png)

> - https://zenn.dev/maronn/articles/aboun-microservices-auth-in-app#jwt%2Bapi-gateway-%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%9F%E7%AE%A1%E7%90%86
> - https://iopscience.iop.org/article/10.1088/1742-6596/910/1/012060/pdf#page=8
> - https://engineer.retty.me/entry/2019/12/21/171549
> - https://please-sleep.cou929.nu/microservices-auth-design.html

<br>

## 02. 認可

### 集中パターン

#### ▼ 集中パターンとは

認可スコープを定義する認可サービス (例：自前、OpenPolicyAgentなど) を`1`個だけ配置し、認可処理を実行する。

![microservices_authorization_centralized-authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_authorization_centralized-authorization.png)

> - https://www.osohq.com/academy/what-is-authorization
> - https://zenn.dev/she_techblog/articles/6eff1f28d107be#decision%EF%BC%88%E8%AA%8D%E5%8F%AF%E3%81%AE%E5%88%A4%E6%96%AD%EF%BC%89%E3%81%AE%E5%AE%9F%E8%A3%85%E6%96%B9%E6%B3%95%EF%BC%88options-for-implementing-authorization-decisions%EF%BC%89

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
