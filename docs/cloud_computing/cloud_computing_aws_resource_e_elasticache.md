---
title: 【IT技術の知見】ElastiCache＠Eで始まるAWSリソース
description: ElastiCache＠Eで始まるAWSリソースの知見を記録しています。
---

# ElastiCache＠```E```で始まるAWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>


## 01. ElastiCacheとは

アプリケーションの代わりとして、セッション、クエリキャッシュ、を管理する。

RedisとMemcachedがある。



<br>

## 02. ElastiCache for Redis

### セットアップ

#### ▼ コンソール画面

| 設定項目         | 説明                                                                        | 補足                                                                                                                                                          |
|------------------|-----------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| クラスターエンジン        | 全てのRedisノードのキャッシュエンジンを設定する。Redis通常モード、Redisクラスターモードから選択する。           | Redisクラスターモードと同様に、Redis通常モードもクラスター構成になる。ただし、クラスターモードとはクラスターの構成方法が異なる。                                                                              |
| ロケーション           |                                                                             |                                                                                                                                                               |
| エンジンバージョンの互換性 | 全てのRedisノードのキャッシュエンジンのバージョンを設定する。                                        | マイナーバージョンが自動的に更新されないように、例えば『```6.x```』は設定しない方が良い。                                                                                                   |
| パラメーターグループ       | 全てのRedisノードのグローバルパラメーターを設定する。                                            | デフォルトを使用せずに独自定義する場合、事前に作成しておく必要がある。                                                                                                             |
| ノードのタイプ          |                                                                             |                                                                                                                                                               |
| レプリケーション数       | プライマリーノードとは別に、リードレプリカノードをいくつ作成するかを設定する。                                | マルチAZにプライマリーノードとリードレプリカノードを```1```個ずつ配置させる場合、ここでは『```1```個』を設定する。                                                                                            |
| マルチAZ            | プライマリーノードとリードレプリカを異なるAZに配置するか否かを設定する。合わせて、自動フェイルオーバーを実行できるようになる。 |                                                                                                                                                               |
| サブネットグループ        | Redisにアクセスできるサブネットを設定する。                                                  |                                                                                                                                                               |
| セキュリティ           | セキュリティグループを設定する。                                                          |                                                                                                                                                               |
| クラスターへのデータのインポート | あらかじめ作成しておいたバックアップをインポートし、これを元にRedisを作成する。                             | セッションやクエリキャッシュを引き継げる。そのため、新しいRedisへのセッションデータの移行に役立つ。<br>ℹ️ 参考：https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/backups-seeding-redis.html |
| バックアップ           | バックアップの有効化、保持期間、時間を設定する。                                         | バックアップを取るほどでもないため、無効化しておいて問題ない。                                                                                                                         |
| メンテナンス           | メンテナンスの時間を設定する。                                                         |                                                                                                                                                               |

<br>

### Redisクラスター

#### ▼ Redisクラスターとは

![redis-cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/redis-cluster.png)

複数のRedisノードを持つRedisシャードから構成されている。

```1```個のリクエストを処理するグループ単位である。



> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.Terms.html

> - https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.Clusters

#### ▼ クラスターモード

クラスターモードを有効にすると、Redisクラスター内に複数のRedisシャードが作成される。

反対に無効化すると、シャードは```1```個だけ作成される。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.ReplicationGroups

<br>

### Redisシャード

#### ▼ Redisシャードとは

Redisノードのグループ。

同じデータを保持するグループ単位であり、プライマリーノードとレプリカノードが含まれる。

同じRedisシャード内にあるRedisノード間では、セッションやクエリキャッシュが同期される。

一方で、AuroraのDBクラスターはこれに相当する概念である。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.Components.html#WhatIs.Components.Shards

<br>

### Redisノード

#### ▼ Redisノードとは

セッションやクエリキャッシュを保持するインスタンスのこと。



<br>

### セッション管理機能

#### ▼ セッション管理機能とは

