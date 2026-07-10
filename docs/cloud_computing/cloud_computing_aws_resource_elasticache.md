---
title: 【IT技術の知見】Amazon ElastiCache＠AWSリソース
description: Amazon ElastiCache＠AWSリソースの知見を記録しています。
---

# Amazon ElastiCache＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Amazon ElastiCacheとは

アプリケーションの代わりに、セッション、クエリキャッシュ、分散ロックなどを管理する。

Redis と Memcached がある。

> - https://qiita.com/hharu/items/c8c2954290f920f8a2f6
> - https://christina04.hatenablog.com/entry/redis-distributed-locking

<br>

## 02. Amazon ElastiCache for Redis

### Amazon ElastiCache for Redisとは

記入中...

<br>

## 02-02. セットアップ

### コンソール画面の場合

#### ▼ 設定項目と説明

| 設定項目                         | 説明                                                                                                                           | 補足                                                                                                                                                                                            |
| :------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| クラスターエンジン               | すべてのRedisノードのキャッシュエンジンを設定する。Redis通常モード、Redisクラスターモードから選択する。                          | Redisクラスターモードと同様に、Redis通常モードもクラスター構成になる。ただし、クラスターモードとはクラスターの構成方法が異なる。                                                                |
| ロケーション                     |                                                                                                                                |                                                                                                                                                                                                 |
| エンジンバージョンの互換性       | すべてのRedisノードのキャッシュエンジンのバージョンを設定する。                                                                  | マイナーバージョンが自動的に更新されないように、例えば『`6.x`』は設定しないほうがよい。                                                                                                         |
| パラメーターグループ             | すべてのRedisノードのグローバルオプションを設定する。                                                                            | デフォルトを使用せずに自前定義する場合、事前に作成しておく必要がある。                                                                                                                          |
| ノードのタイプ                   |                                                                                                                                |                                                                                                                                                                                                 |
| レプリケーション数               | プライマリーノードとは別に、リードレプリカノードをいくつ作成するかを設定する。                                                 | マルチAZにプライマリーノードとリードレプリカノードを `1` 個ずつ配置させる場合、ここでは『`1` 個』を設定する。                                                                                   |
| マルチAZ                         | プライマリーノードとリードレプリカを異なるAZに配置するか否かを設定する。合わせて、自動フェイルオーバーを実行できるようになる。 |                                                                                                                                                                                                 |
| サブネットグループ               | Redisにリクエストを送信できるサブネットを設定する。                                                                            |                                                                                                                                                                                                 |
| セキュリティ                     | セキュリティグループを設定する。                                                                                               |                                                                                                                                                                                                 |
| クラスターへのデータのインポート | あらかじめ作成しておいたバックアップをインポートし、これを元にRedisを作成する。                                                | セッションやクエリキャッシュを引き継げる。そのため、新しいRedisへのセッションデータの移行に役立つ。<br>・https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/backups-seeding-redis.html |
| バックアップ                     | バックアップの有効化、保持期間、時間を設定する。                                                                               | バックアップを取るほどでもないため、無効化しておいて問題ない。                                                                                                                                  |
| メンテナンス                     | メンテナンスの時間を設定する。                                                                                                 |                                                                                                                                                                                                 |

<br>

### Redisクラスター

#### ▼ Redisクラスターとは

複数の Redis ノードを持つ Redis シャードから構成されている。

`1` 個のリクエストを処理するグループ単位である。

![redis-cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/redis-cluster.png)

> - https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.Terms.html
> - https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.Clusters

#### ▼ クラスターモード

クラスターモードを有効化すると、Redis クラスター内に複数の Redis シャードを作成する。

反対に無効化すると、シャードは `1` 個だけ作成される。

> - https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.ReplicationGroups

<br>

### Redisシャード

#### ▼ Redisシャードとは

Redis ノードのグループであり、処理の実行単位でもある。

同じデータを保管するグループ単位であり、プライマリーノードとレプリカノードが含まれる。

同じ Redis シャード内にある Redis ノード間では、セッションやクエリキャッシュが同期される。

一方で、Amazon Aurora の DB クラスターはこれに相当する概念である。

> - https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.Shards

<br>

### Redisノード

#### ▼ Redisノードとは

セッションやクエリキャッシュを保管するインスタンスのこと。

<br>

### セッション管理機能

#### ▼ セッション管理機能とは

アプリケーションがセッション ID を管理する代わりに、セッション ID を管理する。

冗長化されたそれぞれのアプリケーションは、ユーザーのログイン後に、Amazon ElastiCache から共通のセッション ID を取得する。

![Amazon ElastiCache のセッション管理機能](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Amazon ElastiCache のセッション管理機能.png)

#### ▼ Amazon ElastiCacheを使用しない場合

