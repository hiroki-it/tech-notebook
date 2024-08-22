---
title: 【IT技術の知見】ホワイトボックステスト＠マイクロサービスアーキテクチャ
description: ホワイトボックステスト＠マイクロサービスアーキテクチャの知見を記録しています。
---

# ホワイトボックステスト＠マイクロサービスアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. マイクロサービス固有のホワイトボックステスト手法

### マイクロサービス固有のホワイトボックステスト手法とは

マイクロサービスアーキテクチャを採用している場合、マイクロサービス固有の観点でホワイトボックステストが必要になる。

<br>

## 02. マイクロサービスの単体テスト

### マイクロサービスの単体テストとは

単体テストは、マイクロサービスアーキテクチャでも同じである。

マイクロサービスのクラスや構造体のメソッドが、それ単体で正しく動作するかを検証する。

> - https://engineering.mercari.com/blog/entry/20210928-mtf2021-day5-3/
> - https://www.parasoft.com/blog/what-are-different-types-of-tests-for-microservices/
> - https://semaphoreci.com/blog/test-microservices

<br>

### 単体テストツール例

#### ▼ 自前

言語によっては、ビルトインのコマンド (例：`go test`コマンド) で単体テストを実装できる。

#### ▼ フロントエンド系ツール

記入中...

#### ▼ バックエンド系ツール

記入中...

<br>

## 03. CDCテスト

### CDCテストとは

特定のマイクロサービス (コンシューマー) とアップストリーム側マイクロサービス (プロデューサー) の連携のテストを実施する。

この時、一方のマイクロサービスに他方のマイクロサービスのモックの定義するのではなく、モックの定義を別に切り分ける。

![cdc-test](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cdc-test.png)

> - https://engineering.mercari.com/blog/entry/20210928-mtf2021-day5-3/
> - https://www.parasoft.com/blog/what-are-different-types-of-tests-for-microservices/
> - https://semaphoreci.com/blog/test-microservices
> - https://riotz.works/slides/2020-serverless-meetup-japan-virtual-4/#13

<br>

## 04. マイクロサービスのE2Eテスト (機能テストも兼ねる)

### マイクロサービスのE2Eテストとは

マイクロサービスアーキテクチャの文脈では、E2Eテストが機能テストも担う。

実際のユーザーを模した一連の操作 (フロントエンドへのリクエスト) を実施し、特定の機能に関する全てのコンポーネント間 (フロントエンド、各マイクロサービス、外部API、など) の連携のテストを実施する。

フロントエンドに対してリクエストを送信し、一連のマイクロサービスの処理を検証する。

> - https://commerce-engineer.rakuten.careers/entry/tech/0031

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
