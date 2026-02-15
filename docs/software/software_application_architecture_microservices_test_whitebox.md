---
title: 【IT技術の知見】ホワイトボックステスト＠テスト領域
description: ホワイトボックステスト＠テスト領域の知見を記録しています。
---

# ホワイトボックステスト＠テスト領域

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ユニットテスト

### ユニットテストとは

ユニットテストは、マイクロサービスアーキテクチャの文脈であってもなくても同じである。

オブジェクト指向型であればマイクロサービスのクラス、関数型であれば関数が特定に入力に対して想定通りに出力するかを検証する。

```text
引数として入力
↓
Fooクラスやfoo関数の内部処理
↓
返却値として出力
```

> - https://engineering.mercari.com/blog/entry/20210928-mtf2021-day5-3/
> - https://www.parasoft.com/blog/what-are-different-types-of-tests-for-microservices/
> - https://semaphoreci.com/blog/test-microservices

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

> - https://martinfowler.com/articles/microservice-testing/#testing-component-introduction
> - https://engineering.mercari.com/blog/entry/20210928-mtf2021-day5-3/
> - https://www.parasoft.com/blog/what-are-different-types-of-tests-for-microservices/
> - https://semaphoreci.com/blog/test-microservices
> - https://www.cortex.io/post/an-overview-of-the-key-microservices-testing-strategies-types-of-tests-the-best-testing-tools

<br>

### マイクロサービスの種類に応じたサービステスト

#### ▼ ほかのマイクロサービスと通信するマイクロサービスの場合

ほかのマイクロサービスと通信するマイクロサービス（BFFなども含む）の場合、宛先マイクロサービスは検証対象ではないため、モックサービスとする。

### ▼ 永続化処理をもつマイクロサービスの場合

永続化処理をもつマイクロサービスの場合、事前にデータベースに初期データを挿入しておく。

マイクロサービスにリクエストを送信し、レスポンスデータが期待値に合致するかを検証する。

テスト後、初期データは削除しておく。

<br>

### サービステストツール例

#### ▼ 自前

言語によっては、ビルトインのコマンド (例：`go test` コマンド) でサービステストを実装できる。

#### ▼ ツール

記入中...

<br>

## 03. CDCテスト：Consumer-Driven Contracts Testing

### CDCテストとは

送信元マイクロサービス (コンシューマー) と宛先マイクロサービス (プロデューサー) の連携のテストを実施する。

この時、一方のマイクロサービスに他方のマイクロサービスのモックの定義するのではなく、モックの定義を『コントラクト (契約) サービス』として切り分ける。

これを双方のマイクロサービス間で共有する。

コントラクトサービス上で、双方のリクエスト／レスポンスの内容が期待値に合致するかを検証する。

![cdc-test](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cdc-test.png)

> - https://riotz.works/slides/2020-serverless-meetup-japan-virtual-4/#13
> - https://zenn.dev/hedrall/articles/cdc-test-20220614

<br>

### Contractサービス

送信元マイクロサービス (コンシューマー) と宛先マイクロサービス (プロデューサー) の双方のモックとして機能する。

例えば、PactはコントラクトサービスをPact Brokerとして提供する。

![cdc-test_contract-service](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cdc-test_contract-service.png)

> - https://docs.pact.io/pact_broker/webhooks#example-cicd-and-webhook-configuration

<br>

### 結合テストツール例

#### ▼ ツール

- Pact

<br>

## 04. E2Eテスト (機能テストも兼ねる)

### E2Eテストとは

マイクロサービスアーキテクチャの文脈では、E2Eテストが機能テストも担う。

実際のユーザーを模した一連の操作 (フロントエンドへのリクエスト) を実施し、特定の機能に関する全てのコンポーネント間 (フロントエンド、各マイクロサービス、外部APIなど) の連携のテストを実施する。

> - https://commerce-engineer.rakuten.careers/entry/tech/0031
> - https://engineering.mercari.com/blog/entry/20210928-mtf2021-day5-3/
> - https://www.parasoft.com/blog/what-are-different-types-of-tests-for-microservices/
> - https://semaphoreci.com/blog/test-microservices

<br>

### E2Eテストの方法

事前にデータベースに初期データを挿入しておく。

マイクロサービスアーキテクチャのフロントエンドに対して一連の操作を実施し、一連の機能の処理を検証する。

テスト後、初期データは削除しておく。

<br>

### E2Eテストツール例

#### ▼ 手動

手動でフロントエンドを操作し、E2Eテストを実施する。

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
