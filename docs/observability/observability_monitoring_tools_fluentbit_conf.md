---
title: 【IT技術の知見】設定ファイル＠FluentBit
description: 設定ファイル＠FluentBitの知見を記録しています。
---

# 設定ファイル＠FluentBit

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. SERVICEセクション

### SERVICEとは

パイプライン全体の設定やファイルの読み出しを設定する。

各設定の頭文字は大文字とする。

**＊実装例＊**

```bash
[SERVICE]
    # バッファーに蓄えられた全てのログを宛先にアウトプットする間隔
    Flush 1
    # FluentBitのプロセスを終了する待機時間
    Grace 30
    # FluentBit自体のログレベル
    Log_Level info
    # 読み込まれるParsers Multilineファイルの名前
    Parsers_File parsers_multiline.conf
    # 読み込まれるStream Processorファイルの名前
    Streams_File stream_processor.conf
    # 監視ツール (Prometheys) で監視する場合は、有効化する
    Http_Server On
```

> - https://docs.fluentbit.io/manual/administration/configuring-fluent-bit/classic-mode/configuration-file#config_section
> - https://stackoverflow.com/questions/47735850/what-exactly-is-flushing

<br>

### 実行ログの確認

Log_Level値でFluentBitのログレベルを制御できる。

`debug`を割り当てると、FluentBitのログがより詳細になり、各セクションの設定値を確認できるようになる。

**＊実行ログ例＊**

```bash
Fluent Bit v1.8.6
* Copyright (C) 2019-2021 The Fluent Bit Authors
* Copyright (C) 2015-2018 Treasure Data
* Fluent Bit is a CNCF sub-project under the umbrella of Fluentd
* https://fluentbit.io

[2021/01/01 12:00:00] [ info] Configuration:
[2021/01/01 12:00:00] [ info]  flush time     | 1.000000 seconds
[2021/01/01 12:00:00] [ info]  grace          | 30 seconds
[2021/01/01 12:00:00] [ info]  daemon         | 0
[2021/01/01 12:00:00] [ info] ___________
[2021/01/01 12:00:00] [ info]  inputs:
[2021/01/01 12:00:00] [ info]      forward
[2021/01/01 12:00:00] [ info] ___________
[2021/01/01 12:00:00] [ info]  filters:
[2021/01/01 12:00:00] [ info]      stdout.0
[2021/01/01 12:00:00] [ info] ___________
[2021/01/01 12:00:00] [ info]  outputs:
[2021/01/01 12:00:00] [ info]      null.0
[2021/01/01 12:00:00] [ info] ___________
[2021/01/01 12:00:00] [ info]  collectors:
[2021/01/01 12:00:00] [ info] [engine] started (pid=1)
[2021/01/01 12:00:00] [debug] [engine] coroutine stack size: 24576 bytes (24.0K)
[2021/01/01 12:00:00] [debug] [storage] [cio stream] new stream registered: forward.0
[2021/01/01 12:00:00] [ info] [storage] version=1.1.1, initializing...
[2021/01/01 12:00:00] [ info] [storage] in-memory
[2021/01/01 12:00:00] [ info] [storage] normal synchronization mode, checksum disabled, max_chunks_up=128
[2021/01/01 12:00:00] [ info] [cmetrics] version=0.2.1
[2021/01/01 12:00:00] [debug] [in_fw] Listen='0.0.0.0' TCP_Port=24224
[2021/01/01 12:00:00] [ info] [input:forward:forward.0] listening on 0.0.0.0:24224
[2021/01/01 12:00:00] [debug] [null:null.0] created event channels: read=21 write=22
[2021/01/01 12:00:00] [debug] [router] match rule forward.0:null.0
[2021/01/01 12:00:00] [ info] [sp] stream processor started
```

<br>

## 02. INPUT

### INPUTとは

ログのパイプラインへのインプット方法を設定する。

![fluent-bit_input](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fluent-bit_input.png)

プラグインを使用して、ログのインプット方法を設定する。

コマンドの`-i`オプションでINPUT名を指定し、実行もできる。

```bash
Inputs
  cpu                     CPU Usage
  mem                     Memory Usage
  thermal                 Thermal
  kmsg                    Kernel Log Buffer
  proc                    Check Process health
  disk                    Diskstats
  systemd                 Systemd (Journal) reader
  netif                   Network Interface Usage
  docker                  Docker containers metrics
  docker_events           Docker events
  node_exporter_metrics   Node Exporter Metrics (Prometheus Compatible)
  fluentbit_metrics       Fluent Bit internal metrics
  tail                    Tail files
  dummy                   Generate dummy data
  head                    Head Input
  health                  Check TCP server health
  http                    HTTP
  collectd                collectd input plugin
  statsd                  StatsD input plugin
  serial                  Serial input
  stdin                   Standard Input
  syslog                  Syslog
  exec                    Exec Input
  tcp                     TCP
  mqtt                    MQTT, listen for Publish messages
  forward                 Fluentd in-forward
  random                  Random
```

