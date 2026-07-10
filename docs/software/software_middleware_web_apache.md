---
title: 【IT技術の知見】Apache＠Web系ミドルウェア
description: Apache＠Web系ミドルウェアの知見を記録しています。
---

# Apache＠Web系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Apacheの仕組み

### アーキテクチャ

Apache は、Apache コアとモジュールから構成される。

![apache_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/apache_architecture.png)

> - https://thinkit.co.jp/article/120/1

<br>

### モジュール

#### ▼ 静的モジュール

静的モジュールは、ビルド後に Apache のバイナリに組み込む必要がある。

必要不要かにかかわらず、Apache と一緒に強制的に実行する必要がある。

#### ▼ 動的モジュール

動的モジュールは、ビルド後に Apache のバイナリに組み込む必要がない。

必要な場合にのみインストールし、また実行すればよい。

<br>

## 02. ユースケース

### リバースプロキシのミドルウェアとして

#### ▼ HTTP/HTTPSプロトコルでルーティング

記入中...

#### ▼ FastCGIプロトコルでルーティング

`mod_fcgid` モジュールを読み込むことによって、FastCGI プロトコルでルーティングできるようになる。

> - https://httpd.apache.org/mod_fcgid/

<br>

### Appサーバーのミドルウェアとして

`mod_php` モジュールを読み込むことによって、App サーバーのミドルウェアとしても機能させられる。

<br>
