---
title: 【IT技術の知見】Amazon RDS
description: Amazon RDS
tags:
  - "3大クラウド"
  - "AWS"
  - "AWSリソース"
  - "RDS"
---

# Amazon RDS

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 概要


AWS が提供するマネージドな RDB であり、DB エンジンとして Aurora、MySQL、MariaDB、PostgreSQL、Oracle、SQL Server、Db2 を選べる。

<br>

## 02. 仕組み

### OS の隠蔽

Amazon RDS は、EC2 内に DBMS が稼働したものであるが、このほとんどが隠蔽されている。

そのため DB サーバーのようには操作できず、OS のバージョン確認や SSH 公開鍵認証を行えない。

> - [［5］RDSのつまずきポイント、DBサーバーと思うと失敗する \| 日経クロステック（xTECH）](https://xtech.nikkei.com/it/article/COLUMN/20131108/516863/)

#### ▼ 確認方法

Linux x86_64 (AMD64) が使用されているところまでは確認できるが、Linux のバージョンは隠蔽されている。

Amazon Aurora でも確認方法は同じである。

```mysql
-- Amazon RDSの場合
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

## 03. セットアップ

### Terraformによる構築

`terraform-aws-modules/rds/aws` モジュールを使用し、既存の DB サブネットグループとセキュリティグループに DB インスタンスを配置する。

```terraform
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "7.2.2"

  identifier                  = "foo-rds"
  engine                      = "mysql"
  engine_version              = "8.0"
  family                      = "mysql8.0"
  major_engine_version        = "8.0"
  instance_class              = "db.t3.micro"
  allocated_storage           = 20
  username                    = "admin"
  manage_master_user_password = true
  db_subnet_group_name        = "foo-db-subnet-group"
  vpc_security_group_ids      = ["sg-0123456789abcdef0"]
  skip_final_snapshot         = true
}
```

> - [terraform-aws-modules/rds/aws - Terraform Registry](https://registry.terraform.io/modules/terraform-aws-modules/rds/aws/7.2.2)

<br>

## 04. DB エンジンの選択

### DBMS に対応する RDB

<table>
  <thead>
    <tr>
      <th>DBMS</th>
      <th>RDB</th>
      <th>互換性</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Amazon Aurora MySQL</td>
      <td>Amazon RDS</td>
      <td>MySQL/PostgreSQL</td>
    </tr>
    <tr>
      <td>MariaDB</td>
      <td>Amazon RDS</td>
      <td>MariaDB</td>
    </tr>
    <tr>
      <td>MySQL</td>
      <td>Amazon RDS</td>
      <td>MySQL</td>
    </tr>
    <tr>
      <td>PostgreSQL</td>
      <td>Amazon RDS</td>
      <td>PostgreSQL</td>
    </tr>
  </tbody>
</table>

### 機能の違い

RDB が Amazon Aurora か Amazon RDS かで機能に差があり、Amazon Aurora のほうが耐障害性や可用性が高い。

ただし、その分費用が高いことに注意する。

> - https://www.ragate.co.jp/blog/articles/10234

<br>

## 05. メンテナンスウインドウ

DB クラスターや DB インスタンスのメンテナンスや、適用を保留した設定変更の時間帯を指定する。

> - [Amazon RDS メンテナンスのよくある問い合わせを紹介してみる \| DevelopersIO](https://dev.classmethod.jp/articles/amazon-rds-maintenance-questions/)

<br>

### メンテナンスの適切な曜日/時間帯

Amazon CloudWatch Metrics の `DatabaseConnections` メトリクスから、DB の接続数が低くなる時間帯を調査し、その時間帯にメンテナンスウィンドウを設定する。

また、メンテナンスウィンドウの実施曜日が週末であると、サイトが停止したまま休日を迎える可能性があるため、週末以外になるように設定する (メンテナンスウィンドウが UTC であることに注意) 。

<br>

### 『保留中の変更』『保留中のメンテナンス』

![rds_pending-maintenance](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloud_computing/rds_pending-maintenance.png)

ユーザーが適用を保留した設定変更は『保留中の変更』、AWS が提示するハードウェア・OS・DB エンジンなどの更新は『保留中のメンテナンス』として扱われる。

保留中のメンテナンスは、次回のメンテナンスウィンドウでの適用や、即時適用を指定できる。適用期限がある更新は、その期限を超えて延期できない。

> - [Maintaining a DB instance - Amazon Relational Database Service](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.Maintenance.html)

次の画像は、保留中のメンテナンスに対して適用タイミングを指定する画面の例である。

![rds_pending-maintenance_action](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloud_computing/rds_pending-maintenance_action.png)

> - [【速報】Amazon RDS：メンテナンスへの柔軟な対応が可能に（pending-maintenance） \| DevelopersIO](https://dev.classmethod.jp/articles/rds-pending-maintenance-actions/)

<br>

### 保留中のメンテナンスの状態

<table>
  <thead>
    <tr>
      <th>状態</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>必須</td>
      <td>アクションは実行可能かつ必須である。実行タイミングは未定であるが、適用期限日には必ず実行され、これは延期できない。</td>
    </tr>
    <tr>
      <td>利用可能</td>
      <td>アクションは実行できるが、推奨である。実行タイミングは未定である。</td>
    </tr>
    <tr>
      <td>次のウィンドウ</td>
      <td>アクションの実行タイミングは、次回のメンテナンスウィンドウである。あとでアップグレードを選択することにより、『利用可能』の状態に戻すことも可能。</td>
    </tr>
    <tr>
      <td>進行中</td>
      <td>現在時刻がメンテナンスウィンドウに含まれており、アクションを実行中である。</td>
    </tr>
  </tbody>
</table>

<br>

### 『次のウィンドウ』状態の取り消し

次回のメンテナンスウィンドウで適用する予約は、処理の開始前であれば、AWS CLI の `undo-opt-in` で取り消せる。

この操作は適用予約を取り消すものであり、必須のメンテナンス自体や適用期限をなくすものではない。

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

> - [いつ来るの？Amazon Relational Database Service (RDS)/Amazon Auroraの「保留中のメンテナンス」の「next window」について \| DevelopersIO](https://dev.classmethod.jp/articles/mean-of-next-window-in-pending-maintenance-and-set-maintenance-schedule/)

<br>

### 『保留中の変更』の取り消し

保留中の設定変更は、変更前の値を再指定して戻す。

`--apply-immediately` は他の保留中の変更も即時適用する場合があるため、実行前に保留内容を確認する。

```bash
$ aws rds modify-db-instance \
    --db-instance-identifier prd-foo-instance \
    <変更前の設定項目> <変更前の設定値> \
    --apply-immediately