> - https://docs.fluentbit.io/manual/concepts/data-pipeline/input
> - https://docs.fluentbit.io/manual/pipeline/inputs

<br>

### ビルトインのプラグイン

ビルトインのプラグインは、ソースコードから確認できる。

> - https://github.com/fluent/fluent-bit/blob/v2.1.4/CMakeLists.txt#L157-L275

<br>

### dummyプラグイン

#### ▼ dummyプラグインとは

ダミーの構造化ログをパイプラインにインプットする。

非構造化ログはインプットデータとして使用できない。

開発環境でパイプラインの動作を確認するために役立つ。

```yaml
{"message": "dummy"}
```

> - https://docs.fluentbit.io/manual/pipeline/inputs/dummy
> - https://docs.fluentbit.io/manual/local-testing/logging-pipeline

#### ▼ セットアップ

**＊実装例＊**

```bash
[INPUT]
    Name   dummy
    # ダミーJSON型データ
    Dummy  {"message":"dummy"}
```

#### ▼ コマンド

**＊例＊**

```bash
$ /fluent-bit/bin/fluent-bit -i dummy -o stdout
```

<br>

### fluentbit_metricsプラグイン

#### ▼ fluentbit_metricsプラグインとは

自身のメトリクスの元になるデータポイントを収集する。

合わせて、OUTPUTセクションでprometheus_exporterプラグインを使用し、Prometheusがリクエストを送信するためのエンドポイントを公開できる。

```bash
[SERVICE]
    flush           1
    log_level       info

[INPUT]
    name            fluentbit_metrics
    tag             internal_metrics
    # メトリクスの元になるデータポイントを作成する間隔
    # 間隔が短すぎると、メトリクスが重複してしまう (例：2秒)
    scrape_interval 5

[OUTPUT]
    name            prometheus_exporter
    match           internal_metrics
    # Prometheusからのリクエストを待ち受けるIPアドレス
    host            0.0.0.0
    # Prometheusからのリクエストを待ち受けるポート番号
    port            2021
```

> - https://docs.fluentbit.io/manual/pipeline/inputs/fluentbit-metrics

<br>

### forwardプラグイン

#### ▼ forwardプラグインとは

受信したログを指定されたポートで受信し、パイプラインにインプットする。

#### ▼ セットアップ

**＊実装例＊**

```bash
[INPUT]
    # プラグイン名
    Name        forward
    Listen      0.0.0.0
    # プロセスの受信ポート
```

**＊実行ログ例＊**

```bash
Fluent Bit v1.8.6
* Copyright (C) 2019-2021 The Fluent Bit Authors
* Copyright (C) 2015-2018 Treasure Data
* Fluent Bit is a CNCF sub-project under the umbrella of Fluentd
* https://fluentbit.io

[2021/01/01 12:00:00] [ info] [engine] started (pid=1)
[2021/01/01 12:00:00] [ info] [storage] version=1.1.1, initializing...
[2021/01/01 12:00:00] [ info] [storage] in-memory
[2021/01/01 12:00:00] [ info] [storage] normal synchronization mode, checksum disabled, max_chunks_up=128
[2021/01/01 12:00:00] [ info] [cmetrics] version=0.2.1
[2021/01/01 12:00:00] [ info] [input:forward:forward.0] listening on 0.0.0.0:24224
[2021/01/01 12:00:00] [ info] [sp] stream processor started
```

> - https://docs.fluentbit.io/manual/pipeline/inputs/forward

#### ▼ コマンド

**＊例＊**

```bash
$ /fluent-bit/bin/fluent-bit \
    -i forward \
    -o stdout
```

<br>

### kubernetes-eventsプラグイン

#### ▼ kubernetes-eventsプラグインとは

Kubernetesリソースのイベントをログとして収集する。

kubernetes-event-exporterの代わりに使用できる。

> - https://github.com/resmoio/kubernetes-event-exporter

#### ▼ セットアップ

**＊実装例＊**

```bash
[INPUT]
    # プラグイン名
    Name              kubernetes_events
    Tag               k8s_events
    # kube-apiserverのURL
    Kube_URL          https://kubernetes.default.svc
    Kube_CA_File      /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    Kube_Token_File   /var/run/secrets/kubernetes.io/serviceaccount/token
```

> - https://docs.fluentbit.io/manual/pipeline/inputs/kubernetes-events

<br>

### systemd

#### ▼ systemdプラグインとは

systemdのログを収集する。

```bash
[INPUT]
    Name systemd
    Tag host.*
    # kubeletのログを指定する
    Systemd_Filter _SYSTEMD_UNIT=kubelet.service
    Read_From_Tail On
```

<br>

### tailプラグイン

#### ▼ tailプラグインとは

指定したパスに継続的にアウトプットされるログファイルを順次結合し、パイプラインにインプットする。

あらかじめ、FluentBitコンテナ内にログファイルを配置する必要があり、`Path`でこれを指定する。

`v1.8`を境にオプションが変わっていることに注意する。

#### ▼ セットアップ

**＊実装例＊**

