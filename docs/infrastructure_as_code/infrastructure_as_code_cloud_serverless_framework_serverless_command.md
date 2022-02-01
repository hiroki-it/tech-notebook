---
title: 【知見を記録するサイト】serverlessコマンド＠Serverless Framework
description: serverlessコマンド＠Serverless Frameworkの知見をまとめました。
---

# serverlessコマンド＠Serverless Framework

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. コマンド

### print

#### ・printとは

参考：https://www.serverless.com/framework/docs/providers/aws/cli-reference/print

#### ・オプション無し

```bash
$ serverless print
```

#### ・パラメーター有

```bash
$ serverless print --FOO foo
```

<br>

### deploy

#### ・deployとは

参考：https://www.serverless.com/framework/docs/providers/aws/cli-reference/deploy

#### ・オプション無し

クラウドインフラを構築する．

```bash
$ serverless deploy
```

#### ・パラメーター

パラメーターを```serverless.yml```ファイルに渡し，```serverless deploy```コマンドを実行する．

```bash
$ serverless deploy --FOO foo
```

#### ・-v

実行ログを表示しつつ，```serverless deploy```コマンドを実行する．

```bash
$ serverless deploy -v
```

