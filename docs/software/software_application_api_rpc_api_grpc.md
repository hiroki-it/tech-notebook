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

RPCフレームワークの一つで、Protocol Bufferを使用してRPC (リモートプロシージャーコール) を実行する。

従来のHTTP/1.1ではなく、HTTP/2 (例：gRPCなど) を使用する。

RESTful-APIに対するリクエストではリクエストのヘッダーやボディを作成する必要がある。

一方で、リモートプロシージャーコールであれば通信先の関数を指定して引数を渡せばよく、まるで自身の関数のようにコールできる。

![grpc_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_architecture.png)

> - https://qiita.com/gold-kou/items/a1cc2be6045723e242eb#%E3%82%B7%E3%83%AA%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%BA%E3%81%A7%E9%AB%98%E9%80%9F%E5%8C%96
> - https://openstandia.jp/oss_info/grpc/
> - https://syu-m-5151.hatenablog.com/entry/2022/04/12/130411
> - https://atmarkit.itmedia.co.jp/ait/articles/1501/26/news009.html

<br>

### TLSの有無（暗号化の有無）

WebブラウザがgRPCクライアントの場合、TLSは必須である。

ただ、それ以外の場合はgRPCではTLSを無効化できる。

> - https://stackoverflow.com/a/51008941
> - https://stackoverflow.com/questions/34076231/why-do-browser-implementations-of-http-2-require-tls

<br>

## 02. 通信方式

### gRPCの通信方式とは

gRPCでは、gRPCクライアントとgRPCサーバーの間の通信方式に種類がある。

通信方式は、`proto`ファイルで定義する。

![grpc_connection-type](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_connection-type.png)

> - https://fintan.jp/page/1521/
> - https://www.oreilly.com/library/view/grpc-up-and/9781492058328/ch04.html

<br>

### Unary RPC (単項RPC)

#### ▼ 単項RPCとは

![grpc_unary-rpc](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_unary-rpc.png)

まず、`1`個のTCP接続を確立し、その中に`1`個のストリームを作成する。

次に、gRPCクライアントが`1`個のリクエストを送信し、これが終えると受信後に`1`個のレスポンスを返信する。

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

![grpc_server-streaming](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_server-streaming.png)

まず、`1`個のTCP接続を確立し、その中に複数のストリームを作成する。

次に、gRPCクライアントが`1`個のリクエストを送信し、これが終えるとサーバーは複数個のレスポンスを並行的に返信する。

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

![grpc_client-streaming-rpc](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_client-streaming-rpc.png)

まず、`1`個のTCP接続を確立し、その中に複数のストリームを作成する。

次に、gRPCクライアントが複数個のリクエストを並行的に送信し、これが終えるとサーバーは`1`個のレスポンスを返信する。

gRPCクライアントからのリクエストのデータサイズが大きくなる場合 (例：アップロードサービス) に使用する。

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

![grpc_bidrectional-streaming-rpc](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_bidrectional-streaming-rpc.png)

まず、`1`個のTCP接続を確立し、その中に複数のストリームを作成する。

次に、gRPCクライアントが複数個のリクエストを並行的に送信し、これが終えるとサーバーも複数個のレスポンスを並行的に返信する (逆にサーバーからもリクエストを送信できる)。

gRPCクライアントとgRPCサーバーが互いにリクエストを送信する場合 (例：チャット、オンラインゲーム) に使用する。

