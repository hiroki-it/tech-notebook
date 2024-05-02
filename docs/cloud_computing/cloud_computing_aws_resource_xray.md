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

計装したアプリからX-Rayデーモン (EC2、ECS) またはOpenTelemetry Collector (EKS) にスパンを送信し、X-Rayで分散トレースを監視できるようになる。

サービスメッシュツール (例：AppMesh、Istio) によって、X-RayデーモンまたはOpenTelemetry Collectorのいずれに送信すれば良いのかが異なる。

<br>

### 計装パッケージ

- X-Ray SDK (X-Rayデーモンに送る場合)
- OpenTelemetryクライアント (OpenTelemetry Collectorに送る場合)

<br>

### X-Rayデーモン

EC2であればデーモンプロセスとして、ECSであればサイドカーとして稼働させる。

> - https://dev.classmethod.jp/articles/re-introduction-2022-x-ray/

<br>

### OpenTelemetry Collector

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

### Terraformの場合

```terraform
resource "aws_xray_group" "environment" {

  group_name        = "foo-prd"

  filter_expression = <<EOF
(annotation.otel_resource_system_name = "foo") AND (annotation.otel_resource_environment = "prd")
EOF

  insights_configuration {
    insights_enabled = true
  }
}
```

<br>

## 03. トラブルシューティング

### フィルター式

#### ▼ デフォルト

**＊実行例＊**

```bash
http.url = "http://example.com/foo"
```

#### ▼ 時間

レスポンス時間でトレースIDをフィルタリングする。

**＊実行例＊**

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

HTTPヘッダー値でトレースIDをフィルタリングする。

**＊実行例＊**

```bash
http.status != 200
```

```bash
http.useragent = "ELB-HealthChecker/2.0"
```

> - https://pages.awscloud.com/rs/112-TZM-766/images/AWS-Black-Belt_2023_AWS-X-Ray_0228_v1.pdf#page=29

#### ▼ AWSリソース

AWSリソース名でトレースIDをフィルタリングする。

**＊実行例＊**

```bash
service("<AWSリソース名>")
```

タイプを指定することで、異なるタイプの同名のAWSリソースを区別できる。

**＊実行例＊**

```bash
service(id(name: "<AWSリソース名>", type: "AWS::EC2::Instance"))
```

> - https://pages.awscloud.com/rs/112-TZM-766/images/AWS-Black-Belt_2023_AWS-X-Ray_0228_v1.pdf#page=29

#### ▼ 送信元/宛先のAWSリソース

送信元と宛先のAWSリソース名でトレースIDをフィルタリングする。

**＊実行例＊**

```bash
edge("<送信元AWSリソース名>", "<宛先AWSリソース名>")
```

> - https://pages.awscloud.com/rs/112-TZM-766/images/AWS-Black-Belt_2023_AWS-X-Ray_0228_v1.pdf#page=29

#### ▼ アノテーション

ユーザー定義のラベルでトレースIDをフィルタリングする。

**＊実行例＊**

アノテーション値でトレースIDをフィルタリングする。

