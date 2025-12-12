---
title: 【IT技術の知見】AWS RDS＠AWSリソース
description: AWS RDS＠AWSリソース
---

# AWS RDS＠AWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS RDSとは

記入中...

<br>

## 02. セットアップ (コンソールの場合)

## 2-02. セットアップ (Terraformの場合)

```terraform
# 記入中...
```

### 他のDBエンジンの比較

#### ▼ DBMSに対応するRDB

| DBMS             | RDB     | 互換性           |
| ---------------- | ------- | ---------------- |
| AWS Aurora MySQL | AWS RDS | MySQL/PostgreSQL |
| MariaDB          | AWS RDS | MariaDB          |
| MySQL            | AWS RDS | MySQL            |
| PostgreSQL       | AWS RDS | PostgreSQL       |

#### ▼ 機能の違い

RDBがAWS AuroraかAWS RDSかで機能に差があり、AWS Auroraの方が耐障害性や可用性が高い。

ただし、その分費用が高いことに注意する。

> - https://www.ragate.co.jp/blog/articles/10234

<br>

### OSの隠蔽

#### ▼ OSの隠蔽とは

AWS RDSは、EC2内にDBMSが稼働したものであるが、このほとんどが隠蔽されている。

そのためDBサーバーのようには操作できず、OSのバージョン確認やSSH公開鍵認証を行えない。

> - https://xtech.nikkei.com/it/article/COLUMN/20131108/516863/

#### ▼ 確認方法

Linux x86_64 (AMD64) が使用されているところまでは確認できるが、Linuxのバージョンは隠蔽されている。

AWS Auroraでも確認方法は同じである。

```mysql
-- AWS RDSの場合
SHOW VARIABLES LIKE '%version%';

+-------------------------+------------------------------+
| Variable_name           | Value                        |
+-------------------------+------------------------------+
| innodb_version          | 5.7.0                        |
| protocol_version        | 10                           |
| slave_type_conversions  |                              |
| tls_version             | TLSv1,TLSv1.1,TLSv1.2        |
| version                 | 5.7.0-log                    |
| version_comment         | Source distribution          |
| version_compile_machine | x86_64                       |
| version_compile_os      | Linux                        |
+-------------------------+------------------------------+
```

<br>

## 04. メンテナンスウインドウ

### メンテナンスウインドウ

DBクラスター/DBインスタンスの設定の変更をスケジューリングさせる。

> - https://dev.classmethod.jp/articles/amazon-rds-maintenance-questions/

<br>

### メンテナンスの適切な曜日/時間帯

AWS CloudWatch Metricsの`DatabaseConnections`メトリクスから、DBの接続数が低くなる時間帯を調査し、その時間帯にメンテナンスウィンドウを設定する。

また、メンテナンスウィンドウの実施曜日が週末であると、サイトが停止したまま休日を迎える可能性があるため、週末以外になるように設定する (メンテナンスウィンドウがUTCであることに注意) 。

<br>

### 『保留中の変更』『保留中のメンテナンス』

![rds_pending-maintenance](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/rds_pending-maintenance.png)

ユーザーが予定した設定変更は『保留中の変更』として表示される一方で、AWSによって定期的に行われるハードウェア/OS/DBエンジンのバージョンを強制アップグレードは『保留中のメンテナンス』として表示される。

『次のメンテナンスウィンドウ』を選択すれば実行タイミングをメンテナンスウィンドウの間設定できるが、これを行わない場合は『日付の適用』に表示された時間帯に強制実行される。

> - https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.Maintenance.html

補足として保留中のメンテナンスは、アクションの『今すぐアップグレード』と『次のウィンドウでアップグレード』からも操作できる。

![rds_pending-maintenance_action](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/rds_pending-maintenance_action.png)

> - https://dev.classmethod.jp/articles/rds-pending-maintenance-actions/

<br>

### 保留中のメンテナンスの状態

| 状態           | 説明                                                                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 必須           | アクションは実行可能かつ必須である。実行タイミングは未定であるが、適用期限日には必ず実行され、これは延期できない。                             |
| 利用可能       | アクションは実行できるが、推奨である。実行タイミングは未定である。                                                                             |
| 次のウィンドウ | アクションの実行タイミングは、次回のメンテナンスウィンドウである。後でアップグレードを選択することにより、『利用可能』の状態に戻すことも可能。 |
| 進行中         | 現在時刻がメンテナンスウィンドウに含まれており、アクションを実行中である。                                                                     |

