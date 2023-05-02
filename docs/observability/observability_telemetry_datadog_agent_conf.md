---
title: 【IT技術の知見】datadogエージェントの設定＠Datadog
description: datadogエージェントの設定＠Datadogの知見を記録しています。
---

# datadogエージェントの設定＠Datadog

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. datadogエージェント

### datadogエージェントとは

Datadogとパケットを送受信するためには、アプリケーションにdatadogエージェントをインストールする必要がある。

使用しているOSやIaCツールごとに、インストール方法が異なる。

<br>

### メトリクス収集について

> ↪️：https://hiroki-it.github.io/tech-notebook/observability/observability_telemetry_datadog_metrics.html

<br>

### ログ収集について

> ↪️：https://hiroki-it.github.io/tech-notebook/observability/observability_telemetry_datadog_log.html

<br>

### 分散トレース収集について

> ↪️：https://hiroki-it.github.io/tech-notebook/observability/observability_telemetry_datadog_distributed_trace.html

<br>

## 02. サーバーの場合

### セットアップ

#### ▼ インストール (手動の場合)

```bash
# 環境変数を設定する。
$ export DD_AGENT_MAJOR_VERSION=7
$ export DD_API_KEY=<APIキー>
$ export DD_SITE=datadoghq.com

# インストールする。
$ bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"
```

#### ▼ インストール (Ansibleの場合)

> ↪️：https://app.datadoghq.com/account/settings#agent/ubuntu

```yaml
- task:
    - name: Install datadog agent
      ansible.builtin.shell: |
        bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"
      environment:
        DD_AGENT_MAJOR_VERSION: 7
        DD_API_KEY: <APIキー>
        DD_SITE: datadoghq.com
```

<br>

## 02-02. `/etc/datadog-agent/datadog.yaml`ファイル

### `datadog.yaml`ファイルとは

datadogエージェントを設定する。 `/etc/datadog-agent`ディレクトリに配置される。

datadogエージェントをインストールすると、`datadog.yaml.example`ファイルが作成されるため、これをコピーして作成する。

> ↪️：
>
> - https://app.datadoghq.com/account/settings#agent
> - https://docs.datadoghq.com/getting_started/agent/#configuration
> - https://docs.datadoghq.com/agent/guide/agent-configuration-files/
> - https://github.com/DataDog/datadog-agent/blob/main/pkg/config/config_template.yaml

<br>

### グローバルオプション

#### ▼ グローバルオプションとは

全てのテレメトリーに関するオプションとして使用できる。

#### ▼ api_key

DatadogのAPIキーを設定する。

```yaml
# ---------------------------------------------
# Basic Configuration
# ---------------------------------------------

## @param api_key - string - required
## @env DD_API_KEY - string - required
## The Datadog API key to associate your Agent's data with your organization.
## Create a new API key here: https://app.datadoghq.com/account/settings
#
api_key: <APIキー>
```

<br>

### ログオプション

#### ▼ ログオプション

ログに関するオプションとして使用できる。

#### ▼ logs_enabled

ログの収集はデフォルトで無効化されているため、有効化する必要がある。

```yaml
# ---------------------------------------------
# Log collection Configuration
# ---------------------------------------------

## @param logs_enabled - boolean - optional - default: false
## @env DD_LOGS_ENABLED - boolean - optional - default: false
## Enable Datadog Agent log collection by setting logs_enabled to true.
#
logs_enabled: true
```

<br>

## 03. コンテナの場合

### ベースイメージ

#### ▼ datadogイメージ

datadogコンテナのベースイメージとなるdatadogイメージがDatadog公式から提供されている。

ECRパブリックギャラリーからプルしたコンテナイメージをそのまま使用する場合と、プライベートECRリポジトリで再管理してから使用する場合がある。

#### ▼ DockerHubを使用する場合

AWS ECSタスクのコンテナ定義にて、DockerHubのURLを直接的に指定する。

datadogエージェントにデフォルトで内蔵されている設定をそのまま使用する場合は、こちらを採用する。

> ↪️：https://hub.docker.com/r/datadog/agent

```yaml
[{"name": "datadog", "image": "datadog/agent:latest"}]
```

#### ▼ ECRパブリックギャラリーを使用する場合

AWS ECSタスクのコンテナ定義にて、ECRパブリックギャラリーのURLを指定し、ECRイメージのプルする。

datadogエージェントにデフォルトで内蔵されている設定をそのまま使用する場合は、こちらを採用する。

```yaml
[{"name": "datadog", "image": "public.ecr.aws/datadog/agent:latest"}]
```