```

> - [Modifying an Amazon RDS DB instance - Amazon Relational Database Service](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.DBInstance.Modifying.html#USER_ModifyInstance.ApplyImmediately)
> - [RDSのインスタンス変更をキャンセルする #AWS - Qiita](https://qiita.com/tinoji/items/e150ffdc2045e8b85a56)

<br>

## 06. 設定変更によるダウンタイム

### ダウンタイムの発生条件

<table>
  <thead>
    <tr>
      <th>変更する項目</th>
      <th>ダウンタイムの有無</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>インスタンスクラス</td>
      <td>あり</td>
      <td>・<code>2</code> 個のインスタンスで同時にインスタンスクラスを変更すると、次のようなイベントを確認できる。インスタンスが複数回再起動することからわかるとおり、長いダウンタイム (約 <code>6</code>～<code>8</code> 分) が発生する。そのため、フェイルオーバーを利用してダウンタイムを最小化する。<br>・<a href="https://dev.classmethod.jp/articles/rds-scaleup-instancetype/">https://dev.classmethod.jp/articles/rds-scaleup-instancetype/</a> <br>・プライマリーインスタンスのイベント<br><img src="https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloud_computing/rds_change-instance-class_primary-instance.png" alt="rds_change-instance-class_primary-instance"><br>・リードレプリカのイベント<br><img src="https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloud_computing/rds_change-instance-class_read-replica.png" alt="rds_change-instance-class_read-replica"></td>
    </tr>
    <tr>
      <td>サブネットグループ</td>
      <td>あり</td>
      <td></td>
    </tr>
    <tr>
      <td>メンテナンスウィンドウ</td>
      <td>条件付きでなし</td>
      <td>ダウンタイムが発生する操作が保留中になっている状態で、メンテナンス時間を現在が含まれるように変更すると、保留中の操作がすぐに適用される。そのため、ダウンタイムが発生する。</td>
    </tr>
    <tr>
      <td>パフォーマンスインサイト</td>
      <td>条件付きでなし</td>
      <td>パフォーマンスインサイトの有効化ではダウンタイムが発生しない。ただし、有効化のためにパラメーターグループの <code>performance_schema</code> を有効化する必要がある。パラメーターグループの変更を DB インスタンスに反映させるうえで再起動が必要なため、ここでダウンタイムが発生する。</td>
    </tr>
    <tr>
      <td>バックアップウインドウ</td>
      <td>条件付きでなし</td>
      <td><code>0</code> から <code>0</code> 以外の値、<code>0</code> 以外の値から <code>0</code> に変更した場合、ダウンタイムが発生する。</td>
    </tr>
    <tr>
      <td>パラメーターグループ</td>
      <td>再起動が必要な場合はあり</td>
      <td>動的パラメーターは通常、再起動せずに適用できる。静的パラメーターの適用や新しいパラメーターグループへの切り替えには再起動が必要になり、その間はダウンタイムが発生する。<br><a href="https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/parameter-groups-overview.html">https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/parameter-groups-overview.html</a></td>
    </tr>
    <tr>
      <td>セキュリティグループ</td>
      <td>なし</td>
      <td></td>
    </tr>
    <tr>
      <td>マイナーバージョン自動アップグレード</td>
      <td>なし</td>
      <td>エンジンバージョンの変更にはダウンタイムが発生するが、自動アップグレードの設定にはダウンタイムが発生しない。</td>
    </tr>
    <tr>
      <td>ストレージの AutoScaling</td>
      <td>なし</td>
      <td></td>
    </tr>
  </tbody>
</table>

> - [Modifying an Amazon RDS DB instance - Amazon Relational Database Service](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.DBInstance.Modifying.html#USER_ModifyInstance.Settings)

<br>

## 07. フェイルオーバー

### Amazon RDS のフェイルオーバーとは

スタンバイレプリカがプライマリーインスタンスに昇格する。

- [Configuring and managing a Multi-AZ deployment for Amazon RDS - Amazon Relational Database Service](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html)

<br>

### フェイルオーバーによるダウンタイムの最小化

DB インスタンスがマルチ AZ 構成の場合、以下の手順を使用してダウンタイムを最小化できる。

> - https://lab.taf-jp.com/rds%E3%81%AE%E3%83%95%E3%82%A7%E3%82%A4%E3%83%AB%E3%82%AA%E3%83%BC%E3%83%90%E3%83%BC%E6%99%82%E3%81%AE%E6%8C%99%E5%8B%95%E3%82%92%E7%90%86%E8%A7%A3%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B/

1. アプリケーションの接続先をプライマリーインスタンスにする。

2. 特定の条件下のみで、フェイルオーバーが自動的に実行される。

> - [Configuring and managing a Multi-AZ deployment for Amazon RDS - Amazon Relational Database Service](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html#Concepts.MultiAZ.Failover)

(3) Amazon RDS の Amazon RDS では条件に当てはまらない場合、リードレプリカを手動でフェイルオーバーさせる。

> - [Upgrades of the RDS for MySQL DB engine - Amazon Relational Database Service](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.MySQL.html#USER_UpgradeDBInstance.MySQL.ReducedDowntime)

(4) フェイルオーバー時に約 `1`～`2` 分のダウンタイムが発生する。

フェイルオーバーを使用しない場合、DB インスタンスの再起動でダウンタイムが発生するが、これよりは時間が短いため、相対的にダウンタイムを短縮できる。

<br>

## 08. イベント通知

イベントメッセージは、AWS の英語リファレンスと照合して内容を確認する。

> - [Amazon RDS event categories and event messages - Amazon Relational Database Service](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Events.Messages.html)

<br>

## 09. DB 接続のプロキシ

### Amazon RDS プロキシとは

クラウド DB プロキシとして働く。

<br>

### 接続プールの管理

アプリから Amazon RDS にクエリが送信されたとき、接続を新しく作成せずに、接続プール内の非アクティブな接続を再利用し、Amazon RDS にフォワーディングする。

アプリから DB のインスタンスに直接的にクエリを送信する場合、アプリケーションは Amazon RDS の同時接続の上限数 (インスタンスタイプで決まる) を考慮しない。

そのため、接続数が多くなりやすいアプリ (例：AWS Lambda、マルチスレッド) を使用していると、アプリケーションが無制限に接続を新しく作成することになる。

その結果、アプリケーションの接続が Amazon RDS の同時接続の上限数を超えて接続してしまい、Amazon RDS がエラーを返却してしまう。

Amazon RDS プロキシは、Amazon RDS の同時接続の上限数を考慮しつつ、接続プールから非アクティブな接続を再利用するため、アプリケーションが Amazon RDS の同時接続の上限数を超えて接続することがない。

![aws_rds-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloud_computing/aws_rds-proxy.png)

> - [【RDS】AWSサービスしりとりリレー 第11日目 - DENET 技術ブログ](https://blog.denet.co.jp/service-relay-2021-0711/)
> - https://blog.sgnet.co.jp/2020/10/java-db.html

<br>

### ユースケース

#### ▼ AWS Lambda のデータベースに Amazon RDS を使用する場合

リクエスト駆動型アプリケーションの場合、複数のリクエストに対して単一の DB 接続を再利用できる。

一方で、イベント駆動型アプリケーションの場合、単一リクエストに対して単一の DB 接続を使用する。

Amazon RDS には DB 接続の上限数があり、前段に Amazon RDS プロキシーがないとすぐに上限数に達してしまう。

![aws_rds-proxy_lambda](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cloud_computing/aws_rds-proxy_lambda.png)

> - [Lambda+RDSはアンチパターン #AWS - Qiita](https://qiita.com/teradonburi/items/86400ea82a65699672ad)

<br>