<br>

### 『次のウィンドウ』状態の取り消し

設定の変更が『次のウィンドウ』状態にある場合、画面上からは『必須』や『利用可能』といった実行タイミングが未定の状態に戻せない。

しかし、CLIを使用すると戻せる。

```bash
$ aws rds describe-pending-maintenance-actions --output=table

-----------------------------------------------------------------------------------
|                        DescribePendingMaintenanceActions                        |
+---------------------------------------------------------------------------------+
||                           PendingMaintenanceActions                           ||
|+---------------------+---------------------------------------------------------+|
||  ResourceIdentifier |  arn:aws:rds:ap-northeast-1:<AWSアカウントID>:db:prd-foo-instance   ||
|+---------------------+---------------------------------------------------------+|
|||                       PendingMaintenanceActionDetails                       |||
||+--------------------------+--------------------------------------------------+||
|||  Action                  |  system-update # 予定されたアクション                |||
|||  AutoAppliedAfterDate    |  2022-01-31T00:00:00+00:00                       |||
|||  CurrentApplyDate        |  2022-01-31T00:00:00+00:00                       |||
|||  Description             |  New Operating System update is available        |||
|||  ForcedApplyDate         |  2022-03-30T00:00:00+00:00                       |||
||+--------------------------+--------------------------------------------------+||
||                           PendingMaintenanceActions                           ||
|+---------------------+---------------------------------------------------------+|
||  ResourceIdentifier |  arn:aws:rds:ap-northeast-1:<AWSアカウントID>:db:prd-bar-instance   ||
|+---------------------+---------------------------------------------------------+|
|||                       PendingMaintenanceActionDetails                       |||
||+--------------------------+--------------------------------------------------+||
|||  Action                  |  system-update                                   |||
|||  AutoAppliedAfterDate    |  2022-01-31T00:00:00+00:00                       |||
|||  CurrentApplyDate        |  2022-01-31T00:00:00+00:00                       |||
|||  Description             |  New Operating System update is available        |||
|||  ForcedApplyDate         |  2022-03-30T00:00:00+00:00                       |||
||+--------------------------+--------------------------------------------------+||
```

```bash
$ aws rds apply-pending-maintenance-action \
  --resource-identifier arn:aws:rds:ap-northeast-1:<AWSアカウントID>:db:prd-foo-instance \
  --opt-in-type undo-opt-in \
  --apply-action <取り消したいアクション名>
```

> - https://dev.classmethod.jp/articles/mean-of-next-window-in-pending-maintenance-and-set-maintenance-schedule/

<br>

### 『保留中の変更』の取り消し

保留中の変更を画面上からは取り消せない。

しかし、CLIを使用すると戻せる。

```bash
$ aws rds modify-db-instance \
    --db-instance-identifier prd-foo-instance \
    <変更前の設定項目> <変更前の設定値> \
    --apply-immediately
```

> - https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.DBInstance.Modifying.html#USER_ModifyInstance.ApplyImmediately
> - https://qiita.com/tinoji/items/e150ffdc2045e8b85a56

<br>

## 05. ダウンタイム

### ダウンタイムの発生条件

| 変更する項目                         | ダウンタイムの有無 | 補足                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| インスタンスクラス                   | あり               | ・`2`個のインスタンスで同時にインスタンスクラスを変更すると、次のようなイベントを確認できる。インスタンスが複数回再起動することからわかる通り、長いダウンタイム (約`6`～`8`分) が発生する。そのため、フェイルオーバーを利用したダウンタイムの最小化を行う。<br>・https://dev.classmethod.jp/articles/rds-scaleup-instancetype/ <br>・プライマリーインスタンスのイベント<br>![rds_change-instance-class_primary-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/rds_change-instance-class_primary-instance.png)<br>・リードレプリカのイベント<br>![rds_change-instance-class_read-replica](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/rds_change-instance-class_read-replica.png) |
| サブネットグループ                   | あり               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| メンテナンスウィンドウ               | 条件付きでなし     | ダウンタイムが発生する操作が保留中になっている状態で、メンテナンス時間を現在が含まれるように変更すると、保留中の操作がすぐに適用される。そのため、ダウンタイムが発生する。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| パフォーマンスインサイト             | 条件付きでなし     | パフォーマンスインサイトの有効化ではダウンタイムが発生しない。ただし、有効化のためにパラメーターグループの`performance_schema`を有効化する必要がある。パラメーターグループの変更をDBインスタンスに反映させる上で再起動が必要なため、ここでダウンタイムが発生する。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| バックアップウインドウ               | 条件付きでなし     | `0`から`0`以外の値、`0`以外の値から`0`に変更した場合、ダウンタイムが発生する。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| パラメーターグループ                 | なし               | パラメーターグループ自体の変更ではダウンタイムは発生しない。また、静的パラメーターはパラメーターグループの変更に合わせて適用される。ただし、動的パラメーターを変更した場合は、これをDBインスタンスに反映させるために再起動が必要であり、ここでダウンタイムが発生する。<br>https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithParamGroups.html                                                                                                                                                                                                                                                                                                                                                                                             |
| セキュリティグループ                 | なし               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| マイナーバージョン自動アップグレード | なし               | エンジンバージョンの変更にはダウンタイムが発生するが、自動アップグレードの設定にはダウンタイムが発生しない。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ストレージのAutoScaling              | なし               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