```bash
[INPUT]
    # プラグイン名
    Name              tail
    # FluentBitコンテナ内のログファイルの場所。ワイルドカードを使用できる。
    Path              /var/www/foo/storage/logs/*.log
    # 使用するパーサー名
    multiline.parser  laravel-multiline-parser
```

```yaml
log_router:
  container_name: fluent-bit
  build:
    dockerfile: ./docker/fluent-bit/Dockerfile
    context: .
  volumes:
    # アプリケーションのログファイルのボリュームマウント
    - ./storage/logs:/var/www/foo/storage/logs
```

> - https://docs.fluentbit.io/manual/pipeline/inputs/tail

**＊実装例＊**

```bash
[INPUT]
    Name tail
    # Nodeのコンテナのログ
    Path /var/log/containers/*.log
    multiline.parser docker, cri
    Tag kube.*
    Mem_Buf_Limit 5MB
    Skip_Long_Lines On
```

#### ▼ コマンド

**＊例＊**

```bash
$ fluent-bit \
    -i tail \
    -p path=/var/www/foo/storage/logs/*.log \
    -o stdout
```

**＊実行ログ例＊**

```bash
* Copyright (C) 2019-2021 The Fluent Bit Authors
* Copyright (C) 2015-2018 Treasure Data
* Fluent Bit is a CNCF sub-project under the umbrella of Fluentd
* https://fluentbit.io

[2021/01/01 12:00:00] [ info] [engine] started (pid=1)
[2021/01/01 12:00:00] [ info] [storage] version=1.1.1, initializing...
[2021/01/01 12:00:00] [ info] [storage] in-memory
[2021/01/01 12:00:00] [ info] [storage] normal synchronization mode, checksum disabled, max_chunks_up=128
[2021/01/01 12:00:00] [ info] [cmetrics] version=0.2.1
[2021/01/01 12:00:00] [ info] [sp] stream processor started
[2021/01/01 12:00:00] [ info] [input:tail:tail.0] inotify_fs_add(): inode=31621169 watch_fd=1 name=/var/www/foo/storage/logs/laravel.log
[0] tail.0: [1634640932.010306200, {"log"=>"[2021-01-01 12:00:00] local.INFO: メッセージ"}]
[1] tail.0: [1634640932.013139300, {"log"=>"[2021-01-01 12:00:00] local.INFO: メッセージ"}]
[2] tail.0: [1634640932.013147300, {"log"=>"[2021-01-01 12:00:00] local.INFO: メッセージ"}]
```

> - https://docs.fluentbit.io/manual/pipeline/inputs/tail#command-line

<br>

## 03. PARSER

### PARSERとは

非構造化ログを構造化ログに変換する。

![fluent-bit_parser](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fluent-bit_parser.png)

> - https://docs.fluentbit.io/manual/concepts/data-pipeline/parser

<br>

### 自前criプラグイン

#### ▼ 自前criプラグインとは

執筆時点 (2023/04/04) では、公式がcriプラグインを提供していない。

そこで、自前のcriプラグインを定義する。

自前criプラグインでは、Containerdのテキスト形式ログにマッチできるような正規表現を設定する。

Containerdのコンテナが作成する非構造化ログを構造化ログに変換する。

#### ▼ セットアップ

**＊実装例＊**

PARSERセクションで、criプラグインを定義する。

```bash
[PARSER]
    Name        cri
    Format      regex
    # Containerdのテキスト形式ログにマッチできるような正規表現
    Regex       ^(?<time>[^ ]+) (?<stream>stdout|stderr) (?<logtag>[^ ]*) (?<message>.*)$
    Time_Key    time
    Time_Format %Y-%m-%dT%H:%M:%S.%L%z
```

INPUTセクションでcriプラグインを読み込む。

```bash
[INPUT]
    Name            tail
    Path            /var/log/containers/*.log
    Parser          cri
    Tag             kube.*
    Mem_Buf_Limit   5MB
    Skip_Long_Lines On
```

例えば、以下のような非構造化ログがあったとする。

criプラグインは、`<timeキー> <streamキー> <logtagキー> <messageキー>`を認識する。

```bash
2021-12-17T08:03:23.918838346+09:00 stderr F 2021/12/17 08:03:23 [INFO] start worker processes
```

その場合、構造化されて以下のようなログとなる。

```yaml
{
  "time": "2021-12-17T08:03:23.918838346+09:00",
  "record":
    {
      "stream": "stderr",
      "logtag": "F",
      "message": "2021/12/17 08:03:23 [INFO] start worker processes",
      "time": "2021-12-17T08:03:23.918838346+09:00",
    },
}
```

> - https://docs.fluentbit.io/manual/installation/kubernetes#container-runtime-interface-cri-parser

<br>

## 04. FILTER

### FILTERとは

ログのキーや値を加工する。

![fluent-bit_filter](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fluent-bit_filter.png)

> - https://docs.fluentbit.io/manual/concepts/data-pipeline/filter
> - https://docs.fluentbit.io/manual/concepts/key-concepts#filtering

