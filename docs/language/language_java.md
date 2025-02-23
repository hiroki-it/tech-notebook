---
title: 【IT技術の知見】Java
description: Javaの知見を記録しています。
---

# Java

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Javaとは

記入中...

## 02. JVM：Java Virtual Machine

JVM言語 (例：Java、Scala、Kotlinなど) のコードを、Javaバイトコードを含むクラスファイルに変換する。

<br>

## 03. Javaのコンパイルの仕組み

![java_compile](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/java_compile.png)

Javaでは、コードの実行前と実行中の二段階で機械語を翻訳する。

`(1)`

: Javaコンパイラ (javac) は、JVM言語のコード (`.java`ファイル) を、Javaバイトコードを含むクラスファイル (`.class`ファイル) に変換する。

`(2)`

: アプリケーションの実行前に、JVM内のJavaインタプリタはクラスファイルを機械語に翻訳する。

`(3)`

: アプリケーションの実行中に、JVM内のクラスローダーはクラスファイルをJVM内に取得する。

    クラスローダーの処理はCPUを大量に消費するため、ユーザーへの公開前にウォームアップを実施すると良い。

![java_class-loader.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/java_class-loader.png)

`(4)`

: アプリケーションの実行中に、JVM内のJITコンパイラは実行中メソッドのみを機械語に翻訳する。

    また、繰り返し実行されるメソッドの翻訳を最適化する (例：不要な処理を省く) 。

    JITコンパイラの処理はCPUを大量に消費するため、ユーザーへの公開前にウォームアップを実施すると良い。

`(5)`

: 結果的に、OS (制御プログラム？) に依存せずに、命令を実行できる (C言語) 。

> - https://stackoverflow.com/a/1481903/12771072
> - https://www.baeldung.com/java-jvm-warmup
> - https://eng-entrance.com/java-jlt
> - https://levelup.gitconnected.com/a-deep-dive-into-classloader-reflection-dynamic-typing-and-runtime-modifiable-classes-in-java-c83d6d689b2

<br>

### CPU消費

#### ▼ ウォームアップとは

JVM言語 (例：Java、Scala、Kotlinなど) 製のアプリケーションは、最初の実行時に以下の理由でCPUを大量に消費するために、パフォーマンスが低い。

- JVM内のクラスローダーはクラスファイル (`.class`ファイル) をJVM内に取得する。
- JVM内のJITコンパイラは実行中メソッドのみを機械語に翻訳する。

アプリケーションをユーザーに公開する前に、本番環境と同じデータを使ってアプリケーションを実行して上記を済ませておくとよい (ウォームアップ) 。

これにより、パフォーマンスが高い状態でユーザーにアプリケーションを公開できる。

![java_compile](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/java_compile.png)

> - https://stackoverflow.com/a/1481903/12771072
> - https://www.baeldung.com/java-jvm-warmup
> - https://eng-entrance.com/java-jlt
> - https://levelup.gitconnected.com/a-deep-dive-into-classloader-reflection-dynamic-typing-and-runtime-modifiable-classes-in-java-c83d6d689b2

#### ▼ ウォームアップの実装

フレームワーク (例：SpringBoot) によっては、Readinessエンドポイント (例：`/actuator/health/readiness`) を公開している。

ユーザーへの公開前に、このエンドポイントにリクエストを送信しておく。

> - https://spring.io/blog/2020/03/25/liveness-and-readiness-probes-with-spring-boot

#### ▼ Kubernetes環境の場合

ReadinessProbeヘルスチェックでウォームアップを実施する。

> - https://speakerdeck.com/hhiroshell/jvm-on-kubernetes?slide=48
> - https://speakerdeck.com/hhiroshell/jvm-on-kubernetes?slide=49
> - https://techblog.zozo.com/entry/zozomat-jvm-warmup

<br>

### メモリ消費

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

## 04. コンテナ化

### コンテナイメージの軽量化

コンテナイメージは、LTS (headless) が軽量なのでおすすめ。

> - https://speakerdeck.com/hhiroshell/jvm-on-kubernetes?slide=27

<br>
