---
title: 【IT技術の知見】クライアントツール＠gRPCクライアントパッケージ
description: クライアントツール＠gRPCクライアントパッケージの知見を記録しています。
---

# クライアントツール＠gRPCクライアントパッケージ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. evans

### evansとは

ローカルをgRPCクライアントとして、gRPCサーバーにリクエストを送信できる。

gRPCサーバーのテストに使える。

<br>

### セットアップ

```bash
$ go install github.com/ktr0731/evans@latest
```

<br>

### -r

gRPCサーバーのリフレクション機能を使用する。

`proto`ファイルの定義をgRPCサーバーに問い合わせ、これを使用してgRPCサーバーにリクエストを送信する。

```bash
$ evans \
    -r \
    -p 50051 \
    --host localhost cli user.v1.UserService.GetUser '{ "user_id":"1" }'
```

<br>

### --proto

`proto`ファイルの定義を手動で渡し、これを使用してgRPCサーバーにリクエストを送信する。

```bash
$ evans \
    --proto ./proto/user/v1/user_service.proto \
    --path ./proto -p 50051 \
    --host localhost cli user.v1.UserService.GetUser '{ "user_id":"1" }'
```

<br>
