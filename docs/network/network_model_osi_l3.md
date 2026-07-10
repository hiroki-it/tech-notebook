---
title: 【IT技術の知見】L3＠OSI参照モデル
description: L3＠OSI参照モデルの知見を記録しています。
---

# L3＠OSI参照モデル

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ネットワーク層 (`L3`)

### ネットワーク層とは

異なるネットワーク間でパケットを相互にフォワーディングするプロトコル (例：IP、ICMP、NDP など) を処理する層である。

> - https://ja.wikipedia.org/wiki/%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%8D%E3%83%83%E3%83%88%E5%B1%A4

<br>

### ネットワーク層の仕組み

![ネットワークにおけるTCP_IPを使用したデータ通信](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ネットワークにおけるTCP_IPを使用したデータ通信.png)

IP パケットのヘッダー情報を使用して、宛先認識する。

`(1)`

: PC-A は、構成した IP パケットをイーサネットに乗せて、ルーターA に送信する。

`(2)`

: ルーターA は、IP パケットをデジタル専用線に乗せて、ルーターB に送信する。

`(3)`

: ルーターB は、構成した IP パケットをイーサネットに乗せて、Web サーバーに送信する。

     ルーターとWebサーバーの間に、プロキシサーバーを配置することもある。

<br>

## 02. リクエスト／レスポンス方式のプロトコル

### ICMP

Ping (ICMP エコーリクエスト) を送信するためのプロトコルである。

> - https://kaoru1615.hatenablog.com/entry/2018/01/17/213140

<br>
