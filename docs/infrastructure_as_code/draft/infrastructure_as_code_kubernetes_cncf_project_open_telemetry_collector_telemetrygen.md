---
title: 【IT技術の知見】Telemetrygen＠OpenTelemetry
description: Telemetrygen＠OpenTelemetryの知見を記録しています。
---

# Telemetrygen＠OpenTelemetry

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Telemetrygenとは

ローカル環境で擬似的に分散トレースを作成し、OpenTelemetryコレクターがこれを正しく処理できるかを検証する。

別途、宛先のOpenTelemetryコレクターを起動し、ログを出力しておく。

> - https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen

<br>

## 02. セットアップ

```bash
$ go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest
```

<br>

## 03. telemetrygenコマンド

### logs

記入中...

<br>

### metrics

記入中...

<br>

### traces

#### ▼ --child-spans

作成する子スパンの数を設定する。

```bash
$ telemetrygen traces --child-spans 3
```

#### ▼ --service

スパンに付与するサービス名を設定する。

```bash
$ telemetrygen traces --service foo-service
```

#### ▼ --traces

作成する分散トレースの数を設定する。

```bash
$ telemetrygen traces --traces 1
```

<br>
