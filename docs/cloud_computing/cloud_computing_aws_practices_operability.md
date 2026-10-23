---
title: 【IT技術の知見】運用性＠AWS
description: 運用性＠AWSの知見を記録しています。
---

# 運用性＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 02. 監視

### ビジネス成果の監視

#### ▼ ビジネス成果の監視とは

ビジネス成果メトリクスを監視する。

例えば、BI ツール (例：Redash、Metabase、Google Cloud Looker など) を採用し、DB から読み込んだデータ (例：取引履歴) をメトリクスとする。

> - [Operate - AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/oe-operate.html)

#### ▼ DevOps 成果

以下のメトリクスを DevOps 成果の指標として、QuickSight で監視する。

Code 三兄弟のデータポイントを収集し、メトリクスとして分析している。

- リポジトリ別コード変更量 (コミッター、コード変更数)
- アプリケーション別の MTTR
- 変更失敗率 (デプロイの失敗頻度)
- CI の状態 (失敗、成功、実施頻度)
- CD の状態 (失敗、成功、実施頻度)
- CI/CD 全体の状態 (失敗、成功、実施頻度)

> - https://docs.aws.amazon.com/solutions/latest/devops-monitoring-dashboard-on-aws/devops-metrics-list.html
> - https://docs.aws.amazon.com/solutions/latest/devops-monitoring-dashboard-on-aws/amazon-quicksight-dashboards-visuals.html

<br>

### システムの監視

#### ▼ システムの監視とは

システムに関するメトリクスを監視する。

> - [Operate - AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/2023-10-03/framework/oe-operate.html)

#### ▼ ユーザー定義の名前空間

名前空間ユーザー定義としたメトリクスの監視ポリシーは以下の通りである。

<table>
  <thead>
    <tr>
      <th>メトリクス名</th>
      <th>単位</th>
      <th>説明</th>
      <th>アラート条件例 (合致したら発火)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>&lt;任意のプレフィクス&gt;LogMetrics</code></td>
      <td>カウント</td>
      <td>ログステータスの検出数をデータポイントとする。メトリクスと検出ルールはフィルターパターンで作成できる。</td>
      <td>・統計 : 期間内合計数<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 1</code></td>
    </tr>
  </tbody>
</table>

#### ▼ AWS ALB

名前空間を AWS ALB としたメトリクスの監視ポリシーは以下の通りである。

<table>
  <thead>
    <tr>
      <th>メトリクス名</th>
      <th>単位</th>
      <th>説明</th>
      <th>アラート条件例 (合致したら発火)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>HTTPCode_ELB_4XX_Count</code></td>
      <td>カウント</td>
      <td>AWS ALB が原因で返信した <code>400</code> 系ステータスをデータポイントとする。</td>
      <td>・統計 : 期間内合計数<br>・期間 : <code>24</code> 時間<br>・閾値 : <code>&gt;= 1</code></td>
    </tr>
    <tr>
      <td><code>HTTPCode_ELB_5XX_Count</code></td>
      <td>カウント</td>
      <td>AWS ALB が原因で返信した <code>500</code> 系ステータスをデータポイントとする。</td>
      <td>・統計 : 期間内合計数<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 1</code></td>
    </tr>
    <tr>
      <td><code>HealthyHostCount</code></td>
      <td>カウント</td>
      <td>ターゲットグループ内の正常なターゲットの数をデータポイントとする。</td>
      <td></td>
    </tr>
    <tr>
      <td><code>UnHealthyHostCount</code></td>
      <td>カウント</td>
      <td>ターゲットグループ内の異常なターゲットの数をデータポイントとする。</td>
      <td></td>
    </tr>
    <tr>
      <td><code>HTTPCode_TARGET_4XX_Count</code></td>
      <td>カウント</td>
      <td>ターゲットグループ内のターゲットが <code>400</code> レスポンスを返信した数をデータポイントとする。</td>
      <td>・統計 : 期間内合計数<br>・期間 : <code>24</code> 時間<br>・閾値 : <code>&gt;= 1</code></td>
    </tr>
    <tr>
      <td><code>HTTPCode_TARGET_5XX_Count</code></td>
      <td>カウント</td>
      <td>ターゲットグループ内のターゲットが <code>500</code> レスポンスを返信した数をデータポイントとする。</td>
      <td>・統計 : 期間内合計数<br>・期間 :<code> 5</code> 分<br>・閾値 : <code>&gt;= 1</code></td>
    </tr>
    <tr>
      <td><code>RejectedConnectionCount</code></td>
      <td>カウント</td>
      <td>ターゲットグループ内のターゲットから接続拒否された数をデータポイントとする。</td>
      <td></td>
    </tr>
    <tr>
      <td><code>TargetConnectionErrorCount</code></td>
      <td>カウント</td>
      <td>ターゲットグループ内のターゲットに対する通信でエラーが発生した数をデータポイントとする。</td>
      <td></td>
    </tr>
    <tr>
      <td><code>TargetTLSNegotiationErrorCount</code></td>
      <td>カウント</td>
      <td>ターゲットグループ内のターゲットへの HTTPS プロトコルでエラーが発生した数をデータポイントとする。</td>
      <td></td>
    </tr>
  </tbody>