<br>

### ビルトインのプラグイン

ビルトインのプラグインは、ソースコードから確認できる。

> - https://github.com/fluent/fluent-bit/blob/v2.1.4/CMakeLists.txt#L157-L275

<br>

### grepプラグイン

#### ▼ grepプラグインとは

ログが構造化ログの場合、条件にマッチしたログのみを取得する。

> - https://docs.fluentbit.io/manual/pipeline/filters/grep

#### ▼ セットアップ

```bash
[FILTER]
    name   grep
    match  *
    regex  log foo
```

<br>

### kubernetes

```bash
[FILTER]
    Name kubernetes
    Match kube.*
    Merge_Log On
    Keep_Log Off
    K8S-Logging.Parser On
    K8S-Logging.Exclude On
```

<br>

### modify

#### ▼ modifyプラグインとは

ログが構造化ログの場合、ログの構造を変更する。

#### ▼ セットアップ

変更前の構造化ログが以下だとする。

```bash
[0] memory: [1488543156, {"Mem.total"=>1016044, "Mem.used"=>841388, "Mem.free"=>174656, "Swap.total"=>2064380, "Swap.used"=>139888, "Swap.free"=>1924492}]
...
```

FILTERセクションで、modifyプラグインを定義する。

```bash
[INPUT]
    Name mem
    Tag  mem.local

[OUTPUT]
    Name  stdout
    Match *

[FILTER]
    Name modify
    Match *

    # キーとその値を構造化ログに追加する。
    Add Service1 SOMEVALUE
    Add Service3 SOMEVALUE3
    Add Mem.total2 TOTALMEM2
    Add Mem.total TOTALMEM

    # マッチしたキー名を変更する。
    Rename Mem.free MEMFREE
    Rename Mem.used MEMUSED
    Rename Swap.total SWAPTOTAL
```

以下の構造化ログに変更される。

```bash
[2018/04/06 01:35:13] [ info] [engine] started
[0] mem.local: [1522980610.006892802, {"Mem.total"=>4050908, "MEMUSED"=>738100, "MEMFREE"=>3312808, "SWAPTOTAL"=>1046524, "Swap.used"=>0, "Swap.free"=>1046524, "Service1"=>"SOMEVALUE", "Service3"=>"SOMEVALUE3", "Mem.total2"=>"TOTALMEM2"}]
...
```

> - https://docs.fluentbit.io/manual/pipeline/filters/modify#configuration-file

<br>

### modifyプラグイン

#### ▼ modifyプラグインとは

ログが構造化ログの場合、キーや値の追加/コピー/変更/削除を実行する。

#### ▼ セットアップ

```bash
[FILTER]
    Name            modify
    Match           *
    # 追加するキーと値
    Add             filter_type modify
    # コピーするキーと値
    Copy            copied_key copied_value
    # 変更するキーと値
    Set             updated_key updated_value
    # 削除するキー
    Remove          deleted_key
    # 削除対象キーの最初の文字 (前方一致) 。
    # もしこれ以外の文字列で始まる場合は、削除の非対象とする。
    Remove_wildcard ignored_key
```

> - https://docs.fluentbit.io/manual/pipeline/filters/modify
> - https://kazuhira-r.hatenablog.com/entry/2020/08/16/225251

<br>

### multilineプラグイン

#### ▼ multilineプラグインとは

マッチした複数行のログを結合する。

結合ルールは、MULTILINE_PARSERの設定ファイルに定義し、これをSERVICEで読み込む必要がある。

ただし、本番環境ではログが複数行にならないようにアプリケーション側で実装を行い、ログを収集して可視化する段階でフィルタリングできれば問題ない、という考え方もある。

> - https://qiita.com/roundrop@github/items/8989b7f29d70f618e503

#### ▼ セットアップ

```bash
[SERVICE]
    # 読み込むファイル
    Parsers_File parsers_multiline.conf

[FILTER]
    # プラグイン名
    name                  multiline
    # マッチさせるログ
    match                 *
    multiline.key_content log
    # 使用するパーサー名
    multiline.parser      laravel
```

コマンドの`-f`オプションでFILTER名を指定し、実行もできる。

```bash
Filters
  alter_size              Alter incoming chunk size
  aws                     Add AWS Metadata
  checklist               Check records and flag them
  record_modifier         modify record
  throttle                Throttle messages using sliding window algorithm
  kubernetes              Filter to append Kubernetes metadata
  modify                  modify records by applying rules
  multiline               Concatenate multiline messages
  nest                    nest events by specified field values
  parser                  Parse events
  expect                  Validate expected keys and values
  grep                    grep events by specified field values
  rewrite_tag             Rewrite records tags
  lua                     Lua Scripting Filter
  stdout                  Filter events to STDOUT
  geoip2                  add geoip information to records
```

> - https://docs.fluentbit.io/manual/pipeline/filters/multiline-stacktrace

#### ▼ MULTILINE_PARSER

複数行のログを結合するためのルールを設定する。

