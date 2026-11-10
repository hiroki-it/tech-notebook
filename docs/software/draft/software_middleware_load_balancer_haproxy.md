---
title: 【IT技術の知見】HAProxy
description: HAProxyの知見を記録しています。
---

# HAProxy

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. HAProxy の仕組み

### アーキテクチャ

HAProxy は、frontend セクションでクライアントからのリクエストを受信し、backend セクションに定義したサーバーにリクエストを振り分ける。

<br>

## 02. ユースケース

### `L4`/`L7` ロードバランサーのミドルウェアとして

#### ▼ `L7` ロードバランサーの場合

`L7` ロードバランサーとして使用でき、HTTP リクエストのパスやヘッダーを基にルーティングできる。

#### ▼ `L4` ロードバランサーの場合

`L4` ロードバランサーとして使用できる。

![haproxy_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/haproxy_architecture.png)

> - https://www.serverlab.ca/tutorials/linux/network-services/haproxy-loadbalancer-ubuntu-14-server/

<br>
