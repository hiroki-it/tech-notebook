---
title: 【IT技術の知見】Apache＠Web系ミドルウェア
description: Apache＠Web系ミドルウェアの知見を記録しています。
---

# Apache＠Web系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Apacheの仕組み

### アーキテクチャ

Apacheは、Apacheコアとモジュールから構成される。モジュールには、静的/動的モジュールがある。静的モジュールはApacheをインストールした時点でApacheコアに組み込まれている。一方で、動的モジュールは```mod_so```を使用して拡張機能的に組み込め、また取り外しできる。

> ℹ️ 参考：https://thinkit.co.jp/article/120/1

![apache_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/apache_architecture.png)

<br>

## 02. ユースケース

### リバースプロキシのミドルウェアとして

#### ▼ HTTP/HTTPSプロトコルでルーティング

#### ▼ FastCGIプロトコルでルーティング

```mod_fcgid```モジュールを読み込むことによって、FastCGIプロトコルでルーティングできるようになる。

> ℹ️ 参考：https://httpd.apache.org/mod_fcgid/

<br>

### appサーバーのミドルウェアとして

```mod_php```モジュールを読み込むことによって、appサーバーのミドルウェアとしても機能させられる。

<br>
