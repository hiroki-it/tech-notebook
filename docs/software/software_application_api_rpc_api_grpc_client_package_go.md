---
title: 【IT技術の知見】Go＠gRPCクライアントパッケージ
description: Go＠gRPCクライアントパッケージの知見を記録しています。
---

# Go＠gRPCクライアントパッケージ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### 各種ツール

#### ▼ Protocol Bufferコンパイラー

`proto`ファイルをコンパイルするために、Protocol Bufferコンパイラーをインストールする。

マイクロサービス別にリポジトリがある場合、各リポジトリで同じバージョンの`protoc`コマンドを使用できるように、パッケージ管理ツールを使用した方がよい。

```bash
$ asdf plugin list all | grep protoc

$ asdf plugin add protoc https://github.com/paxosglobal/asdf-protoc.git

$ asdf install protoc
```

> - https://grpc.io/docs/protoc-installation/
> - https://maku.blog/p/37e6uck/
> - https://github.com/pseudomuto/protoc-gen-doc/blob/master/Dockerfile

#### ▼ Protocol BufferコンパイラーGoプラグイン

サービス定義ファイル (`proto`ファイル) から`pb.go`ファイルをコンパイルするために、Protocol Bufferコンパイラーのプラグインをインストールする。

ただし、執筆時点 (2024/07/15) では、 `protoc-gen-go`モジュールに移行するべきである。

```bash
$ go install google.golang.org/protobuf/cmd/protoc-gen-go@HEAD

$ protoc-gen-go --version

protoc-gen-go <バージョン>
```

> - https://pkg.go.dev/github.com/golang/protobuf/protoc-gen-go
> - https://github.com/juaruipav/grpc-go-docker-helloworld/blob/master/server/Dockerfile#L7-L8
> - https://medium.com/@jitenderkmr/exploring-grpc-gateway-in-golang-building-a-reverse-proxy-for-seamless-restful-integration-d342fe5248c4

#### ▼ Protocol BufferコンパイラーGo-gRPCプラグイン

サービス定義ファイル (`proto`ファイル) からgRPC対応の`pb.go`ファイルをコンパイルするために、Protocol Bufferコンパイラーのプラグインをインストールする。

`protoc-gen-go`の移行先のモジュールである。

```bash
$ go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@HEAD

$ protoc-gen-go-grpc --version

protoc-gen-go-grpc <バージョン>
```

> - https://pkg.go.dev/google.golang.org/grpc/cmd/protoc-gen-go-grpc#section-readme
> - https://stackoverflow.com/a/60580149/12771072
> - https://stackoverflow.com/a/64849053/12771072

#### ▼ 上記ツールを持つ専用コンテナ

各種ツールをGoアプリにダウンロードしても良いが、専用コンテナとして切り分けるとよい。

サービス定義ファイル (`proto`ファイル) から`pb.go`ファイルを作成したくなったら、このコンテナを実行する。

`docker-compose.yml`ファイルは以下の通りである。

```yaml
services:
  grpc_compile:
    image: protocol_buffer_compiler
    build:
      context: .
    container_name: protocol_buffer_compiler
    volumes:
      - .:/
```

`Dockerfile`ファイルは以下の通りである。

```dockerfile
FROM golang:<Goアプリと同じバージョン>

RUN apt update -y \
  && apt install -y protobuf-compiler \
  && export GO111MODULE=on \
  && go install google.golang.org/protobuf/cmd/protoc-gen-go@<バージョン> \
  && go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@<バージョン>

COPY . /
CMD ["/protocol_buffer_compiler.sh"]
```

`protocol_buffer_compiler.sh`ファイルは以下の通りである。

バックアップも兼ねて、`pb.go`ファイルを作業日付ごとに作成する。

```bash
#!/bin/sh

# 日付ごとにディレクトリを作成する
DATE=`date '+%Y%m%d%H%M%S'`
mkdir -p ${DATE}

protoc \
  -I=${DATE} \
  --go_out=${DATE} \
  --go_opt=paths=source_relative \
  --go-grpc_out=${DATE} \
  --go-grpc_opt=paths=source_relative,require_unimplemented_servers=false \
  *.proto
```

> - https://developers.freee.co.jp/entry/new-arch-protobuf-docker-image
> - https://github.com/namely/docker-protoc

<br>

### gRPCクライアントとgRPCサーバーの両方

#### ▼ `proto`ファイル (サービス定義ファイル) とは

gRPCクライアントとgRPCサーバーの両方で、サービス定義ファイル (`proto`ファイル) を作成する。

例えば、`message`はJSONに代わるスキーマを表し、`service`はgRPCにおけるAPI仕様を表す。

サービス定義ファイルにインターフェースとメッセージ構造を実装し、このファイルから`pb.go`ファイルをコンパイルする。

> - https://y-zumi.hatenablog.com/entry/2019/09/07/011741
> - https://engineering.mercari.com/blog/entry/2019-05-31-040000/
> - https://docs.wantedly.dev/fields/the-system/apis#protofairu

#### ▼ `pb.go`ファイルとは

