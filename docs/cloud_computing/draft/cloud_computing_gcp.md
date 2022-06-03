---
title: 【知見を記録するサイト】GCP：Google Cloud Platform
description: GCP：Google Cloud Platformの知見をまとめました。
---

# GCP：Google Cloud Platform

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. App Engine

クラウドデプロイサーバーとして働く。

<br>

## 02. Certificate Manager

### SSL証明書の設置場所

#### ▼ 認証局

| サーバー提供者 | 自社の中間認証局名    | ルート認証局名 |
| ------------ | --------------------- | -------------- |
| GCP          | Google Trust Services |                |

<br>

## 03. Cloud Logging

ログの保存/検索/分析/モニタリング/アラート送信を実行できる。Cloud Loggingでログを扱うためのAPI（```logging.googleapis.com```）を公開している。

参考：https://cloud.google.com/logging/docs?hl=ja

<br>

## 04. Compute Engine

クラウドWebサーバーとして働く。

<br>
