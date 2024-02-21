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

メッセージブローカー (例：AWS MQ) よりも機能が少なくシンプルである。

また、メッセージキュー (例：AWS SNS) とは異なりメッセージをルーティングできるが、メッセージをキューイングできない。

パブリッシャーから発信されたメッセージをエンドポイントで受信し、サブスクライバーに転送する。

![SNSとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/SNSとは.png)

> - https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-difference-from-amazon-mq-sns.html

<br>

## 02. セットアップ

### コンソール画面の場合

| 設定項目           | 説明                                           |
| ------------------ | ---------------------------------------------- |
| トピック           | 複数のサブスクリプションをグループ化したもの。 |
| サブスクリプション | 宛先に送信するメッセージの種類を設定する。     |

### トピック

| 設定項目                 | 説明                                                                                                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| サブスクリプション       | サブスクリプションを登録する。                                                                                                                                    |
| アクセスポリシー         | トピックへの認可スコープを設定する。                                                                                                                              |
| 配信再試行ポリシー       | サブスクリプションのHTTP/HTTPSエンドポイントが失敗した時の再試行方法を設定する。<br>- https://docs.aws.amazon.com/sns/latest/dg/sns-message-delivery-retries.html |
| 配信ステータスのログ記録 | サブスクリプションへの発信のログをCloudWatchログに転送するように設定する。                                                                                        |
| 暗号化                   |                                                                                                                                                                   |

### サブスクリプション

| メッセージの種類      | 転送先                | 補足                                                                    |
| --------------------- | --------------------- | ----------------------------------------------------------------------- |
| Kinesis Data Firehose | Kinesis Data Firehose |                                                                         |
| SQS                   | SQS                   |                                                                         |
| Lambda                | Lambda                |                                                                         |
| Eメール               | 任意のメールアドレス  |                                                                         |
| HTTP/HTTPS            | 任意のドメイン名      | Chatbotのドメイン名は『`https://global.sns-api.chatbot.amazonaws.com`』 |
| `.json`形式のメール   | 任意のメールアドレス  |                                                                         |
| SMS                   | SMS                   | 受信者の電話番号を設定する。                                            |

<br>