gRPCクライアントとgRPCサーバーの両方で、`proto`ファイルから`pb.go`ファイルをコンパイルする。

`protoc`コマンドを使用して、`pb.go`ファイルを作成する。

このファイルには、gRPCクライアントとgRPCサーバーの両方が参照するための実装が定義されており、開発者はそのまま使用すれば良い。

```bash
# foo.protoファイルから、gRPCに対応するfoo.pb.goファイルをコンパイルする。
$ protoc -I=. --go_out=. --go-grpc_out=. foo.proto

# ワイルドカードで指定できる。
$ protoc -I=. --go_out=. --go-grpc_out=. *.proto
```

> - https://github.com/golang/protobuf/issues/1070#issuecomment-607465055
> - https://y-zumi.hatenablog.com/entry/2019/09/07/011741

#### ▼ RPC-API仕様書

gRPCにおけるAPI仕様書である。

仕様の実装である`proto`ファイルを使用して、RPC-API仕様書を作成できる。

```bash
$ protoc --doc_out=. --doc_opt=html,index.html *.proto
```

<br>

### サーバー側のみ

#### ▼ gRPCサーバー

リモートプロシージャーコールを受け付けるサーバーを定義する。

サーバーをgRPCサーバーとして登録する必要がある。

> - https://y-zumi.hatenablog.com/entry/2019/09/07/011741

<br>

### gRPCクライアント側のみ

#### ▼ gRPCクライアントパッケージ

記入中...

#### ▼ gRPCクライアント

GoのgRPCサーバーをリモートプロシージャーコールする。

> - https://y-zumi.hatenablog.com/entry/2019/09/07/011741

<br>

## 02. クライアント側のインターセプター

### クライアント側のインターセプターとは

gRPCでは、ミドルウェア処理として、インターセプターをリクエスト処理の前後に挿入する。

<br>

### インターセプターの種類

#### ▼ メトリクス系

```go
package main

import (
	"google.golang.org/grpc"

	grpc_prometheus "github.com/grpc-ecosystem/go-grpc-prometheus"
)

func main() {

	...

	// gRPCサーバーとの接続を作成する
	conn, err := grpc.DialContext(
		ctx,
        ":7777",
		grpc.WithChainUnaryInterceptor(grpc_prometheus.UnaryClientInterceptor),
	)

	...
}
```

#### ▼ 分散トレース系

```go
package main

import (
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"google.golang.org/grpc"
)

func main() {

	...

    // gRPCサーバーとの接続を作成する
	conn, err := grpc.DialContext(
		ctx,
        ":7777",
		grpc.WithChainUnaryInterceptor(otelgrpc.UnaryClientInterceptor()),
    )

	...
}
```

<br>

## 02-02. インターセプターの設定方法

### 単項RPCの場合

#### ▼ 既製のインターセプター (`UnaryClientInterceptor`)

gRPCでは、単項RPCを送信するクライアント側のミドルウェア処理は`UnaryClientInterceptor`という名前で定義されている。

```go
type UnaryClientInterceptor func(
	ctx context.Context,
	method string,
	req,
	reply interface{},
	cc *ClientConn,
	invoker UnaryInvoker,
	opts ...CallOption
    ) error
```

この関数は、リクエストでエラーが起こった場合に、内部的に`SetStatus`関数を実行する。

エラー時に、Spanステータスとエラーメッセージをスパンに設定してくれる。

> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/v1.25.0/instrumentation/google.golang.org/grpc/otelgrpc/interceptor.go#L107

これをgRPCサーバーとの接続作成時に、`WithChainUnaryInterceptor`関数に渡す。

```go
package main

import (
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"google.golang.org/grpc"

	// pb.goファイルを読み込む。
	pb "github.com/hiroki-hasegawa/foo/foo"
)

func main() {

	...

    // gRPCサーバーとの接続を作成する
	conn, err := grpc.DialContext(
		ctx,
        ":7777",
		grpc.WithChainUnaryInterceptor(otelgrpc.UnaryClientInterceptor()),
    )

	defer conn.Close()

	// gRPCクライアントを作成する
	client := pb.NewFooServiceClient(conn)

	// goサーバーをリモートプロシージャーコールする。
	response, err := client.SayHello(
        context.Background(),
        &pb.Message{Body: "Hello From Client!"},
    )

	...
}
```

> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/serverinterceptor#unary-rpc%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%82%BB%E3%83%97%E3%82%BF

#### ▼ 自前のインターセプター

関数に定められた引数を定義すれば、インターセプターとして使用できる。

```go
package intercetor

import (
	"google.golang.org/grpc"
)

func UnaryClientInterceptor(
	ctx context.Context,
	method string,
	req,
    reply interface{},
	cc *grpc.ClientConn,
	invoker grpc.UnaryInvoker,
	callOpts ...grpc.CallOption,
	) error {

	// リクエスト送信の事前処理

	err := invoker(ctx, method, req, reply, cc, callOpts...) // 単項RPC処理

	// リクエスト送信の事後処理

	return err
}
```

ユーザー定義のオプションを渡したい場合は、`grpc.UnaryClientInterceptor`型を返却する関数とする。

