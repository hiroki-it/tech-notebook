---
title: 【IT技術の知見】回復性管理＠マイクロサービス領域
description: 回復性管理＠マイクロサービス領域の知見を記録しています。
---

# 回復性管理＠マイクロサービス領域

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01 回復性管理の設計

複数の回復性管理のパターンを組み合わせる。

> - https://medium.com/@AlexanderObregon/spring-microservices-resilience-with-retry-and-fallback-mechanisms-8500208fc463

<br>

## 02. タイムアウト

### タイムアウトとは

何らかの処理 (例：通信など) を実行した後に結果の返却を待機する最大時間である。

> - https://www.geeksforgeeks.org/microservices-resilience-patterns/#properly-explain-common-resilience-patterns

<br>

### 接続タイムアウト (Connection timeout)

『オープンタイムアウト (Open timeout) 』ともいう

処理の中でも、特にリクエストの到達を待機する最大時間である。

これの場合、サーバーにリクエストを送信できていない。

<br>

### 読み取りタイムアウト (Read timeout)

処理の中でも、リクエストが到達した後に特にレスポンスの返信を待機する最大時間である。

これの場合、サーバーにリクエストを送信できており、サーバーがレスポンスを返信できない状態にある。

HTTPのステータスコードでは、Gateway Timeout (`504`) が相当する。

<br>

### セッションタイムアウト (Session timeout)

記入中...

<br>

### アイドルタイムアウト (Idle timeout)

TCP接続中の無通信状態 (パケットの送受信がない状態) を許可する時間である。

<br>

## 03. リトライ

### リトライとは

記入中...

> - https://www.geeksforgeeks.org/retry-pattern-in-microservices/

<br>

## 04. ヘルスチェック

### アクティブ

記入中...

### パッシブ

- 外れ値検出

<br>

## 05. サーキットブレイカー

#### ▼ サーキットブレイカーとは

記入中...

> - https://www.geeksforgeeks.org/retry-pattern-in-microservices/

#### ▼ フォールバック

- 静的ファイルの返信
- キャッシュを使用した前回の処理結果の返信
- ユーザーによらないデータ (広告、ランキングなど) の返信

> - https://engineering.mercari.com/blog/entry/2018-12-23-150000/
> - https://www.geeksforgeeks.org/microservices-resilience-patterns/#properly-explain-common-resilience-patterns

<br>

## 06. バルクヘッド

> - https://www.geeksforgeeks.org/bulkhead-pattern/

<br>

## 07. レートリミット

> - https://www.geeksforgeeks.org/microservices-resilience-patterns/#properly-explain-common-resilience-patterns

<br>

## 08 .キャッシュ

> - https://www.geeksforgeeks.org/microservices-resilience-patterns/#properly-explain-common-resilience-patterns

<br>
