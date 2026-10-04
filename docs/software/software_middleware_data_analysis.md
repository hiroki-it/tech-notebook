---
title: 【IT技術の知見】データ分析系ミドルウェア
description: データ分析系ミドルウェアの知見を記録しています。
---

# データ分析系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. データレイク

### データレイクとは

データ分析に使用する生データを保管する。

さまざまな形式のデータを保管できる。

> - [What is a Data Lake? Data Lake vs. Warehouse \| Microsoft Azure](https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-a-data-lake)

<br>

### 管理データの種類

- ビッグデータ
- IoT
- SNS
- ストリーミングデータ

> - [What is a Data Lake? Data Lake vs. Warehouse \| Microsoft Azure](https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-a-data-lake)

<br>

## 02. データウェアハウス

### データウェアハウスとは

加工済みデータを保管する。

特定形式のデータのみを保管できる。

> - [What is a Data Lake? Data Lake vs. Warehouse \| Microsoft Azure](https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-a-data-lake)

<br>

### 管理データの種類

- アプリケーションデータ
- ビジネスデータ
- トランザクションデータ
- バッチ出力データ

> - [What is a Data Lake? Data Lake vs. Warehouse \| Microsoft Azure](https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-a-data-lake)

<br>

## 03. データメッシュ

データレイクやデータウェアハウスのような中央集権的な管理ではなく、データを分散的に管理する。

また、汎用的な実装を横断的に提供する。

> - [Data Mesh Vs Data Lake: Pros, Cons, & How To Decide](https://www.montecarlodata.com/blog-data-mesh-vs-data-lake-whats-the-difference/)

<br>
