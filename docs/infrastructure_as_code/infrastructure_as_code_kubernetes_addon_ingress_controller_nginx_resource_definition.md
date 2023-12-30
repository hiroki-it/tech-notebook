---
title: 【IT技術の知見】Nginx Ingressコントローラー＠Ingressコントローラー
description: Nginx Ingressコントローラー＠Ingressコントローラーの知見を記録しています。
---

# Nginx Ingressコントローラー＠Ingressコントローラー

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Ingressの`.metadata.annotations`キー

### Ingressの`.metadata.annotations`キーとは

特定のALBのリスナールールを決める。

Ingressで`nginx`のIngressClassを指定する必要がある。

<br>

### `nginx.ingress.kubernetes.io/affinity`キー

Podへのルーティング時にセッションを維持するかどうかを設定する。

同じセッション内であれば、特定のクライアントからのリクエストをService配下の同じPodにルーティングし続けられる。

```yaml
piVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-nginx-ingress
  annotations:
    nginx.ingress.kubernetes.io/affinity: cookie
```

> - https://developer.mamezou-tech.com/containers/k8s/tutorial/ingress/ingress-nginx/#%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E7%B6%AD%E6%8C%81session-affinity

<br>

### `nginx.ingress.kubernetes.io/whitelist-source-range`キー

インバウンド通信で許可するCIDRを設定する。

```yaml
piVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-nginx-ingress
  annotations:
    nginx.ingress.kubernetes.io/whitelist-source-range: *.*.*.*/*
```

> - https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/

<br>

### `nginx.ingress.kubernetes.io/denylist-source-range`キー

インバウンド通信で拒否するCIDRを設定する。

```yaml
piVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: foo-nginx-ingress
  annotations:
    nginx.ingress.kubernetes.io/denylist-source-range: *.*.*.*/*
```

> - https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/

<br>

## 02. 一括設定のConfigMap

### 一括設定のConfigMapとは

全てのIngressに一括してルールを設定する。

<br>

### proxy-connect-timeout

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: nginx-ingress
  namespace: ingress
data:
  proxy-connect-timeout: 10s
```

> - https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/configmap/#proxy-connect-timeout

<br>

### proxy-read-timeout

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: nginx-ingress
  namespace: ingress
data:
  proxy-read-timeout: 10s
```

> - https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/configmap/#proxy-read-timeout

<br>

### use-forwarded-headers

通過したリクエストに`X-Forwarded-For`ヘッダーを追加する。

送信元IPアドレスを保持するために役立つ。

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: nginx-ingress
  namespace: ingress
data:
  use-forwarded-headers: "true"
```

> - https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/configmap/#use-forwarded-headers

<br>
