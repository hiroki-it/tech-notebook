---
title: 【IT技術の知見】gRPC＠RPC-API
description: gRPC＠RPC-APIの知見を記録しています。
---

# gRPC＠RPC-API

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. gRPC の仕組み

### アーキテクチャ

RPC フレームワークの 1 つで、Protocol Buffer を使用して RPC (リモートプロシージャーコール) を実行する。

従来の HTTP/1.1 ではなく、HTTP/2 (例：gRPC、GraphQL など) を使用する。

RESTful-API に対するリクエストではリクエストのヘッダーやボディを作成する必要がある。

一方で、リモートプロシージャーコールであれば通信先の関数を指定して引数を渡せばよく、まるで自身の関数のようにコールできる。

![grpc_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_architecture.png)

> - https://qiita.com/gold-kou/items/a1cc2be6045723e242eb#%E3%82%B7%E3%83%AA%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%BA%E3%81%A7%E9%AB%98%E9%80%9F%E5%8C%96
> - https://openstandia.jp/oss_info/grpc/
> - https://syu-m-5151.hatenablog.com/entry/2022/04/12/130411
> - https://atmarkit.itmedia.co.jp/ait/articles/1501/26/news009.html

<br>

### TLS の有無 (暗号化の有無)

Web ブラウザが gRPC クライアントの場合、TLS は必須である。

ただ、それ以外の場合は gRPC では TLS を無効化できる。

> - https://stackoverflow.com/a/51008941
> - https://stackoverflow.com/questions/34076231/why-do-browser-implementations-of-http-2-require-tls

<br>

## 02. 通信方式

### gRPC の通信方式とは

gRPC では、gRPC クライアントと gRPC サーバーの間の通信方式に種類がある。

通信方式は、`proto` ファイルで定義する。

![grpc_connection-type](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_connection-type.png)

> - https://fintan.jp/page/1521/
> - https://www.oreilly.com/library/view/grpc-up-and/9781492058328/ch04.html

<br>

### Unary RPC (単項 RPC)

#### ▼ 単項 RPC とは

![grpc_unary-rpc](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_unary-rpc.png)

リクエスト／レスポンス方式の通信を実施する。

まず、`1` 個の TCP 接続を確立し、そのなかに `1` 個のストリームを作成する。

次に、gRPC クライアントが `1` 個のリクエストを送信し、これが終えると受信後に `1` 個のレスポンスを返信する。

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

### Server Streaming RPC (サーバーストリーミング RPC)

#### ▼ サーバーストリーミング RPC とは

![grpc_server-streaming](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_server-streaming.png)

ストリーミング方式の通信を実施する。

まず、`1` 個の TCP 接続を確立し、そのなかに単一またはのストリームを作成する。

次に、gRPC クライアントがストリーム上で `1` 個のリクエストを送信し、これが終えるとサーバーは複数個のレスポンスを並行的に返信する。

任意のタイミングで、サーバーからまとめてレスポンスさせたい場合に使用する。

サーバーストリーミング RPC であっても、クライアントがクライアントストリーミング RPC を非同期的に実行すれば、同時ストリーミングになる。

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

### Client Streaming RPC (クライアントストリーミング RPC)

#### ▼ クライアントストリーミング RPC とは

![grpc_client-streaming-rpc](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_client-streaming-rpc.png)

ストリーミング方式の通信を実施する。

まず、`1` 個の TCP 接続を確立し、そのなかに単一のストリームを作成する。

次に、gRPC クライアントがストリーム上で複数個のリクエストを並行的に送信し、これが終えるとサーバーは `1` 個のレスポンスを返信する。

gRPC クライアントからのリクエストの送信データサイズが大きくなる場合 (例：アップロードサービス) に使用する。

クライアントストリーミング RPC であっても、クライアントがクライアントストリーミング RPC を非同期的に実行すれば、同時ストリーミングになる。

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

### Bidirectional Streaming RPC (双方向ストリーミング RPC)

#### ▼ 双方向ストリーミング RPC とは