> - https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.DBInstance.Modifying.html#USER_ModifyInstance.Settings

<br>

## 06. フェイルオーバー

### AWS RDSのフェイルオーバーとは

スタンバイレプリカがプライマリーインスタンスに昇格する。

- https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html

<br>

### フェイルオーバーによるダウンタイムの最小化

DBインスタンスがマルチAZ構成の場合、以下の手順を使用してダウンタイムを最小化できる。

> - https://lab.taf-jp.com/rds%E3%81%AE%E3%83%95%E3%82%A7%E3%82%A4%E3%83%AB%E3%82%AA%E3%83%BC%E3%83%90%E3%83%BC%E6%99%82%E3%81%AE%E6%8C%99%E5%8B%95%E3%82%92%E7%90%86%E8%A7%A3%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B/

`(1)`

: アプリケーションの接続先をプライマリーインスタンスにする。

`(2)`

: 特定の条件下のみで、フェイルオーバーが自動的に実行される。

> - https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html#Concepts.MultiAZ.Failover

(3) AWS RDSのAWS RDSでは条件に当てはまらない場合、リードレプリカを手動でフェイルオーバーさせる。

> - https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.MySQL.html#USER_UpgradeDBInstance.MySQL.ReducedDowntime

(4) フェイルオーバー時に約`1`～`2`分のダウンタイムが発生する。

フェイルオーバーを使用しない場合、DBインスタンスの再起動でダウンタイムが発生するが、これよりは時間が短いため、相対的にダウンタイムを短縮できる。

<br>

## 07. イベント

コンソール画面ではイベントが英語で表示されているため、リファレンスも英語でイベントを探した方が良い。

> - https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Events.Messages.html

<br>

## 08. AWS RDSプロキシ

### AWS RDSプロキシとは

クラウドDBプロキシとして働く。

<br>

### 接続プールの管理

アプリからAWS RDSにクエリが送信された時、接続を新しく作成せずに、接続プール内の非アクティブな接続を再利用し、AWS RDSにフォワーディングする。

アプリからDBのインスタンスに直接的にクエリを送信する場合、アプリケーションはAWS RDSの同時接続の上限数 (インスタンスタイプで決まる) を考慮しない。

そのため、接続数が多くなりやすいアプリ (例：AWS Lambda、マルチスレッド) を使用していると、アプリケーションが無制限に接続を新しく作成することになる。

その結果、アプリケーションの接続がAWS RDSの同時接続の上限数を超えて接続してしまい、AWS RDSがエラーを返却してしまう。

AWS RDSプロキシは、AWS RDSの同時接続の上限数を考慮しつつ、接続プールから非アクティブな接続を再利用するため、アプリケーションがAWS RDSの同時接続の上限数を超えて接続することがない。

![aws_rds-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_rds-proxy.png)

> - https://blog.denet.co.jp/service-relay-2021-0711/
> - https://blog.sgnet.co.jp/2020/10/java-db.html

<br>

### ユースケース

#### ▼ AWS LambdaのデータベースにAWS RDSを使用する場合

リクエスト駆動型アプリケーションの場合、複数のリクエストに対して単一のDB接続を再利用できる。

一方で、イベント駆動型アプリケーションの場合、単一リクエストに対して単一のDB接続を使用する。

AWS RDSにはDB接続の上限数があり、前段にAWS RDSプロキシーがないとすぐに上限数に達してしまう。

![aws_rds-proxy_lambda](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_rds-proxy_lambda.png)

> - https://qiita.com/teradonburi/items/86400ea82a65699672ad

<br>
