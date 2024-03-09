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

`proto`ファイルのあるディレクトリを指定する。

`protoc`コマンドで`proto`ファイルを直接指定するだけではエラーになる。

```bash
$ protoc -I=. --go_out=. foo.proto
```

> - https://christina04.hatenablog.com/entry/protoc-usage

<br>

### --<言語名>\_out

#### ▼ --go_out

`foo.proto`ファイルから、`foo.pb.go`ファイルをコンパイルする。

```bash
$ protoc -I=. --go_out=. foo.proto
```

#### ▼ --java_out

`foo.proto`ファイルから、`foo.pb.java`ファイルをコンパイルする。

```bash
$ protoc -I=. --java_out=. foo.proto
```

#### ▼ --php_out

`foo.proto`ファイルから、`foo.pb.php`ファイルをコンパイルする。

```bash
$ protoc -I=. --php_out=. foo.proto
```

#### ▼ --python_out

`foo.proto`ファイルから、`foo.pb.py`ファイルをコンパイルする。

```bash
$ protoc -I=. --python_out=. foo.proto
```

#### ▼ --ruby_out

`foo.proto`ファイルから、`foo.pb.rb`ファイルをコンパイルする。

```bash
$ protoc -I=. --ruby_out=. foo.proto
```

#### ▼ --rust_out

`foo.proto`ファイルから、`foo.pb.rs`ファイルをコンパイルする。

```bash
$ protoc -I=. --rust_out=. foo.proto
```

#### ▼ --go-grpc_out

`foo.proto`ファイルから、gRPCに対応する`foo.pb.go`ファイルをコンパイルする。

```bash
$ protoc -I=. --go_out=. --go-grpc_out=. foo.proto
```

<br>
