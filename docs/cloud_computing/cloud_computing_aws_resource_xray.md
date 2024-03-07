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

計装したアプリからX-Rayデーモン (EC2、ECS) またはOpenTelemetryコレクター (EKS) にスパンを送信し、X-Rayで分散トレースを監視できるようになる。

サービスメッシュツール (例：AppMesh、Istio) によって、X-RayデーモンまたはOpenTelemetryコレクターのいずれに送信すれば良いのかが異なる。

<br>

### 計装パッケージ

- X-Ray SDK (X-Rayデーモンに送る場合)
- OpenTelemetryクライアント (OpenTelemetryコレクターに送る場合)

<br>

### X-Rayデーモン

EC2であればデーモンプロセスとして、ECSであればサイドカーとして稼働させる。

> - https://dev.classmethod.jp/articles/re-introduction-2022-x-ray/

<br>

### OpenTelemetryコレクター

EKSでDamonSetとして稼働させる。

執筆時点 (2024/02/28) ではサイドカーには対応していない。

<br>

## 02. セットアップ

### コンソール画面の場合

#### ▼ サンプリング

| 項目                | 説明                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------- |
| Limits              | スパンの収集に関する上限値を設定する。                                                |
| Matching Criteria   | スパンのキーに基づくフィルタリングの一致条件を設定する。                              |
| Matching attributes | AWS以外の文脈で付与されたラベル (例：OpenTelemetryのAttribute) の一致条件を設定する。 |

> - https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html

#### ▼ 暗号化

| 項目         | 説明                                                                              |
| ------------ | --------------------------------------------------------------------------------- |
| 暗号化タイプ | 分散トレースの暗号化キー (例：AWSマネージドキー、セルフマネージドキー) を選べる。 |

#### ▼ グループ

| 項目         | 説明                                               |
| ------------ | -------------------------------------------------- |
| フィルター式 | スパンのグルーピング条件を設定する。               |
| インサイト   | インサイトメトリクスを連携するかどうかを設定する。 |
| タグ         | AWSリソースタグを設定する。                        |

<br>

### セグメント

#### ▼ セグメントとは

スパンの情報を持つ。

```yaml
{
  # スパンのトレースID
  "trace_id": "1-581cf771-a006649127e371903a2de979",
  # スパンのスパンID
  "id": "70de5b6f19ff9a0a",
  "name": "example.com",
  "start_time": 1.478293361271E9,
  "end_time": 1.478293361449E9,
  "service": {...},
  "user": {...},
  "origin": {...},
  "parent_id": {...},
  "http": {...},
  "aws": {...},
  "error": {...},
  "annotations": {...},
  "metadata": {...},
  "subsegments": {...},
}
```

> - https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html#api-segmentdocuments-fields

#### ▼ セグメントのスキーマ

セグメントの構造やデータ型を定義したもの。

```yaml
{
  # スキーマURL
  "$schema": "http://json-schema.org/draft-04/schema#",
  "description": "Segment document schema",
  # スキーマのバージョン
  "version": "1.0.0",
  # 構造
  "type": "object",
  # データ型
  "properties": {
    "trace_id": {
      "type": "string",
      "minLength": 35,
      "pattern": "\\d+-[A-Fa-f0-9]*-[A-Fa-f0-9]{24}"
    }
    ...
  }
}
```

> - https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html

#### ▼ `subsegments`キー

記入中...

> - https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html#api-segmentdocuments-subsegments

#### ▼ `http`キー

スパンのHTTPリクエストの情報を持つ。

```yaml
{
  "http":
    {
      "request": {"method": "GET", "url": "https://names.example.com/"},
      "response": {"content_length": -1, "status": 200},
    },
}
```

> - https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html#api-segmentdocuments-http

#### ▼ `aws`キー

スパンの作成元のAWSリソース情報を持つ。

```yaml
{
  # AWSリソース情報
  "aws": {
      "elastic_beanstalk":
        {
          "version_label": "app-5a56-170119_190650-stage-170119_190650",
          "deployment_id": 32,
          "environment_name": "scorekeep",
        },
      "ec2":
        {
          "availability_zone": "us-west-2c",
          "instance_id": "i-075ad396f12bc325a",
          "ami_id": "*****",
        },
      "cloudwatch_logs":
        [
          {
            "log_group": "my-cw-log-group",
            "arn": "arn:aws:logs:us-west-2:012345678912:log-group:my-cw-log-group",
          },
        ],
      # X-Rayのクライアントパッケージ情報
      "xray":
        {
          "auto_instrumentation": false,
          "sdk": "X-Ray for Java",
          "sdk_version": "2.8.0",
        },
    },
}
```

<br>

### フィルター式

#### ▼ デフォルト

```bash
http.url = "http://example.com/foo"
```

#### ▼ 時間

レスポンス時間でフィルタリングする。

```bash
# レスポンス時間が5秒以上のスパン
responsetime >= 5
```

```bash
# レスポンス時間が5-10秒以上のスパン
responsetime >= 5 AND responsetime <= 10
```

> - https://docs.aws.amazon.com/xray/latest/devguide/xray-console-filters.html#console-filters-syntax

#### ▼ HTTPヘッダー

HTTPヘッダー値でフィルタリングする。

```bash
http.status != 200
```

```bash
http.useragent = "ELB-HealthChecker/2.0"
```

> - https://pages.awscloud.com/rs/112-TZM-766/images/AWS-Black-Belt_2023_AWS-X-Ray_0228_v1.pdf#page=29

#### ▼ AWSリソース

AWSリソース名でフィルタリングする。

```bash
service("<AWSリソース名>")
```

タイプを指定することで、異なるタイプの同名のAWSリソースを区別できる。

```bash
service(id(name: "<AWSリソース名>", type: "AWS::EC2::Instance"))
```

> - https://pages.awscloud.com/rs/112-TZM-766/images/AWS-Black-Belt_2023_AWS-X-Ray_0228_v1.pdf#page=29

#### ▼ 送信元/宛先のAWSリソース

送信元と宛先のAWSリソース名でフィルタリングする。

```bash
edge("<送信元AWSリソース名>", "<宛先AWSリソース名>")
```

> - https://pages.awscloud.com/rs/112-TZM-766/images/AWS-Black-Belt_2023_AWS-X-Ray_0228_v1.pdf#page=29

#### ▼ アノテーション

ユーザー定義のラベルでフィルタリングする。

```bash
Annotation.component = "<コンポーネント名>"
```

各言語のSDKの関数でラベルを設定できる。

```go
// Goの場合
xray.AddAnnotation("component", value)
```

```python
# Pythonの場合
subsegment.put_annotation("component", value)
```

似たものとしてメタデータがあるが、こちらはフィルタリングに使用できない。

> - https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-annotations
> - https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-python-segment.html#xray-sdk-python-segment-annotations

<br>

## 03. Lambdaの場合

### 初期化

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

<br>

### 親スパンの作成

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

<br>

### 子スパンの作成

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

<br>

### アプリケーションの実行

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
