---
title: 【IT技術の知見】gRPC＠RPC-API
description: gRPC＠RPC-APIの知見を記録しています。
---

# gRPC＠RPC-API

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. gRPCの仕組み

### アーキテクチャ

RPCフレームワークの一つで、プロトコルバッファーを使用してRPC (リモートプロシージャーコール) を実行する。

RESTful-APIに対するリクエストではリクエストのヘッダーやボディを作成する必要がある。

一方で、リモートプロシージャーコールであれば通信先の関数を指定して引数を渡せばよく、まるで自身の関数のようにコールできる。

![grpc_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_architecture.png)

> - https://qiita.com/gold-kou/items/a1cc2be6045723e242eb#%E3%82%B7%E3%83%AA%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%BA%E3%81%A7%E9%AB%98%E9%80%9F%E5%8C%96
> - https://openstandia.jp/oss_info/grpc/
> - https://syu-m-5151.hatenablog.com/entry/2022/04/12/130411
> - https://atmarkit.itmedia.co.jp/ait/articles/1501/26/news009.html

<br>

### 通信方式

#### ▼ gRPCの通信方式とは

gRPCでは、クライアントとサーバーの間の通信方式に種類がある。

通信方式は、`.proto`ファイルで定義する。

![grpc_connection-type](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_connection-type.png)

> - https://fintan.jp/page/1521/

#### ▼ Unary RPC (単項RPC)

クライアントが`1`個のリクエストを送信すると、サーバーは`1`個のレスポンスを返信する。

一番よく使用する。

```protobuf
service Request {
  rpc Request (Request) returns (Response) {
  }
}
```

> - https://qiita.com/tomo0/items/310d8ffe82749719e029#unary-rpc

#### ▼ Server Streaming RPC (サーバーストリーミングRPC)

クライアントが`1`個のリクエストを送信すると、サーバーは複数個のレスポンスを返信する。

任意のタイミングで、サーバーからまとめてレスポンスさせたい場合に使用する。

```protobuf
service Notification {
  rpc Notification (NotificationRequest) returns (stream NotificationResponse) {
  }
}
```

> - https://qiita.com/tomo0/items/310d8ffe82749719e029#server-streaming-rpc

#### ▼ Client Streaming RPC (クライアントストリーミングRPC)

クライアントが複数個のリクエストを送信すると、サーバーは`1`個のレスポンスを返信する。

クライアントからのリクエストのデータサイズが大きくなる場合 (例：アップロードサービス) に使用する。

```protobuf
service Upload {
  rpc Upload (stream UploadRequest) returns (UploadResponse) {
  }
}
```

> - https://qiita.com/tomo0/items/310d8ffe82749719e029#client-streaming-rpc

#### ▼ Bidirectional Streaming RPC (双方向ストリーミングRPC)

クライアントが複数個のリクエストを送信すると、サーバーは複数個のレスポンスを返信する。

また、双方向にリクエストを送信できる。

クライアントとサーバーが互いにリクエストを送信する場合 (例：チャット、オンラインゲーム) に使用する。

```protobuf
service Chat {
  rpc Chat (stream ChatRequest) returns (stream ChatResponse) {

    // クライアントからのリクエストを受信する。
    in, err := stream.Recv()

    ...

    // クライアントにリクエストを送信する。
    stream.Send(message);

    ...

    // リクエストを終了する。
    err = stream.CloseSend()
  }
}
```

> - https://qiita.com/tomo0/items/310d8ffe82749719e029#bidirectional-streaming-rpc
> - https://reboooot.net/post/hello-grpc/
> - https://christina04.hatenablog.com/entry/2017/11/13/203000

<br>

## 02. ディレクトリ構成規約

### アプリとプロトコルバッファーを異なるリポジトリで管理 (推奨)

各マイクロサービスの`.proto`ファイル、RPC-API仕様書、`.pb.*`ファイル、を同じリポジトリで管理する。

```yaml
# プロトコルバッファー
repository/
├── proto/ # サービス定義ファイル (.protoファイル)
│   ├── foo/ # マイクロサービス
│   │   ├── client/
│   │   │   └── foo.proto # fooサービスをgRPCクライアントとして使う場合のプロトコルバッファー
│   │   │
│   │   └── server/
│   │       └── foo.proto # fooサービスをgRPCサーバーとして使う場合のプロトコルバッファー
│   │
│   ├── bar/
│   │   ├── client/
│   │   │   └── bar.proto
│   │   │
│   │   └── server/
│   │       └── bar.proto
│   ...
│
├── doc/ # .protoファイルから自動作成されるRPC-API仕様書
│   ├── foo/ # マイクロサービス
│   │   └── foo.html
│   │
│   ├── bar/
│   │   └── bar.html
│   │
│   ...
│
└── pb_go/ # .protoファイルから自動作成される.pb.*ファイル
    ├── foo/ # マイクロサービス
    │   └── foo.pb.go
    │
    ├── bar/
    │   └── bar.pb.py
    │
    ...
```