```go
package intercetor

import (
	"google.golang.org/grpc"
)

func UnaryClientInterceptor(opts ...fooOption) grpc.UnaryClientInterceptor {

	// オプションを使用してパラメーターを作成する

    return func(
		ctx context.Context,
		method string,
		req,
		reply interface{},
		cc *grpc.ClientConn,
		invoker grpc.UnaryInvoker,
		callOpts ...grpc.CallOption,
	) error {

		// リクエスト送信の事前処理

		err := invoker(ctx, method, req, reply, cc, callOpts...) // 単項RPC処理

		// リクエスト送信の事後処理

		return err
	}
}
```

> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/clientinterceptor#%E8%87%AA%E4%BD%9Cunary-interceptor%E3%81%AE%E5%AE%9F%E8%A3%85

<br>

### ストリーミングRPCの場合

##### ▼ 既製のインターセプター (`StreamClientInterceptor`)

gRPCでは、ストリーミングRPCを送信するクライアント側のミドルウェア処理は、`StreamClientInterceptor`という名前にすることが定められている。

```go
type StreamClientInterceptor func(
    ctx context.Context,
    desc *StreamDesc,
    cc *ClientConn,
    method string,
    streamer Streamer,
    opts ...CallOption,
) (ClientStream, error)
```

この関数は、リクエストでエラーが起こった場合に、内部的に`SetStatus`関数を実行する。

エラー時に、Spanステータスとエラーメッセージをスパンに設定してくれる。

> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/v1.25.0/instrumentation/google.golang.org/grpc/otelgrpc/interceptor.go#L257

これをgRPCサーバーとの接続作成時に、`WithChainStreamInterceptor`関数に渡す。

```go
package main

import (
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"google.golang.org/grpc"

	// pb.goファイルを読み込む。
	pb "github.com/hiroki-hasegawa/foo/foo"
)

func main() {

	...

    // gRPCサーバーとの接続を作成する
	conn, err := grpc.DialContext(
		ctx,
        ":7777",
		grpc.WithChainStreamInterceptor(otelgrpc.StreamClientInterceptor()),
    )

	defer conn.Close()

	// gRPCクライアントを作成する
	client := pb.NewFooServiceClient(conn)

	// goサーバーをリモートプロシージャーコールする。
	response, err := client.SayHello(
        context.Background(),
        &pb.Message{Body: "Hello From Client!"},
    )

	...
}
```

> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/serverinterceptor#unary-rpc%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%82%BB%E3%83%97%E3%82%BF

#### ▼ 自前のインターセプター

関数に定められた引数を定義すれば、インターセプターとして使用できる。

```go
package intercetor

import (
	"google.golang.org/grpc"
)

func StreamClientInterceptor(
    ctx context.Context,
    desc *StreamDesc,
    cc *ClientConn,
    method string,
    streamer Streamer,
    opts ...CallOption,
	) (grpc.ClientStream, error) {

		// 事前処理

		streamer, err := streamer(ctx, desc, cc, method, callOpts...) // ストリーミングRPC処理

		// 事後処理

		return &wrapClientStream{streamer}, err
}

type wrapClientStream struct {
	grpc.ClientStream
}
```

ユーザー定義のオプションを渡したい場合は、`grpc.StreamClientInterceptor`型を返却する関数とする。

```go
package intercetor

import (
	"google.golang.org/grpc"
)

func StreamClientInterceptor(opts ...fooOption) grpc.StreamServerInterceptor {

	// オプションを使用してパラメーターを作成する

    return func(
		ctx context.Context,
		desc *StreamDesc,
		cc *ClientConn,
		method string,
		streamer Streamer,
		opts ...CallOption,
	) (grpc.ClientStream, error) {

		// 事前処理

		streamer, err := streamer(ctx, desc, cc, method, callOpts...) // ストリーミングRPC処理

		// 事後処理

		return &wrapClientStream{streamer}, err
    }
}

type wrapClientStream struct {
	grpc.ClientStream
}
```

> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/clientinterceptor#stream-rpc%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%82%BB%E3%83%97%E3%82%BF

<br>

## 03. サーバー側のインターセプター

### サーバー側のインターセプターとは

gRPCでは、ミドルウェア処理として、インターセプターをレスポンス処理の前後に挿入する。

<br>

### インターセプターの種類

#### ▼ 認証系

記入中...

#### ▼ メトリクス系

記入中...

#### ▼ 分散トレース系

記入中...

#### ▼ リカバー系

gRPCの処理で起こったパニックを、`Internal Server Error`として処理する。

```go
package main

import (

	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/interceptors/recovery"

	"google.golang.org/grpc"

	...

)

func main() {

	// gRPCサーバーを作成する。
	grpcServer := grpc.NewServer(
		// 単項RPCのサーバーインターセプター処理
		grpc.ChainUnaryInterceptor(
			// リカバー処理
	        grpc_recovery.UnaryServerInterceptor(...),
		),
	)

    ...

}
```

> - https://github.com/grpc-ecosystem/go-grpc-middleware/blob/v1.4.0/recovery/doc.go
> - https://ybalexdp.hatenablog.com/entry/grpc_recovery

