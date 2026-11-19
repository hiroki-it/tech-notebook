---
title: 【IT技術の知見】データ処理ワークフロー
description: データ処理ワークフローの知見を記録しています。
tags:
  - "アプリ"
  - "マイクロサービスアーキテクチャ"
---

# データ処理ワークフロー

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. ETL パターン

次の処理フェーズをマイクロサービスで構成する。

1. データソースから生データを取得するマイクロサービス（業務マイクロサービス、バッチサービスなど）
2. 生データを処理しやすいように事前に加工するマイクロサービス
   - 必要であればストレージに一度永続化し、データ共有方式で後続のマイクロサービスに渡す
3. 加工されたデータから、何らかの指標（例：メトリクスなど）を計測する
   - 必要であればストレージに一度永続化し、データ共有方式で後続のマイクロサービスに渡す
4. 計測値の構造を整理し、監視フロントエンドやクライアントに提供する

```mermaid
flowchart LR
  source[(データソース)]
  collect["マイクロサービス<br>（生データの取得）"]
  transform["マイクロサービス<br>（データの加工）"]
  measure["マイクロサービス<br>（指標の計測）"]
  serve["マイクロサービス<br>（計測値の整理と提供）"]
  destination[監視フロントエンドなど]
  storage[(中間ストレージ)]

  source ==> collect ==> transform ==> measure ==> serve ==> destination
  transform -. 必要に応じて加工済みデータを保存 .-> storage
  storage -. 加工済みデータを取得 .-> measure
  measure -. 必要に応じて計測値を保存 .-> storage
  storage -. 計測値を取得 .-> serve
```

ちょっとしたデータ処理ワークフローであれば、マイクロサービスとして切り分けずに、モノリスアプリケーションのユースケース層でこれらのフローを実施する

> - [『Kubernetes ☸️ で実践する Platform Engineering 』を最高速度で読み抜いたる！！👊🏻 - Speaker Deck](https://speakerdeck.com/hiroki_hasegawa/kubernetesdeshi-jian-suru-platform-engineering-zui-gao-su-du-dedu-miba-itaru?slide=12)

<br>

## 02. CDC パターン

データソースの DB で発生した変更を検知し、変更内容をイベントとして後続のマイクロサービスに渡す。

```mermaid
flowchart LR
  database[(DB)]
  batch[バッチサービス]
  downstream[マイクロサービス]

  database ==>|変更の検知| batch
  batch ==>|変更内容の通知| downstream
```

<br>
