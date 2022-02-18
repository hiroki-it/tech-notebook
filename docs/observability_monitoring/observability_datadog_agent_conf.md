---
title: 【知見を記録するサイト】datadogエージェントの設定＠可観測性
description: datadogエージェントの設定＠可観測性の知見をまとめました．
---

# datadogエージェントの設定＠可観測性

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. datadogエージェント

### datadogエージェントとは

Datadogにデータを送信するためには，アプリケーションにdatadogエージェントをインストールする必要がある．用いているOSやIaCツールごとに，インストール方法が異なる．

<br>

### メトリクス収集について

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/observability_monitoring/observability_datadog_metrics.html

<br>

### ログ収集について

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/observability_monitoring/observability_datadog_log.html

<br>

### 分散トレース収集について

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/observability_monitoring/observability_datadog_distributed_trace.html

<br>

## 02. サーバーの場合

###  ```/etc/datadog-agent/datadog.yaml```ファイル

datadogエージェントを設定する．datadogエージェントをインストールすると，```datadog.yaml.example```ファイルが生成されるため，これをコピーして作成する．

参考：

- https://app.datadoghq.com/account/settings#agent
- https://docs.datadoghq.com/getting_started/agent/#configuration
- https://docs.datadoghq.com/agent/guide/agent-configuration-files/
- https://github.com/DataDog/datadog-agent/blob/main/pkg/config/config_template.yaml

<br>

### グローバルオプション

#### ・グローバルオプションとは

全てのテレメトリーに関するオプションとして使用できる．

#### ・api_key

DatadogのAPIキーを設定する．

```yaml
#########################
## Basic Configuration ##
#########################

## @param api_key - string - required
## @env DD_API_KEY - string - required
## The Datadog API key to associate your Agent's data with your organization.
## Create a new API key here: https://app.datadoghq.com/account/settings
#
api_key: <APIキー>

# 〜 中略 〜
```

<br>

### ログオプション

#### ・ログオプション

ログに関するオプションとして使用できる．

#### ・logs_enabled

ログの収集はデフォルトで無効化されているため，有効化する必要がある．

```yaml
# 〜 中略 〜

##################################
## Log collection Configuration ##
##################################

## @param logs_enabled - boolean - optional - default: false
## @env DD_LOGS_ENABLED - boolean - optional - default: false
## Enable Datadog Agent log collection by setting logs_enabled to true.
#
logs_enabled: true

# 〜 中略 〜
```

<br>

## 03. コンテナの場合

###  ```/etc/datadog-agent/datadog.yaml```ファイル

コンテナもサーバーと同様にして```datadog.yaml```ファイルが必要である．ただサーバーの場合とは異なり，環境変数から値を設定できる．

参考：https://docs.datadoghq.com/getting_started/agent/#configuration 

<br>

### グローバル変数

#### ・グローバル変数とは

全てのテレメトリーに関する環境変数として使用できる．datadogコンテナの環境変数として設定する．

参考：https://docs.datadoghq.com/agent/docker/?tab=%E6%A8%99%E6%BA%96#%E3%82%B0%E3%83%AD%E3%83%BC%E3%83%90%E3%83%AB%E3%82%AA%E3%83%97%E3%82%B7%E3%83%A7%E3%83%B3

| 変数名            | 説明                                                         | 補足                                                         | DatadogコンソールURL                         |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------- |
| ```DD_API_KEY```  | datadogコンテナがあらゆるデータをDatadogに送信するために必要である． |                                                              |                                              |
| ```DD_ENV```      | APMを用いる場合，マイクロサービスやトレースにて，```env```タグに値を設定する． |  | https://app.datadoghq.com/apm/services       |
| ```DD_HOSTNAME``` | コンテナのホスト名を設定する．                               | Fargateを用いる場合は，これを用いないようにする．<br>参考：https://docs.datadoghq.com/integrations/ecs_fargate/?tab=fluentbitandfirelens#%E3%81%9D%E3%81%AE%E4%BB%96%E3%81%AE%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0 | https://app.datadoghq.com/infrastructure/map |
| ```ECS_FARGATE``` | Fargateを用いる場合，これを宣言する．                        |                                                              |                                              |

<br>

### メトリクス変数

