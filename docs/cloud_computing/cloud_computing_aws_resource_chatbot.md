---
title: 【IT技術の知見】AWS Chatbot
description: AWS Chatbotの知見を記録しています。
tags:
  - "3大クラウド"
  - "AWS"
  - "AWSリソース"
---

# AWS Chatbot

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要


SNS を経由して、Amazon CloudWatch からの通知をチャットアプリケーションにフォワーディングする AWS リソース。

![AWS ChatbotとSNSの連携](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ChatbotとSNSの連携.png)

<br>

## 02. 仕組み

## 03. セットアップ

### Terraformによる構築

hashicorp/aws プロバイダーを使用し、既存の SNS トピックを Slack チャンネルに紐付ける。

Slack ワークスペースは事前に AWS Chatbot（Amazon Q Developer in chat applications）で認可し、chatbot.amazonaws.com が引き受けられる IAM ロールを指定する。

```terraform
resource "aws_chatbot_slack_channel_configuration" "this" {
  configuration_name    = "foo-notifications"
  slack_team_id         = "T01234567"
  slack_channel_id      = "C01234567"
  iam_role_arn          = "arn:aws:iam::123456789012:role/foo-chatbot"
  sns_topic_arns        = ["arn:aws:sns:ap-northeast-1:123456789012:foo-notifications"]
  logging_level         = "ERROR"
  guardrail_policy_arns = ["arn:aws:iam::aws:policy/ReadOnlyAccess"]
}
```

> - [chatbot_slack_channel_configuration - Terraform Registry](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/chatbot_slack_channel_configuration)

<br>

## 04. チャットクライアントとの連携

### Slack 通知の場合

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

### サポート対象のイベント

AWS リソースのイベントを、Amazon EventBridge (Amazon CloudWatch イベント) を使用して、AWS Chatbot にフォワーディングできるが、すべての AWS リソースをサポートしているわけではない。

サポート対象の AWS リソースは以下のリンクを参考にせよ。

> - [Monitoring AWS services using Amazon Q Developer in chat applications - Amazon Q Developer in chat applications](https://docs.aws.amazon.com/chatbot/latest/adminguide/related-services.html#cloudwatchevents)

<br>