#### ▼ フィルター系

分散トレースの作成を無視する場合を設定する。

例えば、フィルター系の`HealthCheck`関数はgRPCのヘルスチェックパス (`/grpc.health.v1.Health/Check`) のプレフィクス (`/grpc.health.v1.Health`) を返却する。

これを`WithInterceptorFilter`関数に渡すと、ヘルスチェックのパスで分散トレースの作成を無効化できる。

```go
package main

import (

	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/interceptors/recovery"

	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc/filters"
	"google.golang.org/grpc"

	...

)

func main() {

	// gRPCサーバーを作成する。
	grpcServer := grpc.NewServer(
		// 単項RPCのサーバーインターセプター処理
		grpc.ChainUnaryInterceptor(
			// gRPCのヘルスチェックパス (/grpc.health.v1.Health/Check) へのリクエストを無視する
	        grpc_recovery.UnaryServerInterceptor(otelgrpc.WithInterceptorFilter(filters.HealthCheck())),
		),
	)

    ...

}
```

<br>

## 03-02. インターセプターの設定方法

### 単項RPCの場合

#### ▼ 既製のインターセプター (`UnaryServerInterceptor`)

gRPCでは、単項RPCを受信するサーバー側のミドルウェア処理は、`UnaryServerInterceptor`という名前にすることが定められている。

```go
type UnaryServerInterceptor func(
	ctx context.Context,
	req interface{},
	info *UnaryServerInfo,
	handler UnaryHandler,
    ) (resp interface{}, err error)
```

> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/serverinterceptor#unary-rpc%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%82%BB%E3%83%97%E3%82%BF

#### ▼ 自前のインターセプター

関数に定められた引数を定義すれば、インターセプターとして使用できる。

```go
package interceptor

import (
	"context"

	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"google.golang.org/grpc"
)

func UnaryServerInterceptor(
	ctx context.Context,
	req interface{},
	info *UnaryServerInfo,
	handler UnaryHandler,
	) (resp interface{}, err error) {

	// 事前処理

	resp, err := handler(ctx, req) // 単項RPC処理

	// 事後処理

	return err
}
```

ユーザー定義のオプションを渡したい場合は、`grpc.UnaryServerInterceptor`型を返却する関数とする。

```go
package interceptor

import (
	"context"

	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"google.golang.org/grpc"
)

func UnaryServerInterceptor(opts ...fooOption) grpc.UnaryServerInterceptor {

	// オプションを使用してパラメーターを作成する

	return func(
		ctx context.Context,
		req interface{},
		info *grpc.UnaryServerInfo,
		handler grpc.UnaryHandler,
		) (resp interface{}, err error) {

		// 事前処理

		resp, err := handler(ctx, req) // 単項RPC処理

		// 事後処理

		return err
	}
}
```

<br>

### ストリーミングRPCの場合

#### ▼ 既製のインターセプター (`StreamServerInterceptor`)

gRPCでは、ストリーミングRPCを受信するサーバー側のミドルウェア処理は`StreamServerInterceptor`という名前にすることが定められている。

```go
type StreamServerInterceptor func(
	srv interface{},
	ss ServerStream,
	info *StreamServerInfo,
	handler StreamHandler,
	) error
```

> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/serverinterceptor#stream-rpc%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%82%BB%E3%83%97%E3%82%BF

#### ▼ 自前のインターセプター

関数に定められた引数を定義すれば、インターセプターとして使用できる。

```go
package interceptor

import (
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"google.golang.org/grpc"
)

func StreamServerInterceptor(
	srv interface{},
	ss ServerStream,
	info *StreamServerInfo,
	handler StreamHandler,
	) error {

	// 事前処理

	err := handler(srv, wrapServerStream(ctx, ss, cfg)) // ストリーミングRPC処理

	// 事後処理

	return err
}
```

ユーザー定義のオプションを渡したい場合は、`grpc.StreamServerInterceptor`型を返却する関数とする。

```go
package interceptor

import (
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"google.golang.org/grpc"
)

func StreamServerInterceptor(opts ...fooOption) grpc.StreamServerInterceptor {

	// オプションを使用してパラメーターを作成する

	return func(
		srv interface{},
		ss ServerStream,
		info *StreamServerInfo,
		handler StreamHandler,
	) error {

        // 事前処理

		err := handler(srv, wrapServerStream(ctx, ss, cfg)) // ストリーミングRPC処理

		// 事後処理

		return err
	}
}
```

<br>

## 04. サーバー側の実装例

### gRPCサーバー (インターセプターがない場合)

gRPCサーバーを実装する。

