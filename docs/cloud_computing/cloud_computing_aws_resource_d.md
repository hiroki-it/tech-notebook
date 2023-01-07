---
title: 【IT技術の知見】Dで始まるAWSリソース＠AWS
description: Dで始まるAWSリソース＠AWSの知見を記録しています。
---

# ```D```で始まるAWSリソース＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>


## 01. Direct Connect

### Direct Connectとは

![direct-connect](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/direct-connect.png)

専用線方式のWANとして動作し、AWS側のプライベートネットワーク（VPC）と、ユーザー側のプライベートネットワークの間を接続する。

注意点として、DirectConnectは、それ専用の中継VPC内に作成する。



> ℹ️ 参考：https://prtimes.jp/main/html/rd/p/000000050.000009999.html

WANの種類については、以下のリンクを参考にせよ。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/network/network.html

<br>
