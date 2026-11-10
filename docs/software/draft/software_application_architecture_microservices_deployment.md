---
title: 【IT技術の知見】デプロイメント
description: デプロイメントの知見を記録しています。
---

# デプロイメント

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

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
- ブルー/グリーンデプロイメント

<br>

### リリースの順番

任意のマイクロサービスをデプロイしてから、フロントエンドアプリケーションをリリースする。

これにより、フロントエンドが存在しない新しい API にリクエストを送信してしまうようなミスを防げる。

> - https://zenn.dev/rio_dev/articles/3ff4d678a75426#%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E9%80%B2%E8%A1%8C

<br>

### キャッシュの削除

フロントエンドの送信元に CDN がある場合、フロントエンドのリリース後に CDN のキャッシュを削除する必要がある。

<br>

## 03. CI/CD

- CIOps
- GitOps

<br>

## 04. 汎用ロジック配布方法

### Externalized configuration

接続先や認証情報などの設定値をマイクロサービスの外部で管理し、実行時に環境変数や設定ファイルとして各マイクロサービスに注入する。

<br>

### Microservice chassis

- 汎用的なロジック (例：アプリケーションのロガー、データポイント記録パッケージ、スパン記録パッケージ)
- API 仕様書
- 開発環境ツール
- CI/CD 設定
- IaC 設定など

> - https://medium.com/starbugs/microservices-start-here-chassis-pattern-f1be783c522b

<br>

### サービステンプレート

<br>

### サービスメッシュ

<br>
