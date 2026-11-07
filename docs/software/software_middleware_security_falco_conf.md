---
title: 【IT技術の知見】設定ファイル＠Falco
description: 設定ファイル＠Falcoの知見を記録しています。
---

# 設定ファイル＠Falco

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. セットアップ

### インストール

#### ▼ チャートとして

チャートリポジトリからチャートをインストールし、Kubernetes リソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://falcosecurity.github.io/charts

$ helm repo update

$ kubectl create namespace falco

$ helm install <Helmリリース名> <チャートリポジトリ名>/falco -n falco --version <バージョンタグ>
```

> - [An Introduction to Kubernetes Security using Falco \| Falco](https://falco.org/blog/intro-k8s-security-monitoring/#setting-falco-up-on-kubernetes)

<br>

## 02. 設定ファイル

### 設定ファイルの例

> - [falco/falco.yaml at master · falcosecurity/falco · GitHub](https://github.com/falcosecurity/falco/blob/master/falco.yaml)

<br>

### rules_file

切り分けて定義した Falco の設定ファイルを設定する。

```yaml
rules_file:
  # デフォルトのルールを定義したファイル
  - /etc/falco/falco_rules.yaml
  # ユーザー定義のルールを定義したファイル
  - /etc/falco/falco_rules.local.yaml
  - /etc/falco/rules.d
```

> - https://github.com/falcosecurity/falco/tree/master/rules
> - [Falcoを利用したPod内実行コマンドのログ取得 #kubernetes - Qiita](https://qiita.com/EnKUMA/items/d03f0621a631a0a220cc#falco%E3%81%AE%E3%83%AB%E3%83%BC%E3%83%AB%E4%BD%9C%E6%88%90)

<br>

### plugins

Falco の拡張プラグインを設定する。

```yaml
plugins:
  - name: k8saudit
    library_path: libk8saudit.so
    init_config: null
    open_params: "http://:9765/k8s-audit"
  - name: cloudtrail
    library_path: libcloudtrail.so
  - name: json
    library_path: libjson.so
```

<br>

### load_plugins

plugins で定義したプラグインのうち、実際に読み込むプラグインの名前を設定する。

```yaml
load_plugins: []
```

<br>

### watch_config_files

設定ファイルやルールファイルの変更を監視し、変更を検知したときに Falco を再読み込みするかどうかを設定する。

```yaml
watch_config_files: "true"
```

<br>

### time_format_iso_8601

アラートの日時を ISO 8601 形式で出力するかどうかを設定する。

```yaml
time_format_iso_8601: "false"
```

<br>

### json_output

アラートを JSON 形式で出力するかどうかを設定する。

```yaml
json_output: "false"
```

<br>

### json_include_output_property

JSON 形式のアラートに、ルールの output で整形したメッセージを `output` キーとして含めるかどうかを設定する。

```yaml
json_include_output_property: "true"
```

<br>

### json_include_tags_property

JSON 形式のアラートに、ルールのタグを `tags` キーとして含めるかどうかを設定する。

```yaml
json_include_tags_property: "true"
```

<br>

### log_stderr

Falco 自身のログを標準エラー出力に出力するかどうかを設定する。

```yaml
log_stderr: "true"
```

<br>

### log_syslog

Falco 自身のログを syslog に出力するかどうかを設定する。

```yaml
log_syslog: "true"
```

<br>

### log_level

Falco 自身のログのうち、出力する最低のログレベルを設定する。

```yaml
log_level: info
```

<br>

### libs_logger

Falco が内部で使用するライブラリのログを出力するかどうかと、出力する最低の重要度を設定する。

```yaml
libs_logger:
  enabled: "false"
  severity: debug
```

<br>

### priority

アラートを出力するルールの最低の優先度を設定する。この優先度より低いルールに合致しても、アラートは出力しない。

```yaml
priority: debug
```

<br>

### buffered_outputs

アラートの出力をバッファリングするかどうかを設定する。

```yaml
buffered_outputs: "false"
```

<br>

### syscall_event_drops

システムコールのイベントを取りこぼしたと判定するしきい値と、取りこぼしたときに実行するアクションを設定する。

```yaml
syscall_event_drops:
  threshold: 0.1
  actions:
    - log
    - alert
  rate: 0.03333
  max_burst: 1
  simulate_drops: "false"
```

<br>

### syscall_event_timeouts

イベントを受信できずにタイムアウトした回数が、何回連続したらアラートを出力するかを設定する。

```yaml
syscall_event_timeouts:
  max_consecutives: 1000
```

<br>

### syscall_buf_size_preset

カーネルから Falco にシステムコールのイベントを受け渡すバッファのサイズを、プリセットの番号で設定する。

```yaml
syscall_buf_size_preset: 4
```

<br>

### output_timeout

アラートの出力処理が停止したとみなすまでの時間をミリ秒で設定する。

```yaml
output_timeout: 2000
```

<br>

### outputs

アラートの出力の流量を、トークンバケット方式の `rate` と `max_burst` で制限する。

```yaml
outputs:
  rate: 0
  max_burst: 1000
```

<br>

### syslog_output

アラートを syslog に出力するかどうかを設定する。

```yaml
syslog_output:
  enabled: "true"
```

<br>

### file_output

アラートをファイルに出力するかどうかと、出力先のファイルを設定する。

```yaml
file_output:
  enabled: "false"
  keep_alive: "false"
  filename: ./events.txt
```

<br>

### stdout_output

アラートを標準出力に出力するかどうかを設定する。

```yaml
stdout_output:
  enabled: "true"
```

<br>

### webserver

Falco が起動する Web サーバーを設定する。この Web サーバーは、ヘルスチェック用のエンドポイントなどを公開する。

```yaml
webserver:
  enabled: "true"
  threadiness: 0
  listen_port: 8765
  k8s_healthz_endpoint: /healthz
  ssl_enabled: "false"
  ssl_certificate: /etc/falco/falco.pem
```

<br>

### program_output

アラートを指定したプログラムの標準入力に渡すかどうかと、そのプログラムを設定する。

```yaml
program_output:
  enabled: "false"
  keep_alive: "false"
  program: >-
    jq '{text: .output}' | curl -d @- -X POST
    https://hooks.slack.com/services/XXX
```

<br>

### http_output

アラートを指定した URL に HTTP で送信するかどうかと、送信先の URL を設定する。

```yaml
http_output:
  enabled: "false"
  url: "http://some.url"
  user_agent: falcosecurity/falco
```

<br>

### grpc

Falco の gRPC サーバーを起動するかどうかと、gRPC サーバーが待ち受けるアドレスを設定する。

```yaml
grpc:
  enabled: "false"
  bind_address: "unix:///run/falco/falco.sock"
  threadiness: 0
```

<br>

### grpc_output

アラートを gRPC サーバー経由で出力するかどうかを設定する。

```yaml
grpc_output:
  enabled: "false"
```

<br>

### metadata_download

Kubernetes などからメタデータをダウンロードするときの最大サイズ、待機時間、監視の頻度を設定する。

```yaml
metadata_download:
  max_mb: 100
  chunk_wait_us: 1000
  watch_freq_sec: 1
```

<br>
