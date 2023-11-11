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

従来のHTTP/1.0ではなく、HTTP/2.0プロトコルを使用する。

RESTful-APIに対するリクエストではリクエストのヘッダーやボディを作成する必要がある。

一方で、リモートプロシージャーコールであれば通信先の関数を指定して引数を渡せばよく、まるで自身の関数のようにコールできる。

![grpc_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_architecture.png)

> - https://qiita.com/gold-kou/items/a1cc2be6045723e242eb#%E3%82%B7%E3%83%AA%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%BA%E3%81%A7%E9%AB%98%E9%80%9F%E5%8C%96
> - https://openstandia.jp/oss_info/grpc/
> - https://syu-m-5151.hatenablog.com/entry/2022/04/12/130411
> - https://atmarkit.itmedia.co.jp/ait/articles/1501/26/news009.html

<br>

## 02. 通信方式

### gRPCの通信方式とは

gRPCでは、クライアントとサーバーの間の通信方式に種類がある。

通信方式は、`proto`ファイルで定義する。

![grpc_connection-type](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_connection-type.png)

> - https://fintan.jp/page/1521/
> - https://www.oreilly.com/library/view/grpc-up-and/9781492058328/ch04.html

<br>

### Unary RPC (単項RPC)

#### ▼ 単項RPCとは

![grpc_unary-rpc.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_unary-rpc.png)

`1`個のTCPコネクションを確立し、その中に`1`個のストリームを作成する。

クライアントが`1`個のリクエストを送信すると、サーバーは`1`個のレスポンスを返信する。

一番よく使用する。

```protobuf
service Request {

  rpc Request (Request) returns (Response) {

    ...

  }
}
```

> - https://qiita.com/tomo0/items/310d8ffe82749719e029#unary-rpc
> - https://www.oreilly.com/library/view/grpc-up-and/9781492058328/ch04.html
> - https://kiririmode.hatenablog.jp/entry/20190623/1561247109

<br>

### Server Streaming RPC (サーバーストリーミングRPC)

#### ▼ サーバーストリーミングRPCとは

![grpc_server-streaming.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_server-streaming.png)

`1`個のTCPコネクションを確立し、その中に複数のストリームを作成する。

クライアントが`1`個のリクエストを送信すると、サーバーは複数個のレスポンスを並行的に返信する。

任意のタイミングで、サーバーからまとめてレスポンスさせたい場合に使用する。

```protobuf
service Notification {

  rpc Notification (NotificationRequest) returns (stream NotificationResponse) {

    ...

  }
}
```

> - https://qiita.com/tomo0/items/310d8ffe82749719e029#server-streaming-rpc
> - https://www.oreilly.com/library/view/grpc-up-and/9781492058328/ch04.html

<br>

### Client Streaming RPC (クライアントストリーミングRPC)

#### ▼ クライアントストリーミングRPC とは

![grpc_client-streaming-rpc.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_client-streaming-rpc.png)

`1`個のTCPコネクションを確立し、その中に複数のストリームを作成する。

この時、クライアントが複数個のリクエストを並行的に送信すると、サーバーは`1`個のレスポンスを返信する。

クライアントからのリクエストのデータサイズが大きくなる場合 (例：アップロードサービス) に使用する。

```protobuf
service Upload {

  rpc Upload (stream UploadRequest) returns (UploadResponse) {

    ...

  }
}
```

> - https://qiita.com/tomo0/items/310d8ffe82749719e029#client-streaming-rpc
> - https://www.oreilly.com/library/view/grpc-up-and/9781492058328/ch04.html

<br>

### Bidirectional Streaming RPC (双方向ストリーミングRPC)

#### ▼ 双方向ストリーミングRPCとは

![grpc_bidrectional-streaming-rpc.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_bidrectional-streaming-rpc.png)

`1`個のTCPコネクションを確立し、その中に複数のストリームを作成する。

クライアントが複数個のリクエストを並行的に送信し、サーバーも複数個のレスポンスを並行的に返信する。

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
> - https://www.oreilly.com/library/view/grpc-up-and/9781492058328/ch04.html

<br>

## 03. HTTP/1.1とgRPCの違い

### ヘッダーの構造

#### ▼ リクエストヘッダー

| ヘッダー名             | 説明                           |
| ---------------------- | ------------------------------ |
| `accept-encoding`      |                                |
| `content-type`         |                                |
| `grpc-accept-encoding` |                                |
| `grpc-timeout `        | gRPCのタイムアウト時間を表す。 |
| `method`               | リクエストのメソッドを表す。   |
| `path`                 | リクエストのパスを表す。       |
| `scheme`               |                                |
| `user-agent`           |                                |
| ...                    |                                |