</table>

> - [CloudWatch metrics for your Application Load Balancer - Elastic Load Balancing](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-cloudwatch-metrics.html)

#### ▼ Amazon API Gateway

名前空間を Amazon API Gateway としたメトリクスの監視ポリシーは以下の通りである。

<table>
  <thead>
    <tr>
      <th>メトリクス名</th>
      <th>単位</th>
      <th>説明</th>
      <th>アラート条件例 (合致したら発火)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>IntegrationLatency</code></td>
      <td>マイクロ秒</td>
      <td>Amazon API Gateway がリクエストをバックエンドにルーティングしてから、バックエンドからレスポンスを受信するまでの時間をデータポイントとする。</td>
      <td></td>
    </tr>
    <tr>
      <td><code>Latency</code></td>
      <td>マイクロ秒</td>
      <td>Amazon API Gateway がクライアントからリクエストを受信してから、クライアントにこれを返信するまでの時間をデータポイントとする。</td>
      <td></td>
    </tr>
    <tr>
      <td><code>4XXError</code></td>
      <td>カウント</td>
      <td><code>400</code> 系ステータスの数をデータポイントとする。</td>
      <td>・統計 : 期間内合計数<br>・期間 : <code>24</code> 時間<br>・閾値 : <code>&gt;= 1</code></td>
    </tr>
    <tr>
      <td><code>5XXError</code></td>
      <td>カウント</td>
      <td><code>500</code> 系ステータスの数をデータポイントとする。アプリケーションが停止してしまうようなインシデントを検出することに適する。</td>
      <td>・統計 : 期間内合計数<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 1</code></td>
    </tr>
  </tbody>
</table>

