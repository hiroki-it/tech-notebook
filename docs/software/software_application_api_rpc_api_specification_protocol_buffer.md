---
title: 【IT技術の知見】Protocol Buffer
description: Protocol Bufferの知見を記録しています。
tags:
  - "アプリ"
  - "API"
  - "RPC-API"
  - "API仕様書"
  - "Protocol Buffer"
---

# Protocol Buffer

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. Protocol Buffer とは

異なる言語間やサーバー間で変換できるデータ記述型言語である。

RPC-API (例：gRPC) の仕様を実装により説明するためのインターフェース定義言語でもある。`.proto` ファイルに実装する。

> - https://docs.wantedly.dev/fields/the-system/apis

<br>

## 02. 文法

### enum

enum 型のデータを設定する。

```protobuf
enum GenderType {
  UNKNOWN = 0;
  MAN = 1;
  WOMAN = 2;
}

message Person {
  optional int32 id = 1;
  optional string name = 2;
  optional GenderType gender_type = 3;
}
```

> - [Overview \| Protocol Buffers Documentation](https://protobuf.dev/overview/#syntax)
> - [Enum Behavior \| Protocol Buffers Documentation](https://protobuf.dev/programming-guides/enum/)

<br>

### map

キーと値の組合せからなる連想配列型のフィールドを設定する。

> - [Overview \| Protocol Buffers Documentation](https://protobuf.dev/overview/#syntax)

<br>

### message

リクエストメッセージで送信するデータ構造を設定する。

```protobuf
syntax = "proto3";

message Person {
  optional int32 id = 1;
  optional string name = 2;
}
```

> - [Overview \| Protocol Buffers Documentation](https://protobuf.dev/overview/#syntax)

<br>

### oneof

複数のフィールドのうち、いずれか 1 つのフィールドだけに値を設定できるグループを設定する。

> - [Overview \| Protocol Buffers Documentation](https://protobuf.dev/overview/#syntax)

<br>

### package

`pb` ファイルに自動的に定義するパッケージ名を設定する。

例えば Go の場合、`pb.go` ファイルでパッケージ名を自動的に定義する。

```protobuf
package foo;
```

<br>

### service

#### ▼ service とは

関数 (`rpc`) とそのグループ (`service`) を設定する。

gRPC の API 仕様である。

```protobuf
service GreetingService {
	rpc Hello (HelloRequest) returns (HelloResponse);
}
```

> - https://docs.wantedly.dev/fields/the-system/apis#protofairu

<br>

### syntax

Protocol Buffer コンパイラーのバージョンを設定する。

Protocol Buffer コンパイラーは、`proto` ファイルから `pb` ファイルを自動的に作成する。

```protobuf
syntax = "proto3";
```

> - [Language Guide (proto 3) \| Protocol Buffers Documentation](https://protobuf.dev/programming-guides/proto3/)
> - [Language Guide (proto 3) \| Protocol Buffers Documentation](https://protobuf.dev/programming-guides/proto3/#generated)

<br>