```go
package main

import (
	"context"
	"fmt"
	"log"
	"net"

	// pb.goファイルを読み込む。
    pb "github.com/hiroki-hasegawa/foo/foo"

	"google.golang.org/grpc"
)

// goサーバー
type Server struct {
}

// Helloを返信する関数
func (s *Server) SayHello (ctx context.Context, in *pb.Message) (*Message, error) {
	log.Printf("Received message body from client: %v", in.Body)
	return &pb.Message{Body: "Hello From the Server!"}, nil
}

func main() {

	// gRPCサーバーを作成する。
	grpcServer := grpc.NewServer()

	// pb.goファイルでコンパイルされた関数を使用して、goサーバーをgRPCサーバーとして登録する。
	// goサーバーがリモートプロシージャーコールを受信できるようになる。
	pb.RegisterFooServiceServer(grpcServer, &Server{})

	// goサーバーで待ち受けるポート番号を設定する。
	listenPort, _ := net.Listen("tcp", fmt.Sprintf(":%d", 9000))

	if err != nil {
		log.Printf("Failed to listen: %v", err)
	}

	// gRPCサーバーとして、goサーバーで通信を受信する。
	if err := grpcServer.Serve(listenPort); err != nil {
		log.Printf("Failed to serve: %v", err)
	}

	...
}
```

> - https://qiita.com/gold-kou/items/a1cc2be6045723e242eb#%E3%82%B7%E3%83%AA%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%BA%E3%81%A7%E9%AB%98%E9%80%9F%E5%8C%96
> - https://entgo.io/ja/docs/grpc-server-and-client/

<br>

### gRPCサーバー (インターセプターを使用する場合)

#### ▼ インターセプターを使用する場合について

gRPCサーバーでは、リクエスト−レスポンスの送受信前のミドルウェア処理として、インターセプターを実行できる。

非`Chain`関数であれば単一のインターセプター、一方で`Chain`関数であれば複数のインターセプターを渡せる。

執筆時点 (202309/16) で、パッケージの`v1`は非推奨で、`v2`が推奨である。

```go
package main

import (
	"fmt"
	"log"
	"net"

	// pb.goファイルを読み込む。
    pb "github.com/hiroki-hasegawa/foo/foo"

	grpc_prometheus "github.com/grpc-ecosystem/go-grpc-middleware/providers/prometheus"
	grpc_auth "github.com/grpc-ecosystem/go-grpc-middleware/interceptors/auth"
	grpc_logging "github.com/grpc-ecosystem/go-grpc-middleware/interceptors/logging"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/interceptors/recovery"
	grpc_selector "github.com/grpc-ecosystem/go-grpc-middleware/interceptors/selector"

	"github.com/grpc-ecosystem/go-grpc-middleware/interceptors"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"google.golang.org/grpc"
)

func main() {

	// gRPCサーバーを作成する。
	grpcServer := grpc.NewServer(
		// 単項RPCのサーバーインターセプター処理
		grpc.ChainUnaryInterceptor(
			// 認証処理
			grpc_selector.UnaryServerInterceptor(...),
			// メトリクス処理
	     	grpc_prometheus.UnaryServerInterceptor(...),
			// ロギング処理
		    grpc_logging.UnaryServerInterceptor(...),
			// 分散トレースのスパン作成処理
			otelgrpc.UnaryServerInterceptor(...),
			// リカバー処理
	        grpc_recovery.UnaryServerInterceptor(...),
		),
		// ストリーミングRPCのサーバーインターセプター処理
		grpc.ChainStreamInterceptor(
			otelgrpc.StreamServerInterceptor(...),
			recovery.StreamServerInterceptor(...),
        ),
	)

	...


	// goサーバーで待ち受けるポート番号を設定する。
	listenPort, _ := net.Listen("tcp", fmt.Sprintf(":%d", 9000))

	// gRPCサーバーとして、goサーバーで通信を受信する。
	if err := grpcServer.Serve(listenPort); err != nil {
		log.Printf("Failed to serve: %v", err)
	}

	...
}
```

> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/serverinterceptor
> - https://pkg.go.dev/github.com/grpc-ecosystem/go-grpc-middleware#section-readme

<br>

### ヘルスチェックサーバー

`grpc_health_v1`パッケージの`RegisterHealthServer`関数を使用して、gRPCサーバーをヘルスチェックサーバーとして登録する。

```go
package main

import (
	"log"
	"net"

	"google.golang.org/grpc"
	"google.golang.org/grpc/health"

	grpc_health_v1 "google.golang.org/grpc/health/grpc_health_v1"
)

func main() {

	...

	// gRPCサーバーを作成する。
	grpcServer := grpc.NewServer(
		...
	)

	...

	healthCheckServer := health.NewServer()

	grpc_health_v1.RegisterHealthServer(grpcServer, healthCheckServer)

	// goサーバーで待ち受けるポート番号を設定する。
	listenPort, _ := net.Listen("tcp", fmt.Sprintf(":%d", 9000))

	// gRPCサーバーとして、goサーバーで通信を受信する。
	if err := grpcServer.Serve(listenPort); err != nil {
		log.Printf("Failed to serve: %v", err)
	}

	...
}
```

> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/healthcheck

<br>

## 05. gRPCクライアント側の実装例

### gRPCクライアントパッケージ

記入中...

<br>

### gRPCクライアント

gRPCクライアント側では、gRPCサーバーとの接続を作成する必要がある。

