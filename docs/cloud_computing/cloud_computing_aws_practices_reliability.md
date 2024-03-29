---
title: 【IT技術の知見】信頼性＠AWS
description: 信頼性＠AWSの知見を記録しています。
---

# 信頼性＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ネットワークポリシー

### 推奨されるCIDRブロック

`1`個のVPC内には複数のサブネットが入る。

そのため、サブネットのCIDRブロックは、サブネットの個数だけ含めなければならない。

また、VPCが持つCIDRブロックから、VPC内の各AWSリソースにIPアドレスを割り当てていかなければならず、VPC内でIPアドレスが枯渇しないようにする。

RFC1918では、以下のCIDRブロックが推奨である。

| RFC1918推奨のCIDRブロック | IPアドレス                       | 個数       |
| ------------------------- | -------------------------------- | ---------- |
| `10.0.0.0/8`              | `10.0.0.0`～`10.255.255.255`     | `16777216` |
| `172.16.0.0/12`           | `172.16.0.0`～`172.31.255.255`   | `1048576`  |
| `192.168.0.0/16`          | `192.168.0.0`～`192.168.255.255` | `65536`    |

> - https://note.com/takashi_sakurada/n/n502fb0299938
> - https://atmarkit.itmedia.co.jp/aig/06network/privateip.html

<br>

### VPCの設計

#### ▼ VPC全体のCIDRブロック

あらかじめ、会社内の全てのアプリケーションのCIDRブロックをスプレッドシートなどで一括で管理しておく。

この時、CIDRブロックと、これの開始IPアドレスと終了IPアドレスをメモしておくと良い。

各アプリケーション間でTransit Gatewayやピアリング接続を実行する可能性がある場合は。

拡張性を考慮して、アプリケーション間のCIDRブロックは重ならないようにしておく必要がある。

例えば、以前に開発したアプリケーションが`10.200.47.0`までを使用していた場合、`10.200.48.0`から使用を始める。

また、VPCで許可されるIPアドレスの個数は最多`65536`個 (`/16`) で最少16個 (`*.*.*.*/28`) であり、実際は`512`個 (`*.*.*.*/23`) ほどあれば問題ないため、`10.200.48.0/23`を設定する。

> - https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Subnets.html#SubnetRouting

<br>

### サブネットの設計

#### ▼ 各サブネットのCIDRブロック

VPCのIPアドレスの最初から、パブリックサブネットとプライベートサブネットを割り当てる。

この時、VPC内の各AWSリソースの特徴に合わせて、CIDRブロックを割り当てる。

例えば、VPCの最初のIPアドレスを`10.0.0.0`とした場合は、1つ目のパブリックサブネットのサブネットマスクは、`10.0.0.0`から始める。

パブリックサブネットとプライベートサブネットを冗長化する場合は、VPCのIPアドレス数をサブネット数で割って各サブネットのIPアドレス数を算出し、CIDRブロックを設定する。

例えば、VPCのサブネットマスクを`/16` としている場合は、各サブネットのサブネットマスクは`/24`とする。

一方で、VPCを`/23`としている場合は、各サブネットは`/27`とする。

また、各サブネットのCIDRブロックを同じにする必要はなく、アプリケーションが稼働するサブネットにIPアドレス数がやや多くなるようにし、代わりとして、DBの稼働するサブネットのIPアドレスを少なくするような設計でも良い。

| AWSリソース       | 最低限のIPアドレス数                        |
| ----------------- | ------------------------------------------- |
| ALB               | ALB当たり`8`個                              |
| AutoScaling       | 自動水平スケーリング時のEC2最大数と同じ個数 |
| VPCエンドポイント | VPCエンドポイント当たり、IPアドレス`1`個    |
| ECS、EKS          | Elastic Network Interface 数と同じ個数      |
| Lambda            | Elastic Network Interface 数と同じ個数      |

> - https://d0.awsstatic.com/events/jp/2017/summit/slide/D2T3-5.pdf
> - https://dev.classmethod.jp/articles/amazon-vpc-5-tips/

#### ▼ アクセスタイプ別の命名

![subnet_accsess-type](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/subnet_accsess-type.png)

パブリックネットワークとの通信の遮断具合から名前をつける。

