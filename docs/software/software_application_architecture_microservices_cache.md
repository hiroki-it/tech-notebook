---
title: 【IT技術の知見】キャッシュ＠マイクロサービスアーキテクチャ
description: キャッシュ＠マイクロサービスアーキテクチャの知見を記録しています。
---

# キャッシュ＠マイクロサービスアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## フロントエンド

### CDN パターン

CDN パターンは、クラウドアーキテクチャで採用できるパターンです。

CDN パターンでは、物理的に世界の様々な場所にあるエッジサーバーがキャッシュサーバーとして機能します。

CDN パターンはマイクロサービスアーキテクチャとは直接的な関連性が低いです。

ただ、マイクロサービスアーキテクチャでこれを採用すると仕組みが複雑になるため、概説します。

```mermaid
flowchart LR

  クラウドデザインパターン --- CDN


```

[Cloud Architecture Patterns](https://www.oreilly.com/library/view/cloud-architecture-patterns/9781449357979/ch14.html)

#### ▼ キャッシュ返却処理のシーケンス

CDN の仕組みでは、オリジン (フロントエンドアプリ) のダウンストリームに、CDN DNS サーバーとエッジサーバーを配置します。

エッジサーバーのデータセンターは様々な場所にあります。

ブラウザ (PC、スマホ) の送信元からもっとも近いデータセンターにあるエッジサーバーが、静的ファイルのキャッシュを作成し、レスポンスします。

以下のシーケンス図では、マイクロサービスアーキテクチャでの CDN の仕組みを解説しています。

```mermaid
---
title: マイクロサービスアーキテクチャでのCDNの仕組み
---
sequenceDiagram

    autonumber

    actor ブラウザ (PC、スマホ)
    participant ブラウザ (PC、スマホ)
    participant ドメインレジストリ (Route53)
    participant CDN DNSサーバー
    participant エッジサーバー
    participant オリジン (フロントエンドアプリ)
    participant API Gatewayなど

    ブラウザ (PC、スマホ) ->> ドメインレジストリ (Route53): 正引き

    ドメインレジストリ (Route53) ->> CDN DNSサーバー: 正引き

    CDN DNSサーバー -->> ドメインレジストリ (Route53): IPアドレス

    ドメインレジストリ (Route53) -->> ブラウザ (PC、スマホ): IPアドレス

    ブラウザ (PC、スマホ) ->> ドメインレジストリ (Route53): リクエスト

    ドメインレジストリ (Route53) ->> エッジサーバー: リクエスト

    エッジサーバー ->> エッジサーバー: キャッシュ検索

    alt キャッシュがあれば
      エッジサーバー -->> ブラウザ (PC、スマホ): レスポンス<br>(静的ファイル)
    else キャッシュがなければ
      エッジサーバー ->> オリジン (フロントエンドアプリ) : リクエスト
    end

    オリジン (フロントエンドアプリ) ->> API Gatewayなど : リクエスト

    API Gatewayなど -->> オリジン (フロントエンドアプリ) : レスポンス<br>(静的ファイル)

    オリジン (フロントエンドアプリ) -->> エッジサーバー : レスポンス<br>(静的ファイル)

    エッジサーバー ->> エッジサーバー : キャッシュ作成

    エッジサーバー -->> ブラウザ (PC、スマホ): レスポンス<br>(静的ファイル)

```

[How CloudFront delivers content - Amazon CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/HowCloudFrontWorks.html#HowCloudFrontWorksContentDelivery)

<br>

## バックエンド

### Cache-Aside

#### ▼ Cache-Asideとは

一度、Read処理したデータをDBとは別のキャッシュストレージに保存しておく。

#### ▼ AWSの場合

1. Redisを読む
2. ミスしたらAuroraのトランザクションで読む
3. Amazon AuroraのトランザクションをCOMMIT
4. 読み取った結果をRedisへ保存
5. 呼び出し元へ返す

<br>

### Read-Through

キャッシュストレージの裏側にDBをおいておく。

まずはキャッシュストレージからデータを取得し、もしキャッシュがなければキャッシュストレージがDBからデータを取得する。

<br>
