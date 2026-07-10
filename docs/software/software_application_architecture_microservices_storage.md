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

## 02. 永続データ管理の分割方法

### Shared DBパターン

#### ▼ Shared DBパターンとは

各マイクロサービスで共有する DB を `1` 個だけ用意する。

この場合、単一の DB 上で、DB スキーマやテーブルをマイクロサービスごとに作成する必要がある。

> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2
> - https://microservices.io/patterns/data/shared-database.html

#### ▼ マイクロサービス別のDBスキーマ

Shared DB の場合に、マイクロサービス別に DB スキーマを作成する。

![microservices_share-db_diff-table](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_share-db_diff-table.png)

> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2

#### ▼ マイクロサービス別のテーブル

Shared DB の場合に、マイクロサービス別にテーブルを作成する。

![microservices_share-db_diff-scheme](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_share-db_diff-scheme.png)

> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2

<br>

### DB per serviceパターン (Database per service)

#### ▼ DB per serviceパターンとは

各マイクロサービスで個別に DB を用意する。

ローカルトランザクションや分散トランザクション処理を実施する必要がある。

![microservices_diff-db](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_diff-db.png)

> - https://microservices.io/patterns/data/database-per-service.html
> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2

#### ▼ 境界づけられたコンテキスト分割とも相性がいい

マイクロサービスを境界づけられたコンテキスト単位で分割した場合に、マイクロサービスごとに異なる集約エンティティを持つため、永続化のデータ単位を分割できる。

これにより、各マイクロサービスが異なる DB を持っていても、トランザクションは異なるはずである。

> - https://www.amazon.co.jp/dp/1098100131

<br>

### Shared DBパターンとDB per serviceパターンの共存

#### ▼ Shared DBパターンが向いているマイクロサービス

| マイクロサービスの種類 | 概説                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------- |
| バッチ処理サービス     | バッチ処理を使うほかサービスと同じDB（つまり、Shared DBパターン）に永続化したほうがいい |

#### ▼ DB per serviceパターンが向いているマイクロサービス

- ほとんどすべての業務マイクロサービス

<br>

## 02-02. DDL、DCL、DMLの管理

### DDLの密結合パターン

DB per Service パターンと相性がいい。

マイクロサービスアーキテクチャで ORM を使用する場合に、ORM で DDL（DB スキーマ定義、テーブル定義）、DCL（トランザクション制御）と DML（レコード操作）を実装する。

DDL はマイクロサービスに統合し、ORM で DDL を実装する。

これにより、管理しやすくなる。

一方で、マイクロサービスは自身の DDL で管理したテーブルにしか接続できない。

<br>

### DDLの疎結合パターン

Shared DB パターンと DB per Service パターンの両方と相性がよく、Shared DB パターンと DB per service パターンが共存している場合にも適する。

マイクロサービスアーキテクチャで ORM を使用する場合に、ORM で DDL（DB スキーマ定義、テーブル定義）を実装せず、ORM は DCL（トランザクション制御）と DML（レコード操作）で実装する。

DDL はマイクロサービスから切り離し、DDL 専用のツール（例：TypeScript 製の atlas、Go 製の golang-migrate）を使用する。

マイクロサービスの開発言語と DDL ツールを合わせる必要はないが、合わせると認知負荷が小さい (例：Go 製のマイクロサービスであれば、golang-migrate)

これにより、ORM は自身の ORM のデータモデルからクエリを呼び出すことで、ORM のデータモデルに対応したテーブルを自由に接続し、操作できるようになる。

一方で、管理が大変になる

> - https://github.com/golang-migrate/migrate

<br>

## 02-03. 永続データの種類に合わせたストレージ

### Polyglot Persistenceパターン

キーバリューDB、ドキュメント DB、RDB、グラフ DB を異なるデータベースで管理する。

> - https://jp.drinet.co.jp/blog/datamanagement/polyglotpersistence

<br>

### Multi-model DBパターン

キーバリューDB、ドキュメント DB、RDB、グラフ DB を同じデータベースで管理する。

> - https://jp.drinet.co.jp/blog/datamanagement/polyglotpersistence

<br>

## 03. 揮発性データ管理の分割方法

記入中...

<br>

## 04. 静的ファイル管理の分割方法

### Shared Storageパターン

#### ▼ Shared Storageパターンとは

各マイクロサービスで共有するオブジェクトストレージを `1` 個だけ用意する。

この場合、単一のオブジェクトストレージ上で、ディレクトリをマイクロサービスごとに作成する必要がある。

<br>

### Storage per serviceパターン

#### ▼ Storage per serviceパターンとは

各マイクロサービスで個別にオブジェクトストレージを用意する。

<br>

### Shared StorageパターンとStorage per serviceパターンの共存

基本的には、Storage per service パターンが推奨である。

オブジェクトストレージをマイクロサービス単位で作成すると粒度が細かすぎる場合、いくつかのマイクロサービスでは Shared DB パターンとするとよい。

<br>

## 05. 分析用加工済データの分割方法

記入中...

<br>

## 06. 保管データの暗号化

記入中...

<br>
