---
title: 【IT技術の知見】コンテナオーケストレーション＠仮想化
description: コンテナオーケストレーション＠仮想化の知見を記録しています。
---

# コンテナオーケストレーション＠仮想化

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. コンテナオーケストレーションの種類

### 単一ホスト上のコンテナオーケストレーション

単一ホスト上のコンテナが対象である。異なるDockerfileを基に、コンテナイメージのビルド、コンテナレイヤーの作成、コンテナの作成、コンテナの起動、を実行できる。

| ツール名                       | ベンダー |
| ------------------------------ | -------- |
| Docker Compose                 | Docker   |
| ECS：Elastic Container Service | Amazon   |

<br>

### 複数ホストに渡るコンテナオーケストレーション

複数ホスト上のコンテナが対象である。どのホスト上のdockerデーモンに対して、どのコンテナに関する操作を行うのかを選択的に命令できる。

参考：https://www.techrepublic.com/article/simplifying-the-mystery-when-to-use-docker-docker-compose-and-kubernetes/

| ツール名                        | ベンダー |
| ------------------------------- | -------- |
| Docker Swarm                    | Docker   |
| Kubernetes                      | Google   |
| EKS：Elastic Kubernetes Service | Amazon   |

<br>

## 02. コンテナデザインパターン

### サイドカーパターン

#### ▼ サイドカーパターンとは

アプリケーションコンテナと同じPod内や、ECSタスク内に、アプリケーションの一部の機能のみを持つコンテナを配置する。

#### ▼ ロギングコンテナの配置

FluentBitコンテナをサイドカーコンテナとして稼働させ、アプリケーションコンテナからログを受信し、他にルーティングする。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/observability/observability_telemetry_fluentbit.html

#### ▼ メトリクス収集コンテナの配置

datadogコンテナをサイドカーコンテナとして稼働させ、アプリケーションコンテナからメトリクスのデータポイントを収集する。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/observability/observability_telemetry_datadog_metrics.html

<br>

### アンバサダーパターン

#### ▼ アンバサダーパターンとは

アプリケーションコンテナと同じPod内や、ECSタスク内に、リバースプロキシコンテナ（Envoy、Linkerd、など）を配置する。サービスメッシュを実現するために採用される。サイドカーパターンではないが、このプロキシコンテナのことをサイドカーコンテナともいう。

参考：https://logmi.jp/tech/articles/321841

<br>

### アダプターパターン

