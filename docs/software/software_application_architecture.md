---
title: 【IT技術の知見】アーキテクチャ＠アプリケーション
description: アーキテクチャ＠アプリケーションの知見を記録しています。
---

# アーキテクチャ＠アプリケーション

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 原則

### Convention over configuration (設定より規約)

#### ▼ 設定より規約とは

開発者が決めなければいけないことを少なくなるようにソフトウェアを設計しようとする思想のこと。

アプリのデフォルト値だけでなく、インフラに関するツールのデフォルト値にも適用できる考え方である。

> - https://en.wikipedia.org/wiki/Convention_over_configuration

#### ▼ 意味のあるデフォルト値

設定より規約では、デフォルト値を推奨している。

使用されるユースケースが非常に多い値であればデフォルト値として設定し、例外の場合にデフォルト値以外を設定する。

利用者の認知負荷を減らし、またトラブルシューティングの助けになる。

> - https://softwareengineering.stackexchange.com/a/63929
> - https://blog.scottlogic.com/2018/11/22/default-values-in-code-and-configuration.html

<br>

### DRY

記入中...

> - https://zenn.dev/nanagi/articles/0e899711611630#dry%EF%BC%88don't-repeat-yourself%EF%BC%89

<br>

### Kiss

記入中...

> - https://zenn.dev/nanagi/articles/0e899711611630#kiss%E3%81%AE%E5%8E%9F%E5%89%87%EF%BC%88keep-it-simple-stupid.%EF%BC%89

<br>

### SOLID

記入中...

> - https://zenn.dev/nanagi/articles/0e899711611630#solid

<br>

### Twelve-Factor

#### ▼ Twelve-Factorとは

Webシステムのソフトウェアを開発する上でのベストプラクティスのこと。

> - https://12factor.net/ja/

<br>

### YAGNI

記入中...

> - https://zenn.dev/nanagi/articles/0e899711611630#yagni%EF%BC%88you-ain't-gonna-need-it.%EF%BC%89

<br>
