---
title: 【IT技術の知見】Kong Gateway＠CNCF
description: Kong Gateway＠CNCFの知見を記録しています。
---

# Kong Gateway＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## KongPlugin

### KongPluginとは

Kong Gatewayを拡張する。

> - https://docs.konghq.com/kubernetes-ingress-controller/latest/reference/custom-resources/#kongplugin

<br>

### config

#### ▼ grpc-gatewayプラグインの場合

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

> - https://docs.konghq.com/hub/kong-inc/grpc-gateway/configuration/
> - https://medium.com/@pratik.manandhar99/implementing-kong-api-gateway-with-grpc-on-a-kubernetes-cluster-240f6132219c

#### ▼ jwtプラグインの場合

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

> - https://docs.konghq.com/hub/kong-inc/jwt/configuration/
> - https://medium.com/@pratik.manandhar99/implementing-kong-api-gateway-with-grpc-on-a-kubernetes-cluster-240f6132219c

<br>
