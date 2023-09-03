---
title: 【IT技術の知見】X-Ray＠AWS
description: X-Ray＠AWSの知見を記録しています。
---

# X-Ray＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. X-rayとは

分散トレースの監視バックエンドとして機能する。

X-rayデーモンまたはotelコレクターにスパンを送信し、X-rayで分散トレースを監視できるようになる。

サービスメッシュツール (例：AppMesh、Istio) によって、X-rayデーモンまたはotelコレクターのいずれに送信すれば良いのかが異なる。

<br>

## 02. Lambdaの場合

#### ▼ 初期化

ここでは、フレームワークなしでGoアプリケーションを作成しているとする。

X-rayのパッケージを初期化する。

```go
package main

import (
    "github.com/aws/aws-xray-sdk-go/xray"
)

func init() {
    xray.Configure(xray.Config{
        LogLevel:       "info",
        ServiceVersion: "1.2.3",
    })
}
```

> - https://qiita.com/smith-30/items/225e27e6d9a110bce725

#### ▼ 親スパンの作成

親スパンを作成する。

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

```go
package main

import (
    "context"
    "fmt"
    "io/ioutil"

    "github.com/aws/aws-xray-sdk-go/xray"
    "golang.org/x/net/context/ctxhttp"
)

var (
    appName  = ""
    version  = ""
    revision = ""
)

type MyEvent struct {
    Name string `json:"name"`
}

func HandleRequest(ctx context.Context, evt MyEvent) (string, error) {
    // Start a segment
    ctx, seg := xray.BeginSegment(context.Background(), "api-request")
    _, err := getExample(ctx)
    if err != nil {
        fmt.Println(err)
        return "", err
    }
    // Close the segment
    seg.Close(nil)
    return fmt.Sprintf("%s-%s-%s, Hello %s!", appName, version, revision, evt.Name), nil
}

func getExample(ctx context.Context) ([]byte, error) {
    resp, err := ctxhttp.Get(ctx, xray.Client(nil), "https://aws.amazon.com/")
    if err != nil {
        return nil, err
    }
    return ioutil.ReadAll(resp.Body)
}
```

> - https://qiita.com/smith-30/items/225e27e6d9a110bce725

#### ▼ 子スパンの作成

子スパンを作成し、下流マイクロサービスに子スパンのコンテキストを伝播する。

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

```go
package main

import (
    "context"
    "fmt"
    "io/ioutil"

    "github.com/aws/aws-xray-sdk-go/xray"
    "golang.org/x/net/context/ctxhttp"
)

var (
    appName  = ""
    version  = ""
    revision = ""
)

type MyEvent struct {
    Name string `json:"name"`
}

func HandleRequest(ctx context.Context, evt MyEvent) (string, error) {
    // Start a segment
    ctx, seg := xray.BeginSegment(context.Background(), "api-request")
    _, err := getExample(ctx)
    if err != nil {
        fmt.Println(err)
        return "", err
    }
    // Close the segment
    seg.Close(nil)
    return fmt.Sprintf("%s-%s-%s, Hello %s!", appName, version, revision, evt.Name), nil
}

func getExample(ctx context.Context) ([]byte, error) {
    resp, err := ctxhttp.Get(ctx, xray.Client(nil), "https://aws.amazon.com/")
    if err != nil {
        return nil, err
    }
    return ioutil.ReadAll(resp.Body)
}
```

> - https://qiita.com/smith-30/items/225e27e6d9a110bce725

#### ▼ アプリケーションの実行

```go
package main

import (
    "github.com/aws/aws-lambda-go/lambda"
)

func main() {
    lambda.Start(HandleRequest)
}
```

> - https://qiita.com/smith-30/items/225e27e6d9a110bce725

<br>
