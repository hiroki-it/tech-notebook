---
title: 【IT技術の知見】Cで始まるAWSリソース＠AWS
description: Cで始まるAWSリソース＠AWSの知見を記録しています。
---

# `C`で始まるAWSリソース＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Chatbot

### Chatbotとは

SNSを経由して、CloudWatchからの通知をチャットアプリケーションに転送するAWSリソース。

![ChatbotとSNSの連携](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ChatbotとSNSの連携.png)

<br>

## 01-02. セットアップ

### コンソール画面の場合

#### ▼ slack通知の場合

クライアントをSlackとした場合の設定を以下に示す。

| 設定項目        | 説明                                                          |
| --------------- | ------------------------------------------------------------- |
| Slackチャンネル | 通知の転送先のSlackチャンネルを設定する。                     |
| アクセス許可    | SNSを介して、CloudWatchにアクセスするためのロールを設定する。 |
| SNSトピック     | CloudWatchへのアクセス時経由する、SNSトピックを設定する。     |

#### ▼ サポート対象のイベント

AWSリソースのイベントを、EventBridge (CloudWatchイベント) を使用して、Chatbotに転送できるが、全てのAWSリソースをサポートしているわけではない。

サポート対象のAWSリソースは以下のリンクを参考にせよ。

> ↪️ 参考：https://docs.aws.amazon.com/chatbot/latest/adminguide/related-services.html#cloudwatchevents

#### ▼ インシデント

４大シグナルを含む、システム的に良くない事象のこと。

#### ▼ オンコール

インシデントを通知するようにし、通知を受けて対応すること。

<br>

## 02. CloudTrail

### CloudTrailとは

IAMユーザーによる操作や、ロールの紐付けの履歴を記録し、ログファイルとしてS3に転送する。

CloudWatchと連携もできる。

![CloudTrailとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/CloudTrailとは.jpeg)

### 使用履歴の確認

AWSリソースに、使用中かどうかわからずに、削除できないものがあるとする。

このような場合、CloudTrailでAWSリソースを検索し、履歴がなければ使用していないと判断できる。

<br>

## 03. ControlTower

### ControlTowerとは

複数のAWSアカウントとIAMグループを`1`個のダッシュボードで管理する。

既存のアカウントをControlTowerに移行する場合、既存のアカウントで作成されたIAMユーザーとIAMグループが不要になるため、これらを削除する必要がある。

<br>
