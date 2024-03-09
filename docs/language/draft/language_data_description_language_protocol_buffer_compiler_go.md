---
title: 【IT技術の知見】Goプラグイン＠Protocol Bufferコンパイラー
description: Goプラグイン＠Protocol Bufferコンパイラーの知見を記録しています。
---

# Goプラグイン＠Protocol Bufferコンパイラー

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Protocol BufferコンパイラーGoプラグインとは

サービス定義ファイル (`proto`ファイル) から`pb.go`ファイルをコンパイルできる。

```bash
$ go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
```

> - https://protobuf.dev/reference/go/go-generated/#invocation

<br>

## 02. 文法

### option

サービス定義ファイル (`proto`ファイル) からコンパイルした`pb.go`ファイルの`package`名を設定する。

```protobuf
option go_package = "github.com/hiroki-hasegawa/foo-repository/src/foo-service";
```

```go
// pb.goファイル
package github.com/hiroki-hasegawa/foo-repository/src/foo-service

func foo()  {

}
```

> - https://protobuf.dev/reference/go/go-generated/#package

<br>
