---
title: 【IT技術の知見】X-Ray＠AWS
description: X-Ray＠AWSの知見を記録しています。
---

# X-Ray＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. X-Rayとは

### 仕組み

分散トレースの監視バックエンドとして機能する。

X-Rayデーモンまたはopentelemetryコレクターにスパンを送信し、X-Rayで分散トレースを監視できるようになる。

サービスメッシュツール (例：AppMesh、Istio) によって、X-Rayデーモンまたはopentelemetryコレクターのいずれに送信すれば良いのかが異なる。

<br>

## 02. セットアップ

### コンソール画面の場合

#### ▼ サンプリング

| 項目                | 説明                                                                             |
| ------------------- | -------------------------------------------------------------------------------- |
| Limits              |                                                                                  |
| Matching Criteria   | X-Rayで受信するリクエストの条件 (例：宛先サービス、宛先パス、HTTPメソッド、など) |
| Matching attributes |                                                                                  |

> - https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html

<br>

### セグメント

#### ▼ セグメントとは

```yaml
{
  "name": "example.com",
  "id": "70de5b6f19ff9a0a",
  "start_time": 1.478293361271E9,
  "trace_id": "1-581cf771-a006649127e371903a2de979",
  "end_time": 1.478293361449E9,
}
```

<br>

### サブセグメント

#### ▼ サブセグメントとは

記入中...

> - https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html#api-segmentdocuments-subsegments

#### ▼ HTTPリクエストデータ

スパンのHTTPリクエストの情報を持つ。

```yaml
{
  "id": "004f72be19cddc2a",
  "start_time": 1484786387.131,
  "end_time": 1484786387.501,
  "name": "names.example.com",
  "namespace": "remote",
  # HTTPリクエストデータ
  "http":
    {
      "request": {"method": "GET", "url": "https://names.example.com/"},
      "response": {"content_length": -1, "status": 200},
    },
}
```

> - https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html#api-segmentdocuments-http

#### ▼ AWSリソースデータ

スパンの作成元のAWSリソース情報を持つ。

```yaml
"aws":{
   "elastic_beanstalk":{
      "version_label":"app-5a56-170119_190650-stage-170119_190650",
      "deployment_id":32,
      "environment_name":"scorekeep"
   },
   "ec2":{
      "availability_zone":"us-west-2c",
      "instance_id":"i-075ad396f12bc325a",
      "ami_id":
   },
   "cloudwatch_logs":[
      {
         "log_group":"my-cw-log-group",
         "arn":"arn:aws:logs:us-west-2:012345678912:log-group:my-cw-log-group"
      }
   ],
   # X-Rayのクライアントパッケージ情報
   "xray":{
      "auto_instrumentation":false,
      "sdk":"X-Ray for Java",
      "sdk_version":"2.8.0"
   }
}
```

<br>

## 03. Lambdaの場合

#### ▼ 初期化

ここでは、フレームワークなしでGoアプリケーションを作成しているとする。

X-Rayのパッケージを初期化する。

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

子スパンを作成する。

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
