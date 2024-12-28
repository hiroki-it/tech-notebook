---
title: 【IT技術の知見】Nginx Ingress Controller＠Ingress Controller
description: Nginx Ingress Controller＠Ingress Controllerの知見を記録しています。
---

# Nginx Ingress Controller＠Ingress Controller

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Nginx Ingress Controllerの仕組み

`L4`/`L7`ロードバランサーとして、インバウンド通信を`L4`/`L7`ロードバランシングする。

> - https://docs.nginx.com/nginx-ingress-controller/intro/how-nginx-ingress-controller-works/#the-ingress-controller-pod

<br>

## 02. マニフェスト

### Ingress

```yaml

```

<br>

### Service

#### ▼ FastCGIプロトコル

Nginx Ingress Controllerは、受信したリクエストをFastCGIプロトコルで転送できる。

ServiceはFastCGIプロトコルで転送できないが、代わりにNginx Ingress ControllerがFastCGIプロトコルで転送してくれる。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  selector:
    app: foo-app
  ports:
    # Nginx Ingress ControllerがTCPプロトコルに変換してくれる
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