```protobuf
service Chat {

  rpc Chat (stream ChatRequest) returns (stream ChatResponse) {

    // gRPCクライアントからのリクエストを受信する。
    in, err := stream.Recv()

    ...

    // gRPCクライアントにリクエストを送信する。
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

### パケットの構造

| 項目                                    | HTTP/1.1の場合               | HTTP/2の場合               |
| --------------------------------------- | ---------------------------- | -------------------------- |
| アプリケーションデータの形式            | テキスト (例：JSON、XMLなど) | バイナリ (例：Protocolbuf) |
| TLSによるアプリケーションデータの暗号化 | 任意                         | 必須 (Webブラウザのみ)     |
| トランスポートヘッダー                  | あり                         | あり                       |
| IPヘッダー                              | あり                         | あり                       |

> - https://www.wallarm.com/what/what-is-http-2-and-how-is-it-different-from-http-1

<br>

### リクエストの構造

#### ▼ リクエストメタデータ

gRPCのリクエストでは、メタデータをヘッダーに格納する。

| メタデータのキー名     | 説明                           |
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
> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/metadata
> - https://soichisumi.net/2019/04/grpc-custom-error-response/

#### ▼ レスポンスメタデータ

gRPCのレスポンスでは、エラーに関するメタデータをトレーラーに、それ以外のメタデータをヘッダーに格納する。

> - https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-HTTP2.md#responses
> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/metadata
> - https://soichisumi.net/2019/04/grpc-custom-error-response/

<br>

### 通信の多重化

#### ▼ HTTP/1.1の場合

TCP接続を確立中、レスポンスの返信があるまで、次のリクエストを送信できない。

つまり、単一のリクエストとレスポンスが単一のTCP接続を占有し、レスポンスの返信があるまで次のリクエスト送信を待たないといけない (HTTP HoLブロッキング) 。

> - https://www.honai.me/blog/post/how-http-works-4-http2/#http%2F1.x-%E3%81%AE%E8%AA%B2%E9%A1%8C

#### ▼ gRPCの場合

TCP接続を確立中、レスポンスの返信がなくても、次のリクエストを並列的に送信できる。

つまり、複数のリクエストとレスポンスが単一のTCP接続を共有し、レスポンスがなくとも次のリクエストを並行的に送信できる。

> - https://www.honai.me/blog/post/how-http-works-4-http2/#http%2F1.x-%E3%81%AE%E8%AA%B2%E9%A1%8C

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

![grpc_streaming-rpc_response-time](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_streaming-rpc_response-time.png)

> - https://www.thoughtworks.com/insights/blog/microservices/scaling-microservices-gRPC-part-one
> - https://levelup.gitconnected.com/scaling-microservices-with-grpc-and-envoy-72a64fc5bbb6
> - https://zenn.dev/zawawahoge/articles/8690c7bd521099#http%2F2%E3%81%AE%E5%BC%B7%E3%81%BF%EF%BC%9A%E5%A4%9A%E9%87%8D%E5%8C%96

<br>

### ステータスコード

#### ▼ 一覧

| HTTP/1.1の場合 | HTTP/2の場合 | 意味                 | 説明                                                                                                                                                                                                         |
| -------------- | ------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `200`          | `0`          | `OK`                 | リクエストに成功した。                                                                                                                                                                                       |
| `499`          | `1`          | `Canceled`           | gRPCクライアントが処理を中断した。                                                                                                                                                                           |
| `500`          | `2`          | `Unknown`            | いずれのステータスコードにも属していない不明なエラーである。                                                                                                                                                 |
| `400`          | `3`          | `InvalidArgument`    | 無効な引数を指定したリクエストである。                                                                                                                                                                       |
| `504`          | `4`          | `DeadlineExceeded`   | 処理が完了する前にタイムアウト時間を超過した。正常な場合でも、タイムアウト時間の超過でこのエラーになることがある。                                                                                           |
| `404`          | `5`          | `NotFound`           | リクエストしたデータが存在しない。                                                                                                                                                                           |
| `409`          | `6`          | `AlreadyExists`      |                                                                                                                                                                                                              |
| `403`          | `7`          | `PermissionDenied`   |                                                                                                                                                                                                              |
| `429`          | `8`          | `ResourceExhausted`  | gRPCクライアントがリクエスト送信しすぎている。                                                                                                                                                               |
| `400`          | `9`          | `FailedPrecondition` |                                                                                                                                                                                                              |
| `499`          | `10`         | `Aborted`            |                                                                                                                                                                                                              |
| `400`          | `11`         | `OutOfRange`         | リクエストのパラメーターが正しくない。                                                                                                                                                                       |
| `501`          | `12`         | `Unimplemented`      |                                                                                                                                                                                                              |
| `500`          | `13`         | `Internal`           | gRPCサーバーがエラーを返却した。                                                                                                                                                                             |
| `503`          | `14`         | `Unavailable`        | gRPCサーバー側で関数を実行する準備ができておらず、gRPCクライアント側で関数のコールに失敗している。gRPCクライアントからgRPCサーバーへのリクエスト送信は完了したが、レスポンスが返信されていない可能性がある。 |
| `500`          | `15`         | `DataLoss`           |                                                                                                                                                                                                              |
| `401`          | `16`         | `Unauthenticated`    |                                                                                                                                                                                                              |

> - https://grpc.io/docs/guides/status-codes/
> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/errorcode#http%E3%81%AE%E3%83%AC%E3%82%B9%E3%83%9D%E3%83%B3%E3%82%B9%E3%82%B9%E3%83%86%E3%83%BC%E3%82%BF%E3%82%B9%E3%82%B3%E3%83%BC%E3%83%89%E3%81%A8%E3%81%AE%E9%81%95%E3%81%84
> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/errorcode#http%E3%81%AE%E3%83%AC%E3%82%B9%E3%83%9D%E3%83%B3%E3%82%B9%E3%82%B9%E3%83%86%E3%83%BC%E3%82%BF%E3%82%B9%E3%82%B3%E3%83%BC%E3%83%89%E3%81%A8%E3%81%AE%E9%81%95%E3%81%84

#### ▼ リトライすべきステータスコード

以下のステータスコードは、一時的な問題で発生している可能性がある。

そのため、リトライすると問題が解決する可能性がある。

- `DeadlineExceeded` (`4`)
- `ResourceExhausted` (`8`)
- `DeadlineExceeded` (`4`)

なお、`Canceled`はgRPCクライアントがこれ以上のリクエストを必要としていない可能性があり、不要である。

<br>

### タイムアウト

#### ▼ HTTP/1.1の場合

TCP接続をリクエスト−レスポンスにタイムアウト時間を適用する。

#### ▼ 単項RPCの場合

TCP接続上に単一のストリーミングしかない。

そのため、ストリーミングを通過するリクエスト−レスポンスにタイムアウト時間を適用する。

gRPCは、TCP接続の確立前にタイムアウト時間を開始し、ストリーミング時に残りのタイムアウト時間を`grpc-timeout`ヘッダーに設定する。

> - https://github.com/envoyproxy/envoy/issues/12578#issue-676405512

#### ▼ ストリーミングRPCの場合

TCP接続上に複数のストリーミングがある。

そのため、ストリーミングを通過するリクエスト−レスポンスごとに同じタイムアウト時間を別々に適用する。

gRPCは、TCP接続の確立前にタイムアウト時間を開始し、ストリーミング時に残りのタイムアウト時間を`grpc-timeout`ヘッダーに設定する。

> - https://github.com/envoyproxy/envoy/issues/12578#issue-676405512

<br>

## 04. ディレクトリ構成規約

### 前提

ここでは、マイクロサービスが以下のような順で実行されるとする。

```yaml
foo # JavaScript製
⬇⬆️︎
⬇⬆️︎
bar # Go製
⬇⬆️︎
⬇⬆️︎
baz # Python製
```

<br>

### `proto`ファイルをgRPCサーバー側に配置する場合

#### ▼ gRPCクライアント/サーバーのリポジトリ

各マイクロサービスのリポジトリでは、アプリケーションのインフラ層に`proto`ファイルを配置する。

```yaml
# fooサービス (JavaScript製)
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
│   │   ├── pb_go/ # .protoファイルから自動作成したpb.*ファイル
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
│   │   ├── pb_go/ # .protoファイルから自動作成したpb.*ファイル
│   │   │   ├── bar/
│   │   │   │   └── bar-server.pb.go
│   │   │   │
│   │   │   └── baz/
│   │   │       └── baz-client.pb.go
│   │   │
│   │   └── grpc # gRPCクライアントとgRPCサーバーの定義
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
│   │   ├── pb_go/ # .protoファイルから自動作成したpb.*ファイル
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

### `proto`ファイルと`pb_go`ファイルを専用リポジトリに配置する場合

#### ▼ gRPCクライアント/サーバーのリポジトリ

各マイクロサービスのリポジトリでは、アプリケーションのインフラ層にgRPCクライアントとgRPCサーバーの定義を配置する。

なお、`pb`ファイルはProtocol Bufferの共有リポジトリで管理する。

```yaml
# fooサービス (JavaScript製)
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

#### ▼ Protocol Bufferの共有リポジトリ

`pb`ファイルに関しては、gRPCサーバーは、さらに宛先マイクロサービスをコールするgRPCクライアントにもなる。

そのため、Protocol Bufferの共有リポジトリでは、各マイクロサービスの`proto`ファイル、RPC-API仕様書、`pb`ファイル、を管理する。

`pb`ファイルには以下があり、これは共有リポジトリではなく、gRPCクライアント/サーバーのリポジトリで管理してもよい。

- gRPCサーバーとしての`proto`ファイルから作った`pb`ファイル
- gRPCクライアントとしての`proto`ファイル (これは宛先gRPCサーバーのリポジトリにある) から作った`pb`ファイル

```yaml
# Protocol Buffer
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
