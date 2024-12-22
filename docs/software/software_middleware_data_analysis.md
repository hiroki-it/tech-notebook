---
title: 【IT技術の知見】データ分析系ミドルウェア
description: データ分析系ミドルウェアの知見を記録しています。
---

# データ分析系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. データレイク

### データレイクとは

データ分析に使用する生データを保管する。

様々な形式のデータを保管できる。

> - https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-a-data-lake

<br>

### 管理データの種類

- ビッグデータ
- IoT
- SNS
- ストリーミングデータ

> - https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-a-data-lake

<br>

## 02. データウェアハウス

### データウェアハウスとは

加工済みデータを保管する。

特定の形式のデータのみを保管できる。

> - https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-a-data-lake

<br>

### 管理データの種類

- アプリケーションデータ
- ビジネスデータ
- トランザクションデータ
- バッチ出力データ

> - https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-a-data-lake

<br>

## 03. データメッシュ

データレイクやデータウェアハウスのように中央集権的にデータを管理するのではなく、データを分散的に管理する。

また、汎用的な実装を横断的に提供する。

> - https://www.montecarlodata.com/blog-data-mesh-vs-data-lake-whats-the-difference/

<br>
