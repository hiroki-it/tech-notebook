---
title: 【IT技術の知見】アーキテクチャ
description: アーキテクチャの知見を記録しています。
tags:
  - "アプリ"
---

# アーキテクチャ

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 原則

### Convention over configuration (設定より規約)

#### ▼ 設定より規約とは

開発者が決めなければいけないことを少なくなるようにソフトウェアを設計しようとする思想のこと。

アプリケーションのデフォルト値だけでなく、インフラに関するツールのデフォルト値にも適用できる考え方である。

> - [Convention over configuration - Wikipedia](https://en.wikipedia.org/wiki/Convention_over_configuration)

#### ▼ 意味のあるデフォルト値

設定より規約では、デフォルト値を推奨している。

使用されるユースケースが非常に多い値であればデフォルト値として設定し、例外の場合にデフォルト値以外を設定する。

利用者の認知負荷を減らし、またトラブルシューティングの助けになる。

> - https://softwareengineering.stackexchange.com/a/63929
> - [Default values in code and configuration](https://blog.scottlogic.com/2018/11/22/default-values-in-code-and-configuration.html)

<br>

### DRY

Don't Repeat Yourself の略であり、同じ知識やロジックをソフトウェア内の複数箇所に重複させずに一箇所で定義しようとする原則のこと。

> - [ソフトウェア設計についての原則や法則についてまとめてみた](https://zenn.dev/nanagi/articles/0e899711611630#dry%EF%BC%88don't-repeat-yourself%EF%BC%89)

<br>

### Kiss

Keep It Simple, Stupid の略であり、不必要な複雑さを避けてソフトウェアをできる限りシンプルに設計しようとする原則のこと。

> - [ソフトウェア設計についての原則や法則についてまとめてみた](https://zenn.dev/nanagi/articles/0e899711611630#kiss%E3%81%AE%E5%8E%9F%E5%89%87%EF%BC%88keep-it-simple-stupid.%EF%BC%89)

<br>

### SOLID

単一責任の原則、オープン・クローズドの原則、リスコフの置換原則、インターフェース分離の原則、依存性逆転の原則の頭文字を取った、オブジェクト指向設計の 5 つの原則のこと。

> - [ソフトウェア設計についての原則や法則についてまとめてみた](https://zenn.dev/nanagi/articles/0e899711611630#solid)

<br>

### Twelve-Factor

#### ▼ Twelve-Factor とは

Web システムのソフトウェアを開発するうえでのベストプラクティスのこと。

> - [The Twelve-Factor App （日本語訳）](https://12factor.net/ja/)

<br>

### YAGNI

You Ain't Gonna Need It の略であり、現時点で必要のない機能を将来使うかもしれないという理由で実装しないようにする原則のこと。

> - [ソフトウェア設計についての原則や法則についてまとめてみた](https://zenn.dev/nanagi/articles/0e899711611630#yagni%EF%BC%88you-ain't-gonna-need-it.%EF%BC%89)

<br>