サーバー内のセッションデータの代わりにセッションIDを管理し、冗長化されたアプリケーション間で共通のセッションIDを使用できるようにする。

そのため、リリース後に既存のセッションが破棄されることがなくなり、ログイン状態を保持できるようになる。

セッションIDについては、以下のリンクを参考にせよ。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_collaboration_api_restful.html

![ElastiCacheのセッション管理機能](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ElastiCacheのセッション管理機能.png)

<br>

### クエリキャッシュ管理機能

#### ▼ クエリキャッシュ管理機能とは

RDSに対するSQLと読み出されたデータを、キャッシュとして管理する。



![クエリCache管理機能_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クエリCache管理機能_1.png)

（１）アプリケーションは、RDSの前に、Redisに対してSQLを実行する。

```sql
SELECT * FROM users;
```

（２）始めて実行されたSQLの場合、RedisはSQLをキーとして保存し、キャッシュが無いことがアプリケーションに返却する。

（３）アプリケーションはRDSに対してSQLを実行する。

（４）データが読み出される。

（５）アプリケーションはRedisにデータを登録する。

```bash
# ElastiCacheには、SQLの実行結果がまだ保存されていない

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

![クエリCache管理機能_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クエリCache管理機能_2.png)

（６）次回、アプリケーションは、RDSの前に、Redisに対してSQLを実行する。

```sql
SELECT * FROM users;
```

（７）Redisは、SQLをキーにしてデータを特定し、アプリケーションに返却する。

```bash
# ElastiCacheには、SQLの実行結果が既に保存されている

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

#### ▼ クエリキャッシュの操作

```bash
# Redis接続コマンド
$ /usr/local/sbin/redis-stable/src/redis-cli \
    -c \
    -h <Redisのホスト名> \
    -p 6379
```

```bash
# Redis接続中の状態
# 全てのキーを表示
redis *****:6379> keys *
```

```bash
# Redis接続中の状態
# キーを指定して、対応する値を表示
redis *****:6379> type <キー名>
```

```bash
# Redis接続中の状態
# Redisが受け取ったコマンドをフォアグラウンドで表示
redis *****:6379> monitor
```

<br>

### 障害対策

#### ▼ Redisのフェイルオーバー

プライマリーノードで障害が起こった場合に、リードレプリカノードをプライマリーノードに自動的に昇格する。



| 障害の発生したノード | 挙動                                                   |
|----------------|------------------------------------------------------|
| プライマリーノード      | リードレプリカの```1```個がプライマリーノードに昇格し、障害が起きたプライマリーノードと置き換わる。 |
| リードレプリカノード     | 障害が起きたリードレプリカノードが、別の新しいものに置き換わる。                |

<br>

### Redisクラスターのダウンタイム

#### ▼ ダウンタイムの発生条件

| 変更する項目 | ダウンタイムの有無 | ダウンタイム                               |
|------------|-------------|--------------------------------------|
| エンジンバージョン  | あり          | ```1```分```30```秒ほどのダウンタイムが発生する。 |

<br>

### 計画的なダウンタイム

#### ▼ 計画的なダウンタイムとは

Redisクラスターでは、設定値（例：エンジンバージョン）のアップグレード時に、Redisノードの再起動が必要である。

サイトの利用者に与える影響を小さくできるように、計画的にダウンタイムを発生させる必要がある。



#### ▼ バックアップとインポートによるダウンタイムの最小化

以下の手順で、ダウンタイムを最小限にしてアップグレードできる。



（１）RedisのセッションやクエリキャッシュをS3にエクスポートする。

（２）新しいRedisを作成する。この時、インポートを使用して、セッションやクエリキャッシュを引き継いだRedisクラスターを別途作成する。

（３）新しく作成したRedisクラスターをアップグレードする。

（４）アプリケーションの接続先を古いRedisクラスターから新しいものに変更する。

（５）古いRedisクラスターを削除する。

<br>
