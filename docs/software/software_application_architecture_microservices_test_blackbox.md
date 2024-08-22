---
title: 【IT技術の知見】ブラックボックステスト＠マイクロサービスアーキテクチャ
description: ブラックボックステスト＠マイクロサービスアーキテクチャの知見を記録しています。
---

# ブラックボックステスト＠マイクロサービスアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. コンポーネントテスト

### コンポーネントテストとは

マイクロサービスがそれ単体で正しく動作するかを検証する。

アップストリーム側マイクロサービスは検証対象ではないため、サービスモックとする。

> - https://engineering.mercari.com/blog/entry/20210928-mtf2021-day5-3/
> - https://www.parasoft.com/blog/what-are-different-types-of-tests-for-microservices/
> - https://semaphoreci.com/blog/test-microservices
> - https://www.cortex.io/post/an-overview-of-the-key-microservices-testing-strategies-types-of-tests-the-best-testing-tools

<br>

### コンポーネントテストツール例

#### ▼ 自前

言語によっては、ビルトインのコマンド (例：`go test`コマンド) でコンポーネントテストを実装できる。

#### ▼ ツール

記入中...

<br>

## 04. マイクロサービスの結合テスト (機能テスト、サービステスト)

### マイクロサービスの結合テストとは

マイクロサービスアーキテクチャの文脈では、一般的な機能テストを結合テストと呼ぶ。

特定のマイクロサービス自体と、アップストリーム側マイクロサービスや外部API (正常である前提) との連携が、機能要件通りに返信されるか否かを検証する。

もしマイクロサービスの結合テストを自動化する場合、マイクロサービスのCIパイプライン上ではなく、結合テスト専用のパイプライン上で実施する。

またパイプライン実行環境がマイクロサービスのエンドポイントにリクエストを送信できるよう、パイプライン実行環境からマイクロサービスまでの通信経路を用意する必要がある。

> - https://engineering.mercari.com/blog/entry/20210928-mtf2021-day5-3/
> - https://www.parasoft.com/blog/what-are-different-types-of-tests-for-microservices/
> - https://semaphoreci.com/blog/test-microservices

<br>

### 結合テストツール例

#### ▼ ツール

- Jenkins
- K6
- Gatling
- Taurus

<br>
