---
title: 【IT技術の知見】Java
description: Javaの知見を記録しています。
---

# プラクティス集＠Java

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Javaとは

## 02. JVM

### JVMとは：Java Virtual Machine

JVM言語 (例：Java、Scala、Kotlinなど) のコードを、Javaバイトコードを含むクラスファイルに変換する。

<br>

### JVMのメモリ消費

JavaのJVMではOOMキラーが起こることがある。

JVMは以下でメモリを消費するため、これら全てを合計したメモリサイズ以上を割り当てる必要がある。

- ヒープサイズ
- ロードされたメタデータ
- Code Cache
- UseCodeCacheFlushing
- ReservedCodeCacheSize
- Thread
- GC

> - https://dev.classmethod.jp/articles/using-native-memory-by-jvm/

<br>

### JVM言語のウォームアップ

#### ▼ ウォームアップとは

JVM言語 (例：Java、Scala、Kotlinなど) 製のアプリケーションは、最初の実行時にCPUを消費して以下を実施するために、パフォーマンスが低い。

- JITコンパイラはJavaバイトコードを解析し、コードをコンパイルする
- 低速なクラスを読み込む

アプリケーションをユーザーに公開する前に、本番環境と同じデータを使ってアプリケーションを実行して上記を済ませておく。

これにより、パフォーマンスが高い状態でユーザーにアプリケーションを公開できる。

> - https://devcenter.heroku.com/ja/articles/warming-up-a-java-process
> - https://stackoverflow.com/a/1481903/12771072
> - https://javanexus.com/blog/maximizing-jvm-warm-up-time

#### ▼ Kubernetesでの注意点

暖機運転が完了した後に、ReadinessProbeが成功となるように設定する。

> - https://speakerdeck.com/hhiroshell/jvm-on-kubernetes?slide=48
> - https://techblog.zozo.com/entry/zozomat-jvm-warmup

<br>

## 03. コンテナ化

### コンテナイメージの軽量化

コンテナイメージは、LTS (headless) が軽量なのでおすすめ。

> - https://speakerdeck.com/hhiroshell/jvm-on-kubernetes?slide=27

<br>
