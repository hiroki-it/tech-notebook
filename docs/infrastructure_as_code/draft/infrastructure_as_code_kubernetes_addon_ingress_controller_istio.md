---
title: 【IT技術の知見】Istio Ingress Controller＠Ingress Controller
description: Istio Ingress Controller＠Ingress Controllerの知見を記録しています。
---

# Istio Ingress Controller＠Ingress Controller

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Istio Ingress Controller

`L4`/`L7`ロードバランサーとしての`istio-proxy`を使用して、通信をロードバランシングする。

GatewayとVirtualServiceからIstio IngressGateway/EgressGatewayを作成した場合と同様にして、Istio IngressGateway/EgressGatewayを作成する。

> - https://istio.io/latest/docs/tasks/traffic-management/ingress/kubernetes-ingress/

<br>
