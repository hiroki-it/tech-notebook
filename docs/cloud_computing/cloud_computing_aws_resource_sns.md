---
title: 【IT技術の知見】Amazon SNS＠AWSリソース
description: Amazon SNS＠AWSリソースの知見を記録しています。
---

# Amazon SNS＠AWS リソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. Amazon SNS とは：Simple Notification Service

クラウドパブリッシュ／サブスクライブ方式のシステムとして働く。

送受信の関係が多対多のパブリッシュ／サブスクライブ方式であり、プッシュ型の通信方式である。

AWS のクラウドメッセージブローカー (例：AWS MQ) よりも機能が少なくシンプルである。

<table>
  <thead>
    <tr>
      <th></th>
      <th>Amazon SNS</th>
      <th>SQS</th>
      <th>EventBridge</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>処理</td>
      <td>ルーティング</td>
      <td>キューイング</td>
      <td>ルーティング</td>
    </tr>
    <tr>
      <td>通信方式</td>
      <td>プッシュ型のパブリッシュ／サブスクライブ方式</td>
      <td>プロデュース/コンシューム</td>
      <td>パブリッシュ／サブスクライブ方式</td>
    </tr>
  </tbody>
</table>

> - https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-difference-from-amazon-mq-sns.html
> - [Amazon Kinesis Data Streams + Protocol Buffersで実現するイベント駆動アーキテクチャー - asoview! Tech Blog](https://tech.asoview.co.jp/entry/2022/04/06/102637)

<br>

## 01-02. 仕組み

メッセージキュー (例：Amazon SQS) とは異なりメッセージをルーティングできるが、メッセージをキューイングできない。

パブリッシャーがパブリッシュしたメッセージをトピック (サブスクリプションのグループ) で受信し、サブスクライバーにフォワーディングする。

![Amazon SNS とは](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Amazon SNS とは.png)

> - https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-difference-from-amazon-mq-sns.html

<br>

## 02. セットアップ

### コンソール画面の場合

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>トピック</td>
      <td>複数のサブスクリプションをグループ化したもの。</td>
    </tr>
    <tr>
      <td>サブスクリプション</td>
      <td>宛先に送信するメッセージの種類を設定する。</td>
    </tr>
  </tbody>
</table>

<br>

### トピック

<table>
  <thead>
    <tr>
      <th>設定項目</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>サブスクリプション</td>
      <td>サブスクリプションを登録する。</td>
    </tr>
    <tr>
      <td>アクセスポリシー</td>
      <td>トピックへの認可スコープを設定する。</td>
    </tr>
    <tr>
      <td>配信リトライポリシー</td>
      <td>サブスクリプションの HTTP/HTTPS エンドポイントが失敗したときのリトライ方法を設定する。<br>- <a href="https://docs.aws.amazon.com/sns/latest/dg/sns-message-delivery-retries.html">https://docs.aws.amazon.com/sns/latest/dg/sns-message-delivery-retries.html</a></td>
    </tr>
    <tr>
      <td>配信ステータスのログ記録</td>
      <td>サブスクリプションへの発信のログを Amazon CloudWatch Logs にフォワーディングするように設定する。</td>
    </tr>
    <tr>
      <td>暗号化</td>
      <td></td>
    </tr>
  </tbody>
</table>

<br>

### サブスクリプション

#### ▼ Kinesis Data Firehose

Kinesis Data Firehose に送信する。

#### ▼ Amazon SQS

SQS に送信する。

#### ▼ AWS Lambda

AWS Lambda に送信する。

#### ▼ E メール

メールアドレスに送信する。

#### ▼ HTTP/HTTPS

Webhook リクエスト用のエンドポイントに送信する。

- AWS Chatbot のドメイン名 (`https://global.sns-api.chatbot.amazonaws.com`)
- incident.io (`https://api.incident.io/v2/alert_events/cloudwatch/*****`)

#### ▼ `json` 形式のメール

メースアドレスに `json` 形式で送信する。

#### ▼ SMS

SMS に送信する。

電話番号を設定する必要がある。

<br>
