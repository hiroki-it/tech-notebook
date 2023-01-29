---
title: 【IT技術の知見】serverless.yml＠Serverless Framework
description: serverless.yml＠Serverless Frameworkの知見を記録しています。
---

# serverless.yml＠Serverless Framework

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. configValidationMode

### configValidationModeとは

設定ファイルのバリデーションの実行時に、エラーを出力するレベルを設定する。




**＊実装例＊**

```yaml
configValidationMode: warn
```

> ℹ️ 参考：https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml


<br>

## 02. custom

### customとは

スコープが```serverless.yml```ファイル内のみの変数を設定する。




**＊実装例＊**

```yaml
custom:
  foo: FOO
```

> ℹ️ 参考：https://www.serverless.com/framework/docs/providers/aws/guide/variables

<br>

## 03. frameworkVersion

### frameworkVersionとは

Serverless Frameworkのバージョンを設定する。




**＊実装例＊**

```yaml
frameworkVersion: '2'
```

> ℹ️ 参考：https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml


<br>

## 04. functions

### functionsとは

> ℹ️ 参考：https://www.serverless.com/framework/docs/providers/aws/guide/functions

<br>

### description

Lambda関数の説明文を設定する。



**＊実装例＊**

```yaml
functions:
  main:
    description: The function that do foo
```

<br>

### environment

Lambda関数の変数を設定する。



> ℹ️ 参考：https://www.serverless.com/framework/docs/providers/aws/guide/functions#environment-variables

**＊実装例＊**

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

Lambda関数に紐づけて作成するEventBridgeを設定する。




**＊実装例＊**

イベントパターンとして、```.json```ファイルを読み込む

```yaml
functions:
  main:
    events:
      - eventBridge:
          pattern: ${file(./event_bridge/patterns/pattern.json)}  
```

> ℹ️ 参考：https://www.serverless.com/framework/docs/providers/aws/events/event-bridge


#### ▼ sqs

Lambda関数に紐づけるSQSを設定する。

新しくSQSを作成できず、既存のSQSと紐づける動作しかないことに注意する。




**＊実装例＊**

```yaml
functions:
  main:
    events:
      - sqs:arn:aws:sqs:region:<アカウントID>:prd-foo-queue
```

> ℹ️ 参考：https://www.serverless.com/framework/docs/providers/aws/events/sqs


<br>

### image

#### ▼ name

Lambda関数で使用するイメージのエイリアスを設定する。



**＊実装例＊**

```yaml
functions:
  main:
    image:
      name: base
```

<br>

### maximumRetryAttempts

Lambda関数の再試行回数を設定する。



> ℹ️ 参考：https://www.serverless.com/framework/docs/providers/aws/guide/functions#maximum-event-age-and-maximum-retry-attempts

**＊実装例＊**

```yaml
functions:
  main:
    maximumRetryAttempts: 1
```

<br>

### memorySize

Lambda関数のメモリサイズを設定する。



**＊実装例＊**

```yaml
functions:
  main:
    memorySize: 512
```

<br>

### name

Lambda関数の名前を設定する。



**＊実装例＊**

```yaml
functions:
  main:
    name: <Lambda関数名>
```

<br>

### role

Lambda関数に紐づけるIAMロールを設定する。



**＊実装例＊**

別に```resources.Resources```を使用して作成したIAMロールを設定する。



```yaml
functions:
  main:
    role: !GetAtt LambdaRole.Arn
```

<br>

### runtime

Lambda関数で使用する言語とバージョンを設定する。



**＊実装例＊**

```yaml
functions:
  main:
    runtime: <使用する言語バージョン>
```

<br>

## 05. package

### packageとは

作成されるアーティファクトのパスを設定する。



> ℹ️ 参考：https://www.serverless.com/framework/docs/providers/aws/guide/packaging

<br>

### patterns

**＊実装例＊**

```yaml
package:
  patterns:
    - ./bin/**
```

<br>

## 06. provider

### providerとは

Serverless Frameworkで操作するクラウドインフラベンダーを設定する。

ベンダーでのアカウント認証のため、クレデンシャル情報を渡す必要がある。



<br>

### ecr

#### ▼ scanOnPush

**＊実装例＊**

```yaml
provider:
  ecr:
    scanOnPush: true
```

#### ▼ images

Lambda関数のベースイメージを指定し、エイリアス名を付ける。

名前は全て小文字である必要がある。



**＊実装例＊**

```yaml
provider:
  ecr:
    images:
      base:
        uri: <イメージリポジトリURL>@<バージョンタグ> # <アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/<イメージリポジトリ名>:latest
```

<br>

### eventBridge

#### ▼ useCloudFormation

EventBridgeをCloudFormationで作成するか否かを設定する。



```yaml
provider:
  eventBridge:
    useCloudFormation: true
```

<br>

### lambdaHashingVersion

Lambda関数のハッシュバージョンを設定する。



**＊実装例＊**

```yaml
provider:
  lambdaHashingVersion: 20201221
```

<br>

### name

クラウドインフラベンダー名を設定する。



**＊実装例＊**

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

CloudFormationのスタック名を設定する。



**＊実装例＊**

```yaml
provider:
  stackName: <CloudFormationスタック名>
```

<br>

### stage

ステージ名を設定する。

クラウドインフラの実行環境名と考えて良い。



**＊実装例＊**

```yaml
provider:
  stage: <ステージ名>
```

<br>

## 07. resources

### resourcesとは（awsプロバイダーの場合）

> ℹ️ 参考：https://www.serverless.com/framework/docs/providers/aws/guide/resources

<br>

### IAMロール

IAMロールを作成する。



**＊実装例＊**

IAMロールに紐づけるIAMポリシーは、```.json```ファイルで切り分けておいた方が良い。



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

### serviceとは（awsプロバイダーの場合）


**＊実装例＊**

```yaml
service: foo-service
```

> ℹ️ 参考：https://www.serverless.com/framework/docs/providers/aws/guide/services


<br>

## 09. useDotenv

### useDotenvとは

**＊実装例＊**

```yaml
useDotenv: true
```

<br>

## 10. variablesResolutionMode

### variablesResolutionModeとは

**＊実装例＊**

```yaml
variablesResolutionMode: null
```

<br>

