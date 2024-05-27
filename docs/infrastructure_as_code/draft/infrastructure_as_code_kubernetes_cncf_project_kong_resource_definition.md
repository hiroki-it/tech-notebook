---
title: 【IT技術の知見】Kong＠CNCF
description: Kong＠CNCFの知見を記録しています。
---

# Kong＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### チャートとして

```bash
$ helm repo add <チャートリポジトリ名> https://charts.konghq.com

$ helm repo update

$ kubectl create namespace cert-manager

$ helm install <Helmリリース名> <チャートリポジトリ名>/kong -n bff --version <バージョンタグ>
```

> - https://github.com/Kong/charts/tree/main/charts/kong

<br>

## 02. Gateway

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: kong
spec:
  gatewayClassName: kong
  listeners:
    - name: proxy
      port: 80
      protocol: HTTP
```

> - https://qiita.com/santasan1224/items/19fcb7ec54883a8b8ee9#kong%E3%82%92%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB

<br>

## 03. GatewayClass

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: kong
  annotations:
    konghq.com/gatewayclass-unmanaged: "true"
spec:
  controllerName: konghq.com/kic-gateway-controller
```

> - https://qiita.com/santasan1224/items/19fcb7ec54883a8b8ee9#kong%E3%82%92%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB

<br>

## 04. KongIngress

記入中...

<br>

## 05. KongPlugin

### plugin

KongIngressのプラグイン名を指定する。

> - https://docs.konghq.com/kubernetes-ingress-controller/latest/reference/custom-resources/#kongplugin

<br>

### metadata.labels

#### ▼ labels.

### global

ClusterスコープでKongPluginを有効化する。

```yaml
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  labels:
    global: "true"
```

> - https://docs.konghq.com/kubernetes-ingress-controller/latest/reference/custom-resources/#configurationkonghqcomv1

<br>

#### ▼ grpc-gatewayプラグインの場合

```yaml
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: grpc-gateway-plugin
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
config:
  secret_is_base64: false
  run_on_preflight: false
plugin: jwt
```

> - https://docs.konghq.com/hub/kong-inc/jwt/configuration/
> - https://medium.com/@pratik.manandhar99/implementing-kong-api-gateway-with-grpc-on-a-kubernetes-cluster-240f6132219c

#### ▼ rate-limiting

```yaml
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: rate-limit-plugin
  annotations:
    kubernetes.io/ingress.class: kong
config:
  minute: 5
  policy: local
plugin: rate-limiting
```

> - https://qiita.com/santasan1224/items/19fcb7ec54883a8b8ee9#%E3%83%AC%E3%83%BC%E3%83%88%E5%88%B6%E9%99%90%E3%81%AE%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3%E3%82%92%E4%BD%9C%E6%88%90

<br>
