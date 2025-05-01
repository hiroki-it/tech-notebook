---
title: 【IT技術の知見】ElastiCache＠AWSリソース
description: ElastiCache＠AWSリソースの知見を記録しています。
---

# ElastiCache＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ElastiCacheとは

アプリケーションの代わりに、セッション、クエリキャッシュ、DB排他制御 (分散ロック) などを管理する。

RedisとMemcachedがある。

> - https://qiita.com/hharu/items/c8c2954290f920f8a2f6
> - https://christina04.hatenablog.com/entry/redis-distributed-locking

<br>

## 02. ElastiCache for Redis

### ElastiCache for Redisとは

記入中...

<br>

## 02-02. セットアップ

### コンソール画面の場合

#### ▼ 設定項目と説明

| 設定項目                         | 説明                                                                                                                           | 補足                                                                                                                                                                                            |
| :------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| クラスターエンジン               | 全てのRedisノードのキャッシュエンジンを設定する。Redis通常モード、Redisクラスターモードから選択する。                          | Redisクラスターモードと同様に、Redis通常モードもクラスター構成になる。ただし、クラスターモードとはクラスターの構成方法が異なる。                                                                |
| ロケーション                     |                                                                                                                                |                                                                                                                                                                                                 |
| エンジンバージョンの互換性       | 全てのRedisノードのキャッシュエンジンのバージョンを設定する。                                                                  | マイナーバージョンが自動的に更新されないように、例えば『`6.x`』は設定しない方が良い。                                                                                                           |
| パラメーターグループ             | 全てのRedisノードのグローバルオプションを設定する。                                                                            | デフォルトを使用せずに自前定義する場合、事前に作成しておく必要がある。                                                                                                                          |
| ノードのタイプ                   |                                                                                                                                |                                                                                                                                                                                                 |
| レプリケーション数               | プライマリーノードとは別に、リードレプリカノードをいくつ作成するかを設定する。                                                 | マルチAZにプライマリーノードとリードレプリカノードを `1`個ずつ配置させる場合、ここでは『`1`個』を設定する。                                                                                     |
| マルチAZ                         | プライマリーノードとリードレプリカを異なるAZに配置するか否かを設定する。合わせて、自動フェイルオーバーを実行できるようになる。 |                                                                                                                                                                                                 |
| サブネットグループ               | Redisにリクエストを送信できるサブネットを設定する。                                                                            |                                                                                                                                                                                                 |
| セキュリティ                     | セキュリティグループを設定する。                                                                                               |                                                                                                                                                                                                 |
| クラスターへのデータのインポート | あらかじめ作成しておいたバックアップをインポートし、これを元にRedisを作成する。                                                | セッションやクエリキャッシュを引き継げる。そのため、新しいRedisへのセッションデータの移行に役立つ。<br>・https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/backups-seeding-redis.html |
| バックアップ                     | バックアップの有効化、保持期間、時間を設定する。                                                                               | バックアップを取るほどでもないため、無効化しておいて問題ない。                                                                                                                                  |
| メンテナンス                     | メンテナンスの時間を設定する。                                                                                                 |                                                                                                                                                                                                 |

<br>

### Redisクラスター

#### ▼ Redisクラスターとは

複数のRedisノードを持つRedisシャードから構成されている。

`1`個のリクエストを処理するグループ単位である。

![redis-cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/redis-cluster.png)

> - https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.Terms.html
> - https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.Clusters

#### ▼ クラスターモード

クラスターモードを有効化すると、Redisクラスター内に複数のRedisシャードを作成する。

反対に無効化すると、シャードは `1`個だけ作成される。

> - https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.ReplicationGroups

<br>

### Redisシャード

#### ▼ Redisシャードとは

Redisノードのグループであり、処理の実行単位でもある。

同じデータを保管するグループ単位であり、プライマリーノードとレプリカノードが含まれる。

同じRedisシャード内にあるRedisノード間では、セッションやクエリキャッシュが同期される。

一方で、AWS AuroraのDBクラスターはこれに相当する概念である。

> - https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.Shards

<br>

### Redisノード

