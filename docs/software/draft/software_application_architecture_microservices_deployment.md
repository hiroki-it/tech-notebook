---
title: 【IT技術の知見】デプロイメント＠マイクロサービスアーキテクチャ
description: デプロイメント＠マイクロサービスアーキテクチャの知見を記録しています。
---

# デプロイメント＠マイクロサービスアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. マイクロサービス実行環境

- Serverless platforms
- Multiple services instance per host
- Service instance per VM
- Service instance per container

<br>

## 02. リリース方法

### リリース方法

- インプレースデプロイメント
- ローリングデプロイメント
- カナリアリリース
- ブルーグリーンデプロイメント

<br>

### リリースの順番

任意のマイクロサービスをデプロイしてから、フロントエンドアプリケーションをリリースする。

これにより、フロントエンドが存在しない新しいAPIにリクエストを送信してしまうようなミスを防げる。

> - https://zenn.dev/rio_dev/articles/3ff4d678a75426#%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E9%80%B2%E8%A1%8C

<br>

### キャッシュの削除

フロントエンドの送信元にCDNがある場合、フロントエンドのリリース後にCDNのキャッシュを削除する必要がある。

<br>

## 03. CI/CD

- CIOps
- GitOps

<br>

## 04. 汎用的ロジック配布方法

### Externalized configuration

<br>

### Microservice chassis

- 汎用的なロジック (例：アプリケーションのロガー)
- API仕様書
- 開発環境ツール
- CI/CD設定
- IaC設定など

> - https://medium.com/starbugs/microservices-start-here-chassis-pattern-f1be783c522b

<br>

### サービステンプレート

<br>

### サービスメッシュ

<br>