| 名前                | 種類         | 役割                                                                                                                                                                                   | 配置例           |
| ------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| publicサブネット    | パブリック   | 非武装地帯として動作する。Internet Gatewayを介して、パブリックネットワークからのリクエストを待ち受ける。                                                                               | ALB、NAT Gateway |
| protectedサブネット | プライベート | 内部ネットワークとして動作する。パブリックネットワークからアクセスできず、同じVPC内からのリクエストのみを待ち受ける。また、publicサブネットのNAT Gatewayを介してリクエストを送信する。 | EC2、Fargate     |
| privateサブネット   | プライベート | 内部ネットワークとして動作する。パブリックネットワークからアクセスできず、前述のprotectedサブネット内からのリクエストのみを待ち受ける。また、リクエストを送信しない。                  | RDS、Redis       |

> - https://mihono-bourbon.com/aws-network-1/

#### ▼ コンポーネントタイプ別の命名

![subnet_component-type](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/subnet_component-type.png)

配置するコンポーネントの種類に関する名前をつける。

| 名前                  | 種類         | 役割                                                                                   | 配置例           |
| --------------------- | ------------ | -------------------------------------------------------------------------------------- | ---------------- |
| frontendサブネット    | パブリック   | 非武装地帯として動作する。`L7`ロードバランサー、ルーター、踏み台サーバー、を配置する。 | ALB、NAT Gateway |
| applicationサブネット | プライベート | 内部ネットワークとして動作する。appサーバー、リバースプロキシサーバー、を配置する。    | EC2、Fargate     |
| datastoreサブネット   | プライベート | 内部ネットワークとして動作する。dbサーバーを配置する。                                 | RDS、Redis       |

> - https://dev.classmethod.jp/articles/create_nat_gateway/

<br>

### ルートテーブルの設計

![route-table](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/route-table.png)

#### ▼ プライベートサブネットのリクエストをパブリックネットワークに公開する場合

上の図中で、サブネット`3`にはルートテーブル`2`が紐付けられている。

サブネット3内の宛先のプライベートIPアドレスが、`10.0.0.0/16`の範囲内にあれば、リクエストと見なし、local (VPC内の他サブネット) を宛先に選択する。

一方で、`0.0.0.0/0` (local以外の全IPアドレス) の範囲内にあれば、リクエストと見なし、Internet Gatewayを宛先に選択する。

| Destination (プライベートCIDRブロック) |      Target      |
| :------------------------------------: | :--------------: |
|   `10.0.0.0/16` (VPCのCIDRブロック)    |      local       |
|              `0.0.0.0/0`               | Internet Gateway |

#### ▼ プライベートサブネットのリクエストをVPC内に閉じる場合

上の図中で、サブネット`2`にはルートテーブル1が紐付けられている。

サブネット`2`内の宛先のプライベートIPアドレスが、`10.0.0.0/16`の範囲内にあれば、リクエストと見なし、local (VPC内の他サブネット) を宛先に選択する。

一方で、範囲外にあれば通信を破棄する。

| Destination (プライベートCIDRブロック) | Target |
| :------------------------------------: | :----: |
|   `10.0.0.0/16` (VPCのCIDRブロック)    | local  |

#### ▼ プライベートサブネットのリクエストを同一サブネット内に閉じる場合

プライベートサブネットでネットワークを完全に閉じる場合、ルートテーブルにサブネットのCIDRブロックを設定する。

|   Destination (プライベートCIDRブロック)    | Target |
| :-----------------------------------------: | :----: |
| `10.0.0.0/24` (サブネット`1`のCIDRブロック) | local  |

> - https://koejima.com/archives/1950/

<br>

### OSI層

OSI層とAWSリソースの対応関係を以下に示す。

| OSI層                | OSI層の番号 | 対応するAWSリソース                            |
| -------------------- | ----------- | ---------------------------------------------- |
| アプリケーション層   | `L7`        | ALB、CLB、EC2、RDS、Route53、S3                |
| プレゼンテーション層 | `L6`        | 同上                                           |
| セッション層         | `L5`        | 同上                                           |
| トランスポート層     | `L4`        | セキュリティグループ、ALB、NLB、CLB            |
| ネットワーク層       | `L3`        | Internet Gateway、NAT Gateway、Transit Gateway |
| データリンク層       | `L2`        | VPC                                            |
| 物理層               | `L1`        | 仮想化のため、意識しなくても良い。             |

> - https://www.school.ctc-g.co.jp/columns/tsumura/tsumura02.html
> - https://aws.amazon.com/jp/elasticloadbalancing/features/

<br>

## 02. 監視ポリシー

### 監視すべきメトリクスとアラート条件例