```go
package main

import (
	"log"

	"golang.org/x/net/context"
	"google.golang.org/grpc"

	// pb.goファイルを読み込む。
    pb "github.com/hiroki-hasegawa/foo/foo"
)

func main() {

	// gRPCサーバーとの接続を作成する
	conn, err := grpc.DialContext(
        ctx,
        ":7777",
        grpc.WithInsecure(),
    )

	if err != nil {
		log.Printf("did not connect: %v", err)
	}

	defer conn.Close()

	// gRPCクライアントを作成する
	client := pb.NewFooServiceClient(conn)

	// goサーバーをリモートプロシージャーコールする。
	response, err := client.SayHello(
        context.Background(),
        &pb.Message{Body: "Hello From Client!"},
    )

	if err != nil {
		log.Printf("Error when calling SayHello: %v", err)
	}

	// goサーバーからの返却を確認する。
	log.Printf("Response from server: %v", response.Body)
}
```

> - https://qiita.com/gold-kou/items/a1cc2be6045723e242eb#%E3%82%B7%E3%83%AA%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%BA%E3%81%A7%E9%AB%98%E9%80%9F%E5%8C%96

<br>

### gRPCクライアント (インターセプターを使用する場合)

#### ▼ インターセプターを使用する場合について

gRPCクライアントでは、リクエスト−レスポンスの送受信前のミドルウェアとして、インターセプターを実行できる。

非`Chain`関数であれば単一のインターセプター、一方で`Chain`関数であれば複数のインターセプターを渡せる。

#### ▼ ストリーミングRPCの場合

```go
package main

import (
	"google.golang.org/grpc"
)

func main() {

	...

	// gRPCサーバーとの接続を作成する
	conn, err := grpc.DialContext(
		ctx,
        ":7777",
		// ストリーミングRPCのインターセプター処理
		grpc.WithChainStreamInterceptor(
			myStreamClientInteceptor1,
			myStreamClientInteceptor2,
		),
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(),
	)

	...
}
```

> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/v1.18.0/instrumentation/google.golang.org/grpc/otelgrpc/example/client/main.go#L46-L49
> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/clientinterceptor

<br>

## 06. gRPCサーバーとクライアントの両方の実装例

### `proto`ファイル

クライアントからのコールで返信する構造体や関数を定義する。

```protobuf
// protoファイルの構文のバージョンを設定する。
syntax = "proto3";

import "google/api/annotations.proto";

// pb.goファイルでコンパイルされる時のパッケージ名
package foo;

// gRPCクライアント側からのリモートプロシージャーコール時に渡す引数を定義する。
// フィールドのタグを1としている。メッセージ内でユニークにする必要があり、フィールドが増えれば別の数字を割り当てる。
message Message {
  string body = 1;
}

// 単項RPC
// gRPCクライアント側からリモートプロシージャーコールされる関数を定義する。
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

<br>

### `pb.go`ファイル

事前に用意した`proto`ファイルを使用して、`pb.go`ファイルをコンパイルする。

`pb.go`ファイルには、gRPCクライアントとgRPCサーバーの両方が参照するための構造体や関数が定義されており、ユーザーはこのファイルをそのまま使用すれば良い。

`proto`コマンドを実行し、以下のような`pb.go`ファイルをコンパイルできる。

```bash
# foo.protoファイルから、gRPCに対応するfoo.pb.goファイルをコンパイルする。
$ protoc -I=. --go_out=. --go-grpc_out=. foo.proto
```

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

補足として、`pb.go`ファイルには、gRPCサーバーとして登録するための`Register<ファイル名>ServiceServer`関数が定義される。

> - https://christina04.hatenablog.com/entry/protoc-usage
> - https://qiita.com/gold-kou/items/a1cc2be6045723e242eb#%E3%82%B7%E3%83%AA%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%BA%E3%81%A7%E9%AB%98%E9%80%9F%E5%8C%96

<br>

## 07. メタデータ

### メタデータの操作

#### ▼ Append

送信/受信するgRPCリクエストのコンテキストにメタデータを設定する。

コンテキストにメタデータがすでにある場合は追加し、もしなければメタデータを新しく作成する。

```go
package main

import (
	"google.golang.org/grpc/metadata"
)

func (s *fooServer) Foo(ctx context.Context, req *foopb.FooRequest) (*foopb.FooResponse, error) {

	...

	// メタデータを作成する
	md := metadata.New(map[string]string{
		"Foo": "foo",
		"Bar": "bar",
	})

	// メタデータにキーを設定する
	md.Append("Baz", "baz")

	...

}
```

> - https://pkg.go.dev/google.golang.org/grpc/metadata#MD.Append

#### ▼ AppendToOutgoingContext

リクエスト送信用のコンテキストにメタデータとしてキーバリューを設定する。

コンテキストにメタデータがすでにある場合は追加し、もしなければメタデータを新しく作成する。

```go
package main

import (
	"google.golang.org/grpc/metadata"
)