#### ▼ Redisノードとは

セッションやクエリキャッシュを保管するインスタンスのこと。

<br>

### セッション管理機能

#### ▼ セッション管理機能とは

アプリケーションがセッションIDを管理する代わりに、セッションIDを管理する。

冗長化されたそれぞれのアプリケーションは、ユーザーのログイン後に、ElastiCacheから共通のセッションIDを取得する。

![ElastiCacheのセッション管理機能](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ElastiCacheのセッション管理機能.png)

#### ▼ ElastiCacheを使用しない場合

アプリケーションが特にコンテナの場合にアプリでセッションデータを管理してしまうと、該当のセッションを持ったコンテナがセッションデータを他のコンテナに引き継げずに、スケールイン/スケールアウトしてしまう。

一方で、ElastiCacheに管理を切り分けることにより、コンテナがスケールイン/スケールアウトしても、既存のセッションデータをログイン状態を保管できるようになる。

<br>

### クエリキャッシュ管理機能

#### ▼ クエリキャッシュ管理機能とは

AWS RDSに対するSQLと読み出されたデータを、キャッシュとして管理する。

DB側でのクエリキャッシュはパフォーマンス上の問題から廃止になっており、DBからクエリキャッシュ機能を切り分けたElastiCacheが必要になる。

![クエリCache管理機能_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/クエリCache管理機能_1.png)

> - https://aws.amazon.com/jp/blogs/news/optimize-cost-and-boost-performance-of-rds-for-mysql-using-amazon-elasticache-for-redis/
> - https://yakst.com/ja/posts/4612

#### ▼ 仕組み

`(1)`

: アプリケーションは、AWS RDSの前に、Redisに対してSQLを実行する。

```sql
SELECT * FROM users;
```

`(2)`

: 始めて実行されたSQLの場合、RedisはSQLをキーとして保管し、キャッシュが無いことがアプリケーションに返却する。

`(3)`

: アプリケーションはAWS RDSに対してSQLを実行する。

`(4)`

: データが読み出される。

`(5)`

: アプリケーションはRedisにデータを登録する。

```bash
# ElastiCacheには、SQLの実行結果がまだ保管されていない

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

: 次回、アプリケーションは、AWS RDSの前に、Redisに対してSQLを実行する。

```sql
SELECT * FROM users;
```

`(7)`

: Redisは、SQLをキーにしてデータを特定し、アプリケーションに返却する。

```bash
# ElastiCacheには、SQLの実行結果が既に保管されている

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

| 障害の発生したノード | 挙動                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| プライマリーノード   | リードレプリカの `1`個がプライマリーノードに昇格し、障害が起きたプライマリーノードと置き換わる。 |
| リードレプリカノード | 障害が起きたリードレプリカノードが、別の新しいものに置き換わる。                                 |

<br>

### Redisクラスターのダウンタイム

#### ▼ ダウンタイムの発生条件

| 変更する項目       | ダウンタイムの有無 | ダウンタイム                               |
| ------------------ | ------------------ | ------------------------------------------ |
| エンジンバージョン | あり               | `1`分 `30`秒ほどのダウンタイムが発生する。 |

<br>

### 計画的なダウンタイム

#### ▼ 計画的なダウンタイムとは

Redisクラスターでは、設定値 (例：エンジンバージョン) のアップグレード時に、Redisノードの再起動が必要である。

サイトの利用者に与える影響を小さくできるように、計画的にダウンタイムを発生させる必要がある。

#### ▼ バックアップとインポートによるダウンタイムの最小化

以下の手順で、ダウンタイムを最小限にしてアップグレードできる。

`(1)`

: RedisのセッションやクエリキャッシュをS3にエクスポートする。

`(2)`

: 新しいRedisを作成する。この時、インポートを使用して、セッションやクエリキャッシュを引き継いだRedisクラスターを別途作成する。

`(3)`

: 新しく作成したRedisクラスターをアップグレードする。

`(4)`

: アプリケーションの接続先を古いRedisクラスターから新しいものに変更する。

`(5)`

: 古いRedisクラスターを削除する。

<br>
