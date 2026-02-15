---
title: 【IT技術の知見】設定ファイル＠Grafana Loki
description: 設定ファイル＠Grafana Lokiの知見を記録しています。
---

# 設定ファイル＠Grafana Loki

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. config.yaml

### auth_enabled

GrafanaからGrafana Lokiへの接続で認証を必要にする。

```yaml
auth_enabled: false
```

<br>

### bloom_build

```yaml
bloom_build:
  builder:
    planner_address: ""
  enabled: false
```

<br>

### bloom_gateway

```yaml
bloom_gateway:
  client:
    addresses: ""
  enabled: false
```

<br>

### chunk_store_config

```yaml
chunk_store_config:
  chunk_cache_config:
    background:
      writeback_buffer: 500000
      writeback_goroutines: 1
      writeback_size_limit: 500MB
    default_validity: 0s
    memcached:
      batch_size: 4
      parallelism: 5
    memcached_client:
      addresses: dnssrvnoa+_memcached-client._tcp.grafana-loki-chunks-cache.istio-system.svc
      consistent_hash: true
      max_idle_conns: 72
      timeout: 2000ms
```

<br>

### common

#### ▼ compactor_address

```yaml
common:
  compactor_address: http://grafana-loki:3100
```

#### ▼ path_prefix

```yaml
common:
  path_prefix: /var/loki
```

#### ▼ replication_factor

```yaml
common:
  replication_factor: 1
```

#### ▼ storage

ログの保管ストレージを設定する。

**実装例**

```yaml
common:
  storage:
    s3:
      access_key_id: root
      bucketnames:
        chunks: grafana-loki-chunks
        ruler: grafana-loki-ruler
        admin: grafana-loki-admin
      # MinIOを使用する場合
      endpoint: minio.istio-system.svc.cluster.local:9000
      insecure: true
      s3forcepathstyle: true
      secret_access_key: password
```

**実装例**

```yaml
common:
  storage:
    s3:
      bucketnames:
        chunks: grafana-loki-chunks
        ruler: grafana-loki-ruler
        admin: grafana-loki-admin
      # AWS S3を使用する場合
      region: ap-northeast-1
```

<br>

### frontend

```yaml
frontend:
  scheduler_address:
  tail_proxy_url:
```

<br>

### frontend_worker

```yaml
frontend_worker:
  scheduler_address:
```

<br>

### groups

#### ▼ expr

**＊実装例＊**

構造化の場合、メトリッククエリのフィールドの条件 (例：`{app="foo", namespace="foo"}`) を設定する。

また、構造化ログ全体を検索し、`ERROR` という文字があった場合、アラートを作成する。

```yaml
groups:
  - name: should_fire
    rules:
      - alert: HighPercentageError
        # 5分あたりに5つ以上のエラーログが出る
        expr: |
          count_over_time({app="foo", namespace="foo"} |= "ERROR" [5m]) > 5
        for: 1m
        labels:
          severity: error
        annotations:
          summary: High error rate
```

```yaml
{
  "timestamp": "2025-05-13T09:00:00Z",
  "level": "error",
  "message": "ERROR: Failed to connect to database",
  "app": "foo",
  "env": "production",
}
```

<br>

### index_gateway

```yaml
index_gateway:
  mode: simple
```

<br>

### limits_config

```yaml
limits_config:
  max_cache_freshness_per_query: 10m
  query_timeout: 300s
  reject_old_samples: true
  reject_old_samples_max_age: 168h
  split_queries_by_interval: 15m
  volume_enabled: true
```

<br>

### memberlist

```yaml
memberlist:
  join_members:
    - loki-memberlist
```

<br>

### pattern_ingester

```yaml
pattern_ingester:
  enabled: false
```

<br>

### query_range

#### ▼ align_queries_with_step

```yaml
query_range:
  align_queries_with_step: true
```

#### ▼ cache_results

```yaml
query_range:
  cache_results: true
```

#### ▼ parallelise_shardable_queries

クエリ処理を並列化する。

Grafana Lokiで `context canceled` エラーが出る場合、こちらを無効化すると良い。

```yaml
query_range:
  parallelise_shardable_queries: false
```

> - https://github.com/grafana/loki/issues/7649#issuecomment-1625645403

#### ▼ results_cache

```yaml
query_range:
  results_cache:
    cache:
      background:
        writeback_buffer: 500000
        writeback_goroutines: 1
        writeback_size_limit: 500MB
      default_validity: 12h
      memcached_client:
        addresses: dnssrvnoa+_memcached-client._tcp.grafana-loki-results-cache.istio-system.svc
        consistent_hash: true
        timeout: 500ms
        update_interval: 1m
```

<br>

### ruler

#### ▼ alertmanager_url

アラート送信先のAlertmanagerのURLを設定する。

```yaml
ruler:
  alertmanager_url: http://altertmanager.altertmanager.svc.cluster.local:9093
```

> - https://grafana.com/docs/loki/latest/alert/#alerting-and-recording-rules

#### ▼ storage

```yaml
ruler:
  storage:
    s3:
      access_key_id: root
      bucketnames: grafana-loki-ruler
      endpoint: minio.istio-system.svc.cluster.local:9000
      insecure: true
      s3forcepathstyle: true
      secret_access_key: password
    type: s3
```

> - https://grafana.com/docs/loki/latest/alert/#alerting-and-recording-rules

#### ▼ wal

```yaml
ruler:
  wal:
    dir: /var/loki/ruler-wal
```

> - https://grafana.com/docs/loki/latest/alert/#alerting-and-recording-rules

<br>

### runtime_config

```yaml
runtime_config:
  file: /etc/loki/runtime-config/runtime-config.yaml
```

<br>

### schema_config

```yaml
schema_config:
  configs:
    - from: 2024-04-01
      index:
        period: 24h
        prefix: index_
      object_store: filesystem
      schema: v13
      store: tsdb
```

<br>

### server

```yaml
server:
  grpc_listen_port: 9095
  http_listen_port: 3100
  http_server_read_timeout: 600s
  http_server_write_timeout: 600s
```

<br>

### storage_config

```yaml
storage_config:
  bloom_shipper:
    working_directory: /var/loki/data/bloomshipper
  boltdb_shipper:
    index_gateway_client:
      server_address: ""
  hedging:
    at: 250ms
    max_per_second: 20
    up_to: 3
  tsdb_shipper:
    index_gateway_client:
      server_address: ""
```

<br>

### tracing

```yaml
tracing:
  enabled: false
```

<br>
