---
title: 【IT技術の知見】Kong Ingress
description: Kong Ingressの知見を記録しています。
---

# Kong Ingress

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. KongIngress

### KongIngress とは

Ingress では設定できない Kong 固有のプロキシ、ルート、アップストリームの設定を、Ingress や Service に追加するカスタムリソースである。

> - https://docs.konghq.com/kubernetes-ingress-controller/latest/concepts/custom-resources/#kongingress

<br>

## 02. KongPlugin

### KongPlugin とは

KongIngress を拡張する。

> - https://docs.konghq.com/kubernetes-ingress-controller/latest/concepts/custom-resources/#kongplugin

<br>
