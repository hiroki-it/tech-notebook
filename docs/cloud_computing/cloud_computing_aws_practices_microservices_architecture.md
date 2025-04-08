---
title: 【IT技術の知見】マイクロサービスアーキテクチャ＠AWS
description: マイクロサービスアーキテクチャ＠AWSの知見を記録しています。
---

# マイクロサービスアーキテクチャ＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 03. リクエスト駆動型マイクロサービスアーキテクチャ

### AWS ECSによるマイクロサービスアーキテクチャ

記入中...

<br>

### AWS VPC内のマイクロサービス領域

#### ▼ マルチECSサービス

ECSクラスターに複数のECSサービスを作成する。

ECSサービスをマイクロサービス単位で稼働させる。

ただ、ECSによるマイクロサービスアーキテクチャはアプリとインフラの責務を分離できないため、非推奨である。

Kubernetes Cluster上でこれを稼働させることが推奨である。

![ecs-fargate_microservices](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs-fargate_microservices.png)

> - https://tangocode.com/2018/11/when-to-use-lambdas-vs-ecs-docker-containers/

#### ▼ ECSサービス検出

AWS Route53にECSタスクの宛先情報を動的に追加削除することにより、ECSタスクが他のECSタスクと通信可能にする。

![ecs_service-discovery](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs_service-discovery.png)

> - https://practical-aws.dev/p/ecs-service-discovery/
> - https://medium.com/@toddrosner/ecs-service-discovery-1366b8a75ad6
> - https://dev.classmethod.jp/articles/ecs-service-discovery/

<br>

## 04. イベント駆動型マイクロサービスアーキテクチャ

### AWS Lambdaによるイベント駆動型マイクロサービスアーキテクチャ

AWS Lambdaをマイクロサービス単位で稼働させる。

ただ、AWS Lambdaによるマイクロサービスアーキテクチャはアプリとインフラの責務を分離できないため、非推奨である。

Kubernetes Cluster上でこれを稼働させることが推奨である。

> - https://aws.amazon.com/jp/blogs/news/comparing-design-approaches-for-building-serverless-microservices/

<br>

### AWS VPC外のAPIゲートウェイ領域

RESTful-APIをAWS API Gatewayで構築する。

<br>

### AWS VPC内のマイクロサービス領域

#### ▼ サービスコンポーネント

マイクロサービスのドメインロジックを持つ。

> - https://qiita.com/__DASHi__/items/268062f0dba0e93170f2

#### ▼ レイヤーコンポーネント

マイクロサービスの横断的な共有ロジックを持つ。

Lambda Layerを使用し、サービスコンポーネントがレイヤーコンポーネントを読み込めるようにする。

> - https://qiita.com/__DASHi__/items/268062f0dba0e93170f2

#### ▼ 認証

マイクロサービスの認証ロジックを持つ。

AWS Cognitoユーザープールを使用する。

![aws_cognito_lambda](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_cognito_lambda.png)

> - https://dev.classmethod.jp/articles/tried-using-cognito-as-api-gateway-authorizer/#toc-cognito-api-gateway

#### ▼ 認可

マイクロサービスの認可ロジックを持つ。

AWS Cognitoオーソライザーを使用する。

![aws_cognito_lambda](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_cognito_lambda.png)

> - https://dev.classmethod.jp/articles/tried-using-cognito-as-api-gateway-authorizer/#toc-cognito-api-gateway

<br>

### AWS VPC内のデータベース領域

#### ▼ 永続データの場合

永続データを管理する。

リクエスト駆動型アプリケーションの場合、複数のリクエストに対して単一のDB接続を再利用できる。

一方で、イベント駆動型アプリケーションの場合、単一リクエストに対して単一のDB接続を使用する。

AWS RDSにはDB接続の上限数があり、前段にAWS RDSプロキシーがないとすぐに上限数に達してしまう。

![aws_rds-proxy_lambda](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_rds-proxy_lambda.png)

> - https://qiita.com/teradonburi/items/86400ea82a65699672ad

<br>

### AWS VPC内のL3管理

#### ▼ publicサブネット

AWS NAT Gatewayを配置し、ネットワークを作成する。

#### ▼ protectedサブネット

AWS Lambdaを配置し、ネットワークを作成する。

#### ▼ privateサブネット

AWS RDSプロキシーとAWS RDSを配置し、ネットワークを作成する。

<br>
