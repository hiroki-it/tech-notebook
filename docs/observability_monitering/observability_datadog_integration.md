---
title: 【知見を記録するサイト】インテグレーション＠Datadog
description: インテグレーション＠Datadogの知見をまとめました．
---

# インテグレーション＠Datadog

## 01. メトリクスインテグレーション

### メトリクスインテグレーションとは

言語/フレームワーク/ツール，などに関して，専用のメトリクスを収集できるようになる．アプリケーションとして用いられる言語/フレームワークの場合，datadogエージェントがインテグレーション処理を持つため，仮想環境へのインストールは不要である．Datedogエージェントが稼働する言語/フレームワーク/ツールを自動で認識してくれる．

<br>

## 02. ログインテグレーション

### ログインテグレーションとは

アプリケーション，ミドルウェア，クラウドインフラ，などのログを集約的に収集しやすくなるインテグレーションパイプラインライブラリを提供する．

<br>

### インテグレーションパイプラインライブラリ

ログの生成元に合わせて，プロセッサーのセットが組み込まれたパイプラインを提供してくれる．

参考：

- https://docs.datadoghq.com/logs/log_configuration/pipelines/?tab=source#integration-pipelines
- https://docs.datadoghq.com/integrations/#cat-log-collection

<br>

## 03. 分散トレースインテグレーション

### 分散トレースインテグレーションとは

言語/フレームワーク/ツール，などに関して，専用の分散トレースを収集できるようになる．アプリケーションとして用いられる言語/フレームワークの場合，トレースエージェントがインテグレーション処理を持つため，仮想環境へのインストールは不要である．については，以下のリンクを参考にせよ．

参考：https://github.com/DataDog/dd-trace-php/tree/master/src/Integrations/Integrations

<br>

## 04. AWSインテグレーション

### セットアップ

#### ・共通の手順

AWSリソースで生成されたメトリクス/ログ/分散トレースをDatadogに転送できるようにする．

参考：https://docs.datadoghq.com/integrations/amazon_web_services/?tab=roledelegation#setup

（１）DatadogのAWSアカウントの登録画面で，CloudFormationによる自動セットアップを選択する．これにより，AWSコンソール画面に自動的に遷移する．ほとんど自動入力されており，空欄部分（APIキーなど）に値を入力する．

参考：https://app.datadoghq.com/account/settings#integrations/amazon-web-services

（２）CloudFormationを実行し，メトリクス/ログ/分散トレースを転送するLambdaやIAMロールを構築する．このIAMロール（```DatadogIntegrationRole```）には，DatadogのIAMユーザー（```464622532012```）に委譲できるように，Amazon STSの設定がなされている．Datadogの設定画面にアカウントIDとロール名を入力することで，設定画完了する．

参考：https://app.datadoghq.com/account/settings#integrations/amazon-web-services

この時点で，ログと分散トレースは収集できており，可視化の手順のみが必要である．一方で，ログは可視化が不要であるが，収集の手順が必要である．

#### ・メトリクス，分散トレースの可視化

（３）収集したメトリクスを可視化できるように，各AWSリソースのインテグレーションをインストールする．

#### ・ログの収集

（３）ログを収集できるように，LambdaのトリガーとしてCloudWatchログやS3を設定する．トリガーとして設定せずに，自動で収集することも可能であるが，自動認識されるログの種類が少ないので，手動で設定した方が良い．

参考：https://docs.datadoghq.com/logs/guide/send-aws-services-logs-with-the-datadog-lambda-function/?tab=awsconsole#automatically-set-up-triggers

（４）トリガーとするAWSリソースの命名によって，ログの```service```属性の値が変わる．例えば，CloudWatchログのロググループ名が『```api-gateway-*****```』から始まる場合，```service```属性の値は```apigateway```になる．

<br>

### 料金

EC2，ECS，Lambdaで料金が発生し，それ以外のAWSリソースは無料である．

参考：https://docs.datadoghq.com/account_management/billing/aws/

<br>

## 05. PHP-FPMインテグレーション

PHP-FPMインテグレーションをインストールした場合，収集したメトリクスを可視化できるようになる．ログには対応していない．

参考：https://docs.datadoghq.com/integrations/php_fpm/?tab=host#%E3%83%A1%E3%83%88%E3%83%AA%E3%82%AF%E3%82%B9

<br>

## 06. Nginxインテグレーション

Nginxインテグレーションをインストールした場合，収集したログとメトリクスを可視化できるようになる．

参考：https://docs.datadoghq.com/integrations/nginx/?tab=host#%E3%83%A1%E3%83%88%E3%83%AA%E3%82%AF%E3%82%B9
