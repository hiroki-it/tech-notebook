---
title: 【IT技術の知見】クライアントツール＠gRPCクライアントパッケージ
description: クライアントツール＠gRPCクライアントパッケージの知見を記録しています。
---

# クライアントツール＠gRPC クライアントパッケージ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. evans

### evans とは

ローカルを gRPC クライアントとして、gRPC サーバーにリクエストを送信できる。

gRPC サーバーのテストに使える。

> - [GitHub - ktr0731/evans: Evans: more expressive universal gRPC client · GitHub](https://github.com/ktr0731/evans)

<br>

### セットアップ

```bash
$ go install github.com/ktr0731/evans@latest
```

<br>

### -r

gRPC サーバーのリフレクション機能を使用する。

`proto` ファイルの定義を gRPC サーバーに問い合わせ、これを使用して gRPC サーバーにリクエストを送信する。

```bash
$ evans \
    -r \
    -p 50051 \
    --host localhost cli call user.v1.UserService.GetUser '{ "user_id":"1" }'
```

<br>

### --proto

`proto` ファイルの定義を手動で渡し、これを使用して gRPC サーバーにリクエストを送信する。

```bash
$ evans \
    --proto ./proto/user/v1/user_service.proto \
    --path ./proto \
    --port 50051 \
    --host localhost \
    cli call user.v1.UserService.GetUser '{ "user_id":"1" }'
```

### --header

メタデータを設定し、gRPC サーバーにリクエストを送信する。

アクセストークンが必要な場合に役立つ。

```bash
$ evans \
    --proto ./proto/user/v1/user_service.proto \
    --path ./proto \
    --port 50051 \
    --header token=*****
    --host localhost \
    cli call user.v1.UserService.GetUser '{ "user_id":"1" }'
```

<br>
