---
title: 【IT技術の知見】Step Functions＠AWSリソース
description: Step Functions＠AWSリソースの知見を記録しています。
---

# Step Functions＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Step Functionsとは

AWSサービスを組み合わせて、ワークフローエンジンを作成できる。

<br>

## 02. セットアップ

### AWSリソースのAPIコール

#### ▼ APIコールできるリソース

> - https://docs.aws.amazon.com/step-functions/latest/dg/connect-supported-services.html

#### ▼ AWS Lambda

**＊実装例＊**

```yaml
{
  "StartAt": "Call AWS Lambda",
  "States":
    {
      "Call AWS Lambda":
        {
          "Type": "Task",
          "Resource": "arn:aws:states:::lambda:invoke.waitForTaskToken",
          "Parameters":
            {
              "FunctionName": "arn:aws:lambda:ap-northeast-1:<AWSアカウントID>:foo-function:1",
            },
          "Retry":
            [
              {
                "ErrorEquals": ["<リトライの対象とするエラー>"],
                "MaxAttempts": 0,
              },
            ],
          "End": "true",
          "Comment": "The state that call AWS Lambda",
        },
    },
}
```

<br>

### AWS API Gatewayとの連携

#### ▼ 注意が必要な項目

|              | 設定値         | 補足                        |
| ------------ | -------------- | --------------------------- |
| HTTPメソッド | POST           | GETメソッドでは動作しない。 |
| アクション   | StartExecution |                             |
| 実行ロール   | IAMロールのARN | StartExecutionを許可する。  |

> - https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-api-gateway.html

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Effect": "Allow",
        "Action": "states:StartExecution",
        "Resource": "arn:aws:states:*:<AWSアカウントID>:stateMachine:*",
      },
    ],
}
```

#### ▼ レスポンス構造

以下がレスポンスされれば、AWS API GatewayがStep Functionsをコールできたことになる。

```yaml
{
  "executionArn": "arn:aws:states:ap-northeast-1:<AWSアカウントID>:execution:prd-foo-doing-state-machine:*****",
  "startDate": 1.638244285498E9,
}
```

<br>
