---
title: 【IT技術の知見】L3＠OSI参照モデル
description: L3＠OSI参照モデルの知見を記録しています。
---

# L3＠OSI参照モデル

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ネットワーク層 (`L3`)

### ネットワーク層とは

異なるネットワーク間でパケットを相互に転送するプロトコル (例：IP、ICMP、NDP、など) を処理するレイヤーである。

> ↪️：https://ja.wikipedia.org/wiki/%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%8D%E3%83%83%E3%83%88%E5%B1%A4

<br>

### ネットワーク層の仕組み

![ネットワークにおけるTCP_IPを使用したデータ通信](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ネットワークにおけるTCP_IPを使用したデータ通信.png)

IPパケットのヘッダ情報を使用して、宛先認識する。

`【１】`

: PC-Aは、構成したIPパケットをEthernetに乗せて、ルーターAに送信する。

`【２】`

: ルーターAは、IPパケットをデジタル専用線に乗せて、ルーターBに送信する。

`【３】`

: ルーターBは、構成したIPパケットをEthernetに乗せて、webサーバーに送信する。ルーターとwebサーバーの間に、プロキシサーバーを配置することもある。

<br>
