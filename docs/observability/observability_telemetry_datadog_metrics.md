---
title: 【IT技術の知見】メトリクス収集＠Datadog
---

# メトリクス収集＠Datadog

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Processエージェント (サーバーの場合)

### Processエージェントとは

デーモンであるdatadogエージェントに含まれている。

アプリケーションからメトリクスのデータポイントを収集し、Datadogに転送する。

![datadog-agent_on-server](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/datadog-agent_on-server.png)

> ↪️ 参考：https://www.netone.co.jp/knowledge-center/netone-blog/20210716-1/

<br>

### セットアップ

#### ▼ `/etc/datadog-agent/datadog.yaml`ファイル

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/observability/observability_telemetry_datadog_agent_conf.html

<br>

## 02. Processエージェント (AWS ECS Fargateの場合)

### Processエージェントとは

サーバーの場合と同様にして、アプリケーションからメトリクスを受信し、Datadogに転送する。

> ↪️ 参考：https://docs.datadoghq.com/integrations/ecs_fargate/?tab=fluentbitandfirelens#%E3%82%BB%E3%83%83%E3%83%88%E3%82%A2%E3%83%83%E3%83%97

### トレースエージェント

#### ▼ トレースエージェントとは

dockerエージェントにて、`DD_APM_ENABLED`の環境変数に`true`を割り当てると、トレースエージェントが有効になる。

APMエージェントを有効化し、分散トレースを収集できる。

APMでは、分散トレースを元にして、マイクロサービス間の依存関係をマイクロサービスマップとして確認できる。

> ↪️ 参考：
>
> - https://docs.datadoghq.com/agent/docker/apm/?tab=linux
> - https://docs.datadoghq.com/tracing/#explore-datadog-apm

<br>

## 02-02. Cluster/Nodeエージェント (Kubernetesの場合)

### Cluster/Nodeエージェントとは

#### ▼ Kubernetesの場合

![datadog-agent_on_kubernetes](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/datadog-agent_on_kubernetes.png)

ClusterやワーカーNodeからメトリクスを受信し、コントロールプレーンNodeのkube-apiserverに転送する。

> ↪️ 参考：
>
> - https://www.datadoghq.com/ja/blog/datadog-cluster-agent/
> - https://blog.serverworks.co.jp/k8s-datadog

#### ▼ Kubernetes + Istioの場合

記入中...

![datadog-agent_on_kubernetes_istio](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/datadog-agent_on_kubernetes_istio.png)

> ↪️ 参考：
>
> - https://xtech.nikkei.com/atcl/nxt/column/18/01946/021500003/
> - https://docs.datadoghq.com/integrations/istio/

<br>

## 03. メトリクス送信

### セットアップ

いくつかの方法で、収集されたメトリクスを送信できる。

> ↪️ 参考：https://docs.datadoghq.com/metrics/#submitting-metrics-to-datadog

<br>

### インテグレーションのセットアップ

Datadogでインテグレーションを有効化すると同時に、アプリケーションにエージェントをインストールする。

<br>

### メトリクスの削除

Datadogに送信されなくなったメトリクスは、時間経過とともにDatadogから削除される。

> ↪️ 参考：https://docs.datadoghq.com/dashboards/faq/historical-data/

<br>

## 04. 他テレメトリーとの相関付け

> ↪️ 参考：https://docs.datadoghq.com/logs/guide/correlate-logs-with-metrics/
