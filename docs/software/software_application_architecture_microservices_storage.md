---
title: 【IT技術の知見】ストレージ領域＠マイクロサービスアーキテクチャ
description: ストレージ領域＠マイクロサービスアーキテクチャの知見を記録しています。
---

# ストレージ領域＠マイクロサービスアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 保管データの種類

- 永続データ
- 揮発性データ
- 静的ファイル
- 分析用加工済データ

<br>

## 02. 永続データ管理分割方法

### Shared DBパターン

#### ▼ Shared DBパターンとは

各マイクロサービスで共有するDBを`1`個だけ用意する。

この場合、単一のDB上で、スキーマやテーブルをマイクロサービスごとに作成する必要がある。

> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2
> - https://microservices.io/patterns/data/shared-database.html

#### ▼ マイクロサービス別のスキーマ

Shared DBの場合に、マイクロサービス別にスキーマを作成する。

![microservices_share-db_diff-table](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_share-db_diff-table.png)

> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2

#### ▼ マイクロサービス別のテーブル

Shared DBの場合に、マイクロサービス別にテーブルを作成する。

![microservices_share-db_diff-scheme](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_share-db_diff-scheme.png)

> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2

<br>

### DB per serviceパターン (Database per service)

#### ▼ DB per serviceパターンとは

各マイクロサービスで個別にDBを用意する。

ローカルトランザクションや分散トランザクションを実施する必要がある。

![microservices_diff-db](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_diff-db.png)

> - https://microservices.io/patterns/data/database-per-service.html
> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2

#### ▼ 境界づけられたコンテキスト分割とも相性がいい

マイクロサービスを境界づけられたコンテキスト単位で分割した場合に、マイクロサービスごとに異なる集約エンティティを持つため、永続化のデータ単位を分割できる。

これにより、各マイクロサービスが異なるDBを持っていても、トランザクションは異なるはずである。

> - https://www.amazon.co.jp/dp/1098100131

<br>

## 02-02. 永続データの種類に合わせたストレージ

### Polyglot Persistenceパターン

キーバリューDB、ドキュメントDB、RDB、グラフDBを異なるデータベースで管理する。

> - https://jp.drinet.co.jp/blog/datamanagement/polyglotpersistence

<br>

### Multi-model DBパターン

キーバリューDB、ドキュメントDB、RDB、グラフDBを同じデータベースで管理する。

> - https://jp.drinet.co.jp/blog/datamanagement/polyglotpersistence

<br>

## 03. 揮発性データ管理の分割方法

記入中...

<br>

## 04. 静的ファイル管理の分割方法

記入中...

<br>

## 05. 分析用加工済データの分割方法

記入中...

<br>

## 06. 保管データの暗号化

記入中...

<br>
