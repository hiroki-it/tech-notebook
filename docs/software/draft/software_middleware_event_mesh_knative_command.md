---
title: 【IT技術の知見】コマンド
description: コマンドの知見を記録しています。
---

# コマンド

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

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