![grpc_bidrectional-streaming-rpc](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_bidrectional-streaming-rpc.png)

ストリーミング方式の通信を実施する。

まず、`1` 個の TCP 接続を確立し、そのなかに複数のストリームを同時に作成する。

次に、gRPC クライアントがストリーム上で複数個のリクエストを並行的に送信する。

これが終えると、もう一方のストリーム上でサーバーも複数個のレスポンスを並行的に返信する (逆にサーバーからもリクエストを送信できる)。

gRPC クライアントと gRPC サーバーが互いにリクエストを送信する場合 (例：チャット、オンラインゲーム) に使用する。

双方向ストリーミング RPC では、双方向の独立したストリーミングを実行するため、結果的に同時ストリーミングになる。

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

## 03. HTTP/1.1 とgRPC の違い

### パケットの構造

| 項目                                     | HTTP/1.1 の場合               | HTTP/2 の場合              |
| ---------------------------------------- | ----------------------------- | -------------------------- |
| アプリケーションデータの形式             | テキスト (例：JSON、XML など) | バイナリ (例：Protocolbuf) |
| TLS によるアプリケーションデータの暗号化 | 任意                          | 必須 (Web ブラウザのみ)    |
| トランスポートヘッダー                   | あり                          | あり                       |
| IP ヘッダー                              | あり                          | あり                       |

> - https://www.wallarm.com/what/what-is-http-2-and-how-is-it-different-from-http-1

<br>

### リクエストの構造

#### ▼ リクエストメタデータ

gRPC のリクエストでは、メタデータをヘッダーに格納する。

| メタデータのキー名     | 説明                               |
| ---------------------- | ---------------------------------- |
| `accept-encoding`      |                                    |
| `content-type`         |                                    |
| `grpc-accept-encoding` |                                    |
| `grpc-timeout `        | gRPC のタイムアウト時間を表す。    |
| `method`               | リクエストの HTTP メソッドを表す。 |
| `path`                 | リクエストのパスを表す。           |
| `scheme`               |                                    |
| `user-agent`           |                                    |
| ...                    |                                    |

> - https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-HTTP2.md#requests
> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/metadata
> - https://soichisumi.net/2019/04/grpc-custom-error-response/

#### ▼ レスポンスメタデータ

gRPC のレスポンスでは、エラーに関するメタデータをトレーラーに、それ以外のメタデータをヘッダーに格納する。

> - https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-HTTP2.md#responses
> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/metadata
> - https://soichisumi.net/2019/04/grpc-custom-error-response/

<br>

### 通信の多重化

#### ▼ HTTP/1.1 の場合

TCP 接続を確立中、レスポンスの返信があるまで、次のリクエストを送信できない。

つまり、単一のリクエストとレスポンスが単一の TCP 接続を占有し、レスポンスの返信があるまで次のリクエスト送信を待たないといけない (HTTP HoL ブロッキング) 。

> - https://www.honai.me/blog/post/how-http-works-4-http2/#http%2F1.x-%E3%81%AE%E8%AA%B2%E9%A1%8C

#### ▼ gRPC の場合

TCP 接続を確立中、レスポンスの返信がなくても、次のリクエストを並列的に送信できる。

つまり、複数のリクエストとレスポンスが単一の TCP 接続を共有し、レスポンスがなくとも次のリクエストを並行的に送信できる。

> - https://www.honai.me/blog/post/how-http-works-4-http2/#http%2F1.x-%E3%81%AE%E8%AA%B2%E9%A1%8C

<br>

### レスポンスタイム

#### ▼ HTTP/1.1 の場合

HTTP/1.1 の場合、`1` 個のリクエストとレスポンスを送受信する。

> - https://www.thoughtworks.com/insights/blog/microservices/scaling-microservices-gRPC-part-one
> - https://levelup.gitconnected.com/scaling-microservices-with-grpc-and-envoy-72a64fc5bbb6

#### ▼ gRPC の場合

単項 RPC の場合、`1` 個のリクエストとレスポンスを送受信する。