> - [Amazon API Gateway dimensions and metrics - Amazon API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html#api-gateway-metrics)

#### ▼ Amazon EC2

名前空間を EC2 としたメトリクスの監視ポリシーは以下の通りである。

<table>
  <thead>
    <tr>
      <th>メトリクス名</th>
      <th>単位</th>
      <th>説明</th>
      <th>アラート条件例 (合致したら発火)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>CPUUtilization</code></td>
      <td>%</td>
      <td>EC2 で使用されている CPU 使用率をデータポイントとする。</td>
      <td>・統計 : 期間内平均使用率<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 80</code></td>
    </tr>
    <tr>
      <td><code>MemoryUtilization</code></td>
      <td>%</td>
      <td>EC2 で使用されているメモリ使用率をデータポイントとする。</td>
      <td>・統計 : 期間内平均使用率<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 80</code></td>
    </tr>
    <tr>
      <td><code>StatusCheckFailed_Instance</code></td>
      <td>カウント</td>
      <td>インスタンスのインスタンスステータスの失敗数をデータポイントとする。インスタンスが停止してしまうようなインシデントに適する。反対に、インスタンスが正常に稼働していて、プロセスが停止しているようなインシデントを検出することには不適である。<br><a href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/monitoring-system-instance-status-check.html#types-of-instance-status-checks">https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/monitoring-system-instance-status-check.html#types-of-instance-status-checks</a></td>
      <td></td>
    </tr>
    <tr>
      <td><code>StatusCheckFailed_System</code></td>
      <td>カウント</td>
      <td>インスタンスのシステムステータスの失敗数をデータポイントとする。AWS の障害によるインシデントの検出に適する。<br><a href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/monitoring-system-instance-status-check.html#types-of-instance-status-checks">https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/monitoring-system-instance-status-check.html#types-of-instance-status-checks</a></td>
      <td></td>
    </tr>
  </tbody>
</table>

> - [CloudWatch metrics that are available for your instances - Amazon Elastic Compute Cloud](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/viewing_metrics_with_cloudwatch.html#ec2-cloudwatch-metrics)

似たメトリクスに `StatusCheckFailed_System` や `StatusCheckFailed_Instance` がある。

これらは AWS 側が原因のメトリクスであるため、ユーザーが監視する必要はない。

> - [StatusCheckFailed_System, StatusCheckFailed_Instance ,StatusCheckFailedの違い](https://awsjp.com/AWS/hikaku/StatusCheckFailed_System-StatusCheckFailed_Instance-hikaku.html)

#### ▼ Amazon ECS

名前空間を Amazon ECS クラスターまたは Amazon ECS サービスとしたメトリクスの監視ポリシーは以下の通りである。

ClusterName ディメンションと ServiceName ディメンションを使用して、Amazon ECS クラスターと Amazon ECS サービスに関するメトリクスを区別できる。

<table>
  <thead>
    <tr>
      <th>メトリクス名</th>
      <th>単位</th>
      <th>説明</th>
      <th>アラート条件例 (合致したら発火)</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>CPUUtilization</code></td>
      <td>%</td>
      <td>Amazon ECS クラスターまたはサービスで使用されている CPU 使用率をデータポイントとする。</td>
      <td>・統計 : 期間内平均使用率<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 80</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>MemoryUtilization</code></td>
      <td>%</td>
      <td>Amazon ECS クラスターまたはサービスで使用されているメモリ使用率をデータポイントとする。</td>
      <td>・統計 : 期間内平均使用率<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 80</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>RunningTaskCount</code></td>
      <td>カウント</td>
      <td>稼働中の Amazon ECS タスク数をデータポイントとする。</td>
      <td></td>
      <td>Amazon ECS タスク数の増減の遷移から、デプロイのおおよその時間がわかる。</td>
    </tr>
  </tbody>
</table>

> - [Monitor Amazon ECS using CloudWatch - Amazon Elastic Container Service](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/cloudwatch-metrics.html#available_cloudwatch_metrics)

#### ▼ Amazon ElastiCache Redis

名前空間を Amazon ElastiCache Redis としたメトリクスの監視ポリシーは以下の通りである。

<table>
  <thead>
    <tr>
      <th>メトリクス名</th>
      <th>単位</th>
      <th>説明</th>
      <th>アラート条件例 (合致したら発火)</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>BytesUsedForCache</code></td>
      <td>バイト数</td>
      <td>Redis で使用されているメモリ使用サイズをデータポイントとする。</td>
      <td>・統計 : 期間内合計サイズ<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 8</code>GB</td>
      <td></td>
    </tr>
    <tr>
      <td><code>CPUUtilization</code></td>
      <td>%</td>
      <td>ノードの CPU 使用率をデータポイントとする。</td>
      <td>・統計 : 期間内平均使用率<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 80</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>Evictions</code></td>
      <td>カウント</td>
      <td>空きサイズを確保するために削除された Redis のキー数をデータポイントとする。</td>
      <td>・統計 : 期間内合計数<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 1</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>SwapUsage</code></td>
      <td>バイト数</td>
      <td>ストレージ上のスワップ領域の使用サイズをデータポイントとする。</td>
      <td>・統計 : 期間内最大サイズ<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 50</code>GB</td>
      <td>使用可能な最大メモリを超えると、Redis はストレージ上のスワップ領域を使用する。<br><a href="https://zenn.dev/dehio3/scraps/710a9714ce9496">https://zenn.dev/dehio3/scraps/710a9714ce9496</a></td>
    </tr>
  </tbody>
</table>

> - https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/CacheMetrics.WhichShouldIMonitor.html

#### ▼ Amazon Aurora

名前空間を Amazon Aurora としたメトリクスの監視ポリシーは以下の通りである。

<table>
  <thead>
    <tr>
      <th>メトリクス名</th>
      <th>単位</th>
      <th>説明</th>
      <th>アラート条件例 (合致したら発火)</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>BlockedTransactions</code></td>
      <td>カウント</td>
      <td>秒当たりトランザクションの拒否の回数をデータポイントとする。</td>
      <td>・統計 : 期間内合計数<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 1</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>CPUUtilization</code></td>
      <td>%</td>
      <td>Amazon Aurora の DB インスタンスの CPU 使用率をデータポイントとする。</td>
      <td>・統計 : 期間内平均使用率<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 80</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>DatabaseConnections</code></td>
      <td>カウント</td>
      <td>Amazon Aurora の DB インスタンスへの接続数をデータポイントとする。失敗した接続も含まれている可能性があり、実際よりはやや多めに計測される。</td>
      <td>・統計 : 期間内合計数<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 400</code></td>
      <td>クライアントが DB にリクエストしている時間帯がわかるため、メンテナンスウィンドウの実施時間の参考になる。</td>
    </tr>
    <tr>
      <td><code>Deadlocks</code></td>
      <td>カウント</td>
      <td>秒当たりデッドロック平均数をデータポイントとする。</td>
      <td>・統計 : 期間内合計数<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 1</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>EngineUptime</code></td>
      <td>秒</td>
      <td>インスタンスの起動時間をデータポイントとする。</td>
      <td></td>
      <td>ダウンタイムの最低発生時間の参考になる。</td>
    </tr>
    <tr>
      <td><code>DMLLatency</code></td>
      <td>マイクロ秒</td>
      <td>Amazon Aurora の DB インスタンスに対する DML 系クエリの遅延秒数をデータポイントとする。</td>
      <td>・統計 : 期間内最大サイズ<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 2</code>GB</td>
      <td></td>
    </tr>
    <tr>
      <td><code>FreeableMemory</code></td>
      <td>バイト数</td>
      <td>Amazon Aurora の DB インスタンスの使用できるメモリの最大空きサイズをデータポイントとする。</td>
      <td>・統計 : 期間内最大サイズ<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 2</code>GB</td>
      <td></td>
    </tr>
    <tr>
      <td><code>FreeLocalStorage</code></td>
      <td>バイト数</td>
      <td>Amazon Aurora の DB インスタンスの使用できるローカルストレージの最大空きサイズをデータポイントとする。</td>
      <td>・統計 : 期間内最大サイズ<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 10</code>GB</td>
      <td>DB インスタンスのローカルストレージは、一時テーブルやログの保管に使用される。</td>
    </tr>
    <tr>
      <td><code>LoginFailures</code></td>
      <td>カウント</td>
      <td>Amazon Aurora の DB へのログインの失敗回数をデータポイントとする。</td>
      <td>・統計 : 期間内合計数<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 1</code></td>
      <td></td>
    </tr>
  </tbody>
</table>

> - https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.AuroraMySQL.Monitoring.Metrics.html

#### ▼ Amazon RDS

名前空間を Amazon RDS としたメトリクスの監視ポリシーは以下の通りである。

Amazon RDS のコンソール画面にも同じメトリクスが表示されるが、単位が MByte であり、Amazon CloudWatch Metrics と異なることに注意する。

<table>
  <thead>
    <tr>
      <th>メトリクス名</th>
      <th>単位</th>
      <th>説明</th>
      <th>アラート条件例 (合致したら発火)</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>CPUUtilization</code></td>
      <td>%</td>
      <td>DB インスタンスの CPU 使用率をデータポイントとする。</td>
      <td>・統計 : 期間内平均使用率<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 80</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>DatabaseConnections</code></td>
      <td>カウント</td>
      <td>DB インスタンスへの接続数をデータポイントとする。失敗した接続も含まれている可能性があり、実際よりはやや多めに計測される。</td>
      <td>・統計 : 期間内合計数<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 400</code></td>
      <td>クライアントが DB にリクエストしている時間帯がわかるため、メンテナンスウィンドウの実施時間の参考になる。</td>
    </tr>
    <tr>
      <td><code>FreeableMemory</code></td>
      <td>バイト数</td>
      <td>DB インスタンスの使用できるメモリサイズをデータポイントとする。</td>
      <td>・統計 : 期間内最大サイズ<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 2</code>GB</td>
      <td></td>
    </tr>
  </tbody>
</table>

> - [Monitoring Amazon RDS metrics with Amazon CloudWatch - Amazon Relational Database Service](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/monitoring-cloudwatch.html#rds-metrics)

#### ▼ Amazon S3

名前空間を Amazon S3 としたメトリクスの監視ポリシーは以下の通りである。

<table>
  <thead>
    <tr>
      <th>メトリクス名</th>
      <th>単位</th>
      <th>説明</th>
      <th>アラート条件例 (合致したら発火)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>5xxErrors</code></td>
      <td>カウント</td>
      <td>S3 バケットが原因で返信した <code>500</code> 系ステータスをデータポイントとする。</td>
      <td>・統計 : 期間内合計数<br>・期間 : <code>5</code> 分<br>・閾値 : <code>&gt;= 1</code></td>
    </tr>
  </tbody>
</table>

<br>
