---
title: 【IT技術の知見】リソース定義＠Kong Ingress
description: リソース定義＠Kong Ingressの知見を記録しています。
---

# リソース定義＠Kong Ingress

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### チャートとして

```bash
$ helm repo add <チャートリポジトリ名> https://charts.konghq.com

$ helm repo update

$ kubectl create namespace kong-ingress

$ helm install <Helmリリース名> <チャートリポジトリ名>/ingress -n kong-ingress --version <バージョンタグ>
```

> - https://github.com/Kong/charts/blob/main/charts/ingress/README.md

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

### config

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

```bash
# KongIngressに紐づくServiceにアノテーションを設定する
$ kubectl annotate service <サービス名> konghq.com/plugins=grpc-gateway-plugin
```

> - https://docs.konghq.com/hub/kong-inc/grpc-gateway/how-to/basic-example/
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

```bash
# KongIngressに紐づくServiceにアノテーションを設定する
$ kubectl annotate service <サービス名> konghq.com/plugins=jwt-plugin
```

> - https://docs.konghq.com/hub/kong-inc/jwt/how-to/basic-example/
> - https://medium.com/@pratik.manandhar99/implementing-kong-api-gateway-with-grpc-on-a-kubernetes-cluster-240f6132219c

#### ▼ key-authプラグインの場合

```yaml
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: key-auth-plugin
config:
  key_names:
    - apikey
plugin: key-auth
```

```bash
# KongIngressに紐づくServiceにアノテーションを設定する
$ kubectl annotate service <サービス名> konghq.com/plugins=key-auth-plugin
```

> - https://docs.konghq.com/hub/kong-inc/key-auth/how-to/basic-example/
> - https://qiita.com/santasan1224/items/19fcb7ec54883a8b8ee9#%E3%81%95%E3%81%A3%E3%81%8D%E3%81%AE%E3%82%A2%E3%83%97%E3%83%AA%E3%81%AB%E8%AA%8D%E8%A8%BC%E3%82%92%E8%BF%BD%E5%8A%A0%E3%81%99%E3%82%8B

#### ▼ opentelemetryプラグインの場合

```yaml
apiVersion: configuration.konghq.com/v1
kind: KongPlugin
metadata:
  name: opentelemetry-plugin
config:
  endpoint: http://opentelemetry.collector:4318/v1/traces
  headers:
    X-Auth-Token: secret-token
plugin: opentelemetry
```

```bash
# KongIngressに紐づくServiceにアノテーションを設定する
$ kubectl annotate service <サービス名> konghq.com/plugins=opentelemetry-plugin
```

> - https://docs.konghq.com/hub/kong-inc/opentelemetry/how-to/basic-example/

#### ▼ rate-limitingプラグイン

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

```bash
# KongIngressに紐づくServiceにアノテーションを設定する
$ kubectl annotate service <サービス名> konghq.com/plugins=rate-limiting-plugin
```

> - https://docs.konghq.com/hub/kong-inc/rate-limiting/how-to/basic-example/
> - https://qiita.com/santasan1224/items/19fcb7ec54883a8b8ee9#%E3%83%AC%E3%83%BC%E3%83%88%E5%88%B6%E9%99%90%E3%81%AE%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3%E3%82%92%E4%BD%9C%E6%88%90

<br>

### metadata.labels

#### ▼ global

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

### plugin

KongIngressのプラグイン名を指定する。

> - https://docs.konghq.com/kubernetes-ingress-controller/latest/reference/custom-resources/#kongplugin

<br>
