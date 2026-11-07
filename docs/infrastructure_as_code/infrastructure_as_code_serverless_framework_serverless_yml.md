---
title: 【IT技術の知見】serverless.yml＠Serverless Framework
description: serverless.yml＠Serverless Frameworkの知見を記録しています。
---

# serverless.yml＠Serverless Framework

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. configValidationMode

### configValidationMode とは

設定ファイルのバリデーションの実行時に、エラーを出力するレベルを設定する。

```yaml
configValidationMode: warn
```

> - [Serverless Framework - AWS Lambda Guide - Serverless.yml Reference \| Serverless Framework](https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml)

<br>

## 02. custom

### custom とは

スコープが `serverless.yml` ファイル内のみの変数を設定する。

```yaml
custom:
  foo: FOO
```

> - https://www.serverless.com/framework/docs/providers/aws/guide/variables

<br>

## 03. frameworkVersion

### frameworkVersion とは

Serverless Framework のバージョンを設定する。

```yaml
frameworkVersion: "2"
```

> - [Serverless Framework - AWS Lambda Guide - Serverless.yml Reference \| Serverless Framework](https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml)

<br>

## 04. functions

### functions とは

> - [Serverless Framework - AWS Lambda Functions \| Serverless Framework](https://www.serverless.com/framework/docs/providers/aws/guide/functions)

<br>

### description

Lambda 関数の説明文を設定する。

```yaml
functions:
  main:
    description: The function that do foo
```

<br>

### environment

Lambda 関数の変数を設定する。

> - [Serverless Framework - AWS Lambda Functions \| Serverless Framework](https://www.serverless.com/framework/docs/providers/aws/guide/functions#environment-variables)

```yaml
functions:
  main:
    environment:
      FOO: foo
      BAR: bar
      BAz: baz
```

<br>

### events

#### ▼ eventBridge

Lambda 関数に紐付けて作成する Amazon EventBridge を設定する。

イベントパターンとして、`json` ファイルを読み込む

```yaml
functions:
  main:
    events:
      - eventBridge:
          pattern: ${file(./event_bridge/patterns/pattern.json)}
```

> - [Serverless Framework - AWS Lambda Events - Event Bridge \| Serverless Framework](https://www.serverless.com/framework/docs/providers/aws/events/event-bridge)

#### ▼ sqs

Lambda 関数に紐付ける SQS を設定する。

新しく SQS を作成できず、既存の SQS と紐付ける動作しかないことに注意する。

```yaml
functions:
  main:
    events:
      - sqs:arn:aws:sqs:region:<AWSアカウントID>:prd-foo-queue
```

> - [Serverless Framework - AWS Lambda Events - SQS Queues \| Serverless Framework](https://www.serverless.com/framework/docs/providers/aws/events/sqs)

<br>

### image

#### ▼ name

Lambda 関数で使用するイメージのエイリアスを設定する。

```yaml
functions:
  main:
    image:
      name: base
```

<br>

### maximumRetryAttempts

Lambda 関数のリトライ回数を設定する。

> - [Serverless Framework - AWS Lambda Functions \| Serverless Framework](https://www.serverless.com/framework/docs/providers/aws/guide/functions#maximum-event-age-and-maximum-retry-attempts)

```yaml
functions:
  main:
    maximumRetryAttempts: 1
```

<br>

### memorySize

Lambda 関数のメモリサイズを設定する。

```yaml
functions:
  main:
    memorySize: 512
```

<br>

### name

Lambda 関数の名前を設定する。

```yaml
functions:
  main:
    name: <Lambda関数名>
```

<br>

### role

Lambda 関数に紐付ける IAM ロールを設定する。

別に `resources.Resources` を使用して作成した IAM ロールを設定する。

```yaml
functions:
  main:
    role: !GetAtt LambdaRole.Arn
```

<br>

### runtime

Lambda 関数で使用する言語とバージョンを設定する。

```yaml
functions:
  main:
    runtime: <使用する言語バージョン>
```

<br>

## 05. package

### package とは

作成されるアーティファクトのパスを設定する。

> - [Serverless Framework - Packaging \| Serverless Framework](https://www.serverless.com/framework/docs/providers/aws/guide/packaging)

<br>

### patterns

```yaml
package:
  patterns:
    - ./bin/**
```

<br>

## 06. provider

### provider とは

Serverless Framework で操作するクラウドインフラベンダーを設定する。

ベンダーでのアカウント認証のため、資格情報を渡す必要がある。

<br>

### ecr

#### ▼ scanOnPush

```yaml
provider:
  ecr:
    scanOnPush: "true"
```

#### ▼ images

Lambda 関数のベースイメージを指定し、エイリアスを付ける。

名前はすべて小文字である必要がある。

```yaml
provider:
  ecr:
    images:
      base:
        uri: <イメージリポジトリURL>@<バージョンタグ> # <AWS アカウント ID>.dkr.ecr.ap-northeast-1.amazonaws.com/<イメージリポジトリ名>:latest
```

<br>

### eventBridge

#### ▼ useCloudFormation

Amazon EventBridge を CloudFormation で作成するか否かを設定する。

```yaml
provider:
  eventBridge:
    useCloudFormation: "true"
```

<br>

### lambdaHashingVersion

Lambda 関数のハッシュバージョンを設定する。

```yaml
provider:
  lambdaHashingVersion: 20201221
```

<br>

### name

クラウドインフラベンダー名を設定する。

```yaml
provider:
  name: aws
```

<br>

### region

クラウドインフラを作成するリージョンを設定する。

```yaml
provider:
  region: ap-northeast-1
```

<br>

### stackName

CloudFormation のスタック名を設定する。

```yaml
provider:
  stackName: <CloudFormationスタック名>
```

<br>

### stage

ステージ名を設定する。

クラウドインフラの実行環境名と考えてよい。

```yaml
provider:
  stage: <ステージ名>
```

<br>

## 07. resources

### resources とは (aws プロバイダーの場合)

> - [Serverless Framework - AWS Infrastructure Resources \| Serverless Framework](https://www.serverless.com/framework/docs/providers/aws/guide/resources)

<br>

### IAM ロール

IAM ロールを作成する。

IAM ロールに紐付ける IAM ポリシーは、`json` ファイルで切り分けておいたほうがよい。

```yaml
resources:
  Resources:
    LambdaRole:
      Type: AWS::IAM::Role
      Properties:
        RoleName: prd-foo-lambda-role
        Description: The role for prd-foo-lambda
        AssumeRolePolicyDocument: ${file(./iam_role/policies/trust_policies/lambda_policy.json)}
        # インラインポリシー
        Policies:
          - PolicyName: prd-foo-lambda-execution-policy
            PolicyDocument: ${file(./iam_role/policies/custom_managed_policies/lambda_execution_policy.json)}
        # 管理ポリシー
        ManagedPolicyArns:
          - arn:aws:iam::aws:policy/AWSLambdaExecute
```

<br>

## 08. service

### service とは (aws プロバイダーの場合)

```yaml
service: foo-service
```

> - [Serverless Framework Services \| Serverless Framework](https://www.serverless.com/framework/docs/providers/aws/guide/services)

<br>

## 09. useDotenv

### useDotenv とは

```yaml
useDotenv: "true"
```

<br>

## 10. variablesResolutionMode

### variablesResolutionMode とは

```yaml
variablesResolutionMode: null
```

<br>