ここで定義したパーサー名を、multilineプラグインで指定する必要がある。

**＊実装例＊**

Laravelのスタックトレースを結合する。

```bash
[MULTILINE_PARSER]
    # パーサー名
    name          laravel
    # パーサータイプ
    type          regex
    # フラッシュ時間
    flush_timeout 1000

    # パーサールール。スタックトレースの文頭をstart_state、また以降に結合する文字列をcontで指定する。
    # 開始地点
    # [%Y-%m-%d %H:%M:%S] をスタックトレースの開始地点とする。
    rule          "start_state" "/\[[12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\s+([01]?\d|2[0-3]):([0-5]\d):([0-5]\d)\].*/" "cont"

    # スタックトレース
    # [stacktrace]、[previous exception]、#、行間、"} 、で始まる文字列の場合に結合する。
    rule          "cont" "/(\[(stacktrace|previous exception)\]|#|\n\n|"\}).*/" "cont"

    # アプリケーション独自仕様のログ
    rule          "cont" "/・.*/" "cont"
```

> - https://docs.fluentbit.io/manual/administration/configuring-fluent-bit/multiline-parsing

<br>

### parserプラグイン

#### ▼ parserプラグインとは

マッチしたログを解析し、正規表現の名前付きキャプチャ機能 (`?<foo>`) を使用して新しいキーに文字列を抽出する。

> - https://docs.fluentbit.io/manual/pipeline/filters/parser
> - https://docs.fluentbit.io/manual/v/1.0/parser/regular_expression

FluentBitでの名前付きキャプチャについては、Fluentdのドキュメントを参考にせよ。

> - https://docs.fluentd.org/parser/regexp

#### ▼ バリデーション

FluentBitは、内部的にはruby製関数を使用して正規表現を検証している。

そのため、これを確認できるバリデーションツールを使用する。

> - http://rubular.com/

代わりに、Fluentdの正規表現チェッカーでも良い。

> - http://fluentular.herokuapp.com/

#### ▼ セットアップ

> - https://docs.fluentbit.io/manual/pipeline/filters/parser

<br>

### stdoutプラグイン

#### ▼ stdoutプラグインとは

マッチしたログを、OUTPUTを経ずにそのまま標準出力に出力する。

FILTERまでのパイプラインが正しく動作しているかのデバッグとして役立つ。

> - https://docs.fluentbit.io/manual/pipeline/filters/standard-output

#### ▼ セットアップ

```bash
[FILTER]
    # プラグイン名
    Name  stdout
    Match *
```

#### ▼ コマンド

**＊例＊**

```bash
$ /fluent-bit/bin/fluent-bit \
    -i <インプット名> \
    -F stdout \
    -m "*" \
    -o null
```

**＊実行ログ例＊**

```bash
Fluent Bit v1.8.6
* Copyright (C) 2019-2021 The Fluent Bit Authors
* Copyright (C) 2015-2018 Treasure Data
* Fluent Bit is a CNCF sub-project under the umbrella of Fluentd
* https://fluentbit.io

[2021/01/01 06:18:52] [ info] [engine] started (pid=40)
[2021/01/01 06:18:52] [ info] [storage] version=1.1.1, initializing...
[2021/01/01 06:18:52] [ info] [storage] in-memory
[2021/01/01 06:18:52] [ info] [storage] normal synchronization mode, checksum disabled, max_chunks_up=128
[2021/01/01 06:18:52] [ info] [cmetrics] version=0.2.1
[2021/01/01 06:18:52] [ info] [sp] stream processor started
[0] cpu.0: [1634710733.114477665, {"cpu_p"=>0.166667, "user_p"=>0.000000, "system_p"=>0.166667, "cpu0.p_cpu"=>0.000000, "cpu0.p_user"=>0.000000, "cpu0.p_system"=>0.000000, "cpu1.p_cpu"=>1.000000, "cpu1.p_user"=>0.000000, "cpu1.p_system"=>1.000000, "cpu2.p_cpu"=>0.000000, "cpu2.p_user"=>0.000000, "cpu2.p_system"=>0.000000, "cpu3.p_cpu"=>0.000000, "cpu3.p_user"=>0.000000, "cpu3.p_system"=>0.000000, "cpu4.p_cpu"=>0.000000, "cpu4.p_user"=>0.000000, "cpu4.p_system"=>0.000000, "cpu5.p_cpu"=>0.000000, "cpu5.p_user"=>0.000000, "cpu5.p_system"=>0.000000}]
[0] cpu.0: [1634710734.115201385, {"cpu_p"=>0.333333, "user_p"=>0.166667, "system_p"=>0.166667, "cpu0.p_cpu"=>0.000000, "cpu0.p_user"=>0.000000, "cpu0.p_system"=>0.000000, "cpu1.p_cpu"=>0.000000, "cpu1.p_user"=>0.000000, "cpu1.p_system"=>0.000000, "cpu2.p_cpu"=>0.000000, "cpu2.p_user"=>0.000000, "cpu2.p_system"=>0.000000, "cpu3.p_cpu"=>0.000000, "cpu3.p_user"=>0.000000, "cpu3.p_system"=>0.000000, "cpu4.p_cpu"=>0.000000, "cpu4.p_user"=>0.000000, "cpu4.p_system"=>0.000000, "cpu5.p_cpu"=>0.000000, "cpu5.p_user"=>0.000000, "cpu5.p_system"=>0.000000}]
[0] cpu.0: [1634710735.114646610, {"cpu_p"=>1.500000, "user_p"=>0.666667, "system_p"=>0.833333, "cpu0.p_cpu"=>0.000000, "cpu0.p_user"=>0.000000, "cpu0.p_system"=>0.000000, "cpu1.p_cpu"=>3.000000, "cpu1.p_user"=>2.000000, "cpu1.p_system"=>1.000000, "cpu2.p_cpu"=>2.000000, "cpu2.p_user"=>1.000000, "cpu2.p_system"=>1.000000, "cpu3.p_cpu"=>1.000000, "cpu3.p_user"=>0.000000, "cpu3.p_system"=>1.000000, "cpu4.p_cpu"=>1.000000, "cpu4.p_user"=>0.000000, "cpu4.p_system"=>1.000000, "cpu5.p_cpu"=>2.000000, "cpu5.p_user"=>1.000000, "cpu5.p_system"=>1.000000}]
```

