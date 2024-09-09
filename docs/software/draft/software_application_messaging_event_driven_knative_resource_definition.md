---
title: 【IT技術の知見】Knative＠イベント駆動方式
description: Knative＠イベント駆動方式の知見を記録しています。
---

# Knative＠イベント駆動方式

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Service

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: helloworld-go
  namespace: default
spec:
  template:
    spec:
      containers:
        - image: ghcr.io/knative/helloworld-go:latest
          env:
            - name: TARGET
              value: "Go Sample v1"
```

> - https://knative.dev/docs/serving/services/creating-services/#procedure

<br>
