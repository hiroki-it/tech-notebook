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

#### ▼ アウトバウンド通信

送信元Podからの`L4`アウトバウンド通信をiptablesとgeneve tunnelを介して受信し、Node外に送信する。

なお、執筆時点 (2025/02/04) で実験段階ではあるが、iptablesの代わりにeBPFを使用する方法もある。

![istio_ambient-mesh_ztunnel_outbound](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ambient-mesh_ztunnel_outbound.png)

> - https://www.solo.io/blog/traffic-ambient-mesh-redirection-iptables-geneve-tunnels
> - https://www.solo.io/blog/traffic-ambient-mesh-ztunnel-ebpf-waypoint

#### ▼ インバウンド通信

他Node上のztunnel Podからの`L4`インバウンド通信をHBORNとiptablesを介して受信し、Node内の宛先Podに送信する。

なお、執筆時点 (2025/02/04) で実験段階ではあるが、iptablesの代わりにeBPFを使用する方法もある。

![istio_ambient-mesh_ztunnel_inbound](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ambient-mesh_ztunnel_inbound.png)

> - https://www.solo.io/blog/traffic-ambient-mesh-redirection-iptables-geneve-tunnels
> - https://www.solo.io/blog/traffic-ambient-mesh-ztunnel-ebpf-waypoint

<br>

### waypoint-proxy

Namespace外からの`L7`インバウンド通信を受信し、Namespace内の宛先Podに送信する。

アウトバウンド通信には関与せず、サーバー側のリバースプロキシとしてのみ機能する。

![istio_ambient-mesh_waypoint-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_ambient-mesh_waypoint-proxy.png)

> - https://www.solo.io/blog/traffic-ambient-mesh-ztunnel-ebpf-waypoint

<br>
