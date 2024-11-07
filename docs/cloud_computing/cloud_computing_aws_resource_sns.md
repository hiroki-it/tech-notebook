---
title: 【IT技術の知見】SNS＠AWSリソース
description: SNS＠AWSリソースの知見を記録しています。
---

# SNS＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. SNSとは：Simple Notification Service

クラウドパブリッシュ/サブスクライブシステムとして働く。

送受信が多対多のパブリッシュ/サブスクライブパターンであり、プッシュベースの通信方式である。

AWSのクラウドメッセージブローカー (例：AWS MQ) よりも機能が少なくシンプルである。

> - https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-difference-from-amazon-mq-sns.html
> - https://tech.asoview.co.jp/entry/2022/04/06/102637

<br>

## 01-02. 仕組み

メッセージキュー (例：AWS SQS) とは異なりメッセージをルーティングできるが、メッセージをキューイングできない。

パブリッシャーがパブリッシュしたメッセージをトピック (サブスクリプションのグループ) で受信し、サブスクライバーに転送する。

![SNSとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/SNSとは.png)

> - https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-difference-from-amazon-mq-sns.html

<br>

## 02. セットアップ

### コンソール画面の場合

| 設定項目           | 説明                                           |
| ------------------ | ---------------------------------------------- |
| トピック           | 複数のサブスクリプションをグループ化したもの。 |
| サブスクリプション | 宛先に送信するメッセージの種類を設定する。     |

<br>

### トピック

| 設定項目                 | 説明                                                                                                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| サブスクリプション       | サブスクリプションを登録する。                                                                                                                                    |
| アクセスポリシー         | トピックへの認可スコープを設定する。                                                                                                                              |
| 配信再試行ポリシー       | サブスクリプションのHTTP/HTTPSエンドポイントが失敗した時の再試行方法を設定する。<br>- https://docs.aws.amazon.com/sns/latest/dg/sns-message-delivery-retries.html |
| 配信ステータスのログ記録 | サブスクリプションへの発信のログをAWS CloudWatchログに転送するように設定する。                                                                                    |
| 暗号化                   |                                                                                                                                                                   |

<br>

### サブスクリプション

#### ▼ Kinesis Data Firehose

Kinesis Data Firehoseに送信する。

#### ▼ SQS

SQSに送信する。

#### ▼ AWS Lambda

AWS Lambdaに送信する。

#### ▼ Eメール

メールアドレスに送信する。

#### ▼ HTTP/HTTPS

Webhook用のエンドポイントに送信する。

- AWS Chatbotのドメイン名 (`https://global.sns-api.chatbot.amazonaws.com`)
- incident.io (`https://api.incident.io/v2/alert_events/cloudwatch/*****`)

#### ▼ `json`形式のメール

メースアドレスに`json`形式で送信する。

#### ▼ SMS

SMSに送信する。

電話番号を設定する必要がある。

<br>
