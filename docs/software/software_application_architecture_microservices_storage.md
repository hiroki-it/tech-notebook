---
title: 【IT技術の知見】ストレージ領域＠マイクロサービスアーキテクチャ
description: ストレージ領域＠マイクロサービスアーキテクチャの知見を記録しています。
---

# ストレージ領域＠マイクロサービスアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. DBのデザインパターン

### 共有DBパターン (Shared database)

#### ▼ 共有DBパターンとは

各マイクロサービスで共有するDBを`1`個だけ用意する。

この場合、単一のDB上で、スキーマやテーブルをマイクロサービスごとに作成する必要がある。

> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2
> - https://microservices.io/patterns/data/shared-database.html

#### ▼ マイクロサービス別のスキーマ

共有DBの場合に、マイクロサービス別にスキーマを作成する。

![microservices_share-db_diff-table](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_share-db_diff-table.png)

> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2

<br>

#### ▼ マイクロサービス別のテーブル

共有DBの場合に、マイクロサービス別にテーブルを作成する。

![microservices_share-db_diff-scheme](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_share-db_diff-scheme.png)

> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2

<br>

### マイクロサービス別DBパターン (Database per service)

#### ▼ マイクロサービス別DBパターンとは

各マイクロサービスで個別にDBを用意する。

ローカルトランザクションや分散トランザクションを実施する必要がある。

![microservices_diff-db](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_diff-db.png)

> - https://microservices.io/patterns/data/database-per-service.html
> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2

#### ▼ 境界づけられたコンテキスト分割とも相性がいい

マイクロサービスを境界づけられたコンテキスト単位で分割した場合に、マイクロサービスごとに異なる集約エンティティを持つため、永続化のデータ単位を分割できる。

これにより、各マイクロサービスが異なるデータベースを持っていても、トランザクションは異なるはずである。

> - https://www.amazon.co.jp/dp/1098100131

<br>

## 02. マイクロサービス別DBパターンの場合

### ローカルトランザクション

#### ▼ ローカルトランザクションとは

`1`個のトランザクション処理によって、`1`個のマイクロサービスのDBやスキーマ (MySQLの文脈ではスキーマがDBに相当) を操作する。

推奨される。

マイクロサービスアーキテクチャでローカルトランザクションを使用する場合、これを連続的に実行する仕組みが必要になる。

また、これらの各DBに対する各トランザクションを紐付けられるように、トランザクションにID (例：UUID) を割り当てる必要がある。

> - https://software.fujitsu.com/jp/manual/manualfiles/M090098/B1WS0321/03Z200/B0321-00-03-12-01.html
> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2

#### ▼ ローカルトランザクションの実行パターンの種類

ローカルトランザクションベースのトランザクションパターンとして、Sagaパターンがある。

> - https://qiita.com/yasuabe2613/items/b0c92ab8c45d80318420#%E3%83%AD%E3%83%BC%E3%82%AB%E3%83%AB%E3%83%88%E3%83%A9%E3%83%B3%E3%82%B6%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E7%A8%AE%E9%A1%9E

<br>

### グローバルトランザクション (分散トランザクション)

#### ▼ グローバルトランザクションとは

分散トランザクションとも言う。

1個のトランザクションが含む各CRUD処理を異なるDBに対して実行する。

トランザクション中の各CRUDで、宛先のDBを動的に切り替える必要がある。

非推奨である。

> - https://thinkit.co.jp/article/14639?page=0%2C1

#### ▼ グローバルトランザクションの実行パターンの種類

グローバルトランザクションのトランザクションパターンとして、二相コミット (２フェーズコミット) がある。

> - https://www.ogis-ri.co.jp/otc/hiroba/technical/DTP/step2/
> - https://thinkit.co.jp/article/19251

<br>

## 03. 保管データの暗号化

記入中...

<br>
