---
title: 【知見を記録するサイト】メトリクス収集＠Datadog
---

# メトリクス収集＠Datadog

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. サーバーのメトリクス収集

### サーバーdatadogエージェント

#### ・サーバーdatadogエージェントとは

常駐プログラムであり，アプリケーションからメトリクスを収集し，Datadogに転送する．

参考：https://www.netone.co.jp/knowledge-center/netone-blog/20210716-1/

![datadog-agent_on-server](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/datadog-agent_on-server.png)

<br>

### セットアップ

#### ・インストール

使用しているOSやIaCツールごとに，インストール方法が異なる．

参考：https://app.datadoghq.com/account/settings#agent

## 02. コンテナのメトリクス収集（AWSの場合）

### コンテナdatadogエージェント

#### ・コンテナdatadogエージェントとは

常駐プログラムであり，アプリケーションから送信されたメトリクスをDatadogに転送する．サーバーの場合とは異なり，自身が収集しにいくことはできない．

参考：https://docs.datadoghq.com/ja/integrations/ecs_fargate/?tab=fluentbitandfirelens#%E3%82%BB%E3%83%83%E3%83%88%E3%82%A2%E3%83%83%E3%83%97

#### ・環境変数

グローバルオプションとして役立つ環境変数を以下に示す．

参考：https://docs.datadoghq.com/ja/agent/docker/?tab=%E6%A8%99%E6%BA%96#%E3%82%B0%E3%83%AD%E3%83%BC%E3%83%90%E3%83%AB%E3%82%AA%E3%83%97%E3%82%B7%E3%83%A7%E3%83%B3

| 変数名            | 説明                                                         | 補足                                                         | DatadogコンソールURL                         |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------- |
| ```DD_API_KEY```  | DatadogコンテナがあらゆるデータをDatadogに送信するために必要である． |                                                              |                                              |
| ```DD_ENV```      | APMを用いる場合，マイクロサービスやトレースにて，```env```タグに値を設定する． | マイクロサービス単位で絞り込めるように，```prd-foo```や```stg-foo```とした方が良い． | https://app.datadoghq.com/apm/services       |
| ```DD_HOSTNAME``` | コンテナのホスト名を設定する．                               | Fargateを用いる場合は，これを用いないようにする．<br>参考：https://docs.datadoghq.com/ja/integrations/ecs_fargate/?tab=fluentbitandfirelens#%E3%81%9D%E3%81%AE%E4%BB%96%E3%81%AE%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0 | https://app.datadoghq.com/infrastructure/map |
| ```ECS_FARGATE``` | Fargateを用いる場合，これを宣言する．                      |                                                              |                                              |

任意で選択できるメトリクスの収集として役立つ環境変数を以下に示す．一部のメトリクスは，デフォルトでは収集しないようになっており，収集するためにエージェントを有効化する必要がある．

参考：https://docs.datadoghq.com/ja/agent/docker/?tab=%E6%A8%99%E6%BA%96#%E3%82%AA%E3%83%97%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E5%8F%8E%E9%9B%86-agent

| 変数名                         | 説明                                                         | 補足                                                         | DatadogコンソールURL                 |
| ------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------ |
| ```DD_APM_ENABLED```           | APMエージェントを有効化する．                                | Fargateを用いている場合，APMエージェントを有効化するだけでなく，分散トレースを送信できるように，マイクロサービスにパッケージのインストールが必要である．<br>参考：<br>・https://app.datadoghq.com/apm/docs?architecture=host-based&framework=php-fpm&language=php<br>・https://docs.datadoghq.com/ja/tracing/#datadog-%E3%81%B8%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B9%E3%82%92%E9%80%81%E4%BF%A1 | https://app.datadoghq.com/apm/home   |
| ```DD_LOGS_ENABLED```          | -                                                            |                                                              |                                      |
| ```DD_PROCESS_AGENT_ENABLED``` | ライブプロセスを有効化し，実行中のプロセスを収集する．<br>参考：https://docs.datadoghq.com/ja/infrastructure/process/?tab=linuxwindows |                                                              | https://app.datadoghq.com/containers |

カスタムメトリクスの収集として役立つ環境変数を以下に示す．

参考：https://docs.datadoghq.com/ja/agent/docker/?tab=%E6%A8%99%E6%BA%96#dogstatsd-%E3%82%AB%E3%82%B9%E3%82%BF%E3%83%A0%E3%83%A1%E3%83%88%E3%83%AA%E3%82%AF%E3%82%B9

| 変数名                               | 説明                                                    | DatadogコンソールURL |
| ------------------------------------ | ------------------------------------------------------- | -------------------- |
| ```DD_DOGSTATSD_NON_LOCAL_TRAFFIC``` | Datadogコンテナのカスタムメトリクスの受信を有効化する． |                      |

<br>

### トレースエージェント

#### ・トレースエージェントとは

