---
title: 【IT技術の知見】JavaScript
description: JavaScriptの知見を記録しています。
---

# JavaScript

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. セットアップ

### サーバー側

#### ▼ Protocol Buffer 自動作成ツール

npm リポジトリから、Protocol Buffer 自動作成ツールをインストールする。

```bash
$ npm install grpc-tools
```

#### ▼ gRPC サーバー

npm リポジトリから、gRPC サーバーを実装するためのパッケージをインストールする。

<br>

### gRPC クライアントパッケージ側

#### ▼ gRPC クライアントパッケージパッケージ

npm リポジトリから、gRPC クライアントパッケージをインストールする。

```bash
$ npm install grpc
```

<br>

### gRPC サーバーとクライアントの両方

#### ▼ `proto` ファイル

gRPC サーバーとクライアントで共有するサービスとメッセージの型を、Protocol Buffer の IDL で定義する。

#### ▼ `pb.js` ファイル

`proto` ファイルから grpc-tools で自動作成する JavaScript ファイルであり、メッセージのシリアライズとデシリアライズの処理を持つ。

<br>
