---
title: 【IT技術の知見】datadogエージェントの設定＠Datadog
description: datadogエージェントの設定＠Datadogの知見を記録しています。
---

# datadog エージェントの設定＠Datadog

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. datadog エージェント

### datadog エージェントとは

Datadog とパケットを送受信するためには、アプリケーションに datadog エージェントをインストールする必要がある。

使用している OS や IaC ツールごとに、インストール方法が異なる。

<br>

### データポイント収集について

> - https://hiroki-it.github.io/tech-notebook/observability/observability_telemetry_datadog_metrics.html

<br>

### ログ収集について

> - https://hiroki-it.github.io/tech-notebook/observability/observability_telemetry_datadog_log.html

<br>

### 分散トレース収集について

> - https://hiroki-it.github.io/tech-notebook/observability/observability_telemetry_datadog_distributed_trace.html

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

#### ▼ インストール (Ansible の場合)

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

> - https://app.datadoghq.com/account/settings#agent/ubuntu

<br>

## 02-02. `/etc/datadog-agent/datadog.yaml` ファイル

### `datadog.yaml` ファイルとは

datadog エージェントを設定する。 `/etc/datadog-agent` ディレクトリに配置される。

datadog エージェントをインストールすると、`datadog.yaml.example` ファイルが作成されるため、これをコピーして作成する。

