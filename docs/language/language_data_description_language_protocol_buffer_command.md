---
title: 【IT技術の知見】コマンド＠Protocol Buffer
description: コマンド＠Protocol Bufferの知見を記録しています。
---

# コマンド＠Protocol Buffer

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. protocコマンド

### -I (--proto_path)

`--proto_path`でも良い。

`proto`ファイルのあるディレクトリを指定する。

`protoc`コマンドで`proto`ファイルを直接指定するだけではエラーになる。

```bash
# foo.protoファイルのあるディレクトリを指定する
$ protoc -I=. --go_out=. foo.proto
```

> - https://christina04.hatenablog.com/entry/protoc-usage

<br>

## 02. プラグイン名\_opt

### --プラグイン名\_optとは

`proto`ファイルから`pb`ファイルをコンパイルする時のオプションを設定する。

> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/codegenerate#protoc%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E3%81%A7%E3%82%B3%E3%83%BC%E3%83%89%E3%82%92%E7%94%9F%E6%88%90%E3%81%99%E3%82%8B

<br>

### go_opt

#### ▼ paths

--プラグイン名\_optオプションのパスが絶対パスか相対パスかを設定する。

```bash
$ protoc -I=. --go_out=. --go_opt=paths=source_relative foo.proto
```

> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/codegenerate#protoc%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E3%81%A7%E3%82%B3%E3%83%BC%E3%83%89%E3%82%92%E7%94%9F%E6%88%90%E3%81%99%E3%82%8B

<br>

### go-grpc_opt

#### ▼ paths

```bash
$ protoc \
    -I=. \
    --go_out=. \
    --go_opt=paths=source_relative \
    --go-grpc_out=. \
    --go-grpc_opt=paths=source_relative \
    foo.proto
```

> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/codegenerate#protoc%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E3%81%A7%E3%82%B3%E3%83%BC%E3%83%89%E3%82%92%E7%94%9F%E6%88%90%E3%81%99%E3%82%8B

#### ▼ require_unimplemented_servers

`pb.go`ファイルに`mustEmbedUnimplemented<Service名>Server`メソッドを自動定義するかどうかを設定する。

古い`github.com/golang/protobuf`パッケージから新しい`google.golang.org/protobuf`パッケージに移行する場合、これを`false`にする必要がある。

```bash
$ protoc \
    -I=. \
    --go_out=. \
    --go_opt=paths=source_relative \
    --go-grpc_out=. \
    --go-grpc_opt=paths=source_relative,require_unimplemented_servers=false \
    foo.proto
```

> - https://github.com/grpc/grpc-go/blob/master/cmd/protoc-gen-go-grpc/README.md
> - https://note.com/dd_techblog/n/nb8b925d21118

<br>

## 03. --プラグイン名\_out

### --プラグイン名\_outとは

`pb`ファイルの出力先パスを設定する。

> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/codegenerate#protoc%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E3%81%A7%E3%82%B3%E3%83%BC%E3%83%89%E3%82%92%E7%94%9F%E6%88%90%E3%81%99%E3%82%8B

<br>

### --go_out

`foo.proto`ファイルから、`foo.pb.go`ファイルをコンパイルする。

```bash
$ protoc -I=. --go_out=. foo.proto
```

<br>

### --go-grpc_out

`foo.proto`ファイルから、gRPCに対応する`foo.pb.go`ファイルをコンパイルする。

```bash
$ protoc -I=. --go_out=. --go-grpc_out=. foo.proto
```

<br>

### --java_out

`foo.proto`ファイルから、`foo.pb.java`ファイルをコンパイルする。

```bash
$ protoc -I=. --java_out=. foo.proto
```

<br>

### --php_out

`foo.proto`ファイルから、`foo.pb.php`ファイルをコンパイルする。

```bash
$ protoc -I=. --php_out=. foo.proto
```

<br>

### --python_out

`foo.proto`ファイルから、`foo.pb.py`ファイルをコンパイルする。

```bash
$ protoc -I=. --python_out=. foo.proto
```

<br>

### --ruby_out

`foo.proto`ファイルから、`foo.pb.rb`ファイルをコンパイルする。

```bash
$ protoc -I=. --ruby_out=. foo.proto
```

<br>

### --rust_out

`foo.proto`ファイルから、`foo.pb.rs`ファイルをコンパイルする。

```bash
$ protoc -I=. --rust_out=. foo.proto
```

<br>
