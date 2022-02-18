---
title: 【知見を記録するサイト】メトリクス収集＠Datadog
---

# メトリクス収集＠Datadog

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Processエージェント（サーバーの場合）

### Processエージェントとは

デーモンであるdatadogエージェントに含まれている．アプリケーションからメトリクスを収集し，Datadogに転送する．

参考：https://www.netone.co.jp/knowledge-center/netone-blog/20210716-1/

![datadog-agent_on-server](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/datadog-agent_on-server.png)

<br>

### セットアップ

#### ・```/etc/datadog-agent/datadog.yaml```ファイル

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/observability_monitoring/observability_datadog_agent_conf.html

<br>

## 02. Processエージェント（AWSコンテナの場合）

### Processエージェントとは

サーバーの場合と同様にして，アプリケーションから送信されたメトリクスをDatadogに転送する．

参考：https://docs.datadoghq.com/integrations/ecs_fargate/?tab=fluentbitandfirelens#%E3%82%BB%E3%83%83%E3%83%88%E3%82%A2%E3%83%83%E3%83%97

### トレースエージェント

#### ・トレースエージェントとは

dockerエージェントにて，```DD_APM_ENABLED```の環境変数に```true```を割り当てると，トレースエージェントが有効になる．APMエージェントを有効化し，分散トレースを収集できる．APMでは，分散トレースを元にして，マイクロサービス間の依存関係をマイクロサービスマップとして確認できる．

参考：

- https://docs.datadoghq.com/agent/docker/apm/?tab=linux
- https://docs.datadoghq.com/tracing/#datadog-apm-%E3%81%AE%E7%A2%BA%E8%AA%8D

#### <br>

### datadogコンテナ

#### ・datadogコンテナとは

Datadogが提供するdatadogイメージによって構築されるコンテナであり，コンテナのサイドカーコンテナとして配置される．コンテナ内で稼働するDatadog dockerエージェントが，コンテナからメトリクスを収集し，Datadogにこれを転送する．

参考：https://docs.datadoghq.com/integrations/ecs_fargate/?tab=fluentbitandfirelens#%E6%A6%82%E8%A6%81

#### ・datadogコンテナの配置

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
                "name": "DD_ENV",
                "value": "foo"
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

datadogコンテナがコンテナからメトリクスを収集できるように，ECSタスク実行ロールにポリシーを追加する必要がある．

参考：https://docs.datadoghq.com/integrations/ecs_fargate/?tab=fluentbitandfirelens#iam-%E3%83%9D%E3%83%AA%E3%82%B7%E3%83%BC%E3%81%AE%E4%BD%9C%E6%88%90%E3%81%A8%E4%BF%AE%E6%AD%A3

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

参考：https://docs.datadoghq.com/metrics/#datadog-%E3%81%B8%E3%81%AE%E3%83%A1%E3%83%88%E3%83%AA%E3%82%AF%E3%82%B9%E3%81%AE%E9%80%81%E4%BF%A1

<br>

### インテグレーションのセットアップ

Datadogでインテグレーションを有効化すると同時に，アプリケーションにエージェントをインストールする．

<br>

### メトリクスの削除

Datadogに送信されなくなったメトリクスは，時間経過とともにDatadogから削除される．

参考：https://docs.datadoghq.com/dashboards/faq/historical-data/

<br>

## 04. 他テレメトリーとの相関付け

参考：https://docs.datadoghq.com/logs/guide/correlate-logs-with-metrics/
