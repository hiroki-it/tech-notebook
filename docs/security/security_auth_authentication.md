---
title: 【IT技術の知見】認証＠認証／認可
description: 認証＠認証／認可の知見を記録しています。
---

# 認証＠認証／認可

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 認証とは

リクエストのユーザーが誰であるかを識別し、また定期的にユーザーの有効性を検証する。

基本的に、認証の実装は認可に依存しない。

<br>

## 02. 認証属性

### realm

#### ▼ realmとは

認証管理におけるテナントのようなもの。

realmごとに認証を管理する。

例えばKeycloakであれば、Adminユーザーの認証はmaster realmで、それ以外はユーザー定義のrealm、で管理する。

> - https://www.seil.jp/doc/index.html#fn/pppac/cmd/authentication_realm.html
> - https://keycloak-documentation.openstandia.jp/21.0/ja_JP/server_admin/index.html#the-master-realm

#### ▼ realmの粒度

マイクロサービスアーキテクチャでは、横断的なrealm (こちらがよさそう) 、または各マイクロサービスでrealmを作成するとよい。

> - https://github.com/vicjicaman/microservice-realm

<br>

### クライアントID

#### ▼ クライアントIDとは

IDプロバイダーのクライアントのIDを表す。

#### ▼ クライアントIDの粒度

マイクロサービスアーキテクチャでは、横断的なクライアントID 、またはマイクロサービスでクライアントID (こちらがよさそう) を作成するとよい。

<br>

<br>
