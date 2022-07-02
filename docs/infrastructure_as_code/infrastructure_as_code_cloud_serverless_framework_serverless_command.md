---
title: 【IT技術の知見】コマンド＠Serverless Framework
description: コマンド＠Serverless Frameworkの知見を記録しています。
---

# コマンド＠Serverless Framework

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. serverlessコマンド

### print

#### ▼ printとは

参考：https://www.serverless.com/framework/docs/providers/aws/cli-reference/print

```bash
$ serverless print
```

#### ▼ パラメーター有

```bash
$ serverless print --FOO foo
```

<br>

### deploy

#### ▼ deployとは

クラウドインフラを作成する。

参考：https://www.serverless.com/framework/docs/providers/aws/cli-reference/deploy


```bash
$ serverless deploy
```

#### ▼ パラメーター

パラメーターを```serverless.yml```ファイルに渡し、```serverless deploy```コマンドを実行する。

```bash
$ serverless deploy --FOO foo
```

#### ▼ -v

実行ログを表示しつつ、```serverless deploy```コマンドを実行する。

```bash
$ serverless deploy -v
```

<br>
