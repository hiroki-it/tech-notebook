---
title: 【IT技術の知見】認可＠認証／認可
description: 認可＠認証／認可の知見を記録しています。
---

# 認可＠認証／認可

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 認可とは

認証済みのユーザーのリクエストに応じてリソース操作を実施し (Enforcement) 、認可スコープに基づいて許否を決定します (Decision) 。

基本的に、認可の実装は認証に依存する。

![authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/authorization.png)

> - https://www.osohq.com/academy/what-is-authorization
> - https://dev.classmethod.jp/articles/authentication-and-authorization/#toc-2

<br>

## 02. アプリケーションで実装する場合

### アプリケーションで実装する場合とは

アプリケーションで、認可処理を実装する。

クリーンアーキテクチャであれば、ドメインサービスやアプリケーションサービスである。

<br>

### エンドポイントの分割

管理者ロールとそれ以外のロールを定義する場合を考える。

管理者ロールでは操作できるデータが横断的になる。

管理者ロールとそれ以外の認可ロジックを一緒にすると複雑になるため、管理者エンドポイントを別に定義しつつ、管理者用の認可ロジックは切り分けることが適切である。

|        | 管理者ロール                                | それ以外のロール                |
| ------ | ------------------------------------------- | ------------------------------- |
| GET    | ・`/admin/orders`<br>・`/admin/orders/{id}` | ・`/orders`<br>・`/orders/{id}` |
| POST   | `/admin/orders`                             | `/orders`                       |
| PUT    | `/admin/orders/{id}`                        | `/orders/{id}`                  |
| DELETE | `/admin/orders/{id}`                        | `/orders/{id}`                  |

<br>

## 03. 委譲する場合

### 委譲する場合とは

認可処理を実行してくれるツール (例：Open Policy Agentなど) に委譲する。

<br>
