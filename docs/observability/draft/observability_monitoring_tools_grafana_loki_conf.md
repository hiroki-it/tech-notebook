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

```yaml
common:
  compactor_address: http://grafana-loki:3100
  path_prefix: /var/loki
  replication_factor: 1
  storage:
    s3:
      access_key_id: root
      bucketnames: grafana-loki-chunks
      endpoint: minio.istio-system.svc.cluster.local:9000
      insecure: true
      s3forcepathstyle: true
      secret_access_key: password
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

```yaml
query_range:
  align_queries_with_step: true
  cache_results: true
  parallelise_shardable_queries: false
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
  wal:
    dir: /var/loki/ruler-wal
```

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
