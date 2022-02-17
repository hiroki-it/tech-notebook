---
title: 【知見を記録するサイト】GCP：Google Cloud Platform
description: GCP：Google Cloud Platformの知見をまとめました．
---

# GCP：Google Cloud Platform

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. GCPによるアプリケーションのリリース

GCPから，グローバルIPアドレスと完全修飾ドメイン名が提供され，アプリケーションがリリースされる．

### クラウドデザイン例

以下のデザイン例では，Dualシステムが採用されている．

![GCPのクラウドデザイン一例](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/GCPのクラウドデザイン一例.png)

### GAE：Google App Engine：GAE

クラウドデプロイサーバーとして働く．AWSのElastic Beanstalkに相当する．



### GCE：Google Compute Engine

クラウドWebサーバーとして働く．AWSのEC2に相当する．



### SSL証明書の設置場所

#### ・認証局

| サーバー提供者 | 自社の中間認証局名    | ルート認証局名 |
| ------------ | --------------------- | -------------- |
| GCP          | Google Trust Services |                |