> ↪️：
>
> - https://gallery.ecr.aws/datadog/agent
> - https://github.com/DataDog/datadog-agent

#### ▼ プライベートECRリポジトリを使用する場合

あらかじめ、DockerHubからdatadogイメージをプルするためのDockerfileを作成し、プライベートECRリポジトリにコンテナイメージをプッシュしておく。

AWS ECSタスクのコンテナ定義にて、プライベートECRリポジトリのURLを指定し、ECRイメージのプルする。

datadogエージェントにデフォルトで内蔵されている設定を上書きしたい場合は、こちらを採用する。

> ↪️：https://hub.docker.com/r/datadog/agent

```dockerfile
FROM data/agent:latest

# 何らかのインストール
```

```yaml
[
  {
    "name": "datadog",
    "image": "*****.dkr.ecr.ap-northeast-1.amazonaws.com/private-foo-datadog-repository:*****",
  },
]
```

<br>

### AWS ECSへの導入

#### ▼ datadogコンテナ

Datadogが提供するdatadogイメージによって作成されるコンテナであり、コンテナのサイドカーコンテナとして配置される。

コンテナ内で稼働するDatadog dockerエージェントが、コンテナからメトリクスのデータポイントを収集し、Datadogにこれを転送する。

> ↪️：https://docs.datadoghq.com/integrations/ecs_fargate/?tab=logdriver#create-an-ecs-fargate-task

#### ▼ コンテナ定義

```yaml
[
  {
    ,
    # barコンテナ
  },
  {
    # datadogコンテナ (サイドカー)
    "name": "datadog",
    "image": "datadog/agent:latest",
    "essential": false,
    "portMappings":
      [
        {
          "containerPort": 8126,
          "hostPort": 8126,
          "protocol": "tcp"
        }
      ],
    "logConfiguration":
      {
        "logDriver": "awslogs",
        "options":
          {
            "awslogs-group": "/prd-foo/bar/log",
            "awslogs-region": "ap-northeast-1",
            "awslogs-stream-prefix": "/container",
          },
      },
    "cpu": 10,
    "memory": 256,
    "environment":
      [
        { "name": "ECS_FARGATE", "value": "true" },
        { "name": "DD_PROCESS_AGENT_ENABLED", "value": "true" },
        { "name": "DD_DOGSTATSD_NON_LOCAL_TRAFFIC", "value": "true" },
        { "name": "DD_APM_ENABLED", "value": "true" },
        { "name": "DD_LOGS_ENABLED", "value": "true" },
        { "name": "DD_ENV", "value": "foo" },
      ],
    "secrets": [{ "name": "DD_API_KEY", "valueFrom": "/prd-foo/DD_API_KEY" }],
    "dockerLabels": {
        # AWS ECSコンテナに対するenvタグ
        "com.datadoghq.tags.env": "prd",
        # AWS ECSコンテナに対するserviceタグ
        "com.datadoghq.tags.service": "foo",
        # AWS ECSコンテナに対するversionタグ
        "com.datadoghq.tags.version": "<バージョンタグ>",
      },
  },
]
```

#### ▼ AWS ECSのIAMロール

datadogコンテナがコンテナからメトリクスのデータポイントを収集できるように、AWS ECSタスク実行ロールにポリシーを追加する必要がある。

> ↪️：https://docs.datadoghq.com/integrations/ecs_fargate/?tab=fluentbitandfirelens#create-or-modify-your-iam-policy

```yaml
{
  "Version": "2012-10-17",
  "Statement":
    [
      {
        "Action":
          [
            "ecs:ListClusters",
            "ecs:ListContainerInstances",
            "ecs:DescribeContainerInstances",
          ],
        "Effect": "Allow",
        "Resource": "*",
      },
    ],
}
```

<br>

## 03-02. `/etc/datadog-agent/datadog.yaml`ファイル

### `datadog.yaml`ファイルとは

コンテナもサーバーと同様にして`datadog.yaml`ファイルが必要である。

ただサーバーの場合とは異なり、環境変数から値を設定できる。

> ↪️：https://docs.datadoghq.com/getting_started/agent/#configuration

<br>

### グローバル変数

#### ▼ グローバル変数とは

全てのテレメトリーに関する環境変数として使用できる。

datadogコンテナの環境変数として設定する。

> ↪️：https://docs.datadoghq.com/agent/docker/?tab=standard#global-options

