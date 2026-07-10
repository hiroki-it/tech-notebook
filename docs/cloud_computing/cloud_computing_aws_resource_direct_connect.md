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

専用線方式の WAN として動作し、AWS 側の単一のプライベートネットワーク (Amazon VPC) と、ユーザー側のプライベートネットワーク (例：オンプレミス) の間を接続する。

専用線方式では、帯域を占有でき、ネットワーク間は安定した速度で通信できる。

注意点として、DirectConnect は、それ専用の中継 Amazon VPC 内に作成する。

![direct-connect](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/direct-connect.png)

> - https://prtimes.jp/main/html/rd/p/000000050.000009999.html

<br>

## 02. セットアップ

### アタッチメント

DirectConnect と他 AWS リソースを接続する。

通信の帯域幅を設定できる。

<br>

### DirectConnect Gateway

DirectConnect と複数のプライベートネットワーク (Amazon VPC) をアタッチメントで接続する。

TransitGateway が必要になるため、各 Amazon VPC 上にそのためのルートテーブルを作成する必要がある。

> - https://docs.aws.amazon.com/whitepapers/latest/aws-vpc-connectivity-options/aws-direct-connect-aws-transit-gateway.html
> - https://medium.com/@datapath_io/aws-direct-connect-vs-vpn-vs-direct-connect-gateway-97900cdf7d04

<br>

## 03. アプリケーションデータの暗号化

### IPSec

AWS Site-to-Site VPN を採用する場合、 IPSec を使用してアプリケーションデータだけでなくパケットペイロード全体を暗号化できる。

> - https://docs.aws.amazon.com/directconnect/latest/UserGuide/encryption-in-transit.html
> - https://xtech.nikkei.com/it/article/COLUMN/20080609/307119/

<br>

### MACsec

MACsec を有効化した場合、MACsec を使用してアプリケーションデータを暗号化できる。

> - https://docs.aws.amazon.com/directconnect/latest/UserGuide/encryption-in-transit.html
> - https://blog.serverworks.co.jp/everyday-aws-172

<br>
