---
title: 【IT技術の知見】DB＠マイクロサービスアーキテクチャ
description: DB＠マイクロサービスアーキテクチャの知見を記録しています。
---

# DB＠マイクロサービスアーキテクチャ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. DBのデザインパターン

### 共有DBパターン

#### ▼ 共有DBパターンとは

各マイクロサービスで共有するDBを`1`個だけ用意する。

この場合、単一のDB上で、スキーマやテーブルをマイクロサービスごとに作成する必要がある。

> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2
> - https://microservices.io/patterns/data/shared-database.html

#### ▼ マイクロサービス別のスキーマ

共有DBの場合に、マイクロサービス別にスキーマを作成する。

![microservices_share-db_diff-scheme](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_share-db_diff-scheme.png)

> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2

<br>

#### ▼ マイクロサービス別のテーブル

共有DBの場合に、マイクロサービス別にテーブルを作成する。

![microservices_share-db_diff-table](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_share-db_diff-table.png)

> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2

<br>

### マイクロサービス別DBパターン

#### ▼ マイクロサービス別DBパターンとは

各マイクロサービスで個別にDBを用意する。

ローカルトランザクションや分散トランザクションを実施する必要がある。

![microservices_diff-db](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/microservices_diff-db.png)

> - https://microservices.io/patterns/data/database-per-service.html
> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2

<br>

## 02. マイクロサービス別DBパターンの場合

### ローカルトランザクション

#### ▼ ローカルトランザクションとは

`1`個のトランザクション処理によって、`1`個のマイクロサービスのDBやスキーマ (MySQLの文脈ではスキーマがDBに相当) を操作する。

推奨される。

ダウンストリーム側マイクロサービスでのトランザクションを、イベントととして、アップストリーム側に伝える。

マイクロサービスアーキテクチャでローカルトランザクションを使用する場合、これを連続的に実行する仕組みが必要になる。

また、これらの各DBに対する各トランザクションを紐付けられるように、トランザクションにID (例：UUID) を割り当てる必要がある。

> - https://software.fujitsu.com/jp/manual/manualfiles/M090098/B1WS0321/03Z200/B0321-00-03-12-01.html
> - https://dev.to/lbelkind/does-your-microservice-deserve-its-own-database-np2

#### ▼ ローカルトランザクションの実行方式の種類

ローカルトランザクションベースのトランザクションパターンとして、Sagaパターンがある。

> - https://qiita.com/yasuabe2613/items/b0c92ab8c45d80318420#%E3%83%AD%E3%83%BC%E3%82%AB%E3%83%AB%E3%83%88%E3%83%A9%E3%83%B3%E3%82%B6%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E7%A8%AE%E9%A1%9E

<br>

### グローバルトランザクション (分散トランザクション)

#### ▼ グローバルトランザクションとは

分散トランザクションとも言う。

`1`個のトランザクション処理によって、複数のマイクロサービスのDBを操作する。

非推奨である。

> - https://thinkit.co.jp/article/14639?page=0%2C1

<br>

## 02-02. Sagaパターン

### Sagaパターンとは

各マイクロサービスに永続化とロールバックに関するAPIを実装し、ローカルトランザクションを連続的に実行する。

> - https://iorilan.medium.com/i-asked-this-system-design-question-to-3-guys-during-a-developer-interview-and-none-of-them-gave-9c23abe45687
> - https://thinkit.co.jp/article/14639?page=0%2C1
> - https://qiita.com/nk2/items/d9e9a220190549107282
> - https://qiita.com/yasuabe2613/items/b0c92ab8c45d80318420

<br>

## 02-03. オーケストレーションベースのSagaパターン

### オーケストレーションとは

Sagaパターンにて、一連のローカルトランザクションの実行をまとめて制御する責務を持ったオーケストレーターサービス (コーディネーター) を配置する。

`1`個のリクエストが送信された時に、オーケストレーションプログラムは各マイクロサービスをコールしながら処理の結果を繋いでいく。

マイクロサービスアーキテクチャのみでなく、サービス指向アーキテクチャでも使用される。

オーケストレーションが推奨である。

![orchestration](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/orchestration.png)

> - https://learn.microsoft.com/ja-jp/azure/architecture/reference-architectures/saga/saga
> - https://blogs.itmedia.co.jp/itsolutionjuku/2019/08/post_729.html
> - https://news.mynavi.jp/itsearch/article/devsoft/1598
> - https://medium.com/google-cloud-jp/gcp-saga-microservice-7c03a16a7f9d
> - https://www.fiorano.com/jp/blog/integration/integration-architecture/%E3%82%B3%E3%83%AC%E3%82%AA%E3%82%B0%E3%83%A9%E3%83%95%E3%82%A3-vs-%E3%82%AA%E3%83%BC%E3%82%B1%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3/

