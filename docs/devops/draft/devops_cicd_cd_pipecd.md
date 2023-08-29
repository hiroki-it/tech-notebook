---
title: 【IT技術の知見】PipeCD＠CDツール
description: PipeCD＠CDツールの知見を記録しています。
---

# PipeCD＠CDツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## アーキテクチャ

### ECSの場合

PipeCDをECSの専用Serviceで動かして、Gitのリポジトリをポーリングする。

> - https://pipecd.dev/blog/2023/02/07/pipecd-best-practice-02-control-plane-on-ecs/
> - https://pipecd.dev/docs-v0.45.x/user-guide/managing-application/adding-an-application/

<br>

## 02. ECSApp

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