```bash
annotation.otel_resource_component = "<コンポーネント名>"
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

### テレメトリー間の連携

#### ▼ CloudWatchログとの連携

あらかじめ、分散トレースに紐づくログがあるロググループ名を設定し、またログにはX-Ray仕様のトレースIDを出力しておく必要がある。

> - https://zenn.dev/k6s4i53rx/articles/69ef65b84dd799#%E8%A8%AD%E5%AE%9A%E6%96%B9%E6%B3%95

X-Rayの画面では、分散トレースのトレースIDに応じて、以下のようなログクエリをロググループに自動発行する。

これにより、分散トレースとログを紐づけられる。

```sql
fields @log, @timestamp, @message
| filter @message like "<ログに付与したX-RayトレースID>"
| sort @timestamp, @message desc
```

> - https://zenn.dev/k6s4i53rx/articles/69ef65b84dd799#%E7%B5%90%E6%9E%9C

<br>

## 04. スパン

### セグメント

#### ▼ セグメントとは

スパンに相当する。

マイクロサービスの処理情報を持つ。

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

<br>

### ID系

#### ▼ `id`

セグメントIDを持つ。

W3C Trace Context仕様のルートスパンのIDに相当する。

#### ▼ `trace_id`キー

セグメントとサブセグメントを紐づける。

`<バージョン>-<ルートセグメントのタイプスタンプ>-<サブセグメントごとのユニークID>`からなる。

例えば、`1-58406520-a006649127e371903a2de979`になる。

> - https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html

#### ▼ `parent_id`キー

親のサブセグメントIDを持つ。

W3C Trace Context仕様のスパンのIDに相当する。

<br>

### サブセグメント系

#### ▼ `subsegments`キー

サグセグメントの情報を持つ。

例えば、サブセグメントIDであれば`<サブセグメントごとのユニークID>`になる。

```yaml
{
  "subsegments":
    [
      {
        "id": "53995c3f42cd8ad8",
        "name": "api.example.com",
        "start_time": 1461096053.37769,
        "end_time": 1461096053.40379,
        "namespace": "remote",
        "http":
          {
            "request":
              {
                "url": "https://api.example.com/health",
                "method": "POST",
                "traced": true,
              },
            "response": {"status": 200, "content_length": 861},
          },
      },
    ],
}
```

> - https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html#api-segmentdocuments-subsegments

<br>

### リクエスト系

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

<br>

### AWSリソース系

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

### エラー系

```yaml
{
  # 400系ステータスの場合
  "error": false,
  # 500系ステータスの場合,
  "fault": true,
  # 429ステータスの場合
  "throttle": false,
}
```

> - https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html#api-segmentdocuments-errors

<br>

### SQL

マイクロサービスが実行したSQLの情報を持つ。

```yaml
{
  "sql":
    {
      "url": "jdbc:postgresql://aawijb5u25wdoy.cpamxznpdoq8.us-west-2.rds.amazonaws.com:5432/ebdb",
      "preparation": "statement",
      "database_type": "PostgreSQL",
      "database_version": "9.5.4",
      "driver_version": "PostgreSQL 9.4.1211.jre7",
      "user": "dbuser",
      "sanitized_query": "SELECT  *  FROM  customers  WHERE  customer_id=?;",
    },
}
```

> - https://docs.aws.amazon.com/ja_jp/xray/latest/devguide/xray-api-segmentdocuments.html#api-segmentdocuments-sql

<br>

## 05. OpenTelemetryとX-Rayの対応関係

### OpenTelemetryとX-Ray

#### ▼ 一覧

| OpenTelemetry                                                                         | X-Ray                          | 値の例 |
| ------------------------------------------------------------------------------------- | ------------------------------ | ------ |
| Attributes                                                                            | `annotations/metadata`         |        |
| SpanId                                                                                | `id`                           |        |
| TraceId                                                                               | `trace_id`                     |        |
| StartTime                                                                             | `start_time`                   |        |
| EndTime                                                                               | `end_time`                     |        |
| ParentSpanId                                                                          | `parent_id`                    |        |
| Status.StatusCode                                                                     | `fault`、`error`、`throttle`   |        |
| Event                                                                                 | `exception`                    |        |
| Link                                                                                  | 執筆時点 (2024/04/14) で非対応 |        |
| `enduser.id`                                                                          | `user`                         |        |
| `cloud.provider`、`cloud.platform`                                                    | `origin`                       |        |
| `rpc.system`、`aws.service`                                                           | `namespace`                    |        |
| `peer.service`、`aws.service`、`db.service`、`service.name`、`span.kind`、`span name` | `name`                         |        |
| `pdata.SpanKindServer`                                                                | `type`                         |        |

<br>

### HTTPリクエストのスパン属性

#### ▼ 一覧

| OpenTelemetry                                                                                                                                                              | X-Ray                          | 値の例 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------ |
| `http.method`                                                                                                                                                              | `http.request.method`          |        |
| `http.client_ip`                                                                                                                                                           | `http.request.client_ip`       |        |
| `http.client_ip`                                                                                                                                                           | `http.request.x_forwarded_for` |        |
| `http.user_agent`                                                                                                                                                          | `http.request.user_agent`      |        |
| `http.status_code`                                                                                                                                                         | `http.response.status`         | `200`  |
| `http.url`、`http.scheme`、`http.host`、`http.target`、`http.server_name`、`net.host.port`、` host.name`、`net.host.name`、`net.peer.name`、`net.peer.port`、`net.peer.ip` | `http.request.url`             |        |
| `message.type`                                                                                                                                                             | `http.response.content_length` |        |

<br>

### クエリのスパン属性

#### ▼ 一覧

| OpenTelemetry                     | X-Ray                 | 値の例                           |
| --------------------------------- | --------------------- | -------------------------------- |
| `db.connection_string`、`db.name` | `sql.url`             |                                  |
| `db.system`                       | `sql.database_type`   | `mysql`                          |
| `db.user`                         | `sql.user`            |                                  |
| `db.statement`                    | `sql.sanatized_query` | `SELECT foo_name FROM foo_table` |

<br>

### AWSのスパン属性

#### ▼ 一覧

| OpenTelemetry                 | X-Ray            | 値の例           |
| ----------------------------- | ---------------- | ---------------- |
| `cloud.account.id`            | `aws.account_id` | `123456789`      |
| `aws.operation`、`rpc.method` | `aws.operation`  |                  |
| `aws.region`                  | `aws.region`     | `ap-northeast-1` |
| `aws.requestId`               | `aws.request_id` |                  |
| `aws.queue.url`               | `aws.queue_url`  |                  |
| `aws.table.name`              | `aws.table_name` |                  |

<br>

### SDKのスパンメタデータ

#### ▼ 一覧

| OpenTelemetry            | X-Ray                       | 値の例 |
| ------------------------ | --------------------------- | ------ |
| `telemetry.sdk.name`     | `xray.sdk`                  |        |
| `telemetry.sdk.version`  | `xray.sdk_version`          |        |
| `telemetry.auto.version` | `xray.auto_instrumentation` |        |

<br>

### AWSリソースのスパンメタデータ

#### ▼ 一覧

| OpenTelemetry         | X-Ray                       | 値の例          |
| --------------------- | --------------------------- | --------------- |
| `k8s.cluster.name`    | `eks.cluster_name`          | `foo-cluster`   |
| `k8s.pod.name`        | `eks.pod`                   | `foo-pod`       |
| `k8s.pod.uid`         | `eks.container_id`          | `foo-container` |
| `aws.log.group.arns`  | `cloudwatch_logs.arn`       |                 |
| `aws.log.group.names` | `cloudwatch_logs.log_group` |                 |

#### ▼ 設定例

ここでは、`aws.log.group.arns`属性を設定すると仮定する。

```go
package trace

import (
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
	"go.opentelemetry.io/otel/trace"
)

func newTracerProvider(exporter sdktrace.SpanExporter) *sdktrace.TracerProvider {

	resourceWithAttirbutes, err := resource.Merge(
		resource.Default(),
		resource.NewWithAttributes(
			semconv.SchemaURL,
			// aws.log.group.arns属性を設定する
    		semconv.AWSLogGroupNamesKey.String("ロググループ名"),
		),
	)

	if err != nil {
		panic(err)
	}

	return sdktrace.New(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(resourceWithAttirbutes),
	)
}
```

> - https://github.com/open-telemetry/opentelemetry-go/blob/v1.25.0/semconv/v1.24.0/resource.go#L1866-L1871

<br>

## 06. Lambdaの場合

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