<br>

### マイクロサービス間通信方式別

#### ▼ リクエストリプライ方式の場合

記入中...

#### ▼ イベント駆動方式の場合

マイクロサービス間のローカルトランザクションの連携方式として、メッセージキューを使用する。

各マイクロサービスがイベントのパブリッシュとサブスクライブを実行する。

各マイクロサービスは、自身の次に実行されるマイクロサービスを知らない。

各マイクロサービスは、処理結果をオーケストレーターサービスに返却する。

![orchestration_message-queue](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/orchestration_message-queue.png)

> - https://www.12-technology.com/2021/08/dbsaga.html
> - https://qiita.com/somen440/items/a6c323695627235128e9
> - https://www.12-technology.com/2021/08/dbsaga.html

<br>

### 補償トランザクション

#### ▼ 補償トランザクションとは

ローカルトランザクションを逆順に実行し、Sagaパターンによるトランザクションの結果を元に戻す仕組みのこと。

各マイクロサービスで実装したロールバック処理のAPIを逆順でコールする。

**＊例＊**

受注に関するトランザクションが異なるマイクロサービスにまたがる例。

![saga-pattern_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/saga-pattern_example.png)

補償トランザクションによって、各ローカルトランザクションを元に戻す逆順のクエリ処理が実行される。

![saga-pattern_compensating_transaction_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/saga-pattern_compensating-transaction_example.png)

> - https://docs.microsoft.com/ja-jp/dotnet/architecture/cloud-native/distributed-data#distributed-transactions

<br>

## 02-04. Choreography (コレオグラフィ) ベースのSagaパターン

### コレオグラフィとは

Sagaパターンにて、各マイクロサービスでアップストリーム側マイクロサービスに連携する責務を持たせ、ローカルトランザクションを連続的に実行する。

`1`個のリクエストが送信された時に、マイクロサービスからマイクロサービスに処理が繋がっていく。

![choreography](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/choreography.png)

> - https://learn.microsoft.com/ja-jp/azure/architecture/reference-architectures/saga/saga
> - https://blogs.itmedia.co.jp/itsolutionjuku/2019/08/post_729.html
> - https://zenn.dev/yoshii0110/articles/74dfcf4132a805
> - https://www.fiorano.com/jp/blog/integration/integration-architecture/%E3%82%B3%E3%83%AC%E3%82%AA%E3%82%B0%E3%83%A9%E3%83%95%E3%82%A3-vs-%E3%82%AA%E3%83%BC%E3%82%B1%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3/

**＊実装例＊**

以下のリポジトリを参考にせよ。

![choreography_example](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/choreography_example.png)

> - https://github.com/fedeoliv/microservices-transactions

<br>

### マイクロサービス間通信方式別

#### ▼ リクエストリプライ方式の場合

記入中...

#### ▼ イベント駆動方式の場合

マイクロサービス間のローカルトランザクションの連携方式として、メッセージキューを使用する。

各マイクロサービスがイベントのパブリッシュとサブスクライブを実行する。

各マイクロサービスは、自身の次に実行されるマイクロサービスを知っている。

各マイクロサービスは、次のマイクロサービスにイベントを渡せる別のキューに処理結果を返却する。

![choreography_message-queue](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/choreography_message-queue.png)

> - https://www.12-technology.com/2021/08/dbsaga.html

![saga-pattern](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/saga-pattern.png)

<br>

## 03. TCCパターン

### TCCパターンとは

各マイクロサービスに各処理フェーズ (Try、Confirm、Cancel) を実行するAPIを実装し、APIを順に実行する。

Tryフェーズでは、ローカルトランザクションを開始する。

Confirmフェーズでは、ローカルトランザクションをコミットする。

Cancelフェーズでは、以前のフェーズで問題が合った場合に、ロールバックを実施する。

> - https://www.ibm.com/blogs/think/jp-ja/microservices-applications-enabled-by-ibmcloud-managed-services/
> - https://dev.to/yedf2/best-practice-for-tcc-distributed-transaction-in-go-402m
> - https://www.oracle.com/a/otn/docs/jp-dev-days-microservices.pdf#page=9

<br>

## 04. オブジェクトモデリング方式

### イベントソーシング

#### ▼ イベントソーシングとは

ビジネスの出来事をモデリングし、データとして永続化する。

現在の状態を取得する場合は、初期のデータに全ての出来事を適用する。

CQRSと相性が良い。

> - https://qiita.com/suin/items/f559e3dcde7c811ed4e1
> - https://martinfowler.com/articles/201701-event-driven.html

<br>

### ステートソーシング

#### ▼ ステートソーシングとは

ビジネスの現在の状態をモデリングし、データとして永続化する。

過去の状態は上書きされる。

> - http://masuda220.jugem.jp/?eid=435

<br>