#### ▼ ユーザー定義の名前空間

名前空間ユーザー定義としたメトリクスの監視ポリシーは以下の通りである。

| メトリクス名                     | 単位     | 説明                                                                                                   | アラート条件例 (合致したら発火)                            |
| -------------------------------- | -------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `<任意のプレフィクス>LogMetrics` | カウント | ログステータスの検出数をデータポイントとする。メトリクスと検出ルールはフィルターパターンで作成できる。 | ・統計 : 期間内合計数<br>・期間 : `5`分<br>・閾値 : `>= 1` |

#### ▼ ALB

名前空間をALBとしたメトリクスの監視ポリシーは以下の通りである。

| メトリクス名                     | 単位     | 説明                                                                                            | アラート条件例 (合致したら発火)                               |
| -------------------------------- | -------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `HTTPCode_ELB_4XX_Count`         | カウント | ALBが原因で返信した`400`系ステータスコードをデータポイントとする。                              | ・統計 : 期間内合計数<br>・期間 : `24`時間<br>・閾値 : `>= 1` |
| `HTTPCode_ELB_5XX_Count`         | カウント | ALBが原因で返信した`500`系ステータスコードをデータポイントとする。                              | ・統計 : 期間内合計数<br>・期間 : `5`分<br>・閾値 : `>= 1`    |
| `HealthyHostCount`               | カウント | ターゲットグループ内の正常なターゲットの数をデータポイントとする。                              |                                                               |
| `UnHealthyHostCount`             | カウント | ターゲットグループ内の異常なターゲットの数をデータポイントとする。                              |                                                               |
| `HTTPCode_TARGET_4XX_Count`      | カウント | ターゲットグループ内のターゲットが`400`ステータスコードを返信した数をデータポイントとする。     | ・統計 : 期間内合計数<br>・期間 : `24`時間<br>・閾値 : `>= 1` |
| `HTTPCode_TARGET_5XX_Count`      | カウント | ターゲットグループ内のターゲットが`500`ステータスコードを返信した数をデータポイントとする。     | ・統計 : 期間内合計数<br>・期間 :` 5`分<br>・閾値 : `>= 1`    |
| `RejectedConnectionCount`        | カウント | ターゲットグループ内のターゲットから接続拒否された数をデータポイントとする。                    |                                                               |
| `TargetConnectionErrorCount`     | カウント | ターゲットグループ内のターゲットに対する通信でエラーが発生した数をデータポイントとする。        |                                                               |
| `TargetTLSNegotiationErrorCount` | カウント | ターゲットグループ内のターゲットへのHTTPSプロトコルでエラーが発生した数をデータポイントとする。 |                                                               |

> - https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-cloudwatch-metrics.html

#### ▼ API Gateway

名前空間をAPI Gatewayとしたメトリクスの監視ポリシーは以下の通りである。

| メトリクス名         | 単位       | 説明                                                                                                                                | アラート条件例 (合致したら発火)                               |
| -------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `IntegrationLatency` | マイクロ秒 | API Gatewayがリクエストをバックエンドにルーティングしてから、バックエンドからレスポンスを受信するまでの時間をデータポイントとする。 |                                                               |
| `Latency`            | マイクロ秒 | API Gatewayがクライアントからリクエストを受信してから、クライアントにこれを返信するまでの時間をデータポイントとする。               |                                                               |
| `4XXError`           | カウント   | `400`系ステータスコードの数をデータポイントとする。                                                                                 | ・統計 : 期間内合計数<br>・期間 : `24`時間<br>・閾値 : `>= 1` |
| `5XXError`           | カウント   | `500`系ステータスコードの数をデータポイントとする。アプリケーションが停止してしまうようなインシデントを検出することに適する。       | ・統計 : 期間内合計数<br>・期間 : `5`分<br>・閾値 : `>= 1`    |

> - https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html#api-gateway-metrics

#### ▼ EC2

名前空間をEC2としたメトリクスの監視ポリシーは以下の通りである。

