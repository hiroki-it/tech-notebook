---
title: 【知見を記録するサイト】分散トレース収集@Datadog
description: 分散トレース収集@Datadogの知見をまとめました。
---

# 分散トレース収集@Datadog

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. トレーサー

### トレーサーとは

APM機能を用いる時に，トレースエージェントが稼働するDatadogコンテナに分散トレースを送信できるよう，マイクロサービスのコンテナでトレーサーをインストールする必要がある．パッケージはアプリケーションによって読み込まれた後，『```http://localhost:8126```』を指定して，分散トレースを送信するようになる．

参考：https://docs.datadoghq.com/ja/tracing/#datadog-%E3%81%B8%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B9%E3%82%92%E9%80%81%E4%BF%A1

![datadog-tracer](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/datadog-tracer.png)

<br>

### パッケージ一覧

参考：https://docs.datadoghq.com/ja/developers/libraries/#apm-%E3%81%A8%E5%88%86%E6%95%A3%E5%9E%8B%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%B3%E3%82%B0%E3%82%AF%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%B3%E3%83%88%E3%83%A9%E3%82%A4%E3%83%96%E3%83%A9%E3%83%AA

<br>

### PHPトレーサー

#### ・インストール

各マイクロサービスのDockerfileにて，パッケージをインストールする．

参考：https://docs.datadoghq.com/tracing/setup_overview/setup/php/?tab=containers

```dockerfile
ENV DD_TRACE_VERSION=0.63.0

# GitHubからパッケージをダウンロード
RUN curl -Lo https://github.com/DataDog/dd-trace-php/releases/download/${DD_TRACE_VERSION}/datadog-php-tracer_${DD_TRACE_VERSION}_amd64.deb \
  # 解凍
  && dpkg -i datadog-php-tracer.deb \
  # 残骸ファイルを削除
  && rm datadog-php-tracer.deb
```

アプリケーションがパッケージを読み込んだか否かをコマンドで確認できる．

```bash
# 成功の場合
$ php --ri=ddtrace

ddtrace


Datadog PHP tracer extension
For help, check out the documentation at https://docs.datadoghq.com/tracing/languages/php/
(c) Datadog 2020

# 〜 中略 〜

```

```bash
# 失敗の場合
$  php --ri=ddtrace
Extension 'ddtrace' not present.
```

#### ・環境変数

環境変数を使用できる．分散トレースのタグ名に反映される．環境変数については，以下のリンクを参考にせよ．

参考：https://docs.datadoghq.com/ja/tracing/setup_overview/setup/php/?tab=%E3%82%B3%E3%83%B3%E3%83%86%E3%83%8A#%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0%E3%82%B3%E3%83%B3%E3%83%95%E3%82%A3%E3%82%AE%E3%83%A5%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3

| 変数名                                        | 説明                                                         | 画面                                   |
| --------------------------------------------- | ------------------------------------------------------------ | -------------------------------------- |
| ```DD_SERVICE_MAPPING```                      | 分散トレースにマイクロサービス名を設定する．マイクロサービス名はデフォルトのインテグレーション名になるが，これを上書きできる<br>（例）```laravel:foo-laravel,pdo:foo-pdo``` | https://app.datadoghq.com/apm/services |
| ```DD_SERVICE_NAME```                         | 分散トレースにマイクロサービス名を設定する．```DD_SERVICE_MAPPING```がnullの場合，この環境変数の値が代わりにマイクロサービス名になる（仕組みがよくわからん）． |                                        |
| ```DD_TRACE_<インテグレーション名>_ENABLED``` | 有効化するインテグレーション名を設定する．デフォルトで全てのインテグレーションが有効化されているため，設定は不要である．Datadogのインテグレーションを無効化する場合は |                                        |
| ```DD_<インテグレーション名>_DISABLED```      | 無効化するインテグレーション名を設定する．                   |                                        |

トレーサーの設定の状態は，```php --ri=ddtrace```コマンドの結果得られるJSONを整形することで確認できる．