> - https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-HTTP2.md#requests

#### ▼ レスポンスヘッダー

> - https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-HTTP2.md#responses

<br>

### レスポンスタイム

#### ▼ HTTP/1.1の場合

HTTP/1.1の場合、`1`個のリクエストとレスポンスを送受信する。

> - https://www.thoughtworks.com/insights/blog/microservices/scaling-microservices-gRPC-part-one
> - https://levelup.gitconnected.com/scaling-microservices-with-grpc-and-envoy-72a64fc5bbb6

#### ▼ gRPCの場合

単項RPCの場合、`1`個のリクエストとレスポンスを送受信する。

そのため、従来のHTTP/1.1と同じレスポンスタイムである。

一方でストリーミングRPCの場合、複数個のリクエストとレスポンスを並行的に送受信する (多重化)。

そのため、重複しない通信時間が合計のレスポンスタイムになる。

この時、リクエストとレスポンスの多重化により、帯域幅を無駄なく使用できるため、レスポンスタイムが短くなる。

![grpc_streaming-rpc_response-time.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_streaming-rpc_response-time.png)

> - https://www.thoughtworks.com/insights/blog/microservices/scaling-microservices-gRPC-part-one
> - https://levelup.gitconnected.com/scaling-microservices-with-grpc-and-envoy-72a64fc5bbb6
> - https://zenn.dev/zawawahoge/articles/8690c7bd521099#http%2F2%E3%81%AE%E5%BC%B7%E3%81%BF%EF%BC%9A%E5%A4%9A%E9%87%8D%E5%8C%96

<br>

### ステータスコード

| HTTP/1.1のステータスコード | gRPCのステータス番号 | ステータスコード     | 説明                                                                                           |
| -------------------------- | -------------------- | -------------------- | ---------------------------------------------------------------------------------------------- |
| `200`                      | `0`                  | `OK`                 | リクエストに成功した。                                                                         |
| `499`                      | `1`                  | `Canceled`           |                                                                                                |
| `500`                      | `2`                  | `Unknown`            |                                                                                                |
| `400`                      | `3`                  | `InvalidArgument`    |                                                                                                |
| `504`                      | `4`                  | `DeadlineExceeded`   | タイムアウト時間内にgRPCサーバーに接続できなかった。                                           |
| `404`                      | `5`                  | `NotFound`           | リクエストしたデータが存在しない。                                                             |
| `409`                      | `6`                  | `AlreadyExists`      |                                                                                                |
| `403`                      | `7`                  | `PermissionDenied`   |                                                                                                |
| `429`                      | `8`                  | `ResourceExhausted`  |                                                                                                |
| `400`                      | `9`                  | `FailedPrecondition` |                                                                                                |
| `499`                      | `10`                 | `Aborted`            |                                                                                                |
| `400`                      | `11`                 | `OutOfRange`         | リクエストのパラメーターが正しくない。                                                         |
| `501`                      | `12`                 | `Unimplemented`      |                                                                                                |
| `500`                      | `13`                 | `Internal`           | 宛先がエラーを返却した。                                                                       |
| `503`                      | `14`                 | `Unavailable`        | gRPCサーバー側で関数を実行する準備ができておらず、gRPCクライアント側で関数のコールに失敗した。 |
| `500`                      | `15`                 | `DataLoss`           |                                                                                                |
| `401`                      | `16`                 | `Unauthenticated`    |                                                                                                |

> - https://grpc.io/docs/guides/error/#error-status-codes
> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/errorcode#http%E3%81%AE%E3%83%AC%E3%82%B9%E3%83%9D%E3%83%B3%E3%82%B9%E3%82%B9%E3%83%86%E3%83%BC%E3%82%BF%E3%82%B9%E3%82%B3%E3%83%BC%E3%83%89%E3%81%A8%E3%81%AE%E9%81%95%E3%81%84
> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/errorcode#http%E3%81%AE%E3%83%AC%E3%82%B9%E3%83%9D%E3%83%B3%E3%82%B9%E3%82%B9%E3%83%86%E3%83%BC%E3%82%BF%E3%82%B9%E3%82%B3%E3%83%BC%E3%83%89%E3%81%A8%E3%81%AE%E9%81%95%E3%81%84
> - https://qiita.com/Hiraku/items/0549e4cf7079d22b27e8

<br>

### タイムアウト

