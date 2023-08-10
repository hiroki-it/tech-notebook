---
title: 【IT技術の知見】マイクロサービスのテスト＠ホワイトボックステスト
description: マイクロサービスのテスト＠ホワイトボックステストの知見を記録しています。
---

# マイクロサービスのテスト＠ホワイトボックステスト

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

### 単体テストツール例

#### ▼ 自前

言語によっては、ビルトインのコマンド (例：`go test`コマンド) で単体テストを実装できる。

#### ▼ フロントエンド系ツール

記入中...

#### ▼ バックエンド系ツール

記入中...

<br>

## 03. コンポーネントテスト

### コンポーネントテストとは

マイクロサービスがそれのみで正しく動作するかを検証する。

下流のマイクロサービスは検証対象ではないため、サービスモックとする。

> - https://engineering.mercari.com/blog/entry/20210928-mtf2021-day5-3/
> - https://www.parasoft.com/blog/what-are-different-types-of-tests-for-microservices/
> - https://semaphoreci.com/blog/test-microservices

<br>

### コンポーネントテストツール例

#### ▼ 自前

言語によっては、ビルトインのコマンド (例：`go test`コマンド) でコンポーネントテストを実装できる。

#### ▼ フロントエンド系ツール

記入中...

#### ▼ バックエンド系ツール

記入中...

<br>

## 04. マイクロサービスの結合テスト (機能テスト)

### マイクロサービスの結合テストとは

マイクロサービスアーキテクチャの文脈では、機能テストを結合テストと呼ぶ。

マイクロサービスの各エンドポイントを`1`個の機能ととらえる。

最上流のマイクロサービス (またはその前段のAPI Gateway) のエンドポイントにリクエストを送信し、下流のマイクロサービスや外部Webサービス (正常である前提) との連携も含めて、レスポンスが機能要件通りに返信されるか否かを検証する。

もしマイクロサービスの結合テストを自動化する場合、マイクロサービスのCIパイプライン上ではなく、結合テスト専用のパイプライン上で実施する。

またパイプライン実行環境がマイクロサービスのエンドポイントにリクエストを送信できるよう、パイプライン実行環境からマイクロサービスまでの通信経路を用意する必要がある。

> - https://engineering.mercari.com/blog/entry/20210928-mtf2021-day5-3/
> - https://www.parasoft.com/blog/what-are-different-types-of-tests-for-microservices/
> - https://semaphoreci.com/blog/test-microservices

### 結合テストツール例

#### ▼ バックエンド系ツール

- Postman

<br>

## 05. CDCテスト：Consumer-Driven Contract

### CDCテストとは

> - https://engineering.mercari.com/blog/entry/20210928-mtf2021-day5-3/
> - https://www.parasoft.com/blog/what-are-different-types-of-tests-for-microservices/
> - https://semaphoreci.com/blog/test-microservices

<br>

## 06. マイクロサービスのE2Eテスト

### マイクロサービスのE2Eテストとは

実際のユーザーの一連の操作を模したリクエストをマイクロサービスなシステムに送信し、全てのコンポーネントを対象とした結合テストを実施する。

フロントエンドに対してリクエストを送信し、一連のマイクロサービスの処理を検証する。

> - https://commerce-engineer.rakuten.careers/entry/tech/0031

<br>
