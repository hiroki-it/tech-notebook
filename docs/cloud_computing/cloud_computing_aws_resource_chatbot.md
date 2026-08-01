---
title: 【IT技術の知見】AWS Chatbot＠AWSリソース
description: AWS Chatbot＠AWSリソースの知見を記録しています。
---

# AWS Chatbot＠AWS リソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS Chatbot とは

SNS を経由して、Amazon CloudWatch からの通知をチャットアプリケーションにフォワーディングする AWS リソース。

![AWS ChatbotとSNSの連携](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ChatbotとSNSの連携.png)

<br>

## 02. セットアップ

### コンソール画面の場合

#### ▼ Slack 通知の場合

クライアントを Slack とした場合の設定を以下に示す。

| 設定項目         | 説明                                                                             |
| ---------------- | -------------------------------------------------------------------------------- |
| Slack チャンネル | 通知のフォワーディング先の Slack チャンネルを設定する。                          |
| アクセス許可     | SNS を経由して、Amazon CloudWatch にリクエストを送信するためのロールを設定する。 |
| SNS トピック     | Amazon CloudWatch へのアクセス時経由する、SNS トピックを設定する。               |

#### ▼ サポート対象のイベント

AWS リソースのイベントを、Amazon EventBridge (Amazon CloudWatch イベント) を使用して、AWS Chatbot にフォワーディングできるが、すべての AWS リソースをサポートしているわけではない。

サポート対象の AWS リソースは以下のリンクを参考にせよ。

> - https://docs.aws.amazon.com/chatbot/latest/adminguide/related-services.html#cloudwatchevents

<br>
