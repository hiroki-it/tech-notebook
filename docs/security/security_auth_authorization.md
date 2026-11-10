---
title: 【IT技術の知見】認可
description: 認可の知見を記録しています。
tags:
  - "セキュリティ"
  - "認証／認可"
  - "認可"
---

# 認可

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 認可とは

認証済みのユーザーのリクエストに応じてリソース操作を実施し (Enforcement) 、認可スコープに基づいて許否を決定します (Decision) 。

基本的に、認可の実装は認証に依存する。

![authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/authorization.png)

> - [Authorization Academy - What is Authorization?](https://www.osohq.com/academy/what-is-authorization)
> - [よくわかる認証と認可 \| DevelopersIO](https://dev.classmethod.jp/articles/authentication-and-authorization/#toc-2)

<br>

## 02. アプリケーションで実装する場合

### アプリケーションで実装する場合とは

アプリケーションで、認可処理を実装する。

クリーンアーキテクチャであれば、ドメインサービスやアプリケーションサービスである。

<br>

### 層ごとの配置

レイヤードアーキテクチャのアプリケーションで、認可処理を担うコンポーネントと、その層を示す。

認証処理はプレゼンテーション層に置き、UserやAPIトークンの認可情報の取得と認可の判定の組み立てはユースケース層に置く。

認可の判定ルールはドメイン層に置く。

```mermaid
flowchart LR
  UiClient[UIクライアント]    
  ApiClient[APIクライアント]

  subgraph presentation[プレゼンテーション層]
    UiFooRoute[UIルート]
    ApiFooRoute[APIルート]
    subgraph Authenticator[認証]
      AuthenticateUser["authenticateUser()"]
      AuthenticateApiToken["authenticateApiToken()"]
    end
  end

  subgraph Usecase[ユースケース層]
    subgraph UiAuthorizationUsecase[UiAuthorizationUsecase]
      UiGetAuthorizedUser["getAuthorizedUser()"]
    end
    subgraph ApiAuthorizationUsecase[ApiAuthorizationUsecase]
      ApiGetAuthorizedApiToken["getAuthorizedApiToken()"]
    end
    subgraph UiFooUsecase[UiFooUsecase]
      UiRegisterFoo["registerFoo()"]
    end
    subgraph ApiFooUsecase[ApiFooUsecase]
      ApiRegisterFoo["registerFoo()"]
    end
  end

  subgraph Domain[ドメイン層]
    subgraph Authorization[認可]
      CanAccess["canAccess()"]
    end
  end

  subgraph Infrastructure[インフラストラクチャ層]
    subgraph Model[Models]
      FindUserWithPermission["findUserWithPermission()"]
      FindApiTokenWithPermission["findApiTokenWithPermission()"]
      CreateFoo["createFoo()"]
    end
  end

  Database[(データベース)]

  UiClient --> UiFooRoute
  UiFooRoute --> AuthenticateUser
  AuthenticateUser --> UiGetAuthorizedUser
  UiGetAuthorizedUser --> FindUserWithPermission
  UiGetAuthorizedUser -- "アクセス可否を判定" --> CanAccess
  UiFooRoute -- "許可された操作を実行" --> UiRegisterFoo
  UiRegisterFoo --> CreateFoo

  ApiClient --> ApiFooRoute
  ApiFooRoute --> AuthenticateApiToken
  AuthenticateApiToken --> ApiGetAuthorizedApiToken
  ApiGetAuthorizedApiToken --> FindApiTokenWithPermission
  ApiGetAuthorizedApiToken -- "アクセス可否を判定" --> CanAccess
  ApiFooRoute -- "許可された操作を実行" --> ApiRegisterFoo
  ApiRegisterFoo --> CreateFoo

  FindUserWithPermission -- "User・認可情報を取得" --> Database
  FindApiTokenWithPermission -- "APIToken・認可情報を取得" --> Database
  CreateFoo --> Database
```

<br>

### エンドポイントの分割

テナントが存在するアプリケーションで、テナント横断的な管理者ロールとそれ以外のロールを定義する場合を考える。

管理者ロールでは操作できるデータが横断的になる。

管理者ロールとそれ以外の認可ロジックを一緒にすると複雑になるため、管理者エンドポイントを別に定義しつつ、管理者用の認可ロジックは切り分けることが適切である。

<table>
  <thead>
    <tr>
      <th></th>
      <th>テナント横断的な管理者ロール</th>
      <th>各テナントのロール</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>GET</td>
      <td>・<code>/admin/organizations/{orgId}/orders</code><br>・<code>/admin/organizations/{orgId}/orders/{id}</code></td>
      <td>・<code>/orders</code><br>・<code>/orders/{id}</code></td>
    </tr>
    <tr>
      <td>POST</td>
      <td><code>/admin/organizations/{orgId}/orders</code></td>
      <td><code>/orders</code></td>
    </tr>
    <tr>
      <td>PUT</td>
      <td><code>/admin/organizations/{orgId}/orders/{id}</code></td>
      <td><code>/orders/{id}</code></td>
    </tr>
    <tr>
      <td>DELETE</td>
      <td><code>/admin/organizations/{orgId}/orders/{id}</code></td>
      <td><code>/orders/{id}</code></td>
    </tr>
  </tbody>
</table>

<br>

## 03. 委譲する場合

### 委譲する場合とは

認可処理を実行してくれるツール (例：Open Policy Agent など) に委譲する。

<br>
