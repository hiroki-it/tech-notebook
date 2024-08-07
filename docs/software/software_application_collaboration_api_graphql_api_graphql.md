---
title: 【IT技術の知見】GraphQL＠GraphQL-API
description: GraphQL＠GraphQL-APIの知見を記録しています。
---

# GraphQL＠GraphQL-API

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. GraphQLの仕組み

### アーキテクチャ

GraphQLは、GraphQL-APIのGraphQLサーバー、GraphQLクライアント、から構成される。

従来のRESTful-APIを使用した場合、バックエンドのエンドポイントが増えるたびに、フロントエンドが指定すべきエンドポイントも増えていく。

一方で、GraphQL-APIを使用した場合、単一のエンドポイントをGraphQLで指定すれば、GraphQL-APIが適切な宛先にルーティングしてくれる。

![graphql-api](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/graphql-api.png)

> - https://www.apollographql.com/blog/graphql/basics/graphql-vs-rest/

<br>

### GraphQLサーバー

#### ▼ スキーマ

GraphQL-APIが受信するCRUDのデータ型や必須データを定義したもの。受信したデータのバリデーションに使用する。

> - https://gist.github.com/gushernobindsme/d3bf842134765ccc179d616eace1dc80#%E3%82%B9%E3%82%AD%E3%83%BC%E3%83%9E%E3%81%AE%E8%A8%AD%E8%A8%88
> - https://zenn.dev/hsaki/books/golang-graphql/viewer/tutorial

<br>

### GraphQLクライアント

#### ▼ クエリ

GraphQL-APIに送信するCRUDの実際のデータを定義したもの。

> - https://gist.github.com/gushernobindsme/d3bf842134765ccc179d616eace1dc80#graphql-%E3%81%AE%E5%95%8F%E5%90%88%E3%81%9B%E8%A8%80%E8%AA%9E

<br>

## 02. CRUD

### Query

#### ▼ スキーマ (サーバー側)

**＊例＊**

ここでは、Query処理を受信するためのスキーマを定義したとする。

```graphql
# ルート型
type Query {
  user: User!
}

# User型
type User {
  id: ID!
  name: String!
  email: String!
}
```

> - https://zenn.dev/offers/articles/20220609-graphql-onboarding#query

#### ▼ クエリ (クライアント側)

データ読出のクエリを定義する。

> - https://gist.github.com/gushernobindsme/d3bf842134765ccc179d616eace1dc80#graphql-%E3%81%AE%E3%82%AF%E3%82%A8%E3%83%AA

**＊例＊**

ここでは、前述のQuery処理のスキーマで定義した`GetUser`メソッドを使用すると仮定する。

```graphql
query GetUser {
  user {
    id
    name
  }
}
```

```bash
$ curl \
    -X POST \
    -H "Content-Type: application/json" \
    --data 'query GetUser { user { id name }}'


{
  "data": {
    "user": {
      "id": "hoge",
      "name": "foo",
    }
  }
}
```

> - https://zenn.dev/offers/articles/20220609-graphql-onboarding#query

<br>

### Mutation

#### ▼ スキーマ (サーバー側)

**＊例＊**

ここでは、Mutation処理を受信するためのスキーマを定義したとする。

```graphql
# ルート型
type Mutation {
  createUser(data: UserCreateInput!): User!
}

# User型
type User {
  id: ID!
  name: String!
  email: String!
}

# UserCreateInput型
input UserCreateInput {
  id: ID
  name: String!
  email: String!
}
```

> - https://zenn.dev/offers/articles/20220609-graphql-onboarding#mutation

#### ▼ クエリ (クライアント側)

データ作成/更新/削除のクエリを定義する。

> - https://gist.github.com/gushernobindsme/d3bf842134765ccc179d616eace1dc80#%E3%83%9F%E3%83%A5%E3%83%BC%E3%83%86%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3

**＊例＊**

ここでは、前述のMutation処理のスキーマで定義した`CreateUser`メソッドを実行すると仮定する。

```graphql
mutation CreateUser {
  createUser(data: {name: "bar", email: "example@gmail.com"}) {
    name
  }
}
```

クライアント側で`CreateUser`メソッドを実行する。

```bash
$ curl \
    -X POST \
    -H "Content-Type: application/json" \
    --data 'mutation CreateUser { createUser(data: { name: "bar", email: "example@gmail.com"}) { name }}'


{
  "data": {
    "createUser": {
      "name": "bar",
    }
  }
}
```

> - https://zenn.dev/offers/articles/20220609-graphql-onboarding#mutation
> - https://stackoverflow.com/a/64110554

<br>