func (s *fooServer) Foo(ctx context.Context, req *foopb.FooRequest) (*foopb.FooResponse, error) {

	...

	// メタデータをコンテキストに設定する
	ctx = metadata.AppendToOutgoingContext(ctx, "Foo", "foo")

	...

}
```

> - https://pkg.go.dev/google.golang.org/grpc/metadata#AppendToOutgoingContext
> - https://github.com/grpc/grpc-go/blob/master/Documentation/grpc-metadata.md#sending-and-receiving-metadata---client-side

#### ▼ FromIncomingContext

受信したgRPCリクエストのコンテキストからメタデータを取得する。

```go
package main

import (
	"google.golang.org/grpc/metadata"
)

func (s *fooServer) Foo(ctx context.Context, req *foopb.FooRequest) (*foopb.FooResponse, error) {

	...

	// コンテキストにメタデータがあれば取得する
	md, ok := metadata.FromIncomingContext(ctx)

    // メタデータがなければ作成する
	if !ok {
		md = metadata.MD{}
	}

	log.Print(md)

	...

}
```

> - https://pkg.go.dev/google.golang.org/grpc/metadata#FromIncomingContext

内部的には`mdIncomingKey`というコンテキストキー名を指定している。

このキー名は、`NewIncomingContext`関数がメタデータ付きのコンテキスト作成時に設定する。

```go
func ValueFromIncomingContext(ctx context.Context, key string) []string {

	...

	md, ok := ctx.Value(mdIncomingKey{}).(MD)

	...

}

func NewIncomingContext(ctx context.Context, md MD) context.Context {
	return context.WithValue(ctx, mdIncomingKey{}, md)
}
```

> - https://github.com/grpc/grpc-go/blob/v1.63.0/metadata/metadata.go

#### ▼ FromOutgoingContext

送信するgRPCリクエストのコンテキストからメタデータを取得する。

```go
package main

import (
	"google.golang.org/grpc/metadata"
)

func (s *fooServer) Foo(ctx context.Context, req *foopb.FooRequest) (*foopb.FooResponse, error) {

	...

	// コンテキストにメタデータがあれば取得する
	md, ok := metadata.FromOutgoingContext(ctx)

	// メタデータがなければ作成する
	if !ok {
		md = metadata.MD{}
	}

	...
}
```

> - https://pkg.go.dev/google.golang.org/grpc/metadata#FromOutgoingContext

内部的には`mdIncomingKey`というコンテキストキー名を指定している。

このキー名は、`NewOutgoingContext`関数がメタデータ付きのコンテキスト作成時に設定する。

```go
func ValueFromIncomingContext(ctx context.Context, key string) []string {

	...

	md, ok := ctx.Value(mdIncomingKey{}).(MD)

	...

}

func NewOutgoingContext(ctx context.Context, md MD) context.Context {
	return context.WithValue(ctx, mdOutgoingKey{}, rawMD{md: md})
}
```

> - https://github.com/grpc/grpc-go/blob/v1.63.0/metadata/metadata.go

#### ▼ Get

送信/受信するgRPCリクエストのコンテキストからメタデータを取得する。

```go
package main

import (
	"google.golang.org/grpc/metadata"
)

func (s *fooServer) Foo(ctx context.Context, req *foopb.FooRequest) (*foopb.FooResponse, error) {

	...

	// メタデータを作成する
	md := metadata.New(map[string]string{
		"Foo": "foo",
		"Bar": "bar",
	})

	// メタデータから値を取得する
	val = md.Get("foo")

	...

}
```

> - https://pkg.go.dev/google.golang.org/grpc/metadata#MD.Get

#### ▼ New

メタデータを作成する。

『`grpc-`』から始まるキー名はgRPCで予約されている。

```go
package main

import (
	"google.golang.org/grpc/metadata"
)

func (s *fooServer) Foo(ctx context.Context, req *foopb.FooRequest) (*foopb.FooResponse, error) {

	...

	// メタデータを作成する
	md := metadata.New(map[string]string{
		"Foo": "foo",
		"Bar": "bar",
	})

	...

}
```

空のメタデータを作成する場合は、`MD`構造体を初期化しても良い。

```go
package main

import (
	"google.golang.org/grpc/metadata"
)

func (s *fooServer) Foo(ctx context.Context, req *foopb.FooRequest) (*foopb.FooResponse, error) {

	...

	// メタデータを作成する
	md := metadata.MD{}

	...

}
```

> - https://pkg.go.dev/google.golang.org/grpc/metadata#New

#### ▼ NewIncomingContext

リクエスト受信用のコンテキストにメタデータを設定する。

コンテキストにメタデータがすでにある場合は置換するため、もしメタデータにキーを追加したい場合は`AppendToOutgoingContext`関数を使用する。

```go
package main

import (
	"google.golang.org/grpc/metadata"
)

func (s *fooServer) Foo(ctx context.Context, req *foopb.FooRequest) (*foopb.FooResponse, error) {

	...

	// メタデータを作成する
	md := metadata.New(map[string]string{
		"Foo": "foo",
		"Bar": "bar",
	})

	// メタデータをコンテキストに設定する
	ctx = metadata.NewIncomingContext(ctx, md)

	...

}
```

> - https://pkg.go.dev/google.golang.org/grpc/metadata#NewIncomingContext
> - https://github.com/grpc/grpc-go/blob/master/Documentation/grpc-metadata.md#sending-and-receiving-metadata---client-side

#### ▼ NewOutgoingContext

リクエスト送信用のコンテキストにメタデータを設定する。

コンテキストにメタデータがすでにある場合は置換するため、もしメタデータにキーを追加したい場合は`AppendToOutgoingContext`関数を使用する。

```go
package main

