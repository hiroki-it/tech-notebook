---
title: 【IT技術の知見】インテグレーション＠Datadog
description: インテグレーション＠Datadogの知見を記録しています。
---

# インテグレーション＠Datadog

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. メトリクスインテグレーション

### メトリクスインテグレーションとは

言語/フレームワーク/ツールなどに関して、専用のメトリクスの元になるデータポイントを収集できるようになる。

アプリケーションとして使用される言語/フレームワークの場合、datadogエージェントがインテグレーション処理を持つため、仮想環境へのインストールは不要である。

Datedogエージェントが稼働する言語/フレームワーク/ツールを自動的に認識してくれる。

<br>

## 02. ログインテグレーション

### ログインテグレーションとは

アプリケーション、ミドルウェア、クラウドインフラなどのログを収集しやすくなるインテグレーションパイプラインパッケージを提供する。

<br>

### インテグレーションパイプラインパッケージ

ログの作成元に合わせて、プロセッサーのセットが組み込まれたパイプラインを提供してくれる。

> - https://docs.datadoghq.com/logs/log_configuration/pipelines/?tab=source#integration-pipelines
> - https://docs.datadoghq.com/integrations/#cat-log-collection

<br>

## 03. 分散トレースインテグレーション

### 分散トレースインテグレーションとは

言語/フレームワーク/ツールなどに関して、専用の分散トレースを収集できるようになる。

アプリケーションとして使用される言語/フレームワークの場合、トレースエージェントがインテグレーション処理を持つため、仮想環境へのインストールは不要である。

> - https://github.com/DataDog/dd-trace-php/tree/master/src/Integrations/Integrations

<br>

## 04. AWSインテグレーション

### セットアップ

#### ▼ 共通の手順

AWSリソースで作成されたメトリクス/ログ/分散トレースをDatadogにフォワーディングできるようにする。

> - https://docs.datadoghq.com/integrations/amazon_web_services/?tab=roledelegation#setup

`(1)`

: DatadogのAWSアカウントの登録画面で、CloudFormationによる自動セットアップを選択する。

     これにより、AWSコンソール画面に自動的に遷移する。CloudFormationのテンプレートを使用して、スタックを作成できる。

     ほとんどのパラメーターはデフォルト値が設定されており、空欄部分 (APIキーなど) に値を入力する。

> - https://app.datadoghq.com/account/settings#integrations/amazon-web-services

`(2)`

: CloudFormationを実行し、メトリクス/ログ/分散トレースをフォワーディングするLambdaやIAMロールを作成する。

     このIAMロール (`DatadogIntegrationRole`) には、DatadogのIAMユーザー (`464622532012`) に委譲できるように、AWS STSの設定がなされている。

     Datadogの設定画面にアカウントIDとロール名を入力することにより、設定画完了する。

> - https://app.datadoghq.com/account/settings#integrations/amazon-web-services

この時点で、ログと分散トレースは収集できており、可視化の手順のみが必要である。

一方で、ログは可視化が不要であるが、収集の手順が必要である。

#### ▼ メトリクス、分散トレースの可視化

`(1)`

: 共通の手順を参照。

`(2)`

: 共通の手順を参照。

`(3)`

: 収集したデータポイントを可視化できるように、各AWSリソースのインテグレーションをインストールする。

     インストール後、しばらく待つと、AWSインフラのメトリクスの元になるデータポイントや分散トレースが収集されていることを確認できる。

#### ▼ ログの収集

`(1)`

: 共通の手順を参照。

`(2)`

: 共通の手順を参照。

`(3)`

: ログを収集できるように、LambdaのトリガーとしてAWS CloudWatch LogsやAWS S3を設定する。

     トリガーとして設定せずに自動的にも収集できるが、自動認識されるログの種類が少ないので、手動で設定した方が良い。

> - https://docs.datadoghq.com/logs/guide/send-aws-services-logs-with-the-datadog-lambda-function/?tab=awsconsole#automatically-set-up-triggers

`(4)`

: トリガーとするAWSリソースの命名によって、ログの`service`属性の値が変わる。

     例えば、AWS CloudWatch Logsのロググループ名が『`api-gateway-*****`』から始まる場合、`service`属性の値は`apigateway`になる。

<br>

### 料金

AWS EC2、AWS ECS、Lambdaで料金が発生し、それ以外のAWSリソースは無料である。

> - https://docs.datadoghq.com/account_management/billing/aws/

<br>

## 05. PHP-FPMインテグレーション

PHP-FPMインテグレーションをインストールした場合、収集したデータポイントを可視化できるようになる。

ログはサポートしていない。

> - https://docs.datadoghq.com/integrations/php_fpm/?tab=host#%E3%83%A1%E3%83%88%E3%83%AA%E3%82%AF%E3%82%B9

<br>

## 06. Nginxインテグレーション

Nginxインテグレーションをインストールした場合、収集したログとメトリクスを可視化できるようになる。

> - https://docs.datadoghq.com/integrations/nginx/?tab=host#%E3%83%A1%E3%83%88%E3%83%AA%E3%82%AF%E3%82%B9
