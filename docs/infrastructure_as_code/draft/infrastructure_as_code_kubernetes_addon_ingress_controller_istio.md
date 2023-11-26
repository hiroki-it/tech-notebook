---
title: 【IT技術の知見】Istio Ingressコントローラー＠Ingressコントローラー
description: Istio Ingressコントローラー＠Ingressコントローラーの知見を記録しています。
---

# Istio Ingressコントローラー＠Ingressコントローラー

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Istio Ingressコントローラー

`L4`/`L7`ロードバランサーとしての`istio-proxy`を使用して、通信をロードバランシングする。

GatewayとVirtualServiceからIstio IngressGatewayを作成した場合と同様にして、Istio IngressGatewayを作成する。

> - https://istio.io/latest/docs/tasks/traffic-management/ingress/kubernetes-ingress/

<br>
