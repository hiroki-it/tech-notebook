---
title: 【IT技術の知見】Nginx Ingress Controller＠Ingress Controller
description: Nginx Ingress Controller＠Ingress Controllerの知見を記録しています。
---

# Nginx Ingress Controller＠Ingress Controller

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. Nginx Ingress Controller の仕組み

`L4`/`L7` ロードバランサーとして、インバウンド通信を `L4`/`L7` ロードバランシングする。

> - https://docs.nginx.com/nginx-ingress-controller/intro/how-nginx-ingress-controller-works/#the-ingress-controller-pod

<br>

## 02. マニフェスト

### Ingress

Ingress の `.spec.ingressClassName` キーに Nginx Ingress Controller の IngressClass 名を設定すると、Nginx Ingress Controller が Ingress のルーティングルールを Nginx の設定ファイルに反映する。

<br>

### Service

#### ▼ FastCGI プロトコル

Nginx Ingress Controller は、受信したリクエストを FastCGI プロトコルでフォワーディングできる。

Service は FastCGI プロトコルでフォワーディングできないが、代わりに Nginx Ingress Controller が FastCGI プロトコルでフォワーディングしてくれる。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: foo-service
spec:
  selector:
    app: foo-app
  ports:
    # Nginx Ingress Controller が TCP プロトコルに変換してくれる
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

> - [Exposing FCGI services - Ingress-Nginx Controller](https://kubernetes.github.io/ingress-nginx/user-guide/fcgi-services/)
> - [How to Connect NGINX to PHP-FPM Using UNIX or TCP/IP Socket](https://www.tecmint.com/connect-nginx-to-php-fpm/)

<br>
