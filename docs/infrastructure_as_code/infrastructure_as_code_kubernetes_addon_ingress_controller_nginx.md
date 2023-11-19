---
title: 【IT技術の知見】Nginx Ingressコントローラー＠Ingressコントローラー
description: Nginx Ingressコントローラー＠Ingressコントローラーの知見を記録しています。
---

# Nginx Ingressコントローラー＠Ingressコントローラー

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Nginx Ingressコントローラーの仕組み

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
