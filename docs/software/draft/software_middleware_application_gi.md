---
title: 【IT技術の知見】GI：Gateway Interface＠アプリケーション系ミドルウェア
description: GI：Gateway Interface＠アプリケーション系ミドルウェアの知見を記録しています。
---

# GI：Gateway Interface＠アプリケーション系ミドルウェア

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. CGI

Web サーバーが、リクエストを受信するたびに外部のプログラムをプロセスとして起動し、プログラムの標準出力をレスポンスとして返信するためのインターフェース仕様のこと。

![CGIの仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/CGIの仕組み.png)

<br>

## 02. FastCGI

CGI プロトコルの性能を向上させたプロトコル仕様のこと。

<br>

## 03. WSGI

Python の Web アプリケーションと Web サーバーを接続するためのインターフェース仕様のこと。

<br>
