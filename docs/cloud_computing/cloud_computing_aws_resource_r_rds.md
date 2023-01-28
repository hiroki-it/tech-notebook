---
title: 【IT技術の知見】RDS＠Rで始まるAWSリソース
description: RDS＠Rで始まるAWSリソース
---

# RDS＠```R```で始まるAWSリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>


## 01. RDS：Relational Database Service

### セットアップ

#### ▼ DBエンジン

| 設定項目  | 説明                                                | 補足                                                                |
|-----------|---------------------------------------------------|---------------------------------------------------------------------|
| エンジンタイプ   | ミドルウェアのDBMSの種類を設定する。                            |                                                                     |
| エディション    | エンジンバージョンでAuroraを選択した場合の互換性を設定する。          |                                                                     |
| エンジンバージョン | DBエンジンのバージョンを設定する。DBクラスター内の全てのDBインスタンスに適用される。 | ・Auroraであれば、```SELECT AURORA_VERSION()```を使用して、エンジンバージョンを確認できる。 |

<br>

### Auroraと非Aurora

#### ▼ DBMSに対応するRDB

| DBMS       | RDB | 互換性           |
|------------|-----|------------------|
| Aurora     | RDS | MySQL/PostgreSQL |
| MariaDB    | RDS | MariaDB          |
| MySQL      | RDS | MySQL            |
| PostgreSQL | RDS | PostgreSQL       |

#### ▼ 機能の違い

RDBがAuroraか非Auroraかで機能に差があり、Auroraの方が耐障害性や可用性が高い。

ただし、その分費用が高いことに注意する。



> ℹ️ 参考：https://www.ragate.co.jp/blog/articles/10234

<br>

### OSの隠蔽

#### ▼ OSの隠蔽とは

RDSは、EC2内にDBMSが稼働したものであるが、このほとんどが隠蔽されている。

そのためdbサーバーのようには操作できず、OSのバージョン確認やSSH公開鍵認証を行えない。



> ℹ️ 参考：https://xtech.nikkei.com/it/article/COLUMN/20131108/516863/

#### ▼ 確認方法

Linux x86_64が使用されているところまでは確認できるが、Linuxのバージョンは隠蔽されている。



```sql
-- Auroraの場合
SHOW variables LIKE '%version%';

+-------------------------+------------------------------+
| Variable_name           | Value                        |
+-------------------------+------------------------------+
| aurora_version          | 2.09.0                       |
| innodb_version          | 5.7.0                        |
| protocol_version        | 10                           |
| slave_type_conversions  |                              |
| tls_version             | TLSv1,TLSv1.1,TLSv1.2        |
| version                 | 5.7.12-log                   |
| version_comment         | MySQL Community Server (GPL) |
| version_compile_machine | x86_64                       |
| version_compile_os      | Linux                        |
+-------------------------+------------------------------+
```

```sql
-- 非Auroraの場合
SHOW variables LIKE '%version%';

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

### メンテナンスウインドウ

#### ▼ メンテナンスウインドウ

DBクラスター/DBインスタンスの設定の変更をスケジューリングする。



> ℹ️ 参考：https://dev.classmethod.jp/articles/amazon-rds-maintenance-questions/

#### ▼ メンテナンスの適切な曜日/時間帯

CloudWatchメトリクスの```DatabaseConnections```メトリクスから、DBの接続数が低くなる時間帯を調査し、その時間帯にメンテナンスウィンドウを設定する。

また、メンテナンスウィンドウの実施曜日が週末であると、サイトが停止したまま休日を迎える可能性があるため、週末以外になるように設定する（メンテナンスウィンドウがUTCであることに注意）。



#### ▼ 『保留中の変更』『保留中のメンテナンス』

![rds_pending-maintenance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rds_pending-maintenance.png)

ユーザーが予定した設定変更は『保留中の変更』として表示される一方で、AWSによって定期的に行われるハードウェア/OS/DBエンジンのバージョンを強制アップグレードは『保留中のメンテナンス』として表示される。

『次のメンテナンスウィンドウ』を選択すれば実行タイミングをメンテナンスウィンドウの間設定できるが、これを行わない場合は『日付の適用』に表示された時間帯に強制実行される。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.Maintenance.html

補足として保留中のメンテナンスは、アクションの『今すぐアップグレード』と『次のウィンドウでアップグレード』からも操作できる。

![rds_pending-maintenance_action](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rds_pending-maintenance_action.png)


> ℹ️ 参考：https://dev.classmethod.jp/articles/rds-pending-maintenance-actions/


#### ▼ 保留中のメンテナンスの状態

| 状態     | 説明                                                                                    |
|---------|---------------------------------------------------------------------------------------|
| 必須     | アクションは実行可能かつ必須である。実行タイミングは未定であるが、適用期限日には必ず実行され、これは延期できない。           |
| 利用可能 | アクションは実行できるが、推奨である。実行タイミングは未定である。                                               |
| 次のウィンドウ | アクションの実行タイミングは、次回のメンテナンスウィンドウである。後でアップグレードを選択することにより、『利用可能』の状態に戻すことも可能。 |
| 進行中   | 現在時刻がメンテナンスウィンドウに含まれており、アクションを実行中である。                                           |

#### ▼ 『次のウィンドウ』状態の取り消し

設定の変更が『次のウィンドウ』状態にある場合、画面上からは『必須』や『利用可能』といった実行タイミングが未定の状態に戻せない。

しかし、CLIを使用すると戻せる。



> ℹ️ 参考：https://dev.classmethod.jp/articles/mean-of-next-window-in-pending-maintenance-and-set-maintenance-schedule/

```bash
$ aws rds describe-pending-maintenance-actions --output=table

