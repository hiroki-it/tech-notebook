---
title: 【IT技術の知見】パッケージ＠gRPC
description: パッケージ＠gRPCの知見を記録しています。
---

# パッケージ＠gRPC

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 必要なもの

### サーバー側

#### ▼ プロトコルバッファー自動作成ツール

#### ▼ gRPCサーバー

リモートプロシージャーコールを受け付けるサーバーを定義する。

サーバーをgRPCサーバーとして登録する必要がある。

> - https://y-zumi.hatenablog.com/entry/2019/09/07/011741

<br>

### クライアント側

#### ▼ gRPCライブラリのインストール

#### ▼ gRPCサーバーのコール

GoのgRPCサーバーをリモートプロシージャーコールする。

> - https://y-zumi.hatenablog.com/entry/2019/09/07/011741

<br>

### サーバー/クライアントの両方

#### ▼ `.proto`ファイル

クライアント側とサーバー側の両方で、サービス定義ファイル (`.proto`ファイル) を作成する。

gRPCにおけるAPI仕様の実装であり、実装によりAPI仕様を説明する。

サービス定義ファイルにインターフェースとメッセージ構造を実装し、このファイルから`pb.*`ファイルを自動作成する。

> - https://y-zumi.hatenablog.com/entry/2019/09/07/011741
> - https://engineering.mercari.com/blog/entry/2019-05-31-040000/

#### ▼ `protoc`コマンド

クライアント側とサーバー側の両方で、自動作成のために、`protoc`コマンドをインストールする。

マイクロサービス別にリポジトリがある場合、各リポジトリで同じバージョンの`protoc`コマンドを使用できるように、パッケージ管理ツールを使用した方がよい。

```bash
$ asdf plugin list all | grep protoc

$ asdf plugin add protoc  https://github.com/paxosglobal/asdf-protoc.git

$ asdf install protoc
```

> - https://grpc.io/docs/protoc-installation/
> - https://maku.blog/p/37e6uck/
> - https://github.com/pseudomuto/protoc-gen-doc/blob/master/Dockerfile

#### ▼ `pb.*`ファイル (拡張子は言語ごとに異なる)

クライアント側とサーバー側の両方で、`.proto`ファイルから`pb.*`ファイルを自動作成する。

`protoc`コマンドを使用して、`pb.*`ファイルを作成する。

このファイルには、サーバー側とクライアント側の両方が参照するための実装が定義されており、開発者はそのまま使用すれば良い。

```bash
# foo.pb.goファイルを作成する。
$ protoc --proto_path=./foo/foo.proto --go_out=plugins=grpc:foo

# ワイルドカードで指定できる。
$ protoc --proto_path=./*.proto --go_out=plugins=grpc:.
```

> - https://y-zumi.hatenablog.com/entry/2019/09/07/011741

#### ▼ RPC-API仕様書

gRPCにおけるAPI仕様書である。仕様の実装である`.proto`ファイルを使用して、RPC-API仕様書を作成できる。

```bash
$ protoc --doc_out=./ --doc_opt=html,index.html ./*.proto
```

<br>

## 02. Goの場合

### サーバー側

#### ▼ プロトコルバッファー自動作成ツール

```bash
$ go install google.golang.org/protobuf/cmd/protoc-gen-go@latest

$ go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
```

> - https://qiita.com/totoaoao/items/6bf533b6d2164b74ac09

#### ▼ gRPCサーバー (Interceptorがない場合)

gRPCサーバーを実装する。

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

