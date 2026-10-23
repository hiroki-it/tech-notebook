---
title: 【IT技術の知見】AWS Chatbot＠AWSリソース
description: AWS Chatbot＠AWSリソースの知見を記録しています。
---

# AWS Chatbot＠AWS リソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. AWS Chatbot とは

SNS を経由して、Amazon CloudWatch からの通知をチャットアプリケーションにフォワーディングする AWS リソース。

![AWS ChatbotとSNSの連携](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ChatbotとSNSの連携.png)

<br>

## 02. セットアップ

### コンソール画面の場合

#### ▼ Slack 通知の場合

クライアントを Slack とした場合の設定を以下に示す。

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Slack チャンネル</td>
      <td>通知のフォワーディング先の Slack チャンネルを設定する。</td>
    </tr>
    <tr>
      <td>アクセス許可</td>
      <td>SNS を経由して、Amazon CloudWatch にリクエストを送信するためのロールを設定する。</td>
    </tr>
    <tr>
      <td>SNS トピック</td>
      <td>Amazon CloudWatch へのアクセス時経由する、SNS トピックを設定する。</td>
    </tr>
  </tbody>
</table>

#### ▼ サポート対象のイベント

AWS リソースのイベントを、Amazon EventBridge (Amazon CloudWatch イベント) を使用して、AWS Chatbot にフォワーディングできるが、すべての AWS リソースをサポートしているわけではない。

サポート対象の AWS リソースは以下のリンクを参考にせよ。

> - [Monitoring AWS services using Amazon Q Developer in chat applications - Amazon Q Developer in chat applications](https://docs.aws.amazon.com/chatbot/latest/adminguide/related-services.html#cloudwatchevents)

<br>
