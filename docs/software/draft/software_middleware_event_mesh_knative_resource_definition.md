---
title: 【IT技術の知見】リソース定義＠Knative
description: リソース定義＠Knativeの知見を記録しています。
---

# リソース定義＠Knative

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ApiServerSource

```yaml
apiVersion: sources.knative.dev/v1
kind: ApiServerSource
metadata:
  name: main-api-server-source
spec:
  serviceAccountName: api-server-source-sa
  mode: Resource
  resources:
    - apiVersion: v1
      kind: Event
  sink:
    ref:
      apiVersion: serving.knative.dev/v1
      kind: Service
      name: cloudevents-raw-endpoint
      namespace: dora-cloudevents
```

## 01. Service

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: foo-go
  namespace: default
spec:
  template:
    spec:
      containers:
        - image: ghcr.io/knative/foo-go:latest
          env:
            - name: TARGET
              value: "Go Sample v1"
```

> - https://knative.dev/docs/serving/services/creating-services/#procedure

<br>
