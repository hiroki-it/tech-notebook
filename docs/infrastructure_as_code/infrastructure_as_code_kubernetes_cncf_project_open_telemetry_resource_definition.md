---
title: 【IT技術の知見】リソース定義＠OpenTelemetry
description: リソース定義＠OpenTelemetryの知見を記録しています。
---

# リソース定義＠OpenTelemetry

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Instrumentation

### Podの`.metadata.annotations`キー

Podにアノテーションを設定し、自動計装を実施するPodを制御できる。

アノテーションを設定すると、自動計装を実施するInitContainer (`opentelemetry-auto-instrumentation`) を挿入できる。

言語ごとにアノテーションのキー名が異なる。

```yaml
apiVersion: apps/v1
kind: Pod
metadata:
  name: foo-pod
  annotations:
    instrumentation.opentelemetry.io/inject-python: "true"
spec: ...
```

> - https://opentelemetry.io/docs/kubernetes/operator/automatic/#were-the-resources-deployed-in-the-right-order

<br>

### exporter

#### ▼ exporterとは

自動計装でExporterを設定する。

> - https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#instrumentationspecexporter

#### ▼ endpoint

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: foo-instrumentation
spec:
  exporter:
    endpoint: http://foo-opentelemetry-collector.foo-namespace.svc.cluster.local:4317
```

<br>

### go

#### ▼ goとは

Podのアプリ言語がGoの場合に、

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: foo-instrumentation
spec:
  go: {}
```

<br>

### propagators

#### ▼ propagatorsとは

自動計装でPropagatorを設定する。

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: foo-instrumentation
spec:
  propagators:
    - tracecontext
    - baggage
```

<br>

### resource

#### ▼ resourceとは

> - https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#instrumentationspecresource

<br>

### sampler

#### ▼ samplerとは

自動計装でSamplerを設定する。

> - https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#instrumentationspecsampler

#### ▼ type

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: foo-instrumentation
spec:
  sampler:
    type: parentbased_traceidratio
```

#### ▼ argument

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: foo-instrumentation
spec:
  sampler:
    argument: "1"
```

<br>

## 02. OpenTelemetryCollector

### mode

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: foo-opentelemetry-collector
spec:
  mode: deployment
```

<br>

### serviceAccount

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: foo-opentelemetry-collector
spec:
  serviceAccount: opentelemetry-collector
```

<br>

### config

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpenTelemetryCollector
metadata:
  name: foo-opentelemetry-collector
spec:
  config: |
    ...
```

<br>

## 03. OpenTelemetryOperator