```yaml
# アプリケーション
repository/
└── src/
    ├── foo/ # マイクロサービス (Go製)
    │   └── infrastructure
    │       └── grpc
    │           ├── client/ # fooサービスをgRPCクライアントとして使う場合の処理
    │           │   └── client.go
    │           │
    │           ├── server/ # fooサービスをgRPCサーバーとして使う場合の処理
    │           │   └── server.go
    │           │
    │           ...
    │
    ├── bar/ # マイクロサービス (Python製)
    │   └── infrastructure
    │     └── grpc
    │           ├── client/
    │           │   └── client.py
    │           │
    │           ├── server/
    │           │   └── server.py
    │           │
    ...         ...
```

> - https://medium.com/namely-labs/how-we-build-grpc-services-at-namely-52a3ae9e7c35
> - https://lab.mo-t.com/blog/protocol-buffers

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

### gRPCサーバー

リモートプロシージャーコールを受け付けるサーバーを定義する。

サーバーをgRPCサーバーとして登録する必要がある。

> - https://y-zumi.hatenablog.com/entry/2019/09/07/011741

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

### gRPCクライアント

gRPCサーバーをリモートプロシージャーコールする。

> - https://y-zumi.hatenablog.com/entry/2019/09/07/011741

<br>

## 02-03. 共通ファイルのセットアップ

### サービス定義ファイル (`.proto`ファイル)

gRPCにおけるAPI仕様の実装であり、実装によりAPI仕様を説明する。

クライアント側とサーバー側の両方で作成する必要がある。

サービス定義ファイルにインターフェースとメッセージ構造を実装し、このファイルから`pb.*`ファイルを自動作成する。

```bash
# foo.pb.goファイルを作成する。
$ protoc --proto_path=./foo/foo.proto --go_out=plugins=grpc:foo

# ワイルドカードで指定できる。
$ protoc --proto_path=./*.proto --go_out=plugins=grpc:.
```

> - https://engineering.mercari.com/blog/entry/2019-05-31-040000/

<br>

### `pb.*`ファイル (拡張子は言語ごとに異なる)

`.proto`ファイルから自動作成される。

このファイルには、サーバー側とクライアント側の両方が参照するための実装が定義されており、開発者はそのまま使用すれば良い。

<br>

### RPC-API仕様書

gRPCにおけるAPI仕様書である。仕様の実装である`.proto`ファイルを使用して、RPC-API仕様書を作成できる。

```bash
$ protoc --doc_out=./ --doc_opt=html,index.html ./*.proto
```

<br>

## 03. Goの場合

### サーバー側

#### ▼ gRPCサーバー (単一のInterceptorの場合)

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

#### ▼ gRPCサーバー (複数のInterceptorの場合)

`go-grpc-middleware`パッケージを使用すると、複数のInterceptorを設定できる。

```go
package main

import (
	"context"
	"fmt"
	"log"
	"net"

	pb "github.com/hiroki-hasegawa/foo/foo" // pb.goファイルを読み込む。
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"


	"google.golang.org/grpc"
	"github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	"github.com/grpc-ecosystem/go-grpc-middleware/tags"
)

func main() {

	...

	// gRPCサーバーを作成する。
	grpcServer := grpc.NewServer(
		grpc.ChainUnaryInterceptor(
			// Order matters e.g. tracing interceptor have to create span first for the later exemplars to work.
			otelgrpc.UnaryServerInterceptor(),

			...

			recovery.UnaryServerInterceptor(recovery.WithRecoveryHandler(grpcPanicRecoveryHandler)),
		),
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
> - https://christina04.hatenablog.com/entry/grcp-interceptor-chain-order

<br>

### クライアント側

#### ▼ gRPCクライアント

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

### 共通ファイル

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
// 〜 中略 〜

func RegisterFooServiceServer(s *grpc.Server, srv FooServiceServer) {
	s.RegisterService(&_FooService_serviceDesc, srv)
}

// 〜 中略 〜
```

> - https://christina04.hatenablog.com/entry/protoc-usage
> - https://qiita.com/gold-kou/items/a1cc2be6045723e242eb#%E3%82%B7%E3%83%AA%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%BA%E3%81%A7%E9%AB%98%E9%80%9F%E5%8C%96

<br>