<br>

## 05. STREAM_TASK

### STREAM_TASKとは

現在のデータストリームからログを抽出し、新しいストリームを作成する。

このストリームは、パイプラインのINPUTに再び取り込まれ、処理し直される。

同時に、SERVICEでSTREAM_TASKの設定ファイルを読み込む必要がある。

```bash
[SERVICE]
    Streams_File stream_processor.conf
```

![fluent-bit_stream-task](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fluent-bit_stream-task.png)

> - https://docs.fluentbit.io/manual/stream-processing/overview#stream-processor

<br>

### SQLステートメント

#### ▼ SQLステートメントとは

STREAM_TASKセッションは、ユーザー定義のSQLステートメントで定義される。

> - https://github.com/fluent/fluent-bit/tree/master/src/stream_processor

#### ▼ CREATE STREAM

SELECTステートメントの結果を使用して、データストリームを作成する。

**＊実装例＊**

```bash
[STREAM_TASK]
    Name foo-stream-task
    # SELECT句の結果からfooデータストリームを作成する。
    Exec CREATE STREAM foo AS SELECT * FROM TAG:'foo';

[STREAM_TASK]
    Name bar-stream-task
    # SELECT句の結果に、WITH句でbarタグを付与し、barデータストリームを作成する。
    Exec CREATE STREAM bar WITH (tag='bar') AS SELECT * FROM TAG:'bar';
```

> - https://docs.fluentbit.io/manual/stream-processing/getting-started/fluent-bit-sql#create-stream-statement
> - https://docs.fluentbit.io/manual/v/1.3/configuration/stream_processor#configuration-example

#### ▼ SELECT

マッチしたログから、指定したキーを抽出する。

**＊実装例＊**

タグが`*-bar-*` (ワイルドカード指定) であるログのうち、`container_name`キーの値が`qux`であるもののみをフィルタリングし、これの`log`キーを抽出する。

```bash
SELECT log FROM TAG:'*-foo-*' WHERE container_name = 'qux';
```

```bash
# 本来、改行はないが、わかりやすいように改行している。
# <コンテナ名>-foo-<AWS ECSタスクID>
[0] foo-bar-baz: [
    {
        "log"=>"127.0.0.1 -  01/01/2022:0:00:00 +0000 "GET /index.php" 200",
        "container_name"=>"qux",
    }
]
```

> - https://docs.fluentbit.io/manual/stream-processing/getting-started/fluent-bit-sql#select-statement

<br>

## 06. BUFFER

### BUFFERとは

ログを蓄え、またこれを順番にROUTINGに渡す。

![fluent-bit_buffer](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fluent-bit_buffer.png)

> - https://docs.fluentbit.io/manual/concepts/data-pipeline/buffer
> - https://docs.fluentbit.io/manual/administration/buffering-and-storage

<br>

### SERVICEから

<br>

### INPUTから

#### ▼ storage.type

バッファーとして使用する媒体を設定する。

**＊実装例＊**

メモリ上でバッファリングを実行する。

デフォルト値である。

```bash
[SERVICE]
    flush         1
    log_Level     info

[INPUT]
    name          cpu
    # メモリ上でバッファリングが実行される (デフォルト値) 。
    storage.type  memory
```

> - https://docs.fluentbit.io/manual/administration/buffering-and-storage#input-section-configuration

**＊実装例＊**

ファイル上でバッファリングを実行する。

```bash
[SERVICE]
    flush         1
    log_Level     info
    # ファイルの場所
    storage.path  /var/log/fluent-bit/

[INPUT]
    name          cpu
    # ファイル上でバッファリングが実行される。
    storage.type  filesystem
```

