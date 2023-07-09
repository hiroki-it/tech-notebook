---
title: 【IT技術の知見】コマンド＠Serverless Framework
description: コマンド＠Serverless Frameworkの知見を記録しています。
---

# コマンド＠Serverless Framework

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. serverlessコマンド

### print

#### ▼ printとは

```bash
$ serverless print
```

> - https://www.serverless.com/framework/docs/providers/aws/cli-reference/print

#### ▼ パラメーター有

```bash
$ serverless print --FOO foo
```

<br>

### deploy

#### ▼ deployとは

クラウドインフラを作成する。

```bash
$ serverless deploy
```

> - https://www.serverless.com/framework/docs/providers/aws/cli-reference/deploy

#### ▼ パラメーター

パラメーターを`serverless.yml`ファイルに渡し、`serverless deploy`コマンドを実行する。

```bash
$ serverless deploy --FOO foo
```

#### ▼ -v

実行ログを表示しつつ、`serverless deploy`コマンドを実行する。

```bash
$ serverless deploy -v
```

<br>
