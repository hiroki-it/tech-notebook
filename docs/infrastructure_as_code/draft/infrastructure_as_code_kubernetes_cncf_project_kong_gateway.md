---
title: 【IT技術の知見】Kong Gateway＠CNCF
description: Kong Gateway＠CNCFの知見を記録しています。
---

# Kong Gateway＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## Kong KongPlugin

### grpc-gateway

```yaml
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: grpc-gateway-plugin
  labels:
    global: "true"
config:
  proto: /home/kong/protobufs/joke.proto
plugin: grpc-gateway
```

> - https://medium.com/@pratik.manandhar99/implementing-kong-api-gateway-with-grpc-on-a-kubernetes-cluster-240f6132219c

<br>

### jwt

```yaml
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: jwt-plugin
  labels:
    global: "true"
config:
  secret_is_base64: false
  run_on_preflight: false
plugin: jwt
```

> - https://medium.com/@pratik.manandhar99/implementing-kong-api-gateway-with-grpc-on-a-kubernetes-cluster-240f6132219c

<br>