-----------------------------------------------------------------------------------
|                        DescribePendingMaintenanceActions                        |
+---------------------------------------------------------------------------------+
||                           PendingMaintenanceActions                           ||
|+---------------------+---------------------------------------------------------+|
||  ResourceIdentifier |  arn:aws:rds:ap-northeast-1:<アカウントID>:db:prd-foo-instance   ||
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
||  ResourceIdentifier |  arn:aws:rds:ap-northeast-1:<アカウントID>:db:prd-bar-instance   ||
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
  --resource-identifier arn:aws:rds:ap-northeast-1:<アカウントID>:db:prd-foo-instance \
  --opt-in-type undo-opt-in \
  --apply-action <取り消したいアクション名>
```

#### ▼ 『保留中の変更』の取り消し

保留中の変更を画面上からは取り消せない。

しかし、CLIを使用すると戻せる。



> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.DBInstance.Modifying.html#USER_ModifyInstance.ApplyImmediately
> - https://qiita.com/tinoji/items/e150ffdc2045e8b85a56

```bash
$ aws rds modify-db-instance \
    --db-instance-identifier prd-foo-instance \
    <変更前の設定項目> <変更前の設定値> \
    --apply-immediately
```

<br>

## 02. RDS（Aurora）

### セットアップ

#### ▼ DBクラスター

ベストプラクティスについては、以下のリンクを参考にせよ。




| 設定項目       | 説明                                                                 | 補足                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|----------------|--------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| レプリケーション       | 単一のプライマリーインスタンス（シングルマスター）または複数のプライマリーインスタンス（マルチマスター）とするかを設定する。 | フェイルオーバーを利用したダウンタイムの最小化時に、マルチマスターであれば変更の順番を気にしなくてよくなる。ただし、DBクラスターをクローンできないなどのデメリットもある。<br>ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-multi-master.html#aurora-multi-master-terms                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| DBクラスター識別子  | DBクラスター名を設定する。                                                    | インスタンス名は、最初に設定できず、RDSの作成後に設定できる。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| VPCとサブネットグループ  | DBクラスターを配置するVPCとサブネットを設定する。                                      | DBが配置されるサブネットはプライベートサブネットにする、これには、data storeサブネットと名付ける。アプリケーション以外は、踏み台サーバー経由でしかDBにアクセスできないようにする。<br>![subnet_component-type](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/subnet_component-type.png)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| パラメーターグループ     | グローバルパラメーターを設定する。                                                  | デフォルトを使用せずに独自定義する場合、事前に作成しておく必要がある。クラスターパラメーターグループとインスタンスパラメーターグループがあるが、全てのインスタンスに同じパラメーターループを設定するべきなため、クラスターパラメーターを使用すれば良い。各パラメーターに適用タイプ（dynamic/static）があり、dynamicタイプは設定の適用に再起動が必要である。新しく作成したクラスタパラメーターグループにて以下の値を設定すると良い。<br>・```time_zone=Asia/Tokyo```<br>・```character_set_client=utf8mb4```<br>・```character_set_connection=utf8mb4```<br>・```character_set_database=utf8mb4```<br>・```character_set_results=utf8mb4```<br>・```character_set_server=utf8mb4```<br>・```server_audit_logging=1```（監査ログをCloudWatchに送信するか否か）<br>・```server_audit_logs_upload=1```<br>・```general_log=1```（通常クエリログをCloudWatchに送信するか否か）<br>・```slow_query_log=1```（スロークエリログをCloudWatchに送信するか否か）<br>・```long_query_time=3```（スロークエリと見なす最短秒数） |
| DB認証         | DBに接続するための認証方法を設定する。                                         | 各DBインスタンスに異なるDB認証を設定できるが、全てのDBインスタンスに同じ認証方法を設定すべきなため、DBクラスターでこれを設定すれば良い。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| マスタユーザー名      | DBのrootユーザーを設定                                                     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| マスターパスワード      | DBのrootユーザーのパスワードを設定                                               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| バックアップ保持期間 | DBクラスター がバックアップを保持する期間を設定する。                                   | ```7```日間にしておく。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ログのエクスポート      | CloudWatchログに送信するログを設定する。                                        | 必ず、全てのログを選択すること。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| セキュリティグループ     | DBクラスターのセキュリティグループを設定する。                                           | コンピューティングからのインバウンド通信のみを許可するように、これらのプライベートIPアドレス（```*.*.*.*/32```）を設定する。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 削除保護       | DBクラスターの削除を防ぐ。                                                    | DBクラスターを削除するとクラスターボリュームも削除されるため、これを防ぐ。補足として、DBクラスターの削除保護になっていてもDBインスタンスは削除できる。DBインスタンスを削除しても、再作成すればクラスターボリュームに接続されて元のデータにアクセスできる。<br>ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_DeleteCluster.html#USER_DeletionProtection                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

> ℹ️ 参考：https://www.trendmicro.com/cloudoneconformity/knowledge-base/aws/RDS/


#### ▼ DBインスタンス

ベストプラクティスについては、以下のリンクを参考にせよ。




| 設定項目              | 説明                                                   | 補足                                                                                                     |
|-----------------------|--------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| インスタンスクラス             | DBインスタンスのスペックを設定する。                                  | バースト可能クラスを選択すること。補足として、AuroraのDBサイズは自動的にスケーリングするため、設定する必要がない。                                  |
| パブリックアクセス             | DBインスタンスにIPアドレスを割り当てるか否かを設定する。                    |                                                                                                          |
| キャパシティタイプ             |                                                        |                                                                                                          |
| マルチAZ配置             | プライマリーインスタンスとは別に、リードレプリカをマルチAZ配置で追加するか否かを設定する。 | 後からでもリードレプリカを追加できる。また、フェイルオーバー時にリードレプリカが存在していなければ、昇格後のプライマリーインスタンスが自動的に作成される。              |
| 最初のDB名             | DBインスタンスに自動的に作成されるDB名を設定                       |                                                                                                          |
| マイナーバージョンの自動アップグレード | DBインスタンスのDBエンジンのバージョンを自動的に更新するかを設定する。           | 開発環境では有効化、本番環境とステージング環境では無効化しておく。開発環境で新バージョンに問題がなければ、ステージング環境と本番環境にも適用する。 |

> ℹ️ 参考：https://www.trendmicro.com/cloudoneconformity/knowledge-base/aws/RDS/


<br>

### DBクラスター

#### ▼ DBクラスターとは

DBエンジンにAuroraを選択した場合にのみ使用できる。

DBインスタンスとクラスターボリュームから構成されている。

コンピューティングとして動作するDBインスタンスと、ストレージとして動作するクラスターボリュームが分離されているため、DBインスタンスが誤って全て削除されてしまったとしても、データを守れる。

また、両者が分離されていないエンジンタイプと比較して、再起動が早いため、再起動に伴うダウンタイムが短い。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Concepts.AuroraHighAvailability.html

![aurora-db-cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/aurora-db-cluster.png)

#### ▼ 空のDBクラスター

コンソール画面にて、DBクラスター内の全てのDBインスタンスを削除すると、DBクラスターも自動的に削除される。一方で、AWS-APIをコールして全てのDBインスタンスを削除する場合、DBクラスターは自動的に削除されずに、空の状態になる。例えば、Terraformを使用してDBクラスターを作成する時に、インスタンスの作成に失敗するとDBクラスターが空になる、これは、TerraformがAWS-APIをコールした作成を行っているためである。

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_DeleteCluster.html#USER_DeleteCluster.DeleteCluster

#### ▼ グローバルクラスター

![aurora-db-cluster_global](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/aurora-db-cluster_global.png)

リージョン間に跨いだDBクラスターから構成されている。

メインリージョンにあるプライマリークラスターのクラスターボリュームと、DRリージョンのセカンダリークラスターのクラスターボリュームのデータは、定期的に同期される。

プライマリインスタンスは、プライマリークラスターのみに存在している。

メインリージョンで障害が起こった場合は、以下が起こる。



（１）メインリージョンで障害が発生する。

（２）DRリージョンのセカンダリークラスターがプライマリークラスターに昇格し、クラスター内のリードレプリカインスタンスがプライマリインスタンスになる。

（３）メインリージョンのプライマリーインスタンスをフェイルオーバーさせる。各種エンドポイントが無効化され、アクセスできなくなる（```NXDOMAIN```になる）。

（４）メインリージョンの障害が回復する。

（５）DRリージョンをフェイルオーバーさせる。メインリージョンのクラスターがプライマリークラスター、DRリージョンのクラスターがセカンダリークラスターになる。

> ℹ️ 参考：
>
> - https://dev.classmethod.jp/articles/amazon-aurora-global-database-failover-between-region/
> - https://qiita.com/minorun365/items/2530cf1d1f5793c15c79

注意点として、通常のAurora DBクラスターと比較して、機能が制限される。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html#aurora-global-database.limitations

<br>

### DBインスタンス

#### ▼ DBインスタンスとは

コンピューティング機能を持ち、クラスターボリュームを操作できる。



#### ▼ DBインスタンスの種類

|          | プライマリーインスタンス                                   | リードレプリカ                                        |
|----------|------------------------------------------------|------------------------------------------------|
| ロール      | 読み出し/書き込みインスタンス                            | 読み出しオンリーインスタンス                               |
| CRUD制限 | 制限なし。ユーザーの認可スコープに依存する。                   | ユーザーの認可スコープに関係なく、READしか実行できない。           |
| エンドポイント  | 各DBインスタンスに、リージョンのイニシャルに合わせたエンドポイントが割り振られる。 | 各DBインスタンスに、リージョンのイニシャルに合わせたエンドポイントが割り振られる。 |
| データ同期  | DBクラスターに対するデータ変更を受けつける。                    | 読み出し/書き込みインスタンスのデータの変更が同期される。          |

#### ▼ ZDP（ゼロダウンタイムパッチ適用）

![zero-downtime-patching](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/zero-downtime-patching.png)

Auroraをエンジンバージョンに選択した場合に使用できる。

特定の条件下でのみ、アプリケーションとプライマリーインスタンスの接続を維持したまま、プライマリーインスタンスのパッチバージョンをアップグレードできる。

ゼロダウンタイムパッチ適用が発動した場合、RDSのイベントが記録される。

ただし、この機能に頼り切らない方が良い。

ゼロダウンタイムパッチ適用の発動はAWSから事前にお知らせされるわけでもなく、ユーザーが条件を見て発動の有無を判断しなければならない。

また、実際に発動していても、ダウンタイムが発生した事例が報告されている。

ゼロダウンタイムパッチ適用時、以下の手順でエンジンバージョンがアップグレードされる。



（１）プライマリーインスタンスのエンジンがアップグレードされ、この時にダウンタイムが発生しない代わりに、```5```秒ほどプライマリーインスタンスのパフォーマンスが低下する。

（２）リードレプリカが再起動され、この時に```20```～```30```秒ほどダウンタイムが発生する。これらの仕組みのため、アプリケーションでは読み出しエンドポイントを接続先として使用しないようにする必要がある。

> ℹ️ 参考：
>
> - https://qiita.com/tonishy/items/542f7dd10cc43fd299ab
> - https://qiita.com/tmiki/items/7ade95c33b8e43c7cb5f
> - https://noname.work/2407.html
> - https://www.yuulinux.tokyo/8070/

<br>

### エンドポイント

![rds_endpoint](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rds_endpoint.png)

| エンドポイント名     | 役割          | エンドポイント：ポート番号                                                              | 説明                                                                                                                                                                                                                                                                                                                                                      |
|---------------|---------------|----------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| クラスターエンドポイント  | 書き込み/読み出し | ```<DBクラスター名>.cluster-<id>.ap-northeast-1.rds.amazonaws.com:<ポート番号>```    | プライマリーインスタンスに通信できる。プライマリーインスタンスがダウンし、フェイルオーバーによってプライマリーインスタンスとリードレプリカが入れ替わった場合、エンドポイントの転送先は新しいプライマリーインスタンスに変更される。<br>ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.Endpoints.html#Aurora.Endpoints.Cluster                                                                                             |
| リーダーエンドポイント   | 読み出し        | ```<DBクラスター名>.cluster-ro-<id>.ap-northeast-1.rds.amazonaws.com:<ポート番号>``` | リードレプリカに通信できる。DBインスタンスが複数ある場合、クエリが自動的に割り振られる。フェイルオーバーによってプライマリーインスタンスとリードレプリカが入れ替わった場合、エンドポイントの転送先は新しいプライマリーインスタンスに変更される。もしリードレプリカが全てダウンし、プライマリーインスタンスしか稼働していない状況の場合、プライマリーインスタンスに転送するようになる。<br>ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.Endpoints.html#Aurora.Endpoints.Reader |
| インスタンスエンドポイント |               | ```<DBインスタンス名>.cwgrq25vlygf.ap-northeast-1.rds.amazonaws.com:<ポート番号>```   | 選択したDBインスタンスに通信できる。フェイルオーバーによってプライマリーインスタンスとリードレプリカが入れ替わっても、エンドポイントそのままなため、アプリケーションが影響を付ける。非推奨である。                                                                                                                                                                                                                                            |

<br>

### ダウンタイム

#### ▼ ダウンタイムとは

Auroraでは、設定値（例：OS、エンジンバージョン、MySQL）のアップグレード時に、DBインスタンスの再起動が必要である。

再起動に伴ってダウンタイムが発生し、アプリケーションからDBに接続できなくなる。

この間、アプリケーションの利用者に与える影響を小さくできるように、計画的にダウンタイムを発生させる必要がある。



#### ▼ ダウンタイムの発生条件

非Auroraに記載された情報のため、厳密にはAuroraのダウンタイムではない。

ただし、経験上同じ項目でダウンタイムが発生しているため、参考にする。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.DBInstance.Modifying.html#USER_ModifyInstance.Settings

#### ▼ エンジンタイプによるダウンタイムの最小化

コンピューティングとストレージが分離しているAuroraはエンジンタイプの中でもダウンタイムが短い。



#### ▼ ダウンタイムの計測例

アプリケーションにリクエストを送信する方法と、RDSにクエリを直接的に送信する方法がある。

レスポンスとRDSイベントログから、ダウンタイムを計測する。



**＊実装例＊**

Aurora MySQLのアップグレードに伴うダウンタイムを計測する。

踏み台サーバーを経由してRDSに接続し、現在時刻を取得するSQLを送信する。

この時、```for```文や```watch```コマンドを使用する。

ただし、```watch```コマンドはプリインストールされていない可能性がある。

平常アクセス時のも同時に実行することにより、より正確なダウンタイムを取得する。

また、ヘルスチェックの時刻を正しくロギングできるように、ローカルマシンから時刻を取得する。



```bash
#!/bin/bash