そのため、従来の HTTP/1.1 と同じレスポンスタイムである。

一方でストリーミング RPC の場合、複数個のリクエストとレスポンスを並行的に送受信する (多重化)。

そのため、重複しない通信時間が合計のレスポンスタイムになる。

このとき、リクエストとレスポンスの多重化により、帯域幅を無駄なく使用できるため、レスポンスタイムが短くなる。

![grpc_streaming-rpc_response-time](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/grpc_streaming-rpc_response-time.png)

> - https://www.thoughtworks.com/insights/blog/microservices/scaling-microservices-gRPC-part-one
> - https://levelup.gitconnected.com/scaling-microservices-with-grpc-and-envoy-72a64fc5bbb6
> - https://zenn.dev/zawawahoge/articles/8690c7bd521099#http%2F2%E3%81%AE%E5%BC%B7%E3%81%BF%EF%BC%9A%E5%A4%9A%E9%87%8D%E5%8C%96

<br>

### ステータスコード

#### ▼ 一覧

| HTTP/1.1 の場合 | HTTP/2 の場合 | 意味                 | 説明                                                                                                                                                                                                              |
| --------------- | ------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `200`           | `0`           | `OK`                 | リクエストに成功した。                                                                                                                                                                                            |
| `499`           | `1`           | `Canceled`           | gRPC クライアントが処理を中断した。                                                                                                                                                                               |
| `500`           | `2`           | `Unknown`            | いずれのステータスコードにも属していない不明なエラーである。                                                                                                                                                      |
| `400`           | `3`           | `InvalidArgument`    | 無効な引数を指定したリクエストである。                                                                                                                                                                            |
| `504`           | `4`           | `DeadlineExceeded`   | 処理が完了する前にタイムアウト時間を超過した。正常な場合でも、タイムアウト時間の超過でこのエラーになることがある。                                                                                                |
| `404`           | `5`           | `NotFound`           | リクエストしたデータが存在しない。                                                                                                                                                                                |
| `409`           | `6`           | `AlreadyExists`      |                                                                                                                                                                                                                   |
| `403`           | `7`           | `PermissionDenied`   |                                                                                                                                                                                                                   |
| `429`           | `8`           | `ResourceExhausted`  | gRPC クライアントがリクエスト送信しすぎている。                                                                                                                                                                   |
| `400`           | `9`           | `FailedPrecondition` |                                                                                                                                                                                                                   |
| `499`           | `10`          | `Aborted`            |                                                                                                                                                                                                                   |
| `400`           | `11`          | `OutOfRange`         | リクエストのパラメーターが正しくない。                                                                                                                                                                            |
| `501`           | `12`          | `Unimplemented`      |                                                                                                                                                                                                                   |
| `500`           | `13`          | `Internal`           | gRPC サーバーがエラーを返却した。                                                                                                                                                                                 |
| `503`           | `14`          | `Unavailable`        | gRPC サーバー側で関数を実行する準備ができておらず、gRPC クライアント側で関数のコールに失敗している。gRPC クライアントから gRPC サーバーへのリクエスト送信は完了したが、レスポンスが返信されていない可能性がある。 |
| `500`           | `15`          | `DataLoss`           |                                                                                                                                                                                                                   |
| `401`           | `16`          | `Unauthenticated`    |                                                                                                                                                                                                                   |

> - https://grpc.io/docs/guides/status-codes/
> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/errorcode#http%E3%81%AE%E3%83%AC%E3%82%B9%E3%83%9D%E3%83%B3%E3%82%B9%E3%82%B9%E3%83%86%E3%83%BC%E3%82%BF%E3%82%B9%E3%82%B3%E3%83%BC%E3%83%89%E3%81%A8%E3%81%AE%E9%81%95%E3%81%84
> - https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/errorcode#http%E3%81%AE%E3%83%AC%E3%82%B9%E3%83%9D%E3%83%B3%E3%82%B9%E3%82%B9%E3%83%86%E3%83%BC%E3%82%BF%E3%82%B9%E3%82%B3%E3%83%BC%E3%83%89%E3%81%A8%E3%81%AE%E9%81%95%E3%81%84

