---
title: 【IT技術の知見】Temporal＠Prometheus
description: Temporal＠Prometheusの知見を記録しています。
---

# Temporal＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Temporalの仕組み

### アーキテクチャ

Temporalは、Temporalサーバー、ステート用データベース、Temporalワーカー (ユーザーのアプリ) 、からなる。

> - https://michaelangelo.io/blog/temporal-sqs#temporal-components
> - https://learn.temporal.io/tutorials/php/booking_saga/#review-the-saga-architecture-pattern

<br>

## 02. global

記入中...

> - https://docs.temporal.io/references/configuration#global

<br>

## 03. persistence

### defaultStore

```yaml
persistence:
  defaultStore: default
```

> - https://docs.temporal.io/references/configuration#defaultstore

<br>

### visibilityStore

```yaml
persistence:
  visibilityStore: cass-visibility # The primary Visibility store.
```

> - https://docs.temporal.io/references/configuration#visibilitystore

<br>

### secondaryVisibilityStore

```yaml
persistence:
  secondaryVisibilityStore: es-visibility # A secondary Visibility store added to enable Dual Visibility.
```

> - https://docs.temporal.io/references/configuration#secondaryvisibilitystore

<br>

### numHistoryShards

```yaml
persistence:
  numHistoryShards: 512
```

> - https://docs.temporal.io/references/configuration#numhistoryshards

<br>

### datastores

#### ▼ デフォルト値

```yaml
persistence:
  datastores:
    default: ...
```

#### ▼ cassandra

```yaml
persistence:
  datastores:
    <任意の名前>:
      cassandra:
        hosts: "127.0.0.1"
        keyspace: "temporal"
        user: "username"
        password: "password"
```

> - https://docs.temporal.io/references/configuration#cassandra

#### ▼ elasticsearch

```yaml
persistence:
  datastores:
    <任意の名前>:
      elasticsearch:
        version: "v7"
        logLevel: "error"
        url:
          scheme: "http"
          host: "127.0.0.1:9200"
        indices:
          visibility: temporal_visibility_v1_dev
        closeIdleConnectionsInterval: 15s
```

#### ▼ sql

```yaml
persistence:
  datastores:
    <任意の名前>:
      sql:
        driver: "mysql"
        host: _HOST_
        port: 3306
        database: temporal
        user: _USERNAME_
        password: _PASSWORD_
        maxConns: 20
        maxConnLifetime: "1h"
        connectAttributes:
          tx_isolation: "READ-COMMITTED"
```

> - https://docs.temporal.io/references/configuration#sql

<br>