set -x

BASTION_HOST=""
BASTION_USER=""
DB_HOST=""
DB_PASSWORD=""
DB_USER=""
SECRET_KEY="~/.ssh/foo.pem"
SQL="SELECT NOW();"

ssh -o serveraliveinterval=60 -f -N -L 3306:${DB_HOST}:3306 -i ${SECRET_KEY} ${BASTION_USER}@${BASTION_HOST} -p 22

# 約15分間コマンドを繰り返す。
for i in {1..900}; do
  echo "---------- No. ${i} Local PC: $(date +"%Y-%m-%d %H:%M:%S") ------------" >> health_check.txt
  echo "$SQL" | mysql -u "$DB_USER" -P 3306 -p"$DB_PASSWORD" >> health_check.txt 2>&1
  # 1秒待機する。
  sleep 1
done
```

```bash
#!/bin/bash

set -x

BASTION_HOST=""
BASTION_USER=""
DB_HOST=""
DB_PASSWORD=""
DB_USER=""
SECRET_KEY="~/.ssh/foo.pem"
SQL="SELECT NOW();"

ssh -o serveraliveinterval=60 -f -N -L 3306:${DB_HOST}:3306 -i ${SECRET_KEY} ${BASTION_USER}@${BASTION_HOST} -p 22

# 1秒ごとにコマンドを繰り返す。
watch -n 1 'echo "---------- No. ${i} Local PC: $(date +"%Y-%m-%d %H:%M:%S") ------------" >> health_check.txt && \
  echo ${SQL} | mysql -u ${DB_USER} -P 3306 -p${DB_PASSWORD} >> health_check.txt 2>&1'