#### ・通常メトリクス

通常メトリクスに関する環境変数として使用できる．一部のメトリクスは，デフォルトでは収集しないようになっており，収集するためにエージェントを有効化する必要がある．

参考：https://docs.datadoghq.com/agent/docker/?tab=%E6%A8%99%E6%BA%96#%E3%82%AA%E3%83%97%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E5%8F%8E%E9%9B%86-agent

| 変数名                         | 説明                                                         | 補足                                                         | DatadogコンソールURL                 |
| ------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------ |
| ```DD_APM_ENABLED```           | APMエージェントを有効化する．                                | Fargateを用いている場合，APMエージェントを有効化するだけでなく，分散トレースを送信できるように，マイクロサービスにパッケージのインストールが必要である．<br>参考：<br>・https://app.datadoghq.com/apm/docs?architecture=host-based&framework=php-fpm&language=php<br>・https://docs.datadoghq.com/tracing/#datadog-%E3%81%B8%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B9%E3%82%92%E9%80%81%E4%BF%A1 | https://app.datadoghq.com/apm/home   |
| ```DD_LOGS_ENABLED```          | -                                                            |                                                              |                                      |
| ```DD_PROCESS_AGENT_ENABLED``` | ライブプロセスを有効化し，実行中のプロセスを収集する．<br>参考：https://docs.datadoghq.com/infrastructure/process/?tab=linuxwindows |                                                              | https://app.datadoghq.com/containers |

#### ・カスタムメトリクス

カスタムメトリクスに関する環境変数として使用できる．

参考：https://docs.datadoghq.com/agent/docker/?tab=%E6%A8%99%E6%BA%96#dogstatsd-%E3%82%AB%E3%82%B9%E3%82%BF%E3%83%A0%E3%83%A1%E3%83%88%E3%83%AA%E3%82%AF%E3%82%B9

| 変数名                               | 説明                                                    | DatadogコンソールURL |
| ------------------------------------ | ------------------------------------------------------- | -------------------- |
| ```DD_DOGSTATSD_NON_LOCAL_TRAFFIC``` | datadogコンテナのカスタムメトリクスの受信を有効化する． |                      |

<br>

### ログ変数

#### ・ログ変数とは

ログに関する環境変数として使用できる．

参考：https://docs.datadoghq.com/agent/docker/apm/?tab=linux#docker-apm-agent-%E3%81%AE%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0

| 変数名             | 説明                                | 補足 |
| ------------------ | ----------------------------------- | ---- |
| ```DD_LOG_LEVEL``` | APMに送信するログレベルを設定する． |      |

<br>

### 分散トレース変数

#### ・分散トレース変数とは

分散トレースに関する環境変数として使用できる．分散トレースのタグ名に反映される．環境変数については，以下のリンクを参考にせよ．

参考：https://docs.datadoghq.com/tracing/setup_overview/setup/php/?tab=%E3%82%B3%E3%83%B3%E3%83%86%E3%83%8A#%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0%E3%82%B3%E3%83%B3%E3%83%95%E3%82%A3%E3%82%AE%E3%83%A5%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3

| 変数名                                        | 説明                                                         | 画面                                   |
| --------------------------------------------- | ------------------------------------------------------------ | -------------------------------------- |
| ```DD_SERVICE_MAPPING```                      | 分散トレースにマイクロサービス名を設定する．マイクロサービス名はデフォルトのインテグレーション名になるが，これを上書きできる<br>（例）```laravel:foo-laravel,pdo:foo-pdo``` | https://app.datadoghq.com/apm/services |
| ```DD_SERVICE_NAME```                         | 分散トレースにマイクロサービス名を設定する．```DD_SERVICE_MAPPING```がnullの場合，この環境変数の値が代わりにマイクロサービス名になる（仕組みがよくわからん）． |                                        |
| ```DD_TRACE_<インテグレーション名>_ENABLED``` | 有効化するインテグレーション名を設定する．デフォルトで全てのインテグレーションが有効化されているため，設定は不要である．Datadogのインテグレーションを無効化する場合は |                                        |
| ```DD_<インテグレーション名>_DISABLED```      | 無効化するインテグレーション名を設定する．                   |                                        |

<br>
