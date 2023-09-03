---
title: 【IT技術の知見】分散トレース収集＠Datadog
description: 分散トレース収集＠Datadogの知見を記録しています。
---

# 分散トレース収集＠Datadog

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. トレースエージェント (サーバーの場合)

### トレースエージェントとは

デーモンであるdatadogエージェントに含まれている。

アプリケーションから分散トレースを収集し、Datadogに転送する。

![datadog-agent_on-server](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/datadog-agent_on-server.png)

> - https://www.netone.co.jp/knowledge-center/netone-blog/20210716-1/

<br>

### セットアップ

#### ▼ `/etc/datadog-agent/datadog.yaml`ファイル

> - https://hiroki-it.github.io/tech-notebook/observability/observability_telemetry_datadog_agent_conf.html

<br>

## 02. トレースエージェント (AWS ECS Fargateの場合)

### トレースエージェントとは

サーバーの場合と同様にして、アプリケーションから分散トレースを受信し、Datadogに転送する。

サーバーの場合とは異なり、自身が収集しにいくことはできない。

仕組みとして、アプリコンテナの分散トレースのクライアントパッケージはスパンを作成し、datadogコンテナの『`http://localhost:8126`』にこれを送信する。

datadogコンテナ内のdatadogエージェントはこれをHTTPSプロトコルでDatadogに転送する。

![datadog-tracer](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/datadog-tracer.png)

> - https://docs.datadoghq.com/tracing/
> - https://inokara.hateblo.jp/entry/2017/10/01/164446

<br>

### セットアップ

#### ▼ エージェント

dockerエージェントにて、`DD_APM_ENABLED`の環境変数に`true`を割り当てると、合わせてトレースエージェントが有効になる。

APMエージェントを有効化し、分散トレース監視バックエンドを送信できる。

> - https://docs.datadoghq.com/agent/docker/apm/?tab=linux
> - https://docs.datadoghq.com/tracing/#explore-datadog-apm

#### ▼ クライアントパッケージ

記入中...

> - https://docs.datadoghq.com/developers/libraries/#apm-%E3%81%A8%E5%88%86%E6%95%A3%E5%9E%8B%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%B3%E3%82%B0%E3%82%AF%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%B3%E3%83%88%E3%83%A9%E3%82%A4%E3%83%96%E3%83%A9%E3%83%AA

#### ▼ デバッグ

| 方法                      | 説明                                                                                                                                                                                    | 補足                                                                                                                                                                             |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 起動ログの有効化          | 環境変数の`DD_TRACE_STARTUP_LOGS`を有効化することにより、起動ログを標準出力に出力可能にする。起動ログから、クライアントパッケージの設定値を確認できる。                                 | - https://docs.datadoghq.com/tracing/troubleshooting/#troubleshooting-data-requested-by-datadog-support                                                                          |
| デバッグログの有効化      | 各クライアントパッケージが持つデバッグパラメーターを有効化することにより、デバッグログを標準出力に出力可能にする。デバッグログから、実際にDatadogに送信されるスパンデータを確認できる。 | - https://docs.datadoghq.com/tracing/troubleshooting/#troubleshooting-data-requested-by-datad                                                                                    |
| Agent Flareコマンドの実行 | datadogコンテナ内でAgent Flareコマンドを実行し、Datadogサポートにdatadogコンテナの構成情報をメール送信する。                                                                            | ・https://docs.datadoghq.com/tracing/troubleshooting/#troubleshooting-data-requested-by-datad <br>・https://docs.datadoghq.com/agent/troubleshooting/send_a_flare/?tab=agentv6v7 |

<br>

## 03. スパンの作成

### Datadogにおける分散トレース

#### ▼ 分散トレースの構成

Datadogで、分散トレースは複数のスパンの配列データとして定義される。

```yaml
[span1, span2, span3]
```

また、複数の分散トレース自体を配列データとして定義できる。

```yaml
[trace1, trace2, trace3]
```

> - https://docs.datadoghq.com/tracing/guide/send_traces_to_agent_by_api/

#### ▼ スパンの構成

Datadogで、スパンはJSON型データとして定義される。アプリケーション内のクライアントパッケージで、指定されたJSON型のスパンが作成され、スパンはdatadog-APIに送信される。

**＊実装例＊**

