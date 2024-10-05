---
title: 【IT技術の知見】ホワイトボックステスト＠マイクロサービスアーキテクチャ
description: ホワイトボックステスト＠マイクロサービスアーキテクチャの知見を記録しています。
---

# ホワイトボックステスト＠マイクロサービスアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ユニットテスト

### ユニットテストとは

ユニットテストは、マイクロサービスアーキテクチャの文脈であってもなくても同じである。

マイクロサービスのクラスや構造体のメソッドが、それ単体で正しく動作するかを検証する。

> - https://engineering.mercari.com/blog/entry/20210928-mtf2021-day5-3/
> - https://www.parasoft.com/blog/what-are-different-types-of-tests-for-microservices/
> - https://semaphoreci.com/blog/test-microservices

<br>

### ユニットテストツール例

#### ▼ 自前

言語によっては、ビルトインのコマンド (例：`go test`コマンド) でユニットテストを実装できる。

#### ▼ フロントエンド系ツール

記入中...

#### ▼ バックエンド系ツール

記入中...

<br>

## 02. サービステスト (コンポーネントテスト)

### サービステストとは

『コンポーネントテスト』ともいう。

マイクロサービスがそれ単体で正しく動作するかを検証する。

アップストリーム側マイクロサービスは検証対象ではないため、モックサービスとする。

> - https://martinfowler.com/articles/microservice-testing/#testing-component-introduction
> - https://engineering.mercari.com/blog/entry/20210928-mtf2021-day5-3/
> - https://www.parasoft.com/blog/what-are-different-types-of-tests-for-microservices/
> - https://semaphoreci.com/blog/test-microservices
> - https://www.cortex.io/post/an-overview-of-the-key-microservices-testing-strategies-types-of-tests-the-best-testing-tools

<br>

### サービステストツール例

#### ▼ 自前

言語によっては、ビルトインのコマンド (例：`go test`コマンド) でサービステストを実装できる。

#### ▼ ツール

記入中...

<br>

## 03. CDCテスト：Consumer-Driven Contracts Testing

### CDCテストとは

送信元マイクロサービス (コンシューマー) と宛先マイクロサービス (プロデューサー) の連携のテストを実施する。

この時、一方のマイクロサービスに他方のマイクロサービスのモックの定義するのではなく、モックの定義を『契約 (Contract) サービス』として切り分ける。

これを双方のマイクロサービス間で共有する。

契約サービス上で、双方のリクエスト/レスポンスの内容が期待値に合致するかを検証する。

![cdc-test](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cdc-test.png)

> - https://riotz.works/slides/2020-serverless-meetup-japan-virtual-4/#13
> - https://zenn.dev/hedrall/articles/cdc-test-20220614

<br>

### Contractサービス

送信元マイクロサービス (コンシューマー) と宛先マイクロサービス (プロデューサー) の双方のモックとして機能する。

例えば、Pactは契約サービスをPact Brokerとして提供する。

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

フロントエンドに対してリクエストを送信し、一連のマイクロサービスの処理を検証する。

> - https://commerce-engineer.rakuten.careers/entry/tech/0031
> - https://engineering.mercari.com/blog/entry/20210928-mtf2021-day5-3/
> - https://www.parasoft.com/blog/what-are-different-types-of-tests-for-microservices/
> - https://semaphoreci.com/blog/test-microservices

<br>

### 結合テストツール例

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
