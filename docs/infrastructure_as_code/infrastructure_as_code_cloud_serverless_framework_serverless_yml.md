---
title: 【知見を記録するサイト】serverless.yml@Serverless Framework
description: serverless.yml@Serverless Frameworkの知見をまとめました。
---

# serverless.yml@Serverless Framework

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. configValidationMode

### configValidationModeとは

設定ファイルのバリデーションの実行時に，エラーを出力するレベルを設定する．

参考：https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml

**＊実装例＊**

```yaml
configValidationMode: warn
```

<br>

## 02. custom

### customとは

スコープが```serverless.yml```ファイル内のみの変数を設定する．

参考：https://www.serverless.com/framework/docs/providers/aws/guide/variables

**＊実装例＊**

```yaml
custom:
  foo: foo
```

<br>

## 03. frameworkVersion

### frameworkVersionとは

Serverless Frameworkのバージョンを設定する．

参考：https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml

**＊実装例＊**

```yaml
frameworkVersion: '2'
```

<br>

## 04. functions

### functionsとは

参考：https://www.serverless.com/framework/docs/providers/aws/guide/functions

<br>

### description

Lambda関数の説明文を設定する．

**＊実装例＊**

```yaml
functions:
  main:
    description: The function that do foo
```

<br>

### environment

Lambda関数の環境変数を設定する．

参考：https://www.serverless.com/framework/docs/providers/aws/guide/functions#environment-variables

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

#### ・eventBridge

Lambda関数に紐づけて構築するEventBridgeを設定する．

参考：https://www.serverless.com/framework/docs/providers/aws/events/event-bridge

**＊実装例＊**

イベントパターンとして，JSONファイルを読み込む

```yaml
functions:
  main:
    events:
      - eventBridge:
          pattern: ${file(./event_bridge/patterns/pattern.json)}  
```

#### ・sqs

Lambda関数に紐づけるSQSを設定する．新しくSQSを構築できず，既存のSQSと紐づける機能しかないことに注意する．

参考：https://www.serverless.com/framework/docs/providers/aws/events/sqs

**＊実装例＊**

```yaml
functions:
  main:
    events:
      - sqs:arn:aws:sqs:region:****:prd-foo-queue
```



<br>

### image

#### ・name

Lambda関数で用いるイメージのエイリアスを設定する．

**＊実装例＊**

```yaml
functions:
  main:
    image:
      name: base
```

<br>

### maximumRetryAttempts

Lambda関数の再試行回数を設定する．

参考：https://www.serverless.com/framework/docs/providers/aws/guide/functions#maximum-event-age-and-maximum-retry-attempts

**＊実装例＊**

```yaml
functions:
  main:
    maximumRetryAttempts: 1
```

<br>

### memorySize

Lambda関数のメモリサイズを設定する．

**＊実装例＊**

```yaml
functions:
  main:
    memorySize: 512
```

<br>

### name

Lambda関数の名前を設定する．

**＊実装例＊**

```yaml
functions:
  main:
    name: <Lambda関数名>
```

<br>

### role

Lambda関数に紐づけるIAMロールを設定する．

**＊実装例＊**

別に```resources.Resources```を用いて構築したIAMロールを設定する．

```yaml
functions:
  main:
    role: !GetAtt LambdaRole.Arn
```

<br>

### runtime

Lambda関数で用いる言語とバージョンを設定する．

**＊実装例＊**

```yaml
functions:
  main:
    runtime: <用いる言語バージョン>
```

<br>

## 05. package

### packageとは

生成されるアーティファクトのファイルパスを設定する．

参考：https://www.serverless.com/framework/docs/providers/aws/guide/packaging

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

Serverless Frameworkで操作するクラウドインフラベンダーを設定する．ベンダーでのアカウント認証のため，クレデンシャル情報を渡す必要がある．

<br>

### ecr

#### ・scanOnPush

**＊実装例＊**

```yaml
provider:
  ecr:
    scanOnPush: true
```

#### ・images

Lambda関数のベースイメージを指定し，エイリアス名を付ける．名前は全て小文字である必要がある．

**＊実装例＊**

```yaml
provider:
  ecr:
    images:
      base:
        uri: <AWSアカウントURL>/<ECRリポジトリ名>@<ECRイメージタグ>
```

<br>

### eventBridge

#### ・useCloudFormation

EventBridgeをCloudFormationで構築するか否かを設定する．

```yaml
provider:
  eventBridge:
    useCloudFormation: true
```

<br>

### lambdaHashingVersion

Lambda関数のハッシュバージョンを設定する．

**＊実装例＊**

```yaml
provider:
  lambdaHashingVersion: 20201221
```

<br>

### name

クラウドインフラベンダー名を設定する．

**＊実装例＊**

```yaml
provider:
  name: aws
```

<br>

### region

クラウドインフラを構築するリージョンを設定する．

```yaml
provider:
  region: ap-northeast-1
```

<br>

### stackName

CloudFormationのスタック名を設定する．

**＊実装例＊**

```yaml
provider:
  stackName: <CloudFormationスタック名>
```

<br>

### stage

ステージ名を設定する．クラウドインフラの実行環境名と考えて良い．

**＊実装例＊**

```yaml
provider:
  stage: <ステージ名>
```

<br>

## 07. resources

### resourcesとは（awsプロバイダーの場合）

参考：https://www.serverless.com/framework/docs/providers/aws/guide/resources

<br>

### IAMロール

IAMロールを構築する．

**＊実装例＊**

IAMロールに紐づけるIAMポリシーは，JSONファイルで切り分けておいた方が良い．

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

参考：https://www.serverless.com/framework/docs/providers/aws/guide/services

**＊実装例＊**

```yaml
service: foo-service
```

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

