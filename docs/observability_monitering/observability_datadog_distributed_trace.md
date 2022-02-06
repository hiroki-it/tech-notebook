---
title: 【知見を記録するサイト】分散トレース収集＠Datadog
description: 分散トレース収集＠Datadogの知見をまとめました．
---

# 分散トレース収集＠Datadog

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. サーバーの分散トレース収集

### サーバーdatadogエージェント

常駐プログラムであり，アプリケーションから分散トレースを収集し，Datadogに転送する．

参考：https://www.netone.co.jp/knowledge-center/netone-blog/20210716-1/

![datadog-agent_on-server](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/datadog-agent_on-server.png)

<br>

### セットアップ

#### ・インストール

用いているOSやIaCツールごとに，インストール方法が異なる．

参考：https://app.datadoghq.com/account/settings#agent

<br>

## 02. コンテナの分散トレース収集（AWSの場合）

### コンテナdatadogエージェント

常駐プログラムであり，アプリケーションから送信された分散トレースを，Datadogに転送する．サーバーの場合とは異なり，自身が収集しにいくことはできない．仕組みとして，アプリケーションコンテナのトレースライブラリは分散トレースを生成し，Datadogコンテナの『```http://localhost:8126```』にこれを送信する．Datadogコンテナ内のdatadogエージェントはこれをHTTPSでDatadogに転送する．

参考：

- https://docs.datadoghq.com/ja/tracing/#datadog-%E3%81%B8%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B9%E3%82%92%E9%80%81%E4%BF%A1
- https://inokara.hateblo.jp/entry/2017/10/01/164446

![datadog-tracer](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/datadog-tracer.png)

<br>

## 03. トレーサー

### パッケージ一覧

参考：https://docs.datadoghq.com/ja/developers/libraries/#apm-%E3%81%A8%E5%88%86%E6%95%A3%E5%9E%8B%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%B3%E3%82%B0%E3%82%AF%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%B3%E3%83%88%E3%83%A9%E3%82%A4%E3%83%96%E3%83%A9%E3%83%AA

<br>

### デバッグ

#### ・起動ログの有効化

環境変数の```DD_TRACE_STARTUP_LOGS```を有効化することで，起動ログを標準出力に出力できるようにする．起動ログから，トレーサーの設定値を確認できる．

参考：https://docs.datadoghq.com/tracing/troubleshooting/#troubleshooting-data-requested-by-datadog-support

#### ・デバッグログの有効化

各トレーサーが持つデバッグパラメーターを有効化することで，デバッグログを標準出力に出力できるようにする．デバッグログから，実際にDatadogに送信されるスパンデータを確認できる．

参考：https://docs.datadoghq.com/tracing/troubleshooting/#troubleshooting-data-requested-by-datad

#### ・Agent Flareコマンドの実行

Datadogコンテナ内でAgent Flareコマンドを実行し，DatadogサポートにDatadogコンテナの構成情報をメール送信する．

参考：

- https://docs.datadoghq.com/tracing/troubleshooting/#troubleshooting-data-requested-by-datad
- https://docs.datadoghq.com/agent/troubleshooting/send_a_flare/?tab=agentv6v7

<br>

## 03-02. PHPトレーサー

### セットアップ

#### ・インストール（サーバーの場合）

用いているミドルウェアごとに，インストール方法が異なる．

参考：

- https://docs.datadoghq.com/ja/tracing/setup/php/
- https://app.datadoghq.com/apm/docs?architecture=host-based&framework=php-fpm&language=php

#### ・インストール（コンテナの場合）

アプリケーションコンテナのDockerfileにて，PHPトレーサーをインストールする．

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

アプリケーションが，インストールされたパッケージを読み込んだか否かをコマンドで確認できる．

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

#### ・起動ログの確認

トレーサーの起動ログは，```php --ri=ddtrace```コマンドまたは```phpinfo```メソッドの結果から確認できる．

参考：https://docs.datadoghq.com/tracing/troubleshooting/tracer_startup_logs/