| 変数名        | 説明                                                                             | 補足                                                                                                                                                                        | DatadogコンソールURL                         |
| ------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `DD_API_KEY`  | datadogコンテナがあらゆるデータをDatadogに送信するために必要である。             |                                                                                                                                                                             |                                              |
| `DD_ENV`      | APMを使用する場合、マイクロサービスや分散トレースにて、`env`タグに値を設定する。 |                                                                                                                                                                             | https://app.datadoghq.com/apm/services       |
| `DD_HOSTNAME` | コンテナのホスト名を設定する。                                                   | AWS ECS Fargateの場合は、これを使用しないようにする。<br>↪️：https://docs.datadoghq.com/integrations/ecs_fargate/?tab=fluentbitandfirelens#other-environment-variables | https://app.datadoghq.com/infrastructure/map |
| `ECS_FARGATE` | AWS ECS Fargateを使用する場合、これを宣言する。                                  |                                                                                                                                                                             |                                              |

<br>

### メトリクス変数

#### ▼ 通常メトリクス

通常メトリクスに関する環境変数として使用できる。

一部のメトリクスは、デフォルトでは収集しないようになっており、収集するためにエージェントを有効化する必要がある。

> ↪️：https://docs.datadoghq.com/agent/docker/?tab=standard#optional-collection-agents

| 変数名                     | 説明                                                                                                                                   | 補足                                                                                                                                                                                                                                      | DatadogコンソールURL                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `DD_APM_ENABLED`           | APMエージェントを有効化するか否かを設定する。                                                                                          | AWS ECS Fargateを採用している場合、APMエージェントを有効化するのみでなく、分散トレースを送信できるように、マイクロサービスにパッケージのインストールが必要である。<br>↪️：https://docs.datadoghq.com/tracing/#send-traces-to-datadog | https://app.datadoghq.com/apm/home   |
| `DD_PROCESS_AGENT_ENABLED` | ライブプロセスを有効化し、実行中のプロセスを収集する。<br>↪️：https://docs.datadoghq.com/infrastructure/process/?tab=linuxwindows |                                                                                                                                                                                                                                           | https://app.datadoghq.com/containers |

#### ▼ カスタムメトリクス

カスタムメトリクスに関する環境変数として使用できる。

> ↪️：https://docs.datadoghq.com/agent/docker/?tab=standard#dogstatsd-custom-metrics

| 変数名                           | 説明                                                                    |
| -------------------------------- | ----------------------------------------------------------------------- |
| `DD_DOGSTATSD_NON_LOCAL_TRAFFIC` | datadogコンテナのカスタムメトリクスの受信を有効化するか否かを設定する。 |

<br>

### ログ変数

#### ▼ ログ変数とは

ログに関する環境変数として使用できる。

| 変数名            | 説明                                     | 補足                                                                                                   |
| ----------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `DD_LOGS_ENABLED` | ログの収集を有効化するか否かを設定する。 | ↪️：https://docs.datadoghq.com/agent/docker/?tab=standard#optional-collection-agents              |
| `DD_LOG_LEVEL`    | APMに送信するログレベルを設定する。      | ↪️：https://docs.datadoghq.com/agent/docker/apm/?tab=linux#docker-apm-agent-environment-variables |

<br>

### 分散トレース変数

#### ▼ 分散トレース変数とは

分散トレースに関する環境変数として使用できる。

分散トレースのタグ名に反映される。

#### ▼ PHP用のクライアントパッケージの場合

| 変数名                                    | 説明                                                                                                                                                                     | 画面                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| `DD_SERVICE_MAPPING`                      | 分散トレースにマイクロサービス名を設定する。マイクロサービス名はデフォルトのインテグレーション名になるが、これを上書きできる。<br>(例) `laravel:foo-laravel,pdo:foo-pdo` | https://app.datadoghq.com/apm/services |
| `DD_SERVICE_NAME`                         | 分散トレースにマイクロサービス名を設定する。`DD_SERVICE_MAPPING`がnullの場合、この環境変数の値が代わりにマイクロサービス名になる (仕組みがよくわからん) 。               |                                        |
| `DD_TRACE_<インテグレーション名>_ENABLED` | 有効化するインテグレーション名を設定する。デフォルトで全てのインテグレーションが有効化されているため、設定は不要である。Datadogのインテグレーションを無効化する場合は    |                                        |
| `DD_<インテグレーション名>_DISABLED`      | 無効化するインテグレーション名を設定する。                                                                                                                               |                                        |

> ↪️：https://docs.datadoghq.com/tracing/setup_overview/setup/php/?tab=containers#environment-variable-configuration

<br>