```bash
$ php --ri=ddtrace

Datadog tracing support => enabled
Version => 0.57.0
DATADOG TRACER CONFIGURATION => { ..... } # <--- ここに設定のJSONが得られる

# 得られたJSONを整形
{
    "date": "2021-00-00T09:00:00Z",
    "os_name": "Linux ***** 5.10.25-linuxkit #1 SMP Tue Mar 23 09:27:39 UTC 2021 x86_64",
    "os_version": "5.10.25-linuxkit",
    "version": "0.64.1",
    "lang": "php",
    "lang_version": "8.0.8",
    "env": null,
    "enabled": true,
    "service": null,
    "enabled_cli": false,
    "agent_url": "http://localhost:8126", # datadogコンテナのアドレスポート
    "debug": false,
    "analytics_enabled": false,
    "sample_rate": 1.000000,
    "sampling_rules": null,
    "tags": {},
    "service_mapping": {},
    "distributed_tracing_enabled": true,
    "priority_sampling_enabled": true,
    "dd_version": null,
    "architecture": "x86_64",
    "sapi": "cli",
    "datadog.trace.request_init_hook": "/opt/datadog-php/dd-trace-sources/bridge/dd_wrap_autoloader.php",
    "open_basedir_configured": false,
    "uri_fragment_regex": null,
    "uri_mapping_incoming": null,
    "uri_mapping_outgoing": null,
    "auto_flush_enabled": false,
    "generate_root_span": true,
    "http_client_split_by_domain": false,
    "measure_compile_time": true,
    "report_hostname_on_root_span": false,
    "traced_internal_functions": null,
    "auto_prepend_file_configured": false,
    "integrations_disabled": "default",
    "enabled_from_env": true,
    "opcache.file_cache": null,
    "agent_error": "Failed to connect to localhost port 8126: Connection refused", # エラーメッセージ
    "DDTRACE_REQUEST_INIT_HOOK": "'DDTRACE_REQUEST_INIT_HOOK=/opt/datadog-php/dd-trace-sources/bridge/dd_wrap_autoloader.php' is deprecated, use DD_TRACE_REQUEST_INIT_HOOK instead."
}
```

<br>

### Node.jsトレーサー

#### ・TypeScriptやモジュールバンドルを使っている場合

エントリポイントとなる```nuxt.config.js```ファイルにて，一番最初にDatadogのトレースパッケージを読み込み，初期化する．

参考：https://docs.datadoghq.com/ja/tracing/setup_overview/setup/nodejs/?tab=%E3%82%B3%E3%83%B3%E3%83%86%E3%83%8A#typescript-%E3%81%A8%E3%83%90%E3%83%B3%E3%83%89%E3%83%A9%E3%83%BC

```javascript
import 'dd-trace/init'

// フレームワークを含むパッケージのインポートが続く
```

また，初期化時に設定した環境変数を使用できる．APMのマイクロサービスのタグ名に反映される．

参考：https://docs.datadoghq.com/ja/tracing/setup_overview/setup/nodejs/?tab=%E3%82%B3%E3%83%B3%E3%83%86%E3%83%8A#%E3%82%B3%E3%83%B3%E3%83%95%E3%82%A3%E3%82%AE%E3%83%A5%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3

<br>

## 02. 分散トレースの生成

### 分散トレース

#### ・分散トレースとは

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/observability_monitering/observability.html

#### ・構造

Datadogで，分散トレースはスパンを持つ配列データとして定義される．

参考：https://docs.datadoghq.com/tracing/guide/send_traces_to_agent_by_api/

```bash
[
    span1,
    span2,
    span3
]
```

また，複数の分散トレースを配列データとして定義できる．

```bash
[
    trace1,
    trace2,
    trace3
]
```

<br>

### スパン

#### ・スパンとは

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/observability_monitering/observability.html

#### ・構造

Datadogで，スパンはJSON型データとして定義される．アプリケーション内のトレーサーで，指定されたJSON型のスパンが作成され，スパンはDatadog-APIに送信される．