```yaml
[
  [
    {
      "duration": 123, # 処理の所要時間
      "error": 0, # エラーの有無
      "meta": {
          "env": "prd", # タグ
        },
      "metrics": {
          "baz-sum": 123, # マイクロサービスのメトリクス
        },
      "name": "laravel.request", # スパン名
      "parent_id": 123, # 親スパンID
      "resource": "/foo", # アクセスされたリソース
      "service": "laravel", # マイクロサービス名
      "span_id": 123456789, # スパンID
      "start": 0, # 処理開始時間
      "trace_id": 123456789, # トレースID
      "type": "web", # マイクロサービスのタイプ
    },
  ],
]
```

> - https://docs.datadoghq.com/tracing/guide/send_traces_to_agent_by_api/

#### ▼ コンテキスト

スパンの`meta`キーにコンテキストのセットを割り当てられる。

コンテキストはタグとして動作する。

**＊実装例＊**

PHP用のクライアントパッケージでlaravel内からタグを収集した例

```yaml
{
    "env": "prd",
    "http": {
        "host": "example.com",
        "method": "GET",
        "path_group": "/foo",
        "status_code": 200,
        "url": "https://example.com/foo/1"
    },
    "laravel": {
        "route": {
            "action": "App\Http\Controllers\Foo\FooController@get",
            "name": "foos.get"
        }
    },
    "php" : {
        "compilation": {
            "total_time_ms": 123.45
        }
    },
    "process_id": 100
}
```

<br>

### スパンのメトリクス

#### ▼ スパンのデータポイント化

スパンの持つデータをデータポイントとして集計すると、メトリクスのデータポイントを収集できる。

> - https://docs.datadoghq.com/tracing/generate_metrics/

#### ▼ メトリクス名の構成要素

メトリクス名は『`trace.<スパン名>.<メトリクス接尾辞名>`』の名前で構成される。

> - https://docs.datadoghq.com/tracing/guide/metrics_namespace/

#### ▼ メトリクスのスパン名

データポイントとなったスパン名が割り当てられる。

**＊例＊**

- `trace.web.request.<メトリクス接尾辞名>`
- `trace.db.query.<メトリクス接尾辞名>`
- `trace.db.commit.<メトリクス接尾辞名>`

#### ▼ メトリクスのメトリクス接尾辞名

メトリクスの種類に応じた接尾辞名が割り当てられる。

**＊例＊**

- `trace.<スパン名>.hits.*****` (該当スパンのヒット数)
- `trace.<スパン名>.duration` (該当スパンの処理時間)
- `trace.<スパン名>.duration.by.*****` (該当スパンの処理時間の割合)
- `trace.<スパン名>.errors.*****` (該当スパンにおけるエラー数)

> - https://docs.datadoghq.com/tracing/guide/metrics_namespace/#%E3%83%A1%E3%83%88%E3%83%AA%E3%82%AF%E3%82%B9%E3%82%B5%E3%83%95%E3%82%A3%E3%83%83%E3%82%AF%E3%82%B9

<br>

### エラートラッキング

#### ▼ エラートラッキングの仕組み

記入中...

> - https://docs.datadoghq.com/tracing/error_tracking/#how-datadog-error-tracking-works

<br>

## 05. マイクロサービスの識別

### マイクロサービスタイプ

#### ▼ マイクロサービスタイプとは

分散トレースのクライアントパッケージによって、マイクロサービスは『Web』『DB』『Cache』『Cache』の`4`個に分類される。

各マイクロサービスの`span.type`属性に割り当てられるタイプ名から自動的に割り振られる。

タイプ名の種類については、以下のリンクを参考にせよ。

> - https://github.com/DataDog/dd-trace-php/blob/master/src/api/Type.php
> - https://docs.datadoghq.com/tracing/visualization/services_list/#%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%97

<br>

### マイクロサービスのタグ

#### ▼ マイクロサービスのタグとは

PHP用のクライアントパッケージによって、マイクロサービスにタグを追加できる。

コードから、PHP用のクライアントパッケージがアプリケーションからどのように情報を抜き出し、分散トレースのタグの値を決定しているかがわかる。

> - https://github.com/DataDog/dd-trace-php/tree/master/src/Integrations/Integrations
> - https://github.com/DataDog/dd-trace-php/blob/master/src/api/Tag.php

<br>