```

上記のシェルスクリプトにより、例えば次のようなログを取得できる。

このログからは、```15:23:09``` 〜 ```15:23:14```の間で、接続に失敗していることを確認できる。



```log
---------- No. 242 Local PC: 2021-04-21 15:23:06 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
NOW()
2021-04-21 06:23:06
---------- No. 243 Local PC: 2021-04-21 15:23:07 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
NOW()
2021-04-21 06:23:08
---------- No. 244 Local PC: 2021-04-21 15:23:08 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 2026 (HY000): SSL connection error: error:00000000:lib(0):func(0):reason(0)
---------- No. 245 Local PC: 2021-04-21 15:23:09 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading initial communication packet', system error: 0
---------- No. 246 Local PC: 2021-04-21 15:23:10 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading initial communication packet', system error: 0
---------- No. 247 Local PC: 2021-04-21 15:23:11 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading initial communication packet', system error: 0
---------- No. 248 Local PC: 2021-04-21 15:23:13 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading initial communication packet', system error: 0
---------- No. 249 Local PC: 2021-04-21 15:23:14 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading initial communication packet', system error: 0
---------- No. 250 Local PC: 2021-04-21 15:23:15 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
NOW()
2021-04-21 06:23:16
---------- No. 251 Local PC: 2021-04-21 15:23:16 ------------
mysql: [Warning] Using a password on the command line interface can be insecure.
NOW()
2021-04-21 06:23:17
```

アップグレード時のプライマリーインスタンスのRDSイベントログは以下の通りで、ログによるダウンタイムは、再起動からシャットダウンまでの期間と一致することを確認する。



![rds-event-log_primary-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rds-event-log_primary-instance.png)

補足として、リードレプリカは再起動のみを実行していることがわかる。



![rds-event-log_read-replica](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rds-event-log_read-replica.png)

<br>

### フェイルオーバー

#### ▼ Auroraのフェイルオーバーとは

プライマリーインスタンスで障害が起こった場合に、リードレプリカをプライマリーインスタンスに自動的に昇格する。

DBクラスター内の全てのDBインスタンスが同じAZに配置されている場合、あらかじめ異なるAZにリードレプリカを新しく作成する必要がある。

また、フェイルオーバー時に、もしDBクラスター内にリードレプリカが存在していない場合、異なるAZに昇格後のプライマリーインスタンスが自動的に作成される。

リードレプリカが存在している場合、これがプライマリーインスタンスに昇格する。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Concepts.AuroraHighAvailability.html#Aurora.Managing.FaultTolerance

#### ▼ フェイルオーバーによるダウンタイムの最小化

DBインスタンスがマルチAZ構成の場合、以下の手順を使用してダウンタイムを最小化できる。



> ℹ️ 参考：https://lab.taf-jp.com/rds%E3%81%AE%E3%83%95%E3%82%A7%E3%82%A4%E3%83%AB%E3%82%AA%E3%83%BC%E3%83%90%E3%83%BC%E6%99%82%E3%81%AE%E6%8C%99%E5%8B%95%E3%82%92%E7%90%86%E8%A7%A3%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B/

（１）アプリケーションの接続先をプライマリーインスタンスにする。

（２）リードレプリカにダウンタイムの発生する変更を適用する。Auroraではフェールオーバーが自動的に実行される。

（３）フェイルオーバー時に約```1```～```2```分のダウンタイムが発生する。フェイルオーバーを使用しない場合、DBインスタンスの再起動でダウンタイムが発生するが、これよりは時間が短いため、相対的にダウンタイムを短縮できる。

#### ▼ DBインスタンスの昇格優先順位

Auroraの場合、フェイルオーバーによって昇格するDBインスタンスは次の順番で決定される。

DBインスタンスごとにフェイルオーバーの優先度（```0```～```15```）を設定でき、優先度の数値の小さいDBインスタンスほど優先され、昇格対象になる。

優先度が同じだと、インスタンスクラスが大きいDBインスタンスが昇格対象になる。

インスタンスクラスが同じだと、同じサブネットにあるDBインスタンスが昇格対象になる。



（１）優先度の順番

（２）インスタンスクラスの大きさ

（３）同じサブネット

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Concepts.AuroraHighAvailability.html

#### ▼ ダウンタイムを最小化できない場合

エンジンバージョンのアップグレードは両方のDBインスタンスで同時に実行する必要があるため、フェイルオーバーを使用できず、ダウンタイムを最小化できない。



<br>

### 負荷対策

#### ▼ エンドポイントの使い分け

DBインスタンスに応じたエンドポイントが用意されている。

アプリケーションからのCRUDの種類に応じて、アクセス先を振り分けることにより、負荷を分散させられる。

読み出しオンリーエンドポイントに対して、READ以外の処理を行うと、以下の通り、エラーとなる。




```bash
/* SQL Error (1290): The MySQL server is running with the --read-only option so it cannot execute this statement */
```

#### ▼ リードレプリカの手動追加、オートスケーリング

リードレプリカの手動追加もしくはオートスケーリングによって、Auroraに関するメトリクス（例：平均CPU使用率、平均DB接続数、など）がターゲット値を維持できるように、リードレプリカの自動水平スケーリング（リードレプリカ数の増減）を実行する。

注意点として、RDS（非Aurora）スケーリングは、ストレージサイズを増加させる垂直スケーリングであり、Auroraのスケーリングとは仕様が異なっている。



> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Integrating.AutoScaling.html
> - https://engineers.weddingpark.co.jp/aws-aurora-autoscaling/
> - https://qiita.com/1_ta/items/3880a8da8a29e4c8d8f0

#### ▼ クエリキャッシュの利用

MySQLやRedisのクエリキャッシュ機能を利用する。

ただし、MySQLのクエリキャッシュ機能は、バージョン```8```で廃止されることになっている。



#### ▼ ユニークキーまたはインデックスの利用

スロークエリを検出し、そのSQLで対象としているカラムにユニークキーやインデックスを設定する。

スロークエリを検出する方法として、RDSの```long_query_time```パラメーターに基づいた検出や、```EXPLAIN```句による予想実行時間の比較などがある。



#### ▼ テーブルを正規化し過ぎない

テーブルを正規化すると保守性が高まるが、アプリケーションのSQLで```JOIN```句が必要になる。

しかし、```JOIN```句を含むSQLは、含まないSQLと比較して、実行速度が遅くなる。

そこで、戦略的に正規化し過ぎないようにする。



#### ▼ インスタンスタイプのスケールアップ

インスタンスタイプをスケールアップさせることにより、接続過多のエラー（```ERROR 1040 (HY000): Too many connections```）に対処する。

補足として現在の最大接続数はパラメーターグループの値から確認できる。

コンソール画面からはおおよその値しかわからないため、SQLで確認した方が良い。



```sql
SHOW GLOBAL VARIABLES LIKE 'max_connections';

