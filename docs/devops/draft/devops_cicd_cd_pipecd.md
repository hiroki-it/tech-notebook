---
title: 【IT技術の知見】PipeCD＠CDツール
description: PipeCD＠CDツールの知見を記録しています。
---

# PipeCD＠CDツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. アーキテクチャ

### コントロールプレーン

対象のリポジトリをポーリングし、リポジトリをクローンする。

また、デプロイ先にアプリケーションをデプロイする。

> - https://pipecd.dev/docs-v0.45.x/installation/install-controlplane/

### データプレーン (エージェント)

デプロイ先で、コントロールプレーンからのリクエストを中継する。

> - https://pipecd.dev/docs-v0.45.x/installation/install-piped/

<br>

## 02. ユースケース

### Amazon ECSの場合

#### ▼ 同じAmazon ECS Cluster

PipeCD をデプロイ先の Amazon ECS Cluster で一緒に動かす。

同じ Amazon ECS Cluster の専用 Service 上で PipeCD を動かし、Git のリポジトリをポーリングする。

> - https://pipecd.dev/blog/2023/02/07/pipecd-best-practice-02-control-plane-on-ecs/
> - https://pipecd.dev/docs-v0.45.x/user-guide/managing-application/adding-an-application/

#### ▼ 外部のAmazon ECS Cluster

PipeCD をデプロイ先の Amazon ECS Cluster の外部で動かす。

PipeCD は、サーバーやコンテナ (Amazon EKS、Amazon ECS、Amazon EC2) で動かせる。

なお、デプロイ先の Amazon ECS Cluster にエージェントをインストールする必要がある。

> - https://pipecd.dev/docs-v0.45.x/installation/install-piped/

<br>

## 03. ECSApp

```yaml
apiVersion: pipecd.dev/v1beta1
kind: ECSApp
spec:
  name: foo
  labels:
    team: bar
```

> - https://pipecd.dev/docs-v0.45.x/user-guide/managing-application/adding-an-application/
> - https://pipecd.dev/docs-v0.45.x/user-guide/configuration-reference/#ecs-application

<br>
