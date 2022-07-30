---
title: 【IT技術の知見】gRPC＠アプリケーション連携
description: gRPC＠アプリケーション連携の知見を記録しています。
---

# gRPC＠アプリケーション連携

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. gRPCの仕組み

### アーキテクチャ

![grpc_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/grpc_architecture.png)

RPCフレームワークの一つで、プロトコルバッファーを使用してRPC（リモートプロシージャーコール）を実行する。RESTful-APIに対するリクエストではリクエストメッセージのヘッダーやボディを作成する必要があるが、リモートプロシージャーコールであれば通信先の関数を指定して引数を渡せばよく、まるで自身の関数のようにコールできる。

ℹ️ 参考：

- https://qiita.com/gold-kou/items/a1cc2be6045723e242eb#%E3%82%B7%E3%83%AA%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%BA%E3%81%A7%E9%AB%98%E9%80%9F%E5%8C%96
- https://openstandia.jp/oss_info/grpc/
- https://syu-m-5151.hatenablog.com/entry/2022/04/12/130411

<br>

## 02. サーバー側のセットアップ

### プロトコルバッファー自動作成ツールのインストール

#### ▼ pipリポジトリから

Pythonで使用する場合、pipリポジトリからインストールする。

```bash
$ pip3 install grpcio-tools
```

#### ▼ gemリポジトリから

Rubyで使用する場合、gemリポジトリからインストールする。

```bash
$ gem install grpc-tools
```

#### ▼ npmリポジトリから

Node.jsで使用する場合、npmリポジトリからインストールする。

```bash
$ npm install grpc-tools
```

<br>

### 実装

#### ▼ サービス定義ファイル（```proto```ファイル）

gRPCでのAPI仕様であり、実装によりAPI仕様を説明する。サービス定義ファイルにインターフェースとメッセージ構造を実装し、このファイルから```pb```ファイルを自動作成する。このファイルには、サーバー側とクライアント側で必要な実装が定義されている。

ℹ️ 参考：https://engineering.mercari.com/blog/entry/2019-05-31-040000/

#### ▼ gRPCサーバー

リモートプロシージャーコールを受け付けるサーバーを定義する。サーバーをgRPCサーバーとして登録する必要がある。

ℹ️ 参考：https://y-zumi.hatenablog.com/entry/2019/09/07/011741

<br>

## 02-02. クライアント側のセットアップ

### gRPCライブラリのインストール

#### ▼ pipリポジトリから

Pythonで使用する場合、pipリポジトリからインストールする。

```bash
$ pip3 install grpcio
```

#### ▼ gemリポジトリから

Rubyで使用する場合、gemリポジトリからインストールする。

```bash
$ gem install grpc
```

#### ▼ npmリポジトリから

Node.jsで使用する場合、npmリポジトリからインストールする。

```bash
$ npm install grpc
```

<br>

### 実装

#### ▼ gRPCクライアント

gRPCサーバーのリモートプロシージャーコールを実行する。

ℹ️ 参考：https://y-zumi.hatenablog.com/entry/2019/09/07/011741

<br>

## 03. Goの場合

### サーバー側

#### ▼ protoファイル

クライアント側で呼び出せるようにする構造体や関数を定義する。

ℹ️ 参考：

- https://qiita.com/gold-kou/items/a1cc2be6045723e242eb#%E3%82%B7%E3%83%AA%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%BA%E3%81%A7%E9%AB%98%E9%80%9F%E5%8C%96
- https://christina04.hatenablog.com/entry/protoc-usage

```protobuf
// protoファイルの構文のバージョンを設定する。
syntax = "proto3";

// pb.goファイルで自動作成される時のパッケージ名
package foo;

// クライアント側からのリモートプロシージャーコール時に渡す引数を定義する。
// フィールドのタグを1としている。メッセージ内でユニークにする必要があり、フィールドが増えれば別の数字を割り当てる。
message Message {
  string body = 1;
}

// クライアント側からリモートプロシージャーコールされる関数を定義する。
service FooService {
  rpc SayHello(Message) returns (Message) {}
}
```

