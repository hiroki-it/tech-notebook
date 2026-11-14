---
title: 【IT技術の知見】Step Functions
description: Step Functionsの知見を記録しています。
tags:
  - "3大クラウド"
  - "AWS"
  - "AWSリソース"
---

# Step Functions

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要


AWS サービスを組み合わせて、ワークフローエンジンを作成できる。

<br>

## 02. 仕組み

## 03. セットアップ

### Terraformによる構築

terraform-aws-modules の Step Functions モジュールを使用し、既存の Lambda 関数を呼び出すステートマシンを作成する。

Lambda を呼び出す IAM 権限もモジュールで設定する。

```terraform
module "state_machine" {
  source  = "terraform-aws-modules/step-functions/aws"
  version = "5.1.1"

  name = "foo-workflow"
  definition = jsonencode({
    StartAt = "InvokeLambda"
    States = {
      InvokeLambda = {
        Type     = "Task"
        Resource = "arn:aws:states:::lambda:invoke"
        Parameters = {
          FunctionName = "arn:aws:lambda:ap-northeast-1:123456789012:function:foo-function"
          "Payload.$"  = "$"
        }
        End = true
      }
    }
  })
  service_integrations = {
    lambda = { lambda = ["arn:aws:lambda:ap-northeast-1:123456789012:function:foo-function"] }
  }
}
```

> - [terraform-aws-modules/step-functions/aws (5.1.1) - Terraform Registry](https://registry.terraform.io/modules/terraform-aws-modules/step-functions/aws/5.1.1)

<br>

## 04. AWS リソースの API 呼び出し

### API コールできるリソース

> - https://docs.aws.amazon.com/step-functions/latest/dg/connect-supported-services.html

### AWS Lambda

```json
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

## 05. API Gateway との連携

### 注意が必要な項目

<table>
  <thead>
    <tr>
      <th></th>
      <th>設定値</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>HTTP メソッド</td>
      <td>POST</td>
      <td>GET メソッドでは動作しない。</td>
    </tr>
    <tr>
      <td>アクション</td>
      <td>StartExecution</td>
      <td></td>
    </tr>
    <tr>
      <td>実行ロール</td>
      <td>IAM ロールの ARN</td>
      <td>StartExecution を許可する。</td>
    </tr>
  </tbody>
</table>

> - [Creating a Step Functions API using API Gateway - AWS Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-api-gateway.html)

```json
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

### レスポンス構造

以下がレスポンスされれば、Amazon API Gateway が Step Functions をコールできたことになる。

```json
{
  "executionArn": "arn:aws:states:ap-northeast-1:<AWSアカウントID>:execution:prd-foo-doing-state-machine:*****",
  "startDate": 1.638244285498E9,
}
```

<br>
