---
title: 【IT技術の知見】uWSGI＠アプリケーション系ミドルウェア
description: uWSGI＠アプリケーション系ミドルウェアの知見を記録しています。
---

# uWSGI＠アプリケーション系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. uWSGIの仕組み

### アーキテクチャ

調査中...

<br>

## 01-02. ユースケース

### リバースプロキシのミドルウェアとして

#### ▼ 構成

リバースプロキシのミドルウェアとして使用できる。

この場合、uWSGIをパブリックネットワークに公開しさえすれば、パブリックネットワークからuWSGIを介して、後段のアプリケーションにアクセスできるようになる。


![uwsgi](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/uwsgi.png)


> ↪️ 参考：https://stackoverflow.com/questions/36475380/what-are-the-advantages-of-connecting-uwsgi-to-nginx-using-the-uwsgi-protocol


<br>

