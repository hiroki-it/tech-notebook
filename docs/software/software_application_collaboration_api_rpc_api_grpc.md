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

### 前提

ここでは、マイクロサービスが以下のような順で実行されるとする。

```yaml
foo (Go製)
⬇︎
⬇︎
bar (Python製)
⬇︎
⬇︎
baz (Node.js製)
```

<br>

### `.proto`ファイルをgRPCサーバー側に置く場合

#### ▼ gRPCクライアント/サーバーのリポジトリ

各マイクロサービスのリポジトリでは、アプリケーションのインフラ層に`.proto`ファイルを置く。

`.pb`ファイルに関しては、gRPCサーバーがさらに後続のマイクロサービスをコールするgRPCクライアントにもなるので、以下の両方を同じリポジトリで管理する。

- gRPCサーバーとしてのprotoファイルから作った`.pb`ファイル
- gRPCクライアントとしての`.proto`ファイル (これは後続のgRPCサーバーのリポジトリにある) から作った`.pb`ファイル

```yaml
# fooサービス (Go製)
repository/
├── src/
│   ├── interface/
│   ├── usecase/
│   ├── domain/
│   ├── infrastructure
│   │   ├── doc/ # .protoファイルから自動作成したRPC-API仕様書
│   │   │   └── bar/
│   │   │       └── bar-client.html
│   │   │
│   │   ├── pb_go/ # .protoファイルから自動作成した.pb.*ファイル
│   │   │   └── bar/
│   │   │       └── bar-client.pb.go
│   │   │
│   │   └── grpc # gRPCクライアントの定義
│   │       └── bar/
│   │           └── bar-client.go
│   ...
│
├── proto/ # サービス定義ファイル (.protoファイル)
│   └── bar/
│       └── bar-client.proto
│
...
```

```yaml
# barサービス (Python製)
repository/
├── src/
│   ├── interface/
│   ├── usecase/
│   ├── domain/
│   ├── infrastructure
│   │   ├── doc/ # .protoファイルから自動作成したRPC-API仕様書
│   │   │   ├── bar/
│   │   │   │   └── bar-server.html
│   │   │   │
│   │   │   └── baz/
│   │   │       └── baz-client.html
│   │   │
│   │   ├── pb_go/ # .protoファイルから自動作成した.pb.*ファイル
│   │   │   ├── bar/
│   │   │   │   └── bar-server.pb.py
│   │   │   │
│   │   │   └── baz/
│   │   │       └── baz-client.pb.py
│   │   │
│   │   └── grpc # gRPCサーバーとクライアントの定義
│   │       ├── bar/
│   │       │   └── bar-server.py
│   │       │
│   │       └── baz/
│   │           └── baz-client.py
│   │
│   ...
│
├── proto/ # サービス定義ファイル (.protoファイル)
│   ├── bar/
│   │   └── bar-server.proto
│   │
│   └── baz/
│       └── baz-client.proto
│
...
```

```yaml
# bazサービス (Node.js製)
repository/
├── src/
│   ├── interface/
│   ├── usecase/
│   ├── domain/
│   ├── infrastructure
│   ├── infrastructure
│   │   ├── doc/ # .protoファイルから自動作成したRPC-API仕様書
│   │   │   └── baz/
│   │   │       └── baz-server.html
│   │   │
│   │   ├── pb_go/ # .protoファイルから自動作成した.pb.*ファイル
│   │   │   └── baz/
│   │   │       └── baz-server.pb.js
│   │   │
│   │   └── grpc # gRPCサーバーの定義
│   │       └── baz/
│   │           └── baz-server.js
│   │
│   ...
│
├── proto/ # サービス定義ファイル (.protoファイル)
│   └── baz/
│       └── baz-server.proto
│
...
```

> - https://lab.mo-t.com/blog/protocol-buffers
> - https://medium.com/namely-labs/how-we-build-grpc-services-at-namely-52a3ae9e7c35

<br>

### `.proto`ファイルと`pb_go`ファイルを専用リポジトリに置く場合

#### ▼ gRPCクライアント/サーバーのリポジトリ

各マイクロサービスのリポジトリでは、アプリケーションのインフラ層にgRPCクライアントとgRPCサーバーの定義を置く。

```yaml
# fooサービス (Go製)
repository/
├── src/
│   ├── interface/
│   ├── usecase/
│   ├── domain/
│   ├── infrastructure
│   │   └── grpc
│   │       └── bar/
│   │           └── bar-client.go
│   │
```

```yaml
# barサービス (Python製)
repository/
├── src/
│   ├── interface/
│   ├── usecase/
│   ├── domain/
│   ├── infrastructure
│   │   └── grpc
│   │       ├── bar/
│   │       │   └── bar-server.py
│   │       │
│   │       └── baz/
│   │           └── baz-client.py
│   │
```

```yaml
# bazサービス (Node.js製)
repository/
├── src/
│   ├── interface/
│   ├── usecase/
│   ├── domain/
│   ├── infrastructure
│   │   └── grpc
│   │       └── baz/
│   │           └── baz-server.js
│   │
```

> - https://lab.mo-t.com/blog/protocol-buffers
> - https://medium.com/namely-labs/how-we-build-grpc-services-at-namely-52a3ae9e7c35

#### ▼ プロトコルバッファーのリポジトリ

プロトコルバッファーのリポジトリでは、各マイクロサービスの`.proto`ファイル、RPC-API仕様書、`.pb.*`ファイル、を同じリポジトリで管理する。

```yaml
# プロトコルバッファー
repository/
├── proto/ # サービス定義ファイル (.protoファイル)
│   ├── bar/
│   │   ├── bar-server.proto
│   │   └── bar-client.proto
│   │
│   └── baz/
│       └── baz-server.proto
│
├── doc/ # .protoファイルから自動作成したRPC-API仕様書
│   ├── bar/
│   │   ├── bar-server.html
│   │   └── bar-client.html
│   │
│   └── baz/
│       └── baz-server.html
│
│
└── pb_go/ # .protoファイルから自動作成した.pb.*ファイル
    ├── bar/
    │   ├── bar-server.pb.py
    │   └── bar-client.pb.go
    │
    └── baz/
        └── baz-server.pb.js
```

> - https://lab.mo-t.com/blog/protocol-buffers
> - https://medium.com/namely-labs/how-we-build-grpc-services-at-namely-52a3ae9e7c35

<br>
