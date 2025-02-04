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

以下を設定し、`L4`インバウンド/アウトバウンド通信をztunnel Podへリダイレクトできるようにする

- Nodeのiptables
- ztunnel Podのiptables
- geneve tunnel

なお、執筆時点 (2025/02/04) で実験段階ではあるが、iptablesとgeneve tunnelの代わりにeBPFを使用する方法もある。

> - https://www.solo.io/blog/traffic-ambient-mesh-istio-cni-node-configuration
> - https://www.rfc-editor.org/rfc/rfc8926.html

<br>

### ztunnel

#### ▼ inpod redirectionによるアウトバウンド通信

1. Pod内コンテナが`L4`アウトバウンド通信を送信する。
2. Pod内iptablesが通信をztunnel Podにリダイレクトする。
3. ztunnel Podは通信を宛先に送信する。

![istio_ambient-mesh_ztunnel_inpod-redirection](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ambient-mesh_ztunnel_inpod-redirection.png)

> - https://www.solo.io/blog/istio-ambient-mesh-any-cni

#### ▼ inpod redirectionによるインバウンド通信

1. Podが`L4`インバウンド通信を受信する。
2. Pod内iptablesが通信をztunnel Podにリダイレクトする。
3. Pod内コンテナが`L4`アウトバウンド通信を受信する。

![istio_ambient-mesh_ztunnel_inpod-redirection](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ambient-mesh_ztunnel_inpod-redirection.png)

> - https://www.solo.io/blog/istio-ambient-mesh-any-cni

#### ▼ 古い仕組み

ztunnelへのリダイレクトの仕組みは一度リプレイスされている。

新しい仕組みは『inpod redirection』と呼ばれている。

> - https://www.solo.io/blog/istio-ambient-mesh-any-cni
> - https://www.solo.io/blog/traffic-ambient-mesh-redirection-iptables-geneve-tunnels
> - https://www.solo.io/blog/traffic-ambient-mesh-ztunnel-ebpf-waypoint

<br>

### waypoint-proxy

Namespace外からの`L7`インバウンド通信を受信し、Namespace内の宛先Podに送信する。

アウトバウンド通信には関与せず、サーバー側のリバースプロキシとしてのみ機能する。

![istio_ambient-mesh_waypoint-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ambient-mesh_waypoint-proxy.png)

> - https://www.solo.io/blog/traffic-ambient-mesh-ztunnel-ebpf-waypoint

<br>
