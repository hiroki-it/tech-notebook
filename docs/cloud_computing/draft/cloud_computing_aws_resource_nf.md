---
title: 【IT技術の知見】NF＠AWSリソース
description: NF＠AWSリソース
---

# NF＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. NFとは：Network Firewall

`L3` (ネットワーク層) 〜 `L4` (トランスポート層) に対するサイバー攻撃を防御する。

NFを使用する場合は、Firewallサブネットを作成することになる。

通信経路の一例として、以下がある。

```yaml
インターネットゲートウェイ
⬇︎
⬇︎
⬇︎
Network Firewall
⬇︎
⬇︎
⬇︎
ALB
⬇︎
⬇︎
⬇︎
EC2
```

> - https://aws.amazon.com/blogs/networking-and-content-delivery/deployment-models-for-aws-network-firewall/

<br>
