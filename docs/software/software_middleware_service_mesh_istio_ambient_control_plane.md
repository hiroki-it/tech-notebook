---
title: 【IT技術の知見】コントロールプレーン＠Istioアンビエント
description: コントロールプレーン＠Istioアンビエントの知見を記録しています。
---

# コントロールプレーン＠Istio アンビエント

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. アンビエントモードのコントロールプレーン

### 仕組み

記入中...

<br>

### Envoy の設定値への変換

ztunnel は Envoy プロセスではないため、Envoy の Listener と Cluster による処理は waypoint-proxy が担う。

送信元 ztunnel はアウトバウンド通信を透過的に捕捉し、HBONE トンネルを介して waypoint-proxy に中継する。

(たぶん) waypoint-proxy の Envoy の `L7` 処理では、以下のように設定値が機能している。

1. inbound_CONNECT_terminate Listener：HBONE を経由したリクエストを受信する
2. Internal Inbound VIP Cluster：Inbound VIP Listener にルーティングする
3. Inbound VIP Listener：VirtualService のルーティングポリシーを適用する
4. Inbound VIP Cluster：Inbound Pod Listener にロードバランシングする
5. Inbound Pod Listener：HBONE のメタデータをセットアップする
6. Inbound Pod Cluster
7. inbound_CONNECT_originate Listener
8. inbound_CONNECT_originate Cluster：宛先 ztunnel を決める

宛先 ztunnel は waypoint-proxy から HBONE トンネルを介して通信を受信し、宛先マイクロサービスに中継する。

> - https://jimmysong.io/en/blog/ambient-mesh-l7-traffic-path/
> - https://juejin.cn/post/7161975827473645575
> - https://www.zhaohuabing.com/post/2022-10-17-ambient-deep-dive-3/

<br>