アプリケーションが特にコンテナの場合、アプリでセッションデータを管理してしまうと、該当のセッションを持ったコンテナが他のコンテナにセッションデータを引き継げず、スケールイン/スケールアウトしてしまう。

一方で、Amazon ElastiCache に管理を切り分けることにより、コンテナがスケールイン/スケールアウトしても、ログイン状態を維持できるようになる。

<br>

### クエリキャッシュ管理機能

#### ▼ クエリキャッシュ管理機能とは

Amazon RDS に対する SQL と読み出されたデータを、キャッシュとして管理する。

DB 側でのクエリキャッシュはパフォーマンス上の問題から廃止になっており、DB からクエリキャッシュ機能を切り分けた Amazon ElastiCache が必要になる。

![クエリCache管理機能_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/クエリCache管理機能_1.png)

> - https://aws.amazon.com/jp/blogs/news/optimize-cost-and-boost-performance-of-rds-for-mysql-using-amazon-elasticache-for-redis/
> - https://yakst.com/ja/posts/4612

#### ▼ 仕組み

`(1)`

: アプリケーションは、Amazon RDS の前に、Redis に対して Read 処理を実行する。

```mysql
SELECT * FROM users;
```

`(2)`

: 初めて実行された SQL の場合、Redis は SQL をキーとして保管し、キャッシュがないことをアプリケーションへ返却する。

`(3)`

: アプリケーションは Amazon RDS に対して Read 処理を実行する。

`(4)`

: データが読み出される。

`(5)`

: アプリケーションは Redis にデータを登録する。

```bash
# Amazon ElastiCacheには、SQLの実行結果がまだ保管されていない

*** no cache ***
{"id"=>"1", "name"=>"alice"}
{"id"=>"2", "name"=>"bob"}
{"id"=>"3", "name"=>"charles"}
{"id"=>"4", "name"=>"donny"}
{"id"=>"5", "name"=>"elie"}
{"id"=>"6", "name"=>"fabian"}
{"id"=>"7", "name"=>"gabriel"}
{"id"=>"8", "name"=>"harold"}
{"id"=>"9", "name"=>"Ignatius"}
{"id"=>"10", "name"=>"jonny"}
```

![クエリCache管理機能_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/クエリCache管理機能_2.png)

`(6)`

: 次回、アプリケーションは、Amazon RDS の前に、Redis に対して Read 処理を実行する。

```mysql
SELECT * FROM users;
```

`(7)`

: Redis は、SQL をキーにしてデータを特定し、アプリケーションに返却する。

```bash
# Amazon ElastiCacheには、SQLの実行結果が既に保管されている

*** cache hit ***
{"id"=>"1", "name"=>"alice"}
{"id"=>"2", "name"=>"bob"}
{"id"=>"3", "name"=>"charles"}
{"id"=>"4", "name"=>"donny"}
{"id"=>"5", "name"=>"elie"}
{"id"=>"6", "name"=>"fabian"}
{"id"=>"7", "name"=>"gabriel"}
{"id"=>"8", "name"=>"harold"}
{"id"=>"9", "name"=>"Ignatius"}
{"id"=>"10", "name"=>"jonny"}
```

<br>

### 障害対策

#### ▼ Redisのフェイルオーバー

プライマリーノードで障害が起こった場合に、リードレプリカノードをプライマリーノードに自動的に昇格する。

| 障害の発生したノード | 挙動                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| プライマリーノード   | リードレプリカの `1` 個がプライマリーノードに昇格し、障害が起きたプライマリーノードと置き換わる。 |
| リードレプリカノード | 障害が起きたリードレプリカノードが、別の新しいものに置き換わる。                                  |

<br>

### Redisクラスターのダウンタイム

#### ▼ ダウンタイムの発生条件

| 変更する項目       | ダウンタイムの有無 | ダウンタイム                                 |
| ------------------ | ------------------ | -------------------------------------------- |
| エンジンバージョン | あり               | `1` 分 `30` 秒ほどのダウンタイムが発生する。 |

<br>

### 計画的なダウンタイム

#### ▼ 計画的なダウンタイムとは

Redis クラスターでは、設定値 (例：エンジンバージョン) のアップグレード時に、Redis ノードの再起動が必要である。

サイトの利用者に与える影響を小さくできるように、計画的にダウンタイムを発生させる必要がある。

#### ▼ バックアップとインポートによるダウンタイムの最小化

以下の手順で、ダウンタイムを最小限にしてアップグレードできる。

`(1)`

: Redis のセッションやクエリキャッシュを S3 にエクスポートする。

`(2)`

: 新しい Redis を作成する。このとき、インポートを使用して、セッションやクエリキャッシュを引き継いだ Redis クラスターを別途作成する。

`(3)`

: 新しく作成した Redis クラスターをアップグレードする。

`(4)`

: アプリケーションの接続先を古い Redis クラスターから新しいものに変更する。

`(5)`

: 古い Redis クラスターを削除する。

<br>