#### ▼ HTTP/1/1の場合

TCPコネクションをリクエスト/レスポンスにタイムアウト時間を適用する。

#### ▼ 単項RPCの場合

TCPコネクション上に単一のストリーミングしかない。

そのため、ストリーミングを通過するリクエスト/レスポンスにタイムアウト時間を適用する。

#### ▼ ストリーミングRPCの場合

TCPコネクション上に複数のストリーミングがある。

そのため、ストリーミングを通過するリクエスト/レスポンスごとに同じタイムアウト時間を別々に適用する。

<br>

## 04. ディレクトリ構成規約

### 前提

ここでは、マイクロサービスが以下のような順で実行されるとする。

```yaml
foo # Node.js製
⬇︎
⬇︎
bar # Go製
⬇︎
⬇︎
baz # Python製
```

<br>

### `proto`ファイルをgRPCサーバー側に置く場合

#### ▼ gRPCクライアント/サーバーのリポジトリ

各マイクロサービスのリポジトリでは、アプリケーションのインフラ層に`proto`ファイルを置く。

`pb`ファイルに関しては、gRPCサーバーがさらに後続のマイクロサービスをコールするgRPCクライアントにもなるので、以下の両方を同じリポジトリで管理する。

- gRPCサーバーとしての`proto`ファイルから作った`pb`ファイル
- gRPCクライアントとしての`proto`ファイル (これは後続のgRPCサーバーのリポジトリにある) から作った`pb`ファイル

```yaml
# fooサービス (Node.js製)
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
│   │   │       └── bar-client.pb.js
│   │   │
│   │   └── grpc # gRPCクライアントの定義
│   │       └── bar/
│   │           └── bar-client.js
│   ...
│
├── proto/ # サービス定義ファイル (.protoファイル)
│   └── bar/
│       └── bar-client.proto
│
...
```

```yaml
# barサービス (Go製)
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
│   │   │   │   └── bar-server.pb.go
│   │   │   │
│   │   │   └── baz/
│   │   │       └── baz-client.pb.go
│   │   │
│   │   └── grpc # gRPCサーバーとクライアントの定義
│   │       ├── bar/
│   │       │   └── bar-server.go
│   │       │
│   │       └── baz/
│   │           └── baz-client.go
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
# bazサービス (Python製)
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
│   │   │       └── baz-server.pb.py
│   │   │
│   │   └── grpc # gRPCサーバーの定義
│   │       └── baz/
│   │           └── baz-server.py
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

### `proto`ファイルと`pb_go`ファイルを専用リポジトリに置く場合

#### ▼ gRPCクライアント/サーバーのリポジトリ

各マイクロサービスのリポジトリでは、アプリケーションのインフラ層にgRPCクライアントとgRPCサーバーの定義を置く。

```yaml
# fooサービス (Node.js製)
repository/
├── src/
│   ├── interface/
│   ├── usecase/
│   ├── domain/
│   ├── infrastructure
│   │   └── grpc # gRPCクライアントの定義
│   │       └── bar/
│   │           └── bar-client.js
│   │
```

```yaml
# barサービス (Go製)
repository/
├── src/
│   ├── interface/
│   ├── usecase/
│   ├── domain/
│   ├── infrastructure
│   │   └── grpc # gRPCサーバーとクライアントの定義
│   │       ├── bar/
│   │       │   └── bar-server.go
│   │       │
│   │       └── baz/
│   │           └── baz-client.go
│   │
```

```yaml
# bazサービス (Python製)
repository/
├── src/
│   ├── interface/
│   ├── usecase/
│   ├── domain/
│   ├── infrastructure
│   │   └── grpc # gRPCサーバーの定義
│   │       └── baz/
│   │           └── baz-server.py
│   │
```

> - https://lab.mo-t.com/blog/protocol-buffers
> - https://medium.com/namely-labs/how-we-build-grpc-services-at-namely-52a3ae9e7c35

#### ▼ プロトコルバッファーのリポジトリ

プロトコルバッファーのリポジトリでは、各マイクロサービスの`proto`ファイル、RPC-API仕様書、`.pb.*`ファイル、を同じリポジトリで管理する。

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
    │   ├── bar-server.pb.go
    │   └── bar-client.pb.js
    │
    └── baz/
        ├── baz-client.pb.go
        └── baz-server.pb.py
```

> - https://lab.mo-t.com/blog/protocol-buffers
> - https://medium.com/namely-labs/how-we-build-grpc-services-at-namely-52a3ae9e7c35

<br>