// Helloを返信する関数
func (s *Server) SayHello (ctx context.Context, in *pb.Message) (*Message, error) {
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

> - https://qiita.com/gold-kou/items/a1cc2be6045723e242eb#%E3%82%B7%E3%83%AA%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%BA%E3%81%A7%E9%AB%98%E9%80%9F%E5%8C%96
> - https://entgo.io/ja/docs/grpc-server-and-client/

#### ▼ gRPCサーバー (Interceptorを渡す場合)

`go-grpc-middleware`パッケージを使用すると、アプリケーションの前処理 (例：認証、ロギング、メトリクス、分散トレーシング、など) を実行できる。

執筆時点 (202309/16) で、パッケージの`v1`は非推奨で、`v2`が推奨である。

```go
package main

import (
	"context"
	"fmt"
	"log"
	"net"

	pb "github.com/hiroki-hasegawa/foo/foo" // pb.goファイルを読み込む。
	grpcprom "github.com/grpc-ecosystem/go-grpc-middleware/providers/prometheus"

	"github.com/grpc-ecosystem/go-grpc-middleware/v2/interceptors/recovery"
	"github.com/grpc-ecosystem/go-grpc-middleware/v2/interceptors"
	"github.com/grpc-ecosystem/go-grpc-middleware/v2/interceptors/auth"
	"github.com/grpc-ecosystem/go-grpc-middleware/v2/interceptors/logging"
	"github.com/grpc-ecosystem/go-grpc-middleware/v2/interceptors/recovery"
	"github.com/grpc-ecosystem/go-grpc-middleware/v2/interceptors/selector"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"google.golang.org/grpc"
)

func main() {

	...

	metrics := grpcprom.NewServerMetrics(
		grpcprom.WithServerHandlingTimeHistogram(
			grpcprom.WithHistogramBuckets([]float64{0.001, 0.01, 0.1, 0.3, 0.6, 1, 3, 6, 9, 20, 30, 60, 90, 120}),
		),
	)

	// gRPCサーバーを作成する。
	grpcServer := grpc.NewServer(
        // 単項RPCのインターセプター
		grpc.ChainUnaryInterceptor(
			// 認証処理
			selector.UnaryServerInterceptor(auth.UnaryServerInterceptor(authFn), selector.MatchFunc(allButHealthZ)),
			// メトリクス処理
			metrics.UnaryServerInterceptor(grpcprom.WithExemplarFromContext(exemplarFromContext)),
			// ロギング処理
			logging.UnaryServerInterceptor(interceptorLogger(rpcLogger), logging.WithFieldsFromContext(logTraceID)),
			// 分散トレーシング処理
			otelgrpc.UnaryServerInterceptor(),
			// 再試行処理
			recovery.UnaryServerInterceptor(recovery.WithRecoveryHandler(grpcPanicRecoveryHandler)),
		),
        // ストリーミングRPCのインターセプター
		grpc.ChainStreamInterceptor(
			otelgrpc.StreamServerInterceptor(),

			...

			recovery.StreamServerInterceptor(recovery.WithRecoveryHandler(grpcPanicRecoveryHandler)),
		),
	)

	...
}
```

> - https://github.com/grpc-ecosystem/go-grpc-middleware#middleware
> - https://github.com/grpc-ecosystem/go-grpc-middleware/blob/v2.0.0/examples/server/main.go#L136-L152
> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/serverinterceptor#%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%82%BB%E3%83%97%E3%82%BF%E3%81%AE%E5%B0%8E%E5%85%A5
> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/serverinterceptor#stream-rpc%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%82%BB%E3%83%97%E3%82%BF
> - https://pkg.go.dev/github.com/grpc-ecosystem/go-grpc-middleware#section-readme

<br>

### クライアント側

#### ▼ gRPCライブラリのインストール

#### ▼ gRPCサーバーのコール

gRPCクライアントを実装する。

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

	// goサーバーをリモートプロシージャーコールする。
	response, err := c.SayHello(context.Background(), &pb.Message{Body: "Hello From Client!"})

	if err != nil {
		log.Fatalf("Error when calling SayHello: %s", err)
	}

	// goサーバーからの返却を確認する。
	log.Printf("Response from server: %s", response.Body)
}
```

> - https://qiita.com/gold-kou/items/a1cc2be6045723e242eb#%E3%82%B7%E3%83%AA%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%BA%E3%81%A7%E9%AB%98%E9%80%9F%E5%8C%96

<br>

### サーバー/クライアントの両方

#### ▼ `.proto`ファイル

クライアントからのコールで返信する構造体や関数を定義する。

```protobuf
// protoファイルの構文のバージョンを設定する。
syntax = "proto3";

