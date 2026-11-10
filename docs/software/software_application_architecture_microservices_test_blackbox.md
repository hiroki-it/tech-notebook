---
title: 【IT技術の知見】ブラックボックステスト
description: ブラックボックステストの知見を記録しています。
tags:
  - "アプリ"
  - "マイクロサービスアーキテクチャ"
  - "テスト"
---

# ブラックボックステスト

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 回帰テストやロードテスト

### マイクロサービスアーキテクチャにおける回帰テストやロードテストとは

もしマイクロサービスの回帰テストとロードテストを自動化する場合、マイクロサービスの CI パイプライン上ではなく、これらテスト専用のパイプライン上で実施する。

またパイプライン実行環境がマイクロサービスのエンドポイントにリクエストを送信できるよう、パイプライン実行環境からマイクロサービスまでの通信経路を用意する必要がある。

<br>

### 回帰テスト、ロードテストツール例

#### ▼ ツール

- Jenkins
- Grafana k6 (JavaScript でシナリオ定義できる)
- Gatling (Scala でシナリオ定義できる)
- Taurus (他のロードテストツールのラッパー)

<br>

#### ▼ モックマイクロサービス

システムが外部 API と接続する場合、外部 API に影響を与えないようにモックマイクロサービスを用意する。

ブラックボックステスト時は、外部 API へのドメインをモックマイクロサービスのドメインに切り替える。

![microservices_blackbox-test_external-api-mock](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_blackbox-test_external-api-mock.png)

> - [How to Test Microservices](https://semaphore.io/blog/test-microservices)

<br>
