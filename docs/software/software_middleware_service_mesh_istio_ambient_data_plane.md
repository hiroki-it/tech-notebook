---
title: 【IT技術の知見】データプレーン＠Istioアンビエント
description: データプレーン＠Istioアンビエントの知見を記録しています。
---

# データプレーン＠Istioアンビエント

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. データプレーンとは

記入中...

<br>

## 02. データプレーンの要素

### istio-cni

以下を設定し、`L4`インバウンド/アウトバウンド通信をztunnel Podへリダイレクトできるようにする。

- Nodeのiptables
- ztunnel Podのiptables
- geneve tunnel

また、ztunnelが受信ポートを公開するように、通知する。

なお、執筆時点 (2025/02/04) で実験段階ではあるが、iptablesとgeneve tunnelの代わりにeBPFを使用する方法もある。

> - https://sreake.com/blog/istio-ambient-mesh-inpod-redirection/#inpod_redirection_%E3%82%A2%E3%83%BC%E3%82%AD%E3%83%86%E3%82%AF%E3%83%81%E3%83%A3
> - https://www.solo.io/blog/traffic-ambient-mesh-istio-cni-node-configuration
> - https://www.rfc-editor.org/rfc/rfc8926.html

<br>

### ztunnel

#### ▼ ztunnelとは

サービスメッシュ内の`L4`トラフィックを管理する。

#### ▼ 新しい仕組み (inpod redirection)

ztunnelへのリダイレクトの仕組みは一度リプレイスされている。

新しい仕組みでは、サイドカーパターンでアプリコンテナからの通信が`istio-proxy`コンテナにリダイレクトされるのと同じような仕組みになっている。

![istio_ambient-mesh_ztunnel_inpod-redirection_l4_overview](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ambient-mesh_ztunnel_inpod-redirection_l4_overview.png)

アウトバウンドの仕組みは以下の通りである。

1. Pod内アプリコンテナが`L4`アウトバウンド通信を送信する。
2. Pod内iptablesが通信をztunnel Podにリダイレクトする。
3. ztunnel Podは通信を宛先に送信する。

一方で、インバウンドの仕組みは以下の通りである。

1. Podが`L4`インバウンド通信を受信する。
2. Pod内iptablesが通信をztunnel Podにリダイレクトする。
3. Pod内アプリコンテナが`L4`アウトバウンド通信を受信する。

![istio_ambient-mesh_ztunnel_inpod-redirection_l4_detail](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ambient-mesh_ztunnel_inpod-redirection_l4_detail.png)

> - https://www.solo.io/blog/istio-ambient-mesh-any-cni
> - https://medium.com/@Nick_Chekushkin/implementation-and-benefits-of-istio-ambient-mesh-optimizing-resources-and-improving-security-in-189ce4bad313
> - https://imesh.ai/blog/istio-ambient-install-eks/

#### ▼ 古い仕組み

ztunnelへのリダイレクトの仕組みは一度リプレイスされている。

新しい仕組みは『inpod redirection』と呼ばれている。

> - https://www.solo.io/blog/istio-ambient-mesh-any-cni
> - https://www.solo.io/blog/traffic-ambient-mesh-redirection-iptables-geneve-tunnels
> - https://www.solo.io/blog/traffic-ambient-mesh-ztunnel-ebpf-waypoint

<br>

### waypoint-proxy

#### ▼ waypoint-proxyとは

サービスメッシュ内の`L7`トラフィックを管理する。

#### ▼ 仕組み

Namespace外からの`L7`インバウンド通信を受信し、Namespace内の宛先Podに送信する。

#### ▼ Namespaceのリバースプロキシとして

waypoint-proxyは、Namespaceのリバースプロキシである。

アウトバウンド通信には関与せず、サーバー側のリバースプロキシとしてのみ機能する。

![istio_ambient-mesh_waypoint-proxy_inpod-redirection_l7](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ambient-mesh_waypoint-proxy_inpod-redirection_l7.png)

> - https://www.solo.io/blog/traffic-ambient-mesh-ztunnel-ebpf-waypoint

<br>
