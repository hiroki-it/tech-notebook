---
title: 【IT技術の知見】コマンド＠Serverless Framework
description: コマンド＠Serverless Frameworkの知見を記録しています。
---

# コマンド＠Serverless Framework

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. serverless コマンド

### print

#### ▼ print とは

```bash
$ serverless print
```

> - [Serverless Framework Commands - AWS Lambda - Print \| Serverless Framework](https://www.serverless.com/framework/docs/providers/aws/cli-reference/print)

#### ▼ パラメーター有

```bash
$ serverless print --FOO foo
```

<br>

### deploy

#### ▼ deploy とは

クラウドインフラを作成する。

```bash
$ serverless deploy
```

> - [Serverless Framework Commands - AWS Lambda - Deploy \| Serverless Framework](https://www.serverless.com/framework/docs/providers/aws/cli-reference/deploy)

#### ▼ パラメーター

パラメーターを `serverless.yml` ファイルに渡し、`serverless deploy` コマンドを実行する。

```bash
$ serverless deploy --FOO foo
```

#### ▼ -v

実行ログを表示しつつ、`serverless deploy` コマンドを実行する。

```bash
$ serverless deploy -v
```

<br>
