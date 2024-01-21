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

LAN内では、各機器はプライベートIPアドレスで識別されている。

LAN内に配置されたNATルーターが、WAN内のグローバルIPアドレスとLAN内のプライベートIPアドレスを相互変換する。

![network_lan](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/network_lan.jpeg)

> - http://qa.elecom.co.jp/faq_detail.html?id=4159&category=152

<br>

### LANの構成

#### ▼ サブネット

LANは、バリアセグメント、パブリックサブネット (非武装地帯) 、プライベートサブネット (内部ネットワーク) 、に分割できる。

AWSやGoogle Cloudでも、VPCを同様のサブネットに分割すると良い。

![internal_dmz_external](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/internal_dmz_external.png)

> - https://www.techtarget.com/searchsecurity/definition/DMZ
> - https://www.ntt.com/business/services/network/internet-connect/ocn-business/bocn/knowledge/archive_09.html

#### ▼ パブリックサブネット内のサーバー

攻撃の影響がプライベートサブネットに広がる可能性を防ぐために、外部から直接的にリクエストを受ける。

そのため、『DNSサーバー』『プロキシサーバー』『webサーバー』『メールサーバー』は、パブリックサブネットに配置すると良い。

#### ▼ プライベートサブネット内のサーバー

外部から直接的にリクエストを受けない。

そのため、『dbサーバー』は、プライベートサブネットに配置すると良い。

<br>

# 03. WAN：Wide Area Network

### WANとは

![network_wan](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/network_wan.png)

特定のLAN間のハブになるプライベートネットワークのこと。

インターネットサービスプロバイダーがサービスとして提供している。

WAN内では、各LANはグローバルIPアドレスで識別されている。

各LANがWANに接続するためには、DTE (例：ブロードバンドルーター、Wifiルーター) 、DCE (例：モデム) 、電柱にあるアクセス回線、が必要になる。

インターネットと比べて金銭的負担が大きく、帯域幅を考慮しなければならない。WANで帯域幅を拡大するためにはインターネットサービスプロバイダーの料金がかかる。

その一方で、通信の利用者が限られているため、サイバー攻撃の脆弱性が低い。

> - https://qiita.com/hymnofpeace/items/7f09a7a10e843552a8cb
> - https://xtech.nikkei.com/it/article/COLUMN/20080715/310872/

<br>

### WANの種類

#### ▼ 専用線方式

WANを介したプライベートな通信で、パケットの送信元と宛先が決まっており、特定のユーザーがアクセス回線を専有する。

他のLANから閉じられた専用のアクセス回線であり、特定のLAN間のみでパケット通信を実行する。

> - http://makiyamashinji.web.fc2.com/emprus/design/wan.html

#### ▼ 回線交換方式

WANを介したプライベートな通信で、パケットの送信元と宛先が決まっておらず、複数のユーザーでWAFを共有する。

ただし、特定のユーザーのパケットがアクセス回線を通過している間、他のユーザーはアクセス回線を使用できない。

少数対少数でパケット通信を実行するため、送信時に、送信者と受信者の宛先情報は不要である。

![waf_circuit-switching-system](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/waf_circuit-switching-system.png)

> - https://www.itpassportsiken.com/kakomon/28_haru/q71.html
> - https://www.infraexpert.com/study/wan3.html

#### ▼ パケット交換方式

WANを介したプライベートな通信で、パケットの送信元と宛先が決まっておらず、複数のユーザーでWAFを共有する。

複数のユーザーでアクセス回線を同時に使用できる。

対多数でパケット通信を実行するため、送信時に、送信者と受信者の宛先情報が必要になる。

![waf_packet-switching-system](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/waf_packet-switching-system.png)

> - https://www.itpassportsiken.com/kakomon/28_haru/q71.html
> - https://www.infraexpert.com/study/wan3.html

<br>

### WANの実現方法

WANの実現は、`1980`年代のアナログ専用線から始まった。

現在は、広域イーサネットやVPN (仮想プライベートネットワーク) を使用して、WANを実現するようになった。

![network_wan_history](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/network_wan_history.png)

<br>
