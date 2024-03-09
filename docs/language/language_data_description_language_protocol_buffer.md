---
title: 【IT技術の知見】Protocol Buffer＠データ記述型言語
description: Protocol Buffer＠データ記述型言語の知見を記録しています。
---

# Protocol Buffer＠データ記述型言語

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Protocol Bufferとは

異なる言語間やサーバー間で変換できるデータ記述型言語である。

> - https://docs.wantedly.dev/fields/the-system/apis

<br>

## 02. 文法

### enum

enum型のデータを設定する。

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

> - https://protobuf.dev/overview/#syntax
> - https://protobuf.dev/programming-guides/enum/

<br>

### map

記入中...

> - https://protobuf.dev/overview/#syntax

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

> - https://protobuf.dev/overview/#syntax

<br>

### oneof

記入中...

> - https://protobuf.dev/overview/#syntax

<br>

### package

`pb`ファイルに自動的に定義するパッケージ名を設定する。

例えばGoの場合、`pb.go`ファイルでパッケージ名を自動的に定義する。

```protobuf
package foo;
```

<br>

### syntax

Protocol Bufferコンパイラーのバージョンを設定する。

Protocol Bufferコンパイラーは、`proto`ファイルから`pb`ファイルを自動的に作成する。

```protobuf
syntax = "proto3";
```

> - https://protobuf.dev/programming-guides/proto3/
> - https://protobuf.dev/programming-guides/proto3/#generated

<br>
