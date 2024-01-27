---
title: 【IT技術の知見】設定ファイル＠OpenTelemetryコレクター
description: 設定ファイル＠OpenTelemetryコレクターの知見を記録しています。
---

# 設定ファイル＠OpenTelemetryコレクター

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. exporters

エクスポーターを設定する。

OpenTelemetryコレクターは、設定した宛先にテレメトリーを送信する。

```yaml
exporters:
  awsxray:
    region: ap-northeast-1
  debug: {}
  logging: {}
```

> - https://opentelemetry.io/docs/collector/configuration/#exporters

<br>

## 02. extensions

```yaml
extensions:
  health_check:
    endpoint: <OpenTelemetryコレクターのPodのIPアドレス>:13133
```

> - https://opentelemetry.io/docs/collector/configuration/#extensions

<br>

## 03. processors

プロセッサーを設定する

```yaml
processors:
  batch:
    timeout: 5s
    send_batch_size: 50
```

> - https://opentelemetry.io/docs/collector/configuration/#processors

<br>

## 04. receivers

レシーバーを設定する

OpenTelemetryのクライアントは、レシーバーを指定し、テレメトリーを送信する

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: <自身のPodのIPアドレス>:4317
      http:
        endpoint: <自身のPodのIPアドレス>:4318
```

> - https://opentelemetry.io/docs/collector/configuration/#receivers

<br>

## 05. service

使用したい設定を指定する

```yaml
service:
  extensions:
    - health_check
  # 使用したい設定 (レシーバー、プロセッサー、エクスポーター) を指定する
  pipelines:
    traces:
      receivers:
        - otlp
      processors:
        - batch
      exporters:
        - awsxray
```

> - https://opentelemetry.io/docs/collector/configuration/#service

<br>