#### ▼ pb.goファイル

事前に用意した```proto```ファイルを使用して、```pb.go```ファイルを自動作成する。```pb.go```ファイルには、gRPCを使用する上で必要な構造体や関数が定義されており、ユーザーはこのファイルをそのまま使用すれば良い。

ℹ️ 参考：

- https://christina04.hatenablog.com/entry/protoc-usage
- https://qiita.com/gold-kou/items/a1cc2be6045723e242eb#%E3%82%B7%E3%83%AA%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%BA%E3%81%A7%E9%AB%98%E9%80%9F%E5%8C%96

```bash
$ protoc ./foo/foo.proto --go_out=plugins=grpc:foo 

# foo.pb.goファイルが作成される。
```

ちなみに、```pb```ファイルには、gRPCサーバーとして登録するための```Register*****ServiceServer```関数が定義される。

```go
// 〜 中略 〜

func RegisterFooServiceServer(s *grpc.Server, srv FooServiceServer) {
	s.RegisterService(&_FooService_serviceDesc, srv)
}

// 〜 中略 〜
```

#### ▼ gRPCサーバー

gRPCサーバーを実装する。

ℹ️ 参考：

- https://qiita.com/gold-kou/items/a1cc2be6045723e242eb#%E3%82%B7%E3%83%AA%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%BA%E3%81%A7%E9%AB%98%E9%80%9F%E5%8C%96
- https://entgo.io/ja/docs/grpc-server-and-client/

```go
package main

import (
	"context"
	"fmt"
	"log"
	"net"

	pb "github.com/hiroki-hasegawa/foo/foo" // pb.goファイルを読み込む。

	"google.golang.org/grpc"
)

// goサーバー
type Server struct {
}

// Helloを返却する関数
func (s *Server) SayHello(ctx context.Context, in *pb.Message) (*Message, error) {
	log.Printf("Received message body from client: %s", in.Body)
	return &pb.Message{Body: "Hello From the Server!"}, nil
}

func main() {

	// goサーバーで待ち受けるポート番号を設定する。
	listenPort, err := net.Listen("tcp", fmt.Sprintf(":%d", 9000))

	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	// gRPCサーバーを作成する。
	grpcServer := grpc.NewServer()

	// pb.goファイルで自動作成された関数を使用して、goサーバーをgRPCサーバーとして登録する。
	// goサーバーがリモートプロシージャーコールを受信できるようになる。
	pb.RegisterFooServiceServer(grpcServer, &Server{})

	// gRPCサーバーとして、goサーバーで通信を受信する。
	if err := grpcServer.Serve(listenPort); err != nil {
		log.Fatalf("failed to serve: %s", err)
	}
}
```

<br>

### クライアント側

#### ▼ gRPCクライアント

gRPCクライアントを実装する。

ℹ️ 参考：https://qiita.com/gold-kou/items/a1cc2be6045723e242eb#%E3%82%B7%E3%83%AA%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%BA%E3%81%A7%E9%AB%98%E9%80%9F%E5%8C%96

```go
package main

import (
	"log"

	"golang.org/x/net/context"
	"google.golang.org/grpc"

	pb "github.com/hiroki-hasegawa/foo/foo" // pb.goファイルを読み込む。
)

func main() {

	// gRPCコネクションを作成する。
	conn, err := grpc.Dial(":9000", grpc.WithInsecure())

	if err != nil {
		log.Fatalf("did not connect: %s", err)
	}

	defer conn.Close()

	// gRPCサーバーとして、goサーバーを作成する。
	c := pb.NewFooServiceClient(conn)

	// goサーバーのリモートプロシージャーコールを実行する。
	response, err := c.SayHello(context.Background(), &pb.Message{Body: "Hello From Client!"})

	if err != nil {
		log.Fatalf("Error when calling SayHello: %s", err)
	}

	log.Printf("Response from server: %s", response.Body)
}
```

<br>
