---
title: 【IT技術の知見】Cloud Pub/Sub＠Google Cloudリソース
description: Cloud Pub/Sub＠Google Cloudリソースの知見を記録しています。
---

# Cloud Pub/Sub＠Google Cloud

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Cloud Pub/Subとは

パブリッシャーからのメッセージをトピックで受信し、サブスクライバーにこれを送信する。

![google_cloud_pub_sub](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/google_cloud_pub_sub.png)

> - https://cloud.google.com/pubsub/docs/pubsub-basics?hl=ja

<br>

## 02. セットアップ

### コンソール画面からのセットアップ

| 項目               | 説明                                                      |
| ------------------ | --------------------------------------------------------- |
| トピック           | 複数のサブスクリプションをグループ化したもの。            |
| サブスクリプション | 宛先に送信するメッセージの種類、宛先URL、などを設定する。 |

<br>
