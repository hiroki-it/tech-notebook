---
title: 【IT技術の知見】API スキーマ
description: API スキーマの知見を記録しています。
tags:
  - "アプリ"
  - "API"
  - "GraphQL-API"
  - "API仕様書"
---

# API スキーマ

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. API スキーマ

### API スキーマとは

GraphQL-API が受信する CRUD のデータ型や必須データを定義したもの。受信したデータのバリデーションに使用する。

> - https://gist.github.com/gushernobindsme/d3bf842134765ccc179d616eace1dc80#%E3%82%B9%E3%82%AD%E3%83%BC%E3%83%9E%E3%81%AE%E8%A8%AD%E8%A8%88
> - [GraphQLサーバーを動かしてみる｜Goで学ぶGraphQLサーバーサイド入門](https://zenn.dev/hsaki/books/golang-graphql/viewer/tutorial)

<br>

## 02. 文法

### enum

enum 型のデータを設定する。

```graphql
enum GenderType {
  UNKNOWN
  MAN
  WOMAN
}

type User {
  id: ID!
  gender: GenderType
}
```

> - [Schemas and Types \| GraphQL](https://graphql.org/learn/schema/)

<br>

### input

Mutation 処理の引数として受信するデータ構造を設定する。

```graphql
input UserCreateInput {
  name: String!
  email: String!
}

type Mutation {
  createUser(data: UserCreateInput!): User!
}
```

> - [Schemas and Types \| GraphQL](https://graphql.org/learn/schema/)

<br>

### interface

複数の type で共通するフィールドを設定する。

```graphql
interface Node {
  id: ID!
}

type User implements Node {
  id: ID!
  name: String!
}
```

> - [Schemas and Types \| GraphQL](https://graphql.org/learn/schema/)

<br>

### scalar

フィールドのデータ型のうち、それ以上分解できない型である。

組み込みの型として `Int`、`Float`、`String`、`Boolean`、`ID` がある。また、独自の型も定義できる。

```graphql
scalar DateTime

type User {
  id: ID!
  createdAt: DateTime!
}
```

> - [Schemas and Types \| GraphQL](https://graphql.org/learn/schema/)

<br>

### type

#### ▼ type とは

レスポンスで返信するデータ構造を設定する。

フィールドの型に `!` をつけると必須 (null 不可) になり、`[]` で囲むと配列になる。

```graphql
type User {
  id: ID!
  name: String!
  # 必須の User型の配列
  friends: [User!]!
}
```

> - [Schemas and Types \| GraphQL](https://graphql.org/learn/schema/)

#### ▼ ルート型

クライアントがリクエストする処理の入口となる type である。

`Query` (データ読出)、`Mutation` (データ作成/更新/削除)、`Subscription` (データ変更の通知) がある。

```graphql
type Query {
  user(id: ID!): User
}

type Mutation {
  createUser(data: UserCreateInput!): User!
}

type Subscription {
  userCreated: User!
}
```

> - [Schemas and Types \| GraphQL](https://graphql.org/learn/schema/)

<br>

### union

複数の type のいずれかを返信するデータ型を設定する。

```graphql
union SearchResult = User | Post

type Query {
  search(text: String!): [SearchResult!]!
}
```

> - [Schemas and Types \| GraphQL](https://graphql.org/learn/schema/)

<br>
