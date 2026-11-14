---
title: 【IT技術の知見】Cloud Logging
description: Cloud Loggingの知見を記録しています。
tags:
  - "3大クラウド"
  - "Google Cloud"
  - "Google Cloudリソース"
---

# Cloud Logging

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要

### Cloud Logging とは

Google Cloud リソースやアプリケーションのログを収集し、保管、検索、分析できるログ管理サービスである。

<br>

## 02. 仕組み

### ログの収集・保管・振り分け

ログを収集/保管できる。

Cloud Logging でログを処理するための API (`logging.googleapis.com`) を公開している。

<table>
  <thead>
    <tr>
      <th>項目</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ログベースのメトリクス</td>
      <td>合致した文字列を持つログをトリガーとして、データポイントを発生させる。このデータポイントを集約し、ログベースのメトリクスとして使用できる。</td>
    </tr>
    <tr>
      <td>ログルーター、シンク</td>
      <td>合致した文字列を持つログをトリガーとして、指定した Pub/Sub トピックに振り分ける。</td>
    </tr>
    <tr>
      <td>ログストレージ</td>
      <td>ログを保管する。</td>
    </tr>
  </tbody>
</table>

> - [Cloud Logging documentation \| Google Cloud Documentation](https://cloud.google.com/logging/docs)
> - [Cloud Loggingで収集したログをCloud Pub/SubとCloud Functionsを使ってSlackに通知する - Querierブログ](https://blog.querier.io/posts/detail/1cgugqqa1ujf/)

<br>

## 03. セットアップ

### Terraformによる構築

terraform-google-modules の log-export モジュールを使用し、重要度が ERROR 以上のログを Pub/Sub に転送するシンク、トピック、プル型サブスクリプションを作成する。Cloud Logging API が有効なプロジェクトを指定する。

```terraform
variable "project_id" {
  type = string
}

module "log_export" {
  source  = "terraform-google-modules/log-export/google"
  version = "12.0.0"

  parent_resource_id     = var.project_id
  log_sink_name          = "foo-error-logs"
  destination_uri        = module.destination.destination_uri
  filter                 = "severity >= ERROR"
  unique_writer_identity = true
}

module "destination" {
  source  = "terraform-google-modules/log-export/google//modules/pubsub"
  version = "12.0.0"

  project_id               = var.project_id
  topic_name               = "foo-logs"
  log_sink_writer_identity = module.log_export.writer_identity
  create_subscriber        = true
}
```

> - [terraform-google-modules/log-export/google (12.0.0) - Terraform Registry](https://registry.terraform.io/modules/terraform-google-modules/log-export/google/12.0.0)
> - [terraform-google-modules/log-export/google//modules/pubsub (12.0.0) - Terraform Registry](https://registry.terraform.io/modules/terraform-google-modules/log-export/google/12.0.0/submodules/pubsub)

<br>

## 04. ログベースのメトリクス

### ▼ ユーザー定義

### ▼ ビルトイン

- billing/bytes_ingested
- billing/bytes_stored
- billing/monthly_bytes_ingested
- ...

<br>

## 05. ログルーターとシンク

### ▼ ログシンク

ログの特定の文字列を発火条件として、各種 Google Cloud リソース (例：Cloud Pub/Sub、BigQuery、Cloud Storage、Cloud Monitoring など) にログイベントを送信する。

![google_cloud_logging](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/google_cloud_logging.png)

> - [GCP Cloud Logging: The Basis - DEV Community](https://dev.to/alvardev/gcp-cloud-logging-the-basis-45eh)
> - [Cloud Logging のイベントをリアルタイムで検出して対応する \| Google Cloud 公式ブログ](https://cloud.google.com/blog/ja/products/management-tools/automate-your-response-to-a-cloud-logging-event)

### ▼ ログシンクフィルター

シンクを発火させるときのログの条件を設定する。

```bash
resource.type = "k8s_container" AND resource.labels.namespace_name = "foo-namespace" AND resource.labels.pod_name =~ "foo-pod" AND jsonPayload.level = ("FATAL" OR "ERROR")
```

<br>

### シンク

#### ▼ フィルター

ログの条件を設定する。

ロジックは、ログクエリと同じである。

#### ▼ リソースタイプ

```bash
# KubernetesCluster
resource.type = "k8s_cluster"
```

```bash
# Kubernetesコンテナ
resource.type = "k8s_container"
```

## 06. ログフィールド

### ▼ 種類

<table>
  <thead>
    <tr>
      <th>フィールド</th>
      <th>説明</th>
      <th>例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>severity</code></td>
      <td>ログの重要度レベルを持つ。</td>
      <td></td>
    </tr>
    <tr>
      <td><code>jsonPayload</code>、<code>textPayload</code></td>
      <td><code>message</code> キー配下に構造化ログまたは非構造化ログを持つ (コンソール画面上は <code>message</code> キーは省略される場合がある)。Cloud Logging は、ログの構造を自動的に認識する。ログが <code>jsonPayload</code> キーの場合、 <code>message</code> キー配下のログは構造化ログである。一方で <code>textPayload</code> キーの場合、非構造化ログである。</td>
      <td></td>
    </tr>
    <tr>
      <td><code>logName</code></td>
      <td>ログの送信元であるログファイル名 (<code>foo.log</code>) 、標準出力 (<code>projects/&lt;プロジェクト名&gt;/stdout</code>)、標準エラー出力 (<code>projects/&lt;プロジェクト名&gt;/stderr</code>) を設定できる。また、gcloud の SDK を使用すると、任意の名前 (<code>foo</code>) を設定できる。</td>
      <td></td>
    </tr>
  </tbody>
</table>

例えば、Containerd が以下のようなログを作成したとする。

ログメッセージは、構造化ログになっている。

```bash
# わかりやすいように改行している。
2023-03-16T19:48:25.824524924+09:00 stderr F {
  "message": "There was an error in the application",
  "foo": "FOO"
  "bar": "BAR"
  "baz": "BAZ"
}
```

```json
{
  "insertId": "42",
  "jsonPayload":
    {
      "message": "There was an error in the application",
      "foo": "FOO",
      "bar": "BAR",
      "baz": "BAZ",
    },
  "httpRequest": {"requestMethod": "GET"},
  "resource":
    {
      "type": "k8s_container",
      "labels":
        {
          "container_name": "hello-app",
          "pod_name": "helloworld-gke-6cfd6f4599-9wff8",
          "project_id": "stackdriver-sandbox-92334288",
          "namespace_name": "default",
          "location": "us-west4",
          "cluster_name": "helloworld-gke",
        },
    },
  "timestamp": "2020-11-07T15:57:35.945508391Z",
  "severity": "ERROR",
  "labels": {"user_label_2": "value_2", "user_label_1": "value_1"},
  "logName": "projects/stackdriver-sandbox-92334288/logs/stdout",
  "operation":
    {
      "id": "get_data",
      "producer": "github.com/MyProject/MyApplication",
      "first": "true",
    },
  "trace": "projects/my-projectid/traces/06796866738c859f2f19b7cfb3214824",
  "sourceLocation":
    {"file": "get_data.py", "line": "142", "function": "getData"},
  "receiveTimestamp": "2020-11-07T15:57:42.411414059Z",
  "spanId": "000000000000004a",
}
```

> - [LogEntry \| Cloud Logging \| Google Cloud Documentation](https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry)
> - [構造化ロギング \| Cloud Logging \| Google Cloud Documentation](https://cloud.google.com/logging/docs/structured-logging?hl=ja#special-payload-fields)
> - [fluentd で Cloud logging(旧:Stackdriver) にログを送る #GoogleCloud - Qiita](https://qiita.com/ys_nishida/items/8b5274d8f3ec740ffa16)

<br>

## 07. ログの検索とフィルタリング

### ▼ レシピ

> - [Sample queries \| Cloud Logging \| Google Cloud Documentation](https://cloud.google.com/logging/docs/view/query-library#container_queries)

### ▼ テキスト検索

タグに関係なく、ログからテキストを検索する。

```bash
foo-pod
```

### ▼ ワイルドカード

```bash
# 部分一致
resource.labels.pod_name: "pod"
```

> - https://tools.bigwave.biz/notes/blog/posts/gcp_logging_query
> - [GCP Loggingで該当のurlのみのログを取得する #GoogleCloud - Qiita](https://qiita.com/shigeru10/items/f54455e02e9d93e9ba4c)

### ▼ 正規表現

`=~` 演算子を使用して正規表現マッチングを有効化する。

正規表現にすると、`.*` 演算子や `$` 演算子でワイルドカードを適用できるようになる。

```bash
# 前方一致
resource.labels.pod_name=~"foo-pod-.*"
```

```bash
# 後方一致
resource.labels.pod_name=~"pod$"
```

```bash
# 部分一致
resource.labels.pod_name=~".*pod.*"
```

> - [Logging query language \| Google Cloud Documentation](https://cloud.google.com/logging/docs/view/logging-query-language#regular-expressions)
> - https://stackoverflow.com/questions/71922754/google-cloud-platform-logging-how-to-search-wildcard-strings-in-all-logs

### ▼ 除外

特定の値を持たないログをクエリする。

**＊実行例＊**

ヘルスチェック (`/health`) とメトリクス (`/metrics`) のエンドポイント以外のアクセスログをクエリする。

```bash
-jsonPayload.requestPath="/health"
-jsonPayload.requestPath="/metrics"
```

<br>

### リソースラベル

```bash
# Kubernetes Cluster名
resource.labels.cluster_name = "foo-cluster"
```

```bash
# リソースのロケーション
resource.labels.location="asia-northeast1"
```

```bash
# Namespace名
resource.labels.namespace_name = "foo-namespace"
```

```bash
# Pod名
resource.labels.pod_name =~ "foo-pod"
```

#### ▼ 任意のキー

```bash
# 任意のキー
jsonPayload.Level = "WARN"
```

#### ▼ 組み合わせ

マイクロサービスアーキテクチャで、istio-proxy のアウトバウンド通信で発生したエラーをクエリする。

ここでは、宛先 Cluster として `PassthroughCluster` を指定した。

```bash
# Kubernetes上のPod内のistio-proxyコンテナ
# 送信元Clusterとして、PassthroughClusterを設定する
resource.labels.container_name="istio-proxy"
resource.labels.pod_name="foo-pod"
jsonPayload.upstream_cluster="PassthroughCluster"
-jsonPayload.response_flags="-"
```

<br>
