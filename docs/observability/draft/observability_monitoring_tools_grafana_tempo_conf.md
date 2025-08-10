---
title: 【IT技術の知見】設定ファイル＠Grafana Tempo
description: 設定ファイル＠Grafana Tempoの知見を記録しています。
---

# 設定ファイル＠Grafana Tempo

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. tempo.yaml

### compactor

```yaml
compactor:
  compaction:
    block_retention: 24h
```

<br>

### distributor

#### ▼ log_received_spans

スパンをログに出力する。

```yaml
distributor:
  log_received_spans:
    enabled: true
```

> - https://grafana.com/docs/tempo/latest/configuration/#distributor

#### ▼ log_discarded_spans

無効または不要と判定されたスパンをログに出力する。

```yaml
distributor:
  log_discarded_spans:
    enabled: true
```

> - https://grafana.com/docs/tempo/latest/configuration/#distributor

#### ▼ receivers

```yaml
distributor:
  receivers:
    # Jaeger
    jaeger:
      protocols:
        grpc:
          endpoint: 0.0.0.0:14250
        thrift_binary:
          endpoint: 0.0.0.0:6832
        thrift_compact:
          endpoint: 0.0.0.0:6831
        thrift_http:
          endpoint: 0.0.0.0:14268
    # OpenCensus
    opencensus: null
    # OpenTelemetry
    otlp:
      protocols:
        grpc:
          endpoint: 0.0.0.0:4317
        http:
          endpoint: 0.0.0.0:4318
```

> - https://grafana.com/docs/tempo/latest/configuration/#distributor

<br>

### ingester

トレースデータを一時的に保管する。

```yaml
ingester: {}
```

> - https://grafana.com/docs/tempo/latest/configuration/#ingester

<br>

### metrics_generator

トレースからメトリクスの元になるデータポイントを作成する。

```yaml
metrics_generator:
  remote_write_url: http://prometheus-server.prometheus.svc.cluster.local:9009/api/v1/write
```

> - https://grafana.com/docs/tempo/latest/configuration/#metrics-generator

<br>

### memberlist

```yaml
memberlist:
  cluster_label: grafana-tempo.istio-system
```

<br>

### multitenancy_enabled

```yaml
multitenancy_enabled: false
```

<br>

### overrides

```yaml
overrides:
  per_tenant_override_config: /conf/overrides.yaml
```

<br>

### querier

```yaml
querier: {}
```

<br>

### query_frontend

```yaml
query_frontend: {}
```

<br>

### server

```yaml
server:
  http_listen_port: 3100
```

<br>

### storage

#### ▼ backend

分散トレースの保管ストレージを設定する。

```yaml
storage:
  trace:
    backend: s3
```

> - https://grafana.com/docs/tempo/latest/configuration/#storage-block-configuration-example

#### ▼ local

保管ストレージのディレクトリを設定する。

```yaml
storage:
  trace:
    local:
      path: /var/tempo/traces
```

> - https://grafana.com/docs/tempo/latest/configuration/#storage-block-configuration-example

#### ▼ s3

AWS S3をオブジェクトストレージとして使用し、資格情報やエンドポイントを設定する。

```yaml
storage:
  trace:
    # AWS S3代替のMinIOを使用している場合
    s3:
      access_key: root
      bucket: grafana-tempo
      endpoint: minio.istio-system.svc.cluster.local:9000
      insecure: true
      secret_key: password
```

```yaml
storage:
  trace:
    # AWS S3使用している場合
    s3:
      bucket: grafana-tempo
      endpoint: s3.ap-northeast-1.amazonaws.com
      region: ap-northeast-1
```

> - https://grafana.com/docs/tempo/latest/configuration/#storage-block-configuration-example

#### ▼ wal

WALのディレクトリを設定する。

```yaml
storage:
  trace:
    wal:
      path: /var/tempo/wal
```

> - https://grafana.com/docs/tempo/latest/configuration/#storage-block-configuration-example

<br>

### usage_report

```yaml
usage_report:
  reporting_enabled: true
```

<br>