指定した場所に`cpu.0`ディレクトリや`tail.0`ディレクトリが作成され、`.flb`ファイルとしてバッファリングが実行される。

```bash
$ ls -ls /var/log/fluent-bit/cpu.0

drwxr-xr-x.  2 root root     107  9月 13 20:45 .
drwxr-xr-x. 11 root root     150  9月 13 20:42 ..
-rw-------.  1 root root 1492587  9月 13 20:44 *-*.*.flb
-rw-------.  1 root root  819079  9月 13 20:44 *-*.*.flb
-rw-------.  1 root root    4096  9月 13 20:45 *-*.*.flb
...
```

> - https://docs.fluentbit.io/manual/administration/buffering-and-storage#input-section-configuration

<br>

### OUTPUTから

記入中...

<br>

## 07. ROUTING、OUTPUT

### ROUTING、OUTPUTとは

ログのアウトプット先を設定する。

設定できるアウトプット先の種類については、以下のリンクを参考にせよ。

コマンドの`-o`オプションでOUTPUT名を指定し、実行もできる。

![fluent-bit_output](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/fluent-bit_output.png)

```bash
Outputs
  azure                   Send events to Azure HTTP Event Collector
  azure_blob              Azure Blob Storage
  bigquery                Send events to BigQuery via streaming insert
  counter                 Records counter
  datadog                 Send events to DataDog HTTP Event Collector
  es                      Elasticsearch
  exit                    Exit after a number of flushes (test purposes)
  file                    Generate log file
  forward                 Forward (Fluentd protocol)
  http                    HTTP Output
  influxdb                InfluxDB Time Series
  logdna                  LogDNA
  loki                    Loki
  kafka                   Kafka
  kafka-rest              Kafka REST Proxy
  nats                    NATS Server
  nrlogs                  New Relic
  null                    Throws away events
  plot                    Generate data file for GNU Plot
  slack                   Send events to a Slack channel
  splunk                  Send events to Splunk HTTP Event Collector
  stackdriver             Send events to Google Stackdriver Logging # 現在は、Google Google Cloud Loggingに改名
  stdout                  Prints events to STDOUT
  syslog                  Syslog
  tcp                     TCP Output
  td                      Treasure Data
  flowcounter             FlowCounter
  gelf                    GELF Output
  websocket               Websocket
  cloudwatch_logs         Send logs to Amazon AWS CloudWatch
  kinesis_firehose        Send logs to Amazon Kinesis Firehose
  kinesis_streams         Send logs to Amazon Kinesis Streams
  prometheus_exporter     Prometheus Exporter
  prometheus_remote_write Prometheus remote write
  s3                      Send to S3
```

> - https://docs.fluentbit.io/manual/concepts/data-pipeline/output
> - https://docs.fluentbit.io/manual/concepts/data-pipeline/router

<br>

### ビルトインのプラグイン

ビルトインのプラグインは、ソースコードから確認できる。

> - https://github.com/fluent/fluent-bit/blob/v2.1.4/CMakeLists.txt#L157-L275

<br>

### AWS全部入り

#### ▼ AWS全部入り

全てのAWS系プラグインを含んでいる

#### ▼ セットアップ

AWSから提供される他の全てのFluentBitイメージを束ねたベースイメージを使用する。

> - https://github.com/aws/aws-for-fluent-bit

<br>

### cloudwatch_logプラグイン (新cloudwatchプラグイン)

#### ▼ cloudwatch_logプラグインとは

ログをAWS CloudWatch Logsにルーティングする。

元々、『cloudwatchプラグイン』という名前だった。

> - https://dev.classmethod.jp/articles/fluent-bit-used-cloudwatch-logs-new-plugin/#toc-4

#### ▼ セットアップ

cloudwatch_logsプラグインがプリインストールされているベースイメージを使用する。

> - https://github.com/aws/amazon-cloudwatch-logs-for-fluent-bit

設定ファイルに予約されたAWS変数については、以下のリンクを参考にせよ。

> - https://github.com/aws/amazon-cloudwatch-logs-for-fluent-bit#templating-log-group-and-stream-names

```bash
# ---------------------------------------------
# AWS CloudWatch Logsへのルーティング
# ---------------------------------------------
[OUTPUT]
    # プラグイン名
    Name              cloudwatch_logs
    # ログのうちで、宛先にルーティングするログのタグ
    Match             laravel
    # ログのうちで、宛先にルーティングするキー名
    log_key           log
    region            ap-northeast-1
    # 予約変数あり。
    log_group_name    /prd-foo-ecs-container/laravel/log
    # ログストリーム名。予約変数あり。AWS ECSタスクIDなどアウトプットできる。
    log_stream_name   container/laravel/$(ecs_task_id)
    # ログを特定のAWSアカウントで中央集中的に管理する場合に、IAMロールを設定する。
    role_arn          arn:aws:iam::<AWSアカウントID>:role/prd-foo-flunetbit-role

[OUTPUT]
    Name              cloudwatch_logs
    Match             nginx
    log_key           log
    region            ap-northeast-1
    log_group_name    /prd-foo-ecs-container/nginx/log
    log_stream_name   container/nginx/$(ecs_task_id)
    # ログを特定のAWSアカウントで中央集中的に管理する場合に、IAMロールを設定する。
    role_arn          arn:aws:iam::<AWSアカウントID>:role/prd-foo-flunetbit-role
```

