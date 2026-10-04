---
title: 【IT技術の知見】コマンド＠Knative
description: コマンド＠Knativeの知見を記録しています。
---

# コマンド＠Knative

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. func

### create

イベント駆動関数のテンプレートを作成する。

```bash
$ func create -l <言語> <関数名>
```

> - [Creating functions - Knative](https://knative.dev/docs/functions/creating-functions/)

<br>

### deploy

イベント駆動関数、関数の公開に必要な Kubernetes リソースをデプロイする。

```bash
$ func deploy --registry <コンテナレジストリ名>

🙌 Function image built: <registry>/hello:latest
✅ Function deployed in namespace "default" and exposed at URL:
http://hello.default.127.0.0.1.sslip.io
```

> - [Deploying functions - Knative](https://knative.dev/docs/functions/deploying-functions/#procedure)

<br>
