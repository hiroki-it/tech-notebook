---
title: 【IT技術の知見】プラクティス集＠Java
description: プラクティス集＠Javaの知見を記録しています。
---

# プラクティス集＠Java

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 性能

### コンテナイメージの軽量化

コンテナイメージは、LTS (headless) が軽量なのでおすすめ。

> - https://speakerdeck.com/hhiroshell/jvm-on-kubernetes?slide=27

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

### ウォームアップ

#### ▼ ウォームアップとは

Javaアプリの実行前に、本番環境と同じデータを使ってアプリを実行しておく。

これにより、ソースコードがコンパイルされ、アプリの実行が早くなる。

> - https://www.baeldung.com/java-jvm-warmup
> - https://www.fujitsu.com/jp/about/faq/sfw-interstage/applicationserver/11883.html
> - https://techblog.zozo.com/entry/zozomat-jvm-warmup
> - https://speakerdeck.com/hhiroshell/jvm-on-kubernetes?slide=46

#### ▼ Kubernetesでの注意点

暖機運転が完了した後に、Readness Probeが成功となるように設定する。

> - https://speakerdeck.com/hhiroshell/jvm-on-kubernetes?slide=48

<br>
