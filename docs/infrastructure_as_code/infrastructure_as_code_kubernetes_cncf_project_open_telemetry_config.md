---
title: 【IT技術の知見】設定ファイル＠OpenTelemetry
description: 設定ファイル＠OpenTelemetryの知見を記録しています。
---

# 設定ファイル＠OpenTelemetry

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## exporters

エクスポーターを設定する。

```yaml
exporters:
  # 宛先はx-rayとする
  awsxray:
    region: ap-northeast-1
```

> - https://opentelemetry.io/docs/collector/configuration/#exporters

<br>

## extensions

```yaml
extensions:
  health_check:
    endpoint: <OpenTelemetryコレクターのPodのIPアドレス>:13133
```

> - https://opentelemetry.io/docs/collector/configuration/#extensions

<br>

## processors

プロセッサーを設定する

```yaml
processors:
  batch:
    timeout: 5s
    send_batch_size: 50
```

> - https://opentelemetry.io/docs/collector/configuration/#processors

<br>

## receivers

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

## service

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
