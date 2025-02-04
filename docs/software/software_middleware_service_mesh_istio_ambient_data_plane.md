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

以下を設定し、`L4`インバウンド/アウトバウンド通信をztunnelのPodへルーティングできるようにする

- Nodeのiptables
- ztunnel Podのiptables

> - https://www.solo.io/blog/traffic-ambient-mesh-istio-cni-node-configuration

<br>

### ztunnel

Node外からの`L4`インバウンド通信をiptablesを介して受信し、Node内の宛先Podに送信する。

また一方で、送信元Podからの`L4`アウトバウンド通信をiptablesを介して受信し、Node外に送信する。

![istio_ambient-mesh_ztunnel](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ambient-mesh_ztunnel.png)

> - https://www.solo.io/blog/traffic-ambient-mesh-redirection-iptables-geneve-tunnels
> - https://www.solo.io/blog/traffic-ambient-mesh-ztunnel-ebpf-waypoint

<br>

### waypoint-proxy

Namespace外からの`L7`インバウンド通信を受信し、Namespace内の宛先Podに送信する。

アウトバウンド通信には関与せず、サーバー側のリバースプロキシとしてのみ機能する。

![istio_ambient-mesh_waypoint-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ambient-mesh_waypoint-proxy.png)

> - https://www.solo.io/blog/traffic-ambient-mesh-ztunnel-ebpf-waypoint

<br>
