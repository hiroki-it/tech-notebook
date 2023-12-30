---
title: 【IT技術の知見】CloudLogging＠Google Cloudリソース
description: CloudLogging＠Google Cloudリソースの知見を記録しています。
---

# GCloudLogging＠Google Cloudリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. CloudLoggingとは

記入中...

<br>

## 02. セットアップ

### コンソール画面の場合

ログを収集/保管できる。

CloudLoggingでログを処理するためのAPI (`logging.googleapis.com`) を公開している。

| 項目                 | 説明                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| ログベースの指標     | 合致した文字列を持つログをトリガーとして、データポイントを発生させる。このデータポイントを集計し、メトリクスとして使用できる。 |
| ログルーター、シンク | 合致した文字列を持つログをトリガーとして、指定したPub/Subトピックに振り分ける。                                                |
| ログストレージ       | ログを保管する。                                                                                                               |

> - https://cloud.google.com/logging/docs
> - https://blog.querier.io/posts/detail/1cgugqqa1ujf/

<br>

## 02. 文法

### ログフィールド

#### ▼ 種類

| フィールド                   | 説明                                                                                                                                                                                                                                                                                        | 例  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| `severity`                   | ログの重要度レベルを持つ。                                                                                                                                                                                                                                                                  |     |
| `jsonPayload`、`textPayload` | `message`キー配下に構造化ログまたは非構造化ログを持つ (コンソール画面上は`message`キーは省略される場合がある)。CloudLoggingは、ログの構造を自動的に認識する。ログが`jsonPayload`キーの場合、 `message`キー配下のログは構造化ログである。一方で`textPayload`キーの場合、非構造化ログである。 |

**＊例＊**

例えば、Containerdが以下のようなログを作成したとする。

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

```yaml
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

> - https://cloud.google.com/logging/docs/structured-logging?hl=ja#special-payload-fields
> - https://qiita.com/ys_nishida/items/8b5274d8f3ec740ffa16

<br>

### ログクエリ

#### ▼ レシピ

> - https://cloud.google.com/logging/docs/view/query-library#container_queries

#### ▼ テキスト検索

タグに関係なく、ログからテキストを検索する。

```bash
foo-pod
```

#### ▼ ワイルドカード

`=~`演算子を使用して正規表現マッチングを有効化し、`.*`演算子や`$`演算子でワイルドカードを適用する。

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

> - https://cloud.google.com/logging/docs/view/logging-query-language#regular-expressions
> - https://stackoverflow.com/questions/71922754/google-cloud-platform-logging-how-to-search-wildcard-strings-in-all-logs

#### ▼ 除外

特定の値を持たないログをクエリする。

**＊実行例＊**

ヘルスチェック (`/health`) とメトリクス (`/metrics`) のエンドポイント以外のアクセスログをクエリする。

```bash
-jsonPayload.requestPath="/health"
-jsonPayload.requestPath="/metrics"
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

マイクロサービスアーキテクチャで、アウトバウンド時に送信元`istio-proxy`コンテナで発生したエラーをクエリする。

ここでは、アップストリーム側Clusterとして`PassthroughCluster`を指定した。

```bash
# Kubernetes上のPod内のistio-proxyコンテナ
# ダウンストリーム側Clusterとして、PassthroughClusterを設定する
resource.labels.container_name="istio-proxy"
resource.labels.pod_name="foo-pod"
jsonPayload.upstream_cluster="PassthroughCluster"
-jsonPayload.response_flags="-"
```

<br>
