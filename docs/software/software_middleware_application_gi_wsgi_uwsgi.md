---
title: 【IT技術の知見】uWSGI＠アプリケーション系ミドルウェア
description: uWSGI＠アプリケーション系ミドルウェアの知見を記録しています。
---

# uWSGI＠アプリケーション系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. uWSGIの仕組み

### アーキテクチャ

WSGIプロトコルを使用したアプリケーション系ミドルウェアである。

<br>

## 01-02. ユースケース

### リバースプロキシのミドルウェアとして

#### ▼ 構成

リバースプロキシのミドルウェアとして使用できる。

この場合、uWSGIをパブリックネットワークに公開しさえすれば、パブリックネットワークからuWSGIを経由して、後段のWebサーバーにリクエストを送信できるようになる。

![uwsgi](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/uwsgi.png)

> - https://stackoverflow.com/questions/36475380/what-are-the-advantages-of-connecting-uwsgi-to-nginx-using-the-uwsgi-protocol

<br>
