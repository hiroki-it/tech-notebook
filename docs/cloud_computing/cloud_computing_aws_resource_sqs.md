---
title: 【IT技術の知見】SQS＠AWSリソース
description: SQS＠AWSリソースの知見を記録しています。
---

# SQS＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. SQSとは：Simple Queue Service

クラウドメッセージキューとして働く。

送受信の関係が一対一のプロデュース/コンシュームパターンであり、プル型の通信方式である。

AWSのクラウドメッセージブローカー (例：AWS MQ) よりも機能が少なくシンプルである。

パブリッシュ／サブスクライブシステム (例：AWS SNS、AWS EventBridge) とは異なりメッセージをキューイングできるが、メッセージをルーティングできない。

|          | SQS                               | SNS                          | EventBridge                  |
| -------- | --------------------------------- | ---------------------------- | ---------------------------- |
| 処理     | キューイング                      | ルーティング                 | ルーティング                 |
| 通信方式 | プル型のプロデュース/コンシューム | パブリッシュ／サブスクライブ | パブリッシュ／サブスクライブ |

> - https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-difference-from-amazon-mq-sns.html
> - https://tech.asoview.co.jp/entry/2022/04/06/102637
> - https://docs.aws.amazon.com/decision-guides/latest/sns-or-sqs-or-eventbridge/sns-or-sqs-or-eventbridge.html
> - https://fourtheorem.com/what-can-you-do-with-eventbridge/

<br>

## 01-02. 仕組み

### アーキテクチャ

プロデューサーはメッセージを送信し、SQSは自身にこれを格納する。

その後、コンシューマーはSQSからメッセージを抽出し、後処理としてメッセージを削除する。

異なるVPC間でも、メッセージキューを同期できる。

![AmazonSQSとは](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/SQS.jpeg)

> - https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-difference-from-amazon-mq-sns.html

<br>

### プロトコル

一部の`L7`プロトコル (例：HTTP) のみをサポートしている。

一方で、一般的なメッセージプロトコル (例：AMQP、STOMP、MQTTなど) はサポートしていない。

> - https://www.quora.com/Should-Amazon-SQS-have-support-for-AMQP

<br>

## 02. セットアップ (コンソールの場合)

## 2-02. セットアップ (Terraformの場合)

```terraform
# 通常キュー
module "sqs_foo" {
  source  = "terraform-aws-modules/sqs/aws"
  version = "~> 4.0"

  name = "foo"
  tags = local.tags

  visibility_timeout_seconds = 300
  message_retention_seconds  = 345600 # 4日
  max_message_size           = 262144 # 256KB
  delay_seconds              = 0
  receive_wait_time_seconds  = 20 # ロングポーリング

  redrive_policy = {
    deadLetterTargetArn = "arn:aws:sqs:ap-northeast-1:123456789012:foo-deadletter"
    maxReceiveCount     = 3
  }

  kms_master_key_id                 = "arn:aws:kms:ap-northeast-1:123456789012:key/11111111-2222-3333-4444-555555555555"
  kms_data_key_reuse_period_seconds = 300
}

# デッドレターキュー
# 通常キューは処理に失敗し続けた処理不可能なタスクをデッドレターキューに転送する
module "sqs_foo_deadletter" {
  source  = "terraform-aws-modules/sqs/aws"
  version = "~> 4.0"

  name                      = "foo-deadletter"
  tags                      = local.tags
  message_retention_seconds = 1209600 # 14日

  kms_master_key_id                 = "arn:aws:kms:ap-northeast-1:123456789012:key/11111111-2222-3333-4444-555555555555"
  kms_data_key_reuse_period_seconds = 300
}

module "kms_sqs_foo" {
  source  = "terraform-aws-modules/kms/aws"
  version = "= 3.1.0"

  aliases                 = ["sqs-foo"]
  deletion_window_in_days = 30
  enable_key_rotation     = true
  tags                    = local.tags

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Default"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "Allow SQS to use the key"
        Effect = "Allow"
        Principal = {
          Service = "sqs.amazonaws.com"
        }
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = "*"
      }
    ]
  })
}
```

### SQSの種類

| 設定項目         | 説明                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------- |
| スタンダード方式 | サブスクライバーの取得レスポンスを待たずに、次のキューを非同期的にフォワーディングする。 |
| FIFO方式         | サブスクライバーの取得レスポンスを待ち、キューを同期的にフォワーディングする。           |

<br>