参考：https://docs.datadoghq.com/tracing/guide/send_traces_to_agent_by_api/

**＊実装例＊**

```bash
[
  [
    {
      "duration": 123,           # 処理の所要時間
      "error": 0,                # エラーの有無
      "meta": {
        "env": "prd"           # タグのり
      },
      "metrics": {
        "baz-sum": 123         # マイクロサービスのメトリクス
      },
      "name": "laravel.request", # スパン名
      "parent_id": 123,          # 親スパンID
      "resource": "/foo",       # アクセスされたリソース
      "service": "laravel",      # マイクロサービス名
      "span_id": 123456789,      # スパンID
      "start": 0,                # 処理開始時間
      "trace_id": 123456789,     # トレースID
      "type": "web"              # マイクロサービスのタイプ
    }
  ]
]

```

#### ・メタデータ

スパンの```meta```キーにメタデータのセットを割り当てられる．メタデータはタグとして機能する．

**＊実装例＊**

PHPトレーサーでlaravel内からタグを収集した例

```bash
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

#### ・スパンのデータポイント化

スパンの持つデータをデータポイントとして集計すると，メトリクスを収集できる．

参考：https://docs.datadoghq.com/ja/tracing/generate_metrics/

#### ・メトリクス名の構成要素

メトリクス名は『```trace.<スパン名>.<メトリクスサフィックス名>```』の名前で構成される．

参考：https://docs.datadoghq.com/ja/tracing/guide/metrics_namespace/

#### ・メトリクスのスパン名

データポイントとなったスパン名が割り当てられる．

**＊例＊**

- ```trace.web.request.<メトリクスサフィックス名>```
- ```trace.db.query.<メトリクスサフィックス名>```
- ```trace.db.commit.<メトリクスサフィックス名>```

#### ・メトリクスのメトリクスサフィックス名

メトリクスの種類に応じたサフィックス名が割り当てられる．

参考：https://docs.datadoghq.com/ja/tracing/guide/metrics_namespace/#%E3%83%A1%E3%83%88%E3%83%AA%E3%82%AF%E3%82%B9%E3%82%B5%E3%83%95%E3%82%A3%E3%83%83%E3%82%AF%E3%82%B9

**＊例＊**

- ```trace.<スパン名>.hits.*****```（該当スパンのヒット数）
- ```trace.<スパン名>.duration```（該当スパンの処理時間）
- ```trace.<スパン名>.duration.by.*****```（該当スパンの処理時間の割合）
- ```trace.<スパン名>.errors.*****```（該当スパンにおけるエラー数）

<br>

### エラートラッキング

#### ・仕組み

エントリす

参考：https://docs.datadoghq.com/tracing/error_tracking/#how-datadog-error-tracking-works

<br>

## 03. マイクロサービスの識別

### マイクロサービスタイプ

#### ・マイクロサービスタイプとは

トレーサによって，マイクロサービスは『Web』『DB』『Cache』『Cache』の4つに分類される．各マイクロサービスの```span.type```属性に割り当てられるタイプ名から自動的に割り振られる．タイプ名の種類については，以下のリンクを参考にせよ．

参考：

- https://github.com/DataDog/dd-trace-php/blob/master/src/api/Type.php
- https://docs.datadoghq.com/ja/tracing/visualization/services_list/#%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%97

<br>

### マイクロサービスのタグ

#### ・マイクロサービスのタグとは

トレーサによって，マイクロサービスにタグを追加できる．PHPトレーサの各インテグレーションのソースコードについては以下のリンクを参考にせよ．ソースコードから，PHPトレーサーがアプリケーションからどのように情報を抜き出し，分散トレースのタグの値を決定しているかがわかる．

参考：

- https://github.com/DataDog/dd-trace-php/tree/master/src/DDTrace/Integrations
- https://github.com/DataDog/dd-trace-php/blob/master/src/api/Tag.php
