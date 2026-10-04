---
title: 【IT技術の知見】ホワイトボックステスト＠テスト領域
description: ホワイトボックステスト＠テスト領域の知見を記録しています。
---

# ホワイトボックステスト＠テスト領域

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. ユニットテスト

### ユニットテストとは

ユニットテストは、マイクロサービスアーキテクチャの文脈でも同じである。

オブジェクト指向型であればマイクロサービスのクラス、関数型であれば関数が特定の入力に対して想定通りに出力するかを検証する。

```text
引数として入力
↓
Fooクラスやfoo関数の内部処理
↓
返却値として出力
```

> - [【書き起こし】Scenario-Based Integration Testing Platform for Microservices – 森 健太【Merpay Tech Fest 2021】 \| メルカリエンジニアリング](https://engineering.mercari.com/blog/entry/20210928-mtf2021-day5-3/)
> - [What Are Different Types of Tests for Microservices? - Parasoft](https://www.parasoft.com/blog/what-are-different-types-of-tests-for-microservices/)
> - [How to Test Microservices](https://semaphoreci.com/blog/test-microservices)

<br>

### ユニットテストツール例

#### ▼ 自前

言語によっては、ビルトインのコマンド (例：`go test` コマンド) でユニットテストを実装できる。

#### ▼ フロントエンド系ツール

記入中...

#### ▼ バックエンド系ツール

記入中...

<br>

## 02. サービステスト (コンポーネントテスト)

### サービステストとは

『コンポーネントテスト』ともいう。

マイクロサービスがそれ単体でまさしく動作するかを検証する。

> - [Testing Strategies in a Microservice Architecture](https://martinfowler.com/articles/microservice-testing/#testing-component-introduction)
> - [【書き起こし】Scenario-Based Integration Testing Platform for Microservices – 森 健太【Merpay Tech Fest 2021】 \| メルカリエンジニアリング](https://engineering.mercari.com/blog/entry/20210928-mtf2021-day5-3/)
> - [What Are Different Types of Tests for Microservices? - Parasoft](https://www.parasoft.com/blog/what-are-different-types-of-tests-for-microservices/)
> - [How to Test Microservices](https://semaphoreci.com/blog/test-microservices)
> - [Microservices Testing: Effective Strategies, Test Types & Tools \| Cortex](https://www.cortex.io/post/an-overview-of-the-key-microservices-testing-strategies-types-of-tests-the-best-testing-tools)

<br>

### マイクロサービスの種類に応じたサービステスト

#### ▼ ほかのマイクロサービスと通信するマイクロサービスの場合

ほかのマイクロサービスと通信するマイクロサービス（BFF なども含む）の場合、宛先マイクロサービスは検証対象ではないため、モックサービスとする。

### ▼ 永続化処理をもつマイクロサービスの場合

永続化処理をもつマイクロサービスの場合、事前にデータベースへ初期データを挿入しておく。

マイクロサービスにリクエストを送信し、レスポンスデータが期待値に合致するかを検証する。

テスト後、初期データは削除しておく。

<br>

### サービステストツール例

#### ▼ 自前

言語によっては、ビルトインのコマンド (例：`go test` コマンド) でサービステストを実装できる。

#### ▼ ツール

記入中...

<br>

## 03. CDC テスト：Consumer-Driven Contracts Testing

### CDC テストとは

送信元マイクロサービス (コンシューマー) と宛先マイクロサービス (プロデューサー) の連携のテストを実施する。

このとき、一方のマイクロサービスに他方のマイクロサービスのモックを定義するのではなく、モックの定義を『コントラクト (契約) サービス』として切り分ける。

これを双方のマイクロサービス間で共有する。

コントラクトサービス上で、双方のリクエスト／レスポンスの内容が期待値に合致するかを検証する。

![cdc-test](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cdc-test.png)

> - [Pact (Consumer-Driven Contract Testing) を使ってサーバーレスの非同期テストのやりづらさを解決できるか \| Slides \| Riotz.works](https://riotz.works/slides/2020-serverless-meetup-japan-virtual-4/#13)
> - [マイクロサービス間の整合性を守る、消費者駆動契約テストをNode.jsで試してみる](https://zenn.dev/hedrall/articles/cdc-test-20220614)

<br>

### Contract サービス

送信元マイクロサービス (コンシューマー) と宛先マイクロサービス (プロデューサー) の双方のモックとして機能する。

例えば、Pact はコントラクトサービスを Pact Broker として提供する。

![cdc-test_contract-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cdc-test_contract-service.png)

> - [Webhooks \| Pact Docs](https://docs.pact.io/pact_broker/webhooks#example-cicd-and-webhook-configuration)

<br>

### 結合テストツール例

#### ▼ ツール

- Pact

<br>

## 04. E2E テスト (機能テストも兼ねる)

### E2E テストとは

マイクロサービスアーキテクチャの文脈では、E2E テストが機能テストも担う。

実際のユーザーを模した一連の操作 (フロントエンドへのリクエスト) を実施し、特定の機能に関するすべてのコンポーネント間 (フロントエンド、各マイクロサービス、外部 API など) の連携のテストを実施する。

> - [E2Eテスト: 導入の必要性・何を導入するのか - R-Hack（楽天グループ株式会社）](https://commerce-engineer.rakuten.careers/entry/tech/0031)
> - [【書き起こし】Scenario-Based Integration Testing Platform for Microservices – 森 健太【Merpay Tech Fest 2021】 \| メルカリエンジニアリング](https://engineering.mercari.com/blog/entry/20210928-mtf2021-day5-3/)
> - [What Are Different Types of Tests for Microservices? - Parasoft](https://www.parasoft.com/blog/what-are-different-types-of-tests-for-microservices/)
> - [How to Test Microservices](https://semaphoreci.com/blog/test-microservices)

<br>

### E2E テストの方法

事前にデータベースへ初期データを挿入しておく。

マイクロサービスアーキテクチャのフロントエンドに対して一連の操作を実施し、一連の機能の処理を検証する。

テスト後、初期データは削除しておく。

<br>

### E2E テストツール例

#### ▼ 手動

手動でフロントエンドを操作し、E2E テストを実施する。

#### ▼ ツール

実際のユーザーを模した一連の操作 (フロントエンドへのリクエスト) を実施する。

- Autify
- Cypress
- Mabl
- Selenium
- Puppeteer
- TestCafe

> - https://www.amazon.co.jp/dp/B0CH7XY3YT

<br>