import "google/api/annotations.proto";

// pb.goファイルで自動作成される時のパッケージ名
package foo;

// クライアント側からのリモートプロシージャーコール時に渡す引数を定義する。
// フィールドのタグを1としている。メッセージ内でユニークにする必要があり、フィールドが増えれば別の数字を割り当てる。
message Message {
  string body = 1;
}

// 単項RPC
// クライアント側からリモートプロシージャーコールされる関数を定義する。
service FooService {
  rpc SayHello(Message) returns (Message) {
    // エンドポイント
    option (google.api.http).get = "/foo";
  }
}
```

> - https://future-architect.github.io/articles/20220624a/#grpc-gateway%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%9F%E9%96%8B%E7%99%BA%E3%81%AE%E6%B5%81%E3%82%8C
> - https://qiita.com/gold-kou/items/a1cc2be6045723e242eb#%E3%82%B7%E3%83%AA%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%BA%E3%81%A7%E9%AB%98%E9%80%9F%E5%8C%96
> - https://christina04.hatenablog.com/entry/protoc-usage

#### ▼ `pb.go`ファイル

事前に用意した`.proto`ファイルを使用して、`pb.go`ファイルを自動作成する。

`pb.go`ファイルには、サーバー側とクライアント側の両方が参照するための構造体や関数が定義されており、ユーザーはこのファイルをそのまま使用すれば良い。

```bash
# foo.pb.goファイルを作成する。
$ protoc --proto_path=./foo/foo.proto --go_out=plugins=grpc:foo
```

補足として、`pb.go`ファイルには、gRPCサーバーとして登録するための`Register<ファイル名>ServiceServer`関数が定義される。

```go
// コメントアウトに元になった.protoファイルの情報が記載されている
//
// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.2.0
// - protoc             v3.21.12
// source: foo.proto

// 〜 中略 〜

func RegisterFooServiceServer(s *grpc.Server, srv FooServiceServer) {
	s.RegisterService(&_FooService_serviceDesc, srv)
}

// 〜 中略 〜
```

> - https://christina04.hatenablog.com/entry/protoc-usage
> - https://qiita.com/gold-kou/items/a1cc2be6045723e242eb#%E3%82%B7%E3%83%AA%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%BA%E3%81%A7%E9%AB%98%E9%80%9F%E5%8C%96

<br>

## 03. Pythonの場合

### サーバー側

#### ▼ プロトコルバッファー自動作成ツール

pipリポジトリから、プロトコルバッファー自動作成ツールをインストールする。

```bash
$ pip3 install grpcio-tools
```

#### ▼ gRPCサーバー

<br>

### クライアント側

#### ▼ gRPCクライアントのインストール

pipリポジトリから、gRPCクライアントをインストールする。

```bash
$ pip3 install grpcio
```

<br>

### サーバー/クライアントの両方

#### ▼ `.proto`ファイル

#### ▼ `pb.py`ファイル

<br>

## 04. Rubyの場合

### サーバー側

#### ▼ プロトコルバッファー自動作成ツール

gemリポジトリから、プロトコルバッファー自動作成ツールをインストールする。

```bash
$ gem install grpc-tools
```

#### ▼ gRPCサーバー

<br>

### クライアント側

#### ▼ gRPCクライアントのインストール

gemリポジトリから、gRPCクライアントをインストールする。

```bash
$ gem install grpc
```

<br>

### サーバー/クライアントの両方

#### ▼ `.proto`ファイル

#### ▼ `pb.rb`ファイル

<br>

## 05. Javascriptの場合

### サーバー側

#### ▼ プロトコルバッファー自動作成ツール

npmリポジトリから、プロトコルバッファー自動作成ツールをインストールする。

```bash
$ npm install grpc-tools
```

#### ▼ gRPCサーバー

<br>

### クライアント側

#### ▼ gRPCライブラリのインストール

npmリポジトリから、gRPCクライアントをインストールする。

```bash
$ npm install grpc
```

<br>

### サーバー/クライアントの両方

#### ▼ `.proto`ファイル

#### ▼ `pb.js`ファイル

<br>
