---
title: 【IT技術の知見】プラクティス集＠Java
description: プラクティス集＠Javaの知見を記録しています。
---

# プラクティス集＠Java

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. コンテナ化

### コンテナイメージの軽量化

コンテナイメージは、LTS (headless) が軽量なのでおすすめ。

> - https://speakerdeck.com/hhiroshell/jvm-on-kubernetes?slide=27

<br>

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

JVM言語 (例：Java、Scala、Kotlinなど) 製のアプリケーションは、最初の実行時はパフォーマンスが低い。

これは、最初の実行時に、低速なクラスの読み込みとJITコンパイルの最適化が起こるためである。

そのため、アプリケーションをユーザーに公開する前に、本番環境と同じデータを使ってアプリケーションを実行しておく。

これにより、パフォーマンスが高い状態でユーザーにアプリケーションを公開できる。

> - https://www.fujitsu.com/jp/about/faq/sfw-interstage/applicationserver/11883.html
> - https://techblog.zozo.com/entry/zozomat-jvm-warmup
> - https://speakerdeck.com/hhiroshell/jvm-on-kubernetes?slide=46

#### ▼ Kubernetesでの注意点

暖機運転が完了した後に、ReadinessProbeが成功となるように設定する。

> - https://speakerdeck.com/hhiroshell/jvm-on-kubernetes?slide=48

<br>
