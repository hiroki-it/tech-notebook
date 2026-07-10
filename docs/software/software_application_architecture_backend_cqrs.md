---
title: 【IT技術の知見】CQRS：Command Query Responsibility Segregation＠アーキテクチャ
description: CQRS：Command Query Responsibility Segregation＠アーキテクチャの知見を記録しています。
---

# CQRS：Command Query Responsibility Segregation＠アーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. CQRS

### CQRSとは

![cqrs](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cqrs.png)

『Command Query Responsibility Segregation (コマンドクエリ責務分離) 』の略。

リポジトリパターンにおける更新系と参照系の処理を分離する設計のこと。

更新系のオブジェクトはそのままリポジトリとしてインフラストラクチャ層に配置する。

一方で参照系のオブジェクトは、参照のユースケースに応じて『QueryService オブジェクト』として設計し、ユースケース層に配置する (これ重要) 。

ソフトウェアに部分的に組み込める。

`N+1` 問題にも対処できる。

> - https://vaadin.com/learn/tutorials/ddd/tactical_domain_driven_design
> - https://little-hands.hatenablog.com/entry/2019/12/02/cqrs

<br>

### メリット

一覧画面に表示するデータは複数の集約からなるため、それぞれの集約に対応するリポジトリの参照系処理を順々にコールし、取得したデータを組み合わせる必要がある。

そのため、一覧表示のたびに複数のリポジトリをコールすることとなる。その結果として、ソフトウェア性能へ悪影響が生じる可能性もある。

また、異なるリポジトリをまたいで WHERE 句を使用できないため、複数の集約に渡る絞り込み検索を実装できない。

しかし CQRS を使用すると、更新系のオブジェクトはリポジトリ、一方で参照系のオブジェクトはユースケースに応じた QueryService オブジェクトとして設計することになる。

そのため、更新系では集約の単位をそのままにして、集約とは無関係な参照系処理を設計できる。

> - https://little-hands.hatenablog.com/entry/2019/12/02/cqrs

<br>

## 01-02. 処理系の種類

### Command (更新系)

#### ▼ Commandとは

`CREATE` 処理、`UPDATE` 処理、`DELETE` 処理を実行する処理フローのこと。

今回、クリーンアーキテクチャを前提として CQRS を説明する。

#### ▼ 仕組み

`(1)`

: インターフェース層のコントローラーにて、リクエストパラメーターからリクエストモデルを作成する。

`(2)`

: ユースケース層のインターラクターにて、リクエストモデルからデータを取り出し、ドメインモデルを作成する。これをインフラストラクチャ層のリポジトリの引数に渡す。

`(3)`

: インフラストラクチャ層の書き込み/読み出しリポジトリにて、ID モデルのデータを使用して、読み出し/書き込みリポジトリで SELECT 文を実行し、DB からレコードを配列として取得する。続けて、ドメインモデルからデータを取り出し、配列の値を上書きする。この配列で INSERT/UPDATE 文を実行する。インフラストラクチャ層の実装は、すべてを自前で実装せずに ORM で代用できる。void 型をユースケース層のインターラクターに渡す。

`(4)`

: ユースケース層のインターラクターにて、リクエストモデルから作成したときに使用したドメインモデルを使用して、レスポンスモデルを作成する。レスポンスモデルをインタフェース層のコントローラーに渡す。

`(5)`

: インターフェース層のコントローラーにて、レスポンスモデルを JSON に変換し、レスポンスを返信する。

> - https://stackoverflow.com/questions/19620404/entity-vs-dto-in-cqrs
> - https://softwareengineering.stackexchange.com/questions/378909/in-what-layer-are-the-dtos-stored-with-cqrs
> - https://github.com/exceptionnotfound/SampleCQRS

<br>

### Query (参照系)

#### ▼ Queryとは

`READ` 処理を実行するオブジェクトのこと。

今回、クリーンアーキテクチャを前提として CQRS を説明する。

#### ▼ 仕組み

`(1)`

: インターフェース層のコントローラーにて、リクエストパラメーターからリクエストモデルを作成する。

`(2)`

: ユースケース層のインターラクターにて、リクエストモデルからデータを取り出し、QueryCriteria オブジェクト (参照系検索条件) を作成する。ユースケースに応じた QueryService オブジェクトでは、QueryCriteria オブジェクトを使用して、DB からレコードを配列として取得する。この配列からそのユースケースに対応する DTO を作成する。DTO をレスポンスモデルと見なし、そのままインタフェース層のコントローラーに渡す。

`(3)`

: インターフェース層のコントローラーにて、DTO を JSON に変換し、レスポンスを返信する。

> - https://stackoverflow.com/questions/19620404/entity-vs-dto-in-cqrs
> - https://softwareengineering.stackexchange.com/questions/378909/in-what-layer-are-the-dtos-stored-with-cqrs
> - https://github.com/exceptionnotfound/SampleCQRS

<br>

## 02. CQRSとイベントソーシング式モデリング

イベントソーシングは、ステートソーシング (CRUD) とは異なり、データの参照/作成しかない。

つまり、DB アクセスの処理を更新系と参照系に分離する。そのため、CQRS の方法論と相性がよい。

テーブル構造は以下のとおりになり、イベントデータが参照/作成されるだけである。

| `id` | `event_name`  | `event_entity_name` | `event_entity_id` | `event_data`                                  |
| ---- | ------------- | ------------------- | ----------------- | --------------------------------------------- |
| 1    | OrderCreated  | Order               | 1                 | OrderCreatedオブジェクトをJSONに変換したもの  |
| 2    | OrderUpdated  | Order               | 1                 | OrderUpdatedオブジェクトをJSONに変換したもの  |
| 3    | OrderCreated  | Order               | 2                 | OrderCreatedオブジェクトをJSONに変換したもの  |
| 4    | OrderCanceled | Order               | 1                 | OrderCanceledオブジェクトをJSONに変換したもの |
| 5    | OrderCreated  | Order               | 3                 | OrderCreatedオブジェクトをJSONに変換したもの  |
| ...  | ...           | ...                 | ...               | ...                                           |

> - https://little-hands.hatenablog.com/entry/2019/12/02/cqrs
> - https://postd.cc/using-cqrs-with-event-sourcing/
> - https://qiita.com/uzawa-sorich/items/261021c1d265b20117ab#%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88%E3%82%BD%E3%83%BC%E3%82%B7%E3%83%B3%E3%82%B0es%E3%81%A3%E3%81%A6%E4%BD%95

<br>