+-----------------+-------+
| Variable_name  | Value |
+-----------------+-------+
| max_connections | 640  |
+-----------------+-------+
1 row in set (0.00 sec)
```

<br>

### イベント

コンソール画面ではイベントが英語で表示されているため、リファレンスも英語でイベントを探した方が良い。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_Events.Messages.html

<br>

## 03. RDS（非Aurora）

### ダウンタイム

#### ▼ ダウンタイムの発生条件

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.DBInstance.Modifying.html#USER_ModifyInstance.Settings

| 変更する項目           | ダウンタイムの有無 | 補足                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|----------------------|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| インスタンスクラス            | あり          | ・```2```個のインスタンスで同時にインスタンスクラスを変更すると、次のようなイベントを確認できる。インスタンスが複数回再起動することからわかる通り、長いダウンタイム（約```6```～```8```分）が発生する。そのため、フェイルオーバーを利用したダウンタイムの最小化を行う。<br>ℹ️ 参考https://dev.classmethod.jp/articles/rds-scaleup-instancetype/ <br>・プライマリーインスタンスのイベント<br>![rds_change-instance-class_primary-instance](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rds_change-instance-class_primary-instance.png)<br>・リードレプリカのイベント<br>![rds_change-instance-class_read-replica](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/rds_change-instance-class_read-replica.png) |
| サブネットグループ            | あり          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| エンジンバージョン            | あり          | ```20```～```30```秒のダウンタイムが発生する。この時間は、ワークロード、クラスターサイズ、バイナリログデータのサイズ、ゼロダウンタイムパッチ適用の発動可否、によって変動する。<br>ℹ️ 参考：<br>・https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Updates.html <br>・https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/AuroraMySQL.Updates.Patching.html#AuroraMySQL.Updates.AMVU <br>また、メジャーバージョンのアップグレードには```10```分のダウンタイムが発生する。<br>ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.MySQL.html#USER_UpgradeDBInstance.MySQL.Major.Overview                                                                                |
| メンテナンスウィンドウ          | 条件付きでなし  | ダウンタイムが発生する操作が保留中になっている状態で、メンテナンス時間を現在が含まれるように変更すると、保留中の操作がすぐに適用される。そのため、ダウンタイムが発生する。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| パフォーマンスインサイト         | 条件付きでなし  | パフォーマンスインサイトの有効化ではダウンタイムが発生しない。ただし、有効化のためにパラメーターグループの```performance_schema```を有効化する必要がある。パラメーターグループの変更をDBインスタンスに反映させる上で再起動が必要なため、ここでダウンタイムが発生する。                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| バックアップウインドウ          | 条件付きでなし  | ```0```から```0```以外の値、```0```以外の値から```0```に変更した場合、ダウンタイムが発生する。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| パラメーターグループ           | なし          | パラメーターグループ自体の変更ではダウンタイムは発生しない。また、静的パラメーターはパラメーターグループの変更に合わせて適用される。ただし、動的パラメーターを変更した場合は、これをDBインスタンスに反映させるために再起動が必要であり、ここでダウンタイムが発生する。<br>ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithParamGroups.html                                                                                                                                                                                                                                                                                                                                                                |
| セキュリティグループ           | なし          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| マイナーバージョン自動アップグレード | なし          | エンジンバージョンの変更にはダウンタイムが発生するが、自動アップグレードの設定にはダウンタイムが発生しない。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ストレージのオートスケーリング      | なし          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

<br>

### フェイルオーバー

#### ▼ RDSのフェイルオーバーとは

スタンバイレプリカがプライマリーインスタンスに昇格する。



ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html

#### ▼ フェイルオーバーによるダウンタイムの最小化

DBインスタンスがマルチAZ構成の場合、以下の手順を使用してダウンタイムを最小化できる。



> ℹ️ 参考：https://lab.taf-jp.com/rds%E3%81%AE%E3%83%95%E3%82%A7%E3%82%A4%E3%83%AB%E3%82%AA%E3%83%BC%E3%83%90%E3%83%BC%E6%99%82%E3%81%AE%E6%8C%99%E5%8B%95%E3%82%92%E7%90%86%E8%A7%A3%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B/

（１）アプリケーションの接続先をプライマリーインスタンスにする。

（２）特定の条件下でのみ、フェイルオーバーが自動的に実行される。

> ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html#Concepts.MultiAZ.Failover

（3）非AuroraのRDSでは条件に当てはまらない場合、リードレプリカを手動でフェイルオーバーさせる。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.MySQL.html#USER_UpgradeDBInstance.MySQL.ReducedDowntime

（4）フェイルオーバー時に約```1```～```2```分のダウンタイムが発生する。

フェイルオーバーを使用しない場合、DBインスタンスの再起動でダウンタイムが発生するが、これよりは時間が短いため、相対的にダウンタイムを短縮できる。



<br>

### イベント

コンソール画面ではイベントが英語で表示されているため、リファレンスも英語でイベントを探した方が良い。



> ℹ️ 参考：https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Events.Messages.html

<br>

## 04. RDSプロキシ

### RDSプロキシとは

クラウドDBプロキシとして働く。



<br>

### コネクションプールの管理

![aws_rds-proxy](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/aws_rds-proxy.png)

アプリからRDSにクエリが送信された時、コネクションを新しく作成せずに、コネクションプール内の非アクティブなコネクションを再利用し、RDSに転送する。

アプリからDBのインスタンスに直接的にクエリを送信する場合、アプリはRDSの同時接続の上限数（インスタンスタイプで決まる）を考慮しない。

そのため、接続数が多くなりやすいアプリ（例：Lambda、マルチスレッド）を使用していると、無制限にコネクションを新しく作成し、アプリがRDSの同時接続の上限数を超えて接続してしまい、RDSがエラーを返却してしまう。

RDSプロキシは、RDSの同時接続の上限数を考慮しつつ、コネクションプールから非アクティブなコネクションを再利用するため、アプリがRDSの同時接続の上限数を超えて接続することがない。



> ℹ️ 参考：
>
> https://blog.denet.co.jp/service-relay-2021-0711/
> https://blog.sgnet.co.jp/2020/10/java-db.html

<br>