#### ▼ リトライすべきステータスコード

以下のステータスコードは、一時的な問題で発生している可能性がある。

そのため、リトライすると問題を解決できる可能性がある。

- `DeadlineExceeded` (`4`)
- `ResourceExhausted` (`8`)
- `DeadlineExceeded` (`4`)

なお、`Canceled` は gRPC クライアントがこれ以上のリクエストを必要としていない可能性があり、不要である。

<br>

### タイムアウト

#### ▼ HTTP/1.1 の場合

TCP 接続をリクエスト／レスポンスにタイムアウト時間を適用する。

#### ▼ 単項 RPC の場合

TCP 接続上に単一のストリーミングしかない。

そのため、そのストリーミングを通過するリクエスト／レスポンスにタイムアウト時間を適用する。

gRPC は、TCP 接続の確立前にタイムアウト時間を開始し、ストリーミング時に残りのタイムアウト時間を `grpc-timeout` ヘッダーに設定する。

> - https://github.com/envoyproxy/envoy/issues/12578#issue-676405512

#### ▼ ストリーミング RPC の場合

TCP 接続上に複数のストリーミングがある。

そのため、各ストリーミングを通過するリクエスト／レスポンスごとに同じタイムアウト時間を別々に適用する。

gRPC は、TCP 接続の確立前にタイムアウト時間を開始し、ストリーミング時に残りのタイムアウト時間を `grpc-timeout` ヘッダーに設定する。

> - https://github.com/envoyproxy/envoy/issues/12578#issue-676405512

<br>

## 04. ディレクトリ構成規約

### 前提

ここでは、マイクロサービスが以下のような順で実行されるとする。

```yaml
foo # JavaScript 製
⬇⬆️︎
⬇⬆️︎
bar # Go 製
⬇⬆️︎
⬇⬆️︎
baz # Python 製
```

<br>

### `proto` ファイルを gRPC サーバー側に配置する場合

#### ▼ gRPC クライアント/サーバーのリポジトリ

各マイクロサービスのリポジトリでは、アプリケーションのインフラストラクチャ層に `proto` ファイルを配置する。

```yaml
# foo サービス (JavaScript 製)
repository/
├── src/
│   ├── interface/
│   ├── usecase/
│   ├── domain/
│   ├── infrastructure
│   │   ├── doc/ # .proto ファイルから自動作成した RPC-API 仕様書
│   │   │   └── bar/
│   │   │       └── bar-client.html
│   │   │
│   │   ├── pb_go/ # .proto ファイルから自動作成した pb.*ファイル
│   │   │   └── bar/
│   │   │       └── bar-client.pb.js
│   │   │
│   │   └── grpc # gRPC クライアントの定義
│   │       └── bar/
│   │           └── bar-client.js
│   ...
│
├── proto/ # サービス定義ファイル (.proto ファイル)
│   └── bar/
│       └── bar-client.proto
│
...
```

```yaml
# bar サービス (Go 製)
repository/
├── src/
│   ├── interface/
│   ├── usecase/
│   ├── domain/
│   ├── infrastructure
│   │   ├── doc/ # .proto ファイルから自動作成した RPC-API 仕様書
│   │   │   ├── bar/
│   │   │   │   └── bar-server.html
│   │   │   │
│   │   │   └── baz/
│   │   │       └── baz-client.html
│   │   │
│   │   ├── pb_go/ # .proto ファイルから自動作成した pb.*ファイル
│   │   │   ├── bar/
│   │   │   │   └── bar-server.pb.go
│   │   │   │
│   │   │   └── baz/
│   │   │       └── baz-client.pb.go
│   │   │
│   │   └── grpc # gRPC クライアントと gRPC サーバーの定義
│   │       ├── bar/
│   │       │   └── bar-server.go
│   │       │
│   │       └── baz/
│   │           └── baz-client.go
│   │
│   ...
│
├── proto/ # サービス定義ファイル (.proto ファイル)
│   ├── bar/
│   │   └── bar-server.proto
│   │
│   └── baz/
│       └── baz-client.proto
│
...
```