```bash
$ php --ri=ddtrace

Datadog tracing support => enabled
Version => 0.57.0
DATADOG TRACER CONFIGURATION => { ..... } # <--- ここに設定のJSONが得られる

# 得られたJSONを整形している
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

### 環境変数

#### ・種類

環境変数を使用できる．分散トレースのタグ名に反映される．環境変数については，以下のリンクを参考にせよ．

参考：https://docs.datadoghq.com/ja/tracing/setup_overview/setup/php/?tab=%E3%82%B3%E3%83%B3%E3%83%86%E3%83%8A#%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0%E3%82%B3%E3%83%B3%E3%83%95%E3%82%A3%E3%82%AE%E3%83%A5%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3

| 変数名                                        | 説明                                                         | 画面                                   |
| --------------------------------------------- | ------------------------------------------------------------ | -------------------------------------- |
| ```DD_SERVICE_MAPPING```                      | 分散トレースにマイクロサービス名を設定する．マイクロサービス名はデフォルトのインテグレーション名になるが，これを上書きできる<br>（例）```laravel:foo-laravel,pdo:foo-pdo``` | https://app.datadoghq.com/apm/services |
| ```DD_SERVICE_NAME```                         | 分散トレースにマイクロサービス名を設定する．```DD_SERVICE_MAPPING```がnullの場合，この環境変数の値が代わりにマイクロサービス名になる（仕組みがよくわからん）． |                                        |
| ```DD_TRACE_<インテグレーション名>_ENABLED``` | 有効化するインテグレーション名を設定する．デフォルトで全てのインテグレーションが有効化されているため，設定は不要である．Datadogのインテグレーションを無効化する場合は |                                        |
| ```DD_<インテグレーション名>_DISABLED```      | 無効化するインテグレーション名を設定する．                   |                                        |

<br>

## 03-03. Node.jsトレーサー

### セットアップ

#### ・インストール

TypeScriptやモジュールバンドルを使っている場合，パッケージの読み込み処理が巻き上げられ，意図しない読み込みの順番になってしまうことがある．対策として，```dd-trace```パッケージの```init```メソッドの実行をを別ファイルに分割し，これをエントリーポイント（```nuxt.config.js```ファイル）で読み込むようにする．

参考：https://docs.datadoghq.com/ja/tracing/setup_overview/setup/nodejs/?tab=%E3%82%B3%E3%83%B3%E3%83%86%E3%83%8A#typescript-%E3%81%A8%E3%83%90%E3%83%B3%E3%83%89%E3%83%A9%E3%83%BC


```javascript
import tracer from 'dd-trace'

tracer.init({
  env: DD_ENV,
  service: DD_SERVICE + '-ssr',
  version: DD_VERSION,
    
  // 検証時のオプション
  debug: true,
  startupLogs: true,
})

export default tracer
```

```javascript
import './datadog/tracer'
import { Configuration } from '@nuxt/types'
```

#### ・起動ログの確認

トレーサーの起動ログは，```init```メソッドの```startupLogs```オプションを有効化すると確認できる．

```bash
DATADOG TRACER CONFIGURATION -
{
    "date": "2022-01-02T00:00:00.541Z",
    "os_name": "Darwin",
    "os_version": "20.6.0",
    "architecture": "arm64",
    "version": "2.0.1",
    "lang": "nodejs",
    "lang_version": "14.18.2",
    "env": "prd",
    "service": "foo",
    "agent_url": "http://127.0.0.1:8126",
    "agent_error": "Network error trying to reach the agent: socket hang up",
    "debug": false,
    "sample_rate": 1,
    "sampling_rules": [],
    "tags": {
        "service": "foo",
        "env": "prd",
        "version": "1.0.0",
        "runtime-id": "*****"
    },
    "dd_version": "1.0.0",
    "log_injection_enabled": false,
    "runtime_metrics_enabled": false,
    "profiling_enabled": false,
    "integrations_loaded": [
        "connect@3.7.0",
        "fs",
        "http",
        "https"
    ],
    "appsec_enabled": false
}

WARN  DATADOG TRACER DIAGNOSTIC - Agent Error: Network error trying to reach the agent: socket hang up 
```

<br>

### 環境変数

初期化時に環境変数を設定できる．APMのマイクロサービスのタグ名に反映される．

参考：https://docs.datadoghq.com/ja/tracing/setup_overview/setup/nodejs/?tab=%E3%82%B3%E3%83%B3%E3%83%86%E3%83%8A#%E3%82%B3%E3%83%B3%E3%83%95%E3%82%A3%E3%82%AE%E3%83%A5%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3

<br>

## 04. 分散トレースの生成

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

## 05. マイクロサービスの識別

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
