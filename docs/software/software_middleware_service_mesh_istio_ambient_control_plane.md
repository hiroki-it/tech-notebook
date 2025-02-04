---
title: 【IT技術の知見】コントロールプレーン＠Istioアンビエント
description: コントロールプレーン＠Istioアンビエントの知見を記録しています。
---

# コントロールプレーン＠Istioアンビエント

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. アンビエントモードのコントロールプレーン

### 仕組み

記入中...

<br>

### Envoyの設定値への変換

(たぶん) Envoyの設定値は以下のように機能している。

送信元ztunnelのEnvoyの`L4`処理で

1. 前半のListenerとCluster：宛先マイクロサービスを決める
2. 後半のListenerとCluster：宛先waypoint-proxyを決める

waypoint-proxyのEnvoyの`L7`処理で

1. inbound_CONNECT_terminate Listener：HBORNを経由したリクエストを受信する
2. Internal Inbound VIP Cluster：Inbound VIP Listenerにルーティングする
3. Inbound VIP Listener：VirtualServiceのルーティングポリシーを適用する
4. Inbound VIP Cluster：Inbound Pod Listenerにロードバランシングする
5. Inbound Pod Listener：HBORNのメタデータをセットアップする
6. Inbound Pod Cluster
7. inbound_CONNECT_originate Listener
8. inbound_CONNECT_originate Cluster：宛先ztunnelを決める

宛先ztunnelのEnvoyの`L4`処理で

1. ListenerとCluster：宛先マイクロサービスを決める

> - https://jimmysong.io/en/blog/ambient-mesh-l7-traffic-path/
> - https://juejin.cn/post/7161975827473645575
> - https://www.zhaohuabing.com/post/2022-10-17-ambient-deep-dive-3/

<br>
