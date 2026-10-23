---
title: 【IT技術の知見】X-Ray＠AWS
description: X-Ray＠AWSの知見を記録しています。
---

# X-Ray＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. X-Ray とは

### 仕組み

分散トレースの監視バックエンドかつ監視フロントエンドとして機能する。

計装したアプリから X-Ray デーモン (EC2、Amazon ECS) または OpenTelemetry Collector (Amazon EKS) にスパンを送信し、X-Ray で分散トレースを監視できるようになる。

サービスメッシュツール (例：Amazon VPC Lattice、Istio) によって、X-Ray デーモンまたは OpenTelemetry Collector のいずれに送信すればよいのかが異なる。

<br>

### 計装パッケージ

- X-Ray SDK (X-Ray デーモンに送る場合)
- OpenTelemetry クライアント (OpenTelemetry Collector に送る場合)

<br>

### X-Ray デーモン

EC2 であればデーモンプロセスとして、Amazon ECS であればサイドカーとして稼働させる。

> - [AWS再入門ブログリレー2022 X-Ray編 \| DevelopersIO](https://dev.classmethod.jp/articles/re-introduction-2022-x-ray/)

<br>

### OpenTelemetry Collector

Amazon EKS で DamonSet として稼働させる。

執筆時点 (2024/02/28) ではサイドカーはサポートしていない。

<br>

## 02. セットアップ (コンソールの場合)

### サンプリング

<table>
  <thead>
    <tr>
      <th>項目</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Limits</td>
      <td>スパンの収集に関する上限値を設定する。</td>
    </tr>
    <tr>
      <td>Matching criteria</td>
      <td>スパンのキーに基づくフィルタリングの一致条件を設定する。</td>
    </tr>
    <tr>
      <td>Matching attributes</td>
      <td>AWS 以外の文脈で付与されたラベル (例：OpenTelemetry の Attribute) の一致条件を設定する。</td>
    </tr>
  </tbody>
</table>

> - [Configuring sampling rules - AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html)

### 暗号化

<table>
  <thead>
    <tr>
      <th>項目</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>暗号化タイプ</td>
      <td>分散トレースの暗号化キー (例：AWS マネージドキー、セルフマネージドキー) を選べる。</td>
    </tr>
  </tbody>
</table>

#### ▼ グループ

<table>
  <thead>
    <tr>
      <th>項目</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>フィルター式</td>
      <td>スパンのグルーピング条件を設定する。</td>
    </tr>
    <tr>
      <td>インサイト</td>
      <td>インサイトメトリクスを連携するかどうかを設定する。</td>
    </tr>
    <tr>
      <td>タグ</td>
      <td>AWS リソースタグを設定する。</td>
    </tr>
  </tbody>
</table>

<br>

## 02. セットアップ (Terraform の場合)

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

レスポンス時間でトレース ID をフィルタリングする。

**＊実行例＊**

```bash
# レスポンス時間が5秒以上のスパン
responsetime >= 5
```

```bash
# レスポンス時間が5-10秒以上のスパン
responsetime >= 5 AND responsetime <= 10
```

> - [Using filter expressions - AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-console-filters.html#console-filters-syntax)

#### ▼ HTTP ヘッダー

HTTP ヘッダー値でトレース ID をフィルタリングする。

**＊実行例＊**

```bash
http.status != 200
```

```bash
http.useragent = "ELB-HealthChecker/2.0"
```

> - https://pages.awscloud.com/rs/112-TZM-766/images/AWS-Black-Belt_2023_AWS-X-Ray_0228_v1.pdf#page=29

#### ▼ AWS リソース

AWS リソース名でトレース ID をフィルタリングする。

**＊実行例＊**

```bash
service("<AWSリソース名>")
```

タイプを指定することで、異なるタイプの同名の AWS リソースを区別できる。

**＊実行例＊**

```bash
service(id(name: "<AWSリソース名>", type: "AWS::EC2::Instance"))
```

> - https://pages.awscloud.com/rs/112-TZM-766/images/AWS-Black-Belt_2023_AWS-X-Ray_0228_v1.pdf#page=29

#### ▼ 送信元/宛先の AWS リソース

送信元と宛先の AWS リソース名でトレース ID をフィルタリングする。

**＊実行例＊**

```bash
edge("<送信元AWSリソース名>", "<宛先AWSリソース名>")
```

> - https://pages.awscloud.com/rs/112-TZM-766/images/AWS-Black-Belt_2023_AWS-X-Ray_0228_v1.pdf#page=29

#### ▼ アノテーション

ユーザー定義のラベルでトレース ID をフィルタリングする。

**＊実行例＊**

アノテーション値でトレース ID をフィルタリングする。

```bash
annotation.otel_resource_component = "<コンポーネント名>"
```

各言語の SDK の関数でラベルを設定できる。

```go
// Goの場合
xray.AddAnnotation("component", value)
```

```python
# Pythonの場合
subsegment.put_annotation("component", value)
```

似たものとしてメタデータがあるが、こちらはフィルタリングに使用できない。

> - [AWS X-Ray concepts - AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-annotations)
> - [Add annotations and metadata to segments with the X-Ray SDK for Python - AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-python-segment.html#xray-sdk-python-segment-annotations)

<br>

### テレメトリー間の連携

#### ▼ Amazon CloudWatch Logs との連携

あらかじめ、分散トレースに紐づくログがあるロググループ名を設定し、ログには X-Ray 仕様のトレース ID を出力しておく必要がある。

> - [OpenTelemetry Go を使ったトレースとログの紐付け on AWS CloudWatch](https://zenn.dev/k6s4i53rx/articles/69ef65b84dd799#%E8%A8%AD%E5%AE%9A%E6%96%B9%E6%B3%95)

X-Ray の画面では、分散トレースのトレース ID に応じて、以下のようなログクエリをロググループに自動発行する。

これにより、分散トレースとログを紐づけられる。

```sql
fields @log, @timestamp, @message
| filter @message like "<ログに付与したX-RayトレースID>"
| sort @timestamp, @message desc
```

> - [OpenTelemetry Go を使ったトレースとログの紐付け on AWS CloudWatch](https://zenn.dev/k6s4i53rx/articles/69ef65b84dd799#%E7%B5%90%E6%9E%9C)

<br>

## 04. スパン

### セグメント

#### ▼ セグメントとは

スパンに相当する。

マイクロサービスの処理情報を持つ。

```yaml
{
  # スパンのトレース ID
  "trace_id": "1-581cf771-a006649127e371903a2de979",
  # スパンのスパン ID
  "id": "70de5b6f19ff9a0a",
  "name": "example.com",
  "start_time": 1.478293361271E9,
  "end_time": 1.478293361449E9,
  "service": {...},
  "user": {...},
  # アプリケーションを実行している AWS リソースの種類 (例：EC2、Amazon ECS、Elastic Beanstalk)
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

> - [AWS X-Ray segment documents - AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html#api-segmentdocuments-fields)

#### ▼ セグメントのスキーマ

セグメントの構造やデータ型を定義したもの。

```yaml
{
  # スキーマ URL
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

> - [AWS X-Ray segment documents - AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html)

<br>

### ID 系

#### ▼ `id`

セグメント ID を持つ。

W3C Trace Context 仕様のルートスパンの ID に相当する。

#### ▼ `trace_id` キー

セグメントとサブセグメントを紐づける。

`<バージョン>-<ルートセグメントのタイプスタンプ>-<サブセグメントごとのユニークID>` からなる。

例えば、`1-58406520-a006649127e371903a2de979` になる。

> - [AWS X-Ray segment documents - AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html#api-segmentdocuments-fields)

#### ▼ `parent_id` キー

親のサブセグメント ID を持つ。

W3C Trace Context 仕様のスパンの ID に相当する。

<br>

### サブセグメント系

#### ▼ `subsegments` キー

サグセグメントの情報を持つ。

例えば、サブセグメント ID であれば `<サブセグメントごとのユニークID>` になる。

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

> - [AWS X-Ray segment documents - AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html#api-segmentdocuments-subsegments)

<br>

### リクエスト系

#### ▼ `http` キー

スパンの HTTP リクエストの情報を持つ。

```yaml
{
  "http":
    {
      "request": {"method": "GET", "url": "https://names.example.com/"},
      "response": {"content_length": -1, "status": 200},
    },
}
```

> - [AWS X-Ray segment documents - AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html#api-segmentdocuments-http)

<br>

### AWS リソース系

#### ▼ `aws` キー

スパンの作成元の AWS リソース情報を持つ。

```yaml
{
  # AWS リソース情報
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
      # X-Ray のクライアントパッケージ情報
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
  # 400 系ステータスの場合
  "error": false,
  # 500 系ステータスの場合,
  "fault": true,
  # 429 ステータスの場合
  "throttle": false,
}
```

> - [AWS X-Ray segment documents - AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html#api-segmentdocuments-errors)

<br>

### SQL

マイクロサービスが実行した SQL の情報を持つ。

```yaml
{
  "sql":
    {
      "url": "jdbc:postgresql://<ホスト名>:5432/<DB名>",
      "preparation": "statement",
      "database_type": "PostgreSQL",
      "database_version": "9.5.4",
      "driver_version": "PostgreSQL 9.4.1211.jre7",
      "user": "dbuser",
      "sanitized_query": "SELECT  *  FROM  customers  WHERE  customer_id=?;",
    },
}
```

> - [AWS X-Ray segment documents - AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html#api-segmentdocuments-sql)

<br>

## 05. OpenTelemetry と X-Ray の対応関係

### OpenTelemetry と X-Ray

#### ▼ 一覧

<table>
  <thead>
    <tr>
      <th>OpenTelemetry</th>
      <th>X-Ray</th>
      <th>値の例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Attributes</td>
      <td><code>annotations/metadata</code></td>
      <td></td>
    </tr>
    <tr>
      <td>SpanId</td>
      <td><code>id</code></td>
      <td></td>
    </tr>
    <tr>
      <td>TraceId</td>
      <td><code>trace_id</code></td>
      <td></td>
    </tr>
    <tr>
      <td>StartTime</td>
      <td><code>start_time</code></td>
      <td></td>
    </tr>
    <tr>
      <td>EndTime</td>
      <td><code>end_time</code></td>
      <td></td>
    </tr>
    <tr>
      <td>ParentSpanId</td>
      <td><code>parent_id</code></td>
      <td></td>
    </tr>
    <tr>
      <td>Status.StatusCode</td>
      <td><code>fault</code>、<code>error</code>、<code>throttle</code></td>
      <td></td>
    </tr>
    <tr>
      <td>Event</td>
      <td><code>exception</code></td>
      <td></td>
    </tr>
    <tr>
      <td>Link</td>
      <td>執筆時点 (2024/04/14) で非対応</td>
      <td></td>
    </tr>
    <tr>
      <td><code>enduser.id</code></td>
      <td><code>user</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>cloud.provider</code>、<code>cloud.platform</code></td>
      <td><code>origin</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>rpc.system</code>、<code>aws.service</code></td>
      <td><code>namespace</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>peer.service</code>、<code>aws.service</code>、<code>db.service</code>、<code>service.name</code>、<code>span.kind</code>、<code>span name</code></td>
      <td><code>name</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>pdata.SpanKindServer</code></td>
      <td><code>type</code></td>
      <td></td>
    </tr>
  </tbody>
</table>

<br>

### HTTP リクエストのスパン属性

#### ▼ 一覧

<table>
  <thead>
    <tr>
      <th>OpenTelemetry</th>
      <th>X-Ray</th>
      <th>値の例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>http.method</code></td>
      <td><code>http.request.method</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>http.client_ip</code></td>
      <td><code>http.request.client_ip</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>http.client_ip</code></td>
      <td><code>http.request.x_forwarded_for</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>http.user_agent</code></td>
      <td><code>http.request.user_agent</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>http.status_code</code></td>
      <td><code>http.response.status</code></td>
      <td><code>200</code></td>
    </tr>
    <tr>
      <td><code>http.url</code>、<code>http.scheme</code>、<code>http.host</code>、<code>http.target</code>、<code>http.server_name</code>、<code>net.host.port</code>、<code>host.name</code>、<code>net.host.name</code>、<code>net.peer.name</code>、<code>net.peer.port</code>、<code>net.peer.ip</code></td>
      <td><code>http.request.url</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>message.type</code></td>
      <td><code>http.response.content_length</code></td>
      <td></td>
    </tr>
  </tbody>
</table>

<br>

### クエリのスパン属性

#### ▼ 一覧

<table>
  <thead>
    <tr>
      <th>OpenTelemetry</th>
      <th>X-Ray</th>
      <th>値の例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>db.connection_string</code>、<code>db.name</code></td>
      <td><code>sql.url</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>db.system</code></td>
      <td><code>sql.database_type</code></td>
      <td><code>mysql</code></td>
    </tr>
    <tr>
      <td><code>db.user</code></td>
      <td><code>sql.user</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>db.statement</code></td>
      <td><code>sql.sanatized_query</code></td>
      <td><code>SELECT foo_name FROM foo_table</code></td>
    </tr>
  </tbody>
</table>

<br>

### AWS のスパン属性

#### ▼ 一覧

<table>
  <thead>
    <tr>
      <th>OpenTelemetry</th>
      <th>X-Ray</th>
      <th>値の例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>cloud.account.id</code></td>
      <td><code>aws.account_id</code></td>
      <td><code>123456789</code></td>
    </tr>
    <tr>
      <td><code>aws.operation</code>、<code>rpc.method</code></td>
      <td><code>aws.operation</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>aws.region</code></td>
      <td><code>aws.region</code></td>
      <td><code>ap-northeast-1</code></td>
    </tr>
    <tr>
      <td><code>aws.requestId</code></td>
      <td><code>aws.request_id</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>aws.queue.url</code></td>
      <td><code>aws.queue_url</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>aws.table.name</code></td>
      <td><code>aws.table_name</code></td>
      <td></td>
    </tr>
  </tbody>
</table>

<br>

### SDK のスパンメタデータ

#### ▼ 一覧

<table>
  <thead>
    <tr>
      <th>OpenTelemetry</th>
      <th>X-Ray</th>
      <th>値の例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>telemetry.sdk.name</code></td>
      <td><code>xray.sdk</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>telemetry.sdk.version</code></td>
      <td><code>xray.sdk_version</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>telemetry.auto.version</code></td>
      <td><code>xray.auto_instrumentation</code></td>
      <td></td>
    </tr>
  </tbody>
</table>

<br>

### AWS リソースのスパンメタデータ

#### ▼ 一覧

<table>
  <thead>
    <tr>
      <th>OpenTelemetry</th>
      <th>X-Ray</th>
      <th>値の例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>k8s.cluster.name</code></td>
      <td><code>Amazon EKS.cluster_name</code></td>
      <td><code>foo-cluster</code></td>
    </tr>
    <tr>
      <td><code>k8s.pod.name</code></td>
      <td><code>Amazon EKS.pod</code></td>
      <td><code>foo-pod</code></td>
    </tr>
    <tr>
      <td><code>k8s.pod.uid</code></td>
      <td><code>Amazon EKS.container_id</code></td>
      <td><code>foo-container</code></td>
    </tr>
    <tr>
      <td><code>aws.log.group.arns</code></td>
      <td><code>cloudwatch_logs.arn</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>aws.log.group.names</code></td>
      <td><code>cloudwatch_logs.log_group</code></td>
      <td></td>
    </tr>
  </tbody>
</table>

#### ▼ 設定例

ここでは、`aws.log.group.arns` 属性を設定すると仮定する。

```go
package trace

import (
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

> - [opentelemetry-go/semconv/v1.24.0/resource.go at v1.25.0 · open-telemetry/opentelemetry-go · GitHub](https://github.com/open-telemetry/opentelemetry-go/blob/v1.25.0/semconv/v1.24.0/resource.go#L1866-L1871)

<br>

## 06. AWS Lambda の場合

### 初期化

ここでは、フレームワークなしで Go アプリケーションを作成しているとする。

X-Ray のパッケージを初期化する。

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

> - [lambda を go で動かし、X-Rayでtraceするまで #AWS - Qiita](https://qiita.com/smith-30/items/225e27e6d9a110bce725)

<br>

### 親スパンの作成

親スパンを作成する。

なお、親スパンと子スパンのどちらでも、スパン作成の実装方法は同じである。

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

> - [lambda を go で動かし、X-Rayでtraceするまで #AWS - Qiita](https://qiita.com/smith-30/items/225e27e6d9a110bce725)

<br>

### 子スパンの作成

子スパンを作成する。

なお、親スパンと子スパンのどちらでも、スパン作成の実装方法は同じである。

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

> - [lambda を go で動かし、X-Rayでtraceするまで #AWS - Qiita](https://qiita.com/smith-30/items/225e27e6d9a110bce725)

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

> - [lambda を go で動かし、X-Rayでtraceするまで #AWS - Qiita](https://qiita.com/smith-30/items/225e27e6d9a110bce725)

<br>
