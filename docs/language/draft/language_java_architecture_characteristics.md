---
title: 【IT技術の知見】アーキテクチャ特性＠Java
description: アーキテクチャ特性＠Javaの知見を記録しています。
---

# アーキテクチャ特性＠Java

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 性能

### コンテナイメージの軽量化

コンテナイメージは、LTS (headless) が軽量なのでおすすめ。

> - https://speakerdeck.com/hhiroshell/jvm-on-kubernetes?slide=27

<br>

### ウォームアップ

#### ▼ ウォームアップとは

Javaアプリケーションの実行前に、本番環境と同じデータを使ってアプリを実行しておく。

これにより、ソースコードがコンパイルされ、アプリケーションの実行が早くなる。

> - https://www.baeldung.com/java-jvm-warmup
> - https://www.fujitsu.com/jp/about/faq/sfw-interstage/applicationserver/11883.html
> - https://techblog.zozo.com/entry/zozomat-jvm-warmup
> - https://speakerdeck.com/hhiroshell/jvm-on-kubernetes?slide=46

#### ▼ Kubernetesでの注意点

暖機運転が完了した後に、Readness Probeが成功となるように設定する。

> - https://speakerdeck.com/hhiroshell/jvm-on-kubernetes?slide=48

<br>
