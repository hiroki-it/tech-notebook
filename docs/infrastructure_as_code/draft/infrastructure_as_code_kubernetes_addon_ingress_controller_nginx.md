---
title: 【IT技術の知見】Nginx Ingressコントローラー＠Ingressコントローラー
description: Nginx Ingressコントローラー＠Ingressコントローラーの知見を記録しています。
---

# Nginx Ingressコントローラー＠Ingressコントローラー

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 仕組み

`L4`/`L7`ロードバランサーとして、インバウンド通信をロードバランシングする。

> - https://docs.nginx.com/nginx-ingress-controller/intro/how-nginx-ingress-controller-works/#the-ingress-controller-pod

<br>

## 02. マニフェスト

### Ingress

```yaml

```

<br>

### Service

#### ▼ FastCGIプロトコル

Nginx Ingressコントローラーは、受信したリクエストをFastCGIプロトコルで転送できる。

ServiceはFastCGIプロトコルで転送できないが、代わりにNginx IngressコントローラーがFastCGIプロトコルで転送してくれる。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  selector:
    app: foo-app
  ports:
    # Nginx IngressコントローラーがTCPプロトコルに変換してくれる
    - protocol: TCP
      port: 9000
      targetPort: 9000
      name: fastcgi
---
apiVersion: v1
kind: Pod
metadata:
  name: foo-app
labels:
  app: foo-app
spec:
  containers:
    - name: foo-app
      image: foo-app:1.0
      ports:
        - containerPort: 9000
          name: fastcgi
```

> - https://kubernetes.github.io/ingress-nginx/user-guide/fcgi-services/
> - https://www.tecmint.com/connect-nginx-to-php-fpm/

<br>

## 03. Ingressの`.metadata.annotations`キー

### Ingressの`.metadata.annotations`キーとは

特定のALBのリスナールールを決める。

Ingressで`nginx`のIngressClassを指定する必要がある。

<br>

### `nginx.ingress.kubernetes.io/affinity`キー

Podへのルーティング時にセッションを維持するかどうかを設定する。

同じセッション内であれば、特定のクライアントからの通信をService配下の同じPodにルーティングし続けられる。

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
