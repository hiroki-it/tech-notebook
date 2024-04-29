---
title: 【IT技術の知見】Goプラグイン＠Protocol Bufferコンパイラー
description: Goプラグイン＠Protocol Bufferコンパイラーの知見を記録しています。
---

# Goプラグイン＠Protocol Bufferコンパイラー

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Protocol BufferコンパイラーGoプラグイン

### Protocol BufferコンパイラーGoプラグインとは

サービス定義ファイル (`proto`ファイル) から`pb.go`ファイルをコンパイルできる。

```bash
$ go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
```

> - https://protobuf.dev/reference/go/go-generated/#invocation

<br>

### Protocol BufferとGoの対応関係

`pb.go`ファイルをコンパイルした場合、以下の対応関係になる。

| Protocol Buffer         | Go (`pb.go`ファイル) |
| ----------------------- | -------------------- |
| `service`               | `interface`          |
| `rpc`関数の引数と返却値 | `struct`             |

> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/codegenerate#%E3%82%B3%E3%83%BC%E3%83%89%E8%87%AA%E5%8B%95%E7%94%9F%E6%88%90%E3%81%AE%E4%BB%95%E6%A7%98
> - https://grpc.io/docs/languages/go/generated-code/
> - https://protobuf.dev/reference/go/go-generated/

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