| メトリクス名                 | 単位     | 説明                                                                                                                                                                                                                                                                                                                                                                             | アラート条件例 (合致したら発火)                                 |
| ---------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `CPUUtilization`             | %        | EC2で使用されているCPU使用率をデータポイントとする。                                                                                                                                                                                                                                                                                                                             | ・統計 : 期間内平均使用率<br>・期間 : `5`分<br>・閾値 : `>= 80` |
| `MemoryUtilization`          | %        | EC2で使用されているメモリ使用率をデータポイントとする。                                                                                                                                                                                                                                                                                                                          | ・統計 : 期間内平均使用率<br>・期間 : `5`分<br>・閾値 : `>= 80` |
| `StatusCheckFailed_Instance` | カウント | インスタンスのインスタンスステータスの失敗数をデータポイントとする。インスタンスが停止してしまうようなインシデントに適する。反対に、インスタンスが正常に稼働していて、プロセスが停止しているようなインシデントを検出することには不適である。<br>https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/monitoring-system-instance-status-check.html#types-of-instance-status-checks |                                                                 |
| `StatusCheckFailed_System`   | カウント | インスタンスのシステムステータスの失敗数をデータポイントとする。AWSの障害によるインシデントの検出に適する。<br>https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/monitoring-system-instance-status-check.html#types-of-instance-status-checks                                                                                                                                  |                                                                 |

> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/viewing_metrics_with_cloudwatch.html#ec2-cloudwatch-metrics

似たメトリクスに`StatusCheckFailed_System`や`StatusCheckFailed_Instance`がある。

これらはAWS側が原因のメトリクスであるため、ユーザーが監視する必要はない。

> - https://awsjp.com/AWS/hikaku/StatusCheckFailed_System-StatusCheckFailed_Instance-hikaku.html

#### ▼ ECS

名前空間をECSクラスターまたはECSサービスとしたメトリクスの監視ポリシーは以下の通りである。

ClusterNameディメンションとServiceNameディメンションを使用して、ECSクラスターとECSサービスに関するメトリクスを区別できる。

| メトリクス名        | 単位     | 説明                                                                            | アラート条件例 (合致したら発火)                                 | 補足                                                            |
| ------------------- | -------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- |
| `CPUUtilization`    | %        | ECSクラスターまたはサービスで使用されているCPU使用率をデータポイントとする。    | ・統計 : 期間内平均使用率<br>・期間 : `5`分<br>・閾値 : `>= 80` |                                                                 |
| `MemoryUtilization` | %        | ECSクラスターまたはサービスで使用されているメモリ使用率をデータポイントとする。 | ・統計 : 期間内平均使用率<br>・期間 : `5`分<br>・閾値 : `>= 80` |                                                                 |
| `RunningTaskCount`  | カウント | 稼働中のECSタスク数をデータポイントとする。                                     |                                                                 | ECSタスク数の増減の遷移から、デプロイのおおよその時間がわかる。 |

> - https://docs.aws.amazon.com/AmazonECS/latest/developerguide/cloudwatch-metrics.html#available_cloudwatch_metrics

#### ▼ ElastiCache Redis

名前空間をRedisとしたメトリクスの監視ポリシーは以下の通りである。

| メトリクス名        | 単位     | 説明                                                                      | アラート条件例 (合致したら発火)                                   | 補足                                                                                                                           |
| ------------------- | -------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `BytesUsedForCache` | バイト数 | Redisで使用されているメモリ使用サイズをデータポイントとする。             | ・統計 : 期間内合計サイズ<br>・期間 : `5`分<br>・閾値 : `>= 8`GB  |                                                                                                                                |
| `CPUUtilization`    | %        | ノードのCPU使用率をデータポイントとする。                                 | ・統計 : 期間内平均使用率<br>・期間 : `5`分<br>・閾値 : `>= 80`   |                                                                                                                                |
| `Evictions`         | カウント | 空きサイズを確保するために削除されたRedisのキー数をデータポイントとする。 | ・統計 : 期間内合計数<br>・期間 : `5`分<br>・閾値 : `>= 1`        |                                                                                                                                |
| `SwapUsage`         | バイト数 | ストレージ上のスワップ領域の使用サイズをデータポイントとする。            | ・統計 : 期間内最大サイズ<br>・期間 : `5`分<br>・閾値 : `>= 50`GB | 使用可能な最大メモリを超えると、Redisはストレージ上のスワップ領域を使用する。<br>https://zenn.dev/dehio3/scraps/710a9714ce9496 |

> - https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/CacheMetrics.WhichShouldIMonitor.html

#### ▼ RDS (Aurora)

名前空間をRDS (Aurora) としたメトリクスの監視ポリシーは以下の通りである。