AWS CloudWatch Logsに送信されるデータはJSON型である。

`log`キーにログが割り当てられている。

特定のキーの値のみをAWS CloudWatch Logsに送信する場合、log_keyオプションでキー名を設定する。

例えば、`log`キーのみを送信する場合、『`log`』と設定する。

```yaml
{
  "container_id": "*****",
  "container_name": "foo",
  "ecs_cluster": "prd-foo-ecs-cluster",
  "ecs_task_arn": "arn:aws:ecs:ap-northeast-1:<AWSアカウントID>:task/cluster-name/*****",
  "ecs_task_definition": "prd-foo-ecs-task-definition:1",
  "log": "<ログ>",
  "source": "stdout",
  "ver": "1.5",
}
```

> - https://blog.msysh.me/posts/2020/07/split_logs_into_multiple_target_with_firelens_and_rewrite_tag.html

<br>

### datadogプラグイン

#### ▼ datadogプラグインとは

ログをdatadogプラグインにルーティングする。

#### ▼ セットアップ

全てのベースイメージにdatadogプラグインがプリインストールされているため、datadogプラグインのインストールは不要である。

```bash
# ---------------------------------------------
# Datadogへのルーティング
# ---------------------------------------------
[OUTPUT]
    # プラグイン名
    Name              datadog
    # ログのうちで、宛先にルーティングするログのタグ
    Match             laravel
    # ルーティング先ホスト
    Host              http-intake.logs.datadoghq.com
    TLS               on
    compress          gzip
    # DatadogのAPIキー。
    apikey            *****
    # DatadogログエクスプローラーにおけるService名
    dd_service        prd-foo
    # DatadogログエクスプローラーにおけるSource名
    dd_source         prd-foo
    dd_message_key    log
    # 追加タグ
    dd_tags           env:prd-foo

[OUTPUT]
    Name              datadog
    Match             nginx
    Host              http-intake.logs.datadoghq.com
    TLS               on
    compress          gzip
    apikey            *****
    dd_service        prd-foo
    dd_source         prd-foo
    dd_message_key    log
    dd_tags           env:prd-foo
```

> - https://github.com/DataDog/fluent-plugin-datadog

<br>

### kinesis_firehoseプラグイン

#### ▼ kinesis_firehoseプラグインとは

ログをKinesisFirehoseにルーティングする。

kinesis_firehoseプラグインがプリインストールされているベースイメージを使用する。

> - https://github.com/aws/amazon-kinesis-firehose-for-fluent-bit

<br>

### kinesis_streamsプラグイン

#### ▼ kinesis_streamsプラグインとは

ログをKinesisStreamsにルーティングする。

kinesis_streamsプラグインがプリインストールされているベースイメージを使用する。

> - https://github.com/aws/amazon-kinesis-streams-for-fluent-bit

<br>

### lokiプラグイン

Grafana Lokiにログを送信する。

```bash
[OUTPUT]
  Name loki
  Match kube.*
  # Grafana LokiのURLを指定する
  Host grafana-loki.grafana-loki.svc.cluster.local
  Port 3100
```

<br>

### newRelicプラグイン

#### ▼ newRelicプラグインとは

ログをNewRelicにルーティングする。

#### ▼ セットアップ

newRelicプラグインがプリインストールされているベースイメージを使用する。

> - https://github.com/newrelic/newrelic-fluent-bit-output

<br>

### nullプラグイン

#### ▼ nullプラグインとは

アウトプットを破棄する。

**＊実装例＊**

```bash
[OUTPUT]
    Name   null
    match  *
```

#### ▼ コマンド

**＊例＊**

```bash
$ /fluent-bit/bin/fluent-bit \
    -i <インプット名> \
    -F stdout \
    -m "*" \
    -o null
```

> - https://docs.fluentbit.io/manual/pipeline/outputs/null

<br>

### stackdriverプラグイン

#### ▼ stackdriverプラグインとは

ログをGoogle Cloud Loggingにルーティングする。

#### ▼ セットアップ

stackdriverプラグインはビルトインプラグインである。

つまり、特に追加のセットアップなくGoogle Cloud Loggingにログをルーティングできる。

```bash
[OUTPUT]
    Name   stackdriver
    match  *
```

> - https://docs.fluentbit.io/manual/pipeline/outputs/stackdriver
> - https://qiita.com/suzuyui/items/2217a357099130fc7236#stackdriver-output-plugin

<br>

### stdoutプラグイン

#### ▼ stdoutプラグインとは

標準出力にアウトプットする、FluentBitの実行ログに混じって、対象のログがアウトプットされることになる。

```bash
[OUTPUT]
    Name   stdout
    match  *
```

<br>
