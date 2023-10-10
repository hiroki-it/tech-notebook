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

### Form認証の場合

#### ▼ 独立型

セッションデータを作成する認証マイクロサービスを`1`個だけ配置し、セッションベースのForm認証を実現する。

各マイクロサービスはセッションデータに基づいてユーザーを認証する。

`1`個のセッション中の認証情報をマイクロサービス間で共有するために、セッションデータを保存できるストレージを各マイクロサービスに配置する。

認証マイクロサービスが単一障害点になるというデメリットがある。

![micro-auth_type_sso](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/micro-auth_type_sso.png)

> - https://please-sleep.cou929.nu/microservices-auth-design.html
> - https://engineer.retty.me/entry/2019/12/21/171549

#### ▼ 中央集権型

セッションデータを作成する認証マイクロサービスを`1`個だけ配置し、セッションベースのForm認証を実現する。

各マイクロサービスはセッションデータに基づいてユーザーを認証する。

`1`個のセッション中の認証情報をマイクロサービス間で共有するために、セッションデータを保存できるストレージを`1`個だけ配置する。

耐障害性のあるセッションストレージが必要になるというデメリットがある。

![micro-auth_type_centralization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/micro-auth_type_centralization.png)

> - https://please-sleep.cou929.nu/microservices-auth-design.html
> - https://engineer.retty.me/entry/2019/12/21/171549

#### ▼ 分散型

JWTを作成する認証マイクロサービスを`1`個だけ配置し、CookieベースのForm認証を実現する。

各マイクロサービスはJWTに基づいてユーザーを認証する。

`1`個のセッション中の認証情報をマイクロサービス間で共有するために、リクエスト/レスポンスのヘッダーにJWTを埋め込み、クライアント側にJWTを保存させる。

クライアント側に保存されたJWTの失効が難しいというデメリットがある。

![micro-auth_type_distribution](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/micro-auth_type_distribution.png)

> - https://please-sleep.cou929.nu/microservices-auth-design.html
> - https://engineer.retty.me/entry/2019/12/21/171549

#### ▼ ゲートウェイ分散型

JWTを作成する認証マイクロサービスを`1`個だけ配置し、CookieベースのForm認証を実現する。

各マイクロサービスはJWTに基づいてユーザーを認証する。

`1`個のセッション中の認証情報をマイクロサービス間で共有するために、リクエスト/レスポンスのヘッダーにJWTを埋め込む。

ただ分散型の認証とは異なり、クライアント側にはJWTの代わりとなるOpaqueトークンを保存する。

また、API Gatewayやロードバランサーで、OpaqueトークンとJWTの間の相互変換を通信のたびに実行する。

![micro-auth_type_gateway-distribution](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/micro-auth_type_gateway-distribution.png)

> - https://please-sleep.cou929.nu/microservices-auth-design.html
> - https://engineer.retty.me/entry/2019/12/21/171549

<br>

## 02. 認可

### 分散型

マイクロサービスが個別に認可を担う。

各マイクロサービスで認可処理が重複する可能性がある。

> - https://please-sleep.cou929.nu/microservices-auth-design.html

<br>

### 中央集権型

全てのマイクロサービスの認可処理を担うマイクロサービスを`1`個だけ配置する。

各マイクロサービスの認可処理が密結合になる可能性がある。

> - https://please-sleep.cou929.nu/microservices-auth-design.html

<br>
