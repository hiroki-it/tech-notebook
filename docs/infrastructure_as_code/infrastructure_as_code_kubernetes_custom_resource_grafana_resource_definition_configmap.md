---
title: 【IT技術の知見】ConfigMap系＠Grafana
description: ConfigMap系＠Grafanaの知見を記録しています。
---

# ConfigMap系＠Grafana

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. grafana-datasource-cm

### grafana-datasource-cmとは

Grafanaの`datasource.yaml`ファイルを管理する。

<br>

### datasources

#### ▼ datasourcesとは

Grafanaのデータソースを設定する。

#### ▼ Prometheusの場合

Prometheusの場合、ビルトインのプラグインを使用できる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  datasource.yaml: |-
    apiVersion: 1
    datasources:
      - name: prometheus
        type: prometheus
        url: http://<PrometheusのService名>.<PrometheusのNamespace名>:9090/
        access: proxy
        # デフォルトのデータソースとするか否かを設定する
        isDefault: true
        jsonData:
          timeInterval: 30s
```

> ↪️ 参考：
>
> - https://grafana.com/grafana/plugins/prometheus/
> - https://grafana.com/docs/grafana/latest/datasources/prometheus/#configure-the-data-source

#### ▼ VictoriaMetricsの場合

VictoriaMetricsの場合、ビルトインのプラグインを使用できる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  datasource.yaml: |-
    apiVersion: 1
    datasources:
      - name: victoria-metrics
        type: prometheus
        url: http://<VictoriaMetricsのサーバーのIPアドレス>:8248/
        access: proxy
        isDefault: false
        jsonData:
          timeInterval: 30s
```

> ↪️ 参考：https://grafana.com/docs/grafana/latest/datasources/prometheus/#configure-the-data-source

<br>

## 02. grafana-ini-cm

### grafana-ini-cmとは

Grafanaの`grafana.ini`ファイルを管理する。

> ↪️ 参考：
>
> - https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#configuration-file-location
> - https://www.server-world.info/query?os=CentOS_Stream_9&p=grafana

<br>

### pathsセクション

記入中...

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [paths]
    ...
```

> ↪️ 参考：https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#paths

<br>

### serverセクション

記入中...

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [server]
    ...
```

> ↪️ 参考：https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#server

<br>

### databaseセクション

記入中...

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [database]
    ...
```

> ↪️ 参考：https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#database

<br>

### remote_cacheセクション

記入中...

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [remote_cache]
    ...
```

> ↪️ 参考：https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#remote_cache

<br>

### date_formatsセクション

#### ▼ date_formatsセクション

時間に関して設定する。

#### ▼ default_timezone

タイムゾーンを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [date_formats]
    default_timezone = Asia/Tokyo
```

<br>

### usersセクション

#### ▼ usersセクション

記入中...

#### ▼ default_theme

ダッシュボードのデフォルトのテーマを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [users]
    default_theme = light
```

#### ▼ home_page

Grafanaのダッシュボードのホームを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  grafana.ini: |
    [users]
    # foo.grafana.com/dashboards がホームになる。
    home_page = dashboards
```

<br>

## 03. grafana-provider-cm

### grafana-provider-cmとは

Grafanaの`provider.yaml`ファイルを管理する。

ダッシュボードのフォルダを定義できる。

> ↪️ 参考：https://github.com/ezienecker/grafana-sidecar-folder-sample/tree/master

<br>

### providers

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana
  namespace: prometheus
data:
  provider.yaml: |-
    apiVersion: 1
    providers:
      - name: 'sidecarProvider'
        orgId: 1
        folder: ''
        type: file
        disableDeletion: false
        allowUiUpdates: false
        updateIntervalSeconds: 30
        options:
          foldersFromFilesStructure: false
          path: /tmp/dashboards
```

<br>
