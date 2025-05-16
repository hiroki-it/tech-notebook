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

```yaml
distributor:
  receivers:
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
    opencensus: null
    otlp:
      protocols:
        grpc:
          endpoint: 0.0.0.0:4317
        http:
          endpoint: 0.0.0.0:4318
```

<br>

### ingester

```yaml
ingester: {}
```

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

### storage.trace

#### ▼ backend

分散トレースの保管ストレージを設定する。

```yaml
storage:
  trace:
    backend: s3
```

#### ▼ local

保管ストレージのディレクトリを設定する。

```yaml
storage:
  trace:
    local:
      path: /var/tempo/traces
```

#### ▼ s3

保管ストレージに応じて、資格情報やエンドポイントを設定する。

```yaml
storage:
  trace:
    s3:
      access_key: root
      bucket: grafana-tempo
      # AWS S3代替のMinIOを使用している場合
      endpoint: minio.istio-system.svc.cluster.local:9000
      insecure: true
      secret_key: password
```

#### ▼ wal

WALのディレクトリを設定する。

```yaml
storage:
  trace:
    wal:
      path: /var/tempo/wal
```

<br>

### usage_report

```yaml
usage_report:
  reporting_enabled: true
```

<br>