| メトリクス名          | 単位       | 説明                                                                                                                            | アラート条件例 (合致したら発火)                                   | 補足                                                                                                   |
| --------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `BlockedTransactions` | カウント   | 秒あたりトランザクションの拒否の回数をデータポイントとする。                                                                    | ・統計 : 期間内合計数<br>・期間 : `5`分<br>・閾値 : `>= 1`        |                                                                                                        |
| `CPUUtilization`      | %          | Aurora DBインスタンスのCPU使用率をデータポイントとする。                                                                        | ・統計 : 期間内平均使用率<br>・期間 : `5`分<br>・閾値 : `>= 80`   |                                                                                                        |
| `DatabaseConnections` | カウント   | Aurora DBインスタンスへの接続数をデータポイントとする。失敗した接続も含まれている可能性があり、実際よりはやや多めに計測される。 | ・統計 : 期間内合計数<br>・期間 : `5`分<br>・閾値 : `>= 400`      | クライアントがDBにリクエストしている時間帯がわかるため、メンテナンスウィンドウを実施時間の参考になる。 |
| `Deadlocks`           | カウント   | 秒あたりデッドロック平均数をデータポイントとする。                                                                              | ・統計 : 期間内合計数<br>・期間 : `5`分<br>・閾値 : `>= 1`        |                                                                                                        |
| `EngineUptime`        | 秒         | インスタンスの起動時間をデータポイントとする。                                                                                  |                                                                   | ダウンタイムの最低発生時間の参考になる。                                                               |
| `DMLLatency`          | マイクロ秒 | Aurora DBインスタンスに対するDML系クエリの遅延秒数をデータポイントとする。                                                      | ・統計 : 期間内最大サイズ<br>・期間 : `5`分<br>・閾値 : `>= 2`GB  |                                                                                                        |
| `FreeableMemory`      | バイト数   | Aurora DBインスタンスの使用できるメモリの最大空きサイズをデータポイントとする。                                                 | ・統計 : 期間内最大サイズ<br>・期間 : `5`分<br>・閾値 : `>= 2`GB  |                                                                                                        |
| `FreeLocalStorage`    | バイト数   | Aurora DBインスタンスの使用できるローカルストレージの最大空きサイズをデータポイントとする。                                     | ・統計 : 期間内最大サイズ<br>・期間 : `5`分<br>・閾値 : `>= 10`GB | DBインスタンスのローカルストレージは、一時テーブルやログの保管に使用される。                           |
| `LoginFailures`       | カウント   | Aurora DBへのログインの失敗回数をデータポイントとする。                                                                         | ・統計 : 期間内合計数<br>・期間 : `5`分<br>・閾値 : `>= 1`        |                                                                                                        |

> - https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.AuroraMySQL.Monitoring.Metrics.html

#### ▼ RDS (非Aurora)

名前空間をRDS (非Aurora) としたメトリクスの監視ポリシーは以下の通りである。

RDSのコンソール画面にも同じメトリクスが表示されるが、単位がMByteであり、CloudWatchメトリクスと異なることに注意する。

| メトリクス名          | 単位     | 説明                                                                                                                     | アラート条件例 (合致したら発火)                                  | 補足                                                                                                   |
| --------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `CPUUtilization`      | %        | DBインスタンスのCPU使用率をデータポイントとする。                                                                        | ・統計 : 期間内平均使用率<br>・期間 : `5`分<br>・閾値 : `>= 80`  |                                                                                                        |
| `DatabaseConnections` | カウント | DBインスタンスへの接続数をデータポイントとする。失敗した接続も含まれている可能性があり、実際よりはやや多めに計測される。 | ・統計 : 期間内合計数<br>・期間 : `5`分<br>・閾値 : `>= 400`     | クライアントがDBにリクエストしている時間帯がわかるため、メンテナンスウィンドウを実施時間の参考になる。 |
| `FreeableMemory`      | バイト数 | DBインスタンスの使用できるメモリサイズをデータポイントとする。                                                           | ・統計 : 期間内最大サイズ<br>・期間 : `5`分<br>・閾値 : `>= 2`GB |                                                                                                        |

> - https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/monitoring-cloudwatch.html#rds-metrics

#### ▼ S3

名前空間をS3としたメトリクスの監視ポリシーは以下の通りである。

| メトリクス名 | 単位     | 説明                                                                      | アラート条件例 (合致したら発火)                            |
| ------------ | -------- | ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `5xxErrors`  | カウント | S3バケットが原因で返信した`500`系ステータスコードをデータポイントとする。 | ・統計 : 期間内合計数<br>・期間 : `5`分<br>・閾値 : `>= 1` |

<br>