```yaml
# baz サービス (Python 製)
repository/
├── src/
│   ├── interface/
│   ├── usecase/
│   ├── domain/
│   ├── infrastructure
│   ├── infrastructure
│   │   ├── doc/ # .proto ファイルから自動作成した RPC-API 仕様書
│   │   │   └── baz/
│   │   │       └── baz-server.html
│   │   │
│   │   ├── pb_go/ # .proto ファイルから自動作成した pb.*ファイル
│   │   │   └── baz/
│   │   │       └── baz-server.pb.py
│   │   │
│   │   └── grpc # gRPC サーバーの定義
│   │       └── baz/
│   │           └── baz-server.py
│   │
│   ...
│
├── proto/ # サービス定義ファイル (.proto ファイル)
│   └── baz/
│       └── baz-server.proto
│
...
```

> - https://lab.mo-t.com/blog/protocol-buffers
> - https://medium.com/namely-labs/how-we-build-grpc-services-at-namely-52a3ae9e7c35

<br>

### `proto` ファイルと `pb_go` ファイルを専用リポジトリに配置する場合

#### ▼ gRPC クライアント/サーバーのリポジトリ

各マイクロサービスのリポジトリでは、アプリケーションのインフラストラクチャ層に gRPC クライアントと gRPC サーバーの定義を配置する。

なお、`pb` ファイルは Protocol Buffer の共有リポジトリで管理する。

```yaml
# foo サービス (JavaScript 製)
repository/
├── src/
│   ├── interface/
│   ├── usecase/
│   ├── domain/
│   ├── infrastructure
│   │   └── grpc # gRPC クライアントの定義
│   │       └── bar/
│   │           └── bar-client.js
│   │
```

```yaml
# bar サービス (Go 製)
repository/
├── src/
│   ├── interface/
│   ├── usecase/
│   ├── domain/
│   ├── infrastructure
│   │   └── grpc # gRPC サーバーとクライアントの定義
│   │       ├── bar/
│   │       │   └── bar-server.go
│   │       │
│   │       └── baz/
│   │           └── baz-client.go
│   │
```

```yaml
# baz サービス (Python 製)
repository/
├── src/
│   ├── interface/
│   ├── usecase/
│   ├── domain/
│   ├── infrastructure
│   │   └── grpc # gRPC サーバーの定義
│   │       └── baz/
│   │           └── baz-server.py
│   │
```

> - https://lab.mo-t.com/blog/protocol-buffers
> - https://medium.com/namely-labs/how-we-build-grpc-services-at-namely-52a3ae9e7c35

#### ▼ Protocol Buffer の共有リポジトリ

`pb` ファイルに関しては、gRPC サーバーは、さらに宛先マイクロサービスをコールする gRPC クライアントにもなる。

そのため、Protocol Buffer の共有リポジトリでは、各マイクロサービスの `proto` ファイル、RPC-API 仕様書、`pb` ファイルを管理する。

`pb` ファイルには以下があり、これは共有リポジトリではなく、gRPC クライアント/サーバーのリポジトリで管理してもよい。

- gRPC サーバーとしての `proto` ファイルから作った `pb` ファイル
- gRPC クライアントとしての `proto` ファイル (これは宛先 gRPC サーバーのリポジトリにある) から作った `pb` ファイル

```yaml
# Protocol Buffer
repository/
├── proto/ # サービス定義ファイル (.proto ファイル)
│   ├── bar/
│   │   ├── bar-server.proto
│   │   └── bar-client.proto
│   │
│   └── baz/
│       └── baz-server.proto
│
├── doc/ # .proto ファイルから自動作成した RPC-API 仕様書
│   ├── bar/
│   │   ├── bar-server.html
│   │   └── bar-client.html
│   │
│   └── baz/
│       └── baz-server.html
│
│
└── pb_go/ # .proto ファイルから自動作成した.pb.*ファイル
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