import (
	"google.golang.org/grpc/metadata"
)

func (s *fooServer) Foo(ctx context.Context, req *foopb.FooRequest) (*foopb.FooResponse, error) {

	...

	// メタデータを作成する
	md := metadata.New(map[string]string{
		"Foo": "foo",
		"Bar": "bar",
	})

	// メタデータをコンテキストに設定する
	ctx = metadata.NewOutgoingContext(ctx, md)

	...

}
```

> - https://pkg.go.dev/google.golang.org/grpc/metadata#NewOutgoingContext
> - https://github.com/grpc/grpc-go/blob/master/Documentation/grpc-metadata.md#sending-and-receiving-metadata---client-side

#### ▼ Set

送信/受信するgRPCリクエストのコンテキストにメタデータを設定する。

```go
package main

import (
	"google.golang.org/grpc/metadata"
)

func (s *fooServer) Foo(ctx context.Context, req *foopb.FooRequest) (*foopb.FooResponse, error) {

	...

	// メタデータを作成する
	md := metadata.New(map[string]string{
		"Foo": "foo",
		"Bar": "bar",
	})

	// メタデータにキーを設定する
	md.Set("Baz", "baz")

	...

}
```

> - https://pkg.go.dev/google.golang.org/grpc/metadata#MD.Set

<br>

### クライアントからサーバーに単項RPCを送信する場合

#### ▼ クライアント側

クライアント側では、メタデータを設定する。

```go
package main

import (
	"google.golang.org/grpc/metadata"
)

func (s *fooServer) Foo(ctx context.Context, req *foopb.FooRequest) (*foopb.FooResponse, error) {

	// メタデータを作成する
	md := metadata.New(map[string]string{
		"Foo": "foo",
		"Bar": "bar",
	})

	// メタデータをコンテキストに設定する
	ctx = metadata.NewOutgoingContext(ctx, md)

	...

}
```

> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/metadata#%E3%82%AF%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%B3%E3%83%88--%3E-%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%81%B8%E3%81%AE%E3%83%A1%E3%82%BF%E3%83%87%E3%83%BC%E3%82%BF%E9%80%81%E5%8F%97%E4%BF%A1

<br>

#### ▼ サーバー側

サーバー側では、メタデータを取得する。

```go
package main

import (
	"google.golang.org/grpc/metadata"
)

func (s *fooServer) Foo(ctx context.Context, req *foopb.FooRequest) (*foopb.FooResponse, error) {

	// コンテキストにメタデータがあれば取得する
	md, ok := metadata.FromIncomingContext(ctx)

	// メタデータがなければ作成する
	if !ok {
		md = metadata.MD{}
	}

	log.Print(md)

	...

}
```

> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/metadata#%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%81%8C%E3%83%A1%E3%82%BF%E3%83%87%E3%83%BC%E3%82%BF%E3%82%92%E5%8F%97%E4%BF%A1%E3%81%99%E3%82%8B

<br>

### サーバーからクライアントに単項RPCを送信する場合

#### ▼ サーバー側

```go
package main

import (
	"google.golang.org/grpc/metadata"
)

func (s *fooServer) Foo(ctx context.Context, req *foopb.FooRequest) (*foopb.FooResponse, error) {

	// メタデータを作成する
	headMd := metadata.New(map[string]string{
		"Foo": "foo",
		"Bar": "bar",
	})

	// メタデータをヘッダーに設定する
	if err := grpc.SetHeader(ctx, headerMD); err != nil {
		return nil, err
	}

	// メタデータをトレーラーに設定する
	if err := grpc.SetTrailer(ctx, trailerMD); err != nil {
		return nil, err
	}

	...

}
```

> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/metadata#%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E3%81%8B%E3%82%89%E3%83%A1%E3%82%BF%E3%83%87%E3%83%BC%E3%82%BF%E3%82%92%E9%80%81%E4%BF%A1%E3%81%99%E3%82%8B

#### ▼ クライアント側

```go
package main

import (
	"google.golang.org/grpc/metadata"
)

func (s *fooServer) Foo(ctx context.Context, req *foopb.FooRequest) (*foopb.FooResponse, error) {

	var header, trailer metadata.MD

	// ヘッダーやトレーラーからメタデータを取得する
	res, err := client.Hello(
		ctx,
		req,
		grpc.Header(&header),
		grpc.Trailer(&trailer),
	)

	if err != nil {
		md = metadata.MD{}
	}

	log.Print(md)

	...

}
```

> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/metadata#%E3%82%AF%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%B3%E3%83%88%E3%81%8C%E3%83%A1%E3%82%BF%E3%83%87%E3%83%BC%E3%82%BF%E3%82%92%E5%8F%97%E4%BF%A1%E3%81%99%E3%82%8B

<br>
