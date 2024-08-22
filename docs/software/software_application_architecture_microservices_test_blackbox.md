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

## 02. マイクロサービスの回帰テストとロードテスト

### マイクロサービスの回帰テストとロードテストとは

もしマイクロサービスの回帰テストとロードテストを自動化する場合、マイクロサービスのCIパイプライン上ではなく、これらテスト専用のパイプライン上で実施する。

またパイプライン実行環境がマイクロサービスのエンドポイントにリクエストを送信できるよう、パイプライン実行環境からマイクロサービスまでの通信経路を用意する必要がある。

<br>

### 回帰テスト、ロードテストツール例

#### ▼ ツール

- Jenkins
- K6
- Gatling
- Taurus

<br>