dockerエージェントにて，```DD_APM_ENABLED```の環境変数に```true```を割り当てると，トレースエージェントが有効になる．APMエージェントを有効化し，分散トレースを収集できる．APMでは，分散トレースを元にして，マイクロサービス間の依存関係をマイクロサービスマップとして確認できる．

参考：

- https://docs.datadoghq.com/ja/agent/docker/apm/?tab=linux
- https://docs.datadoghq.com/ja/tracing/#datadog-apm-%E3%81%AE%E7%A2%BA%E8%AA%8D

#### ・環境変数

一部の環境変数は，dockerエージェントの環境変数と重なる．

参考：https://docs.datadoghq.com/ja/agent/docker/apm/?tab=linux#docker-apm-agent-%E3%81%AE%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0

| 変数名             | 説明                                | 補足 |
| ------------------ | ----------------------------------- | ---- |
| ```DD_LOG_LEVEL``` | APMに送信するログレベルを設定する． |      |

<br>

### Datadogコンテナ

#### ・Datadogコンテナとは

Datadogが提供するdatadogイメージによって構築されるコンテナであり，コンテナのサイドカーコンテナとして配置される．コンテナ内で稼働するDatadog dockerエージェントが，コンテナからメトリクスを収集し，Datadogにこれを転送する．

参考：https://docs.datadoghq.com/ja/integrations/ecs_fargate/?tab=fluentbitandfirelens#%E6%A6%82%E8%A6%81

#### ・Datadogコンテナの配置

```bash
[
    {
        # laravelコンテナ
    },
    {
        # nginxコンテナ
    },
    {
        # datadogコンテナ
        "name": "datadog",
        "image": "datadog/agent:latest",
        "essential": false,
        "portMappings": [
            {
                "containerPort": 8126,
                "hostPort": 8126,
                "protocol": "tcp"
            }
        ],
        "logConfiguration": {
            "logDriver": "awslogs",
            "options": {
                "awslogs-group": "/prd-foo/laravel/log",
                "awslogs-region": "ap-northeast-1"
                "awslogs-stream-prefix": "/container"
            }
        },
        "cpu": 10,
        "memory": 256,
        "environment": [
            {
                "name": "ECS_FARGATE",
                "value": "true"
            },
            {
                "name": "DD_PROCESS_AGENT_ENABLED",
                "value": "true"
            },
            {
                "name": "DD_DOGSTATSD_NON_LOCAL_TRAFFIC",
                "value": "true"
            },
            {
                "name": "DD_APM_ENABLED",
                "value": "true"
            },
            {
                "name": "DD_LOGS_ENABLED",
                "value": "true"
            },
            {
                # アプリケーションに対するenvタグ
                "name": "DD_ENV",
                "value": "foo"
            },            
            {
                # アプリケーションに対するserviceタグ
                "name": "DD_SERVICE",
                "value": "foo"
            },
            {
                # アプリケーションに対するversionタグ            
                "name": "DD_VERSION",
                "value": "latest"
            }
        ],
        "secrets": [
            {
                "name": "DD_API_KEY",
                "valueFrom": "/prd-foo/DD_API_KEY"
            }
        ],
        "dockerLabels": {
            # ECSコンテナに対するenvタグ
            "com.datadoghq.tags.env": "prd",
            # ECSコンテナに対するserviceタグ            
            "com.datadoghq.tags.service": "foo",
            # ECSコンテナに対するversionタグ            
            "com.datadoghq.tags.version": "1.0.0"
        }
    }
]
```

#### ・IAMロール

Datadogコンテナがコンテナからメトリクスを収集できるように，ECSタスク実行ロールにポリシーを追加する必要がある．

参考：https://docs.datadoghq.com/ja/integrations/ecs_fargate/?tab=fluentbitandfirelens#iam-%E3%83%9D%E3%83%AA%E3%82%B7%E3%83%BC%E3%81%AE%E4%BD%9C%E6%88%90%E3%81%A8%E4%BF%AE%E6%AD%A3

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "ecs:ListClusters",
        "ecs:ListContainerInstances",
        "ecs:DescribeContainerInstances"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
```

<br>

## 03. メトリクス送信

### セットアップ

いくつかの方法で，収集されたメトリクスを送信できる．

参考：https://docs.datadoghq.com/ja/metrics/#datadog-%E3%81%B8%E3%81%AE%E3%83%A1%E3%83%88%E3%83%AA%E3%82%AF%E3%82%B9%E3%81%AE%E9%80%81%E4%BF%A1

<br>

### インテグレーションのセットアップ

Datadogでインテグレーションを有効化すると同時に，アプリケーションにエージェントをインストールする．

<br>

### メトリクスの削除

Datadogに送信されなくなったメトリクスは，時間経過とともにDatadogから削除される．

参考：https://docs.datadoghq.com/ja/dashboards/faq/historical-data/

<br>

## 04. 他テレメトリーとの相関付け

参考：https://docs.datadoghq.com/ja/logs/guide/correlate-logs-with-metrics/
