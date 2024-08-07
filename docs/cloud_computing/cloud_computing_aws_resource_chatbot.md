---
title: 【IT技術の知見】Chatbot＠AWSリソース
description: Chatbot＠AWSリソースの知見を記録しています。
---

# Chatbot＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Chatbotとは

SNSを経由して、CloudWatchからの通知をチャットアプリケーションに転送するAWSリソース。

![ChatbotとSNSの連携](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ChatbotとSNSの連携.png)

<br>

## 02. セットアップ

### コンソール画面の場合

#### ▼ Slack通知の場合

クライアントをSlackとした場合の設定を以下に示す。

| 設定項目        | 説明                                                                    |
| --------------- | ----------------------------------------------------------------------- |
| Slackチャンネル | 通知の転送先のSlackチャンネルを設定する。                               |
| アクセス許可    | SNSを経由して、CloudWatchにリクエストを送信するためのロールを設定する。 |
| SNSトピック     | CloudWatchへのアクセス時経由する、SNSトピックを設定する。               |

#### ▼ サポート対象のイベント

AWSリソースのイベントを、EventBridge (CloudWatchイベント) を使用して、Chatbotに転送できるが、全てのAWSリソースをサポートしているわけではない。

サポート対象のAWSリソースは以下のリンクを参考にせよ。

> - https://docs.aws.amazon.com/chatbot/latest/adminguide/related-services.html#cloudwatchevents

<br>
