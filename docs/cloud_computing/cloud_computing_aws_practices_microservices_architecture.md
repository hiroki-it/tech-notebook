---
title: 【IT技術の知見】マイクロサービスアーキテクチャ＠AWS
description: マイクロサービスアーキテクチャ＠AWSの知見を記録しています。
---

# マイクロサービスアーキテクチャ＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Amazon EKSによるリクエスト駆動型マイクロサービスアーキテクチャ

自著『クラウドネイティブ技術とマイクロサービスアーキテクチャーのつながり』を確認する。

> - https://www.amazon.co.jp/dp/B0DRN42319

<br>

## 02. Amazon ECSによるリクエスト駆動型マイクロサービスアーキテクチャ

### Amazon ECSによるマイクロサービスアーキテクチャ

記入中...

<br>

### Amazon VPC内のマイクロサービス領域

#### ▼ マルチECSサービス

Amazon ECS クラスターに複数の Amazon ECS サービスを作成する。

Amazon ECS サービスをマイクロサービス単位で稼働させる。

ただ、Amazon ECS によるマイクロサービスアーキテクチャはアプリとインフラの責務を分離できないため、非推奨である。

Kubernetes Cluster 上でこれを稼働させることが推奨である。

![ecs-fargate_microservices](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ecs-fargate_microservices.png)

> - https://tangocode.com/2018/11/when-to-use-lambdas-vs-ecs-docker-containers/

#### ▼ Amazon Route 53とAWS Cloud Mapによるサービス検出

AWS CloudMap を使用して、Amazon ECS タスクの宛先情報を動的に Amazon Route 53 に追加削除する。

これにより、Amazon ECS タスクが他の ECS タスクと通信可能にする。

![aws_ecs_service-discovery](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_ecs_service-discovery.png)

> - https://practical-aws.dev/p/ecs-service-discovery/
> - https://medium.com/@toddrosner/ecs-service-discovery-1366b8a75ad6
> - https://dev.classmethod.jp/articles/ecs-service-discovery/
> - https://aws.amazon.com/jp/builders-flash/202409/web-app-architecture-design-pattern/

#### ▼ Amazon ECS Service Connectによるサービス検出

![aws_ecs_service-connect](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_ecs_service-connect.png)

> - https://aws.amazon.com/jp/builders-flash/202409/web-app-architecture-design-pattern/

<br>

## 03. AWS Lambdaによるイベント駆動型マイクロサービスアーキテクチャ

### AWS Lambdaによるイベント駆動型マイクロサービスアーキテクチャ

AWS Lambda をマイクロサービス単位で稼働させる。

ただ、AWS Lambda によるマイクロサービスアーキテクチャはアプリとインフラの責務を分離できないため、非推奨である。

Kubernetes Cluster 上でこれを稼働させることが推奨である。

> - https://aws.amazon.com/jp/blogs/news/comparing-design-approaches-for-building-serverless-microservices/

<br>

### Amazon VPC外のAPIゲートウェイ領域

RESTful-API を Amazon API Gateway で構築する。

<br>

### Amazon VPC内のマイクロサービス領域

#### ▼ ドメインサービス

マイクロサービスのドメインロジックを持つ。

> - https://qiita.com/__DASHi__/items/268062f0dba0e93170f2

#### ▼ レイヤーサービス

マイクロサービスの横断的な共有ロジックを持つ。

Lambda Layer を使用し、サービスコンポーネントがレイヤーコンポーネントを読み込めるようにする。

> - https://qiita.com/__DASHi__/items/268062f0dba0e93170f2

#### ▼ 認証マイクロサービス

マイクロサービスの認証ロジックを持つ。

AWS Cognito ユーザープールを使用する。

![aws_cognito_lambda](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_cognito_lambda.png)

> - https://dev.classmethod.jp/articles/tried-using-cognito-as-api-gateway-authorizer/#toc-cognito-api-gateway

#### ▼ 認可マイクロサービス

マイクロサービスの認可ロジックを持つ。

AWS Cognito オーソライザーを使用する。

![aws_cognito_lambda](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_cognito_lambda.png)

> - https://dev.classmethod.jp/articles/tried-using-cognito-as-api-gateway-authorizer/#toc-cognito-api-gateway

<br>

### Amazon VPC内のデータベース領域

#### ▼ 永続データの場合

永続データを管理する。

リクエスト駆動型アプリケーションの場合、複数のリクエストに対して単一の DB 接続を再利用できる。

一方で、イベント駆動型アプリケーションの場合、単一リクエストに対して単一の DB 接続を使用する。

Amazon RDS には DB 接続の上限数があり、前段に Amazon RDS プロキシーがないとすぐに上限数に達してしまう。

![aws_rds-proxy_lambda](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_rds-proxy_lambda.png)

> - https://qiita.com/teradonburi/items/86400ea82a65699672ad

<br>

### Amazon VPC内のL3管理

#### ▼ publicサブネット

AWS NAT Gateway を配置し、ネットワークを作成する。

#### ▼ protectedサブネット

AWS Lambda を配置し、ネットワークを作成する。

#### ▼ privateサブネット

Amazon RDS プロキシーと Amazon RDS を配置し、ネットワークを作成する。

<br>
