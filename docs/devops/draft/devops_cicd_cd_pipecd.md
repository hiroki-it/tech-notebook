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

また、デプロイ先にアプリをデプロイする。

> - https://pipecd.dev/docs-v0.45.x/installation/install-controlplane/

### データプレーン (エージェント)

デプロイ先で、コントロールプレーンからの通信を仲介する。

> - https://pipecd.dev/docs-v0.45.x/installation/install-piped/

<br>

## 02. ユースケース

### AWS ECSの場合

#### ▼ 同一のAWS ECS Cluster

PipeCDをデプロイ先のAWS ECS Clusterで一緒に動かす。

同じAWS ECS Clusterの専用Service上でPipeCDを動かし、Gitのリポジトリをポーリングする。

> - https://pipecd.dev/blog/2023/02/07/pipecd-best-practice-02-control-plane-on-ecs/
> - https://pipecd.dev/docs-v0.45.x/user-guide/managing-application/adding-an-application/

#### ▼ 外部のAWS ECS Cluster

PipeCDをデプロイ先のAWS ECS Clusterの外部で動かす。

PipeCDは、サーバーやコンテナ (AWS EKS、AWS ECS、AWS EC2) で動かせる。

なお、デプロイ先のAWS ECS Clusterにエージェントをインストールする必要がある。

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