> - https://app.datadoghq.com/account/settings#agent
> - https://docs.datadoghq.com/getting_started/agent/#configuration
> - https://docs.datadoghq.com/agent/guide/agent-configuration-files/
> - [datadog-agent/pkg/config/config_template.yaml at main · DataDog/datadog-agent · GitHub](https://github.com/DataDog/datadog-agent/blob/main/pkg/config/config_template.yaml)

<br>

### グローバルオプション

#### ▼ グローバルオプションとは

すべてのテレメトリーに関するオプションとして使用できる。

#### ▼ api_key

Datadog の API キーを設定する。

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

## @param logs_enabled - boolean - optional - default: "false"
## @env DD_LOGS_ENABLED - boolean - optional - default: "false"
## Enable Datadog Agent log collection by setting logs_enabled to true.
#
logs_enabled: "true"
```

<br>

## 03. コンテナの場合

### ベースイメージ

#### ▼ datadog イメージ

datadog コンテナのベースイメージとなる datadog イメージが Datadog 公式から提供されている。

ECR パブリックギャラリーからプルしたコンテナイメージをそのまま使用する場合と、プライベート ECR リポジトリで再管理してから使用する場合がある。

#### ▼ DockerHub を使用する場合

Amazon ECS タスクのコンテナ定義にて、DockerHub の URL を直接的に指定する。

datadog エージェントにデフォルトで内蔵されている設定をそのまま使用する場合は、こちらを採用する。

```yaml
[{"name": "datadog", "image": "datadog/agent:latest"}]
```

> - [datadog/agent - Docker Image](https://hub.docker.com/r/datadog/agent)

#### ▼ ECR パブリックギャラリーを使用する場合

Amazon ECS タスクのコンテナ定義で、ECR パブリックギャラリーの URL を指定し、ECR イメージをプルする。

datadog エージェントにデフォルトで内蔵されている設定をそのまま使用する場合は、こちらを採用する。

```yaml
[{"name": "datadog", "image": "public.ecr.aws/datadog/agent:latest"}]
```

> - https://gallery.ecr.aws/datadog/agent
> - [GitHub - DataDog/datadog-agent: Main repository for Datadog Agent · GitHub](https://github.com/DataDog/datadog-agent)

#### ▼ プライベート ECR リポジトリを使用する場合

あらかじめ、DockerHub から datadog イメージをプルするための Dockerfile を作成し、プライベート ECR リポジトリにコンテナイメージをプッシュしておく。

Amazon ECS タスクのコンテナ定義で、プライベート ECR リポジトリの URL を指定し、ECR イメージをプルする。

datadog エージェントにデフォルトで内蔵されている設定を上書きしたい場合は、こちらを採用する。

```dockerfile
FROM data/agent:latest

# 何らかのインストール
```

```yaml
[
  {
    "name": "datadog",
    "image": "<AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/private-foo-datadog-repository:*****",
  },
]
```

> - [datadog/agent - Docker Image](https://hub.docker.com/r/datadog/agent)

<br>

### Amazon ECS への導入

#### ▼ datadog コンテナ

Datadog が提供する datadog イメージによって作成されるコンテナであり、コンテナのサイドカーコンテナとして配置される。

コンテナ内で稼働する Datadog docker エージェントが、コンテナからメトリクスの元になるデータポイントを収集し、Datadog にこれをフォワーディングする。

> - https://docs.datadoghq.com/integrations/ecs_fargate/?tab=logdriver#create-an-ecs-fargate-task

#### ▼ コンテナ定義

```yaml
[
  {
    ,
    # bar コンテナ
  },
  {
    # datadog コンテナ (サイドカー)
    "name": "datadog",
    "image": "datadog/agent:latest",
    "essential": "false",
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
        # Amazon ECS コンテナに対する env タグ
        "com.datadoghq.tags.env": "prd",
        # Amazon ECS コンテナに対する service タグ
        "com.datadoghq.tags.service": "foo",
        # Amazon ECS コンテナに対する version タグ
        "com.datadoghq.tags.version": "<バージョンタグ>",
      },
  },
]
```

#### ▼ Amazon ECS の IAM ロール

datadog コンテナがコンテナからメトリクスの元になるデータポイントを収集できるように、Amazon ECS タスク実行ロールにポリシーを追加する必要がある。

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

> - https://docs.datadoghq.com/integrations/ecs_fargate/?tab=fluentbitandfirelens#create-or-modify-your-iam-policy

<br>

## 03-02. `/etc/datadog-agent/datadog.yaml` ファイル

### `datadog.yaml` ファイルとは

コンテナもサーバーと同様にして `datadog.yaml` ファイルが必要である。

ただサーバーの場合とは異なり、環境変数から値を設定できる。

> - https://docs.datadoghq.com/getting_started/agent/#configuration

<br>

### グローバル変数

#### ▼ グローバル変数とは

すべてのテレメトリーに関する環境変数として使用できる。

datadog コンテナの環境変数として設定する。

<table>
  <thead>
    <tr>
      <th>変数名</th>
      <th>説明</th>
      <th>補足</th>
      <th>Datadog コンソール URL</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>DD_API_KEY</code></td>
      <td>datadog コンテナがあらゆるデータを Datadog に送信するために必要である。</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td><code>DD_ENV</code></td>
      <td>APM を使用する場合、マイクロサービスや分散トレースにて、<code>env</code> タグに値を設定する。</td>
      <td></td>
      <td><a href="https://app.datadoghq.com/apm/services">https://app.datadoghq.com/apm/services</a></td>
    </tr>
    <tr>
      <td><code>DD_HOSTNAME</code></td>
      <td>コンテナのホスト名を設定する。</td>
      <td>Amazon ECS Fargate の場合は、これを使用しないようにする。<br>・<a href="https://docs.datadoghq.com/integrations/ecs_fargate/?tab=fluentbitandfirelens#other-environment-variables">https://docs.datadoghq.com/integrations/ecs_fargate/?tab=fluentbitandfirelens#other-environment-variables</a></td>
      <td><a href="https://app.datadoghq.com/infrastructure/map">https://app.datadoghq.com/infrastructure/map</a></td>
    </tr>
    <tr>
      <td><code>ECS_FARGATE</code></td>
      <td>Amazon ECS Fargate を使用する場合、これを宣言する。</td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>

> - https://docs.datadoghq.com/agent/docker/?tab=standard#global-options

<br>

### メトリクス変数

#### ▼ 通常メトリクス

通常メトリクスに関する環境変数として使用できる。

一部のメトリクスは、デフォルトでは収集しないようになっており、収集するためにエージェントを有効化する必要がある。

<table>
  <thead>
    <tr>
      <th>変数名</th>
      <th>説明</th>
      <th>補足</th>
      <th>Datadog コンソール URL</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>DD_APM_ENABLED</code></td>
      <td>APM エージェントを有効化するか否かを設定する。</td>
      <td>Amazon ECS Fargate を採用している場合、APM エージェントを有効化するのみでなく、分散トレースを送信できるように、マイクロサービスにパッケージのインストールが必要である。<br>・<a href="https://docs.datadoghq.com/tracing/#send-traces-to-datadog">https://docs.datadoghq.com/tracing/#send-traces-to-datadog</a></td>
      <td><a href="https://app.datadoghq.com/apm/home">https://app.datadoghq.com/apm/home</a></td>
    </tr>
    <tr>
      <td><code>DD_PROCESS_AGENT_ENABLED</code></td>
      <td>ライブプロセスを有効化し、実行中のプロセスを収集する。<br>・<a href="https://docs.datadoghq.com/infrastructure/process/?tab=linuxwindows">https://docs.datadoghq.com/infrastructure/process/?tab=linuxwindows</a></td>
      <td></td>
      <td><a href="https://app.datadoghq.com/containers">https://app.datadoghq.com/containers</a></td>
    </tr>
  </tbody>
</table>

> - https://docs.datadoghq.com/agent/docker/?tab=standard#optional-collection-agents

#### ▼ カスタムメトリクス

カスタムメトリクスに関する環境変数として使用できる。

<table>
  <thead>
    <tr>
      <th>変数名</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>DD_DOGSTATSD_NON_LOCAL_TRAFFIC</code></td>
      <td>datadog コンテナのカスタムメトリクスの受信を有効化するか否かを設定する。</td>
    </tr>
  </tbody>
</table>

> - https://docs.datadoghq.com/agent/docker/?tab=standard#dogstatsd-custom-metrics

<br>

### ログ変数

#### ▼ ログ変数とは

ログに関する環境変数として使用できる。

<table>
  <thead>
    <tr>
      <th>変数名</th>
      <th>説明</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>DD_LOGS_ENABLED</code></td>
      <td>ログの収集を有効化するか否かを設定する。</td>
      <td>・<a href="https://docs.datadoghq.com/agent/docker/?tab=standard#optional-collection-agents">https://docs.datadoghq.com/agent/docker/?tab=standard#optional-collection-agents</a></td>
    </tr>
    <tr>
      <td><code>DD_LOG_LEVEL</code></td>
      <td>APM に送信するログレベルを設定する。</td>
      <td>・<a href="https://docs.datadoghq.com/agent/docker/apm/?tab=linux#docker-apm-agent-environment-variables">https://docs.datadoghq.com/agent/docker/apm/?tab=linux#docker-apm-agent-environment-variables</a></td>
    </tr>
  </tbody>
</table>

<br>

### 分散トレース変数

#### ▼ 分散トレース変数とは

分散トレースに関する環境変数として使用できる。

分散トレースのタグ名に反映される。

#### ▼ PHP 用のクライアントパッケージの場合

<table>
  <thead>
    <tr>
      <th>変数名</th>
      <th>説明</th>
      <th>画面</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>DD_SERVICE_MAPPING</code></td>
      <td>分散トレースにマイクロサービス名を設定する。マイクロサービス名はデフォルトのインテグレーション名になるが、これを上書きできる。<br>(例) <code>laravel:foo-laravel,pdo:foo-pdo</code></td>
      <td><a href="https://app.datadoghq.com/apm/services">https://app.datadoghq.com/apm/services</a></td>
    </tr>
    <tr>
      <td><code>DD_SERVICE_NAME</code></td>
      <td>分散トレースにマイクロサービス名を設定する。<code>DD_SERVICE_MAPPING</code> が null の場合、この環境変数の値が代わりにマイクロサービス名になる (仕組みがよくわからん) 。</td>
      <td></td>
    </tr>
    <tr>
      <td><code>DD_TRACE_&lt;インテグレーション名&gt;_ENABLED</code></td>
      <td>有効化するインテグレーション名を設定する。デフォルトですべてのインテグレーションが有効化されているため、設定は不要である。Datadog のインテグレーションを無効化する場合は</td>
      <td></td>
    </tr>
    <tr>
      <td><code>DD_&lt;インテグレーション名&gt;_DISABLED</code></td>
      <td>無効化するインテグレーション名を設定する。</td>
      <td></td>
    </tr>
  </tbody>
</table>

> - https://docs.datadoghq.com/tracing/setup_overview/setup/php/?tab=containers#environment-variable-configuration

<br>
