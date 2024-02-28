---
title: 【IT技術の知見】ログ＠テレメトリー
description: ログ＠テレメトリーの知見を記録しています。
---

# ログ＠テレメトリー

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ログ

### ログとは

特定の瞬間に発生したイベントが記載されたデータのこと。

> - https://newrelic.com/jp/blog/how-to-relic/metrics-events-logs-and-traces

<br>

### 構造からみた種類

#### ▼ 非構造化ログ

構造が無く、イベントの値だけが表示されたログのこと。

```log
192.168.0.1 [2021-01-01 12:00:00] GET /foo/1 200
```

#### ▼ 構造化ログ

イベントの項目名と値の対応関係を持つログのこと。

JSON型で表すが、拡張子が`json`であるというわけでないことに注意する。

```yaml
{
  "client_ip": "192.168.0.1",
  "timestamp": "2021-01-01 12:00:00",
  "method": "GET",
  "url": "/foo/1",
  "status_code": 200,
}
```

<br>

## 02. ログ収集方式

### Distributed logging (分散ロギング)

マイクロサービスアーキテクチャの各サービスから収集されたログを、バラバラに分析/管理する。

> - https://www.splunk.com/en_us/data-insider/what-is-distributed-tracing.html#centralized-logging

<br>

### Centralized logging (集中ロギング)

マイクロサービスアーキテクチャの各サービスから収集されたログを、一元的に分析/管理する。

各コンテナ (例：アプリコンテナ、サービスメッシュサイドカー) が作成するログに一意なIDを割り当て、人繋ぎに紐付ける必要がある。

例えば、ログ監視バックエンドでこのログをクエリしさえすれば、リクエストの経路がわかる。

```bash
# CloudLoggingでログをクエリする
jsonPayload.traceId="<トレースID>"
```

> - https://www.splunk.com/en_us/data-insider/what-is-distributed-tracing.html#centralized-logging

<br>
