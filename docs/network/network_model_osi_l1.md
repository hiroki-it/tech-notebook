---
title: 【IT技術の知見】L1＠OSI参照モデル
description: L1＠OSI参照モデルの知見を記録しています。
---

# L1＠OSI参照モデル

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 物理層 (`L1`)

### 物理層とは

ケーブルや通信信号を処理する層である。

> - https://hogetech.info/network/osi/layer1

<br>

## 02. LAN：Local Area Network

### LANとは

限定された領域のみで通信できるネットワークのこと。

LAN 内では、各機器はプライベート IP アドレスで識別されている。

LAN 内に配置された NAT ルーターが、WAN 内のグローバル IP アドレスと LAN 内のプライベート IP アドレスを相互変換する。

![network_lan](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/network_lan.jpeg)

> - http://qa.elecom.co.jp/faq_detail.html?id=4159&category=152

<br>

### LANの構成

#### ▼ サブネット

LAN は、バリアセグメント、パブリックサブネット (非武装地帯) 、プライベートサブネット (内部ネットワーク) 、に分割できる。

AWS や Google Cloud でも、VPC を同様のサブネットに分割するとよい。

![internal_dmz_external](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/internal_dmz_external.png)

> - https://www.techtarget.com/searchsecurity/definition/DMZ
> - https://www.ntt.com/business/services/network/internet-connect/ocn-business/bocn/knowledge/archive_09.html

#### ▼ パブリックサブネット内のサーバー

攻撃の影響がプライベートサブネットに広がる可能性を防ぐために、外部から直接的にリクエストを受ける。

そのため、『DNS サーバー』『プロキシサーバー』『Web サーバー』『メールサーバー』は、パブリックサブネットに配置するとよい。

#### ▼ プライベートサブネット内のサーバー

外部から直接的にリクエストを受けない。

そのため、『DB サーバー』は、プライベートサブネットに配置するとよい。

<br>

## 03. WAN：Wide Area Network

### WANとは

![network_wan](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/network_wan.png)

特定の LAN 間のハブになるプライベートネットワークのこと。

インターネットサービスプロバイダーがサービスとして提供している。

WAN 内では、各 LAN はグローバル IP アドレスで識別されている。

各 LAN が WAN に接続するためには、DTE (例：ブロードバンドルーター、Wifi ルーター) 、DCE (例：モデム) 、電柱にあるアクセス回線が必要になる。

インターネットと比べて金銭的負担が大きく、帯域幅を考慮しなければならない。WAN で帯域幅を拡大するためにはインターネットサービスプロバイダーの料金がかかる。

その一方で、通信の利用者が限られているため、サイバー攻撃の脆弱性が低い。

> - https://qiita.com/hymnofpeace/items/7f09a7a10e843552a8cb
> - https://xtech.nikkei.com/it/article/COLUMN/20080715/310872/

<br>

### WANの種類

#### ▼ 専用線方式

WAN を経由したプライベートな通信時、パケットの送信元と宛先が決まっており、特定のユーザーがアクセス回線を占有する。

他の LAN から閉じられた専用のアクセス回線であり、特定の LAN 間のみでパケット通信する。

他の WAN よりも、安定した通信速度で安全に通信できる。

> - http://makiyamashinji.web.fc2.com/emprus/design/wan.html

#### ▼ 回線交換方式

WAN を経由したプライベートな通信時、パケットの送信元と宛先が決まっておらず、複数のユーザーで Web アプリファイアウォールを共有する。

ただし、特定のユーザーのパケットがアクセス回線を通過している間、他のユーザーはアクセス回線を使用できない。

少数対少数でパケット通信するため、送信時、送信者と受信者の宛先情報は不要である。

![waf_circuit-switching-system](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/waf_circuit-switching-system.png)

> - https://www.itpassportsiken.com/kakomon/28_haru/q71.html
> - https://www.infraexpert.com/study/wan3.html

#### ▼ パケット交換方式

WAN を経由したプライベートな通信時、パケットの送信元と宛先が決まっておらず、複数のユーザーで Web アプリファイアウォールを共有する。

複数のユーザーでアクセス回線を同時に使用できる。

対多数でパケット通信するため、送信時、送信者と受信者の宛先情報が必要になる。

![waf_packet-switching-system](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/waf_packet-switching-system.png)

> - https://www.itpassportsiken.com/kakomon/28_haru/q71.html
> - https://www.infraexpert.com/study/wan3.html

<br>

### WANの実現方法

WAN の実現は、`1980` 年代のアナログ専用線から始まった。

現在は、広域イーサネットや VPN (仮想プライベートネットワーク) を使用して、WAN を実現するようになった。

![network_wan_history](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/network_wan_history.png)

<br>
