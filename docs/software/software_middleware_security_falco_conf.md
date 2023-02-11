---
title: 【IT技術の知見】設定ファイル＠Falco
description: 設定ファイル＠Falcoの知見を記録しています。
---

# 設定ファイル＠Falco

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. セットアップ

### インストール

#### ▼ チャートとして

Node内でfalcoをコンテナとして稼働させる場合、チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。


```bash
$ helm repo add <チャートリポジトリ名> https://falcosecurity.github.io/charts

$ helm repo update

$ kubectl create namespace falco

$ helm install <リリース名> <リポジトリ名>/falco -n falco --version <バージョンタグ>
```

> ℹ️ 参考：https://falco.org/blog/intro-k8s-security-monitoring/#setting-falco-up-on-kubernetes


<br>

## 02. 設定ファイル

### 設定ファイルの例

> ℹ️ 参考：https://github.com/falcosecurity/falco/blob/master/falco.yaml

<br>

### rules_file

切り分けて定義したFalcoの設定ファイルを設定する。



```yaml
rules_file:
  # デフォルトのルールを定義したファイル
  - /etc/falco/falco_rules.yaml
  # ユーザー定義のルールを定義したファイル
  - /etc/falco/falco_rules.local.yaml
  - /etc/falco/rules.d
```



> ℹ️ 参考：
>
> - https://github.com/falcosecurity/falco/tree/master/rules
> - https://qiita.com/EnKUMA/items/d03f0621a631a0a220cc#falco%E3%81%AE%E3%83%AB%E3%83%BC%E3%83%AB%E4%BD%9C%E6%88%90

<br>

### plugins

Falcoの拡張プラグインを設定する。



```yaml
plugins:
  - name: k8saudit
    library_path: libk8saudit.so
    init_config: null
    open_params: 'http://:9765/k8s-audit'
  - name: cloudtrail
    library_path: libcloudtrail.so
  - name: json
    library_path: libjson.so
```

<br>

### load_plugins

調査中...

```yaml
load_plugins: []
```

<br>

### watch_config_files

調査中...

```yaml
watch_config_files: true
```

<br>

### time_format_iso_8601

調査中...

```yaml
time_format_iso_8601: false
```

<br>

### json_output

調査中...

```yaml
json_output: false
```

<br>

### json_include_output_property

調査中...

```yaml
json_include_output_property: true
```

<br>

### json_include_tags_property

調査中...

```yaml
json_include_tags_property: true
```

<br>

### log_stderr

調査中...

```yaml
log_stderr: true
```

<br>

### log_syslog

調査中...

```yaml
log_syslog: true
```

<br>

### log_level

調査中...

```yaml
log_level: info
```

<br>

### libs_logger

調査中...

```yaml
libs_logger:
  enabled: false
  severity: debug
```

<br>

### priority

調査中...

```yaml
priority: debug
```

<br>

### buffered_outputs

調査中...

```yaml
buffered_outputs: false
```

<br>

### syscall_event_drops

調査中...

```yaml
syscall_event_drops:
  threshold: 0.1
  actions:
    - log
    - alert
  rate: 0.03333
  max_burst: 1
  simulate_drops: false
```

<br>

### syscall_event_timeouts

調査中...

```yaml
syscall_event_timeouts:
  max_consecutives: 1000
```

<br>

### syscall_buf_size_preset

調査中...

```yaml
syscall_buf_size_preset: 4
```

<br>

### output_timeout

調査中...

```yaml
output_timeout: 2000
```

<br>

### outputs

調査中...

```yaml
outputs:
  rate: 0
  max_burst: 1000
```

<br>

### syslog_output

調査中...

```yaml
syslog_output:
  enabled: true
```

<br>

### file_output

調査中...

```yaml
file_output:
  enabled: false
  keep_alive: false
  filename: ./events.txt
```

<br>

### stdout_output

調査中...

```yaml
stdout_output:
  enabled: true
```

<br>

### webserver

調査中...

```yaml
webserver:
  enabled: true
  threadiness: 0
  listen_port: 8765
  k8s_healthz_endpoint: /healthz
  ssl_enabled: false
  ssl_certificate: /etc/falco/falco.pem
```

<br>

### program_output

調査中...

```yaml
program_output:
  enabled: false
  keep_alive: false
  program: >-
    jq '{text: .output}' | curl -d @- -X POST
    https://hooks.slack.com/services/XXX
```

<br>

### http_output

調査中...

```yaml
http_output:
  enabled: false
  url: 'http://some.url'
  user_agent: falcosecurity/falco
```

<br>

### grpc

調査中...

```yaml
grpc:
  enabled: false
  bind_address: 'unix:///run/falco/falco.sock'
  threadiness: 0
```

<br>

### grpc_output

調査中...

```yaml
grpc_output:
  enabled: false
```

<br>

### metadata_download

調査中...

```yaml
metadata_download:
  max_mb: 100
  chunk_wait_us: 1000
  watch_freq_sec: 1
```

<br>
