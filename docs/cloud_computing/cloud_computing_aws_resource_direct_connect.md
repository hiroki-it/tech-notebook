---
title: 【IT技術の知見】Direct Connect＠AWSリソース
description: Direct Connect＠AWSリソースの知見を記録しています。
---

# Direct Connect＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Direct Connectとは

専用線方式のWANとして動作し、AWS側の単一のプライベートネットワーク (VPC) と、ユーザー側のプライベートネットワークの間を接続する。

注意点として、DirectConnectは、それ専用の中継VPC内に作成する。

![direct-connect](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/direct-connect.png)

> - https://prtimes.jp/main/html/rd/p/000000050.000009999.html

<br>

## 02. セットアップ

### アタッチメント

DirectConnectと他AWSリソースを接続する。

通信の帯域幅を設定できる。

<br>

### DirectConnect Gateway

DirectConnectと複数のプライベートネットワーク (VPC) をアタッチメントで接続する。

TransitGatewayが必要になるため、各VPC上にそのためのルートテーブルを作成する必要がある。

> - https://docs.aws.amazon.com/whitepapers/latest/aws-vpc-connectivity-options/aws-direct-connect-aws-transit-gateway.html
> - https://medium.com/@datapath_io/aws-direct-connect-vs-vpn-vs-direct-connect-gateway-97900cdf7d04

<br>
